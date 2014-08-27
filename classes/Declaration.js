'use strict'

/**
 * Represents a var declaration
 * @class
 * @param {string} name
 * @param {Obj} value
 */
function Declaration(name, value) {
	/** @member {string} */
	this.name = name
	/** @member {Obj} */
	this.value = value
}

/**
 * Declare and define the variable in the context
 * @param {Object} db (not used)
 * @param {Object} context
 * @param {Function} done
 */
Declaration.prototype.execute = function (db, context, done) {
	context[this.name] = this.value.execute(context, '<' + this.name + ' is>')
	done()
}

module.exports = Declaration