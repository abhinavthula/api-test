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
 * @param {string[]} cleared
 * @param {Object} context
 * @param {Function} done
 */
Clear.prototype.execute = function (db, cleared, context, done) {
	if (cleared.indexOf(this.collection) !== -1) {
		return done(new Error('The collection ' + this.collection + ' was already cleared'))
	}
	cleared.push(this.collection)

	db.collection(this.collection).remove({}, {
		w: 1
	}, done)
}

module.exports = Clear