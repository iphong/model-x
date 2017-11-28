// @flow
import Events from './_event'
import { set, get, has, is } from './utils'

type symbol = Symbol
type attrs = {}
type options = { related?: string, parent?: ?Model }

export const REF = Symbol('model.reference')
export const ATTRS = Symbol('model.attrs')
export const MODEL = Symbol('model.type')
export const QUEUE = Symbol('model.queue')
export const PROXY = Symbol('model.proxy')
export const PENDING = Symbol('model.pending')

export default class Model extends Events {
	constructor(keys?: attrs, opts?: options) {
		super()
		setRef(this)
		this.set(keys, { silent: true })
	}
	get(key: any): any {
		return getAttrs(this).get(key)
	}
	has(key: any): boolean {
		return getAttrs(this).has(key)
	}
	async emitParent(type: any, payload: {} = {}) {
		if (get(this, 'parent')) {
			const data = { ...payload }
			if (get(this, 'related')) data.key = get(this, 'related')
			await get(this, 'parent').emit(type, data)
			await get(this, 'parent').emitParent(type, data)
		}
	}
	async set(key: any, value: any, opts?: ?{ silent?: boolean }): any {
		const keys = getAttrs(this)
		const queue = getQueue(this)
		const silent = get(opts, 'silent')
		if (isBusy(this))
			return new Promise(resolve => {
				queue.push(
					async () => await this.set(key, value, opts).then(resolve)
				)
			})
		else
			switch (typeof key) {
				case 'object':
					for (const n in key) await this.set(n, key[n], value)
					return
				case 'string':
					const oldValue = this.get(key)
					const newValue = value
					if (oldValue !== value) {
						keys.set(key, value)
						setBusy(this)
						if (!silent) {
							const payload = { key, value, oldValue, newValue }
							if (oldValue === void 0) {
								await this.emit('create', payload)
							} else if (newValue === void 0) {
								await this.emit('remove', payload)
							} else {
								await this.emit('change', payload)
							}
							await this.emit('update', payload)
						}
					}
					break
				default:
					break
			}
		setFree(this)
		if (queue.length) setTimeout(await queue.shift())
		return
	}
}

export function setRef(model: Model) {
	set(model, REF, model, {
		enumerable: false,
		configurable: false
	})
}

export function getAttrs(model: Model) {
	if (!has(model, ATTRS))
		set(model, ATTRS, new Map(), {
			enumerable: false
		})
	return get(model, ATTRS)
}

export function getQueue(model: Model) {
	if (!has(model, QUEUE))
		set(model, QUEUE, [], {
			enumerable: false
		})
	return get(model, QUEUE)
}

export function isBusy(model: Model) {
	return is(model, PENDING, true)
}

export function setBusy(model: Model) {
	set(model, PENDING, true, { enumerable: false, writable: true })
}

export function setFree(model: Model) {
	set(model, PENDING, void 0, { enumerable: false, writable: true })
}
