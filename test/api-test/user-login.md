# user/login

This section will be ignored

## Input
	empty

## Setup
End of ignored section, but paragraphs are always ignored

### user in users
	name: 'Guilherme'
	password: '12345'
	
### error is
	error: // comment lines will be ignored
		code: 0
		// comment lines will be ignored
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
	id: user._id
	token: String
### Find in users
	user with token: out.token