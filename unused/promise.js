import { observe, trigger } from './model'

class Promise2 extends Promise {
	constructor(executor: Function) {
		super((resolve, reject) => {
			executor(resolve, reject, (args) =>
				trigger(this, 'progress', args)
			)
		})
	}
	progress(callback) {
		observe(this, 'progress', callback)
		return this
	}
}

const a = new Promise2((resolve, reject, progress) => {
	let i = 0
	setInterval(() => progress(i++), 1000)
})

a.progress(n => console.log('Current progress', n))
