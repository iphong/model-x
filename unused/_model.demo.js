import Model from './_model'
import Events, { observe } from './_event'

const log = console.log
const store = new Model()

function listener(msg) {
	return async () => {
		const time = Math.round(Math.random() * 899 + 100).toPrecision(3)
		await new Promise(resolve => setTimeout(resolve, time))
		log(`\t••• on ${msg} took ${time}ms`)
	}
}

/* Simulate multiple listeners */
store.addListener('update', ({ key, value, oldValue }) => {
	log('changing', key, ':', oldValue, '-->', value)
})
store.addListener('update', listener('A1'))
store.addListener('update', listener('A2'))
store.addListener('update', listener('A3'))
store.set('foo', 'value 1').then(() => {
	log('Set foo to "value 1" ===', store.get('foo') === 'value 1')
})
store.set('foo', 'value 2').then(() => {
	log('Set foo to "value 2" ===', store.get('foo') === 'value 2')
})
store.set('foo', 'value 3').then(() => {
	log('Set foo to "value 3" ===', store.get('foo') === 'value 3')
})
