---
title: "Portfolio: A bug I found in MongoDB's oplog format"
description: "How I found a bug in MongoDB's low-level replication mechanism"
---

# A bug I found in MongoDB's oplog format

This post is about how I found a long-standing bug in MongoDB's low-level
replication mechanism, and how we had to work around it in our application.

## Context

You can see [my extended discussion elsewhere](../embedded-verifier) on the
verifier's design; this is a detailed discussion of one very strange test
failure we would see occasionally in testing. A small amount of background and
additional detail will be useful before diving in.

The verifier is an application to verify data migrations from one MongoDB
cluster to another. To do so, it generates a checksum for each collection
(a table, in relational database terminology) by XORing together hashes from
each individual document (a row) in the collection. To capture ongoing changes
during a migration, the verifier reads from a
[change stream](https://www.mongodb.com/docs/manual/changeStreams/): by doing
so, it sees a record of every write on the cluster, and can account for
updates to documents it has already seen. For every write, it gets a single
"change event."

There are a background details we should know before diving into the bug
itself.  First: documents in MongoDB are stored in
[BSON](https://bsonspec.org), which is a binary JSON format. The details of
the spec don't matter too much to us, except to note that in Mongo, every
document has a field called `_id`, which is the primary key for the document.
If the document doesn't have one on insert, the server creates one for you
(an [ObjectID](https://www.mongodb.com/docs/manual/reference/bson-types/#objectid)).
An individual document might look like this.

```python
{
  _id: ObjectId('681ba2bdeb81d80d6a53e338'),
  fruit: 'banana',
  count: 42
}
```

Documents can be inserted and deleted, of course. There are also two different
ways to update a document's contents: you can "update" it (where you can set
individual fields), but you can also "replace" it, where you overwrite it
entirely with a new document.

(Because I cannot help myself, I will describe another fun fact I learned
while looking into this bug. In theory, `_id` fields are immutable; this makes
sense, because they're primary keys! You're not allowed to update a document's
`_id`, and you're also not allowed to change the value of the `_id` field in a
replace operation. But! MongoDB collapses numeric types in some cases, so that
you cannot insert documents with `_id: int(42)` and `_id: float(42.0)`. One
upshot of this is that you _can_ replace a document and change the numeric
type of its `_id` while doing so, as long as the numeric value is the same.
This is definitely a bug in MongoDB, but it's effectively unfixable because
people are unknowingly relying on this behavior. Anyway.&nbsp;.&nbsp;. that's
not the bug in question.)

The other bit of important context here is the basics of MongoDB's
[oplog](https://www.mongodb.com/docs/manual/core/replica-set-oplog/). The
oplog is a system collection that contains every write to the database; it is
the basis for MongoDB's native replication protocol. The details here aren't
super important, except for a few things.

Here's the oplog for the insert of the sample document above, into a database
named `test` and collection named `coll`.

```python
{
  op: 'i',
  ns: 'test.coll',
  ui: UUID('038dd418-c7a6-4df1-beff-af8a7fba422e'),
  o: {
    _id: ObjectId('681ba2bdeb81d80d6a53e338'),
    fruit: 'banana',
    count: 42
  },
  o2: { _id: ObjectId('681ba2bdeb81d80d6a53e338') },
  ts: Timestamp({ t: 1746641597, i: 2 }),
}
```

I've removed a bunch of fields that don't matter here, but here's what each
field is:

* `op` is the operation type; `i` indicates an insert
* `ns` is the namespace, in the form `db.collection`
* `ui` is the collection's UUID
* `o` is the operation, which varies by optype; for inserts, it contains the
  full document that was inserted
* `o2` is another operation field that can vary by optype. For our purposes
  here, it's the `_id` of the document.
* `ts` is a logical timestamp (a "cluster time") that drives the replication
  mechanism; every operation has an associated cluster time.

Here's the oplog entry for an update to that document, where we add a banana:

```python
{
  op: 'u',
  ns: 'test.coll',
  ui: UUID('038dd418-c7a6-4df1-beff-af8a7fba422e'),
  o: { '$v': 2, diff: { u: { count: 43 } } },
  o2: { _id: ObjectId('681ba2bdeb81d80d6a53e338') },
  ts: Timestamp({ t: 1746641613, i: 1 }),
},
```

Now, the optype is `u`, indicating an update. The namespace, UUID, and `o2`
fields are all the same as the insert, indicating it's the same document. The
important thing to note here is that `o` field _doesn't_ have the full
document; it only has the diff required to make the change live. Here, we've
added a banana, so the only change required is to set the count to `43`.
(Oplog entries are idempotent; this update was actually performed with the
[`$inc` operator](https://www.mongodb.com/docs/manual/reference/operator/update/inc/),
but in the oplog the final value is stored instead.)

Finally, here's the oplog entry for a replace operation:

```python
{
  op: 'u',
  ns: 'test.coll',
  ui: UUID('038dd418-c7a6-4df1-beff-af8a7fba422e'),
  o: {
    _id: ObjectId('681ba2bdeb81d80d6a53e338'),
    fruit: 'orange',
    count: 42
  },
  o2: { _id: ObjectId('681ba2bdeb81d80d6a53e338') },
  ts: Timestamp({ t: 1746641655, i: 2 }),
}
```

Note that the optype again is `u`, because replace operations are really just
updates in a funny hat. All of the document-identifying fields match here, but
now instead of 43 bananas, we have 42 oranges: the full document is in the `o`
field.

## Symptoms and investigation

With that out of the way, we can get to the bug! The verifier's job is verify
migrations: every document that exists on the source cluster must exist on the
destination, and must be exactly the same on both clusters.

Sometimes, our tests would fail with a mismatch. (Not always! We run a lot of
non-deterministic tests.) That is: in CI, the tests would fail with a log
message like this:

```json
{
  "database": "test",
  "collection": "coll",
  "_id": {"$oid": "681ba2bdeb81d80d6a53e338"},
  "srcChecksum": "0x4f81047d90b9fd8e",
  "dstChecksum": "0x7469dbd991a50dbe",
  "message": "The source and destination clusters have different contents for this document."
}
```

This log message tells us that in the `test.coll` collection, the document
with `_id: 681ba2bdeb81d80d6a53e338` (the `$oid` thing there is how ObjectIDs
are serialized in the logs) is different on the source and destination.
This is very concerning! It means either we've migrated this document
incorrectly, or we have a bug in the verification logic.

When the tests fail in CI, they save the MongoDB data files, so that it's
possible to poke around and see what data actually made it to the disk. So, I
opened the mongo shell to the source, and see:

```python
{
  _id: ObjectId('681ba2bdeb81d80d6a53e338'),
  fruit: 'orange',
  count: 42
}
```

Then, I opened the mongo shell to the destination, and see.&nbsp;.&nbsp;.
exactly the same thing! On the one hand, that's good, because it means the
migration is not actually corrupt. On the other, that's bad: the verifier
thinks something has different checksums for this document on both clusters,
even though the document is the same.

My first thought was that [`mongosh`](https://www.mongodb.com/docs/mongodb-shell/)
was lying to me somehow. This can happen, and we'd seen it before in debugging
the verifier. (I don't remember exactly the circumstances, because that was
[Dave's](https://houseabsolute.com/) scar tissue and not mine, but I think it
had to do either with numeric types or duplicate fields or something.)

Fine, let's take `mongosh` out of the loop. I wrote a little Go program to
select the document from both clusters, run it through the hash function, and
print out the checksums. This is exactly the codepath it would take through
the verifier, and I thought I could flush it out this way. If there were an
invisible null byte somewhere, then I'd expect to see the same checksums I saw
in the test. That didn't work; the checksums matched exactly.  From there, I
dumped out the raw binary data and ran it through `xxd`: again, identical.
Weird.

At this point, I turned my attention to the change stream. A full discussion
of the change stream is well outside the scope of this particular narrative,
but we had run into problems with it before, and would again. (This isn't
an indictment of change streams, really: we were and are using for something they
weren't _really_ designed for.) My suspicion was that we were seeing something
in the change stream that wasn't quite right, so I did what I usually do in
this situation: think really hard, and then add some print statements.

This bug showed up pretty rarely in our testing, and I had not yet figured out
how to reproduce it reliably (because I didn't actually know what was wrong).
That meant it wasn't really feasible to attach a debugger or something,
because we only saw the artifacts after they failed in CI. I added trace-level
logging to print out the hex dump of every raw change event we saw in our
tests, and then waited.

Eventually, tests failed again. (Cut to me squinting at hexdumps embedded in
JSON logs.) This helped narrow down the bug, and eventually to find it. With
these logs, I could see that on the source cluster, we generated the checksum
during the verifier's initial collection scan, and on the destination, we
generated it from the change stream.

One other minor detail is important here: the verifier opens the change stream
in `fullDocument: "updateLookup"` mode
([docs](https://www.mongodb.com/docs/manual/changeStreams/#lookup-full-document-for-update-operations)).
The change stream is really just a special view over the oplog. Recall that
for update events, the oplog entry doesn't actually _contain_ the full
document; it only contains a minimal diff, to keep oplog entries small.
`updateLookup` instructs the change stream "hey, when you see an update event,
grab the full document and give it to me too." One subtlety here is that even
though (as noted above) `replace` operations are really `update` oplog entries
under the hood, the change stream _doesn't_ do a lookup for replace
operations: it already has the full document in the oplog entry, so it doesn't
need to look it up.

Armed with that knowledge, and the hexdumps of the change events, I could
actually see the bug: the full document in the change event _did not match_
the document that eventually wound up on disk! In the change event, I saw

```python
{
  fruit: 'orange',
  count: 42,
  _id: ObjectId('681ba2bdeb81d80d6a53e338')
},
```

but when I selected them from the database, I got

```python
{
  _id: ObjectId('681ba2bdeb81d80d6a53e338'),
  fruit: 'orange',
  count: 42
}
```

The field order was different! I confirmed this by looking at the oplog
entries directly, where I saw this:

```python
o: {
  fruit: 'orange',
  count: 42,
  _id: ObjectId('681ba2bdeb81d80d6a53e338')
},
o2: { _id: ObjectId('681ba2bdeb81d80d6a53e338') },
```

In the oplog entry, the `_id` field was last, but by the time they actually
got written to the database, the `_id` field _was_ first.

From here, I could go to the experts on the server team and say "hey, what
gives?" It turns out that in the server write path reorders the fields so
that the `_id` field is always first. (This is for performance: looking up
fields in BSON documents is linear on the size of the document, and because
the `_id` is the primary key, it's convenient that it's always the first
field.) For replace operations, the write path _didn't_ do this, and just used
whatever the user actually provided.

With this, our work was done. I
[filed a bug against the server](https://jira.mongodb.com/browse/SERVER-91730),
and we implemented a workaround: when we get a replace event in the change
stream, we manually shuffle the `_id` field to the front before generating the
checksum.

Like a lot of bugs, this one seems obvious in retrospect, but it was not at
all obvious at the time! In the end, the workaround was straightforward, and
we could move on and turn our attention to all the next mystery.

[Back to Portfolio](../)
