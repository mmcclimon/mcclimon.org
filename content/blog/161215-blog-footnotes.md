---
title: Footnotes for blogging
date: 2016-12-15T19:11:25-05:00
tags:
    - news
    - software
---

As I said at the end of [a previous post][fnref], I had planned to figure out
the footnote formatting for this blog. I am an academic at heart, after all,
and if there's one thing academics love, it's footnotes.[^1] After some
finagling, I've figured out something that works for me, and since the
people[^2] are clamoring to know my secrets, here they are.

<!--more-->

[As I've mentioned][hugo-blog], this site is now generated using [Hugo][hugo],
rather than [Jekyll][jekyll], which I'd used in the past. One of the nice
things about the Markdown engine Hugo uses ([blackfriday][blackfriday])
supports Multi-Markdown footnotes (see [here][extensions] for details). By
default, this inserts the footnote reference in superscript, and then a
horizontal rule and the content at the bottom of the post.

That's all well and good, but it's not quite fancy enough for me. I've always
been enamored of the footnotes on [Marco Arment's blog][marco], so the obvious
solution was to steal them. He uses something called [bigfoot.js][bigfoot],
which is mostly good.[^3] The bigfoot defaults aren't great, though: the three
dots are opaque and hard-to-understand, and by default it removes the
footnotes from the document.

To get around that, I had to modify a bunch of the CSS, and change the button
markup to get rid of the three-dot thing. Here's that code (the
button markup is gross, but such is life writing JavaScript):

{{< highlight javascript "style=emacs" >}}
.bigfoot({
    actionOriginalFN: "ignore",
    activateOnHover: true,
    deleteOnUnhover: true,
    numberResetSelector: "div.post-content",
    buttonMarkup: (
        '<div class="bigfoot-footnote__container">' +
        ' <button href="#" class="bigfoot-footnote__button" rel="footnote"' +
        ' id="{{`{{`}}SUP:data-footnote-backlink-ref}}"' +
        ' data-footnote-number="{{`{{`}}FOOTNOTENUM}}"' +
        ' data-footnote-identifier="{{`{{`}}FOOTNOTEID}}"' +
        ' alt="See Footnote {{`{{`}}FOOTNOTENUM}}"' +
        ' data-bigfoot-footnote="{{`{{`}}FOOTNOTECONTENT}}">' +
        ' {{`{{`}}FOOTNOTENUM}}' +
        ' </button>' +
        ' </div>'
    )
});
{{< /highlight >}}

And that's all there is...tada! If you want to know more, you can see the
source for this site [at GitLab][gitlab].



[^1]: Citation needed.
[^2]: Just [Bryn](http://www.brynhughes.net/), really.
[^3]: Warning: this site is bright red and hard on the retinas.
[fnref]: /blog/1128-brain-dump/
[hugo-blog]: /blog/new-blog-again/
[hugo]: http://gohugo.io/
[jekyll]: http://jekyllrb.com/
[blackfriday]: https://github.com/russross/blackfriday
[extensions]: https://github.com/russross/blackfriday#extensions
[marco]: https://marco.org/2016/11/05/world-without-mac-pro
[bigfoot]: http://bigfootjs.com/
[gitlab]: https://gitlab.com/mmcclimon/mmcclimon.gitlab.io/tree/master
