'use strict'

var _eval = require('../_eval')

/**
 * @class
 */
function Mixin() {
	this.additions = []
	this.removals = []
}

/**
 * The base path components
 * @property {string[]}
 */
Mixin.prototype.base

/**
 * @property {{path:string[],value:string}[]}
 */
Mixin.prototype.additions

/**
 * @property {string[][]}
 */
Mixin.prototype.removals


/**
 * Execute and return the result for the parsed Mixin
 * @param {Object} context
 * @param {string} name A string like '<' + description + '>' to be part of a thrown execption
 * @returns {*}
 * @throws if not parsed
 */
Mixin.prototype.execute = function (context, name) {
	var base, i

	// Execute base
	base = _eval(this.base[0], context, name)
	for (i = 1; i < this.base.length; i++) {
		if (!base || typeof base !== 'object') {
			throw new Error('Expected ' + this.base.slice(0, i).join('.') + ' to be a non-null object in ' + name)
		}
		base = base[this.base[i]]
	}
	base = copyDeep(base)

	// Apply modifications
	this.removals.forEach(function (path) {
		remove(base, path)
	})
	this.additions.forEach(function (addition) {
		var value = _eval(addition.value, context, name + '<with ' + addition.path.join('.') + '>')
		add(base, value, addition.path)
	})

	return base
}

/**
 * @param {*} x
 * @returns {*}
 */
function copyDeep(x) {
	var r, key
	if (Array.isArray(x)) {
		return x.map(copyDeep)
	} else if (x && typeof x === 'object' &&
		(x.constructor === Object || !Object.getPrototypeOf(x))) {
		// Map
		r = Object.create(null)
		for (key in x) {
			r[key] = copyDeep(x[key])
		}
		return r
	} else {
		return x
	}
}

/**
 * Remove a path from an object
 * @param {Object} obj
 * @param {(string|number)[]} path
 * @param {number} [i]
 * @throws
 * @private
 */
function remove(obj, path, i) {
	i = i || 0

	var key = path[i],
		last = i === path.length - 1

	if (!obj || typeof obj !== 'object') {
		throw new Error('Can\'t remove key ' + key + ' from non-object')
	}

	if (Array.isArray(obj)) {
		if (typeof key !== 'number') {
			obj.forEach(function (each) {
				remove(each, path, i)
			})
		} else if (key >= 0 && key < obj.length) {
			if (last) {
				obj.splice(key, 1)
			} else {
				remove(obj[key], path, i + 1)
			}
		} else {
			throw new Error('Can\'t remove index ' + key + ' from an array with ' + obj.length + ' elements')
		}
	} else {
		if (typeof key !== 'string') {
			throw new Error('Can\'t remove the numeric key ' + key + ' from an object')
		} else if (key in obj) {
			if (last) {
				delete obj[key]
			} else {
				remove(obj[key], path, i + 1)
			}
		} else {
			throw new Error('Can\'t remove key ' + key + ' from the object')
		}
	}
}

/**
 * Add/update a path off an object
 * @param {!Object} obj
 * @param {(string|number)[]} path
 * @param {*} value
 * @param {number} [i]
 * @throws
 * @private
 */
function add(obj, value, path, i) {
	i = i || 0

	var key = path[i],
		last = i === path.length - 1

	if (!obj || typeof obj !== 'object') {
		throw new Error('Can\'t remove key ' + key + ' from non-object')
	}

	if (Array.isArray(obj)) {
		if (typeof key !== 'number') {
			obj.forEach(function (each) {
				add(each, value, path, i)
			})
		} else if (key >= 0 && key <= obj.length) {
			if (last) {
				obj[key] = value
			} else {
				add(obj[key], value, path, i + 1)
			}
		} else {
			throw new Error('Can\'t add index ' + key + ' to an array with ' + obj.length + ' elements')
		}
	} else {
		if (typeof key !== 'string') {
			throw new Error('Can\'t add the numeric key ' + key + ' to an object')
		} else {
			if (last) {
				obj[key] = value
			} else {
				add(obj[key], value, path, i + 1)
			}
		}
	}
}

module.exports = Mixin