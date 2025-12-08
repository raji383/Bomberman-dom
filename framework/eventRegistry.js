export const eventRegistry = new Set();

export function registerDomEvent(element, type, handler) {
  console.log(type,handler)
  console.log(11);
  
  if (type=="keydown" || type=="keyup") {
    
    window.addEventListener(type,handler)
    return 
  }
  element.addEventListener(type, handler);

  eventRegistry.add(() => {
    element.removeEventListener(type, handler);
  });
  
}
export function runEventCleanups() {
 eventRegistry.forEach(fn => fn());
  eventRegistry.clear();
}
