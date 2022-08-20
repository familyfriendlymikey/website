
// node_modules/imba/src/imba/utils.imba
var $23 = Symbol.for("#__initor__");
var $24 = Symbol.for("#__inited__");
var $1 = Symbol.for("#__hooks__");
var $2 = Symbol.for("#type");
var $21 = Symbol.for("#__listeners__");
function parseTime(value) {
  let typ = typeof value;
  if (typ == "number") {
    return value;
  }
  ;
  if (typ == "string") {
    if (/^\d+fps$/.test(value)) {
      return 1e3 / parseFloat(value);
    } else if (/^([-+]?[\d\.]+)s$/.test(value)) {
      return parseFloat(value) * 1e3;
    } else if (/^([-+]?[\d\.]+)ms$/.test(value)) {
      return parseFloat(value);
    }
    ;
  }
  ;
  return null;
}
function getDeepPropertyDescriptor(item, key, stop) {
  if (!item) {
    return void 0;
  }
  ;
  let desc = Object.getOwnPropertyDescriptor(item, key);
  if (desc || item == stop) {
    return desc || void 0;
  }
  ;
  return getDeepPropertyDescriptor(Reflect.getPrototypeOf(item), key, stop);
}
var emit__ = function(event, args, node) {
  let prev;
  let cb;
  let ret;
  while ((prev = node) && (node = node.next)) {
    if (cb = node.listener) {
      if (node.path && cb[node.path]) {
        ret = args ? cb[node.path].apply(cb, args) : cb[node.path]();
      } else {
        ret = args ? cb.apply(node, args) : cb.call(node);
      }
      ;
    }
    ;
    if (node.times && --node.times <= 0) {
      prev.next = node.next;
      node.listener = null;
    }
    ;
  }
  ;
  return;
};
function listen(obj, event, listener, path) {
  var $225;
  let cbs;
  let list;
  let tail;
  cbs = obj[$21] || (obj[$21] = {});
  list = cbs[event] || (cbs[event] = {});
  tail = list.tail || (list.tail = list.next = {});
  tail.listener = listener;
  tail.path = path;
  list.tail = tail.next = {};
  return tail;
}
function once(obj, event, listener) {
  let tail = listen(obj, event, listener);
  tail.times = 1;
  return tail;
}
function unlisten(obj, event, cb, meth) {
  let node;
  let prev;
  let meta = obj[$21];
  if (!meta) {
    return;
  }
  ;
  if (node = meta[event]) {
    while ((prev = node) && (node = node.next)) {
      if (node == cb || node.listener == cb) {
        prev.next = node.next;
        node.listener = null;
        break;
      }
      ;
    }
    ;
  }
  ;
  return;
}
function emit(obj, event, params) {
  let cb;
  if (cb = obj[$21]) {
    if (cb[event]) {
      emit__(event, params, cb[event]);
    }
    ;
    if (cb.all) {
      emit__(event, [event, params], cb.all);
    }
    ;
  }
  ;
  return;
}

// node_modules/imba/src/imba/scheduler.imba
function iter$__(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : a;
}
var $12 = Symbol.for("#__init__");
var $22 = Symbol.for("#__patch__");
var $19 = Symbol.for("#__initor__");
var $20 = Symbol.for("#__inited__");
var $3 = Symbol.for("#__hooks__");
var $4 = Symbol.for("#schedule");
var $7 = Symbol.for("#frames");
var $8 = Symbol.for("#interval");
var $9 = Symbol.for("#stage");
var $10 = Symbol.for("#scheduled");
var $11 = Symbol.for("#version");
var $122 = Symbol.for("#fps");
var $13 = Symbol.for("#ticker");
var rAF = globalThis.requestAnimationFrame || function(blk) {
  return globalThis.setTimeout(blk, 1e3 / 60);
};
var SPF = 1 / 60;
var Scheduled = class {
  [$22]($$ = {}) {
    var $510;
    ($510 = $$.owner) !== void 0 && (this.owner = $510);
    ($510 = $$.target) !== void 0 && (this.target = $510);
    ($510 = $$.active) !== void 0 && (this.active = $510);
    ($510 = $$.value) !== void 0 && (this.value = $510);
    ($510 = $$.skip) !== void 0 && (this.skip = $510);
    ($510 = $$.last) !== void 0 && (this.last = $510);
  }
  constructor($$ = null) {
    this[$12]($$);
  }
  [$12]($$ = null, deep = true) {
    var $68;
    this.owner = $$ && ($68 = $$.owner) !== void 0 ? $68 : null;
    this.target = $$ && ($68 = $$.target) !== void 0 ? $68 : null;
    this.active = $$ && ($68 = $$.active) !== void 0 ? $68 : false;
    this.value = $$ && ($68 = $$.value) !== void 0 ? $68 : void 0;
    this.skip = $$ && ($68 = $$.skip) !== void 0 ? $68 : 0;
    this.last = $$ && ($68 = $$.last) !== void 0 ? $68 : 0;
  }
  tick(scheduler2, source) {
    this.last = this.owner[$7];
    this.target.tick(this, source);
    return 1;
  }
  update(o, activate\u03A6) {
    let on = this.active;
    let val = o.value;
    let changed = this.value != val;
    if (changed) {
      this.deactivate();
      this.value = val;
    }
    ;
    if (this.value || on || activate\u03A6) {
      this.activate();
    }
    ;
    return this;
  }
  queue() {
    this.owner.add(this);
    return;
  }
  activate() {
    if (this.value === true) {
      this.owner.on("commit", this);
    } else if (this.value === false) {
      true;
    } else if (typeof this.value == "number") {
      let tock = this.value / (1e3 / 60);
      if (tock <= 2) {
        this.owner.on("raf", this);
      } else {
        this[$8] = globalThis.setInterval(this.queue.bind(this), this.value);
      }
      ;
    }
    ;
    this.active = true;
    return this;
  }
  deactivate() {
    if (this.value === true) {
      this.owner.un("commit", this);
    }
    ;
    this.owner.un("raf", this);
    if (this[$8]) {
      globalThis.clearInterval(this[$8]);
      this[$8] = null;
    }
    ;
    this.active = false;
    return this;
  }
};
var Scheduler = class {
  constructor() {
    var self = this;
    this.id = Symbol();
    this.queue = [];
    this.stage = -1;
    this[$9] = -1;
    this[$7] = 0;
    this[$10] = false;
    this[$11] = 0;
    this.listeners = {};
    this.intervals = {};
    self.commit = function() {
      self.add("commit");
      return self;
    };
    this[$122] = 0;
    self.$promise = null;
    self.$resolve = null;
    this[$13] = function(e) {
      self[$10] = false;
      return self.tick(e);
    };
    self;
  }
  touch() {
    return this[$11]++;
  }
  get version() {
    return this[$11];
  }
  add(item, force) {
    if (force || this.queue.indexOf(item) == -1) {
      this.queue.push(item);
    }
    ;
    if (!this[$10]) {
      this[$4]();
    }
    ;
    return this;
  }
  get committing\u03A6() {
    return this.queue.indexOf("commit") >= 0;
  }
  get syncing\u03A6() {
    return this[$9] == 1;
  }
  listen(ns, item) {
    let set = this.listeners[ns];
    let first = !set;
    set || (set = this.listeners[ns] = new Set());
    set.add(item);
    if (ns == "raf" && first) {
      this.add("raf");
    }
    ;
    return this;
  }
  unlisten(ns, item) {
    var $147;
    let set = this.listeners[ns];
    set && set.delete(item);
    if (ns == "raf" && set && set.size == 0) {
      $147 = this.listeners.raf, delete this.listeners.raf, $147;
    }
    ;
    return this;
  }
  on(ns, item) {
    return this.listen(ns, item);
  }
  un(ns, item) {
    return this.unlisten(ns, item);
  }
  get promise() {
    var self = this;
    return self.$promise || (self.$promise = new Promise(function(resolve) {
      return self.$resolve = resolve;
    }));
  }
  tick(timestamp) {
    var self = this;
    let items = this.queue;
    let frame = this[$7]++;
    if (!this.ts) {
      this.ts = timestamp;
    }
    ;
    this.dt = timestamp - this.ts;
    this.ts = timestamp;
    this.queue = [];
    this[$9] = 1;
    this[$11]++;
    if (items.length) {
      for (let i = 0, $157 = iter$__(items), $165 = $157.length; i < $165; i++) {
        let item = $157[i];
        if (typeof item === "string" && this.listeners[item]) {
          self.listeners[item].forEach(function(listener) {
            if (listener.tick instanceof Function) {
              return listener.tick(self, item);
            } else if (listener instanceof Function) {
              return listener(self, item);
            }
            ;
          });
        } else if (item instanceof Function) {
          item(self.dt, self);
        } else if (item.tick) {
          item.tick(self.dt, self);
        }
        ;
      }
      ;
    }
    ;
    this[$9] = this[$10] ? 0 : -1;
    if (self.$promise) {
      self.$resolve(self);
      self.$promise = self.$resolve = null;
    }
    ;
    if (self.listeners.raf && true) {
      self.add("raf");
    }
    ;
    return self;
  }
  [$4]() {
    if (!this[$10]) {
      this[$10] = true;
      if (this[$9] == -1) {
        this[$9] = 0;
      }
      ;
      rAF(this[$13]);
    }
    ;
    return this;
  }
  schedule(item, o) {
    var $174, $184;
    o || (o = item[$174 = this.id] || (item[$174] = {value: true}));
    let state = o[$184 = this.id] || (o[$184] = new Scheduled({owner: this, target: item}));
    return state.update(o, true);
  }
  unschedule(item, o = {}) {
    o || (o = item[this.id]);
    let state = o && o[this.id];
    if (state && state.active) {
      state.deactivate();
    }
    ;
    return this;
  }
};
var scheduler = new Scheduler();
function commit() {
  return scheduler.add("commit").promise;
}
function setTimeout2(fn, ms) {
  return globalThis.setTimeout(function() {
    fn();
    commit();
    return;
  }, ms);
}
function setInterval2(fn, ms) {
  return globalThis.setInterval(function() {
    fn();
    commit();
    return;
  }, ms);
}
var clearInterval2 = globalThis.clearInterval;
var clearTimeout = globalThis.clearTimeout;
var instance = globalThis.imba || (globalThis.imba = {});
instance.commit = commit;
instance.setTimeout = setTimeout2;
instance.setInterval = setInterval2;
instance.clearInterval = clearInterval2;
instance.clearTimeout = clearTimeout;

// node_modules/imba/src/imba/manifest.web.imba
var $25 = Symbol.for("#__initor__");
var $32 = Symbol.for("#__inited__");
var $14 = Symbol.for("#__hooks__");
var Manifest = class {
  constructor() {
    this.data = {};
  }
};
var manifest = new Manifest();

// node_modules/imba/src/imba/asset.imba
var $132 = Symbol.for("#__initor__");
var $142 = Symbol.for("#__inited__");
var $15 = Symbol.for("#__hooks__");
var $26 = Symbol.for("#__init__");
var $33 = Symbol.for("#__patch__");
var $42 = Symbol.for("#warned");
var $102 = Symbol.for("#asset");
var AssetProxy = class {
  static wrap(meta) {
    let handler = new AssetProxy(meta);
    return new Proxy(handler, handler);
  }
  constructor(meta) {
    this.meta = meta;
  }
  get input() {
    return manifest.inputs[this.meta.input];
  }
  get asset() {
    return globalThis._MF_ ? this.meta : this.input ? this.input.asset : null;
  }
  set(target, key, value) {
    return true;
  }
  get(target, key) {
    if (this.meta.meta && this.meta.meta[key] != void 0) {
      return this.meta.meta[key];
    }
    ;
    if (!this.asset) {
      if (this.meta[$42] != true ? (this.meta[$42] = true, true) : false) {
        console.warn("Asset for '" + this.meta.input + "' not found");
      }
      ;
      if (key == "valueOf") {
        return function() {
          return "";
        };
      }
      ;
      return null;
    }
    ;
    if (key == "absPath" && !this.asset.absPath) {
      return this.asset.url;
    }
    ;
    return this.asset[key];
  }
};
var SVGAsset = class {
  [$33]($$ = {}) {
    var $510;
    ($510 = $$.url) !== void 0 && (this.url = $510);
    ($510 = $$.meta) !== void 0 && (this.meta = $510);
  }
  constructor($$ = null) {
    this[$26]($$);
  }
  [$26]($$ = null, deep = true) {
    this.url = $$ ? $$.url : void 0;
    this.meta = $$ ? $$.meta : void 0;
  }
  adoptNode(node) {
    var _a;
    if ((_a = this.meta) == null ? void 0 : _a.content) {
      for (let $810 = this.meta.attributes, $68 = 0, $77 = Object.keys($810), $96 = $77.length, k, v; $68 < $96; $68++) {
        k = $77[$68];
        v = $810[k];
        node.setAttribute(k, v);
      }
      ;
      node.innerHTML = this.meta.content;
    }
    ;
    return this;
  }
  toString() {
    return this.url;
  }
  toStyleString() {
    return "url(" + this.url + ")";
  }
};
function asset(data) {
  var $119, $126;
  if (data[$102]) {
    return data[$102];
  }
  ;
  if (data.type == "svg") {
    return data[$102] || (data[$102] = new SVGAsset(data));
  }
  ;
  if (data.input) {
    let extra = globalThis._MF_ && globalThis._MF_[data.input];
    if (extra) {
      Object.assign(data, extra);
      data.toString = function() {
        return this.absPath;
      };
    }
    ;
    return data[$102] || (data[$102] = AssetProxy.wrap(data));
  }
  ;
  return data;
}

// node_modules/imba/src/imba/dom/flags.imba
var $16 = Symbol.for("#toStringDeopt");
var $72 = Symbol.for("#__initor__");
var $82 = Symbol.for("#__inited__");
var $27 = Symbol.for("#__hooks__");
var $34 = Symbol.for("#symbols");
var $43 = Symbol.for("#batches");
var $5 = Symbol.for("#extras");
var $6 = Symbol.for("#stacks");
var Flags = class {
  constructor(dom) {
    this.dom = dom;
    this.string = "";
  }
  contains(ref) {
    return this.dom.classList.contains(ref);
  }
  add(ref) {
    if (this.contains(ref)) {
      return this;
    }
    ;
    this.string += (this.string ? " " : "") + ref;
    this.dom.classList.add(ref);
    return this;
  }
  remove(ref) {
    if (!this.contains(ref)) {
      return this;
    }
    ;
    let regex = new RegExp("(^|\\s)" + ref + "(?=\\s|$)", "g");
    this.string = this.string.replace(regex, "");
    this.dom.classList.remove(ref);
    return this;
  }
  toggle(ref, bool) {
    if (bool === void 0) {
      bool = !this.contains(ref);
    }
    ;
    return bool ? this.add(ref) : this.remove(ref);
  }
  incr(ref, duration = 0) {
    var self = this;
    let m = this.stacks;
    let c = m[ref] || 0;
    if (c < 1) {
      this.add(ref);
    }
    ;
    if (duration > 0) {
      setTimeout(function() {
        return self.decr(ref);
      }, duration);
    }
    ;
    return m[ref] = Math.max(c, 0) + 1;
  }
  decr(ref) {
    let m = this.stacks;
    let c = m[ref] || 0;
    if (c == 1) {
      this.remove(ref);
    }
    ;
    return m[ref] = Math.max(c, 1) - 1;
  }
  reconcile(sym, str) {
    let syms = this[$34];
    let vals = this[$43];
    let dirty = true;
    if (!syms) {
      syms = this[$34] = [sym];
      vals = this[$43] = [str || ""];
      this.toString = this.valueOf = this[$16];
    } else {
      let idx = syms.indexOf(sym);
      let val = str || "";
      if (idx == -1) {
        syms.push(sym);
        vals.push(val);
      } else if (vals[idx] != val) {
        vals[idx] = val;
      } else {
        dirty = false;
      }
      ;
    }
    ;
    if (dirty) {
      this[$5] = " " + vals.join(" ");
      this.sync();
    }
    ;
    return;
  }
  valueOf() {
    return this.string;
  }
  toString() {
    return this.string;
  }
  [$16]() {
    return this.string + (this[$5] || "");
  }
  sync() {
    return this.dom.flagSync$();
  }
  get stacks() {
    return this[$6] || (this[$6] = {});
  }
};

// node_modules/imba/src/imba/dom/context.imba
var $17 = Symbol.for("#__init__");
var $28 = Symbol.for("#__patch__");
var $73 = Symbol.for("#__initor__");
var $83 = Symbol.for("#__inited__");
var $35 = Symbol.for("#__hooks__");
var $44 = Symbol.for("#getRenderContext");
var $52 = Symbol.for("#getDynamicContext");
var $62 = Symbol();
var renderContext = {
  context: null
};
var Renderer = class {
  [$28]($$ = {}) {
    var $96;
    ($96 = $$.stack) !== void 0 && (this.stack = $96);
  }
  constructor($$ = null) {
    this[$17]($$);
  }
  [$17]($$ = null, deep = true) {
    var $106;
    this.stack = $$ && ($106 = $$.stack) !== void 0 ? $106 : [];
  }
  push(el) {
    return this.stack.push(el);
  }
  pop(el) {
    return this.stack.pop();
  }
};
var renderer = new Renderer();
var RenderContext = class extends Map {
  static [$17]() {
    this.prototype[$73] = $62;
    return this;
  }
  constructor(parent, sym = null) {
    super();
    this._ = parent;
    this.sym = sym;
    this[$73] === $62 && (this[$35] && this[$35].inited(this), this[$83] && this[$83]());
  }
  pop() {
    return renderContext.context = null;
  }
  [$44](sym) {
    let out = this.get(sym);
    out || this.set(sym, out = new RenderContext(this._, sym));
    return renderContext.context = out;
  }
  [$52](sym, key) {
    return this[$44](sym)[$44](key);
  }
  run(value) {
    this.value = value;
    if (renderContext.context == this) {
      renderContext.context = null;
    }
    ;
    return this.get(value);
  }
  cache(val) {
    this.set(this.value, val);
    return val;
  }
};
RenderContext[$17]();
function createRenderContext(cache, key = Symbol(), up = cache) {
  return renderContext.context = cache[key] || (cache[key] = new RenderContext(up, key));
}
function getRenderContext() {
  let ctx = renderContext.context;
  let res = ctx || new RenderContext(null);
  if (true) {
    if (!ctx && renderer.stack.length > 0) {
      console.warn("detected unmemoized nodes in", renderer.stack, "see https://imba.io", res);
    }
    ;
  }
  ;
  if (ctx) {
    renderContext.context = null;
  }
  ;
  return res;
}

// node_modules/imba/src/imba/dom/core.web.imba
function extend$__(target, ext) {
  const descriptors = Object.getOwnPropertyDescriptors(ext);
  delete descriptors.constructor;
  Object.defineProperties(target, descriptors);
  return target;
}
function iter$__2(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : a;
}
var $18 = Symbol.for("#parent");
var $29 = Symbol.for("#closestNode");
var $36 = Symbol.for("#parentNode");
var $45 = Symbol.for("#context");
var $53 = Symbol.for("#__init__");
var $63 = Symbol.for("##inited");
var $74 = Symbol.for("#getRenderContext");
var $84 = Symbol.for("#getDynamicContext");
var $92 = Symbol.for("#insertChild");
var $103 = Symbol.for("#appendChild");
var $112 = Symbol.for("#replaceChild");
var $123 = Symbol.for("#removeChild");
var $133 = Symbol.for("#insertInto");
var $143 = Symbol.for("#insertIntoDeopt");
var $152 = Symbol.for("#removeFrom");
var $162 = Symbol.for("#removeFromDeopt");
var $172 = Symbol.for("#replaceWith");
var $182 = Symbol.for("#replaceWithDeopt");
var $192 = Symbol.for("#placeholderNode");
var $202 = Symbol.for("#attachToParent");
var $212 = Symbol.for("#detachFromParent");
var $222 = Symbol.for("#placeChild");
var $232 = Symbol.for("#beforeReconcile");
var $242 = Symbol.for("#afterReconcile");
var $252 = Symbol.for("#afterVisit");
var $262 = Symbol.for("##parent");
var $272 = Symbol.for("##up");
var $282 = Symbol.for("##context");
var $292 = Symbol.for("#domNode");
var $30 = Symbol.for("##placeholderNode");
var $31 = Symbol.for("#domDeopt");
var $322 = Symbol.for("#isRichElement");
var $342 = Symbol.for("#src");
var $422 = Symbol.for("#htmlNodeName");
var $432 = Symbol.for("#getSlot");
var $442 = Symbol.for("#ImbaElement");
var $452 = Symbol.for("#cssns");
var $46 = Symbol.for("#cssid");
var {
  Event,
  UIEvent,
  MouseEvent,
  PointerEvent,
  KeyboardEvent,
  CustomEvent,
  Node,
  Comment,
  Text,
  Element,
  HTMLElement,
  HTMLHtmlElement,
  HTMLSelectElement,
  HTMLInputElement,
  HTMLTextAreaElement,
  HTMLButtonElement,
  HTMLOptionElement,
  HTMLScriptElement,
  SVGElement,
  DocumentFragment,
  ShadowRoot,
  Document,
  Window,
  customElements
} = globalThis.window;
var descriptorCache = {};
function getDescriptor(item, key, cache) {
  if (!item) {
    return cache[key] = null;
  }
  ;
  if (cache[key] !== void 0) {
    return cache[key];
  }
  ;
  let desc = Object.getOwnPropertyDescriptor(item, key);
  if (desc !== void 0 || item == SVGElement) {
    return cache[key] = desc || null;
  }
  ;
  return getDescriptor(Reflect.getPrototypeOf(item), key, cache);
}
var CustomTagConstructors = {};
var CustomTagToElementNames = {};
var TYPES = {};
var CUSTOM_TYPES = {};
var contextHandler = {
  get(target, name) {
    let ctx = target;
    let val = void 0;
    while (ctx && val == void 0) {
      if (ctx = ctx[$18]) {
        val = ctx[name];
      }
      ;
    }
    ;
    return val;
  },
  set(target, name, value) {
    let ctx = target;
    let val = void 0;
    while (ctx && val == void 0) {
      let desc = getDeepPropertyDescriptor(ctx, name, Element);
      if (desc) {
        ctx[name] = value;
        return true;
      } else {
        ctx = ctx[$18];
      }
      ;
    }
    ;
    return true;
  }
};
var \u03A9Document\u03A9af = class {
  get flags() {
    return this.documentElement.flags;
  }
};
extend$__(Document.prototype, \u03A9Document\u03A9af.prototype);
var \u03A9Node\u03A9ag = class {
  get [$18]() {
    return this[$262] || this.parentNode || this[$272];
  }
  get [$29]() {
    return this;
  }
  get [$36]() {
    return this[$18][$29];
  }
  get [$45]() {
    return this[$282] || (this[$282] = new Proxy(this, contextHandler));
  }
  [$53]() {
    return this;
  }
  [$63]() {
    return this;
  }
  [$74](sym) {
    return createRenderContext(this, sym);
  }
  [$84](sym, key) {
    return this[$74](sym)[$74](key);
  }
  [$92](newnode, refnode) {
    return newnode[$133](this, refnode);
  }
  [$103](newnode) {
    return newnode[$133](this, null);
  }
  [$112](newnode, oldnode) {
    let res = this[$92](newnode, oldnode);
    this[$123](oldnode);
    return res;
  }
  [$123](node) {
    return node[$152](this);
  }
  [$133](parent, before = null) {
    if (before) {
      parent.insertBefore(this, before);
    } else {
      parent.appendChild(this);
    }
    ;
    return this;
  }
  [$143](parent, before) {
    if (before) {
      parent.insertBefore(this[$292] || this, before);
    } else {
      parent.appendChild(this[$292] || this);
    }
    ;
    return this;
  }
  [$152](parent) {
    return parent.removeChild(this);
  }
  [$162](parent) {
    return parent.removeChild(this[$292] || this);
  }
  [$172](other, parent) {
    return parent[$112](other, this);
  }
  [$182](other, parent) {
    return parent[$112](other, this[$292] || this);
  }
  get [$192]() {
    return this[$30] || (this[$30] = globalThis.document.createComment("placeholder"));
  }
  set [$192](value) {
    let prev = this[$30];
    this[$30] = value;
    if (prev && prev != value && prev.parentNode) {
      prev[$172](value);
    }
    ;
  }
  [$202]() {
    let ph = this[$292];
    let par = ph && ph.parentNode;
    if (ph && par && ph != this) {
      this[$292] = null;
      this[$133](par, ph);
      ph[$152](par);
    }
    ;
    return this;
  }
  [$212]() {
    if (this[$31] != true ? (this[$31] = true, true) : false) {
      this[$172] = this[$182];
      this[$152] = this[$162];
      this[$133] = this[$143];
    }
    ;
    let ph = this[$192];
    if (this.parentNode && ph != this) {
      ph[$133](this.parentNode, this);
      this[$152](this.parentNode);
    }
    ;
    this[$292] = ph;
    return this;
  }
  [$222](item, f, prev) {
    let type = typeof item;
    if (type === "undefined" || item === null) {
      if (prev && prev instanceof Comment) {
        return prev;
      }
      ;
      let el = globalThis.document.createComment("");
      return prev ? prev[$172](el, this) : el[$133](this, null);
    }
    ;
    if (item === prev) {
      return item;
    } else if (type !== "object") {
      let res;
      let txt = item;
      if (f & 128 && f & 256 && false) {
        this.textContent = txt;
        return;
      }
      ;
      if (prev) {
        if (prev instanceof Text) {
          prev.textContent = txt;
          return prev;
        } else {
          res = globalThis.document.createTextNode(txt);
          prev[$172](res, this);
          return res;
        }
        ;
      } else {
        this.appendChild(res = globalThis.document.createTextNode(txt));
        return res;
      }
      ;
    } else {
      if (true) {
        if (!item[$133]) {
          console.warn("Tried to insert", item, "into", this);
          throw new TypeError("Only DOM Nodes can be inserted into DOM");
        }
        ;
      }
      ;
      return prev ? prev[$172](item, this) : item[$133](this, null);
    }
    ;
    return;
  }
};
extend$__(Node.prototype, \u03A9Node\u03A9ag.prototype);
var \u03A9Element\u03A9ah = class {
  log(...params) {
    console.log(...params);
    return this;
  }
  emit(name, detail, o = {bubbles: true, cancelable: true}) {
    if (detail != void 0) {
      o.detail = detail;
    }
    ;
    let event = new CustomEvent(name, o);
    let res = this.dispatchEvent(event);
    return event;
  }
  text$(item) {
    this.textContent = item;
    return this;
  }
  [$232]() {
    return this;
  }
  [$242]() {
    return this;
  }
  [$252]() {
    if (this.render) {
      this.render();
    }
    ;
    return;
  }
  get flags() {
    if (!this.$flags) {
      this.$flags = new Flags(this);
      if (this.flag$ == Element.prototype.flag$) {
        this.flags$ext = this.className;
      }
      ;
      this.flagDeopt$();
    }
    ;
    return this.$flags;
  }
  flag$(str) {
    let ns = this.flags$ns;
    this.className = ns ? ns + (this.flags$ext = str) : this.flags$ext = str;
    return;
  }
  flagDeopt$() {
    var self = this;
    this.flag$ = this.flagExt$;
    self.flagSelf$ = function(str) {
      return self.flagSync$(self.flags$own = str);
    };
    return;
  }
  flagExt$(str) {
    return this.flagSync$(this.flags$ext = str);
  }
  flagSelf$(str) {
    this.flagDeopt$();
    return this.flagSelf$(str);
  }
  flagSync$() {
    return this.className = (this.flags$ns || "") + (this.flags$ext || "") + " " + (this.flags$own || "") + " " + (this.$flags || "");
  }
  set$(key, value) {
    let desc = getDeepPropertyDescriptor(this, key, Element);
    if (!desc || !desc.set) {
      this.setAttribute(key, value);
    } else {
      this[key] = value;
    }
    ;
    return;
  }
  get richValue() {
    return this.value;
  }
  set richValue(value) {
    this.value = value;
  }
};
extend$__(Element.prototype, \u03A9Element\u03A9ah.prototype);
Element.prototype.setns$ = Element.prototype.setAttributeNS;
Element.prototype[$322] = true;
function createElement(name, parent, flags, text) {
  let el = globalThis.document.createElement(name);
  if (flags) {
    el.className = flags;
  }
  ;
  if (text !== null) {
    el.text$(text);
  }
  ;
  if (parent && parent[$103]) {
    parent[$103](el);
  }
  ;
  return el;
}
var \u03A9SVGElement\u03A9ai = class {
  set$(key, value) {
    var $332;
    let cache = descriptorCache[$332 = this.nodeName] || (descriptorCache[$332] = {});
    let desc = getDescriptor(this, key, cache);
    if (!desc || !desc.set) {
      this.setAttribute(key, value);
    } else {
      this[key] = value;
    }
    ;
    return;
  }
  flag$(str) {
    let ns = this.flags$ns;
    this.setAttribute("class", ns ? ns + (this.flags$ext = str) : this.flags$ext = str);
    return;
  }
  flagSelf$(str) {
    var self = this;
    self.flag$ = function(str2) {
      return self.flagSync$(self.flags$ext = str2);
    };
    self.flagSelf$ = function(str2) {
      return self.flagSync$(self.flags$own = str2);
    };
    return self.flagSelf$(str);
  }
  flagSync$() {
    return this.setAttribute("class", (this.flags$ns || "") + (this.flags$ext || "") + " " + (this.flags$own || "") + " " + (this.$flags || ""));
  }
};
extend$__(SVGElement.prototype, \u03A9SVGElement\u03A9ai.prototype);
var \u03A9SVGSVGElement\u03A9aj = class {
  set src(value) {
    if (this[$342] != value ? (this[$342] = value, true) : false) {
      if (value) {
        if (value.adoptNode) {
          value.adoptNode(this);
        } else if (value.content) {
          for (let $372 = value.attributes, $352 = 0, $363 = Object.keys($372), $383 = $363.length, k, v; $352 < $383; $352++) {
            k = $363[$352];
            v = $372[k];
            this.setAttribute(k, v);
          }
          ;
          this.innerHTML = value.content;
        }
        ;
      }
      ;
    }
    ;
    return;
  }
};
extend$__(SVGSVGElement.prototype, \u03A9SVGSVGElement\u03A9aj.prototype);
function createSVGElement(name, parent, flags, text, ctx) {
  let el = globalThis.document.createElementNS("http://www.w3.org/2000/svg", name);
  if (flags) {
    el.className.baseVal = flags;
  }
  ;
  if (parent && parent[$103]) {
    parent[$103](el);
  }
  ;
  if (text) {
    el.textContent = text;
  }
  ;
  return el;
}
function createComment(text) {
  return globalThis.document.createComment(text);
}
function createTextNode(text) {
  return globalThis.document.createTextNode(text);
}
var navigator = globalThis.navigator;
var vendor = navigator && navigator.vendor || "";
var ua = navigator && navigator.userAgent || "";
var isSafari = vendor.indexOf("Apple") > -1 || ua.indexOf("CriOS") >= 0 || ua.indexOf("FxiOS") >= 0;
var supportsCustomizedBuiltInElements = !isSafari;
var CustomDescriptorCache = new Map();
var CustomHook = class extends HTMLElement {
  connectedCallback() {
    if (supportsCustomizedBuiltInElements) {
      return this.parentNode.removeChild(this);
    } else {
      return this.parentNode.connectedCallback();
    }
    ;
  }
  disconnectedCallback() {
    if (!supportsCustomizedBuiltInElements) {
      return this.parentNode.disconnectedCallback();
    }
    ;
  }
};
window.customElements.define("i-hook", CustomHook);
function getCustomDescriptors(el, klass) {
  let props = CustomDescriptorCache.get(klass);
  if (!props) {
    props = {};
    let proto = klass.prototype;
    let protos = [proto];
    while (proto = proto && Object.getPrototypeOf(proto)) {
      if (proto.constructor == el.constructor) {
        break;
      }
      ;
      protos.unshift(proto);
    }
    ;
    for (let $392 = 0, $40 = iter$__2(protos), $41 = $40.length; $392 < $41; $392++) {
      let item = $40[$392];
      let desc = Object.getOwnPropertyDescriptors(item);
      Object.assign(props, desc);
    }
    ;
    CustomDescriptorCache.set(klass, props);
  }
  ;
  return props;
}
function createComponent(name, parent, flags, text, ctx) {
  let el;
  if (typeof name != "string") {
    if (name && name.nodeName) {
      name = name.nodeName;
    }
    ;
  }
  ;
  let cmpname = CustomTagToElementNames[name] || name;
  if (CustomTagConstructors[name]) {
    let cls = CustomTagConstructors[name];
    let typ = cls.prototype[$422];
    if (typ && supportsCustomizedBuiltInElements) {
      el = globalThis.document.createElement(typ, {is: name});
    } else if (cls.create$ && typ) {
      el = globalThis.document.createElement(typ);
      el.setAttribute("is", cmpname);
      let props = getCustomDescriptors(el, cls);
      Object.defineProperties(el, props);
      el.__slots = {};
      el.appendChild(globalThis.document.createElement("i-hook"));
    } else if (cls.create$) {
      el = cls.create$(el);
      el.__slots = {};
    } else {
      console.warn("could not create tag " + name);
    }
    ;
  } else {
    el = globalThis.document.createElement(CustomTagToElementNames[name] || name);
  }
  ;
  el[$262] = parent;
  el[$53]();
  el[$63]();
  if (text !== null) {
    el[$432]("__").text$(text);
  }
  ;
  if (flags || el.flags$ns) {
    el.flag$(flags || "");
  }
  ;
  return el;
}
function defineTag(name, klass, options = {}) {
  TYPES[name] = CUSTOM_TYPES[name] = klass;
  klass.nodeName = name;
  let componentName = name;
  let proto = klass.prototype;
  if (name.indexOf("-") == -1) {
    componentName = "" + name + "-tag";
    CustomTagToElementNames[name] = componentName;
  }
  ;
  if (options.cssns) {
    let ns = (proto._ns_ || proto[$452] || "") + " " + (options.cssns || "");
    proto._ns_ = ns.trim() + " ";
    proto[$452] = options.cssns;
  }
  ;
  if (options.cssid) {
    let ids = (proto.flags$ns || "") + " " + options.cssid;
    proto[$46] = options.cssid;
    proto.flags$ns = ids.trim() + " ";
  }
  ;
  if (proto[$422] && !options.extends) {
    options.extends = proto[$422];
  }
  ;
  if (options.extends) {
    proto[$422] = options.extends;
    CustomTagConstructors[name] = klass;
    if (supportsCustomizedBuiltInElements) {
      window.customElements.define(componentName, klass, {extends: options.extends});
    }
    ;
  } else {
    window.customElements.define(componentName, klass);
  }
  ;
  return klass;
}
var instance2 = globalThis.imba || (globalThis.imba = {});
instance2.document = globalThis.document;

// node_modules/imba/src/imba/dom/fragment.imba
function iter$__3(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : a;
}
function extend$__2(target, ext) {
  const descriptors = Object.getOwnPropertyDescriptors(ext);
  delete descriptors.constructor;
  Object.defineProperties(target, descriptors);
  return target;
}
var $110 = Symbol.for("#parent");
var $210 = Symbol.for("#closestNode");
var $37 = Symbol.for("#isRichElement");
var $47 = Symbol.for("#afterVisit");
var $153 = Symbol.for("#__initor__");
var $163 = Symbol.for("#__inited__");
var $54 = Symbol.for("#__hooks__");
var $64 = Symbol.for("#appendChild");
var $75 = Symbol.for("#removeChild");
var $85 = Symbol.for("#insertInto");
var $93 = Symbol.for("#replaceWith");
var $104 = Symbol.for("#insertChild");
var $113 = Symbol.for("#removeFrom");
var $124 = Symbol.for("#placeChild");
var $144 = Symbol.for("#__init__");
var $173 = Symbol.for("#registerFunctionalSlot");
var $183 = Symbol.for("#getFunctionalSlot");
var $193 = Symbol.for("#getSlot");
var $203 = Symbol.for("##parent");
var $213 = Symbol.for("##up");
var $223 = Symbol.for("##flags");
var $233 = Symbol.for("#domFlags");
var $243 = Symbol.for("#end");
var $253 = Symbol.for("#textContent");
var $293 = Symbol.for("#textNode");
var $362 = Symbol.for("#functionalSlots");
var $134 = Symbol();
var Fragment = class {
  constructor() {
    this.childNodes = [];
  }
  log(...params) {
    return;
  }
  hasChildNodes() {
    return false;
  }
  set [$110](value) {
    this[$203] = value;
  }
  get [$110]() {
    return this[$203] || this[$213];
  }
  get [$210]() {
    return this[$110][$210];
  }
  get [$37]() {
    return true;
  }
  get flags() {
    return this[$223] || (this[$223] = new Flags(this));
  }
  flagSync$() {
    return this;
  }
  [$47]() {
    return this;
  }
};
var counter = 0;
var VirtualFragment = class extends Fragment {
  static [$144]() {
    this.prototype[$153] = $134;
    return this;
  }
  constructor(flags, parent) {
    super(...arguments);
    this[$213] = parent;
    this.parentNode = null;
    this[$233] = flags;
    this.childNodes = [];
    this[$243] = createComment("slot" + counter++);
    if (parent) {
      parent[$64](this);
    }
    ;
    this[$153] === $134 && (this[$54] && this[$54].inited(this), this[$163] && this[$163]());
  }
  get [$110]() {
    return this[$203] || this.parentNode || this[$213];
  }
  set textContent(text) {
    this[$253] = text;
  }
  get textContent() {
    return this[$253];
  }
  hasChildNodes() {
    for (let $264 = 0, $273 = iter$__3(this.childNodes), $283 = $273.length; $264 < $283; $264++) {
      let item = $273[$264];
      if (item instanceof Fragment) {
        if (item.hasChildNodes()) {
          return true;
        }
        ;
      }
      ;
      if (item instanceof Comment) {
        true;
      } else if (item instanceof Node) {
        return true;
      }
      ;
    }
    ;
    return false;
  }
  text$(item) {
    if (!this[$293]) {
      this[$293] = this[$124](item);
    } else {
      this[$293].textContent = item;
    }
    ;
    return this[$293];
  }
  appendChild(child) {
    if (this.parentNode) {
      child[$85](this.parentNode, this[$243]);
    }
    ;
    return this.childNodes.push(child);
  }
  [$64](child) {
    if (this.parentNode) {
      child[$85](this.parentNode, this[$243]);
    }
    ;
    return this.childNodes.push(child);
  }
  insertBefore(node, refnode) {
    if (this.parentNode) {
      this.parentNode[$104](node, refnode);
    }
    ;
    let idx = this.childNodes.indexOf(refnode);
    if (idx >= 0) {
      this.childNodes.splice(idx, 0, node);
    }
    ;
    return node;
  }
  [$75](node) {
    if (this.parentNode) {
      this.parentNode[$75](node);
    }
    ;
    let idx = this.childNodes.indexOf(node);
    if (idx >= 0) {
      this.childNodes.splice(idx, 1);
    }
    ;
    return;
  }
  [$85](parent, before) {
    let prev = this.parentNode;
    if (this.parentNode != parent ? (this.parentNode = parent, true) : false) {
      if (this[$243]) {
        before = this[$243][$85](parent, before);
      }
      ;
      for (let $302 = 0, $312 = iter$__3(this.childNodes), $323 = $312.length; $302 < $323; $302++) {
        let item = $312[$302];
        item[$85](parent, before);
      }
      ;
    }
    ;
    return this;
  }
  [$93](node, parent) {
    let res = node[$85](parent, this[$243]);
    this[$113](parent);
    return res;
  }
  [$104](node, refnode) {
    if (this.parentNode) {
      this.insertBefore(node, refnode || this[$243]);
    }
    ;
    if (refnode) {
      let idx = this.childNodes.indexOf(refnode);
      if (idx >= 0) {
        this.childNodes.splice(idx, 0, node);
      }
      ;
    } else {
      this.childNodes.push(node);
    }
    ;
    return node;
  }
  [$113](parent) {
    for (let $332 = 0, $344 = iter$__3(this.childNodes), $352 = $344.length; $332 < $352; $332++) {
      let item = $344[$332];
      item[$113](parent);
    }
    ;
    if (this[$243]) {
      this[$243][$113](parent);
    }
    ;
    this.parentNode = null;
    return this;
  }
  [$124](item, f, prev) {
    let par = this.parentNode;
    let type = typeof item;
    if (type === "undefined" || item === null) {
      if (prev && prev instanceof Comment) {
        return prev;
      }
      ;
      let el = createComment("");
      if (prev) {
        let idx = this.childNodes.indexOf(prev);
        this.childNodes.splice(idx, 1, el);
        if (par) {
          prev[$93](el, par);
        }
        ;
        return el;
      }
      ;
      this.childNodes.push(el);
      if (par) {
        el[$85](par, this[$243]);
      }
      ;
      return el;
    }
    ;
    if (item === prev) {
      return item;
    }
    ;
    if (type !== "object") {
      let res;
      let txt = item;
      if (prev) {
        if (prev instanceof Text) {
          prev.textContent = txt;
          return prev;
        } else {
          res = createTextNode(txt);
          let idx = this.childNodes.indexOf(prev);
          this.childNodes.splice(idx, 1, res);
          if (par) {
            prev[$93](res, par);
          }
          ;
          return res;
        }
        ;
      } else {
        this.childNodes.push(res = createTextNode(txt));
        if (par) {
          res[$85](par, this[$243]);
        }
        ;
        return res;
      }
      ;
    } else if (prev) {
      let idx = this.childNodes.indexOf(prev);
      this.childNodes.splice(idx, 1, item);
      if (par) {
        prev[$93](item, par);
      }
      ;
      return item;
    } else {
      this.childNodes.push(item);
      if (par) {
        item[$85](par, this[$243]);
      }
      ;
      return item;
    }
    ;
  }
};
VirtualFragment[$144]();
function createSlot(bitflags, par) {
  const el = new VirtualFragment(bitflags, null);
  el[$213] = par;
  return el;
}
var \u03A9Node\u03A9af = class {
  [$173](name) {
    let map = this[$362] || (this[$362] = {});
    return map[name] || (map[name] = createSlot(0, this));
  }
  [$183](name, context) {
    let map = this[$362];
    return map && map[name] || this[$193](name, context);
  }
  [$193](name, context) {
    var $372;
    if (name == "__" && !this.render) {
      return this;
    }
    ;
    return ($372 = this.__slots)[name] || ($372[name] = createSlot(0, this));
  }
};
extend$__2(Node.prototype, \u03A9Node\u03A9af.prototype);

// node_modules/imba/src/imba/dom/indexed-list.imba
function iter$__4(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : a;
}
var $111 = Symbol.for("#afterVisit");
var $211 = Symbol.for("#insertInto");
var $38 = Symbol.for("#appendChild");
var $48 = Symbol.for("#replaceWith");
var $55 = Symbol.for("#removeFrom");
var $94 = Symbol.for("#__initor__");
var $105 = Symbol.for("#__inited__");
var $65 = Symbol.for("#__hooks__");
var $86 = Symbol.for("#__init__");
var $114 = Symbol.for("#domFlags");
var $125 = Symbol.for("##parent");
var $135 = Symbol.for("#end");
var $145 = Symbol.for("#removeChild");
var $154 = Symbol.for("#insertChild");
var $76 = Symbol();
var IndexedTagFragment = class extends Fragment {
  static [$86]() {
    this.prototype[$94] = $76;
    return this;
  }
  constructor(f, parent) {
    super(...arguments);
    this[$114] = f;
    this[$125] = parent;
    if (!(f & 256)) {
      this[$135] = createComment("list");
    }
    ;
    this.$ = this.childNodes;
    this.length = 0;
    if (parent) {
      parent[$38](this);
    }
    ;
    this[$94] === $76 && (this[$65] && this[$65].inited(this), this[$105] && this[$105]());
  }
  hasChildNodes() {
    if (this.length == 0) {
      return false;
    }
    ;
    return true;
  }
  [$111](len) {
    let from = this.length;
    this.length = len;
    if (from == len) {
      return;
    }
    ;
    let par = this.parentNode;
    if (!par) {
      return;
    }
    ;
    let array = this.childNodes;
    let end = this[$135];
    if (from > len) {
      while (from > len) {
        par[$145](array[--from]);
      }
      ;
    } else if (len > from) {
      while (len > from) {
        par[$154](array[from++], end);
      }
      ;
    }
    ;
    this.length = len;
    return;
  }
  [$211](parent, before) {
    this.parentNode = parent;
    if (this[$135]) {
      this[$135][$211](parent, before);
    }
    ;
    before = this[$135];
    for (let i = 0, $165 = iter$__4(this.childNodes), $174 = $165.length; i < $174; i++) {
      let item = $165[i];
      if (i == this.length) {
        break;
      }
      ;
      item[$211](parent, before);
    }
    ;
    return this;
  }
  [$38](item) {
    return;
  }
  [$48](rel, parent) {
    let res = rel[$211](parent, this[$135]);
    this[$55](parent);
    return res;
  }
  [$55](parent) {
    let i = this.length;
    while (i > 0) {
      let el = this.childNodes[--i];
      el[$55](parent);
    }
    ;
    if (this[$135]) {
      parent.removeChild(this[$135]);
    }
    ;
    this.parentNode = null;
    return;
  }
};
IndexedTagFragment[$86]();
function createIndexedList(bitflags, parent) {
  return new IndexedTagFragment(bitflags, parent);
}

// node_modules/imba/src/imba/dom/component.imba
function iter$__5(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : a;
}
var $115 = Symbol.for("#__init__");
var $214 = Symbol.for("#__patch__");
var $39 = Symbol.for("##inited");
var $49 = Symbol.for("#afterVisit");
var $56 = Symbol.for("#beforeReconcile");
var $66 = Symbol.for("#afterReconcile");
var $116 = Symbol.for("#count");
var $155 = Symbol.for("#__hooks__");
var $164 = Symbol.for("#autorender");
var hydrator = new class {
  [$214]($$ = {}) {
    var $77;
    ($77 = $$.items) !== void 0 && (this.items = $77);
    ($77 = $$.current) !== void 0 && (this.current = $77);
    ($77 = $$.lastQueued) !== void 0 && (this.lastQueued = $77);
    ($77 = $$.tests) !== void 0 && (this.tests = $77);
  }
  constructor($$ = null) {
    this[$115]($$);
  }
  [$115]($$ = null, deep = true) {
    var $810;
    this.items = $$ && ($810 = $$.items) !== void 0 ? $810 : [];
    this.current = $$ && ($810 = $$.current) !== void 0 ? $810 : null;
    this.lastQueued = $$ && ($810 = $$.lastQueued) !== void 0 ? $810 : null;
    this.tests = $$ && ($810 = $$.tests) !== void 0 ? $810 : 0;
  }
  flush() {
    let item = null;
    if (false) {
    }
    ;
    while (item = this.items.shift()) {
      if (!item.parentNode || item.hydrated\u03A6) {
        continue;
      }
      ;
      let prev = this.current;
      this.current = item;
      item.__F |= 1024;
      item.connectedCallback();
      this.current = prev;
    }
    ;
    return;
  }
  queue(item) {
    var self = this;
    let len = this.items.length;
    let idx = 0;
    let prev = this.lastQueued;
    this.lastQueued = item;
    let BEFORE = Node.DOCUMENT_POSITION_PRECEDING;
    let AFTER = Node.DOCUMENT_POSITION_FOLLOWING;
    if (len) {
      let prevIndex = this.items.indexOf(prev);
      let index = prevIndex;
      let compare = function(a, b) {
        self.tests++;
        return a.compareDocumentPosition(b);
      };
      if (prevIndex == -1 || prev.nodeName != item.nodeName) {
        index = prevIndex = 0;
      }
      ;
      let curr = self.items[index];
      while (curr && compare(curr, item) & AFTER) {
        curr = self.items[++index];
      }
      ;
      if (index != prevIndex) {
        curr ? self.items.splice(index, 0, item) : self.items.push(item);
      } else {
        while (curr && compare(curr, item) & BEFORE) {
          curr = self.items[--index];
        }
        ;
        if (index != prevIndex) {
          curr ? self.items.splice(index + 1, 0, item) : self.items.unshift(item);
        }
        ;
      }
      ;
    } else {
      self.items.push(item);
      if (!self.current) {
        globalThis.queueMicrotask(self.flush.bind(self));
      }
      ;
    }
    ;
    return;
  }
  run(item) {
    var $147, $126;
    if (this.active) {
      return;
    }
    ;
    this.active = true;
    let all = globalThis.document.querySelectorAll(".__ssr");
    console.log("running hydrator", item, all.length, Array.from(all));
    for (let $96 = 0, $106 = iter$__5(all), $136 = $106.length; $96 < $136; $96++) {
      let item2 = $106[$96];
      item2[$116] || (item2[$116] = 1);
      item2[$116]++;
      let name = item2.nodeName;
      let typ = ($126 = this.map)[name] || ($126[name] = globalThis.window.customElements.get(name.toLowerCase()) || HTMLElement);
      console.log("item type", name, typ, !!CUSTOM_TYPES[name.toLowerCase()]);
      if (!item2.connectedCallback || !item2.parentNode || item2.hydrated\u03A6) {
        continue;
      }
      ;
      console.log("hydrate", item2);
    }
    ;
    return this.active = false;
  }
}();
var Component = class extends HTMLElement {
  constructor() {
    super();
    if (this.flags$ns) {
      this.flag$ = this.flagExt$;
    }
    ;
    this.setup$();
    this.build();
  }
  setup$() {
    this.__slots = {};
    return this.__F = 0;
  }
  [$115]() {
    this.__F |= 1 | 2;
    return this;
  }
  [$39]() {
    if (this[$155]) {
      return this[$155].inited(this);
    }
    ;
  }
  flag$(str) {
    this.className = this.flags$ext = str;
    return;
  }
  build() {
    return this;
  }
  awaken() {
    return this;
  }
  mount() {
    return this;
  }
  unmount() {
    return this;
  }
  rendered() {
    return this;
  }
  dehydrate() {
    return this;
  }
  hydrate() {
    this.autoschedule = true;
    return this;
  }
  tick() {
    return this.commit();
  }
  visit() {
    return this.commit();
  }
  commit() {
    if (!this.render\u03A6) {
      this.__F |= 8192;
      return this;
    }
    ;
    this.__F |= 256;
    this.render && this.render();
    this.rendered();
    return this.__F = (this.__F | 512) & ~256 & ~8192;
  }
  get autoschedule() {
    return (this.__F & 64) != 0;
  }
  set autoschedule(value) {
    value ? this.__F |= 64 : this.__F &= ~64;
  }
  set autorender(value) {
    let o = this[$164] || (this[$164] = {});
    o.value = value;
    if (this.mounted\u03A6) {
      scheduler.schedule(this, o);
    }
    ;
    return;
  }
  get render\u03A6() {
    return !this.suspended\u03A6;
  }
  get mounting\u03A6() {
    return (this.__F & 16) != 0;
  }
  get mounted\u03A6() {
    return (this.__F & 32) != 0;
  }
  get awakened\u03A6() {
    return (this.__F & 8) != 0;
  }
  get rendered\u03A6() {
    return (this.__F & 512) != 0;
  }
  get suspended\u03A6() {
    return (this.__F & 4096) != 0;
  }
  get rendering\u03A6() {
    return (this.__F & 256) != 0;
  }
  get scheduled\u03A6() {
    return (this.__F & 128) != 0;
  }
  get hydrated\u03A6() {
    return (this.__F & 2) != 0;
  }
  get ssr\u03A6() {
    return (this.__F & 1024) != 0;
  }
  schedule() {
    scheduler.on("commit", this);
    this.__F |= 128;
    return this;
  }
  unschedule() {
    scheduler.un("commit", this);
    this.__F &= ~128;
    return this;
  }
  async suspend(cb = null) {
    let val = this.flags.incr("_suspended_");
    this.__F |= 4096;
    if (cb instanceof Function) {
      await cb();
      this.unsuspend();
    }
    ;
    return this;
  }
  unsuspend() {
    let val = this.flags.decr("_suspended_");
    if (val == 0) {
      this.__F &= ~4096;
      this.commit();
      ;
    }
    ;
    return this;
  }
  [$49]() {
    return this.visit();
  }
  [$56]() {
    if (this.__F & 1024) {
      this.__F = this.__F & ~1024;
      this.classList.remove("_ssr_");
      if (this.flags$ext && this.flags$ext.indexOf("_ssr_") == 0) {
        this.flags$ext = this.flags$ext.slice(5);
      }
      ;
      if (!(this.__F & 512)) {
        this.innerHTML = "";
      }
      ;
    }
    ;
    if (true) {
      renderer.push(this);
    }
    ;
    return this;
  }
  [$66]() {
    if (true) {
      renderer.pop(this);
    }
    ;
    return this;
  }
  connectedCallback() {
    let flags = this.__F;
    let inited = flags & 1;
    let awakened = flags & 8;
    if (!inited && !(flags & 1024)) {
      hydrator.queue(this);
      return;
    }
    ;
    if (flags & (16 | 32)) {
      return;
    }
    ;
    this.__F |= 16;
    if (!inited) {
      this[$115]();
    }
    ;
    if (!(flags & 2)) {
      this.flags$ext = this.className;
      this.__F |= 2;
      this.hydrate();
      this.commit();
    }
    ;
    if (!awakened) {
      this.awaken();
      this.__F |= 8;
    }
    ;
    emit(this, "mount");
    let res = this.mount();
    if (res && res.then instanceof Function) {
      res.then(scheduler.commit);
    }
    ;
    flags = this.__F = (this.__F | 32) & ~16;
    if (flags & 64) {
      this.schedule();
    }
    ;
    if (this[$164]) {
      scheduler.schedule(this, this[$164]);
    }
    ;
    return this;
  }
  disconnectedCallback() {
    this.__F = this.__F & (~32 & ~16);
    if (this.__F & 128) {
      this.unschedule();
    }
    ;
    emit(this, "unmount");
    this.unmount();
    if (this[$164]) {
      return scheduler.unschedule(this, this[$164]);
    }
    ;
  }
};

// node_modules/imba/src/imba/dom/mount.imba
var $117 = Symbol.for("#insertInto");
var $215 = Symbol.for("#removeFrom");
function mount(mountable, into) {
  if (false) {
  }
  ;
  let parent = into || globalThis.document.body;
  let element = mountable;
  if (mountable instanceof Function) {
    let ctx = new RenderContext(parent, null);
    let tick = function() {
      let prev = renderContext.context;
      renderContext.context = ctx;
      let res = mountable(ctx);
      if (renderContext.context == ctx) {
        renderContext.context = prev;
      }
      ;
      return res;
    };
    element = tick();
    scheduler.listen("commit", tick);
  } else {
    element.__F |= 64;
  }
  ;
  element[$117](parent);
  return element;
}
function unmount(el) {
  if (el && el[$215]) {
    el[$215](el.parentNode);
  }
  ;
  return el;
}
var instance3 = globalThis.imba || (globalThis.imba = {});
instance3.mount = mount;
instance3.unmount = unmount;

// node_modules/imba/src/imba/events/keyboard.imba
function extend$__3(target, ext) {
  const descriptors = Object.getOwnPropertyDescriptors(ext);
  delete descriptors.constructor;
  Object.defineProperties(target, descriptors);
  return target;
}
function use_events_keyboard() {
  return true;
}
var \u03A9KeyboardEvent\u03A9af = class {
  \u03B1esc() {
    return this.keyCode == 27;
  }
  \u03B1tab() {
    return this.keyCode == 9;
  }
  \u03B1enter() {
    return this.keyCode == 13;
  }
  \u03B1space() {
    return this.keyCode == 32;
  }
  \u03B1up() {
    return this.keyCode == 38;
  }
  \u03B1down() {
    return this.keyCode == 40;
  }
  \u03B1left() {
    return this.keyCode == 37;
  }
  \u03B1right() {
    return this.keyCode == 39;
  }
  \u03B1del() {
    return this.keyCode == 8 || this.keyCode == 46;
  }
  \u03B1key(code) {
    if (typeof code == "string") {
      return this.key == code;
    } else if (typeof code == "number") {
      return this.keyCode == code;
    }
    ;
  }
};
extend$__3(KeyboardEvent.prototype, \u03A9KeyboardEvent\u03A9af.prototype);

// node_modules/imba/src/imba/events/mouse.imba
function extend$__4(target, ext) {
  const descriptors = Object.getOwnPropertyDescriptors(ext);
  delete descriptors.constructor;
  Object.defineProperties(target, descriptors);
  return target;
}
function use_events_mouse() {
  return true;
}
var \u03A9MouseEvent\u03A9af = class {
  \u03B1left() {
    return this.button == 0;
  }
  \u03B1middle() {
    return this.button == 1;
  }
  \u03B1right() {
    return this.button == 2;
  }
  \u03B1shift() {
    return !!this.shiftKey;
  }
  \u03B1alt() {
    return !!this.altKey;
  }
  \u03B1ctrl() {
    return !!this.ctrlKey;
  }
  \u03B1meta() {
    return !!this.metaKey;
  }
  \u03B1mod() {
    let nav = globalThis.navigator.platform;
    return /^(Mac|iPhone|iPad|iPod)/.test(nav || "") ? !!this.metaKey : !!this.ctrlKey;
  }
};
extend$__4(MouseEvent.prototype, \u03A9MouseEvent\u03A9af.prototype);

// node_modules/imba/src/imba/events/core.imba
function extend$__5(target, ext) {
  const descriptors = Object.getOwnPropertyDescriptors(ext);
  delete descriptors.constructor;
  Object.defineProperties(target, descriptors);
  return target;
}
function iter$__6(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : a;
}
var $118 = Symbol.for("#extendType");
var $216 = Symbol.for("#modifierState");
var $310 = Symbol.for("#sharedModifierState");
var $410 = Symbol.for("#onceHandlerEnd");
var $254 = Symbol.for("#__initor__");
var $263 = Symbol.for("#__inited__");
var $57 = Symbol.for("#__hooks__");
var $67 = Symbol.for("#extendDescriptors");
var $95 = Symbol.for("#context");
var $146 = Symbol.for("#self");
var $156 = Symbol.for("#target");
var $224 = Symbol.for("#stopPropagation");
var $234 = Symbol.for("#defaultPrevented");
use_events_keyboard();
use_events_mouse();
var \u03A9CustomEvent\u03A9af = class {
  [$118](kls) {
    var $810, desc, $77;
    let ext = kls[$67] || (kls[$67] = (desc = Object.getOwnPropertyDescriptors(kls.prototype), $77 = desc.constructor, delete desc.constructor, $77, desc));
    return Object.defineProperties(this, ext);
  }
};
extend$__5(CustomEvent.prototype, \u03A9CustomEvent\u03A9af.prototype);
var \u03A9Event\u03A9ag = class {
  get [$216]() {
    var $119, $106;
    return ($119 = this[$95])[$106 = this[$95].step] || ($119[$106] = {});
  }
  get [$310]() {
    var $136, $126;
    return ($136 = this[$95].handler)[$126 = this[$95].step] || ($136[$126] = {});
  }
  [$410](cb) {
    return once(this[$95], "end", cb);
  }
  \u03B1sel(selector) {
    return !!this.target.matches(String(selector));
  }
  \u03B1closest(selector) {
    return !!this.target.closest(String(selector));
  }
  \u03B1log(...params) {
    console.info(...params);
    return true;
  }
  \u03B1trusted() {
    return !!this.isTrusted;
  }
  \u03B1if(expr) {
    return !!expr;
  }
  \u03B1wait(time = 250) {
    return new Promise(function(_0) {
      return setTimeout(_0, parseTime(time));
    });
  }
  \u03B1self() {
    return this.target == this[$95].element;
  }
  \u03B1cooldown(time = 250) {
    let o = this[$310];
    if (o.active) {
      return false;
    }
    ;
    o.active = true;
    o.target = this[$95].element;
    o.target.flags.incr("cooldown");
    this[$410](function() {
      return setTimeout(function() {
        o.target.flags.decr("cooldown");
        return o.active = false;
      }, parseTime(time));
    });
    return true;
  }
  \u03B1throttle(time = 250) {
    let o = this[$310];
    if (o.active) {
      if (o.next) {
        o.next(false);
      }
      ;
      return new Promise(function(r) {
        return o.next = function(val) {
          o.next = null;
          return r(val);
        };
      });
    }
    ;
    o.active = true;
    o.el || (o.el = this[$95].element);
    o.el.flags.incr("throttled");
    once(this[$95], "end", function() {
      let delay = parseTime(time);
      return o.interval = setInterval(function() {
        if (o.next) {
          o.next(true);
        } else {
          clearInterval(o.interval);
          o.el.flags.decr("throttled");
          o.active = false;
        }
        ;
        return;
      }, delay);
    });
    return true;
  }
  \u03B1debounce(time = 250) {
    let o = this[$310];
    let e = this;
    o.queue || (o.queue = []);
    o.queue.push(o.last = e);
    return new Promise(function(resolve) {
      return setTimeout(function() {
        if (o.last == e) {
          e.debounced = o.queue;
          o.last = null;
          o.queue = [];
          return resolve(true);
        } else {
          return resolve(false);
        }
        ;
      }, parseTime(time));
    });
  }
  \u03B1flag(name, sel) {
    const {element, step, state, id, current} = this[$95];
    let el = sel instanceof Element ? sel : sel ? element.closest(sel) : element;
    if (!el) {
      return true;
    }
    ;
    this[$95].commit = true;
    state[step] = id;
    el.flags.incr(name);
    let ts = Date.now();
    once(current, "end", function() {
      let elapsed = Date.now() - ts;
      let delay = Math.max(250 - elapsed, 0);
      return setTimeout(function() {
        return el.flags.decr(name);
      }, delay);
    });
    return true;
  }
  \u03B1busy(sel) {
    return this["\u03B1flag"]("busy", sel);
  }
  \u03B1mod(name) {
    return this["\u03B1flag"]("mod-" + name, globalThis.document.documentElement);
  }
  \u03B1outside() {
    const {handler} = this[$95];
    if (handler && handler[$146]) {
      return !handler[$146].parentNode.contains(this.target);
    }
    ;
  }
};
extend$__5(Event.prototype, \u03A9Event\u03A9ag.prototype);
function use_events() {
  return true;
}
var EventHandler = class {
  constructor(params, closure) {
    this.params = params;
    this.closure = closure;
  }
  getHandlerForMethod(el, name) {
    if (!el) {
      return null;
    }
    ;
    return el[name] ? el : this.getHandlerForMethod(el.parentNode, name);
  }
  emit(name, ...params) {
    return emit(this, name, params);
  }
  on(name, ...params) {
    return listen(this, name, ...params);
  }
  once(name, ...params) {
    return once(this, name, ...params);
  }
  un(name, ...params) {
    return unlisten(this, name, ...params);
  }
  get passive\u03A6() {
    return this.params.passive;
  }
  get capture\u03A6() {
    return this.params.capture;
  }
  get silent\u03A6() {
    return this.params.silent;
  }
  get global\u03A6() {
    return this.params.global;
  }
  async handleEvent(event) {
    let element = this[$156] || event.currentTarget;
    let mods = this.params;
    let error = null;
    let silence = mods.silence || mods.silent;
    this.count || (this.count = 0);
    this.state || (this.state = {});
    let state = {
      element,
      event,
      modifiers: mods,
      handler: this,
      id: ++this.count,
      step: -1,
      state: this.state,
      commit: null,
      current: null
    };
    state.current = state;
    if (event.handle$mod) {
      if (event.handle$mod.apply(state, mods.options || []) == false) {
        return;
      }
      ;
    }
    ;
    let guard = Event[this.type + "$handle"] || Event[event.type + "$handle"] || event.handle$mod;
    if (guard && guard.apply(state, mods.options || []) == false) {
      return;
    }
    ;
    this.currentEvents || (this.currentEvents = new Set());
    this.currentEvents.add(event);
    for (let $165 = 0, $174 = Object.keys(mods), $244 = $174.length, handler, val; $165 < $244; $165++) {
      handler = $174[$165];
      val = mods[handler];
      state.step++;
      if (handler[0] == "_") {
        continue;
      }
      ;
      if (handler.indexOf("~") > 0) {
        handler = handler.split("~")[0];
      }
      ;
      let modargs = null;
      let args = [event, state];
      let res = void 0;
      let context = null;
      let m;
      let negated = false;
      let isstring = typeof handler == "string";
      if (handler[0] == "$" && handler[1] == "_" && val[0] instanceof Function) {
        handler = val[0];
        if (!handler.passive) {
          state.commit = true;
        }
        ;
        args = [event, state].concat(val.slice(1));
        context = element;
      } else if (val instanceof Array) {
        args = val.slice();
        modargs = args;
        for (let i = 0, $184 = iter$__6(args), $218 = $184.length; i < $218; i++) {
          let par = $184[i];
          if (typeof par == "string" && par[0] == "~" && par[1] == "$") {
            let name = par.slice(2);
            let chain = name.split(".");
            let value = state[chain.shift()] || event;
            for (let i2 = 0, $194 = iter$__6(chain), $204 = $194.length; i2 < $204; i2++) {
              let part = $194[i2];
              value = value ? value[part] : void 0;
            }
            ;
            args[i] = value;
          }
          ;
        }
        ;
      }
      ;
      if (typeof handler == "string" && (m = handler.match(/^(emit|flag|mod|moved|pin|fit|refit|map|remap|css)-(.+)$/))) {
        if (!modargs) {
          modargs = args = [];
        }
        ;
        args.unshift(m[2]);
        handler = m[1];
      }
      ;
      if (handler == "trap") {
        event[$224] = true;
        event.stopImmediatePropagation();
        event[$234] = true;
        event.preventDefault();
      } else if (handler == "stop") {
        event[$224] = true;
        event.stopImmediatePropagation();
      } else if (handler == "prevent") {
        event[$234] = true;
        event.preventDefault();
      } else if (handler == "commit") {
        state.commit = true;
      } else if (handler == "once") {
        element.removeEventListener(event.type, this);
      } else if (handler == "options" || handler == "silence" || handler == "silent") {
        continue;
      } else if (handler == "emit") {
        let name = args[0];
        let detail = args[1];
        let e = new CustomEvent(name, {bubbles: true, detail});
        e.originalEvent = event;
        let customRes = element.dispatchEvent(e);
      } else if (typeof handler == "string") {
        if (handler[0] == "!") {
          negated = true;
          handler = handler.slice(1);
        }
        ;
        let path = "\u03B1" + handler;
        let fn = event[path];
        fn || (fn = this.type && Event[this.type + "$" + handler + "$mod"]);
        fn || (fn = event[handler + "$mod"] || Event[event.type + "$" + handler] || Event[handler + "$mod"]);
        if (fn instanceof Function) {
          handler = fn;
          context = state;
          args = modargs || [];
          if (event[path]) {
            context = event;
            event[$95] = state;
          }
          ;
        } else if (handler[0] == "_") {
          handler = handler.slice(1);
          context = this.closure;
        } else {
          context = this.getHandlerForMethod(element, handler);
        }
        ;
      }
      ;
      try {
        if (handler instanceof Function) {
          res = handler.apply(context || element, args);
        } else if (context) {
          res = context[handler].apply(context, args);
        }
        ;
        if (res && res.then instanceof Function && res != scheduler.$promise) {
          if (state.commit && !silence) {
            scheduler.commit();
          }
          ;
          res = await res;
        }
        ;
      } catch (e) {
        error = e;
        break;
      }
      ;
      if (negated && res === true) {
        break;
      }
      ;
      if (!negated && res === false) {
        break;
      }
      ;
      state.value = res;
    }
    ;
    emit(state, "end", state);
    if (state.commit && !silence) {
      scheduler.commit();
    }
    ;
    this.currentEvents.delete(event);
    if (this.currentEvents.size == 0) {
      this.emit("idle");
    }
    ;
    if (error) {
      throw error;
    }
    ;
    return;
  }
};
var \u03A9Element\u03A9ah2 = class {
  on$(type, mods, scope) {
    let check = "on$" + type;
    let handler;
    handler = new EventHandler(mods, scope);
    let capture = mods.capture || false;
    let passive = mods.passive;
    let o = capture;
    if (passive) {
      o = {passive, capture};
    }
    ;
    if (this[check] instanceof Function) {
      handler = this[check](mods, scope, handler, o);
    } else {
      this.addEventListener(type, handler, o);
    }
    ;
    return handler;
  }
};
extend$__5(Element.prototype, \u03A9Element\u03A9ah2.prototype);

// app/assets/youtube.svg
var youtube_default = "./__assets__/youtube-5U44QBMD.svg"        ;

// img:app/assets/youtube.svg
var youtube_default2 = /* @__PURE__ */ asset({
  url: youtube_default,
  type: "svg",
  meta: {attributes: {"aria-label": "YouTube", role: "img", viewBox: "0 0 512 512", fill: "#ed1d24"}, flags: [], content: '<rect\nwidth="512" height="512"\nrx="15%"/><path d="m427 169c-4-15-17-27-32-31-34-9-239-10-278 0-15 4-28 16-32 31-9 38-10 135 0 174 4 15 17 27 32 31 36 10 241 10 278 0 15-4 28-16 32-31 9-36 9-137 0-174" fill="#fff"/><path d="m220 203v106l93-53"/>'},
  toString: function() {
    return this.url;
  }
});

// app/assets/instagram.svg
var instagram_default = "./__assets__/instagram-MZQ5WP2S.svg"        ;

// img:app/assets/instagram.svg
var instagram_default2 = /* @__PURE__ */ asset({
  url: instagram_default,
  type: "svg",
  meta: {attributes: {"xmlns:xlink": "http://www.w3.org/1999/xlink", "aria-label": "Instagram", role: "img", viewBox: "0 0 512 512"}, flags: [], content: '<rect\nwidth="512" height="512"\nrx="15%"\nid="b"/><use fill="url(#a)" xlink:href="#b"/><use fill="url(#c)" xlink:href="#b"/><radialGradient\nid="a" cx=".4" cy="1" r="1"><stop offset=".1" stop-color="#fd5"/><stop offset=".5" stop-color="#ff543e"/><stop offset="1" stop-color="#c837ab"/></radialGradient><linearGradient\nid="c" x2=".2" y2="1"><stop offset=".1" stop-color="#3771c8"/><stop offset=".5" stop-color="#60f" stop-opacity="0"/></linearGradient><g\nfill="none" stroke="#fff" stroke-width="30"><rect width="308" height="308" x="102" y="102" rx="81"/><circle cx="256" cy="256" r="72"/><circle cx="347" cy="165" r="6"/></g>'},
  toString: function() {
    return this.url;
  }
});

// app/assets/github.svg
var github_default = "./__assets__/github-R6ZHCS5F.svg"        ;

// img:app/assets/github.svg
var github_default2 = /* @__PURE__ */ asset({
  url: github_default,
  type: "svg",
  meta: {attributes: {"aria-label": "GitHub", role: "img", viewBox: "0 0 512 512"}, flags: [], content: '<rect\nwidth="512" height="512"\nrx="15%"\nfill="#1B1817"/><path fill="#fff" d="M335 499c14 0 12 17 12 17H165s-2-17 12-17c13 0 16-6 16-12l-1-50c-71 16-86-28-86-28-12-30-28-37-28-37-24-16 1-16 1-16 26 2 40 26 40 26 22 39 59 28 74 22 2-17 9-28 16-35-57-6-116-28-116-126 0-28 10-51 26-69-3-6-11-32 3-67 0 0 21-7 70 26 42-12 86-12 128 0 49-33 70-26 70-26 14 35 6 61 3 67 16 18 26 41 26 69 0 98-60 120-117 126 10 8 18 24 18 48l-1 70c0 6 3 12 16 12z"/>'},
  toString: function() {
    return this.url;
  }
});

// app/assets/jilu.png
var jilu_default = "./__assets__/jilu-EOKI4YGZ.png"        ;

// img:app/assets/jilu.png
var jilu_default2 = asset({
  url: jilu_default,
  type: "image",
  width: 1470,
  height: 1470,
  toString: function() {
    return this.url;
  }
});

// app/assets/fto.png
var fto_default = "./__assets__/fto-SG3KF4MK.png"        ;

// img:app/assets/fto.png
var fto_default2 = asset({
  url: fto_default,
  type: "image",
  width: 512,
  height: 512,
  toString: function() {
    return this.url;
  }
});

// app/client.imba
function iter$__7(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : a;
}
var $217 = Symbol.for("#beforeReconcile");
var $343 = Symbol.for("#afterReconcile");
var $59 = Symbol.for("##up");
var $632 = Symbol.for("#placeChild");
var $652 = Symbol.for("#afterVisit");
var $752 = Symbol.for("#appendChild");
var $58 = Symbol();
var $382 = Symbol();
var $453 = Symbol();
var $492 = Symbol();
var $50 = Symbol();
var $61 = Symbol();
var $622 = Symbol();
var $69 = Symbol();
var $722 = Symbol();
var $79 = Symbol();
var $822 = Symbol();
var $852;
var $862 = getRenderContext();
var $87 = Symbol();
var $88;
var $89;
use_events(), use_events_mouse();
var page = "home";
var PageHomeComponent = class extends Component {
  render() {
    var $119, $311, $411, $68 = this._ns_ || "", $77, $810, $96, $106, $1110, $136, $147, $157, $174, $184, $194, $218, $225, $235, $244, $255, $264, $273, $283, $302, $312, $323;
    $119 = this;
    $119[$217]();
    ($311 = $411 = 1, $119[$58] === 1) || ($311 = $411 = 0, $119[$58] = 1);
    (!$311 || $411 & 2) && $119.flagSelf$("dc-af");
    $311 || ($77 = createElement("div", $119, `side dc_af ${$68}`, null));
    $311 || ($810 = createElement("h2", $77, `dc_af ${$68}`, "SOCIAL"));
    ;
    $311 || ($96 = createElement("div", $77, `link-container dc_af ${$68}`, null));
    $311 || ($106 = createElement("a", $96, `dc_af ${$68}`, null));
    $311 || ($106.href = "//youtube.com/c/familyfriendlymikey");
    $311 || ($1110 = createSVGElement("svg", $106, `link dc_af ${$68}`, null));
    $311 || $1110.set$("src", youtube_default2);
    ;
    ;
    ;
    $311 || ($136 = createElement("div", $77, `link-container dc_af ${$68}`, null));
    $311 || ($147 = createElement("a", $136, `dc_af ${$68}`, null));
    $311 || ($147.href = "//instagram.com/familyfriendlymikey/");
    $311 || ($157 = createSVGElement("svg", $147, `link dc_af ${$68}`, null));
    $311 || $157.set$("src", instagram_default2);
    ;
    ;
    ;
    $311 || ($174 = createElement("div", $77, `link-container dc_af ${$68}`, null));
    $311 || ($184 = createElement("a", $174, `dc_af ${$68}`, null));
    $311 || ($184.href = "//github.com/familyfriendlymikey");
    $311 || ($194 = createSVGElement("svg", $184, `link dc_af ${$68}`, null));
    $311 || $194.set$("src", github_default2);
    ;
    ;
    ;
    ;
    $311 || ($218 = createElement("div", $119, `side dc_af ${$68}`, null));
    $311 || ($225 = createElement("h2", $218, `dc_af ${$68}`, "APPS"));
    ;
    $311 || ($235 = createElement("div", $218, `link-container dc_af ${$68}`, null));
    $311 || ($244 = createElement("a", $235, `dc_af ${$68}`, null));
    $311 || ($244.href = "//fuzzyho.me");
    $311 || ($255 = createElement("div", $244, `emoji link dc_af ${$68}`, "\u{1F3E0}"));
    ;
    ;
    ;
    $311 || ($264 = createElement("div", $218, `link-container dc_af ${$68}`, null));
    $311 || ($273 = createElement("a", $264, `dc_af ${$68}`, null));
    $311 || ($273.href = "//jilu.pages.dev");
    $311 || ($283 = createElement("img", $273, `link dc_af ${$68}`, null));
    $311 || ($283.src = jilu_default2);
    ;
    ;
    ;
    $311 || ($302 = createElement("div", $218, `link-container dc_af ${$68}`, null));
    $311 || ($312 = createElement("a", $302, `dc_af ${$68}`, null));
    $311 || ($312.href = "//fto.pages.dev");
    $311 || ($323 = createElement("img", $312, `link dc_af ${$68}`, null));
    $311 || ($323.src = fto_default2);
    ;
    ;
    ;
    ;
    $119[$343]($411);
    return $119;
  }
};
defineTag("page-home", PageHomeComponent, {});
var AppTabsComponent = class extends Component {
  render() {
    var $352, $363, $372, $392 = this._ns_ || "", $40, $41;
    $352 = this;
    $352[$217]();
    ($363 = $372 = 1, $352[$382] === 1) || ($363 = $372 = 0, $352[$382] = 1);
    (!$363 || $372 & 2) && $352.flagSelf$("dc-bc");
    $363 || ($40 = createElement("div", $352, `tab dc_bc ${$392}`, "HOME"));
    $363 || $40.on$(`click`, {$_: [function(e, $$) {
      return page = "home";
    }]}, this);
    ;
    $363 || ($41 = createElement("div", $352, `tab dc_bc ${$392}`, "LISTS"));
    $363 || $41.on$(`click`, {$_: [function(e, $$) {
      return page = "lists";
    }]}, this);
    ;
    $352[$343]($372);
    return $352;
  }
};
defineTag("app-tabs", AppTabsComponent, {});
var AppTableComponent = class extends Component {
  render() {
    var $423, $433, $443, $462 = this._ns_ || "", $472, $482, $51, $522, $532, $562, $572, $582, $60;
    $423 = this;
    $423[$217]();
    ($433 = $443 = 1, $423[$453] === 1) || ($433 = $443 = 0, $423[$453] = 1);
    (!$433 || $443 & 2) && $423.flagSelf$("dc-bf");
    $433 || ($472 = createElement("div", $423, `header dc_bf ${$462}`, "Favorites List"));
    ;
    ($482 = $423[$492]) || ($423[$492] = $482 = createElement("div", $423, `body dc_bf ${$462}`, null));
    ($51 = $423[$50]) || ($423[$50] = $51 = createIndexedList(384, $482));
    $522 = 0;
    $532 = $51.$;
    for (let $542 = 0, $552 = iter$__7(this.data), $642 = $552.length; $542 < $642; $542++) {
      let text = $552[$542];
      ($572 = $582 = 1, $562 = $532[$522]) || ($572 = $582 = 0, $532[$522] = $562 = createElement("div", $51, `row dc_bf ${$462}`, null));
      $572 || ($562[$59] = $51);
      $60 = text, $60 === $562[$622] && $572 || ($562[$61] = $562[$632]($562[$622] = $60, 384, $562[$61]));
      $522++;
    }
    ;
    $51[$652]($522);
    ;
    ;
    $423[$343]($443);
    return $423;
  }
};
defineTag("app-table", AppTableComponent, {});
var PageListsComponent = class extends Component {
  render() {
    var $662, $672, $68, $70 = this._ns_ || "", $71, $732, $742;
    $662 = this;
    $662[$217]();
    ($672 = $68 = 1, $662[$69] === 1) || ($672 = $68 = 0, $662[$69] = 1);
    (!$672 || $68 & 2) && $662.flagSelf$("dc-bj");
    ($732 = $742 = 1, $71 = $662[$722]) || ($732 = $742 = 0, $662[$722] = $71 = createComponent("app-table", $662, `${$70}`, null));
    $732 || ($71.data = [
      "Harry Potter",
      "Polaris",
      "Ali G",
      "Mandelbrot Set",
      "Tatsuro Yamashita",
      "Trader Joe's Ice Cream Sandwich",
      "Butternut Squash Triangoli",
      "Fresh Bread And Butter",
      "Wiley Wallaby Organic Classic",
      "The Ocean",
      "The Wind",
      "Mob Psycho",
      "One Piece",
      "Kinder Chocolate",
      "\u9C7C\u9999\u8304\u5B50\u7172",
      "Borat",
      "Sakanaction",
      "Joe Hisaishi",
      "Spirited Away",
      "Only Yesterday",
      "Rush Hour",
      "Sopranos",
      "Ylvis",
      "Yumi Arai"
    ]);
    $732 || !$71.setup || $71.setup($742);
    $71[$652]($742);
    $732 || $662[$752]($71);
    ;
    $662[$343]($68);
    return $662;
  }
};
defineTag("page-lists", PageListsComponent, {});
var AppComponent = class extends Component {
  render() {
    var $762, $77, $78, $80 = this._ns_ || "", $81, $832, $842;
    $762 = this;
    $762[$217]();
    ($77 = $78 = 1, $762[$79] === 1) || ($77 = $78 = 0, $762[$79] = 1);
    (!$77 || $78 & 2) && $762.flagSelf$("dc-bl");
    ($832 = $842 = 1, $81 = $762[$822]) || ($832 = $842 = 0, $762[$822] = $81 = createComponent("page-home", $762, `${$80}`, null));
    $832 || !$81.setup || $81.setup($842);
    $81[$652]($842);
    $832 || $762[$752]($81);
    ;
    $762[$343]($78);
    return $762;
  }
};
defineTag("app", AppComponent, {});
mount((($88 = $89 = 1, $852 = $862[$87]) || ($88 = $89 = 0, $852 = $862[$87] = $852 = createComponent("app", null, null, null)), $88 || ($852[$59] = $862._), $88 || $862.sym || !$852.setup || $852.setup($89), $862.sym || $852[$652]($89), $852));
//__FOOT__
