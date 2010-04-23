# -*- coding: utf-8 -*-

import time
import datetime
from google.appengine.ext import webapp
from django.utils import simplejson as json
from google.appengine.ext import db
from google.appengine.api import mail
from BeautifulSoup.BeautifulSoup import BeautifulSoup

import conf
from app.models import FPp, Comment, Plan

from data.airports import airports


class RpcHandler(webapp.RequestHandler):


	def get_schedule(self):
		lst = []
		entries = db.GqlQuery("select * from FPp order by dep_date asc")
		for e in entries:
			lst.append({	'callsign': e.callsign, 'fppID': str(e.key()),
						'comment': e.comment,
						'dep': e.dep, 'dep_date': e.dep_date.strftime(conf.MYSQL_DATETIME), 'dep_atc': e.dep_atc,
						'arr': e.arr, 'arr_date': e.arr_date.strftime(conf.MYSQL_DATETIME), 'arr_atc': e.arr_atc
			})
		return lst


	def get_date(self, dt, tt):
		return datetime.datetime.strptime( '%s %s:00' % (dt, tt) , conf.MYSQL_DATETIME)

	def get_timeline(self):
		reply = {}
		SECS_IN_HOUR = 60 * 60 
		
		################### current, start and end dates
		n = datetime.datetime.utcnow()
		curr_ts = time.mktime((n.year, n.month, n.day, n.hour, 0, 0, 0, 0, 0))
		curr_dt = datetime.datetime.fromtimestamp(curr_ts)
		reply['current_date'] = curr_dt.strftime(conf.MYSQL_DATETIME)

		start_ts = curr_ts - SECS_IN_HOUR
		start_dt = datetime.datetime.fromtimestamp(start_ts)
		reply['start_date'] = start_dt.strftime(conf.MYSQL_DATETIME)

		end_ts = curr_ts + (SECS_IN_HOUR * 26)
		end_dt = datetime.datetime.fromtimestamp(end_ts)
		reply['end_date'] = end_dt.strftime(conf.MYSQL_DATETIME)

		########################## Cols
		col_no = 0
		cols = {}
		reverse = {}
		rev_ki = "%d_%H"
		for c in range(-1, 26):
			col_time = datetime.datetime.fromtimestamp(curr_ts + (SECS_IN_HOUR * c))
			ki = "col_%s" % col_no
			cols[ki] =  str(int(col_time.strftime("%H")))
			reverse[col_time.strftime(rev_ki)] = ki
			col_no += 1
		reply['cols'] = cols

		####################### Rows
		rows = []
		rowsX = {}
		q = FPp.all()
		#q.filter('dep_date >=', tod)
		q.order('dep_date');
		scheds = q.fetch(100)
		rows = []
		for e in scheds:
			cols = []

			## Departure
			if reverse.has_key( e.dep_date.strftime(rev_ki)):
				cols.append({	'col_ki': reverse[e.dep_date.strftime(rev_ki)],
								'time': e.dep_date.strftime("%M"), 
								'mode': 'dep'
				})

			## Arrival
			if reverse.has_key( e.arr_date.strftime(rev_ki) ):
				cols.append({	'col_ki': reverse[e.arr_date.strftime(rev_ki)],
								'time': e.arr_date.strftime("%M"), 
								'mode': 'dep'
				})

			## loop the middle
			loop_ts = time.mktime((e.dep_date.year, e.dep_date.month, e.dep_date.day, e.dep_date.hour, 0, 0, 0, 0, 0)) + SECS_IN_HOUR
			last_ts = time.mktime((e.arr_date.year, e.arr_date.month, e.arr_date.day, e.arr_date.hour, 0, 0, 0, 0, 0)) 
			hr =  0
			while loop_ts < last_ts:
				loop_time = datetime.datetime.fromtimestamp(loop_ts )
				if reverse.has_key(loop_time.strftime(rev_ki)):
					cols.append({'col_ki': reverse[loop_time.strftime(rev_ki)],
							'time': loop_time.strftime("%M"), 'mode': 'mid'
					})
				loop_ts = loop_ts + SECS_IN_HOUR 
			
			data = {'callsign': e.callsign, 'cols': cols, 'dep': e.dep, 'arr': e.arr, 'fppID': str(e.key())}
			rows.append(data)
		reply['rows'] = rows
		return reply


	def get(self, section, page=None):
		self.post(section, page)

	def post(self, section, page=None):
	
		reply = {'success': True }

		########################################################
		### Index
		


		########################################################
		### TimeLIne
		if section == 'timeline':
			reply['timeline'] = self.get_timeline()



		########################################################
		### Requests

		elif section == 'requests':
			reply['requests'] = self.get_schedule()
		
		elif section == 'request':

			### Fetch Request
			if page == 'fetch':
				fppID = self.request.get("fppID")
				if not fppID:
					reply['error'] = 'No fppID'

				else:
					if fppID == '0':
						t = time.time()
						d = datetime.datetime.fromtimestamp(t - t % (60 *15) )
						dic = {	'callsign':  self.request.cookies['sessIdent'] , 
								'email': '',
								'dep': '',
								'dep_date': d.strftime(conf.MYSQL_DATETIME),
								'dep_atc': '',
								'arr': '',
								'arr_date': '',
								'arr_atc': '',
								'comment': '',
								'fppID': '0'
						}

					else:
						f = db.get( db.Key(fppID) )
						dic = {	'callsign': f.callsign, 
								'email': 'email',
								'dep': f.dep,
								'dep_date': f.dep_date.strftime(conf.MYSQL_DATETIME),
								'dep_atc': f.dep_atc,
								'arr': f.arr,
								'arr_date': f.arr_date.strftime(conf.MYSQL_DATETIME),
								'arr_atc': f.arr_atc,
								'comment': f.comment,
								'fppID': str(f.key()),
						}
					reply['fpp'] = dic

			###################
			### Edit Request
			elif page == 'edit':
				fppID = self.request.get("fppID")
				if not fppID:
					reply['error'] = 'No fppID'
				else:
					callsign = self.request.get("callsign")
					if fppID == '0':
						fp = FPp(callsign = callsign)
						subject = 'New FP: %s' % callsign
					else:
						subject = 'Edit FP: %s' % callsign
						fp = db.get( db.Key(fppID) )
						fp.cookie = self.request.cookies['sessID'] 
						fp.callsign = callsign
					fp.dep = self.request.get("dep")
					fp.dep_date = self.get_date(self.request.get("dep_date"), self.request.get("dep_time"))
					
					fp.dep_atc = self.request.get("dep_atc")

					fp.arr = self.request.get("arr")
					fp.arr_date = self.get_date(self.request.get("arr_date"), self.request.get("arr_time"))
					fp.arr_atc = self.request.get("arr_atc")

					fp.comment = self.request.get("comment")
					fp.email = self.request.get("email")
					fp.put()
					reply['fppID'] = str(fp.key())
					mail.send_mail(	sender = conf.EMAIL,
										to = "Dev <dev@freeflightsim.org>",
										subject = subject,
										body = "Fp edited"
					)	
			###################
			### Delete Request
			elif page == 'delete':
				fppID = self.request.get("fppID")
				if not fppID:
					reply['error'] = 'No fppID'
				fp = db.get( db.Key(fppID) )
				fp.delete()


		########################################################
		### Crew
		elif section == 'crew':
			if 'sessID' in self.request.cookies:
				sessID  = self.request.cookies['sessID'] 
			
			if page == 'edit':
					crew = db.get( db.Key(sessID) )
					crew.name = self.request.get('name')
					crew.email = self.request.get('email')

					crew.callsign = self.request.get('callsign')
					crew.cvs = self.request.get('cvs')
					crew.irc = self.request.get('irc')
					crew.forum = self.request.get('forum')
					crew.wiki = self.request.get('wiki')

					crew.pilot = False if self.request.get('pilot') == '' else True
					crew.atc = False if self.request.get('atc') == '' else True
					crew.fgcom = False if self.request.get('fgcom') == '' else True
					crew.location = self.request.get('location')
					crew.put()
					reply['crew+saved'] = True
					cook_str = 'sessIdent=%s; expires=Fri, 31-Dec-2020 23:59:59 GMT; Path=/;'	% crew.callsign
					self.response.headers.add_header(	'Set-Cookie', 
														cook_str
					)
			else:
				crew = db.get( db.Key(sessID) )
				reply['crew'] = [{'name': crew.name, 'email': crew.email, 'callsign': crew.callsign,
								 'cvs': crew.cvs, 'forum': crew.forum, 'irc': crew.irc, 'wiki': crew.wiki,
								'pilot': crew.pilot, 'atc': crew.atc, 'fgcom': crew.fgcom, 
								'date_created': crew.date_created.strftime(conf.MYSQL_DATETIME),
								'location': crew.location, 'ident': crew.ident
								}]




		########################################################
		### Airpots
		elif section == 'airports':
			
			search = self.request.get("search")
			reply['airports'] = []
			if not search:
				pass
			else:
				search = search.upper()
				reply['search'] = search
				for icao in airports:
					ss = icao + ' ' + airports[icao]
					if ss.upper().find(search) > -1:
						reply['airports'].append({'icao': icao, 'airport': airports[icao]})

		########################################################
		###  Plans
		elif section == 'plans':
			col_len = -1
			q = Plan.all()
			plans = q.fetch(1000)
			ret = []
			for p in plans:
				route = json.loads(p.route)
				ret.append({'dep': p.dep, 'dest': p.dest, 'cruise': p.cruise, 'route': route, 'planID': str(p.key())})
				if len(route) > col_len:
					col_len = len(route)
			reply['plans'] = ret
			reply['col_len'] = col_len

		elif section == 'plan':	
			planID = '0'
			if page == 'edit':
				xml_str = self.request.get("xml")
				if planID == '0':
					
					data = self.parse_plan_xml(xml_str)
					
					plan = Plan()
					plan.xml = xml_str
					plan.dep = data['dep']
					plan.dest = data['dest']
					plan.route = json.dumps(data['route'])
					plan.put()
					reply['planID'] = str(plan.key())
					




		########################################################
		### Return Data
		ret_type =  self.request.get('retDataType')
		if ret_type:
			if ret_type == 'schedule':
				reply['schedule'] = self.get_schedule()
			if ret_type == 'timeline':
				reply['timeline'] = self.get_timeline()


		########################################################
		### Send
		self.response.headers.add_header('Content-Type','text/plain')
		self.response.out.write(json.dumps(reply))




	def parse_plan_xml(self, xml_str):
		if not xml_str:
			return None
		xml_str = xml_str.strip()
		soup = BeautifulSoup(xml_str)
		dic = {}
		dic['dep'] = soup.departure.airport.text
		dic['dest'] = soup.destination.airport.text
		dic['cruise'] = soup.cruise.findAll("altitude-ft")[0].text
		dic['route'] = []
		wp = soup.route.findAll("wp")
		for w in wp:
			dic['route'].append({'ident': w.ident.text})

		#print dic
		return dic
		