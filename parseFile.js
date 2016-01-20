'use strict'

let spec = require('@clubedaentrega/test-spec'),
	Test = require('./lib/Test'),
	Insertion = require('./lib/Insertion'),
	Clear = require('./lib/Clear'),
	Declaration = require('./lib/Declaration'),
	Case = require('./lib/Case'),
	Find = require('./lib/Find'),
	fs = require('fs')

/**
 * @param {string} path
 * @returns {Test}
 * @throws if the syntax is invalid
 */
module.exports = function (path) {
	let source = fs.readFileSync(path, 'utf8'),
		parsed

	try {
		// Parse and compile test spec syntax
		parsed = spec.parse(source)
		spec.compile(source, parsed)
	} catch (err) {
		err.message += `\nIn ${path}`
		throw err
	}

	// Check api-test semantics
	let test = new Test(path, source, parsed)
	if (parsed.name.endsWith(' (skip)')) {
		// Skipped test
		test.skip = true
		test.name = parsed.name.substr(0, parsed.name.length - 7)
	} else {
		test.name = parsed.name
	}

	// Parse setup section
	let setupSectionIndex = parsed.children.findIndex(child => {
		return child.type === 'section' && child.name === 'Setup'
	})
	if (setupSectionIndex === -1) {
		test.throwSyntaxError('There must be a setup section, indicated by a "## Setup" header', parsed)
	}
	parseSetups(parsed.children[setupSectionIndex].children)

	// Parse test cases
	parseCases(parsed.children.slice(setupSectionIndex + 1))

	return test

	/**
	 * Parse DB insertions/clears and variable declarations
	 * @param {Array<test-spec:Section>} blocks
	 */
	function parseSetups(blocks) {
		blocks.forEach(block => {
			if (block.type === 'text') {
				return
			} else if (block.type !== 'section') {
				test.throwSyntaxError('Only level 3 sections are accept inside the setup section', block)
			}

			let valueChild = block.children.find(block => block.type === 'value'),
				match
			if ((match = block.name.match(/^Clear (\w+)$/))) {
				// Clear a collection
				let coll = match[1]
				if (test.collections.has(coll)) {
					test.throwSyntaxError('No need to clear the same collection twice', block)
				} else if (valueChild) {
					test.throwSyntaxError('Unexpected value block inside a clear section', valueChild)
				}
				test.collections.add(coll)
				test.setups.push(new Clear(coll))
			} else if ((match = block.name.match(/^(\w+) is$/))) {
				// Declare a variable
				if (!valueChild) {
					test.throwSyntaxError('A value must follow a variable declaration section', block)
				}
				test.setups.push(new Declaration(match[1], valueChild))
			} else if ((match = block.name.match(/^(\w+) in (\w+)$/))) {
				// Insert a document (clear the collection implicitly)
				if (!valueChild) {
					test.throwSyntaxError('A value must follow a variable declaration section', block)
				}
				let coll = match[2]
				if (!test.collections.has(coll)) {
					// Push implicit clear
					test.collections.add(coll)
					test.setups.push(new Clear(coll))
				}
				test.setups.push(new Insertion(match[1], coll, valueChild))
			} else {
				test.throwSyntaxError('Expected either "### _docName_ in _collection_", "### Clear _collection_" or "### _varName_ is"', block)
			}
		})
	}

	/**
	 * Parse DB insertions/clears and variable declarations
	 * @param {Array<test-spec:Section>} blocks
	 */
	function parseCases(blocks) {
		blocks.forEach(block => {
			if (block.type === 'text') {
				return
			} else if (block.type !== 'section') {
				test.throwSyntaxError('Only level 2 sections are allowed after the setup section', block)
			}

			let testCase = new Case

			// Test case name
			if (block.name.endsWith(' (skip)')) {
				testCase.skip = true
				testCase.name = block.name.substr(0, block.name.length - 7)
			} else {
				testCase.name = block.name
			}

			let subSections = block.children.filter(block => block.type === 'section')

			// Post
			let postSection = subSections[0],
				match
			if (!postSection || !(match = postSection.name.match(/^Post(?: (.*))?$/))) {
				test.throwSyntaxError('Expected a subsection "### Post" in this test case', block)
			}
			let valueChild = postSection.children.find(block => block.type === 'value')
			testCase.postUrl = match[1] || ''
			testCase.post = valueChild

			// Out
			let outSection = subSections[1]
			if (!outSection || !(match = outSection.name.match(/^Out(?: (\d{3}))?$/))) {
				test.throwSyntaxError('Expected a subsection "### Out" in this test case', block)
			}
			valueChild = outSection.children.find(block => block.type === 'value')
			testCase.out = valueChild
			testCase.statusCode = Number(match[1] || '200')

			// Finds
			subSections.slice(2).forEach(findSection => {
				let match = findSection.name.match(/^Find in (\w+)$/),
					valueChild = findSection.children.find(block => block.type === 'value')

				if (!match) {
					test.throwSyntaxError('Expected "### Find in _collection_"', findSection)
				} else if (!valueChild) {
					test.throwSyntaxError('Expected a value to check against the DB', findSection)
				}

				let coll = match[1]
				if (!test.collections.has(coll)) {
					test.throwSyntaxError('You can\'t do a find in a collection that wasn\'t cleared in the setup', findSection)
				}
				testCase.finds.push(new Find(coll, valueChild))
			})

			test.cases.push(testCase)
		})
	}

}