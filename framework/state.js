import { render } from "./render.js";
import { freamwork } from "./index.js";

let stateQueue = [];
let isRendering = false;

function flushStateQueue() {
    if (isRendering || stateQueue.length === 0) return;
    
    isRendering = true;
    
    let nextState = { ...freamwork.state };
    for (const updater of stateQueue) {
        const update = typeof updater === 'function' ? updater(nextState) : updater;
        if (!update || typeof update !== 'object') {
            console.error("setState: Each update must be an object or a function returning an object.");
            continue;
        }
        nextState = { ...nextState, ...update };
    }
    
    stateQueue = [];
    freamwork.state = nextState;
    
    const newVDom = freamwork.newDOM();
    render(newVDom, freamwork.parent, freamwork.OldDOM);
    freamwork.OldDOM = newVDom;
    
    isRendering = false;
}

export function setState(newStateOrFn) {
    if (typeof newStateOrFn !== 'function' && (!newStateOrFn || typeof newStateOrFn !== 'object')) {
        console.error("setState: The new state must be an object or a function returning an object.");
        return;
    }
    
    stateQueue.push(newStateOrFn);
    setTimeout(flushStateQueue, 0);
}