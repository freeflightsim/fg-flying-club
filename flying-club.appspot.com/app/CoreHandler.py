# -*- coding: utf-8 -*-


import os
import uuid
import datetime
from google.appengine.ext import webapp
from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.api import mail
from google.appengine.ext.webapp import template

from django.utils import simplejson as json
from google.appengine.api import urlfetch
import urllib

import conf
import app.FlyingClub

from app.models import  Comment, Crew



