'use strict'

/**
 * @class
 */
function Obj() {
	this.value = Object.create(null)
	this.propsByLevel = []
}

/**
 * Parse one more line of the Obj
 * @param {string} line must start with '\t'
 */
Obj.prototype.push = function (line) {
	var level = line.match(/^\t+/)[0].length,
		i, target, match
	line = line.substr(level).trim()
	if (line.match(/^[a-z_][a-z0-9_]*$/i)) {
		// Key
		// TODO: avoid jumps
		this.propsByLevel[level] = line
		target = this.value
		for (i = 1; i < level; i++) {
			target = target[this.propsByLevel[i]]
		}
		target[line] = Object.create(null)
	} else if ((match = line.match(/^([a-z_][a-z0-9_]*)\s*([:~])\s*(.*)$/i))) {
		// Property
		target = this.value
		for (i = 1; i < level; i++) {
			target = target[this.propsByLevel[i]]
		}
		target[match[1]] = new ObjValue(match[2] === '~', match[3])
	} else {
		throw new Error('Invalid line for {obj}: ' + line)
	}
}

/**
 * If the object doesn't have any typed field, return only fields and values
 * @throws if there is any typed field
 * @returns {Object}
 */
Obj.prototype.toObject = function () {
	var _toObject = function (value) {
		var key, r = Object.create(null)
		for (key in value) {
			if (value[key] instanceof ObjValue) {
				if (value[key].isType) {
					throw new Error('A document property must be a value')
				}
				r[key] = value[key].value
			} else {
				r[key] = _toObject(value[key])
			}
		}
		return r
	}
	return _toObject(this.value)
}

/**
 * @class
 * @param {boolean} isType If the value should be considered as a type check
 * @param {*} value
 */
function ObjValue(isType, value) {
	this.isType = isType
	this.value = value
}

module.exports = Obj