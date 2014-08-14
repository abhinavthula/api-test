# API Test

API testing made simple

## Install
`npm install api-test --save`

## Usage
Create a test file 'test/api-test/sample.md' to test the 'item/get' endpoint, like this:
```
# item/get
## DB
### item in items
	name: 'Salad'
	price: 500
## Invalid request
### Post
	randomId()
### Out
	error:
		code: 200
## Valid request
### Post
	item.id
### Out
	name: item.name
	price: item.price
```

And in your mocha testing code:
```javascript
require('api-test')('test/api-test', {
	mongoUri: 'mongodb://localhost:27017/api_test',
	baseUrl: 'http://localhost:8000/'
})
```

## Concepts
Testing is, at the same time:

* *very* great because it lets you trust code is ready for production!
* extremely *boring* to write, because test code is dumb and repetitive

This module tries to solve this by making testing code more concise and unifying testing and documentation.

Markdown was choosen because it's easy to write/read and it's not code!

## Test structure
A test is divided in two parts:

### Database fixup
This is an optional section called 'DB' that let you insert documents and clear mongo collections to prepare the database before the test cases run.

#### Inserting documents
The syntax is simply:
```
### _docName_ in _collection_
	_docDescription_
```

At the first insertion in a collection, it will be cleared. This is important to make every test isolated. You may refer to this object by its _docName_.

The syntax for _docDescription_ is described at bellow

#### Clearing collections
The syntax is simply:
```
### Clear _collection_
```

Use this only when you won't insert any document in that collection, but want it to be cleared.

All documents in that collection will be removed, indexes will be kept

### Test cases
A test case has three sections:

* `Post`: the JSON body to send by POST. Must start with a header like `### Post`
* `Out`: the expected JSON output. Must start with a header like `### Out`
* `Finds`: optional DB assertions. Must start with a header like `### Find in _collection_`

In all cases, the syntax is described bellow

## Object syntax
The syntax was designed to be concise and expressive. The values will be eval'ed as normal JS with a context with special variables (see default `context bellow`).

The object can be a simple JS value, like:
```
new Date
```

Or an object with one property by line and tabs used to declare sub-objects:
```
user:
	name:
		first: 'Happy'
		last: 'Customer'
	age: 37 + 2
	country: 'cm'.toUpperCase()
```

## Default context

* `randomId()`: return a random mongo-id as a 24-hex-char string
* `randomStr(len)`: return a random string with length `len`
* `empty`: the empty object `{}`
* `post`: the request body of the current test case
* `out`: the response body of the current test case
* `prev`: an object wity keys:
	* `post`: the request body of the previous request
	* `out`: the response body of the previous request

## Options
* `mongoUri`: the mongo uri to connect to. The hostname SHOULD be 'localhost' and the db name SHOULD contains 'test'. If not, the code will ask for confirmation. This protects one from dropping production data, since the tests automatically clear collections, before inserting docs.
* `baseUrl`: the base API url. Every request url will be composed from this base and the test name.
* `describe`, `it`, `before`: (optional) the mocha interface. Defaults to global mocha functions
* `context`: (optional) define your own variables/functions accessible from object definitions, to help writing tests.

## Examples
See more test examples in the folder 'test/api-test'

## Run test
Run `node index` in 'test/api' to start the a simple API webservice. Then (in another terminal instance), run `npm test` in the project root folder.

## Road map
* Array notation: there is no way to declare an array yet
* Better failure message