# -*- coding: utf-8 -*-
from google.appengine.ext import db

########################################################
## Crew Member
########################################################
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
	token = db.StringProperty()
	auth =db.BooleanProperty()

	def id(self):
		return str(self.key())

	def json(self, secure=False):
		dic= {
				'ident': self.ident,
				'name': self.name,  
				'callsign': self.callsign,
				'cvs': self.cvs, 
				'forum': self.forum, 
				'irc': self.irc, 
				'wiki': self.wiki,
				'pilot': self.pilot, 
				'atc': self.atc, 
				'fgcom': self.fgcom, 
				'date_created': crew.date_created.strftime(conf.MYSQL_DATETIME),
				'location': self.location
		}
		if secure:
			dic['email'] = self.email
		return dic




class Comment(db.Model):
	comment =  db.StringProperty(multiline=True)
	section = db.StringProperty(indexed=True)
	dated = db.DateTimeProperty(indexed=True, auto_now_add=True)
	author = db.UserProperty()



class Schedule(db.Model):
	pilot = db.ReferenceProperty(Crew)
	dep =  db.StringProperty(indexed=True)
	dep_date = db.DateTimeProperty(indexed=True)
	dep_atc =  db.StringProperty(indexed=True)
	arr =  db.StringProperty(indexed=True)
	arr_date = db.DateTimeProperty(indexed=True)
	arr_atc =  db.StringProperty(indexed=True)
	comment =  db.StringProperty(multiline=True)
	


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
	