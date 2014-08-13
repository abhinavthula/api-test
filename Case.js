'use strict'

/**
 * @class
 * @property {string} name
 * @property {Obj} post
 * @property {Obj} out
 * @property {Find[]} finds
 */
function Case(name, post, out) {
	this.name = name
	this.post = post
	this.out = out
	this.finds = []
}

module.exports = Case