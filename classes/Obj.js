'use strict'

/**
 * @class
 * @param {number} sourceLine
 */
function Obj(sourceLine) {
	this.lines = []
	this.source = {
		begin: sourceLine,
		end: sourceLine
	}
}

/**
 * Add one more line as the source of the Obj
 * @param {string} line must start with '\t'
 */
Obj.prototype.push = function (line) {
	this.lines.push(line.substr(1))
	this.source.end++
}

Obj.prototype.parse = function () {
	return this
}

Obj.prototype.execute = function () {
	return null
}

Obj.empty = new Obj(0)
Obj.empty.parse()

module.exports = Obj