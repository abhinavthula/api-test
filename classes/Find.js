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
			var t1, t16, t18

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
			} else if (value === Number) {
				// Since there are 3 BSON types for a number, we need a hack here
				// use $and with $or for each of those types
				if (!('$and' in r)) {
					r.$and = []
				}
				prefix = prefix.substr(0, prefix.length - 1)
				t1 = {}
				t16 = {}
				t18 = {}
				t1[prefix] = {
					$type: 1
				}
				t16[prefix] = {
					$type: 16
				}
				t18[prefix] = {
					$type: 18
				}

				r.$and.push({
					$or: [t1, t16, t18]
				})
			} else {
				// Simple value
				if (value === String) {
					value = {
						$type: 2
					}
				} else if (value === Boolean) {
					value = {
						$type: 8
					}
				} else if (value === Date) {
					value = {
						$type: 9
					}
				} else if (value === RegExp) {
					value = {
						$type: 11
					}
				}

				r[prefix.substr(0, prefix.length - 1)] = value
			}
		}

	flatValue(value, '')
	return r
}

module.exports = Find