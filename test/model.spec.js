// const { update, proxy, listen } = require('../dist')
import ModelX from '../src/model'

const { update, proxy, listen } = ModelX

const state = proxy({})
const items = proxy([])

update(items, { 0: 'hello' })

const observer = id => async ({ type, value, changes }) => {
	await new Promise(resolve => {
		setTimeout(() => {
			console.log(`[${id}]`, type, ' --> ', changes || value)
			resolve()
		}, 0)
	})
}

// observe(state, observer(1))
// observe(state, observer(2))

listen(state, 'update', (next, prev) =>
	console.log(`state update ---> `, prev, `--->`, next)
)
// listen(state, /^change:foo/, value => console.log(`state.foo changed`))

update(state, { foo: 'something' }).then(() => {
	console.log('')
	console.log('---  updated "foo"', state.foo === 'something')
	console.log('')
})
update(state, { bar: 'another' }).then(() => {
	console.log('')
	console.log('---  updated "bar"', state.bar === 'another')
	console.log('')
})
update(state, { bar: 'new value' }).then(() => {
	console.log('')
	console.log('---  updated "bar"', state.bar === 'new value')
	console.log('')
})