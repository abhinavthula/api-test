# Database insertion

## Setup
### base is
	a: 'Hello'
### user in User
	// this should not alter base
	base
### user2 in User
	base

## Test
### Post echo
	base
### Out
	error: null
	a: 'Hello'
### Find in User
	// Find by id
	user
### Find in User
	// Find any that match everything
	base