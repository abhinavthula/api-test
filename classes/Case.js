'use strict'

var request = require('request'),
	execute = require('../execute'),
	check = require('../check'),
	async = require('async')

/**
 * @class
 * @property {string} name
 * @property {Object} post
 * @property {Object} out
 * @property {number} statusCode
 * @property {Find[]} finds
 */
function Case(name, post, out, statusCode) {
	this.name = name
	this.post = post
	this.out = out
	this.statusCode = statusCode
	this.finds = []
}

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