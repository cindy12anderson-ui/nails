/* Nails&Gel booking demo. Availability and payment are simulated.
   Real build: services, technicians, availability and booking come from Acuity;
   the deposit goes through the payment provider (Apple Pay / Google Pay / card). */
(function(){
"use strict";
var IMG="assets/img/";

/* ---------- Data (all salon content; wording tightened, facts kept) ---------- */
var CATS=[
 {id:"mani",k:"No. 01",t:"Manicure",s:"Gel, BIAB, hard gel & nail art",img:"shellac-manicure.jpg",alt:"Soft pink gel manicure with a pink ring",note:"",items:[
  {id:"express",n:"Express manicure",m:30,c:79,h:69,img:"express-manicure.jpg",alt:"Short natural nails after an express manicure",d:"E-file nail shaping and cuticle care, finished with nail serum.",chips:[["No gel","no"]]},
  {id:"deluxe",n:"Deluxe manicure",m:30,c:89,h:79,img:"deluxe-manicure.jpg",alt:"Hands resting over a bowl of petals and lemon slices",d:"E-file nail and cuticle care with hand spa, scrub, massage and paraffin. Finished with nail serum.",chips:[["No gel","no"]]},
  {id:"shellac",n:"Shellac manicure",m:35,c:89,h:79,img:"shellac-manicure.jpg",alt:"Pale pink gel polish nails with a pink ring",d:"A lightweight gel polish for a clean, natural-looking finish. Includes E-file manicure, single-colour gel and removal of our gel.",chips:[["No builder gel","no"],["No nail art or extensions","no"]]},
  {id:"biab",n:"BIAB manicure",m:45,c:109,h:99,img:"biab-manicure.jpg",alt:"Four BIAB looks: pink, pearl chrome, silver glitter tips and taupe cat eye",d:"Lightweight builder gel that strengthens and protects your natural nails. Includes E-file manicure, single-colour gel and removal of our gel.",chips:[["Lasts 4 weeks","good"],["2-week warranty","good"],["Cat eye / chrome available",""],["No nail art or extensions","no"]]},
  {id:"biab119",n:"BIAB $119 Special",m:55,c:129,h:119,tile:["$119","BIAB special"],d:"Lightweight builder gel that strengthens and protects your natural nails. Includes E-file manicure and removal of our gel.",chips:[["Lasts 4 weeks","good"],["2-week warranty","good"],["No extensions","no"]]},
  {id:"hard",n:"Hard gel manicure",m:55,c:129,h:119,tile:["Hard gel","Our signature"],sig:true,d:"Our signature hard builder gel strengthens and supports your natural nails with a durable finish. Includes E-file manicure, single-colour gel and removal of our gel.",chips:[["Lasts 6–8 weeks","good"],["2-week warranty","good"],["Cat eye / chrome available",""],["Extensions can be added",""]]},
  {id:"monthly",n:"Hard gel · Monthly design",m:85,range:"$159–$199",cashOff:10,tile:["Monthly","This month’s designs"],d:"A selection of designs at a special price for the current month only; after the month ends they return to regular prices. See our Instagram for this month’s designs. For a design from a previous month, book Custom design. Includes hard gel manicure, E-file care and removal of our gel.",chips:[["Lasts 6–8 weeks","good"],["2-week warranty","good"],["Extensions can be added",""]]},
  {id:"simple",n:"Hard gel · Simple design",m:70,range:"$160–$180",cashOff:10,tile:["Simple","French · ombré · dots"],d:"Simple designs such as French tips, ombré or dot art, or nail art on just one or two fingers. Includes E-file manicure and removal of our gel.",chips:[["Lasts 6–8 weeks","good"],["2-week warranty","good"],["Extensions can be added",""]]},
  {id:"custom",n:"Hard gel · Custom design",m:85,range:"$200–$300",cashOff:10,tile:["Custom","Any nail art"],d:"Any nail art design, including designs from previous months. Bring an inspiration photo or choose one of our past designs. Includes E-file manicure and removal of our gel.",chips:[["Lasts 6–8 weeks","good"],["2-week warranty","good"],["Extensions can be added",""]]},
  {id:"biting",n:"Nail Biting Correction Program",m:60,priceHTML:'<span class="blk">1st session $170 <small>· $160 cash</small></span><span class="blk">Sessions 2–4 $110 <small>· $100 cash</small></span>',priceShort:"$170 · $160 cash (1st session)",tile:["4 sets","Correction program"],d:"Four full sets of nail extensions with a plain-colour manicure, one every 2 weeks (advance booking required). Unlimited free nail repairs during the program. Removal included from the 2nd session.",chips:[["No further discounts","no"]]},
  {id:"removal",n:"Removal only, no new set",m:10,priceHTML:'<span class="blk">Gel $40 <small>· $30 cash</small></span><span class="blk">SNS / acrylic $50 <small>· $40 cash</small></span>',priceShort:"Gel $40 · $30 cash; SNS/acrylic $50 · $40 cash",tile:["Removal","10 minutes"],d:"Gel, SNS or acrylic removal without a new set.",chips:[]}
 ]},
 {id:"pedi",k:"No. 02",t:"Pedicure",s:"From express polish to full spa",img:"mani-pedi-nude.jpg",imgPos:"bottom",alt:"Nude almond nails and matching pedicure on soft linen",note:"Deluxe pedicures build on Basic Care: soak, heel exfoliation, scrub, cream, cuticle and nail care, and gel polish.",items:[
  {id:"p11",n:"1+1 Deluxe Pedicure · Premium Care + foot paraffin",m:90,priceHTML:"$184 for two <small>· cash price</small>",priceShort:"$184 for two (cash)",tile:["1 + 1","For two"],d:"Full Basic Care plus deep steam massage, hot stones and hot towels, and foot paraffin. Covers two people, so you only need to book once.",chips:[["Valid until 15 Oct",""],["For two","good"]]},
  {id:"pexp",n:"Express pedicure",m:30,c:99,h:89,tile:["Express","Polish"],d:"Nail and cuticle care, gel polish.",chips:[["No spa","no"]]},
  {id:"pbasic",n:"Deluxe pedicure · Basic Care",m:45,c:109,h:99,tile:["Basic","Deluxe care"],lvl:1,d:"Soak, heel exfoliation, scrub, cream, cuticle and nail care, gel polish.",chips:[["No massage","no"]]},
  {id:"prelax",n:"Deluxe pedicure · Relax Care",m:60,c:129,h:119,tile:["Relax","Deluxe care"],lvl:2,d:"Full Basic Care plus a quick relaxing massage.",chips:[]},
  {id:"pdeep",n:"Deluxe pedicure · Deep Care",m:75,c:149,h:139,tile:["Deep","Deluxe care"],lvl:3,d:"Full Basic Care plus a deep steam massage.",chips:[]},
  {id:"pprem",n:"Deluxe pedicure · Premium Care",m:90,c:169,h:159,tile:["Premium","Deluxe care"],lvl:4,d:"Full Basic Care plus deep steam massage, hot stones and hot towels.",chips:[]}
 ]},
 {id:"pkg",k:"No. 03",t:"Mani + Pedi",s:"Packages & a kids’ spa",img:"mani-pedi-red.jpg",alt:"Deep red gel on fingers and toes",note:"Packages: both manicure and pedicure are done by the same technician, one after the other. Single-colour gel only. For nail art or a spa pedicure, book those separately from the individual menu, as they aren’t included.",items:[
  {id:"kshellac",n:"Shellac Mani + Pedi",m:65,c:169,h:159,img:"mani-pedi-red.jpg",alt:"Deep red gel on fingers and toes",d:"Shellac manicure and pedicure, single colour.",chips:[]},
  {id:"kbiab",n:"BIAB Mani + Pedi",m:15,c:179,h:169,img:"mani-pedi-red.jpg",alt:"Deep red gel on fingers and toes",d:"BIAB manicure and pedicure, single colour.",chips:[],flag:"Duration to confirm"},
  {id:"khard",n:"Hard Gel Mani + Pedi",m:85,c:189,h:179,img:"mani-pedi-nude.jpg",alt:"Nude almond hard gel nails with matching toes",d:"Hard gel manicure and pedicure, single colour.",chips:[]},
  {id:"kids",n:"Kids Spa + Mani",m:60,priceHTML:"$149 <small>· $139 cash · was $198</small>",priceShort:"$149 · $139 cash",img:"kids-spa.jpg",alt:"A child in a fluffy robe and hair rollers with red nails and toes",d:"Safe soft gel for kids (peelable option available) with a fun bath bomb spa experience included.",chips:[["Save $59","good"],["No further discounts","no"]]}
 ]}
];
var TECHS=[
 {id:"any",n:"Any available",mono:"✦",r:"First free technician",d:"The first available technician at your chosen time."},
 {id:"judy",n:"Judy",mono:"J",r:"Senior Technician · 3+ years",d:"Wedding, feminine and cute designs. Great at colour matching and recommending shades that suit you."},
 {id:"rachel",n:"Rachel",mono:"R",r:"Senior Technician · 3+ years",d:"Y2K, chrome and unique statement nails. Loves bold, creative designs. Also qualified in foot massage."},
 {id:"annie",n:"Annie",mono:"A",r:"Master Technician · 9 years",d:"Custom nail designs, creating personalised sets to match your style and inspiration."}
];
var ADDONS=[
 {id:"first",n:"This is my first visit",x:""},
 {id:"rmOther",n:"Removal: other salon’s gel",x:"+$2 per nail · +5 min"},
 {id:"rmOurs",n:"Removal: our salon’s gel",x:"Free · +5 min"},
 {id:"rmExt",n:"Removal: other salon’s extensions, acrylic or SNS",x:"+$3 per nail · +15 min"},
 {id:"handspa",n:"Hand spa + paraffin treatment",x:"+$25"}
];
var STEPS=["Treatment","Technician","Date & time","Details","Payment"];
var TODAY=new Date(2026,8,28); /* demo "today": Monday 28 Sep 2026, Melbourne */
var DEPOSIT=30;
var BASE_SLOTS=["9:30 AM","10:15 AM","11:00 AM","11:45 AM","12:30 PM","1:15 PM","2:30 PM","3:30 PM","3:35 PM","3:50 PM","3:55 PM","4:00 PM","4:05 PM","4:10 PM","4:15 PM","4:20 PM","4:25 PM","4:30 PM","4:55 PM","5:00 PM","5:05 PM","5:10 PM","5:15 PM","6:00 PM"];

function fresh(){return {step:0,cat:null,svc:null,tech:null,addons:{},month:new Date(2026,8,1),date:null,time:null,
  f:{fn:"",ln:"",cc:"+61",ph:"",em:"",sms:false},ok:{dep:false,chk:false,pol:false},paid:false,payMethod:""};}
var st=fresh();

var ALL=[];CATS.forEach(function(c){c.items.forEach(function(i){i.cat=c.id;ALL.push(i);});});
function $(s,r){return (r||document).querySelector(s);}
function esc(s){return String(s).replace(/[&<>"]/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch];});}
function dur(m){return m<60?m+" min":Math.floor(m/60)+" h"+(m%60?" "+(m%60)+" min":"");}
function priceHTML(i){return i.priceHTML?i.priceHTML:i.range?i.range+' <small>· $'+i.cashOff+' off cash</small>':'$'+i.c+' <small>· $'+i.h+' cash</small>';}
function priceShort(i){return i.priceShort?i.priceShort:i.range?i.range+" · $"+i.cashOff+" off cash":"$"+i.c+" · $"+i.h+" cash";}
function fmtDate(d){return d.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long"});}
function isOpen(d){return d.getDay()!==1&&d>TODAY;}
function isWeekend(d){return d.getDay()===0||d.getDay()===6;}
function svc(){return ALL.filter(function(x){return x.id===st.svc;})[0];}
function tech(){return TECHS.filter(function(x){return x.id===st.tech;})[0];}
function announce(t){var l=$("#live");if(!l)return;l.textContent="";setTimeout(function(){l.textContent=t;},40);}

/* ---------- Pieces ---------- */
function progress(){
  var cur=st.paid?5:st.step;
  $("#progress").innerHTML='<ol>'+STEPS.map(function(s,i){
    return '<li'+(i===cur?' aria-current="step"':'')+(i<cur?' class="done"':'')+'>'+s+(i<cur?'<span class="sr-only"> (done)</span>':'')+'</li>';
  }).join("")+'</ol><div class="pbar" aria-hidden="true"><span class="lbl">'+(st.paid?'<b>Booked</b>':'Step '+(cur+1)+' of 5 · <b>'+STEPS[cur]+'</b>')+'</span><span class="track">'+
  STEPS.map(function(_,i){return '<i class="'+(i<=cur?"on":"")+'"></i>';}).join("")+'</span></div>';
}
function media(i,cls){
  if(i.img)return '<div class="media'+(cls?" "+cls:"")+'"><img src="'+IMG+i.img+'" alt="'+esc(i.alt||"")+'" loading="lazy" width="300" height="300"></div>';
  var t=i.tile||[i.n,""],dots="";
  if(i.lvl){dots='<span class="dots" aria-hidden="true">';for(var k=1;k<=4;k++)dots+='<i class="'+(k<=i.lvl?"f":"")+'"></i>';dots+='</span>';}
  return '<div class="media" aria-hidden="true"><div class="tile'+(i.sig?" sig":"")+'"><b>'+t[0]+'</b><small>'+t[1]+'</small>'+dots+'</div></div>';
}
function svcCard(i){
  var chips=i.chips.length?'<ul class="chips" aria-label="Details">'+i.chips.map(function(c){return '<li class="chip '+c[1]+'">'+c[0]+(c[1]==="no"?'<span class="sr-only"> (not included)</span>':"")+'</li>';}).join("")+'</ul>':"";
  return '<article class="svc" aria-labelledby="h-'+i.id+'">'+media(i)+
   '<div class="body"><h3 id="h-'+i.id+'">'+i.n+'</h3>'+
   '<div class="meta num"><span>'+dur(i.m)+'</span>'+(i.flag?'<span class="flag">'+i.flag+'</span>':'')+'</div>'+
   '<div class="price num">'+priceHTML(i)+'</div></div>'+
   '<div class="more"><p class="desc">'+i.d+'</p>'+chips+
   (i.flag?'<p class="hint">Acuity lists this package as 15 minutes; we’re confirming the correct time with the salon.</p>':'')+
   '<div class="svc-foot"><button class="btn" data-svc="'+i.id+'">Select<span class="sr-only"> '+esc(i.n)+'</span></button></div></div></article>';
}
function summary(){
  var i=svc(),el=$("#summary");
  if(!i){el.innerHTML="";return;}
  var t=tech(),adds=ADDONS.filter(function(a){return st.addons[a.id];}).map(function(a){return a.n;});
  var rows='';
  rows+='<div class="srow"><span>Treatment</span><span>'+i.n+'</span></div>';
  rows+='<div class="srow"><span>Price</span><span class="num">'+priceShort(i)+'</span></div>';
  rows+='<div class="srow"><span>Duration</span><span class="num">'+dur(i.m)+(i.flag?' <span class="flag">to confirm</span>':'')+'</span></div>';
  if(t)rows+='<div class="srow"><span>With</span><span>'+t.n+'</span></div>';
  if(adds.length)rows+='<div class="srow"><span>Add-ons</span><span>'+adds.join("<br>")+'</span></div>';
  if(st.date)rows+='<div class="srow"><span>When</span><span>'+fmtDate(st.date)+(st.time?'<br>'+st.time:'')+'</span></div>';
  if(st.date&&isWeekend(st.date))rows+='<div class="srow"><span>Weekend</span><span>+10% on the day (members exempt)</span></div>';
  el.innerHTML='<h2>Your booking</h2>'+(i.img?'<div class="sm-img"><img src="'+IMG+i.img+'" alt="" width="300" height="170"></div>':'')+rows+
   '<div class="srow total"><span>Deposit today</span><span class="num">$'+DEPOSIT+' AUD</span></div>'+
   '<p class="small">Non-refundable, and taken off your total on the day. 2% card surcharge applies.</p>';
}
function calendar(){
  var m=st.month,y=m.getFullYear(),mo=m.getMonth();
  var first=new Date(y,mo,1).getDay(),days=new Date(y,mo+1,0).getDate();
  var canPrev=!(y===TODAY.getFullYear()&&mo===TODAY.getMonth());
  var cells=["S","M","T","W","T","F","S"].map(function(d){return '<div class="dow" aria-hidden="true">'+d+'</div>';}).join("");
  for(var i=0;i<first;i++)cells+='<div></div>';
  for(var d=1;d<=days;d++){
    var dt=new Date(y,mo,d),open=isOpen(dt),sel=st.date&&+st.date===+dt,we=isWeekend(dt)&&open;
    var why=open?"":(dt.getDay()===1?", closed Mondays":", unavailable");
    cells+='<button type="button" class="day" data-date="'+(+dt)+'" '+(open?"":"disabled")+' aria-pressed="'+(!!sel)+'" aria-label="'+fmtDate(dt)+why+(we?", 10% weekend surcharge":"")+'">'+d+(we?'<span class="we"></span>':'')+'</button>';
  }
  return '<div class="cal"><div class="calhead"><button type="button" data-month="-1" '+(canPrev?"":"disabled")+' aria-label="Previous month">‹</button><b aria-live="polite">'+m.toLocaleDateString("en-AU",{month:"long",year:"numeric"})+'</b><button type="button" data-month="1" aria-label="Next month">›</button></div>'+
  '<div class="grid7">'+cells+'</div>'+
  '<div class="legend"><span><i></i>10% surcharge Sat/Sun (members exempt)</span><span>Closed Mondays · Melbourne time</span></div></div>';
}
function slotsFor(d){
  var seed=d.getDate()*7+d.getMonth()*3;
  return BASE_SLOTS.filter(function(_,k){return ((k*5+seed)%9)>2;});
}
function slots(){
  var list=slotsFor(st.date);
  return '<div class="slots" role="group" aria-label="Available times, '+fmtDate(st.date)+'">'+list.map(function(t){return '<button type="button" class="slot" data-time="'+t+'" aria-pressed="'+(st.time===t)+'">'+t+'</button>';}).join("")+'</div>'+
   '<p class="hint">Example times, Melbourne time. The live site shows real availability from Acuity.</p>';
}
function policy(id,title,sub,body,open){
  return '<details'+(open?" open":"")+'><summary><span class="st">'+title+'</span><small>'+sub+'</small></summary><div class="pbody">'+body+'</div></details>';
}
function missing(){
  var f=st.f,ok=st.ok,m=[];
  if(!f.fn)m.push("first name");if(!f.ln)m.push("last name");
  if(f.ph.replace(/\D/g,"").length<8)m.push("mobile number");
  if(!/^[^@\s,]+@[^@\s,]+\.[^@\s,]+/.test(f.em))m.push("a valid email");
  if(!f.sms)m.push("terms and SMS consent");
  var n=(ok.dep?0:1)+(ok.chk?0:1)+(ok.pol?0:1);
  if(n)m.push(n+" confirmation"+(n>1?"s":""));
  return m;
}
function whyText(m){return m.length?"To continue, please add: "+m.join(", ")+".":"";}

/* ---------- Views ---------- */
function homeView(){
  return '<section class="hero" aria-label="Our work">'+
   '<div class="arches">'+
    '<figure class="arch side"><img src="'+IMG+'deluxe-manicure.jpg" alt="Hands over a bowl of rose petals and lemon slices, from our deluxe manicure" width="300" height="400"></figure>'+
    '<figure class="arch mid"><img src="'+IMG+'biab-chrome.jpg" alt="Pearl chrome BIAB nails" width="360" height="520"></figure>'+
    '<figure class="arch side"><img src="'+IMG+'biab-cateye.jpg" alt="Taupe cat eye BIAB nails" width="300" height="400"></figure>'+
   '</div><p class="hero-cap">Korean hard-gel artistry, a quiet hour in the heart of Melbourne.</p></section>'+
   '<div class="home-intro center"><p class="eyebrow">Reservations</p><h1 id="h1">Book an appointment</h1>'+
   '<p class="lede">Choose a category to see treatments, prices and what’s included.</p></div>'+
   '<div class="cats">'+CATS.map(function(c){
     return '<button type="button" class="cat" data-cat="'+c.id+'"><span class="img"><img src="'+IMG+c.img+'" alt="" width="300" height="400"'+(c.imgPos?' style="object-position:50% 85%"':'')+'></span><span class="k">'+c.k+'</span><span class="t">'+c.t+'</span><span class="s">'+c.s+'</span><span class="go" aria-hidden="true">View treatments</span></button>';
   }).join("")+'</div>'+
   '<div class="showall"><button type="button" class="textlink" data-cat="all">Show all treatments</button></div>'+
   '<aside class="note" aria-labelledby="multi"><h2 id="multi">Booking for more than one?</h2>'+
    '<p>Each booking covers one person and one service. To book for two people, or more than one service, complete the first booking and then make another.</p>'+
    '<p class="ex">For example, BIAB with Sue at 9:00 am and a separate booking for BIAB with Ashley at 9:00 am. For the same technician, book back-to-back times, such as Sue at 9:00 am and 10:00 am, subject to availability.</p>'+
    '<p>Select any add-ons you need, like extensions or removal, in each booking.</p></aside>'+
   '<div class="gifts"><p class="eyebrow" style="margin:0">Gifts &amp; vouchers</p><div class="row">'+
    '<button type="button" class="textlink" data-note="E-gift vouchers">E-gift vouchers</button>'+
    '<button type="button" class="textlink" data-note="Code balance check">Check code balance</button></div>'+
    '<p class="inline-note" id="giftnote" aria-live="polite"></p></div>';
}
function listView(){
  var back='<button type="button" class="back" data-back>‹ All categories</button>';
  var foot='<div class="gifts"><button type="button" class="textlink" data-note="Code balance check" data-target="listnote">Check code balance</button><p class="inline-note" id="listnote" aria-live="polite"></p></div>';
  if(st.cat==="all"){
    return back+'<div class="cat-head"><p class="eyebrow">The full menu</p><h1 id="h1">All treatments</h1></div>'+
     CATS.map(function(c){return '<section class="allgroup" aria-labelledby="g-'+c.id+'"><p class="eyebrow center" style="margin-top:26px">'+c.k+'</p><h2 id="g-'+c.id+'">'+c.t+'</h2>'+(c.note?'<p class="groupnote">'+c.note+'</p>':'')+'<div class="svcs">'+c.items.map(svcCard).join("")+'</div></section>';}).join("")+foot;
  }
  var c=CATS.filter(function(x){return x.id===st.cat;})[0];
  return back+'<div class="cat-head"><p class="eyebrow">'+c.k+'</p><h1 id="h1">'+c.t+'</h1></div>'+
   (c.note?'<p class="groupnote">'+c.note+'</p>':'')+'<div class="svcs">'+c.items.map(svcCard).join("")+'</div>'+foot;
}
function techView(){
  return '<button type="button" class="back" data-go="0">‹ Change treatment</button>'+
   '<p class="eyebrow">Step II</p><h1 id="h1">Choose your technician</h1>'+
   '<p class="loc">Level 1, 179 Little Bourke St, Melbourne</p>'+
   '<div class="techs">'+TECHS.map(function(t){
     return '<button type="button" class="tech" data-tech="'+t.id+'" aria-pressed="'+(st.tech===t.id)+'"><span class="mono" aria-hidden="true">'+t.mono+'</span><span class="n">'+t.n+'</span><span class="r">'+t.r+'</span><span class="d">'+t.d+'</span></button>';
   }).join("")+'</div>';
}
function timeView(){
  return '<button type="button" class="back" data-go="1">‹ Change technician</button>'+
   '<p class="eyebrow">Step III</p><h1 id="h1">Add-ons, date &amp; time</h1>'+
   '<h2 class="sectionlabel">Add to your appointment</h2>'+
   '<p class="hint" style="margin:-4px 0 10px">Add-ons can’t be added on the day, so please choose them now.</p>'+
   '<div class="checks">'+ADDONS.map(function(a){
     return '<label class="check" for="a-'+a.id+'"><input type="checkbox" id="a-'+a.id+'" data-addon="'+a.id+'"'+(st.addons[a.id]?" checked":"")+'><span>'+a.n+(a.x?'<span class="x">'+a.x+'</span>':'')+'</span></label>';
   }).join("")+'</div>'+
   '<div class="two"><div><h2 class="sectionlabel">Date</h2>'+calendar()+'</div>'+
   '<div><h2 class="sectionlabel" id="timelabel">Time'+(st.date?' · '+st.date.toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"}):'')+'</h2>'+
   (st.date?slots():'<p class="placeholder">Choose a date to see times</p>')+'</div></div>'+
   '<button type="button" class="cta" data-go="3"'+(st.time?"":" disabled")+'>Continue</button>'+
   (st.time?'':'<p class="why">'+(st.date?"Choose a time to continue.":"Choose a date and time to continue.")+'</p>');
}
function detailsView(){
  var f=st.f,ok=st.ok,m=missing();
  function sel(v){return f.cc===v?" selected":"";}
  return '<button type="button" class="back" data-go="2">‹ Change date or time</button>'+
   '<p class="eyebrow">Step IV</p><h1 id="h1">Your details</h1>'+
   '<div class="form">'+
    '<label class="field" for="fn"><span>First name <span class="req" aria-hidden="true">*</span></span><input id="fn" autocomplete="given-name" required value="'+esc(f.fn)+'"></label>'+
    '<label class="field" for="ln"><span>Last name <span class="req" aria-hidden="true">*</span></span><input id="ln" autocomplete="family-name" required value="'+esc(f.ln)+'"></label>'+
    '<p class="korean full" lang="ko">한국분들은 한글로 예약해 주세요. 예) 김태희 또는 제시카 김<span lang="en">Korean clients: please enter your name in Korean.</span></p>'+
    '<div class="field"><label for="ph">Mobile <span class="req" aria-hidden="true">*</span></label><div class="phone"><label for="cc" class="sr-only">Country code</label><select id="cc" autocomplete="tel-country-code"><option value="+61"'+sel("+61")+'>AU +61</option><option value="+64"'+sel("+64")+'>NZ +64</option><option value="+82"'+sel("+82")+'>KR +82</option><option value="+1"'+sel("+1")+'>US +1</option><option value="+44"'+sel("+44")+'>UK +44</option></select><input id="ph" type="tel" inputmode="tel" autocomplete="tel-national" required value="'+esc(f.ph)+'" placeholder="4xx xxx xxx"></div></div>'+
    '<label class="field" for="em"><span>Email <span class="req" aria-hidden="true">*</span></span><input id="em" type="email" autocomplete="email" required value="'+esc(f.em)+'" aria-describedby="emhint"><span class="hint" id="emhint">To add more addresses, separate them with a comma.</span></label>'+
    '<div class="full"><label class="check" for="sms"><input type="checkbox" id="sms"'+(f.sms?" checked":"")+'><span>I accept the Terms of Service, have read and understood the Privacy Policy, and agree to receive SMS about my appointments and waitlist availability. <span class="req" aria-hidden="true">*</span></span></label>'+
    '<div class="legal-links"><button type="button" class="textlink" data-note="Terms of Service" data-target="legalnote">Terms of Service</button><button type="button" class="textlink" data-note="Privacy Policy" data-target="legalnote">Privacy Policy</button></div><p class="inline-note" id="legalnote" aria-live="polite" style="text-align:start;margin-left:50px"></p></div>'+
   '</div>'+
   '<h2 class="sectionlabel">Before you pay</h2>'+
   '<div class="policies">'+
    policy("dep","Deposit","$30 non-refundable · no vouchers",'<p>A $30 non-refundable deposit is required to secure your booking. It’s taken off your total on the day. A 2% card surcharge applies.</p><p>Please don’t use a gift voucher for the deposit.</p>')+
    policy("menu","Book the right service","Add-ons can’t be added on the day",'<p>If you need nail art, removal, extensions or any other add-on, select it when booking. It can’t be added on the day: for example, a plain service booked without nail art can’t have nail art added at your appointment.</p><p>Please go back and double-check your service and add-ons before you confirm.</p>',true)+
    policy("cancel","Cancellation & rescheduling","24 hours’ notice",'<p>You can cancel or reschedule up to <strong>24 hours</strong> before your appointment.</p><ol><li>Cancel within 24 hours and the deposit is non-refundable.</li><li>Cancel with more notice and your deposit becomes credit for your next booking.</li><li>Rescheduling within 24 hours of your appointment costs $20.</li></ol>')+
    policy("late","Late arrivals","Cancelled at 10 minutes late",'<ol><li>We strongly advise arriving at least 10 minutes early to choose your colour and design.</li><li>If you don’t arrive on time, we may need to change to a shorter service that fits the remaining time (for example, design manicure to plain manicure).</li><li>At 10 minutes late, your appointment is cancelled automatically and the deposit is strictly non-refundable.</li></ol>')+
    policy("refund","Refunds & allergies","No refunds after service",'<p>Once a service is complete, no refunds are given under any circumstances. By going ahead with your service, you agree to this policy.</p><p>We’re not responsible for individual allergic or sensitivity reactions to products, including any related medical expenses.</p>')+
    policy("disc","Discounts & weekend surcharge","One discount per visit",'<ul><li>10% off: come with a friend</li><li>10% off: book two services</li><li>15% off: your birthday month</li></ul><p>Only one discount per visit. Discounts can’t be combined with monthly specials or package deals. A 10% surcharge applies on Saturday and Sunday (members exempt).</p>')+
   '</div>'+
   '<h2 class="sectionlabel">Please confirm</h2>'+
   '<div class="checks">'+
    '<label class="check" for="okdep"><input type="checkbox" id="okdep" data-ok="dep"'+(ok.dep?" checked":"")+'><span>I understand my $30 deposit is non-refundable. <span class="req" aria-hidden="true">*</span></span></label>'+
    '<label class="check" for="okchk"><input type="checkbox" id="okchk" data-ok="chk"'+(ok.chk?" checked":"")+'><span>I’ve double-checked my service and add-ons. <span class="req" aria-hidden="true">*</span></span></label>'+
    '<label class="check" for="okpol"><input type="checkbox" id="okpol" data-ok="pol"'+(ok.pol?" checked":"")+'><span>I agree to the cancellation, late arrival and refund policies. <span class="req" aria-hidden="true">*</span></span></label>'+
   '</div>'+
   '<button type="button" class="cta" data-go="4"'+(m.length?" disabled":"")+' aria-describedby="why">Continue to payment</button>'+
   '<p class="why" id="why">'+whyText(m)+'</p>';
}
var APPLE='<svg viewBox="0 0 170 200" aria-hidden="true"><path d="M150 67c-1 1-19 11-19 33 0 26 23 35 23 35s-4 13-12 25c-7 11-15 21-27 21s-15-7-29-7c-13 0-18 7-29 7s-19-10-27-22C19 144 11 124 11 104c0-31 20-48 40-48 11 0 20 7 27 7 6 0 17-8 29-8 5 0 21 0 33 12zM109 39c5-6 9-15 9-24 0-1 0-2-1-3-8 0-18 5-24 12-5 6-10 15-10 24v3h3c7 0 17-5 23-12z"/></svg>';
var GOOGLE='<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.5 0 20.1 0 24s1 7.5 2.7 10.7l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.8l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';
function payView(){
  return '<button type="button" class="back" data-go="3">‹ Back to details</button>'+
   '<p class="eyebrow">Step V</p><h1 id="h1">Pay your deposit</h1>'+
   '<p class="lede">Secures '+fmtDate(st.date)+' at '+st.time+'. The rest is paid in the salon.</p>'+
   '<div class="depositline"><b class="num">$30 <span style="font-family:var(--body);font-size:14px">AUD</span></b><span>2% card surcharge applies</span></div>'+
   '<div class="paybox">'+
    '<button type="button" class="applepay" data-pay="Apple Pay" aria-label="Pay $30 with Apple Pay">'+APPLE+'Pay</button>'+
    '<button type="button" class="gpay" data-pay="Google Pay" aria-label="Pay $30 with Google Pay">'+GOOGLE+'Pay</button>'+
    '<div class="or">or pay by card</div>'+
    '<div class="cardform">'+
     '<label class="field full" for="cname">Name on card<input id="cname" autocomplete="cc-name" value="'+esc((st.f.fn+" "+st.f.ln).trim())+'"></label>'+
     '<label class="field full" for="cnum">Card number<input id="cnum" inputmode="numeric" autocomplete="cc-number" placeholder="1234 1234 1234 1234"></label>'+
     '<label class="field" for="cexp">Expiry<input id="cexp" inputmode="numeric" autocomplete="cc-exp" placeholder="MM / YY"></label>'+
     '<label class="field" for="ccvv">CVV<input id="ccvv" inputmode="numeric" autocomplete="cc-csc" placeholder="123"></label>'+
    '</div>'+
    '<div class="cards" aria-label="Accepted cards"><span>VISA</span><span>MASTERCARD</span><span>AMEX</span><span>DISCOVER</span></div>'+
    '<button type="button" class="cta" data-pay="card" style="margin-top:4px">Pay $30 by card</button>'+
    '<p class="secure">Demo only: no payment is taken. In the live site, payment is processed securely and the salon never sees your card number.</p>'+
   '</div>';
}
function doneView(){
  var i=svc(),t=tech();
  return '<div class="done"><div class="seal" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>'+
   '<p class="eyebrow" style="margin:6px 0 0">Deposit received'+(st.payMethod&&st.payMethod!=="card"?" via "+st.payMethod:"")+'</p>'+
   '<h1 id="h1">You’re booked</h1>'+
   '<p class="when">'+i.n+'<br><em>with '+t.n+'</em></p>'+
   '<p class="lede">'+fmtDate(st.date)+' at '+st.time+' · Level 1, 179 Little Bourke St, Melbourne</p>'+
   '<p class="lede">Please arrive 10 minutes early to choose your colour and design. A confirmation is on its way by SMS and email.</p>'+
   '<button type="button" class="btn ghost" data-reset style="margin-top:10px">Make another booking</button></div>';
}
function view(){
  if(st.paid)return doneView();
  if(st.step===0)return st.cat?listView():homeView();
  if(st.step===1)return techView();
  if(st.step===2)return timeView();
  if(st.step===3)return detailsView();
  return payView();
}
function render(focus,msg){
  progress();
  var hasAside=st.step>0&&!st.paid;
  $("#layout").className="layout"+(hasAside?" has-aside":"");
  summary();
  $("#main").innerHTML=view();
  if(focus){
    var h=$("#h1");if(h){h.setAttribute("tabindex","-1");h.focus({preventScroll:true});}
    var y=$("#progress").getBoundingClientRect().top+window.pageYOffset-12;
    if(window.pageYOffset>y)window.scrollTo(0,y);
  }
  if(msg)announce(msg);
}
function stepMsg(){
  if(st.paid)return "Booking confirmed.";
  return "Step "+(st.step+1)+" of 5: "+STEPS[st.step]+". "+($("#h1")?$("#h1").textContent:"");
}

/* ---------- Events ---------- */
document.addEventListener("click",function(e){
  var a=e.target.closest("a[href^='#']");
  if(a&&a.getAttribute("href").length>1){
    var target=document.getElementById(a.getAttribute("href").slice(1));
    e.preventDefault();if(target){target.setAttribute("tabindex","-1");target.focus();}
    return;
  }
  var b=e.target.closest("button");if(!b||b.disabled)return;
  var d=b.dataset;
  if("skip" in d){$("#main").focus();return;}
  if(d.note){var el=document.getElementById(d.target||"giftnote");if(el)el.textContent=d.note+": coming from Acuity in the live site.";return;}
  if(d.cat){st.cat=d.cat;render(true);announce(stepMsg());}
  else if("back" in d){st.cat=null;render(true);announce("All categories");}
  else if(d.svc){st.svc=d.svc;st.step=1;render(true);announce(stepMsg());}
  else if(d.tech){st.tech=d.tech;st.step=2;render(true);announce(stepMsg());}
  else if(d.month){var m=st.month;st.month=new Date(m.getFullYear(),m.getMonth()+(+d.month),1);render();var nb=$('[data-month="'+d.month+'"]');if(nb&&!nb.disabled)nb.focus();else{var ob=$('[data-month]:not([disabled])');if(ob)ob.focus();}}
  else if(d.date){st.date=new Date(+d.date);st.time=null;render();var db=$('[data-date="'+d.date+'"]');if(db)db.focus();announce(fmtDate(st.date)+" selected. "+slotsFor(st.date).length+" times available.");}
  else if(d.time){st.time=d.time;render();var tb=$('[data-time="'+d.time+'"]');if(tb)tb.focus();announce(d.time+" selected. Continue is now available.");}
  else if(d.go){st.step=+d.go;render(true);announce(stepMsg());}
  else if(d.pay){st.payMethod=d.pay;st.paid=true;render(true);announce("Booking confirmed. You’re booked.");}
  else if("reset" in d){st=fresh();render(true);announce("New booking. Step 1 of 5: Treatment.");}
});
function refreshGate(){
  var m=missing(),btn=$('[data-go="4"]'),why=$("#why");
  if(btn)btn.disabled=!!m.length;
  if(why)why.textContent=whyText(m);
}
document.addEventListener("change",function(e){
  var t=e.target;
  if(t.dataset.addon){st.addons[t.dataset.addon]=t.checked;summary();}
  else if(t.dataset.ok){st.ok[t.dataset.ok]=t.checked;refreshGate();}
  else if(t.id==="sms"){st.f.sms=t.checked;refreshGate();}
  else if(t.id==="cc"){st.f.cc=t.value;}
});
document.addEventListener("input",function(e){
  var t=e.target;if(["fn","ln","ph","em"].indexOf(t.id)<0)return;
  st.f[t.id]=t.value.trim();refreshGate();
});

render();
})();
