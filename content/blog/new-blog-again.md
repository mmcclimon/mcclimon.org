---
title: New Blog (again)
date: 2016-10-31T17:12:27-04:00
tags:
  - news
---

This site has, once again, changed on the backend without noticably changing
to the outside world (modulo a few different links). It's now built with
[Hugo](//gohugo.io), which is yet another static site generator.

Why change? I hardly ever updated the site anyway, and so it seems like it
would hardly be worth the work of switching everything over and learning a new
thing. A bunch of reasons, as it turns out:

<!--more-->

1. I enjoy learning new things, especially techy things, and more especially
   if they might come in handy in the future. (See: this site, which has been
   through four or five different backends.)
2. Let's be honest; I was procrastinating on a bunch of things. Obviously
   that's the best time to rewrite the website.
3. (Now, some actual reasons.) *Because* I don't update the website that
   often, [Jekyll](//jekyllrb.com/) was getting annoying. Because Jekyll is a
   Ruby application, it seemed like every time I needed it my Ruby environment
   was somehow out of whack, or GitHub pages now needed a gem which needed to
   install, which means that I need to rebuild
   [Nokogiri](http://www.nokogiri.org/) and figure out why it wasn't
   working...and on and on. I read about Hugo on
   [this Hacker News thread](https://news.ycombinator.com/item?id=12672394) a
   few weeks back and it said one of the main advantages was that Hugo was a
   binary (it's written in Go): just download it and it works.
4. Hugo has some nice features: it's much faster than Jekyll, and it has
   live-reload built in (which I've never used before, but is much easier than
   command-tabbing over to Firefox and then hitting command-R to reload). It's like
   magic!

So after a bit of frustration having to do with the
[uglyurls](https://gohugo.io/extras/urls#pretty-urls) setting, it's up and
running. (I was trying to keep all of the URLs the same, but ultimately I
decided it was easier to use the defaults and set up a bunch of
[aliases](https://gohugo.io/extras/aliases/), since I didn't have that many
pages anyway.) Switching to Hugo also gave me an opportunity to try out
[GitLab](//gitlab.com), which I'd been meaning to do for a while. GitLab Pages
(who hosts this site now) has support for Hugo out of the box, and running a
Hugo site on GitHub pages takes some hassle, it seemed.

GitLab Pages *also* lets you set up SSL for your domain, which, thanks to
[Let's Encrypt](https://letsencrypt.org/), is free and relatively easy! So now
my site has a fancy little green lock in the URL bar.

So that's the new site, for now. And though I say this every time I update the
site, I *would* like to start writing more here. I've made that slightly
easier on myself this time around by removing all links to this blog from the
main site. That way, if it turns out I don't write here, I won't feel so
guilty. If I do, so much the better!
