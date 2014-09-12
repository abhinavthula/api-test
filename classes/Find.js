'use strict'

var stringify = require('../stringify'),
	ObjectID = require('mongodb').ObjectID,
	check = require('../check')

/**
 * @class
 * @property {string} collection
 * @property {Obj} value
 */
function Find(collection, value) {
	/** @member {string} */
	this.collection = collection
	/** @member {Obj} */
	this.value = value
}

/**
 * @param {Object} options
 * @param {Object} options.db
 * @param {Object} options.context
 * @param {boolean} options.strict
 * @param {string[]} options.ignoredFindKeys
 * @param {Function} done
 */
Find.prototype.execute = function (options, done) {
	var target = this.value.execute(options.context, '<find in ' + this.collection + '>'),
		that = this,
		collection = options.db.collection(this.collection)

	collection.find().toArray(function (err, docs) {
		var found

		if (err) {
			return done(err)
		}

		found = docs.some(function (doc) {
			try {
				check(doc, target, options.strict, options.ignoredFindKeys)
				return true
			} catch (e) {
				return false
			}
		})

		if (!found) {
			console.log('\n-----\n' +
				'\x1b[1;32mDocuments in ' + that.collection + ':\x1b[0m\n' +
				docs.map(function (doc) {
					return stringify(doc, true)
				}).join('\n---') + '\n' +
				'\x1b[1;32mTarget document:\x1b[0m\n' +
				stringify(target, true) + '\n' +
				'-----\n')
			return done(new Error('No document found in ' + that.collection))
		}

		done()
	})
}

module.exports = Find