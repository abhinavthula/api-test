'use strict'

/**
 * @class
 * @property {string} name
 * @property {Object.<String, Doc[]>} inserts documents to insert by model name
 * @property {Case[]} cases
 */
function Test() {
	this.name = ''
	this.inserts = Object.create(null)
	this.cases = []
}

module.exports = Test