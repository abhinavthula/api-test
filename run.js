/**
 * @file Execute a given parsed test
 */
'use strict'

require('should')

var async = require('async'),
	baseContext = require('./utils'),
	request = require('request'),
	execute = require('./execute'),
	check = require('./check')

/**
 * Run a given test case
 * @param {Test} test the parsed test case
 * @param {object} mongoose a mongoose connection
 * @param {function} describe
 * @param {function} before
 * @param {function} it
 */
module.exports = function (test, mongoose, describe, before, it, baseUrl, context) {
	context = context || {}
	context.__proto__ = baseContext

	describe(test.name, function () {
		// DB fixup
		before(function (done) {
			async.each(Object.keys(test.inserts), function (modelName, done) {
				// Clear and insert
				var Model = mongoose.model(modelName)

				async.series([
					getClear(Model),
					getInsert(Model, test.inserts[modelName], context)
				], done)
			}, done)
		})

		test.cases.forEach(function (testCase) {
			it(testCase.name, function (done) {
				var json = execute(testCase.in, context)
				console.log(json)
				request({
					url: baseUrl + test.name,
					method: 'POST',
					json: json
				}, function (err, res, body) {
					if (err) {
						return done(err)
					}
					res.statusCode.should.be.equal(200)
					console.log(body)
					check(body, testCase.out, context)
					done()
				})
			})
		})
	})
}

function getClear(Model) {
	return function (done) {
		Model.remove({}, done)
	}
}

function getInsert(Model, docs, context) {
	return function (done) {
		docs = docs.map(function (doc) {
			// Create each document
			return (context[doc.name] = new Model(execute(doc.value, context)))
		})
		async.each(docs, function (doc, done) {
			doc.save(done)
		}, done)
	}
}