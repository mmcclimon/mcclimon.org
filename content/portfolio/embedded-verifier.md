---
title: "Portfolio: Embedded verifier for mongosync"
description: "This post describes mongosync's embedded verifier, which is a piece of software I designed at MongoDB to verify migrations."
draft: true
---

# Embedded verifier for mongosync

This post describes the embedded verifier for mongosync, which is a project I
designed and led the implementation of in my time at [MongoDB](https://www.mongodb.com/).

## Context

My current role is on the Cluster-to-Cluster team at MongoDB. Our team
is responsible for (among other things) a tool called 
[mongosync](https://www.mongodb.com/docs/cluster-to-cluster-sync/current/about-mongosync/).
In late 2023, we decided to write a verification tool that would live
alongside mongosync to verify that it was working correctly. I was tapped to
write the design and lead the project.

Mongosync is a tool that migrates data from one MongoDB cluster to another. A
[cluster](https://www.mongodb.com/resources/products/fundamentals/clusters) is a 
logical MongoDB server, consisting of multiple nodes that replicate data among
themselves. Clusters are either [replica sets](https://www.mongodb.com/docs/manual/replication/)
(a single group of nodes that share the same data) or 
[sharded clusters](https://www.mongodb.com/docs/manual/core/sharded-cluster-components/)
(multiple replica sets, each with their own subset of the data, plus some
other components).

While normal MongoDB replication handles moving data around inside a single
cluster, mongosync is a tool to copy the contents of one cluster into an
entirely separate cluster. One of the most important business cases for
mongosync is to help customers move from on-prem deployments of MongoDB into
[Atlas](https://www.mongodb.com/atlas), which is MongoDB's cloud product. This
is a use case for which normal replication does not work: you cannot add an
Atlas node to your existing on-prem replica set.

Mongosync is an online tool: it migrates data from a source cluster to a
destination cluster while the source is still receving writes from the
customer's application. Users have to take a very small amount of downtime (on
the order of several minutes) to finalize the migration. This makes Mongosync
a much more attractive option for migration than using
[mongodump](https://www.mongodb.com/docs/database-tools/mongodump/) to take a
database snapshot from one cluster and
[mongorestore](https://www.mongodb.com/docs/database-tools/mongorestore/) to
restore it to another: a process can take a very long time. (Our team also
maintains the [database tools](https://www.mongodb.com/docs/database-tools/),
including dump and restore.)

Because mongosync is online, it's also _much_ more complicated than mongodump
or mongorestore: it needs to be able to deal with the source cluster changing
out from underneath it while it runs. MongoDB provides a feature we use to do
this: [change streams](https://www.mongodb.com/docs/manual/changeStreams/) are
used to get information about writes happening on the source cluster in nearly
real time. Mongosync works in two phases: first it copies things in bulk (we
call this "collection copy"), and then applies all of the change events to
capture writes that happened during collection copy (this phase is called
"change event application"). 

Users monitor the progress of the process over an HTTP API; when mongosync
reaches a steady state during change event application, they finalize the
migration. To do so, they must stop writes on the source cluster (so that we
have a known final state) and call the `/commit` endpoint. At this point,
mongosync enters a phase called "cutover", where it does any final data
copying necessary, finalizes some other things on the destination (we relax
some constraints during the migration to improve write performance), then
allows users to start using their destination cluster for reads and writes.

When you're writing a data migration tool like this, the Prime Directive is
very straightforward: **don't screw up the users' data**. When the migration
is complete, the destination cluster must match the source cluster _exactly_.
Mongosync has very extensive testing&nbsp;-- in some cases, even more
extensive than the MongoDB Server itself&nbsp;-- to be sure that we're resilient
against all sorts of weird scenarios that can come up in the wild. (For
example: we test the behavior of mongosync during server elections and during
random node failures, we randomly kill and restart mongosync during tests, we
randomly force some number of writes to be retried or arbitrarily dropped; you
get the idea.)

Unfortunately, in late 2023, we had to issue a number of Critical Advisories
(CAs) for mongosync. There were a few extreme edge cases where we could, in
theory, lose user data. Some of these were caught by our internal testing (but
frustratingly, _after_ release), and others were interactions with surprising
edge-case behavior from the MongoDB Server.

We started a big correctness push on the team, with the goal of eliminating
the need to issue any more CAs for mongosync. There were a lot of angles we
could take on the problem, but the biggest one was _verification_. We wanted
some way of telling customers "Hey, your migration is finished, and we have
verified that it went the way we thought it did: all your data is safe, and
you can sleep easy tonight."

Prior to this, our verification story was fairly light. Our documentation told
users to verify the data, but in practice this usually meant counting the
documents on both source and destination and spot-checking documents on both
clusters until you were satisfied that the migration hadn't gone horribly
wrong. (A "document" is a single MongoDB record, like a row in a relational
database.) There was also a 
[standalone verifier](https://github.com/mongodb-labs/migration-verifier), but
at the time, we weren't really confident that _it_ was fully correct either.
We needed something better.

## Design and Implementation

The verifier had a number of design constraints:

* The verifier needed to run inside of mongosync. The standalone verifier was hard for
  users to operate, because it requires coordinating a second binary. We
  wanted anyone running mongosync to get the benefits. (This also meant that
  the verifier had to be written in Go.)
* The verifier could not substantially increase mongosync's cutover time. The
  online nature of mongosync is its biggest asset: if we provided a
  verification solution that required hours of downtime, no one would use it.
* The verifier must do full document verification. Spot-checking a few
  documents here and there would not provide sufficient confidence.

Early on, we made a few additional important design decisions:

- The verifier and mongosync should share as little code as possible. This is
  a [Swiss cheese model](https://en.wikipedia.org/wiki/Swiss_cheese_model): if
  mongosync had some bug, we _definitely_ do not want the verifier to have the
  same bug. This meant we ended up reimplementing some code that probably
  wasn't _strictly_ necessary to reimplement, but increased the overall
  confidence in the tool. (In general, the verifier's versions of the code are
  simpler than mongosync's, which is a nice benefit too.)
- The first version of the verifier would store all its data in memory. One
  the one hand, _this sucks_: it means the verifier would require a lot of
  memory, and that&nbsp;-- unlike mongosync&nbsp;-- if the process crashed,
  you'd need to restart verification from scratch.  On the other hand, it
  meant that we could get the first version done faster, and worry about
  persisting its data to durable storage later. This decision turned out to be
  a good one: we are still (as I write this in mid-2025) in the process of
  implementing persistent storage, and have run into a number of snags along
  the way. Meanwhile, the in-memory version has been runnning in production
  for months.


[Back to Portfolio](../)
