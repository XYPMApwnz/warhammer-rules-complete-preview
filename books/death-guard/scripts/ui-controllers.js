(function(){
  'use strict';
  class ThemeController{
    constructor(){
      this.button=document.getElementById('themeButton');
      let saved=null;try{saved=localStorage.getItem('dg-v4-theme');}catch(error){}
      this.set(saved||(matchMedia('(prefers-color-scheme:light)').matches?'light':'dark'));
      this.button.addEventListener('click',()=>this.set(document.documentElement.dataset.theme==='dark'?'light':'dark'));
    }
    set(theme){
      document.documentElement.dataset.theme=theme;
      this.button.textContent=theme==='dark'?'☼':'☾';
      this.button.setAttribute('aria-label',theme==='dark'?'Use light theme':'Use dark theme');
      try{localStorage.setItem('dg-v4-theme',theme);}catch(error){}
    }
  }

  class TableAccessibility{
    constructor(){
      for(const table of document.querySelectorAll('.weapon-table[role="table"]')){
        const rows=[...table.querySelectorAll('.weapon-row')];
        table.setAttribute('aria-colcount','7');table.setAttribute('aria-rowcount',String(rows.length));
        rows.forEach((row,rowIndex)=>{row.setAttribute('role','row');[...row.children].forEach((cell,columnIndex)=>cell.setAttribute('role',rowIndex===0?'columnheader':columnIndex===0?'rowheader':'cell'));});
      }
    }
  }

  window.DGTheme=ThemeController;
  window.DGTableAccessibility=TableAccessibility;
}());
