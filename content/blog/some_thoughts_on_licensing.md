---
date: 2013-12-05T00:00:00Z
title: Some thoughts on licensing
aliases:
  - /blog/2013/12/05/some_thoughts_on_licensing.html
---

I managed to find myself in a discussion on Twitter
([@mmcclimon](//twitter.com/mmcclimon)) this afternoon about
licensing. The discussion started out about open access, where a colleague of
mine ([@krisshaffer](//twitter.com/krisshaffer)) wanted to talk about the
distinction between open access (which he equated with CC-BY licenses) and
open source (CC-BY-SA). His argument was the open access (CC-BY) "still
allows for-profit hijacking of materials."

I responded and said that [according to
GNU](http://www.gnu.org/philosophy/free-software-for-freedom.html), open
source is not equal to free software, and subsequently that I didn't
particularly care for the GNU licenses. Richard Stallman has a well-known
arbitrary definition of freedom whereby "do whatever you want" is less free
than "do whatever I tell you to."

This is a bit long, so I'll put it behind the jump.

<!--more-->

[Quick aside for context.] The [Free Software Foundation](http://www.fsf.org/)
(FSF) was founded by Richard Stallman, who in the 80s started developing an
operating system called [GNU](http://en.wikipedia.org/wiki/GNU_Project), which
he envisioned as the world's first "free operating system." This system still
doesn't exist entirely, though Linux is basically the same ([despite what
Stallman might tell you](https://www.gnu.org/gnu/linux-and-gnu.html)). The GNU
Public License (GPL) is a software license which says that any modifications
to the software must be released also be GPL-licensed (commonly referred to as
a [copyleft](http://en.wikipedia.org/wiki/Copyleft) license). The [Creative
Commons](http://us.creativecommons.org/) system of licenses is similar, but
are more applicable to non-software works: books, articles, music, etc. (All
of Wikipedia is available under a [CC-BY-SA
license](http://en.wikipedia.org/wiki/Wikipedia:Copyrights).)

[Aside over.] Kris asked which licenses I liked better, and the answer to that
is "nearly all of them." My software is typically under the MIT license (or
Artistic License, for Perl), but I also like the BSD licenses quite a bit,
along with Apache, Mozilla, and of course the [WTFPL](http://wtfpl.net). He
responded that he sees copyleft as "helpful for maintaining communtiy
ownership and preventing corporate hijacking," which is of course true. He
continued, "CC BY lets the immediate user do more, but the restrictions of SA
(GPL), allow the next users to do more." I couldn't compress a response into
140 characters, so I'm writing this instead.

Kris (and the FSF) are of course right that works under the GPL/CC-BY-SA allow
later users more freedom. My disagreement with these licenses (the GPL in
particular) is purely a moral one. The ultimate goal of the GPL is to force
all software to be open source. I realize that this is in actuality not more
restrictive than copyright, but it goes against what I feel is the spirit of
open source.

When I write software (or anything, for that matter), what matters to me is
getting it out to the public. If other people find it useful, excellent. If
they expand on it, great. My thoughts on the GPL are pretty well summed up by
[this
article](http://noordering.wordpress.com/2009/01/20/why-the-gpl-is-not-free/).
Both the LGPL and CC-BY (along with the MIT, BSD, et al) licenses require that
the initial license is included in the final work, but *not* that the
derivative work also be open source. Because the original, open-source version
is still available, my work is still open source and any later user can do
whatever they like with it. I don't think it's my place to tell other people
they *can't* do what they want to with my work. That's a moral decision, and
either way is really ok with me.

The more interesting part of this discussion is the connection to academia.
Open access is a great thing (and [pays my salary](http://chmtl.indiana.edu),
incidentally). The distinction between open access and open *source* in
academics is much fuzzier than in software, however. (And I mean "open source"
in Stallman's terms now: access to source code. When Kris is talking
about open source he is really talking about copyleft.)

What's interesting to me is that academia has always been open source, but not
open access. Essentially everything is CC-BY: if I want to use David Lewin's
work in my dissertation (which I'd hesitate to call a derivative work!), I
can. I don't have to get permission from the Lewin estate, or from Oxford
University Press, I just have to say that they're his ideas and tell people
where to find them.

This is because the distinction between "source" and "content" is non-existent
in the humanities in a way that is different from software (I'm certainly not
the first person to have pointed this out, but I can't recall having read it
before). There is no secret "source code" to *GMIT* that is then run to
generate the book; if there is, I'd certainly like a copy! Open source is
useful in software because I can ship you a piece of software that is a black
box: you can use it and have no idea how it works. That's not the case in
academia, though I have seen some people try.

The distinction then, hinges on "access," and in the humanities I'd argue this
distinction isn't terribly important. Let's say that there is a website that
has the full text to Lewin's _Generalized Musical Intervals and
Transformations_ available for free (open access). If I want to use this
resource, it doesn't matter to me whether it's CC-BY or CC-BY-SA: if I'm a
responsible scholar I'm going to cite it in either case.

The caveat is that CC-BY-SA *does not prohibit commercial use* (the relevant
CC license is the NC provision). If I want to print off a copies of this
mythical CC-BY-SA licensed _GMIT_ and sell them to my friends, that's
perfectly fine (just as it's perfectly fine to sell GPL-licensed code). In
practice this doesn't matter much: because the GPL requires me to include the
license, this original version is always available. Users are much more
likely to use the free version rather than the paid version, unless there is
significant added value to the paid version (I'd gladly pay someone if they
had fixed all the typos in _GMIT_).

I think open access is a great thing, and I think more journals/presses should
be doing it, but I don't think the distinction between open source and open
access in the humanities is one worth spending a lot of time on.
