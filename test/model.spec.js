// const { update, observable, listen } = require('../src/model')
import { observable, observe, intercept, update } from '../src/index'

const state = {
	@observable items: []
}
const store = observable(state)

// intercept(state, 'foo', value => `wrapped(${value})`)
intercept(state, 'foo', value => `$$--${value}--$$`)

// observe(store, console.log)

update(store).then(() => {
	console.log(store)
})
update(store, { 0: 'bar', 2: 'foo', 1: [1,2], a: 'what' }).then(() => {
	console.log(store)
})

// update(items, { 0: 'hello' })
//
// const observer = id => async ({ type, value, changes }) => {
// 	await new Promise(resolve => {
// 		setTimeout(() => {
// 			console.log(`[${id}]`, type, ' --> ', changes || value)
// 			resolve()
// 		}, 500)
// 	})
// }
//
// observe(state, observer(1))
// observe(state, observer(2))
//
// listen(state, 'update', (next, prev) =>
// 	console.log(`state update ---> `, prev, `--->`, next)
// )
// listen(state, /^change:foo/, value => console.log(`state.foo changed`))
//
// update(state, { foo: 'something' }).then(() => {
// 	console.log('')
// 	console.log('---  updated "foo"', state.foo === 'something')
// 	console.log('')
// })
// update(state, { bar: 'another' }).then(() => {
// 	console.log('')
// 	console.log('---  updated "bar"', state.bar === 'another')
// 	console.log('')
// })
// update(state, { bar: 'new value' }).then(() => {
// 	console.log('')
// 	console.log('---  updated "bar"', state.bar === 'new value')
// 	console.log('')
// })
