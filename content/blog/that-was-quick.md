---
title: That was quick
date: 2016-11-01T17:59:33-04:00
tags:
  - news
---

Ok, so this site is no longer hosted on GitLab Pages.

*Looks at watch...looks at yesterday's post date...*

I know. But! When I was working on the site yesterday, GitLab was taking
forever to actually build the site and push the content. I know this is
probably a minor inconvenience that doesn't happen often, but I'd prefer
to have no inconvenience at all.

The site is now hosted on [Amazon S3](//aws.amazon.com), with their
CloudFront service to provide the SSL. (It's not as though this site
gets enough traffic to justify a global CDN.) Two articles proved
invaluable in getting all of this set up, since I had never used
CloudFront before: one
from
[David Baumgold](//www.davidbaumgold.com/tutorials/host-static-site-aws-s3-cloudfront/),
and another
from [Joe Lust](//lustforge.com/2016/02/28/deploy-hugo-files-to-s3/).
Now it's dead simple to deploy, and I don't have to depend on another
service to do the building and pushing for me.

I've got a support ticket open with [Hover](//www.hover.com) for some
DNS weirdness, but hopefully that'll be resolved soon. In the meantime,
I'm pretty happy with the current setup. I'm heading to Vancouver this
weekend for [AMS/SMT](//www.ams-net.org/vancouver/), and I'm going to
try to write a bit while I'm there (or on the long trek from East Coast
to West).

If nothing else, it's harder to mess around with DNS on airport/hotel WiFi.
