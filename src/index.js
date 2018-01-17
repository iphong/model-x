/*
 * Copyright (c) 2018. Developed by Phong Vu
 */

const LISTENERS = Symbol('listeners')
const INTERCEPTORS = Symbol('interceptors')
const RELATION = Symbol('relation')
const PENDING = Symbol('pending')
const OPTIONS = Symbol('options')
const PARENT = Symbol('parent')
const PROXY = Symbol('proxy')
const QUEUE = Symbol('queue')
const TARGET = Symbol('target')
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
	if (obj && !obj[ID]) {
		define(obj, Symbol.toStringTag, `observable(#${id(obj)})`)
		define(obj, Symbol.toPrimitive, () => obj.toString())
		define(obj, TARGET, obj)
	}
	return obj
}
// Get the queue stack
export function queue(obj) {
	if (!obj[QUEUE]) define(obj, QUEUE, [])
	return obj[QUEUE]
}
// Invoke the next action in queue
export function invoke(target) {
	const obj = reference(target)
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
	const obj = reference(target)
	if (!obj[LISTENERS]) define(obj, LISTENERS, new Map())
	return obj[LISTENERS]
}
// Get all interceptors
export function interceptors(target, type) {
	const obj = reference(target)
	if (!obj[INTERCEPTORS]) define(obj, INTERCEPTORS, new Map())
	return obj[INTERCEPTORS]
}
// Attach listener to object
export function listen(obj, type, listener) {
	let map
	if (typeof type === 'function' && !listener)
		map = listeners(obj).set(type)
	else
		map = listeners(obj).set(listener, type)
	return map.delete.bind(map, listener)
}
// Intercept values
export function intercept(obj, key, interceptor) {
	let map
	if (typeof key === 'function' && !interceptor)
		map = interceptors(obj).set(key)
	else
		map = interceptors(obj).set(interceptor, key)
	return map.delete.bind(map, interceptor)
}
// Trigger events to object
export function trigger(target, type, payload) {
	const obj = reference(target)
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
	const obj = reference(target)
	return new Promise(async resolve => {
		const prev = obj[key]
		let next = value
		for (const [interceptor, k] of interceptors(obj).entries())
			if (k === key || !k) next = await interceptor(next, key, obj)
		obj[key] = next
		if (next && typeof next === 'object') {
			if (!prev || typeof prev !== 'object')
				obj[key] = Array.isArray(next) ? [] : {}
			await update(obj[key], next, opts)
		}
		if (!opts.silent) {
			await triggerParent(obj, key, next, prev)
			await trigger(obj, `change`, { key, next, prev })
		}
		await resolve()
	})
}

export function triggerParent(obj, key, next, prev) {
	return new Promise(async resolve => {
		let parent = obj
		const path = [key]
		while (parent && parent[PARENT]) {
			path.unshift(parent[RELATION])
			const k = path.join('.')
			await trigger(parent[PARENT], 'change', { key: k, next, prev })
			parent = parent[PARENT]
		}
		await resolve()
	})
}
// Mutate object with an attrs set
export function update(target, props = {}, options) {
	const opts = { ...defaultOptions, ...options }
	const obj = reference(target)
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
			await resolve()
		})
		invoke(obj)
	})
}
// Listener specifically for handle data mutations
export function observe(obj, prop, observer) {
	return listen(obj, 'change', async ({ key, next, prev }) => {
		if (typeof prop === 'function' && !observer)
			await prop(key, next, prev)
		else if (typeof prop === 'string' && typeof observer === 'function')
			await observer(next, prev)
	})
}
// Get reference
export function reference(obj = {}) {
	return obj[TARGET] || obj
}
// Create a observable proxy
export function observable(obj = {}) {
	if (!obj[PROXY]) {
		define(
			obj,
			PROXY,
			new Proxy(obj, {
				get(target, prop) {
					if (prop === TARGET) return target
					const result = target[prop]
					if (typeof result === 'function') {
						return result
					}
					if (result && result instanceof Object) {
						define(result, PARENT, target)
						define(result, RELATION, prop)
						return observable(result)
					}
					return result
				},
				set(target, prop, value) {
					change(target, prop, value)
					return true
				},
				apply(fn, target, args) {
					const result = fn.apply(target, args)
					if (result && result instanceof Object) {
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

// export default {
// 	observe,
// 	update,
// 	trigger,
// 	change,
// 	listen,
// 	intercept
// }