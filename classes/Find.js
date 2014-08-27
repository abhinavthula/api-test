'use strict'

/**
 * @class
 * @property {string} collection
 * @property {Obj} value
 */
function Find(collection, value) {
	/** @member {string} */
	this.collection = collection
	/** @member {Obj} */
	this.value = value
}

/**
 * @param {Object} context
 * @param {Object} db
 * @param {Function} done
 */
Find.prototype.execute = function (context, db, done) {
	var selector = this.value.execute(context, '<find in ' + this.collection + '>'),
		that = this
	db.collection(this.collection).findOne(selector, function (err, doc) {
		if (err) {
			return done(err)
		} else if (!doc) {
			return done(new Error('No document like ' + JSON.stringify(selector) + ' found in ' + that.collection))
		}
		done()
	})
}

module.exports = Find