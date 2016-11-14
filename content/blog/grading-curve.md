---
title: How I assign curves
date: 2016-11-13T20:26:45-05:00
tags:
    - teaching
---

Occasionally I need to curve grades. The way I like do this is by using a
*linear curve*: effectively, it makes each point worth a different amount. I
use this a lot, but I can never remember how to do it and have to look it up
every time. I'm writing it down here mostly so I can remember it.

<!--more-->

To do this, you need two grades that you want to change: we'll call these M
and N. Often I do this by picking an average and a top score, and deciding
what I want to curve those to be. Then all you do is apply this formula (where
\\(x\\) is the raw score you're curving):


$$
\text{Curved score} =
    M\_{\text{curved}} +
    (\frac{ N\_{\text{curved}} - M\_{\text{curved}} }
          { N\_{\text{raw}} - M\_{\text{raw}} })%
    (x - M\_{\text{raw}})
$$

So, say you want to move the average (\\(M\\)) from 76 to 80, and take the
high score (\\(N\\)) from 96 to 98. You're looking at a paper that got a raw
score of 81. What you need is:

$$
\begin{align}
    \text{score} &= 80 + (\frac{ 98 - 80 }{ 96 - 76 })(81 - 76) \\\\ \
                 &= 80 + (\frac{18}{20})(4) \\\\ \
                 &= 80 + (0.9 \times 4) \\\\ \
                 &= 83.6
\end{align}
$$


One slight disadvantage is that this gives different students different
numbers of extra points (a paper that got a 50 on the previous curve would end
up with a curved score of 56.6). This is actually fairer, and easier to
understand if you think about the curve as changing how much a point is worth.
A paper that misses four points will obviously receive less of a point bump
than a paper that misses fifty points (because the paper missed more points,
which are now worth less).

The other thing you have to watch out for is to make sure that the fraction is
always less than 1: otherwise, students that get high scores will lose points!
(In cases where this might happen, I would find the inflection point and
simply not curve scores above that point...nobody wants to get a paper back
where their curved score is lower than their raw score.)

In a perfect world, I'd prefer to use a grading system that didn't need a
curve
(like
[Standards-Based Grading](//www.mtosmt.org/issues/mto.15.21.1/mto.15.21.1.duker_gawboy_hughes_shaffer.html),
for example), but that's not always feasible. In the meantime, this works
pretty well.

(The site I've always cribbed this from before is at
https://divisbyzero.com/2008/12/22/how-to-curve-an-exam-and-assign-grades/)


<script src='https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML'></script>
