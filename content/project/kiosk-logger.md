+++
date = "2016-03-03"
menu = "main"
title = "Kiosk Logging System"
+++

[<i class="fa fa-github fa-3x"></i>](https://github.com/Xymist/caw-kiosk-logger)

This is a utility for creating a coherent log of kiosk access by public users. This retrieves data from the Firefox history and activity databases, interprets them, and feeds them to a central server.

Written in Ruby (and a tiny bit of Bash scripting), this runs as a service watching the relevant databases, reads, formats and loads the data into a logfile. It then sends this upstream once each day. While doing this, it also sends a heartbeat signal every five minutes, giving early warning of connection failures and inactive kiosks.

There is also a [companion site](https://github.com/Xymist/caw-kiosk-logsite) for the data logger, which receives uploads from the various kiosks, parses them into a SQLite database and generates reports for end users on the operation of the terminals. This is being written in Ruby on Rails, which is probably slight overkill for the task at hand but happens to include useful packages like ActiveRecord, which are preferable to rolling my own database connections and other such necessaries.

This takes the raw data from the uploaded log files, loads them into a Postgres database, and manipulates them in a variety of ways to display the necessary information to non-technical end users.

Had I known in advance that I was going to need these functions, the kiosk site itself (see [here](/project/citizens-advice-kiosks/) for that project) would have looked very different. I would almost certainly have done the entire thing in Ruby on Rails, logged every click server side, had each of the kiosks as users on a single site rather than doing a separate site for each (that last one was not my decision, I hasten to add; I protested the unmaintainability of that model from the start, but was overruled because "that's the way we've always done it") and had the backend data viewable just as an admin panel on that site, saving everyone time, energy and server resources.

There is a chance that this pilot project will be expanded to several times its current size. If that happens, I will lobby hard to be allowed to kill the multiple front ends and expand the log companion site to include the front end pages, removing the need for the logscript part of this project entirely. 
