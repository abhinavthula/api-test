/**
 * @file Parses simple markdown text
 *
 * The syntax is described using these notations:
 * * {x} represents a non-terminal symbol that can span more than one line
 * * <x> represents a one-line non-terminal symbol
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
 * {test} = '## ' _caseName_ / '### In' / {obj} / '### Out' / {obj}
 *
 * {insertion} = '### ' _model_ _docName_ / {obj}
 * {obj} = '\t' ({subobj} | <prop>)
 *
 * {subobj} = _key_ / '\t' {obj}
 * <prop> = (_key_ ':' _value_) | (_key_ '~' _type_)
 *
 * Blank and paragraph text are ignored (they can be used for documentation)
 */
'use strict'

var Test = require('./Test'),
	Obj = require('./Obj'),
	Doc = require('./Doc'),
	Case = require('./Case')

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

			parseInsertion(test, lines[i], lines[i + 1])
			i += 2
		}
	}

	while (i < lines.length) {
		parseCase(test, lines[i], lines[i + 1], lines[i + 2], lines[i + 3], lines[i + 4])
		i += 5
	}

	return test
}

/**
 * Try to parse a DB insertion
 * @throws if the syntax is invalid
 */
function parseInsertion(test, line1, line2) {
	var match
	if (!checkHeader(line1, 3)) {
		throw new Error('The first line of a DB insertion must be "### _model_ _docName_"')
	} else if (!(line2 instanceof Obj)) {
		throw new Error('The second part of a DB insertion must be an {obj}')
	} else if (!(match = line1.value.match(/^([a-z_][a-z0-9_]*) ([a-z_][a-z0-9_]*)$/i))) {
		throw new Error('The first line of a DB insertion must be "### _model_ _docName_"')
	}

	if (!(match[1] in test.inserts)) {
		test.inserts[match[1]] = []
	}
	test.inserts[match[1]].push(new Doc(match[2], line2.toObject()))
}

/**
 * Try to parse a test case
 * @throws if the syntax is invalid
 */
function parseCase(test, line1, line2, line3, line4, line5) {
	if (!checkHeader(line1, 2)) {
		throw new Error('The first line of a test case must be "## _caseName_"')
	} else if (!checkHeader(line2, 3, 'In')) {
		throw new Error('The second line of a test case must be "### In"')
	} else if (!(line3 instanceof Obj)) {
		throw new Error('The third line of a test case must be an {obj}')
	} else if (!checkHeader(line4, 3, 'Out')) {
		throw new Error('The fourth line of a test case must be "### Out"')
	} else if (!(line5 instanceof Obj)) {
		throw new Error('The fifth line of a test case must be an {obj}')
	}

	test.cases.push(new Case(line1.value, line3.toObject(), line5.value))
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