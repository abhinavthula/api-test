/**
 * @file Define many util functions for eval'd code
 */
'use strict'

var crypto = require('crypto')

module.exports = {
	randomId: function () {
		return crypto.pseudoRandomBytes(12).toString('hex')
	}
}