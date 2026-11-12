// 선택지와 결과 문장은 초안입니다 (작성자 확정 필요)
var MOODS=[
 ["불안해요","불안할 때는 작은 위험도 크게 보여요. 지금의 불안이 답을 고르는 기준이 되지 않도록, 한 걸음 떨어져서 봐요."],
 ["조급해요","서두르는 마음은 그럴싸한 답에 먼저 손을 뻗게 해요. 오늘 안에 정하지 않아도 되는지 먼저 살펴봐요."],
 ["막막해요","막막함은 정보가 많아서일 수 있어요. 모든 답을 다 보려 하지 말고, 내 고민 하나에 맞는 것만 남겨 봐요."],
 ["설레요","설렘은 좋은 힘이에요. 다만 설렐 때는 단점이 잘 안 보이니, 숫자와 비용을 한 번 더 확인해 봐요."],
 ["차분해요","좋은 상태예요. 이 차분함으로 AI의 답을 하나씩 천천히 읽어 봐요."]
];
var ISSUES=[
 ["돈·비용 문제","돈 걱정에는 “무조건 손해 볼 거야” 같은 생각이 따라오기 쉬워요. 그 생각의 근거가 사실인지 적어 보세요. 그리고 내가 돈으로 지키고 싶은 것이 무엇인지 떠올려 보세요. 그것이 나만의 기준이 돼요."],
 ["선택 기로 (A or B)","어느 쪽이 정답인지 찾기보다, 각각을 골랐을 때 내 마음이 어떤지 느껴 보세요. “반드시 하나만 맞아”라는 생각이 사실인지도 살펴보세요. 더 나다운 쪽이 어느 쪽인가요?"],
 ["사람·관계 문제","상대의 마음을 내가 짐작한 것과 실제로 확인한 것을 나눠 보세요. 그리고 이 관계에서 내가 지키고 싶은 것을 떠올려 보세요. 나의 마음과 가치가 선택의 기준이 돼요."],
 ["방향·계획 문제","“지금 정하지 못하면 늦는다”는 생각이 사실인지 따져 보세요. 남들이 말하는 방향이 아니라, 내가 어떤 삶을 원하는지 떠올려 보세요. 그 한 줄이 나의 철학의 시작이에요."]
];
var JUDGES=[
 ["맞아요","내 고민에 맞다고 느껴요. 그래도 실행 전에 비용과 위험을 한 번만 더 확인해요."],
 ["일부만 맞아요","맞는 부분만 남기고 나머지는 덜어내요. 맞는 부분이 어디인지 적어 두면 좋아요."],
 ["잘 모르겠어요","모르겠다면 오늘은 고르지 않아도 괜찮아요. 하루 뒤에 다시 읽어 보는 것도 선택이에요."],
 ["안 맞아요","맞지 않는 답을 따를 필요는 없어요. 내 고민을 다시 한 줄로 적어 다시 물어봐요."]
];
var st={mood:null,issue:"",kind:null,judge:null};
// 화면 ③의 '이 선택과 이어진 가치·강점'(선택 항목): 핵심 가치·강점이 있을 때만 보인다
var linkOpen=false,pickedVals=[],pickedStrs=[];
// 결정 유예함에서 넘어온 작성 흐름: 저장하면 그 고민에 이 기록을 이어 둔다. lastSaved는 방금 저장한 기록.
var flowLink=null,lastSaved=null;
function pipeSafe(s){return String(s||"").replace(/\|/g," ").replace(/\s+/g," ").trim()}
function linkOptions(){
  var vals=sload("values").core.map(function(c){return c.label}),strs=[];
  sload("strengths").forEach(function(s){var n=pipeSafe(s&&s.name);if(n&&strs.indexOf(n)<0)strs.push(n)});
  return {vals:vals,strs:strs};
}
function updateLinkBox(){
  var o=linkOptions(),box=$("linkBox");
  if(!o.vals.length&&!o.strs.length){box.style.display="none";return}
  box.style.display="block";
  pickedVals=pickedVals.filter(function(x){return o.vals.indexOf(x)>=0});
  pickedStrs=pickedStrs.filter(function(x){return o.strs.indexOf(x)>=0});
  function chipsHtml(list,picked,attr,none){
    if(!list.length)return '<span class="hint2" style="margin:0">'+none+'</span>';
    return list.map(function(l){return '<button type="button" class="chip'+(picked.indexOf(l)>=0?' on':'')+'" '+attr+'="'+esc(l)+'" aria-pressed="'+(picked.indexOf(l)>=0?'true':'false')+'">'+esc(l)+'</button>'}).join("");
  }
  $("linkVals").innerHTML=chipsHtml(o.vals,pickedVals,"data-lv","아직 정한 핵심 가치가 없어요.");
  $("linkStrs").innerHTML=chipsHtml(o.strs,pickedStrs,"data-ls","아직 적은 강점이 없어요.");
  var n=pickedVals.length+pickedStrs.length;
  $("linkToggle").textContent=(linkOpen?"이어진 가치·강점 접기":"이 선택과 이어진 가치·강점 (선택)")+(n?" ("+n+"개)":"");
  $("linkWrap").style.display=linkOpen?"block":"none";
}
var splitOpen=false,moneyManual=null,fromScreen=0,splitTimer=null,draftTimer=null,curScreen=0;
var $=function(i){return document.getElementById(i)};
function esc(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML}

function chips(box,list,key,after){
  list.forEach(function(it,idx){
    var b=document.createElement("button");
    b.className="chip";b.textContent=it[0];
    b.onclick=function(){
      st[key]=idx;
      Array.prototype.forEach.call(box.children,function(c,j){c.classList.toggle("on",j===idx)});
      after(it);
    };
    box.appendChild(b);
  });
}
// 번호 화면: 1~3은 작성 흐름(#/flow), 0은 시작 화면(첫 방문 랜딩 또는 재방문 홈), 4는 지난 기록 목록
function show(n){
  if(n===0){go(startPath());return}
  if(n===4){go("/records/list");return}
  flushDraft();curScreen=n;
  enterFlow(n);
  if(n===3){updateMoney();updateLinkBox()}
  lastStep=n;saveDraft();
  $("bar").style.width=(n/3*100)+"%";
  $("stepText").textContent=n+" / 3";
  if(n===3){
    $("sum").innerHTML='<div class="sumTop">'+esc(MOODS[st.mood][0])+' · '+esc(ISSUES[st.kind][0])+'</div>'
      +'<div class="sumIssue">'+esc(st.issue)+'</div>'
      +'<div class="sumCrit">내 기준: '+esc(st.crit)+'</div>'
      +(st.effect?'<div class="sumEff">기분의 영향: '+esc(st.effect)+'</div>':'');
  }
  window.scrollTo(0,0);
}
function setResult(id,t){var r=$(id);r.textContent=t;r.classList.remove("empty")}

chips($("moods"),MOODS,"mood",function(it){setResult("r1",it[1]);$("effectBox").style.display="block";$("n1").disabled=false});
var CRIT_EX=["경제적 안정","내가 원하는 방향","존중과 신뢰","지속 가능성"];
function updateCritHint(){
  var h=$("critHint"),k=st.kind;
  if(k!==null&&CRIT_EX[k]){
    h.textContent="예: "+CRIT_EX[k]+" · 정답은 없어요. 내 말로 적어 주세요.";
    h.style.display="block";
  }else{
    h.textContent="";h.style.display="none";
  }
}
chips($("issues"),ISSUES,"kind",function(it){setResult("r2",it[1]);$("critBox").style.display="block";updateCritHint();check2()});
function check2(){$("n2").disabled=!($("issue").value.trim()&&st.kind!==null&&$("crit").value.trim())}
$("issue").oninput=check2;
$("crit").oninput=check2;
$("n1").onclick=function(){st.effect=$("effect").value.trim();show(2)};
$("p1").onclick=function(){show(0)};
$("viewHist").onclick=function(){go("/records/list")};
$("goHist").onclick=function(){go("/records/list")};
$("p2").onclick=function(){show(1)};
$("p3").onclick=function(){show(2)};
$("n2").onclick=function(){st.issue=$("issue").value.trim();st.crit=$("crit").value.trim();show(3)};

JUDGES.forEach(function(it,idx){
  var b=document.createElement("button");
  b.className="chip block";b.textContent=it[0];
  b.onclick=function(){
    st.judge=idx;
    Array.prototype.forEach.call($("judges").children,function(c,j){c.classList.toggle("on",j===idx)});
    setResult("r3",it[1]);check3();
  };
  $("judges").appendChild(b);
});
var CHECKS=["잃어도 되는 금액을 정했나?","되돌릴 수 있는 선택인가?","하루 지나도 같은 선택일까?","이 답의 숫자(비용·수익)를 내가 직접 확인했나?"];
var checkVal=CHECKS.map(function(){return null});
CHECKS.forEach(function(q,i){
  var d=document.createElement("div");d.className="check";
  d.innerHTML="<p>"+esc(q)+"</p>";
  ["예","아니오"].forEach(function(label,v){
    var b=document.createElement("button");b.className="chip";b.textContent=label;
    b.onclick=function(){
      checkVal[i]=(v===0);
      Array.prototype.forEach.call(d.querySelectorAll(".chip"),function(c,j){c.classList.toggle("on",j===v)});
      $("warn").style.display=checkVal.indexOf(false)>=0?"block":"none";
    };
    d.appendChild(b);
  });
  $("checks").appendChild(d);
});
function check3(){
  var hasAi=!!$("ai").value.trim();
  $("judgeBox").style.display=hasAi?"block":"none";
  $("save").disabled=!($("pick").value.trim()&&(!hasAi||st.judge!==null));
}
$("pick").oninput=check3;
var picked={};
function sentences(t){
  return t.replace(/([.!?…。])\s+/g,"$1\n").split(/\n+/).map(function(s){return s.trim()}).filter(Boolean);
}
function updateSplitUi(){
  var n=Array.prototype.filter.call($("split").querySelectorAll("input"),function(c){return c.checked}).length;
  $("splitWrap").style.display=splitOpen?"block":"none";
  $("splitToggle").textContent=(splitOpen?"문장 접기":"문장 골라 담기")+(n?" ("+n+"개 선택)":"");
}
$("splitToggle").onclick=function(){flushSplit();splitOpen=!splitOpen;updateSplitUi()};
function flushSplit(){if(splitTimer!==null)renderSplit()}
function scheduleSplit(){
  if(splitTimer!==null)clearTimeout(splitTimer);
  splitTimer=setTimeout(function(){splitTimer=null;renderSplit()},300);
}
function updateMoney(){
  var open=(moneyManual===null)?(st.kind===0):moneyManual;
  $("moneyWrap").style.display=open?"block":"none";
  $("moneyToggle").textContent=open?"돈 체크 접기":"돈이 걸린 선택이라면 확인해 보기";
}
$("moneyToggle").onclick=function(){
  var open=(moneyManual===null)?(st.kind===0):moneyManual;
  moneyManual=!open;updateMoney();
};
function renderSplit(){
  if(splitTimer!==null){clearTimeout(splitTimer);splitTimer=null}
  var list=sentences($("ai").value),box=$("split");
  box.innerHTML="";
  $("splitBox").style.display=list.length?"block":"none";
  list.forEach(function(s){
    var l=document.createElement("label");l.className="sent";
    var c=document.createElement("input");c.type="checkbox";c.checked=!!picked[s];
    c.onchange=function(){picked[s]=c.checked;updateSplitUi()};
    var sp=document.createElement("span");sp.textContent=s;
    l.appendChild(c);l.appendChild(sp);box.appendChild(l);
  });
  updateSplitUi();
}
$("ai").oninput=function(){check3();scheduleSplit()};

var saving=false;
function saveMessage(text,warn){
  $("saveMsg").textContent=text;
  $("saveMsg").className=warn?"result warn":"result";
  $("saveMsg").style.display="block";
}
$("save").onclick=function(){
  if(saved||saving)return;
  saving=true;$("save").disabled=true;
  try{
    var all=$("ai").value.trim();
    var keep=sentences(all).filter(function(s){return picked[s]});
    var rec={id:uid(),day:todayStr(),date:new Date().toLocaleDateString("ko-KR"),mood:MOODS[st.mood][0],effect:st.effect,issue:st.issue,crit:st.crit,ai:keep.length?keep.join(" "):all,choice:(all&&st.judge!==null)?JUDGES[st.judge][0]:"",pick:$("pick").value.trim(),why:$("why").value.trim(),due:reviewIdx<4?dueFrom(REVIEWS[reviewIdx][1]):"",vals:pickedVals.join("|"),strs:pickedStrs.join("|"),kind:(st.kind!==null&&ISSUES[st.kind])?ISSUES[st.kind][0]:""};
    var cur=load();
    if(cur.length&&recKey(cur[0])===recKey(rec)){
      saveMessage("이미 저장된 기록이에요.",false);
      check3();
      return;
    }
    if(!persist([rec].concat(cur))){
      saveMessage("저장하지 못했어요. 적은 내용은 그대로예요. [기록 복사]로 내용을 보관하거나, 시크릿 탭이 아닌 곳에서 다시 눌러 주세요.",true);
      check3();
      return;
    }
    saved=true;clearDraft();
    lastSaved=rec;
    saveMessage("저장했어요.",false);
    if(flowLink)flowLinkDone(rec);
    $("planFromRec").style.display="";
    $("save").style.display="none";
    $("newRec").style.display="";
  }finally{saving=false}
};
$("newRec").onclick=function(){resetForm();show(0)};
function resetForm(){
  saved=false;pickReview(4);splitOpen=false;moneyManual=null;linkOpen=false;pickedVals=[];pickedStrs=[];
  flowLink=null;lastSaved=null;
  if($("planFromRec"))$("planFromRec").style.display="none";
  if(splitTimer!==null){clearTimeout(splitTimer);splitTimer=null}
  if(draftTimer!==null){clearTimeout(draftTimer);draftTimer=null}
  st={mood:null,issue:"",kind:null,judge:null,effect:"",crit:""};
  picked={};
  checkVal=CHECKS.map(function(){return null});
  ["effect","issue","crit","ai","pick","why"].forEach(function(id){$(id).value=""});
  ["moods","issues","judges"].forEach(function(id){
    Array.prototype.forEach.call($(id).children,function(c){c.classList.remove("on")});
  });
  Array.prototype.forEach.call(document.querySelectorAll("#checks .chip"),function(c){c.classList.remove("on")});
  $("r1").textContent="기분을 하나 골라 주세요.";$("r1").className="result empty";
  $("r2").textContent="이슈를 적고, 종류를 골라 주세요.";$("r2").className="result empty";
  $("r3").textContent="선택지를 하나 골라 주세요.";$("r3").className="result empty";
  ["effectBox","critBox","judgeBox","splitBox","warn","saveMsg"].forEach(function(id){$(id).style.display="none"});
  updateCritHint();
  $("split").innerHTML="";
  $("n1").disabled=true;$("n2").disabled=true;$("save").disabled=true;
  $("save").style.display="";$("newRec").style.display="none";
}
// ---- 회고 예정일 ----
var REVIEWS=[["내일",1],["3일 뒤",3],["1주일 뒤",7],["2주일 뒤",14],["정하지 않음",0]],reviewIdx=4;
function pad(n){return n<10?"0"+n:""+n}
function ymd(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
function dueFrom(days){var d=new Date();d.setDate(d.getDate()+days);return ymd(d)}
function fmtDue(s){return (+s.slice(5,7))+"월 "+(+s.slice(8,10))+"일"}
function pickReview(i){
  reviewIdx=i;
  Array.prototype.forEach.call($("reviews").children,function(c,j){c.classList.toggle("on",j===i)});
}
REVIEWS.forEach(function(r,i){
  var b=document.createElement("button");b.className="chip";b.textContent=r[0];
  b.onclick=function(){pickReview(i)};
  $("reviews").appendChild(b);
});
pickReview(4);
// ---- 작성 중 자동 저장 ----
var DKEY="compass_draft",saved=false,lastStep=1,restoring=false;
function loadDraft(){try{return JSON.parse(localStorage.getItem(DKEY))}catch(e){return null}}
function clearDraft(){
  if(draftTimer!==null){clearTimeout(draftTimer);draftTimer=null}
  try{localStorage.removeItem(DKEY)}catch(e){}
}
function scheduleDraft(){
  if(saved||restoring)return;
  if(draftTimer!==null)clearTimeout(draftTimer);
  draftTimer=setTimeout(function(){draftTimer=null;saveDraft()},300);
}
function flushDraft(){
  if(draftTimer!==null){clearTimeout(draftTimer);draftTimer=null;saveDraft()}
}
function saveDraft(){
  if(saved||restoring)return;
  if(curScreen<1||curScreen>3)return;
  var d={step:lastStep,mood:st.mood,kind:st.kind,judge:st.judge,checks:checkVal,picked:picked,review:reviewIdx,vals:pickedVals,strs:pickedStrs,
    effect:$("effect").value,issue:$("issue").value,crit:$("crit").value,ai:$("ai").value,pick:$("pick").value,why:$("why").value};
  var has=d.mood!==null||d.kind!==null||d.judge!==null||pickedVals.length>0||pickedStrs.length>0||checkVal.some(function(v){return v!==null})||
    ["effect","issue","crit","ai","pick","why"].some(function(k){return d[k].trim()});
  try{if(has)localStorage.setItem(DKEY,JSON.stringify(d));else localStorage.removeItem(DKEY)}catch(e){}
}
function resumeDraft(){
  var d=loadDraft();if(!d){return}
  restoring=true;
  try{
    ["effect","issue","crit","ai","pick","why"].forEach(function(k){$(k).value=d[k]||""});
    st.effect=(d.effect||"").trim();st.issue=(d.issue||"").trim();st.crit=(d.crit||"").trim();
    picked=d.picked||{};
    pickedVals=Array.isArray(d.vals)?d.vals.slice():[];pickedStrs=Array.isArray(d.strs)?d.strs.slice():[];
    if(d.mood!==null&&$("moods").children[d.mood])$("moods").children[d.mood].click();
    if(d.kind!==null&&$("issues").children[d.kind])$("issues").children[d.kind].click();
    if(d.judge!==null&&$("judges").children[d.judge])$("judges").children[d.judge].click();
    (d.checks||[]).forEach(function(v,i){
      if(v!==null&&$("checks").children[i])$("checks").children[i].querySelectorAll(".chip")[v?0:1].click();
    });
    renderSplit();check3();check2();
    if(typeof d.review==="number"&&d.review>=0&&d.review<REVIEWS.length)pickReview(d.review);
  }finally{restoring=false}
  var step=(d.step>=1&&d.step<=3)?d.step:1;
  show(step);
}
document.addEventListener("input",scheduleDraft);
document.addEventListener("click",scheduleDraft);
window.addEventListener("pagehide",flushDraft);
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden")flushDraft()});
$("resumeBtn").onclick=resumeDraft;
function flowHtml(list){
  var max=0,rows=MOODS.map(function(m){
    var n=list.filter(function(r){return r.mood===m[0]}).length;
    if(n>max)max=n;return [m[0],n];
  });
  return '<div class="rec"><b>기분 흐름</b>'+rows.map(function(r){
    return '<div class="bar"><span>'+esc(r[0])+'</span><i style="width:'+(max?Math.round(r[1]/max*100):0)+'%"></i><em>'+r[1]+'</em></div>';
  }).join("")+'</div>';
}
var RETRO=["잘 됐어요","보통이에요","후회돼요"],openIdx=-1;
var restoreOpen=false,restoreMsg="";
function toolsHtml(has,hasRecs){
  return '<div class="copyrow">'+(hasRecs?'<button class="btn ghost" id="copyBtn">기록 복사</button>':'')+(has?'<button class="btn ghost" id="bkFile">백업 파일 저장</button><button class="btn ghost" id="bkCode">백업 코드 복사</button>':'')
    +'<button class="btn ghost" id="restoreToggle">백업 불러오기</button></div>'
    +'<div class="rec" id="restorePanel" style="display:'+(restoreOpen?'block':'none')+'">'
    +'<p>백업 파일을 고르거나, 복사해 둔 백업 코드를 붙여 넣으세요. 지금 기록은 지워지지 않고, 없는 기록만 더해져요.</p>'
    +'<input type="file" id="rsFile" accept=".json,.txt,application/json,text/plain" style="margin-bottom:10px">'
    +'<textarea id="rsText" placeholder="백업 코드를 여기에 붙여 넣으세요" style="min-height:80px"></textarea>'
    +'<button class="btn" id="rsGo">불러오기</button><p id="rsMsg"></p></div>';
}
function copyText(txt,cb){
  function fallback(){
    var t=document.createElement("textarea");t.value=txt;document.body.appendChild(t);t.select();
    var ok=false;try{ok=document.execCommand("copy")}catch(e){}
    document.body.removeChild(t);cb(ok);
  }
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(function(){cb(true)},fallback)}else{fallback()}
}
var FIELDS=["id","day","date","mood","effect","issue","crit","ai","choice","pick","why","due","retro","learn","vals","strs","kind","edited"];
function doRestore(){
  function say(m){restoreMsg=m;$("rsMsg").textContent=m}
  var raw=$("rsText").value.trim();
  if(!raw){say("백업 파일을 고르거나 백업 코드를 붙여 넣어 주세요.");return}
  var data;try{data=JSON.parse(raw)}catch(e){data=null}
  var recs=Array.isArray(data)?data:(data&&data.app==="compass"&&Array.isArray(data.records)?data.records:null);
  if(!recs){say("불러오지 못했어요. 나침반에서 만든 백업이 맞는지 확인해 주세요.");return}
  var valid=recs.filter(function(r){return r&&typeof r==="object"&&typeof r.date==="string"&&typeof r.mood==="string"&&typeof r.issue==="string"});
  function key(r){return recKey(r)}
  var cur=load(),seen={},add=[],dup=0;
  cur.forEach(function(r){seen[key(r)]=1});
  valid.forEach(function(r){
    var k=key(r);if(seen[k]){dup++;return}seen[k]=1;
    var c={};FIELDS.forEach(function(f){c[f]=typeof r[f]==="string"?r[f]:""});normRec(c);add.push(c);
  });
  if(add.length&&!persist(cur.concat(add))){say("저장하지 못했어요. 시크릿 탭이 아닌 곳에서 다시 시도해 주세요.");return}
  var ex=restoreExtras(data);
  restoreMsg=add.length+"개의 기록을 불러왔어요."+(dup?" 이미 있는 "+dup+"개는 건너뛰었어요.":"")+(recs.length-valid.length?" 형식이 맞지 않는 "+(recs.length-valid.length)+"개는 제외했어요.":"")+extrasMessage(ex);
  restoreOpen=true;renderHistory();
}
function bindTools(){
  $("restoreToggle").onclick=function(){restoreOpen=!restoreOpen;$("restorePanel").style.display=restoreOpen?"block":"none"};
  $("rsMsg").textContent=restoreMsg;
  $("rsFile").onchange=function(){
    var f=this.files[0];if(!f)return;
    var rd=new FileReader();rd.onload=function(){$("rsText").value=rd.result};rd.readAsText(f);
  };
  $("rsGo").onclick=doRestore;
  if($("bkFile"))$("bkFile").onclick=doBackupFile;
  if($("bkCode"))$("bkCode").onclick=function(){doBackupCode($("bkCode"))};
}
// 백업 받기(보관함과 설정에서 함께 쓴다). 받은 날짜는 meta.lastBackup에 남긴다(백업 파일에는 넣지 않는다).
function markBackup(){
  var m=copyRec(sload("meta"));m.lastBackup=todayStr();spersist("meta",m);
}
function lastBackupDay(){var d=sload("meta").lastBackup;return validDay(d)?d:""}
function doBackupFile(){
  var a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([backupText()],{type:"application/json"}));
  a.download="compass-backup-"+new Date().toISOString().slice(0,10)+".json";
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  markBackup();
  if(typeof renderSettings==="function"&&$("sS").classList.contains("on"))renderSettings();
}
function doBackupCode(b){
  var label=b.getAttribute("data-label")||b.textContent;b.setAttribute("data-label",label);
  copyText(backupText(),function(ok){
    if(ok)markBackup();
    b.textContent=ok?"복사했어요":"복사하지 못했어요";
    setTimeout(function(){b.textContent=label},1500);
    if(ok&&$("sS").classList.contains("on"))renderSettings();
  });
}
// 돌아볼 시점이 된 기록(예정일이 지났고 아직 회고하지 않은 기록), 가장 오래된 예정일 순
function dueCandidates(){
  var today=ymd(new Date()),list=load(),cand=[];
  list.forEach(function(r,i){if(r.due&&r.due<=today&&!r.retro)cand.push({r:r,i:i})});
  cand.sort(function(a,b){return a.r.due<b.r.due?-1:a.r.due>b.r.due?1:0});
  return cand;
}
function renderDue(){
  var box=$("dueCard"),cand=dueCandidates();
  if(!cand.length){box.style.display="none";box.innerHTML="";return false}
  var c=cand[0],r=c.r;
  box.innerHTML='<p class="tagline">돌아볼 시점이에요</p>'
    +'<p><b>'+esc(r.date)+'</b> · '+esc(r.issue)+'</p>'
    +(r.pick?'<p>그때의 선택: '+esc(r.pick)+'</p>':'')
    +(cand.length>1?'<p class="more">외 '+(cand.length-1)+'개의 기록도 돌아볼 시점이에요.</p>':'')
    +'<button class="btn" id="dueGo">지금 돌아보기 ›</button>';
  box.style.display="block";
  $("dueGo").onclick=function(){
    openRecord(c.i);
  };
  return true;
}
// 재방문 사용자(저장된 기록이 있는 사람)에게만 '내 기록' 영역을 보여 준다
function renderMyRec(){
  var list=load(),box=$("myRec"),rc=$("recentCard");
  if(!list.length){box.style.display="none";rc.style.display="none";rc.innerHTML="";return}
  box.style.display="block";
  if(renderDue()){rc.style.display="none";rc.innerHTML="";return}
  var r=list[0];
  rc.innerHTML='<p class="tagline">최근에 남긴 기록</p>'
    +'<p><b>'+esc(r.date)+'</b> · '+esc(r.issue)+'</p>'
    +(r.pick?'<p>그때의 선택: '+esc(r.pick)+'</p>':'');
  rc.style.display="block";
}
function dueLabel(r){
  if(!r.due||r.retro)return "";
  return r.due<=ymd(new Date())?' · <strong class="due">돌아볼 시점이에요</strong>':' · 돌아볼 날: '+fmtDue(r.due);
}
function localDay(iso){var d=new Date(iso);return isNaN(d.getTime())?"":ymd(d)}
function recSummary(r){
  return '<summary><b>'+esc(r.date)+'</b> · '+esc(r.mood)+' · '+esc(r.issue)+(r.retro?' · 회고: '+esc(r.retro):'')+(r.edited?' · <span class="edtag">수정함</span>':'')+dueLabel(r)+'</summary>';
}
function recBody(r,i){
  var rc=RETRO.map(function(t){return '<button class="chip retro'+(r.retro===t?' on':'')+'" data-i="'+i+'" data-t="'+t+'">'+t+'</button>'}).join("");
  var view='<div class="recview">'
    +(r.kind?'<p>고민 유형: '+esc(r.kind)+'</p>':'')
    +(r.effect?'<p>기분의 영향: '+esc(r.effect)+'</p>':'')
    +(r.crit?'<p>내 기준: '+esc(r.crit)+'</p>':'')
    +(r.ai?'<p>AI의 답: '+esc(r.ai)+'</p>':'<p>AI 없이 기록했어요.</p>')+(r.choice?'<p>AI 답 적합성: '+esc(r.choice)+'</p>':'')
    +(r.pick?'<p>내일의 선택: '+esc(r.pick)+'</p>':'')+(r.why?'<p>선택한 이유: '+esc(r.why)+'</p>':'')
    +(r.vals?'<p>이어진 가치: '+esc(r.vals.split("|").join(" · "))+'</p>':'')+(r.strs?'<p>발휘한 강점: '+esc(r.strs.split("|").join(" · "))+'</p>':'')
    +(r.edited?'<p class="hint2">수정함 · '+esc(fmtMD(localDay(r.edited)))+' (처음 적은 날: '+esc(r.date)+')</p>':'')
    +'<p>돌아볼 날 정하기'+(r.due?' (지금: '+fmtDue(r.due)+')':'')+'</p><div class="chips">'+REVIEWS.map(function(v){return '<button class="chip duechip" data-i="'+i+'" data-d="'+v[1]+'">'+v[0]+'</button>'}).join("")+'</div>'
    +'<div class="cmp"><div><b>그때 ('+esc(r.date)+')</b>'
      +'<p>기분: '+esc(r.mood)+'</p>'
      +(r.crit?'<p>내 기준: '+esc(r.crit)+'</p>':'')
      +'<p>내 선택: '+(r.pick?esc(r.pick):'기록 없음')+'</p>'
      +(r.why?'<p>이유: '+esc(r.why)+'</p>':'')+'</div>'
      +'<div><b>지금</b>'
      +'<p>돌아본 느낌: '+(r.retro?esc(r.retro):'아직 정하지 않았어요')+'</p>'
      +'<p>알게 된 것: '+(r.learn?esc(r.learn):'아직 적지 않았어요')+'</p></div></div>'
    +'<p>지난 선택은 어땠나요?</p><div class="chips">'+rc+'</div>'
    +'<p>돌아보니 무엇을 알게 되었나요? (적지 않아도 괜찮아요)</p><textarea class="learn" style="min-height:70px">'+esc(r.learn||"")+'</textarea>'
    +'<button class="btn ghost savelearn" data-i="'+i+'">회고 저장</button>'
    +'<button class="btn ghost recedit" data-i="'+i+'">내용 고치기</button>'
    +'<button class="btn ghost del" data-i="'+i+'">삭제</button></div>';
  var form='<div class="recform" style="display:none">'
    +'<label>고민</label><input type="text" class="ef-issue" maxlength="100" value="'+esc(r.issue||"")+'">'
    +'<label>내 기준</label><input type="text" class="ef-crit" maxlength="100" value="'+esc(r.crit||"")+'">'
    +'<label>내가 선택한 것</label><textarea class="ef-pick" style="min-height:76px">'+esc(r.pick||"")+'</textarea>'
    +'<label>선택한 이유</label><textarea class="ef-why" style="min-height:76px">'+esc(r.why||"")+'</textarea>'
    +'<p class="hint2 ef-msg" aria-live="polite">고치면 "수정함"과 날짜가 남아요. 처음 적은 날짜는 그대로예요.</p>'
    +'<button class="btn recsave" data-i="'+i+'">고친 내용 저장</button><button class="btn ghost reccancel" data-i="'+i+'">취소</button></div>';
  return view+form;
}
// 본문은 처음 열릴 때(또는 처음부터 열려 있어야 할 때)만 그린다
function recDetails(r,i,open){
  return '<details class="rec" data-i="'+i+'"'+(open?' open data-filled="1"':'')+'>'+recSummary(r)+(open?recBody(r,i):'')+'</details>';
}
function replaceRec(i){
  var old=$("history").querySelector('details[data-i="'+i+'"]'),list=load();
  if(!old||!list[i]){renderHistory();return}
  var tmp=document.createElement("div");
  tmp.innerHTML=recDetails(list[i],i,true);
  old.parentNode.replaceChild(tmp.firstChild,old);
}
function renderHistory(){renderArchive()}
function histFail(){alert("저장하지 못했어요. [기록 복사]로 내용을 보관해 주세요.")}
$("history").addEventListener("click",function(e){
  var b=e.target.closest?e.target.closest(".duechip,.retro,.savelearn,.del,.recedit,.recsave,.reccancel"):null;
  if(!b||!$("history").contains(b))return;
  var cur=load(),i=+b.getAttribute("data-i");
  if(!cur[i])return;
  var cls=b.className;
  // 캐시 배열과 객체는 고치지 않고, 복사본을 고쳐서 저장한다
  var l=cur.slice(),rc=copyRec(cur[i]);
  l[i]=rc;
  if(cls.indexOf("recedit")>=0||cls.indexOf("reccancel")>=0){
    var dt=b.closest("details"),editing=cls.indexOf("recedit")>=0;
    dt.querySelector(".recview").style.display=editing?"none":"";
    dt.querySelector(".recform").style.display=editing?"block":"none";
    return;
  }
  if(cls.indexOf("recsave")>=0){
    var box=b.closest("details"),msg=box.querySelector(".ef-msg");
    var ni=box.querySelector(".ef-issue").value.trim(),np=box.querySelector(".ef-pick").value.trim();
    if(!ni||!np){msg.textContent="고민과 내가 선택한 것은 비워 둘 수 없어요.";return}
    rc.issue=ni;rc.crit=box.querySelector(".ef-crit").value.trim();rc.pick=np;rc.why=box.querySelector(".ef-why").value.trim();
    var nk=recKey(rc);
    for(var j=0;j<cur.length;j++){if(j!==i&&recKey(cur[j])===nk){msg.textContent="이미 같은 기록이 있어요.";return}}
    rc.edited=new Date().toISOString();
    if(!persist(l)){histFail();return}
    replaceRec(i);
    return;
  }
  if(cls.indexOf("duechip")>=0){
    var d=+b.getAttribute("data-d");
    rc.due=d?dueFrom(d):"";
    if(!persist(l)){histFail();return}
    replaceRec(i);
  }else if(cls.indexOf("retro")>=0){
    rc.retro=b.getAttribute("data-t");
    rc.learn=b.closest("details").querySelector(".learn").value.trim();
    if(!persist(l)){histFail();return}
    replaceRec(i);
  }else if(cls.indexOf("savelearn")>=0){
    rc.learn=b.closest("details").querySelector(".learn").value.trim();
    if(!persist(l)){histFail();return}
    replaceRec(i);
  }else if(cls.indexOf("del")>=0){
    if(!confirm("이 기록을 삭제할까요? 되돌릴 수 없어요."))return;
    l=cur.slice();
    l.splice(i,1);
    if(!persist(l)){histFail();return}
    renderHistory();
  }
});
// toggle 이벤트는 버블링되지 않으므로 캡처 단계에서 받는다
$("history").addEventListener("toggle",function(e){
  var d=e.target;
  if(!d||d.tagName!=="DETAILS"||!d.open||d.getAttribute("data-filled"))return;
  var i=+d.getAttribute("data-i"),r=load()[i];
  if(!r)return;
  d.insertAdjacentHTML("beforeend",recBody(r,i));
  d.setAttribute("data-filled","1");
},true);
// ---- 입력 중에는 하단 고정 바를 숨겨 키보드 위로 떠올라 입력란을 가리지 않게 한다 ----
function kbUpdate(){
  var a=document.activeElement;
  var typing=!!a&&(a.tagName==="TEXTAREA"||(a.tagName==="INPUT"&&a.type==="text"));
  if(typing)document.body.classList.add("kb");else document.body.classList.remove("kb");
}
document.addEventListener("focusin",kbUpdate);
document.addEventListener("focusout",function(){setTimeout(kbUpdate,50)});
// ---- 작성 중인 기록이 있을 때 시작 버튼: 안내창 ----
var dlgLastFocus=null;
function dlgOpen(){return $("draftDlg").style.display!=="none"}
function openDraftDlg(){
  dlgLastFocus=document.activeElement;
  $("draftDlg").style.display="flex";
  $("dlgResume").focus();
}
function closeDraftDlg(){
  $("draftDlg").style.display="none";
  if(dlgLastFocus&&dlgLastFocus.focus){try{dlgLastFocus.focus()}catch(e){}}
  dlgLastFocus=null;
}
$("dlgResume").onclick=function(){closeDraftDlg();resumeDraft()};
$("dlgNew").onclick=function(){closeDraftDlg();resetForm();clearDraft();show(1)};
$("dlgCancel").onclick=closeDraftDlg;
$("draftDlg").addEventListener("click",function(e){if(e.target===$("draftDlg"))closeDraftDlg()});
document.addEventListener("keydown",function(e){
  if(!dlgOpen())return;
  var k=e.key||e.keyCode;
  if(k==="Escape"||k==="Esc"||k===27){closeDraftDlg();return}
  if(k==="Tab"||k===9){
    var btns=[$("dlgResume"),$("dlgNew"),$("dlgCancel")],i=btns.indexOf(document.activeElement);
    if(e.shiftKey){if(i<=0){btns[2].focus();e.preventDefault()}}
    else if(i<0||i===2){btns[0].focus();e.preventDefault()}
  }
});
Array.prototype.forEach.call(document.querySelectorAll(".startBtn"),function(b){
  b.onclick=function(){
    if(loadDraft()){openDraftDlg();return}
    resetForm();clearDraft();show(1);
  };
});
// ---- 화면 ③의 가치·강점 선택 항목 연결 ----
$("linkToggle").onclick=function(){linkOpen=!linkOpen;updateLinkBox()};
$("linkWrap").addEventListener("click",function(e){
  var b=e.target.closest?e.target.closest(".chip"):null;
  if(!b)return;
  var arr,key;
  if(b.hasAttribute("data-lv")){arr=pickedVals;key=b.getAttribute("data-lv")}
  else if(b.hasAttribute("data-ls")){arr=pickedStrs;key=b.getAttribute("data-ls")}
  else return;
  var i=arr.indexOf(key);if(i>=0)arr.splice(i,1);else arr.push(key);
  updateLinkBox();
});
// 방금 저장한 선택에서 작은 실행 계획으로 이어 간다
$("planFromRec").onclick=function(){
  if(!lastSaved)return;
  plansPrefill={goal:lastSaved.pick,rec:lastSaved.id};
  go("/plans/new");
};
