---
title: "Portfolio: mint-tag"
description: "This post describes `mint-tag`, which is a piece of software I wrote at Fastmail to manage our git branches."
---

# mint-tag

This post describes `mint-tag`, which is a piece of software I wrote while I
was at Fastmail to manage git artifacts of various types. This code is
[available on GitHub at fastmail/mint-tag](https://github.com/fastmail/mint-tag);
although a few others have done very light maintenance work since I left the
company, it's still essentially in the same state as when I left in early
2023.

When I worked at [Fastmail](//fastmail.com), I developed something of a
reputation for being a git nerd. This reputation was well deserved, and mint-tag
is a large part of the reason _why_ I became a git nerd.

## Context

The story of mint-tag proceeds in two chapters: Cyrus, then Fastmail.

### Cyrus

Fastmail is the primary maintainer of [Cyrus](//www.cyrusimap.org): an
open-source mail server that holds all of Fastmail's user mail data. Cyrus's
release schedule was (at least at the time) quite slow. We did a lot of
development on Cyrus internally, and we often wanted to ship these features to
Fastmail customers before they made it into a stable Cyrus release.

Before mint-tag, the process of making a Cyrus release was something like:

* Start from the latest dev branch.
* Manually merge some PRs into that branch for in-flight features.
* Cherry pick 6 or so commits from Fastmail's private fork of Cyrus into the
  branch. (The details aren't really important here. I don't remember exactly
  how many commits there were, but I do remember they weren't particularly
  interesting: I think all of them had to do with Fastmail's packaging and
  build infrastructure.)
* Tag the resulting branch with some name, like `fmnext-20180725v3`.
* There were some further steps to actually build and install the version on
  Fastmail's infrastructure, but they aren't relevant here.

This approach had a few problems:

* It required a bunch of manual git operations that everyone could not
  reliably reproduce.
* Sometimes PRs would not be merged correctly into the dev branch, or PRs
  would be included when they should not be, or were not included when they
  should be.
* The tags _mostly_ had the same format, except sometimes if there was more
  than one tag in a day (which happened a lot, because of the previous two
  bullet points), sometimes you'd get `fmstable-20191208`,
  `fmstable-20191208v2`, and `fmstable-20191208v2-bis` or some other nonsense.
* In practice, only two people ever really created Cyrus tags, and the person
  that did it most often was.&nbsp;.&nbsp;. Fastmail's CEO.

This is the world into which mint-tag was born. There will be more details on
that below, but that's chapter one. All of those problems were successfully
automated away by mint-tag, which provided a single command that anyone (not
just the CEO) could run to mint a new Cyrus version.

### Fastmail

Once mint-tag had been happily minting Cyrus tags for a year or so, we decided
to extend it to manage branches for Fastmail itself. Slightly more context
will be useful here. (I will say now that I am describing the system as I knew
it; it's possible things have changed somewhat since I left in early 2023, but
as I understand it, the basics are still the same.)

Fastmail is a web application: the details of how it's put together don't
matter much here, except to say that it can be deployed to several different
environments: www, qa, beta, and staff. (The staff-only environment is not
actually called "staff", but I'll call it that here because I can't find the
internal name online and it's not my place to share it.) Each environment is
associated with a git branch: www tracks the "master" branch, and the other
environments track branches named for the environment (the beta environment
tracks branch "beta", and so on).

To put something into the beta environment, you'd file a pull request and add
the label `include-in-beta`; the corresponding label for the staff branch was
`include-in-staff`. To deploy to an environment, you asked a slack bot to
"deploy fastmail/beta" or "deploy fastmail/staff": it would take the current
state of the relevant branch and deploy it to the correct hosts.

Before mint-tag, the process for managing the beta/staff branches
was.&nbsp;.&nbsp;. let's say less than ideal. It worked like this:

* There was a program running in GitLab CI called `ci-rebuild-branches`. On
  any push to any pull request, that program would rebuild the branches.  It
  worked by getting all the pull requests with the relevant tag,
  octopus-merging them all together, then force-pushing back to the
  appropriate branch. This was slow, and didn't work reliably.
* When `ci-rebuild-branches` failed, its error mode was to vomit an
  incomprehensible error message into #general on Slack, where someone had to
  go dig into the logs to figure out why the merge was failing. These error
  messages had very little relationship with the actual PRs being merged, and
  so it was very easy to introduce a merge conflict in the beta branch and not
  know it.
* When you asked the bot to deploy fastmail/beta, you got whatever was in the
  branch at the moment you asked for the deploy. The CI branch rebuilder took
  a non-zero amount of time, which led to an annoying failure mode where you'd
  push a change to your PR, deploy beta, and then realize the branch hadn't
  been rebuilt in time. This meant your changes hadn't made the deploy, and
  you had to try again. (This happened many times a day.)
* There was a post-deploy step that was sometimes necessary called "rollout",
  which the chatbot also ran. Rollout would refuse to run if the branch had
  changed out from underneath it, so there was a failure mode where you'd
  deploy beta then immediately attempt to rollout beta, and the rollout would
  fail with a message like "fastmail/beta is at 2291eb5a, but last deploy was
  159de375, won't roll out". (This also happened many times a day.)

Mint-tag didn't solve all of these problems, but it did solve all of the
problems with `ci-rebuild-branches`: mint-tag runs just in time, so that when
you asked the bot to deploy fastmail/beta, it ran mint-tag, which assembled
the branch and then deployed that artifact to the relevant hosts. (The other
problems, incidentally, were solved later with a
[new deployment process](../new-deployment/) I _also_ rewrote; that's a story
for another day.)

## Design and Implementation

The design constraints for mint-tag were _mostly_ UI constraints, since the
work it needed to do was straightforward git operations.

* It must be easy to run. For the Cyrus use case, we wanted anybody to be able
  to run it, without needing to know a whole lot of fiddly git knowledge.
* It must always be correct: deploying unknown code to Fastmail's Cyrus
  servers could be dangerous, and we never wanted to lose user data.
* It must be able to deal with both GitHub pull requests and GitLab merge
  requests.
* It should have good error messages. This is especially important for the
  Fastmail use case, where we regularly octopus-merged 20+ branches at the
  same time. When that merge fails, you want to be able to say which two
  branches conflict with one another, so that you notify the authors to
  resolve the conflict.

One of the earliest design decisions I made was that mint-tag would be driven
by a config file. This was a decision partly out of habit (I really like
building Perl objects from static configuration), but also out of
practicality. Because we wanted anybody to be able to run mint-tag, I didn't
want people to have to wrangle a bunch of switches to git everything set up
correctly. The interface I wanted was `mint-tag -c config.toml` and have it
Just Work.

The config file defines the local repo setup, the relevant git remotes, and
the set of steps to run. The basic design is borrowed from the old system: to
include a PR in a build, users add a label to the PR. Each build step can
define its own label: for the Cyrus configuration, the GitHub PRs can have one
label, and the private fork can have a separate label. (There are also some
other features in the config file: you can define a trusted organization, so
that some random person cannot submit a PR to Cyrus, tag it
`include-in-fastmail`, and thereby get their code running inside Fastmail's
infrastructure.)

When it runs, mint-tag does a very straightforward series of steps:

1. prepare local directory
2. fetch PRs
3. get human approval (unless running in automatic mode)
4. merge PRs
5. tag and push


Like a lot of the software I write, this English description is basically
exactly what the code does. (This code is stripped down a little, mostly to
remove logging: this is basically what it says.)

```perl
sub mint_tag ($self, $auto_mode = 0) {
  $self->prepare_local_directory;

  for my $step ($self->config->steps) {
    $step->fetch_mrs($self->upstream_base);
  }

  unless ($auto_mode) {
    my $approver = App::MintTag::Approver->new($self->config);
    my $should_continue = $approver->confirm_plan;
    return unless $should_continue;
  }

  for my $step ($self->config->steps) {
    $self->maybe_rebase($step);
    $self->merge_mrs([ $step->merge_requests ]);
  
    my $tag = $self->maybe_tag_commit($step);
    $self->maybe_push($step, $tag);
  }

  $self->finalize;
}
```

We begin by preparing the local directory. This is not very interesting: it's
effectively `git fetch` for each remote, and bail if the local repo is behind
the correct upstream. Then, we fetch all the relevant pull/merge requests from
the upstreams.

The next step is to get human approval. This is maybe the most interesting
part of mint-tag. Like [movemate](../movemate/), the general process is the
same: first, we make a plan, then we execute the plan.

Here's what human approval looks like:

```txt
Okay, here's the plan! We're going to build a branch called deploy.
We're starting with upstream/master, which is at commit f0d2e3558356.
The last tag I found for this config was fm-20200728.001-gd51a8328.

Step 1: upstream
----------------
We'll include these merge requests from the remote named upstream:

1: !3106, 27014bcc (unchanged, was in step named github)
    brong - ctl_conversationsdb: show or fix thread mismatches
2: !3124, 218af653 (unchanged, was in step named github)
    brong - Sync rename redo

Step 2: capstone
----------------
We'll include these merge requests from the remote named gitlab:

NB: each of these will be rebased before merging!

3: !1, a3fd84cb (was 971419e9, rebased but unchanged)
    rjbs - commits always included in Fastmail builds
4: !2, ae65cc85 (was 790611c2, rebased but unchanged)
    rsto - caldav: reject deletion of default scheduling calendar

Continue with merge? yes/no/help
> 
```

This clearly lists everything that's going into the branch, including what's
changed since the last known tag. You can also investigate the diffs here, to
make sure you know what's going in the tag you're building. Typing `help` at
the prompt tells you how:

```txt
yes        go ahead, merge away!
no         that doesn't look right; abort!
plan       print the whole plan again
log #      show oneline log for entry #, starting from last build
diff #     show diff for entry #, starting from last build
logall #   show oneline log for entry #, starting from its merge base
diffall #  show diff for entry #, starting from its merge base
```

What's most interesting here is that we can even _know_ what was in the last
build: mint-tag can tell you what exactly has changed in a given PR since the
last tag, and can also tell you (as was often the case) when a PR had been
rebased on latest master but otherwise unchanged.

To make this work, mint-tag uses [annotated tags](https://git-scm.com/book/en/v2/Git-Basics-Tagging):
when you tag a commit in Git, you can include a message. When mint-tag tags a
commit, it writes a bunch of metadata into the commit. Here's one of the tag
objects, chosen more-or-less at random:

```txt
tag fm-20200831.005-g50ddeb57
Tagger:     Someone <someone@example.com>
TaggerDate: 2020-08-31 17:29:33 -0400

mint-tag generated commit from step named capstone

[meta]
tag_name = "fm-20200831.005-g50ddeb57"
annotation_version = 1
base = "f6670589b1931a823446c2b12dcec7bc08d400db"

[[build_steps]]
name = "github"
remote = "git@github.com:cyrusimap/cyrus-imapd.git"

  [[build_steps.merge_requests]]
  number = "3160"
  sha = "029b8d869205d85bfd30fdb867ccbafe9645c168"
  merge_base = "f6670589b1931a823446c2b12dcec7bc08d400db"
  patch_id = "4f379ee632314f495a32ffa2eb4f14e0f54f56d4"

  [[build_steps.merge_requests]]
  number = "3164"
  sha = "fd01031b41d9b9c2b62fe9ccfbf269150dd3a292"
  merge_base = "f6670589b1931a823446c2b12dcec7bc08d400db"
  patch_id = "bca3b8dfde443b3934ff4964adc402058718eb77"

[[build_steps]]
name = "capstone"
remote = "git@gitlab.fm:fastmail/cyrus-imapd.git"

  [[build_steps.merge_requests]]
  number = "1"
  sha = "1727caeafadb51051f2376b62641cfed96f0bd0d"
  merge_base = "b44490a5f03d8653b8211bae5b4d6e687dc281b6"
  patch_id = "bd681b6aaa032f6f0d1c7eb8c755e1e4a84d518d"
```

This is another TOML blob that records _exactly_ what went into the tag: the
name of the tag, the version of mint-tag that annotated it, and the base
commit onto which it started. For every step, it includes the PR number, its
sha, the [merge base](https://git-scm.com/docs/git-merge-base) and the 
[patch id](https://git-scm.com/docs/git-patch-id). With this information, we
can tell if it has not changed (in which case the merge base and patch id will
be the same), if it's been updated (the patch id will change), or rebased
without updates (the merge base will change but the patch id will not).

Once a human approves, the remaining work is pretty easy: we've already made
the plan, so all there is left to do is to `git`&nbsp;`merge` them all together,
create the tag, and push to the place specified by the config.

Once this was done for the Cyrus use case, updating it for the Fastmail use
case was easy. The only real difference is that for Fastmail, we don't use
tags and instead push a branch.

There's a lot of other interesting detail (I haven't even written about its
errors, which are very good), but since 
[the code is available](//github.com/fastmail/mint-tag), and the commit messages
are useful, I'll stop here.

## Impact

This was an enormous quality-of-life improvement both for Cyrus and for
Fastmail. After the initial state described here, mint-tag also took over
managing the qa and master branches for Fastmail as well.

I'm extremely happy with the code itself: it has been running in
production for more than 5 years with basically zero problems and zero
updates, running dozens of Fastmail deploys every day. The code is easy to
read (even though it's Perl), and was very easy to adapt as mint-tag learned
new merge styles and got new features.

I learned a lot while working on mint-tag, and it sent me down the git rabbit
hole. Since I started working on it, I wrote [my own toy git implementation in
Rust](https://github.com/mmcclimon/pidgit), I found [a bug in
git](../git-bug), and also 
[have a trivial commit in Git itself](https://github.com/git/git/commit/77a1310e6b3f39f405275faa8c5af02cf5453cb6), 
after lurking on the git mailing list for a while. I am now the go-to git wonk in 
basically all of my friend groups and work groups, and a lot of the software I
write for myself works with git in some way.

Finally, mint-tag served as the basis for a bunch of other work I did on deployment
operations at Fastmail. I'll end this with a note of appreciation from a
colleague as a response to the conclusion of all of that work:

> Congrats! I have wanted this for years, and didn't really think it would
> ever happen until you took it on. I can't wait to try it!

[Back to Portfolio](../)
