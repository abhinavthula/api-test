'use strict'

var mongoose = require('mongoose'),
	app = require('express')(),
	port = 8000,
	http = require('http'),
	server

mongoose.connect('mongodb://localhost:27017/api_test')

var User = mongoose.model('user', new mongoose.Schema({
	name: {
		type: String,
		index: {
			unique: true
		}
	},
	password: String,
	token: String
}))

app.use(require('body-parser').json(), function (req, res, next) {
	req.body = req.body || {}
	res.success = function (obj) {
		obj = obj || {}
		obj.error = null
		res.json(obj)
	}
	res.error = function (error, message) {
		if (typeof error === 'object') {
			error = {
				code: 100,
				message: String(error)
			}
		} else {
			error = {
				code: error,
				message: message || ''
			}
		}
		res.json({
			error: error
		})
	}
	next()
})

app.post('/user/signup', function (req, res) {
	var user = req.body.user || {},
		name = user.name || '',
		password = user.password || ''

	if (!name) {
		return res.error(200, 'The name can not be empty')
	} else if (password.length < 4) {
		return res.error(201, 'Password too short')
	}

	User.create({
		name: name,
		password: password,
		token: String(Math.random())
	}, function (err, user) {
		if (err && err.code === 11000) {
			return res.error(202, 'Name already registered')
		} else if (err) {
			return res.error(err)
		}
		res.success({
			token: user.token
		})
	})
})

app.post('/user/login', function (req, res) {
	var user = req.body.user || {},
		name = user.name || '',
		password = user.password || ''

	User.findOneAndUpdate({
		name: name,
		password: password
	}, {
		token: String(Math.random())
	}, {
		new: true
	}, function (err, user) {
		if (err) {
			return res.error(err)
		} else if (!user) {
			return res.error(200, 'Invalid name or password')
		}
		res.success({
			token: user.token
		})
	})
})

app.post('/echo', function (req, res) {
	res.success(req.body)
})

server = http.createServer(app)
server.listen(port)

module.exports = server