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
 *
 * {file} = <header> / {fixup}? / {test}+
 *
 * <header> = '# ' _testName_
 * {fixup} = '## DB' / {insertion}*
 * {test} = '## ' _caseName_ / '### Post' / {obj} / '### Out' / {obj} / {find}*
 *
 * {insertion} = '### ' _docName_ ' in ' _collection_ / {obj}
 * {obj} = '\t' (_value_ | {subobj} | <prop>)
 * {find} = '### Find in ' _collection_ / {obj}
 *
 * {subobj} = _key_ ':' / '\t' {obj}
 * <prop> = _key_ ':' _value_
 *
 * Paragraph text is ignored (it can be used for documentation)
 */
'use strict'

var Test = require('./Test'),
	Obj = require('./Obj'),
	Insertion = require('./Insertion'),
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
		test = new Test,
		i

	// Tokenizer
	text.split(/\r?\n/).forEach(function (line) {
		if (line[0] === '#') {
			// Header line
			lines.push(new Header(line))
		} else if (line[0] === '\t') {
			// Object line
			if (!(lines[lines.length - 1] instanceof Obj)) {
				lines.push(new Obj(line))
			}
			lines[lines.length - 1].push(line)
		}
	})

	// Header
	if (!checkHeader(lines[0], 1)) {
		throw new Error('The first line must be a header')
	}
	test.name = lines[0].value

	// Fixup
	i = 2
	if (checkHeader(lines[1], 2, 'DB')) {
		while (i < lines.length) {
			if (checkHeader(lines[i], 2)) {
				break
			}

			i = parseInsertion(test, lines, i)
		}
	}

	while (i < lines.length) {
		i = parseCase(test, lines, i)
	}

	return test
}

/**
 * Try to parse a DB insertion
 * @throws if the syntax is invalid
 */
function parseInsertion(test, lines, i) {
	var match
	if (!checkHeader(lines[i], 3)) {
		throw new Error('The first line of a DB insertion must be "### _docName_ in _collection_"')
	} else if (!(lines[i + 1] instanceof Obj)) {
		throw new Error('The second part of a DB insertion must be an {obj}')
	} else if (!(match = lines[i].value.match(/^([a-z_$][a-z0-9_$]*) in ([a-z_$][a-z0-9_$]*)$/i))) {
		throw new Error('The first line of a DB insertion must be "### _docName_ in _collection_"')
	}

	test.insertions.push(new Insertion(match[1], match[2], lines[i + 1].value))

	return i + 2
}

/**
 * Try to parse a test case
 * @throws if the syntax is invalid
 */
function parseCase(test, lines, i) {
	if (!checkHeader(lines[i], 2)) {
		throw new Error('The first line of a test case must be "## _caseName_"')
	} else if (!checkHeader(lines[i + 1], 3, 'Post')) {
		throw new Error('The second line of a test case must be "### Post"')
	} else if (!(lines[i + 2] instanceof Obj)) {
		throw new Error('The third line of a test case must be an {obj}')
	} else if (!checkHeader(lines[i + 3], 3, 'Out')) {
		throw new Error('The fourth line of a test case must be "### Out"')
	} else if (!(lines[i + 4] instanceof Obj)) {
		throw new Error('The fifth line of a test case must be an {obj}')
	}

	var testCase = new Case(lines[i].value, lines[i + 2], lines[i + 4])
	test.cases.push(testCase)
	i += 5

	while (i < lines.length && !checkHeader(lines[i], 2)) {
		if (!checkHeader(lines[i], 3) || lines[i].value.indexOf('Find in ') !== 0) {
			throw new Error('The first line of a find must be "### Find in _collection_"')
		} else if (!(lines[i + 1] instanceof Obj)) {
			throw new Error('The second line of a find must be an {obj}')
		}
		testCase.finds.push(new Find(lines[i].value.substr(8).trim(), lines[i + 1]))
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
 */
function Header(line) {
	this.level = line.match(/^#+/)[0].length
	this.value = line.substr(this.level).trim()
}