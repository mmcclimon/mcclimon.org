---
date: 2015-08-21T00:00:00Z
title: My dissertation setup
aliases:
  - /blog/2015/08/21/my_dissertation_setup.html
---

I spent all summer writing my dissertation (a boring summer, but productive).
Over the course of the year or so I spent writing the thing, I developed a
pretty extensive workflow for dealing with it. I always enjoy reading about
people's own personal setups (my favorite sites for this are
[The Setup](usesthis.com) and Lifehacker's
[How I Work series](http://lifehacker.com/tag/how-i-work)), so I figured I'd
write my own.

<!--more-->

## Motivating factors

The primary motivator for writing the thing is that I *hate* Microsoft Word.
I can't stand that it uses a whole bunch of memory, drags my computer to the
ground, and occasionally crashes at random. Add to that the fact that the
formatting is a huge pain to get right and that my dissertation has a lot of
mathematical symbols in it, I knew from the start that writing in Word was a
no-go. I also realize that these problems aren't really unique to Word, but to
word processors in general, so something like Pages or LibreOffice was also
out.

Since I made a living for a while as a computer programmer, I really like
doing things in text editors, and I wanted my dissertation to be in plain
text. As it happens, there is a file format initially designed for
mathematical writing that uses plain text as a format: LaTeX to the rescue!
(More on this in a bit.) Plain text means that I can also store everything in
git, which is really convenient for keeping track of things as it changes over
time. (The dissertation is in a repository on Github, but for now it's a
private repository. Once it's finished for good, I'll probably open it up.)

## Hardware

The first question usually on these setup-type posts is along the lines of
"What hardware do you use?" After a stint of using Linux on my laptop, I'm
back to all Apple products. I type on a
[mechanical keyboard](/blog/2013/09/18/tactility_of_typing.html), and use a
Casio keyboard to input things into Finale.

## Software

This is where things get more interesting. The basic process is this: the text
is written in LaTeX with a text editor, which is processed automatically by
LaTeX and when I save, the generated PDF gets updated, which I then look at
with [Skim](http://skim-app.sourceforge.net/).

### Emacs

The central portion of all this is the text editor. I've written before how I
am a hardcore Vim user, but the built-in LaTeX support in Emacs made me
switch. I know, I know. [GNU Emacs](https://www.gnu.org/software/emacs/) is
now my main text editor, though I use vim keybindings via the excellent
[Evil package](https://bitbucket.org/lyro/evil/wiki/Home). It turns out that
what I like most about vim is modal editing, and the Evil vim emulation is
*really* good. Once I trained myself to use `M-x` (which I've rebound to `C-x
C-m` to keep my pinky from going all over the place) instead of Vim's command
line, the transition really wasn't so bad. (You can see my
[dotfiles](github.com/mmcclimon/dotfiles) to see my whole Emacs setup.)

The reason I switched to Emacs is that the
[AUCTeX](https://www.gnu.org/software/auctex/) and
[RefTeX](https://www.gnu.org/software/auctex/reftex.html) packages are
*extremely* useful. The dissertation is a complex document with lots of
examples and references, and it's really useful to be able to pull up an
outline and jump to a particular section, or to pop up a list of examples when
I want to reference one in the text. I tried for a while to use the
[Vim AucTeX emulation](http://www.vim.org/scripts/script.php?script_id=162),
but it didn't really work the way I wanted it to.

There are also a bunch of other features of Emacs that make it nice for
writing long-form things. I use
[flyspell-mode](http://www.emacswiki.org/emacs/FlySpell) for catching dumb
typos, [Outline minor mode](http://www.emacswiki.org/emacs/OutlineMinorMode)
for hiding and showing sections I don't want to look at, and
[abbrev-mode](http://www.emacswiki.org/emacs/AbbrevMode) as a poor man's
autocorrect. (In general, I don't like autocorrect, but when I'm typing
quickly I almost never type the words "transformation," "substitution," or
"separate" properly on the first try.)

### LaTeX

LaTeX is really annoying, and I'm not sure I'd recommend it to most normal
people unless they have something of a masochistic streak in them. That said,
it can produce (with lots and lots of coaxing) really nice PDF output. As it
happens, fiddling with LaTeX settings turned out to be a really nice
procrastination tool, since it's *like* work, but *isn't* work.

I won't go into all of the nitty-gritty details (though I'm happy to if you
email me), invaluable packages for LaTeX included these (all are in the
standard [TeX Live](https://www.tug.org/texlive/) distribution):

- `fontspec`/`mathspec` -- non-hideous fonts
- `sepfootnotes` -- to keep footnotes in separate files from the chapter texts
- `biblatex-chicago` -- Chicago-style references via
  [BibTeX](http://www.bibtex.org/).  I cannot emphasize enough how much time
  this saved me.
- `hyperref` -- automagic referencing of examples, page numbers, and so on
- `xstring` -- really useful for creating macros. The most useful one I wrote
  is one that automatically substitutes `#` and `s` characters for flats and
  sharps, so that I could write `\h{Fs7b9}` and a nicely-formatted chord
  symbol for "F#m7b9" would come out.

There are lots of others for really minor things; once I put the dissertation
on Github you can troll through my style file if you like.

LaTeX compilation was done via the `latexmk` tool (also included in TeXLive).
I have a very simple Makefile, so that I can type `make watch` and this
process sits there waiting for a file to change, and when it does, the whole
thing is run through XeLaTeX as many times as needed. I use the PDF app
[Skim](http://skim-app.sourceforge.net/) because it automatically refreshes
when the PDF file changes, without needing to switch mouse focus to the app.

### Other miscellaneous software

For musical examples, I use Finale 2011. I don't particularly like Finale, and
it often does things which are completely incomprehensible to me (that's a
rant for another post). I use the 4-year-old version because I don't pay the
Finale upgrade tax every year, though once the dissertation is over I'll
probably bite the bullet and do it again. I use Finale mostly because I know
it backwards and forwards. From what I can tell, all notation software is
terrible, so I see no reason to spend a bunch of time learning a new one.

The other examples (and any annotations to musical examples) are done in Adobe
Illustrator. I have tried using other programs so that I don't have to pay for
Illustrator once my magical IU subscription runs out, but Illustrator really
is the best I've found. This is also a situation like Finale: I spent a lot of
time learning Illustrator, and I don't want to invest a lot more time learning
something else that's either less good or only marginally better.

All of the finished examples are saved as PDF files in a
[Git submodule](http://www.git-scm.com/book/en/v2/Git-Tools-Submodules) inside
the main dissertation repository. This lets me keep the giant binary files
(which git doesn't handle well) in source control, but doesn't bog down the
main repo. It also lets me pin a particular version of the examples to a
particular version of the text, which is pretty handy.

When I'm doing transcriptions, I like to use
[Audacity](http://www.audacityteam.org/). I don't use anything close to all of
its features; it's mostly useful because I can set it to start playing at a
particular point over and over again. I prefer to transcribe at full speed
(though Audacity can slow things down when I need to), so normally what I do
is set the cursor at the beginning of a bar, then bang on the space bar to
hear that measure 5--6 times before writing it down. Needless to say, this is
*really* annoying for anyone that has to share an office with me (Hi
Carolyn!), so this is normally done with my computer and keyboard plugged into
a mixer and running into my headphones.

## Dream setup

This setup works pretty well for me, but it does have a lot of moving parts.
In a perfect world, some software would make it better.

- I wish Git dealt with large binary files better. I know there are
  workarounds (like [git annex](http://git-annex.branchable.com/)), but they
  always seem clunky to me. I've heard that Perforce is really good at dealing
  with them, but that's not distributed and there are (as far as I know) no
  free/cheap hosting options.

- I *really* want a good tabbed PDF reader. I usually wind up with a bunch of
  PDFs open (the dissertation, a handful of articles, LaTeX documentation...),
  and it's annoying to have them all in separate windows. I use MightyPDF if
  I'm just reading, since it does have tabs, but it has almost no other
  features. If Skim had tabbed viewing, that would be a dream.

- I have long wanted a music notation software that has no concept of
  playback. I don't need the playback, and if the software didn't either it
  would let you do a bunch of things Finale and Sibelius don't. I often
  want to put barlines in non-regular locations (if examples start and stop in
  the middle of bars), and to do that I have to go in and fiddle with the time
  signatures, then hide the fake time signature. I really want to be able to
  say "put a barline here" and have the software figure it out; if it didn't
  have to play anything back it would be a lot easier.

- Notation software that also has vector drawing tools would be amazing. Then
  I could just use that, without having to export Finale to EPS, then import
  EPS to Illustrator. There's essentially no market for this, but if it were
  decent, every music theorist on the planet would buy it.

- I also wouldn't mind a pair of giant retina monitors and a computer with obscene
  amounts of memory, but my little iMac usually does ok.

This setup probably won't work for anybody else, but it works ok for me. The
hard part, of course, is actually putting the words *into* the system.
