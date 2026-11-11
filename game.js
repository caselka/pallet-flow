/* Pallet Flow: Depot Manager. No libraries. */
const $=s=>document.querySelector(s),money=n=>(n<0?'−$':'$')+Math.abs(Math.round(n)).toLocaleString('en-AU'),num=n=>Math.round(n).toLocaleString('en-AU');
const BW=800,NB=3,WW=BW*NB,WH=1000,OX=140,DW=520,DOOR_Y=150,HOLD_Y=260,OUT_Y=304,BACK_Y=320,RACK_Y=44,CROSS=[312,560,800],ND=6,NH=7;
const trunkX=b=>b*BW+400,dockX=(b,j)=>b*BW+OX+60+80*j,holdX=(b,k)=>b*BW+OX+20+80*k,gateX=b=>b*BW+70;
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],KEY='palletflow-game-v4';
const FONT='"Avenir Next Condensed","Roboto Condensed","Arial Narrow",system-ui,sans-serif';
const TYPES={van:{n:'Van',cap:4,tg:1,lease:90,l:10,run:.16,kmh:55,len:30,svc:250,col:'#f5c400'},r10:{n:'Rigid 10 TG',cap:10,tg:1,lease:150,l:20,run:.3,kmh:50,len:40,svc:350,col:'#1f9e8a',subkm:1.6},
  r16:{n:'Rigid 16',cap:16,lease:200,l:26,run:.42,kmh:50,len:52,svc:450,col:'#1f5fa8'},semi:{n:'Semi 24',cap:24,lease:290,l:38,run:.6,kmh:45,len:66,svc:650,col:'#c8281e',subkm:2.5},sup:{n:'Supplier',cap:26,len:66,col:'#5c6066'}};
const DEPN=['Westgate DC','Midway DC','Eastport DC'],DEPCOST=[0,60000,150000];
const NAMES=[['Corner Mart','Greenfields','Harbour St','Ridgeway','Lakeside','Far Coast','Millbrook','Port Albany','Summit','Kingsford'],
  ['Bell Park','Riverton','Oakhurst','Stonebridge','Wattle Grove','Maple Rd','Ferndale','Castle Point','Dunmore','Highfield'],
  ['Seaview','Marlow','Brightwater','Elmwood','Kirra Bay','Redcliff','Ashby','Northgate','Pine Hill','Sandown']];
// street, x, km, pallets/h, $/pallet, shelf cap, opens, closes, tailgate only, strict window
const BASE=[[0,110,6,3,46,16,360,1080,0,0],[0,690,12,4,52,20,420,1080,0,0],[1,220,22,5,56,24,360,1080,1,0],[1,580,30,5,58,26,480,1080,0,0],[1,80,36,5,60,26,360,900,1,0],
  [1,720,44,6,64,30,360,1080,0,0],[2,270,52,6,68,32,420,1020,0,0],[2,540,60,7,72,36,360,1080,0,0],[2,100,70,6,78,32,540,960,0,1],[2,710,80,8,84,44,360,1080,0,0]];
const DEFS=[];for(let b=0;b<NB;b++)BASE.forEach((a,k)=>DEFS.push({n:NAMES[b][k],b,st:a[0],x:b*BW+a[1],y:CROSS[a[0]]+70,km:a[2],dem:+(a[3]*(1+.15*b)).toFixed(1),rate:Math.round(a[4]*(1+.08*b)),cap:a[5],open:a[6],close:a[7],tg:a[8],strict:a[9]}));
const PAY=[{n:'Budget',w:31,sp:.82},{n:'Standard',w:36,sp:1},{n:'Premium',w:43,sp:1.22}];
const UPS={lev:['Dock levellers',4000,'Forklifts work 40% quicker at the dock door, at every depot.'],route:['Route planning software',6000,'Every leg is 12% shorter: less time, less fuel.'],
  train:['Driver training',3500,'Half as many breakdowns.'],back:['Store back rooms',8000,'Every store can hold 25% more stock.'],mess:['Break rooms and canteens',2500,'Crew morale recovers faster.'],tank:['Bigger fuel tank',4000,'The fuel tank holds 8,000 L instead of 2,000 L.'],batt:['Spare forklift batteries',3500,'A flat forklift swaps batteries in 6 minutes instead of recharging for 45.'],levy:['Fuel levy clause',5000,'When diesel is dearer than $1.85, stores pay a levy that covers part of the extra.']};
const TIERS=[[25000,'Bronze'],[100000,'Silver'],[250000,'Gold'],[1000000,'Platinum']];
const DRIVER=40,HIRE=300,DOCK=6000,RACK=5000,OVER=450,OVER_DOCK=120,LOST=15,STOR=1.2,RUSH=250,XFER=120,LOAD=26,LOAN_STEP=5000,LOAN_MAX=60000,LOAN_RATE=.008,SUPW=48,MAXORD=900,CALLOUT=90,AGENCY=52,BH=9,TOLL=.22,BUY={van:5000,r10:8500,r16:11500,semi:17000};
let G,S,speed=0,lastSpeed=2,tab='team',sel=0,modal=false;
const expo=m=>-Math.log(1-Math.random())*m,hhmm=c=>String(Math.floor(c/60)).padStart(2,'0')+':'+String(Math.floor(c%60)).padStart(2,'0'),hr=c=>(c/60)%1?hhmm(c):String(c/60);
const hourMul=c=>{const h=c/60;return h<9?.7:h<12?1:h<14?1.4:h<16?1:1.3};
const cap=i=>Math.round(DEFS[i].cap*(G.up.back?1.25:1)),whCap=b=>200+100*G.deps[b].rack,tankCap=()=>G.up.tank?8000:2000,price=()=>1.85*G.cond.fuel,perKm=T=>T.l/100*price()+T.run,kmOf=k=>k*(G.up.route?.88:1);
const wxMul=()=>G.cond.wx==='rain'?.9:G.cond.wx==='heat'?1.25:1;
const payOf=i=>DEFS[i].rate*G.stores[i].rm*(G.up.levy?1+Math.max(0,G.cond.fuel-1)*.12:1),resale=o=>BUY[o.type]*.5*o.cond/100;
const rate=i=>DEFS[i].dem*G.stores[i].dm*hourMul(S.clock)*S.dayMul*(G.cond.promo===i?1.8:1)*wxMul();
const mm=()=>.9+.2*G.morale/100,eff=b=>{const n=S.deps[b].forks.length;return G.deps[b].sup?1.1:n>4?Math.max(.6,1-.07*(n-4)):1};
const owned=()=>G.deps.map((g,b)=>g.own?b:-1).filter(b=>b>=0),onStores=b=>G.stores.map((s,i)=>s.on&&(b==null||DEFS[i].b===b)?i:-1).filter(i=>i>=0);
function charge(k,a){G.cash-=a;S.d[k]+=a}
function say(m){$('#toast').textContent=m;S.log.unshift(clockStr()+' '+m);if(S.log.length>40)S.log.pop()}
const clockStr=()=>hhmm(Math.min(1080,S.clock));
function save(){try{localStorage.setItem(KEY,JSON.stringify(G))}catch(e){}}
function norm(g){g.backhaul=!!g.backhaul;g.tolls=!!g.tolls;g.stores.forEach(s=>{s.rm=s.rm||1;s.dm=s.dm||1;s.wSold=s.wSold||0;s.wLost=s.wLost||0;s.wRev=s.wRev||0});return g}
function load(){try{const g=JSON.parse(localStorage.getItem(KEY));if(g&&g.v===4&&g.stores.length===DEFS.length)return norm(g)}catch(e){}return null}
function genCond(prev){const r=Math.random(),on=onStores(),pick=()=>on[Math.floor(Math.random()*on.length)];
  return{wx:r<.18?'rain':r<.26?'heat':'fine',promo:Math.random()<.3?pick():-1,road:Math.random()<.14?pick():-1,fuel:Math.max(.75,Math.min(1.6,prev.fuel+(Math.random()-.5)*.14+(1-prev.fuel)*.08+(Math.random()<.07?.25:0)))}}
function condList(c,day){const a=[],dow=(day-1)%7;a.push(c.wx==='rain'?'🌧 Rain: trucks 25% slower, slightly fewer shoppers':c.wx==='heat'?'☀️ Heatwave: 25% more shoppers':'⛅ Fine weather');
  if(dow>=5)a.push('🛒 Weekend: 35% more shoppers');if(c.promo>=0)a.push('📣 Promo at '+DEFS[c.promo].n+': demand up 80%');if(c.road>=0)a.push('🚧 Roadworks near '+DEFS[c.road].n+': legs there 40% longer');
  const y=G.fuelHist[G.fuelHist.length-2];a.push('⛽ Diesel $'+(1.85*c.fuel).toFixed(2)+'/L'+(y?(c.fuel>y+.005?' ▲ up from $':c.fuel<y-.005?' ▼ down from $':', same as $')+(1.85*y).toFixed(2):''));return a}
const newDep=own=>({own,fk:own?3:2,docks:2,wh:own?120:80,order:own?90:0,rack:0,sup:false,inMode:'spread',fkMode:'auto',fkDock:[]});

function newGame(){G={v:4,day:1,cash:10000,loan:0,pay:1,morale:70,minLoad:.5,maxDrops:2,tank:500,fuelHist:[1],fkPri:'bal',up:{},tr:false,deps:[newDep(true),newDep(false),newDep(false)],
  fleet:[{id:1,type:'r16',cond:100,route:-1,dep:0}],nid:2,stores:DEFS.map((d,i)=>({on:i<2,stock:Math.round(d.cap*.6),sat:70})),hist:[],tier:0,cond:{wx:'fine',promo:-1,road:-1,fuel:1}};norm(G);sel=0}
function startDay(){const dow=(G.day-1)%7;
  S={clock:360,over:false,trucks:[],runs:[],seq:0,log:[],dayMul:dow>=5?1.35:1,
    d:{rev:0,wF:0,wD:0,fuel:0,lease:0,over:0,pen:0,repair:0,other:0,stor:0,int:0,det:0,sub:0,km:0,deliv:0,sold:0,lost:0,recv:0,litres:0,loads:0,drops:0,arr:0,late:0,wait:0,fill:0,dockB:0,dockT:0,bh:0,toll:0},
    deps:G.deps.map((g,b)=>({b,docks:Array.from({length:ND},(_,j)=>({x:dockX(b,j),truck:null,on:g.own&&j<g.docks})),holds:Array.from({length:NH},(_,k)=>({x:holdX(b,k),truck:null})),forks:[],ordered:0,slot:0,whRes:0,whIn:0,sick:0,casual:0,fUtil:0,busyT:0,totT:0}))};
  let sick=0;for(const b of owned()){const g=G.deps[b],sd=S.deps[b];for(let i=0;i<g.fk;i++)if(G.morale<60&&Math.random()<(60-G.morale)/200*(g.sup?.5:1))sd.sick++;sd.sick=Math.min(sd.sick,g.fk-1);sick+=sd.sick;syncForks(b)}
  G.stores.forEach((s,i)=>{s.inbound=0;s.planned=0;s.flash=0;s.next=expo(60/rate(i))});
  G.fleet.forEach(o=>{if(o.route>=0&&!G.stores[o.route].on)o.route=-1;addTruck(o)});
  charge('lease',G.fleet.reduce((a,o)=>a+(o.own?0:TYPES[o.type].lease),0));for(const b of owned())charge('over',OVER+OVER_DOCK*G.deps[b].docks);if(G.loan)charge('int',G.loan*LOAN_RATE);
  say(sick?sick+' operator'+(sick>1?'s':'')+' called in sick. Morale is low.':'Gates closed. Check today, then press a speed to open.');render()}
function freeHold(sd,n){return sd.holds.find(h=>!h.truck)||{x:holdX(sd.b,n%NH),truck:null}}
function addTruck(o,qty){const T=TYPES[o.type],b=o.dep,sd=S.deps[b],h=freeHold(sd,S.trucks.length);
  const t={o,id:o.id,type:o.type,T,b,x:h.x,y:HOLD_Y,a:Math.PI/2,da:Math.PI/2,state:'wait',path:[],loaded:0,reserved:0,qty:0,dock:null,hold:h,stops:[],si:0,timer:0,retire:false,sp:30,km:0,site:0,trips:0};h.truck=t;
  if(o.type==='sup'){t.inb=true;t.loaded=qty;t.x=gateX(b);t.y=-50;t.path=[[gateX(b),BACK_Y],[h.x,BACK_Y],[h.x,HOLD_Y]];t.state='back'}S.trucks.push(t);return t}
function supplier(q,b){addTruck({id:'in',type:'sup',dep:b},q)}
function dropJob(f){const t=f.truck,sd=S.deps[f.b],g=G.deps[f.b];if(!t)return;if(f.job==='out'){if(f.carry){g.wh++;t.reserved--}else{t.reserved--;sd.whRes--}}else{sd.whIn--;if(f.carry)g.wh++;else t.reserved--}f.truck=null}
function syncForks(b){const g=G.deps[b],sd=S.deps[b],n=g.own?Math.max(1,g.fk-sd.sick)+sd.casual:0,x0=b*BW+OX+28;
  while(sd.forks.length<n){const i=sd.forks.length;sd.forks.push({i,b,x:x0+i*22,y:118,hx:x0+i*22,a:-Math.PI/2,da:-Math.PI/2,state:'idle',path:[],truck:null,carry:false,timer:0,bat:100})}
  while(sd.forks.length>n)dropJob(sd.forks.pop())}
function buyDepot(b){const g=G.deps[b];g.own=true;S.deps[b].docks.forEach((d,j)=>d.on=j<g.docks);syncForks(b);charge('other',DEPCOST[b]);charge('over',OVER+OVER_DOCK*g.docks);
  [b*10,b*10+1].forEach(i=>{G.stores[i].on=true;G.stores[i].stock=Math.round(DEFS[i].cap*.5);G.stores[i].sat=70;G.stores[i].next=expo(60/rate(i))});g.order=100;
  const o={id:G.nid++,type:'r16',cond:100,route:-1,dep:b};G.fleet.push(o);addTruck(o);charge('lease',TYPES.r16.lease);sel=b;view('depot');say(DEPN[b]+' is open with two launch contracts, 2 operators and a leased Rigid 16.')}

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
const hopKm=(a,b)=>DEFS[a].st===DEFS[b].st?Math.max(2,Math.abs(DEFS[a].x-DEFS[b].x)/25):Math.abs(DEFS[a].km-DEFS[b].km)*.5+8;
const need=(i,T)=>{const s=G.stores[i];return!s.on||(DEFS[i].tg&&!T.tg)?0:Math.max(0,cap(i)-s.stock-s.inbound-s.planned)};
function planRoute(t){const T=t.T,ids=onStores(t.b),lock=t.o.route;let best=-1,bc=1e9;
  for(const i of ids){if(lock>=0&&lock!==i)continue;const d=DEFS[i],q=need(i,T);if(q<=0)continue;
    if(G.tr){const eta=S.clock+kmOf(d.km)*60/T.kmh;if(eta>d.close-10||eta<d.open-60)continue}
    const s=G.stores[i],cover=(s.stock+s.inbound+s.planned)/rate(i);if(cover<bc){bc=cover;best=i}}
  if(best<0)return null;const stops=[{i:best,q:Math.min(T.cap,need(best,T))}];let rem=T.cap-stops[0].q,tot=stops[0].q,eta=S.clock+kmOf(DEFS[best].km)*60/T.kmh+10;
  while(lock<0&&rem>=2&&stops.length<G.maxDrops){const last=stops[stops.length-1].i;let nx=-1,nk=26;
    for(const j of ids){if(stops.some(s=>s.i===j))continue;const k=hopKm(last,j);if(k>=nk||need(j,T)<2)continue;if(G.tr&&eta+k*60/T.kmh>DEFS[j].close-10)continue;nx=j;nk=k}
    if(nx<0)break;const q=Math.min(rem,need(nx,T));stops.push({i:nx,q});rem-=q;tot+=q;eta+=nk*60/T.kmh+10}
  return tot<Math.min(G.minLoad*T.cap,cap(best)*.7)?null:stops}
function leg(t,km,path,i){km=kmOf(km);t.path=path;t.sp=pathLen(t)/Math.max(1,km*60/t.T.kmh*(G.cond.wx==='rain'?1.25:1)*(G.cond.road===i?1.4:1)*(G.tolls?.8:1));S.d.km+=km;t.km+=km;if(t.run)t.run.km+=km;if(G.tolls)charge('toll',km*TOLL);
  if(t.o.sub){charge('sub',km*t.T.subkm);return}
  const L=km*t.T.l/100*(G.tr?.94:1),own=Math.min(G.tank,L);G.tank-=own;S.d.litres+=L;charge('fuel',(L-own)*price()*1.1+km*t.T.run);t.o.cond=Math.max(0,t.o.cond-km*.03)}
const pri=(t,g)=>{const n=t.inb||t.bh;return t.inb&&(t.site>60||g.wh<30)?0:G.fkPri==='in'?(n?1:2):G.fkPri==='out'?(n?2:1):1};
function goHome(t,i,extra){const h=freeHold(S.deps[t.b],S.seq);h.truck=t;t.hold=h;leg(t,DEFS[i].km+(extra||0),backPath(h,i),i);t.stops=[];t.state='back';if(t.run)t.run.status='Returning'}
function toHold(t){const sd=S.deps[t.b];t.dock.truck=null;t.dock=null;const h=freeHold(sd,0);h.truck=t;t.hold=h;t.path=[[t.x,HOLD_Y],[h.x,HOLD_Y]];t.sp=30;t.state='back'}
function exitPath(t){return[[t.x,OUT_Y],[gateX(t.b),OUT_Y],[gateX(t.b),-70]]}
function refuse(t,why){if(t.dock){t.dock.truck=null;t.dock=null}if(t.hold){t.hold.truck=null;t.hold=null}charge('det',100);say('Supplier left '+DEPN[t.b]+' with '+t.loaded+' pallets ('+why+'). $100 fee.');t.path=exitPath(t);t.state='leave'}
function arrive(t){const i=t.stops[t.si].i,d=DEFS[i],s=G.stores[i],rs=t.run&&t.run.stops[t.si];S.d.arr++;if(rs){rs.arr=S.clock;rs.late=S.clock>d.close}
  if(S.clock>d.close){const fine=d.strict?300:150;charge('pen',fine);S.d.late++;s.sat=Math.max(0,s.sat-4);say(t.T.n+' #'+t.id+' reached '+d.n+' after receiving closed at '+hhmm(d.close)+'. '+money(fine)+' fine.')}
  t.state=S.clock<d.open?'await':'unload';t.timer=4}
function step(dt){S.clock+=dt;const D=S.d;
  for(const b of owned()){const g=G.deps[b],sd=S.deps[b];charge('wF',((sd.forks.length-sd.casual)*PAY[G.pay].w+sd.casual*AGENCY+(g.sup?SUPW:0))/60*dt);
    if(sd.fUtil>.9&&sd.forks.length>1&&Math.random()<dt*.0006*(g.sup?.3:1)){sd.sick++;syncForks(b);charge('pen',1500);G.morale=Math.max(0,G.morale-5);say('Safety incident at '+DEPN[b]+': a rushed forklift clipped the racking. One operator stood down, $1,500 fine. Flat-out crews have accidents.')}
    const gap=g.inMode==='early'?20:Math.max(15,600/Math.max(1,Math.ceil(g.order/LOAD)));
    while(sd.ordered<g.order&&S.clock>=375+gap*sd.slot){sd.slot++;const q=Math.min(LOAD,g.order-sd.ordered);sd.ordered+=q;supplier(q,b)}
    const on=sd.docks.filter(d=>d.on);D.dockT+=on.length*dt;D.dockB+=on.filter(d=>d.truck).length*dt}
  charge('wD',(S.trucks.filter(t=>!t.inb&&!t.o.sub).length*DRIVER+(G.tr?SUPW:0))/60*dt);
  G.stores.forEach((s,i)=>{if(!s.on)return;s.flash=Math.max(0,s.flash-dt/3);s.next-=dt;while(s.next<=0){s.next+=expo(60/rate(i));
      if(s.stock>0){s.stock--;D.sold++;s.wSold++;s.sat=Math.min(100,s.sat+.1)}else{s.flash=1;D.lost++;s.wLost++;s.sat=Math.max(0,s.sat-.8);charge('pen',LOST)}}});
  for(const t of S.trucks){const T=t.T,sd=S.deps[t.b],g=G.deps[t.b];if(t.inb){t.site+=dt;if(t.site>120)charge('det',dt)}
    if(t.state==='wait'){if(t.retire){if(t.hold)t.hold.truck=null;t.dead=1;continue}
      if(t.svc){t.svc=false;t.state='service';t.timer=120;charge('repair',T.svc);t.o.cond=100;continue}
      if(t.inb&&t.site>180){refuse(t,'gave up waiting');continue}
      if(t.bh&&g.wh+sd.whIn>=whCap(t.b)){t.bhW=(t.bhW||0)+dt;if(t.bhW>45){charge('det',t.loaded*BH+50);say(T.n+' #'+t.id+' had to hand its backhaul load back: the racks at '+DEPN[t.b]+' are full.');t.loaded=0;t.bh=false;t.bhW=0}}
      const ok=t.inb||t.bh?g.wh+sd.whIn<whCap(t.b):g.wh-sd.whRes>0&&!(g.wh<40&&S.trucks.some(u=>u.inb&&u.b===t.b&&u.state==='wait'));
      const d=ok&&sd.docks.find(d=>d.on&&!d.truck);if(d){d.truck=t;t.dock=d;t.hold.truck=null;t.hold=null;t.path=[[d.x,HOLD_Y],[d.x,DOOR_Y+5+T.len/2,1]];t.state='dockIn'}}
    else if(t.state==='service'){t.timer-=dt;if(t.timer<=0){t.state='wait';say(T.n+' #'+t.id+' is back from the workshop.')}}
    else if(t.state==='dockIn'){if(move(t,30,dt)){t.state='loading';t.stops=[];t.qty=0;t.seq=S.seq++}}
    else if(t.state==='loading'){
      if(t.inb){if(t.loaded<=0&&!t.reserved){const dx=t.dock.x;t.dock.truck=null;t.dock=null;t.path=exitPath(t);t.state='leave'}
        else if(!t.reserved&&g.wh+sd.whIn>=whCap(t.b)){t.stall=(t.stall||0)+dt;if(t.stall>30)refuse(t,'racks full')}else t.stall=0}
      else if(t.bh){if(t.loaded<=0&&!t.reserved)t.bh=false;else if(!t.reserved&&g.wh+sd.whIn>=whCap(t.b)){t.bhW=(t.bhW||0)+dt;if(t.bhW>45){charge('det',t.loaded*BH+50);t.loaded=0;t.bh=false;t.bhW=0}}}
      else if(!t.stops.length){if(t.retire||t.svc){toHold(t);continue}
        const p=planRoute(t);if(p){t.stops=p;t.qty=p.reduce((a,s)=>a+s.q,0);p.forEach(s=>G.stores[s.i].planned+=s.q)}}
      else if(!t.reserved&&(t.loaded>=t.qty||(g.wh-sd.whRes<=0&&t.loaded>0))){
        if(!G.tr&&G.fleet.length>4){t.paper=(t.paper==null?(G.fleet.length-4)*4:t.paper)-dt;if(t.paper>0)continue;t.paper=null}
        let left=t.loaded;t.stops.forEach(s=>{G.stores[s.i].planned-=s.q;s.q=Math.min(s.q,left);left-=s.q;G.stores[s.i].inbound+=s.q});t.stops=t.stops.filter(s=>s.q>0);
        const dx=t.dock.x,i=t.stops[0].i;t.dock.truck=null;t.dock=null;t.si=0;D.loads++;D.fill+=t.loaded/T.cap;t.trips++;
        t.run={no:S.runs.length+1,t:T.n+' #'+t.id,sub:!!t.o.sub,b:t.b,seal:S.clock,pal:t.loaded,km:0,status:'On the road',stops:t.stops.map(s=>({i:s.i,q:s.q,arr:0,late:false}))};S.runs.push(t.run);
        leg(t,DEFS[i].km,outPath(dx,i,T.len),i);t.state='out';t.breaks=!t.o.sub&&Math.random()<DEFS[i].km/1200*(1+(100-t.o.cond)/25)*(G.up.train?.5:1)}
      else if(!t.reserved&&!t.loaded&&g.wh-sd.whRes<=0&&S.trucks.some(u=>u.inb&&u.b===t.b&&u.state==='wait')){t.stops.forEach(s=>G.stores[s.i].planned-=s.q);t.stops=[];toHold(t)}}
    else if(t.state==='leave'){if(move(t,34,dt))t.dead=1}
    else if(t.state==='out'){if(move(t,t.sp,dt)){if(t.breaks){t.breaks=false;t.state='broken';t.timer=90;charge('repair',400);say(T.n+' #'+t.id+' broke down near '+DEFS[t.stops[t.si].i].n+'. 90 min, $400 repair.')}else arrive(t)}}
    else if(t.state==='broken'){t.timer-=dt;if(t.timer<=0)arrive(t)}
    else if(t.state==='await'){D.wait+=dt;if(S.clock>=DEFS[t.stops[t.si].i].open)t.state='unload'}
    else if(t.state==='unload'){const st=t.stops[t.si],s=G.stores[st.i],d=DEFS[st.i];t.timer-=dt;while(t.timer<=0&&st.q>0){t.timer+=.6;st.q--;t.loaded--;s.stock++;s.inbound--;D.deliv++;const pay=payOf(st.i);G.cash+=pay;D.rev+=pay;s.wRev+=pay}
      if(st.q<=0){D.drops++;t.si++;if(t.si<t.stops.length){const j=t.stops[t.si].i;leg(t,hopKm(st.i,j),hopPath(st.i,j,T.len),j);t.state='out'}
        else{const q=Math.min(T.cap,Math.floor(whCap(t.b)*.8)-g.wh-sd.whIn-Math.max(0,g.order-sd.ordered)-S.trucks.reduce((a,u)=>a+(u.b===t.b&&(u.bh||u.state==='pickup')?(u.bhq||u.loaded):0),0));t.last=st.i;
          if(G.backhaul&&!t.o.sub&&q>=6&&S.clock<930){t.state='pickup';t.timer=25;t.bhq=q;if(t.run)t.run.status='Collecting backhaul'}else goHome(t,st.i)}}}
    else if(t.state==='pickup'){t.timer-=dt;if(t.timer<=0){t.loaded=t.bhq;t.bh=true;G.cash+=t.bhq*BH;D.bh+=t.bhq*BH;goHome(t,t.last,6)}}
    else if(t.state==='back'){if(move(t,t.sp,dt)){t.state='wait';t.bhq=0;if(t.run){t.run.status='Back '+clockStr();t.run=null}if(t.o.sub&&S.clock>1000)t.retire=true}}}
  S.trucks=S.trucks.filter(t=>!t.dead);
  const P=PAY[G.pay];
  for(const b of owned()){const sd=S.deps[b],g=G.deps[b],e=eff(b),v=44*P.sp*mm()*e,hr_=1/P.sp/mm()/e,hd=hr_*(G.up.lev?.6:1),x0=b*BW+OX;let busy=0;
    const crowd=t=>sd.forks.reduce((a,f)=>a+(f.truck===t?1:0),0),rackX=t=>Math.max(x0+24,Math.min(x0+DW-24,t.dock.x+Math.random()*150-75));
    for(const f of sd.forks){
      if(f.state==='charge'){f.timer-=dt;if(f.timer<=0){f.bat=100;f.state='idle'}continue}
      if((f.state==='idle'||f.state==='home')&&f.bat<8){if(f.state==='idle'||move(f,v,dt)){f.state='charge';f.timer=G.up.batt?6:45}continue}
      if(f.state==='idle'||f.state==='home'){const fd=g.fkMode==='manual'&&g.fkDock[f.i]>=0&&g.fkDock[f.i]<g.docks?g.fkDock[f.i]:-1;
        const t=S.trucks.filter(t=>t.b===b&&t.state==='loading'&&(t.inb||t.bh?t.loaded-t.reserved>0&&g.wh+sd.whIn<whCap(b):t.stops.length&&t.loaded+t.reserved<t.qty&&g.wh-sd.whRes>0)&&(fd<0||t.dock===sd.docks[fd]))
          .sort((a,c)=>pri(a,g)-pri(c,g)||crowd(a)-crowd(c)||a.seq-c.seq)[0];
        if(t){t.reserved++;f.truck=t;if(t.inb||t.bh){sd.whIn++;f.job='in';f.path=[[t.dock.x+Math.random()*10-5,DOOR_Y-4]];f.state='toDock'}else{sd.whRes++;f.job='out';f.path=[[rackX(t),RACK_Y]];f.state='toRack'}}
        else if(f.state==='home'){if(move(f,v,dt))f.state='idle'}}
      if(f.state==='toRack'){if(move(f,v,dt)){f.state='atRack';f.timer=hr_}}
      else if(f.state==='atRack'){f.timer-=dt;if(f.timer<=0){if(f.job==='out'){g.wh--;sd.whRes--;f.carry=true;f.path=[[f.truck.dock.x+Math.random()*10-5,DOOR_Y-4]];f.state='toDock'}
          else{g.wh++;sd.whIn--;S.d.recv++;f.carry=false;f.truck=null;f.path=[[f.hx,118]];f.state='home'}}}
      else if(f.state==='toDock'){if(move(f,v,dt)){f.state='atDock';f.timer=hd}}
      else if(f.state==='atDock'){f.timer-=dt;if(f.timer<=0){if(f.job==='out'){f.carry=false;f.truck.loaded++;f.truck.reserved--;f.truck=null;f.path=[[f.hx,118]];f.state='home'}
          else{f.truck.loaded--;f.truck.reserved--;f.carry=true;f.path=[[rackX(f.truck),RACK_Y]];f.state='toRack'}}}
      if(f.state!=='idle'&&f.state!=='home'){busy++;f.bat=Math.max(0,f.bat-dt*100/330)}}
    const u=busy/Math.max(1,sd.forks.length);sd.fUtil+=(u-sd.fUtil)*Math.min(1,dt/40);sd.busyT+=u*dt;sd.totT+=dt}
  if(S.clock>=1080)endDay()}
const costs=d=>d.wF+d.wD+d.fuel+d.lease+d.over+d.pen+d.repair+d.other+d.stor+d.int+d.det+d.sub+d.toll;
function nextOffer(){let best=-1;G.stores.forEach((s,i)=>{if(!s.on&&G.deps[DEFS[i].b].own&&(best<0||DEFS[i].km<DEFS[best].km))best=i});return best}
function kpis(){const d=S.d,drv=S.trucks.filter(t=>!t.inb).length,ow=owned(),fu=ow.reduce((a,b)=>a+S.deps[b].fUtil,0)/ow.length;
  return{loads:d.loads,drops:d.drops,ratio:d.loads?(d.drops/d.loads).toFixed(2):'–',drv:drv&&d.loads?(d.loads/drv).toFixed(1):'–',out:d.deliv,inn:d.recv,fill:d.loads?Math.round(d.fill/d.loads*100)+'%':'–',
    km:num(d.km)+' km',kmp:d.deliv?(d.km/d.deliv).toFixed(1)+' km':'–',cpp:d.deliv?money((costs(d)-d.other)/d.deliv):'–',ot:d.arr?Math.round((1-d.late/d.arr)*100)+'%':'–',wait:Math.round(d.wait)+' min',
    fk:Math.round(fu*100)+'%',dock:d.dockT?Math.round(d.dockB/d.dockT*100)+'%':'–',lit:num(d.litres)+' L',l100:d.km?(d.litres/d.km*100).toFixed(0)+' L':'–',av:Math.round(d.sold/Math.max(1,d.sold+d.lost)*100)+'%',stock:num(ow.reduce((a,b)=>a+G.deps[b].wh,0))}}
const KPI=[['loads','Loads out'],['drops','Drops'],['ratio','Drops / load'],['fill','Truck fill'],['out','Pallets out'],['inn','Pallets in'],['stock','Depot stock'],['km','Distance'],['kmp','Km / pallet'],['cpp','Cost / pallet'],['ot','On time'],['wait','Window waits'],['fk','Forklifts busy'],['dock','Docks in use'],['drv','Loads / driver'],['lit','Diesel used'],['l100','Per 100 km'],['av','Shelves stocked']];

function endDay(){S.over=true;let kept=0;for(const b of owned()){charge('stor',G.deps[b].wh*STOR);kept+=G.deps[b].wh}
  const d=S.d,k=kpis(),profit=d.rev+d.bh-costs(d),avail=d.sold/Math.max(1,d.sold+d.lost);G.hist.push({day:G.day,profit,avail,cash:G.cash-G.loan});if(G.hist.length>60)G.hist.shift();
  let notes='';G.stores.forEach((s,i)=>{if(s.on&&s.sat<=0){s.on=false;s.sat=40;notes+=`<p class="neg"><b>${DEFS[i].n} cancelled its contract.</b> Shelves were empty or deliveries late too often.</p>`}});
  const ow=owned(),util=ow.reduce((a,b)=>a+S.deps[b].busyT,0)/Math.max(1,ow.reduce((a,b)=>a+S.deps[b].totT,0)),m0=G.morale;
  G.morale=Math.max(0,Math.min(100,G.morale+[-7,0,6][G.pay]+(util>.85?-6:util<.6?3:0)+(G.up.mess?4:0)+(ow.every(b=>G.deps[b].sup)?2:0)+(60-G.morale)*.1));
  notes+=`<p>Crew morale ${Math.round(m0)} → <b class="${G.morale<m0?'neg':'pos'}">${Math.round(G.morale)}</b>. Forklifts were busy ${(util*100).toFixed(0)}% of the day${util>.85?', which is wearing people down':''}.</p>`;
  if(G.morale<15){const b=ow.find(b=>G.deps[b].fk>1);if(b!=null){G.deps[b].fk--;notes+=`<p class="neg"><b>An operator quit at ${DEPN[b]}.</b> Pay and workload matter.</p>`}}
  if(G.day%7===0){let bonus=0,up=0,dn=0;G.stores.forEach(s=>{if(!s.on)return;const sv=s.wSold/Math.max(1,s.wSold+s.wLost);if(sv>=.97){bonus+=s.wRev*.08;s.rm=Math.min(1.3,s.rm+.02);s.dm=Math.min(1.5,s.dm+.05);up++}else if(sv<.85){s.rm=Math.max(.8,s.rm-.03);dn++}s.wSold=s.wLost=s.wRev=0});G.cash+=bonus;
    notes+=`<div class="offer"><b>Weekly contract review</b><p style="margin:4px 0 0">${up} store${up===1?'':'s'} had shelves stocked 97% or better all week and paid service bonuses worth <b>${money(bonus)}</b>. Those stores are growing: 5% more demand and a 2% better rate.${dn?' '+dn+' store'+(dn===1?'':'s')+' under 85% cut their rate by 3%.':''}</p></div>`}
  const dead=G.cash<-5000||!G.stores.some(s=>s.on),off=nextOffer(),canOffer=!dead&&off>=0&&avail>=.9;
  let win='';if(!dead&&G.tier<TIERS.length&&G.cash-G.loan>=TIERS[G.tier][0]){const t=TIERS[G.tier++];win=`<div class="offer"><b>🏆 ${t[1]} network: ${money(t[0])} net worth.</b><p style="margin:4px 0 0">${G.tier<TIERS.length?'Next: '+TIERS[G.tier][1]+' at '+money(TIERS[G.tier][0])+'.':'Top tier. You run the state.'}</p></div>`}
  const row=(a,b,c)=>`<tr${c?' class="'+c+'"':''}><td>${a}</td><td>${b}</td></tr>`,opt=(a,v)=>v?row(a,money(-v)):'';
  let h=`<h2>${dead?'The bank has pulled the plug':'Day '+G.day+' closed'}</h2><p>${dead?(G.cash<-5000?'You are more than $5,000 overdrawn.':'Every store has walked away.')+' You lasted '+G.day+' days.':`Shelves stocked ${k.av}. ${d.loads} loads, ${d.drops} drops, ${d.deliv} pallets out over ${k.km}. ${d.recv} pallets in. ${d.late?d.late+' late arrival'+(d.late>1?'s':'')+'.':'Every drop on time.'}`}</p>
  <table>${row('Delivery income',money(d.rev))}${d.bh?row('Backhaul income',money(d.bh)):''}${row('Warehouse wages',money(-d.wF))}${row('Driver wages',money(-d.wD))}${row('Fuel bought and running costs',money(-d.fuel))}${opt('Subcontractors',d.sub)}${opt('Road tolls',d.toll)}${row('Truck leases',money(-d.lease))}${row('Depot rent',money(-d.over))}${row('Overnight storage ('+kept+' pallets)',money(-d.stor))}${row('Penalties ('+d.lost+' empty-shelf, '+d.late+' late)',money(-d.pen))}${opt('Supplier waiting fees',d.det)}${opt('Repairs and servicing',d.repair)}${opt('Loan interest',d.int)}${opt('Investments and one-offs',d.other)}
  <tr class="tot"><td>Profit today</td><td class="${profit<0?'neg':'pos'}">${money(profit)}</td></tr>${row('Cash',money(G.cash))}${G.loan?row('Loan owing',money(-G.loan)):''}${row('Cost per pallet delivered',k.cpp)}${row('Truck fill / drops per load',k.fill+' / '+k.ratio)}</table>${notes}${win}`;
  if(canOffer){const o=DEFS[off];h+=`<div class="offer" id="offer"><b>New contract offer: ${o.n}</b><p style="margin:4px 0 8px">Served from ${DEPN[o.b]}, ${o.km} km out. About ${o.dem} pallets an hour at ${money(o.rate)} a pallet. ${winText(off)}</p><button class="pri" data-act="accept:${off}">Accept contract</button></div>`}
  else if(!dead&&off>=0)h+=`<p>Keep shelves stocked 90% of a day to be offered the next contract (${DEFS[off].n}).</p>`;
  G.day++;if(dead){try{localStorage.removeItem(KEY)}catch(e){}h+=`<button class="pri go" data-act="new">Start again</button>`}
  else{G.cond=genCond(G.cond);G.fuelHist.push(G.cond.fuel);if(G.fuelHist.length>12)G.fuelHist.shift();h+=`<h3 style="margin-top:14px">Tomorrow's forecast</h3><ul>${condList(G.cond,G.day).map(x=>'<li>'+x+'</li>').join('')}</ul>`;save();h+=`<button class="pri go" data-act="next">Plan day ${G.day}</button>`}
  showModal(h)}
function winText(i){const d=DEFS[i],a=[];if(d.open>360||d.close<1080)a.push('Receives '+hr(d.open)+':00 to '+hr(d.close)+':00'+(d.strict?' (strict: double fine)':''));if(d.tg)a.push('No dock: tailgate trucks only');return a.join('. ')+(a.length?'.':'')}
function showModal(h){$('#mbox').innerHTML=h;$('#modal').classList.add('show');$('#modal').scrollTop=0;modal=true}
function hideModal(){$('#modal').classList.remove('show');modal=false}

/* ---------- map ---------- */
function rr(x,a,b,w,h,r){x.beginPath();x.roundRect(a,b,w,h,r);x.fill()}
function pallet(x,a,b,s){x.fillStyle='#c79a5b';x.fillRect(a-s/2,b-s/2,s,s);x.strokeStyle='#7d5526';x.lineWidth=.5;x.strokeRect(a-s/2,b-s/2,s,s)}
const SIGN=['#1f5fa8','#1e8e4e','#b3541e','#6a3fa0','#0f7c86'];
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
function draw(){const c=$('#c'),r=c.getBoundingClientRect(),dp=Math.min(window.devicePixelRatio||1,2),cw=Math.round(r.width*dp),ch=Math.round(r.height*dp);
  if(c.width!==cw||c.height!==ch){c.width=cw;c.height=ch;if(!cam.init&&cw){cam.init=1;view('depot')}clampCam()}
  const x=c.getContext('2d'),C=G.cond,k=cam.z*dp,rt=OUT_Y-12,rb=BACK_Y+12,far=cam.z<.55;x.setTransform(1,0,0,1,0,0);x.fillStyle=C.wx==='heat'?'#8a9455':'#6d8a55';x.fillRect(0,0,cw,ch);x.setTransform(k,0,0,k,-cam.x*k,-cam.y*k);
  x.fillStyle='#3d4045';x.fillRect(-600,rt,WW+1200,rb-rt);x.fillRect(-600,CROSS[1]-20,WW+1200,40);x.fillRect(-600,CROSS[2]-20,WW+1200,40);
  for(let b=0;b<NB;b++){x.fillStyle='#3d4045';x.fillRect(trunkX(b)-20,rb,40,CROSS[2]-rb);if(G.deps[b].own){x.fillRect(gateX(b)-13,-80,26,rt+80);x.fillStyle='#a9aaa5';x.fillRect(b*BW+OX-30,0,DW+60,rt)}}
  x.fillStyle='#3d4045';G.stores.forEach((st,i)=>{if(st.on){const d=DEFS[i],top=CROSS[d.st]+20;x.fillRect(d.x-13,top,26,d.y-top)}});
  x.strokeStyle='#f2f2ee';x.lineWidth=1.2;x.setLineDash([9,8]);x.beginPath();for(const cy of CROSS){x.moveTo(-600,cy);x.lineTo(WW+600,cy)}for(let b=0;b<NB;b++){x.moveTo(trunkX(b),rb+4);x.lineTo(trunkX(b),CROSS[2]-22)}x.stroke();x.setLineDash([]);
  for(let b=0;b<NB;b++){const g=G.deps[b],sd=S.deps[b],x0=b*BW+OX;
    if(!g.own){x.strokeStyle='#dfe8d4';x.globalAlpha=.7;x.lineWidth=1.5;x.setLineDash([8,6]);x.strokeRect(x0+8,8,DW-16,DOOR_Y+110);x.setLineDash([]);x.fillStyle='#fff';x.font='700 26px '+FONT;x.textAlign='center';x.fillText(DEPN[b].toUpperCase(),x0+DW/2,110);x.font='700 16px '+FONT;x.fillText('FOR SALE · '+money(DEPCOST[b]),x0+DW/2,136);x.textAlign='left';x.globalAlpha=1;continue}
    for(const h of sd.holds){x.strokeStyle='#f2f2ee';x.lineWidth=1;x.setLineDash([4,4]);x.strokeRect(h.x-14,HOLD_Y-36,28,70);x.setLineDash([]);x.fillStyle='rgba(242,242,238,.7)';x.font='700 8px '+FONT;x.fillText('P',h.x-3,HOLD_Y-26)}
    x.save();x.translate(x0,0);x.fillStyle='rgba(0,0,0,.18)';x.fillRect(11,11,DW-16,DOOR_Y-6);x.fillStyle='#dcd9d0';x.fillRect(8,8,DW-16,DOOR_Y-6);x.strokeStyle=b===sel?'#1d1f21':'#4b4e52';x.lineWidth=3;x.strokeRect(8,8,DW-16,DOOR_Y-6);
    x.strokeStyle='#f5c400';x.lineWidth=1.5;x.setLineDash([10,6]);x.beginPath();x.moveTo(14,DOOR_Y-22);x.lineTo(DW-14,DOOR_Y-22);x.stroke();x.setLineDash([]);
    x.fillStyle='#2f5d9e';x.fillRect(20,13,DW-40,22);x.fillStyle='#e8731c';x.fillRect(20,23.2,DW-40,1.6);const full=Math.round(78*Math.min(1,g.wh/whCap(b)));for(let i=0;i<full;i++)pallet(x,28+Math.floor(i/2)*12.2,i%2?29.5:18.5,7);
    x.fillStyle=g.wh<15?'#c8281e':'#4b4e52';x.font='700 '+(far?22:10)+'px '+FONT;x.textAlign='right';x.fillText(DEPN[b].toUpperCase()+' · '+g.wh+'/'+whCap(b)+(far?'':' PALLETS'),DW-16,DOOR_Y-(far?34:28));x.textAlign='left';x.restore();
    sd.docks.forEach((d,j)=>{if(!d.on){x.strokeStyle='#8d8f8b';x.lineWidth=1;x.setLineDash([3,3]);x.strokeRect(d.x-14,DOOR_Y+3,28,74);x.setLineDash([]);return}
      x.strokeStyle='#f5c400';x.lineWidth=1.4;x.strokeRect(d.x-14,DOOR_Y+3,28,74);x.fillStyle='#26282b';x.fillRect(d.x-12,DOOR_Y-3,24,6);
      const t=d.truck,act=t&&t.state==='loading'&&(t.inb||t.bh||t.stops.length);x.fillStyle=act?'#27c267':'#c8281e';x.beginPath();x.arc(d.x+17,DOOR_Y-7,2.4,0,7);x.fill();x.fillStyle='#4b4e52';x.font='700 8px '+FONT;x.fillText(j+1,d.x-2.5,DOOR_Y-8)})}
  G.stores.forEach((st,i)=>{const d=DEFS[i],bx=d.x-33,c=cap(i);if(!st.on){if(!G.deps[d.b].own)return;x.strokeStyle='#dfe8d4';x.globalAlpha=.6;x.lineWidth=1;x.setLineDash([4,4]);x.strokeRect(bx,d.y,66,42);x.setLineDash([]);x.fillStyle='#fff';x.font='8px '+FONT;x.fillText('NO CONTRACT',bx+10,d.y+24);x.globalAlpha=1;return}
    const empty=st.stock===0,promo=C.promo===i,shut=S.clock<d.open||S.clock>d.close;x.fillStyle='rgba(0,0,0,.22)';x.fillRect(bx+3,d.y+3,66,42);x.fillStyle='#f1eee6';x.fillRect(bx,d.y,66,42);x.fillStyle=empty?'#c8281e':SIGN[i%SIGN.length];x.fillRect(bx,d.y,66,far?20:13);
    x.strokeStyle=promo?'#ffd200':'#4b4e52';x.lineWidth=promo?2.5:1.2;x.strokeRect(bx,d.y,66,42);
    if(far){x.fillStyle='#fff';x.font='700 15px '+FONT;x.fillText(empty?'EMPTY':st.stock+'/'+c,bx+5,d.y+15);x.fillStyle='#cfccc3';x.fillRect(bx+5,d.y+25,56,11);x.fillStyle=st.stock<c*.25?'#f5a300':'#b9803f';x.fillRect(bx+5,d.y+25,56*Math.min(1,st.stock/c),11)}
    else{x.fillStyle='#fff';x.font='700 9px '+FONT;x.fillText(d.n,bx+5,d.y+10);x.fillStyle=shut?'#c8281e':'#5c6066';x.font='7.5px '+FONT;x.fillText(d.km+'km'+(d.open>360||d.close<1080?' '+hr(d.open)+'–'+hr(d.close):'')+(d.tg?' TG':''),bx+5,d.y+24);
      x.fillStyle=empty?'#c8281e':'#1d1f21';x.textAlign='right';x.font='700 8.5px '+FONT;x.fillText(empty?'EMPTY':st.stock+'/'+c,bx+61,d.y+24);x.textAlign='left';
      x.fillStyle='#cfccc3';x.fillRect(bx+5,d.y+29,56,7);x.fillStyle=st.stock<c*.25?'#f5a300':'#b9803f';x.fillRect(bx+5,d.y+29,56*Math.min(1,st.stock/c),7)}
    if(C.road===i){const my=d.y-34;x.fillStyle='#f57c00';x.beginPath();x.moveTo(d.x+22,my-7);x.lineTo(d.x+29,my+5);x.lineTo(d.x+15,my+5);x.closePath();x.fill();x.fillStyle='#1d1f21';x.font='700 8px '+FONT;x.fillText('!',d.x+20.5,my+3.5)}
    if(st.flash>0){x.globalAlpha=st.flash;x.fillStyle='#c8281e';x.beginPath();x.arc(bx+66,d.y,7,0,7);x.fill();x.fillStyle='#fff';x.font='700 9px '+FONT;x.fillText('✕',bx+62.5,d.y+3);x.globalAlpha=1}});
  for(const t of S.trucks){const L=t.T.len,tl=L-13;x.save();x.translate(t.x,t.y);x.rotate(t.da);x.globalAlpha=t.retire?.5:1;x.fillStyle='rgba(0,0,0,.28)';x.fillRect(-L/2+2,-8,L,20);
    x.fillStyle=t.state==='broken'?'#f0c9c4':t.inb?'#d6d9c8':t.o.sub?'#ece2c6':'#f7f7f4';rr(x,-L/2,-10,tl,20,2);x.strokeStyle='#55585c';x.lineWidth=.8;x.beginPath();x.roundRect(-L/2,-10,tl,20,2);x.stroke();
    x.fillStyle=t.T.col;rr(x,L/2-12,-9,12,18,3);x.fillStyle='#1d1f21';x.fillRect(L/2-5,-7,3,14);
    const cols=Math.ceil(t.T.cap/2),sz=Math.min(8,(tl-3)/cols-.6);for(let i=0;i<t.loaded;i++)pallet(x,-L/2+2+sz/2+Math.floor(i/2)*(sz+.6),(i%2?4.5:-4.5),sz);x.restore();
    const lab={broken:'⚠',service:'SERVICE',await:'WAITING TO OPEN',pickup:'BACKHAUL'}[t.state];if(lab){x.fillStyle=t.state==='service'?'#1d1f21':'#c8281e';x.font='700 8px '+FONT;x.fillText(lab,t.x+13,t.y+3)}}
  for(const b of owned())for(const f of S.deps[b].forks){x.save();x.translate(f.x,f.y);x.rotate(f.da);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(-5,-3.5,10,9);x.fillStyle='#f5a300';rr(x,-6,-4.5,10,9,2);x.fillStyle='#1d1f21';x.fillRect(-3,-3,4,6);
    x.strokeStyle='#33363a';x.lineWidth=1.2;x.beginPath();x.moveTo(4,-2.5);x.lineTo(10,-2.5);x.moveTo(4,2.5);x.lineTo(10,2.5);x.stroke();if(f.carry)pallet(x,9,0,7);x.restore();x.fillStyle='#1d1f21';x.font='700 6px '+FONT;x.fillText(f.state==='charge'?'⚡':f.i+1,f.x-2,f.y-7);x.fillStyle='#26282b';x.fillRect(f.x+3,f.y-11,8,2.5);x.fillStyle=f.bat>40?'#27c267':f.bat>15?'#f5a300':'#c8281e';x.fillRect(f.x+3,f.y-11,8*f.bat/100,2.5)}
  if(C.wx==='rain'){x.setTransform(dp,0,0,dp,0,0);x.strokeStyle='rgba(200,225,255,.45)';x.lineWidth=.8;x.beginPath();for(let i=0;i<90;i++){const a=Math.random()*r.width,b=Math.random()*r.height;x.moveTo(a,b);x.lineTo(a-3,b+8)}x.stroke();x.fillStyle='rgba(30,50,80,.12)';x.fillRect(0,0,r.width,r.height)}}

/* ---------- interface ---------- */
function tStatus(t){const n=t.stops.length,s=n?DEFS[t.stops[Math.min(t.si,n-1)].i].n:'',more=n>1&&t.state==='loading'?' + '+(n-1)+' more drop'+(n>2?'s':''):n>1?' (drop '+(t.si+1)+' of '+n+')':'';
  return t.retire?'Being returned':t.svc?'Booked for service when free':t.paper>0?'Loaded, waiting on paperwork':{wait:'Waiting for a dock',service:'In the workshop',dockIn:'Backing in',pickup:'Collecting a backhaul load',loading:t.bh?'Unloading backhaul, '+t.loaded+' left':!n?'At dock, nothing to load yet':`Loading ${t.loaded}/${t.qty} for ${s}${more}`,out:'Driving to '+s+more,broken:'Broken down',await:'Waiting for '+s+' to open',unload:'Unloading at '+s+more,back:'Heading back'}[t.state]}
function advice(){const g=G.deps[sel],sd=S.deps[sel],own=S.trucks.filter(t=>!t.inb&&t.b===sel),ids=onStores(sel),empty=ids.some(i=>G.stores[i].stock===0),wait=own.filter(t=>t.state==='wait').length,atDepot=own.filter(t=>t.state==='wait'||t.state==='loading'||t.state==='dockIn').length,
  idleDock=own.some(t=>t.state==='loading'&&!t.stops.length),late=S.trucks.some(t=>t.inb&&t.b===sel&&t.site>120),other=owned().find(b=>b!==sel&&onStores(b).some(i=>G.stores[i].stock===0));let m,c='var(--good)';
  if(!speed&&S.clock<=360.1){m='Gates closed. Check today\'s conditions and your inbound orders, then press a speed.';c='#1d1f21'}
  else if(!speed){m='Paused.';c='#1d1f21'}
  else if(!g.own){m='You don\'t own '+DEPN[sel]+' yet.';c='#1d1f21'}
  else if(g.wh-sd.whRes<=0&&own.some(t=>t.state==='loading'&&t.stops.length)){m=DEPN[sel]+' is out of stock. Trucks can\'t be loaded. Order more inbound, rush a load or transfer.';c='var(--bad)'}
  else if(late){m='A supplier truck has been kept over 2 hours. That costs $60 an hour, and after 3 hours it leaves.';c='var(--bad)'}
  else if(g.wh+sd.whIn>=whCap(sel)&&S.trucks.some(t=>t.inb&&t.b===sel)){m='The racks are full. Inbound stock can\'t be unloaded.';c='#f5a300'}
  else if(ids.some(i=>G.stores[i].stock===0&&DEFS[i].tg)&&!own.some(t=>t.T.tg)){m='A tailgate-only store is empty and this depot has no tailgate truck. Lease a Van or Rigid 10 TG.';c='var(--bad)'}
  else if(empty&&sd.fUtil>.88&&atDepot){m='Forklifts are flat out and shelves are empty. Hire, raise pay or fit dock levellers.';c='var(--bad)'}
  else if(empty&&!atDepot){m='Shelves are empty and every truck is on the road. You need more truck capacity.';c='var(--bad)'}
  else if(empty&&wait&&!idleDock){m='Trucks are queuing for a dock while shelves sit empty.';c='var(--bad)'}
  else if(empty){m='A store has run out. Each empty-shelf sale costs '+money(LOST)+' and goodwill.';c='var(--bad)'}
  else if(other!=null){m='Shelves are empty over at '+DEPN[other]+'.';c='var(--bad)'}
  else if(!g.sup&&sd.forks.length>4){m='More than 4 operators and no supervisor here: they\'re getting in each other\'s way.';c='#f5a300'}
  else if(!G.tr&&G.fleet.length>4){m='More than 4 trucks and no transport supervisor: departures wait on paperwork and nobody plans around delivery windows.';c='#f5a300'}
  else if(sd.fUtil<.3&&sd.forks.length>1&&S.clock>480){m='Operators are standing around. Idle hands still get paid.';c='#f5a300'}
  else m='Running smoothly.';
  $('#advice').textContent=m;$('#advice').style.borderLeftColor=c}
const seg=(act,opts,cur)=>`<div class="seg">${opts.map(o=>`<button data-act="${act}:${o[0]}" class="${o[0]===cur?'on':''}">${o[1]}</button>`).join('')}</div>`;
const chips=()=>`<div class="chips">${DEPN.map((n,b)=>`<button data-act="sel:${b}" class="${b===sel?'on':''}">${n.replace(' DC','')}${G.deps[b].own?'':' 🔒'}</button>`).join('')}</div>`;
function buyCard(b){const prev=b===0||G.deps[b-1].own;return`<h3>${DEPN[b]}</h3><p>A second site with its own docks, crew, stock and trucks, and ten more stores around it that pay ${Math.round(b*8)}% more. Rent ${money(OVER+2*OVER_DOCK)} a day from the moment you sign.</p><p>Opens with two launch contracts, 2 operators, 80 pallets and a leased Rigid 16.</p><button class="pri" data-act="buydep:${b}" ${!prev||G.cash<DEPCOST[b]?'disabled':''}>Buy for ${money(DEPCOST[b])}</button>${!prev?'<p style="margin-top:8px">Buy '+DEPN[b-1]+' first.</p>':G.cash<DEPCOST[b]?'<p style="margin-top:8px">You need '+money(DEPCOST[b]-G.cash)+' more. A loan counts.</p>':''}`}
function runsHtml(){const d=S.d,own=S.trucks.filter(t=>!t.inb),k=kpis(),row=(a,b)=>`<tr><td>${a}</td><td>${b}</td></tr>`;
  return`<h3>Transport daily runsheet</h3><table>${row('Total loads',d.loads)}${row('Drivers',own.length)}${row('Total pallets',d.loads?S.runs.reduce((a,r)=>a+r.pal,0):0)}${row('Total drops',S.runs.reduce((a,r)=>a+r.stops.length,0))}${row('Drop ratio',k.ratio)}${row('Driver ratio / load',k.drv)}${row('At the dock now',own.filter(t=>t.state==='loading').length)}${row('Late arrivals',d.late)}</table><h3>Loads</h3>`+
  (S.runs.slice(-40).reverse().map(r=>`<div class="run"><b>${r.no} · ${r.t}${r.sub?' (subbie)':''}</b><span>${DEPN[r.b]} · sealed ${hhmm(r.seal)} · ${r.pal} pallets · ${Math.round(r.km)} km · ${r.status}</span>${r.stops.map((s,j)=>`<div class="stop ${s.late?'neg':s.arr?'pos':''}">${j+1}. ${DEFS[s.i].n} · ${s.q} pal · window ${hr(DEFS[s.i].open)}–${hr(DEFS[s.i].close)} · ${s.arr?hhmm(s.arr)+(s.late?' LATE':' ✓'):'due'}</div>`).join('')}</div>`).join('')||'<p>No loads despatched yet today.</p>')}
function render(){document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.act==='tab:'+tab));
  document.querySelectorAll('#speed button').forEach(b=>b.classList.toggle('on',b.dataset.act==='speed:'+speed));
  const g=G.deps[sel],sd=S.deps[sel];let h='';
  if(tab==='team'){h=chips();if(!g.own)h+=buyCard(sel);else{const others=owned().filter(b=>b!==sel);
    h+=`<h3>Today</h3><ul class="cond">${condList(G.cond,G.day0).map(x=>'<li>'+x+'</li>').join('')}</ul>
    <h3>Stock at ${DEPN[sel]}</h3><div class="rowx"><div class="t"><b><span data-v="wh"></span> pallets</b><span>Storage costs $${STOR.toFixed(2)} a pallet each night</span></div><div class="meter"><i data-w="whp"></i></div></div>
    <div class="rowx"><div class="t"><b>Extend the racking</b><span>+100 pallets of space (${g.rack}/4 built)</span></div><button data-act="rack" ${g.rack>=4||G.cash<RACK?'disabled':''}>${g.rack>=4?'Maxed':money(RACK)}</button></div>
    <h3>Pallet inflow</h3><p>Suppliers truck stock in, ${LOAD} pallets a load. Your forklifts unload them at the same docks your trucks use.</p>
    <div class="rowx"><div class="t"><b>${g.order} pallets a day</b><span>${Math.ceil(g.order/LOAD)} loads. <span data-v="ord"></span> pallets sent so far today. Stores here want about <span data-v="need"></span> today.</span></div></div>
    <div class="seg" style="margin-bottom:8px"><button data-act="ord:-50">−50</button><button data-act="ord:-10">−10</button><button data-act="ord:10">+10</button><button data-act="ord:50">+50</button></div>
    ${seg('inm',[['spread','Spread out<small>evenly, 6:15 to 4pm</small>'],['early','Front-loaded<small>every 20 min from 6:15</small>']],g.inMode)}
    <div class="rowx"><div class="t"><b>Rush load</b><span>${LOAD} pallets on the way right now</span></div><button data-act="rush">Order ${money(RUSH)}</button></div>
    ${others.map(b=>`<div class="rowx"><div class="t"><b>Transfer to ${DEPN[b]}</b><span>${LOAD} pallets from here by linehaul</span></div><button data-act="xfer:${b}">Send ${money(XFER)}</button></div>`).join('')}
    <h3>Forklift operators</h3><p>Each moves about ${(8*PAY[G.pay].sp*mm()*eff(sel)).toFixed(1)} pallets an hour, in or out. Paid all day, busy or not.</p>
    <div class="rowx"><div class="t"><b>${g.fk} employed${sd.sick?', '+sd.sick+' off sick':''}</b><span>Busy <span data-v="futil"></span> of the time</span></div><div style="display:flex;gap:6px"><button data-act="fire" ${g.fk<=1?'disabled':''}>−</button><button data-act="hire" ${g.fk>=12?'disabled':''}>Hire ${money(HIRE)}</button></div></div>
    <div class="rowx"><div class="t"><b>Agency casuals today: ${sd.casual}</b><span>$${AGENCY}/h, gone tonight. For promo days and sick days.</span></div><div style="display:flex;gap:6px"><button data-act="cas:-1" ${sd.casual<=0?'disabled':''}>−</button><button data-act="cas:1" ${sd.forks.length>=12?'disabled':''}>+1</button></div></div>
    <div class="rowx"><div class="t"><b>Batteries</b><span>A forklift lasts about 5½ working hours, then ${G.up.batt?'swaps batteries in 6 minutes':'recharges for 45 minutes'}. <span data-v="chg"></span> charging now.</span></div></div>
    <div class="rowx"><div class="t"><b>Morale ${Math.round(G.morale)}</b><span>${G.morale<40?'Low: expect sick days and slow work':G.morale>75?'High: the crew works faster':'Steady'}. Moves overnight with pay and workload.</span></div><div class="meter"><i style="width:${G.morale}%;background:${G.morale>60?'var(--good)':G.morale>35?'#f5a300':'var(--bad)'}"></i></div></div>
    <h3>Forklift assignment</h3>${seg('fkm',[['auto','Auto<small>spread across docks</small>'],['manual','Manual<small>you pick the dock</small>']],g.fkMode)}
    ${g.fkMode==='manual'?'<div class="fkgrid">'+sd.forks.map(f=>`<label>Forklift ${f.i+1}<select data-chg="fd:${f.i}"><option value="-1">Float</option>${sd.docks.filter(d=>d.on).map((d,j)=>`<option value="${j}" ${g.fkDock[f.i]===j?'selected':''}>Dock ${j+1}</option>`).join('')}</select></label>`).join('')+'</div><p>A forklift pinned to a dock waits there when it has no truck. Floaters go wherever they are needed.</p>':'<p>Forklifts share themselves out between every truck at a dock.</p>'}
    <div style="margin-top:6px">${seg('fkp',[['bal','Balanced'],['out','Deliveries first'],['in','Inflow first']],G.fkPri)}</div>
    <h3>Warehouse supervisor</h3><div class="rowx"><div class="t"><b>${g.sup?'On staff':'None'} at ${DEPN[sel]}</b><span>$${SUPW}/h. Crew works 10% faster, fewer sick days, better morale. Without one, a crew over 4 slows down.</span></div><button data-act="sup" class="${g.sup?'on':''}">${g.sup?'Let go':'Hire'}</button></div>
    <h3>Warehouse pay (all depots)</h3>${seg('pay',PAY.map((p,i)=>[i,`${p.n}<small>$${p.w}/h · ${p.sp<1?'slower':p.sp>1?'faster':'normal'}</small>`]),G.pay)}
    <h3>Loading docks</h3><div class="rowx"><div class="t"><b>${g.docks} of ${ND} open</b><span>Shared by your trucks and suppliers. ${money(OVER_DOCK)} a day each.</span></div><button data-act="dock" ${g.docks>=ND||G.cash<DOCK?'disabled':''}>Build ${money(DOCK)}</button></div>`}}
  else if(tab==='fleet'){const mine=S.trucks.filter(t=>!t.inb&&t.b===sel);
    h=`<h3>Dispatch rules (all depots)</h3><p>Send a truck when it can carry at least:</p>${seg('min',[[.25,'¼ load'],[.5,'½ load'],[.75,'¾ load'],[1,'Full']],G.minLoad)}
    <p style="margin:8px 0 4px">Most stores on one run:</p>${seg('drops',[[1,'1 drop'],[2,'2'],[3,'3'],[4,'4'],[5,'5']],G.maxDrops)}
    <p style="margin-top:6px">Multi-drop runs fill the truck and save kilometres, but the last store waits longest and may be shut by the time you arrive.</p>
    <div class="rowx"><div class="t"><b>Toll roads</b><span>Every leg 20% quicker for $${TOLL.toFixed(2)} a km.</span></div><button data-act="tolls" class="${G.tolls?'on':''}">${G.tolls?'Using':'Avoiding'}</button></div>
    <div class="rowx"><div class="t"><b>Backhaul pickups</b><span>After the last drop, collect supplier freight on the way home: ${money(BH)} a pallet and free stock, but 25 min longer and it needs unloading. Lower your inbound order to match.</span></div><button data-act="bh" class="${G.backhaul?'on':''}">${G.backhaul?'On':'Off'}</button></div>
    <div class="rowx"><div class="t"><b>Transport supervisor</b><span>$${SUPW}/h. Plans runs around each store's receiving hours, cuts fuel 6%, no paperwork delays. Without one, a fleet over 4 waits before every departure.</span></div><button data-act="tr" class="${G.tr?'on':''}">${G.tr?'Let go':'Hire'}</button></div>
    <h3>Diesel</h3><div class="rowx"><div class="t"><b>$${price().toFixed(2)} a litre today</b><span>Trucks fill from your tank first. When it's dry they pay 10% more at the roadside ($${(price()*1.1).toFixed(2)}).</span></div><div class="bars" style="width:90px;height:38px;margin:0">${G.fuelHist.map((f,i)=>`<i style="height:${(f-.6)*100}%;background:${i===G.fuelHist.length-1?'#1d1f21':'#b9b6ad'}"></i>`).join('')}</div></div>
    <div class="rowx"><div class="t"><b>Fuel tank: <span data-v="tank"></span></b><span>Buy when it's cheap, burn it when it's dear. Used today: <span data-v="lit"></span></span></div><div class="meter" style="width:70px"><i data-w="tankp"></i></div></div>
    <div class="seg"><button data-act="fuel:500">+500 L<small>${money(500*price())}</small></button><button data-act="fuel:2000">+2,000 L<small>${money(2000*price())}</small></button><button data-act="fuel:99999">Fill<small data-v="fillc"></small></button></div>
    <h3>Trucks based at</h3>${chips()}`;
    if(!g.own)h+='<p>You don\'t own this depot yet.</p>';else{h+=(mine.map(t=>`<div class="truck"><div class="rowx"><div class="t"><b>${t.T.n} #${t.id}${t.o.sub?'<span class="tag">SUBBIE</span>':t.o.own?'<span class="tag">OWNED</span>':''}</b><span data-v="t${t.id}"></span></div>${t.o.sub?'':`<div class="meter" style="width:70px"><i data-w="c${t.id}"></i></div>`}</div>
      <div class="trow"><select data-chg="route:${t.id}"><option value="-1">Any store, multi-drop</option>${onStores(sel).filter(i=>!DEFS[i].tg||t.T.tg).map(i=>`<option value="${i}" ${t.o.route===i?'selected':''}>Only ${DEFS[i].n}</option>`).join('')}</select>
      ${t.o.sub?'':`<button data-act="svc:${t.id}" ${t.svc||t.state==='service'?'disabled':''}>Service ${money(t.T.svc)}</button>`}<button data-act="ret:${t.id}" ${t.retire||(!t.o.sub&&G.fleet.filter(o=>o.dep===sel).length<=1)?'disabled':''}>${t.o.sub?'Send home':t.o.own?'Sell '+money(resale(t.o)):'Return'}</button></div></div>`).join('')||'<p>None.</p>')+
    `<p style="margin-top:8px">Condition wears down with every kilometre. Worn trucks break down far more often. A service takes 2 hours.</p><h3>Lease or buy for ${DEPN[sel]}</h3><p>A lease is charged per day, starting now. Buying costs more up front but there's no daily lease, and you can sell it later for half its price, less wear. Each truck comes with a driver at $${DRIVER}/h. TG means tailgate: the only trucks that can deliver to stores with no dock.</p>`+
    ['van','r10','r16','semi'].map(k=>{const T=TYPES[k];return`<div class="rowx"><div class="t"><b>${T.n} · ${T.cap} pallets${T.tg&&k==='van'?' · TG':''}</b><span>${money(T.lease)}/day · ${T.l} L/100 km · $${perKm(T).toFixed(2)}/km today · ${T.kmh} km/h</span></div><div style="display:flex;gap:6px"><button data-act="lease:${k}" ${G.fleet.filter(o=>o.dep===sel).length>=12?'disabled':''}>Lease</button><button data-act="buy:${k}" ${G.fleet.filter(o=>o.dep===sel).length>=12||G.cash<BUY[k]?'disabled':''}>Buy ${money(BUY[k])}</button></div></div>`}).join('')+
    `<h3>Subcontractors, today only</h3><p>No lease, no driver, no fuel bill: you pay a ${money(CALLOUT)} call-out and a rate per kilometre. Good for promo days and weekends.</p>`+
    ['r10','semi'].map(k=>{const T=TYPES[k];return`<div class="rowx"><div class="t"><b>${T.n} subbie</b><span>$${T.subkm.toFixed(2)}/km all in</span></div><button data-act="sub:${k}">Call in</button></div>`}).join('')}}
  else if(tab==='stores'){h=owned().map(b=>`<h3>${DEPN[b]} contracts</h3>`+onStores(b).map(i=>{const d=DEFS[i];return`<div class="rowx"><div class="t"><b>${d.n}${G.cond.promo===i?'<span class="tag">PROMO</span>':''}${G.cond.road===i?'<span class="tag">ROADWORKS</span>':''}${d.tg?'<span class="tag">TAILGATE</span>':''}</b><span>${d.km} km · ${money(payOf(i))}/pallet${G.stores[i].dm>1?' · grown '+Math.round((G.stores[i].dm-1)*100)+'%':''} · wants <span data-v="r${i}"></span>/h${d.open>360||d.close<1080?' · receives '+hr(d.open)+'–'+hr(d.close)+(d.strict?' strict':''):''}<br>Stock <span data-v="s${i}"></span> · On the way <span data-v="i${i}"></span> · Goodwill <span data-v="g${i}"></span></span></div><div class="meter"><i data-w="g${i}"></i></div></div>`}).join('')).join('');
    const o=nextOffer();h+=o>=0?`<p style="margin-top:10px">Next contract: <b style="color:var(--ink)">${DEFS[o].n}</b> (${DEPN[DEFS[o].b]}), ${DEFS[o].km} km, ${money(DEFS[o].rate)}/pallet. ${winText(o)} Offered after a day with shelves stocked 90%+.</p>`:'<p style="margin-top:10px">You hold every contract around the depots you own.</p>';
    h+=`<p>Goodwill rises with every sale and drops with empty shelves and late trucks. At zero, the store cancels. Every 7th day each store reviews the week: 97% stocked earns a bonus and the store grows, under 85% and it cuts your rate. A truck that arrives before a store opens has to wait; one that arrives after it closes is fined.</p>`}
  else if(tab==='invest'){h='<h3>Depots</h3>'+DEPN.map((n,b)=>`<div class="rowx"><div class="t"><b>${n}</b><span>${G.deps[b].own?onStores(b).length+' of 10 stores signed':'Ten more stores, '+Math.round(b*8)+'% better rates'}</span></div><button data-act="${G.deps[b].own?'sel:'+b:'buydep:'+b}" ${G.deps[b].own||((b===0||G.deps[b-1].own)&&G.cash>=DEPCOST[b])?'':'disabled'}>${G.deps[b].own?'Owned':money(DEPCOST[b])}</button></div>`).join('')+
    '<h3>Upgrades</h3>'+Object.entries(UPS).map(([k,u])=>`<div class="rowx"><div class="t"><b>${u[0]}</b><span>${u[2]}</span></div><button data-act="up:${k}" ${G.up[k]||G.cash<u[1]?'disabled':''}>${G.up[k]?'Owned':money(u[1])}</button></div>`).join('')+
    `<h3>Bank loan</h3><div class="rowx"><div class="t"><b>Owing ${money(G.loan)}</b><span>${(LOAN_RATE*100).toFixed(1)}% interest a day (${money(G.loan*LOAN_RATE)} tomorrow). Limit ${money(LOAN_MAX)}.</span></div><div style="display:flex;gap:6px"><button data-act="repay" ${G.loan<=0||G.cash<LOAN_STEP?'disabled':''}>Repay</button><button data-act="borrow" ${G.loan>=LOAN_MAX?'disabled':''}>+${money(LOAN_STEP)}</button></div></div>
    <h3>Standing</h3><p>${TIERS.map((t,i)=>`${i<G.tier?'✅':'⬜'} ${t[1]}: ${money(t[0])} net worth`).join('<br>')}</p><p>Net worth is cash minus what you owe: <b style="color:var(--ink)">${money(G.cash-G.loan)}</b>.</p>`}
  else if(tab==='runs')h='<div id="runs">'+runsHtml()+'</div>';
  else{const mx=Math.max(1,...G.hist.slice(-14).map(x=>Math.abs(x.profit)));h=`<h3>Today so far</h3><table><tr><td>Delivery and backhaul income</td><td data-v="lrev"></td></tr><tr><td>Wages</td><td data-v="lwage"></td></tr><tr><td>Fuel, running, tolls, subcontractors</td><td data-v="lfuel"></td></tr><tr><td>Leases, rent, interest</td><td data-v="lfix"></td></tr><tr><td>Penalties, fees, repairs</td><td data-v="lpen"></td></tr><tr><td>Investments and one-offs</td><td data-v="loth"></td></tr>
    <tr class="tot"><td>Profit</td><td data-v="lprof"></td></tr></table><h3>Runsheet numbers</h3><table>${KPI.map(k=>`<tr><td>${k[1]}</td><td data-v="k_${k[0]}"></td></tr>`).join('')}</table>
    <h3>Profit by day</h3>`+(G.hist.length?`<div class="bars">${G.hist.slice(-14).map(x=>`<i title="Day ${x.day}" style="height:${Math.max(4,Math.abs(x.profit)/mx*100)}%;background:${x.profit<0?'var(--bad)':'var(--good)'}"></i>`).join('')}</div><table>`+G.hist.slice(-5).reverse().map(x=>`<tr><td>Day ${x.day} · ${(x.avail*100).toFixed(0)}% stocked</td><td class="${x.profit<0?'neg':'pos'}">${money(x.profit)}</td></tr>`).join('')+'</table>':'<p>Nothing yet.</p>')+
    `<h3>Log</h3><p data-v="log" style="white-space:pre-line"></p><button data-act="restart" style="margin-top:6px">Start a new game</button>`}
  $('#panel').innerHTML=h;$('#kpis').innerHTML=KPI.slice(0,14).map(k=>`<div class="kpi"><small>${k[1]}</small><b data-v="k_${k[0]}">–</b></div>`).join('');live()}
function live(){const d=S.d,pr=d.rev+d.bh-costs(d),g=G.deps[sel],sd=S.deps[sel],k=kpis(),v={futil:(sd.fUtil*100).toFixed(0)+'%',wh:g.wh+' of '+whCap(sel),whp:g.wh/whCap(sel)*100,ord:sd.ordered,
    need:Math.round(onStores(sel).reduce((a,i)=>a+DEFS[i].dem,0)*12.3*S.dayMul*wxMul()),tank:num(G.tank)+' of '+num(tankCap())+' L',tankp:G.tank/tankCap()*100,lit:k.lit,fillc:money((tankCap()-G.tank)*price()),
    lrev:money(d.rev+d.bh),chg:sd.forks.filter(f=>f.state==='charge').length,lwage:money(-d.wF-d.wD),lfuel:money(-d.fuel-d.sub-d.toll),lfix:money(-d.lease-d.over-d.int),lpen:money(-d.pen-d.repair-d.det),loth:money(-d.other),lprof:money(pr),log:S.log.slice(0,10).join('\n')};
  for(const key in k)v['k_'+key]=k[key];
  S.trucks.forEach(t=>{if(!t.inb){v['t'+t.id]=tStatus(t)+' · '+t.trips+' run'+(t.trips===1?'':'s')+', '+Math.round(t.km)+' km today'+(t.o.sub?'':' · condition '+Math.round(t.o.cond)+'%');v['c'+t.id]=t.o.cond}});
  G.stores.forEach((s,i)=>{if(s.on){v['r'+i]=rate(i).toFixed(1);v['s'+i]=s.stock+'/'+cap(i);v['i'+i]=s.inbound+s.planned;v['g'+i]=Math.round(s.sat)}});
  document.querySelectorAll('[data-v]').forEach(e=>{const t=v[e.dataset.v];if(t!==undefined&&e.textContent!==String(t))e.textContent=t});
  document.querySelectorAll('[data-w]').forEach(e=>{const q=+v[e.dataset.w];e.style.width=q+'%';e.style.background=q>60?'var(--good)':q>30?'#f5a300':'var(--bad)'});
  if(tab==='runs'){const el=$('#runs');if(el)el.innerHTML=runsHtml()}
  $('#hDay').textContent='Day '+G.day0+' · '+DAYS[(G.day0-1)%7];$('#hTime').textContent=clockStr();$('#hCash').textContent=money(G.cash);$('#hCash').className=G.cash<0?'neg':'';
  $('#hToday').textContent=(pr>0?'+':'')+money(pr);$('#hToday').className=pr<0?'neg':'pos';$('#hNet').textContent=money(G.cash-G.loan);$('#hAv').textContent=k.av;$('#hOt').textContent=k.ot;$('#hLd').textContent=d.loads+' / '+d.drops;advice()}
document.addEventListener('change',e=>{const el=e.target.closest('[data-chg]');if(!el)return;const[k,v]=el.dataset.chg.split(':');if(k==='fd'){G.deps[sel].fkDock[+v]=+el.value;return}const o=S.trucks.find(t=>t.id===+v);if(o)o.o.route=+el.value});
document.addEventListener('keydown',e=>{if(modal||/SELECT|INPUT/.test(e.target.tagName))return;if(e.code==='Space'){e.preventDefault();if(speed){lastSpeed=speed;speed=0}else speed=lastSpeed;render()}else if('1234'.includes(e.key)){speed=[1,2,4,8][+e.key-1];render()}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const[a,p]=b.dataset.act.split(':'),g=G.deps[sel],sd=S.deps[sel];
  if(a==='tab')tab=p;else if(a==='speed')speed=+p;else if(a==='sel'){sel=+p;if(tab==='invest')tab='team';view('depot')}
  else if(a==='view')view(p);else if(a==='zoom'){const c=$('#c');zoomAt(+p,c.clientWidth/2,c.clientHeight/2)}
  else if(a==='hire'){g.fk++;charge('other',HIRE);syncForks(sel)}else if(a==='fire'){g.fk--;syncForks(sel)}
  else if(a==='fkm')g.fkMode=p;else if(a==='fkp')G.fkPri=p;else if(a==='pay')G.pay=+p;else if(a==='min')G.minLoad=+p;else if(a==='drops')G.maxDrops=+p;else if(a==='inm')g.inMode=p;
  else if(a==='tolls')G.tolls=!G.tolls;else if(a==='bh')G.backhaul=!G.backhaul;else if(a==='cas'){sd.casual=Math.max(0,sd.casual+ +p);syncForks(sel)}
  else if(a==='buy'){if(G.cash<BUY[p])return;const o={id:G.nid++,type:p,cond:100,route:-1,dep:sel,own:true};G.fleet.push(o);addTruck(o);charge('other',BUY[p]);say(TYPES[p].n+' #'+o.id+' bought for '+DEPN[sel]+'.')}
  else if(a==='sup'){g.sup=!g.sup;say('Warehouse supervisor '+(g.sup?'hired':'let go')+' at '+DEPN[sel]+'.')}else if(a==='tr'){G.tr=!G.tr;say('Transport supervisor '+(G.tr?'hired.':'let go.'))}
  else if(a==='ord')g.order=Math.max(0,Math.min(MAXORD,g.order+ +p));
  else if(a==='rush'){charge('other',RUSH);supplier(LOAD,sel);say('Rush load of '+LOAD+' pallets is on its way to '+DEPN[sel]+'.')}
  else if(a==='xfer'){if(g.wh-sd.whRes<LOAD){say('Not enough free stock here to transfer '+LOAD+' pallets.');return}g.wh-=LOAD;charge('other',XFER);supplier(LOAD,+p);say(LOAD+' pallets on the way from '+DEPN[sel]+' to '+DEPN[+p]+'.')}
  else if(a==='rack'){g.rack++;charge('other',RACK);say('Racking extended at '+DEPN[sel]+'.')}
  else if(a==='dock'){sd.docks[g.docks].on=true;g.docks++;charge('other',DOCK);charge('over',OVER_DOCK);say('New dock open at '+DEPN[sel]+'.')}
  else if(a==='buydep'){if(G.cash<DEPCOST[+p])return;buyDepot(+p);tab='team'}
  else if(a==='fuel'){const L=Math.min(+p,tankCap()-G.tank),cost=L*price();if(L<=0||G.cash<cost){say(L<=0?'The tank is full.':'Not enough cash for that much diesel.');return}G.tank+=L;charge('fuel',cost);say('Bought '+num(L)+' L of diesel.')}
  else if(a==='lease'){const o={id:G.nid++,type:p,cond:100,route:-1,dep:sel};G.fleet.push(o);addTruck(o);charge('lease',TYPES[p].lease);say(TYPES[p].n+' #'+o.id+' leased for '+DEPN[sel]+'.')}
  else if(a==='sub'){const o={id:G.nid++,type:p,cond:100,route:-1,dep:sel,sub:true};addTruck(o);charge('sub',CALLOUT);say(TYPES[p].n+' subcontractor called in for '+DEPN[sel]+'.')}
  else if(a==='ret'){const t=S.trucks.find(t=>t.id==p);if(t){t.retire=true;if(t.o.own){G.cash+=resale(t.o);say(t.T.n+' #'+t.id+' sold for '+money(resale(t.o))+'.')}G.fleet=G.fleet.filter(o=>o.id!=p)}}
  else if(a==='svc'){const t=S.trucks.find(t=>t.id==p);if(t){t.svc=true;say(t.T.n+' #'+t.id+' booked for a service.')}}
  else if(a==='up'){const u=UPS[p];if(G.cash<u[1])return;G.up[p]=true;charge('other',u[1]);if(p==='mess')G.morale=Math.min(100,G.morale+10);say(u[0]+' installed.')}
  else if(a==='borrow'){G.loan+=LOAN_STEP;G.cash+=LOAN_STEP;say('Borrowed '+money(LOAN_STEP)+'.')}
  else if(a==='repay'){G.loan-=LOAN_STEP;G.cash-=LOAN_STEP;say('Repaid '+money(LOAN_STEP)+'.')}
  else if(a==='accept'){const s=G.stores[p],d=DEFS[p],gd=G.deps[d.b];s.on=true;s.stock=Math.round(d.cap*.5);s.sat=70;gd.order=Math.min(MAXORD,gd.order+Math.round(d.dem*13/10)*10);save();$('#offer').innerHTML='<b class="pos">Contract signed: '+d.n+'.</b><p style="margin:4px 0 0">Inbound order at '+DEPN[d.b]+' raised to '+gd.order+' a day to cover it.</p>';return}
  else if(a==='next'){hideModal();begin()}
  else if(a==='new'){newGame();hideModal();begin();view('depot')}
  else if(a==='restart'){if(confirm('Start a new game? Your current network will be lost.')){newGame();begin();view('depot')}}
  else if(a==='continue'){hideModal()}
  render()});
function begin(){G.day0=G.day;if(speed)lastSpeed=speed;speed=0;if(!G.deps[sel].own)sel=0;startDay()}

G=load();const resumed=!!G;if(!G)newGame();begin();
showModal(`<h2>Pallet Flow: Depot Manager</h2><p>You run a distribution network. Stores pay for every pallet delivered and fine you for empty shelves and late trucks.</p>
<ul><li><b>Depot:</b> order inbound stock, hire forklift operators and supervisors, assign forklifts to docks.</li><li><b>Fleet:</b> lease trucks from 4 to 24 pallets, set multi-drop runs, buy diesel, call in subcontractors.</li><li><b>Stores:</b> each has receiving hours and some need a tailgate truck. Keep shelves 90% stocked to win more contracts.</li><li><b>Invest:</b> upgrades, loans, and two more depots to buy, each with ten more stores.</li><li><b>Runs:</b> today's runsheet: every load, its drops, windows and arrival times.</li><li><b>Ledger:</b> profit and the numbers behind it.</li></ul>
<p>Each day starts paused so you can plan. Drag the map to move, pinch or scroll to zoom. Progress saves each night.</p>
<button class="pri go" data-act="${resumed?'continue':'new'}">${resumed?'Continue day '+G.day:'Open the depot'}</button>${resumed?'<button class="go" data-act="new">New game</button>':''}`);
let last=performance.now(),acc=0,uiT=0;
function frame(now){const dt=Math.min(.1,(now-last)/1000);last=now;
  if(!modal&&!S.over&&speed){acc+=dt*speed*2;let n=0;while(acc>.1&&n<40&&!S.over){step(.1);acc-=.1;n++}if(n===40)acc=0}
  draw();uiT+=dt;if(uiT>.35){uiT=0;if(!S.over)live()}requestAnimationFrame(frame)}
addEventListener('resize',()=>clampCam());
requestAnimationFrame(frame);
