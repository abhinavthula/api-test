# Signup + Login
This test checks if a signuped user can login afterwards

## Setup
### Clear users

### user is
	defaultDocuments.users with
		name: 'Guilherme'
		password: '12345'

## Signup
### Post user/signup
	user: user
### Out
	error: null
	token: String

## Login
### Post user/login
	user: user
### Out
	error: null
	token: String
### Find in users
	user with token: out.token