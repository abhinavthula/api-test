/*globals describe, before, it*/
'use strict'

var parse = require('../parse'),
	run = require('../run'),
	fs = require('fs')

describe('api', function () {
	var test = parse(fs.readFileSync('./test/api-test/user-login.md', 'utf8'))
	run(test, 'mongodb://localhost:27017/api_test', describe, before, it, 'http://localhost:8000/')
	test = parse(fs.readFileSync('./test/api-test/user-signup.md', 'utf8'))
	run(test, 'mongodb://localhost:27017/api_test', describe, before, it, 'http://localhost:8000/')
})