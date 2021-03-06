+++
date = "2016-03-10T17:39:00+01:00"
menu = "main"
title = "Extended Touchscreen Kiosk Project"
+++

[<i class="fa fa-github fa-3x"></i>](https://github.com/Xymist/caw-kiosk-logsite)

This project is a follow-on from the Advice Services Transformation Fund project run in 2015, which ended in February 2016. While the initial pilot phase went well, it was clear that both the demand and the use case had evolved over the life of the project, and as more bids were coming up it was decided to expand and extend the project into a more coherent whole. Moreover, this was the opportunity to go back and eliminate some of our (my) technical debt; I had been put in the position of having produced a demonstration version which happened to function, and having that used in production due to timing issues. With the change in scale I was able to successfully argue for a more stable and planned rebuild. What was once the [companion site](https://github.com/Xymist/caw-kiosk-logsite) to a slightly hacky logscript took over serving the front end, with a full database of all clicks made on the interface. This moved the log data availability from "daily, if we're lucky and there are no connection problems" to practically instant.

Unfortunately for clicks within the partner sites the local script is still required; I hope in the near future to have access to the VPN logs, which should allow me to collect that data serverside rather than client side, reducing the amount of configuration necessary on any single deployed kiosk. The optimum approach here would be to have the necessary base image set up as a Docker or Vagrant container, so that it could be updated in a continuously deployed fashion across all kiosks. This may take some time to achieve, as it requires that the local differences between kiosks are minimised to the greatest extent possible. This will probably be a separate project at a later date.

Monies and influence from the local Care Commissioning Group were bid for and won, with a view to using automated and in-person advice to reduce the number of non-elective admissions to hospitals. This is being treated as a secondary pilot with a view to bringing in considerably more funding and expanding the network of touchscreen kiosks to all GP surgeries within my area.
This will be complemented by the presence one day a week in each of these surgeries of a trained adviser from the local Citizens Advice; this will allow us to compare and contrast the approaches, and hopefully to maximise the number of patients who are exposed to the service.
