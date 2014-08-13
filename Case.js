'use strict'

/**
 * @class
 * @property {string} name
 * @property {Object} in
 * @property {Object} out
 */
function Case(name, _in, out) {
	this.name = name
	this.in = _in
	this.out = out
}

module.exports = Case