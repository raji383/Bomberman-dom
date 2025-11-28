import { freamwork } from "./index.js";

 export function createElement({ tag, attrs = {}, children = [], events = {} }) {
    return { tag, attrs, children, events };
  }

  export  function mount(component) {
   freamwork.newDOM = component
    const vDom = component()
   freamwork.OldDOM = vDom;
   freamwork.parent.innerHTML = ""
   freamwork.render(vDom, freamwork.parent);
};
