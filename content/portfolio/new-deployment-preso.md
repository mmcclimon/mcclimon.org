---
title: "Portfolio: New Fastmail deploys"
description: "Notes on an internal Fastmail presentation about our deploy process"
---

# 🚢 Looking under the hood of new Fastmail deploys 🚢

I gave a handful of presentations at [Fastmail](//www.fastmail.com)'s internal
dev talk series. After rewriting nearly all of our deployment tooling, I gave
a talk about where we'd been and where we were. 

[Here are the slides](//files.mcclimon.org/projects/new-deployment.pdf) from
the talk: they're mostly understandable without the accompanying commentary,
but they _do_ require a bit more of the surrounding context:

- For historical reasons, Fastmail's monorepo is named "hm.git". Everyone
  calls it "hm", so that's what the slides use. This repo holds all of the
  frontend JS, the backend Perl, and also all of the operations tooling and
  infrastructure code.
- Fastmail has a conceptually simple deployment process. At a high level,
  you merge to master, then ask the chatbot (named "bort", and yes, 
  [it's a Simpsons reference](https://simpsons.fandom.com/wiki/Bort_(boy))) to
  make your changes go live. During my work, bort also learned to merge
  MRs to master as part of deploy.
- Fastmail runs its own hardware: there is no cloud infrastructure. All the
  tooling is hand-built. At the time (I don't know if this is still true or
  not), there were no containers or orchestration or anything, just a bunch of
  Perl that had grown organically over time.
- In Fastmail jargon, "deploy" means "update the code on the servers," and
  "rollout" means "rebuild the frontend and restart the webservers." All
  changes must be deployed; not all changes require rollouts. Confusingly,
  "rollout" was also used as a generic term for "put the new code into
  effect." The slides also use "JMAPApp" as shorthand; you can read this as
  "the webservers."
- It's not totally clear from the slides without the commentary, but the
  deploy process got a _lot_ faster as part of this work: from about 25
  minutes for a full deploy/rollout to 6.5 minutes or so for JS changes and
  3 minutes for webserver restarts.
- The commit messages on the slides are there to demonstrate length of commit
  message vs. length of the diffstat. If you find yourself thinking "wow,
  that's a lot of text and nobody could actually read that on a slide," that's
  by design!

Because I spent a lot of my time at Fastmail (especially toward the end)
working on all of this tooling, this talk also recaps a bunch of the other
work in this portfolio! If you want to know more, you can read about 
[mint-tag](../mint-tag), the [git bug I found](../git-bug), or our
[insistence on semilinear merges](../gitlab-github-email).

[Back to Portfolio](../)
