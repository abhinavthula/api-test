# Doc Syntax
This file will cover every detail of the doc syntax, inspired in JSON and designed to be very concise and expressive.

**THIS IS A DRAFT**, some features listed here don't work yet

## Basic example
	user:
		name: 'John'
		password: '123'
The JSON equivalente would be: `{"user": {"name": "John", "password": "123"}}`

## Properties are eval'd
	item:
		name: 'Chocolate' + ' ' + 'Cake'
		price: (314/100).toFixed(2) // prices must be like '3.14'
All property values will be eval'd as plain JS with some more global help functions (like `randomStr()`)

## Simple value
	['sugar', 'milk']
Evaluate a single JS expression and the obj value will be this result. This can create values that are not of type 'object', like:

	Math.random()

This syntax can also be used in a subdoc:

	itemId:
		randomId()

Is the same as:
	itemId: randomId()

## Simple arrays
Small arrays can be written directly in pure JS:

	tags: ['light', 'pink']
Or with a syntax inspired in mardown lists:

	tags:
		*	'light'
		*	'pink'
Or an array as root:

	*	3
	*	14
	*	15
## Arrays of objects
	messages:
		*	group: 'family'
			num: 2
		*	group: 'work'
			num: 12

## Arrays of arrays
	*	*	1
		*	2
	*	*	3
		*	4
Means `[[1, 2], [3, 4]]`