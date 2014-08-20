'use strict'

var request = require('request'),
	execute = require('../execute'),
	check = require('../check'),
	async = require('async')

/**
 * @class
 */
function Case() {
	this.finds = []
}

/**
 * @property {string}
 */
Case.prototype.name

/**
 * @property {Obj}
 */
Case.prototype.post

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

Case.prototype.execute = function (url, context, db, done) {
	var post = execute(this.post, context, '<post>'),
		that = this
	context.post = post
	request({
		url: url,
		method: 'POST',
		json: post
	}, function (err, res, out) {
		if (err) {
			return done(err)
		}
		context.out = out

		res.statusCode.should.be.equal(that.statusCode)
		check(out, execute(that.out, context, '<out>'))
		async.each(that.finds, function (find, done) {
			find.execute(context, db, done)
		}, done)
	})
}

module.exports = Case