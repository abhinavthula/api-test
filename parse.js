/**
 * @file Parses simple markdown text
 *
 * The syntax is described using these notations:
 * * {x} represents a non-terminal symbol that can span more than one line
 * * <x> represents an one-line non-terminal symbol
 * * / represents a line-break
 * * _x_ represents an arbritary text field
 * * 'x' represents the literal x
 * * x? means optional
 * * x+ means at least once
 * * x* means any number of times
 * * x|y means either x or y
 * * [D] means a digit
 *
 * {file} = <header> / {setup}? / {test}+
 *
 * <header> = '# ' _testName_
 * {setup} = '## Setup' / ({insertion} | {clear} | {declaration})*
 * {test} = '## ' _caseName_ / ('### Post' / {obj})? / {out}? / {find}*
 *
 * {insertion} = '### ' _docName_ ' in ' _collection_ / {obj}
 * {clear} = '### Clear ' _collection_
 * {declaration} = '### ' _varName_ ' is' / {obj}
 * {obj} = '\t' (_value_ | {subobj} | <prop>)
 * {out} = '### Out' (' ' <statusCode>)? / {obj}
 * {find} = '### Find in ' _collection_ / {obj}
 *
 * {subobj} = _key_ ':' / '\t' {obj}
 * <prop> = _key_ ':' _value_
 * <statusCode> = [D] [D] [D]
 *
 * Paragraph text is ignored (it can be used for documentation)
 */
'use strict'

var Test = require('./Test'),
	Obj = require('./Obj'),
	Insertion = require('./Insertion'),
	Clear = require('./Clear'),
	Declaration = require('./Declaration'),
	Case = require('./Case'),
	Find = require('./Find')

/**
 * @param {string} text
 * @returns {Test}
 * @throws if the syntax is invalid
 */
module.exports = function (text) {
	// Each element is an object 
	var lines = [],
		originalLines = text.split(/\r?\n/),
		test = new Test,
		i, line

	try {
		// Lexical parsing (put tokens into lines array)
		for (i = 0; i < originalLines.length; i++) {
			line = originalLines[i]
			if (line[0] === '#') {
				// Header line
				lines.push(new Header(line, i))
			} else if (line[0] === '\t') {
				// Object line
				if (!(lines[lines.length - 1] instanceof Obj)) {
					lines.push(new Obj(i))
				}
				lines[lines.length - 1].push(line)
			}
		}
	} catch (e) {
		// Add source code info
		e.message += getSourceContext(originalLines, i)
		throw e
	}

	// Syntax parsing (parse tokens from lines array)
	i = 0

	// Header
	i = parseHeader(test, lines, i, originalLines)

	// Setup
	if (checkHeader(lines[i], 2, 'Setup')) {
		i++
		while (i < lines.length && !checkHeader(lines[i], 2)) {
			i = parseSetupItem(test, lines, i, originalLines)
		}
	}

	while (i < lines.length) {
		i = parseCase(test, lines, i, originalLines)
	}

	return test
}

/**
 * Try to parse the test header
 * @throws if the syntax is invalid
 */
function parseHeader(test, lines, i, originalLines) {
	if (!checkHeader(lines[i], 1)) {
		throwSyntaxError('Expected a header', lines[i], originalLines)
	}
	test.name = lines[i].value
	return i + 1
}

/**
 * Try to parse a DB insertion/clear or variable declaration
 * @throws if the syntax is invalid
 */
function parseSetupItem(test, lines, i, originalLines) {
	var match
	if (!checkHeader(lines[i], 3)) {
		throwSyntaxError('Expected "### ..."', lines[i], originalLines)
	}

	if ((match = lines[i].value.match(/^Clear ([a-z_$][a-z0-9_$]*)$/))) {
		test.setups.push(new Clear(match[1]))
		return i + 1
	} else if ((match = lines[i].value.match(/^([a-z_$][a-z0-9_$]*) is/i))) {
		if (!(lines[i + 1] instanceof Obj)) {
			throwSyntaxError('Expected an {obj}', lines[i + 1], originalLines)
		}
		test.setups.push(new Declaration(match[1], lines[i + 1].value))
		return i + 2
	} else if ((match = lines[i].value.match(/^([a-z_$][a-z0-9_$]*) in ([a-z_$][a-z0-9_$]*)$/i))) {
		if (!(lines[i + 1] instanceof Obj)) {
			throwSyntaxError('Expected an {obj}', lines[i + 1], originalLines)
		}
		test.setups.push(new Insertion(match[1], match[2], lines[i + 1].value))
		return i + 2
	} else {
		throwSyntaxError('Expected either "### _docName_ in _collection_", "### Clear _collection_" or "### _varName_ is"', lines[i], originalLines)
	}
}

/**
 * Try to parse a test case
 * @throws if the syntax is invalid
 */
function parseCase(test, lines, i, originalLines) {
	var name, post, out, statusCode

	// Test case name
	if (!checkHeader(lines[i], 2)) {
		throwSyntaxError('Expected "## _caseName_"', lines[i], originalLines)
	}
	name = lines[i].value
	i++

	// Post
	if (checkHeader(lines[i], 3, 'Post')) {
		if (!(lines[i + 1] instanceof Obj)) {
			throwSyntaxError('Expected an {obj}', lines[i + 1], originalLines)
		}
		post = lines[i + 1].value
		i += 2
	} else {
		post = {}
	}

	// Out
	if (checkHeader(lines[i], 3) && lines[i].value.match(/^Out( \d{3})?$/)) {
		if (!(lines[i + 1] instanceof Obj)) {
			throwSyntaxError('Expected an {obj}', lines[i + 1], originalLines)
		}
		out = lines[i + 1].value
		statusCode = lines[i].value === 'Out' ? 200 : Number(lines[i].value.substr(4))
		i += 2
	} else {
		out = {}
		statusCode = 200
	}

	var testCase = new Case(name, post, out, statusCode)
	test.cases.push(testCase)

	// Finds
	while (i < lines.length && !checkHeader(lines[i], 2)) {
		if (!checkHeader(lines[i], 3) || lines[i].value.indexOf('Find in ') !== 0) {
			throwSyntaxError('Expected "### Find in _collection_"', lines[i], originalLines)
		} else if (!(lines[i + 1] instanceof Obj)) {
			throwSyntaxError('Expected an {obj}', lines[i + 1], originalLines)
		}
		testCase.finds.push(new Find(lines[i].value.substr(8).trim(), lines[i + 1].value))
		i += 2
	}

	return i
}

/**
 * Check if the given value is a Header with the given level and value
 * @param {*} x
 * @param {number} level
 * @param {string} [value]
 * @returns {boolean}
 */
function checkHeader(x, level, value) {
	return x instanceof Header && x.level === level && (!value || x.value === value)
}

/**
 * @class
 * @param {string} line must start with '#'
 * @param {number} sourceLine
 */
function Header(line, sourceLine) {
	this.level = line.match(/^#+/)[0].length
	this.value = line.substr(this.level).trim()
	this.source = {
		begin: sourceLine,
		end: sourceLine + 1
	}
}

/**
 * @param {string[]} originalLines
 * @param {number} start
 * @param {number} [end=start+1]
 * @param {number} [context=3]
 * @returns {string}
 */
function getSourceContext(originalLines, start, end, context) {
	end = end || start + 1
	context = context || 3

	var i, str = '\n\n-----'
	for (i = Math.max(0, start - context); i < end + context && i < originalLines.length; i++) {
		str += '\n' + (i >= start && i < end ? '>' : ' ') + ' ' + originalLines[i]
	}
	return str + '\n-----'
}

/**
 * @param {string} msg
 * @param {(Header|Obj)} token
 * @param {string[]} originalLines
 * @throws
 */
function throwSyntaxError(msg, token, originalLines) {
	throw new Error(msg + getSourceContext(originalLines, token.source.begin, token.source.end))
}