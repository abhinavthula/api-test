// This module uses 'with', so it can't be strict

module.exports = function (__str, __context, __path) {
	try {
		with(__context) {
			return eval(__str)
		}
	} catch (e) {
		e.message += ' in ' + __path
		throw e
	}
}