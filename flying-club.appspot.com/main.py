# -*- coding: utf-8 -*-

import os
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

import conf

import app.MainHandler
import app.RpcHandler

application = webapp.WSGIApplication([	('/rpc/(.*)/(.*)/', 	app.RpcHandler.RpcHandler),
										('/rpc/(.*)/', 			app.RpcHandler.RpcHandler),
										('/(.*)/(.*)/', 		app.MainHandler.MainHandler),
										('/(.*)/', 				app.MainHandler.MainHandler),
										('/', 					app.MainHandler.MainHandler),
										
									],
									debug=conf.DEBUG)


if __name__ == "__main__":
	run_wsgi_app(application)