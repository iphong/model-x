const { change, update, observable, observe, intercept } = require('../dist')

const state = {}
const observer = id => async (key, next, prev) => {
	await new Promise(resolve => {
		setTimeout(() => {
			console.log(`[${id}]`, key, ' --> ', next)
			resolve()
		}, 500)
	})
}
intercept(state, 'foo', value => `foo( ${value} )`)
intercept(state, 'bar', value => `bar( ${value} )`)
intercept(state, value => `$$( ${value} )`)

observe(state, observer(1))
observe(state, observer(2))

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


const app = observable({ a: { b: { c: 1 } } })

// intercept(app, value => [value])
// intercept(app.a.b, value => [value])

app.a.b.c = 4
app.a.b.c = 2
app.a.b.c = 'foo'
app.a.b.c = 'bar'
app.a.b.d = 5
app.a.foo = 'bar'
app.a.d = {}
app.a.d.bar = 'foo'
change(app, 'b', []).then(() => {
	app.b.push('A')
	app.b.push('B')
	app.b.push({ x: { y: 'z' } })
	app.b[2].x.y = 'ZZZ'
})

observe(app, (key, next) => console.log(key, '-->', next))
