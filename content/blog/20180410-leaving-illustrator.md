---
title: "Illustrator sucks, and everything else sucks worse"
date: 2018-04-10T19:55:50-04:00
tags: [misc, programming]
---

I learned Adobe Illustrator in graduate school, and have used it to generate
hundreds and hundreds of musical examples over the years. I used to get it for
free from IU as part of the (excellent) [IUware][iuware] program, but then I
graduated, and my gravy train ran out.[^1] 

<!--more-->

I still need to make examples occasionally, either on contract as favors to
other people (read: Carolyn), but I sure as hell don't want to pay a monthly
fee to use Illustrator. So I bought a copy of [Affinity Designer][designer],
which is . . . fine. Except that it doesn't do a lot of things I'd come to
expect from Illustrator: you can't make a line with an arrowhead on the end of
it.[^2]

So earlier this week, Carolyn says "hey, can you make me a little graphic for
my signature?" In Illustrator, this is really easy: scan the signature,
live-trace it, and clean it up a bit. So I fired up Affinity Designer,
searched for the live-trace feature, and couldn't find it.

And indeed, it seems, somehow, that this vector drawing program doesn't have a
tracing feature. Some searching suggests that I could do it in Inkscape could
do it and import the resulting SVG, but that seemed tedious. Some further
searching suggested that Inkscape uses the [potrace][potrace] algorithm for
tracing, and that it's better than Illustrator anyway.

Aha! We're off to the races now.

<code>
$ brew install potrace  
$ magick convert signature.pdf signature.bmp  
$ potrace signature.bmp
</code>

Open up the resulting PDF and find a beautifully traced signature, with no
noise. Converted it to a PNG in Preview, emailed it to Carolyn. Job done.



[^1]: I actually _paid_ for a subscription to Adobe Flash for a year or so in 2016 to maintain a bunch of examples I originally made in 2011. Then [my MTO article](http://www.mtosmt.org/issues/mto.17.23.1/mto.17.23.1.mcclimon.html) came out and I cancelled that nonsense immediately.
[^2]: Yes, you read that right.
[iuware]: https://iuware.iu.edu
[designer]: https://affinity.serif.com/en-us/designer/
[potrace]: http://potrace.sourceforge.net/

