'use strict'

/**
 * @class
 * @property {string} collection
 * @property {Object} value
 */
function Find(collection, value) {
	this.collection = collection
	this.value = value
}

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