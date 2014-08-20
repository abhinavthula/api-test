'use strict'

/**
 * @class
 * @param {string} message
 * @param {(Header|Obj)} [el] The element that caused the error (null if not applicable)
 */
function ParseError(message, el) {
	Error.call(this)
	this.message = message
	this.el = el
}

require('util').inherits(ParseError, Error)

/**
 * Populate the error message with the original code region that caused the error
 * @param {string[]} originalLines
 */
ParseError.prototype.addSourceContext = function (originalLines) {
	if (!this.el) {
		return
	}
	var start = this.el.source.begin,
		end = this.el.source.end,
		str = '\n\n-----',
		i
	for (i = Math.max(0, start - 3); i < end + 3 && i < originalLines.length; i++) {
		str += '\n' + (i >= start && i < end ? '>' : ' ') + ' ' + originalLines[i]
	}
	str += '\n-----'

	this.message += str
}

module.exports = ParseError