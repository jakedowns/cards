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
/*!*****************************!*\
  !*** ./client/client3d.mjs ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// This example uses THREE.CatmullRomCurve3 to create a path for a custom Keyframe Track position animation.
// AnimationClip creation function on line 136
// Uncomment line 173 to see the curve helper
console.clear(); // Global Variables

var canvas, scene, renderer, camera;
var controls,
    raycaster,
    mouse,
    txtLoader,
    clock,
    delta = 0; // track mouse down coord
// so that in click handler,
// we can ignore flipping the card
// if the user was dragging the camera

var mouseDownCoord = {
  x: 0,
  y: 0
};
var mouseClickCoord = {
  x: 0,
  y: 0
};
var ground;

function delay(_x) {
  return _delay.apply(this, arguments);
}

function _delay() {
  _delay = _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.mark(function _callee7(t) {
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            return _context7.abrupt("return", new Promise(function (resolve) {
              return setTimeout(resolve, t);
            }));

          case 1:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));
  return _delay.apply(this, arguments);
}

var colorDark = new THREE.Color(0xb0b0b0);
var colorLight = new THREE.Color(0xffffff);
var animationDuration = 0.5; // seconds

var reset_delay = 1000; // const HOST = HOSTNAME;

var PORT = 3091;
var WSHOSTNAME = "localhost";
console.log('hostname?port?', ["".concat(WSHOSTNAME), // `${HOST}`,
"".concat(PORT)]);

var SocketConnection = /*#__PURE__*/function () {
  function SocketConnection() {
    _classCallCheck(this, SocketConnection);

    this.client_id = null;
    this.ws = new WebSocket("ws://".concat(WSHOSTNAME, ":").concat(PORT));
    this.ws.addEventListener("open", function () {
      console.log("We are connected"); //this.ws.send("How are you?");
    });
    this.client_ids = [];
    this.ws.addEventListener('message', function (event) {
      var _decoded;

      console.log(event);
      var decoded = null;

      try {
        decoded = JSON.parse(event.data);
      } catch (e) {
        console.error(e);
      }

      console.log('socket message:', decoded);

      switch ((_decoded = decoded) === null || _decoded === void 0 ? void 0 : _decoded.message) {
        case 'PING':
          document.querySelector('.clients .value').textContent = JSON.stringify(decoded.server_client_ids);
          break;

        case 'NEW_CLIENT_CONNECTED':
          break;

        case 'CLIENT_LEFT':
          break;

        case 'WELCOME':
          this.client_id = decoded.your_client_id;
          console.log('server says my id is', this.client_id);
          document.querySelector('.my_client_id .value').textContent = JSON.stringify(this.client_id);
          break;
      }
    });
  }

  _createClass(SocketConnection, [{
    key: "send",
    value: function send(data) {
      data.client_id = this.client_id;
      this.ws.send(JSON.stringify(data));
    }
  }]);

  return SocketConnection;
}();

var Player = /*#__PURE__*/_createClass(function Player(name) {
  _classCallCheck(this, Player);

  this.name = name; // todo support multiple hands

  this.matches = [];
  this.cards = [];
});

var Tabletop = /*#__PURE__*/function () {
  function Tabletop() {
    _classCallCheck(this, Tabletop);

    // table tops have uuids which can be shared / spectated / joined
    this.id = "id" + performance.now();
    this.server = new SocketConnection(); // Lights

    initLights(); // Table (groundplane)

    initGround();
    this.deckgroup = new THREE.Group();
    scene.add(this.deckgroup);
    this.players = [];
    this.players.push(new Player("Player One"));
  }

  _createClass(Tabletop, [{
    key: "setupGame",
    value: function setupGame() {
      this.game = new Game_PVPMemory();
    }
  }, {
    key: "startGame",
    value: function startGame() {
      this.game.startRound();
    }
  }, {
    key: "deck",
    get: function get() {
      return this.game.decks["default"];
    }
  }, {
    key: "cards",
    get: function get() {
      return this.deck.cards;
    }
  }]);

  return Tabletop;
}();

var Card = /*#__PURE__*/function () {
  function Card(index) {
    _classCallCheck(this, Card);

    this.index = index;
    this.deck_order_index = index; // what order is this card in the deck's available cards array? (saves repeat indexOf calls)

    this.setupTexturesAndMaterials();
    this.setupMesh(); // Animation

    this.mesh.faceUp = false; // this.mesh.mixer = new THREE.AnimationMixer( this.mesh );
    // var flipUpsideClip = createFlipUpsideClip(this.mesh,'faceup');
    // var flipDownsideClip = createFlipUpsideClip(this.mesh,'facedown');
    // this.mesh.actions.flipUpside.loop = THREE.LoopOnce;
    // this.mesh.actions.flipDownside.loop = THREE.LoopOnce;
    // this.mesh.actions.flipUpside.clampWhenFinished = true;
    // this.mesh.actions.flipDownside.clampWhenFinished = true;
    //this.meshs.push(this.mesh);
    //scene.add( this.mesh );

    t.deckgroup.attach(this.mesh);
  }

  _createClass(Card, [{
    key: "setupMesh",
    value: function setupMesh() {
      this.mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(2.5, 0.02, 3.5), [this.darkMaterial, // left
      this.darkMaterial, // right
      this.faceDownMaterial, // facedown
      this.faceUpMaterial, // faceup
      this.darkMaterial, // top
      this.darkMaterial // bottom
      ]); // this.mesh.scale.x = 0.65;
      // let offset = {x:3,y:3}
      // this.mesh.position.set(
      //     (2*irow)-offset.x,
      //     0,
      //     (2*icol)-offset.y+(icol*0.5)
      // )

      this.mesh.position.y = this.index * 0.025; // offset by card thickness

      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
    }
  }, {
    key: "setupTexturesAndMaterials",
    value: function setupTexturesAndMaterials() {
      // The Card
      this.faceUpTexture = txtLoader.load('https://images-na.ssl-images-amazon.com/images/I/61YXNhfzlzL._SL1012_.jpg');
      this.faceDownTexture = txtLoader.load('https://vignette3.wikia.nocookie.net/yugioh/images/9/94/Back-Anime-2.png/revision/latest?cb=20110624090942'); // faceUpTexture.flipY = false;

      this.darkMaterial = new THREE.MeshPhongMaterial({
        color: 0x111111
      });
      this.faceUpMaterial = new THREE.MeshPhongMaterial({
        color: colorDark,
        map: this.faceUpTexture,
        shininess: 40
      });
      this.faceDownMaterial = new THREE.MeshPhongMaterial({
        color: colorDark,
        map: this.faceDownTexture,
        shininess: 40
      });
    } // used to move a card from a deck to a zone or a player hand
    // note you can use options{arc:true,arcTo:{}} to move the card in an arc (basically just adds an intermediate keyframe point to the curve)

  }, {
    key: "tweenTo",
    value: function () {
      var _tweenTo = _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.mark(function _callee(destination, options) {
        var _mesh, tweenMid, tweenEnd;

        return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // console.log('card move to point',destination,options);
                // this generates a tween between the current position and the destination
                this.destination = destination;

                if (!this.animating) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt("return", false);

              case 3:
                this.animating = true; // TODO: add ability to include/exclude properties from tween to save overhead

                _mesh = this.mesh;
                tweenMid = null;

                if (options && options.arcTo) {
                  // optional midpoint
                  tweenMid = getMeshTween(_mesh, options.arcTo, 300 / 2);
                }

                tweenEnd = getMeshTween(_mesh, destination, {
                  duration: tweenMid ? 300 / 2 : 300 // todo accept easing option

                });
                tweenMid ? tweenMid.chain(tweenEnd).start() : tweenEnd.start();
                _context.next = 11;
                return delay(150);

              case 11:
                // run the tween
                this.animating = false;

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function tweenTo(_x2, _x3) {
        return _tweenTo.apply(this, arguments);
      }

      return tweenTo;
    }()
  }]);

  return Card;
}();

var Deck = /*#__PURE__*/function () {
  function Deck(options) {
    _classCallCheck(this, Deck);

    this.cards = []; // list of card indexes that are still "in the deck"
    //not held by a layout zone or a player hand

    this.available_cards = []; // since we're animating the shuffles,
    // we keep track of each change to the array
    // would also allow us to add a undo/redo + replay feature
    // but for now it's just for checking the previous order versus the current order

    this.available_cards_history = [];

    for (var i = 0; (_ref = i < (options === null || options === void 0 ? void 0 : options.card_count)) !== null && _ref !== void 0 ? _ref : 52; i++) {
      var _ref;

      this.cards.push(new Card(i));
      this.available_cards.push(i);
    }
  } // todo allow shuffling indefinitely until player clicks to stop


  _createClass(Deck, [{
    key: "shuffle",
    value: function () {
      var _shuffle = _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.mark(function _callee2() {
        var iterations,
            i,
            final_available_cards,
            _args2 = arguments;
        return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                iterations = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : 3;

                if (!this.shuffling) {
                  _context2.next = 3;
                  break;
                }

                return _context2.abrupt("return");

              case 3:
                this.shuffling = true;
                i = 0;

              case 5:
                if (!(i < iterations)) {
                  _context2.next = 13;
                  break;
                }

                _context2.next = 8;
                return this.shuffleOnce(this.available_cards);

              case 8:
                final_available_cards = _context2.sent;
                this.available_cards = final_available_cards;

              case 10:
                i++;
                _context2.next = 5;
                break;

              case 13:
                this.shuffling = false;

              case 14:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function shuffle() {
        return _shuffle.apply(this, arguments);
      }

      return shuffle;
    }()
  }, {
    key: "shuffleOnce",
    value: function () {
      var _shuffleOnce = _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.mark(function _callee3(array) {
        var m, t, i;
        return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                m = array.length; // While there remain elements to shuffle…

              case 1:
                if (!m) {
                  _context3.next = 14;
                  break;
                }

                // snapshot the array
                this.available_cards_history.push(array.slice()); // Pick a remaining element…

                i = Math.floor(Math.random() * m--); // And swap it with the current element.

                t = array[m];
                array[m] = array[i];
                array[i] = t;
                this.cards[array[m]].deck_order_index = m;
                this.cards[array[i]].deck_order_index = i; // animate the shuffled cards coming off the top
                // and sliding back into the deck

                this.animateOrderChangeAsShuffle(array[i], array[m], i, m); // artificially delay the shuffling

                _context3.next = 12;
                return delay(3);

              case 12:
                _context3.next = 1;
                break;

              case 14:
                return _context3.abrupt("return", array);

              case 15:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function shuffleOnce(_x4) {
        return _shuffleOnce.apply(this, arguments);
      }

      return shuffleOnce;
    }()
  }, {
    key: "animateOrderChangeAsShuffle",
    value: function animateOrderChangeAsShuffle(iCardA, iCardB, indexA, indexB) {
      //console.log('animating swap of A and B',iCardA,iCardB,indexA,indexB);
      var cardA = this.cards[iCardA];
      cardA.tweenTo({
        pos_x: 0,
        //cardA.mesh.position.x,
        pos_y: indexB * 0.025 // offset by card thickness + minor gap

      }, {
        duration: 150,
        arcTo: {
          pos_x: '-0.5' // camera left, screen right
          // y:'+1',

        }
      });
      var cardB = this.cards[iCardB];
      cardB.tweenTo({
        pos_x: 0,
        //cardB.mesh.position.x,
        pos_y: indexA * 0.025 // offset by card thickness + minor gap

      }, {
        duration: 150,
        arcTo: {
          pos_x: '+0.5' // camera right, screen left
          // y:'+1',

        }
      }); // by default card order updates do nothing to their position
      // if this was reactive, every modification to this.available_cards (aka the card order of the remaining cards in the deck) would trigger a property update
      // then we would watch those properties and either update z-depth instantly
      // or with a transition tween
      // in this case, we'd want a SPECIAL tween, not just a linear tween of cards phasing thru each other
      // to give it more physicality we want to animate the cards moving off the top of the deck and then back in
    }
  }, {
    key: "dealToLayout",
    value: function () {
      var _dealToLayout = _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.mark(function _callee4(layout) {
        var izone, zone, card_index;
        return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                // for each zone in passed layout
                // if there is no card in the zone
                // pick the top card from the deck
                // and place it in the zone
                // TODO: support multiple cards per zone (think klondike solitaire)
                console.log('dealToLayout', this);
                _context4.t0 = _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.keys(layout.zones);

              case 2:
                if ((_context4.t1 = _context4.t0()).done) {
                  _context4.next = 17;
                  break;
                }

                izone = _context4.t1.value;
                zone = layout.zones[izone];

                if (zone.card) {
                  _context4.next = 15;
                  break;
                }

                card_index = this.available_cards.pop();
                zone.card = card_index;
                this.cards[card_index].zone = izone; // remove card from deckgroup, attach it back to scene root

                scene.attach(this.cards[card_index].mesh);
                this.cards[card_index].tweenTo({
                  pos_x: zone.origin.x,
                  // todo offset by num cards already in the zone
                  pos_y: zone.origin.y,
                  pos_z: zone.origin.z
                }, {
                  duration: 1000
                });
                console.warn('todo, settle ypos of cards in deck as cards are removed');
                console.warn('todo deal from other end of array?');
                _context4.next = 15;
                return delay(150);

              case 15:
                _context4.next = 2;
                break;

              case 17:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function dealToLayout(_x5) {
        return _dealToLayout.apply(this, arguments);
      }

      return dealToLayout;
    }()
  }]);

  return Deck;
}();

var Move = /*#__PURE__*/_createClass(function Move(payload) {
  _classCallCheck(this, Move);

  this.payload = payload; // this.player
  // this.card
  // this.from
  // this.to
  // this.action_score
});

var Round = /*#__PURE__*/function () {
  function Round() {
    _classCallCheck(this, Round);

    this.moves = [];
    this.players = [];
    this.current_player_id = 0;

    for (var i = 0; i < t.players.length; i++) {
      // initialize player for round
      this.players.push({
        score: 0,
        cards: [],
        matches: []
      });
    }

    console.warn('round players', this.players);
  }

  _createClass(Round, [{
    key: "start",
    value: function () {
      var _start = _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.mark(function _callee5() {
        return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                console.log('round start', 'deck', window.t.deck); // center the deck
                // animate the camera

                getMeshTween(camera, {
                  pos_y: '+5'
                }, {
                  duration: 3000
                }).start();
                _context5.next = 4;
                return delay(1000);

              case 4:
                _context5.next = 6;
                return window.t.deck.shuffle();

              case 6:
                _context5.next = 8;
                return delay(1000);

              case 8:
                // move the deck out of the way
                getMeshTween(t.deckgroup, {
                  pos_x: '-8'
                }, {
                  duration: 1000,
                  easing: TWEEN.Easing.Quadratic.InOut
                }).start();
                _context5.next = 11;
                return delay(1000);

              case 11:
                _context5.next = 13;
                return window.t.deck.dealToLayout(window.t.game.layout);

              case 13:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function start() {
        return _start.apply(this, arguments);
      }

      return start;
    }()
  }, {
    key: "recordMove",
    value: function recordMove(move) {
      this.moves.push(move); // todo this.players[move.player].score += move.action_score;
    }
  }, {
    key: "onRoundEnd",
    value: function onRoundEnd(cb) {
      this.on_round_end_callback = cb;
    }
  }, {
    key: "current_player",
    get: function get() {
      return this.players[this.current_player_id];
    }
  }]);

  return Round;
}();

var Layout = /*#__PURE__*/_createClass(function Layout(options) {
  _classCallCheck(this, Layout);

  this.zones = []; // todo: subclass Grid Layout

  this.options = options; // distance between cards

  this.spacing = {
    x: 3,
    y: 3
  };

  for (var r = 0; r < options.rows; r++) {
    for (var c = 0; c < options.cols; c++) {
      // todo: define x,y,z origin coords of zone
      this.zones.push({
        row: r,
        col: c,
        card: null,
        origin: {
          x: 2.5 * r - this.spacing.x + r * 0.5,
          y: 0,
          z: 3.5 * c - this.spacing.y + c * 0.5
        }
      });
    }
  }
});

var Game_PVPMemory = /*#__PURE__*/function () {
  function Game_PVPMemory() {
    _classCallCheck(this, Game_PVPMemory);

    // do we need games to be able to have players?
    // or is it ok if T holds players/spectators
    // and Rounds hold players
    // but not Game instances
    this.round = 0;
    this.decks = {};
    var card_count = 52;
    this.decks["default"] = new Deck({
      card_count: card_count
    });
    this.rounds = [];
    this.player_scores = [];
    this.flipped = [];
    this.reset_timer = null;
    this.reset_delay = 1000;
    this.layout = new Layout({
      rows: 4,
      cols: 4
    });
    this.ignore_clicks = false;
  }

  _createClass(Game_PVPMemory, [{
    key: "startRound",
    value: function startRound() {
      var round = new Round();
      round.onRoundEnd(function () {// update player scores? (they should be reactive during game...)
      });
      this.rounds.push(round);
      this.current_round.start();
    }
  }, {
    key: "current_round",
    get: function get() {
      return this.rounds[this.round];
    }
  }, {
    key: "current_player",
    get: function get() {
      return this.current_round.current_player;
    }
  }, {
    key: "checkForMatches",
    value: function () {
      var _checkForMatches = _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.mark(function _callee6() {
        var match;
        return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                // we've flipped 2+ cards,
                t.game.ignore_clicks = true; // temp: 50/50

                match = Math.random() >= 0.5; // TODO: flippedCardsMatch()
                // check for matches

                if (!match) {
                  _context6.next = 11;
                  break;
                }

                _context6.next = 5;
                return delay(animationDuration * 1000);

              case 5:
                moveFlippedToPlayersHand();
                _context6.next = 8;
                return delay(1000);

              case 8:
                // deal more cards
                // console.warn('todo: if out of cards, reset')
                t.deck.dealToLayout(t.game.layout);
                _context6.next = 12;
                break;

              case 11:
                // set a timer, and then flip them back
                // reset cards
                resetCards();

              case 12:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      function checkForMatches() {
        return _checkForMatches.apply(this, arguments);
      }

      return checkForMatches;
    }()
  }]);

  return Game_PVPMemory;
}();

init();

function init() {
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvas = renderer.domElement;
  document.body.appendChild(canvas);
  camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.set(0, 10, -1.5);
  scene.add(camera);
  controls = new THREE.OrbitControls(camera, canvas);
  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('click', onMouseClick, false);
  window.addEventListener('mousedown', onMouseDown, false);
  window.addEventListener('touchstart', onTouchStart, false);
  window.addEventListener('touchend', onTouchEnd, false);
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  txtLoader = new THREE.TextureLoader();
  clock = new THREE.Clock(); // init our game instance as window.t

  window.t = new Tabletop(); // set it up

  t.setupGame(); // start the first round

  t.startGame(); // kick off render loop

  render();
}

function render() {
  if (resize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  delta = clock.getDelta(); // for(let i = 0; i < cards.length; i ++){
  //   cards[i].mixer.update( delta );
  // }

  TWEEN.update(); // update all tweens :)

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

function initLights() {
  var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  var dirLight = new THREE.DirectionalLight(0xcceeff, 0.9);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.position.setScalar(5);
  scene.add(dirLight, ambientLight);
}

function getFlipTween(card, direction) {
  var initPos = card.position;
  var zAxis = new THREE.Vector3(0, 0, 1);
  var qInitial = new THREE.Quaternion().setFromAxisAngle(zAxis, direction === 'facedown' ? Math.PI : 0);
  var qFinal = new THREE.Quaternion().setFromAxisAngle(zAxis, direction === 'faceup' ? Math.PI : 0);
  var pos = {
    x: initPos.x,
    y: initPos.y,
    z: initPos.z,
    rx: qInitial.x,
    ry: qInitial.y,
    rz: qInitial.z,
    rw: qInitial.w
  };

  function posUpdate() {
    card.position.set(pos.x, pos.y, pos.z);
    card.quaternion.set(pos.rx, pos.ry, pos.rz, pos.rw);
  }

  var flipTweenStart = new TWEEN.Tween(pos).to({
    x: initPos.x,
    y: initPos.y + 1,
    z: initPos.z,
    rx: qFinal.x,
    ry: qFinal.y,
    rz: qFinal.z,
    rw: qFinal.w
  }, animationDuration * 1000 / 2).easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
  .onUpdate(posUpdate); //.start() // Start the tween immediately.

  var flipTweenKF2 = new TWEEN.Tween(pos).to({
    x: initPos.x,
    y: initPos.y,
    z: initPos.z,
    rx: qFinal.x,
    ry: qFinal.y,
    rz: qFinal.z,
    rw: qFinal.w
  }, animationDuration * 1000 / 2).easing(TWEEN.Easing.Quadratic.In).onUpdate(posUpdate);
  return flipTweenStart.chain(flipTweenKF2);
}

function getMeshTween(mesh, updateTo, options) {
  var _options$duration, _options$easing;

  // const initPos = {
  //   x: ,
  //   y: mesh.position.y,
  //   z: mesh.position.z
  // };
  // const initScale = {
  //   x: mesh.scale.x,
  //   y: mesh.scale.y,
  //   z: mesh.scale.z,
  // }
  var tweenProps = {
    pos_x: mesh.position.x,
    pos_y: mesh.position.y,
    pos_z: mesh.position.z,
    rot_x: mesh.rotation.x,
    rot_y: mesh.rotation.y,
    rot_z: mesh.rotation.z,
    rot_w: mesh.rotation.w,
    scale_x: mesh.scale.x,
    scale_y: mesh.scale.y,
    scale_z: mesh.scale.z
  }; //
  //

  function propsUpdate() {
    mesh.position.set(tweenProps.pos_x, tweenProps.pos_y, tweenProps.pos_z);
    mesh.rotation.x = tweenProps.rot_x;
    mesh.rotation.y = tweenProps.rot_y;
    mesh.rotation.z = tweenProps.rot_z;
    mesh.scale.set(tweenProps.scale_x, tweenProps.scale_y, tweenProps.scale_z);
  }

  var tween = new TWEEN.Tween(tweenProps).to(updateTo, (_options$duration = options === null || options === void 0 ? void 0 : options.duration) !== null && _options$duration !== void 0 ? _options$duration : 500).easing((_options$easing = options === null || options === void 0 ? void 0 : options.easing) !== null && _options$easing !== void 0 ? _options$easing : TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
  .onUpdate(propsUpdate);
  return tween;
}

function initGround() {
  ground = new THREE.Mesh(new THREE.PlaneBufferGeometry(50, 50), new THREE.MeshStandardMaterial({
    //map: txtLoader.load( "https://threejs.org/examples/textures/hardwood2_diffuse.jpg" ),
    metalness: 0,
    roughness: 1,
    color: '#000000'
  }));
  ground.geometry.rotateX(-Math.PI * 0.5);
  ground.position.set(0, -0.001, 0);
  ground.receiveShadow = true;
  scene.add(ground);
} // function createFlipUpsideClip( card, side ){ // 'faceup' or 'facedown'
//   // Create a keyframe track (i.e. a timed sequence of keyframes) for each animated property
//   // Note: the keyframe track type should correspond to the type of the property being animated
//   // Rotation
//   var zAxis = new THREE.Vector3( 0, 0, 1 );
//   if( side === 'faceup' ){
//     var qInitial = new THREE.Quaternion().setFromAxisAngle( zAxis, 0 );
//     var qFinal = new THREE.Quaternion().setFromAxisAngle( zAxis, Math.PI );
//   } else if( side === 'facedown' ){
//     var qInitial = new THREE.Quaternion().setFromAxisAngle( zAxis, Math.PI );
//     var qFinal = new THREE.Quaternion().setFromAxisAngle( zAxis, 0 );
//   }
//   var quaternionKF = new THREE.QuaternionKeyframeTrack(
//     '.quaternion',
//     [ 0, animationDuration ],
//     [
//       qInitial.x,
//       qInitial.y,
//       qInitial.z,
//       qInitial.w,
//       qFinal.x,
//       qFinal.y,
//       qFinal.z,
//       qFinal.w
//     ]
//   );
//   function pointFromInitialOffset(x,y,z){
//     return new THREE.Vector3(
//       card.position.x + x,
//       card.position.y + y,
//       card.position.z + z
//     )
//   }
//   // Position
//   var pointsArr = [
//     pointFromInitialOffset( 0, 0, 0 ),
//     pointFromInitialOffset( 0, 0.8, 0 ),
//     pointFromInitialOffset( 0, 1.5, 0 ),
//     pointFromInitialOffset( 0, 1.2, 0 ),
//     pointFromInitialOffset( 0, 0, 0 )
//   ];
//   if( side === 'facedown' ){
//     pointsArr.forEach( function( vec3 , i ){
//       //vec3.x = -vec3.x;
//     });
//   }
//   var CRC = new THREE.CatmullRomCurve3( pointsArr, false, 'catmullrom', 1 );
//   var CRCPoints = CRC.getPoints( 60 );
//   //var helper = pointsHelper( CRCPoints );
//   //scene.add( helper ); // Optional helper for position curve
//   var posArrFlat = [];
//   for( var i = 0; i < CRCPoints.length; i++ ){
//     posArrFlat.push( CRCPoints[i].x, CRCPoints[i].y, CRCPoints[i].z );
//   }
//   var timesArr = [];
//   var len = posArrFlat.length - 3;
//   for( var j = 0; j < posArrFlat.length/3; j++ ){
//     var x = ((animationDuration / len) * j * 3) + 0; // + delay
//     timesArr.push( x );
//   }
//   var positionKF = new THREE.VectorKeyframeTrack(
//     '.position',
//     timesArr,
//     posArrFlat,
//     THREE.InterpolateSmooth
//   );
//   var flipUpsideClip = new THREE.AnimationClip(
//     'Flip' ,
//     animationDuration ,
//     [ positionKF, quaternionKF ]
//   );
//   return flipUpsideClip;
// }
// mouse over hover effect
// TODO: use SHADER to blend
// TODO: animate color transition


function onMouseMove(evt) {
  var cards = t.cards;
  var keep_testing = true;

  for (var i = 0; i < cards.length; i++) {
    var card = cards[i].mesh;

    if (keep_testing && raycast(card) == true) {
      keep_testing = false;
      card.material[2].color.set(colorLight);
      card.material[3].color.set(colorLight);
    } else {
      card.material[2].color.set(colorDark);
      card.material[3].color.set(colorDark);
    }
  }
}

function onMouseDown(evt) {
  mouseDownCoord = {
    x: evt.clientX,
    y: evt.clientY
  };
}

function onTouchStart(evt) {
  var touches = evt.changedTouches; //   for (let i = 0; i < touches.length; i++) {
  //     console.log(`touchstart: ${i}.`,touches[i]);
  //     //ongoingTouches.push(copyTouch(touches[i]));
  //   }

  if (touches.length) {
    //alert(touches[0].clientX);
    onMouseDown({
      clientX: touches[0].clientX,
      clientY: touches[0].clientY
    });
  }
}

function onTouchEnd(evt) {
  var touches = evt.changedTouches; //   for (let i = 0; i < touches.length; i++) {
  //     console.log(`touchend: ${i}.`,touches[i]);
  //     //ongoingTouches.push(copyTouch(touches[i]));
  //   }

  if (touches !== null && touches !== void 0 && touches[0]) {
    onMouseClick({
      clientX: touches[0].clientX,
      clientY: touches[0].clientY
    });
  }
}

function onMouseClick(evt) {
  if (t.game.ignore_clicks || t.deck.shuffling) {
    return;
  }

  mouseClickCoord = {
    x: evt.clientX,
    y: evt.clientY
  };
  var drag_distance = Math.hypot(mouseClickCoord.x - mouseDownCoord.x, mouseClickCoord.y - mouseDownCoord.y);
  console.log({
    mouseDownCoord: mouseDownCoord,
    mouseClickCoord: mouseClickCoord,
    drag_distance: drag_distance
  }); // ignore clicks if you dragged the mouse

  if (drag_distance > 10) {
    return;
  }

  var keep_testing = true;

  for (var i = 0; i < t.cards.length; i++) {
    if (!keep_testing) {
      continue;
    }

    var __card = t.cards[i];
    var _card = __card.mesh; // TODO: we need to only react to the card that is closest to the camera
    // need to account for occluders too :/

    if (_card && raycast(_card) == true && !__card.animating) {
      keep_testing = false;

      if ( // ignore if we already flipped this card over
      t.game.flipped.indexOf(i) > -1 // or if it's in the player hand
      || t.game.current_player.cards.indexOf(i) > -1) {
        return;
      }

      if (_card.faceUp) {
        // card faceup
        getFlipTween(_card, 'facedown').start();
        _card.faceUp = false;
        t.server.send({
          type: 'flip',
          direction: 'facedown',
          card_id: i
        });
      } else if (!_card.faceUp) {
        // card facedown
        // so turn it faceup
        getFlipTween(_card, 'faceup').start();
        _card.faceUp = true;
        t.game.flipped.push(i);
        t.server.send({
          type: 'flip',
          direction: 'faceup',
          card_id: i
        });
      }
    }
  }

  if (t.game.flipped.length > 1) {
    t.game.checkForMatches();
  }
}

function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
}

function addMatchToHand(i_card_a, i_card_b) {
  camera.attach(t.cards[i_card_a].mesh);
  camera.attach(t.cards[i_card_b].mesh); //   cards[i_card_a].position.set(0,-.5,-1)
  //   cards[i_card_a].scale.set(.1,.1,.1)
  //   cards[i_card_a].rotation.set(1,Math.PI,Math.PI,'XYZ')
  //   cards[i_card_b].scale.set(.1,.1,.1)
  //   cards[i_card_b].position.set(-.1,-.5,-1)
  //   cards[i_card_b].rotation.set(1,Math.PI,Math.PI,'XYZ')

  var current_player = t.game.current_player;
  var matches_count = current_player.matches.length;

  for (var a = 1; a <= current_player.cards.length; a++) {
    var i_card = current_player.cards[a - 1];
    var card = t.cards[i_card];
    var even = a % 2 == 0;
    var lerp_max = .07 * matches_count;
    var updateTo = {};
    updateTo.pos_x = lerp(0, // 0 basis
    lerp_max, // lerp max width
    1 / matches_count * (even ? a + 1 : a + 2)) // % of lerp
    - (even ? .1 : .105) // slight offset for "paired" card
    - a * .01 // padding between cards
    - lerp_max // center
    + .05;
    updateTo.pos_y = -0.5 + 0.001 * a;
    updateTo.pos_z = -1.0 + 0.001 * a;
    updateTo.rot_x = 0.5; //1;

    updateTo.rot_y = Math.PI;
    updateTo.rot_z = Math.PI;
    updateTo.scale_x = .09 * .65;
    updateTo.scale_y = .09;
    updateTo.scale_z = .09; //
    // console.log(updateTo);

    card.tweenTo(updateTo, {
      duration: 300
    });
  }
}

function moveFlippedToPlayersHand() {
  t.server.send({
    type: 'move_flipped_to_hand',
    cardA: t.game.flipped[0],
    cardB: t.game.flipped[1]
  }); // t.currentPlayerHand == t.round.[t.round.current_player]

  t.game.current_player.matches.push(t.game.flipped);
  t.game.current_player.cards.push(t.game.flipped[0], t.game.flipped[1]); // remove cards from their zones so new cards can fill in

  var cardA = t.cards[t.game.flipped[0]];
  var cardB = t.cards[t.game.flipped[1]];
  t.game.layout.zones[cardA.zone].card = null;
  t.game.layout.zones[cardB.zone].card = null;
  addMatchToHand(t.game.flipped[0], t.game.flipped[1]);
  t.game.flipped = [];
  console.warn('moving flipped cards to players hand', t.game.current_player.matches, t.game.current_player.cards);
  t.game.ignore_clicks = false;
}

function resetCards() {
  t.game.reset_timer = setTimeout(function () {
    for (var a = 0; a < t.game.flipped.length; a++) {
      var fci = t.game.flipped[a];
      var fc = t.cards[fci].mesh; // fc.actions.flipUpside.stop();

      getFlipTween(fc, 'facedown').start(); //  fc.actions.flipDownside.start();

      fc.faceUp = false;
    }

    t.game.flipped = [];
    t.game.ignore_clicks = false;
  }, reset_delay);
}

function raycast(object) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  mouse.x = event.clientX / window.innerWidth * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; // update the picking ray with the camera and mouse position

  raycaster.setFromCamera(mouse, camera); // calculate objects intersecting the picking ray

  var intersects = raycaster.intersectObject(object);

  if (intersects.length > 0) {
    return true;
  } else {
    return false;
  }
}

function pointsHelper(pointsArray) {
  var geometry = new THREE.BufferGeometry().setFromPoints(pointsArray);
  var material = new THREE.LineBasicMaterial({
    color: 0xff0000
  });
  var curveObject = new THREE.Line(geometry, material);
  return curveObject;
}

function resize(renderer) {
  var canvas = renderer.domElement;
  var width = canvas.clientWidth;
  var height = canvas.clientHeight;
  var needResize = canvas.width !== width || canvas.height !== height;

  if (needResize) {
    renderer.setSize(width, height, false);
  }

  return needResize;
}
})();

/******/ })()
;