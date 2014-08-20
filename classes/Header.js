'use strict'

/**
 * @class
 * @param {string} line must start with '#'
 * @param {number} sourceLine
 */
function Header(line, sourceLine) {
	this.level = line.match(/^#+/)[0].length
	this.value = line.substr(this.level).trim()
	this.source = {
		begin: sourceLine,
		end: sourceLine + 1
	}
}
module.exports = Header