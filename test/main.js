/*globals describe, before, it*/
'use strict'

var parse = require('../parse'),
	run = require('../run'),
	fs = require('fs'),
	mongoose = require('mongoose')

mongoose.model('Item', new mongoose.Schema({
	category: mongoose.Schema.Types.ObjectId,
	basicInfo: mongoose.Schema.Types.Mixed,
	choicesFlow: mongoose.Schema.Types.ObjectId,
	image: String,
	price: Number,
	available: Boolean,
	enterpriseItem: mongoose.Schema.Types.ObjectId
}), 'Item')

describe('api', function () {
	mongoose.connect('mongodb://localhost:27017/store_test')
	var test = parse(fs.readFileSync('./test/item-get.md', 'utf8'))
	run(test, mongoose.connection, describe, before, it, 'http://localhost:8000/api/')
})