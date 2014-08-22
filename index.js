/*globals describe, before, it*/
'use strict'

var parse = require('./parse'),
	fs = require('fs'),
	path = require('path'),
	MongoClient = require('mongodb').MongoClient,
	baseContext = require('./baseContext'),
	parseUrl = require('url').parse,
	crypto = require('crypto')

/**
 * Execute the tests described by *.md files in a given folder
 * @param {string} file The folder path
 * @param {object} options an object with optional keys:
 * - mongoUri
 * - describe, before, it (default: mocha globals)
 * - baseUrl
 * - context (default: {})
 * - recursive (default: false)
 * - strict (default: true)
 */
module.exports = function (folder, options) {
	options.mongoUri = validateMongoUri(options.mongoUri)

	// Prepare options
	options.describe = options.describe || describe
	options.before = options.before || before
	options.it = options.it || it
	options.context = options.context || {}
	options.context.__proto__ = baseContext
	options.recursive = options.recursive || false
	options.strict = options.strict === undefined ? true : options.strict

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
		walk(options.recursive, folder, function (file) {
			if (file.substr(-3) === '.md') {
				parse(fs.readFileSync(file, 'utf8')).execute(options)
			}
		})
	})
}

/**
 * Make sure the mongo uri has 'localhost' as hostname and 'test' in the DB name
 * @param {string} mongoUri
 */
function validateMongoUri(mongoUri) {
	var tag, rightTag, sha
	if (mongoUri.match(/^![a-z0-9]{10}!/)) {
		// Extract tag
		tag = mongoUri.substr(1, 10)
		mongoUri = mongoUri.substr(12)
	}

	if (mongoUri.indexOf('test') === -1 || parseUrl(mongoUri).hostname !== 'localhost') {
		// Propably an error, we force the mongoUri to be localhost and the DB/username to be test
		sha = crypto.createHash('sha1')
		sha.end(new Buffer(mongoUri))
		rightTag = sha.read().toString('hex').substr(0, 10)
	}

	// Compare tags
	if (tag !== rightTag) {
		console.log('++++++++++')
		if (rightTag) {
			console.log('The mongoUri "' + mongoUri + '" seems not be test-safe')
			console.log('I recommend you to connect to a localhost instance and a database with "test" in the name')
			console.log('Remember that the database is DROPPED before every test!')
			console.log('If you are really sure, please append "!' + rightTag + '!" to your mongoUri')
		} else {
			console.log('Please remove the !tag! from the mongoUri to run the test')
		}
		console.log('++++++++++')
		throw new Error('Invalid protection tag')
	}
	return mongoUri
}

/**
 * Call a function for each file in a given directory
 * @param {boolean} recursive
 * @param {string} dir
 * @param {Function} fn
 */
function walk(recursive, dir, fn) {
	fs.readdirSync(dir).forEach(function (item) {
		item = path.join(dir, item)
		if (fs.statSync(item).isDirectory()) {
			if (recursive) {
				walk(recursive, item, fn)
			}
		} else {
			fn(item)
		}
	})
}