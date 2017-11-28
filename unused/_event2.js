// @flow
import Events, { EVENTS } from './_event'
import Model, { MODEL, PROXY } from './_model'
import { get, has, set } from './utils'

function getProxy(obj) {
	return get(obj, PROXY)
}
function getEventsOf(obj: {}) {
	if (!has(obj, EVENTS))
		set(obj, EVENTS, new Events(), {
			writable: false,
			configurable: false,
			enumerable: false
		})
	return get(obj, EVENTS)
}
function iterate(obj, iterator) {
	Object.entries(obj).forEach(args => {
		iterator(...args)
	})
}
function attach(target, type, handle) {
	if (target instanceof Model) target[MODEL].addListener(type, handle)
	else getEventsOf(target).addListener(type, handle)
}
function detach(target, type, handle) {
	if (target instanceof Model) target[MODEL].removeListener(type, handle)
	else getEventsOf(target).removeListener(type, handle)
}
function observableObject(obj: {}): Proxy<*> {
	if (!get(obj, PROXY))
		set(
			obj,
			PROXY,
			new Proxy(obj, {
				get(target, prop) {
					return target[prop]
				},
				set(target, prop, value) {
					const key = prop
					const oldValue = this.get(target, prop)
					const newValue = value
					if (newValue !== oldValue) {
						target[prop] = value
						const payload = { key, value, newValue, oldValue }
						const events = getEventsOf(target)
						if (oldValue === void 0) {
							events.emit('create', payload)
						} else if (newValue === void 0) {
							events.emit('remove', payload)
						} else {
							events.emit('change', payload)
						}
						events.emit('update', payload)
					}
					return true
				},
				has(target, prop) {
					return has(target, prop)
				},
				deleteProperty(target, prop) {
					this.set(target, prop, void 0)
					return delete target[prop]
				}
			}),
			{
				enumerable: false
			}
		)
	return get(obj, PROXY)
}
function observableClass(target) {
	return class extends target {
		constructor(...args) {
			super(...args)
			return observableObject(this)
		}
	}
}
function observable(target) {
	if (target instanceof Model) return get(target, 'proxy')
	switch (typeof target) {
		case 'object':
			return observableObject(target)
		case 'function':
			return observableClass(target)
		default:
			return target
	}
}
function observe(
	target: any,
	events:
		| Function
		| {
				create?: Function,
				change?: Function,
				remove?: Function,
				update?: Function
			}
): Function {
	if (typeof events === 'function') attach(target, 'update', events)
	iterate(events, attach.bind(null, target))
	return () => iterate(events, detach.bind(null, target))
}