+++
title = "Finally moving home"
date = "2015-12-21T22:31:39Z"
tags = ["DIY", "Sysadmin", "Servers"]
+++

**I've been meaning** for a while to move over from shared hosting to a VPS, partly for control and partly because it seemed like the sort of thing I should know how to do.

Along the way, I managed to:

 - Install [Nginx](http://nginx.org/en/) (web server, for pointing people to this blog and my main site)
 - Set up [Git](https://git-scm.com/) to allow me to version control and deploy my various sites
 - Acquire an [SSL Certificate](http://startssl.com) so that I can force using HTTPS
 - Install and configure [Postfix](http://www.postfix.org/) and [Dovecot](http://www.dovecot.org/) so that my email addresses work.
 - Move my site (and blog) over to the new server
 - Write a blog post explaining these steps so that I can refer back to it when I need to do this *ridiculously* protracted process again.

This is the final step. This may prove useful to some of you, someday, under a somewhat unlikely set of circumstances. I won't be covering what to do if you use Windows, other than to say that for the first steps you'll need [PuTTY](http://the.earth.li/~sgtatham/putty/latest/x86/putty.exe) for the connections, and [PuTTYgen](http://the.earth.li/~sgtatham/putty/latest/x86/puttygen.exe) to create your SSH key.


I bear no responsibility for any damage caused to your sanity or computer systems if you attempt to use this information.

**Prep Work**

First thing to do is create an [SSH key](https://en.wikipedia.org/wiki/Secure_Shell), since that's much more convenient than passwords.

If you're running Linux you should already have `ssh-keygen`, and if not you can install it with `sudo apt-get ssh-keygen`, which you then use with `ssh-keygen -b 4096` and follow the instructions. Leave the path as the default, supply a nice strong passphrase, and make sure it creates the files `id_rsa` and `id_rsa.pub` in your `.ssh` folder. You can use `ls /home/yourname/.ssh` to check.

Now you need a web address. You can buy this from wherever you like, I used [Namecheap](https://www.namecheap.com/). Once it exists you can ignore it for the moment; we'll point it somewhere useful later.

Then you need an SSL key. You could do this after you start up the server, but StartSSL will sort out some of it for you, which LetsEncrypt doesn't yet. They're working on better automation, but it's not quite there. Over at StartSSL, register for an account, verify your identity, and ask for a certificate for your domain. You also get one subdomain - I used `blog.`, fairly often people get `mail.` or `www.`. Fit to your own requirements. If you want a wildcard certificate (i.e. one which will work for any subdomain) you will need to pay for it. I'm a cheapskate, so I have several free ones instead; it makes no real difference.

StartSSL will produce a key and a certificate for you, which you should copy-paste to yourdomain-locked.key and yourdomain-nochain.crt respectively. It will also allow you to download its own key, which is named something like sub.class1.server.sha2.ca.crt.

What you do need to do, though, is merge your certificate with that of your certificate authority, and remove the password from the key.

Run `openssl rsa -in yourdomain-locked.key -out yourdomain.key`, and enter the password you used to create the key. That will create one that the server can use.

Then run `cat yourdomain-nochain.crt sub.class1.server.sha2.ca.crt > yourdomain.crt` to create a concatenated certificate file.

Transfer the .crt containing the two certificates into `/etc/ssl/certs/`, and the .key containing the matching key into `/etc/ssl/private/`.

Done all that? Right, go back and do it again; I won't be covering LetsEncrypt, so you'll need to get yourself an SSL certificate for the `mail.` subdomain. Same procedure, just with `mail.yourdomain` in place of `yourdomain` for the requests, and 'mail-yourdomain' for the names of the files.

**Create a Droplet**

Digital Ocean is nice enough to do most of the basic server setup for you. Once you've sorted out registering, giving them your card details and so on, you'll need to start by creating a Droplet. There's a nice select-a-box page which covers the major options, or you can spin up something with pre-installed dependencies for one of a couple of dozen common server uses.

In this case, I'm using Ubuntu 15.10 x64, $10/month size, in the London datacentre (as close as possible to where I'll be transferring things from and to). Where it asks for the SSH key, it wants `id_rsa.pub` that was created in the last step. Do NOT give it `id_rsa` - that is your private key, and should not leave your computer. Ideally you would copy that one off onto a memory stick, because it's needed to get access to the server once you've locked it down, and you really don't want to lose it.

You only want one copy of this, so leave that bit alone, give your new toy something memorable for its hostname, and click 'create'.

Bravo! You have a server. You're now paying 0.017 pence per minute for it, so best get cracking.

**Initial Setup**

On the Control Panel (to which you are returned after creating your Droplet) you will be able to see the IP address of the server. For now, that's its only identifier; it doesn't yet have a web address, so we'll fix that first, since DNS changes take a while to propagate. Go back to where you bought your domain name, and find the options for 'nameservers'. For our current purposes, these should be set to 'ns1.digitalocean.com', 'ns2.digitalocean.com', and (you guessed it) 'ns3.digitalocean.com'. All this does is tell "the internet" to ask Digital Ocean where to find your site, if anyone sends out a request for that domain name.

Back to DO, and over to the 'Networking' tab. Pick 'Domains' from the left hand side, type your domain name into the left box, and select your Droplet from the right dropdown. That will assign your name to your server. It still won't do anything obvious if you type it into a web browser (first because these things take a while to be communicated across the web, and second because we haven't set up a web server yet), but it's there.

You'll see there's now an entry for that domain name on the Domains page. Click the little magnifying glass, and you'll be able to see all the DNS entries for that domain, and hence for your server (you can do 'clever' things where one domain points to multiple servers or has subdomains which do; if you need that either you are beyond this level or you're working on something where you *really* ought to hire a professional). We don't need to do much here. Start with creating a CNAME record for * and your domain; this points all subdomains to your main domain name, allowing your web server to take care of the detail and for people not to get lost if they accidentally type 'wwww.' instead of 'www.' (because people are dumb and we have to account for that).

We also, assuming you want an email address, need an MX record. Hostname is either `yourdomain` or `mail.yourdomain`; either will work, the latter is more usual. Priority is 20. This needs to be paired with another A record; `mail. -> your droplet IP`.

Test this with `host yourdomain`, which will (all being well) return:
```
yourdomain has address {IP address of server}
yourdomain mail is handled by 20 yourdomain.
```

Depending on how fast things are going today, you may now be able to open up a terminal and run `ssh root@{yourdomain}` and get something sensible - you gave it your SSH key, so it should just log you in. If it insists that your domain doesn't go anywhere, you either typed it wrong or you need to wait a while, so use `ssh root@{ip-of-your-droplet}`. You should see a prompt, something like this:

```bash
Welcome to Ubuntu 15.10 (GNU/Linux 4.2.0-16-generic x86_64)

 * Documentation:  https://help.ubuntu.com/
Last login: {now} from {your IP address}
root@{hostname}:~#
```
Unless specified otherwise, everything from now on needs to be run in this shell. If you run it in the shell on your computer, it will not affect your server and you may screw up your PC, so pay attention to which environment you're typing in.

Before you do anything else, though, you need to update properly.

```bash
sudo apt-get update
sudo apt-get upgrade
sudo apt-get dist-upgrade
```
That'll bring you up to date and ready for the next phase.

**Setting up a web server**

Presumably you're doing this because you want a website, which means you're going to need a web server. In this case I'm using Nginx; Apache is a perfectly good choice, but it's slightly more of a pain to configure.

You can start this up fairly simply by running `sudo apt-get install nginx`, which will download and install the core files and services required. Check it's working by opening a browser and navigating to your domain name; you should see the Nginx 'yup, it works, now do something useful with it' welcome page.

Since we're working on it, issue `sudo service nginx stop` to shut it down for now. In case it hasn't happened already, you'll want to tell Nginx to restart when your server restarts, so issue `sudo update-rc.d nginx defaults` - if it tells you there was an error because the rules already exist, that's fine.

The default page for Nginx isn't that useful, so we need to create a proto-website (to prove it's running) and a configuration file to tell Nginx how to serve it.

Start by disabling the default page: `sudo rm /etc/nginx/sites-enabled/default`
Then create your new config file: `sudo nano /etc/nginx/sites-available/yourdomain` - this will open up a text editor.

The config file should look something like this:

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

Save and exit with `ctrl-x -> y -> Enter`

You then need to link that (which is, after all, just an *available* site) to the *enabled* folder. This is just a symlink: `ln -s /etc/nginx/sites-available/yourdomain /etc/nginx/sites-enabled/yourdomain/`. You should see if you `ls /etc/nginx/sites-available` that you have just the one link in there, to your new config.

This doesn't do anything useful yet - as you can tell, since `/var/www/yoursitename/public_html/` doesn't exist yet. Let's fix that.

`sudo mkdir -p /var/www/yoursitename/public_html` will create the folder, and then `sudo nano /var/www/yoursitename/public_html/index.html` will create an index page for editing.

```html
<h1>Congrats, it works!</h1>
<p>Now go do something useful with it...</p>
```

Save that, then start up Nginx with `sudo service Nginx start`. It should spin up with no errors, and if you then go back to your browser and navigate to your domain, you should see your page.

**Mail Server**

Next step is a touch harder, but worth the trouble; I'm afraid it'll be a wall of text, though, because it's almost all just a few huge config files.

Start with installing our dependencies: `sudo apt-get install postfix dovecot-core dovecot-imapd`, and stopping the new services: `sudo postfix stop && sudo service dovecot stop`.

Then you need to create your Postfix configuration:
`sudo rm /etc/postfix/master.cf && sudo nano /etc/postfix/master.cf` - this will remove the defaults, and open a blank version, which then needs to look like this:

```
smtp      inet  n       -       -       -       -       smtpd
submission inet n       -       -       -       -       smtpd
  -o syslog_name=postfix/submission
  -o smtpd_tls_security_level=encrypt
  -o smtpd_tls_wrappermode=no
  -o smtpd_sasl_auth_enable=yes
  -o smtpd_sasl_security_options=noanonymous
  -o smtpd_sasl_local_domain=YOURDOMAIN
  -o smtpd_recipient_restrictions=permit_mynetworks,permit_sasl_authenticated,reject
  -o milter_macro_daemon_name=ORIGINATING
  -o smtpd_sasl_type=dovecot
  -o smtpd_sasl_path=private/auth
  -o broken_sasl_auth_clients=yes

pickup    unix  n       -       -       60      1       pickup
cleanup   unix  n       -       -       -       0       cleanup
qmgr      unix  n       -       n       300     1       qmgr
#qmgr     unix  n       -       n       300     1       oqmgr
tlsmgr    unix  -       -       -       1000?   1       tlsmgr
rewrite   unix  -       -       -       -       -       trivial-rewrite
bounce    unix  -       -       -       -       0       bounce
defer     unix  -       -       -       -       0       bounce
trace     unix  -       -       -       -       0       bounce
verify    unix  -       -       -       -       1       verify
flush     unix  n       -       -       1000?   0       flush
proxymap  unix  -       -       n       -       -       proxymap
proxywrite unix -       -       n       -       1       proxymap
smtp      unix  -       -       -       -       -       smtp
relay     unix  -       -       -       -       -       smtp
showq     unix  n       -       -       -       -       showq
error     unix  -       -       -       -       -       error
retry     unix  -       -       -       -       -       error
discard   unix  -       -       -       -       -       discard
local     unix  -       n       n       -       -       local
virtual   unix  -       n       n       -       -       virtual
lmtp      unix  -       -       -       -       -       lmtp
anvil     unix  -       -       -       -       1       anvil
scache    unix  -       -       -       -       1       scache
maildrop  unix  -       n       n       -       -       pipe
  flags=DRhu user=vmail argv=/usr/bin/maildrop -d ${recipient}
uucp      unix  -       n       n       -       -       pipe
  flags=Fqhu user=uucp argv=uux -r -n -z -a$sender - $nexthop!rmail ($recipient)
ifmail    unix  -       n       n       -       -       pipe
  flags=F user=ftn argv=/usr/lib/ifmail/ifmail -r $nexthop ($recipient)
bsmtp     unix  -       n       n       -       -       pipe
  flags=Fq. user=bsmtp argv=/usr/lib/bsmtp/bsmtp -t$nexthop -f$sender $recipient
scalemail-backend unix  -       n       n       -       2       pipe
  flags=R user=scalemail argv=/usr/lib/scalemail/bin/scalemail-store ${nexthop} ${user} ${extension}
mailman   unix  -       n       n       -       -       pipe
  flags=FR user=list argv=/usr/lib/mailman/bin/postfix-to-mailman.py
  ${nexthop} ${user}
```

Good thing we have copy-paste, because that does take a while to type and you can't miss out any of the symbols.

Similarly, we need to fix up /etc/postfix/main.cf:
`sudo rm /etc/postfix/main.cf && sudo nano /etc/postfix/main.cf`

Then paste this slightly smaller monstrosity:
```
myhostname = MAIL.YOURDOMAIN
myorigin = YOURDOMAIN
mydestination = YOURDOMAIN, MAIL.YOURDOMAIN, localhost, localhost.localdomain
relayhost =
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
mailbox_size_limit = 0
recipient_delimiter = +
inet_interfaces = all
alias_maps = hash:/etc/aliases
alias_database = hash:/etc/aliases
smtpd_tls_cert_file=/etc/ssl/certs/mail-yourdomain.crt
smtpd_tls_key_file=/etc/ssl/private/mail-yourdomain.key
smtpd_use_tls=yes
smtpd_tls_session_cache_database = btree:${data_directory}/smtpd_scache
smtp_tls_session_cache_database = btree:${data_directory}/smtp_scache
smtpd_tls_security_level=may
smtpd_tls_protocols = !SSLv2, !SSLv3
local_recipient_maps = proxy:unix:passwd.byname $alias_maps
```

Did you spot that `alias-maps`? We need to make that, or it won't find anybody if someone emails any of the admin possibilities.

`sudo nano /etc/aliases`, then paste the following:
```
mailer-daemon: root
hostmaster: root
webmaster: root
postmaster: root
www: root
ftp: root
abuse: root
root: root
```

That just makes sure nothing falls through the cracks.

Now we go to work on Dovecot, the other half of the equation.

`sudo nano /etc/dovecot/dovecot.conf`
```
disable_plaintext_auth = no
mail_privileged_group = mail
mail_location = mbox:~/mail:INBOX=/var/mail/%u

ssl=required
ssl_cert = </etc/ssl/certs/mail-yourdomain.crt
ssl_key = </etc/ssl/private/mail-yourdomain.key

userdb {
  driver = passwd
}
passdb {
  args = %s
  driver = pam
}
protocols = " imap"

protocol imap {
  mail_plugins = " autocreate"
}
plugin {
  autocreate = Trash
  autocreate2 = Sent
  autosubscribe = Trash
  autosubscribe2 = Sent
}

service auth {
  unix_listener /var/spool/postfix/private/auth {
    group = postfix
    mode = 0660
    user = postfix
  }
}
```

And you should have a working mail server. Restart everything: `newaliases && sudo postfix start && sudo service dovecot start`, and if nothing throws an error you're almost there.

The last thing to do, of course, is create an account. The way Digital Ocean starts things up, you're probably running all this as Root. That's not all that handy, and besides, you want your name. So you need to add yourself as a user, which will automatically create a mail account for you.

`sudo adduser YOURNAME` and follow the instructions; once that's done, `su - YOURNAME` and you should be presented with a new prompt; one for you, rather than Root. `exit` to return to the root shell. From a shell on your PC, run `ssh-copy-id YOURNAME@YOURWEBADDRESS` and when prompted give the password for the account you just created.

At this point you probably want to give your new user `sudo` permissions, so that you can avoid using Root at all; run `visudo` and put `YOURNAME    ALL=(ALL:ALL) ALL` beneath the line that's already there. Then go to `/etc/ssh/sshd_config`, find the line which says `PermitRootLogin` and set it to 'no'. While you're here, you should also set `ChallengeResponseAuthentication`, `PasswordAuthentication` and `UsePAM` to 'no'

Now it's time to attempt to login and send some mail with Thunderbird (or your mail client of choice). The username is YOURNAME (not YOURNAME@yourdomain), the IMAP port is 993, the SMTP port is 587, and you're using 'normal password' with STARTTLS.

**Publishing a Website**

OK, so you now have working email and a running webserver. You'll be wanting to publish something under the web address, so you need a convenient and fast way to transfer things to the server. The handiest, neatest way of doing this is with a Git repository, and a post-receive script (FTP went out with the nineties).

If you don't have Git on your local machine, go get that. Then do the same for the server. In both cases, the command is just `sudo apt-get install git`. We'll get to what it's for in a moment.

Currently, your website is owned by Root. That's not exactly secure, now is it?

Let's make a new person: `sudo adduser yoursite-admin` again, and assign ownership to them: `sudo chown -R yoursite-admin /var/www/yoursitename/`. This person also needs to have root privileges for some things, so `sudo visudo` and add the line `yoursite-admin    ALL=(ALL:ALL) ALL` just underneath the equivalent line for YOURNAME. You should also add `Defaults insults` underneath the other Defaults declarations.

Now just `su - yoursite-admin` and you're ready to start getting ready to publish.

You should already be in ~, as that's the default when you switch users with `-`. Run `mkdir yoursite.git && cd yoursite.git && git init --bare` This will create a new Git repository, especially for you to push files to. You need to tell it what to do with them, though.

`nano /hooks/post-receive`
```
#!/usr/bin/env ruby
# post-receive

from, to, branch = ARGF.read.split " "

if (branch =~ /master$/) == nil
    exit
end

deploy_to_dir = File.expand_path('/var/www/yoursitename/public_html/')
`GIT_WORK_TREE="#{deploy_to_dir}" git checkout -f master`
puts "Successfully deployed to '#{deploy_to_dir}'"
```

This won't do much without Ruby, though. The best way to get hold of this is via the Ruby Version Manager:
```
gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
\curl -sSL https://get.rvm.io | bash -s stable --rails
source ~/.rvm/scripts/rvm
rvm install 2.2
rvm use 2.2
```
Then `ruby -v` should tell you that you're on Ruby version 2.2.1, if all went well.

What's happening here is that the Git repository was created without a Working Tree, or a place to keep its data. All it is, without that, is a record of the changes you've made. The post-receive script notices when a push is made, pulls all the relevant files, and deploys them to the designated location - in this case, the web root of your site.

You now need to set this up as your remote. Assuming you have a Git repository containing your website files already on your computer, this is relatively straightforward. Move back to your local machine's terminal, and add a remote: `git remote add yoursite ssh://yoursite-admin@yourdomain/~/yoursite.git`. Then `git add -A && git commit -am "first push to new server"`, followed by `git push yoursite master`. With any luck, this won't tell you that yoursite is not a Git repository, and will push to production. Browsing to https://yourdomain should then display the website you've been aiming for all along.

It's worth doing this again, but slightly differently. Create another Nginx server file, named something like testing-yoursite and with a server name of testing.yourdomain, along with the related `/var/www/` folders. Then, with the same user you created for the main site, create another Git repository and give it a post-receive file which points to this second path. The post-receive file ought to lack the `if branch...` block. Now you can deploy speculative changes to a staging area, including branches, and see if they break anything (when in essentially the exact same environment as the production site) and tidy things up if they do.

I won't cover the somewhat trial-and-error experience of moving a Ghost blog from one server to another; suffice it to say that the export/import procedure in the 'Labs' page is very handy.

Any queries on this, you can ping me and I'll endeavour to help - my email is on the main site.
