---
title: "Goofy Program Files: git-slog"
slug: goofy-program-files-git-slog
date: 2023-07-04T21:06:08-04:00
description: It's git log --oneline with a single extra character
images: [ "https://files.mcclimon.org/blog/img/git-slog.png" ]
tags: [programming, goofy programs, git]
---

Most of the programs I write are what I generally think of as stupid programs.
That is: they do one tiny thing that was annoying me for whatever reason, and
usually the thing wasn't even all that interesting to begin with. A _lot_ of
the code I write, especially off the clock, falls into this category, and I
feel like this is a category of program that doesn't get talked about much, so
I'm going to start talking about them.

"Stupid" isn't quite the right word, because it implies that the programs are
bad, which they're not. I think maybe "goofy" is better: the New Oxford
American dictionary (read: Dictionary.app on macOS) says that goofy can mean
"harmlessly eccentric," which also describes the way I see them. So let's go
with that: the Goofy Program Files.

I'm on record as saying that [git](https://git-scm.com/docs/) is my favorite
software. Its interface can be pretty obtuse, but the guts are extremely well
designed, you can basically _always_ do what you want to do, and it's very
easy to extend it in the cases where it can't. During the first part of COVID
quarantines, I wrote my own little git implementation in Rust; it's called
[pidgit](https://github.com/mmcclimon/pidgit/), and it totally works.[^1]
Because of this, I've developed a (probably well-deserved) reputation as a git
nerd, and happy to help with any and all git questions or problems.

My friend [Rob](https://despairlabs.com/) recently started working full-time
on [ZFS](https://en.wikipedia.org/wiki/ZFS). This means he often mutters about
locks and data structures and pastes totally inscrutable walls of C at me that
I don't really understand, but more relevant to this post, needs to sign off
all his commits. Recently he asked me if there was some way of getting `git
log` to show some sort of indicator if a commit has a `Signed-off-by` trailer
or not.[^2]

If you are not aware: when you commit, you can pass the `-s` (or `--signoff`)
option, which adds a line at the bottom of the commit message (a.k.a., a
"trailer") like this:

> `Signed-off-by: Your Name <yourname@example.com>`

You probably wouldn't have run across it if you just use git personally or for
your job, but it's pretty common to require it in open-source projects. It
generally means that you've agreed to a [DCO](https://en.wikipedia.org/wiki/Developer_Certificate_of_Origin)
meaning you're assigning your rights to the commit to the project, or similar.
Rob only signs commits when he's done with them; stuff still in progress
doesn't get signed, because it's not ready to be published yet.

All of this is an extremely long prelude to introducing this goofy program,
jeez, let's just get to it. Here it is:

{{< raw >}}
<script src="https://gist.github.com/mmcclimon/9410bfa7ef7d4302edd3bb49414f0b88.js"></script>
{{< /raw >}}

It's in Perl, because it was contract work, and because I know Rob has a
working Perl install and I do not know (and didn't bother asking) if he has a
working Python install (given that [I've been writing a lot of Python
recently](/blog/i-have-been-writing-a-bunch-of-python/)). It's very simple
(one might also say "stupid"): it opens a pipe to git log with a funny format,
then loops through the lines it prints, munging them ever so slightly as it
goes.

The only interesting part is this somewhat inscrutable line:

> `--pretty=tformat:%(trailers:key=Signed-off-by,keyonly=yes,separator=+) %C(auto)%h%d %s`

Breaking it down a bit, from the [git log docs](https://www.git-scm.com/docs/git-log#_pretty_formats):

- `--pretty=` just introduces the format string.
- `tformat:` provides "terminator semantics", which means that the last line
  is formatted like all the others. (I usually use this in programs, so that
  you don't have to special-case anything.)
- The `%(trailers...)` bit is the important part:
    - `key=Signed-off-by` prints the Signed-off-by trailer
    - `keyonly=yes` prints _only_ the key, not the value (the name/email)
    - `separator=+` means that if a commit has multiple Signed-off-by
      trailers, they'll be joined together with a plus sign. I needed this
      because the default is a newline, and I wanted everything to be on a
      single line.
- `%C(auto)` turns on git's normal coloring for the rest of the line
- `%h%d %s` is the short hash, the decoration (branch name, basically), and
  short subject for the commit. This is the same thing you get from `git log
  --oneline`.

The body of the while loop just reads each of these lines, checks for the
signoff magic (the `%(trailers)` format is empty if there isn't a signoff),
and turns it into a single character. I used a check mark and upside down
question mark, though I assume Rob will change them to something less exciting
when he gets the program.

You can dump this program in your PATH as (say) `git-slog`, and then if you
just run `git slog` it will Just Work, as if it were built into git itself.

{{< raw >}}
<p>
<img src="//files.mcclimon.org/blog/img/git-slog.png"
     alt="Screenshot of the output of git slog: it's four lines of one-line git log output; three lines have check marks in front, and one has an upside down question mark"
     style="max-width:85%;margin:0 auto"
     >
</p>
{{< /raw >}}

I will mention one other thing I usually put in my git-log wrapper programs,
which is: including `@ARGV` in the pipe invocation. This makes this program
_way_ more useful, because it will just accept all the arguments to git log.
You can call `git slog --since '3 days ago' --author michael main..` and it
will transparently pass those along to `git log` and do what you want.

It's a goofy program, and it took me _way_ longer to write this goofy post
about it than it took me to write the program. But at least it's _harmlessly_
eccentric.


[^1]: I used James Coglan's excellent _[Building Git](https://shop.jcoglan.com/building-git/)_ book
for this; his examples are in Ruby, but I was following along in Rust. I
strongly recommend it, if you're interested in that sort of thing!
[^2]: Rob would disagree with "he asked me," to be fair. It was more like he
mentioned that such a thing would be nice in a place where he knew I would see
it, but that's basically equivalent to asking me to write it for him.
