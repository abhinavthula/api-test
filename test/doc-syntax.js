/*globals describe, it*/
'use strict'

var Obj = require('../classes/Obj'),
	should = require('should'),
	ParseError = require('../classes/ParseError'),
	context = {
		user: {
			name: 'John',
			pass: '123'
		},
		order: {
			items: [{
				name: 'a',
				price: 60
			}, {
				name: 'b',
				price: 63
			}],
			price: 123
		},
		Math: {
			random: function () {
				return 0.17
			}
		},
		randomId: function () {
			return '123456789012345678901234'
		},
		randomStr: function () {
			return 'hi'
		}
	}

describe('doc-syntax', function () {
	it('should work for basic properties', function () {
		check([
			'user:',
			'	name: "John"',
			'	password: "123"'
		], {
			user: {
				name: 'John',
				password: '123'
			}
		})

		check([
			'item:',
			'	name: "Chocolate" + " " + "Cake"',
			'	price: (314/100).toFixed(2) // prices must be like "3.14"'
		], {
			item: {
				name: 'Chocolate Cake',
				price: '3.14'
			}
		})
	})

	it('should work for JS expressions', function () {
		check([
			'["sugar", "milk"]'
		], ['sugar', 'milk'])

		check([
			'Math.random()'
		], 0.17)

		check([
			'itemId:',
			'	randomId()'
		], {
			itemId: '123456789012345678901234'
		})

		check([
			'itemId: randomId()'
		], {
			itemId: '123456789012345678901234'
		})
	})

	it('should work for simple arrays', function () {
		check([
			'tags: ["light", "pink"]'
		], {
			tags: ['light', 'pink']
		})

		check([
			'tags:',
			'	*	"light"',
			'	*	"pink"'
		], {
			tags: ['light', 'pink']
		})

		check([
			'*	3',
			'*	14',
			'*	15'
		], [3, 14, 15])
	})

	it('should work for more complex arrays', function () {
		check([
			'messages:',
			'	*	group: "family"',
			'		num: 2',
			'	*	group: "work"',
			'		num: 12'
		], {
			messages: [{
				group: 'family',
				num: 2
			}, {
				group: 'work',
				num: 12
			}]
		})

		check([
			'*	*	1',
			'	*	2',
			'*	*	3',
			'	*	4'
		], [[1, 2], [3, 4]])
	})

	it('should work for simple mixins', function () {
		check(['user with pass: "1234"'], {
			name: 'John',
			pass: '1234'
		})
		check(['user without name'], {
			pass: '123'
		})
		check([
			'user without name, pass; with',
			'	age: 36',
			'	token: randomStr(16)'
		], {
			age: 36,
			token: 'hi'
		})
	})

	it('should work for more complex mixins', function () {
		check(['order without items.price'], {
			items: [{
				name: 'a'
			}, {
				name: 'b'
			}],
			price: 123
		})

		check(['order without items.0.name, price'], {
			items: [{
				price: 60
			}, {
				name: 'b',
				price: 63
			}]
		})

		check(['order with items.ok: true'], {
			items: [{
				name: 'a',
				price: 60,
				ok: true
			}, {
				name: 'b',
				price: 63,
				ok: true
			}],
			price: 123
		})

		check(['order.items without 0'], [{
			name: 'b',
			price: 63
		}])
	})

	it('should work for mixins with array', function () {
		check(['order with items.0.name: "c"'], {
			items: [{
				name: 'c',
				price: 60
			}, {
				name: 'b',
				price: 63
			}],
			price: 123
		})
	})
})

function check(lines, value) {
	var obj = new Obj(0)
	lines.forEach(function (line) {
		obj.push(line)
	})
	try {
		obj.parse()
	} catch (e) {
		if (e instanceof ParseError) {
			e.logSourceContext(lines)
		}
		throw e
	}
	should(obj.execute(context, '<>')).be.eql(value)
}