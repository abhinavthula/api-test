// This module uses 'with', so it can't be strict

/**
 * Eval the given value in the given context
 * @param {(Object|string)} value
 * @param {Object} context
 * @param {string} path A string like '<' + description + '>' to be part of a thrown execption
 * @returns {*}
 * @throws
 */
module.exports = function (value, context, path) {
	'use strict'
	var key, r
	path = path || ''
	if (typeof value === 'string') {
		return __eval(value, context, path)
	} else {
		r = Object.create(null)
		for (key in value) {
			r[key] = module.exports(value[key], context, path + '.' + key)
		}
		return r
	}
}

function __eval(__str, __context, __path) {
	try {
		with(__context) {
			return eval(__str)
		}
	} catch (e) {
		e.message += ' in ' + __path
		throw e
	}
}