(function () {
  'use strict';

  function min(values, valueof) {
    let min;
    if (valueof === undefined) {
      for (const value of values) {
        if (value != null
            && (min > value || (min === undefined && value >= value))) {
          min = value;
        }
      }
    } else {
      let index = -1;
      for (let value of values) {
        if ((value = valueof(value, ++index, values)) != null
            && (min > value || (min === undefined && value >= value))) {
          min = value;
        }
      }
    }
    return min;
  }

  var noop = {value: () => {}};

  function dispatch() {
    for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
      if (!(t = arguments[i] + "") || (t in _) || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
      _[t] = [];
    }
    return new Dispatch(_);
  }

  function Dispatch(_) {
    this._ = _;
  }

  function parseTypenames$1(typenames, types) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
      return {type: t, name: name};
    });
  }

  Dispatch.prototype = dispatch.prototype = {
    constructor: Dispatch,
    on: function(typename, callback) {
      var _ = this._,
          T = parseTypenames$1(typename + "", _),
          t,
          i = -1,
          n = T.length;

      // If no callback was specified, return the callback of the given type and name.
      if (arguments.length < 2) {
        while (++i < n) if ((t = (typename = T[i]).type) && (t = get$1(_[t], typename.name))) return t;
        return;
      }

      // If a type was specified, set the callback for the given type and name.
      // Otherwise, if a null callback was specified, remove callbacks of the given name.
      if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
      while (++i < n) {
        if (t = (typename = T[i]).type) _[t] = set$1(_[t], typename.name, callback);
        else if (callback == null) for (t in _) _[t] = set$1(_[t], typename.name, null);
      }

      return this;
    },
    copy: function() {
      var copy = {}, _ = this._;
      for (var t in _) copy[t] = _[t].slice();
      return new Dispatch(copy);
    },
    call: function(type, that) {
      if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    },
    apply: function(type, that, args) {
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    }
  };

  function get$1(type, name) {
    for (var i = 0, n = type.length, c; i < n; ++i) {
      if ((c = type[i]).name === name) {
        return c.value;
      }
    }
  }

  function set$1(type, name, callback) {
    for (var i = 0, n = type.length; i < n; ++i) {
      if (type[i].name === name) {
        type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
        break;
      }
    }
    if (callback != null) type.push({name: name, value: callback});
    return type;
  }

  var xhtml = "http://www.w3.org/1999/xhtml";

  var namespaces = {
    svg: "http://www.w3.org/2000/svg",
    xhtml: xhtml,
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };

  function namespace(name) {
    var prefix = name += "", i = prefix.indexOf(":");
    if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
    return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name; // eslint-disable-line no-prototype-builtins
  }

  function creatorInherit(name) {
    return function() {
      var document = this.ownerDocument,
          uri = this.namespaceURI;
      return uri === xhtml && document.documentElement.namespaceURI === xhtml
          ? document.createElement(name)
          : document.createElementNS(uri, name);
    };
  }

  function creatorFixed(fullname) {
    return function() {
      return this.ownerDocument.createElementNS(fullname.space, fullname.local);
    };
  }

  function creator(name) {
    var fullname = namespace(name);
    return (fullname.local
        ? creatorFixed
        : creatorInherit)(fullname);
  }

  function none() {}

  function selector(selector) {
    return selector == null ? none : function() {
      return this.querySelector(selector);
    };
  }

  function selection_select(select) {
    if (typeof select !== "function") select = selector(select);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
        }
      }
    }

    return new Selection$1(subgroups, this._parents);
  }

  // Given something array like (or null), returns something that is strictly an
  // array. This is used to ensure that array-like objects passed to d3.selectAll
  // or selection.selectAll are converted into proper arrays when creating a
  // selection; we don’t ever want to create a selection backed by a live
  // HTMLCollection or NodeList. However, note that selection.selectAll will use a
  // static NodeList as a group, since it safely derived from querySelectorAll.
  function array(x) {
    return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
  }

  function empty() {
    return [];
  }

  function selectorAll(selector) {
    return selector == null ? empty : function() {
      return this.querySelectorAll(selector);
    };
  }

  function arrayAll(select) {
    return function() {
      return array(select.apply(this, arguments));
    };
  }

  function selection_selectAll(select) {
    if (typeof select === "function") select = arrayAll(select);
    else select = selectorAll(select);

    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          subgroups.push(select.call(node, node.__data__, i, group));
          parents.push(node);
        }
      }
    }

    return new Selection$1(subgroups, parents);
  }

  function matcher(selector) {
    return function() {
      return this.matches(selector);
    };
  }

  function childMatcher(selector) {
    return function(node) {
      return node.matches(selector);
    };
  }

  var find = Array.prototype.find;

  function childFind(match) {
    return function() {
      return find.call(this.children, match);
    };
  }

  function childFirst() {
    return this.firstElementChild;
  }

  function selection_selectChild(match) {
    return this.select(match == null ? childFirst
        : childFind(typeof match === "function" ? match : childMatcher(match)));
  }

  var filter = Array.prototype.filter;

  function children() {
    return Array.from(this.children);
  }

  function childrenFilter(match) {
    return function() {
      return filter.call(this.children, match);
    };
  }

  function selection_selectChildren(match) {
    return this.selectAll(match == null ? children
        : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
  }

  function selection_filter(match) {
    if (typeof match !== "function") match = matcher(match);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }

    return new Selection$1(subgroups, this._parents);
  }

  function sparse(update) {
    return new Array(update.length);
  }

  function selection_enter() {
    return new Selection$1(this._enter || this._groups.map(sparse), this._parents);
  }

  function EnterNode(parent, datum) {
    this.ownerDocument = parent.ownerDocument;
    this.namespaceURI = parent.namespaceURI;
    this._next = null;
    this._parent = parent;
    this.__data__ = datum;
  }

  EnterNode.prototype = {
    constructor: EnterNode,
    appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
    insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
    querySelector: function(selector) { return this._parent.querySelector(selector); },
    querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
  };

  function constant$2(x) {
    return function() {
      return x;
    };
  }

  function bindIndex(parent, group, enter, update, exit, data) {
    var i = 0,
        node,
        groupLength = group.length,
        dataLength = data.length;

    // Put any non-null nodes that fit into update.
    // Put any null nodes into enter.
    // Put any remaining data into enter.
    for (; i < dataLength; ++i) {
      if (node = group[i]) {
        node.__data__ = data[i];
        update[i] = node;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Put any non-null nodes that don’t fit into exit.
    for (; i < groupLength; ++i) {
      if (node = group[i]) {
        exit[i] = node;
      }
    }
  }

  function bindKey(parent, group, enter, update, exit, data, key) {
    var i,
        node,
        nodeByKeyValue = new Map,
        groupLength = group.length,
        dataLength = data.length,
        keyValues = new Array(groupLength),
        keyValue;

    // Compute the key for each node.
    // If multiple nodes have the same key, the duplicates are added to exit.
    for (i = 0; i < groupLength; ++i) {
      if (node = group[i]) {
        keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
        if (nodeByKeyValue.has(keyValue)) {
          exit[i] = node;
        } else {
          nodeByKeyValue.set(keyValue, node);
        }
      }
    }

    // Compute the key for each datum.
    // If there a node associated with this key, join and add it to update.
    // If there is not (or the key is a duplicate), add it to enter.
    for (i = 0; i < dataLength; ++i) {
      keyValue = key.call(parent, data[i], i, data) + "";
      if (node = nodeByKeyValue.get(keyValue)) {
        update[i] = node;
        node.__data__ = data[i];
        nodeByKeyValue.delete(keyValue);
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Add any remaining nodes that were not bound to data to exit.
    for (i = 0; i < groupLength; ++i) {
      if ((node = group[i]) && (nodeByKeyValue.get(keyValues[i]) === node)) {
        exit[i] = node;
      }
    }
  }

  function datum(node) {
    return node.__data__;
  }

  function selection_data(value, key) {
    if (!arguments.length) return Array.from(this, datum);

    var bind = key ? bindKey : bindIndex,
        parents = this._parents,
        groups = this._groups;

    if (typeof value !== "function") value = constant$2(value);

    for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
      var parent = parents[j],
          group = groups[j],
          groupLength = group.length,
          data = arraylike(value.call(parent, parent && parent.__data__, j, parents)),
          dataLength = data.length,
          enterGroup = enter[j] = new Array(dataLength),
          updateGroup = update[j] = new Array(dataLength),
          exitGroup = exit[j] = new Array(groupLength);

      bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

      // Now connect the enter nodes to their following update node, such that
      // appendChild can insert the materialized enter node before this node,
      // rather than at the end of the parent node.
      for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
        if (previous = enterGroup[i0]) {
          if (i0 >= i1) i1 = i0 + 1;
          while (!(next = updateGroup[i1]) && ++i1 < dataLength);
          previous._next = next || null;
        }
      }
    }

    update = new Selection$1(update, parents);
    update._enter = enter;
    update._exit = exit;
    return update;
  }

  // Given some data, this returns an array-like view of it: an object that
  // exposes a length property and allows numeric indexing. Note that unlike
  // selectAll, this isn’t worried about “live” collections because the resulting
  // array will only be used briefly while data is being bound. (It is possible to
  // cause the data to change while iterating by using a key function, but please
  // don’t; we’d rather avoid a gratuitous copy.)
  function arraylike(data) {
    return typeof data === "object" && "length" in data
      ? data // Array, TypedArray, NodeList, array-like
      : Array.from(data); // Map, Set, iterable, string, or anything else
  }

  function selection_exit() {
    return new Selection$1(this._exit || this._groups.map(sparse), this._parents);
  }

  function selection_join(onenter, onupdate, onexit) {
    var enter = this.enter(), update = this, exit = this.exit();
    if (typeof onenter === "function") {
      enter = onenter(enter);
      if (enter) enter = enter.selection();
    } else {
      enter = enter.append(onenter + "");
    }
    if (onupdate != null) {
      update = onupdate(update);
      if (update) update = update.selection();
    }
    if (onexit == null) exit.remove(); else onexit(exit);
    return enter && update ? enter.merge(update).order() : update;
  }

  function selection_merge(context) {
    var selection = context.selection ? context.selection() : context;

    for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }

    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }

    return new Selection$1(merges, this._parents);
  }

  function selection_order() {

    for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
      for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
        if (node = group[i]) {
          if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }

    return this;
  }

  function selection_sort(compare) {
    if (!compare) compare = ascending;

    function compareNode(a, b) {
      return a && b ? compare(a.__data__, b.__data__) : !a - !b;
    }

    for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          sortgroup[i] = node;
        }
      }
      sortgroup.sort(compareNode);
    }

    return new Selection$1(sortgroups, this._parents).order();
  }

  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function selection_call() {
    var callback = arguments[0];
    arguments[0] = this;
    callback.apply(null, arguments);
    return this;
  }

  function selection_nodes() {
    return Array.from(this);
  }

  function selection_node() {

    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
        var node = group[i];
        if (node) return node;
      }
    }

    return null;
  }

  function selection_size() {
    let size = 0;
    for (const node of this) ++size; // eslint-disable-line no-unused-vars
    return size;
  }

  function selection_empty() {
    return !this.node();
  }

  function selection_each(callback) {

    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) callback.call(node, node.__data__, i, group);
      }
    }

    return this;
  }

  function attrRemove$1(name) {
    return function() {
      this.removeAttribute(name);
    };
  }

  function attrRemoveNS$1(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }

  function attrConstant$1(name, value) {
    return function() {
      this.setAttribute(name, value);
    };
  }

  function attrConstantNS$1(fullname, value) {
    return function() {
      this.setAttributeNS(fullname.space, fullname.local, value);
    };
  }

  function attrFunction$1(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttribute(name);
      else this.setAttribute(name, v);
    };
  }

  function attrFunctionNS$1(fullname, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
      else this.setAttributeNS(fullname.space, fullname.local, v);
    };
  }

  function selection_attr(name, value) {
    var fullname = namespace(name);

    if (arguments.length < 2) {
      var node = this.node();
      return fullname.local
          ? node.getAttributeNS(fullname.space, fullname.local)
          : node.getAttribute(fullname);
    }

    return this.each((value == null
        ? (fullname.local ? attrRemoveNS$1 : attrRemove$1) : (typeof value === "function"
        ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)
        : (fullname.local ? attrConstantNS$1 : attrConstant$1)))(fullname, value));
  }

  function defaultView(node) {
    return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
        || (node.document && node) // node is a Window
        || node.defaultView; // node is a Document
  }

  function styleRemove$1(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }

  function styleConstant$1(name, value, priority) {
    return function() {
      this.style.setProperty(name, value, priority);
    };
  }

  function styleFunction$1(name, value, priority) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.style.removeProperty(name);
      else this.style.setProperty(name, v, priority);
    };
  }

  function selection_style(name, value, priority) {
    return arguments.length > 1
        ? this.each((value == null
              ? styleRemove$1 : typeof value === "function"
              ? styleFunction$1
              : styleConstant$1)(name, value, priority == null ? "" : priority))
        : styleValue(this.node(), name);
  }

  function styleValue(node, name) {
    return node.style.getPropertyValue(name)
        || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
  }

  function propertyRemove(name) {
    return function() {
      delete this[name];
    };
  }

  function propertyConstant(name, value) {
    return function() {
      this[name] = value;
    };
  }

  function propertyFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) delete this[name];
      else this[name] = v;
    };
  }

  function selection_property(name, value) {
    return arguments.length > 1
        ? this.each((value == null
            ? propertyRemove : typeof value === "function"
            ? propertyFunction
            : propertyConstant)(name, value))
        : this.node()[name];
  }

  function classArray(string) {
    return string.trim().split(/^|\s+/);
  }

  function classList(node) {
    return node.classList || new ClassList(node);
  }

  function ClassList(node) {
    this._node = node;
    this._names = classArray(node.getAttribute("class") || "");
  }

  ClassList.prototype = {
    add: function(name) {
      var i = this._names.indexOf(name);
      if (i < 0) {
        this._names.push(name);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    remove: function(name) {
      var i = this._names.indexOf(name);
      if (i >= 0) {
        this._names.splice(i, 1);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    contains: function(name) {
      return this._names.indexOf(name) >= 0;
    }
  };

  function classedAdd(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.add(names[i]);
  }

  function classedRemove(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.remove(names[i]);
  }

  function classedTrue(names) {
    return function() {
      classedAdd(this, names);
    };
  }

  function classedFalse(names) {
    return function() {
      classedRemove(this, names);
    };
  }

  function classedFunction(names, value) {
    return function() {
      (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
    };
  }

  function selection_classed(name, value) {
    var names = classArray(name + "");

    if (arguments.length < 2) {
      var list = classList(this.node()), i = -1, n = names.length;
      while (++i < n) if (!list.contains(names[i])) return false;
      return true;
    }

    return this.each((typeof value === "function"
        ? classedFunction : value
        ? classedTrue
        : classedFalse)(names, value));
  }

  function textRemove() {
    this.textContent = "";
  }

  function textConstant$1(value) {
    return function() {
      this.textContent = value;
    };
  }

  function textFunction$1(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    };
  }

  function selection_text(value) {
    return arguments.length
        ? this.each(value == null
            ? textRemove : (typeof value === "function"
            ? textFunction$1
            : textConstant$1)(value))
        : this.node().textContent;
  }

  function htmlRemove() {
    this.innerHTML = "";
  }

  function htmlConstant(value) {
    return function() {
      this.innerHTML = value;
    };
  }

  function htmlFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    };
  }

  function selection_html(value) {
    return arguments.length
        ? this.each(value == null
            ? htmlRemove : (typeof value === "function"
            ? htmlFunction
            : htmlConstant)(value))
        : this.node().innerHTML;
  }

  function raise() {
    if (this.nextSibling) this.parentNode.appendChild(this);
  }

  function selection_raise() {
    return this.each(raise);
  }

  function lower() {
    if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
  }

  function selection_lower() {
    return this.each(lower);
  }

  function selection_append(name) {
    var create = typeof name === "function" ? name : creator(name);
    return this.select(function() {
      return this.appendChild(create.apply(this, arguments));
    });
  }

  function constantNull() {
    return null;
  }

  function selection_insert(name, before) {
    var create = typeof name === "function" ? name : creator(name),
        select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
    return this.select(function() {
      return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
    });
  }

  function remove() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  }

  function selection_remove() {
    return this.each(remove);
  }

  function selection_cloneShallow() {
    var clone = this.cloneNode(false), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }

  function selection_cloneDeep() {
    var clone = this.cloneNode(true), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }

  function selection_clone(deep) {
    return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
  }

  function selection_datum(value) {
    return arguments.length
        ? this.property("__data__", value)
        : this.node().__data__;
  }

  function contextListener(listener) {
    return function(event) {
      listener.call(this, event, this.__data__);
    };
  }

  function parseTypenames(typenames) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      return {type: t, name: name};
    });
  }

  function onRemove(typename) {
    return function() {
      var on = this.__on;
      if (!on) return;
      for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
        if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
        } else {
          on[++i] = o;
        }
      }
      if (++i) on.length = i;
      else delete this.__on;
    };
  }

  function onAdd(typename, value, options) {
    return function() {
      var on = this.__on, o, listener = contextListener(value);
      if (on) for (var j = 0, m = on.length; j < m; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
          this.addEventListener(o.type, o.listener = listener, o.options = options);
          o.value = value;
          return;
        }
      }
      this.addEventListener(typename.type, listener, options);
      o = {type: typename.type, name: typename.name, value: value, listener: listener, options: options};
      if (!on) this.__on = [o];
      else on.push(o);
    };
  }

  function selection_on(typename, value, options) {
    var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;

    if (arguments.length < 2) {
      var on = this.node().__on;
      if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
        for (i = 0, o = on[j]; i < n; ++i) {
          if ((t = typenames[i]).type === o.type && t.name === o.name) {
            return o.value;
          }
        }
      }
      return;
    }

    on = value ? onAdd : onRemove;
    for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
    return this;
  }

  function dispatchEvent(node, type, params) {
    var window = defaultView(node),
        event = window.CustomEvent;

    if (typeof event === "function") {
      event = new event(type, params);
    } else {
      event = window.document.createEvent("Event");
      if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
      else event.initEvent(type, false, false);
    }

    node.dispatchEvent(event);
  }

  function dispatchConstant(type, params) {
    return function() {
      return dispatchEvent(this, type, params);
    };
  }

  function dispatchFunction(type, params) {
    return function() {
      return dispatchEvent(this, type, params.apply(this, arguments));
    };
  }

  function selection_dispatch(type, params) {
    return this.each((typeof params === "function"
        ? dispatchFunction
        : dispatchConstant)(type, params));
  }

  function* selection_iterator() {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) yield node;
      }
    }
  }

  var root = [null];

  function Selection$1(groups, parents) {
    this._groups = groups;
    this._parents = parents;
  }

  function selection() {
    return new Selection$1([[document.documentElement]], root);
  }

  function selection_selection() {
    return this;
  }

  Selection$1.prototype = selection.prototype = {
    constructor: Selection$1,
    select: selection_select,
    selectAll: selection_selectAll,
    selectChild: selection_selectChild,
    selectChildren: selection_selectChildren,
    filter: selection_filter,
    data: selection_data,
    enter: selection_enter,
    exit: selection_exit,
    join: selection_join,
    merge: selection_merge,
    selection: selection_selection,
    order: selection_order,
    sort: selection_sort,
    call: selection_call,
    nodes: selection_nodes,
    node: selection_node,
    size: selection_size,
    empty: selection_empty,
    each: selection_each,
    attr: selection_attr,
    style: selection_style,
    property: selection_property,
    classed: selection_classed,
    text: selection_text,
    html: selection_html,
    raise: selection_raise,
    lower: selection_lower,
    append: selection_append,
    insert: selection_insert,
    remove: selection_remove,
    clone: selection_clone,
    datum: selection_datum,
    on: selection_on,
    dispatch: selection_dispatch,
    [Symbol.iterator]: selection_iterator
  };

  function select(selector) {
    return typeof selector === "string"
        ? new Selection$1([[document.querySelector(selector)]], [document.documentElement])
        : new Selection$1([[selector]], root);
  }

  function sourceEvent(event) {
    let sourceEvent;
    while (sourceEvent = event.sourceEvent) event = sourceEvent;
    return event;
  }

  function pointer(event, node) {
    event = sourceEvent(event);
    if (node === undefined) node = event.currentTarget;
    if (node) {
      var svg = node.ownerSVGElement || node;
      if (svg.createSVGPoint) {
        var point = svg.createSVGPoint();
        point.x = event.clientX, point.y = event.clientY;
        point = point.matrixTransform(node.getScreenCTM().inverse());
        return [point.x, point.y];
      }
      if (node.getBoundingClientRect) {
        var rect = node.getBoundingClientRect();
        return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
      }
    }
    return [event.pageX, event.pageY];
  }

  function selectAll(selector) {
    return typeof selector === "string"
        ? new Selection$1([document.querySelectorAll(selector)], [document.documentElement])
        : new Selection$1([array(selector)], root);
  }

  // These are typically used in conjunction with noevent to ensure that we can
  // preventDefault on the event.
  const nonpassive = {passive: false};
  const nonpassivecapture = {capture: true, passive: false};

  function nopropagation(event) {
    event.stopImmediatePropagation();
  }

  function noevent(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function dragDisable(view) {
    var root = view.document.documentElement,
        selection = select(view).on("dragstart.drag", noevent, nonpassivecapture);
    if ("onselectstart" in root) {
      selection.on("selectstart.drag", noevent, nonpassivecapture);
    } else {
      root.__noselect = root.style.MozUserSelect;
      root.style.MozUserSelect = "none";
    }
  }

  function yesdrag(view, noclick) {
    var root = view.document.documentElement,
        selection = select(view).on("dragstart.drag", null);
    if (noclick) {
      selection.on("click.drag", noevent, nonpassivecapture);
      setTimeout(function() { selection.on("click.drag", null); }, 0);
    }
    if ("onselectstart" in root) {
      selection.on("selectstart.drag", null);
    } else {
      root.style.MozUserSelect = root.__noselect;
      delete root.__noselect;
    }
  }

  var constant$1 = x => () => x;

  function DragEvent(type, {
    sourceEvent,
    subject,
    target,
    identifier,
    active,
    x, y, dx, dy,
    dispatch
  }) {
    Object.defineProperties(this, {
      type: {value: type, enumerable: true, configurable: true},
      sourceEvent: {value: sourceEvent, enumerable: true, configurable: true},
      subject: {value: subject, enumerable: true, configurable: true},
      target: {value: target, enumerable: true, configurable: true},
      identifier: {value: identifier, enumerable: true, configurable: true},
      active: {value: active, enumerable: true, configurable: true},
      x: {value: x, enumerable: true, configurable: true},
      y: {value: y, enumerable: true, configurable: true},
      dx: {value: dx, enumerable: true, configurable: true},
      dy: {value: dy, enumerable: true, configurable: true},
      _: {value: dispatch}
    });
  }

  DragEvent.prototype.on = function() {
    var value = this._.on.apply(this._, arguments);
    return value === this._ ? this : value;
  };

  // Ignore right-click, since that should open the context menu.
  function defaultFilter(event) {
    return !event.ctrlKey && !event.button;
  }

  function defaultContainer() {
    return this.parentNode;
  }

  function defaultSubject(event, d) {
    return d == null ? {x: event.x, y: event.y} : d;
  }

  function defaultTouchable() {
    return navigator.maxTouchPoints || ("ontouchstart" in this);
  }

  function drag() {
    var filter = defaultFilter,
        container = defaultContainer,
        subject = defaultSubject,
        touchable = defaultTouchable,
        gestures = {},
        listeners = dispatch("start", "drag", "end"),
        active = 0,
        mousedownx,
        mousedowny,
        mousemoving,
        touchending,
        clickDistance2 = 0;

    function drag(selection) {
      selection
          .on("mousedown.drag", mousedowned)
        .filter(touchable)
          .on("touchstart.drag", touchstarted)
          .on("touchmove.drag", touchmoved, nonpassive)
          .on("touchend.drag touchcancel.drag", touchended)
          .style("touch-action", "none")
          .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
    }

    function mousedowned(event, d) {
      if (touchending || !filter.call(this, event, d)) return;
      var gesture = beforestart(this, container.call(this, event, d), event, d, "mouse");
      if (!gesture) return;
      select(event.view)
        .on("mousemove.drag", mousemoved, nonpassivecapture)
        .on("mouseup.drag", mouseupped, nonpassivecapture);
      dragDisable(event.view);
      nopropagation(event);
      mousemoving = false;
      mousedownx = event.clientX;
      mousedowny = event.clientY;
      gesture("start", event);
    }

    function mousemoved(event) {
      noevent(event);
      if (!mousemoving) {
        var dx = event.clientX - mousedownx, dy = event.clientY - mousedowny;
        mousemoving = dx * dx + dy * dy > clickDistance2;
      }
      gestures.mouse("drag", event);
    }

    function mouseupped(event) {
      select(event.view).on("mousemove.drag mouseup.drag", null);
      yesdrag(event.view, mousemoving);
      noevent(event);
      gestures.mouse("end", event);
    }

    function touchstarted(event, d) {
      if (!filter.call(this, event, d)) return;
      var touches = event.changedTouches,
          c = container.call(this, event, d),
          n = touches.length, i, gesture;

      for (i = 0; i < n; ++i) {
        if (gesture = beforestart(this, c, event, d, touches[i].identifier, touches[i])) {
          nopropagation(event);
          gesture("start", event, touches[i]);
        }
      }
    }

    function touchmoved(event) {
      var touches = event.changedTouches,
          n = touches.length, i, gesture;

      for (i = 0; i < n; ++i) {
        if (gesture = gestures[touches[i].identifier]) {
          noevent(event);
          gesture("drag", event, touches[i]);
        }
      }
    }

    function touchended(event) {
      var touches = event.changedTouches,
          n = touches.length, i, gesture;

      if (touchending) clearTimeout(touchending);
      touchending = setTimeout(function() { touchending = null; }, 500); // Ghost clicks are delayed!
      for (i = 0; i < n; ++i) {
        if (gesture = gestures[touches[i].identifier]) {
          nopropagation(event);
          gesture("end", event, touches[i]);
        }
      }
    }

    function beforestart(that, container, event, d, identifier, touch) {
      var dispatch = listeners.copy(),
          p = pointer(touch || event, container), dx, dy,
          s;

      if ((s = subject.call(that, new DragEvent("beforestart", {
          sourceEvent: event,
          target: drag,
          identifier,
          active,
          x: p[0],
          y: p[1],
          dx: 0,
          dy: 0,
          dispatch
        }), d)) == null) return;

      dx = s.x - p[0] || 0;
      dy = s.y - p[1] || 0;

      return function gesture(type, event, touch) {
        var p0 = p, n;
        switch (type) {
          case "start": gestures[identifier] = gesture, n = active++; break;
          case "end": delete gestures[identifier], --active; // falls through
          case "drag": p = pointer(touch || event, container), n = active; break;
        }
        dispatch.call(
          type,
          that,
          new DragEvent(type, {
            sourceEvent: event,
            subject: s,
            target: drag,
            identifier,
            active: n,
            x: p[0] + dx,
            y: p[1] + dy,
            dx: p[0] - p0[0],
            dy: p[1] - p0[1],
            dispatch
          }),
          d
        );
      };
    }

    drag.filter = function(_) {
      return arguments.length ? (filter = typeof _ === "function" ? _ : constant$1(!!_), drag) : filter;
    };

    drag.container = function(_) {
      return arguments.length ? (container = typeof _ === "function" ? _ : constant$1(_), drag) : container;
    };

    drag.subject = function(_) {
      return arguments.length ? (subject = typeof _ === "function" ? _ : constant$1(_), drag) : subject;
    };

    drag.touchable = function(_) {
      return arguments.length ? (touchable = typeof _ === "function" ? _ : constant$1(!!_), drag) : touchable;
    };

    drag.on = function() {
      var value = listeners.on.apply(listeners, arguments);
      return value === listeners ? drag : value;
    };

    drag.clickDistance = function(_) {
      return arguments.length ? (clickDistance2 = (_ = +_) * _, drag) : Math.sqrt(clickDistance2);
    };

    return drag;
  }

  function define(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }

  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition) prototype[key] = definition[key];
    return prototype;
  }

  function Color() {}

  var darker = 0.7;
  var brighter = 1 / darker;

  var reI = "\\s*([+-]?\\d+)\\s*",
      reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*",
      reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
      reHex = /^#([0-9a-f]{3,8})$/,
      reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`),
      reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`),
      reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`),
      reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`),
      reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`),
      reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);

  var named = {
    aliceblue: 0xf0f8ff,
    antiquewhite: 0xfaebd7,
    aqua: 0x00ffff,
    aquamarine: 0x7fffd4,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    bisque: 0xffe4c4,
    black: 0x000000,
    blanchedalmond: 0xffebcd,
    blue: 0x0000ff,
    blueviolet: 0x8a2be2,
    brown: 0xa52a2a,
    burlywood: 0xdeb887,
    cadetblue: 0x5f9ea0,
    chartreuse: 0x7fff00,
    chocolate: 0xd2691e,
    coral: 0xff7f50,
    cornflowerblue: 0x6495ed,
    cornsilk: 0xfff8dc,
    crimson: 0xdc143c,
    cyan: 0x00ffff,
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgoldenrod: 0xb8860b,
    darkgray: 0xa9a9a9,
    darkgreen: 0x006400,
    darkgrey: 0xa9a9a9,
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkseagreen: 0x8fbc8f,
    darkslateblue: 0x483d8b,
    darkslategray: 0x2f4f4f,
    darkslategrey: 0x2f4f4f,
    darkturquoise: 0x00ced1,
    darkviolet: 0x9400d3,
    deeppink: 0xff1493,
    deepskyblue: 0x00bfff,
    dimgray: 0x696969,
    dimgrey: 0x696969,
    dodgerblue: 0x1e90ff,
    firebrick: 0xb22222,
    floralwhite: 0xfffaf0,
    forestgreen: 0x228b22,
    fuchsia: 0xff00ff,
    gainsboro: 0xdcdcdc,
    ghostwhite: 0xf8f8ff,
    gold: 0xffd700,
    goldenrod: 0xdaa520,
    gray: 0x808080,
    green: 0x008000,
    greenyellow: 0xadff2f,
    grey: 0x808080,
    honeydew: 0xf0fff0,
    hotpink: 0xff69b4,
    indianred: 0xcd5c5c,
    indigo: 0x4b0082,
    ivory: 0xfffff0,
    khaki: 0xf0e68c,
    lavender: 0xe6e6fa,
    lavenderblush: 0xfff0f5,
    lawngreen: 0x7cfc00,
    lemonchiffon: 0xfffacd,
    lightblue: 0xadd8e6,
    lightcoral: 0xf08080,
    lightcyan: 0xe0ffff,
    lightgoldenrodyellow: 0xfafad2,
    lightgray: 0xd3d3d3,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3,
    lightpink: 0xffb6c1,
    lightsalmon: 0xffa07a,
    lightseagreen: 0x20b2aa,
    lightskyblue: 0x87cefa,
    lightslategray: 0x778899,
    lightslategrey: 0x778899,
    lightsteelblue: 0xb0c4de,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    limegreen: 0x32cd32,
    linen: 0xfaf0e6,
    magenta: 0xff00ff,
    maroon: 0x800000,
    mediumaquamarine: 0x66cdaa,
    mediumblue: 0x0000cd,
    mediumorchid: 0xba55d3,
    mediumpurple: 0x9370db,
    mediumseagreen: 0x3cb371,
    mediumslateblue: 0x7b68ee,
    mediumspringgreen: 0x00fa9a,
    mediumturquoise: 0x48d1cc,
    mediumvioletred: 0xc71585,
    midnightblue: 0x191970,
    mintcream: 0xf5fffa,
    mistyrose: 0xffe4e1,
    moccasin: 0xffe4b5,
    navajowhite: 0xffdead,
    navy: 0x000080,
    oldlace: 0xfdf5e6,
    olive: 0x808000,
    olivedrab: 0x6b8e23,
    orange: 0xffa500,
    orangered: 0xff4500,
    orchid: 0xda70d6,
    palegoldenrod: 0xeee8aa,
    palegreen: 0x98fb98,
    paleturquoise: 0xafeeee,
    palevioletred: 0xdb7093,
    papayawhip: 0xffefd5,
    peachpuff: 0xffdab9,
    peru: 0xcd853f,
    pink: 0xffc0cb,
    plum: 0xdda0dd,
    powderblue: 0xb0e0e6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xff0000,
    rosybrown: 0xbc8f8f,
    royalblue: 0x4169e1,
    saddlebrown: 0x8b4513,
    salmon: 0xfa8072,
    sandybrown: 0xf4a460,
    seagreen: 0x2e8b57,
    seashell: 0xfff5ee,
    sienna: 0xa0522d,
    silver: 0xc0c0c0,
    skyblue: 0x87ceeb,
    slateblue: 0x6a5acd,
    slategray: 0x708090,
    slategrey: 0x708090,
    snow: 0xfffafa,
    springgreen: 0x00ff7f,
    steelblue: 0x4682b4,
    tan: 0xd2b48c,
    teal: 0x008080,
    thistle: 0xd8bfd8,
    tomato: 0xff6347,
    turquoise: 0x40e0d0,
    violet: 0xee82ee,
    wheat: 0xf5deb3,
    white: 0xffffff,
    whitesmoke: 0xf5f5f5,
    yellow: 0xffff00,
    yellowgreen: 0x9acd32
  };

  define(Color, color, {
    copy(channels) {
      return Object.assign(new this.constructor, this, channels);
    },
    displayable() {
      return this.rgb().displayable();
    },
    hex: color_formatHex, // Deprecated! Use color.formatHex.
    formatHex: color_formatHex,
    formatHex8: color_formatHex8,
    formatHsl: color_formatHsl,
    formatRgb: color_formatRgb,
    toString: color_formatRgb
  });

  function color_formatHex() {
    return this.rgb().formatHex();
  }

  function color_formatHex8() {
    return this.rgb().formatHex8();
  }

  function color_formatHsl() {
    return hslConvert(this).formatHsl();
  }

  function color_formatRgb() {
    return this.rgb().formatRgb();
  }

  function color(format) {
    var m, l;
    format = (format + "").trim().toLowerCase();
    return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
        : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
        : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
        : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
        : null) // invalid hex
        : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
        : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
        : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
        : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
        : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
        : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
        : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
        : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
        : null;
  }

  function rgbn(n) {
    return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
  }

  function rgba(r, g, b, a) {
    if (a <= 0) r = g = b = NaN;
    return new Rgb(r, g, b, a);
  }

  function rgbConvert(o) {
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Rgb;
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }

  function rgb(r, g, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
  }

  function Rgb(r, g, b, opacity) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }

  define(Rgb, rgb, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    rgb() {
      return this;
    },
    clamp() {
      return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
    },
    displayable() {
      return (-0.5 <= this.r && this.r < 255.5)
          && (-0.5 <= this.g && this.g < 255.5)
          && (-0.5 <= this.b && this.b < 255.5)
          && (0 <= this.opacity && this.opacity <= 1);
    },
    hex: rgb_formatHex, // Deprecated! Use color.formatHex.
    formatHex: rgb_formatHex,
    formatHex8: rgb_formatHex8,
    formatRgb: rgb_formatRgb,
    toString: rgb_formatRgb
  }));

  function rgb_formatHex() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
  }

  function rgb_formatHex8() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
  }

  function rgb_formatRgb() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
  }

  function clampa(opacity) {
    return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
  }

  function clampi(value) {
    return Math.max(0, Math.min(255, Math.round(value) || 0));
  }

  function hex(value) {
    value = clampi(value);
    return (value < 16 ? "0" : "") + value.toString(16);
  }

  function hsla(h, s, l, a) {
    if (a <= 0) h = s = l = NaN;
    else if (l <= 0 || l >= 1) h = s = NaN;
    else if (s <= 0) h = NaN;
    return new Hsl(h, s, l, a);
  }

  function hslConvert(o) {
    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Hsl;
    if (o instanceof Hsl) return o;
    o = o.rgb();
    var r = o.r / 255,
        g = o.g / 255,
        b = o.b / 255,
        min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        h = NaN,
        s = max - min,
        l = (max + min) / 2;
    if (s) {
      if (r === max) h = (g - b) / s + (g < b) * 6;
      else if (g === max) h = (b - r) / s + 2;
      else h = (r - g) / s + 4;
      s /= l < 0.5 ? max + min : 2 - max - min;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }

  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }

  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }

  define(Hsl, hsl, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    rgb() {
      var h = this.h % 360 + (this.h < 0) * 360,
          s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
          l = this.l,
          m2 = l + (l < 0.5 ? l : 1 - l) * s,
          m1 = 2 * l - m2;
      return new Rgb(
        hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
        hsl2rgb(h, m1, m2),
        hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
        this.opacity
      );
    },
    clamp() {
      return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
    },
    displayable() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s))
          && (0 <= this.l && this.l <= 1)
          && (0 <= this.opacity && this.opacity <= 1);
    },
    formatHsl() {
      const a = clampa(this.opacity);
      return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
    }
  }));

  function clamph(value) {
    value = (value || 0) % 360;
    return value < 0 ? value + 360 : value;
  }

  function clampt(value) {
    return Math.max(0, Math.min(1, value || 0));
  }

  /* From FvD 13.37, CSS Color Module Level 3 */
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60
        : h < 180 ? m2
        : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
        : m1) * 255;
  }

  var constant = x => () => x;

  function linear$1(a, d) {
    return function(t) {
      return a + t * d;
    };
  }

  function exponential(a, b, y) {
    return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
      return Math.pow(a + t * b, y);
    };
  }

  function gamma(y) {
    return (y = +y) === 1 ? nogamma : function(a, b) {
      return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
    };
  }

  function nogamma(a, b) {
    var d = b - a;
    return d ? linear$1(a, d) : constant(isNaN(a) ? b : a);
  }

  var interpolateRgb = (function rgbGamma(y) {
    var color = gamma(y);

    function rgb$1(start, end) {
      var r = color((start = rgb(start)).r, (end = rgb(end)).r),
          g = color(start.g, end.g),
          b = color(start.b, end.b),
          opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.r = r(t);
        start.g = g(t);
        start.b = b(t);
        start.opacity = opacity(t);
        return start + "";
      };
    }

    rgb$1.gamma = rgbGamma;

    return rgb$1;
  })(1);

  function interpolateNumber(a, b) {
    return a = +a, b = +b, function(t) {
      return a * (1 - t) + b * t;
    };
  }

  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
      reB = new RegExp(reA.source, "g");

  function zero(b) {
    return function() {
      return b;
    };
  }

  function one(b) {
    return function(t) {
      return b(t) + "";
    };
  }

  function interpolateString(a, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
        am, // current match in a
        bm, // current match in b
        bs, // string preceding current number in b, if any
        i = -1, // index in s
        s = [], // string constants and placeholders
        q = []; // number interpolators

    // Coerce inputs to strings.
    a = a + "", b = b + "";

    // Interpolate pairs of numbers in a & b.
    while ((am = reA.exec(a))
        && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) { // a string precedes the next number in b
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
        if (s[i]) s[i] += bm; // coalesce with previous string
        else s[++i] = bm;
      } else { // interpolate non-matching numbers
        s[++i] = null;
        q.push({i: i, x: interpolateNumber(am, bm)});
      }
      bi = reB.lastIndex;
    }

    // Add remains of b.
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }

    // Special optimization for only a single match.
    // Otherwise, interpolate each of the numbers and rejoin the string.
    return s.length < 2 ? (q[0]
        ? one(q[0].x)
        : zero(b))
        : (b = q.length, function(t) {
            for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
            return s.join("");
          });
  }

  var degrees = 180 / Math.PI;

  var identity = {
    translateX: 0,
    translateY: 0,
    rotate: 0,
    skewX: 0,
    scaleX: 1,
    scaleY: 1
  };

  function decompose(a, b, c, d, e, f) {
    var scaleX, scaleY, skewX;
    if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
    if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
    if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
    if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
    return {
      translateX: e,
      translateY: f,
      rotate: Math.atan2(b, a) * degrees,
      skewX: Math.atan(skewX) * degrees,
      scaleX: scaleX,
      scaleY: scaleY
    };
  }

  var svgNode;

  /* eslint-disable no-undef */
  function parseCss(value) {
    const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
    return m.isIdentity ? identity : decompose(m.a, m.b, m.c, m.d, m.e, m.f);
  }

  function parseSvg(value) {
    if (value == null) return identity;
    if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svgNode.setAttribute("transform", value);
    if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
    value = value.matrix;
    return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
  }

  function interpolateTransform(parse, pxComma, pxParen, degParen) {

    function pop(s) {
      return s.length ? s.pop() + " " : "";
    }

    function translate(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push("translate(", null, pxComma, null, pxParen);
        q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
      } else if (xb || yb) {
        s.push("translate(" + xb + pxComma + yb + pxParen);
      }
    }

    function rotate(a, b, s, q) {
      if (a !== b) {
        if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
        q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b)});
      } else if (b) {
        s.push(pop(s) + "rotate(" + b + degParen);
      }
    }

    function skewX(a, b, s, q) {
      if (a !== b) {
        q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b)});
      } else if (b) {
        s.push(pop(s) + "skewX(" + b + degParen);
      }
    }

    function scale(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push(pop(s) + "scale(", null, ",", null, ")");
        q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
      } else if (xb !== 1 || yb !== 1) {
        s.push(pop(s) + "scale(" + xb + "," + yb + ")");
      }
    }

    return function(a, b) {
      var s = [], // string constants and placeholders
          q = []; // number interpolators
      a = parse(a), b = parse(b);
      translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
      rotate(a.rotate, b.rotate, s, q);
      skewX(a.skewX, b.skewX, s, q);
      scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
      a = b = null; // gc
      return function(t) {
        var i = -1, n = q.length, o;
        while (++i < n) s[(o = q[i]).i] = o.x(t);
        return s.join("");
      };
    };
  }

  var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
  var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

  var frame = 0, // is an animation frame pending?
      timeout$1 = 0, // is a timeout pending?
      interval = 0, // are any timers active?
      pokeDelay = 1000, // how frequently we check for clock skew
      taskHead,
      taskTail,
      clockLast = 0,
      clockNow = 0,
      clockSkew = 0,
      clock = typeof performance === "object" && performance.now ? performance : Date,
      setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

  function now() {
    return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
  }

  function clearNow() {
    clockNow = 0;
  }

  function Timer() {
    this._call =
    this._time =
    this._next = null;
  }

  Timer.prototype = timer.prototype = {
    constructor: Timer,
    restart: function(callback, delay, time) {
      if (typeof callback !== "function") throw new TypeError("callback is not a function");
      time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
      if (!this._next && taskTail !== this) {
        if (taskTail) taskTail._next = this;
        else taskHead = this;
        taskTail = this;
      }
      this._call = callback;
      this._time = time;
      sleep();
    },
    stop: function() {
      if (this._call) {
        this._call = null;
        this._time = Infinity;
        sleep();
      }
    }
  };

  function timer(callback, delay, time) {
    var t = new Timer;
    t.restart(callback, delay, time);
    return t;
  }

  function timerFlush() {
    now(); // Get the current time, if not already set.
    ++frame; // Pretend we’ve set an alarm, if we haven’t already.
    var t = taskHead, e;
    while (t) {
      if ((e = clockNow - t._time) >= 0) t._call.call(undefined, e);
      t = t._next;
    }
    --frame;
  }

  function wake() {
    clockNow = (clockLast = clock.now()) + clockSkew;
    frame = timeout$1 = 0;
    try {
      timerFlush();
    } finally {
      frame = 0;
      nap();
      clockNow = 0;
    }
  }

  function poke() {
    var now = clock.now(), delay = now - clockLast;
    if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
  }

  function nap() {
    var t0, t1 = taskHead, t2, time = Infinity;
    while (t1) {
      if (t1._call) {
        if (time > t1._time) time = t1._time;
        t0 = t1, t1 = t1._next;
      } else {
        t2 = t1._next, t1._next = null;
        t1 = t0 ? t0._next = t2 : taskHead = t2;
      }
    }
    taskTail = t0;
    sleep(time);
  }

  function sleep(time) {
    if (frame) return; // Soonest alarm already set, or will be.
    if (timeout$1) timeout$1 = clearTimeout(timeout$1);
    var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
    if (delay > 24) {
      if (time < Infinity) timeout$1 = setTimeout(wake, time - clock.now() - clockSkew);
      if (interval) interval = clearInterval(interval);
    } else {
      if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
      frame = 1, setFrame(wake);
    }
  }

  function timeout(callback, delay, time) {
    var t = new Timer;
    delay = delay == null ? 0 : +delay;
    t.restart(elapsed => {
      t.stop();
      callback(elapsed + delay);
    }, delay, time);
    return t;
  }

  var emptyOn = dispatch("start", "end", "cancel", "interrupt");
  var emptyTween = [];

  var CREATED = 0;
  var SCHEDULED = 1;
  var STARTING = 2;
  var STARTED = 3;
  var RUNNING = 4;
  var ENDING = 5;
  var ENDED = 6;

  function schedule(node, name, id, index, group, timing) {
    var schedules = node.__transition;
    if (!schedules) node.__transition = {};
    else if (id in schedules) return;
    create(node, id, {
      name: name,
      index: index, // For context during callback.
      group: group, // For context during callback.
      on: emptyOn,
      tween: emptyTween,
      time: timing.time,
      delay: timing.delay,
      duration: timing.duration,
      ease: timing.ease,
      timer: null,
      state: CREATED
    });
  }

  function init(node, id) {
    var schedule = get(node, id);
    if (schedule.state > CREATED) throw new Error("too late; already scheduled");
    return schedule;
  }

  function set(node, id) {
    var schedule = get(node, id);
    if (schedule.state > STARTED) throw new Error("too late; already running");
    return schedule;
  }

  function get(node, id) {
    var schedule = node.__transition;
    if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
    return schedule;
  }

  function create(node, id, self) {
    var schedules = node.__transition,
        tween;

    // Initialize the self timer when the transition is created.
    // Note the actual delay is not known until the first callback!
    schedules[id] = self;
    self.timer = timer(schedule, 0, self.time);

    function schedule(elapsed) {
      self.state = SCHEDULED;
      self.timer.restart(start, self.delay, self.time);

      // If the elapsed delay is less than our first sleep, start immediately.
      if (self.delay <= elapsed) start(elapsed - self.delay);
    }

    function start(elapsed) {
      var i, j, n, o;

      // If the state is not SCHEDULED, then we previously errored on start.
      if (self.state !== SCHEDULED) return stop();

      for (i in schedules) {
        o = schedules[i];
        if (o.name !== self.name) continue;

        // While this element already has a starting transition during this frame,
        // defer starting an interrupting transition until that transition has a
        // chance to tick (and possibly end); see d3/d3-transition#54!
        if (o.state === STARTED) return timeout(start);

        // Interrupt the active transition, if any.
        if (o.state === RUNNING) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("interrupt", node, node.__data__, o.index, o.group);
          delete schedules[i];
        }

        // Cancel any pre-empted transitions.
        else if (+i < id) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("cancel", node, node.__data__, o.index, o.group);
          delete schedules[i];
        }
      }

      // Defer the first tick to end of the current frame; see d3/d3#1576.
      // Note the transition may be canceled after start and before the first tick!
      // Note this must be scheduled before the start event; see d3/d3-transition#16!
      // Assuming this is successful, subsequent callbacks go straight to tick.
      timeout(function() {
        if (self.state === STARTED) {
          self.state = RUNNING;
          self.timer.restart(tick, self.delay, self.time);
          tick(elapsed);
        }
      });

      // Dispatch the start event.
      // Note this must be done before the tween are initialized.
      self.state = STARTING;
      self.on.call("start", node, node.__data__, self.index, self.group);
      if (self.state !== STARTING) return; // interrupted
      self.state = STARTED;

      // Initialize the tween, deleting null tween.
      tween = new Array(n = self.tween.length);
      for (i = 0, j = -1; i < n; ++i) {
        if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
          tween[++j] = o;
        }
      }
      tween.length = j + 1;
    }

    function tick(elapsed) {
      var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
          i = -1,
          n = tween.length;

      while (++i < n) {
        tween[i].call(node, t);
      }

      // Dispatch the end event.
      if (self.state === ENDING) {
        self.on.call("end", node, node.__data__, self.index, self.group);
        stop();
      }
    }

    function stop() {
      self.state = ENDED;
      self.timer.stop();
      delete schedules[id];
      for (var i in schedules) return; // eslint-disable-line no-unused-vars
      delete node.__transition;
    }
  }

  function interrupt(node, name) {
    var schedules = node.__transition,
        schedule,
        active,
        empty = true,
        i;

    if (!schedules) return;

    name = name == null ? null : name + "";

    for (i in schedules) {
      if ((schedule = schedules[i]).name !== name) { empty = false; continue; }
      active = schedule.state > STARTING && schedule.state < ENDING;
      schedule.state = ENDED;
      schedule.timer.stop();
      schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
      delete schedules[i];
    }

    if (empty) delete node.__transition;
  }

  function selection_interrupt(name) {
    return this.each(function() {
      interrupt(this, name);
    });
  }

  function tweenRemove(id, name) {
    var tween0, tween1;
    return function() {
      var schedule = set(this, id),
          tween = schedule.tween;

      // If this node shared tween with the previous node,
      // just assign the updated shared tween and we’re done!
      // Otherwise, copy-on-write.
      if (tween !== tween0) {
        tween1 = tween0 = tween;
        for (var i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1 = tween1.slice();
            tween1.splice(i, 1);
            break;
          }
        }
      }

      schedule.tween = tween1;
    };
  }

  function tweenFunction(id, name, value) {
    var tween0, tween1;
    if (typeof value !== "function") throw new Error;
    return function() {
      var schedule = set(this, id),
          tween = schedule.tween;

      // If this node shared tween with the previous node,
      // just assign the updated shared tween and we’re done!
      // Otherwise, copy-on-write.
      if (tween !== tween0) {
        tween1 = (tween0 = tween).slice();
        for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1[i] = t;
            break;
          }
        }
        if (i === n) tween1.push(t);
      }

      schedule.tween = tween1;
    };
  }

  function transition_tween(name, value) {
    var id = this._id;

    name += "";

    if (arguments.length < 2) {
      var tween = get(this.node(), id).tween;
      for (var i = 0, n = tween.length, t; i < n; ++i) {
        if ((t = tween[i]).name === name) {
          return t.value;
        }
      }
      return null;
    }

    return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
  }

  function tweenValue(transition, name, value) {
    var id = transition._id;

    transition.each(function() {
      var schedule = set(this, id);
      (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
    });

    return function(node) {
      return get(node, id).value[name];
    };
  }

  function interpolate(a, b) {
    var c;
    return (typeof b === "number" ? interpolateNumber
        : b instanceof color ? interpolateRgb
        : (c = color(b)) ? (b = c, interpolateRgb)
        : interpolateString)(a, b);
  }

  function attrRemove(name) {
    return function() {
      this.removeAttribute(name);
    };
  }

  function attrRemoveNS(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }

  function attrConstant(name, interpolate, value1) {
    var string00,
        string1 = value1 + "",
        interpolate0;
    return function() {
      var string0 = this.getAttribute(name);
      return string0 === string1 ? null
          : string0 === string00 ? interpolate0
          : interpolate0 = interpolate(string00 = string0, value1);
    };
  }

  function attrConstantNS(fullname, interpolate, value1) {
    var string00,
        string1 = value1 + "",
        interpolate0;
    return function() {
      var string0 = this.getAttributeNS(fullname.space, fullname.local);
      return string0 === string1 ? null
          : string0 === string00 ? interpolate0
          : interpolate0 = interpolate(string00 = string0, value1);
    };
  }

  function attrFunction(name, interpolate, value) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null) return void this.removeAttribute(name);
      string0 = this.getAttribute(name);
      string1 = value1 + "";
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }

  function attrFunctionNS(fullname, interpolate, value) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
      string0 = this.getAttributeNS(fullname.space, fullname.local);
      string1 = value1 + "";
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }

  function transition_attr(name, value) {
    var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate;
    return this.attrTween(name, typeof value === "function"
        ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value))
        : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname)
        : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
  }

  function attrInterpolate(name, i) {
    return function(t) {
      this.setAttribute(name, i.call(this, t));
    };
  }

  function attrInterpolateNS(fullname, i) {
    return function(t) {
      this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
    };
  }

  function attrTweenNS(fullname, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }

  function attrTween(name, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }

  function transition_attrTween(name, value) {
    var key = "attr." + name;
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error;
    var fullname = namespace(name);
    return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
  }

  function delayFunction(id, value) {
    return function() {
      init(this, id).delay = +value.apply(this, arguments);
    };
  }

  function delayConstant(id, value) {
    return value = +value, function() {
      init(this, id).delay = value;
    };
  }

  function transition_delay(value) {
    var id = this._id;

    return arguments.length
        ? this.each((typeof value === "function"
            ? delayFunction
            : delayConstant)(id, value))
        : get(this.node(), id).delay;
  }

  function durationFunction(id, value) {
    return function() {
      set(this, id).duration = +value.apply(this, arguments);
    };
  }

  function durationConstant(id, value) {
    return value = +value, function() {
      set(this, id).duration = value;
    };
  }

  function transition_duration(value) {
    var id = this._id;

    return arguments.length
        ? this.each((typeof value === "function"
            ? durationFunction
            : durationConstant)(id, value))
        : get(this.node(), id).duration;
  }

  function easeConstant(id, value) {
    if (typeof value !== "function") throw new Error;
    return function() {
      set(this, id).ease = value;
    };
  }

  function transition_ease(value) {
    var id = this._id;

    return arguments.length
        ? this.each(easeConstant(id, value))
        : get(this.node(), id).ease;
  }

  function easeVarying(id, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (typeof v !== "function") throw new Error;
      set(this, id).ease = v;
    };
  }

  function transition_easeVarying(value) {
    if (typeof value !== "function") throw new Error;
    return this.each(easeVarying(this._id, value));
  }

  function transition_filter(match) {
    if (typeof match !== "function") match = matcher(match);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }

    return new Transition(subgroups, this._parents, this._name, this._id);
  }

  function transition_merge(transition) {
    if (transition._id !== this._id) throw new Error;

    for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }

    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }

    return new Transition(merges, this._parents, this._name, this._id);
  }

  function start(name) {
    return (name + "").trim().split(/^|\s+/).every(function(t) {
      var i = t.indexOf(".");
      if (i >= 0) t = t.slice(0, i);
      return !t || t === "start";
    });
  }

  function onFunction(id, name, listener) {
    var on0, on1, sit = start(name) ? init : set;
    return function() {
      var schedule = sit(this, id),
          on = schedule.on;

      // If this node shared a dispatch with the previous node,
      // just assign the updated shared dispatch and we’re done!
      // Otherwise, copy-on-write.
      if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

      schedule.on = on1;
    };
  }

  function transition_on(name, listener) {
    var id = this._id;

    return arguments.length < 2
        ? get(this.node(), id).on.on(name)
        : this.each(onFunction(id, name, listener));
  }

  function removeFunction(id) {
    return function() {
      var parent = this.parentNode;
      for (var i in this.__transition) if (+i !== id) return;
      if (parent) parent.removeChild(this);
    };
  }

  function transition_remove() {
    return this.on("end.remove", removeFunction(this._id));
  }

  function transition_select(select) {
    var name = this._name,
        id = this._id;

    if (typeof select !== "function") select = selector(select);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
          schedule(subgroup[i], name, id, i, subgroup, get(node, id));
        }
      }
    }

    return new Transition(subgroups, this._parents, name, id);
  }

  function transition_selectAll(select) {
    var name = this._name,
        id = this._id;

    if (typeof select !== "function") select = selectorAll(select);

    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          for (var children = select.call(node, node.__data__, i, group), child, inherit = get(node, id), k = 0, l = children.length; k < l; ++k) {
            if (child = children[k]) {
              schedule(child, name, id, k, children, inherit);
            }
          }
          subgroups.push(children);
          parents.push(node);
        }
      }
    }

    return new Transition(subgroups, parents, name, id);
  }

  var Selection = selection.prototype.constructor;

  function transition_selection() {
    return new Selection(this._groups, this._parents);
  }

  function styleNull(name, interpolate) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0 = styleValue(this, name),
          string1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : interpolate0 = interpolate(string00 = string0, string10 = string1);
    };
  }

  function styleRemove(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }

  function styleConstant(name, interpolate, value1) {
    var string00,
        string1 = value1 + "",
        interpolate0;
    return function() {
      var string0 = styleValue(this, name);
      return string0 === string1 ? null
          : string0 === string00 ? interpolate0
          : interpolate0 = interpolate(string00 = string0, value1);
    };
  }

  function styleFunction(name, interpolate, value) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0 = styleValue(this, name),
          value1 = value(this),
          string1 = value1 + "";
      if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }

  function styleMaybeRemove(id, name) {
    var on0, on1, listener0, key = "style." + name, event = "end." + key, remove;
    return function() {
      var schedule = set(this, id),
          on = schedule.on,
          listener = schedule.value[key] == null ? remove || (remove = styleRemove(name)) : undefined;

      // If this node shared a dispatch with the previous node,
      // just assign the updated shared dispatch and we’re done!
      // Otherwise, copy-on-write.
      if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);

      schedule.on = on1;
    };
  }

  function transition_style(name, value, priority) {
    var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
    return value == null ? this
        .styleTween(name, styleNull(name, i))
        .on("end.style." + name, styleRemove(name))
      : typeof value === "function" ? this
        .styleTween(name, styleFunction(name, i, tweenValue(this, "style." + name, value)))
        .each(styleMaybeRemove(this._id, name))
      : this
        .styleTween(name, styleConstant(name, i, value), priority)
        .on("end.style." + name, null);
  }

  function styleInterpolate(name, i, priority) {
    return function(t) {
      this.style.setProperty(name, i.call(this, t), priority);
    };
  }

  function styleTween(name, value, priority) {
    var t, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
      return t;
    }
    tween._value = value;
    return tween;
  }

  function transition_styleTween(name, value, priority) {
    var key = "style." + (name += "");
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error;
    return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
  }

  function textConstant(value) {
    return function() {
      this.textContent = value;
    };
  }

  function textFunction(value) {
    return function() {
      var value1 = value(this);
      this.textContent = value1 == null ? "" : value1;
    };
  }

  function transition_text(value) {
    return this.tween("text", typeof value === "function"
        ? textFunction(tweenValue(this, "text", value))
        : textConstant(value == null ? "" : value + ""));
  }

  function textInterpolate(i) {
    return function(t) {
      this.textContent = i.call(this, t);
    };
  }

  function textTween(value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
      return t0;
    }
    tween._value = value;
    return tween;
  }

  function transition_textTween(value) {
    var key = "text";
    if (arguments.length < 1) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error;
    return this.tween(key, textTween(value));
  }

  function transition_transition() {
    var name = this._name,
        id0 = this._id,
        id1 = newId();

    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          var inherit = get(node, id0);
          schedule(node, name, id1, i, group, {
            time: inherit.time + inherit.delay + inherit.duration,
            delay: 0,
            duration: inherit.duration,
            ease: inherit.ease
          });
        }
      }
    }

    return new Transition(groups, this._parents, name, id1);
  }

  function transition_end() {
    var on0, on1, that = this, id = that._id, size = that.size();
    return new Promise(function(resolve, reject) {
      var cancel = {value: reject},
          end = {value: function() { if (--size === 0) resolve(); }};

      that.each(function() {
        var schedule = set(this, id),
            on = schedule.on;

        // If this node shared a dispatch with the previous node,
        // just assign the updated shared dispatch and we’re done!
        // Otherwise, copy-on-write.
        if (on !== on0) {
          on1 = (on0 = on).copy();
          on1._.cancel.push(cancel);
          on1._.interrupt.push(cancel);
          on1._.end.push(end);
        }

        schedule.on = on1;
      });

      // The selection was empty, resolve end immediately
      if (size === 0) resolve();
    });
  }

  var id = 0;

  function Transition(groups, parents, name, id) {
    this._groups = groups;
    this._parents = parents;
    this._name = name;
    this._id = id;
  }

  function newId() {
    return ++id;
  }

  var selection_prototype = selection.prototype;

  Transition.prototype = {
    constructor: Transition,
    select: transition_select,
    selectAll: transition_selectAll,
    selectChild: selection_prototype.selectChild,
    selectChildren: selection_prototype.selectChildren,
    filter: transition_filter,
    merge: transition_merge,
    selection: transition_selection,
    transition: transition_transition,
    call: selection_prototype.call,
    nodes: selection_prototype.nodes,
    node: selection_prototype.node,
    size: selection_prototype.size,
    empty: selection_prototype.empty,
    each: selection_prototype.each,
    on: transition_on,
    attr: transition_attr,
    attrTween: transition_attrTween,
    style: transition_style,
    styleTween: transition_styleTween,
    text: transition_text,
    textTween: transition_textTween,
    remove: transition_remove,
    tween: transition_tween,
    delay: transition_delay,
    duration: transition_duration,
    ease: transition_ease,
    easeVarying: transition_easeVarying,
    end: transition_end,
    [Symbol.iterator]: selection_prototype[Symbol.iterator]
  };

  const linear = t => +t;

  function cubicInOut(t) {
    return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
  }

  var defaultTiming = {
    time: null, // Set on use.
    delay: 0,
    duration: 250,
    ease: cubicInOut
  };

  function inherit(node, id) {
    var timing;
    while (!(timing = node.__transition) || !(timing = timing[id])) {
      if (!(node = node.parentNode)) {
        throw new Error(`transition ${id} not found`);
      }
    }
    return timing;
  }

  function selection_transition(name) {
    var id,
        timing;

    if (name instanceof Transition) {
      id = name._id, name = name._name;
    } else {
      id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
    }

    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          schedule(node, name, id, i, group, timing || inherit(node, id));
        }
      }
    }

    return new Transition(groups, this._parents, name, id);
  }

  selection.prototype.interrupt = selection_interrupt;
  selection.prototype.transition = selection_transition;

  function Transform(k, x, y) {
    this.k = k;
    this.x = x;
    this.y = y;
  }

  Transform.prototype = {
    constructor: Transform,
    scale: function(k) {
      return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
    },
    translate: function(x, y) {
      return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
    },
    apply: function(point) {
      return [point[0] * this.k + this.x, point[1] * this.k + this.y];
    },
    applyX: function(x) {
      return x * this.k + this.x;
    },
    applyY: function(y) {
      return y * this.k + this.y;
    },
    invert: function(location) {
      return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
    },
    invertX: function(x) {
      return (x - this.x) / this.k;
    },
    invertY: function(y) {
      return (y - this.y) / this.k;
    },
    rescaleX: function(x) {
      return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
    },
    rescaleY: function(y) {
      return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
    },
    toString: function() {
      return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
    }
  };

  new Transform(1, 0, 0);

  Transform.prototype;

  function checkMobile() {
    let check = false;
    (function (a) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
          a,
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          a.substr(0, 4),
        )
      )
        check = true;
    })(
      navigator.userAgent || navigator.vendor || window.opera,
    );
    return check;
  }

  function inlineStyles(source, target) {
    // inline style from source element to the target (detached) one
    const computed = window.getComputedStyle(source);
    for (const styleKey of computed) {
      target.style[styleKey] = computed[styleKey];
    }

    // recursively call inlineStyles for the element children
    for (let i = 0; i < source.children.length; i++) {
      inlineStyles(source.children[i], target.children[i]);
    }
  }

  function copyToCanvas({ source, target, scale, format, quality }) {
    let svgData = new XMLSerializer().serializeToString(target);
    let canvas = document.createElement('canvas');
    let svgSize = source.getBoundingClientRect();

    //Resize can break shadows
    canvas.width = svgSize.width * scale;
    canvas.height = svgSize.height * scale;
    canvas.style.width = svgSize.width;
    canvas.style.height = svgSize.height;

    let ctxt = canvas.getContext('2d');
    ctxt.scale(scale, scale);

    let img = document.createElement('img');

    img.setAttribute(
      'src',
      'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
    );
    return new Promise(resolve => {
      img.onload = () => {
        ctxt.drawImage(img, 0, 0);
        resolve(
          canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : format}`, quality)
        );
      };
    });
  }

  function downloadImage({ file, name, format }) {
    let a = document.createElement('a');
    a.download = `${name}.${format}`;
    a.href = file;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  var d3SvgToPng = async function (
    source,
    name,
    {
      scale = 1,
      format = 'png',
      quality = 0.92,
      download = true,
      ignore = null,
      cssinline = 1,
      background = null
    } = {}
  ) {
    // Accept a selector or directly a DOM Element
    source = source instanceof Element ? source : document.querySelector(source);

    // Create a new SVG element similar to the source one to avoid modifying the
    // source element.
    const target = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    target.innerHTML = source.innerHTML;
    for (const attr of source.attributes) {
      target.setAttribute(attr.name, attr.value);
    }

    // Set all the css styles inline on the target element based on the styles
    // of the source element
    if (cssinline === 1) {
      inlineStyles(source, target);
    }

    if (background) {
      target.style.background = background;
    }

    //Remove unwanted elements
    if (ignore != null) {
      const elts = target.querySelectorAll(ignore);
      [].forEach.call(elts, elt => elt.parentNode.removeChild(elt));
    }

    //Copy all html to a new canvas
    const file = await copyToCanvas({
      source,
      target,
      scale,
      format,
      quality
    });

    if (download) {
      downloadImage({ file, name, format });
    }
    return file;
  };

  function serialize(svg) {
    const xmlns = "http://www.w3.org/2000/xmlns/";
    const xlinkns = "http://www.w3.org/1999/xlink";
    const svgns = "http://www.w3.org/2000/svg";
    svg = svg.cloneNode(true);
    const fragment = window.location.href + "#";
    const walker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) {
      for (const attr of walker.currentNode.attributes) {
        if (attr.value.includes(fragment)) {
          attr.value = attr.value.replace(fragment, "#");
        }
      }
    }
    svg.setAttributeNS(xmlns, "xmlns", svgns);
    svg.setAttributeNS(xmlns, "xmlns:xlink", xlinkns);
    const serializer = new window.XMLSerializer();
    const string = serializer.serializeToString(svg);
    return new Blob([string], {
      type: "image/svg+xml",
    });
  }

  function getRequiredStyles(elem) {
    if (!elem) return []; // Element does not exist, empty list.
    const requiredStyles = [
      "font-family",
      "font-weight",
      "font-size",
      "transform-origin",
      "dy",
      "text-align",
      "dominant-baseline",
      "text-anchor",
    ]; // If the text styling is wrong, its possible a required styling is missing from here! Add it in.
    // console.log(elem);
    var win = document.defaultView || window,
      style,
      styleNode = [];
    if (win.getComputedStyle) {
      /* Modern browsers */
      style = win.getComputedStyle(elem, "");
      //console.log(style);
      for (var i = 0; i < requiredStyles.length; i++) {
        //console.log(requiredStyles[i]);
        styleNode.push(
          requiredStyles[i] + ":" + style.getPropertyValue(requiredStyles[i])
        );
        //               ^name ^           ^ value ^
      }
    } else if (elem.currentStyle) {
      /* IE */
      style = elem.currentStyle;
      console.log(style);
      for (var name in style) {
        styleNode.push(name + ":" + style[name]);
      }
    } else {
      /* Ancient browser..*/
      style = elem.style;
      console.log(style);
      for (var i = 0; i < style.length; i++) {
        styleNode.push(style[i] + ":" + style[style[i]]);
      }
    }
    return styleNode;
  }

  const addStyles = (chart) => {
    /* Function to add the styles from the CSS onto the computed SVG before saving it.
  // Currently only implemented to fix the font-size and font-family attributes for any text class. 
  // If these values are set within the d3 (i.e. directly onto the SVG), this is unnecessary
  // But it ensures that text styling using CSS is retained. */

    const textElements = chart.getElementsByTagName("text");
    // console.log(textElements);

    const mainStyles = getRequiredStyles(chart);
    // console.log(mainStyles);
    chart.style.cssText = mainStyles.join(";");
    Array.from(textElements).forEach(function (element) {
      // console.log(element);
      // console.log(element)
      const styles = getRequiredStyles(element);
      // console.log(styles)
      element.style.cssText = styles.join(";");
    });
    return chart;
  };

  const saveChart = (chartID) => {
    const chart = document.getElementById(chartID);

    if (chart === null) {
      alert("error! svg incorrectly selected!");
      return -1;
    }

    const chartWithStyles = addStyles(chart);
    // const chartCopy = chartWithStyles
    const chartCopy = chartWithStyles.cloneNode(true);
    const saveButton = chartCopy.getElementById("save-button");
    if (saveButton) saveButton.remove();
    chartCopy.getElementById("exit-button").remove();
    Array.from(chartCopy.getElementsByClassName("rotation-handles")).forEach(
      (item) => item.remove()
    );
    const chartBlob = serialize(chartCopy);
    const fileURL = URL.createObjectURL(chartBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = fileURL;
    downloadLink.download = `${chartID}.svg`;
    document.body.appendChild(downloadLink);

    downloadLink.click();
  };

  // export const saveChartPng = (chartID) => {
  //   const chart = document.getElementById(chartID);

  //   if (chart === null) {
  //     alert("error! svg incorrectly selected!");
  //     return -1;
  //   }

  //   const chartWithStyles = addStyles(chart);
  //   // const chartCopy = chartWithStyles
  //   const chartCopy = chartWithStyles.cloneNode(true);
  //   const saveButton = chartCopy.getElementById("save-button");
  //   if (saveButton) saveButton.remove();
  //   const exitButton = chartCopy.getElementById("exit-button");
  //   if (exitButton) saveButton.remove();
  //   Array.from(chartCopy.getElementsByClassName("rotation-handles")).forEach(
  //     (item) => item.remove()
  //   );
  //   const chartBlob = serialize(chartCopy);
  //   const url = URL.createObjectURL(chartBlob);

  // };

  // export const saveChartPng = () => {
  //   const dataHeader = 'data:image/svg+xml;charset=utf-8'
  //   const $svg = document.getElementById('svg-container').querySelector('svg')
  //   const $holder = document.getElementById('img-container')
  //   const $label = document.getElementById('img-format')

  //   const destroyChildren = $element => {
  //     while ($element.firstChild) {
  //       const $lastChild = $element.lastChild ?? false
  //       if ($lastChild) $element.removeChild($lastChild)
  //     }
  //   }

  //   const loadImage = async url => {
  //     const $img = document.createElement('img')
  //     $img.src = url
  //     return new Promise((resolve, reject) => {
  //       $img.onload = () => resolve($img)
  //       $img.onerror = reject
  //     })
  //   }

  //   const serializeAsXML = $e => (new XMLSerializer()).serializeToString($e)

  //   const encodeAsUTF8 = s => `${dataHeader},${encodeURIComponent(s)}`
  //   const encodeAsB64 = s => `${dataHeader};base64,${btoa(s)}`

  //   const convertSVGtoImg = async e => {
  //     const $btn = e.target
  //     const format = $btn.dataset.format ?? 'png'
  //     $label.textContent = format

  //     destroyChildren($holder)

  //     const svgData = encodeAsUTF8(serializeAsXML($svg))

  //     const img = await loadImage(svgData)

  //     const $canvas = document.createElement('canvas')
  //     $canvas.width = $svg.clientWidth
  //     $canvas.height = $svg.clientHeight
  //     $canvas.getContext('2d').drawImage(img, 0, 0, $svg.clientWidth, $svg.clientHeight)

  //     const dataURL = await $canvas.toDataURL(`image/${format}`, 1.0)
  //     console.log(dataURL)

  //     const $img = document.createElement('img')
  //     $img.src = dataURL
  //     $holder.appendChild($img)
  //   }

  //   const buttons = [...document.querySelectorAll('[data-format]')]
  //   for (const $btn of buttons) {
  //     $btn.onclick = convertSVGtoImg
  //   }
  // }

  const saveChartPng = (chartID) => {
      const chart = document.getElementById(chartID);

    if (chart === null) {
      alert("error! svg incorrectly selected!");
      return -1;
    }

    // const chartWithStyles = addStyles(chart);
    // const chartCopy = chartWithStyles
    const chartCopy = chart.cloneNode(true);
    const saveButton = chartCopy.getElementById("save-button");
    if (saveButton) saveButton.remove();
    const exitButton = chartCopy.getElementById("exit-button");
    if (exitButton) saveButton.remove();
    Array.from(chartCopy.getElementsByClassName("rotation-handles")).forEach(
      (item) => item.remove()
    );
    console.log(chartCopy);
    d3SvgToPng(chart, "CanoePoloWhiteboard");
    const chartBlob = serialize(chartCopy);
    // const pngImage = svgString2Image( chartBlob, 2*width, 2*height, 'png', save )
    // console.log(pngImage)
    URL.createObjectURL(chartBlob);
    // const downloadLink = document.createElement("a");
    // downloadLink.href = fileURL;
    // downloadLink.download = `${chartID}.svg`;
    // document.body.appendChild(downloadLink);

    // downloadLink.click();
  };

  const getInitialBoatState = (width, height) => {
    const team1Pos = [
      {
        x: width / 9,
        y: height / 2,
        r0: 90,
        r:90,
        color: "#b58cd9",
        id: 1,
        team: 1,
        visible: null,
      },
      {
        x: (width * 2) / 9,
        y: height / 3,
        r0: 90,
        r:90,
        color: "#b58cd9",
        id: 2,
        team: 1,
        visible: null,
      },
      {
        x: (width * 2) / 9,
        y: (height * 2) / 3,
        r0: 90,
        r:90,
        color: "#b58cd9",
        id: 3,
        team: 1,
        visible: null,
      },
      {
        x: (width * 3) / 9,
        y: height / 6,
        r0: 90,
        r:90,
        color: "#b58cd9",
        id: 4,
        team: 1,
        visible: null,
      },
      {
        x: (width * 3) / 9,
        y: (height * 5) / 6,
        r0: 90,
        r:90,
        color: "#b58cd9",
        id: 5,
        team: 1,
        visible: null,
      },
    ];
    const team2Pos = [
      {
        x: width - width / 9,
        y: height / 2,
        r0: -90,
        r:-90,
        color: "#b2e6ce",
        id: 6,
        team: 2,
        visible: null,
      },
      {
        x: width - (width * 2) / 9,
        y: height / 3,
        r0: -90,
        r:-90,
        color: "#b2e6ce",
        id: 7,
        team: 2,
        visible: null,
      },
      {
        x: width - (width * 2) / 9,
        y: (height * 2) / 3,
        r0: -90,
        r:-90,
        color: "#b2e6ce",
        id: 8,
        team: 2,
        visible: null,
      },
      {
        x: width - (width * 3) / 9,
        y: height / 6,
        r0: -90,
        r:-90,
        color: "#b2e6ce",
        id: 9,
        team: 2,
        visible: null,
      },
      {
        x: width - (width * 3) / 9,
        y: (height * 5) / 6,
        r0: -90,
        r:-90,
        color: "#b2e6ce",
        id: 10,
        team: 2,
        visible: null,
      },
    ];
    //   console.log(team1Pos.slice(0, 4));
    // const positions = team1Pos.slice(0, nTeam1).concat(team2Pos.slice(0, nTeam2));

    return team1Pos.concat(team2Pos);
  };

  const getInitialBallState = (width, height) => {
    return {
      x: width / 2 + 0.02 * width,
      y: height / 2 + 0.02 * height,
      r0: 0,
    };
  };

  const getInitialBoatStateKickoff = (width, height) => {
    const boatHeight = min([width, height]) / 4;
    const team1Pos = [
      {
        x: 0 + boatHeight * 0.6,
        y: height / 2,
        r0: 90,
        r: 90,
        color: "#b58cd9",
        id: 1,
        team: 1,
        visible: null,
      },
      {
        x: 0,
        y: height / 3,
        r0: 90,
        r: 90,
        color: "#b58cd9",
        id: 2,
        team: 1,
        visible: null,
      },
      {
        x: 0,
        y: (height * 2) / 3,
        r0: 90,
        r: 90,
        color: "#b58cd9",
        id: 3,
        team: 1,
        visible: null,
      },
      {
        x: 0,
        y: height / 6,
        r0: 90,
        r: 90,
        color: "#b58cd9",
        id: 4,
        team: 1,
        visible: null,
      },
      {
        x: 0,
        y: (height * 5) / 6,
        r0: 90,
        r: 90,
        color: "#b58cd9",
        id: 5,
        team: 1,
        visible: null,
      },
    ];
    const team2Pos = [
      {
        x: width - (min([width, height]) / 4) * 0.6,
        y: height / 2,
        r0: -90,
        r: -90,
        color: "#b2e6ce",
        id: 6,
        team: 2,
        visible: null,
      },
      {
        x: width,
        y: height / 3,
        r0: -90,
        r: -90,
        color: "#b2e6ce",
        id: 7,
        team: 2,
        visible: null,
      },
      {
        x: width,
        y: (height * 2) / 3,
        r0: -90,
        r: -90,
        color: "#b2e6ce",
        id: 8,
        team: 2,
        visible: null,
      },
      {
        x: width,
        y: height / 6,
        r0: -90,
        r: -90,
        color: "#b2e6ce",
        id: 9,
        team: 2,
        visible: null,
      },
      {
        x: width,
        y: (height * 5) / 6,
        r0: -90,
        r: -90,
        color: "#b2e6ce",
        id: 10,
        team: 2,
        visible: null,
      },
    ];
    //   console.log(team1Pos.slice(0, 4));
    // const positions = team1Pos.slice(0, nTeam1).concat(team2Pos.slice(0, nTeam2));

    return team1Pos.concat(team2Pos);
  };

  const getOrangeDefensiveFormation = (width, height) => {
    const boatHeight = min([width, height]) / 4;
    return [
      {
        x: width / 9,
        y: height / 2,
        r0: 90,
        r: 90,
        color: "#b58cd9",
        id: 1,
        visible: null,
      },
      {
        x: (width * 2) / 9,
        y: (height * 2) / 5,
        r0: 135,
        r: 135,
        color: "#b58cd9",
        id: 2,
        visible: null,
      },
      {
        x: (width * 2) / 9,
        y: (height * 3) / 5,
        r0: 45,
        r: 45,
        color: "#b58cd9",
        id: 3,
        visible: null,
      },
      {
        x: (width * 3) / 9,
        y: (height * 3) / 10,
        r0: 120,
        r: 120,
        color: "#b58cd9",
        id: 4,
        visible: null,
      },
      {
        x: (width * 3) / 9,
        y: (height * 7) / 10,
        r0: 70,
        r: 70,
        color: "#b58cd9",
        id: 5,
        visible: null,
      },

      {
        x: width - width / 9,
        y: height / 2,
        r0: -90,
        r: -90,
        color: "#b2e6ce",
        id: 6,
        visible: null,
      },
      {
        x: width - (width * 4) / 9,
        y: height / 3,
        r0: -90,
        r: -90,
        color: "#b2e6ce",
        id: 7,
        visible: null,
      },
      {
        x: width / 2 + 0.3 * boatHeight,
        y: height / 2,
        r0: -90,
        r: -90,
        color: "#b2e6ce",
        id: 8,
        visible: null,
      },
      {
        x: width / 2 + boatHeight,
        y: height / 6,
        r0: -90,
        r: -90,
        color: "#b2e6ce",
        id: 9,
        visible: null,
      },
      {
        x: width / 2 + boatHeight,
        y: (height * 4.5) / 6,
        r0: -90,
        r: -90,
        color: "#b2e6ce",
        id: 10,
        visible: null,
      },
    ];
  };

  const getGreenDefensiveFormation = (width, height) => {
    const boatHeight = min([width, height]) / 4;
    return [
      {
        x: width / 2-0.1*boatHeight,
        y: height / 2,
        r0: 90,
        r: 90,
        color: "#b58cd9",
        id: 1,
        visible: null,
      },
      {
        x: (width * 2) / 9,
        y: (height * 2) / 5,
        r0: 100,
        r: 100,
        color: "#b58cd9",
        id: 2,
        visible: null,
      },
      {
        x: (width * 3) / 9,
        y: (height * 3) / 5,
        r0: 80,
        r: 80,
        color: "#b58cd9",
        id: 3,
        visible: null,
      },
      {
        x: (width * 4) / 9,
        y: (height * 3) / 10,
        r0: 85,
        r: 85,
        color: "#b58cd9",
        id: 4,
        visible: null,
      },
      {
        x: (width * 4) / 9,
        y: (height * 7) / 10,
        r0: 95,
        r: 95,
        color: "#b58cd9",
        id: 5,
        visible: null,
      },

      {
        x: width - 0.2*boatHeight,
        y: height / 2,
        r0: -90,
        r: -90,
        color: "#b2e6ce",
        id: 6,
        visible: null,
      },
      {
        x: width/2 + boatHeight*1.4,
        y: height / 3,
        r0: -110,
        r: 110,
        color: "#b2e6ce",
        id: 7,
        visible: null,
      },
      {
        x: width / 2 + 1.4*boatHeight,
        y: height / 2+0.8*boatHeight,
        r0: -60,
        r: -60,
        color: "#b2e6ce",
        id: 8,
        visible: null,
      },
      {
        x: width - boatHeight,
        y: height *2.5/ 6,
        r0: -140,
        r: -140,
        color: "#b2e6ce",
        id: 9,
        visible: null,
      },
      {
        x: width - boatHeight,
        y: (height * 3.5) / 6,
        r0: -50,
        r: -50,
        color: "#b2e6ce",
        id: 10,
        visible: null,
      },
    ];
  };

  const initialStateDict = {
    Kickoff: getInitialBoatStateKickoff,
    Even: getInitialBoatState,
    "Post Orange Goal": getOrangeDefensiveFormation,
    "Post Green Goal": getGreenDefensiveFormation,
  };

  const generateBoatPath = (x, y, w, height) => {
    let h = height/2;
    let pathD = `M ${x - w / 2} ${y},
  C ${x - w / 2} ${y}, ${x - w / 4} ${y + h}, ${x - w / 4} ${y + h},
  C ${x - w / 4} ${y + h},${x} ${y + h + h * 0.1},${x + w / 4} ${y + h}
  C ${x + w / 4} ${y + h}, ${x + w / 2} ${y},${x + w / 2} ${y}
  
  C ${x + w / 2} ${y}, ${x + w / 4} ${y - h}, ${x + w / 4} ${y - h}
   C ${x + w / 4} ${y - h}, ${x} ${y - h - h * 0.2}, ${x - w / 4} ${y - h}z`;
    // console.log(pathD);
    return pathD;
  };

  function handleRotation(e) {
    const parentNode = d3.select(this.parentNode);
    let d = parentNode.datum();

    let dx, dy;

    if (window.mobile) {
      const touch = e.touches[0];
      dx = touch.pageX;
      dy = touch.pageY;
    } else {
      dx = e.sourceEvent.pageX;
      dy = e.sourceEvent.pageY;
    }

    // console.log("d.x = ", d.x);
    // let newAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    let a = { x: d.x, y: 0 };
    let b = { x: d.x, y: d.y };
    let c = { x: dx, y: dy };

    let angle = Number(find_angle(a, b, c)) * (180 / Math.PI);
    // console.log("pre-edit angle = ", angle.toFixed(2));
    if (dx > d.x) angle = 360 - angle;
    angle = 180 - angle;
    // console.log("new angle = ", angle.toFixed(2));

    d.r = angle;

    parentNode.attr(
      "transform",
      (d) => `translate(${d.x}, ${d.y}) rotate(${d.r})`
    );
  }

  function handleDrag(e) {
    // console.log(e);
    const parentNode = d3.select(this.parentNode);
    let d = parentNode.datum(); // Get bound data
    // console.log(e.dx.toFixed(1), e.dy.toFixed(1));
    let dx, dy;
    if (!d.r) {
      d.r = d.r0;
    }
    if (window.mobile) {
      const touch = e.touches[0];

      dx = touch.pageX - window.dragStart[0];
      window.dragStart[0] = touch.pageX;

      dy = touch.pageY - window.dragStart[1];
      window.dragStart[1] = touch.pageY;

    } else {
      dx = e.sourceEvent.pageX - window.dragStart[0];
      window.dragStart[0] = e.sourceEvent.pageX;

      dy = e.sourceEvent.pageY - window.dragStart[1];
      window.dragStart[1] = e.sourceEvent.pageY;
      
    }

    d.x = d.x + dx;
    d.y = d.y + dy;
    parentNode.attr("transform", (d) => {
      return `translate(${d.x}, ${d.y}) rotate(${d.r})`;
    });
  }

  function find_angle(A, B, C) {
    var AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
    var BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
    var AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
    return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
  }

  function dragStart(e) {
    const parentNode = d3.select(this.parentNode);
    parentNode.datum(); // Get bound data
    if (window.mobile) {
      window.dragStart = [e.touches[0].pageX, e.touches[0].pageY];
    } else {
      window.dragStart = [e.sourceEvent.pageX, e.sourceEvent.pageY];
    }

    // console.log(window.dragStart);
  }

  const teamColors = {
    1: {
      baseColor: "#b58cd9",
      outline: "#9d66cc",
      cockpitColor: "#ffffff",
      number: "#4f2673",
      handleColor: "#35194d",
    },
    2: {
      baseColor: "#66cc9d",
      outline: "#3fc084",
      cockpitColor: "#ffffff",
      number: "#26734f",
      handleColor: "#0d261a",
    },
  };

  const canoePoloWhiteboard = () => {
    let boatState;
    let transitionDuration = 1000;

    const my = (svg) => {
      //   console.log(screen.height);

      const width = svg.node().getBoundingClientRect().width;
      const height = svg.node().getBoundingClientRect().height;
      // console.log(width, height)
      const smallAxis = min([width, height]);
      svg.attr("viewBox", `0 0 ${width} ${height}`);

      const boatWidth = smallAxis / 20;
      const boatHeight = smallAxis / 4;
      const goalHeight = height / 10;
      const goalWidth = width * 0.005;

      if (!boatState) {
        boatState = initialStateFunction(width, height, boatHeight);
      }

      const playingArea = svg
        .selectAll(".playingArea")
        .data([{ width: width, height: height }])
        .join("g")
        .attr(
          "transform",
          (d) => `translate(${d.width * 0.01}, ${d.height * 0.01})`
        )
        .attr("class", "playingArea");

      playingArea
        .selectAll("#pitch")
        .data((playingAreaData) => [playingAreaData])
        .join("rect")
        .attr("width", (d) => d.width * 0.98)
        .attr("height", (d) => d.height * 0.98)
        .attr("x", 0)
        .attr("y", 0)
        .attr("id", "pitch")
        .attr("stroke", "#264a73")
        .attr("stroke-width", 2)
        .attr("fill", "#ffffff");

      playingArea
        .selectAll(".goals")
        .data([0 - goalWidth, width * 0.98])
        .join("rect")
        .attr("x", (d) => d)
        .attr("class", "goals")
        .attr("y", height / 2 - goalHeight / 2)
        .attr("width", goalWidth)
        .attr("height", goalHeight);

      playingArea
        .selectAll(".area-lines")
        .data([2 * boatHeight, width * 0.98 - 2 * boatHeight])
        .join("line")
        .attr("class", "area-lines")
        .attr("x1", (d) => d)
        .attr("x2", (d) => d)
        .attr("y1", 0)
        .attr("y2", height * 0.98)
        .attr("stroke", "#cc6695")
        .attr("stroke-width", 0.3);

      let drag$1 = drag().on("start", dragStart).on("drag", handleDrag);
      let rotation = drag().on("drag", handleRotation);

      svg
        .selectAll(".nodes")
        .data(boatState, (d) => d.id)
        .join(
          (enter) => {
            const g = enter
              .append("g")
              .attr("class", "nodes")
              .attr(
                "transform",
                (d) => `translate(${d.x},${d.y}) rotate(${d.r0})`
              )
              .style("display", (d) => d.visible);
            let boats;
            if (-1 < navigator.userAgent.search("Firefox")) {
              boats = g
                .selectAll(".boat")
                .data((nodeData) => [nodeData])
                .join("ellipse")
                .attr("class", "boat")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("rx", boatWidth/2)
                .attr("ry", boatHeight/2)
                .attr("fill", (d) => teamColors[d.team].baseColor)
                .attr("stroke", (d) => teamColors[d.team].outline)
                .attr("stroke-width", boatWidth / 20);
            } else {
              boats = g
                .selectAll(".boat")
                .data((nodeData) => [nodeData])
                .join("path")
                .attr("class", "boat")
                .attr("d", generateBoatPath(0, 0, boatWidth, boatHeight))
                .attr("fill", (d) => teamColors[d.team].baseColor)
                .attr("stroke", (d) => teamColors[d.team].outline)
                .attr("stroke-width", boatWidth / 20);
            }
            const rotationHandles = g
              .append("circle")
              .attr("cx", 0)
              .attr("cy", boatHeight / 2 + boatWidth / 2)
              .attr("r", boatWidth / 8)
              .attr("fill", (d) => teamColors[d.team].handleColor)
              .attr("stroke", (d) => teamColors[d.team].handleColor)
              .attr("class", "rotation-handles")
              .attr("stroke-width", 2);

            const cockpits = g
              .append("circle")
              .attr("class", "cockpits")
              .attr("cx", 0)
              .attr("cy", 0)
              .attr("r", boatWidth / 2)
              .attr("opacity", 0.7)
              .attr("fill", (d) => teamColors[d.team].cockpitColor);

            const ids = g
              .selectAll(".boatID")
              .data((nodeData) => [nodeData])
              .join("text")
              .attr("class", "boatID")
              .attr("x", 0)
              .attr("fill", (d) => teamColors[d.team].number)
              .attr("y", boatWidth * 0.3)
              .attr("text-anchor", "middle")
              .attr("font-size", boatWidth * 0.8)
              .attr("transform", (d) => `rotate(${-d.r0})`)
              .text((d) => d.id);

            if (window.mobile) {
              // ids.on('touchmove', drag);
              ids.on("touchstart", dragStart).on("touchmove", handleDrag);
              cockpits.on("touchstart", dragStart).on("touchmove", handleDrag);
              boats.on("touchstart", dragStart).on("touchmove", handleDrag);
              rotationHandles.on("touchmove", handleRotation);
            } else {
              // console.log("false");
              ids.call(drag$1);
              cockpits.call(drag$1);
              boats.call(drag$1);
              rotationHandles.call(rotation);
            }
          },
          (update) => {
            update
              .transition()
              .ease(linear)
              .duration(transitionDuration)
              .attr("transform", (d) =>
                d.r
                  ? `translate(${d.x},${d.y}) rotate(${d.r})`
                  : `translate(${d.x},${d.y}) rotate(${d.r0})`
              )
              .style("display", (d) => d.visible);
            update
              .selectAll(".boat")
              .attr("fill", (d) => d.color)
              .attr("d", generateBoatPath(0, 0, boatWidth, boatHeight));
            update.selectAll(".cockpits").attr("r", boatWidth / 2);

            update
              .selectAll(".rotation-handles")
              .attr("cy", boatHeight / 2 + boatWidth / 2)
              .attr("r", boatWidth / 8);

            update
              .selectAll(".boatID")
              .attr("y", boatWidth * 0.3)
              .attr("font-size", boatWidth * 0.8);
          }
        );

      // const arrows = nodes
      //   .selectAll(".arrow")
      //   .append("line")
      //   .attr("x1", 0)
      //   .attr("y1", -boatWidth / 2)
      //   .attr("x2", 0)
      //   .attr("y2", -boatHeight / 3);
    };
    my.boatState = function (_) {
      return arguments.length ? ((boatState = _), my) : my;
    };
    my.transitionDuration = function (_) {
      return arguments.length ? ((transitionDuration = _), my) : my;
    };
    return my;
  };

  const ballColor = "#264a73";
  const Ball = () => {
    let ballState;
    let transitionDuration = 1000;
    const my = (svg) => {
      const width = svg.node().getBoundingClientRect().width;
      const height = svg.node().getBoundingClientRect().height;
      const radius = width / 120;
      if (!ballState)
        ballState = {
          x: width / 2 + 0.02 * width,
          y: height / 2 + 0.02 * height,
          r0: 0,
        };
      svg
        .selectAll(".ball")
        .data([ballState])
        .join(
          (enter) => {
            const g = enter
              .append("g")
              .attr("transform", (d) => `translate(${d.x},  ${d.y})`)
              .attr("class", "ball");

            const circle = g
              .append("circle")
              .attr("stroke-width", 2)
              .attr("stroke", "black")
              .attr("cx", 0)
              .attr("cy", 0)
              .attr("fill", ballColor)
              .attr("r", radius);

            if (window.mobile) {
              circle.on("touchstart", dragStart).on("touchmove", handleDrag);
            } else {
              let drag = d3.drag().on("start", dragStart).on("drag", handleDrag);
              circle.call(drag);
            }
          },
          (update) => {
            update
              .transition()
              .ease(d3.easeLinear)
              .duration(transitionDuration)
              .attr("transform", (d) => {
                //   console.log(d);
                return `translate(${d.x},  ${d.y})`;
              });
            update.selectAll(".ball").attr("r", radius);
          }
        );
    };
    my.ballState = function (_) {
      return arguments.length ? ((ballState = _), my) : my;
    };
    my.transitionDuration = function (_) {
      return arguments.length ? ((transitionDuration = _), my) : my;
    };
    return my;
  };

  const displayFullScreen = async () => {
    var elem = document.documentElement;

    if (elem.requestFullscreen) {
      await elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Safari */
      await elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE11 */
      await elem.msRequestFullscreen();
    }

    // const svg = d3.select("#whiteboard-svg");
    // const pitch = d3.select("#pitch");

    resetScreen("whiteboard-svg");

    // d3.select("#fullscreen-button")
    //   .classed("fa-maximize", false)
    //   .classed("fa-xmark", true);
    document.getElementById("fullscreen-button").classList.remove("fa-maximize");
    document.getElementById("fullscreen-button").classList.add("fa-xmark");
    document.getElementById("fullscreen-button").onclick = exitFullscreen;
  };

  const exitFullscreen = () => {
    console.log("exiting");
    resetScreen("whiteboard-svg");
    // d3.select("#fullscreen-button")
    //   .classed("fa-xmark", false)
    //   .classed("fa-maximize", true);
    document.getElementById("fullscreen-button").classList.remove("fa-xmark");
    document.getElementById("fullscreen-button").classList.add("fa-maximize");
    document.getElementById("fullscreen-button").onclick = () =>
      displayFullScreen();
    document.exitFullscreen();
  };

  const resetScreen = (resetBoats) => {
    // console.log("reset");

    const svg = d3.select("#whiteboard-svg");
    svg.selectAll("*").interrupt();

    document.getElementById("chart-container").style.width = `${
    window.innerWidth * 0.99
  }px`;
    document.getElementById("chart-container").style.height = `${
    window.innerHeight * 0.9
  }px`;

    svg
      .select("#background-rect")
      .attr("width", svg.node().getBoundingClientRect().width)
      .attr("height", svg.node().getBoundingClientRect().height);
    // console.log(
    //   svg.node().getBoundingClientRect().width,
    //   svg.node().getBoundingClientRect().height
    // );
    let boatState;
    let ballState;
    if (resetBoats) {
      boatState = window.resetState(
        svg.node().getBoundingClientRect().width,
        svg.node().getBoundingClientRect().height
      );
      ballState = getInitialBallState(
        svg.node().getBoundingClientRect().width,
        svg.node().getBoundingClientRect().height
      );
    } else {
      boatState = svg.selectAll(".nodes").data();
      ballState = svg.selectAll(".ball").data()[0];
    }

    const whiteboard = canoePoloWhiteboard().boatState(boatState);
    svg.call(whiteboard);
    if (window.ball) {
      const ball = Ball().ballState(ballState);
      svg.call(ball);
    }
  };

  const demoWidth = 1313;
  const demoHeight = 756;
  const demoStates = [
    [
      {
        x: 109,
        y: 379,
        r0: 90,
        color: "#e6ceb2",
        id: 1,
        team: 1,
        r: 90,
      },
      {
        x: 32,
        y: 245,
        r0: 90,
        color: "#e6ceb2",
        id: 2,
        team: 1,
        r: 90,
      },
      {
        x: 25,
        y: 533,
        r0: 90,
        color: "#e6ceb2",
        id: 3,
        team: 1,
        r: 90,
      },
      {
        x: 29,
        y: 107,
        r0: 90,
        color: "#e6ceb2",
        id: 4,
        team: 1,
        r: 90,
      },
      {
        x: 24,
        y: 627,
        r0: 90,
        color: "#e6ceb2",
        id: 5,
        team: 1,
        r: 90,
      },
      {
        x: 1207,
        y: 378,
        r0: -90,
        color: "#b2e6ce",
        id: 1,
        team: 2,
        r: -90,
      },
      {
        x: 1284,
        y: 253,
        r0: -90,
        color: "#b2e6ce",
        id: 2,
        team: 2,
        r: -90,
      },
      {
        x: 1289,
        y: 499,
        r0: -90,
        color: "#b2e6ce",
        id: 3,
        team: 2,
        r: -90,
      },
      {
        x: 1277,
        y: 138,
        r0: -90,
        color: "#b2e6ce",
        id: 4,
        team: 2,
        r: -90,
      },
      {
        x: 1291,
        y: 619,
        r0: -90,
        color: "#b2e6ce",
        id: 5,
        team: 2,
        r: -90,
      },
    ],
    [
      {
        x: 327,
        y: 379,
        r0: 90,
        color: "#e6ceb2",
        id: 1,
        team: 1,
        r: 97.30575953331082,
      },
      {
        x: 32,
        y: 245,
        r0: 90,
        color: "#e6ceb2",
        id: 2,
        team: 1,
        r: 90,
      },
      {
        x: 25,
        y: 533,
        r0: 90,
        color: "#e6ceb2",
        id: 3,
        team: 1,
        r: 90,
      },
      {
        x: 29,
        y: 107,
        r0: 90,
        color: "#e6ceb2",
        id: 4,
        team: 1,
        r: 90,
      },
      {
        x: 24,
        y: 627,
        r0: 90,
        color: "#e6ceb2",
        id: 5,
        team: 1,
        r: 90,
      },
      {
        x: 981,
        y: 361,
        r0: -90,
        color: "#b2e6ce",
        id: 1,
        team: 2,
        r: -96.76617482255305,
      },
      {
        x: 1284,
        y: 253,
        r0: -90,
        color: "#b2e6ce",
        id: 2,
        team: 2,
        r: -90,
      },
      {
        x: 1289,
        y: 499,
        r0: -90,
        color: "#b2e6ce",
        id: 3,
        team: 2,
        r: -90,
      },
      {
        x: 1277,
        y: 138,
        r0: -90,
        color: "#b2e6ce",
        id: 4,
        team: 2,
        r: -90,
      },
      {
        x: 1291,
        y: 619,
        r0: -90,
        color: "#b2e6ce",
        id: 5,
        team: 2,
        r: -90,
      },
    ],
    [
      {
        x: 465,
        y: 403,
        r0: 90,
        color: "#e6ceb2",
        id: 1,
        team: 1,
        r: 97.30575953331082,
      },
      {
        x: 75,
        y: 367,
        r0: 90,
        color: "#e6ceb2",
        id: 2,
        team: 1,
        r: 90,
      },
      {
        x: 270,
        y: 521,
        r0: 90,
        color: "#e6ceb2",
        id: 3,
        team: 1,
        r: 90,
      },
      {
        x: 191,
        y: 232,
        r0: 90,
        color: "#e6ceb2",
        id: 4,
        team: 1,
        r: 110.80679101271123,
      },
      {
        x: 133,
        y: 641,
        r0: 90,
        color: "#e6ceb2",
        id: 5,
        team: 1,
        r: 63.91440022171858,
      },
      {
        x: 719,
        y: 396,
        r0: -90,
        color: "#b2e6ce",
        id: 1,
        team: 2,
        r: -96.76617482255305,
      },
      {
        x: 981,
        y: 245,
        r0: -90,
        color: "#b2e6ce",
        id: 2,
        team: 2,
        r: -90,
      },
      {
        x: 1003,
        y: 489,
        r0: -90,
        color: "#b2e6ce",
        id: 3,
        team: 2,
        r: -90,
      },
      {
        x: 1277,
        y: 138,
        r0: -90,
        color: "#b2e6ce",
        id: 4,
        team: 2,
        r: -90,
      },
      {
        x: 1291,
        y: 619,
        r0: -90,
        color: "#b2e6ce",
        id: 5,
        team: 2,
        r: -90,
      },
    ],
    [
      {
        x: 742,
        y: 471,
        r0: 90,
        color: "#e6ceb2",
        id: 1,
        team: 1,
        r: 97.30575953331082,
      },
      {
        x: 75,
        y: 367,
        r0: 90,
        color: "#e6ceb2",
        id: 2,
        team: 1,
        r: 90,
      },
      {
        x: 325,
        y: 513,
        r0: 90,
        color: "#e6ceb2",
        id: 3,
        team: 1,
        r: 52.84170321510306,
      },
      {
        x: 245,
        y: 295,
        r0: 90,
        color: "#e6ceb2",
        id: 4,
        team: 1,
        r: 140.82634202955578,
      },
      {
        x: 185,
        y: 450,
        r0: 90,
        color: "#e6ceb2",
        id: 5,
        team: 1,
        r: 51.050235822898784,
      },
      {
        x: 719,
        y: 396,
        r0: -90,
        color: "#b2e6ce",
        id: 1,
        team: 2,
        r: -96.76617482255305,
      },
      {
        x: 742,
        y: 223,
        r0: -90,
        color: "#b2e6ce",
        id: 2,
        team: 2,
        r: -90,
      },
      {
        x: 759,
        y: 570,
        r0: -90,
        color: "#b2e6ce",
        id: 3,
        team: 2,
        r: -90,
      },
      {
        x: 1277,
        y: 138,
        r0: -90,
        color: "#b2e6ce",
        id: 4,
        team: 2,
        r: -90,
      },
      {
        x: 1291,
        y: 619,
        r0: -90,
        color: "#b2e6ce",
        id: 5,
        team: 2,
        r: -90,
      },
    ],
    [
      {
        x: 742,
        y: 471,
        r0: 90,
        color: "#e6ceb2",
        id: 1,
        team: 1,
        r: 97.30575953331082,
      },
      {
        x: 75,
        y: 367,
        r0: 90,
        color: "#e6ceb2",
        id: 2,
        team: 1,
        r: 90,
      },
      {
        x: 325,
        y: 513,
        r0: 90,
        color: "#e6ceb2",
        id: 3,
        team: 1,
        r: 52.84170321510306,
      },
      {
        x: 245,
        y: 295,
        r0: 90,
        color: "#e6ceb2",
        id: 4,
        team: 1,
        r: 140.82634202955578,
      },
      {
        x: 185,
        y: 450,
        r0: 90,
        color: "#e6ceb2",
        id: 5,
        team: 1,
        r: 51.050235822898784,
      },
      {
        x: 553,
        y: 285,
        r0: -90,
        color: "#b2e6ce",
        id: 1,
        team: 2,
        r: -67.84665526222199,
      },
      {
        x: 742,
        y: 223,
        r0: -90,
        color: "#b2e6ce",
        id: 2,
        team: 2,
        r: -90,
      },
      {
        x: 510,
        y: 536,
        r0: -90,
        color: "#b2e6ce",
        id: 3,
        team: 2,
        r: -66.41834885515011,
      },
      {
        x: 723,
        y: 104,
        r0: -90,
        color: "#b2e6ce",
        id: 4,
        team: 2,
        r: -90,
      },
      {
        x: 1044,
        y: 412,
        r0: -90,
        color: "#b2e6ce",
        id: 5,
        team: 2,
        r: -90,
      },
    ],
    [
      {
        x: 742,
        y: 471,
        r0: 90,
        color: "#e6ceb2",
        id: 1,
        team: 1,
        r: 97.30575953331082,
      },
      {
        x: 75,
        y: 367,
        r0: 90,
        color: "#e6ceb2",
        id: 2,
        team: 1,
        r: 90,
      },
      {
        x: 335,
        y: 443,
        r0: 90,
        color: "#e6ceb2",
        id: 3,
        team: 1,
        r: 52.84170321510306,
      },
      {
        x: 245,
        y: 295,
        r0: 90,
        color: "#e6ceb2",
        id: 4,
        team: 1,
        r: 140.82634202955578,
      },
      {
        x: 185,
        y: 450,
        r0: 90,
        color: "#e6ceb2",
        id: 5,
        team: 1,
        r: 51.050235822898784,
      },
      {
        x: 525,
        y: 415,
        r0: -90,
        color: "#b2e6ce",
        id: 1,
        team: 2,
        r: -128.3513548167311,
      },
      {
        x: 552,
        y: 204,
        r0: -90,
        color: "#b2e6ce",
        id: 2,
        team: 2,
        r: -90,
      },
      {
        x: 380,
        y: 601,
        r0: -90,
        color: "#b2e6ce",
        id: 3,
        team: 2,
        r: -57.349197703404435,
      },
      {
        x: 723,
        y: 104,
        r0: -90,
        color: "#b2e6ce",
        id: 4,
        team: 2,
        r: -90,
      },
      {
        x: 1044,
        y: 412,
        r0: -90,
        color: "#b2e6ce",
        id: 5,
        team: 2,
        r: -90,
      },
    ],
    [
      {
        x: 637,
        y: 483,
        r0: 90,
        color: "#e6ceb2",
        id: 1,
        team: 1,
        r: 239.4039905329373,
      },
      {
        x: 75,
        y: 367,
        r0: 90,
        color: "#e6ceb2",
        id: 2,
        team: 1,
        r: 90,
      },
      {
        x: 355,
        y: 363,
        r0: 90,
        color: "#e6ceb2",
        id: 3,
        team: 1,
        r: 52.84170321510306,
      },
      {
        x: 271,
        y: 203,
        r0: 90,
        color: "#e6ceb2",
        id: 4,
        team: 1,
        r: 140.82634202955578,
      },
      {
        x: 288,
        y: 346,
        r0: 90,
        color: "#e6ceb2",
        id: 5,
        team: 1,
        r: 51.050235822898784,
      },
      {
        x: 434,
        y: 501,
        r0: -90,
        color: "#b2e6ce",
        id: 1,
        team: 2,
        r: -62.995909297240345,
      },
      {
        x: 552,
        y: 204,
        r0: -90,
        color: "#b2e6ce",
        id: 2,
        team: 2,
        r: -90,
      },
      {
        x: 273,
        y: 517,
        r0: -90,
        color: "#b2e6ce",
        id: 3,
        team: 2,
        r: -57.349197703404435,
      },
      {
        x: 651,
        y: 302,
        r0: -90,
        color: "#b2e6ce",
        id: 4,
        team: 2,
        r: -90,
      },
      {
        x: 1044,
        y: 412,
        r0: -90,
        color: "#b2e6ce",
        id: 5,
        team: 2,
        r: -90,
      },
    ],
    [
      {
        x: 637,
        y: 483,
        r0: 90,
        color: "#e6ceb2",
        id: 1,
        team: 1,
        r: 239.4039905329373,
      },
      {
        x: 75,
        y: 367,
        r0: 90,
        color: "#e6ceb2",
        id: 2,
        team: 1,
        r: 90,
      },
      {
        x: 394,
        y: 322,
        r0: 90,
        color: "#e6ceb2",
        id: 3,
        team: 1,
        r: 52.84170321510306,
      },
      {
        x: 289,
        y: 128,
        r0: 90,
        color: "#e6ceb2",
        id: 4,
        team: 1,
        r: 140.82634202955578,
      },
      {
        x: 327,
        y: 288,
        r0: 90,
        color: "#e6ceb2",
        id: 5,
        team: 1,
        r: 51.050235822898784,
      },
      {
        x: 386,
        y: 539,
        r0: -90,
        color: "#b2e6ce",
        id: 1,
        team: 2,
        r: -62.995909297240345,
      },
      {
        x: 552,
        y: 204,
        r0: -90,
        color: "#b2e6ce",
        id: 2,
        team: 2,
        r: -90,
      },
      {
        x: 267,
        y: 488,
        r0: -90,
        color: "#b2e6ce",
        id: 3,
        team: 2,
        r: -12.692665545117876,
      },
      {
        x: 651,
        y: 302,
        r0: -90,
        color: "#b2e6ce",
        id: 4,
        team: 2,
        r: -90,
      },
      {
        x: 1044,
        y: 412,
        r0: -90,
        color: "#b2e6ce",
        id: 5,
        team: 2,
        r: -90,
      },
    ],
    [
      {
        x: 637,
        y: 483,
        r0: 90,
        color: "#e6ceb2",
        id: 1,
        team: 1,
        r: 239.4039905329373,
      },
      {
        x: 75,
        y: 367,
        r0: 90,
        color: "#e6ceb2",
        id: 2,
        team: 1,
        r: 90,
      },
      {
        x: 394,
        y: 322,
        r0: 90,
        color: "#e6ceb2",
        id: 3,
        team: 1,
        r: 52.84170321510306,
      },
      {
        x: 289,
        y: 128,
        r0: 90,
        color: "#e6ceb2",
        id: 4,
        team: 1,
        r: 140.82634202955578,
      },
      {
        x: 352,
        y: 238,
        r0: 90,
        color: "#e6ceb2",
        id: 5,
        team: 1,
        r: 51.050235822898784,
      },
      {
        x: 283,
        y: 527,
        r0: -90,
        color: "#b2e6ce",
        id: 1,
        team: 2,
        r: -62.995909297240345,
      },
      {
        x: 552,
        y: 204,
        r0: -90,
        color: "#b2e6ce",
        id: 2,
        team: 2,
        r: -90,
      },
      {
        x: 287,
        y: 403,
        r0: -90,
        color: "#b2e6ce",
        id: 3,
        team: 2,
        r: -1.481457170887083,
      },
      {
        x: 651,
        y: 302,
        r0: -90,
        color: "#b2e6ce",
        id: 4,
        team: 2,
        r: -90,
      },
      {
        x: 1044,
        y: 412,
        r0: -90,
        color: "#b2e6ce",
        id: 5,
        team: 2,
        r: -90,
      },
    ],
    [
      {
        x: 637,
        y: 483,
        r0: 90,
        color: "#e6ceb2",
        id: 1,
        team: 1,
        r: 239.4039905329373,
      },
      {
        x: 75,
        y: 367,
        r0: 90,
        color: "#e6ceb2",
        id: 2,
        team: 1,
        r: 90,
      },
      {
        x: 394,
        y: 322,
        r0: 90,
        color: "#e6ceb2",
        id: 3,
        team: 1,
        r: 52.84170321510306,
      },
      {
        x: 289,
        y: 128,
        r0: 90,
        color: "#e6ceb2",
        id: 4,
        team: 1,
        r: 140.82634202955578,
      },
      {
        x: 352,
        y: 238,
        r0: 90,
        color: "#e6ceb2",
        id: 5,
        team: 1,
        r: 51.050235822898784,
      },
      {
        x: 283,
        y: 527,
        r0: -90,
        color: "#b2e6ce",
        id: 1,
        team: 2,
        r: -62.995909297240345,
      },
      {
        x: 552,
        y: 204,
        r0: -90,
        color: "#b2e6ce",
        id: 2,
        team: 2,
        r: -90,
      },
      {
        x: 287,
        y: 403,
        r0: -90,
        color: "#b2e6ce",
        id: 3,
        team: 2,
        r: -1.481457170887083,
      },
      {
        x: 553,
        y: 365,
        r0: -90,
        color: "#b2e6ce",
        id: 4,
        team: 2,
        r: -90,
      },
      {
        x: 861,
        y: 466,
        r0: -90,
        color: "#b2e6ce",
        id: 5,
        team: 2,
        r: -90,
      },
    ],
  ];
  const demoBallStates = [
    {
      x: 683.0909033203125,
      y: 387.89486328125,
      r0: 0,
    },
    {
      x: 683.0909033203125,
      y: 387.89486328125,
      r0: 0,
    },
    {
      x: 683.0909033203125,
      y: 387.89486328125,
      r0: 0,
    },
    {
      x: 722,
      y: 228,
      r0: 0,
      r: 0,
    },
    {
      x: 698,
      y: 115,
      r0: 0,
      r: 0,
    },
    {
      x: 546,
      y: 204,
      r0: 0,
      r: 0,
    },
    {
      x: 640,
      y: 305,
      r0: 0,
      r: 0,
    },
    {
      x: 403,
      y: 548,
      r0: 0,
      r: 0,
    },
    {
      x: 278,
      y: 541,
      r0: 0,
      r: 0,
    },
    {
      x: 14,
      y: 396,
      r0: 0,
      r: 0,
    },
  ];
  const getDemoStates = () => {
    const svg = d3.select("#whiteboard-svg");
    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;

    const demoStatesCopy = structuredClone(demoStates);
    const scaledStates = demoStatesCopy.map((d) =>
      d.map((v) => {
        v.x = (v.x * width) / demoWidth;
        v.y = (v.y * height) / demoHeight;
        return v;
      })
    );

    return scaledStates;
  };
  const getDemoBallStates = () => {
    const svg = d3.select("#whiteboard-svg");
    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;
    const demoBallStatesCopy = structuredClone(demoBallStates);

    const scaledDemoBallStates = demoBallStatesCopy.map((d) => {
      d.x = (d.x * width) / demoWidth;
      d.y = (d.y * height) / demoHeight;
      return d;
    });
    return scaledDemoBallStates;
  };

  const saveState = (rewrite = false) => {
    const svg = d3.select("#whiteboard-svg");
    const arr = svg.selectAll(".nodes").data();
    const newArr = structuredClone(arr);

    if (!rewrite) {
      if (window.ball) {
        const ballState = structuredClone(svg.selectAll(".ball").data()[0]);
        window.ballStates.push(ballState);
      }
      window.states.push(newArr);
      console.log("state-saved");
      
      setPositionSlider();
    } else {
      if (window.ball) {
        const ballState = structuredClone(svg.selectAll(".ball").data()[0]);
        window.ballStates[window.currentState]=ballState;
      }
      window.states[window.currentState] = newArr;
    }
  };

  function setPositionSlider(n = null) {
    const positionSlider = document.getElementById("position-slider");
    positionSlider.disabled = false;
    positionSlider.max = window.states.length - 1;

    if (!n) {
      positionSlider.value = window.states.length - 1;
      document.getElementById("current-position").innerHTML = window.states.length;
    } else {
      positionSlider.value = n;
      document.getElementById("current-position").innerHTML = n+1;
    }

    
  }
  const speedConversion = {
    "0.25x": 4,
    "0.5x": 2,
    "0.75x": 1.5,
    "1x": 1,
    "2x": 0.5,
    "4x": 0.25,
  };
  const reanimateStates = async (demo = false) => {
    const duration =
      speedConversion[document.getElementById("duration").value] * 1000;
    console.log("here");
    const svg = d3.select("#whiteboard-svg");
    let states = demo ? getDemoStates() : window.states;

    let ballStates = demo ? getDemoBallStates() : window.ballStates;
    for (let i = 0; i < states.length; i++) {
      // console.log(states[i]);

      setPositionSlider(i);
      const newWhiteboard = canoePoloWhiteboard()
        .boatState(states[i])
        .transitionDuration(i === 0 ? 500 : duration);

      svg.call(newWhiteboard);
      if (window.ball) {
        const newBall = Ball()
          .ballState(ballStates[i])
          .transitionDuration(i === 0 ? 500 : duration);
        svg.call(newBall);
      }
      await delay(i === 0 ? 500 : duration);
    }
    console.log(states);
    // console.log(ballStates);
  };
  const delay = (delayInms) => {
    return new Promise((resolve) => setTimeout(resolve, delayInms));
  };

  const animationInstructions = () => {
    alert(
      `How to Animate \n
    An animation is created by saving positions and then moving the boats directly between those positions. 
     Step 1: Save the initial positions with the 'Add Frame' button.
     Step 2: Move the boats to a new position and click 'Add Frame'. Change as many boats as you wish between states.
     Step 3: Repeat for any amount of positions
     Step 4: Click 'Play Animation' and the screen will animate between the frames
     
Want an example? Click to load the demo and then press 'Play Animation'!

After creating the animation, you can return to frames using the slider, and edit the frame you are on with the 'Rewrite frame' 

When you are happy with an animation, try it in 3D with the 'View in 3D' button! (note this is still in production)
`
    );
  };

  const clearAnimation = () => {
    window.states = [];
    window.ballStates = [];
    document.getElementById("position-slider").disabled=true;
    document.getElementById("current-position").innerHTML='0';
  };

  const savePositions = () => {
    const boatStates = window.states;
    const ballStates = window.ballStates;
    const svg = d3.select("#whiteboard-svg");
    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;
    console.log(ballStates);
    const obj = {
      boatStates: boatStates,
      ballStates: ballStates,
      width: width,
      height: height,
    };
    const json = JSON.stringify(obj);
    const positionsBlob = new Blob([json], { type: "application/json" });

    const fileURL = URL.createObjectURL(positionsBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = fileURL;
    downloadLink.download = `animation-positions.json`;
    document.body.appendChild(downloadLink);

    downloadLink.click();
  };
  const loadPositions = async (demo = false, loadSession=false) => {
    console.log(document.getElementById("animation-file-input").value);

    if (demo) {
      const positions = await d3.json("demo.json");
      console.log(positions);
      const scaledPositions = scaleData(positions);
      window.states = scaledPositions.boatStates;
      window.ballStates = scaledPositions.ballStates;
      // document.getElementById("state-count").innerHTML = window.states.length;
      setPositionSlider();
      goToPosition(window.states.length - 1);
      return;
    }

    if (loadSession) { 
      const positions = JSON.parse(sessionStorage.getItem("states"));
      const scaledPositions = scaleData(positions);
      window.states = scaledPositions.boatStates;
      window.ballStates = scaledPositions.ballStates;
      // document.getElementById("state-count").innerHTML = window.states.length;
      setPositionSlider();
      goToPosition(window.states.length - 1);
      return;
    }

    let file = document.getElementById("animation-file-input").files[0];
    if (!file) {
      alert("No file selected");
      return;
    }
    const reader = new FileReader();
    reader.onload = async function (event) {
      console.log(event);
      try {
        const positions = JSON.parse(event.target.result); // Parse file content as JSON

        const scaledPositions = scaleData(positions);
        window.states = scaledPositions.boatStates;
        window.ballStates = scaledPositions.ballStates;
        document.getElementById("state-count").innerHTML = window.states.length;
        console.log(window.states, window.ballStates);
        setPositionSlider();
      } catch (error) {
        alert("Error - failed to read file");
        console.error(error);
      }
    };

    reader.readAsText(file); // Read file as text
  };

  const scaleData = (data) => {
    const svg = d3.select("#whiteboard-svg");
    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;

    const dataWidth = data.width;
    const dataheight = data.height;

    const scaledBallStates = data.ballStates.map((d) => {
      d.x = (d.x * width) / dataWidth;
      d.y = (d.y * height) / dataheight;
      return d;
    });

    const scaledBoatStates = data.boatStates.map((d) =>
      d.map((v) => {
        v.x = (v.x * width) / dataWidth;
        v.y = (v.y * height) / dataheight;
        return v;
      })
    );

    return { boatStates: scaledBoatStates, ballStates: scaledBallStates };
  };

  const open3D = () => {
    const boatStates = window.states;
    const ballStates = window.ballStates;
    const svg = d3.select("#whiteboard-svg");
    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;
    console.log(ballStates);
    const obj = {
      boatStates: boatStates,
      ballStates: ballStates,
      width: width,
      height: height,
    };
    sessionStorage.setItem("states", JSON.stringify(obj));
    console.log(JSON.parse(sessionStorage.getItem("states")));
    const threeDLink = document.createElement("a");
    threeDLink.href = "https://gabriel-ing.github.io/CanoePolo3D/";
    document.body.appendChild(threeDLink);
    threeDLink.click();
  };

  const goToPosition = (n) => {
    console.log(`Going to position ${n}`);
    const boatStates = window.states[n];
    const ballStates = window.ballStates[n];
    const svg = d3.select("#whiteboard-svg");
    svg.call(canoePoloWhiteboard().boatState(boatStates));
    svg.call(Ball().ballState(ballStates));
    document.getElementById("current-position").innerHTML = Number(n)+1;
  };
  // export const getDemoStates = () => {
  //   const svg = d3.select("#whiteboard-svg");
  //   const width = svg.node().getBoundingClientRect().width;
  //   const height = svg.node().getBoundingClientRect().height;

  //   const demoStatesCopy = structuredClone(demoStates);
  //   const scaledStates = demoStatesCopy.map((d) =>
  //     d.map((v) => {
  //       v.x = (v.x * width) / demoWidth;
  //       v.y = (v.y * height) / demoHeight;
  //       return v;
  //     })
  //   );

  //   return scaledStates;
  // };
  // export const getDemoBallStates = () => {
  //   const svg = d3.select("#whiteboard-svg");
  //   const width = svg.node().getBoundingClientRect().width;
  //   const height = svg.node().getBoundingClientRect().height;
  //   const demoBallStatesCopy = structuredClone(demoBallStates);

  //   const scaledDemoBallStates = demoBallStatesCopy.map((d) => {
  //     d.x = (d.x * width) / demoWidth;
  //     d.y = (d.y * height) / demoHeight;
  //     return d;
  //   });
  //   return scaledDemoBallStates;
  // };

  window.open3D = open3D;
  window.ball = true; //document.getElementById("ball-checkbox").checked;
  window.resetState = getInitialBoatStateKickoff;
  // document.getElementById("options-panel").display = "none";
  // document.getElementById("options-panel").visibility = "hidden";
  document.getElementById("ball-checkbox").addEventListener("change", (event) => {
    window.ball = event.target.checked;
    svg.selectAll(".ball").style("display", event.target.checked ? null : "none");
  });

  window.optionsClick = () => {
    document.getElementById("options-panel").display = true;
    document.getElementById("options-panel").visibility = "true";
  };

  window.addEventListener("resize", resetScreen, false);


  document
    .getElementById("animation-file-input")
    .addEventListener("change", (event) => {
      loadPositions(false);
    });

  window.showInfo = () => {
    alert(`Welcome to the Canoe Polo Whiteboard! 
      Its a basic tactics tool for Canoe Polo.

      To start using it, just click on the boats and or ball and drag them around. The black circle at the back of each boat is the 'rotation handle' - click here to rotate the boat.

      Once you get going, try animating it - there is a separate info button on the animation panel!
    
    `);
  };
  //Button functions:
  window.resetScreen = resetScreen;
  window.mobile = checkMobile();
  window.saveChart = saveChart;
  window.savePng = saveChartPng;
  // Animation functions:
  window.currentPosition = 0;
  window.states = [];
  window.ballStates = [];
  window.saveState = saveState;
  window.reanimateStates = reanimateStates;
  window.clearAnimation = clearAnimation;
  window.animationInstructions = animationInstructions;
  window.savePositions = savePositions;
  window.loadPositions = loadPositions;
  // document.getElementById("orange-boats").addEventListener("change", (event) => {
  //   const team = 1;
  //   console.log(event.target.value);

  //   const filtered = d3.selectAll(".nodes").filter((d) => {
  //     console.log(d);
  //     return d.id > event.target.value;
  //   }).remove(); //.remove()
  //   // const filtered= data.filter(d=> d.id<=event.target.value)
  //   console.log(filtered);
  // });

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  if (windowHeight > windowWidth)
    alert(
      `It looks like your screen is in portrait, this app will work better in landscape so I recommend rotating your screen and reloading the page!`
    );

  // alert(`Welcome!
  //   This is an online whiteboard for demonstrating and visualising Canoe Polo tactics.
  //   It works simply enough - the boats and ball can be dragged around the board. At the back of each boat there is a black circle which is a rotation handle - click and drag this to rotate the boat.

  //   Theres also a basic animation function - you can save sets of positions of the boat and balls with "save position"  and then "Play Animation" and it will smoothly move all the components between each position making a simple animation. You can also save or reload animations. If you would like to see an example animation click "load demo" followed by "Play animation"

  //   There are buttons to go full-screen, to save an image and to reset the boats in the top right hand corner.

  //   `);

  document
    .getElementById("position-slider")
    .addEventListener("change", (event) => {
      window.currentPosition = event.target.value;
      console.log(window.currentPosition);
      goToPosition(event.target.value);
    });

  document.getElementById("chart-container").style.width = `${
  window.innerWidth * 0.99
}px`;
  document.getElementById("chart-container").style.height = `${
  window.innerHeight * 0.90
}px`;

  window.displayFullScreen = displayFullScreen;

  const div = select("#chart");
  const svg = div
    .append("svg")
    .attr("id", "whiteboard-svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("width", "100%")
    .attr("height", "100%");

  const width = svg.node().getBoundingClientRect().width;
  const height = svg.node().getBoundingClientRect().height;
  svg
    .append("rect")
    .attr("width", width)
    .attr("id", "background-rect")
    .attr("height", height)
    .attr("fill", "#d9e5f2");

  // console.log(window.resetState(width, height));
  const whiteboard = canoePoloWhiteboard().boatState(
    window.resetState(width, height)
  );

  svg.call(whiteboard);

  if (window.ball) {
    const ball = Ball();
    svg.call(ball);
  }
  document.getElementById("nTeam1").addEventListener("change", (event) => {
    const team = 1;
    const maxId = +event.target.value;
    const adjustedData = selectAll(".nodes")
      .data()
      .map((d) => {
        if (d.id > maxId && d.team === team) {
          d.visible = "none";
        } else if (d.team === team) {
          d.visible = null;
        }
        return d;
      });

    whiteboard.boatState(adjustedData);
    svg.call(whiteboard);
    // const filtered= data.filter(d=> d.id<=event.target.value)
  });
  document.getElementById("nTeam2").addEventListener("change", (event) => {
    const team = 2;
    const maxId = +event.target.value + 5;
    // console.log(maxId);

    const adjustedData = selectAll(".nodes")
      .data()
      .map((d) => {
        if (d.id > maxId && d.team === team) {
          d.visible = "none";
        } else if (d.team === team) {
          d.visible = null;
        }
        return d;
      });
    console.log(adjustedData);

    whiteboard.boatState(adjustedData);
    svg.call(whiteboard);
    // d3.selectAll(".nodes")
    //   .filter((d) => d.id <= maxId && d.team === team)
    //   .style("display", null);
    // const filtered= data.filter(d=> d.id<=event.target.value)
  });

  document.getElementById("reset-state").addEventListener("change", (event) => {
    window.resetState = initialStateDict[event.target.value];
    resetScreen(true);
  });

  if (sessionStorage.getItem("states")) {
    console.log(sessionStorage.getItem("states"));
    loadPositions(false, true);
  }

})();
//# sourceMappingURL=bundle.js.map
