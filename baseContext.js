/**
 * @file Define many util functions for eval'd code
 */
'use strict'

var crypto = require('crypto')

module.exports = {
	randomId: function () {
		return crypto.pseudoRandomBytes(12).toString('hex')
	},
	randomStr: function (len) {
		len = len || 7
		return crypto.pseudoRandomBytes(Math.ceil(len * 3 / 4)).toString('base64').substr(0, len)
	},
	empty: {}
}