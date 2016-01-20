'use strict'

/**
 * Represents a DB clearing
 * @class
 * @property {string} collection
 */
function Clear(collection) {
	this.collection = collection
}

/**
 * Clear the collection
 * @param {Object} db the mongodb connected db
 * @param {Object} context
 * @param {Function} done
 */
Clear.prototype.execute = function (db, context, done) {
	db.collection(this.collection).remove({}, {
		w: 1
	}, done)
}

module.exports = Clear