# Mini Framework — Documentation



**Overview**

This is a small, dependency-free virtual-DOM micro-framework. It provides a tiny VDOM representation, a renderer with diffing, a simple mounting API, event registration helpers, and a queued state updater that triggers re-renders.

Key features
 - **Tiny VDOM**: Virtual nodes are plain objects with `tag`, `attrs`, `children`, and `events`.
 - **Renderer with diffing**: The renderer updates only the parts of the real DOM that changed.
 - **Mounting**: `mount(component)` attaches a component (a function that returns a VDOM tree) to the DOM root (`#app`).
 - **State queueing**: `setState` batches updates and triggers a single re-render.
 - **Event registration**: Events are attached to real DOM nodes and cleaned up via an internal registry.

Getting started
 - Project's root HTML should include an element with id `app` (the framework uses this as the mount point).
 - Import the framework helpers directly from the `framework/` files in this repo.

Basic concepts
 - Virtual Node (vNode): A plain object: `{ tag, attrs = {}, children = [], events = {} }`.
 - Text nodes are represented by strings or numbers.

API and usage

1) Creating an element

Use the `createElement` helper available in `framework/createjsx.js`.

```javascript
import { createElement, mount } from '../framework/createjsx.js';

function App() {
	return createElement({
		tag: 'div',
		attrs: { id: 'root', class: 'container' },
		children: [
			'Hello, world!'
		]
	});
}

mount(App);
```

2) Adding attributes

Pass attributes via the `attrs` object. Special attribute handling in the framework:
 - Boolean-like attributes: `checked`, `autofocus`, `selected` are set as properties.
 - `style`: pass an object to assign CSS styles.
 - `htmlFor`: will be converted to the `for` attribute on the element.
 - `value`: sets both `value` property and `value` attribute for inputs.

Example:

```javascript
createElement({
	tag: 'input',
	attrs: { type: 'text', value: 'initial', placeholder: 'Type...' }
});
```

3) Events

Attach event handlers with the `events` object on a vNode. Handlers are registered on the real DOM via an internal registry.

```javascript
createElement({
	tag: 'button',
	attrs: { id: 'btn' },
	events: {
		click: (e) => { console.log('clicked', e); }
	},
	children: ['Click me']
});
```

Mount example using events and state

```javascript
import { createElement, mount } from '../framework/createjsx.js';
import { freamwork } from '../framework/index.js';

function Counter() {
	const count = freamwork.state.count || 0;
	return createElement({
		tag: 'div',
		children: [
			createElement({ tag: 'p', children: [ `Count: ${count}` ] }),
			createElement({
				tag: 'button',
				events: { click: () => freamwork.setState({ count: count + 1 }) },
				children: ['Increment']
			})
		]
	});
}

mount(Counter);
```

4) Nesting elements

Children can be strings, numbers, or vNode objects. Use `children` array to nest arbitrarily deep.

```javascript
createElement({
	tag: 'ul',
	children: [
		createElement({ tag: 'li', children: ['Item 1'] }),
		createElement({ tag: 'li', children: ['Item 2'] })
	]
});
```

Notes about keys: you can pass a `key` in `attrs` to stabilize identity across reorders, e.g. `attrs: { key: 'item-1' }`.

How the framework works (internals)

- Files of interest:
	- `framework/createjsx.js`: exports `createElement` and `mount`. `createElement` returns plain vNode objects; `mount` initializes `freamwork.newDOM`, obtains an initial vDOM by calling the component, clears the parent container and calls the renderer.
	- `framework/core.js`: implements `createRealElement(vNode)` that converts a vNode into a real DOM node, applies attributes, registers events (via `eventRegistry.js`), and appends children recursively.
	- `framework/render.js`: exposes `render(newTree, container, oldTree)` and performs diffing through `updateElement`. It handles:
		- Text node updates and replacements
		- Tag changes (replace the element)
		- Attribute updates, deletions, and special handling for `style`, `value`, etc.
		- Event add/remove via a queued microtask (to avoid synchronous DOM hazards)
		- Child reconciliation using keys or index-based fallbacks and smart insertBefore to maintain ordering
	- `framework/state.js`: implements `setState` that batches updates via a queue, merges state updates, sets `freamwork.state`, calls `freamwork.newDOM()` to obtain a fresh vDOM, and calls the renderer to patch the DOM.
	- `framework/eventRegistry.js`: provides helpers for registering DOM events and cleaning them up when needed.

Rendering lifecycle (summary)
 - `mount(component)`: stores component as `freamwork.newDOM`, calls it to get initial vDOM and renders it into `freamwork.parent` (an element with id `app`).
 - When `setState` is called: updates are queued, then flushed; the framework computes the new state, calls the registered component function (`freamwork.newDOM()`), and calls `render(newVDom, parent, oldVDom)` to diff and update the DOM.

Diffing strategy (key points)
 - If either node is a primitive (string/number) it compares string representations and replaces when needed.
 - If tag names differ, the node is replaced wholesale.
 - Attributes and events are compared; only changed attributes are updated, and removed attributes are cleared.
 - Children are reconciled using `key` in `attrs` where available; otherwise the framework uses index-based fallbacks and an algorithm to find the next existing element.

Tips & gotchas
 - Component functions must return the VDOM tree (a vNode or a primitive). `mount` expects a zero-argument function: the framework calls it each render to produce the tree.
 - `freamwork.parent` defaults to the element with id `app`; ensure it exists in `index.html`.
 - Use `attrs.key` to ensure correct identity when moving items in lists.
 - Event handlers should be stable across renders when possible; the renderer adds/removes handlers based on differences.

Where to look next
 - `framework/render.js` to understand patching and reordering.
 - `framework/core.js` to see element creation and attribute/event handling.
 - `framework/state.js` to see how state updates trigger re-renders.

