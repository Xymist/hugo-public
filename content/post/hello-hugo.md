+++
date = "2016-03-18T00:58:10Z"
menu = "main"
title = "Hello, Hugo!"
tags = ["Coding", "Golang"]
+++

Following my successful move to new hosting, there's been a bit of a hiatus in my blogging. This has mainly come about because I've been doing some actual useful work, at least some of which has involved some [coding](/project/), which is always entertaining.

I've been in need of a good low-level (ish) language for some time - my D is poor, my C/C++ nonexistent, and my Java not exactly stellar. The biggest problem has been finding one which I like, and which compares favourably in terms of readability to Ruby, which has been my favourite language (slightly ahead of Python) for quite some time. [Haskell](/post/learning-me-a-haskell), while beautiful and elegant when it's going right, is a complete pain when it's going wrong. Moreover it's not as fast as many other languages, and isn't especially marketable. I'll be keeping at it, though, because it has taught me more about how good code *works* than any other language.

I've looked at Clojure, Elixir, Swift and C# (for a variety of different reasons), but finally settled on Go. It's still not as heavily syntactically-sugared as I'd like, but it's clean, tidy and fast, and compiles across all platforms to nice statically-linked binaries, which some others (Haskell and D, in particular) definitely do not. Attempting to cross-compile Haskell code for Windows on Linux was a nightmare.

As a first pass, I've moved both the site and the blog over to [Hugo](http://gohugo.io/) - previously the site was slightly messy AngularJS while the blog ran on Ghost. I have no issues with Ghost, it's a lovely piece of software, but I was never entirely happy with Angular as a framework. Mostly because I don't like JavaScript very much.

I've taken the opportunity to update many of my old blog posts, reducing typos and so on, and to expand greatly my Projects section. That's somewhere between vanity and marketing, I think...

If you're seeing this, it worked, so that's a decent start. As a bonus, the whole thing ought to be a little bit faster, though it's not really big enough for that to be a concern.
