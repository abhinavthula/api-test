# item/get

## DB

### Item myItem
	category
		_id: randomId()
	basicInfo
		pt_br
			description: 'My Great Item'
			language: 'pt_br'
			name: 'My Item'
	choicesFlow
		_id: randomId()
	image: 'image-url'
	price: 3.14
	available: true
	enterpriseItem
		_id: randomId()

### Item myItem2
	category: myItem.category
	choicesFlow
		_id: randomId()

## Item not found

### In
	item
		id: randomId()
### Out
	error
		code: 200
		message~ String

## Item found

### In
	item
		id: myItem.id
### Out
	id: myItem.id
	available: myItem.available
	basicInfo: myItem.basicInfo
	image: myItem.image
	price: myItem.price
	category
		id: myItem.category