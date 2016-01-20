/**
 * @file Define many util functions for eval'd code
 */
'use strict'

let ObjectID = require('mongodb').ObjectID,
	baseTestSpecContext = require('@clubedaentrega/test-spec').baseContext,
	context = {
		__proto__: baseTestSpecContext
	}

/**
 * Generate a random mongo objectId
 * @returns {ObjectId}
 */
context.randomId = function () {
	return new ObjectID()
}

/**
 * MongoId constructor
 */
context.ObjectId = context.ObjectID = ObjectID

module.exports = context