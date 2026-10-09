/** Actual V1 navigation highlight lifecycle; no factual dependencies. */
import {createLifecycle} from './lifecycle.mjs';

export class Highlighter{
    constructor({className='v1-navigation-destination',duration=2300,view=window,lifecycle}={}){
      this.view=view;this.lifecycle=createLifecycle(view);
      this.className=className;
      this.duration=duration;
      this.current=[];
      this.timer=0;
      this.removeParentCleanup=lifecycle?.cleanup(()=>this.destroy());
    }

    clear(){
      if(this.timer)this.lifecycle.clearTimeout(this.timer);
      this.timer=0;
      this.current.forEach(target=>{
        target.classList.remove(this.className);
        if(target.dataset.navigationHighlightRange==='true')target.remove();
      });
      this.current=[];
    }

    destroy(){
      if(!this.lifecycle.active)return;
      this.removeParentCleanup?.();this.clear();this.lifecycle.destroy();
    }

    range(targets){
      if(!this.lifecycle.active)return null;
      const rects=targets.filter(target=>target.isConnected).map(target=>target.getBoundingClientRect()).filter(rect=>rect.width&&rect.height);
      if(!rects.length)return null;
      const left=Math.min(...rects.map(rect=>rect.left))+this.view.scrollX,top=Math.min(...rects.map(rect=>rect.top))+this.view.scrollY;
      const right=Math.max(...rects.map(rect=>rect.right))+this.view.scrollX,bottom=Math.max(...rects.map(rect=>rect.bottom))+this.view.scrollY;
      const range=this.view.document.createElement('div');
      range.className='logical-destination-highlight';
      range.dataset.navigationHighlightRange='true';
      range.setAttribute('aria-hidden','true');
      Object.assign(range.style,{position:'absolute',pointerEvents:'none',boxSizing:'border-box',zIndex:'7',left:`${left}px`,top:`${top}px`,width:`${Math.max(1,right-left)}px`,height:`${Math.max(1,bottom-top)}px`});
      this.view.document.body.append(range);
      return range;
    }

    show(target){
      if(!this.lifecycle.active)return;
      this.clear();
      const targets=(Array.isArray(target)?target:[target]).filter(item=>item?.classList);
      if(!targets.length)return;
      const visual=targets.length>1?this.range(targets):targets[0];
      if(!visual)return;
      visual.classList.remove(this.className);
      void visual.offsetWidth;
      visual.classList.add(this.className);
      const current=[visual];
      this.current=current;
      this.timer=this.lifecycle.timeout(()=>{
        if(this.current!==current)return;
        this.clear();
      },this.duration);
    }
  }
