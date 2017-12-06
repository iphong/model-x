Object.defineProperty(exports, Symbol.toStringTag, {
	value: '[[ ModelX :: by Phong Vu ]]'
})

const LISTENERS = Symbol('listeners')
const INTERCEPTORS = Symbol('interceptors')
const RELATION = Symbol('relation')
const PENDING = Symbol('pending')
const OPTIONS = Symbol('options')
const PARENT = Symbol('parent')
const PROXY = Symbol('observable')
const QUEUE = Symbol('queue')
const MODEL = Symbol('instance')
const PATH = Symbol('path')
const ID = Symbol('id')

const defaultOptions = {
	path: [],
	silent: false,
	remove: false,
	add: false,
	merge: true
}

let counter = 1

// Set and return unique id
export function id(obj) {
	if (!obj) return
	if (!obj[ID]) define(obj, ID, counter++)
	return obj[ID]
}
// Set property
export function define(obj, key, value) {
	if (!obj || typeof obj !== 'object') return
	Object.defineProperty(obj, key, {
		value,
		writable: true,
		configurable: true
	})
}
// Set pending status
export function pending(obj) {
	define(obj, PENDING, true)
}
// Clear pending status
export function release(obj) {
	define(obj, PENDING, false)
}
// Check for pending status
export function available(obj) {
	if (!obj) return
	return !obj[PENDING] && !!queue(obj, QUEUE, Array).length
}
// Make observability
export function prepare(obj) {
	if (!obj || !obj[ID]) {
		let name = 'Model'
		if (Array.isArray(obj)) name = 'List'
		id(obj)
		define(obj, Symbol.toStringTag, `${name}#${id(obj)}`)
		define(obj, Symbol.toPrimitive, () => obj.toString())
	}
	return obj
}
// Clear all private props
export function cleanup(obj, options = {}) {
	if (!obj) return
	// lets trigger its subscribers before deleting
	return new Promise(async resolve => {
		for (const [key, value] of Object.entries(obj))
			if (value instanceof Object) await cleanup(value)

		Object.getOwnPropertySymbols(obj).forEach(symbol => delete obj[symbol])
		resolve()
	})
}
// Get the queue stack
export function queue(obj) {
	if (!obj[QUEUE]) define(obj, QUEUE, [])
	return obj[QUEUE]
}
// Invoke the next action in queue
export function invoke(target) {
	const obj = model(target)
	if (available(obj)) {
		pending(obj)
		return new Promise(async resolve => {
			resolve(await queue(obj).shift().call())
			release(obj)
			invoke(obj)
		})
	}
}
// Get all listeners
export function listeners(target, type) {
	const obj = model(target)
	if (!obj[LISTENERS]) define(obj, LISTENERS, new Map())
	return obj[LISTENERS]
}
// Get all interceptors
export function interceptors(target, type) {
	const obj = model(target)
	if (!obj[INTERCEPTORS]) define(obj, INTERCEPTORS, new Map())
	return obj[INTERCEPTORS]
}
// Attach listener to object
export function listen(obj, type, listener) {
	const map = listeners(obj).set(listener, type)
	return map.delete.bind(map, listener)
}
// Intercept values
export function intercept(obj, key, interceptor) {
	const map = interceptors(obj).set(interceptor, key)
	return map.delete.bind(map, interceptor)
}
// Trigger events to object
export function trigger(target, type, payload) {
	const obj = model(target)
	return new Promise(async resolve => {
		for (const [fn, e] of listeners(obj).entries()) {
			if (e && e.test && e.test(type)) await fn(payload)
			else if (e === type) await fn(payload)
		}
		resolve()
	})
}
// Mutate object by key value pair
export function change(target, key, value, options) {
	const opts = { ...defaultOptions, ...options }
	const obj = model(target)
	return new Promise(async resolve => {
		const prev = obj[key]
		let next = value
		for (const [interceptor, k] of interceptors(obj).entries())
			if (k === key) next = await interceptor.call(obj, next, obj)
		if (next !== prev) {
			obj[key] = next
			if (!opts.silent) {
				if (prev === void 0) {
					await trigger(obj, `create`, { key, next, prev })
					await trigger(obj, `create:${key}`, { next, prev })
				}
				if (next === void 0) {
					await trigger(obj, `delete`, { key, next, prev })
					await trigger(obj, `delete:${key}`, { next, prev })
				}
				await trigger(obj, `change:${key}`, { next, prev })
				await trigger(obj, `change`, { key, next, prev })
			}
		}
		await resolve()
	})
}
// Mutate object with an attrs set
export function update(target, props = {}, options) {
	const opts = { ...defaultOptions, ...options }
	const obj = model(target)
	const next = {}
	const prev = {}
	return new Promise(resolve => {
		queue(obj).push(async () => {
			const previous = { ...obj }
			for (const [key, value] of Object.entries(props)) {
				await change(obj, key, value, opts)
				next[key] = obj[key]
				prev[key] = previous[key]
			}
			if (!opts.silent) {
				await trigger(obj, 'update', {
					next,
					prev
				})
			}
			await resolve()
		})
		invoke(obj)
	})
}
// Listener specifically for handle data mutations
export function observe(obj, attr, handler) {
	switch (typeof attr) {
		case 'string':
		case 'number':
			return listen(obj, `change:${attr}`, ({ next, prev }) => {
				return handler(next, prev)
			})
		case 'function':
			return listen(obj, 'change', ({ key, next, prev }) => {
				return attr(key, next, prev)
			})
	}
}
// Get reference
export function model(obj = {}) {
	return obj[MODEL] || obj
}
// Create a observable proxy
export function observable(obj = {}) {
	if (obj === null) obj = {}
	if (!obj[PROXY]) {
		define(
			obj,
			PROXY,
			new Proxy(obj, {
				get(target, prop) {
					switch (prop) {
						case 'prototype':
							return target[prop]
						case PROXY:
							return target[PROXY]
						case MODEL:
							return target
					}
					return target[prop]
				},
				set(target, prop, value) {
					update(target, { [prop]: value })
					return true
				},
				apply(fn, ctx, args) {
					const result = fn.apply(ctx, args)
					if (result instanceof Object) {
						return observable(result)
					}
					return result
				}
			})
		)
		prepare(obj)
	}
	return obj[PROXY]
}
