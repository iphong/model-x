/*
 * Copyright (c) 2018. Developed by Phong Vu
 */

const data = {
	foo() {
		return { bar: 'foo' }
	}
}
const proxy = new Proxy(data, {
	get(target, prop) {
		console.log('trap::', prop, typeof target[prop], target[prop])
		return target[prop]
	},
	apply(func) {

	}
})

