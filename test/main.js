/*globals describe, before, it*/
'use strict'

var parse = require('../parse'),
	run = require('../run'),
	fs = require('fs')

describe('api', function () {
	var test = parse(fs.readFileSync('./test/item-get.md', 'utf8'))
	run(test, null, describe, before, it)
})