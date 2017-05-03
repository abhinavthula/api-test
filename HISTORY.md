# 4.1.0
* Changed: updated dependencies

# 4.0.1
* Changed: updated dependencies
* Fixed: use match() instead of eql()

# 4.0.0

## Breaking changes
* The basic syntax parsing is delegated to [test-spec](https://github.com/clubedaentrega/test-spec) module. Since the parser was rewriten, some files are now considered invalid. Known examples are:
	* Line comments in values blocks. Change from `code() // comment` to `code() /* comment */`.
	* Post and Out sections are no longer optional
* Removed `preParse` callback
* Removed `Header`, `Obj` and `ParserError` classes
* Changed some internal structures, so code depending on callbacks must be reviewed

# 3.2.0
* Changed: new default length for `randomStr()` is 8 (was 7). See [#3](https://github.com/clubedaentrega/api-test/issues/3)

# 3.1.1
* Fixed: `toJSON` should not be called in the Find operation

# 3.1.0
* Added: call `toJSON` to ease testing for Date and ObjectId instances