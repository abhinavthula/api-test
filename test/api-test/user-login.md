# user/login

This section will be ignored

## Input
	this is a fake object, won't be parsed as one

## Setup
End of ignored section, but paragraphs are always ignored

### user in users
	name: 'Guilherme'
	password: '12345'

### error is
	error:
		code: 0
		message: String

## Wrong password
### Post
	user: user with password: randomStr(5)
### Out
	error with error.code: 200

## Valid
### Post
	user: user
### Out
	error: null
	token: String
### Find in users
	token: out.token