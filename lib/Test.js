'use strict'

let async = require('async'),
	spec = require('@clubedaentrega/test-spec')

/**
 * Construct a test instance from a parsed test-spec
 * @param {string} path
 * @param {test-spec:Section} section
 * @class
 */
function Test(path, source, section) {
	/** @member {string} */
	this.path = path

	/** @member {string} */
	this.source = source

	/** @member {test-spec:Section} */
	this.section = section

	/** @member {string} */
	this.name = ''

	/** @member {boolean} */
	this.skip = false

	/** @member {Array<Insertion|Clear|Declaration>} */
	this.setups = []

	/** @member {Case[]} */
	this.cases = []

	/**
	 * The set of affected collections
	 * @member {Set<string>}
	 */
	this.collections = new Set

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
 * @param {Buffer} [options.ca]
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

/**
 * Throw a syntax error in the given block
 * @param {string} message
 * @param {test-spec:Section|test-spec:Text|test-spec:Value} [block]
 * @throws {SyntaxError}
 */
Test.prototype.throwSyntaxError = function (message, block) {
	let snippet = block ? spec.getSnippet(this.source, block.line, block.size || 1) : '',
		err = new SyntaxError(`${message}\n${snippet}\nIn ${this.path}`)
	throw err
}

module.exports = Test