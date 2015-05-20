'use strict'

var should = require('should'),
	ObjectID = require('mongodb').ObjectID,
	types = [String, Number, Boolean, Object, Array, Date, RegExp, ObjectID]

/**
 * @param {*} actual
 * @param {*} expected
 * @param {boolean} strict
 * @param {string[]} [ignoredKeys=[]] only used if strict is true and only useful in the root level
 * @param {string} [path] used internally
 * @throws if invalid. The exception has a 'path' field with the path name that caused the error
 */
module.exports = function (actual, expected, strict, ignoredKeys, path) {
	var key, subpath

	try {
		// Call toJSON() if present
		if (actual !== null && actual !== undefined && typeof actual.toJSON === 'function') {
			actual = actual.toJSON()
		}
		if (expected !== null && expected !== undefined && typeof expected.toJSON === 'function') {
			expected = expected.toJSON()
		}	
		
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
			checkArray(actual, expected, expected.isOrdered, strict, ignoredKeys, path)
		} else if (expected &&
			typeof expected === 'object' &&
			(expected.constructor === Object || Object.getPrototypeOf(expected) === null)) {
			// Hash map
			should(actual).be.an.Object
			for (key in expected) {
				if (typeof expected[key] === 'function' && types.indexOf(expected[key]) === -1) {
					// Skip functions, like toJSON
					continue
				}
				should(actual).have.property(key)
				subpath = path ? path + '.' + key : key
				module.exports(actual[key], expected[key], strict, [], subpath)
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
	} catch (e) {
		if (!e.path) {
			e.path = path
		}
		throw e
	}
}

/**
 * @param {Array} actual
 * @param {Array} expected
 * @param {boolean} isOrdered
 * @param {boolean} strict
 * @param {Array<string>} ignoredKeys
 * @param {string} path
 * @throws if invalid. The exception has a 'path' field with the path name that caused the error
 */
function checkArray(actual, expected, isOrdered, strict, ignoredKeys, path) {
	if (isOrdered) {
		// Simple case: compare expected[i] with actual[i]
		expected.forEach(function (each, i) {
			module.exports(actual[i], each, strict, [], path ? path + '.' + i : i)
		})
		return
	}

	var visited = actual.map(function () {
		return false
	})
	expected.forEach(function (eachExpected) {
		var j
		for (j = 0; j < actual.length; j++) {
			if (visited[j]) {
				continue
			}

			try {
				module.exports(actual[j], eachExpected, strict, [], path ? path + '.' + j : j)
				visited[j] = true
				break
			} catch (e) {
				// Ignore these errors, we'll check next elements
			}
		}

		if (j === actual.length) {
			throw new Error('Unordered array mismatch')
		}
	})
}
