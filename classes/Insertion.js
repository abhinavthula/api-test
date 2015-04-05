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
	var that = this,
		value

	// Prepare the document
	value = this.value.execute(context, '<' + this.name + ' in ' + this.collection + '>')
	if (context.defaultDocuments[this.collection]) {
		setDefaults(value, context.defaultDocuments[this.collection])
	}

	context[that.name] = copyDeep(value)
	db.collection(this.collection).insert(context[that.name], {
		w: 1
	}, done)
}

module.exports = Insertion

/**
 * @param {*} x
 * @returns {*}
 * @private
 */
function copyDeep(x) {
	var r, key
	if (Array.isArray(x)) {
		return x.map(copyDeep)
	} else if (isObject(x)) {
		// Map
		r = Object.create(null)
		for (key in x) {
			r[key] = copyDeep(x[key])
		}
		return r
	} else {
		return x
	}
}

/**
 * @param {Object} value
 * @param {Object} defaults
 */
function setDefaults(value, defaults) {
	var key

	for (key in defaults) {
		if (!(key in value)) {
			// Not present, simply set
			// No need to copyDeep here because it will be done after
			// setDefaults returns
			value[key] = defaults[key]
		} else if (isObject(value[key]) && isObject(defaults[key])) {
			// Recurse
			setDefaults(value[key], defaults[key])
		}
	}
}

/**
 * @param {*} x
 * @returns {boolean}
 */
function isObject(x) {
	return x && typeof x === 'object' && (x.constructor === Object || !Object.getPrototypeOf(x))
}