(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ModelX = factory());
}(this, (function () { 'use strict';

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













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var LISTENERS = Symbol('listeners');
var RELATION = Symbol('relation');
var PENDING = Symbol('pending');
var PARENT = Symbol('parent');
var PROXY = Symbol('proxy');
var QUEUE = Symbol('queue');
var MODEL = Symbol('instance');
var PATH = Symbol('path');
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
	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    relation = _ref.relation,
	    parent = _ref.parent,
	    path = _ref.path;

	if (!obj || !obj[ID]) {
		var name = 'Model';
		if (Array.isArray(obj)) name = 'List';
		id(obj);
		define(obj, Symbol.toStringTag, name + '#' + id(obj));
		define(obj, Symbol.toPrimitive, function () {
			return obj.toString();
		});
		define(obj, RELATION, relation);
		define(obj, PARENT, parent);
		define(obj, PATH, path);
	}
	return obj;
}
// Clear all private props
function cleanup(obj) {
	var _this = this;

	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	if (!obj) return;
	// lets trigger its subscribers before deleting
	return new Promise(function () {
		var _ref2 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve) {
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
							_context.next = 29;
							return trigger(obj, 'delete', options);

						case 29:
							_context.next = 31;
							return notifyParent(obj, 'delete', options);

						case 31:

							Object.getOwnPropertySymbols(obj).forEach(function (symbol) {
								return delete obj[symbol];
							});
							resolve();

						case 33:
						case 'end':
							return _context.stop();
					}
				}
			}, _callee, _this, [[3, 15, 19, 27], [20,, 22, 26]]);
		}));

		return function (_x3) {
			return _ref2.apply(this, arguments);
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
			var _ref3 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve) {
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

			return function (_x4) {
				return _ref3.apply(this, arguments);
			};
		}());
	}
}

// Get all observers
function observers(obj, type) {
	if (!obj[LISTENERS]) define(obj, LISTENERS, new Map());
	return obj[LISTENERS];
}
// Attach observer to object
function observe(target, type, observer) {
	var obj = model(target);
	if (!obj) return;
	if (typeof type === 'function') {
		observer = type;
		type = void 0;
	}
	var map = observers(obj).set(observer, type);
	return map.delete.bind(map, observer);
}
// Trigger events to object
function trigger(target, type, payload) {
	var _this3 = this;

	var obj = model(target);
	return new Promise(function (resolve) {
		setTimeout(asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
			var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _step2$value, fn, e;

			return regeneratorRuntime.wrap(function _callee3$(_context3) {
				while (1) {
					switch (_context3.prev = _context3.next) {
						case 0:
							_iteratorNormalCompletion2 = true;
							_didIteratorError2 = false;
							_iteratorError2 = undefined;
							_context3.prev = 3;
							_iterator2 = observers(obj).entries()[Symbol.iterator]();

						case 5:
							if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
								_context3.next = 23;
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
							_context3.next = 20;
							break;

						case 12:
							if (!(e === type)) {
								_context3.next = 17;
								break;
							}

							_context3.next = 15;
							return fn(payload);

						case 15:
							_context3.next = 20;
							break;

						case 17:
							if (e) {
								_context3.next = 20;
								break;
							}

							_context3.next = 20;
							return fn(_extends({}, payload, { type: type }));

						case 20:
							_iteratorNormalCompletion2 = true;
							_context3.next = 5;
							break;

						case 23:
							_context3.next = 29;
							break;

						case 25:
							_context3.prev = 25;
							_context3.t0 = _context3['catch'](3);
							_didIteratorError2 = true;
							_iteratorError2 = _context3.t0;

						case 29:
							_context3.prev = 29;
							_context3.prev = 30;

							if (!_iteratorNormalCompletion2 && _iterator2.return) {
								_iterator2.return();
							}

						case 32:
							_context3.prev = 32;

							if (!_didIteratorError2) {
								_context3.next = 35;
								break;
							}

							throw _iteratorError2;

						case 35:
							return _context3.finish(32);

						case 36:
							return _context3.finish(29);

						case 37:
							resolve();

						case 38:
						case 'end':
							return _context3.stop();
					}
				}
			}, _callee3, _this3, [[3, 25, 29, 37], [30,, 32, 36]]);
		})));
	});
}
// Notify parents recursively on each event
function notifyParent(obj, type, payload) {
	var _this4 = this;

	return new Promise(function () {
		var _ref5 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(resolve) {
			var parent, key;
			return regeneratorRuntime.wrap(function _callee4$(_context4) {
				while (1) {
					switch (_context4.prev = _context4.next) {
						case 0:
							if (obj) {
								_context4.next = 2;
								break;
							}

							return _context4.abrupt('return', resolve());

						case 2:
							parent = obj[PARENT];

							if (!parent) {
								_context4.next = 9;
								break;
							}

							key = obj[RELATION] + '.' + payload.key;
							_context4.next = 7;
							return trigger(parent, type + ':' + key, _extends({}, payload, { key: key }));

						case 7:
							_context4.next = 9;
							return notifyParent(parent, type, _extends({}, payload, { key: key }));

						case 9:
							resolve();

						case 10:
						case 'end':
							return _context4.stop();
					}
				}
			}, _callee4, _this4);
		}));

		return function (_x5) {
			return _ref5.apply(this, arguments);
		};
	}());
}

// Mutate object by key value pair
function change(target, key, value, options) {
	var _this5 = this;

	var obj = model(target);
	if (!obj || !key) return;
	var opts = _extends({}, defaultOptions, options);
	return new Promise(function () {
		var _ref6 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(resolve) {
			var parent, relation, child, path;
			return regeneratorRuntime.wrap(function _callee5$(_context5) {
				while (1) {
					switch (_context5.prev = _context5.next) {
						case 0:
							parent = obj;
							relation = key;
							child = obj[key];
							path = [].concat(toConsumableArray(opts.path), [key]);

							if (!(child && (typeof child === 'undefined' ? 'undefined' : _typeof(child)) === 'object')) {
								_context5.next = 16;
								break;
							}

							if (!(value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object')) {
								_context5.next = 10;
								break;
							}

							_context5.next = 8;
							return update(child, value, { path: path, parent: parent });

						case 8:
							_context5.next = 14;
							break;

						case 10:
							_context5.next = 12;
							return cleanup(child, { key: key, parent: parent });

						case 12:
							// in case obj is a Proxy, this ensure deleteProperty trap is called
							delete obj[key];
							obj[key] = value;

						case 14:
							_context5.next = 26;
							break;

						case 16:
							if (!(value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object')) {
								_context5.next = 24;
								break;
							}

							if (Array.isArray(value)) obj[key] = [];else obj[key] = {};
							_context5.next = 20;
							return prepare(obj[key], { path: path, parent: parent, relation: relation });

						case 20:
							_context5.next = 22;
							return update(obj[key], value, { path: path, parent: parent });

						case 22:
							_context5.next = 26;
							break;

						case 24:
							delete obj[key];
							obj[key] = value;

						case 26:
							if (opts.silent) {
								_context5.next = 31;
								break;
							}

							_context5.next = 29;
							return trigger(obj, 'change:' + key, { key: key, value: obj[key] });

						case 29:
							_context5.next = 31;
							return notifyParent(obj, 'change', { key: key, value: obj[key] });

						case 31:
							resolve();

						case 32:
						case 'end':
							return _context5.stop();
					}
				}
			}, _callee5, _this5);
		}));

		return function (_x6) {
			return _ref6.apply(this, arguments);
		};
	}());
}
// Mutate object with an attrs set
function update(target) {
	var _this6 = this;

	var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var options = arguments[2];

	if (!target || (typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== 'object') return;
	var obj = model(target);
	if (!obj || !props) return;
	var opts = _extends({}, defaultOptions, options);
	var changes = {};
	var previous = {};
	return new Promise(function () {
		var _ref7 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(resolve) {
			return regeneratorRuntime.wrap(function _callee7$(_context7) {
				while (1) {
					switch (_context7.prev = _context7.next) {
						case 0:
							queue(obj).push(asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
								var prev, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _step3$value, key, value;

								return regeneratorRuntime.wrap(function _callee6$(_context6) {
									while (1) {
										switch (_context6.prev = _context6.next) {
											case 0:
												prev = _extends({}, obj);
												_iteratorNormalCompletion3 = true;
												_didIteratorError3 = false;
												_iteratorError3 = undefined;
												_context6.prev = 4;
												_iterator3 = Object.entries(props)[Symbol.iterator]();

											case 6:
												if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
													_context6.next = 15;
													break;
												}

												_step3$value = slicedToArray(_step3.value, 2), key = _step3$value[0], value = _step3$value[1];
												_context6.next = 10;
												return change(obj, key, value, opts);

											case 10:
												changes[key] = obj[key];
												previous[key] = prev[key];

											case 12:
												_iteratorNormalCompletion3 = true;
												_context6.next = 6;
												break;

											case 15:
												_context6.next = 21;
												break;

											case 17:
												_context6.prev = 17;
												_context6.t0 = _context6['catch'](4);
												_didIteratorError3 = true;
												_iteratorError3 = _context6.t0;

											case 21:
												_context6.prev = 21;
												_context6.prev = 22;

												if (!_iteratorNormalCompletion3 && _iterator3.return) {
													_iterator3.return();
												}

											case 24:
												_context6.prev = 24;

												if (!_didIteratorError3) {
													_context6.next = 27;
													break;
												}

												throw _iteratorError3;

											case 27:
												return _context6.finish(24);

											case 28:
												return _context6.finish(21);

											case 29:
												if (opts.silent) {
													_context6.next = 32;
													break;
												}

												_context6.next = 32;
												return trigger(obj, 'update', { changes: changes, previous: previous });

											case 32:
												_context6.next = 34;
												return resolve();

											case 34:
											case 'end':
												return _context6.stop();
										}
									}
								}, _callee6, _this6, [[4, 17, 21, 29], [22,, 24, 28]]);
							})));
							invoke(obj);

						case 2:
						case 'end':
							return _context7.stop();
					}
				}
			}, _callee7, _this6);
		}));

		return function (_x8) {
			return _ref7.apply(this, arguments);
		};
	}());
}
// Listener specifically for handle data mutations
function listen(obj, type, listener) {
	if (!obj || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') return;
	switch (type) {
		case 'update':
			return observe(obj, type, function (_ref9) {
				var changes = _ref9.changes,
				    previous = _ref9.previous;

				return listener(changes, previous);
			});
		default:
			return observe(obj, type, function (_ref10) {
				var key = _ref10.key,
				    value = _ref10.value;

				return listener(value);
			});
	}
}

// Get reference
function model() {
	var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	return prepare(obj[MODEL] || obj);
}
function proxy() {
	var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

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
				if (target[prop] instanceof Object) {
					return proxy(target[prop]);
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
					return proxy(result);
				}
				return result;
			}
		}));
		prepare(obj);
	}
	return obj[PROXY];
}

var Model = { proxy: proxy, listen: listen, observe: observe, trigger: trigger, update: update };

return Model;

})));
