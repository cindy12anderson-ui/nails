/* Nails&Gel booking demo. Availability, reviews and payment are simulated.
   Real build: services, technicians, availability and bookings come from Acuity; the deposit goes
   through the payment provider's hosted fields and wallet SDKs; reviews come from the Google Places API.
   Security: user-entered text (name, email, phone, card) is never written with innerHTML. Inputs are
   filled with .value and the bar/summary use textContent or static data only. */
(function(){
"use strict";

/* DEMO: always show the Apple Pay and Google Pay buttons so the client can see the flow.
   Production: set DEMO=false. Apple Pay then shows only when ApplePaySession.canMakePayments()
   is true, and Google Pay only when the Google Pay client reports isReadyToPay. */
const DEMO=true;

const IMG="assets/img/";
const INSTAGRAM="https://www.instagram.com/nailangelmelbourne/";
const ADDRESS="Level 1, 179 Little Bourke St, Melbourne VIC 3000";
const DEPOSIT=30;
const DEPOSIT_LINE="A $30 non-refundable deposit (2% card surcharge) secures your booking and is deducted from your total.";
const VOUCHER_LINE="Please don’t use a gift voucher for the deposit.";
const EXT=' target="_blank" rel="noopener noreferrer"';
const NEWTAB='<span class="sr-only"> (opens in a new tab)</span>';

/* ---------- Photos (real salon photos only; see README for the assignment) ---------- */
const P={
  express:{src:"express-manicure.jpg",sm:"express-manicure-288.jpg",sw:291,w:560,h:555,alt:"Short natural nails with neat cuticles"},
  deluxe:{src:"deluxe-manicure.jpg",sm:"deluxe-manicure-288.jpg",sw:289,w:560,h:559,alt:"Hands resting over a bowl of rose petals and lemon slices"},
  shellac:{src:"shellac-manicure.jpg",sm:"shellac-manicure-288.jpg",sw:289,w:560,h:558,alt:"Pale pink gel polish on short nails, with a pink ring"},
  biab:{src:"biab-grid.jpg",w:317,h:315,alt:"Four BIAB sets: sheer pink, pearl chrome, glitter tips and taupe cat eye"},
  biab119:{src:"biab-special.jpg",w:317,h:315,alt:"BIAB $119 Special designs displayed on nail tips"},
  hard:{src:"hard-gel.jpg",w:317,h:316,alt:"Four hard gel sets: pale pink, holographic glitter, pink chrome and rose cat eye"},
  monthly:{src:"monthly-design.jpg",w:317,h:316,alt:"This month’s hard gel designs displayed on nail tips"},
  simple:{src:"simple-design.jpg",w:317,h:317,alt:"Four simple designs: French tips, ombré, a daisy accent and dots"},
  custom:{src:"custom-design.jpg",w:317,h:315,alt:"Four custom nail art sets with 3D gold, pastel, smoky chrome and black designs"},
  biting:{src:"nail-biting.jpg",w:317,h:317,alt:"Bitten nails before, and the same nails after a pink gel set"},
  nudeToes:{src:"pedi-nude-toes.jpg",w:384,h:384,alt:"Nude gel polish on toes, with fingertips resting above"},
  redToes:{src:"pedi-red-toes.jpg",w:375,h:375,alt:"Deep red gel polish on toes"},
  nude:{src:"mani-pedi-nude.jpg",sm:"mani-pedi-nude-288.jpg",sw:358,w:560,h:450,alt:"Nude gel on toes, with a matching manicure"},
  nudeKit:{src:"mani-pedi-nude.jpg",sm:"mani-pedi-nude-288.jpg",sw:358,w:560,h:450,alt:"Nude gel on almond nails and toes"},
  nudeKitToes:{src:"mani-pedi-nude.jpg",sm:"mani-pedi-nude-288.jpg",sw:358,w:560,h:450,alt:"Nude almond gel on fingers and toes",pos:"pos-toes"},
  red:{src:"mani-pedi-red.jpg",sm:"mani-pedi-red-288.jpg",sw:288,w:560,h:560,alt:"Deep red gel on fingers and toes"},
  kids:{src:"kids-spa.jpg",sm:"kids-spa-288.jpg",sw:289,w:560,h:559,alt:"A child in a fluffy robe and hair rollers, with red nails and toes"},
  pediArch:{src:"pedi-nude-arch.jpg",w:420,h:560,alt:""}
};

/* ---------- Data (source of truth: content/acuity-content.md) ----------
   L = what's included: [text, tone] where tone is "good" (✓), "" (neutral) or "no" (✕, not included).
   key = the one decision-critical chip shown outside Details. */
const PKG_NOTE="Manicure and pedicure are done by the same technician, one after the other. Single-colour gel only. For nail art or a spa pedicure, please book them separately from the individual menu, as they aren’t included in these packages.";
const PKG_L=[["Same technician, one after the other",""],["Single-colour gel only",""],["No nail art","no"],["No spa pedicure","no"]];

const CATS=[
 {id:"mani",t:"Manicure",s:"Gel, BIAB, hard gel and nail art",ph:P.shellac,groups:[{items:[
  {id:"express",n:"Express manicure",m:30,c:79,h:69,ph:P.express,key:["No gel","no"],
   d:"E-file nail shaping and cuticle care, finished with nail serum.",L:[["No gel","no"]]},
  {id:"deluxe",n:"Deluxe manicure",m:30,c:89,h:79,ph:P.deluxe,key:["No gel","no"],
   d:"E-file nail and cuticle care, then hand spa, scrub, massage and paraffin. Finished with nail serum.",L:[["No gel","no"]]},
  {id:"shellac",n:"Shellac manicure",m:35,c:89,h:79,ph:P.shellac,
   d:"A lightweight gel polish manicure for a clean, natural-looking finish. Includes E-file manicure, single-colour gel and removal of our gel.",
   L:[["No builder gel","no"],["No nail art","no"],["No extensions","no"]]},
  {id:"biab",n:"BIAB manicure",m:45,c:109,h:99,ph:P.biab,
   d:"A lightweight builder gel that strengthens and protects your natural nails. Includes E-file manicure, single-colour gel and removal of our gel.",
   L:[["Lasts 4 weeks","good"],["2-week warranty","good"],["Cat eye or chrome available",""],["No nail art","no"],["No extensions","no"]]},
  {id:"biab119",n:"BIAB $119 Special",m:55,c:129,h:119,ph:P.biab119,
   d:"A lightweight builder gel that strengthens and protects your natural nails. Includes E-file manicure and removal of our gel.",
   L:[["Lasts 4 weeks","good"],["2-week warranty","good"],["No extensions","no"]]},
  {id:"hard",n:"Hard gel manicure",m:55,c:129,h:119,ph:P.hard,
   d:"Our signature. A hard builder gel that strengthens and supports your natural nails with a durable finish. Includes E-file manicure, single-colour gel and removal of our gel.",
   L:[["Lasts 6–8 weeks","good"],["2-week warranty","good"],["Cat eye or chrome available",""],["Extensions can be added",""]]},
  {id:"monthly",n:"Hard gel · Monthly design",m:85,range:"$159–$199",cashOff:10,ph:P.monthly,ig:true,
   d:"A selection of designs on sale for the current month only. After the month ends, they return to their regular prices. Includes hard gel manicure, E-file care and removal of our gel.",
   d2:"For a design from a previous month, please book Custom design.",
   L:[["Lasts 6–8 weeks","good"],["2-week warranty","good"],["Extensions can be added",""],["Discounts don’t apply","no"]]},
  {id:"simple",n:"Hard gel · Simple design",m:70,range:"$160–$180",cashOff:10,ph:P.simple,
   d:"French tips, ombré, dot art, or nail art on just one or two fingers. Includes E-file manicure and removal of our gel.",
   L:[["Lasts 6–8 weeks","good"],["2-week warranty","good"],["Extensions can be added",""]]},
  {id:"custom",n:"Hard gel · Custom design",m:85,range:"$200–$300",cashOff:10,ph:P.custom,
   d:"Any nail art design, including designs from previous months. Bring an inspiration photo or choose one of our past designs. Includes E-file manicure and removal of our gel.",
   L:[["Lasts 6–8 weeks","good"],["2-week warranty","good"],["Extensions can be added",""]]},
  {id:"biting",n:"Nail Biting Correction Program",m:60,ph:P.biting,
   rows:[["1st session $170","$160 cash"],["Sessions 2–4 $110","$100 cash"]],short:"1st session $170 · $160 cash",
   d:"Four full sets of nail extensions with a plain-colour manicure. One session every 2 weeks; advance booking required. Unlimited free nail repairs during the program. Removal included from the 2nd session.",
   L:[["Free repairs during program","good"],["Every 2 weeks · 4 sessions",""],["No further discounts","no"]]},
  {id:"removal",n:"Removal only, no new set",m:10,plate:"Removal",
   rows:[["Gel $40","$30 cash"],["SNS or acrylic $50","$40 cash"]],short:"Gel $40 · SNS or acrylic $50",
   d:"Removal of gel, SNS or acrylic, without a new set.",L:[]}
 ]}]},
 {id:"pedi",t:"Pedicure",s:"From express polish to full spa",ph:P.pediArch,groups:[{items:[
  {id:"p11",n:"1+1 Deluxe Pedicure",sub:"Premium Care + foot paraffin",m:90,one:["$184 for two","cash price"],short:"$184 for two, cash",ph:P.nudeToes,key:["For two","good"],
   d:"Full Basic Care plus deep steam massage, hot stones and hot towels, and foot paraffin. This package covers two people, so you only need to book it once.",
   L:[["For two","good"],["Valid until 15 Oct",""]]},
  {id:"pexp",n:"Express pedicure",m:30,c:99,h:89,ph:P.redToes,key:["No spa","no"],
   d:"Nail and cuticle care with gel polish.",L:[["No spa","no"]]},
  {id:"pdeluxe",group:true,n:"Deluxe pedicure",ph:P.nude,shown:"Shown with a matching manicure, which is booked separately",legend:"Care level",tiers:[
   {id:"pbasic",n:"Deluxe pedicure · Basic Care",tn:"Basic Care",short:"Basic",lvl:1,m:45,c:109,h:99,
    d:"Soak, heel exfoliation, scrub, cream, cuticle and nail care, and gel polish.",L:[["No massage","no"]]},
   {id:"prelax",n:"Deluxe pedicure · Relax Care",tn:"Relax Care",short:"Relax",lvl:2,m:60,c:129,h:119,
    d:"Full Basic Care plus a quick relaxing massage.",L:[]},
   {id:"pdeep",n:"Deluxe pedicure · Deep Care",tn:"Deep Care",short:"Deep",lvl:3,m:75,c:149,h:139,
    d:"Full Basic Care plus a deep steam massage.",L:[]},
   {id:"pprem",n:"Deluxe pedicure · Premium Care",tn:"Premium Care",short:"Premium",lvl:4,m:90,c:169,h:159,
    d:"Full Basic Care plus deep steam massage, hot stones and hot towels.",L:[]}
  ]}
 ]}]},
 {id:"pkg",t:"Mani + Pedi",s:"Packages and a kids’ spa",ph:P.red,groups:[
  {h:"Mani + Pedi packages",note:PKG_NOTE,items:[
   {id:"kshellac",n:"Shellac Mani + Pedi",m:65,c:169,h:159,ph:P.red,
    d:"Shellac manicure and pedicure in a single colour.",L:PKG_L},
   {id:"kbiab",n:"BIAB Mani + Pedi",m:15,c:179,h:169,ph:P.nudeKit,flag:"duration to confirm",
    d:"BIAB manicure and pedicure in a single colour.",L:PKG_L,hint:"Listed in Acuity as 15 minutes while we confirm the exact time with the salon."},
   {id:"khard",n:"Hard Gel Mani + Pedi",m:85,c:189,h:179,ph:P.nudeKitToes,
    d:"Hard gel manicure and pedicure in a single colour.",L:PKG_L}
  ]},
  {h:"For kids",items:[
   {id:"kids",n:"Kids Spa + Mani",m:60,one:["$149","$139 cash · was $198"],short:"$149 · $139 cash",ph:P.kids,key:["Save $59","good"],
    d:"Safe soft gel for kids, with a peelable option, and a fun bath bomb spa experience included.",
    L:[["Save $59","good"],["No further discounts","no"]]}
  ]}
 ]}
];
const TECHS=[
 {id:"any",n:"Any available",mono:"✦",r:"First available",d:"Whoever is free first at your chosen time."},
 {id:"judy",n:"Judy",mono:"J",r:"Senior technician · 3+ years",d:"Wedding, feminine and cute designs. A gift for colour matching, and for finding the shade that suits you."},
 {id:"rachel",n:"Rachel",mono:"R",r:"Senior technician · 3+ years",d:"Y2K, chrome and unique statement nails. Loves a bold, creative set. Also qualified in foot massage."},
 {id:"annie",n:"Annie",mono:"A",r:"Master technician · 9 years",d:"Custom nail design. Creates personalised sets to match your style and inspiration."}
];
const ADDONS=[
 {id:"rmOther",n:"Removal: another salon’s gel",x:"+$2 each · +5 min",min:5},
 {id:"rmOurs",n:"Removal: our gel",x:"Free · +5 min",min:5},
 {id:"rmExt",n:"Removal: another salon’s extensions, acrylic or SNS",x:"+$3 each · +15 min",min:15},
 {id:"handspa",n:"Hand spa and paraffin treatment",x:"+$25",min:0}
];
const STEPS=["Treatment","Technician","Date & time","Details","Payment"];
const TODAY=new Date(2026,8,28); /* demo "today": Monday 28 Sep 2026, Melbourne */
const BASE_SLOTS=["9:30 AM","10:15 AM","11:00 AM","11:45 AM","12:30 PM","1:15 PM","2:30 PM","3:30 PM","3:35 PM","3:50 PM","3:55 PM","4:00 PM","4:05 PM","4:10 PM","4:15 PM","4:20 PM","4:25 PM","4:30 PM","4:55 PM","5:00 PM","5:05 PM","5:10 PM","5:15 PM","6:00 PM"];

/* Confirmations mirror Acuity: dep, chk and refund are required; cancel and late are not. */
const CONFIRMS=[
 {k:"dep",id:"okdep",req:true,label:"I understand my deposit is non-refundable",err:"Please confirm you understand the deposit is non-refundable."},
 {k:"chk",id:"okchk",req:true,label:"I double-checked my booking",err:"Please confirm you’ve double-checked your booking."},
 {k:"cancel",id:"okcancel",req:false,label:"I agree to the cancellation and rescheduling policy"},
 {k:"late",id:"oklate",req:false,label:"I agree to the late arrivals policy"},
 {k:"refund",id:"okrefund",req:true,label:"I agree to the refund policy",err:"Please agree to the refund policy to continue."}
];

function fresh(){return {step:0,cat:null,svc:null,tech:null,addons:{},month:new Date(2026,8,1),date:null,time:null,tier:{},
  f:{fn:"",ln:"",cc:"+61",ph:"",em:"",sms:false,first:false},ok:{},tried:false,paid:false,payMethod:""};}
let st=fresh();

/* Flatten: ALL holds every bookable item (tiers included), GROUPS the tier cards. */
const ALL=[],GROUPS={};
CATS.forEach(c=>c.groups.forEach(g=>g.items.forEach(i=>{
  if(i.group){GROUPS[i.id]=i;i.tiers.forEach(t=>{t.ph=i.ph;t.cat=c.id;t.parent=i.id;ALL.push(t);});}
  else{i.cat=c.id;ALL.push(i);}
})));

/* ---------- Helpers ---------- */
const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
function esc(s){return String(s).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
function dur(m){return m<60?m+" min":Math.floor(m/60)+" h"+(m%60?" "+(m%60)+" min":"");}
function fmtDate(d){return d.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long"});}
function shortDate(d){return d.toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"});}
function isOpen(d){return d.getDay()!==1&&d>TODAY;}
function isWeekend(d){return d.getDay()===0||d.getDay()===6;}
function svc(){return ALL.find(x=>x.id===st.svc);}
function tech(){return TECHS.find(x=>x.id===st.tech);}
function withName(t){return t.id==="any"?"the first available technician":t.n;}
function reduced(){return matchMedia("(prefers-reduced-motion: reduce)").matches;}
function announce(t){const l=$("#live");if(!l)return;l.textContent="";setTimeout(()=>{l.textContent=t;},60);}
function tierOf(g){const id=st.tier[g.id]||g.tiers[0].id;return g.tiers.find(t=>t.id===id);}

function priceHTML(i){
  const row=(b,c)=>'<span class="prow"><b>'+b+'</b> <span class="cash">'+c+'</span></span>';
  if(i.rows)return i.rows.map(r=>row(r[0],r[1])).join("");
  if(i.one)return row(i.one[0],i.one[1]);
  if(i.range)return row(i.range,"$"+i.cashOff+" off with cash");
  return row("$"+i.c,"$"+i.h+" cash");
}
function priceShort(i){
  if(i.short)return i.short;
  if(i.range)return i.range+" · $"+i.cashOff+" off with cash";
  return "$"+i.c+" · $"+i.h+" cash";
}
/* sizes: when given and a 288px copy exists, the browser picks it for small renders (96px thumbs at 3x). */
function img(p,eager,alt,sizes){
  const set=sizes&&p.sm?' srcset="'+IMG+p.sm+" "+p.sw+"w, "+IMG+p.src+" "+p.w+'w" sizes="'+sizes+'"':"";
  return '<img src="'+IMG+p.src+'"'+set+' alt="'+esc(alt!==undefined?alt:p.alt)+'" width="'+p.w+'" height="'+p.h+'"'+(eager?"":' loading="lazy"')+' decoding="async">';
}
const THUMB="(min-width:600px) 120px, 96px";
function media(i,eager){
  if(i.plate)return '<div class="media plate" aria-hidden="true"><span>'+i.plate+'</span></div>';
  return '<div class="media'+(i.ph.pos?" "+i.ph.pos:"")+'">'+img(i.ph,eager,undefined,THUMB)+'</div>';
}
const CHEV_L='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>';
const CHEV_R='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>';
const ARROW='<span aria-hidden="true" class="ext">↗</span>';

/* ---------- Service card ---------- */
function inclList(L){
  if(!L||!L.length)return "";
  return '<ul class="incl-list">'+L.map(c=>'<li class="'+(c[1]||"neutral")+'">'+c[0]+(c[1]==="no"?'<span class="sr-only"> (not included)</span>':"")+'</li>').join("")+'</ul>';
}
function svcCard(item,lvl,idx){
  const H="h"+(lvl||3),g=item.group?item:null,i=g?tierOf(g):item;
  const cid=g?g.id:i.id,name=g?g.n:i.n;
  let h='<article class="svc" id="card-'+cid+'"'+(g?' data-group="'+g.id+'" data-lvl="'+(lvl||3)+'"':"")+' aria-labelledby="h-'+cid+'">'+
    media(g||i,idx<2)+
    '<div class="body"><'+H+' id="h-'+cid+'">'+name+'</'+H+'>'+
    (g?'<p class="sub">'+i.tn+'</p>':(i.sub?'<p class="sub">'+i.sub+'</p>':""))+
    '<p class="meta num"><span>'+dur(i.m)+'</span>'+(i.flag?'<span class="flag">'+i.flag+'</span>':"")+'</p>'+
    '<p class="price num">'+priceHTML(i)+'</p>'+
    (i.key?'<p class="key '+i.key[1]+'">'+i.key[0]+(i.key[1]==="no"?'<span class="sr-only"> (not included)</span>':"")+'</p>':"")+
    '</div>';
  const shown=(g||i).shown;
  if(shown)h+='<p class="shown">'+shown+'</p>';
  if(i.ig)h+='<p class="ig"><a href="'+INSTAGRAM+'"'+EXT+'>See this month’s designs on <span class="nowrap">Instagram '+ARROW+'</span>'+NEWTAB+'</a></p>';
  if(g){
    h+='<fieldset class="tiers"><legend>'+g.legend+'</legend><div class="seg">'+g.tiers.map(t=>{
      const on=t.id===i.id;let dots='<span class="dots" aria-hidden="true">';for(let k=1;k<=4;k++)dots+='<i'+(k<=t.lvl?' class="f"':"")+'></i>';dots+='</span>';
      return '<label class="'+(on?"is-on":"")+'"><input type="radio" name="tier-'+g.id+'" value="'+t.id+'"'+(on?" checked":"")+'><span>'+t.short+'</span>'+dots+'</label>';
    }).join("")+'</div></fieldset>';
  }
  h+='<div class="svc-foot"><details class="incl"><summary>Details<span class="sr-only"> of '+esc(i.n)+'</span></summary>'+
     (g?'<p class="desc tier-note">Every deluxe pedicure starts with Basic Care.</p>':"")+
     '<p class="desc">'+i.d+'</p>'+(i.d2?'<p class="desc">'+i.d2+'</p>':"")+inclList(i.L)+
     (i.hint?'<p class="hint">'+i.hint+'</p>':"")+'</details>'+
     '<button type="button" class="btn-select" data-svc="'+i.id+'">Select<span class="sr-only"> '+esc(i.n)+'</span></button></div></article>';
  return h;
}
function groupHTML(g,lvl){
  return (g.h?'<h'+lvl+' class="subhead">'+g.h+'</h'+lvl+'>':"")+(g.note?'<p class="groupnote">'+g.note+'</p>':"")+
    '<div class="svcs">'+g.items.map((i,k)=>svcCard(i,g.h?lvl+1:lvl,k)).join("")+'</div>';
}

/* ---------- Summary (aside on desktop, bottom sheet on mobile) ---------- */
function summaryHTML(withImg){
  const i=svc();if(!i)return "";
  const t=tech(),adds=ADDONS.filter(a=>st.addons[a.id]).map(a=>a.n);
  const row=(k,v)=>'<div class="srow"><span>'+k+'</span><span>'+v+'</span></div>';
  let r="";
  if(withImg&&i.ph)r+='<div class="sm-img'+(i.ph.pos?" "+i.ph.pos:"")+'">'+img(i.ph,false,"","256px")+'</div>';
  r+=row("Treatment",i.n);
  r+=row("Price",'<span class="num">'+priceShort(i)+'</span>');
  r+=row("Duration",'<span class="num">'+dur(i.m)+'</span>'+(i.flag?' <span class="flag">to confirm</span>':""));
  if(t)r+=row("With",t.n);
  if(st.date)r+=row("When",fmtDate(st.date)+(st.time?"<br>"+st.time:""));
  if(st.date&&isWeekend(st.date))r+=row("Weekend","10% weekend surcharge, members exempt");
  if(adds.length)r+=row("Add-ons",adds.join("<br>"));
  r+='<div class="srow total"><span>Deposit today</span><span class="num">$'+DEPOSIT+' AUD</span></div>'+
     '<p class="small">'+DEPOSIT_LINE+'</p>';
  return r;
}
function summary(){
  const el=$("#summary"),has=st.step>0&&!st.paid&&svc();
  el.innerHTML=has?'<h2>Your booking</h2>'+summaryHTML(true):"";
}

/* ---------- Sticky bar (mobile) ---------- */
function bar(){
  const b=$("#bar"),i=svc(),t=tech(),show=!!(!st.paid&&st.step>=1&&i);
  b.hidden=!show;document.body.classList.toggle("has-bar",show);
  if(!show)return;
  $(".bar-t",b).textContent=i.n;
  const sub=[];
  if(st.step===1||!st.date)sub.push(dur(i.m),priceShort(i));
  else{sub.push(shortDate(st.date)+(st.time?", "+st.time:""));if(t)sub.push(t.n);if(isWeekend(st.date))sub.push("+10% weekend");}
  $(".bar-s",b).textContent=sub.join(" · ");
  const cta=$(".bar-cta",b),due=$(".bar-due",b);
  cta.hidden=!(st.step===2||st.step===3);due.hidden=st.step!==4;
  if(st.step===2){cta.textContent="Continue";cta.dataset.action="to-details";cta.setAttribute("aria-label","Continue to your details");cta.setAttribute("aria-disabled",String(!st.time));}
  if(st.step===3){cta.textContent="Continue";cta.dataset.action="submit-details";cta.setAttribute("aria-label","Continue to payment");cta.removeAttribute("aria-disabled");}
}

/* ---------- Progress ---------- */
function progress(){
  const el=$("#progress");
  el.hidden=st.paid;if(st.paid){el.innerHTML="";return;}
  const cur=st.step;
  el.innerHTML='<ol>'+STEPS.map((s,i)=>{
    if(i<cur)return '<li class="is-done"><button type="button" data-go="'+i+'">'+s+'<span class="sr-only"> (done, go back)</span></button></li>';
    return '<li'+(i===cur?' aria-current="step"':"")+'><span>'+s+'</span></li>';
  }).join("")+'</ol>'+
  '<div class="pbar" aria-hidden="true"><span class="lbl">Step '+(cur+1)+' of 5 · <b>'+STEPS[cur]+'</b></span><span class="track">'+
  STEPS.map((_,i)=>'<i'+(i<=cur?' class="on"':"")+'></i>').join("")+'</span></div>';
}

/* ---------- Calendar and times ---------- */
function calendar(){
  const m=st.month,y=m.getFullYear(),mo=m.getMonth();
  const first=new Date(y,mo,1).getDay(),days=new Date(y,mo+1,0).getDate();
  const canPrev=!(y===TODAY.getFullYear()&&mo===TODAY.getMonth());
  let cells=["S","M","T","W","T","F","S"].map(d=>'<div class="dow" aria-hidden="true">'+d+'</div>').join("");
  for(let i=0;i<first;i++)cells+='<div></div>';
  for(let d=1;d<=days;d++){
    const dt=new Date(y,mo,d),open=isOpen(dt),sel=st.date&&+st.date===+dt,we=isWeekend(dt)&&open;
    const why=open?"":(dt.getDay()===1?", closed Mondays":", unavailable");
    cells+='<button type="button" class="day" data-date="'+(+dt)+'"'+(open?"":" disabled")+' aria-pressed="'+(!!sel)+'" aria-label="'+fmtDate(dt)+why+(we?", 10% weekend surcharge":"")+'"><span>'+d+(we?'<i class="we"></i>':"")+'</span></button>';
  }
  return '<div class="cal"><div class="calhead"><button type="button" data-month="-1"'+(canPrev?"":" disabled")+' aria-label="Previous month">'+CHEV_L+'</button><b>'+m.toLocaleDateString("en-AU",{month:"long",year:"numeric"})+'</b><button type="button" data-month="1" aria-label="Next month">'+CHEV_R+'</button></div>'+
  '<div class="grid7">'+cells+'</div>'+
  '<div class="legend"><span><i></i>Weekends: 10% surcharge, members exempt</span><span>Closed Mondays · Melbourne time</span></div></div>';
}
function slotsFor(d){const seed=d.getDate()*7+d.getMonth()*3;return BASE_SLOTS.filter((_,k)=>((k*5+seed)%9)>2);}
function hour24(t){const p=t.split(/[: ]/);let h=+p[0];if(p[2]==="PM"&&h!==12)h+=12;if(p[2]==="AM"&&h===12)h=0;return [h,+p[1]];}
function slots(){
  const list=slotsFor(st.date),parts=[["Morning",0,12],["Afternoon",12,17],["Evening",17,24]];
  return parts.map(p=>{
    const s=list.filter(t=>{const h=hour24(t)[0];return h>=p[1]&&h<p[2];});
    if(!s.length)return "";
    return '<div class="slotgroup" role="group" aria-label="'+p[0]+', '+fmtDate(st.date)+'"><p class="slotlabel" aria-hidden="true">'+p[0]+'</p><div class="slots">'+
      s.map(t=>'<button type="button" class="slot" data-time="'+t+'" aria-pressed="'+(st.time===t)+'">'+t+'</button>').join("")+'</div></div>';
  }).join("")+'<p class="hint">Example times, Melbourne time. The live site shows real availability from Acuity.</p>';
}

/* ---------- Reviews (placeholders until the Google Places feed is connected) ---------- */
const GREVIEWS="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent("Nail&Gel 179 Little Bourke St Melbourne");
function reviewsHTML(){
  /* Replace with Google Places API reviews (fetched server-side). Do not hand-write reviews,
     names or ratings, and do not add aggregateRating to the schema until live data is connected. */
  let cards="";
  for(let k=1;k<=5;k++)cards+='<li class="rv-card"><figure><p class="rv-label">Placeholder</p>'+
    '<blockquote><p>Google review, connects to the salon’s Google Business profile at launch.</p></blockquote>'+
    '<span class="rv-lines" aria-hidden="true"><i></i><i></i><i></i></span>'+
    '<figcaption>Reviewer name · Date · Google</figcaption></figure></li>';
  return '<section class="reviews" aria-labelledby="rv-h"><div class="rv-head"><div><p class="eyebrow">Google reviews</p><h2 id="rv-h">In our clients’ words</h2>'+
    '<p class="rv-sub">Reviews from our Google Business profile appear here at launch.</p></div>'+
    '<div class="rv-nav"><button type="button" class="rv-btn" data-rv="-1" aria-controls="rv-list" aria-label="Previous review">'+CHEV_L+'</button>'+
    '<button type="button" class="rv-btn" data-rv="1" aria-controls="rv-list" aria-label="Next review">'+CHEV_R+'</button></div></div>'+
    '<ul class="rv-list" id="rv-list" tabindex="0" aria-label="Google reviews, placeholders. Scroll sideways for more.">'+cards+'</ul>'+
    '<p class="rv-foot"><a href="'+GREVIEWS+'"'+EXT+'>Read all reviews on <span class="nowrap">Google '+ARROW+'</span>'+NEWTAB+'</a></p></section>';
}
function rvSync(){
  const list=$("#rv-list");if(!list)return;
  const max=list.scrollWidth-list.clientWidth-2,prev=$('[data-rv="-1"]'),next=$('[data-rv="1"]'),a=document.activeElement;
  prev.disabled=list.scrollLeft<=2;
  next.disabled=list.scrollLeft>=max;
  /* A button that disables itself while focused would drop keyboard focus to <body>: hand it to the other one. */
  if(a===prev&&prev.disabled&&!next.disabled)next.focus();
  else if(a===next&&next.disabled&&!prev.disabled)prev.focus();
}
function rvInit(){
  const list=$("#rv-list");if(!list)return;
  list.addEventListener("scroll",()=>{clearTimeout(list._t);list._t=setTimeout(rvSync,80);},{passive:true});
  rvSync();
}

/* ---------- Views ---------- */
function homeView(){
  return '<div class="home-intro center"><h1 id="h1">Book an appointment</h1>'+
   '<p class="lede">Choose a category to see treatments, prices and what’s included.</p></div>'+
   '<div class="cats">'+CATS.map(c=>'<button type="button" class="cat" data-cat="'+c.id+'"><span class="img">'+img(c.ph,true,"")+'</span>'+
     '<span class="t">'+c.t+'</span><span class="s">'+c.s+'</span><span class="go" aria-hidden="true">View treatments</span></button>').join("")+'</div>'+
   '<div class="showall"><button type="button" class="textlink" data-cat="all">See the full menu</button></div>'+
   reviewsHTML()+
   '<aside class="note" aria-labelledby="multi"><h2 id="multi">Booking for more than one person or service?</h2>'+
    '<p>Each booking is for one person and one service.</p>'+
    '<details class="how"><summary>How it works</summary>'+
    '<p>To book for two people, complete the first booking, then make a second booking for the other person. The same applies if you’d like more than one service.</p>'+
    '<p>For example, book BIAB with Sue at 9:00 am, then make a separate booking for BIAB with Ashley at 9:00 am. If you prefer the same technician, book back-to-back times, such as Sue at 9:00 am and 10:00 am, subject to availability.</p>'+
    '<p>Please select any add-ons you need, such as nail extensions or removal, in each booking.</p></details></aside>';
}
function listView(){
  const back='<button type="button" class="back" data-back>'+CHEV_L+'All categories</button>';
  if(st.cat==="all"){
    return back+'<div class="cat-head"><h1 id="h1">All treatments</h1></div>'+
     CATS.map(c=>'<section class="allgroup" aria-labelledby="g-'+c.id+'"><h2 id="g-'+c.id+'">'+c.t+'</h2>'+
       c.groups.map(g=>groupHTML(g,3)).join("")+'</section>').join("");
  }
  const c=CATS.find(x=>x.id===st.cat);
  return back+'<div class="cat-head"><h1 id="h1">'+c.t+'</h1></div>'+c.groups.map(g=>groupHTML(g,2)).join("");
}
function techView(){
  return '<button type="button" class="back" data-go="0">'+CHEV_L+'Change treatment</button>'+
   '<h1 id="h1">Choose your technician</h1>'+
   '<p class="loc">Level 1, 179 Little Bourke St, Melbourne</p>'+
   '<div class="techs">'+TECHS.map(t=>'<button type="button" class="tech" data-tech="'+t.id+'" aria-pressed="'+(st.tech===t.id)+'"><span class="mono" aria-hidden="true">'+t.mono+'</span><span class="n">'+t.n+'</span><span class="r">'+t.r+'</span><span class="d">'+t.d+'</span></button>').join("")+'</div>';
}
function timeView(){
  return '<button type="button" class="back" data-go="1">'+CHEV_L+'Change technician</button>'+
   '<h1 id="h1">Choose a date and time</h1>'+
   '<h2 class="sectionlabel">Date</h2>'+calendar()+
   '<h2 class="sectionlabel" id="timelabel">Time'+(st.date?' · '+shortDate(st.date):"")+'</h2>'+
   (st.date?slots():'<p class="placeholder">Choose a date to see available times</p>')+
   '<h2 class="sectionlabel">Add to your appointment</h2>'+
   '<p class="hint addon-hint">Optional. Add-ons can’t be added on the day. Please choose them now.</p>'+
   '<div class="checks">'+ADDONS.map(a=>'<label class="check" for="a-'+a.id+'"><input type="checkbox" id="a-'+a.id+'" data-addon="'+a.id+'"'+(st.addons[a.id]?" checked":"")+'><span>'+a.n+'<span class="x">'+a.x+'</span></span></label>').join("")+'</div>'+
   '<button type="button" class="cta" data-action="to-details"'+(st.time?"":' aria-disabled="true"')+' aria-describedby="why">Continue</button>'+
   '<p class="why" id="why">'+(st.time?"":(st.date?"Choose a time to continue.":"Choose a date and time to continue."))+'</p>';
}
function field(id,label,input,extra){
  return '<div class="field'+(extra||"")+'"><label for="'+id+'">'+label+' <span class="req" aria-hidden="true">*</span></label>'+input+'<p class="err" id="'+id+'-err" hidden></p></div>';
}
function checkbox(id,attrs,label,req){
  return '<label class="check" for="'+id+'"><input type="checkbox" id="'+id+'" '+attrs+(req?" required":"")+'><span>'+label+(req?' <span class="req" aria-hidden="true">*</span>':"")+'</span></label>';
}
function policy(title,sub,body,confirmKey){
  const c=CONFIRMS.find(x=>x.k===confirmKey);
  return '<div class="pol"><details name="policy"><summary><span class="st">'+title+'</span><small>'+sub+'</small></summary><div class="pbody">'+body+'</div></details>'+
    (c?'<div class="pol-ok">'+checkbox(c.id,'data-ok="'+c.k+'"'+(st.ok[c.k]?" checked":""),c.label,c.req)+(c.req?'<p class="err" id="'+c.id+'-err" hidden></p>':"")+'</div>':"")+'</div>';
}
function detailsView(){
  const f=st.f,cc=v=>f.cc===v?" selected":"";
  return '<button type="button" class="back" data-go="2">'+CHEV_L+'Change date or time</button>'+
   '<h1 id="h1">Your details</h1>'+
   '<form class="form" id="dform" novalidate aria-describedby="reqnote">'+
   '<p class="hint full" id="reqnote">Fields marked <span class="req" aria-hidden="true">*</span><span class="sr-only">with an asterisk</span> are required.</p>'+
   field("fn","First name",'<input id="fn" name="given-name" autocomplete="given-name" autocapitalize="words" spellcheck="false" enterkeyhint="next" required>')+
   field("ln","Last name",'<input id="ln" name="family-name" autocomplete="family-name" autocapitalize="words" spellcheck="false" enterkeyhint="next" required>')+
   '<p class="korean full"><span lang="ko">한국분들은 한글로 예약해 주세요. 예) 김태희 또는 제시카 김</span><span class="en">Korean clients: please enter your name in Korean.</span></p>'+
   '<div class="field full"><label for="ph">Mobile <span class="req" aria-hidden="true">*</span></label><div class="phone"><label for="cc" class="sr-only">Country code</label>'+
    '<select id="cc" name="tel-country-code" autocomplete="tel-country-code"><option value="+61"'+cc("+61")+'>AU +61</option><option value="+64"'+cc("+64")+'>NZ +64</option><option value="+82"'+cc("+82")+'>KR +82</option><option value="+1"'+cc("+1")+'>US +1</option><option value="+44"'+cc("+44")+'>UK +44</option></select>'+
    '<input id="ph" name="tel-national" type="tel" inputmode="tel" autocomplete="tel-national" enterkeyhint="next" required placeholder="412 345 678"></div><p class="err" id="ph-err" hidden></p></div>'+
   field("em","Email",'<input id="em" name="email" type="email" autocomplete="email" autocapitalize="off" spellcheck="false" enterkeyhint="done" required>'," full")+
   '<div class="full checks">'+
    checkbox("first",'data-f="first"'+(f.first?" checked":""),"I’m a first-visit client",false)+
    checkbox("sms",'data-f="sms"'+(f.sms?" checked":""),"By ticking, you accept the Terms of Service, confirm you’ve read and understood our Privacy Policy, and consent to receive SMS about your appointments and/or waitlist availability.",false)+
    '<p class="legal"><button type="button" class="textlink" data-note="Terms of Service" data-target="legalnote">Terms of Service</button><span aria-hidden="true"> · </span><button type="button" class="textlink" data-note="Privacy Policy" data-target="legalnote">Privacy Policy</button></p>'+
    '<p class="inline-note" id="legalnote" aria-live="polite"></p>'+
   '</div>'+
   '<h2 class="sectionlabel full">Before you pay</h2>'+
   '<div class="glance full" role="group" aria-labelledby="glance-h"><h3 id="glance-h">At a glance</h3><ul>'+
    '<li><b>'+DEPOSIT_LINE+'</b> '+VOUCHER_LINE+'</li>'+
    '<li>Cancel or reschedule up to 24 hours ahead. Cancelling within 24 hours loses the deposit; rescheduling within 24 hours costs $20.</li>'+
    '<li>Please arrive 10 minutes early. At 10 minutes late, the appointment is cancelled and the deposit is non-refundable.</li>'+
    '<li>Add-ons can’t be added on the day.</li>'+
    '<li>No refunds once a service is complete.</li></ul>'+
    '<p class="glance-foot">Full policies below. Tap a title to read it.</p></div>'+
   '<div class="policies full">'+
    policy("Deposit","$30, non-refundable",'<p>'+DEPOSIT_LINE+'</p><p>'+VOUCHER_LINE+'</p>',"dep")+
    policy("Discounts and weekends","One discount per visit",'<ul><li>10% off when you come with a friend</li><li>10% off when you book two services</li><li>15% off in your birthday month</li></ul><p>Only one discount per visit. Discounts can’t be combined with monthly specials or package deals.</p><p>A 10% surcharge applies on Saturdays and Sundays. Members are exempt.</p>')+
    policy("Choose the right service","Add-ons can’t be added on the day",'<p>If you need nail art, removal, extensions or any other add-on, please select it when you book.</p><p>Add-ons can’t be added on the day. For example, if you book a plain service without nail art, we can’t add nail art during your appointment.</p><p>Please go back and double-check your service and add-ons before you confirm.</p>',"chk")+
    policy("Cancelling or rescheduling","24 hours’ notice",'<p>You can cancel or reschedule up to <strong>24 hours</strong> before your appointment.</p><p>If you cancel within 24 hours, your deposit is non-refundable.</p><p>If you cancel with more notice, your deposit becomes credit for your next booking.</p><p>If you reschedule within 24 hours of your appointment, a $20 rescheduling fee applies.</p>',"cancel")+
    policy("Arriving late","Cancelled at 10 minutes late",'<p>Please arrive at least 10 minutes early, so there’s time to choose your colour and design.</p><p>If you don’t arrive on time, we may need to change to a shorter service that fits the time left, for example from a design manicure to a plain manicure.</p><p>If you’re 10 minutes late, your appointment is cancelled automatically and your deposit is strictly non-refundable.</p>',"late")+
    policy("Refunds and allergies","No refunds after service",'<p>Once a service is complete, no refunds are given under any circumstances. By going ahead with your service, you agree to this policy.</p><p>We’re not responsible for individual allergic or sensitivity reactions to products, including any related medical expenses.</p>',"refund")+
   '</div>'+
   '<div class="full"><button type="submit" class="cta">Continue to payment</button><p class="why" id="why"></p></div>'+
   '</form>';
}
const APPLE='<svg viewBox="0 0 170 200" aria-hidden="true"><path d="M150 67c-1 1-19 11-19 33 0 26 23 35 23 35s-4 13-12 25c-7 11-15 21-27 21s-15-7-29-7c-13 0-18 7-29 7s-19-10-27-22C19 144 11 124 11 104c0-31 20-48 40-48 11 0 20 7 27 7 6 0 17-8 29-8 5 0 21 0 33 12zM109 39c5-6 9-15 9-24 0-1 0-2-1-3-8 0-18 5-24 12-5 6-10 15-10 24v3h3c7 0 17-5 23-12z"/></svg>';
const GOOGLE='<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.5 0 20.1 0 24s1 7.5 2.7 10.7l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.8l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';
function canApplePay(){
  if(DEMO)return true; /* demo only: see the DEMO note at the top */
  try{return !!window.ApplePaySession?.canMakePayments?.();}catch(e){return false;}
}
function canGooglePay(){
  return DEMO; /* production: google.payments.api.PaymentsClient#isReadyToPay() */
}
function payView(){
  const i=svc(),t=tech(),apple=canApplePay(),gpay=canGooglePay(),wallet=apple||gpay;
  return '<button type="button" class="back" data-go="3">'+CHEV_L+'Back to details</button>'+
   '<h1 id="h1">Pay your deposit</h1>'+
   '<p class="recap">'+i.n+' · '+shortDate(st.date)+', '+st.time+' · with '+withName(t)+' <button type="button" class="textlink inline" data-go="2">Change<span class="sr-only"> date or time</span></button></p>'+
   '<div class="depositline"><span class="due">Due today</span><b class="num">$30.00 <small>AUD</small></b></div>'+
   '<p class="deposit-note">'+DEPOSIT_LINE+' <span class="nov">'+VOUCHER_LINE+'</span></p>'+
   '<div class="paybox">'+
    (apple?'<button type="button" class="applepay" data-pay="Apple Pay" aria-label="Pay $30 with Apple Pay">'+APPLE+'<span>Pay</span></button>':"")+
    (gpay?'<button type="button" class="gpay" data-pay="Google Pay" aria-label="Pay $30 with Google Pay">'+GOOGLE+'<span>Pay</span></button>':"")+
    '<details class="cardpay"'+(wallet?"":" open")+'><summary>Pay by card</summary>'+
     '<form class="cardform" id="cform" novalidate>'+
      '<div class="field full"><label for="cname">Name on card</label><input id="cname" name="cc-name" autocomplete="cc-name" autocapitalize="words" spellcheck="false" required><p class="err" id="cname-err" hidden></p></div>'+
      '<div class="field full"><label for="cnum">Card number</label><input id="cnum" name="cc-number" inputmode="numeric" autocomplete="cc-number" placeholder="1234 1234 1234 1234" required><p class="err" id="cnum-err" hidden></p></div>'+
      '<div class="field"><label for="cexp">Expiry</label><input id="cexp" name="cc-exp" inputmode="numeric" autocomplete="cc-exp" placeholder="MM / YY" required><p class="err" id="cexp-err" hidden></p></div>'+
      '<div class="field"><label for="ccvc">Security code</label><input id="ccvc" name="cc-csc" inputmode="numeric" autocomplete="cc-csc" placeholder="123" required><p class="err" id="ccvc-err" hidden></p></div>'+
      '<p class="hint full">We accept Visa, Mastercard, American Express and Discover.</p>'+
      '<button type="submit" class="cta full">Pay $30 by card</button>'+
     '</form></details>'+
    '<p class="secure">Demo only: no payment is taken. On the live site, payments are processed securely by the payment provider and the salon never sees your card number.</p>'+
   '</div>';
}
function doneView(){
  const i=svc(),t=tech();
  return '<div class="confirm"><div class="seal" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>'+
   '<p class="eyebrow">Deposit received'+(st.payMethod&&st.payMethod!=="card"?" via "+st.payMethod:"")+'</p>'+
   '<h1 id="h1">Your appointment is booked.</h1>'+
   '<p class="when">'+i.n+'<br><em>with '+withName(t)+'</em></p>'+
   '<p class="lede num">'+fmtDate(st.date)+' at '+st.time+'</p>'+
   '<p class="addr">Level 1, 179 Little Bourke St, Melbourne</p>'+
   '<p class="lede">Please arrive 10 minutes early to choose your colour and design.</p>'+
   '<p class="small">Need to change? You can cancel or reschedule up to 24 hours before your appointment.</p>'+
   '<div class="actions"><button type="button" class="btn" data-action="ics">Add to calendar</button>'+
   '<a class="btn ghost" href="'+directionsURL()+'"'+EXT+'>Get directions'+NEWTAB+'</a></div>'+
   '<button type="button" class="textlink" data-reset>Book another appointment</button></div>';
}
function view(){
  if(st.paid)return doneView();
  if(st.step===0)return st.cat?listView():homeView();
  return [null,techView,timeView,detailsView,payView][st.step]();
}

/* ---------- Render ---------- */
function hydrate(){
  /* User-entered values go back in through .value, never through markup. */
  if(st.step===3&&!st.paid){["fn","ln","ph","em"].forEach(k=>{const el=$("#"+k);if(el)el.value=st.f[k];});}
  if(st.step===4&&!st.paid){const n=$("#cname");if(n)n.value=(st.f.fn+" "+st.f.ln).trim();}
}
function render(focus,msg){
  const home=st.step===0&&!st.cat&&!st.paid;
  $(".maison").dataset.step=st.paid?"done":home?"0":st.step===0?"list":String(st.step);
  progress();
  $("#layout").className="layout"+(st.step>0&&!st.paid?" has-aside":"");
  summary();
  const main=$("#main");
  main.innerHTML=view();
  hydrate();bar();rvInit();
  if(focus){
    main.classList.remove("enter");void main.offsetWidth;main.classList.add("enter");
    const h=$("#h1");if(h){h.setAttribute("tabindex","-1");h.focus({preventScroll:true});}
    const top=(home||$("#progress").hidden)?0:$("#progress").getBoundingClientRect().top+window.pageYOffset-12;
    if(window.pageYOffset>top)window.scrollTo(0,Math.max(0,top));
  }
  if(msg)announce(msg);
}
function stepMsg(){
  if(st.paid)return "Booking confirmed. Your appointment is booked.";
  const h=$("#h1");
  return "Step "+(st.step+1)+" of 5: "+STEPS[st.step]+". "+(h?h.textContent:"");
}

/* ---------- Validation ---------- */
const EMAIL=/^[^\s@,]+@[^\s@,]+\.[^\s@,]{2,}$/;
function phoneOK(v,cc){const d=v.replace(/\D/g,"");return cc==="+61"?/^4\d{8}$/.test(d)||/^[2378]\d{8}$/.test(d):d.length>=6&&d.length<=12;}
const FIELDS=[
 ["fn",v=>v.trim()?"":"Please add your first name.","first name"],
 ["ln",v=>v.trim()?"":"Please add your last name.","last name"],
 ["ph",v=>phoneOK(v,st.f.cc)?"":"Please check your mobile number.","mobile number"],
 ["em",v=>EMAIL.test(v.trim())?"":"Please check your email address.","email address"]
];
function setErr(id,msg){
  const el=$("#"+id),e=$("#"+id+"-err");if(!el||!e)return;
  e.textContent=msg||"";e.hidden=!msg;
  if(msg){el.setAttribute("aria-invalid","true");el.setAttribute("aria-describedby",id+"-err");}
  else{el.removeAttribute("aria-invalid");el.removeAttribute("aria-describedby");}
}
function validateDetails(show){
  const bad=[],names=[];
  FIELDS.forEach(f=>{const msg=f[1](st.f[f[0]]);if(show)setErr(f[0],msg);if(msg){bad.push(f[0]);names.push(f[2]);}});
  let n=0;
  CONFIRMS.filter(c=>c.req).forEach(c=>{const miss=!st.ok[c.k];if(show)setErr(c.id,miss?c.err:"");if(miss){bad.push(c.id);n++;}});
  if(n)names.push(n+" confirmation"+(n>1?"s":""));
  const why=$("#why");if(why&&(show||st.tried))why.textContent=names.length?"Almost there. Still needed: "+names.join(", ")+".":"";
  return {bad:bad,names:names};
}
function submitDetails(){
  st.tried=true;
  const r=validateDetails(true);
  if(r.bad.length){
    const first=$("#"+r.bad[0]);
    if(first){first.focus({preventScroll:true});first.scrollIntoView({block:"center",behavior:reduced()?"auto":"smooth"});}
    announce("Almost there. Still needed: "+r.names.join(", ")+".");
    return;
  }
  st.step=4;render(true);announce(stepMsg());
}
function submitCard(){
  const v=id=>($("#"+id)||{}).value||"";
  const num=v("cnum").replace(/\D/g,""),exp=v("cexp").replace(/\D/g,""),mm=+exp.slice(0,2);
  const errs=[
    ["cname",v("cname").trim()?"":"Please add the name on the card."],
    ["cnum",num.length>=13&&num.length<=19?"":"Please check your card number."],
    ["cexp",exp.length===4&&mm>=1&&mm<=12?"":"Please check the expiry date."],
    ["ccvc",/^\d{3,4}$/.test(v("ccvc").trim())?"":"Please check the security code."]
  ];
  errs.forEach(e=>setErr(e[0],e[1]));
  const bad=errs.filter(e=>e[1]);
  if(bad.length){$("#"+bad[0][0]).focus();announce(bad.map(e=>e[1]).join(" "));return;}
  pay("card");
}
function pay(method){st.payMethod=method;st.paid=true;render(true);announce(stepMsg());}

/* ---------- Calendar file and directions ---------- */
function isIOS(){return /iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);}
function directionsURL(){
  const q=encodeURIComponent(ADDRESS);
  return isIOS()?"https://maps.apple.com/?daddr="+q:"https://www.google.com/maps/dir/?api=1&destination="+q;
}
/* RFC 5545 §3.3.11 TEXT: escape backslash, comma and semicolon; newlines become \n. */
function icsText(s){return String(s).replace(/\\/g,"\\\\").replace(/[,;]/g,m=>"\\"+m).replace(/\r\n|\r|\n/g,"\\n");}
/* RFC 5545 §3.1: lines longer than 75 octets are folded with CRLF + space, never inside a UTF-8 character. */
function icsFold(line){
  const enc=new TextEncoder();let out="",cur="",n=0,max=75;
  for(const ch of line){const b=enc.encode(ch).length;if(n+b>max){out+=cur+"\r\n ";cur="";n=0;max=74;}cur+=ch;n+=b;}
  return out+cur;
}
function downloadICS(){
  const i=svc(),t=tech(),hm=hour24(st.time),d=st.date;
  const adds=ADDONS.filter(a=>st.addons[a.id]),extra=adds.reduce((n,a)=>n+a.min,0); /* add-on time extends the appointment */
  const start=new Date(d.getFullYear(),d.getMonth(),d.getDate(),hm[0],hm[1]),end=new Date(+start+(i.m+extra)*60000);
  const p=n=>String(n).padStart(2,"0");
  const local=x=>x.getFullYear()+p(x.getMonth()+1)+p(x.getDate())+"T"+p(x.getHours())+p(x.getMinutes())+"00";
  const now=new Date(),stamp=now.getUTCFullYear()+p(now.getUTCMonth()+1)+p(now.getUTCDate())+"T"+p(now.getUTCHours())+p(now.getUTCMinutes())+p(now.getUTCSeconds())+"Z";
  const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Nails&Gel//Booking demo//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH",
    "BEGIN:VTIMEZONE","TZID:Australia/Melbourne",
    "BEGIN:STANDARD","DTSTART:19700405T030000","RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=1SU","TZOFFSETFROM:+1100","TZOFFSETTO:+1000","TZNAME:AEST","END:STANDARD",
    "BEGIN:DAYLIGHT","DTSTART:19701004T020000","RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=1SU","TZOFFSETFROM:+1000","TZOFFSETTO:+1100","TZNAME:AEDT","END:DAYLIGHT",
    "END:VTIMEZONE",
    "BEGIN:VEVENT","UID:"+(+start)+"-"+i.id+"@nailsandgel.demo","DTSTAMP:"+stamp,
    "DTSTART;TZID=Australia/Melbourne:"+local(start),"DTEND;TZID=Australia/Melbourne:"+local(end),
    "SUMMARY:"+icsText(i.n+" at Nails&Gel"),"LOCATION:"+icsText(ADDRESS),
    "DESCRIPTION:"+icsText("With "+withName(t)+"."+(adds.length?" Add-ons: "+adds.map(a=>a.n).join(", ")+".":"")+" Please arrive 10 minutes early to choose your colour and design."),
    "END:VEVENT","END:VCALENDAR"];
  const url=URL.createObjectURL(new Blob([lines.map(icsFold).join("\r\n")+"\r\n"],{type:"text/calendar;charset=utf-8"}));
  const a=document.createElement("a");a.href=url;a.download="nails-and-gel-appointment.ics";
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  announce("Calendar file downloaded.");
}

/* ---------- Events ---------- */
function openSheet(){
  const d=$("#sheet");if(!d||!svc())return;
  $("#sheet-body").innerHTML=summaryHTML(false);
  if(d.showModal)d.showModal();else d.setAttribute("open","");
}
function closeSheet(){const d=$("#sheet");if(d&&d.open){if(d.close)d.close();else d.removeAttribute("open");}}
function nudge(){const c=$(".bar-cta");if(!c)return;c.classList.remove("nudge");void c.offsetWidth;c.classList.add("nudge");}

document.addEventListener("click",e=>{
  const a=e.target.closest("a");
  if(a){
    if(a.hasAttribute("data-reset")){e.preventDefault();closeSheet();st=fresh();render(true,"New booking. Step 1 of 5: Treatment.");return;}
    const href=a.getAttribute("href")||"";
    if(href.charAt(0)==="#"&&href.length>1){e.preventDefault();const tg=document.getElementById(href.slice(1));if(tg){tg.setAttribute("tabindex","-1");tg.focus();}}
    return;
  }
  const dlg=$("#sheet");
  if(dlg&&e.target===dlg){closeSheet();return;} /* backdrop tap */
  const b=e.target.closest("button");if(!b||b.disabled)return;
  const d=b.dataset;
  if("skip" in d){$("#main").focus();return;}
  if(d.note){const el=document.getElementById(d.target||"footnote");if(el)el.textContent=d.note+" opens in Acuity on the live site.";return;}
  if(d.rv){const list=$("#rv-list"),c=$(".rv-card",list);list.scrollBy({left:(+d.rv)*(c?c.getBoundingClientRect().width+12:list.clientWidth),behavior:reduced()?"auto":"smooth"});setTimeout(rvSync,450);return;}
  if(d.action==="open-sheet"){openSheet();return;}
  if(d.action==="close-sheet"){closeSheet();return;}
  if(d.action==="ics"){downloadICS();return;}
  if(d.action==="submit-details"){const f=$("#dform");if(f){if(f.requestSubmit)f.requestSubmit();else submitDetails();}return;}
  if(d.action==="to-details"){
    if(!st.time){
      const msg=st.date?"Choose a time to continue.":"Choose a date and time to continue.";
      const tg=st.date?$(".slot"):$(".day:not([disabled])");
      if(tg){tg.focus({preventScroll:true});tg.scrollIntoView({block:"center",behavior:reduced()?"auto":"smooth"});}
      const why=$("#why");if(why)why.textContent=msg;
      announce(msg);return;
    }
    st.step=3;render(true);announce(stepMsg());return;
  }
  if(d.cat){st.cat=d.cat;render(true);announce(stepMsg());}
  else if("back" in d){st.cat=null;render(true);announce("All categories");}
  else if(d.svc){st.svc=d.svc;st.step=1;render(true);announce(stepMsg());}
  else if(d.tech){st.tech=d.tech;st.step=2;render(true);announce(stepMsg());}
  else if(d.month){const m=st.month;st.month=new Date(m.getFullYear(),m.getMonth()+(+d.month),1);render();const nb=$('[data-month="'+d.month+'"]');if(nb&&!nb.disabled)nb.focus();else{const ob=$("[data-month]:not([disabled])");if(ob)ob.focus();}
    announce(st.month.toLocaleDateString("en-AU",{month:"long",year:"numeric"}));} /* the heading is re-rendered, so a live region on it never speaks */
  else if(d.date){
    st.date=new Date(+d.date);st.time=null;render();
    const db=$('[data-date="'+d.date+'"]');if(db)db.focus({preventScroll:true});
    const tl=$("#timelabel");if(tl)tl.scrollIntoView({block:"nearest",behavior:reduced()?"auto":"smooth"});
    announce(fmtDate(st.date)+" selected. "+slotsFor(st.date).length+" times available.");
  }
  else if(d.time){st.time=d.time;render();const tb=$('[data-time="'+d.time+'"]');if(tb)tb.focus({preventScroll:true});nudge();announce(d.time+" selected. You can continue.");}
  else if(d.go){closeSheet();st.step=+d.go;render(true);announce(stepMsg());}
  else if(d.pay){pay(d.pay);}
  else if("reset" in d){closeSheet();st=fresh();render(true,"New booking. Step 1 of 5: Treatment.");}
});
document.addEventListener("submit",e=>{
  e.preventDefault(); /* nothing is ever submitted to a server in the demo */
  if(e.target.id==="dform")submitDetails();
  else if(e.target.id==="cform")submitCard();
});
document.addEventListener("change",e=>{
  const t=e.target;
  if(t.dataset.addon){st.addons[t.dataset.addon]=t.checked;summary();}
  else if(t.dataset.ok){st.ok[t.dataset.ok]=t.checked;if(st.tried||t.checked){const c=CONFIRMS.find(x=>x.k===t.dataset.ok);if(c.req)setErr(c.id,t.checked?"":c.err);validateDetails(false);}}
  else if(t.dataset.f){st.f[t.dataset.f]=t.checked;}
  else if(t.id==="cc"){st.f.cc=t.value;formatPhone($("#ph"));}
  else if(t.name&&t.name.indexOf("tier-")===0){
    const gid=t.name.slice(5),card=$("#card-"+gid),g=GROUPS[gid];
    st.tier[gid]=t.value;
    const tmp=document.createElement("div");tmp.innerHTML=svcCard(g,+card.dataset.lvl,9);
    card.replaceWith(tmp.firstElementChild);
    const r=$('input[name="tier-'+gid+'"][value="'+t.value+'"]');if(r)r.focus();
    const i=tierOf(g);announce(i.tn+", "+dur(i.m)+", $"+i.c+", $"+i.h+" cash.");
  }
});
function formatPhone(el){
  if(!el)return;
  if(st.f.cc!=="+61"){st.f.ph=el.value;return;}
  const atEnd=el.selectionStart===el.value.length;
  let d=el.value.replace(/\D/g,"");
  if(d.length>9&&d.indexOf("61")===0)d=d.slice(2); /* pasted or autofilled "+61 4xx…": drop the country code (AU numbers never start with 6) */
  if(d.charAt(0)==="0")d=d.slice(1); /* +61 is chosen, so drop the trunk 0 */
  d=d.slice(0,9);
  const out=[d.slice(0,3),d.slice(3,6),d.slice(6,9)].filter(Boolean).join(" ");
  if(atEnd&&out!==el.value)el.value=out;
  st.f.ph=el.value;
}
document.addEventListener("input",e=>{
  const t=e.target;
  if(t.id==="ph")formatPhone(t);
  else if(["fn","ln","em"].indexOf(t.id)>=0)st.f[t.id]=t.value;
  else if(t.id==="cnum"){const d=t.value.replace(/\D/g,"").slice(0,19);if(t.selectionStart===t.value.length)t.value=d.replace(/(\d{4})(?=\d)/g,"$1 ");return;}
  else if(t.id==="cexp"){const d=t.value.replace(/\D/g,"").slice(0,4);if(t.selectionStart===t.value.length&&e.inputType!=="deleteContentBackward")t.value=d.length>2?d.slice(0,2)+" / "+d.slice(2):d;return;}
  else return;
  if(st.tried){const f=FIELDS.find(x=>x[0]===t.id);setErr(t.id,f[1](st.f[t.id]));validateDetails(false);}
});
document.addEventListener("focusout",e=>{
  const t=e.target,f=FIELDS.find(x=>x[0]===t.id);
  if(f&&(st.tried||t.value.trim()))setErr(t.id,f[1](st.f[t.id]));
  setTimeout(kbSync,0);
});
document.addEventListener("focusin",kbSync);
/* Slide the sticky bar away only while an on-screen keyboard is really up (the visual viewport shrinks).
   A focused field alone isn't enough: with a hardware keyboard, or after focus moves to the first error,
   hiding the bar would leave no Continue button. Pinch-zoom is excluded by multiplying by the scale. */
const TYPING='input:not([type="checkbox"]):not([type="radio"]),select,textarea';
function kbSync(){
  const vv=window.visualViewport,a=document.activeElement;
  const up=!!(vv&&a&&a.matches&&a.matches(TYPING)&&window.innerHeight-vv.height*vv.scale>120);
  document.body.classList.toggle("kb-open",up);
}
if(window.visualViewport)visualViewport.addEventListener("resize",kbSync);
addEventListener("resize",rvSync);

render();
})();
