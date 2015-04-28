# API Test

API testing made simple

## Install
`npm install api-test --save-dev`

## Usage
Create a test file 'test/api-test/sample.md' to test the 'item/get' endpoint, like this:
```
# item/get
## Setup
### item in items
	name: 'Salad'
	price: 500
## Invalid request
### Post
	randomId()
### Out 400
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

### Test setup
This is an optional section called 'Setup' that lets you insert documents, declare variables and clear mongo collections to prepare the database before the test cases run.

#### Inserting documents
The syntax is simply:
```
### _docName_ in _collection_
	_docDescription_
```

At the first insertion in a collection, it will be cleared. This is important to make every test isolated. You may refer to this object by its _docName_.

The syntax for _docDescription_ is described bellow.

Most of times, documents have a base strucuture with some default fields. You do not need to repeat yourself in this case, see the option `defaultDocuments` bellow.

#### Clearing collections
The syntax is simply:
```
### Clear _collection_
```

Use this only when you won't insert any document in that collection, but want it to be cleared.

All documents in that collection will be removed, indexes will be kept

#### Declaring variables
You can declare and define a variable to use in test cases, db insertions and more:
```
### _varName_ is
	_variableContent_
```

This will make _varName_ available to every following object block.

### Test cases
A test case has three optional sections:

* `Post`: the JSON body to send by POST. Must start with a header like `### Post [_url_]`. Default: empty JSON object `{}`. The _url_ is optional and defaults to the test name
* `Out`: the expected JSON output. Must start with a header like `### Out [_statusCode_]`. Default: no output checking. The _statusCode_ is optional and defaults to 200
* `Finds`: optional DB assertions. Must start with a header like `### Find in _collection_`

In all cases, the syntax is described bellow

## Skipping test cases
By appending ` (skip)` to a test case name (see an [example](https://github.com/clubedaentrega/api-test/blob/master/test/api-test/recursive/user-login.md#wrong-password-skip)) it will be simply ignored. This puts them in a pending state, and is favoured over removing tests which you may forget to add back again.

You can also append ` (skip)` to a test file header (see an [example](https://github.com/clubedaentrega/api-test/blob/master/test/api-test/recursive/skip.md)) to skip the whole file.

## Object syntax
The syntax was designed to be concise and expressive. The values will be eval'ed as normal JS with a context with special variables (see `default context` bellow).

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

Or mixins, like:
```
user with name.first: 'Unhappy'
```

Learn more about the syntax in the file [doc-syntax.md](https://github.com/clubedaentrega/api-test/blob/master/doc-syntax.md)

## Default context

* `ObjectId()`: the mongo object id constructor
* `randomId()`: return a random mongo-id as a 24-hex-char string
* `randomStr([len=7], [alphabet=a-zA-Z0-9+/])`
* `randomHex([len=7])`
* `randomCode([len=7])`
* `randomEmail([domain='example.com'])`
* `randomUrl([base='http://example.com'])`
* `random([min=0],[max=1])`
* `randomInt([min=0],[max=100])`
* `randomBool()`
* `randomDate([interval=1day], [base=now])`
* `randomOf(...values)`: return one of its arguments
* `empty`: the empty object `{}`
* `post`: the request body of the current test case
* `out`: the response body of the current test case
* `prev`: an object wity keys:
	* `post`: the request body of the previous request
	* `out`: the response body of the previous request

## Options
* `mongoUri`: the mongo uri to connect to. The hostname SHOULD be 'localhost' and the db name SHOULD contains 'test'. If not, the code will ask for confirmation. This protects one from dropping production data, since the tests automatically clear collections, before inserting docs.
* `baseUrl`: the base API url. Every request url will be composed from this base and the test name.
* `name`: (optional) the test name (given to root `describe(name, ...)` call)
* `defaultDocuments`: (optional) the default structure for documents in each collection. See [issue #1](https://github.com/clubedaentrega/api-test/issues/1) for details
* `describe`, `it`, `before`: (optional) the mocha interface. Defaults to global mocha functions
* `context`: (optional) define your own variables/functions accessible to object definitions
* `recursive`: (optional) whether to look for *.md files inside subfolders (default: false)
* `strict`: (optional) whether the output check should be strict and complain about unexpected keys (default: true)
* `ca`: (optional) CA certificate (useful when using a self-signed certificate in the server)
* `ignoredFindKeys`: (optional) document keys to ignore in finds (default: `['_id', '__v']`)
* `filterFile`: (optional) a function that will be called for every file and should return true if this file should be parsed
* `preParse`: (optional) a function that will be called with all pre-parsed tokens (Header and Obj). This lets you do crazy stuff with the parsing if you want
* for more low-level options, see `index.js`

## Type checking

If you don't know the exact value for an API response or field in the collection, you can check for its type:
```
## Testing types
### Post
	...
### Out
	token: String
### Find in users
	password: String
	lastLogin: Date
```

The valid type values are: `String`, `Number`, `Boolean`, `Object`, `Array`, `Date`, `RegExp`, `ObjectId`.

## Custom context
You can use custom context to help writing tests. All default context variables and methods will still be accessible (unless overwritten).

For example: if all endpoints return errors like this: `{error: {code: _code_, message: _aDebugString_}}`, you can pass as context:
```javascript
options.context = {
	error: function (code) {
		return {
			error: {
				code: code,
				message: String
			}
		}
	}
}
```

And then write a test case like this:
```
## Invalid email should give error 200
### Post
	user:
		email: randomEmail()
### Out
	error(200)
```

Instead of repeating yourself with:
```
	error:
		code: 200
		message: String
```

## Examples
See more test examples in the folder [test/api-test](https://github.com/clubedaentrega/api-test/tree/master/test/api-test)

## Run test
Run `npm test` in the project root folder.