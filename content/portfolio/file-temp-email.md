---
title: "Portfolio: Email about File::Temp"
description: "An email about how File::Temp is pretty weird, huh."
---

# Writing sample: technical email

## Context

When I worked at [Fastmail](//www.fastmail.com), we wrote a lot of email.
This is not altogether surprising: it is an email company, after all.

One day in mid-June 2022, there was a a minor incident where `/tmpfs` (mounted
as a ramdisk, as I recall) on a machine named `web2` filled up with a bunch of
temporary files.  There were several reasons for this, none of which are
particularly interesting or relevant here. One of the pieces of code involved
was "the migrator," which is code that I helped write and is responsible for
importing mail to Fastmail from some third-party mail provider.

I found out about this via an email to the general engineering list from my
friend [Rob](//robn.au), who worked as a sysadmin at Fastmail at the time. His
initial email suggested that several different pieces of software created
tempfiles in various ways. He mentioned in passing that File::Temp, which is
the Perl module we were using to create temp files, seemed to have different
behavior based on how it was called, and wondered if we were calling it wrong.

The email I sent is just below; there's some running commentary below on some
of the Perl arcana. It's a good example of the way I like to communicate: it's
clearly written, contains working code the reader can run to confirm the
findings, and is entirely self-contained. The whole thing is written in
response to an offhand comment from Rob: it didn't _require_ a response, but I
got interested and did a small amount of investigation and writeup to satisfy
his curiosity and make everyone's lives a little less mysterious. (It is also
representative in that it's missing one right parenthesis, which is one of the
side effects I suffer from my incurable overuse of parenthetical asides.)

## The email

[This is the email exactly as I sent it; the only things I have added are this
prefatory note, and the [Michael] and [Rob] annotations in the first quotes,
to clarify who said what earlier in the thread.]

---

>> [Michael] though File::Temp is so weird
> 
> [Rob] It really really is hey.


⚠️ This email is entirely about the weirdness of File::Temp. The way the
migrator uses it is unproblematic. Probably you don’t want to read any
further. I’m writing it for Rob, and sending it here in case anybody else
is interested. There are lots of terminal pastes. ⚠️

So, File::Temp is pretty weird. We knew this already. Its weirdness became
known to me because Rob said “`create_temp_file` is plausibly wrong in that it
blesses the tempfile handle into IO::File, which I think will make it lose its
auto-unlinking powers?” In this, he was referring to this bit of code in
`ME::Migrator::IMAP`:

```perl
sub create_temp_file {
  ...
  my $Fh = File::Temp::tempfile(DIR => $temp_dir, UNLINK => 1);
  $Fh || die "Failed to create temp file to store message\n";
  bless($Fh, "IO::File");
  return $Fh;
}
```

That is: Rob’s hypothesis is that because we bless the thing we get back from
tempfile into another class, and that maybe that meant its DESTROY behavior
would not fire, thus leaving the files on disk and potentially leading to disk
space explosions like we saw on web2 recently.

As it turns out, File::Temp uses different magic depending on whether you make
your tempfiles with its object-oriented interface or its functional interface.
(Why? Hell if I know.) If you make them with `File::Temp->new`, you get back a
File::Temp object with [destroy magic](https://metacpan.org/dist/File-Temp/source/lib/File/Temp.pm#L1241). 
If you make them with with `File::Temp::tempfile`, you get back a normal
filehandle (i.e., a glob), and the cleanup magic is done an entirely different
way. In the latter case, there’s no DESTROY magic at all: when you make them,
File::Temp registers the absolute path of the tempfile in a 
[global hash](https://metacpan.org/dist/File-Temp/source/lib/File/Temp.pm#L989), 
and then unlinks them all in [an END block](https://metacpan.org/dist/File-Temp/source/lib/File/Temp.pm#L880) 
that fires on process exit. (Links here go to File::Temp source on metacpan.)

Because the migrator uses this latter form, there’s no destroy magic, and so blessing it into IO::File makes no difference; the files are cleaned up on process exit. (Arguably, this is also a bug, in that we’re potentially writing a bunch of things to disk that will stick around until the process exits, long after we’re done using the contents of those files. I’m gonna leave that aside.

You can prove this to yourself with this goofy little program I wrote:

```perl
use v5.30;
use warnings;
use File::Temp qw(tempfile);
use IO::File;

$|++;
my $d = './tmp';

{
  my ($fh, $path) = tempfile(DIR => $d, UNLINK => 1);
  say "made tempfile $path: " . ref $fh;
  say $fh "not blessed into io::file";
  close $fh or die "bad close? $!";
}

{
  my ($fh, $path) = tempfile(DIR => $d, UNLINK => 1);
  bless($fh, "IO::File");
  say "made tempfile $path: " . ref $fh;
  say $fh "blessed into io::file";
  close $fh or die "bad close? $!";
}

{
  my ($fh) = File::Temp->new(DIR => $d, UNLINK => 1);
  my $path = $fh->filename;
  say "made tempfile $path: " . ref $fh;
  say $fh "created with method, not blessed into io::file";
  close $fh or die "bad close? $!";
}

{
  my ($fh) = File::Temp->new(DIR => $d, UNLINK => 1);
  my $path = $fh->filename;
  bless($fh, "IO::File");
  say "made tempfile $path: " . ref $fh;
  say $fh "created with method, blessed into io::file";
  close $fh or die "bad close? $!";
}

print "press enter to continue";
<STDIN>;
say "done";
```

Here we make 4 tempfiles, in the directory tmp/ in the current dir. The first
two are with the function, the last two with the method; we rebless 2 and 4
into IO::File. As it runs, the program prints out the paths and then waits for
you to hit enter before exiting.

Here’s me running it: I suspend the program after it’s made the files and print out what’s there:

```txt
$ perl temp.pl
made tempfile tmp/glNKPxfRO5: GLOB
made tempfile tmp/1KyeRyEMw2: IO::File
made tempfile tmp/tZemzuTHRi: File::Temp
made tempfile tmp/Ygr8w1mQrN: IO::File
press enter to continue^Z
[1]+  Stopped                 perl temp.pl

$ for f in tmp/*; do echo $f; cat $f; echo ''; done
tmp/1KyeRyEMw2
blessed into io::file

tmp/Ygr8w1mQrN
created with method, blessed into io::file

tmp/glNKPxfRO5
not blessed into io::file

$ fg
perl temp.pl
done

$ ls tmp
Ygr8w1mQrN
```

Here, you see that by the time we get to the investigation, the one we created
with `File::Temp->new` (i.e., tZemzuTHRi) has already been unlinked. That’s
because it has `DESTROY` magic, and by the time we get down to the “press
enter” line the object has already been destroyed. The other three are still
there. When the program exits, the last one, which was created with a method
and re-blessed, doesn’t get unlinked. That makes sense: this is the bad
behavior Rob was worried about! We’ve reblessed the object, which means
`File::Temp::DESTROY` never gets called, which means it doesn’t get unlinked.

This is all a wash for the migrator, which uses the function and not the method. That means the thing we get back is a glob with no magic, and reblessing it doesn’t matter because the cleanup is handled at process exit by File::Temp’s global cache of filenames it’s created.

Have a nice weekend!

## Perl arcana

The email I sent had an audience of long-time Perl programmers. I'll assume this
post does _not_ have that audience and provide slightly more commentary here.

[File::Temp](https://metacpan.org/pod/File::Temp) is a Perl module for
creating tempfiles. Like a lot of core Perl modules, it provides two separate
interfaces: a functional one and an object-oriented one. (It was the 90s, and
object-oriented programming was fairly new, and in Perl,
[TIMTOWTDI](https://en.wiktionary.org/wiki/TMTOWTDI) reigns supreme.) With the
functional interface, you call `tempfile()` and get back a filehandle and the
filename. With the object interface, you get back an object you can use as a
filehandle directly, but that also has a `filename` method.

Perl, like many other object-oriented languages, has destructors. If an object
has a method named `DESTROY`, that method is called when the refcount of the
object goes to 0. (I am hand-waving away some details here;
[perlootut](https://perldoc.perl.org/perlootut) has more details if you're
really interested.) This is what I referred to as "destroy magic" in the
email.

Perl, being Perl, also allows you to change the type of an object, because of
course it does. [IO::File](https://metacpan.org/pod/IO::File) is a module that
gives plain filehandles (like the thing you'd get back from `open`) object
methods like `print`, `read`, `close`, etc. This bit of code:

```perl
bless($fh, "IO::File");
```

takes the filehandle `$fh` and turns it into an IO::File object. This is
a little weird, but you get used to seeing this sort of thing especially in
older Perl codebases. (Though in 2025, effectively every Perl codebase is an
older one.)

Anyway: the behavior Rob was concerned about was what happens when we take a
tempfile object created from Temp::File's object interface and turn it into an
IO::File instead. If you do that, then the object really _is_ an IO::File,
which means when it is destroyed, the `DESTROY` method from File::Temp will
not ever be called. (If IO::File objects had a `DESTROY` method, that method
_would_ be called at destruction time; they don't, though, and _definitely_
don't have one that unlinks the file at the end of the scope.)

The sample program has four cases: with both the functional and object
interface, with and without blessing into IO::File. It clearly demonstrates
that a File::Temp object is unlinked when it goes out of scope, but if you
turn that object into an IO::File before doing so, it sticks around forever.


[Back to Portfolio](../)
