'use strict'

var Clear = require('./Clear')

/**
 * Represents a DB insertion
 * @class
 * @property {string} name
 * @property {string} collection
 * @property {Object} value
 */
function Insertion(name, collection, value) {
	this.name = name
	this.collection = collection
	this.value = value
}

/**
 * Insert the object in the db
 * @param {Object} db the mongodb connected db
 * @param {string[]} cleared
 * @param {Object} context
 * @param {Function} done
 */
Insertion.prototype.execute = function (db, cleared, context, done) {
	var that = this

	if (cleared.indexOf(this.collection) === -1) {
		// Clear the collection first
		return new Clear(this.collection).execute(db, cleared, context, function (err) {
			if (err) {
				return done(err)
			}
			that.execute(db, cleared, context, done)
		})
	}

	// Prepare the document
	context[that.name] = this.value.execute(context, '<' + this.name + ' in ' + this.collection + '>')
	db.collection(this.collection).insert(context[that.name], {
		w: 1
	}, done)
}

module.exports = Insertion