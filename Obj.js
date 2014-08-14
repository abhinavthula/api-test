'use strict'

/**
 * @class
 * @param {number} sourceLine
 */
function Obj(sourceLine) {
	// The inner value, either a hash map or a string
	this.value = Object.create(null)
	this.source = {
		begin: sourceLine,
		end: sourceLine
	}
	// Store the last prop name for each level
	this._lastProps = []
	this._lastLevel = 0
	this._empty = true
}

/**
 * Parse one more line of the Obj
 * @param {string} line must start with '\t'
 */
Obj.prototype.push = function (line) {
	var level = line.match(/^\t+/)[0].length,
		i, target, match
	line = line.substr(level).trim()

	if (level > this._lastLevel + 1) {
		throw new Error('Invalid line for {obj}: ' + line)
	}

	if (typeof this.value === 'string') {
		throw new Error('Invalid line for {obj}: ' + line)
	} else if (line.match(/^[a-z_$][a-z0-9_$]*:$/i)) {
		// Key
		line = line.substr(0, line.length - 1)
		this._lastProps[level] = line
		target = this.value
		for (i = 1; i < level; i++) {
			target = target[this._lastProps[i]]
		}
		target[line] = Object.create(null)
		this._lastLevel = level
	} else if ((match = line.match(/^([a-z_$][a-z0-9_$]*): (.+)$/i))) {
		// Property
		target = this.value
		for (i = 1; i < level; i++) {
			target = target[this._lastProps[i]]
		}
		target[match[1]] = match[2]
	} else if (this._empty) {
		this.value = line
	} else {
		throw new Error('Invalid line for {obj}: ' + line)
	}
	this._empty = false
	this.source.end++
}

module.exports = Obj