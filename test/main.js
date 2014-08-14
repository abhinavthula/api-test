'use strict'

var test = require('../')

test('test/api-test', {
	mongoUri: 'mongodb://localhost:27017/api_test',
	baseUrl: 'http://localhost:8000/'
})