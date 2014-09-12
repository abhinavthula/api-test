# user/signup

## Setup
### Clear users

### user is
	name: 'Guilherme'
	password: '1234'

## Invalid username
### Post
	user: user with name: ''
### Out
	error:
		code: 200
		message: String

## Invalid password

The password must have at least 5 chars

### Post
	user:
		user with password: '1'
### Out
	error:
		code: 201
		message: String

## Valid
### Post
	user: user
### Out
	error: null
	token: String
### Find in users
	user with token: out.token

## Using the same username again
### Post
	prev.post
### Out
	error:
		code: 202
		message: String