 ______ _____   ______ _       _                _____ _       _     
|  ____/ ____| |  ____| |     (_)              / ____| |     | |    
| |__ | |  __  | |__  | |_   _ _ _ __   __ _  | |    | |_   _| |__  
|  __|| | |_ | |  __| | | | | | | '_ \ / _` | | |    | | | | | '_ \ 
| |   | |__| | | |    | | |_| | | | | | (_| | | |____| | |_| | |_) |
|_|    \_____| |_|    |_|\__, |_|_| |_|\__, |  \_____|_|\__,_|_.__/ 
                          __/ |         __/ |                       
                         |___/         |___/   

--------------------------------------------------------------------
         --- http://flying-club.freeflightsim.org ---
--------------------------------------------------------------------

Developer: Pete Morgan <pete@FreeFlightSim.org>
-- Grapic Designeer and more devs wanted see TODO.txt --

This respository contains the website, and includes the GAE sdk.

Project at - http://code.google.com/p/freeflightsim/
Code at - http://github.com/FreeFlightSim/fg-flying-club


===============================================================================
== Development  ==
===============================================================================
The GAE production server currently uses python 2.5. 
There should be no problems with running locally with > 2.5 and < 3.0
Notable exception is:- 
 > import simplejson as json  # python 2.5
 > import json                # python 2.6+ json is built 
 > from django.utils import simplejson as json # GAE workaround

Downloading and running the site locally on the dev app server it quite straightforward.
Note: you will need to be online as some resources eg javascript are on a CDN.

# goto some directory
cd ~

# take a clone from github, this will create a fg-flying-club/ sub dir
git clone git@github.com:FreeFlightSim/fg-flying-club.git

# make the apppengine script executable (unless they already are)
cd fg-flying-club
chmod +x google_appengine/*.py

# run a site on the dev server using the sqlite datbase
./google_appengine/dev_appserver.py --use_sqlite flying-club.appspot.com/

# then browse at
http://localhost:8080/

### Update the online app
./google_appengine/appcfg.py update flying-club.appspot.com/
>>  enter login details


==============================================================
=== Important ===
==============================================================
If you need to bump the version number in app.yaml,
then increment as digits eg "1,2,3,4" etc
DO NOT USE "2.dev" or any non mumeric characters.
The manual says you can, but experience shows is causes problems.
Also
If you bump the version, you will need to change the "default"
application to newest in the control panel.
==============================================================



