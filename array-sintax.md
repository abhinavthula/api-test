## JSON
	{
	  "user": {
	    "name": "Guilherme",
	    "password": "1"
	  },
	  "squares": [
	    {
	      "n": 1,
	      "n2": 1
	    },
	    {
	      "n": 2,
	      "n2": 4
	    },
	    {
	      "n": 3,
	      "n2": 9
	    }
	  ]
	}

## A
	user:
		name: 'Guilherme'
		password: '1'
	squares:
		*	n: 1
			n2: 1
		*	n: 2
			n2: 4
		*	n: 3
			n2: 9

## B
	user:
		name: 'Guilherme'
		password: '1'
	squares:
		*n: 1
		n2: 1
		*n: 2
		n2: 4
		*n: 3
		n2: 9

## C
	user:
		name: 'Guilherme'
		password: '1'
	squares:
		n: 1
		n2: 1
		-
		n: 2
		n2: 4
		-
		n: 3
		n2: 9
