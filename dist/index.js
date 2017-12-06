'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};









var asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};









var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};





















var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

Object.defineProperty(exports, Symbol.toStringTag, {
	value: '[[ ModelX :: by Phong Vu ]]'
});

var LISTENERS = Symbol('listeners');
var INTERCEPTORS = Symbol('interceptors');
var PENDING = Symbol('pending');
var PROXY = Symbol('observable');
var QUEUE = Symbol('queue');
var MODEL = Symbol('instance');
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
	if (!obj || !obj[ID]) {
		var name = 'Model';
		if (Array.isArray(obj)) name = 'List';
		id(obj);
		define(obj, Symbol.toStringTag, name + '#' + id(obj));
		define(obj, Symbol.toPrimitive, function () {
			return obj.toString();
		});
	}
	return obj;
}
// Clear all private props
function cleanup(obj) {
	var _this = this;

	if (!obj) return;
	// lets trigger its subscribers before deleting
	return new Promise(function () {
		var _ref = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve) {
			var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _step$value, key, value;

			return regeneratorRuntime.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							_iteratorNormalCompletion = true;
							_didIteratorError = false;
							_iteratorError = undefined;
							_context.prev = 3;
							_iterator = Object.entries(obj)[Symbol.iterator]();

						case 5:
							if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
								_context.next = 13;
								break;
							}

							_step$value = slicedToArray(_step.value, 2), key = _step$value[0], value = _step$value[1];

							if (!(value instanceof Object)) {
								_context.next = 10;
								break;
							}

							_context.next = 10;
							return cleanup(value);

						case 10:
							_iteratorNormalCompletion = true;
							_context.next = 5;
							break;

						case 13:
							_context.next = 19;
							break;

						case 15:
							_context.prev = 15;
							_context.t0 = _context['catch'](3);
							_didIteratorError = true;
							_iteratorError = _context.t0;

						case 19:
							_context.prev = 19;
							_context.prev = 20;

							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}

						case 22:
							_context.prev = 22;

							if (!_didIteratorError) {
								_context.next = 25;
								break;
							}

							throw _iteratorError;

						case 25:
							return _context.finish(22);

						case 26:
							return _context.finish(19);

						case 27:

							Object.getOwnPropertySymbols(obj).forEach(function (symbol) {
								return delete obj[symbol];
							});
							resolve();

						case 29:
						case 'end':
							return _context.stop();
					}
				}
			}, _callee, _this, [[3, 15, 19, 27], [20,, 22, 26]]);
		}));

		return function (_x2) {
			return _ref.apply(this, arguments);
		};
	}());
}
// Get the queue stack
function queue(obj) {
	if (!obj[QUEUE]) define(obj, QUEUE, []);
	return obj[QUEUE];
}
// Invoke the next action in queue
function invoke(target) {
	var _this2 = this;

	var obj = model(target);
	if (available(obj)) {
		pending(obj);
		return new Promise(function () {
			var _ref2 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve) {
				return regeneratorRuntime.wrap(function _callee2$(_context2) {
					while (1) {
						switch (_context2.prev = _context2.next) {
							case 0:
								_context2.t0 = resolve;
								_context2.next = 3;
								return queue(obj).shift().call();

							case 3:
								_context2.t1 = _context2.sent;
								(0, _context2.t0)(_context2.t1);

								release(obj);
								invoke(obj);

							case 7:
							case 'end':
								return _context2.stop();
						}
					}
				}, _callee2, _this2);
			}));

			return function (_x3) {
				return _ref2.apply(this, arguments);
			};
		}());
	}
}
// Get all listeners
function listeners(target, type) {
	var obj = model(target);
	if (!obj[LISTENERS]) define(obj, LISTENERS, new Map());
	return obj[LISTENERS];
}
// Get all interceptors
function interceptors(target, type) {
	var obj = model(target);
	if (!obj[INTERCEPTORS]) define(obj, INTERCEPTORS, new Map());
	return obj[INTERCEPTORS];
}
// Attach listener to object
function listen(obj, type, listener) {
	var map = listeners(obj).set(listener, type);
	return map.delete.bind(map, listener);
}
// Intercept values
function intercept(obj, key, interceptor) {
	var map = interceptors(obj).set(interceptor, key);
	return map.delete.bind(map, interceptor);
}
// Trigger events to object
function trigger(target, type, payload) {
	var _this3 = this;

	var obj = model(target);
	return new Promise(function () {
		var _ref3 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(resolve) {
			var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _step2$value, fn, e;

			return regeneratorRuntime.wrap(function _callee3$(_context3) {
				while (1) {
					switch (_context3.prev = _context3.next) {
						case 0:
							_iteratorNormalCompletion2 = true;
							_didIteratorError2 = false;
							_iteratorError2 = undefined;
							_context3.prev = 3;
							_iterator2 = listeners(obj).entries()[Symbol.iterator]();

						case 5:
							if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
								_context3.next = 18;
								break;
							}

							_step2$value = slicedToArray(_step2.value, 2), fn = _step2$value[0], e = _step2$value[1];

							if (!(e && e.test && e.test(type))) {
								_context3.next = 12;
								break;
							}

							_context3.next = 10;
							return fn(payload);

						case 10:
							_context3.next = 15;
							break;

						case 12:
							if (!(e === type)) {
								_context3.next = 15;
								break;
							}

							_context3.next = 15;
							return fn(payload);

						case 15:
							_iteratorNormalCompletion2 = true;
							_context3.next = 5;
							break;

						case 18:
							_context3.next = 24;
							break;

						case 20:
							_context3.prev = 20;
							_context3.t0 = _context3['catch'](3);
							_didIteratorError2 = true;
							_iteratorError2 = _context3.t0;

						case 24:
							_context3.prev = 24;
							_context3.prev = 25;

							if (!_iteratorNormalCompletion2 && _iterator2.return) {
								_iterator2.return();
							}

						case 27:
							_context3.prev = 27;

							if (!_didIteratorError2) {
								_context3.next = 30;
								break;
							}

							throw _iteratorError2;

						case 30:
							return _context3.finish(27);

						case 31:
							return _context3.finish(24);

						case 32:
							resolve();

						case 33:
						case 'end':
							return _context3.stop();
					}
				}
			}, _callee3, _this3, [[3, 20, 24, 32], [25,, 27, 31]]);
		}));

		return function (_x4) {
			return _ref3.apply(this, arguments);
		};
	}());
}
// Mutate object by key value pair
function change(target, key, value, options) {
	var _this4 = this;

	var opts = _extends({}, defaultOptions, options);
	var obj = model(target);
	return new Promise(function () {
		var _ref4 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(resolve) {
			var prev, next, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _step3$value, interceptor, k;

			return regeneratorRuntime.wrap(function _callee4$(_context4) {
				while (1) {
					switch (_context4.prev = _context4.next) {
						case 0:
							prev = obj[key];
							next = value;
							_iteratorNormalCompletion3 = true;
							_didIteratorError3 = false;
							_iteratorError3 = undefined;
							_context4.prev = 5;
							_iterator3 = interceptors(obj).entries()[Symbol.iterator]();

						case 7:
							if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
								_context4.next = 16;
								break;
							}

							_step3$value = slicedToArray(_step3.value, 2), interceptor = _step3$value[0], k = _step3$value[1];

							if (!(k === key)) {
								_context4.next = 13;
								break;
							}

							_context4.next = 12;
							return interceptor.call(obj, next, obj);

						case 12:
							next = _context4.sent;

						case 13:
							_iteratorNormalCompletion3 = true;
							_context4.next = 7;
							break;

						case 16:
							_context4.next = 22;
							break;

						case 18:
							_context4.prev = 18;
							_context4.t0 = _context4['catch'](5);
							_didIteratorError3 = true;
							_iteratorError3 = _context4.t0;

						case 22:
							_context4.prev = 22;
							_context4.prev = 23;

							if (!_iteratorNormalCompletion3 && _iterator3.return) {
								_iterator3.return();
							}

						case 25:
							_context4.prev = 25;

							if (!_didIteratorError3) {
								_context4.next = 28;
								break;
							}

							throw _iteratorError3;

						case 28:
							return _context4.finish(25);

						case 29:
							return _context4.finish(22);

						case 30:
							if (!(next !== prev)) {
								_context4.next = 47;
								break;
							}

							obj[key] = next;

							if (opts.silent) {
								_context4.next = 47;
								break;
							}

							if (!(prev === void 0)) {
								_context4.next = 38;
								break;
							}

							_context4.next = 36;
							return trigger(obj, 'create', { key: key, next: next, prev: prev });

						case 36:
							_context4.next = 38;
							return trigger(obj, 'create:' + key, { next: next, prev: prev });

						case 38:
							if (!(next === void 0)) {
								_context4.next = 43;
								break;
							}

							_context4.next = 41;
							return trigger(obj, 'delete', { key: key, next: next, prev: prev });

						case 41:
							_context4.next = 43;
							return trigger(obj, 'delete:' + key, { next: next, prev: prev });

						case 43:
							_context4.next = 45;
							return trigger(obj, 'change:' + key, { next: next, prev: prev });

						case 45:
							_context4.next = 47;
							return trigger(obj, 'change', { key: key, next: next, prev: prev });

						case 47:
							_context4.next = 49;
							return resolve();

						case 49:
						case 'end':
							return _context4.stop();
					}
				}
			}, _callee4, _this4, [[5, 18, 22, 30], [23,, 25, 29]]);
		}));

		return function (_x5) {
			return _ref4.apply(this, arguments);
		};
	}());
}
// Mutate object with an attrs set
function update(target) {
	var _this5 = this;

	var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var options = arguments[2];

	var opts = _extends({}, defaultOptions, options);
	var obj = model(target);
	var next = {};
	var prev = {};
	return new Promise(function (resolve) {
		queue(obj).push(asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
			var previous, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _step4$value, key, value;

			return regeneratorRuntime.wrap(function _callee5$(_context5) {
				while (1) {
					switch (_context5.prev = _context5.next) {
						case 0:
							previous = _extends({}, obj);
							_iteratorNormalCompletion4 = true;
							_didIteratorError4 = false;
							_iteratorError4 = undefined;
							_context5.prev = 4;
							_iterator4 = Object.entries(props)[Symbol.iterator]();

						case 6:
							if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
								_context5.next = 15;
								break;
							}

							_step4$value = slicedToArray(_step4.value, 2), key = _step4$value[0], value = _step4$value[1];
							_context5.next = 10;
							return change(obj, key, value, opts);

						case 10:
							next[key] = obj[key];
							prev[key] = previous[key];

						case 12:
							_iteratorNormalCompletion4 = true;
							_context5.next = 6;
							break;

						case 15:
							_context5.next = 21;
							break;

						case 17:
							_context5.prev = 17;
							_context5.t0 = _context5['catch'](4);
							_didIteratorError4 = true;
							_iteratorError4 = _context5.t0;

						case 21:
							_context5.prev = 21;
							_context5.prev = 22;

							if (!_iteratorNormalCompletion4 && _iterator4.return) {
								_iterator4.return();
							}

						case 24:
							_context5.prev = 24;

							if (!_didIteratorError4) {
								_context5.next = 27;
								break;
							}

							throw _iteratorError4;

						case 27:
							return _context5.finish(24);

						case 28:
							return _context5.finish(21);

						case 29:
							if (opts.silent) {
								_context5.next = 32;
								break;
							}

							_context5.next = 32;
							return trigger(obj, 'update', {
								next: next,
								prev: prev
							});

						case 32:
							_context5.next = 34;
							return resolve();

						case 34:
						case 'end':
							return _context5.stop();
					}
				}
			}, _callee5, _this5, [[4, 17, 21, 29], [22,, 24, 28]]);
		})));
		invoke(obj);
	});
}
// Listener specifically for handle data mutations
function observe(obj, attr, handler) {
	switch (typeof attr === 'undefined' ? 'undefined' : _typeof(attr)) {
		case 'string':
		case 'number':
			return listen(obj, 'change:' + attr, function (_ref6) {
				var next = _ref6.next,
				    prev = _ref6.prev;

				return handler(next, prev);
			});
		case 'function':
			return listen(obj, 'change', function (_ref7) {
				var key = _ref7.key,
				    next = _ref7.next,
				    prev = _ref7.prev;

				return attr(key, next, prev);
			});
	}
}
// Get reference
function model() {
	var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	return obj[MODEL] || obj;
}
// Create a observable proxy
function observable() {
	var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	if (obj === null) obj = {};
	if (!obj[PROXY]) {
		define(obj, PROXY, new Proxy(obj, {
			get: function get$$1(target, prop) {
				switch (prop) {
					case 'prototype':
						return target[prop];
					case PROXY:
						return target[PROXY];
					case MODEL:
						return target;
				}
				return target[prop];
			},
			set: function set$$1(target, prop, value) {
				update(target, defineProperty({}, prop, value));
				return true;
			},
			apply: function apply(fn, ctx, args) {
				var result = fn.apply(ctx, args);
				if (result instanceof Object) {
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
exports.cleanup = cleanup;
exports.queue = queue;
exports.invoke = invoke;
exports.listeners = listeners;
exports.interceptors = interceptors;
exports.listen = listen;
exports.intercept = intercept;
exports.trigger = trigger;
exports.change = change;
exports.update = update;
exports.observe = observe;
exports.model = model;
exports.observable = observable;
