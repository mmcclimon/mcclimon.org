---
title: "Goofy Program Files: jlink"
slug: goofy-program-files-jlink
date: 2023-07-14T19:41:43-04:00
description: For when copy-pasting is too hard.
tags: [programming, goofy programs, python]
---

After my last (aka, the inaugural) [goofy program entry](../goofy-program-files-git-slog/),
I was overwhelmed with feedback[^1] that people wanted more, and who am I to
deny them?

Today's entry is a program I call `jlink` (for "Jira link").[^2] We use Jira
at work for task tracking, and the ticket identifiers (like "ABC-1234") wind
up littering everything we do. One day at work I was writing a document that
had a long listing of Jira tickets, and I wanted to add links to them. I was
doing that by: a) opening the Jira page for the ticket; b) ⌘L to select the
address bar; c) ⌘C to copy; d) changing back to the tab I was writing in; e)
⌘K to open the add-link dialog; f) ⌘V to paste.

After doing this a bunch of times, I thought to myself "there's got to be a
better way!" (Incidentally, this runs through my head _every time_ in David
Cross's voice, from his [timeless bit about electric scissors](https://youtu.be/RtrI53k4WZM?t=55).)
Then, I spent 10 minutes (probably; maybe less) writing this program:

{{< raw >}}
<script src="https://gist.github.com/mmcclimon/9205f664e4b1467059157815ed752745.js"></script>
{{< /raw >}}

This program is _very_ simple (recall that I really think of these as "stupid
programs"). There is some basic argument parsing, and then it takes the first
command-line argument you give it, turns it into uppercase, makes an
appropriate URL, and causes it to wind up on my clipboard.[^3]

Here are some things I like about this program:

1. Python's default option parser is nice. It's not my favorite option parser
   in the world (that's a tossup between [clap](https://docs.rs/clap/latest/clap/)
   and [Getopt::Long::Descriptive](https://metacpan.org/pod/Getopt::Long::Descriptive),
   depending on what kind of mood I'm in), but it's easy enough to write,
   provides `--help` without needing to do anything, and handles dealing with
   positional parameters in ARGV just fine.[^4]

2. Python f-strings are nice; one of the reasons I didn't like Python many
   years ago is that interpolating variables in strings was super weird. As a
   Perl programmer I realize I have no basis for complaining about weird
   syntax, but `"Hello %s" % "world"` still feels so strange to me.
   `"Hello {}".format("world")` is better I guess, but f-strings are actually
   good and intuitive!

3. The `subprocess` module makes a bunch of things easy might otherwise be
   tedious. You _can_ do this correctly in Perl using only the built-in stuff
   (maybe using `open`, for crying out loud!), but more often I'd reach for
   [IPC::Run3](https://metacpan.org/pod/IPC::Run3) or
   [Capture::Tiny](https://metacpan.org/pod/Capture::Tiny), plus
   [Process::Status](https://metacpan.org/pod/Process::Status). The subprocess
   docs in Python are often confusing to me (actually, I find _most_ of the Python
   docs to be sort of hard to navigate), but it's trivial to just run a
   program and grab its output, having the program fail if something goes
   wrong.

4. This program is written for me alone. I don't need to think about
   whether this program works on Linux (it doesn't), because I _don't run
   Linux_. If `pbcopy` fails, or I get an ugly exception; that's fine, I don't
   care. If run `jlink foo` it will happily copy a link to the bogus url
   ending in `/FOO`; that's fine too. If I were writing a _non_-goofy program,
   I'd make sure the exceptions were friendly, and do a bunch of
   error-checking up front to make sure the user wasn't surprised. As is, the
   program is for _me_; if it breaks, I won't be surprised, because it's a
   stupid program!

This last thing is, I think, the best thing about goofy programs.  I _do_ care
a lot about code quality, and software as craft, and maintainability, and all
that other stuff.  But at the end of the day, computers are just tools to make
humans' lives a little easier, and sometimes the only human I need to satisy
is myself. There's a time and a place for everything, after all, and I like
the place these goofy programs occupy in my life.


[^1]: Three people said they'd read another similar, which is very close to
100% of the readership, as far as I can tell.
[^2]: I can call it jlink because I do not write Java, and thus never have a
need to use the [Java linker](https://docs.oracle.com/en/java/javase/11/tools/jlink.html#GUID-CECAC52B-CFEE-46CB-8166-F17A8E9280E9)
of the same name.
[^3]: Lest anyone question my opsec: a lot of Mongo's Jira instance is
actually public, though the project I work on most often is not. I had a small
part in finding the bug in [GODRIVER-2773](https://jira.mongodb.org/browse/GODRIVER-2773),
for example, though the actual issue I filed (GODRIVER-2768, mentioned there)
is private because it links to a bunch of private code.
[^4]: And uses double-dashes for long options. Sorry (not sorry) Rob Pike, I
    will be carrying this to my grave.
