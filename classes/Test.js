'use strict'

var async = require('async')

/**
 * @class
 */
function Test() {
	/** @member {string} */
	this.name = ''
	/** @member {Array<Insertion|Clear|Declaration>} */
	this.setups = []
	/** @member {Case[]} */
	this.cases = []
	/**
	 * A map with used collections and the element that has cleared it
	 * @member {Object<Header>}
	 */
	this.collections = Object.create(null)
}

/**
 * Run the test
 * @param {Object} options an object with keys db, describe, before, it, baseUrl, context, strict
 */
Test.prototype.execute = function (options) {
	var that = this
	options.describe(this.name, function () {
		// DB setup
		options.before(function (done) {
			// Insert each document
			async.eachSeries(that.setups, function (setup, done) {
				setup.execute(options.db, options.context, done)
			}, done)
		})

		that.cases.forEach(function (testCase) {
			testCase.execute(options, that.name)
		})
	})
}

module.exports = Test