/** Presentation geometry from V1 PopupController.reposition, single V2 detail.
 * Identity, history, physical scope and content stay with the V2 resolver.
 */
export function positionV1Popup(dialog,{origin,rect}={}) {
  if(!dialog.open)return;
  const window=dialog.ownerDocument.defaultView;
  const headerBottom=dialog.ownerDocument.getElementById('appHeader')?.getBoundingClientRect().bottom||0;
  const previousLeft=dialog.style.left,previousTop=dialog.style.top;
  dialog.style.removeProperty('left');dialog.style.removeProperty('top');dialog.style.removeProperty('bottom');
  if(window.innerWidth<=800){
    const margin=14,height=dialog.offsetHeight;
    const centered=(window.innerHeight-height)/2;
    const top=Math.max(headerBottom+margin,Math.min(centered,window.innerHeight-height-margin));
    dialog.style.left='14px';dialog.style.top=Math.round(top)+'px';return;
  }
  const anchor=origin?.isConnected?origin.getBoundingClientRect():rect;
  if(anchor&&(anchor.bottom<0||anchor.top>window.innerHeight)&&previousLeft&&previousTop){dialog.style.left=previousLeft;dialog.style.top=previousTop;return;}
  const margin=14,gap=10,width=dialog.offsetWidth,height=dialog.offsetHeight;
  let left=anchor?anchor.left:(window.innerWidth-width)/2;
  left=Math.max(margin,Math.min(left,window.innerWidth-width-margin));
  let top=anchor?anchor.bottom+gap:(window.innerHeight-height)/2;
  if(anchor&&top+height>window.innerHeight-margin)top=anchor.top-height-gap;
  top=Math.max(headerBottom+margin,Math.min(top,window.innerHeight-height-margin));
  dialog.style.left=Math.round(left)+'px';dialog.style.top=Math.round(top)+'px';
}
