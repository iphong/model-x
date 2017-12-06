/*
 * Copyright (c) 2017. Developed by Phong Vu
 */

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/*
 * Copyright (c) 2017. Developed by Phong Vu
 */

Object.defineProperty(exports, Symbol.toStringTag, {
	value: '[[ ModelX :: by Phong Vu ]]'
});

const LISTENERS = Symbol('listeners');
const INTERCEPTORS = Symbol('interceptors');
const RELATION = Symbol('relation');
const PENDING = Symbol('pending');
const PARENT = Symbol('parent');
const PROXY = Symbol('proxy');
const QUEUE = Symbol('queue');
const TARGET = Symbol('target');
const ID = Symbol('id');

const defaultOptions = {
	path: [],
	silent: false,
	remove: false,
	add: false,
	merge: true
};

let counter = 1;

// Set and return unique id
function id(obj) {
	if (!obj) return;
	if (!obj[ID]) define(obj, ID, counter++);
	return obj[ID];
}
// Set property
function define(obj, key, value) {
	if (!obj || typeof obj !== 'object') return;
	Object.defineProperty(obj, key, {
		value,
		writable: true,
		configurable: true
	});
}
// Set pending status
function pending(obj) {
	define(obj, PENDING, true);
}
// Clear pending status
function release(obj) {
	define(obj, PENDING, false);
}
// Check for pending status
function available(obj) {
	if (!obj) return;
	return !obj[PENDING] && !!queue(obj, QUEUE, Array).length;
}
// Make observability
function prepare(obj) {
	if (obj && !obj[ID]) {
		const name = 'Model';
		define(obj, Symbol.toStringTag, `${name}#${id(obj)}`);
		define(obj, Symbol.toPrimitive, () => obj.toString());
		define(obj, TARGET, obj);
	}
	return obj;
}
// Get the queue stack
function queue(obj) {
	if (!obj[QUEUE]) define(obj, QUEUE, []);
	return obj[QUEUE];
}
// Invoke the next action in queue
function invoke(target) {
	const obj = reference(target);
	if (available(obj)) {
		pending(obj);
		return new Promise((() => {
			var _ref = _asyncToGenerator(function* (resolve) {
				resolve((yield queue(obj).shift().call()));
				release(obj);
				invoke(obj);
			});

			return function (_x) {
				return _ref.apply(this, arguments);
			};
		})());
	}
}
// Get all listeners
function listeners(target, type) {
	const obj = reference(target);
	if (!obj[LISTENERS]) define(obj, LISTENERS, new Map());
	return obj[LISTENERS];
}
// Get all interceptors
function interceptors(target, type) {
	const obj = reference(target);
	if (!obj[INTERCEPTORS]) define(obj, INTERCEPTORS, new Map());
	return obj[INTERCEPTORS];
}
// Attach listener to object
function listen(obj, type, listener) {
	let map;
	if (typeof type === 'function' && !listener) map = listeners(obj).set(type);else map = listeners(obj).set(listener, type);
	return map.delete.bind(map, listener);
}
// Intercept values
function intercept(obj, key, interceptor) {
	let map;
	if (typeof key === 'function' && !interceptor) map = interceptors(obj).set(key);else map = interceptors(obj).set(interceptor, key);
	return map.delete.bind(map, interceptor);
}
// Trigger events to object
function trigger(target, type, payload) {
	const obj = reference(target);
	return new Promise((() => {
		var _ref2 = _asyncToGenerator(function* (resolve) {
			for (const [fn, e] of listeners(obj).entries()) {
				if (e && e.test && e.test(type)) yield fn(payload);else if (e === type) yield fn(payload);
			}
			resolve();
		});

		return function (_x2) {
			return _ref2.apply(this, arguments);
		};
	})());
}
// Mutate object by key value pair
function change(target, key, value, options) {
	const opts = _extends({}, defaultOptions, options);
	const obj = reference(target);
	return new Promise((() => {
		var _ref3 = _asyncToGenerator(function* (resolve) {
			const prev = obj[key];
			let next = value;
			for (const [interceptor, k] of interceptors(obj).entries()) if (k === key || !k) next = yield interceptor(next, key, obj);
			obj[key] = next;
			if (next && typeof next === 'object') {
				if (!prev || typeof prev !== 'object') obj[key] = Array.isArray(next) ? [] : {};
				yield update(obj[key], next, opts);
			}
			if (!opts.silent) {
				yield triggerParent(obj, key, next, prev);
				yield trigger(obj, `change`, { key, next, prev });
			}
			yield resolve();
		});

		return function (_x3) {
			return _ref3.apply(this, arguments);
		};
	})());
}
function triggerParent(obj, key, next, prev) {
	return new Promise((() => {
		var _ref4 = _asyncToGenerator(function* (resolve) {
			let parent = obj;
			const path = [key];
			while (parent && parent[PARENT]) {
				path.unshift(parent[RELATION]);
				const k = path.join('.');
				yield trigger(parent[PARENT], 'change', { key: k, next, prev });
				parent = parent[PARENT];
			}
			yield resolve();
		});

		return function (_x4) {
			return _ref4.apply(this, arguments);
		};
	})());
}
// Mutate object with an attrs set
function update(target, props = {}, options) {
	const opts = _extends({}, defaultOptions, options);
	const obj = reference(target);
	const next = {};
	const prev = {};
	return new Promise(resolve => {
		queue(obj).push(_asyncToGenerator(function* () {
			const previous = _extends({}, obj);
			for (const [key, value] of Object.entries(props)) {
				yield change(obj, key, value, opts);
				next[key] = obj[key];
				prev[key] = previous[key];
			}
			yield resolve();
		}));
		invoke(obj);
	});
}
// Listener specifically for handle data mutations
function observe(obj, prop, observer) {
	return new Promise(resolve => {
		listen(obj, 'change', (() => {
			var _ref6 = _asyncToGenerator(function* ({ key, next, prev }) {
				if (typeof prop === 'function' && !observer) yield prop(key, next, prev);else if (typeof prop === 'string' && typeof observer === 'function') yield observer(next, prev);
				yield resolve();
			});

			return function (_x5) {
				return _ref6.apply(this, arguments);
			};
		})());
	});
}
// Get reference
function reference(obj = {}) {
	return obj[TARGET] || obj;
}
// Create a observable proxy
function observable(obj = {}) {
	if (!obj[PROXY]) {
		define(obj, PROXY, new Proxy(obj, {
			get(target, prop) {
				if (prop === TARGET) return target;
				const result = target[prop];
				if (typeof result === 'function') {
					return result;
					// return (...args) => new Promise(resolve => {
					// 	queue(target).push(async () => {
					// 		let output = await result.apply(target, args)
					// 		if (output && output instanceof Object) {
					// 			output = observable(output)
					// 		}
					// 		resolve(output)
					// 	})
					// 	invoke(obj)
					// })
				}
				if (result && result instanceof Object) {
					define(result, PARENT, target);
					define(result, RELATION, prop);
					return observable(result);
				}
				return result;
			},
			set(target, prop, value) {
				change(target, prop, value);
				return true;
			},
			apply(fn, target, args) {
				const result = fn.apply(target, args);
				if (result && result instanceof Object) {
					return observable(result);
				}
				return result;
			}
		}));
		prepare(obj);
	}
	return obj[PROXY];
}

exports.id = id;
exports.define = define;
exports.pending = pending;
exports.release = release;
exports.available = available;
exports.prepare = prepare;
exports.queue = queue;
exports.invoke = invoke;
exports.listeners = listeners;
exports.interceptors = interceptors;
exports.listen = listen;
exports.intercept = intercept;
exports.trigger = trigger;
exports.change = change;
exports.triggerParent = triggerParent;
exports.update = update;
exports.observe = observe;
exports.reference = reference;
exports.observable = observable;
