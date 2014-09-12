'use strict'

var should = require('should'),
	ObjectID = require('mongodb').ObjectID,
	types = [String, Number, Boolean, Object, Array, Date, RegExp, ObjectID]

/**
 * @param {*} actual
 * @param {*} expected
 * @param {boolean} strict
 * @param {string[]} [ignoredKeys=[]] only used if strict is true
 * @throws if invalid
 */
module.exports = function (actual, expected, strict, ignoredKeys) {
	var key

	if (types.indexOf(expected) !== -1) {
		// Simple type check
		should(actual).be.instanceof(expected)
	} else if (Array.isArray(expected)) {
		// Check every array element
		should(actual).be.an.Array
		if (strict) {
			should(actual).have.length(expected.length)
		} else {
			should(actual).have.property('length').above(expected.length - 1)
		}
		expected.forEach(function (each, i) {
			module.exports(actual[i], each, strict, ignoredKeys)
		})
	} else if (expected &&
		typeof expected === 'object' &&
		(expected.constructor === Object || Object.getPrototypeOf(expected) === null)) {
		// Hash map
		should(actual).be.an.Object
		for (key in expected) {
			should(actual).have.property(key)
			module.exports(actual[key], expected[key], strict, ignoredKeys)
		}
		if (strict) {
			ignoredKeys = ignoredKeys || []
			for (key in actual) {
				if (ignoredKeys.indexOf(key) === -1) {
					should(expected).have.property(key)
				}
			}
		}
	} else {
		// Simple value check
		should(actual).be.eql(expected)
	}
}