'use strict'

/**
 * @class
 * @property {string} name
 * @property {Setup[]} setups
 * @property {Case[]} cases
 */
function Test() {
	this.name = ''
	this.setups = []
	this.cases = []
}

module.exports = Test