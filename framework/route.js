import { freamwork } from "./index.js";
import { render } from "./render.js";
import { notfound } from "../app/notfound.js";

let isRenderScheduled = false;

function flushRouterRender() {
    isRenderScheduled = false; 
    const path = window.location.hash.slice(2) || freamwork.defaultRoute || '';
    const componentCreator = freamwork.routes[path] || notfound;
    
    
    if (componentCreator) { 
        freamwork.newDOM = componentCreator;    
        const newDom = freamwork.newDOM();      
        render(newDom, freamwork.parent, freamwork.OldDOM); 
        freamwork.OldDOM = newDom;
    } else {
        console.error(`Route not found for path: /${path}`);
    }
}

function enqueueRender() {
    if (!isRenderScheduled) {
        isRenderScheduled = true;
        setTimeout(flushRouterRender, 0); 
    }
}

export function router() {    
    enqueueRender(); 
};

export function addRoute(path, component) {
    if (typeof component !== 'function') {
        console.error(`Error: Component for path '${path}' must be a function.`);
        return;
    }
    freamwork.routes[path] = component;
};

export const push = (path) => {
    const newHash = `#/${path}`;
     window.location.hash = newHash;    
}

export function initRouter() {
const component = freamwork.routes[window.location.hash.slice(2)] || notfound ;
if (component) {    
    freamwork.mount(component);
}           
  window.addEventListener("hashchange",  router);

}