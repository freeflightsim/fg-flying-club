# -*- coding: utf-8 -*-

import datetime
import random

#from google.appengine.ext import db
from google.appengine.api import memcache
import gdata.calendar.service
"""
from django.utils import simplejson as json
from libs.BeautifulSoup import BeautifulSoup 
from google.appengine.api import urlfetch
import xml.dom.minidom
"""
"""
import gdata.youtube.service
import gdata.gauth
import gdata.client
import gdata.data
import atom.http_core
import atom.core
"""

import conf


def cal_subscribed(email):
	token = memcache.get(email, namespace="session")
	if token == None:
		return cal_check_acl(email)
	else:
		return token

def cal_check_acl(email):
	## Not in memcache, so check the acl
	calendar_service = gdata.calendar.service.CalendarService()
	calendar_service.email = conf.EMAIL
	calendar_service.password = conf.SECRET 
	calendar_service.source = 'Google-Calendar_Python_Sample-1.0'
	calendar_service.ProgrammaticLogin()
	
	## Get current ACL and iterate thru list till match, if one.
	feed = calendar_service.GetCalendarAclFeed()
	for i, a_rule in enumerate(feed.entry):
		if a_rule.scope.value == email:
			memcache.set(email, 1, 300, namespace="session")		
			return 1
	memcache.set(email, 0, 300, namespace="session")		
	return 0

def cal_add_acl(email):
	calendar_service = gdata.calendar.service.CalendarService()
	calendar_service.email = conf.EMAIL
	calendar_service.password = conf.SECRET 
	calendar_service.source = 'Google-Calendar_Python_Sample-1.0'
	calendar_service.ProgrammaticLogin()

	rule = gdata.calendar.CalendarAclEntry()
	rule.scope = gdata.calendar.Scope(value=email)
	rule.scope.type = 'user'
	roleValue = 'http://schemas.google.com/gCal/2005#%s' % ('editor')
	rule.role = gdata.calendar.Role(value=roleValue)
	aclUrl = '/calendar/feeds/fg@freeflightsim.org/acl/full'
	returned_rule = calendar_service.InsertAclEntry(rule, aclUrl)
	memcache.set(email, 1, 300, namespace="session")
	return 1
