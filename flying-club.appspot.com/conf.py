# -*- coding: utf-8 -*-
import os

if os.environ.get('SERVER_SOFTWARE','').startswith('Devel'):
	DEBUG = True
	SERVER = 'http://localhost:8080'
else:
	DEBUG = False
	SERVER = 'http://flying-club.freeflightsim.org'

APP_ID = 'flying-club'
EMAIL = 'pete@freeflightsim.org'
RPX_API_KEY = '76e64fe2ffbcd37e983f1826d7add3151943be45'



tm = "<span class='tm'>FreeFlightSim</span>" #&#0174;
SITE_TITLE = "FlightGear Flying Club"

GOOGLE_PROJECT = "freeflightsim"
ISSUES_FEED = 'http://code.google.com/feeds/issues/p/freeflightsim/issues/full'

## Location of Javascript libs etc on CDN
CDN = 'http://ffs-cache.appspot.com'
CAL_URL = 'http://www.google.com/calendar/render?cid=%s' %  EMAIL

MYSQL_DATETIME = '%Y-%m-%d %H:%M:%S'


## Langs - TODO
"""
langs = [ 	{'code': 'En', 'label': 'English'},
			{'code': 'Fi', 'label': 'French'},
			{'code': 'Es', 'label': 'Spanish'},
			{'code': 'De', 'label': 'German'}
]
"""




