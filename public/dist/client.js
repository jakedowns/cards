/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@babel/runtime/node_modules/regenerator-runtime/runtime.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@babel/runtime/node_modules/regenerator-runtime/runtime.js ***!
  \*********************************************************************************/
/***/ ((module) => {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  define(Gp, "constructor", GeneratorFunctionPrototype);
  define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  });
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  define(Gp, iteratorSymbol, function() {
    return this;
  });

  define(Gp, "toString", function() {
    return "[object Generator]";
  });

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   true ? module.exports : 0
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, in modern engines
  // we can explicitly access globalThis. In older engines we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}


/***/ }),

/***/ "./node_modules/@babel/runtime/regenerator/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/@babel/runtime/regenerator/index.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! regenerator-runtime */ "./node_modules/@babel/runtime/node_modules/regenerator-runtime/runtime.js");


/***/ }),

/***/ "./client/client-animation.mjs":
/*!*************************************!*\
  !*** ./client/client-animation.mjs ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "OutLeftAndBack": () => (/* binding */ OutLeftAndBack),
/* harmony export */   "OutRightAndFront": () => (/* binding */ OutRightAndFront),
/* harmony export */   "animateCard": () => (/* binding */ animateCard),
/* harmony export */   "flip": () => (/* binding */ flip)
/* harmony export */ });
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */ var _client_config_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./client-config.mjs */ "./client/client-config.mjs");
/* harmony import */ var _shared_helpers_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../shared/helpers.mjs */ "./shared/helpers.mjs");


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }



var anim_speed_factor = 1.0; // TOOD: use css variables to affect css animation timing too

function animateCard(_x, _x2) {
  return _animateCard.apply(this, arguments);
}

function _animateCard() {
  _animateCard = _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.mark(function _callee(card_name, animation) {
    var card, og_card, i, _og_card$classnames, _anim$classnames, _og_card$style, _anim$style, _anim$duration, anim;

    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            card = c.app.cardFromDeck(card_name);
            og_card = _objectSpread({}, card); // console.log('animate',animation);

            i = 0;

          case 3:
            if (!(i < animation.length)) {
              _context.next = 14;
              break;
            }

            anim = animation[i]; // this might be easier if we didn't have to clone the whole thing
            // for each keyframe
            // if props was a sub-property, we could clone, og_props, og_styles, og_classnames
            // let card_next = {
            //     ...og_card,
            //     // ...anim?.properties ?? {},
            //     ...{
            //         classnames: {
            //             ...og_card?.classnames ?? {},
            //             ...anim?.classnames ?? {}
            //         }
            //     },
            //     ...{
            //         style: {
            //             ...og_card?.style ?? {},
            //             ...anim?.style ?? {}
            //         }
            //     }
            // }
            // debugger;
            // card = card_next;

            card.classnames = _objectSpread(_objectSpread({}, (_og_card$classnames = og_card === null || og_card === void 0 ? void 0 : og_card.classnames) !== null && _og_card$classnames !== void 0 ? _og_card$classnames : {}), (_anim$classnames = anim === null || anim === void 0 ? void 0 : anim.classnames) !== null && _anim$classnames !== void 0 ? _anim$classnames : {});
            card.style = _objectSpread(_objectSpread({}, (_og_card$style = og_card === null || og_card === void 0 ? void 0 : og_card.style) !== null && _og_card$style !== void 0 ? _og_card$style : {}), (_anim$style = anim === null || anim === void 0 ? void 0 : anim.style) !== null && _anim$style !== void 0 ? _anim$style : {});

            if (anim !== null && anim !== void 0 && anim.properties) {
              c.app.setCard(card_name, anim.properties);
            }

            console.log(anim); // console.log(c.app.print({
            //     before:og_card,
            //     after:card,
            // }));
            // debugger;

            _context.next = 11;
            return _shared_helpers_mjs__WEBPACK_IMPORTED_MODULE_2__.delay((_anim$duration = anim === null || anim === void 0 ? void 0 : anim.duration) !== null && _anim$duration !== void 0 ? _anim$duration : 0);

          case 11:
            i++;
            _context.next = 3;
            break;

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _animateCard.apply(this, arguments);
}

var OutLeftAndBack = [{
  classnames: {
    'animation-top-to-back': true,
    'position-stacked': false
  },
  // transform: 'translateX(-300px) translateY(-50px) rotateY(12deg) rotateZ(12deg)',
  properties: {
    //     flipped: false, // flip it face down
    flipping: true
  },
  duration: 1000 // 800 * anim_speed_factor

}, {
  classnames: {
    'position-stacked': true,
    'no-transition': true
  },
  properties: {
    flipping: false,
    flipped: false
  },
  duration: 100
}, {
  classnames: {
    'position-stacked': true
  }
}];
var OutRightAndFront = [{
  classnames: {
    'animation-outRightToFront': true,
    'position-stacked': false
  },
  properties: {
    flipping: true,
    flipped: true
  },
  duration: 1000
}, {
  classnames: {
    'position-stacked': true,
    'no-transition': true
  },
  properties: {
    flipping: false // flipped: true // turn it face up

  },
  duration: 100
}, {
  classnames: {
    'position-stacked': true
  }
}];
function flip(flipped_next) {
  return [{
    properties: {
      flipping: true,
      flipped: flipped_next
    },
    duration: _client_config_mjs__WEBPACK_IMPORTED_MODULE_1__.CARD_FLIP_TIME
  }, {
    properties: {
      flipping: false,
      flipped: flipped_next
    }
  }];
}

/***/ }),

/***/ "./client/client-api.mjs":
/*!*******************************!*\
  !*** ./client/client-api.mjs ***!
  \*******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */ var _objects_Card_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./objects/Card.mjs */ "./client/objects/Card.mjs");
/* harmony import */ var _shared_helpers_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../shared/helpers.mjs */ "./shared/helpers.mjs");


function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }




var ClientAPI = /*#__PURE__*/function () {
  function ClientAPI(client) {
    _classCallCheck(this, ClientAPI);

    this.client = client;
    this.state = {
      loading: true
    };
  }

  _createClass(ClientAPI, [{
    key: "init",
    value: function init() {
      var _this = this;

      this.getInitialState().then( /*#__PURE__*/function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.mark(function _callee(state) {
          var _state$data;

          var _iterator, _step, card_name, _i, _Object$keys, hand_name, _iterator2, _step2, card_id;

          return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _this.state = (_state$data = state === null || state === void 0 ? void 0 : state.data) !== null && _state$data !== void 0 ? _state$data : {
                    error: state
                  };
                  _this.state.loading = false; // todo: move this into client.mjs

                  if (!_this.state.player.active_hand) {
                    _this.state.player.hands = {
                      welcome: _objectSpread({}, _this.state.decks.welcome)
                    };
                    _this.state.player.hands.welcome.hand_order = _toConsumableArray(_this.state.decks.welcome.card_order);
                    _iterator = _createForOfIteratorHelper(_this.state.player.hands.welcome.hand_order);

                    try {
                      for (_iterator.s(); !(_step = _iterator.n()).done;) {
                        card_name = _step.value;
                        _this.state.player.hands.welcome.cards[card_name] = _objectSpread(_objectSpread({}, _this.state.decks.welcome.cards[card_name]), {
                          name: card_name,
                          deck_name: 'welcome',
                          player_id: _this.state.player.id,
                          flipped: false,
                          // default face-down
                          classnames: {
                            'position-stacked': true
                          },
                          instance: new _objects_Card_mjs__WEBPACK_IMPORTED_MODULE_1__["default"](card_name)
                        });
                      }
                    } catch (err) {
                      _iterator.e(err);
                    } finally {
                      _iterator.f();
                    }

                    _this.state.player.active_hand = 'welcome';
                  } else {
                    for (_i = 0, _Object$keys = Object.keys(_this.state.player.hands); _i < _Object$keys.length; _i++) {
                      hand_name = _Object$keys[_i];
                      _iterator2 = _createForOfIteratorHelper(_this.state.player.hands[hand_name].hand_order);

                      try {
                        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                          card_id = _step2.value;
                          _this.state.player.hands[hand_name].cards[card_id] = _objectSpread(_objectSpread({}, _this.state.player.hands[hand_name].cards[card_id]), {
                            name: card_id,
                            deck_name: hand_name,
                            player_id: _this.state.player.id,
                            // flipped: false, // default face-down
                            // classnames: {
                            //     'position-stacked': true
                            // },
                            instance: new _objects_Card_mjs__WEBPACK_IMPORTED_MODULE_1__["default"](card_id)
                          });
                        }
                      } catch (err) {
                        _iterator2.e(err);
                      } finally {
                        _iterator2.f();
                      }
                    }
                  }

                  _this.client.app.state = _this.state;
                  _context.next = 6;
                  return _shared_helpers_mjs__WEBPACK_IMPORTED_MODULE_2__.delay(100);

                case 6:
                  _this.client.app.flipCard('welcome', true);

                case 7:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }())["catch"](function (err) {
        _this.state = {
          error: err
        };
      });
    }
  }, {
    key: "getInitialState",
    value: function getInitialState() {
      return axios.get('/api/state');
    }
  }]);

  return ClientAPI;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ClientAPI);

/***/ }),

/***/ "./client/client-config.mjs":
/*!**********************************!*\
  !*** ./client/client-config.mjs ***!
  \**********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CARD_FLIP_TIME": () => (/* binding */ CARD_FLIP_TIME)
/* harmony export */ });
var CARD_FLIP_TIME = 800;

/***/ }),

/***/ "./client/components/DynamicRenderer.mjs":
/*!***********************************************!*\
  !*** ./client/components/DynamicRenderer.mjs ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  functional: true,
  props: {
    body: String,
    data: {
      type: Object,
      "default": function _default() {
        return {};
      }
    }
  },
  render: function render(h, context, props) {
    var template = "<div>".concat(props === null || props === void 0 ? void 0 : props.body, "</div>");
    var dynComponent = {
      // components:{SmartLink},
      template: template,
      data: function data() {
        return props === null || props === void 0 ? void 0 : props.data;
      }
    };
    return Vue.h(dynComponent);
  }
});

/***/ }),

/***/ "./client/objects/Card.mjs":
/*!*********************************!*\
  !*** ./client/objects/Card.mjs ***!
  \*********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */ var _client_config_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../client-config.mjs */ "./client/client-config.mjs");
/* harmony import */ var _shared_helpers_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../shared/helpers.mjs */ "./shared/helpers.mjs");


function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }




var Card = /*#__PURE__*/function () {
  function Card(card_name) {
    _classCallCheck(this, Card);

    this.name = card_name;
  }

  _createClass(Card, [{
    key: "state",
    get: function get() {
      return c.app.cardFromDeck(this.name);
    }
  }, {
    key: "setState",
    value: function setState(property, value) {
      c.app.setCard(this.name, property, value);
    }
  }, {
    key: "flip",
    value: function () {
      var _flip = _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.mark(function _callee(flipped_next) {
        return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", c.app.flipCard(this.name, flipped_next));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function flip(_x) {
        return _flip.apply(this, arguments);
      }

      return flip;
    }()
  }, {
    key: "deck",
    get: function get() {
      var _c$app$decks;

      return (_c$app$decks = c.app.decks) === null || _c$app$decks === void 0 ? void 0 : _c$app$decks[this.state.deck_name];
    }
  }, {
    key: "hand",
    get: function get() {
      var _c$app$player, _c$app$player$hands;

      return (_c$app$player = c.app.player) === null || _c$app$player === void 0 ? void 0 : (_c$app$player$hands = _c$app$player.hands) === null || _c$app$player$hands === void 0 ? void 0 : _c$app$player$hands[this.state.deck_name];
    }
  }, {
    key: "player",
    get: function get() {
      return c.app.getPlayer(this.state.player_id);
    } // get table(){
    //     // get containing table
    // }
    // get author(){
    //     return this.state.author ?? 'system';
    // }
    // computed Getter

  }, {
    key: "zIndex",
    get: function get() {
      return this.hand.hand_order.length - this.hand.hand_order.indexOf(this.name);
    }
  }, {
    key: "canFlip",
    value: function canFlip() {
      // todo: check if card is at the top of it's containing stack
      return c.app.player.focused_card === this.name && !this.state.flipping;
    }
  }, {
    key: "onFlip",
    value: function onFlip() {
      if (this.state.flipped) {
        var _this$state, _this$state$inputs, _this$state2, _this$state2$actions;

        // revealed
        if ((_this$state = this.state) !== null && _this$state !== void 0 && (_this$state$inputs = _this$state.inputs) !== null && _this$state$inputs !== void 0 && _this$state$inputs.length) {
          var _document$querySelect;

          var first_input = this.state.inputs[0];
          console.log('todo focus first input', first_input);
          (_document$querySelect = document.querySelector(".card.focused input[name=\"".concat(first_input.name, "\"]"))) === null || _document$querySelect === void 0 ? void 0 : _document$querySelect.focus();
        } else if ((_this$state2 = this.state) !== null && _this$state2 !== void 0 && (_this$state2$actions = _this$state2.actions) !== null && _this$state2$actions !== void 0 && _this$state2$actions.length) {
          var _document$querySelect2;

          (_document$querySelect2 = document.querySelectorAll(".card.focused .actions .action")[this.state.actions.length - 1]) === null || _document$querySelect2 === void 0 ? void 0 : _document$querySelect2.focus();
        }
      }
    }
  }, {
    key: "extraClassnames",
    value: function extraClassnames() {
      var _this$state$stack, _this$state3;

      var cx = {};
      var stack_id = "stack-".concat((_this$state$stack = (_this$state3 = this.state) === null || _this$state3 === void 0 ? void 0 : _this$state3.stack) !== null && _this$state$stack !== void 0 ? _this$state$stack : 1);
      cx[stack_id] = true;
      return cx;
    }
  }]);

  return Card;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Card);

/***/ }),

/***/ "./server/decks/welcome.deck.mjs":
/*!***************************************!*\
  !*** ./server/decks/welcome.deck.mjs ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "STARTER_DECK_OPTIONS": () => (/* binding */ STARTER_DECK_OPTIONS),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Welcome Deck
var VERSION = '0.0.1';
var STARTER_DECK_OPTIONS = [// {name:'welcome',selected:true},
{
  name: 'blank',
  selected: true
}, {
  name: 'mind map'
}, {
  name: 'mood board'
}, {
  name: 'prototype'
}, {
  name: 'storyboard'
}, {
  name: 'flash cards'
}, {
  name: 'playing cards'
}, {
  name: 'tarot cards'
}, {
  name: 'index cards'
}, {
  name: 'todo list deck'
}, {
  name: 'pokemon cards'
}, {
  name: 'tetris cards'
}, {
  name: 'uno cards'
}];
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  id: 'welcome',
  name: 'welcome',
  cards: {
    welcome: {
      id: 'welcome',
      name: 'welcome',
      deck_order: 1,
      front: {
        text: 'Welcome to CardBox',
        text_lower: "v. ".concat(VERSION) // text_lower: 'what\'s your name?', // new player

      },
      back: {// image: ''
      },
      actions: [{
        name: 'nextCard' // name: 'goToCard',
        // card: 'welcome2',
        // label: 'next',

      }]
    },
    welcome2: {
      deck_order: 2,
      inputs: [{
        label: 'what\'s your name?',
        type: 'text',
        name: 'player name',
        placeholder: 'new player name...',
        required: true
      }],
      actions: [{
        name: 'nextCard' // name: 'goToCard',
        // card: 'welcome3',
        // label: 'next',

      }],
      front: {
        text: ''
      }
    },
    welcome3: {
      deck_order: 3,
      front: {
        text: 'hello, {{player.name}}. <br/> want a quick intro?'
      },
      actions: [{
        name: 'goToCard',
        card: 'setup1',
        label: 'no'
      }, {
        name: 'goToCard',
        card: 'info1',
        label: 'yes'
      }]
    },
    setup1: {
      front: {
        text: 'Pick a theme'
      },
      inputs: [{
        label: 'theme',
        type: 'select',
        name: 'theme',
        required: true,
        options: [{
          name: 'default',
          value: 'default'
        }, {
          name: 'dark',
          value: 'dark'
        }, {
          name: 'light',
          value: 'light'
        }, {
          name: 'blue',
          value: 'blue'
        }]
      }],
      actions: [{
        name: 'goToCard',
        card: 'setup2',
        label: 'next'
      }]
    },
    setup2: {
      front: {
        text: 'Let\'s create your first deck'
      },
      inputs: [{
        label: 'deck',
        type: 'select',
        name: 'deck',
        options: STARTER_DECK_OPTIONS,
        required: true
      }],
      actions: [{
        label: 'Create Deck',
        name: 'createDeckAndFocus',
        deck: '{{deck}}'
      }]
    },
    info1: {
      front: {
        text: 'CardBox is an experimental ecosystem for collaborative systems design with a primary goal of making programming collaborative, approachable, and fun! <br/>'
      },
      actions: [{
        name: 'goToCard',
        card: 'info2',
        label: 'more info'
      }, {
        name: 'goToCard',
        card: 'setup2',
        label: 'pick a starter deck'
      }]
    },
    info2: {
      front: {
        text: 'More info about CardBox',
        text_lower: "v. ".concat(VERSION)
      },
      actions: [{
        name: 'goToCard',
        card: 'info_inspiration',
        label: 'inspiration'
      }, {
        name: 'goToCard',
        card: 'info_contributors',
        label: 'contributors'
      }, {
        name: 'goToCard',
        card: 'info_philosophy',
        label: 'philosophy'
      }, {
        name: 'goToCard',
        card: 'info_progress',
        label: 'progress'
      }, {
        name: 'goToCard',
        card: 'info_roadmap',
        label: 'roadmap'
      }, {
        name: 'goToCard',
        card: 'info_team',
        label: 'team'
      }, {
        name: 'goToCard',
        card: 'info_contact',
        label: 'contact'
      }, {
        name: 'goToCard',
        card: 'info1',
        label: 'back'
      }]
    }
  },
  // TODO: deck default sort order: 'order name'
  // TODO: deck sort options: {rank,order,name,created,updated,viewed,forked}
  // key cards by uuid to allow for dupe names?
  // TODO: generate "card_order" or "deck_order" from deck_order prop on each card
  // so we don't have to manually maintain this array
  card_order: ['welcome', 'welcome2', 'welcome3', 'setup1', 'setup2', 'info1', 'info2']
});

/***/ }),

/***/ "./shared/helpers.mjs":
/*!****************************!*\
  !*** ./shared/helpers.mjs ***!
  \****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "arraymove": () => (/* binding */ arraymove),
/* harmony export */   "delay": () => (/* binding */ delay)
/* harmony export */ });
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");


function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function arraymove(arr, fromIndex, toIndex) {
  var element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}
function delay(_x) {
  return _delay.apply(this, arguments);
}

function _delay() {
  _delay = _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.mark(function _callee(time) {
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", new Promise(function (resolve) {
              setTimeout(resolve, time);
            }));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _delay.apply(this, arguments);
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!***************************!*\
  !*** ./client/client.mjs ***!
  \***************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */ var _client_api_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./client-api.mjs */ "./client/client-api.mjs");
/* harmony import */ var _client_config_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./client-config.mjs */ "./client/client-config.mjs");
/* harmony import */ var _shared_helpers_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../shared/helpers.mjs */ "./shared/helpers.mjs");
/* harmony import */ var _client_animation_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./client-animation.mjs */ "./client/client-animation.mjs");
/* harmony import */ var _components_DynamicRenderer_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/DynamicRenderer.mjs */ "./client/components/DynamicRenderer.mjs");
/* harmony import */ var _objects_Card_mjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./objects/Card.mjs */ "./client/objects/Card.mjs");
/* harmony import */ var _server_decks_welcome_deck_mjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../server/decks/welcome.deck.mjs */ "./server/decks/welcome.deck.mjs");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }






 // todo move this to shared



var Client = /*#__PURE__*/_createClass(function Client() {
  _classCallCheck(this, Client);

  this.api = new _client_api_mjs__WEBPACK_IMPORTED_MODULE_1__["default"](this);
  this.api.init();

  var _client = this;

  this.app = Vue.createApp({
    mounted: function mounted() {
      console.warn('todo: add browser history api integration for navigation');
      console.warn('todo: add player select when no player is active AND there\'s at least one player in the db');
      console.warn('todo: add ability to drag cards from hand to stack');
    },
    components: {
      DynamicRenderer: _components_DynamicRenderer_mjs__WEBPACK_IMPORTED_MODULE_5__["default"]
    },
    data: function data() {
      return {
        state: {
          loading: true
        }
      };
    },
    methods: {
      print: function print(thing) {
        console.log(JSON.stringify(thing, null, 2));
      },
      setCard: function setCard(card_name, property, value) {
        // TODO: should we ALSO set it in this.state.decks?
        var deck = this.state.player.hands[this.state.player.active_hand]; // allows passing an object to merge

        if (_typeof(property) === 'object') {
          // deck.cards[card_name] = {
          //     ...deck.cards[card_name],
          //     ...property // object of properties to set
          // };
          for (var key in property) {
            deck.cards[card_name][key] = property[key];
          }

          return;
        } // single property setter


        deck.cards[card_name][property] = value;
      },
      act: function act(action) {
        console.log('ACT!', action);

        switch (action === null || action === void 0 ? void 0 : action.name) {
          case 'nextCard':
            this.nextCard();
            break;

          case 'prevCard':
            this.prevCard();
            break;

          case 'goToCard':
            this.goToCard(action === null || action === void 0 ? void 0 : action.card);
            break;

          case 'focusDeck':
            this.focusDeck(action);
            break;

          case 'selectDeckType':
            var deck_name = document.querySelector('.card.focused select[name="deck"]').value;
            console.warn('todo save deck type to db', {
              name: this.active_hand.name,
              type: deck_name
            });
            var card_id = null;
            var i = 0;

            while (!card_id && i < this.active_hand.card_order.length) {
              var _card$front;

              var _card_id = this.active_hand.card_order[i];
              var _card = this.active_hand.cards[_card_id];
              console.log({
                _card: _card
              });

              if ((_card === null || _card === void 0 ? void 0 : (_card$front = _card.front) === null || _card$front === void 0 ? void 0 : _card$front.text) === 'Pick Deck Type') {
                card_id = _card_id;
              }

              i++;
            }

            this.removeCardFromDeck(card_id, this.active_hand.id);
            this.goToCard(this.active_hand.card_order[0]);
            break;

          case 'createCardFromInput':
            this.createCardFromInput(action);
            break;

          case 'createDeckAndFocus':
            if (this.player.focused_card === 'setup2') {
              // this is our main "create deck" card
              var _deck_name = document.querySelector('.card.focused select[name="deck"]').value;
              this.createDeckAndFocus(_deck_name);
            } else {
              this.createDeckAndFocus(action === null || action === void 0 ? void 0 : action.deck);
            }

            break;

          default:
            console.warn('unknown action', action);
            break;
        }
      },
      createCardFromInput: function createCardFromInput(e) {
        var _this = this;

        return _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.mark(function _callee() {
          var card_name, card_id;
          return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  card_name = document.querySelector('.card textarea[name="card_name"]').value;
                  card_id = _this.createCard(card_name); // move into second stack
                  // HAND > stacks > 1 (primary)
                  //      > stacks > 2

                  _this.active_hand.cards[card_id].stack = 2;

                  _this.flipCard(card_id, true);

                  document.querySelector('.card textarea[name="card_name"]').value = '';
                  document.querySelector('.card textarea[name="card_name"]').focus();

                case 6:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }))();
      },
      removeCardFromDeck: function removeCardFromDeck(card_id, deck_id) {
        console.log('removeCardFromDeck', card_id, deck_id); // delete this.state.player.hands[this.state.player.active_hand].cards[card_id];
        // for now, just remove from card_order/hand_order, but keep the card in the cards object

        var indexCardOrder = this.active_hand.card_order.indexOf(card_id);

        if (indexCardOrder > -1) {
          this.active_hand.card_order.splice(indexCardOrder, 1);
        }

        var indexHandOrder = this.active_hand.hand_order.indexOf(card_id);

        if (indexHandOrder > -1) {
          this.active_hand.hand_order.splice(indexHandOrder, 1);
        }
      },
      // for decluttering the deck-list
      putAwayDeck: function putAwayDeck(deck_name) {},
      getOutDeck: function getOutDeck(deck_name) {},
      createCard: function createCard(card_name, deck_id) {
        var _deck_id;

        console.log('creating card!', {
          card_name: card_name
        });
        deck_id = (_deck_id = deck_id) !== null && _deck_id !== void 0 ? _deck_id : this.player.active_hand;
        var deck = this.player.hands[deck_id];
        var card_id = "id" + performance.now();
        deck.card_order.unshift(card_id);
        deck.hand_order.unshift(card_id);
        var BASIC_CARD = {
          id: card_id,
          flipped: false,
          deck_name: deck_id,
          front: {
            text: card_name
          },
          player_id: this.player.id,
          instance: new _objects_Card_mjs__WEBPACK_IMPORTED_MODULE_6__["default"](card_id)
        };

        if (card_name === 'Create Card') {
          deck.cards[card_id] = _objectSpread(_objectSpread({}, BASIC_CARD), {
            inputs: [{
              type: 'textarea',
              name: 'card_name',
              placeholder: 'Card Title...'
            }],
            actions: [{
              name: 'createCardFromInput',
              label: 'create card'
            }],
            attributes: ['createCard']
          });

          deck.cards[card_id].instance.onFlip = function () {
            console.log('custom on flip function?');
            document.querySelector('textarea[name="card_name"]').focus();
          };
        } else if (card_name === 'Pick Deck Type') {
          deck.cards[card_id] = _objectSpread(_objectSpread({}, BASIC_CARD), {
            inputs: [{
              label: 'deck',
              type: 'select',
              name: 'deck',
              options: _server_decks_welcome_deck_mjs__WEBPACK_IMPORTED_MODULE_7__.STARTER_DECK_OPTIONS,
              required: true
            }],
            actions: [{
              name: 'selectDeckType',
              label: 'next'
            }],
            attributes: ['deckTypeSelector']
          });
        } else {
          deck.cards[card_id] = _objectSpread(_objectSpread({}, BASIC_CARD), {
            stack: 2
          });
        }

        return card_id;
      },
      createDeckAndFocus: function createDeckAndFocus(deck_name) {
        var id = this.createDeck(deck_name);
        this.focusDeck(id);
      },
      createDeck: function createDeck(deck_name) {
        console.log('creating a new deck', deck_name); // todo await this.api.createDeck(deck_name);
        // for now, just stub it in

        var deck_id = "id" + performance.now();
        this.player.hands[deck_id] = {
          id: deck_id,
          player_id: this.player.id,
          hand_order: [],
          card_order: [],
          cards: {},
          name: deck_name
        };
        var second_card = this.createCard('Create Card', deck_id);
        var first_card = this.createCard('Pick Deck Type', deck_id);
        this.player.hands[deck_id].cards[first_card].flipped = true;
        this.goToCard(first_card);
        return deck_id;
      },
      focusDeck: function focusDeck(deck_name) {
        var _this2 = this;

        return _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.mark(function _callee2() {
          var deck;
          return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  console.log('focusing deck', {
                    deck_name: deck_name
                  });
                  _this2.player.active_hand = deck_name;
                  _this2.player.focused_deck = deck_name; // TODO: add a default card, a Create Card card.

                  deck = _this2.player.hands[deck_name];
                  _this2.player.focused_card = deck.card_order[0];

                case 5:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }))();
      },
      // aka Focus card?
      goToCard: function goToCard(card_name, deck_name) {
        var _this3 = this;

        return _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.mark(function _callee3() {
          var _this3$player$hands;

          var deck, card, card_index, hand_order_next;
          return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  console.log('goToCard', card_name);
                  console.warn('if current card had inputs need to make sure user is ok with losing them');
                  console.warn('if current card is required, block user from leaving card');

                  if (!deck_name) {
                    deck_name = _this3.state.player.active_hand;
                  }

                  deck = (_this3$player$hands = _this3.player.hands) === null || _this3$player$hands === void 0 ? void 0 : _this3$player$hands[deck_name];
                  card = deck.cards[card_name];

                  if (card) {
                    _context3.next = 9;
                    break;
                  }

                  console.warn('card not found', card_name, deck_name);
                  return _context3.abrupt("return");

                case 9:
                  card_index = deck.hand_order.indexOf(card_name);

                  if (card_index === -1) {
                    console.error('card not found in hand_order');
                    c.app.print([deck.hand_order, deck.card_order, card_name]);
                  } // if card is on top just flip it over


                  if (!(card_index === 0)) {
                    _context3.next = 15;
                    break;
                  }

                  _this3.flipCard(card_name, true);

                  _context3.next = 22;
                  break;

                case 15:
                  // flip top card face down
                  //this.flipCard(this.player.focused_card, false)
                  _this3.topCardToBack();

                  if (!(card_index > 1)) {
                    _context3.next = 21;
                    break;
                  }

                  _context3.next = 19;
                  return _this3.animateCard(card_name, _client_animation_mjs__WEBPACK_IMPORTED_MODULE_4__.OutRightAndFront);

                case 19:
                  _context3.next = 22;
                  break;

                case 21:
                  _this3.flipCard(card_name, true);

                case 22:
                  // "select" the new card
                  _this3.setPlayerFocusedCard(card_name); // update our "hand order" (z-index order)


                  hand_order_next = _this3.player.hands[_this3.player.active_hand].hand_order.slice();

                  if (hand_order_next.indexOf(card_name) === -1) {
                    console.warn('card not found in hand_order', card_name, hand_order_next);
                  }

                  _shared_helpers_mjs__WEBPACK_IMPORTED_MODULE_3__.arraymove(hand_order_next, hand_order_next.indexOf(card_name), 0);

                  _this3.setPlayerHandOrder(hand_order_next); // console.log('hand_order_next',hand_order_next,this.player.focused_card);
                  // this.setPlayerFocusedDeck(deck_name);
                  // this.setCard(card_name, 'flipped', false);
                  // this.setCard(card_name, 'z-index', deck.cards.length);


                case 27:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3);
        }))();
      },
      onCardSubmit: function onCardSubmit(event) {
        var _this$focused_card, _this$focused_card$fr;

        if (event.shiftKey) {
          return;
        }

        if (((_this$focused_card = this.focused_card) === null || _this$focused_card === void 0 ? void 0 : (_this$focused_card$fr = _this$focused_card.front) === null || _this$focused_card$fr === void 0 ? void 0 : _this$focused_card$fr.text) === 'Create Card') {
          this.createCardFromInput(event);
          return;
        } // TODO: make this a generic handler // or add some definitions at the card level
        // TODO: v-model binding too


        console.log('onCardSubmit TODO! validate and write to db!', event); // TODO: bind inputs to v-model (slight chance that .value won't be able to be fetched)
        // since front of card is wrapped in v-if, it could disappear from dom

        var val = document.querySelector('.card.focused input[name="player name"]').value;
        this.state.player.name = val;
        console.log('SAVED PLAYER NAME', {
          val: val
        });
        this.nextCard();
      },
      flipCard: function flipCard(card_name, flipped_next) {
        var _this4 = this;

        return _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.mark(function _callee4() {
          var card, state_next;
          return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  if (!card_name) {
                    card_name = _this4.state.player.focused_card;
                  }

                  card = _this4.cardFromDeck(card_name);
                  state_next = !card.flipped;

                  if (typeof flipped_next !== "undefined") {
                    state_next = flipped_next;
                  }

                  console.log('flip card', {
                    card_name: card_name,
                    flipped_next: flipped_next,
                    state_next: state_next
                  });
                  _context4.next = 7;
                  return _this4.animateCard(card_name, _client_animation_mjs__WEBPACK_IMPORTED_MODULE_4__.flip(flipped_next));

                case 7:
                  card.instance.onFlip();

                case 8:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4);
        }))();
      },
      nextCard: function nextCard() {
        var _this5 = this;

        return _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.mark(function _callee5() {
          var _card2, _card2$inputs;

          var card, hand_order_next;
          return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  window.blur();
                  card = _this5.focused_card;

                  if ((_card2 = card) !== null && _card2 !== void 0 && (_card2$inputs = _card2.inputs) !== null && _card2$inputs !== void 0 && _card2$inputs.length) {
                    console.warn('validate inputs here');
                  } // flip over before moving top card
                  // await this.topCardToBack();


                  _this5.topCardToBack();

                  hand_order_next = _this5.player.hands[_this5.player.active_hand].hand_order.slice(); // todo: animate card going off to one side, then back behind
                  // move focused card to the back of the deck.

                  _shared_helpers_mjs__WEBPACK_IMPORTED_MODULE_3__.arraymove(hand_order_next, hand_order_next.indexOf(_this5.player.focused_card), hand_order_next.length - 1);

                  _this5.setPlayerHandOrder(hand_order_next); // set top card as focused card


                  _this5.setPlayerFocusedCard(hand_order_next[0]); // await Helpers.delay(Config.CARD_FLIP_TIME);
                  // flip over top card


                  card = _this5.cardFromDeck(_this5.player.focused_card);
                  card.instance.flip(true);

                case 10:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5);
        }))();
      },
      topCardToBack: function topCardToBack() {
        var _arguments = arguments,
            _this6 = this;

        return _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.mark(function _callee6() {
          var skip_flip, card_name;
          return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                  skip_flip = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : false;
                  card_name = _this6.player.focused_card; // let card = this.cardFromDeck(card_name);
                  // if(!skip_flip){
                  // un-flip it (make face down)
                  // card.instance.flip(false);
                  // }
                  // let card = this.cardFromDeck(card_name);
                  // animate the card being pulled off to the left
                  // then drop it's z-index to the back of the deck
                  // TODO: need a way to manage z-indexes in a stack
                  // TODO: encapsulate this into a repeatable animation
                  // card.animations.outLeftAndBack()
                  // card.animate([

                  _context6.next = 4;
                  return _this6.animateCard(card_name, _client_animation_mjs__WEBPACK_IMPORTED_MODULE_4__.OutLeftAndBack);

                case 4:
                case "end":
                  return _context6.stop();
              }
            }
          }, _callee6);
        }))();
      },
      // does it make sense to put an Animate() function on Every Card instance?
      // or better to just have a global one here.. >_>
      animateCard: function animateCard(card_name, animation) {
        return _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.mark(function _callee7() {
          return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.wrap(function _callee7$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                  return _context7.abrupt("return", _client_animation_mjs__WEBPACK_IMPORTED_MODULE_4__.animateCard(card_name, animation));

                case 1:
                case "end":
                  return _context7.stop();
              }
            }
          }, _callee7);
        }))();
      },
      setPlayerFocusedCard: function setPlayerFocusedCard(card_name) {
        this.state.player.focused_card = card_name;
      },
      setPlayerHandOrder: function setPlayerHandOrder(hand_order_next, hand_name) {
        var _hand_name;

        hand_name = (_hand_name = hand_name) !== null && _hand_name !== void 0 ? _hand_name : this.player.active_hand;
        this.state.player.hands[hand_name].hand_order = hand_order_next;
      },
      // TODO: if(card?.canFlip)
      onClickCardBack: function onClickCardBack(card_name) {
        var card = this.cardFromDeck(card_name);

        if (!(card !== null && card !== void 0 && card.flipped)) {
          // flip it over
          card.instance.flip(true);
        }
      },
      getPlayer: function getPlayer(player_id) {
        var found = null;
        var i = 0;

        while (!found && i < this.state.players.length) {
          if (this.state.players[i].id === player_id) {
            found = this.state.players[i];
          }

          i++;
        }

        return found;
      }
    },
    computed: {
      active_hand: function active_hand() {
        var _this$state, _this$state$player, _this$state$player$ha, _this$state2, _this$state2$player;

        return (_this$state = this.state) === null || _this$state === void 0 ? void 0 : (_this$state$player = _this$state.player) === null || _this$state$player === void 0 ? void 0 : (_this$state$player$ha = _this$state$player.hands) === null || _this$state$player$ha === void 0 ? void 0 : _this$state$player$ha[this === null || this === void 0 ? void 0 : (_this$state2 = this.state) === null || _this$state2 === void 0 ? void 0 : (_this$state2$player = _this$state2.player) === null || _this$state2$player === void 0 ? void 0 : _this$state2$player.active_hand];
      },
      // focused_deck(){
      //     return this.active_hand;
      // },
      focused_card: function focused_card() {
        var _this$active_hand, _this$active_hand$car, _this$player;

        return this === null || this === void 0 ? void 0 : (_this$active_hand = this.active_hand) === null || _this$active_hand === void 0 ? void 0 : (_this$active_hand$car = _this$active_hand.cards) === null || _this$active_hand$car === void 0 ? void 0 : _this$active_hand$car[this === null || this === void 0 ? void 0 : (_this$player = this.player) === null || _this$player === void 0 ? void 0 : _this$player.focused_card];
      },
      cardFromDeck: function cardFromDeck() {
        var _this7 = this;

        return function (card_name, deck_name) {
          var _deck_name2, _this7$state, _this7$state$player, _this7$state2, _this7$state2$player, _this7$state2$player$, _this7$state2$player$2, _this7$state2$player$3;

          deck_name = (_deck_name2 = deck_name) !== null && _deck_name2 !== void 0 ? _deck_name2 : (_this7$state = _this7.state) === null || _this7$state === void 0 ? void 0 : (_this7$state$player = _this7$state.player) === null || _this7$state$player === void 0 ? void 0 : _this7$state$player.active_hand;
          var card = (_this7$state2 = _this7.state) === null || _this7$state2 === void 0 ? void 0 : (_this7$state2$player = _this7$state2.player) === null || _this7$state2$player === void 0 ? void 0 : (_this7$state2$player$ = _this7$state2$player.hands) === null || _this7$state2$player$ === void 0 ? void 0 : (_this7$state2$player$2 = _this7$state2$player$[deck_name]) === null || _this7$state2$player$2 === void 0 ? void 0 : (_this7$state2$player$3 = _this7$state2$player$2.cards) === null || _this7$state2$player$3 === void 0 ? void 0 : _this7$state2$player$3[card_name]; // TODO: generate a Card class for each card
          // when cloning deck of cards to player's hand
          // temp: stub in prototype method on the object

          /*
          if(!card.animate){
              console.warn('TODO: add card.animate here');
              card.__proto__.animate = async (animation)=>{
                  console.log('animate',animation);
                  for(let i = 0; i < animation.length; i++){
                      let anim = animation[i];
                      debugger;
                      card.classnames = anim?.classnames ?? {};
                      card.style = anim?.style ?? {}
                      card = {...card, ...(anim?.properties ?? {})};
                      console.log(this.print(card));
                      await Helpers.delay(anim.duration);
                  }
              }
          }
          */

          return card;
        };
      },
      player: function player() {
        var _this$state$player2, _this$state3;

        return (_this$state$player2 = this === null || this === void 0 ? void 0 : (_this$state3 = this.state) === null || _this$state3 === void 0 ? void 0 : _this$state3.player) !== null && _this$state$player2 !== void 0 ? _this$state$player2 : {};
      },
      actions: function actions() {
        var _this$state$actions, _this$state4;

        return (_this$state$actions = this === null || this === void 0 ? void 0 : (_this$state4 = this.state) === null || _this$state4 === void 0 ? void 0 : _this$state4.actions) !== null && _this$state$actions !== void 0 ? _this$state$actions : {};
      },
      currentTheme: function currentTheme() {
        var _this$state$themes$th;

        return (_this$state$themes$th = this.state.themes[this.state.player.active_theme]) !== null && _this$state$themes$th !== void 0 ? _this$state$themes$th : 'default';
      },
      tableTopStyle: function tableTopStyle() {
        return this.currentTheme.tableTopStyle;
      },
      cardStyle: function cardStyle() {
        return this.currentTheme.cards.globalStyle;
      },
      cardFrontStyle: function cardFrontStyle() {
        var _this$currentTheme$ca;

        return _objectSpread(_objectSpread({}, (_this$currentTheme$ca = this.currentTheme.cards) === null || _this$currentTheme$ca === void 0 ? void 0 : _this$currentTheme$ca.frontStyle), {
          borderRadius: this.currentTheme.cards.globalStyle.borderRadius
        });
      },
      cardBackStyle: function cardBackStyle() {
        return _objectSpread(_objectSpread({}, this.currentTheme.cards.backStyle), {
          borderRadius: this.currentTheme.cards.globalStyle.borderRadius
        });
      },
      cardActionsStyle: function cardActionsStyle() {
        var _this$focused_card2, _this$focused_card2$a;

        return {
          flexDirection: ((_this$focused_card2 = this.focused_card) === null || _this$focused_card2 === void 0 ? void 0 : (_this$focused_card2$a = _this$focused_card2.actions) === null || _this$focused_card2$a === void 0 ? void 0 : _this$focused_card2$a.length) > 3 ? 'column' : 'row'
        };
      },
      cardActionStyle: function cardActionStyle() {
        var _this$focused_card3, _this$focused_card3$a;

        var flexBasis = '100%';

        if (((_this$focused_card3 = this.focused_card) === null || _this$focused_card3 === void 0 ? void 0 : (_this$focused_card3$a = _this$focused_card3.actions) === null || _this$focused_card3$a === void 0 ? void 0 : _this$focused_card3$a.length) <= 3) {
          var _this$focused_card$ac;

          flexBasis = ((_this$focused_card$ac = this.focused_card.actions) === null || _this$focused_card$ac === void 0 ? void 0 : _this$focused_card$ac.length) / 1 + '%';
        }

        return {
          flexBasis: flexBasis
        };
      }
    }
  }).mount('#app');
});

window.addEventListener('DOMContentLoaded', function () {
  window.c = new Client();
});
})();

/******/ })()
;