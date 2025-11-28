import { createRealElement } from "./core.js";

const eventQueue = [];
function getNextExistingElement(newChildren, oldKeyedMap, i, el) {
  for (let j = i + 1; j < newChildren.length; j++) {
    const nextNewChild = newChildren[j];
    const nextKey = (typeof nextNewChild === 'object' && nextNewChild?.attrs?.key) || `_${j}`;
    if (oldKeyedMap.has(nextKey)) {
      const existingOldChild = oldKeyedMap.get(nextKey);
      return existingOldChild.el;
    }
  }
  return null;
}

export function render(newTree, container, oldTree=null) {   
    updateElement(oldTree, newTree, container);
}
function updateElement(oldVNode, newVNode, parent) {
  if (!newVNode) {
    if (oldVNode && oldVNode.el) parent.removeChild(oldVNode.el);
    return;
  }
  if (!oldVNode) {
    const el = createRealElement(newVNode);
    parent.appendChild(el);
    if (typeof newVNode === 'object') newVNode.el = el;    
    return;
  }

  if (typeof oldVNode === 'string' || typeof newVNode === 'string' || typeof oldVNode === 'number' || typeof newVNode === 'number') {
    if (oldVNode.toString() !== newVNode.toString()) {
      const newEl = createRealElement(newVNode);
      const oldEl = oldVNode.el || parent.firstChild;
      if (oldEl) {
        parent.replaceChild(newEl, oldEl);
      } else {
        parent.appendChild(newEl);
      }
    }
    return;
  }

  if (oldVNode.tag !== newVNode.tag) {
    const newEl = createRealElement(newVNode);
    parent.replaceChild(newEl, oldVNode.el);
    newVNode.el = newEl;
    return;
  }

  const el = oldVNode.el;
  if (!el) {    
    const newEl = createRealElement(newVNode);
    parent.appendChild(newEl);
    newVNode.el = newEl;
    return;
  }
  newVNode.el = el;
  const oldAttrs = oldVNode.attrs || {};
  const newAttrs = newVNode.attrs || {};

  Object.keys(newAttrs).forEach((key) => {
    const oldValue = oldAttrs[key];
    const newValue = newAttrs[key];
    if (oldValue !== newValue) {
      if (key === 'checked' || key === 'autofocus' || key === 'selected') {
        el[key] = !!newValue;
      } else if (key === 'style' && typeof newValue === 'object') {
        Object.assign(el.style, newValue);
      } else if (key === 'htmlFor') {
        el.setAttribute('for', newValue);
      } else if (key === 'value') {
        el.value = newValue || '';
        el.setAttribute('value', newValue || '');
      } else {
        el.setAttribute(key, newValue);
      }
    }
  });

  Object.keys(oldAttrs).forEach((key) => {
    if (!(key in newAttrs)) {
      if (key === 'checked' || key === 'autofocus' || key === 'selected') {
        el[key] = false;
      } else if (key === 'style') {
        el.style.cssText = '';
      } else if (key === 'htmlFor') {
        el.removeAttribute('for');
      } else if (key === 'value') {
        el.value = '';
      } else {
        el.removeAttribute(key);
      }
    }
  });

  const oldEvents = oldVNode.events || {};
  const newEvents = newVNode.events || {};


  Object.keys(oldEvents).forEach((eventType) => {
    const oldHandler = oldEvents[eventType];
    const newHandler = newEvents[eventType];
  if (!(eventType in newHandler)) {          
      eventQueue.push(() => el.removeEventListener(eventType, oldHandler));
    }
  });

  Object.keys(newEvents).forEach((eventType) => {
    const oldHandler = oldEvents[eventType];
    const newHandler = newEvents[eventType];
if (!(eventType in oldHandler)){  
      eventQueue.push(() => el.addEventListener(eventType, newHandler));
    }
  });

  queueMicrotask(() => {
    while (eventQueue && eventQueue.length > 0) {      
      const fn = eventQueue.shift();    
      fn();
    }
  });

  const oldChildren = oldVNode.children || [];
  const newChildren = newVNode.children || [];
  const oldKeyedMap = new Map();
  oldChildren.forEach((child, index) => {
    const key = (typeof child === 'object' && child?.attrs?.key) || `_${index}`;
    oldKeyedMap.set(key, child);
  });

  for (let i = 0; i < newChildren.length; i++) {
    const newChild = newChildren[i];
    const key = (typeof newChild === 'object' && newChild?.attrs?.key) || `_${i}`;
    let oldChild = oldKeyedMap.get(key);
    let realDOMNode = null;
    const nextSiblingReference = getNextExistingElement(newChildren, oldKeyedMap, i, el);

    if (oldChild) {
      updateElement(oldChild, newChild, el);
      if (typeof newChild === 'object') {
        realDOMNode = newChild.el;        
      } else {
        realDOMNode = el.childNodes[i];
      }
      oldKeyedMap.delete(key);
      if (realDOMNode && realDOMNode.nextSibling !== nextSiblingReference) {        
        el.insertBefore(realDOMNode, nextSiblingReference);
      }
    } else {
      realDOMNode = createRealElement(newChild);
      el.insertBefore(realDOMNode, nextSiblingReference);
    }
  }

  oldKeyedMap.forEach((oldChild) => {
    const childEl = oldChild.el;
    if (childEl && el.contains(childEl)) {
      el.removeChild(childEl);
    }
  });
}

