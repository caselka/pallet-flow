/* Pallet Flow: Depot Manager. No libraries. */
const $=s=>document.querySelector(s),money=n=>(n<0?'−$':'$')+Math.abs(Math.round(n)).toLocaleString('en-AU'),num=n=>Math.round(n).toLocaleString('en-AU');
const BW=800,NB=3,WW=BW*NB,WH=1000,OX=140,DW=520,DOOR_Y=150,HOLD_Y=260,OUT_Y=304,BACK_Y=320,RACK_Y=44,CROSS=[312,560,800],ND=6,NH=7,TRADE0=360,TRADE1=1260;
const trunkX=b=>b*BW+400,dockX=(b,j)=>b*BW+OX+60+80*j,holdX=(b,k)=>b*BW+OX+20+80*k,gateX=b=>b*BW+70;
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],KEY='palletflow-game-v5';
const FONT='"Avenir Next Condensed","Roboto Condensed","Arial Narrow",system-ui,sans-serif';
const TYPES={van:{n:'Van',cap:4,tg:1,lease:90,l:10,run:.16,kmh:55,len:30,svc:250},r10:{n:'Rigid 10 TG',cap:10,tg:1,lease:150,l:20,run:.3,kmh:50,len:40,svc:350,subkm:1.6},
  r16:{n:'Rigid 16',cap:16,lease:200,l:26,run:.42,kmh:50,len:52,svc:450},semi:{n:'Semi 24',cap:24,lease:290,l:38,run:.6,kmh:45,len:66,svc:650,subkm:2.5},sup:{n:'Supplier',cap:26,len:66}};
const CAB={van:'#f5c400',r10:'#1f9e8a',r16:'#1f5fa8',semi:'#c8281e',sup:'#5c6066'},LIVERY=['#1f5fa8','#c8281e','#1e8e4e','#6a3fa0','#e8731c','#1d1f21'];
const DEPN=['Westgate DC','Midway DC','Eastport DC'],DEPCOST=[0,60000,150000],RIVALS=['Redline Freight','Kestrel Haulage','Ironbark Logistics'],SUBURB=[['Westgate','Sunnybank','The Flats'],['Midway','Bellfield','Quarry Hill'],['Eastport','Saltwater','Lighthouse']];
const NAMES=[['Corner Mart','Greenfields','Harbour St','Ridgeway','Lakeside','Far Coast','Millbrook','Port Albany','Summit','Kingsford'],
  ['Bell Park','Riverton','Oakhurst','Stonebridge','Wattle Grove','Maple Rd','Ferndale','Castle Point','Dunmore','Highfield'],
  ['Seaview','Marlow','Brightwater','Elmwood','Kirra Bay','Redcliff','Ashby','Northgate','Pine Hill','Sandown']];
const FIRST=['Sam','Jo','Riley','Alex','Casey','Morgan','Jamie','Taylor','Robin','Charlie','Drew','Frankie','Jesse','Kim','Lee','Max','Nic','Pat','Quinn','Ray','Sky','Toni','Vic','Ash','Bailey','Cam','Dale','Eden','Flynn','Gray'];
// street, x, km, pallets/h, $/pallet, shelf cap, opens, closes, tailgate only, strict window
const BASE=[[0,110,6,3,49,18,300,1200,0,0],[0,690,12,4,55,24,420,1200,0,0],[1,220,22,5,56,28,300,1200,1,0],[1,580,30,5,58,30,480,1140,0,0],[1,80,36,5,60,30,300,900,1,0],
  [1,720,44,6,64,34,300,1200,0,0],[2,270,52,6,68,36,420,1080,0,0],[2,540,60,7,72,40,300,1200,0,0],[2,100,70,6,78,36,540,960,0,1],[2,710,150,4,112,60,300,1260,0,0]];
const DEFS=[];for(let b=0;b<NB;b++)BASE.forEach((a,k)=>DEFS.push({n:NAMES[b][k],b,k,st:a[0],x:b*BW+a[1],y:CROSS[a[0]]+70,km:a[2],dem:+(a[3]*(1+.15*b)).toFixed(1),rate:Math.round(a[4]*(1+.08*b)),cap:a[5],open:a[6],close:a[7],tg:a[8],strict:a[9],reg:k===9}));
const PAY=[{n:'Budget',w:31,sp:.82},{n:'Standard',w:36,sp:1},{n:'Premium',w:43,sp:1.22}];
const UPS={lev:['Dock levellers',4000,'Forklifts work 40% quicker at the dock door, at every depot.'],route:['Route planning software',6000,'Every leg is 12% shorter: less time, less fuel.'],
  train:['Driver training',3500,'Half as many breakdowns.'],back:['Store back rooms',8000,'Every store can hold 25% more stock.'],mess:['Break rooms and canteens',2500,'Crew morale recovers faster.'],tank:['Bigger fuel tank',4000,'The fuel tank holds 8,000 L instead of 2,000 L.'],
  batt:['Spare forklift batteries',3500,'A flat forklift swaps batteries in 6 minutes instead of recharging for 45.'],levy:['Fuel levy clause',5000,'When diesel is dearer than $1.85, stores pay a levy that covers part of the extra.']};
const TIERS=[[25000,'Bronze'],[100000,'Silver'],[250000,'Gold'],[1000000,'Platinum']];
const ACH=[['profit','In the black','Finish a day in profit'],['full','Never out','A day with shelves 100% stocked'],['ten','Ten up','Hold 10 contracts'],['dep2','Second site','Open a second depot'],['drops','Century','100 drops in one day'],
  ['ontime','Clockwork','A full week with no late arrivals'],['cold','Cold chain','Deliver 40 chilled pallets in a day'],['reg','Long haul','Hold a regional contract'],['gold','Gold standard','Reach $250,000 net worth'],['all','Statewide','Hold all 30 contracts']];
const SCEN={std:['Standard','Build a network from one depot. No time limit.'],xmas:['Christmas week','Shoppers buy 50% more, every day. You start with $25,000.'],fuel:['Fuel crisis','Diesel never drops below $2.80 a litre.'],strike:['Driver strike','Each morning, one driver in three does not turn up.']};
const DRIVER=40,HIRE=300,DOCK=6000,RACK=5000,COOL=6000,OVER=450,OVER_DOCK=120,LOST=15,STOR=1.2,RUSH=250,XFER=120,LOAD=26,LOAN_STEP=5000,LOAN_MAX=60000,LOAN_RATE=.008,SUPW=48,MAXORD=900,CALLOUT=90,AGENCY=52,BH=9,TOLL=.22,FRIDGE=45,SPOIL=45,
  BUY={van:5000,r10:8500,r16:11500,semi:17000};
let G,S,speed=0,lastSpeed=2,tab='team',sel=0,modal=false,draft={seal:360,stops:[]};
const expo=m=>-Math.log(1-Math.random())*m,hhmm=c=>String(Math.floor(c/60)%24).padStart(2,'0')+':'+String(Math.floor(c%60)).padStart(2,'0'),hr=c=>(c/60)%1?hhmm(c):String(c/60);
const hourMul=c=>{const h=c/60;return h<6?0:h<9?.7:h<12?1:h<14?1.4:h<16?1:h<19?1.3:h<21?.8:0},DAYU=15.4;
const pm=c=>c<360?1.3:c>=1080?1.2:1,traffic=c=>{const h=c/60;return h<5?.85:(h>=7&&h<9)||(h>=16&&h<18.5)?1.35:1};
const cap=i=>Math.round(DEFS[i].cap*(G.up.back?1.25:1)),ccap=i=>Math.round(cap(i)*.3),whCap=b=>200+100*G.deps[b].rack,coldCap=b=>40*G.deps[b].cool,tankCap=()=>G.up.tank?8000:2000,price=()=>1.85*G.cond.fuel,perKm=T=>T.l/100*price()+T.run,kmOf=k=>k*(G.up.route?.88:1);
const wxMul=()=>(G.cond.wx==='rain'?.9:G.cond.wx==='heat'?1.25:1)*(G.sc==='xmas'?1.5:1);
const payOf=i=>DEFS[i].rate*G.stores[i].rm*(G.up.levy?1+Math.max(0,G.cond.fuel-1)*.12:1),resale=o=>BUY[o.type]*.5*o.cond/100;
const rate=i=>DEFS[i].dem*G.stores[i].dm*hourMul(S.clock)*S.dayMul*(G.cond.promo===i?1.8:1)*wxMul(),chill=i=>G.deps[DEFS[i].b].chill;
const mm=()=>.9+.2*G.morale/100,eff=b=>{const n=S.deps[b].forks.length;return G.deps[b].sup?1.1:n>4?Math.max(.6,1-.07*(n-4)):1};
const owned=()=>G.deps.map((g,b)=>g.own?b:-1).filter(b=>b>=0),onStores=b=>G.stores.map((s,i)=>s.on&&(b==null||DEFS[i].b===b)?i:-1).filter(i=>i>=0);
const stars=o=>'★'.repeat(Math.min(3,Math.floor(o.drv.days/4)))||'new',skill=o=>o.drv?Math.min(3,Math.floor(o.drv.days/4)):0;
function charge(k,a){G.cash-=a;S.d[k]+=a}
function say(m,bad){$('#toast').textContent=m;S.log.unshift(clockStr()+' '+m);if(S.log.length>40)S.log.pop();if(bad)sfx('bad')}
const clockStr=()=>hhmm(Math.min(S.t1,S.clock));
let slot=0,attract=false;const slotKey=n=>'pf5-slot-'+n;
function save(){if(attract)return;try{localStorage.setItem(slotKey(slot),JSON.stringify({meta:{co:G.co.n,col:G.co.col,day:G.day,net:G.cash-G.loan,sc:G.sc,ts:Date.now()},g:G}))}catch(e){}}
function readSlot(n){try{const o=JSON.parse(localStorage.getItem(slotKey(n)));if(o&&o.g&&o.g.v===5&&o.g.stores.length===DEFS.length)return o}catch(e){}return null}
let actx,lastCoin=0;
function sfx(k){if(typeof SET==='undefined'||SET.mute||attract||!SET.vol)return;try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();const now=performance.now();if(k==='coin'){if(now-lastCoin<160)return;lastCoin=now}
  const o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime,f={coin:[880,1320,.05,.12],bad:[220,140,.09,.3],click:[520,520,.03,.05],win:[660,990,.08,.5]}[k];o.type=k==='bad'?'sawtooth':'triangle';o.frequency.setValueAtTime(f[0],t);o.frequency.exponentialRampToValueAtTime(f[1],t+f[3]);
  g.gain.setValueAtTime(f[2]*SET.vol*1.7,t);g.gain.exponentialRampToValueAtTime(.0001,t+f[3]);o.connect(g).connect(actx.destination);o.start(t);o.stop(t+f[3]+.02)}catch(e){}}
function genCond(prev){const r=Math.random(),on=onStores(),pick=()=>on[Math.floor(Math.random()*on.length)];
  return{wx:r<.18?'rain':r<.26?'heat':'fine',promo:Math.random()<.3?pick():-1,road:Math.random()<.14?pick():-1,fuel:Math.max(G.sc==='fuel'?1.52:.75,Math.min(G.sc==='fuel'?2.1:1.6,prev.fuel+(Math.random()-.5)*.14+((G.sc==='fuel'?1.7:1)-prev.fuel)*.08+(Math.random()<.07?.25:0)))}}
function condList(c,day){const a=[],dow=(day-1)%7;a.push(c.wx==='rain'?'🌧 Rain: trucks 25% slower, slightly fewer shoppers':c.wx==='heat'?'☀️ Heatwave: 25% more shoppers':'⛅ Fine weather');
  if(G.sc==='xmas')a.push('🎄 Christmas rush: 50% more shoppers');if(dow>=5)a.push('🛒 Weekend: 35% more shoppers');if(c.promo>=0)a.push('📣 Promo at '+DEFS[c.promo].n+': demand up 80%');if(c.road>=0)a.push('🚧 Roadworks near '+DEFS[c.road].n+': legs there 40% longer');
  a.push('🚦 Peak traffic 7 to 9am and 4 to 6:30pm: every leg 35% slower. Before 5am the roads are clear.');
  const y=G.fuelHist[G.fuelHist.length-2];a.push('⛽ Diesel $'+(1.85*c.fuel).toFixed(2)+'/L'+(y?(c.fuel>y+.005?' ▲ up from $':c.fuel<y-.005?' ▼ down from $':', same as $')+(1.85*y).toFixed(2):''));return a}
const newDep=own=>({own,fk:own?3:2,docks:2,wh:own?120:80,order:own?110:0,rack:0,sup:false,inMode:'spread',fkMode:'auto',fkDock:[],s0:360,s1:1080,cool:0,cold:0,corder:0,chill:false});
function newDriver(){const used=new Set(G.fleet.map(o=>o.drv&&o.drv.n));let n;do{n=FIRST[Math.floor(Math.random()*FIRST.length)]+' '+String.fromCharCode(65+Math.floor(Math.random()*26))+'.'}while(used.has(n));return{n,start:360,days:0,tired:false}}
function newTruck(type,dep,own){const o={id:G.nid++,type,cond:100,route:-1,dep,own:!!own,reefer:false,plan:[]};o.drv=newDriver();o.drv.start=G.deps[dep].s0;G.fleet.push(o);return o}
function newGame(sc,co){G={v:5,sc:sc||'std',co:co||{n:'Caselka Freight',col:LIVERY[0]},day:1,cash:sc==='xmas'?25000:10000,loan:0,pay:1,morale:70,minLoad:.5,maxDrops:2,auto:true,tank:500,fuelHist:[sc==='fuel'?1.6:1],fkPri:'bal',backhaul:false,tolls:false,up:{},tr:false,ach:{},lateWeek:0,
  deps:[newDep(true),newDep(false),newDep(false)],fleet:[],nid:1,stores:DEFS.map((d,i)=>({on:i<2,stock:Math.round(d.cap*.6),cstock:0,sat:70,rm:1,dm:1,wSold:0,wLost:0,wRev:0,lock:0})),hist:[],tier:0,cond:{wx:'fine',promo:-1,road:-1,fuel:sc==='fuel'?1.6:1}};newTruck('r16',0);newTruck('r10',0).drv.start=600;if(sc==='xmas'||sc==='strike'){newTruck('r16',0);G.deps[0].fk=4;G.deps[0].order=150}if(sc==='strike')G.cash=14000;sel=0}
function startDay(){const dow=(G.day-1)%7,ow=owned();
  S={clock:Math.min(...ow.map(b=>G.deps[b].s0)),over:false,trucks:[],runs:[],seq:0,log:[],dayMul:dow>=5?1.35:1,
    d:{rev:0,wF:0,wD:0,fuel:0,lease:0,over:0,pen:0,repair:0,other:0,stor:0,int:0,det:0,sub:0,toll:0,spoil:0,bh:0,km:0,deliv:0,cold:0,sold:0,lost:0,recv:0,litres:0,loads:0,drops:0,arr:0,late:0,wait:0,fill:0,dockB:0,dockT:0,otH:0},
    deps:G.deps.map((g,b)=>({b,docks:Array.from({length:ND},(_,j)=>({x:dockX(b,j),truck:null,on:g.own&&j<g.docks})),holds:Array.from({length:NH},(_,k)=>({x:holdX(b,k),truck:null})),forks:[],ordered:0,slot:0,cordered:0,cslot:0,whRes:0,whIn:0,cRes:0,cIn:0,sick:0,casual:0,fUtil:0,busyT:0,totT:0}))};
  S.t0=S.clock;S.t1=Math.max(TRADE1,...ow.map(b=>G.deps[b].s1));
  let sick=0;for(const b of ow){const g=G.deps[b],sd=S.deps[b];for(let i=0;i<g.fk;i++)if(G.morale<60&&Math.random()<(60-G.morale)/200*(g.sup?.5:1))sd.sick++;sd.sick=Math.min(sd.sick,g.fk-1);sick+=sd.sick;syncForks(b)}
  G.stores.forEach((s,i)=>{s.inbound=0;s.planned=0;s.cinb=0;s.cplan=0;s.flash=0;s.next=expo(30);s.cnext=expo(60)});
  let out=0;G.fleet.forEach(o=>{if(o.route>=0&&!G.stores[o.route].on)o.route=-1;o.plan=o.plan.filter(r=>(r.stops=r.stops.filter(i=>G.stores[i].on)).length);const t=addTruck(o);if(G.sc==='strike'&&Math.random()<.33&&S.trucks.some(u=>u!==t&&u.b===t.b&&!u.inb&&!u.noShow)){t.noShow=true;out++}});
  charge('lease',G.fleet.reduce((a,o)=>a+(o.own?0:TYPES[o.type].lease)+(o.reefer?FRIDGE:0),0));for(const b of ow)charge('over',OVER+OVER_DOCK*G.deps[b].docks);if(G.loan)charge('int',G.loan*LOAN_RATE);
  say((out?out+' driver'+(out>1?'s are':' is')+' on strike today. ':'')+(sick?sick+' operator'+(sick>1?'s':'')+' called in sick. ':'')+'Gates closed. Plan the day, then press a speed.');render()}
function freeHold(sd,n){return sd.holds.find(h=>!h.truck)||{x:holdX(sd.b,n%NH),truck:null}}
function addTruck(o,qty,cold){const T=TYPES[o.type],b=o.dep,sd=S.deps[b],h=freeHold(sd,S.trucks.length);
  const t={o,id:o.id,type:o.type,T,b,x:h.x,y:HOLD_Y,a:Math.PI/2,da:Math.PI/2,state:'wait',path:[],loaded:0,lc:0,reserved:0,rc:0,qty:0,qc:0,dock:null,hold:h,stops:[],si:0,timer:0,retire:false,sp:30,km:0,site:0,trips:0,drive:0,pq:(o.plan||[]).map(r=>({seal:r.seal,stops:r.stops.slice()})).sort((a,c)=>a.seal-c.seal)};h.truck=t;
  if(o.type==='sup'){t.inb=true;t.cold=!!cold;t.loaded=qty;t.x=gateX(b);t.y=-50;t.path=[[gateX(b),BACK_Y],[h.x,BACK_Y],[h.x,HOLD_Y]];t.state='back'}S.trucks.push(t);return t}
function supplier(q,b,cold){addTruck({id:'in',type:'sup',dep:b},q,cold)}
function dropJob(f){const t=f.truck,sd=S.deps[f.b],g=G.deps[f.b];if(!t)return;
  if(f.job==='out'){t.reserved--;if(f.cold)t.rc--;if(f.carry){if(f.cold)g.cold++;else g.wh++}else{if(f.cold)sd.cRes--;else sd.whRes--}}
  else{if(f.cold)sd.cIn--;else sd.whIn--;if(f.carry){if(f.cold)g.cold++;else g.wh++}else t.reserved--}f.truck=null}
function syncForks(b){const g=G.deps[b],sd=S.deps[b],n=g.own?Math.max(1,g.fk-sd.sick)+sd.casual:0,x0=b*BW+OX+28;
  while(sd.forks.length<n){const i=sd.forks.length;sd.forks.push({i,b,x:x0+i*22,y:118,hx:x0+i*22,a:-Math.PI/2,da:-Math.PI/2,state:'idle',path:[],truck:null,carry:false,timer:0,bat:100})}
  while(sd.forks.length>n)dropJob(sd.forks.pop())}
function buyDepot(b){const g=G.deps[b];g.own=true;S.deps[b].docks.forEach((d,j)=>d.on=j<g.docks);syncForks(b);charge('other',DEPCOST[b]);charge('over',OVER+OVER_DOCK*g.docks);S.t1=Math.max(S.t1,g.s1);
  [b*10,b*10+1].forEach(i=>{const s=G.stores[i];s.on=true;s.stock=Math.round(DEFS[i].cap*.5);s.sat=70});g.order=120;addTruck(newTruck('r16',b));charge('lease',TYPES.r16.lease);sel=b;view('depot');say(DEPN[b]+' is open with two launch contracts, 2 operators and a leased Rigid 16.')}

/* ---------- simulation ---------- */
function move(e,sp,dt){let d=sp*dt;while(d>0&&e.path.length){const p=e.path[0],dx=p[0]-e.x,dy=p[1]-e.y,L=Math.hypot(dx,dy);
    if(L>.01)e.a=Math.atan2(dy,dx)+(p[2]?Math.PI:0);
    if(L<=d){e.x=p[0];e.y=p[1];d-=L;e.path.shift()}else{e.x+=dx/L*d;e.y+=dy/L*d;d=0}}
  let df=e.a-e.da;df=Math.atan2(Math.sin(df),Math.cos(df));e.da+=df*Math.min(1,dt*4);return!e.path.length}
function pathLen(e){let L=0,x=e.x,y=e.y;for(const p of e.path){L+=Math.hypot(p[0]-x,p[1]-y);x=p[0];y=p[1]}return L}
const stopPt=(i,len)=>[DEFS[i].x,DEFS[i].y-6-len/2];
function outPath(dx,i,len){const d=DEFS[i],cy=CROSS[d.st],tr=trunkX(d.b)-8;return d.st?[[dx,OUT_Y],[tr,OUT_Y],[tr,cy-8],[d.x,cy-8],stopPt(i,len)]:[[dx,OUT_Y],[d.x,OUT_Y],stopPt(i,len)]}
function hopPath(a,i,len){const A=DEFS[a],B=DEFS[i],ca=CROSS[A.st],cb=CROSS[B.st],tr=trunkX(B.b)+(cb>ca?-8:8);return A.st===B.st?[[A.x,ca-8],[B.x,ca-8],stopPt(i,len)]:[[A.x,ca+8],[tr,ca+8],[tr,cb-8],[B.x,cb-8],stopPt(i,len)]}
function backPath(h,i){const d=DEFS[i],cy=CROSS[d.st],tr=trunkX(d.b)+8;return d.st?[[d.x,cy+8],[tr,cy+8],[tr,BACK_Y],[h.x,BACK_Y],[h.x,HOLD_Y]]:[[d.x,BACK_Y],[h.x,BACK_Y],[h.x,HOLD_Y]]}
const hopKm=(a,b)=>DEFS[a].reg||DEFS[b].reg?999:DEFS[a].st===DEFS[b].st?Math.max(2,Math.abs(DEFS[a].x-DEFS[b].x)/25):Math.abs(DEFS[a].km-DEFS[b].km)*.5+8;
const need=(i,T)=>{const s=G.stores[i];return!s.on||(DEFS[i].tg&&!T.tg)?0:Math.max(0,cap(i)-s.stock-s.inbound-s.planned)};
const cneed=(i,t)=>{const s=G.stores[i];return!s.on||!t.o.reefer||!chill(i)||(DEFS[i].tg&&!t.T.tg)?0:Math.max(0,ccap(i)-s.cstock-s.cinb-s.cplan)};
const legMin=(km,T,i)=>kmOf(km)*60/T.kmh*(G.cond.wx==='rain'?1.25:1)*(G.cond.road===i?1.4:1)*(G.tolls?.8:1)*traffic(S.clock);
const dutyEnd=t=>t.o.sub?S.t1:Math.min(t.o.drv.start+720,G.deps[t.b].s1+90);
function routeMin(t,stops){let m=0,prev=-1;for(const s of stops){m+=legMin(prev<0?DEFS[s.i].km:hopKm(prev,s.i),t.T,s.i)+8+(s.q+s.c)*.6;prev=s.i}return m+legMin(DEFS[prev].km,t.T,prev)}
function fillStops(t,ids){const stops=[];let rem=t.T.cap;const share=Math.ceil(rem/ids.length);for(const i of ids){const lim=Math.min(rem,Math.max(share,2)),c=Math.min(Math.ceil(lim*.3),cneed(i,t)),q=Math.min(lim-c,need(i,t.T));if(q+c>0){stops.push({i,q,c});rem-=q+c}}
  for(const s of stops){if(rem<=0)break;const q=Math.min(rem,need(s.i,t.T)-s.q);if(q>0){s.q+=q;rem-=q}}for(const s of stops){if(rem<=0)break;const c=Math.min(rem,cneed(s.i,t)-s.c);if(c>0){s.c+=c;rem-=c}}return stops}
function planRoute(t){const T=t.T,ids=onStores(t.b),lock=t.o.route;let best=-1,bc=1e9;
  for(const i of ids){if(lock>=0&&lock!==i)continue;const d=DEFS[i],s=G.stores[i],q=need(i,T),c=cneed(i,t);if(q+c<=0)continue;
    if(G.tr){const eta=S.clock+legMin(d.km,T,i);if(eta>d.close-10||eta<d.open-60)continue}
    const r=Math.max(.2,DEFS[i].dem*s.dm);let cover=(s.stock+s.inbound+s.planned)/r;if(c>0)cover=Math.min(cover,(s.cstock+s.cinb+s.cplan)/(r*.25));if(q<=0&&c<=0)continue;if(cover<bc){bc=cover;best=i}}
  if(best<0)return null;const pick=[best];let eta=S.clock+legMin(DEFS[best].km,T,best)+10,rem=T.cap-Math.min(T.cap,need(best,T)+cneed(best,t));
  while(lock<0&&rem>=2&&pick.length<G.maxDrops){const last=pick[pick.length-1];let nx=-1,nk=26;
    for(const j of ids){if(pick.includes(j))continue;const k=hopKm(last,j),n=need(j,T)+cneed(j,t);if(k>=nk||n<2)continue;if(G.tr&&eta+k*60/T.kmh>DEFS[j].close-10)continue;nx=j;nk=k}
    if(nx<0)break;pick.push(nx);rem-=Math.min(rem,need(nx,T)+cneed(nx,t));eta+=nk*60/T.kmh+10}
  let stops=fillStops(t,pick);const tot=stops.reduce((a,s)=>a+s.q+s.c,0);if(!stops.length||tot<Math.min(G.minLoad*T.cap,cap(best)*.7))return null;
  if(S.clock+routeMin(t,stops)>dutyEnd(t)){stops=stops.slice(0,1);if(S.clock+routeMin(t,stops)>dutyEnd(t))return null}return stops}
function leg(t,km,path,i){const min=legMin(km,t.T,i);km=kmOf(km);t.path=path;t.sp=pathLen(t)/Math.max(1,min);t.drive+=min;S.d.km+=km;t.km+=km;if(t.run)t.run.km+=km;if(G.tolls)charge('toll',km*TOLL);
  if(t.o.sub){charge('sub',km*t.T.subkm);return}
  const L=km*t.T.l/100*(G.tr?.94:1)*(t.o.reefer?1.12:1),own=Math.min(G.tank,L);G.tank-=own;S.d.litres+=L;charge('fuel',(L-own)*price()*1.1+km*t.T.run);t.o.cond=Math.max(0,t.o.cond-km*.03)}
const pri=(t,g)=>{const n=t.inb||t.bh;return t.inb&&(t.site>60||g.wh<30)?0:G.fkPri==='in'?(n?1:2):G.fkPri==='out'?(n?2:1):1};
function goHome(t,i,extra){const h=freeHold(S.deps[t.b],S.seq);h.truck=t;t.hold=h;leg(t,DEFS[i].km+(extra||0),backPath(h,i),i);t.stops=[];t.state='back';if(t.run)t.run.status='Returning'}
function toHold(t){const sd=S.deps[t.b];t.dock.truck=null;t.dock=null;const h=freeHold(sd,0);h.truck=t;t.hold=h;t.path=[[t.x,HOLD_Y],[h.x,HOLD_Y]];t.sp=30;t.state='back'}
function exitPath(t){return[[t.x,OUT_Y],[gateX(t.b),OUT_Y],[gateX(t.b),-70]]}
function refuse(t,why){if(t.dock){t.dock.truck=null;t.dock=null}if(t.hold){t.hold.truck=null;t.hold=null}charge('det',100);say('Supplier left '+DEPN[t.b]+' with '+t.loaded+' pallets ('+why+'). $100 fee.',1);t.path=exitPath(t);t.state='leave'}
function unplan(t){t.stops.forEach(s=>{G.stores[s.i].planned-=s.q;G.stores[s.i].cplan-=s.c});t.stops=[];t.qty=t.qc=0}
function arrive(t){const i=t.stops[t.si].i,d=DEFS[i],s=G.stores[i],rs=t.run&&t.run.stops[t.si];S.d.arr++;if(rs){rs.arr=S.clock;rs.late=S.clock>d.close}
  if(S.clock>d.close){const fine=d.strict?300:150;charge('pen',fine);S.d.late++;G.lateWeek++;s.sat=Math.max(0,s.sat-4);say(t.T.n+' #'+t.id+' reached '+d.n+' after receiving closed at '+hhmm(d.close)+'. '+money(fine)+' fine.',1)}
  t.state=S.clock<d.open?'await':'unload';t.timer=4}
const room=(t,g,sd)=>t.cold?coldCap(t.b)-g.cold-sd.cIn:whCap(t.b)-g.wh-sd.whIn;
function step(dt){S.clock+=dt;const D=S.d,c=S.clock,P=PAY[G.pay];
  for(const b of owned()){const g=G.deps[b],sd=S.deps[b],shift=c>=g.s0&&c<g.s1;
    if(shift){charge('wF',((sd.forks.length-sd.casual)*P.w+sd.casual*AGENCY+(g.sup?SUPW:0))*pm(c)/60*dt);
      if(sd.fUtil>.9&&sd.forks.length>1&&Math.random()<dt*.0006*(g.sup?.3:1)){sd.sick++;syncForks(b);charge('pen',1500);G.morale=Math.max(0,G.morale-5);say('Safety incident at '+DEPN[b]+': a rushed forklift clipped the racking. One operator stood down, $1,500 fine.',1)}
      const span=g.s1-g.s0-150,gap=g.inMode==='early'?20:Math.max(15,span/Math.max(1,Math.ceil(g.order/LOAD)));
      while(sd.ordered<g.order&&c>=g.s0+15+gap*sd.slot){sd.slot++;const q=Math.min(LOAD,g.order-sd.ordered);sd.ordered+=q;supplier(q,b)}
      const cg=Math.max(30,span/Math.max(1,Math.ceil(g.corder/LOAD)));while(g.cool&&sd.cordered<g.corder&&c>=g.s0+25+cg*sd.cslot){sd.cslot++;const q=Math.min(LOAD,g.corder-sd.cordered);sd.cordered+=q;supplier(q,b,true)}}
    const on=sd.docks.filter(d=>d.on);D.dockT+=on.length*dt;D.dockB+=on.filter(d=>d.truck).length*dt}
  if(G.tr&&c>=TRADE0&&c<1080)charge('wD',SUPW/60*dt);
  G.stores.forEach((s,i)=>{if(!s.on)return;s.flash=Math.max(0,s.flash-dt/3);const r=rate(i);if(r<=0)return;s.next-=dt;while(s.next<=0){s.next+=expo(60/r);
      if(s.stock>0){s.stock--;D.sold++;s.wSold++;s.sat=Math.min(100,s.sat+.1)}else{s.flash=1;D.lost++;s.wLost++;s.sat=Math.max(0,s.sat-.8);charge('pen',LOST)}}
    if(chill(i)){s.cnext-=dt;while(s.cnext<=0){s.cnext+=expo(240/r);if(s.cstock>0){s.cstock--;D.sold++;s.wSold++}else{s.flash=1;D.lost++;s.wLost++;s.sat=Math.max(0,s.sat-.5);charge('pen',LOST)}}}});
  for(const t of S.trucks){const T=t.T,sd=S.deps[t.b],g=G.deps[t.b];
    if(t.inb){t.site+=dt;if(t.site>120)charge('det',dt)}
    else if(!t.o.sub&&!t.noShow){const duty=c-t.o.drv.start;t.duty=duty>0&&!t.off;if(t.duty){const ot=duty>600;charge('wD',DRIVER*pm(c)*(ot?1.5:1)/60*dt);if(ot)D.otH+=dt/60;t.hours=duty}}
    if(t.state==='wait'){if(t.retire){if(t.hold)t.hold.truck=null;t.dead=1;continue}
      if(t.svc){t.svc=false;t.state='service';t.timer=120;charge('repair',T.svc);t.o.cond=100;continue}
      if(t.inb&&t.site>180){refuse(t,'gave up waiting');continue}
      if(!t.inb&&!t.o.sub){if(t.noShow||c<t.o.drv.start||t.off)continue;if(!t.bh&&(c>=g.s1||c-t.o.drv.start>=690)){t.off=true;if(c-t.o.drv.start>705)t.o.drv.tiredNext=true;continue}
        if(t.drive>=300){t.drive=0;t.state='break';t.timer=30;continue}}
      if(c<g.s0||c>=g.s1+(t.bh?120:0))continue;
      if(t.bh&&room(t,g,sd)<=0){t.bhW=(t.bhW||0)+dt;if(t.bhW>45){charge('det',t.loaded*BH+50);say(T.n+' #'+t.id+' had to hand its backhaul load back: the racks at '+DEPN[t.b]+' are full.',1);t.loaded=0;t.bh=false;t.bhW=0}}
      const ok=t.inb||t.bh?room(t,g,sd)>0:(g.wh-sd.whRes>0||g.cold-sd.cRes>0)&&!(g.wh<40&&S.trucks.some(u=>u.inb&&!u.cold&&u.b===t.b&&u.state==='wait'));
      const d=ok&&sd.docks.find(d=>d.on&&!d.truck);if(d){d.truck=t;t.dock=d;t.hold.truck=null;t.hold=null;t.path=[[d.x,HOLD_Y],[d.x,DOOR_Y+5+T.len/2,1]];t.state='dockIn'}}
    else if(t.state==='break'){t.timer-=dt;if(t.timer<=0)t.state='wait'}
    else if(t.state==='service'){t.timer-=dt;if(t.timer<=0){t.state='wait';say(T.n+' #'+t.id+' is back from the workshop.')}}
    else if(t.state==='dockIn'){if(move(t,30,dt)){t.state='loading';t.stops=[];t.qty=t.qc=0;t.hold_t=0;t.seq=S.seq++}}
    else if(t.state==='loading'){
      if(t.inb){if(t.loaded<=0&&!t.reserved){t.dock.truck=null;t.dock=null;t.path=exitPath(t);t.state='leave'}
        else if(!t.reserved&&room(t,g,sd)<=0){t.stall=(t.stall||0)+dt;if(t.stall>30)refuse(t,t.cold?'cool room full':'racks full')}else t.stall=0}
      else if(t.bh){if(t.loaded<=0&&!t.reserved)t.bh=false;else if(!t.reserved&&room(t,g,sd)<=0){t.bhW=(t.bhW||0)+dt;if(t.bhW>45){charge('det',t.loaded*BH+50);t.loaded=0;t.bh=false;t.bhW=0}}}
      else if(!t.stops.length){if(t.retire||t.svc||t.off||c>=g.s1||(!t.o.sub&&c-t.o.drv.start>=690)){toHold(t);continue}
        if(t.hold_t>0){t.hold_t-=dt;continue}
        const nx=t.pq[0];let p=null;
        if(nx&&c>=nx.seal-45){t.pq.shift();p=fillStops(t,nx.stops.filter(i=>G.stores[i].on));if(!p.length)p=null;else t.planned=true}
        else if(nx&&nx.seal-c<100){}
        else if(G.auto){p=planRoute(t);t.planned=false}
        if(p){t.stops=p;t.qty=p.reduce((a,s)=>a+s.q+s.c,0);t.qc=p.reduce((a,s)=>a+s.c,0);t.lc=0;p.forEach(s=>{G.stores[s.i].planned+=s.q;G.stores[s.i].cplan+=s.c})}}
      else if(!t.reserved){const la=t.loaded-t.lc,doneA=la>=t.qty-t.qc||g.wh-sd.whRes<=0,doneC=t.lc>=t.qc||g.cold-sd.cRes<=0;
        if(doneA&&doneC&&t.loaded>0){
          if(!G.tr&&G.fleet.length>4){t.paper=(t.paper==null?(G.fleet.length-4)*4:t.paper)-dt;if(t.paper>0)continue;t.paper=null}
          let a=la,cl=t.lc;t.stops.forEach(s=>{const st=G.stores[s.i];st.planned-=s.q;st.cplan-=s.c;s.q=Math.min(s.q,a);a-=s.q;s.c=Math.min(s.c,cl);cl-=s.c;st.inbound+=s.q;st.cinb+=s.c});t.stops=t.stops.filter(s=>s.q+s.c>0);
          const dx=t.dock.x,i=t.stops[0].i;t.dock.truck=null;t.dock=null;t.si=0;D.loads++;D.fill+=t.loaded/T.cap;t.trips++;
          t.run={no:S.runs.length+1,t:T.n+' #'+t.id,drv:t.o.sub?'subbie':t.o.drv.n,plan:!!t.planned,b:t.b,seal:c,pal:t.loaded,cold:t.lc,km:0,status:'On the road',stops:t.stops.map(s=>({i:s.i,q:s.q+s.c,arr:0,late:false}))};S.runs.push(t.run);
          leg(t,DEFS[i].km,outPath(dx,i,T.len),i);t.state='out';t.breaks=!t.o.sub&&Math.random()<Math.min(70,DEFS[i].km)/1200*(1+(100-t.o.cond)/25)*(G.up.train?.5:1)*(1-.15*skill(t.o))*(t.o.drv.tired?1.6:1)}
        else if(doneA&&doneC){unplan(t);t.hold_t=10;if(S.trucks.some(u=>u.inb&&u.b===t.b&&u.state==='wait'))toHold(t)}}}
    else if(t.state==='leave'){if(move(t,34,dt))t.dead=1}
    else if(t.state==='out'){if(move(t,t.sp,dt)){if(t.breaks){t.breaks=false;t.state='broken';t.timer=90;charge('repair',400);say(T.n+' #'+t.id+' broke down near '+DEFS[t.stops[t.si].i].n+'. 90 min, $400 repair.',1)}else arrive(t)}}
    else if(t.state==='broken'){t.timer-=dt;if(t.timer<=0)arrive(t)}
    else if(t.state==='await'){D.wait+=dt;if(c>=DEFS[t.stops[t.si].i].open)t.state='unload'}
    else if(t.state==='unload'){const st=t.stops[t.si],s=G.stores[st.i],d=DEFS[st.i],u=.6*(1-.1*skill(t.o));t.timer-=dt;
      while(t.timer<=0&&st.q+st.c>0){t.timer+=u;t.loaded--;D.deliv++;let pay=payOf(st.i);if(st.q>0){st.q--;s.stock++;s.inbound--}else{st.c--;t.lc--;s.cstock++;s.cinb--;D.cold++;pay*=1.5}G.cash+=pay;D.rev+=pay;s.wRev+=pay}
      if(st.q+st.c<=0){D.drops++;sfx('coin');t.si++;if(t.si<t.stops.length){const j=t.stops[t.si].i;leg(t,hopKm(st.i,j),hopPath(st.i,j,T.len),j);t.state='out'}
        else{const q=Math.min(T.cap,Math.floor(whCap(t.b)*.8)-g.wh-sd.whIn-Math.max(0,g.order-sd.ordered)-S.trucks.reduce((a,u)=>a+(u.b===t.b&&(u.bh||u.state==='pickup')?(u.bhq||u.loaded):0),0));t.last=st.i;
          if(G.backhaul&&!t.o.sub&&!d.reg&&q>=6&&c<g.s1-150){t.state='pickup';t.timer=25;t.bhq=q;if(t.run)t.run.status='Collecting backhaul'}else goHome(t,st.i)}}}
    else if(t.state==='pickup'){t.timer-=dt;if(t.timer<=0){t.loaded=t.bhq;t.lc=0;t.bh=true;G.cash+=t.bhq*BH;D.bh+=t.bhq*BH;goHome(t,t.last,6)}}
    else if(t.state==='back'){if(move(t,t.sp,dt)){t.state='wait';t.bhq=0;if(t.run){t.run.status='Back '+clockStr();t.run=null}if(t.o.sub&&c>g.s1-80)t.retire=true}}}
  S.trucks=S.trucks.filter(t=>!t.dead);
  for(const b of owned()){const sd=S.deps[b],g=G.deps[b],e=eff(b),v=44*P.sp*mm()*e,hr_=1/P.sp/mm()/e,hd=hr_*(G.up.lev?.6:1),x0=b*BW+OX,shift=c>=g.s0&&c<g.s1;let busy=0;
    const crowd=t=>sd.forks.reduce((a,f)=>a+(f.truck===t?1:0),0),rackX=(t,cold)=>cold?x0+DW-40-Math.random()*50:Math.max(x0+24,Math.min(x0+DW-110,t.dock.x+Math.random()*150-75));
    const want=t=>t.inb||t.bh?(t.loaded-t.reserved>0&&room(t,g,sd)>0?1:0):!t.stops.length?0:(t.qc-t.lc-t.rc>0&&g.cold-sd.cRes>0)?2:((t.qty-t.qc)-(t.loaded-t.lc)-(t.reserved-t.rc)>0&&g.wh-sd.whRes>0)?1:0;
    for(const f of sd.forks){
      if(f.state==='charge'){f.timer-=dt;if(f.timer<=0){f.bat=100;f.state='idle'}continue}
      if((f.state==='idle'||f.state==='home')&&f.bat<8){if(f.state==='idle'||move(f,v,dt)){f.state='charge';f.timer=G.up.batt?6:45}continue}
      if(f.state==='idle'||f.state==='home'){const fd=g.fkMode==='manual'&&g.fkDock[f.i]>=0&&g.fkDock[f.i]<g.docks?g.fkDock[f.i]:-1;
        const t=shift?S.trucks.filter(t=>t.b===b&&t.state==='loading'&&want(t)&&(fd<0||t.dock===sd.docks[fd])).sort((a,q)=>pri(a,g)-pri(q,g)||crowd(a)-crowd(q)||a.seq-q.seq)[0]:null;
        if(t){const w=want(t);t.reserved++;f.truck=t;
          if(t.inb||t.bh){f.cold=!!t.cold;if(f.cold)sd.cIn++;else sd.whIn++;f.job='in';f.path=[[t.dock.x+Math.random()*10-5,DOOR_Y-4]];f.state='toDock'}
          else{f.cold=w===2;if(f.cold){sd.cRes++;t.rc++}else sd.whRes++;f.job='out';f.path=[[rackX(t,f.cold),RACK_Y]];f.state='toRack'}}
        else if(f.state==='home'){if(move(f,v,dt))f.state='idle'}}
      if(f.state==='toRack'){if(move(f,v,dt)){f.state='atRack';f.timer=hr_}}
      else if(f.state==='atRack'){f.timer-=dt;if(f.timer<=0){if(f.job==='out'){if(f.cold){g.cold--;sd.cRes--}else{g.wh--;sd.whRes--}f.carry=true;f.path=[[f.truck.dock.x+Math.random()*10-5,DOOR_Y-4]];f.state='toDock'}
          else{if(f.cold){g.cold++;sd.cIn--}else{g.wh++;sd.whIn--}S.d.recv++;f.carry=false;f.truck=null;f.path=[[f.hx,118]];f.state='home'}}}
      else if(f.state==='toDock'){if(move(f,v,dt)){f.state='atDock';f.timer=hd}}
      else if(f.state==='atDock'){f.timer-=dt;if(f.timer<=0){if(f.job==='out'){f.carry=false;f.truck.loaded++;f.truck.reserved--;if(f.cold){f.truck.lc++;f.truck.rc--}f.truck=null;f.path=[[f.hx,118]];f.state='home'}
          else{f.truck.loaded--;f.truck.reserved--;f.carry=true;f.path=[[rackX(f.truck,f.cold),RACK_Y]];f.state='toRack'}}}
      if(f.state!=='idle'&&f.state!=='home'){busy++;f.bat=Math.max(0,f.bat-dt*100/330)}}
    if(shift){const u=busy/Math.max(1,sd.forks.length);sd.fUtil+=(u-sd.fUtil)*Math.min(1,dt/40);sd.busyT+=u*dt;sd.totT+=dt}else sd.fUtil*=.98}
  if(c>=S.t1)endDay()}
const costs=d=>d.wF+d.wD+d.fuel+d.lease+d.over+d.pen+d.repair+d.other+d.stor+d.int+d.det+d.sub+d.toll+d.spoil;
function nextOffer(){let best=-1;G.stores.forEach((s,i)=>{if(!s.on&&s.lock<=G.day&&G.deps[DEFS[i].b].own&&(best<0||DEFS[i].km<DEFS[best].km))best=i});return best}
function kpis(){const d=S.d,drv=S.trucks.filter(t=>!t.inb&&!t.noShow).length,ow=owned(),fu=ow.reduce((a,b)=>a+S.deps[b].fUtil,0)/ow.length;
  return{loads:d.loads,drops:d.drops,ratio:d.loads?(d.drops/d.loads).toFixed(2):'–',drv:drv&&d.loads?(d.loads/drv).toFixed(1):'–',out:d.deliv,cold:d.cold,inn:d.recv,fill:d.loads?Math.round(d.fill/d.loads*100)+'%':'–',
    km:num(d.km)+' km',kmp:d.deliv?(d.km/d.deliv).toFixed(1)+' km':'–',cpp:d.deliv?money((costs(d)-d.other)/d.deliv):'–',ot:d.arr?Math.round((1-d.late/d.arr)*100)+'%':'–',wait:Math.round(d.wait)+' min',
    fk:Math.round(fu*100)+'%',dock:d.dockT?Math.round(d.dockB/d.dockT*100)+'%':'–',lit:num(d.litres)+' L',l100:d.km?(d.litres/d.km*100).toFixed(0)+' L':'–',av:d.sold+d.lost?Math.round(d.sold/(d.sold+d.lost)*100)+'%':'–',stock:num(ow.reduce((a,b)=>a+G.deps[b].wh+G.deps[b].cold,0)),oth:d.otH.toFixed(1)+' h'}}
const KPI=[['loads','Loads out'],['drops','Drops'],['ratio','Drops / load'],['fill','Truck fill'],['out','Pallets out'],['inn','Pallets in'],['stock','Depot stock'],['km','Distance'],['kmp','Km / pallet'],['cpp','Cost / pallet'],['ot','On time'],['wait','Window waits'],['fk','Forklifts busy'],['dock','Docks in use'],['drv','Loads / driver'],['oth','Driver overtime'],['cold','Chilled out'],['lit','Diesel used'],['l100','Per 100 km'],['av','Shelves stocked']];
function winChance(bid){const h=G.hist.slice(-7),av=h.length?h.reduce((a,x)=>a+x.avail,0)/h.length:.9;return Math.max(.1,Math.min(.95,.6+(av-.9)*2.5+[.28,0,-.25][bid]))}

function endDay(){if(attract){startAttract();return}S.over=true;let kept=0,spoilt=0;const ow=owned();for(const b of ow){const g=G.deps[b];charge('stor',(g.wh+g.cold)*STOR);kept+=g.wh+g.cold;const sp=Math.round(g.cold*.15);g.cold-=sp;spoilt+=sp;charge('spoil',sp*SPOIL)}
  const d=S.d,k=kpis(),profit=d.rev+d.bh-costs(d),avail=d.sold/Math.max(1,d.sold+d.lost);G.hist.push({day:G.day,profit,avail,cash:G.cash-G.loan});if(G.hist.length>60)G.hist.shift();
  G.fleet.forEach(o=>{o.drv.days++;o.drv.tired=!!o.drv.tiredNext;o.drv.tiredNext=false});
  let notes='';G.stores.forEach((s,i)=>{if(!s.on)return;const rival=RIVALS[i%3];
    if(s.sat<=0){s.on=false;s.sat=40;s.lock=G.day+6;notes+=`<p class="neg"><b>${DEFS[i].n} cancelled its contract</b> and signed with ${rival}.</p>`}
    else if(s.sat<30&&Math.random()<.3){s.on=false;s.sat=45;s.lock=G.day+5;notes+=`<p class="neg"><b>${rival} poached ${DEFS[i].n}.</b> Goodwill was low and they undercut you.</p>`}});
  const util=ow.reduce((a,b)=>a+S.deps[b].busyT,0)/Math.max(1,ow.reduce((a,b)=>a+S.deps[b].totT,0)),m0=G.morale;
  G.morale=Math.max(0,Math.min(100,G.morale+[-7,0,6][G.pay]+(util>.85?-6:util<.6?3:0)+(G.up.mess?4:0)+(ow.every(b=>G.deps[b].sup)?2:0)+(60-G.morale)*.1));
  notes+=`<p>Crew morale ${Math.round(m0)} → <b class="${G.morale<m0?'neg':'pos'}">${Math.round(G.morale)}</b>. Forklifts were busy ${(util*100).toFixed(0)}% of their shift${util>.85?', which is wearing people down':''}.${d.otH>.1?' Drivers worked '+d.otH.toFixed(1)+' hours of overtime at time and a half.':''}${spoilt?' '+spoilt+' chilled pallets spoiled overnight in the cool room.':''}</p>`;
  if(G.morale<15){const b=ow.find(b=>G.deps[b].fk>1);if(b!=null){G.deps[b].fk--;notes+=`<p class="neg"><b>An operator quit at ${DEPN[b]}.</b> Pay and workload matter.</p>`}}
  if(G.day%7===0){let bonus=0,up=0,dn=0;G.stores.forEach(s=>{if(!s.on)return;const sv=s.wSold/Math.max(1,s.wSold+s.wLost);if(sv>=.97){bonus+=s.wRev*.08;s.rm=Math.min(1.3,s.rm+.02);s.dm=Math.min(1.5,s.dm+.05);up++}else if(sv<.85){s.rm=Math.max(.8,s.rm-.03);dn++}s.wSold=s.wLost=s.wRev=0});G.cash+=bonus;
    const h=G.hist.slice(-7),av=h.reduce((a,x)=>a+x.avail,0)/h.length,pf=h.reduce((a,x)=>a+x.profit,0),grade=av>=.97&&pf>0?'A':av>=.93?'B':av>=.88?'C':av>=.8?'D':'E';if(!G.lateWeek)G.ach.ontime=1;
    notes+=`<div class="offer"><b>Week ${G.day/7} report card: ${grade}</b><p style="margin:4px 0 0">Shelves stocked ${(av*100).toFixed(0)}% across the week, ${G.lateWeek} late arrival${G.lateWeek===1?'':'s'}, ${money(pf)} profit. ${up?up+' store'+(up===1?'':'s')+' hit 97% and paid service bonuses worth <b>'+money(bonus)+'</b>; they grow 5% and pay 2% more.':'No store reached the 97% needed for a service bonus.'}${dn?' '+dn+' under 85% cut their rate 3%.':''}</p></div>`;G.lateWeek=0}
  const dead=G.cash<-5000||!G.stores.some(s=>s.on),off=nextOffer(),canOffer=!dead&&off>=0&&avail>=.9,nOn=onStores().length;
  const got=[];const A=(k,ok)=>{if(ok&&!G.ach[k]){G.ach[k]=1;got.push(ACH.find(a=>a[0]===k)[1]);if(window.pfDesktop)window.pfDesktop.unlock(k)}};A('profit',profit>0);A('full',d.lost===0&&d.sold>50);A('ten',nOn>=10);A('dep2',ow.length>1);A('drops',d.drops>=100);A('cold',d.cold>=40);A('reg',onStores().some(i=>DEFS[i].reg));A('gold',G.cash-G.loan>=250000);A('all',nOn>=30);if(G.ach.ontime===1){G.ach.ontime=2;got.push('Clockwork')}
  let win='';if(!dead&&G.tier<TIERS.length&&G.cash-G.loan>=TIERS[G.tier][0]){const t=TIERS[G.tier++];sfx('win');win=`<div class="offer"><b>🏆 ${t[1]} network: ${money(t[0])} net worth.</b><p style="margin:4px 0 0">${G.tier<TIERS.length?'Next: '+TIERS[G.tier][1]+' at '+money(TIERS[G.tier][0])+'.':'Top tier. You run the state.'}</p></div>`}
  if(got.length)win+=`<p><b>🎖 Achievement${got.length>1?'s':''}:</b> ${got.join(', ')}.</p>`;
  const row=(a,b,c)=>`<tr${c?' class="'+c+'"':''}><td>${a}</td><td>${b}</td></tr>`,opt=(a,v)=>v?row(a,money(-v)):'';
  let h=`<h2>${dead?'The bank has pulled the plug':'Day '+G.day+' closed'}</h2><p>${dead?(G.cash<-5000?'You are more than $5,000 overdrawn.':'Every store has walked away.')+' You lasted '+G.day+' days.':`Shelves stocked ${k.av}. ${d.loads} loads, ${d.drops} drops, ${d.deliv} pallets out over ${k.km}. ${d.recv} pallets in. ${d.late?d.late+' late arrival'+(d.late>1?'s':'')+'.':'Every drop on time.'}`}</p>
  <table>${row('Delivery income',money(d.rev))}${d.bh?row('Backhaul income',money(d.bh)):''}${row('Warehouse wages',money(-d.wF))}${row('Driver and transport wages',money(-d.wD))}${row('Fuel bought and running costs',money(-d.fuel))}${opt('Subcontractors',d.sub)}${opt('Road tolls',d.toll)}${row('Truck leases and fridge units',money(-d.lease))}${row('Depot rent',money(-d.over))}${row('Overnight storage ('+kept+' pallets)',money(-d.stor))}${opt('Chilled stock spoiled',d.spoil)}${row('Penalties ('+d.lost+' empty-shelf, '+d.late+' late)',money(-d.pen))}${opt('Supplier waiting fees',d.det)}${opt('Repairs and servicing',d.repair)}${opt('Loan interest',d.int)}${opt('Investments and one-offs',d.other)}
  <tr class="tot"><td>Profit today</td><td class="${profit<0?'neg':'pos'}">${money(profit)}</td></tr>${row('Cash',money(G.cash))}${G.loan?row('Loan owing',money(-G.loan)):''}${row('Cost per pallet delivered',k.cpp)}${row('Truck fill / drops per load',k.fill+' / '+k.ratio)}</table>${notes}${win}`;
  if(canOffer){const o=DEFS[off],bids=[['Sharp',-10],['Fair',0],['Premium',12]];h+=`<div class="offer" id="offer"><b>Tender: ${o.n}</b><p style="margin:4px 0 8px">Served from ${DEPN[o.b]}, ${o.km} km out${o.reg?' (a regional run: about 7 hours there and back)':''}. About ${o.dem} pallets an hour, list rate ${money(o.rate)} a pallet. ${winText(off)} ${RIVALS[off%3]} is bidding too. Your service record sets your odds.</p><div class="seg">${bids.map((b,j)=>`<button data-act="bid:${off}:${j}">${b[0]}<small>${money(o.rate*(1+b[1]/100))} · ${Math.round(winChance(j)*100)}% to win</small></button>`).join('')}</div></div>`}
  else if(!dead&&off>=0)h+=`<p>Keep shelves stocked 90% of a day to be invited to the next tender (${DEFS[off].n}).</p>`;
  G.day++;if(dead){try{localStorage.removeItem(slotKey(slot))}catch(e){}h+=`<button class="pri go" data-act="menu">Start again</button>`}
  else{G.cond=genCond(G.cond);G.fuelHist.push(G.cond.fuel);if(G.fuelHist.length>12)G.fuelHist.shift();h+=`<h3 style="margin-top:14px">Tomorrow's forecast</h3><ul>${condList(G.cond,G.day).map(x=>'<li>'+x+'</li>').join('')}</ul>`;save();h+=nextBtn()}
  showModal(h)}
function winText(i){const d=DEFS[i],a=[];if(d.open>300||d.close<1200)a.push('Receives '+hr(d.open)+':00 to '+hr(d.close)+':00'+(d.strict?' (strict: double fine)':''));if(d.tg)a.push('No dock: tailgate trucks only');return a.join('. ')+(a.length?'.':'')}
function showModal(h){$('#mbox').innerHTML=h;$('#modal').classList.add('show');$('#modal').scrollTop=0;modal=true}
function hideModal(){$('#modal').classList.remove('show');modal=false}

/* ---------- map ---------- */
function rr(x,a,b,w,h,r){x.beginPath();x.roundRect(a,b,w,h,r);x.fill()}
function pallet(x,a,b,s,cold){x.fillStyle=cold?'#8fd0ee':'#c79a5b';x.fillRect(a-s/2,b-s/2,s,s);x.strokeStyle=cold?'#2c7ea6':'#7d5526';x.lineWidth=.5;x.strokeRect(a-s/2,b-s/2,s,s)}
const SIGN=['#1f5fa8','#1e8e4e','#b3541e','#6a3fa0','#0f7c86'];
const DECOR=(()=>{let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647,trees=[],houses=[];
  for(let b=0;b<NB;b++){const x0=b*BW,sx=DEFS.filter(d=>d.b===b);
    for(let i=0;i<150;i++){const x=x0+12+rnd()*(BW-24),y=345+rnd()*(WH-360);if(CROSS.some(c=>Math.abs(y-c)<34)||Math.abs(x-trunkX(b))<34||sx.some(d=>Math.abs(x-d.x)<46&&y>CROSS[d.st]&&y<d.y+50))continue;trees.push([x,y,3+rnd()*3])}
    for(const cy of[CROSS[1],CROSS[2]])for(let x=x0+30;x<x0+BW-20;x+=30){if(Math.abs(x-trunkX(b))<40||sx.some(d=>Math.abs(x-d.x)<52&&CROSS[d.st]===cy)||rnd()<.25)continue;houses.push([x,cy-40,Math.floor(rnd()*4)])}}
  return{trees,houses}})();
const ROOF=['#b0553c','#8a8f98','#a47a4e','#6f7f8f'];
const cam={x:0,y:0,z:1,init:0};
function zmin(){const c=$('#c');return Math.min(c.clientWidth/WW,c.clientHeight/WH)}
function clampCam(){const c=$('#c');cam.z=Math.max(zmin(),Math.min(2.6,cam.z));const vw=c.clientWidth/cam.z,vh=c.clientHeight/cam.z;
  cam.x=vw>=WW?(WW-vw)/2:Math.max(0,Math.min(WW-vw,cam.x));cam.y=vh>=WH?(WH-vh)/2:Math.max(0,Math.min(WH-vh,cam.y))}
function zoomAt(f,sx,sy){const wx=cam.x+sx/cam.z,wy=cam.y+sy/cam.z;cam.z*=f;clampCam();cam.x=wx-sx/cam.z;cam.y=wy-sy/cam.z;clampCam()}
function view(v){const c=$('#c'),cw=c.clientWidth,ch=c.clientHeight;if(v==='map'){const ow=owned().length*BW;cam.z=Math.max(zmin(),Math.min(cw/ow,ch/WH));cam.x=0;cam.y=0}
  else{cam.z=Math.min(cw/(DW+24),ch/340,1.8);cam.x=sel*BW+OX+DW/2-cw/cam.z/2;cam.y=0}clampCam()}
(()=>{const c=$('#c'),P=new Map();let pd=0;const pos=e=>{const r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
  c.addEventListener('pointerdown',e=>{c.setPointerCapture(e.pointerId);P.set(e.pointerId,pos(e));pd=0});
  c.addEventListener('pointermove',e=>{if(!P.has(e.pointerId))return;const o=P.get(e.pointerId),n=pos(e);P.set(e.pointerId,n);
    if(P.size===1){cam.x-=(n.x-o.x)/cam.z;cam.y-=(n.y-o.y)/cam.z;clampCam()}
    else if(P.size===2){const[a,b]=[...P.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pd)zoomAt(d/pd,(a.x+b.x)/2,(a.y+b.y)/2);pd=d}});
  const up=e=>{P.delete(e.pointerId);pd=0};c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);
  c.addEventListener('wheel',e=>{e.preventDefault();const p=pos(e);zoomAt(e.deltaY<0?1.12:.89,p.x,p.y)},{passive:false})})();
const dark=c=>c<300?.42:c<390?.42*(390-c)/90:c<1110?0:c<1200?.42*(c-1110)/90:.42;
function draw(){const c=$('#c'),r=c.getBoundingClientRect(),dp=Math.min(window.devicePixelRatio||1,2),cw=Math.round(r.width*dp),ch=Math.round(r.height*dp);
  if(c.width!==cw||c.height!==ch){c.width=cw;c.height=ch;if(!cam.init&&cw){cam.init=1;view('depot')}clampCam()}
  const x=c.getContext('2d'),C=G.cond,k=cam.z*dp,rt=OUT_Y-12,rb=BACK_Y+12,far=cam.z<.55,nt=dark(S.clock);x.setTransform(1,0,0,1,0,0);x.fillStyle=C.wx==='heat'?'#8a9455':'#6d8a55';x.fillRect(0,0,cw,ch);x.setTransform(k,0,0,k,-cam.x*k,-cam.y*k);
  if(cam.z>.3){x.fillStyle='#5a7a45';for(const t of DECOR.trees){x.beginPath();x.arc(t[0],t[1],t[2],0,7);x.fill()}
    for(const h of DECOR.houses){x.fillStyle='rgba(0,0,0,.18)';x.fillRect(h[0]-6,h[1]-4,16,12);x.fillStyle=ROOF[h[2]];x.fillRect(h[0]-8,h[1]-6,16,12);x.fillStyle='rgba(255,255,255,.18)';x.fillRect(h[0]-8,h[1]-6,16,6)}}
  x.fillStyle='rgba(255,255,255,.28)';x.font='700 22px '+FONT;x.textAlign='center';for(let b=0;b<NB;b++)SUBURB[b].forEach((n,j)=>x.fillText(n.toUpperCase(),b*BW+(j===1?190:j===2?610:400)+(j?0:0),j===0?370:j===1?690:930));x.textAlign='left';
  x.fillStyle='#3d4045';x.fillRect(-600,rt,WW+1200,rb-rt);x.fillRect(-600,CROSS[1]-20,WW+1200,40);x.fillRect(-600,CROSS[2]-20,WW+1200,40);
  for(let b=0;b<NB;b++){x.fillStyle='#33363b';x.fillRect(trunkX(b)-24,rb,48,CROSS[2]-rb);if(G.deps[b].own){x.fillStyle='#3d4045';x.fillRect(gateX(b)-13,-80,26,rt+80);x.fillStyle='#a9aaa5';x.fillRect(b*BW+OX-30,0,DW+60,rt)}}
  x.fillStyle='#3d4045';G.stores.forEach((st,i)=>{if(st.on){const d=DEFS[i],top=CROSS[d.st]+20;x.fillRect(d.x-13,top,26,d.y-top)}});
  x.strokeStyle='#f2f2ee';x.lineWidth=1.2;x.setLineDash([9,8]);x.beginPath();for(const cy of CROSS){x.moveTo(-600,cy);x.lineTo(WW+600,cy)}x.stroke();x.setLineDash([]);
  for(let b=0;b<NB;b++){const tx=trunkX(b);x.strokeStyle='#f2f2ee';x.lineWidth=1;x.beginPath();x.moveTo(tx-22,rb);x.lineTo(tx-22,CROSS[2]-20);x.moveTo(tx+22,rb);x.lineTo(tx+22,CROSS[2]-20);x.stroke();x.strokeStyle='#f5c400';x.lineWidth=1.4;x.beginPath();x.moveTo(tx-1.5,rb+2);x.lineTo(tx-1.5,CROSS[2]-22);x.moveTo(tx+1.5,rb+2);x.lineTo(tx+1.5,CROSS[2]-22);x.stroke();
    x.fillStyle='#1e6b3a';rr(x,tx+28,430,22,14,3);x.fillStyle='#fff';x.font='700 9px '+FONT;x.fillText('M'+(b+1),tx+32,440.5)}
  for(let b=0;b<NB;b++){const g=G.deps[b],sd=S.deps[b],x0=b*BW+OX;
    if(!g.own){x.strokeStyle='#dfe8d4';x.globalAlpha=.7;x.lineWidth=1.5;x.setLineDash([8,6]);x.strokeRect(x0+8,8,DW-16,DOOR_Y+110);x.setLineDash([]);x.fillStyle='#fff';x.font='700 26px '+FONT;x.textAlign='center';x.fillText(DEPN[b].toUpperCase(),x0+DW/2,110);x.font='700 16px '+FONT;x.fillText('FOR SALE · '+money(DEPCOST[b]),x0+DW/2,136);x.textAlign='left';x.globalAlpha=1;continue}
    for(const h of sd.holds){x.strokeStyle='#f2f2ee';x.lineWidth=1;x.setLineDash([4,4]);x.strokeRect(h.x-14,HOLD_Y-36,28,70);x.setLineDash([]);x.fillStyle='rgba(242,242,238,.7)';x.font='700 8px '+FONT;x.fillText('P',h.x-3,HOLD_Y-26)}
    x.save();x.translate(x0,0);x.fillStyle='rgba(0,0,0,.18)';x.fillRect(11,11,DW-16,DOOR_Y-6);x.fillStyle='#dcd9d0';x.fillRect(8,8,DW-16,DOOR_Y-6);x.strokeStyle=b===sel?'#1d1f21':'#4b4e52';x.lineWidth=3;x.strokeRect(8,8,DW-16,DOOR_Y-6);
    x.fillStyle=G.co.col;x.fillRect(8,8,DW-16,4);x.strokeStyle='#f5c400';x.lineWidth=1.5;x.setLineDash([10,6]);x.beginPath();x.moveTo(14,DOOR_Y-22);x.lineTo(DW-14,DOOR_Y-22);x.stroke();x.setLineDash([]);
    const rw=g.cool?DW-140:DW-40,slots=Math.floor((rw-10)/12.2)*2;x.fillStyle='#2f5d9e';x.fillRect(20,14,rw,22);x.fillStyle='#e8731c';x.fillRect(20,24.2,rw,1.6);const full=Math.round(slots*Math.min(1,g.wh/whCap(b)));for(let i=0;i<full;i++)pallet(x,28+Math.floor(i/2)*12.2,i%2?30.5:19.5,7);
    if(g.cool){x.fillStyle='#cfe8f5';x.fillRect(DW-112,14,92,34);x.strokeStyle='#2c7ea6';x.lineWidth=1.5;x.strokeRect(DW-112,14,92,34);const cf=Math.round(20*Math.min(1,g.cold/coldCap(b)));for(let i=0;i<cf;i++)pallet(x,DW-104+Math.floor(i/2)*8.6,i%2?30:20,6.5,1);x.fillStyle='#2c7ea6';x.font='700 7px '+FONT;x.fillText('COOL ROOM '+g.cold+'/'+coldCap(b),DW-108,45)}
    const open=S.clock>=g.s0&&S.clock<g.s1;x.fillStyle=g.wh<15?'#c8281e':'#4b4e52';x.font='700 '+(far?22:10)+'px '+FONT;x.textAlign='right';x.fillText((far?DEPN[b]:G.co.n+' · '+DEPN[b]).toUpperCase()+' · '+g.wh+'/'+whCap(b)+(far?'':' PALLETS'+(open?'':' · CLOSED')),DW-16,DOOR_Y-(far?34:28));x.textAlign='left';x.restore();
    sd.docks.forEach((d,j)=>{if(!d.on){x.strokeStyle='#8d8f8b';x.lineWidth=1;x.setLineDash([3,3]);x.strokeRect(d.x-14,DOOR_Y+3,28,74);x.setLineDash([]);return}
      x.strokeStyle='#f5c400';x.lineWidth=1.4;x.strokeRect(d.x-14,DOOR_Y+3,28,74);x.fillStyle='#26282b';x.fillRect(d.x-12,DOOR_Y-3,24,6);
      const t=d.truck,act=t&&t.state==='loading'&&(t.inb||t.bh||t.stops.length);x.fillStyle=act?'#27c267':'#c8281e';x.beginPath();x.arc(d.x+17,DOOR_Y-7,2.4,0,7);x.fill();x.fillStyle='#4b4e52';x.font='700 8px '+FONT;x.fillText(j+1,d.x-2.5,DOOR_Y-8)})}
  G.stores.forEach((st,i)=>{const d=DEFS[i],bx=d.x-33,c=cap(i);if(!st.on){if(!G.deps[d.b].own)return;x.strokeStyle='#dfe8d4';x.globalAlpha=.6;x.lineWidth=1;x.setLineDash([4,4]);x.strokeRect(bx,d.y,66,42);x.setLineDash([]);x.fillStyle='#fff';x.font='8px '+FONT;x.fillText(st.lock>G.day0?RIVALS[i%3].split(' ')[0].toUpperCase():'OUT TO TENDER',bx+8,d.y+24);x.globalAlpha=1;return}
    const ch=chill(i),empty=st.stock===0||(ch&&st.cstock===0),promo=C.promo===i,shut=S.clock<d.open||S.clock>d.close;x.fillStyle='rgba(0,0,0,.22)';x.fillRect(bx+3,d.y+3,66,42);x.fillStyle='#f1eee6';x.fillRect(bx,d.y,66,42);x.fillStyle=st.stock===0?'#c8281e':SIGN[i%SIGN.length];x.fillRect(bx,d.y,66,far?20:13);
    x.strokeStyle=promo?'#ffd200':'#4b4e52';x.lineWidth=promo?2.5:1.2;x.strokeRect(bx,d.y,66,42);
    if(far){x.fillStyle='#fff';x.font='700 15px '+FONT;x.fillText(st.stock===0?'EMPTY':st.stock+'/'+c,bx+5,d.y+15);x.fillStyle='#cfccc3';x.fillRect(bx+5,d.y+25,56,11);x.fillStyle=st.stock<c*.25?'#f5a300':'#b9803f';x.fillRect(bx+5,d.y+25,56*Math.min(1,st.stock/c),11)}
    else{x.fillStyle='#fff';x.font='700 '+(d.n.length>10?7.5:8.5)+'px '+FONT;x.fillText(d.n,bx+3,d.y+10);x.fillStyle=shut?'#c8281e':'#5c6066';x.font='7.5px '+FONT;x.fillText(d.km+'km'+(d.open>300||d.close<1200?' '+hr(d.open)+'–'+hr(d.close):'')+(d.tg?' TG':'')+(d.reg?' REGIONAL':''),bx+5,d.y+24);
      x.fillStyle='#fff';x.textAlign='right';x.font='700 7.5px '+FONT;x.fillText(st.stock===0?'EMPTY':st.stock+'/'+c,bx+63,d.y+10);x.textAlign='left';
      const bh_=ch?4:7;x.fillStyle='#cfccc3';x.fillRect(bx+5,d.y+29,56,bh_);x.fillStyle=st.stock<c*.25?'#f5a300':'#b9803f';x.fillRect(bx+5,d.y+29,56*Math.min(1,st.stock/c),bh_);
      if(ch){x.fillStyle='#cfccc3';x.fillRect(bx+5,d.y+34.5,56,3.5);x.fillStyle=st.cstock?'#3ba3d8':'#c8281e';x.fillRect(bx+5,d.y+34.5,st.cstock?56*Math.min(1,st.cstock/ccap(i)):56,3.5)}}
    if(C.road===i){const my=d.y-34;x.fillStyle='#f57c00';x.beginPath();x.moveTo(d.x+22,my-7);x.lineTo(d.x+29,my+5);x.lineTo(d.x+15,my+5);x.closePath();x.fill();x.fillStyle='#1d1f21';x.font='700 8px '+FONT;x.fillText('!',d.x+20.5,my+3.5)}
    if(st.flash>0){x.globalAlpha=st.flash;x.fillStyle='#c8281e';x.beginPath();x.arc(bx+66,d.y,7,0,7);x.fill();x.fillStyle='#fff';x.font='700 9px '+FONT;x.fillText('✕',bx+62.5,d.y+3);x.globalAlpha=1}});
  for(const t of S.trucks){const L=t.T.len,tl=L-13,idle=!t.inb&&!t.o.sub&&(t.noShow||t.off||S.clock<t.o.drv.start);x.save();x.translate(t.x,t.y);x.rotate(t.da);x.globalAlpha=t.retire||idle?.5:1;x.fillStyle='rgba(0,0,0,.28)';x.fillRect(-L/2+2,-8,L,20);
    x.fillStyle=t.state==='broken'?'#f0c9c4':t.inb?(t.cold?'#cfe8f5':'#d6d9c8'):t.o.sub?'#ece2c6':'#f7f7f4';rr(x,-L/2,-10,tl,20,2);x.strokeStyle='#55585c';x.lineWidth=.8;x.beginPath();x.roundRect(-L/2,-10,tl,20,2);x.stroke();
    if(!t.inb&&!t.o.sub){x.fillStyle=G.co.col;x.fillRect(-L/2+.5,-10,tl-1,2.2);x.fillRect(-L/2+.5,7.8,tl-1,2.2)}
    if(t.o.reefer){x.fillStyle='#3ba3d8';x.fillRect(L/2-16,-6,3,12)}
    x.fillStyle=CAB[t.type];rr(x,L/2-12,-9,12,18,3);x.fillStyle='#1d1f21';x.fillRect(L/2-5,-7,3,14);if(nt>.2&&t.path.length){x.fillStyle='rgba(255,240,170,.9)';x.fillRect(L/2-.5,-7,2,3);x.fillRect(L/2-.5,4,2,3)}
    const cols=Math.ceil(t.T.cap/2),sz=Math.min(8,(tl-3)/cols-.6),cold=t.cold?t.loaded:t.lc;for(let i=0;i<t.loaded;i++)pallet(x,-L/2+2+sz/2+Math.floor(i/2)*(sz+.6),(i%2?4.5:-4.5),sz,i<cold);x.restore();
    const lab=t.noShow?'ON STRIKE':{broken:'⚠',service:'SERVICE',await:'WAITING TO OPEN',pickup:'BACKHAUL',break:'BREAK'}[t.state];if(lab){x.fillStyle=t.state==='service'||t.state==='break'?'#1d1f21':'#c8281e';x.font='700 8px '+FONT;x.fillText(lab,t.x+13,t.y+3)}}
  for(const b of owned())for(const f of S.deps[b].forks){x.save();x.translate(f.x,f.y);x.rotate(f.da);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(-5,-3.5,10,9);x.fillStyle='#f5a300';rr(x,-6,-4.5,10,9,2);x.fillStyle='#1d1f21';x.fillRect(-3,-3,4,6);
    x.strokeStyle='#33363a';x.lineWidth=1.2;x.beginPath();x.moveTo(4,-2.5);x.lineTo(10,-2.5);x.moveTo(4,2.5);x.lineTo(10,2.5);x.stroke();if(f.carry)pallet(x,9,0,7,f.cold);x.restore();x.fillStyle='#1d1f21';x.font='700 6px '+FONT;x.fillText(f.state==='charge'?'⚡':f.i+1,f.x-2,f.y-7);x.fillStyle='#26282b';x.fillRect(f.x+3,f.y-11,8,2.5);x.fillStyle=f.bat>40?'#27c267':f.bat>15?'#f5a300':'#c8281e';x.fillRect(f.x+3,f.y-11,8*f.bat/100,2.5)}
  x.setTransform(dp,0,0,dp,0,0);if(nt>0){x.fillStyle='rgba(12,20,48,'+nt+')';x.fillRect(0,0,r.width,r.height)}
  if(C.wx==='rain'){x.strokeStyle='rgba(200,225,255,.45)';x.lineWidth=.8;x.beginPath();for(let i=0;i<90;i++){const a=Math.random()*r.width,b=Math.random()*r.height;x.moveTo(a,b);x.lineTo(a-3,b+8)}x.stroke();x.fillStyle='rgba(30,50,80,.12)';x.fillRect(0,0,r.width,r.height)}}

/* ---------- interface ---------- */
function tStatus(t){const n=t.stops.length,s=n?DEFS[t.stops[Math.min(t.si,n-1)].i].n:'',more=n>1&&t.state==='loading'?' + '+(n-1)+' more drop'+(n>2?'s':''):n>1?' (drop '+(t.si+1)+' of '+n+')':'';
  if(t.retire)return'Being returned';if(t.noShow)return'Driver on strike today';if(!t.o.sub&&t.state==='wait'){if(S.clock<t.o.drv.start)return'Driver starts '+hhmm(t.o.drv.start);if(t.off)return'Signed off for the day'}
  return t.svc?'Booked for service when free':t.paper>0?'Loaded, waiting on paperwork':{wait:'Waiting for a dock',break:'Driver on a 30 minute break',service:'In the workshop',dockIn:'Backing in',pickup:'Collecting a backhaul load',loading:t.bh?'Unloading backhaul, '+t.loaded+' left':!n?(t.pq[0]?'Waiting for the '+hhmm(t.pq[0].seal)+' run':'At dock, nothing to load yet'):`Loading ${t.loaded}/${t.qty} for ${s}${more}`,out:'Driving to '+s+more,broken:'Broken down',await:'Waiting for '+s+' to open',unload:'Unloading at '+s+more,back:'Heading back'}[t.state]}
function advice(){const g=G.deps[sel],sd=S.deps[sel],own=S.trucks.filter(t=>!t.inb&&t.b===sel),ids=onStores(sel),empty=ids.some(i=>G.stores[i].stock===0),wait=own.filter(t=>t.state==='wait'&&t.duty).length,atDepot=own.filter(t=>t.state==='wait'||t.state==='loading'||t.state==='dockIn'||t.state==='break').length,
  idleDock=own.some(t=>t.state==='loading'&&!t.stops.length),late=S.trucks.some(t=>t.inb&&t.b===sel&&t.site>120),other=owned().find(b=>b!==sel&&onStores(b).some(i=>G.stores[i].stock===0)),c=S.clock,shift=c>=g.s0&&c<g.s1;let m,col='var(--good)';
  if(!speed&&c<=S.t0+.1){m='Gates closed. Check conditions, shifts, orders and the plan board, then press a speed.';col='#1d1f21'}
  else if(!speed){m='Paused.';col='#1d1f21'}
  else if(!g.own){m='You don\'t own '+DEPN[sel]+' yet.';col='#1d1f21'}
  else if(!shift&&empty&&c>=TRADE0){m=DEPN[sel]+' is shut but its stores are still trading and running empty. A longer shift would cover them.';col='var(--bad)'}
  else if(!shift){m=DEPN[sel]+' is closed. Shift runs '+hhmm(g.s0)+' to '+hhmm(g.s1)+'.';col='#1d1f21'}
  else if(g.wh-sd.whRes<=0&&own.some(t=>t.state==='loading'&&t.stops.length)){m=DEPN[sel]+' is out of stock. Trucks can\'t be loaded. Order more inbound, rush a load or transfer.';col='var(--bad)'}
  else if(late){m='A supplier truck has been kept over 2 hours. That costs $60 an hour, and after 3 hours it leaves.';col='var(--bad)'}
  else if(g.wh+sd.whIn>=whCap(sel)&&S.trucks.some(t=>t.inb&&!t.cold&&t.b===sel)){m='The racks are full. Inbound stock can\'t be unloaded.';col='#f5a300'}
  else if(g.chill&&ids.some(i=>G.stores[i].cstock===0)&&!own.some(t=>t.o.reefer)){m='Chilled shelves are empty and no truck here has a fridge unit. Fit one in the Fleet tab.';col='var(--bad)'}
  else if(ids.some(i=>G.stores[i].stock===0&&DEFS[i].tg)&&!own.some(t=>t.T.tg)){m='A tailgate-only store is empty and this depot has no tailgate truck. Lease a Van or Rigid 10 TG.';col='var(--bad)'}
  else if(empty&&sd.fUtil>.88&&atDepot){m='Forklifts are flat out and shelves are empty. Hire, raise pay or fit dock levellers.';col='var(--bad)'}
  else if(empty&&!atDepot){m='Shelves are empty and every truck is on the road. You need more truck capacity.';col='var(--bad)'}
  else if(empty&&wait&&!idleDock){m='Trucks are queuing for a dock while shelves sit empty.';col='var(--bad)'}
  else if(empty){m='A store has run out. Each empty-shelf sale costs '+money(LOST)+' and goodwill.';col='var(--bad)'}
  else if(other!=null){m='Shelves are empty over at '+DEPN[other]+'.';col='var(--bad)'}
  else if(!g.sup&&sd.forks.length>4){m='More than 4 operators and no supervisor here: they\'re getting in each other\'s way.';col='#f5a300'}
  else if(!G.tr&&G.fleet.length>4){m='More than 4 trucks and no transport supervisor: departures wait on paperwork and nobody plans around delivery windows.';col='#f5a300'}
  else if(sd.fUtil<.3&&sd.forks.length>1&&c>g.s0+120){m='Operators are standing around. Idle hands still get paid.';col='#f5a300'}
  else m='Running smoothly.';
  $('#advice').textContent=m;$('#advice').style.borderLeftColor=col}
const seg=(act,opts,cur)=>`<div class="seg">${opts.map(o=>`<button data-act="${act}:${o[0]}" class="${o[0]===cur?'on':''}">${o[1]}</button>`).join('')}</div>`;
const chips=()=>`<div class="chips">${DEPN.map((n,b)=>`<button data-act="sel:${b}" class="${b===sel?'on':''}">${n.replace(' DC','')}${G.deps[b].own?'':' 🔒'}</button>`).join('')}</div>`;
const tsel=(act,cur,from,to,stepm)=>{let h=`<select data-chg="${act}">`;for(let m=from;m<=to;m+=stepm)h+=`<option value="${m}" ${m===cur?'selected':''}>${hhmm(m)}</option>`;return h+'</select>'};
function buyCard(b){const prev=b===0||G.deps[b-1].own;return`<h3>${DEPN[b]}</h3><p>A second site with its own docks, crew, stock, shift and trucks, and ten more stores around it that pay ${Math.round(b*8)}% more. Rent ${money(OVER+2*OVER_DOCK)} a day from the moment you sign.</p><p>Opens with two launch contracts, 2 operators, 80 pallets and a leased Rigid 16.</p><button class="pri" data-act="buydep:${b}" ${!prev||G.cash<DEPCOST[b]?'disabled':''}>Buy for ${money(DEPCOST[b])}</button>${!prev?'<p style="margin-top:8px">Buy '+DEPN[b-1]+' first.</p>':G.cash<DEPCOST[b]?'<p style="margin-top:8px">You need '+money(DEPCOST[b]-G.cash)+' more. A loan counts.</p>':''}`}
function syncPlan(o){const t=S.trucks.find(t=>t.o===o);if(t)t.pq=o.plan.filter(r=>r.seal>S.clock-30).map(r=>({seal:r.seal,stops:r.stops.slice()})).sort((a,c)=>a.seal-c.seal)}
function autoPlan(){const g=G.deps[sel],left=onStores(sel).sort((a,b)=>DEFS[b].km-DEFS[a].km),fl=G.fleet.filter(o=>o.dep===sel).sort((a,b)=>TYPES[b.type].cap-TYPES[a.type].cap);
  for(const o of fl){const T=TYPES[o.type],ok=i=>!DEFS[i].tg||T.tg;let k=left.findIndex(ok);o.plan=[];if(k<0){left.push(...onStores(sel).filter(ok).sort((a,b)=>DEFS[b].dem-DEFS[a].dem));k=left.findIndex(ok)}if(k<0){syncPlan(o);continue}const st=[left.splice(k,1)[0]];
    while(st.length<G.maxDrops){let bi=-1,bk=26;left.forEach((j,n)=>{const d=hopKm(st[st.length-1],j);if(ok(j)&&d<bk){bk=d;bi=n}});if(bi<0)break;st.push(left.splice(bi,1)[0])}
    const d=DEFS[st[0]],seal=Math.max(Math.max(o.drv.start,g.s0)+30,Math.ceil((d.open-d.km*60/T.kmh-15)/15)*15);let km=d.km+DEFS[st[st.length-1]].km;for(let j=1;j<st.length;j++)km+=hopKm(st[j-1],st[j]);
    const cyc=Math.ceil((km*60/T.kmh*1.15+st.length*25+60)/15)*15,end=Math.min(o.drv.start+690,g.s1+60);for(let t=seal;t+cyc-60<=end&&o.plan.length<8;t+=cyc)o.plan.push({seal:t,stops:st.slice()});syncPlan(o)}}
function planHtml(){const g=G.deps[sel];if(!g.own)return'';const fl=G.fleet.filter(o=>o.dep===sel);if(!fl.some(o=>o.id===draft.truck))draft.truck=fl[0]?fl[0].id:0;const ids=onStores(sel);draft.stops=draft.stops.filter(i=>ids.includes(i));
  return`<h3>Plan board</h3>${chips()}<p>Planned runs repeat every day. A truck starts loading 45 minutes before its seal time and splits the load between the stops in order. ${G.auto?'With no planned run due, trucks plan their own.':'Auto-dispatch is off: trucks only do planned runs.'}</p>
  <div class="seg" style="margin-bottom:8px"><button data-act="ap">Auto-plan the day</button><button data-act="pc">Clear plans</button><button data-act="auto" class="${G.auto?'on':''}">Auto-dispatch ${G.auto?'on':'off'}</button></div>`+
  fl.map(o=>`<div class="run"><b>${TYPES[o.type].n} #${o.id} · ${o.drv.n}</b><span>Driver on from ${hhmm(o.drv.start)}${o.plan.length?'':' · no planned runs'}</span>${o.plan.map((r,j)=>`<div class="stop">${hhmm(r.seal)} → ${r.stops.map(i=>DEFS[i].n).join(', ')} <a href="#" data-act="pd:${o.id}:${j}">remove</a></div>`).join('')}</div>`).join('')+
  `<div class="run"><b>Add a run</b><div class="trow" style="margin:6px 0"><select data-chg="dtruck">${fl.map(o=>`<option value="${o.id}" ${o.id===draft.truck?'selected':''}>${TYPES[o.type].n} #${o.id}</option>`).join('')}</select>${tsel('dseal',draft.seal,g.s0,g.s1-60,30)}</div>
  <p style="margin:0 0 4px">Tap stores in drop order (up to 5):</p><div class="stopchips">${ids.map(i=>{const n=draft.stops.indexOf(i);return`<button data-act="ds:${i}" class="${n>=0?'on':''}">${n>=0?(n+1)+'. ':''}${DEFS[i].n}</button>`}).join('')}</div><button class="pri" data-act="pa" style="margin-top:8px" ${draft.stops.length&&draft.truck?'':'disabled'}>Add run</button></div>`}
function runsHtml(){const d=S.d,own=S.trucks.filter(t=>!t.inb&&!t.noShow),k=kpis(),row=(a,b)=>`<tr><td>${a}</td><td>${b}</td></tr>`;
  return`<h3>Transport daily runsheet</h3><table>${row('Total loads',d.loads)}${row('Drivers',own.length)}${row('Total pallets',S.runs.reduce((a,r)=>a+r.pal,0))}${row('Total drops',S.runs.reduce((a,r)=>a+r.stops.length,0))}${row('Drop ratio',k.ratio)}${row('Driver ratio / load',k.drv)}${row('At the dock now',own.filter(t=>t.state==='loading').length)}${row('Late arrivals',d.late)}</table><h3>Loads</h3>`+
  (S.runs.slice(-40).reverse().map(r=>`<div class="run"><b>${r.no} · ${r.t} · ${r.drv}${r.plan?' <span class="tag">PLANNED</span>':''}</b><span>${DEPN[r.b]} · sealed ${hhmm(r.seal)} · ${r.pal} pallets${r.cold?' ('+r.cold+' chilled)':''} · ${Math.round(r.km)} km · ${r.status}</span>${r.stops.map((s,j)=>`<div class="stop ${s.late?'neg':s.arr?'pos':''}">${j+1}. ${DEFS[s.i].n} · ${s.q} pal · window ${hr(DEFS[s.i].open)}–${hr(DEFS[s.i].close)} · ${s.arr?hhmm(s.arr)+(s.late?' LATE':' ✓'):'due'}</div>`).join('')}</div>`).join('')||'<p>No loads despatched yet today.</p>')}
function render(){document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.act==='tab:'+tab));
  document.querySelectorAll('#speed button').forEach(b=>b.classList.toggle('on',b.dataset.act==='speed:'+speed));const sb=$('#snd');if(sb)sb.textContent=SET.mute?'🔇':'🔊';
  const g=G.deps[sel],sd=S.deps[sel];let h='';
  if(tab==='team'){h=chips();if(!g.own)h+=buyCard(sel);else{const others=owned().filter(b=>b!==sel);
    h+=`<h3>Today</h3><ul class="cond">${condList(G.cond,G.day0).map(x=>'<li>'+x+'</li>').join('')}</ul>
    <h3>Shift at ${DEPN[sel]}</h3><p>Stores trade 6am to 9pm. Crew and docks only work during the shift. Hours before 6am pay 30% extra, after 6pm 20% extra. An earlier start applies from tomorrow.</p>
    ${seg('s0',[[120,'2am start'],[240,'4am start'],[360,'6am start']],g.s0)}<div style="margin-top:4px">${seg('s1',[[1080,'6pm finish'],[1200,'8pm finish'],[1320,'10pm finish']],g.s1)}</div>
    <h3>Stock</h3><div class="rowx"><div class="t"><b><span data-v="wh"></span> pallets</b><span>Storage costs $${STOR.toFixed(2)} a pallet each night</span></div><div class="meter"><i data-w="whp"></i></div></div>
    <div class="rowx"><div class="t"><b>Extend the racking</b><span>+100 pallets of space (${g.rack}/4 built)</span></div><button data-act="rack" ${g.rack>=4||G.cash<RACK?'disabled':''}>${g.rack>=4?'Maxed':money(RACK)}</button></div>
    <h3>Pallet inflow</h3><p>Suppliers truck stock in, ${LOAD} pallets a load. Your forklifts unload them at the same docks your trucks use.</p>
    <div class="rowx"><div class="t"><b>${g.order} pallets a day</b><span>${Math.ceil(g.order/LOAD)} loads. <span data-v="ord"></span> sent so far. Stores here want about <span data-v="need"></span> today.</span></div></div>
    <div class="seg" style="margin-bottom:8px"><button data-act="ord:-50">−50</button><button data-act="ord:-10">−10</button><button data-act="ord:10">+10</button><button data-act="ord:50">+50</button></div>
    ${seg('inm',[['spread','Spread out<small>evenly through the shift</small>'],['early','Front-loaded<small>every 20 min from the start</small>']],g.inMode)}
    <div class="rowx"><div class="t"><b>Rush load</b><span>${LOAD} pallets on the way right now</span></div><button data-act="rush">Order ${money(RUSH)}</button></div>
    ${others.map(b=>`<div class="rowx"><div class="t"><b>Transfer to ${DEPN[b]}</b><span>${LOAD} pallets from here by linehaul</span></div><button data-act="xfer:${b}">Send ${money(XFER)}</button></div>`).join('')}
    <h3>Chilled goods</h3>${g.cool?`<div class="rowx"><div class="t"><b>Cool room: <span data-v="cold"></span></b><span>15% of what's left spoils each night at ${money(SPOIL)} a pallet. Order only what you'll ship.</span></div><button data-act="cool" ${g.cool>=3||G.cash<COOL?'disabled':''}>${g.cool>=3?'Maxed':'+40 '+money(COOL)}</button></div>
    <div class="rowx"><div class="t"><b>Chilled range ${g.chill?'on sale':'not on sale'}</b><span>Stores here sell 25% more, as chilled, at 1.5× the rate. Only trucks with a fridge unit can carry it. Stores want about <span data-v="cneed"></span> a day.</span></div><button data-act="chill" class="${g.chill?'on':''}">${g.chill?'On':'Off'}</button></div>
    <div class="rowx"><div class="t"><b>Chilled order: ${g.corder} a day</b><span><span data-v="cord"></span> sent so far today</span></div><div style="display:flex;gap:6px"><button data-act="cord:-10" ${g.corder<=0?'disabled':''}>−10</button><button data-act="cord:10">+10</button></div></div>`
    :`<div class="rowx"><div class="t"><b>Build a cool room</b><span>Unlocks chilled goods at this depot's stores: a quarter more volume at 1.5× the rate, but it needs fridge trucks and it spoils.</span></div><button data-act="cool" ${G.cash<COOL?'disabled':''}>${money(COOL)}</button></div>`}
    <h3>Forklift operators</h3><p>Each moves about ${(8*PAY[G.pay].sp*mm()*eff(sel)).toFixed(1)} pallets an hour, in or out. Paid for the whole shift, busy or not.</p>
    <div class="rowx"><div class="t"><b>${g.fk} employed${sd.sick?', '+sd.sick+' off':''}</b><span>Busy <span data-v="futil"></span> of the time</span></div><div style="display:flex;gap:6px"><button data-act="fire" ${g.fk<=1?'disabled':''}>−</button><button data-act="hire" ${g.fk>=12?'disabled':''}>Hire ${money(HIRE)}</button></div></div>
    <div class="rowx"><div class="t"><b>Agency casuals today: ${sd.casual}</b><span>$${AGENCY}/h, gone tonight. For promo days and sick days.</span></div><div style="display:flex;gap:6px"><button data-act="cas:-1" ${sd.casual<=0?'disabled':''}>−</button><button data-act="cas:1" ${sd.forks.length>=12?'disabled':''}>+1</button></div></div>
    <div class="rowx"><div class="t"><b>Batteries</b><span>A forklift lasts about 5½ working hours, then ${G.up.batt?'swaps batteries in 6 minutes':'recharges for 45 minutes'}. <span data-v="chg"></span> charging now.</span></div></div>
    <div class="rowx"><div class="t"><b>Morale ${Math.round(G.morale)}</b><span>${G.morale<40?'Low: expect sick days and slow work':G.morale>75?'High: the crew works faster':'Steady'}. Moves overnight with pay and workload.</span></div><div class="meter"><i style="width:${G.morale}%;background:${G.morale>60?'var(--good)':G.morale>35?'#f5a300':'var(--bad)'}"></i></div></div>
    <h3>Forklift assignment</h3>${seg('fkm',[['auto','Auto<small>spread across docks</small>'],['manual','Manual<small>you pick the dock</small>']],g.fkMode)}
    ${g.fkMode==='manual'?'<div class="fkgrid">'+sd.forks.map(f=>`<label>Forklift ${f.i+1}<select data-chg="fd:${f.i}"><option value="-1">Float</option>${sd.docks.filter(d=>d.on).map((d,j)=>`<option value="${j}" ${g.fkDock[f.i]===j?'selected':''}>Dock ${j+1}</option>`).join('')}</select></label>`).join('')+'</div><p>A forklift pinned to a dock waits there when it has no truck. Floaters go wherever they are needed.</p>':'<p>Forklifts share themselves out between every truck at a dock.</p>'}
    <div style="margin-top:6px">${seg('fkp',[['bal','Balanced'],['out','Deliveries first'],['in','Inflow first']],G.fkPri)}</div>
    <h3>Warehouse supervisor</h3><div class="rowx"><div class="t"><b>${g.sup?'On staff':'None'} at ${DEPN[sel]}</b><span>$${SUPW}/h. Crew works 10% faster, fewer sick days and accidents, better morale. Without one, a crew over 4 slows down.</span></div><button data-act="sup" class="${g.sup?'on':''}">${g.sup?'Let go':'Hire'}</button></div>
    <h3>Warehouse pay (all depots)</h3>${seg('pay',PAY.map((p,i)=>[i,`${p.n}<small>$${p.w}/h · ${p.sp<1?'slower':p.sp>1?'faster':'normal'}</small>`]),G.pay)}
    <h3>Loading docks</h3><div class="rowx"><div class="t"><b>${g.docks} of ${ND} open</b><span>Shared by your trucks and suppliers. ${money(OVER_DOCK)} a day each.</span></div><button data-act="dock" ${g.docks>=ND||G.cash<DOCK?'disabled':''}>Build ${money(DOCK)}</button></div>`}}
  else if(tab==='fleet'){const mine=S.trucks.filter(t=>!t.inb&&t.b===sel);
    h=`<h3>Dispatch rules (all depots)</h3><p>Send a truck when it can carry at least:</p>${seg('min',[[.25,'¼ load'],[.5,'½ load'],[.75,'¾ load'],[1,'Full']],G.minLoad)}
    <p style="margin:8px 0 4px">Most stores on one run:</p>${seg('drops',[[1,'1 drop'],[2,'2'],[3,'3'],[4,'4'],[5,'5']],G.maxDrops)}
    <div class="rowx"><div class="t"><b>Toll roads</b><span>Every leg 20% quicker for $${TOLL.toFixed(2)} a km.</span></div><button data-act="tolls" class="${G.tolls?'on':''}">${G.tolls?'Using':'Avoiding'}</button></div>
    <div class="rowx"><div class="t"><b>Backhaul pickups</b><span>After the last drop, collect supplier freight on the way home: ${money(BH)} a pallet and free stock, but 25 min longer and it needs unloading.</span></div><button data-act="bh" class="${G.backhaul?'on':''}">${G.backhaul?'On':'Off'}</button></div>
    <div class="rowx"><div class="t"><b>Transport supervisor</b><span>$${SUPW}/h, 6am to 6pm. Plans runs around receiving hours, cuts fuel 6%, no paperwork delays. Without one, a fleet over 4 waits before every departure.</span></div><button data-act="tr" class="${G.tr?'on':''}">${G.tr?'Let go':'Hire'}</button></div>
    <h3>Diesel</h3><div class="rowx"><div class="t"><b>$${price().toFixed(2)} a litre today</b><span>Trucks fill from your tank first. When it's dry they pay 10% more at the roadside ($${(price()*1.1).toFixed(2)}).</span></div><div class="bars" style="width:90px;height:38px;margin:0">${G.fuelHist.map((f,i)=>`<i style="height:${Math.min(100,(f-.6)*70)}%;background:${i===G.fuelHist.length-1?'#1d1f21':'#b9b6ad'}"></i>`).join('')}</div></div>
    <div class="rowx"><div class="t"><b>Fuel tank: <span data-v="tank"></span></b><span>Buy when it's cheap, burn it when it's dear. Used today: <span data-v="lit"></span></span></div><div class="meter" style="width:70px"><i data-w="tankp"></i></div></div>
    <div class="seg"><button data-act="fuel:500">+500 L<small>${money(500*price())}</small></button><button data-act="fuel:2000">+2,000 L<small>${money(2000*price())}</small></button><button data-act="fuel:99999">Fill<small data-v="fillc"></small></button></div>
    <h3>Trucks and drivers at</h3>${chips()}`;
    if(!g.own)h+='<p>You don\'t own this depot yet.</p>';else{h+=`<p>A driver works up to 12 hours from their start time, at time and a half after 10, and takes a 30 minute break after 5 hours at the wheel. Stagger start times to cover the day. Drivers gain a star every 4 days and get quicker and safer.</p>`+(mine.map(t=>`<div class="truck"><div class="rowx"><div class="t"><b>${t.T.n} #${t.id}${t.o.sub?'<span class="tag">SUBBIE</span>':t.o.own?'<span class="tag">OWNED</span>':''}${t.o.reefer?'<span class="tag">FRIDGE</span>':''}</b><span>${t.o.sub?'':t.o.drv.n+' '+stars(t.o)+(t.o.drv.tired?' · tired today':'')+' · '}<span data-v="t${t.id}"></span></span></div>${t.o.sub?'':`<div class="meter" style="width:70px"><i data-w="c${t.id}"></i></div>`}</div>
      <div class="trow"><select data-chg="route:${t.id}"><option value="-1">Any store</option>${onStores(sel).filter(i=>!DEFS[i].tg||t.T.tg).map(i=>`<option value="${i}" ${t.o.route===i?'selected':''}>Only ${DEFS[i].n}</option>`).join('')}</select>${t.o.sub?'':tsel('dstart:'+t.id,t.o.drv.start,g.s0,840,120)}</div>
      <div class="trow" style="margin-top:6px">${t.o.sub?'':`<button data-act="fridge:${t.id}" class="${t.o.reefer?'on':''}">Fridge ${money(FRIDGE)}/day</button><button data-act="svc:${t.id}" ${t.svc||t.state==='service'?'disabled':''}>Service ${money(t.T.svc)}</button>`}<button data-act="ret:${t.id}" ${t.retire||(!t.o.sub&&G.fleet.filter(o=>o.dep===sel).length<=1)?'disabled':''}>${t.o.sub?'Send home':t.o.own?'Sell '+money(resale(t.o)):'Return'}</button></div></div>`).join('')||'<p>None.</p>')+
    `<h3>Lease or buy for ${DEPN[sel]}</h3><p>A lease is charged per day, starting now. Buying has no daily lease and resells for half, less wear. Each truck comes with a driver at $${DRIVER}/h. TG means tailgate: the only trucks that can deliver to stores with no dock.</p>`+
    ['van','r10','r16','semi'].map(k=>{const T=TYPES[k],full=G.fleet.filter(o=>o.dep===sel).length>=12;return`<div class="rowx"><div class="t"><b>${T.n} · ${T.cap} pallets${k==='van'?' · TG':''}</b><span>${money(T.lease)}/day · ${T.l} L/100 km · $${perKm(T).toFixed(2)}/km today · ${T.kmh} km/h</span></div><div style="display:flex;gap:6px"><button data-act="lease:${k}" ${full?'disabled':''}>Lease</button><button data-act="buy:${k}" ${full||G.cash<BUY[k]?'disabled':''}>Buy ${money(BUY[k])}</button></div></div>`}).join('')+
    `<h3>Subcontractors, today only</h3><p>No lease, no driver hours, no fuel bill: a ${money(CALLOUT)} call-out and a rate per kilometre.</p>`+
    ['r10','semi'].map(k=>{const T=TYPES[k];return`<div class="rowx"><div class="t"><b>${T.n} subbie</b><span>$${T.subkm.toFixed(2)}/km all in</span></div><button data-act="sub:${k}">Call in</button></div>`}).join('')}}
  else if(tab==='stores'){h=owned().map(b=>`<h3>${DEPN[b]} contracts</h3>`+onStores(b).map(i=>{const d=DEFS[i];return`<div class="rowx"><div class="t"><b>${d.n}${G.cond.promo===i?'<span class="tag">PROMO</span>':''}${G.cond.road===i?'<span class="tag">ROADWORKS</span>':''}${d.tg?'<span class="tag">TAILGATE</span>':''}${d.reg?'<span class="tag">REGIONAL</span>':''}</b><span>${d.km} km · ${money(payOf(i))}/pallet${G.stores[i].dm>1?' · grown '+Math.round((G.stores[i].dm-1)*100)+'%':''} · wants <span data-v="r${i}"></span>/h${d.open>300||d.close<1200?' · receives '+hr(d.open)+'–'+hr(d.close)+(d.strict?' strict':''):''}<br>Stock <span data-v="s${i}"></span>${chill(i)?' · Chilled <span data-v="cs'+i+'"></span>':''} · On the way <span data-v="i${i}"></span> · Goodwill <span data-v="g${i}"></span></span></div><div class="meter"><i data-w="g${i}"></i></div></div>`}).join('')).join('');
    const lost=G.stores.map((s,i)=>!s.on&&s.lock>G.day0&&G.deps[DEFS[i].b].own?i:-1).filter(i=>i>=0);if(lost.length)h+='<h3>With rivals</h3>'+lost.map(i=>`<p>${DEFS[i].n}: ${RIVALS[i%3]} holds it until day ${G.stores[i].lock}.</p>`).join('');
    const o=nextOffer();h+=o>=0?`<p style="margin-top:10px">Next tender: <b style="color:var(--ink)">${DEFS[o].n}</b> (${DEPN[DEFS[o].b]}), ${DEFS[o].km} km, list rate ${money(DEFS[o].rate)}/pallet. ${winText(o)} You're invited after a day with shelves stocked 90%+.</p>`:'<p style="margin-top:10px">No tenders open right now.</p>';
    h+=`<p>Goodwill rises with every sale and drops with empty shelves and late trucks. Below 30 a rival may poach the store; at zero it cancels. Every 7th day each store reviews the week.</p>`}
  else if(tab==='invest'){h='<h3>Depots</h3>'+DEPN.map((n,b)=>`<div class="rowx"><div class="t"><b>${n}</b><span>${G.deps[b].own?onStores(b).length+' of 10 stores signed':'Ten more stores, '+Math.round(b*8)+'% better rates'}</span></div><button data-act="${G.deps[b].own?'sel:'+b:'buydep:'+b}" ${G.deps[b].own||((b===0||G.deps[b-1].own)&&G.cash>=DEPCOST[b])?'':'disabled'}>${G.deps[b].own?'Owned':money(DEPCOST[b])}</button></div>`).join('')+
    '<h3>Upgrades</h3>'+Object.entries(UPS).map(([k,u])=>`<div class="rowx"><div class="t"><b>${u[0]}</b><span>${u[2]}</span></div><button data-act="up:${k}" ${G.up[k]||G.cash<u[1]?'disabled':''}>${G.up[k]?'Owned':money(u[1])}</button></div>`).join('')+
    `<h3>Bank loan</h3><div class="rowx"><div class="t"><b>Owing ${money(G.loan)}</b><span>${(LOAN_RATE*100).toFixed(1)}% interest a day (${money(G.loan*LOAN_RATE)} tomorrow). Limit ${money(LOAN_MAX)}.</span></div><div style="display:flex;gap:6px"><button data-act="repay" ${G.loan<=0||G.cash<LOAN_STEP?'disabled':''}>Repay</button><button data-act="borrow" ${G.loan>=LOAN_MAX?'disabled':''}>+${money(LOAN_STEP)}</button></div></div>
    <h3>Standing</h3><p>${TIERS.map((t,i)=>`${i<G.tier?'✅':'⬜'} ${t[1]}: ${money(t[0])} net worth`).join('<br>')}</p><p>Net worth is cash minus what you owe: <b style="color:var(--ink)">${money(G.cash-G.loan)}</b>. Scenario: ${SCEN[G.sc][0]}.</p>
    <h3>Achievements</h3><p>${ACH.map(a=>`${G.ach[a[0]]?'🎖':'⬜'} <b style="color:var(--ink)">${a[1]}</b>: ${a[2]}`).join('<br>')}</p>`}
  else if(tab==='runs')h=planHtml()+'<div id="runs">'+runsHtml()+'</div>';
  else{const mx=Math.max(1,...G.hist.slice(-14).map(x=>Math.abs(x.profit)));h=`<h3>Today so far</h3><table><tr><td>Delivery and backhaul income</td><td data-v="lrev"></td></tr><tr><td>Wages</td><td data-v="lwage"></td></tr><tr><td>Fuel, running, tolls, subcontractors</td><td data-v="lfuel"></td></tr><tr><td>Leases, rent, interest</td><td data-v="lfix"></td></tr><tr><td>Penalties, fees, repairs</td><td data-v="lpen"></td></tr><tr><td>Investments and one-offs</td><td data-v="loth"></td></tr>
    <tr class="tot"><td>Profit</td><td data-v="lprof"></td></tr></table><h3>Runsheet numbers</h3><table>${KPI.map(k=>`<tr><td>${k[1]}</td><td data-v="k_${k[0]}"></td></tr>`).join('')}</table>
    <h3>Profit by day</h3>`+(G.hist.length?`<div class="bars">${G.hist.slice(-14).map(x=>`<i title="Day ${x.day}" style="height:${Math.max(4,Math.abs(x.profit)/mx*100)}%;background:${x.profit<0?'var(--bad)':'var(--good)'}"></i>`).join('')}</div><table>`+G.hist.slice(-5).reverse().map(x=>`<tr><td>Day ${x.day} · ${(x.avail*100).toFixed(0)}% stocked</td><td class="${x.profit<0?'neg':'pos'}">${money(x.profit)}</td></tr>`).join('')+'</table>':'<p>Nothing yet.</p>')+
    `<h3>Log</h3><p data-v="log" style="white-space:pre-line"></p><button data-act="restart" style="margin-top:6px">Start a new game</button>`}
  $('#panel').innerHTML=h;$('#kpis').innerHTML=KPI.slice(0,14).map(k=>`<div class="kpi"><small>${k[1]}</small><b data-v="k_${k[0]}">–</b></div>`).join('');live()}
function live(){const d=S.d,pr=d.rev+d.bh-costs(d),g=G.deps[sel],sd=S.deps[sel],k=kpis(),dem=onStores(sel).reduce((a,i)=>a+DEFS[i].dem*G.stores[i].dm,0)*DAYU*S.dayMul*wxMul(),v={futil:(sd.fUtil*100).toFixed(0)+'%',wh:g.wh+' of '+whCap(sel),whp:g.wh/whCap(sel)*100,ord:sd.ordered,
    need:Math.round(dem),cneed:Math.round(dem*.25),cold:g.cold+' of '+coldCap(sel)+' pallets',cord:sd.cordered,tank:num(G.tank)+' of '+num(tankCap())+' L',tankp:G.tank/tankCap()*100,lit:k.lit,fillc:money((tankCap()-G.tank)*price()),chg:sd.forks.filter(f=>f.state==='charge').length,
    lrev:money(d.rev+d.bh),lwage:money(-d.wF-d.wD),lfuel:money(-d.fuel-d.sub-d.toll),lfix:money(-d.lease-d.over-d.int),lpen:money(-d.pen-d.repair-d.det-d.spoil),loth:money(-d.other),lprof:money(pr),log:S.log.slice(0,10).join('\n')};
  for(const key in k)v['k_'+key]=k[key];
  S.trucks.forEach(t=>{if(!t.inb){v['t'+t.id]=tStatus(t)+' · '+t.trips+' run'+(t.trips===1?'':'s')+', '+Math.round(t.km)+' km'+(t.o.sub?'':', '+((t.hours||0)/60).toFixed(1)+' h on duty · condition '+Math.round(t.o.cond)+'%');v['c'+t.id]=t.o.cond}});
  G.stores.forEach((s,i)=>{if(s.on){v['r'+i]=(rate(i)*(chill(i)?1.25:1)).toFixed(1);v['s'+i]=s.stock+'/'+cap(i);v['cs'+i]=s.cstock+'/'+ccap(i);v['i'+i]=s.inbound+s.planned+s.cinb+s.cplan;v['g'+i]=Math.round(s.sat)}});
  document.querySelectorAll('[data-v]').forEach(e=>{const t=v[e.dataset.v];if(t!==undefined&&e.textContent!==String(t))e.textContent=t});
  document.querySelectorAll('[data-w]').forEach(e=>{const q=+v[e.dataset.w];e.style.width=q+'%';e.style.background=q>60?'var(--good)':q>30?'#f5a300':'var(--bad)'});
  if(tab==='runs'){const el=$('#runs');if(el)el.innerHTML=runsHtml()}
  $('#hDay').textContent='Day '+G.day0+' · '+DAYS[(G.day0-1)%7];$('#hTime').textContent=clockStr();$('#hCash').textContent=money(G.cash);$('#hCash').className=G.cash<0?'neg':'';
  $('#hToday').textContent=(pr>0?'+':'')+money(pr);$('#hToday').className=pr<0?'neg':'pos';$('#hNet').textContent=money(G.cash-G.loan);$('#hAv').textContent=k.av;$('#hOt').textContent=k.ot;$('#hLd').textContent=d.loads+' / '+d.drops;advice();tutTick()}
document.addEventListener('change',e=>{const el=e.target.closest('[data-chg]');if(!el)return;const[k,v]=el.dataset.chg.split(':'),val=+el.value;
  if(k==='fd')G.deps[sel].fkDock[+v]=val;else if(k==='dtruck')draft.truck=val;else if(k==='dseal')draft.seal=val;
  else{const o=G.fleet.find(o=>o.id===+v)||(S.trucks.find(t=>t.id===+v)||{}).o;if(o){if(k==='route')o.route=val;else if(k==='dstart'){o.drv.start=val;render()}}}});
document.addEventListener('keydown',e=>{if(e.code==='Escape'){shellEsc();return}if(modal||menuOpen||/SELECT|INPUT/.test(e.target.tagName))return;if(e.code==='Space'){e.preventDefault();if(speed){lastSpeed=speed;speed=0}else speed=lastSpeed;render()}else if('1234'.includes(e.key)){speed=[1,2,4,8][+e.key-1];render()}});
let menuCo={n:'Caselka Freight',col:LIVERY[0]};
function menu(){const inp=$('#coName');if(inp)menuCo.n=inp.value;showModal(`<h2>New network</h2><p>Name your company and pick a livery. It goes on your depots and trucks.</p><input id="coName" maxlength="24" value="${menuCo.n.replace(/"/g,'')}" style="width:100%;font:inherit;font-weight:700;padding:10px;border:1.5px solid #1d1f21;border-radius:6px">
  <div class="seg" style="margin:8px 0 14px">${LIVERY.map((c,i)=>`<button data-act="liv:${i}" style="background:${c};min-height:36px;outline:${c===menuCo.col?'3px solid #ffd200':'none'};outline-offset:1px"></button>`).join('')}</div>
  <h3>Choose a scenario</h3>${Object.entries(SCEN).map(([k,s])=>`<div class="rowx"><div class="t"><b>${s[0]}</b><span>${s[1]}</span></div><button class="pri" data-act="start:${k}">Play</button></div>`).join('')}`)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;if(b.tagName==='A')e.preventDefault();const[a,p,p2]=b.dataset.act.split(':');sfx('click');if(shellAct(a,p,p2,b))return;const g=G.deps[sel],sd=S.deps[sel];
  if(a==='tab')tab=p;else if(a==='speed')speed=+p;else if(a==='sel'){sel=+p;if(tab==='invest')tab='team';view('depot')}
  else if(a==='snd'){G.snd=!G.snd;sfx('click')}
  else if(a==='view')view(p);else if(a==='zoom'){const c=$('#c');zoomAt(+p,c.clientWidth/2,c.clientHeight/2)}
  else if(a==='hire'){g.fk++;charge('other',HIRE);syncForks(sel)}else if(a==='fire'){g.fk--;syncForks(sel)}
  else if(a==='fkm')g.fkMode=p;else if(a==='fkp')G.fkPri=p;else if(a==='pay')G.pay=+p;else if(a==='min')G.minLoad=+p;else if(a==='drops')G.maxDrops=+p;else if(a==='inm')g.inMode=p;
  else if(a==='s0'){g.s0=+p;G.fleet.forEach(o=>{if(o.dep===sel&&o.drv.start<g.s0)o.drv.start=g.s0})}else if(a==='s1'){g.s1=+p;S.t1=Math.max(S.t1,g.s1)}
  else if(a==='tolls')G.tolls=!G.tolls;else if(a==='bh')G.backhaul=!G.backhaul;else if(a==='auto')G.auto=!G.auto;else if(a==='cas'){sd.casual=Math.max(0,sd.casual+ +p);syncForks(sel)}
  else if(a==='sup'){g.sup=!g.sup;say('Warehouse supervisor '+(g.sup?'hired':'let go')+' at '+DEPN[sel]+'.')}else if(a==='tr'){G.tr=!G.tr;say('Transport supervisor '+(G.tr?'hired.':'let go.'))}
  else if(a==='ord')g.order=Math.max(0,Math.min(MAXORD,g.order+ +p));else if(a==='cord')g.corder=Math.max(0,Math.min(300,g.corder+ +p));
  else if(a==='cool'){g.cool++;charge('other',COOL);if(g.cool===1){g.corder=20;say('Cool room built at '+DEPN[sel]+'. Order chilled stock, fit fridge units, then switch the chilled range on.')}else say('Cool room extended.')}
  else if(a==='chill'){g.chill=!g.chill;say('Chilled range '+(g.chill?'now on sale':'withdrawn')+' at '+DEPN[sel]+' stores.')}
  else if(a==='fridge'){const o=G.fleet.find(o=>o.id==p);if(o){o.reefer=!o.reefer;if(o.reefer)charge('lease',FRIDGE)}}
  else if(a==='rush'){charge('other',RUSH);supplier(LOAD,sel);say('Rush load of '+LOAD+' pallets is on its way to '+DEPN[sel]+'.')}
  else if(a==='xfer'){if(g.wh-sd.whRes<LOAD){say('Not enough free stock here to transfer '+LOAD+' pallets.');return}g.wh-=LOAD;charge('other',XFER);supplier(LOAD,+p);say(LOAD+' pallets on the way from '+DEPN[sel]+' to '+DEPN[+p]+'.')}
  else if(a==='rack'){g.rack++;charge('other',RACK);say('Racking extended at '+DEPN[sel]+'.')}
  else if(a==='dock'){sd.docks[g.docks].on=true;g.docks++;charge('other',DOCK);charge('over',OVER_DOCK);say('New dock open at '+DEPN[sel]+'.')}
  else if(a==='buydep'){if(G.cash<DEPCOST[+p])return;buyDepot(+p);tab='team'}
  else if(a==='fuel'){const L=Math.min(+p,tankCap()-G.tank),cost=L*price();if(L<=0||G.cash<cost){say(L<=0?'The tank is full.':'Not enough cash for that much diesel.');return}G.tank+=L;charge('fuel',cost);say('Bought '+num(L)+' L of diesel.')}
  else if(a==='lease'||a==='buy'){if(a==='buy'&&G.cash<BUY[p])return;const o=newTruck(p,sel,a==='buy');addTruck(o);if(a==='buy')charge('other',BUY[p]);else charge('lease',TYPES[p].lease);say(TYPES[p].n+' #'+o.id+(a==='buy'?' bought':' leased')+' for '+DEPN[sel]+'. '+o.drv.n+' is driving.')}
  else if(a==='sub'){const o={id:G.nid++,type:p,cond:100,route:-1,dep:sel,sub:true,plan:[]};addTruck(o);charge('sub',CALLOUT);say(TYPES[p].n+' subcontractor called in for '+DEPN[sel]+'.')}
  else if(a==='ret'){const t=S.trucks.find(t=>t.id==p);if(t){t.retire=true;if(t.o.own){G.cash+=resale(t.o);say(t.T.n+' #'+t.id+' sold for '+money(resale(t.o))+'.')}G.fleet=G.fleet.filter(o=>o.id!=p)}}
  else if(a==='svc'){const t=S.trucks.find(t=>t.id==p);if(t){t.svc=true;say(t.T.n+' #'+t.id+' booked for a service.')}}
  else if(a==='up'){const u=UPS[p];if(G.cash<u[1])return;G.up[p]=true;charge('other',u[1]);if(p==='mess')G.morale=Math.min(100,G.morale+10);say(u[0]+' installed.')}
  else if(a==='borrow'){G.loan+=LOAN_STEP;G.cash+=LOAN_STEP;say('Borrowed '+money(LOAN_STEP)+'.')}
  else if(a==='repay'){G.loan-=LOAN_STEP;G.cash-=LOAN_STEP;say('Repaid '+money(LOAN_STEP)+'.')}
  else if(a==='ap'){autoPlan();say('Runs planned for '+DEPN[sel]+'. Edit them on the plan board.')}else if(a==='pc'){G.fleet.forEach(o=>{if(o.dep===sel){o.plan=[];syncPlan(o)}})}
  else if(a==='ds'){const i=+p,n=draft.stops.indexOf(i);if(n>=0)draft.stops.splice(n,1);else if(draft.stops.length<5)draft.stops.push(i)}
  else if(a==='pa'){const o=G.fleet.find(o=>o.id===draft.truck);if(o){o.plan.push({seal:draft.seal,stops:draft.stops.slice()});o.plan.sort((x,y)=>x.seal-y.seal);syncPlan(o);draft.stops=[]}}
  else if(a==='pd'){const o=G.fleet.find(o=>o.id==p);if(o){o.plan.splice(+p2,1);syncPlan(o)}}
  else if(a==='bid'){const i=+p,j=+p2,s=G.stores[i],d=DEFS[i],gd=G.deps[d.b];if(Math.random()<winChance(j)){s.on=true;s.stock=Math.round(d.cap*.5);s.cstock=0;s.sat=70;s.rm=[.9,1,1.12][j];gd.order=Math.min(MAXORD,gd.order+Math.round(d.dem*DAYU/10)*10);sfx('win');$('#offer').innerHTML='<b class="pos">You won '+d.n+' at '+money(d.rate*s.rm)+' a pallet.</b><p style="margin:4px 0 0">Inbound order at '+DEPN[d.b]+' raised to '+gd.order+' a day to cover it.</p>'}
    else{s.lock=G.day+4;sfx('bad');$('#offer').innerHTML='<b class="neg">'+RIVALS[i%3]+' won '+d.n+'.</b><p style="margin:4px 0 0">It comes back to tender on day '+s.lock+'. A sharper price or a better service record improves your odds.</p>'}save();return}
  else if(a==='next'){hideModal();begin()}
  else if(a==='menu'||a==='restart'){if(a==='restart'&&!confirm('Start a new game? Your current network will be lost.'))return;menu();return}
  else if(a==='liv'){menuCo.col=LIVERY[+p];menu();return}
  else if(a==='start'){const inp=$('#coName');newGame(p,{n:(inp&&inp.value.trim())||'Caselka Freight',col:menuCo.col});hideModal();begin();view('depot')}
  else if(a==='continue'){hideModal()}
  render()});
function begin(){G.day0=G.day;if(speed)lastSpeed=speed;speed=0;if(!G.deps[sel].own)sel=0;draft.seal=G.deps[sel].s0+30;startDay()}

let last=performance.now(),acc=0,uiT=0;
function frame(now){const dt=Math.min(.1,(now-last)/1000);last=now;if(!G||!S){requestAnimationFrame(frame);return}
  if(!modal&&!S.over&&speed){acc+=dt*speed*2;let n=0;while(acc>.1&&n<40&&!S.over){step(.1);acc-=.1;n++}if(n===40)acc=0}
  draw();uiT+=dt;if(uiT>.35){uiT=0;if(!S.over)live()}requestAnimationFrame(frame)}
addEventListener('resize',()=>clampCam());
requestAnimationFrame(frame);
