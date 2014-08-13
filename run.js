/**
 * @file Execute a given parsed test
 */
'use strict'

var async = require('async'),
	baseContext = require('./utils'),
	request = require('request'),
	execute = require('./execute')

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
				var model = mongoose.model(modelName)

				async.series([
					getClear(model),
					getInsert(model, test.inserts[modelName], context)
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
				}, function (err, _, body) {
					console.log(err, body)
					done()
				})
			})
		})
	})
}

function getClear(model) {
	return function (done) {
		model.remove({}, done)
	}
}

function getInsert(model, docs, context) {
	return function (done) {
		model.create(docs.map(function (doc) {
			return (context[doc.name] = execute(doc.value, context))
		}), function (err) {
			if (err) {
				return done(err)
			}
			var i
			for (i = 0; i < docs.length; i++) {
				context[docs[i].name] = arguments[i + 1]
			}
			done()
		})
	}
}