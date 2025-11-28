import { registerDomEvent } from "./eventRegistry.js";

export function createRealElement(vNode) {
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(vNode);
  }
  if (!vNode || !vNode.tag) return document.createTextNode("");
  const element = document.createElement(vNode.tag);
  vNode.el = element;

  // ATTRIBUTES
  const attrs = vNode.attrs || {};
  for (const key in attrs) {
    const value = attrs[key];

    if (key === "checked" || key === "autofocus" || key === "selected") {
      element[key] = !!value;
    } else if (key === "style" && typeof value === "object") {
      Object.assign(element.style, value);
    } else if (key === "htmlFor") {
      element.setAttribute("for", value);
    } else if (key === "value") {
      element.value = value || "";
      element.setAttribute("value", value || "");
    } else {
      element.setAttribute(key, value);
    }
  }

  // EVENTS
  const events = vNode.events || {};
  for (const eventType in events) {
    const handler = events[eventType];
    registerDomEvent(element, eventType, handler);
  }

  // CHILDREN
  const children = vNode.children || [];
  children.forEach(child => {
    if (child) element.appendChild(createRealElement(child));
  });

  // MOUNT hook
  queueMicrotask(() => {
    if (vNode.events && typeof vNode.events.mount === "function") {
      vNode.events.mount(element);
    }
  });

  return element;
}
