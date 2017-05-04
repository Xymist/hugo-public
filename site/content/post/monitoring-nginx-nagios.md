+++
author = "James"
date = "2016-06-16T17:31:57+01:00"
menu = "main"
tags = ["DIY","Sysadmin","Nginx","Nagios","Servers"]
title = "Monitoring with Nginx and Nagios Core"
+++

**While working on** the [kiosk project](https://jamieduerden.co.uk/project/yet-more-kiosks) I've been frustrated with the times when our remote terminals are turned off (usually by a user or a cleaner). We can't set them to wake on LAN because we mostly have to go through firewalls and the wider internet, but it would at least be nice to know when and why I can't connect. If nothing else we can then pick up a phone and tell someone to turn it on rather than running a bunch of fruitless network diagnostics.

[Nagios](https://www.nagios.com/) is a 'free' (very expensive if you want the full package, but the Core package is good enough for most purposes) piece of software which monitors your servers, switches, routers, terminals and whatever else (basically any item with a MAC or IP address) one needs to keep track of. I decided to try it out on my own servers, and was pleased with the results and the ease of setting it up, so I approached my 'manager' on the project about my taking the time to implement it on the systems we've been deploying. Fortunately, he could see the benefits and I received approval to pilot it with some of the kiosks.

Nagios ships with a configuration for Apache2, but this has two issues as far as I'm concerned. First, it expects the web address to be /nagios, which feels inelegant. Second and more fundamentally, I'm not an Apache fan; I much prefer Nginx, though for most practical purposes this is purely a personal preference rather than something upon which a great deal of functionality hinges. As such the configuration needed to be altered a little bit to get things running properly. I've sketched out below how I went about getting all this running; it might prove useful to someone at some point. This is an amalgamation of some information from DigitalOcean, some from a few blogs (one of which included an error that I spent some time hunting down), and my own debugging. I'm assuming you're using Ubuntu 16.04 as your base image.

---

Prerequisites:

`sudo apt-get install nginx libpcre3-dev build-essential libssl-dev php5-cli php5-fpm php5-cgi psmisc spawn-fcgi fcgiwrap libgd2-xpm-dev openssl libssl-dev xinetd apache2-utils unzip`
We need apache2-utils for htpasswd, which gives us our authentication ability.

Set up the users and groups which Nagios expects (these are in a few places in the default config; it's not worth changing them)

```
sudo adduser nagios && sudo add group nagcmd
sudo usermod -a -G nagcmd nagios && sudo usermod -G nagcmd www-data
```
Grab the necessary packages (current as of 2016-06-16; do check the latest version number):

```
curl -L -O https://assets.nagios.com/downloads/nagioscore/releases/nagios-4.1.1.tar.gz
curl -L -O http://nagios-plugins.org/download/nagios-plugins-2.1.1.tar.gz
curl -L -O http://downloads.sourceforge.net/project/nagios/nrpe-2.x/nrpe-2.15/nrpe-2.15.tar.gz

tar xvf *.tar.gz
```

You should now have three directories; you can now remove the tarballs if you want to save space.

`cd nagios-4.1.1`

Then make and build:

```
./configure --with-nagios-group=nagios --with-command-group=nagcmd
make all
sudo make install
sudo make install-commandmode
sudo make install-init
sudo make install-config
```
That should take care of Nagios Core itself.

Now we need to do the same for nagios-plugins...

```
cd ../nagios-plugins-2.1.1
./configure --with-nagios-user=nagios --with-nagios-group=nagios --with-openssl
make
make install
```

...and then NRPE, which also needs to be installed on all your servers (we'll get to that).

```
cd ../nrpe-2.15
./configure --enable-command-args --with-nagios-user=nagios --with-nagios-group=nagios --with-ssl=/usr/bin/openssl --with-ssl-lib=/usr/lib/x86_64-linux-gnu
make all
sudo make install
sudo make install-xinetd
sudo make install-daemon-config
```

That takes care of the software side, now it's just configuration.

You need to allow Nagios to look at itself, so `sudo nano /etc/xinetd.d/nrpe` and add the IP address of the server you're working on to the line beginning `only_from = `. Then restart the service with `sudo service xinetd restart` - you shouldn't see an error.

While we're on services, `sudo ln -s /etc/init.d/nagios /etc/rcS.d/S99nagios` will let the Nagios service restart on a reboot, which is handy because we're super lazy and can't be bothered to start these things manually.

We're not using the standard /nagios location, which means we have to change that as well; `sudo nano /usr/local/nagios/etc/cgi.cfg` and find the line `url_html_path=/nagios`. Remove the last six characters.

Nagios also needs to be able to contact you if there is a problem, and logging in would probably be handy, so let's take care of that.

`sudo nano /usr/local/nagios/etc/objects/contacts.cfg` and where it tells you to set your email address, do that. It's clearly labeled, amazingly.

`sudo htpasswd -c /usr/local/nagios/etc/htpasswd.users nagiosadmin` to create the necessary auth in the correct place.

---

Nginx now needs some love; it doesn't yet know about PHP or fcgiwrap, so `sudo nano /etc/nginx/nginx.conf` and add these inside the http block:

```
upstream php {
    server unix:/var/run/php5-fpm.sock;
}

upstream fcgiwrap {
    server unix:/var/run/fcgiwrap.socket;
}
```

These should both exist, since we installed php5-fpm and fcgiwrap earlier, but do check with `ls /var/run` that they're both present. The first one ends '.sock', the second ends '.socket', because why would anybody ever hope for consistency in such matters?

You then need to create the necessary config file, so `sudo nano /etc/nginx/sites-available/nagios` and insert the following:

```
server {
  listen 80;
  server_name  nagios.YOURDOMAIN.TLD;

  access_log  /var/log/nginx/nagios.access.log;
  error_log   /var/log/nginx/nagios.error.log info;

  expires 31d;

  root /usr/local/nagios/share;
  index index.php index.html;

  auth_basic "Nagios Restricted Access";
  auth_basic_user_file /usr/local/nagios/etc/htpasswd.users;

  location ~ \.cgi$ {
    root /usr/local/nagios/sbin;
    rewrite ^/nagios/cgi-bin/(.*)$ /$1;
    rewrite ^/cgi-bin/(.*)$ /$1;
    include /etc/nginx/fastcgi_params;

    fastcgi_param AUTH_USER $remote_user;
    fastcgi_param REMOTE_USER $remote_user;
    fastcgi_param SCRIPT_FILENAME /usr/local/nagios/sbin/$fastcgi_script_name;
    fastcgi_pass fcgiwrap;
  }

  location ~ \.php$ {
    fastcgi_split_path_info ^(.+\.php)(.*)$;
    fastcgi_index   index.php;
    fastcgi_param   SCRIPT_FILENAME  $document_root$fastcgi_script_name;
    #fastcgi_param  PATH_INFO $fastcgi_script_name;
    include         fastcgi_params;
    fastcgi_pass php;
  }
}

```

You can then link this to the sites-enabled location with `ln -s /etc/nginx/sites-available/nagios /etc/nginx/sites-enabled/nagios` and restart Nginx with `sudo service nginx restart`.

All being well, you should get an OK from the service restart, and browsing to nagios.yourdomain.tld should present you with a login prompt and then the main panel; the only thing in Hosts is Localhost, but that's all right since we didn't create any others.

**Next time** I'll cover adding and linking other hardware, sorting your config files, and custom service monitoring with plugins.

---
