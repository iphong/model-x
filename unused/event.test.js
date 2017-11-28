import { delay } from '../src/utils'
import { dispatch, observe } from '../src/event'

const state = {}

observe(state, async ({ type }) => {
	await delay(500)
	console.log('observer 1')
	return 1
})
dispatch(state, { type: 'update' }).then(() => {
	console.log('dispatch 1 completed')
})
observe(state, async ({ type }) => {
	await delay(1000)
	console.log('observer 2')
	return 2
})
observe(state, async ({ type }) => {
	await delay(1500)
	console.log('observer 3')
	return 3
})
dispatch(state, { type: 'update' }).then(() => {
	console.log('dispatch 2 completed')
})
setTimeout(() =>
	dispatch(state, { type: 'update' }).then(() => {
		console.log('dispatch 2 completed')
	}), 1500)
