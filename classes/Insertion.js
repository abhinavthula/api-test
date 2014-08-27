'use strict'

var Clear = require('./Clear')

/**
 * Represents a DB insertion
 * @class
 * @property {string} name
 * @property {string} collection
 * @property {Obj} value
 */
function Insertion(name, collection, value) {
	/** @member {string} */
	this.name = name
	/** @member {string} */
	this.collection = collection
	/** @member {Obj} */
	this.value = value
}

/**
 * Insert the object in the db
 * @param {Object} db the mongodb connected db
 * @param {Object} context
 * @param {Function} done
 */
Insertion.prototype.execute = function (db, context, done) {
	var that = this

	// Prepare the document
	context[that.name] = this.value.execute(context, '<' + this.name + ' in ' + this.collection + '>')
	db.collection(this.collection).insert(context[that.name], {
		w: 1
	}, done)
}

module.exports = Insertion