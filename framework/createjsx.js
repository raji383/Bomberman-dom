import { freamwork } from "./index.js";

export function createElement({ tag, attrs = {}, children = [], events = {} }) {
  if (!Array.isArray(children)) {
    children = [children];
  }
  children = children.flat().filter(c => c !== null && c !== false && c !== undefined);
  return { tag, attrs, children, events };
}


  export  function mount(component) {
   freamwork.newDOM = component
    const vDom = component()
   freamwork.OldDOM = vDom;
   if(freamwork.parent) freamwork.parent.innerHTML = ""
   freamwork.render(vDom, freamwork.parent);
};