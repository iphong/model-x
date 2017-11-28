import { observable, observe } from './_event2'

const state = observable({ a: 0 })
const dispose = observe(state, {
	create: ({ key, value }) => {
		console.log('model created:', key, '(', value, ')')
	},
	change: ({ key, oldValue, newValue }) => {
		console.log('model changed:', key, '(', oldValue, '->', newValue, ')')
	},
	remove: ({ key }) => {
		console.log('model removed:', key)
	},
	update: ({ key, value }) => {
		console.log('model updated:', key, '(', value, ')')
	}
})
state.a = 1
state.b = 1
state.a = 2
state.a = 3
state.b = 2