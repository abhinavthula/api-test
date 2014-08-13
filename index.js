'use strict'

var parse = require('./parse'),
	fs = require('fs')

parse(fs.readFileSync('./examples/item-get.md', 'utf8'))