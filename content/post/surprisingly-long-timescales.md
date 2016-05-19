+++
author = "james"
date = "2016-05-19T13:20:12+01:00"
menu = "main"
title = "Surprisingly Long Timescales"
tags = ["Blogging", "Coding", "Golang", "Hobbies"]
+++

**It has been** quite some time since I last wrote any content for this blog. I've been meaning to (the stack of article ideas and 'TODO:' notes keeps growing, which ironically will be the subject of another post) but somehow the time and the will never seemed to coincide. This has mainly come about because I've been doing some actual useful work, at least some of which has involved some [coding](/project/), which is always entertaining.

I've been in need of a good low-level (ish) language for some time - my D is poor, my C/C++ nonexistent, and my Java not exactly stellar. The biggest problem has been finding one which I like, and which compares favourably in terms of readability to Ruby, which has been my favourite language (slightly ahead of Python) for quite some time. [Haskell](/post/learning-me-a-haskell), while beautiful and elegant when it's going right, is a complete pain when it's going wrong. Moreover it's not as fast as many other languages, and isn't especially marketable. I'll be keeping at it, though, because it has taught me more about how good code *works* than any other language.

I've looked at Clojure, Elixir, Swift and C# (for a variety of different reasons), but finally settled on Go. It's still not as heavily syntactically-sugared as I'd like, but it's clean, tidy and fast, and compiles across all platforms to nice statically-linked binaries, which some others (Haskell and D, in particular) definitely do not. Attempting to cross-compile Haskell code for Windows on Linux was a nightmare.

As a first pass, I've moved both the site and the blog over to [Hugo](http://gohugo.io/) - previously the site was slightly messy AngularJS while the blog ran on Ghost. I have no issues with Ghost, it's a lovely piece of software, but I was never entirely happy with Angular as a framework. Mostly because I don't like JavaScript very much. This has reduced the amount I needed to write quite considerably, though the theme did need some work, and integrates the blog properly into the website rather than having it as a separate engine.

I have also dropped Nginx in favour of [Caddy](https://caddyserver.com/); not because I have anything against Nginx (unlike Apache; I'm still using it for my other projects) but because it too is written in Go, it's small and simple to configure, and I wanted to test out some of its more cutting edge features, in particular the auto-SSL function which leverages LetsEncrypt's handy API to acquire a valid certificate on first startup. That went perfectly, so gone are the days of anyone having the slightest excuse for a self-signed (or absent!) certificate. I've seen a slight reduction in server resource usage into the bargain, which while almost irrelevant on a site this size bodes well for scalability.

In case anyone is interested, the difference between setting up Nginx and setting up Caddy is this:

**Nginx** (After having created, concatenated and installed an SSL certificate from elsewhere)
```
server {
        listen 80 default_server;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
}       #This redirects all insecure traffic via https.

server {
        listen   443;

        ssl    on;
        ssl_certificate    /etc/ssl/certs/yourdomain.crt;
        ssl_certificate_key    /etc/ssl/private/yourdomain.key;

        root /var/www/yoursitename/public_html/;

        index index.html index.htm;
        server_name yourdomain.com www.yourdomain.com;

        location / {
                try_files $uri $uri/ /index.html;
        }
}
```

**Caddy** (Without doing much of anything else apart from importing Caddy and the Hugo site)
```
https://jamieduerden.co.uk {
    gzip
    root public
    basicauth /admin #USER# #PASS#
    hugo
}
```

I've taken the opportunity to update many of my old blog posts, reducing typos and so on, and to expand greatly my Projects section. That's somewhere between vanity and marketing, I think.

Mucking around with websites aside, I do feel as if I have been slacking in my day to day life enrichment. Not enough shooting, cooking, or anything much else other than working. Good for my CV, not so good for my soul (metaphorically speaking; we don't actually have those). I'll be attempting to address this problem, and writing up the results here. It's sort of a two birds, one stone approach.
