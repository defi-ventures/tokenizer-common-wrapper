'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const CONTENT_REF_ID = 'r';
const ORG_LOCATION_ID = 'o';
const SLOT_NODE_ID = 's';
const TEXT_NODE_ID = 't';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

const attrHandler = {
  get(obj, prop) {
    if (prop in obj) {
      return obj[prop];
    }
    if (!isNaN(prop)) {
      return obj.__items[prop];
    }
    return undefined;
  },
};
const createAttributeProxy = (caseInsensitive) => new Proxy(new MockAttributeMap(caseInsensitive), attrHandler);
class MockAttributeMap {
  constructor(caseInsensitive = false) {
    this.caseInsensitive = caseInsensitive;
    this.__items = [];
  }
  get length() {
    return this.__items.length;
  }
  item(index) {
    return this.__items[index] || null;
  }
  setNamedItem(attr) {
    attr.namespaceURI = null;
    this.setNamedItemNS(attr);
  }
  setNamedItemNS(attr) {
    if (attr != null && attr.value != null) {
      attr.value = String(attr.value);
    }
    const existingAttr = this.__items.find(a => a.name === attr.name && a.namespaceURI === attr.namespaceURI);
    if (existingAttr != null) {
      existingAttr.value = attr.value;
    }
    else {
      this.__items.push(attr);
    }
  }
  getNamedItem(attrName) {
    if (this.caseInsensitive) {
      attrName = attrName.toLowerCase();
    }
    return this.getNamedItemNS(null, attrName);
  }
  getNamedItemNS(namespaceURI, attrName) {
    namespaceURI = getNamespaceURI(namespaceURI);
    return this.__items.find(attr => attr.name === attrName && getNamespaceURI(attr.namespaceURI) === namespaceURI) || null;
  }
  removeNamedItem(attr) {
    this.removeNamedItemNS(attr);
  }
  removeNamedItemNS(attr) {
    for (let i = 0, ii = this.__items.length; i < ii; i++) {
      if (this.__items[i].name === attr.name && this.__items[i].namespaceURI === attr.namespaceURI) {
        this.__items.splice(i, 1);
        break;
      }
    }
  }
}
function getNamespaceURI(namespaceURI) {
  return namespaceURI === XLINK_NS ? null : namespaceURI;
}
function cloneAttributes(srcAttrs, sortByName = false) {
  const dstAttrs = new MockAttributeMap(srcAttrs.caseInsensitive);
  if (srcAttrs != null) {
    const attrLen = srcAttrs.length;
    if (sortByName && attrLen > 1) {
      const sortedAttrs = [];
      for (let i = 0; i < attrLen; i++) {
        const srcAttr = srcAttrs.item(i);
        const dstAttr = new MockAttr(srcAttr.name, srcAttr.value, srcAttr.namespaceURI);
        sortedAttrs.push(dstAttr);
      }
      sortedAttrs.sort(sortAttributes).forEach(attr => {
        dstAttrs.setNamedItemNS(attr);
      });
    }
    else {
      for (let i = 0; i < attrLen; i++) {
        const srcAttr = srcAttrs.item(i);
        const dstAttr = new MockAttr(srcAttr.name, srcAttr.value, srcAttr.namespaceURI);
        dstAttrs.setNamedItemNS(dstAttr);
      }
    }
  }
  return dstAttrs;
}
function sortAttributes(a, b) {
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}
class MockAttr {
  constructor(attrName, attrValue, namespaceURI = null) {
    this._name = attrName;
    this._value = String(attrValue);
    this._namespaceURI = namespaceURI;
  }
  get name() {
    return this._name;
  }
  set name(value) {
    this._name = value;
  }
  get value() {
    return this._value;
  }
  set value(value) {
    this._value = String(value);
  }
  get nodeName() {
    return this._name;
  }
  set nodeName(value) {
    this._name = value;
  }
  get nodeValue() {
    return this._value;
  }
  set nodeValue(value) {
    this._value = String(value);
  }
  get namespaceURI() {
    return this._namespaceURI;
  }
  set namespaceURI(namespaceURI) {
    this._namespaceURI = namespaceURI;
  }
}

class MockCustomElementRegistry {
  constructor(win) {
    this.win = win;
  }
  define(tagName, cstr, options) {
    if (tagName.toLowerCase() !== tagName) {
      throw new Error(`Failed to execute 'define' on 'CustomElementRegistry': "${tagName}" is not a valid custom element name`);
    }
    if (this.__registry == null) {
      this.__registry = new Map();
    }
    this.__registry.set(tagName, { cstr, options });
    if (this.__whenDefined != null) {
      const whenDefinedResolveFns = this.__whenDefined.get(tagName);
      if (whenDefinedResolveFns != null) {
        whenDefinedResolveFns.forEach(whenDefinedResolveFn => {
          whenDefinedResolveFn();
        });
        whenDefinedResolveFns.length = 0;
        this.__whenDefined.delete(tagName);
      }
    }
    const doc = this.win.document;
    if (doc != null) {
      const hosts = doc.querySelectorAll(tagName);
      hosts.forEach(host => {
        if (upgradedElements.has(host) === false) {
          tempDisableCallbacks.add(doc);
          const upgradedCmp = createCustomElement(this, doc, tagName);
          for (let i = 0; i < host.childNodes.length; i++) {
            const childNode = host.childNodes[i];
            childNode.remove();
            upgradedCmp.appendChild(childNode);
          }
          tempDisableCallbacks.delete(doc);
          if (proxyElements.has(host)) {
            proxyElements.set(host, upgradedCmp);
          }
        }
        fireConnectedCallback(host);
      });
    }
  }
  get(tagName) {
    if (this.__registry != null) {
      const def = this.__registry.get(tagName.toLowerCase());
      if (def != null) {
        return def.cstr;
      }
    }
    return undefined;
  }
  upgrade(_rootNode) {
    //
  }
  clear() {
    if (this.__registry != null) {
      this.__registry.clear();
    }
    if (this.__whenDefined != null) {
      this.__whenDefined.clear();
    }
  }
  whenDefined(tagName) {
    tagName = tagName.toLowerCase();
    if (this.__registry != null && this.__registry.has(tagName) === true) {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      if (this.__whenDefined == null) {
        this.__whenDefined = new Map();
      }
      let whenDefinedResolveFns = this.__whenDefined.get(tagName);
      if (whenDefinedResolveFns == null) {
        whenDefinedResolveFns = [];
        this.__whenDefined.set(tagName, whenDefinedResolveFns);
      }
      whenDefinedResolveFns.push(resolve);
    });
  }
}
function createCustomElement(customElements, ownerDocument, tagName) {
  const Cstr = customElements.get(tagName);
  if (Cstr != null) {
    const cmp = new Cstr(ownerDocument);
    cmp.nodeName = tagName.toUpperCase();
    upgradedElements.add(cmp);
    return cmp;
  }
  const host = new Proxy({}, {
    get(obj, prop) {
      const elm = proxyElements.get(host);
      if (elm != null) {
        return elm[prop];
      }
      return obj[prop];
    },
    set(obj, prop, val) {
      const elm = proxyElements.get(host);
      if (elm != null) {
        elm[prop] = val;
      }
      else {
        obj[prop] = val;
      }
      return true;
    },
    has(obj, prop) {
      const elm = proxyElements.get(host);
      if (prop in elm) {
        return true;
      }
      if (prop in obj) {
        return true;
      }
      return false;
    },
  });
  const elm = new MockHTMLElement(ownerDocument, tagName);
  proxyElements.set(host, elm);
  return host;
}
const proxyElements = new WeakMap();
const upgradedElements = new WeakSet();
function connectNode(ownerDocument, node) {
  node.ownerDocument = ownerDocument;
  if (node.nodeType === 1 /* ELEMENT_NODE */) {
    if (ownerDocument != null && node.nodeName.includes('-')) {
      const win = ownerDocument.defaultView;
      if (win != null && typeof node.connectedCallback === 'function' && node.isConnected) {
        fireConnectedCallback(node);
      }
      const shadowRoot = node.shadowRoot;
      if (shadowRoot != null) {
        shadowRoot.childNodes.forEach(childNode => {
          connectNode(ownerDocument, childNode);
        });
      }
    }
    node.childNodes.forEach(childNode => {
      connectNode(ownerDocument, childNode);
    });
  }
  else {
    node.childNodes.forEach(childNode => {
      childNode.ownerDocument = ownerDocument;
    });
  }
}
function fireConnectedCallback(node) {
  if (typeof node.connectedCallback === 'function') {
    if (tempDisableCallbacks.has(node.ownerDocument) === false) {
      try {
        node.connectedCallback();
      }
      catch (e) {
        console.error(e);
      }
    }
  }
}
function disconnectNode(node) {
  if (node.nodeType === 1 /* ELEMENT_NODE */) {
    if (node.nodeName.includes('-') === true && typeof node.disconnectedCallback === 'function') {
      if (tempDisableCallbacks.has(node.ownerDocument) === false) {
        try {
          node.disconnectedCallback();
        }
        catch (e) {
          console.error(e);
        }
      }
    }
    node.childNodes.forEach(disconnectNode);
  }
}
function attributeChanged(node, attrName, oldValue, newValue) {
  attrName = attrName.toLowerCase();
  const observedAttributes = node.constructor.observedAttributes;
  if (Array.isArray(observedAttributes) === true && observedAttributes.some(obs => obs.toLowerCase() === attrName) === true) {
    try {
      node.attributeChangedCallback(attrName, oldValue, newValue);
    }
    catch (e) {
      console.error(e);
    }
  }
}
function checkAttributeChanged(node) {
  return node.nodeName.includes('-') === true && typeof node.attributeChangedCallback === 'function';
}
const tempDisableCallbacks = new Set();

function dataset(elm) {
  const ds = {};
  const attributes = elm.attributes;
  const attrLen = attributes.length;
  for (let i = 0; i < attrLen; i++) {
    const attr = attributes.item(i);
    const nodeName = attr.nodeName;
    if (nodeName.startsWith('data-')) {
      ds[dashToPascalCase(nodeName)] = attr.nodeValue;
    }
  }
  return new Proxy(ds, {
    get(_obj, camelCaseProp) {
      return ds[camelCaseProp];
    },
    set(_obj, camelCaseProp, value) {
      const dataAttr = toDataAttribute(camelCaseProp);
      elm.setAttribute(dataAttr, value);
      return true;
    },
  });
}
function toDataAttribute(str) {
  return ('data-' +
    String(str)
      .replace(/([A-Z0-9])/g, g => ' ' + g[0])
      .trim()
      .replace(/ /g, '-')
      .toLowerCase());
}
function dashToPascalCase(str) {
  str = String(str).substr(5);
  return str
    .split('-')
    .map((segment, index) => {
    if (index === 0) {
      return segment.charAt(0).toLowerCase() + segment.slice(1);
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  })
    .join('');
}

const Sizzle = (function() {

const window = {
  document: {
  createElement() {
    return {};
  },
  nodeType: 9,
  documentElement: {
    nodeType: 1,
    nodeName: 'HTML'
  }
  }
};

const module = { exports: {} };

/*! Sizzle v2.3.5 | (c) JS Foundation and other contributors | js.foundation */
!function(e){var t,n,r,i,o,u,l,a,c,s,d,f,p,h,g,m,y,v,w,b="sizzle"+1*new Date,N=e.document,C=0,x=0,E=ae(),A=ae(),S=ae(),D=ae(),T=function(e,t){return e===t&&(d=!0),0},L={}.hasOwnProperty,q=[],I=q.pop,B=q.push,R=q.push,$=q.slice,k=function(e,t){for(var n=0,r=e.length;n<r;n++)if(e[n]===t)return n;return -1},H="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",M="[\\x20\\t\\r\\n\\f]",P="(?:\\\\[\\da-fA-F]{1,6}"+M+"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",z="\\["+M+"*("+P+")(?:"+M+"*([*^$|!~]?=)"+M+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+P+"))|)"+M+"*\\]",F=":("+P+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+z+")*)|.*)\\)|)",O=new RegExp(M+"+","g"),j=new RegExp("^"+M+"+|((?:^|[^\\\\])(?:\\\\.)*)"+M+"+$","g"),G=new RegExp("^"+M+"*,"+M+"*"),U=new RegExp("^"+M+"*([>+~]|"+M+")"+M+"*"),V=new RegExp(M+"|>"),X=new RegExp(F),J=new RegExp("^"+P+"$"),K={ID:new RegExp("^#("+P+")"),CLASS:new RegExp("^\\.("+P+")"),TAG:new RegExp("^("+P+"|[*])"),ATTR:new RegExp("^"+z),PSEUDO:new RegExp("^"+F),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+M+"*(even|odd|(([+-]|)(\\d*)n|)"+M+"*(?:([+-]|)"+M+"*(\\d+)|))"+M+"*\\)|)","i"),bool:new RegExp("^(?:"+H+")$","i"),needsContext:new RegExp("^"+M+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+M+"*((?:-\\d)?\\d*)"+M+"*\\)|)(?=[^-]|$)","i")},Q=/HTML$/i,W=/^(?:input|select|textarea|button)$/i,Y=/^h\d$/i,Z=/^[^{]+\{\s*\[native \w/,_=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,ee=/[+~]/,te=new RegExp("\\\\[\\da-fA-F]{1,6}"+M+"?|\\\\([^\\r\\n\\f])","g"),ne=function(e,t){var n="0x"+e.slice(1)-65536;return t||(n<0?String.fromCharCode(n+65536):String.fromCharCode(n>>10|55296,1023&n|56320))},re=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,ie=function(e,t){return t?"\0"===e?"\ufffd":e.slice(0,-1)+"\\"+e.charCodeAt(e.length-1).toString(16)+" ":"\\"+e},oe=function(){f();},ue=ve(function(e){return !0===e.disabled&&"fieldset"===e.nodeName.toLowerCase()},{dir:"parentNode",next:"legend"});try{R.apply(q=$.call(N.childNodes),N.childNodes),q[N.childNodes.length].nodeType;}catch(e){R={apply:q.length?function(e,t){B.apply(e,$.call(t));}:function(e,t){var n=e.length,r=0;while(e[n++]=t[r++]);e.length=n-1;}};}function le(e,t,r,i){var o,l,c,s,d,h,y,v=t&&t.ownerDocument,N=t?t.nodeType:9;if(r=r||[],"string"!=typeof e||!e||1!==N&&9!==N&&11!==N)return r;if(!i&&(f(t),t=t||p,g)){if(11!==N&&(d=_.exec(e)))if(o=d[1]){if(9===N){if(!(c=t.getElementById(o)))return r;if(c.id===o)return r.push(c),r}else if(v&&(c=v.getElementById(o))&&w(t,c)&&c.id===o)return r.push(c),r}else {if(d[2])return R.apply(r,t.getElementsByTagName(e)),r;if((o=d[3])&&n.getElementsByClassName&&t.getElementsByClassName)return R.apply(r,t.getElementsByClassName(o)),r}if(n.qsa&&!D[e+" "]&&(!m||!m.test(e))&&(1!==N||"object"!==t.nodeName.toLowerCase())){if(y=e,v=t,1===N&&(V.test(e)||U.test(e))){(v=ee.test(e)&&ge(t.parentNode)||t)===t&&n.scope||((s=t.getAttribute("id"))?s=s.replace(re,ie):t.setAttribute("id",s=b)),l=(h=u(e)).length;while(l--)h[l]=(s?"#"+s:":scope")+" "+ye(h[l]);y=h.join(",");}try{return R.apply(r,v.querySelectorAll(y)),r}catch(t){D(e,!0);}finally{s===b&&t.removeAttribute("id");}}}return a(e.replace(j,"$1"),t,r,i)}function ae(){var e=[];function t(n,i){return e.push(n+" ")>r.cacheLength&&delete t[e.shift()],t[n+" "]=i}return t}function ce(e){return e[b]=!0,e}function se(e){var t=p.createElement("fieldset");try{return !!e(t)}catch(e){return !1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null;}}function de(e,t){var n=e.split("|"),i=n.length;while(i--)r.attrHandle[n[i]]=t;}function fe(e,t){var n=t&&e,r=n&&1===e.nodeType&&1===t.nodeType&&e.sourceIndex-t.sourceIndex;if(r)return r;if(n)while(n=n.nextSibling)if(n===t)return -1;return e?1:-1}function pe(e){return function(t){return "form"in t?t.parentNode&&!1===t.disabled?"label"in t?"label"in t.parentNode?t.parentNode.disabled===e:t.disabled===e:t.isDisabled===e||t.isDisabled!==!e&&ue(t)===e:t.disabled===e:"label"in t&&t.disabled===e}}function he(e){return ce(function(t){return t=+t,ce(function(n,r){var i,o=e([],n.length,t),u=o.length;while(u--)n[i=o[u]]&&(n[i]=!(r[i]=n[i]));})})}function ge(e){return e&&void 0!==e.getElementsByTagName&&e}n=le.support={},o=le.isXML=function(e){var t=e.namespaceURI,n=(e.ownerDocument||e).documentElement;return !Q.test(t||n&&n.nodeName||"HTML")},f=le.setDocument=function(e){var t,i,u=e?e.ownerDocument||e:N;return u!=p&&9===u.nodeType&&u.documentElement?(p=u,h=p.documentElement,g=!o(p),N!=p&&(i=p.defaultView)&&i.top!==i&&(i.addEventListener?i.addEventListener("unload",oe,!1):i.attachEvent&&i.attachEvent("onunload",oe)),n.scope=se(function(e){return h.appendChild(e).appendChild(p.createElement("div")),void 0!==e.querySelectorAll&&!e.querySelectorAll(":scope fieldset div").length}),n.attributes=se(function(e){return e.className="i",!e.getAttribute("className")}),n.getElementsByTagName=se(function(e){return e.appendChild(p.createComment("")),!e.getElementsByTagName("*").length}),n.getElementsByClassName=Z.test(p.getElementsByClassName),n.getById=se(function(e){return h.appendChild(e).id=b,!p.getElementsByName||!p.getElementsByName(b).length}),n.getById?(r.filter.ID=function(e){var t=e.replace(te,ne);return function(e){return e.getAttribute("id")===t}},r.find.ID=function(e,t){if(void 0!==t.getElementById&&g){var n=t.getElementById(e);return n?[n]:[]}}):(r.filter.ID=function(e){var t=e.replace(te,ne);return function(e){var n=void 0!==e.getAttributeNode&&e.getAttributeNode("id");return n&&n.value===t}},r.find.ID=function(e,t){if(void 0!==t.getElementById&&g){var n,r,i,o=t.getElementById(e);if(o){if((n=o.getAttributeNode("id"))&&n.value===e)return [o];i=t.getElementsByName(e),r=0;while(o=i[r++])if((n=o.getAttributeNode("id"))&&n.value===e)return [o]}return []}}),r.find.TAG=n.getElementsByTagName?function(e,t){return void 0!==t.getElementsByTagName?t.getElementsByTagName(e):n.qsa?t.querySelectorAll(e):void 0}:function(e,t){var n,r=[],i=0,o=t.getElementsByTagName(e);if("*"===e){while(n=o[i++])1===n.nodeType&&r.push(n);return r}return o},r.find.CLASS=n.getElementsByClassName&&function(e,t){if(void 0!==t.getElementsByClassName&&g)return t.getElementsByClassName(e)},y=[],m=[],(n.qsa=Z.test(p.querySelectorAll))&&(se(function(e){var t;h.appendChild(e).innerHTML="<a id='"+b+"'></a><select id='"+b+"-\r\\' msallowcapture=''><option selected=''></option></select>",e.querySelectorAll("[msallowcapture^='']").length&&m.push("[*^$]="+M+"*(?:''|\"\")"),e.querySelectorAll("[selected]").length||m.push("\\["+M+"*(?:value|"+H+")"),e.querySelectorAll("[id~="+b+"-]").length||m.push("~="),(t=p.createElement("input")).setAttribute("name",""),e.appendChild(t),e.querySelectorAll("[name='']").length||m.push("\\["+M+"*name"+M+"*="+M+"*(?:''|\"\")"),e.querySelectorAll(":checked").length||m.push(":checked"),e.querySelectorAll("a#"+b+"+*").length||m.push(".#.+[+~]"),e.querySelectorAll("\\\f"),m.push("[\\r\\n\\f]");}),se(function(e){e.innerHTML="<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";var t=p.createElement("input");t.setAttribute("type","hidden"),e.appendChild(t).setAttribute("name","D"),e.querySelectorAll("[name=d]").length&&m.push("name"+M+"*[*^$|!~]?="),2!==e.querySelectorAll(":enabled").length&&m.push(":enabled",":disabled"),h.appendChild(e).disabled=!0,2!==e.querySelectorAll(":disabled").length&&m.push(":enabled",":disabled"),e.querySelectorAll("*,:x"),m.push(",.*:");})),(n.matchesSelector=Z.test(v=h.matches||h.webkitMatchesSelector||h.mozMatchesSelector||h.oMatchesSelector||h.msMatchesSelector))&&se(function(e){n.disconnectedMatch=v.call(e,"*"),v.call(e,"[s!='']:x"),y.push("!=",F);}),m=m.length&&new RegExp(m.join("|")),y=y.length&&new RegExp(y.join("|")),t=Z.test(h.compareDocumentPosition),w=t||Z.test(h.contains)?function(e,t){var n=9===e.nodeType?e.documentElement:e,r=t&&t.parentNode;return e===r||!(!r||1!==r.nodeType||!(n.contains?n.contains(r):e.compareDocumentPosition&&16&e.compareDocumentPosition(r)))}:function(e,t){if(t)while(t=t.parentNode)if(t===e)return !0;return !1},T=t?function(e,t){if(e===t)return d=!0,0;var r=!e.compareDocumentPosition-!t.compareDocumentPosition;return r||(1&(r=(e.ownerDocument||e)==(t.ownerDocument||t)?e.compareDocumentPosition(t):1)||!n.sortDetached&&t.compareDocumentPosition(e)===r?e==p||e.ownerDocument==N&&w(N,e)?-1:t==p||t.ownerDocument==N&&w(N,t)?1:s?k(s,e)-k(s,t):0:4&r?-1:1)}:function(e,t){if(e===t)return d=!0,0;var n,r=0,i=e.parentNode,o=t.parentNode,u=[e],l=[t];if(!i||!o)return e==p?-1:t==p?1:i?-1:o?1:s?k(s,e)-k(s,t):0;if(i===o)return fe(e,t);n=e;while(n=n.parentNode)u.unshift(n);n=t;while(n=n.parentNode)l.unshift(n);while(u[r]===l[r])r++;return r?fe(u[r],l[r]):u[r]==N?-1:l[r]==N?1:0},p):p},le.matches=function(e,t){return le(e,null,null,t)},le.matchesSelector=function(e,t){if(f(e),n.matchesSelector&&g&&!D[t+" "]&&(!y||!y.test(t))&&(!m||!m.test(t)))try{var r=v.call(e,t);if(r||n.disconnectedMatch||e.document&&11!==e.document.nodeType)return r}catch(e){D(t,!0);}return le(t,p,null,[e]).length>0},le.contains=function(e,t){return (e.ownerDocument||e)!=p&&f(e),w(e,t)},le.attr=function(e,t){(e.ownerDocument||e)!=p&&f(e);var i=r.attrHandle[t.toLowerCase()],o=i&&L.call(r.attrHandle,t.toLowerCase())?i(e,t,!g):void 0;return void 0!==o?o:n.attributes||!g?e.getAttribute(t):(o=e.getAttributeNode(t))&&o.specified?o.value:null},le.escape=function(e){return (e+"").replace(re,ie)},le.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)},le.uniqueSort=function(e){var t,r=[],i=0,o=0;if(d=!n.detectDuplicates,s=!n.sortStable&&e.slice(0),e.sort(T),d){while(t=e[o++])t===e[o]&&(i=r.push(o));while(i--)e.splice(r[i],1);}return s=null,e},i=le.getText=function(e){var t,n="",r=0,o=e.nodeType;if(o){if(1===o||9===o||11===o){if("string"==typeof e.textContent)return e.textContent;for(e=e.firstChild;e;e=e.nextSibling)n+=i(e);}else if(3===o||4===o)return e.nodeValue}else while(t=e[r++])n+=i(t);return n},(r=le.selectors={cacheLength:50,createPseudo:ce,match:K,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(te,ne),e[3]=(e[3]||e[4]||e[5]||"").replace(te,ne),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||le.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&le.error(e[0]),e},PSEUDO:function(e){var t,n=!e[6]&&e[2];return K.CHILD.test(e[0])?null:(e[3]?e[2]=e[4]||e[5]||"":n&&X.test(n)&&(t=u(n,!0))&&(t=n.indexOf(")",n.length-t)-n.length)&&(e[0]=e[0].slice(0,t),e[2]=n.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(te,ne).toLowerCase();return "*"===e?function(){return !0}:function(e){return e.nodeName&&e.nodeName.toLowerCase()===t}},CLASS:function(e){var t=E[e+" "];return t||(t=new RegExp("(^|"+M+")"+e+"("+M+"|$)"))&&E(e,function(e){return t.test("string"==typeof e.className&&e.className||void 0!==e.getAttribute&&e.getAttribute("class")||"")})},ATTR:function(e,t,n){return function(r){var i=le.attr(r,e);return null==i?"!="===t:!t||(i+="","="===t?i===n:"!="===t?i!==n:"^="===t?n&&0===i.indexOf(n):"*="===t?n&&i.indexOf(n)>-1:"$="===t?n&&i.slice(-n.length)===n:"~="===t?(" "+i.replace(O," ")+" ").indexOf(n)>-1:"|="===t&&(i===n||i.slice(0,n.length+1)===n+"-"))}},CHILD:function(e,t,n,r,i){var o="nth"!==e.slice(0,3),u="last"!==e.slice(-4),l="of-type"===t;return 1===r&&0===i?function(e){return !!e.parentNode}:function(t,n,a){var c,s,d,f,p,h,g=o!==u?"nextSibling":"previousSibling",m=t.parentNode,y=l&&t.nodeName.toLowerCase(),v=!a&&!l,w=!1;if(m){if(o){while(g){f=t;while(f=f[g])if(l?f.nodeName.toLowerCase()===y:1===f.nodeType)return !1;h=g="only"===e&&!h&&"nextSibling";}return !0}if(h=[u?m.firstChild:m.lastChild],u&&v){w=(p=(c=(s=(d=(f=m)[b]||(f[b]={}))[f.uniqueID]||(d[f.uniqueID]={}))[e]||[])[0]===C&&c[1])&&c[2],f=p&&m.childNodes[p];while(f=++p&&f&&f[g]||(w=p=0)||h.pop())if(1===f.nodeType&&++w&&f===t){s[e]=[C,p,w];break}}else if(v&&(w=p=(c=(s=(d=(f=t)[b]||(f[b]={}))[f.uniqueID]||(d[f.uniqueID]={}))[e]||[])[0]===C&&c[1]),!1===w)while(f=++p&&f&&f[g]||(w=p=0)||h.pop())if((l?f.nodeName.toLowerCase()===y:1===f.nodeType)&&++w&&(v&&((s=(d=f[b]||(f[b]={}))[f.uniqueID]||(d[f.uniqueID]={}))[e]=[C,w]),f===t))break;return (w-=i)===r||w%r==0&&w/r>=0}}},PSEUDO:function(e,t){var n,i=r.pseudos[e]||r.setFilters[e.toLowerCase()]||le.error("unsupported pseudo: "+e);return i[b]?i(t):i.length>1?(n=[e,e,"",t],r.setFilters.hasOwnProperty(e.toLowerCase())?ce(function(e,n){var r,o=i(e,t),u=o.length;while(u--)e[r=k(e,o[u])]=!(n[r]=o[u]);}):function(e){return i(e,0,n)}):i}},pseudos:{not:ce(function(e){var t=[],n=[],r=l(e.replace(j,"$1"));return r[b]?ce(function(e,t,n,i){var o,u=r(e,null,i,[]),l=e.length;while(l--)(o=u[l])&&(e[l]=!(t[l]=o));}):function(e,i,o){return t[0]=e,r(t,null,o,n),t[0]=null,!n.pop()}}),has:ce(function(e){return function(t){return le(e,t).length>0}}),contains:ce(function(e){return e=e.replace(te,ne),function(t){return (t.textContent||i(t)).indexOf(e)>-1}}),lang:ce(function(e){return J.test(e||"")||le.error("unsupported lang: "+e),e=e.replace(te,ne).toLowerCase(),function(t){var n;do{if(n=g?t.lang:t.getAttribute("xml:lang")||t.getAttribute("lang"))return (n=n.toLowerCase())===e||0===n.indexOf(e+"-")}while((t=t.parentNode)&&1===t.nodeType);return !1}}),target:function(t){var n=e.location&&e.location.hash;return n&&n.slice(1)===t.id},root:function(e){return e===h},focus:function(e){return e===p.activeElement&&(!p.hasFocus||p.hasFocus())&&!!(e.type||e.href||~e.tabIndex)},enabled:pe(!1),disabled:pe(!0),checked:function(e){var t=e.nodeName.toLowerCase();return "input"===t&&!!e.checked||"option"===t&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,!0===e.selected},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeType<6)return !1;return !0},parent:function(e){return !r.pseudos.empty(e)},header:function(e){return Y.test(e.nodeName)},input:function(e){return W.test(e.nodeName)},button:function(e){var t=e.nodeName.toLowerCase();return "input"===t&&"button"===e.type||"button"===t},text:function(e){var t;return "input"===e.nodeName.toLowerCase()&&"text"===e.type&&(null==(t=e.getAttribute("type"))||"text"===t.toLowerCase())},first:he(function(){return [0]}),last:he(function(e,t){return [t-1]}),eq:he(function(e,t,n){return [n<0?n+t:n]}),even:he(function(e,t){for(var n=0;n<t;n+=2)e.push(n);return e}),odd:he(function(e,t){for(var n=1;n<t;n+=2)e.push(n);return e}),lt:he(function(e,t,n){for(var r=n<0?n+t:n>t?t:n;--r>=0;)e.push(r);return e}),gt:he(function(e,t,n){for(var r=n<0?n+t:n;++r<t;)e.push(r);return e})}}).pseudos.nth=r.pseudos.eq;for(t in {radio:!0,checkbox:!0,file:!0,password:!0,image:!0})r.pseudos[t]=function(e){return function(t){return "input"===t.nodeName.toLowerCase()&&t.type===e}}(t);for(t in {submit:!0,reset:!0})r.pseudos[t]=function(e){return function(t){var n=t.nodeName.toLowerCase();return ("input"===n||"button"===n)&&t.type===e}}(t);function me(){}me.prototype=r.filters=r.pseudos,r.setFilters=new me,u=le.tokenize=function(e,t){var n,i,o,u,l,a,c,s=A[e+" "];if(s)return t?0:s.slice(0);l=e,a=[],c=r.preFilter;while(l){n&&!(i=G.exec(l))||(i&&(l=l.slice(i[0].length)||l),a.push(o=[])),n=!1,(i=U.exec(l))&&(n=i.shift(),o.push({value:n,type:i[0].replace(j," ")}),l=l.slice(n.length));for(u in r.filter)!(i=K[u].exec(l))||c[u]&&!(i=c[u](i))||(n=i.shift(),o.push({value:n,type:u,matches:i}),l=l.slice(n.length));if(!n)break}return t?l.length:l?le.error(e):A(e,a).slice(0)};function ye(e){for(var t=0,n=e.length,r="";t<n;t++)r+=e[t].value;return r}function ve(e,t,n){var r=t.dir,i=t.next,o=i||r,u=n&&"parentNode"===o,l=x++;return t.first?function(t,n,i){while(t=t[r])if(1===t.nodeType||u)return e(t,n,i);return !1}:function(t,n,a){var c,s,d,f=[C,l];if(a){while(t=t[r])if((1===t.nodeType||u)&&e(t,n,a))return !0}else while(t=t[r])if(1===t.nodeType||u)if(d=t[b]||(t[b]={}),s=d[t.uniqueID]||(d[t.uniqueID]={}),i&&i===t.nodeName.toLowerCase())t=t[r]||t;else {if((c=s[o])&&c[0]===C&&c[1]===l)return f[2]=c[2];if(s[o]=f,f[2]=e(t,n,a))return !0}return !1}}function we(e){return e.length>1?function(t,n,r){var i=e.length;while(i--)if(!e[i](t,n,r))return !1;return !0}:e[0]}function be(e,t,n){for(var r=0,i=t.length;r<i;r++)le(e,t[r],n);return n}function Ne(e,t,n,r,i){for(var o,u=[],l=0,a=e.length,c=null!=t;l<a;l++)(o=e[l])&&(n&&!n(o,r,i)||(u.push(o),c&&t.push(l)));return u}function Ce(e,t,n,r,i,o){return r&&!r[b]&&(r=Ce(r)),i&&!i[b]&&(i=Ce(i,o)),ce(function(o,u,l,a){var c,s,d,f=[],p=[],h=u.length,g=o||be(t||"*",l.nodeType?[l]:l,[]),m=!e||!o&&t?g:Ne(g,f,e,l,a),y=n?i||(o?e:h||r)?[]:u:m;if(n&&n(m,y,l,a),r){c=Ne(y,p),r(c,[],l,a),s=c.length;while(s--)(d=c[s])&&(y[p[s]]=!(m[p[s]]=d));}if(o){if(i||e){if(i){c=[],s=y.length;while(s--)(d=y[s])&&c.push(m[s]=d);i(null,y=[],c,a);}s=y.length;while(s--)(d=y[s])&&(c=i?k(o,d):f[s])>-1&&(o[c]=!(u[c]=d));}}else y=Ne(y===u?y.splice(h,y.length):y),i?i(null,u,y,a):R.apply(u,y);})}function xe(e){for(var t,n,i,o=e.length,u=r.relative[e[0].type],l=u||r.relative[" "],a=u?1:0,s=ve(function(e){return e===t},l,!0),d=ve(function(e){return k(t,e)>-1},l,!0),f=[function(e,n,r){var i=!u&&(r||n!==c)||((t=n).nodeType?s(e,n,r):d(e,n,r));return t=null,i}];a<o;a++)if(n=r.relative[e[a].type])f=[ve(we(f),n)];else {if((n=r.filter[e[a].type].apply(null,e[a].matches))[b]){for(i=++a;i<o;i++)if(r.relative[e[i].type])break;return Ce(a>1&&we(f),a>1&&ye(e.slice(0,a-1).concat({value:" "===e[a-2].type?"*":""})).replace(j,"$1"),n,a<i&&xe(e.slice(a,i)),i<o&&xe(e=e.slice(i)),i<o&&ye(e))}f.push(n);}return we(f)}function Ee(e,t){var n=t.length>0,i=e.length>0,o=function(o,u,l,a,s){var d,h,m,y=0,v="0",w=o&&[],b=[],N=c,x=o||i&&r.find.TAG("*",s),E=C+=null==N?1:Math.random()||.1,A=x.length;for(s&&(c=u==p||u||s);v!==A&&null!=(d=x[v]);v++){if(i&&d){h=0,u||d.ownerDocument==p||(f(d),l=!g);while(m=e[h++])if(m(d,u||p,l)){a.push(d);break}s&&(C=E);}n&&((d=!m&&d)&&y--,o&&w.push(d));}if(y+=v,n&&v!==y){h=0;while(m=t[h++])m(w,b,u,l);if(o){if(y>0)while(v--)w[v]||b[v]||(b[v]=I.call(a));b=Ne(b);}R.apply(a,b),s&&!o&&b.length>0&&y+t.length>1&&le.uniqueSort(a);}return s&&(C=E,c=N),w};return n?ce(o):o}l=le.compile=function(e,t){var n,r=[],i=[],o=S[e+" "];if(!o){t||(t=u(e)),n=t.length;while(n--)(o=xe(t[n]))[b]?r.push(o):i.push(o);(o=S(e,Ee(i,r))).selector=e;}return o},a=le.select=function(e,t,n,i){var o,a,c,s,d,f="function"==typeof e&&e,p=!i&&u(e=f.selector||e);if(n=n||[],1===p.length){if((a=p[0]=p[0].slice(0)).length>2&&"ID"===(c=a[0]).type&&9===t.nodeType&&g&&r.relative[a[1].type]){if(!(t=(r.find.ID(c.matches[0].replace(te,ne),t)||[])[0]))return n;f&&(t=t.parentNode),e=e.slice(a.shift().value.length);}o=K.needsContext.test(e)?0:a.length;while(o--){if(c=a[o],r.relative[s=c.type])break;if((d=r.find[s])&&(i=d(c.matches[0].replace(te,ne),ee.test(a[0].type)&&ge(t.parentNode)||t))){if(a.splice(o,1),!(e=i.length&&ye(a)))return R.apply(n,i),n;break}}}return (f||l(e,p))(i,t,!g,n,!t||ee.test(e)&&ge(t.parentNode)||t),n},n.sortStable=b.split("").sort(T).join("")===b,n.detectDuplicates=!!d,f(),n.sortDetached=se(function(e){return 1&e.compareDocumentPosition(p.createElement("fieldset"))}),se(function(e){return e.innerHTML="<a href='#'></a>","#"===e.firstChild.getAttribute("href")})||de("type|href|height|width",function(e,t,n){if(!n)return e.getAttribute(t,"type"===t.toLowerCase()?1:2)}),n.attributes&&se(function(e){return e.innerHTML="<input/>",e.firstChild.setAttribute("value",""),""===e.firstChild.getAttribute("value")})||de("value",function(e,t,n){if(!n&&"input"===e.nodeName.toLowerCase())return e.defaultValue}),se(function(e){return null==e.getAttribute("disabled")})||de(H,function(e,t,n){var r;if(!n)return !0===e[t]?t.toLowerCase():(r=e.getAttributeNode(t))&&r.specified?r.value:null});var Ae=e.Sizzle;le.noConflict=function(){return e.Sizzle===le&&(e.Sizzle=Ae),le},"function"==typeof define&&define.amd?define(function(){return le}):"undefined"!=typeof module&&module.exports?module.exports=le:e.Sizzle=le;}(window);


return module.exports;
})();

function matches(selector, elm) {
  const r = Sizzle.matches(selector, [elm]);
  return r.length > 0;
}
function selectOne(selector, elm) {
  const r = Sizzle(selector, elm);
  return r[0] || null;
}
function selectAll(selector, elm) {
  return Sizzle(selector, elm);
}

class MockClassList {
  constructor(elm) {
    this.elm = elm;
  }
  add(...classNames) {
    const clsNames = getItems(this.elm);
    let updated = false;
    classNames.forEach(className => {
      className = String(className);
      validateClass(className);
      if (clsNames.includes(className) === false) {
        clsNames.push(className);
        updated = true;
      }
    });
    if (updated) {
      this.elm.setAttributeNS(null, 'class', clsNames.join(' '));
    }
  }
  remove(...classNames) {
    const clsNames = getItems(this.elm);
    let updated = false;
    classNames.forEach(className => {
      className = String(className);
      validateClass(className);
      const index = clsNames.indexOf(className);
      if (index > -1) {
        clsNames.splice(index, 1);
        updated = true;
      }
    });
    if (updated) {
      this.elm.setAttributeNS(null, 'class', clsNames.filter(c => c.length > 0).join(' '));
    }
  }
  contains(className) {
    className = String(className);
    return getItems(this.elm).includes(className);
  }
  toggle(className) {
    className = String(className);
    if (this.contains(className) === true) {
      this.remove(className);
    }
    else {
      this.add(className);
    }
  }
  get length() {
    return getItems(this.elm).length;
  }
  item(index) {
    return getItems(this.elm)[index];
  }
  toString() {
    return getItems(this.elm).join(' ');
  }
}
function validateClass(className) {
  if (className === '') {
    throw new Error('The token provided must not be empty.');
  }
  if (/\s/.test(className)) {
    throw new Error(`The token provided ('${className}') contains HTML space characters, which are not valid in tokens.`);
  }
}
function getItems(elm) {
  const className = elm.getAttribute('class');
  if (typeof className === 'string' && className.length > 0) {
    return className
      .trim()
      .split(' ')
      .filter(c => c.length > 0);
  }
  return [];
}

class MockCSSStyleDeclaration {
  constructor() {
    this._styles = new Map();
  }
  setProperty(prop, value) {
    prop = jsCaseToCssCase(prop);
    if (value == null || value === '') {
      this._styles.delete(prop);
    }
    else {
      this._styles.set(prop, String(value));
    }
  }
  getPropertyValue(prop) {
    prop = jsCaseToCssCase(prop);
    return String(this._styles.get(prop) || '');
  }
  removeProperty(prop) {
    prop = jsCaseToCssCase(prop);
    this._styles.delete(prop);
  }
  get length() {
    return this._styles.size;
  }
  get cssText() {
    const cssText = [];
    this._styles.forEach((value, prop) => {
      cssText.push(`${prop}: ${value};`);
    });
    return cssText.join(' ').trim();
  }
  set cssText(cssText) {
    if (cssText == null || cssText === '') {
      this._styles.clear();
      return;
    }
    cssText.split(';').forEach(rule => {
      rule = rule.trim();
      if (rule.length > 0) {
        const splt = rule.split(':');
        if (splt.length > 1) {
          const prop = splt[0].trim();
          const value = splt[1].trim();
          if (prop !== '' && value !== '') {
            this._styles.set(jsCaseToCssCase(prop), value);
          }
        }
      }
    });
  }
}
function createCSSStyleDeclaration() {
  return new Proxy(new MockCSSStyleDeclaration(), cssProxyHandler);
}
const cssProxyHandler = {
  get(cssStyle, prop) {
    if (prop in cssStyle) {
      return cssStyle[prop];
    }
    prop = cssCaseToJsCase(prop);
    return cssStyle.getPropertyValue(prop);
  },
  set(cssStyle, prop, value) {
    if (prop in cssStyle) {
      cssStyle[prop] = value;
    }
    else {
      cssStyle.setProperty(prop, value);
    }
    return true;
  },
};
function cssCaseToJsCase(str) {
  // font-size to fontSize
  if (str.length > 1 && str.includes('-') === true) {
    str = str
      .toLowerCase()
      .split('-')
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join('');
    str = str.substr(0, 1).toLowerCase() + str.substr(1);
  }
  return str;
}
function jsCaseToCssCase(str) {
  // fontSize to font-size
  if (str.length > 1 && str.includes('-') === false && /[A-Z]/.test(str) === true) {
    str = str
      .replace(/([A-Z])/g, g => ' ' + g[0])
      .trim()
      .replace(/ /g, '-')
      .toLowerCase();
  }
  return str;
}

class MockEvent {
  constructor(type, eventInitDict) {
    this.bubbles = false;
    this.cancelBubble = false;
    this.cancelable = false;
    this.composed = false;
    this.currentTarget = null;
    this.defaultPrevented = false;
    this.srcElement = null;
    this.target = null;
    if (typeof type !== 'string') {
      throw new Error(`Event type required`);
    }
    this.type = type;
    this.timeStamp = Date.now();
    if (eventInitDict != null) {
      Object.assign(this, eventInitDict);
    }
  }
  preventDefault() {
    this.defaultPrevented = true;
  }
  stopPropagation() {
    this.cancelBubble = true;
  }
  stopImmediatePropagation() {
    this.cancelBubble = true;
  }
}
class MockCustomEvent extends MockEvent {
  constructor(type, customEventInitDic) {
    super(type);
    this.detail = null;
    if (customEventInitDic != null) {
      Object.assign(this, customEventInitDic);
    }
  }
}
class MockKeyboardEvent extends MockEvent {
  constructor(type, keyboardEventInitDic) {
    super(type);
    this.code = '';
    this.key = '';
    this.altKey = false;
    this.ctrlKey = false;
    this.metaKey = false;
    this.shiftKey = false;
    this.location = 0;
    this.repeat = false;
    if (keyboardEventInitDic != null) {
      Object.assign(this, keyboardEventInitDic);
    }
  }
}
class MockMouseEvent extends MockEvent {
  constructor(type, mouseEventInitDic) {
    super(type);
    this.screenX = 0;
    this.screenY = 0;
    this.clientX = 0;
    this.clientY = 0;
    this.ctrlKey = false;
    this.shiftKey = false;
    this.altKey = false;
    this.metaKey = false;
    this.button = 0;
    this.buttons = 0;
    this.relatedTarget = null;
    if (mouseEventInitDic != null) {
      Object.assign(this, mouseEventInitDic);
    }
  }
}
class MockEventListener {
  constructor(type, handler) {
    this.type = type;
    this.handler = handler;
  }
}
function addEventListener(elm, type, handler) {
  const target = elm;
  if (target.__listeners == null) {
    target.__listeners = [];
  }
  target.__listeners.push(new MockEventListener(type, handler));
}
function removeEventListener(elm, type, handler) {
  const target = elm;
  if (target != null && Array.isArray(target.__listeners) === true) {
    const elmListener = target.__listeners.find(e => e.type === type && e.handler === handler);
    if (elmListener != null) {
      const index = target.__listeners.indexOf(elmListener);
      target.__listeners.splice(index, 1);
    }
  }
}
function resetEventListeners(target) {
  if (target != null && target.__listeners != null) {
    target.__listeners = null;
  }
}
function triggerEventListener(elm, ev) {
  if (elm == null || ev.cancelBubble === true) {
    return;
  }
  const target = elm;
  ev.currentTarget = elm;
  if (Array.isArray(target.__listeners) === true) {
    const listeners = target.__listeners.filter(e => e.type === ev.type);
    listeners.forEach(listener => {
      try {
        listener.handler.call(target, ev);
      }
      catch (err) {
        console.error(err);
      }
    });
  }
  if (ev.bubbles === false) {
    return;
  }
  if (elm.nodeName === "#document" /* DOCUMENT_NODE */) {
    triggerEventListener(elm.defaultView, ev);
  }
  else {
    triggerEventListener(elm.parentElement, ev);
  }
}
function dispatchEvent(currentTarget, ev) {
  ev.target = currentTarget;
  triggerEventListener(currentTarget, ev);
  return true;
}

function serializeNodeToHtml(elm, opts = {}) {
  const output = {
    currentLineWidth: 0,
    indent: 0,
    isWithinBody: false,
    text: [],
  };
  if (opts.prettyHtml) {
    if (typeof opts.indentSpaces !== 'number') {
      opts.indentSpaces = 2;
    }
    if (typeof opts.newLines !== 'boolean') {
      opts.newLines = true;
    }
    opts.approximateLineWidth = -1;
  }
  else {
    opts.prettyHtml = false;
    if (typeof opts.newLines !== 'boolean') {
      opts.newLines = false;
    }
    if (typeof opts.indentSpaces !== 'number') {
      opts.indentSpaces = 0;
    }
  }
  if (typeof opts.approximateLineWidth !== 'number') {
    opts.approximateLineWidth = -1;
  }
  if (typeof opts.removeEmptyAttributes !== 'boolean') {
    opts.removeEmptyAttributes = true;
  }
  if (typeof opts.removeAttributeQuotes !== 'boolean') {
    opts.removeAttributeQuotes = false;
  }
  if (typeof opts.removeBooleanAttributeQuotes !== 'boolean') {
    opts.removeBooleanAttributeQuotes = false;
  }
  if (typeof opts.removeHtmlComments !== 'boolean') {
    opts.removeHtmlComments = false;
  }
  if (typeof opts.serializeShadowRoot !== 'boolean') {
    opts.serializeShadowRoot = false;
  }
  if (opts.outerHtml) {
    serializeToHtml(elm, opts, output, false);
  }
  else {
    for (let i = 0, ii = elm.childNodes.length; i < ii; i++) {
      serializeToHtml(elm.childNodes[i], opts, output, false);
    }
  }
  if (output.text[0] === '\n') {
    output.text.shift();
  }
  if (output.text[output.text.length - 1] === '\n') {
    output.text.pop();
  }
  return output.text.join('');
}
function serializeToHtml(node, opts, output, isShadowRoot) {
  if (node.nodeType === 1 /* ELEMENT_NODE */ || isShadowRoot) {
    const tagName = isShadowRoot ? 'mock:shadow-root' : getTagName(node);
    if (tagName === 'body') {
      output.isWithinBody = true;
    }
    const ignoreTag = opts.excludeTags != null && opts.excludeTags.includes(tagName);
    if (ignoreTag === false) {
      if (opts.newLines) {
        output.text.push('\n');
        output.currentLineWidth = 0;
      }
      if (opts.indentSpaces > 0) {
        for (let i = 0; i < output.indent; i++) {
          output.text.push(' ');
        }
        output.currentLineWidth += output.indent;
      }
      output.text.push('<' + tagName);
      output.currentLineWidth += tagName.length + 1;
      const attrsLength = node.attributes.length;
      const attributes = opts.prettyHtml && attrsLength > 1 ? cloneAttributes(node.attributes, true) : node.attributes;
      for (let i = 0; i < attrsLength; i++) {
        const attr = attributes.item(i);
        const attrName = attr.name;
        if (attrName === 'style') {
          continue;
        }
        let attrValue = attr.value;
        if (opts.removeEmptyAttributes && attrValue === '' && REMOVE_EMPTY_ATTR.has(attrName)) {
          continue;
        }
        const attrNamespaceURI = attr.namespaceURI;
        if (attrNamespaceURI == null) {
          output.currentLineWidth += attrName.length + 1;
          if (opts.approximateLineWidth > 0 && output.currentLineWidth > opts.approximateLineWidth) {
            output.text.push('\n' + attrName);
            output.currentLineWidth = 0;
          }
          else {
            output.text.push(' ' + attrName);
          }
        }
        else if (attrNamespaceURI === 'http://www.w3.org/XML/1998/namespace') {
          output.text.push(' xml:' + attrName);
          output.currentLineWidth += attrName.length + 5;
        }
        else if (attrNamespaceURI === 'http://www.w3.org/2000/xmlns/') {
          if (attrName !== 'xmlns') {
            output.text.push(' xmlns:' + attrName);
            output.currentLineWidth += attrName.length + 7;
          }
          else {
            output.text.push(' ' + attrName);
            output.currentLineWidth += attrName.length + 1;
          }
        }
        else if (attrNamespaceURI === XLINK_NS) {
          output.text.push(' xlink:' + attrName);
          output.currentLineWidth += attrName.length + 7;
        }
        else {
          output.text.push(' ' + attrNamespaceURI + ':' + attrName);
          output.currentLineWidth += attrNamespaceURI.length + attrName.length + 2;
        }
        if (opts.prettyHtml && attrName === 'class') {
          attrValue = attr.value = attrValue
            .split(' ')
            .filter(t => t !== '')
            .sort()
            .join(' ')
            .trim();
        }
        if (attrValue === '') {
          if (opts.removeBooleanAttributeQuotes && BOOLEAN_ATTR.has(attrName)) {
            continue;
          }
          if (opts.removeEmptyAttributes && attrName.startsWith('data-')) {
            continue;
          }
        }
        if (opts.removeAttributeQuotes && CAN_REMOVE_ATTR_QUOTES.test(attrValue)) {
          output.text.push('=' + escapeString(attrValue, true));
          output.currentLineWidth += attrValue.length + 1;
        }
        else {
          output.text.push('="' + escapeString(attrValue, true) + '"');
          output.currentLineWidth += attrValue.length + 3;
        }
      }
      if (node.hasAttribute('style')) {
        const cssText = node.style.cssText;
        if (opts.approximateLineWidth > 0 && output.currentLineWidth + cssText.length + 10 > opts.approximateLineWidth) {
          output.text.push(`\nstyle="${cssText}">`);
          output.currentLineWidth = 0;
        }
        else {
          output.text.push(` style="${cssText}">`);
          output.currentLineWidth += cssText.length + 10;
        }
      }
      else {
        output.text.push('>');
        output.currentLineWidth += 1;
      }
    }
    if (EMPTY_ELEMENTS.has(tagName) === false) {
      if (opts.serializeShadowRoot && node.shadowRoot != null) {
        output.indent = output.indent + opts.indentSpaces;
        serializeToHtml(node.shadowRoot, opts, output, true);
        output.indent = output.indent - opts.indentSpaces;
        if (opts.newLines &&
          (node.childNodes.length === 0 || (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3 /* TEXT_NODE */ && node.childNodes[0].nodeValue.trim() === ''))) {
          output.text.push('\n');
          output.currentLineWidth = 0;
          for (let i = 0; i < output.indent; i++) {
            output.text.push(' ');
          }
          output.currentLineWidth += output.indent;
        }
      }
      if (opts.excludeTagContent == null || opts.excludeTagContent.includes(tagName) === false) {
        const childNodes = tagName === 'template' ? node.content.childNodes : node.childNodes;
        const childNodeLength = childNodes.length;
        if (childNodeLength > 0) {
          if (childNodeLength === 1 && childNodes[0].nodeType === 3 /* TEXT_NODE */ && (typeof childNodes[0].nodeValue !== 'string' || childNodes[0].nodeValue.trim() === '')) ;
          else {
            if (opts.indentSpaces > 0 && ignoreTag === false) {
              output.indent = output.indent + opts.indentSpaces;
            }
            for (let i = 0; i < childNodeLength; i++) {
              serializeToHtml(childNodes[i], opts, output, false);
            }
            if (ignoreTag === false) {
              if (opts.newLines) {
                output.text.push('\n');
                output.currentLineWidth = 0;
              }
              if (opts.indentSpaces > 0) {
                output.indent = output.indent - opts.indentSpaces;
                for (let i = 0; i < output.indent; i++) {
                  output.text.push(' ');
                }
                output.currentLineWidth += output.indent;
              }
            }
          }
        }
        if (ignoreTag === false) {
          output.text.push('</' + tagName + '>');
          output.currentLineWidth += tagName.length + 3;
        }
      }
    }
    if (opts.approximateLineWidth > 0 && STRUCTURE_ELEMENTS.has(tagName)) {
      output.text.push('\n');
      output.currentLineWidth = 0;
    }
    if (tagName === 'body') {
      output.isWithinBody = false;
    }
  }
  else if (node.nodeType === 3 /* TEXT_NODE */) {
    let textContent = node.nodeValue;
    if (typeof textContent === 'string') {
      const trimmedTextContent = textContent.trim();
      if (trimmedTextContent === '') {
        // this text node is whitespace only
        if (isWithinWhitespaceSensitive(node)) {
          // whitespace matters within this element
          // just add the exact text we were given
          output.text.push(textContent);
          output.currentLineWidth += textContent.length;
        }
        else if (opts.approximateLineWidth > 0 && !output.isWithinBody) ;
        else if (!opts.prettyHtml) {
          // this text node is only whitespace, and it's not
          // within a whitespace sensitive element like <pre> or <code>
          // so replace the entire white space with a single new line
          output.currentLineWidth += 1;
          if (opts.approximateLineWidth > 0 && output.currentLineWidth > opts.approximateLineWidth) {
            // good enough for a new line
            // for perf these are all just estimates
            // we don't care to ensure exact line lengths
            output.text.push('\n');
            output.currentLineWidth = 0;
          }
          else {
            // let's keep it all on the same line yet
            output.text.push(' ');
          }
        }
      }
      else {
        // this text node has text content
        if (opts.newLines) {
          output.text.push('\n');
          output.currentLineWidth = 0;
        }
        if (opts.indentSpaces > 0) {
          for (let i = 0; i < output.indent; i++) {
            output.text.push(' ');
          }
          output.currentLineWidth += output.indent;
        }
        let textContentLength = textContent.length;
        if (textContentLength > 0) {
          // this text node has text content
          const parentTagName = node.parentNode != null && node.parentNode.nodeType === 1 /* ELEMENT_NODE */ ? node.parentNode.nodeName : null;
          if (NON_ESCAPABLE_CONTENT.has(parentTagName)) {
            // this text node cannot have its content escaped since it's going
            // into an element like <style> or <script>
            if (isWithinWhitespaceSensitive(node)) {
              output.text.push(textContent);
            }
            else {
              output.text.push(trimmedTextContent);
              textContentLength = trimmedTextContent.length;
            }
            output.currentLineWidth += textContentLength;
          }
          else {
            // this text node is going into a normal element and html can be escaped
            if (opts.prettyHtml) {
              // pretty print the text node
              output.text.push(escapeString(textContent.replace(/\s\s+/g, ' ').trim(), false));
              output.currentLineWidth += textContentLength;
            }
            else {
              // not pretty printing the text node
              if (isWithinWhitespaceSensitive(node)) {
                output.currentLineWidth += textContentLength;
              }
              else {
                // this element is not a whitespace sensitive one, like <pre> or <code> so
                // any whitespace at the start and end can be cleaned up to just be one space
                if (/\s/.test(textContent.charAt(0))) {
                  textContent = ' ' + textContent.trimLeft();
                }
                textContentLength = textContent.length;
                if (textContentLength > 1) {
                  if (/\s/.test(textContent.charAt(textContentLength - 1))) {
                    if (opts.approximateLineWidth > 0 && output.currentLineWidth + textContentLength > opts.approximateLineWidth) {
                      textContent = textContent.trimRight() + '\n';
                      output.currentLineWidth = 0;
                    }
                    else {
                      textContent = textContent.trimRight() + ' ';
                    }
                  }
                }
                output.currentLineWidth += textContentLength;
              }
              output.text.push(escapeString(textContent, false));
            }
          }
        }
      }
    }
  }
  else if (node.nodeType === 8 /* COMMENT_NODE */) {
    const nodeValue = node.nodeValue;
    if (opts.removeHtmlComments) {
      const isHydrateAnnotation = nodeValue.startsWith(CONTENT_REF_ID + '.') ||
        nodeValue.startsWith(ORG_LOCATION_ID + '.') ||
        nodeValue.startsWith(SLOT_NODE_ID + '.') ||
        nodeValue.startsWith(TEXT_NODE_ID + '.');
      if (!isHydrateAnnotation) {
        return;
      }
    }
    if (opts.newLines) {
      output.text.push('\n');
      output.currentLineWidth = 0;
    }
    if (opts.indentSpaces > 0) {
      for (let i = 0; i < output.indent; i++) {
        output.text.push(' ');
      }
      output.currentLineWidth += output.indent;
    }
    output.text.push('<!--' + nodeValue + '-->');
    output.currentLineWidth += nodeValue.length + 7;
  }
  else if (node.nodeType === 10 /* DOCUMENT_TYPE_NODE */) {
    output.text.push('<!doctype html>');
  }
}
const AMP_REGEX = /&/g;
const NBSP_REGEX = /\u00a0/g;
const DOUBLE_QUOTE_REGEX = /"/g;
const LT_REGEX = /</g;
const GT_REGEX = />/g;
const CAN_REMOVE_ATTR_QUOTES = /^[^ \t\n\f\r"'`=<>\/\\-]+$/;
function getTagName(element) {
  if (element.namespaceURI === 'http://www.w3.org/1999/xhtml') {
    return element.nodeName.toLowerCase();
  }
  else {
    return element.nodeName;
  }
}
function escapeString(str, attrMode) {
  str = str.replace(AMP_REGEX, '&amp;').replace(NBSP_REGEX, '&nbsp;');
  if (attrMode) {
    return str.replace(DOUBLE_QUOTE_REGEX, '&quot;');
  }
  return str.replace(LT_REGEX, '&lt;').replace(GT_REGEX, '&gt;');
}
function isWithinWhitespaceSensitive(node) {
  while (node != null) {
    if (WHITESPACE_SENSITIVE.has(node.nodeName)) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}
/*@__PURE__*/ const NON_ESCAPABLE_CONTENT = new Set(['STYLE', 'SCRIPT', 'IFRAME', 'NOSCRIPT', 'XMP', 'NOEMBED', 'NOFRAMES', 'PLAINTEXT']);
/*@__PURE__*/ const WHITESPACE_SENSITIVE = new Set(['CODE', 'OUTPUT', 'PLAINTEXT', 'PRE', 'TEMPLATE', 'TEXTAREA']);
/*@__PURE__*/ const EMPTY_ELEMENTS = new Set([
  'area',
  'base',
  'basefont',
  'bgsound',
  'br',
  'col',
  'embed',
  'frame',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'trace',
  'wbr',
]);
/*@__PURE__*/ const REMOVE_EMPTY_ATTR = new Set(['class', 'dir', 'id', 'lang', 'name', 'title']);
/*@__PURE__*/ const BOOLEAN_ATTR = new Set([
  'allowfullscreen',
  'async',
  'autofocus',
  'autoplay',
  'checked',
  'compact',
  'controls',
  'declare',
  'default',
  'defaultchecked',
  'defaultmuted',
  'defaultselected',
  'defer',
  'disabled',
  'enabled',
  'formnovalidate',
  'hidden',
  'indeterminate',
  'inert',
  'ismap',
  'itemscope',
  'loop',
  'multiple',
  'muted',
  'nohref',
  'nomodule',
  'noresize',
  'noshade',
  'novalidate',
  'nowrap',
  'open',
  'pauseonexit',
  'readonly',
  'required',
  'reversed',
  'scoped',
  'seamless',
  'selected',
  'sortable',
  'truespeed',
  'typemustmatch',
  'visible',
]);
/*@__PURE__*/ const STRUCTURE_ELEMENTS = new Set(['html', 'body', 'head', 'iframe', 'meta', 'link', 'base', 'title', 'script', 'style']);

const PARSE5=function(e){const t=[65534,65535,131070,131071,196606,196607,262142,262143,327678,327679,393214,393215,458750,458751,524286,524287,589822,589823,655358,655359,720894,720895,786430,786431,851966,851967,917502,917503,983038,983039,1048574,1048575,1114110,1114111];var n="�",s={EOF:-1,NULL:0,TABULATION:9,CARRIAGE_RETURN:13,LINE_FEED:10,FORM_FEED:12,SPACE:32,EXCLAMATION_MARK:33,QUOTATION_MARK:34,NUMBER_SIGN:35,AMPERSAND:38,APOSTROPHE:39,HYPHEN_MINUS:45,SOLIDUS:47,DIGIT_0:48,DIGIT_9:57,SEMICOLON:59,LESS_THAN_SIGN:60,EQUALS_SIGN:61,GREATER_THAN_SIGN:62,QUESTION_MARK:63,LATIN_CAPITAL_A:65,LATIN_CAPITAL_F:70,LATIN_CAPITAL_X:88,LATIN_CAPITAL_Z:90,RIGHT_SQUARE_BRACKET:93,GRAVE_ACCENT:96,LATIN_SMALL_A:97,LATIN_SMALL_F:102,LATIN_SMALL_X:120,LATIN_SMALL_Z:122,REPLACEMENT_CHARACTER:65533},r={DASH_DASH_STRING:[45,45],DOCTYPE_STRING:[68,79,67,84,89,80,69],CDATA_START_STRING:[91,67,68,65,84,65,91],SCRIPT_STRING:[115,99,114,105,112,116],PUBLIC_STRING:[80,85,66,76,73,67],SYSTEM_STRING:[83,89,83,84,69,77]},i=function(e){return e>=55296&&e<=57343},T=function(e){return e>=56320&&e<=57343},o=function(e,t){return 1024*(e-55296)+9216+t},E=function(e){return 32!==e&&10!==e&&13!==e&&9!==e&&12!==e&&e>=1&&e<=31||e>=127&&e<=159},a=function(e){return e>=64976&&e<=65007||t.indexOf(e)>-1},_="control-character-in-input-stream",A="noncharacter-in-input-stream",h="surrogate-in-input-stream",c="non-void-html-element-start-tag-with-trailing-solidus",l="end-tag-with-attributes",m="end-tag-with-trailing-solidus",p="unexpected-solidus-in-tag",N="unexpected-null-character",u="unexpected-question-mark-instead-of-tag-name",O="invalid-first-character-of-tag-name",S="unexpected-equals-sign-before-attribute-name",C="missing-end-tag-name",d="unexpected-character-in-attribute-name",R="unknown-named-character-reference",I="missing-semicolon-after-character-reference",f="unexpected-character-after-doctype-system-identifier",M="unexpected-character-in-unquoted-attribute-value",L="eof-before-tag-name",D="eof-in-tag",g="missing-attribute-value",P="missing-whitespace-between-attributes",k="missing-whitespace-after-doctype-public-keyword",H="missing-whitespace-between-doctype-public-and-system-identifiers",U="missing-whitespace-after-doctype-system-keyword",F="missing-quote-before-doctype-public-identifier",B="missing-quote-before-doctype-system-identifier",G="missing-doctype-public-identifier",K="missing-doctype-system-identifier",b="abrupt-doctype-public-identifier",Y="abrupt-doctype-system-identifier",x="cdata-in-html-content",y="incorrectly-opened-comment",v="eof-in-script-html-comment-like-text",w="eof-in-doctype",Q="nested-comment",X="abrupt-closing-of-empty-comment",W="eof-in-comment",V="incorrectly-closed-comment",j="eof-in-cdata",z="absence-of-digits-in-numeric-character-reference",q="null-character-reference",J="surrogate-character-reference",Z="character-reference-outside-unicode-range",$="control-character-reference",ee="noncharacter-character-reference",te="missing-whitespace-before-doctype-name",ne="missing-doctype-name",se="invalid-character-sequence-after-doctype-name",re="duplicate-attribute",ie="non-conforming-doctype",Te="missing-doctype",oe="misplaced-doctype",Ee="end-tag-without-matching-open-element",ae="closing-of-element-with-open-child-elements",_e="disallowed-content-in-noscript-in-head",Ae="open-elements-left-after-eof",he="abandoned-head-element-child",ce="misplaced-start-tag-for-head-element",le="nested-noscript-in-head",me="eof-in-element-that-can-contain-only-text";const pe=s;var Ne=class{constructor(){this.html=null,this.pos=-1,this.lastGapPos=-1,this.lastCharPos=-1,this.gapStack=[],this.skipNextNewLine=!1,this.lastChunkWritten=!1,this.endOfChunkHit=!1,this.bufferWaterline=65536;}_err(){}_addGap(){this.gapStack.push(this.lastGapPos),this.lastGapPos=this.pos;}_processSurrogate(e){if(this.pos!==this.lastCharPos){const t=this.html.charCodeAt(this.pos+1);if(T(t))return this.pos++,this._addGap(),o(e,t)}else if(!this.lastChunkWritten)return this.endOfChunkHit=!0,pe.EOF;return this._err(h),e}dropParsedChunk(){this.pos>this.bufferWaterline&&(this.lastCharPos-=this.pos,this.html=this.html.substring(this.pos),this.pos=0,this.lastGapPos=-1,this.gapStack=[]);}write(e,t){this.html?this.html+=e:this.html=e,this.lastCharPos=this.html.length-1,this.endOfChunkHit=!1,this.lastChunkWritten=t;}insertHtmlAtCurrentPos(e){this.html=this.html.substring(0,this.pos+1)+e+this.html.substring(this.pos+1,this.html.length),this.lastCharPos=this.html.length-1,this.endOfChunkHit=!1;}advance(){if(this.pos++,this.pos>this.lastCharPos)return this.endOfChunkHit=!this.lastChunkWritten,pe.EOF;let e=this.html.charCodeAt(this.pos);if(this.skipNextNewLine&&e===pe.LINE_FEED)return this.skipNextNewLine=!1,this._addGap(),this.advance();if(e===pe.CARRIAGE_RETURN)return this.skipNextNewLine=!0,pe.LINE_FEED;this.skipNextNewLine=!1,i(e)&&(e=this._processSurrogate(e));return e>31&&e<127||e===pe.LINE_FEED||e===pe.CARRIAGE_RETURN||e>159&&e<64976||this._checkForProblematicCharacters(e),e}_checkForProblematicCharacters(e){E(e)?this._err(_):a(e)&&this._err(A);}retreat(){this.pos===this.lastGapPos&&(this.lastGapPos=this.gapStack.pop(),this.pos--),this.pos--;}},ue=new Uint16Array([4,52,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,106,303,412,810,1432,1701,1796,1987,2114,2360,2420,2484,3170,3251,4140,4393,4575,4610,5106,5512,5728,6117,6274,6315,6345,6427,6516,7002,7910,8733,9323,9870,10170,10631,10893,11318,11386,11467,12773,13092,14474,14922,15448,15542,16419,17666,18166,18611,19004,19095,19298,19397,4,16,69,77,97,98,99,102,103,108,109,110,111,112,114,115,116,117,140,150,158,169,176,194,199,210,216,222,226,242,256,266,283,294,108,105,103,5,198,1,59,148,1,198,80,5,38,1,59,156,1,38,99,117,116,101,5,193,1,59,167,1,193,114,101,118,101,59,1,258,4,2,105,121,182,191,114,99,5,194,1,59,189,1,194,59,1,1040,114,59,3,55349,56580,114,97,118,101,5,192,1,59,208,1,192,112,104,97,59,1,913,97,99,114,59,1,256,100,59,1,10835,4,2,103,112,232,237,111,110,59,1,260,102,59,3,55349,56632,112,108,121,70,117,110,99,116,105,111,110,59,1,8289,105,110,103,5,197,1,59,264,1,197,4,2,99,115,272,277,114,59,3,55349,56476,105,103,110,59,1,8788,105,108,100,101,5,195,1,59,292,1,195,109,108,5,196,1,59,301,1,196,4,8,97,99,101,102,111,114,115,117,321,350,354,383,388,394,400,405,4,2,99,114,327,336,107,115,108,97,115,104,59,1,8726,4,2,118,119,342,345,59,1,10983,101,100,59,1,8966,121,59,1,1041,4,3,99,114,116,362,369,379,97,117,115,101,59,1,8757,110,111,117,108,108,105,115,59,1,8492,97,59,1,914,114,59,3,55349,56581,112,102,59,3,55349,56633,101,118,101,59,1,728,99,114,59,1,8492,109,112,101,113,59,1,8782,4,14,72,79,97,99,100,101,102,104,105,108,111,114,115,117,442,447,456,504,542,547,569,573,577,616,678,784,790,796,99,121,59,1,1063,80,89,5,169,1,59,454,1,169,4,3,99,112,121,464,470,497,117,116,101,59,1,262,4,2,59,105,476,478,1,8914,116,97,108,68,105,102,102,101,114,101,110,116,105,97,108,68,59,1,8517,108,101,121,115,59,1,8493,4,4,97,101,105,111,514,520,530,535,114,111,110,59,1,268,100,105,108,5,199,1,59,528,1,199,114,99,59,1,264,110,105,110,116,59,1,8752,111,116,59,1,266,4,2,100,110,553,560,105,108,108,97,59,1,184,116,101,114,68,111,116,59,1,183,114,59,1,8493,105,59,1,935,114,99,108,101,4,4,68,77,80,84,591,596,603,609,111,116,59,1,8857,105,110,117,115,59,1,8854,108,117,115,59,1,8853,105,109,101,115,59,1,8855,111,4,2,99,115,623,646,107,119,105,115,101,67,111,110,116,111,117,114,73,110,116,101,103,114,97,108,59,1,8754,101,67,117,114,108,121,4,2,68,81,658,671,111,117,98,108,101,81,117,111,116,101,59,1,8221,117,111,116,101,59,1,8217,4,4,108,110,112,117,688,701,736,753,111,110,4,2,59,101,696,698,1,8759,59,1,10868,4,3,103,105,116,709,717,722,114,117,101,110,116,59,1,8801,110,116,59,1,8751,111,117,114,73,110,116,101,103,114,97,108,59,1,8750,4,2,102,114,742,745,59,1,8450,111,100,117,99,116,59,1,8720,110,116,101,114,67,108,111,99,107,119,105,115,101,67,111,110,116,111,117,114,73,110,116,101,103,114,97,108,59,1,8755,111,115,115,59,1,10799,99,114,59,3,55349,56478,112,4,2,59,67,803,805,1,8915,97,112,59,1,8781,4,11,68,74,83,90,97,99,101,102,105,111,115,834,850,855,860,865,888,903,916,921,1011,1415,4,2,59,111,840,842,1,8517,116,114,97,104,100,59,1,10513,99,121,59,1,1026,99,121,59,1,1029,99,121,59,1,1039,4,3,103,114,115,873,879,883,103,101,114,59,1,8225,114,59,1,8609,104,118,59,1,10980,4,2,97,121,894,900,114,111,110,59,1,270,59,1,1044,108,4,2,59,116,910,912,1,8711,97,59,1,916,114,59,3,55349,56583,4,2,97,102,927,998,4,2,99,109,933,992,114,105,116,105,99,97,108,4,4,65,68,71,84,950,957,978,985,99,117,116,101,59,1,180,111,4,2,116,117,964,967,59,1,729,98,108,101,65,99,117,116,101,59,1,733,114,97,118,101,59,1,96,105,108,100,101,59,1,732,111,110,100,59,1,8900,102,101,114,101,110,116,105,97,108,68,59,1,8518,4,4,112,116,117,119,1021,1026,1048,1249,102,59,3,55349,56635,4,3,59,68,69,1034,1036,1041,1,168,111,116,59,1,8412,113,117,97,108,59,1,8784,98,108,101,4,6,67,68,76,82,85,86,1065,1082,1101,1189,1211,1236,111,110,116,111,117,114,73,110,116,101,103,114,97,108,59,1,8751,111,4,2,116,119,1089,1092,59,1,168,110,65,114,114,111,119,59,1,8659,4,2,101,111,1107,1141,102,116,4,3,65,82,84,1117,1124,1136,114,114,111,119,59,1,8656,105,103,104,116,65,114,114,111,119,59,1,8660,101,101,59,1,10980,110,103,4,2,76,82,1149,1177,101,102,116,4,2,65,82,1158,1165,114,114,111,119,59,1,10232,105,103,104,116,65,114,114,111,119,59,1,10234,105,103,104,116,65,114,114,111,119,59,1,10233,105,103,104,116,4,2,65,84,1199,1206,114,114,111,119,59,1,8658,101,101,59,1,8872,112,4,2,65,68,1218,1225,114,114,111,119,59,1,8657,111,119,110,65,114,114,111,119,59,1,8661,101,114,116,105,99,97,108,66,97,114,59,1,8741,110,4,6,65,66,76,82,84,97,1264,1292,1299,1352,1391,1408,114,114,111,119,4,3,59,66,85,1276,1278,1283,1,8595,97,114,59,1,10515,112,65,114,114,111,119,59,1,8693,114,101,118,101,59,1,785,101,102,116,4,3,82,84,86,1310,1323,1334,105,103,104,116,86,101,99,116,111,114,59,1,10576,101,101,86,101,99,116,111,114,59,1,10590,101,99,116,111,114,4,2,59,66,1345,1347,1,8637,97,114,59,1,10582,105,103,104,116,4,2,84,86,1362,1373,101,101,86,101,99,116,111,114,59,1,10591,101,99,116,111,114,4,2,59,66,1384,1386,1,8641,97,114,59,1,10583,101,101,4,2,59,65,1399,1401,1,8868,114,114,111,119,59,1,8615,114,114,111,119,59,1,8659,4,2,99,116,1421,1426,114,59,3,55349,56479,114,111,107,59,1,272,4,16,78,84,97,99,100,102,103,108,109,111,112,113,115,116,117,120,1466,1470,1478,1489,1515,1520,1525,1536,1544,1593,1609,1617,1650,1664,1668,1677,71,59,1,330,72,5,208,1,59,1476,1,208,99,117,116,101,5,201,1,59,1487,1,201,4,3,97,105,121,1497,1503,1512,114,111,110,59,1,282,114,99,5,202,1,59,1510,1,202,59,1,1069,111,116,59,1,278,114,59,3,55349,56584,114,97,118,101,5,200,1,59,1534,1,200,101,109,101,110,116,59,1,8712,4,2,97,112,1550,1555,99,114,59,1,274,116,121,4,2,83,86,1563,1576,109,97,108,108,83,113,117,97,114,101,59,1,9723,101,114,121,83,109,97,108,108,83,113,117,97,114,101,59,1,9643,4,2,103,112,1599,1604,111,110,59,1,280,102,59,3,55349,56636,115,105,108,111,110,59,1,917,117,4,2,97,105,1624,1640,108,4,2,59,84,1631,1633,1,10869,105,108,100,101,59,1,8770,108,105,98,114,105,117,109,59,1,8652,4,2,99,105,1656,1660,114,59,1,8496,109,59,1,10867,97,59,1,919,109,108,5,203,1,59,1675,1,203,4,2,105,112,1683,1689,115,116,115,59,1,8707,111,110,101,110,116,105,97,108,69,59,1,8519,4,5,99,102,105,111,115,1713,1717,1722,1762,1791,121,59,1,1060,114,59,3,55349,56585,108,108,101,100,4,2,83,86,1732,1745,109,97,108,108,83,113,117,97,114,101,59,1,9724,101,114,121,83,109,97,108,108,83,113,117,97,114,101,59,1,9642,4,3,112,114,117,1770,1775,1781,102,59,3,55349,56637,65,108,108,59,1,8704,114,105,101,114,116,114,102,59,1,8497,99,114,59,1,8497,4,12,74,84,97,98,99,100,102,103,111,114,115,116,1822,1827,1834,1848,1855,1877,1882,1887,1890,1896,1978,1984,99,121,59,1,1027,5,62,1,59,1832,1,62,109,109,97,4,2,59,100,1843,1845,1,915,59,1,988,114,101,118,101,59,1,286,4,3,101,105,121,1863,1869,1874,100,105,108,59,1,290,114,99,59,1,284,59,1,1043,111,116,59,1,288,114,59,3,55349,56586,59,1,8921,112,102,59,3,55349,56638,101,97,116,101,114,4,6,69,70,71,76,83,84,1915,1933,1944,1953,1959,1971,113,117,97,108,4,2,59,76,1925,1927,1,8805,101,115,115,59,1,8923,117,108,108,69,113,117,97,108,59,1,8807,114,101,97,116,101,114,59,1,10914,101,115,115,59,1,8823,108,97,110,116,69,113,117,97,108,59,1,10878,105,108,100,101,59,1,8819,99,114,59,3,55349,56482,59,1,8811,4,8,65,97,99,102,105,111,115,117,2005,2012,2026,2032,2036,2049,2073,2089,82,68,99,121,59,1,1066,4,2,99,116,2018,2023,101,107,59,1,711,59,1,94,105,114,99,59,1,292,114,59,1,8460,108,98,101,114,116,83,112,97,99,101,59,1,8459,4,2,112,114,2055,2059,102,59,1,8461,105,122,111,110,116,97,108,76,105,110,101,59,1,9472,4,2,99,116,2079,2083,114,59,1,8459,114,111,107,59,1,294,109,112,4,2,68,69,2097,2107,111,119,110,72,117,109,112,59,1,8782,113,117,97,108,59,1,8783,4,14,69,74,79,97,99,100,102,103,109,110,111,115,116,117,2144,2149,2155,2160,2171,2189,2194,2198,2209,2245,2307,2329,2334,2341,99,121,59,1,1045,108,105,103,59,1,306,99,121,59,1,1025,99,117,116,101,5,205,1,59,2169,1,205,4,2,105,121,2177,2186,114,99,5,206,1,59,2184,1,206,59,1,1048,111,116,59,1,304,114,59,1,8465,114,97,118,101,5,204,1,59,2207,1,204,4,3,59,97,112,2217,2219,2238,1,8465,4,2,99,103,2225,2229,114,59,1,298,105,110,97,114,121,73,59,1,8520,108,105,101,115,59,1,8658,4,2,116,118,2251,2281,4,2,59,101,2257,2259,1,8748,4,2,103,114,2265,2271,114,97,108,59,1,8747,115,101,99,116,105,111,110,59,1,8898,105,115,105,98,108,101,4,2,67,84,2293,2300,111,109,109,97,59,1,8291,105,109,101,115,59,1,8290,4,3,103,112,116,2315,2320,2325,111,110,59,1,302,102,59,3,55349,56640,97,59,1,921,99,114,59,1,8464,105,108,100,101,59,1,296,4,2,107,109,2347,2352,99,121,59,1,1030,108,5,207,1,59,2358,1,207,4,5,99,102,111,115,117,2372,2386,2391,2397,2414,4,2,105,121,2378,2383,114,99,59,1,308,59,1,1049,114,59,3,55349,56589,112,102,59,3,55349,56641,4,2,99,101,2403,2408,114,59,3,55349,56485,114,99,121,59,1,1032,107,99,121,59,1,1028,4,7,72,74,97,99,102,111,115,2436,2441,2446,2452,2467,2472,2478,99,121,59,1,1061,99,121,59,1,1036,112,112,97,59,1,922,4,2,101,121,2458,2464,100,105,108,59,1,310,59,1,1050,114,59,3,55349,56590,112,102,59,3,55349,56642,99,114,59,3,55349,56486,4,11,74,84,97,99,101,102,108,109,111,115,116,2508,2513,2520,2562,2585,2981,2986,3004,3011,3146,3167,99,121,59,1,1033,5,60,1,59,2518,1,60,4,5,99,109,110,112,114,2532,2538,2544,2548,2558,117,116,101,59,1,313,98,100,97,59,1,923,103,59,1,10218,108,97,99,101,116,114,102,59,1,8466,114,59,1,8606,4,3,97,101,121,2570,2576,2582,114,111,110,59,1,317,100,105,108,59,1,315,59,1,1051,4,2,102,115,2591,2907,116,4,10,65,67,68,70,82,84,85,86,97,114,2614,2663,2672,2728,2735,2760,2820,2870,2888,2895,4,2,110,114,2620,2633,103,108,101,66,114,97,99,107,101,116,59,1,10216,114,111,119,4,3,59,66,82,2644,2646,2651,1,8592,97,114,59,1,8676,105,103,104,116,65,114,114,111,119,59,1,8646,101,105,108,105,110,103,59,1,8968,111,4,2,117,119,2679,2692,98,108,101,66,114,97,99,107,101,116,59,1,10214,110,4,2,84,86,2699,2710,101,101,86,101,99,116,111,114,59,1,10593,101,99,116,111,114,4,2,59,66,2721,2723,1,8643,97,114,59,1,10585,108,111,111,114,59,1,8970,105,103,104,116,4,2,65,86,2745,2752,114,114,111,119,59,1,8596,101,99,116,111,114,59,1,10574,4,2,101,114,2766,2792,101,4,3,59,65,86,2775,2777,2784,1,8867,114,114,111,119,59,1,8612,101,99,116,111,114,59,1,10586,105,97,110,103,108,101,4,3,59,66,69,2806,2808,2813,1,8882,97,114,59,1,10703,113,117,97,108,59,1,8884,112,4,3,68,84,86,2829,2841,2852,111,119,110,86,101,99,116,111,114,59,1,10577,101,101,86,101,99,116,111,114,59,1,10592,101,99,116,111,114,4,2,59,66,2863,2865,1,8639,97,114,59,1,10584,101,99,116,111,114,4,2,59,66,2881,2883,1,8636,97,114,59,1,10578,114,114,111,119,59,1,8656,105,103,104,116,97,114,114,111,119,59,1,8660,115,4,6,69,70,71,76,83,84,2922,2936,2947,2956,2962,2974,113,117,97,108,71,114,101,97,116,101,114,59,1,8922,117,108,108,69,113,117,97,108,59,1,8806,114,101,97,116,101,114,59,1,8822,101,115,115,59,1,10913,108,97,110,116,69,113,117,97,108,59,1,10877,105,108,100,101,59,1,8818,114,59,3,55349,56591,4,2,59,101,2992,2994,1,8920,102,116,97,114,114,111,119,59,1,8666,105,100,111,116,59,1,319,4,3,110,112,119,3019,3110,3115,103,4,4,76,82,108,114,3030,3058,3070,3098,101,102,116,4,2,65,82,3039,3046,114,114,111,119,59,1,10229,105,103,104,116,65,114,114,111,119,59,1,10231,105,103,104,116,65,114,114,111,119,59,1,10230,101,102,116,4,2,97,114,3079,3086,114,114,111,119,59,1,10232,105,103,104,116,97,114,114,111,119,59,1,10234,105,103,104,116,97,114,114,111,119,59,1,10233,102,59,3,55349,56643,101,114,4,2,76,82,3123,3134,101,102,116,65,114,114,111,119,59,1,8601,105,103,104,116,65,114,114,111,119,59,1,8600,4,3,99,104,116,3154,3158,3161,114,59,1,8466,59,1,8624,114,111,107,59,1,321,59,1,8810,4,8,97,99,101,102,105,111,115,117,3188,3192,3196,3222,3227,3237,3243,3248,112,59,1,10501,121,59,1,1052,4,2,100,108,3202,3213,105,117,109,83,112,97,99,101,59,1,8287,108,105,110,116,114,102,59,1,8499,114,59,3,55349,56592,110,117,115,80,108,117,115,59,1,8723,112,102,59,3,55349,56644,99,114,59,1,8499,59,1,924,4,9,74,97,99,101,102,111,115,116,117,3271,3276,3283,3306,3422,3427,4120,4126,4137,99,121,59,1,1034,99,117,116,101,59,1,323,4,3,97,101,121,3291,3297,3303,114,111,110,59,1,327,100,105,108,59,1,325,59,1,1053,4,3,103,115,119,3314,3380,3415,97,116,105,118,101,4,3,77,84,86,3327,3340,3365,101,100,105,117,109,83,112,97,99,101,59,1,8203,104,105,4,2,99,110,3348,3357,107,83,112,97,99,101,59,1,8203,83,112,97,99,101,59,1,8203,101,114,121,84,104,105,110,83,112,97,99,101,59,1,8203,116,101,100,4,2,71,76,3389,3405,114,101,97,116,101,114,71,114,101,97,116,101,114,59,1,8811,101,115,115,76,101,115,115,59,1,8810,76,105,110,101,59,1,10,114,59,3,55349,56593,4,4,66,110,112,116,3437,3444,3460,3464,114,101,97,107,59,1,8288,66,114,101,97,107,105,110,103,83,112,97,99,101,59,1,160,102,59,1,8469,4,13,59,67,68,69,71,72,76,78,80,82,83,84,86,3492,3494,3517,3536,3578,3657,3685,3784,3823,3860,3915,4066,4107,1,10988,4,2,111,117,3500,3510,110,103,114,117,101,110,116,59,1,8802,112,67,97,112,59,1,8813,111,117,98,108,101,86,101,114,116,105,99,97,108,66,97,114,59,1,8742,4,3,108,113,120,3544,3552,3571,101,109,101,110,116,59,1,8713,117,97,108,4,2,59,84,3561,3563,1,8800,105,108,100,101,59,3,8770,824,105,115,116,115,59,1,8708,114,101,97,116,101,114,4,7,59,69,70,71,76,83,84,3600,3602,3609,3621,3631,3637,3650,1,8815,113,117,97,108,59,1,8817,117,108,108,69,113,117,97,108,59,3,8807,824,114,101,97,116,101,114,59,3,8811,824,101,115,115,59,1,8825,108,97,110,116,69,113,117,97,108,59,3,10878,824,105,108,100,101,59,1,8821,117,109,112,4,2,68,69,3666,3677,111,119,110,72,117,109,112,59,3,8782,824,113,117,97,108,59,3,8783,824,101,4,2,102,115,3692,3724,116,84,114,105,97,110,103,108,101,4,3,59,66,69,3709,3711,3717,1,8938,97,114,59,3,10703,824,113,117,97,108,59,1,8940,115,4,6,59,69,71,76,83,84,3739,3741,3748,3757,3764,3777,1,8814,113,117,97,108,59,1,8816,114,101,97,116,101,114,59,1,8824,101,115,115,59,3,8810,824,108,97,110,116,69,113,117,97,108,59,3,10877,824,105,108,100,101,59,1,8820,101,115,116,101,100,4,2,71,76,3795,3812,114,101,97,116,101,114,71,114,101,97,116,101,114,59,3,10914,824,101,115,115,76,101,115,115,59,3,10913,824,114,101,99,101,100,101,115,4,3,59,69,83,3838,3840,3848,1,8832,113,117,97,108,59,3,10927,824,108,97,110,116,69,113,117,97,108,59,1,8928,4,2,101,105,3866,3881,118,101,114,115,101,69,108,101,109,101,110,116,59,1,8716,103,104,116,84,114,105,97,110,103,108,101,4,3,59,66,69,3900,3902,3908,1,8939,97,114,59,3,10704,824,113,117,97,108,59,1,8941,4,2,113,117,3921,3973,117,97,114,101,83,117,4,2,98,112,3933,3952,115,101,116,4,2,59,69,3942,3945,3,8847,824,113,117,97,108,59,1,8930,101,114,115,101,116,4,2,59,69,3963,3966,3,8848,824,113,117,97,108,59,1,8931,4,3,98,99,112,3981,4e3,4045,115,101,116,4,2,59,69,3990,3993,3,8834,8402,113,117,97,108,59,1,8840,99,101,101,100,115,4,4,59,69,83,84,4015,4017,4025,4037,1,8833,113,117,97,108,59,3,10928,824,108,97,110,116,69,113,117,97,108,59,1,8929,105,108,100,101,59,3,8831,824,101,114,115,101,116,4,2,59,69,4056,4059,3,8835,8402,113,117,97,108,59,1,8841,105,108,100,101,4,4,59,69,70,84,4080,4082,4089,4100,1,8769,113,117,97,108,59,1,8772,117,108,108,69,113,117,97,108,59,1,8775,105,108,100,101,59,1,8777,101,114,116,105,99,97,108,66,97,114,59,1,8740,99,114,59,3,55349,56489,105,108,100,101,5,209,1,59,4135,1,209,59,1,925,4,14,69,97,99,100,102,103,109,111,112,114,115,116,117,118,4170,4176,4187,4205,4212,4217,4228,4253,4259,4292,4295,4316,4337,4346,108,105,103,59,1,338,99,117,116,101,5,211,1,59,4185,1,211,4,2,105,121,4193,4202,114,99,5,212,1,59,4200,1,212,59,1,1054,98,108,97,99,59,1,336,114,59,3,55349,56594,114,97,118,101,5,210,1,59,4226,1,210,4,3,97,101,105,4236,4241,4246,99,114,59,1,332,103,97,59,1,937,99,114,111,110,59,1,927,112,102,59,3,55349,56646,101,110,67,117,114,108,121,4,2,68,81,4272,4285,111,117,98,108,101,81,117,111,116,101,59,1,8220,117,111,116,101,59,1,8216,59,1,10836,4,2,99,108,4301,4306,114,59,3,55349,56490,97,115,104,5,216,1,59,4314,1,216,105,4,2,108,109,4323,4332,100,101,5,213,1,59,4330,1,213,101,115,59,1,10807,109,108,5,214,1,59,4344,1,214,101,114,4,2,66,80,4354,4380,4,2,97,114,4360,4364,114,59,1,8254,97,99,4,2,101,107,4372,4375,59,1,9182,101,116,59,1,9140,97,114,101,110,116,104,101,115,105,115,59,1,9180,4,9,97,99,102,104,105,108,111,114,115,4413,4422,4426,4431,4435,4438,4448,4471,4561,114,116,105,97,108,68,59,1,8706,121,59,1,1055,114,59,3,55349,56595,105,59,1,934,59,1,928,117,115,77,105,110,117,115,59,1,177,4,2,105,112,4454,4467,110,99,97,114,101,112,108,97,110,101,59,1,8460,102,59,1,8473,4,4,59,101,105,111,4481,4483,4526,4531,1,10939,99,101,100,101,115,4,4,59,69,83,84,4498,4500,4507,4519,1,8826,113,117,97,108,59,1,10927,108,97,110,116,69,113,117,97,108,59,1,8828,105,108,100,101,59,1,8830,109,101,59,1,8243,4,2,100,112,4537,4543,117,99,116,59,1,8719,111,114,116,105,111,110,4,2,59,97,4555,4557,1,8759,108,59,1,8733,4,2,99,105,4567,4572,114,59,3,55349,56491,59,1,936,4,4,85,102,111,115,4585,4594,4599,4604,79,84,5,34,1,59,4592,1,34,114,59,3,55349,56596,112,102,59,1,8474,99,114,59,3,55349,56492,4,12,66,69,97,99,101,102,104,105,111,114,115,117,4636,4642,4650,4681,4704,4763,4767,4771,5047,5069,5081,5094,97,114,114,59,1,10512,71,5,174,1,59,4648,1,174,4,3,99,110,114,4658,4664,4668,117,116,101,59,1,340,103,59,1,10219,114,4,2,59,116,4675,4677,1,8608,108,59,1,10518,4,3,97,101,121,4689,4695,4701,114,111,110,59,1,344,100,105,108,59,1,342,59,1,1056,4,2,59,118,4710,4712,1,8476,101,114,115,101,4,2,69,85,4722,4748,4,2,108,113,4728,4736,101,109,101,110,116,59,1,8715,117,105,108,105,98,114,105,117,109,59,1,8651,112,69,113,117,105,108,105,98,114,105,117,109,59,1,10607,114,59,1,8476,111,59,1,929,103,104,116,4,8,65,67,68,70,84,85,86,97,4792,4840,4849,4905,4912,4972,5022,5040,4,2,110,114,4798,4811,103,108,101,66,114,97,99,107,101,116,59,1,10217,114,111,119,4,3,59,66,76,4822,4824,4829,1,8594,97,114,59,1,8677,101,102,116,65,114,114,111,119,59,1,8644,101,105,108,105,110,103,59,1,8969,111,4,2,117,119,4856,4869,98,108,101,66,114,97,99,107,101,116,59,1,10215,110,4,2,84,86,4876,4887,101,101,86,101,99,116,111,114,59,1,10589,101,99,116,111,114,4,2,59,66,4898,4900,1,8642,97,114,59,1,10581,108,111,111,114,59,1,8971,4,2,101,114,4918,4944,101,4,3,59,65,86,4927,4929,4936,1,8866,114,114,111,119,59,1,8614,101,99,116,111,114,59,1,10587,105,97,110,103,108,101,4,3,59,66,69,4958,4960,4965,1,8883,97,114,59,1,10704,113,117,97,108,59,1,8885,112,4,3,68,84,86,4981,4993,5004,111,119,110,86,101,99,116,111,114,59,1,10575,101,101,86,101,99,116,111,114,59,1,10588,101,99,116,111,114,4,2,59,66,5015,5017,1,8638,97,114,59,1,10580,101,99,116,111,114,4,2,59,66,5033,5035,1,8640,97,114,59,1,10579,114,114,111,119,59,1,8658,4,2,112,117,5053,5057,102,59,1,8477,110,100,73,109,112,108,105,101,115,59,1,10608,105,103,104,116,97,114,114,111,119,59,1,8667,4,2,99,104,5087,5091,114,59,1,8475,59,1,8625,108,101,68,101,108,97,121,101,100,59,1,10740,4,13,72,79,97,99,102,104,105,109,111,113,115,116,117,5134,5150,5157,5164,5198,5203,5259,5265,5277,5283,5374,5380,5385,4,2,67,99,5140,5146,72,99,121,59,1,1065,121,59,1,1064,70,84,99,121,59,1,1068,99,117,116,101,59,1,346,4,5,59,97,101,105,121,5176,5178,5184,5190,5195,1,10940,114,111,110,59,1,352,100,105,108,59,1,350,114,99,59,1,348,59,1,1057,114,59,3,55349,56598,111,114,116,4,4,68,76,82,85,5216,5227,5238,5250,111,119,110,65,114,114,111,119,59,1,8595,101,102,116,65,114,114,111,119,59,1,8592,105,103,104,116,65,114,114,111,119,59,1,8594,112,65,114,114,111,119,59,1,8593,103,109,97,59,1,931,97,108,108,67,105,114,99,108,101,59,1,8728,112,102,59,3,55349,56650,4,2,114,117,5289,5293,116,59,1,8730,97,114,101,4,4,59,73,83,85,5306,5308,5322,5367,1,9633,110,116,101,114,115,101,99,116,105,111,110,59,1,8851,117,4,2,98,112,5329,5347,115,101,116,4,2,59,69,5338,5340,1,8847,113,117,97,108,59,1,8849,101,114,115,101,116,4,2,59,69,5358,5360,1,8848,113,117,97,108,59,1,8850,110,105,111,110,59,1,8852,99,114,59,3,55349,56494,97,114,59,1,8902,4,4,98,99,109,112,5395,5420,5475,5478,4,2,59,115,5401,5403,1,8912,101,116,4,2,59,69,5411,5413,1,8912,113,117,97,108,59,1,8838,4,2,99,104,5426,5468,101,101,100,115,4,4,59,69,83,84,5440,5442,5449,5461,1,8827,113,117,97,108,59,1,10928,108,97,110,116,69,113,117,97,108,59,1,8829,105,108,100,101,59,1,8831,84,104,97,116,59,1,8715,59,1,8721,4,3,59,101,115,5486,5488,5507,1,8913,114,115,101,116,4,2,59,69,5498,5500,1,8835,113,117,97,108,59,1,8839,101,116,59,1,8913,4,11,72,82,83,97,99,102,104,105,111,114,115,5536,5546,5552,5567,5579,5602,5607,5655,5695,5701,5711,79,82,78,5,222,1,59,5544,1,222,65,68,69,59,1,8482,4,2,72,99,5558,5563,99,121,59,1,1035,121,59,1,1062,4,2,98,117,5573,5576,59,1,9,59,1,932,4,3,97,101,121,5587,5593,5599,114,111,110,59,1,356,100,105,108,59,1,354,59,1,1058,114,59,3,55349,56599,4,2,101,105,5613,5631,4,2,114,116,5619,5627,101,102,111,114,101,59,1,8756,97,59,1,920,4,2,99,110,5637,5647,107,83,112,97,99,101,59,3,8287,8202,83,112,97,99,101,59,1,8201,108,100,101,4,4,59,69,70,84,5668,5670,5677,5688,1,8764,113,117,97,108,59,1,8771,117,108,108,69,113,117,97,108,59,1,8773,105,108,100,101,59,1,8776,112,102,59,3,55349,56651,105,112,108,101,68,111,116,59,1,8411,4,2,99,116,5717,5722,114,59,3,55349,56495,114,111,107,59,1,358,4,14,97,98,99,100,102,103,109,110,111,112,114,115,116,117,5758,5789,5805,5823,5830,5835,5846,5852,5921,5937,6089,6095,6101,6108,4,2,99,114,5764,5774,117,116,101,5,218,1,59,5772,1,218,114,4,2,59,111,5781,5783,1,8607,99,105,114,59,1,10569,114,4,2,99,101,5796,5800,121,59,1,1038,118,101,59,1,364,4,2,105,121,5811,5820,114,99,5,219,1,59,5818,1,219,59,1,1059,98,108,97,99,59,1,368,114,59,3,55349,56600,114,97,118,101,5,217,1,59,5844,1,217,97,99,114,59,1,362,4,2,100,105,5858,5905,101,114,4,2,66,80,5866,5892,4,2,97,114,5872,5876,114,59,1,95,97,99,4,2,101,107,5884,5887,59,1,9183,101,116,59,1,9141,97,114,101,110,116,104,101,115,105,115,59,1,9181,111,110,4,2,59,80,5913,5915,1,8899,108,117,115,59,1,8846,4,2,103,112,5927,5932,111,110,59,1,370,102,59,3,55349,56652,4,8,65,68,69,84,97,100,112,115,5955,5985,5996,6009,6026,6033,6044,6075,114,114,111,119,4,3,59,66,68,5967,5969,5974,1,8593,97,114,59,1,10514,111,119,110,65,114,114,111,119,59,1,8645,111,119,110,65,114,114,111,119,59,1,8597,113,117,105,108,105,98,114,105,117,109,59,1,10606,101,101,4,2,59,65,6017,6019,1,8869,114,114,111,119,59,1,8613,114,114,111,119,59,1,8657,111,119,110,97,114,114,111,119,59,1,8661,101,114,4,2,76,82,6052,6063,101,102,116,65,114,114,111,119,59,1,8598,105,103,104,116,65,114,114,111,119,59,1,8599,105,4,2,59,108,6082,6084,1,978,111,110,59,1,933,105,110,103,59,1,366,99,114,59,3,55349,56496,105,108,100,101,59,1,360,109,108,5,220,1,59,6115,1,220,4,9,68,98,99,100,101,102,111,115,118,6137,6143,6148,6152,6166,6250,6255,6261,6267,97,115,104,59,1,8875,97,114,59,1,10987,121,59,1,1042,97,115,104,4,2,59,108,6161,6163,1,8873,59,1,10982,4,2,101,114,6172,6175,59,1,8897,4,3,98,116,121,6183,6188,6238,97,114,59,1,8214,4,2,59,105,6194,6196,1,8214,99,97,108,4,4,66,76,83,84,6209,6214,6220,6231,97,114,59,1,8739,105,110,101,59,1,124,101,112,97,114,97,116,111,114,59,1,10072,105,108,100,101,59,1,8768,84,104,105,110,83,112,97,99,101,59,1,8202,114,59,3,55349,56601,112,102,59,3,55349,56653,99,114,59,3,55349,56497,100,97,115,104,59,1,8874,4,5,99,101,102,111,115,6286,6292,6298,6303,6309,105,114,99,59,1,372,100,103,101,59,1,8896,114,59,3,55349,56602,112,102,59,3,55349,56654,99,114,59,3,55349,56498,4,4,102,105,111,115,6325,6330,6333,6339,114,59,3,55349,56603,59,1,926,112,102,59,3,55349,56655,99,114,59,3,55349,56499,4,9,65,73,85,97,99,102,111,115,117,6365,6370,6375,6380,6391,6405,6410,6416,6422,99,121,59,1,1071,99,121,59,1,1031,99,121,59,1,1070,99,117,116,101,5,221,1,59,6389,1,221,4,2,105,121,6397,6402,114,99,59,1,374,59,1,1067,114,59,3,55349,56604,112,102,59,3,55349,56656,99,114,59,3,55349,56500,109,108,59,1,376,4,8,72,97,99,100,101,102,111,115,6445,6450,6457,6472,6477,6501,6505,6510,99,121,59,1,1046,99,117,116,101,59,1,377,4,2,97,121,6463,6469,114,111,110,59,1,381,59,1,1047,111,116,59,1,379,4,2,114,116,6483,6497,111,87,105,100,116,104,83,112,97,99,101,59,1,8203,97,59,1,918,114,59,1,8488,112,102,59,1,8484,99,114,59,3,55349,56501,4,16,97,98,99,101,102,103,108,109,110,111,112,114,115,116,117,119,6550,6561,6568,6612,6622,6634,6645,6672,6699,6854,6870,6923,6933,6963,6974,6983,99,117,116,101,5,225,1,59,6559,1,225,114,101,118,101,59,1,259,4,6,59,69,100,105,117,121,6582,6584,6588,6591,6600,6609,1,8766,59,3,8766,819,59,1,8767,114,99,5,226,1,59,6598,1,226,116,101,5,180,1,59,6607,1,180,59,1,1072,108,105,103,5,230,1,59,6620,1,230,4,2,59,114,6628,6630,1,8289,59,3,55349,56606,114,97,118,101,5,224,1,59,6643,1,224,4,2,101,112,6651,6667,4,2,102,112,6657,6663,115,121,109,59,1,8501,104,59,1,8501,104,97,59,1,945,4,2,97,112,6678,6692,4,2,99,108,6684,6688,114,59,1,257,103,59,1,10815,5,38,1,59,6697,1,38,4,2,100,103,6705,6737,4,5,59,97,100,115,118,6717,6719,6724,6727,6734,1,8743,110,100,59,1,10837,59,1,10844,108,111,112,101,59,1,10840,59,1,10842,4,7,59,101,108,109,114,115,122,6753,6755,6758,6762,6814,6835,6848,1,8736,59,1,10660,101,59,1,8736,115,100,4,2,59,97,6770,6772,1,8737,4,8,97,98,99,100,101,102,103,104,6790,6793,6796,6799,6802,6805,6808,6811,59,1,10664,59,1,10665,59,1,10666,59,1,10667,59,1,10668,59,1,10669,59,1,10670,59,1,10671,116,4,2,59,118,6821,6823,1,8735,98,4,2,59,100,6830,6832,1,8894,59,1,10653,4,2,112,116,6841,6845,104,59,1,8738,59,1,197,97,114,114,59,1,9084,4,2,103,112,6860,6865,111,110,59,1,261,102,59,3,55349,56658,4,7,59,69,97,101,105,111,112,6886,6888,6891,6897,6900,6904,6908,1,8776,59,1,10864,99,105,114,59,1,10863,59,1,8778,100,59,1,8779,115,59,1,39,114,111,120,4,2,59,101,6917,6919,1,8776,113,59,1,8778,105,110,103,5,229,1,59,6931,1,229,4,3,99,116,121,6941,6946,6949,114,59,3,55349,56502,59,1,42,109,112,4,2,59,101,6957,6959,1,8776,113,59,1,8781,105,108,100,101,5,227,1,59,6972,1,227,109,108,5,228,1,59,6981,1,228,4,2,99,105,6989,6997,111,110,105,110,116,59,1,8755,110,116,59,1,10769,4,16,78,97,98,99,100,101,102,105,107,108,110,111,112,114,115,117,7036,7041,7119,7135,7149,7155,7219,7224,7347,7354,7463,7489,7786,7793,7814,7866,111,116,59,1,10989,4,2,99,114,7047,7094,107,4,4,99,101,112,115,7058,7064,7073,7080,111,110,103,59,1,8780,112,115,105,108,111,110,59,1,1014,114,105,109,101,59,1,8245,105,109,4,2,59,101,7088,7090,1,8765,113,59,1,8909,4,2,118,119,7100,7105,101,101,59,1,8893,101,100,4,2,59,103,7113,7115,1,8965,101,59,1,8965,114,107,4,2,59,116,7127,7129,1,9141,98,114,107,59,1,9142,4,2,111,121,7141,7146,110,103,59,1,8780,59,1,1073,113,117,111,59,1,8222,4,5,99,109,112,114,116,7167,7181,7188,7193,7199,97,117,115,4,2,59,101,7176,7178,1,8757,59,1,8757,112,116,121,118,59,1,10672,115,105,59,1,1014,110,111,117,59,1,8492,4,3,97,104,119,7207,7210,7213,59,1,946,59,1,8502,101,101,110,59,1,8812,114,59,3,55349,56607,103,4,7,99,111,115,116,117,118,119,7241,7262,7288,7305,7328,7335,7340,4,3,97,105,117,7249,7253,7258,112,59,1,8898,114,99,59,1,9711,112,59,1,8899,4,3,100,112,116,7270,7275,7281,111,116,59,1,10752,108,117,115,59,1,10753,105,109,101,115,59,1,10754,4,2,113,116,7294,7300,99,117,112,59,1,10758,97,114,59,1,9733,114,105,97,110,103,108,101,4,2,100,117,7318,7324,111,119,110,59,1,9661,112,59,1,9651,112,108,117,115,59,1,10756,101,101,59,1,8897,101,100,103,101,59,1,8896,97,114,111,119,59,1,10509,4,3,97,107,111,7362,7436,7458,4,2,99,110,7368,7432,107,4,3,108,115,116,7377,7386,7394,111,122,101,110,103,101,59,1,10731,113,117,97,114,101,59,1,9642,114,105,97,110,103,108,101,4,4,59,100,108,114,7411,7413,7419,7425,1,9652,111,119,110,59,1,9662,101,102,116,59,1,9666,105,103,104,116,59,1,9656,107,59,1,9251,4,2,49,51,7442,7454,4,2,50,52,7448,7451,59,1,9618,59,1,9617,52,59,1,9619,99,107,59,1,9608,4,2,101,111,7469,7485,4,2,59,113,7475,7478,3,61,8421,117,105,118,59,3,8801,8421,116,59,1,8976,4,4,112,116,119,120,7499,7504,7517,7523,102,59,3,55349,56659,4,2,59,116,7510,7512,1,8869,111,109,59,1,8869,116,105,101,59,1,8904,4,12,68,72,85,86,98,100,104,109,112,116,117,118,7549,7571,7597,7619,7655,7660,7682,7708,7715,7721,7728,7750,4,4,76,82,108,114,7559,7562,7565,7568,59,1,9559,59,1,9556,59,1,9558,59,1,9555,4,5,59,68,85,100,117,7583,7585,7588,7591,7594,1,9552,59,1,9574,59,1,9577,59,1,9572,59,1,9575,4,4,76,82,108,114,7607,7610,7613,7616,59,1,9565,59,1,9562,59,1,9564,59,1,9561,4,7,59,72,76,82,104,108,114,7635,7637,7640,7643,7646,7649,7652,1,9553,59,1,9580,59,1,9571,59,1,9568,59,1,9579,59,1,9570,59,1,9567,111,120,59,1,10697,4,4,76,82,108,114,7670,7673,7676,7679,59,1,9557,59,1,9554,59,1,9488,59,1,9484,4,5,59,68,85,100,117,7694,7696,7699,7702,7705,1,9472,59,1,9573,59,1,9576,59,1,9516,59,1,9524,105,110,117,115,59,1,8863,108,117,115,59,1,8862,105,109,101,115,59,1,8864,4,4,76,82,108,114,7738,7741,7744,7747,59,1,9563,59,1,9560,59,1,9496,59,1,9492,4,7,59,72,76,82,104,108,114,7766,7768,7771,7774,7777,7780,7783,1,9474,59,1,9578,59,1,9569,59,1,9566,59,1,9532,59,1,9508,59,1,9500,114,105,109,101,59,1,8245,4,2,101,118,7799,7804,118,101,59,1,728,98,97,114,5,166,1,59,7812,1,166,4,4,99,101,105,111,7824,7829,7834,7846,114,59,3,55349,56503,109,105,59,1,8271,109,4,2,59,101,7841,7843,1,8765,59,1,8909,108,4,3,59,98,104,7855,7857,7860,1,92,59,1,10693,115,117,98,59,1,10184,4,2,108,109,7872,7885,108,4,2,59,101,7879,7881,1,8226,116,59,1,8226,112,4,3,59,69,101,7894,7896,7899,1,8782,59,1,10926,4,2,59,113,7905,7907,1,8783,59,1,8783,4,15,97,99,100,101,102,104,105,108,111,114,115,116,117,119,121,7942,8021,8075,8080,8121,8126,8157,8279,8295,8430,8446,8485,8491,8707,8726,4,3,99,112,114,7950,7956,8007,117,116,101,59,1,263,4,6,59,97,98,99,100,115,7970,7972,7977,7984,7998,8003,1,8745,110,100,59,1,10820,114,99,117,112,59,1,10825,4,2,97,117,7990,7994,112,59,1,10827,112,59,1,10823,111,116,59,1,10816,59,3,8745,65024,4,2,101,111,8013,8017,116,59,1,8257,110,59,1,711,4,4,97,101,105,117,8031,8046,8056,8061,4,2,112,114,8037,8041,115,59,1,10829,111,110,59,1,269,100,105,108,5,231,1,59,8054,1,231,114,99,59,1,265,112,115,4,2,59,115,8069,8071,1,10828,109,59,1,10832,111,116,59,1,267,4,3,100,109,110,8088,8097,8104,105,108,5,184,1,59,8095,1,184,112,116,121,118,59,1,10674,116,5,162,2,59,101,8112,8114,1,162,114,100,111,116,59,1,183,114,59,3,55349,56608,4,3,99,101,105,8134,8138,8154,121,59,1,1095,99,107,4,2,59,109,8146,8148,1,10003,97,114,107,59,1,10003,59,1,967,114,4,7,59,69,99,101,102,109,115,8174,8176,8179,8258,8261,8268,8273,1,9675,59,1,10691,4,3,59,101,108,8187,8189,8193,1,710,113,59,1,8791,101,4,2,97,100,8200,8223,114,114,111,119,4,2,108,114,8210,8216,101,102,116,59,1,8634,105,103,104,116,59,1,8635,4,5,82,83,97,99,100,8235,8238,8241,8246,8252,59,1,174,59,1,9416,115,116,59,1,8859,105,114,99,59,1,8858,97,115,104,59,1,8861,59,1,8791,110,105,110,116,59,1,10768,105,100,59,1,10991,99,105,114,59,1,10690,117,98,115,4,2,59,117,8288,8290,1,9827,105,116,59,1,9827,4,4,108,109,110,112,8305,8326,8376,8400,111,110,4,2,59,101,8313,8315,1,58,4,2,59,113,8321,8323,1,8788,59,1,8788,4,2,109,112,8332,8344,97,4,2,59,116,8339,8341,1,44,59,1,64,4,3,59,102,108,8352,8354,8358,1,8705,110,59,1,8728,101,4,2,109,120,8365,8371,101,110,116,59,1,8705,101,115,59,1,8450,4,2,103,105,8382,8395,4,2,59,100,8388,8390,1,8773,111,116,59,1,10861,110,116,59,1,8750,4,3,102,114,121,8408,8412,8417,59,3,55349,56660,111,100,59,1,8720,5,169,2,59,115,8424,8426,1,169,114,59,1,8471,4,2,97,111,8436,8441,114,114,59,1,8629,115,115,59,1,10007,4,2,99,117,8452,8457,114,59,3,55349,56504,4,2,98,112,8463,8474,4,2,59,101,8469,8471,1,10959,59,1,10961,4,2,59,101,8480,8482,1,10960,59,1,10962,100,111,116,59,1,8943,4,7,100,101,108,112,114,118,119,8507,8522,8536,8550,8600,8697,8702,97,114,114,4,2,108,114,8516,8519,59,1,10552,59,1,10549,4,2,112,115,8528,8532,114,59,1,8926,99,59,1,8927,97,114,114,4,2,59,112,8545,8547,1,8630,59,1,10557,4,6,59,98,99,100,111,115,8564,8566,8573,8587,8592,8596,1,8746,114,99,97,112,59,1,10824,4,2,97,117,8579,8583,112,59,1,10822,112,59,1,10826,111,116,59,1,8845,114,59,1,10821,59,3,8746,65024,4,4,97,108,114,118,8610,8623,8663,8672,114,114,4,2,59,109,8618,8620,1,8631,59,1,10556,121,4,3,101,118,119,8632,8651,8656,113,4,2,112,115,8639,8645,114,101,99,59,1,8926,117,99,99,59,1,8927,101,101,59,1,8910,101,100,103,101,59,1,8911,101,110,5,164,1,59,8670,1,164,101,97,114,114,111,119,4,2,108,114,8684,8690,101,102,116,59,1,8630,105,103,104,116,59,1,8631,101,101,59,1,8910,101,100,59,1,8911,4,2,99,105,8713,8721,111,110,105,110,116,59,1,8754,110,116,59,1,8753,108,99,116,121,59,1,9005,4,19,65,72,97,98,99,100,101,102,104,105,106,108,111,114,115,116,117,119,122,8773,8778,8783,8821,8839,8854,8887,8914,8930,8944,9036,9041,9058,9197,9227,9258,9281,9297,9305,114,114,59,1,8659,97,114,59,1,10597,4,4,103,108,114,115,8793,8799,8805,8809,103,101,114,59,1,8224,101,116,104,59,1,8504,114,59,1,8595,104,4,2,59,118,8816,8818,1,8208,59,1,8867,4,2,107,108,8827,8834,97,114,111,119,59,1,10511,97,99,59,1,733,4,2,97,121,8845,8851,114,111,110,59,1,271,59,1,1076,4,3,59,97,111,8862,8864,8880,1,8518,4,2,103,114,8870,8876,103,101,114,59,1,8225,114,59,1,8650,116,115,101,113,59,1,10871,4,3,103,108,109,8895,8902,8907,5,176,1,59,8900,1,176,116,97,59,1,948,112,116,121,118,59,1,10673,4,2,105,114,8920,8926,115,104,116,59,1,10623,59,3,55349,56609,97,114,4,2,108,114,8938,8941,59,1,8643,59,1,8642,4,5,97,101,103,115,118,8956,8986,8989,8996,9001,109,4,3,59,111,115,8965,8967,8983,1,8900,110,100,4,2,59,115,8975,8977,1,8900,117,105,116,59,1,9830,59,1,9830,59,1,168,97,109,109,97,59,1,989,105,110,59,1,8946,4,3,59,105,111,9009,9011,9031,1,247,100,101,5,247,2,59,111,9020,9022,1,247,110,116,105,109,101,115,59,1,8903,110,120,59,1,8903,99,121,59,1,1106,99,4,2,111,114,9048,9053,114,110,59,1,8990,111,112,59,1,8973,4,5,108,112,116,117,119,9070,9076,9081,9130,9144,108,97,114,59,1,36,102,59,3,55349,56661,4,5,59,101,109,112,115,9093,9095,9109,9116,9122,1,729,113,4,2,59,100,9102,9104,1,8784,111,116,59,1,8785,105,110,117,115,59,1,8760,108,117,115,59,1,8724,113,117,97,114,101,59,1,8865,98,108,101,98,97,114,119,101,100,103,101,59,1,8966,110,4,3,97,100,104,9153,9160,9172,114,114,111,119,59,1,8595,111,119,110,97,114,114,111,119,115,59,1,8650,97,114,112,111,111,110,4,2,108,114,9184,9190,101,102,116,59,1,8643,105,103,104,116,59,1,8642,4,2,98,99,9203,9211,107,97,114,111,119,59,1,10512,4,2,111,114,9217,9222,114,110,59,1,8991,111,112,59,1,8972,4,3,99,111,116,9235,9248,9252,4,2,114,121,9241,9245,59,3,55349,56505,59,1,1109,108,59,1,10742,114,111,107,59,1,273,4,2,100,114,9264,9269,111,116,59,1,8945,105,4,2,59,102,9276,9278,1,9663,59,1,9662,4,2,97,104,9287,9292,114,114,59,1,8693,97,114,59,1,10607,97,110,103,108,101,59,1,10662,4,2,99,105,9311,9315,121,59,1,1119,103,114,97,114,114,59,1,10239,4,18,68,97,99,100,101,102,103,108,109,110,111,112,113,114,115,116,117,120,9361,9376,9398,9439,9444,9447,9462,9495,9531,9585,9598,9614,9659,9755,9771,9792,9808,9826,4,2,68,111,9367,9372,111,116,59,1,10871,116,59,1,8785,4,2,99,115,9382,9392,117,116,101,5,233,1,59,9390,1,233,116,101,114,59,1,10862,4,4,97,105,111,121,9408,9414,9430,9436,114,111,110,59,1,283,114,4,2,59,99,9421,9423,1,8790,5,234,1,59,9428,1,234,108,111,110,59,1,8789,59,1,1101,111,116,59,1,279,59,1,8519,4,2,68,114,9453,9458,111,116,59,1,8786,59,3,55349,56610,4,3,59,114,115,9470,9472,9482,1,10906,97,118,101,5,232,1,59,9480,1,232,4,2,59,100,9488,9490,1,10902,111,116,59,1,10904,4,4,59,105,108,115,9505,9507,9515,9518,1,10905,110,116,101,114,115,59,1,9191,59,1,8467,4,2,59,100,9524,9526,1,10901,111,116,59,1,10903,4,3,97,112,115,9539,9544,9564,99,114,59,1,275,116,121,4,3,59,115,118,9554,9556,9561,1,8709,101,116,59,1,8709,59,1,8709,112,4,2,49,59,9571,9583,4,2,51,52,9577,9580,59,1,8196,59,1,8197,1,8195,4,2,103,115,9591,9594,59,1,331,112,59,1,8194,4,2,103,112,9604,9609,111,110,59,1,281,102,59,3,55349,56662,4,3,97,108,115,9622,9635,9640,114,4,2,59,115,9629,9631,1,8917,108,59,1,10723,117,115,59,1,10865,105,4,3,59,108,118,9649,9651,9656,1,949,111,110,59,1,949,59,1,1013,4,4,99,115,117,118,9669,9686,9716,9747,4,2,105,111,9675,9680,114,99,59,1,8790,108,111,110,59,1,8789,4,2,105,108,9692,9696,109,59,1,8770,97,110,116,4,2,103,108,9705,9710,116,114,59,1,10902,101,115,115,59,1,10901,4,3,97,101,105,9724,9729,9734,108,115,59,1,61,115,116,59,1,8799,118,4,2,59,68,9741,9743,1,8801,68,59,1,10872,112,97,114,115,108,59,1,10725,4,2,68,97,9761,9766,111,116,59,1,8787,114,114,59,1,10609,4,3,99,100,105,9779,9783,9788,114,59,1,8495,111,116,59,1,8784,109,59,1,8770,4,2,97,104,9798,9801,59,1,951,5,240,1,59,9806,1,240,4,2,109,114,9814,9822,108,5,235,1,59,9820,1,235,111,59,1,8364,4,3,99,105,112,9834,9838,9843,108,59,1,33,115,116,59,1,8707,4,2,101,111,9849,9859,99,116,97,116,105,111,110,59,1,8496,110,101,110,116,105,97,108,101,59,1,8519,4,12,97,99,101,102,105,106,108,110,111,112,114,115,9896,9910,9914,9921,9954,9960,9967,9989,9994,10027,10036,10164,108,108,105,110,103,100,111,116,115,101,113,59,1,8786,121,59,1,1092,109,97,108,101,59,1,9792,4,3,105,108,114,9929,9935,9950,108,105,103,59,1,64259,4,2,105,108,9941,9945,103,59,1,64256,105,103,59,1,64260,59,3,55349,56611,108,105,103,59,1,64257,108,105,103,59,3,102,106,4,3,97,108,116,9975,9979,9984,116,59,1,9837,105,103,59,1,64258,110,115,59,1,9649,111,102,59,1,402,4,2,112,114,1e4,10005,102,59,3,55349,56663,4,2,97,107,10011,10016,108,108,59,1,8704,4,2,59,118,10022,10024,1,8916,59,1,10969,97,114,116,105,110,116,59,1,10765,4,2,97,111,10042,10159,4,2,99,115,10048,10155,4,6,49,50,51,52,53,55,10062,10102,10114,10135,10139,10151,4,6,50,51,52,53,54,56,10076,10083,10086,10093,10096,10099,5,189,1,59,10081,1,189,59,1,8531,5,188,1,59,10091,1,188,59,1,8533,59,1,8537,59,1,8539,4,2,51,53,10108,10111,59,1,8532,59,1,8534,4,3,52,53,56,10122,10129,10132,5,190,1,59,10127,1,190,59,1,8535,59,1,8540,53,59,1,8536,4,2,54,56,10145,10148,59,1,8538,59,1,8541,56,59,1,8542,108,59,1,8260,119,110,59,1,8994,99,114,59,3,55349,56507,4,17,69,97,98,99,100,101,102,103,105,106,108,110,111,114,115,116,118,10206,10217,10247,10254,10268,10273,10358,10363,10374,10380,10385,10406,10458,10464,10470,10497,10610,4,2,59,108,10212,10214,1,8807,59,1,10892,4,3,99,109,112,10225,10231,10244,117,116,101,59,1,501,109,97,4,2,59,100,10239,10241,1,947,59,1,989,59,1,10886,114,101,118,101,59,1,287,4,2,105,121,10260,10265,114,99,59,1,285,59,1,1075,111,116,59,1,289,4,4,59,108,113,115,10283,10285,10288,10308,1,8805,59,1,8923,4,3,59,113,115,10296,10298,10301,1,8805,59,1,8807,108,97,110,116,59,1,10878,4,4,59,99,100,108,10318,10320,10324,10345,1,10878,99,59,1,10921,111,116,4,2,59,111,10332,10334,1,10880,4,2,59,108,10340,10342,1,10882,59,1,10884,4,2,59,101,10351,10354,3,8923,65024,115,59,1,10900,114,59,3,55349,56612,4,2,59,103,10369,10371,1,8811,59,1,8921,109,101,108,59,1,8503,99,121,59,1,1107,4,4,59,69,97,106,10395,10397,10400,10403,1,8823,59,1,10898,59,1,10917,59,1,10916,4,4,69,97,101,115,10416,10419,10434,10453,59,1,8809,112,4,2,59,112,10426,10428,1,10890,114,111,120,59,1,10890,4,2,59,113,10440,10442,1,10888,4,2,59,113,10448,10450,1,10888,59,1,8809,105,109,59,1,8935,112,102,59,3,55349,56664,97,118,101,59,1,96,4,2,99,105,10476,10480,114,59,1,8458,109,4,3,59,101,108,10489,10491,10494,1,8819,59,1,10894,59,1,10896,5,62,6,59,99,100,108,113,114,10512,10514,10527,10532,10538,10545,1,62,4,2,99,105,10520,10523,59,1,10919,114,59,1,10874,111,116,59,1,8919,80,97,114,59,1,10645,117,101,115,116,59,1,10876,4,5,97,100,101,108,115,10557,10574,10579,10599,10605,4,2,112,114,10563,10570,112,114,111,120,59,1,10886,114,59,1,10616,111,116,59,1,8919,113,4,2,108,113,10586,10592,101,115,115,59,1,8923,108,101,115,115,59,1,10892,101,115,115,59,1,8823,105,109,59,1,8819,4,2,101,110,10616,10626,114,116,110,101,113,113,59,3,8809,65024,69,59,3,8809,65024,4,10,65,97,98,99,101,102,107,111,115,121,10653,10658,10713,10718,10724,10760,10765,10786,10850,10875,114,114,59,1,8660,4,4,105,108,109,114,10668,10674,10678,10684,114,115,112,59,1,8202,102,59,1,189,105,108,116,59,1,8459,4,2,100,114,10690,10695,99,121,59,1,1098,4,3,59,99,119,10703,10705,10710,1,8596,105,114,59,1,10568,59,1,8621,97,114,59,1,8463,105,114,99,59,1,293,4,3,97,108,114,10732,10748,10754,114,116,115,4,2,59,117,10741,10743,1,9829,105,116,59,1,9829,108,105,112,59,1,8230,99,111,110,59,1,8889,114,59,3,55349,56613,115,4,2,101,119,10772,10779,97,114,111,119,59,1,10533,97,114,111,119,59,1,10534,4,5,97,109,111,112,114,10798,10803,10809,10839,10844,114,114,59,1,8703,116,104,116,59,1,8763,107,4,2,108,114,10816,10827,101,102,116,97,114,114,111,119,59,1,8617,105,103,104,116,97,114,114,111,119,59,1,8618,102,59,3,55349,56665,98,97,114,59,1,8213,4,3,99,108,116,10858,10863,10869,114,59,3,55349,56509,97,115,104,59,1,8463,114,111,107,59,1,295,4,2,98,112,10881,10887,117,108,108,59,1,8259,104,101,110,59,1,8208,4,15,97,99,101,102,103,105,106,109,110,111,112,113,115,116,117,10925,10936,10958,10977,10990,11001,11039,11045,11101,11192,11220,11226,11237,11285,11299,99,117,116,101,5,237,1,59,10934,1,237,4,3,59,105,121,10944,10946,10955,1,8291,114,99,5,238,1,59,10953,1,238,59,1,1080,4,2,99,120,10964,10968,121,59,1,1077,99,108,5,161,1,59,10975,1,161,4,2,102,114,10983,10986,59,1,8660,59,3,55349,56614,114,97,118,101,5,236,1,59,10999,1,236,4,4,59,105,110,111,11011,11013,11028,11034,1,8520,4,2,105,110,11019,11024,110,116,59,1,10764,116,59,1,8749,102,105,110,59,1,10716,116,97,59,1,8489,108,105,103,59,1,307,4,3,97,111,112,11053,11092,11096,4,3,99,103,116,11061,11065,11088,114,59,1,299,4,3,101,108,112,11073,11076,11082,59,1,8465,105,110,101,59,1,8464,97,114,116,59,1,8465,104,59,1,305,102,59,1,8887,101,100,59,1,437,4,5,59,99,102,111,116,11113,11115,11121,11136,11142,1,8712,97,114,101,59,1,8453,105,110,4,2,59,116,11129,11131,1,8734,105,101,59,1,10717,100,111,116,59,1,305,4,5,59,99,101,108,112,11154,11156,11161,11179,11186,1,8747,97,108,59,1,8890,4,2,103,114,11167,11173,101,114,115,59,1,8484,99,97,108,59,1,8890,97,114,104,107,59,1,10775,114,111,100,59,1,10812,4,4,99,103,112,116,11202,11206,11211,11216,121,59,1,1105,111,110,59,1,303,102,59,3,55349,56666,97,59,1,953,114,111,100,59,1,10812,117,101,115,116,5,191,1,59,11235,1,191,4,2,99,105,11243,11248,114,59,3,55349,56510,110,4,5,59,69,100,115,118,11261,11263,11266,11271,11282,1,8712,59,1,8953,111,116,59,1,8949,4,2,59,118,11277,11279,1,8948,59,1,8947,59,1,8712,4,2,59,105,11291,11293,1,8290,108,100,101,59,1,297,4,2,107,109,11305,11310,99,121,59,1,1110,108,5,239,1,59,11316,1,239,4,6,99,102,109,111,115,117,11332,11346,11351,11357,11363,11380,4,2,105,121,11338,11343,114,99,59,1,309,59,1,1081,114,59,3,55349,56615,97,116,104,59,1,567,112,102,59,3,55349,56667,4,2,99,101,11369,11374,114,59,3,55349,56511,114,99,121,59,1,1112,107,99,121,59,1,1108,4,8,97,99,102,103,104,106,111,115,11404,11418,11433,11438,11445,11450,11455,11461,112,112,97,4,2,59,118,11413,11415,1,954,59,1,1008,4,2,101,121,11424,11430,100,105,108,59,1,311,59,1,1082,114,59,3,55349,56616,114,101,101,110,59,1,312,99,121,59,1,1093,99,121,59,1,1116,112,102,59,3,55349,56668,99,114,59,3,55349,56512,4,23,65,66,69,72,97,98,99,100,101,102,103,104,106,108,109,110,111,112,114,115,116,117,118,11515,11538,11544,11555,11560,11721,11780,11818,11868,12136,12160,12171,12203,12208,12246,12275,12327,12509,12523,12569,12641,12732,12752,4,3,97,114,116,11523,11528,11532,114,114,59,1,8666,114,59,1,8656,97,105,108,59,1,10523,97,114,114,59,1,10510,4,2,59,103,11550,11552,1,8806,59,1,10891,97,114,59,1,10594,4,9,99,101,103,109,110,112,113,114,116,11580,11586,11594,11600,11606,11624,11627,11636,11694,117,116,101,59,1,314,109,112,116,121,118,59,1,10676,114,97,110,59,1,8466,98,100,97,59,1,955,103,4,3,59,100,108,11615,11617,11620,1,10216,59,1,10641,101,59,1,10216,59,1,10885,117,111,5,171,1,59,11634,1,171,114,4,8,59,98,102,104,108,112,115,116,11655,11657,11669,11673,11677,11681,11685,11690,1,8592,4,2,59,102,11663,11665,1,8676,115,59,1,10527,115,59,1,10525,107,59,1,8617,112,59,1,8619,108,59,1,10553,105,109,59,1,10611,108,59,1,8610,4,3,59,97,101,11702,11704,11709,1,10923,105,108,59,1,10521,4,2,59,115,11715,11717,1,10925,59,3,10925,65024,4,3,97,98,114,11729,11734,11739,114,114,59,1,10508,114,107,59,1,10098,4,2,97,107,11745,11758,99,4,2,101,107,11752,11755,59,1,123,59,1,91,4,2,101,115,11764,11767,59,1,10635,108,4,2,100,117,11774,11777,59,1,10639,59,1,10637,4,4,97,101,117,121,11790,11796,11811,11815,114,111,110,59,1,318,4,2,100,105,11802,11807,105,108,59,1,316,108,59,1,8968,98,59,1,123,59,1,1083,4,4,99,113,114,115,11828,11832,11845,11864,97,59,1,10550,117,111,4,2,59,114,11840,11842,1,8220,59,1,8222,4,2,100,117,11851,11857,104,97,114,59,1,10599,115,104,97,114,59,1,10571,104,59,1,8626,4,5,59,102,103,113,115,11880,11882,12008,12011,12031,1,8804,116,4,5,97,104,108,114,116,11895,11913,11935,11947,11996,114,114,111,119,4,2,59,116,11905,11907,1,8592,97,105,108,59,1,8610,97,114,112,111,111,110,4,2,100,117,11925,11931,111,119,110,59,1,8637,112,59,1,8636,101,102,116,97,114,114,111,119,115,59,1,8647,105,103,104,116,4,3,97,104,115,11959,11974,11984,114,114,111,119,4,2,59,115,11969,11971,1,8596,59,1,8646,97,114,112,111,111,110,115,59,1,8651,113,117,105,103,97,114,114,111,119,59,1,8621,104,114,101,101,116,105,109,101,115,59,1,8907,59,1,8922,4,3,59,113,115,12019,12021,12024,1,8804,59,1,8806,108,97,110,116,59,1,10877,4,5,59,99,100,103,115,12043,12045,12049,12070,12083,1,10877,99,59,1,10920,111,116,4,2,59,111,12057,12059,1,10879,4,2,59,114,12065,12067,1,10881,59,1,10883,4,2,59,101,12076,12079,3,8922,65024,115,59,1,10899,4,5,97,100,101,103,115,12095,12103,12108,12126,12131,112,112,114,111,120,59,1,10885,111,116,59,1,8918,113,4,2,103,113,12115,12120,116,114,59,1,8922,103,116,114,59,1,10891,116,114,59,1,8822,105,109,59,1,8818,4,3,105,108,114,12144,12150,12156,115,104,116,59,1,10620,111,111,114,59,1,8970,59,3,55349,56617,4,2,59,69,12166,12168,1,8822,59,1,10897,4,2,97,98,12177,12198,114,4,2,100,117,12184,12187,59,1,8637,4,2,59,108,12193,12195,1,8636,59,1,10602,108,107,59,1,9604,99,121,59,1,1113,4,5,59,97,99,104,116,12220,12222,12227,12235,12241,1,8810,114,114,59,1,8647,111,114,110,101,114,59,1,8990,97,114,100,59,1,10603,114,105,59,1,9722,4,2,105,111,12252,12258,100,111,116,59,1,320,117,115,116,4,2,59,97,12267,12269,1,9136,99,104,101,59,1,9136,4,4,69,97,101,115,12285,12288,12303,12322,59,1,8808,112,4,2,59,112,12295,12297,1,10889,114,111,120,59,1,10889,4,2,59,113,12309,12311,1,10887,4,2,59,113,12317,12319,1,10887,59,1,8808,105,109,59,1,8934,4,8,97,98,110,111,112,116,119,122,12345,12359,12364,12421,12446,12467,12474,12490,4,2,110,114,12351,12355,103,59,1,10220,114,59,1,8701,114,107,59,1,10214,103,4,3,108,109,114,12373,12401,12409,101,102,116,4,2,97,114,12382,12389,114,114,111,119,59,1,10229,105,103,104,116,97,114,114,111,119,59,1,10231,97,112,115,116,111,59,1,10236,105,103,104,116,97,114,114,111,119,59,1,10230,112,97,114,114,111,119,4,2,108,114,12433,12439,101,102,116,59,1,8619,105,103,104,116,59,1,8620,4,3,97,102,108,12454,12458,12462,114,59,1,10629,59,3,55349,56669,117,115,59,1,10797,105,109,101,115,59,1,10804,4,2,97,98,12480,12485,115,116,59,1,8727,97,114,59,1,95,4,3,59,101,102,12498,12500,12506,1,9674,110,103,101,59,1,9674,59,1,10731,97,114,4,2,59,108,12517,12519,1,40,116,59,1,10643,4,5,97,99,104,109,116,12535,12540,12548,12561,12564,114,114,59,1,8646,111,114,110,101,114,59,1,8991,97,114,4,2,59,100,12556,12558,1,8651,59,1,10605,59,1,8206,114,105,59,1,8895,4,6,97,99,104,105,113,116,12583,12589,12594,12597,12614,12635,113,117,111,59,1,8249,114,59,3,55349,56513,59,1,8624,109,4,3,59,101,103,12606,12608,12611,1,8818,59,1,10893,59,1,10895,4,2,98,117,12620,12623,59,1,91,111,4,2,59,114,12630,12632,1,8216,59,1,8218,114,111,107,59,1,322,5,60,8,59,99,100,104,105,108,113,114,12660,12662,12675,12680,12686,12692,12698,12705,1,60,4,2,99,105,12668,12671,59,1,10918,114,59,1,10873,111,116,59,1,8918,114,101,101,59,1,8907,109,101,115,59,1,8905,97,114,114,59,1,10614,117,101,115,116,59,1,10875,4,2,80,105,12711,12716,97,114,59,1,10646,4,3,59,101,102,12724,12726,12729,1,9667,59,1,8884,59,1,9666,114,4,2,100,117,12739,12746,115,104,97,114,59,1,10570,104,97,114,59,1,10598,4,2,101,110,12758,12768,114,116,110,101,113,113,59,3,8808,65024,69,59,3,8808,65024,4,14,68,97,99,100,101,102,104,105,108,110,111,112,115,117,12803,12809,12893,12908,12914,12928,12933,12937,13011,13025,13032,13049,13052,13069,68,111,116,59,1,8762,4,4,99,108,112,114,12819,12827,12849,12887,114,5,175,1,59,12825,1,175,4,2,101,116,12833,12836,59,1,9794,4,2,59,101,12842,12844,1,10016,115,101,59,1,10016,4,2,59,115,12855,12857,1,8614,116,111,4,4,59,100,108,117,12869,12871,12877,12883,1,8614,111,119,110,59,1,8615,101,102,116,59,1,8612,112,59,1,8613,107,101,114,59,1,9646,4,2,111,121,12899,12905,109,109,97,59,1,10793,59,1,1084,97,115,104,59,1,8212,97,115,117,114,101,100,97,110,103,108,101,59,1,8737,114,59,3,55349,56618,111,59,1,8487,4,3,99,100,110,12945,12954,12985,114,111,5,181,1,59,12952,1,181,4,4,59,97,99,100,12964,12966,12971,12976,1,8739,115,116,59,1,42,105,114,59,1,10992,111,116,5,183,1,59,12983,1,183,117,115,4,3,59,98,100,12995,12997,13e3,1,8722,59,1,8863,4,2,59,117,13006,13008,1,8760,59,1,10794,4,2,99,100,13017,13021,112,59,1,10971,114,59,1,8230,112,108,117,115,59,1,8723,4,2,100,112,13038,13044,101,108,115,59,1,8871,102,59,3,55349,56670,59,1,8723,4,2,99,116,13058,13063,114,59,3,55349,56514,112,111,115,59,1,8766,4,3,59,108,109,13077,13079,13087,1,956,116,105,109,97,112,59,1,8888,97,112,59,1,8888,4,24,71,76,82,86,97,98,99,100,101,102,103,104,105,106,108,109,111,112,114,115,116,117,118,119,13142,13165,13217,13229,13247,13330,13359,13414,13420,13508,13513,13579,13602,13626,13631,13762,13767,13855,13936,13995,14214,14285,14312,14432,4,2,103,116,13148,13152,59,3,8921,824,4,2,59,118,13158,13161,3,8811,8402,59,3,8811,824,4,3,101,108,116,13173,13200,13204,102,116,4,2,97,114,13181,13188,114,114,111,119,59,1,8653,105,103,104,116,97,114,114,111,119,59,1,8654,59,3,8920,824,4,2,59,118,13210,13213,3,8810,8402,59,3,8810,824,105,103,104,116,97,114,114,111,119,59,1,8655,4,2,68,100,13235,13241,97,115,104,59,1,8879,97,115,104,59,1,8878,4,5,98,99,110,112,116,13259,13264,13270,13275,13308,108,97,59,1,8711,117,116,101,59,1,324,103,59,3,8736,8402,4,5,59,69,105,111,112,13287,13289,13293,13298,13302,1,8777,59,3,10864,824,100,59,3,8779,824,115,59,1,329,114,111,120,59,1,8777,117,114,4,2,59,97,13316,13318,1,9838,108,4,2,59,115,13325,13327,1,9838,59,1,8469,4,2,115,117,13336,13344,112,5,160,1,59,13342,1,160,109,112,4,2,59,101,13352,13355,3,8782,824,59,3,8783,824,4,5,97,101,111,117,121,13371,13385,13391,13407,13411,4,2,112,114,13377,13380,59,1,10819,111,110,59,1,328,100,105,108,59,1,326,110,103,4,2,59,100,13399,13401,1,8775,111,116,59,3,10861,824,112,59,1,10818,59,1,1085,97,115,104,59,1,8211,4,7,59,65,97,100,113,115,120,13436,13438,13443,13466,13472,13478,13494,1,8800,114,114,59,1,8663,114,4,2,104,114,13450,13454,107,59,1,10532,4,2,59,111,13460,13462,1,8599,119,59,1,8599,111,116,59,3,8784,824,117,105,118,59,1,8802,4,2,101,105,13484,13489,97,114,59,1,10536,109,59,3,8770,824,105,115,116,4,2,59,115,13503,13505,1,8708,59,1,8708,114,59,3,55349,56619,4,4,69,101,115,116,13523,13527,13563,13568,59,3,8807,824,4,3,59,113,115,13535,13537,13559,1,8817,4,3,59,113,115,13545,13547,13551,1,8817,59,3,8807,824,108,97,110,116,59,3,10878,824,59,3,10878,824,105,109,59,1,8821,4,2,59,114,13574,13576,1,8815,59,1,8815,4,3,65,97,112,13587,13592,13597,114,114,59,1,8654,114,114,59,1,8622,97,114,59,1,10994,4,3,59,115,118,13610,13612,13623,1,8715,4,2,59,100,13618,13620,1,8956,59,1,8954,59,1,8715,99,121,59,1,1114,4,7,65,69,97,100,101,115,116,13647,13652,13656,13661,13665,13737,13742,114,114,59,1,8653,59,3,8806,824,114,114,59,1,8602,114,59,1,8229,4,4,59,102,113,115,13675,13677,13703,13725,1,8816,116,4,2,97,114,13684,13691,114,114,111,119,59,1,8602,105,103,104,116,97,114,114,111,119,59,1,8622,4,3,59,113,115,13711,13713,13717,1,8816,59,3,8806,824,108,97,110,116,59,3,10877,824,4,2,59,115,13731,13734,3,10877,824,59,1,8814,105,109,59,1,8820,4,2,59,114,13748,13750,1,8814,105,4,2,59,101,13757,13759,1,8938,59,1,8940,105,100,59,1,8740,4,2,112,116,13773,13778,102,59,3,55349,56671,5,172,3,59,105,110,13787,13789,13829,1,172,110,4,4,59,69,100,118,13800,13802,13806,13812,1,8713,59,3,8953,824,111,116,59,3,8949,824,4,3,97,98,99,13820,13823,13826,59,1,8713,59,1,8951,59,1,8950,105,4,2,59,118,13836,13838,1,8716,4,3,97,98,99,13846,13849,13852,59,1,8716,59,1,8958,59,1,8957,4,3,97,111,114,13863,13892,13899,114,4,4,59,97,115,116,13874,13876,13883,13888,1,8742,108,108,101,108,59,1,8742,108,59,3,11005,8421,59,3,8706,824,108,105,110,116,59,1,10772,4,3,59,99,101,13907,13909,13914,1,8832,117,101,59,1,8928,4,2,59,99,13920,13923,3,10927,824,4,2,59,101,13929,13931,1,8832,113,59,3,10927,824,4,4,65,97,105,116,13946,13951,13971,13982,114,114,59,1,8655,114,114,4,3,59,99,119,13961,13963,13967,1,8603,59,3,10547,824,59,3,8605,824,103,104,116,97,114,114,111,119,59,1,8603,114,105,4,2,59,101,13990,13992,1,8939,59,1,8941,4,7,99,104,105,109,112,113,117,14011,14036,14060,14080,14085,14090,14106,4,4,59,99,101,114,14021,14023,14028,14032,1,8833,117,101,59,1,8929,59,3,10928,824,59,3,55349,56515,111,114,116,4,2,109,112,14045,14050,105,100,59,1,8740,97,114,97,108,108,101,108,59,1,8742,109,4,2,59,101,14067,14069,1,8769,4,2,59,113,14075,14077,1,8772,59,1,8772,105,100,59,1,8740,97,114,59,1,8742,115,117,4,2,98,112,14098,14102,101,59,1,8930,101,59,1,8931,4,3,98,99,112,14114,14157,14171,4,4,59,69,101,115,14124,14126,14130,14133,1,8836,59,3,10949,824,59,1,8840,101,116,4,2,59,101,14141,14144,3,8834,8402,113,4,2,59,113,14151,14153,1,8840,59,3,10949,824,99,4,2,59,101,14164,14166,1,8833,113,59,3,10928,824,4,4,59,69,101,115,14181,14183,14187,14190,1,8837,59,3,10950,824,59,1,8841,101,116,4,2,59,101,14198,14201,3,8835,8402,113,4,2,59,113,14208,14210,1,8841,59,3,10950,824,4,4,103,105,108,114,14224,14228,14238,14242,108,59,1,8825,108,100,101,5,241,1,59,14236,1,241,103,59,1,8824,105,97,110,103,108,101,4,2,108,114,14254,14269,101,102,116,4,2,59,101,14263,14265,1,8938,113,59,1,8940,105,103,104,116,4,2,59,101,14279,14281,1,8939,113,59,1,8941,4,2,59,109,14291,14293,1,957,4,3,59,101,115,14301,14303,14308,1,35,114,111,59,1,8470,112,59,1,8199,4,9,68,72,97,100,103,105,108,114,115,14332,14338,14344,14349,14355,14369,14376,14408,14426,97,115,104,59,1,8877,97,114,114,59,1,10500,112,59,3,8781,8402,97,115,104,59,1,8876,4,2,101,116,14361,14365,59,3,8805,8402,59,3,62,8402,110,102,105,110,59,1,10718,4,3,65,101,116,14384,14389,14393,114,114,59,1,10498,59,3,8804,8402,4,2,59,114,14399,14402,3,60,8402,105,101,59,3,8884,8402,4,2,65,116,14414,14419,114,114,59,1,10499,114,105,101,59,3,8885,8402,105,109,59,3,8764,8402,4,3,65,97,110,14440,14445,14468,114,114,59,1,8662,114,4,2,104,114,14452,14456,107,59,1,10531,4,2,59,111,14462,14464,1,8598,119,59,1,8598,101,97,114,59,1,10535,4,18,83,97,99,100,101,102,103,104,105,108,109,111,112,114,115,116,117,118,14512,14515,14535,14560,14597,14603,14618,14643,14657,14662,14701,14741,14747,14769,14851,14877,14907,14916,59,1,9416,4,2,99,115,14521,14531,117,116,101,5,243,1,59,14529,1,243,116,59,1,8859,4,2,105,121,14541,14557,114,4,2,59,99,14548,14550,1,8858,5,244,1,59,14555,1,244,59,1,1086,4,5,97,98,105,111,115,14572,14577,14583,14587,14591,115,104,59,1,8861,108,97,99,59,1,337,118,59,1,10808,116,59,1,8857,111,108,100,59,1,10684,108,105,103,59,1,339,4,2,99,114,14609,14614,105,114,59,1,10687,59,3,55349,56620,4,3,111,114,116,14626,14630,14640,110,59,1,731,97,118,101,5,242,1,59,14638,1,242,59,1,10689,4,2,98,109,14649,14654,97,114,59,1,10677,59,1,937,110,116,59,1,8750,4,4,97,99,105,116,14672,14677,14693,14698,114,114,59,1,8634,4,2,105,114,14683,14687,114,59,1,10686,111,115,115,59,1,10683,110,101,59,1,8254,59,1,10688,4,3,97,101,105,14709,14714,14719,99,114,59,1,333,103,97,59,1,969,4,3,99,100,110,14727,14733,14736,114,111,110,59,1,959,59,1,10678,117,115,59,1,8854,112,102,59,3,55349,56672,4,3,97,101,108,14755,14759,14764,114,59,1,10679,114,112,59,1,10681,117,115,59,1,8853,4,7,59,97,100,105,111,115,118,14785,14787,14792,14831,14837,14841,14848,1,8744,114,114,59,1,8635,4,4,59,101,102,109,14802,14804,14817,14824,1,10845,114,4,2,59,111,14811,14813,1,8500,102,59,1,8500,5,170,1,59,14822,1,170,5,186,1,59,14829,1,186,103,111,102,59,1,8886,114,59,1,10838,108,111,112,101,59,1,10839,59,1,10843,4,3,99,108,111,14859,14863,14873,114,59,1,8500,97,115,104,5,248,1,59,14871,1,248,108,59,1,8856,105,4,2,108,109,14884,14893,100,101,5,245,1,59,14891,1,245,101,115,4,2,59,97,14901,14903,1,8855,115,59,1,10806,109,108,5,246,1,59,14914,1,246,98,97,114,59,1,9021,4,12,97,99,101,102,104,105,108,109,111,114,115,117,14948,14992,14996,15033,15038,15068,15090,15189,15192,15222,15427,15441,114,4,4,59,97,115,116,14959,14961,14976,14989,1,8741,5,182,2,59,108,14968,14970,1,182,108,101,108,59,1,8741,4,2,105,108,14982,14986,109,59,1,10995,59,1,11005,59,1,8706,121,59,1,1087,114,4,5,99,105,109,112,116,15009,15014,15019,15024,15027,110,116,59,1,37,111,100,59,1,46,105,108,59,1,8240,59,1,8869,101,110,107,59,1,8241,114,59,3,55349,56621,4,3,105,109,111,15046,15057,15063,4,2,59,118,15052,15054,1,966,59,1,981,109,97,116,59,1,8499,110,101,59,1,9742,4,3,59,116,118,15076,15078,15087,1,960,99,104,102,111,114,107,59,1,8916,59,1,982,4,2,97,117,15096,15119,110,4,2,99,107,15103,15115,107,4,2,59,104,15110,15112,1,8463,59,1,8462,118,59,1,8463,115,4,9,59,97,98,99,100,101,109,115,116,15140,15142,15148,15151,15156,15168,15171,15179,15184,1,43,99,105,114,59,1,10787,59,1,8862,105,114,59,1,10786,4,2,111,117,15162,15165,59,1,8724,59,1,10789,59,1,10866,110,5,177,1,59,15177,1,177,105,109,59,1,10790,119,111,59,1,10791,59,1,177,4,3,105,112,117,15200,15208,15213,110,116,105,110,116,59,1,10773,102,59,3,55349,56673,110,100,5,163,1,59,15220,1,163,4,10,59,69,97,99,101,105,110,111,115,117,15244,15246,15249,15253,15258,15334,15347,15367,15416,15421,1,8826,59,1,10931,112,59,1,10935,117,101,59,1,8828,4,2,59,99,15264,15266,1,10927,4,6,59,97,99,101,110,115,15280,15282,15290,15299,15303,15329,1,8826,112,112,114,111,120,59,1,10935,117,114,108,121,101,113,59,1,8828,113,59,1,10927,4,3,97,101,115,15311,15319,15324,112,112,114,111,120,59,1,10937,113,113,59,1,10933,105,109,59,1,8936,105,109,59,1,8830,109,101,4,2,59,115,15342,15344,1,8242,59,1,8473,4,3,69,97,115,15355,15358,15362,59,1,10933,112,59,1,10937,105,109,59,1,8936,4,3,100,102,112,15375,15378,15404,59,1,8719,4,3,97,108,115,15386,15392,15398,108,97,114,59,1,9006,105,110,101,59,1,8978,117,114,102,59,1,8979,4,2,59,116,15410,15412,1,8733,111,59,1,8733,105,109,59,1,8830,114,101,108,59,1,8880,4,2,99,105,15433,15438,114,59,3,55349,56517,59,1,968,110,99,115,112,59,1,8200,4,6,102,105,111,112,115,117,15462,15467,15472,15478,15485,15491,114,59,3,55349,56622,110,116,59,1,10764,112,102,59,3,55349,56674,114,105,109,101,59,1,8279,99,114,59,3,55349,56518,4,3,97,101,111,15499,15520,15534,116,4,2,101,105,15506,15515,114,110,105,111,110,115,59,1,8461,110,116,59,1,10774,115,116,4,2,59,101,15528,15530,1,63,113,59,1,8799,116,5,34,1,59,15540,1,34,4,21,65,66,72,97,98,99,100,101,102,104,105,108,109,110,111,112,114,115,116,117,120,15586,15609,15615,15620,15796,15855,15893,15931,15977,16001,16039,16183,16204,16222,16228,16285,16312,16318,16363,16408,16416,4,3,97,114,116,15594,15599,15603,114,114,59,1,8667,114,59,1,8658,97,105,108,59,1,10524,97,114,114,59,1,10511,97,114,59,1,10596,4,7,99,100,101,110,113,114,116,15636,15651,15656,15664,15687,15696,15770,4,2,101,117,15642,15646,59,3,8765,817,116,101,59,1,341,105,99,59,1,8730,109,112,116,121,118,59,1,10675,103,4,4,59,100,101,108,15675,15677,15680,15683,1,10217,59,1,10642,59,1,10661,101,59,1,10217,117,111,5,187,1,59,15694,1,187,114,4,11,59,97,98,99,102,104,108,112,115,116,119,15721,15723,15727,15739,15742,15746,15750,15754,15758,15763,15767,1,8594,112,59,1,10613,4,2,59,102,15733,15735,1,8677,115,59,1,10528,59,1,10547,115,59,1,10526,107,59,1,8618,112,59,1,8620,108,59,1,10565,105,109,59,1,10612,108,59,1,8611,59,1,8605,4,2,97,105,15776,15781,105,108,59,1,10522,111,4,2,59,110,15788,15790,1,8758,97,108,115,59,1,8474,4,3,97,98,114,15804,15809,15814,114,114,59,1,10509,114,107,59,1,10099,4,2,97,107,15820,15833,99,4,2,101,107,15827,15830,59,1,125,59,1,93,4,2,101,115,15839,15842,59,1,10636,108,4,2,100,117,15849,15852,59,1,10638,59,1,10640,4,4,97,101,117,121,15865,15871,15886,15890,114,111,110,59,1,345,4,2,100,105,15877,15882,105,108,59,1,343,108,59,1,8969,98,59,1,125,59,1,1088,4,4,99,108,113,115,15903,15907,15914,15927,97,59,1,10551,100,104,97,114,59,1,10601,117,111,4,2,59,114,15922,15924,1,8221,59,1,8221,104,59,1,8627,4,3,97,99,103,15939,15966,15970,108,4,4,59,105,112,115,15950,15952,15957,15963,1,8476,110,101,59,1,8475,97,114,116,59,1,8476,59,1,8477,116,59,1,9645,5,174,1,59,15975,1,174,4,3,105,108,114,15985,15991,15997,115,104,116,59,1,10621,111,111,114,59,1,8971,59,3,55349,56623,4,2,97,111,16007,16028,114,4,2,100,117,16014,16017,59,1,8641,4,2,59,108,16023,16025,1,8640,59,1,10604,4,2,59,118,16034,16036,1,961,59,1,1009,4,3,103,110,115,16047,16167,16171,104,116,4,6,97,104,108,114,115,116,16063,16081,16103,16130,16143,16155,114,114,111,119,4,2,59,116,16073,16075,1,8594,97,105,108,59,1,8611,97,114,112,111,111,110,4,2,100,117,16093,16099,111,119,110,59,1,8641,112,59,1,8640,101,102,116,4,2,97,104,16112,16120,114,114,111,119,115,59,1,8644,97,114,112,111,111,110,115,59,1,8652,105,103,104,116,97,114,114,111,119,115,59,1,8649,113,117,105,103,97,114,114,111,119,59,1,8605,104,114,101,101,116,105,109,101,115,59,1,8908,103,59,1,730,105,110,103,100,111,116,115,101,113,59,1,8787,4,3,97,104,109,16191,16196,16201,114,114,59,1,8644,97,114,59,1,8652,59,1,8207,111,117,115,116,4,2,59,97,16214,16216,1,9137,99,104,101,59,1,9137,109,105,100,59,1,10990,4,4,97,98,112,116,16238,16252,16257,16278,4,2,110,114,16244,16248,103,59,1,10221,114,59,1,8702,114,107,59,1,10215,4,3,97,102,108,16265,16269,16273,114,59,1,10630,59,3,55349,56675,117,115,59,1,10798,105,109,101,115,59,1,10805,4,2,97,112,16291,16304,114,4,2,59,103,16298,16300,1,41,116,59,1,10644,111,108,105,110,116,59,1,10770,97,114,114,59,1,8649,4,4,97,99,104,113,16328,16334,16339,16342,113,117,111,59,1,8250,114,59,3,55349,56519,59,1,8625,4,2,98,117,16348,16351,59,1,93,111,4,2,59,114,16358,16360,1,8217,59,1,8217,4,3,104,105,114,16371,16377,16383,114,101,101,59,1,8908,109,101,115,59,1,8906,105,4,4,59,101,102,108,16394,16396,16399,16402,1,9657,59,1,8885,59,1,9656,116,114,105,59,1,10702,108,117,104,97,114,59,1,10600,59,1,8478,4,19,97,98,99,100,101,102,104,105,108,109,111,112,113,114,115,116,117,119,122,16459,16466,16472,16572,16590,16672,16687,16746,16844,16850,16924,16963,16988,17115,17121,17154,17206,17614,17656,99,117,116,101,59,1,347,113,117,111,59,1,8218,4,10,59,69,97,99,101,105,110,112,115,121,16494,16496,16499,16513,16518,16531,16536,16556,16564,16569,1,8827,59,1,10932,4,2,112,114,16505,16508,59,1,10936,111,110,59,1,353,117,101,59,1,8829,4,2,59,100,16524,16526,1,10928,105,108,59,1,351,114,99,59,1,349,4,3,69,97,115,16544,16547,16551,59,1,10934,112,59,1,10938,105,109,59,1,8937,111,108,105,110,116,59,1,10771,105,109,59,1,8831,59,1,1089,111,116,4,3,59,98,101,16582,16584,16587,1,8901,59,1,8865,59,1,10854,4,7,65,97,99,109,115,116,120,16606,16611,16634,16642,16646,16652,16668,114,114,59,1,8664,114,4,2,104,114,16618,16622,107,59,1,10533,4,2,59,111,16628,16630,1,8600,119,59,1,8600,116,5,167,1,59,16640,1,167,105,59,1,59,119,97,114,59,1,10537,109,4,2,105,110,16659,16665,110,117,115,59,1,8726,59,1,8726,116,59,1,10038,114,4,2,59,111,16679,16682,3,55349,56624,119,110,59,1,8994,4,4,97,99,111,121,16697,16702,16716,16739,114,112,59,1,9839,4,2,104,121,16708,16713,99,121,59,1,1097,59,1,1096,114,116,4,2,109,112,16724,16729,105,100,59,1,8739,97,114,97,108,108,101,108,59,1,8741,5,173,1,59,16744,1,173,4,2,103,109,16752,16770,109,97,4,3,59,102,118,16762,16764,16767,1,963,59,1,962,59,1,962,4,8,59,100,101,103,108,110,112,114,16788,16790,16795,16806,16817,16828,16832,16838,1,8764,111,116,59,1,10858,4,2,59,113,16801,16803,1,8771,59,1,8771,4,2,59,69,16812,16814,1,10910,59,1,10912,4,2,59,69,16823,16825,1,10909,59,1,10911,101,59,1,8774,108,117,115,59,1,10788,97,114,114,59,1,10610,97,114,114,59,1,8592,4,4,97,101,105,116,16860,16883,16891,16904,4,2,108,115,16866,16878,108,115,101,116,109,105,110,117,115,59,1,8726,104,112,59,1,10803,112,97,114,115,108,59,1,10724,4,2,100,108,16897,16900,59,1,8739,101,59,1,8995,4,2,59,101,16910,16912,1,10922,4,2,59,115,16918,16920,1,10924,59,3,10924,65024,4,3,102,108,112,16932,16938,16958,116,99,121,59,1,1100,4,2,59,98,16944,16946,1,47,4,2,59,97,16952,16954,1,10692,114,59,1,9023,102,59,3,55349,56676,97,4,2,100,114,16970,16985,101,115,4,2,59,117,16978,16980,1,9824,105,116,59,1,9824,59,1,8741,4,3,99,115,117,16996,17028,17089,4,2,97,117,17002,17015,112,4,2,59,115,17009,17011,1,8851,59,3,8851,65024,112,4,2,59,115,17022,17024,1,8852,59,3,8852,65024,117,4,2,98,112,17035,17062,4,3,59,101,115,17043,17045,17048,1,8847,59,1,8849,101,116,4,2,59,101,17056,17058,1,8847,113,59,1,8849,4,3,59,101,115,17070,17072,17075,1,8848,59,1,8850,101,116,4,2,59,101,17083,17085,1,8848,113,59,1,8850,4,3,59,97,102,17097,17099,17112,1,9633,114,4,2,101,102,17106,17109,59,1,9633,59,1,9642,59,1,9642,97,114,114,59,1,8594,4,4,99,101,109,116,17131,17136,17142,17148,114,59,3,55349,56520,116,109,110,59,1,8726,105,108,101,59,1,8995,97,114,102,59,1,8902,4,2,97,114,17160,17172,114,4,2,59,102,17167,17169,1,9734,59,1,9733,4,2,97,110,17178,17202,105,103,104,116,4,2,101,112,17188,17197,112,115,105,108,111,110,59,1,1013,104,105,59,1,981,115,59,1,175,4,5,98,99,109,110,112,17218,17351,17420,17423,17427,4,9,59,69,100,101,109,110,112,114,115,17238,17240,17243,17248,17261,17267,17279,17285,17291,1,8834,59,1,10949,111,116,59,1,10941,4,2,59,100,17254,17256,1,8838,111,116,59,1,10947,117,108,116,59,1,10945,4,2,69,101,17273,17276,59,1,10955,59,1,8842,108,117,115,59,1,10943,97,114,114,59,1,10617,4,3,101,105,117,17299,17335,17339,116,4,3,59,101,110,17308,17310,17322,1,8834,113,4,2,59,113,17317,17319,1,8838,59,1,10949,101,113,4,2,59,113,17330,17332,1,8842,59,1,10955,109,59,1,10951,4,2,98,112,17345,17348,59,1,10965,59,1,10963,99,4,6,59,97,99,101,110,115,17366,17368,17376,17385,17389,17415,1,8827,112,112,114,111,120,59,1,10936,117,114,108,121,101,113,59,1,8829,113,59,1,10928,4,3,97,101,115,17397,17405,17410,112,112,114,111,120,59,1,10938,113,113,59,1,10934,105,109,59,1,8937,105,109,59,1,8831,59,1,8721,103,59,1,9834,4,13,49,50,51,59,69,100,101,104,108,109,110,112,115,17455,17462,17469,17476,17478,17481,17496,17509,17524,17530,17536,17548,17554,5,185,1,59,17460,1,185,5,178,1,59,17467,1,178,5,179,1,59,17474,1,179,1,8835,59,1,10950,4,2,111,115,17487,17491,116,59,1,10942,117,98,59,1,10968,4,2,59,100,17502,17504,1,8839,111,116,59,1,10948,115,4,2,111,117,17516,17520,108,59,1,10185,98,59,1,10967,97,114,114,59,1,10619,117,108,116,59,1,10946,4,2,69,101,17542,17545,59,1,10956,59,1,8843,108,117,115,59,1,10944,4,3,101,105,117,17562,17598,17602,116,4,3,59,101,110,17571,17573,17585,1,8835,113,4,2,59,113,17580,17582,1,8839,59,1,10950,101,113,4,2,59,113,17593,17595,1,8843,59,1,10956,109,59,1,10952,4,2,98,112,17608,17611,59,1,10964,59,1,10966,4,3,65,97,110,17622,17627,17650,114,114,59,1,8665,114,4,2,104,114,17634,17638,107,59,1,10534,4,2,59,111,17644,17646,1,8601,119,59,1,8601,119,97,114,59,1,10538,108,105,103,5,223,1,59,17664,1,223,4,13,97,98,99,100,101,102,104,105,111,112,114,115,119,17694,17709,17714,17737,17742,17749,17754,17860,17905,17957,17964,18090,18122,4,2,114,117,17700,17706,103,101,116,59,1,8982,59,1,964,114,107,59,1,9140,4,3,97,101,121,17722,17728,17734,114,111,110,59,1,357,100,105,108,59,1,355,59,1,1090,111,116,59,1,8411,108,114,101,99,59,1,8981,114,59,3,55349,56625,4,4,101,105,107,111,17764,17805,17836,17851,4,2,114,116,17770,17786,101,4,2,52,102,17777,17780,59,1,8756,111,114,101,59,1,8756,97,4,3,59,115,118,17795,17797,17802,1,952,121,109,59,1,977,59,1,977,4,2,99,110,17811,17831,107,4,2,97,115,17818,17826,112,112,114,111,120,59,1,8776,105,109,59,1,8764,115,112,59,1,8201,4,2,97,115,17842,17846,112,59,1,8776,105,109,59,1,8764,114,110,5,254,1,59,17858,1,254,4,3,108,109,110,17868,17873,17901,100,101,59,1,732,101,115,5,215,3,59,98,100,17884,17886,17898,1,215,4,2,59,97,17892,17894,1,8864,114,59,1,10801,59,1,10800,116,59,1,8749,4,3,101,112,115,17913,17917,17953,97,59,1,10536,4,4,59,98,99,102,17927,17929,17934,17939,1,8868,111,116,59,1,9014,105,114,59,1,10993,4,2,59,111,17945,17948,3,55349,56677,114,107,59,1,10970,97,59,1,10537,114,105,109,101,59,1,8244,4,3,97,105,112,17972,17977,18082,100,101,59,1,8482,4,7,97,100,101,109,112,115,116,17993,18051,18056,18059,18066,18072,18076,110,103,108,101,4,5,59,100,108,113,114,18009,18011,18017,18032,18035,1,9653,111,119,110,59,1,9663,101,102,116,4,2,59,101,18026,18028,1,9667,113,59,1,8884,59,1,8796,105,103,104,116,4,2,59,101,18045,18047,1,9657,113,59,1,8885,111,116,59,1,9708,59,1,8796,105,110,117,115,59,1,10810,108,117,115,59,1,10809,98,59,1,10701,105,109,101,59,1,10811,101,122,105,117,109,59,1,9186,4,3,99,104,116,18098,18111,18116,4,2,114,121,18104,18108,59,3,55349,56521,59,1,1094,99,121,59,1,1115,114,111,107,59,1,359,4,2,105,111,18128,18133,120,116,59,1,8812,104,101,97,100,4,2,108,114,18143,18154,101,102,116,97,114,114,111,119,59,1,8606,105,103,104,116,97,114,114,111,119,59,1,8608,4,18,65,72,97,98,99,100,102,103,104,108,109,111,112,114,115,116,117,119,18204,18209,18214,18234,18250,18268,18292,18308,18319,18343,18379,18397,18413,18504,18547,18553,18584,18603,114,114,59,1,8657,97,114,59,1,10595,4,2,99,114,18220,18230,117,116,101,5,250,1,59,18228,1,250,114,59,1,8593,114,4,2,99,101,18241,18245,121,59,1,1118,118,101,59,1,365,4,2,105,121,18256,18265,114,99,5,251,1,59,18263,1,251,59,1,1091,4,3,97,98,104,18276,18281,18287,114,114,59,1,8645,108,97,99,59,1,369,97,114,59,1,10606,4,2,105,114,18298,18304,115,104,116,59,1,10622,59,3,55349,56626,114,97,118,101,5,249,1,59,18317,1,249,4,2,97,98,18325,18338,114,4,2,108,114,18332,18335,59,1,8639,59,1,8638,108,107,59,1,9600,4,2,99,116,18349,18374,4,2,111,114,18355,18369,114,110,4,2,59,101,18363,18365,1,8988,114,59,1,8988,111,112,59,1,8975,114,105,59,1,9720,4,2,97,108,18385,18390,99,114,59,1,363,5,168,1,59,18395,1,168,4,2,103,112,18403,18408,111,110,59,1,371,102,59,3,55349,56678,4,6,97,100,104,108,115,117,18427,18434,18445,18470,18475,18494,114,114,111,119,59,1,8593,111,119,110,97,114,114,111,119,59,1,8597,97,114,112,111,111,110,4,2,108,114,18457,18463,101,102,116,59,1,8639,105,103,104,116,59,1,8638,117,115,59,1,8846,105,4,3,59,104,108,18484,18486,18489,1,965,59,1,978,111,110,59,1,965,112,97,114,114,111,119,115,59,1,8648,4,3,99,105,116,18512,18537,18542,4,2,111,114,18518,18532,114,110,4,2,59,101,18526,18528,1,8989,114,59,1,8989,111,112,59,1,8974,110,103,59,1,367,114,105,59,1,9721,99,114,59,3,55349,56522,4,3,100,105,114,18561,18566,18572,111,116,59,1,8944,108,100,101,59,1,361,105,4,2,59,102,18579,18581,1,9653,59,1,9652,4,2,97,109,18590,18595,114,114,59,1,8648,108,5,252,1,59,18601,1,252,97,110,103,108,101,59,1,10663,4,15,65,66,68,97,99,100,101,102,108,110,111,112,114,115,122,18643,18648,18661,18667,18847,18851,18857,18904,18909,18915,18931,18937,18943,18949,18996,114,114,59,1,8661,97,114,4,2,59,118,18656,18658,1,10984,59,1,10985,97,115,104,59,1,8872,4,2,110,114,18673,18679,103,114,116,59,1,10652,4,7,101,107,110,112,114,115,116,18695,18704,18711,18720,18742,18754,18810,112,115,105,108,111,110,59,1,1013,97,112,112,97,59,1,1008,111,116,104,105,110,103,59,1,8709,4,3,104,105,114,18728,18732,18735,105,59,1,981,59,1,982,111,112,116,111,59,1,8733,4,2,59,104,18748,18750,1,8597,111,59,1,1009,4,2,105,117,18760,18766,103,109,97,59,1,962,4,2,98,112,18772,18791,115,101,116,110,101,113,4,2,59,113,18784,18787,3,8842,65024,59,3,10955,65024,115,101,116,110,101,113,4,2,59,113,18803,18806,3,8843,65024,59,3,10956,65024,4,2,104,114,18816,18822,101,116,97,59,1,977,105,97,110,103,108,101,4,2,108,114,18834,18840,101,102,116,59,1,8882,105,103,104,116,59,1,8883,121,59,1,1074,97,115,104,59,1,8866,4,3,101,108,114,18865,18884,18890,4,3,59,98,101,18873,18875,18880,1,8744,97,114,59,1,8891,113,59,1,8794,108,105,112,59,1,8942,4,2,98,116,18896,18901,97,114,59,1,124,59,1,124,114,59,3,55349,56627,116,114,105,59,1,8882,115,117,4,2,98,112,18923,18927,59,3,8834,8402,59,3,8835,8402,112,102,59,3,55349,56679,114,111,112,59,1,8733,116,114,105,59,1,8883,4,2,99,117,18955,18960,114,59,3,55349,56523,4,2,98,112,18966,18981,110,4,2,69,101,18973,18977,59,3,10955,65024,59,3,8842,65024,110,4,2,69,101,18988,18992,59,3,10956,65024,59,3,8843,65024,105,103,122,97,103,59,1,10650,4,7,99,101,102,111,112,114,115,19020,19026,19061,19066,19072,19075,19089,105,114,99,59,1,373,4,2,100,105,19032,19055,4,2,98,103,19038,19043,97,114,59,1,10847,101,4,2,59,113,19050,19052,1,8743,59,1,8793,101,114,112,59,1,8472,114,59,3,55349,56628,112,102,59,3,55349,56680,59,1,8472,4,2,59,101,19081,19083,1,8768,97,116,104,59,1,8768,99,114,59,3,55349,56524,4,14,99,100,102,104,105,108,109,110,111,114,115,117,118,119,19125,19146,19152,19157,19173,19176,19192,19197,19202,19236,19252,19269,19286,19291,4,3,97,105,117,19133,19137,19142,112,59,1,8898,114,99,59,1,9711,112,59,1,8899,116,114,105,59,1,9661,114,59,3,55349,56629,4,2,65,97,19163,19168,114,114,59,1,10234,114,114,59,1,10231,59,1,958,4,2,65,97,19182,19187,114,114,59,1,10232,114,114,59,1,10229,97,112,59,1,10236,105,115,59,1,8955,4,3,100,112,116,19210,19215,19230,111,116,59,1,10752,4,2,102,108,19221,19225,59,3,55349,56681,117,115,59,1,10753,105,109,101,59,1,10754,4,2,65,97,19242,19247,114,114,59,1,10233,114,114,59,1,10230,4,2,99,113,19258,19263,114,59,3,55349,56525,99,117,112,59,1,10758,4,2,112,116,19275,19281,108,117,115,59,1,10756,114,105,59,1,9651,101,101,59,1,8897,101,100,103,101,59,1,8896,4,8,97,99,101,102,105,111,115,117,19316,19335,19349,19357,19362,19367,19373,19379,99,4,2,117,121,19323,19332,116,101,5,253,1,59,19330,1,253,59,1,1103,4,2,105,121,19341,19346,114,99,59,1,375,59,1,1099,110,5,165,1,59,19355,1,165,114,59,3,55349,56630,99,121,59,1,1111,112,102,59,3,55349,56682,99,114,59,3,55349,56526,4,2,99,109,19385,19389,121,59,1,1102,108,5,255,1,59,19395,1,255,4,10,97,99,100,101,102,104,105,111,115,119,19419,19426,19441,19446,19462,19467,19472,19480,19486,19492,99,117,116,101,59,1,378,4,2,97,121,19432,19438,114,111,110,59,1,382,59,1,1079,111,116,59,1,380,4,2,101,116,19452,19458,116,114,102,59,1,8488,97,59,1,950,114,59,3,55349,56631,99,121,59,1,1078,103,114,97,114,114,59,1,8669,112,102,59,3,55349,56683,99,114,59,3,55349,56527,4,2,106,110,19498,19501,59,1,8205,106,59,1,8204]);const Oe=s,Se=r,Ce={128:8364,130:8218,131:402,132:8222,133:8230,134:8224,135:8225,136:710,137:8240,138:352,139:8249,140:338,142:381,145:8216,146:8217,147:8220,148:8221,149:8226,150:8211,151:8212,152:732,153:8482,154:353,155:8250,156:339,158:382,159:376},de="DATA_STATE";function Re(e){return e===Oe.SPACE||e===Oe.LINE_FEED||e===Oe.TABULATION||e===Oe.FORM_FEED}function Ie(e){return e>=Oe.DIGIT_0&&e<=Oe.DIGIT_9}function fe(e){return e>=Oe.LATIN_CAPITAL_A&&e<=Oe.LATIN_CAPITAL_Z}function Me(e){return e>=Oe.LATIN_SMALL_A&&e<=Oe.LATIN_SMALL_Z}function Le(e){return Me(e)||fe(e)}function De(e){return Le(e)||Ie(e)}function ge(e){return e>=Oe.LATIN_CAPITAL_A&&e<=Oe.LATIN_CAPITAL_F}function Pe(e){return e>=Oe.LATIN_SMALL_A&&e<=Oe.LATIN_SMALL_F}function ke(e){return e+32}function He(e){return e<=65535?String.fromCharCode(e):(e-=65536,String.fromCharCode(e>>>10&1023|55296)+String.fromCharCode(56320|1023&e))}function Ue(e){return String.fromCharCode(ke(e))}function Fe(e,t){const n=ue[++e];let s=++e,r=s+n-1;for(;s<=r;){const e=s+r>>>1,i=ue[e];if(i<t)s=e+1;else {if(!(i>t))return ue[e+n];r=e-1;}}return -1}class Be{constructor(){this.preprocessor=new Ne,this.tokenQueue=[],this.allowCDATA=!1,this.state=de,this.returnState="",this.charRefCode=-1,this.tempBuff=[],this.lastStartTagName="",this.consumedAfterSnapshot=-1,this.active=!1,this.currentCharacterToken=null,this.currentToken=null,this.currentAttr=null;}_err(){}_errOnNextCodePoint(e){this._consume(),this._err(e),this._unconsume();}getNextToken(){for(;!this.tokenQueue.length&&this.active;){this.consumedAfterSnapshot=0;const e=this._consume();this._ensureHibernation()||this[this.state](e);}return this.tokenQueue.shift()}write(e,t){this.active=!0,this.preprocessor.write(e,t);}insertHtmlAtCurrentPos(e){this.active=!0,this.preprocessor.insertHtmlAtCurrentPos(e);}_ensureHibernation(){if(this.preprocessor.endOfChunkHit){for(;this.consumedAfterSnapshot>0;this.consumedAfterSnapshot--)this.preprocessor.retreat();return this.active=!1,this.tokenQueue.push({type:Be.HIBERNATION_TOKEN}),!0}return !1}_consume(){return this.consumedAfterSnapshot++,this.preprocessor.advance()}_unconsume(){this.consumedAfterSnapshot--,this.preprocessor.retreat();}_reconsumeInState(e){this.state=e,this._unconsume();}_consumeSequenceIfMatch(e,t,n){let s=0,r=!0;const i=e.length;let T=0,o=t,E=void 0;for(;T<i;T++){if(T>0&&(o=this._consume(),s++),o===Oe.EOF){r=!1;break}if(E=e[T],o!==E&&(n||o!==ke(E))){r=!1;break}}if(!r)for(;s--;)this._unconsume();return r}_isTempBufferEqualToScriptString(){if(this.tempBuff.length!==Se.SCRIPT_STRING.length)return !1;for(let e=0;e<this.tempBuff.length;e++)if(this.tempBuff[e]!==Se.SCRIPT_STRING[e])return !1;return !0}_createStartTagToken(){this.currentToken={type:Be.START_TAG_TOKEN,tagName:"",selfClosing:!1,ackSelfClosing:!1,attrs:[]};}_createEndTagToken(){this.currentToken={type:Be.END_TAG_TOKEN,tagName:"",selfClosing:!1,attrs:[]};}_createCommentToken(){this.currentToken={type:Be.COMMENT_TOKEN,data:""};}_createDoctypeToken(e){this.currentToken={type:Be.DOCTYPE_TOKEN,name:e,forceQuirks:!1,publicId:null,systemId:null};}_createCharacterToken(e,t){this.currentCharacterToken={type:e,chars:t};}_createEOFToken(){this.currentToken={type:Be.EOF_TOKEN};}_createAttr(e){this.currentAttr={name:e,value:""};}_leaveAttrName(e){null===Be.getTokenAttr(this.currentToken,this.currentAttr.name)?this.currentToken.attrs.push(this.currentAttr):this._err(re),this.state=e;}_leaveAttrValue(e){this.state=e;}_emitCurrentToken(){this._emitCurrentCharacterToken();const e=this.currentToken;this.currentToken=null,e.type===Be.START_TAG_TOKEN?this.lastStartTagName=e.tagName:e.type===Be.END_TAG_TOKEN&&(e.attrs.length>0&&this._err(l),e.selfClosing&&this._err(m)),this.tokenQueue.push(e);}_emitCurrentCharacterToken(){this.currentCharacterToken&&(this.tokenQueue.push(this.currentCharacterToken),this.currentCharacterToken=null);}_emitEOFToken(){this._createEOFToken(),this._emitCurrentToken();}_appendCharToCurrentCharacterToken(e,t){this.currentCharacterToken&&this.currentCharacterToken.type!==e&&this._emitCurrentCharacterToken(),this.currentCharacterToken?this.currentCharacterToken.chars+=t:this._createCharacterToken(e,t);}_emitCodePoint(e){let t=Be.CHARACTER_TOKEN;Re(e)?t=Be.WHITESPACE_CHARACTER_TOKEN:e===Oe.NULL&&(t=Be.NULL_CHARACTER_TOKEN),this._appendCharToCurrentCharacterToken(t,He(e));}_emitSeveralCodePoints(e){for(let t=0;t<e.length;t++)this._emitCodePoint(e[t]);}_emitChars(e){this._appendCharToCurrentCharacterToken(Be.CHARACTER_TOKEN,e);}_matchNamedCharacterReference(e){let t=null,n=1,s=Fe(0,e);for(this.tempBuff.push(e);s>-1;){const e=ue[s],r=e<7;r&&1&e&&(t=2&e?[ue[++s],ue[++s]]:[ue[++s]],n=0);const i=this._consume();if(this.tempBuff.push(i),n++,i===Oe.EOF)break;s=r?4&e?Fe(s,i):-1:i===e?++s:-1;}for(;n--;)this.tempBuff.pop(),this._unconsume();return t}_isCharacterReferenceInAttribute(){return "ATTRIBUTE_VALUE_DOUBLE_QUOTED_STATE"===this.returnState||"ATTRIBUTE_VALUE_SINGLE_QUOTED_STATE"===this.returnState||"ATTRIBUTE_VALUE_UNQUOTED_STATE"===this.returnState}_isCharacterReferenceAttributeQuirk(e){if(!e&&this._isCharacterReferenceInAttribute()){const e=this._consume();return this._unconsume(),e===Oe.EQUALS_SIGN||De(e)}return !1}_flushCodePointsConsumedAsCharacterReference(){if(this._isCharacterReferenceInAttribute())for(let e=0;e<this.tempBuff.length;e++)this.currentAttr.value+=He(this.tempBuff[e]);else this._emitSeveralCodePoints(this.tempBuff);this.tempBuff=[];}[de](e){this.preprocessor.dropParsedChunk(),e===Oe.LESS_THAN_SIGN?this.state="TAG_OPEN_STATE":e===Oe.AMPERSAND?(this.returnState=de,this.state="CHARACTER_REFERENCE_STATE"):e===Oe.NULL?(this._err(N),this._emitCodePoint(e)):e===Oe.EOF?this._emitEOFToken():this._emitCodePoint(e);}RCDATA_STATE(e){this.preprocessor.dropParsedChunk(),e===Oe.AMPERSAND?(this.returnState="RCDATA_STATE",this.state="CHARACTER_REFERENCE_STATE"):e===Oe.LESS_THAN_SIGN?this.state="RCDATA_LESS_THAN_SIGN_STATE":e===Oe.NULL?(this._err(N),this._emitChars(n)):e===Oe.EOF?this._emitEOFToken():this._emitCodePoint(e);}RAWTEXT_STATE(e){this.preprocessor.dropParsedChunk(),e===Oe.LESS_THAN_SIGN?this.state="RAWTEXT_LESS_THAN_SIGN_STATE":e===Oe.NULL?(this._err(N),this._emitChars(n)):e===Oe.EOF?this._emitEOFToken():this._emitCodePoint(e);}SCRIPT_DATA_STATE(e){this.preprocessor.dropParsedChunk(),e===Oe.LESS_THAN_SIGN?this.state="SCRIPT_DATA_LESS_THAN_SIGN_STATE":e===Oe.NULL?(this._err(N),this._emitChars(n)):e===Oe.EOF?this._emitEOFToken():this._emitCodePoint(e);}PLAINTEXT_STATE(e){this.preprocessor.dropParsedChunk(),e===Oe.NULL?(this._err(N),this._emitChars(n)):e===Oe.EOF?this._emitEOFToken():this._emitCodePoint(e);}TAG_OPEN_STATE(e){e===Oe.EXCLAMATION_MARK?this.state="MARKUP_DECLARATION_OPEN_STATE":e===Oe.SOLIDUS?this.state="END_TAG_OPEN_STATE":Le(e)?(this._createStartTagToken(),this._reconsumeInState("TAG_NAME_STATE")):e===Oe.QUESTION_MARK?(this._err(u),this._createCommentToken(),this._reconsumeInState("BOGUS_COMMENT_STATE")):e===Oe.EOF?(this._err(L),this._emitChars("<"),this._emitEOFToken()):(this._err(O),this._emitChars("<"),this._reconsumeInState(de));}END_TAG_OPEN_STATE(e){Le(e)?(this._createEndTagToken(),this._reconsumeInState("TAG_NAME_STATE")):e===Oe.GREATER_THAN_SIGN?(this._err(C),this.state=de):e===Oe.EOF?(this._err(L),this._emitChars("</"),this._emitEOFToken()):(this._err(O),this._createCommentToken(),this._reconsumeInState("BOGUS_COMMENT_STATE"));}TAG_NAME_STATE(e){Re(e)?this.state="BEFORE_ATTRIBUTE_NAME_STATE":e===Oe.SOLIDUS?this.state="SELF_CLOSING_START_TAG_STATE":e===Oe.GREATER_THAN_SIGN?(this.state=de,this._emitCurrentToken()):fe(e)?this.currentToken.tagName+=Ue(e):e===Oe.NULL?(this._err(N),this.currentToken.tagName+=n):e===Oe.EOF?(this._err(D),this._emitEOFToken()):this.currentToken.tagName+=He(e);}RCDATA_LESS_THAN_SIGN_STATE(e){e===Oe.SOLIDUS?(this.tempBuff=[],this.state="RCDATA_END_TAG_OPEN_STATE"):(this._emitChars("<"),this._reconsumeInState("RCDATA_STATE"));}RCDATA_END_TAG_OPEN_STATE(e){Le(e)?(this._createEndTagToken(),this._reconsumeInState("RCDATA_END_TAG_NAME_STATE")):(this._emitChars("</"),this._reconsumeInState("RCDATA_STATE"));}RCDATA_END_TAG_NAME_STATE(e){if(fe(e))this.currentToken.tagName+=Ue(e),this.tempBuff.push(e);else if(Me(e))this.currentToken.tagName+=He(e),this.tempBuff.push(e);else {if(this.lastStartTagName===this.currentToken.tagName){if(Re(e))return void(this.state="BEFORE_ATTRIBUTE_NAME_STATE");if(e===Oe.SOLIDUS)return void(this.state="SELF_CLOSING_START_TAG_STATE");if(e===Oe.GREATER_THAN_SIGN)return this.state=de,void this._emitCurrentToken()}this._emitChars("</"),this._emitSeveralCodePoints(this.tempBuff),this._reconsumeInState("RCDATA_STATE");}}RAWTEXT_LESS_THAN_SIGN_STATE(e){e===Oe.SOLIDUS?(this.tempBuff=[],this.state="RAWTEXT_END_TAG_OPEN_STATE"):(this._emitChars("<"),this._reconsumeInState("RAWTEXT_STATE"));}RAWTEXT_END_TAG_OPEN_STATE(e){Le(e)?(this._createEndTagToken(),this._reconsumeInState("RAWTEXT_END_TAG_NAME_STATE")):(this._emitChars("</"),this._reconsumeInState("RAWTEXT_STATE"));}RAWTEXT_END_TAG_NAME_STATE(e){if(fe(e))this.currentToken.tagName+=Ue(e),this.tempBuff.push(e);else if(Me(e))this.currentToken.tagName+=He(e),this.tempBuff.push(e);else {if(this.lastStartTagName===this.currentToken.tagName){if(Re(e))return void(this.state="BEFORE_ATTRIBUTE_NAME_STATE");if(e===Oe.SOLIDUS)return void(this.state="SELF_CLOSING_START_TAG_STATE");if(e===Oe.GREATER_THAN_SIGN)return this._emitCurrentToken(),void(this.state=de)}this._emitChars("</"),this._emitSeveralCodePoints(this.tempBuff),this._reconsumeInState("RAWTEXT_STATE");}}SCRIPT_DATA_LESS_THAN_SIGN_STATE(e){e===Oe.SOLIDUS?(this.tempBuff=[],this.state="SCRIPT_DATA_END_TAG_OPEN_STATE"):e===Oe.EXCLAMATION_MARK?(this.state="SCRIPT_DATA_ESCAPE_START_STATE",this._emitChars("<!")):(this._emitChars("<"),this._reconsumeInState("SCRIPT_DATA_STATE"));}SCRIPT_DATA_END_TAG_OPEN_STATE(e){Le(e)?(this._createEndTagToken(),this._reconsumeInState("SCRIPT_DATA_END_TAG_NAME_STATE")):(this._emitChars("</"),this._reconsumeInState("SCRIPT_DATA_STATE"));}SCRIPT_DATA_END_TAG_NAME_STATE(e){if(fe(e))this.currentToken.tagName+=Ue(e),this.tempBuff.push(e);else if(Me(e))this.currentToken.tagName+=He(e),this.tempBuff.push(e);else {if(this.lastStartTagName===this.currentToken.tagName){if(Re(e))return void(this.state="BEFORE_ATTRIBUTE_NAME_STATE");if(e===Oe.SOLIDUS)return void(this.state="SELF_CLOSING_START_TAG_STATE");if(e===Oe.GREATER_THAN_SIGN)return this._emitCurrentToken(),void(this.state=de)}this._emitChars("</"),this._emitSeveralCodePoints(this.tempBuff),this._reconsumeInState("SCRIPT_DATA_STATE");}}SCRIPT_DATA_ESCAPE_START_STATE(e){e===Oe.HYPHEN_MINUS?(this.state="SCRIPT_DATA_ESCAPE_START_DASH_STATE",this._emitChars("-")):this._reconsumeInState("SCRIPT_DATA_STATE");}SCRIPT_DATA_ESCAPE_START_DASH_STATE(e){e===Oe.HYPHEN_MINUS?(this.state="SCRIPT_DATA_ESCAPED_DASH_DASH_STATE",this._emitChars("-")):this._reconsumeInState("SCRIPT_DATA_STATE");}SCRIPT_DATA_ESCAPED_STATE(e){e===Oe.HYPHEN_MINUS?(this.state="SCRIPT_DATA_ESCAPED_DASH_STATE",this._emitChars("-")):e===Oe.LESS_THAN_SIGN?this.state="SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE":e===Oe.NULL?(this._err(N),this._emitChars(n)):e===Oe.EOF?(this._err(v),this._emitEOFToken()):this._emitCodePoint(e);}SCRIPT_DATA_ESCAPED_DASH_STATE(e){e===Oe.HYPHEN_MINUS?(this.state="SCRIPT_DATA_ESCAPED_DASH_DASH_STATE",this._emitChars("-")):e===Oe.LESS_THAN_SIGN?this.state="SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE":e===Oe.NULL?(this._err(N),this.state="SCRIPT_DATA_ESCAPED_STATE",this._emitChars(n)):e===Oe.EOF?(this._err(v),this._emitEOFToken()):(this.state="SCRIPT_DATA_ESCAPED_STATE",this._emitCodePoint(e));}SCRIPT_DATA_ESCAPED_DASH_DASH_STATE(e){e===Oe.HYPHEN_MINUS?this._emitChars("-"):e===Oe.LESS_THAN_SIGN?this.state="SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE":e===Oe.GREATER_THAN_SIGN?(this.state="SCRIPT_DATA_STATE",this._emitChars(">")):e===Oe.NULL?(this._err(N),this.state="SCRIPT_DATA_ESCAPED_STATE",this._emitChars(n)):e===Oe.EOF?(this._err(v),this._emitEOFToken()):(this.state="SCRIPT_DATA_ESCAPED_STATE",this._emitCodePoint(e));}SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE(e){e===Oe.SOLIDUS?(this.tempBuff=[],this.state="SCRIPT_DATA_ESCAPED_END_TAG_OPEN_STATE"):Le(e)?(this.tempBuff=[],this._emitChars("<"),this._reconsumeInState("SCRIPT_DATA_DOUBLE_ESCAPE_START_STATE")):(this._emitChars("<"),this._reconsumeInState("SCRIPT_DATA_ESCAPED_STATE"));}SCRIPT_DATA_ESCAPED_END_TAG_OPEN_STATE(e){Le(e)?(this._createEndTagToken(),this._reconsumeInState("SCRIPT_DATA_ESCAPED_END_TAG_NAME_STATE")):(this._emitChars("</"),this._reconsumeInState("SCRIPT_DATA_ESCAPED_STATE"));}SCRIPT_DATA_ESCAPED_END_TAG_NAME_STATE(e){if(fe(e))this.currentToken.tagName+=Ue(e),this.tempBuff.push(e);else if(Me(e))this.currentToken.tagName+=He(e),this.tempBuff.push(e);else {if(this.lastStartTagName===this.currentToken.tagName){if(Re(e))return void(this.state="BEFORE_ATTRIBUTE_NAME_STATE");if(e===Oe.SOLIDUS)return void(this.state="SELF_CLOSING_START_TAG_STATE");if(e===Oe.GREATER_THAN_SIGN)return this._emitCurrentToken(),void(this.state=de)}this._emitChars("</"),this._emitSeveralCodePoints(this.tempBuff),this._reconsumeInState("SCRIPT_DATA_ESCAPED_STATE");}}SCRIPT_DATA_DOUBLE_ESCAPE_START_STATE(e){Re(e)||e===Oe.SOLIDUS||e===Oe.GREATER_THAN_SIGN?(this.state=this._isTempBufferEqualToScriptString()?"SCRIPT_DATA_DOUBLE_ESCAPED_STATE":"SCRIPT_DATA_ESCAPED_STATE",this._emitCodePoint(e)):fe(e)?(this.tempBuff.push(ke(e)),this._emitCodePoint(e)):Me(e)?(this.tempBuff.push(e),this._emitCodePoint(e)):this._reconsumeInState("SCRIPT_DATA_ESCAPED_STATE");}SCRIPT_DATA_DOUBLE_ESCAPED_STATE(e){e===Oe.HYPHEN_MINUS?(this.state="SCRIPT_DATA_DOUBLE_ESCAPED_DASH_STATE",this._emitChars("-")):e===Oe.LESS_THAN_SIGN?(this.state="SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE",this._emitChars("<")):e===Oe.NULL?(this._err(N),this._emitChars(n)):e===Oe.EOF?(this._err(v),this._emitEOFToken()):this._emitCodePoint(e);}SCRIPT_DATA_DOUBLE_ESCAPED_DASH_STATE(e){e===Oe.HYPHEN_MINUS?(this.state="SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH_STATE",this._emitChars("-")):e===Oe.LESS_THAN_SIGN?(this.state="SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE",this._emitChars("<")):e===Oe.NULL?(this._err(N),this.state="SCRIPT_DATA_DOUBLE_ESCAPED_STATE",this._emitChars(n)):e===Oe.EOF?(this._err(v),this._emitEOFToken()):(this.state="SCRIPT_DATA_DOUBLE_ESCAPED_STATE",this._emitCodePoint(e));}SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH_STATE(e){e===Oe.HYPHEN_MINUS?this._emitChars("-"):e===Oe.LESS_THAN_SIGN?(this.state="SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE",this._emitChars("<")):e===Oe.GREATER_THAN_SIGN?(this.state="SCRIPT_DATA_STATE",this._emitChars(">")):e===Oe.NULL?(this._err(N),this.state="SCRIPT_DATA_DOUBLE_ESCAPED_STATE",this._emitChars(n)):e===Oe.EOF?(this._err(v),this._emitEOFToken()):(this.state="SCRIPT_DATA_DOUBLE_ESCAPED_STATE",this._emitCodePoint(e));}SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE(e){e===Oe.SOLIDUS?(this.tempBuff=[],this.state="SCRIPT_DATA_DOUBLE_ESCAPE_END_STATE",this._emitChars("/")):this._reconsumeInState("SCRIPT_DATA_DOUBLE_ESCAPED_STATE");}SCRIPT_DATA_DOUBLE_ESCAPE_END_STATE(e){Re(e)||e===Oe.SOLIDUS||e===Oe.GREATER_THAN_SIGN?(this.state=this._isTempBufferEqualToScriptString()?"SCRIPT_DATA_ESCAPED_STATE":"SCRIPT_DATA_DOUBLE_ESCAPED_STATE",this._emitCodePoint(e)):fe(e)?(this.tempBuff.push(ke(e)),this._emitCodePoint(e)):Me(e)?(this.tempBuff.push(e),this._emitCodePoint(e)):this._reconsumeInState("SCRIPT_DATA_DOUBLE_ESCAPED_STATE");}BEFORE_ATTRIBUTE_NAME_STATE(e){Re(e)||(e===Oe.SOLIDUS||e===Oe.GREATER_THAN_SIGN||e===Oe.EOF?this._reconsumeInState("AFTER_ATTRIBUTE_NAME_STATE"):e===Oe.EQUALS_SIGN?(this._err(S),this._createAttr("="),this.state="ATTRIBUTE_NAME_STATE"):(this._createAttr(""),this._reconsumeInState("ATTRIBUTE_NAME_STATE")));}ATTRIBUTE_NAME_STATE(e){Re(e)||e===Oe.SOLIDUS||e===Oe.GREATER_THAN_SIGN||e===Oe.EOF?(this._leaveAttrName("AFTER_ATTRIBUTE_NAME_STATE"),this._unconsume()):e===Oe.EQUALS_SIGN?this._leaveAttrName("BEFORE_ATTRIBUTE_VALUE_STATE"):fe(e)?this.currentAttr.name+=Ue(e):e===Oe.QUOTATION_MARK||e===Oe.APOSTROPHE||e===Oe.LESS_THAN_SIGN?(this._err(d),this.currentAttr.name+=He(e)):e===Oe.NULL?(this._err(N),this.currentAttr.name+=n):this.currentAttr.name+=He(e);}AFTER_ATTRIBUTE_NAME_STATE(e){Re(e)||(e===Oe.SOLIDUS?this.state="SELF_CLOSING_START_TAG_STATE":e===Oe.EQUALS_SIGN?this.state="BEFORE_ATTRIBUTE_VALUE_STATE":e===Oe.GREATER_THAN_SIGN?(this.state=de,this._emitCurrentToken()):e===Oe.EOF?(this._err(D),this._emitEOFToken()):(this._createAttr(""),this._reconsumeInState("ATTRIBUTE_NAME_STATE")));}BEFORE_ATTRIBUTE_VALUE_STATE(e){Re(e)||(e===Oe.QUOTATION_MARK?this.state="ATTRIBUTE_VALUE_DOUBLE_QUOTED_STATE":e===Oe.APOSTROPHE?this.state="ATTRIBUTE_VALUE_SINGLE_QUOTED_STATE":e===Oe.GREATER_THAN_SIGN?(this._err(g),this.state=de,this._emitCurrentToken()):this._reconsumeInState("ATTRIBUTE_VALUE_UNQUOTED_STATE"));}ATTRIBUTE_VALUE_DOUBLE_QUOTED_STATE(e){e===Oe.QUOTATION_MARK?this.state="AFTER_ATTRIBUTE_VALUE_QUOTED_STATE":e===Oe.AMPERSAND?(this.returnState="ATTRIBUTE_VALUE_DOUBLE_QUOTED_STATE",this.state="CHARACTER_REFERENCE_STATE"):e===Oe.NULL?(this._err(N),this.currentAttr.value+=n):e===Oe.EOF?(this._err(D),this._emitEOFToken()):this.currentAttr.value+=He(e);}ATTRIBUTE_VALUE_SINGLE_QUOTED_STATE(e){e===Oe.APOSTROPHE?this.state="AFTER_ATTRIBUTE_VALUE_QUOTED_STATE":e===Oe.AMPERSAND?(this.returnState="ATTRIBUTE_VALUE_SINGLE_QUOTED_STATE",this.state="CHARACTER_REFERENCE_STATE"):e===Oe.NULL?(this._err(N),this.currentAttr.value+=n):e===Oe.EOF?(this._err(D),this._emitEOFToken()):this.currentAttr.value+=He(e);}ATTRIBUTE_VALUE_UNQUOTED_STATE(e){Re(e)?this._leaveAttrValue("BEFORE_ATTRIBUTE_NAME_STATE"):e===Oe.AMPERSAND?(this.returnState="ATTRIBUTE_VALUE_UNQUOTED_STATE",this.state="CHARACTER_REFERENCE_STATE"):e===Oe.GREATER_THAN_SIGN?(this._leaveAttrValue(de),this._emitCurrentToken()):e===Oe.NULL?(this._err(N),this.currentAttr.value+=n):e===Oe.QUOTATION_MARK||e===Oe.APOSTROPHE||e===Oe.LESS_THAN_SIGN||e===Oe.EQUALS_SIGN||e===Oe.GRAVE_ACCENT?(this._err(M),this.currentAttr.value+=He(e)):e===Oe.EOF?(this._err(D),this._emitEOFToken()):this.currentAttr.value+=He(e);}AFTER_ATTRIBUTE_VALUE_QUOTED_STATE(e){Re(e)?this._leaveAttrValue("BEFORE_ATTRIBUTE_NAME_STATE"):e===Oe.SOLIDUS?this._leaveAttrValue("SELF_CLOSING_START_TAG_STATE"):e===Oe.GREATER_THAN_SIGN?(this._leaveAttrValue(de),this._emitCurrentToken()):e===Oe.EOF?(this._err(D),this._emitEOFToken()):(this._err(P),this._reconsumeInState("BEFORE_ATTRIBUTE_NAME_STATE"));}SELF_CLOSING_START_TAG_STATE(e){e===Oe.GREATER_THAN_SIGN?(this.currentToken.selfClosing=!0,this.state=de,this._emitCurrentToken()):e===Oe.EOF?(this._err(D),this._emitEOFToken()):(this._err(p),this._reconsumeInState("BEFORE_ATTRIBUTE_NAME_STATE"));}BOGUS_COMMENT_STATE(e){e===Oe.GREATER_THAN_SIGN?(this.state=de,this._emitCurrentToken()):e===Oe.EOF?(this._emitCurrentToken(),this._emitEOFToken()):e===Oe.NULL?(this._err(N),this.currentToken.data+=n):this.currentToken.data+=He(e);}MARKUP_DECLARATION_OPEN_STATE(e){this._consumeSequenceIfMatch(Se.DASH_DASH_STRING,e,!0)?(this._createCommentToken(),this.state="COMMENT_START_STATE"):this._consumeSequenceIfMatch(Se.DOCTYPE_STRING,e,!1)?this.state="DOCTYPE_STATE":this._consumeSequenceIfMatch(Se.CDATA_START_STRING,e,!0)?this.allowCDATA?this.state="CDATA_SECTION_STATE":(this._err(x),this._createCommentToken(),this.currentToken.data="[CDATA[",this.state="BOGUS_COMMENT_STATE"):this._ensureHibernation()||(this._err(y),this._createCommentToken(),this._reconsumeInState("BOGUS_COMMENT_STATE"));}COMMENT_START_STATE(e){e===Oe.HYPHEN_MINUS?this.state="COMMENT_START_DASH_STATE":e===Oe.GREATER_THAN_SIGN?(this._err(X),this.state=de,this._emitCurrentToken()):this._reconsumeInState("COMMENT_STATE");}COMMENT_START_DASH_STATE(e){e===Oe.HYPHEN_MINUS?this.state="COMMENT_END_STATE":e===Oe.GREATER_THAN_SIGN?(this._err(X),this.state=de,this._emitCurrentToken()):e===Oe.EOF?(this._err(W),this._emitCurrentToken(),this._emitEOFToken()):(this.currentToken.data+="-",this._reconsumeInState("COMMENT_STATE"));}COMMENT_STATE(e){e===Oe.HYPHEN_MINUS?this.state="COMMENT_END_DASH_STATE":e===Oe.LESS_THAN_SIGN?(this.currentToken.data+="<",this.state="COMMENT_LESS_THAN_SIGN_STATE"):e===Oe.NULL?(this._err(N),this.currentToken.data+=n):e===Oe.EOF?(this._err(W),this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.data+=He(e);}COMMENT_LESS_THAN_SIGN_STATE(e){e===Oe.EXCLAMATION_MARK?(this.currentToken.data+="!",this.state="COMMENT_LESS_THAN_SIGN_BANG_STATE"):e===Oe.LESS_THAN_SIGN?this.currentToken.data+="!":this._reconsumeInState("COMMENT_STATE");}COMMENT_LESS_THAN_SIGN_BANG_STATE(e){e===Oe.HYPHEN_MINUS?this.state="COMMENT_LESS_THAN_SIGN_BANG_DASH_STATE":this._reconsumeInState("COMMENT_STATE");}COMMENT_LESS_THAN_SIGN_BANG_DASH_STATE(e){e===Oe.HYPHEN_MINUS?this.state="COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH_STATE":this._reconsumeInState("COMMENT_END_DASH_STATE");}COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH_STATE(e){e!==Oe.GREATER_THAN_SIGN&&e!==Oe.EOF&&this._err(Q),this._reconsumeInState("COMMENT_END_STATE");}COMMENT_END_DASH_STATE(e){e===Oe.HYPHEN_MINUS?this.state="COMMENT_END_STATE":e===Oe.EOF?(this._err(W),this._emitCurrentToken(),this._emitEOFToken()):(this.currentToken.data+="-",this._reconsumeInState("COMMENT_STATE"));}COMMENT_END_STATE(e){e===Oe.GREATER_THAN_SIGN?(this.state=de,this._emitCurrentToken()):e===Oe.EXCLAMATION_MARK?this.state="COMMENT_END_BANG_STATE":e===Oe.HYPHEN_MINUS?this.currentToken.data+="-":e===Oe.EOF?(this._err(W),this._emitCurrentToken(),this._emitEOFToken()):(this.currentToken.data+="--",this._reconsumeInState("COMMENT_STATE"));}COMMENT_END_BANG_STATE(e){e===Oe.HYPHEN_MINUS?(this.currentToken.data+="--!",this.state="COMMENT_END_DASH_STATE"):e===Oe.GREATER_THAN_SIGN?(this._err(V),this.state=de,this._emitCurrentToken()):e===Oe.EOF?(this._err(W),this._emitCurrentToken(),this._emitEOFToken()):(this.currentToken.data+="--!",this._reconsumeInState("COMMENT_STATE"));}DOCTYPE_STATE(e){Re(e)?this.state="BEFORE_DOCTYPE_NAME_STATE":e===Oe.GREATER_THAN_SIGN?this._reconsumeInState("BEFORE_DOCTYPE_NAME_STATE"):e===Oe.EOF?(this._err(w),this._createDoctypeToken(null),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(te),this._reconsumeInState("BEFORE_DOCTYPE_NAME_STATE"));}BEFORE_DOCTYPE_NAME_STATE(e){Re(e)||(fe(e)?(this._createDoctypeToken(Ue(e)),this.state="DOCTYPE_NAME_STATE"):e===Oe.NULL?(this._err(N),this._createDoctypeToken(n),this.state="DOCTYPE_NAME_STATE"):e===Oe.GREATER_THAN_SIGN?(this._err(ne),this._createDoctypeToken(null),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=de):e===Oe.EOF?(this._err(w),this._createDoctypeToken(null),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._createDoctypeToken(He(e)),this.state="DOCTYPE_NAME_STATE"));}DOCTYPE_NAME_STATE(e){Re(e)?this.state="AFTER_DOCTYPE_NAME_STATE":e===Oe.GREATER_THAN_SIGN?(this.state=de,this._emitCurrentToken()):fe(e)?this.currentToken.name+=Ue(e):e===Oe.NULL?(this._err(N),this.currentToken.name+=n):e===Oe.EOF?(this._err(w),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.name+=He(e);}AFTER_DOCTYPE_NAME_STATE(e){Re(e)||(e===Oe.GREATER_THAN_SIGN?(this.state=de,this._emitCurrentToken()):e===Oe.EOF?(this._err(w),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this._consumeSequenceIfMatch(Se.PUBLIC_STRING,e,!1)?this.state="AFTER_DOCTYPE_PUBLIC_KEYWORD_STATE":this._consumeSequenceIfMatch(Se.SYSTEM_STRING,e,!1)?this.state="AFTER_DOCTYPE_SYSTEM_KEYWORD_STATE":this._ensureHibernation()||(this._err(se),this.currentToken.forceQuirks=!0,this._reconsumeInState("BOGUS_DOCTYPE_STATE")));}AFTER_DOCTYPE_PUBLIC_KEYWORD_STATE(e){Re(e)?this.state="BEFORE_DOCTYPE_PUBLIC_IDENTIFIER_STATE":e===Oe.QUOTATION_MARK?(this._err(k),this.currentToken.publicId="",this.state="DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED_STATE"):e===Oe.APOSTROPHE?(this._err(k),this.currentToken.publicId="",this.state="DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED_STATE"):e===Oe.GREATER_THAN_SIGN?(this._err(G),this.currentToken.forceQuirks=!0,this.state=de,this._emitCurrentToken()):e===Oe.EOF?(this._err(w),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(F),this.currentToken.forceQuirks=!0,this._reconsumeInState("BOGUS_DOCTYPE_STATE"));}BEFORE_DOCTYPE_PUBLIC_IDENTIFIER_STATE(e){Re(e)||(e===Oe.QUOTATION_MARK?(this.currentToken.publicId="",this.state="DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED_STATE"):e===Oe.APOSTROPHE?(this.currentToken.publicId="",this.state="DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED_STATE"):e===Oe.GREATER_THAN_SIGN?(this._err(G),this.currentToken.forceQuirks=!0,this.state=de,this._emitCurrentToken()):e===Oe.EOF?(this._err(w),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(F),this.currentToken.forceQuirks=!0,this._reconsumeInState("BOGUS_DOCTYPE_STATE")));}DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED_STATE(e){e===Oe.QUOTATION_MARK?this.state="AFTER_DOCTYPE_PUBLIC_IDENTIFIER_STATE":e===Oe.NULL?(this._err(N),this.currentToken.publicId+=n):e===Oe.GREATER_THAN_SIGN?(this._err(b),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=de):e===Oe.EOF?(this._err(w),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.publicId+=He(e);}DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED_STATE(e){e===Oe.APOSTROPHE?this.state="AFTER_DOCTYPE_PUBLIC_IDENTIFIER_STATE":e===Oe.NULL?(this._err(N),this.currentToken.publicId+=n):e===Oe.GREATER_THAN_SIGN?(this._err(b),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=de):e===Oe.EOF?(this._err(w),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.publicId+=He(e);}AFTER_DOCTYPE_PUBLIC_IDENTIFIER_STATE(e){Re(e)?this.state="BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS_STATE":e===Oe.GREATER_THAN_SIGN?(this.state=de,this._emitCurrentToken()):e===Oe.QUOTATION_MARK?(this._err(H),this.currentToken.systemId="",this.state="DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED_STATE"):e===Oe.APOSTROPHE?(this._err(H),this.currentToken.systemId="",this.state="DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED_STATE"):e===Oe.EOF?(this._err(w),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(B),this.currentToken.forceQuirks=!0,this._reconsumeInState("BOGUS_DOCTYPE_STATE"));}BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS_STATE(e){Re(e)||(e===Oe.GREATER_THAN_SIGN?(this._emitCurrentToken(),this.state=de):e===Oe.QUOTATION_MARK?(this.currentToken.systemId="",this.state="DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED_STATE"):e===Oe.APOSTROPHE?(this.currentToken.systemId="",this.state="DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED_STATE"):e===Oe.EOF?(this._err(w),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(B),this.currentToken.forceQuirks=!0,this._reconsumeInState("BOGUS_DOCTYPE_STATE")));}AFTER_DOCTYPE_SYSTEM_KEYWORD_STATE(e){Re(e)?this.state="BEFORE_DOCTYPE_SYSTEM_IDENTIFIER_STATE":e===Oe.QUOTATION_MARK?(this._err(U),this.currentToken.systemId="",this.state="DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED_STATE"):e===Oe.APOSTROPHE?(this._err(U),this.currentToken.systemId="",this.state="DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED_STATE"):e===Oe.GREATER_THAN_SIGN?(this._err(K),this.currentToken.forceQuirks=!0,this.state=de,this._emitCurrentToken()):e===Oe.EOF?(this._err(w),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(B),this.currentToken.forceQuirks=!0,this._reconsumeInState("BOGUS_DOCTYPE_STATE"));}BEFORE_DOCTYPE_SYSTEM_IDENTIFIER_STATE(e){Re(e)||(e===Oe.QUOTATION_MARK?(this.currentToken.systemId="",this.state="DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED_STATE"):e===Oe.APOSTROPHE?(this.currentToken.systemId="",this.state="DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED_STATE"):e===Oe.GREATER_THAN_SIGN?(this._err(K),this.currentToken.forceQuirks=!0,this.state=de,this._emitCurrentToken()):e===Oe.EOF?(this._err(w),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(B),this.currentToken.forceQuirks=!0,this._reconsumeInState("BOGUS_DOCTYPE_STATE")));}DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED_STATE(e){e===Oe.QUOTATION_MARK?this.state="AFTER_DOCTYPE_SYSTEM_IDENTIFIER_STATE":e===Oe.NULL?(this._err(N),this.currentToken.systemId+=n):e===Oe.GREATER_THAN_SIGN?(this._err(Y),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=de):e===Oe.EOF?(this._err(w),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.systemId+=He(e);}DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED_STATE(e){e===Oe.APOSTROPHE?this.state="AFTER_DOCTYPE_SYSTEM_IDENTIFIER_STATE":e===Oe.NULL?(this._err(N),this.currentToken.systemId+=n):e===Oe.GREATER_THAN_SIGN?(this._err(Y),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=de):e===Oe.EOF?(this._err(w),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.systemId+=He(e);}AFTER_DOCTYPE_SYSTEM_IDENTIFIER_STATE(e){Re(e)||(e===Oe.GREATER_THAN_SIGN?(this._emitCurrentToken(),this.state=de):e===Oe.EOF?(this._err(w),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(f),this._reconsumeInState("BOGUS_DOCTYPE_STATE")));}BOGUS_DOCTYPE_STATE(e){e===Oe.GREATER_THAN_SIGN?(this._emitCurrentToken(),this.state=de):e===Oe.NULL?this._err(N):e===Oe.EOF&&(this._emitCurrentToken(),this._emitEOFToken());}CDATA_SECTION_STATE(e){e===Oe.RIGHT_SQUARE_BRACKET?this.state="CDATA_SECTION_BRACKET_STATE":e===Oe.EOF?(this._err(j),this._emitEOFToken()):this._emitCodePoint(e);}CDATA_SECTION_BRACKET_STATE(e){e===Oe.RIGHT_SQUARE_BRACKET?this.state="CDATA_SECTION_END_STATE":(this._emitChars("]"),this._reconsumeInState("CDATA_SECTION_STATE"));}CDATA_SECTION_END_STATE(e){e===Oe.GREATER_THAN_SIGN?this.state=de:e===Oe.RIGHT_SQUARE_BRACKET?this._emitChars("]"):(this._emitChars("]]"),this._reconsumeInState("CDATA_SECTION_STATE"));}CHARACTER_REFERENCE_STATE(e){this.tempBuff=[Oe.AMPERSAND],e===Oe.NUMBER_SIGN?(this.tempBuff.push(e),this.state="NUMERIC_CHARACTER_REFERENCE_STATE"):De(e)?this._reconsumeInState("NAMED_CHARACTER_REFERENCE_STATE"):(this._flushCodePointsConsumedAsCharacterReference(),this._reconsumeInState(this.returnState));}NAMED_CHARACTER_REFERENCE_STATE(e){const t=this._matchNamedCharacterReference(e);if(this._ensureHibernation())this.tempBuff=[Oe.AMPERSAND];else if(t){const e=this.tempBuff[this.tempBuff.length-1]===Oe.SEMICOLON;this._isCharacterReferenceAttributeQuirk(e)||(e||this._errOnNextCodePoint(I),this.tempBuff=t),this._flushCodePointsConsumedAsCharacterReference(),this.state=this.returnState;}else this._flushCodePointsConsumedAsCharacterReference(),this.state="AMBIGUOS_AMPERSAND_STATE";}AMBIGUOS_AMPERSAND_STATE(e){De(e)?this._isCharacterReferenceInAttribute()?this.currentAttr.value+=He(e):this._emitCodePoint(e):(e===Oe.SEMICOLON&&this._err(R),this._reconsumeInState(this.returnState));}NUMERIC_CHARACTER_REFERENCE_STATE(e){this.charRefCode=0,e===Oe.LATIN_SMALL_X||e===Oe.LATIN_CAPITAL_X?(this.tempBuff.push(e),this.state="HEXADEMICAL_CHARACTER_REFERENCE_START_STATE"):this._reconsumeInState("DECIMAL_CHARACTER_REFERENCE_START_STATE");}HEXADEMICAL_CHARACTER_REFERENCE_START_STATE(e){!function(e){return Ie(e)||ge(e)||Pe(e)}(e)?(this._err(z),this._flushCodePointsConsumedAsCharacterReference(),this._reconsumeInState(this.returnState)):this._reconsumeInState("HEXADEMICAL_CHARACTER_REFERENCE_STATE");}DECIMAL_CHARACTER_REFERENCE_START_STATE(e){Ie(e)?this._reconsumeInState("DECIMAL_CHARACTER_REFERENCE_STATE"):(this._err(z),this._flushCodePointsConsumedAsCharacterReference(),this._reconsumeInState(this.returnState));}HEXADEMICAL_CHARACTER_REFERENCE_STATE(e){ge(e)?this.charRefCode=16*this.charRefCode+e-55:Pe(e)?this.charRefCode=16*this.charRefCode+e-87:Ie(e)?this.charRefCode=16*this.charRefCode+e-48:e===Oe.SEMICOLON?this.state="NUMERIC_CHARACTER_REFERENCE_END_STATE":(this._err(I),this._reconsumeInState("NUMERIC_CHARACTER_REFERENCE_END_STATE"));}DECIMAL_CHARACTER_REFERENCE_STATE(e){Ie(e)?this.charRefCode=10*this.charRefCode+e-48:e===Oe.SEMICOLON?this.state="NUMERIC_CHARACTER_REFERENCE_END_STATE":(this._err(I),this._reconsumeInState("NUMERIC_CHARACTER_REFERENCE_END_STATE"));}NUMERIC_CHARACTER_REFERENCE_END_STATE(){if(this.charRefCode===Oe.NULL)this._err(q),this.charRefCode=Oe.REPLACEMENT_CHARACTER;else if(this.charRefCode>1114111)this._err(Z),this.charRefCode=Oe.REPLACEMENT_CHARACTER;else if(i(this.charRefCode))this._err(J),this.charRefCode=Oe.REPLACEMENT_CHARACTER;else if(a(this.charRefCode))this._err(ee);else if(E(this.charRefCode)||this.charRefCode===Oe.CARRIAGE_RETURN){this._err($);const e=Ce[this.charRefCode];e&&(this.charRefCode=e);}this.tempBuff=[this.charRefCode],this._flushCodePointsConsumedAsCharacterReference(),this._reconsumeInState(this.returnState);}}Be.CHARACTER_TOKEN="CHARACTER_TOKEN",Be.NULL_CHARACTER_TOKEN="NULL_CHARACTER_TOKEN",Be.WHITESPACE_CHARACTER_TOKEN="WHITESPACE_CHARACTER_TOKEN",Be.START_TAG_TOKEN="START_TAG_TOKEN",Be.END_TAG_TOKEN="END_TAG_TOKEN",Be.COMMENT_TOKEN="COMMENT_TOKEN",Be.DOCTYPE_TOKEN="DOCTYPE_TOKEN",Be.EOF_TOKEN="EOF_TOKEN",Be.HIBERNATION_TOKEN="HIBERNATION_TOKEN",Be.MODE={DATA:de,RCDATA:"RCDATA_STATE",RAWTEXT:"RAWTEXT_STATE",SCRIPT_DATA:"SCRIPT_DATA_STATE",PLAINTEXT:"PLAINTEXT_STATE"},Be.getTokenAttr=function(e,t){for(let n=e.attrs.length-1;n>=0;n--)if(e.attrs[n].name===t)return e.attrs[n].value;return null};var Ge=Be;function Ke(e,t,n){return e(n={path:t,exports:{},require:function(e,t){return function(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}(null==t&&n.path)}},n.exports),n.exports}var be=Ke((function(e,t){const n=t.NAMESPACES={HTML:"http://www.w3.org/1999/xhtml",MATHML:"http://www.w3.org/1998/Math/MathML",SVG:"http://www.w3.org/2000/svg",XLINK:"http://www.w3.org/1999/xlink",XML:"http://www.w3.org/XML/1998/namespace",XMLNS:"http://www.w3.org/2000/xmlns/"};t.ATTRS={TYPE:"type",ACTION:"action",ENCODING:"encoding",PROMPT:"prompt",NAME:"name",COLOR:"color",FACE:"face",SIZE:"size"},t.DOCUMENT_MODE={NO_QUIRKS:"no-quirks",QUIRKS:"quirks",LIMITED_QUIRKS:"limited-quirks"};const s=t.TAG_NAMES={A:"a",ADDRESS:"address",ANNOTATION_XML:"annotation-xml",APPLET:"applet",AREA:"area",ARTICLE:"article",ASIDE:"aside",B:"b",BASE:"base",BASEFONT:"basefont",BGSOUND:"bgsound",BIG:"big",BLOCKQUOTE:"blockquote",BODY:"body",BR:"br",BUTTON:"button",CAPTION:"caption",CENTER:"center",CODE:"code",COL:"col",COLGROUP:"colgroup",DD:"dd",DESC:"desc",DETAILS:"details",DIALOG:"dialog",DIR:"dir",DIV:"div",DL:"dl",DT:"dt",EM:"em",EMBED:"embed",FIELDSET:"fieldset",FIGCAPTION:"figcaption",FIGURE:"figure",FONT:"font",FOOTER:"footer",FOREIGN_OBJECT:"foreignObject",FORM:"form",FRAME:"frame",FRAMESET:"frameset",H1:"h1",H2:"h2",H3:"h3",H4:"h4",H5:"h5",H6:"h6",HEAD:"head",HEADER:"header",HGROUP:"hgroup",HR:"hr",HTML:"html",I:"i",IMG:"img",IMAGE:"image",INPUT:"input",IFRAME:"iframe",KEYGEN:"keygen",LABEL:"label",LI:"li",LINK:"link",LISTING:"listing",MAIN:"main",MALIGNMARK:"malignmark",MARQUEE:"marquee",MATH:"math",MENU:"menu",META:"meta",MGLYPH:"mglyph",MI:"mi",MO:"mo",MN:"mn",MS:"ms",MTEXT:"mtext",NAV:"nav",NOBR:"nobr",NOFRAMES:"noframes",NOEMBED:"noembed",NOSCRIPT:"noscript",OBJECT:"object",OL:"ol",OPTGROUP:"optgroup",OPTION:"option",P:"p",PARAM:"param",PLAINTEXT:"plaintext",PRE:"pre",RB:"rb",RP:"rp",RT:"rt",RTC:"rtc",RUBY:"ruby",S:"s",SCRIPT:"script",SECTION:"section",SELECT:"select",SOURCE:"source",SMALL:"small",SPAN:"span",STRIKE:"strike",STRONG:"strong",STYLE:"style",SUB:"sub",SUMMARY:"summary",SUP:"sup",TABLE:"table",TBODY:"tbody",TEMPLATE:"template",TEXTAREA:"textarea",TFOOT:"tfoot",TD:"td",TH:"th",THEAD:"thead",TITLE:"title",TR:"tr",TRACK:"track",TT:"tt",U:"u",UL:"ul",SVG:"svg",VAR:"var",WBR:"wbr",XMP:"xmp"};t.SPECIAL_ELEMENTS={[n.HTML]:{[s.ADDRESS]:!0,[s.APPLET]:!0,[s.AREA]:!0,[s.ARTICLE]:!0,[s.ASIDE]:!0,[s.BASE]:!0,[s.BASEFONT]:!0,[s.BGSOUND]:!0,[s.BLOCKQUOTE]:!0,[s.BODY]:!0,[s.BR]:!0,[s.BUTTON]:!0,[s.CAPTION]:!0,[s.CENTER]:!0,[s.COL]:!0,[s.COLGROUP]:!0,[s.DD]:!0,[s.DETAILS]:!0,[s.DIR]:!0,[s.DIV]:!0,[s.DL]:!0,[s.DT]:!0,[s.EMBED]:!0,[s.FIELDSET]:!0,[s.FIGCAPTION]:!0,[s.FIGURE]:!0,[s.FOOTER]:!0,[s.FORM]:!0,[s.FRAME]:!0,[s.FRAMESET]:!0,[s.H1]:!0,[s.H2]:!0,[s.H3]:!0,[s.H4]:!0,[s.H5]:!0,[s.H6]:!0,[s.HEAD]:!0,[s.HEADER]:!0,[s.HGROUP]:!0,[s.HR]:!0,[s.HTML]:!0,[s.IFRAME]:!0,[s.IMG]:!0,[s.INPUT]:!0,[s.LI]:!0,[s.LINK]:!0,[s.LISTING]:!0,[s.MAIN]:!0,[s.MARQUEE]:!0,[s.MENU]:!0,[s.META]:!0,[s.NAV]:!0,[s.NOEMBED]:!0,[s.NOFRAMES]:!0,[s.NOSCRIPT]:!0,[s.OBJECT]:!0,[s.OL]:!0,[s.P]:!0,[s.PARAM]:!0,[s.PLAINTEXT]:!0,[s.PRE]:!0,[s.SCRIPT]:!0,[s.SECTION]:!0,[s.SELECT]:!0,[s.SOURCE]:!0,[s.STYLE]:!0,[s.SUMMARY]:!0,[s.TABLE]:!0,[s.TBODY]:!0,[s.TD]:!0,[s.TEMPLATE]:!0,[s.TEXTAREA]:!0,[s.TFOOT]:!0,[s.TH]:!0,[s.THEAD]:!0,[s.TITLE]:!0,[s.TR]:!0,[s.TRACK]:!0,[s.UL]:!0,[s.WBR]:!0,[s.XMP]:!0},[n.MATHML]:{[s.MI]:!0,[s.MO]:!0,[s.MN]:!0,[s.MS]:!0,[s.MTEXT]:!0,[s.ANNOTATION_XML]:!0},[n.SVG]:{[s.TITLE]:!0,[s.FOREIGN_OBJECT]:!0,[s.DESC]:!0}};}));be.NAMESPACES,be.ATTRS,be.DOCUMENT_MODE,be.TAG_NAMES,be.SPECIAL_ELEMENTS;const Ye=be.TAG_NAMES,xe=be.NAMESPACES;function ye(e){switch(e.length){case 1:return e===Ye.P;case 2:return e===Ye.RB||e===Ye.RP||e===Ye.RT||e===Ye.DD||e===Ye.DT||e===Ye.LI;case 3:return e===Ye.RTC;case 6:return e===Ye.OPTION;case 8:return e===Ye.OPTGROUP}return !1}function ve(e){switch(e.length){case 1:return e===Ye.P;case 2:return e===Ye.RB||e===Ye.RP||e===Ye.RT||e===Ye.DD||e===Ye.DT||e===Ye.LI||e===Ye.TD||e===Ye.TH||e===Ye.TR;case 3:return e===Ye.RTC;case 5:return e===Ye.TBODY||e===Ye.TFOOT||e===Ye.THEAD;case 6:return e===Ye.OPTION;case 7:return e===Ye.CAPTION;case 8:return e===Ye.OPTGROUP||e===Ye.COLGROUP}return !1}function we(e,t){switch(e.length){case 2:if(e===Ye.TD||e===Ye.TH)return t===xe.HTML;if(e===Ye.MI||e===Ye.MO||e===Ye.MN||e===Ye.MS)return t===xe.MATHML;break;case 4:if(e===Ye.HTML)return t===xe.HTML;if(e===Ye.DESC)return t===xe.SVG;break;case 5:if(e===Ye.TABLE)return t===xe.HTML;if(e===Ye.MTEXT)return t===xe.MATHML;if(e===Ye.TITLE)return t===xe.SVG;break;case 6:return (e===Ye.APPLET||e===Ye.OBJECT)&&t===xe.HTML;case 7:return (e===Ye.CAPTION||e===Ye.MARQUEE)&&t===xe.HTML;case 8:return e===Ye.TEMPLATE&&t===xe.HTML;case 13:return e===Ye.FOREIGN_OBJECT&&t===xe.SVG;case 14:return e===Ye.ANNOTATION_XML&&t===xe.MATHML}return !1}var Qe=class{constructor(e,t){this.stackTop=-1,this.items=[],this.current=e,this.currentTagName=null,this.currentTmplContent=null,this.tmplCount=0,this.treeAdapter=t;}_indexOf(e){let t=-1;for(let n=this.stackTop;n>=0;n--)if(this.items[n]===e){t=n;break}return t}_isInTemplate(){return this.currentTagName===Ye.TEMPLATE&&this.treeAdapter.getNamespaceURI(this.current)===xe.HTML}_updateCurrentElement(){this.current=this.items[this.stackTop],this.currentTagName=this.current&&this.treeAdapter.getTagName(this.current),this.currentTmplContent=this._isInTemplate()?this.treeAdapter.getTemplateContent(this.current):null;}push(e){this.items[++this.stackTop]=e,this._updateCurrentElement(),this._isInTemplate()&&this.tmplCount++;}pop(){this.stackTop--,this.tmplCount>0&&this._isInTemplate()&&this.tmplCount--,this._updateCurrentElement();}replace(e,t){const n=this._indexOf(e);this.items[n]=t,n===this.stackTop&&this._updateCurrentElement();}insertAfter(e,t){const n=this._indexOf(e)+1;this.items.splice(n,0,t),n===++this.stackTop&&this._updateCurrentElement();}popUntilTagNamePopped(e){for(;this.stackTop>-1;){const t=this.currentTagName,n=this.treeAdapter.getNamespaceURI(this.current);if(this.pop(),t===e&&n===xe.HTML)break}}popUntilElementPopped(e){for(;this.stackTop>-1;){const t=this.current;if(this.pop(),t===e)break}}popUntilNumberedHeaderPopped(){for(;this.stackTop>-1;){const e=this.currentTagName,t=this.treeAdapter.getNamespaceURI(this.current);if(this.pop(),e===Ye.H1||e===Ye.H2||e===Ye.H3||e===Ye.H4||e===Ye.H5||e===Ye.H6&&t===xe.HTML)break}}popUntilTableCellPopped(){for(;this.stackTop>-1;){const e=this.currentTagName,t=this.treeAdapter.getNamespaceURI(this.current);if(this.pop(),e===Ye.TD||e===Ye.TH&&t===xe.HTML)break}}popAllUpToHtmlElement(){this.stackTop=0,this._updateCurrentElement();}clearBackToTableContext(){for(;this.currentTagName!==Ye.TABLE&&this.currentTagName!==Ye.TEMPLATE&&this.currentTagName!==Ye.HTML||this.treeAdapter.getNamespaceURI(this.current)!==xe.HTML;)this.pop();}clearBackToTableBodyContext(){for(;this.currentTagName!==Ye.TBODY&&this.currentTagName!==Ye.TFOOT&&this.currentTagName!==Ye.THEAD&&this.currentTagName!==Ye.TEMPLATE&&this.currentTagName!==Ye.HTML||this.treeAdapter.getNamespaceURI(this.current)!==xe.HTML;)this.pop();}clearBackToTableRowContext(){for(;this.currentTagName!==Ye.TR&&this.currentTagName!==Ye.TEMPLATE&&this.currentTagName!==Ye.HTML||this.treeAdapter.getNamespaceURI(this.current)!==xe.HTML;)this.pop();}remove(e){for(let t=this.stackTop;t>=0;t--)if(this.items[t]===e){this.items.splice(t,1),this.stackTop--,this._updateCurrentElement();break}}tryPeekProperlyNestedBodyElement(){const e=this.items[1];return e&&this.treeAdapter.getTagName(e)===Ye.BODY?e:null}contains(e){return this._indexOf(e)>-1}getCommonAncestor(e){let t=this._indexOf(e);return --t>=0?this.items[t]:null}isRootHtmlElementCurrent(){return 0===this.stackTop&&this.currentTagName===Ye.HTML}hasInScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]),s=this.treeAdapter.getNamespaceURI(this.items[t]);if(n===e&&s===xe.HTML)return !0;if(we(n,s))return !1}return !0}hasNumberedHeaderInScope(){for(let e=this.stackTop;e>=0;e--){const t=this.treeAdapter.getTagName(this.items[e]),n=this.treeAdapter.getNamespaceURI(this.items[e]);if((t===Ye.H1||t===Ye.H2||t===Ye.H3||t===Ye.H4||t===Ye.H5||t===Ye.H6)&&n===xe.HTML)return !0;if(we(t,n))return !1}return !0}hasInListItemScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]),s=this.treeAdapter.getNamespaceURI(this.items[t]);if(n===e&&s===xe.HTML)return !0;if((n===Ye.UL||n===Ye.OL)&&s===xe.HTML||we(n,s))return !1}return !0}hasInButtonScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]),s=this.treeAdapter.getNamespaceURI(this.items[t]);if(n===e&&s===xe.HTML)return !0;if(n===Ye.BUTTON&&s===xe.HTML||we(n,s))return !1}return !0}hasInTableScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]);if(this.treeAdapter.getNamespaceURI(this.items[t])===xe.HTML){if(n===e)return !0;if(n===Ye.TABLE||n===Ye.TEMPLATE||n===Ye.HTML)return !1}}return !0}hasTableBodyContextInTableScope(){for(let e=this.stackTop;e>=0;e--){const t=this.treeAdapter.getTagName(this.items[e]);if(this.treeAdapter.getNamespaceURI(this.items[e])===xe.HTML){if(t===Ye.TBODY||t===Ye.THEAD||t===Ye.TFOOT)return !0;if(t===Ye.TABLE||t===Ye.HTML)return !1}}return !0}hasInSelectScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]);if(this.treeAdapter.getNamespaceURI(this.items[t])===xe.HTML){if(n===e)return !0;if(n!==Ye.OPTION&&n!==Ye.OPTGROUP)return !1}}return !0}generateImpliedEndTags(){for(;ye(this.currentTagName);)this.pop();}generateImpliedEndTagsThoroughly(){for(;ve(this.currentTagName);)this.pop();}generateImpliedEndTagsWithExclusion(e){for(;ye(this.currentTagName)&&this.currentTagName!==e;)this.pop();}};class Xe{constructor(e){this.length=0,this.entries=[],this.treeAdapter=e,this.bookmark=null;}_getNoahArkConditionCandidates(e){const t=[];if(this.length>=3){const n=this.treeAdapter.getAttrList(e).length,s=this.treeAdapter.getTagName(e),r=this.treeAdapter.getNamespaceURI(e);for(let e=this.length-1;e>=0;e--){const i=this.entries[e];if(i.type===Xe.MARKER_ENTRY)break;const T=i.element,o=this.treeAdapter.getAttrList(T);this.treeAdapter.getTagName(T)===s&&this.treeAdapter.getNamespaceURI(T)===r&&o.length===n&&t.push({idx:e,attrs:o});}}return t.length<3?[]:t}_ensureNoahArkCondition(e){const t=this._getNoahArkConditionCandidates(e);let n=t.length;if(n){const s=this.treeAdapter.getAttrList(e),r=s.length,i=Object.create(null);for(let e=0;e<r;e++){const t=s[e];i[t.name]=t.value;}for(let e=0;e<r;e++)for(let s=0;s<n;s++){const r=t[s].attrs[e];if(i[r.name]!==r.value&&(t.splice(s,1),n--),t.length<3)return}for(let e=n-1;e>=2;e--)this.entries.splice(t[e].idx,1),this.length--;}}insertMarker(){this.entries.push({type:Xe.MARKER_ENTRY}),this.length++;}pushElement(e,t){this._ensureNoahArkCondition(e),this.entries.push({type:Xe.ELEMENT_ENTRY,element:e,token:t}),this.length++;}insertElementAfterBookmark(e,t){let n=this.length-1;for(;n>=0&&this.entries[n]!==this.bookmark;n--);this.entries.splice(n+1,0,{type:Xe.ELEMENT_ENTRY,element:e,token:t}),this.length++;}removeEntry(e){for(let t=this.length-1;t>=0;t--)if(this.entries[t]===e){this.entries.splice(t,1),this.length--;break}}clearToLastMarker(){for(;this.length;){const e=this.entries.pop();if(this.length--,e.type===Xe.MARKER_ENTRY)break}}getElementEntryInScopeWithTagName(e){for(let t=this.length-1;t>=0;t--){const n=this.entries[t];if(n.type===Xe.MARKER_ENTRY)return null;if(this.treeAdapter.getTagName(n.element)===e)return n}return null}getElementEntry(e){for(let t=this.length-1;t>=0;t--){const n=this.entries[t];if(n.type===Xe.ELEMENT_ENTRY&&n.element===e)return n}return null}}Xe.MARKER_ENTRY="MARKER_ENTRY",Xe.ELEMENT_ENTRY="ELEMENT_ENTRY";var We=Xe;class Ve{constructor(e){const t={},n=this._getOverriddenMethods(this,t);for(const s of Object.keys(n))"function"==typeof n[s]&&(t[s]=e[s],e[s]=n[s]);}_getOverriddenMethods(){throw new Error("Not implemented")}}Ve.install=function(e,t,n){e.__mixins||(e.__mixins=[]);for(let n=0;n<e.__mixins.length;n++)if(e.__mixins[n].constructor===t)return e.__mixins[n];const s=new t(e,n);return e.__mixins.push(s),s};var je=Ve;var ze=class extends je{constructor(e){super(e),this.preprocessor=e,this.isEol=!1,this.lineStartPos=0,this.droppedBufferSize=0,this.offset=0,this.col=0,this.line=1;}_getOverriddenMethods(e,t){return {advance(){const n=this.pos+1,s=this.html[n];return e.isEol&&(e.isEol=!1,e.line++,e.lineStartPos=n),("\n"===s||"\r"===s&&"\n"!==this.html[n+1])&&(e.isEol=!0),e.col=n-e.lineStartPos+1,e.offset=e.droppedBufferSize+n,t.advance.call(this)},retreat(){t.retreat.call(this),e.isEol=!1,e.col=this.pos-e.lineStartPos+1;},dropParsedChunk(){const n=this.pos;t.dropParsedChunk.call(this);const s=n-this.pos;e.lineStartPos-=s,e.droppedBufferSize+=s,e.offset=e.droppedBufferSize+this.pos;}}}};var qe=class extends je{constructor(e){super(e),this.tokenizer=e,this.posTracker=je.install(e.preprocessor,ze),this.currentAttrLocation=null,this.ctLoc=null;}_getCurrentLocation(){return {startLine:this.posTracker.line,startCol:this.posTracker.col,startOffset:this.posTracker.offset,endLine:-1,endCol:-1,endOffset:-1}}_attachCurrentAttrLocationInfo(){this.currentAttrLocation.endLine=this.posTracker.line,this.currentAttrLocation.endCol=this.posTracker.col,this.currentAttrLocation.endOffset=this.posTracker.offset;const e=this.tokenizer.currentToken,t=this.tokenizer.currentAttr;e.location.attrs||(e.location.attrs=Object.create(null)),e.location.attrs[t.name]=this.currentAttrLocation;}_getOverriddenMethods(e,t){const n={_createStartTagToken(){t._createStartTagToken.call(this),this.currentToken.location=e.ctLoc;},_createEndTagToken(){t._createEndTagToken.call(this),this.currentToken.location=e.ctLoc;},_createCommentToken(){t._createCommentToken.call(this),this.currentToken.location=e.ctLoc;},_createDoctypeToken(n){t._createDoctypeToken.call(this,n),this.currentToken.location=e.ctLoc;},_createCharacterToken(n,s){t._createCharacterToken.call(this,n,s),this.currentCharacterToken.location=e.ctLoc;},_createEOFToken(){t._createEOFToken.call(this),this.currentToken.location=e._getCurrentLocation();},_createAttr(n){t._createAttr.call(this,n),e.currentAttrLocation=e._getCurrentLocation();},_leaveAttrName(n){t._leaveAttrName.call(this,n),e._attachCurrentAttrLocationInfo();},_leaveAttrValue(n){t._leaveAttrValue.call(this,n),e._attachCurrentAttrLocationInfo();},_emitCurrentToken(){const n=this.currentToken.location;this.currentCharacterToken&&(this.currentCharacterToken.location.endLine=n.startLine,this.currentCharacterToken.location.endCol=n.startCol,this.currentCharacterToken.location.endOffset=n.startOffset),this.currentToken.type===Ge.EOF_TOKEN?(n.endLine=n.startLine,n.endCol=n.startCol,n.endOffset=n.startOffset):(n.endLine=e.posTracker.line,n.endCol=e.posTracker.col+1,n.endOffset=e.posTracker.offset+1),t._emitCurrentToken.call(this);},_emitCurrentCharacterToken(){const n=this.currentCharacterToken&&this.currentCharacterToken.location;n&&-1===n.endOffset&&(n.endLine=e.posTracker.line,n.endCol=e.posTracker.col,n.endOffset=e.posTracker.offset),t._emitCurrentCharacterToken.call(this);}};return Object.keys(Ge.MODE).forEach(s=>{const r=Ge.MODE[s];n[r]=function(n){e.ctLoc=e._getCurrentLocation(),t[r].call(this,n);};}),n}};var Je=class extends je{constructor(e,t){super(e),this.onItemPop=t.onItemPop;}_getOverriddenMethods(e,t){return {pop(){e.onItemPop(this.current),t.pop.call(this);},popAllUpToHtmlElement(){for(let t=this.stackTop;t>0;t--)e.onItemPop(this.items[t]);t.popAllUpToHtmlElement.call(this);},remove(n){e.onItemPop(this.current),t.remove.call(this,n);}}}};const Ze=be.TAG_NAMES;var $e=class extends je{constructor(e){super(e),this.parser=e,this.treeAdapter=this.parser.treeAdapter,this.posTracker=null,this.lastStartTagToken=null,this.lastFosterParentingLocation=null,this.currentToken=null;}_setStartLocation(e){let t=null;this.lastStartTagToken&&(t=Object.assign({},this.lastStartTagToken.location),t.startTag=this.lastStartTagToken.location),this.treeAdapter.setNodeSourceCodeLocation(e,t);}_setEndLocation(e,t){if(this.treeAdapter.getNodeSourceCodeLocation(e)&&t.location){const n=t.location,s=this.treeAdapter.getTagName(e),r={};t.type===Ge.END_TAG_TOKEN&&s===t.tagName?(r.endTag=Object.assign({},n),r.endLine=n.endLine,r.endCol=n.endCol,r.endOffset=n.endOffset):(r.endLine=n.startLine,r.endCol=n.startCol,r.endOffset=n.startOffset),this.treeAdapter.updateNodeSourceCodeLocation(e,r);}}_getOverriddenMethods(e,t){return {_bootstrap(n,s){t._bootstrap.call(this,n,s),e.lastStartTagToken=null,e.lastFosterParentingLocation=null,e.currentToken=null;const r=je.install(this.tokenizer,qe);e.posTracker=r.posTracker,je.install(this.openElements,Je,{onItemPop:function(t){e._setEndLocation(t,e.currentToken);}});},_runParsingLoop(n){t._runParsingLoop.call(this,n);for(let t=this.openElements.stackTop;t>=0;t--)e._setEndLocation(this.openElements.items[t],e.currentToken);},_processTokenInForeignContent(n){e.currentToken=n,t._processTokenInForeignContent.call(this,n);},_processToken(n){e.currentToken=n,t._processToken.call(this,n);if(n.type===Ge.END_TAG_TOKEN&&(n.tagName===Ze.HTML||n.tagName===Ze.BODY&&this.openElements.hasInScope(Ze.BODY)))for(let t=this.openElements.stackTop;t>=0;t--){const s=this.openElements.items[t];if(this.treeAdapter.getTagName(s)===n.tagName){e._setEndLocation(s,n);break}}},_setDocumentType(e){t._setDocumentType.call(this,e);const n=this.treeAdapter.getChildNodes(this.document),s=n.length;for(let t=0;t<s;t++){const s=n[t];if(this.treeAdapter.isDocumentTypeNode(s)){this.treeAdapter.setNodeSourceCodeLocation(s,e.location);break}}},_attachElementToTree(n){e._setStartLocation(n),e.lastStartTagToken=null,t._attachElementToTree.call(this,n);},_appendElement(n,s){e.lastStartTagToken=n,t._appendElement.call(this,n,s);},_insertElement(n,s){e.lastStartTagToken=n,t._insertElement.call(this,n,s);},_insertTemplate(n){e.lastStartTagToken=n,t._insertTemplate.call(this,n);const s=this.treeAdapter.getTemplateContent(this.openElements.current);this.treeAdapter.setNodeSourceCodeLocation(s,null);},_insertFakeRootElement(){t._insertFakeRootElement.call(this),this.treeAdapter.setNodeSourceCodeLocation(this.openElements.current,null);},_appendCommentNode(e,n){t._appendCommentNode.call(this,e,n);const s=this.treeAdapter.getChildNodes(n),r=s[s.length-1];this.treeAdapter.setNodeSourceCodeLocation(r,e.location);},_findFosterParentingLocation(){return e.lastFosterParentingLocation=t._findFosterParentingLocation.call(this),e.lastFosterParentingLocation},_insertCharacters(n){t._insertCharacters.call(this,n);const s=this._shouldFosterParentOnInsertion(),r=s&&e.lastFosterParentingLocation.parent||this.openElements.currentTmplContent||this.openElements.current,i=this.treeAdapter.getChildNodes(r),T=s&&e.lastFosterParentingLocation.beforeElement?i.indexOf(e.lastFosterParentingLocation.beforeElement)-1:i.length-1,o=i[T];if(this.treeAdapter.getNodeSourceCodeLocation(o)){const{endLine:e,endCol:t,endOffset:s}=n.location;this.treeAdapter.updateNodeSourceCodeLocation(o,{endLine:e,endCol:t,endOffset:s});}else this.treeAdapter.setNodeSourceCodeLocation(o,n.location);}}}};var et=class extends je{constructor(e,t){super(e),this.posTracker=null,this.onParseError=t.onParseError;}_setErrorLocation(e){e.startLine=e.endLine=this.posTracker.line,e.startCol=e.endCol=this.posTracker.col,e.startOffset=e.endOffset=this.posTracker.offset;}_reportError(e){const t={code:e,startLine:-1,startCol:-1,startOffset:-1,endLine:-1,endCol:-1,endOffset:-1};this._setErrorLocation(t),this.onParseError(t);}_getOverriddenMethods(e){return {_err(t){e._reportError(t);}}}};var tt=class extends et{constructor(e,t){super(e,t),this.posTracker=je.install(e,ze),this.lastErrOffset=-1;}_reportError(e){this.lastErrOffset!==this.posTracker.offset&&(this.lastErrOffset=this.posTracker.offset,super._reportError(e));}};var nt=class extends et{constructor(e,t){super(e,t);const n=je.install(e.preprocessor,tt,t);this.posTracker=n.posTracker;}};var st=class extends et{constructor(e,t){super(e,t),this.opts=t,this.ctLoc=null,this.locBeforeToken=!1;}_setErrorLocation(e){this.ctLoc&&(e.startLine=this.ctLoc.startLine,e.startCol=this.ctLoc.startCol,e.startOffset=this.ctLoc.startOffset,e.endLine=this.locBeforeToken?this.ctLoc.startLine:this.ctLoc.endLine,e.endCol=this.locBeforeToken?this.ctLoc.startCol:this.ctLoc.endCol,e.endOffset=this.locBeforeToken?this.ctLoc.startOffset:this.ctLoc.endOffset);}_getOverriddenMethods(e,t){return {_bootstrap(n,s){t._bootstrap.call(this,n,s),je.install(this.tokenizer,nt,e.opts),je.install(this.tokenizer,qe);},_processInputToken(n){e.ctLoc=n.location,t._processInputToken.call(this,n);},_err(t,n){e.locBeforeToken=n&&n.beforeToken,e._reportError(t);}}}},rt=Ke((function(e,t){const{DOCUMENT_MODE:n}=be;t.createDocument=function(){return {nodeName:"#document",mode:n.NO_QUIRKS,childNodes:[]}},t.createDocumentFragment=function(){return {nodeName:"#document-fragment",childNodes:[]}},t.createElement=function(e,t,n){return {nodeName:e,tagName:e,attrs:n,namespaceURI:t,childNodes:[],parentNode:null}},t.createCommentNode=function(e){return {nodeName:"#comment",data:e,parentNode:null}};const s=function(e){return {nodeName:"#text",value:e,parentNode:null}},r=t.appendChild=function(e,t){e.childNodes.push(t),t.parentNode=e;},i=t.insertBefore=function(e,t,n){const s=e.childNodes.indexOf(n);e.childNodes.splice(s,0,t),t.parentNode=e;};t.setTemplateContent=function(e,t){e.content=t;},t.getTemplateContent=function(e){return e.content},t.setDocumentType=function(e,t,n,s){let i=null;for(let t=0;t<e.childNodes.length;t++)if("#documentType"===e.childNodes[t].nodeName){i=e.childNodes[t];break}i?(i.name=t,i.publicId=n,i.systemId=s):r(e,{nodeName:"#documentType",name:t,publicId:n,systemId:s});},t.setDocumentMode=function(e,t){e.mode=t;},t.getDocumentMode=function(e){return e.mode},t.detachNode=function(e){if(e.parentNode){const t=e.parentNode.childNodes.indexOf(e);e.parentNode.childNodes.splice(t,1),e.parentNode=null;}},t.insertText=function(e,t){if(e.childNodes.length){const n=e.childNodes[e.childNodes.length-1];if("#text"===n.nodeName)return void(n.value+=t)}r(e,s(t));},t.insertTextBefore=function(e,t,n){const r=e.childNodes[e.childNodes.indexOf(n)-1];r&&"#text"===r.nodeName?r.value+=t:i(e,s(t),n);},t.adoptAttributes=function(e,t){const n=[];for(let t=0;t<e.attrs.length;t++)n.push(e.attrs[t].name);for(let s=0;s<t.length;s++)-1===n.indexOf(t[s].name)&&e.attrs.push(t[s]);},t.getFirstChild=function(e){return e.childNodes[0]},t.getChildNodes=function(e){return e.childNodes},t.getParentNode=function(e){return e.parentNode},t.getAttrList=function(e){return e.attrs},t.getTagName=function(e){return e.tagName},t.getNamespaceURI=function(e){return e.namespaceURI},t.getTextNodeContent=function(e){return e.value},t.getCommentNodeContent=function(e){return e.data},t.getDocumentTypeNodeName=function(e){return e.name},t.getDocumentTypeNodePublicId=function(e){return e.publicId},t.getDocumentTypeNodeSystemId=function(e){return e.systemId},t.isTextNode=function(e){return "#text"===e.nodeName},t.isCommentNode=function(e){return "#comment"===e.nodeName},t.isDocumentTypeNode=function(e){return "#documentType"===e.nodeName},t.isElementNode=function(e){return !!e.tagName},t.setNodeSourceCodeLocation=function(e,t){e.sourceCodeLocation=t;},t.getNodeSourceCodeLocation=function(e){return e.sourceCodeLocation},t.updateNodeSourceCodeLocation=function(e,t){e.sourceCodeLocation=Object.assign(e.sourceCodeLocation,t);};}));rt.createDocument,rt.createDocumentFragment,rt.createElement,rt.createCommentNode,rt.appendChild,rt.insertBefore,rt.setTemplateContent,rt.getTemplateContent,rt.setDocumentType,rt.setDocumentMode,rt.getDocumentMode,rt.detachNode,rt.insertText,rt.insertTextBefore,rt.adoptAttributes,rt.getFirstChild,rt.getChildNodes,rt.getParentNode,rt.getAttrList,rt.getTagName,rt.getNamespaceURI,rt.getTextNodeContent,rt.getCommentNodeContent,rt.getDocumentTypeNodeName,rt.getDocumentTypeNodePublicId,rt.getDocumentTypeNodeSystemId,rt.isTextNode,rt.isCommentNode,rt.isDocumentTypeNode,rt.isElementNode,rt.setNodeSourceCodeLocation,rt.getNodeSourceCodeLocation,rt.updateNodeSourceCodeLocation;const{DOCUMENT_MODE:it}=be,Tt=["+//silmaril//dtd html pro v0r11 19970101//","-//as//dtd html 3.0 aswedit + extensions//","-//advasoft ltd//dtd html 3.0 aswedit + extensions//","-//ietf//dtd html 2.0 level 1//","-//ietf//dtd html 2.0 level 2//","-//ietf//dtd html 2.0 strict level 1//","-//ietf//dtd html 2.0 strict level 2//","-//ietf//dtd html 2.0 strict//","-//ietf//dtd html 2.0//","-//ietf//dtd html 2.1e//","-//ietf//dtd html 3.0//","-//ietf//dtd html 3.2 final//","-//ietf//dtd html 3.2//","-//ietf//dtd html 3//","-//ietf//dtd html level 0//","-//ietf//dtd html level 1//","-//ietf//dtd html level 2//","-//ietf//dtd html level 3//","-//ietf//dtd html strict level 0//","-//ietf//dtd html strict level 1//","-//ietf//dtd html strict level 2//","-//ietf//dtd html strict level 3//","-//ietf//dtd html strict//","-//ietf//dtd html//","-//metrius//dtd metrius presentational//","-//microsoft//dtd internet explorer 2.0 html strict//","-//microsoft//dtd internet explorer 2.0 html//","-//microsoft//dtd internet explorer 2.0 tables//","-//microsoft//dtd internet explorer 3.0 html strict//","-//microsoft//dtd internet explorer 3.0 html//","-//microsoft//dtd internet explorer 3.0 tables//","-//netscape comm. corp.//dtd html//","-//netscape comm. corp.//dtd strict html//","-//o'reilly and associates//dtd html 2.0//","-//o'reilly and associates//dtd html extended 1.0//","-//o'reilly and associates//dtd html extended relaxed 1.0//","-//sq//dtd html 2.0 hotmetal + extensions//","-//softquad software//dtd hotmetal pro 6.0::19990601::extensions to html 4.0//","-//softquad//dtd hotmetal pro 4.0::19971010::extensions to html 4.0//","-//spyglass//dtd html 2.0 extended//","-//sun microsystems corp.//dtd hotjava html//","-//sun microsystems corp.//dtd hotjava strict html//","-//w3c//dtd html 3 1995-03-24//","-//w3c//dtd html 3.2 draft//","-//w3c//dtd html 3.2 final//","-//w3c//dtd html 3.2//","-//w3c//dtd html 3.2s draft//","-//w3c//dtd html 4.0 frameset//","-//w3c//dtd html 4.0 transitional//","-//w3c//dtd html experimental 19960712//","-//w3c//dtd html experimental 970421//","-//w3c//dtd w3 html//","-//w3o//dtd w3 html 3.0//","-//webtechs//dtd mozilla html 2.0//","-//webtechs//dtd mozilla html//"],ot=Tt.concat(["-//w3c//dtd html 4.01 frameset//","-//w3c//dtd html 4.01 transitional//"]),Et=["-//w3o//dtd w3 html strict 3.0//en//","-/w3c/dtd html 4.0 transitional/en","html"],at=["-//w3c//dtd xhtml 1.0 frameset//","-//w3c//dtd xhtml 1.0 transitional//"],_t=at.concat(["-//w3c//dtd html 4.01 frameset//","-//w3c//dtd html 4.01 transitional//"]);function At(e,t){for(let n=0;n<t.length;n++)if(0===e.indexOf(t[n]))return !0;return !1}var ht=function(e){return "html"===e.name&&null===e.publicId&&(null===e.systemId||"about:legacy-compat"===e.systemId)},ct=function(e){if("html"!==e.name)return it.QUIRKS;const t=e.systemId;if(t&&"http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd"===t.toLowerCase())return it.QUIRKS;let n=e.publicId;if(null!==n){if(n=n.toLowerCase(),Et.indexOf(n)>-1)return it.QUIRKS;let e=null===t?ot:Tt;if(At(n,e))return it.QUIRKS;if(e=null===t?at:_t,At(n,e))return it.LIMITED_QUIRKS}return it.NO_QUIRKS},lt=Ke((function(e,t){const n=be.TAG_NAMES,s=be.NAMESPACES,r=be.ATTRS,i="text/html",T="application/xhtml+xml",o={attributename:"attributeName",attributetype:"attributeType",basefrequency:"baseFrequency",baseprofile:"baseProfile",calcmode:"calcMode",clippathunits:"clipPathUnits",diffuseconstant:"diffuseConstant",edgemode:"edgeMode",filterunits:"filterUnits",glyphref:"glyphRef",gradienttransform:"gradientTransform",gradientunits:"gradientUnits",kernelmatrix:"kernelMatrix",kernelunitlength:"kernelUnitLength",keypoints:"keyPoints",keysplines:"keySplines",keytimes:"keyTimes",lengthadjust:"lengthAdjust",limitingconeangle:"limitingConeAngle",markerheight:"markerHeight",markerunits:"markerUnits",markerwidth:"markerWidth",maskcontentunits:"maskContentUnits",maskunits:"maskUnits",numoctaves:"numOctaves",pathlength:"pathLength",patterncontentunits:"patternContentUnits",patterntransform:"patternTransform",patternunits:"patternUnits",pointsatx:"pointsAtX",pointsaty:"pointsAtY",pointsatz:"pointsAtZ",preservealpha:"preserveAlpha",preserveaspectratio:"preserveAspectRatio",primitiveunits:"primitiveUnits",refx:"refX",refy:"refY",repeatcount:"repeatCount",repeatdur:"repeatDur",requiredextensions:"requiredExtensions",requiredfeatures:"requiredFeatures",specularconstant:"specularConstant",specularexponent:"specularExponent",spreadmethod:"spreadMethod",startoffset:"startOffset",stddeviation:"stdDeviation",stitchtiles:"stitchTiles",surfacescale:"surfaceScale",systemlanguage:"systemLanguage",tablevalues:"tableValues",targetx:"targetX",targety:"targetY",textlength:"textLength",viewbox:"viewBox",viewtarget:"viewTarget",xchannelselector:"xChannelSelector",ychannelselector:"yChannelSelector",zoomandpan:"zoomAndPan"},E={"xlink:actuate":{prefix:"xlink",name:"actuate",namespace:s.XLINK},"xlink:arcrole":{prefix:"xlink",name:"arcrole",namespace:s.XLINK},"xlink:href":{prefix:"xlink",name:"href",namespace:s.XLINK},"xlink:role":{prefix:"xlink",name:"role",namespace:s.XLINK},"xlink:show":{prefix:"xlink",name:"show",namespace:s.XLINK},"xlink:title":{prefix:"xlink",name:"title",namespace:s.XLINK},"xlink:type":{prefix:"xlink",name:"type",namespace:s.XLINK},"xml:base":{prefix:"xml",name:"base",namespace:s.XML},"xml:lang":{prefix:"xml",name:"lang",namespace:s.XML},"xml:space":{prefix:"xml",name:"space",namespace:s.XML},xmlns:{prefix:"",name:"xmlns",namespace:s.XMLNS},"xmlns:xlink":{prefix:"xmlns",name:"xlink",namespace:s.XMLNS}},a=t.SVG_TAG_NAMES_ADJUSTMENT_MAP={altglyph:"altGlyph",altglyphdef:"altGlyphDef",altglyphitem:"altGlyphItem",animatecolor:"animateColor",animatemotion:"animateMotion",animatetransform:"animateTransform",clippath:"clipPath",feblend:"feBlend",fecolormatrix:"feColorMatrix",fecomponenttransfer:"feComponentTransfer",fecomposite:"feComposite",feconvolvematrix:"feConvolveMatrix",fediffuselighting:"feDiffuseLighting",fedisplacementmap:"feDisplacementMap",fedistantlight:"feDistantLight",feflood:"feFlood",fefunca:"feFuncA",fefuncb:"feFuncB",fefuncg:"feFuncG",fefuncr:"feFuncR",fegaussianblur:"feGaussianBlur",feimage:"feImage",femerge:"feMerge",femergenode:"feMergeNode",femorphology:"feMorphology",feoffset:"feOffset",fepointlight:"fePointLight",fespecularlighting:"feSpecularLighting",fespotlight:"feSpotLight",fetile:"feTile",feturbulence:"feTurbulence",foreignobject:"foreignObject",glyphref:"glyphRef",lineargradient:"linearGradient",radialgradient:"radialGradient",textpath:"textPath"},_={[n.B]:!0,[n.BIG]:!0,[n.BLOCKQUOTE]:!0,[n.BODY]:!0,[n.BR]:!0,[n.CENTER]:!0,[n.CODE]:!0,[n.DD]:!0,[n.DIV]:!0,[n.DL]:!0,[n.DT]:!0,[n.EM]:!0,[n.EMBED]:!0,[n.H1]:!0,[n.H2]:!0,[n.H3]:!0,[n.H4]:!0,[n.H5]:!0,[n.H6]:!0,[n.HEAD]:!0,[n.HR]:!0,[n.I]:!0,[n.IMG]:!0,[n.LI]:!0,[n.LISTING]:!0,[n.MENU]:!0,[n.META]:!0,[n.NOBR]:!0,[n.OL]:!0,[n.P]:!0,[n.PRE]:!0,[n.RUBY]:!0,[n.S]:!0,[n.SMALL]:!0,[n.SPAN]:!0,[n.STRONG]:!0,[n.STRIKE]:!0,[n.SUB]:!0,[n.SUP]:!0,[n.TABLE]:!0,[n.TT]:!0,[n.U]:!0,[n.UL]:!0,[n.VAR]:!0};t.causesExit=function(e){const t=e.tagName;return !!(t===n.FONT&&(null!==Ge.getTokenAttr(e,r.COLOR)||null!==Ge.getTokenAttr(e,r.SIZE)||null!==Ge.getTokenAttr(e,r.FACE)))||_[t]},t.adjustTokenMathMLAttrs=function(e){for(let t=0;t<e.attrs.length;t++)if("definitionurl"===e.attrs[t].name){e.attrs[t].name="definitionURL";break}},t.adjustTokenSVGAttrs=function(e){for(let t=0;t<e.attrs.length;t++){const n=o[e.attrs[t].name];n&&(e.attrs[t].name=n);}},t.adjustTokenXMLAttrs=function(e){for(let t=0;t<e.attrs.length;t++){const n=E[e.attrs[t].name];n&&(e.attrs[t].prefix=n.prefix,e.attrs[t].name=n.name,e.attrs[t].namespace=n.namespace);}},t.adjustTokenSVGTagName=function(e){const t=a[e.tagName];t&&(e.tagName=t);},t.isIntegrationPoint=function(e,t,o,E){return !(E&&E!==s.HTML||!function(e,t,o){if(t===s.MATHML&&e===n.ANNOTATION_XML)for(let e=0;e<o.length;e++)if(o[e].name===r.ENCODING){const t=o[e].value.toLowerCase();return t===i||t===T}return t===s.SVG&&(e===n.FOREIGN_OBJECT||e===n.DESC||e===n.TITLE)}(e,t,o))||!(E&&E!==s.MATHML||!function(e,t){return t===s.MATHML&&(e===n.MI||e===n.MO||e===n.MN||e===n.MS||e===n.MTEXT)}(e,t))};}));lt.SVG_TAG_NAMES_ADJUSTMENT_MAP,lt.causesExit,lt.adjustTokenMathMLAttrs,lt.adjustTokenSVGAttrs,lt.adjustTokenXMLAttrs,lt.adjustTokenSVGTagName,lt.isIntegrationPoint;const mt=be.TAG_NAMES,pt=be.NAMESPACES,Nt=be.ATTRS,ut={scriptingEnabled:!0,sourceCodeLocationInfo:!1,onParseError:null,treeAdapter:rt},Ot="IN_TABLE_MODE",St={[mt.TR]:"IN_ROW_MODE",[mt.TBODY]:"IN_TABLE_BODY_MODE",[mt.THEAD]:"IN_TABLE_BODY_MODE",[mt.TFOOT]:"IN_TABLE_BODY_MODE",[mt.CAPTION]:"IN_CAPTION_MODE",[mt.COLGROUP]:"IN_COLUMN_GROUP_MODE",[mt.TABLE]:Ot,[mt.BODY]:"IN_BODY_MODE",[mt.FRAMESET]:"IN_FRAMESET_MODE"},Ct={[mt.CAPTION]:Ot,[mt.COLGROUP]:Ot,[mt.TBODY]:Ot,[mt.TFOOT]:Ot,[mt.THEAD]:Ot,[mt.COL]:"IN_COLUMN_GROUP_MODE",[mt.TR]:"IN_TABLE_BODY_MODE",[mt.TD]:"IN_ROW_MODE",[mt.TH]:"IN_ROW_MODE"},dt={INITIAL_MODE:{[Ge.CHARACTER_TOKEN]:Kt,[Ge.NULL_CHARACTER_TOKEN]:Kt,[Ge.WHITESPACE_CHARACTER_TOKEN]:kt,[Ge.COMMENT_TOKEN]:Ut,[Ge.DOCTYPE_TOKEN]:function(e,t){e._setDocumentType(t);const n=t.forceQuirks?be.DOCUMENT_MODE.QUIRKS:ct(t);ht(t)||e._err(ie);e.treeAdapter.setDocumentMode(e.document,n),e.insertionMode="BEFORE_HTML_MODE";},[Ge.START_TAG_TOKEN]:Kt,[Ge.END_TAG_TOKEN]:Kt,[Ge.EOF_TOKEN]:Kt},BEFORE_HTML_MODE:{[Ge.CHARACTER_TOKEN]:bt,[Ge.NULL_CHARACTER_TOKEN]:bt,[Ge.WHITESPACE_CHARACTER_TOKEN]:kt,[Ge.COMMENT_TOKEN]:Ut,[Ge.DOCTYPE_TOKEN]:kt,[Ge.START_TAG_TOKEN]:function(e,t){t.tagName===mt.HTML?(e._insertElement(t,pt.HTML),e.insertionMode="BEFORE_HEAD_MODE"):bt(e,t);},[Ge.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n!==mt.HTML&&n!==mt.HEAD&&n!==mt.BODY&&n!==mt.BR||bt(e,t);},[Ge.EOF_TOKEN]:bt},BEFORE_HEAD_MODE:{[Ge.CHARACTER_TOKEN]:Yt,[Ge.NULL_CHARACTER_TOKEN]:Yt,[Ge.WHITESPACE_CHARACTER_TOKEN]:kt,[Ge.COMMENT_TOKEN]:Ut,[Ge.DOCTYPE_TOKEN]:Ht,[Ge.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===mt.HTML?sn(e,t):n===mt.HEAD?(e._insertElement(t,pt.HTML),e.headElement=e.openElements.current,e.insertionMode="IN_HEAD_MODE"):Yt(e,t);},[Ge.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===mt.HEAD||n===mt.BODY||n===mt.HTML||n===mt.BR?Yt(e,t):e._err(Ee);},[Ge.EOF_TOKEN]:Yt},IN_HEAD_MODE:{[Ge.CHARACTER_TOKEN]:vt,[Ge.NULL_CHARACTER_TOKEN]:vt,[Ge.WHITESPACE_CHARACTER_TOKEN]:Bt,[Ge.COMMENT_TOKEN]:Ut,[Ge.DOCTYPE_TOKEN]:Ht,[Ge.START_TAG_TOKEN]:xt,[Ge.END_TAG_TOKEN]:yt,[Ge.EOF_TOKEN]:vt},IN_HEAD_NO_SCRIPT_MODE:{[Ge.CHARACTER_TOKEN]:wt,[Ge.NULL_CHARACTER_TOKEN]:wt,[Ge.WHITESPACE_CHARACTER_TOKEN]:Bt,[Ge.COMMENT_TOKEN]:Ut,[Ge.DOCTYPE_TOKEN]:Ht,[Ge.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===mt.HTML?sn(e,t):n===mt.BASEFONT||n===mt.BGSOUND||n===mt.HEAD||n===mt.LINK||n===mt.META||n===mt.NOFRAMES||n===mt.STYLE?xt(e,t):n===mt.NOSCRIPT?e._err(le):wt(e,t);},[Ge.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===mt.NOSCRIPT?(e.openElements.pop(),e.insertionMode="IN_HEAD_MODE"):n===mt.BR?wt(e,t):e._err(Ee);},[Ge.EOF_TOKEN]:wt},AFTER_HEAD_MODE:{[Ge.CHARACTER_TOKEN]:Qt,[Ge.NULL_CHARACTER_TOKEN]:Qt,[Ge.WHITESPACE_CHARACTER_TOKEN]:Bt,[Ge.COMMENT_TOKEN]:Ut,[Ge.DOCTYPE_TOKEN]:Ht,[Ge.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===mt.HTML?sn(e,t):n===mt.BODY?(e._insertElement(t,pt.HTML),e.framesetOk=!1,e.insertionMode="IN_BODY_MODE"):n===mt.FRAMESET?(e._insertElement(t,pt.HTML),e.insertionMode="IN_FRAMESET_MODE"):n===mt.BASE||n===mt.BASEFONT||n===mt.BGSOUND||n===mt.LINK||n===mt.META||n===mt.NOFRAMES||n===mt.SCRIPT||n===mt.STYLE||n===mt.TEMPLATE||n===mt.TITLE?(e._err(he),e.openElements.push(e.headElement),xt(e,t),e.openElements.remove(e.headElement)):n===mt.HEAD?e._err(ce):Qt(e,t);},[Ge.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===mt.BODY||n===mt.HTML||n===mt.BR?Qt(e,t):n===mt.TEMPLATE?yt(e,t):e._err(Ee);},[Ge.EOF_TOKEN]:Qt},IN_BODY_MODE:{[Ge.CHARACTER_TOKEN]:Wt,[Ge.NULL_CHARACTER_TOKEN]:kt,[Ge.WHITESPACE_CHARACTER_TOKEN]:Xt,[Ge.COMMENT_TOKEN]:Ut,[Ge.DOCTYPE_TOKEN]:kt,[Ge.START_TAG_TOKEN]:sn,[Ge.END_TAG_TOKEN]:En,[Ge.EOF_TOKEN]:an},TEXT_MODE:{[Ge.CHARACTER_TOKEN]:Bt,[Ge.NULL_CHARACTER_TOKEN]:Bt,[Ge.WHITESPACE_CHARACTER_TOKEN]:Bt,[Ge.COMMENT_TOKEN]:kt,[Ge.DOCTYPE_TOKEN]:kt,[Ge.START_TAG_TOKEN]:kt,[Ge.END_TAG_TOKEN]:function(e,t){t.tagName===mt.SCRIPT&&(e.pendingScript=e.openElements.current);e.openElements.pop(),e.insertionMode=e.originalInsertionMode;},[Ge.EOF_TOKEN]:function(e,t){e._err(me),e.openElements.pop(),e.insertionMode=e.originalInsertionMode,e._processToken(t);}},[Ot]:{[Ge.CHARACTER_TOKEN]:_n,[Ge.NULL_CHARACTER_TOKEN]:_n,[Ge.WHITESPACE_CHARACTER_TOKEN]:_n,[Ge.COMMENT_TOKEN]:Ut,[Ge.DOCTYPE_TOKEN]:kt,[Ge.START_TAG_TOKEN]:An,[Ge.END_TAG_TOKEN]:hn,[Ge.EOF_TOKEN]:an},IN_TABLE_TEXT_MODE:{[Ge.CHARACTER_TOKEN]:function(e,t){e.pendingCharacterTokens.push(t),e.hasNonWhitespacePendingCharacterToken=!0;},[Ge.NULL_CHARACTER_TOKEN]:kt,[Ge.WHITESPACE_CHARACTER_TOKEN]:function(e,t){e.pendingCharacterTokens.push(t);},[Ge.COMMENT_TOKEN]:ln,[Ge.DOCTYPE_TOKEN]:ln,[Ge.START_TAG_TOKEN]:ln,[Ge.END_TAG_TOKEN]:ln,[Ge.EOF_TOKEN]:ln},IN_CAPTION_MODE:{[Ge.CHARACTER_TOKEN]:Wt,[Ge.NULL_CHARACTER_TOKEN]:kt,[Ge.WHITESPACE_CHARACTER_TOKEN]:Xt,[Ge.COMMENT_TOKEN]:Ut,[Ge.DOCTYPE_TOKEN]:kt,[Ge.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===mt.CAPTION||n===mt.COL||n===mt.COLGROUP||n===mt.TBODY||n===mt.TD||n===mt.TFOOT||n===mt.TH||n===mt.THEAD||n===mt.TR?e.openElements.hasInTableScope(mt.CAPTION)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(mt.CAPTION),e.activeFormattingElements.clearToLastMarker(),e.insertionMode=Ot,e._processToken(t)):sn(e,t);},[Ge.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===mt.CAPTION||n===mt.TABLE?e.openElements.hasInTableScope(mt.CAPTION)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(mt.CAPTION),e.activeFormattingElements.clearToLastMarker(),e.insertionMode=Ot,n===mt.TABLE&&e._processToken(t)):n!==mt.BODY&&n!==mt.COL&&n!==mt.COLGROUP&&n!==mt.HTML&&n!==mt.TBODY&&n!==mt.TD&&n!==mt.TFOOT&&n!==mt.TH&&n!==mt.THEAD&&n!==mt.TR&&En(e,t);},[Ge.EOF_TOKEN]:an},IN_COLUMN_GROUP_MODE:{[Ge.CHARACTER_TOKEN]:mn,[Ge.NULL_CHARACTER_TOKEN]:mn,[Ge.WHITESPACE_CHARACTER_TOKEN]:Bt,[Ge.COMMENT_TOKEN]:Ut,[Ge.DOCTYPE_TOKEN]:kt,[Ge.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===mt.HTML?sn(e,t):n===mt.COL?(e._appendElement(t,pt.HTML),t.ackSelfClosing=!0):n===mt.TEMPLATE?xt(e,t):mn(e,t);},[Ge.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===mt.COLGROUP?e.openElements.currentTagName===mt.COLGROUP&&(e.openElements.pop(),e.insertionMode=Ot):n===mt.TEMPLATE?yt(e,t):n!==mt.COL&&mn(e,t);},[Ge.EOF_TOKEN]:an},IN_TABLE_BODY_MODE:{[Ge.CHARACTER_TOKEN]:_n,[Ge.NULL_CHARACTER_TOKEN]:_n,[Ge.WHITESPACE_CHARACTER_TOKEN]:_n,[Ge.COMMENT_TOKEN]:Ut,[Ge.DOCTYPE_TOKEN]:kt,[Ge.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===mt.TR?(e.openElements.clearBackToTableBodyContext(),e._insertElement(t,pt.HTML),e.insertionMode="IN_ROW_MODE"):n===mt.TH||n===mt.TD?(e.openElements.clearBackToTableBodyContext(),e._insertFakeElement(mt.TR),e.insertionMode="IN_ROW_MODE",e._processToken(t)):n===mt.CAPTION||n===mt.COL||n===mt.COLGROUP||n===mt.TBODY||n===mt.TFOOT||n===mt.THEAD?e.openElements.hasTableBodyContextInTableScope()&&(e.openElements.clearBackToTableBodyContext(),e.openElements.pop(),e.insertionMode=Ot,e._processToken(t)):An(e,t);},[Ge.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===mt.TBODY||n===mt.TFOOT||n===mt.THEAD?e.openElements.hasInTableScope(n)&&(e.openElements.clearBackToTableBodyContext(),e.openElements.pop(),e.insertionMode=Ot):n===mt.TABLE?e.openElements.hasTableBodyContextInTableScope()&&(e.openElements.clearBackToTableBodyContext(),e.openElements.pop(),e.insertionMode=Ot,e._processToken(t)):(n!==mt.BODY&&n!==mt.CAPTION&&n!==mt.COL&&n!==mt.COLGROUP||n!==mt.HTML&&n!==mt.TD&&n!==mt.TH&&n!==mt.TR)&&hn(e,t);},[Ge.EOF_TOKEN]:an},IN_ROW_MODE:{[Ge.CHARACTER_TOKEN]:_n,[Ge.NULL_CHARACTER_TOKEN]:_n,[Ge.WHITESPACE_CHARACTER_TOKEN]:_n,[Ge.COMMENT_TOKEN]:Ut,[Ge.DOCTYPE_TOKEN]:kt,[Ge.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===mt.TH||n===mt.TD?(e.openElements.clearBackToTableRowContext(),e._insertElement(t,pt.HTML),e.insertionMode="IN_CELL_MODE",e.activeFormattingElements.insertMarker()):n===mt.CAPTION||n===mt.COL||n===mt.COLGROUP||n===mt.TBODY||n===mt.TFOOT||n===mt.THEAD||n===mt.TR?e.openElements.hasInTableScope(mt.TR)&&(e.openElements.clearBackToTableRowContext(),e.openElements.pop(),e.insertionMode="IN_TABLE_BODY_MODE",e._processToken(t)):An(e,t);},[Ge.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===mt.TR?e.openElements.hasInTableScope(mt.TR)&&(e.openElements.clearBackToTableRowContext(),e.openElements.pop(),e.insertionMode="IN_TABLE_BODY_MODE"):n===mt.TABLE?e.openElements.hasInTableScope(mt.TR)&&(e.openElements.clearBackToTableRowContext(),e.openElements.pop(),e.insertionMode="IN_TABLE_BODY_MODE",e._processToken(t)):n===mt.TBODY||n===mt.TFOOT||n===mt.THEAD?(e.openElements.hasInTableScope(n)||e.openElements.hasInTableScope(mt.TR))&&(e.openElements.clearBackToTableRowContext(),e.openElements.pop(),e.insertionMode="IN_TABLE_BODY_MODE",e._processToken(t)):(n!==mt.BODY&&n!==mt.CAPTION&&n!==mt.COL&&n!==mt.COLGROUP||n!==mt.HTML&&n!==mt.TD&&n!==mt.TH)&&hn(e,t);},[Ge.EOF_TOKEN]:an},IN_CELL_MODE:{[Ge.CHARACTER_TOKEN]:Wt,[Ge.NULL_CHARACTER_TOKEN]:kt,[Ge.WHITESPACE_CHARACTER_TOKEN]:Xt,[Ge.COMMENT_TOKEN]:Ut,[Ge.DOCTYPE_TOKEN]:kt,[Ge.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===mt.CAPTION||n===mt.COL||n===mt.COLGROUP||n===mt.TBODY||n===mt.TD||n===mt.TFOOT||n===mt.TH||n===mt.THEAD||n===mt.TR?(e.openElements.hasInTableScope(mt.TD)||e.openElements.hasInTableScope(mt.TH))&&(e._closeTableCell(),e._processToken(t)):sn(e,t);},[Ge.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===mt.TD||n===mt.TH?e.openElements.hasInTableScope(n)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(n),e.activeFormattingElements.clearToLastMarker(),e.insertionMode="IN_ROW_MODE"):n===mt.TABLE||n===mt.TBODY||n===mt.TFOOT||n===mt.THEAD||n===mt.TR?e.openElements.hasInTableScope(n)&&(e._closeTableCell(),e._processToken(t)):n!==mt.BODY&&n!==mt.CAPTION&&n!==mt.COL&&n!==mt.COLGROUP&&n!==mt.HTML&&En(e,t);},[Ge.EOF_TOKEN]:an},IN_SELECT_MODE:{[Ge.CHARACTER_TOKEN]:Bt,[Ge.NULL_CHARACTER_TOKEN]:kt,[Ge.WHITESPACE_CHARACTER_TOKEN]:Bt,[Ge.COMMENT_TOKEN]:Ut,[Ge.DOCTYPE_TOKEN]:kt,[Ge.START_TAG_TOKEN]:pn,[Ge.END_TAG_TOKEN]:Nn,[Ge.EOF_TOKEN]:an},IN_SELECT_IN_TABLE_MODE:{[Ge.CHARACTER_TOKEN]:Bt,[Ge.NULL_CHARACTER_TOKEN]:kt,[Ge.WHITESPACE_CHARACTER_TOKEN]:Bt,[Ge.COMMENT_TOKEN]:Ut,[Ge.DOCTYPE_TOKEN]:kt,[Ge.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===mt.CAPTION||n===mt.TABLE||n===mt.TBODY||n===mt.TFOOT||n===mt.THEAD||n===mt.TR||n===mt.TD||n===mt.TH?(e.openElements.popUntilTagNamePopped(mt.SELECT),e._resetInsertionMode(),e._processToken(t)):pn(e,t);},[Ge.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===mt.CAPTION||n===mt.TABLE||n===mt.TBODY||n===mt.TFOOT||n===mt.THEAD||n===mt.TR||n===mt.TD||n===mt.TH?e.openElements.hasInTableScope(n)&&(e.openElements.popUntilTagNamePopped(mt.SELECT),e._resetInsertionMode(),e._processToken(t)):Nn(e,t);},[Ge.EOF_TOKEN]:an},IN_TEMPLATE_MODE:{[Ge.CHARACTER_TOKEN]:Wt,[Ge.NULL_CHARACTER_TOKEN]:kt,[Ge.WHITESPACE_CHARACTER_TOKEN]:Xt,[Ge.COMMENT_TOKEN]:Ut,[Ge.DOCTYPE_TOKEN]:kt,[Ge.START_TAG_TOKEN]:function(e,t){const n=t.tagName;if(n===mt.BASE||n===mt.BASEFONT||n===mt.BGSOUND||n===mt.LINK||n===mt.META||n===mt.NOFRAMES||n===mt.SCRIPT||n===mt.STYLE||n===mt.TEMPLATE||n===mt.TITLE)xt(e,t);else {const s=Ct[n]||"IN_BODY_MODE";e._popTmplInsertionMode(),e._pushTmplInsertionMode(s),e.insertionMode=s,e._processToken(t);}},[Ge.END_TAG_TOKEN]:function(e,t){t.tagName===mt.TEMPLATE&&yt(e,t);},[Ge.EOF_TOKEN]:un},AFTER_BODY_MODE:{[Ge.CHARACTER_TOKEN]:On,[Ge.NULL_CHARACTER_TOKEN]:On,[Ge.WHITESPACE_CHARACTER_TOKEN]:Xt,[Ge.COMMENT_TOKEN]:function(e,t){e._appendCommentNode(t,e.openElements.items[0]);},[Ge.DOCTYPE_TOKEN]:kt,[Ge.START_TAG_TOKEN]:function(e,t){t.tagName===mt.HTML?sn(e,t):On(e,t);},[Ge.END_TAG_TOKEN]:function(e,t){t.tagName===mt.HTML?e.fragmentContext||(e.insertionMode="AFTER_AFTER_BODY_MODE"):On(e,t);},[Ge.EOF_TOKEN]:Gt},IN_FRAMESET_MODE:{[Ge.CHARACTER_TOKEN]:kt,[Ge.NULL_CHARACTER_TOKEN]:kt,[Ge.WHITESPACE_CHARACTER_TOKEN]:Bt,[Ge.COMMENT_TOKEN]:Ut,[Ge.DOCTYPE_TOKEN]:kt,[Ge.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===mt.HTML?sn(e,t):n===mt.FRAMESET?e._insertElement(t,pt.HTML):n===mt.FRAME?(e._appendElement(t,pt.HTML),t.ackSelfClosing=!0):n===mt.NOFRAMES&&xt(e,t);},[Ge.END_TAG_TOKEN]:function(e,t){t.tagName!==mt.FRAMESET||e.openElements.isRootHtmlElementCurrent()||(e.openElements.pop(),e.fragmentContext||e.openElements.currentTagName===mt.FRAMESET||(e.insertionMode="AFTER_FRAMESET_MODE"));},[Ge.EOF_TOKEN]:Gt},AFTER_FRAMESET_MODE:{[Ge.CHARACTER_TOKEN]:kt,[Ge.NULL_CHARACTER_TOKEN]:kt,[Ge.WHITESPACE_CHARACTER_TOKEN]:Bt,[Ge.COMMENT_TOKEN]:Ut,[Ge.DOCTYPE_TOKEN]:kt,[Ge.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===mt.HTML?sn(e,t):n===mt.NOFRAMES&&xt(e,t);},[Ge.END_TAG_TOKEN]:function(e,t){t.tagName===mt.HTML&&(e.insertionMode="AFTER_AFTER_FRAMESET_MODE");},[Ge.EOF_TOKEN]:Gt},AFTER_AFTER_BODY_MODE:{[Ge.CHARACTER_TOKEN]:Sn,[Ge.NULL_CHARACTER_TOKEN]:Sn,[Ge.WHITESPACE_CHARACTER_TOKEN]:Xt,[Ge.COMMENT_TOKEN]:Ft,[Ge.DOCTYPE_TOKEN]:kt,[Ge.START_TAG_TOKEN]:function(e,t){t.tagName===mt.HTML?sn(e,t):Sn(e,t);},[Ge.END_TAG_TOKEN]:Sn,[Ge.EOF_TOKEN]:Gt},AFTER_AFTER_FRAMESET_MODE:{[Ge.CHARACTER_TOKEN]:kt,[Ge.NULL_CHARACTER_TOKEN]:kt,[Ge.WHITESPACE_CHARACTER_TOKEN]:Xt,[Ge.COMMENT_TOKEN]:Ft,[Ge.DOCTYPE_TOKEN]:kt,[Ge.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===mt.HTML?sn(e,t):n===mt.NOFRAMES&&xt(e,t);},[Ge.END_TAG_TOKEN]:kt,[Ge.EOF_TOKEN]:Gt}};var Rt=class{constructor(e){this.options=function(e,t){return [e,t=t||Object.create(null)].reduce((e,t)=>(Object.keys(t).forEach(n=>{e[n]=t[n];}),e),Object.create(null))}(ut,e),this.treeAdapter=this.options.treeAdapter,this.pendingScript=null,this.options.sourceCodeLocationInfo&&je.install(this,$e),this.options.onParseError&&je.install(this,st,{onParseError:this.options.onParseError});}parse(e){const t=this.treeAdapter.createDocument();return this._bootstrap(t,null),this.tokenizer.write(e,!0),this._runParsingLoop(null),t}parseFragment(e,t){t||(t=this.treeAdapter.createElement(mt.TEMPLATE,pt.HTML,[]));const n=this.treeAdapter.createElement("documentmock",pt.HTML,[]);this._bootstrap(n,t),this.treeAdapter.getTagName(t)===mt.TEMPLATE&&this._pushTmplInsertionMode("IN_TEMPLATE_MODE"),this._initTokenizerForFragmentParsing(),this._insertFakeRootElement(),this._resetInsertionMode(),this._findFormInFragmentContext(),this.tokenizer.write(e,!0),this._runParsingLoop(null);const s=this.treeAdapter.getFirstChild(n),r=this.treeAdapter.createDocumentFragment();return this._adoptNodes(s,r),r}_bootstrap(e,t){this.tokenizer=new Ge(this.options),this.stopped=!1,this.insertionMode="INITIAL_MODE",this.originalInsertionMode="",this.document=e,this.fragmentContext=t,this.headElement=null,this.formElement=null,this.openElements=new Qe(this.document,this.treeAdapter),this.activeFormattingElements=new We(this.treeAdapter),this.tmplInsertionModeStack=[],this.tmplInsertionModeStackTop=-1,this.currentTmplInsertionMode=null,this.pendingCharacterTokens=[],this.hasNonWhitespacePendingCharacterToken=!1,this.framesetOk=!0,this.skipNextNewLine=!1,this.fosterParentingEnabled=!1;}_err(){}_runParsingLoop(e){for(;!this.stopped;){this._setupTokenizerCDATAMode();const t=this.tokenizer.getNextToken();if(t.type===Ge.HIBERNATION_TOKEN)break;if(this.skipNextNewLine&&(this.skipNextNewLine=!1,t.type===Ge.WHITESPACE_CHARACTER_TOKEN&&"\n"===t.chars[0])){if(1===t.chars.length)continue;t.chars=t.chars.substr(1);}if(this._processInputToken(t),e&&this.pendingScript)break}}runParsingLoopForCurrentChunk(e,t){if(this._runParsingLoop(t),t&&this.pendingScript){const e=this.pendingScript;return this.pendingScript=null,void t(e)}e&&e();}_setupTokenizerCDATAMode(){const e=this._getAdjustedCurrentElement();this.tokenizer.allowCDATA=e&&e!==this.document&&this.treeAdapter.getNamespaceURI(e)!==pt.HTML&&!this._isIntegrationPoint(e);}_switchToTextParsing(e,t){this._insertElement(e,pt.HTML),this.tokenizer.state=t,this.originalInsertionMode=this.insertionMode,this.insertionMode="TEXT_MODE";}switchToPlaintextParsing(){this.insertionMode="TEXT_MODE",this.originalInsertionMode="IN_BODY_MODE",this.tokenizer.state=Ge.MODE.PLAINTEXT;}_getAdjustedCurrentElement(){return 0===this.openElements.stackTop&&this.fragmentContext?this.fragmentContext:this.openElements.current}_findFormInFragmentContext(){let e=this.fragmentContext;do{if(this.treeAdapter.getTagName(e)===mt.FORM){this.formElement=e;break}e=this.treeAdapter.getParentNode(e);}while(e)}_initTokenizerForFragmentParsing(){if(this.treeAdapter.getNamespaceURI(this.fragmentContext)===pt.HTML){const e=this.treeAdapter.getTagName(this.fragmentContext);e===mt.TITLE||e===mt.TEXTAREA?this.tokenizer.state=Ge.MODE.RCDATA:e===mt.STYLE||e===mt.XMP||e===mt.IFRAME||e===mt.NOEMBED||e===mt.NOFRAMES||e===mt.NOSCRIPT?this.tokenizer.state=Ge.MODE.RAWTEXT:e===mt.SCRIPT?this.tokenizer.state=Ge.MODE.SCRIPT_DATA:e===mt.PLAINTEXT&&(this.tokenizer.state=Ge.MODE.PLAINTEXT);}}_setDocumentType(e){const t=e.name||"",n=e.publicId||"",s=e.systemId||"";this.treeAdapter.setDocumentType(this.document,t,n,s);}_attachElementToTree(e){if(this._shouldFosterParentOnInsertion())this._fosterParentElement(e);else {const t=this.openElements.currentTmplContent||this.openElements.current;this.treeAdapter.appendChild(t,e);}}_appendElement(e,t){const n=this.treeAdapter.createElement(e.tagName,t,e.attrs);this._attachElementToTree(n);}_insertElement(e,t){const n=this.treeAdapter.createElement(e.tagName,t,e.attrs);this._attachElementToTree(n),this.openElements.push(n);}_insertFakeElement(e){const t=this.treeAdapter.createElement(e,pt.HTML,[]);this._attachElementToTree(t),this.openElements.push(t);}_insertTemplate(e){const t=this.treeAdapter.createElement(e.tagName,pt.HTML,e.attrs),n=this.treeAdapter.createDocumentFragment();this.treeAdapter.setTemplateContent(t,n),this._attachElementToTree(t),this.openElements.push(t);}_insertFakeRootElement(){const e=this.treeAdapter.createElement(mt.HTML,pt.HTML,[]);this.treeAdapter.appendChild(this.openElements.current,e),this.openElements.push(e);}_appendCommentNode(e,t){const n=this.treeAdapter.createCommentNode(e.data);this.treeAdapter.appendChild(t,n);}_insertCharacters(e){if(this._shouldFosterParentOnInsertion())this._fosterParentText(e.chars);else {const t=this.openElements.currentTmplContent||this.openElements.current;this.treeAdapter.insertText(t,e.chars);}}_adoptNodes(e,t){for(let n=this.treeAdapter.getFirstChild(e);n;n=this.treeAdapter.getFirstChild(e))this.treeAdapter.detachNode(n),this.treeAdapter.appendChild(t,n);}_shouldProcessTokenInForeignContent(e){const t=this._getAdjustedCurrentElement();if(!t||t===this.document)return !1;const n=this.treeAdapter.getNamespaceURI(t);if(n===pt.HTML)return !1;if(this.treeAdapter.getTagName(t)===mt.ANNOTATION_XML&&n===pt.MATHML&&e.type===Ge.START_TAG_TOKEN&&e.tagName===mt.SVG)return !1;const s=e.type===Ge.CHARACTER_TOKEN||e.type===Ge.NULL_CHARACTER_TOKEN||e.type===Ge.WHITESPACE_CHARACTER_TOKEN;return (!(e.type===Ge.START_TAG_TOKEN&&e.tagName!==mt.MGLYPH&&e.tagName!==mt.MALIGNMARK)&&!s||!this._isIntegrationPoint(t,pt.MATHML))&&((e.type!==Ge.START_TAG_TOKEN&&!s||!this._isIntegrationPoint(t,pt.HTML))&&e.type!==Ge.EOF_TOKEN)}_processToken(e){dt[this.insertionMode][e.type](this,e);}_processTokenInBodyMode(e){dt.IN_BODY_MODE[e.type](this,e);}_processTokenInForeignContent(e){e.type===Ge.CHARACTER_TOKEN?function(e,t){e._insertCharacters(t),e.framesetOk=!1;}(this,e):e.type===Ge.NULL_CHARACTER_TOKEN?function(e,t){t.chars=n,e._insertCharacters(t);}(this,e):e.type===Ge.WHITESPACE_CHARACTER_TOKEN?Bt(this,e):e.type===Ge.COMMENT_TOKEN?Ut(this,e):e.type===Ge.START_TAG_TOKEN?function(e,t){if(lt.causesExit(t)&&!e.fragmentContext){for(;e.treeAdapter.getNamespaceURI(e.openElements.current)!==pt.HTML&&!e._isIntegrationPoint(e.openElements.current);)e.openElements.pop();e._processToken(t);}else {const n=e._getAdjustedCurrentElement(),s=e.treeAdapter.getNamespaceURI(n);s===pt.MATHML?lt.adjustTokenMathMLAttrs(t):s===pt.SVG&&(lt.adjustTokenSVGTagName(t),lt.adjustTokenSVGAttrs(t)),lt.adjustTokenXMLAttrs(t),t.selfClosing?e._appendElement(t,s):e._insertElement(t,s),t.ackSelfClosing=!0;}}(this,e):e.type===Ge.END_TAG_TOKEN&&function(e,t){for(let n=e.openElements.stackTop;n>0;n--){const s=e.openElements.items[n];if(e.treeAdapter.getNamespaceURI(s)===pt.HTML){e._processToken(t);break}if(e.treeAdapter.getTagName(s).toLowerCase()===t.tagName){e.openElements.popUntilElementPopped(s);break}}}(this,e);}_processInputToken(e){this._shouldProcessTokenInForeignContent(e)?this._processTokenInForeignContent(e):this._processToken(e),e.type===Ge.START_TAG_TOKEN&&e.selfClosing&&!e.ackSelfClosing&&this._err(c);}_isIntegrationPoint(e,t){const n=this.treeAdapter.getTagName(e),s=this.treeAdapter.getNamespaceURI(e),r=this.treeAdapter.getAttrList(e);return lt.isIntegrationPoint(n,s,r,t)}_reconstructActiveFormattingElements(){const e=this.activeFormattingElements.length;if(e){let t=e,n=null;do{if(t--,n=this.activeFormattingElements.entries[t],n.type===We.MARKER_ENTRY||this.openElements.contains(n.element)){t++;break}}while(t>0);for(let s=t;s<e;s++)n=this.activeFormattingElements.entries[s],this._insertElement(n.token,this.treeAdapter.getNamespaceURI(n.element)),n.element=this.openElements.current;}}_closeTableCell(){this.openElements.generateImpliedEndTags(),this.openElements.popUntilTableCellPopped(),this.activeFormattingElements.clearToLastMarker(),this.insertionMode="IN_ROW_MODE";}_closePElement(){this.openElements.generateImpliedEndTagsWithExclusion(mt.P),this.openElements.popUntilTagNamePopped(mt.P);}_resetInsertionMode(){for(let e=this.openElements.stackTop,t=!1;e>=0;e--){let n=this.openElements.items[e];0===e&&(t=!0,this.fragmentContext&&(n=this.fragmentContext));const s=this.treeAdapter.getTagName(n),r=St[s];if(r){this.insertionMode=r;break}if(!(t||s!==mt.TD&&s!==mt.TH)){this.insertionMode="IN_CELL_MODE";break}if(!t&&s===mt.HEAD){this.insertionMode="IN_HEAD_MODE";break}if(s===mt.SELECT){this._resetInsertionModeForSelect(e);break}if(s===mt.TEMPLATE){this.insertionMode=this.currentTmplInsertionMode;break}if(s===mt.HTML){this.insertionMode=this.headElement?"AFTER_HEAD_MODE":"BEFORE_HEAD_MODE";break}if(t){this.insertionMode="IN_BODY_MODE";break}}}_resetInsertionModeForSelect(e){if(e>0)for(let t=e-1;t>0;t--){const e=this.openElements.items[t],n=this.treeAdapter.getTagName(e);if(n===mt.TEMPLATE)break;if(n===mt.TABLE)return void(this.insertionMode="IN_SELECT_IN_TABLE_MODE")}this.insertionMode="IN_SELECT_MODE";}_pushTmplInsertionMode(e){this.tmplInsertionModeStack.push(e),this.tmplInsertionModeStackTop++,this.currentTmplInsertionMode=e;}_popTmplInsertionMode(){this.tmplInsertionModeStack.pop(),this.tmplInsertionModeStackTop--,this.currentTmplInsertionMode=this.tmplInsertionModeStack[this.tmplInsertionModeStackTop];}_isElementCausesFosterParenting(e){const t=this.treeAdapter.getTagName(e);return t===mt.TABLE||t===mt.TBODY||t===mt.TFOOT||t===mt.THEAD||t===mt.TR}_shouldFosterParentOnInsertion(){return this.fosterParentingEnabled&&this._isElementCausesFosterParenting(this.openElements.current)}_findFosterParentingLocation(){const e={parent:null,beforeElement:null};for(let t=this.openElements.stackTop;t>=0;t--){const n=this.openElements.items[t],s=this.treeAdapter.getTagName(n),r=this.treeAdapter.getNamespaceURI(n);if(s===mt.TEMPLATE&&r===pt.HTML){e.parent=this.treeAdapter.getTemplateContent(n);break}if(s===mt.TABLE){e.parent=this.treeAdapter.getParentNode(n),e.parent?e.beforeElement=n:e.parent=this.openElements.items[t-1];break}}return e.parent||(e.parent=this.openElements.items[0]),e}_fosterParentElement(e){const t=this._findFosterParentingLocation();t.beforeElement?this.treeAdapter.insertBefore(t.parent,e,t.beforeElement):this.treeAdapter.appendChild(t.parent,e);}_fosterParentText(e){const t=this._findFosterParentingLocation();t.beforeElement?this.treeAdapter.insertTextBefore(t.parent,e,t.beforeElement):this.treeAdapter.insertText(t.parent,e);}_isSpecialElement(e){const t=this.treeAdapter.getTagName(e),n=this.treeAdapter.getNamespaceURI(e);return be.SPECIAL_ELEMENTS[n][t]}};function It(e,t){let n=e.activeFormattingElements.getElementEntryInScopeWithTagName(t.tagName);return n?e.openElements.contains(n.element)?e.openElements.hasInScope(t.tagName)||(n=null):(e.activeFormattingElements.removeEntry(n),n=null):on(e,t),n}function ft(e,t){let n=null;for(let s=e.openElements.stackTop;s>=0;s--){const r=e.openElements.items[s];if(r===t.element)break;e._isSpecialElement(r)&&(n=r);}return n||(e.openElements.popUntilElementPopped(t.element),e.activeFormattingElements.removeEntry(t)),n}function Mt(e,t,n){let s=t,r=e.openElements.getCommonAncestor(t);for(let i=0,T=r;T!==n;i++,T=r){r=e.openElements.getCommonAncestor(T);const n=e.activeFormattingElements.getElementEntry(T),o=n&&i>=3;!n||o?(o&&e.activeFormattingElements.removeEntry(n),e.openElements.remove(T)):(T=Lt(e,n),s===t&&(e.activeFormattingElements.bookmark=n),e.treeAdapter.detachNode(s),e.treeAdapter.appendChild(T,s),s=T);}return s}function Lt(e,t){const n=e.treeAdapter.getNamespaceURI(t.element),s=e.treeAdapter.createElement(t.token.tagName,n,t.token.attrs);return e.openElements.replace(t.element,s),t.element=s,s}function Dt(e,t,n){if(e._isElementCausesFosterParenting(t))e._fosterParentElement(n);else {const s=e.treeAdapter.getTagName(t),r=e.treeAdapter.getNamespaceURI(t);s===mt.TEMPLATE&&r===pt.HTML&&(t=e.treeAdapter.getTemplateContent(t)),e.treeAdapter.appendChild(t,n);}}function gt(e,t,n){const s=e.treeAdapter.getNamespaceURI(n.element),r=n.token,i=e.treeAdapter.createElement(r.tagName,s,r.attrs);e._adoptNodes(t,i),e.treeAdapter.appendChild(t,i),e.activeFormattingElements.insertElementAfterBookmark(i,n.token),e.activeFormattingElements.removeEntry(n),e.openElements.remove(n.element),e.openElements.insertAfter(t,i);}function Pt(e,t){let n;for(let s=0;s<8&&(n=It(e,t),n);s++){const t=ft(e,n);if(!t)break;e.activeFormattingElements.bookmark=n;const s=Mt(e,t,n.element),r=e.openElements.getCommonAncestor(n.element);e.treeAdapter.detachNode(s),Dt(e,r,s),gt(e,t,n);}}function kt(){}function Ht(e){e._err(oe);}function Ut(e,t){e._appendCommentNode(t,e.openElements.currentTmplContent||e.openElements.current);}function Ft(e,t){e._appendCommentNode(t,e.document);}function Bt(e,t){e._insertCharacters(t);}function Gt(e){e.stopped=!0;}function Kt(e,t){e._err(Te,{beforeToken:!0}),e.treeAdapter.setDocumentMode(e.document,be.DOCUMENT_MODE.QUIRKS),e.insertionMode="BEFORE_HTML_MODE",e._processToken(t);}function bt(e,t){e._insertFakeRootElement(),e.insertionMode="BEFORE_HEAD_MODE",e._processToken(t);}function Yt(e,t){e._insertFakeElement(mt.HEAD),e.headElement=e.openElements.current,e.insertionMode="IN_HEAD_MODE",e._processToken(t);}function xt(e,t){const n=t.tagName;n===mt.HTML?sn(e,t):n===mt.BASE||n===mt.BASEFONT||n===mt.BGSOUND||n===mt.LINK||n===mt.META?(e._appendElement(t,pt.HTML),t.ackSelfClosing=!0):n===mt.TITLE?e._switchToTextParsing(t,Ge.MODE.RCDATA):n===mt.NOSCRIPT?e.options.scriptingEnabled?e._switchToTextParsing(t,Ge.MODE.RAWTEXT):(e._insertElement(t,pt.HTML),e.insertionMode="IN_HEAD_NO_SCRIPT_MODE"):n===mt.NOFRAMES||n===mt.STYLE?e._switchToTextParsing(t,Ge.MODE.RAWTEXT):n===mt.SCRIPT?e._switchToTextParsing(t,Ge.MODE.SCRIPT_DATA):n===mt.TEMPLATE?(e._insertTemplate(t,pt.HTML),e.activeFormattingElements.insertMarker(),e.framesetOk=!1,e.insertionMode="IN_TEMPLATE_MODE",e._pushTmplInsertionMode("IN_TEMPLATE_MODE")):n===mt.HEAD?e._err(ce):vt(e,t);}function yt(e,t){const n=t.tagName;n===mt.HEAD?(e.openElements.pop(),e.insertionMode="AFTER_HEAD_MODE"):n===mt.BODY||n===mt.BR||n===mt.HTML?vt(e,t):n===mt.TEMPLATE&&e.openElements.tmplCount>0?(e.openElements.generateImpliedEndTagsThoroughly(),e.openElements.currentTagName!==mt.TEMPLATE&&e._err(ae),e.openElements.popUntilTagNamePopped(mt.TEMPLATE),e.activeFormattingElements.clearToLastMarker(),e._popTmplInsertionMode(),e._resetInsertionMode()):e._err(Ee);}function vt(e,t){e.openElements.pop(),e.insertionMode="AFTER_HEAD_MODE",e._processToken(t);}function wt(e,t){const n=t.type===Ge.EOF_TOKEN?Ae:_e;e._err(n),e.openElements.pop(),e.insertionMode="IN_HEAD_MODE",e._processToken(t);}function Qt(e,t){e._insertFakeElement(mt.BODY),e.insertionMode="IN_BODY_MODE",e._processToken(t);}function Xt(e,t){e._reconstructActiveFormattingElements(),e._insertCharacters(t);}function Wt(e,t){e._reconstructActiveFormattingElements(),e._insertCharacters(t),e.framesetOk=!1;}function Vt(e,t){e.openElements.hasInButtonScope(mt.P)&&e._closePElement(),e._insertElement(t,pt.HTML);}function jt(e,t){e.openElements.hasInButtonScope(mt.P)&&e._closePElement(),e._insertElement(t,pt.HTML),e.skipNextNewLine=!0,e.framesetOk=!1;}function zt(e,t){e._reconstructActiveFormattingElements(),e._insertElement(t,pt.HTML),e.activeFormattingElements.pushElement(e.openElements.current,t);}function qt(e,t){e._reconstructActiveFormattingElements(),e._insertElement(t,pt.HTML),e.activeFormattingElements.insertMarker(),e.framesetOk=!1;}function Jt(e,t){e._reconstructActiveFormattingElements(),e._appendElement(t,pt.HTML),e.framesetOk=!1,t.ackSelfClosing=!0;}function Zt(e,t){e._appendElement(t,pt.HTML),t.ackSelfClosing=!0;}function $t(e,t){e._switchToTextParsing(t,Ge.MODE.RAWTEXT);}function en(e,t){e.openElements.currentTagName===mt.OPTION&&e.openElements.pop(),e._reconstructActiveFormattingElements(),e._insertElement(t,pt.HTML);}function tn(e,t){e.openElements.hasInScope(mt.RUBY)&&e.openElements.generateImpliedEndTags(),e._insertElement(t,pt.HTML);}function nn(e,t){e._reconstructActiveFormattingElements(),e._insertElement(t,pt.HTML);}function sn(e,t){const n=t.tagName;switch(n.length){case 1:n===mt.I||n===mt.S||n===mt.B||n===mt.U?zt(e,t):n===mt.P?Vt(e,t):n===mt.A?function(e,t){const n=e.activeFormattingElements.getElementEntryInScopeWithTagName(mt.A);n&&(Pt(e,t),e.openElements.remove(n.element),e.activeFormattingElements.removeEntry(n)),e._reconstructActiveFormattingElements(),e._insertElement(t,pt.HTML),e.activeFormattingElements.pushElement(e.openElements.current,t);}(e,t):nn(e,t);break;case 2:n===mt.DL||n===mt.OL||n===mt.UL?Vt(e,t):n===mt.H1||n===mt.H2||n===mt.H3||n===mt.H4||n===mt.H5||n===mt.H6?function(e,t){e.openElements.hasInButtonScope(mt.P)&&e._closePElement();const n=e.openElements.currentTagName;n!==mt.H1&&n!==mt.H2&&n!==mt.H3&&n!==mt.H4&&n!==mt.H5&&n!==mt.H6||e.openElements.pop(),e._insertElement(t,pt.HTML);}(e,t):n===mt.LI||n===mt.DD||n===mt.DT?function(e,t){e.framesetOk=!1;const n=t.tagName;for(let t=e.openElements.stackTop;t>=0;t--){const s=e.openElements.items[t],r=e.treeAdapter.getTagName(s);let i=null;if(n===mt.LI&&r===mt.LI?i=mt.LI:n!==mt.DD&&n!==mt.DT||r!==mt.DD&&r!==mt.DT||(i=r),i){e.openElements.generateImpliedEndTagsWithExclusion(i),e.openElements.popUntilTagNamePopped(i);break}if(r!==mt.ADDRESS&&r!==mt.DIV&&r!==mt.P&&e._isSpecialElement(s))break}e.openElements.hasInButtonScope(mt.P)&&e._closePElement(),e._insertElement(t,pt.HTML);}(e,t):n===mt.EM||n===mt.TT?zt(e,t):n===mt.BR?Jt(e,t):n===mt.HR?function(e,t){e.openElements.hasInButtonScope(mt.P)&&e._closePElement(),e._appendElement(t,pt.HTML),e.framesetOk=!1,t.ackSelfClosing=!0;}(e,t):n===mt.RB?tn(e,t):n===mt.RT||n===mt.RP?function(e,t){e.openElements.hasInScope(mt.RUBY)&&e.openElements.generateImpliedEndTagsWithExclusion(mt.RTC),e._insertElement(t,pt.HTML);}(e,t):n!==mt.TH&&n!==mt.TD&&n!==mt.TR&&nn(e,t);break;case 3:n===mt.DIV||n===mt.DIR||n===mt.NAV?Vt(e,t):n===mt.PRE?jt(e,t):n===mt.BIG?zt(e,t):n===mt.IMG||n===mt.WBR?Jt(e,t):n===mt.XMP?function(e,t){e.openElements.hasInButtonScope(mt.P)&&e._closePElement(),e._reconstructActiveFormattingElements(),e.framesetOk=!1,e._switchToTextParsing(t,Ge.MODE.RAWTEXT);}(e,t):n===mt.SVG?function(e,t){e._reconstructActiveFormattingElements(),lt.adjustTokenSVGAttrs(t),lt.adjustTokenXMLAttrs(t),t.selfClosing?e._appendElement(t,pt.SVG):e._insertElement(t,pt.SVG),t.ackSelfClosing=!0;}(e,t):n===mt.RTC?tn(e,t):n!==mt.COL&&nn(e,t);break;case 4:n===mt.HTML?function(e,t){0===e.openElements.tmplCount&&e.treeAdapter.adoptAttributes(e.openElements.items[0],t.attrs);}(e,t):n===mt.BASE||n===mt.LINK||n===mt.META?xt(e,t):n===mt.BODY?function(e,t){const n=e.openElements.tryPeekProperlyNestedBodyElement();n&&0===e.openElements.tmplCount&&(e.framesetOk=!1,e.treeAdapter.adoptAttributes(n,t.attrs));}(e,t):n===mt.MAIN||n===mt.MENU?Vt(e,t):n===mt.FORM?function(e,t){const n=e.openElements.tmplCount>0;e.formElement&&!n||(e.openElements.hasInButtonScope(mt.P)&&e._closePElement(),e._insertElement(t,pt.HTML),n||(e.formElement=e.openElements.current));}(e,t):n===mt.CODE||n===mt.FONT?zt(e,t):n===mt.NOBR?function(e,t){e._reconstructActiveFormattingElements(),e.openElements.hasInScope(mt.NOBR)&&(Pt(e,t),e._reconstructActiveFormattingElements()),e._insertElement(t,pt.HTML),e.activeFormattingElements.pushElement(e.openElements.current,t);}(e,t):n===mt.AREA?Jt(e,t):n===mt.MATH?function(e,t){e._reconstructActiveFormattingElements(),lt.adjustTokenMathMLAttrs(t),lt.adjustTokenXMLAttrs(t),t.selfClosing?e._appendElement(t,pt.MATHML):e._insertElement(t,pt.MATHML),t.ackSelfClosing=!0;}(e,t):n===mt.MENU?function(e,t){e.openElements.hasInButtonScope(mt.P)&&e._closePElement(),e._insertElement(t,pt.HTML);}(e,t):n!==mt.HEAD&&nn(e,t);break;case 5:n===mt.STYLE||n===mt.TITLE?xt(e,t):n===mt.ASIDE?Vt(e,t):n===mt.SMALL?zt(e,t):n===mt.TABLE?function(e,t){e.treeAdapter.getDocumentMode(e.document)!==be.DOCUMENT_MODE.QUIRKS&&e.openElements.hasInButtonScope(mt.P)&&e._closePElement(),e._insertElement(t,pt.HTML),e.framesetOk=!1,e.insertionMode=Ot;}(e,t):n===mt.EMBED?Jt(e,t):n===mt.INPUT?function(e,t){e._reconstructActiveFormattingElements(),e._appendElement(t,pt.HTML);const n=Ge.getTokenAttr(t,Nt.TYPE);n&&"hidden"===n.toLowerCase()||(e.framesetOk=!1),t.ackSelfClosing=!0;}(e,t):n===mt.PARAM||n===mt.TRACK?Zt(e,t):n===mt.IMAGE?function(e,t){t.tagName=mt.IMG,Jt(e,t);}(e,t):n!==mt.FRAME&&n!==mt.TBODY&&n!==mt.TFOOT&&n!==mt.THEAD&&nn(e,t);break;case 6:n===mt.SCRIPT?xt(e,t):n===mt.CENTER||n===mt.FIGURE||n===mt.FOOTER||n===mt.HEADER||n===mt.HGROUP||n===mt.DIALOG?Vt(e,t):n===mt.BUTTON?function(e,t){e.openElements.hasInScope(mt.BUTTON)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(mt.BUTTON)),e._reconstructActiveFormattingElements(),e._insertElement(t,pt.HTML),e.framesetOk=!1;}(e,t):n===mt.STRIKE||n===mt.STRONG?zt(e,t):n===mt.APPLET||n===mt.OBJECT?qt(e,t):n===mt.KEYGEN?Jt(e,t):n===mt.SOURCE?Zt(e,t):n===mt.IFRAME?function(e,t){e.framesetOk=!1,e._switchToTextParsing(t,Ge.MODE.RAWTEXT);}(e,t):n===mt.SELECT?function(e,t){e._reconstructActiveFormattingElements(),e._insertElement(t,pt.HTML),e.framesetOk=!1,e.insertionMode===Ot||"IN_CAPTION_MODE"===e.insertionMode||"IN_TABLE_BODY_MODE"===e.insertionMode||"IN_ROW_MODE"===e.insertionMode||"IN_CELL_MODE"===e.insertionMode?e.insertionMode="IN_SELECT_IN_TABLE_MODE":e.insertionMode="IN_SELECT_MODE";}(e,t):n===mt.OPTION?en(e,t):nn(e,t);break;case 7:n===mt.BGSOUND?xt(e,t):n===mt.DETAILS||n===mt.ADDRESS||n===mt.ARTICLE||n===mt.SECTION||n===mt.SUMMARY?Vt(e,t):n===mt.LISTING?jt(e,t):n===mt.MARQUEE?qt(e,t):n===mt.NOEMBED?$t(e,t):n!==mt.CAPTION&&nn(e,t);break;case 8:n===mt.BASEFONT?xt(e,t):n===mt.FRAMESET?function(e,t){const n=e.openElements.tryPeekProperlyNestedBodyElement();e.framesetOk&&n&&(e.treeAdapter.detachNode(n),e.openElements.popAllUpToHtmlElement(),e._insertElement(t,pt.HTML),e.insertionMode="IN_FRAMESET_MODE");}(e,t):n===mt.FIELDSET?Vt(e,t):n===mt.TEXTAREA?function(e,t){e._insertElement(t,pt.HTML),e.skipNextNewLine=!0,e.tokenizer.state=Ge.MODE.RCDATA,e.originalInsertionMode=e.insertionMode,e.framesetOk=!1,e.insertionMode="TEXT_MODE";}(e,t):n===mt.TEMPLATE?xt(e,t):n===mt.NOSCRIPT?e.options.scriptingEnabled?$t(e,t):nn(e,t):n===mt.OPTGROUP?en(e,t):n!==mt.COLGROUP&&nn(e,t);break;case 9:n===mt.PLAINTEXT?function(e,t){e.openElements.hasInButtonScope(mt.P)&&e._closePElement(),e._insertElement(t,pt.HTML),e.tokenizer.state=Ge.MODE.PLAINTEXT;}(e,t):nn(e,t);break;case 10:n===mt.BLOCKQUOTE||n===mt.FIGCAPTION?Vt(e,t):nn(e,t);break;default:nn(e,t);}}function rn(e,t){const n=t.tagName;e.openElements.hasInScope(n)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(n));}function Tn(e,t){const n=t.tagName;e.openElements.hasInScope(n)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(n),e.activeFormattingElements.clearToLastMarker());}function on(e,t){const n=t.tagName;for(let t=e.openElements.stackTop;t>0;t--){const s=e.openElements.items[t];if(e.treeAdapter.getTagName(s)===n){e.openElements.generateImpliedEndTagsWithExclusion(n),e.openElements.popUntilElementPopped(s);break}if(e._isSpecialElement(s))break}}function En(e,t){const n=t.tagName;switch(n.length){case 1:n===mt.A||n===mt.B||n===mt.I||n===mt.S||n===mt.U?Pt(e,t):n===mt.P?function(e){e.openElements.hasInButtonScope(mt.P)||e._insertFakeElement(mt.P),e._closePElement();}(e):on(e,t);break;case 2:n===mt.DL||n===mt.UL||n===mt.OL?rn(e,t):n===mt.LI?function(e){e.openElements.hasInListItemScope(mt.LI)&&(e.openElements.generateImpliedEndTagsWithExclusion(mt.LI),e.openElements.popUntilTagNamePopped(mt.LI));}(e):n===mt.DD||n===mt.DT?function(e,t){const n=t.tagName;e.openElements.hasInScope(n)&&(e.openElements.generateImpliedEndTagsWithExclusion(n),e.openElements.popUntilTagNamePopped(n));}(e,t):n===mt.H1||n===mt.H2||n===mt.H3||n===mt.H4||n===mt.H5||n===mt.H6?function(e){e.openElements.hasNumberedHeaderInScope()&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilNumberedHeaderPopped());}(e):n===mt.BR?function(e){e._reconstructActiveFormattingElements(),e._insertFakeElement(mt.BR),e.openElements.pop(),e.framesetOk=!1;}(e):n===mt.EM||n===mt.TT?Pt(e,t):on(e,t);break;case 3:n===mt.BIG?Pt(e,t):n===mt.DIR||n===mt.DIV||n===mt.NAV||n===mt.PRE?rn(e,t):on(e,t);break;case 4:n===mt.BODY?function(e){e.openElements.hasInScope(mt.BODY)&&(e.insertionMode="AFTER_BODY_MODE");}(e):n===mt.HTML?function(e,t){e.openElements.hasInScope(mt.BODY)&&(e.insertionMode="AFTER_BODY_MODE",e._processToken(t));}(e,t):n===mt.FORM?function(e){const t=e.openElements.tmplCount>0,n=e.formElement;t||(e.formElement=null),(n||t)&&e.openElements.hasInScope(mt.FORM)&&(e.openElements.generateImpliedEndTags(),t?e.openElements.popUntilTagNamePopped(mt.FORM):e.openElements.remove(n));}(e):n===mt.CODE||n===mt.FONT||n===mt.NOBR?Pt(e,t):n===mt.MAIN||n===mt.MENU?rn(e,t):on(e,t);break;case 5:n===mt.ASIDE?rn(e,t):n===mt.SMALL?Pt(e,t):on(e,t);break;case 6:n===mt.CENTER||n===mt.FIGURE||n===mt.FOOTER||n===mt.HEADER||n===mt.HGROUP||n===mt.DIALOG?rn(e,t):n===mt.APPLET||n===mt.OBJECT?Tn(e,t):n===mt.STRIKE||n===mt.STRONG?Pt(e,t):on(e,t);break;case 7:n===mt.ADDRESS||n===mt.ARTICLE||n===mt.DETAILS||n===mt.SECTION||n===mt.SUMMARY||n===mt.LISTING?rn(e,t):n===mt.MARQUEE?Tn(e,t):on(e,t);break;case 8:n===mt.FIELDSET?rn(e,t):n===mt.TEMPLATE?yt(e,t):on(e,t);break;case 10:n===mt.BLOCKQUOTE||n===mt.FIGCAPTION?rn(e,t):on(e,t);break;default:on(e,t);}}function an(e,t){e.tmplInsertionModeStackTop>-1?un(e,t):e.stopped=!0;}function _n(e,t){const n=e.openElements.currentTagName;n===mt.TABLE||n===mt.TBODY||n===mt.TFOOT||n===mt.THEAD||n===mt.TR?(e.pendingCharacterTokens=[],e.hasNonWhitespacePendingCharacterToken=!1,e.originalInsertionMode=e.insertionMode,e.insertionMode="IN_TABLE_TEXT_MODE",e._processToken(t)):cn(e,t);}function An(e,t){const n=t.tagName;switch(n.length){case 2:n===mt.TD||n===mt.TH||n===mt.TR?function(e,t){e.openElements.clearBackToTableContext(),e._insertFakeElement(mt.TBODY),e.insertionMode="IN_TABLE_BODY_MODE",e._processToken(t);}(e,t):cn(e,t);break;case 3:n===mt.COL?function(e,t){e.openElements.clearBackToTableContext(),e._insertFakeElement(mt.COLGROUP),e.insertionMode="IN_COLUMN_GROUP_MODE",e._processToken(t);}(e,t):cn(e,t);break;case 4:n===mt.FORM?function(e,t){e.formElement||0!==e.openElements.tmplCount||(e._insertElement(t,pt.HTML),e.formElement=e.openElements.current,e.openElements.pop());}(e,t):cn(e,t);break;case 5:n===mt.TABLE?function(e,t){e.openElements.hasInTableScope(mt.TABLE)&&(e.openElements.popUntilTagNamePopped(mt.TABLE),e._resetInsertionMode(),e._processToken(t));}(e,t):n===mt.STYLE?xt(e,t):n===mt.TBODY||n===mt.TFOOT||n===mt.THEAD?function(e,t){e.openElements.clearBackToTableContext(),e._insertElement(t,pt.HTML),e.insertionMode="IN_TABLE_BODY_MODE";}(e,t):n===mt.INPUT?function(e,t){const n=Ge.getTokenAttr(t,Nt.TYPE);n&&"hidden"===n.toLowerCase()?e._appendElement(t,pt.HTML):cn(e,t),t.ackSelfClosing=!0;}(e,t):cn(e,t);break;case 6:n===mt.SCRIPT?xt(e,t):cn(e,t);break;case 7:n===mt.CAPTION?function(e,t){e.openElements.clearBackToTableContext(),e.activeFormattingElements.insertMarker(),e._insertElement(t,pt.HTML),e.insertionMode="IN_CAPTION_MODE";}(e,t):cn(e,t);break;case 8:n===mt.COLGROUP?function(e,t){e.openElements.clearBackToTableContext(),e._insertElement(t,pt.HTML),e.insertionMode="IN_COLUMN_GROUP_MODE";}(e,t):n===mt.TEMPLATE?xt(e,t):cn(e,t);break;default:cn(e,t);}}function hn(e,t){const n=t.tagName;n===mt.TABLE?e.openElements.hasInTableScope(mt.TABLE)&&(e.openElements.popUntilTagNamePopped(mt.TABLE),e._resetInsertionMode()):n===mt.TEMPLATE?yt(e,t):n!==mt.BODY&&n!==mt.CAPTION&&n!==mt.COL&&n!==mt.COLGROUP&&n!==mt.HTML&&n!==mt.TBODY&&n!==mt.TD&&n!==mt.TFOOT&&n!==mt.TH&&n!==mt.THEAD&&n!==mt.TR&&cn(e,t);}function cn(e,t){const n=e.fosterParentingEnabled;e.fosterParentingEnabled=!0,e._processTokenInBodyMode(t),e.fosterParentingEnabled=n;}function ln(e,t){let n=0;if(e.hasNonWhitespacePendingCharacterToken)for(;n<e.pendingCharacterTokens.length;n++)cn(e,e.pendingCharacterTokens[n]);else for(;n<e.pendingCharacterTokens.length;n++)e._insertCharacters(e.pendingCharacterTokens[n]);e.insertionMode=e.originalInsertionMode,e._processToken(t);}function mn(e,t){e.openElements.currentTagName===mt.COLGROUP&&(e.openElements.pop(),e.insertionMode=Ot,e._processToken(t));}function pn(e,t){const n=t.tagName;n===mt.HTML?sn(e,t):n===mt.OPTION?(e.openElements.currentTagName===mt.OPTION&&e.openElements.pop(),e._insertElement(t,pt.HTML)):n===mt.OPTGROUP?(e.openElements.currentTagName===mt.OPTION&&e.openElements.pop(),e.openElements.currentTagName===mt.OPTGROUP&&e.openElements.pop(),e._insertElement(t,pt.HTML)):n===mt.INPUT||n===mt.KEYGEN||n===mt.TEXTAREA||n===mt.SELECT?e.openElements.hasInSelectScope(mt.SELECT)&&(e.openElements.popUntilTagNamePopped(mt.SELECT),e._resetInsertionMode(),n!==mt.SELECT&&e._processToken(t)):n!==mt.SCRIPT&&n!==mt.TEMPLATE||xt(e,t);}function Nn(e,t){const n=t.tagName;if(n===mt.OPTGROUP){const t=e.openElements.items[e.openElements.stackTop-1],n=t&&e.treeAdapter.getTagName(t);e.openElements.currentTagName===mt.OPTION&&n===mt.OPTGROUP&&e.openElements.pop(),e.openElements.currentTagName===mt.OPTGROUP&&e.openElements.pop();}else n===mt.OPTION?e.openElements.currentTagName===mt.OPTION&&e.openElements.pop():n===mt.SELECT&&e.openElements.hasInSelectScope(mt.SELECT)?(e.openElements.popUntilTagNamePopped(mt.SELECT),e._resetInsertionMode()):n===mt.TEMPLATE&&yt(e,t);}function un(e,t){e.openElements.tmplCount>0?(e.openElements.popUntilTagNamePopped(mt.TEMPLATE),e.activeFormattingElements.clearToLastMarker(),e._popTmplInsertionMode(),e._resetInsertionMode(),e._processToken(t)):e.stopped=!0;}function On(e,t){e.insertionMode="IN_BODY_MODE",e._processToken(t);}function Sn(e,t){e.insertionMode="IN_BODY_MODE",e._processToken(t);}be.TAG_NAMES,be.NAMESPACES;return e.parse=function(e,t){return new Rt(t).parse(e)},e.parseFragment=function(e,t,n){"string"==typeof e&&(n=t,t=e,e=null);return new Rt(n).parseFragment(t,e)},e}({});const parse=PARSE5.parse;const parseFragment=PARSE5.parseFragment;

const docParser = new WeakMap();
function parseDocumentUtil(ownerDocument, html) {
  const doc = parse(html.trim(), getParser(ownerDocument));
  doc.documentElement = doc.firstElementChild;
  doc.head = doc.documentElement.firstElementChild;
  doc.body = doc.head.nextElementSibling;
  return doc;
}
function parseFragmentUtil(ownerDocument, html) {
  if (typeof html === 'string') {
    html = html.trim();
  }
  else {
    html = '';
  }
  const frag = parseFragment(html, getParser(ownerDocument));
  return frag;
}
function getParser(ownerDocument) {
  let parseOptions = docParser.get(ownerDocument);
  if (parseOptions != null) {
    return parseOptions;
  }
  const treeAdapter = {
    createDocument() {
      const doc = ownerDocument.createElement("#document" /* DOCUMENT_NODE */);
      doc['x-mode'] = 'no-quirks';
      return doc;
    },
    setNodeSourceCodeLocation(node, location) {
      node.sourceCodeLocation = location;
    },
    getNodeSourceCodeLocation(node) {
      return node.sourceCodeLocation;
    },
    createDocumentFragment() {
      return ownerDocument.createDocumentFragment();
    },
    createElement(tagName, namespaceURI, attrs) {
      const elm = ownerDocument.createElementNS(namespaceURI, tagName);
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if (attr.namespace == null || attr.namespace === 'http://www.w3.org/1999/xhtml') {
          elm.setAttribute(attr.name, attr.value);
        }
        else {
          elm.setAttributeNS(attr.namespace, attr.name, attr.value);
        }
      }
      return elm;
    },
    createCommentNode(data) {
      return ownerDocument.createComment(data);
    },
    appendChild(parentNode, newNode) {
      parentNode.appendChild(newNode);
    },
    insertBefore(parentNode, newNode, referenceNode) {
      parentNode.insertBefore(newNode, referenceNode);
    },
    setTemplateContent(templateElement, contentElement) {
      templateElement.content = contentElement;
    },
    getTemplateContent(templateElement) {
      return templateElement.content;
    },
    setDocumentType(doc, name, publicId, systemId) {
      let doctypeNode = doc.childNodes.find(n => n.nodeType === 10 /* DOCUMENT_TYPE_NODE */);
      if (doctypeNode == null) {
        doctypeNode = ownerDocument.createDocumentTypeNode();
        doc.insertBefore(doctypeNode, doc.firstChild);
      }
      doctypeNode.nodeValue = '!DOCTYPE';
      doctypeNode['x-name'] = name;
      doctypeNode['x-publicId'] = publicId;
      doctypeNode['x-systemId'] = systemId;
    },
    setDocumentMode(doc, mode) {
      doc['x-mode'] = mode;
    },
    getDocumentMode(doc) {
      return doc['x-mode'];
    },
    detachNode(node) {
      node.remove();
    },
    insertText(parentNode, text) {
      const lastChild = parentNode.lastChild;
      if (lastChild != null && lastChild.nodeType === 3 /* TEXT_NODE */) {
        lastChild.nodeValue += text;
      }
      else {
        parentNode.appendChild(ownerDocument.createTextNode(text));
      }
    },
    insertTextBefore(parentNode, text, referenceNode) {
      const prevNode = parentNode.childNodes[parentNode.childNodes.indexOf(referenceNode) - 1];
      if (prevNode != null && prevNode.nodeType === 3 /* TEXT_NODE */) {
        prevNode.nodeValue += text;
      }
      else {
        parentNode.insertBefore(ownerDocument.createTextNode(text), referenceNode);
      }
    },
    adoptAttributes(recipient, attrs) {
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if (recipient.hasAttributeNS(attr.namespace, attr.name) === false) {
          recipient.setAttributeNS(attr.namespace, attr.name, attr.value);
        }
      }
    },
    getFirstChild(node) {
      return node.childNodes[0];
    },
    getChildNodes(node) {
      return node.childNodes;
    },
    getParentNode(node) {
      return node.parentNode;
    },
    getAttrList(element) {
      const attrs = element.attributes.__items.map(attr => {
        return {
          name: attr.name,
          value: attr.value,
          namespace: attr.namespaceURI,
          prefix: null,
        };
      });
      return attrs;
    },
    getTagName(element) {
      if (element.namespaceURI === 'http://www.w3.org/1999/xhtml') {
        return element.nodeName.toLowerCase();
      }
      else {
        return element.nodeName;
      }
    },
    getNamespaceURI(element) {
      return element.namespaceURI;
    },
    getTextNodeContent(textNode) {
      return textNode.nodeValue;
    },
    getCommentNodeContent(commentNode) {
      return commentNode.nodeValue;
    },
    getDocumentTypeNodeName(doctypeNode) {
      return doctypeNode['x-name'];
    },
    getDocumentTypeNodePublicId(doctypeNode) {
      return doctypeNode['x-publicId'];
    },
    getDocumentTypeNodeSystemId(doctypeNode) {
      return doctypeNode['x-systemId'];
    },
    isTextNode(node) {
      return node.nodeType === 3 /* TEXT_NODE */;
    },
    isCommentNode(node) {
      return node.nodeType === 8 /* COMMENT_NODE */;
    },
    isDocumentTypeNode(node) {
      return node.nodeType === 10 /* DOCUMENT_TYPE_NODE */;
    },
    isElementNode(node) {
      return node.nodeType === 1 /* ELEMENT_NODE */;
    },
  };
  parseOptions = {
    treeAdapter: treeAdapter,
  };
  docParser.set(ownerDocument, parseOptions);
  return parseOptions;
}

class MockNode {
  constructor(ownerDocument, nodeType, nodeName, nodeValue) {
    this.ownerDocument = ownerDocument;
    this.nodeType = nodeType;
    this.nodeName = nodeName;
    this.nodeValue = nodeValue;
    this.parentNode = null;
    this.childNodes = [];
  }
  appendChild(newNode) {
    if (newNode.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */) {
      const nodes = newNode.childNodes.slice();
      for (const child of nodes) {
        this.appendChild(child);
      }
    }
    else {
      newNode.remove();
      newNode.parentNode = this;
      this.childNodes.push(newNode);
      connectNode(this.ownerDocument, newNode);
    }
    return newNode;
  }
  append(...items) {
    items.forEach(item => {
      const isNode = typeof item === 'object' && item !== null && 'nodeType' in item;
      this.appendChild(isNode ? item : this.ownerDocument.createTextNode(String(item)));
    });
  }
  prepend(...items) {
    const firstChild = this.firstChild;
    items.forEach(item => {
      const isNode = typeof item === 'object' && item !== null && 'nodeType' in item;
      this.insertBefore(isNode ? item : this.ownerDocument.createTextNode(String(item)), firstChild);
    });
  }
  cloneNode(deep) {
    throw new Error(`invalid node type to clone: ${this.nodeType}, deep: ${deep}`);
  }
  compareDocumentPosition(_other) {
    // unimplemented
    // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
    return -1;
  }
  get firstChild() {
    return this.childNodes[0] || null;
  }
  insertBefore(newNode, referenceNode) {
    if (newNode.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */) {
      for (let i = 0, ii = newNode.childNodes.length; i < ii; i++) {
        insertBefore(this, newNode.childNodes[i], referenceNode);
      }
    }
    else {
      insertBefore(this, newNode, referenceNode);
    }
    return newNode;
  }
  get isConnected() {
    let node = this;
    while (node != null) {
      if (node.nodeType === 9 /* DOCUMENT_NODE */) {
        return true;
      }
      node = node.parentNode;
      if (node != null && node.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */) {
        node = node.host;
      }
    }
    return false;
  }
  isSameNode(node) {
    return this === node;
  }
  get lastChild() {
    return this.childNodes[this.childNodes.length - 1] || null;
  }
  get nextSibling() {
    if (this.parentNode != null) {
      const index = this.parentNode.childNodes.indexOf(this) + 1;
      return this.parentNode.childNodes[index] || null;
    }
    return null;
  }
  get parentElement() {
    return this.parentNode || null;
  }
  set parentElement(value) {
    this.parentNode = value;
  }
  get previousSibling() {
    if (this.parentNode != null) {
      const index = this.parentNode.childNodes.indexOf(this) - 1;
      return this.parentNode.childNodes[index] || null;
    }
    return null;
  }
  contains(otherNode) {
    return this.childNodes.includes(otherNode);
  }
  removeChild(childNode) {
    const index = this.childNodes.indexOf(childNode);
    if (index > -1) {
      this.childNodes.splice(index, 1);
      if (this.nodeType === 1 /* ELEMENT_NODE */) {
        const wasConnected = this.isConnected;
        childNode.parentNode = null;
        if (wasConnected === true) {
          disconnectNode(childNode);
        }
      }
      else {
        childNode.parentNode = null;
      }
    }
    else {
      throw new Error(`node not found within childNodes during removeChild`);
    }
    return childNode;
  }
  remove() {
    if (this.parentNode != null) {
      this.parentNode.removeChild(this);
    }
  }
  replaceChild(newChild, oldChild) {
    if (oldChild.parentNode === this) {
      this.insertBefore(newChild, oldChild);
      oldChild.remove();
      return newChild;
    }
    return null;
  }
  get textContent() {
    return this.nodeValue;
  }
  set textContent(value) {
    this.nodeValue = String(value);
  }
}
MockNode.ELEMENT_NODE = 1;
MockNode.TEXT_NODE = 3;
MockNode.PROCESSING_INSTRUCTION_NODE = 7;
MockNode.COMMENT_NODE = 8;
MockNode.DOCUMENT_NODE = 9;
MockNode.DOCUMENT_TYPE_NODE = 10;
MockNode.DOCUMENT_FRAGMENT_NODE = 11;
class MockNodeList {
  constructor(ownerDocument, childNodes, length) {
    this.ownerDocument = ownerDocument;
    this.childNodes = childNodes;
    this.length = length;
  }
}
class MockElement extends MockNode {
  constructor(ownerDocument, nodeName) {
    super(ownerDocument, 1 /* ELEMENT_NODE */, typeof nodeName === 'string' ? nodeName : null, null);
    this.namespaceURI = null;
  }
  addEventListener(type, handler) {
    addEventListener(this, type, handler);
  }
  attachShadow(_opts) {
    const shadowRoot = this.ownerDocument.createDocumentFragment();
    this.shadowRoot = shadowRoot;
    return shadowRoot;
  }
  get shadowRoot() {
    return this.__shadowRoot || null;
  }
  set shadowRoot(shadowRoot) {
    if (shadowRoot != null) {
      shadowRoot.host = this;
      this.__shadowRoot = shadowRoot;
    }
    else {
      delete this.__shadowRoot;
    }
  }
  get attributes() {
    if (this.__attributeMap == null) {
      this.__attributeMap = createAttributeProxy(false);
    }
    return this.__attributeMap;
  }
  set attributes(attrs) {
    this.__attributeMap = attrs;
  }
  get children() {
    return this.childNodes.filter(n => n.nodeType === 1 /* ELEMENT_NODE */);
  }
  get childElementCount() {
    return this.childNodes.filter(n => n.nodeType === 1 /* ELEMENT_NODE */).length;
  }
  get className() {
    return this.getAttributeNS(null, 'class') || '';
  }
  set className(value) {
    this.setAttributeNS(null, 'class', value);
  }
  get classList() {
    return new MockClassList(this);
  }
  click() {
    dispatchEvent(this, new MockEvent('click', { bubbles: true, cancelable: true, composed: true }));
  }
  cloneNode(_deep) {
    // implemented on MockElement.prototype from within element.ts
    return null;
  }
  closest(selector) {
    let elm = this;
    while (elm != null) {
      if (elm.matches(selector)) {
        return elm;
      }
      elm = elm.parentNode;
    }
    return null;
  }
  get dataset() {
    return dataset(this);
  }
  get dir() {
    return this.getAttributeNS(null, 'dir') || '';
  }
  set dir(value) {
    this.setAttributeNS(null, 'dir', value);
  }
  dispatchEvent(ev) {
    return dispatchEvent(this, ev);
  }
  get firstElementChild() {
    return this.children[0] || null;
  }
  getAttribute(attrName) {
    if (attrName === 'style') {
      if (this.__style != null && this.__style.length > 0) {
        return this.style.cssText;
      }
      return null;
    }
    const attr = this.attributes.getNamedItem(attrName);
    if (attr != null) {
      return attr.value;
    }
    return null;
  }
  getAttributeNS(namespaceURI, attrName) {
    const attr = this.attributes.getNamedItemNS(namespaceURI, attrName);
    if (attr != null) {
      return attr.value;
    }
    return null;
  }
  getBoundingClientRect() {
    return { bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0, x: 0, y: 0 };
  }
  getRootNode(opts) {
    const isComposed = opts != null && opts.composed === true;
    let node = this;
    while (node.parentNode != null) {
      node = node.parentNode;
      if (isComposed === true && node.parentNode == null && node.host != null) {
        node = node.host;
      }
    }
    return node;
  }
  get draggable() {
    return this.getAttributeNS(null, 'draggable') === 'true';
  }
  set draggable(value) {
    this.setAttributeNS(null, 'draggable', value);
  }
  hasChildNodes() {
    return this.childNodes.length > 0;
  }
  get id() {
    return this.getAttributeNS(null, 'id') || '';
  }
  set id(value) {
    this.setAttributeNS(null, 'id', value);
  }
  get innerHTML() {
    if (this.childNodes.length === 0) {
      return '';
    }
    return serializeNodeToHtml(this, {
      newLines: false,
      indentSpaces: 0,
    });
  }
  set innerHTML(html) {
    if (NON_ESCAPABLE_CONTENT.has(this.nodeName) === true) {
      setTextContent(this, html);
    }
    else {
      for (let i = this.childNodes.length - 1; i >= 0; i--) {
        this.removeChild(this.childNodes[i]);
      }
      if (typeof html === 'string') {
        const frag = parseFragmentUtil(this.ownerDocument, html);
        while (frag.childNodes.length > 0) {
          this.appendChild(frag.childNodes[0]);
        }
      }
    }
  }
  get innerText() {
    const text = [];
    getTextContent(this.childNodes, text);
    return text.join('');
  }
  set innerText(value) {
    setTextContent(this, value);
  }
  insertAdjacentElement(position, elm) {
    if (position === 'beforebegin') {
      insertBefore(this.parentNode, elm, this);
    }
    else if (position === 'afterbegin') {
      this.prepend(elm);
    }
    else if (position === 'beforeend') {
      this.appendChild(elm);
    }
    else if (position === 'afterend') {
      insertBefore(this.parentNode, elm, this.nextSibling);
    }
    return elm;
  }
  insertAdjacentHTML(position, html) {
    const frag = parseFragmentUtil(this.ownerDocument, html);
    if (position === 'beforebegin') {
      while (frag.childNodes.length > 0) {
        insertBefore(this.parentNode, frag.childNodes[0], this);
      }
    }
    else if (position === 'afterbegin') {
      while (frag.childNodes.length > 0) {
        this.prepend(frag.childNodes[frag.childNodes.length - 1]);
      }
    }
    else if (position === 'beforeend') {
      while (frag.childNodes.length > 0) {
        this.appendChild(frag.childNodes[0]);
      }
    }
    else if (position === 'afterend') {
      while (frag.childNodes.length > 0) {
        insertBefore(this.parentNode, frag.childNodes[frag.childNodes.length - 1], this.nextSibling);
      }
    }
  }
  insertAdjacentText(position, text) {
    const elm = this.ownerDocument.createTextNode(text);
    if (position === 'beforebegin') {
      insertBefore(this.parentNode, elm, this);
    }
    else if (position === 'afterbegin') {
      this.prepend(elm);
    }
    else if (position === 'beforeend') {
      this.appendChild(elm);
    }
    else if (position === 'afterend') {
      insertBefore(this.parentNode, elm, this.nextSibling);
    }
  }
  hasAttribute(attrName) {
    if (attrName === 'style') {
      return this.__style != null && this.__style.length > 0;
    }
    return this.getAttribute(attrName) !== null;
  }
  hasAttributeNS(namespaceURI, name) {
    return this.getAttributeNS(namespaceURI, name) !== null;
  }
  get hidden() {
    return this.hasAttributeNS(null, 'hidden');
  }
  set hidden(isHidden) {
    if (isHidden === true) {
      this.setAttributeNS(null, 'hidden', '');
    }
    else {
      this.removeAttributeNS(null, 'hidden');
    }
  }
  get lang() {
    return this.getAttributeNS(null, 'lang') || '';
  }
  set lang(value) {
    this.setAttributeNS(null, 'lang', value);
  }
  get lastElementChild() {
    const children = this.children;
    return children[children.length - 1] || null;
  }
  matches(selector) {
    return matches(selector, this);
  }
  get nextElementSibling() {
    const parentElement = this.parentElement;
    if (parentElement != null &&
      (parentElement.nodeType === 1 /* ELEMENT_NODE */ || parentElement.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */ || parentElement.nodeType === 9 /* DOCUMENT_NODE */)) {
      const children = parentElement.children;
      const index = children.indexOf(this) + 1;
      return parentElement.children[index] || null;
    }
    return null;
  }
  get outerHTML() {
    return serializeNodeToHtml(this, {
      newLines: false,
      outerHtml: true,
      indentSpaces: 0,
    });
  }
  get previousElementSibling() {
    const parentElement = this.parentElement;
    if (parentElement != null &&
      (parentElement.nodeType === 1 /* ELEMENT_NODE */ || parentElement.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */ || parentElement.nodeType === 9 /* DOCUMENT_NODE */)) {
      const children = parentElement.children;
      const index = children.indexOf(this) - 1;
      return parentElement.children[index] || null;
    }
    return null;
  }
  getElementsByClassName(classNames) {
    const classes = classNames
      .trim()
      .split(' ')
      .filter(c => c.length > 0);
    const results = [];
    getElementsByClassName(this, classes, results);
    return results;
  }
  getElementsByTagName(tagName) {
    const results = [];
    getElementsByTagName(this, tagName.toLowerCase(), results);
    return results;
  }
  querySelector(selector) {
    return selectOne(selector, this);
  }
  querySelectorAll(selector) {
    return selectAll(selector, this);
  }
  removeAttribute(attrName) {
    if (attrName === 'style') {
      delete this.__style;
    }
    else {
      const attr = this.attributes.getNamedItem(attrName);
      if (attr != null) {
        this.attributes.removeNamedItemNS(attr);
        if (checkAttributeChanged(this) === true) {
          attributeChanged(this, attrName, attr.value, null);
        }
      }
    }
  }
  removeAttributeNS(namespaceURI, attrName) {
    const attr = this.attributes.getNamedItemNS(namespaceURI, attrName);
    if (attr != null) {
      this.attributes.removeNamedItemNS(attr);
      if (checkAttributeChanged(this) === true) {
        attributeChanged(this, attrName, attr.value, null);
      }
    }
  }
  removeEventListener(type, handler) {
    removeEventListener(this, type, handler);
  }
  setAttribute(attrName, value) {
    if (attrName === 'style') {
      this.style = value;
    }
    else {
      const attributes = this.attributes;
      let attr = attributes.getNamedItem(attrName);
      const checkAttrChanged = checkAttributeChanged(this);
      if (attr != null) {
        if (checkAttrChanged === true) {
          const oldValue = attr.value;
          attr.value = value;
          if (oldValue !== attr.value) {
            attributeChanged(this, attr.name, oldValue, attr.value);
          }
        }
        else {
          attr.value = value;
        }
      }
      else {
        if (attributes.caseInsensitive) {
          attrName = attrName.toLowerCase();
        }
        attr = new MockAttr(attrName, value);
        attributes.__items.push(attr);
        if (checkAttrChanged === true) {
          attributeChanged(this, attrName, null, attr.value);
        }
      }
    }
  }
  setAttributeNS(namespaceURI, attrName, value) {
    const attributes = this.attributes;
    let attr = attributes.getNamedItemNS(namespaceURI, attrName);
    const checkAttrChanged = checkAttributeChanged(this);
    if (attr != null) {
      if (checkAttrChanged === true) {
        const oldValue = attr.value;
        attr.value = value;
        if (oldValue !== attr.value) {
          attributeChanged(this, attr.name, oldValue, attr.value);
        }
      }
      else {
        attr.value = value;
      }
    }
    else {
      attr = new MockAttr(attrName, value, namespaceURI);
      attributes.__items.push(attr);
      if (checkAttrChanged === true) {
        attributeChanged(this, attrName, null, attr.value);
      }
    }
  }
  get style() {
    if (this.__style == null) {
      this.__style = createCSSStyleDeclaration();
    }
    return this.__style;
  }
  set style(val) {
    if (typeof val === 'string') {
      if (this.__style == null) {
        this.__style = createCSSStyleDeclaration();
      }
      this.__style.cssText = val;
    }
    else {
      this.__style = val;
    }
  }
  get tabIndex() {
    return parseInt(this.getAttributeNS(null, 'tabindex') || '-1', 10);
  }
  set tabIndex(value) {
    this.setAttributeNS(null, 'tabindex', value);
  }
  get tagName() {
    return this.nodeName;
  }
  set tagName(value) {
    this.nodeName = value;
  }
  get textContent() {
    const text = [];
    getTextContent(this.childNodes, text);
    return text.join('');
  }
  set textContent(value) {
    setTextContent(this, value);
  }
  get title() {
    return this.getAttributeNS(null, 'title') || '';
  }
  set title(value) {
    this.setAttributeNS(null, 'title', value);
  }
  onanimationstart() {
    /**/
  }
  onanimationend() {
    /**/
  }
  onanimationiteration() {
    /**/
  }
  onabort() {
    /**/
  }
  onauxclick() {
    /**/
  }
  onbeforecopy() {
    /**/
  }
  onbeforecut() {
    /**/
  }
  onbeforepaste() {
    /**/
  }
  onblur() {
    /**/
  }
  oncancel() {
    /**/
  }
  oncanplay() {
    /**/
  }
  oncanplaythrough() {
    /**/
  }
  onchange() {
    /**/
  }
  onclick() {
    /**/
  }
  onclose() {
    /**/
  }
  oncontextmenu() {
    /**/
  }
  oncopy() {
    /**/
  }
  oncuechange() {
    /**/
  }
  oncut() {
    /**/
  }
  ondblclick() {
    /**/
  }
  ondrag() {
    /**/
  }
  ondragend() {
    /**/
  }
  ondragenter() {
    /**/
  }
  ondragleave() {
    /**/
  }
  ondragover() {
    /**/
  }
  ondragstart() {
    /**/
  }
  ondrop() {
    /**/
  }
  ondurationchange() {
    /**/
  }
  onemptied() {
    /**/
  }
  onended() {
    /**/
  }
  onerror() {
    /**/
  }
  onfocus() {
    /**/
  }
  onfocusin() {
    /**/
  }
  onfocusout() {
    /**/
  }
  onformdata() {
    /**/
  }
  onfullscreenchange() {
    /**/
  }
  onfullscreenerror() {
    /**/
  }
  ongotpointercapture() {
    /**/
  }
  oninput() {
    /**/
  }
  oninvalid() {
    /**/
  }
  onkeydown() {
    /**/
  }
  onkeypress() {
    /**/
  }
  onkeyup() {
    /**/
  }
  onload() {
    /**/
  }
  onloadeddata() {
    /**/
  }
  onloadedmetadata() {
    /**/
  }
  onloadstart() {
    /**/
  }
  onlostpointercapture() {
    /**/
  }
  onmousedown() {
    /**/
  }
  onmouseenter() {
    /**/
  }
  onmouseleave() {
    /**/
  }
  onmousemove() {
    /**/
  }
  onmouseout() {
    /**/
  }
  onmouseover() {
    /**/
  }
  onmouseup() {
    /**/
  }
  onmousewheel() {
    /**/
  }
  onpaste() {
    /**/
  }
  onpause() {
    /**/
  }
  onplay() {
    /**/
  }
  onplaying() {
    /**/
  }
  onpointercancel() {
    /**/
  }
  onpointerdown() {
    /**/
  }
  onpointerenter() {
    /**/
  }
  onpointerleave() {
    /**/
  }
  onpointermove() {
    /**/
  }
  onpointerout() {
    /**/
  }
  onpointerover() {
    /**/
  }
  onpointerup() {
    /**/
  }
  onprogress() {
    /**/
  }
  onratechange() {
    /**/
  }
  onreset() {
    /**/
  }
  onresize() {
    /**/
  }
  onscroll() {
    /**/
  }
  onsearch() {
    /**/
  }
  onseeked() {
    /**/
  }
  onseeking() {
    /**/
  }
  onselect() {
    /**/
  }
  onselectstart() {
    /**/
  }
  onstalled() {
    /**/
  }
  onsubmit() {
    /**/
  }
  onsuspend() {
    /**/
  }
  ontimeupdate() {
    /**/
  }
  ontoggle() {
    /**/
  }
  onvolumechange() {
    /**/
  }
  onwaiting() {
    /**/
  }
  onwebkitfullscreenchange() {
    /**/
  }
  onwebkitfullscreenerror() {
    /**/
  }
  onwheel() {
    /**/
  }
  toString(opts) {
    return serializeNodeToHtml(this, opts);
  }
}
function getElementsByClassName(elm, classNames, foundElms) {
  const children = elm.children;
  for (let i = 0, ii = children.length; i < ii; i++) {
    const childElm = children[i];
    for (let j = 0, jj = classNames.length; j < jj; j++) {
      if (childElm.classList.contains(classNames[j])) {
        foundElms.push(childElm);
      }
    }
    getElementsByClassName(childElm, classNames, foundElms);
  }
}
function getElementsByTagName(elm, tagName, foundElms) {
  const children = elm.children;
  for (let i = 0, ii = children.length; i < ii; i++) {
    const childElm = children[i];
    if (tagName === '*' || childElm.nodeName.toLowerCase() === tagName) {
      foundElms.push(childElm);
    }
    getElementsByTagName(childElm, tagName, foundElms);
  }
}
function resetElement(elm) {
  resetEventListeners(elm);
  delete elm.__attributeMap;
  delete elm.__shadowRoot;
  delete elm.__style;
}
function insertBefore(parentNode, newNode, referenceNode) {
  if (newNode !== referenceNode) {
    newNode.remove();
    newNode.parentNode = parentNode;
    newNode.ownerDocument = parentNode.ownerDocument;
    if (referenceNode != null) {
      const index = parentNode.childNodes.indexOf(referenceNode);
      if (index > -1) {
        parentNode.childNodes.splice(index, 0, newNode);
      }
      else {
        throw new Error(`referenceNode not found in parentNode.childNodes`);
      }
    }
    else {
      parentNode.childNodes.push(newNode);
    }
    connectNode(parentNode.ownerDocument, newNode);
  }
  return newNode;
}
class MockHTMLElement extends MockElement {
  constructor(ownerDocument, nodeName) {
    super(ownerDocument, typeof nodeName === 'string' ? nodeName.toUpperCase() : null);
    this.namespaceURI = 'http://www.w3.org/1999/xhtml';
  }
  get tagName() {
    return this.nodeName;
  }
  set tagName(value) {
    this.nodeName = value;
  }
  get attributes() {
    if (this.__attributeMap == null) {
      this.__attributeMap = createAttributeProxy(true);
    }
    return this.__attributeMap;
  }
  set attributes(attrs) {
    this.__attributeMap = attrs;
  }
}
class MockTextNode extends MockNode {
  constructor(ownerDocument, text) {
    super(ownerDocument, 3 /* TEXT_NODE */, "#text" /* TEXT_NODE */, text);
  }
  cloneNode(_deep) {
    return new MockTextNode(null, this.nodeValue);
  }
  get textContent() {
    return this.nodeValue;
  }
  set textContent(text) {
    this.nodeValue = text;
  }
  get data() {
    return this.nodeValue;
  }
  set data(text) {
    this.nodeValue = text;
  }
  get wholeText() {
    if (this.parentNode != null) {
      const text = [];
      for (let i = 0, ii = this.parentNode.childNodes.length; i < ii; i++) {
        const childNode = this.parentNode.childNodes[i];
        if (childNode.nodeType === 3 /* TEXT_NODE */) {
          text.push(childNode.nodeValue);
        }
      }
      return text.join('');
    }
    return this.nodeValue;
  }
}
function getTextContent(childNodes, text) {
  for (let i = 0, ii = childNodes.length; i < ii; i++) {
    const childNode = childNodes[i];
    if (childNode.nodeType === 3 /* TEXT_NODE */) {
      text.push(childNode.nodeValue);
    }
    else if (childNode.nodeType === 1 /* ELEMENT_NODE */) {
      getTextContent(childNode.childNodes, text);
    }
  }
}
function setTextContent(elm, text) {
  for (let i = elm.childNodes.length - 1; i >= 0; i--) {
    elm.removeChild(elm.childNodes[i]);
  }
  const textNode = new MockTextNode(elm.ownerDocument, text);
  elm.appendChild(textNode);
}

class MockComment extends MockNode {
  constructor(ownerDocument, data) {
    super(ownerDocument, 8 /* COMMENT_NODE */, "#comment" /* COMMENT_NODE */, data);
  }
  cloneNode(_deep) {
    return new MockComment(null, this.nodeValue);
  }
  get textContent() {
    return this.nodeValue;
  }
  set textContent(text) {
    this.nodeValue = text;
  }
}

class MockDocumentFragment extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, null);
    this.nodeName = "#document-fragment" /* DOCUMENT_FRAGMENT_NODE */;
    this.nodeType = 11 /* DOCUMENT_FRAGMENT_NODE */;
  }
  getElementById(id) {
    return getElementById(this, id);
  }
  cloneNode(deep) {
    const cloned = new MockDocumentFragment(null);
    if (deep) {
      for (let i = 0, ii = this.childNodes.length; i < ii; i++) {
        const childNode = this.childNodes[i];
        if (childNode.nodeType === 1 /* ELEMENT_NODE */ || childNode.nodeType === 3 /* TEXT_NODE */ || childNode.nodeType === 8 /* COMMENT_NODE */) {
          const clonedChildNode = this.childNodes[i].cloneNode(true);
          cloned.appendChild(clonedChildNode);
        }
      }
    }
    return cloned;
  }
}

class MockDocumentTypeNode extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, '!DOCTYPE');
    this.nodeType = 10 /* DOCUMENT_TYPE_NODE */;
    this.setAttribute('html', '');
  }
}

class MockCSSRule {
  constructor(parentStyleSheet) {
    this.parentStyleSheet = parentStyleSheet;
    this.cssText = '';
    this.type = 0;
  }
}
class MockCSSStyleSheet {
  constructor(ownerNode) {
    this.type = 'text/css';
    this.parentStyleSheet = null;
    this.cssRules = [];
    this.ownerNode = ownerNode;
  }
  get rules() {
    return this.cssRules;
  }
  set rules(rules) {
    this.cssRules = rules;
  }
  deleteRule(index) {
    if (index >= 0 && index < this.cssRules.length) {
      this.cssRules.splice(index, 1);
      updateStyleTextNode(this.ownerNode);
    }
  }
  insertRule(rule, index = 0) {
    if (typeof index !== 'number') {
      index = 0;
    }
    if (index < 0) {
      index = 0;
    }
    if (index > this.cssRules.length) {
      index = this.cssRules.length;
    }
    const cssRule = new MockCSSRule(this);
    cssRule.cssText = rule;
    this.cssRules.splice(index, 0, cssRule);
    updateStyleTextNode(this.ownerNode);
    return index;
  }
}
function getStyleElementText(styleElm) {
  const output = [];
  for (let i = 0; i < styleElm.childNodes.length; i++) {
    output.push(styleElm.childNodes[i].nodeValue);
  }
  return output.join('');
}
function setStyleElementText(styleElm, text) {
  // keeping the innerHTML and the sheet.cssRules connected
  // is not technically correct, but since we're doing
  // SSR we'll need to turn any assigned cssRules into
  // real text, not just properties that aren't rendered
  const sheet = styleElm.sheet;
  sheet.cssRules.length = 0;
  sheet.insertRule(text);
  updateStyleTextNode(styleElm);
}
function updateStyleTextNode(styleElm) {
  const childNodeLen = styleElm.childNodes.length;
  if (childNodeLen > 1) {
    for (let i = childNodeLen - 1; i >= 1; i--) {
      styleElm.removeChild(styleElm.childNodes[i]);
    }
  }
  else if (childNodeLen < 1) {
    styleElm.appendChild(styleElm.ownerDocument.createTextNode(''));
  }
  const textNode = styleElm.childNodes[0];
  textNode.nodeValue = styleElm.sheet.cssRules.map(r => r.cssText).join('\n');
}

function createElement(ownerDocument, tagName) {
  if (typeof tagName !== 'string' || tagName === '' || !/^[a-z0-9-_:]+$/i.test(tagName)) {
    throw new Error(`The tag name provided (${tagName}) is not a valid name.`);
  }
  tagName = tagName.toLowerCase();
  switch (tagName) {
    case 'a':
      return new MockAnchorElement(ownerDocument);
    case 'base':
      return new MockBaseElement(ownerDocument);
    case 'button':
      return new MockButtonElement(ownerDocument);
    case 'canvas':
      return new MockCanvasElement(ownerDocument);
    case 'form':
      return new MockFormElement(ownerDocument);
    case 'img':
      return new MockImageElement(ownerDocument);
    case 'input':
      return new MockInputElement(ownerDocument);
    case 'link':
      return new MockLinkElement(ownerDocument);
    case 'meta':
      return new MockMetaElement(ownerDocument);
    case 'script':
      return new MockScriptElement(ownerDocument);
    case 'style':
      return new MockStyleElement(ownerDocument);
    case 'template':
      return new MockTemplateElement(ownerDocument);
    case 'title':
      return new MockTitleElement(ownerDocument);
  }
  if (ownerDocument != null && tagName.includes('-')) {
    const win = ownerDocument.defaultView;
    if (win != null && win.customElements != null) {
      return createCustomElement(win.customElements, ownerDocument, tagName);
    }
  }
  return new MockHTMLElement(ownerDocument, tagName);
}
function createElementNS(ownerDocument, namespaceURI, tagName) {
  if (namespaceURI === 'http://www.w3.org/1999/xhtml') {
    return createElement(ownerDocument, tagName);
  }
  else if (namespaceURI === 'http://www.w3.org/2000/svg') {
    return new MockSVGElement(ownerDocument, tagName);
  }
  else {
    return new MockElement(ownerDocument, tagName);
  }
}
class MockAnchorElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'a');
  }
  get href() {
    return fullUrl(this, 'href');
  }
  set href(value) {
    this.setAttribute('href', value);
  }
}
class MockButtonElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'button');
  }
}
patchPropAttributes(MockButtonElement.prototype, {
  type: String,
}, {
  type: 'submit',
});
class MockImageElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'img');
  }
  get draggable() {
    return this.getAttributeNS(null, 'draggable') !== 'false';
  }
  set draggable(value) {
    this.setAttributeNS(null, 'draggable', value);
  }
  get src() {
    return fullUrl(this, 'src');
  }
  set src(value) {
    this.setAttribute('src', value);
  }
}
patchPropAttributes(MockImageElement.prototype, {
  height: Number,
  width: Number,
});
class MockInputElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'input');
  }
  get list() {
    const listId = this.getAttribute('list');
    if (listId) {
      return this.ownerDocument.getElementById(listId);
    }
    return null;
  }
}
patchPropAttributes(MockInputElement.prototype, {
  accept: String,
  autocomplete: String,
  autofocus: Boolean,
  capture: String,
  checked: Boolean,
  disabled: Boolean,
  form: String,
  formaction: String,
  formenctype: String,
  formmethod: String,
  formnovalidate: String,
  formtarget: String,
  height: Number,
  inputmode: String,
  max: String,
  maxLength: Number,
  min: String,
  minLength: Number,
  multiple: Boolean,
  name: String,
  pattern: String,
  placeholder: String,
  required: Boolean,
  readOnly: Boolean,
  size: Number,
  spellCheck: Boolean,
  src: String,
  step: String,
  type: String,
  value: String,
  width: Number,
}, {
  type: 'text',
});
class MockFormElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'form');
  }
}
patchPropAttributes(MockFormElement.prototype, {
  name: String,
});
class MockLinkElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'link');
  }
  get href() {
    return fullUrl(this, 'href');
  }
  set href(value) {
    this.setAttribute('href', value);
  }
}
patchPropAttributes(MockLinkElement.prototype, {
  crossorigin: String,
  media: String,
  rel: String,
  type: String,
});
class MockMetaElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'meta');
  }
}
patchPropAttributes(MockMetaElement.prototype, {
  charset: String,
  content: String,
  name: String,
});
class MockScriptElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'script');
  }
  get src() {
    return fullUrl(this, 'src');
  }
  set src(value) {
    this.setAttribute('src', value);
  }
}
patchPropAttributes(MockScriptElement.prototype, {
  type: String,
});
class MockStyleElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'style');
    this.sheet = new MockCSSStyleSheet(this);
  }
  get innerHTML() {
    return getStyleElementText(this);
  }
  set innerHTML(value) {
    setStyleElementText(this, value);
  }
  get innerText() {
    return getStyleElementText(this);
  }
  set innerText(value) {
    setStyleElementText(this, value);
  }
  get textContent() {
    return getStyleElementText(this);
  }
  set textContent(value) {
    setStyleElementText(this, value);
  }
}
class MockSVGElement extends MockElement {
  // SVGElement properties and methods
  get ownerSVGElement() {
    return null;
  }
  get viewportElement() {
    return null;
  }
  focus() {
    /**/
  }
  onunload() {
    /**/
  }
  // SVGGeometryElement properties and methods
  get pathLength() {
    return 0;
  }
  isPointInFill(_pt) {
    return false;
  }
  isPointInStroke(_pt) {
    return false;
  }
  getTotalLength() {
    return 0;
  }
}
class MockBaseElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'base');
  }
  get href() {
    return fullUrl(this, 'href');
  }
  set href(value) {
    this.setAttribute('href', value);
  }
}
class MockTemplateElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'template');
    this.content = new MockDocumentFragment(ownerDocument);
  }
  get innerHTML() {
    return this.content.innerHTML;
  }
  set innerHTML(html) {
    this.content.innerHTML = html;
  }
  cloneNode(deep) {
    const cloned = new MockTemplateElement(null);
    cloned.attributes = cloneAttributes(this.attributes);
    const styleCssText = this.getAttribute('style');
    if (styleCssText != null && styleCssText.length > 0) {
      cloned.setAttribute('style', styleCssText);
    }
    cloned.content = this.content.cloneNode(deep);
    if (deep) {
      for (let i = 0, ii = this.childNodes.length; i < ii; i++) {
        const clonedChildNode = this.childNodes[i].cloneNode(true);
        cloned.appendChild(clonedChildNode);
      }
    }
    return cloned;
  }
}
class MockTitleElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'title');
  }
  get text() {
    return this.textContent;
  }
  set text(value) {
    this.textContent = value;
  }
}
class MockCanvasElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'canvas');
  }
  getContext() {
    return {
      fillRect() {
        return;
      },
      clearRect() { },
      getImageData: function (_, __, w, h) {
        return {
          data: new Array(w * h * 4),
        };
      },
      putImageData() { },
      createImageData: function () {
        return [];
      },
      setTransform() { },
      drawImage() { },
      save() { },
      fillText() { },
      restore() { },
      beginPath() { },
      moveTo() { },
      lineTo() { },
      closePath() { },
      stroke() { },
      translate() { },
      scale() { },
      rotate() { },
      arc() { },
      fill() { },
      measureText() {
        return { width: 0 };
      },
      transform() { },
      rect() { },
      clip() { },
    };
  }
}
function fullUrl(elm, attrName) {
  const val = elm.getAttribute(attrName) || '';
  if (elm.ownerDocument != null) {
    const win = elm.ownerDocument.defaultView;
    if (win != null) {
      const loc = win.location;
      if (loc != null) {
        try {
          const url = new URL(val, loc.href);
          return url.href;
        }
        catch (e) { }
      }
    }
  }
  return val.replace(/\'|\"/g, '').trim();
}
function patchPropAttributes(prototype, attrs, defaults = {}) {
  Object.keys(attrs).forEach(propName => {
    const attr = attrs[propName];
    const defaultValue = defaults[propName];
    if (attr === Boolean) {
      Object.defineProperty(prototype, propName, {
        get() {
          return this.hasAttribute(propName);
        },
        set(value) {
          if (value) {
            this.setAttribute(propName, '');
          }
          else {
            this.removeAttribute(propName);
          }
        },
      });
    }
    else if (attr === Number) {
      Object.defineProperty(prototype, propName, {
        get() {
          const value = this.getAttribute(propName);
          return value ? parseInt(value, 10) : defaultValue === undefined ? 0 : defaultValue;
        },
        set(value) {
          this.setAttribute(propName, value);
        },
      });
    }
    else {
      Object.defineProperty(prototype, propName, {
        get() {
          return this.hasAttribute(propName) ? this.getAttribute(propName) : defaultValue || '';
        },
        set(value) {
          this.setAttribute(propName, value);
        },
      });
    }
  });
}
MockElement.prototype.cloneNode = function (deep) {
  // because we're creating elements, which extending specific HTML base classes there
  // is a MockElement circular reference that bundling has trouble dealing with so
  // the fix is to add cloneNode() to MockElement's prototype after the HTML classes
  const cloned = createElement(this.ownerDocument, this.nodeName);
  cloned.attributes = cloneAttributes(this.attributes);
  const styleCssText = this.getAttribute('style');
  if (styleCssText != null && styleCssText.length > 0) {
    cloned.setAttribute('style', styleCssText);
  }
  if (deep) {
    for (let i = 0, ii = this.childNodes.length; i < ii; i++) {
      const clonedChildNode = this.childNodes[i].cloneNode(true);
      cloned.appendChild(clonedChildNode);
    }
  }
  return cloned;
};

let sharedDocument;
function parseHtmlToDocument(html, ownerDocument = null) {
  if (ownerDocument == null) {
    if (sharedDocument == null) {
      sharedDocument = new MockDocument();
    }
    ownerDocument = sharedDocument;
  }
  return parseDocumentUtil(ownerDocument, html);
}
function parseHtmlToFragment(html, ownerDocument = null) {
  if (ownerDocument == null) {
    if (sharedDocument == null) {
      sharedDocument = new MockDocument();
    }
    ownerDocument = sharedDocument;
  }
  return parseFragmentUtil(ownerDocument, html);
}

class MockHeaders {
  constructor(init) {
    this._values = [];
    if (typeof init === 'object') {
      if (typeof init[Symbol.iterator] === 'function') {
        const kvs = [];
        for (const kv of init) {
          if (typeof kv[Symbol.iterator] === 'function') {
            kvs.push([...kv]);
          }
        }
        for (const kv of kvs) {
          this.append(kv[0], kv[1]);
        }
      }
      else {
        for (const key in init) {
          this.append(key, init[key]);
        }
      }
    }
  }
  append(key, value) {
    this._values.push([key, value + '']);
  }
  delete(key) {
    key = key.toLowerCase();
    for (let i = this._values.length - 1; i >= 0; i--) {
      if (this._values[i][0].toLowerCase() === key) {
        this._values.splice(i, 1);
      }
    }
  }
  entries() {
    const entries = [];
    for (const kv of this.keys()) {
      entries.push([kv, this.get(kv)]);
    }
    let index = -1;
    return {
      next() {
        index++;
        return {
          value: entries[index],
          done: !entries[index],
        };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
  forEach(cb) {
    for (const kv of this.entries()) {
      cb(kv[1], kv[0]);
    }
  }
  get(key) {
    const rtn = [];
    key = key.toLowerCase();
    for (const kv of this._values) {
      if (kv[0].toLowerCase() === key) {
        rtn.push(kv[1]);
      }
    }
    return rtn.length > 0 ? rtn.join(', ') : null;
  }
  has(key) {
    key = key.toLowerCase();
    for (const kv of this._values) {
      if (kv[0].toLowerCase() === key) {
        return true;
      }
    }
    return false;
  }
  keys() {
    const keys = [];
    for (const kv of this._values) {
      const key = kv[0].toLowerCase();
      if (!keys.includes(key)) {
        keys.push(key);
      }
    }
    let index = -1;
    return {
      next() {
        index++;
        return {
          value: keys[index],
          done: !keys[index],
        };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
  set(key, value) {
    for (const kv of this._values) {
      if (kv[0].toLowerCase() === key.toLowerCase()) {
        kv[1] = value + '';
        return;
      }
    }
    this.append(key, value);
  }
  values() {
    const values = this._values;
    let index = -1;
    return {
      next() {
        index++;
        const done = !values[index];
        return {
          value: done ? undefined : values[index][1],
          done,
        };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
  [Symbol.iterator]() {
    return this.entries();
  }
}

class MockRequest {
  constructor(input, init = {}) {
    this._method = 'GET';
    this._url = '/';
    this.bodyUsed = false;
    this.cache = 'default';
    this.credentials = 'same-origin';
    this.integrity = '';
    this.keepalive = false;
    this.mode = 'cors';
    this.redirect = 'follow';
    this.referrer = 'about:client';
    this.referrerPolicy = '';
    if (typeof input === 'string') {
      this.url = input;
    }
    else if (input) {
      Object.assign(this, input);
      this.headers = new MockHeaders(input.headers);
    }
    Object.assign(this, init);
    if (init.headers) {
      this.headers = new MockHeaders(init.headers);
    }
    if (!this.headers) {
      this.headers = new MockHeaders();
    }
  }
  get url() {
    if (typeof this._url === 'string') {
      return new URL(this._url, location.href).href;
    }
    return new URL('/', location.href).href;
  }
  set url(value) {
    this._url = value;
  }
  get method() {
    if (typeof this._method === 'string') {
      return this._method.toUpperCase();
    }
    return 'GET';
  }
  set method(value) {
    this._method = value;
  }
  clone() {
    const clone = Object.assign({}, this);
    clone.headers = new MockHeaders(this.headers);
    return new MockRequest(clone);
  }
}
class MockResponse {
  constructor(body, init = {}) {
    this.ok = true;
    this.status = 200;
    this.statusText = '';
    this.type = 'default';
    this.url = '';
    this._body = body;
    if (init) {
      Object.assign(this, init);
    }
    this.headers = new MockHeaders(init.headers);
  }
  async json() {
    return JSON.parse(this._body);
  }
  async text() {
    return this._body;
  }
  clone() {
    const initClone = Object.assign({}, this);
    initClone.headers = new MockHeaders(this.headers);
    return new MockResponse(this._body, initClone);
  }
}

function setupGlobal(gbl) {
  if (gbl.window == null) {
    const win = (gbl.window = new MockWindow());
    WINDOW_FUNCTIONS.forEach(fnName => {
      if (!(fnName in gbl)) {
        gbl[fnName] = win[fnName].bind(win);
      }
    });
    WINDOW_PROPS.forEach(propName => {
      if (!(propName in gbl)) {
        Object.defineProperty(gbl, propName, {
          get() {
            return win[propName];
          },
          set(val) {
            win[propName] = val;
          },
          configurable: true,
          enumerable: true,
        });
      }
    });
    GLOBAL_CONSTRUCTORS.forEach(([cstrName]) => {
      gbl[cstrName] = win[cstrName];
    });
  }
  return gbl.window;
}
function teardownGlobal(gbl) {
  const win = gbl.window;
  if (win && typeof win.close === 'function') {
    win.close();
  }
}
function patchWindow(winToBePatched) {
  const mockWin = new MockWindow(false);
  WINDOW_FUNCTIONS.forEach(fnName => {
    if (typeof winToBePatched[fnName] !== 'function') {
      winToBePatched[fnName] = mockWin[fnName].bind(mockWin);
    }
  });
  WINDOW_PROPS.forEach(propName => {
    if (winToBePatched === undefined) {
      Object.defineProperty(winToBePatched, propName, {
        get() {
          return mockWin[propName];
        },
        set(val) {
          mockWin[propName] = val;
        },
        configurable: true,
        enumerable: true,
      });
    }
  });
}
function addGlobalsToWindowPrototype(mockWinPrototype) {
  GLOBAL_CONSTRUCTORS.forEach(([cstrName, Cstr]) => {
    Object.defineProperty(mockWinPrototype, cstrName, {
      get() {
        return this['__' + cstrName] || Cstr;
      },
      set(cstr) {
        this['__' + cstrName] = cstr;
      },
      configurable: true,
      enumerable: true,
    });
  });
}
const WINDOW_FUNCTIONS = [
  'addEventListener',
  'alert',
  'blur',
  'cancelAnimationFrame',
  'cancelIdleCallback',
  'clearInterval',
  'clearTimeout',
  'close',
  'confirm',
  'dispatchEvent',
  'focus',
  'getComputedStyle',
  'matchMedia',
  'open',
  'prompt',
  'removeEventListener',
  'requestAnimationFrame',
  'requestIdleCallback',
  'URL',
];
const WINDOW_PROPS = [
  'customElements',
  'devicePixelRatio',
  'document',
  'history',
  'innerHeight',
  'innerWidth',
  'localStorage',
  'location',
  'navigator',
  'pageXOffset',
  'pageYOffset',
  'performance',
  'screenLeft',
  'screenTop',
  'screenX',
  'screenY',
  'scrollX',
  'scrollY',
  'sessionStorage',
  'CSS',
  'CustomEvent',
  'Event',
  'Element',
  'HTMLElement',
  'Node',
  'NodeList',
  'KeyboardEvent',
  'MouseEvent',
];
const GLOBAL_CONSTRUCTORS = [
  ['CustomEvent', MockCustomEvent],
  ['Event', MockEvent],
  ['Headers', MockHeaders],
  ['KeyboardEvent', MockKeyboardEvent],
  ['MouseEvent', MockMouseEvent],
  ['Request', MockRequest],
  ['Response', MockResponse],
  ['HTMLAnchorElement', MockAnchorElement],
  ['HTMLBaseElement', MockBaseElement],
  ['HTMLButtonElement', MockButtonElement],
  ['HTMLCanvasElement', MockCanvasElement],
  ['HTMLFormElement', MockFormElement],
  ['HTMLImageElement', MockImageElement],
  ['HTMLInputElement', MockInputElement],
  ['HTMLLinkElement', MockLinkElement],
  ['HTMLMetaElement', MockMetaElement],
  ['HTMLScriptElement', MockScriptElement],
  ['HTMLStyleElement', MockStyleElement],
  ['HTMLTemplateElement', MockTemplateElement],
  ['HTMLTitleElement', MockTitleElement],
];

const consoleNoop = () => {
  /**/
};
function createConsole() {
  return {
    debug: consoleNoop,
    error: consoleNoop,
    info: consoleNoop,
    log: consoleNoop,
    warn: consoleNoop,
    dir: consoleNoop,
    dirxml: consoleNoop,
    table: consoleNoop,
    trace: consoleNoop,
    group: consoleNoop,
    groupCollapsed: consoleNoop,
    groupEnd: consoleNoop,
    clear: consoleNoop,
    count: consoleNoop,
    countReset: consoleNoop,
    assert: consoleNoop,
    profile: consoleNoop,
    profileEnd: consoleNoop,
    time: consoleNoop,
    timeLog: consoleNoop,
    timeEnd: consoleNoop,
    timeStamp: consoleNoop,
    context: consoleNoop,
    memory: consoleNoop,
  };
}

class MockHistory {
  constructor() {
    this.items = [];
  }
  get length() {
    return this.items.length;
  }
  back() {
    this.go(-1);
  }
  forward() {
    this.go(1);
  }
  go(_value) {
    //
  }
  pushState(_state, _title, _url) {
    //
  }
  replaceState(_state, _title, _url) {
    //
  }
}

class MockIntersectionObserver {
  constructor() {
    /**/
  }
  disconnect() {
    /**/
  }
  observe() {
    /**/
  }
  takeRecords() {
    return [];
  }
  unobserve() {
    /**/
  }
}

class MockLocation {
  constructor() {
    this.ancestorOrigins = null;
    this.protocol = '';
    this.host = '';
    this.hostname = '';
    this.port = '';
    this.pathname = '';
    this.search = '';
    this.hash = '';
    this.username = '';
    this.password = '';
    this.origin = '';
    this._href = '';
  }
  get href() {
    return this._href;
  }
  set href(value) {
    const url = new URL(value, 'http://mockdoc.stenciljs.com');
    this._href = url.href;
    this.protocol = url.protocol;
    this.host = url.host;
    this.port = url.port;
    this.pathname = url.pathname;
    this.search = url.search;
    this.hash = url.hash;
    this.username = url.username;
    this.password = url.password;
    this.origin = url.origin;
  }
  assign(_url) {
    //
  }
  reload(_forcedReload) {
    //
  }
  replace(_url) {
    //
  }
  toString() {
    return this.href;
  }
}

class MockNavigator {
  constructor() {
    this.appCodeName = 'MockNavigator';
    this.appName = 'MockNavigator';
    this.appVersion = 'MockNavigator';
    this.platform = 'MockNavigator';
    this.userAgent = 'MockNavigator';
  }
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Performance
 */
class MockPerformance {
  constructor() {
    this.timeOrigin = Date.now();
  }
  addEventListener() {
    //
  }
  clearMarks() {
    //
  }
  clearMeasures() {
    //
  }
  clearResourceTimings() {
    //
  }
  dispatchEvent() {
    return true;
  }
  getEntries() {
    return [];
  }
  getEntriesByName() {
    return [];
  }
  getEntriesByType() {
    return [];
  }
  mark() {
    //
  }
  measure() {
    //
  }
  get navigation() {
    return {};
  }
  now() {
    return Date.now() - this.timeOrigin;
  }
  get onresourcetimingbufferfull() {
    return null;
  }
  removeEventListener() {
    //
  }
  setResourceTimingBufferSize() {
    //
  }
  get timing() {
    return {};
  }
  toJSON() {
    //
  }
}
function resetPerformance(perf) {
  if (perf != null) {
    try {
      perf.timeOrigin = Date.now();
    }
    catch (e) { }
  }
}

class MockStorage {
  constructor() {
    this.items = new Map();
  }
  key(_value) {
    //
  }
  getItem(key) {
    key = String(key);
    if (this.items.has(key)) {
      return this.items.get(key);
    }
    return null;
  }
  setItem(key, value) {
    if (value == null) {
      value = 'null';
    }
    this.items.set(String(key), String(value));
  }
  removeItem(key) {
    this.items.delete(String(key));
  }
  clear() {
    this.items.clear();
  }
}

const nativeClearInterval = clearInterval;
const nativeClearTimeout = clearTimeout;
const nativeSetInterval = setInterval;
const nativeSetTimeout = setTimeout;
const nativeURL = URL;
class MockWindow {
  constructor(html = null) {
    if (html !== false) {
      this.document = new MockDocument(html, this);
    }
    else {
      this.document = null;
    }
    this.performance = new MockPerformance();
    this.customElements = new MockCustomElementRegistry(this);
    this.console = createConsole();
    resetWindowDefaults(this);
    resetWindowDimensions(this);
  }
  addEventListener(type, handler) {
    addEventListener(this, type, handler);
  }
  alert(msg) {
    if (this.console) {
      this.console.debug(msg);
    }
    else {
      console.debug(msg);
    }
  }
  blur() {
    /**/
  }
  cancelAnimationFrame(id) {
    this.__clearTimeout(id);
  }
  cancelIdleCallback(id) {
    this.__clearTimeout(id);
  }
  get CharacterData() {
    if (this.__charDataCstr == null) {
      const ownerDocument = this.document;
      this.__charDataCstr = class extends MockNode {
        constructor() {
          super(ownerDocument, 0, 'test', '');
          throw new Error('Illegal constructor: cannot construct CharacterData');
        }
      };
    }
    return this.__charDataCstr;
  }
  set CharacterData(charDataCstr) {
    this.__charDataCstr = charDataCstr;
  }
  clearInterval(id) {
    this.__clearInterval(id);
  }
  clearTimeout(id) {
    this.__clearTimeout(id);
  }
  close() {
    resetWindow(this);
  }
  confirm() {
    return false;
  }
  get CSS() {
    return {
      supports: () => true,
    };
  }
  get Document() {
    if (this.__docCstr == null) {
      const win = this;
      this.__docCstr = class extends MockDocument {
        constructor() {
          super(false, win);
          throw new Error('Illegal constructor: cannot construct Document');
        }
      };
    }
    return this.__docCstr;
  }
  set Document(docCstr) {
    this.__docCstr = docCstr;
  }
  get DocumentFragment() {
    if (this.__docFragCstr == null) {
      const ownerDocument = this.document;
      this.__docFragCstr = class extends MockDocumentFragment {
        constructor() {
          super(ownerDocument);
          throw new Error('Illegal constructor: cannot construct DocumentFragment');
        }
      };
    }
    return this.__docFragCstr;
  }
  set DocumentFragment(docFragCstr) {
    this.__docFragCstr = docFragCstr;
  }
  get DocumentType() {
    if (this.__docTypeCstr == null) {
      const ownerDocument = this.document;
      this.__docTypeCstr = class extends MockNode {
        constructor() {
          super(ownerDocument, 0, 'test', '');
          throw new Error('Illegal constructor: cannot construct DocumentType');
        }
      };
    }
    return this.__docTypeCstr;
  }
  set DocumentType(docTypeCstr) {
    this.__docTypeCstr = docTypeCstr;
  }
  get DOMTokenList() {
    if (this.__domTokenListCstr == null) {
      this.__domTokenListCstr = class MockDOMTokenList {
      };
    }
    return this.__domTokenListCstr;
  }
  set DOMTokenList(domTokenListCstr) {
    this.__domTokenListCstr = domTokenListCstr;
  }
  dispatchEvent(ev) {
    return dispatchEvent(this, ev);
  }
  get Element() {
    if (this.__elementCstr == null) {
      const ownerDocument = this.document;
      this.__elementCstr = class extends MockElement {
        constructor() {
          super(ownerDocument, '');
          throw new Error('Illegal constructor: cannot construct Element');
        }
      };
    }
    return this.__elementCstr;
  }
  focus() {
    /**/
  }
  getComputedStyle(_) {
    return {
      cssText: '',
      length: 0,
      parentRule: null,
      getPropertyPriority() {
        return null;
      },
      getPropertyValue() {
        return '';
      },
      item() {
        return null;
      },
      removeProperty() {
        return null;
      },
      setProperty() {
        return null;
      },
    };
  }
  get globalThis() {
    return this;
  }
  get history() {
    if (this.__history == null) {
      this.__history = new MockHistory();
    }
    return this.__history;
  }
  set history(hsty) {
    this.__history = hsty;
  }
  get JSON() {
    return JSON;
  }
  get HTMLElement() {
    if (this.__htmlElementCstr == null) {
      const ownerDocument = this.document;
      this.__htmlElementCstr = class extends MockHTMLElement {
        constructor() {
          super(ownerDocument, '');
          const observedAttributes = this.constructor.observedAttributes;
          if (Array.isArray(observedAttributes) && typeof this.attributeChangedCallback === 'function') {
            observedAttributes.forEach(attrName => {
              const attrValue = this.getAttribute(attrName);
              if (attrValue != null) {
                this.attributeChangedCallback(attrName, null, attrValue);
              }
            });
          }
        }
      };
    }
    return this.__htmlElementCstr;
  }
  set HTMLElement(htmlElementCstr) {
    this.__htmlElementCstr = htmlElementCstr;
  }
  get IntersectionObserver() {
    return MockIntersectionObserver;
  }
  get localStorage() {
    if (this.__localStorage == null) {
      this.__localStorage = new MockStorage();
    }
    return this.__localStorage;
  }
  set localStorage(locStorage) {
    this.__localStorage = locStorage;
  }
  get location() {
    if (this.__location == null) {
      this.__location = new MockLocation();
    }
    return this.__location;
  }
  set location(val) {
    if (typeof val === 'string') {
      if (this.__location == null) {
        this.__location = new MockLocation();
      }
      this.__location.href = val;
    }
    else {
      this.__location = val;
    }
  }
  matchMedia() {
    return {
      matches: false,
    };
  }
  get Node() {
    if (this.__nodeCstr == null) {
      const ownerDocument = this.document;
      this.__nodeCstr = class extends MockNode {
        constructor() {
          super(ownerDocument, 0, 'test', '');
          throw new Error('Illegal constructor: cannot construct Node');
        }
      };
    }
    return this.__nodeCstr;
  }
  get NodeList() {
    if (this.__nodeListCstr == null) {
      const ownerDocument = this.document;
      this.__nodeListCstr = class extends MockNodeList {
        constructor() {
          super(ownerDocument, [], 0);
          throw new Error('Illegal constructor: cannot construct NodeList');
        }
      };
    }
    return this.__nodeListCstr;
  }
  get navigator() {
    if (this.__navigator == null) {
      this.__navigator = new MockNavigator();
    }
    return this.__navigator;
  }
  set navigator(nav) {
    this.__navigator = nav;
  }
  get parent() {
    return null;
  }
  prompt() {
    return '';
  }
  open() {
    return null;
  }
  get origin() {
    return this.location.origin;
  }
  removeEventListener(type, handler) {
    removeEventListener(this, type, handler);
  }
  requestAnimationFrame(callback) {
    return this.setTimeout(() => {
      callback(Date.now());
    }, 0);
  }
  requestIdleCallback(callback) {
    return this.setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => 0,
      });
    }, 0);
  }
  scroll(_x, _y) {
    /**/
  }
  scrollBy(_x, _y) {
    /**/
  }
  scrollTo(_x, _y) {
    /**/
  }
  get self() {
    return this;
  }
  get sessionStorage() {
    if (this.__sessionStorage == null) {
      this.__sessionStorage = new MockStorage();
    }
    return this.__sessionStorage;
  }
  set sessionStorage(locStorage) {
    this.__sessionStorage = locStorage;
  }
  setInterval(callback, ms, ...args) {
    if (this.__timeouts == null) {
      this.__timeouts = new Set();
    }
    ms = Math.min(ms, this.__maxTimeout);
    if (this.__allowInterval) {
      const intervalId = this.__setInterval(() => {
        this.__timeouts.delete(intervalId);
        try {
          callback(...args);
        }
        catch (e) {
          if (this.console) {
            this.console.error(e);
          }
          else {
            console.error(e);
          }
        }
      }, ms);
      this.__timeouts.add(intervalId);
      return intervalId;
    }
    const timeoutId = this.__setTimeout(() => {
      this.__timeouts.delete(timeoutId);
      try {
        callback(...args);
      }
      catch (e) {
        if (this.console) {
          this.console.error(e);
        }
        else {
          console.error(e);
        }
      }
    }, ms);
    this.__timeouts.add(timeoutId);
    return timeoutId;
  }
  setTimeout(callback, ms, ...args) {
    if (this.__timeouts == null) {
      this.__timeouts = new Set();
    }
    ms = Math.min(ms, this.__maxTimeout);
    const timeoutId = this.__setTimeout(() => {
      this.__timeouts.delete(timeoutId);
      try {
        callback(...args);
      }
      catch (e) {
        if (this.console) {
          this.console.error(e);
        }
        else {
          console.error(e);
        }
      }
    }, ms);
    this.__timeouts.add(timeoutId);
    return timeoutId;
  }
  get top() {
    return this;
  }
  get window() {
    return this;
  }
  onanimationstart() {
    /**/
  }
  onanimationend() {
    /**/
  }
  onanimationiteration() {
    /**/
  }
  onabort() {
    /**/
  }
  onauxclick() {
    /**/
  }
  onbeforecopy() {
    /**/
  }
  onbeforecut() {
    /**/
  }
  onbeforepaste() {
    /**/
  }
  onblur() {
    /**/
  }
  oncancel() {
    /**/
  }
  oncanplay() {
    /**/
  }
  oncanplaythrough() {
    /**/
  }
  onchange() {
    /**/
  }
  onclick() {
    /**/
  }
  onclose() {
    /**/
  }
  oncontextmenu() {
    /**/
  }
  oncopy() {
    /**/
  }
  oncuechange() {
    /**/
  }
  oncut() {
    /**/
  }
  ondblclick() {
    /**/
  }
  ondrag() {
    /**/
  }
  ondragend() {
    /**/
  }
  ondragenter() {
    /**/
  }
  ondragleave() {
    /**/
  }
  ondragover() {
    /**/
  }
  ondragstart() {
    /**/
  }
  ondrop() {
    /**/
  }
  ondurationchange() {
    /**/
  }
  onemptied() {
    /**/
  }
  onended() {
    /**/
  }
  onerror() {
    /**/
  }
  onfocus() {
    /**/
  }
  onfocusin() {
    /**/
  }
  onfocusout() {
    /**/
  }
  onformdata() {
    /**/
  }
  onfullscreenchange() {
    /**/
  }
  onfullscreenerror() {
    /**/
  }
  ongotpointercapture() {
    /**/
  }
  oninput() {
    /**/
  }
  oninvalid() {
    /**/
  }
  onkeydown() {
    /**/
  }
  onkeypress() {
    /**/
  }
  onkeyup() {
    /**/
  }
  onload() {
    /**/
  }
  onloadeddata() {
    /**/
  }
  onloadedmetadata() {
    /**/
  }
  onloadstart() {
    /**/
  }
  onlostpointercapture() {
    /**/
  }
  onmousedown() {
    /**/
  }
  onmouseenter() {
    /**/
  }
  onmouseleave() {
    /**/
  }
  onmousemove() {
    /**/
  }
  onmouseout() {
    /**/
  }
  onmouseover() {
    /**/
  }
  onmouseup() {
    /**/
  }
  onmousewheel() {
    /**/
  }
  onpaste() {
    /**/
  }
  onpause() {
    /**/
  }
  onplay() {
    /**/
  }
  onplaying() {
    /**/
  }
  onpointercancel() {
    /**/
  }
  onpointerdown() {
    /**/
  }
  onpointerenter() {
    /**/
  }
  onpointerleave() {
    /**/
  }
  onpointermove() {
    /**/
  }
  onpointerout() {
    /**/
  }
  onpointerover() {
    /**/
  }
  onpointerup() {
    /**/
  }
  onprogress() {
    /**/
  }
  onratechange() {
    /**/
  }
  onreset() {
    /**/
  }
  onresize() {
    /**/
  }
  onscroll() {
    /**/
  }
  onsearch() {
    /**/
  }
  onseeked() {
    /**/
  }
  onseeking() {
    /**/
  }
  onselect() {
    /**/
  }
  onselectstart() {
    /**/
  }
  onstalled() {
    /**/
  }
  onsubmit() {
    /**/
  }
  onsuspend() {
    /**/
  }
  ontimeupdate() {
    /**/
  }
  ontoggle() {
    /**/
  }
  onvolumechange() {
    /**/
  }
  onwaiting() {
    /**/
  }
  onwebkitfullscreenchange() {
    /**/
  }
  onwebkitfullscreenerror() {
    /**/
  }
  onwheel() {
    /**/
  }
}
addGlobalsToWindowPrototype(MockWindow.prototype);
function resetWindowDefaults(win) {
  win.__clearInterval = nativeClearInterval;
  win.__clearTimeout = nativeClearTimeout;
  win.__setInterval = nativeSetInterval;
  win.__setTimeout = nativeSetTimeout;
  win.__maxTimeout = 30000;
  win.__allowInterval = true;
  win.URL = nativeURL;
}
function cloneWindow(srcWin, opts = {}) {
  if (srcWin == null) {
    return null;
  }
  const clonedWin = new MockWindow(false);
  if (!opts.customElementProxy) {
    srcWin.customElements = null;
  }
  if (srcWin.document != null) {
    const clonedDoc = new MockDocument(false, clonedWin);
    clonedWin.document = clonedDoc;
    clonedDoc.documentElement = srcWin.document.documentElement.cloneNode(true);
  }
  else {
    clonedWin.document = new MockDocument(null, clonedWin);
  }
  return clonedWin;
}
function cloneDocument(srcDoc) {
  if (srcDoc == null) {
    return null;
  }
  const dstWin = cloneWindow(srcDoc.defaultView);
  return dstWin.document;
}
/**
 * Constrain setTimeout() to 1ms, but still async. Also
 * only allow setInterval() to fire once, also constrained to 1ms.
 */
function constrainTimeouts(win) {
  win.__allowInterval = false;
  win.__maxTimeout = 0;
}
function resetWindow(win) {
  if (win != null) {
    if (win.__timeouts) {
      win.__timeouts.forEach(timeoutId => {
        nativeClearInterval(timeoutId);
        nativeClearTimeout(timeoutId);
      });
      win.__timeouts.clear();
    }
    if (win.customElements && win.customElements.clear) {
      win.customElements.clear();
    }
    resetDocument(win.document);
    resetPerformance(win.performance);
    for (const key in win) {
      if (win.hasOwnProperty(key) && key !== 'document' && key !== 'performance' && key !== 'customElements') {
        delete win[key];
      }
    }
    resetWindowDefaults(win);
    resetWindowDimensions(win);
    resetEventListeners(win);
    if (win.document != null) {
      try {
        win.document.defaultView = win;
      }
      catch (e) { }
    }
  }
}
function resetWindowDimensions(win) {
  try {
    win.devicePixelRatio = 1;
    win.innerHeight = 768;
    win.innerWidth = 1366;
    win.pageXOffset = 0;
    win.pageYOffset = 0;
    win.screenLeft = 0;
    win.screenTop = 0;
    win.screenX = 0;
    win.screenY = 0;
    win.scrollX = 0;
    win.scrollY = 0;
    win.screen = {
      availHeight: win.innerHeight,
      availLeft: 0,
      availTop: 0,
      availWidth: win.innerWidth,
      colorDepth: 24,
      height: win.innerHeight,
      keepAwake: false,
      orientation: {
        angle: 0,
        type: 'portrait-primary',
      },
      pixelDepth: 24,
      width: win.innerWidth,
    };
  }
  catch (e) { }
}

class MockDocument extends MockHTMLElement {
  constructor(html = null, win = null) {
    super(null, null);
    this.nodeName = "#document" /* DOCUMENT_NODE */;
    this.nodeType = 9 /* DOCUMENT_NODE */;
    this.defaultView = win;
    this.cookie = '';
    this.referrer = '';
    this.appendChild(this.createDocumentTypeNode());
    if (typeof html === 'string') {
      const parsedDoc = parseDocumentUtil(this, html);
      const documentElement = parsedDoc.children.find(elm => elm.nodeName === 'HTML');
      if (documentElement != null) {
        this.appendChild(documentElement);
        setOwnerDocument(documentElement, this);
      }
    }
    else if (html !== false) {
      const documentElement = new MockHTMLElement(this, 'html');
      this.appendChild(documentElement);
      documentElement.appendChild(new MockHTMLElement(this, 'head'));
      documentElement.appendChild(new MockHTMLElement(this, 'body'));
    }
  }
  get location() {
    if (this.defaultView != null) {
      return this.defaultView.location;
    }
    return null;
  }
  set location(val) {
    if (this.defaultView != null) {
      this.defaultView.location = val;
    }
  }
  get baseURI() {
    const baseNode = this.head.childNodes.find(node => node.nodeName === 'BASE');
    if (baseNode) {
      return baseNode.href;
    }
    return this.URL;
  }
  get URL() {
    return this.location.href;
  }
  get styleSheets() {
    return this.querySelectorAll('style');
  }
  get scripts() {
    return this.querySelectorAll('script');
  }
  get forms() {
    return this.querySelectorAll('form');
  }
  get images() {
    return this.querySelectorAll('img');
  }
  get scrollingElement() {
    return this.documentElement;
  }
  get documentElement() {
    for (let i = this.childNodes.length - 1; i >= 0; i--) {
      if (this.childNodes[i].nodeName === 'HTML') {
        return this.childNodes[i];
      }
    }
    const documentElement = new MockHTMLElement(this, 'html');
    this.appendChild(documentElement);
    return documentElement;
  }
  set documentElement(documentElement) {
    for (let i = this.childNodes.length - 1; i >= 0; i--) {
      if (this.childNodes[i].nodeType !== 10 /* DOCUMENT_TYPE_NODE */) {
        this.childNodes[i].remove();
      }
    }
    if (documentElement != null) {
      this.appendChild(documentElement);
      setOwnerDocument(documentElement, this);
    }
  }
  get head() {
    const documentElement = this.documentElement;
    for (let i = 0; i < documentElement.childNodes.length; i++) {
      if (documentElement.childNodes[i].nodeName === 'HEAD') {
        return documentElement.childNodes[i];
      }
    }
    const head = new MockHTMLElement(this, 'head');
    documentElement.insertBefore(head, documentElement.firstChild);
    return head;
  }
  set head(head) {
    const documentElement = this.documentElement;
    for (let i = documentElement.childNodes.length - 1; i >= 0; i--) {
      if (documentElement.childNodes[i].nodeName === 'HEAD') {
        documentElement.childNodes[i].remove();
      }
    }
    if (head != null) {
      documentElement.insertBefore(head, documentElement.firstChild);
      setOwnerDocument(head, this);
    }
  }
  get body() {
    const documentElement = this.documentElement;
    for (let i = documentElement.childNodes.length - 1; i >= 0; i--) {
      if (documentElement.childNodes[i].nodeName === 'BODY') {
        return documentElement.childNodes[i];
      }
    }
    const body = new MockHTMLElement(this, 'body');
    documentElement.appendChild(body);
    return body;
  }
  set body(body) {
    const documentElement = this.documentElement;
    for (let i = documentElement.childNodes.length - 1; i >= 0; i--) {
      if (documentElement.childNodes[i].nodeName === 'BODY') {
        documentElement.childNodes[i].remove();
      }
    }
    if (body != null) {
      documentElement.appendChild(body);
      setOwnerDocument(body, this);
    }
  }
  appendChild(newNode) {
    newNode.remove();
    newNode.parentNode = this;
    this.childNodes.push(newNode);
    return newNode;
  }
  createComment(data) {
    return new MockComment(this, data);
  }
  createAttribute(attrName) {
    return new MockAttr(attrName.toLowerCase(), '');
  }
  createAttributeNS(namespaceURI, attrName) {
    return new MockAttr(attrName, '', namespaceURI);
  }
  createElement(tagName) {
    if (tagName === "#document" /* DOCUMENT_NODE */) {
      const doc = new MockDocument(false);
      doc.nodeName = tagName;
      doc.parentNode = null;
      return doc;
    }
    return createElement(this, tagName);
  }
  createElementNS(namespaceURI, tagName) {
    const elmNs = createElementNS(this, namespaceURI, tagName);
    elmNs.namespaceURI = namespaceURI;
    return elmNs;
  }
  createTextNode(text) {
    return new MockTextNode(this, text);
  }
  createDocumentFragment() {
    return new MockDocumentFragment(this);
  }
  createDocumentTypeNode() {
    return new MockDocumentTypeNode(this);
  }
  getElementById(id) {
    return getElementById(this, id);
  }
  getElementsByName(elmName) {
    return getElementsByName(this, elmName.toLowerCase());
  }
  get title() {
    const title = this.head.childNodes.find(elm => elm.nodeName === 'TITLE');
    if (title != null) {
      return title.textContent;
    }
    return '';
  }
  set title(value) {
    const head = this.head;
    let title = head.childNodes.find(elm => elm.nodeName === 'TITLE');
    if (title == null) {
      title = this.createElement('title');
      head.appendChild(title);
    }
    title.textContent = value;
  }
}
function createDocument(html = null) {
  return new MockWindow(html).document;
}
function createFragment(html) {
  return parseHtmlToFragment(html, null);
}
function resetDocument(doc) {
  if (doc != null) {
    resetEventListeners(doc);
    const documentElement = doc.documentElement;
    if (documentElement != null) {
      resetElement(documentElement);
      for (let i = 0, ii = documentElement.childNodes.length; i < ii; i++) {
        const childNode = documentElement.childNodes[i];
        resetElement(childNode);
        childNode.childNodes.length = 0;
      }
    }
    for (const key in doc) {
      if (doc.hasOwnProperty(key) && !DOC_KEY_KEEPERS.has(key)) {
        delete doc[key];
      }
    }
    try {
      doc.nodeName = "#document" /* DOCUMENT_NODE */;
    }
    catch (e) { }
    try {
      doc.nodeType = 9 /* DOCUMENT_NODE */;
    }
    catch (e) { }
    try {
      doc.cookie = '';
    }
    catch (e) { }
    try {
      doc.referrer = '';
    }
    catch (e) { }
  }
}
const DOC_KEY_KEEPERS = new Set(['nodeName', 'nodeType', 'nodeValue', 'ownerDocument', 'parentNode', 'childNodes', '_shadowRoot']);
function getElementById(elm, id) {
  const children = elm.children;
  for (let i = 0, ii = children.length; i < ii; i++) {
    const childElm = children[i];
    if (childElm.id === id) {
      return childElm;
    }
    const childElmFound = getElementById(childElm, id);
    if (childElmFound != null) {
      return childElmFound;
    }
  }
  return null;
}
function getElementsByName(elm, elmName, foundElms = []) {
  const children = elm.children;
  for (let i = 0, ii = children.length; i < ii; i++) {
    const childElm = children[i];
    if (childElm.name && childElm.name.toLowerCase() === elmName) {
      foundElms.push(childElm);
    }
    getElementsByName(childElm, elmName, foundElms);
  }
  return foundElms;
}
function setOwnerDocument(elm, ownerDocument) {
  for (let i = 0, ii = elm.childNodes.length; i < ii; i++) {
    elm.childNodes[i].ownerDocument = ownerDocument;
    if (elm.childNodes[i].nodeType === 1 /* ELEMENT_NODE */) {
      setOwnerDocument(elm.childNodes[i], ownerDocument);
    }
  }
}

function hydrateFactory($stencilWindow, $stencilHydrateOpts, $stencilHydrateResults, $stencilAfterHydrate, $stencilHydrateResolve) {
  var globalThis = $stencilWindow;
  var self = $stencilWindow;
  var top = $stencilWindow;
  var parent = $stencilWindow;

  var addEventListener = $stencilWindow.addEventListener.bind($stencilWindow);
  var alert = $stencilWindow.alert.bind($stencilWindow);
  var blur = $stencilWindow.blur.bind($stencilWindow);
  var cancelAnimationFrame = $stencilWindow.cancelAnimationFrame.bind($stencilWindow);
  var cancelIdleCallback = $stencilWindow.cancelIdleCallback.bind($stencilWindow);
  var clearInterval = $stencilWindow.clearInterval.bind($stencilWindow);
  var clearTimeout = $stencilWindow.clearTimeout.bind($stencilWindow);
  var close = () => {};
  var confirm = $stencilWindow.confirm.bind($stencilWindow);
  var dispatchEvent = $stencilWindow.dispatchEvent.bind($stencilWindow);
  var focus = $stencilWindow.focus.bind($stencilWindow);
  var getComputedStyle = $stencilWindow.getComputedStyle.bind($stencilWindow);
  var matchMedia = $stencilWindow.matchMedia.bind($stencilWindow);
  var open = $stencilWindow.open.bind($stencilWindow);
  var prompt = $stencilWindow.prompt.bind($stencilWindow);
  var removeEventListener = $stencilWindow.removeEventListener.bind($stencilWindow);
  var requestAnimationFrame = $stencilWindow.requestAnimationFrame.bind($stencilWindow);
  var requestIdleCallback = $stencilWindow.requestIdleCallback.bind($stencilWindow);
  var setInterval = $stencilWindow.setInterval.bind($stencilWindow);
  var setTimeout = $stencilWindow.setTimeout.bind($stencilWindow);

  var CharacterData = $stencilWindow.CharacterData;
  var CSS = $stencilWindow.CSS;
  var CustomEvent = $stencilWindow.CustomEvent;
  var Document = $stencilWindow.Document;
  var DocumentFragment = $stencilWindow.DocumentFragment;
  var DocumentType = $stencilWindow.DocumentType;
  var DOMTokenList = $stencilWindow.DOMTokenList;
  var Element = $stencilWindow.Element;
  var Event = $stencilWindow.Event;
  var HTMLElement = $stencilWindow.HTMLElement;
  var IntersectionObserver = $stencilWindow.IntersectionObserver;
  var KeyboardEvent = $stencilWindow.KeyboardEvent;
  var MouseEvent = $stencilWindow.MouseEvent;
  var Node = $stencilWindow.Node;
  var NodeList = $stencilWindow.NodeList;
  var URL = $stencilWindow.URL;

  var console = $stencilWindow.console;
  var customElements = $stencilWindow.customElements;
  var history = $stencilWindow.history;
  var localStorage = $stencilWindow.localStorage;
  var location = $stencilWindow.location;
  var navigator = $stencilWindow.navigator;
  var performance = $stencilWindow.performance;
  var sessionStorage = $stencilWindow.sessionStorage;

  var devicePixelRatio = $stencilWindow.devicePixelRatio;
  var innerHeight = $stencilWindow.innerHeight;
  var innerWidth = $stencilWindow.innerWidth;
  var origin = $stencilWindow.origin;
  var pageXOffset = $stencilWindow.pageXOffset;
  var pageYOffset = $stencilWindow.pageYOffset;
  var screen = $stencilWindow.screen;
  var screenLeft = $stencilWindow.screenLeft;
  var screenTop = $stencilWindow.screenTop;
  var screenX = $stencilWindow.screenX;
  var screenY = $stencilWindow.screenY;
  var scrollX = $stencilWindow.scrollX;
  var scrollY = $stencilWindow.scrollY;
  var exports = {};

  function hydrateAppClosure($stencilWindow) {
  const window = $stencilWindow;
  const document = $stencilWindow.document;
  /*hydrateAppClosure start*/


const NAMESPACE = 'tokenizer-common';
const BUILD = /* tokenizer-common */ { allRenderFn: true, appendChildSlotFix: false, asyncLoading: true, attachStyles: true, cloneNodeFix: false, cmpDidLoad: false, cmpDidRender: false, cmpDidUnload: false, cmpDidUpdate: false, cmpShouldUpdate: false, cmpWillLoad: false, cmpWillRender: false, cmpWillUpdate: false, connectedCallback: true, constructableCSS: false, cssAnnotations: true, cssVarShim: false, devTools: false, disconnectedCallback: true, dynamicImportShim: false, element: false, event: true, hasRenderFn: true, hostListener: true, hostListenerTarget: false, hostListenerTargetBody: false, hostListenerTargetDocument: false, hostListenerTargetParent: false, hostListenerTargetWindow: false, hotModuleReplacement: false, hydrateClientSide: true, hydrateServerSide: true, hydratedAttribute: false, hydratedClass: true, isDebug: false, isDev: false, isTesting: false, lazyLoad: true, lifecycle: false, lifecycleDOMEvents: false, member: true, method: true, mode: false, observeAttribute: true, profile: false, prop: true, propBoolean: true, propMutable: false, propNumber: false, propString: true, reflect: false, safari10: false, scoped: false, scriptDataOpts: false, shadowDelegatesFocus: false, shadowDom: true, shadowDomShim: true, slot: true, slotChildNodesFix: false, slotRelocation: true, state: true, style: true, svg: false, taskQueue: true, updatable: true, vdomAttribute: true, vdomClass: true, vdomFunctional: false, vdomKey: false, vdomListener: true, vdomPropOrAttr: true, vdomRef: false, vdomRender: true, vdomStyle: false, vdomText: true, vdomXlink: false, watchCallback: false };

function componentOnReady() {
 return getHostRef(this).$onReadyPromise$;
}

function forceUpdate$1() {}

function hydrateApp(e, t, o, n, s) {
 function l() {
  global.clearTimeout(p), i.clear(), r.clear();
  try {
   t.clientHydrateAnnotations && insertVdomAnnotations(e.document, t.staticComponents), 
   e.document.createElement = c, e.document.createElementNS = $;
  } catch (e) {
   renderCatchError(t, o, e);
  }
  n(e, t, o, s);
 }
 function a(e) {
  renderCatchError(t, o, e), l();
 }
 const r = new Set, i = new Set, d = new Set, c = e.document.createElement, $ = e.document.createElementNS, m = Promise.resolve();
 let p;
 try {
  function u() {
   return f(this);
  }
  function h(e) {
   if (isValidComponent(e, t) && !getHostRef(e)) {
    const t = loadModule({
     $tagName$: e.nodeName.toLowerCase(),
     $flags$: null
    });
    null != t && null != t.cmpMeta && (i.add(e), e.connectedCallback = u, registerHost(e, t.cmpMeta), 
    function o(e, t) {
     if ("function" != typeof e.componentOnReady && (e.componentOnReady = componentOnReady), 
     "function" != typeof e.forceUpdate && (e.forceUpdate = forceUpdate$1), 1 & t.$flags$ && (e.shadowRoot = e), 
     null != t.$members$) {
      const o = getHostRef(e);
      Object.entries(t.$members$).forEach(([n, s]) => {
       const l = s[0];
       if (31 & l) {
        const a = s[1] || n, r = e.getAttribute(a);
        if (null != r) {
         const e = parsePropertyValue(r, l);
         o.$instanceValues$.set(n, e);
        }
        const i = e[n];
        void 0 !== i && (o.$instanceValues$.set(n, i), delete e[n]), Object.defineProperty(e, n, {
         get() {
          return getValue(this, n);
         },
         set(e) {
          setValue(this, n, e, t);
         },
         configurable: !0,
         enumerable: !0
        });
       } else 64 & l && Object.defineProperty(e, n, {
        value() {
         const e = getHostRef(this), t = arguments;
         return e.$onInstancePromise$.then(() => e.$lazyInstance$[n].apply(e.$lazyInstance$, t)).catch(consoleError);
        }
       });
      });
     }
    }(e, t.cmpMeta));
   }
  }
  function f(n) {
   return i.delete(n), isValidComponent(n, t) && o.hydratedCount < t.maxHydrateCount && !r.has(n) && function e(t) {
    if (9 === t.nodeType) return !0;
    if (NO_HYDRATE_TAGS.has(t.nodeName)) return !1;
    if (t.hasAttribute("no-prerender")) return !1;
    const o = t.parentNode;
    return null == o || e(o);
   }(n) ? (r.add(n), async function s(e, t, o, n, l) {
    o = o.toLowerCase();
    const a = loadModule({
     $tagName$: o,
     $flags$: null
    });
    if (null != a && null != a.cmpMeta) {
     l.add(n);
     try {
      connectedCallback(n), await n.componentOnReady(), t.hydratedCount++;
      const e = getHostRef(n), s = e.$modeName$ ? e.$modeName$ : "$";
      t.components.some(e => e.tag === o && e.mode === s) || t.components.push({
       tag: o,
       mode: s,
       count: 0,
       depth: -1
      });
     } catch (t) {
      e.console.error(t);
     }
     l.delete(n);
    }
   }(e, o, n.nodeName, n, d)) : m;
  }
  e.document.createElement = function t(o) {
   const n = c.call(e.document, o);
   return h(n), n;
  }, e.document.createElementNS = function t(o, n) {
   const s = $.call(e.document, o, n);
   return h(s), s;
  }, p = global.setTimeout((function g() {
   a("Hydrate exceeded timeout" + function e(t) {
    return Array.from(t).map(waitingOnElementMsg);
   }(d));
  }), t.timeout), plt.$resourcesUrl$ = new URL(t.resourcesUrl || "./", doc.baseURI).href, 
  function e(t) {
   if (null != t && 1 === t.nodeType) {
    h(t);
    const o = t.children;
    for (let t = 0, n = o.length; t < n; t++) e(o[t]);
   }
  }(e.document.body), function e() {
   const t = Array.from(i).filter(e => e.parentElement);
   return t.length > 0 ? Promise.all(t.map(f)).then(e) : m;
  }().then(l).catch(a);
 } catch (e) {
  a(e);
 }
}

function isValidComponent(e, t) {
 if (null != e && 1 === e.nodeType) {
  const o = e.nodeName;
  if ("string" == typeof o && o.includes("-")) return !t.excludeComponents.includes(o.toLowerCase());
 }
 return !1;
}

function renderCatchError(e, t, o) {
 const n = {
  level: "error",
  type: "build",
  header: "Hydrate Error",
  messageText: "",
  relFilePath: null,
  absFilePath: null,
  lines: []
 };
 if (e.url) try {
  const t = new URL(e.url);
  "/" !== t.pathname && (n.header += ": " + t.pathname);
 } catch (e) {}
 null != o && (null != o.stack ? n.messageText = o.stack.toString() : null != o.message ? n.messageText = o.message.toString() : n.messageText = o.toString()), 
 t.diagnostics.push(n);
}

function printTag(e) {
 let t = "<" + e.nodeName.toLowerCase();
 if (Array.isArray(e.attributes)) for (let o = 0; o < e.attributes.length; o++) {
  const n = e.attributes[o];
  t += " " + n.name, "" !== n.value && (t += `="${n.value}"`);
 }
 return t += ">", t;
}

function waitingOnElementMsg(e) {
 let t = "";
 if (e) {
  const o = [];
  t = " - waiting on:";
  let n = e;
  for (;n && 9 !== n.nodeType && "BODY" !== n.nodeName; ) o.unshift(printTag(n)), 
  n = n.parentElement;
  let s = "";
  for (const e of o) s += "  ", t += `\n${s}${e}`;
 }
 return t;
}

const addHostEventListeners = (e, t, o, n) => {
  o && (o.map(([o, n, s]) => {
  const l =  e, a = hostListenerProxy(t, s), r = hostListenerOpts(o);
  plt.ael(l, n, a, r), (t.$rmListeners$ = t.$rmListeners$ || []).push(() => plt.rel(l, n, a, r));
 }));
}, hostListenerProxy = (e, t) => o => {
  256 & e.$flags$ ? e.$lazyInstance$[t](o) : (e.$queuedListeners$ = e.$queuedListeners$ || []).push([ t, o ]) ;
}, hostListenerOpts = e => 0 != (2 & e);

const createTime = (e, t = "") => {
 return () => {};
}, rootAppliedStyles = new WeakMap, registerStyle = (e, t, o) => {
 let n = styles.get(e);
 n = t, styles.set(e, n);
}, addStyle = (e, t, o, n) => {
 let s = getScopeId(t), l = styles.get(s);
 if (e = 11 === e.nodeType ? e : doc, l) if ("string" == typeof l) {
  e = e.head || e;
  let o, a = rootAppliedStyles.get(e);
  if (a || rootAppliedStyles.set(e, a = new Set), !a.has(s)) {
   if ( e.host && (o = e.querySelector(`[sty-id="${s}"]`))) o.innerHTML = l; else {
    o = doc.createElement("style"), o.innerHTML = l;
     o.setAttribute("sty-id", s), 
    e.insertBefore(o, e.querySelector("link"));
   }
   a && a.add(s);
  }
 }
 return s;
}, attachStyles = e => {
 const t = e.$cmpMeta$, o = e.$hostElement$, n = t.$flags$, s = createTime("attachStyles", t.$tagName$), l = addStyle( o.getRootNode(), t);
  10 & n && (o["s-sc"] = l, 
 o.classList.add(l + "-h"), BUILD.scoped  ), 
 s();
}, getScopeId = (e, t) => "sc-" + ( e.$tagName$), EMPTY_OBJ = {}, isComplexType = e => "object" == (e = typeof e) || "function" === e, IS_DENO_ENV = "undefined" != typeof Deno, IS_NODE_ENV = !(IS_DENO_ENV || "undefined" == typeof global || "function" != typeof require || !global.process || "string" != typeof __filename || global.origin && "string" == typeof global.origin), h = (IS_DENO_ENV && Deno.build.os, IS_NODE_ENV ? process.cwd : IS_DENO_ENV && Deno.cwd, 
IS_NODE_ENV ? process.exit : IS_DENO_ENV && Deno.exit, (e, t, ...o) => {
 let n = null, l = null, a = !1, r = !1, i = [];
 const d = t => {
  for (let o = 0; o < t.length; o++) n = t[o], Array.isArray(n) ? d(n) : null != n && "boolean" != typeof n && ((a = "function" != typeof e && !isComplexType(n)) ? n = String(n) : BUILD.isDev  , 
  a && r ? i[i.length - 1].$text$ += n : i.push(a ? newVNode(null, n) : n), r = a);
 };
 if (d(o), t && ( t.name && (l = t.name), BUILD.vdomClass)) {
  const e = t.className || t.class;
  e && (t.class = "object" != typeof e ? e : Object.keys(e).filter(t => e[t]).join(" "));
 }
 const c = newVNode(e, null);
 return c.$attrs$ = t, i.length > 0 && (c.$children$ = i),  (c.$name$ = l), c;
}), newVNode = (e, t) => {
 const o = {
  $flags$: 0,
  $tag$: e,
  $text$: t,
  $elm$: null,
  $children$: null
 };
 return  (o.$attrs$ = null),  (o.$name$ = null), o;
}, Host = {}, isHost = e => e && e.$tag$ === Host, setAccessor = (e, t, o, n, s, l) => {
 if (o !== n) {
  let a = isMemberInElement(e, t), r = t.toLowerCase();
  if ( "class" === t) {
   const t = e.classList, s = parseClassList(o), l = parseClassList(n);
   t.remove(...s.filter(e => e && !l.includes(e))), t.add(...l.filter(e => e && !s.includes(e)));
  } else if ( ( a ) || "o" !== t[0] || "n" !== t[1]) {
   {
    const i = isComplexType(n);
    if ((a || i && null !== n) && !s) try {
     if (e.tagName.includes("-")) e[t] = n; else {
      let s = null == n ? "" : n;
      "list" === t ? a = !1 : null != o && e[t] == s || (e[t] = s);
     }
    } catch (e) {}
    null == n || !1 === n ? !1 === n && "" !== e.getAttribute(t) || ( e.removeAttribute(t)) : (!a || 4 & l || s) && !i && (n = !0 === n ? "" : n, 
     e.setAttribute(t, n));
   }
  } else t = "-" === t[2] ? t.slice(3) : isMemberInElement(win, r) ? r.slice(2) : r[2] + t.slice(3), 
  o && plt.rel(e, t, o, !1), n && plt.ael(e, t, n, !1);
 }
}, parseClassListRegex = /\s/, parseClassList = e => e ? e.split(parseClassListRegex) : [], updateElement = (e, t, o, n) => {
 const s = 11 === t.$elm$.nodeType && t.$elm$.host ? t.$elm$.host : t.$elm$, l = e && e.$attrs$ || EMPTY_OBJ, a = t.$attrs$ || EMPTY_OBJ;
 for (n in l) n in a || setAccessor(s, n, l[n], void 0, o, t.$flags$);
 for (n in a) setAccessor(s, n, l[n], a[n], o, t.$flags$);
};

let scopeId, contentRef, hostTagName, useNativeShadowDom = !1, checkSlotFallbackVisibility = !1, checkSlotRelocate = !1, isSvgMode = !1;

const createElm = (e, t, o, n) => {
 let s, l, a, r = t.$children$[o], i = 0;
 if ( !useNativeShadowDom && (checkSlotRelocate = !0, "slot" === r.$tag$ && (scopeId && n.classList.add(scopeId + "-s"), 
 r.$flags$ |= r.$children$ ? 2 : 1)),  null !== r.$text$) s = r.$elm$ = doc.createTextNode(r.$text$); else if ( 1 & r.$flags$) s = r.$elm$ =  slotReferenceDebugNode(r) ; else {
  if (s = r.$elm$ =  doc.createElement( 2 & r.$flags$ ? "slot-fb" : r.$tag$), 
   updateElement(null, r, isSvgMode), 
   null != scopeId && s["s-si"] !== scopeId && s.classList.add(s["s-si"] = scopeId), 
  r.$children$) for (i = 0; i < r.$children$.length; ++i) l = createElm(e, r, i, s), 
  l && s.appendChild(l);
 }
 return  (s["s-hn"] = hostTagName, 3 & r.$flags$ && (s["s-sr"] = !0, 
 s["s-cr"] = contentRef, s["s-sn"] = r.$name$ || "", a = e && e.$children$ && e.$children$[o], 
 a && a.$tag$ === r.$tag$ && e.$elm$ && putBackInOriginalLocation(e.$elm$, !1))), 
 s;
}, putBackInOriginalLocation = (e, t) => {
 plt.$flags$ |= 1;
 const o = e.childNodes;
 for (let e = o.length - 1; e >= 0; e--) {
  const n = o[e];
  n["s-hn"] !== hostTagName && n["s-ol"] && (parentReferenceNode(n).insertBefore(n, referenceNode(n)), 
  n["s-ol"].remove(), n["s-ol"] = void 0, checkSlotRelocate = !0), t && putBackInOriginalLocation(n, t);
 }
 plt.$flags$ &= -2;
}, addVnodes = (e, t, o, n, s, l) => {
 let a, r =  e["s-cr"] && e["s-cr"].parentNode || e;
 for ( r.shadowRoot && r.tagName === hostTagName && (r = r.shadowRoot); s <= l; ++s) n[s] && (a = createElm(null, o, s, e), 
 a && (n[s].$elm$ = a, r.insertBefore(a,  referenceNode(t) )));
}, removeVnodes = (e, t, o, n, s) => {
 for (;t <= o; ++t) (n = e[t]) && (s = n.$elm$,  (checkSlotFallbackVisibility = !0, 
 s["s-ol"] ? s["s-ol"].remove() : putBackInOriginalLocation(s, !0)), s.remove());
}, isSameVnode = (e, t) => e.$tag$ === t.$tag$ && ( "slot" === e.$tag$ ? e.$name$ === t.$name$ : !BUILD.vdomKey ), referenceNode = e => e && e["s-ol"] || e, parentReferenceNode = e => (e["s-ol"] ? e["s-ol"] : e).parentNode, patch = (e, t) => {
 const o = t.$elm$ = e.$elm$, n = e.$children$, s = t.$children$, l = t.$tag$, a = t.$text$;
 let r;
  null !== a ?  (r = o["s-cr"]) ? r.parentNode.textContent = a :  e.$text$ !== a && (o.data = a) : ( ( "slot" === l || updateElement(e, t, isSvgMode)), 
  null !== n && null !== s ? ((e, t, o, n) => {
  let s, a = 0, r = 0, c = t.length - 1, $ = t[0], m = t[c], p = n.length - 1, u = n[0], h = n[p];
  for (;a <= c && r <= p; ) if (null == $) $ = t[++a]; else if (null == m) m = t[--c]; else if (null == u) u = n[++r]; else if (null == h) h = n[--p]; else if (isSameVnode($, u)) patch($, u), 
  $ = t[++a], u = n[++r]; else if (isSameVnode(m, h)) patch(m, h), m = t[--c], h = n[--p]; else if (isSameVnode($, h))  "slot" !== $.$tag$ && "slot" !== h.$tag$ || putBackInOriginalLocation($.$elm$.parentNode, !1), 
  patch($, h), e.insertBefore($.$elm$, m.$elm$.nextSibling), $ = t[++a], h = n[--p]; else if (isSameVnode(m, u))  "slot" !== $.$tag$ && "slot" !== h.$tag$ || putBackInOriginalLocation(m.$elm$.parentNode, !1), 
  patch(m, u), e.insertBefore(m.$elm$, $.$elm$), m = t[--c], u = n[++r]; else {
    (s = createElm(t && t[r], o, r, e), u = n[++r]), 
   s && ( parentReferenceNode($.$elm$).insertBefore(s, referenceNode($.$elm$)) );
  }
  a > c ? addVnodes(e, null == n[p + 1] ? null : n[p + 1].$elm$, o, n, r, p) :  r > p && removeVnodes(t, a, c);
 })(o, n, t, s) : null !== s ? ( null !== e.$text$ && (o.textContent = ""), 
 addVnodes(o, null, t, s, 0, s.length - 1)) :  null !== n && removeVnodes(n, 0, n.length - 1), 
 BUILD.svg   );
}, updateFallbackSlotVisibility = e => {
 let t, o, n, s, l, a, r = e.childNodes;
 for (o = 0, n = r.length; o < n; o++) if (t = r[o], 1 === t.nodeType) {
  if (t["s-sr"]) for (l = t["s-sn"], t.hidden = !1, s = 0; s < n; s++) if (r[s]["s-hn"] !== t["s-hn"]) if (a = r[s].nodeType, 
  "" !== l) {
   if (1 === a && l === r[s].getAttribute("slot")) {
    t.hidden = !0;
    break;
   }
  } else if (1 === a || 3 === a && "" !== r[s].textContent.trim()) {
   t.hidden = !0;
   break;
  }
  updateFallbackSlotVisibility(t);
 }
}, relocateNodes = [], relocateSlotContent = e => {
 let t, o, n, s, l, a, r = 0, i = e.childNodes, d = i.length;
 for (;r < d; r++) {
  if (t = i[r], t["s-sr"] && (o = t["s-cr"])) for (n = o.parentNode.childNodes, s = t["s-sn"], 
  a = n.length - 1; a >= 0; a--) o = n[a], o["s-cn"] || o["s-nr"] || o["s-hn"] === t["s-hn"] || (isNodeLocatedInSlot(o, s) ? (l = relocateNodes.find(e => e.$nodeToRelocate$ === o), 
  checkSlotFallbackVisibility = !0, o["s-sn"] = o["s-sn"] || s, l ? l.$slotRefNode$ = t : relocateNodes.push({
   $slotRefNode$: t,
   $nodeToRelocate$: o
  }), o["s-sr"] && relocateNodes.map(e => {
   isNodeLocatedInSlot(e.$nodeToRelocate$, o["s-sn"]) && (l = relocateNodes.find(e => e.$nodeToRelocate$ === o), 
   l && !e.$slotRefNode$ && (e.$slotRefNode$ = l.$slotRefNode$));
  })) : relocateNodes.some(e => e.$nodeToRelocate$ === o) || relocateNodes.push({
   $nodeToRelocate$: o
  }));
  1 === t.nodeType && relocateSlotContent(t);
 }
}, isNodeLocatedInSlot = (e, t) => 1 === e.nodeType ? null === e.getAttribute("slot") && "" === t || e.getAttribute("slot") === t : e["s-sn"] === t || "" === t, renderVdom = (e, t) => {
 const o = e.$hostElement$, s = e.$vnode$ || newVNode(null, null), l = isHost(t) ? t : h(null, null, t);
 if (hostTagName = o.tagName, BUILD.isDev  ) ;
 if (l.$tag$ = null, l.$flags$ |= 4, e.$vnode$ = l, l.$elm$ = s.$elm$ =  o.shadowRoot || o, 
  (scopeId = o["s-sc"]),  (contentRef = o["s-cr"], 
 useNativeShadowDom = supportsShadow, checkSlotFallbackVisibility = !1), patch(s, l), 
 BUILD.slotRelocation) {
  if (plt.$flags$ |= 1, checkSlotRelocate) {
   let e, t, o, n, s, a;
   relocateSlotContent(l.$elm$);
   let r = 0;
   for (;r < relocateNodes.length; r++) e = relocateNodes[r], t = e.$nodeToRelocate$, 
   t["s-ol"] || (o =  originalLocationDebugNode(t) , 
   o["s-nr"] = t, t.parentNode.insertBefore(t["s-ol"] = o, t));
   for (r = 0; r < relocateNodes.length; r++) if (e = relocateNodes[r], t = e.$nodeToRelocate$, 
   e.$slotRefNode$) {
    for (n = e.$slotRefNode$.parentNode, s = e.$slotRefNode$.nextSibling, o = t["s-ol"]; o = o.previousSibling; ) if (a = o["s-nr"], 
    a && a["s-sn"] === t["s-sn"] && n === a.parentNode && (a = a.nextSibling, !a || !a["s-nr"])) {
     s = a;
     break;
    }
    (!s && n !== t.parentNode || t.nextSibling !== s) && t !== s && (!t["s-hn"] && t["s-ol"] && (t["s-hn"] = t["s-ol"].parentNode.nodeName), 
    n.insertBefore(t, s));
   } else 1 === t.nodeType && (t.hidden = !0);
  }
  checkSlotFallbackVisibility && updateFallbackSlotVisibility(l.$elm$), plt.$flags$ &= -2, 
  relocateNodes.length = 0;
 }
}, slotReferenceDebugNode = e => doc.createComment(`<slot${e.$name$ ? ' name="' + e.$name$ + '"' : ""}> (host=${hostTagName.toLowerCase()})`), originalLocationDebugNode = e => doc.createComment("org-location for " + (e.localName ? `<${e.localName}> (host=${e["s-hn"]})` : `[${e.textContent}]`)), getElement = e =>  getHostRef(e).$hostElement$ , createEvent = (e, t, o) => {
 const n = getElement(e);
 return {
  emit: e => (emitEvent(n, t, {
   bubbles: !!(4 & o),
   composed: !!(2 & o),
   cancelable: !!(1 & o),
   detail: e
  }))
 };
}, emitEvent = (e, t, o) => {
 const n = plt.ce(t, o);
 return e.dispatchEvent(n), n;
}, attachToAncestor = (e, t) => {
  t && !e.$onRenderResolve$ && t["s-p"] && t["s-p"].push(new Promise(t => e.$onRenderResolve$ = t));
}, scheduleUpdate = (e, t) => {
 if ( (e.$flags$ |= 16),  4 & e.$flags$) return void (e.$flags$ |= 512);
 attachToAncestor(e, e.$ancestorComponent$);
 const o = () => dispatchHooks(e, t);
 return  writeTask(o) ;
}, dispatchHooks = (e, t) => {
 const n = createTime("scheduleUpdate", e.$cmpMeta$.$tagName$), s =  e.$lazyInstance$ ;
 let l;
 return t ? ( (e.$flags$ |= 256, e.$queuedListeners$ && (e.$queuedListeners$.map(([e, t]) => safeCall(s, e, t)), 
 e.$queuedListeners$ = null)), BUILD.cmpWillLoad ) : (BUILD.cmpWillUpdate ), n(), then(l, () => updateComponent(e, s, t));
}, updateComponent = (e, t, o) => {
 const n = e.$hostElement$, s = createTime("update", e.$cmpMeta$.$tagName$), l = n["s-rc"];
  o && attachStyles(e);
 const a = createTime("render", e.$cmpMeta$.$tagName$);
 if ( ( renderVdom(e, callRender(e, t)) ), 
 BUILD.hydrateServerSide) try {
  serverSideConnected(n), o && (1 & e.$cmpMeta$.$flags$ ? n["s-en"] = "" : 2 & e.$cmpMeta$.$flags$ && (n["s-en"] = "c"));
 } catch (e) {
  consoleError(e);
 }
 if ( l && (l.map(e => e()), n["s-rc"] = void 0), a(), s(), 
 BUILD.asyncLoading) {
  const t = n["s-p"], o = () => postUpdateComponent(e);
  0 === t.length ? o() : (Promise.all(t).then(o), e.$flags$ |= 4, t.length = 0);
 }
};

const callRender = (e, t) => {
 try {
  t =  t.render(),  (e.$flags$ &= -17), 
   (e.$flags$ |= 2);
 } catch (e) {
  consoleError(e);
 }
 return t;
}, postUpdateComponent = e => {
 const t = e.$cmpMeta$.$tagName$, o = e.$hostElement$, n = createTime("postUpdate", t), l = e.$ancestorComponent$;
 64 & e.$flags$ ? (n()) : (e.$flags$ |= 64,  addHydratedFlag(o), 
 n(),  (e.$onReadyResolve$(o), l || appDidLoad())),  e.$onInstanceResolve$(o),  (e.$onRenderResolve$ && (e.$onRenderResolve$(), 
 e.$onRenderResolve$ = void 0), 512 & e.$flags$ && nextTick(() => scheduleUpdate(e, !1)), 
 e.$flags$ &= -517);
}, appDidLoad = e => {
  addHydratedFlag(doc.documentElement), nextTick(() => emitEvent(win, "appload", {
  detail: {
   namespace: NAMESPACE
  }
 })), BUILD.profile  ;
}, safeCall = (e, t, o) => {
 if (e && e[t]) try {
  return e[t](o);
 } catch (e) {
  consoleError(e);
 }
}, then = (e, t) => e && e.then ? e.then(t) : t(), addHydratedFlag = e =>  e.classList.add("hydrated") , serverSideConnected = e => {
 const t = e.children;
 if (null != t) for (let e = 0, o = t.length; e < o; e++) {
  const o = t[e];
  "function" == typeof o.connectedCallback && o.connectedCallback(), serverSideConnected(o);
 }
}, clientHydrate = (e, t, o, n, s, l, a) => {
 let r, i, d, c;
 if (1 === l.nodeType) {
  for (r = l.getAttribute("c-id"), r && (i = r.split("."), i[0] !== a && "0" !== i[0] || (d = {
   $flags$: 0,
   $hostId$: i[0],
   $nodeId$: i[1],
   $depth$: i[2],
   $index$: i[3],
   $tag$: l.tagName.toLowerCase(),
   $elm$: l,
   $attrs$: null,
   $children$: null,
   $key$: null,
   $name$: null,
   $text$: null
  }, t.push(d), l.removeAttribute("c-id"), e.$children$ || (e.$children$ = []), e.$children$[d.$index$] = d, 
  e = d, n && "0" === d.$depth$ && (n[d.$index$] = d.$elm$))), c = l.childNodes.length - 1; c >= 0; c--) clientHydrate(e, t, o, n, s, l.childNodes[c], a);
  if (l.shadowRoot) for (c = l.shadowRoot.childNodes.length - 1; c >= 0; c--) clientHydrate(e, t, o, n, s, l.shadowRoot.childNodes[c], a);
 } else if (8 === l.nodeType) i = l.nodeValue.split("."), i[1] !== a && "0" !== i[1] || (r = i[0], 
 d = {
  $flags$: 0,
  $hostId$: i[1],
  $nodeId$: i[2],
  $depth$: i[3],
  $index$: i[4],
  $elm$: l,
  $attrs$: null,
  $children$: null,
  $key$: null,
  $name$: null,
  $tag$: null,
  $text$: null
 }, "t" === r ? (d.$elm$ = l.nextSibling, d.$elm$ && 3 === d.$elm$.nodeType && (d.$text$ = d.$elm$.textContent, 
 t.push(d), l.remove(), e.$children$ || (e.$children$ = []), e.$children$[d.$index$] = d, 
 n && "0" === d.$depth$ && (n[d.$index$] = d.$elm$))) : d.$hostId$ === a && ("s" === r ? (d.$tag$ = "slot", 
 i[5] ? l["s-sn"] = d.$name$ = i[5] : l["s-sn"] = "", l["s-sr"] = !0,  n && (d.$elm$ = doc.createElement(d.$tag$), 
 d.$name$ && d.$elm$.setAttribute("name", d.$name$), l.parentNode.insertBefore(d.$elm$, l), 
 l.remove(), "0" === d.$depth$ && (n[d.$index$] = d.$elm$)), o.push(d), e.$children$ || (e.$children$ = []), 
 e.$children$[d.$index$] = d) : "r" === r && ( n ? l.remove() :  (s["s-cr"] = l, 
 l["s-cn"] = !0)))); else if (e && "style" === e.$tag$) {
  const t = newVNode(null, l.textContent);
  t.$elm$ = l, t.$index$ = "0", e.$children$ = [ t ];
 }
}, initializeDocumentHydrate = (e, t) => {
 if (1 === e.nodeType) {
  let o = 0;
  for (;o < e.childNodes.length; o++) initializeDocumentHydrate(e.childNodes[o], t);
  if (e.shadowRoot) for (o = 0; o < e.shadowRoot.childNodes.length; o++) initializeDocumentHydrate(e.shadowRoot.childNodes[o], t);
 } else if (8 === e.nodeType) {
  const o = e.nodeValue.split(".");
  "o" === o[0] && (t.set(o[1] + "." + o[2], e), e.nodeValue = "", e["s-en"] = o[3]);
 }
}, parsePropertyValue = (e, t) => null == e || isComplexType(e) ? e :  4 & t ? "false" !== e && ("" === e || !!e) :   1 & t ? String(e) : e, getValue = (e, t) => getHostRef(e).$instanceValues$.get(t), setValue = (e, t, o, n) => {
 const s = getHostRef(e), a = s.$instanceValues$.get(t), r = s.$flags$, i =  s.$lazyInstance$ ;
 if (o = parsePropertyValue(o, n.$members$[t][0]), !( 8 & r && void 0 !== a || o === a) && (s.$instanceValues$.set(t, o), 
  i)) {
  if ( 2 == (18 & r)) {
   scheduleUpdate(s, !1);
  }
 }
}, proxyComponent = (e, t, o) => {
 if ( t.$members$) {
  const n = Object.entries(t.$members$), s = e.prototype;
  if (n.map(([e, [n]]) => {
    (31 & n || ( 2 & o) && 32 & n) ? Object.defineProperty(s, e, {
    get() {
     return getValue(this, e);
    },
    set(s) {
     setValue(this, e, s, t);
    },
    configurable: !0,
    enumerable: !0
   }) :  1 & o && 64 & n && Object.defineProperty(s, e, {
    value(...t) {
     const o = getHostRef(this);
     return o.$onInstancePromise$.then(() => o.$lazyInstance$[e](...t));
    }
   });
  }),  ( 1 & o)) {
   const o = new Map;
   s.attributeChangedCallback = function(e, t, n) {
    plt.jmp(() => {
     const t = o.get(e);
     this[t] = (null !== n || "boolean" != typeof this[t]) && n;
    });
   }, e.observedAttributes = n.filter(([e, t]) => 15 & t[0]).map(([e, n]) => {
    const s = n[1] || e;
    return o.set(s, e), s;
   });
  }
 }
 return e;
}, initializeComponent = async (e, t, o, n, s) => {
 if ( 0 == (32 & t.$flags$)) {
  {
   if (t.$flags$ |= 32, (s = loadModule(o)).then) {
    const e = ( () => {});
    s = await s, e();
   }
    !s.isProxied && (proxyComponent(s, o, 2), s.isProxied = !0);
   const e = createTime("createInstance", o.$tagName$);
    (t.$flags$ |= 8);
   try {
    new s(t);
   } catch (e) {
    consoleError(e);
   }
    (t.$flags$ &= -9), e(), 
   fireConnectedCallback(t.$lazyInstance$);
  }
  if ( s.style) {
   let n = s.style;
   const l = getScopeId(o);
   if (!styles.has(l)) {
    const e = createTime("registerStyles", o.$tagName$);
    registerStyle(l, n), e();
   }
  }
 }
 const r = t.$ancestorComponent$, i = () => scheduleUpdate(t, !0);
  r && r["s-rc"] ? r["s-rc"].push(i) : i();
}, fireConnectedCallback = e => {
  safeCall(e, "connectedCallback");
}, connectedCallback = e => {
 if (0 == (1 & plt.$flags$)) {
  const t = getHostRef(e), o = t.$cmpMeta$, n = createTime("connectedCallback", o.$tagName$);
  if (1 & t.$flags$) addHostEventListeners(e, t, o.$listeners$), fireConnectedCallback(t.$lazyInstance$); else {
   let n;
   if (t.$flags$ |= 1,  (n = e.getAttribute("s-id"), n)) {
    ((e, t, o, n) => {
     const s = createTime("hydrateClient", t), l = e.shadowRoot, a = [], r =  l ? [] : null, i = n.$vnode$ = newVNode(t, null);
     plt.$orgLocNodes$ || initializeDocumentHydrate(doc.body, plt.$orgLocNodes$ = new Map), 
     e["s-id"] = o, e.removeAttribute("s-id"), clientHydrate(i, a, [], r, e, e, o), a.map(e => {
      const o = e.$hostId$ + "." + e.$nodeId$, n = plt.$orgLocNodes$.get(o), s = e.$elm$;
      n && supportsShadow && "" === n["s-en"] && n.parentNode.insertBefore(s, n.nextSibling), 
      l || (s["s-hn"] = t, n && (s["s-ol"] = n, s["s-ol"]["s-nr"] = s)), plt.$orgLocNodes$.delete(o);
     }),  l && r.map(e => {
      e && l.appendChild(e);
     }), s();
    })(e, o.$tagName$, n, t);
   }
   if ( !n && (BUILD.hydrateServerSide ) && setContentReference(e), 
   BUILD.asyncLoading) {
    let o = e;
    for (;o = o.parentNode || o.host; ) if ( 1 === o.nodeType && o.hasAttribute("s-id") && o["s-p"] || o["s-p"]) {
     attachToAncestor(t, t.$ancestorComponent$ = o);
     break;
    }
   }
    initializeComponent(e, t, o);
  }
  n();
 }
}, setContentReference = e => {
 const t = e["s-cr"] = doc.createComment( "");
 t["s-cn"] = !0, e.insertBefore(t, e.firstChild);
}, insertVdomAnnotations = (e, t) => {
 if (null != e) {
  const o = {
   hostIds: 0,
   rootLevelIds: 0,
   staticComponents: new Set(t)
  }, n = [];
  parseVNodeAnnotations(e, e.body, o, n), n.forEach(t => {
   if (null != t) {
    const n = t["s-nr"];
    let s = n["s-host-id"], l = n["s-node-id"], a = `${s}.${l}`;
    if (null == s) if (s = 0, o.rootLevelIds++, l = o.rootLevelIds, a = `${s}.${l}`, 
    1 === n.nodeType) n.setAttribute("c-id", a); else if (3 === n.nodeType) {
     if (0 === s && "" === n.nodeValue.trim()) return void t.remove();
     const o = e.createComment(a);
     o.nodeValue = "t." + a, n.parentNode.insertBefore(o, n);
    }
    let r = "o." + a;
    const i = t.parentElement;
    i && ("" === i["s-en"] ? r += "." : "c" === i["s-en"] && (r += ".c")), t.nodeValue = r;
   }
  });
 }
}, parseVNodeAnnotations = (e, t, o, n) => {
 null != t && (null != t["s-nr"] && n.push(t), 1 === t.nodeType && t.childNodes.forEach(t => {
  const s = getHostRef(t);
  if (null != s && !o.staticComponents.has(t.nodeName.toLowerCase())) {
   const n = {
    nodeIds: 0
   };
   insertVNodeAnnotations(e, t, s.$vnode$, o, n);
  }
  parseVNodeAnnotations(e, t, o, n);
 }));
}, insertVNodeAnnotations = (e, t, o, n, s) => {
 if (null != o) {
  const l = ++n.hostIds;
  if (t.setAttribute("s-id", l), null != t["s-cr"] && (t["s-cr"].nodeValue = "r." + l), 
  null != o.$children$) {
   const t = 0;
   o.$children$.forEach((o, n) => {
    insertChildVNodeAnnotations(e, o, s, l, t, n);
   });
  }
  if (t && o && o.$elm$ && !t.hasAttribute("c-id")) {
   const e = t.parentElement;
   if (e && e.childNodes) {
    const n = Array.from(e.childNodes), s = n.find(e => 8 === e.nodeType && e["s-sr"]);
    if (s) {
     const e = n.indexOf(t) - 1;
     o.$elm$.setAttribute("c-id", `${s["s-host-id"]}.${s["s-node-id"]}.0.${e}`);
    }
   }
  }
 }
}, insertChildVNodeAnnotations = (e, t, o, n, s, l) => {
 const a = t.$elm$;
 if (null == a) return;
 const r = o.nodeIds++, i = `${n}.${r}.${s}.${l}`;
 if (a["s-host-id"] = n, a["s-node-id"] = r, 1 === a.nodeType) a.setAttribute("c-id", i); else if (3 === a.nodeType) {
  const t = a.parentNode;
  if ("STYLE" !== t.nodeName) {
   const o = "t." + i, n = e.createComment(o);
   t.insertBefore(n, a);
  }
 } else if (8 === a.nodeType && a["s-sr"]) {
  const e = `s.${i}.${a["s-sn"] || ""}`;
  a.nodeValue = e;
 }
 if (null != t.$children$) {
  const l = s + 1;
  t.$children$.forEach((t, s) => {
   insertChildVNodeAnnotations(e, t, o, n, l, s);
  });
 }
}, NO_HYDRATE_TAGS = new Set([ "CODE", "HEAD", "IFRAME", "INPUT", "OBJECT", "OUTPUT", "NOSCRIPT", "PRE", "SCRIPT", "SELECT", "STYLE", "TEMPLATE", "TEXTAREA" ]), cmpModules = new Map, getModule = e => {
 if ("string" == typeof e) {
  e = e.toLowerCase();
  const t = cmpModules.get(e);
  if (null != t) return t[e];
 }
 return null;
}, loadModule = (e, t, o) => getModule(e.$tagName$), isMemberInElement = (e, t) => {
 if (null != e) {
  if (t in e) return !0;
  const o = getModule(e.nodeName);
  if (null != o) {
   const e = o;
   if (null != e && null != e.cmpMeta && null != e.cmpMeta.$members$) return t in e.cmpMeta.$members$;
  }
 }
 return !1;
}, registerComponents = e => {
 for (const t of e) {
  const e = t.cmpMeta.$tagName$;
  cmpModules.set(e, {
   [e]: t
  });
 }
}, win = window, doc = win.document, writeTask = e => {
 process.nextTick(() => {
  try {
   e();
  } catch (e) {
   consoleError(e);
  }
 });
}, resolved = Promise.resolve(), nextTick = e => resolved.then(e), consoleError = e => {
 null != e && console.error(e.stack || e.message || e);
}, plt = {
 $flags$: 0,
 $resourcesUrl$: "",
 jmp: e => e(),
 raf: e => requestAnimationFrame(e),
 ael: (e, t, o, n) => e.addEventListener(t, o, n),
 rel: (e, t, o, n) => e.removeEventListener(t, o, n),
 ce: (e, t) => new win.CustomEvent(e, t)
}, supportsShadow = !1, hostRefs = new WeakMap, getHostRef = e => hostRefs.get(e), registerInstance = (e, t) => hostRefs.set(t.$lazyInstance$ = e, t), registerHost = (e, t) => {
 const o = {
  $flags$: 0,
  $cmpMeta$: t,
  $hostElement$: e,
  $instanceValues$: new Map,
  $renderCount$: 0
 };
 return o.$onInstancePromise$ = new Promise(e => o.$onInstanceResolve$ = e), o.$onReadyPromise$ = new Promise(e => o.$onReadyResolve$ = e), 
 e["s-p"] = [], e["s-rc"] = [], addHostEventListeners(e, o, t.$listeners$), hostRefs.set(e, o);
}, styles = new Map;

const appsMenuCss = "/*!@**/*.sc-tok-apps-menu{-webkit-box-sizing:border-box;box-sizing:border-box}/*!@.apps-menu*/.apps-menu.sc-tok-apps-menu{position:fixed;top:var(--header-height);left:0;max-width:350px;background-color:var(--panel-selected-color);z-index:1000;padding-bottom:10px}/*!@.app-menu-item*/.app-menu-item.sc-tok-apps-menu{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;padding:0 20px;width:100%;height:var(--header-height);color:white;text-decoration:none}/*!@.app-menu-item:hover*/.app-menu-item.sc-tok-apps-menu:hover{background-color:var(--panel-hover-color)}/*!@.logo*/.logo.sc-tok-apps-menu{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;height:100%;margin-right:20px}/*!@.logo img*/.logo.sc-tok-apps-menu img.sc-tok-apps-menu{height:30px}/*!@.details*/.details.sc-tok-apps-menu{height:100%;display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;-ms-flex-pack:center;justify-content:center;-ms-flex-align:start;align-items:flex-start}/*!@.details span.title*/.details.sc-tok-apps-menu span.title.sc-tok-apps-menu{font-size:0.875rem}/*!@.app-menu-item:hover .details span.title*/.app-menu-item.sc-tok-apps-menu:hover .details.sc-tok-apps-menu span.title.sc-tok-apps-menu{color:orange}/*!@.details .description*/.details.sc-tok-apps-menu .description.sc-tok-apps-menu{font-size:0.7rem;margin-top:5px}";

class AppsMenu {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.close = createEvent(this, "close", 7);
    }
    connectedCallback() {
        this.clickEventHandlerRef = this.clickEventHandler.bind(this);
        document.addEventListener('click', this.clickEventHandlerRef);
        this.el.addEventListener('mouseleave', this.mouseLeaveEventHandler.bind(this));
    }
    disconnectedCallback() {
        document.removeEventListener('click', this.clickEventHandlerRef);
    }
    clickEventHandler(event) {
        if (!this.el.contains(event.target)) {
            this.close.emit();
        }
    }
    mouseLeaveEventHandler() {
        this.close.emit();
    }
    render() {
        return (h("div", { class: 'apps-menu' }, this.apps.map(app => (h("a", { class: 'app-menu-item', href: app.url }, h("div", { class: 'logo' }, h("img", { src: `data:image/png;base64,${app.logo}` })), h("div", { class: 'details' }, h("span", { class: 'title' }, app.title), h("span", { class: 'description' }, app.description)))))));
    }
    get el() { return getElement(this); }
    static get style() { return appsMenuCss; }
    static get cmpMeta() { return {
        "$flags$": 9,
        "$tagName$": "tok-apps-menu",
        "$members$": {
            "apps": [16]
        },
        "$listeners$": undefined,
        "$lazyBundleId$": "-",
        "$attrsToReflect$": []
    }; }
}

const contentCss = "tok-content{display:block;-ms-flex-positive:1;flex-grow:1;width:100%;position:relative}";

class Content {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    render() {
        return (h("div", null, h("slot", null)));
    }
    static get style() { return contentCss; }
    static get cmpMeta() { return {
        "$flags$": 4,
        "$tagName$": "tok-content",
        "$members$": undefined,
        "$listeners$": undefined,
        "$lazyBundleId$": "-",
        "$attrsToReflect$": []
    }; }
}

const footerCss = "/*!@**/*.sc-tok-footer{-webkit-box-sizing:border-box;box-sizing:border-box}/*!@.footer*/.footer.sc-tok-footer{display:-ms-flexbox;display:flex;-ms-flex-direction:row;flex-direction:row;-ms-flex-pack:justify;justify-content:space-between;-ms-flex-align:center;align-items:center;padding:0 20px;min-height:var(--footer-height);max-height:var(--footer-height);background-color:var(--panel-primary-color);width:100%;color:#DDD;font-size:.8rem}/*!@.footer.fixed*/.footer.fixed.sc-tok-footer{position:fixed;bottom:0;left:0;right:0}/*!@.social*/.social.sc-tok-footer{display:-ms-flexbox;display:flex}/*!@.social a*/.social.sc-tok-footer a.sc-tok-footer{display:-ms-flexbox;display:flex;-ms-flex-pack:center;justify-content:center;-ms-flex-align:center;align-items:center;height:var(--footer-height);width:var(--footer-height)}/*!@.social a svg*/.social.sc-tok-footer a.sc-tok-footer svg.sc-tok-footer{width:60%;height:60%;fill:#DDD}/*!@.social a:hover svg*/.social.sc-tok-footer a.sc-tok-footer:hover svg.sc-tok-footer{fill:#BBB}";

const facebookLogo = `<svg viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 10h-2v2h2v6h3v-6h1.82l.18-2h-2v-.833c0-.478.096-.667.558-.667h1.442v-2.5h-2.404c-1.798 0-2.596.792-2.596 2.308v1.692z"/></svg>`;
const twitterLogo = `<svg viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.5 8.778c-.441.196-.916.328-1.414.388.509-.305.898-.787 1.083-1.362-.476.282-1.003.487-1.564.597-.448-.479-1.089-.778-1.796-.778-1.59 0-2.758 1.483-2.399 3.023-2.045-.103-3.86-1.083-5.074-2.572-.645 1.106-.334 2.554.762 3.287-.403-.013-.782-.124-1.114-.308-.027 1.14.791 2.207 1.975 2.445-.346.094-.726.116-1.112.042.313.978 1.224 1.689 2.3 1.709-1.037.812-2.34 1.175-3.647 1.021 1.09.699 2.383 1.106 3.773 1.106 4.572 0 7.154-3.861 6.998-7.324.482-.346.899-.78 1.229-1.274z"/></svg>`;
const linkedinLogo = `<svg viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 8c0 .557-.447 1.008-1 1.008s-1-.45-1-1.008c0-.557.447-1.008 1-1.008s1 .452 1 1.008zm0 2h-2v6h2v-6zm3 0h-2v6h2v-2.861c0-1.722 2.002-1.881 2.002 0v2.861h1.998v-3.359c0-3.284-3.128-3.164-4-1.548v-1.093z"/></svg>`;
const youtubeLogo = `<svg viewBox="0 0 24 24"><path d="M16.23 7.102c-2.002-.136-6.462-.135-8.461 0-2.165.148-2.419 1.456-2.436 4.898.017 3.436.27 4.75 2.437 4.898 1.999.135 6.459.136 8.461 0 2.165-.148 2.42-1.457 2.437-4.898-.018-3.436-.271-4.75-2.438-4.898zm-6.23 7.12v-4.444l4.778 2.218-4.778 2.226zm2-12.222c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12z"/></svg>`;
const telegramLogo = `<svg viewBox="0 0 24 24"><path d="M12,0c-6.627,0 -12,5.373 -12,12c0,6.627 5.373,12 12,12c6.627,0 12,-5.373 12,-12c0,-6.627 -5.373,-12 -12,-12Zm0,2c5.514,0 10,4.486 10,10c0,5.514 -4.486,10 -10,10c-5.514,0 -10,-4.486 -10,-10c0,-5.514 4.486,-10 10,-10Zm2.692,14.889c0.161,0.115 0.368,0.143 0.553,0.073c0.185,-0.07 0.322,-0.228 0.362,-0.42c0.435,-2.042 1.489,-7.211 1.884,-9.068c0.03,-0.14 -0.019,-0.285 -0.129,-0.379c-0.11,-0.093 -0.263,-0.12 -0.399,-0.07c-2.096,0.776 -8.553,3.198 -11.192,4.175c-0.168,0.062 -0.277,0.223 -0.271,0.4c0.006,0.177 0.125,0.33 0.296,0.381c1.184,0.354 2.738,0.847 2.738,0.847c0,0 0.725,2.193 1.104,3.308c0.047,0.139 0.157,0.25 0.301,0.287c0.145,0.038 0.298,-0.001 0.406,-0.103c0.608,-0.574 1.548,-1.461 1.548,-1.461c0,0 1.786,1.309 2.799,2.03Zm-5.505,-4.338l0.84,2.769l0.186,-1.754c0,0 3.243,-2.925 5.092,-4.593c0.055,-0.048 0.062,-0.13 0.017,-0.188c-0.045,-0.057 -0.126,-0.071 -0.188,-0.032c-2.143,1.368 -5.947,3.798 -5.947,3.798Z"/></svg>`;
const defaultSocial = [
    {
        name: 'Facebook',
        href: 'https://www.facebook.com/xrwebnetwork',
        logo: facebookLogo,
    },
    {
        name: 'Twitter',
        href: 'https://www.twitter.com/xrwebnetwork',
        logo: twitterLogo,
    },
    {
        name: 'LinkedIn',
        href: 'https://www.linkedin.com/companygofind',
        logo: linkedinLogo,
    },
    {
        name: 'YouTube',
        href: 'https://www.youtube.com/channel/UC-x6e65y0c4-IvDrsQf55ew',
        logo: youtubeLogo,
    },
    {
        name: 'Telegram',
        href: 'https://t.me/gofindxr',
        logo: telegramLogo,
    }
];
class Footer {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.footerFixed = createEvent(this, "footerFixed", 7);
        this.fixed = false;
        this.social = defaultSocial;
    }
    connectedCallback() {
        console.log(this.fixed);
        this.footerFixed.emit(this.fixed);
    }
    render() {
        return (h("div", { class: {
                footer: true,
                fixed: this.fixed,
            } }, h("span", { class: 'legend' }, "\u00A9 2020 Tokenizer Investment Banking Blockchain. All Right Reserved. Powered by Defi Ventures"), h("div", { class: 'social' }, this.social.map(social => (h("a", { href: social.href, title: social.name }, h("span", { innerHTML: social.logo })))))));
    }
    static get style() { return footerCss; }
    static get cmpMeta() { return {
        "$flags$": 9,
        "$tagName$": "tok-footer",
        "$members$": {
            "fixed": [4],
            "social": [16]
        },
        "$listeners$": undefined,
        "$lazyBundleId$": "-",
        "$attrsToReflect$": []
    }; }
}

const headerCss = "/*!@**/*.sc-tok-header{-webkit-box-sizing:border-box;box-sizing:border-box}/*!@:host*/.sc-tok-header-h{position:fixed;display:-ms-flexbox;display:flex;-ms-flex-direction:row;flex-direction:row;-ms-flex-align:center;align-items:center;-ms-flex-pack:start;justify-content:flex-start;padding:0;top:0;left:0;right:0;height:var(--header-height);background-color:var(--panel-primary-color);z-index:1000;fill:white;color:white}/*!@.flex*/.flex.sc-tok-header{display:-ms-flexbox;display:flex}/*!@.flex.center*/.flex.center.sc-tok-header{-ms-flex-pack:center;justify-content:center;-ms-flex-align:center;align-items:center}/*!@.header-item*/.header-item.sc-tok-header{height:100%;cursor:pointer}/*!@.header-item.square*/.header-item.square.sc-tok-header{width:var(--header-height)}/*!@.header-item:hover*/.header-item.sc-tok-header:hover{background-color:var(--panel-hover-color)}/*!@.header-item.open*/.header-item.open.sc-tok-header{background-color:var(--panel-selected-color)}/*!@.header-item svg*/.header-item.sc-tok-header svg.sc-tok-header{height:40%;width:40%}/*!@.logo img*/.logo.sc-tok-header img.sc-tok-header{height:var(--footer-height);max-height:var(--footer-height)}/*!@.page-title*/.page-title.sc-tok-header{text-transform:uppercase;font-size:1.1rem;font-weight:500;padding:0 2px}/*!@.item-group*/.item-group.sc-tok-header{display:-ms-flexbox;display:flex;-ms-flex-direction:row;flex-direction:row;height:100%;-ms-flex-align:center;align-items:center}/*!@.separator*/.separator.sc-tok-header{height:var(--footer-height);width:1px;margin:0 5px}/*!@.separator.wide*/.separator.wide.sc-tok-header{margin:0 10px}/*!@.separator.x-wide*/.separator.x-wide.sc-tok-header{margin:0 20px}/*!@.separator.line*/.separator.line.sc-tok-header{background-color:#AAA}/*!@.separator.grow*/.separator.grow.sc-tok-header{-ms-flex-positive:1;flex-grow:1}";

const logo = `iVBORw0KGgoAAAANSUhEUgAAASgAAABQCAYAAACqAegBAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjU0RkRGOUM0OUIxNDExRUE5RTNFOUEwOTVGM0FDQTJBIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjU0RkRGOUM1OUIxNDExRUE5RTNFOUEwOTVGM0FDQTJBIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NTRGREY5QzI5QjE0MTFFQTlFM0U5QTA5NUYzQUNBMkEiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NTRGREY5QzM5QjE0MTFFQTlFM0U5QTA5NUYzQUNBMkEiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6hG31WAAAznklEQVR42uxdB3hUVdo+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`;
const appsMenu = `<svg viewBox="0 0 512 512"><path d="M186.2,139.6h139.6V0H186.2V139.6z M372.4,0v139.6H512V0H372.4z M0,139.6h139.6V0H0V139.6z M186.2,325.8h139.6V186.2H186.2 V325.8z M372.4,325.8H512V186.2H372.4V325.8z M0,325.8h139.6V186.2H0V325.8z M186.2,512h139.6V372.4H186.2V512z M372.4,512H512 V372.4H372.4V512z M0,512h139.6V372.4H0V512z"/></svg>`;
const hamburgerMenu = `<svg viewBox="0 0 24 24"><path d="M24 6h-24v-4h24v4zm0 4h-24v4h24v-4zm0 8h-24v4h24v-4z"/></svg>`;
const defaultApps = [{
        title: 'Issue',
        description: 'Securely Tokenize your assets on the blockchain',
        logo: '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',
        url: 'https://issue.tokenizer.cc',
    }, {
        title: 'Invest',
        description: 'Access the world’s largest portfolio of assets to invest in',
        logo: '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',
        url: 'https://invest.tokenizer.cc',
    }, {
        title: 'exchange',
        description: 'Trade assets on the market for assets backed tokens.',
        logo: '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',
        url: 'https://exchange.tokenizer.cc',
    }];
class Header {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.sideMenuOpen = createEvent(this, "sideMenuOpen", 7);
        this.sideMenu = false;
        this.logoHref = 'https://www.tokenizer.cc';
        this.apps = defaultApps;
        this.isAppsMenuOpen = false;
        this.isSideMenuOpen = false;
    }
    closeHandler() {
        this.isAppsMenuOpen = false;
    }
    appsMenuClickHandler() {
        this.isAppsMenuOpen = !this.isAppsMenuOpen;
    }
    sideMenuClickHandler() {
        this.isSideMenuOpen = !this.isSideMenuOpen;
        this.sideMenuOpen.emit(this.isSideMenuOpen);
    }
    render() {
        var _a;
        const appMenu = this.isAppsMenuOpen && (h("tok-apps-menu", { apps: this.apps }));
        const appMenuButton = ((_a = this.apps) === null || _a === void 0 ? void 0 : _a.length) && (h("div", { class: {
                'flex center header-item square apps-menu': true,
                open: this.isAppsMenuOpen,
            }, innerHTML: appsMenu, onClick: this.appsMenuClickHandler.bind(this) }));
        const hamburgerMenuButton = this.sideMenu && (h("div", { class: {
                'flex center header-item square side-menu': true,
                open: this.isSideMenuOpen,
            }, innerHTML: hamburgerMenu, onClick: this.sideMenuClickHandler.bind(this) }));
        return (h(Host, null, appMenuButton, h("a", { class: 'flex center header-item logo', href: this.logoHref }, h("img", { src: `data:image/png;base64,${logo}` })), this.pageTitle && (h("div", { class: 'item-group' }, h("div", { class: 'separator wide line' }), h("div", { class: 'page-title' }, this.pageTitle))), h("div", { class: 'separator grow' }), hamburgerMenuButton, appMenu));
    }
    static get assetsDirs() { return ["assets"]; }
    static get style() { return headerCss; }
    static get cmpMeta() { return {
        "$flags$": 9,
        "$tagName$": "tok-header",
        "$members$": {
            "sideMenu": [4, "side-menu"],
            "logoHref": [1, "logo-href"],
            "apps": [16],
            "pageTitle": [1, "page-title"],
            "isAppsMenuOpen": [32],
            "isSideMenuOpen": [32]
        },
        "$listeners$": [[0, "close", "closeHandler"]],
        "$lazyBundleId$": "-",
        "$attrsToReflect$": []
    }; }
}

const mainCss = "tok-main>div{overflow-y:auto;position:absolute;display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;top:var(--header-height);bottom:0;left:0;right:0}tok-main>div.footer-fixed{bottom:var(--footer-height)}";

class Main {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    footerFixedHandler(fixed) {
        this.footerFixed = fixed.detail;
        const sideMenu = document.querySelector('tok-side-menu');
        if (sideMenu) {
            sideMenu.footerFixed(fixed.detail);
        }
    }
    sideMenuOpenHandler(open) {
        const sideMenu = document.querySelector('tok-side-menu');
        if (sideMenu) {
            sideMenu.open(open.detail);
        }
    }
    render() {
        return (h("div", { class: {
                'footer-fixed': this.footerFixed,
            } }, h("slot", null)));
    }
    static get style() { return mainCss; }
    static get cmpMeta() { return {
        "$flags$": 4,
        "$tagName$": "tok-main",
        "$members$": {
            "footerFixed": [32]
        },
        "$listeners$": [[0, "footerFixed", "footerFixedHandler"], [0, "sideMenuOpen", "sideMenuOpenHandler"]],
        "$lazyBundleId$": "-",
        "$attrsToReflect$": []
    }; }
}

const sideMenuCss = "/*!@**/*.sc-tok-side-menu{-webkit-box-sizing:border-box;box-sizing:border-box}/*!@.menu*/.menu.sc-tok-side-menu{position:fixed;top:var(--header-height);right:0;bottom:0;width:200px;background-color:var(--panel-selected-color);z-index:1000;color:white}/*!@.menu.footer-fixed*/.menu.footer-fixed.sc-tok-side-menu{bottom:var(--footer-height)}";

class SideMenu {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.isOpen = false;
        this.isFooterFixed = false;
    }
    async open(open) {
        this.isOpen = open;
    }
    async footerFixed(fixed) {
        this.isFooterFixed = fixed;
    }
    render() {
        if (!this.isOpen) {
            return null;
        }
        return (h("div", { class: {
                menu: true,
                'footer-fixed': this.isFooterFixed,
            } }, h("slot", null)));
    }
    static get style() { return sideMenuCss; }
    static get cmpMeta() { return {
        "$flags$": 9,
        "$tagName$": "tok-side-menu",
        "$members$": {
            "isOpen": [32],
            "isFooterFixed": [32],
            "open": [64],
            "footerFixed": [64]
        },
        "$listeners$": undefined,
        "$lazyBundleId$": "-",
        "$attrsToReflect$": []
    }; }
}

registerComponents([
  AppsMenu,
  Content,
  Footer,
  Header,
  Main,
  SideMenu,
]);

exports.hydrateApp = hydrateApp;


  /*hydrateAppClosure end*/
  hydrateApp(window, $stencilHydrateOpts, $stencilHydrateResults, $stencilAfterHydrate, $stencilHydrateResolve);
  }

  hydrateAppClosure($stencilWindow);
}

function createWindowFromHtml(e, t) {
 let r = templateWindows.get(t);
 return null == r && (r = new MockWindow(e), templateWindows.set(t, r)), cloneWindow(r);
}

function normalizeHydrateOptions(e) {
 const t = Object.assign({
  serializeToHtml: !1,
  destroyWindow: !1,
  destroyDocument: !1
 }, e || {});
 return "boolean" != typeof t.clientHydrateAnnotations && (t.clientHydrateAnnotations = !0), 
 "boolean" != typeof t.constrainTimeouts && (t.constrainTimeouts = !0), "number" != typeof t.maxHydrateCount && (t.maxHydrateCount = 300), 
 "boolean" != typeof t.runtimeLogging && (t.runtimeLogging = !1), "number" != typeof t.timeout && (t.timeout = 15e3), 
 Array.isArray(t.excludeComponents) ? t.excludeComponents = t.excludeComponents.filter(filterValidTags).map(mapValidTags) : t.excludeComponents = [], 
 Array.isArray(t.staticComponents) ? t.staticComponents = t.staticComponents.filter(filterValidTags).map(mapValidTags) : t.staticComponents = [], 
 t;
}

function filterValidTags(e) {
 return "string" == typeof e && e.includes("-");
}

function mapValidTags(e) {
 return e.trim().toLowerCase();
}

function generateHydrateResults(e) {
 "string" != typeof e.url && (e.url = "https://hydrate.stenciljs.com/");
 const t = {
  diagnostics: [],
  url: e.url,
  host: null,
  hostname: null,
  href: null,
  pathname: null,
  port: null,
  search: null,
  hash: null,
  html: null,
  httpStatus: null,
  hydratedCount: 0,
  anchors: [],
  components: [],
  imgs: [],
  scripts: [],
  styles: [],
  title: null
 };
 try {
  const r = new URL(e.url, "https://hydrate.stenciljs.com/");
  t.url = r.href, t.host = r.host, t.hostname = r.hostname, t.href = r.href, t.port = r.port, 
  t.pathname = r.pathname, t.search = r.search, t.hash = r.hash;
 } catch (e) {
  renderCatchError(t, e);
 }
 return t;
}

function renderBuildDiagnostic(e, t, r, s) {
 const n = {
  level: t,
  type: "build",
  header: r,
  messageText: s,
  relFilePath: null,
  absFilePath: null,
  lines: []
 };
 return e.pathname ? "/" !== e.pathname && (n.header += ": " + e.pathname) : e.url && (n.header += ": " + e.url), 
 e.diagnostics.push(n), n;
}

function renderBuildError(e, t) {
 return renderBuildDiagnostic(e, "error", "Hydrate Error", t);
}

function renderCatchError(e, t) {
 const r = renderBuildError(e, null);
 return null != t && (null != t.stack ? r.messageText = t.stack.toString() : null != t.message ? r.messageText = t.message.toString() : r.messageText = t.toString()), 
 r;
}

function runtimeLog(e, t, r) {
 global.console[t].apply(global.console, [ `[ ${e}  ${t} ] `, ...r ]);
}

function collectAttributes(e) {
 const t = {}, r = e.attributes;
 for (let e = 0, s = r.length; e < s; e++) {
  const s = r.item(e), n = s.nodeName.toLowerCase();
  if (SKIP_ATTRS.has(n)) continue;
  const o = s.nodeValue;
  "class" === n && "" === o || (t[n] = o);
 }
 return t;
}

function patchDomImplementation(e, t) {
 let r;
 if (null != e.defaultView ? (t.destroyWindow = !0, patchWindow(e.defaultView), r = e.defaultView) : (t.destroyWindow = !0, 
 t.destroyDocument = !1, r = new MockWindow(!1)), r.document !== e && (r.document = e), 
 e.defaultView !== r && (e.defaultView = r), "function" != typeof e.documentElement.constructor.prototype.getRootNode && (e.createElement("unknown-element").constructor.prototype.getRootNode = getRootNode), 
 "function" == typeof e.createEvent) {
  const t = e.createEvent("CustomEvent").constructor;
  r.CustomEvent !== t && (r.CustomEvent = t);
 }
 try {
  e.baseURI;
 } catch (t) {
  Object.defineProperty(e, "baseURI", {
   get() {
    const t = e.querySelector("base[href]");
    return t ? new URL(t.getAttribute("href"), r.location.href).href : r.location.href;
   }
  });
 }
 return r;
}

function getRootNode(e) {
 const t = null != e && !0 === e.composed;
 let r = this;
 for (;null != r.parentNode; ) r = r.parentNode, !0 === t && null == r.parentNode && null != r.host && (r = r.host);
 return r;
}

function renderToString(e, t) {
 const r = normalizeHydrateOptions(t);
 return r.serializeToHtml = !0, new Promise(t => {
  const s = generateHydrateResults(r);
  if (hasError(s.diagnostics)) t(s); else if ("string" == typeof e) try {
   r.destroyWindow = !0, r.destroyDocument = !0, render(new MockWindow(e), r, s, t);
  } catch (e) {
   renderCatchError(s, e), t(s);
  } else if (isValidDocument(e)) try {
   r.destroyDocument = !1, render(patchDomImplementation(e, r), r, s, t);
  } catch (e) {
   renderCatchError(s, e), t(s);
  } else renderBuildError(s, 'Invalid html or document. Must be either a valid "html" string, or DOM "document".'), 
  t(s);
 });
}

function hydrateDocument(e, t) {
 const r = normalizeHydrateOptions(t);
 return r.serializeToHtml = !1, new Promise(t => {
  const s = generateHydrateResults(r);
  if (hasError(s.diagnostics)) t(s); else if ("string" == typeof e) try {
   r.destroyWindow = !0, r.destroyDocument = !0, render(new MockWindow(e), r, s, t);
  } catch (e) {
   renderCatchError(s, e), t(s);
  } else if (isValidDocument(e)) try {
   r.destroyDocument = !1, render(patchDomImplementation(e, r), r, s, t);
  } catch (e) {
   renderCatchError(s, e), t(s);
  } else renderBuildError(s, 'Invalid html or document. Must be either a valid "html" string, or DOM "document".'), 
  t(s);
 });
}

function render(e, t, r, s) {
 if (process.__stencilErrors || (process.__stencilErrors = !0, process.on("unhandledRejection", e => {
  console.log("unhandledRejection", e);
 })), function n(e, t, r) {
  try {
   e.location.href = t.url;
  } catch (e) {
   renderCatchError(r, e);
  }
  if ("string" == typeof t.userAgent) try {
   e.navigator.userAgent = t.userAgent;
  } catch (e) {}
  if ("string" == typeof t.cookie) try {
   e.document.cookie = t.cookie;
  } catch (e) {}
  if ("string" == typeof t.referrer) try {
   e.document.referrer = t.referrer;
  } catch (e) {}
  if ("string" == typeof t.direction) try {
   e.document.documentElement.setAttribute("dir", t.direction);
  } catch (e) {}
  if ("string" == typeof t.language) try {
   e.document.documentElement.setAttribute("lang", t.language);
  } catch (e) {}
  try {
   e.customElements = null;
  } catch (e) {}
  return t.constrainTimeouts && constrainTimeouts(e), function s(e, t, r) {
   try {
    const s = e.location.pathname;
    e.console.error = (...e) => {
     renderCatchError(r, [ ...e ].join(", ")), t.runtimeLogging && runtimeLog(s, "error", e);
    }, e.console.debug = (...e) => {
     renderBuildDiagnostic(r, "debug", "Hydrate Debug", [ ...e ].join(", ")), t.runtimeLogging && runtimeLog(s, "debug", e);
    }, t.runtimeLogging && [ "log", "warn", "assert", "info", "trace" ].forEach(t => {
     e.console[t] = (...e) => {
      runtimeLog(s, t, e);
     };
    });
   } catch (e) {
    renderCatchError(r, e);
   }
  }(e, t, r), e;
 }(e, t, r), "function" == typeof t.beforeHydrate) try {
  const n = t.beforeHydrate(e.document);
  isPromise(n) ? n.then(() => {
   hydrateFactory(e, t, r, afterHydrate, s);
  }) : hydrateFactory(e, t, r, afterHydrate, s);
 } catch (n) {
  renderCatchError(r, n), finalizeHydrate(e, e.document, t, r, s);
 } else hydrateFactory(e, t, r, afterHydrate, s);
}

function afterHydrate(e, t, r, s) {
 if ("function" == typeof t.afterHydrate) try {
  const n = t.afterHydrate(e.document);
  isPromise(n) ? n.then(() => {
   finalizeHydrate(e, e.document, t, r, s);
  }) : finalizeHydrate(e, e.document, t, r, s);
 } catch (n) {
  renderCatchError(r, n), finalizeHydrate(e, e.document, t, r, s);
 } else finalizeHydrate(e, e.document, t, r, s);
}

function finalizeHydrate(e, t, r, s, n) {
 try {
  if (function e(t, r, s) {
   const n = r.children;
   for (let r = 0, o = n.length; r < o; r++) {
    const o = n[r], i = o.nodeName.toLowerCase();
    if (i.includes("-")) {
     const e = t.components.find(e => e.tag === i);
     null != e && (e.count++, s > e.depth && (e.depth = s));
    } else switch (i) {
    case "a":
     const e = collectAttributes(o);
     e.href = o.href, "string" == typeof e.href && (t.anchors.some(t => t.href === e.href) || t.anchors.push(e));
     break;

    case "img":
     const r = collectAttributes(o);
     r.src = o.src, "string" == typeof r.src && (t.imgs.some(e => e.src === r.src) || t.imgs.push(r));
     break;

    case "link":
     const s = collectAttributes(o);
     s.href = o.href, "string" == typeof s.rel && "stylesheet" === s.rel.toLowerCase() && "string" == typeof s.href && (t.styles.some(e => e.link === s.href) || (delete s.rel, 
     delete s.type, t.styles.push(s)));
     break;

    case "script":
     const n = collectAttributes(o);
     n.src = o.src, "string" == typeof n.src && (t.scripts.some(e => e.src === n.src) || t.scripts.push(n));
    }
    e(t, o, ++s);
   }
  }(s, t.documentElement, 0), !1 !== r.removeUnusedStyles) try {
   ((e, t) => {
    try {
     const r = e.head.querySelectorAll("style[data-styles]"), s = r.length;
     if (s > 0) {
      const n = (e => {
       const t = {
        attrs: new Set,
        classNames: new Set,
        ids: new Set,
        tags: new Set
       };
       return collectUsedSelectors(t, e), t;
      })(e.documentElement);
      for (let e = 0; e < s; e++) removeUnusedStyleText(n, t, r[e]);
     }
    } catch (e) {
     ((e, t, r) => {
      const s = {
       level: "error",
       type: "build",
       header: "Build Error",
       messageText: "build error",
       relFilePath: null,
       absFilePath: null,
       lines: []
      };
      null != t && (null != t.stack ? s.messageText = t.stack.toString() : null != t.message ? s.messageText = t.message.toString() : s.messageText = t.toString()), 
      null == e || shouldIgnoreError(s.messageText) || e.push(s);
     })(t, e);
    }
   })(t, s.diagnostics);
  } catch (e) {
   renderCatchError(s, e);
  }
  if ("string" == typeof r.title) try {
   t.title = r.title;
  } catch (e) {
   renderCatchError(s, e);
  }
  s.title = t.title, r.removeScripts && function e(t) {
   const r = t.children;
   for (let t = r.length - 1; t >= 0; t--) {
    const s = r[t];
    e(s), ("SCRIPT" === s.nodeName || "LINK" === s.nodeName && "modulepreload" === s.getAttribute("rel")) && s.remove();
   }
  }(t.documentElement);
  try {
   ((e, t) => {
    let r = e.head.querySelector('link[rel="canonical"]');
    "string" == typeof t ? (null == r && (r = e.createElement("link"), r.setAttribute("rel", "canonical"), 
    e.head.appendChild(r)), r.setAttribute("href", t)) : null != r && (r.getAttribute("href") || r.parentNode.removeChild(r));
   })(t, r.canonicalUrl);
  } catch (e) {
   renderCatchError(s, e);
  }
  try {
   (e => {
    const t = e.head;
    let r = t.querySelector("meta[charset]");
    null == r ? (r = e.createElement("meta"), r.setAttribute("charset", "utf-8")) : r.remove(), 
    t.insertBefore(r, t.firstChild);
   })(t);
  } catch (e) {}
  hasError(s.diagnostics) || (s.httpStatus = 200);
  try {
   const e = t.head.querySelector('meta[http-equiv="status"]');
   if (null != e) {
    const t = e.getAttribute("content");
    t && t.length > 0 && (s.httpStatus = parseInt(t, 10));
   }
  } catch (e) {}
  r.clientHydrateAnnotations && t.documentElement.classList.add("hydrated"), r.serializeToHtml && (s.html = serializeDocumentToString(t, r));
 } catch (e) {
  renderCatchError(s, e);
 }
 if (r.destroyWindow) try {
  r.destroyDocument || (e.document = null, t.defaultView = null), e.close();
 } catch (e) {
  renderCatchError(s, e);
 }
 n(s);
}

function serializeDocumentToString(e, t) {
 return serializeNodeToHtml(e, {
  approximateLineWidth: t.approximateLineWidth,
  outerHtml: !1,
  prettyHtml: t.prettyHtml,
  removeAttributeQuotes: t.removeAttributeQuotes,
  removeBooleanAttributeQuotes: t.removeBooleanAttributeQuotes,
  removeEmptyAttributes: t.removeEmptyAttributes,
  removeHtmlComments: t.removeHtmlComments,
  serializeShadowRoot: !1
 });
}

function isValidDocument(e) {
 return null != e && 9 === e.nodeType && null != e.documentElement && 1 === e.documentElement.nodeType && null != e.body && 1 === e.body.nodeType;
}

const templateWindows = new Map, isPromise = e => !!e && ("object" == typeof e || "function" == typeof e) && "function" == typeof e.then, IS_DENO_ENV = "undefined" != typeof Deno, IS_NODE_ENV = !(IS_DENO_ENV || "undefined" == typeof global || "function" != typeof require || !global.process || "string" != typeof __filename || global.origin && "string" == typeof global.origin), hasError = (IS_NODE_ENV ? global.process.platform : IS_DENO_ENV && globalThis.Deno.build.os, 
IS_DENO_ENV && Deno.build.os, IS_NODE_ENV && global.process.platform, IS_NODE_ENV ? process.cwd : IS_DENO_ENV && Deno.cwd, 
IS_NODE_ENV ? process.exit : IS_DENO_ENV && Deno.exit, e => null != e && 0 !== e.length && e.some(e => "error" === e.level && "runtime" !== e.type)), shouldIgnoreError = e => e === TASK_CANCELED_MSG, TASK_CANCELED_MSG = "task canceled", SKIP_ATTRS = new Set([ "s-id", "c-id" ]), collectUsedSelectors = (e, t) => {
 if (null != t && 1 === t.nodeType) {
  const r = t.children, s = t.nodeName.toLowerCase();
  e.tags.add(s);
  const n = t.attributes;
  for (let r = 0, s = n.length; r < s; r++) {
   const s = n.item(r), o = s.name.toLowerCase();
   if (e.attrs.add(o), "class" === o) {
    const r = t.classList;
    for (let t = 0, s = r.length; t < s; t++) e.classNames.add(r.item(t));
   } else "id" === o && e.ids.add(s.value);
  }
  if (r) for (let t = 0, s = r.length; t < s; t++) collectUsedSelectors(e, r[t]);
 }
}, parseCss = (e, t) => {
 let r = 1, s = 1;
 const n = [], o = e => {
  const t = e.match(/\n/g);
  t && (r += t.length);
  const n = e.lastIndexOf("\n");
  s = ~n ? e.length - n : s + e.length;
 }, i = () => {
  const e = {
   line: r,
   column: s
  };
  return t => (t.position = new z(e), m(), t);
 }, a = o => {
  const i = e.split("\n"), a = {
   level: "error",
   type: "css",
   language: "css",
   header: "CSS Parse",
   messageText: o,
   absFilePath: t,
   lines: [ {
    lineIndex: r - 1,
    lineNumber: r,
    errorCharStart: s,
    text: e[r - 1]
   } ]
  };
  if (r > 1) {
   const t = {
    lineIndex: r - 1,
    lineNumber: r - 1,
    text: e[r - 2],
    errorCharStart: -1,
    errorLength: -1
   };
   a.lines.unshift(t);
  }
  if (r + 2 < i.length) {
   const e = {
    lineIndex: r,
    lineNumber: r + 1,
    text: i[r],
    errorCharStart: -1,
    errorLength: -1
   };
   a.lines.push(e);
  }
  return n.push(a), null;
 }, l = () => u(/^{\s*/), c = () => u(/^}/), u = t => {
  const r = t.exec(e);
  if (!r) return;
  const s = r[0];
  return o(s), e = e.slice(s.length), r;
 }, d = () => {
  let t;
  const r = [];
  for (m(), h(r); e.length && "}" !== e.charAt(0) && (t = w() || N()); ) !1 !== t && (r.push(t), 
  h(r));
  return r;
 }, m = () => u(/^\s*/), h = e => {
  let t;
  for (e = e || []; t = f(); ) !1 !== t && e.push(t);
  return e;
 }, f = () => {
  const t = i();
  if ("/" !== e.charAt(0) || "*" !== e.charAt(1)) return null;
  let r = 2;
  for (;"" !== e.charAt(r) && ("*" !== e.charAt(r) || "/" !== e.charAt(r + 1)); ) ++r;
  if (r += 2, "" === e.charAt(r - 1)) return a("End of comment missing");
  const n = e.slice(2, r - 2);
  return s += 2, o(n), e = e.slice(r), s += 2, t({
   type: "comment",
   comment: n
  });
 }, p = () => {
  const e = u(/^([^{]+)/);
  return e ? trim(e[0]).replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, "").replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, (function(e) {
   return e.replace(/,/g, "‌");
  })).split(/\s*(?![^(]*\)),\s*/).map((function(e) {
   return e.replace(/\u200C/g, ",");
  })) : null;
 }, g = () => {
  const e = i();
  let t = u(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
  if (!t) return null;
  if (t = trim(t[0]), !u(/^:\s*/)) return a("property missing ':'");
  const r = u(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/), s = e({
   type: "declaration",
   property: t.replace(commentre, ""),
   value: r ? trim(r[0]).replace(commentre, "") : ""
  });
  return u(/^[;\s]*/), s;
 }, y = () => {
  const e = [];
  if (!l()) return a("missing '{'");
  let t;
  for (h(e); t = g(); ) !1 !== t && (e.push(t), h(e));
  return c() ? e : a("missing '}'");
 }, E = () => {
  let e;
  const t = [], r = i();
  for (;e = u(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/); ) t.push(e[1]), u(/^,\s*/);
  return t.length ? r({
   type: "keyframe",
   values: t,
   declarations: y()
  }) : null;
 }, S = e => {
  const t = new RegExp("^@" + e + "\\s*([^;]+);");
  return () => {
   const r = i(), s = u(t);
   if (!s) return null;
   const n = {
    type: e
   };
   return n[e] = s[1].trim(), r(n);
  };
 }, C = S("import"), b = S("charset"), T = S("namespace"), w = () => "@" !== e[0] ? null : (() => {
  const e = i();
  let t = u(/^@([-\w]+)?keyframes\s*/);
  if (!t) return null;
  const r = t[1];
  if (t = u(/^([-\w]+)\s*/), !t) return a("@keyframes missing name");
  const s = t[1];
  if (!l()) return a("@keyframes missing '{'");
  let n, o = h();
  for (;n = E(); ) o.push(n), o = o.concat(h());
  return c() ? e({
   type: "keyframes",
   name: s,
   vendor: r,
   keyframes: o
  }) : a("@keyframes missing '}'");
 })() || (() => {
  const e = i(), t = u(/^@media *([^{]+)/);
  if (!t) return null;
  const r = trim(t[1]);
  if (!l()) return a("@media missing '{'");
  const s = h().concat(d());
  return c() ? e({
   type: "media",
   media: r,
   rules: s
  }) : a("@media missing '}'");
 })() || (() => {
  const e = i(), t = u(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
  return t ? e({
   type: "custom-media",
   name: trim(t[1]),
   media: trim(t[2])
  }) : null;
 })() || (() => {
  const e = i(), t = u(/^@supports *([^{]+)/);
  if (!t) return null;
  const r = trim(t[1]);
  if (!l()) return a("@supports missing '{'");
  const s = h().concat(d());
  return c() ? e({
   type: "supports",
   supports: r,
   rules: s
  }) : a("@supports missing '}'");
 })() || C() || b() || T() || (() => {
  const e = i(), t = u(/^@([-\w]+)?document *([^{]+)/);
  if (!t) return null;
  const r = trim(t[1]), s = trim(t[2]);
  if (!l()) return a("@document missing '{'");
  const n = h().concat(d());
  return c() ? e({
   type: "document",
   document: s,
   vendor: r,
   rules: n
  }) : a("@document missing '}'");
 })() || (() => {
  const e = i();
  if (!u(/^@page */)) return null;
  const t = p() || [];
  if (!l()) return a("@page missing '{'");
  let r, s = h();
  for (;r = g(); ) s.push(r), s = s.concat(h());
  return c() ? e({
   type: "page",
   selectors: t,
   declarations: s
  }) : a("@page missing '}'");
 })() || (() => {
  const e = i();
  if (!u(/^@host\s*/)) return null;
  if (!l()) return a("@host missing '{'");
  const t = h().concat(d());
  return c() ? e({
   type: "host",
   rules: t
  }) : a("@host missing '}'");
 })() || (() => {
  const e = i();
  if (!u(/^@font-face\s*/)) return null;
  if (!l()) return a("@font-face missing '{'");
  let t, r = h();
  for (;t = g(); ) r.push(t), r = r.concat(h());
  return c() ? e({
   type: "font-face",
   declarations: r
  }) : a("@font-face missing '}'");
 })(), N = () => {
  const e = i(), t = p();
  return t ? (h(), e({
   type: "rule",
   selectors: t,
   declarations: y()
  })) : a("selector missing");
 };
 class z {
  constructor(e) {
   this.start = e, this.end = {
    line: r,
    column: s
   }, this.source = t;
  }
 }
 return z.prototype.content = e, Object.assign({
  diagnostics: n
 }, addParent((() => {
  const e = d();
  return {
   type: "stylesheet",
   stylesheet: {
    source: t,
    rules: e
   }
  };
 })()));
}, trim = e => e ? e.trim() : "", addParent = (e, t) => {
 const r = e && "string" == typeof e.type, s = r ? e : t;
 for (const t in e) {
  const r = e[t];
  Array.isArray(r) ? r.forEach((function(e) {
   addParent(e, s);
  })) : r && "object" == typeof r && addParent(r, s);
 }
 return r && Object.defineProperty(e, "parent", {
  configurable: !0,
  writable: !0,
  enumerable: !1,
  value: t || null
 }), e;
}, commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, getCssSelectors = e => {
 SELECTORS.all.length = SELECTORS.tags.length = SELECTORS.classNames.length = SELECTORS.ids.length = SELECTORS.attrs.length = 0;
 const t = (e = e.replace(/\./g, " .").replace(/\#/g, " #").replace(/\[/g, " [").replace(/\>/g, " > ").replace(/\+/g, " + ").replace(/\~/g, " ~ ").replace(/\*/g, " * ").replace(/\:not\((.*?)\)/g, " ")).split(" ");
 for (let e = 0, r = t.length; e < r; e++) t[e] = t[e].split(":")[0], 0 !== t[e].length && ("." === t[e].charAt(0) ? SELECTORS.classNames.push(t[e].substr(1)) : "#" === t[e].charAt(0) ? SELECTORS.ids.push(t[e].substr(1)) : "[" === t[e].charAt(0) ? (t[e] = t[e].substr(1).split("=")[0].split("]")[0].trim(), 
 SELECTORS.attrs.push(t[e].toLowerCase())) : /[a-z]/g.test(t[e].charAt(0)) && SELECTORS.tags.push(t[e].toLowerCase()));
 return SELECTORS.classNames = SELECTORS.classNames.sort((e, t) => e.length < t.length ? -1 : e.length > t.length ? 1 : 0), 
 SELECTORS;
}, SELECTORS = {
 all: [],
 tags: [],
 classNames: [],
 ids: [],
 attrs: []
}, serializeCssVisitNode = (e, t, r, s) => {
 const n = t.type;
 return "declaration" === n ? serializeCssDeclaration(t, r, s) : "rule" === n ? serializeCssRule(e, t) : "comment" === n ? "!" === t.comment[0] ? `/*${t.comment}*/` : "" : "media" === n ? serializeCssMedia(e, t) : "keyframes" === n ? serializeCssKeyframes(e, t) : "keyframe" === n ? serializeCssKeyframe(e, t) : "font-face" === n ? serializeCssFontFace(e, t) : "supports" === n ? serializeCssSupports(e, t) : "import" === n ? "@import " + t.import + ";" : "charset" === n ? "@charset " + t.charset + ";" : "page" === n ? serializeCssPage(e, t) : "host" === n ? "@host{" + serializeCssMapVisit(e, t.rules) + "}" : "custom-media" === n ? "@custom-media " + t.name + " " + t.media + ";" : "document" === n ? serializeCssDocument(e, t) : "namespace" === n ? "@namespace " + t.namespace + ";" : "";
}, serializeCssRule = (e, t) => {
 const r = t.declarations, s = e.usedSelectors, n = t.selectors.slice();
 if (null == r || 0 === r.length) return "";
 if (s) {
  let t, r, o = !0;
  for (t = n.length - 1; t >= 0; t--) {
   const i = getCssSelectors(n[t]);
   o = !0;
   let a = i.classNames.length;
   if (a > 0 && e.hasUsedClassNames) for (r = 0; r < a; r++) if (!s.classNames.has(i.classNames[r])) {
    o = !1;
    break;
   }
   if (o && e.hasUsedTags && (a = i.tags.length, a > 0)) for (r = 0; r < a; r++) if (!s.tags.has(i.tags[r])) {
    o = !1;
    break;
   }
   if (o && e.hasUsedAttrs && (a = i.attrs.length, a > 0)) for (r = 0; r < a; r++) if (!s.attrs.has(i.attrs[r])) {
    o = !1;
    break;
   }
   if (o && e.hasUsedIds && (a = i.ids.length, a > 0)) for (r = 0; r < a; r++) if (!s.ids.has(i.ids[r])) {
    o = !1;
    break;
   }
   o || n.splice(t, 1);
  }
 }
 if (0 === n.length) return "";
 const o = [];
 let i = "";
 for (const e of t.selectors) i = removeSelectorWhitespace(e), o.includes(i) || o.push(i);
 return `${o}{${serializeCssMapVisit(e, r)}}`;
}, serializeCssDeclaration = (e, t, r) => "" === e.value ? "" : r - 1 === t ? e.property + ":" + e.value : e.property + ":" + e.value + ";", serializeCssMedia = (e, t) => {
 const r = serializeCssMapVisit(e, t.rules);
 return "" === r ? "" : "@media " + removeMediaWhitespace(t.media) + "{" + r + "}";
}, serializeCssKeyframes = (e, t) => {
 const r = serializeCssMapVisit(e, t.keyframes);
 return "" === r ? "" : "@" + (t.vendor || "") + "keyframes " + t.name + "{" + r + "}";
}, serializeCssKeyframe = (e, t) => t.values.join(",") + "{" + serializeCssMapVisit(e, t.declarations) + "}", serializeCssFontFace = (e, t) => {
 const r = serializeCssMapVisit(e, t.declarations);
 return "" === r ? "" : "@font-face{" + r + "}";
}, serializeCssSupports = (e, t) => {
 const r = serializeCssMapVisit(e, t.rules);
 return "" === r ? "" : "@supports " + t.supports + "{" + r + "}";
}, serializeCssPage = (e, t) => "@page " + t.selectors.join(", ") + "{" + serializeCssMapVisit(e, t.declarations) + "}", serializeCssDocument = (e, t) => {
 const r = serializeCssMapVisit(e, t.rules), s = "@" + (t.vendor || "") + "document " + t.document;
 return "" === r ? "" : s + "{" + r + "}";
}, serializeCssMapVisit = (e, t) => {
 let r = "";
 if (t) for (let s = 0, n = t.length; s < n; s++) r += serializeCssVisitNode(e, t[s], s, n);
 return r;
}, removeSelectorWhitespace = e => {
 let t = "", r = "", s = !1;
 for (let n = 0, o = (e = e.trim()).length; n < o; n++) if (r = e[n], "[" === r && "\\" !== t[t.length - 1] ? s = !0 : "]" === r && "\\" !== t[t.length - 1] && (s = !1), 
 !s && CSS_WS_REG.test(r)) {
  if (CSS_NEXT_CHAR_REG.test(e[n + 1])) continue;
  if (CSS_PREV_CHAR_REG.test(t[t.length - 1])) continue;
  t += " ";
 } else t += r;
 return t;
}, removeMediaWhitespace = e => {
 let t = "", r = "";
 for (let s = 0, n = (e = e.trim()).length; s < n; s++) if (r = e[s], CSS_WS_REG.test(r)) {
  if (CSS_WS_REG.test(t[t.length - 1])) continue;
  t += " ";
 } else t += r;
 return t;
}, CSS_WS_REG = /\s/, CSS_NEXT_CHAR_REG = /[>\(\)\~\,\+\s]/, CSS_PREV_CHAR_REG = /[>\(\~\,\+]/, removeUnusedStyleText = (e, t, r) => {
 try {
  const s = parseCss(r.innerHTML);
  if (t.push(...s.diagnostics), hasError(t)) return;
  try {
   r.innerHTML = ((e, t) => {
    const r = t.usedSelectors || null, s = {
     usedSelectors: r || null,
     hasUsedAttrs: !!r && r.attrs.size > 0,
     hasUsedClassNames: !!r && r.classNames.size > 0,
     hasUsedIds: !!r && r.ids.size > 0,
     hasUsedTags: !!r && r.tags.size > 0
    }, n = e.rules;
    if (!n) return "";
    const o = n.length, i = [];
    for (let e = 0; e < o; e++) i.push(serializeCssVisitNode(s, n[e], e, o));
    return i.join("");
   })(s.stylesheet, {
    usedSelectors: e
   });
  } catch (e) {
   t.push({
    level: "warn",
    type: "css",
    header: "CSS Stringify",
    messageText: e
   });
  }
 } catch (e) {
  t.push({
   level: "warn",
   type: "css",
   header: "CSS Parse",
   messageText: e
  });
 }
};

exports.createWindowFromHtml = createWindowFromHtml;
exports.hydrateDocument = hydrateDocument;
exports.renderToString = renderToString;
exports.serializeDocumentToString = serializeDocumentToString;