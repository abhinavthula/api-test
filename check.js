'use strict'

require('should')

var types = [String, Number, Boolean, Object, Array]

module.exports = function (actual, expected) {
	var key, field
	for (key in expected) {
		field = expected[key]
		if (types.indexOf(field) !== -1) {
			actual.should.have.a.property(key).and.be.a[field.name]
		} else if (field && typeof field === 'object' && (field.constructor === Object || Object.getPrototypeOf(field) === null)) {
			actual.should.have.a.property(key).and.be.an.Object
			module.exports(actual[key], expected[key])
		} else {
			actual.should.have.a.property(key).and.be.eql(field)
		}
	}
}