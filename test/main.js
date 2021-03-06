/*globals before*/
'use strict'

var test = require('../')

before(function () {
	// Start the API
	this.timeout(10e3)
	require('./api')
})

test('test/api-test', {
	mongoUri: 'mongodb://localhost:27017/api_test',
	baseUrl: 'http://localhost:8000/',
	recursive: true,
	defaultDocuments: {
		users: {
			isActive: true
		}
	}
})