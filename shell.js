/* Pallet Flow: menus, save slots, settings, tutorial, demo limits, crash guard. */
const PF={version:'0.6.0',demo:/[?&]demo=1/.test(location.search),desktop:!!window.pfDesktop,demoDays:14,wishlist:'https://store.steampowered.com/'};
let SET={vol:.6,mute:false,scale:1,blur:true,tips:true,tutDone:false,seen:{}};try{Object.assign(SET,JSON.parse(localStorage.getItem('pf-settings')||'{}'))}catch(e){}
let menuOpen=false,inGame=false,mscreen='main',ng=null,coachKey='';
function saveSet(){try{localStorage.setItem('pf-settings',JSON.stringify(SET))}catch(e){}document.documentElement.style.setProperty('--ui',SET.scale)}
const slots=()=>[0,1,2].map(readSlot),latest=()=>{let b=-1,t=0;slots().forEach((o,i)=>{if(o&&o.meta.ts>t){t=o.meta.ts;b=i}});return b};
function startAttract(){attract=true;inGame=false;newGame('std',{n:'Pallet Flow',col:LIVERY[0]});[2,3,5,6,7].forEach(i=>G.stores[i].on=true);newTruck('semi',0);newTruck('semi',0);newTruck('r16',0);
  Object.assign(G.deps[0],{fk:6,docks:4,order:330,wh:180,sup:true});G.tr=true;G.maxDrops=3;G.tut=-1;hideModal();begin();speed=4;tab='team';render();setTimeout(()=>view('map'),60)}
function openMenu(screen){mscreen=screen||'main';menuOpen=true;$('#menu').classList.add('show');drawMenu()}
function closeMenu(){menuOpen=false;$('#menu').classList.remove('show')}
function slotCard(o,i,act){return o?`<div class="card"><div><b>${o.meta.co}</b><span>Slot ${i+1} · Day ${o.meta.day} · ${money(o.meta.net)} net worth · ${SCEN[o.meta.sc][0]}<br>Saved ${new Date(o.meta.ts).toLocaleString()}</span></div><div style="display:flex;gap:6px">${act}</div></div>`:`<div class="card"><div><b>Slot ${i+1}</b><span>Empty</span></div></div>`}
function drawMenu(){const back=`<button class="wide" data-act="mmgo:${inGame?'close':'main'}" style="margin-top:14px">← Back</button>`;let h='';
  if(mscreen==='main'){const l=latest(),o=l>=0&&readSlot(l);
    h=`<small class="eb">Abstract Projects${PF.demo?' · Demo':''}</small><h1>Pallet<br><i>Flow</i></h1><div class="sub">Depot Manager</div><div class="mmbtns">
    ${o?`<button class="pri" data-act="slotload:${l}">Continue<small>${o.meta.co} · day ${o.meta.day} · ${money(o.meta.net)}</small></button>`:''}
    <button ${o?'':'class="pri"'} data-act="mmgo:new">New game</button>${o?'<button data-act="mmgo:load">Load game</button>':''}<button data-act="mmgo:settings">Settings</button><button data-act="mmgo:help">How to play</button><button data-act="mmgo:credits">Credits</button>${PF.desktop?'<button data-act="quitapp">Quit</button>':''}</div>
    <div class="mmver">Version ${PF.version}${PF.demo?' demo: one depot, '+PF.demoDays+' days':''}</div>`}
  else if(mscreen==='new'){const sl=slots();if(!ng)ng={n:'Caselka Freight',col:LIVERY[0],sc:'std',slot:Math.max(0,sl.findIndex(o=>!o)),tut:!SET.tutDone};const inp=$('#ngName');if(inp)ng.n=inp.value;
    h=`<h2>New game</h2><p>Name your company and pick a livery. It goes on your depots and trucks.</p><input type="text" id="ngName" maxlength="24" value="${ng.n.replace(/"/g,'')}">
    <div class="seg" style="margin:8px 0 6px">${LIVERY.map((c,i)=>`<button data-act="ngliv:${i}" aria-label="Livery ${i+1}" style="background:${c};min-height:36px;outline:${c===ng.col?'3px solid #ffd200':'none'};outline-offset:1px"></button>`).join('')}</div>
    <h3>Scenario</h3>${Object.entries(SCEN).map(([k,s])=>{const lock=PF.demo&&k!=='std';return`<div class="card ${ng.sc===k?'sel':''}"><div><b>${s[0]}${lock?' 🔒':''}</b><span>${lock?'In the full game.':s[1]}</span></div><button data-act="ngsc:${k}" ${lock?'disabled':''} class="${ng.sc===k?'on':''}">${ng.sc===k?'Chosen':'Choose'}</button></div>`}).join('')}
    <h3>Save slot</h3><div class="seg">${sl.map((o,i)=>`<button data-act="ngslot:${i}" class="${ng.slot===i?'on':''}">Slot ${i+1}<small>${o?'overwrites '+o.meta.co:'empty'}</small></button>`).join('')}</div>
    <label class="ck"><input type="checkbox" id="ngTut" ${ng.tut?'checked':''}> Guided first day (recommended for a first game)</label>
    <div class="mmbtns"><button class="pri" data-act="ngstart">Open the depot</button></div>${back}`}
  else if(mscreen==='load'){h=`<h2>Load game</h2>`+slots().map((o,i)=>slotCard(o,i,`<button data-act="slotload:${i}" class="pri">Load</button><button data-act="slotdel:${i}">Delete</button>`)).join('')+`<p>The game saves at the end of every day.</p>${back}`}
  else if(mscreen==='settings'){h=`<h2>Settings</h2><h3>Sound</h3><input type="range" id="setVol" min="0" max="1" step="0.05" value="${SET.vol}" aria-label="Volume"><label class="ck"><input type="checkbox" data-set="mute" ${SET.mute?'checked':''}> Mute all sound</label>
    <h3>Text size</h3>${seg('setscale',[[.9,'Small'],[1,'Normal'],[1.15,'Large'],[1.3,'Extra large']],SET.scale)}
    <h3>Play</h3><label class="ck"><input type="checkbox" data-set="blur" ${SET.blur?'checked':''}> Pause when the window loses focus</label><label class="ck"><input type="checkbox" data-set="tips" ${SET.tips?'checked':''}> Show tips as new things happen</label>
    <div class="mmbtns"><button data-act="setfs">Toggle fullscreen<small>Also F11 on desktop</small></button><button data-act="settut">Replay the guided first day<small>Turns it on for your next new game</small></button></div>${back}`}
  else if(mscreen==='help'){h=`<h2>How to play</h2><p>Stores pay you for every pallet you deliver and fine you for empty shelves and late trucks. Suppliers truck stock into your depot; your forklifts unload it and load your own trucks; your drivers run it out to stores.</p>
    <h3>Each day</h3><p>The day starts paused. Check the weather, traffic, diesel price and promos, set your inbound order and plan runs if you want to, then press a speed. At close you get a profit and loss sheet and tomorrow's forecast. The game saves then.</p>
    <h3>The tabs</h3><p><b>Depot</b>: shift hours, stock, inbound orders, chilled goods, forklift crew. <b>Fleet</b>: trucks, drivers, diesel, dispatch rules. <b>Stores</b>: contracts, receiving hours, goodwill. <b>Runs</b>: plan board and the live runsheet. <b>Invest</b>: upgrades, loans, depots. <b>Ledger</b>: money and the numbers behind it.</p>
    <h3>Controls</h3><p>Drag the map to move it, scroll or pinch to zoom. Space pauses, 1 to 4 set the speed, Esc opens the menu.</p>
    <h3>If things go wrong</h3><p>The bar above the tabs names the bottleneck. Go more than $5,000 overdrawn at close and the bank shuts you down.</p>${back}`}
  else if(mscreen==='credits'){h=`<h2>Credits</h2><p>Pallet Flow: Depot Manager, version ${PF.version}.</p><p>Design: Caselka. Code written with Claude Code. No third-party art, fonts, music or libraries are used; everything on screen is drawn by the game.</p><p>All company, depot, store and driver names are invented. Any resemblance to real businesses or people is coincidental.</p>${back}`}
  $('#menu').innerHTML='<div class="mm">'+h+'</div>'}
function loadSlot(n){const o=readSlot(n);if(!o)return;attract=false;inGame=true;slot=n;G=o.g;if(G.tut==null)G.tut=-1;sel=0;tab='team';closeMenu();hideModal();begin();setTimeout(()=>view('depot'),60)}
function pauseMenu(){if(!inGame||menuOpen)return;if(speed){lastSpeed=speed;speed=0;render()}showModal(`<h2>Paused</h2><p>${G.co.n} · day ${G.day0}. The game saves at the end of each day.</p><button class="pri go" data-act="continue">Resume</button><button class="go" data-act="mmgo:settings">Settings</button><button class="go" data-act="mmgo:help">How to play</button><button class="go" data-act="quitmenu">Quit to main menu</button><p style="margin-top:10px">Quitting now returns this save to the start of day ${G.day0}.</p>`)}
function shellEsc(){if(menuOpen){if(inGame)closeMenu();else if(mscreen!=='main')openMenu('main');return}if(modal){if($('#mbox h2')&&$('#mbox h2').textContent==='Paused')hideModal();return}pauseMenu()}
function nextBtn(){return PF.demo&&G.day>PF.demoDays?`<div class="offer"><b>That's the end of the demo.</b><p style="margin:4px 0 8px">You ran ${G.co.n} for ${PF.demoDays} days and finished on ${money(G.cash-G.loan)}. The full game adds two more depots, 20 more stores, the Christmas, fuel crisis and strike scenarios, and no day limit.</p><a href="${PF.wishlist}" target="_blank" rel="noopener"><button class="pri">Wishlist on Steam</button></a></div><button class="go" data-act="quitmenu">Back to the main menu</button>`:`<button class="pri go" data-act="next">Plan day ${G.day}</button>`}
function shellAct(a,p,p2,b){
  if(a==='mmgo'){if(p==='close'){closeMenu();return true}if(p==='main'&&inGame){closeMenu();return true}hideModal();if(inGame&&(p==='settings'||p==='help')){}openMenu(p);return true}
  if(a==='pause'){pauseMenu();return true}
  if(a==='quitmenu'){hideModal();startAttract();openMenu('main');return true}
  if(a==='quitapp'){if(window.pfDesktop)window.pfDesktop.quit();return true}
  if(a==='menu'||a==='restart'){if(a==='restart'&&!confirm('Leave this game and go to the main menu? Today\'s progress is not saved.'))return true;hideModal();startAttract();openMenu('new');return true}
  if(a==='snd'){SET.mute=!SET.mute;saveSet();render();return true}
  if(a==='buydep'&&PF.demo){say('More depots are in the full game.');return true}
  if(a==='ngliv'){ng.col=LIVERY[+p];drawMenu();return true}if(a==='ngsc'){ng.sc=p;drawMenu();return true}if(a==='ngslot'){ng.slot=+p;drawMenu();return true}
  if(a==='ngstart'){const inp=$('#ngName'),tut=$('#ngTut').checked;if(readSlot(ng.slot)&&!confirm('Overwrite the game in slot '+(ng.slot+1)+'?'))return true;attract=false;inGame=true;slot=ng.slot;newGame(ng.sc,{n:(inp.value.trim())||'Caselka Freight',col:ng.col});G.tut=tut?0:-1;ng=null;sel=0;tab='team';closeMenu();hideModal();save();begin();setTimeout(()=>view('depot'),60);return true}
  if(a==='slotload'){loadSlot(+p);return true}
  if(a==='slotdel'){if(confirm('Delete the game in slot '+(+p+1)+'? This can\'t be undone.')){try{localStorage.removeItem(slotKey(+p))}catch(e){}drawMenu()}return true}
  if(a==='setscale'){SET.scale=+p;saveSet();drawMenu();return true}
  if(a==='setfs'){if(window.pfDesktop)window.pfDesktop.fullscreen();else if(document.fullscreenElement)document.exitFullscreen();else if(document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{});return true}
  if(a==='settut'){SET.tutDone=false;saveSet();if(ng)ng.tut=true;b.querySelector('small').textContent='Done: it will be ticked on the New game screen';return true}
  if(a==='tutnext'){G.tut++;coachKey='';tutTick();return true}
  if(a==='tutskip'){G.tut=-1;SET.tutDone=true;saveSet();coachKey='';tutTick();return true}
  if(a==='tipok'){SET.seen[p]=1;saveSet();coachKey='';tutTick();return true}
  if(a==='crashreload'){location.reload();return true}
  return menuOpen}
document.addEventListener('change',e=>{const k=e.target.dataset&&e.target.dataset.set;if(k){SET[k]=e.target.checked;saveSet()}});
document.addEventListener('input',e=>{if(e.target.id==='setVol'){SET.vol=+e.target.value;saveSet();sfx('coin')}});
addEventListener('blur',()=>{if(SET.blur&&inGame&&!menuOpen&&speed){lastSpeed=speed;speed=0;render()}});

/* ---------- guided first day and tips ---------- */
const TUT=[
 {t:'Welcome to the depot',b:'This is Westgate DC. Suppliers bring pallets in, your forklifts put them away and load your trucks, and your drivers take them to two stores. You are paid per pallet delivered.',next:1},
 {t:'Read the day',b:'The Depot tab opens on today\'s conditions: weather, traffic, the diesel price. Under it are your shift hours, stock and inbound order. Nothing needs changing yet.',sel:'[data-act="tab:team"]',next:1},
 {t:'Open the gates',b:'The day starts paused so you can plan. Press 2× to start the clock. Space pauses, and the map drags and zooms.',sel:'[data-act="speed:2"]',done:()=>speed>0},
 {t:'Watch the first load go',b:'A truck backs onto a dock, the light goes green and forklifts load it. Grey trucks are suppliers being unloaded. Wait for your first truck to leave.',sel:'#c',done:()=>S.d.loads>=1},
 {t:'The runsheet',b:'Every load is logged. Open the Runs tab to see the truck, its drops, each store\'s receiving window and arrival times.',sel:'[data-act="tab:runs"]',done:()=>tab==='runs'},
 {t:'Your stores',b:'Open the Stores tab. Stock is what\'s on the shelf. Goodwill falls when a shopper finds it empty, and a rival carrier will take a store whose goodwill gets low.',sel:'[data-act="tab:stores"]',done:()=>tab==='stores'},
 {t:'Trucks and drivers',b:'Open the Fleet tab. Each truck has a named driver with a start time and a 12 hour limit. Your second driver starts at 10:00 to cover the afternoon.',sel:'[data-act="tab:fleet"]',done:()=>tab==='fleet'},
 {t:'Run out the day',b:'Press 8× and let the day finish. Watch the bar above the tabs: it names the bottleneck whenever something is holding you up. Stores keep trading until 9pm.',sel:'[data-act="speed:8"]',done:()=>G.day0>1},
 {t:'Day two: read the money',b:'Open the Ledger tab. Cost per pallet is the number to drive down. Your income per pallet is about $50, so anything under that is profit.',sel:'[data-act="tab:ledger"]',done:()=>tab==='ledger'},
 {t:'You\'re running it now',b:'Keep shelves 90% stocked for a day and you\'ll be invited to tender for a third store. Reach $25,000 net worth for Bronze. Weekends are busy: a subcontractor from the Fleet tab helps.',next:1,last:1}];
const TIPS=[
 ['empty','A shelf is empty',()=>S.d.lost>0,'A shopper just found an empty shelf: a $15 penalty and a little goodwill gone. The bar above the tabs says what is holding deliveries up.'],
 ['det','A supplier is waiting',()=>S.d.det>0,'A supplier truck has waited more than 2 hours and is now charging you. Free a dock, add forklifts, or switch forklift priority to Inflow first in the Depot tab.'],
 ['low','Cash is getting low',()=>G.cash<2500&&S.clock>S.t0+60,'You are under $2,500. The Invest tab has a bank loan at 0.8% a day. More than $5,000 overdrawn at close ends the game.'],
 ['late','A late delivery',()=>S.d.late>0,'A truck arrived after a store stopped receiving and was fined. A transport supervisor (Fleet tab) plans runs around receiving hours.'],
 ['ot','Overtime',()=>S.d.otH>3,'Drivers are past 10 hours and on time and a half. Stagger start times in the Fleet tab so no one covers the whole day.'],
 ['bat','Flat battery',()=>S.deps.some(d=>d.forks.some(f=>f.state==='charge')),'A forklift is on charge for 45 minutes. Spare batteries in the Invest tab cut that to 6.']];
function tutTick(){const el=$('#coach');if(!el)return;document.querySelectorAll('.hl').forEach(e=>e.classList.remove('hl'));if(!inGame||attract){el.hidden=true;return}
  if(G.tut>=0&&G.tut<TUT.length){const s=TUT[G.tut];if(s.done&&s.done()){G.tut++;coachKey='';if(G.tut>=TUT.length){G.tut=-1;SET.tutDone=true;saveSet()}return tutTick()}
    const key='t'+G.tut;if(key!==coachKey){coachKey=key;el.innerHTML=`<small>Guided first day · ${G.tut+1} of ${TUT.length}</small><b>${s.t}</b>${s.b}<div class="cb">${s.next?`<button class="pri" data-act="${s.last?'tutskip':'tutnext'}">${s.last?'Finish':'Next'}</button>`:''}${s.last?'':'<button data-act="tutskip">Skip the guide</button>'}</div>`}
    el.hidden=false;if(s.sel){const t=document.querySelector(s.sel);if(t)t.classList.add('hl')}return}
  if(SET.tips&&!S.over){const tp=TIPS.find(t=>!SET.seen[t[0]]&&t[2]());if(tp){const key='p'+tp[0];if(key!==coachKey){coachKey=key;el.innerHTML=`<small>Tip</small><b>${tp[1]}</b>${tp[3]}<div class="cb"><button class="pri" data-act="tipok:${tp[0]}">Got it</button></div>`}el.hidden=false;return}}
  el.hidden=true;coachKey=''}

/* ---------- crash guard ---------- */
let crashed=false;
function crash(msg){if(crashed)return;crashed=true;speed=0;const d=document.createElement('div');d.className='modal show';d.style.zIndex=50;
  d.innerHTML=`<div class="box"><h2>Something went wrong</h2><p>The game hit an error and has paused. Your save from the end of the last day is safe.</p><p style="font-family:monospace;font-size:12px;word-break:break-word">${String(msg).replace(/</g,'&lt;')}</p><button class="pri go" data-act="crashreload">Reload the game</button></div>`;document.body.appendChild(d)}
const ours=t=>/(game|shell)\.js/.test(String(t||''));
addEventListener('error',e=>{if(ours(e.filename)||ours(e.error&&e.error.stack))crash((e.message||'Error')+' ('+(e.filename||'').split('/').pop()+':'+e.lineno+')')});
addEventListener('unhandledrejection',e=>{if(ours(e.reason&&e.reason.stack))crash('Promise: '+(e.reason.message||e.reason))});

/* ---------- boot ---------- */
(function(){saveSet();try{const old=JSON.parse(localStorage.getItem(KEY));if(old&&old.v===5&&!readSlot(0)){G=old;slot=0;save();localStorage.removeItem(KEY)}}catch(e){}
  startAttract();openMenu('main')})();
