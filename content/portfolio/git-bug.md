---
title: "Portfolio: A bug I found in git rebase"
description: "How I found a bug in git rebase and got it fixed in git 2.36"
---

# A bug I found in git rebase

I am on record as loving git. Yes, the CLI is totally incomprehensible, and
yes it's hard to learn, but: you can nearly _always_ accomplish the thing you
want to do. And also, it nearly always works exactly the way it should. This
is the story of one time it didn't.

I have written a bunch of software that drives git in some way. Often these
are just little wrappers:
[git-list-tags](https://github.com/mmcclimon/dotfiles/blob/main/bin/git-list-tags), 
to shows tags with their dates, and [git-recent](https://github.com/mmcclimon/dotfiles/blob/main/bin/git-recent), 
to show recent branches in the order I've visited them. Sometimes they're more complicated, like 
[this program that prints out commit stats by file](https://github.com/mmcclimon/dotfiles/blob/main/bin/git-commit-stats). 
(My favorite of these is actually a program called [`gi`](https://github.com/mmcclimon/dotfiles/blob/main/bin/gi),
which exists so that when I typo `gi twhatever` it does what I mean and calls
`git whatever` instead.) The most complex git-related software I have written,
by a long shot, is [mint-tag](../mint-tag). You can read a lot about it at the
link there, but this is the story of a surprising git bug I ran into while
working on it.

One thing mint-tag can do is to manage a main branch. In this mode, you
can give it one or more pull request identifiers, and it will merge them into
main, then push the branch for you. You can instruct mint-tag to enforce what
GitLab calls "semilinear history": before merge, every branch is rebased on
top of the latest main branch, and then is merged with a merge commit into main.

Shortly after we started using mint-tag, I noticed that it was not reliably
producing semilinear history. Sometimes (not all the time!), it would create
fast-forward instead of creating a merge commit. A picture is probably useful
here: the main branch is in blue, other branches in red and yellow. When
everything was working correctly, you'd see the history on the left: a nice
vertical stack of trapezoids. The bad behavior is on the right; the stack of
blue dots directly on the main branch were the history we were trying to
avoid.

{{< raw >}}
<p><img style="display:block;width:150px;margin:auto" src="https://files.mcclimon.org/img/git-histories.png" alt="correct vs. incorrect merges">
{{< /raw >}}

The first thing I tried to do was reproduce this locally. (It's all just `git`
underneath, so I didn't need to get actual GitHub PRs involved or anything.) I
had a few hypotheses:

* Maybe we only hit the bug when the opposite was a single commit. So,
create a single commit in some branch, go back to main, `merge --no-ff`, see
what the history looks like. That worked just fine.
* Maybe it only happens with _multiple_ commits? Nope, also fine.
* Maybe it only happens when the branch needs to be rebased (i.e., the main
  branch had moved on after the branch had forked off). Also nope, in both the
  single- and multiple-commit cases.

This was very strange! At this point, I went to go look at the mint-tag
source. I assumed I was doing something wrong, because as my friend Mark
Dominus wisely points out, 
[it is never a compiler error](https://blog.plover.com/prog/compiler-error.html): 
nearly every time, it's me that screwed up, not the tool.

At this point, I realized that my attempts at reproduction were not totally
faithful. I was operating git the way I normally do at the command line; when
I was merging, I'd say `git checkout main; git merge --no-ff my-other-branch`.
But this isn't what mint-tag was doing.

When mint-tag deals with branches, it never uses the human-provided names for
them: it always refers to them by their full object ids (40 characters of hex,
or what you might call a "sha" and what internally git calls an "oid"). In
git, a branch name is just a pointer to a commit object, so mint-tag uses the
object names directly. It does so for clarity: branch names can be ambiguous
if you have multiple remotes, but oids are not.

There was one other minor difference. When I rebase locally in my everyday
work (I am an inveterate rebaser), I check out the branch to be rebased, then
run `git rebase main`. This is also what I was doing in my trial runs: I'd
check out the topic branch, rebase, then check out main and do the merge. To
make things faster, mint-tag actually runs `git rebase main topic` while on
the main branch. This is meant to be the same, but since mint-tag is a perl
program, doing it in one git call rather than three (checkout topic, rebase,
checkout main) saves the overhead of shelling out to git.

I went back to my test repository and tried using oids instead of branch
names, and using the shorthand rebase command. Success! I could reproduce the bad case: 
if a branch did not actually need to be rebased&nbsp;-- i.e., if the tip of
main was already its fork point&nbsp;-- _and_ you used oids, _and_ you used
the shorthand rebase syntax, then you'd hit this bug. 

I reported this bug to the git list (the email I sent is included below), and
it was fixed in git 2.36, released a few months later. Luckily for mint-tag,
the bug was also easy to work around: by passing `--force-rebase` to the rebase
command, you could trick git back into doing the correct behavior.

Overall, I was pretty pleased with this investigation and bug report. It was a
little intimidating to send a bug report to the git list, because even after
doing all the analysis, I wasn't entirely sure I wasn't just holding it
wrong. (You can see this in the final sentence below, where I hedge and
suggest that maybe it just needs to be documented more clearly.) 

At the end of the day, It's not like this is a critical bug: the sum total was
that the history wasn't exactly in the shape I wanted. If I'd simply done
nothing, everything would have been fine; the end result with either history
is exactly the same. But that's not the kind of programmer I am. _I_ would
know, and I knew that would feel bad about it every time I saw a fast-forward
in main. I'm glad the bug got fixed, but I'm gladder that I looked into it.
The world has enough mystery as it is, and I am always happy when I can remove
a tiny bit of mystery about some piece of software and sleep easier at night.



## The email I sent to the git list

(See also [the whole thread](https://lore.kernel.org/git/YiokTm3GxIZQQUow@newk/) 
in the mailing list archives.)

To: git@vger.kernel.org  \
Subject: Bug with rebase and commit hashes

I have run into a bug with rebase when operating with commit hashes directly
(rather than branch names).

Say that I have two branches, main and topic. Branch topic consists of a
single commit whose parent is main. If I'm on main, and I run
'git rebase main topic', I end up on branch topic, as expected (my prompt here
displays the current branch):

```txt
[~/scratch on main] $ git rebase main topic
Successfully rebased and updated refs/heads/topic.
[~/scratch on topic] $
```


If I do exactly the same thing, but substitute the commit shas for those
branches, git _doesn't_ leave me on branch topic, but instead fast-forwards
main to topic. This is very surprising to me!

```txt
[~/scratch on main] $ git rev-parse main
464adc6a6f8aa0a943dbf886df1eb6497f70f6e6
[~/scratch on main] $ git rev-parse topic
c3c862105dfbb2f30137a0875e8e5d9dfec334f8
[~/scratch on main] $ git rebase $(git rev-parse main) $(git rev-parse topic)
Current branch c3c862105dfbb2f30137a0875e8e5d9dfec334f8 is up to date.
[~/scratch on main] $ git rev-parse main
c3c862105dfbb2f30137a0875e8e5d9dfec334f8
```

Part of the reason this is surprising is that in the case when topic is not a
fast-forward from main (i.e., does need to be rebased), git does what I'd
expect, and leaves me detached on the newly rebased head.

```txt
[~/scratch on main] $ git rev-parse main
464adc6a6f8aa0a943dbf886df1eb6497f70f6e6
[~/scratch on main] $ git rev-parse topic
8d7d712bad0c32cd87aa814730317178b2e46b93
[~/scratch on main] $ git rebase $(git rev-parse main) $(git rev-parse topic)
Successfully rebased and updated detached HEAD.
[~/scratch at 1477bc43] $ git rev-parse HEAD
1477bc43a3bc7868ba1da8a919a60432bedbd34a
```

I ran into this because I was writing some software to enforce semilinear
history (all commits on main are merge commits, and the topic branches are all
rebased on main before merge). That workflow is: for every branch,
`rebase $main_sha $topic_sha`, then checkout main and `merge --no-ff $topic_sha`.
Because of this bug, when we got to the `merge --no-ff`, git didn't do anything
at all, because it had already fast-forwarded main! I worked around this in
my program by just passing `--force-rebase` to my rebase invocation, which fixes
this particular problem by leaving me in a detached head (as in the last case
above).

I hit this in production on git 2.30.2 (debian bullseye), but reproduced
locally using the latest git main, which is git version 2.35.1.415.gc2162907.
In both cases I wiped my user gitconfig, so I'm using only the defaults. (If
it helps: with my rebase.autosquash = true, the bad case above does not behave
badly and leaves me in detached head as I'd expect.) It's totally possible
this isn't _meant_ to work, in which case I think the docs could use an
update.

Thanks!

[Back to Portfolio](../)
