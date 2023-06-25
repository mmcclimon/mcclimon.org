---
title: "I've been writing a bunch of Python lately"
slug: i-have-been-writing-a-bunch-of-python
date: 2023-06-24T20:39:09-04:00
description: Slowly saying goodbye to Perl
tags: [ programming, perl, python ]
---

In February, I left [Fastmail](//fastmail.com) to join the team at
[MongoDB](https://www.mongodb.com/docs/cluster-to-cluster-sync/current/).[^1]
Among other things, this means that after nearly six years, I'm no longer paid
to write Perl. This is bittersweet: Perl was the first programming language I
ever loved; it's responsible for my leap from academia and accompanying move to
Philadelphia, and indirectly responsible for some dear friendships. As a
language, though, I think it has no future, and as such I've been trying to
write my own little programs in other languages.

My job at Mongo is primarily writing [Go](https://go.dev/) (though there's
little bits of Python and JavaScript here and there).  For a while, I was rewriting my little Perl tools
in Go (you can even [look at them on GitHub](https://github.com/mmcclimon/handy-tools) 
if you want), but mostly as a learning exercise to get more fluent in the
language I was to be writing full-time at work.  More recently, I've stopped
doing that, because my feelings toward Go are... let's say complicated. It's a
fine language; there are a lot of things to like about it, but I do not find
writing it particularly _fun_, which is a nice-to-have when writing code
off-the-clock.

What I've been doing instead (as you could probably guess from the title of
this post) is writing a lot of Python. I fully realize that "Area man switches
from Perl to Python" is a headline straight from 2009, but hey, I've always
been a little behind the times.

And besides, Python is like, _way_ nicer than it was last time I looked at it
seriously (which would have been around 2012, if memory serves, in the midst
of the pretty rocky 2-to-3 transition).[^2] Python has steadily gotten better over
the last decade or so, and is really nice to use.

Some things I really like about writing Python:

- It has a type system now! I think Python's approach to adding types to the
  language is really pragmatic. It's all gradually typed, but the interpreter
  itself doesn't read the types, and instead leaves that to third-party
  tools. If you don't want to use the type system, you don't have to, but
  when you do, it just works. This is _way_ nicer than my experience with
  (say) Typescript, because there's no transpilation or anything.
- The standard library is really good. One of the tedious things about writing
  personal things in Perl is that anything useful (niche things like JSON or
  HTTPS, for crying out loud) needs to be downloaded from CPAN, which means
  you need a working toolchain, and so on. Though PyPI is great, you can get a
  _long_ way with just the stdlib, which makes it really nice for silly little
  command-line things I want for personal use.
- The standard option parser, `argparse`, parses options like everyone on the
  planet expects options to be parsed. (Yes, this bullet is just an excuse to
  complain about Go.) It drives me batty that Go's 
  [standard flag package](https://pkg.go.dev/flag) uses single dashes for long
  options, which means that `my-cool-program -qv` does not work the way you
  expect. This means that I add a third-party flag library (usually
  [pflag](https://github.com/spf13/pflag)) to literally every Go tool I write,
  because I simply cannot even. I mean honestly.
- Python programs are basically the same as their Perl equivalents. There are
  definitely things I miss from Perl (non-weird ternary operators, postfix
  conditionals, `unless`, etc.), but it's easy for me to figure out how to
  write a thing in Python because it's usually pretty similar to how I'd do it
  in Perl.
- Python has a built-in set type. This is such a minor thing, but I use it all
  the time, and it's way nicer than `my %set = map {; $_ => 1 } @list`.

I did write a new Perl program once in the last several weeks, because I
needed it _rightnow_ and didn't want to think. This week I did the release 
of [mongosync v1.4](https://www.mongodb.com/docs/cluster-to-cluster-sync/current/release-notes/1.4/), 
which meant I needed to push directly to the upstream repository (which I
usually do not do), and I didn't want to push some random guff there.

This, then, is the pre-push git hook I whipped up in 5 minutes:

```perl
#!/usr/bin/env perl
use strict;
use warnings;
use feature 'say';

# See man githooks for this format.
my ($remote_name, $url) = @ARGV;
exit 0 unless $remote_name eq 'gitbox';  # my preferred upstream name

my @forbidden = qw(
  main
  master
  release-1.x
);

my $re = join q{|}, map {; quotemeta } @forbidden;

for (<STDIN>) {
  my ($local_ref, $local_sha, $remote_ref, $remote_sha) = split;

  if ($remote_ref =~ m!refs/heads/($re)!) {
    say "Probably you don't want to push to $remote_name/$1.";
    say "If you really do, pass --no-verify.";
    exit 1;
  }
}
```

The program is very simple: it exits 0 unless I'm trying to push to the
upstream (which tells git to permit the push). If I _am_ trying to push to the
upstream, it forbids the push if I'm trying to push to one of the important
branches.

Here's the same program, which I rewrote in Python later. (The program has since
gotten a bit more complicated after I accidentally pushed some random tags to the
upstream, 🤦🏻‍♂️.)

```python
#!/usr/bin/env python
import sys

remote_name, url = sys.argv[1:3]
if remote_name != 'gitbox':
    sys.exit(0)

forbidden = {
    'main',
    'master',
    'release-1.x',
}

for line in sys.stdin:
    local_ref, local_sha, remote_ref, remote_sha = line.split()
    short_ref = remote_ref.removeprefix("refs/heads")

    if short_ref in forbidden:
        print(f"Probably you don't want to push to {remote_name}/{short_ref}.")
        print("If you really do, pass --no-verify.")
        sys.exit(1)
```

Using a set is obviously nicer than building a regex. (I could have done the
same in Perl, but see also I wrote the program in 5 minutes, and regex can
solve all problems for Perl programmers.) But the program is basically
equivalent, and I could have written it equally as fast if I didn't need to
look up  how to use `sys.stdin`.

Anyway: Python is pretty good. I've been rewriting a bunch of my personal
tools in it, and I've been liking it. There's some weird stuff about it (why
are there so many build tools?), and if I keep up I'll inevitably find some
stuff to complain about, but for now I'll just enjoy writing in a language
where people don't say "I didn't know anybody still used that."


[^1]: If I actually wrote in this blog regularly, I'd have written about that,
    but I don't, so I didn't, and am unlikely to do so. I still remember how
    to overuse footnotes, though.
[^2]: My last big project at Fastmail, incidentally, was deciding what
    language would replace Perl there in the long term. I wrote a bunch of
    example software in TypeScript, Rust, Go, and Python, and ended up
    recommending Python. This was a bit of a surprise to the team (and to me),
    because I also had a reputation as a big fan of Rust, which was true then
    and remains true now.
