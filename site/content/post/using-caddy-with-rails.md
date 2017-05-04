+++
author = "James"
date = "2016-05-25T22:19:58+01:00"
menu = "main"
tags = ["Caddy", "Ruby on Rails"]
title = "Using Caddy with Rails"

+++

This is a bit of a brief one. If you search Google for ways to serve a Rails app running on Puma via Caddy server, you get nothing.

Truly, nothing. Zilch, nada, despite my quite well practiced Google-fu. Apparently it's just not done, or something.

However, despite the fact that most possible Caddyfile configurations result in `502: Bad Gateway`, there is one which works:

```
https://domainname.co.uk {
  root /path/to/app/root
  log /path/to/app/root/log/access.log

  tls webmaster@domainname.co.uk

  proxy / unix:///path/to/your/capistrano/deployment/shared/tmp/sockets/appname-puma.sock {
    proxy_header Connection {>Connection}
    proxy_header Upgrade {>Upgrade}
  }
}

```

It's that simple. And that much of a pain to find. There is a handy dandy preset called `websockets` which you would think would help with this, but no, have a 502 and go back to the beginning. It's worth noting that you need to set config.public_file_server.enabled = true in your production.rb to get any images or css, though; Caddy's `gzip` function doesn't appear to serve the Rails asset pipeline correctly, so you need to have Puma do that as well.

Still easier than doing your own SSL.
