/**
 * @file Execute a given parsed test
 */
'use strict'

var async = require('async')

/**
 * Run a given test case
 * @param {Test} test the parsed test case
 * @param {object} options an object with optional keys:
 * - describe, before, it
 * - baseUrl
 * - context
 * - db
 */
module.exports = function (test, options) {
	options.describe(test.name, function () {
		// DB fixup
		options.before(function (done) {
			// Insert each document
			var cleared = []
			async.eachSeries(test.insertions, function (insertion, done) {
				insertion.execute(options.db, cleared, options.context, done)
			}, done)
		})

		test.cases.forEach(function (testCase) {
			// Execute each test case	
			options.it(testCase.name, function (done) {
				options.context.prev = {
					post: options.context.post,
					out: options.context.out
				}
				testCase.execute(options.baseUrl + test.name, options.context, options.db, done)
			})
		})
	})
}