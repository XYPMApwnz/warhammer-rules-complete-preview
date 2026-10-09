/** Ownership of presentation resources. No routing, factual or roster semantics. */
export function createLifecycle(view) {
  let active=true;
  const cleanups=new Set(),frames=new Set(),timers=new Set(),observers=new Set();
  const guard=callback=>function(...args){if(active)return callback.apply(this,args);};
  function cleanup(callback) {
    if(!active){callback();return ()=>{};}
    cleanups.add(callback);return ()=>cleanups.delete(callback);
  }
  function listen(target,type,callback,options) {
    if(!active)return ()=>{};
    const handler=guard(callback);
    target.addEventListener(type,handler,options);
    const remove=()=>target.removeEventListener(type,handler,options);
    const forget=cleanup(remove);
    return ()=>{remove();forget();};
  }
  function frame(callback) {
    if(!active)return 0;
    const id=view.requestAnimationFrame(time=>{frames.delete(id);if(active)callback(time);});frames.add(id);return id;
  }
  function cancelFrame(id){view.cancelAnimationFrame(id);frames.delete(id);}
  function timeout(callback,delay) {
    if(!active)return 0;
    const id=view.setTimeout(()=>{timers.delete(id);if(active)callback();},delay);timers.add(id);return id;
  }
  function clearTimeout(id){view.clearTimeout(id);timers.delete(id);}
  function observe(observer){if(active)observers.add(observer);else observer.disconnect();return observer;}
  function destroy() {
    if(!active)return;
    active=false;
    for(const id of frames)view.cancelAnimationFrame(id);
    for(const id of timers)view.clearTimeout(id);
    for(const observer of observers)observer.disconnect();
    frames.clear();timers.clear();observers.clear();
    const errors=[];
    for(const dispose of [...cleanups].reverse())try{dispose();}catch(error){errors.push(error);}
    cleanups.clear();
    if(errors.length)throw new AggregateError(errors,'Presentation cleanup failed');
  }
  return Object.freeze({get active(){return active;},guard,cleanup,listen,frame,cancelFrame,timeout,clearTimeout,observe,destroy});
}
