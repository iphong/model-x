// @flow

type Phone = {
	home: string,
	work: string,
	cell: string
}
type Address = {
	home: string,
	work: string
}
type Email = {
	home: string,
	work: string
}
type Name = {
	first: string,
	last: string
}
class Person {
	name: Name
	phone: Phone
	email: Email
	address: Address
	constructor(name: string) {
		const [first, last] : Array<string> = name.split(' ')
		this.name = { first, last }
	}
}

const a = new Person('Phong Vu')

console.log(a)


interface Element {
	propTypes: {},
	defaultProps: {}
}

class Block implements Element {
	propTypes: {} = {}
	defaultProps: {} = {}
}