/**
 * @file Parses simple markdown text
 *
 * The syntax is described in doc-syntax.md
 *
 * Paragraph text is ignored (it can be used for documentation)
 */
'use strict'

var Test = require('./classes/Test'),
	Header = require('./classes/Header'),
	Obj = require('./classes/Obj'),
	Insertion = require('./classes/Insertion'),
	Clear = require('./classes/Clear'),
	Declaration = require('./classes/Declaration'),
	Case = require('./classes/Case'),
	Find = require('./classes/Find'),
	ParseError = require('./classes/ParseError')

/**
 * @param {string} text
 * @param {function(Array<Header|Obj>, Test)} preParse
 * @returns {Test}
 * @throws if the syntax is invalid
 */
module.exports = function (text, preParse) {
	var originalLines, i, line, els, lastObj, test

	// First pass: break into lines
	originalLines = text.split(/\r?\n/)

	// Second pass: parse headers and group object lines
	els = []
	for (i = 0; i < originalLines.length; i++) {
		line = originalLines[i]
		if (line[0] === '#') {
			// Header line
			els.push(new Header(line, i))
			lastObj = null
		} else if (line[0] === '\t') {
			// Object line
			if (!lastObj) {
				lastObj = new Obj(i)
				els.push(lastObj)
			}
			lastObj.push(line.substr(1))
		} else {
			// Ignored line
			lastObj = null
		}
	}

	// Third pass: extract main sections (header, setup, test cases)
	// Also recursively parse their content
	test = new Test
	try {
		preParse(els, test)
		i = parseHeader(test, els, 0)
		i = parseSetups(test, els, i)
		i = parseCases(test, els, i)
	} catch (e) {
		if (e instanceof ParseError) {
			e.logSourceContext(originalLines)
		}
		throw e
	}

	return test
}

/**
 * Try to parse the test header
 * @param {Test} test
 * @param {Object[]} els
 * @param {number} i
 * @returns {number}
 * @throws if the syntax is invalid
 */
function parseHeader(test, els, i) {
	if (!checkHeader(els[i], 1)) {
		throw new ParseError('Expected a header', els[i])
	}
	if (/ \(skip\)$/.test(els[i].value)) {
		test.name = els[i].value.substr(0, els[i].value.length - 7).trimRight()
		test.skip = true
	} else {
		test.name = els[i].value
		test.skip = false
	}
	return i + 1
}

/**
 * Try to parse the setup section
 * @param {Test} test
 * @param {Object[]} els
 * @param {number} i
 * @returns {number}
 * @throws if the syntax is invalid
 */
function parseSetups(test, els, i) {
	var i2

	// Skip everything up to the 'Setup' header
	for (; i < els.length; i++) {
		if (checkHeader(els[i], 2, 'Setup')) {
			break
		}
	}

	if (i === els.length) {
		throw new ParseError('Test cases must follow a "## Setup" header')
	}

	i++
	while ((i2 = parseSetupItem(test, els, i))) {
		i = i2
	}
	return i
}

/**
 * Try to parse the test cases
 * @param {Test} test
 * @param {Object[]} els
 * @param {number} i
 * @returns {number}
 * @throws if the syntax is invalid
 */
function parseCases(test, els, i) {
	while (i < els.length) {
		i = parseCase(test, els, i)
	}
	return i
}

/**
 * Try to parse a DB insertion/clear or variable declaration
 * @param {Test} test
 * @param {Object[]} els
 * @param {number} i
 * @returns {number} 0 if there is no more setup item to parse
 * @throws if the syntax is invalid
 */
function parseSetupItem(test, els, i) {
	var match, header, coll, el, msg

	if (i >= els.length || checkHeader(els[i], 2)) {
		// Out of setup section
		return 0
	} else if (!checkHeader(els[i], 3)) {
		throw new ParseError('Expected "### ..."', els[i])
	}

	header = els[i].value
	if ((match = header.match(/^Clear ([a-zA-Z_$][a-zA-Z0-9_$]*)$/))) {
		// Clear a collection
		coll = match[1]
		if (coll in test.collections) {
			el = test.collections[coll]
			if (el.value.indexOf('Clear ') === 0) {
				msg = 'No need to clear the same collection twice'
			} else {
				msg = 'Clearing the collection after insertion is not a good idea'
			}
			throw new ParseError(msg, el, els[i])
		}
		test.collections[coll] = els[i]
		test.setups.push(new Clear(coll))
		return i + 1
	} else if ((match = header.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*) is$/))) {
		// Declare a variable
		if (!(els[i + 1] instanceof Obj)) {
			throw new ParseError('Expected an {obj}', els[i + 1])
		}
		test.setups.push(new Declaration(match[1], els[i + 1].parse()))
		return i + 2
	} else if ((match = header.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*) in ([a-zA-Z_$][a-zA-Z0-9_$]*)$/))) {
		// Insert a document (clear the collection implicitly)
		if (!(els[i + 1] instanceof Obj)) {
			throw new ParseError('Expected an {obj}', els[i + 1])
		}
		coll = match[2]
		if (!(coll in test.collections)) {
			// Push implicit clear
			test.collections[coll] = els[i]
			test.setups.push(new Clear(coll))
		} else if (test.collections[coll].value.indexOf('Clear ') === 0) {
			el = test.collections[coll]
			throw new ParseError('No need to clear the collection before insertion, this is done automatically for you', el, els[i])
		}
		test.setups.push(new Insertion(match[1], coll, els[i + 1].parse()))
		return i + 2
	} else {
		throw new ParseError('Expected either "### _docName_ in _collection_", "### Clear _collection_" or "### _varName_ is"', els[i])
	}
}

/**
 * Try to parse a test case
 * @param {Test} test
 * @param {Object[]} els
 * @param {number} i
 * @returns {number}
 * @throws if the syntax is invalid
 */
function parseCase(test, els, i) {
	var testCase = new Case

	// Test case name
	if (!checkHeader(els[i], 2)) {
		throw new ParseError('Expected "## _caseName_"', els[i])
	}
	if (/ \(skip\)$/.test(els[i].value)) {
		testCase.name = els[i].value.substr(0, els[i].value.length - 7).trimRight()
		testCase.skip = true
	} else {
		testCase.name = els[i].value
		testCase.skip = false
	}
	i++

	i = parseCasePost(testCase, els, i)
	i = parseCaseOut(testCase, els, i)
	i = parseCaseFinds(test.collections, testCase, els, i)

	test.cases.push(testCase)
	return i
}

/**
 * Try to parse a test case post
 * @param {Case} testCase
 * @param {Object[]} els
 * @param {number} i
 * @returns {number}
 * @throws if the syntax is invalid
 */
function parseCasePost(testCase, els, i) {
	if (checkHeader(els[i], 3, /^Post( |$)/)) {
		if (!(els[i + 1] instanceof Obj)) {
			throw new ParseError('Expected an {obj}', els[i + 1])
		}
		testCase.postUrl = els[i].value === 'Post' ? '' : els[i].value.substr(4).trim()
		testCase.post = els[i + 1].parse()
		i += 2
	} else {
		testCase.post = Obj.empty()
	}
	return i
}

/**
 * Try to parse a test case out
 * @param {Case} testCase
 * @param {Object[]} els
 * @param {number} i
 * @returns {number}
 * @throws if the syntax is invalid
 */
function parseCaseOut(testCase, els, i) {
	if (checkHeader(els[i], 3, /^Out( \d{3})?$/)) {
		if (!(els[i + 1] instanceof Obj)) {
			throw new ParseError('Expected an {obj}', els[i + 1])
		}
		testCase.out = els[i + 1].parse()
		testCase.statusCode = els[i].value === 'Out' ? 200 : Number(els[i].value.substr(4))
		i += 2
	} else {
		testCase.out = Obj.empty()
		testCase.statusCode = 200
	}
	return i
}

/**
 * Try to parse a test case finds
 * @param {Object<Header>} collections Cleared collections
 * @param {Case} testCase
 * @param {Object[]} els
 * @param {number} i
 * @returns {number}
 * @throws if the syntax is invalid
 */
function parseCaseFinds(collections, testCase, els, i) {
	var coll
	while (i < els.length && !checkHeader(els[i], 2)) {
		if (!checkHeader(els[i], 3) || els[i].value.indexOf('Find in ') !== 0) {
			throw new ParseError('Expected "### Find in _collection_"', els[i])
		} else if (!(els[i + 1] instanceof Obj)) {
			throw new ParseError('Expected an {obj}', els[i + 1])
		}
		coll = els[i].value.substr(8).trim()
		if (!(coll in collections)) {
			throw new ParseError('You can\'t do a find in a collection that wasn\'t cleared in the setup', els[i])
		}
		testCase.finds.push(new Find(coll, els[i + 1].parse()))
		i += 2
	}
	return i
}

/**
 * Check if the given value is a Header with the given level and value
 * @param {*} x
 * @param {number} level
 * @param {(string|RegExp)} [value] default: no value checking
 * @returns {boolean}
 */
function checkHeader(x, level, value) {
	if (!(x instanceof Header) || x.level !== level) {
		return false
	}
	if (value) {
		if (value instanceof RegExp) {
			return value.test(x.value)
		} else {
			return value === x.value
		}
	}
	return true
}