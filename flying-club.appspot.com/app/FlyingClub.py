# -*- coding: utf-8 -*-

import datetime


from google.appengine.ext import db
from google.appengine.api import memcache

from django.utils import simplejson as json
from google.appengine.api import urlfetch

import conf

class FlyingClub:




	def nav(self):
		"""Return navigation - used in tempalte """
		return self._nav

	def title(self, path):
		"""Return the title or label from path based lookup"""
		if path in self._paths:
			if 'title' in self._paths[path]:
				return  self._paths[path]['title']
			else:
				return  self._paths[path]['label']
		return "#### NO TITLE ###"


	def nav_append(self, dic):
		"""Append items to navigations"""
		self._nav.append(dic)
		self._paths[dic['path']] = dic
		if 'subnav' in dic:
			for subpage in dic['subnav']:
				self._paths[subpage['path']] = subpage



	def __init__(self):
		"""Initialise Navigation and add navigations items"""
		### TODO authenticated sections
		self._mp_servers_info = None
		self.conn = None
		self._nav = []
		self._paths = {}

		self.nav_append( {'path':'/index/', 'label': 'Index'})
		self.nav_append( {'path':'/about/', 'label': 'About'})
		self.nav_append( {'path':'/members/', 'label': 'Members'})
		self.nav_append( {'path':'/schedule/', 'label': 'Schedule'})

		#self.nav_append( {'path':'/plans/', 'label': 'Flight Plans'})
		
	