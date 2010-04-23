# -*- coding: utf-8 -*-
from google.appengine.ext import db

"""
The Data Definition
"""

class Comment(db.Model):
	comment =  db.StringProperty(multiline=True)
	section = db.StringProperty(indexed=True)
	dated = db.DateTimeProperty(indexed=True, auto_now_add=True)
	author = db.UserProperty()



class Crew(db.Model):
	ident =  db.StringProperty(indexed=True)
	name = db.StringProperty(indexed=True)
	email = db.StringProperty()
	callsign = db.StringProperty(indexed=True)
	irc = db.StringProperty()
	forum = db.StringProperty()
	wiki = db.StringProperty()
	cvs = db.StringProperty()
	pilot = db.BooleanProperty()
	atc = db.BooleanProperty()
	fgcom = db.BooleanProperty()
	date_created = db.DateTimeProperty(indexed=True, auto_now_add=True)
	location = db.StringProperty()
	



class FPp(db.Model):
	cookie = db.StringProperty(indexed=True)
	callsign = db.StringProperty(indexed=True, required=True)
	dep =  db.StringProperty(indexed=True)
	dep_date = db.DateTimeProperty(indexed=True)
	dep_atc =  db.StringProperty(indexed=True)
	arr =  db.StringProperty(indexed=True)
	arr_date = db.DateTimeProperty(indexed=True)
	arr_atc =  db.StringProperty(indexed=True)
	comment =  db.StringProperty(multiline=True)
	email = db.StringProperty()


class Plan(db.Model):
	dep =  db.StringProperty(indexed=True)
	dest =  db.StringProperty(indexed=True)
	cruise =  db.StringProperty(indexed=True)
	route = db.StringProperty()
	comment =  db.StringProperty(multiline=True)
	xml =  db.TextProperty()

	date_created = db.DateTimeProperty(indexed=True, auto_now_add=True)
	author = db.ReferenceProperty(Crew)
	date_updated = db.DateTimeProperty(indexed=True, auto_now_add=True)
	#author = db.ReferenceProperty(Crew)
	