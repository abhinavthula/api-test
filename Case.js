'use strict'

var request = require('request'),
	execute = require('./execute'),
	check = require('./check')

/**
 * @class
 * @property {string} name
 * @property {Object} post
 * @property {Object} out
 * @property {Find[]} finds
 */
function Case(name, post, out) {
	this.name = name
	this.post = post
	this.out = out
	this.finds = []
}

Case.prototype.execute = function (url, context, done) {
	var json = execute(this.post, context),
		that = this
	request({
		url: url,
		method: 'POST',
		json: json
	}, function (err, res, body) {
		if (err) {
			return done(err)
		}
		res.statusCode.should.be.equal(200)
		check(body, execute(that.out, context))
		context.prev = {
			post: json,
			out: body
		}
		done()
	})
}

module.exports = Case