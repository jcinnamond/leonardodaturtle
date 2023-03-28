(() => {
  // output/Control.Semigroupoid/index.js
  var semigroupoidFn = {
    compose: function(f) {
      return function(g) {
        return function(x) {
          return f(g(x));
        };
      };
    }
  };

  // output/Control.Category/index.js
  var identity = function(dict) {
    return dict.identity;
  };
  var categoryFn = {
    identity: function(x) {
      return x;
    },
    Semigroupoid0: function() {
      return semigroupoidFn;
    }
  };

  // output/Data.Function/index.js
  var flip = function(f) {
    return function(b) {
      return function(a) {
        return f(a)(b);
      };
    };
  };
  var $$const = function(a) {
    return function(v) {
      return a;
    };
  };

  // output/Data.Unit/foreign.js
  var unit = void 0;

  // output/Data.Functor/index.js
  var map = function(dict) {
    return dict.map;
  };

  // output/Control.Apply/index.js
  var identity2 = /* @__PURE__ */ identity(categoryFn);
  var apply = function(dict) {
    return dict.apply;
  };
  var applySecond = function(dictApply) {
    var apply1 = apply(dictApply);
    var map5 = map(dictApply.Functor0());
    return function(a) {
      return function(b) {
        return apply1(map5($$const(identity2))(a))(b);
      };
    };
  };

  // output/Control.Applicative/index.js
  var pure = function(dict) {
    return dict.pure;
  };
  var liftA1 = function(dictApplicative) {
    var apply2 = apply(dictApplicative.Apply0());
    var pure1 = pure(dictApplicative);
    return function(f) {
      return function(a) {
        return apply2(pure1(f))(a);
      };
    };
  };

  // output/Control.Bind/index.js
  var bind = function(dict) {
    return dict.bind;
  };
  var bindFlipped = function(dictBind) {
    return flip(bind(dictBind));
  };

  // output/Data.Array/foreign.js
  var replicateFill = function(count) {
    return function(value12) {
      if (count < 1) {
        return [];
      }
      var result = new Array(count);
      return result.fill(value12);
    };
  };
  var replicatePolyfill = function(count) {
    return function(value12) {
      var result = [];
      var n = 0;
      for (var i = 0; i < count; i++) {
        result[n++] = value12;
      }
      return result;
    };
  };
  var replicate = typeof Array.prototype.fill === "function" ? replicateFill : replicatePolyfill;
  var fromFoldableImpl = function() {
    function Cons2(head, tail) {
      this.head = head;
      this.tail = tail;
    }
    var emptyList = {};
    function curryCons(head) {
      return function(tail) {
        return new Cons2(head, tail);
      };
    }
    function listToArray(list) {
      var result = [];
      var count = 0;
      var xs = list;
      while (xs !== emptyList) {
        result[count++] = xs.head;
        xs = xs.tail;
      }
      return result;
    }
    return function(foldr2) {
      return function(xs) {
        return listToArray(foldr2(curryCons)(emptyList)(xs));
      };
    };
  }();
  var sortByImpl = function() {
    function mergeFromTo(compare2, fromOrdering, xs1, xs2, from, to) {
      var mid;
      var i;
      var j;
      var k;
      var x;
      var y;
      var c;
      mid = from + (to - from >> 1);
      if (mid - from > 1)
        mergeFromTo(compare2, fromOrdering, xs2, xs1, from, mid);
      if (to - mid > 1)
        mergeFromTo(compare2, fromOrdering, xs2, xs1, mid, to);
      i = from;
      j = mid;
      k = from;
      while (i < mid && j < to) {
        x = xs2[i];
        y = xs2[j];
        c = fromOrdering(compare2(x)(y));
        if (c > 0) {
          xs1[k++] = y;
          ++j;
        } else {
          xs1[k++] = x;
          ++i;
        }
      }
      while (i < mid) {
        xs1[k++] = xs2[i++];
      }
      while (j < to) {
        xs1[k++] = xs2[j++];
      }
    }
    return function(compare2) {
      return function(fromOrdering) {
        return function(xs) {
          var out;
          if (xs.length < 2)
            return xs;
          out = xs.slice(0);
          mergeFromTo(compare2, fromOrdering, out, xs.slice(0), 0, xs.length);
          return out;
        };
      };
    };
  }();

  // output/Data.Semigroup/foreign.js
  var concatString = function(s1) {
    return function(s2) {
      return s1 + s2;
    };
  };

  // output/Data.Semigroup/index.js
  var semigroupString = {
    append: concatString
  };
  var append = function(dict) {
    return dict.append;
  };

  // output/Control.Monad/index.js
  var ap = function(dictMonad) {
    var bind3 = bind(dictMonad.Bind1());
    var pure3 = pure(dictMonad.Applicative0());
    return function(f) {
      return function(a) {
        return bind3(f)(function(f$prime) {
          return bind3(a)(function(a$prime) {
            return pure3(f$prime(a$prime));
          });
        });
      };
    };
  };

  // output/Data.Bounded/foreign.js
  var topChar = String.fromCharCode(65535);
  var bottomChar = String.fromCharCode(0);
  var topNumber = Number.POSITIVE_INFINITY;
  var bottomNumber = Number.NEGATIVE_INFINITY;

  // output/Data.Show/foreign.js
  var showNumberImpl = function(n) {
    var str = n.toString();
    return isNaN(str + ".0") ? str : str + ".0";
  };
  var showStringImpl = function(s) {
    var l = s.length;
    return '"' + s.replace(
      /[\0-\x1F\x7F"\\]/g,
      // eslint-disable-line no-control-regex
      function(c, i) {
        switch (c) {
          case '"':
          case "\\":
            return "\\" + c;
          case "\x07":
            return "\\a";
          case "\b":
            return "\\b";
          case "\f":
            return "\\f";
          case "\n":
            return "\\n";
          case "\r":
            return "\\r";
          case "	":
            return "\\t";
          case "\v":
            return "\\v";
        }
        var k = i + 1;
        var empty2 = k < l && s[k] >= "0" && s[k] <= "9" ? "\\&" : "";
        return "\\" + c.charCodeAt(0).toString(10) + empty2;
      }
    ) + '"';
  };

  // output/Data.Show/index.js
  var showString = {
    show: showStringImpl
  };
  var showNumber = {
    show: showNumberImpl
  };
  var show = function(dict) {
    return dict.show;
  };

  // output/Data.Maybe/index.js
  var Nothing = /* @__PURE__ */ function() {
    function Nothing2() {
    }
    ;
    Nothing2.value = new Nothing2();
    return Nothing2;
  }();
  var Just = /* @__PURE__ */ function() {
    function Just2(value0) {
      this.value0 = value0;
    }
    ;
    Just2.create = function(value0) {
      return new Just2(value0);
    };
    return Just2;
  }();

  // output/Data.Monoid/index.js
  var monoidString = {
    mempty: "",
    Semigroup0: function() {
      return semigroupString;
    }
  };
  var mempty = function(dict) {
    return dict.mempty;
  };

  // output/Effect/foreign.js
  var pureE = function(a) {
    return function() {
      return a;
    };
  };
  var bindE = function(a) {
    return function(f) {
      return function() {
        return f(a())();
      };
    };
  };

  // output/Effect/index.js
  var $runtime_lazy = function(name15, moduleName, init) {
    var state2 = 0;
    var val;
    return function(lineNumber) {
      if (state2 === 2)
        return val;
      if (state2 === 1)
        throw new ReferenceError(name15 + " was needed before it finished initializing (module " + moduleName + ", line " + lineNumber + ")", moduleName, lineNumber);
      state2 = 1;
      val = init();
      state2 = 2;
      return val;
    };
  };
  var monadEffect = {
    Applicative0: function() {
      return applicativeEffect;
    },
    Bind1: function() {
      return bindEffect;
    }
  };
  var bindEffect = {
    bind: bindE,
    Apply0: function() {
      return $lazy_applyEffect(0);
    }
  };
  var applicativeEffect = {
    pure: pureE,
    Apply0: function() {
      return $lazy_applyEffect(0);
    }
  };
  var $lazy_functorEffect = /* @__PURE__ */ $runtime_lazy("functorEffect", "Effect", function() {
    return {
      map: liftA1(applicativeEffect)
    };
  });
  var $lazy_applyEffect = /* @__PURE__ */ $runtime_lazy("applyEffect", "Effect", function() {
    return {
      apply: ap(monadEffect),
      Functor0: function() {
        return $lazy_functorEffect(0);
      }
    };
  });
  var functorEffect = /* @__PURE__ */ $lazy_functorEffect(20);
  var applyEffect = /* @__PURE__ */ $lazy_applyEffect(23);

  // output/Effect.Ref/foreign.js
  var _new = function(val) {
    return function() {
      return { value: val };
    };
  };
  var read = function(ref) {
    return function() {
      return ref.value;
    };
  };
  var write = function(val) {
    return function(ref) {
      return function() {
        ref.value = val;
      };
    };
  };

  // output/Effect.Ref/index.js
  var $$new = _new;

  // output/Data.Array.ST/foreign.js
  var pushAll = function(as) {
    return function(xs) {
      return function() {
        return xs.push.apply(xs, as);
      };
    };
  };
  var unsafeFreeze = function(xs) {
    return function() {
      return xs;
    };
  };
  function copyImpl(xs) {
    return function() {
      return xs.slice();
    };
  }
  var thaw = copyImpl;
  var sortByImpl2 = function() {
    function mergeFromTo(compare2, fromOrdering, xs1, xs2, from, to) {
      var mid;
      var i;
      var j;
      var k;
      var x;
      var y;
      var c;
      mid = from + (to - from >> 1);
      if (mid - from > 1)
        mergeFromTo(compare2, fromOrdering, xs2, xs1, from, mid);
      if (to - mid > 1)
        mergeFromTo(compare2, fromOrdering, xs2, xs1, mid, to);
      i = from;
      j = mid;
      k = from;
      while (i < mid && j < to) {
        x = xs2[i];
        y = xs2[j];
        c = fromOrdering(compare2(x)(y));
        if (c > 0) {
          xs1[k++] = y;
          ++j;
        } else {
          xs1[k++] = x;
          ++i;
        }
      }
      while (i < mid) {
        xs1[k++] = xs2[i++];
      }
      while (j < to) {
        xs1[k++] = xs2[j++];
      }
    }
    return function(compare2) {
      return function(fromOrdering) {
        return function(xs) {
          return function() {
            if (xs.length < 2)
              return xs;
            mergeFromTo(compare2, fromOrdering, xs, xs.slice(0), 0, xs.length);
            return xs;
          };
        };
      };
    };
  }();

  // output/Data.Array.ST/index.js
  var withArray = function(f) {
    return function(xs) {
      return function __do3() {
        var result = thaw(xs)();
        f(result)();
        return unsafeFreeze(result)();
      };
    };
  };
  var push = function(a) {
    return pushAll([a]);
  };

  // output/Data.Foldable/foreign.js
  var foldrArray = function(f) {
    return function(init) {
      return function(xs) {
        var acc = init;
        var len = xs.length;
        for (var i = len - 1; i >= 0; i--) {
          acc = f(xs[i])(acc);
        }
        return acc;
      };
    };
  };
  var foldlArray = function(f) {
    return function(init) {
      return function(xs) {
        var acc = init;
        var len = xs.length;
        for (var i = 0; i < len; i++) {
          acc = f(acc)(xs[i]);
        }
        return acc;
      };
    };
  };

  // output/Unsafe.Coerce/foreign.js
  var unsafeCoerce2 = function(x) {
    return x;
  };

  // output/Data.Foldable/index.js
  var foldr = function(dict) {
    return dict.foldr;
  };
  var traverse_ = function(dictApplicative) {
    var applySecond3 = applySecond(dictApplicative.Apply0());
    var pure3 = pure(dictApplicative);
    return function(dictFoldable) {
      var foldr2 = foldr(dictFoldable);
      return function(f) {
        return foldr2(function($454) {
          return applySecond3(f($454));
        })(pure3(unit));
      };
    };
  };
  var foldl = function(dict) {
    return dict.foldl;
  };
  var intercalate = function(dictFoldable) {
    var foldl2 = foldl(dictFoldable);
    return function(dictMonoid) {
      var append2 = append(dictMonoid.Semigroup0());
      var mempty2 = mempty(dictMonoid);
      return function(sep) {
        return function(xs) {
          var go2 = function(v) {
            return function(v1) {
              if (v.init) {
                return {
                  init: false,
                  acc: v1
                };
              }
              ;
              return {
                init: false,
                acc: append2(v.acc)(append2(sep)(v1))
              };
            };
          };
          return foldl2(go2)({
            init: true,
            acc: mempty2
          })(xs).acc;
        };
      };
    };
  };
  var foldMapDefaultR = function(dictFoldable) {
    var foldr2 = foldr(dictFoldable);
    return function(dictMonoid) {
      var append2 = append(dictMonoid.Semigroup0());
      var mempty2 = mempty(dictMonoid);
      return function(f) {
        return foldr2(function(x) {
          return function(acc) {
            return append2(f(x))(acc);
          };
        })(mempty2);
      };
    };
  };
  var foldableArray = {
    foldr: foldrArray,
    foldl: foldlArray,
    foldMap: function(dictMonoid) {
      return foldMapDefaultR(foldableArray)(dictMonoid);
    }
  };

  // output/Data.Traversable/foreign.js
  var traverseArrayImpl = function() {
    function array1(a) {
      return [a];
    }
    function array2(a) {
      return function(b) {
        return [a, b];
      };
    }
    function array3(a) {
      return function(b) {
        return function(c) {
          return [a, b, c];
        };
      };
    }
    function concat2(xs) {
      return function(ys) {
        return xs.concat(ys);
      };
    }
    return function(apply2) {
      return function(map5) {
        return function(pure3) {
          return function(f) {
            return function(array) {
              function go2(bot, top2) {
                switch (top2 - bot) {
                  case 0:
                    return pure3([]);
                  case 1:
                    return map5(array1)(f(array[bot]));
                  case 2:
                    return apply2(map5(array2)(f(array[bot])))(f(array[bot + 1]));
                  case 3:
                    return apply2(apply2(map5(array3)(f(array[bot])))(f(array[bot + 1])))(f(array[bot + 2]));
                  default:
                    var pivot = bot + Math.floor((top2 - bot) / 4) * 2;
                    return apply2(map5(concat2)(go2(bot, pivot)))(go2(pivot, top2));
                }
              }
              return go2(0, array.length);
            };
          };
        };
      };
    };
  }();

  // output/Data.Array/index.js
  var snoc = function(xs) {
    return function(x) {
      return withArray(push(x))(xs)();
    };
  };

  // output/Data.List.Types/index.js
  var Nil = /* @__PURE__ */ function() {
    function Nil2() {
    }
    ;
    Nil2.value = new Nil2();
    return Nil2;
  }();
  var Cons = /* @__PURE__ */ function() {
    function Cons2(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }
    ;
    Cons2.create = function(value0) {
      return function(value1) {
        return new Cons2(value0, value1);
      };
    };
    return Cons2;
  }();
  var listMap = function(f) {
    var chunkedRevMap = function($copy_v) {
      return function($copy_v1) {
        var $tco_var_v = $copy_v;
        var $tco_done = false;
        var $tco_result;
        function $tco_loop(v, v1) {
          if (v1 instanceof Cons && (v1.value1 instanceof Cons && v1.value1.value1 instanceof Cons)) {
            $tco_var_v = new Cons(v1, v);
            $copy_v1 = v1.value1.value1.value1;
            return;
          }
          ;
          var unrolledMap = function(v2) {
            if (v2 instanceof Cons && (v2.value1 instanceof Cons && v2.value1.value1 instanceof Nil)) {
              return new Cons(f(v2.value0), new Cons(f(v2.value1.value0), Nil.value));
            }
            ;
            if (v2 instanceof Cons && v2.value1 instanceof Nil) {
              return new Cons(f(v2.value0), Nil.value);
            }
            ;
            return Nil.value;
          };
          var reverseUnrolledMap = function($copy_v2) {
            return function($copy_v3) {
              var $tco_var_v2 = $copy_v2;
              var $tco_done1 = false;
              var $tco_result2;
              function $tco_loop2(v2, v3) {
                if (v2 instanceof Cons && (v2.value0 instanceof Cons && (v2.value0.value1 instanceof Cons && v2.value0.value1.value1 instanceof Cons))) {
                  $tco_var_v2 = v2.value1;
                  $copy_v3 = new Cons(f(v2.value0.value0), new Cons(f(v2.value0.value1.value0), new Cons(f(v2.value0.value1.value1.value0), v3)));
                  return;
                }
                ;
                $tco_done1 = true;
                return v3;
              }
              ;
              while (!$tco_done1) {
                $tco_result2 = $tco_loop2($tco_var_v2, $copy_v3);
              }
              ;
              return $tco_result2;
            };
          };
          $tco_done = true;
          return reverseUnrolledMap(v)(unrolledMap(v1));
        }
        ;
        while (!$tco_done) {
          $tco_result = $tco_loop($tco_var_v, $copy_v1);
        }
        ;
        return $tco_result;
      };
    };
    return chunkedRevMap(Nil.value);
  };
  var functorList = {
    map: listMap
  };
  var map2 = /* @__PURE__ */ map(functorList);
  var foldableList = {
    foldr: function(f) {
      return function(b) {
        var rev3 = function() {
          var go2 = function($copy_v) {
            return function($copy_v1) {
              var $tco_var_v = $copy_v;
              var $tco_done = false;
              var $tco_result;
              function $tco_loop(v, v1) {
                if (v1 instanceof Nil) {
                  $tco_done = true;
                  return v;
                }
                ;
                if (v1 instanceof Cons) {
                  $tco_var_v = new Cons(v1.value0, v);
                  $copy_v1 = v1.value1;
                  return;
                }
                ;
                throw new Error("Failed pattern match at Data.List.Types (line 107, column 7 - line 107, column 23): " + [v.constructor.name, v1.constructor.name]);
              }
              ;
              while (!$tco_done) {
                $tco_result = $tco_loop($tco_var_v, $copy_v1);
              }
              ;
              return $tco_result;
            };
          };
          return go2(Nil.value);
        }();
        var $284 = foldl(foldableList)(flip(f))(b);
        return function($285) {
          return $284(rev3($285));
        };
      };
    },
    foldl: function(f) {
      var go2 = function($copy_b) {
        return function($copy_v) {
          var $tco_var_b = $copy_b;
          var $tco_done1 = false;
          var $tco_result;
          function $tco_loop(b, v) {
            if (v instanceof Nil) {
              $tco_done1 = true;
              return b;
            }
            ;
            if (v instanceof Cons) {
              $tco_var_b = f(b)(v.value0);
              $copy_v = v.value1;
              return;
            }
            ;
            throw new Error("Failed pattern match at Data.List.Types (line 111, column 12 - line 113, column 30): " + [v.constructor.name]);
          }
          ;
          while (!$tco_done1) {
            $tco_result = $tco_loop($tco_var_b, $copy_v);
          }
          ;
          return $tco_result;
        };
      };
      return go2;
    },
    foldMap: function(dictMonoid) {
      var append2 = append(dictMonoid.Semigroup0());
      var mempty2 = mempty(dictMonoid);
      return function(f) {
        return foldl(foldableList)(function(acc) {
          var $286 = append2(acc);
          return function($287) {
            return $286(f($287));
          };
        })(mempty2);
      };
    }
  };
  var intercalate2 = /* @__PURE__ */ intercalate(foldableList)(monoidString);
  var showList = function(dictShow) {
    var show3 = show(dictShow);
    return {
      show: function(v) {
        if (v instanceof Nil) {
          return "Nil";
        }
        ;
        return "(" + (intercalate2(" : ")(map2(show3)(v)) + " : Nil)");
      }
    };
  };

  // output/Data.List/index.js
  var fromFoldable = function(dictFoldable) {
    return foldr(dictFoldable)(Cons.create)(Nil.value);
  };

  // output/Data.Number/foreign.js
  var isFiniteImpl = isFinite;
  function fromStringImpl(str, isFinite2, just, nothing) {
    var num = parseFloat(str);
    if (isFinite2(num)) {
      return just(num);
    } else {
      return nothing;
    }
  }
  var cos = Math.cos;
  var sin = Math.sin;

  // output/Data.Number/index.js
  var pi = 3.141592653589793;
  var fromString = function(str) {
    return fromStringImpl(str, isFiniteImpl, Just.create, Nothing.value);
  };

  // output/Data.String.Utils/foreign.js
  function wordsImpl(s) {
    return s.split(/[\u000a-\u000d\u0085\u2028\u2029\u0009\u0020\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]+/);
  }

  // output/Data.String.CodePoints/foreign.js
  var hasArrayFrom = typeof Array.from === "function";
  var hasStringIterator = typeof Symbol !== "undefined" && Symbol != null && typeof Symbol.iterator !== "undefined" && typeof String.prototype[Symbol.iterator] === "function";
  var hasFromCodePoint = typeof String.prototype.fromCodePoint === "function";
  var hasCodePointAt = typeof String.prototype.codePointAt === "function";

  // output/Data.String.Utils/index.js
  var words = function(s) {
    return wordsImpl(s);
  };

  // output/Effect.Console/foreign.js
  var log2 = function(s) {
    return function() {
      console.log(s);
    };
  };

  // output/Effect.Exception/foreign.js
  function error2(msg) {
    return new Error(msg);
  }
  function throwException(e) {
    return function() {
      throw e;
    };
  }

  // output/Effect.Exception/index.js
  var $$throw = function($4) {
    return throwException(error2($4));
  };

  // output/Graphics.Canvas/foreign.js
  function getCanvasElementByIdImpl(id2, Just2, Nothing2) {
    return function() {
      var el = document.getElementById(id2);
      if (el && el instanceof HTMLCanvasElement) {
        return Just2(el);
      } else {
        return Nothing2;
      }
    };
  }
  function getContext2D(c) {
    return function() {
      return c.getContext("2d");
    };
  }
  function getCanvasWidth(canvas) {
    return function() {
      return canvas.width;
    };
  }
  function getCanvasHeight(canvas) {
    return function() {
      return canvas.height;
    };
  }
  function setCanvasWidth(canvas) {
    return function(width8) {
      return function() {
        canvas.width = width8;
      };
    };
  }
  function setCanvasHeight(canvas) {
    return function(height8) {
      return function() {
        canvas.height = height8;
      };
    };
  }
  function setFillStyle(ctx) {
    return function(style) {
      return function() {
        ctx.fillStyle = style;
      };
    };
  }
  function beginPath(ctx) {
    return function() {
      ctx.beginPath();
    };
  }
  function stroke(ctx) {
    return function() {
      ctx.stroke();
    };
  }
  function fill(ctx) {
    return function() {
      ctx.fill();
    };
  }
  function lineTo(ctx) {
    return function(x) {
      return function(y) {
        return function() {
          ctx.lineTo(x, y);
        };
      };
    };
  }
  function moveTo(ctx) {
    return function(x) {
      return function(y) {
        return function() {
          ctx.moveTo(x, y);
        };
      };
    };
  }
  function closePath(ctx) {
    return function() {
      ctx.closePath();
    };
  }
  function arc(ctx) {
    return function(a) {
      return function() {
        ctx.arc(a.x, a.y, a.radius, a.start, a.end, a.useCounterClockwise);
      };
    };
  }
  function fillRect(ctx) {
    return function(r) {
      return function() {
        ctx.fillRect(r.x, r.y, r.width, r.height);
      };
    };
  }
  function clearRect(ctx) {
    return function(r) {
      return function() {
        ctx.clearRect(r.x, r.y, r.width, r.height);
      };
    };
  }
  function save(ctx) {
    return function() {
      ctx.save();
    };
  }
  function restore(ctx) {
    return function() {
      ctx.restore();
    };
  }

  // output/Graphics.Canvas/index.js
  var withContext = function(ctx) {
    return function(action2) {
      return function __do3() {
        save(ctx)();
        var a = action2();
        restore(ctx)();
        return a;
      };
    };
  };
  var strokePath = function(ctx) {
    return function(path) {
      return function __do3() {
        beginPath(ctx)();
        var a = path();
        stroke(ctx)();
        return a;
      };
    };
  };
  var getCanvasElementById = function(elId) {
    return getCanvasElementByIdImpl(elId, Just.create, Nothing.value);
  };
  var fillPath = function(ctx) {
    return function(path) {
      return function __do3() {
        beginPath(ctx)();
        var a = path();
        fill(ctx)();
        return a;
      };
    };
  };

  // output/Web.DOM.Element/foreign.js
  var getProp = function(name15) {
    return function(doctype) {
      return doctype[name15];
    };
  };
  var _namespaceURI = getProp("namespaceURI");
  var _prefix = getProp("prefix");
  var localName = getProp("localName");
  var tagName = getProp("tagName");
  function clientWidth(el) {
    return function() {
      return el.clientWidth;
    };
  }
  function clientHeight(el) {
    return function() {
      return el.clientHeight;
    };
  }

  // output/Data.Nullable/foreign.js
  function nullable(a, r, f) {
    return a == null ? r : f(a);
  }

  // output/Data.Nullable/index.js
  var toMaybe = function(n) {
    return nullable(n, Nothing.value, Just.create);
  };

  // output/Web.DOM.ParentNode/foreign.js
  var getEffProp = function(name15) {
    return function(node) {
      return function() {
        return node[name15];
      };
    };
  };
  var children = getEffProp("children");
  var _firstElementChild = getEffProp("firstElementChild");
  var _lastElementChild = getEffProp("lastElementChild");
  var childElementCount = getEffProp("childElementCount");

  // output/Web.Internal.FFI/foreign.js
  function _unsafeReadProtoTagged(nothing, just, name15, value12) {
    if (typeof window !== "undefined") {
      var ty = window[name15];
      if (ty != null && value12 instanceof ty) {
        return just(value12);
      }
    }
    var obj = value12;
    while (obj != null) {
      var proto = Object.getPrototypeOf(obj);
      var constructorName = proto.constructor.name;
      if (constructorName === name15) {
        return just(value12);
      } else if (constructorName === "Object") {
        return nothing;
      }
      obj = proto;
    }
    return nothing;
  }

  // output/Web.Internal.FFI/index.js
  var unsafeReadProtoTagged = function(name15) {
    return function(value12) {
      return _unsafeReadProtoTagged(Nothing.value, Just.create, name15, value12);
    };
  };

  // output/Web.DOM.Element/index.js
  var toEventTarget = unsafeCoerce2;

  // output/Web.DOM.NonElementParentNode/foreign.js
  function _getElementById(id2) {
    return function(node) {
      return function() {
        return node.getElementById(id2);
      };
    };
  }

  // output/Web.DOM.NonElementParentNode/index.js
  var map3 = /* @__PURE__ */ map(functorEffect);
  var getElementById = function(eid) {
    var $2 = map3(toMaybe);
    var $3 = _getElementById(eid);
    return function($4) {
      return $2($3($4));
    };
  };

  // output/Web.Event.EventTarget/foreign.js
  function eventListener(fn) {
    return function() {
      return function(event) {
        return fn(event)();
      };
    };
  }
  function addEventListener(type) {
    return function(listener) {
      return function(useCapture) {
        return function(target5) {
          return function() {
            return target5.addEventListener(type, listener, useCapture);
          };
        };
      };
    };
  }

  // output/Web.HTML/foreign.js
  var windowImpl = function() {
    return window;
  };

  // output/Web.HTML.HTMLDocument/index.js
  var toNonElementParentNode = unsafeCoerce2;

  // output/Web.HTML.HTMLInputElement/foreign.js
  function value3(input) {
    return function() {
      return input.value;
    };
  }
  function setValue3(value12) {
    return function(input) {
      return function() {
        input.value = value12;
      };
    };
  }

  // output/Web.HTML.HTMLInputElement/index.js
  var fromElement = /* @__PURE__ */ unsafeReadProtoTagged("HTMLInputElement");

  // output/Web.HTML.HTMLTextAreaElement/foreign.js
  function value11(textarea) {
    return function() {
      return textarea.value;
    };
  }
  function setValue11(value12) {
    return function(textarea) {
      return function() {
        textarea.value = value12;
      };
    };
  }

  // output/Web.HTML.HTMLTextAreaElement/index.js
  var fromElement2 = /* @__PURE__ */ unsafeReadProtoTagged("HTMLTextAreaElement");

  // output/Web.HTML.Window/foreign.js
  function document2(window2) {
    return function() {
      return window2.document;
    };
  }

  // output/Main/index.js
  var pure2 = /* @__PURE__ */ pure(applicativeEffect);
  var bind2 = /* @__PURE__ */ bind(bindEffect);
  var map4 = /* @__PURE__ */ map(functorEffect);
  var bindFlipped2 = /* @__PURE__ */ bindFlipped(bindEffect);
  var applySecond2 = /* @__PURE__ */ applySecond(applyEffect);
  var show2 = /* @__PURE__ */ show(showNumber);
  var traverse_2 = /* @__PURE__ */ traverse_(applicativeEffect)(foldableArray);
  var show1 = /* @__PURE__ */ show(/* @__PURE__ */ showList(showString));
  var fromFoldable2 = /* @__PURE__ */ fromFoldable(foldableArray);
  var showCommand = function(w) {
    return pure2({
      turtle: {
        visible: true,
        angle: w.turtle.angle,
        position: w.turtle.position
      },
      bg: w.bg,
      lines: w.lines
    });
  };
  var radians = function(x) {
    return x * pi / 180;
  };
  var turn = function(w) {
    return function(n) {
      var turnTurtle = function(t) {
        return function(angle) {
          return {
            position: t.position,
            angle: t.angle + radians(angle),
            visible: t.visible
          };
        };
      };
      return pure2({
        turtle: turnTurtle(w.turtle)(n),
        bg: w.bg,
        lines: w.lines
      });
    };
  };
  var output = function(doc) {
    return function(s) {
      return function __do3() {
        var v = value11(doc.output)();
        return setValue11(v + ("\n" + s))(doc.output)();
      };
    };
  };
  var newPos = function(v) {
    return function(angle) {
      return function(len) {
        var y$prime = v.y - cos(angle) * len;
        var x$prime = v.x + sin(angle) * len;
        return {
          x: x$prime,
          y: y$prime
        };
      };
    };
  };
  var mustFindElem = function(id2) {
    return function(doc) {
      return function __do3() {
        var maybeElem = getElementById(id2)(doc)();
        if (maybeElem instanceof Nothing) {
          return $$throw("cannot find element: " + id2)();
        }
        ;
        if (maybeElem instanceof Just) {
          return maybeElem.value0;
        }
        ;
        throw new Error("Failed pattern match at Main (line 232, column 3 - line 234, column 21): " + [maybeElem.constructor.name]);
      };
    };
  };
  var resizeCanvas = function(doc) {
    return function __do3() {
      var root = map4(toNonElementParentNode)(bindFlipped2(document2)(windowImpl))();
      var e = mustFindElem("canvas")(root)();
      var width8 = clientWidth(e)();
      var height8 = clientHeight(e)();
      setCanvasWidth(doc.canvas)(width8)();
      setCanvasHeight(doc.canvas)(height8)();
      return unit;
    };
  };
  var setupDoc = function __do() {
    var doc = map4(toNonElementParentNode)(bindFlipped2(document2)(windowImpl))();
    var form = mustFindElem("command-form")(doc)();
    var inputElem = mustFindElem("command")(doc)();
    var input = function() {
      var v = fromElement(inputElem);
      if (v instanceof Nothing) {
        return $$throw("cannot get HTML Input Element")();
      }
      ;
      if (v instanceof Just) {
        return v.value0;
      }
      ;
      throw new Error("Failed pattern match at Main (line 209, column 12 - line 211, column 21): " + [v.constructor.name]);
    }();
    var outputElem = mustFindElem("output")(doc)();
    var out = function() {
      var v = fromElement2(outputElem);
      if (v instanceof Nothing) {
        return $$throw("cannot get HTML Output Element")();
      }
      ;
      if (v instanceof Just) {
        return v.value0;
      }
      ;
      throw new Error("Failed pattern match at Main (line 213, column 10 - line 215, column 21): " + [v.constructor.name]);
    }();
    var maybeCanvas = getCanvasElementById("canvas")();
    var canvas = function() {
      if (maybeCanvas instanceof Nothing) {
        return $$throw("cannot get canvas")();
      }
      ;
      if (maybeCanvas instanceof Just) {
        return maybeCanvas.value0;
      }
      ;
      throw new Error("Failed pattern match at Main (line 217, column 13 - line 219, column 21): " + [maybeCanvas.constructor.name]);
    }();
    var ctx = getContext2D(canvas)();
    return {
      form,
      input,
      output: out,
      canvas,
      canvasCtx: ctx
    };
  };
  var moveTurtle = function(w) {
    return function(n) {
      var move = function(t) {
        return function(distance) {
          return {
            position: newPos(t.position)(t.angle)(distance),
            angle: t.angle,
            visible: t.visible
          };
        };
      };
      var addLine = function(ls) {
        return function(from) {
          return function(angle) {
            return function(distance) {
              return snoc(ls)({
                from,
                to: newPos(from)(angle)(distance)
              });
            };
          };
        };
      };
      return pure2({
        turtle: move(w.turtle)(n),
        lines: addLine(w.lines)(w.turtle.position)(w.turtle.angle)(n),
        bg: w.bg
      });
    };
  };
  var initialTurtle = function(canvas) {
    return function __do3() {
      var width8 = getCanvasWidth(canvas)();
      var height8 = getCanvasHeight(canvas)();
      return {
        position: {
          x: width8 / 2,
          y: height8 / 2
        },
        angle: 0,
        visible: true
      };
    };
  };
  var initialWorld = function(doc) {
    return function __do3() {
      var turtle = initialTurtle(doc.canvas)();
      return {
        turtle,
        bg: "white",
        lines: []
      };
    };
  };
  var hideCommand = function(w) {
    return pure2({
      turtle: {
        visible: false,
        angle: w.turtle.angle,
        position: w.turtle.position
      },
      bg: w.bg,
      lines: w.lines
    });
  };
  var error3 = log2;
  var leftCommand = function(doc) {
    return function(w) {
      return function(s) {
        var v = fromString(s);
        if (v instanceof Nothing) {
          return applySecond2(error3("expected number when turning left"))(pure2(w));
        }
        ;
        if (v instanceof Just) {
          return function __do3() {
            output(doc)("left " + show2(v.value0))();
            return turn(w)(v.value0 * -1)();
          };
        }
        ;
        throw new Error("Failed pattern match at Main (line 126, column 3 - line 130, column 24): " + [v.constructor.name]);
      };
    };
  };
  var moveCommand = function(doc) {
    return function(w) {
      return function(s) {
        var v = fromString(s);
        if (v instanceof Nothing) {
          return applySecond2(error3("expected number when moving"))(pure2(w));
        }
        ;
        if (v instanceof Just) {
          return function __do3() {
            output(doc)("move " + show2(v.value0))();
            return moveTurtle(w)(v.value0)();
          };
        }
        ;
        throw new Error("Failed pattern match at Main (line 142, column 3 - line 146, column 21): " + [v.constructor.name]);
      };
    };
  };
  var rightCommand = function(doc) {
    return function(w) {
      return function(s) {
        var v = fromString(s);
        if (v instanceof Nothing) {
          return applySecond2(error3("expected number when turning right"))(pure2(w));
        }
        ;
        if (v instanceof Just) {
          return function __do3() {
            output(doc)("right " + show2(v.value0))();
            return turn(w)(v.value0)();
          };
        }
        ;
        throw new Error("Failed pattern match at Main (line 134, column 3 - line 138, column 15): " + [v.constructor.name]);
      };
    };
  };
  var drawTurtle = function(v) {
    return function(ctx) {
      return withContext(ctx)(fillPath(ctx)(arc(ctx)({
        x: v.position.x,
        y: v.position.y,
        radius: 10,
        start: pi + v.angle,
        end: 0 + v.angle,
        useCounterClockwise: false
      })));
    };
  };
  var drawLines = function(lines) {
    return function(doc) {
      var drawLine = function(ctx) {
        return function(v) {
          return strokePath(ctx)(function __do3() {
            moveTo(ctx)(v.from.x)(v.from.y)();
            lineTo(ctx)(v.to.x)(v.to.y)();
            return closePath(ctx)();
          });
        };
      };
      return traverse_2(drawLine(doc.canvasCtx))(lines);
    };
  };
  var render = function(doc) {
    return function(w) {
      var clearCanvas = function __do3() {
        var width8 = getCanvasWidth(doc.canvas)();
        var height8 = getCanvasHeight(doc.canvas)();
        return withContext(doc.canvasCtx)(function __do4() {
          clearRect(doc.canvasCtx)({
            x: 0,
            y: 0,
            width: width8,
            height: height8
          })();
          setFillStyle(doc.canvasCtx)(w.bg)();
          return fillRect(doc.canvasCtx)({
            x: 0,
            y: 0,
            width: width8,
            height: height8
          })();
        })();
      };
      return function __do3() {
        clearCanvas();
        drawLines(w.lines)(doc)();
        if (w.turtle.visible) {
          return drawTurtle(w.turtle)(doc.canvasCtx)();
        }
        ;
        return unit;
      };
    };
  };
  var clearCommand = function(doc) {
    return function __do3() {
      output(doc)("clear")();
      return initialWorld(doc)();
    };
  };
  var bgCommand = function(doc) {
    return function(w) {
      return function(bg) {
        return function __do3() {
          output(doc)("bg " + bg)();
          return {
            bg,
            lines: w.lines,
            turtle: w.turtle
          };
        };
      };
    };
  };
  var $$eval = function(v) {
    return function(v1) {
      return function(v2) {
        if (v1 instanceof Nil) {
          return pure2(v2);
        }
        ;
        if (v1 instanceof Cons && (v1.value0 === "move" && v1.value1 instanceof Cons)) {
          return bind2(moveCommand(v)(v2)(v1.value1.value0))($$eval(v)(v1.value1.value1));
        }
        ;
        if (v1 instanceof Cons && (v1.value0 === "left" && v1.value1 instanceof Cons)) {
          return bind2(leftCommand(v)(v2)(v1.value1.value0))($$eval(v)(v1.value1.value1));
        }
        ;
        if (v1 instanceof Cons && (v1.value0 === "right" && v1.value1 instanceof Cons)) {
          return bind2(rightCommand(v)(v2)(v1.value1.value0))($$eval(v)(v1.value1.value1));
        }
        ;
        if (v1 instanceof Cons && v1.value0 === "clear") {
          return bind2(clearCommand(v))($$eval(v)(v1.value1));
        }
        ;
        if (v1 instanceof Cons && v1.value0 === "hide") {
          return bind2(hideCommand(v2))($$eval(v)(v1.value1));
        }
        ;
        if (v1 instanceof Cons && v1.value0 === "show") {
          return bind2(showCommand(v2))($$eval(v)(v1.value1));
        }
        ;
        if (v1 instanceof Cons && (v1.value0 === "bg" && v1.value1 instanceof Cons)) {
          return bind2(bgCommand(v)(v2)(v1.value1.value0))($$eval(v)(v1.value1.value1));
        }
        ;
        return applySecond2(error3("unrecognised command " + show1(v1)))(pure2(v2));
      };
    };
  };
  var handleCommand = function(wr) {
    return function(doc) {
      return function(v) {
        return function __do3() {
          var v1 = value3(doc.input)();
          setValue3("")(doc.input)();
          var w$prime = bindFlipped2($$eval(doc)(fromFoldable2(words(v1))))(read(wr))();
          write(w$prime)(wr)();
          return render(doc)(w$prime)();
        };
      };
    };
  };
  var listenToCommands = function(tr) {
    return function(doc) {
      return function __do3() {
        var listener = eventListener(handleCommand(tr)(doc))();
        return addEventListener("submit")(listener)(false)(toEventTarget(doc.form))();
      };
    };
  };
  var main = function __do2() {
    var doc = setupDoc();
    resizeCanvas(doc)();
    var world = initialWorld(doc)();
    var wr = $$new(world)();
    render(doc)(world)();
    return listenToCommands(wr)(doc)();
  };

  // <stdin>
  main();
})();
