import Events from './_event'

const events = new Events()
const delay = async time => new Promise(resolve => setTimeout(resolve, time))

events.addListener('bar', time => {
	return delay(Math.random() * 1000 + time).then(() =>
		console.log('on bar 1')
	)
})
events.addListener('bar', time => {
	return delay(Math.random() * 1000 + time * 2).then(() =>
		console.log('on bar 2')
	)
})

events.emit('bar', 1000).then(() => {
	console.log('emit bar 1 done')
})
events.emit('bar', 2000).then(() => {
	console.log('emit bar 2 done')
})
events.emit('bar', 3000).then(() => {
	console.log('emit bar 3 done')
})
