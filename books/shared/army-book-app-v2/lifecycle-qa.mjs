/** Synthetic ownership checks: cancelled work remains inert even if already queued. */
import assert from 'node:assert/strict';
import {createLifecycle} from './lifecycle.mjs';

const frames=new Map(),timers=new Map(),cancelledFrames=[],cancelledTimers=[];
let next=0;
const view={requestAnimationFrame(fn){const id=++next;frames.set(id,fn);return id;},
  cancelAnimationFrame(id){cancelledFrames.push(id);},
  setTimeout(fn){const id=++next;timers.set(id,fn);return id;},
  clearTimeout(id){cancelledTimers.push(id);}};
const lifecycle=createLifecycle(view),target=new EventTarget(),events=[];
const unlisten=lifecycle.listen(target,'work',()=>events.push('event'));
target.dispatchEvent(new Event('work'));unlisten();unlisten();target.dispatchEvent(new Event('work'));
assert.deepEqual(events,['event'],'Unlisten must remove only its owned handler');
lifecycle.listen(target,'work',()=>events.push('late event'));
const completedFrame=lifecycle.frame(()=>events.push('frame'));
frames.get(completedFrame)(1);
const cancelledFrame=lifecycle.frame(()=>events.push('cancelled frame'));
lifecycle.cancelFrame(cancelledFrame);
const completedTimer=lifecycle.timeout(()=>events.push('timer'),0);
timers.get(completedTimer)();
const cancelledTimer=lifecycle.timeout(()=>events.push('cancelled timer'),0);
lifecycle.clearTimeout(cancelledTimer);
const queuedFrame=lifecycle.frame(()=>events.push('late frame'));
const queuedTimer=lifecycle.timeout(()=>events.push('late timer'),0);
let disconnected=0;
lifecycle.observe({disconnect(){disconnected++;}});
const guarded=lifecycle.guard(()=>events.push('late guard'));
const cleanup=[];
lifecycle.cleanup(()=>cleanup.push('first'));
const unregister=lifecycle.cleanup(()=>cleanup.push('unregistered'));unregister();
lifecycle.cleanup(()=>cleanup.push('last'));
assert.equal(lifecycle.active,true);lifecycle.destroy();lifecycle.destroy();
assert.equal(lifecycle.active,false);assert.equal(disconnected,1);
assert.deepEqual(cleanup,['last','first']);
assert.ok(cancelledFrames.includes(cancelledFrame)&&cancelledFrames.includes(queuedFrame));
assert.ok(cancelledTimers.includes(cancelledTimer)&&cancelledTimers.includes(queuedTimer));
target.dispatchEvent(new Event('work'));frames.get(queuedFrame)(2);timers.get(queuedTimer)();guarded();
assert.deepEqual(events,['event','frame','timer'],'Destroyed owners must suppress already-queued callbacks');
let lateCleanup=0;lifecycle.cleanup(()=>lateCleanup++);
lifecycle.observe({disconnect(){lateCleanup++;}});
assert.equal(lateCleanup,2,'Resources registered after destruction must be released immediately');
assert.equal(lifecycle.frame(()=>events.push('resurrected')),0);
assert.equal(lifecycle.timeout(()=>events.push('resurrected')),0);
lifecycle.listen(target,'work',()=>events.push('resurrected'));target.dispatchEvent(new Event('work'));
assert.deepEqual(events,['event','frame','timer']);

// A failing disposer must neither resurrect callbacks nor strand later resources.
const failing=createLifecycle(view),released=[];
failing.cleanup(()=>released.push('first'));
failing.cleanup(()=>{throw new Error('expected disposer failure');});
failing.cleanup(()=>released.push('last'));
assert.throws(()=>failing.destroy(),AggregateError);
assert.equal(failing.active,false);assert.deepEqual(released,['last','first']);failing.destroy();
console.log(JSON.stringify({status:'PASS',unlisten:true,cancellation:true,queuedCallbacks:true,
  observers:true,cleanupUnregister:true,idempotent:true,cleanupFailures:true}));
