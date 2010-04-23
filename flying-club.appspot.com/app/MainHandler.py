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



class MainHandler(webapp.RequestHandler):


	def do_cookie_check(self):
		if 'sessID' in self.request.cookies:
			return  self.request.cookies['sessID'] 
		else:
			return None

	###################################################################################################
	## Get Actions
	###################################################################################################
	def get(self, section=None, page=None):
	
		sessID = self.do_cookie_check()



		template_vars = {}
		template_vars['conf'] = conf
		template_vars['user'] = None
		template_vars['sessID'] = sessID
		if 'sessIdent' in self.request.cookies:
			sessIdent =  self.request.cookies['sessIdent'] 
		else:
			sessIdent = None

		## Setup Section and Page
		if section == None:
			section = "index"
		template_vars['section'] = section
		template_vars['page'] = page
		

		## Get Comments
		q = db.GqlQuery("SELECT * FROM Comment " +
						"WHERE section = :1  " +
						"ORDER BY dated DESC",
						section)
		results =  q.fetch(50)
		template_vars['comments'] = results

		## Application Object
		Appo = app.FlyingClub.FlyingClub()
		template_vars['appo'] = Appo
		template_vars['page_title'] = Appo.title("/%s/" % section)


		## Setup User + Aauth
		#user = users.get_current_user()
		#if not user:
		#	template_vars['user'] = None
		#	template_vars['login_url'] = users.create_login_url("/set_session/")		
		#else:
		#	template_vars['user'] = user
		#	template_vars['logout_url'] = users.create_logout_url("/subscribe/")

	
		## Sign In Section
		if section == 'signin' :
			if sessID:
				self.redirect("/profile/")
				return 
			template_vars['page_title'] = 'Sign In with OpenId'

		if section == 'do_logout':
				cook_str = 'sessID=%s; expires=Fri, 31-Dec-1980 23:59:59 GMT; Path=/;'	% ''
				self.response.headers.add_header(	'Set-Cookie', 
													cook_str
				)
				self.redirect("/")
				return


		if section == 'profile':
			if not sessID:
				self.redirect("/signin/")
				return
			template_vars['welcome'] = True if self.request.get("welcome") == '1' else False
			template_vars['page_title'] = 'My Profile'
	

		main_template = '%s.html' % (section)
		path = '/%s/' % (section)
		template_vars['path'] = path
	

		template_path = os.path.join(os.path.dirname(__file__), '../templates/pages/%s' % main_template)
		self.response.out.write(template.render(template_path, template_vars))



	###################################################################################################
	## Post Actions
	###################################################################################################
	def post(self, section=None, page=None):

		action = self.request.get('action')
		if action:

			## Add Comment
			if action == 'add_comment':
				comment = self.request.get("comment")
				if comment != "":
					
					user = users.get_current_user()
					section = self.request.get("section")
					comm = app.models.Comment(comment=comment, section=section)
					if user:
						comm.author = user
					comm.put()
					mail.send_mail(	sender = conf.EMAIL,
									to = "Dev <dev@freeflightsim.org>",
									subject = "Comment on: %s" % section,
									body = comment
					)
					self.redirect("/%s/" % section)
					return
		self.response.out.write(section)
		if section == 'auth':

			token = self.request.get('token')
			url = 'https://rpxnow.com/api/v2/auth_info'
			args = {
				'format': 'json',
				'apiKey': conf.RPX_API_KEY,
				'token': token
			}

			r = urlfetch.fetch(	url=url,
								payload=urllib.urlencode(args),
								method=urlfetch.POST,
								headers={'Content-Type':'application/x-www-form-urlencoded'}
			)
			data = json.loads(r.content)

			if data['stat'] == 'ok':   
				welcome = 0
				unique_identifier = data['profile']['identifier']
				
				q = db.GqlQuery("select * from Crew where ident= :1", unique_identifier)
				crew = q.get()
				if not crew:
					crew = Crew(ident=unique_identifier)
					crew.name = data['profile']['preferredUsername']
					if data['profile'].has_key('email'):
						crew.email = data['profile']['email']
					crew.put()
					welcome = 1
					subject = "New Login: %s" % crew.name
					body = "New login on schedule"
				else:
					subject = "Return Login: %s" % crew.name
					body = "New login on schedule"		

				sessID = str(crew.key())
				cook_str = 'sessID=%s; expires=Fri, 31-Dec-2020 23:59:59 GMT; Path=/;'	% sessID
				self.response.headers.add_header(	'Set-Cookie', 
													cook_str
				)
				mail.send_mail(	sender = conf.EMAIL,
									to = "Dev <dev@freeflightsim.org>",
									subject = subject,
									body = body
				)		
				self.redirect("/profile/?welcome=%s" % welcome)
				return	
		else:
			print "foo"
		#self.redirect("/")
				













