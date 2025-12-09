export const eventRegistry = new Set();

export function registerDomEvent(element, type, handler) {
  
  
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
