'use strict'

var execute = require('./execute')

/**
 * Represents either a DB insertion or clearing
 * @class
 * @property {string} name empty string if it's a clear command
 * @property {string} collection
 * @property {Object} [value]
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
		return db.collection(this.collection).remove({}, {
			w: 1
		}, function (err) {
			if (err) {
				return done(err)
			}
			cleared.push(that.collection)
			if (that.name) {
				that.execute(db, cleared, context, done)
			} else {
				done()
			}
		})
	} else if (!this.name) {
		done(new Error('The collection ' + this.collection + ' was already cleared'))
	}

	// Prepare the document
	context[that.name] = execute(this.value, context)
	db.collection(this.collection).insert(context[that.name], {
		w: 1
	}, done)
}

module.exports = Insertion