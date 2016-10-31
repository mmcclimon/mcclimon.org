---
date: 2013-09-24T00:00:00Z
title: Introducing Mr. Poole
tags:
  - software
aliases:
  - /blog/2013/09/24/introducing_mr_poole.html
---

Last weekend, I released my first real open source project, "Mr. Poole"
(available on [Github](https://github.com/mmcclimon/mrpoole)). Mr. Poole is a
helper for [Jekyll](http://jekyllrb.com), which is the software I use to write
this blog. In the several days I was using jekyll, I got annoyed at creating
scaffolding for posts/drafts. It was taking *so long* (maybe like 5 seconds
every time I had to do it), so obviously the solution was to spend many many
hours writing a script to cut this 5 seconds down to 2. If there's one thing
programmers do, it's spend hours now to save seconds later.

Mr. Poole is the butler in Stevenson's _Jekyll and Hyde_ (which I must admit,
I've never read). According to
[Wikipedia](http://en.wikipedia.org/wiki/Jekyll_and_hyde), "Poole is Jekyll's
butler who, upon noticing the reclusiveness and changes of his master, goes to
Utterson with the fear that his master has been murdered and his murderer, Mr
Hyde, is residing in the chambers. Poole serves Jekyll faithfully, and
attempts to do a good job and be loyal to his master." I thought it was a
clever name, and apparently [a few other people did
too](https://news.ycombinator.com/item?id=6426527) (he who ships, wins).

Mr. Poole provides an executable (`poole`) that eases this process. Creating a
draft is as simply as running `poole draft`, which you can then create as a
post by running `poole post`. Creating a post can be done with `poole post`,
and if you decide later you don't like it, it's as easy as `poole unpublish`.
You can read all of the details on the
[Github page](https://github.com/mmcclimon/mrpoole).

At any rate, it was my first Ruby gem, and my first real open source project
of my very own (I've [contributed](http://github.com/petdance/ack2) to
[others](http://github.com/michelf/php-markdown) before). I think it's doing
pretty well (105 stars on Github and 317 downloads on RubyGems), which is
pretty good considering I only announced it on my
[Twitter](http://twitter.com/mmcclimon) (which nobody reads, but you should!),
on /r/ruby, and on Hacker News. I've already gotten one pull request, and
hopefully people like it. Maybe one day I'll have another decent idea for a
project...it's fun to contribute to the open-source community, and to
participate in something that's not a giant project.

Now it's time to `poole publish` this thing and put it on THE INTERNET.
