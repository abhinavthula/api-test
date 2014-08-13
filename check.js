'use strict'

require('should')

var execute = require('./execute'),
	ObjValue = require('./Obj').ObjValue

module.exports = function (obj, definition, context) {
	var key, field
	for (key in definition) {
		field = definition[key]
		if (field instanceof ObjValue) {
			if (field.isType) {
				console.log('type', field.value)
			} else {
				console.log('value', field.value)
				obj.should.have.property(key, execute(field.value, context))
			}
		} else {
			obj.should.have.property(key).and.should.be.Object
			module.exports(obj[key], field, context)
		}
	}
}