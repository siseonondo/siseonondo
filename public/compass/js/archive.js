// ---- 통합 기록 보관함 ----
// 선택 기록, 기분 체크, 질문 답, 생각 노트, 선택 비교, 결정 유예, 실행 계획을 한곳에 모아 보여 준다.
var FEED_TYPES=[["rec","선택 기록"],["mood","기분 체크"],["q","질문 답"],["note","생각 노트"],["cmp","선택 비교"],["dfr","결정 유예"],["plan","실행 계획"]];
var arch={q:"",types:[],mood:"",val:"",fav:false,range:"all",from:"",to:"",more:false,limit:50};
var archTimer=null;

function archReset(){
  arch.q="";arch.types=[];arch.mood="";arch.val="";arch.fav=false;arch.range="all";arch.from="";arch.to="";arch.limit=50;
}
function archActive(){return !!(arch.q.trim()||arch.types.length||arch.mood||arch.val||arch.fav||arch.range!=="all")}
function typeName(t){
  for(var i=0;i<FEED_TYPES.length;i++){if(FEED_TYPES[i][0]===t)return FEED_TYPES[i][1]}
  return "";
}
function favHas(key){return sload("favs").indexOf(key)>=0}
function favToggle(key){
  var f=sload("favs").slice(),i=f.indexOf(key);
  if(i>=0)f.splice(i,1);else f.push(key);
  return spersist("favs",f);
}

// 모든 종류의 기록을 하나의 목록으로 만든다(최신순). 저장소에서 온 값이 이상해도 깨지지 않게 다듬어서 쓴다.
function buildFeed(){
  var out=[],ord=0,i;
  function add(it){it.ord=ord++;it.key=it.type+":"+it.id;out.push(it)}
  var recs=load();
  for(i=0;i<recs.length;i++){
    var r=recs[i];
    if(!r||typeof r!=="object")continue;
    var vals=r.vals?String(r.vals).split("|"):[];
    add({type:"rec",id:r.id||("i"+i),idx:i,day:validDay(r.day)?r.day:"",title:strOf(r.issue),mood:strOf(r.mood),vals:vals,
      wtext:[r.issue,r.crit,r.pick,r.why,r.learn].map(function(x){return strOf(x)}).join(" "),   // 직접 쓴 글만(단어 세기용)
      text:[r.issue,r.crit,r.pick,r.why,r.ai,r.learn,r.effect,vals.join(" "),String(r.strs||"").split("|").join(" "),r.kind,r.mood].join(" ")});
  }
  sload("moods").forEach(function(m){
    if(m&&validDay(m.day)&&typeof m.mood==="string")add({type:"mood",id:m.id||m.day,day:m.day,title:m.mood+" · 기분 체크",mood:m.mood,vals:[],snippet:strOf(m.note),text:m.mood+" "+strOf(m.note)});
  });
  sload("questions").forEach(function(q){
    if(q&&validDay(q.day)&&q.answer){
      var qt=questionText(q.qid)||"오늘의 질문";
      add({type:"q",id:q.id||q.day,day:q.day,title:qt,mood:"",vals:[],snippet:strOf(q.answer),text:qt+" "+strOf(q.answer)});
    }
  });
  sload("notes").forEach(function(n){
    if(!n||typeof n.id!=="string")return;
    var t=[n.event,n.facts,n.interp,n.emotion,n.alt].map(function(x){return strOf(x)}).join(" ");
    add({type:"note",id:n.id,day:validDay(n.day)?n.day:"",title:strOf(n.event)||"(적은 일이 없어요)",mood:"",vals:[],snippet:strOf(n.facts),text:t,href:"#/notes/"+encodeURIComponent(n.id)});
  });
  sload("compare").forEach(function(c){
    if(!c||typeof c.id!=="string")return;
    var n=cmpNorm(c);
    add({type:"cmp",id:c.id,day:n.day,title:n.title||"(제목 없음)",mood:"",vals:[],snippet:n.options.map(function(o,k){return OPT_LETTERS.charAt(k)+(o.name?" "+o.name:"")}).join(" · "),
      text:n.title+" "+n.options.map(function(o){return o.name+" "+o.pros+" "+o.cons}).join(" ")+" "+n.reason,href:"#/compare/"+encodeURIComponent(c.id)});
  });
  sload("defer").forEach(function(c){
    if(!c||typeof c.id!=="string")return;
    var n=dfNorm(c);
    add({type:"dfr",id:c.id,day:n.day,title:n.issue||"(적은 고민이 없어요)",mood:"",vals:[],snippet:n.reason,text:n.issue+" "+n.reason+" "+n.decision,href:"#/defer/"+encodeURIComponent(c.id)});
  });
  sload("plans").forEach(function(c){
    if(!c||typeof c.id!=="string")return;
    var n=planNorm(c);
    add({type:"plan",id:c.id,day:n.day,title:n.goal||"(적은 목표가 없어요)",mood:"",vals:[],snippet:n.firstAction?"첫 행동: "+n.firstAction:"",text:n.goal+" "+n.firstAction+" "+n.reflection,href:"#/plans/"+encodeURIComponent(c.id)});
  });
  out.sort(function(a,b){
    if(a.day!==b.day){if(!a.day)return 1;if(!b.day)return -1;return a.day<b.day?1:-1}
    return a.ord-b.ord;
  });
  return out;
}
function archInRange(day){
  if(arch.range==="all")return true;
  if(!day)return false;
  var now=new Date(),ym=now.getFullYear()+"-"+p2(now.getMonth()+1);
  if(arch.range==="month")return day.slice(0,7)===ym;
  if(arch.range==="last"){var d=new Date(now.getFullYear(),now.getMonth()-1,1);return day.slice(0,7)===d.getFullYear()+"-"+p2(d.getMonth()+1)}
  if(arch.range==="custom"){
    if(arch.from&&day<arch.from)return false;
    if(arch.to&&day>arch.to)return false;
  }
  return true;
}
function filterFeed(items){
  var toks=arch.q.toLowerCase().split(/\s+/).filter(Boolean),favs=sload("favs");
  return items.filter(function(it){
    if(arch.types.length&&arch.types.indexOf(it.type)<0)return false;
    if(arch.mood&&it.mood!==arch.mood)return false;
    if(arch.val&&it.vals.indexOf(arch.val)<0)return false;
    if(arch.fav&&favs.indexOf(it.key)<0)return false;
    if(!archInRange(it.day))return false;
    if(toks.length){
      var t=it.text.toLowerCase();
      for(var k=0;k<toks.length;k++){if(t.indexOf(toks[k])<0)return false}
    }
    return true;
  });
}
function feedItemHtml(it,recs,favs){
  var fav=favs.indexOf(it.key)>=0;
  var star='<button type="button" class="favbtn" data-fav="'+esc(it.key)+'" aria-pressed="'+(fav?"true":"false")+'" aria-label="즐겨찾기">'+(fav?"★":"☆")+'</button>';
  if(it.type==="rec"){
    return '<div class="feedit">'+star+recDetails(recs[it.idx],it.idx,it.idx===openIdx)+'</div>';
  }
  var date=it.day?fmtMDW(it.day):"날짜를 읽지 못한 기록";
  var inner='<span class="typetag">'+esc(typeName(it.type))+'</span><b>'+(it.mood&&it.type==="mood"?moodIcon(it.mood,14)+" ":"")+esc(trimTo(it.title,60))+'</b>'
    +(it.snippet?'<span>'+esc(trimTo(it.snippet,80))+'</span>':'')+'<span class="sub2">'+esc(date)+'</span>';
  var href=it.href||(it.type==="mood"?"#/records":it.type==="q"?"#/records/questions":"");
  return '<div class="feedit">'+star+(href?'<a class="card slink" href="'+href+'">'+inner+'</a>':'<div class="card slink">'+inner+'</div>')+'</div>';
}

function renderArchive(){
  var recs=load(),h=$("history"),any=hasUserData();
  // 다른 화면에서 특정 기록을 열러 왔다면(돌아볼 기록 등) 필터를 풀고 그 기록이 보이게 한다
  if(openIdx>=0){archReset()}
  var feed=buildFeed(),items=filterFeed(feed);
  if(openIdx>=0){
    for(var p=0;p<items.length;p++){if(items[p].type==="rec"&&items[p].idx===openIdx){if(p+1>arch.limit)arch.limit=p+1;break}}
  }
  syncArchUI(feed);
  var favs=sload("favs"),shown=items.slice(0,arch.limit),body="";
  if(!any){
    body='<div class="rec">아직 기록이 없어요.</div>';
  }else if(!items.length){
    body='<div class="card"><p style="margin:0">조건에 맞는 기록이 없어요.</p>'+(archActive()?'<p class="hint2" style="margin:6px 0 0">검색어나 필터를 바꿔 보세요.</p>':'')+'</div>';
  }else{
    body='<p class="hint2" id="archCount">'+(archActive()?items.length+'개의 기록이 보여요.':'모두 '+items.length+'개의 기록이 있어요.')+'</p>'
      +shown.map(function(it){return feedItemHtml(it,recs,favs)}).join("")
      +(items.length>shown.length?'<button type="button" class="btn ghost" id="archMoreBtn" style="margin:0 0 12px">더 보기 ('+(items.length-shown.length)+'개 남음)</button>':'');
  }
  h.innerHTML=toolsHtml(any,recs.length>0)+(recs.length?flowHtml(recs):"")+body;
  bindTools();
  if($("copyBtn"))$("copyBtn").onclick=function(){
    var txt=load().map(function(r){
      return r.date+"\n기분: "+r.mood+(r.effect?"\n기분의 영향: "+r.effect:"")+"\n고민: "+r.issue+(r.crit?"\n내 기준: "+r.crit:"")+(r.ai?"\nAI의 답: "+r.ai:"\nAI 없이 기록")+(r.choice?"\nAI 답 적합성: "+r.choice:"")+(r.pick?"\n내일의 선택: "+r.pick:"")+(r.why?"\n선택한 이유: "+r.why:"")+(r.due?"\n돌아볼 날: "+fmtDue(r.due):"")+(r.retro?"\n회고: "+r.retro:"")+(r.learn?"\n배운 점: "+r.learn:"");
    }).join("\n\n---\n\n");
    var btn=$("copyBtn");
    copyText(txt,function(ok){btn.textContent=ok?"복사했어요":"복사하지 못했어요";setTimeout(function(){btn.textContent="기록 복사"},1500)});
  };
}
// 특정 선택 기록을 열어서 그 자리로 스크롤한다
function openRecord(i){
  openIdx=i;go("/records/list");openIdx=-1;
  var d=$("history").querySelector('details[data-i="'+i+'"]');
  if(d)d.scrollIntoView({block:"start"});
}

// ---- 검색·필터 화면 ----
function chipBtn(label,attr,val,on,extra){
  return '<button type="button" class="chip'+(on?' on':'')+'" '+attr+'="'+esc(val)+'" aria-pressed="'+(on?'true':'false')+'">'+(extra||"")+esc(label)+'</button>';
}
function syncArchUI(feed){
  $("archTypes").innerHTML=FEED_TYPES.map(function(t){return chipBtn(t[1],"data-ty",t[0],arch.types.indexOf(t[0])>=0)}).join("");
  $("archMoods").innerHTML=MOODS.map(function(m){return chipBtn(m[0],"data-mo",m[0],arch.mood===m[0],moodIcon(m[0],12)+" ")}).join("");
  var labels=sload("values").core.map(function(c){return c.label});
  (feed||[]).forEach(function(it){it.vals.forEach(function(v){if(v&&labels.indexOf(v)<0)labels.push(v)})});
  $("archValsBox").style.display=labels.length?"block":"none";
  $("archVals").innerHTML=labels.map(function(l){return chipBtn(l,"data-vl",l,arch.val===l)}).join("");
  $("archRange").innerHTML=[["all","전체"],["month","이번 달"],["last","지난 달"],["custom","직접"]].map(function(r){return chipBtn(r[1],"data-rg",r[0],arch.range===r[0])}).join("");
  $("archDates").style.display=arch.range==="custom"?"block":"none";
  $("archFrom").value=arch.from;$("archTo").value=arch.to;
  var fb=$("archFav");fb.classList.toggle("on",arch.fav);fb.setAttribute("aria-pressed",arch.fav?"true":"false");
  if($("archQ").value!==arch.q)$("archQ").value=arch.q;
  $("archExtra").style.display=arch.more?"block":"none";
  $("archMore").textContent=arch.more?"필터 접기":"필터 더 보기";
  $("archMore").setAttribute("aria-expanded",arch.more?"true":"false");
  $("archClear").style.display=archActive()?"":"none";
}
function archChanged(){arch.limit=50;renderHistory()}
function bindArchive(){
  var bar=$("archBar");
  $("archQ").addEventListener("input",function(){
    arch.q=$("archQ").value;
    if(archTimer!==null)clearTimeout(archTimer);
    archTimer=setTimeout(function(){archTimer=null;archChanged()},250);
  });
  $("archFrom").addEventListener("change",function(){arch.from=$("archFrom").value;archChanged()});
  $("archTo").addEventListener("change",function(){arch.to=$("archTo").value;archChanged()});
  bar.addEventListener("click",function(e){
    var t=e.target.closest?e.target.closest("button"):null;
    if(!t||!bar.contains(t))return;
    if(t.hasAttribute("data-ty")){
      var ty=t.getAttribute("data-ty"),i=arch.types.indexOf(ty);
      if(i>=0)arch.types.splice(i,1);else arch.types.push(ty);
    }else if(t.hasAttribute("data-mo")){var m=t.getAttribute("data-mo");arch.mood=(arch.mood===m)?"":m}
    else if(t.hasAttribute("data-vl")){var v=t.getAttribute("data-vl");arch.val=(arch.val===v)?"":v}
    else if(t.hasAttribute("data-rg")){arch.range=t.getAttribute("data-rg");if(arch.range!=="custom"){arch.from="";arch.to=""}}
    else if(t.id==="archFav"){arch.fav=!arch.fav}
    else if(t.id==="archMore"){arch.more=!arch.more}
    else if(t.id==="archClear"){archReset()}
    else return;
    archChanged();
  });
  // 더 보기 버튼과 즐겨찾기 별은 목록 안에 있다
  $("histSlot").addEventListener("click",function(e){
    var t=e.target.closest?e.target.closest("button"):null;
    if(!t)return;
    if(t.id==="archMoreBtn"){arch.limit+=50;renderHistory();return}
    if(t.hasAttribute("data-fav")){
      var key=t.getAttribute("data-fav");
      if(!favToggle(key)){alert("저장하지 못했어요. 시크릿 탭이 아닌 곳에서 다시 시도해 주세요.");return}
      var on=favHas(key);
      if(arch.fav&&!on){renderHistory();return}
      t.textContent=on?"★":"☆";t.setAttribute("aria-pressed",on?"true":"false");
    }
  });
}
