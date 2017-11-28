(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ModelX = factory());
}(this, (function () { 'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const LISTENERS = Symbol('listeners');
const RELATION = Symbol('relation');
const PENDING = Symbol('pending');
const PARENT = Symbol('parent');
const PROXY = Symbol('proxy');
const QUEUE = Symbol('queue');
const MODEL = Symbol('instance');
const PATH = Symbol('path');
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
function prepare(obj, { relation, parent, path } = {}) {
	if (!obj || !obj[ID]) {
		let name = 'Model';
		if (Array.isArray(obj)) name = 'List';
		id(obj);
		define(obj, Symbol.toStringTag, `${name}#${id(obj)}`);
		define(obj, Symbol.toPrimitive, () => obj.toString());
		define(obj, RELATION, relation);
		define(obj, PARENT, parent);
		define(obj, PATH, path);
	}
	return obj;
}
// Clear all private props
function cleanup(obj, options = {}) {
	if (!obj) return;
	// lets trigger its subscribers before deleting
	return new Promise((() => {
		var _ref = _asyncToGenerator(function* (resolve) {
			for (const [key, value] of Object.entries(obj)) if (value instanceof Object) yield cleanup(value);

			yield trigger(obj, 'delete', options);
			yield notifyParent(obj, 'delete', options);

			Object.getOwnPropertySymbols(obj).forEach(function (symbol) {
				return delete obj[symbol];
			});
			resolve();
		});

		return function (_x) {
			return _ref.apply(this, arguments);
		};
	})());
}

// Get the queue stack
function queue(obj) {
	if (!obj[QUEUE]) define(obj, QUEUE, []);
	return obj[QUEUE];
}
// Invoke the next action in queue
function invoke(target) {
	const obj = model(target);
	if (available(obj)) {
		pending(obj);
		return new Promise((() => {
			var _ref2 = _asyncToGenerator(function* (resolve) {
				resolve((yield queue(obj).shift().call()));
				release(obj);
				invoke(obj);
			});

			return function (_x2) {
				return _ref2.apply(this, arguments);
			};
		})());
	}
}

// Get all observers
function observers(obj, type) {
	if (!obj[LISTENERS]) define(obj, LISTENERS, new Map());
	return obj[LISTENERS];
}
// Attach observer to object
function observe(target, type, observer) {
	const obj = model(target);
	if (!obj || typeof obj !== 'object') return;
	if (typeof type === 'function') {
		observer = type;
		type = void 0;
	}
	const map = observers(obj).set(observer, type);
	return map.delete.bind(map, observer);
}
// Trigger events to object
function trigger(target, type, payload) {
	const obj = model(target);
	return new Promise(resolve => {
		if (!obj || typeof obj !== 'object') resolve();
		setTimeout(_asyncToGenerator(function* () {
			for (const [fn, e] of observers(obj).entries()) {
				if (e && e.test && e.test(type)) yield fn(payload);else if (e === type) yield fn(payload);else if (!e) yield fn(_extends({}, payload, { type }));
			}
			resolve();
		}));
	});
}
// Notify parents recursively on each event
function notifyParent(obj, type, payload) {
	return new Promise((() => {
		var _ref4 = _asyncToGenerator(function* (resolve) {
			if (!obj) return resolve();
			const parent = obj[PARENT];
			if (parent) {
				const key = `${obj[RELATION]}.${payload.key}`;
				yield trigger(parent, `${type}:${key}`, _extends({}, payload, { key }));
				yield notifyParent(parent, type, _extends({}, payload, { key }));
			}
			resolve();
		});

		return function (_x3) {
			return _ref4.apply(this, arguments);
		};
	})());
}

// Mutate object by key value pair
function change(target, key, value, options) {
	const obj = model(target);
	if (!obj || !key) return;
	const opts = _extends({}, defaultOptions, options);
	return new Promise((() => {
		var _ref5 = _asyncToGenerator(function* (resolve) {
			const parent = obj;
			const relation = key;
			const child = obj[key];
			const path = [...opts.path, key];
			if (child && typeof child === 'object') {
				if (value && typeof value === 'object') {
					yield update(child, value, { path, parent });
				} else {
					yield cleanup(child, { key, parent });
					// in case obj is a Proxy, this ensure deleteProperty trap is called
					delete obj[key];
					obj[key] = value;
				}
			} else {
				if (value && typeof value === 'object') {
					if (Array.isArray(value)) obj[key] = [];else obj[key] = {};
					yield prepare(obj[key], { path, parent, relation });
					yield update(obj[key], value, { path, parent });
				} else {
					delete obj[key];
					obj[key] = value;
				}
			}
			if (!opts.silent) {
				yield trigger(obj, `change:${key}`, { key, value: obj[key] });
				yield notifyParent(obj, 'change', { key, value: obj[key] });
			}
			resolve();
		});

		return function (_x4) {
			return _ref5.apply(this, arguments);
		};
	})());
}
// Mutate object with an attrs set
function update(target, props = {}, options) {
	if (!target || typeof target !== 'object') return;
	const obj = model(target);
	if (!obj || !props) return;
	const opts = _extends({}, defaultOptions, options);
	const changes = {};
	const previous = {};
	return new Promise((() => {
		var _ref6 = _asyncToGenerator(function* (resolve) {
			queue(obj).push(_asyncToGenerator(function* () {
				const prev = _extends({}, obj);
				for (const [key, value] of Object.entries(props)) {
					yield change(obj, key, value, opts);
					changes[key] = obj[key];
					previous[key] = prev[key];
				}
				if (!opts.silent) {
					yield trigger(obj, 'update', { changes, previous });
				}
				yield resolve();
			}));
			invoke(obj);
		});

		return function (_x5) {
			return _ref6.apply(this, arguments);
		};
	})());
}
// Listener specifically for handle data mutations
function listen(obj, type, listener) {
	if (!obj || typeof obj !== 'object') return;
	switch (type) {
		case 'update':
			return observe(obj, type, ({ changes, previous }) => {
				return listener(changes, previous);
			});
		default:
			return observe(obj, type, ({ key, value }) => {
				return listener(value);
			});
	}
}

// Get reference
function model(obj = {}) {
	return prepare(obj[MODEL] || obj);
}
function proxy(obj = {}) {
	if (!obj[PROXY]) {
		define(obj, PROXY, new Proxy(obj, {
			get(target, prop) {
				switch (prop) {
					case 'prototype':
						return target[prop];
					case PROXY:
						return target[PROXY];
					case MODEL:
						return target;
				}
				if (target[prop] instanceof Object) {
					return proxy(target[prop]);
				}
				return target[prop];
			},
			set(target, prop, value) {
				update(target, { [prop]: value });
				return true;
			},
			apply(fn, ctx, args) {
				const result = fn.apply(ctx, args);
				if (result instanceof Object) {
					return proxy(result);
				}
				return result;
			}
		}));
		prepare(obj);
	}
	return obj[PROXY];
}

var model$1 = Object.assign(Object.create(null, {
	[Symbol.toStringTag]: {
		value: '[[ ModelX :: by Phong Vu ]]'
	}
}), { proxy, listen, observe, trigger, update });

return model$1;

})));
