'use strict'

var ObjectID = require('mongodb').ObjectID,
	Binary = require('mongodb').Binary

/**
 * @param {*} value
 * @param {boolean} [useColors=false]
 * @returns {string}
 */
module.exports = function (value, useColors) {
	var finalStr = '',
		indentLevel = 0

	var hasBreak = true
	var getNL = function () {
		var i, nl = '\n'
		for (i = 0; i < indentLevel; i++) {
			nl += '  '
		}
		return nl
	}
	var escapeKey = function (key) {
		if (key.match(/^[a-z_$][a-z_$0-9]*$/i)) {
			return key
		} else {
			return '"' + key.replace(/"/g, '\\"') + '"'
		}
	}
	var pushStr = function (str, breakBefore, breakAfter, color) {
		if (!hasBreak && breakBefore) {
			finalStr += getNL()
		}
		if (color && useColors) {
			finalStr += '\x1b[3' + color + 'm' + str + '\x1b[0m'
		} else {
			finalStr += str
		}
		if (breakAfter) {
			finalStr += getNL()
		}
		hasBreak = breakAfter
	}
	var colors = {
		key: '4;1',
		number: '3;1',
		string: '2',
		id: '5;1',
		bin: '6;1',
		date: '6',
		regex: '1'
	}
	var pushJsonValue = function (value, path) {
		var key, needComma, subpath
		if (value === false) {
			pushStr('false', false, false, colors.key)
		} else if (value === true) {
			pushStr('true', false, false, colors.key)
		} else if (value === undefined) {
			pushStr('undefined', false, false, colors.key)
		} else if (value === null) {
			pushStr('null', false, false, colors.key)
		} else if (typeof value === 'number') {
			pushStr(String(value), false, false, colors.number)
		} else if (typeof value === 'string') {
			pushStr('\'' + value.replace(/'/g, '\\\'') + '\'', false, false, colors.string)
		} else if (Array.isArray(value) && !value.length) {
			pushStr('[]')
		} else if (Array.isArray(value)) {
			indentLevel++
			pushStr('[', false, true)
			for (key = 0; key < value.length; key++) {
				if (key) {
					pushStr(',', false, true)
				}
				pushJsonValue(value[key], path)
			}
			indentLevel--
			pushStr(']', true)
		} else if (value instanceof ObjectID) {
			pushStr(value.toString(), false, false, colors.id)
		} else if (value instanceof Binary) {
			pushStr(value.toString('base64'), false, false, colors.bin)
		} else if (value instanceof Date) {
			pushStr(value.toISOString(), false, false, colors.date)
		} else if (value instanceof RegExp) {
			pushStr(String(value), false, false, colors.regex)
		} else if (!Object.keys(value).length) {
			pushStr('{}')
		} else {
			indentLevel++
			pushStr('{', false, true)
			needComma = false
			for (key in value) {
				if (!needComma) {
					needComma = true
				} else {
					pushStr(',', false, true)
				}
				subpath = path ? path + '.' + key : key
				pushStr(escapeKey(key), false, false, colors.key)
				pushStr(': ')
				pushJsonValue(value[key], subpath)
			}
			indentLevel--
			pushStr('}', true)
		}
	}
	pushJsonValue(value, '')

	return finalStr
}