'use strict'

var _eval = require('../_eval'),
	ParseError = require('./ParseError'),
	Mixin = require('./Mixin')

/**
 * @class
 * @param {number} sourceLine
 */
function Obj(sourceLine) {
	/** @param {string[]} */
	this.lines = []
	/**
	 * @member {Object}
	 * @property {number} begin
	 * @property {number} end
	 */
	this.source = {
		begin: sourceLine,
		end: sourceLine
	}
	/** @member {boolean} */
	this.parsed = false
	/** @member {Object|Array|string|Mixin} */
	this.value = null
}

/**
 * Add one more line as the source of the Obj
 * @param {string} line
 * @throws if already parsed
 */
Obj.prototype.push = function (line) {
	if (this.parsed) {
		throw new Error('Can\t push, Obj already parsed')
	}
	if (line.trim() === '' && !this.lines.length) {
		// Ignore the first blank line
		this.source.begin++
		return
	}
	this.lines.push(line)
	this.source.end++
}

/**
 * Parses the object content and make it ready to execute
 * @returns {Obj} itself
 */
Obj.prototype.parse = function () {
	if (!this.parsed) {
		if (!(this._parseArray() ||
			this._parseObject() ||
			this._parseMixin() ||
			this._parseJS())) {
			throw new ParseError('Invalid syntax', this)
		}
		this.parsed = true

		// Remove now useless data
		delete this.lines
		delete this.source
	}
	return this
}

/**
 * Execute and return the result for the parsed Obj
 * @param {Object} context
 * @param {string} name A string like '<' + description + '>' to be part of a thrown execption
 * @returns {*}
 * @throws if not parsed
 */
Obj.prototype.execute = function (context, name) {
	var r, key

	if (!this.parsed) {
		throw new Error('Can\'t execute, Obj not parsed')
	}

	if (Array.isArray(this.value)) {
		return this.value.map(function (each, i) {
			return each.execute(context, name + '.' + i)
		})
	} else if (typeof this.value === 'string') {
		return _eval(this.value, context, name)
	} else if (this.value instanceof Mixin) {
		return this.value.execute(context, name)
	} else {
		r = Object.create(null)
		for (key in this.value) {
			r[key] = this.value[key].execute(context, name + '.' + key)
		}
		return r
	}
}

/**
 * Get an empty Obj already parsed
 * This obj, when parsed, will give `{}`
 * @returns {Obj}
 */
Obj.empty = function () {
	var obj = new Obj(0)
	obj.push('({})')
	return obj.parse()
}

module.exports = Obj

/**
 * @returns {boolean} false if it's probably not an array
 * @throws {ParseError} if invalid syntax
 * @private
 */
Obj.prototype._parseArray = function () {
	var i, line, obj

	if (!this.lines.length || this.lines[0][0] !== '*') {
		// An array must start with a '*'
		return false
	}

	// Split each array element
	this.value = []
	for (i = 0; i < this.lines.length; i++) {
		line = this.lines[i]
		if (line[0] === '*') {
			// A new element
			if (line[1] !== '\t') {
				throw new ParseError('Expected a "\t" after "*"', this)
			}
			if (obj) {
				this.value.push(obj.parse())
			}
			obj = new Obj(this.source.begin + i)
			obj.push(line.substr(2))
		} else if (line[0] === '\t') {
			// Last obj continuation
			obj.push(line.substr(1))
		} else {
			throw new ParseError('Expected either a "*" or "\t"', this)
		}
	}
	this.value.push(obj.parse())
	return true
}

/**
 * @returns {boolean} false if it's probably not an object
 * @throws {ParseError} if invalid syntax
 * @private
 */
Obj.prototype._parseObject = function () {
	var i, line, obj, match, key

	if (!this.lines.length || !this.lines[0].match(/^[a-z$_][a-z0-9$_]*:/i)) {
		// An object must start with '_key_:'
		return false
	}

	// Split each object key element
	this.value = Object.create(null)
	for (i = 0; i < this.lines.length; i++) {
		line = this.lines[i]
		if ((match = line.match(/^([a-z$_][a-z0-9$_]*):/i))) {
			// A new key
			if (obj) {
				this.value[key] = obj.parse()
			}
			key = match[1]
			obj = new Obj(this.source.begin + i)
			obj.push(line.substr(key.length + 1).trim())
		} else if (line[0] === '\t') {
			// Last obj continuation
			obj.push(line.substr(1))
		} else {
			throw new ParseError('Expected either "_key_:" or "\t"', this)
		}
	}
	this.value[key] = obj.parse()
	return true
}

/**
 * @returns {boolean} false if it's probably not a mixin
 * @throws {ParseError} if invalid syntax
 * @private
 */
Obj.prototype._parseMixin = function () {
	var path, str, pos, value

	if (this.lines.length !== 1 ||
		!(path = readPath(this.lines[0])) ||
		!path.newStr.match(/^with(out)? /)) {
		// Must start with a path followed by 'with' or 'without'
		return false
	}

	// Base object
	this.value = new Mixin
	this.value.base = path.parts
	str = path.newStr

	// Without
	if (str.indexOf('without ') === 0) {
		str = eat(str, 7)
		while ((path = readPath(str))) {
			this.value.removals.push(path.parts)
			str = path.newStr

			if (!str || str[0] === ';') {
				// End of 'without' list
				str = eat(str, 1)
				break
			} else if (str[0] === ',') {
				str = eat(str, 1)
			} else {
				throw new ParseError('Expected either ";" or "," after path ' + path.name, this)
			}
		}
	}

	// With
	while (str.indexOf('with ') === 0) {
		str = eat(str, 4)
		path = readPath(str)
		if (!path) {
			throw new ParseError('Expected a path after "with"', this)
		}
		str = path.newStr
		pos = str.indexOf(';')
		value = pos === -1 ? str : str.substr(0, pos)
		if (!value) {
			throw new ParseError('Expected a value for path ' + path.name, this)
		}
		this.value.additions.push({
			path: path.parts,
			value: value
		})
		str = pos === -1 ? '' : eat(str, pos + 1)
	}

	if (str) {
		throw new ParseError('Could not parse as mixin: "' + str + '"', this)
	}

	return true
}

/**
 * Try to extract a path from the beginning of the string
 * @param {string} str
 * @returns {Object} with keys 'path' and 'newStr' or null if no path could be read
 */
function readPath(str) {
	var match, parts
	match = str.match(/^(([0-9]+|[a-zA-Z$_][a-zA-Z0-9$_]*)(\.([0-9]+|[a-zA-Z$_][a-zA-Z0-9$_]*))*)/)
	if (match) {
		parts = match[1].split('.').map(function (each) {
			return /^[0-9]+$/.test(each) ? Number(each) : each
		})
		return {
			name: match[1],
			parts: parts,
			newStr: eat(str, match[1].length)
		}
	}
}

/**
 * Remove `n` chars and blank chars from the beginning of the string
 * @param {string} str
 * @param {number} n
 * @returns {string}
 */
function eat(str, n) {
	return str.substr(n).trimLeft()
}

/**
 * @returns {boolean} false if it's probably not a JS expression
 * @throws {ParseError} if invalid syntax
 * @private
 */
Obj.prototype._parseJS = function () {
	if (this.lines.length !== 1) {
		return false
	}
	this.value = this.lines[0]
	return true
}