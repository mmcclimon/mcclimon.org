---
date: 2014-10-31T14:03:00Z
title: 'bibkeys: Make BibTeX less annoying'
tags:
  - software
aliases:
  - /blog/2014/10/31/bibkeys.html
---

I'm currently in the process of writing my dissertation (hooray?). For a
number of reasons, I'm writing it using
[LaTeX](http://www.latex-project.org/):

1. I can write in plain text, which means I get all of the plain-text tools I
   already use: vim, git, etc. (and can avoid opening Microsoft Word).
2. My dissertation is about jazz and transformational theory: the TeX macro
   system means I can define a macro for annoying things I get tired of
   typing. I can just write `\h{Gm7b5}` and have the 'b' converted into a nice
   flat character without thinking about it.
3. I can use the excellent
   [biblatex-chicago](http://ctan.org/pkg/biblatex-chicago) package and not
   have to worry about citations at all.
4. TeX typesetting is really nice, especially once you stop using the default
   Latin Modern fonts.

Number 3 is a big one for me: I've tried using other citation management
software before (EndNote, Zotero, Papers), but never really liked them, since
it was always kind of a pain to get it integrated into whatever I was using to
write. BibTeX is great: the database is also plain text, so I can edit it
however I like, and it's flexible enough that I can define my own styles to
deal with the bibliographic nightmare that is jazz discography.

For those of you not in the know, you can cite something in a paper by
including the string `\cite{someUniqueId}`, where `someUniqueId` is a
*citekey*. These can be anything you like, but usually include the author's
name: for Jack Douthett and Peter Steinbach's "Parsimonious Graphs" article, I
use the citekey `douthettsteinbach:1996`.

I really like BibTex, but remembering/typing all of these citekeys was getting
annoying by the end of Chapter 1, so I wrote a program to fix it. Enter
`bibkeys`! ([Github](//github.com/mmcclimon/bibkeys)) Bibkeys is a simple
little Perl program that reads bib files in the current directory and spits
out their keys in alphabetical order.

This is pretty useful by itself, but is super useful when integrated with your
editor's completion function (I use vim, so that's what I'll show here). Vim
has something called Omni-completion: you can press Ctrl-X, Ctrl-O in insert
mode to bring up a completion menu (see [vim
help](http://vimdoc.sourceforge.net/htmldoc/insert.html#complete-functions)
for details). Now that I have `bibkeys` in my path, I can use it to complete
citekeys while I'm writing!

I have this snippet in my vimrc now:

```vim
" A function to complete keys from a BibTeX file. Shells out
" to 'bibkeys' (see github.com/mmcclimon/bibkeys) to get a list
function! CompleteBibKeys(findstart, base)
    if a:findstart
        " locate the start of the word
        let line = getline(".")
        let start = col(".") - 1
        echom line[start - 1]
        while start > 0 && line[start - 1] =~ "[A-Za-z:]"
            let start -=1
        endwhile
        return start
    else
        " find months matching a:base
        let keys = systemlist('bibkeys -1')
        let res = []

        " bibkeys didn't return anything useful
        if v:shell_error
            return []
        endif

        for key in keys
            if key =~ '^' . a:base
                call add(res, key)
            endif
        endfor

        return res
    endif
endfunction

au Filetype tex set omnifunc=CompleteBibKeys
```

If I have a bunch of citekeys that start with "lewin" (no surprise in a
dissertation about transformational theory), I can type "lew", type Ctrl-X
Ctrl-O, and get a pop-up completion menu of all of the citekeys starting with
that string...pretty cool!

Anyway, bibkeys is [up on Github](//github.com/mmcclimon/bibkeys), and is
MIT-licensed, so do with it what you like. It's pure perl, nothing fancy, so
if you're already running LaTeX chances are pretty high you can just dump it
into your $PATH somewhere. Enjoy!
