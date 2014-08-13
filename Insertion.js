'use strict'

var execute = require('./execute')

/**
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
		return db.collection(this.collection).drop(function (err) {
			if (err) {
				return done(err)
			}
			cleared.push(that.collection)
			that.execute(db, cleared, context, done)
		})
	}

	// Prepare the document
	var doc = execute(this.value, context)
	db.collection(this.collection).insert(doc, {
		w: 1
	}, function (err, doc) {
		if (err) {
			return done(err)
		}

		// Save
		context[that.name] = doc
		done()
	})
}

module.exports = Insertion