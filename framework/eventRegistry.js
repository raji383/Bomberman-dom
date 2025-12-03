export const eventRegistry = new Set();

export function registerDomEvent(element, type, handler) {
  if (type=="keydown") {
    window.addEventListener(type,handler)
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
