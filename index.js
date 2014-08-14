/*globals describe, before, it*/
'use strict'

var parse = require('./parse'),
	run = require('./run'),
	fs = require('fs'),
	path = require('path'),
	MongoClient = require('mongodb').MongoClient,
	baseContext = require('./baseContext')

/**
 * Execute the tests described by *.md files in a given folder
 * @param {string} file The folder path
 * @param {object} options an object with optional keys:
 * - mongoUri
 * - describe, before, it (default: mocha globals)
 * - baseUrl
 * - context (default: {})
 */
module.exports = function (folder, options) {
	// Prepare options
	options.describe = options.describe || describe
	options.before = options.before || before
	options.it = options.it || it
	options.context = options.context || {}
	options.context.__proto__ = baseContext

	options.describe('api', function () {
		options.before(function (done) {
			// Connect to mongo
			MongoClient.connect(options.mongoUri, function (err, db) {
				if (err) {
					return done(err)
				}
				options.db = db
				done()
			})
		})

		// Load files
		fs.readdirSync(folder).forEach(function (item) {
			if (item.substr(-3) === '.md') {
				addFile(path.join(folder, item), options)
			}
		})
	})
}

function addFile(file, options) {
	run(parse(fs.readFileSync(file, 'utf8')), options)
}