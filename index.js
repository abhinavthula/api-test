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
 * @param {Object} options an object with optional keys:
 * @param {string} options.mongoUri
 * @param {string} options.baseUrl
 * @param {boolean} [options.recursive=false]
 * @param {boolean} [options.strict=true]
 * @param {Object} [options.context]
 * @param {string[]} [options.ignoredFindKeys=['_id', '__v']]
 * @param {function(string):boolean} [options.filterFile]
 * @param {function(Array<Header|Obj>, Test)} [options.preParse]
 * @param {function(Test)} [options.onTest]
 * @param {function(Test,Insertion|Clear|Declaration)} [options.onSetup]
 * @param {function(Test,Case)} [options.onCase]
 * @param {function(Case,*)} [options.onPost]
 * @param {function(Case,*)} [options.onOut]
 * @param {function(Case,Find)} [options.onFind]
 * @param {Function} [options.describe]
 * @param {Function} [options.before]
 * @param {Function} [options.it]
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
	options.filterFile = options.filterFile || function () {
		return true
	}
	options.preParse = options.preParse || function () {}
	options.ignoredFindKeys = options.ignoredFindKeys || ['_id', '__v']

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
			if (file.substr(-3) === '.md' && options.filterFile(file)) {
				var test = parse(fs.readFileSync(file, 'utf8'), options.preParse)
				if (options.onTest) {
					options.onTest(test)
				}
				test.execute(options)
			}
		})
	})
}

/**
 * @class
 */
module.exports.Header = require('./classes/Header')

/**
 * @class
 */
module.exports.Obj = require('./classes/Obj')

/**
 * @class
 */
module.exports.ParseError = require('./classes/ParseError')

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
			console.log('The mongoUri "' + mongoUri.substr(0, 17) + '..." seems not to be test-safe')
			console.log('I recommend you to connect to a localhost instance and a database with "test" in the name')
			console.log('Remember that the database is DROPPED before every test!')
			console.log('If you are really sure, please prepend "!' + rightTag + '!" to your mongoUri')
			console.log('Like this: "!' + rightTag + '!' + mongoUri.substr(0, 17) + '..."')
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