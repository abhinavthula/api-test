'use strict'

/**
 * Represents a var declaration
 * @class
 * @property {string} name
 * @property {Object} value
 */
function Declaration(name, value) {
	this.name = name
	this.value = value
}

/**
 * Declare and define the variable in the context
 * @param {Object} db (not used)
 * @param {string[]} cleared (not used)
 * @param {Object} context
 * @param {Function} done
 */
Declaration.prototype.execute = function (db, cleared, context, done) {
	context[this.name] = this.value.execute(context, '<' + this.name + ' is>')
	done()
}

module.exports = Declaration