---
title: "Goofy Program Files: fold-headers"
date: 2023-08-02T21:44:02-04:00
slug: goofy-program-files-fold-headers
description: Sure I _could_ do it the right way, but why bother
tags: [programming, goofy programs, python, email]
---

My friend [Chasen](https://www.fastmail.com/blog/our-client-application-developer-chasen/)
sent me a message tonight that he would also like to see more of the goofy
program files, and who am I to say no?

Today's entry comes via my last job, where I spent an awful lot of time
looking at email. You probably know what email is, but maybe you don't know
what it actually looks like underneath.[^1] The part of the emails you
actually read are the content; email also has a large set of _headers_ that
contain metadata about the message and its path to you; they're very similar
to [HTTP headers](https://en.wikipedia.org/wiki/List_of_HTTP_header_fields).

Your mail client will definitely show you some of these headers: From, To,
Subject, and Date are all headers. (CC is also a header, but BCC is _not_ a
header, even though it looks like one; email is weird.) There's a lot more
your mail client probably hides from you, because most people don't ever need
to care about them. They contain things like authentication information
(DKIM-Signature, Authentication-Results headers), the path it took to get to
your inbox (Received headers), information about the structure of the message
(Content-Type, Content-Transfer-Encoding), and lots of other stuff
(proprietary anti-spam headers, unsubscribe headers, maybe an Autocrypt header
if you get emails from people with dubious opinions about encrypted email).

In my last job, we very often needed to see the raw headers from users who
were having problems for whatever reason; because there's so much information
there, the full headers are a really useful debugging tool, if you know how to
read them. The problem is that if you just paste the full headers into a text
field, you lose all the formatting, making them roughly impossible to read.

This means we'd regularly get headers that look like this:[^2]

{{< raw >}}
<p style="font-size:85%">
Delivered-To: me@example.com<br>
Received: by 2002:a05:7108:628f:b0:31f:8a9e:3cf3 with SMTP id l15csp768970gdq;
Wed, 2 Aug 2023 01:28:27 -0700 (PDT)
X-Google-Smtp-Source: APBJJlFPo9WVsfCEDg9JSwp22b4N2KkT9xpvL/7Mw/UGn13rGy3ofTkqkL5Sr8KgYMFerlwfEeCU<br>
X-Received: by 2002:a17:902:d303:b0:1b8:95a1:847c with SMTP id b3-20020a170902d30300b001b895a1847cmr15716429plc.40.1690964907040;
Wed, 02 Aug 2023 01:28:27 -0700 (PDT)<br>
ARC-Seal: i=1; a=rsa-sha256; t=1690964907; cv=none;
d=google.com; s=arc-20160816;
b=aL63zEpTMIZI4PKsrkozrgwJVCJVGTYxi06NxiU1m9K6TSIa1xFXfIeoNfY046wef7
R53P1ESzBjMMTxoMgrwFfeTMFdPY6yihg20cguHb5EpL7NTTTT/UGI3ykIMf6+7ssF6B
pKiw==<br>
ARC-Message-Signature: i=1; a=rsa-sha256; c=relaxed/relaxed; d=google.com; s=arc-20160816;
h=feedback-id:list-unsubscribe:message-id:date:subject:cc:to:from
:mime-version:dkim-signature:dkim-signature;
bh=+pmocgT3Uz69wC0izq4zWpavLD9Wlxr9s4p4RaMhhRI=;
fh=D9GT/t9o2pWT+j0wI/al/jbbeAiaiysa/vCNUoNlIuA=;
eBGA==<br>
ARC-Authentication-Results: i=1; mx.google.com;
dkim=pass header.i=@dropbox.com header.s=hj554x4v55d33qgv7p7y4b5spdsgt6wl header.b=jVY63uHt;
dkim=pass header.i=@amazonses.com header.s=hsbnp7p3ensaochzwyq5wwmceodymuwv header.b=ixBC+R6W;
spf=pass smtp.mailfrom=01010189bc15-46de-a633-f1c7fd3231fa-000000@email.dropbox.com;
dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=dropbox.com<br>
Received: from a60-122.smtp-out.us-west-2.amazonses.com (a60-122.smtp-out.us-west-2.amazonses.com. [54.240.60.122])
by mx.google.com with ESMTPS id h2-20020a170902748200b001b9eb349550si10567839pll.391.2023.08.02.01.28.26
for &lt;me@example.com&gt;
(version=TLS1_2 cipher=ECDHE-ECDSA-AES128-GCM-SHA256 bits=128/128);
Wed, 02 Aug 2023 01:28:27 -0700 (PDT)
{{< /raw >}} 

This is, maybe obviously, roughly impossible to read. The way headers are
_supposed_ to be formatted is the header name, followed by a colon, followed
by the value. If the value spans multiple lines, all subsequent lines must be
indented. This makes it much easier to scan for the thing you're actually
looking for.

But this is all fine; I know how to program!  Enter today's goofy program,
`fold-headers`:[^3]

{{< raw >}}
<script src="https://gist.github.com/mmcclimon/8cec3f1fae581a1cfed449df2af92df7.js"></script>
{{< /raw >}} 

I wrote this program originally in Perl, and then ported it to Go, and then
back into Python. (This sounds more exciting than it was; each port took 5
minutes, probably.) Like all goofy programs, it is very straightforward.

We start by assuming we're in the headers (they come first in the raw email).
There's a regex for a header name, which is just: a series of letters or
numbers or hyphens, followed by a colon, followed by a space.

Then, we loop through the lines. If we see a blank line, we're no longer in
the headers and we just print the line as is. If we see a line that looks like
the start of a header, we print it; otherwise, we print 4 spaces and then the
line.

This program turns the garbage above into this:

{{< raw >}}
<pre style="font-size:65%">
Delivered-To: me@example.com
Received: by 2002:a05:7108:628f:b0:31f:8a9e:3cf3 with SMTP id l15csp768970gdq;
    Wed, 2 Aug 2023 01:28:27 -0700 (PDT)
X-Google-Smtp-Source: APBJJlFPo9WVsfCEDg9JSwp22b4N2KkT9xpvL/7Mw/UGn13rGy3ofTkqkL5Sr8KgYMFerlwfEeCU
X-Received: by 2002:a17:902:d303:b0:1b8:95a1:847c with SMTP id b3-20020a170902d30300b001b895a1847cmr15716429plc.40.1690964907040;
    Wed, 02 Aug 2023 01:28:27 -0700 (PDT)
ARC-Seal: i=1; a=rsa-sha256; t=1690964907; cv=none;
    d=google.com; s=arc-20160816;
    b=aL63zEpTMIZI4PKsrkozrgwJVCJVGTYxi06NxiU1m9K6TSIa1xFXfIeoNfY046wef7
    R53P1ESzBjMMTxoMgrwFfeTMFdPY6yihg20cguHb5EpL7NTTTT/UGI3ykIMf6+7ssF6B
    pKiw==
ARC-Message-Signature: i=1; a=rsa-sha256; c=relaxed/relaxed; d=google.com; s=arc-20160816;
    h=feedback-id:list-unsubscribe:message-id:date:subject:cc:to:from
    :mime-version:dkim-signature:dkim-signature;
    bh=+pmocgT3Uz69wC0izq4zWpavLD9Wlxr9s4p4RaMhhRI=;
    fh=D9GT/t9o2pWT+j0wI/al/jbbeAiaiysa/vCNUoNlIuA=;
    eBGA==
ARC-Authentication-Results: i=1; mx.google.com;
    dkim=pass header.i=@dropbox.com header.s=hj554x4v55d33qgv7p7y4b5spdsgt6wl header.b=jVY63uHt;
    dkim=pass header.i=@amazonses.com header.s=hsbnp7p3ensaochzwyq5wwmceodymuwv header.b=ixBC+R6W;
    spf=pass smtp.mailfrom=01010189b55ccf28-36d1bd9a-dc15-46de-a633-f1c7fd3231fa-000000@email.dropbox.com;
    dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=dropbox.com
Received: from a60-122.smtp-out.us-west-2.amazonses.com (a60-122.smtp-out.us-west-2.amazonses.com. [54.240.60.122])
    by mx.google.com with ESMTPS id h2-20020a170902748200b001b9eb349550si10567839pll.391.2023.08.02.01.28.26
    for &lt;me@example.com&gt;
    (version=TLS1_2 cipher=ECDHE-ECDSA-AES128-GCM-SHA256 bits=128/128);
    Wed, 02 Aug 2023 01:28:27 -0700 (PDT)
</pre>
{{< /raw >}}

...which _is_ actually readable!

What a _good_ program would do is parse the message using some email parser
and print out just the headers using the email library in whatever language
you're using. This isn't a good program, though, it's a goofy program, and so
it does this instead, which was good enough for 100% of the cases I needed it
for.[^4]


[^1]: To be perfectly honest, if you wound up on this page, you probably know
    me in real life, in which case the odds are pretty high you _do_ know what
    it looks like underneath. That doesn't make for an interesting read
    though, so instead you can just continue to marvel at the fact that I
    manage to overuse footnotes in every one of these posts.
[^2]: These are headers from an email I got telling me I hadn't used Dropbox
    in a while and wouldn't I please start again. I have mangled them
    sufficiently for space and privacy, so although you could try some funny
    business, it's unlikely to turn up anything useful.
[^3]: I said in the inaugural post that I really think of these programs as
    "stupid programs" rather than "goofy programs": for full disclosure, this
    program actually exists on my machine as `~/bin/shitty-fold-headers`.
[^4]: The reason this isn't a good program is also practical: in most of the
    cases I wanted to use this program, the email would be mangled in some
    other way as well and the email parser probably couldn't parse it to begin
    with, and a program that exited every time saying "uh, this email is
    garbage and I can't parse it" would be totally useless.
