var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/react/cjs/react.production.min.js
var require_react_production_min = __commonJS({
  "node_modules/react/cjs/react.production.min.js"(exports) {
    "use strict";
    var l = Symbol.for("react.element");
    var n2 = Symbol.for("react.portal");
    var p2 = Symbol.for("react.fragment");
    var q2 = Symbol.for("react.strict_mode");
    var r3 = Symbol.for("react.profiler");
    var t3 = Symbol.for("react.provider");
    var u2 = Symbol.for("react.context");
    var v2 = Symbol.for("react.forward_ref");
    var w2 = Symbol.for("react.suspense");
    var x2 = Symbol.for("react.memo");
    var y2 = Symbol.for("react.lazy");
    var z2 = Symbol.iterator;
    function A2(a2) {
      if (null === a2 || "object" !== typeof a2) return null;
      a2 = z2 && a2[z2] || a2["@@iterator"];
      return "function" === typeof a2 ? a2 : null;
    }
    var B2 = { isMounted: function() {
      return false;
    }, enqueueForceUpdate: function() {
    }, enqueueReplaceState: function() {
    }, enqueueSetState: function() {
    } };
    var C2 = Object.assign;
    var D2 = {};
    function E2(a2, b2, e2) {
      this.props = a2;
      this.context = b2;
      this.refs = D2;
      this.updater = e2 || B2;
    }
    E2.prototype.isReactComponent = {};
    E2.prototype.setState = function(a2, b2) {
      if ("object" !== typeof a2 && "function" !== typeof a2 && null != a2) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
      this.updater.enqueueSetState(this, a2, b2, "setState");
    };
    E2.prototype.forceUpdate = function(a2) {
      this.updater.enqueueForceUpdate(this, a2, "forceUpdate");
    };
    function F2() {
    }
    F2.prototype = E2.prototype;
    function G(a2, b2, e2) {
      this.props = a2;
      this.context = b2;
      this.refs = D2;
      this.updater = e2 || B2;
    }
    var H2 = G.prototype = new F2();
    H2.constructor = G;
    C2(H2, E2.prototype);
    H2.isPureReactComponent = true;
    var I2 = Array.isArray;
    var J = Object.prototype.hasOwnProperty;
    var K = { current: null };
    var L2 = { key: true, ref: true, __self: true, __source: true };
    function M2(a2, b2, e2) {
      var d2, c2 = {}, k2 = null, h2 = null;
      if (null != b2) for (d2 in void 0 !== b2.ref && (h2 = b2.ref), void 0 !== b2.key && (k2 = "" + b2.key), b2) J.call(b2, d2) && !L2.hasOwnProperty(d2) && (c2[d2] = b2[d2]);
      var g2 = arguments.length - 2;
      if (1 === g2) c2.children = e2;
      else if (1 < g2) {
        for (var f2 = Array(g2), m2 = 0; m2 < g2; m2++) f2[m2] = arguments[m2 + 2];
        c2.children = f2;
      }
      if (a2 && a2.defaultProps) for (d2 in g2 = a2.defaultProps, g2) void 0 === c2[d2] && (c2[d2] = g2[d2]);
      return { $$typeof: l, type: a2, key: k2, ref: h2, props: c2, _owner: K.current };
    }
    function N2(a2, b2) {
      return { $$typeof: l, type: a2.type, key: b2, ref: a2.ref, props: a2.props, _owner: a2._owner };
    }
    function O2(a2) {
      return "object" === typeof a2 && null !== a2 && a2.$$typeof === l;
    }
    function escape(a2) {
      var b2 = { "=": "=0", ":": "=2" };
      return "$" + a2.replace(/[=:]/g, function(a3) {
        return b2[a3];
      });
    }
    var P2 = /\/+/g;
    function Q2(a2, b2) {
      return "object" === typeof a2 && null !== a2 && null != a2.key ? escape("" + a2.key) : b2.toString(36);
    }
    function R2(a2, b2, e2, d2, c2) {
      var k2 = typeof a2;
      if ("undefined" === k2 || "boolean" === k2) a2 = null;
      var h2 = false;
      if (null === a2) h2 = true;
      else switch (k2) {
        case "string":
        case "number":
          h2 = true;
          break;
        case "object":
          switch (a2.$$typeof) {
            case l:
            case n2:
              h2 = true;
          }
      }
      if (h2) return h2 = a2, c2 = c2(h2), a2 = "" === d2 ? "." + Q2(h2, 0) : d2, I2(c2) ? (e2 = "", null != a2 && (e2 = a2.replace(P2, "$&/") + "/"), R2(c2, b2, e2, "", function(a3) {
        return a3;
      })) : null != c2 && (O2(c2) && (c2 = N2(c2, e2 + (!c2.key || h2 && h2.key === c2.key ? "" : ("" + c2.key).replace(P2, "$&/") + "/") + a2)), b2.push(c2)), 1;
      h2 = 0;
      d2 = "" === d2 ? "." : d2 + ":";
      if (I2(a2)) for (var g2 = 0; g2 < a2.length; g2++) {
        k2 = a2[g2];
        var f2 = d2 + Q2(k2, g2);
        h2 += R2(k2, b2, e2, f2, c2);
      }
      else if (f2 = A2(a2), "function" === typeof f2) for (a2 = f2.call(a2), g2 = 0; !(k2 = a2.next()).done; ) k2 = k2.value, f2 = d2 + Q2(k2, g2++), h2 += R2(k2, b2, e2, f2, c2);
      else if ("object" === k2) throw b2 = String(a2), Error("Objects are not valid as a React child (found: " + ("[object Object]" === b2 ? "object with keys {" + Object.keys(a2).join(", ") + "}" : b2) + "). If you meant to render a collection of children, use an array instead.");
      return h2;
    }
    function S2(a2, b2, e2) {
      if (null == a2) return a2;
      var d2 = [], c2 = 0;
      R2(a2, d2, "", "", function(a3) {
        return b2.call(e2, a3, c2++);
      });
      return d2;
    }
    function T2(a2) {
      if (-1 === a2._status) {
        var b2 = a2._result;
        b2 = b2();
        b2.then(function(b3) {
          if (0 === a2._status || -1 === a2._status) a2._status = 1, a2._result = b3;
        }, function(b3) {
          if (0 === a2._status || -1 === a2._status) a2._status = 2, a2._result = b3;
        });
        -1 === a2._status && (a2._status = 0, a2._result = b2);
      }
      if (1 === a2._status) return a2._result.default;
      throw a2._result;
    }
    var U = { current: null };
    var V = { transition: null };
    var W = { ReactCurrentDispatcher: U, ReactCurrentBatchConfig: V, ReactCurrentOwner: K };
    function X2() {
      throw Error("act(...) is not supported in production builds of React.");
    }
    exports.Children = { map: S2, forEach: function(a2, b2, e2) {
      S2(a2, function() {
        b2.apply(this, arguments);
      }, e2);
    }, count: function(a2) {
      var b2 = 0;
      S2(a2, function() {
        b2++;
      });
      return b2;
    }, toArray: function(a2) {
      return S2(a2, function(a3) {
        return a3;
      }) || [];
    }, only: function(a2) {
      if (!O2(a2)) throw Error("React.Children.only expected to receive a single React element child.");
      return a2;
    } };
    exports.Component = E2;
    exports.Fragment = p2;
    exports.Profiler = r3;
    exports.PureComponent = G;
    exports.StrictMode = q2;
    exports.Suspense = w2;
    exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W;
    exports.act = X2;
    exports.cloneElement = function(a2, b2, e2) {
      if (null === a2 || void 0 === a2) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a2 + ".");
      var d2 = C2({}, a2.props), c2 = a2.key, k2 = a2.ref, h2 = a2._owner;
      if (null != b2) {
        void 0 !== b2.ref && (k2 = b2.ref, h2 = K.current);
        void 0 !== b2.key && (c2 = "" + b2.key);
        if (a2.type && a2.type.defaultProps) var g2 = a2.type.defaultProps;
        for (f2 in b2) J.call(b2, f2) && !L2.hasOwnProperty(f2) && (d2[f2] = void 0 === b2[f2] && void 0 !== g2 ? g2[f2] : b2[f2]);
      }
      var f2 = arguments.length - 2;
      if (1 === f2) d2.children = e2;
      else if (1 < f2) {
        g2 = Array(f2);
        for (var m2 = 0; m2 < f2; m2++) g2[m2] = arguments[m2 + 2];
        d2.children = g2;
      }
      return { $$typeof: l, type: a2.type, key: c2, ref: k2, props: d2, _owner: h2 };
    };
    exports.createContext = function(a2) {
      a2 = { $$typeof: u2, _currentValue: a2, _currentValue2: a2, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null };
      a2.Provider = { $$typeof: t3, _context: a2 };
      return a2.Consumer = a2;
    };
    exports.createElement = M2;
    exports.createFactory = function(a2) {
      var b2 = M2.bind(null, a2);
      b2.type = a2;
      return b2;
    };
    exports.createRef = function() {
      return { current: null };
    };
    exports.forwardRef = function(a2) {
      return { $$typeof: v2, render: a2 };
    };
    exports.isValidElement = O2;
    exports.lazy = function(a2) {
      return { $$typeof: y2, _payload: { _status: -1, _result: a2 }, _init: T2 };
    };
    exports.memo = function(a2, b2) {
      return { $$typeof: x2, type: a2, compare: void 0 === b2 ? null : b2 };
    };
    exports.startTransition = function(a2) {
      var b2 = V.transition;
      V.transition = {};
      try {
        a2();
      } finally {
        V.transition = b2;
      }
    };
    exports.unstable_act = X2;
    exports.useCallback = function(a2, b2) {
      return U.current.useCallback(a2, b2);
    };
    exports.useContext = function(a2) {
      return U.current.useContext(a2);
    };
    exports.useDebugValue = function() {
    };
    exports.useDeferredValue = function(a2) {
      return U.current.useDeferredValue(a2);
    };
    exports.useEffect = function(a2, b2) {
      return U.current.useEffect(a2, b2);
    };
    exports.useId = function() {
      return U.current.useId();
    };
    exports.useImperativeHandle = function(a2, b2, e2) {
      return U.current.useImperativeHandle(a2, b2, e2);
    };
    exports.useInsertionEffect = function(a2, b2) {
      return U.current.useInsertionEffect(a2, b2);
    };
    exports.useLayoutEffect = function(a2, b2) {
      return U.current.useLayoutEffect(a2, b2);
    };
    exports.useMemo = function(a2, b2) {
      return U.current.useMemo(a2, b2);
    };
    exports.useReducer = function(a2, b2, e2) {
      return U.current.useReducer(a2, b2, e2);
    };
    exports.useRef = function(a2) {
      return U.current.useRef(a2);
    };
    exports.useState = function(a2) {
      return U.current.useState(a2);
    };
    exports.useSyncExternalStore = function(a2, b2, e2) {
      return U.current.useSyncExternalStore(a2, b2, e2);
    };
    exports.useTransition = function() {
      return U.current.useTransition();
    };
    exports.version = "18.3.1";
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports, module) {
    "use strict";
    if (true) {
      module.exports = require_react_production_min();
    } else {
      module.exports = null;
    }
  }
});

// node_modules/scheduler/cjs/scheduler.production.min.js
var require_scheduler_production_min = __commonJS({
  "node_modules/scheduler/cjs/scheduler.production.min.js"(exports) {
    "use strict";
    function f2(a2, b2) {
      var c2 = a2.length;
      a2.push(b2);
      a: for (; 0 < c2; ) {
        var d2 = c2 - 1 >>> 1, e2 = a2[d2];
        if (0 < g2(e2, b2)) a2[d2] = b2, a2[c2] = e2, c2 = d2;
        else break a;
      }
    }
    function h2(a2) {
      return 0 === a2.length ? null : a2[0];
    }
    function k2(a2) {
      if (0 === a2.length) return null;
      var b2 = a2[0], c2 = a2.pop();
      if (c2 !== b2) {
        a2[0] = c2;
        a: for (var d2 = 0, e2 = a2.length, w2 = e2 >>> 1; d2 < w2; ) {
          var m2 = 2 * (d2 + 1) - 1, C2 = a2[m2], n2 = m2 + 1, x2 = a2[n2];
          if (0 > g2(C2, c2)) n2 < e2 && 0 > g2(x2, C2) ? (a2[d2] = x2, a2[n2] = c2, d2 = n2) : (a2[d2] = C2, a2[m2] = c2, d2 = m2);
          else if (n2 < e2 && 0 > g2(x2, c2)) a2[d2] = x2, a2[n2] = c2, d2 = n2;
          else break a;
        }
      }
      return b2;
    }
    function g2(a2, b2) {
      var c2 = a2.sortIndex - b2.sortIndex;
      return 0 !== c2 ? c2 : a2.id - b2.id;
    }
    if ("object" === typeof performance && "function" === typeof performance.now) {
      l = performance;
      exports.unstable_now = function() {
        return l.now();
      };
    } else {
      p2 = Date, q2 = p2.now();
      exports.unstable_now = function() {
        return p2.now() - q2;
      };
    }
    var l;
    var p2;
    var q2;
    var r3 = [];
    var t3 = [];
    var u2 = 1;
    var v2 = null;
    var y2 = 3;
    var z2 = false;
    var A2 = false;
    var B2 = false;
    var D2 = "function" === typeof setTimeout ? setTimeout : null;
    var E2 = "function" === typeof clearTimeout ? clearTimeout : null;
    var F2 = "undefined" !== typeof setImmediate ? setImmediate : null;
    "undefined" !== typeof navigator && void 0 !== navigator.scheduling && void 0 !== navigator.scheduling.isInputPending && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function G(a2) {
      for (var b2 = h2(t3); null !== b2; ) {
        if (null === b2.callback) k2(t3);
        else if (b2.startTime <= a2) k2(t3), b2.sortIndex = b2.expirationTime, f2(r3, b2);
        else break;
        b2 = h2(t3);
      }
    }
    function H2(a2) {
      B2 = false;
      G(a2);
      if (!A2) if (null !== h2(r3)) A2 = true, I2(J);
      else {
        var b2 = h2(t3);
        null !== b2 && K(H2, b2.startTime - a2);
      }
    }
    function J(a2, b2) {
      A2 = false;
      B2 && (B2 = false, E2(L2), L2 = -1);
      z2 = true;
      var c2 = y2;
      try {
        G(b2);
        for (v2 = h2(r3); null !== v2 && (!(v2.expirationTime > b2) || a2 && !M2()); ) {
          var d2 = v2.callback;
          if ("function" === typeof d2) {
            v2.callback = null;
            y2 = v2.priorityLevel;
            var e2 = d2(v2.expirationTime <= b2);
            b2 = exports.unstable_now();
            "function" === typeof e2 ? v2.callback = e2 : v2 === h2(r3) && k2(r3);
            G(b2);
          } else k2(r3);
          v2 = h2(r3);
        }
        if (null !== v2) var w2 = true;
        else {
          var m2 = h2(t3);
          null !== m2 && K(H2, m2.startTime - b2);
          w2 = false;
        }
        return w2;
      } finally {
        v2 = null, y2 = c2, z2 = false;
      }
    }
    var N2 = false;
    var O2 = null;
    var L2 = -1;
    var P2 = 5;
    var Q2 = -1;
    function M2() {
      return exports.unstable_now() - Q2 < P2 ? false : true;
    }
    function R2() {
      if (null !== O2) {
        var a2 = exports.unstable_now();
        Q2 = a2;
        var b2 = true;
        try {
          b2 = O2(true, a2);
        } finally {
          b2 ? S2() : (N2 = false, O2 = null);
        }
      } else N2 = false;
    }
    var S2;
    if ("function" === typeof F2) S2 = function() {
      F2(R2);
    };
    else if ("undefined" !== typeof MessageChannel) {
      T2 = new MessageChannel(), U = T2.port2;
      T2.port1.onmessage = R2;
      S2 = function() {
        U.postMessage(null);
      };
    } else S2 = function() {
      D2(R2, 0);
    };
    var T2;
    var U;
    function I2(a2) {
      O2 = a2;
      N2 || (N2 = true, S2());
    }
    function K(a2, b2) {
      L2 = D2(function() {
        a2(exports.unstable_now());
      }, b2);
    }
    exports.unstable_IdlePriority = 5;
    exports.unstable_ImmediatePriority = 1;
    exports.unstable_LowPriority = 4;
    exports.unstable_NormalPriority = 3;
    exports.unstable_Profiling = null;
    exports.unstable_UserBlockingPriority = 2;
    exports.unstable_cancelCallback = function(a2) {
      a2.callback = null;
    };
    exports.unstable_continueExecution = function() {
      A2 || z2 || (A2 = true, I2(J));
    };
    exports.unstable_forceFrameRate = function(a2) {
      0 > a2 || 125 < a2 ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : P2 = 0 < a2 ? Math.floor(1e3 / a2) : 5;
    };
    exports.unstable_getCurrentPriorityLevel = function() {
      return y2;
    };
    exports.unstable_getFirstCallbackNode = function() {
      return h2(r3);
    };
    exports.unstable_next = function(a2) {
      switch (y2) {
        case 1:
        case 2:
        case 3:
          var b2 = 3;
          break;
        default:
          b2 = y2;
      }
      var c2 = y2;
      y2 = b2;
      try {
        return a2();
      } finally {
        y2 = c2;
      }
    };
    exports.unstable_pauseExecution = function() {
    };
    exports.unstable_requestPaint = function() {
    };
    exports.unstable_runWithPriority = function(a2, b2) {
      switch (a2) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          a2 = 3;
      }
      var c2 = y2;
      y2 = a2;
      try {
        return b2();
      } finally {
        y2 = c2;
      }
    };
    exports.unstable_scheduleCallback = function(a2, b2, c2) {
      var d2 = exports.unstable_now();
      "object" === typeof c2 && null !== c2 ? (c2 = c2.delay, c2 = "number" === typeof c2 && 0 < c2 ? d2 + c2 : d2) : c2 = d2;
      switch (a2) {
        case 1:
          var e2 = -1;
          break;
        case 2:
          e2 = 250;
          break;
        case 5:
          e2 = 1073741823;
          break;
        case 4:
          e2 = 1e4;
          break;
        default:
          e2 = 5e3;
      }
      e2 = c2 + e2;
      a2 = { id: u2++, callback: b2, priorityLevel: a2, startTime: c2, expirationTime: e2, sortIndex: -1 };
      c2 > d2 ? (a2.sortIndex = c2, f2(t3, a2), null === h2(r3) && a2 === h2(t3) && (B2 ? (E2(L2), L2 = -1) : B2 = true, K(H2, c2 - d2))) : (a2.sortIndex = e2, f2(r3, a2), A2 || z2 || (A2 = true, I2(J)));
      return a2;
    };
    exports.unstable_shouldYield = M2;
    exports.unstable_wrapCallback = function(a2) {
      var b2 = y2;
      return function() {
        var c2 = y2;
        y2 = b2;
        try {
          return a2.apply(this, arguments);
        } finally {
          y2 = c2;
        }
      };
    };
  }
});

// node_modules/scheduler/index.js
var require_scheduler = __commonJS({
  "node_modules/scheduler/index.js"(exports, module) {
    "use strict";
    if (true) {
      module.exports = require_scheduler_production_min();
    } else {
      module.exports = null;
    }
  }
});

// node_modules/react-dom/cjs/react-dom.production.min.js
var require_react_dom_production_min = __commonJS({
  "node_modules/react-dom/cjs/react-dom.production.min.js"(exports) {
    "use strict";
    var aa = require_react();
    var ca = require_scheduler();
    function p2(a2) {
      for (var b2 = "https://reactjs.org/docs/error-decoder.html?invariant=" + a2, c2 = 1; c2 < arguments.length; c2++) b2 += "&args[]=" + encodeURIComponent(arguments[c2]);
      return "Minified React error #" + a2 + "; visit " + b2 + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
    }
    var da = /* @__PURE__ */ new Set();
    var ea = {};
    function fa(a2, b2) {
      ha(a2, b2);
      ha(a2 + "Capture", b2);
    }
    function ha(a2, b2) {
      ea[a2] = b2;
      for (a2 = 0; a2 < b2.length; a2++) da.add(b2[a2]);
    }
    var ia = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement);
    var ja = Object.prototype.hasOwnProperty;
    var ka = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/;
    var la = {};
    var ma = {};
    function oa(a2) {
      if (ja.call(ma, a2)) return true;
      if (ja.call(la, a2)) return false;
      if (ka.test(a2)) return ma[a2] = true;
      la[a2] = true;
      return false;
    }
    function pa(a2, b2, c2, d2) {
      if (null !== c2 && 0 === c2.type) return false;
      switch (typeof b2) {
        case "function":
        case "symbol":
          return true;
        case "boolean":
          if (d2) return false;
          if (null !== c2) return !c2.acceptsBooleans;
          a2 = a2.toLowerCase().slice(0, 5);
          return "data-" !== a2 && "aria-" !== a2;
        default:
          return false;
      }
    }
    function qa(a2, b2, c2, d2) {
      if (null === b2 || "undefined" === typeof b2 || pa(a2, b2, c2, d2)) return true;
      if (d2) return false;
      if (null !== c2) switch (c2.type) {
        case 3:
          return !b2;
        case 4:
          return false === b2;
        case 5:
          return isNaN(b2);
        case 6:
          return isNaN(b2) || 1 > b2;
      }
      return false;
    }
    function v2(a2, b2, c2, d2, e2, f2, g2) {
      this.acceptsBooleans = 2 === b2 || 3 === b2 || 4 === b2;
      this.attributeName = d2;
      this.attributeNamespace = e2;
      this.mustUseProperty = c2;
      this.propertyName = a2;
      this.type = b2;
      this.sanitizeURL = f2;
      this.removeEmptyString = g2;
    }
    var z2 = {};
    "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a2) {
      z2[a2] = new v2(a2, 0, false, a2, null, false, false);
    });
    [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(a2) {
      var b2 = a2[0];
      z2[b2] = new v2(b2, 1, false, a2[1], null, false, false);
    });
    ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(a2) {
      z2[a2] = new v2(a2, 2, false, a2.toLowerCase(), null, false, false);
    });
    ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(a2) {
      z2[a2] = new v2(a2, 2, false, a2, null, false, false);
    });
    "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a2) {
      z2[a2] = new v2(a2, 3, false, a2.toLowerCase(), null, false, false);
    });
    ["checked", "multiple", "muted", "selected"].forEach(function(a2) {
      z2[a2] = new v2(a2, 3, true, a2, null, false, false);
    });
    ["capture", "download"].forEach(function(a2) {
      z2[a2] = new v2(a2, 4, false, a2, null, false, false);
    });
    ["cols", "rows", "size", "span"].forEach(function(a2) {
      z2[a2] = new v2(a2, 6, false, a2, null, false, false);
    });
    ["rowSpan", "start"].forEach(function(a2) {
      z2[a2] = new v2(a2, 5, false, a2.toLowerCase(), null, false, false);
    });
    var ra = /[\-:]([a-z])/g;
    function sa(a2) {
      return a2[1].toUpperCase();
    }
    "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a2) {
      var b2 = a2.replace(
        ra,
        sa
      );
      z2[b2] = new v2(b2, 1, false, a2, null, false, false);
    });
    "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a2) {
      var b2 = a2.replace(ra, sa);
      z2[b2] = new v2(b2, 1, false, a2, "http://www.w3.org/1999/xlink", false, false);
    });
    ["xml:base", "xml:lang", "xml:space"].forEach(function(a2) {
      var b2 = a2.replace(ra, sa);
      z2[b2] = new v2(b2, 1, false, a2, "http://www.w3.org/XML/1998/namespace", false, false);
    });
    ["tabIndex", "crossOrigin"].forEach(function(a2) {
      z2[a2] = new v2(a2, 1, false, a2.toLowerCase(), null, false, false);
    });
    z2.xlinkHref = new v2("xlinkHref", 1, false, "xlink:href", "http://www.w3.org/1999/xlink", true, false);
    ["src", "href", "action", "formAction"].forEach(function(a2) {
      z2[a2] = new v2(a2, 1, false, a2.toLowerCase(), null, true, true);
    });
    function ta(a2, b2, c2, d2) {
      var e2 = z2.hasOwnProperty(b2) ? z2[b2] : null;
      if (null !== e2 ? 0 !== e2.type : d2 || !(2 < b2.length) || "o" !== b2[0] && "O" !== b2[0] || "n" !== b2[1] && "N" !== b2[1]) qa(b2, c2, e2, d2) && (c2 = null), d2 || null === e2 ? oa(b2) && (null === c2 ? a2.removeAttribute(b2) : a2.setAttribute(b2, "" + c2)) : e2.mustUseProperty ? a2[e2.propertyName] = null === c2 ? 3 === e2.type ? false : "" : c2 : (b2 = e2.attributeName, d2 = e2.attributeNamespace, null === c2 ? a2.removeAttribute(b2) : (e2 = e2.type, c2 = 3 === e2 || 4 === e2 && true === c2 ? "" : "" + c2, d2 ? a2.setAttributeNS(d2, b2, c2) : a2.setAttribute(b2, c2)));
    }
    var ua = aa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    var va = Symbol.for("react.element");
    var wa = Symbol.for("react.portal");
    var ya = Symbol.for("react.fragment");
    var za = Symbol.for("react.strict_mode");
    var Aa = Symbol.for("react.profiler");
    var Ba = Symbol.for("react.provider");
    var Ca = Symbol.for("react.context");
    var Da = Symbol.for("react.forward_ref");
    var Ea = Symbol.for("react.suspense");
    var Fa = Symbol.for("react.suspense_list");
    var Ga = Symbol.for("react.memo");
    var Ha = Symbol.for("react.lazy");
    Symbol.for("react.scope");
    Symbol.for("react.debug_trace_mode");
    var Ia = Symbol.for("react.offscreen");
    Symbol.for("react.legacy_hidden");
    Symbol.for("react.cache");
    Symbol.for("react.tracing_marker");
    var Ja = Symbol.iterator;
    function Ka(a2) {
      if (null === a2 || "object" !== typeof a2) return null;
      a2 = Ja && a2[Ja] || a2["@@iterator"];
      return "function" === typeof a2 ? a2 : null;
    }
    var A2 = Object.assign;
    var La;
    function Ma(a2) {
      if (void 0 === La) try {
        throw Error();
      } catch (c2) {
        var b2 = c2.stack.trim().match(/\n( *(at )?)/);
        La = b2 && b2[1] || "";
      }
      return "\n" + La + a2;
    }
    var Na = false;
    function Oa(a2, b2) {
      if (!a2 || Na) return "";
      Na = true;
      var c2 = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      try {
        if (b2) if (b2 = function() {
          throw Error();
        }, Object.defineProperty(b2.prototype, "props", { set: function() {
          throw Error();
        } }), "object" === typeof Reflect && Reflect.construct) {
          try {
            Reflect.construct(b2, []);
          } catch (l) {
            var d2 = l;
          }
          Reflect.construct(a2, [], b2);
        } else {
          try {
            b2.call();
          } catch (l) {
            d2 = l;
          }
          a2.call(b2.prototype);
        }
        else {
          try {
            throw Error();
          } catch (l) {
            d2 = l;
          }
          a2();
        }
      } catch (l) {
        if (l && d2 && "string" === typeof l.stack) {
          for (var e2 = l.stack.split("\n"), f2 = d2.stack.split("\n"), g2 = e2.length - 1, h2 = f2.length - 1; 1 <= g2 && 0 <= h2 && e2[g2] !== f2[h2]; ) h2--;
          for (; 1 <= g2 && 0 <= h2; g2--, h2--) if (e2[g2] !== f2[h2]) {
            if (1 !== g2 || 1 !== h2) {
              do
                if (g2--, h2--, 0 > h2 || e2[g2] !== f2[h2]) {
                  var k2 = "\n" + e2[g2].replace(" at new ", " at ");
                  a2.displayName && k2.includes("<anonymous>") && (k2 = k2.replace("<anonymous>", a2.displayName));
                  return k2;
                }
              while (1 <= g2 && 0 <= h2);
            }
            break;
          }
        }
      } finally {
        Na = false, Error.prepareStackTrace = c2;
      }
      return (a2 = a2 ? a2.displayName || a2.name : "") ? Ma(a2) : "";
    }
    function Pa(a2) {
      switch (a2.tag) {
        case 5:
          return Ma(a2.type);
        case 16:
          return Ma("Lazy");
        case 13:
          return Ma("Suspense");
        case 19:
          return Ma("SuspenseList");
        case 0:
        case 2:
        case 15:
          return a2 = Oa(a2.type, false), a2;
        case 11:
          return a2 = Oa(a2.type.render, false), a2;
        case 1:
          return a2 = Oa(a2.type, true), a2;
        default:
          return "";
      }
    }
    function Qa(a2) {
      if (null == a2) return null;
      if ("function" === typeof a2) return a2.displayName || a2.name || null;
      if ("string" === typeof a2) return a2;
      switch (a2) {
        case ya:
          return "Fragment";
        case wa:
          return "Portal";
        case Aa:
          return "Profiler";
        case za:
          return "StrictMode";
        case Ea:
          return "Suspense";
        case Fa:
          return "SuspenseList";
      }
      if ("object" === typeof a2) switch (a2.$$typeof) {
        case Ca:
          return (a2.displayName || "Context") + ".Consumer";
        case Ba:
          return (a2._context.displayName || "Context") + ".Provider";
        case Da:
          var b2 = a2.render;
          a2 = a2.displayName;
          a2 || (a2 = b2.displayName || b2.name || "", a2 = "" !== a2 ? "ForwardRef(" + a2 + ")" : "ForwardRef");
          return a2;
        case Ga:
          return b2 = a2.displayName || null, null !== b2 ? b2 : Qa(a2.type) || "Memo";
        case Ha:
          b2 = a2._payload;
          a2 = a2._init;
          try {
            return Qa(a2(b2));
          } catch (c2) {
          }
      }
      return null;
    }
    function Ra(a2) {
      var b2 = a2.type;
      switch (a2.tag) {
        case 24:
          return "Cache";
        case 9:
          return (b2.displayName || "Context") + ".Consumer";
        case 10:
          return (b2._context.displayName || "Context") + ".Provider";
        case 18:
          return "DehydratedFragment";
        case 11:
          return a2 = b2.render, a2 = a2.displayName || a2.name || "", b2.displayName || ("" !== a2 ? "ForwardRef(" + a2 + ")" : "ForwardRef");
        case 7:
          return "Fragment";
        case 5:
          return b2;
        case 4:
          return "Portal";
        case 3:
          return "Root";
        case 6:
          return "Text";
        case 16:
          return Qa(b2);
        case 8:
          return b2 === za ? "StrictMode" : "Mode";
        case 22:
          return "Offscreen";
        case 12:
          return "Profiler";
        case 21:
          return "Scope";
        case 13:
          return "Suspense";
        case 19:
          return "SuspenseList";
        case 25:
          return "TracingMarker";
        case 1:
        case 0:
        case 17:
        case 2:
        case 14:
        case 15:
          if ("function" === typeof b2) return b2.displayName || b2.name || null;
          if ("string" === typeof b2) return b2;
      }
      return null;
    }
    function Sa(a2) {
      switch (typeof a2) {
        case "boolean":
        case "number":
        case "string":
        case "undefined":
          return a2;
        case "object":
          return a2;
        default:
          return "";
      }
    }
    function Ta(a2) {
      var b2 = a2.type;
      return (a2 = a2.nodeName) && "input" === a2.toLowerCase() && ("checkbox" === b2 || "radio" === b2);
    }
    function Ua(a2) {
      var b2 = Ta(a2) ? "checked" : "value", c2 = Object.getOwnPropertyDescriptor(a2.constructor.prototype, b2), d2 = "" + a2[b2];
      if (!a2.hasOwnProperty(b2) && "undefined" !== typeof c2 && "function" === typeof c2.get && "function" === typeof c2.set) {
        var e2 = c2.get, f2 = c2.set;
        Object.defineProperty(a2, b2, { configurable: true, get: function() {
          return e2.call(this);
        }, set: function(a3) {
          d2 = "" + a3;
          f2.call(this, a3);
        } });
        Object.defineProperty(a2, b2, { enumerable: c2.enumerable });
        return { getValue: function() {
          return d2;
        }, setValue: function(a3) {
          d2 = "" + a3;
        }, stopTracking: function() {
          a2._valueTracker = null;
          delete a2[b2];
        } };
      }
    }
    function Va(a2) {
      a2._valueTracker || (a2._valueTracker = Ua(a2));
    }
    function Wa(a2) {
      if (!a2) return false;
      var b2 = a2._valueTracker;
      if (!b2) return true;
      var c2 = b2.getValue();
      var d2 = "";
      a2 && (d2 = Ta(a2) ? a2.checked ? "true" : "false" : a2.value);
      a2 = d2;
      return a2 !== c2 ? (b2.setValue(a2), true) : false;
    }
    function Xa(a2) {
      a2 = a2 || ("undefined" !== typeof document ? document : void 0);
      if ("undefined" === typeof a2) return null;
      try {
        return a2.activeElement || a2.body;
      } catch (b2) {
        return a2.body;
      }
    }
    function Ya(a2, b2) {
      var c2 = b2.checked;
      return A2({}, b2, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: null != c2 ? c2 : a2._wrapperState.initialChecked });
    }
    function Za(a2, b2) {
      var c2 = null == b2.defaultValue ? "" : b2.defaultValue, d2 = null != b2.checked ? b2.checked : b2.defaultChecked;
      c2 = Sa(null != b2.value ? b2.value : c2);
      a2._wrapperState = { initialChecked: d2, initialValue: c2, controlled: "checkbox" === b2.type || "radio" === b2.type ? null != b2.checked : null != b2.value };
    }
    function ab(a2, b2) {
      b2 = b2.checked;
      null != b2 && ta(a2, "checked", b2, false);
    }
    function bb(a2, b2) {
      ab(a2, b2);
      var c2 = Sa(b2.value), d2 = b2.type;
      if (null != c2) if ("number" === d2) {
        if (0 === c2 && "" === a2.value || a2.value != c2) a2.value = "" + c2;
      } else a2.value !== "" + c2 && (a2.value = "" + c2);
      else if ("submit" === d2 || "reset" === d2) {
        a2.removeAttribute("value");
        return;
      }
      b2.hasOwnProperty("value") ? cb(a2, b2.type, c2) : b2.hasOwnProperty("defaultValue") && cb(a2, b2.type, Sa(b2.defaultValue));
      null == b2.checked && null != b2.defaultChecked && (a2.defaultChecked = !!b2.defaultChecked);
    }
    function db(a2, b2, c2) {
      if (b2.hasOwnProperty("value") || b2.hasOwnProperty("defaultValue")) {
        var d2 = b2.type;
        if (!("submit" !== d2 && "reset" !== d2 || void 0 !== b2.value && null !== b2.value)) return;
        b2 = "" + a2._wrapperState.initialValue;
        c2 || b2 === a2.value || (a2.value = b2);
        a2.defaultValue = b2;
      }
      c2 = a2.name;
      "" !== c2 && (a2.name = "");
      a2.defaultChecked = !!a2._wrapperState.initialChecked;
      "" !== c2 && (a2.name = c2);
    }
    function cb(a2, b2, c2) {
      if ("number" !== b2 || Xa(a2.ownerDocument) !== a2) null == c2 ? a2.defaultValue = "" + a2._wrapperState.initialValue : a2.defaultValue !== "" + c2 && (a2.defaultValue = "" + c2);
    }
    var eb = Array.isArray;
    function fb(a2, b2, c2, d2) {
      a2 = a2.options;
      if (b2) {
        b2 = {};
        for (var e2 = 0; e2 < c2.length; e2++) b2["$" + c2[e2]] = true;
        for (c2 = 0; c2 < a2.length; c2++) e2 = b2.hasOwnProperty("$" + a2[c2].value), a2[c2].selected !== e2 && (a2[c2].selected = e2), e2 && d2 && (a2[c2].defaultSelected = true);
      } else {
        c2 = "" + Sa(c2);
        b2 = null;
        for (e2 = 0; e2 < a2.length; e2++) {
          if (a2[e2].value === c2) {
            a2[e2].selected = true;
            d2 && (a2[e2].defaultSelected = true);
            return;
          }
          null !== b2 || a2[e2].disabled || (b2 = a2[e2]);
        }
        null !== b2 && (b2.selected = true);
      }
    }
    function gb(a2, b2) {
      if (null != b2.dangerouslySetInnerHTML) throw Error(p2(91));
      return A2({}, b2, { value: void 0, defaultValue: void 0, children: "" + a2._wrapperState.initialValue });
    }
    function hb(a2, b2) {
      var c2 = b2.value;
      if (null == c2) {
        c2 = b2.children;
        b2 = b2.defaultValue;
        if (null != c2) {
          if (null != b2) throw Error(p2(92));
          if (eb(c2)) {
            if (1 < c2.length) throw Error(p2(93));
            c2 = c2[0];
          }
          b2 = c2;
        }
        null == b2 && (b2 = "");
        c2 = b2;
      }
      a2._wrapperState = { initialValue: Sa(c2) };
    }
    function ib(a2, b2) {
      var c2 = Sa(b2.value), d2 = Sa(b2.defaultValue);
      null != c2 && (c2 = "" + c2, c2 !== a2.value && (a2.value = c2), null == b2.defaultValue && a2.defaultValue !== c2 && (a2.defaultValue = c2));
      null != d2 && (a2.defaultValue = "" + d2);
    }
    function jb(a2) {
      var b2 = a2.textContent;
      b2 === a2._wrapperState.initialValue && "" !== b2 && null !== b2 && (a2.value = b2);
    }
    function kb(a2) {
      switch (a2) {
        case "svg":
          return "http://www.w3.org/2000/svg";
        case "math":
          return "http://www.w3.org/1998/Math/MathML";
        default:
          return "http://www.w3.org/1999/xhtml";
      }
    }
    function lb(a2, b2) {
      return null == a2 || "http://www.w3.org/1999/xhtml" === a2 ? kb(b2) : "http://www.w3.org/2000/svg" === a2 && "foreignObject" === b2 ? "http://www.w3.org/1999/xhtml" : a2;
    }
    var mb;
    var nb = function(a2) {
      return "undefined" !== typeof MSApp && MSApp.execUnsafeLocalFunction ? function(b2, c2, d2, e2) {
        MSApp.execUnsafeLocalFunction(function() {
          return a2(b2, c2, d2, e2);
        });
      } : a2;
    }(function(a2, b2) {
      if ("http://www.w3.org/2000/svg" !== a2.namespaceURI || "innerHTML" in a2) a2.innerHTML = b2;
      else {
        mb = mb || document.createElement("div");
        mb.innerHTML = "<svg>" + b2.valueOf().toString() + "</svg>";
        for (b2 = mb.firstChild; a2.firstChild; ) a2.removeChild(a2.firstChild);
        for (; b2.firstChild; ) a2.appendChild(b2.firstChild);
      }
    });
    function ob(a2, b2) {
      if (b2) {
        var c2 = a2.firstChild;
        if (c2 && c2 === a2.lastChild && 3 === c2.nodeType) {
          c2.nodeValue = b2;
          return;
        }
      }
      a2.textContent = b2;
    }
    var pb = {
      animationIterationCount: true,
      aspectRatio: true,
      borderImageOutset: true,
      borderImageSlice: true,
      borderImageWidth: true,
      boxFlex: true,
      boxFlexGroup: true,
      boxOrdinalGroup: true,
      columnCount: true,
      columns: true,
      flex: true,
      flexGrow: true,
      flexPositive: true,
      flexShrink: true,
      flexNegative: true,
      flexOrder: true,
      gridArea: true,
      gridRow: true,
      gridRowEnd: true,
      gridRowSpan: true,
      gridRowStart: true,
      gridColumn: true,
      gridColumnEnd: true,
      gridColumnSpan: true,
      gridColumnStart: true,
      fontWeight: true,
      lineClamp: true,
      lineHeight: true,
      opacity: true,
      order: true,
      orphans: true,
      tabSize: true,
      widows: true,
      zIndex: true,
      zoom: true,
      fillOpacity: true,
      floodOpacity: true,
      stopOpacity: true,
      strokeDasharray: true,
      strokeDashoffset: true,
      strokeMiterlimit: true,
      strokeOpacity: true,
      strokeWidth: true
    };
    var qb = ["Webkit", "ms", "Moz", "O"];
    Object.keys(pb).forEach(function(a2) {
      qb.forEach(function(b2) {
        b2 = b2 + a2.charAt(0).toUpperCase() + a2.substring(1);
        pb[b2] = pb[a2];
      });
    });
    function rb(a2, b2, c2) {
      return null == b2 || "boolean" === typeof b2 || "" === b2 ? "" : c2 || "number" !== typeof b2 || 0 === b2 || pb.hasOwnProperty(a2) && pb[a2] ? ("" + b2).trim() : b2 + "px";
    }
    function sb(a2, b2) {
      a2 = a2.style;
      for (var c2 in b2) if (b2.hasOwnProperty(c2)) {
        var d2 = 0 === c2.indexOf("--"), e2 = rb(c2, b2[c2], d2);
        "float" === c2 && (c2 = "cssFloat");
        d2 ? a2.setProperty(c2, e2) : a2[c2] = e2;
      }
    }
    var tb = A2({ menuitem: true }, { area: true, base: true, br: true, col: true, embed: true, hr: true, img: true, input: true, keygen: true, link: true, meta: true, param: true, source: true, track: true, wbr: true });
    function ub(a2, b2) {
      if (b2) {
        if (tb[a2] && (null != b2.children || null != b2.dangerouslySetInnerHTML)) throw Error(p2(137, a2));
        if (null != b2.dangerouslySetInnerHTML) {
          if (null != b2.children) throw Error(p2(60));
          if ("object" !== typeof b2.dangerouslySetInnerHTML || !("__html" in b2.dangerouslySetInnerHTML)) throw Error(p2(61));
        }
        if (null != b2.style && "object" !== typeof b2.style) throw Error(p2(62));
      }
    }
    function vb(a2, b2) {
      if (-1 === a2.indexOf("-")) return "string" === typeof b2.is;
      switch (a2) {
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
          return false;
        default:
          return true;
      }
    }
    var wb = null;
    function xb(a2) {
      a2 = a2.target || a2.srcElement || window;
      a2.correspondingUseElement && (a2 = a2.correspondingUseElement);
      return 3 === a2.nodeType ? a2.parentNode : a2;
    }
    var yb = null;
    var zb = null;
    var Ab = null;
    function Bb(a2) {
      if (a2 = Cb(a2)) {
        if ("function" !== typeof yb) throw Error(p2(280));
        var b2 = a2.stateNode;
        b2 && (b2 = Db(b2), yb(a2.stateNode, a2.type, b2));
      }
    }
    function Eb(a2) {
      zb ? Ab ? Ab.push(a2) : Ab = [a2] : zb = a2;
    }
    function Fb() {
      if (zb) {
        var a2 = zb, b2 = Ab;
        Ab = zb = null;
        Bb(a2);
        if (b2) for (a2 = 0; a2 < b2.length; a2++) Bb(b2[a2]);
      }
    }
    function Gb(a2, b2) {
      return a2(b2);
    }
    function Hb() {
    }
    var Ib = false;
    function Jb(a2, b2, c2) {
      if (Ib) return a2(b2, c2);
      Ib = true;
      try {
        return Gb(a2, b2, c2);
      } finally {
        if (Ib = false, null !== zb || null !== Ab) Hb(), Fb();
      }
    }
    function Kb(a2, b2) {
      var c2 = a2.stateNode;
      if (null === c2) return null;
      var d2 = Db(c2);
      if (null === d2) return null;
      c2 = d2[b2];
      a: switch (b2) {
        case "onClick":
        case "onClickCapture":
        case "onDoubleClick":
        case "onDoubleClickCapture":
        case "onMouseDown":
        case "onMouseDownCapture":
        case "onMouseMove":
        case "onMouseMoveCapture":
        case "onMouseUp":
        case "onMouseUpCapture":
        case "onMouseEnter":
          (d2 = !d2.disabled) || (a2 = a2.type, d2 = !("button" === a2 || "input" === a2 || "select" === a2 || "textarea" === a2));
          a2 = !d2;
          break a;
        default:
          a2 = false;
      }
      if (a2) return null;
      if (c2 && "function" !== typeof c2) throw Error(p2(231, b2, typeof c2));
      return c2;
    }
    var Lb = false;
    if (ia) try {
      Mb = {};
      Object.defineProperty(Mb, "passive", { get: function() {
        Lb = true;
      } });
      window.addEventListener("test", Mb, Mb);
      window.removeEventListener("test", Mb, Mb);
    } catch (a2) {
      Lb = false;
    }
    var Mb;
    function Nb(a2, b2, c2, d2, e2, f2, g2, h2, k2) {
      var l = Array.prototype.slice.call(arguments, 3);
      try {
        b2.apply(c2, l);
      } catch (m2) {
        this.onError(m2);
      }
    }
    var Ob = false;
    var Pb = null;
    var Qb = false;
    var Rb = null;
    var Sb = { onError: function(a2) {
      Ob = true;
      Pb = a2;
    } };
    function Tb(a2, b2, c2, d2, e2, f2, g2, h2, k2) {
      Ob = false;
      Pb = null;
      Nb.apply(Sb, arguments);
    }
    function Ub(a2, b2, c2, d2, e2, f2, g2, h2, k2) {
      Tb.apply(this, arguments);
      if (Ob) {
        if (Ob) {
          var l = Pb;
          Ob = false;
          Pb = null;
        } else throw Error(p2(198));
        Qb || (Qb = true, Rb = l);
      }
    }
    function Vb(a2) {
      var b2 = a2, c2 = a2;
      if (a2.alternate) for (; b2.return; ) b2 = b2.return;
      else {
        a2 = b2;
        do
          b2 = a2, 0 !== (b2.flags & 4098) && (c2 = b2.return), a2 = b2.return;
        while (a2);
      }
      return 3 === b2.tag ? c2 : null;
    }
    function Wb(a2) {
      if (13 === a2.tag) {
        var b2 = a2.memoizedState;
        null === b2 && (a2 = a2.alternate, null !== a2 && (b2 = a2.memoizedState));
        if (null !== b2) return b2.dehydrated;
      }
      return null;
    }
    function Xb(a2) {
      if (Vb(a2) !== a2) throw Error(p2(188));
    }
    function Yb(a2) {
      var b2 = a2.alternate;
      if (!b2) {
        b2 = Vb(a2);
        if (null === b2) throw Error(p2(188));
        return b2 !== a2 ? null : a2;
      }
      for (var c2 = a2, d2 = b2; ; ) {
        var e2 = c2.return;
        if (null === e2) break;
        var f2 = e2.alternate;
        if (null === f2) {
          d2 = e2.return;
          if (null !== d2) {
            c2 = d2;
            continue;
          }
          break;
        }
        if (e2.child === f2.child) {
          for (f2 = e2.child; f2; ) {
            if (f2 === c2) return Xb(e2), a2;
            if (f2 === d2) return Xb(e2), b2;
            f2 = f2.sibling;
          }
          throw Error(p2(188));
        }
        if (c2.return !== d2.return) c2 = e2, d2 = f2;
        else {
          for (var g2 = false, h2 = e2.child; h2; ) {
            if (h2 === c2) {
              g2 = true;
              c2 = e2;
              d2 = f2;
              break;
            }
            if (h2 === d2) {
              g2 = true;
              d2 = e2;
              c2 = f2;
              break;
            }
            h2 = h2.sibling;
          }
          if (!g2) {
            for (h2 = f2.child; h2; ) {
              if (h2 === c2) {
                g2 = true;
                c2 = f2;
                d2 = e2;
                break;
              }
              if (h2 === d2) {
                g2 = true;
                d2 = f2;
                c2 = e2;
                break;
              }
              h2 = h2.sibling;
            }
            if (!g2) throw Error(p2(189));
          }
        }
        if (c2.alternate !== d2) throw Error(p2(190));
      }
      if (3 !== c2.tag) throw Error(p2(188));
      return c2.stateNode.current === c2 ? a2 : b2;
    }
    function Zb(a2) {
      a2 = Yb(a2);
      return null !== a2 ? $b(a2) : null;
    }
    function $b(a2) {
      if (5 === a2.tag || 6 === a2.tag) return a2;
      for (a2 = a2.child; null !== a2; ) {
        var b2 = $b(a2);
        if (null !== b2) return b2;
        a2 = a2.sibling;
      }
      return null;
    }
    var ac = ca.unstable_scheduleCallback;
    var bc = ca.unstable_cancelCallback;
    var cc = ca.unstable_shouldYield;
    var dc = ca.unstable_requestPaint;
    var B2 = ca.unstable_now;
    var ec = ca.unstable_getCurrentPriorityLevel;
    var fc = ca.unstable_ImmediatePriority;
    var gc = ca.unstable_UserBlockingPriority;
    var hc = ca.unstable_NormalPriority;
    var ic = ca.unstable_LowPriority;
    var jc = ca.unstable_IdlePriority;
    var kc = null;
    var lc = null;
    function mc(a2) {
      if (lc && "function" === typeof lc.onCommitFiberRoot) try {
        lc.onCommitFiberRoot(kc, a2, void 0, 128 === (a2.current.flags & 128));
      } catch (b2) {
      }
    }
    var oc = Math.clz32 ? Math.clz32 : nc;
    var pc = Math.log;
    var qc = Math.LN2;
    function nc(a2) {
      a2 >>>= 0;
      return 0 === a2 ? 32 : 31 - (pc(a2) / qc | 0) | 0;
    }
    var rc = 64;
    var sc = 4194304;
    function tc(a2) {
      switch (a2 & -a2) {
        case 1:
          return 1;
        case 2:
          return 2;
        case 4:
          return 4;
        case 8:
          return 8;
        case 16:
          return 16;
        case 32:
          return 32;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return a2 & 4194240;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          return a2 & 130023424;
        case 134217728:
          return 134217728;
        case 268435456:
          return 268435456;
        case 536870912:
          return 536870912;
        case 1073741824:
          return 1073741824;
        default:
          return a2;
      }
    }
    function uc(a2, b2) {
      var c2 = a2.pendingLanes;
      if (0 === c2) return 0;
      var d2 = 0, e2 = a2.suspendedLanes, f2 = a2.pingedLanes, g2 = c2 & 268435455;
      if (0 !== g2) {
        var h2 = g2 & ~e2;
        0 !== h2 ? d2 = tc(h2) : (f2 &= g2, 0 !== f2 && (d2 = tc(f2)));
      } else g2 = c2 & ~e2, 0 !== g2 ? d2 = tc(g2) : 0 !== f2 && (d2 = tc(f2));
      if (0 === d2) return 0;
      if (0 !== b2 && b2 !== d2 && 0 === (b2 & e2) && (e2 = d2 & -d2, f2 = b2 & -b2, e2 >= f2 || 16 === e2 && 0 !== (f2 & 4194240))) return b2;
      0 !== (d2 & 4) && (d2 |= c2 & 16);
      b2 = a2.entangledLanes;
      if (0 !== b2) for (a2 = a2.entanglements, b2 &= d2; 0 < b2; ) c2 = 31 - oc(b2), e2 = 1 << c2, d2 |= a2[c2], b2 &= ~e2;
      return d2;
    }
    function vc(a2, b2) {
      switch (a2) {
        case 1:
        case 2:
        case 4:
          return b2 + 250;
        case 8:
        case 16:
        case 32:
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return b2 + 5e3;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          return -1;
        case 134217728:
        case 268435456:
        case 536870912:
        case 1073741824:
          return -1;
        default:
          return -1;
      }
    }
    function wc(a2, b2) {
      for (var c2 = a2.suspendedLanes, d2 = a2.pingedLanes, e2 = a2.expirationTimes, f2 = a2.pendingLanes; 0 < f2; ) {
        var g2 = 31 - oc(f2), h2 = 1 << g2, k2 = e2[g2];
        if (-1 === k2) {
          if (0 === (h2 & c2) || 0 !== (h2 & d2)) e2[g2] = vc(h2, b2);
        } else k2 <= b2 && (a2.expiredLanes |= h2);
        f2 &= ~h2;
      }
    }
    function xc(a2) {
      a2 = a2.pendingLanes & -1073741825;
      return 0 !== a2 ? a2 : a2 & 1073741824 ? 1073741824 : 0;
    }
    function yc() {
      var a2 = rc;
      rc <<= 1;
      0 === (rc & 4194240) && (rc = 64);
      return a2;
    }
    function zc(a2) {
      for (var b2 = [], c2 = 0; 31 > c2; c2++) b2.push(a2);
      return b2;
    }
    function Ac(a2, b2, c2) {
      a2.pendingLanes |= b2;
      536870912 !== b2 && (a2.suspendedLanes = 0, a2.pingedLanes = 0);
      a2 = a2.eventTimes;
      b2 = 31 - oc(b2);
      a2[b2] = c2;
    }
    function Bc(a2, b2) {
      var c2 = a2.pendingLanes & ~b2;
      a2.pendingLanes = b2;
      a2.suspendedLanes = 0;
      a2.pingedLanes = 0;
      a2.expiredLanes &= b2;
      a2.mutableReadLanes &= b2;
      a2.entangledLanes &= b2;
      b2 = a2.entanglements;
      var d2 = a2.eventTimes;
      for (a2 = a2.expirationTimes; 0 < c2; ) {
        var e2 = 31 - oc(c2), f2 = 1 << e2;
        b2[e2] = 0;
        d2[e2] = -1;
        a2[e2] = -1;
        c2 &= ~f2;
      }
    }
    function Cc(a2, b2) {
      var c2 = a2.entangledLanes |= b2;
      for (a2 = a2.entanglements; c2; ) {
        var d2 = 31 - oc(c2), e2 = 1 << d2;
        e2 & b2 | a2[d2] & b2 && (a2[d2] |= b2);
        c2 &= ~e2;
      }
    }
    var C2 = 0;
    function Dc(a2) {
      a2 &= -a2;
      return 1 < a2 ? 4 < a2 ? 0 !== (a2 & 268435455) ? 16 : 536870912 : 4 : 1;
    }
    var Ec;
    var Fc;
    var Gc;
    var Hc;
    var Ic;
    var Jc = false;
    var Kc = [];
    var Lc = null;
    var Mc = null;
    var Nc = null;
    var Oc = /* @__PURE__ */ new Map();
    var Pc = /* @__PURE__ */ new Map();
    var Qc = [];
    var Rc = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
    function Sc(a2, b2) {
      switch (a2) {
        case "focusin":
        case "focusout":
          Lc = null;
          break;
        case "dragenter":
        case "dragleave":
          Mc = null;
          break;
        case "mouseover":
        case "mouseout":
          Nc = null;
          break;
        case "pointerover":
        case "pointerout":
          Oc.delete(b2.pointerId);
          break;
        case "gotpointercapture":
        case "lostpointercapture":
          Pc.delete(b2.pointerId);
      }
    }
    function Tc(a2, b2, c2, d2, e2, f2) {
      if (null === a2 || a2.nativeEvent !== f2) return a2 = { blockedOn: b2, domEventName: c2, eventSystemFlags: d2, nativeEvent: f2, targetContainers: [e2] }, null !== b2 && (b2 = Cb(b2), null !== b2 && Fc(b2)), a2;
      a2.eventSystemFlags |= d2;
      b2 = a2.targetContainers;
      null !== e2 && -1 === b2.indexOf(e2) && b2.push(e2);
      return a2;
    }
    function Uc(a2, b2, c2, d2, e2) {
      switch (b2) {
        case "focusin":
          return Lc = Tc(Lc, a2, b2, c2, d2, e2), true;
        case "dragenter":
          return Mc = Tc(Mc, a2, b2, c2, d2, e2), true;
        case "mouseover":
          return Nc = Tc(Nc, a2, b2, c2, d2, e2), true;
        case "pointerover":
          var f2 = e2.pointerId;
          Oc.set(f2, Tc(Oc.get(f2) || null, a2, b2, c2, d2, e2));
          return true;
        case "gotpointercapture":
          return f2 = e2.pointerId, Pc.set(f2, Tc(Pc.get(f2) || null, a2, b2, c2, d2, e2)), true;
      }
      return false;
    }
    function Vc(a2) {
      var b2 = Wc(a2.target);
      if (null !== b2) {
        var c2 = Vb(b2);
        if (null !== c2) {
          if (b2 = c2.tag, 13 === b2) {
            if (b2 = Wb(c2), null !== b2) {
              a2.blockedOn = b2;
              Ic(a2.priority, function() {
                Gc(c2);
              });
              return;
            }
          } else if (3 === b2 && c2.stateNode.current.memoizedState.isDehydrated) {
            a2.blockedOn = 3 === c2.tag ? c2.stateNode.containerInfo : null;
            return;
          }
        }
      }
      a2.blockedOn = null;
    }
    function Xc(a2) {
      if (null !== a2.blockedOn) return false;
      for (var b2 = a2.targetContainers; 0 < b2.length; ) {
        var c2 = Yc(a2.domEventName, a2.eventSystemFlags, b2[0], a2.nativeEvent);
        if (null === c2) {
          c2 = a2.nativeEvent;
          var d2 = new c2.constructor(c2.type, c2);
          wb = d2;
          c2.target.dispatchEvent(d2);
          wb = null;
        } else return b2 = Cb(c2), null !== b2 && Fc(b2), a2.blockedOn = c2, false;
        b2.shift();
      }
      return true;
    }
    function Zc(a2, b2, c2) {
      Xc(a2) && c2.delete(b2);
    }
    function $c() {
      Jc = false;
      null !== Lc && Xc(Lc) && (Lc = null);
      null !== Mc && Xc(Mc) && (Mc = null);
      null !== Nc && Xc(Nc) && (Nc = null);
      Oc.forEach(Zc);
      Pc.forEach(Zc);
    }
    function ad(a2, b2) {
      a2.blockedOn === b2 && (a2.blockedOn = null, Jc || (Jc = true, ca.unstable_scheduleCallback(ca.unstable_NormalPriority, $c)));
    }
    function bd(a2) {
      function b2(b3) {
        return ad(b3, a2);
      }
      if (0 < Kc.length) {
        ad(Kc[0], a2);
        for (var c2 = 1; c2 < Kc.length; c2++) {
          var d2 = Kc[c2];
          d2.blockedOn === a2 && (d2.blockedOn = null);
        }
      }
      null !== Lc && ad(Lc, a2);
      null !== Mc && ad(Mc, a2);
      null !== Nc && ad(Nc, a2);
      Oc.forEach(b2);
      Pc.forEach(b2);
      for (c2 = 0; c2 < Qc.length; c2++) d2 = Qc[c2], d2.blockedOn === a2 && (d2.blockedOn = null);
      for (; 0 < Qc.length && (c2 = Qc[0], null === c2.blockedOn); ) Vc(c2), null === c2.blockedOn && Qc.shift();
    }
    var cd = ua.ReactCurrentBatchConfig;
    var dd = true;
    function ed(a2, b2, c2, d2) {
      var e2 = C2, f2 = cd.transition;
      cd.transition = null;
      try {
        C2 = 1, fd(a2, b2, c2, d2);
      } finally {
        C2 = e2, cd.transition = f2;
      }
    }
    function gd(a2, b2, c2, d2) {
      var e2 = C2, f2 = cd.transition;
      cd.transition = null;
      try {
        C2 = 4, fd(a2, b2, c2, d2);
      } finally {
        C2 = e2, cd.transition = f2;
      }
    }
    function fd(a2, b2, c2, d2) {
      if (dd) {
        var e2 = Yc(a2, b2, c2, d2);
        if (null === e2) hd(a2, b2, d2, id, c2), Sc(a2, d2);
        else if (Uc(e2, a2, b2, c2, d2)) d2.stopPropagation();
        else if (Sc(a2, d2), b2 & 4 && -1 < Rc.indexOf(a2)) {
          for (; null !== e2; ) {
            var f2 = Cb(e2);
            null !== f2 && Ec(f2);
            f2 = Yc(a2, b2, c2, d2);
            null === f2 && hd(a2, b2, d2, id, c2);
            if (f2 === e2) break;
            e2 = f2;
          }
          null !== e2 && d2.stopPropagation();
        } else hd(a2, b2, d2, null, c2);
      }
    }
    var id = null;
    function Yc(a2, b2, c2, d2) {
      id = null;
      a2 = xb(d2);
      a2 = Wc(a2);
      if (null !== a2) if (b2 = Vb(a2), null === b2) a2 = null;
      else if (c2 = b2.tag, 13 === c2) {
        a2 = Wb(b2);
        if (null !== a2) return a2;
        a2 = null;
      } else if (3 === c2) {
        if (b2.stateNode.current.memoizedState.isDehydrated) return 3 === b2.tag ? b2.stateNode.containerInfo : null;
        a2 = null;
      } else b2 !== a2 && (a2 = null);
      id = a2;
      return null;
    }
    function jd(a2) {
      switch (a2) {
        case "cancel":
        case "click":
        case "close":
        case "contextmenu":
        case "copy":
        case "cut":
        case "auxclick":
        case "dblclick":
        case "dragend":
        case "dragstart":
        case "drop":
        case "focusin":
        case "focusout":
        case "input":
        case "invalid":
        case "keydown":
        case "keypress":
        case "keyup":
        case "mousedown":
        case "mouseup":
        case "paste":
        case "pause":
        case "play":
        case "pointercancel":
        case "pointerdown":
        case "pointerup":
        case "ratechange":
        case "reset":
        case "resize":
        case "seeked":
        case "submit":
        case "touchcancel":
        case "touchend":
        case "touchstart":
        case "volumechange":
        case "change":
        case "selectionchange":
        case "textInput":
        case "compositionstart":
        case "compositionend":
        case "compositionupdate":
        case "beforeblur":
        case "afterblur":
        case "beforeinput":
        case "blur":
        case "fullscreenchange":
        case "focus":
        case "hashchange":
        case "popstate":
        case "select":
        case "selectstart":
          return 1;
        case "drag":
        case "dragenter":
        case "dragexit":
        case "dragleave":
        case "dragover":
        case "mousemove":
        case "mouseout":
        case "mouseover":
        case "pointermove":
        case "pointerout":
        case "pointerover":
        case "scroll":
        case "toggle":
        case "touchmove":
        case "wheel":
        case "mouseenter":
        case "mouseleave":
        case "pointerenter":
        case "pointerleave":
          return 4;
        case "message":
          switch (ec()) {
            case fc:
              return 1;
            case gc:
              return 4;
            case hc:
            case ic:
              return 16;
            case jc:
              return 536870912;
            default:
              return 16;
          }
        default:
          return 16;
      }
    }
    var kd = null;
    var ld = null;
    var md = null;
    function nd() {
      if (md) return md;
      var a2, b2 = ld, c2 = b2.length, d2, e2 = "value" in kd ? kd.value : kd.textContent, f2 = e2.length;
      for (a2 = 0; a2 < c2 && b2[a2] === e2[a2]; a2++) ;
      var g2 = c2 - a2;
      for (d2 = 1; d2 <= g2 && b2[c2 - d2] === e2[f2 - d2]; d2++) ;
      return md = e2.slice(a2, 1 < d2 ? 1 - d2 : void 0);
    }
    function od(a2) {
      var b2 = a2.keyCode;
      "charCode" in a2 ? (a2 = a2.charCode, 0 === a2 && 13 === b2 && (a2 = 13)) : a2 = b2;
      10 === a2 && (a2 = 13);
      return 32 <= a2 || 13 === a2 ? a2 : 0;
    }
    function pd() {
      return true;
    }
    function qd() {
      return false;
    }
    function rd(a2) {
      function b2(b3, d2, e2, f2, g2) {
        this._reactName = b3;
        this._targetInst = e2;
        this.type = d2;
        this.nativeEvent = f2;
        this.target = g2;
        this.currentTarget = null;
        for (var c2 in a2) a2.hasOwnProperty(c2) && (b3 = a2[c2], this[c2] = b3 ? b3(f2) : f2[c2]);
        this.isDefaultPrevented = (null != f2.defaultPrevented ? f2.defaultPrevented : false === f2.returnValue) ? pd : qd;
        this.isPropagationStopped = qd;
        return this;
      }
      A2(b2.prototype, { preventDefault: function() {
        this.defaultPrevented = true;
        var a3 = this.nativeEvent;
        a3 && (a3.preventDefault ? a3.preventDefault() : "unknown" !== typeof a3.returnValue && (a3.returnValue = false), this.isDefaultPrevented = pd);
      }, stopPropagation: function() {
        var a3 = this.nativeEvent;
        a3 && (a3.stopPropagation ? a3.stopPropagation() : "unknown" !== typeof a3.cancelBubble && (a3.cancelBubble = true), this.isPropagationStopped = pd);
      }, persist: function() {
      }, isPersistent: pd });
      return b2;
    }
    var sd = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(a2) {
      return a2.timeStamp || Date.now();
    }, defaultPrevented: 0, isTrusted: 0 };
    var td = rd(sd);
    var ud = A2({}, sd, { view: 0, detail: 0 });
    var vd = rd(ud);
    var wd;
    var xd;
    var yd;
    var Ad = A2({}, ud, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: zd, button: 0, buttons: 0, relatedTarget: function(a2) {
      return void 0 === a2.relatedTarget ? a2.fromElement === a2.srcElement ? a2.toElement : a2.fromElement : a2.relatedTarget;
    }, movementX: function(a2) {
      if ("movementX" in a2) return a2.movementX;
      a2 !== yd && (yd && "mousemove" === a2.type ? (wd = a2.screenX - yd.screenX, xd = a2.screenY - yd.screenY) : xd = wd = 0, yd = a2);
      return wd;
    }, movementY: function(a2) {
      return "movementY" in a2 ? a2.movementY : xd;
    } });
    var Bd = rd(Ad);
    var Cd = A2({}, Ad, { dataTransfer: 0 });
    var Dd = rd(Cd);
    var Ed = A2({}, ud, { relatedTarget: 0 });
    var Fd = rd(Ed);
    var Gd = A2({}, sd, { animationName: 0, elapsedTime: 0, pseudoElement: 0 });
    var Hd = rd(Gd);
    var Id = A2({}, sd, { clipboardData: function(a2) {
      return "clipboardData" in a2 ? a2.clipboardData : window.clipboardData;
    } });
    var Jd = rd(Id);
    var Kd = A2({}, sd, { data: 0 });
    var Ld = rd(Kd);
    var Md = {
      Esc: "Escape",
      Spacebar: " ",
      Left: "ArrowLeft",
      Up: "ArrowUp",
      Right: "ArrowRight",
      Down: "ArrowDown",
      Del: "Delete",
      Win: "OS",
      Menu: "ContextMenu",
      Apps: "ContextMenu",
      Scroll: "ScrollLock",
      MozPrintableKey: "Unidentified"
    };
    var Nd = {
      8: "Backspace",
      9: "Tab",
      12: "Clear",
      13: "Enter",
      16: "Shift",
      17: "Control",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Escape",
      32: " ",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "ArrowLeft",
      38: "ArrowUp",
      39: "ArrowRight",
      40: "ArrowDown",
      45: "Insert",
      46: "Delete",
      112: "F1",
      113: "F2",
      114: "F3",
      115: "F4",
      116: "F5",
      117: "F6",
      118: "F7",
      119: "F8",
      120: "F9",
      121: "F10",
      122: "F11",
      123: "F12",
      144: "NumLock",
      145: "ScrollLock",
      224: "Meta"
    };
    var Od = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
    function Pd(a2) {
      var b2 = this.nativeEvent;
      return b2.getModifierState ? b2.getModifierState(a2) : (a2 = Od[a2]) ? !!b2[a2] : false;
    }
    function zd() {
      return Pd;
    }
    var Qd = A2({}, ud, { key: function(a2) {
      if (a2.key) {
        var b2 = Md[a2.key] || a2.key;
        if ("Unidentified" !== b2) return b2;
      }
      return "keypress" === a2.type ? (a2 = od(a2), 13 === a2 ? "Enter" : String.fromCharCode(a2)) : "keydown" === a2.type || "keyup" === a2.type ? Nd[a2.keyCode] || "Unidentified" : "";
    }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: zd, charCode: function(a2) {
      return "keypress" === a2.type ? od(a2) : 0;
    }, keyCode: function(a2) {
      return "keydown" === a2.type || "keyup" === a2.type ? a2.keyCode : 0;
    }, which: function(a2) {
      return "keypress" === a2.type ? od(a2) : "keydown" === a2.type || "keyup" === a2.type ? a2.keyCode : 0;
    } });
    var Rd = rd(Qd);
    var Sd = A2({}, Ad, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 });
    var Td = rd(Sd);
    var Ud = A2({}, ud, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: zd });
    var Vd = rd(Ud);
    var Wd = A2({}, sd, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 });
    var Xd = rd(Wd);
    var Yd = A2({}, Ad, {
      deltaX: function(a2) {
        return "deltaX" in a2 ? a2.deltaX : "wheelDeltaX" in a2 ? -a2.wheelDeltaX : 0;
      },
      deltaY: function(a2) {
        return "deltaY" in a2 ? a2.deltaY : "wheelDeltaY" in a2 ? -a2.wheelDeltaY : "wheelDelta" in a2 ? -a2.wheelDelta : 0;
      },
      deltaZ: 0,
      deltaMode: 0
    });
    var Zd = rd(Yd);
    var $d = [9, 13, 27, 32];
    var ae = ia && "CompositionEvent" in window;
    var be = null;
    ia && "documentMode" in document && (be = document.documentMode);
    var ce = ia && "TextEvent" in window && !be;
    var de = ia && (!ae || be && 8 < be && 11 >= be);
    var ee = String.fromCharCode(32);
    var fe = false;
    function ge(a2, b2) {
      switch (a2) {
        case "keyup":
          return -1 !== $d.indexOf(b2.keyCode);
        case "keydown":
          return 229 !== b2.keyCode;
        case "keypress":
        case "mousedown":
        case "focusout":
          return true;
        default:
          return false;
      }
    }
    function he(a2) {
      a2 = a2.detail;
      return "object" === typeof a2 && "data" in a2 ? a2.data : null;
    }
    var ie = false;
    function je(a2, b2) {
      switch (a2) {
        case "compositionend":
          return he(b2);
        case "keypress":
          if (32 !== b2.which) return null;
          fe = true;
          return ee;
        case "textInput":
          return a2 = b2.data, a2 === ee && fe ? null : a2;
        default:
          return null;
      }
    }
    function ke(a2, b2) {
      if (ie) return "compositionend" === a2 || !ae && ge(a2, b2) ? (a2 = nd(), md = ld = kd = null, ie = false, a2) : null;
      switch (a2) {
        case "paste":
          return null;
        case "keypress":
          if (!(b2.ctrlKey || b2.altKey || b2.metaKey) || b2.ctrlKey && b2.altKey) {
            if (b2.char && 1 < b2.char.length) return b2.char;
            if (b2.which) return String.fromCharCode(b2.which);
          }
          return null;
        case "compositionend":
          return de && "ko" !== b2.locale ? null : b2.data;
        default:
          return null;
      }
    }
    var le = { color: true, date: true, datetime: true, "datetime-local": true, email: true, month: true, number: true, password: true, range: true, search: true, tel: true, text: true, time: true, url: true, week: true };
    function me(a2) {
      var b2 = a2 && a2.nodeName && a2.nodeName.toLowerCase();
      return "input" === b2 ? !!le[a2.type] : "textarea" === b2 ? true : false;
    }
    function ne(a2, b2, c2, d2) {
      Eb(d2);
      b2 = oe(b2, "onChange");
      0 < b2.length && (c2 = new td("onChange", "change", null, c2, d2), a2.push({ event: c2, listeners: b2 }));
    }
    var pe = null;
    var qe = null;
    function re(a2) {
      se(a2, 0);
    }
    function te(a2) {
      var b2 = ue(a2);
      if (Wa(b2)) return a2;
    }
    function ve(a2, b2) {
      if ("change" === a2) return b2;
    }
    var we = false;
    if (ia) {
      if (ia) {
        ye = "oninput" in document;
        if (!ye) {
          ze = document.createElement("div");
          ze.setAttribute("oninput", "return;");
          ye = "function" === typeof ze.oninput;
        }
        xe = ye;
      } else xe = false;
      we = xe && (!document.documentMode || 9 < document.documentMode);
    }
    var xe;
    var ye;
    var ze;
    function Ae() {
      pe && (pe.detachEvent("onpropertychange", Be), qe = pe = null);
    }
    function Be(a2) {
      if ("value" === a2.propertyName && te(qe)) {
        var b2 = [];
        ne(b2, qe, a2, xb(a2));
        Jb(re, b2);
      }
    }
    function Ce(a2, b2, c2) {
      "focusin" === a2 ? (Ae(), pe = b2, qe = c2, pe.attachEvent("onpropertychange", Be)) : "focusout" === a2 && Ae();
    }
    function De(a2) {
      if ("selectionchange" === a2 || "keyup" === a2 || "keydown" === a2) return te(qe);
    }
    function Ee(a2, b2) {
      if ("click" === a2) return te(b2);
    }
    function Fe(a2, b2) {
      if ("input" === a2 || "change" === a2) return te(b2);
    }
    function Ge(a2, b2) {
      return a2 === b2 && (0 !== a2 || 1 / a2 === 1 / b2) || a2 !== a2 && b2 !== b2;
    }
    var He = "function" === typeof Object.is ? Object.is : Ge;
    function Ie(a2, b2) {
      if (He(a2, b2)) return true;
      if ("object" !== typeof a2 || null === a2 || "object" !== typeof b2 || null === b2) return false;
      var c2 = Object.keys(a2), d2 = Object.keys(b2);
      if (c2.length !== d2.length) return false;
      for (d2 = 0; d2 < c2.length; d2++) {
        var e2 = c2[d2];
        if (!ja.call(b2, e2) || !He(a2[e2], b2[e2])) return false;
      }
      return true;
    }
    function Je(a2) {
      for (; a2 && a2.firstChild; ) a2 = a2.firstChild;
      return a2;
    }
    function Ke(a2, b2) {
      var c2 = Je(a2);
      a2 = 0;
      for (var d2; c2; ) {
        if (3 === c2.nodeType) {
          d2 = a2 + c2.textContent.length;
          if (a2 <= b2 && d2 >= b2) return { node: c2, offset: b2 - a2 };
          a2 = d2;
        }
        a: {
          for (; c2; ) {
            if (c2.nextSibling) {
              c2 = c2.nextSibling;
              break a;
            }
            c2 = c2.parentNode;
          }
          c2 = void 0;
        }
        c2 = Je(c2);
      }
    }
    function Le(a2, b2) {
      return a2 && b2 ? a2 === b2 ? true : a2 && 3 === a2.nodeType ? false : b2 && 3 === b2.nodeType ? Le(a2, b2.parentNode) : "contains" in a2 ? a2.contains(b2) : a2.compareDocumentPosition ? !!(a2.compareDocumentPosition(b2) & 16) : false : false;
    }
    function Me() {
      for (var a2 = window, b2 = Xa(); b2 instanceof a2.HTMLIFrameElement; ) {
        try {
          var c2 = "string" === typeof b2.contentWindow.location.href;
        } catch (d2) {
          c2 = false;
        }
        if (c2) a2 = b2.contentWindow;
        else break;
        b2 = Xa(a2.document);
      }
      return b2;
    }
    function Ne(a2) {
      var b2 = a2 && a2.nodeName && a2.nodeName.toLowerCase();
      return b2 && ("input" === b2 && ("text" === a2.type || "search" === a2.type || "tel" === a2.type || "url" === a2.type || "password" === a2.type) || "textarea" === b2 || "true" === a2.contentEditable);
    }
    function Oe(a2) {
      var b2 = Me(), c2 = a2.focusedElem, d2 = a2.selectionRange;
      if (b2 !== c2 && c2 && c2.ownerDocument && Le(c2.ownerDocument.documentElement, c2)) {
        if (null !== d2 && Ne(c2)) {
          if (b2 = d2.start, a2 = d2.end, void 0 === a2 && (a2 = b2), "selectionStart" in c2) c2.selectionStart = b2, c2.selectionEnd = Math.min(a2, c2.value.length);
          else if (a2 = (b2 = c2.ownerDocument || document) && b2.defaultView || window, a2.getSelection) {
            a2 = a2.getSelection();
            var e2 = c2.textContent.length, f2 = Math.min(d2.start, e2);
            d2 = void 0 === d2.end ? f2 : Math.min(d2.end, e2);
            !a2.extend && f2 > d2 && (e2 = d2, d2 = f2, f2 = e2);
            e2 = Ke(c2, f2);
            var g2 = Ke(
              c2,
              d2
            );
            e2 && g2 && (1 !== a2.rangeCount || a2.anchorNode !== e2.node || a2.anchorOffset !== e2.offset || a2.focusNode !== g2.node || a2.focusOffset !== g2.offset) && (b2 = b2.createRange(), b2.setStart(e2.node, e2.offset), a2.removeAllRanges(), f2 > d2 ? (a2.addRange(b2), a2.extend(g2.node, g2.offset)) : (b2.setEnd(g2.node, g2.offset), a2.addRange(b2)));
          }
        }
        b2 = [];
        for (a2 = c2; a2 = a2.parentNode; ) 1 === a2.nodeType && b2.push({ element: a2, left: a2.scrollLeft, top: a2.scrollTop });
        "function" === typeof c2.focus && c2.focus();
        for (c2 = 0; c2 < b2.length; c2++) a2 = b2[c2], a2.element.scrollLeft = a2.left, a2.element.scrollTop = a2.top;
      }
    }
    var Pe = ia && "documentMode" in document && 11 >= document.documentMode;
    var Qe = null;
    var Re = null;
    var Se = null;
    var Te = false;
    function Ue(a2, b2, c2) {
      var d2 = c2.window === c2 ? c2.document : 9 === c2.nodeType ? c2 : c2.ownerDocument;
      Te || null == Qe || Qe !== Xa(d2) || (d2 = Qe, "selectionStart" in d2 && Ne(d2) ? d2 = { start: d2.selectionStart, end: d2.selectionEnd } : (d2 = (d2.ownerDocument && d2.ownerDocument.defaultView || window).getSelection(), d2 = { anchorNode: d2.anchorNode, anchorOffset: d2.anchorOffset, focusNode: d2.focusNode, focusOffset: d2.focusOffset }), Se && Ie(Se, d2) || (Se = d2, d2 = oe(Re, "onSelect"), 0 < d2.length && (b2 = new td("onSelect", "select", null, b2, c2), a2.push({ event: b2, listeners: d2 }), b2.target = Qe)));
    }
    function Ve(a2, b2) {
      var c2 = {};
      c2[a2.toLowerCase()] = b2.toLowerCase();
      c2["Webkit" + a2] = "webkit" + b2;
      c2["Moz" + a2] = "moz" + b2;
      return c2;
    }
    var We = { animationend: Ve("Animation", "AnimationEnd"), animationiteration: Ve("Animation", "AnimationIteration"), animationstart: Ve("Animation", "AnimationStart"), transitionend: Ve("Transition", "TransitionEnd") };
    var Xe = {};
    var Ye = {};
    ia && (Ye = document.createElement("div").style, "AnimationEvent" in window || (delete We.animationend.animation, delete We.animationiteration.animation, delete We.animationstart.animation), "TransitionEvent" in window || delete We.transitionend.transition);
    function Ze(a2) {
      if (Xe[a2]) return Xe[a2];
      if (!We[a2]) return a2;
      var b2 = We[a2], c2;
      for (c2 in b2) if (b2.hasOwnProperty(c2) && c2 in Ye) return Xe[a2] = b2[c2];
      return a2;
    }
    var $e = Ze("animationend");
    var af = Ze("animationiteration");
    var bf = Ze("animationstart");
    var cf = Ze("transitionend");
    var df = /* @__PURE__ */ new Map();
    var ef = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
    function ff(a2, b2) {
      df.set(a2, b2);
      fa(b2, [a2]);
    }
    for (gf = 0; gf < ef.length; gf++) {
      hf = ef[gf], jf = hf.toLowerCase(), kf = hf[0].toUpperCase() + hf.slice(1);
      ff(jf, "on" + kf);
    }
    var hf;
    var jf;
    var kf;
    var gf;
    ff($e, "onAnimationEnd");
    ff(af, "onAnimationIteration");
    ff(bf, "onAnimationStart");
    ff("dblclick", "onDoubleClick");
    ff("focusin", "onFocus");
    ff("focusout", "onBlur");
    ff(cf, "onTransitionEnd");
    ha("onMouseEnter", ["mouseout", "mouseover"]);
    ha("onMouseLeave", ["mouseout", "mouseover"]);
    ha("onPointerEnter", ["pointerout", "pointerover"]);
    ha("onPointerLeave", ["pointerout", "pointerover"]);
    fa("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
    fa("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
    fa("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
    fa("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
    fa("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
    fa("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
    var lf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" ");
    var mf = new Set("cancel close invalid load scroll toggle".split(" ").concat(lf));
    function nf(a2, b2, c2) {
      var d2 = a2.type || "unknown-event";
      a2.currentTarget = c2;
      Ub(d2, b2, void 0, a2);
      a2.currentTarget = null;
    }
    function se(a2, b2) {
      b2 = 0 !== (b2 & 4);
      for (var c2 = 0; c2 < a2.length; c2++) {
        var d2 = a2[c2], e2 = d2.event;
        d2 = d2.listeners;
        a: {
          var f2 = void 0;
          if (b2) for (var g2 = d2.length - 1; 0 <= g2; g2--) {
            var h2 = d2[g2], k2 = h2.instance, l = h2.currentTarget;
            h2 = h2.listener;
            if (k2 !== f2 && e2.isPropagationStopped()) break a;
            nf(e2, h2, l);
            f2 = k2;
          }
          else for (g2 = 0; g2 < d2.length; g2++) {
            h2 = d2[g2];
            k2 = h2.instance;
            l = h2.currentTarget;
            h2 = h2.listener;
            if (k2 !== f2 && e2.isPropagationStopped()) break a;
            nf(e2, h2, l);
            f2 = k2;
          }
        }
      }
      if (Qb) throw a2 = Rb, Qb = false, Rb = null, a2;
    }
    function D2(a2, b2) {
      var c2 = b2[of];
      void 0 === c2 && (c2 = b2[of] = /* @__PURE__ */ new Set());
      var d2 = a2 + "__bubble";
      c2.has(d2) || (pf(b2, a2, 2, false), c2.add(d2));
    }
    function qf(a2, b2, c2) {
      var d2 = 0;
      b2 && (d2 |= 4);
      pf(c2, a2, d2, b2);
    }
    var rf = "_reactListening" + Math.random().toString(36).slice(2);
    function sf(a2) {
      if (!a2[rf]) {
        a2[rf] = true;
        da.forEach(function(b3) {
          "selectionchange" !== b3 && (mf.has(b3) || qf(b3, false, a2), qf(b3, true, a2));
        });
        var b2 = 9 === a2.nodeType ? a2 : a2.ownerDocument;
        null === b2 || b2[rf] || (b2[rf] = true, qf("selectionchange", false, b2));
      }
    }
    function pf(a2, b2, c2, d2) {
      switch (jd(b2)) {
        case 1:
          var e2 = ed;
          break;
        case 4:
          e2 = gd;
          break;
        default:
          e2 = fd;
      }
      c2 = e2.bind(null, b2, c2, a2);
      e2 = void 0;
      !Lb || "touchstart" !== b2 && "touchmove" !== b2 && "wheel" !== b2 || (e2 = true);
      d2 ? void 0 !== e2 ? a2.addEventListener(b2, c2, { capture: true, passive: e2 }) : a2.addEventListener(b2, c2, true) : void 0 !== e2 ? a2.addEventListener(b2, c2, { passive: e2 }) : a2.addEventListener(b2, c2, false);
    }
    function hd(a2, b2, c2, d2, e2) {
      var f2 = d2;
      if (0 === (b2 & 1) && 0 === (b2 & 2) && null !== d2) a: for (; ; ) {
        if (null === d2) return;
        var g2 = d2.tag;
        if (3 === g2 || 4 === g2) {
          var h2 = d2.stateNode.containerInfo;
          if (h2 === e2 || 8 === h2.nodeType && h2.parentNode === e2) break;
          if (4 === g2) for (g2 = d2.return; null !== g2; ) {
            var k2 = g2.tag;
            if (3 === k2 || 4 === k2) {
              if (k2 = g2.stateNode.containerInfo, k2 === e2 || 8 === k2.nodeType && k2.parentNode === e2) return;
            }
            g2 = g2.return;
          }
          for (; null !== h2; ) {
            g2 = Wc(h2);
            if (null === g2) return;
            k2 = g2.tag;
            if (5 === k2 || 6 === k2) {
              d2 = f2 = g2;
              continue a;
            }
            h2 = h2.parentNode;
          }
        }
        d2 = d2.return;
      }
      Jb(function() {
        var d3 = f2, e3 = xb(c2), g3 = [];
        a: {
          var h3 = df.get(a2);
          if (void 0 !== h3) {
            var k3 = td, n2 = a2;
            switch (a2) {
              case "keypress":
                if (0 === od(c2)) break a;
              case "keydown":
              case "keyup":
                k3 = Rd;
                break;
              case "focusin":
                n2 = "focus";
                k3 = Fd;
                break;
              case "focusout":
                n2 = "blur";
                k3 = Fd;
                break;
              case "beforeblur":
              case "afterblur":
                k3 = Fd;
                break;
              case "click":
                if (2 === c2.button) break a;
              case "auxclick":
              case "dblclick":
              case "mousedown":
              case "mousemove":
              case "mouseup":
              case "mouseout":
              case "mouseover":
              case "contextmenu":
                k3 = Bd;
                break;
              case "drag":
              case "dragend":
              case "dragenter":
              case "dragexit":
              case "dragleave":
              case "dragover":
              case "dragstart":
              case "drop":
                k3 = Dd;
                break;
              case "touchcancel":
              case "touchend":
              case "touchmove":
              case "touchstart":
                k3 = Vd;
                break;
              case $e:
              case af:
              case bf:
                k3 = Hd;
                break;
              case cf:
                k3 = Xd;
                break;
              case "scroll":
                k3 = vd;
                break;
              case "wheel":
                k3 = Zd;
                break;
              case "copy":
              case "cut":
              case "paste":
                k3 = Jd;
                break;
              case "gotpointercapture":
              case "lostpointercapture":
              case "pointercancel":
              case "pointerdown":
              case "pointermove":
              case "pointerout":
              case "pointerover":
              case "pointerup":
                k3 = Td;
            }
            var t3 = 0 !== (b2 & 4), J = !t3 && "scroll" === a2, x2 = t3 ? null !== h3 ? h3 + "Capture" : null : h3;
            t3 = [];
            for (var w2 = d3, u2; null !== w2; ) {
              u2 = w2;
              var F2 = u2.stateNode;
              5 === u2.tag && null !== F2 && (u2 = F2, null !== x2 && (F2 = Kb(w2, x2), null != F2 && t3.push(tf(w2, F2, u2))));
              if (J) break;
              w2 = w2.return;
            }
            0 < t3.length && (h3 = new k3(h3, n2, null, c2, e3), g3.push({ event: h3, listeners: t3 }));
          }
        }
        if (0 === (b2 & 7)) {
          a: {
            h3 = "mouseover" === a2 || "pointerover" === a2;
            k3 = "mouseout" === a2 || "pointerout" === a2;
            if (h3 && c2 !== wb && (n2 = c2.relatedTarget || c2.fromElement) && (Wc(n2) || n2[uf])) break a;
            if (k3 || h3) {
              h3 = e3.window === e3 ? e3 : (h3 = e3.ownerDocument) ? h3.defaultView || h3.parentWindow : window;
              if (k3) {
                if (n2 = c2.relatedTarget || c2.toElement, k3 = d3, n2 = n2 ? Wc(n2) : null, null !== n2 && (J = Vb(n2), n2 !== J || 5 !== n2.tag && 6 !== n2.tag)) n2 = null;
              } else k3 = null, n2 = d3;
              if (k3 !== n2) {
                t3 = Bd;
                F2 = "onMouseLeave";
                x2 = "onMouseEnter";
                w2 = "mouse";
                if ("pointerout" === a2 || "pointerover" === a2) t3 = Td, F2 = "onPointerLeave", x2 = "onPointerEnter", w2 = "pointer";
                J = null == k3 ? h3 : ue(k3);
                u2 = null == n2 ? h3 : ue(n2);
                h3 = new t3(F2, w2 + "leave", k3, c2, e3);
                h3.target = J;
                h3.relatedTarget = u2;
                F2 = null;
                Wc(e3) === d3 && (t3 = new t3(x2, w2 + "enter", n2, c2, e3), t3.target = u2, t3.relatedTarget = J, F2 = t3);
                J = F2;
                if (k3 && n2) b: {
                  t3 = k3;
                  x2 = n2;
                  w2 = 0;
                  for (u2 = t3; u2; u2 = vf(u2)) w2++;
                  u2 = 0;
                  for (F2 = x2; F2; F2 = vf(F2)) u2++;
                  for (; 0 < w2 - u2; ) t3 = vf(t3), w2--;
                  for (; 0 < u2 - w2; ) x2 = vf(x2), u2--;
                  for (; w2--; ) {
                    if (t3 === x2 || null !== x2 && t3 === x2.alternate) break b;
                    t3 = vf(t3);
                    x2 = vf(x2);
                  }
                  t3 = null;
                }
                else t3 = null;
                null !== k3 && wf(g3, h3, k3, t3, false);
                null !== n2 && null !== J && wf(g3, J, n2, t3, true);
              }
            }
          }
          a: {
            h3 = d3 ? ue(d3) : window;
            k3 = h3.nodeName && h3.nodeName.toLowerCase();
            if ("select" === k3 || "input" === k3 && "file" === h3.type) var na = ve;
            else if (me(h3)) if (we) na = Fe;
            else {
              na = De;
              var xa = Ce;
            }
            else (k3 = h3.nodeName) && "input" === k3.toLowerCase() && ("checkbox" === h3.type || "radio" === h3.type) && (na = Ee);
            if (na && (na = na(a2, d3))) {
              ne(g3, na, c2, e3);
              break a;
            }
            xa && xa(a2, h3, d3);
            "focusout" === a2 && (xa = h3._wrapperState) && xa.controlled && "number" === h3.type && cb(h3, "number", h3.value);
          }
          xa = d3 ? ue(d3) : window;
          switch (a2) {
            case "focusin":
              if (me(xa) || "true" === xa.contentEditable) Qe = xa, Re = d3, Se = null;
              break;
            case "focusout":
              Se = Re = Qe = null;
              break;
            case "mousedown":
              Te = true;
              break;
            case "contextmenu":
            case "mouseup":
            case "dragend":
              Te = false;
              Ue(g3, c2, e3);
              break;
            case "selectionchange":
              if (Pe) break;
            case "keydown":
            case "keyup":
              Ue(g3, c2, e3);
          }
          var $a;
          if (ae) b: {
            switch (a2) {
              case "compositionstart":
                var ba = "onCompositionStart";
                break b;
              case "compositionend":
                ba = "onCompositionEnd";
                break b;
              case "compositionupdate":
                ba = "onCompositionUpdate";
                break b;
            }
            ba = void 0;
          }
          else ie ? ge(a2, c2) && (ba = "onCompositionEnd") : "keydown" === a2 && 229 === c2.keyCode && (ba = "onCompositionStart");
          ba && (de && "ko" !== c2.locale && (ie || "onCompositionStart" !== ba ? "onCompositionEnd" === ba && ie && ($a = nd()) : (kd = e3, ld = "value" in kd ? kd.value : kd.textContent, ie = true)), xa = oe(d3, ba), 0 < xa.length && (ba = new Ld(ba, a2, null, c2, e3), g3.push({ event: ba, listeners: xa }), $a ? ba.data = $a : ($a = he(c2), null !== $a && (ba.data = $a))));
          if ($a = ce ? je(a2, c2) : ke(a2, c2)) d3 = oe(d3, "onBeforeInput"), 0 < d3.length && (e3 = new Ld("onBeforeInput", "beforeinput", null, c2, e3), g3.push({ event: e3, listeners: d3 }), e3.data = $a);
        }
        se(g3, b2);
      });
    }
    function tf(a2, b2, c2) {
      return { instance: a2, listener: b2, currentTarget: c2 };
    }
    function oe(a2, b2) {
      for (var c2 = b2 + "Capture", d2 = []; null !== a2; ) {
        var e2 = a2, f2 = e2.stateNode;
        5 === e2.tag && null !== f2 && (e2 = f2, f2 = Kb(a2, c2), null != f2 && d2.unshift(tf(a2, f2, e2)), f2 = Kb(a2, b2), null != f2 && d2.push(tf(a2, f2, e2)));
        a2 = a2.return;
      }
      return d2;
    }
    function vf(a2) {
      if (null === a2) return null;
      do
        a2 = a2.return;
      while (a2 && 5 !== a2.tag);
      return a2 ? a2 : null;
    }
    function wf(a2, b2, c2, d2, e2) {
      for (var f2 = b2._reactName, g2 = []; null !== c2 && c2 !== d2; ) {
        var h2 = c2, k2 = h2.alternate, l = h2.stateNode;
        if (null !== k2 && k2 === d2) break;
        5 === h2.tag && null !== l && (h2 = l, e2 ? (k2 = Kb(c2, f2), null != k2 && g2.unshift(tf(c2, k2, h2))) : e2 || (k2 = Kb(c2, f2), null != k2 && g2.push(tf(c2, k2, h2))));
        c2 = c2.return;
      }
      0 !== g2.length && a2.push({ event: b2, listeners: g2 });
    }
    var xf = /\r\n?/g;
    var yf = /\u0000|\uFFFD/g;
    function zf(a2) {
      return ("string" === typeof a2 ? a2 : "" + a2).replace(xf, "\n").replace(yf, "");
    }
    function Af(a2, b2, c2) {
      b2 = zf(b2);
      if (zf(a2) !== b2 && c2) throw Error(p2(425));
    }
    function Bf() {
    }
    var Cf = null;
    var Df = null;
    function Ef(a2, b2) {
      return "textarea" === a2 || "noscript" === a2 || "string" === typeof b2.children || "number" === typeof b2.children || "object" === typeof b2.dangerouslySetInnerHTML && null !== b2.dangerouslySetInnerHTML && null != b2.dangerouslySetInnerHTML.__html;
    }
    var Ff = "function" === typeof setTimeout ? setTimeout : void 0;
    var Gf = "function" === typeof clearTimeout ? clearTimeout : void 0;
    var Hf = "function" === typeof Promise ? Promise : void 0;
    var Jf = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof Hf ? function(a2) {
      return Hf.resolve(null).then(a2).catch(If);
    } : Ff;
    function If(a2) {
      setTimeout(function() {
        throw a2;
      });
    }
    function Kf(a2, b2) {
      var c2 = b2, d2 = 0;
      do {
        var e2 = c2.nextSibling;
        a2.removeChild(c2);
        if (e2 && 8 === e2.nodeType) if (c2 = e2.data, "/$" === c2) {
          if (0 === d2) {
            a2.removeChild(e2);
            bd(b2);
            return;
          }
          d2--;
        } else "$" !== c2 && "$?" !== c2 && "$!" !== c2 || d2++;
        c2 = e2;
      } while (c2);
      bd(b2);
    }
    function Lf(a2) {
      for (; null != a2; a2 = a2.nextSibling) {
        var b2 = a2.nodeType;
        if (1 === b2 || 3 === b2) break;
        if (8 === b2) {
          b2 = a2.data;
          if ("$" === b2 || "$!" === b2 || "$?" === b2) break;
          if ("/$" === b2) return null;
        }
      }
      return a2;
    }
    function Mf(a2) {
      a2 = a2.previousSibling;
      for (var b2 = 0; a2; ) {
        if (8 === a2.nodeType) {
          var c2 = a2.data;
          if ("$" === c2 || "$!" === c2 || "$?" === c2) {
            if (0 === b2) return a2;
            b2--;
          } else "/$" === c2 && b2++;
        }
        a2 = a2.previousSibling;
      }
      return null;
    }
    var Nf = Math.random().toString(36).slice(2);
    var Of = "__reactFiber$" + Nf;
    var Pf = "__reactProps$" + Nf;
    var uf = "__reactContainer$" + Nf;
    var of = "__reactEvents$" + Nf;
    var Qf = "__reactListeners$" + Nf;
    var Rf = "__reactHandles$" + Nf;
    function Wc(a2) {
      var b2 = a2[Of];
      if (b2) return b2;
      for (var c2 = a2.parentNode; c2; ) {
        if (b2 = c2[uf] || c2[Of]) {
          c2 = b2.alternate;
          if (null !== b2.child || null !== c2 && null !== c2.child) for (a2 = Mf(a2); null !== a2; ) {
            if (c2 = a2[Of]) return c2;
            a2 = Mf(a2);
          }
          return b2;
        }
        a2 = c2;
        c2 = a2.parentNode;
      }
      return null;
    }
    function Cb(a2) {
      a2 = a2[Of] || a2[uf];
      return !a2 || 5 !== a2.tag && 6 !== a2.tag && 13 !== a2.tag && 3 !== a2.tag ? null : a2;
    }
    function ue(a2) {
      if (5 === a2.tag || 6 === a2.tag) return a2.stateNode;
      throw Error(p2(33));
    }
    function Db(a2) {
      return a2[Pf] || null;
    }
    var Sf = [];
    var Tf = -1;
    function Uf(a2) {
      return { current: a2 };
    }
    function E2(a2) {
      0 > Tf || (a2.current = Sf[Tf], Sf[Tf] = null, Tf--);
    }
    function G(a2, b2) {
      Tf++;
      Sf[Tf] = a2.current;
      a2.current = b2;
    }
    var Vf = {};
    var H2 = Uf(Vf);
    var Wf = Uf(false);
    var Xf = Vf;
    function Yf(a2, b2) {
      var c2 = a2.type.contextTypes;
      if (!c2) return Vf;
      var d2 = a2.stateNode;
      if (d2 && d2.__reactInternalMemoizedUnmaskedChildContext === b2) return d2.__reactInternalMemoizedMaskedChildContext;
      var e2 = {}, f2;
      for (f2 in c2) e2[f2] = b2[f2];
      d2 && (a2 = a2.stateNode, a2.__reactInternalMemoizedUnmaskedChildContext = b2, a2.__reactInternalMemoizedMaskedChildContext = e2);
      return e2;
    }
    function Zf(a2) {
      a2 = a2.childContextTypes;
      return null !== a2 && void 0 !== a2;
    }
    function $f() {
      E2(Wf);
      E2(H2);
    }
    function ag(a2, b2, c2) {
      if (H2.current !== Vf) throw Error(p2(168));
      G(H2, b2);
      G(Wf, c2);
    }
    function bg(a2, b2, c2) {
      var d2 = a2.stateNode;
      b2 = b2.childContextTypes;
      if ("function" !== typeof d2.getChildContext) return c2;
      d2 = d2.getChildContext();
      for (var e2 in d2) if (!(e2 in b2)) throw Error(p2(108, Ra(a2) || "Unknown", e2));
      return A2({}, c2, d2);
    }
    function cg(a2) {
      a2 = (a2 = a2.stateNode) && a2.__reactInternalMemoizedMergedChildContext || Vf;
      Xf = H2.current;
      G(H2, a2);
      G(Wf, Wf.current);
      return true;
    }
    function dg(a2, b2, c2) {
      var d2 = a2.stateNode;
      if (!d2) throw Error(p2(169));
      c2 ? (a2 = bg(a2, b2, Xf), d2.__reactInternalMemoizedMergedChildContext = a2, E2(Wf), E2(H2), G(H2, a2)) : E2(Wf);
      G(Wf, c2);
    }
    var eg = null;
    var fg = false;
    var gg = false;
    function hg(a2) {
      null === eg ? eg = [a2] : eg.push(a2);
    }
    function ig(a2) {
      fg = true;
      hg(a2);
    }
    function jg() {
      if (!gg && null !== eg) {
        gg = true;
        var a2 = 0, b2 = C2;
        try {
          var c2 = eg;
          for (C2 = 1; a2 < c2.length; a2++) {
            var d2 = c2[a2];
            do
              d2 = d2(true);
            while (null !== d2);
          }
          eg = null;
          fg = false;
        } catch (e2) {
          throw null !== eg && (eg = eg.slice(a2 + 1)), ac(fc, jg), e2;
        } finally {
          C2 = b2, gg = false;
        }
      }
      return null;
    }
    var kg = [];
    var lg = 0;
    var mg = null;
    var ng = 0;
    var og = [];
    var pg = 0;
    var qg = null;
    var rg = 1;
    var sg = "";
    function tg(a2, b2) {
      kg[lg++] = ng;
      kg[lg++] = mg;
      mg = a2;
      ng = b2;
    }
    function ug(a2, b2, c2) {
      og[pg++] = rg;
      og[pg++] = sg;
      og[pg++] = qg;
      qg = a2;
      var d2 = rg;
      a2 = sg;
      var e2 = 32 - oc(d2) - 1;
      d2 &= ~(1 << e2);
      c2 += 1;
      var f2 = 32 - oc(b2) + e2;
      if (30 < f2) {
        var g2 = e2 - e2 % 5;
        f2 = (d2 & (1 << g2) - 1).toString(32);
        d2 >>= g2;
        e2 -= g2;
        rg = 1 << 32 - oc(b2) + e2 | c2 << e2 | d2;
        sg = f2 + a2;
      } else rg = 1 << f2 | c2 << e2 | d2, sg = a2;
    }
    function vg(a2) {
      null !== a2.return && (tg(a2, 1), ug(a2, 1, 0));
    }
    function wg(a2) {
      for (; a2 === mg; ) mg = kg[--lg], kg[lg] = null, ng = kg[--lg], kg[lg] = null;
      for (; a2 === qg; ) qg = og[--pg], og[pg] = null, sg = og[--pg], og[pg] = null, rg = og[--pg], og[pg] = null;
    }
    var xg = null;
    var yg = null;
    var I2 = false;
    var zg = null;
    function Ag(a2, b2) {
      var c2 = Bg(5, null, null, 0);
      c2.elementType = "DELETED";
      c2.stateNode = b2;
      c2.return = a2;
      b2 = a2.deletions;
      null === b2 ? (a2.deletions = [c2], a2.flags |= 16) : b2.push(c2);
    }
    function Cg(a2, b2) {
      switch (a2.tag) {
        case 5:
          var c2 = a2.type;
          b2 = 1 !== b2.nodeType || c2.toLowerCase() !== b2.nodeName.toLowerCase() ? null : b2;
          return null !== b2 ? (a2.stateNode = b2, xg = a2, yg = Lf(b2.firstChild), true) : false;
        case 6:
          return b2 = "" === a2.pendingProps || 3 !== b2.nodeType ? null : b2, null !== b2 ? (a2.stateNode = b2, xg = a2, yg = null, true) : false;
        case 13:
          return b2 = 8 !== b2.nodeType ? null : b2, null !== b2 ? (c2 = null !== qg ? { id: rg, overflow: sg } : null, a2.memoizedState = { dehydrated: b2, treeContext: c2, retryLane: 1073741824 }, c2 = Bg(18, null, null, 0), c2.stateNode = b2, c2.return = a2, a2.child = c2, xg = a2, yg = null, true) : false;
        default:
          return false;
      }
    }
    function Dg(a2) {
      return 0 !== (a2.mode & 1) && 0 === (a2.flags & 128);
    }
    function Eg(a2) {
      if (I2) {
        var b2 = yg;
        if (b2) {
          var c2 = b2;
          if (!Cg(a2, b2)) {
            if (Dg(a2)) throw Error(p2(418));
            b2 = Lf(c2.nextSibling);
            var d2 = xg;
            b2 && Cg(a2, b2) ? Ag(d2, c2) : (a2.flags = a2.flags & -4097 | 2, I2 = false, xg = a2);
          }
        } else {
          if (Dg(a2)) throw Error(p2(418));
          a2.flags = a2.flags & -4097 | 2;
          I2 = false;
          xg = a2;
        }
      }
    }
    function Fg(a2) {
      for (a2 = a2.return; null !== a2 && 5 !== a2.tag && 3 !== a2.tag && 13 !== a2.tag; ) a2 = a2.return;
      xg = a2;
    }
    function Gg(a2) {
      if (a2 !== xg) return false;
      if (!I2) return Fg(a2), I2 = true, false;
      var b2;
      (b2 = 3 !== a2.tag) && !(b2 = 5 !== a2.tag) && (b2 = a2.type, b2 = "head" !== b2 && "body" !== b2 && !Ef(a2.type, a2.memoizedProps));
      if (b2 && (b2 = yg)) {
        if (Dg(a2)) throw Hg(), Error(p2(418));
        for (; b2; ) Ag(a2, b2), b2 = Lf(b2.nextSibling);
      }
      Fg(a2);
      if (13 === a2.tag) {
        a2 = a2.memoizedState;
        a2 = null !== a2 ? a2.dehydrated : null;
        if (!a2) throw Error(p2(317));
        a: {
          a2 = a2.nextSibling;
          for (b2 = 0; a2; ) {
            if (8 === a2.nodeType) {
              var c2 = a2.data;
              if ("/$" === c2) {
                if (0 === b2) {
                  yg = Lf(a2.nextSibling);
                  break a;
                }
                b2--;
              } else "$" !== c2 && "$!" !== c2 && "$?" !== c2 || b2++;
            }
            a2 = a2.nextSibling;
          }
          yg = null;
        }
      } else yg = xg ? Lf(a2.stateNode.nextSibling) : null;
      return true;
    }
    function Hg() {
      for (var a2 = yg; a2; ) a2 = Lf(a2.nextSibling);
    }
    function Ig() {
      yg = xg = null;
      I2 = false;
    }
    function Jg(a2) {
      null === zg ? zg = [a2] : zg.push(a2);
    }
    var Kg = ua.ReactCurrentBatchConfig;
    function Lg(a2, b2, c2) {
      a2 = c2.ref;
      if (null !== a2 && "function" !== typeof a2 && "object" !== typeof a2) {
        if (c2._owner) {
          c2 = c2._owner;
          if (c2) {
            if (1 !== c2.tag) throw Error(p2(309));
            var d2 = c2.stateNode;
          }
          if (!d2) throw Error(p2(147, a2));
          var e2 = d2, f2 = "" + a2;
          if (null !== b2 && null !== b2.ref && "function" === typeof b2.ref && b2.ref._stringRef === f2) return b2.ref;
          b2 = function(a3) {
            var b3 = e2.refs;
            null === a3 ? delete b3[f2] : b3[f2] = a3;
          };
          b2._stringRef = f2;
          return b2;
        }
        if ("string" !== typeof a2) throw Error(p2(284));
        if (!c2._owner) throw Error(p2(290, a2));
      }
      return a2;
    }
    function Mg(a2, b2) {
      a2 = Object.prototype.toString.call(b2);
      throw Error(p2(31, "[object Object]" === a2 ? "object with keys {" + Object.keys(b2).join(", ") + "}" : a2));
    }
    function Ng(a2) {
      var b2 = a2._init;
      return b2(a2._payload);
    }
    function Og(a2) {
      function b2(b3, c3) {
        if (a2) {
          var d3 = b3.deletions;
          null === d3 ? (b3.deletions = [c3], b3.flags |= 16) : d3.push(c3);
        }
      }
      function c2(c3, d3) {
        if (!a2) return null;
        for (; null !== d3; ) b2(c3, d3), d3 = d3.sibling;
        return null;
      }
      function d2(a3, b3) {
        for (a3 = /* @__PURE__ */ new Map(); null !== b3; ) null !== b3.key ? a3.set(b3.key, b3) : a3.set(b3.index, b3), b3 = b3.sibling;
        return a3;
      }
      function e2(a3, b3) {
        a3 = Pg(a3, b3);
        a3.index = 0;
        a3.sibling = null;
        return a3;
      }
      function f2(b3, c3, d3) {
        b3.index = d3;
        if (!a2) return b3.flags |= 1048576, c3;
        d3 = b3.alternate;
        if (null !== d3) return d3 = d3.index, d3 < c3 ? (b3.flags |= 2, c3) : d3;
        b3.flags |= 2;
        return c3;
      }
      function g2(b3) {
        a2 && null === b3.alternate && (b3.flags |= 2);
        return b3;
      }
      function h2(a3, b3, c3, d3) {
        if (null === b3 || 6 !== b3.tag) return b3 = Qg(c3, a3.mode, d3), b3.return = a3, b3;
        b3 = e2(b3, c3);
        b3.return = a3;
        return b3;
      }
      function k2(a3, b3, c3, d3) {
        var f3 = c3.type;
        if (f3 === ya) return m2(a3, b3, c3.props.children, d3, c3.key);
        if (null !== b3 && (b3.elementType === f3 || "object" === typeof f3 && null !== f3 && f3.$$typeof === Ha && Ng(f3) === b3.type)) return d3 = e2(b3, c3.props), d3.ref = Lg(a3, b3, c3), d3.return = a3, d3;
        d3 = Rg(c3.type, c3.key, c3.props, null, a3.mode, d3);
        d3.ref = Lg(a3, b3, c3);
        d3.return = a3;
        return d3;
      }
      function l(a3, b3, c3, d3) {
        if (null === b3 || 4 !== b3.tag || b3.stateNode.containerInfo !== c3.containerInfo || b3.stateNode.implementation !== c3.implementation) return b3 = Sg(c3, a3.mode, d3), b3.return = a3, b3;
        b3 = e2(b3, c3.children || []);
        b3.return = a3;
        return b3;
      }
      function m2(a3, b3, c3, d3, f3) {
        if (null === b3 || 7 !== b3.tag) return b3 = Tg(c3, a3.mode, d3, f3), b3.return = a3, b3;
        b3 = e2(b3, c3);
        b3.return = a3;
        return b3;
      }
      function q2(a3, b3, c3) {
        if ("string" === typeof b3 && "" !== b3 || "number" === typeof b3) return b3 = Qg("" + b3, a3.mode, c3), b3.return = a3, b3;
        if ("object" === typeof b3 && null !== b3) {
          switch (b3.$$typeof) {
            case va:
              return c3 = Rg(b3.type, b3.key, b3.props, null, a3.mode, c3), c3.ref = Lg(a3, null, b3), c3.return = a3, c3;
            case wa:
              return b3 = Sg(b3, a3.mode, c3), b3.return = a3, b3;
            case Ha:
              var d3 = b3._init;
              return q2(a3, d3(b3._payload), c3);
          }
          if (eb(b3) || Ka(b3)) return b3 = Tg(b3, a3.mode, c3, null), b3.return = a3, b3;
          Mg(a3, b3);
        }
        return null;
      }
      function r3(a3, b3, c3, d3) {
        var e3 = null !== b3 ? b3.key : null;
        if ("string" === typeof c3 && "" !== c3 || "number" === typeof c3) return null !== e3 ? null : h2(a3, b3, "" + c3, d3);
        if ("object" === typeof c3 && null !== c3) {
          switch (c3.$$typeof) {
            case va:
              return c3.key === e3 ? k2(a3, b3, c3, d3) : null;
            case wa:
              return c3.key === e3 ? l(a3, b3, c3, d3) : null;
            case Ha:
              return e3 = c3._init, r3(
                a3,
                b3,
                e3(c3._payload),
                d3
              );
          }
          if (eb(c3) || Ka(c3)) return null !== e3 ? null : m2(a3, b3, c3, d3, null);
          Mg(a3, c3);
        }
        return null;
      }
      function y2(a3, b3, c3, d3, e3) {
        if ("string" === typeof d3 && "" !== d3 || "number" === typeof d3) return a3 = a3.get(c3) || null, h2(b3, a3, "" + d3, e3);
        if ("object" === typeof d3 && null !== d3) {
          switch (d3.$$typeof) {
            case va:
              return a3 = a3.get(null === d3.key ? c3 : d3.key) || null, k2(b3, a3, d3, e3);
            case wa:
              return a3 = a3.get(null === d3.key ? c3 : d3.key) || null, l(b3, a3, d3, e3);
            case Ha:
              var f3 = d3._init;
              return y2(a3, b3, c3, f3(d3._payload), e3);
          }
          if (eb(d3) || Ka(d3)) return a3 = a3.get(c3) || null, m2(b3, a3, d3, e3, null);
          Mg(b3, d3);
        }
        return null;
      }
      function n2(e3, g3, h3, k3) {
        for (var l2 = null, m3 = null, u2 = g3, w2 = g3 = 0, x2 = null; null !== u2 && w2 < h3.length; w2++) {
          u2.index > w2 ? (x2 = u2, u2 = null) : x2 = u2.sibling;
          var n3 = r3(e3, u2, h3[w2], k3);
          if (null === n3) {
            null === u2 && (u2 = x2);
            break;
          }
          a2 && u2 && null === n3.alternate && b2(e3, u2);
          g3 = f2(n3, g3, w2);
          null === m3 ? l2 = n3 : m3.sibling = n3;
          m3 = n3;
          u2 = x2;
        }
        if (w2 === h3.length) return c2(e3, u2), I2 && tg(e3, w2), l2;
        if (null === u2) {
          for (; w2 < h3.length; w2++) u2 = q2(e3, h3[w2], k3), null !== u2 && (g3 = f2(u2, g3, w2), null === m3 ? l2 = u2 : m3.sibling = u2, m3 = u2);
          I2 && tg(e3, w2);
          return l2;
        }
        for (u2 = d2(e3, u2); w2 < h3.length; w2++) x2 = y2(u2, e3, w2, h3[w2], k3), null !== x2 && (a2 && null !== x2.alternate && u2.delete(null === x2.key ? w2 : x2.key), g3 = f2(x2, g3, w2), null === m3 ? l2 = x2 : m3.sibling = x2, m3 = x2);
        a2 && u2.forEach(function(a3) {
          return b2(e3, a3);
        });
        I2 && tg(e3, w2);
        return l2;
      }
      function t3(e3, g3, h3, k3) {
        var l2 = Ka(h3);
        if ("function" !== typeof l2) throw Error(p2(150));
        h3 = l2.call(h3);
        if (null == h3) throw Error(p2(151));
        for (var u2 = l2 = null, m3 = g3, w2 = g3 = 0, x2 = null, n3 = h3.next(); null !== m3 && !n3.done; w2++, n3 = h3.next()) {
          m3.index > w2 ? (x2 = m3, m3 = null) : x2 = m3.sibling;
          var t4 = r3(e3, m3, n3.value, k3);
          if (null === t4) {
            null === m3 && (m3 = x2);
            break;
          }
          a2 && m3 && null === t4.alternate && b2(e3, m3);
          g3 = f2(t4, g3, w2);
          null === u2 ? l2 = t4 : u2.sibling = t4;
          u2 = t4;
          m3 = x2;
        }
        if (n3.done) return c2(
          e3,
          m3
        ), I2 && tg(e3, w2), l2;
        if (null === m3) {
          for (; !n3.done; w2++, n3 = h3.next()) n3 = q2(e3, n3.value, k3), null !== n3 && (g3 = f2(n3, g3, w2), null === u2 ? l2 = n3 : u2.sibling = n3, u2 = n3);
          I2 && tg(e3, w2);
          return l2;
        }
        for (m3 = d2(e3, m3); !n3.done; w2++, n3 = h3.next()) n3 = y2(m3, e3, w2, n3.value, k3), null !== n3 && (a2 && null !== n3.alternate && m3.delete(null === n3.key ? w2 : n3.key), g3 = f2(n3, g3, w2), null === u2 ? l2 = n3 : u2.sibling = n3, u2 = n3);
        a2 && m3.forEach(function(a3) {
          return b2(e3, a3);
        });
        I2 && tg(e3, w2);
        return l2;
      }
      function J(a3, d3, f3, h3) {
        "object" === typeof f3 && null !== f3 && f3.type === ya && null === f3.key && (f3 = f3.props.children);
        if ("object" === typeof f3 && null !== f3) {
          switch (f3.$$typeof) {
            case va:
              a: {
                for (var k3 = f3.key, l2 = d3; null !== l2; ) {
                  if (l2.key === k3) {
                    k3 = f3.type;
                    if (k3 === ya) {
                      if (7 === l2.tag) {
                        c2(a3, l2.sibling);
                        d3 = e2(l2, f3.props.children);
                        d3.return = a3;
                        a3 = d3;
                        break a;
                      }
                    } else if (l2.elementType === k3 || "object" === typeof k3 && null !== k3 && k3.$$typeof === Ha && Ng(k3) === l2.type) {
                      c2(a3, l2.sibling);
                      d3 = e2(l2, f3.props);
                      d3.ref = Lg(a3, l2, f3);
                      d3.return = a3;
                      a3 = d3;
                      break a;
                    }
                    c2(a3, l2);
                    break;
                  } else b2(a3, l2);
                  l2 = l2.sibling;
                }
                f3.type === ya ? (d3 = Tg(f3.props.children, a3.mode, h3, f3.key), d3.return = a3, a3 = d3) : (h3 = Rg(f3.type, f3.key, f3.props, null, a3.mode, h3), h3.ref = Lg(a3, d3, f3), h3.return = a3, a3 = h3);
              }
              return g2(a3);
            case wa:
              a: {
                for (l2 = f3.key; null !== d3; ) {
                  if (d3.key === l2) if (4 === d3.tag && d3.stateNode.containerInfo === f3.containerInfo && d3.stateNode.implementation === f3.implementation) {
                    c2(a3, d3.sibling);
                    d3 = e2(d3, f3.children || []);
                    d3.return = a3;
                    a3 = d3;
                    break a;
                  } else {
                    c2(a3, d3);
                    break;
                  }
                  else b2(a3, d3);
                  d3 = d3.sibling;
                }
                d3 = Sg(f3, a3.mode, h3);
                d3.return = a3;
                a3 = d3;
              }
              return g2(a3);
            case Ha:
              return l2 = f3._init, J(a3, d3, l2(f3._payload), h3);
          }
          if (eb(f3)) return n2(a3, d3, f3, h3);
          if (Ka(f3)) return t3(a3, d3, f3, h3);
          Mg(a3, f3);
        }
        return "string" === typeof f3 && "" !== f3 || "number" === typeof f3 ? (f3 = "" + f3, null !== d3 && 6 === d3.tag ? (c2(a3, d3.sibling), d3 = e2(d3, f3), d3.return = a3, a3 = d3) : (c2(a3, d3), d3 = Qg(f3, a3.mode, h3), d3.return = a3, a3 = d3), g2(a3)) : c2(a3, d3);
      }
      return J;
    }
    var Ug = Og(true);
    var Vg = Og(false);
    var Wg = Uf(null);
    var Xg = null;
    var Yg = null;
    var Zg = null;
    function $g() {
      Zg = Yg = Xg = null;
    }
    function ah(a2) {
      var b2 = Wg.current;
      E2(Wg);
      a2._currentValue = b2;
    }
    function bh(a2, b2, c2) {
      for (; null !== a2; ) {
        var d2 = a2.alternate;
        (a2.childLanes & b2) !== b2 ? (a2.childLanes |= b2, null !== d2 && (d2.childLanes |= b2)) : null !== d2 && (d2.childLanes & b2) !== b2 && (d2.childLanes |= b2);
        if (a2 === c2) break;
        a2 = a2.return;
      }
    }
    function ch(a2, b2) {
      Xg = a2;
      Zg = Yg = null;
      a2 = a2.dependencies;
      null !== a2 && null !== a2.firstContext && (0 !== (a2.lanes & b2) && (dh = true), a2.firstContext = null);
    }
    function eh(a2) {
      var b2 = a2._currentValue;
      if (Zg !== a2) if (a2 = { context: a2, memoizedValue: b2, next: null }, null === Yg) {
        if (null === Xg) throw Error(p2(308));
        Yg = a2;
        Xg.dependencies = { lanes: 0, firstContext: a2 };
      } else Yg = Yg.next = a2;
      return b2;
    }
    var fh = null;
    function gh(a2) {
      null === fh ? fh = [a2] : fh.push(a2);
    }
    function hh(a2, b2, c2, d2) {
      var e2 = b2.interleaved;
      null === e2 ? (c2.next = c2, gh(b2)) : (c2.next = e2.next, e2.next = c2);
      b2.interleaved = c2;
      return ih(a2, d2);
    }
    function ih(a2, b2) {
      a2.lanes |= b2;
      var c2 = a2.alternate;
      null !== c2 && (c2.lanes |= b2);
      c2 = a2;
      for (a2 = a2.return; null !== a2; ) a2.childLanes |= b2, c2 = a2.alternate, null !== c2 && (c2.childLanes |= b2), c2 = a2, a2 = a2.return;
      return 3 === c2.tag ? c2.stateNode : null;
    }
    var jh = false;
    function kh(a2) {
      a2.updateQueue = { baseState: a2.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
    }
    function lh(a2, b2) {
      a2 = a2.updateQueue;
      b2.updateQueue === a2 && (b2.updateQueue = { baseState: a2.baseState, firstBaseUpdate: a2.firstBaseUpdate, lastBaseUpdate: a2.lastBaseUpdate, shared: a2.shared, effects: a2.effects });
    }
    function mh(a2, b2) {
      return { eventTime: a2, lane: b2, tag: 0, payload: null, callback: null, next: null };
    }
    function nh(a2, b2, c2) {
      var d2 = a2.updateQueue;
      if (null === d2) return null;
      d2 = d2.shared;
      if (0 !== (K & 2)) {
        var e2 = d2.pending;
        null === e2 ? b2.next = b2 : (b2.next = e2.next, e2.next = b2);
        d2.pending = b2;
        return ih(a2, c2);
      }
      e2 = d2.interleaved;
      null === e2 ? (b2.next = b2, gh(d2)) : (b2.next = e2.next, e2.next = b2);
      d2.interleaved = b2;
      return ih(a2, c2);
    }
    function oh(a2, b2, c2) {
      b2 = b2.updateQueue;
      if (null !== b2 && (b2 = b2.shared, 0 !== (c2 & 4194240))) {
        var d2 = b2.lanes;
        d2 &= a2.pendingLanes;
        c2 |= d2;
        b2.lanes = c2;
        Cc(a2, c2);
      }
    }
    function ph(a2, b2) {
      var c2 = a2.updateQueue, d2 = a2.alternate;
      if (null !== d2 && (d2 = d2.updateQueue, c2 === d2)) {
        var e2 = null, f2 = null;
        c2 = c2.firstBaseUpdate;
        if (null !== c2) {
          do {
            var g2 = { eventTime: c2.eventTime, lane: c2.lane, tag: c2.tag, payload: c2.payload, callback: c2.callback, next: null };
            null === f2 ? e2 = f2 = g2 : f2 = f2.next = g2;
            c2 = c2.next;
          } while (null !== c2);
          null === f2 ? e2 = f2 = b2 : f2 = f2.next = b2;
        } else e2 = f2 = b2;
        c2 = { baseState: d2.baseState, firstBaseUpdate: e2, lastBaseUpdate: f2, shared: d2.shared, effects: d2.effects };
        a2.updateQueue = c2;
        return;
      }
      a2 = c2.lastBaseUpdate;
      null === a2 ? c2.firstBaseUpdate = b2 : a2.next = b2;
      c2.lastBaseUpdate = b2;
    }
    function qh(a2, b2, c2, d2) {
      var e2 = a2.updateQueue;
      jh = false;
      var f2 = e2.firstBaseUpdate, g2 = e2.lastBaseUpdate, h2 = e2.shared.pending;
      if (null !== h2) {
        e2.shared.pending = null;
        var k2 = h2, l = k2.next;
        k2.next = null;
        null === g2 ? f2 = l : g2.next = l;
        g2 = k2;
        var m2 = a2.alternate;
        null !== m2 && (m2 = m2.updateQueue, h2 = m2.lastBaseUpdate, h2 !== g2 && (null === h2 ? m2.firstBaseUpdate = l : h2.next = l, m2.lastBaseUpdate = k2));
      }
      if (null !== f2) {
        var q2 = e2.baseState;
        g2 = 0;
        m2 = l = k2 = null;
        h2 = f2;
        do {
          var r3 = h2.lane, y2 = h2.eventTime;
          if ((d2 & r3) === r3) {
            null !== m2 && (m2 = m2.next = {
              eventTime: y2,
              lane: 0,
              tag: h2.tag,
              payload: h2.payload,
              callback: h2.callback,
              next: null
            });
            a: {
              var n2 = a2, t3 = h2;
              r3 = b2;
              y2 = c2;
              switch (t3.tag) {
                case 1:
                  n2 = t3.payload;
                  if ("function" === typeof n2) {
                    q2 = n2.call(y2, q2, r3);
                    break a;
                  }
                  q2 = n2;
                  break a;
                case 3:
                  n2.flags = n2.flags & -65537 | 128;
                case 0:
                  n2 = t3.payload;
                  r3 = "function" === typeof n2 ? n2.call(y2, q2, r3) : n2;
                  if (null === r3 || void 0 === r3) break a;
                  q2 = A2({}, q2, r3);
                  break a;
                case 2:
                  jh = true;
              }
            }
            null !== h2.callback && 0 !== h2.lane && (a2.flags |= 64, r3 = e2.effects, null === r3 ? e2.effects = [h2] : r3.push(h2));
          } else y2 = { eventTime: y2, lane: r3, tag: h2.tag, payload: h2.payload, callback: h2.callback, next: null }, null === m2 ? (l = m2 = y2, k2 = q2) : m2 = m2.next = y2, g2 |= r3;
          h2 = h2.next;
          if (null === h2) if (h2 = e2.shared.pending, null === h2) break;
          else r3 = h2, h2 = r3.next, r3.next = null, e2.lastBaseUpdate = r3, e2.shared.pending = null;
        } while (1);
        null === m2 && (k2 = q2);
        e2.baseState = k2;
        e2.firstBaseUpdate = l;
        e2.lastBaseUpdate = m2;
        b2 = e2.shared.interleaved;
        if (null !== b2) {
          e2 = b2;
          do
            g2 |= e2.lane, e2 = e2.next;
          while (e2 !== b2);
        } else null === f2 && (e2.shared.lanes = 0);
        rh |= g2;
        a2.lanes = g2;
        a2.memoizedState = q2;
      }
    }
    function sh(a2, b2, c2) {
      a2 = b2.effects;
      b2.effects = null;
      if (null !== a2) for (b2 = 0; b2 < a2.length; b2++) {
        var d2 = a2[b2], e2 = d2.callback;
        if (null !== e2) {
          d2.callback = null;
          d2 = c2;
          if ("function" !== typeof e2) throw Error(p2(191, e2));
          e2.call(d2);
        }
      }
    }
    var th = {};
    var uh = Uf(th);
    var vh = Uf(th);
    var wh = Uf(th);
    function xh(a2) {
      if (a2 === th) throw Error(p2(174));
      return a2;
    }
    function yh(a2, b2) {
      G(wh, b2);
      G(vh, a2);
      G(uh, th);
      a2 = b2.nodeType;
      switch (a2) {
        case 9:
        case 11:
          b2 = (b2 = b2.documentElement) ? b2.namespaceURI : lb(null, "");
          break;
        default:
          a2 = 8 === a2 ? b2.parentNode : b2, b2 = a2.namespaceURI || null, a2 = a2.tagName, b2 = lb(b2, a2);
      }
      E2(uh);
      G(uh, b2);
    }
    function zh() {
      E2(uh);
      E2(vh);
      E2(wh);
    }
    function Ah(a2) {
      xh(wh.current);
      var b2 = xh(uh.current);
      var c2 = lb(b2, a2.type);
      b2 !== c2 && (G(vh, a2), G(uh, c2));
    }
    function Bh(a2) {
      vh.current === a2 && (E2(uh), E2(vh));
    }
    var L2 = Uf(0);
    function Ch(a2) {
      for (var b2 = a2; null !== b2; ) {
        if (13 === b2.tag) {
          var c2 = b2.memoizedState;
          if (null !== c2 && (c2 = c2.dehydrated, null === c2 || "$?" === c2.data || "$!" === c2.data)) return b2;
        } else if (19 === b2.tag && void 0 !== b2.memoizedProps.revealOrder) {
          if (0 !== (b2.flags & 128)) return b2;
        } else if (null !== b2.child) {
          b2.child.return = b2;
          b2 = b2.child;
          continue;
        }
        if (b2 === a2) break;
        for (; null === b2.sibling; ) {
          if (null === b2.return || b2.return === a2) return null;
          b2 = b2.return;
        }
        b2.sibling.return = b2.return;
        b2 = b2.sibling;
      }
      return null;
    }
    var Dh = [];
    function Eh() {
      for (var a2 = 0; a2 < Dh.length; a2++) Dh[a2]._workInProgressVersionPrimary = null;
      Dh.length = 0;
    }
    var Fh = ua.ReactCurrentDispatcher;
    var Gh = ua.ReactCurrentBatchConfig;
    var Hh = 0;
    var M2 = null;
    var N2 = null;
    var O2 = null;
    var Ih = false;
    var Jh = false;
    var Kh = 0;
    var Lh = 0;
    function P2() {
      throw Error(p2(321));
    }
    function Mh(a2, b2) {
      if (null === b2) return false;
      for (var c2 = 0; c2 < b2.length && c2 < a2.length; c2++) if (!He(a2[c2], b2[c2])) return false;
      return true;
    }
    function Nh(a2, b2, c2, d2, e2, f2) {
      Hh = f2;
      M2 = b2;
      b2.memoizedState = null;
      b2.updateQueue = null;
      b2.lanes = 0;
      Fh.current = null === a2 || null === a2.memoizedState ? Oh : Ph;
      a2 = c2(d2, e2);
      if (Jh) {
        f2 = 0;
        do {
          Jh = false;
          Kh = 0;
          if (25 <= f2) throw Error(p2(301));
          f2 += 1;
          O2 = N2 = null;
          b2.updateQueue = null;
          Fh.current = Qh;
          a2 = c2(d2, e2);
        } while (Jh);
      }
      Fh.current = Rh;
      b2 = null !== N2 && null !== N2.next;
      Hh = 0;
      O2 = N2 = M2 = null;
      Ih = false;
      if (b2) throw Error(p2(300));
      return a2;
    }
    function Sh() {
      var a2 = 0 !== Kh;
      Kh = 0;
      return a2;
    }
    function Th() {
      var a2 = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
      null === O2 ? M2.memoizedState = O2 = a2 : O2 = O2.next = a2;
      return O2;
    }
    function Uh() {
      if (null === N2) {
        var a2 = M2.alternate;
        a2 = null !== a2 ? a2.memoizedState : null;
      } else a2 = N2.next;
      var b2 = null === O2 ? M2.memoizedState : O2.next;
      if (null !== b2) O2 = b2, N2 = a2;
      else {
        if (null === a2) throw Error(p2(310));
        N2 = a2;
        a2 = { memoizedState: N2.memoizedState, baseState: N2.baseState, baseQueue: N2.baseQueue, queue: N2.queue, next: null };
        null === O2 ? M2.memoizedState = O2 = a2 : O2 = O2.next = a2;
      }
      return O2;
    }
    function Vh(a2, b2) {
      return "function" === typeof b2 ? b2(a2) : b2;
    }
    function Wh(a2) {
      var b2 = Uh(), c2 = b2.queue;
      if (null === c2) throw Error(p2(311));
      c2.lastRenderedReducer = a2;
      var d2 = N2, e2 = d2.baseQueue, f2 = c2.pending;
      if (null !== f2) {
        if (null !== e2) {
          var g2 = e2.next;
          e2.next = f2.next;
          f2.next = g2;
        }
        d2.baseQueue = e2 = f2;
        c2.pending = null;
      }
      if (null !== e2) {
        f2 = e2.next;
        d2 = d2.baseState;
        var h2 = g2 = null, k2 = null, l = f2;
        do {
          var m2 = l.lane;
          if ((Hh & m2) === m2) null !== k2 && (k2 = k2.next = { lane: 0, action: l.action, hasEagerState: l.hasEagerState, eagerState: l.eagerState, next: null }), d2 = l.hasEagerState ? l.eagerState : a2(d2, l.action);
          else {
            var q2 = {
              lane: m2,
              action: l.action,
              hasEagerState: l.hasEagerState,
              eagerState: l.eagerState,
              next: null
            };
            null === k2 ? (h2 = k2 = q2, g2 = d2) : k2 = k2.next = q2;
            M2.lanes |= m2;
            rh |= m2;
          }
          l = l.next;
        } while (null !== l && l !== f2);
        null === k2 ? g2 = d2 : k2.next = h2;
        He(d2, b2.memoizedState) || (dh = true);
        b2.memoizedState = d2;
        b2.baseState = g2;
        b2.baseQueue = k2;
        c2.lastRenderedState = d2;
      }
      a2 = c2.interleaved;
      if (null !== a2) {
        e2 = a2;
        do
          f2 = e2.lane, M2.lanes |= f2, rh |= f2, e2 = e2.next;
        while (e2 !== a2);
      } else null === e2 && (c2.lanes = 0);
      return [b2.memoizedState, c2.dispatch];
    }
    function Xh(a2) {
      var b2 = Uh(), c2 = b2.queue;
      if (null === c2) throw Error(p2(311));
      c2.lastRenderedReducer = a2;
      var d2 = c2.dispatch, e2 = c2.pending, f2 = b2.memoizedState;
      if (null !== e2) {
        c2.pending = null;
        var g2 = e2 = e2.next;
        do
          f2 = a2(f2, g2.action), g2 = g2.next;
        while (g2 !== e2);
        He(f2, b2.memoizedState) || (dh = true);
        b2.memoizedState = f2;
        null === b2.baseQueue && (b2.baseState = f2);
        c2.lastRenderedState = f2;
      }
      return [f2, d2];
    }
    function Yh() {
    }
    function Zh(a2, b2) {
      var c2 = M2, d2 = Uh(), e2 = b2(), f2 = !He(d2.memoizedState, e2);
      f2 && (d2.memoizedState = e2, dh = true);
      d2 = d2.queue;
      $h(ai.bind(null, c2, d2, a2), [a2]);
      if (d2.getSnapshot !== b2 || f2 || null !== O2 && O2.memoizedState.tag & 1) {
        c2.flags |= 2048;
        bi(9, ci.bind(null, c2, d2, e2, b2), void 0, null);
        if (null === Q2) throw Error(p2(349));
        0 !== (Hh & 30) || di(c2, b2, e2);
      }
      return e2;
    }
    function di(a2, b2, c2) {
      a2.flags |= 16384;
      a2 = { getSnapshot: b2, value: c2 };
      b2 = M2.updateQueue;
      null === b2 ? (b2 = { lastEffect: null, stores: null }, M2.updateQueue = b2, b2.stores = [a2]) : (c2 = b2.stores, null === c2 ? b2.stores = [a2] : c2.push(a2));
    }
    function ci(a2, b2, c2, d2) {
      b2.value = c2;
      b2.getSnapshot = d2;
      ei(b2) && fi(a2);
    }
    function ai(a2, b2, c2) {
      return c2(function() {
        ei(b2) && fi(a2);
      });
    }
    function ei(a2) {
      var b2 = a2.getSnapshot;
      a2 = a2.value;
      try {
        var c2 = b2();
        return !He(a2, c2);
      } catch (d2) {
        return true;
      }
    }
    function fi(a2) {
      var b2 = ih(a2, 1);
      null !== b2 && gi(b2, a2, 1, -1);
    }
    function hi(a2) {
      var b2 = Th();
      "function" === typeof a2 && (a2 = a2());
      b2.memoizedState = b2.baseState = a2;
      a2 = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Vh, lastRenderedState: a2 };
      b2.queue = a2;
      a2 = a2.dispatch = ii.bind(null, M2, a2);
      return [b2.memoizedState, a2];
    }
    function bi(a2, b2, c2, d2) {
      a2 = { tag: a2, create: b2, destroy: c2, deps: d2, next: null };
      b2 = M2.updateQueue;
      null === b2 ? (b2 = { lastEffect: null, stores: null }, M2.updateQueue = b2, b2.lastEffect = a2.next = a2) : (c2 = b2.lastEffect, null === c2 ? b2.lastEffect = a2.next = a2 : (d2 = c2.next, c2.next = a2, a2.next = d2, b2.lastEffect = a2));
      return a2;
    }
    function ji() {
      return Uh().memoizedState;
    }
    function ki(a2, b2, c2, d2) {
      var e2 = Th();
      M2.flags |= a2;
      e2.memoizedState = bi(1 | b2, c2, void 0, void 0 === d2 ? null : d2);
    }
    function li(a2, b2, c2, d2) {
      var e2 = Uh();
      d2 = void 0 === d2 ? null : d2;
      var f2 = void 0;
      if (null !== N2) {
        var g2 = N2.memoizedState;
        f2 = g2.destroy;
        if (null !== d2 && Mh(d2, g2.deps)) {
          e2.memoizedState = bi(b2, c2, f2, d2);
          return;
        }
      }
      M2.flags |= a2;
      e2.memoizedState = bi(1 | b2, c2, f2, d2);
    }
    function mi(a2, b2) {
      return ki(8390656, 8, a2, b2);
    }
    function $h(a2, b2) {
      return li(2048, 8, a2, b2);
    }
    function ni(a2, b2) {
      return li(4, 2, a2, b2);
    }
    function oi(a2, b2) {
      return li(4, 4, a2, b2);
    }
    function pi(a2, b2) {
      if ("function" === typeof b2) return a2 = a2(), b2(a2), function() {
        b2(null);
      };
      if (null !== b2 && void 0 !== b2) return a2 = a2(), b2.current = a2, function() {
        b2.current = null;
      };
    }
    function qi(a2, b2, c2) {
      c2 = null !== c2 && void 0 !== c2 ? c2.concat([a2]) : null;
      return li(4, 4, pi.bind(null, b2, a2), c2);
    }
    function ri() {
    }
    function si(a2, b2) {
      var c2 = Uh();
      b2 = void 0 === b2 ? null : b2;
      var d2 = c2.memoizedState;
      if (null !== d2 && null !== b2 && Mh(b2, d2[1])) return d2[0];
      c2.memoizedState = [a2, b2];
      return a2;
    }
    function ti(a2, b2) {
      var c2 = Uh();
      b2 = void 0 === b2 ? null : b2;
      var d2 = c2.memoizedState;
      if (null !== d2 && null !== b2 && Mh(b2, d2[1])) return d2[0];
      a2 = a2();
      c2.memoizedState = [a2, b2];
      return a2;
    }
    function ui(a2, b2, c2) {
      if (0 === (Hh & 21)) return a2.baseState && (a2.baseState = false, dh = true), a2.memoizedState = c2;
      He(c2, b2) || (c2 = yc(), M2.lanes |= c2, rh |= c2, a2.baseState = true);
      return b2;
    }
    function vi(a2, b2) {
      var c2 = C2;
      C2 = 0 !== c2 && 4 > c2 ? c2 : 4;
      a2(true);
      var d2 = Gh.transition;
      Gh.transition = {};
      try {
        a2(false), b2();
      } finally {
        C2 = c2, Gh.transition = d2;
      }
    }
    function wi() {
      return Uh().memoizedState;
    }
    function xi(a2, b2, c2) {
      var d2 = yi(a2);
      c2 = { lane: d2, action: c2, hasEagerState: false, eagerState: null, next: null };
      if (zi(a2)) Ai(b2, c2);
      else if (c2 = hh(a2, b2, c2, d2), null !== c2) {
        var e2 = R2();
        gi(c2, a2, d2, e2);
        Bi(c2, b2, d2);
      }
    }
    function ii(a2, b2, c2) {
      var d2 = yi(a2), e2 = { lane: d2, action: c2, hasEagerState: false, eagerState: null, next: null };
      if (zi(a2)) Ai(b2, e2);
      else {
        var f2 = a2.alternate;
        if (0 === a2.lanes && (null === f2 || 0 === f2.lanes) && (f2 = b2.lastRenderedReducer, null !== f2)) try {
          var g2 = b2.lastRenderedState, h2 = f2(g2, c2);
          e2.hasEagerState = true;
          e2.eagerState = h2;
          if (He(h2, g2)) {
            var k2 = b2.interleaved;
            null === k2 ? (e2.next = e2, gh(b2)) : (e2.next = k2.next, k2.next = e2);
            b2.interleaved = e2;
            return;
          }
        } catch (l) {
        } finally {
        }
        c2 = hh(a2, b2, e2, d2);
        null !== c2 && (e2 = R2(), gi(c2, a2, d2, e2), Bi(c2, b2, d2));
      }
    }
    function zi(a2) {
      var b2 = a2.alternate;
      return a2 === M2 || null !== b2 && b2 === M2;
    }
    function Ai(a2, b2) {
      Jh = Ih = true;
      var c2 = a2.pending;
      null === c2 ? b2.next = b2 : (b2.next = c2.next, c2.next = b2);
      a2.pending = b2;
    }
    function Bi(a2, b2, c2) {
      if (0 !== (c2 & 4194240)) {
        var d2 = b2.lanes;
        d2 &= a2.pendingLanes;
        c2 |= d2;
        b2.lanes = c2;
        Cc(a2, c2);
      }
    }
    var Rh = { readContext: eh, useCallback: P2, useContext: P2, useEffect: P2, useImperativeHandle: P2, useInsertionEffect: P2, useLayoutEffect: P2, useMemo: P2, useReducer: P2, useRef: P2, useState: P2, useDebugValue: P2, useDeferredValue: P2, useTransition: P2, useMutableSource: P2, useSyncExternalStore: P2, useId: P2, unstable_isNewReconciler: false };
    var Oh = { readContext: eh, useCallback: function(a2, b2) {
      Th().memoizedState = [a2, void 0 === b2 ? null : b2];
      return a2;
    }, useContext: eh, useEffect: mi, useImperativeHandle: function(a2, b2, c2) {
      c2 = null !== c2 && void 0 !== c2 ? c2.concat([a2]) : null;
      return ki(
        4194308,
        4,
        pi.bind(null, b2, a2),
        c2
      );
    }, useLayoutEffect: function(a2, b2) {
      return ki(4194308, 4, a2, b2);
    }, useInsertionEffect: function(a2, b2) {
      return ki(4, 2, a2, b2);
    }, useMemo: function(a2, b2) {
      var c2 = Th();
      b2 = void 0 === b2 ? null : b2;
      a2 = a2();
      c2.memoizedState = [a2, b2];
      return a2;
    }, useReducer: function(a2, b2, c2) {
      var d2 = Th();
      b2 = void 0 !== c2 ? c2(b2) : b2;
      d2.memoizedState = d2.baseState = b2;
      a2 = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: a2, lastRenderedState: b2 };
      d2.queue = a2;
      a2 = a2.dispatch = xi.bind(null, M2, a2);
      return [d2.memoizedState, a2];
    }, useRef: function(a2) {
      var b2 = Th();
      a2 = { current: a2 };
      return b2.memoizedState = a2;
    }, useState: hi, useDebugValue: ri, useDeferredValue: function(a2) {
      return Th().memoizedState = a2;
    }, useTransition: function() {
      var a2 = hi(false), b2 = a2[0];
      a2 = vi.bind(null, a2[1]);
      Th().memoizedState = a2;
      return [b2, a2];
    }, useMutableSource: function() {
    }, useSyncExternalStore: function(a2, b2, c2) {
      var d2 = M2, e2 = Th();
      if (I2) {
        if (void 0 === c2) throw Error(p2(407));
        c2 = c2();
      } else {
        c2 = b2();
        if (null === Q2) throw Error(p2(349));
        0 !== (Hh & 30) || di(d2, b2, c2);
      }
      e2.memoizedState = c2;
      var f2 = { value: c2, getSnapshot: b2 };
      e2.queue = f2;
      mi(ai.bind(
        null,
        d2,
        f2,
        a2
      ), [a2]);
      d2.flags |= 2048;
      bi(9, ci.bind(null, d2, f2, c2, b2), void 0, null);
      return c2;
    }, useId: function() {
      var a2 = Th(), b2 = Q2.identifierPrefix;
      if (I2) {
        var c2 = sg;
        var d2 = rg;
        c2 = (d2 & ~(1 << 32 - oc(d2) - 1)).toString(32) + c2;
        b2 = ":" + b2 + "R" + c2;
        c2 = Kh++;
        0 < c2 && (b2 += "H" + c2.toString(32));
        b2 += ":";
      } else c2 = Lh++, b2 = ":" + b2 + "r" + c2.toString(32) + ":";
      return a2.memoizedState = b2;
    }, unstable_isNewReconciler: false };
    var Ph = {
      readContext: eh,
      useCallback: si,
      useContext: eh,
      useEffect: $h,
      useImperativeHandle: qi,
      useInsertionEffect: ni,
      useLayoutEffect: oi,
      useMemo: ti,
      useReducer: Wh,
      useRef: ji,
      useState: function() {
        return Wh(Vh);
      },
      useDebugValue: ri,
      useDeferredValue: function(a2) {
        var b2 = Uh();
        return ui(b2, N2.memoizedState, a2);
      },
      useTransition: function() {
        var a2 = Wh(Vh)[0], b2 = Uh().memoizedState;
        return [a2, b2];
      },
      useMutableSource: Yh,
      useSyncExternalStore: Zh,
      useId: wi,
      unstable_isNewReconciler: false
    };
    var Qh = { readContext: eh, useCallback: si, useContext: eh, useEffect: $h, useImperativeHandle: qi, useInsertionEffect: ni, useLayoutEffect: oi, useMemo: ti, useReducer: Xh, useRef: ji, useState: function() {
      return Xh(Vh);
    }, useDebugValue: ri, useDeferredValue: function(a2) {
      var b2 = Uh();
      return null === N2 ? b2.memoizedState = a2 : ui(b2, N2.memoizedState, a2);
    }, useTransition: function() {
      var a2 = Xh(Vh)[0], b2 = Uh().memoizedState;
      return [a2, b2];
    }, useMutableSource: Yh, useSyncExternalStore: Zh, useId: wi, unstable_isNewReconciler: false };
    function Ci(a2, b2) {
      if (a2 && a2.defaultProps) {
        b2 = A2({}, b2);
        a2 = a2.defaultProps;
        for (var c2 in a2) void 0 === b2[c2] && (b2[c2] = a2[c2]);
        return b2;
      }
      return b2;
    }
    function Di(a2, b2, c2, d2) {
      b2 = a2.memoizedState;
      c2 = c2(d2, b2);
      c2 = null === c2 || void 0 === c2 ? b2 : A2({}, b2, c2);
      a2.memoizedState = c2;
      0 === a2.lanes && (a2.updateQueue.baseState = c2);
    }
    var Ei = { isMounted: function(a2) {
      return (a2 = a2._reactInternals) ? Vb(a2) === a2 : false;
    }, enqueueSetState: function(a2, b2, c2) {
      a2 = a2._reactInternals;
      var d2 = R2(), e2 = yi(a2), f2 = mh(d2, e2);
      f2.payload = b2;
      void 0 !== c2 && null !== c2 && (f2.callback = c2);
      b2 = nh(a2, f2, e2);
      null !== b2 && (gi(b2, a2, e2, d2), oh(b2, a2, e2));
    }, enqueueReplaceState: function(a2, b2, c2) {
      a2 = a2._reactInternals;
      var d2 = R2(), e2 = yi(a2), f2 = mh(d2, e2);
      f2.tag = 1;
      f2.payload = b2;
      void 0 !== c2 && null !== c2 && (f2.callback = c2);
      b2 = nh(a2, f2, e2);
      null !== b2 && (gi(b2, a2, e2, d2), oh(b2, a2, e2));
    }, enqueueForceUpdate: function(a2, b2) {
      a2 = a2._reactInternals;
      var c2 = R2(), d2 = yi(a2), e2 = mh(c2, d2);
      e2.tag = 2;
      void 0 !== b2 && null !== b2 && (e2.callback = b2);
      b2 = nh(a2, e2, d2);
      null !== b2 && (gi(b2, a2, d2, c2), oh(b2, a2, d2));
    } };
    function Fi(a2, b2, c2, d2, e2, f2, g2) {
      a2 = a2.stateNode;
      return "function" === typeof a2.shouldComponentUpdate ? a2.shouldComponentUpdate(d2, f2, g2) : b2.prototype && b2.prototype.isPureReactComponent ? !Ie(c2, d2) || !Ie(e2, f2) : true;
    }
    function Gi(a2, b2, c2) {
      var d2 = false, e2 = Vf;
      var f2 = b2.contextType;
      "object" === typeof f2 && null !== f2 ? f2 = eh(f2) : (e2 = Zf(b2) ? Xf : H2.current, d2 = b2.contextTypes, f2 = (d2 = null !== d2 && void 0 !== d2) ? Yf(a2, e2) : Vf);
      b2 = new b2(c2, f2);
      a2.memoizedState = null !== b2.state && void 0 !== b2.state ? b2.state : null;
      b2.updater = Ei;
      a2.stateNode = b2;
      b2._reactInternals = a2;
      d2 && (a2 = a2.stateNode, a2.__reactInternalMemoizedUnmaskedChildContext = e2, a2.__reactInternalMemoizedMaskedChildContext = f2);
      return b2;
    }
    function Hi(a2, b2, c2, d2) {
      a2 = b2.state;
      "function" === typeof b2.componentWillReceiveProps && b2.componentWillReceiveProps(c2, d2);
      "function" === typeof b2.UNSAFE_componentWillReceiveProps && b2.UNSAFE_componentWillReceiveProps(c2, d2);
      b2.state !== a2 && Ei.enqueueReplaceState(b2, b2.state, null);
    }
    function Ii(a2, b2, c2, d2) {
      var e2 = a2.stateNode;
      e2.props = c2;
      e2.state = a2.memoizedState;
      e2.refs = {};
      kh(a2);
      var f2 = b2.contextType;
      "object" === typeof f2 && null !== f2 ? e2.context = eh(f2) : (f2 = Zf(b2) ? Xf : H2.current, e2.context = Yf(a2, f2));
      e2.state = a2.memoizedState;
      f2 = b2.getDerivedStateFromProps;
      "function" === typeof f2 && (Di(a2, b2, f2, c2), e2.state = a2.memoizedState);
      "function" === typeof b2.getDerivedStateFromProps || "function" === typeof e2.getSnapshotBeforeUpdate || "function" !== typeof e2.UNSAFE_componentWillMount && "function" !== typeof e2.componentWillMount || (b2 = e2.state, "function" === typeof e2.componentWillMount && e2.componentWillMount(), "function" === typeof e2.UNSAFE_componentWillMount && e2.UNSAFE_componentWillMount(), b2 !== e2.state && Ei.enqueueReplaceState(e2, e2.state, null), qh(a2, c2, e2, d2), e2.state = a2.memoizedState);
      "function" === typeof e2.componentDidMount && (a2.flags |= 4194308);
    }
    function Ji(a2, b2) {
      try {
        var c2 = "", d2 = b2;
        do
          c2 += Pa(d2), d2 = d2.return;
        while (d2);
        var e2 = c2;
      } catch (f2) {
        e2 = "\nError generating stack: " + f2.message + "\n" + f2.stack;
      }
      return { value: a2, source: b2, stack: e2, digest: null };
    }
    function Ki(a2, b2, c2) {
      return { value: a2, source: null, stack: null != c2 ? c2 : null, digest: null != b2 ? b2 : null };
    }
    function Li(a2, b2) {
      try {
        console.error(b2.value);
      } catch (c2) {
        setTimeout(function() {
          throw c2;
        });
      }
    }
    var Mi = "function" === typeof WeakMap ? WeakMap : Map;
    function Ni(a2, b2, c2) {
      c2 = mh(-1, c2);
      c2.tag = 3;
      c2.payload = { element: null };
      var d2 = b2.value;
      c2.callback = function() {
        Oi || (Oi = true, Pi = d2);
        Li(a2, b2);
      };
      return c2;
    }
    function Qi(a2, b2, c2) {
      c2 = mh(-1, c2);
      c2.tag = 3;
      var d2 = a2.type.getDerivedStateFromError;
      if ("function" === typeof d2) {
        var e2 = b2.value;
        c2.payload = function() {
          return d2(e2);
        };
        c2.callback = function() {
          Li(a2, b2);
        };
      }
      var f2 = a2.stateNode;
      null !== f2 && "function" === typeof f2.componentDidCatch && (c2.callback = function() {
        Li(a2, b2);
        "function" !== typeof d2 && (null === Ri ? Ri = /* @__PURE__ */ new Set([this]) : Ri.add(this));
        var c3 = b2.stack;
        this.componentDidCatch(b2.value, { componentStack: null !== c3 ? c3 : "" });
      });
      return c2;
    }
    function Si(a2, b2, c2) {
      var d2 = a2.pingCache;
      if (null === d2) {
        d2 = a2.pingCache = new Mi();
        var e2 = /* @__PURE__ */ new Set();
        d2.set(b2, e2);
      } else e2 = d2.get(b2), void 0 === e2 && (e2 = /* @__PURE__ */ new Set(), d2.set(b2, e2));
      e2.has(c2) || (e2.add(c2), a2 = Ti.bind(null, a2, b2, c2), b2.then(a2, a2));
    }
    function Ui(a2) {
      do {
        var b2;
        if (b2 = 13 === a2.tag) b2 = a2.memoizedState, b2 = null !== b2 ? null !== b2.dehydrated ? true : false : true;
        if (b2) return a2;
        a2 = a2.return;
      } while (null !== a2);
      return null;
    }
    function Vi(a2, b2, c2, d2, e2) {
      if (0 === (a2.mode & 1)) return a2 === b2 ? a2.flags |= 65536 : (a2.flags |= 128, c2.flags |= 131072, c2.flags &= -52805, 1 === c2.tag && (null === c2.alternate ? c2.tag = 17 : (b2 = mh(-1, 1), b2.tag = 2, nh(c2, b2, 1))), c2.lanes |= 1), a2;
      a2.flags |= 65536;
      a2.lanes = e2;
      return a2;
    }
    var Wi = ua.ReactCurrentOwner;
    var dh = false;
    function Xi(a2, b2, c2, d2) {
      b2.child = null === a2 ? Vg(b2, null, c2, d2) : Ug(b2, a2.child, c2, d2);
    }
    function Yi(a2, b2, c2, d2, e2) {
      c2 = c2.render;
      var f2 = b2.ref;
      ch(b2, e2);
      d2 = Nh(a2, b2, c2, d2, f2, e2);
      c2 = Sh();
      if (null !== a2 && !dh) return b2.updateQueue = a2.updateQueue, b2.flags &= -2053, a2.lanes &= ~e2, Zi(a2, b2, e2);
      I2 && c2 && vg(b2);
      b2.flags |= 1;
      Xi(a2, b2, d2, e2);
      return b2.child;
    }
    function $i(a2, b2, c2, d2, e2) {
      if (null === a2) {
        var f2 = c2.type;
        if ("function" === typeof f2 && !aj(f2) && void 0 === f2.defaultProps && null === c2.compare && void 0 === c2.defaultProps) return b2.tag = 15, b2.type = f2, bj(a2, b2, f2, d2, e2);
        a2 = Rg(c2.type, null, d2, b2, b2.mode, e2);
        a2.ref = b2.ref;
        a2.return = b2;
        return b2.child = a2;
      }
      f2 = a2.child;
      if (0 === (a2.lanes & e2)) {
        var g2 = f2.memoizedProps;
        c2 = c2.compare;
        c2 = null !== c2 ? c2 : Ie;
        if (c2(g2, d2) && a2.ref === b2.ref) return Zi(a2, b2, e2);
      }
      b2.flags |= 1;
      a2 = Pg(f2, d2);
      a2.ref = b2.ref;
      a2.return = b2;
      return b2.child = a2;
    }
    function bj(a2, b2, c2, d2, e2) {
      if (null !== a2) {
        var f2 = a2.memoizedProps;
        if (Ie(f2, d2) && a2.ref === b2.ref) if (dh = false, b2.pendingProps = d2 = f2, 0 !== (a2.lanes & e2)) 0 !== (a2.flags & 131072) && (dh = true);
        else return b2.lanes = a2.lanes, Zi(a2, b2, e2);
      }
      return cj(a2, b2, c2, d2, e2);
    }
    function dj(a2, b2, c2) {
      var d2 = b2.pendingProps, e2 = d2.children, f2 = null !== a2 ? a2.memoizedState : null;
      if ("hidden" === d2.mode) if (0 === (b2.mode & 1)) b2.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, G(ej, fj), fj |= c2;
      else {
        if (0 === (c2 & 1073741824)) return a2 = null !== f2 ? f2.baseLanes | c2 : c2, b2.lanes = b2.childLanes = 1073741824, b2.memoizedState = { baseLanes: a2, cachePool: null, transitions: null }, b2.updateQueue = null, G(ej, fj), fj |= a2, null;
        b2.memoizedState = { baseLanes: 0, cachePool: null, transitions: null };
        d2 = null !== f2 ? f2.baseLanes : c2;
        G(ej, fj);
        fj |= d2;
      }
      else null !== f2 ? (d2 = f2.baseLanes | c2, b2.memoizedState = null) : d2 = c2, G(ej, fj), fj |= d2;
      Xi(a2, b2, e2, c2);
      return b2.child;
    }
    function gj(a2, b2) {
      var c2 = b2.ref;
      if (null === a2 && null !== c2 || null !== a2 && a2.ref !== c2) b2.flags |= 512, b2.flags |= 2097152;
    }
    function cj(a2, b2, c2, d2, e2) {
      var f2 = Zf(c2) ? Xf : H2.current;
      f2 = Yf(b2, f2);
      ch(b2, e2);
      c2 = Nh(a2, b2, c2, d2, f2, e2);
      d2 = Sh();
      if (null !== a2 && !dh) return b2.updateQueue = a2.updateQueue, b2.flags &= -2053, a2.lanes &= ~e2, Zi(a2, b2, e2);
      I2 && d2 && vg(b2);
      b2.flags |= 1;
      Xi(a2, b2, c2, e2);
      return b2.child;
    }
    function hj(a2, b2, c2, d2, e2) {
      if (Zf(c2)) {
        var f2 = true;
        cg(b2);
      } else f2 = false;
      ch(b2, e2);
      if (null === b2.stateNode) ij(a2, b2), Gi(b2, c2, d2), Ii(b2, c2, d2, e2), d2 = true;
      else if (null === a2) {
        var g2 = b2.stateNode, h2 = b2.memoizedProps;
        g2.props = h2;
        var k2 = g2.context, l = c2.contextType;
        "object" === typeof l && null !== l ? l = eh(l) : (l = Zf(c2) ? Xf : H2.current, l = Yf(b2, l));
        var m2 = c2.getDerivedStateFromProps, q2 = "function" === typeof m2 || "function" === typeof g2.getSnapshotBeforeUpdate;
        q2 || "function" !== typeof g2.UNSAFE_componentWillReceiveProps && "function" !== typeof g2.componentWillReceiveProps || (h2 !== d2 || k2 !== l) && Hi(b2, g2, d2, l);
        jh = false;
        var r3 = b2.memoizedState;
        g2.state = r3;
        qh(b2, d2, g2, e2);
        k2 = b2.memoizedState;
        h2 !== d2 || r3 !== k2 || Wf.current || jh ? ("function" === typeof m2 && (Di(b2, c2, m2, d2), k2 = b2.memoizedState), (h2 = jh || Fi(b2, c2, h2, d2, r3, k2, l)) ? (q2 || "function" !== typeof g2.UNSAFE_componentWillMount && "function" !== typeof g2.componentWillMount || ("function" === typeof g2.componentWillMount && g2.componentWillMount(), "function" === typeof g2.UNSAFE_componentWillMount && g2.UNSAFE_componentWillMount()), "function" === typeof g2.componentDidMount && (b2.flags |= 4194308)) : ("function" === typeof g2.componentDidMount && (b2.flags |= 4194308), b2.memoizedProps = d2, b2.memoizedState = k2), g2.props = d2, g2.state = k2, g2.context = l, d2 = h2) : ("function" === typeof g2.componentDidMount && (b2.flags |= 4194308), d2 = false);
      } else {
        g2 = b2.stateNode;
        lh(a2, b2);
        h2 = b2.memoizedProps;
        l = b2.type === b2.elementType ? h2 : Ci(b2.type, h2);
        g2.props = l;
        q2 = b2.pendingProps;
        r3 = g2.context;
        k2 = c2.contextType;
        "object" === typeof k2 && null !== k2 ? k2 = eh(k2) : (k2 = Zf(c2) ? Xf : H2.current, k2 = Yf(b2, k2));
        var y2 = c2.getDerivedStateFromProps;
        (m2 = "function" === typeof y2 || "function" === typeof g2.getSnapshotBeforeUpdate) || "function" !== typeof g2.UNSAFE_componentWillReceiveProps && "function" !== typeof g2.componentWillReceiveProps || (h2 !== q2 || r3 !== k2) && Hi(b2, g2, d2, k2);
        jh = false;
        r3 = b2.memoizedState;
        g2.state = r3;
        qh(b2, d2, g2, e2);
        var n2 = b2.memoizedState;
        h2 !== q2 || r3 !== n2 || Wf.current || jh ? ("function" === typeof y2 && (Di(b2, c2, y2, d2), n2 = b2.memoizedState), (l = jh || Fi(b2, c2, l, d2, r3, n2, k2) || false) ? (m2 || "function" !== typeof g2.UNSAFE_componentWillUpdate && "function" !== typeof g2.componentWillUpdate || ("function" === typeof g2.componentWillUpdate && g2.componentWillUpdate(d2, n2, k2), "function" === typeof g2.UNSAFE_componentWillUpdate && g2.UNSAFE_componentWillUpdate(d2, n2, k2)), "function" === typeof g2.componentDidUpdate && (b2.flags |= 4), "function" === typeof g2.getSnapshotBeforeUpdate && (b2.flags |= 1024)) : ("function" !== typeof g2.componentDidUpdate || h2 === a2.memoizedProps && r3 === a2.memoizedState || (b2.flags |= 4), "function" !== typeof g2.getSnapshotBeforeUpdate || h2 === a2.memoizedProps && r3 === a2.memoizedState || (b2.flags |= 1024), b2.memoizedProps = d2, b2.memoizedState = n2), g2.props = d2, g2.state = n2, g2.context = k2, d2 = l) : ("function" !== typeof g2.componentDidUpdate || h2 === a2.memoizedProps && r3 === a2.memoizedState || (b2.flags |= 4), "function" !== typeof g2.getSnapshotBeforeUpdate || h2 === a2.memoizedProps && r3 === a2.memoizedState || (b2.flags |= 1024), d2 = false);
      }
      return jj(a2, b2, c2, d2, f2, e2);
    }
    function jj(a2, b2, c2, d2, e2, f2) {
      gj(a2, b2);
      var g2 = 0 !== (b2.flags & 128);
      if (!d2 && !g2) return e2 && dg(b2, c2, false), Zi(a2, b2, f2);
      d2 = b2.stateNode;
      Wi.current = b2;
      var h2 = g2 && "function" !== typeof c2.getDerivedStateFromError ? null : d2.render();
      b2.flags |= 1;
      null !== a2 && g2 ? (b2.child = Ug(b2, a2.child, null, f2), b2.child = Ug(b2, null, h2, f2)) : Xi(a2, b2, h2, f2);
      b2.memoizedState = d2.state;
      e2 && dg(b2, c2, true);
      return b2.child;
    }
    function kj(a2) {
      var b2 = a2.stateNode;
      b2.pendingContext ? ag(a2, b2.pendingContext, b2.pendingContext !== b2.context) : b2.context && ag(a2, b2.context, false);
      yh(a2, b2.containerInfo);
    }
    function lj(a2, b2, c2, d2, e2) {
      Ig();
      Jg(e2);
      b2.flags |= 256;
      Xi(a2, b2, c2, d2);
      return b2.child;
    }
    var mj = { dehydrated: null, treeContext: null, retryLane: 0 };
    function nj(a2) {
      return { baseLanes: a2, cachePool: null, transitions: null };
    }
    function oj(a2, b2, c2) {
      var d2 = b2.pendingProps, e2 = L2.current, f2 = false, g2 = 0 !== (b2.flags & 128), h2;
      (h2 = g2) || (h2 = null !== a2 && null === a2.memoizedState ? false : 0 !== (e2 & 2));
      if (h2) f2 = true, b2.flags &= -129;
      else if (null === a2 || null !== a2.memoizedState) e2 |= 1;
      G(L2, e2 & 1);
      if (null === a2) {
        Eg(b2);
        a2 = b2.memoizedState;
        if (null !== a2 && (a2 = a2.dehydrated, null !== a2)) return 0 === (b2.mode & 1) ? b2.lanes = 1 : "$!" === a2.data ? b2.lanes = 8 : b2.lanes = 1073741824, null;
        g2 = d2.children;
        a2 = d2.fallback;
        return f2 ? (d2 = b2.mode, f2 = b2.child, g2 = { mode: "hidden", children: g2 }, 0 === (d2 & 1) && null !== f2 ? (f2.childLanes = 0, f2.pendingProps = g2) : f2 = pj(g2, d2, 0, null), a2 = Tg(a2, d2, c2, null), f2.return = b2, a2.return = b2, f2.sibling = a2, b2.child = f2, b2.child.memoizedState = nj(c2), b2.memoizedState = mj, a2) : qj(b2, g2);
      }
      e2 = a2.memoizedState;
      if (null !== e2 && (h2 = e2.dehydrated, null !== h2)) return rj(a2, b2, g2, d2, h2, e2, c2);
      if (f2) {
        f2 = d2.fallback;
        g2 = b2.mode;
        e2 = a2.child;
        h2 = e2.sibling;
        var k2 = { mode: "hidden", children: d2.children };
        0 === (g2 & 1) && b2.child !== e2 ? (d2 = b2.child, d2.childLanes = 0, d2.pendingProps = k2, b2.deletions = null) : (d2 = Pg(e2, k2), d2.subtreeFlags = e2.subtreeFlags & 14680064);
        null !== h2 ? f2 = Pg(h2, f2) : (f2 = Tg(f2, g2, c2, null), f2.flags |= 2);
        f2.return = b2;
        d2.return = b2;
        d2.sibling = f2;
        b2.child = d2;
        d2 = f2;
        f2 = b2.child;
        g2 = a2.child.memoizedState;
        g2 = null === g2 ? nj(c2) : { baseLanes: g2.baseLanes | c2, cachePool: null, transitions: g2.transitions };
        f2.memoizedState = g2;
        f2.childLanes = a2.childLanes & ~c2;
        b2.memoizedState = mj;
        return d2;
      }
      f2 = a2.child;
      a2 = f2.sibling;
      d2 = Pg(f2, { mode: "visible", children: d2.children });
      0 === (b2.mode & 1) && (d2.lanes = c2);
      d2.return = b2;
      d2.sibling = null;
      null !== a2 && (c2 = b2.deletions, null === c2 ? (b2.deletions = [a2], b2.flags |= 16) : c2.push(a2));
      b2.child = d2;
      b2.memoizedState = null;
      return d2;
    }
    function qj(a2, b2) {
      b2 = pj({ mode: "visible", children: b2 }, a2.mode, 0, null);
      b2.return = a2;
      return a2.child = b2;
    }
    function sj(a2, b2, c2, d2) {
      null !== d2 && Jg(d2);
      Ug(b2, a2.child, null, c2);
      a2 = qj(b2, b2.pendingProps.children);
      a2.flags |= 2;
      b2.memoizedState = null;
      return a2;
    }
    function rj(a2, b2, c2, d2, e2, f2, g2) {
      if (c2) {
        if (b2.flags & 256) return b2.flags &= -257, d2 = Ki(Error(p2(422))), sj(a2, b2, g2, d2);
        if (null !== b2.memoizedState) return b2.child = a2.child, b2.flags |= 128, null;
        f2 = d2.fallback;
        e2 = b2.mode;
        d2 = pj({ mode: "visible", children: d2.children }, e2, 0, null);
        f2 = Tg(f2, e2, g2, null);
        f2.flags |= 2;
        d2.return = b2;
        f2.return = b2;
        d2.sibling = f2;
        b2.child = d2;
        0 !== (b2.mode & 1) && Ug(b2, a2.child, null, g2);
        b2.child.memoizedState = nj(g2);
        b2.memoizedState = mj;
        return f2;
      }
      if (0 === (b2.mode & 1)) return sj(a2, b2, g2, null);
      if ("$!" === e2.data) {
        d2 = e2.nextSibling && e2.nextSibling.dataset;
        if (d2) var h2 = d2.dgst;
        d2 = h2;
        f2 = Error(p2(419));
        d2 = Ki(f2, d2, void 0);
        return sj(a2, b2, g2, d2);
      }
      h2 = 0 !== (g2 & a2.childLanes);
      if (dh || h2) {
        d2 = Q2;
        if (null !== d2) {
          switch (g2 & -g2) {
            case 4:
              e2 = 2;
              break;
            case 16:
              e2 = 8;
              break;
            case 64:
            case 128:
            case 256:
            case 512:
            case 1024:
            case 2048:
            case 4096:
            case 8192:
            case 16384:
            case 32768:
            case 65536:
            case 131072:
            case 262144:
            case 524288:
            case 1048576:
            case 2097152:
            case 4194304:
            case 8388608:
            case 16777216:
            case 33554432:
            case 67108864:
              e2 = 32;
              break;
            case 536870912:
              e2 = 268435456;
              break;
            default:
              e2 = 0;
          }
          e2 = 0 !== (e2 & (d2.suspendedLanes | g2)) ? 0 : e2;
          0 !== e2 && e2 !== f2.retryLane && (f2.retryLane = e2, ih(a2, e2), gi(d2, a2, e2, -1));
        }
        tj();
        d2 = Ki(Error(p2(421)));
        return sj(a2, b2, g2, d2);
      }
      if ("$?" === e2.data) return b2.flags |= 128, b2.child = a2.child, b2 = uj.bind(null, a2), e2._reactRetry = b2, null;
      a2 = f2.treeContext;
      yg = Lf(e2.nextSibling);
      xg = b2;
      I2 = true;
      zg = null;
      null !== a2 && (og[pg++] = rg, og[pg++] = sg, og[pg++] = qg, rg = a2.id, sg = a2.overflow, qg = b2);
      b2 = qj(b2, d2.children);
      b2.flags |= 4096;
      return b2;
    }
    function vj(a2, b2, c2) {
      a2.lanes |= b2;
      var d2 = a2.alternate;
      null !== d2 && (d2.lanes |= b2);
      bh(a2.return, b2, c2);
    }
    function wj(a2, b2, c2, d2, e2) {
      var f2 = a2.memoizedState;
      null === f2 ? a2.memoizedState = { isBackwards: b2, rendering: null, renderingStartTime: 0, last: d2, tail: c2, tailMode: e2 } : (f2.isBackwards = b2, f2.rendering = null, f2.renderingStartTime = 0, f2.last = d2, f2.tail = c2, f2.tailMode = e2);
    }
    function xj(a2, b2, c2) {
      var d2 = b2.pendingProps, e2 = d2.revealOrder, f2 = d2.tail;
      Xi(a2, b2, d2.children, c2);
      d2 = L2.current;
      if (0 !== (d2 & 2)) d2 = d2 & 1 | 2, b2.flags |= 128;
      else {
        if (null !== a2 && 0 !== (a2.flags & 128)) a: for (a2 = b2.child; null !== a2; ) {
          if (13 === a2.tag) null !== a2.memoizedState && vj(a2, c2, b2);
          else if (19 === a2.tag) vj(a2, c2, b2);
          else if (null !== a2.child) {
            a2.child.return = a2;
            a2 = a2.child;
            continue;
          }
          if (a2 === b2) break a;
          for (; null === a2.sibling; ) {
            if (null === a2.return || a2.return === b2) break a;
            a2 = a2.return;
          }
          a2.sibling.return = a2.return;
          a2 = a2.sibling;
        }
        d2 &= 1;
      }
      G(L2, d2);
      if (0 === (b2.mode & 1)) b2.memoizedState = null;
      else switch (e2) {
        case "forwards":
          c2 = b2.child;
          for (e2 = null; null !== c2; ) a2 = c2.alternate, null !== a2 && null === Ch(a2) && (e2 = c2), c2 = c2.sibling;
          c2 = e2;
          null === c2 ? (e2 = b2.child, b2.child = null) : (e2 = c2.sibling, c2.sibling = null);
          wj(b2, false, e2, c2, f2);
          break;
        case "backwards":
          c2 = null;
          e2 = b2.child;
          for (b2.child = null; null !== e2; ) {
            a2 = e2.alternate;
            if (null !== a2 && null === Ch(a2)) {
              b2.child = e2;
              break;
            }
            a2 = e2.sibling;
            e2.sibling = c2;
            c2 = e2;
            e2 = a2;
          }
          wj(b2, true, c2, null, f2);
          break;
        case "together":
          wj(b2, false, null, null, void 0);
          break;
        default:
          b2.memoizedState = null;
      }
      return b2.child;
    }
    function ij(a2, b2) {
      0 === (b2.mode & 1) && null !== a2 && (a2.alternate = null, b2.alternate = null, b2.flags |= 2);
    }
    function Zi(a2, b2, c2) {
      null !== a2 && (b2.dependencies = a2.dependencies);
      rh |= b2.lanes;
      if (0 === (c2 & b2.childLanes)) return null;
      if (null !== a2 && b2.child !== a2.child) throw Error(p2(153));
      if (null !== b2.child) {
        a2 = b2.child;
        c2 = Pg(a2, a2.pendingProps);
        b2.child = c2;
        for (c2.return = b2; null !== a2.sibling; ) a2 = a2.sibling, c2 = c2.sibling = Pg(a2, a2.pendingProps), c2.return = b2;
        c2.sibling = null;
      }
      return b2.child;
    }
    function yj(a2, b2, c2) {
      switch (b2.tag) {
        case 3:
          kj(b2);
          Ig();
          break;
        case 5:
          Ah(b2);
          break;
        case 1:
          Zf(b2.type) && cg(b2);
          break;
        case 4:
          yh(b2, b2.stateNode.containerInfo);
          break;
        case 10:
          var d2 = b2.type._context, e2 = b2.memoizedProps.value;
          G(Wg, d2._currentValue);
          d2._currentValue = e2;
          break;
        case 13:
          d2 = b2.memoizedState;
          if (null !== d2) {
            if (null !== d2.dehydrated) return G(L2, L2.current & 1), b2.flags |= 128, null;
            if (0 !== (c2 & b2.child.childLanes)) return oj(a2, b2, c2);
            G(L2, L2.current & 1);
            a2 = Zi(a2, b2, c2);
            return null !== a2 ? a2.sibling : null;
          }
          G(L2, L2.current & 1);
          break;
        case 19:
          d2 = 0 !== (c2 & b2.childLanes);
          if (0 !== (a2.flags & 128)) {
            if (d2) return xj(a2, b2, c2);
            b2.flags |= 128;
          }
          e2 = b2.memoizedState;
          null !== e2 && (e2.rendering = null, e2.tail = null, e2.lastEffect = null);
          G(L2, L2.current);
          if (d2) break;
          else return null;
        case 22:
        case 23:
          return b2.lanes = 0, dj(a2, b2, c2);
      }
      return Zi(a2, b2, c2);
    }
    var zj;
    var Aj;
    var Bj;
    var Cj;
    zj = function(a2, b2) {
      for (var c2 = b2.child; null !== c2; ) {
        if (5 === c2.tag || 6 === c2.tag) a2.appendChild(c2.stateNode);
        else if (4 !== c2.tag && null !== c2.child) {
          c2.child.return = c2;
          c2 = c2.child;
          continue;
        }
        if (c2 === b2) break;
        for (; null === c2.sibling; ) {
          if (null === c2.return || c2.return === b2) return;
          c2 = c2.return;
        }
        c2.sibling.return = c2.return;
        c2 = c2.sibling;
      }
    };
    Aj = function() {
    };
    Bj = function(a2, b2, c2, d2) {
      var e2 = a2.memoizedProps;
      if (e2 !== d2) {
        a2 = b2.stateNode;
        xh(uh.current);
        var f2 = null;
        switch (c2) {
          case "input":
            e2 = Ya(a2, e2);
            d2 = Ya(a2, d2);
            f2 = [];
            break;
          case "select":
            e2 = A2({}, e2, { value: void 0 });
            d2 = A2({}, d2, { value: void 0 });
            f2 = [];
            break;
          case "textarea":
            e2 = gb(a2, e2);
            d2 = gb(a2, d2);
            f2 = [];
            break;
          default:
            "function" !== typeof e2.onClick && "function" === typeof d2.onClick && (a2.onclick = Bf);
        }
        ub(c2, d2);
        var g2;
        c2 = null;
        for (l in e2) if (!d2.hasOwnProperty(l) && e2.hasOwnProperty(l) && null != e2[l]) if ("style" === l) {
          var h2 = e2[l];
          for (g2 in h2) h2.hasOwnProperty(g2) && (c2 || (c2 = {}), c2[g2] = "");
        } else "dangerouslySetInnerHTML" !== l && "children" !== l && "suppressContentEditableWarning" !== l && "suppressHydrationWarning" !== l && "autoFocus" !== l && (ea.hasOwnProperty(l) ? f2 || (f2 = []) : (f2 = f2 || []).push(l, null));
        for (l in d2) {
          var k2 = d2[l];
          h2 = null != e2 ? e2[l] : void 0;
          if (d2.hasOwnProperty(l) && k2 !== h2 && (null != k2 || null != h2)) if ("style" === l) if (h2) {
            for (g2 in h2) !h2.hasOwnProperty(g2) || k2 && k2.hasOwnProperty(g2) || (c2 || (c2 = {}), c2[g2] = "");
            for (g2 in k2) k2.hasOwnProperty(g2) && h2[g2] !== k2[g2] && (c2 || (c2 = {}), c2[g2] = k2[g2]);
          } else c2 || (f2 || (f2 = []), f2.push(
            l,
            c2
          )), c2 = k2;
          else "dangerouslySetInnerHTML" === l ? (k2 = k2 ? k2.__html : void 0, h2 = h2 ? h2.__html : void 0, null != k2 && h2 !== k2 && (f2 = f2 || []).push(l, k2)) : "children" === l ? "string" !== typeof k2 && "number" !== typeof k2 || (f2 = f2 || []).push(l, "" + k2) : "suppressContentEditableWarning" !== l && "suppressHydrationWarning" !== l && (ea.hasOwnProperty(l) ? (null != k2 && "onScroll" === l && D2("scroll", a2), f2 || h2 === k2 || (f2 = [])) : (f2 = f2 || []).push(l, k2));
        }
        c2 && (f2 = f2 || []).push("style", c2);
        var l = f2;
        if (b2.updateQueue = l) b2.flags |= 4;
      }
    };
    Cj = function(a2, b2, c2, d2) {
      c2 !== d2 && (b2.flags |= 4);
    };
    function Dj(a2, b2) {
      if (!I2) switch (a2.tailMode) {
        case "hidden":
          b2 = a2.tail;
          for (var c2 = null; null !== b2; ) null !== b2.alternate && (c2 = b2), b2 = b2.sibling;
          null === c2 ? a2.tail = null : c2.sibling = null;
          break;
        case "collapsed":
          c2 = a2.tail;
          for (var d2 = null; null !== c2; ) null !== c2.alternate && (d2 = c2), c2 = c2.sibling;
          null === d2 ? b2 || null === a2.tail ? a2.tail = null : a2.tail.sibling = null : d2.sibling = null;
      }
    }
    function S2(a2) {
      var b2 = null !== a2.alternate && a2.alternate.child === a2.child, c2 = 0, d2 = 0;
      if (b2) for (var e2 = a2.child; null !== e2; ) c2 |= e2.lanes | e2.childLanes, d2 |= e2.subtreeFlags & 14680064, d2 |= e2.flags & 14680064, e2.return = a2, e2 = e2.sibling;
      else for (e2 = a2.child; null !== e2; ) c2 |= e2.lanes | e2.childLanes, d2 |= e2.subtreeFlags, d2 |= e2.flags, e2.return = a2, e2 = e2.sibling;
      a2.subtreeFlags |= d2;
      a2.childLanes = c2;
      return b2;
    }
    function Ej(a2, b2, c2) {
      var d2 = b2.pendingProps;
      wg(b2);
      switch (b2.tag) {
        case 2:
        case 16:
        case 15:
        case 0:
        case 11:
        case 7:
        case 8:
        case 12:
        case 9:
        case 14:
          return S2(b2), null;
        case 1:
          return Zf(b2.type) && $f(), S2(b2), null;
        case 3:
          d2 = b2.stateNode;
          zh();
          E2(Wf);
          E2(H2);
          Eh();
          d2.pendingContext && (d2.context = d2.pendingContext, d2.pendingContext = null);
          if (null === a2 || null === a2.child) Gg(b2) ? b2.flags |= 4 : null === a2 || a2.memoizedState.isDehydrated && 0 === (b2.flags & 256) || (b2.flags |= 1024, null !== zg && (Fj(zg), zg = null));
          Aj(a2, b2);
          S2(b2);
          return null;
        case 5:
          Bh(b2);
          var e2 = xh(wh.current);
          c2 = b2.type;
          if (null !== a2 && null != b2.stateNode) Bj(a2, b2, c2, d2, e2), a2.ref !== b2.ref && (b2.flags |= 512, b2.flags |= 2097152);
          else {
            if (!d2) {
              if (null === b2.stateNode) throw Error(p2(166));
              S2(b2);
              return null;
            }
            a2 = xh(uh.current);
            if (Gg(b2)) {
              d2 = b2.stateNode;
              c2 = b2.type;
              var f2 = b2.memoizedProps;
              d2[Of] = b2;
              d2[Pf] = f2;
              a2 = 0 !== (b2.mode & 1);
              switch (c2) {
                case "dialog":
                  D2("cancel", d2);
                  D2("close", d2);
                  break;
                case "iframe":
                case "object":
                case "embed":
                  D2("load", d2);
                  break;
                case "video":
                case "audio":
                  for (e2 = 0; e2 < lf.length; e2++) D2(lf[e2], d2);
                  break;
                case "source":
                  D2("error", d2);
                  break;
                case "img":
                case "image":
                case "link":
                  D2(
                    "error",
                    d2
                  );
                  D2("load", d2);
                  break;
                case "details":
                  D2("toggle", d2);
                  break;
                case "input":
                  Za(d2, f2);
                  D2("invalid", d2);
                  break;
                case "select":
                  d2._wrapperState = { wasMultiple: !!f2.multiple };
                  D2("invalid", d2);
                  break;
                case "textarea":
                  hb(d2, f2), D2("invalid", d2);
              }
              ub(c2, f2);
              e2 = null;
              for (var g2 in f2) if (f2.hasOwnProperty(g2)) {
                var h2 = f2[g2];
                "children" === g2 ? "string" === typeof h2 ? d2.textContent !== h2 && (true !== f2.suppressHydrationWarning && Af(d2.textContent, h2, a2), e2 = ["children", h2]) : "number" === typeof h2 && d2.textContent !== "" + h2 && (true !== f2.suppressHydrationWarning && Af(
                  d2.textContent,
                  h2,
                  a2
                ), e2 = ["children", "" + h2]) : ea.hasOwnProperty(g2) && null != h2 && "onScroll" === g2 && D2("scroll", d2);
              }
              switch (c2) {
                case "input":
                  Va(d2);
                  db(d2, f2, true);
                  break;
                case "textarea":
                  Va(d2);
                  jb(d2);
                  break;
                case "select":
                case "option":
                  break;
                default:
                  "function" === typeof f2.onClick && (d2.onclick = Bf);
              }
              d2 = e2;
              b2.updateQueue = d2;
              null !== d2 && (b2.flags |= 4);
            } else {
              g2 = 9 === e2.nodeType ? e2 : e2.ownerDocument;
              "http://www.w3.org/1999/xhtml" === a2 && (a2 = kb(c2));
              "http://www.w3.org/1999/xhtml" === a2 ? "script" === c2 ? (a2 = g2.createElement("div"), a2.innerHTML = "<script><\/script>", a2 = a2.removeChild(a2.firstChild)) : "string" === typeof d2.is ? a2 = g2.createElement(c2, { is: d2.is }) : (a2 = g2.createElement(c2), "select" === c2 && (g2 = a2, d2.multiple ? g2.multiple = true : d2.size && (g2.size = d2.size))) : a2 = g2.createElementNS(a2, c2);
              a2[Of] = b2;
              a2[Pf] = d2;
              zj(a2, b2, false, false);
              b2.stateNode = a2;
              a: {
                g2 = vb(c2, d2);
                switch (c2) {
                  case "dialog":
                    D2("cancel", a2);
                    D2("close", a2);
                    e2 = d2;
                    break;
                  case "iframe":
                  case "object":
                  case "embed":
                    D2("load", a2);
                    e2 = d2;
                    break;
                  case "video":
                  case "audio":
                    for (e2 = 0; e2 < lf.length; e2++) D2(lf[e2], a2);
                    e2 = d2;
                    break;
                  case "source":
                    D2("error", a2);
                    e2 = d2;
                    break;
                  case "img":
                  case "image":
                  case "link":
                    D2(
                      "error",
                      a2
                    );
                    D2("load", a2);
                    e2 = d2;
                    break;
                  case "details":
                    D2("toggle", a2);
                    e2 = d2;
                    break;
                  case "input":
                    Za(a2, d2);
                    e2 = Ya(a2, d2);
                    D2("invalid", a2);
                    break;
                  case "option":
                    e2 = d2;
                    break;
                  case "select":
                    a2._wrapperState = { wasMultiple: !!d2.multiple };
                    e2 = A2({}, d2, { value: void 0 });
                    D2("invalid", a2);
                    break;
                  case "textarea":
                    hb(a2, d2);
                    e2 = gb(a2, d2);
                    D2("invalid", a2);
                    break;
                  default:
                    e2 = d2;
                }
                ub(c2, e2);
                h2 = e2;
                for (f2 in h2) if (h2.hasOwnProperty(f2)) {
                  var k2 = h2[f2];
                  "style" === f2 ? sb(a2, k2) : "dangerouslySetInnerHTML" === f2 ? (k2 = k2 ? k2.__html : void 0, null != k2 && nb(a2, k2)) : "children" === f2 ? "string" === typeof k2 ? ("textarea" !== c2 || "" !== k2) && ob(a2, k2) : "number" === typeof k2 && ob(a2, "" + k2) : "suppressContentEditableWarning" !== f2 && "suppressHydrationWarning" !== f2 && "autoFocus" !== f2 && (ea.hasOwnProperty(f2) ? null != k2 && "onScroll" === f2 && D2("scroll", a2) : null != k2 && ta(a2, f2, k2, g2));
                }
                switch (c2) {
                  case "input":
                    Va(a2);
                    db(a2, d2, false);
                    break;
                  case "textarea":
                    Va(a2);
                    jb(a2);
                    break;
                  case "option":
                    null != d2.value && a2.setAttribute("value", "" + Sa(d2.value));
                    break;
                  case "select":
                    a2.multiple = !!d2.multiple;
                    f2 = d2.value;
                    null != f2 ? fb(a2, !!d2.multiple, f2, false) : null != d2.defaultValue && fb(
                      a2,
                      !!d2.multiple,
                      d2.defaultValue,
                      true
                    );
                    break;
                  default:
                    "function" === typeof e2.onClick && (a2.onclick = Bf);
                }
                switch (c2) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    d2 = !!d2.autoFocus;
                    break a;
                  case "img":
                    d2 = true;
                    break a;
                  default:
                    d2 = false;
                }
              }
              d2 && (b2.flags |= 4);
            }
            null !== b2.ref && (b2.flags |= 512, b2.flags |= 2097152);
          }
          S2(b2);
          return null;
        case 6:
          if (a2 && null != b2.stateNode) Cj(a2, b2, a2.memoizedProps, d2);
          else {
            if ("string" !== typeof d2 && null === b2.stateNode) throw Error(p2(166));
            c2 = xh(wh.current);
            xh(uh.current);
            if (Gg(b2)) {
              d2 = b2.stateNode;
              c2 = b2.memoizedProps;
              d2[Of] = b2;
              if (f2 = d2.nodeValue !== c2) {
                if (a2 = xg, null !== a2) switch (a2.tag) {
                  case 3:
                    Af(d2.nodeValue, c2, 0 !== (a2.mode & 1));
                    break;
                  case 5:
                    true !== a2.memoizedProps.suppressHydrationWarning && Af(d2.nodeValue, c2, 0 !== (a2.mode & 1));
                }
              }
              f2 && (b2.flags |= 4);
            } else d2 = (9 === c2.nodeType ? c2 : c2.ownerDocument).createTextNode(d2), d2[Of] = b2, b2.stateNode = d2;
          }
          S2(b2);
          return null;
        case 13:
          E2(L2);
          d2 = b2.memoizedState;
          if (null === a2 || null !== a2.memoizedState && null !== a2.memoizedState.dehydrated) {
            if (I2 && null !== yg && 0 !== (b2.mode & 1) && 0 === (b2.flags & 128)) Hg(), Ig(), b2.flags |= 98560, f2 = false;
            else if (f2 = Gg(b2), null !== d2 && null !== d2.dehydrated) {
              if (null === a2) {
                if (!f2) throw Error(p2(318));
                f2 = b2.memoizedState;
                f2 = null !== f2 ? f2.dehydrated : null;
                if (!f2) throw Error(p2(317));
                f2[Of] = b2;
              } else Ig(), 0 === (b2.flags & 128) && (b2.memoizedState = null), b2.flags |= 4;
              S2(b2);
              f2 = false;
            } else null !== zg && (Fj(zg), zg = null), f2 = true;
            if (!f2) return b2.flags & 65536 ? b2 : null;
          }
          if (0 !== (b2.flags & 128)) return b2.lanes = c2, b2;
          d2 = null !== d2;
          d2 !== (null !== a2 && null !== a2.memoizedState) && d2 && (b2.child.flags |= 8192, 0 !== (b2.mode & 1) && (null === a2 || 0 !== (L2.current & 1) ? 0 === T2 && (T2 = 3) : tj()));
          null !== b2.updateQueue && (b2.flags |= 4);
          S2(b2);
          return null;
        case 4:
          return zh(), Aj(a2, b2), null === a2 && sf(b2.stateNode.containerInfo), S2(b2), null;
        case 10:
          return ah(b2.type._context), S2(b2), null;
        case 17:
          return Zf(b2.type) && $f(), S2(b2), null;
        case 19:
          E2(L2);
          f2 = b2.memoizedState;
          if (null === f2) return S2(b2), null;
          d2 = 0 !== (b2.flags & 128);
          g2 = f2.rendering;
          if (null === g2) if (d2) Dj(f2, false);
          else {
            if (0 !== T2 || null !== a2 && 0 !== (a2.flags & 128)) for (a2 = b2.child; null !== a2; ) {
              g2 = Ch(a2);
              if (null !== g2) {
                b2.flags |= 128;
                Dj(f2, false);
                d2 = g2.updateQueue;
                null !== d2 && (b2.updateQueue = d2, b2.flags |= 4);
                b2.subtreeFlags = 0;
                d2 = c2;
                for (c2 = b2.child; null !== c2; ) f2 = c2, a2 = d2, f2.flags &= 14680066, g2 = f2.alternate, null === g2 ? (f2.childLanes = 0, f2.lanes = a2, f2.child = null, f2.subtreeFlags = 0, f2.memoizedProps = null, f2.memoizedState = null, f2.updateQueue = null, f2.dependencies = null, f2.stateNode = null) : (f2.childLanes = g2.childLanes, f2.lanes = g2.lanes, f2.child = g2.child, f2.subtreeFlags = 0, f2.deletions = null, f2.memoizedProps = g2.memoizedProps, f2.memoizedState = g2.memoizedState, f2.updateQueue = g2.updateQueue, f2.type = g2.type, a2 = g2.dependencies, f2.dependencies = null === a2 ? null : { lanes: a2.lanes, firstContext: a2.firstContext }), c2 = c2.sibling;
                G(L2, L2.current & 1 | 2);
                return b2.child;
              }
              a2 = a2.sibling;
            }
            null !== f2.tail && B2() > Gj && (b2.flags |= 128, d2 = true, Dj(f2, false), b2.lanes = 4194304);
          }
          else {
            if (!d2) if (a2 = Ch(g2), null !== a2) {
              if (b2.flags |= 128, d2 = true, c2 = a2.updateQueue, null !== c2 && (b2.updateQueue = c2, b2.flags |= 4), Dj(f2, true), null === f2.tail && "hidden" === f2.tailMode && !g2.alternate && !I2) return S2(b2), null;
            } else 2 * B2() - f2.renderingStartTime > Gj && 1073741824 !== c2 && (b2.flags |= 128, d2 = true, Dj(f2, false), b2.lanes = 4194304);
            f2.isBackwards ? (g2.sibling = b2.child, b2.child = g2) : (c2 = f2.last, null !== c2 ? c2.sibling = g2 : b2.child = g2, f2.last = g2);
          }
          if (null !== f2.tail) return b2 = f2.tail, f2.rendering = b2, f2.tail = b2.sibling, f2.renderingStartTime = B2(), b2.sibling = null, c2 = L2.current, G(L2, d2 ? c2 & 1 | 2 : c2 & 1), b2;
          S2(b2);
          return null;
        case 22:
        case 23:
          return Hj(), d2 = null !== b2.memoizedState, null !== a2 && null !== a2.memoizedState !== d2 && (b2.flags |= 8192), d2 && 0 !== (b2.mode & 1) ? 0 !== (fj & 1073741824) && (S2(b2), b2.subtreeFlags & 6 && (b2.flags |= 8192)) : S2(b2), null;
        case 24:
          return null;
        case 25:
          return null;
      }
      throw Error(p2(156, b2.tag));
    }
    function Ij(a2, b2) {
      wg(b2);
      switch (b2.tag) {
        case 1:
          return Zf(b2.type) && $f(), a2 = b2.flags, a2 & 65536 ? (b2.flags = a2 & -65537 | 128, b2) : null;
        case 3:
          return zh(), E2(Wf), E2(H2), Eh(), a2 = b2.flags, 0 !== (a2 & 65536) && 0 === (a2 & 128) ? (b2.flags = a2 & -65537 | 128, b2) : null;
        case 5:
          return Bh(b2), null;
        case 13:
          E2(L2);
          a2 = b2.memoizedState;
          if (null !== a2 && null !== a2.dehydrated) {
            if (null === b2.alternate) throw Error(p2(340));
            Ig();
          }
          a2 = b2.flags;
          return a2 & 65536 ? (b2.flags = a2 & -65537 | 128, b2) : null;
        case 19:
          return E2(L2), null;
        case 4:
          return zh(), null;
        case 10:
          return ah(b2.type._context), null;
        case 22:
        case 23:
          return Hj(), null;
        case 24:
          return null;
        default:
          return null;
      }
    }
    var Jj = false;
    var U = false;
    var Kj = "function" === typeof WeakSet ? WeakSet : Set;
    var V = null;
    function Lj(a2, b2) {
      var c2 = a2.ref;
      if (null !== c2) if ("function" === typeof c2) try {
        c2(null);
      } catch (d2) {
        W(a2, b2, d2);
      }
      else c2.current = null;
    }
    function Mj(a2, b2, c2) {
      try {
        c2();
      } catch (d2) {
        W(a2, b2, d2);
      }
    }
    var Nj = false;
    function Oj(a2, b2) {
      Cf = dd;
      a2 = Me();
      if (Ne(a2)) {
        if ("selectionStart" in a2) var c2 = { start: a2.selectionStart, end: a2.selectionEnd };
        else a: {
          c2 = (c2 = a2.ownerDocument) && c2.defaultView || window;
          var d2 = c2.getSelection && c2.getSelection();
          if (d2 && 0 !== d2.rangeCount) {
            c2 = d2.anchorNode;
            var e2 = d2.anchorOffset, f2 = d2.focusNode;
            d2 = d2.focusOffset;
            try {
              c2.nodeType, f2.nodeType;
            } catch (F2) {
              c2 = null;
              break a;
            }
            var g2 = 0, h2 = -1, k2 = -1, l = 0, m2 = 0, q2 = a2, r3 = null;
            b: for (; ; ) {
              for (var y2; ; ) {
                q2 !== c2 || 0 !== e2 && 3 !== q2.nodeType || (h2 = g2 + e2);
                q2 !== f2 || 0 !== d2 && 3 !== q2.nodeType || (k2 = g2 + d2);
                3 === q2.nodeType && (g2 += q2.nodeValue.length);
                if (null === (y2 = q2.firstChild)) break;
                r3 = q2;
                q2 = y2;
              }
              for (; ; ) {
                if (q2 === a2) break b;
                r3 === c2 && ++l === e2 && (h2 = g2);
                r3 === f2 && ++m2 === d2 && (k2 = g2);
                if (null !== (y2 = q2.nextSibling)) break;
                q2 = r3;
                r3 = q2.parentNode;
              }
              q2 = y2;
            }
            c2 = -1 === h2 || -1 === k2 ? null : { start: h2, end: k2 };
          } else c2 = null;
        }
        c2 = c2 || { start: 0, end: 0 };
      } else c2 = null;
      Df = { focusedElem: a2, selectionRange: c2 };
      dd = false;
      for (V = b2; null !== V; ) if (b2 = V, a2 = b2.child, 0 !== (b2.subtreeFlags & 1028) && null !== a2) a2.return = b2, V = a2;
      else for (; null !== V; ) {
        b2 = V;
        try {
          var n2 = b2.alternate;
          if (0 !== (b2.flags & 1024)) switch (b2.tag) {
            case 0:
            case 11:
            case 15:
              break;
            case 1:
              if (null !== n2) {
                var t3 = n2.memoizedProps, J = n2.memoizedState, x2 = b2.stateNode, w2 = x2.getSnapshotBeforeUpdate(b2.elementType === b2.type ? t3 : Ci(b2.type, t3), J);
                x2.__reactInternalSnapshotBeforeUpdate = w2;
              }
              break;
            case 3:
              var u2 = b2.stateNode.containerInfo;
              1 === u2.nodeType ? u2.textContent = "" : 9 === u2.nodeType && u2.documentElement && u2.removeChild(u2.documentElement);
              break;
            case 5:
            case 6:
            case 4:
            case 17:
              break;
            default:
              throw Error(p2(163));
          }
        } catch (F2) {
          W(b2, b2.return, F2);
        }
        a2 = b2.sibling;
        if (null !== a2) {
          a2.return = b2.return;
          V = a2;
          break;
        }
        V = b2.return;
      }
      n2 = Nj;
      Nj = false;
      return n2;
    }
    function Pj(a2, b2, c2) {
      var d2 = b2.updateQueue;
      d2 = null !== d2 ? d2.lastEffect : null;
      if (null !== d2) {
        var e2 = d2 = d2.next;
        do {
          if ((e2.tag & a2) === a2) {
            var f2 = e2.destroy;
            e2.destroy = void 0;
            void 0 !== f2 && Mj(b2, c2, f2);
          }
          e2 = e2.next;
        } while (e2 !== d2);
      }
    }
    function Qj(a2, b2) {
      b2 = b2.updateQueue;
      b2 = null !== b2 ? b2.lastEffect : null;
      if (null !== b2) {
        var c2 = b2 = b2.next;
        do {
          if ((c2.tag & a2) === a2) {
            var d2 = c2.create;
            c2.destroy = d2();
          }
          c2 = c2.next;
        } while (c2 !== b2);
      }
    }
    function Rj(a2) {
      var b2 = a2.ref;
      if (null !== b2) {
        var c2 = a2.stateNode;
        switch (a2.tag) {
          case 5:
            a2 = c2;
            break;
          default:
            a2 = c2;
        }
        "function" === typeof b2 ? b2(a2) : b2.current = a2;
      }
    }
    function Sj(a2) {
      var b2 = a2.alternate;
      null !== b2 && (a2.alternate = null, Sj(b2));
      a2.child = null;
      a2.deletions = null;
      a2.sibling = null;
      5 === a2.tag && (b2 = a2.stateNode, null !== b2 && (delete b2[Of], delete b2[Pf], delete b2[of], delete b2[Qf], delete b2[Rf]));
      a2.stateNode = null;
      a2.return = null;
      a2.dependencies = null;
      a2.memoizedProps = null;
      a2.memoizedState = null;
      a2.pendingProps = null;
      a2.stateNode = null;
      a2.updateQueue = null;
    }
    function Tj(a2) {
      return 5 === a2.tag || 3 === a2.tag || 4 === a2.tag;
    }
    function Uj(a2) {
      a: for (; ; ) {
        for (; null === a2.sibling; ) {
          if (null === a2.return || Tj(a2.return)) return null;
          a2 = a2.return;
        }
        a2.sibling.return = a2.return;
        for (a2 = a2.sibling; 5 !== a2.tag && 6 !== a2.tag && 18 !== a2.tag; ) {
          if (a2.flags & 2) continue a;
          if (null === a2.child || 4 === a2.tag) continue a;
          else a2.child.return = a2, a2 = a2.child;
        }
        if (!(a2.flags & 2)) return a2.stateNode;
      }
    }
    function Vj(a2, b2, c2) {
      var d2 = a2.tag;
      if (5 === d2 || 6 === d2) a2 = a2.stateNode, b2 ? 8 === c2.nodeType ? c2.parentNode.insertBefore(a2, b2) : c2.insertBefore(a2, b2) : (8 === c2.nodeType ? (b2 = c2.parentNode, b2.insertBefore(a2, c2)) : (b2 = c2, b2.appendChild(a2)), c2 = c2._reactRootContainer, null !== c2 && void 0 !== c2 || null !== b2.onclick || (b2.onclick = Bf));
      else if (4 !== d2 && (a2 = a2.child, null !== a2)) for (Vj(a2, b2, c2), a2 = a2.sibling; null !== a2; ) Vj(a2, b2, c2), a2 = a2.sibling;
    }
    function Wj(a2, b2, c2) {
      var d2 = a2.tag;
      if (5 === d2 || 6 === d2) a2 = a2.stateNode, b2 ? c2.insertBefore(a2, b2) : c2.appendChild(a2);
      else if (4 !== d2 && (a2 = a2.child, null !== a2)) for (Wj(a2, b2, c2), a2 = a2.sibling; null !== a2; ) Wj(a2, b2, c2), a2 = a2.sibling;
    }
    var X2 = null;
    var Xj = false;
    function Yj(a2, b2, c2) {
      for (c2 = c2.child; null !== c2; ) Zj(a2, b2, c2), c2 = c2.sibling;
    }
    function Zj(a2, b2, c2) {
      if (lc && "function" === typeof lc.onCommitFiberUnmount) try {
        lc.onCommitFiberUnmount(kc, c2);
      } catch (h2) {
      }
      switch (c2.tag) {
        case 5:
          U || Lj(c2, b2);
        case 6:
          var d2 = X2, e2 = Xj;
          X2 = null;
          Yj(a2, b2, c2);
          X2 = d2;
          Xj = e2;
          null !== X2 && (Xj ? (a2 = X2, c2 = c2.stateNode, 8 === a2.nodeType ? a2.parentNode.removeChild(c2) : a2.removeChild(c2)) : X2.removeChild(c2.stateNode));
          break;
        case 18:
          null !== X2 && (Xj ? (a2 = X2, c2 = c2.stateNode, 8 === a2.nodeType ? Kf(a2.parentNode, c2) : 1 === a2.nodeType && Kf(a2, c2), bd(a2)) : Kf(X2, c2.stateNode));
          break;
        case 4:
          d2 = X2;
          e2 = Xj;
          X2 = c2.stateNode.containerInfo;
          Xj = true;
          Yj(a2, b2, c2);
          X2 = d2;
          Xj = e2;
          break;
        case 0:
        case 11:
        case 14:
        case 15:
          if (!U && (d2 = c2.updateQueue, null !== d2 && (d2 = d2.lastEffect, null !== d2))) {
            e2 = d2 = d2.next;
            do {
              var f2 = e2, g2 = f2.destroy;
              f2 = f2.tag;
              void 0 !== g2 && (0 !== (f2 & 2) ? Mj(c2, b2, g2) : 0 !== (f2 & 4) && Mj(c2, b2, g2));
              e2 = e2.next;
            } while (e2 !== d2);
          }
          Yj(a2, b2, c2);
          break;
        case 1:
          if (!U && (Lj(c2, b2), d2 = c2.stateNode, "function" === typeof d2.componentWillUnmount)) try {
            d2.props = c2.memoizedProps, d2.state = c2.memoizedState, d2.componentWillUnmount();
          } catch (h2) {
            W(c2, b2, h2);
          }
          Yj(a2, b2, c2);
          break;
        case 21:
          Yj(a2, b2, c2);
          break;
        case 22:
          c2.mode & 1 ? (U = (d2 = U) || null !== c2.memoizedState, Yj(a2, b2, c2), U = d2) : Yj(a2, b2, c2);
          break;
        default:
          Yj(a2, b2, c2);
      }
    }
    function ak(a2) {
      var b2 = a2.updateQueue;
      if (null !== b2) {
        a2.updateQueue = null;
        var c2 = a2.stateNode;
        null === c2 && (c2 = a2.stateNode = new Kj());
        b2.forEach(function(b3) {
          var d2 = bk.bind(null, a2, b3);
          c2.has(b3) || (c2.add(b3), b3.then(d2, d2));
        });
      }
    }
    function ck(a2, b2) {
      var c2 = b2.deletions;
      if (null !== c2) for (var d2 = 0; d2 < c2.length; d2++) {
        var e2 = c2[d2];
        try {
          var f2 = a2, g2 = b2, h2 = g2;
          a: for (; null !== h2; ) {
            switch (h2.tag) {
              case 5:
                X2 = h2.stateNode;
                Xj = false;
                break a;
              case 3:
                X2 = h2.stateNode.containerInfo;
                Xj = true;
                break a;
              case 4:
                X2 = h2.stateNode.containerInfo;
                Xj = true;
                break a;
            }
            h2 = h2.return;
          }
          if (null === X2) throw Error(p2(160));
          Zj(f2, g2, e2);
          X2 = null;
          Xj = false;
          var k2 = e2.alternate;
          null !== k2 && (k2.return = null);
          e2.return = null;
        } catch (l) {
          W(e2, b2, l);
        }
      }
      if (b2.subtreeFlags & 12854) for (b2 = b2.child; null !== b2; ) dk(b2, a2), b2 = b2.sibling;
    }
    function dk(a2, b2) {
      var c2 = a2.alternate, d2 = a2.flags;
      switch (a2.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          ck(b2, a2);
          ek(a2);
          if (d2 & 4) {
            try {
              Pj(3, a2, a2.return), Qj(3, a2);
            } catch (t3) {
              W(a2, a2.return, t3);
            }
            try {
              Pj(5, a2, a2.return);
            } catch (t3) {
              W(a2, a2.return, t3);
            }
          }
          break;
        case 1:
          ck(b2, a2);
          ek(a2);
          d2 & 512 && null !== c2 && Lj(c2, c2.return);
          break;
        case 5:
          ck(b2, a2);
          ek(a2);
          d2 & 512 && null !== c2 && Lj(c2, c2.return);
          if (a2.flags & 32) {
            var e2 = a2.stateNode;
            try {
              ob(e2, "");
            } catch (t3) {
              W(a2, a2.return, t3);
            }
          }
          if (d2 & 4 && (e2 = a2.stateNode, null != e2)) {
            var f2 = a2.memoizedProps, g2 = null !== c2 ? c2.memoizedProps : f2, h2 = a2.type, k2 = a2.updateQueue;
            a2.updateQueue = null;
            if (null !== k2) try {
              "input" === h2 && "radio" === f2.type && null != f2.name && ab(e2, f2);
              vb(h2, g2);
              var l = vb(h2, f2);
              for (g2 = 0; g2 < k2.length; g2 += 2) {
                var m2 = k2[g2], q2 = k2[g2 + 1];
                "style" === m2 ? sb(e2, q2) : "dangerouslySetInnerHTML" === m2 ? nb(e2, q2) : "children" === m2 ? ob(e2, q2) : ta(e2, m2, q2, l);
              }
              switch (h2) {
                case "input":
                  bb(e2, f2);
                  break;
                case "textarea":
                  ib(e2, f2);
                  break;
                case "select":
                  var r3 = e2._wrapperState.wasMultiple;
                  e2._wrapperState.wasMultiple = !!f2.multiple;
                  var y2 = f2.value;
                  null != y2 ? fb(e2, !!f2.multiple, y2, false) : r3 !== !!f2.multiple && (null != f2.defaultValue ? fb(
                    e2,
                    !!f2.multiple,
                    f2.defaultValue,
                    true
                  ) : fb(e2, !!f2.multiple, f2.multiple ? [] : "", false));
              }
              e2[Pf] = f2;
            } catch (t3) {
              W(a2, a2.return, t3);
            }
          }
          break;
        case 6:
          ck(b2, a2);
          ek(a2);
          if (d2 & 4) {
            if (null === a2.stateNode) throw Error(p2(162));
            e2 = a2.stateNode;
            f2 = a2.memoizedProps;
            try {
              e2.nodeValue = f2;
            } catch (t3) {
              W(a2, a2.return, t3);
            }
          }
          break;
        case 3:
          ck(b2, a2);
          ek(a2);
          if (d2 & 4 && null !== c2 && c2.memoizedState.isDehydrated) try {
            bd(b2.containerInfo);
          } catch (t3) {
            W(a2, a2.return, t3);
          }
          break;
        case 4:
          ck(b2, a2);
          ek(a2);
          break;
        case 13:
          ck(b2, a2);
          ek(a2);
          e2 = a2.child;
          e2.flags & 8192 && (f2 = null !== e2.memoizedState, e2.stateNode.isHidden = f2, !f2 || null !== e2.alternate && null !== e2.alternate.memoizedState || (fk = B2()));
          d2 & 4 && ak(a2);
          break;
        case 22:
          m2 = null !== c2 && null !== c2.memoizedState;
          a2.mode & 1 ? (U = (l = U) || m2, ck(b2, a2), U = l) : ck(b2, a2);
          ek(a2);
          if (d2 & 8192) {
            l = null !== a2.memoizedState;
            if ((a2.stateNode.isHidden = l) && !m2 && 0 !== (a2.mode & 1)) for (V = a2, m2 = a2.child; null !== m2; ) {
              for (q2 = V = m2; null !== V; ) {
                r3 = V;
                y2 = r3.child;
                switch (r3.tag) {
                  case 0:
                  case 11:
                  case 14:
                  case 15:
                    Pj(4, r3, r3.return);
                    break;
                  case 1:
                    Lj(r3, r3.return);
                    var n2 = r3.stateNode;
                    if ("function" === typeof n2.componentWillUnmount) {
                      d2 = r3;
                      c2 = r3.return;
                      try {
                        b2 = d2, n2.props = b2.memoizedProps, n2.state = b2.memoizedState, n2.componentWillUnmount();
                      } catch (t3) {
                        W(d2, c2, t3);
                      }
                    }
                    break;
                  case 5:
                    Lj(r3, r3.return);
                    break;
                  case 22:
                    if (null !== r3.memoizedState) {
                      gk(q2);
                      continue;
                    }
                }
                null !== y2 ? (y2.return = r3, V = y2) : gk(q2);
              }
              m2 = m2.sibling;
            }
            a: for (m2 = null, q2 = a2; ; ) {
              if (5 === q2.tag) {
                if (null === m2) {
                  m2 = q2;
                  try {
                    e2 = q2.stateNode, l ? (f2 = e2.style, "function" === typeof f2.setProperty ? f2.setProperty("display", "none", "important") : f2.display = "none") : (h2 = q2.stateNode, k2 = q2.memoizedProps.style, g2 = void 0 !== k2 && null !== k2 && k2.hasOwnProperty("display") ? k2.display : null, h2.style.display = rb("display", g2));
                  } catch (t3) {
                    W(a2, a2.return, t3);
                  }
                }
              } else if (6 === q2.tag) {
                if (null === m2) try {
                  q2.stateNode.nodeValue = l ? "" : q2.memoizedProps;
                } catch (t3) {
                  W(a2, a2.return, t3);
                }
              } else if ((22 !== q2.tag && 23 !== q2.tag || null === q2.memoizedState || q2 === a2) && null !== q2.child) {
                q2.child.return = q2;
                q2 = q2.child;
                continue;
              }
              if (q2 === a2) break a;
              for (; null === q2.sibling; ) {
                if (null === q2.return || q2.return === a2) break a;
                m2 === q2 && (m2 = null);
                q2 = q2.return;
              }
              m2 === q2 && (m2 = null);
              q2.sibling.return = q2.return;
              q2 = q2.sibling;
            }
          }
          break;
        case 19:
          ck(b2, a2);
          ek(a2);
          d2 & 4 && ak(a2);
          break;
        case 21:
          break;
        default:
          ck(
            b2,
            a2
          ), ek(a2);
      }
    }
    function ek(a2) {
      var b2 = a2.flags;
      if (b2 & 2) {
        try {
          a: {
            for (var c2 = a2.return; null !== c2; ) {
              if (Tj(c2)) {
                var d2 = c2;
                break a;
              }
              c2 = c2.return;
            }
            throw Error(p2(160));
          }
          switch (d2.tag) {
            case 5:
              var e2 = d2.stateNode;
              d2.flags & 32 && (ob(e2, ""), d2.flags &= -33);
              var f2 = Uj(a2);
              Wj(a2, f2, e2);
              break;
            case 3:
            case 4:
              var g2 = d2.stateNode.containerInfo, h2 = Uj(a2);
              Vj(a2, h2, g2);
              break;
            default:
              throw Error(p2(161));
          }
        } catch (k2) {
          W(a2, a2.return, k2);
        }
        a2.flags &= -3;
      }
      b2 & 4096 && (a2.flags &= -4097);
    }
    function hk(a2, b2, c2) {
      V = a2;
      ik(a2, b2, c2);
    }
    function ik(a2, b2, c2) {
      for (var d2 = 0 !== (a2.mode & 1); null !== V; ) {
        var e2 = V, f2 = e2.child;
        if (22 === e2.tag && d2) {
          var g2 = null !== e2.memoizedState || Jj;
          if (!g2) {
            var h2 = e2.alternate, k2 = null !== h2 && null !== h2.memoizedState || U;
            h2 = Jj;
            var l = U;
            Jj = g2;
            if ((U = k2) && !l) for (V = e2; null !== V; ) g2 = V, k2 = g2.child, 22 === g2.tag && null !== g2.memoizedState ? jk(e2) : null !== k2 ? (k2.return = g2, V = k2) : jk(e2);
            for (; null !== f2; ) V = f2, ik(f2, b2, c2), f2 = f2.sibling;
            V = e2;
            Jj = h2;
            U = l;
          }
          kk(a2, b2, c2);
        } else 0 !== (e2.subtreeFlags & 8772) && null !== f2 ? (f2.return = e2, V = f2) : kk(a2, b2, c2);
      }
    }
    function kk(a2) {
      for (; null !== V; ) {
        var b2 = V;
        if (0 !== (b2.flags & 8772)) {
          var c2 = b2.alternate;
          try {
            if (0 !== (b2.flags & 8772)) switch (b2.tag) {
              case 0:
              case 11:
              case 15:
                U || Qj(5, b2);
                break;
              case 1:
                var d2 = b2.stateNode;
                if (b2.flags & 4 && !U) if (null === c2) d2.componentDidMount();
                else {
                  var e2 = b2.elementType === b2.type ? c2.memoizedProps : Ci(b2.type, c2.memoizedProps);
                  d2.componentDidUpdate(e2, c2.memoizedState, d2.__reactInternalSnapshotBeforeUpdate);
                }
                var f2 = b2.updateQueue;
                null !== f2 && sh(b2, f2, d2);
                break;
              case 3:
                var g2 = b2.updateQueue;
                if (null !== g2) {
                  c2 = null;
                  if (null !== b2.child) switch (b2.child.tag) {
                    case 5:
                      c2 = b2.child.stateNode;
                      break;
                    case 1:
                      c2 = b2.child.stateNode;
                  }
                  sh(b2, g2, c2);
                }
                break;
              case 5:
                var h2 = b2.stateNode;
                if (null === c2 && b2.flags & 4) {
                  c2 = h2;
                  var k2 = b2.memoizedProps;
                  switch (b2.type) {
                    case "button":
                    case "input":
                    case "select":
                    case "textarea":
                      k2.autoFocus && c2.focus();
                      break;
                    case "img":
                      k2.src && (c2.src = k2.src);
                  }
                }
                break;
              case 6:
                break;
              case 4:
                break;
              case 12:
                break;
              case 13:
                if (null === b2.memoizedState) {
                  var l = b2.alternate;
                  if (null !== l) {
                    var m2 = l.memoizedState;
                    if (null !== m2) {
                      var q2 = m2.dehydrated;
                      null !== q2 && bd(q2);
                    }
                  }
                }
                break;
              case 19:
              case 17:
              case 21:
              case 22:
              case 23:
              case 25:
                break;
              default:
                throw Error(p2(163));
            }
            U || b2.flags & 512 && Rj(b2);
          } catch (r3) {
            W(b2, b2.return, r3);
          }
        }
        if (b2 === a2) {
          V = null;
          break;
        }
        c2 = b2.sibling;
        if (null !== c2) {
          c2.return = b2.return;
          V = c2;
          break;
        }
        V = b2.return;
      }
    }
    function gk(a2) {
      for (; null !== V; ) {
        var b2 = V;
        if (b2 === a2) {
          V = null;
          break;
        }
        var c2 = b2.sibling;
        if (null !== c2) {
          c2.return = b2.return;
          V = c2;
          break;
        }
        V = b2.return;
      }
    }
    function jk(a2) {
      for (; null !== V; ) {
        var b2 = V;
        try {
          switch (b2.tag) {
            case 0:
            case 11:
            case 15:
              var c2 = b2.return;
              try {
                Qj(4, b2);
              } catch (k2) {
                W(b2, c2, k2);
              }
              break;
            case 1:
              var d2 = b2.stateNode;
              if ("function" === typeof d2.componentDidMount) {
                var e2 = b2.return;
                try {
                  d2.componentDidMount();
                } catch (k2) {
                  W(b2, e2, k2);
                }
              }
              var f2 = b2.return;
              try {
                Rj(b2);
              } catch (k2) {
                W(b2, f2, k2);
              }
              break;
            case 5:
              var g2 = b2.return;
              try {
                Rj(b2);
              } catch (k2) {
                W(b2, g2, k2);
              }
          }
        } catch (k2) {
          W(b2, b2.return, k2);
        }
        if (b2 === a2) {
          V = null;
          break;
        }
        var h2 = b2.sibling;
        if (null !== h2) {
          h2.return = b2.return;
          V = h2;
          break;
        }
        V = b2.return;
      }
    }
    var lk = Math.ceil;
    var mk = ua.ReactCurrentDispatcher;
    var nk = ua.ReactCurrentOwner;
    var ok = ua.ReactCurrentBatchConfig;
    var K = 0;
    var Q2 = null;
    var Y2 = null;
    var Z = 0;
    var fj = 0;
    var ej = Uf(0);
    var T2 = 0;
    var pk = null;
    var rh = 0;
    var qk = 0;
    var rk = 0;
    var sk = null;
    var tk = null;
    var fk = 0;
    var Gj = Infinity;
    var uk = null;
    var Oi = false;
    var Pi = null;
    var Ri = null;
    var vk = false;
    var wk = null;
    var xk = 0;
    var yk = 0;
    var zk = null;
    var Ak = -1;
    var Bk = 0;
    function R2() {
      return 0 !== (K & 6) ? B2() : -1 !== Ak ? Ak : Ak = B2();
    }
    function yi(a2) {
      if (0 === (a2.mode & 1)) return 1;
      if (0 !== (K & 2) && 0 !== Z) return Z & -Z;
      if (null !== Kg.transition) return 0 === Bk && (Bk = yc()), Bk;
      a2 = C2;
      if (0 !== a2) return a2;
      a2 = window.event;
      a2 = void 0 === a2 ? 16 : jd(a2.type);
      return a2;
    }
    function gi(a2, b2, c2, d2) {
      if (50 < yk) throw yk = 0, zk = null, Error(p2(185));
      Ac(a2, c2, d2);
      if (0 === (K & 2) || a2 !== Q2) a2 === Q2 && (0 === (K & 2) && (qk |= c2), 4 === T2 && Ck(a2, Z)), Dk(a2, d2), 1 === c2 && 0 === K && 0 === (b2.mode & 1) && (Gj = B2() + 500, fg && jg());
    }
    function Dk(a2, b2) {
      var c2 = a2.callbackNode;
      wc(a2, b2);
      var d2 = uc(a2, a2 === Q2 ? Z : 0);
      if (0 === d2) null !== c2 && bc(c2), a2.callbackNode = null, a2.callbackPriority = 0;
      else if (b2 = d2 & -d2, a2.callbackPriority !== b2) {
        null != c2 && bc(c2);
        if (1 === b2) 0 === a2.tag ? ig(Ek.bind(null, a2)) : hg(Ek.bind(null, a2)), Jf(function() {
          0 === (K & 6) && jg();
        }), c2 = null;
        else {
          switch (Dc(d2)) {
            case 1:
              c2 = fc;
              break;
            case 4:
              c2 = gc;
              break;
            case 16:
              c2 = hc;
              break;
            case 536870912:
              c2 = jc;
              break;
            default:
              c2 = hc;
          }
          c2 = Fk(c2, Gk.bind(null, a2));
        }
        a2.callbackPriority = b2;
        a2.callbackNode = c2;
      }
    }
    function Gk(a2, b2) {
      Ak = -1;
      Bk = 0;
      if (0 !== (K & 6)) throw Error(p2(327));
      var c2 = a2.callbackNode;
      if (Hk() && a2.callbackNode !== c2) return null;
      var d2 = uc(a2, a2 === Q2 ? Z : 0);
      if (0 === d2) return null;
      if (0 !== (d2 & 30) || 0 !== (d2 & a2.expiredLanes) || b2) b2 = Ik(a2, d2);
      else {
        b2 = d2;
        var e2 = K;
        K |= 2;
        var f2 = Jk();
        if (Q2 !== a2 || Z !== b2) uk = null, Gj = B2() + 500, Kk(a2, b2);
        do
          try {
            Lk();
            break;
          } catch (h2) {
            Mk(a2, h2);
          }
        while (1);
        $g();
        mk.current = f2;
        K = e2;
        null !== Y2 ? b2 = 0 : (Q2 = null, Z = 0, b2 = T2);
      }
      if (0 !== b2) {
        2 === b2 && (e2 = xc(a2), 0 !== e2 && (d2 = e2, b2 = Nk(a2, e2)));
        if (1 === b2) throw c2 = pk, Kk(a2, 0), Ck(a2, d2), Dk(a2, B2()), c2;
        if (6 === b2) Ck(a2, d2);
        else {
          e2 = a2.current.alternate;
          if (0 === (d2 & 30) && !Ok(e2) && (b2 = Ik(a2, d2), 2 === b2 && (f2 = xc(a2), 0 !== f2 && (d2 = f2, b2 = Nk(a2, f2))), 1 === b2)) throw c2 = pk, Kk(a2, 0), Ck(a2, d2), Dk(a2, B2()), c2;
          a2.finishedWork = e2;
          a2.finishedLanes = d2;
          switch (b2) {
            case 0:
            case 1:
              throw Error(p2(345));
            case 2:
              Pk(a2, tk, uk);
              break;
            case 3:
              Ck(a2, d2);
              if ((d2 & 130023424) === d2 && (b2 = fk + 500 - B2(), 10 < b2)) {
                if (0 !== uc(a2, 0)) break;
                e2 = a2.suspendedLanes;
                if ((e2 & d2) !== d2) {
                  R2();
                  a2.pingedLanes |= a2.suspendedLanes & e2;
                  break;
                }
                a2.timeoutHandle = Ff(Pk.bind(null, a2, tk, uk), b2);
                break;
              }
              Pk(a2, tk, uk);
              break;
            case 4:
              Ck(a2, d2);
              if ((d2 & 4194240) === d2) break;
              b2 = a2.eventTimes;
              for (e2 = -1; 0 < d2; ) {
                var g2 = 31 - oc(d2);
                f2 = 1 << g2;
                g2 = b2[g2];
                g2 > e2 && (e2 = g2);
                d2 &= ~f2;
              }
              d2 = e2;
              d2 = B2() - d2;
              d2 = (120 > d2 ? 120 : 480 > d2 ? 480 : 1080 > d2 ? 1080 : 1920 > d2 ? 1920 : 3e3 > d2 ? 3e3 : 4320 > d2 ? 4320 : 1960 * lk(d2 / 1960)) - d2;
              if (10 < d2) {
                a2.timeoutHandle = Ff(Pk.bind(null, a2, tk, uk), d2);
                break;
              }
              Pk(a2, tk, uk);
              break;
            case 5:
              Pk(a2, tk, uk);
              break;
            default:
              throw Error(p2(329));
          }
        }
      }
      Dk(a2, B2());
      return a2.callbackNode === c2 ? Gk.bind(null, a2) : null;
    }
    function Nk(a2, b2) {
      var c2 = sk;
      a2.current.memoizedState.isDehydrated && (Kk(a2, b2).flags |= 256);
      a2 = Ik(a2, b2);
      2 !== a2 && (b2 = tk, tk = c2, null !== b2 && Fj(b2));
      return a2;
    }
    function Fj(a2) {
      null === tk ? tk = a2 : tk.push.apply(tk, a2);
    }
    function Ok(a2) {
      for (var b2 = a2; ; ) {
        if (b2.flags & 16384) {
          var c2 = b2.updateQueue;
          if (null !== c2 && (c2 = c2.stores, null !== c2)) for (var d2 = 0; d2 < c2.length; d2++) {
            var e2 = c2[d2], f2 = e2.getSnapshot;
            e2 = e2.value;
            try {
              if (!He(f2(), e2)) return false;
            } catch (g2) {
              return false;
            }
          }
        }
        c2 = b2.child;
        if (b2.subtreeFlags & 16384 && null !== c2) c2.return = b2, b2 = c2;
        else {
          if (b2 === a2) break;
          for (; null === b2.sibling; ) {
            if (null === b2.return || b2.return === a2) return true;
            b2 = b2.return;
          }
          b2.sibling.return = b2.return;
          b2 = b2.sibling;
        }
      }
      return true;
    }
    function Ck(a2, b2) {
      b2 &= ~rk;
      b2 &= ~qk;
      a2.suspendedLanes |= b2;
      a2.pingedLanes &= ~b2;
      for (a2 = a2.expirationTimes; 0 < b2; ) {
        var c2 = 31 - oc(b2), d2 = 1 << c2;
        a2[c2] = -1;
        b2 &= ~d2;
      }
    }
    function Ek(a2) {
      if (0 !== (K & 6)) throw Error(p2(327));
      Hk();
      var b2 = uc(a2, 0);
      if (0 === (b2 & 1)) return Dk(a2, B2()), null;
      var c2 = Ik(a2, b2);
      if (0 !== a2.tag && 2 === c2) {
        var d2 = xc(a2);
        0 !== d2 && (b2 = d2, c2 = Nk(a2, d2));
      }
      if (1 === c2) throw c2 = pk, Kk(a2, 0), Ck(a2, b2), Dk(a2, B2()), c2;
      if (6 === c2) throw Error(p2(345));
      a2.finishedWork = a2.current.alternate;
      a2.finishedLanes = b2;
      Pk(a2, tk, uk);
      Dk(a2, B2());
      return null;
    }
    function Qk(a2, b2) {
      var c2 = K;
      K |= 1;
      try {
        return a2(b2);
      } finally {
        K = c2, 0 === K && (Gj = B2() + 500, fg && jg());
      }
    }
    function Rk(a2) {
      null !== wk && 0 === wk.tag && 0 === (K & 6) && Hk();
      var b2 = K;
      K |= 1;
      var c2 = ok.transition, d2 = C2;
      try {
        if (ok.transition = null, C2 = 1, a2) return a2();
      } finally {
        C2 = d2, ok.transition = c2, K = b2, 0 === (K & 6) && jg();
      }
    }
    function Hj() {
      fj = ej.current;
      E2(ej);
    }
    function Kk(a2, b2) {
      a2.finishedWork = null;
      a2.finishedLanes = 0;
      var c2 = a2.timeoutHandle;
      -1 !== c2 && (a2.timeoutHandle = -1, Gf(c2));
      if (null !== Y2) for (c2 = Y2.return; null !== c2; ) {
        var d2 = c2;
        wg(d2);
        switch (d2.tag) {
          case 1:
            d2 = d2.type.childContextTypes;
            null !== d2 && void 0 !== d2 && $f();
            break;
          case 3:
            zh();
            E2(Wf);
            E2(H2);
            Eh();
            break;
          case 5:
            Bh(d2);
            break;
          case 4:
            zh();
            break;
          case 13:
            E2(L2);
            break;
          case 19:
            E2(L2);
            break;
          case 10:
            ah(d2.type._context);
            break;
          case 22:
          case 23:
            Hj();
        }
        c2 = c2.return;
      }
      Q2 = a2;
      Y2 = a2 = Pg(a2.current, null);
      Z = fj = b2;
      T2 = 0;
      pk = null;
      rk = qk = rh = 0;
      tk = sk = null;
      if (null !== fh) {
        for (b2 = 0; b2 < fh.length; b2++) if (c2 = fh[b2], d2 = c2.interleaved, null !== d2) {
          c2.interleaved = null;
          var e2 = d2.next, f2 = c2.pending;
          if (null !== f2) {
            var g2 = f2.next;
            f2.next = e2;
            d2.next = g2;
          }
          c2.pending = d2;
        }
        fh = null;
      }
      return a2;
    }
    function Mk(a2, b2) {
      do {
        var c2 = Y2;
        try {
          $g();
          Fh.current = Rh;
          if (Ih) {
            for (var d2 = M2.memoizedState; null !== d2; ) {
              var e2 = d2.queue;
              null !== e2 && (e2.pending = null);
              d2 = d2.next;
            }
            Ih = false;
          }
          Hh = 0;
          O2 = N2 = M2 = null;
          Jh = false;
          Kh = 0;
          nk.current = null;
          if (null === c2 || null === c2.return) {
            T2 = 1;
            pk = b2;
            Y2 = null;
            break;
          }
          a: {
            var f2 = a2, g2 = c2.return, h2 = c2, k2 = b2;
            b2 = Z;
            h2.flags |= 32768;
            if (null !== k2 && "object" === typeof k2 && "function" === typeof k2.then) {
              var l = k2, m2 = h2, q2 = m2.tag;
              if (0 === (m2.mode & 1) && (0 === q2 || 11 === q2 || 15 === q2)) {
                var r3 = m2.alternate;
                r3 ? (m2.updateQueue = r3.updateQueue, m2.memoizedState = r3.memoizedState, m2.lanes = r3.lanes) : (m2.updateQueue = null, m2.memoizedState = null);
              }
              var y2 = Ui(g2);
              if (null !== y2) {
                y2.flags &= -257;
                Vi(y2, g2, h2, f2, b2);
                y2.mode & 1 && Si(f2, l, b2);
                b2 = y2;
                k2 = l;
                var n2 = b2.updateQueue;
                if (null === n2) {
                  var t3 = /* @__PURE__ */ new Set();
                  t3.add(k2);
                  b2.updateQueue = t3;
                } else n2.add(k2);
                break a;
              } else {
                if (0 === (b2 & 1)) {
                  Si(f2, l, b2);
                  tj();
                  break a;
                }
                k2 = Error(p2(426));
              }
            } else if (I2 && h2.mode & 1) {
              var J = Ui(g2);
              if (null !== J) {
                0 === (J.flags & 65536) && (J.flags |= 256);
                Vi(J, g2, h2, f2, b2);
                Jg(Ji(k2, h2));
                break a;
              }
            }
            f2 = k2 = Ji(k2, h2);
            4 !== T2 && (T2 = 2);
            null === sk ? sk = [f2] : sk.push(f2);
            f2 = g2;
            do {
              switch (f2.tag) {
                case 3:
                  f2.flags |= 65536;
                  b2 &= -b2;
                  f2.lanes |= b2;
                  var x2 = Ni(f2, k2, b2);
                  ph(f2, x2);
                  break a;
                case 1:
                  h2 = k2;
                  var w2 = f2.type, u2 = f2.stateNode;
                  if (0 === (f2.flags & 128) && ("function" === typeof w2.getDerivedStateFromError || null !== u2 && "function" === typeof u2.componentDidCatch && (null === Ri || !Ri.has(u2)))) {
                    f2.flags |= 65536;
                    b2 &= -b2;
                    f2.lanes |= b2;
                    var F2 = Qi(f2, h2, b2);
                    ph(f2, F2);
                    break a;
                  }
              }
              f2 = f2.return;
            } while (null !== f2);
          }
          Sk(c2);
        } catch (na) {
          b2 = na;
          Y2 === c2 && null !== c2 && (Y2 = c2 = c2.return);
          continue;
        }
        break;
      } while (1);
    }
    function Jk() {
      var a2 = mk.current;
      mk.current = Rh;
      return null === a2 ? Rh : a2;
    }
    function tj() {
      if (0 === T2 || 3 === T2 || 2 === T2) T2 = 4;
      null === Q2 || 0 === (rh & 268435455) && 0 === (qk & 268435455) || Ck(Q2, Z);
    }
    function Ik(a2, b2) {
      var c2 = K;
      K |= 2;
      var d2 = Jk();
      if (Q2 !== a2 || Z !== b2) uk = null, Kk(a2, b2);
      do
        try {
          Tk();
          break;
        } catch (e2) {
          Mk(a2, e2);
        }
      while (1);
      $g();
      K = c2;
      mk.current = d2;
      if (null !== Y2) throw Error(p2(261));
      Q2 = null;
      Z = 0;
      return T2;
    }
    function Tk() {
      for (; null !== Y2; ) Uk(Y2);
    }
    function Lk() {
      for (; null !== Y2 && !cc(); ) Uk(Y2);
    }
    function Uk(a2) {
      var b2 = Vk(a2.alternate, a2, fj);
      a2.memoizedProps = a2.pendingProps;
      null === b2 ? Sk(a2) : Y2 = b2;
      nk.current = null;
    }
    function Sk(a2) {
      var b2 = a2;
      do {
        var c2 = b2.alternate;
        a2 = b2.return;
        if (0 === (b2.flags & 32768)) {
          if (c2 = Ej(c2, b2, fj), null !== c2) {
            Y2 = c2;
            return;
          }
        } else {
          c2 = Ij(c2, b2);
          if (null !== c2) {
            c2.flags &= 32767;
            Y2 = c2;
            return;
          }
          if (null !== a2) a2.flags |= 32768, a2.subtreeFlags = 0, a2.deletions = null;
          else {
            T2 = 6;
            Y2 = null;
            return;
          }
        }
        b2 = b2.sibling;
        if (null !== b2) {
          Y2 = b2;
          return;
        }
        Y2 = b2 = a2;
      } while (null !== b2);
      0 === T2 && (T2 = 5);
    }
    function Pk(a2, b2, c2) {
      var d2 = C2, e2 = ok.transition;
      try {
        ok.transition = null, C2 = 1, Wk(a2, b2, c2, d2);
      } finally {
        ok.transition = e2, C2 = d2;
      }
      return null;
    }
    function Wk(a2, b2, c2, d2) {
      do
        Hk();
      while (null !== wk);
      if (0 !== (K & 6)) throw Error(p2(327));
      c2 = a2.finishedWork;
      var e2 = a2.finishedLanes;
      if (null === c2) return null;
      a2.finishedWork = null;
      a2.finishedLanes = 0;
      if (c2 === a2.current) throw Error(p2(177));
      a2.callbackNode = null;
      a2.callbackPriority = 0;
      var f2 = c2.lanes | c2.childLanes;
      Bc(a2, f2);
      a2 === Q2 && (Y2 = Q2 = null, Z = 0);
      0 === (c2.subtreeFlags & 2064) && 0 === (c2.flags & 2064) || vk || (vk = true, Fk(hc, function() {
        Hk();
        return null;
      }));
      f2 = 0 !== (c2.flags & 15990);
      if (0 !== (c2.subtreeFlags & 15990) || f2) {
        f2 = ok.transition;
        ok.transition = null;
        var g2 = C2;
        C2 = 1;
        var h2 = K;
        K |= 4;
        nk.current = null;
        Oj(a2, c2);
        dk(c2, a2);
        Oe(Df);
        dd = !!Cf;
        Df = Cf = null;
        a2.current = c2;
        hk(c2, a2, e2);
        dc();
        K = h2;
        C2 = g2;
        ok.transition = f2;
      } else a2.current = c2;
      vk && (vk = false, wk = a2, xk = e2);
      f2 = a2.pendingLanes;
      0 === f2 && (Ri = null);
      mc(c2.stateNode, d2);
      Dk(a2, B2());
      if (null !== b2) for (d2 = a2.onRecoverableError, c2 = 0; c2 < b2.length; c2++) e2 = b2[c2], d2(e2.value, { componentStack: e2.stack, digest: e2.digest });
      if (Oi) throw Oi = false, a2 = Pi, Pi = null, a2;
      0 !== (xk & 1) && 0 !== a2.tag && Hk();
      f2 = a2.pendingLanes;
      0 !== (f2 & 1) ? a2 === zk ? yk++ : (yk = 0, zk = a2) : yk = 0;
      jg();
      return null;
    }
    function Hk() {
      if (null !== wk) {
        var a2 = Dc(xk), b2 = ok.transition, c2 = C2;
        try {
          ok.transition = null;
          C2 = 16 > a2 ? 16 : a2;
          if (null === wk) var d2 = false;
          else {
            a2 = wk;
            wk = null;
            xk = 0;
            if (0 !== (K & 6)) throw Error(p2(331));
            var e2 = K;
            K |= 4;
            for (V = a2.current; null !== V; ) {
              var f2 = V, g2 = f2.child;
              if (0 !== (V.flags & 16)) {
                var h2 = f2.deletions;
                if (null !== h2) {
                  for (var k2 = 0; k2 < h2.length; k2++) {
                    var l = h2[k2];
                    for (V = l; null !== V; ) {
                      var m2 = V;
                      switch (m2.tag) {
                        case 0:
                        case 11:
                        case 15:
                          Pj(8, m2, f2);
                      }
                      var q2 = m2.child;
                      if (null !== q2) q2.return = m2, V = q2;
                      else for (; null !== V; ) {
                        m2 = V;
                        var r3 = m2.sibling, y2 = m2.return;
                        Sj(m2);
                        if (m2 === l) {
                          V = null;
                          break;
                        }
                        if (null !== r3) {
                          r3.return = y2;
                          V = r3;
                          break;
                        }
                        V = y2;
                      }
                    }
                  }
                  var n2 = f2.alternate;
                  if (null !== n2) {
                    var t3 = n2.child;
                    if (null !== t3) {
                      n2.child = null;
                      do {
                        var J = t3.sibling;
                        t3.sibling = null;
                        t3 = J;
                      } while (null !== t3);
                    }
                  }
                  V = f2;
                }
              }
              if (0 !== (f2.subtreeFlags & 2064) && null !== g2) g2.return = f2, V = g2;
              else b: for (; null !== V; ) {
                f2 = V;
                if (0 !== (f2.flags & 2048)) switch (f2.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Pj(9, f2, f2.return);
                }
                var x2 = f2.sibling;
                if (null !== x2) {
                  x2.return = f2.return;
                  V = x2;
                  break b;
                }
                V = f2.return;
              }
            }
            var w2 = a2.current;
            for (V = w2; null !== V; ) {
              g2 = V;
              var u2 = g2.child;
              if (0 !== (g2.subtreeFlags & 2064) && null !== u2) u2.return = g2, V = u2;
              else b: for (g2 = w2; null !== V; ) {
                h2 = V;
                if (0 !== (h2.flags & 2048)) try {
                  switch (h2.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Qj(9, h2);
                  }
                } catch (na) {
                  W(h2, h2.return, na);
                }
                if (h2 === g2) {
                  V = null;
                  break b;
                }
                var F2 = h2.sibling;
                if (null !== F2) {
                  F2.return = h2.return;
                  V = F2;
                  break b;
                }
                V = h2.return;
              }
            }
            K = e2;
            jg();
            if (lc && "function" === typeof lc.onPostCommitFiberRoot) try {
              lc.onPostCommitFiberRoot(kc, a2);
            } catch (na) {
            }
            d2 = true;
          }
          return d2;
        } finally {
          C2 = c2, ok.transition = b2;
        }
      }
      return false;
    }
    function Xk(a2, b2, c2) {
      b2 = Ji(c2, b2);
      b2 = Ni(a2, b2, 1);
      a2 = nh(a2, b2, 1);
      b2 = R2();
      null !== a2 && (Ac(a2, 1, b2), Dk(a2, b2));
    }
    function W(a2, b2, c2) {
      if (3 === a2.tag) Xk(a2, a2, c2);
      else for (; null !== b2; ) {
        if (3 === b2.tag) {
          Xk(b2, a2, c2);
          break;
        } else if (1 === b2.tag) {
          var d2 = b2.stateNode;
          if ("function" === typeof b2.type.getDerivedStateFromError || "function" === typeof d2.componentDidCatch && (null === Ri || !Ri.has(d2))) {
            a2 = Ji(c2, a2);
            a2 = Qi(b2, a2, 1);
            b2 = nh(b2, a2, 1);
            a2 = R2();
            null !== b2 && (Ac(b2, 1, a2), Dk(b2, a2));
            break;
          }
        }
        b2 = b2.return;
      }
    }
    function Ti(a2, b2, c2) {
      var d2 = a2.pingCache;
      null !== d2 && d2.delete(b2);
      b2 = R2();
      a2.pingedLanes |= a2.suspendedLanes & c2;
      Q2 === a2 && (Z & c2) === c2 && (4 === T2 || 3 === T2 && (Z & 130023424) === Z && 500 > B2() - fk ? Kk(a2, 0) : rk |= c2);
      Dk(a2, b2);
    }
    function Yk(a2, b2) {
      0 === b2 && (0 === (a2.mode & 1) ? b2 = 1 : (b2 = sc, sc <<= 1, 0 === (sc & 130023424) && (sc = 4194304)));
      var c2 = R2();
      a2 = ih(a2, b2);
      null !== a2 && (Ac(a2, b2, c2), Dk(a2, c2));
    }
    function uj(a2) {
      var b2 = a2.memoizedState, c2 = 0;
      null !== b2 && (c2 = b2.retryLane);
      Yk(a2, c2);
    }
    function bk(a2, b2) {
      var c2 = 0;
      switch (a2.tag) {
        case 13:
          var d2 = a2.stateNode;
          var e2 = a2.memoizedState;
          null !== e2 && (c2 = e2.retryLane);
          break;
        case 19:
          d2 = a2.stateNode;
          break;
        default:
          throw Error(p2(314));
      }
      null !== d2 && d2.delete(b2);
      Yk(a2, c2);
    }
    var Vk;
    Vk = function(a2, b2, c2) {
      if (null !== a2) if (a2.memoizedProps !== b2.pendingProps || Wf.current) dh = true;
      else {
        if (0 === (a2.lanes & c2) && 0 === (b2.flags & 128)) return dh = false, yj(a2, b2, c2);
        dh = 0 !== (a2.flags & 131072) ? true : false;
      }
      else dh = false, I2 && 0 !== (b2.flags & 1048576) && ug(b2, ng, b2.index);
      b2.lanes = 0;
      switch (b2.tag) {
        case 2:
          var d2 = b2.type;
          ij(a2, b2);
          a2 = b2.pendingProps;
          var e2 = Yf(b2, H2.current);
          ch(b2, c2);
          e2 = Nh(null, b2, d2, a2, e2, c2);
          var f2 = Sh();
          b2.flags |= 1;
          "object" === typeof e2 && null !== e2 && "function" === typeof e2.render && void 0 === e2.$$typeof ? (b2.tag = 1, b2.memoizedState = null, b2.updateQueue = null, Zf(d2) ? (f2 = true, cg(b2)) : f2 = false, b2.memoizedState = null !== e2.state && void 0 !== e2.state ? e2.state : null, kh(b2), e2.updater = Ei, b2.stateNode = e2, e2._reactInternals = b2, Ii(b2, d2, a2, c2), b2 = jj(null, b2, d2, true, f2, c2)) : (b2.tag = 0, I2 && f2 && vg(b2), Xi(null, b2, e2, c2), b2 = b2.child);
          return b2;
        case 16:
          d2 = b2.elementType;
          a: {
            ij(a2, b2);
            a2 = b2.pendingProps;
            e2 = d2._init;
            d2 = e2(d2._payload);
            b2.type = d2;
            e2 = b2.tag = Zk(d2);
            a2 = Ci(d2, a2);
            switch (e2) {
              case 0:
                b2 = cj(null, b2, d2, a2, c2);
                break a;
              case 1:
                b2 = hj(null, b2, d2, a2, c2);
                break a;
              case 11:
                b2 = Yi(null, b2, d2, a2, c2);
                break a;
              case 14:
                b2 = $i(null, b2, d2, Ci(d2.type, a2), c2);
                break a;
            }
            throw Error(p2(
              306,
              d2,
              ""
            ));
          }
          return b2;
        case 0:
          return d2 = b2.type, e2 = b2.pendingProps, e2 = b2.elementType === d2 ? e2 : Ci(d2, e2), cj(a2, b2, d2, e2, c2);
        case 1:
          return d2 = b2.type, e2 = b2.pendingProps, e2 = b2.elementType === d2 ? e2 : Ci(d2, e2), hj(a2, b2, d2, e2, c2);
        case 3:
          a: {
            kj(b2);
            if (null === a2) throw Error(p2(387));
            d2 = b2.pendingProps;
            f2 = b2.memoizedState;
            e2 = f2.element;
            lh(a2, b2);
            qh(b2, d2, null, c2);
            var g2 = b2.memoizedState;
            d2 = g2.element;
            if (f2.isDehydrated) if (f2 = { element: d2, isDehydrated: false, cache: g2.cache, pendingSuspenseBoundaries: g2.pendingSuspenseBoundaries, transitions: g2.transitions }, b2.updateQueue.baseState = f2, b2.memoizedState = f2, b2.flags & 256) {
              e2 = Ji(Error(p2(423)), b2);
              b2 = lj(a2, b2, d2, c2, e2);
              break a;
            } else if (d2 !== e2) {
              e2 = Ji(Error(p2(424)), b2);
              b2 = lj(a2, b2, d2, c2, e2);
              break a;
            } else for (yg = Lf(b2.stateNode.containerInfo.firstChild), xg = b2, I2 = true, zg = null, c2 = Vg(b2, null, d2, c2), b2.child = c2; c2; ) c2.flags = c2.flags & -3 | 4096, c2 = c2.sibling;
            else {
              Ig();
              if (d2 === e2) {
                b2 = Zi(a2, b2, c2);
                break a;
              }
              Xi(a2, b2, d2, c2);
            }
            b2 = b2.child;
          }
          return b2;
        case 5:
          return Ah(b2), null === a2 && Eg(b2), d2 = b2.type, e2 = b2.pendingProps, f2 = null !== a2 ? a2.memoizedProps : null, g2 = e2.children, Ef(d2, e2) ? g2 = null : null !== f2 && Ef(d2, f2) && (b2.flags |= 32), gj(a2, b2), Xi(a2, b2, g2, c2), b2.child;
        case 6:
          return null === a2 && Eg(b2), null;
        case 13:
          return oj(a2, b2, c2);
        case 4:
          return yh(b2, b2.stateNode.containerInfo), d2 = b2.pendingProps, null === a2 ? b2.child = Ug(b2, null, d2, c2) : Xi(a2, b2, d2, c2), b2.child;
        case 11:
          return d2 = b2.type, e2 = b2.pendingProps, e2 = b2.elementType === d2 ? e2 : Ci(d2, e2), Yi(a2, b2, d2, e2, c2);
        case 7:
          return Xi(a2, b2, b2.pendingProps, c2), b2.child;
        case 8:
          return Xi(a2, b2, b2.pendingProps.children, c2), b2.child;
        case 12:
          return Xi(a2, b2, b2.pendingProps.children, c2), b2.child;
        case 10:
          a: {
            d2 = b2.type._context;
            e2 = b2.pendingProps;
            f2 = b2.memoizedProps;
            g2 = e2.value;
            G(Wg, d2._currentValue);
            d2._currentValue = g2;
            if (null !== f2) if (He(f2.value, g2)) {
              if (f2.children === e2.children && !Wf.current) {
                b2 = Zi(a2, b2, c2);
                break a;
              }
            } else for (f2 = b2.child, null !== f2 && (f2.return = b2); null !== f2; ) {
              var h2 = f2.dependencies;
              if (null !== h2) {
                g2 = f2.child;
                for (var k2 = h2.firstContext; null !== k2; ) {
                  if (k2.context === d2) {
                    if (1 === f2.tag) {
                      k2 = mh(-1, c2 & -c2);
                      k2.tag = 2;
                      var l = f2.updateQueue;
                      if (null !== l) {
                        l = l.shared;
                        var m2 = l.pending;
                        null === m2 ? k2.next = k2 : (k2.next = m2.next, m2.next = k2);
                        l.pending = k2;
                      }
                    }
                    f2.lanes |= c2;
                    k2 = f2.alternate;
                    null !== k2 && (k2.lanes |= c2);
                    bh(
                      f2.return,
                      c2,
                      b2
                    );
                    h2.lanes |= c2;
                    break;
                  }
                  k2 = k2.next;
                }
              } else if (10 === f2.tag) g2 = f2.type === b2.type ? null : f2.child;
              else if (18 === f2.tag) {
                g2 = f2.return;
                if (null === g2) throw Error(p2(341));
                g2.lanes |= c2;
                h2 = g2.alternate;
                null !== h2 && (h2.lanes |= c2);
                bh(g2, c2, b2);
                g2 = f2.sibling;
              } else g2 = f2.child;
              if (null !== g2) g2.return = f2;
              else for (g2 = f2; null !== g2; ) {
                if (g2 === b2) {
                  g2 = null;
                  break;
                }
                f2 = g2.sibling;
                if (null !== f2) {
                  f2.return = g2.return;
                  g2 = f2;
                  break;
                }
                g2 = g2.return;
              }
              f2 = g2;
            }
            Xi(a2, b2, e2.children, c2);
            b2 = b2.child;
          }
          return b2;
        case 9:
          return e2 = b2.type, d2 = b2.pendingProps.children, ch(b2, c2), e2 = eh(e2), d2 = d2(e2), b2.flags |= 1, Xi(a2, b2, d2, c2), b2.child;
        case 14:
          return d2 = b2.type, e2 = Ci(d2, b2.pendingProps), e2 = Ci(d2.type, e2), $i(a2, b2, d2, e2, c2);
        case 15:
          return bj(a2, b2, b2.type, b2.pendingProps, c2);
        case 17:
          return d2 = b2.type, e2 = b2.pendingProps, e2 = b2.elementType === d2 ? e2 : Ci(d2, e2), ij(a2, b2), b2.tag = 1, Zf(d2) ? (a2 = true, cg(b2)) : a2 = false, ch(b2, c2), Gi(b2, d2, e2), Ii(b2, d2, e2, c2), jj(null, b2, d2, true, a2, c2);
        case 19:
          return xj(a2, b2, c2);
        case 22:
          return dj(a2, b2, c2);
      }
      throw Error(p2(156, b2.tag));
    };
    function Fk(a2, b2) {
      return ac(a2, b2);
    }
    function $k(a2, b2, c2, d2) {
      this.tag = a2;
      this.key = c2;
      this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
      this.index = 0;
      this.ref = null;
      this.pendingProps = b2;
      this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
      this.mode = d2;
      this.subtreeFlags = this.flags = 0;
      this.deletions = null;
      this.childLanes = this.lanes = 0;
      this.alternate = null;
    }
    function Bg(a2, b2, c2, d2) {
      return new $k(a2, b2, c2, d2);
    }
    function aj(a2) {
      a2 = a2.prototype;
      return !(!a2 || !a2.isReactComponent);
    }
    function Zk(a2) {
      if ("function" === typeof a2) return aj(a2) ? 1 : 0;
      if (void 0 !== a2 && null !== a2) {
        a2 = a2.$$typeof;
        if (a2 === Da) return 11;
        if (a2 === Ga) return 14;
      }
      return 2;
    }
    function Pg(a2, b2) {
      var c2 = a2.alternate;
      null === c2 ? (c2 = Bg(a2.tag, b2, a2.key, a2.mode), c2.elementType = a2.elementType, c2.type = a2.type, c2.stateNode = a2.stateNode, c2.alternate = a2, a2.alternate = c2) : (c2.pendingProps = b2, c2.type = a2.type, c2.flags = 0, c2.subtreeFlags = 0, c2.deletions = null);
      c2.flags = a2.flags & 14680064;
      c2.childLanes = a2.childLanes;
      c2.lanes = a2.lanes;
      c2.child = a2.child;
      c2.memoizedProps = a2.memoizedProps;
      c2.memoizedState = a2.memoizedState;
      c2.updateQueue = a2.updateQueue;
      b2 = a2.dependencies;
      c2.dependencies = null === b2 ? null : { lanes: b2.lanes, firstContext: b2.firstContext };
      c2.sibling = a2.sibling;
      c2.index = a2.index;
      c2.ref = a2.ref;
      return c2;
    }
    function Rg(a2, b2, c2, d2, e2, f2) {
      var g2 = 2;
      d2 = a2;
      if ("function" === typeof a2) aj(a2) && (g2 = 1);
      else if ("string" === typeof a2) g2 = 5;
      else a: switch (a2) {
        case ya:
          return Tg(c2.children, e2, f2, b2);
        case za:
          g2 = 8;
          e2 |= 8;
          break;
        case Aa:
          return a2 = Bg(12, c2, b2, e2 | 2), a2.elementType = Aa, a2.lanes = f2, a2;
        case Ea:
          return a2 = Bg(13, c2, b2, e2), a2.elementType = Ea, a2.lanes = f2, a2;
        case Fa:
          return a2 = Bg(19, c2, b2, e2), a2.elementType = Fa, a2.lanes = f2, a2;
        case Ia:
          return pj(c2, e2, f2, b2);
        default:
          if ("object" === typeof a2 && null !== a2) switch (a2.$$typeof) {
            case Ba:
              g2 = 10;
              break a;
            case Ca:
              g2 = 9;
              break a;
            case Da:
              g2 = 11;
              break a;
            case Ga:
              g2 = 14;
              break a;
            case Ha:
              g2 = 16;
              d2 = null;
              break a;
          }
          throw Error(p2(130, null == a2 ? a2 : typeof a2, ""));
      }
      b2 = Bg(g2, c2, b2, e2);
      b2.elementType = a2;
      b2.type = d2;
      b2.lanes = f2;
      return b2;
    }
    function Tg(a2, b2, c2, d2) {
      a2 = Bg(7, a2, d2, b2);
      a2.lanes = c2;
      return a2;
    }
    function pj(a2, b2, c2, d2) {
      a2 = Bg(22, a2, d2, b2);
      a2.elementType = Ia;
      a2.lanes = c2;
      a2.stateNode = { isHidden: false };
      return a2;
    }
    function Qg(a2, b2, c2) {
      a2 = Bg(6, a2, null, b2);
      a2.lanes = c2;
      return a2;
    }
    function Sg(a2, b2, c2) {
      b2 = Bg(4, null !== a2.children ? a2.children : [], a2.key, b2);
      b2.lanes = c2;
      b2.stateNode = { containerInfo: a2.containerInfo, pendingChildren: null, implementation: a2.implementation };
      return b2;
    }
    function al(a2, b2, c2, d2, e2) {
      this.tag = b2;
      this.containerInfo = a2;
      this.finishedWork = this.pingCache = this.current = this.pendingChildren = null;
      this.timeoutHandle = -1;
      this.callbackNode = this.pendingContext = this.context = null;
      this.callbackPriority = 0;
      this.eventTimes = zc(0);
      this.expirationTimes = zc(-1);
      this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
      this.entanglements = zc(0);
      this.identifierPrefix = d2;
      this.onRecoverableError = e2;
      this.mutableSourceEagerHydrationData = null;
    }
    function bl(a2, b2, c2, d2, e2, f2, g2, h2, k2) {
      a2 = new al(a2, b2, c2, h2, k2);
      1 === b2 ? (b2 = 1, true === f2 && (b2 |= 8)) : b2 = 0;
      f2 = Bg(3, null, null, b2);
      a2.current = f2;
      f2.stateNode = a2;
      f2.memoizedState = { element: d2, isDehydrated: c2, cache: null, transitions: null, pendingSuspenseBoundaries: null };
      kh(f2);
      return a2;
    }
    function cl(a2, b2, c2) {
      var d2 = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
      return { $$typeof: wa, key: null == d2 ? null : "" + d2, children: a2, containerInfo: b2, implementation: c2 };
    }
    function dl(a2) {
      if (!a2) return Vf;
      a2 = a2._reactInternals;
      a: {
        if (Vb(a2) !== a2 || 1 !== a2.tag) throw Error(p2(170));
        var b2 = a2;
        do {
          switch (b2.tag) {
            case 3:
              b2 = b2.stateNode.context;
              break a;
            case 1:
              if (Zf(b2.type)) {
                b2 = b2.stateNode.__reactInternalMemoizedMergedChildContext;
                break a;
              }
          }
          b2 = b2.return;
        } while (null !== b2);
        throw Error(p2(171));
      }
      if (1 === a2.tag) {
        var c2 = a2.type;
        if (Zf(c2)) return bg(a2, c2, b2);
      }
      return b2;
    }
    function el(a2, b2, c2, d2, e2, f2, g2, h2, k2) {
      a2 = bl(c2, d2, true, a2, e2, f2, g2, h2, k2);
      a2.context = dl(null);
      c2 = a2.current;
      d2 = R2();
      e2 = yi(c2);
      f2 = mh(d2, e2);
      f2.callback = void 0 !== b2 && null !== b2 ? b2 : null;
      nh(c2, f2, e2);
      a2.current.lanes = e2;
      Ac(a2, e2, d2);
      Dk(a2, d2);
      return a2;
    }
    function fl(a2, b2, c2, d2) {
      var e2 = b2.current, f2 = R2(), g2 = yi(e2);
      c2 = dl(c2);
      null === b2.context ? b2.context = c2 : b2.pendingContext = c2;
      b2 = mh(f2, g2);
      b2.payload = { element: a2 };
      d2 = void 0 === d2 ? null : d2;
      null !== d2 && (b2.callback = d2);
      a2 = nh(e2, b2, g2);
      null !== a2 && (gi(a2, e2, g2, f2), oh(a2, e2, g2));
      return g2;
    }
    function gl(a2) {
      a2 = a2.current;
      if (!a2.child) return null;
      switch (a2.child.tag) {
        case 5:
          return a2.child.stateNode;
        default:
          return a2.child.stateNode;
      }
    }
    function hl(a2, b2) {
      a2 = a2.memoizedState;
      if (null !== a2 && null !== a2.dehydrated) {
        var c2 = a2.retryLane;
        a2.retryLane = 0 !== c2 && c2 < b2 ? c2 : b2;
      }
    }
    function il(a2, b2) {
      hl(a2, b2);
      (a2 = a2.alternate) && hl(a2, b2);
    }
    function jl() {
      return null;
    }
    var kl = "function" === typeof reportError ? reportError : function(a2) {
      console.error(a2);
    };
    function ll(a2) {
      this._internalRoot = a2;
    }
    ml.prototype.render = ll.prototype.render = function(a2) {
      var b2 = this._internalRoot;
      if (null === b2) throw Error(p2(409));
      fl(a2, b2, null, null);
    };
    ml.prototype.unmount = ll.prototype.unmount = function() {
      var a2 = this._internalRoot;
      if (null !== a2) {
        this._internalRoot = null;
        var b2 = a2.containerInfo;
        Rk(function() {
          fl(null, a2, null, null);
        });
        b2[uf] = null;
      }
    };
    function ml(a2) {
      this._internalRoot = a2;
    }
    ml.prototype.unstable_scheduleHydration = function(a2) {
      if (a2) {
        var b2 = Hc();
        a2 = { blockedOn: null, target: a2, priority: b2 };
        for (var c2 = 0; c2 < Qc.length && 0 !== b2 && b2 < Qc[c2].priority; c2++) ;
        Qc.splice(c2, 0, a2);
        0 === c2 && Vc(a2);
      }
    };
    function nl(a2) {
      return !(!a2 || 1 !== a2.nodeType && 9 !== a2.nodeType && 11 !== a2.nodeType);
    }
    function ol(a2) {
      return !(!a2 || 1 !== a2.nodeType && 9 !== a2.nodeType && 11 !== a2.nodeType && (8 !== a2.nodeType || " react-mount-point-unstable " !== a2.nodeValue));
    }
    function pl() {
    }
    function ql(a2, b2, c2, d2, e2) {
      if (e2) {
        if ("function" === typeof d2) {
          var f2 = d2;
          d2 = function() {
            var a3 = gl(g2);
            f2.call(a3);
          };
        }
        var g2 = el(b2, d2, a2, 0, null, false, false, "", pl);
        a2._reactRootContainer = g2;
        a2[uf] = g2.current;
        sf(8 === a2.nodeType ? a2.parentNode : a2);
        Rk();
        return g2;
      }
      for (; e2 = a2.lastChild; ) a2.removeChild(e2);
      if ("function" === typeof d2) {
        var h2 = d2;
        d2 = function() {
          var a3 = gl(k2);
          h2.call(a3);
        };
      }
      var k2 = bl(a2, 0, false, null, null, false, false, "", pl);
      a2._reactRootContainer = k2;
      a2[uf] = k2.current;
      sf(8 === a2.nodeType ? a2.parentNode : a2);
      Rk(function() {
        fl(b2, k2, c2, d2);
      });
      return k2;
    }
    function rl(a2, b2, c2, d2, e2) {
      var f2 = c2._reactRootContainer;
      if (f2) {
        var g2 = f2;
        if ("function" === typeof e2) {
          var h2 = e2;
          e2 = function() {
            var a3 = gl(g2);
            h2.call(a3);
          };
        }
        fl(b2, g2, a2, e2);
      } else g2 = ql(c2, b2, a2, e2, d2);
      return gl(g2);
    }
    Ec = function(a2) {
      switch (a2.tag) {
        case 3:
          var b2 = a2.stateNode;
          if (b2.current.memoizedState.isDehydrated) {
            var c2 = tc(b2.pendingLanes);
            0 !== c2 && (Cc(b2, c2 | 1), Dk(b2, B2()), 0 === (K & 6) && (Gj = B2() + 500, jg()));
          }
          break;
        case 13:
          Rk(function() {
            var b3 = ih(a2, 1);
            if (null !== b3) {
              var c3 = R2();
              gi(b3, a2, 1, c3);
            }
          }), il(a2, 1);
      }
    };
    Fc = function(a2) {
      if (13 === a2.tag) {
        var b2 = ih(a2, 134217728);
        if (null !== b2) {
          var c2 = R2();
          gi(b2, a2, 134217728, c2);
        }
        il(a2, 134217728);
      }
    };
    Gc = function(a2) {
      if (13 === a2.tag) {
        var b2 = yi(a2), c2 = ih(a2, b2);
        if (null !== c2) {
          var d2 = R2();
          gi(c2, a2, b2, d2);
        }
        il(a2, b2);
      }
    };
    Hc = function() {
      return C2;
    };
    Ic = function(a2, b2) {
      var c2 = C2;
      try {
        return C2 = a2, b2();
      } finally {
        C2 = c2;
      }
    };
    yb = function(a2, b2, c2) {
      switch (b2) {
        case "input":
          bb(a2, c2);
          b2 = c2.name;
          if ("radio" === c2.type && null != b2) {
            for (c2 = a2; c2.parentNode; ) c2 = c2.parentNode;
            c2 = c2.querySelectorAll("input[name=" + JSON.stringify("" + b2) + '][type="radio"]');
            for (b2 = 0; b2 < c2.length; b2++) {
              var d2 = c2[b2];
              if (d2 !== a2 && d2.form === a2.form) {
                var e2 = Db(d2);
                if (!e2) throw Error(p2(90));
                Wa(d2);
                bb(d2, e2);
              }
            }
          }
          break;
        case "textarea":
          ib(a2, c2);
          break;
        case "select":
          b2 = c2.value, null != b2 && fb(a2, !!c2.multiple, b2, false);
      }
    };
    Gb = Qk;
    Hb = Rk;
    var sl = { usingClientEntryPoint: false, Events: [Cb, ue, Db, Eb, Fb, Qk] };
    var tl = { findFiberByHostInstance: Wc, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" };
    var ul = { bundleType: tl.bundleType, version: tl.version, rendererPackageName: tl.rendererPackageName, rendererConfig: tl.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: ua.ReactCurrentDispatcher, findHostInstanceByFiber: function(a2) {
      a2 = Zb(a2);
      return null === a2 ? null : a2.stateNode;
    }, findFiberByHostInstance: tl.findFiberByHostInstance || jl, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
    if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
      vl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (!vl.isDisabled && vl.supportsFiber) try {
        kc = vl.inject(ul), lc = vl;
      } catch (a2) {
      }
    }
    var vl;
    exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = sl;
    exports.createPortal = function(a2, b2) {
      var c2 = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
      if (!nl(b2)) throw Error(p2(200));
      return cl(a2, b2, null, c2);
    };
    exports.createRoot = function(a2, b2) {
      if (!nl(a2)) throw Error(p2(299));
      var c2 = false, d2 = "", e2 = kl;
      null !== b2 && void 0 !== b2 && (true === b2.unstable_strictMode && (c2 = true), void 0 !== b2.identifierPrefix && (d2 = b2.identifierPrefix), void 0 !== b2.onRecoverableError && (e2 = b2.onRecoverableError));
      b2 = bl(a2, 1, false, null, null, c2, false, d2, e2);
      a2[uf] = b2.current;
      sf(8 === a2.nodeType ? a2.parentNode : a2);
      return new ll(b2);
    };
    exports.findDOMNode = function(a2) {
      if (null == a2) return null;
      if (1 === a2.nodeType) return a2;
      var b2 = a2._reactInternals;
      if (void 0 === b2) {
        if ("function" === typeof a2.render) throw Error(p2(188));
        a2 = Object.keys(a2).join(",");
        throw Error(p2(268, a2));
      }
      a2 = Zb(b2);
      a2 = null === a2 ? null : a2.stateNode;
      return a2;
    };
    exports.flushSync = function(a2) {
      return Rk(a2);
    };
    exports.hydrate = function(a2, b2, c2) {
      if (!ol(b2)) throw Error(p2(200));
      return rl(null, a2, b2, true, c2);
    };
    exports.hydrateRoot = function(a2, b2, c2) {
      if (!nl(a2)) throw Error(p2(405));
      var d2 = null != c2 && c2.hydratedSources || null, e2 = false, f2 = "", g2 = kl;
      null !== c2 && void 0 !== c2 && (true === c2.unstable_strictMode && (e2 = true), void 0 !== c2.identifierPrefix && (f2 = c2.identifierPrefix), void 0 !== c2.onRecoverableError && (g2 = c2.onRecoverableError));
      b2 = el(b2, null, a2, 1, null != c2 ? c2 : null, e2, false, f2, g2);
      a2[uf] = b2.current;
      sf(a2);
      if (d2) for (a2 = 0; a2 < d2.length; a2++) c2 = d2[a2], e2 = c2._getVersion, e2 = e2(c2._source), null == b2.mutableSourceEagerHydrationData ? b2.mutableSourceEagerHydrationData = [c2, e2] : b2.mutableSourceEagerHydrationData.push(
        c2,
        e2
      );
      return new ml(b2);
    };
    exports.render = function(a2, b2, c2) {
      if (!ol(b2)) throw Error(p2(200));
      return rl(null, a2, b2, false, c2);
    };
    exports.unmountComponentAtNode = function(a2) {
      if (!ol(a2)) throw Error(p2(40));
      return a2._reactRootContainer ? (Rk(function() {
        rl(null, null, a2, false, function() {
          a2._reactRootContainer = null;
          a2[uf] = null;
        });
      }), true) : false;
    };
    exports.unstable_batchedUpdates = Qk;
    exports.unstable_renderSubtreeIntoContainer = function(a2, b2, c2, d2) {
      if (!ol(c2)) throw Error(p2(200));
      if (null == a2 || void 0 === a2._reactInternals) throw Error(p2(38));
      return rl(a2, b2, c2, false, d2);
    };
    exports.version = "18.3.1-next-f1338f8080-20240426";
  }
});

// node_modules/react-dom/index.js
var require_react_dom = __commonJS({
  "node_modules/react-dom/index.js"(exports, module) {
    "use strict";
    function checkDCE() {
      if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
        return;
      }
      if (false) {
        throw new Error("^_^");
      }
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
      } catch (err) {
        console.error(err);
      }
    }
    if (true) {
      checkDCE();
      module.exports = require_react_dom_production_min();
    } else {
      module.exports = null;
    }
  }
});

// node_modules/react-dom/client.js
var require_client = __commonJS({
  "node_modules/react-dom/client.js"(exports) {
    "use strict";
    var m2 = require_react_dom();
    if (true) {
      exports.createRoot = m2.createRoot;
      exports.hydrateRoot = m2.hydrateRoot;
    } else {
      i2 = m2.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      exports.createRoot = function(c2, o2) {
        i2.usingClientEntryPoint = true;
        try {
          return m2.createRoot(c2, o2);
        } finally {
          i2.usingClientEntryPoint = false;
        }
      };
      exports.hydrateRoot = function(c2, h2, o2) {
        i2.usingClientEntryPoint = true;
        try {
          return m2.hydrateRoot(c2, h2, o2);
        } finally {
          i2.usingClientEntryPoint = false;
        }
      };
    }
    var i2;
  }
});

// node_modules/react/cjs/react-jsx-runtime.production.min.js
var require_react_jsx_runtime_production_min = __commonJS({
  "node_modules/react/cjs/react-jsx-runtime.production.min.js"(exports) {
    "use strict";
    var f2 = require_react();
    var k2 = Symbol.for("react.element");
    var l = Symbol.for("react.fragment");
    var m2 = Object.prototype.hasOwnProperty;
    var n2 = f2.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner;
    var p2 = { key: true, ref: true, __self: true, __source: true };
    function q2(c2, a2, g2) {
      var b2, d2 = {}, e2 = null, h2 = null;
      void 0 !== g2 && (e2 = "" + g2);
      void 0 !== a2.key && (e2 = "" + a2.key);
      void 0 !== a2.ref && (h2 = a2.ref);
      for (b2 in a2) m2.call(a2, b2) && !p2.hasOwnProperty(b2) && (d2[b2] = a2[b2]);
      if (c2 && c2.defaultProps) for (b2 in a2 = c2.defaultProps, a2) void 0 === d2[b2] && (d2[b2] = a2[b2]);
      return { $$typeof: k2, type: c2, key: e2, ref: h2, props: d2, _owner: n2.current };
    }
    exports.Fragment = l;
    exports.jsx = q2;
    exports.jsxs = q2;
  }
});

// node_modules/react/jsx-runtime.js
var require_jsx_runtime = __commonJS({
  "node_modules/react/jsx-runtime.js"(exports, module) {
    "use strict";
    if (true) {
      module.exports = require_react_jsx_runtime_production_min();
    } else {
      module.exports = null;
    }
  }
});

// node_modules/prop-types/lib/ReactPropTypesSecret.js
var require_ReactPropTypesSecret = __commonJS({
  "node_modules/prop-types/lib/ReactPropTypesSecret.js"(exports, module) {
    "use strict";
    var ReactPropTypesSecret = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
    module.exports = ReactPropTypesSecret;
  }
});

// node_modules/prop-types/factoryWithThrowingShims.js
var require_factoryWithThrowingShims = __commonJS({
  "node_modules/prop-types/factoryWithThrowingShims.js"(exports, module) {
    "use strict";
    var ReactPropTypesSecret = require_ReactPropTypesSecret();
    function emptyFunction() {
    }
    function emptyFunctionWithReset() {
    }
    emptyFunctionWithReset.resetWarningCache = emptyFunction;
    module.exports = function() {
      function shim(props, propName, componentName, location, propFullName, secret) {
        if (secret === ReactPropTypesSecret) {
          return;
        }
        var err = new Error(
          "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types"
        );
        err.name = "Invariant Violation";
        throw err;
      }
      ;
      shim.isRequired = shim;
      function getShim() {
        return shim;
      }
      ;
      var ReactPropTypes = {
        array: shim,
        bigint: shim,
        bool: shim,
        func: shim,
        number: shim,
        object: shim,
        string: shim,
        symbol: shim,
        any: shim,
        arrayOf: getShim,
        element: shim,
        elementType: shim,
        instanceOf: getShim,
        node: shim,
        objectOf: getShim,
        oneOf: getShim,
        oneOfType: getShim,
        shape: getShim,
        exact: getShim,
        checkPropTypes: emptyFunctionWithReset,
        resetWarningCache: emptyFunction
      };
      ReactPropTypes.PropTypes = ReactPropTypes;
      return ReactPropTypes;
    };
  }
});

// node_modules/prop-types/index.js
var require_prop_types = __commonJS({
  "node_modules/prop-types/index.js"(exports, module) {
    if (false) {
      ReactIs = null;
      throwOnDirectAccess = true;
      module.exports = null(ReactIs.isElement, throwOnDirectAccess);
    } else {
      module.exports = require_factoryWithThrowingShims()();
    }
    var ReactIs;
    var throwOnDirectAccess;
  }
});

// src/main.jsx
var import_react26 = __toESM(require_react(), 1);
var import_client = __toESM(require_client(), 1);

// node_modules/react-toastify/dist/react-toastify.esm.mjs
var import_react = __toESM(require_react(), 1);

// node_modules/clsx/dist/clsx.mjs
function r(e2) {
  var t3, f2, n2 = "";
  if ("string" == typeof e2 || "number" == typeof e2) n2 += e2;
  else if ("object" == typeof e2) if (Array.isArray(e2)) {
    var o2 = e2.length;
    for (t3 = 0; t3 < o2; t3++) e2[t3] && (f2 = r(e2[t3])) && (n2 && (n2 += " "), n2 += f2);
  } else for (f2 in e2) e2[f2] && (n2 && (n2 += " "), n2 += f2);
  return n2;
}
function clsx() {
  for (var e2, t3, f2 = 0, n2 = "", o2 = arguments.length; f2 < o2; f2++) (e2 = arguments[f2]) && (t3 = r(e2)) && (n2 && (n2 += " "), n2 += t3);
  return n2;
}
var clsx_default = clsx;

// node_modules/react-toastify/dist/react-toastify.esm.mjs
var c = (e2) => "number" == typeof e2 && !isNaN(e2);
var d = (e2) => "string" == typeof e2;
var u = (e2) => "function" == typeof e2;
var p = (e2) => d(e2) || u(e2) ? e2 : null;
var m = (e2) => (0, import_react.isValidElement)(e2) || d(e2) || u(e2) || c(e2);
function f(e2, t3, n2) {
  void 0 === n2 && (n2 = 300);
  const { scrollHeight: o2, style: s2 } = e2;
  requestAnimationFrame(() => {
    s2.minHeight = "initial", s2.height = o2 + "px", s2.transition = `all ${n2}ms`, requestAnimationFrame(() => {
      s2.height = "0", s2.padding = "0", s2.margin = "0", setTimeout(t3, n2);
    });
  });
}
function g(t3) {
  let { enter: a2, exit: r3, appendPosition: i2 = false, collapse: l = true, collapseDuration: c2 = 300 } = t3;
  return function(t4) {
    let { children: d2, position: u2, preventExitTransition: p2, done: m2, nodeRef: g2, isIn: y2, playToast: v2 } = t4;
    const h2 = i2 ? `${a2}--${u2}` : a2, T2 = i2 ? `${r3}--${u2}` : r3, E2 = (0, import_react.useRef)(0);
    return (0, import_react.useLayoutEffect)(() => {
      const e2 = g2.current, t5 = h2.split(" "), n2 = (o2) => {
        o2.target === g2.current && (v2(), e2.removeEventListener("animationend", n2), e2.removeEventListener("animationcancel", n2), 0 === E2.current && "animationcancel" !== o2.type && e2.classList.remove(...t5));
      };
      e2.classList.add(...t5), e2.addEventListener("animationend", n2), e2.addEventListener("animationcancel", n2);
    }, []), (0, import_react.useEffect)(() => {
      const e2 = g2.current, t5 = () => {
        e2.removeEventListener("animationend", t5), l ? f(e2, m2, c2) : m2();
      };
      y2 || (p2 ? t5() : (E2.current = 1, e2.className += ` ${T2}`, e2.addEventListener("animationend", t5)));
    }, [y2]), import_react.default.createElement(import_react.default.Fragment, null, d2);
  };
}
function y(e2, t3) {
  return null != e2 ? { content: e2.content, containerId: e2.props.containerId, id: e2.props.toastId, theme: e2.props.theme, type: e2.props.type, data: e2.props.data || {}, isLoading: e2.props.isLoading, icon: e2.props.icon, status: t3 } : {};
}
var v = /* @__PURE__ */ new Map();
var h = [];
var T = /* @__PURE__ */ new Set();
var E = (e2) => T.forEach((t3) => t3(e2));
var b = () => v.size > 0;
function I(e2, t3) {
  var n2;
  if (t3) return !(null == (n2 = v.get(t3)) || !n2.isToastActive(e2));
  let o2 = false;
  return v.forEach((t4) => {
    t4.isToastActive(e2) && (o2 = true);
  }), o2;
}
function _(e2, t3) {
  m(e2) && (b() || h.push({ content: e2, options: t3 }), v.forEach((n2) => {
    n2.buildToast(e2, t3);
  }));
}
function C(e2, t3) {
  v.forEach((n2) => {
    null != t3 && null != t3 && t3.containerId ? (null == t3 ? void 0 : t3.containerId) === n2.id && n2.toggle(e2, null == t3 ? void 0 : t3.id) : n2.toggle(e2, null == t3 ? void 0 : t3.id);
  });
}
function L(e2) {
  const { subscribe: o2, getSnapshot: s2, setProps: i2 } = (0, import_react.useRef)(function(e3) {
    const n2 = e3.containerId || 1;
    return { subscribe(o3) {
      const s3 = /* @__PURE__ */ function(e4, n3, o4) {
        let s4 = 1, r4 = 0, i3 = [], l2 = [], f2 = [], g2 = n3;
        const v2 = /* @__PURE__ */ new Map(), h2 = /* @__PURE__ */ new Set(), T2 = () => {
          f2 = Array.from(v2.values()), h2.forEach((e5) => e5());
        }, E2 = (e5) => {
          l2 = null == e5 ? [] : l2.filter((t3) => t3 !== e5), T2();
        }, b2 = (e5) => {
          const { toastId: n4, onOpen: s5, updateId: a2, children: r5 } = e5.props, i4 = null == a2;
          e5.staleId && v2.delete(e5.staleId), v2.set(n4, e5), l2 = [...l2, e5.props.toastId].filter((t3) => t3 !== e5.staleId), T2(), o4(y(e5, i4 ? "added" : "updated")), i4 && u(s5) && s5((0, import_react.isValidElement)(r5) && r5.props);
        };
        return { id: e4, props: g2, observe: (e5) => (h2.add(e5), () => h2.delete(e5)), toggle: (e5, t3) => {
          v2.forEach((n4) => {
            null != t3 && t3 !== n4.props.toastId || u(n4.toggle) && n4.toggle(e5);
          });
        }, removeToast: E2, toasts: v2, clearQueue: () => {
          r4 -= i3.length, i3 = [];
        }, buildToast: (n4, l3) => {
          if (((t3) => {
            let { containerId: n5, toastId: o5, updateId: s5 } = t3;
            const a2 = n5 ? n5 !== e4 : 1 !== e4, r5 = v2.has(o5) && null == s5;
            return a2 || r5;
          })(l3)) return;
          const { toastId: f3, updateId: h3, data: I2, staleId: _2, delay: C2 } = l3, L2 = () => {
            E2(f3);
          }, N2 = null == h3;
          N2 && r4++;
          const $2 = { ...g2, style: g2.toastStyle, key: s4++, ...Object.fromEntries(Object.entries(l3).filter((e5) => {
            let [t3, n5] = e5;
            return null != n5;
          })), toastId: f3, updateId: h3, data: I2, closeToast: L2, isIn: false, className: p(l3.className || g2.toastClassName), bodyClassName: p(l3.bodyClassName || g2.bodyClassName), progressClassName: p(l3.progressClassName || g2.progressClassName), autoClose: !l3.isLoading && (w2 = l3.autoClose, k2 = g2.autoClose, false === w2 || c(w2) && w2 > 0 ? w2 : k2), deleteToast() {
            const e5 = v2.get(f3), { onClose: n5, children: s5 } = e5.props;
            u(n5) && n5((0, import_react.isValidElement)(s5) && s5.props), o4(y(e5, "removed")), v2.delete(f3), r4--, r4 < 0 && (r4 = 0), i3.length > 0 ? b2(i3.shift()) : T2();
          } };
          var w2, k2;
          $2.closeButton = g2.closeButton, false === l3.closeButton || m(l3.closeButton) ? $2.closeButton = l3.closeButton : true === l3.closeButton && ($2.closeButton = !m(g2.closeButton) || g2.closeButton);
          let P2 = n4;
          (0, import_react.isValidElement)(n4) && !d(n4.type) ? P2 = (0, import_react.cloneElement)(n4, { closeToast: L2, toastProps: $2, data: I2 }) : u(n4) && (P2 = n4({ closeToast: L2, toastProps: $2, data: I2 }));
          const M2 = { content: P2, props: $2, staleId: _2 };
          g2.limit && g2.limit > 0 && r4 > g2.limit && N2 ? i3.push(M2) : c(C2) ? setTimeout(() => {
            b2(M2);
          }, C2) : b2(M2);
        }, setProps(e5) {
          g2 = e5;
        }, setToggle: (e5, t3) => {
          v2.get(e5).toggle = t3;
        }, isToastActive: (e5) => l2.some((t3) => t3 === e5), getSnapshot: () => f2 };
      }(n2, e3, E);
      v.set(n2, s3);
      const r3 = s3.observe(o3);
      return h.forEach((e4) => _(e4.content, e4.options)), h = [], () => {
        r3(), v.delete(n2);
      };
    }, setProps(e4) {
      var t3;
      null == (t3 = v.get(n2)) || t3.setProps(e4);
    }, getSnapshot() {
      var e4;
      return null == (e4 = v.get(n2)) ? void 0 : e4.getSnapshot();
    } };
  }(e2)).current;
  i2(e2);
  const l = (0, import_react.useSyncExternalStore)(o2, s2, s2);
  return { getToastToRender: function(t3) {
    if (!l) return [];
    const n2 = /* @__PURE__ */ new Map();
    return e2.newestOnTop && l.reverse(), l.forEach((e3) => {
      const { position: t4 } = e3.props;
      n2.has(t4) || n2.set(t4, []), n2.get(t4).push(e3);
    }), Array.from(n2, (e3) => t3(e3[0], e3[1]));
  }, isToastActive: I, count: null == l ? void 0 : l.length };
}
function N(e2) {
  const [t3, o2] = (0, import_react.useState)(false), [a2, r3] = (0, import_react.useState)(false), l = (0, import_react.useRef)(null), c2 = (0, import_react.useRef)({ start: 0, delta: 0, removalDistance: 0, canCloseOnClick: true, canDrag: false, didMove: false }).current, { autoClose: d2, pauseOnHover: u2, closeToast: p2, onClick: m2, closeOnClick: f2 } = e2;
  var g2, y2;
  function h2() {
    o2(true);
  }
  function T2() {
    o2(false);
  }
  function E2(n2) {
    const o3 = l.current;
    c2.canDrag && o3 && (c2.didMove = true, t3 && T2(), c2.delta = "x" === e2.draggableDirection ? n2.clientX - c2.start : n2.clientY - c2.start, c2.start !== n2.clientX && (c2.canCloseOnClick = false), o3.style.transform = `translate3d(${"x" === e2.draggableDirection ? `${c2.delta}px, var(--y)` : `0, calc(${c2.delta}px + var(--y))`},0)`, o3.style.opacity = "" + (1 - Math.abs(c2.delta / c2.removalDistance)));
  }
  function b2() {
    document.removeEventListener("pointermove", E2), document.removeEventListener("pointerup", b2);
    const t4 = l.current;
    if (c2.canDrag && c2.didMove && t4) {
      if (c2.canDrag = false, Math.abs(c2.delta) > c2.removalDistance) return r3(true), e2.closeToast(), void e2.collapseAll();
      t4.style.transition = "transform 0.2s, opacity 0.2s", t4.style.removeProperty("transform"), t4.style.removeProperty("opacity");
    }
  }
  null == (y2 = v.get((g2 = { id: e2.toastId, containerId: e2.containerId, fn: o2 }).containerId || 1)) || y2.setToggle(g2.id, g2.fn), (0, import_react.useEffect)(() => {
    if (e2.pauseOnFocusLoss) return document.hasFocus() || T2(), window.addEventListener("focus", h2), window.addEventListener("blur", T2), () => {
      window.removeEventListener("focus", h2), window.removeEventListener("blur", T2);
    };
  }, [e2.pauseOnFocusLoss]);
  const I2 = { onPointerDown: function(t4) {
    if (true === e2.draggable || e2.draggable === t4.pointerType) {
      c2.didMove = false, document.addEventListener("pointermove", E2), document.addEventListener("pointerup", b2);
      const n2 = l.current;
      c2.canCloseOnClick = true, c2.canDrag = true, n2.style.transition = "none", "x" === e2.draggableDirection ? (c2.start = t4.clientX, c2.removalDistance = n2.offsetWidth * (e2.draggablePercent / 100)) : (c2.start = t4.clientY, c2.removalDistance = n2.offsetHeight * (80 === e2.draggablePercent ? 1.5 * e2.draggablePercent : e2.draggablePercent) / 100);
    }
  }, onPointerUp: function(t4) {
    const { top: n2, bottom: o3, left: s2, right: a3 } = l.current.getBoundingClientRect();
    "touchend" !== t4.nativeEvent.type && e2.pauseOnHover && t4.clientX >= s2 && t4.clientX <= a3 && t4.clientY >= n2 && t4.clientY <= o3 ? T2() : h2();
  } };
  return d2 && u2 && (I2.onMouseEnter = T2, e2.stacked || (I2.onMouseLeave = h2)), f2 && (I2.onClick = (e3) => {
    m2 && m2(e3), c2.canCloseOnClick && p2();
  }), { playToast: h2, pauseToast: T2, isRunning: t3, preventExitTransition: a2, toastRef: l, eventHandlers: I2 };
}
function $(t3) {
  let { delay: n2, isRunning: o2, closeToast: s2, type: a2 = "default", hide: r3, className: i2, style: c2, controlledProgress: d2, progress: p2, rtl: m2, isIn: f2, theme: g2 } = t3;
  const y2 = r3 || d2 && 0 === p2, v2 = { ...c2, animationDuration: `${n2}ms`, animationPlayState: o2 ? "running" : "paused" };
  d2 && (v2.transform = `scaleX(${p2})`);
  const h2 = clsx_default("Toastify__progress-bar", d2 ? "Toastify__progress-bar--controlled" : "Toastify__progress-bar--animated", `Toastify__progress-bar-theme--${g2}`, `Toastify__progress-bar--${a2}`, { "Toastify__progress-bar--rtl": m2 }), T2 = u(i2) ? i2({ rtl: m2, type: a2, defaultClassName: h2 }) : clsx_default(h2, i2), E2 = { [d2 && p2 >= 1 ? "onTransitionEnd" : "onAnimationEnd"]: d2 && p2 < 1 ? null : () => {
    f2 && s2();
  } };
  return import_react.default.createElement("div", { className: "Toastify__progress-bar--wrp", "data-hidden": y2 }, import_react.default.createElement("div", { className: `Toastify__progress-bar--bg Toastify__progress-bar-theme--${g2} Toastify__progress-bar--${a2}` }), import_react.default.createElement("div", { role: "progressbar", "aria-hidden": y2 ? "true" : "false", "aria-label": "notification timer", className: T2, style: v2, ...E2 }));
}
var w = 1;
var k = () => "" + w++;
function P(e2) {
  return e2 && (d(e2.toastId) || c(e2.toastId)) ? e2.toastId : k();
}
function M(e2, t3) {
  return _(e2, t3), t3.toastId;
}
function x(e2, t3) {
  return { ...t3, type: t3 && t3.type || e2, toastId: P(t3) };
}
function A(e2) {
  return (t3, n2) => M(t3, x(e2, n2));
}
function B(e2, t3) {
  return M(e2, x("default", t3));
}
B.loading = (e2, t3) => M(e2, x("default", { isLoading: true, autoClose: false, closeOnClick: false, closeButton: false, draggable: false, ...t3 })), B.promise = function(e2, t3, n2) {
  let o2, { pending: s2, error: a2, success: r3 } = t3;
  s2 && (o2 = d(s2) ? B.loading(s2, n2) : B.loading(s2.render, { ...n2, ...s2 }));
  const i2 = { isLoading: null, autoClose: null, closeOnClick: null, closeButton: null, draggable: null }, l = (e3, t4, s3) => {
    if (null == t4) return void B.dismiss(o2);
    const a3 = { type: e3, ...i2, ...n2, data: s3 }, r4 = d(t4) ? { render: t4 } : t4;
    return o2 ? B.update(o2, { ...a3, ...r4 }) : B(r4.render, { ...a3, ...r4 }), s3;
  }, c2 = u(e2) ? e2() : e2;
  return c2.then((e3) => l("success", r3, e3)).catch((e3) => l("error", a2, e3)), c2;
}, B.success = A("success"), B.info = A("info"), B.error = A("error"), B.warning = A("warning"), B.warn = B.warning, B.dark = (e2, t3) => M(e2, x("default", { theme: "dark", ...t3 })), B.dismiss = function(e2) {
  !function(e3) {
    var t3;
    if (b()) {
      if (null == e3 || d(t3 = e3) || c(t3)) v.forEach((t4) => {
        t4.removeToast(e3);
      });
      else if (e3 && ("containerId" in e3 || "id" in e3)) {
        const t4 = v.get(e3.containerId);
        t4 ? t4.removeToast(e3.id) : v.forEach((t5) => {
          t5.removeToast(e3.id);
        });
      }
    } else h = h.filter((t4) => null != e3 && t4.options.toastId !== e3);
  }(e2);
}, B.clearWaitingQueue = function(e2) {
  void 0 === e2 && (e2 = {}), v.forEach((t3) => {
    !t3.props.limit || e2.containerId && t3.id !== e2.containerId || t3.clearQueue();
  });
}, B.isActive = I, B.update = function(e2, t3) {
  void 0 === t3 && (t3 = {});
  const n2 = ((e3, t4) => {
    var n3;
    let { containerId: o2 } = t4;
    return null == (n3 = v.get(o2 || 1)) ? void 0 : n3.toasts.get(e3);
  })(e2, t3);
  if (n2) {
    const { props: o2, content: s2 } = n2, a2 = { delay: 100, ...o2, ...t3, toastId: t3.toastId || e2, updateId: k() };
    a2.toastId !== e2 && (a2.staleId = e2);
    const r3 = a2.render || s2;
    delete a2.render, M(r3, a2);
  }
}, B.done = (e2) => {
  B.update(e2, { progress: 1 });
}, B.onChange = function(e2) {
  return T.add(e2), () => {
    T.delete(e2);
  };
}, B.play = (e2) => C(true, e2), B.pause = (e2) => C(false, e2);
var O = "undefined" != typeof window ? import_react.useLayoutEffect : import_react.useEffect;
var D = (t3) => {
  let { theme: n2, type: o2, isLoading: s2, ...a2 } = t3;
  return import_react.default.createElement("svg", { viewBox: "0 0 24 24", width: "100%", height: "100%", fill: "colored" === n2 ? "currentColor" : `var(--toastify-icon-color-${o2})`, ...a2 });
};
var z = { info: function(t3) {
  return import_react.default.createElement(D, { ...t3 }, import_react.default.createElement("path", { d: "M12 0a12 12 0 1012 12A12.013 12.013 0 0012 0zm.25 5a1.5 1.5 0 11-1.5 1.5 1.5 1.5 0 011.5-1.5zm2.25 13.5h-4a1 1 0 010-2h.75a.25.25 0 00.25-.25v-4.5a.25.25 0 00-.25-.25h-.75a1 1 0 010-2h1a2 2 0 012 2v4.75a.25.25 0 00.25.25h.75a1 1 0 110 2z" }));
}, warning: function(t3) {
  return import_react.default.createElement(D, { ...t3 }, import_react.default.createElement("path", { d: "M23.32 17.191L15.438 2.184C14.728.833 13.416 0 11.996 0c-1.42 0-2.733.833-3.443 2.184L.533 17.448a4.744 4.744 0 000 4.368C1.243 23.167 2.555 24 3.975 24h16.05C22.22 24 24 22.044 24 19.632c0-.904-.251-1.746-.68-2.44zm-9.622 1.46c0 1.033-.724 1.823-1.698 1.823s-1.698-.79-1.698-1.822v-.043c0-1.028.724-1.822 1.698-1.822s1.698.79 1.698 1.822v.043zm.039-12.285l-.84 8.06c-.057.581-.408.943-.897.943-.49 0-.84-.367-.896-.942l-.84-8.065c-.057-.624.25-1.095.779-1.095h1.91c.528.005.84.476.784 1.1z" }));
}, success: function(t3) {
  return import_react.default.createElement(D, { ...t3 }, import_react.default.createElement("path", { d: "M12 0a12 12 0 1012 12A12.014 12.014 0 0012 0zm6.927 8.2l-6.845 9.289a1.011 1.011 0 01-1.43.188l-4.888-3.908a1 1 0 111.25-1.562l4.076 3.261 6.227-8.451a1 1 0 111.61 1.183z" }));
}, error: function(t3) {
  return import_react.default.createElement(D, { ...t3 }, import_react.default.createElement("path", { d: "M11.983 0a12.206 12.206 0 00-8.51 3.653A11.8 11.8 0 000 12.207 11.779 11.779 0 0011.8 24h.214A12.111 12.111 0 0024 11.791 11.766 11.766 0 0011.983 0zM10.5 16.542a1.476 1.476 0 011.449-1.53h.027a1.527 1.527 0 011.523 1.47 1.475 1.475 0 01-1.449 1.53h-.027a1.529 1.529 0 01-1.523-1.47zM11 12.5v-6a1 1 0 012 0v6a1 1 0 11-2 0z" }));
}, spinner: function() {
  return import_react.default.createElement("div", { className: "Toastify__spinner" });
} };
var R = (n2) => {
  const { isRunning: o2, preventExitTransition: s2, toastRef: r3, eventHandlers: i2, playToast: c2 } = N(n2), { closeButton: d2, children: p2, autoClose: m2, onClick: f2, type: g2, hideProgressBar: y2, closeToast: v2, transition: h2, position: T2, className: E2, style: b2, bodyClassName: I2, bodyStyle: _2, progressClassName: C2, progressStyle: L2, updateId: w2, role: k2, progress: P2, rtl: M2, toastId: x2, deleteToast: A2, isIn: B2, isLoading: O2, closeOnClick: D2, theme: R2 } = n2, S2 = clsx_default("Toastify__toast", `Toastify__toast-theme--${R2}`, `Toastify__toast--${g2}`, { "Toastify__toast--rtl": M2 }, { "Toastify__toast--close-on-click": D2 }), H2 = u(E2) ? E2({ rtl: M2, position: T2, type: g2, defaultClassName: S2 }) : clsx_default(S2, E2), F2 = function(e2) {
    let { theme: n3, type: o3, isLoading: s3, icon: r4 } = e2, i3 = null;
    const l = { theme: n3, type: o3 };
    return false === r4 || (u(r4) ? i3 = r4({ ...l, isLoading: s3 }) : (0, import_react.isValidElement)(r4) ? i3 = (0, import_react.cloneElement)(r4, l) : s3 ? i3 = z.spinner() : ((e3) => e3 in z)(o3) && (i3 = z[o3](l))), i3;
  }(n2), X2 = !!P2 || !m2, Y2 = { closeToast: v2, type: g2, theme: R2 };
  let q2 = null;
  return false === d2 || (q2 = u(d2) ? d2(Y2) : (0, import_react.isValidElement)(d2) ? (0, import_react.cloneElement)(d2, Y2) : function(t3) {
    let { closeToast: n3, theme: o3, ariaLabel: s3 = "close" } = t3;
    return import_react.default.createElement("button", { className: `Toastify__close-button Toastify__close-button--${o3}`, type: "button", onClick: (e2) => {
      e2.stopPropagation(), n3(e2);
    }, "aria-label": s3 }, import_react.default.createElement("svg", { "aria-hidden": "true", viewBox: "0 0 14 16" }, import_react.default.createElement("path", { fillRule: "evenodd", d: "M7.71 8.23l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75L1 11.98l3.75-3.75L1 4.48 2.48 3l3.75 3.75L9.98 3l1.48 1.48-3.75 3.75z" })));
  }(Y2)), import_react.default.createElement(h2, { isIn: B2, done: A2, position: T2, preventExitTransition: s2, nodeRef: r3, playToast: c2 }, import_react.default.createElement("div", { id: x2, onClick: f2, "data-in": B2, className: H2, ...i2, style: b2, ref: r3 }, import_react.default.createElement("div", { ...B2 && { role: k2 }, className: u(I2) ? I2({ type: g2 }) : clsx_default("Toastify__toast-body", I2), style: _2 }, null != F2 && import_react.default.createElement("div", { className: clsx_default("Toastify__toast-icon", { "Toastify--animate-icon Toastify__zoom-enter": !O2 }) }, F2), import_react.default.createElement("div", null, p2)), q2, import_react.default.createElement($, { ...w2 && !X2 ? { key: `pb-${w2}` } : {}, rtl: M2, theme: R2, delay: m2, isRunning: o2, isIn: B2, closeToast: v2, hide: y2, type: g2, style: L2, className: C2, controlledProgress: X2, progress: P2 || 0 })));
};
var S = function(e2, t3) {
  return void 0 === t3 && (t3 = false), { enter: `Toastify--animate Toastify__${e2}-enter`, exit: `Toastify--animate Toastify__${e2}-exit`, appendPosition: t3 };
};
var H = g(S("bounce", true));
var F = g(S("slide", true));
var X = g(S("zoom"));
var Y = g(S("flip"));
var q = { position: "top-right", transition: H, autoClose: 5e3, closeButton: true, pauseOnHover: true, pauseOnFocusLoss: true, draggable: "touch", draggablePercent: 80, draggableDirection: "x", role: "alert", theme: "light" };
function Q(t3) {
  let o2 = { ...q, ...t3 };
  const s2 = t3.stacked, [a2, r3] = (0, import_react.useState)(true), c2 = (0, import_react.useRef)(null), { getToastToRender: d2, isToastActive: m2, count: f2 } = L(o2), { className: g2, style: y2, rtl: v2, containerId: h2 } = o2;
  function T2(e2) {
    const t4 = clsx_default("Toastify__toast-container", `Toastify__toast-container--${e2}`, { "Toastify__toast-container--rtl": v2 });
    return u(g2) ? g2({ position: e2, rtl: v2, defaultClassName: t4 }) : clsx_default(t4, p(g2));
  }
  function E2() {
    s2 && (r3(true), B.play());
  }
  return O(() => {
    if (s2) {
      var e2;
      const t4 = c2.current.querySelectorAll('[data-in="true"]'), n2 = 12, s3 = null == (e2 = o2.position) ? void 0 : e2.includes("top");
      let r4 = 0, i2 = 0;
      Array.from(t4).reverse().forEach((e3, t5) => {
        const o3 = e3;
        o3.classList.add("Toastify__toast--stacked"), t5 > 0 && (o3.dataset.collapsed = `${a2}`), o3.dataset.pos || (o3.dataset.pos = s3 ? "top" : "bot");
        const l = r4 * (a2 ? 0.2 : 1) + (a2 ? 0 : n2 * t5);
        o3.style.setProperty("--y", `${s3 ? l : -1 * l}px`), o3.style.setProperty("--g", `${n2}`), o3.style.setProperty("--s", "" + (1 - (a2 ? i2 : 0))), r4 += o3.offsetHeight, i2 += 0.025;
      });
    }
  }, [a2, f2, s2]), import_react.default.createElement("div", { ref: c2, className: "Toastify", id: h2, onMouseEnter: () => {
    s2 && (r3(false), B.pause());
  }, onMouseLeave: E2 }, d2((t4, n2) => {
    const o3 = n2.length ? { ...y2 } : { ...y2, pointerEvents: "none" };
    return import_react.default.createElement("div", { className: T2(t4), style: o3, key: `container-${t4}` }, n2.map((t5) => {
      let { content: n3, props: o4 } = t5;
      return import_react.default.createElement(R, { ...o4, stacked: s2, collapseAll: E2, isIn: m2(o4.toastId, o4.containerId), style: o4.style, key: `toast-${o4.key}` }, n3);
    }));
  }));
}

// utils/AuthContext.jsx
var import_react2 = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var AuthContext = (0, import_react2.createContext)({
  user: null,
  isAuthenticated: false,
  isAdmin: false
});
function readStoredUser() {
  try {
    const raw = localStorage.getItem("current_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}
function readAuth() {
  const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
  const stored = readStoredUser();
  if (!token) {
    return { user: stored, isAuthenticated: Boolean(stored?.id), isAdmin: Boolean(stored?.is_admin) };
  }
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const jwtUser = {
      id: String(payload.sub || payload.user_id || payload.id || ""),
      email: payload.email || stored?.email,
      name: payload.name || stored?.name || payload.email,
      role: payload.role || stored?.role || "recipient",
      is_admin: Boolean(payload.is_admin ?? stored?.is_admin),
      community_id: payload.community_id ?? stored?.community_id ?? null,
      address: payload.address || stored?.address || null
    };
    const user = stored ? { ...jwtUser, ...stored, id: jwtUser.id || stored.id } : jwtUser;
    return {
      user,
      isAuthenticated: Boolean(user.id),
      isAdmin: Boolean(user.is_admin) || String(user.role || "").toLowerCase() === "admin"
    };
  } catch {
    return {
      user: stored,
      isAuthenticated: Boolean(stored?.id),
      isAdmin: Boolean(stored?.is_admin)
    };
  }
}
function AuthProvider({ children }) {
  const [auth, setAuth] = (0, import_react2.useState)(readAuth);
  (0, import_react2.useEffect)(() => {
    const refresh = () => setAuth(readAuth());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("foodmaps:auth_changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("foodmaps:auth_changed", refresh);
    };
  }, []);
  const value = (0, import_react2.useMemo)(() => ({
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isAdmin: auth.isAdmin
  }), [auth]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, { value, children });
}
function useAuthContext() {
  return (0, import_react2.useContext)(AuthContext);
}

// utils/MapContext.jsx
var import_react3 = __toESM(require_react(), 1);
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
var MapContext = (0, import_react3.createContext)({
  applyToolResults: () => {
  },
  clearAIOverlays: () => {
  }
});
var MAP_TOOLS = /* @__PURE__ */ new Set([
  "search_food_near_user",
  "search_food_nearby",
  "get_recent_listings",
  "get_community_listings",
  "get_user_listings",
  "get_my_claims",
  "get_mapbox_route",
  "show_route_to_listing",
  "query_distribution_centers",
  "optimize_pickup_route"
]);
function MapProvider({ children }) {
  const applyToolResults = (0, import_react3.useCallback)((toolResults) => {
    if (!Array.isArray(toolResults)) return;
    for (const tr of toolResults) {
      const tool = tr.tool;
      const result = tr.result ?? tr;
      if (!MAP_TOOLS.has(tool)) continue;
      if (tool === "show_route_to_listing" && result.route) {
        try {
          window.__foodmapsPendingRoute = { route: result.route, at: Date.now() };
        } catch (_2) {
        }
        window.dispatchEvent(new CustomEvent("foodmaps:show_route", {
          detail: { route: result.route, summary: result.summary }
        }));
      }
      const listings = result.listings || result.results || result.stops;
      if (listings?.length) {
        const first = listings[0];
        const lat = first.latitude ?? first.lat ?? first.coords_lat;
        const lng = first.longitude ?? first.lng ?? first.coords_lng;
        if (lat != null && lng != null) {
          window.dispatchEvent(new CustomEvent("foodmaps:fly_to", {
            detail: { lat: parseFloat(lat), lng: parseFloat(lng), zoom: 13 }
          }));
        }
      }
    }
  }, []);
  const clearAIOverlays = (0, import_react3.useCallback)(() => {
    try {
      delete window.__foodmapsPendingRoute;
    } catch (_2) {
    }
  }, []);
  const value = (0, import_react3.useMemo)(() => ({ applyToolResults, clearAIOverlays }), [applyToolResults, clearAIOverlays]);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(MapContext.Provider, { value, children });
}
function useMapContext() {
  return (0, import_react3.useContext)(MapContext);
}

// utils/UIControlContext.jsx
var import_react4 = __toESM(require_react(), 1);
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
var UIControlContext = (0, import_react4.createContext)({
  registerHandler: () => () => {
  },
  executeUIAction: () => 0,
  executeUIActionsFromToolResults: () => 0
});
var UI_CONTROL_TOOLS = /* @__PURE__ */ new Set(["show_map", "navigate_ui", "show_route_to_listing"]);
function dispatchUIAction(action) {
  if (!action) return;
  const act = (action.action || "open").toLowerCase();
  const rawPath = (action.path || action.target || "").toString();
  const pathNoSlash = rawPath.replace(/^\//, "");
  const tgt = pathNoSlash.split("?")[0].toLowerCase();
  const query = pathNoSlash.includes("?") ? pathNoSlash.split("?").slice(1).join("?") : action.query || null;
  if (action.tool === "show_route_to_listing" && action.route) {
    try {
      window.__foodmapsPendingRoute = { route: action.route, summary: action.summary || null, at: Date.now() };
    } catch (_2) {
    }
    window.dispatchEvent(new CustomEvent("foodmaps:show_map", { detail: { summary: action.summary } }));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("foodmaps:show_route", {
        detail: { route: action.route, summary: action.summary || null }
      }));
    }, 150);
    return;
  }
  if (action.tool === "show_map" || act === "open_map" || tgt === "map") {
    window.dispatchEvent(new CustomEvent("foodmaps:show_map", { detail: { summary: action.summary } }));
    return;
  }
  window.dispatchEvent(new CustomEvent("foodmaps:navigate_ui", {
    detail: {
      action: act || "open",
      target: tgt,
      path: action.path || null,
      query,
      summary: action.summary
    }
  }));
}
function UIControlProvider({ children }) {
  const handlersRef = (0, import_react4.useRef)([]);
  const registerHandler = (0, import_react4.useCallback)((fn) => {
    handlersRef.current.push(fn);
    return () => {
      handlersRef.current = handlersRef.current.filter((h2) => h2 !== fn);
    };
  }, []);
  const executeUIAction = (0, import_react4.useCallback)((action) => {
    dispatchUIAction(action);
    handlersRef.current.forEach((h2) => {
      try {
        h2(action);
      } catch (_2) {
      }
    });
    return 1;
  }, []);
  const executeUIActionsFromToolResults = (0, import_react4.useCallback)((toolResults) => {
    if (!Array.isArray(toolResults)) return 0;
    let count = 0;
    for (const tr of toolResults) {
      const result = tr.result ?? tr;
      if (UI_CONTROL_TOOLS.has(tr.tool) && (result.ok || result.success !== false)) {
        dispatchUIAction({ ...result, tool: tr.tool });
        count += 1;
      }
      if (result.frontend_hint?.path) {
        dispatchUIAction({ target: result.frontend_hint.path, action: "open" });
        count += 1;
      }
    }
    return count;
  }, []);
  const value = (0, import_react4.useMemo)(() => ({
    registerHandler,
    executeUIAction,
    executeUIActionsFromToolResults
  }), [registerHandler, executeUIAction, executeUIActionsFromToolResults]);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(UIControlContext.Provider, { value, children });
}
function useUIControl() {
  return (0, import_react4.useContext)(UIControlContext);
}

// utils/NouriGuideContext.jsx
var import_react5 = __toESM(require_react(), 1);
var import_jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
var STORAGE_KEY = "nouri_guide_state_v1";
var defaultSettings = {
  easyMode: false,
  voiceOutput: false,
  largeText: false,
  highContrast: false,
  alwaysShowCaptions: false,
  preferTextOverVoice: false,
  formVoiceGuideEnabled: true
};
var defaultGuide = {
  source: null,
  caption: "",
  text: "",
  label: "",
  section: "",
  stepIndex: 0,
  stepTotal: 0,
  formId: null,
  isSpeaking: false,
  isMuted: false,
  isDismissed: false,
  hasResume: false,
  goalKey: null
};
var NouriGuideContext = (0, import_react5.createContext)({
  settings: defaultSettings,
  guide: defaultGuide,
  updateSetting: () => {
  },
  syncFromChat: () => {
  },
  resetGuideSession: () => {
  },
  cancelVoice: () => {
  },
  toggleMute: () => {
  },
  dismiss: () => {
  },
  replay: () => {
  },
  resume: () => {
  }
});
function NouriGuideProvider({ children }) {
  const [settings, setSettings] = (0, import_react5.useState)(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...defaultSettings, ...JSON.parse(raw).settings };
    } catch {
    }
    return defaultSettings;
  });
  const [guide, setGuide] = (0, import_react5.useState)(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...defaultGuide, ...JSON.parse(raw).guide };
    } catch {
    }
    return defaultGuide;
  });
  (0, import_react5.useEffect)(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, guide }));
  }, [settings, guide]);
  (0, import_react5.useEffect)(() => {
    const onFormFocus = (ev) => {
      const detail = ev?.detail;
      if (!detail || typeof detail !== "object") return;
      setGuide((g2) => ({
        ...g2,
        formId: detail.formId ?? g2.formId,
        fieldName: detail.fieldName ?? g2.fieldName,
        label: detail.label ?? g2.label,
        stepIndex: detail.stepIndex ?? g2.stepIndex,
        stepTotal: detail.stepTotal ?? g2.stepTotal,
        path: detail.path ?? g2.path,
        pageKey: detail.pageKey ?? g2.pageKey,
        source: detail.source ?? "form"
      }));
    };
    window.addEventListener("foodmaps:form_focus", onFormFocus);
    return () => window.removeEventListener("foodmaps:form_focus", onFormFocus);
  }, []);
  const updateSetting = (0, import_react5.useCallback)((key, value2) => {
    setSettings((s2) => ({ ...s2, [key]: value2 }));
  }, []);
  const syncFromChat = (0, import_react5.useCallback)((patch) => {
    if (patch?.settings) setSettings((s2) => ({ ...s2, ...patch.settings }));
    if (patch?.guide) setGuide((g2) => ({ ...g2, ...patch.guide }));
  }, []);
  const cancelVoice = (0, import_react5.useCallback)(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setGuide((g2) => ({ ...g2, isSpeaking: false }));
  }, []);
  const resetGuideSession = (0, import_react5.useCallback)(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setGuide((g2) => ({
      ...defaultGuide,
      isMuted: g2.isMuted,
      isDismissed: g2.isDismissed
    }));
  }, []);
  const toggleMute = (0, import_react5.useCallback)(() => {
    setGuide((g2) => ({ ...g2, isMuted: !g2.isMuted }));
    cancelVoice();
  }, [cancelVoice]);
  const dismiss = (0, import_react5.useCallback)(() => {
    setGuide((g2) => ({ ...g2, isDismissed: true, isSpeaking: false }));
    cancelVoice();
  }, [cancelVoice]);
  const replay = (0, import_react5.useCallback)(() => {
    setGuide((g2) => ({ ...g2, isDismissed: false }));
  }, []);
  const resume = (0, import_react5.useCallback)(() => {
    setGuide((g2) => ({ ...g2, isDismissed: false, hasResume: false }));
  }, []);
  const value = (0, import_react5.useMemo)(() => ({
    settings,
    guide,
    updateSetting,
    syncFromChat,
    resetGuideSession,
    cancelVoice,
    toggleMute,
    dismiss,
    replay,
    resume
  }), [settings, guide, updateSetting, syncFromChat, resetGuideSession, cancelVoice, toggleMute, dismiss, replay, resume]);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(NouriGuideContext.Provider, { value, children });
}
function useNouriGuide() {
  return (0, import_react5.useContext)(NouriGuideContext);
}

// utils/AccessibilityContext.jsx
var import_react6 = __toESM(require_react(), 1);
var import_jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
var AccessibilityContext = (0, import_react6.createContext)({
  settings: {},
  updateSetting: () => {
  }
});
function AccessibilityProvider({ children }) {
  const value = import_react6.default.useMemo(() => ({
    settings: { alwaysShowCaptions: true },
    updateSetting: () => {
    }
  }), []);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(AccessibilityContext.Provider, { value, children });
}
function useAccessibility() {
  return (0, import_react6.useContext)(AccessibilityContext);
}

// src/assistant/AIChatPanel.jsx
var import_react11 = __toESM(require_react(), 1);

// utils/hooks/useAIChat.js
var import_react7 = __toESM(require_react(), 1);

// utils/services/aiChatService.js
function getToken() {
  return localStorage.getItem("auth_token") || localStorage.getItem("token") || "";
}
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    ...options.headers || {}
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(text || `${res.status}`);
    err.status = res.status;
    try {
      err.aiError = JSON.parse(text);
    } catch {
    }
    throw err;
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res;
}
var aiChatService = {
  async chat(userId, message, opts = {}) {
    return apiFetch("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        message,
        include_audio: opts.includeAudio || false,
        tone: opts.tone,
        accessibility_profile: opts.accessibilityProfile,
        guide_state: opts.guideState,
        lang: opts.lang
      })
    });
  },
  async publicChat(message, lang = "en") {
    return apiFetch("/api/ai/public_chat", {
      method: "POST",
      body: JSON.stringify({ message, lang })
    });
  },
  async confirm(userId, payload = {}) {
    return apiFetch("/api/ai/confirm", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, ...payload })
    });
  },
  async voice(userId, blob, opts = {}) {
    const token = getToken();
    const fd = new FormData();
    fd.append("audio", blob, "voice.webm");
    fd.append("user_id", userId);
    if (opts.lang) fd.append("lang", opts.lang);
    if (opts.tone) fd.append("tone", opts.tone);
    if (opts.accessibilityProfile) {
      fd.append("accessibility_profile", JSON.stringify(opts.accessibilityProfile));
    }
    if (opts.guideState) {
      fd.append("guide_state", JSON.stringify(opts.guideState));
    }
    const res = await fetch("/api/ai/voice", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async uploadImage(file, userId) {
    const token = getToken();
    const fd = new FormData();
    fd.append("image", file);
    if (userId) fd.append("user_id", userId);
    const res = await fetch("/api/ai/upload_image", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async enrichListings(rows, opts = {}) {
    return apiFetch("/api/ai/enrich-listings", {
      method: "POST",
      body: JSON.stringify({
        user_id: opts.userId,
        rows,
        language: opts.language || "en"
      })
    });
  },
  async bulkCreateListings(rows, opts = {}) {
    return apiFetch("/api/ai/bulk-listings", {
      method: "POST",
      body: JSON.stringify({
        user_id: opts.userId,
        listings: rows
      })
    });
  },
  async visionListing(file, opts = {}) {
    const token = getToken();
    const fd = new FormData();
    fd.append("image", file);
    if (opts.userId) fd.append("user_id", opts.userId);
    const res = await fetch("/api/ai/vision-listing", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async recipes(userId, opts = {}) {
    return apiFetch("/api/ai/recipes", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        ingredients: opts.ingredients,
        use_claimed: opts.useClaimed !== false,
        low_resource: opts.lowResource !== false,
        household_size: opts.householdSize,
        max_recipes: opts.maxRecipes || 3
      })
    });
  },
  async askQuery(userId, question) {
    return apiFetch("/api/ai/query", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, question })
    });
  },
  async voiceSearch(userId, opts = {}) {
    return apiFetch("/api/ai/voice-search", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        transcript: opts.transcript,
        latitude: opts.latitude,
        longitude: opts.longitude,
        maxDistanceKm: opts.maxDistanceKm,
        limit: opts.limit
      })
    });
  },
  async getInsights(userId, opts = {}) {
    const qs = opts.roleHint ? `?role_hint=${encodeURIComponent(opts.roleHint)}` : "";
    return apiFetch(`/api/ai/insights/${encodeURIComponent(userId)}${qs}`);
  },
  async getHistory(userId) {
    return apiFetch(`/api/ai/history/${encodeURIComponent(userId)}`);
  },
  async clearHistory(userId) {
    return apiFetch(`/api/ai/history/${encodeURIComponent(userId)}`, { method: "DELETE" });
  },
  async setTone(userId, tone) {
    return apiFetch(`/api/ai/tone/${encodeURIComponent(userId)}`, {
      method: "PUT",
      body: JSON.stringify({ tone })
    });
  },
  async submitFeedback(payload) {
    return apiFetch("/api/ai/feedback", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
};
var aiChatService_default = aiChatService;

// utils/hooks/useAIChat.js
var AI_TONE_OPTIONS = ["warm", "professional", "casual", "empathetic"];
var LISTINGS_MUTATING_TOOLS = /* @__PURE__ */ new Set([
  "claim_listing",
  "confirm_claim",
  "cancel_claim",
  "post_food_listing",
  "post_food_request",
  "bulk_import_listings"
]);
function maybeBroadcastListingsChanged(actions) {
  if (!Array.isArray(actions)) return;
  const successful = actions.filter((a2) => a2 && a2.ok && LISTINGS_MUTATING_TOOLS.has(a2.tool));
  if (successful.length) {
    window.dispatchEvent(new CustomEvent("foodmaps:listings_changed", { detail: { actions: successful } }));
  }
  for (const a2 of successful) {
    if (a2.tool === "claim_listing" && a2.listing_id != null) {
      window.dispatchEvent(new CustomEvent("foodmaps:open_claim_confirm", {
        detail: {
          listing_id: a2.listing_id,
          title: a2.title,
          needs_confirmation: a2.needs_confirmation !== false
        }
      }));
    }
  }
}
function normalizeAssistantMessage(data) {
  const toolResults = (data.actions || []).map((a2) => ({
    tool: a2.tool,
    ok: a2.ok,
    result: a2,
    summary: a2.summary
  }));
  return {
    id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role: "assistant",
    message: data.text || "",
    toolResults,
    suggestions: data.suggestions || [],
    requiresConfirmation: data.requires_confirmation,
    pendingAction: data.pending_action,
    fromHistory: false
  };
}
function useAIChat() {
  const { user, isAuthenticated } = useAuthContext();
  const { settings: a11ySettings, guide } = useNouriGuide();
  const [messages, setMessages] = (0, import_react7.useState)([]);
  const [isLoading, setIsLoading] = (0, import_react7.useState)(false);
  const [error, setError] = (0, import_react7.useState)(null);
  const [language, setLanguage] = (0, import_react7.useState)(() => localStorage.getItem("nouri_chat_lang") || "en");
  const [tone, setToneState] = (0, import_react7.useState)("warm");
  const [historyLoaded, setHistoryLoaded] = (0, import_react7.useState)(false);
  const [pageContext, setPageContext] = (0, import_react7.useState)({ pageKey: "map", path: "/find" });
  const lastUserMessageRef = (0, import_react7.useRef)("");
  (0, import_react7.useEffect)(() => {
    const handler = (ev) => {
      const detail = ev?.detail;
      if (detail && typeof detail === "object") {
        setPageContext((prev) => ({ ...prev, ...detail }));
      }
    };
    window.addEventListener("foodmaps:page_context", handler);
    return () => window.removeEventListener("foodmaps:page_context", handler);
  }, []);
  const guideState = (0, import_react7.useMemo)(() => ({
    ...guide,
    pageKey: pageContext.pageKey || guide.pageKey,
    path: pageContext.path || guide.path
  }), [guide, pageContext]);
  (0, import_react7.useEffect)(() => {
    localStorage.setItem("nouri_chat_lang", language);
  }, [language]);
  (0, import_react7.useEffect)(() => {
    if (!user?.id) {
      setHistoryLoaded(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const hist = await aiChatService_default.getHistory(user.id);
        if (cancelled) return;
        const rows = hist?.messages || hist || [];
        if (Array.isArray(rows) && rows.length) {
          setMessages(rows.map((m2, i2) => {
            const meta = m2.metadata || {};
            const actions = meta.actions || [];
            return {
              id: `h-${i2}`,
              role: m2.role,
              message: m2.message || m2.text || "",
              fromHistory: true,
              toolResults: (m2.toolResults || actions).map((a2) => ({
                tool: a2.tool,
                ok: a2.ok,
                result: a2,
                summary: a2.summary
              })),
              suggestions: meta.suggestions || [],
              requiresConfirmation: meta.requires_confirmation,
              pendingAction: meta.pending_action
            };
          }));
        }
      } catch {
      } finally {
        if (!cancelled) setHistoryLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);
  const setTone = (0, import_react7.useCallback)(async (next) => {
    setToneState(next);
    if (user?.id) {
      try {
        await aiChatService_default.setTone(user.id, next);
      } catch {
      }
    }
  }, [user?.id]);
  const sendMessage = (0, import_react7.useCallback)(async (text, opts = {}) => {
    const trimmed = (text || "").trim();
    if (!trimmed) return;
    setError(null);
    lastUserMessageRef.current = trimmed;
    setMessages((m2) => [...m2, {
      id: `u-${Date.now()}`,
      role: "user",
      message: opts.displayText || trimmed
    }]);
    setIsLoading(true);
    try {
      let data;
      if (!isAuthenticated || !user?.id) {
        data = await aiChatService_default.publicChat(trimmed, language);
        setMessages((m2) => [...m2, {
          id: `a-${Date.now()}`,
          role: "assistant",
          message: data.text || "",
          suggestions: data.suggestions || []
        }]);
        return;
      }
      data = await aiChatService_default.chat(user.id, trimmed, {
        tone,
        lang: language,
        accessibilityProfile: a11ySettings,
        guideState,
        includeAudio: opts.includeAudio
      });
      const assistant = normalizeAssistantMessage(data);
      setMessages((m2) => [...m2, assistant]);
      maybeBroadcastListingsChanged(data.actions);
    } catch (err) {
      setError(err?.message || "Chat failed");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated, language, tone, a11ySettings, guideState]);
  const sendSilentMessage = sendMessage;
  const sendVoice = (0, import_react7.useCallback)(async (blob) => {
    if (!user?.id) {
      setError("Sign in to use voice");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await aiChatService_default.voice(user.id, blob, {
        lang: language,
        tone,
        accessibilityProfile: a11ySettings,
        guideState
      });
      if (data.transcript) {
        setMessages((m2) => [...m2, { id: `u-${Date.now()}`, role: "user", message: data.transcript }]);
      }
      const assistant = normalizeAssistantMessage(data);
      setMessages((m2) => [...m2, assistant]);
      maybeBroadcastListingsChanged(data.actions);
    } catch (err) {
      setError(err?.message || "Voice failed");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, language, tone, a11ySettings, guideState]);
  const clearHistory = (0, import_react7.useCallback)(async () => {
    lastUserMessageRef.current = "";
    setError(null);
    if (user?.id) {
      await aiChatService_default.clearHistory(user.id);
    }
    setMessages([]);
  }, [user?.id]);
  const submitFeedback = (0, import_react7.useCallback)(async (conversationId, rating, comment) => {
    if (!user?.id) return;
    await aiChatService_default.submitFeedback({
      user_id: user.id,
      conversation_id: String(conversationId),
      rating,
      comment
    });
  }, [user?.id]);
  const appendLocalMessage = (0, import_react7.useCallback)((msg) => {
    setMessages((m2) => [...m2, { id: `l-${Date.now()}`, ...msg }]);
  }, []);
  const retryMessage = (0, import_react7.useCallback)(() => {
    if (lastUserMessageRef.current) sendMessage(lastUserMessageRef.current);
  }, [sendMessage]);
  const regenerateLast = retryMessage;
  const confirmPendingAction = (0, import_react7.useCallback)(async (confirm = true) => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await aiChatService_default.confirm(user.id, { confirm });
      const assistant = normalizeAssistantMessage(data);
      setMessages((m2) => [...m2, assistant]);
      maybeBroadcastListingsChanged(data.actions);
    } catch (err) {
      setError(err?.message || "Confirm failed");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);
  return (0, import_react7.useMemo)(() => ({
    messages,
    sendMessage,
    sendVoice,
    isLoading,
    error,
    language,
    setLanguage,
    clearHistory,
    submitFeedback,
    appendLocalMessage,
    sendSilentMessage,
    retryMessage,
    regenerateLast,
    historyLoaded,
    tone,
    setTone,
    confirmPendingAction,
    isAuthenticated
  }), [
    messages,
    sendMessage,
    sendVoice,
    isLoading,
    error,
    language,
    clearHistory,
    submitFeedback,
    appendLocalMessage,
    sendSilentMessage,
    retryMessage,
    regenerateLast,
    historyLoaded,
    tone,
    setTone,
    confirmPendingAction,
    isAuthenticated
  ]);
}

// utils/hooks/useCommunityRole.js
function useCommunityRole() {
  const { user, isAdmin } = useAuthContext();
  if (isAdmin) return "admin";
  const role = String(user?.role || "").toLowerCase();
  if (role === "donor") return "donor";
  if (role === "volunteer") return "volunteer";
  if (role === "dispatcher" || role === "organizer") return "organizer";
  return "recipient";
}

// src/assistant/VoiceOutput.jsx
var import_react8 = __toESM(require_react(), 1);
var import_jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
var synth = typeof window !== "undefined" ? window.speechSynthesis : null;
function VoiceOutput({ text, language = "en", autoSpeak = false, onSpeakingChange }) {
  const [isSpeaking, setIsSpeaking] = (0, import_react8.useState)(false);
  const [isMuted, setIsMuted] = (0, import_react8.useState)(false);
  const [supported, setSupported] = (0, import_react8.useState)(false);
  const utteranceRef = (0, import_react8.useRef)(null);
  const prevTextRef = (0, import_react8.useRef)("");
  const voicesRef = (0, import_react8.useRef)([]);
  (0, import_react8.useEffect)(() => {
    setSupported(!!synth);
    if (!synth) return void 0;
    const refreshVoices = () => {
      voicesRef.current = synth.getVoices() || [];
    };
    refreshVoices();
    synth.addEventListener?.("voiceschanged", refreshVoices);
    return () => {
      synth.removeEventListener?.("voiceschanged", refreshVoices);
      if (utteranceRef.current) {
        utteranceRef.current.onstart = null;
        utteranceRef.current.onend = null;
        utteranceRef.current.onerror = null;
      }
      synth.cancel();
    };
  }, []);
  (0, import_react8.useEffect)(() => {
    if (!autoSpeak || isMuted || !text || text === prevTextRef.current) return;
    prevTextRef.current = text;
    speak(text);
  }, [text, autoSpeak, isMuted]);
  const speak = (0, import_react8.useCallback)((textToSpeak) => {
    if (!synth || !textToSpeak) return;
    synth.cancel();
    const cleanText = textToSpeak.replace(/\*\*(.*?)\*\*/g, "$1").replace(/[#*_~`]/g, "").replace(/\n+/g, ". ").replace(/\s+/g, " ").trim();
    if (!cleanText) return;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === "es" ? "es-ES" : "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    const voices = voicesRef.current.length ? voicesRef.current : synth.getVoices() || [];
    const langCode = language === "es" ? "es" : "en";
    const preferredVoice = voices.find(
      (v2) => v2.lang.startsWith(langCode) && (v2.name.includes("Google") || v2.name.includes("Samantha") || v2.name.includes("Microsoft"))
    ) || voices.find((v2) => v2.lang.startsWith(langCode));
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.onstart = () => {
      setIsSpeaking(true);
      onSpeakingChange?.(true);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      onSpeakingChange?.(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      onSpeakingChange?.(false);
    };
    utteranceRef.current = utterance;
    synth.speak(utterance);
  }, [language, onSpeakingChange]);
  const stop = (0, import_react8.useCallback)(() => {
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
      onSpeakingChange?.(false);
    }
  }, [onSpeakingChange]);
  const toggleMute = (0, import_react8.useCallback)(() => {
    if (isSpeaking) stop();
    setIsMuted((prev) => !prev);
  }, [isSpeaking, stop]);
  const handleSpeak = (0, import_react8.useCallback)(() => {
    if (isSpeaking) stop();
    else speak(text);
  }, [isSpeaking, text, speak, stop]);
  if (!supported) {
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "span",
      {
        className: "inline-flex items-center justify-center h-7 w-7 rounded-md text-slate-300 cursor-not-allowed",
        title: "Voice output isn't supported in this browser",
        "aria-label": "Voice output not supported",
        children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3.5 w-3.5", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) })
      }
    );
  }
  const disabledSpeak = !text;
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "inline-flex items-center gap-0.5", role: "toolbar", "aria-label": "Voice output controls", children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "button",
      {
        type: "button",
        onClick: handleSpeak,
        disabled: disabledSpeak,
        className: `relative inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${disabledSpeak ? "text-slate-300 cursor-not-allowed" : isSpeaking ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"}`,
        title: isSpeaking ? language === "es" ? "Detener lectura" : "Stop reading" : language === "es" ? "Leer en voz alta" : "Read aloud",
        "aria-label": isSpeaking ? language === "es" ? "Detener lectura" : "Stop reading" : language === "es" ? "Leer mensaje en voz alta" : "Read message aloud",
        "aria-pressed": isSpeaking,
        children: isSpeaking ? (
          // Stop square + tiny equalizer overlay so it's unmistakable.
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { className: "relative inline-flex items-center justify-center", children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3.5 w-3.5", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("rect", { x: "5", y: "5", width: "10", height: "10", rx: "1.5" }) }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "absolute -top-1.5 -right-2 flex items-end gap-[1.5px] h-2.5", "aria-hidden": "true", children: [0, 1, 2].map((i2) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
              "span",
              {
                className: "w-[2px] rounded-full bg-emerald-500 animate-voice-bar",
                style: { animationDelay: `${i2 * 0.12}s`, height: "100%" }
              },
              i2
            )) })
          ] })
        ) : (
          // Play triangle inside a speaker — distinct from the stop variant.
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3.5 w-3.5", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { fillRule: "evenodd", d: "M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z", clipRule: "evenodd" }) })
        )
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "button",
      {
        type: "button",
        onClick: toggleMute,
        className: `inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 ${isMuted ? "text-rose-500 bg-rose-50 hover:bg-rose-100" : "text-slate-300 hover:text-slate-600 hover:bg-slate-100"}`,
        title: isMuted ? language === "es" ? "Activar lectura autom\xE1tica" : "Unmute auto-read" : language === "es" ? "Silenciar lectura autom\xE1tica" : "Mute auto-read",
        "aria-label": isMuted ? language === "es" ? "Activar salida de voz" : "Unmute voice output" : language === "es" ? "Silenciar salida de voz" : "Mute voice output",
        "aria-pressed": isMuted,
        children: isMuted ? (
          // Bell-with-slash — communicates "notifications/sounds off" cleanly.
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3.5 w-3.5", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { d: "M3.293 2.293a1 1 0 011.414 0l18 18a1 1 0 01-1.414 1.414l-2.012-2.012A2 2 0 0118 20H6a2 2 0 01-1.414-3.414L6 15.172V11c0-1.07.21-2.09.59-3.013L3.293 3.707a1 1 0 010-1.414z" }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { d: "M10 22a2 2 0 104 0h-4zM18 8.586l-9.6-9.6A6 6 0 0118 11v-2.414z", opacity: ".25" })
          ] })
        ) : (
          // Open bell — auto-read is on.
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3.5 w-3.5", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { d: "M12 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 005 15h14a1 1 0 00.707-1.707L18 11.586V8a6 6 0 00-6-6zM10 19a2 2 0 104 0h-4z" }) })
        )
      }
    )
  ] });
}
var VoiceOutput_default = VoiceOutput;

// utils/helpers.js
function reportError2(err) {
  console.error("[Nouri]", err);
}
function safeDownload(filename, content, mime = "text/csv") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a2 = document.createElement("a");
  a2.href = url;
  a2.download = filename;
  a2.click();
  URL.revokeObjectURL(url);
}

// utils/csvListings.js
var CSV_TEMPLATE = `title,quantity,unit,category,description,expiry_date,location
Apples,10,items,produce,Fresh apples,,
Bread,5,loaves,bakery,Day-old bread,,
`;
function downloadCsvTemplate() {
  safeDownload("foodmaps-listings-template.csv", CSV_TEMPLATE);
}
function matchCommunityByName(name, communities) {
  const n2 = String(name || "").trim().toLowerCase();
  if (!n2) return null;
  return (communities || []).find((c2) => String(c2.name || "").toLowerCase() === n2) || null;
}
function sanitizeListingExpiry(value) {
  if (!value) return null;
  const d2 = new Date(value);
  if (Number.isNaN(d2.getTime())) return null;
  return d2.toISOString().slice(0, 10);
}
function visionDraftToRow(draft) {
  if (!draft) return null;
  return {
    title: draft.title || "",
    quantity: Number(draft.quantity) || 1,
    unit: draft.unit || "items",
    category: draft.category || "other",
    description: draft.description || "",
    dietary_tags: draft.dietary_tags || [],
    allergens: draft.allergens || [],
    expiry_date: draft.expiry_date || null,
    location: draft.location || "",
    community_id: draft.community_id || null,
    image_url: draft.image_url || null
  };
}
function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i2 = 0; i2 < line.length; i2 += 1) {
    const ch = line[i2];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}
function parseListingsCsv(text) {
  const lines = String(text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const errors = [];
  if (lines.length < 2) {
    return { rows: [], errors: ["CSV must include a header row and at least one data row."] };
  }
  const headers = parseCsvLine(lines[0]).map((h2) => h2.toLowerCase().replace(/\s+/g, "_"));
  const rows = [];
  for (let i2 = 1; i2 < lines.length; i2 += 1) {
    const cols = parseCsvLine(lines[i2]);
    if (cols.every((c2) => !c2)) continue;
    const row = {};
    headers.forEach((h2, idx) => {
      row[h2] = cols[idx] ?? "";
    });
    const title = row.title || row.name;
    const qty = parseFloat(row.quantity || row.qty);
    if (!title) {
      errors.push(`Row ${i2 + 1}: missing title`);
      continue;
    }
    if (!qty || qty <= 0) {
      errors.push(`Row ${i2 + 1}: invalid quantity`);
      continue;
    }
    rows.push({
      title: String(title).slice(0, 200),
      quantity: qty,
      unit: String(row.unit || "items").slice(0, 40) || "items",
      category: String(row.category || "other").toLowerCase(),
      description: row.description ? String(row.description).slice(0, 2e3) : "",
      expiry_date: sanitizeListingExpiry(row.expiry_date || row.expiry),
      location: row.location || row.address || "",
      community_name: row.community || row.community_name || "",
      image_url: row.image_url || null
    });
  }
  return { rows, errors };
}

// utils/foodImages.js
var PLACEHOLDER_IMAGES = {
  produce: "/assets/logos/foodmaps-logo.png",
  bakery: "/assets/logos/foodmaps-logo.png",
  default: "/assets/logos/foodmaps-logo.png"
};
function assignFoodImage(row) {
  if (row?.image_url) return row;
  const cat = String(row?.category || "default").toLowerCase();
  return { ...row, image_url: PLACEHOLDER_IMAGES[cat] || PLACEHOLDER_IMAGES.default };
}
function assignImagestoRows(rows) {
  return (rows || []).map(assignFoodImage);
}

// utils/supabaseClient.js
function getToken2() {
  return localStorage.getItem("auth_token") || localStorage.getItem("token") || "";
}
var supabase = {
  from(table) {
    const builder = {
      _table: table,
      _filters: [],
      _select: "*",
      _order: null,
      select(cols) {
        this._select = cols;
        return this;
      },
      eq(col, val) {
        this._filters.push({ col, val });
        return this;
      },
      order(col, opts = {}) {
        this._order = { col, ascending: opts.ascending !== false };
        return this;
      },
      async then(resolve, reject) {
        try {
          if (this._table === "communities") {
            const token = getToken2();
            const res = await fetch("/api/centers", {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (!res.ok) throw new Error(await res.text());
            let data = await res.json();
            data = (data || []).map((c2) => ({ id: c2.id, name: c2.name, is_active: true }));
            if (this._order?.col === "name") {
              data.sort((a2, b2) => String(a2.name).localeCompare(String(b2.name)));
            }
            resolve({ data, error: null });
            return;
          }
          resolve({ data: [], error: null });
        } catch (err) {
          if (reject) reject(err);
          else resolve({ data: null, error: err });
        }
      }
    };
    return builder;
  }
};
var supabaseClient_default = supabase;

// utils/suggestionChips.js
function liveAssistantIndex(messages) {
  if (!Array.isArray(messages)) return -1;
  for (let i2 = messages.length - 1; i2 >= 0; i2 -= 1) {
    if (messages[i2]?.role === "assistant" && !messages[i2]?.fromHistory) return i2;
  }
  for (let i2 = messages.length - 1; i2 >= 0; i2 -= 1) {
    const m2 = messages[i2];
    if (m2?.role === "assistant" && Array.isArray(m2.suggestions) && m2.suggestions.length > 0) {
      return i2;
    }
  }
  return -1;
}
function resolveInputChips(suggestions, language, communityRole, opts = {}) {
  const raw = Array.isArray(suggestions) ? suggestions : [];
  if (raw.length) {
    return raw.slice(0, 6).map((s2) => typeof s2 === "string" ? { label: s2, message: s2 } : s2);
  }
  if (opts.allowLazy) {
    const es = language === "es";
    if (communityRole === "donor") {
      return [{ label: es ? "Compartir comida" : "Share food", message: es ? "Quiero compartir comida" : "I want to share food" }];
    }
    return [{ label: es ? "Buscar comida" : "Find food", message: es ? "Buscar comida cerca" : "Find food nearby" }];
  }
  return [];
}

// utils/communityScope.js
function browseCommunityIdsForUser(user, { isAdmin } = {}) {
  if (isAdmin) return null;
  if (user?.community_id != null) return [String(user.community_id)];
  return null;
}
function listingVisibleToCommunityScope(listing, allowedIds) {
  if (!allowedIds) return true;
  const cid = listing?.community_id;
  if (cid == null) return true;
  return allowedIds.includes(String(cid));
}

// utils/chatI18n.js
var CHAT_UI_LANGUAGES = ["en", "es"];
var CHAT_LANGUAGE_LABELS = { en: "English", es: "Espa\xF1ol" };
var STRINGS = {
  en: {
    welcomeSubtitle: "Tap a suggestion below, a card, or type \u2014 I\u2019ll ask whether to do it for you or guide you step by step.",
    jumpLatest: "Jump to latest",
    latest: "Latest",
    signInForFeatures: "Sign in for claims, photos, and voice.",
    chatLanguage: "Chat language",
    conversationTone: "Tone",
    photoCaptionPlaceholder: "Add a caption (optional)",
    messagePlaceholder: "Message Nouri\u2026",
    today: "Today",
    yesterday: "Yesterday"
  },
  es: {
    welcomeSubtitle: "Elige una sugerencia abajo, una tarjeta, o escribe \u2014 te pregunto si lo hago yo o te gu\xEDo paso a paso.",
    jumpLatest: "Ir al final",
    latest: "Reciente",
    signInForFeatures: "Inicia sesi\xF3n para reclamar, fotos y voz.",
    chatLanguage: "Idioma del chat",
    conversationTone: "Tono",
    photoCaptionPlaceholder: "A\xF1ade un pie de foto (opcional)",
    messagePlaceholder: "Escribe a Nouri\u2026",
    today: "Hoy",
    yesterday: "Ayer"
  }
};
function normalizeWelcomeRole(communityRole) {
  const role = String(communityRole || "member").toLowerCase().trim();
  if (role === "dispatcher") return "organizer";
  if (!role) return "member";
  return role;
}
function t2(lang, key) {
  const l = STRINGS[lang] || STRINGS.en;
  return l[key] || STRINGS.en[key] || key;
}
function chatLang(lang) {
  return CHAT_UI_LANGUAGES.includes(lang) ? lang : "en";
}
function welcomeGreeting(lang, userName) {
  const first = userName ? String(userName).split(" ")[0] : "";
  if (lang === "es") {
    return first ? `\xA1Hola, ${first}!` : "\xA1Hola!";
  }
  return first ? `Hi, ${first}!` : "Hi there!";
}
var WELCOME_CATEGORIES = {
  en: [
    {
      key: "guide",
      icon: "fa-compass",
      accent: "amber",
      title: "Not sure?",
      blurb: "I\u2019ll walk you through it",
      prompts: ["I'm not sure what to do \u2014 help me", "How does Food Maps work?"]
    },
    {
      key: "find",
      icon: "fa-magnifying-glass-location",
      accent: "emerald",
      title: "Find food",
      blurb: "I\u2019ll ask how you want help",
      prompts: ["I want to find food", "Find free food near me"]
    },
    {
      key: "share",
      icon: "fa-hand-holding-heart",
      accent: "fuchsia",
      title: "Share food",
      blurb: "I\u2019ll ask how you want help",
      prompts: ["I want to share food", "Share extra food from my address"]
    },
    {
      key: "request",
      icon: "fa-clipboard-list",
      accent: "sky",
      title: "Request food",
      blurb: "I\u2019ll ask how you want help",
      prompts: ["I want to request food", "Request food that isn\u2019t listed yet"]
    },
    {
      key: "manage",
      icon: "fa-list-check",
      accent: "cyan",
      title: "Manage activity",
      blurb: "Pickups, claims, impact",
      prompts: ["What are my upcoming pickups?", "Show my impact stats"]
    }
  ],
  es: [
    {
      key: "guide",
      icon: "fa-compass",
      accent: "amber",
      title: "\xBFNo est\xE1s seguro?",
      blurb: "Te gu\xEDo paso a paso",
      prompts: ["No s\xE9 qu\xE9 hacer \u2014 ay\xFAdame", "\xBFC\xF3mo funciona Food Maps?"]
    },
    {
      key: "find",
      icon: "fa-magnifying-glass-location",
      accent: "emerald",
      title: "Buscar comida",
      blurb: "Te pregunto c\xF3mo ayudar",
      prompts: ["Quiero buscar comida", "Buscar comida gratis cerca"]
    },
    {
      key: "share",
      icon: "fa-hand-holding-heart",
      accent: "fuchsia",
      title: "Compartir comida",
      blurb: "Te pregunto c\xF3mo ayudar",
      prompts: ["Quiero compartir comida", "Compartir comida extra desde mi direcci\xF3n"]
    },
    {
      key: "request",
      icon: "fa-clipboard-list",
      accent: "sky",
      title: "Solicitar comida",
      blurb: "Te pregunto c\xF3mo ayudar",
      prompts: ["Quiero solicitar comida", "Solicitar comida que a\xFAn no est\xE1 listada"]
    },
    {
      key: "manage",
      icon: "fa-list-check",
      accent: "cyan",
      title: "Mi actividad",
      blurb: "Recogidas, reclamos, impacto",
      prompts: ["\xBFCu\xE1les son mis pr\xF3ximas recogidas?", "Muestra mis estad\xEDsticas de impacto"]
    }
  ]
};
function getWelcomeCategories(lang) {
  const key = lang === "es" ? "es" : "en";
  return WELCOME_CATEGORIES[key].map((cat) => ({ ...cat }));
}
function filterWelcomeCategories(categories, communityRole) {
  const role = normalizeWelcomeRole(communityRole);
  const list = Array.isArray(categories) ? categories : [];
  return list.filter((cat) => {
    if (role === "donor") return cat.key !== "find" && cat.key !== "request";
    if (role === "recipient") return cat.key !== "share";
    return true;
  });
}
function getSuggestions(lang) {
  const es = lang === "es";
  return es ? [
    "\xBFQu\xE9 comida hay disponible cerca de m\xED?",
    "\xBFCu\xE1les son mis pr\xF3ximas recogidas?",
    "Muestra mis estad\xEDsticas de impacto",
    "Quiero compartir comida",
    "\xBFC\xF3mo funciona Food Maps?"
  ] : [
    "What food is available near me?",
    "What are my upcoming pickups?",
    "Show my impact stats",
    "I want to share some food",
    "How does Food Maps work?"
  ];
}
function dateLocale(lang) {
  return lang === "es" ? "es" : "en-US";
}
function dateLabel(lang, key) {
  return t2(lang, key);
}
function formatChatTime(value) {
  if (value == null || value === "") return "";
  const d2 = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d2.getTime())) return "";
  try {
    return d2.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
function languageSwitchPrompt(lang) {
  return lang === "es" ? "\xBFPrefieres espa\xF1ol o ingl\xE9s?" : "Prefer English or Spanish?";
}
function getToneLabels(lang) {
  return lang === "es" ? { warm: "C\xE1lido", professional: "Profesional", casual: "Casual", empathetic: "Emp\xE1tico" } : { warm: "Warm", professional: "Professional", casual: "Casual", empathetic: "Empathetic" };
}
function onlineToneLabel(tone, lang) {
  return getToneLabels(lang)[tone] || tone;
}

// utils/mediaRecorder.js
function createMediaRecorder(stream) {
  const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
  return mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
}

// src/assistant/RecipeCard.jsx
var import_react9 = __toESM(require_react(), 1);
var import_prop_types = __toESM(require_prop_types(), 1);
var import_jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
function RecipeCard({ recipe }) {
  if (!recipe) {
    reportError2(new Error("Recipe data is required"));
    return null;
  }
  const {
    name,
    ingredients = [],
    instructions = "",
    prepTime,
    cookTime,
    difficulty,
    servings
  } = recipe;
  if (!name || !ingredients.length || !instructions) {
    reportError2(new Error("Recipe must have a name, ingredients, and instructions"));
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    "article",
    {
      "data-name": "recipe-card",
      className: "bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200",
      "aria-labelledby": "recipe-title",
      children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "p-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { id: "recipe-title", className: "text-lg font-semibold mb-2", children: name }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex flex-wrap gap-2 mb-4", role: "list", "aria-label": "Recipe details", children: [
          prepTime && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full", role: "listitem", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("i", { className: "far fa-clock mr-1", "aria-hidden": "true" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "sr-only", children: "Preparation time:" }),
            " Prep: ",
            prepTime
          ] }),
          cookTime && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full", role: "listitem", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("i", { className: "fas fa-fire mr-1", "aria-hidden": "true" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "sr-only", children: "Cooking time:" }),
            " Cook: ",
            cookTime
          ] }),
          difficulty && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full", role: "listitem", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("i", { className: "fas fa-chart-line mr-1", "aria-hidden": "true" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "sr-only", children: "Difficulty level:" }),
            " ",
            difficulty
          ] }),
          servings && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full", role: "listitem", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("i", { className: "fas fa-utensils mr-1", "aria-hidden": "true" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "sr-only", children: "Number of servings:" }),
            " Serves ",
            servings
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "mb-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h4", { id: "ingredients-title", className: "font-medium text-sm text-gray-700 mb-2", children: "Ingredients:" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "ul",
            {
              "aria-labelledby": "ingredients-title",
              className: "list-disc pl-5 space-y-1",
              children: ingredients.map((ingredient, index) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "li",
                {
                  className: "text-sm text-gray-600",
                  children: ingredient
                },
                `ingredient-${index}`
              ))
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h4", { id: "instructions-title", className: "font-medium text-sm text-gray-700 mb-2", children: "Instructions:" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "div",
            {
              "aria-labelledby": "instructions-title",
              className: "text-sm text-gray-600 whitespace-pre-line",
              children: instructions
            }
          )
        ] })
      ] })
    }
  );
}
RecipeCard.propTypes = {
  recipe: import_prop_types.default.shape({
    name: import_prop_types.default.string.isRequired,
    ingredients: import_prop_types.default.arrayOf(import_prop_types.default.string).isRequired,
    instructions: import_prop_types.default.string.isRequired,
    prepTime: import_prop_types.default.string,
    cookTime: import_prop_types.default.string,
    difficulty: import_prop_types.default.string,
    servings: import_prop_types.default.oneOfType([
      import_prop_types.default.string,
      import_prop_types.default.number
    ])
  }).isRequired
};
var RecipeCard_default = RecipeCard;

// src/assistant/StorageTipCard.jsx
var import_react10 = __toESM(require_react(), 1);
var import_prop_types2 = __toESM(require_prop_types(), 1);
var import_jsx_runtime8 = __toESM(require_jsx_runtime(), 1);
function StorageTipCard({ foodItem, tips = [] }) {
  if (!foodItem) {
    reportError2(new Error("Food item is required"));
    return null;
  }
  if (!Array.isArray(tips) || tips.length === 0) {
    reportError2(new Error("At least one storage tip is required"));
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
    "article",
    {
      "data-name": "storage-tip-card",
      className: "bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200",
      "aria-labelledby": "storage-tips-title",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "bg-primary-50 px-4 py-3 border-b border-primary-100", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
          "h3",
          {
            id: "storage-tips-title",
            className: "font-medium text-primary-800",
            children: [
              "Storage Tips for ",
              foodItem
            ]
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "p-4", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "ul",
          {
            className: "space-y-2",
            role: "list",
            "aria-label": `Storage tips for ${foodItem}`,
            children: tips.map((tip, index) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
              "li",
              {
                className: "flex items-start",
                role: "listitem",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                    "i",
                    {
                      className: "fas fa-check-circle text-primary-500 mt-1 mr-2",
                      "aria-hidden": "true"
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "text-gray-700", children: tip })
                ]
              },
              `storage-tip-${index}`
            ))
          }
        ) })
      ]
    }
  );
}
StorageTipCard.propTypes = {
  foodItem: import_prop_types2.default.string.isRequired,
  tips: import_prop_types2.default.arrayOf(import_prop_types2.default.string).isRequired
};
var StorageTipCard_default = StorageTipCard;

// src/assistant/AIChatPanel.jsx
var import_jsx_runtime9 = __toESM(require_jsx_runtime(), 1);
function recipeForCard(raw) {
  if (!raw || typeof raw !== "object") return null;
  const name = String(raw.name || raw.title || raw.recipe_name || "").trim();
  const ingredients = Array.isArray(raw.ingredients) ? raw.ingredients.map((i2) => String(i2).trim()).filter(Boolean) : [];
  const stepsRaw = raw.instructions ?? raw.steps ?? raw.directions;
  const instructions = Array.isArray(stepsRaw) ? stepsRaw.map((s2) => String(s2).trim()).filter(Boolean).join("\n") : String(stepsRaw || "").trim();
  if (!name || !ingredients.length || !instructions) return null;
  const timeMin = raw.time_minutes ?? raw.timeMinutes;
  return {
    name,
    ingredients,
    instructions,
    prepTime: raw.prepTime || raw.prep_time,
    cookTime: raw.cookTime || raw.cook_time || (timeMin != null ? `${timeMin} min` : void 0),
    difficulty: raw.difficulty,
    servings: raw.servings ?? raw.serves
  };
}
function parseStorageTipEntries(result, language = "en") {
  const foodItems = Array.isArray(result?.food_items) ? result.food_items.map((f2) => String(f2).trim()).filter(Boolean) : [];
  let tipsRaw = result?.tips ?? result?.storage_tips ?? result?.items;
  if (typeof tipsRaw === "string") {
    const trimmed = tipsRaw.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        tipsRaw = JSON.parse(trimmed);
      } catch {
      }
    }
  }
  const entries = [];
  if (Array.isArray(tipsRaw)) {
    tipsRaw.forEach((entry, idx) => {
      if (typeof entry === "string") {
        const tipLines = entry.split(/\n+/).map((t3) => t3.trim()).filter(Boolean);
        if (tipLines.length) entries.push({ foodItem: foodItems[idx] || foodItems[0] || "Food", tips: tipLines });
        return;
      }
      if (entry && typeof entry === "object") {
        const foodItem = String(entry.food_item || entry.foodItem || entry.item || entry.name || foodItems[idx] || foodItems[0] || "Food").trim();
        const tips = Array.isArray(entry.tips) ? entry.tips.map((t3) => String(t3).trim()).filter(Boolean) : String(entry.tips || entry.advice || entry.text || "").split(/\n+/).map((t3) => t3.trim()).filter(Boolean);
        if (tips.length) entries.push({ foodItem, tips });
      }
    });
  } else if (tipsRaw && typeof tipsRaw === "object") {
    const nested = tipsRaw.items || tipsRaw.tips || tipsRaw.storage_tips;
    if (Array.isArray(nested)) return parseStorageTipEntries({ food_items: foodItems, tips: nested }, language);
    Object.entries(tipsRaw).forEach(([key, val]) => {
      if (key === "food_items") return;
      const tips = Array.isArray(val) ? val.map((t3) => String(t3).trim()).filter(Boolean) : String(val || "").split(/\n+/).map((t3) => t3.trim()).filter(Boolean);
      if (tips.length) entries.push({ foodItem: key, tips });
    });
  } else if (typeof tipsRaw === "string" && tipsRaw.trim()) {
    const tipLines = tipsRaw.split(/\n+/).map((t3) => t3.replace(/^[-*•]\s*/, "").trim()).filter(Boolean);
    const foodItem = foodItems[0] || "Your food";
    if (tipLines.length) entries.push({ foodItem, tips: tipLines });
  }
  if (!entries.length && foodItems.length) {
    foodItems.forEach((foodItem) => {
      entries.push({
        foodItem,
        tips: [language === "es" ? "Consulta el mensaje de Nouri arriba para detalles." : "See Nouri\u2019s message above for storage details."]
      });
    });
  }
  return entries;
}
var ACCENT_MAP = {
  emerald: {
    iconBg: "bg-emerald-500/15 text-emerald-700 ring-emerald-400/30",
    border: "border-emerald-500/20 hover:border-emerald-400/40",
    glow: "hover:shadow-emerald-500/10",
    promptHover: "hover:bg-emerald-500/10 hover:text-emerald-800"
  },
  fuchsia: {
    iconBg: "bg-fuchsia-500/15 text-fuchsia-700 ring-fuchsia-400/30",
    border: "border-fuchsia-500/20 hover:border-fuchsia-400/40",
    glow: "hover:shadow-fuchsia-500/10",
    promptHover: "hover:bg-fuchsia-500/10 hover:text-fuchsia-800"
  },
  cyan: {
    iconBg: "bg-[#2CABE3]/15 text-[#2CABE3] ring-[#2CABE3]/30",
    border: "border-[#2CABE3]/20 hover:border-[#2CABE3]/40",
    glow: "hover:shadow-[#2CABE3]/10",
    promptHover: "hover:bg-[#2CABE3]/10 hover:text-[#2299c7]"
  },
  sky: {
    iconBg: "bg-sky-500/15 text-sky-600 ring-sky-400/30",
    border: "border-sky-500/20 hover:border-sky-400/40",
    glow: "hover:shadow-sky-500/10",
    promptHover: "hover:bg-sky-500/10 hover:text-sky-700"
  },
  amber: {
    iconBg: "bg-amber-500/15 text-amber-600 ring-amber-400/30",
    border: "border-amber-500/20 hover:border-amber-400/40",
    glow: "hover:shadow-amber-500/10",
    promptHover: "hover:bg-amber-500/10 hover:text-amber-800"
  }
};
function WelcomeHero({ language, userName, onPromptClick, communityRole }) {
  const all = getWelcomeCategories(language);
  const categories = filterWelcomeCategories(all, communityRole);
  const greeting = welcomeGreeting(language, userName);
  const subtitle = t2(language, "welcomeSubtitle");
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "px-4 pt-3 pb-2", children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "mb-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("h2", { className: "text-base font-semibold text-gray-900 tracking-tight", children: greeting }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: "text-xs text-gray-600 mt-0.5", children: subtitle })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "grid grid-cols-2 gap-2", children: categories.map((cat) => {
      const accent = ACCENT_MAP[cat.accent] || ACCENT_MAP.cyan;
      return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
        "div",
        {
          className: `rounded-xl p-3 bg-white/70 backdrop-blur-sm border transition-all ${accent.border} hover:bg-white/90 hover:shadow-md shadow-sm ${accent.glow}`,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex items-center gap-2 mb-1.5", children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: `w-7 h-7 rounded-lg ring-1 flex items-center justify-center ${accent.iconBg}`, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: `fas ${cat.icon} text-xs`, "aria-hidden": "true" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "min-w-0", children: [
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-xs font-semibold text-gray-900 truncate", children: cat.title }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-[10px] text-gray-500 truncate", children: cat.blurb })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("ul", { className: "space-y-1", children: cat.prompts.map((p2) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              "button",
              {
                type: "button",
                onClick: () => onPromptClick?.(p2),
                className: `w-full text-left text-[11px] leading-snug text-gray-600 px-2 py-1 rounded-md transition-colors ${accent.promptHover}`,
                children: p2
              }
            ) }, p2)) })
          ]
        },
        cat.key
      );
    }) })
  ] });
}
function formatSeparator(iso, language) {
  if (!iso) return null;
  const d2 = new Date(iso);
  if (Number.isNaN(d2.getTime())) return null;
  const now = /* @__PURE__ */ new Date();
  const startOfDay = (x2) => new Date(x2.getFullYear(), x2.getMonth(), x2.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(d2)) / 864e5);
  const loc = dateLocale(language);
  if (diffDays === 0) return dateLabel(language, "today");
  if (diffDays === 1) return dateLabel(language, "yesterday");
  if (diffDays < 7) {
    return d2.toLocaleDateString(loc, { weekday: "long" });
  }
  return d2.toLocaleDateString(loc, { month: "short", day: "numeric" });
}
function DateSeparator({ label }) {
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "relative my-3 flex items-center gap-2", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "flex-1 h-px bg-gradient-to-r from-transparent via-[#2CABE3]/25 to-transparent" }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "text-[10px] uppercase tracking-wider text-gray-500 px-2 py-0.5 rounded-full bg-white/80 border border-[#2CABE3]/15", children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "flex-1 h-px bg-gradient-to-l from-transparent via-[#2CABE3]/25 to-transparent" })
  ] });
}
function ScrollToBottomPill({ visible, onClick, language }) {
  if (!visible) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
    "button",
    {
      type: "button",
      onClick,
      className: "absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#2CABE3]/20 text-[#2CABE3] text-xs shadow-lg shadow-[#2CABE3]/10 hover:bg-white hover:border-[#2CABE3]/40 hover:scale-105 active:scale-95 transition-all animate-fade-in",
      "aria-label": t2(language, "jumpLatest"),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-arrow-down text-[10px]", "aria-hidden": "true" }),
        t2(language, "latest")
      ]
    }
  );
}
function TypingIndicator() {
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "flex px-4 py-1.5", "aria-live": "polite", "aria-label": "Nouri is typing", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "inline-flex items-center gap-1 rounded-2xl bg-white/80 border border-[#2CABE3]/15 px-3 py-2 backdrop-blur-sm shadow-sm", children: [0, 180, 360].map((delay) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
    "span",
    {
      className: "ai-typing-dot w-1.5 h-1.5 rounded-full bg-[#2CABE3]/70",
      style: { animationDelay: `${delay}ms` },
      "aria-hidden": "true"
    },
    delay
  )) }) });
}
var TOOL_CARD_TOKENS = {
  search: {
    title: { en: "Nearby food", es: "Comida cerca" },
    icon: "fa-utensils",
    ring: "ring-emerald-400/50",
    bg: "bg-emerald-950 border-emerald-500/40",
    accent: "text-white",
    sub: "text-emerald-50",
    tag: "bg-emerald-500/30 text-white border-emerald-400/50"
  },
  mylistings: {
    title: { en: "Your listings", es: "Tus publicaciones" },
    icon: "fa-clipboard-list",
    ring: "ring-emerald-400/50",
    bg: "bg-emerald-950 border-emerald-500/40",
    accent: "text-white",
    sub: "text-emerald-50",
    tag: "bg-emerald-500/30 text-white border-emerald-400/50"
  },
  myclaims: {
    title: { en: "Your claims", es: "Tus reclamos" },
    icon: "fa-hand-holding-heart",
    ring: "ring-emerald-400/50",
    bg: "bg-emerald-950 border-emerald-500/40",
    accent: "text-white",
    sub: "text-emerald-50",
    tag: "bg-emerald-500/30 text-white border-emerald-400/50"
  },
  community: {
    title: { en: "Community listings", es: "Publicaciones de la comunidad" },
    icon: "fa-school",
    ring: "ring-emerald-400/50",
    bg: "bg-emerald-950 border-emerald-500/40",
    accent: "text-white",
    sub: "text-emerald-50",
    tag: "bg-emerald-500/30 text-white border-emerald-400/50"
  },
  claim: {
    title: { en: "Claim confirmed", es: "Reclamo confirmado" },
    icon: "fa-circle-check",
    ring: "ring-emerald-400/50",
    bg: "bg-emerald-950 border-emerald-500/40",
    accent: "text-white",
    sub: "text-emerald-50"
  },
  error: {
    title: { en: "Something went wrong", es: "Algo sali\xF3 mal" },
    icon: "fa-triangle-exclamation",
    ring: "ring-rose-400/50",
    bg: "bg-rose-950 border-rose-500/40",
    accent: "text-white",
    sub: "text-rose-50"
  },
  cancel: {
    title: { en: "Claim released", es: "Reclamo liberado" },
    icon: "fa-arrow-rotate-left",
    ring: "ring-amber-400/50",
    bg: "bg-amber-950 border-amber-500/40",
    accent: "text-white",
    sub: "text-amber-50"
  },
  updated: {
    title: { en: "Listing updated", es: "Listado actualizado" },
    icon: "fa-pen-to-square",
    ring: "ring-violet-400/50",
    bg: "bg-violet-950 border-violet-500/40",
    accent: "text-white",
    sub: "text-violet-50"
  },
  deleted: {
    title: { en: "Listing deleted", es: "Listado eliminado" },
    icon: "fa-trash-can",
    ring: "ring-slate-400/50",
    bg: "bg-slate-900 border-slate-500/40",
    accent: "text-white",
    sub: "text-slate-100"
  },
  post: {
    title: { en: "Listing posted", es: "Donaci\xF3n publicada" },
    icon: "fa-bullhorn",
    ring: "ring-fuchsia-400/50",
    bg: "bg-fuchsia-950 border-fuchsia-500/40",
    accent: "text-white",
    sub: "text-fuchsia-50"
  },
  pickup: {
    title: { en: "Pickup confirmed", es: "Recogida confirmada" },
    icon: "fa-check-double",
    ring: "ring-sky-400/50",
    bg: "bg-sky-950 border-sky-500/40",
    accent: "text-white",
    sub: "text-sky-50"
  },
  reminder: {
    title: { en: "Reminder set", es: "Recordatorio creado" },
    icon: "fa-bell",
    ring: "ring-blue-400/50",
    bg: "bg-blue-950 border-blue-500/40",
    accent: "text-white",
    sub: "text-blue-50"
  },
  generic: {
    title: { en: "Done", es: "Hecho" },
    icon: "fa-circle-check",
    ring: "ring-slate-400/40",
    bg: "bg-slate-900 border-slate-500/40",
    accent: "text-white",
    sub: "text-slate-100"
  },
  claimfail: {
    title: { en: "Could not claim", es: "No se pudo reclamar" },
    icon: "fa-circle-xmark",
    ring: "ring-red-400/50",
    bg: "bg-red-950 border-red-500/40",
    accent: "text-white",
    sub: "text-red-50"
  }
};
function ToolCardShell({ kind, language = "en", titleOverride, children }) {
  const t3 = TOOL_CARD_TOKENS[kind] || TOOL_CARD_TOKENS.claim;
  const title = titleOverride || t3.title[language] || t3.title.en;
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
    "div",
    {
      role: "status",
      className: `mt-2 ${t3.bg} border rounded-xl p-3 text-sm shadow-md`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex items-center gap-2 mb-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: `inline-flex w-6 h-6 rounded-full bg-black/30 ring-1 ${t3.ring} items-center justify-center`, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: `fas ${t3.icon} text-[11px] ${t3.accent}`, "aria-hidden": "true" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: `font-semibold text-xs uppercase tracking-wide ${t3.accent}`, children: title })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: `text-xs leading-relaxed ${t3.sub}`, children })
      ]
    }
  );
}
function SearchResultsClaimList({
  searchItems,
  tool,
  language,
  t: t3,
  cardKind,
  onSuggestionClick
}) {
  const isEs = language === "es";
  const claimable = tool === "search_food_near_user" || tool === "search_food_nearby" || tool === "get_recent_listings" || tool === "get_community_listings";
  const [selected, setSelected] = (0, import_react11.useState)(() => /* @__PURE__ */ new Set());
  const toggle = (displayNum) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(displayNum)) next.delete(displayNum);
      else next.add(displayNum);
      return next;
    });
  };
  const selectAllVisible = () => {
    const nums = searchItems.slice(0, 25).map((item, idx) => item.display_index ?? idx + 1);
    setSelected(new Set(nums));
  };
  const clearSelection = () => setSelected(/* @__PURE__ */ new Set());
  const claimSelected = () => {
    if (!onSuggestionClick || selected.size === 0) return;
    const nums = Array.from(selected).sort((a2, b2) => a2 - b2);
    if (nums.length === 1) {
      onSuggestionClick(
        isEs ? `Quiero reclamar el #${nums[0]}` : `I'd like to claim #${nums[0]}`
      );
      return;
    }
    const list = nums.map((n2) => `#${n2}`).join(", ");
    onSuggestionClick(
      isEs ? `Quiero reclamar ${list} \u2014 varios a la vez` : `I'd like to claim ${list} \u2014 multiple items at once`
    );
  };
  const fmtDate = (iso) => {
    if (!iso) return null;
    try {
      const [y2, m2, d2] = String(iso).slice(0, 10).split("-").map(Number);
      return new Date(y2, m2 - 1, d2).toLocaleDateString(void 0, { month: "short", day: "numeric" });
    } catch {
      return iso;
    }
  };
  const titleOverride = claimable && searchItems.length >= 2 ? isEs ? `Comida cerca \xB7 ${searchItems.length} \xB7 puedes reclamar varios` : `Food nearby \xB7 ${searchItems.length} \xB7 claim several at once` : `${t3.title[language] || t3.title.en} \xB7 ${searchItems.length}`;
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(ToolCardShell, { kind: cardKind, language, titleOverride, children: [
    claimable && searchItems.length >= 2 && onSuggestionClick && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "mb-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-2 space-y-1.5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: `text-[11px] ${t3.accent} font-medium`, children: isEs ? "Marca varios y recl\xE1malos juntos \u2014 o usa Reclamar en uno solo." : "Select several items and claim them together \u2014 or Claim one at a time." }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex flex-wrap items-center gap-1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          "button",
          {
            type: "button",
            onClick: selectAllVisible,
            className: "text-[11px] px-2 py-0.5 rounded-md border border-emerald-400/40 text-emerald-50 hover:bg-emerald-500/30",
            children: isEs ? "Seleccionar visibles" : "Select visible"
          }
        ),
        selected.size > 0 && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          "button",
          {
            type: "button",
            onClick: clearSelection,
            className: "text-[11px] px-2 py-0.5 rounded-md border border-slate-500 text-slate-100 hover:bg-slate-800/60",
            children: isEs ? "Limpiar" : "Clear"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
          "button",
          {
            type: "button",
            onClick: claimSelected,
            disabled: selected.size === 0,
            className: "ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/40 border border-emerald-300/60 text-white text-[11px] font-semibold hover:bg-emerald-500/55 disabled:opacity-40 disabled:cursor-not-allowed",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-hand-holding-heart text-[10px]", "aria-hidden": "true" }),
              selected.size === 0 ? isEs ? "Reclamar seleccionados" : "Claim selected" : isEs ? `Reclamar ${selected.size} seleccionados` : `Claim ${selected.size} selected`
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("ul", { className: "space-y-1.5", children: [
      searchItems.slice(0, 25).map((item, idx) => {
        const displayNum = item.display_index ?? idx + 1;
        const miles = item.distance_miles != null ? Number(item.distance_miles) : item.distance_km != null ? Number(item.distance_km) * 0.621371 : null;
        const distance = miles != null && Number.isFinite(miles) ? `${miles.toFixed(miles < 10 ? 1 : 0)} mi` : null;
        const qtyLabel = item.quantity != null ? `${item.quantity}${item.unit ? ` ${item.unit}` : ""} available` : null;
        const expiryRaw = item.expiry_date || item.pickup_by || null;
        const expiryLabel = fmtDate(expiryRaw);
        const meta = [distance, qtyLabel, item.category, expiryLabel ? `Exp ${expiryLabel}` : null].filter(Boolean).join(" \xB7 ");
        const address = item.address || item.full_address || item.pickup_location || null;
        const photoUrl = typeof item.image_url === "string" && /^https?:\/\//i.test(item.image_url) ? item.image_url : null;
        const isSelected = selected.has(displayNum);
        return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          "li",
          {
            className: `rounded-lg px-2.5 py-2 border ${isSelected ? "bg-emerald-500/15 border-emerald-400/40" : "bg-slate-900/40 border-emerald-500/15"}`,
            children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex gap-2.5", children: [
              claimable && onSuggestionClick && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("label", { className: "flex-shrink-0 mt-0.5 cursor-pointer", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                "input",
                {
                  type: "checkbox",
                  checked: isSelected,
                  onChange: () => toggle(displayNum),
                  className: "rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500/40",
                  "aria-label": isEs ? `Seleccionar #${displayNum}` : `Select #${displayNum}`
                }
              ) }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                "span",
                {
                  className: `flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-[12px] font-bold ${t3.accent}`,
                  "aria-hidden": "true",
                  children: displayNum
                }
              ),
              photoUrl && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                "img",
                {
                  src: photoUrl,
                  alt: item.title || "",
                  loading: "lazy",
                  className: "h-14 w-14 flex-shrink-0 rounded-md object-cover border border-emerald-500/15 bg-slate-800",
                  onError: (e2) => {
                    e2.currentTarget.style.display = "none";
                  }
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: `font-medium ${t3.accent}`, children: item.title }),
                meta && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: `${t3.sub} text-[11px] mt-0.5`, children: meta }),
                address && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: `${t3.sub} text-[11px] mt-0.5 flex items-start gap-1`, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-map-marker-alt mt-[2px] text-[10px] opacity-70", "aria-hidden": "true" }),
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "break-words", children: address })
                ] }),
                item.community_name && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: `${t3.sub} text-[11px] mt-0.5 flex items-center gap-1`, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-people-group text-[10px] opacity-70", "aria-hidden": "true" }),
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: item.community_name })
                ] }),
                item.dietary_tags?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "flex gap-1 mt-1.5 flex-wrap", children: item.dietary_tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: `${t3.tag} text-[10px] px-1.5 py-0.5 rounded border`, children: tag }, tag)) }),
                onSuggestionClick && item.id && claimable && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                  "button",
                  {
                    type: "button",
                    onClick: () => onSuggestionClick(
                      isEs ? `Quiero reclamar el #${displayNum}` : `I'd like to claim #${displayNum}`
                    ),
                    className: "mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-50 text-[11px] font-semibold hover:bg-emerald-500/40 transition-colors",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-hand-holding-heart text-[10px]", "aria-hidden": "true" }),
                      isEs ? "Reclamar solo este" : "Claim this one"
                    ]
                  }
                )
              ] })
            ] })
          },
          item.id || displayNum
        );
      }),
      searchItems.length > 25 && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("li", { className: `text-[11px] ${t3.sub} text-center pt-0.5`, children: isEs ? `+${searchItems.length - 25} m\xE1s` : `+${searchItems.length - 25} more` })
    ] })
  ] });
}
function ToolResultCard({ toolResult, language = "en", onSuggestionClick, allowedCommunityIds = null }) {
  if (!toolResult) return null;
  const { tool } = toolResult;
  const result = toolResult.result ?? toolResult;
  const ok = (result?.success === true || toolResult.ok === true) && !result?.error;
  const rawSearchItems = result.listings ?? result.results ?? [];
  const searchBrowseTools = [
    "search_food_near_user",
    "search_food_nearby",
    "get_recent_listings",
    "get_community_listings"
  ];
  const searchItems = searchBrowseTools.includes(tool) ? rawSearchItems.filter((item) => {
    if (item?.community_id == null || item?.community_id === "") return true;
    return listingVisibleToCommunityScope(item, allowedCommunityIds);
  }) : rawSearchItems;
  if ((tool === "search_food_near_user" || tool === "search_food_nearby" || tool === "get_recent_listings" || tool === "get_my_claims" || tool === "get_community_listings" || tool === "get_user_listings") && searchItems.length > 0) {
    const cardKind = tool === "get_user_listings" ? "mylistings" : tool === "get_my_claims" ? "myclaims" : tool === "get_community_listings" ? "community" : "search";
    const t3 = TOOL_CARD_TOKENS[cardKind] || TOOL_CARD_TOKENS.search;
    if (["search_food_near_user", "search_food_nearby", "get_recent_listings", "get_community_listings"].includes(tool)) {
      return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        SearchResultsClaimList,
        {
          searchItems,
          tool,
          language,
          t: t3,
          cardKind,
          onSuggestionClick
        }
      );
    }
    const fmtDate = (iso) => {
      if (!iso) return null;
      try {
        const [y2, m2, d2] = String(iso).slice(0, 10).split("-").map(Number);
        return new Date(y2, m2 - 1, d2).toLocaleDateString(void 0, { month: "short", day: "numeric" });
      } catch {
        return iso;
      }
    };
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ToolCardShell, { kind: cardKind, language, titleOverride: `${t3.title[language] || t3.title.en} \xB7 ${searchItems.length}`, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("ul", { className: "space-y-1.5", children: searchItems.slice(0, 25).map((item, idx) => {
      const displayNum = item.display_index ?? idx + 1;
      const miles = item.distance_miles != null ? Number(item.distance_miles) : item.distance_km != null ? Number(item.distance_km) * 0.621371 : null;
      const distance = miles != null && Number.isFinite(miles) ? `${miles.toFixed(miles < 10 ? 1 : 0)} mi` : null;
      const qtyLabel = item.quantity != null ? `${item.quantity}${item.unit ? ` ${item.unit}` : ""} available` : null;
      const expiryRaw = item.expiry_date || item.pickup_by || null;
      const expiryLabel = fmtDate(expiryRaw);
      const meta = [distance, qtyLabel, item.category, expiryLabel ? `Exp ${expiryLabel}` : null].filter(Boolean).join(" \xB7 ");
      const address = item.address || item.full_address || item.pickup_location || null;
      const photoUrl = typeof item.image_url === "string" && /^https?:\/\//i.test(item.image_url) ? item.image_url : null;
      return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("li", { className: "rounded-lg bg-slate-900/40 px-2.5 py-2 border border-emerald-500/15", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex gap-2.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          "span",
          {
            className: `flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-[12px] font-bold ${t3.accent}`,
            "aria-hidden": "true",
            children: displayNum
          }
        ),
        photoUrl && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          "img",
          {
            src: photoUrl,
            alt: item.title || "",
            loading: "lazy",
            className: "h-14 w-14 flex-shrink-0 rounded-md object-cover border border-emerald-500/15 bg-slate-800",
            onError: (e2) => {
              e2.currentTarget.style.display = "none";
            }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: `font-medium ${t3.accent}`, children: item.title }),
          meta && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: `${t3.sub} text-[11px] mt-0.5`, children: meta }),
          address && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: `${t3.sub} text-[11px] mt-0.5 flex items-start gap-1`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-map-marker-alt mt-[2px] text-[10px] opacity-70", "aria-hidden": "true" }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "break-words", children: address })
          ] })
        ] })
      ] }) }, item.id || displayNum);
    }) }) });
  }
  if (tool === "claim_listings") {
    const claimed = Array.isArray(result.claimed) ? result.claimed : [];
    const failed = Array.isArray(result.failed) ? result.failed : [];
    if (claimed.length === 0 && failed.length === 0 && !result.summary) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
      ToolCardShell,
      {
        kind: failed.length && !claimed.length ? "claimfail" : "claim",
        language,
        titleOverride: language === "es" ? `Reclamos \xB7 ${claimed.length} ok${failed.length ? `, ${failed.length} fallaron` : ""}` : `Multi-claim \xB7 ${claimed.length} ok${failed.length ? `, ${failed.length} failed` : ""}`,
        children: [
          claimed.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("ul", { className: "space-y-1.5 mb-2", children: claimed.map((c2, i2) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("li", { className: "text-white text-[12px]", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "font-semibold", children: c2.title || c2.listing_id || "Listing" }),
            c2.quantity != null && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "text-emerald-50", children: [
              " \xB7 ",
              c2.quantity,
              " ",
              c2.unit || ""
            ] })
          ] }, c2.listing_id || c2.claim_id || i2)) }),
          failed.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("ul", { className: "space-y-1 text-red-100 text-[11px]", children: failed.map((f2, i2) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("li", { children: [
            f2.title || f2.listing_id || `#${f2.index ?? i2 + 1}`,
            ": ",
            f2.error || "failed"
          ] }, f2.listing_id || i2)) }),
          (result.summary || result.message) && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-white text-[12px] mt-1", children: result.summary || result.message })
        ]
      }
    );
  }
  if ((tool === "claim_listing" || tool === "claim_food") && !ok && (result?.error || toolResult.summary)) {
    const errText = result?.error || toolResult.summary;
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(ToolCardShell, { kind: "claimfail", language, children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-white", children: errText }),
      result?.next_step && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: `${TOOL_CARD_TOKENS.claimfail.sub} text-[11px] mt-1.5`, children: result.next_step })
    ] });
  }
  if ((tool === "claim_listing" || tool === "claim_food") && ok) {
    const photoUrl = typeof result.image_url === "string" && /^https?:\/\//i.test(result.image_url) ? result.image_url : null;
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ToolCardShell, { kind: "claim", language, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex gap-2.5", children: [
      photoUrl && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        "img",
        {
          src: photoUrl,
          alt: result.title || "",
          loading: "lazy",
          className: "h-14 w-14 flex-shrink-0 rounded-md object-cover border border-emerald-500/15 bg-slate-800",
          onError: (e2) => {
            e2.currentTarget.style.display = "none";
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "min-w-0 flex-1", children: [
        result.title && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "text-white", children: [
          result.quantity ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "font-medium", children: [
            result.quantity,
            " ",
            result.unit || "",
            " "
          ] }) : null,
          result.quantity ? language === "es" ? "de " : "of " : null,
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "font-semibold", children: result.title }),
          result.category && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "text-emerald-50", children: [
            " \xB7 ",
            result.category
          ] })
        ] }),
        result.pickup_location && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "text-white text-[11px] mt-1 flex items-start gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-location-dot text-[10px] mt-[2px] opacity-70", "aria-hidden": "true" }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "break-words", children: result.pickup_location })
        ] }),
        result.community_name && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "text-white text-[11px] mt-0.5 flex items-center gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-people-group text-[10px] opacity-70", "aria-hidden": "true" }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: result.community_name })
        ] }),
        (result.summary || result.message) && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-white text-[12px] mt-1", children: result.summary || result.message })
      ] })
    ] }) });
  }
  if (tool === "create_reminder" && (result?.success || result?.created)) {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ToolCardShell, { kind: "reminder", language, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "text-white", children: result.summary || (language === "es" ? "Te avisar\xE9." : "I'll ping you.") }) });
  }
  if ((tool === "post_food_listings" || tool === "bulk_post_food_listings" || tool === "bulk_import_listings") && ok) {
    const posted = Array.isArray(result.posted) ? result.posted : Array.isArray(result.listings) ? result.listings : [];
    const failed = Array.isArray(result.failed) ? result.failed : [];
    const count = result.count_posted ?? posted.length;
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
      ToolCardShell,
      {
        kind: "post",
        language,
        titleOverride: language === "es" ? `Publicado \xB7 ${count} listado${count === 1 ? "" : "s"}` : `Posted \xB7 ${count} listing${count === 1 ? "" : "s"}`,
        children: [
          posted.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("ul", { className: "space-y-1.5 mb-2", children: posted.slice(0, 12).map((row, i2) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("li", { className: "text-white text-[12px]", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "font-semibold", children: row.title || row.listing_id || `Item ${i2 + 1}` }),
            row.quantity != null && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "text-fuchsia-50", children: [
              " \xB7 ",
              row.quantity,
              " ",
              row.unit || ""
            ] })
          ] }, row.listing_id || row.id || i2)) }),
          failed.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("ul", { className: "space-y-1 text-red-100 text-[11px] mb-1", children: failed.slice(0, 8).map((f2, i2) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("li", { children: [
            f2.title || f2.listing_id || `#${i2 + 1}`,
            ": ",
            f2.error || "failed"
          ] }, f2.listing_id || i2)) }),
          (result.summary || result.message) && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-white text-[12px] mt-1", children: result.summary || result.message })
        ]
      }
    );
  }
  if ((tool === "create_food_listing" || tool === "post_food_listing") && !ok && (result?.error || toolResult.summary)) {
    const errText = result?.error || toolResult.summary;
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(ToolCardShell, { kind: "claimfail", language, titleOverride: language === "es" ? "No se pudo publicar" : "Could not post", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-white", children: errText }),
      result?.next_step && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: `${TOOL_CARD_TOKENS.claimfail.sub} text-[11px] mt-1.5`, children: result.next_step })
    ] });
  }
  if ((tool === "create_food_listing" || tool === "post_food_listing") && ok) {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(ToolCardShell, { kind: "post", language, children: [
      result.title && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "text-white", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "font-semibold", children: result.title }),
        result.quantity != null && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "text-white", children: [
          " \xB7 ",
          result.quantity,
          " ",
          result.unit || ""
        ] }),
        result.category && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "text-white", children: [
          " \xB7 ",
          result.category
        ] })
      ] }),
      result.address && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "text-white text-[11px] mt-1 flex items-start gap-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-map-marker-alt mt-[2px] text-[10px] opacity-70", "aria-hidden": "true" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "break-words", children: result.address })
      ] }),
      result.community_name && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "text-white text-[11px] mt-0.5 flex items-center gap-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-people-group text-[10px] opacity-70", "aria-hidden": "true" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: result.community_name })
      ] }),
      result.on_map === false && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "text-amber-50 text-[11px] mt-1 flex items-center gap-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-triangle-exclamation text-[10px]", "aria-hidden": "true" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: language === "es" ? "Sin coordenadas \u2014 no aparecer\xE1 en el mapa" : "No coordinates \u2014 listing will not appear on the map" })
      ] }),
      (result.summary || result.message) && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-white mt-1", children: result.summary || result.message })
    ] });
  }
  if ((tool === "update_food_listing" || tool === "update_listing" || tool === "edit_listing") && ok) {
    const item = result.listing || result;
    const fmtDate = (iso) => {
      if (!iso) return null;
      try {
        const [y2, m2, d2] = String(iso).slice(0, 10).split("-").map(Number);
        return new Date(y2, m2 - 1, d2).toLocaleDateString(void 0, { month: "short", day: "numeric" });
      } catch {
        return iso;
      }
    };
    const qtyLabel = item.quantity != null ? `${item.quantity}${item.unit ? ` ${item.unit}` : ""}` : null;
    const expiryLabel = fmtDate(item.expiry_date || item.pickup_by);
    const address = item.address || item.full_address || item.location || null;
    const photoUrl = typeof item.image_url === "string" && /^https?:\/\//i.test(item.image_url) ? item.image_url : null;
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ToolCardShell, { kind: "updated", language, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex gap-2.5", children: [
      photoUrl && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        "img",
        {
          src: photoUrl,
          alt: item.title || "",
          loading: "lazy",
          className: "h-14 w-14 flex-shrink-0 rounded-md object-cover border border-violet-500/15 bg-slate-800",
          onError: (e2) => {
            e2.currentTarget.style.display = "none";
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "min-w-0 flex-1", children: [
        item.title && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-white font-semibold", children: item.title }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: `${TOOL_CARD_TOKENS.updated.sub} text-[11px] mt-0.5 space-y-0.5`, children: [
          qtyLabel && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { children: [
            language === "es" ? "Cantidad: " : "Quantity: ",
            qtyLabel
          ] }),
          expiryLabel && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { children: [
            language === "es" ? "Vence: " : "Expires: ",
            expiryLabel
          ] }),
          item.community_name && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-people-group text-[10px] opacity-70", "aria-hidden": "true" }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: item.community_name })
          ] }),
          address && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex items-start gap-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-map-marker-alt mt-[2px] text-[10px] opacity-70", "aria-hidden": "true" }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "break-words", children: address })
          ] }),
          item.description && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "italic opacity-90", children: item.description })
        ] }),
        (result.summary || result.message) && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-white text-[11px] mt-1", children: result.summary || result.message })
      ] })
    ] }) });
  }
  if ((tool === "update_food_listing" || tool === "update_listing" || tool === "edit_listing") && !ok) {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ToolCardShell, { kind: "claimfail", language, titleOverride: language === "es" ? "No se pudo actualizar" : "Could not update", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-white", children: result?.error || result?.message || result?.summary }) });
  }
  if (tool === "delete_listing" && ok) {
    const count = result.deleted_count || 1;
    const titles = result.titles || (result.title ? [result.title] : []);
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(ToolCardShell, { kind: "deleted", language, children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-white", children: count > 1 ? language === "es" ? `Eliminados ${count} listados duplicados.` : `Removed ${count} duplicate listings.` : /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
        language === "es" ? "Eliminado: " : "Removed: ",
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "font-semibold", children: result.title || titles[0] || "listing" })
      ] }) }),
      (result.summary || result.message) && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-white mt-1", children: result.summary || result.message })
    ] });
  }
  if (tool === "delete_listing" && !ok) {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(ToolCardShell, { kind: "error", language, children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-white font-medium", children: language === "es" ? "No se pudo eliminar" : "Could not delete listing" }),
      (result.error || result.message || result.summary) && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-white mt-1", children: result.error || result.message || result.summary })
    ] });
  }
  if (tool === "cancel_claim" && ok) {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(ToolCardShell, { kind: "cancel", language, children: [
      result.title && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "text-amber-100", children: [
        language === "es" ? "Liberado: " : "Released: ",
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "font-semibold", children: result.title })
      ] }),
      result.summary && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-amber-50 mt-1", children: result.summary })
    ] });
  }
  if (tool === "confirm_claim" && ok) {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(ToolCardShell, { kind: "pickup", language, children: [
      result.title && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "text-sky-100", children: [
        language === "es" ? "Completado: " : "Completed: ",
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "font-semibold", children: result.title })
      ] }),
      result.summary && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-white mt-1", children: result.summary })
    ] });
  }
  if (tool === "get_recipes" && !result?.error) {
    const recipes = Array.isArray(result.recipes) ? result.recipes : [];
    const cards = recipes.map(recipeForCard).filter(Boolean);
    if (cards.length === 0 && !result.summary && !result.headline) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
      ToolCardShell,
      {
        kind: "generic",
        language,
        titleOverride: language === "es" ? "Recetas sugeridas" : "Recipe suggestions",
        children: [
          (result.headline || result.summary) && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-white text-[12px] mb-3", children: result.headline || result.summary }),
          cards.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "space-y-3", children: cards.map((recipe, idx) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(RecipeCard_default, { recipe }, `${recipe.name}-${idx}`)) }) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-white text-[12px]", children: result.summary || result.headline })
        ]
      }
    );
  }
  if (tool === "get_storage_tips" && !result?.error) {
    const entries = parseStorageTipEntries(result, language);
    if (entries.length === 0) {
      if (result.summary || result.message) {
        return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ToolCardShell, { kind: "generic", language, titleOverride: language === "es" ? "Conservaci\xF3n" : "Storage tips", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-white text-[12px]", children: result.summary || result.message }) });
      }
      return null;
    }
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      ToolCardShell,
      {
        kind: "generic",
        language,
        titleOverride: language === "es" ? "Consejos de conservaci\xF3n" : "Storage tips",
        children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "space-y-3", children: entries.map((entry, idx) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(StorageTipCard_default, { foodItem: entry.foodItem, tips: entry.tips }, `${entry.foodItem}-${idx}`)) })
      }
    );
  }
  const SILENT_UI_TOOLS = /* @__PURE__ */ new Set(["ui_action", "navigate_ui", "mark_notifications_read"]);
  if (ok && !SILENT_UI_TOOLS.has(tool) && (result?.summary || result?.message)) {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ToolCardShell, { kind: "generic", language, titleOverride: tool?.replace(/_/g, " ") || (language === "es" ? "Acci\xF3n" : "Action"), children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-white text-[12px]", children: result.summary || result.message }) });
  }
  return null;
}
function describeErrorCode(code, language = "en") {
  const isEs = language === "es";
  switch (code) {
    case "timeout":
      return {
        eyebrow: isEs ? "Tiempo agotado" : "Timed out",
        hint: isEs ? "La respuesta tard\xF3 demasiado." : "The response took too long."
      };
    case "rate_limit":
      return {
        eyebrow: isEs ? "L\xEDmite de uso" : "Rate limited",
        hint: isEs ? "Demasiadas solicitudes. Espera unos segundos." : "Too many requests. Wait a few seconds."
      };
    case "model_unavailable":
      return {
        eyebrow: isEs ? "IA no disponible" : "AI unavailable",
        hint: isEs ? "El modelo est\xE1 temporalmente ca\xEDdo." : "The model is temporarily down."
      };
    case "circuit_open":
      return {
        eyebrow: isEs ? "Recuperando" : "Recovering",
        hint: isEs ? "Estoy recuper\xE1ndome de un problema." : "I'm bouncing back from an issue."
      };
    case "auth":
      return {
        eyebrow: isEs ? "Autenticaci\xF3n" : "Auth error",
        hint: isEs ? "Hay un problema con las credenciales del servicio." : "There's an issue with service credentials."
      };
    case "invalid_input":
      return {
        eyebrow: isEs ? "Entrada inv\xE1lida" : "Invalid request",
        hint: isEs ? "No pude procesar esa entrada." : "I couldn't process that input."
      };
    default:
      return {
        eyebrow: isEs ? "Error" : "Error",
        hint: isEs ? "Algo sali\xF3 mal." : "Something went wrong."
      };
  }
}
function ConfirmationBar({ language, pendingAction, onConfirm, onCancel, onEdit, disabled }) {
  const summary = pendingAction?.summary || "";
  const isEs = language === "es";
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200 ring-1 ring-amber-200/60", children: [
    summary && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "text-amber-950 text-xs mb-2.5 leading-snug font-medium", children: [
      isEs ? "Acci\xF3n pendiente: " : "Pending: ",
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "font-medium", children: summary })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
        "button",
        {
          type: "button",
          onClick: onConfirm,
          disabled,
          className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-check text-[10px]", "aria-hidden": "true" }),
            isEs ? "Confirmar" : "Confirm"
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
        "button",
        {
          type: "button",
          onClick: onEdit,
          disabled,
          className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-gray-50 text-gray-900 border border-gray-400 disabled:opacity-40",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-pen text-[10px]", "aria-hidden": "true" }),
            isEs ? "Editar" : "Edit"
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
        "button",
        {
          type: "button",
          onClick: onCancel,
          disabled,
          className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-gray-50 text-gray-800 border border-gray-400 disabled:opacity-40",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-xmark text-[10px]", "aria-hidden": "true" }),
            isEs ? "Cancelar" : "Cancel"
          ]
        }
      )
    ] })
  ] });
}
function MessageBubble({
  msg,
  onFeedback,
  language,
  onSuggestionClick,
  onAttachPhoto,
  onConfirmAction,
  isLoading,
  currentUser,
  allowedCommunityIds = null,
  onRetry,
  onRegenerate,
  showRegenerate = false,
  showSuggestionChips = false
}) {
  const [feedbackGiven, setFeedbackGiven] = (0, import_react11.useState)(null);
  const [avatarBroken, setAvatarBroken] = (0, import_react11.useState)(false);
  const [copied, setCopied] = (0, import_react11.useState)(false);
  const isUser = msg.role === "user";
  const suggestionItems = (0, import_react11.useMemo)(() => {
    const raw = msg.suggestions || msg.suggestedActions || [];
    return resolveInputChips(raw, language, null, {
      allowLazy: false
    });
  }, [msg.suggestions, msg.suggestedActions, language]);
  const isVoiceMessage = msg.source === "voice";
  const timeLabel = formatChatTime(msg.timestamp);
  const handleFeedback = (rating) => {
    setFeedbackGiven(rating);
    onFeedback?.(msg.id, rating);
  };
  const handleCopy = (0, import_react11.useCallback)(() => {
    if (!msg.message) return;
    try {
      const copy = navigator?.clipboard?.writeText?.bind(navigator.clipboard);
      if (copy) {
        copy(msg.message).then(
          () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          },
          () => {
          }
        );
      }
    } catch {
    }
  }, [msg.message]);
  const userInitials = (0, import_react11.useMemo)(() => {
    const src = (currentUser?.name || currentUser?.email || "").trim();
    if (!src) return "\u{1F64B}";
    const parts = src.split(/[\s@._-]+/).filter(Boolean);
    if (parts.length === 0) return src.charAt(0).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }, [currentUser?.name, currentUser?.email]);
  const userAvatarUrl = !avatarBroken ? currentUser?.avatar_url : null;
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: `flex ${isUser ? "justify-end" : "justify-start"} mb-3`, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: `max-w-[85%] flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`, children: [
    !isUser && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-[#2CABE3] to-emerald-500 flex items-center justify-center mt-1 shadow-sm shadow-[#2CABE3]/25", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("svg", { viewBox: "0 0 100 100", className: "w-5 h-5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("circle", { cx: "50", cy: "52", r: "36", fill: "#f0f4f8" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("rect", { x: "26", y: "38", rx: "12", ry: "12", width: "48", height: "24", fill: "#1e293b", opacity: "0.85" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("path", { d: "M35 53 Q38 46 41 53", stroke: "#67e8f9", strokeWidth: "4", strokeLinecap: "round", fill: "none" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("path", { d: "M59 53 Q62 46 65 53", stroke: "#67e8f9", strokeWidth: "4", strokeLinecap: "round", fill: "none" })
    ] }) }),
    isUser && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      "div",
      {
        className: "flex-shrink-0 w-7 h-7 rounded-full overflow-hidden mt-1 shadow-sm shadow-[#2CABE3]/20 ring-1 ring-[#2CABE3]/30 bg-gradient-to-br from-[#2CABE3] to-emerald-500 flex items-center justify-center",
        title: currentUser?.name || currentUser?.email || "You",
        "aria-label": `Message from ${currentUser?.name || "you"}`,
        children: userAvatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          "img",
          {
            src: userAvatarUrl,
            alt: currentUser?.name || "You",
            className: "w-full h-full object-cover",
            onError: () => setAvatarBroken(true)
          }
        ) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "text-[10px] font-semibold text-white tracking-wide", children: userInitials })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "group/msg min-w-0 flex-1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
        "div",
        {
          className: `px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed ${isUser ? "bg-gradient-to-br from-[#2CABE3] to-emerald-500 text-white rounded-br-md shadow-md shadow-[#2CABE3]/20 ring-1 ring-[#2CABE3]/20" : msg.isError ? "bg-red-50 text-red-800 border border-red-200 rounded-bl-md backdrop-blur-sm" : "bg-white text-gray-900 rounded-bl-md border border-[#2CABE3]/15 shadow-sm"}`,
          children: [
            /^image:\s*https?:\/\//i.test(msg.message) ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                "img",
                {
                  src: msg.message.replace(/^image:\s*/i, ""),
                  alt: "uploaded",
                  className: "max-h-32 max-w-[200px] rounded-lg object-cover ring-1 ring-white/20",
                  onError: (e2) => {
                    e2.currentTarget.style.display = "none";
                  }
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "text-[11px] opacity-70", children: "\u{1F4F7}" })
            ] }) : (
              // Defensive: if the model emits markdown image syntax
              // (`![alt](url)`) — typically a hallucinated photo URL — strip
              // it before rendering. Real listing photos are shown in the
              // search tool card from `item.image_url`, never in prose.
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: "whitespace-pre-wrap", children: String(msg.message || "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").trim() })
            ),
            msg.isError && msg.errorCode && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "mt-2.5 pt-2.5 border-t border-red-200 flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-semibold tracking-wide ring-1 ring-red-200", children: [
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-circle-exclamation text-[9px]", "aria-hidden": "true" }),
                describeErrorCode(msg.errorCode, language).eyebrow
              ] }),
              msg.errorRetryable && onRetry && msg.retryText && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                "button",
                {
                  type: "button",
                  onClick: () => onRetry(msg.id),
                  disabled: isLoading,
                  className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300",
                  "aria-label": language === "es" ? "Reintentar mensaje" : "Retry message",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: `fas ${isLoading ? "fa-spinner fa-spin" : "fa-rotate-right"} text-[10px]`, "aria-hidden": "true" }),
                    language === "es" ? "Reintentar" : "Retry",
                    msg.errorRetryAfter ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "text-white/80 font-normal", children: [
                      "\xB7 ",
                      msg.errorRetryAfter,
                      "s"
                    ] }) : null
                  ]
                }
              ),
              msg.requestId && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                "span",
                {
                  className: "ml-auto text-[9px] font-mono text-red-400 tracking-wider truncate max-w-[120px]",
                  title: `Request ID: ${msg.requestId}`,
                  children: msg.requestId.slice(0, 8)
                }
              )
            ] })
          ]
        }
      ),
      !isUser && msg.requiresConfirmation && showSuggestionChips && onConfirmAction && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        ConfirmationBar,
        {
          language,
          pendingAction: msg.pendingAction,
          disabled: isLoading,
          onConfirm: () => onConfirmAction(true),
          onCancel: () => onConfirmAction(false),
          onEdit: () => onSuggestionClick?.(language === "es" ? "Espera, ed\xEDtalo" : "Wait, edit it")
        }
      ),
      msg.toolResults?.map((tr, i2) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        ToolResultCard,
        {
          toolResult: tr,
          language,
          onSuggestionClick,
          allowedCommunityIds
        },
        i2
      )),
      showSuggestionChips && suggestionItems.length > 0 && !isUser && !msg.isError && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: `flex flex-wrap gap-1 mt-2 ${suggestionItems.length > 4 ? "max-h-36 overflow-y-auto pr-1" : ""}`, children: suggestionItems.map((action, i2) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        SuggestedActionButton,
        {
          action,
          onSuggestionClick,
          onAttachPhoto,
          disabled: isLoading,
          compact: suggestionItems.length > 4
        },
        i2
      )) }),
      !isUser && !msg.isError && msg.id !== "welcome" && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
        "div",
        {
          className: "flex items-center gap-1 mt-1.5 opacity-80 md:opacity-70 md:group-hover/msg:opacity-100 transition-opacity",
          role: "toolbar",
          "aria-label": language === "es" ? "Acciones del mensaje" : "Message actions",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(VoiceOutput_default, { text: msg.message, language }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              "button",
              {
                type: "button",
                onClick: handleCopy,
                className: "inline-flex items-center justify-center w-6 h-6 rounded-md text-gray-500 hover:text-[#2CABE3] hover:bg-[#2CABE3]/10 transition-colors",
                title: copied ? language === "es" ? "Copiado" : "Copied" : language === "es" ? "Copiar" : "Copy",
                "aria-label": language === "es" ? "Copiar mensaje" : "Copy message",
                children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: `fas ${copied ? "fa-check text-[#2CABE3]" : "fa-copy"} text-[11px]`, "aria-hidden": "true" })
              }
            ),
            !feedbackGiven && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                "button",
                {
                  type: "button",
                  onClick: () => handleFeedback("helpful"),
                  className: "inline-flex items-center justify-center w-6 h-6 rounded-md text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors",
                  title: language === "es" ? "\xDAtil" : "Helpful",
                  "aria-label": language === "es" ? "Marcar como \xFAtil" : "Mark as helpful",
                  children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-thumbs-up text-[11px]", "aria-hidden": "true" })
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                "button",
                {
                  type: "button",
                  onClick: () => handleFeedback("not_helpful"),
                  className: "inline-flex items-center justify-center w-6 h-6 rounded-md text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors",
                  title: language === "es" ? "No \xFAtil" : "Not helpful",
                  "aria-label": language === "es" ? "Marcar como no \xFAtil" : "Mark as not helpful",
                  children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-thumbs-down text-[11px]", "aria-hidden": "true" })
                }
              )
            ] }),
            feedbackGiven && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "text-[10px] text-[#2299c7] px-1.5 py-0.5 rounded-md bg-[#2CABE3]/10 border border-[#2CABE3]/20", children: feedbackGiven === "helpful" ? language === "es" ? "Gracias \u{1F44D}" : "Thanks \u{1F44D}" : language === "es" ? "Anotado \u{1F44E}" : "Noted \u{1F44E}" }),
            showRegenerate && onRegenerate && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
              "button",
              {
                type: "button",
                onClick: onRegenerate,
                disabled: isLoading,
                className: "ml-1 inline-flex items-center gap-1 px-1.5 h-6 rounded-md text-gray-500 hover:text-[#2CABE3] hover:bg-[#2CABE3]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-medium",
                title: language === "es" ? "Regenerar respuesta" : "Regenerate response",
                "aria-label": language === "es" ? "Regenerar respuesta" : "Regenerate response",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: `fas ${isLoading ? "fa-spinner fa-spin" : "fa-arrows-rotate"} text-[10px]`, "aria-hidden": "true" }),
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "hidden sm:inline", children: language === "es" ? "Regenerar" : "Regenerate" })
                ]
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: `text-[10px] mt-1 flex items-center gap-1 ${isUser ? "justify-end text-white/75" : "text-gray-500"}`, children: [
        isVoiceMessage && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "px-1.5 py-0.5 rounded-full border border-white/30 bg-white/15 text-white/90 text-[9px] uppercase tracking-wide inline-flex items-center gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-microphone text-[8px]", "aria-hidden": "true" }),
          language === "es" ? "Voz" : "Voice"
        ] }),
        timeLabel && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: timeLabel })
      ] })
    ] })
  ] }) });
}
function SuggestedActionButton({ action, onSuggestionClick, onAttachPhoto, disabled = false, compact = false }) {
  const { executeUIAction } = useUIControl();
  const asObject = action && typeof action === "object";
  const label = asObject ? action.label || action.message || action.text || "" : String(action || "");
  const actionType = asObject ? action.action || (action.href ? "navigate" : "send") : "send";
  const sendText = asObject ? action.message || action.text || action.query || action.prompt || action.label || "" : String(action || "");
  const handleClick = () => {
    if (disabled) return;
    const isOpenForm = /^(open the form|abrir el formulario)$/i.test(String(sendText || label || "").trim());
    const isAttachPhoto = actionType === "attach_photo" || /^(attach a photo|adjuntar foto)$/i.test(String(label || sendText || "").trim());
    if (isAttachPhoto && onAttachPhoto) {
      onAttachPhoto();
      return;
    }
    if (actionType === "navigate" && asObject && (action.target || action.href || action.path)) {
      const target = action.target || action.href || action.path;
      const path = action.path || (typeof target === "string" && target.startsWith("/") ? target : void 0);
      executeUIAction({
        ok: true,
        action: "navigate",
        path: path || (isOpenForm ? "/share" : void 0),
        target: typeof target === "string" && !String(target).startsWith("/") ? target : void 0
      });
      if (sendText && onSuggestionClick) {
        onSuggestionClick(sendText);
      }
      return;
    }
    if (sendText && onSuggestionClick) {
      onSuggestionClick(sendText);
    }
  };
  if (!label) return null;
  const styleClass = actionType === "navigate" ? "bg-blue-50 text-blue-800 hover:bg-blue-100 border-blue-300 font-medium" : "bg-[#2CABE3]/15 text-[#1a7a9e] hover:bg-[#2CABE3]/25 border-[#2CABE3]/30 font-medium";
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
    "button",
    {
      onClick: handleClick,
      disabled,
      className: `${compact ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"} rounded-full transition-colors border ${styleClass} disabled:opacity-60 disabled:cursor-not-allowed`,
      children: label
    }
  );
}
function BulkUploadPreview({
  pending,
  busy,
  language,
  preferredCommunityId,
  preferredLocation,
  onCancel,
  onConfirm,
  onUpdateRow,
  onUpdateRows,
  onRemoveRow
}) {
  const isEs = language === "es";
  const kindLabel = pending.kind === "photo" ? isEs ? "Borrador desde foto" : "Draft from photo" : isEs ? "Importaci\xF3n CSV" : "CSV import";
  const icon = pending.kind === "photo" ? "fa-camera" : "fa-file-csv";
  const tint = pending.kind === "photo" ? "fuchsia" : "emerald";
  const ringClass = pending.kind === "photo" ? "border-fuchsia-500/40 shadow-fuchsia-500/10" : "border-emerald-500/40 shadow-emerald-500/10";
  const headerClass = pending.kind === "photo" ? "text-fuchsia-200" : "text-emerald-200";
  const [communities, setCommunities] = (0, import_react11.useState)([]);
  const [communitiesError, setCommunitiesError] = (0, import_react11.useState)(null);
  const [communitiesLoading, setCommunitiesLoading] = (0, import_react11.useState)(true);
  const [selectedRowIndexes, setSelectedRowIndexes] = (0, import_react11.useState)(() => /* @__PURE__ */ new Set());
  const [bulkLocation, setBulkLocation] = (0, import_react11.useState)(() => String(preferredLocation || "").trim());
  const [bulkCommunityId, setBulkCommunityId] = (0, import_react11.useState)(
    () => preferredCommunityId != null && preferredCommunityId !== "" ? String(preferredCommunityId) : ""
  );
  const [bulkCategory, setBulkCategory] = (0, import_react11.useState)("");
  const [bulkExpiry, setBulkExpiry] = (0, import_react11.useState)("");
  const [fillEmptyOnly, setFillEmptyOnly] = (0, import_react11.useState)(true);
  const loadCommunities = (0, import_react11.useCallback)(async () => {
    setCommunitiesLoading(true);
    setCommunitiesError(null);
    try {
      const { data, error } = await supabaseClient_default.from("communities").select("id, name").eq("is_active", true).order("name", { ascending: true });
      if (error) throw error;
      setCommunities(data || []);
    } catch (err) {
      setCommunities([]);
      setCommunitiesError(err?.message || (isEs ? "No se pudieron cargar las comunidades" : "Could not load communities"));
    } finally {
      setCommunitiesLoading(false);
    }
  }, [isEs]);
  (0, import_react11.useEffect)(() => {
    loadCommunities();
  }, [loadCommunities]);
  (0, import_react11.useEffect)(() => {
    if (pending?.kind !== "csv") return;
    const n2 = pending?.rows?.length || 0;
    setSelectedRowIndexes(new Set(Array.from({ length: n2 }, (_2, i2) => i2)));
    setBulkLocation((prev) => {
      if (String(prev || "").trim()) return prev;
      return String(preferredLocation || "").trim();
    });
    setBulkCommunityId((prev) => {
      if (String(prev || "").trim()) return prev;
      return preferredCommunityId != null && preferredCommunityId !== "" ? String(preferredCommunityId) : "";
    });
  }, [pending?.kind, pending?.rows?.length, preferredLocation, preferredCommunityId]);
  (0, import_react11.useEffect)(() => {
    if (!communities.length) return;
    const currentRows = pending?.rows || [];
    if (!currentRows.length) return;
    const preferred = preferredCommunityId ? communities.find((c2) => String(c2.id) === String(preferredCommunityId)) : null;
    currentRows.forEach((row, idx) => {
      if (row?.community_id) {
        if (!row.community_name) {
          const byId = communities.find((c2) => String(c2.id) === String(row.community_id));
          if (byId) onUpdateRow(idx, { community_name: byId.name });
        }
        return;
      }
      if (row?.community_name) {
        const match = matchCommunityByName(row.community_name, communities);
        if (match) {
          onUpdateRow(idx, {
            community_id: String(match.id),
            community_name: match.name
          });
        }
        return;
      }
      if (preferred) {
        onUpdateRow(idx, {
          community_id: String(preferred.id),
          community_name: preferred.name
        });
      }
    });
  }, [communities, preferredCommunityId, pending?.rows?.length, pending?.kind]);
  const filledLog = Array.isArray(pending.filledLog) ? pending.filledLog : [];
  const filledByIndex = (0, import_react11.useMemo)(() => {
    const m2 = /* @__PURE__ */ new Map();
    for (const f2 of filledLog) {
      if (f2 && typeof f2.index === "number") m2.set(f2.index, f2.fields || []);
    }
    return m2;
  }, [filledLog]);
  const rows = pending?.rows || [];
  const missingCommunity = rows.some((r3) => !r3?.community_id && !String(r3?.community_name || "").trim());
  const isCsv = pending.kind === "csv";
  const allSelected = isCsv && rows.length > 0 && selectedRowIndexes.size === rows.length;
  const someSelected = isCsv && selectedRowIndexes.size > 0 && selectedRowIndexes.size < rows.length;
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedRowIndexes(/* @__PURE__ */ new Set());
    } else {
      setSelectedRowIndexes(new Set(rows.map((_2, i2) => i2)));
    }
  };
  const toggleRowSelected = (idx) => {
    setSelectedRowIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };
  const applyPatchToSelected = (patch, isEmptyRow) => {
    if (!patch || typeof onUpdateRows !== "function" || !selectedRowIndexes.size) return;
    const indexes = Array.from(selectedRowIndexes).filter((idx) => {
      if (!fillEmptyOnly) return true;
      if (typeof isEmptyRow !== "function") return true;
      return isEmptyRow(rows[idx]);
    });
    if (!indexes.length) return;
    onUpdateRows(indexes, patch);
  };
  const applyLocationToSelected = () => {
    const location = String(bulkLocation || "").trim();
    if (!location) return;
    applyPatchToSelected(
      { location },
      (r3) => !String(r3?.location || "").trim()
    );
  };
  const applyCommunityToSelected = () => {
    const id = String(bulkCommunityId || "").trim();
    if (!id) return;
    const match = communities.find((c2) => String(c2.id) === id);
    if (!match) return;
    applyPatchToSelected(
      {
        community_id: String(match.id),
        community_name: match.name
      },
      (r3) => !r3?.community_id && !String(r3?.community_name || "").trim()
    );
  };
  const applyCategoryToSelected = () => {
    const category = String(bulkCategory || "").trim();
    if (!category) return;
    applyPatchToSelected(
      { category },
      (r3) => !String(r3?.category || "").trim() || String(r3?.category).toLowerCase() === "other"
    );
  };
  const applyExpiryToSelected = () => {
    const expiry = String(bulkExpiry || "").trim();
    if (!expiry) return;
    applyPatchToSelected(
      { expiry_date: expiry },
      (r3) => !String(r3?.expiry_date || "").trim()
    );
  };
  const applyAllMissingToSelected = () => {
    if (String(bulkLocation || "").trim()) applyLocationToSelected();
    if (String(bulkCommunityId || "").trim()) applyCommunityToSelected();
    if (String(bulkCategory || "").trim()) applyCategoryToSelected();
    if (String(bulkExpiry || "").trim()) applyExpiryToSelected();
  };
  if (pending.error) {
    const allErrors = [pending.error, ...(pending.parseErrors || []).slice(1)].filter(Boolean);
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: `mx-3 mb-2 rounded-xl border ${ringClass} bg-slate-900/80 backdrop-blur-sm p-3 shadow-sm`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: `fas ${icon} ${headerClass} mt-0.5`, "aria-hidden": "true" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-xs font-semibold text-slate-100", children: kindLabel }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-xs text-slate-300 truncate mb-1", children: pending.filename }),
          allErrors.map((e2, i2) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-sm text-rose-300", children: e2 }, i2))
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          "button",
          {
            type: "button",
            onClick: onCancel,
            className: "text-xs text-slate-300 hover:text-white px-2 py-1 rounded-md hover:bg-slate-800/60 flex-shrink-0",
            children: isEs ? "Cerrar" : "Dismiss"
          }
        )
      ] }),
      pending.kind === "csv" && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
        "button",
        {
          type: "button",
          onClick: downloadCsvTemplate,
          className: "mt-2 w-full flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/25 text-emerald-50 hover:bg-emerald-500/35 border border-emerald-400/40 transition-colors",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-download text-[10px]", "aria-hidden": "true" }),
            isEs ? "Descargar plantilla CSV" : "Download CSV template"
          ]
        }
      )
    ] });
  }
  if (pending.analyzing || pending.enriching) {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: `mx-3 mb-2 rounded-xl border ${ringClass} bg-slate-900/80 backdrop-blur-sm p-3 flex items-center gap-3 shadow-sm`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: `fas ${icon} ${headerClass}`, "aria-hidden": "true" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-xs font-semibold text-slate-100", children: kindLabel }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-xs text-slate-300 truncate", children: pending.filename }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "mt-1 text-sm text-slate-200", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-wand-magic-sparkles mr-1.5 text-cyan-300 animate-pulse", "aria-hidden": "true" }),
          pending.enriching ? isEs ? "Rellenando huecos con IA\u2026" : "Filling gaps with AI\u2026" : isEs ? "Analizando con IA..." : "Analyzing with AI\u2026"
        ] })
      ] })
    ] });
  }
  if (rows.length === 0) return null;
  const previewRows = isCsv ? rows : rows.slice(0, 5);
  const extra = isCsv ? 0 : rows.length - previewRows.length;
  const totalFilled = filledLog.length;
  const selectAllRef = (el) => {
    if (el) el.indeterminate = someSelected;
  };
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: `mx-3 mb-2 rounded-xl border ${ringClass} bg-slate-900/80 backdrop-blur-sm p-3 shadow-sm`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex items-center gap-2 mb-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: `fas ${icon} ${headerClass}`, "aria-hidden": "true" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "text-xs font-semibold text-slate-200", children: [
        kindLabel,
        " \xB7 ",
        rows.length,
        " ",
        rows.length === 1 ? isEs ? "fila" : "row" : isEs ? "filas" : "rows"
      ] }),
      typeof pending.confidence === "number" && pending.kind === "photo" && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "text-[10px] text-slate-300 ml-auto", children: [
        isEs ? "Confianza" : "Confidence",
        ": ",
        Math.round(pending.confidence * 100),
        "%"
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-[11px] text-slate-300 mb-2 truncate", title: pending.filename, children: pending.filename }),
    pending.enriched && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "mb-2 flex items-start gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/15 px-2 py-1.5 text-[11px] text-cyan-50", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-wand-magic-sparkles mt-0.5", "aria-hidden": "true" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "flex-1", children: pending.enrichSummary || (totalFilled ? isEs ? `IA rellen\xF3 huecos en ${totalFilled} fila(s). Revisa y confirma.` : `AI filled gaps on ${totalFilled} row(s). Review and confirm.` : isEs ? "IA revis\xF3 tus filas \u2014 no hab\xEDa huecos que rellenar." : "AI reviewed your rows \u2014 no gaps to fill.") })
    ] }),
    isCsv && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "mb-2 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-2 space-y-1.5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("label", { className: "flex items-center gap-2 text-[11px] text-slate-200 cursor-pointer select-none", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            "input",
            {
              ref: selectAllRef,
              type: "checkbox",
              checked: allSelected,
              onChange: toggleSelectAll,
              disabled: busy || rows.length === 0,
              className: "rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500/40",
              "aria-label": isEs ? "Seleccionar todas las filas" : "Select all rows"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "font-medium", children: isEs ? "Seleccionar todas" : "Select all" }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "text-slate-300", children: [
            "(",
            selectedRowIndexes.size,
            "/",
            rows.length,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("label", { className: "flex items-center gap-1.5 text-[11px] text-slate-200 cursor-pointer select-none", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            "input",
            {
              type: "checkbox",
              checked: fillEmptyOnly,
              onChange: (e2) => setFillEmptyOnly(e2.target.checked),
              disabled: busy,
              className: "rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500/40"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: isEs ? "Solo rellenar vac\xEDos" : "Only fill empty" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex flex-col sm:flex-row gap-1.5 items-stretch sm:items-center", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("label", { className: "flex-1 flex items-center gap-1.5 min-w-0 text-[11px]", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-people-group text-emerald-300 flex-shrink-0", "aria-hidden": "true" }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
            "select",
            {
              value: bulkCommunityId,
              onChange: (e2) => setBulkCommunityId(e2.target.value),
              disabled: busy || communitiesLoading || communities.length === 0,
              className: "flex-1 min-w-0 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-100 outline-none focus:border-emerald-500/50",
              "aria-label": isEs ? "Comunidad compartida" : "Shared community",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("option", { value: "", children: communitiesLoading ? isEs ? "Cargando comunidades\u2026" : "Loading communities\u2026" : isEs ? "Una comunidad para las seleccionadas\u2026" : "One community for selected rows\u2026" }),
                communities.map((c2) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("option", { value: c2.id, children: c2.name }, c2.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          "button",
          {
            type: "button",
            onClick: applyCommunityToSelected,
            disabled: busy || !String(bulkCommunityId || "").trim() || selectedRowIndexes.size === 0,
            className: "flex-shrink-0 text-[11px] px-2.5 py-1 rounded-md bg-emerald-500/35 text-emerald-50 border border-emerald-400/50 hover:bg-emerald-500/45 disabled:opacity-40 disabled:cursor-not-allowed transition-colors",
            children: isEs ? `Aplicar comunidad (${selectedRowIndexes.size})` : `Apply community (${selectedRowIndexes.size})`
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex flex-col sm:flex-row gap-1.5 items-stretch sm:items-center", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("label", { className: "flex-1 flex items-center gap-1.5 min-w-0 text-[11px]", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-location-dot text-emerald-300 flex-shrink-0", "aria-hidden": "true" }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            "input",
            {
              type: "text",
              value: bulkLocation,
              onChange: (e2) => setBulkLocation(e2.target.value),
              disabled: busy,
              placeholder: isEs ? "Una direcci\xF3n de recogida para las seleccionadas\u2026" : "One pickup address for selected rows\u2026",
              className: "flex-1 min-w-0 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-100 placeholder:text-slate-400 outline-none focus:border-emerald-500/50",
              "aria-label": isEs ? "Direcci\xF3n compartida" : "Shared pickup address"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          "button",
          {
            type: "button",
            onClick: applyLocationToSelected,
            disabled: busy || !String(bulkLocation || "").trim() || selectedRowIndexes.size === 0,
            className: "flex-shrink-0 text-[11px] px-2.5 py-1 rounded-md bg-emerald-500/35 text-emerald-50 border border-emerald-400/50 hover:bg-emerald-500/45 disabled:opacity-40 disabled:cursor-not-allowed transition-colors",
            children: isEs ? `Aplicar direcci\xF3n (${selectedRowIndexes.size})` : `Apply address (${selectedRowIndexes.size})`
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex flex-col sm:flex-row gap-1.5 items-stretch sm:items-center", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("label", { className: "flex-1 flex items-center gap-1.5 min-w-0 text-[11px]", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-tag text-emerald-300 flex-shrink-0", "aria-hidden": "true" }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
            "select",
            {
              value: bulkCategory,
              onChange: (e2) => setBulkCategory(e2.target.value),
              disabled: busy,
              className: "flex-1 min-w-0 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-100 outline-none focus:border-emerald-500/50",
              "aria-label": isEs ? "Categor\xEDa compartida" : "Shared category",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("option", { value: "", children: isEs ? "Categor\xEDa (opcional)\u2026" : "Category (optional)\u2026" }),
                ["produce", "bakery", "dairy", "pantry", "meat", "prepared", "other"].map((c2) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("option", { value: c2, children: c2 }, c2))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("label", { className: "flex-1 flex items-center gap-1.5 min-w-0 text-[11px]", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-calendar-day text-emerald-300 flex-shrink-0", "aria-hidden": "true" }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            "input",
            {
              type: "date",
              value: bulkExpiry,
              onChange: (e2) => setBulkExpiry(e2.target.value),
              disabled: busy,
              className: "flex-1 min-w-0 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-100 outline-none focus:border-emerald-500/50",
              "aria-label": isEs ? "Caducidad compartida" : "Shared expiry"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          "button",
          {
            type: "button",
            onClick: () => {
              if (String(bulkCategory || "").trim()) applyCategoryToSelected();
              if (String(bulkExpiry || "").trim()) applyExpiryToSelected();
            },
            disabled: busy || selectedRowIndexes.size === 0 || !String(bulkCategory || "").trim() && !String(bulkExpiry || "").trim(),
            className: "flex-shrink-0 text-[11px] px-2.5 py-1 rounded-md bg-emerald-500/35 text-emerald-50 border border-emerald-400/50 hover:bg-emerald-500/45 disabled:opacity-40 disabled:cursor-not-allowed transition-colors",
            children: isEs ? "Aplicar" : "Apply"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        "button",
        {
          type: "button",
          onClick: applyAllMissingToSelected,
          disabled: busy || selectedRowIndexes.size === 0 || !String(bulkLocation || "").trim() && !String(bulkCommunityId || "").trim() && !String(bulkCategory || "").trim() && !String(bulkExpiry || "").trim(),
          className: "w-full text-[11px] px-2.5 py-1.5 rounded-md bg-cyan-500/25 text-cyan-50 border border-cyan-400/40 hover:bg-cyan-500/35 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium",
          children: fillEmptyOnly ? isEs ? `Aplicar todo a campos vac\xEDos (${selectedRowIndexes.size} filas)` : `Apply all to empty fields (${selectedRowIndexes.size} rows)` : isEs ? `Aplicar todo a seleccionadas (${selectedRowIndexes.size})` : `Apply all to selected (${selectedRowIndexes.size})`
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: `space-y-1.5 overflow-y-auto nourish-scrollbar pr-1 ${isCsv ? "max-h-64" : "max-h-44"}`, children: [
      previewRows.map((row, idx) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "rounded-lg border border-slate-700/60 bg-slate-800/40 p-2 flex items-start gap-2", children: [
        isCsv && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          "input",
          {
            type: "checkbox",
            checked: selectedRowIndexes.has(idx),
            onChange: () => toggleRowSelected(idx),
            disabled: busy,
            className: "mt-1 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500/40 flex-shrink-0",
            "aria-label": isEs ? `Seleccionar fila ${idx + 1}` : `Select row ${idx + 1}`
          }
        ),
        row.image_url && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          "img",
          {
            src: row.image_url,
            alt: row.title || "food",
            className: "w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-slate-600/50",
            onError: (e2) => {
              e2.target.style.display = "none";
            }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              "input",
              {
                type: "text",
                value: row.title || "",
                onChange: (e2) => onUpdateRow(idx, { title: e2.target.value }),
                disabled: busy,
                className: "flex-1 min-w-0 bg-transparent text-sm text-slate-100 font-medium outline-none focus:bg-slate-900/60 px-1.5 py-0.5 rounded",
                "aria-label": `Row ${idx + 1} title`
              }
            ),
            filledByIndex.has(idx) && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
              "span",
              {
                className: "text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-cyan-500/25 text-cyan-50 border border-cyan-400/40 whitespace-nowrap",
                title: `${isEs ? "IA rellen\xF3" : "AI filled"}: ${filledByIndex.get(idx).join(", ")}`,
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-wand-magic-sparkles mr-0.5", "aria-hidden": "true" }),
                  "AI +",
                  filledByIndex.get(idx).length
                ]
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-300", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              "input",
              {
                type: "number",
                step: "0.1",
                min: "0",
                value: row.quantity ?? "",
                onChange: (e2) => onUpdateRow(idx, { quantity: Number(e2.target.value) }),
                disabled: busy,
                className: "w-16 bg-transparent outline-none focus:bg-slate-900/60 px-1 py-0.5 rounded text-slate-100",
                "aria-label": "Quantity"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              "input",
              {
                type: "text",
                value: row.unit || "",
                onChange: (e2) => onUpdateRow(idx, { unit: e2.target.value }),
                disabled: busy,
                className: "w-16 bg-transparent outline-none focus:bg-slate-900/60 px-1 py-0.5 rounded text-slate-100",
                "aria-label": "Unit"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "text-slate-300", children: "\xB7" }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              "select",
              {
                value: row.category || "other",
                onChange: (e2) => onUpdateRow(idx, { category: e2.target.value }),
                disabled: busy,
                className: "bg-slate-900 border border-slate-600 rounded px-1 py-0.5 text-slate-100",
                "aria-label": "Category",
                children: ["produce", "bakery", "dairy", "pantry", "meat", "prepared", "other"].map((c2) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("option", { value: c2, children: c2 }, c2))
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "mt-1 grid grid-cols-1 sm:grid-cols-3 gap-1 text-[11px]", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("label", { className: "flex items-center gap-1 min-w-0", children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-location-dot text-slate-400 flex-shrink-0", "aria-hidden": "true" }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                "input",
                {
                  type: "text",
                  value: row.location || "",
                  onChange: (e2) => onUpdateRow(idx, { location: e2.target.value }),
                  disabled: busy,
                  placeholder: isEs ? "Direcci\xF3n de recogida" : "Pickup address",
                  className: "flex-1 min-w-0 bg-transparent outline-none focus:bg-slate-900/60 px-1 py-0.5 rounded text-slate-100 placeholder:text-slate-400",
                  "aria-label": isEs ? "Direcci\xF3n de recogida" : "Pickup address"
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("label", { className: "flex items-center gap-1 min-w-0", children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-calendar-day text-slate-400 flex-shrink-0", "aria-hidden": "true" }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                "input",
                {
                  type: "date",
                  value: row.expiry_date || "",
                  onChange: (e2) => onUpdateRow(idx, { expiry_date: e2.target.value }),
                  disabled: busy,
                  className: "flex-1 min-w-0 bg-transparent outline-none focus:bg-slate-900/60 px-1 py-0.5 rounded text-slate-100",
                  "aria-label": isEs ? "Fecha de caducidad" : "Expiry date"
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("label", { className: "flex items-center gap-1 min-w-0", children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-people-group text-slate-400 flex-shrink-0", "aria-hidden": "true" }),
              communities.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                "select",
                {
                  value: row.community_id || "",
                  onChange: (e2) => {
                    const id = e2.target.value || "";
                    const match = communities.find((c2) => String(c2.id) === String(id));
                    onUpdateRow(idx, {
                      community_id: id || void 0,
                      community_name: match?.name
                    });
                  },
                  disabled: busy,
                  className: `flex-1 min-w-0 bg-slate-900 border rounded px-1 py-0.5 text-slate-100 ${row.community_id ? "border-slate-600" : "border-amber-400"}`,
                  "aria-label": isEs ? "Comunidad / escuela" : "Community / school",
                  required: true,
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("option", { value: "", children: isEs ? "Elige escuela o comunidad\u2026" : "Choose school or community\u2026" }),
                    communities.map((c2) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("option", { value: c2.id, children: c2.name }, c2.id))
                  ]
                }
              ) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                "input",
                {
                  type: "text",
                  value: row.community_name || "",
                  onChange: (e2) => onUpdateRow(idx, {
                    community_name: e2.target.value || void 0,
                    community_id: void 0
                  }),
                  disabled: busy || communitiesLoading,
                  placeholder: communitiesLoading ? isEs ? "Cargando comunidades\u2026" : "Loading communities\u2026" : isEs ? "Nombre de escuela o comunidad" : "School or community name",
                  className: `flex-1 min-w-0 bg-transparent outline-none focus:bg-slate-900/60 px-1 py-0.5 rounded text-slate-100 placeholder:text-slate-400 ${row.community_name ? "" : "ring-1 ring-amber-400 rounded"}`,
                  "aria-label": isEs ? "Comunidad / escuela" : "Community / school"
                }
              )
            ] })
          ] }),
          communitiesError && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "mt-1 flex items-center gap-2 text-[10px] text-amber-200", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: communitiesError }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              "button",
              {
                type: "button",
                onClick: loadCommunities,
                disabled: busy || communitiesLoading,
                className: "underline hover:text-amber-100 disabled:opacity-40",
                children: isEs ? "Reintentar" : "Retry"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          "button",
          {
            type: "button",
            onClick: () => onRemoveRow(idx),
            disabled: busy,
            className: "text-slate-400 hover:text-rose-300 text-xs p-1 disabled:opacity-40",
            "aria-label": `Remove row ${idx + 1}`,
            title: isEs ? "Quitar" : "Remove",
            children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-times", "aria-hidden": "true" })
          }
        )
      ] }, idx)),
      extra > 0 && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "text-[11px] text-slate-300 italic px-1", children: isEs ? `\u2026y ${extra} m\xE1s` : `\u2026and ${extra} more` })
    ] }),
    pending.parseErrors && pending.parseErrors.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "mt-2 text-[11px] text-amber-200", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-triangle-exclamation mr-1", "aria-hidden": "true" }),
      pending.parseErrors.length,
      " ",
      isEs ? "fila(s) omitida(s)" : "row(s) skipped"
    ] }),
    missingCommunity && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "mt-2 text-[11px] text-amber-200", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-triangle-exclamation mr-1", "aria-hidden": "true" }),
      isEs ? "Elige una escuela o comunidad para cada fila (usa \u201CAplicar comunidad\u201D arriba para todas a la vez)." : "Choose a school or community for each row (use \u201CApply community\u201D above to set them all at once)."
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex items-center gap-2 mt-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        "button",
        {
          type: "button",
          onClick: onCancel,
          disabled: busy,
          className: "text-xs px-3 py-1.5 rounded-full bg-slate-700 text-slate-50 hover:bg-slate-600 border border-slate-700/60 disabled:opacity-40",
          children: isEs ? "Cancelar" : "Cancel"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        "button",
        {
          type: "button",
          onClick: onConfirm,
          disabled: busy || rows.length === 0 || missingCommunity,
          className: `text-xs px-3 py-1.5 rounded-full text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all ml-auto bg-gradient-to-r ${tint === "fuchsia" ? "from-fuchsia-500 to-purple-500 hover:from-fuchsia-400 hover:to-purple-400 shadow-md shadow-fuchsia-500/20" : "from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 shadow-md shadow-emerald-500/20"}`,
          children: busy ? isEs ? "Creando\u2026" : "Creating\u2026" : isEs ? `Crear ${rows.length} publicaci\xF3n${rows.length === 1 ? "" : "es"}` : `Create ${rows.length} listing${rows.length === 1 ? "" : "s"}`
        }
      )
    ] })
  ] });
}
function AIChatPanel() {
  const {
    messages,
    sendMessage,
    sendVoice,
    isLoading,
    error,
    language,
    clearHistory,
    submitFeedback,
    appendLocalMessage,
    sendSilentMessage,
    isAuthenticated,
    setLanguage,
    // Error recovery actions surfaced via Retry / Regenerate buttons in the bubble UI.
    retryMessage,
    regenerateLast,
    historyLoaded,
    tone,
    setTone,
    confirmPendingAction
  } = useAIChat();
  const { applyToolResults, clearAIOverlays } = useMapContext();
  const { registerHandler, executeUIActionsFromToolResults, executeUIAction } = useUIControl();
  const { user: authUser, isAdmin } = useAuthContext() || {};
  const allowedCommunityIds = (0, import_react11.useMemo)(
    () => browseCommunityIdsForUser(authUser, { isAdmin }),
    [authUser?.community_id, isAdmin]
  );
  const communityRole = useCommunityRole();
  const { settings: a11ySettings, guide, syncFromChat, resetGuideSession, cancelVoice, updateSetting } = useNouriGuide();
  const canAttachFiles = communityRole === "donor" || communityRole === "admin";
  const [pendingChatPhotos, setPendingChatPhotos] = (0, import_react11.useState)([]);
  const prevCommunityRoleRef = (0, import_react11.useRef)(null);
  const lastAppliedToolMsgRef = (0, import_react11.useRef)(null);
  const lastSurfacedErrorRef = (0, import_react11.useRef)(null);
  (0, import_react11.useEffect)(() => {
    if (!error || error === lastSurfacedErrorRef.current) return;
    lastSurfacedErrorRef.current = error;
    B.error(
      language === "es" ? `Problema con el asistente: ${error}` : `Assistant error: ${error}`,
      { autoClose: 4e3, position: "top-center" }
    );
  }, [error, language]);
  const lastToastedClaimRef = (0, import_react11.useRef)(null);
  (0, import_react11.useEffect)(() => {
    if (!messages?.length) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant" || !last.toolResults?.length) return;
    if (last.fromHistory) return;
    for (const tr of last.toolResults) {
      const key = `${last.id}-${tr.tool}`;
      if (lastToastedClaimRef.current === key) continue;
      const result = tr.result ?? tr;
      const ok = result?.success || tr.ok;
      if ((tr.tool === "claim_listing" || tr.tool === "claim_food") && ok) {
        lastToastedClaimRef.current = key;
        window.dispatchEvent(new CustomEvent("foodShared"));
      }
      if (tr.tool === "claim_listings" && ok) {
        lastToastedClaimRef.current = key;
        window.dispatchEvent(new CustomEvent("foodShared"));
      }
      if (tr.tool === "cancel_claim" && ok) {
        lastToastedClaimRef.current = key;
        B.info(
          language === "es" ? "Reclamo cancelado." : "Claim released \u2014 item returned to inventory.",
          { autoClose: 4e3, position: "top-center" }
        );
      }
      if ((tr.tool === "create_food_listing" || tr.tool === "post_food_listing") && ok) {
        window.dispatchEvent(new CustomEvent("foodShared"));
      }
      if (ok && ["update_food_listing", "update_listing", "edit_listing", "deactivate_listing", "delete_listing"].includes(tr.tool)) {
        window.dispatchEvent(new CustomEvent("foodShared"));
      }
    }
  }, [messages, language]);
  const MAP_TOOLS2 = (0, import_react11.useMemo)(() => /* @__PURE__ */ new Set([
    "search_food_near_user",
    "search_food_nearby",
    "get_recent_listings",
    "get_community_listings",
    "get_user_listings",
    "get_my_claims",
    "get_mapbox_route",
    "show_route_to_listing",
    "query_distribution_centers",
    "optimize_pickup_route"
  ]), []);
  (0, import_react11.useEffect)(() => {
    if (!messages || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    if (!last.fromHistory) {
      if (Array.isArray(last.toolResults) && last.toolResults.length > 0 && lastAppliedToolMsgRef.current !== last.id) {
        lastAppliedToolMsgRef.current = last.id;
        applyToolResults(last.toolResults);
        const guidedTutorial = /^guided\b|^guiado\b/i.test(String(last.message || "").trim());
        const navCount = guidedTutorial ? 0 : executeUIActionsFromToolResults(last.toolResults);
        if (!guidedTutorial && navCount === 0 && last.action && !last.fromHistory) {
          executeUIAction({ ok: true, ...last.action });
        }
        const wantsRouteUi = !guidedTutorial && last.toolResults.some((tr) => {
          const r3 = tr.result ?? tr;
          const hint = r3?.frontend_hint || tr.frontend_hint;
          return tr.tool === "optimize_pickup_route" || hint?.component === "RouteOptimizer";
        });
        if (wantsRouteUi) {
          executeUIAction({ ok: true, action: "navigate", path: "/dashboard" });
        }
      }
      return;
    }
    for (let i2 = messages.length - 1; i2 >= 0; i2--) {
      const m2 = messages[i2];
      if (m2.role !== "assistant" || !Array.isArray(m2.toolResults)) continue;
      const hasMapTool = m2.toolResults.some((tr) => MAP_TOOLS2.has(tr?.tool));
      if (hasMapTool) {
        if (lastAppliedToolMsgRef.current !== m2.id) {
          lastAppliedToolMsgRef.current = m2.id;
          applyToolResults(m2.toolResults);
        }
        break;
      }
    }
  }, [messages, applyToolResults, executeUIActionsFromToolResults, executeUIAction, MAP_TOOLS2]);
  const [isOpen, setIsOpen] = (0, import_react11.useState)(false);
  const [isExpanded, setIsExpanded] = (0, import_react11.useState)(false);
  const [inputText, setInputText] = (0, import_react11.useState)("");
  const [showMenu, setShowMenu] = (0, import_react11.useState)(false);
  const [suggestionIndex, setSuggestionIndex] = (0, import_react11.useState)(-1);
  const [suggestionsOpen, setSuggestionsOpen] = (0, import_react11.useState)(false);
  const [voiceMode, setVoiceMode] = (0, import_react11.useState)(false);
  const [audioLevel, setAudioLevel] = (0, import_react11.useState)(0);
  const [isVoiceListening, setIsVoiceListening] = (0, import_react11.useState)(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = (0, import_react11.useState)(false);
  const [tapToHear, setTapToHear] = (0, import_react11.useState)(null);
  const [voiceError, setVoiceError] = (0, import_react11.useState)(null);
  const [voiceTranscript, setVoiceTranscript] = (0, import_react11.useState)("");
  const [wakeWordEnabled, setWakeWordEnabled] = (0, import_react11.useState)(false);
  const [wakeActive, setWakeActive] = (0, import_react11.useState)(false);
  const [pendingUpload, setPendingUpload] = (0, import_react11.useState)(null);
  const [uploadBusy, setUploadBusy] = (0, import_react11.useState)(false);
  const uploadSessionRef = (0, import_react11.useRef)(0);
  const photoInputRef = (0, import_react11.useRef)(null);
  const csvInputRef = (0, import_react11.useRef)(null);
  const inlinePhotoInputRef = (0, import_react11.useRef)(null);
  const messagesEndRef = (0, import_react11.useRef)(null);
  const messagesContainerRef = (0, import_react11.useRef)(null);
  const [showScrollPill, setShowScrollPill] = (0, import_react11.useState)(false);
  const wasOpenRef = (0, import_react11.useRef)(false);
  const historyScrollDoneRef = (0, import_react11.useRef)(false);
  const scrollMessagesToEnd = (0, import_react11.useCallback)(() => {
    const run = () => {
      const el = messagesContainerRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }
      setShowScrollPill(false);
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
  }, []);
  const [showAttachMenu, setShowAttachMenu] = (0, import_react11.useState)(false);
  const attachMenuRef = (0, import_react11.useRef)(null);
  (0, import_react11.useEffect)(() => {
    if (!canAttachFiles) setShowAttachMenu(false);
  }, [canAttachFiles]);
  (0, import_react11.useEffect)(() => {
    const role = String(communityRole || "").toLowerCase();
    const prev = prevCommunityRoleRef.current;
    prevCommunityRoleRef.current = role || null;
    if (!prev || !role || prev === role) return;
    if (!["donor", "recipient"].includes(prev) || !["donor", "recipient"].includes(role)) {
      return;
    }
    ;
    (async () => {
      uploadSessionRef.current += 1;
      setPendingUpload(null);
      setPendingChatPhotos((photos) => {
        photos.forEach((p2) => {
          if (p2.previewUrl) URL.revokeObjectURL(p2.previewUrl);
        });
        return [];
      });
      clearAIOverlays();
      resetGuideSession();
      try {
        await clearHistory();
      } catch (_2) {
      }
      B.info(
        language === "es" ? `Rol actualizado a ${role}. Empezamos un chat limpio.` : `Role updated to ${role}. Starting a fresh chat.`,
        { autoClose: 3500, position: "top-center" }
      );
    })();
  }, [communityRole, clearHistory, clearAIOverlays, language, resetGuideSession]);
  const inputRef = (0, import_react11.useRef)(null);
  const panelRef = (0, import_react11.useRef)(null);
  const previousFocusRef = (0, import_react11.useRef)(null);
  const currentAudioRef = (0, import_react11.useRef)(null);
  const lastSpokenIdRef = (0, import_react11.useRef)(null);
  const voiceModeRef = (0, import_react11.useRef)(false);
  const sendVoiceRef = (0, import_react11.useRef)(sendVoice);
  const mediaStreamRef = (0, import_react11.useRef)(null);
  const mediaRecorderRef = (0, import_react11.useRef)(null);
  const audioChunksRef = (0, import_react11.useRef)([]);
  const analyserRef = (0, import_react11.useRef)(null);
  const silenceTimerRef = (0, import_react11.useRef)(null);
  const vadFrameRef = (0, import_react11.useRef)(null);
  const wakeRecognitionRef = (0, import_react11.useRef)(null);
  const wakeWordEnabledRef = (0, import_react11.useRef)(false);
  const handsFreeRef = (0, import_react11.useRef)(false);
  const wakeCooldownRef = (0, import_react11.useRef)(0);
  const isVoiceSpeakingRef = (0, import_react11.useRef)(false);
  const startWakeListeningRef = (0, import_react11.useRef)(null);
  const triggerWakeRef = (0, import_react11.useRef)(null);
  const endHandsFreeTurnRef = (0, import_react11.useRef)(null);
  const prevSpeakingRef = (0, import_react11.useRef)(false);
  const wakeWordSupported = typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  (0, import_react11.useEffect)(() => {
    sendVoiceRef.current = sendVoice;
  }, [sendVoice]);
  const closeAssistant = (0, import_react11.useCallback)(() => {
    setIsOpen(false);
    setIsExpanded(false);
    setShowMenu(false);
    setShowAttachMenu(false);
    setSuggestionsOpen(false);
    setSuggestionIndex(-1);
  }, []);
  (0, import_react11.useEffect)(() => {
    const u1 = registerHandler("setAssistantOpen", (open) => {
      if (open) setIsOpen(true);
      else closeAssistant();
    });
    const u2 = registerHandler("setAssistantExpanded", (exp) => setIsExpanded(!!exp));
    const u3 = registerHandler("clearMapOverlays", () => clearAIOverlays());
    const u4 = registerHandler("setLanguage", (lang) => {
      if (CHAT_UI_LANGUAGES.includes(chatLang(lang))) setLanguage(chatLang(lang));
    });
    return () => {
      u1();
      u2();
      u3();
      u4();
    };
  }, [registerHandler, clearAIOverlays, setLanguage, closeAssistant]);
  (0, import_react11.useEffect)(() => {
    const onOpenChat = (event) => {
      setIsOpen(true);
      const msg = event?.detail?.message;
      if (msg && typeof msg === "string") {
        setInputText(msg);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    };
    window.addEventListener("nouri:open-chat", onOpenChat);
    return () => window.removeEventListener("nouri:open-chat", onOpenChat);
  }, []);
  (0, import_react11.useEffect)(() => {
    if (!isOpen) return void 0;
    previousFocusRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      const prev = previousFocusRef.current;
      if (prev && typeof prev.focus === "function") {
        requestAnimationFrame(() => {
          try {
            prev.focus();
          } catch {
          }
        });
      }
      previousFocusRef.current = null;
    };
  }, [isOpen]);
  (0, import_react11.useEffect)(() => {
    if (!isOpen) return void 0;
    const getFocusable = () => {
      if (!panelRef.current) return [];
      return Array.from(panelRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));
    };
    const onKeyDown = (e2) => {
      if (e2.key === "Escape") {
        e2.preventDefault();
        if (showMenu) {
          setShowMenu(false);
          return;
        }
        if (showAttachMenu) {
          setShowAttachMenu(false);
          return;
        }
        if (suggestionsOpen) {
          setSuggestionsOpen(false);
          setSuggestionIndex(-1);
          return;
        }
        closeAssistant();
        return;
      }
      if (e2.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e2.shiftKey) {
        if (document.activeElement === first || !panelRef.current?.contains(document.activeElement)) {
          e2.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last || !panelRef.current?.contains(document.activeElement)) {
        e2.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeAssistant, showMenu, showAttachMenu, suggestionsOpen]);
  const lastAssistantMessage = (0, import_react11.useMemo)(() => {
    for (let i2 = messages.length - 1; i2 >= 0; i2--) {
      if (messages[i2].role === "assistant" && !messages[i2].isError) return messages[i2];
    }
    return null;
  }, [messages]);
  const suggestionPool = getSuggestions(language);
  const filteredSuggestions = (0, import_react11.useMemo)(() => {
    const q2 = inputText.trim().toLowerCase();
    if (!q2) return [];
    const scored = [];
    for (const s2 of suggestionPool) {
      const lower = s2.toLowerCase();
      if (lower === q2) continue;
      const idx = lower.indexOf(q2);
      if (idx !== -1) scored.push({ s: s2, idx });
    }
    scored.sort((a2, b2) => a2.idx - b2.idx || a2.s.length - b2.s.length);
    return scored.slice(0, 6).map((x2) => x2.s);
  }, [inputText, suggestionPool]);
  const showSuggestions = suggestionsOpen && filteredSuggestions.length > 0 && !isLoading;
  (0, import_react11.useEffect)(() => {
    setSuggestionIndex(-1);
  }, [inputText]);
  const acceptSuggestion = (0, import_react11.useCallback)((value) => {
    if (!value) return;
    setInputText(value);
    setSuggestionsOpen(false);
    setSuggestionIndex(-1);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);
  (0, import_react11.useEffect)(() => {
    if (!isOpen) return;
    const el = messagesContainerRef.current;
    if (!el) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
      return;
    }
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
    if (nearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    }
  }, [messages, isOpen, isLoading]);
  (0, import_react11.useEffect)(() => {
    if (isOpen && !wasOpenRef.current) {
      scrollMessagesToEnd();
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, scrollMessagesToEnd]);
  (0, import_react11.useEffect)(() => {
    historyScrollDoneRef.current = false;
  }, [authUser?.id]);
  (0, import_react11.useEffect)(() => {
    if (!historyLoaded || historyScrollDoneRef.current) return;
    historyScrollDoneRef.current = true;
    if (isOpen) {
      scrollMessagesToEnd();
    }
  }, [historyLoaded, isOpen, scrollMessagesToEnd]);
  (0, import_react11.useEffect)(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollPill(distance > 240);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [isOpen, voiceMode]);
  const jumpToLatest = (0, import_react11.useCallback)(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, []);
  (0, import_react11.useEffect)(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);
  const prevLoadingRef = (0, import_react11.useRef)(isLoading);
  (0, import_react11.useEffect)(() => {
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = isLoading;
    if (wasLoading && !isLoading && isOpen && !voiceMode) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isLoading, isOpen, voiceMode]);
  (0, import_react11.useEffect)(() => {
    const handleClickOutside = (e2) => {
      if (showMenu && panelRef.current && !panelRef.current.contains(e2.target)) {
        setShowMenu(false);
      }
      if (showAttachMenu && attachMenuRef.current && !attachMenuRef.current.contains(e2.target)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu, showAttachMenu]);
  const handleSend = (0, import_react11.useCallback)(async (e2) => {
    e2?.preventDefault();
    if (isLoading || uploadBusy) return;
    const text = inputText.trim();
    const photos = pendingChatPhotos;
    if (!text && photos.length === 0) return;
    setSuggestionsOpen(false);
    setSuggestionIndex(-1);
    if (photos.length === 0) {
      sendMessage(text);
      setInputText("");
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    setUploadBusy(true);
    try {
      const urls = [];
      for (const photo of photos) {
        if (photo.url) {
          urls.push(photo.url);
          continue;
        }
        if (!photo.file || !authUser?.id) continue;
        try {
          const res = await aiChatService_default.uploadImage(photo.file, authUser.id);
          if (res?.url) urls.push(res.url);
        } catch (err) {
          console.warn("Chat photo upload failed:", err?.message || err);
        }
      }
      if (urls.length === 0) {
        appendLocalMessage({
          role: "assistant",
          message: language === "es" ? "No pude subir esas fotos. \xBFPuedes intentar de nuevo?" : "I couldn't upload those photos. Please try again.",
          isError: true
        });
        return;
      }
      const imageBlock = urls.map((u2) => `image: ${u2}`).join("\n");
      const payload = text ? `${text}

${imageBlock}` : imageBlock;
      sendMessage(payload);
      setInputText("");
      setPendingChatPhotos((prev) => {
        prev.forEach((p2) => {
          if (p2.previewUrl) URL.revokeObjectURL(p2.previewUrl);
        });
        return [];
      });
    } finally {
      setUploadBusy(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [
    inputText,
    isLoading,
    uploadBusy,
    pendingChatPhotos,
    sendMessage,
    authUser?.id,
    appendLocalMessage,
    language
  ]);
  const removePendingChatPhoto = (0, import_react11.useCallback)((id) => {
    setPendingChatPhotos((prev) => {
      const next = [];
      for (const p2 of prev) {
        if (p2.id === id) {
          if (p2.previewUrl) URL.revokeObjectURL(p2.previewUrl);
        } else {
          next.push(p2);
        }
      }
      return next;
    });
  }, []);
  const handleQuickAction = (0, import_react11.useCallback)((msg) => {
    if (isLoading) return;
    const text = String(msg || "").trim();
    if (!text) return;
    const openForm = /^(open the form|abrir el formulario|open find food|abrir buscar comida|open request food|abrir solicitar comida)$/i.test(text);
    if (openForm) {
      let path = "/share";
      const lower = text.toLowerCase();
      try {
        const lastAsst = [...messages].reverse().find(
          (m2) => m2.role === "assistant" && !m2.isError && m2.id !== "welcome"
        );
        const locPath = typeof window !== "undefined" ? window.location.pathname || "" : "";
        const ctx = `${lastAsst?.message || ""} ${text} ${locPath}`.toLowerCase();
        if (/open find food|abrir buscar|find food|buscar comida|\/find|near-me/.test(lower + ctx) && !/open the form|abrir el formulario|share food|\/share/.test(lower)) {
          path = locPath.includes("near-me") ? "/near-me" : "/find";
        } else if (/open request food|abrir solicitar|request food|\/request/.test(lower + ctx) && !/open the form|share food|\/share/.test(lower)) {
          path = "/request";
        } else if (/(find food|buscar comida|search nearby|near you)/.test(ctx) && !/(share food|\/share|compartir|donate|posting)/.test(ctx)) {
          path = locPath.includes("near-me") ? "/near-me" : "/find";
        } else if (/(request food|solicitar)/.test(ctx) && !/(share food|\/share|compartir|donate|posting)/.test(ctx)) {
          path = "/request";
        }
      } catch {
      }
      try {
        executeUIAction?.({ ok: true, action: "navigate", path });
      } catch {
      }
    }
    sendMessage(text);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [isLoading, sendMessage, executeUIAction, messages]);
  const liveChipIdx = (0, import_react11.useMemo)(() => liveAssistantIndex(messages), [messages]);
  const railChips = (0, import_react11.useMemo)(() => {
    if (isLoading || pendingUpload || voiceMode || pendingChatPhotos.length > 0) return [];
    if (messages.length <= 1) {
      return resolveInputChips([], language, communityRole, { allowLazy: true });
    }
    if (liveChipIdx < 0) return [];
    const lastAssistant = messages[liveChipIdx];
    if (!lastAssistant || lastAssistant.requiresConfirmation) return [];
    const backendSuggestions = Array.isArray(lastAssistant.suggestions) ? lastAssistant.suggestions : [];
    return resolveInputChips(backendSuggestions, language, communityRole, {
      allowLazy: false
    });
  }, [messages, liveChipIdx, isLoading, pendingUpload, voiceMode, language, communityRole, pendingChatPhotos.length]);
  const requireAuthForUpload = (0, import_react11.useCallback)(() => {
    if (authUser?.id) return true;
    appendLocalMessage({
      role: "assistant",
      message: language === "es" ? "Inicia sesi\xF3n para subir fotos o CSV \u2014 necesito identificarte para crear publicaciones a tu nombre." : "Sign in to upload photos or CSVs \u2014 I need to identify you to post listings on your behalf.",
      isError: true
    });
    return false;
  }, [appendLocalMessage, authUser?.id, language]);
  const triggerPhotoUpload = (0, import_react11.useCallback)(() => {
    if (uploadBusy || isLoading) return;
    if (!requireAuthForUpload()) return;
    photoInputRef.current?.click();
  }, [uploadBusy, isLoading, requireAuthForUpload]);
  const triggerCsvUpload = (0, import_react11.useCallback)(() => {
    if (uploadBusy || isLoading) return;
    if (!requireAuthForUpload()) return;
    csvInputRef.current?.click();
  }, [uploadBusy, isLoading, requireAuthForUpload]);
  const triggerInlinePhotoUpload = (0, import_react11.useCallback)(() => {
    if (uploadBusy || isLoading) return;
    if (!requireAuthForUpload()) return;
    inlinePhotoInputRef.current?.click();
  }, [uploadBusy, isLoading, requireAuthForUpload]);
  const handleInlinePhotoSelected = (0, import_react11.useCallback)(async (e2) => {
    const files = Array.from(e2.target.files || []);
    e2.target.value = "";
    if (!files.length) return;
    const ALLOWED_IMAGE_TYPES = /* @__PURE__ */ new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
    const accepted = [];
    let rejectedType = false;
    let rejectedSize = false;
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        rejectedType = true;
        continue;
      }
      if (file.size > 8 * 1024 * 1024) {
        rejectedSize = true;
        continue;
      }
      accepted.push({
        id: `chat-photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name
      });
    }
    if (rejectedType) {
      appendLocalMessage({
        role: "assistant",
        message: language === "es" ? "Solo se admiten im\xE1genes JPG, PNG, WEBP o GIF." : "Only JPG, PNG, WEBP, or GIF images are supported.",
        isError: true
      });
    }
    if (rejectedSize) {
      appendLocalMessage({
        role: "assistant",
        message: language === "es" ? "Una o m\xE1s im\xE1genes son demasiado grandes (m\xE1x 8 MB)." : "One or more images are too large (max 8 MB).",
        isError: true
      });
    }
    if (!accepted.length) return;
    setPendingChatPhotos((prev) => [...prev, ...accepted].slice(0, 8));
  }, [appendLocalMessage, language]);
  const cancelPendingUpload = (0, import_react11.useCallback)(() => {
    if (uploadBusy) return;
    uploadSessionRef.current += 1;
    setPendingUpload(null);
  }, [uploadBusy]);
  const handleClearConversation = (0, import_react11.useCallback)(async () => {
    setShowMenu(false);
    cancelPendingUpload();
    setPendingChatPhotos((prev) => {
      prev.forEach((p2) => {
        if (p2.previewUrl) URL.revokeObjectURL(p2.previewUrl);
      });
      return [];
    });
    clearAIOverlays();
    resetGuideSession();
    historyScrollDoneRef.current = false;
    lastSpokenIdRef.current = null;
    lastToastedClaimRef.current = null;
    lastAppliedToolMsgRef.current = null;
    lastSurfacedErrorRef.current = null;
    setShowScrollPill(false);
    setInputText("");
    setSuggestionsOpen(false);
    setSuggestionIndex(-1);
    try {
      await clearHistory();
    } catch (err) {
      B.error(
        language === "es" ? `No se pudo borrar el historial: ${err?.message || "error"}` : `Could not clear history: ${err?.message || "error"}`,
        { autoClose: 4e3, position: "top-center" }
      );
      return;
    }
    scrollMessagesToEnd();
  }, [cancelPendingUpload, clearAIOverlays, clearHistory, language, resetGuideSession, scrollMessagesToEnd]);
  const handlePhotoSelected = (0, import_react11.useCallback)(async (e2) => {
    const file = e2.target.files?.[0];
    e2.target.value = "";
    if (!file) return;
    const ALLOWED_IMAGE_TYPES = /* @__PURE__ */ new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      const msg = language === "es" ? "Solo se admiten im\xE1genes JPG, PNG, WEBP o GIF." : "Only JPG, PNG, WEBP, or GIF images are supported.";
      setPendingUpload({ kind: "photo", error: msg, filename: file.name });
      appendLocalMessage({ role: "assistant", message: msg, isError: true });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      const msg = language === "es" ? "La imagen es demasiado grande (m\xE1x 8 MB)." : "Image too large (max 8 MB).";
      setPendingUpload({ kind: "photo", error: msg, filename: file.name });
      appendLocalMessage({ role: "assistant", message: msg, isError: true });
      return;
    }
    appendLocalMessage({
      role: "user",
      message: `\u{1F4F7} ${language === "es" ? "Foto subida" : "Photo uploaded"}: ${file.name}`
    });
    uploadSessionRef.current += 1;
    const sessionId = uploadSessionRef.current;
    setUploadBusy(true);
    setPendingUpload({ kind: "photo", rows: [], filename: file.name, analyzing: true });
    try {
      let uploadFile = file;
      try {
        const { compressImage } = await import("../../utils/compressImage.js");
        uploadFile = await compressImage(file);
      } catch (err) {
        console.warn("Photo compress skipped:", err?.message || err);
      }
      const uploadPromise = (async () => {
        if (!authUser?.id) return null;
        const res = await aiChatService_default.uploadImage(uploadFile, authUser.id);
        return res?.url || null;
      })();
      const { draft, confidence } = await aiChatService_default.visionListing(uploadFile, { userId: authUser?.id });
      if (sessionId !== uploadSessionRef.current) return;
      if (!draft?.title) {
        setPendingUpload({
          kind: "photo",
          error: language === "es" ? "No detect\xE9 un alimento en la foto. Prueba con otra imagen." : "I couldn't detect a food item in that photo. Try another image.",
          filename: file.name
        });
        appendLocalMessage({
          role: "assistant",
          message: language === "es" ? "No pude identificar comida en esa foto. \xBFQuieres intentar con otra?" : "I couldn't identify a food item in that photo. Want to try another?"
        });
        return;
      }
      const uploadedUrl = await uploadPromise;
      if (sessionId !== uploadSessionRef.current) return;
      if (!uploadedUrl) {
        const msg = language === "es" ? "No pude subir la foto. Inicia sesi\xF3n e int\xE9ntalo de nuevo." : "I couldn't upload that photo. Please sign in and try again.";
        setPendingUpload({ kind: "photo", error: msg, filename: file.name });
        appendLocalMessage({ role: "assistant", message: msg, isError: true });
        B.error(msg, { autoClose: 4e3, position: "top-center" });
        return;
      }
      const enrichedDraft = {
        ...draft,
        image_url: uploadedUrl,
        // Carry profile community when vision did not set one so the
        // school selector is not stuck on Do Good Warehouse by accident.
        community_id: draft.community_id || authUser?.community_id || void 0,
        location: draft.location || authUser?.address || void 0
      };
      const row = visionDraftToRow(enrichedDraft) || enrichedDraft;
      setPendingUpload({ kind: "photo", rows: [row], filename: file.name, confidence });
      appendLocalMessage({
        role: "assistant",
        message: language === "es" ? `Detect\xE9: ${draft.title} (${draft.quantity} ${draft.unit}, ${draft.category}). Elige la escuela/comunidad abajo, revisa el borrador y confirma para publicar.` : `I detected: ${draft.title} (${draft.quantity} ${draft.unit}, ${draft.category}). Pick the school/community below, review the draft, and confirm to publish.`
      });
    } catch (err) {
      if (sessionId !== uploadSessionRef.current) return;
      const msg = err?.message || (language === "es" ? "Fall\xF3 el an\xE1lisis de la imagen." : "Vision request failed.");
      setPendingUpload({ kind: "photo", error: msg, filename: file.name });
      appendLocalMessage({
        role: "assistant",
        message: language === "es" ? `No pude analizar la foto: ${msg}` : `I couldn't analyze that photo: ${msg}`,
        isError: true
      });
    } finally {
      if (sessionId === uploadSessionRef.current) setUploadBusy(false);
    }
  }, [appendLocalMessage, authUser?.id, authUser?.community_id, authUser?.address, language]);
  const handleCsvSelected = (0, import_react11.useCallback)(async (e2) => {
    const file = e2.target.files?.[0];
    e2.target.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setPendingUpload({ kind: "csv", error: language === "es" ? "El archivo CSV es demasiado grande (m\xE1x 2 MB)." : "CSV too large (max 2 MB).", filename: file.name });
      appendLocalMessage({
        role: "assistant",
        message: language === "es" ? "El archivo CSV es demasiado grande (m\xE1x 2 MB)." : "CSV file is too large (max 2 MB).",
        isError: true
      });
      return;
    }
    appendLocalMessage({
      role: "user",
      message: `\u{1F4CA} ${language === "es" ? "CSV subido" : "CSV uploaded"}: ${file.name}`
    });
    uploadSessionRef.current += 1;
    const sessionId = uploadSessionRef.current;
    const isStale = () => sessionId !== uploadSessionRef.current;
    setUploadBusy(true);
    try {
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
      });
      if (isStale()) return;
      const { rows, errors } = parseListingsCsv(text);
      if (rows.length === 0) {
        const errMsg = errors[0] || (language === "es" ? "El CSV no tiene filas v\xE1lidas." : "CSV had no valid rows.");
        setPendingUpload({ kind: "csv", error: errMsg, filename: file.name, parseErrors: errors });
        appendLocalMessage({
          role: "assistant",
          message: language === "es" ? `No pude analizar ese CSV: ${errMsg}` : `I couldn't parse that CSV: ${errMsg}`,
          isError: true
        });
        return;
      }
      const rowsWithImages = assignImagestoRows(rows.slice(0, 100));
      setPendingUpload({ kind: "csv", rows: rowsWithImages, filename: file.name, parseErrors: errors });
      appendLocalMessage({
        role: "assistant",
        message: language === "es" ? `Le\xED **${rows.length}** publicaciones del CSV${errors.length ? ` (${errors.length} filas omitidas)` : ""}. Dame un momento \u2014 la IA est\xE1 rellenando huecos\u2026` : `I parsed **${rows.length}** listings from your CSV${errors.length ? ` (${errors.length} rows skipped)` : ""}. Give me a sec \u2014 the AI is filling in gaps\u2026`
      });
      if (authUser?.id) {
        setPendingUpload((prev) => prev ? { ...prev, enriching: true } : prev);
        try {
          const enrichment = await aiChatService_default.enrichListings(rowsWithImages.slice(0, 100), {
            userId: authUser.id,
            language
          });
          if (isStale()) return;
          if (enrichment?.rows?.length) {
            const enrichedWithImages = assignImagestoRows(enrichment.rows);
            setPendingUpload((prev) => {
              if (!prev || prev.kind !== "csv") return prev;
              return {
                ...prev,
                rows: enrichedWithImages,
                enriching: false,
                enriched: true,
                filledLog: enrichment.filled || [],
                enrichSummary: enrichment.summary || ""
              };
            });
            const filledCount = (enrichment.filled || []).length;
            const summary = enrichment.summary || (language === "es" ? filledCount ? `Rellen\xE9 huecos en ${filledCount} fila(s).` : "Tus filas se ven completas \u2014 sin huecos que rellenar." : filledCount ? `Filled gaps on ${filledCount} row(s).` : "Your rows look complete \u2014 no gaps to fill.");
            appendLocalMessage({
              role: "assistant",
              message: language === "es" ? `\u{1FA84} ${summary} **Revisa la vista previa y confirma** para crear las publicaciones, o cancela.` : `\u{1FA84} ${summary} **Review the preview and confirm** to create the listings, or cancel.`
            });
          } else {
            setPendingUpload((prev) => prev ? { ...prev, enriching: false } : prev);
            appendLocalMessage({
              role: "assistant",
              message: language === "es" ? "Revisa la vista previa abajo y confirma para crear las publicaciones." : "Review the preview below and confirm to create the listings."
            });
          }
        } catch {
          if (isStale()) return;
          setPendingUpload((prev) => prev ? { ...prev, enriching: false } : prev);
          appendLocalMessage({
            role: "assistant",
            message: language === "es" ? "No pude rellenar huecos autom\xE1ticamente, pero puedes confirmar como est\xE1n." : "I couldn't auto-fill gaps, but you can confirm as-is."
          });
        }
      } else {
        appendLocalMessage({
          role: "assistant",
          message: language === "es" ? "Revisa la vista previa abajo y confirma para crear las publicaciones." : "Review the preview below and confirm to create the listings."
        });
      }
    } catch (err) {
      if (isStale()) return;
      const msg = err?.message || (language === "es" ? "No pude leer el archivo." : "Could not read CSV file.");
      setPendingUpload({ kind: "csv", error: msg, filename: file.name });
      appendLocalMessage({
        role: "assistant",
        message: language === "es" ? `Error leyendo CSV: ${msg}` : `Error reading CSV: ${msg}`,
        isError: true
      });
    } finally {
      if (!isStale()) setUploadBusy(false);
    }
  }, [appendLocalMessage, language, authUser?.id]);
  const confirmBulkCreate = (0, import_react11.useCallback)(async () => {
    if (!pendingUpload?.rows?.length || uploadBusy) return;
    if (!authUser?.id) {
      appendLocalMessage({
        role: "assistant",
        message: language === "es" ? "Necesitas iniciar sesi\xF3n para publicar." : "You need to sign in to publish listings.",
        isError: true
      });
      return;
    }
    const missingSchool = pendingUpload.rows.some(
      (r3) => !r3?.community_id && !String(r3?.community_name || "").trim()
    );
    if (missingSchool) {
      B.error(
        language === "es" ? "Elige una escuela o comunidad para cada publicaci\xF3n." : "Choose a school or community for each listing.",
        { position: "top-center" }
      );
      return;
    }
    setUploadBusy(true);
    try {
      const rowsToCreate = pendingUpload.rows.map((r3) => {
        const cleaned = sanitizeListingExpiry(r3);
        return {
          ...cleaned,
          community_id: cleaned.community_id != null ? String(cleaned.community_id) : void 0,
          community_name: cleaned.community_name || void 0
        };
      });
      const result = await aiChatService_default.bulkCreateListings(rowsToCreate, { userId: authUser.id });
      const { created, failed, ids, awaitingApproval } = result;
      B.success(
        language === "es" ? awaitingApproval ? `\u2705 ${created} publicaci\xF3n${created === 1 ? "" : "es"} enviada${created === 1 ? "" : "s"} para aprobaci\xF3n del admin${failed ? ` (${failed} fallaron)` : ""}` : `\u2705 ${created} publicaci\xF3n${created === 1 ? "" : "es"} creada${created === 1 ? "" : "s"} correctamente${failed ? ` (${failed} fallaron)` : ""}` : awaitingApproval ? `\u2705 ${created} listing${created === 1 ? "" : "s"} submitted for admin approval${failed ? ` \u2014 ${failed} failed` : ""}` : `\u2705 ${created} listing${created === 1 ? "" : "s"} created successfully${failed ? ` \u2014 ${failed} failed` : ""}`,
        { autoClose: 5e3, position: "top-center" }
      );
      setPendingUpload(null);
      window.dispatchEvent(new CustomEvent("foodShared"));
      const isEs = language === "es";
      const itemNames = rowsToCreate.slice(0, 5).map((r3) => {
        const school = r3.community_name || `community #${r3.community_id}`;
        return `${r3.title} (${r3.quantity} ${r3.unit}, ${r3.category}, under ${school})`;
      }).join("; ");
      const moreItemsCount = rowsToCreate.length - 5;
      const moreItems = moreItemsCount > 0 ? isEs ? ` y ${moreItemsCount} m\xE1s` : ` and ${moreItemsCount} more` : "";
      const failNote = failed ? isEs ? ` (${failed} no se pudieron guardar)` : ` (${failed} could not be saved)` : "";
      const kindLabel = pendingUpload.kind === "photo" ? isEs ? "foto" : "photo upload" : isEs ? "importaci\xF3n CSV" : "bulk CSV upload";
      const idList = Array.isArray(ids) && ids.length ? ids.slice(0, 8).join(", ") : "";
      const approvalNote = awaitingApproval ? isEs ? " Estado: pendiente de aprobaci\xF3n del admin \u2014 NO digas que ya est\xE1n en Find Food hasta que un admin apruebe." : " Status: pending admin approval \u2014 do NOT say they are live on Find Food until an admin approves." : "";
      const prompt = isEs ? `[Acci\xF3n ya completada por el sistema] El sistema acaba de guardar ${created} publicaci\xF3n${created === 1 ? "" : "es"} de comida en la base de datos mediante ${kindLabel}${failNote}. Art\xEDculos: ${itemNames}${moreItems}.${idList ? ` IDs: ${idList}.` : ""}${approvalNote} NO llames a post_food_listing / create_food_listing / bulk_post_food_listings / bulk_import_listings \u2014 YA est\xE1n guardadas. Si el usuario pide cambiar la comunidad/escuela, cantidad, t\xEDtulo o direcci\xF3n, usa update_food_listing con listing_id. Si pregunta por SUS publicaciones, usa get_user_listings (search_food_near_user oculta las propias). Solo responde en espa\xF1ol: felic\xEDtame brevemente y ofrece 2-3 pr\xF3ximos pasos (cambiar comunidad, ver mis publicaciones pendientes, compartir m\xE1s).` : `[Action already completed by the system] The system just saved ${created} food listing${created === 1 ? "" : "s"} to the database via ${kindLabel}${failNote}. Items: ${itemNames}${moreItems}.${idList ? ` Listing IDs: ${idList}.` : ""}${approvalNote} DO NOT call post_food_listing, create_food_listing, bulk_post_food_listings, or bulk_import_listings \u2014 they are ALREADY saved. If the user wants to change community/school, quantity, title, or address, call update_food_listing with listing_id. If they ask about THEIR listings, call get_user_listings (search_food_near_user hides the donor's own posts). Reply with a brief congratulations and 2\u20133 next steps (change community, review my pending listings, share more).`;
      sendSilentMessage(prompt);
    } catch (err) {
      const msg = err?.message || (language === "es" ? "Fall\xF3 la creaci\xF3n." : "Bulk create failed.");
      appendLocalMessage({
        role: "assistant",
        message: language === "es" ? `No pude crear las publicaciones: ${msg}` : `I couldn't create those listings: ${msg}`,
        isError: true
      });
    } finally {
      setUploadBusy(false);
    }
  }, [pendingUpload, uploadBusy, authUser?.id, appendLocalMessage, sendSilentMessage, language]);
  const updatePendingRow = (0, import_react11.useCallback)((idx, patch) => {
    setPendingUpload((prev) => {
      if (!prev?.rows) return prev;
      const rows = prev.rows.map((r3, i2) => i2 === idx ? { ...r3, ...patch } : r3);
      return { ...prev, rows };
    });
  }, []);
  const updatePendingRows = (0, import_react11.useCallback)((indices, patch) => {
    const indexSet = new Set(Array.isArray(indices) ? indices : []);
    if (!indexSet.size || !patch || typeof patch !== "object") return;
    setPendingUpload((prev) => {
      if (!prev?.rows) return prev;
      const rows = prev.rows.map((r3, i2) => indexSet.has(i2) ? { ...r3, ...patch } : r3);
      return { ...prev, rows };
    });
  }, []);
  const removePendingRow = (0, import_react11.useCallback)((idx) => {
    setPendingUpload((prev) => {
      if (!prev?.rows) return prev;
      const rows = prev.rows.filter((_2, i2) => i2 !== idx);
      if (rows.length === 0) return null;
      return { ...prev, rows };
    });
  }, []);
  const stopRecording = (0, import_react11.useCallback)(() => {
    if (vadFrameRef.current) {
      cancelAnimationFrame(vadFrameRef.current);
      vadFrameRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);
  const startVoiceListening = (0, import_react11.useCallback)(async () => {
    setVoiceError(null);
    setVoiceTranscript("");
    audioChunksRef.current = [];
    try {
      if (!mediaStreamRef.current || !mediaStreamRef.current.active) {
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      const stream = mediaStreamRef.current;
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      analyserRef.current = analyser;
      const recorder = createMediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e2) => {
        if (e2.data.size > 0) audioChunksRef.current.push(e2.data);
      };
      recorder.onstop = async () => {
        if (vadFrameRef.current) {
          cancelAnimationFrame(vadFrameRef.current);
          vadFrameRef.current = null;
        }
        source.disconnect();
        audioCtx.close().catch(() => {
        });
        setAudioLevel(0);
        const chunks = audioChunksRef.current;
        if (!chunks.length) {
          setIsVoiceListening(false);
          if (handsFreeRef.current) endHandsFreeTurnRef.current?.();
          return;
        }
        const audioBlob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        if (audioBlob.size < 1500) {
          setIsVoiceListening(false);
          if (handsFreeRef.current) endHandsFreeTurnRef.current?.();
          return;
        }
        setIsVoiceListening(false);
        setVoiceTranscript(language === "es" ? "Procesando audio..." : "Processing audio...");
        try {
          await sendVoiceRef.current(audioBlob);
          setVoiceTranscript("");
        } catch (err) {
          console.error("[Voice] Backend voice processing failed:", err);
          setVoiceError(language === "es" ? "Error de voz" : "Voice processing failed");
          setVoiceTranscript("");
          if (handsFreeRef.current) endHandsFreeTurnRef.current?.();
        }
      };
      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsVoiceListening(true);
      let speechDetected = false;
      let silenceStart = 0;
      const SILENCE_THRESHOLD = 12;
      const SILENCE_DURATION = 2200;
      const MAX_DURATION = 3e4;
      const NO_SPEECH_TIMEOUT = 9e3;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const startTime = Date.now();
      const checkAudio = () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording") return;
        if (Date.now() - startTime > MAX_DURATION) {
          stopRecording();
          return;
        }
        if (!speechDetected && Date.now() - startTime > NO_SPEECH_TIMEOUT) {
          stopRecording();
          return;
        }
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i2 = 0; i2 < dataArray.length; i2++) sum += dataArray[i2];
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(1, avg / 80));
        if (avg > SILENCE_THRESHOLD) {
          speechDetected = true;
          silenceStart = 0;
        } else if (speechDetected) {
          if (!silenceStart) silenceStart = Date.now();
          if (Date.now() - silenceStart > SILENCE_DURATION) {
            stopRecording();
            return;
          }
        }
        vadFrameRef.current = requestAnimationFrame(checkAudio);
      };
      vadFrameRef.current = requestAnimationFrame(checkAudio);
    } catch (err) {
      console.error("[Voice] Mic access failed:", err);
      setIsVoiceListening(false);
      setVoiceError(
        err.name === "NotAllowedError" ? language === "es" ? "Permiso de micr\xF3fono denegado" : "Microphone permission denied" : language === "es" ? "No se pudo acceder al micr\xF3fono" : "Could not access microphone"
      );
    }
  }, [language, stopRecording]);
  const enterVoiceMode = (0, import_react11.useCallback)(() => {
    setVoiceMode(true);
    voiceModeRef.current = true;
  }, []);
  const exitVoiceMode = (0, import_react11.useCallback)(() => {
    setVoiceMode(false);
    voiceModeRef.current = false;
    setIsVoiceSpeaking(false);
    setIsVoiceListening(false);
    setVoiceError(null);
    setVoiceTranscript("");
    setTapToHear(null);
    setAudioLevel(0);
    stopRecording();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t3) => t3.stop());
      mediaStreamRef.current = null;
    }
    if (currentAudioRef.current) {
      currentAudioRef.current();
      currentAudioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [stopRecording]);
  const interruptSpeaking = (0, import_react11.useCallback)(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current();
      currentAudioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsVoiceSpeaking(false);
    setTapToHear(null);
  }, []);
  const handleOrbTap = (0, import_react11.useCallback)(() => {
    if (isVoiceSpeaking) {
      interruptSpeaking();
    } else if (isVoiceListening) {
      stopRecording();
    } else if (!isLoading) {
      startVoiceListening();
    }
  }, [isVoiceSpeaking, isVoiceListening, isLoading, interruptSpeaking, stopRecording, startVoiceListening]);
  (0, import_react11.useEffect)(() => {
    isVoiceSpeakingRef.current = isVoiceSpeaking;
  }, [isVoiceSpeaking]);
  const stopWakeListening = (0, import_react11.useCallback)(() => {
    setWakeActive(false);
    const rec = wakeRecognitionRef.current;
    wakeRecognitionRef.current = null;
    if (rec) {
      try {
        rec.onend = null;
        rec.onerror = null;
        rec.onresult = null;
        rec.stop();
      } catch {
      }
    }
  }, []);
  const startWakeListening = (0, import_react11.useCallback)(() => {
    if (!wakeWordEnabledRef.current) return;
    if (wakeRecognitionRef.current) return;
    if (voiceModeRef.current || handsFreeRef.current) return;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    let rec;
    try {
      rec = new SR();
    } catch {
      return;
    }
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = language === "es" ? "es-ES" : "en-US";
    rec.onresult = (event) => {
      for (let i2 = event.resultIndex; i2 < event.results.length; i2++) {
        const res = event.results[i2];
        if (!res.isFinal) continue;
        const transcript = (res[0]?.transcript || "").toLowerCase();
        if (/\b(nouri|nourie|nouree|noori|noury|nuri)\b/.test(transcript)) {
          try {
            rec.onend = null;
            rec.stop();
          } catch {
          }
          wakeRecognitionRef.current = null;
          setWakeActive(false);
          triggerWakeRef.current?.();
          return;
        }
      }
    };
    rec.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        wakeWordEnabledRef.current = false;
        setWakeWordEnabled(false);
        setWakeActive(false);
        wakeRecognitionRef.current = null;
      }
    };
    rec.onend = () => {
      wakeRecognitionRef.current = null;
      setWakeActive(false);
      if (wakeWordEnabledRef.current && !handsFreeRef.current && !voiceModeRef.current && (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording")) {
        setTimeout(() => startWakeListeningRef.current?.(), 400);
      }
    };
    try {
      rec.start();
      wakeRecognitionRef.current = rec;
      setWakeActive(true);
    } catch {
      wakeRecognitionRef.current = null;
    }
  }, [language]);
  const triggerWake = (0, import_react11.useCallback)(() => {
    const now = Date.now();
    if (now - wakeCooldownRef.current < 3e3) return;
    wakeCooldownRef.current = now;
    handsFreeRef.current = true;
    stopWakeListening();
    setIsOpen(true);
    if (!voiceModeRef.current) enterVoiceMode();
    setTimeout(() => {
      if (!isVoiceSpeakingRef.current && (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording")) {
        startVoiceListening();
      }
    }, 450);
  }, [stopWakeListening, enterVoiceMode, startVoiceListening]);
  const endHandsFreeTurn = (0, import_react11.useCallback)(() => {
    handsFreeRef.current = false;
    if (voiceModeRef.current) exitVoiceMode();
    if (wakeWordEnabledRef.current) {
      setTimeout(() => startWakeListeningRef.current?.(), 700);
    }
  }, [exitVoiceMode]);
  (0, import_react11.useEffect)(() => {
    startWakeListeningRef.current = startWakeListening;
  }, [startWakeListening]);
  (0, import_react11.useEffect)(() => {
    triggerWakeRef.current = triggerWake;
  }, [triggerWake]);
  (0, import_react11.useEffect)(() => {
    endHandsFreeTurnRef.current = endHandsFreeTurn;
  }, [endHandsFreeTurn]);
  const toggleWakeWord = (0, import_react11.useCallback)(() => {
    setWakeWordEnabled((prev) => {
      const next = !prev;
      wakeWordEnabledRef.current = next;
      try {
        localStorage.setItem("dg.ai.wakeword", next ? "1" : "0");
      } catch {
      }
      if (next) {
        if (!voiceModeRef.current && (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording")) {
          setTimeout(() => startWakeListeningRef.current?.(), 100);
        }
      } else {
        handsFreeRef.current = false;
        stopWakeListening();
      }
      return next;
    });
  }, [stopWakeListening]);
  (0, import_react11.useEffect)(() => {
    let saved = "0";
    try {
      saved = localStorage.getItem("dg.ai.wakeword") || "0";
    } catch {
    }
    if (saved === "1" && wakeWordSupported) {
      setWakeWordEnabled(true);
      wakeWordEnabledRef.current = true;
      setTimeout(() => startWakeListeningRef.current?.(), 300);
    }
  }, []);
  (0, import_react11.useEffect)(() => {
    const was = prevSpeakingRef.current;
    prevSpeakingRef.current = isVoiceSpeaking;
    if (was && !isVoiceSpeaking && voiceMode && handsFreeRef.current && !isLoading) {
      const t3 = setTimeout(() => {
        if (voiceModeRef.current && handsFreeRef.current && !isVoiceSpeakingRef.current && (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording")) {
          startVoiceListening();
        }
      }, 700);
      return () => clearTimeout(t3);
    }
  }, [isVoiceSpeaking, voiceMode, isLoading, startVoiceListening]);
  (0, import_react11.useEffect)(() => {
    return () => {
      wakeWordEnabledRef.current = false;
      const rec = wakeRecognitionRef.current;
      wakeRecognitionRef.current = null;
      if (rec) {
        try {
          rec.onend = null;
          rec.stop();
        } catch {
        }
      }
    };
  }, []);
  (0, import_react11.useEffect)(() => {
    if (voiceMode) {
      stopWakeListening();
    } else if (wakeWordEnabledRef.current && !handsFreeRef.current) {
      const t3 = setTimeout(() => startWakeListeningRef.current?.(), 500);
      return () => clearTimeout(t3);
    }
  }, [voiceMode, stopWakeListening]);
  const lastGuideMsgRef = (0, import_react11.useRef)(null);
  (0, import_react11.useEffect)(() => {
    if (!lastAssistantMessage || isLoading) return;
    if (lastAssistantMessage.id === "welcome") return;
    if (lastAssistantMessage.id === lastGuideMsgRef.current) return;
    lastGuideMsgRef.current = lastAssistantMessage.id;
    const lang = language === "es" ? "es" : a11ySettings.preferredLanguage || language || "en";
    const shouldSpeak = voiceMode && !a11ySettings.preferTextOverVoice && lastAssistantMessage.id !== lastSpokenIdRef.current;
    if (shouldSpeak) {
      lastSpokenIdRef.current = lastAssistantMessage.id;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach((t3) => {
          t3.enabled = false;
        });
      }
    }
    syncFromChat({
      guide: {
        caption: lastAssistantMessage.message,
        text: lastAssistantMessage.message,
        isSpeaking: shouldSpeak
      }
    });
    if (shouldSpeak) {
      const micTimer = setTimeout(() => {
        if (voiceModeRef.current && mediaStreamRef.current) {
          mediaStreamRef.current.getAudioTracks().forEach((t3) => {
            t3.enabled = true;
          });
        }
      }, 3500);
      return () => clearTimeout(micTimer);
    }
  }, [voiceMode, lastAssistantMessage, isLoading, language, a11ySettings.preferTextOverVoice, syncFromChat]);
  (0, import_react11.useEffect)(() => {
    if (voiceMode) setIsVoiceSpeaking(guide.isSpeaking);
  }, [guide.isSpeaking, voiceMode]);
  (0, import_react11.useEffect)(() => {
    return () => {
      voiceModeRef.current = false;
      if (vadFrameRef.current) cancelAnimationFrame(vadFrameRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        try {
          mediaRecorderRef.current.stop();
        } catch {
        }
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t3) => t3.stop());
      }
      if (currentAudioRef.current) {
        currentAudioRef.current();
        currentAudioRef.current = null;
      }
      cancelVoice();
    };
  }, []);
  const handleKeyDown = (0, import_react11.useCallback)((e2) => {
    if (suggestionsOpen && filteredSuggestions.length > 0) {
      if (e2.key === "ArrowDown") {
        e2.preventDefault();
        setSuggestionIndex((i2) => (i2 + 1) % filteredSuggestions.length);
        return;
      }
      if (e2.key === "ArrowUp") {
        e2.preventDefault();
        setSuggestionIndex((i2) => i2 <= 0 ? filteredSuggestions.length - 1 : i2 - 1);
        return;
      }
      if (e2.key === "Escape") {
        e2.preventDefault();
        setSuggestionsOpen(false);
        setSuggestionIndex(-1);
        return;
      }
      if (e2.key === "Tab" && suggestionIndex >= 0) {
        e2.preventDefault();
        acceptSuggestion(filteredSuggestions[suggestionIndex]);
        return;
      }
      if (e2.key === "Enter" && !e2.shiftKey && suggestionIndex >= 0) {
        e2.preventDefault();
        acceptSuggestion(filteredSuggestions[suggestionIndex]);
        return;
      }
    }
    if (e2.key === "Enter" && !e2.shiftKey) {
      e2.preventDefault();
      if (!isLoading) handleSend();
    }
  }, [handleSend, isLoading, suggestionsOpen, filteredSuggestions, suggestionIndex, acceptSuggestion]);
  if (!isOpen) {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "fixed bottom-20 right-4 sm:bottom-24 sm:right-5 z-[10060] group fab-base pointer-events-auto", style: { perspective: "600px" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "absolute -top-14 -left-12 animate-float-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "relative bg-white rounded-2xl px-3 py-2 shadow-lg border border-cyan-200/50", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "text-cyan-500 font-bold text-lg", children: "?" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "absolute -bottom-2 right-4 w-4 h-4 bg-white border-r border-b border-cyan-200/50 transform rotate-45" })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "absolute inset-0 m-auto w-16 h-16 rounded-full bg-cyan-400/20 blur-xl animate-pulse-glow" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
        "button",
        {
          onClick: () => setIsOpen(true),
          className: "relative w-[68px] h-[68px] rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 animate-bob",
          "aria-label": "Open Nouri AI Assistant",
          style: { transformStyle: "preserve-3d" },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("svg", { viewBox: "0 0 100 100", className: "w-full h-full drop-shadow-2xl", style: { filter: "drop-shadow(0 8px 16px rgba(0,200,255,0.3))" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("defs", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("radialGradient", { id: "bodyGrad", cx: "40%", cy: "35%", r: "60%", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("stop", { offset: "0%", stopColor: "#ffffff" }),
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("stop", { offset: "60%", stopColor: "#f0f4f8" }),
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("stop", { offset: "100%", stopColor: "#d1dbe6" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("radialGradient", { id: "eyeGrad", cx: "50%", cy: "40%", r: "50%", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("stop", { offset: "0%", stopColor: "#67e8f9" }),
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("stop", { offset: "100%", stopColor: "#06b6d4" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("radialGradient", { id: "cheekGrad", cx: "50%", cy: "50%", r: "50%", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("stop", { offset: "0%", stopColor: "#22d3ee", stopOpacity: "0.6" }),
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("stop", { offset: "100%", stopColor: "#22d3ee", stopOpacity: "0" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("filter", { id: "glow", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("feGaussianBlur", { stdDeviation: "2", result: "coloredBlur" }),
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("feMerge", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("feMergeNode", { in: "coloredBlur" }),
                    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("feMergeNode", { in: "SourceGraphic" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("line", { x1: "30", y1: "22", x2: "22", y2: "6", stroke: "#b0bec5", strokeWidth: "2.5", strokeLinecap: "round" }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("circle", { cx: "22", cy: "5", r: "3.5", fill: "url(#eyeGrad)", filter: "url(#glow)", className: "animate-antenna-glow" }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("line", { x1: "70", y1: "22", x2: "78", y2: "6", stroke: "#b0bec5", strokeWidth: "2.5", strokeLinecap: "round" }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("circle", { cx: "78", cy: "5", r: "3.5", fill: "url(#eyeGrad)", filter: "url(#glow)", className: "animate-antenna-glow" }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("circle", { cx: "50", cy: "52", r: "36", fill: "url(#bodyGrad)", stroke: "#cfd8dc", strokeWidth: "1" }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("rect", { x: "26", y: "38", rx: "12", ry: "12", width: "48", height: "24", fill: "#1e293b", opacity: "0.85" }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("path", { d: "M35 53 Q38 46 41 53", stroke: "url(#eyeGrad)", strokeWidth: "3", strokeLinecap: "round", fill: "none", filter: "url(#glow)" }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("path", { d: "M59 53 Q62 46 65 53", stroke: "url(#eyeGrad)", strokeWidth: "3", strokeLinecap: "round", fill: "none", filter: "url(#glow)" }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("path", { d: "M44 57 Q50 61 56 57", stroke: "#67e8f9", strokeWidth: "1.5", strokeLinecap: "round", fill: "none", opacity: "0.7" }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("ellipse", { cx: "14", cy: "52", rx: "5", ry: "8", fill: "#e2e8f0", stroke: "#b0bec5", strokeWidth: "0.8" }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("ellipse", { cx: "14", cy: "52", rx: "3", ry: "5", fill: "url(#eyeGrad)", opacity: "0.4" }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("ellipse", { cx: "86", cy: "52", rx: "5", ry: "8", fill: "#e2e8f0", stroke: "#b0bec5", strokeWidth: "0.8" }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("ellipse", { cx: "86", cy: "52", rx: "3", ry: "5", fill: "url(#eyeGrad)", opacity: "0.4" }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("ellipse", { cx: "38", cy: "36", rx: "10", ry: "5", fill: "white", opacity: "0.5" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "absolute inset-0 rounded-full ring-2 ring-cyan-300/0 group-hover:ring-cyan-300/40 transition-all duration-300" })
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("style", { children: `
          @keyframes bob {
            0%, 100% { transform: translateY(0) rotateY(0deg); }
            25% { transform: translateY(-6px) rotateY(3deg); }
            50% { transform: translateY(-2px) rotateY(0deg); }
            75% { transform: translateY(-8px) rotateY(-3deg); }
          }
          @keyframes float-slow {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-4px) scale(1.03); }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.3); }
          }
          @keyframes antenna-glow {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }
          .animate-bob { animation: bob 3s ease-in-out infinite; }
          .animate-float-slow { animation: float-slow 2.5s ease-in-out infinite; }
          .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
          .animate-antenna-glow { animation: antenna-glow 1.5s ease-in-out infinite; }

          .group:hover .animate-bob {
            animation: bob 2s ease-in-out infinite;
            filter: drop-shadow(0 12px 24px rgba(0,200,255,0.45));
          }
        ` })
    ] });
  }
  const panelClasses = isExpanded ? "fixed inset-2 z-[1] sm:inset-4 md:inset-8" : "fixed z-[1] inset-x-2 top-2 bottom-2 sm:inset-x-auto sm:left-auto sm:top-auto sm:bottom-20 sm:right-4 sm:w-[540px] sm:max-w-[calc(100vw-2rem)] sm:h-[820px] sm:max-h-[calc(100vh-6rem)]";
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "fixed inset-0 z-[60]", children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      "div",
      {
        className: "fixed inset-0 bg-black/50",
        onClick: closeAssistant,
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
      "div",
      {
        ref: panelRef,
        role: "dialog",
        "aria-modal": "true",
        "aria-label": language === "es" ? "Asistente Nouri" : "Nouri AI Assistant",
        className: `${panelClasses} flex flex-col rounded-2xl shadow-2xl shadow-[#2CABE3]/10 overflow-hidden transition-all duration-300 border border-[#2CABE3]/15 bg-white/75 backdrop-blur-xl`,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "pointer-events-none absolute inset-0 overflow-hidden", "aria-hidden": "true", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#2CABE3]/15 blur-3xl" }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "absolute top-1/4 -right-20 w-64 h-64 rounded-full bg-emerald-300/20 blur-3xl" }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "absolute bottom-0 left-1/4 w-48 h-48 rounded-full bg-[#2CABE3]/8 blur-2xl" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "relative z-30 flex-shrink-0 bg-white/60 backdrop-blur-md text-gray-900 px-4 py-3 flex items-center justify-between border-b border-[#2CABE3]/15", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "w-9 h-9 rounded-full bg-gradient-to-br from-[#2CABE3] to-emerald-500 flex items-center justify-center shadow-md shadow-[#2CABE3]/25", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("svg", { viewBox: "0 0 100 100", className: "w-6 h-6", children: [
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("circle", { cx: "50", cy: "52", r: "36", fill: "#f0f4f8" }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("rect", { x: "26", y: "38", rx: "12", ry: "12", width: "48", height: "24", fill: "#1e293b", opacity: "0.85" }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("path", { d: "M35 53 Q38 46 41 53", stroke: "#67e8f9", strokeWidth: "4", strokeLinecap: "round", fill: "none" }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("path", { d: "M59 53 Q62 46 65 53", stroke: "#67e8f9", strokeWidth: "4", strokeLinecap: "round", fill: "none" })
              ] }) }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("h3", { className: "font-semibold text-sm text-gray-900 leading-tight", children: "Nouri" }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("p", { className: "text-[#2CABE3] text-[10px] flex items-center gap-1.5 leading-tight mt-0.5", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                    "span",
                    {
                      className: "w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-400/60",
                      "aria-hidden": "true"
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: isAuthenticated ? onlineToneLabel(language, getToneLabels(language)[tone] || tone) : t2(language, "signInForFeatures") })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("label", { className: "sr-only", htmlFor: "nouri-chat-language", children: t2(language, "chatLanguage") }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                "select",
                {
                  id: "nouri-chat-language",
                  value: chatLang(language),
                  onChange: (e2) => {
                    const newLang = chatLang(e2.target.value);
                    if (newLang === chatLang(language)) return;
                    setLanguage(newLang);
                    updateSetting("preferredLanguage", newLang);
                    sendMessage(languageSwitchPrompt(newLang));
                  },
                  className: "text-[#2CABE3] hover:text-[#2299c7] text-[11px] font-semibold px-2 py-1 rounded-full bg-[#2CABE3]/10 border border-[#2CABE3]/20 hover:border-[#2CABE3]/35 max-w-[5.5rem] truncate",
                  "aria-label": t2(language, "chatLanguage"),
                  children: CHAT_UI_LANGUAGES.map((code) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("option", { value: code, children: CHAT_LANGUAGE_LABELS[code] }, code))
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "relative z-40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                  "button",
                  {
                    onClick: () => setShowMenu(!showMenu),
                    className: "text-[#2CABE3]/70 hover:text-[#2CABE3] p-1 rounded hover:bg-[#2CABE3]/10 transition-colors",
                    "aria-label": "Chat menu",
                    "aria-expanded": showMenu,
                    children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("path", { d: "M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" }) })
                  }
                ),
                showMenu && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "absolute right-0 top-full mt-1 bg-white/95 rounded-lg shadow-xl border border-[#2CABE3]/15 py-1 w-52 z-50 backdrop-blur-md", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "px-2 pt-1 pb-0.5", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: "text-[10px] uppercase tracking-wider text-gray-400 px-2 py-1", children: t2(language, "conversationTone") }),
                    AI_TONE_OPTIONS.map((t3) => {
                      const labels = getToneLabels(language);
                      const active = tone === t3;
                      return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                        "button",
                        {
                          type: "button",
                          onClick: () => {
                            setTone(t3);
                            setShowMenu(false);
                          },
                          className: `w-full text-left px-4 py-1.5 text-sm transition-colors ${active ? "text-[#2CABE3] bg-[#2CABE3]/10" : "text-gray-700 hover:bg-[#2CABE3]/5 hover:text-[#2CABE3]"}`,
                          children: [
                            active ? "\u2713 " : "",
                            labels[t3]
                          ]
                        },
                        t3
                      );
                    })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "border-t border-[#2CABE3]/10 my-1" }),
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                    "button",
                    {
                      onClick: handleClearConversation,
                      className: "w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#2CABE3]/5 hover:text-[#2CABE3] transition-colors",
                      children: "\u{1F5D1}\uFE0F Clear conversation"
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                    "button",
                    {
                      onClick: () => {
                        setIsExpanded(!isExpanded);
                        setShowMenu(false);
                      },
                      className: "w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#2CABE3]/5 hover:text-[#2CABE3] transition-colors",
                      children: isExpanded ? "\u{1F5D7} Compact view" : "\u2B1C Full screen"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                "button",
                {
                  onClick: () => setIsExpanded(!isExpanded),
                  className: "text-[#2CABE3]/70 hover:text-[#2CABE3] p-1 rounded hover:bg-[#2CABE3]/10 transition-colors hidden md:block",
                  "aria-label": isExpanded ? "Compact view" : "Expand",
                  children: isExpanded ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("path", { fillRule: "evenodd", d: "M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z", clipRule: "evenodd" }) }) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("path", { fillRule: "evenodd", d: "M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L5.414 15H7a1 1 0 110 2H3a1 1 0 01-1-1v-4zm13.707.707a1 1 0 00-1.414-1.414L13 13.586V12a1 1 0 10-2 0v4a1 1 0 001 1h4a1 1 0 100-2h-1.586l2.293-2.293z", clipRule: "evenodd" }) })
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                "button",
                {
                  onClick: closeAssistant,
                  className: "text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors",
                  "aria-label": "Close chat",
                  children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) })
                }
              )
            ] })
          ] }),
          voiceMode ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
            "div",
            {
              className: "relative z-0 flex-1 flex flex-col items-center justify-between py-5 px-6 overflow-hidden bg-gradient-to-b from-[#2CABE3]/5 via-white/40 to-emerald-50/30 backdrop-blur-sm",
              role: "region",
              "aria-label": language === "es" ? "Modo de voz" : "Voice mode",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "voice-aurora", "aria-hidden": "true" }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "relative w-full flex items-center justify-between gap-2 z-10", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                    "button",
                    {
                      onClick: exitVoiceMode,
                      className: "inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-900/5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50",
                      "aria-label": language === "es" ? "Salir del modo de voz" : "Exit voice mode",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("path", { fillRule: "evenodd", d: "M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z", clipRule: "evenodd" }) }),
                        language === "es" ? "Volver al chat" : "Back to chat"
                      ]
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                    "span",
                    {
                      className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/5 ring-1 ring-slate-300/60 text-[10px] font-semibold tracking-wider uppercase text-slate-700 backdrop-blur-sm",
                      title: language === "es" ? "Idioma del modo de voz" : "Voice mode language",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { "aria-hidden": "true", children: language === "es" ? "\u{1F1EA}\u{1F1F8}" : "\u{1F1FA}\u{1F1F8}" }),
                        language === "es" ? "Espa\xF1ol" : "English"
                      ]
                    }
                  ),
                  wakeWordSupported && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                    "button",
                    {
                      onClick: toggleWakeWord,
                      className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide ring-1 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 ${wakeWordEnabled ? "bg-emerald-500/15 ring-emerald-500/50 text-emerald-800" : "bg-slate-900/5 ring-slate-300/70 text-slate-600 hover:text-emerald-800"}`,
                      title: wakeWordEnabled ? language === "es" ? "Manos libres activado \u2014 di \u201CNouri\u201D" : "Hands-free on \u2014 say \u201CNouri\u201D" : language === "es" ? "Activar manos libres \u201CNouri\u201D" : "Enable hands-free \u201CNouri\u201D",
                      "aria-pressed": wakeWordEnabled,
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-assistive-listening-systems", "aria-hidden": "true" }),
                        wakeWordEnabled ? language === "es" ? "Manos libres" : "Hands-free" : "\u201CNouri\u201D"
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "relative flex-1 flex items-center justify-center z-10", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                  "button",
                  {
                    onClick: handleOrbTap,
                    className: "relative focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/30 rounded-full group",
                    "aria-label": isVoiceSpeaking ? language === "es" ? "Toca para interrumpir" : "Tap to interrupt" : isVoiceListening ? language === "es" ? "Toca para enviar" : "Tap to send now" : language === "es" ? "Toca para hablar" : "Tap to speak",
                    children: [
                      isVoiceListening && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
                        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "absolute inset-0 -m-8 rounded-full border-2 border-blue-400/40 animate-voice-ring-1 pointer-events-none" }),
                        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "absolute inset-0 -m-14 rounded-full border border-blue-400/20 animate-voice-ring-2 pointer-events-none" }),
                        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "absolute inset-0 -m-20 rounded-full border border-blue-400/10 animate-voice-ring-3 pointer-events-none" })
                      ] }),
                      isVoiceSpeaking && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
                        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "absolute inset-0 -m-6 rounded-full border-2 border-teal-400/40 animate-voice-speak-ring-1 pointer-events-none" }),
                        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "absolute inset-0 -m-10 rounded-full border border-teal-400/20 animate-voice-speak-ring-2 pointer-events-none" })
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                        "div",
                        {
                          className: `absolute -inset-8 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${isVoiceSpeaking ? "bg-teal-500/30" : isVoiceListening ? "bg-blue-500/30" : isLoading ? "bg-violet-500/25" : "bg-slate-600/10"}`
                        }
                      ),
                      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                        "div",
                        {
                          className: `relative w-36 h-36 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer ${isVoiceListening ? "bg-gradient-to-br from-blue-400 via-indigo-500 to-violet-600 shadow-[0_0_60px_rgba(99,102,241,0.45)]" : isVoiceSpeaking ? "bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 shadow-[0_0_60px_rgba(20,184,166,0.45)] scale-110" : isLoading ? "bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-500 shadow-[0_0_40px_rgba(168,85,247,0.35)]" : "bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700 shadow-[0_0_20px_rgba(100,116,139,0.25)] scale-95 group-hover:scale-100"}`,
                          style: isVoiceListening ? { transform: `scale(${(1.05 + audioLevel * 0.18).toFixed(3)})` } : void 0,
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-transparent to-white/15 pointer-events-none" }),
                            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "relative z-10 flex items-center justify-center", children: isVoiceSpeaking ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "flex items-end gap-[3px] h-8", "aria-hidden": "true", children: [0, 1, 2, 3, 4].map((i2) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                              "span",
                              {
                                className: "w-1.5 bg-white/90 rounded-full animate-voice-bar",
                                style: { animationDelay: `${i2 * 0.12}s` }
                              },
                              i2
                            )) }) : isLoading ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "flex items-center gap-2", "aria-hidden": "true", children: [0, 1, 2].map((i2) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                              "span",
                              {
                                className: "w-2.5 h-2.5 bg-white/90 rounded-full animate-voice-dot",
                                style: { animationDelay: `${i2 * 0.18}s` }
                              },
                              i2
                            )) }) : /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                              "svg",
                              {
                                xmlns: "http://www.w3.org/2000/svg",
                                className: `h-12 w-12 transition-colors ${isVoiceListening ? "text-white/95" : "text-white/55 group-hover:text-white/85"}`,
                                viewBox: "0 0 24 24",
                                fill: "currentColor",
                                "aria-hidden": "true",
                                children: [
                                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("path", { d: "M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" }),
                                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("path", { d: "M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" })
                                ]
                              }
                            ) })
                          ]
                        }
                      )
                    ]
                  }
                ) }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "relative z-10 h-6 flex items-end justify-center gap-1 mb-1", "aria-hidden": "true", children: isVoiceListening && [0, 1, 2, 3, 4, 5, 6].map((i2) => {
                  const phase = Math.sin(Date.now() / 180 + i2 * 0.7) * 0.5 + 0.5;
                  const h2 = Math.max(4, (audioLevel * 22 + 3) * (0.4 + phase * 0.6));
                  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                    "span",
                    {
                      className: "w-[3px] rounded-full bg-blue-400/80 transition-[height] duration-75",
                      style: { height: `${h2}px` }
                    },
                    i2
                  );
                }) }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "relative flex flex-col items-center gap-3 z-10 w-full", children: [
                  tapToHear && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        try {
                          tapToHear();
                        } catch {
                        }
                      },
                      className: "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-teal-500/15 text-teal-200 ring-1 ring-teal-400/40 hover:bg-teal-500/25 transition-colors",
                      "aria-label": language === "es" ? "Toca para escuchar la respuesta" : "Tap to hear the response",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("path", { d: "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" }) }),
                        language === "es" ? "Toca para escuchar" : "Tap to hear"
                      ]
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "min-h-[40px] flex items-center justify-center px-4", children: voiceTranscript ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                    "p",
                    {
                      className: `text-sm italic text-center max-w-[300px] leading-snug transition-colors duration-300 ${isVoiceListening ? "text-white/90" : "text-slate-600"}`,
                      "aria-live": "polite",
                      children: [
                        "\u201C",
                        voiceTranscript,
                        "\u201D"
                      ]
                    }
                  ) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: "text-[12px] text-slate-500 italic text-center max-w-[280px]", children: isVoiceListening ? language === "es" ? "Te estoy escuchando..." : "I&apos;m listening..." : isVoiceSpeaking ? language === "es" ? "Habla cuando quieras interrumpir" : "Speak any time to interrupt" : isLoading ? "" : language === "es" ? "Tu transcripci\xF3n aparecer\xE1 aqu\xED" : "Your transcript will appear here" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                    "div",
                    {
                      className: `inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide transition-all duration-300 ring-1 ${voiceError ? "bg-rose-500/10 text-rose-700 ring-rose-500/40" : isVoiceSpeaking ? "bg-teal-500/10 text-teal-800 ring-teal-500/40" : isLoading ? "bg-violet-500/10 text-violet-800 ring-violet-500/40" : isVoiceListening ? "bg-blue-500/10 text-blue-700 ring-blue-500/40" : "bg-slate-900/5 text-slate-600 ring-slate-300/70"}`,
                      role: "status",
                      "aria-live": "polite",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                          "span",
                          {
                            className: `h-1.5 w-1.5 rounded-full ${voiceError ? "bg-rose-400" : isVoiceSpeaking ? "bg-teal-400 animate-pulse" : isLoading ? "bg-violet-400 animate-pulse" : isVoiceListening ? "bg-blue-400 animate-pulse" : "bg-slate-500"}`,
                            "aria-hidden": "true"
                          }
                        ),
                        voiceError ? voiceError : isVoiceSpeaking ? language === "es" ? "Hablando \u2014 toca para interrumpir" : "Speaking \u2014 tap to interrupt" : isLoading ? language === "es" ? "Pensando..." : "Thinking..." : isVoiceListening ? language === "es" ? "Escuchando \u2014 toca para enviar" : "Listening \u2014 tap to send" : language === "es" ? "Toca el orbe para hablar" : "Tap the orb to speak"
                      ]
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                    "button",
                    {
                      onClick: exitVoiceMode,
                      className: "group/end inline-flex items-center gap-2 pl-3 pr-4 h-12 rounded-full bg-rose-500/15 hover:bg-rose-500 border border-rose-500/30 hover:border-rose-500 text-rose-300 hover:text-white transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-rose-500/10 hover:shadow-rose-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50",
                      "aria-label": language === "es" ? "Terminar conversaci\xF3n de voz" : "End voice conversation",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/25 group-hover/end:bg-white/15", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
                          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
                        ] }) }),
                        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "text-[12px] font-semibold tracking-wide", children: language === "es" ? "Terminar" : "End conversation" })
                      ]
                    }
                  )
                ] })
              ]
            }
          ) : /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex-1 relative min-h-0 z-0", children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                "div",
                {
                  ref: messagesContainerRef,
                  className: "absolute inset-0 overflow-y-auto px-4 py-3 nourish-scrollbar",
                  role: "log",
                  "aria-label": "Chat messages",
                  "aria-live": "polite",
                  children: [
                    messages.length <= 1 && !isLoading && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                      WelcomeHero,
                      {
                        language,
                        userName: authUser?.name?.split(" ")?.[0] || null,
                        onPromptClick: handleQuickAction,
                        communityRole
                      }
                    ),
                    (() => {
                      let lastAssistantIdx = -1;
                      for (let i2 = messages.length - 1; i2 >= 0; i2--) {
                        const m2 = messages[i2];
                        if (m2.role === "assistant" && !m2.isError && m2.id !== "welcome") {
                          lastAssistantIdx = i2;
                          break;
                        }
                      }
                      return messages.map((msg, idx) => {
                        if (messages.length <= 1 && msg.id === "welcome") return null;
                        let separator = null;
                        const sepLabel = formatSeparator(msg.timestamp, language);
                        if (idx === 0 && sepLabel) {
                          separator = /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(DateSeparator, { label: sepLabel }, `sep-${idx}`);
                        } else if (idx > 0) {
                          const prev = messages[idx - 1];
                          if (prev?.timestamp && msg.timestamp) {
                            const prevDay = new Date(prev.timestamp).toDateString();
                            const curDay = new Date(msg.timestamp).toDateString();
                            if (prevDay !== curDay && sepLabel) {
                              separator = /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(DateSeparator, { label: sepLabel }, `sep-${idx}`);
                            }
                          }
                        }
                        return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_react11.default.Fragment, { children: [
                          separator,
                          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                            MessageBubble,
                            {
                              msg,
                              onFeedback: submitFeedback,
                              language,
                              onSuggestionClick: handleQuickAction,
                              onAttachPhoto: () => photoInputRef.current?.click(),
                              onConfirmAction: confirmPendingAction,
                              isLoading,
                              currentUser: authUser,
                              allowedCommunityIds,
                              onRetry: retryMessage,
                              onRegenerate: regenerateLast,
                              showRegenerate: idx === lastAssistantIdx,
                              showSuggestionChips: idx === liveChipIdx && !isLoading && !msg.isError
                            }
                          )
                        ] }, msg.id);
                      });
                    })(),
                    isLoading && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(TypingIndicator, {}),
                    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { ref: messagesEndRef })
                  ]
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                ScrollToBottomPill,
                {
                  visible: showScrollPill,
                  onClick: jumpToLatest,
                  language
                }
              )
            ] }),
            pendingUpload && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              BulkUploadPreview,
              {
                pending: pendingUpload,
                busy: uploadBusy,
                language,
                preferredCommunityId: authUser?.community_id,
                preferredLocation: authUser?.address,
                onCancel: cancelPendingUpload,
                onConfirm: confirmBulkCreate,
                onUpdateRow: updatePendingRow,
                onUpdateRows: updatePendingRows,
                onRemoveRow: removePendingRow
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              "input",
              {
                ref: photoInputRef,
                type: "file",
                accept: "image/*",
                className: "hidden",
                onChange: handlePhotoSelected,
                "aria-hidden": "true",
                tabIndex: -1
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              "input",
              {
                ref: inlinePhotoInputRef,
                type: "file",
                accept: "image/*",
                multiple: true,
                className: "hidden",
                onChange: handleInlinePhotoSelected,
                "aria-hidden": "true",
                tabIndex: -1
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              "input",
              {
                ref: csvInputRef,
                type: "file",
                accept: ".csv,text/csv,application/vnd.ms-excel",
                className: "hidden",
                onChange: handleCsvSelected,
                "aria-hidden": "true",
                tabIndex: -1
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("form", { onSubmit: handleSend, className: "relative z-0 border-t border-[#2CABE3]/15 px-3 pt-2.5 pb-2 flex flex-col gap-1 flex-shrink-0 bg-white/60 backdrop-blur-md", children: [
              pendingChatPhotos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "flex gap-2 overflow-x-auto pb-1 nourish-scrollbar-h", "aria-label": language === "es" ? "Fotos adjuntas" : "Attached photos", children: pendingChatPhotos.map((photo) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-[#2CABE3]/25 bg-white shadow-sm", children: [
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                  "img",
                  {
                    src: photo.previewUrl,
                    alt: photo.name || "attachment",
                    className: "w-full h-full object-cover"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                  "button",
                  {
                    type: "button",
                    onClick: () => removePendingChatPhoto(photo.id),
                    disabled: uploadBusy || isLoading,
                    className: "absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] leading-none flex items-center justify-center hover:bg-rose-600 disabled:opacity-40",
                    "aria-label": language === "es" ? "Quitar foto" : "Remove photo",
                    children: "\xD7"
                  }
                )
              ] }, photo.id)) }),
              railChips.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                "div",
                {
                  role: "toolbar",
                  "aria-label": language === "es" ? "Sugerencias r\xE1pidas" : "Quick suggestions",
                  className: "flex gap-1.5 overflow-x-auto pb-1 nourish-scrollbar-h",
                  children: railChips.map((chip, i2) => {
                    const label = typeof chip === "string" ? chip : chip?.label || chip?.message || "";
                    const message = typeof chip === "string" ? chip : chip?.message || chip?.label || "";
                    if (!label) return null;
                    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                      "button",
                      {
                        type: "button",
                        onClick: () => handleQuickAction(message),
                        disabled: isLoading,
                        className: "whitespace-nowrap flex-shrink-0 text-[11px] px-2.5 py-1 rounded-full border border-[#2CABE3]/30 bg-white/90 text-[#1a7a9e] font-medium hover:bg-[#2CABE3]/10 hover:border-[#2CABE3]/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                        children: label
                      },
                      `${label}-${i2}`
                    );
                  })
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex items-end gap-2", children: [
                canAttachFiles && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { ref: attachMenuRef, className: "relative flex-shrink-0", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                    "button",
                    {
                      type: "button",
                      onClick: () => setShowAttachMenu((v2) => !v2),
                      disabled: isLoading || uploadBusy,
                      className: `inline-flex items-center justify-center w-9 h-9 rounded-full transition-all border ${showAttachMenu ? "bg-[#2CABE3]/15 text-[#2CABE3] border-[#2CABE3]/30 rotate-45" : "bg-white/80 text-gray-600 border-[#2CABE3]/15 hover:bg-[#2CABE3]/10 hover:text-[#2CABE3] hover:border-[#2CABE3]/30"} disabled:opacity-40 disabled:cursor-not-allowed`,
                      title: language === "es" ? "Adjuntar" : "Attach",
                      "aria-label": language === "es" ? "Adjuntar foto o CSV" : "Attach photo or CSV",
                      "aria-expanded": showAttachMenu,
                      "aria-haspopup": "menu",
                      children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-plus text-sm", "aria-hidden": "true" })
                    }
                  ),
                  showAttachMenu && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                    "div",
                    {
                      role: "menu",
                      className: "absolute bottom-full left-0 mb-2 min-w-[200px] rounded-xl border border-[#2CABE3]/15 bg-white/95 backdrop-blur-md shadow-xl shadow-[#2CABE3]/10 overflow-hidden z-30 animate-fade-in",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                          "button",
                          {
                            type: "button",
                            role: "menuitem",
                            onClick: () => {
                              setShowAttachMenu(false);
                              triggerPhotoUpload();
                            },
                            className: "w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-[#2CABE3]/5 hover:text-[#2CABE3] transition-colors",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "inline-flex w-8 h-8 rounded-lg bg-fuchsia-500/15 text-fuchsia-600 items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-camera text-[13px]", "aria-hidden": "true" }) }),
                              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "flex-1 text-left", children: [
                                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "block font-medium leading-tight", children: language === "es" ? "Foto \u2192 publicar" : "Photo \u2192 list food" }),
                                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "block text-[10px] text-gray-500 leading-tight mt-0.5", children: language === "es" ? "IA detecta art\xEDculos" : "AI auto-detects items" })
                              ] })
                            ]
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                          "button",
                          {
                            type: "button",
                            role: "menuitem",
                            onClick: () => {
                              setShowAttachMenu(false);
                              triggerInlinePhotoUpload();
                            },
                            className: "w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-[#2CABE3]/5 hover:text-[#2CABE3] transition-colors border-t border-[#2CABE3]/10",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "inline-flex w-8 h-8 rounded-lg bg-sky-500/15 text-sky-600 items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-image text-[13px]", "aria-hidden": "true" }) }),
                              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "flex-1 text-left", children: [
                                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "block font-medium leading-tight", children: language === "es" ? "Adjuntar fotos al mensaje" : "Attach photo(s) to message" }),
                                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "block text-[10px] text-gray-500 leading-tight mt-0.5", children: language === "es" ? "Puedes a\xF1adir texto y enviar juntas" : "Add a caption, then send together" })
                              ] })
                            ]
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                          "button",
                          {
                            type: "button",
                            role: "menuitem",
                            onClick: () => {
                              setShowAttachMenu(false);
                              triggerCsvUpload();
                            },
                            className: "w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-[#2CABE3]/5 hover:text-[#2CABE3] transition-colors border-t border-[#2CABE3]/10",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "inline-flex w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-file-csv text-[13px]", "aria-hidden": "true" }) }),
                              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "flex-1 text-left", children: [
                                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "block font-medium leading-tight", children: language === "es" ? "CSV en lote" : "Bulk import CSV" }),
                                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "block text-[10px] text-gray-500 leading-tight mt-0.5", children: language === "es" ? "Sube varios listados a la vez" : "Upload many listings at once" })
                              ] })
                            ]
                          }
                        )
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex-1 relative", children: [
                  showSuggestions && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                    "ul",
                    {
                      role: "listbox",
                      "aria-label": language === "es" ? "Sugerencias" : "Suggestions",
                      className: "absolute bottom-full left-0 right-0 mb-2 max-h-56 overflow-y-auto rounded-xl border border-[#2CABE3]/15 bg-white/95 backdrop-blur-md shadow-lg shadow-[#2CABE3]/10 z-20 nourish-scrollbar",
                      children: filteredSuggestions.map((s2, idx) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                        "li",
                        {
                          role: "option",
                          "aria-selected": idx === suggestionIndex,
                          onMouseDown: (e2) => {
                            e2.preventDefault();
                            acceptSuggestion(s2);
                          },
                          onMouseEnter: () => setSuggestionIndex(idx),
                          className: `px-3 py-2 text-sm cursor-pointer transition-colors ${idx === suggestionIndex ? "bg-[#2CABE3]/15 text-[#2299c7]" : "text-gray-700 hover:bg-[#2CABE3]/5"}`,
                          children: s2
                        },
                        s2
                      ))
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                    "textarea",
                    {
                      ref: inputRef,
                      value: inputText,
                      onChange: (e2) => {
                        if (!isLoading) {
                          setInputText(e2.target.value);
                          setSuggestionsOpen(true);
                        }
                      },
                      onKeyDown: handleKeyDown,
                      onFocus: () => setSuggestionsOpen(true),
                      onBlur: () => setTimeout(() => setSuggestionsOpen(false), 120),
                      placeholder: pendingChatPhotos.length > 0 ? t2(language, "photoCaptionPlaceholder") : t2(language, "messagePlaceholder"),
                      className: `w-full resize-none rounded-2xl border bg-white/90 text-gray-800 placeholder-gray-400 px-4 py-2.5 text-sm leading-relaxed max-h-32 outline-none transition-all backdrop-blur-sm ${isLoading ? "ai-input-glow border-[#2CABE3]/60 cursor-wait" : "border-[#2CABE3]/15 focus:border-[#2CABE3]/50 focus:ring-2 focus:ring-[#2CABE3]/20 focus:bg-white"}`,
                      rows: 1,
                      readOnly: isLoading,
                      "aria-busy": isLoading,
                      "aria-label": "Message input",
                      "aria-autocomplete": "list",
                      "aria-expanded": showSuggestions,
                      "aria-controls": "ai-chat-suggestions"
                    }
                  )
                ] }),
                wakeWordSupported && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                  "button",
                  {
                    type: "button",
                    onClick: toggleWakeWord,
                    className: `flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full transition-all border ${wakeWordEnabled ? "border-emerald-500/40 bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "border-[#2CABE3]/15 bg-white/80 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400/30"}`,
                    title: wakeWordEnabled ? language === "es" ? "Palabra de activaci\xF3n activada \u2014 di \u201CNouri\u201D" : "Wake word on \u2014 say \u201CNouri\u201D" : language === "es" ? "Activar manos libres con \u201CNouri\u201D" : "Enable hands-free wake word \u201CNouri\u201D",
                    "aria-label": language === "es" ? "Alternar palabra de activaci\xF3n Nouri" : "Toggle Nouri wake word",
                    "aria-pressed": wakeWordEnabled,
                    children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "relative inline-flex items-center justify-center", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: `fas fa-assistive-listening-systems text-[13px] ${wakeActive ? "animate-pulse" : ""}`, "aria-hidden": "true" }),
                      wakeActive && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "absolute -top-1.5 -right-1.5 h-2 w-2 rounded-full bg-emerald-400 animate-ping", "aria-hidden": "true" })
                    ] })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                  "button",
                  {
                    type: "button",
                    onClick: enterVoiceMode,
                    disabled: isLoading,
                    className: "flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full transition-all border border-[#2CABE3]/15 bg-white/80 text-gray-600 hover:text-[#2CABE3] hover:bg-[#2CABE3]/10 hover:border-[#2CABE3]/30 disabled:opacity-40 disabled:cursor-not-allowed",
                    title: language === "es" ? "Modo voz" : "Voice mode",
                    "aria-label": "Switch to voice mode",
                    children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-microphone text-[13px]", "aria-hidden": "true" })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                  "button",
                  {
                    type: "submit",
                    disabled: !inputText.trim() && pendingChatPhotos.length === 0 || isLoading || uploadBusy,
                    className: `flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full transition-all ${(inputText.trim() || pendingChatPhotos.length > 0) && !isLoading && !uploadBusy ? "bg-gradient-to-br from-[#2CABE3] to-emerald-500 text-white hover:from-[#2299c7] hover:to-emerald-600 shadow-md shadow-[#2CABE3]/25 hover:scale-105 active:scale-95" : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"}`,
                    "aria-label": language === "es" ? "Enviar mensaje" : "Send message",
                    children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("i", { className: "fas fa-paper-plane text-[12px]", "aria-hidden": "true" })
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex items-center justify-between px-1 text-[10px] text-slate-600", children: [
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "hidden sm:inline", children: language === "es" ? "Enter para enviar \xB7 Shift+Enter para l\xEDnea nueva" : "Enter to send \xB7 Shift+Enter for new line" }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: `ml-auto tabular-nums transition-colors ${inputText.length > 4e3 ? "text-rose-600 font-medium" : inputText.length > 2e3 ? "text-amber-700" : "text-slate-500"}`, children: inputText.length > 0 ? `${inputText.length}` : "" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("style", { children: `
        .nourish-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .nourish-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .nourish-scrollbar::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.2); border-radius: 4px; }
        .nourish-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34,211,238,0.4); }

        /* Thin horizontal scrollbar for the quick-chip rail */
        .nourish-scrollbar-h::-webkit-scrollbar { height: 4px; }
        .nourish-scrollbar-h::-webkit-scrollbar-track { background: transparent; }
        .nourish-scrollbar-h::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.15); border-radius: 4px; }
        .nourish-scrollbar-h::-webkit-scrollbar-thumb:hover { background: rgba(34,211,238,0.3); }

        /* Fade-in for menus / pills */
        @keyframes ai-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: ai-fade-in 180ms ease-out both; }

        /* Voice orb animations */
        @keyframes voice-ring-out {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .animate-voice-ring-1 { animation: voice-ring-out 2s ease-out infinite; }
        .animate-voice-ring-2 { animation: voice-ring-out 2s ease-out 0.4s infinite; }
        .animate-voice-ring-3 { animation: voice-ring-out 2s ease-out 0.8s infinite; }

        @keyframes voice-speak-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .animate-voice-speak-ring-1 { animation: voice-speak-ring 1.5s ease-out infinite; }
        .animate-voice-speak-ring-2 { animation: voice-speak-ring 1.5s ease-out 0.3s infinite; }

        /* Speaking wave bars */
        @keyframes voice-bar-bounce {
          0%, 100% { height: 8px; }
          50% { height: 28px; }
        }
        .animate-voice-bar { animation: voice-bar-bounce 0.6s ease-in-out infinite; }

        /* Thinking dots */
        @keyframes voice-dot-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.4); opacity: 1; }
        }
        .animate-voice-dot { animation: voice-dot-pulse 0.8s ease-in-out infinite; }
      ` })
        ]
      }
    )
  ] });
}
var AIChatPanel_default = AIChatPanel;

// src/common/NouriGuideBar.jsx
var import_react12 = __toESM(require_react(), 1);

// utils/formFieldGuide.js
var FORM_GUIDE_DESC_ID = "nouri-form-guide-desc";
function notifyFormFieldFocus(detail) {
  if (typeof window === "undefined" || !detail || typeof detail !== "object") return;
  window.dispatchEvent(new CustomEvent("foodmaps:form_focus", { detail }));
}
if (typeof window !== "undefined") {
  window.nouriNotifyFormFocus = notifyFormFieldFocus;
}

// utils/nouriGuide/registry.js
var NOURI_GOALS = {};

// utils/nouriGuide/humanHandoff.js
var failureCount = 0;
function getGuideFailureCount() {
  return failureCount;
}
function shouldSuggestHumanHandoff() {
  return failureCount >= 3;
}
function openHumanSupport() {
  window.dispatchEvent(new CustomEvent("foodmaps:navigate_ui", {
    detail: { action: "open", target: "dashboard", summary: "Support" }
  }));
}

// src/common/NouriGuideBar.jsx
var import_jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
function NouriGuideBar() {
  const {
    settings,
    guide,
    toggleMute,
    dismiss,
    replay,
    resume
  } = useNouriGuide();
  const [failureCount2, setFailureCount] = (0, import_react12.useState)(() => getGuideFailureCount());
  const showHandoffHint = shouldSuggestHumanHandoff();
  (0, import_react12.useEffect)(() => {
    const refresh = () => setFailureCount(getGuideFailureCount());
    window.addEventListener("nouri:handoff-suggested", refresh);
    return () => window.removeEventListener("nouri:handoff-suggested", refresh);
  }, []);
  const {
    source,
    caption,
    text,
    label,
    section,
    stepIndex,
    stepTotal,
    formId,
    isSpeaking,
    isMuted,
    isDismissed,
    hasResume
  } = guide;
  const displayText = caption || text;
  const showBar = !isDismissed && (settings.alwaysShowCaptions || settings.preferTextOverVoice || isSpeaking || hasResume || source === "form" && displayText || source === "chat" && displayText);
  (0, import_react12.useEffect)(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("has-nouri-guide-bar", Boolean(showBar && displayText));
    return () => document.body.classList.remove("has-nouri-guide-bar");
  }, [showBar, displayText]);
  if (!showBar || !displayText) return null;
  const stepLabel = stepTotal > 0 ? `Step ${stepIndex + 1} of ${stepTotal}` : null;
  const goalWelcome = guide.goalKey && NOURI_GOALS[guide.goalKey]?.welcome;
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { id: FORM_GUIDE_DESC_ID, className: "sr-only", children: displayText }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      "div",
      {
        className: "nouri-ai-caption-bar nouri-guide-bar",
        role: "region",
        "aria-label": "Nouri accessibility guide",
        children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "max-w-5xl mx-auto flex items-start gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
            "div",
            {
              className: `flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${isSpeaking ? "bg-[#2CABE3] text-white" : "bg-white/15 text-[#2CABE3]"}`,
              "aria-hidden": "true",
              children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("i", { className: `fas ${isSpeaking ? "fa-volume-high" : "fa-robot"}` })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide opacity-80 mb-1", children: [
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { children: "Nouri guide" }),
              stepLabel && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { "aria-label": `${stepLabel}`, children: stepLabel }),
              section && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { children: [
                "\xB7 ",
                section
              ] }),
              label && label !== "AI guide" && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { children: [
                "\xB7 ",
                label
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
              "p",
              {
                role: "status",
                "aria-live": "polite",
                "aria-atomic": "true",
                className: "text-sm leading-snug",
                children: displayText
              }
            ),
            hasResume && goalWelcome && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "text-xs mt-1 opacity-80", children: "Continuing where you left off in chat." }),
            settings.preferTextOverVoice && !isMuted && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "text-xs mt-1 opacity-70", children: "Text-only mode \u2014 voice is off in accessibility settings." }),
            source === "form" && !settings.formVoiceGuideEnabled && !settings.preferTextOverVoice && !isMuted && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "text-xs mt-1 opacity-70", children: "Voice guide is off \u2014 enable Form voice guide in Accessibility settings." }),
            showHandoffHint && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "text-xs mt-1 opacity-90", children: "Having trouble? A team member can help." })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
              "button",
              {
                type: "button",
                onClick: () => openHumanSupport(),
                className: "px-2 py-1 text-xs rounded bg-white/20 hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                "aria-label": "Talk to a person for help",
                title: failureCount2 >= 3 ? "Nouri suggested human help" : "Contact support",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("i", { className: "fas fa-user-headset mr-1", "aria-hidden": "true" }),
                  "Person"
                ]
              }
            ),
            hasResume && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
              "button",
              {
                type: "button",
                onClick: () => resume(),
                className: "px-2 py-1 text-xs rounded bg-white/20 hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                "aria-label": "Continue guided step",
                children: "Continue"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
              "button",
              {
                type: "button",
                onClick: () => replay(),
                title: "Replay",
                "aria-label": "Replay current guide step",
                className: "w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("i", { className: "fas fa-redo text-xs", "aria-hidden": "true" })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
              "button",
              {
                type: "button",
                onClick: toggleMute,
                title: isMuted ? "Unmute" : "Mute",
                "aria-label": isMuted ? "Unmute guide voice" : "Mute guide voice",
                className: "w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("i", { className: `fas ${isMuted ? "fa-volume-xmark" : "fa-volume-high"} text-xs`, "aria-hidden": "true" })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
              "button",
              {
                type: "button",
                onClick: dismiss,
                title: "Dismiss",
                "aria-label": "Dismiss guide",
                className: "w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("i", { className: "fas fa-xmark text-xs", "aria-hidden": "true" })
              }
            )
          ] })
        ] })
      }
    )
  ] });
}

// src/assistant/RoleInsightsPanel.jsx
var import_react15 = __toESM(require_react(), 1);
var import_prop_types4 = __toESM(require_prop_types(), 1);

// utils/react-router-shim.js
var import_react13 = __toESM(require_react(), 1);
var import_jsx_runtime11 = __toESM(require_jsx_runtime(), 1);
function useNavigate() {
  return (href) => {
    if (!href) return;
    if (/^https?:\/\//i.test(href)) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    const path = href.replace(/^\//, "");
    const [targetRaw, query = ""] = path.split("?");
    const ALIASES = { share: "create", find: "map", "request-food": "request" };
    const target = ALIASES[targetRaw.toLowerCase()] || targetRaw;
    window.dispatchEvent(new CustomEvent("foodmaps:navigate_ui", {
      detail: {
        action: "open",
        target,
        path: href.startsWith("/") ? href : `/${href}`,
        query: query || null,
        summary: null
      }
    }));
  };
}

// src/common/AIThinking.jsx
var import_react14 = __toESM(require_react(), 1);
var import_prop_types3 = __toESM(require_prop_types(), 1);
var import_jsx_runtime12 = __toESM(require_jsx_runtime(), 1);
var DEFAULT_STAGES = [
  { icon: "brain", label: "Analyzing your request" },
  { icon: "database", label: "Searching knowledge base" },
  { icon: "satellite-dish", label: "Consulting live activity" },
  { icon: "wand-magic-sparkles", label: "Generating response" }
];
function useCyclingStage(stages, intervalMs = 1400) {
  const [idx, setIdx] = (0, import_react14.useState)(0);
  (0, import_react14.useEffect)(() => {
    if (!stages || stages.length <= 1) return void 0;
    const t3 = setInterval(() => setIdx((i2) => (i2 + 1) % stages.length), intervalMs);
    return () => clearInterval(t3);
  }, [stages, intervalMs]);
  return stages?.[idx] || stages?.[0];
}
function OrbitingAvatar({ size = 40 }) {
  const px = `${size}px`;
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "relative flex-shrink-0", style: { width: px, height: px }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      "div",
      {
        className: "absolute inset-0 rounded-full ai-typing-orbit-fast",
        style: {
          background: "conic-gradient(from 0deg, transparent 0%, rgba(34,211,238,0.95) 28%, transparent 55%, rgba(168,85,247,0.85) 82%, transparent 100%)",
          WebkitMask: "radial-gradient(circle, transparent 56%, black 58%)",
          mask: "radial-gradient(circle, transparent 56%, black 58%)"
        },
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      "div",
      {
        className: "absolute inset-1 rounded-full ai-typing-orbit-slow",
        style: {
          background: "conic-gradient(from 180deg, transparent 0%, rgba(165,243,252,0.7) 40%, transparent 80%)",
          WebkitMask: "radial-gradient(circle, transparent 62%, black 64%)",
          mask: "radial-gradient(circle, transparent 62%, black 64%)"
        },
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "absolute inset-2 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center ai-typing-core", children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("i", { className: "fas fa-sparkles text-[9px] text-white", "aria-hidden": "true" }) }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      "span",
      {
        className: "ai-typing-particle absolute top-0 left-1 w-1 h-1 rounded-full bg-cyan-300",
        style: { animationDelay: "0ms" },
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      "span",
      {
        className: "ai-typing-particle absolute top-0 right-1 w-1 h-1 rounded-full bg-fuchsia-300",
        style: { animationDelay: "550ms" },
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      "span",
      {
        className: "ai-typing-particle absolute top-1 left-4 w-0.5 h-0.5 rounded-full bg-white",
        style: { animationDelay: "1100ms" },
        "aria-hidden": "true"
      }
    )
  ] });
}
OrbitingAvatar.propTypes = { size: import_prop_types3.default.number };
function StageBubble({ stage, dark = true }) {
  const wrap = dark ? "bg-slate-800/60 border-cyan-500/30 shadow-cyan-500/10" : "bg-white/80 border-cyan-400/40 shadow-cyan-400/10";
  const labelColor = dark ? "text-cyan-100" : "text-cyan-900";
  const iconColor = dark ? "text-cyan-300" : "text-cyan-600";
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
    "div",
    {
      className: `ai-typing-shimmer relative backdrop-blur-md rounded-2xl px-3.5 py-2 border shadow-lg overflow-hidden ${wrap}`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "flex items-center gap-2 relative z-10", children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
            "i",
            {
              className: `fas fa-${stage.icon} ${iconColor} text-[11px] ai-typing-status`,
              "aria-hidden": "true"
            },
            `icon-${stage.icon}`
          ),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
            "span",
            {
              className: `text-[11px] ${labelColor} font-medium tracking-wide truncate ai-typing-status`,
              children: [
                stage.label,
                "\u2026"
              ]
            },
            `label-${stage.label}`
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "flex items-center gap-1 mt-1 relative z-10", children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
            "span",
            {
              className: "ai-typing-dot w-1.5 h-1.5 rounded-full bg-cyan-300",
              style: { animationDelay: "0ms" }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
            "span",
            {
              className: "ai-typing-dot w-1.5 h-1.5 rounded-full bg-blue-400",
              style: { animationDelay: "180ms" }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
            "span",
            {
              className: "ai-typing-dot w-1.5 h-1.5 rounded-full bg-fuchsia-400",
              style: { animationDelay: "360ms" }
            }
          )
        ] })
      ]
    }
  );
}
StageBubble.propTypes = {
  stage: import_prop_types3.default.shape({
    icon: import_prop_types3.default.string.isRequired,
    label: import_prop_types3.default.string.isRequired
  }).isRequired,
  dark: import_prop_types3.default.bool
};
function AIThinkingInline({ stages = DEFAULT_STAGES, dark = true, size = 40, className = "" }) {
  const stage = useCyclingStage(stages);
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
    "div",
    {
      className: `flex items-center gap-3 ${className}`,
      role: "status",
      "aria-live": "polite",
      "aria-label": `AI: ${stage.label}`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(OrbitingAvatar, { size }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "relative flex-1 min-w-0 max-w-[280px]", children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(StageBubble, { stage, dark }) })
      ]
    }
  );
}
AIThinkingInline.propTypes = {
  stages: import_prop_types3.default.arrayOf(
    import_prop_types3.default.shape({ icon: import_prop_types3.default.string, label: import_prop_types3.default.string })
  ),
  dark: import_prop_types3.default.bool,
  size: import_prop_types3.default.number,
  className: import_prop_types3.default.string
};
function AIThinkingPanel({ stages = DEFAULT_STAGES, title = "AI at work", className = "" }) {
  const stage = useCyclingStage(stages);
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
    "div",
    {
      className: `relative overflow-hidden rounded-xl border border-cyan-400/30 bg-gradient-to-br from-slate-50 via-cyan-50/40 to-indigo-50/40 p-4 ${className}`,
      role: "status",
      "aria-live": "polite",
      "aria-label": `${title}: ${stage.label}`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "pointer-events-none absolute inset-0 ai-typing-shimmer", "aria-hidden": "true" }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "relative z-10 flex items-center gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(OrbitingAvatar, { size: 44 }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("p", { className: "text-[11px] font-semibold uppercase tracking-wider text-cyan-700/80", children: title }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
              "p",
              {
                className: "ai-typing-status mt-0.5 truncate text-sm font-medium text-slate-800",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("i", { className: `fas fa-${stage.icon} mr-2 text-cyan-600`, "aria-hidden": "true" }),
                  stage.label,
                  "\u2026"
                ]
              },
              `panel-stage-${stage.label}`
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "relative z-10 mt-3 h-1.5 w-full overflow-hidden rounded-full bg-cyan-100/70", children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
          "div",
          {
            className: "h-full w-1/3 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500",
            style: {
              animation: "ai-shimmer 1.8s linear infinite"
            }
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "relative z-10 mt-3 flex items-center gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "ai-typing-dot w-1.5 h-1.5 rounded-full bg-cyan-500", style: { animationDelay: "0ms" } }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "ai-typing-dot w-1.5 h-1.5 rounded-full bg-blue-500", style: { animationDelay: "180ms" } }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "ai-typing-dot w-1.5 h-1.5 rounded-full bg-fuchsia-500", style: { animationDelay: "360ms" } }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "ml-2 text-[10px] uppercase tracking-wider text-slate-500", children: "Powered by GPT-4o" })
        ] })
      ]
    }
  );
}
AIThinkingPanel.propTypes = {
  stages: import_prop_types3.default.arrayOf(
    import_prop_types3.default.shape({ icon: import_prop_types3.default.string, label: import_prop_types3.default.string })
  ),
  title: import_prop_types3.default.string,
  className: import_prop_types3.default.string
};

// src/assistant/RoleInsightsPanel.jsx
var import_jsx_runtime13 = __toESM(require_jsx_runtime(), 1);
var ROLE_LABELS = {
  admin: "Admin coach",
  donor: "Donor coach",
  recipient: "Recipient guide",
  organizer: "Organizer copilot"
};
var PRIORITY_BADGE = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-emerald-100 text-emerald-700"
};
function formatTimestamp(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (_2) {
    return "";
  }
}
function RoleInsightsPanel({ roleHint = null, className = "" }) {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuthContext();
  const communityRole = useCommunityRole();
  const effectiveRoleHint = roleHint || communityRole;
  const [state, setState] = import_react15.default.useState({
    loading: true,
    refreshing: false,
    error: null,
    degraded: false,
    role: roleHint || effectiveRoleHint || (isAdmin ? "admin" : "recipient"),
    headline: "",
    insights: [],
    profileCompletion: null,
    profileGaps: [],
    generatedAt: null
  });
  const load = import_react15.default.useCallback(async (isInitial = false) => {
    if (!user?.id) return;
    setState((prev) => ({
      ...prev,
      // Only show the full skeleton when we have nothing to display yet.
      loading: isInitial && prev.insights.length === 0,
      refreshing: !isInitial || prev.insights.length > 0,
      error: null
    }));
    try {
      const data = await aiChatService_default.getInsights(user.id, {
        roleHint: effectiveRoleHint
      });
      setState((prev) => ({
        loading: false,
        refreshing: false,
        error: null,
        degraded: !!data.degraded,
        role: data.role,
        // If the self-healing fallback fired, prefer the last good
        // insights/headline we already had instead of going blank.
        headline: data.degraded && prev.insights.length > 0 ? prev.headline : data.headline,
        insights: data.degraded && prev.insights.length > 0 ? prev.insights : data.insights,
        profileCompletion: data.degraded && prev.insights.length > 0 ? prev.profileCompletion : data.profileCompletion,
        profileGaps: data.degraded && prev.insights.length > 0 ? prev.profileGaps : data.profileGaps || [],
        generatedAt: data.degraded && prev.insights.length > 0 ? prev.generatedAt : data.generatedAt
      }));
    } catch (error) {
      reportError2(error);
      setState((prev) => ({
        ...prev,
        loading: false,
        refreshing: false,
        // Only surface the error UI when we have no cached insights to fall back to.
        error: prev.insights.length === 0 ? "Unable to load AI insights right now." : null,
        degraded: prev.insights.length > 0
      }));
    }
  }, [user?.id, effectiveRoleHint]);
  import_react15.default.useEffect(() => {
    load(true);
  }, [load]);
  const handleAction = (action) => {
    if (!action?.href) return;
    if (/^https?:\/\//i.test(action.href)) {
      window.open(action.href, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(action.href);
  };
  const roleLabel = ROLE_LABELS[state.role] || "AI assistant";
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
    "section",
    {
      className: `rounded-lg border border-gray-200 bg-white shadow-sm ${className}`,
      "aria-label": "AI dashboard insights",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("header", { className: "flex items-center justify-between border-b border-gray-100 px-5 py-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#2CABE3]/10 text-[#2CABE3]", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("i", { className: "fas fa-sparkles", "aria-hidden": "true" }) }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("h2", { className: "text-sm font-semibold text-gray-900 flex items-center gap-1.5", children: [
                "AI Insights \xB7 ",
                roleLabel,
                state.degraded && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
                  "span",
                  {
                    title: "AI link recovering \u2014 showing best-effort data",
                    className: "inline-flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("i", { className: "fas fa-bolt text-[8px]", "aria-hidden": "true" }),
                      "recovering"
                    ]
                  }
                )
              ] }),
              state.generatedAt && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("p", { className: "text-xs text-gray-500", children: [
                "Updated ",
                formatTimestamp(state.generatedAt),
                state.refreshing && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("span", { className: "ml-2 inline-flex items-center gap-1 text-[#2CABE3]", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("i", { className: "fas fa-circle-notch fa-spin text-[10px]", "aria-hidden": "true" }),
                  "refreshing"
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
            "button",
            {
              type: "button",
              onClick: () => load(false),
              disabled: state.loading || state.refreshing,
              className: "rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50",
              children: state.refreshing ? "Refreshing..." : "Refresh"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "px-5 py-4", children: [
          state.role !== "admin" && typeof state.profileCompletion === "number" && !state.loading && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "mb-4 rounded-md border border-gray-100 bg-gray-50 p-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "flex items-center justify-between text-xs text-gray-600", children: [
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "font-medium", children: "Profile completion" }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("span", { children: [
                state.profileCompletion,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              "div",
              {
                className: "h-full rounded-full bg-[#2CABE3] transition-all",
                style: { width: `${Math.max(0, Math.min(100, state.profileCompletion))}%` }
              }
            ) }),
            state.profileGaps.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("p", { className: "mt-2 text-[11px] text-gray-500", children: [
              state.profileGaps.length,
              " profile item",
              state.profileGaps.length === 1 ? "" : "s",
              " missing \u2014 see suggestions below."
            ] })
          ] }),
          state.headline && !state.loading && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("p", { className: "mb-3 text-sm font-medium text-gray-800", children: state.headline }),
          state.loading ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
            AIThinkingPanel,
            {
              title: "Generating insights",
              stages: [
                { icon: "user-shield", label: "Reading your profile" },
                { icon: "chart-line", label: "Reviewing recent activity" },
                { icon: "brain", label: "Spotting opportunities" },
                { icon: "wand-magic-sparkles", label: "Drafting recommendations" }
              ]
            }
          ) : state.error ? /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "rounded-md border border-amber-200 bg-amber-50 p-4 text-center", children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("i", { className: "fas fa-exclamation-triangle text-amber-500 mb-2" }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("p", { className: "text-sm text-amber-800 mb-3", children: state.error }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
              "button",
              {
                type: "button",
                onClick: () => load(false),
                disabled: state.refreshing,
                className: "inline-flex items-center gap-1 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("i", { className: `fas fa-${state.refreshing ? "spinner fa-spin" : "redo"} text-[10px]` }),
                  state.refreshing ? "Retrying\u2026" : "Try again"
                ]
              }
            )
          ] }) : state.insights.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("p", { className: "text-sm text-gray-500", children: "No personalized insights yet \u2014 check back after some activity." }) : /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("ul", { className: "space-y-3", children: state.insights.filter((insight) => state.role !== "admin" || insight.source !== "profile_gap").map((insight, idx) => {
            const priorityClass = PRIORITY_BADGE[insight.priority] || PRIORITY_BADGE.low;
            const iconClass = insight.icon ? `fas fa-${insight.icon}` : "fas fa-lightbulb";
            const isProfileGap = insight.source === "profile_gap";
            return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
              "li",
              {
                className: `flex items-start gap-3 rounded-md border p-3 hover:border-[#2CABE3]/40 ${isProfileGap ? "border-[#2CABE3]/30 bg-[#2CABE3]/5" : "border-gray-100"}`,
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: `mt-0.5 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${isProfileGap ? "bg-[#2CABE3]/15 text-[#2CABE3]" : "bg-gray-50 text-gray-700"}`, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("i", { className: iconClass, "aria-hidden": "true" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "flex-1", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "flex items-start justify-between gap-2", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("h3", { className: "text-sm font-semibold text-gray-900", children: insight.title }),
                      isProfileGap ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: "rounded-full bg-[#2CABE3]/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#2CABE3]", children: "Profile" }) : insight.priority && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: `rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${priorityClass}`, children: insight.priority })
                    ] }),
                    insight.message && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("p", { className: "mt-1 text-sm text-gray-600", children: insight.message }),
                    insight.action?.label && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
                      "button",
                      {
                        type: "button",
                        onClick: () => handleAction(insight.action),
                        className: "mt-2 inline-flex items-center gap-1 rounded-md bg-[#2CABE3] px-3 py-1 text-xs font-medium text-white hover:opacity-90",
                        children: [
                          insight.action.label,
                          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("i", { className: "fas fa-arrow-right text-[10px]", "aria-hidden": "true" })
                        ]
                      }
                    )
                  ] })
                ]
              },
              insight.id || `insight-${idx}`
            );
          }) })
        ] })
      ]
    }
  );
}
RoleInsightsPanel.propTypes = {
  roleHint: import_prop_types4.default.string,
  className: import_prop_types4.default.string
};
var RoleInsightsPanel_default = RoleInsightsPanel;

// src/food/ShareBulkCsvPanel.jsx
var import_react16 = __toESM(require_react(), 1);
var import_prop_types5 = __toESM(require_prop_types(), 1);
var import_jsx_runtime14 = __toESM(require_jsx_runtime(), 1);
var MAX_CSV_BYTES = 2 * 1024 * 1024;
var MAX_ROWS = 100;
var CATEGORIES = ["produce", "bakery", "dairy", "pantry", "meat", "prepared", "other"];
function ShareBulkCsvPanel({
  userId,
  preferredCommunityId = null,
  preferredLocation = "",
  lockToUserCommunity = false,
  onSuccess
}) {
  const fileInputRef = (0, import_react16.useRef)(null);
  const [busy, setBusy] = (0, import_react16.useState)(false);
  const [enriching, setEnriching] = (0, import_react16.useState)(false);
  const [filename, setFilename] = (0, import_react16.useState)("");
  const [rows, setRows] = (0, import_react16.useState)([]);
  const [parseErrors, setParseErrors] = (0, import_react16.useState)([]);
  const [fatalError, setFatalError] = (0, import_react16.useState)("");
  const [enrichSummary, setEnrichSummary] = (0, import_react16.useState)("");
  const [apiErrors, setApiErrors] = (0, import_react16.useState)([]);
  const [communities, setCommunities] = (0, import_react16.useState)([]);
  const [communitiesLoading, setCommunitiesLoading] = (0, import_react16.useState)(true);
  const [communitiesError, setCommunitiesError] = (0, import_react16.useState)(null);
  const [selectedRowIndexes, setSelectedRowIndexes] = (0, import_react16.useState)(() => /* @__PURE__ */ new Set());
  const [bulkLocation, setBulkLocation] = (0, import_react16.useState)(() => String(preferredLocation || "").trim());
  const [bulkCommunityId, setBulkCommunityId] = (0, import_react16.useState)(
    () => preferredCommunityId != null && preferredCommunityId !== "" ? String(preferredCommunityId) : ""
  );
  const [bulkCategory, setBulkCategory] = (0, import_react16.useState)("");
  const [bulkExpiry, setBulkExpiry] = (0, import_react16.useState)("");
  const [fillEmptyOnly, setFillEmptyOnly] = (0, import_react16.useState)(true);
  const loadCommunities = (0, import_react16.useCallback)(async () => {
    setCommunitiesLoading(true);
    setCommunitiesError(null);
    try {
      const { data, error } = await supabaseClient_default.from("communities").select("id, name").eq("is_active", true).order("name", { ascending: true });
      if (error) throw error;
      setCommunities(data || []);
    } catch (err) {
      setCommunities([]);
      setCommunitiesError(err?.message || "Could not load communities");
    } finally {
      setCommunitiesLoading(false);
    }
  }, []);
  (0, import_react16.useEffect)(() => {
    loadCommunities();
  }, [loadCommunities]);
  (0, import_react16.useEffect)(() => {
    if (!communities.length || !rows.length) return;
    const preferred = preferredCommunityId ? communities.find((c2) => String(c2.id) === String(preferredCommunityId)) : null;
    let changed = false;
    const next = rows.map((row) => {
      if (lockToUserCommunity && preferred) {
        if (String(row.community_id) !== String(preferred.id) || row.community_name !== preferred.name) {
          changed = true;
          return {
            ...row,
            community_id: String(preferred.id),
            community_name: preferred.name
          };
        }
        return row;
      }
      if (row?.community_id) {
        if (!row.community_name) {
          const byId = communities.find((c2) => String(c2.id) === String(row.community_id));
          if (byId) {
            changed = true;
            return { ...row, community_name: byId.name };
          }
        }
        return row;
      }
      if (row?.community_name) {
        const match = matchCommunityByName(row.community_name, communities);
        if (match) {
          changed = true;
          return {
            ...row,
            community_id: String(match.id),
            community_name: match.name
          };
        }
        return row;
      }
      if (preferred) {
        changed = true;
        return {
          ...row,
          community_id: String(preferred.id),
          community_name: preferred.name
        };
      }
      return row;
    });
    if (changed) setRows(next);
  }, [communities, preferredCommunityId, rows.length, lockToUserCommunity]);
  (0, import_react16.useEffect)(() => {
    const n2 = rows.length;
    setSelectedRowIndexes(new Set(Array.from({ length: n2 }, (_2, i2) => i2)));
    setBulkLocation((prev) => {
      if (String(prev || "").trim()) return prev;
      return String(preferredLocation || "").trim();
    });
    setBulkCommunityId((prev) => {
      if (String(prev || "").trim()) return prev;
      return preferredCommunityId != null && preferredCommunityId !== "" ? String(preferredCommunityId) : "";
    });
  }, [rows.length, preferredLocation, preferredCommunityId]);
  const selectableCommunities = (0, import_react16.useMemo)(() => {
    if (!lockToUserCommunity || preferredCommunityId == null || preferredCommunityId === "") {
      return communities;
    }
    return communities.filter((c2) => String(c2.id) === String(preferredCommunityId));
  }, [communities, lockToUserCommunity, preferredCommunityId]);
  const missingCommunity = (0, import_react16.useMemo)(
    () => rows.some((r3) => !r3?.community_id && !String(r3?.community_name || "").trim()),
    [rows]
  );
  const allSelected = rows.length > 0 && selectedRowIndexes.size === rows.length;
  const someSelected = selectedRowIndexes.size > 0 && selectedRowIndexes.size < rows.length;
  const selectAllRef = (el) => {
    if (el) el.indeterminate = someSelected;
  };
  const updateRow = (0, import_react16.useCallback)((idx, patch) => {
    setRows((prev) => prev.map((r3, i2) => i2 === idx ? { ...r3, ...patch } : r3));
  }, []);
  const updateRows = (0, import_react16.useCallback)((indices, patch) => {
    const indexSet = new Set(Array.isArray(indices) ? indices : []);
    if (!indexSet.size || !patch) return;
    setRows((prev) => prev.map((r3, i2) => indexSet.has(i2) ? { ...r3, ...patch } : r3));
  }, []);
  const removeRow = (0, import_react16.useCallback)((idx) => {
    setRows((prev) => prev.filter((_2, i2) => i2 !== idx));
    setSelectedRowIndexes((prev) => {
      const next = /* @__PURE__ */ new Set();
      prev.forEach((i2) => {
        if (i2 < idx) next.add(i2);
        else if (i2 > idx) next.add(i2 - 1);
      });
      return next;
    });
  }, []);
  const applyPatchToSelected = (patch, isEmptyRow) => {
    if (!patch || !selectedRowIndexes.size) return;
    const indexes = Array.from(selectedRowIndexes).filter((idx) => {
      if (!fillEmptyOnly) return true;
      if (typeof isEmptyRow !== "function") return true;
      return isEmptyRow(rows[idx]);
    });
    if (!indexes.length) return;
    updateRows(indexes, patch);
  };
  const applyCommunityToSelected = () => {
    const id = String(bulkCommunityId || "").trim();
    if (!id) return;
    const match = selectableCommunities.find((c2) => String(c2.id) === id);
    if (!match) return;
    applyPatchToSelected(
      { community_id: String(match.id), community_name: match.name },
      (r3) => !r3?.community_id && !String(r3?.community_name || "").trim()
    );
  };
  const applyLocationToSelected = () => {
    const location = String(bulkLocation || "").trim();
    if (!location) return;
    applyPatchToSelected({ location }, (r3) => !String(r3?.location || "").trim());
  };
  const applyCategoryToSelected = () => {
    const category = String(bulkCategory || "").trim();
    if (!category) return;
    applyPatchToSelected(
      { category },
      (r3) => !String(r3?.category || "").trim() || String(r3?.category).toLowerCase() === "other"
    );
  };
  const applyExpiryToSelected = () => {
    const expiry = String(bulkExpiry || "").trim();
    if (!expiry) return;
    applyPatchToSelected({ expiry_date: expiry }, (r3) => !String(r3?.expiry_date || "").trim());
  };
  const applyAllMissingToSelected = () => {
    if (String(bulkCommunityId || "").trim()) applyCommunityToSelected();
    if (String(bulkLocation || "").trim()) applyLocationToSelected();
    if (String(bulkCategory || "").trim()) applyCategoryToSelected();
    if (String(bulkExpiry || "").trim()) applyExpiryToSelected();
  };
  const reset = () => {
    setRows([]);
    setFilename("");
    setParseErrors([]);
    setFatalError("");
    setEnrichSummary("");
    setApiErrors([]);
    setSelectedRowIndexes(/* @__PURE__ */ new Set());
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleFileSelected = async (e2) => {
    const file = e2.target.files?.[0];
    e2.target.value = "";
    if (!file) return;
    reset();
    setFilename(file.name);
    if (file.size > MAX_CSV_BYTES) {
      setFatalError("CSV too large (max 2 MB).");
      return;
    }
    setBusy(true);
    try {
      const text = await file.text();
      const { rows: parsed, errors } = parseListingsCsv(text);
      const capped = (parsed || []).slice(0, MAX_ROWS);
      const withImages = assignImagestoRows(capped);
      setParseErrors(Array.isArray(errors) ? errors : []);
      if (!withImages.length) {
        setFatalError(
          errors && errors[0] || "CSV had no valid rows. Check the template columns."
        );
        return;
      }
      setRows(withImages);
      if (userId) {
        setEnriching(true);
        try {
          const enrichment = await aiChatService_default.enrichListings(withImages, {
            userId,
            language: "en"
          });
          if (enrichment?.rows?.length) {
            setRows(assignImagestoRows(enrichment.rows));
            setEnrichSummary(
              enrichment.summary || ((enrichment.filled || []).length ? `AI filled gaps on ${(enrichment.filled || []).length} row(s). Review before publishing.` : "AI reviewed your rows \u2014 no gaps to fill.")
            );
          }
        } catch {
        } finally {
          setEnriching(false);
        }
      }
    } catch (err) {
      reportError2(err);
      setFatalError(err?.message || "Could not read CSV file.");
    } finally {
      setBusy(false);
    }
  };
  const handleConfirm = async () => {
    if (!rows.length || busy) return;
    if (!userId) {
      B.error("Sign in to publish listings.", { position: "top-center" });
      return;
    }
    if (missingCommunity) {
      B.error("Choose a school or community for each listing.", { position: "top-center" });
      return;
    }
    setBusy(true);
    setApiErrors([]);
    try {
      const rowsToCreate = rows.map((r3) => {
        const cleaned = sanitizeListingExpiry(r3);
        return {
          ...cleaned,
          community_id: cleaned.community_id != null ? String(cleaned.community_id) : void 0,
          community_name: cleaned.community_name || void 0
        };
      });
      const result = await aiChatService_default.bulkCreateListings(rowsToCreate, { userId });
      const { created, failed, awaitingApproval, errors } = result;
      if (Array.isArray(errors) && errors.length) {
        setApiErrors(errors.slice(0, 8));
      }
      if (!created) {
        B.error(
          failed ? `Could not create listings (${failed} failed). Check community and required fields.` : "Bulk create failed.",
          { position: "top-center" }
        );
        return;
      }
      window.dispatchEvent(new CustomEvent("foodShared"));
      B.success(
        awaitingApproval ? `${created} listing${created === 1 ? "" : "s"} submitted for admin approval${failed ? ` \u2014 ${failed} failed` : ""}` : `${created} listing${created === 1 ? "" : "s"} created successfully${failed ? ` \u2014 ${failed} failed` : ""}`,
        { autoClose: 5e3, position: "top-center" }
      );
      if (typeof onSuccess === "function") {
        onSuccess({ created, failed, awaitingApproval });
      } else {
        reset();
      }
    } catch (err) {
      reportError2(err);
      B.error(err?.message || "Bulk create failed.", { position: "top-center" });
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "space-y-5", "data-name": "share-bulk-csv-panel", children: [
    /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "rounded-xl border border-[#2CABE3]/20 bg-gradient-to-br from-[#2CABE3]/5 to-emerald-50/50 p-4 sm:p-5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("h2", { className: "text-lg font-semibold text-gray-900", children: "Bulk CSV upload" }),
      /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("p", { className: "mt-1 text-sm text-gray-600", children: [
        "Upload up to ",
        MAX_ROWS,
        " listings at once. Same rules as a single share \u2014 each row needs a school/community, and listings may wait for admin approval before Find Food."
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("ul", { className: "mt-3 text-xs text-gray-500 space-y-1 list-disc list-inside", children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("li", { children: "Required columns: title, quantity, unit, category" }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("li", { children: "Optional: description, expiry_date (MM/DD/YYYY), location, community, dietary_tags, allergens" }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("li", { children: "Images are assigned automatically when missing (you can still edit rows below)" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "mt-4 flex flex-wrap gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(
          "button",
          {
            type: "button",
            onClick: downloadCsvTemplate,
            disabled: busy,
            className: "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-[#2CABE3]/30 bg-white text-[#1a7a9e] hover:bg-[#2CABE3]/10 disabled:opacity-50",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("i", { className: "fas fa-download text-xs", "aria-hidden": "true" }),
              "Download template"
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(
          "button",
          {
            type: "button",
            onClick: () => fileInputRef.current?.click(),
            disabled: busy,
            className: "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-[#2CABE3] text-white hover:bg-[#2299c7] disabled:opacity-50 shadow-sm",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("i", { className: "fas fa-file-csv text-xs", "aria-hidden": "true" }),
              rows.length ? "Replace CSV" : "Choose CSV"
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
          "input",
          {
            ref: fileInputRef,
            type: "file",
            accept: ".csv,text/csv",
            className: "hidden",
            onChange: handleFileSelected
          }
        )
      ] }),
      filename && /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("p", { className: "mt-2 text-xs text-gray-500 truncate", title: filename, children: [
        "File: ",
        filename,
        rows.length ? ` \xB7 ${rows.length} row${rows.length === 1 ? "" : "s"}` : ""
      ] })
    ] }),
    (busy || enriching) && /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex items-center gap-2 text-sm text-[#1a7a9e]", children: [
      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("i", { className: "fas fa-spinner fa-spin", "aria-hidden": "true" }),
      enriching ? "AI is filling gaps\u2026" : "Working\u2026"
    ] }),
    fatalError && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700", children: fatalError }),
    parseErrors.length > 0 && !fatalError && /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800", children: [
      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("i", { className: "fas fa-triangle-exclamation mr-1", "aria-hidden": "true" }),
      parseErrors.length,
      " row(s) skipped",
      parseErrors[0] ? `: ${parseErrors[0]}` : ""
    ] }),
    enrichSummary && /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs text-cyan-900", children: [
      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("i", { className: "fas fa-wand-magic-sparkles mr-1", "aria-hidden": "true" }),
      enrichSummary
    ] }),
    rows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_jsx_runtime14.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("label", { className: "flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none", children: [
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
              "input",
              {
                ref: selectAllRef,
                type: "checkbox",
                checked: allSelected,
                onChange: () => {
                  if (allSelected) setSelectedRowIndexes(/* @__PURE__ */ new Set());
                  else setSelectedRowIndexes(new Set(rows.map((_2, i2) => i2)));
                },
                disabled: busy,
                className: "rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "font-medium", children: "Select all" }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("span", { className: "text-gray-500", children: [
              "(",
              selectedRowIndexes.size,
              "/",
              rows.length,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("label", { className: "flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer select-none", children: [
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
              "input",
              {
                type: "checkbox",
                checked: fillEmptyOnly,
                onChange: (e2) => setFillEmptyOnly(e2.target.checked),
                disabled: busy,
                className: "rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              }
            ),
            "Only fill empty"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex flex-col sm:flex-row gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(
            "select",
            {
              value: bulkCommunityId,
              onChange: (e2) => setBulkCommunityId(e2.target.value),
              disabled: busy || communitiesLoading || !selectableCommunities.length,
              className: "flex-1 min-w-0 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm",
              "aria-label": "Shared community",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("option", { value: "", children: communitiesLoading ? "Loading communities\u2026" : "One community for selected\u2026" }),
                selectableCommunities.map((c2) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("option", { value: c2.id, children: c2.name }, c2.id))
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(
            "button",
            {
              type: "button",
              onClick: applyCommunityToSelected,
              disabled: busy || !bulkCommunityId || !selectedRowIndexes.size,
              className: "px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40",
              children: [
                "Apply community (",
                selectedRowIndexes.size,
                ")"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex flex-col sm:flex-row gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
            "input",
            {
              type: "text",
              value: bulkLocation,
              onChange: (e2) => setBulkLocation(e2.target.value),
              disabled: busy,
              placeholder: "One pickup address for selected\u2026",
              className: "flex-1 min-w-0 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(
            "button",
            {
              type: "button",
              onClick: applyLocationToSelected,
              disabled: busy || !String(bulkLocation || "").trim() || !selectedRowIndexes.size,
              className: "px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40",
              children: [
                "Apply address (",
                selectedRowIndexes.size,
                ")"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex flex-col sm:flex-row gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(
            "select",
            {
              value: bulkCategory,
              onChange: (e2) => setBulkCategory(e2.target.value),
              disabled: busy,
              className: "flex-1 min-w-0 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("option", { value: "", children: "Category (optional)\u2026" }),
                CATEGORIES.map((c2) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("option", { value: c2, children: c2 }, c2))
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
            "input",
            {
              type: "date",
              value: bulkExpiry,
              onChange: (e2) => setBulkExpiry(e2.target.value),
              disabled: busy,
              className: "flex-1 min-w-0 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
            "button",
            {
              type: "button",
              onClick: () => {
                if (bulkCategory) applyCategoryToSelected();
                if (bulkExpiry) applyExpiryToSelected();
              },
              disabled: busy || !selectedRowIndexes.size || !bulkCategory && !bulkExpiry,
              className: "px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40",
              children: "Apply"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
          "button",
          {
            type: "button",
            onClick: applyAllMissingToSelected,
            disabled: busy || !selectedRowIndexes.size || !String(bulkCommunityId || "").trim() && !String(bulkLocation || "").trim() && !bulkCategory && !bulkExpiry,
            className: "w-full px-3 py-2 rounded-lg text-xs font-semibold border border-cyan-300 bg-cyan-50 text-cyan-900 hover:bg-cyan-100 disabled:opacity-40",
            children: fillEmptyOnly ? `Apply all to empty fields (${selectedRowIndexes.size} rows)` : `Apply all to selected (${selectedRowIndexes.size})`
          }
        )
      ] }),
      communitiesError && /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "text-xs text-amber-700 flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { children: communitiesError }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("button", { type: "button", onClick: loadCommunities, className: "underline", children: "Retry" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "space-y-2 max-h-[28rem] overflow-y-auto pr-1", children: rows.map((row, idx) => /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(
        "div",
        {
          className: "rounded-xl border border-gray-200 bg-white p-3 flex gap-2 shadow-sm",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
              "input",
              {
                type: "checkbox",
                checked: selectedRowIndexes.has(idx),
                onChange: () => {
                  setSelectedRowIndexes((prev) => {
                    const next = new Set(prev);
                    if (next.has(idx)) next.delete(idx);
                    else next.add(idx);
                    return next;
                  });
                },
                disabled: busy,
                className: "mt-1 rounded border-gray-300 text-emerald-600",
                "aria-label": `Select row ${idx + 1}`
              }
            ),
            row.image_url && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
              "img",
              {
                src: row.image_url,
                alt: "",
                className: "w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0",
                onError: (e2) => {
                  e2.target.style.display = "none";
                }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex-1 min-w-0 space-y-1.5", children: [
              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
                "input",
                {
                  type: "text",
                  value: row.title || "",
                  onChange: (e2) => updateRow(idx, { title: e2.target.value }),
                  disabled: busy,
                  className: "w-full text-sm font-medium border border-gray-200 rounded-md px-2 py-1",
                  "aria-label": `Row ${idx + 1} title`
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex flex-wrap gap-1.5 text-xs", children: [
                /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
                  "input",
                  {
                    type: "number",
                    min: "0",
                    step: "0.1",
                    value: row.quantity ?? "",
                    onChange: (e2) => updateRow(idx, { quantity: Number(e2.target.value) }),
                    disabled: busy,
                    className: "w-16 border border-gray-200 rounded-md px-1.5 py-1",
                    "aria-label": "Quantity"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
                  "input",
                  {
                    type: "text",
                    value: row.unit || "",
                    onChange: (e2) => updateRow(idx, { unit: e2.target.value }),
                    disabled: busy,
                    className: "w-16 border border-gray-200 rounded-md px-1.5 py-1",
                    "aria-label": "Unit"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
                  "select",
                  {
                    value: row.category || "other",
                    onChange: (e2) => updateRow(idx, { category: e2.target.value }),
                    disabled: busy,
                    className: "border border-gray-200 rounded-md px-1.5 py-1",
                    "aria-label": "Category",
                    children: CATEGORIES.map((c2) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("option", { value: c2, children: c2 }, c2))
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs", children: [
                /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
                  "input",
                  {
                    type: "text",
                    value: row.location || "",
                    onChange: (e2) => updateRow(idx, { location: e2.target.value }),
                    disabled: busy,
                    placeholder: "Pickup address",
                    className: "border border-gray-200 rounded-md px-1.5 py-1"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
                  "input",
                  {
                    type: "date",
                    value: row.expiry_date || "",
                    onChange: (e2) => updateRow(idx, { expiry_date: e2.target.value }),
                    disabled: busy,
                    className: "border border-gray-200 rounded-md px-1.5 py-1"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(
                  "select",
                  {
                    value: row.community_id || "",
                    onChange: (e2) => {
                      const id = e2.target.value || "";
                      const match = selectableCommunities.find((c2) => String(c2.id) === String(id));
                      updateRow(idx, {
                        community_id: id || void 0,
                        community_name: match?.name
                      });
                    },
                    disabled: busy || communitiesLoading,
                    className: `border rounded-md px-1.5 py-1 ${row.community_id ? "border-gray-200" : "border-amber-400"}`,
                    required: true,
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("option", { value: "", children: "Choose school or community\u2026" }),
                      selectableCommunities.map((c2) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("option", { value: c2.id, children: c2.name }, c2.id))
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
              "button",
              {
                type: "button",
                onClick: () => removeRow(idx),
                disabled: busy,
                className: "text-gray-400 hover:text-rose-500 self-start p-1 disabled:opacity-40",
                "aria-label": `Remove row ${idx + 1}`,
                children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("i", { className: "fas fa-times", "aria-hidden": "true" })
              }
            )
          ]
        },
        `bulk-row-${idx}`
      )) }),
      missingCommunity && /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "text-sm text-amber-700", children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("i", { className: "fas fa-triangle-exclamation mr-1", "aria-hidden": "true" }),
        "Choose a school or community for each row (use Apply community above to set them all at once)."
      ] }),
      apiErrors.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 space-y-1", children: apiErrors.map((err, i2) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { children: typeof err === "string" ? err : err?.error || err?.message || JSON.stringify(err) }, i2)) }),
      /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "flex flex-wrap gap-2 pt-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
          "button",
          {
            type: "button",
            onClick: reset,
            disabled: busy,
            className: "px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
          "button",
          {
            type: "button",
            onClick: handleConfirm,
            disabled: busy || enriching || !rows.length || missingCommunity,
            className: "px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 shadow-sm",
            children: busy ? "Publishing\u2026" : `Publish ${rows.length} listing${rows.length === 1 ? "" : "s"}`
          }
        )
      ] })
    ] })
  ] });
}
ShareBulkCsvPanel.propTypes = {
  userId: import_prop_types5.default.oneOfType([import_prop_types5.default.string, import_prop_types5.default.number]),
  preferredCommunityId: import_prop_types5.default.oneOfType([import_prop_types5.default.string, import_prop_types5.default.number]),
  preferredLocation: import_prop_types5.default.string,
  lockToUserCommunity: import_prop_types5.default.bool,
  onSuccess: import_prop_types5.default.func
};
var ShareBulkCsvPanel_default = ShareBulkCsvPanel;

// src/food/VoiceLocationSearch.jsx
var import_react18 = __toESM(require_react(), 1);
var import_prop_types6 = __toESM(require_prop_types(), 1);

// utils/openaiVoice.js
function getToken3() {
  return localStorage.getItem("auth_token") || localStorage.getItem("token") || "";
}
async function transcribeAudio(blob) {
  const token = getToken3();
  const fd = new FormData();
  fd.append("audio", blob, "voice.webm");
  const res = await fetch("/api/ai/transcribe", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  if (data.filtered) return "";
  return data.transcript || "";
}

// utils/hooks/useLocation.js
var import_react17 = __toESM(require_react(), 1);
function useEffectiveLocation() {
  const [location, setLocation] = (0, import_react17.useState)(null);
  const [error, setError] = (0, import_react17.useState)(null);
  const enableLocation = (0, import_react17.useCallback)(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setError(null);
      },
      (err) => setError(err.message || "Location denied"),
      { enableHighAccuracy: true, timeout: 15e3 }
    );
  }, []);
  const refreshLocation = enableLocation;
  (0, import_react17.useEffect)(() => {
    enableLocation();
  }, [enableLocation]);
  return { location, error, enableLocation, refreshLocation };
}

// src/food/VoiceLocationSearch.jsx
var import_jsx_runtime15 = __toESM(require_jsx_runtime(), 1);
var URGENCY_BADGE = {
  critical: "bg-red-100 text-red-700 ring-red-200",
  expired: "bg-red-100 text-red-700 ring-red-200",
  high: "bg-amber-100 text-amber-700 ring-amber-200",
  medium: "bg-yellow-50 text-yellow-700 ring-yellow-200",
  normal: "bg-emerald-50 text-emerald-700 ring-emerald-200"
};
var URGENCY_LABEL = {
  critical: "Critical",
  expired: "Expired",
  high: "High urgency",
  medium: "Soon",
  normal: "Plenty of time"
};
var QUICK_SEARCHES = [
  { label: "Vegan nearby", query: "vegan food nearby" },
  { label: "Expiring soon", query: "food expiring soon nearby" },
  { label: "Fresh produce", query: "fresh produce nearby" },
  { label: "Prepared meals", query: "prepared meals nearby" },
  { label: "Gluten-free", query: "gluten-free food nearby" }
];
var RADIUS_OPTIONS = [5, 10, 25, 50, 100];
var MAX_RECORD_MS = 3e4;
var SILENCE_MS = 1500;
function WaveformBars({ level = 0, active = false, bars = 5 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "vls-waveform", "aria-hidden": "true", children: Array.from({ length: bars }).map((_2, i2) => {
    const phase = i2 / bars * Math.PI;
    const scale = active ? 0.25 + level * 0.75 * (0.6 + 0.4 * Math.sin(phase + level * 6)) : 0.2;
    return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
      "span",
      {
        className: "vls-waveform-bar",
        style: { transform: `scaleY(${Math.min(1, Math.max(0.15, scale))})` }
      },
      i2
    );
  }) });
}
function VoiceLocationSearch({
  className = "",
  defaultRadiusKm = 25,
  onResultSelect = null,
  embedded = false
}) {
  const { user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const { location, error: locationError, enableLocation, refreshLocation } = useEffectiveLocation();
  const [typedQuery, setTypedQuery] = import_react18.default.useState("");
  const [radiusKm, setRadiusKm] = import_react18.default.useState(defaultRadiusKm);
  const [isRecording, setIsRecording] = import_react18.default.useState(false);
  const [isSearching, setIsSearching] = import_react18.default.useState(false);
  const [recordingError, setRecordingError] = import_react18.default.useState(null);
  const [searchResult, setSearchResult] = import_react18.default.useState(null);
  const [lastError, setLastError] = import_react18.default.useState(null);
  const [lastErrorMeta, setLastErrorMeta] = import_react18.default.useState(null);
  const [audioLevel, setAudioLevel] = import_react18.default.useState(0);
  const mediaRecorderRef = import_react18.default.useRef(null);
  const chunksRef = import_react18.default.useRef([]);
  const streamRef = import_react18.default.useRef(null);
  const silenceTimerRef = import_react18.default.useRef(null);
  const maxDurationTimerRef = import_react18.default.useRef(null);
  const rafRef = import_react18.default.useRef(null);
  const stopRecording = import_react18.default.useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    } catch (_err) {
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t3) => t3.stop());
      streamRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }
    setIsRecording(false);
    setAudioLevel(0);
  }, []);
  import_react18.default.useEffect(() => () => stopRecording(), [stopRecording]);
  const runSearch = import_react18.default.useCallback(async (transcript) => {
    const cleaned = (transcript || "").trim();
    if (!cleaned) {
      setLastError("Please say or type what you are looking for.");
      return;
    }
    if (!user?.id) {
      setLastError("Sign in to use voice search.");
      return;
    }
    setLastError(null);
    setLastErrorMeta(null);
    setRecordingError(null);
    setIsSearching(true);
    try {
      const result = await aiChatService_default.voiceSearch(user.id, {
        transcript: cleaned,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        maxDistanceKm: Number(radiusKm) || defaultRadiusKm,
        limit: 8
      });
      setSearchResult(result);
    } catch (err) {
      setLastError(err?.message || "Search failed. Try again.");
      setLastErrorMeta(err?.aiError || null);
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  }, [user?.id, location, radiusKm, defaultRadiusKm]);
  const handleAudioBlob = import_react18.default.useCallback(async (blob) => {
    if (!blob || blob.size < 2e3) {
      setRecordingError("Didn't catch that \u2014 try speaking a bit longer.");
      return;
    }
    setRecordingError(null);
    setIsSearching(true);
    try {
      const transcript = await transcribeAudio(blob);
      if (!transcript || !transcript.trim()) {
        setRecordingError("Couldn't understand the audio. Try again.");
        setIsSearching(false);
        return;
      }
      setTypedQuery(transcript);
      await runSearch(transcript);
    } catch (err) {
      setRecordingError(err?.message || "Transcription failed.");
      setIsSearching(false);
    }
  }, [runSearch]);
  const startRecording = async () => {
    if (isRecording) return;
    setRecordingError(null);
    setLastError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setRecordingError("Microphone not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = createMediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (evt) => {
        if (evt.data && evt.data.size > 0) chunksRef.current.push(evt.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        handleAudioBlob(blob);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      maxDurationTimerRef.current = setTimeout(stopRecording, MAX_RECORD_MS);
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        let silentSince = null;
        const tick = () => {
          if (!streamRef.current) {
            try {
              audioCtx.close();
            } catch (_e) {
            }
            return;
          }
          analyser.getByteTimeDomainData(data);
          let max = 0;
          for (let i2 = 0; i2 < data.length; i2++) {
            const v2 = Math.abs(data[i2] - 128);
            if (v2 > max) max = v2;
          }
          setAudioLevel(Math.min(1, max / 32));
          if (max < 5) {
            if (!silentSince) silentSince = Date.now();
            else if (Date.now() - silentSince > SILENCE_MS) {
              stopRecording();
              try {
                audioCtx.close();
              } catch (_e) {
              }
              return;
            }
          } else {
            silentSince = null;
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      }
    } catch (err) {
      setRecordingError(err?.message || "Microphone permission denied.");
      stopRecording();
    }
  };
  const onSubmit = (evt) => {
    evt.preventDefault();
    runSearch(typedQuery);
  };
  const applyQuickSearch = (query) => {
    setTypedQuery(query);
    runSearch(query);
  };
  const openListing = (id, result = null) => {
    if (!id) return;
    if (typeof onResultSelect === "function") {
      onResultSelect(id, result);
      return;
    }
    navigate(`/find?listing=${encodeURIComponent(id)}`);
  };
  const hasLocation = !!(location?.latitude && location?.longitude);
  const busy = isSearching && !isRecording;
  const micDisabled = busy || !isAuthenticated;
  const statusLine = isRecording ? "Listening\u2026 tap the mic when you're done" : isSearching ? "Finding food that matches your request" : "Tap the mic and describe what you need";
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
    "section",
    {
      className: `vls-card relative overflow-hidden ${embedded ? "" : "rounded-2xl shadow-md border border-gray-100/80"} ${className}`,
      "aria-label": "Voice and location food search",
      children: [
        !embedded && /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("header", { className: "relative z-10 flex items-center justify-between gap-3 px-5 py-3.5 border-b border-white/60 bg-white/50 backdrop-blur-sm", children: [
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "min-w-0", children: /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "flex items-center gap-2 text-gray-900", children: [
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2CABE3]/15 text-[#2CABE3]", children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("i", { className: "fas fa-microphone-lines text-sm", "aria-hidden": "true" }) }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("h2", { className: "text-sm font-semibold leading-tight", children: "Search with your voice" }),
              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("p", { className: "text-[11px] text-gray-500 mt-0.5", children: "Speak naturally \u2014 we rank by urgency & distance" })
            ] })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "flex items-center gap-1.5 shrink-0", children: hasLocation ? /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(import_jsx_runtime15.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { className: "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200/80", children: [
              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse", "aria-hidden": "true" }),
              "GPS on"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
              "button",
              {
                type: "button",
                onClick: refreshLocation,
                className: "inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-white hover:text-[#2CABE3] transition",
                "aria-label": "Refresh location",
                children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("i", { className: "fas fa-rotate text-xs", "aria-hidden": "true" })
              }
            )
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
            "button",
            {
              type: "button",
              onClick: enableLocation,
              className: "inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100 transition",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("i", { className: "fas fa-location-crosshairs", "aria-hidden": "true" }),
                "Enable GPS"
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "relative z-10 px-4 sm:px-5 py-4 sm:py-5 space-y-4", children: [
          !isAuthenticated && /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3.5 py-3 text-sm text-amber-900", children: [
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("i", { className: "fas fa-user-lock mt-0.5 text-amber-600", "aria-hidden": "true" }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("p", { className: "font-medium", children: "Sign in to search with your voice" }),
              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("p", { className: "text-xs text-amber-800/80 mt-0.5", children: "We use your account to rank listings near you." })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
              "button",
              {
                type: "button",
                onClick: () => navigate("/login"),
                className: "shrink-0 inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700",
                children: "Log in"
              }
            )
          ] }),
          embedded && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "flex flex-wrap items-center justify-center gap-2", children: hasLocation ? /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200/80", children: [
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse", "aria-hidden": "true" }),
            "Using your location"
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
            "button",
            {
              type: "button",
              onClick: enableLocation,
              className: "inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("i", { className: "fas fa-location-crosshairs", "aria-hidden": "true" }),
                "Use my location for nearby results"
              ]
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "vls-mic-zone", children: [
            /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "vls-mic-orb-wrap", children: [
              isRecording && /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(import_jsx_runtime15.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "vls-mic-ring animate-voice-ring-1", "aria-hidden": "true" }),
                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "vls-mic-ring animate-voice-ring-2", "aria-hidden": "true" }),
                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
                  "span",
                  {
                    className: "vls-mic-ring",
                    style: { transform: `scale(${1 + audioLevel * 0.35})`, opacity: 0.5 + audioLevel * 0.4 },
                    "aria-hidden": "true"
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
                "button",
                {
                  type: "button",
                  onClick: isRecording ? stopRecording : startRecording,
                  disabled: micDisabled,
                  className: `vls-mic-orb ${isRecording ? "vls-mic-orb--recording" : ""}`,
                  style: isRecording ? { transform: `scale(${1 + audioLevel * 0.06})` } : void 0,
                  "aria-pressed": isRecording,
                  "aria-label": isRecording ? "Stop recording" : "Start voice search",
                  children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("i", { className: `fas ${isRecording ? "fa-stop" : "fa-microphone"}`, "aria-hidden": "true" })
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(WaveformBars, { level: audioLevel, active: isRecording }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("p", { className: "text-base font-semibold text-gray-900 text-center", children: statusLine }),
            !isRecording && !isSearching && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("p", { className: "text-xs text-gray-500 text-center max-w-xs", children: "Try a Quick Search below, or speak naturally \u2014 e.g. \u201Cvegan meals expiring soon\u201D." }),
            isRecording && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("p", { className: "text-xs text-gray-500 text-center max-w-xs", children: "Pause briefly when finished \u2014 we\u2019ll stop automatically." })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("p", { className: "text-xs font-medium text-gray-600 px-0.5", children: "Search within" }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "flex flex-wrap gap-1.5", role: "group", "aria-label": "Search radius", children: RADIUS_OPTIONS.map((km) => /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
              "button",
              {
                type: "button",
                disabled: isRecording || busy,
                onClick: () => setRadiusKm(km),
                className: `vls-radius-pill ${radiusKm === km ? "vls-radius-pill--active" : ""}`,
                "aria-pressed": radiusKm === km,
                children: [
                  km,
                  " km"
                ]
              },
              km
            )) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("p", { className: "text-xs font-medium text-gray-600 px-0.5", children: "Quick searches" }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "flex flex-wrap gap-1.5", children: QUICK_SEARCHES.map(({ label, query }) => /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
              "button",
              {
                type: "button",
                disabled: busy || isRecording || !isAuthenticated,
                onClick: () => applyQuickSearch(query),
                className: "vls-chip",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("i", { className: "fas fa-bolt text-[9px] text-[#2CABE3]", "aria-hidden": "true" }),
                  label
                ]
              },
              label
            )) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("form", { onSubmit, className: "space-y-1.5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("label", { htmlFor: "vls-query", className: "text-xs font-medium text-gray-600 px-0.5 block", children: "Or type your search" }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "flex flex-col sm:flex-row gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "relative flex-1", children: [
                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("i", { className: "fas fa-keyboard absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none", "aria-hidden": "true" }),
                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
                  "input",
                  {
                    id: "vls-query",
                    type: "text",
                    value: typedQuery,
                    onChange: (e2) => setTypedQuery(e2.target.value),
                    placeholder: "e.g. dairy-free snacks nearby",
                    className: "w-full rounded-xl border border-gray-200 bg-white/90 pl-9 pr-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2CABE3]/35 focus:border-[#2CABE3]/50",
                    disabled: isRecording
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
                "button",
                {
                  type: "submit",
                  disabled: busy || !typedQuery.trim() || !isAuthenticated,
                  className: "inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed transition",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("i", { className: `fas ${busy ? "fa-spinner fa-spin" : "fa-magnifying-glass"}`, "aria-hidden": "true" }),
                    busy ? "Searching\u2026" : "Search"
                  ]
                }
              )
            ] })
          ] }),
          (recordingError || locationError || lastError) && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "rounded-xl border border-red-100 bg-red-50/90 px-3.5 py-3 text-sm text-red-800", role: "alert", children: /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("i", { className: "fas fa-circle-exclamation mt-0.5 text-red-500 shrink-0", "aria-hidden": "true" }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("p", { children: recordingError || lastError || locationError }),
              lastErrorMeta?.code && /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("p", { className: "mt-1 text-[10px] text-red-600/80", children: [
                lastErrorMeta.code,
                lastErrorMeta.requestId ? ` \xB7 ${lastErrorMeta.requestId.slice(0, 8)}` : ""
              ] }),
              lastError && (lastErrorMeta?.retryable ?? true) && /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
                "button",
                {
                  type: "button",
                  onClick: () => runSearch(typedQuery),
                  disabled: busy || !typedQuery.trim(),
                  className: "mt-2 inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-red-700 disabled:opacity-50",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("i", { className: `fas fa-${busy ? "spinner fa-spin" : "redo"}`, "aria-hidden": "true" }),
                    "Retry"
                  ]
                }
              )
            ] })
          ] }) }),
          !hasLocation && !locationError && isAuthenticated && /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("p", { className: "text-xs text-gray-500 text-center", children: [
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("i", { className: "fas fa-lightbulb text-amber-500 mr-1", "aria-hidden": "true" }),
            "Enable GPS to sort results by how close they are to you."
          ] }),
          isSearching && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
            AIThinkingPanel,
            {
              title: "Voice search",
              stages: [
                { icon: "microphone-lines", label: "Transcribing your voice" },
                { icon: "brain", label: "Understanding your request" },
                { icon: "location-crosshairs", label: "Scanning nearby food" },
                { icon: "ranking-star", label: "Ranking by urgency & distance" }
              ]
            }
          ),
          searchResult && !isSearching && /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "space-y-3 pt-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "flex items-end justify-between gap-3 border-t border-gray-100 pt-4", children: [
              /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-[#2CABE3]", children: "Results" }),
                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("p", { className: "text-sm font-semibold text-gray-900 mt-0.5", children: searchResult.headline })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { className: "shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600", children: [
                searchResult.totalMatched,
                " match",
                searchResult.totalMatched === 1 ? "" : "es"
              ] })
            ] }),
            searchResult.results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "rounded-xl border border-dashed border-gray-200 bg-white/60 px-4 py-8 text-center", children: [
              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3", children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("i", { className: "fas fa-search text-lg", "aria-hidden": "true" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("p", { className: "text-sm font-medium text-gray-700", children: "No listings matched" }),
              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("p", { className: "text-xs text-gray-500 mt-1 max-w-xs mx-auto", children: "Widen your radius or try different words like \u201Cproduce\u201D or \u201Cexpires today\u201D." }),
              /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
                "button",
                {
                  type: "button",
                  onClick: () => setRadiusKm(Math.min(100, radiusKm * 2 || 50)),
                  className: "mt-3 inline-flex items-center gap-1 rounded-lg bg-[#2CABE3] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("i", { className: "fas fa-expand-arrows-alt", "aria-hidden": "true" }),
                    "Widen to ",
                    Math.min(100, radiusKm * 2 || 50),
                    " km"
                  ]
                }
              )
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("ul", { className: "space-y-2.5", children: searchResult.results.map((r3, idx) => {
              const badgeClass = URGENCY_BADGE[r3.urgency_label] || URGENCY_BADGE.normal;
              const isTop = idx < 3;
              return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
                "button",
                {
                  type: "button",
                  onClick: () => openListing(r3.id, r3),
                  className: "vls-result-card w-full text-left flex items-start gap-3 rounded-xl border border-gray-100 bg-white/90 p-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2CABE3]/40",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: `vls-result-rank ${isTop ? "vls-result-rank--top" : ""}`, children: idx + 1 }),
                    r3.image_url ? /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
                      "img",
                      {
                        src: r3.image_url,
                        alt: "",
                        className: "h-14 w-14 flex-shrink-0 rounded-lg object-cover ring-1 ring-gray-100"
                      }
                    ) : /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "h-14 w-14 flex-shrink-0 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-400 ring-1 ring-gray-100", children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("i", { className: "fas fa-utensils", "aria-hidden": "true" }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "flex items-start justify-between gap-2", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("h3", { className: "text-sm font-semibold text-gray-900 line-clamp-1", children: r3.title || "Untitled listing" }),
                        /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: `inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${badgeClass}`, children: URGENCY_LABEL[r3.urgency_label] || r3.urgency_label })
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("p", { className: "mt-0.5 text-xs text-gray-500 line-clamp-2", children: r3.description || r3.location || "No description" }),
                      /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-600", children: [
                        r3.distance_km != null && /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { className: "inline-flex items-center gap-1 font-medium text-[#2CABE3]", children: [
                          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("i", { className: "fas fa-route", "aria-hidden": "true" }),
                          r3.distance_km,
                          " km away"
                        ] }),
                        r3.hours_until_deadline != null && /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { className: "inline-flex items-center gap-1 text-amber-700", children: [
                          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("i", { className: "fas fa-clock", "aria-hidden": "true" }),
                          r3.hours_until_deadline < 1 ? "<1h left" : `${Math.round(r3.hours_until_deadline)}h left`
                        ] }),
                        r3.quantity && /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { children: [
                          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("i", { className: "fas fa-box-open mr-1 text-gray-400", "aria-hidden": "true" }),
                          r3.quantity,
                          r3.unit ? ` ${r3.unit}` : ""
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("i", { className: "fas fa-chevron-right text-gray-300 text-xs mt-1 shrink-0", "aria-hidden": "true" })
                  ]
                }
              ) }, r3.id);
            }) })
          ] })
        ] })
      ]
    }
  );
}
VoiceLocationSearch.propTypes = {
  className: import_prop_types6.default.string,
  defaultRadiusKm: import_prop_types6.default.number,
  onResultSelect: import_prop_types6.default.func,
  embedded: import_prop_types6.default.bool
};

// src/food/AIRecipePanel.jsx
var import_react19 = __toESM(require_react(), 1);
var import_prop_types7 = __toESM(require_prop_types(), 1);
var import_jsx_runtime16 = __toESM(require_jsx_runtime(), 1);
function AIRecipePanel({ className = "" }) {
  const { user, isAuthenticated } = useAuthContext();
  const [ingredientsText, setIngredientsText] = import_react19.default.useState("");
  const [useClaimed, setUseClaimed] = import_react19.default.useState(true);
  const [lowResource, setLowResource] = import_react19.default.useState(true);
  const [householdSize, setHouseholdSize] = import_react19.default.useState(2);
  const [maxRecipes, setMaxRecipes] = import_react19.default.useState(3);
  const [dietaryText, setDietaryText] = import_react19.default.useState("");
  const [notes, setNotes] = import_react19.default.useState("");
  const [loading, setLoading] = import_react19.default.useState(false);
  const [error, setError] = import_react19.default.useState(null);
  const [errorMeta, setErrorMeta] = import_react19.default.useState(null);
  const [result, setResult] = import_react19.default.useState(null);
  const [expandedIdx, setExpandedIdx] = import_react19.default.useState(null);
  const handleGenerate = async () => {
    if (!isAuthenticated || !user?.id) {
      setError("Please sign in to generate recipes.");
      setErrorMeta(null);
      return;
    }
    setLoading(true);
    setError(null);
    setErrorMeta(null);
    try {
      const explicit = ingredientsText.split(/[,\n]/).map((s2) => s2.trim()).filter(Boolean);
      const dietary = dietaryText.split(/[,\n]/).map((s2) => s2.trim()).filter(Boolean);
      const res = await aiChatService_default.recipes(user.id, {
        ingredients: explicit.length ? explicit : null,
        useClaimed: explicit.length ? false : useClaimed,
        lowResource,
        // The number input's min/max are browser hints only — a user
        // can paste arbitrary values. Clamp here so we don't ask the
        // LLM to plan meals for 999 people.
        householdSize: Math.min(20, Math.max(1, Number(householdSize) || 2)),
        maxRecipes: Math.min(5, Math.max(1, Number(maxRecipes) || 3)),
        dietaryOverrides: dietary.length ? dietary : null,
        notes: notes.trim() || null
      });
      setResult(res);
      setExpandedIdx(res.recipes?.length ? 0 : null);
    } catch (err) {
      const aiError = err?.aiError || null;
      setError(aiError?.message || err?.message || "Failed to generate recipes.");
      setErrorMeta(aiError ? {
        code: aiError.code || aiError.errorCode || null,
        retryable: !!aiError.retryable,
        requestId: aiError.requestId || err?.requestId || null
      } : null);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
    "section",
    {
      className: `bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden ${className}`,
      "aria-label": "AI recipe generator",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("header", { className: "px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "flex items-center gap-2 text-gray-800", children: [
          /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("i", { className: "fas fa-utensils text-amber-600", "aria-hidden": "true" }),
          /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("h2", { className: "text-sm font-semibold", children: "AI recipe ideas" }),
          /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "ml-2 text-xs text-gray-500", children: "household-aware \xB7 low-resource" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "px-5 py-4 space-y-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("label", { className: "block text-xs text-gray-600", children: [
              "Ingredients (comma or newline)",
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                "textarea",
                {
                  value: ingredientsText,
                  onChange: (e2) => setIngredientsText(e2.target.value),
                  rows: 2,
                  placeholder: useClaimed ? "Leave blank to use your claimed items" : "e.g. tomatoes, bread, lentils",
                  className: "mt-1 w-full rounded-md border border-gray-200 p-2 text-sm focus:border-amber-500 focus:ring focus:ring-amber-100"
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("label", { className: "block text-xs text-gray-600", children: [
              "Dietary restrictions (optional)",
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                "textarea",
                {
                  value: dietaryText,
                  onChange: (e2) => setDietaryText(e2.target.value),
                  rows: 2,
                  placeholder: "e.g. vegetarian, halal, gluten-free",
                  className: "mt-1 w-full rounded-md border border-gray-200 p-2 text-sm focus:border-amber-500 focus:ring focus:ring-amber-100"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "flex flex-wrap items-end gap-3 text-xs text-gray-700", children: [
            /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("label", { className: "inline-flex items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { children: "Household" }),
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                "input",
                {
                  type: "number",
                  min: 1,
                  max: 20,
                  value: householdSize,
                  onChange: (e2) => setHouseholdSize(e2.target.value),
                  className: "w-16 rounded border border-gray-200 px-2 py-1 text-sm"
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("label", { className: "inline-flex items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { children: "Recipes" }),
              /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
                "select",
                {
                  value: maxRecipes,
                  onChange: (e2) => setMaxRecipes(Number(e2.target.value)),
                  className: "rounded border border-gray-200 px-2 py-1 text-sm",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("option", { value: 1, children: "1" }),
                    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("option", { value: 2, children: "2" }),
                    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("option", { value: 3, children: "3" }),
                    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("option", { value: 4, children: "4" }),
                    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("option", { value: 5, children: "5" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("label", { className: "inline-flex items-center gap-2 cursor-pointer", children: [
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                "input",
                {
                  type: "checkbox",
                  checked: useClaimed,
                  onChange: (e2) => setUseClaimed(e2.target.checked),
                  className: "rounded text-amber-600 focus:ring-amber-500"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { children: "Use my claimed items" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("label", { className: "inline-flex items-center gap-2 cursor-pointer", children: [
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                "input",
                {
                  type: "checkbox",
                  checked: lowResource,
                  onChange: (e2) => setLowResource(e2.target.checked),
                  className: "rounded text-amber-600 focus:ring-amber-500"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { children: "Low-resource mode" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("label", { className: "block text-xs text-gray-600", children: [
            "Notes for the chef (optional)",
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
              "input",
              {
                value: notes,
                onChange: (e2) => setNotes(e2.target.value),
                placeholder: "e.g. no oven, kids-friendly, need leftovers",
                className: "mt-1 w-full rounded-md border border-gray-200 p-2 text-sm focus:border-amber-500 focus:ring focus:ring-amber-100"
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
              "button",
              {
                type: "button",
                onClick: handleGenerate,
                disabled: loading || !isAuthenticated,
                className: "inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:bg-gray-300",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("i", { className: `fas ${loading ? "fa-spinner animate-spin" : "fa-wand-magic-sparkles"}`, "aria-hidden": "true" }),
                  loading ? "Generating\u2026" : "Generate recipes"
                ]
              }
            ),
            result?.headline && !loading && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("p", { className: "text-xs text-gray-600 truncate", children: result.headline })
          ] }),
          error && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "min-w-0", children: [
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("p", { className: "font-medium leading-snug", children: error }),
              (errorMeta?.code || errorMeta?.requestId) && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("p", { className: "mt-0.5 text-[10px] text-red-500/80 truncate", children: [
                errorMeta?.code ? /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "uppercase", children: errorMeta.code }) : null,
                errorMeta?.code && errorMeta?.requestId ? " \xB7 " : null,
                errorMeta?.requestId ? /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("span", { children: [
                  "req ",
                  errorMeta.requestId
                ] }) : null
              ] })
            ] }),
            (errorMeta?.retryable ?? true) && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
              "button",
              {
                type: "button",
                onClick: handleGenerate,
                disabled: loading,
                className: "shrink-0 rounded-md bg-red-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-red-700 disabled:bg-red-300",
                children: "Retry"
              }
            )
          ] }) }),
          !isAuthenticated && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("p", { className: "text-xs text-gray-500", children: "Sign in to anchor recipes to your claimed pickups." }),
          loading && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
            AIThinkingPanel,
            {
              title: "AI recipe ideas",
              stages: [
                { icon: "basket-shopping", label: "Reading your claimed ingredients" },
                { icon: "leaf", label: "Matching dietary preferences" },
                { icon: "utensils", label: "Designing balanced meals" },
                { icon: "wand-magic-sparkles", label: "Plating your recipes" }
              ]
            }
          ),
          !loading && result?.recipes?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("ul", { className: "space-y-3 pt-2", children: result.recipes.map((r3, idx) => {
            const open = expandedIdx === idx;
            return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
              "li",
              {
                className: "rounded-lg border border-gray-100 bg-white",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
                    "button",
                    {
                      type: "button",
                      onClick: () => setExpandedIdx(open ? null : idx),
                      className: "flex w-full items-start justify-between gap-3 px-4 py-3 text-left",
                      "aria-expanded": open,
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "min-w-0", children: [
                          /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("h3", { className: "text-sm font-semibold text-gray-900 truncate", children: r3.title }),
                            /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("span", { className: "rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800", children: [
                              r3.cost_tier,
                              " cost"
                            ] }),
                            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700", children: r3.difficulty })
                          ] }),
                          r3.summary && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("p", { className: "mt-1 text-xs text-gray-600 line-clamp-2", children: r3.summary }),
                          /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-600", children: [
                            r3.servings && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("span", { children: [
                              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("i", { className: "fas fa-user-group mr-1 text-gray-400", "aria-hidden": "true" }),
                              r3.servings,
                              " servings"
                            ] }),
                            r3.time_minutes && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("span", { children: [
                              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("i", { className: "fas fa-clock mr-1 text-gray-400", "aria-hidden": "true" }),
                              r3.time_minutes,
                              " min"
                            ] }),
                            r3.dietary_tags?.slice(0, 3).map((t3) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 ring-1 ring-emerald-200", children: t3 }, t3))
                          ] })
                        ] }),
                        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("i", { className: `fas fa-chevron-${open ? "up" : "down"} text-gray-400 mt-1`, "aria-hidden": "true" })
                      ]
                    }
                  ),
                  open && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "border-t border-gray-100 px-4 py-3 text-sm text-gray-700 space-y-3", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("h4", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Ingredients" }),
                      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("ul", { className: "mt-1 list-disc pl-5 space-y-0.5 text-sm", children: r3.ingredients.map((ing, i2) => /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("li", { className: ing.optional ? "text-gray-500" : "", children: [
                        ing.quantity ? /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("span", { className: "text-gray-500", children: [
                          ing.quantity,
                          " "
                        ] }) : null,
                        ing.name,
                        ing.optional && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "ml-1 text-[10px] uppercase tracking-wide text-gray-400", children: "optional" })
                      ] }, i2)) })
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("h4", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Steps" }),
                      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("ol", { className: "mt-1 list-decimal pl-5 space-y-1 text-sm", children: r3.steps.map((s2, i2) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("li", { children: s2 }, i2)) })
                    ] }),
                    r3.equipment?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("p", { className: "text-xs text-gray-500", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "font-semibold uppercase tracking-wide", children: "Equipment:" }),
                      " ",
                      r3.equipment.join(", ")
                    ] }),
                    r3.tips && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("p", { className: "rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-200", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("i", { className: "fas fa-lightbulb mr-1", "aria-hidden": "true" }),
                      r3.tips
                    ] })
                  ] })
                ]
              },
              `${r3.title}-${idx}`
            );
          }) }),
          result && result.recipes?.length === 0 && !loading && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("p", { className: "text-xs text-gray-500", children: result.headline || "No recipes generated." })
        ] })
      ]
    }
  );
}
AIRecipePanel.propTypes = {
  className: import_prop_types7.default.string
};

// src/assistant/AIQueryPanel.jsx
var import_react20 = __toESM(require_react(), 1);
var import_prop_types8 = __toESM(require_prop_types(), 1);
var import_jsx_runtime17 = __toESM(require_jsx_runtime(), 1);
var SUGGESTIONS = [
  "How many active claims do I have?",
  "Show my listings that expire this week",
  "Find vegan produce nearby",
  "What is my impact summary?"
];
var ADMIN_SUGGESTIONS = [
  "How many recipients are signed up?",
  "List the 5 most recent pending claims",
  "Show recent failed broadcasts"
];
function AIQueryPanel({ className = "" }) {
  const { user, isAuthenticated, isAdmin } = useAuthContext();
  const [question, setQuestion] = import_react20.default.useState("");
  const [loading, setLoading] = import_react20.default.useState(false);
  const [error, setError] = import_react20.default.useState(null);
  const [errorMeta, setErrorMeta] = import_react20.default.useState(null);
  const [result, setResult] = import_react20.default.useState(null);
  const [showTrace, setShowTrace] = import_react20.default.useState(false);
  const submit = async (q2) => {
    const value = (q2 ?? question).trim();
    if (!value) return;
    if (!isAuthenticated || !user?.id) {
      setError("Please sign in to ask questions about your data.");
      setErrorMeta(null);
      return;
    }
    setLoading(true);
    setError(null);
    setErrorMeta(null);
    try {
      const res = await aiChatService_default.askQuery(user.id, value);
      setResult(res);
    } catch (err) {
      setError(err?.message || "Query failed.");
      setErrorMeta(err?.aiError || null);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = (e2) => {
    e2.preventDefault();
    submit();
  };
  const suggestions = isAdmin ? [...SUGGESTIONS, ...ADMIN_SUGGESTIONS] : SUGGESTIONS;
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
    "section",
    {
      className: `bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden ${className}`,
      "aria-label": "Natural language query",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("header", { className: "px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white", children: /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "flex items-center gap-2 text-gray-800", children: [
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("i", { className: "fas fa-database text-indigo-600", "aria-hidden": "true" }),
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("h2", { className: "text-sm font-semibold", children: "Ask about your data" }),
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "ml-2 text-xs text-gray-500", children: "function-calling \xB7 read-only" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "px-5 py-4 space-y-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("form", { onSubmit: handleSubmit, className: "flex flex-col sm:flex-row gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
              "input",
              {
                type: "text",
                value: question,
                onChange: (e2) => setQuestion(e2.target.value),
                placeholder: 'e.g. "How many pickups do I have this week?"',
                className: "flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring focus:ring-indigo-100",
                disabled: loading,
                maxLength: 500
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
              "button",
              {
                type: "submit",
                disabled: loading || !question.trim(),
                className: "inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-gray-300",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("i", { className: `fas ${loading ? "fa-spinner animate-spin" : "fa-paper-plane"}`, "aria-hidden": "true" }),
                  loading ? "Thinking\u2026" : "Ask"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "flex flex-wrap gap-2", children: suggestions.map((s2) => /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
            "button",
            {
              type: "button",
              onClick: () => {
                setQuestion(s2);
                submit(s2);
              },
              disabled: loading,
              className: "rounded-full bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 px-3 py-1 text-[11px] text-gray-700 transition",
              children: s2
            },
            s2
          )) }),
          error && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700", children: [
            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("p", { children: error }),
            errorMeta?.code && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("p", { className: "mt-1 text-[10px] text-red-500", children: [
              errorMeta.code,
              errorMeta.requestId ? ` \xB7 ${errorMeta.requestId.slice(0, 8)}` : ""
            ] }),
            (errorMeta?.retryable ?? true) && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
              "button",
              {
                type: "button",
                onClick: () => submit(),
                disabled: loading || !question.trim(),
                className: "mt-2 inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-red-700 disabled:opacity-50",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("i", { className: `fas fa-${loading ? "spinner fa-spin" : "redo"}`, "aria-hidden": "true" }),
                  "Retry"
                ]
              }
            )
          ] }),
          !isAuthenticated && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("p", { className: "text-xs text-gray-500", children: "Sign in to query your data." }),
          loading && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
            AIThinkingPanel,
            {
              title: "Querying your data",
              stages: [
                { icon: "magnifying-glass", label: "Parsing your question" },
                { icon: "database", label: "Selecting safe tools" },
                { icon: "bolt", label: "Running secure query" },
                { icon: "wand-magic-sparkles", label: "Composing answer" }
              ]
            }
          ),
          result && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("article", { className: "rounded-lg border border-indigo-100 bg-indigo-50/40 p-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("p", { className: "text-xs uppercase tracking-wide text-indigo-600 font-semibold mb-1", children: "Answer" }),
            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "text-sm text-gray-800 whitespace-pre-wrap", children: result.answer || "No answer." }),
            result.toolTrace?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "mt-3 border-t border-indigo-100 pt-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                "button",
                {
                  type: "button",
                  onClick: () => setShowTrace((v2) => !v2),
                  className: "text-[11px] text-indigo-700 hover:underline inline-flex items-center gap-1",
                  "aria-expanded": showTrace,
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("i", { className: `fas fa-chevron-${showTrace ? "up" : "down"}`, "aria-hidden": "true" }),
                    showTrace ? "Hide" : "Show",
                    " ",
                    result.toolTrace.length,
                    " tool call",
                    result.toolTrace.length === 1 ? "" : "s"
                  ]
                }
              ),
              showTrace && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("ul", { className: "mt-2 space-y-2", children: result.toolTrace.map((t3, idx) => /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                "li",
                {
                  className: "rounded-md bg-white ring-1 ring-gray-100 p-2 text-[11px] text-gray-700",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "rounded bg-indigo-100 px-1.5 py-0.5 font-mono text-indigo-700", children: t3.tool }),
                      t3.arguments && Object.keys(t3.arguments).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("code", { className: "truncate text-gray-500", children: JSON.stringify(t3.arguments) })
                    ] }),
                    t3.result_preview && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("pre", { className: "mt-1 whitespace-pre-wrap break-words text-gray-600", children: t3.result_preview })
                  ]
                },
                idx
              )) })
            ] })
          ] })
        ] })
      ]
    }
  );
}
AIQueryPanel.propTypes = {
  className: import_prop_types8.default.string
};

// src/common/AIHealthBanner.jsx
var import_react21 = __toESM(require_react(), 1);

// utils/services/aiSelfHealing.js
var AI_STATUS = {
  HEALTHY: "healthy",
  DEGRADED: "degraded",
  DOWN: "down"
};
var AiHealthMonitor = class {
  constructor() {
    this.status = { status: AI_STATUS.HEALTHY, lastCheck: null };
    this.listeners = /* @__PURE__ */ new Set();
    this._timer = null;
  }
  getStatus() {
    return this.status;
  }
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  _notify() {
    for (const fn of this.listeners) {
      try {
        fn(this.status);
      } catch (_2) {
      }
    }
  }
  async check() {
    try {
      const res = await fetch("/api/ai/health", { method: "GET" });
      if (!res.ok) throw new Error(`health ${res.status}`);
      const data = await res.json();
      const openaiOk = data.openai_configured !== false && data.status === "ok";
      const circuit = String(data.circuit_state || "closed").toLowerCase();
      let status = AI_STATUS.HEALTHY;
      if (!openaiOk) status = AI_STATUS.DOWN;
      else if (circuit === "open") status = AI_STATUS.DEGRADED;
      this.status = { status, lastCheck: Date.now(), detail: data };
    } catch (_2) {
      this.status = { status: AI_STATUS.DEGRADED, lastCheck: Date.now() };
    }
    this._notify();
  }
  start(intervalMs = 6e4) {
    this.check();
    if (this._timer) clearInterval(this._timer);
    this._timer = setInterval(() => this.check(), intervalMs);
  }
  stop() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
  }
};
var aiHealth = new AiHealthMonitor();
if (typeof window !== "undefined") {
  aiHealth.start();
}

// src/common/AIHealthBanner.jsx
var import_jsx_runtime18 = __toESM(require_jsx_runtime(), 1);
function AIHealthBanner() {
  const [status, setStatus] = (0, import_react21.useState)(aiHealth.getStatus());
  (0, import_react21.useEffect)(() => {
    const unsub = aiHealth.subscribe(setStatus);
    return unsub;
  }, []);
  if (!status || status.status === AI_STATUS.HEALTHY) return null;
  const isDown = status.status === AI_STATUS.DOWN;
  const title = isDown ? "Repairing AI link" : "Healing AI link";
  const subtitle = isDown ? "Reconnecting circuits to the neural backbone" : "Patching the connection in the background";
  const accent = isDown ? "from-rose-400 via-fuchsia-400 to-cyan-400" : "from-amber-300 via-cyan-300 to-violet-400";
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
    "div",
    {
      role: "status",
      "aria-live": "polite",
      "aria-label": `${title}. ${subtitle}`,
      className: "fixed top-4 right-4 z-[9999] w-[300px] max-w-[calc(100vw-2rem)] pointer-events-none",
      children: /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "ai-heal-card relative px-4 py-3 text-white pointer-events-auto", children: [
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: "ai-heal-scan", "aria-hidden": "true" }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "relative z-10 flex items-center gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "relative w-14 h-14 flex-shrink-0", "aria-hidden": "true", children: [
            /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(
              "svg",
              {
                viewBox: "0 0 56 56",
                className: "absolute inset-0 w-full h-full",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("defs", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("linearGradient", { id: "aiHealWire", x1: "0", y1: "0", x2: "1", y2: "0", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("stop", { offset: "0%", stopColor: "#22d3ee" }),
                      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("stop", { offset: "50%", stopColor: "#a78bfa" }),
                      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("stop", { offset: "100%", stopColor: "#ec4899" })
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("radialGradient", { id: "aiHealNode", cx: "0.5", cy: "0.5", r: "0.5", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("stop", { offset: "0%", stopColor: "#fff", stopOpacity: "1" }),
                      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("stop", { offset: "60%", stopColor: "#22d3ee", stopOpacity: "0.9" }),
                      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("stop", { offset: "100%", stopColor: "#22d3ee", stopOpacity: "0" })
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("path", { d: "M4 28 L18 28", stroke: "url(#aiHealWire)", strokeWidth: "2.5", strokeLinecap: "round", opacity: "0.85" }),
                  /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("path", { d: "M38 28 L52 28", stroke: "url(#aiHealWire)", strokeWidth: "2.5", strokeLinecap: "round", opacity: "0.85" }),
                  /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
                    "path",
                    {
                      d: "M18 28 L38 28",
                      stroke: "url(#aiHealWire)",
                      strokeWidth: "2.5",
                      strokeLinecap: "round",
                      fill: "none",
                      className: "ai-heal-weld"
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("circle", { cx: "4", cy: "28", r: "2.5", fill: "#22d3ee", className: "ai-heal-node" }),
                  /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("circle", { cx: "52", cy: "28", r: "2.5", fill: "#ec4899", className: "ai-heal-node" }),
                  /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
                    "circle",
                    {
                      cx: "28",
                      cy: "28",
                      r: "6",
                      fill: "url(#aiHealNode)",
                      style: { transformOrigin: "28px 28px" },
                      className: "ai-heal-flash"
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "absolute top-1/2 left-1/2 w-0 h-0", "aria-hidden": "true", children: [
              /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: "ai-heal-spark absolute top-0 left-0 w-1 h-1 rounded-full bg-cyan-300 shadow-[0_0_6px_rgba(34,211,238,1)]" }),
              /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: "ai-heal-spark absolute top-0 left-0 w-1 h-1 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(252,211,77,1)]" }),
              /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: "ai-heal-spark absolute top-0 left-0 w-1 h-1 rounded-full bg-fuchsia-300 shadow-[0_0_6px_rgba(232,121,249,1)]" }),
              /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: "ai-heal-spark absolute top-0 left-0 w-1 h-1 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,1)]" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "ai-heal-tool-orbit", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("i", { className: "fas fa-wrench text-[10px] text-cyan-200 ai-heal-tool-shake drop-shadow-[0_0_4px_rgba(34,211,238,0.9)]" }) }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "flex items-center gap-1.5", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: `text-[13px] font-semibold tracking-wide bg-gradient-to-r ${accent} bg-clip-text text-transparent`, children: title }) }),
            /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-300/90", children: [
              /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: "truncate", children: subtitle }),
              /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("span", { className: "inline-flex items-end gap-[2px] ml-0.5", children: [
                /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: "ai-heal-dot w-1 h-1 rounded-full bg-cyan-300" }),
                /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: "ai-heal-dot w-1 h-1 rounded-full bg-fuchsia-300" }),
                /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: "ai-heal-dot w-1 h-1 rounded-full bg-violet-300" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "relative z-10 mt-2 h-[3px] rounded-full bg-slate-700/60 overflow-hidden", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
          "div",
          {
            className: `h-full w-1/3 rounded-full bg-gradient-to-r ${accent}`,
            style: { animation: "ai-scan-sweep 1.6s linear infinite" }
          }
        ) })
      ] })
    }
  );
}
var AIHealthBanner_default = AIHealthBanner;

// src/common/AICaptionBar.jsx
var import_react22 = __toESM(require_react(), 1);

// utils/aiVoiceService.js
function subscribeAiVoice() {
  return () => {
  };
}

// src/common/AICaptionBar.jsx
var import_jsx_runtime19 = __toESM(require_jsx_runtime(), 1);
function AICaptionBar() {
  const { settings } = useAccessibility();
  const [caption, setCaption] = (0, import_react22.useState)("");
  const [speaking, setSpeaking] = (0, import_react22.useState)(false);
  (0, import_react22.useEffect)(() => {
    return subscribeAiVoice(({ captionText, isSpeaking }) => {
      setCaption(captionText || "");
      setSpeaking(isSpeaking);
    });
  }, []);
  if (!settings.alwaysShowCaptions || !caption) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
    "div",
    {
      className: "nouri-ai-caption-bar",
      role: "status",
      "aria-live": "polite",
      "aria-atomic": "true",
      "aria-label": speaking ? "AI is speaking" : "AI caption",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: "sr-only", children: speaking ? "Speaking: " : "Caption: " }),
        caption
      ]
    }
  );
}

// src/common/FormVoiceGuideHost.jsx
var import_react25 = __toESM(require_react(), 1);

// src/common/FormVoiceGuide.jsx
var import_react23 = __toESM(require_react(), 1);
var import_prop_types9 = __toESM(require_prop_types(), 1);
var import_jsx_runtime20 = __toESM(require_jsx_runtime(), 1);
function FormVoiceGuide({ guide, className = "" }) {
  const {
    welcomeMessage,
    activeHint,
    currentCaption,
    isMuted,
    isSpeaking,
    isDismissed,
    preferText,
    alwaysShowCaptions,
    toggleMute,
    speakWelcome,
    dismiss
  } = guide;
  if (isDismissed) return null;
  const showingField = Boolean(activeHint?.text);
  const displayText = currentCaption || (showingField ? activeHint.text : welcomeMessage);
  const showCaptionBlock = alwaysShowCaptions || preferText || isMuted;
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { id: FORM_GUIDE_DESC_ID, className: "sr-only", children: showingField ? activeHint.text : "" }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
      "div",
      {
        className: `relative flex items-start gap-3 rounded-xl border border-[#2CABE3]/40 bg-[#2CABE3]/10 px-4 py-3 shadow-sm ${className}`,
        role: "region",
        "aria-label": "AI form guide",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "flex-shrink-0 mt-0.5", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
            "div",
            {
              className: `w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${isSpeaking ? "bg-[#2CABE3] shadow-lg shadow-[#2CABE3]/40" : "bg-[#2CABE3]/15"}`,
              "aria-hidden": "true",
              children: isSpeaking ? /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "flex items-end gap-0.5 h-4", children: [1, 2, 3].map((i2) => /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
                "span",
                {
                  className: "w-1 bg-white rounded-full animate-bounce",
                  style: { height: `${8 + i2 * 4}px`, animationDelay: `${i2 * 0.12}s` }
                },
                i2
              )) }) : /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("i", { className: "fas fa-robot text-[#2CABE3] text-sm" })
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-xs font-semibold text-[#2CABE3] mb-0.5 uppercase tracking-wide", children: showingField ? activeHint.label || "Field help" : "AI guide" }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "p",
              {
                className: "text-sm text-gray-800 leading-snug",
                role: "status",
                "aria-live": "polite",
                "aria-atomic": "true",
                children: showingField ? activeHint.text : welcomeMessage
              }
            ),
            !showingField && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-xs text-gray-500 mt-1.5", children: "Click or tap any field for step-by-step help." }),
            showCaptionBlock && displayText && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
              "p",
              {
                className: "mt-2 text-sm font-medium text-gray-900 border-t border-[#2CABE3]/25 pt-2",
                "aria-label": "Caption",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "text-xs uppercase tracking-wide text-gray-500 mr-2", children: "Caption" }),
                  displayText
                ]
              }
            ),
            preferText && !isMuted && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "text-xs text-gray-600 mt-1", children: "Voice is off in accessibility settings. Text captions are shown instead." })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "button",
              {
                type: "button",
                onClick: speakWelcome,
                title: "Replay welcome",
                "aria-label": "Replay welcome message",
                className: "w-7 h-7 rounded-full flex items-center justify-center text-[#2CABE3] hover:bg-[#2CABE3]/15 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2CABE3]",
                children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("i", { className: "fas fa-redo text-xs", "aria-hidden": "true" })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "button",
              {
                type: "button",
                onClick: toggleMute,
                title: isMuted ? "Unmute voice guide" : "Mute voice guide",
                "aria-label": isMuted ? "Unmute voice guide" : "Mute voice guide",
                className: `w-7 h-7 rounded-full flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2CABE3] ${isMuted ? "bg-rose-100 text-rose-600 hover:bg-rose-200" : "text-gray-500 hover:bg-gray-100"}`,
                children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("i", { className: `fas ${isMuted ? "fa-volume-xmark" : "fa-volume-high"} text-xs`, "aria-hidden": "true" })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
              "button",
              {
                type: "button",
                onClick: dismiss,
                title: "Dismiss guide",
                "aria-label": "Dismiss voice guide",
                className: "w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500",
                children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("i", { className: "fas fa-xmark text-xs", "aria-hidden": "true" })
              }
            )
          ] })
        ]
      }
    )
  ] });
}
FormVoiceGuide.propTypes = {
  guide: import_prop_types9.default.shape({
    welcomeMessage: import_prop_types9.default.string,
    activeHint: import_prop_types9.default.shape({
      fieldName: import_prop_types9.default.string,
      label: import_prop_types9.default.string,
      text: import_prop_types9.default.string
    }),
    currentCaption: import_prop_types9.default.string,
    isMuted: import_prop_types9.default.bool,
    isSpeaking: import_prop_types9.default.bool,
    isDismissed: import_prop_types9.default.bool,
    preferText: import_prop_types9.default.bool,
    alwaysShowCaptions: import_prop_types9.default.bool,
    toggleMute: import_prop_types9.default.func,
    speakWelcome: import_prop_types9.default.func,
    dismiss: import_prop_types9.default.func
  }).isRequired,
  className: import_prop_types9.default.string
};

// utils/hooks/useFormVoiceGuide.js
var import_react24 = __toESM(require_react(), 1);
function useFormVoiceGuide({
  welcomeMessage = "",
  fieldHints = {},
  preferText = false,
  alwaysShowCaptions = true
} = {}) {
  const [activeField, setActiveField] = (0, import_react24.useState)(null);
  const [isMuted, setIsMuted] = (0, import_react24.useState)(false);
  const [isDismissed, setIsDismissed] = (0, import_react24.useState)(false);
  const [isSpeaking, setIsSpeaking] = (0, import_react24.useState)(false);
  const [currentCaption, setCurrentCaption] = (0, import_react24.useState)("");
  const activeHint = activeField && fieldHints[activeField] ? { text: fieldHints[activeField] } : null;
  const speak = (0, import_react24.useCallback)((text) => {
    if (!text || isMuted || typeof window === "undefined") return;
    setCurrentCaption(text);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utter);
    }
  }, [isMuted]);
  const speakField = (0, import_react24.useCallback)((fieldName) => {
    setActiveField(fieldName);
    const hint = fieldHints[fieldName];
    if (hint) speak(hint);
  }, [fieldHints, speak]);
  const speakWelcome = (0, import_react24.useCallback)(() => {
    if (welcomeMessage) speak(welcomeMessage);
  }, [welcomeMessage, speak]);
  const toggleMute = (0, import_react24.useCallback)(() => setIsMuted((m2) => !m2), []);
  const dismiss = (0, import_react24.useCallback)(() => {
    setIsDismissed(true);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);
  const reportError3 = (0, import_react24.useCallback)((message) => {
    speak(typeof message === "string" ? message : "Please check this field.");
  }, [speak]);
  const guide = (0, import_react24.useMemo)(() => ({
    welcomeMessage,
    activeHint,
    currentCaption,
    isMuted,
    isSpeaking,
    isDismissed,
    preferText,
    alwaysShowCaptions,
    toggleMute,
    speakWelcome,
    dismiss
  }), [
    welcomeMessage,
    activeHint,
    currentCaption,
    isMuted,
    isSpeaking,
    isDismissed,
    preferText,
    alwaysShowCaptions,
    toggleMute,
    speakWelcome,
    dismiss
  ]);
  return { guide, speakField, reportError: reportError3, speakWelcome, toggleMute, dismiss };
}

// src/common/FormVoiceGuideHost.jsx
var import_jsx_runtime21 = __toESM(require_jsx_runtime(), 1);
function FormVoiceGuideHost({
  welcomeMessage = "I can guide you through this form.",
  fieldHints = {},
  className = ""
}) {
  const { guide } = useFormVoiceGuide({ welcomeMessage, fieldHints });
  return /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(FormVoiceGuide, { guide, className });
}

// src/main.jsx
var import_jsx_runtime22 = __toESM(require_jsx_runtime(), 1);
var mountRoots = /* @__PURE__ */ new Map();
function NouriShell() {
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)(import_jsx_runtime22.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(AIHealthBanner_default, {}),
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(AICaptionBar, {}),
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(NouriGuideBar, {}),
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(AIChatPanel_default, {}),
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(Q, { position: "top-center", autoClose: 4e3, hideProgressBar: true, theme: "colored" })
  ] });
}
function Providers({ children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(AccessibilityProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(NouriGuideProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(MapProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(UIControlProvider, { children }) }) }) }) });
}
function mountChat(hostId) {
  let host = document.getElementById(hostId);
  if (!host) {
    host = document.createElement("div");
    host.id = hostId;
    document.body.appendChild(host);
  }
  if (mountRoots.has(hostId)) return mountRoots.get(hostId);
  const root = (0, import_client.createRoot)(host);
  mountRoots.set(hostId, root);
  root.render(
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(Providers, { children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(NouriShell, {}) })
  );
  return root;
}
function mountPanel(Component, hostId, props = {}) {
  let host = document.getElementById(hostId);
  if (!host) return null;
  if (mountRoots.has(hostId)) {
    mountRoots.get(hostId).render(
      /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(Providers, { children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(Component, { ...props }) })
    );
    return mountRoots.get(hostId);
  }
  const root = (0, import_client.createRoot)(host);
  mountRoots.set(hostId, root);
  root.render(
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(Providers, { children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(Component, { ...props }) })
  );
  return root;
}
function mountWithRetry(mountFn, attempts = 10, intervalMs = 500) {
  let tries = 0;
  const run = () => {
    tries += 1;
    const ok = mountFn();
    if (ok !== false || tries >= attempts) return;
    setTimeout(run, intervalMs);
  };
  run();
  window.addEventListener("load", run, { once: true });
}
window.FoodMapsNouri = {
  mountChat,
  mountPanel,
  mountWithRetry,
  RoleInsightsPanel: RoleInsightsPanel_default,
  ShareBulkCsvPanel: ShareBulkCsvPanel_default,
  VoiceLocationSearch,
  AIRecipePanel,
  AIQueryPanel,
  FormVoiceGuideHost,
  mountRoleInsights: (hostId, props) => mountPanel(RoleInsightsPanel_default, hostId, props),
  mountBulkCsv: (hostId, props) => mountPanel(ShareBulkCsvPanel_default, hostId, props),
  mountVoiceSearch: (hostId, props) => mountPanel(VoiceLocationSearch, hostId, props),
  mountRecipePanel: (hostId, props) => mountPanel(AIRecipePanel, hostId, props),
  mountQueryPanel: (hostId, props) => mountPanel(AIQueryPanel, hostId, props),
  mountFormVoiceGuide: (hostId, props) => mountPanel(FormVoiceGuideHost, hostId, props)
};
function bootNouriChat() {
  mountChat("nouri-ai-root");
}
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootNouriChat);
  } else {
    bootNouriChat();
  }
  window.addEventListener("load", bootNouriChat);
}
/*! Bundled license information:

react/cjs/react.production.min.js:
  (**
   * @license React
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

scheduler/cjs/scheduler.production.min.js:
  (**
   * @license React
   * scheduler.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.production.min.js:
  (**
   * @license React
   * react-dom.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.min.js:
  (**
   * @license React
   * react-jsx-runtime.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
