/**
 * @file Execute a given parsed test
 */
'use strict'

/**
 * Run a given test case
 * @param {Test} test the parsed test case
 * @param {object} mongoose a mongoose connection
 * @param {function} describe
 * @param {function} before
 * @param {function} it
 */
module.exports = function (test, mongoose, describe, before, it) {
	describe(test.name, function () {
		before(function () {

		})

		test.cases.forEach(function (testCase) {
			it(testCase.name, function () {

			})
		})
	})
}