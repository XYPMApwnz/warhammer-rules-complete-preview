import {applicationRouteURL} from './routes.mjs';

const asset=name=>new URL(`../../../assets/${name}`,import.meta.url).href;
const compare=(a,b)=>(a.order??100)-(b.order??100)||a.title.localeCompare(b.title,'en');

/** Presentation metadata only: no payload, roster or factual registry reads. */
export function groupHomeBooks(entries) {
  const shelves=new Map();
  for(const book of entries) {
    const presentation=book.home||{};
    const shelf=presentation.shelf||{id:'army-books',title:'Army Books',subtitle:'Army rules and datasheets',order:100};
    if(!shelves.has(shelf.id))shelves.set(shelf.id,{...shelf,books:[]});
    shelves.get(shelf.id).books.push({...presentation,id:book.id,title:book.title});
  }
  return [...shelves.values()].sort(compare).map(shelf=>({...shelf,books:shelf.books.sort(compare)}));
}

/** V1 brand assets inside the existing primary header; navigation stays shell-owned. */
export function createHomeBranding(document,homeURL) {
  const group=document.createElement('div');group.className='v2-primary-branding';
  const brand=document.createElement('a');brand.className='v2-primary-brand';brand.href=homeURL;
  const logo=document.createElement('img');logo.src=asset('warhammer-40000-logo-optimized.png');logo.alt='Warhammer 40,000';
  brand.append(logo);
  const gw=document.createElement('a');gw.className='v2-primary-publisher';gw.href='https://www.warhammer.com/';gw.target='_blank';gw.rel='noopener noreferrer';
  const publisher=document.createElement('img');publisher.src=asset('games-workshop-logo.png');publisher.alt='Games Workshop';gw.append(publisher);
  group.append(brand,gw);return group;
}

/** Existing V1 Home DOM composition, with destinations supplied by V2 routes. */
export function createHomePresenter({document,registry,entryURL}) {
  const el=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
  const routeURL=route=>applicationRouteURL(entryURL,route);
  const glossary={destination:'GLOSSARY'};
  const tools=[
    {id:'core-rules',title:'Core Rules',label:'Primary rules',cover:asset('core-rules-cover-fallback.jpg'),coverAlt:'Warhammer 40,000 Core Rules cover',
      sources:`${asset('core-rules-cover-480.webp')} 480w, ${asset('core-rules-cover-800.webp')} 800w`,route:{destination:'CORE_RULES',registryId:'core-rules'}},
    {id:'roster',title:'Roster',label:'New Recruit roster tools',coverKind:'roster',markLabel:'Army builder',markTitle:'Roster',accent:'#d2963e',route:{destination:'ROSTER'}},
    {id:'glossary',title:'Mega Glossary',label:'Shared terminology',coverKind:'reference',markLabel:'Rules reference',markTitle:'Mega Glossary',accent:'#756849',route:glossary}
  ];
  function link(className,route,text) {
    const node=el('a',className,text);node.href=routeURL(route);node.dataset.v2ShellLink='';return node;
  }
  function bookCard(book,route) {
    const card=link('book',route);if(book.id&&!book.route)card.dataset.v2Book=book.id;
    if(book.accent)card.style.setProperty('--home-book-accent',book.accent);
    const cover=el('span','cover');
    if(book.cover) {
      const picture=el('picture');
      if(book.sources){const source=el('source');source.type='image/webp';source.srcset=book.sources;source.sizes='(max-width: 800px) 76vw, 25vw';picture.append(source);}
      const image=el('img');image.src=book.cover;image.alt=book.coverAlt||`${book.title} cover`;image.width=480;image.height=600;image.decoding='async';
      if(book.coverFit)image.style.objectFit=book.coverFit;
      picture.append(image);cover.append(picture);
    } else {
      card.dataset.homeCover=book.coverKind||'reference';
      const mark=el('span','cover-mark');mark.append(el('small','',book.markLabel||'Army Book'),el('strong','',book.markTitle||book.title));cover.append(mark);
    }
    const caption=el('span','book-copy');caption.append(el('small','',book.label||'Army Book'),el('strong','',book.title));card.append(cover,caption);return card;
  }
  function shelfNode(shelf) {
    const section=el('section','library-shelf');section.dataset.homeShelf=shelf.id;
    const heading=el('div','shelf-head'),title=el('h3','',shelf.title);title.id=`home-shelf-${shelf.id}`;section.setAttribute('aria-labelledby',title.id);
    heading.append(title);if(shelf.subtitle)heading.append(el('span','',shelf.subtitle));
    const row=el('div','book-row');
    for(const book of shelf.books)row.append(bookCard(book,book.route||{destination:'ARMY_BOOK',bookId:book.id,registryId:book.id}));
    section.append(heading,row);return section;
  }
  function render(route) {
    const booksOnly=route.sectionId==='army-books',main=el('main','v2-library-home');main.tabIndex=-1;
    document.title=booksOnly?'Army Books · Warhammer 40,000':'Warhammer 40,000 Rules Library';
    const hero=el('section','hero');hero.append(el('p','eyebrow','Library // 11th Edition'));
    const title=el('h1');
    if(booksOnly)title.textContent='Army Books';else title.append(document.createTextNode('In the grim darkness of the far future, there is only '),el('span','','KURILKA WAHAEBA'),document.createTextNode('.'));
    hero.append(title,el('p','hero-copy','A unified reference for Core Rules, Army Books, shared terminology and roster-specific game guides.'));
    const library=el('section','library');library.setAttribute('aria-labelledby','home-library-title');
    const header=el('div','section-head'),libraryTitle=el('h2','','Library');libraryTitle.id='home-library-title';header.append(libraryTitle);library.append(header);
    const shelves=el('div','library-shelves');
    if(!booksOnly)shelves.append(shelfNode({id:'rules-tools',title:'Rules & Tools',subtitle:'Core reference and army builder',books:tools}));
    for(const shelf of groupHomeBooks(registry.entries))shelves.append(shelfNode(shelf));library.append(shelves);
    main.append(hero,library);
    if(!booksOnly) {
      const support=el('section','support');support.setAttribute('aria-labelledby','home-support-title');
      const supportHead=el('div','section-head'),supportTitle=el('h2','','Project information');supportTitle.id='home-support-title';supportHead.append(supportTitle,el('span','','Supporting material'));
      const grid=el('div','support-grid'),sources=el('article','support-card'),terms=el('article','support-card');
      sources.append(el('h3','','Sources & updates'));const text=el('p','','Official Games Workshop publications are the primary source. '),downloads=el('a','','Open official downloads ↗');
      downloads.href='https://www.warhammer-community.com/en-gb/downloads/warhammer-40000/';downloads.target='_blank';downloads.rel='noopener noreferrer';text.append(downloads);sources.append(text);
      terms.append(el('h3','','Mega Glossary'));const terminology=el('p','','The shared terminology service used by every rules space. ');terminology.append(link('',glossary,'Search the glossary →'));terms.append(terminology);
      grid.append(sources,terms);support.append(supportHead,grid);main.append(support);
    }
    const footer=el('footer','footer');footer.append(el('span','','WH40K Rules Library'),el('span','','Warhammer 40,000 and related marks belong to Games Workshop.'));main.append(footer);
    return main;
  }
  return Object.freeze({render});
}
