'use strict'

/**
 * @class
 * @param {string} line must start with '#'
 * @param {number} sourceLine
 */
function Header(line, sourceLine) {
	/** @member {number} */
	this.level = line.match(/^#+/)[0].length
	/** @member {string} */
	this.value = line.substr(this.level).trim()
	/**
	 * @member {Object}
	 * @property {number} begin
	 * @property {number} end
	 */
	this.source = {
		begin: sourceLine,
		end: sourceLine + 1
	}
}
module.exports = Header