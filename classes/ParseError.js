'use strict'

/**
 * @class
 * @param {string} message
 * @param {Header|Obj} [...el] The element(s) that caused the error
 * @extends Error
 */
function ParseError(message) {
	Error.call(this)

	/** @member {string} */
	this.message = message

	/** @member {Array<Header|Obj>} */
	this.els = [].slice.call(arguments, 1)
}

require('util').inherits(ParseError, Error)

/**
 * Log the original code region that caused the error into the console
 * @param {string[]} originalLines
 */
ParseError.prototype.logSourceContext = function (originalLines) {
	var start = Infinity,
		end = -Infinity,
		str = '\n\n-----',
		i, focus, checkElFocus, lineNum

	if (!this.els.length) {
		return
	}
	this.els.forEach(function (el) {
		start = Math.min(start, el.source.begin)
		end = Math.max(end, el.source.end)
	})

	checkElFocus = function (el) {
		return i >= el.source.begin && i < el.source.end
	}

	for (i = Math.max(0, start - 3); i < end + 3 && i < originalLines.length; i++) {
		focus = this.els.some(checkElFocus)
		lineNum = String(i + 1)
		while (lineNum.length < 3) {
			lineNum = ' ' + lineNum
		}
		str += '\n\x1b[32m' + lineNum + '\x1b[0m '
		str += (focus ? '\x1b[31;1m>' : ' ') + ' ' + originalLines[i] + (focus ? '\x1b[0m' : '')
	}
	str += '\n-----'

	console.log(str)
}

module.exports = ParseError