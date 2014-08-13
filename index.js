'use strict'

var parse = require('./parse'),
	run = require('./run'),
	fs = require('fs')

var test = parse(fs.readFileSync('./examples/item-get.md', 'utf8'))

console.log(JSON.stringify(test, null, '  '))

/**
 * Execute the test described by a file
 * @param {string} file The file path
 * @param {object} options an object with optional keys:
 * - mongoose: a mongoose connection object
 * -
 */
module.exports = function (file, options) {}