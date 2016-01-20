'use strict'

/**
 * Represents a var declaration
 * @class
 * @param {string} name
 * @param {test-spec:Value} value
 */
function Declaration(name, value) {
	/** @member {string} */
	this.name = name

	/** @member {test-spec:Value} */
	this.value = value
}

/**
 * Declare and define the variable in the context
 * @param {Object} db (not used)
 * @param {Object} context
 * @param {Function} done
 */
Declaration.prototype.execute = function (db, context, done) {
	context[this.name] = this.value.run(context)
	done()
}

module.exports = Declaration