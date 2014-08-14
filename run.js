/**
 * @file Execute a given parsed test
 */
'use strict'

require('should')

var async = require('async'),
	baseContext = require('./utils'),
	MongoClient = require('mongodb').MongoClient

/**
 * Run a given test case
 * @param {Test} test the parsed test case
 * @param {string} mongoUri
 * @param {function} describe
 * @param {function} before
 * @param {function} it
 */
module.exports = function (test, mongoUri, describe, before, it, baseUrl, context) {
	context = context || {}
	context.__proto__ = baseContext

	describe(test.name, function () {
		// DB fixup
		before(function (done) {
			// Connect
			MongoClient.connect(mongoUri, function (err, db) {
				if (err) {
					return done(err)
				}

				// Insert each document
				var cleared = []
				async.eachSeries(test.insertions, function (insertion, done) {
					insertion.execute(db, cleared, context, done)
				}, done)
			})
		})

		test.cases.forEach(function (testCase) {
			it(testCase.name, function (done) {
				testCase.execute(baseUrl + test.name, context, done)
			})
		})
	})
}