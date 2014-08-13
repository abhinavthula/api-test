'use strict'

/**
 * @class
 * @property {string} name
 * @property {string} collection
 * @property {Object} value
 */
function Doc(name, collection, value) {
	this.name = name
	this.collection = collection
	this.value = value
}

module.exports = Doc