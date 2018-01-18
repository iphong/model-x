(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.ModelX = {})));
}(this, (function (exports) { 'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/*
 * Copyright (c) 2018. Developed by Phong Vu
 */

var LISTENERS = Symbol('listeners');
var INTERCEPTORS = Symbol('interceptors');
var RELATION = Symbol('relation');
var PENDING = Symbol('pending');
var PARENT = Symbol('parent');
var PROXY = Symbol('proxy');
var QUEUE = Symbol('queue');
var TARGET = Symbol('target');
var ID = Symbol('id');

var defaultOptions = {
	path: [],
	silent: false,
	remove: false,
	add: false,
	merge: true
};

var counter = 1;

// Set and return unique id
function id(obj) {
	if (!obj) return;
	if (!obj[ID]) define(obj, ID, counter++);
	return obj[ID];
}
// Set property
function define(obj, key, value) {
	if (!obj || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') return;
	Object.defineProperty(obj, key, {
		value: value,
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
		define(obj, Symbol.toStringTag, 'observable(#' + id(obj) + ')');
		define(obj, Symbol.toPrimitive, function () {
			return obj.toString();
		});
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
	var _this = this;

	var obj = reference(target);
	if (available(obj)) {
		pending(obj);
		return new Promise(function () {
			var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve) {
				return regeneratorRuntime.wrap(function _callee$(_context) {
					while (1) {
						switch (_context.prev = _context.next) {
							case 0:
								_context.t0 = resolve;
								_context.next = 3;
								return queue(obj).shift().call();

							case 3:
								_context.t1 = _context.sent;
								(0, _context.t0)(_context.t1);

								release(obj);
								invoke(obj);

							case 7:
							case 'end':
								return _context.stop();
						}
					}
				}, _callee, _this);
			}));

			return function (_x) {
				return _ref.apply(this, arguments);
			};
		}());
	}
}
// Get all listeners
function listeners(target, type) {
	var obj = reference(target);
	if (!obj[LISTENERS]) define(obj, LISTENERS, new Map());
	return obj[LISTENERS];
}
// Get all interceptors
function interceptors(target, type) {
	var obj = reference(target);
	if (!obj[INTERCEPTORS]) define(obj, INTERCEPTORS, new Map());
	return obj[INTERCEPTORS];
}
// Attach listener to object
function listen(obj, type, listener) {
	var map = void 0;
	if (typeof type === 'function' && !listener) map = listeners(obj).set(type);else map = listeners(obj).set(listener, type);
	return map.delete.bind(map, listener);
}
// Intercept values
function intercept(obj, key, interceptor) {
	var map = void 0;
	if (typeof key === 'function' && !interceptor) map = interceptors(obj).set(key);else map = interceptors(obj).set(interceptor, key);
	return map.delete.bind(map, interceptor);
}
// Trigger events to object
function trigger(target, type, payload) {
	var _this2 = this;

	var obj = reference(target);
	return new Promise(function () {
		var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve) {
			var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _ref3, _ref4, fn, e;

			return regeneratorRuntime.wrap(function _callee2$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							_iteratorNormalCompletion = true;
							_didIteratorError = false;
							_iteratorError = undefined;
							_context2.prev = 3;
							_iterator = listeners(obj).entries()[Symbol.iterator]();

						case 5:
							if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
								_context2.next = 21;
								break;
							}

							_ref3 = _step.value;
							_ref4 = _slicedToArray(_ref3, 2);
							fn = _ref4[0];
							e = _ref4[1];

							if (!(e && e.test && e.test(type))) {
								_context2.next = 15;
								break;
							}

							_context2.next = 13;
							return fn(payload);

						case 13:
							_context2.next = 18;
							break;

						case 15:
							if (!(e === type)) {
								_context2.next = 18;
								break;
							}

							_context2.next = 18;
							return fn(payload);

						case 18:
							_iteratorNormalCompletion = true;
							_context2.next = 5;
							break;

						case 21:
							_context2.next = 27;
							break;

						case 23:
							_context2.prev = 23;
							_context2.t0 = _context2['catch'](3);
							_didIteratorError = true;
							_iteratorError = _context2.t0;

						case 27:
							_context2.prev = 27;
							_context2.prev = 28;

							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}

						case 30:
							_context2.prev = 30;

							if (!_didIteratorError) {
								_context2.next = 33;
								break;
							}

							throw _iteratorError;

						case 33:
							return _context2.finish(30);

						case 34:
							return _context2.finish(27);

						case 35:
							resolve();

						case 36:
						case 'end':
							return _context2.stop();
					}
				}
			}, _callee2, _this2, [[3, 23, 27, 35], [28,, 30, 34]]);
		}));

		return function (_x2) {
			return _ref2.apply(this, arguments);
		};
	}());
}
// Mutate object by key value pair
function change(target, key, value, options) {
	var _this3 = this;

	var opts = _extends({}, defaultOptions, options);
	var obj = reference(target);
	return new Promise(function () {
		var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(resolve) {
			var prev, next, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _ref6, _ref7, interceptor, k;

			return regeneratorRuntime.wrap(function _callee3$(_context3) {
				while (1) {
					switch (_context3.prev = _context3.next) {
						case 0:
							prev = obj[key];
							next = value;
							_iteratorNormalCompletion2 = true;
							_didIteratorError2 = false;
							_iteratorError2 = undefined;
							_context3.prev = 5;
							_iterator2 = interceptors(obj).entries()[Symbol.iterator]();

						case 7:
							if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
								_context3.next = 19;
								break;
							}

							_ref6 = _step2.value;
							_ref7 = _slicedToArray(_ref6, 2);
							interceptor = _ref7[0];
							k = _ref7[1];

							if (!(k === key || !k)) {
								_context3.next = 16;
								break;
							}

							_context3.next = 15;
							return interceptor(next, key, obj);

						case 15:
							next = _context3.sent;

						case 16:
							_iteratorNormalCompletion2 = true;
							_context3.next = 7;
							break;

						case 19:
							_context3.next = 25;
							break;

						case 21:
							_context3.prev = 21;
							_context3.t0 = _context3['catch'](5);
							_didIteratorError2 = true;
							_iteratorError2 = _context3.t0;

						case 25:
							_context3.prev = 25;
							_context3.prev = 26;

							if (!_iteratorNormalCompletion2 && _iterator2.return) {
								_iterator2.return();
							}

						case 28:
							_context3.prev = 28;

							if (!_didIteratorError2) {
								_context3.next = 31;
								break;
							}

							throw _iteratorError2;

						case 31:
							return _context3.finish(28);

						case 32:
							return _context3.finish(25);

						case 33:
							obj[key] = next;

							if (!(next && (typeof next === 'undefined' ? 'undefined' : _typeof(next)) === 'object')) {
								_context3.next = 38;
								break;
							}

							if (!prev || (typeof prev === 'undefined' ? 'undefined' : _typeof(prev)) !== 'object') obj[key] = Array.isArray(next) ? [] : {};
							_context3.next = 38;
							return update(obj[key], next, opts);

						case 38:
							if (opts.silent) {
								_context3.next = 43;
								break;
							}

							_context3.next = 41;
							return triggerParent(obj, key, next, prev);

						case 41:
							_context3.next = 43;
							return trigger(obj, 'change', { key: key, next: next, prev: prev });

						case 43:
							_context3.next = 45;
							return resolve();

						case 45:
						case 'end':
							return _context3.stop();
					}
				}
			}, _callee3, _this3, [[5, 21, 25, 33], [26,, 28, 32]]);
		}));

		return function (_x3) {
			return _ref5.apply(this, arguments);
		};
	}());
}

function triggerParent(obj, key, next, prev) {
	var _this4 = this;

	return new Promise(function () {
		var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(resolve) {
			var parent, path, k;
			return regeneratorRuntime.wrap(function _callee4$(_context4) {
				while (1) {
					switch (_context4.prev = _context4.next) {
						case 0:
							parent = obj;
							path = [key];

						case 2:
							if (!(parent && parent[PARENT])) {
								_context4.next = 10;
								break;
							}

							path.unshift(parent[RELATION]);
							k = path.join('.');
							_context4.next = 7;
							return trigger(parent[PARENT], 'change', { key: k, next: next, prev: prev });

						case 7:
							parent = parent[PARENT];
							_context4.next = 2;
							break;

						case 10:
							_context4.next = 12;
							return resolve();

						case 12:
						case 'end':
							return _context4.stop();
					}
				}
			}, _callee4, _this4);
		}));

		return function (_x4) {
			return _ref8.apply(this, arguments);
		};
	}());
}
// Mutate object with an attrs set
function update(target) {
	var _this5 = this;

	var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var options = arguments[2];

	var opts = _extends({}, defaultOptions, options);
	var obj = reference(target);
	var next = {};
	var prev = {};
	return new Promise(function (resolve) {
		queue(obj).push(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
			var previous, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _ref10, _ref11, key, value;

			return regeneratorRuntime.wrap(function _callee5$(_context5) {
				while (1) {
					switch (_context5.prev = _context5.next) {
						case 0:
							previous = _extends({}, obj);
							_iteratorNormalCompletion3 = true;
							_didIteratorError3 = false;
							_iteratorError3 = undefined;
							_context5.prev = 4;
							_iterator3 = Object.entries(props)[Symbol.iterator]();

						case 6:
							if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
								_context5.next = 18;
								break;
							}

							_ref10 = _step3.value;
							_ref11 = _slicedToArray(_ref10, 2);
							key = _ref11[0];
							value = _ref11[1];
							_context5.next = 13;
							return change(obj, key, value, opts);

						case 13:
							next[key] = obj[key];
							prev[key] = previous[key];

						case 15:
							_iteratorNormalCompletion3 = true;
							_context5.next = 6;
							break;

						case 18:
							_context5.next = 24;
							break;

						case 20:
							_context5.prev = 20;
							_context5.t0 = _context5['catch'](4);
							_didIteratorError3 = true;
							_iteratorError3 = _context5.t0;

						case 24:
							_context5.prev = 24;
							_context5.prev = 25;

							if (!_iteratorNormalCompletion3 && _iterator3.return) {
								_iterator3.return();
							}

						case 27:
							_context5.prev = 27;

							if (!_didIteratorError3) {
								_context5.next = 30;
								break;
							}

							throw _iteratorError3;

						case 30:
							return _context5.finish(27);

						case 31:
							return _context5.finish(24);

						case 32:
							_context5.next = 34;
							return resolve();

						case 34:
						case 'end':
							return _context5.stop();
					}
				}
			}, _callee5, _this5, [[4, 20, 24, 32], [25,, 27, 31]]);
		})));
		invoke(obj);
	});
}
// Listener specifically for handle data mutations
function observe(obj, prop, observer) {
	var _this6 = this;

	return listen(obj, 'change', function () {
		var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(_ref13) {
			var key = _ref13.key,
			    next = _ref13.next,
			    prev = _ref13.prev;
			return regeneratorRuntime.wrap(function _callee6$(_context6) {
				while (1) {
					switch (_context6.prev = _context6.next) {
						case 0:
							if (!(typeof prop === 'function' && !observer)) {
								_context6.next = 5;
								break;
							}

							_context6.next = 3;
							return prop(key, next, prev);

						case 3:
							_context6.next = 8;
							break;

						case 5:
							if (!(typeof prop === 'string' && typeof observer === 'function')) {
								_context6.next = 8;
								break;
							}

							_context6.next = 8;
							return observer(next, prev);

						case 8:
						case 'end':
							return _context6.stop();
					}
				}
			}, _callee6, _this6);
		}));

		return function (_x6) {
			return _ref12.apply(this, arguments);
		};
	}());
}
// Get reference
function reference() {
	var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	return obj[TARGET] || obj;
}
// Create a observable proxy
function observable() {
	var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	if (!obj[PROXY]) {
		define(obj, PROXY, new Proxy(obj, {
			get: function get(target, prop) {
				if (prop === TARGET) return target;
				var result = target[prop];
				if (typeof result === 'function') {
					return result;
				}
				if (result && result instanceof Object) {
					define(result, PARENT, target);
					define(result, RELATION, prop);
					return observable(result);
				}
				return result;
			},
			set: function set(target, prop, value) {
				change(target, prop, value);
				return true;
			},
			apply: function apply(fn, target, args) {
				var result = fn.apply(target, args);
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

// export default {
// 	observe,
// 	update,
// 	trigger,
// 	change,
// 	listen,
// 	intercept
// }

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

Object.defineProperty(exports, '__esModule', { value: true });

})));
