# Database insertion

## Setup
### base is
	a: 'Hello'
### user in User
	base // this should not alter base
### user2 in User
	base

## Test
### Post echo
	base
### Out
	error: null
	a: 'Hello'
### Find in User
	user // Find by id
### Find in User
	base // Find any that match everything