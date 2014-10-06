'use strict'

var async = require('async')

/**
 * @class
 */
function Test() {
	/** @member {string} */
	this.name = ''

	/** @member {boolean} */
	this.skip = false

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
 * @param {Object} options
 * @param {Object} options.db
 * @param {Function} options.describe
 * @param {Function} options.before
 * @param {Function} options.it
 * @param {string} options.baseUrl
 * @param {Object} options.context
 * @param {boolean} options.strict
 * @param {string[]} options.ignoredFindKeys
 * @param {function(Test,Insertion|Clear|Declaration)} [options.onSetup]
 * @param {function(Test,Case)} [options.onCase]
 * @param {function(Case,*)} [options.onPost]
 * @param {function(Case,*)} [options.onOut]
 * @param {function(Case,Find)} [options.onFind]
 */
Test.prototype.execute = function (options) {
	var that = this,
		describe = this.skip ? options.describe.skip : options.describe
	describe(this.name, function () {
		// DB setup
		options.before(function (done) {
			// Insert each document
			async.eachSeries(that.setups, function (setup, done) {
				if (options.onSetup) {
					options.onSetup(that, setup)
				}
				setup.execute(options.db, options.context, done)
			}, done)
		})

		that.cases.forEach(function (testCase) {
			if (options.onCase) {
				options.onCase(that, testCase)
			}
			testCase.execute(options, that.name)
		})
	})
}

module.exports = Test