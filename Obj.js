'use strict'

/**
 * @class
 */
function Obj() {
	this.value = Object.create(null)
	this.propsByLevel = []
	this.lines = 0
}

/**
 * Parse one more line of the Obj
 * @param {string} line must start with '\t'
 */
Obj.prototype.push = function (line) {
	var level = line.match(/^\t+/)[0].length,
		i, target, match
	line = line.substr(level).trim()
	if (typeof this.value === 'string') {
		throw new Error('Invalid line for {obj}: ' + line)
	} else if (line.match(/^[a-z_$][a-z0-9_$]*:$/i)) {
		// Key
		// TODO: avoid jumps
		line = line.substr(0, line.length - 1)
		this.propsByLevel[level] = line
		target = this.value
		for (i = 1; i < level; i++) {
			target = target[this.propsByLevel[i]]
		}
		target[line] = Object.create(null)
	} else if ((match = line.match(/^([a-z_$][a-z0-9_$]*): (.+)$/i))) {
		// Property
		target = this.value
		for (i = 1; i < level; i++) {
			target = target[this.propsByLevel[i]]
		}
		target[match[1]] = match[2]
	} else if (this.lines === 0) {
		this.value = line
	} else {
		throw new Error('Invalid line for {obj}: ' + line)
	}
	this.lines++
}

module.exports = Obj