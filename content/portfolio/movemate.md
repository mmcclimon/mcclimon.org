---
title: "Portfolio: Movemate"
description: "This post describes `movemate`, which is a piece of software I wrote in mid-2022 at Fastmail to manage moves of user data between machines."
---

# Movemate

This post describes `movemate`, which is a piece of software I wrote in
mid-2022 at Fastmail to manage moves of user data between machines.

## Context

In a previous role, I was a backend software developer at
[Fastmail](//fastmail.com): a paid email service targeted primarily at
individual users and small organizations. Fastmail runs all its own hardware;
when I was there, we had racks at a datacenter in New Jersey and one in
Seattle. All of users' data&nbsp;-- mail, contacts, and calendars&nbsp;-- are stored
in [Cyrus](//www.cyrusimap.org), which is an open-source mail server for which
Fastmail are the primary maintainers.

In Fastmail jargon, a "slot" is a single instance of Cyrus running on one
physical machine. A "store" is a collection of multiple slots running on
different machines for high availability, using Cyrus's built-in replication
mechanism to keep them in sync. A user's mail might be housed on `store42`,
which is made of of three slots: two in New Jersey (one in an odd-numbered
rack, one in an even-numbered rack) plus a copy in Seattle.

Because Fastmail runs its own hardware, and that hardware is limited by
physical reality (in that there are a finite number of machines with a finite
amount of disk storage), one of routine tasks for our operators was to keep
users balanced between stores. If a store was getting too full, then they
would need to move users from one store to another to keep the disks from
filling up.

Before I wrote `movemate`, the process for doing this was entirely manual.
Every morning, one of our sysadmins would start their day by looking at the
Grafana dashboards for disk space on the IMAP servers. If any of them looked
suspicious, they'd run a program to find possible candidates for moving. That
program, as I recall, finished by printing out the invocation for another
program: once they'd decided the list of candidates was acceptable, they'd
copy the invocation from the output of the first and paste it into the
terminal. That program did not actually move users, though: it simply updated
a column in the database for their target store. 

The _actual_ moving was done by a program that ran (I wish this was a joke,
but it is not) in a set of `tmux` invocations on two of the machines, which
needed to be restarted every time those machines were rebooted. The system,
such as it was, had no real observability. We would run into problems because
two people had issued moves that were incompatible or bad in some way (maybe
they'd mis-pasted the program into the terminal), and the only way to tell
something was wrong was when we got an alert page about disk space or some
user wrote in to tell us they couldn't access their mail.

There's one other piece of jargon to explain here, which is that Fastmail has
two different flavors of accounts. The generic term for an account is a
"customer":  "individual" customers have only one user, and "business"
customers have multiple users.  Users in a customer can share some kinds of
data: for example, a family might have four user accounts as part of a single
customer, and they can share a family calendar among them. This is important
for our purposes here because for this sharing to work, all users in a
customer must be on the same store.  (There is one more cursed detail about
the prior system, by the way. There were actually two totally different
programs running under `tmux`: one for individuals, another for businesses,
each with their own idiosyncratic interface.)


## Design and Implementation

This situation was, maybe obviously, untenable. Our platform operators were
spending an unreasonable amount of time observing, planning, scheduling, and
monitoring user moves via a manual process that was very prone to errors. This is
silly, because it's exactly the kind of thing computers are good at! By this
time, I had something of a reputation for taking crufty old systems and making
them much nicer to use, and so I turned my sights on the user mover.

There were a number of different design constraints here:

* the program must be an actual daemon, not three Perl scripts in a
  trenchcoat
* it must handle both individuals and businesses with the same interface
* it must have a sensible CLI
* it must have proper metrics (like all of our other software did)
* it should be smart enough to run unattended, but not make any dangerous
  decisions about who to move

I made one other design decision early on, which wasn't strictly necessary but
did make my life easier: I did not want to rewrite the low-level code that
actually moved the data from one place to another. I _could_ have done so,
because it could definitely have been improved, but that would have
significantly added to the risk of the project. I wanted to replace all of the
orchestration, and leave all of the user locking and low-level replication the
way it was.

(Also, I'll say here that like all of Fastmail's backend software at the time,
movemate is written in Perl.)

The high-level design included several components, the most of important of
which are:

* MoveMate::Manager -- the brains of the operation. It manages all of
  the state and whatnot, and also has an HTTP server that is used
  to query the internal state from afar
* MoveMate::Planner -- this is where all the logic is for deciding who
  to move where
* MoveMate::Worker -- does the actual work of moving a single user
  from one store to another
* MoveMate::App -- the CLI frontend, which mostly talks to the manager's HTTP
  server

The manager is fairly simple, in that all it needs to do is to manage the
internal state of the orchestration: the number of running workers, the HTTP
server, whether or not the server is currently paused, and a few other minor
things. It also has an internal timer, since periodically, it is responsible
for generating a new plan to execute.

I have often found it useful (in software, as in life) to separate the
activities of _deciding_ what you want to do and _executing_ those things. It
is often easier to do something if you know what it is you hope to accomplish
before you start. Movemate shares this design: at any given time, the manager
has a plan that it is executing, and periodically it generates a new plan. (We
need to do this because the state of the world might have changed between
plans: it would often be the case that some user was importing a huge mailbox
from some other provider, and so the system would see "oh this store's disk
use is growing quickly, let's not move anybody else there right now.") Once
the new plan has been created, the manager swaps the old for the new. Any
workers still moving users from the old plan can complete, but the manager
continues by executing items from the new plan.

The planner is the most complicated part of movemate. I could easily write
another 1500 words about it, but in the interest of making this description
reasonable length, I'll describe it a high level.
To create a new plan:

1. Find all currently running plan items. We need to make sure not to touch
   these, because these users are actively being moved.
2. Select all existing planned items from the database. For all of them that
   are still relevant (i.e., the user still needs to be moved), add them to
   the draft plan. For all the items that are no longer relevant, cancel them
   (so that the manager will not pick them up) and do not add them to the
   draft plan.
3. Find any customers who are server-split: as noted above, all users in a
   business account must be on the same store. We must _always_ move these,
   even if there are no overfull stores, because shared data for these users
   is broken.
4. Generate the list of source stores that are running low on disk space. If
   there are no such stores, great! There's nothing to be done now.
5. Generate the list of target stores that have sufficient available space.
6. Generate the list of candidate users to move: we want to pick users that
   are big enough to make an impact on the source, but not so big that they
   cause the target to be too full.
7. Create a sensible number plan items for the candidates, ensuring that we do
   not split any customers across stores when doing so.

The end result of this process is a new set of rows in the database, one per
plan item. The planner returns this set of rows to the manager, where it
replaces its current plan.

When there is an available worker, the manager is responsible for doling out a
plan item to each worker. Each worker runs in its own process (recall, this is
Perl, so fork/exec is the only viable strategy for parallelism). The worker
process is mostly straightforward: it is responsible for the bookkeeping of
the plan row in the database, and for calling the low-level move machinery. If
the move of all the slots on the store succeeded, it marks the plan item as
complete. If the move fails for whatever reason, it marks the item as failed:
there is additional logic in the planner to report on failed moves and to
raise alerts if users fail to move too many times.

The CLI frontend communicates over HTTP with the manager's HTTP service. This
design decision prevented a bunch of weird race conditions that would result
if it talked directly to the database: because the manager has one plan it's
executing while another plan is being drafted, looking at the state of the
database at some arbitrary point can get a weird inconsistent view of the
data. By communicating over HTTP, it simplifies the implementation of the CLI,
which are very thin wrappers over "make an HTTP call, format the resulting
JSON."

Because of that, the CLI implementation isn't super interesting. There's a top
level `movemate` command, with a bunch of subcommands:

* status commands
    * `status`: show moves in progress, plan status, etc.
    * `upcoming`: see what moves we have planned
    * `view`: view one (or more) move rows
    * `recent-failures`: show users we've tried and repeatedly failed to move
* manager control:
    * `pause`: stop new moves from being started
    * `unpause`: get the moves running again
    * `reload-config`: reread the config file to tweak movemate settings
* move control
    * `queue`: move a customer to another place
    * `move-now`: move a customer to another place, soon!
    * `cancel`: cancel an upcoming move
    * `kill`: forcibly kill a currently running move


The whole design also made it very easy to test. (It's not too hard to guess
that the previous random collection of perl scripts had no tests at all.)
Separating the plan from the state of the world meant that we could mock
various states of the world and see if the resulting plan items were sensible.
Implementing the CLI as a thing wrapper over HTTP made it possible to test in
a way that we usually _didn't_ test CLI programs.

Overall, I'm really happy with how `movemate` turned out. I really enjoy this
kind of work: it improves people's lives in a way that they mostly don't even
notice, and makes it significantly easier to change going forward. I find this
kind of developer productivity work very satisfying, because it's easier to
see the impact. When you work on a feature for a product, you can make many
end users happy, but you may not ever hear about it. Working on `movemate`
made way fewer people happy, but I _knew_ those people: it's nice to see some
anonymous user feedback that they like some feature I helped build, but it
means _way_ more to me when my friend Rob on the platform team says "hey, this
thing saves me time and energy; thanks for writing it."


## Impact

After we deployed the first version of movemate, I sent an email about it,
part of which is included here:

> I will note again here that the goal of this project is to get the new
> framework and tools into place. The underlying logic of who to move and where
> to move them hasn't really changed, and I fully anticipate that there will be
> tweaks to make as we go forward and let it burn in a while. It does mean,
> though, that the user mover is a real service and not (for instance) some
> weird thing that runs in nine tmuxes on a machine somewhere you just have to
> know about. This work should provide us a good base moving forward for future
> improvements!

This was very well-received!

One of Fastmail's founders:

> Literally the first interview we did for a new developer after Opera bought
> us in 2010 (when there was still only 3 of us) I remember doing drawings on
> a whiteboard explaining how slots & stores worked and how we wanted to build
> some "slot manager" system that would automate the setup and balancing of
> them. It's great to finally see that happening!

The head of our platform team:

> Every time this project came up, I would always comment that "Platform is
> sooo looking forward to this". Now that it is here, it is everything we
> hoped and dreamed it could be (at least to start). It takes a huge load off
> of Platform members work, freeing up us to do other work. Platform is very
> very happy. 

My friend [Rob](https://robn.au/), who was the person primarily responsible
for doing all of the manual work that was replaced by movemate:

> Hilariously, I just found a lost tmux+MultiMove still quietly running.
> 
> But yes, I am extremely thrilled about all of this (and have said so to
> anyone that will listen, including my non-tech non-work people, like my
> siblings and my mother, who said "well that sounds like a nice thing"). I've
> been keeping an eye on it and mostly it seems to be doing totally fine and
> normal and plausible things, but unlike humans, it doesn't get bored or
> distracted or confused.

Our CTO, quoting the sentence about "nine tmuxes":

> There are several thing to celebrate here, but today I pick ~~verve~~ this one.

## Further reading

I can't share the code, since it's proprietary, but I can share the git logs
and relevant diffstat information: they're [available in this GitHub
Gist](https://gist.github.com/mmcclimon/4bff5b7bfd9e57ff87ddacc52b143a9d).
This is a representative sample of how I like to work: each commit here is
small, self-contained, and has a clear commit message with not only what
changed, but why. Reviewers for this PR noted how easy it was to review,
despite being around 2500 lines of new code.

[Back to Portfolio](../)
