'use strict'

var request = require('request'),
	check = require('../check'),
	async = require('async')

/**
 * @class
 */
function Case() {
	this.finds = []
}

/**
 * @property {boolean}
 */
Case.prototype.skip

/**
 * @property {string}
 */
Case.prototype.name

/**
 * @property {Obj}
 */
Case.prototype.post

/**
 * @property {string}
 */
Case.prototype.postUrl

/**
 * @property {Obj}
 */
Case.prototype.out

/**
 * @property {number}
 */
Case.prototype.statusCode

/**
 * @property {Find[]}
 */
Case.prototype.finds

/**
 * Run the test case
 * @param {Object} options an object with keys db, it, url, context, strict
 * @param {string} testName
 */
Case.prototype.execute = function (options, testName) {
	var that = this,
		it = this.skip ? options.it.skip : options.it

	it(this.name, function (done) {
		// Prepare context
		options.context.prev = {
			post: options.context.post,
			out: options.context.out
		}
		delete options.context.post
		delete options.context.out

		var post = that.post.execute(options.context, '<post>')
		options.context.post = post

		request({
			url: options.baseUrl + (that.postUrl || testName),
			method: 'POST',
			json: post
		}, function (err, res, out) {
			if (err) {
				return done(err)
			}
			options.context.out = out

			res.statusCode.should.be.equal(that.statusCode)
			check(out, that.out.execute(options.context, '<out>'), options.strict)
			async.each(that.finds, function (find, done) {
				find.execute(options.context, options.db, done)
			}, done)
		})
	})
}

module.exports = Case