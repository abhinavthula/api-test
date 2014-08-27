'use strict'

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
 * @param {Object} context
 * @param {Object} db
 * @param {Function} done
 */
Find.prototype.execute = function (context, db, done) {
	var selector = flat(this.value.execute(context, '<find in ' + this.collection + '>')),
		that = this

	db.collection(this.collection).findOne(selector, function (err, doc) {
		if (err) {
			return done(err)
		} else if (!doc) {
			return done(new Error('No document like ' + JSON.stringify(selector) + ' found in ' + that.collection))
		}
		done()
	})
}

/**
 * Make a value flat, so that mongo ignore subdoc key order
 * {a: {b: 2}} -> {'a.b': 2}
 * @param {Object} value
 * @returns {Object}
 * @private
 */
function flat(value) {
	var r = Object.create(null),
		flatValue = function (value, prefix) {
			if (Array.isArray(value)) {
				// Subarray
				value.forEach(function (each, i) {
					flatValue(each, prefix + i + '.')
				})
			} else if (value &&
				typeof value === 'object' &&
				(value.constructor === Object || Object.getPrototypeOf(value) === null)) {
				// Subdoc
				Object.keys(value).forEach(function (key) {
					flatValue(value[key], prefix + key + '.')
				})
			} else {
				// Simple value
				r[prefix.substr(0, prefix.length - 1)] = value
			}
		}

	flatValue(value, '')
	return r
}

module.exports = Find