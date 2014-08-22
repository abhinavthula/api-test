'use strict'

var should = require('should'),
	types = [String, Number, Boolean, Object, Array]

/**
 * @param {*} actual
 * @param {*} expected
 * @param {boolean} strict
 */
module.exports = function (actual, expected, strict) {
	var key

	if (types.indexOf(expected) !== -1) {
		// Simple type check
		should(actual).be.a[expected.name]
	} else if (Array.isArray(expected)) {
		// Check every array element
		should(actual).be.an.Array
		if (strict) {
			should(actual).have.length(expected.length)
		} else {
			should(actual).have.property('length').above(expected.length - 1)
		}
		expected.forEach(function (each, i) {
			module.exports(actual[i], each, strict)
		})
	} else if (expected &&
		typeof expected === 'object' &&
		(expected.constructor === Object || Object.getPrototypeOf(expected) === null)) {
		// Hash map
		should(actual).be.an.Object
		for (key in expected) {
			should(actual).have.property(key)
			module.exports(actual[key], expected[key], strict)
		}
		if (strict) {
			for (key in actual) {
				should(expected).have.property(key)
			}
		}
	} else {
		// Simple value check
		should(actual).be.eql(expected)
	}
}