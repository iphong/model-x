// @flow
import { get, has, set, delay } from './utils'

export const EVENTS = Symbol('event.events')
export const LISTENERS = Symbol('event.listeners')
export const INSTANCE = Symbol('event.instance')

export function getListeners(obj: {}) {
	if (!has(obj, LISTENERS))
		set(obj, LISTENERS, new Map(), {
			enumerable: false
		})
	return get(obj, LISTENERS)
}

export default class Events {
	addListener(type: any, listener: Function, context: ?{}) {
		const events = getListeners(this)
		if (!events.get(type)) events.set(type, new Set())
		events.get(type).add({ listener, context })
	}
	removeListener(type: any, listener: Function, context: ?{}) {
		const events = getListeners(this)
		const handle = itemType => {
			return (item, index, items) => {
				const ok = [0, 0, 0]
				if (!type || itemType === type) ok[0] = 1
				if (!context || item.context === context) ok[1] = 1
				if (!listener || item.listener === listener) ok[2] = 1
				if (ok[0] && ok[1] && ok[2]) items.delete(item)
			}
		}
		if (events.has(type)) events.get(type).forEach(handle(type))
		else events.forEach((v, k) => v.forEach(handle(k)))
	}
	once(type: any, listener: Function, context: ?{}) {
		const wrap = async (...args) => {
			await listener.call(context, ...args)
			this.removeListener(type, wrap)
		}
		return this.addListener(type, wrap, context)
	}
	totalListeners(): number {
		let counter = 0
		getListeners(this).forEach(event => (counter += event.size))
		return counter
	}
	async emit(type: any, ...args: any): any {
		const listeners = getListeners(this).get(type)
		if (listeners)
			await Promise.all(
				[...listeners].map(
					async ({ listener, context }) =>
						await listener.call(context, ...args)
				)
			)
		return
	}
}
