'use strict'

var stringify = require('../stringify'),
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
		collection = options.db.collection(this.collection)

	if ('_id' in target) {
		this._executeWithId(target, collection, options, done)
	} else {
		this._executeWithoutId(target, collection, options, done)
	}
}

Find.prototype._executeWithId = function (target, collection, options, done) {
	var that = this
	collection.findOne({
		_id: target._id
	}, function (err, doc) {
		if (err) {
			return done(err)
		}

		try {
			check(doc, target, options.strict, false, options.ignoredFindKeys)
		} catch (e) {
			console.log('\n-----\n' +
				'\x1b[1;32mDocument with id ' + target._id + ' in ' + that.collection + ':\x1b[0m\n' +
				stringify(doc, true, e.path) + '\n' +
				'\x1b[1;32mTarget document:\x1b[0m\n' +
				stringify(target, true, e.path) + '\n' +
				'-----\n')
			return done(new Error('Document mismatch in ' + that.collection))
		}

		done()
	})
}

Find.prototype._executeWithoutId = function (target, collection, options, done) {
	var that = this
	collection.find().toArray(function (err, docs) {
		var errorPaths = [],
			found

		if (err) {
			return done(err)
		}

		found = docs.some(function (doc) {
			try {
				check(doc, target, options.strict, false, options.ignoredFindKeys)
				return true
			} catch (e) {
				errorPaths.push(e.path)
				return false
			}
		})

		if (!found) {
			console.log('\n-----\n' +
				'\x1b[1;32mDocuments in ' + that.collection + ':\x1b[0m\n' +
				docs.map(function (doc, i) {
					return stringify(doc, true, errorPaths[i])
				}).join('\n---\n') + '\n' +
				'\x1b[1;32mTarget document:\x1b[0m\n' +
				stringify(target, true) + '\n' +
				'-----\n')
			return done(new Error('No document found in ' + that.collection))
		}

		done()
	})
}

module.exports = Find