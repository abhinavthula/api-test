// This module uses 'with', so it can't be strict

function __exec(value, context) {
	'use strict'
	var key, r
	if (typeof value === 'string') {
		return __eval(value, context)
	} else {
		r = Object.create(null)
		for (key in value) {
			r[key] = __exec(value[key], context)
		}
		return r
	}
}

function __eval(__str, __context) {
	with(__context) {
		return eval(__str)
	}
}

module.exports = __exec