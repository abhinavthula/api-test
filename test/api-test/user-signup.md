# user/signup

## DB
### Clear users

## Invalid username
### Post
	user:
		name: ''
		password: '1234'
### Out
	error:
		code: 200
		message: String

## Invalid password
### Post
	user:
		name: 'Guilherme'
		password: '1'
### Out
	error:
		code: 201
		message: String

## Valid
### Post
	user:
		name: 'Guilherme'
		password: '1234'
### Out
	error: null
	token: String
### Find in users
	name: 'Guilherme'
	password: '1234'
	token: out.token

## Using the same username again
### Post
	prev.post
### Out
	error:
		code: 202
		message: String