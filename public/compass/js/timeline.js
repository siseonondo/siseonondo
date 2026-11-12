// ---- 변화 타임라인 ----
// 지금 마음에 걸리는 선택 기록을 하나 고르면, 비슷한 과거 기록을 후보로 보여 준다(후보는 규칙 기반이고, 넣고 빼는 건 사용자가 정한다).
// 고른 기록을 시간순으로 놓고, 각 기록에 "지금의 생각이 그때와 같은지"를 직접 표시하고 지금의 관점을 쓴다. 앱이 변화를 해석하지 않는다.
var TL_MARKS=[["changed","바뀌었어요"],["kept","그대로예요"],["unsure","잘 모르겠어요"]];
var tlBaseId=null;     // 기준이 되는 선택 기록의 id
var tlItem=null;       // 편집 중인 타임라인(메모리)
var tlMoreOpen=false;  // '다른 기록에서 고르기'를 펼쳐 두었는지

function tlId(baseId){return "tl-"+baseId}
function findRecById(id){
  var l=load();
  for(var i=0;i<l.length;i++){if(l[i]&&l[i].id===id)return l[i]}
  return null;
}
function tlNorm(it,baseId){
  var t={id:tlId(baseId),baseId:baseId,links:[],marks:{},current:"",at:""};
  if(!it||typeof it!=="object")return t;
  if(Array.isArray(it.links)){
    it.links.forEach(function(x){if(typeof x==="string"&&x&&x!==baseId&&t.links.indexOf(x)<0)t.links.push(x)});
  }
  if(it.marks&&typeof it.marks==="object"){
    t.links.forEach(function(id){var v=it.marks[id];if(TL_MARKS.some(function(m){return m[0]===v}))t.marks[id]=v});
  }
  t.current=strOf(it.current);t.at=strOf(it.at);
  return t;
}
function tlHasContent(t){return !!(t.links.length||t.current.trim()||Object.keys(t.marks).length)}

// ---- 비슷한 기록 후보(규칙 기반) ----
function recWordList(r){return wordsOf([r.issue,r.crit,r.pick].map(function(x){return strOf(x)}).join(" "))}
function similarity(base,r){
  var reasons=[],score=0,bw=recWordList(base),rw=recWordList(r),shared=[],k;
  if(base.kind&&r.kind&&base.kind===r.kind){reasons.push("같은 고민 유형: "+base.kind);score+=2}
  for(k=0;k<bw.length;k++){if(rw.indexOf(bw[k])>=0)shared.push(bw[k])}
  shared.slice(0,3).forEach(function(w){reasons.push("같은 단어 “"+w+"”");score+=2});
  var bv=base.vals?String(base.vals).split("|"):[],rv=r.vals?String(r.vals).split("|"):[];
  bv.forEach(function(v){if(v&&rv.indexOf(v)>=0){reasons.push("같은 가치 “"+v+"”");score+=1}});
  return {score:score,reasons:reasons};
}
function tlCandidates(base){
  var out=[];
  load().forEach(function(r){
    if(!r||!r.id||r.id===base.id)return;
    var s=similarity(base,r);
    if(s.score>0)out.push({r:r,score:s.score,reasons:s.reasons});
  });
  out.sort(function(a,b){return b.score-a.score||((b.r.day||"")<(a.r.day||"")?-1:1)});
  return out.slice(0,8);
}

// ---- 화면 ----
function renderTimelineList(){
  var recs=load().filter(function(r){return r&&r.id}).slice(0,30);
  var saved=sload("timeline").filter(function(t){return t&&typeof t.baseId==="string"&&findRecById(t.baseId)&&tlHasContent(tlNorm(t,t.baseId))});
  var h='<a class="backlink" href="#/change">‹ 나의 변화</a>'
    +'<p class="hint2">지금 마음에 걸리는 선택 기록을 하나 고르면, 비슷한 과거 기록을 시간순으로 놓고 지금의 생각을 적어 볼 수 있어요. 무엇이 달라졌는지는 내가 정해요.</p>';
  if(saved.length){
    h+='<h3 class="hsec">내가 만든 타임라인</h3>'+saved.map(function(t){
      var b=findRecById(t.baseId),n=tlNorm(t,t.baseId);
      return '<a class="card slink" href="#/change/timeline/'+encodeURIComponent(b.id)+'"><b>'+esc(trimTo(b.issue,50))+'</b><span>'+esc(b.date)+' · 이어 둔 기록 '+n.links.length+'개</span></a>';
    }).join("");
  }
  h+='<h3 class="hsec">어떤 선택에서 시작할까요?</h3>';
  if(!recs.length)h+='<div class="card"><p style="margin:0">선택 기록을 남기면 이곳에서 고를 수 있어요.</p></div>';
  else h+=recs.map(function(r){
    return '<a class="card slink" href="#/change/timeline/'+encodeURIComponent(r.id)+'"><b>'+esc(trimTo(r.issue,50))+'</b><span>'+esc(r.date)+(r.pick?' · '+esc(trimTo(r.pick,40)):'')+'</span></a>';
  }).join("");
  $("xTlList").innerHTML=h;
}
function renderTimelineEdit(id){
  var base=id?findRecById(id):null;
  if(!base){
    tlBaseId=null;tlItem=null;
    $("xTlEdit").innerHTML='<div class="card"><p>이 선택 기록을 찾을 수 없어요.</p><a class="btn ghost linkbtn" href="#/change/timeline">목록으로</a></div>';
    return;
  }
  tlBaseId=base.id;
  tlItem=tlNorm(deepClone(colFind("timeline",tlId(base.id))),base.id);
  tlMoreOpen=false;
  drawTimelineEdit();
}
function tlRecLine(r){
  return esc(r.date)+' · '+esc(trimTo(r.issue,30))+(r.pick?' · '+esc(trimTo(r.pick,30)):'');
}
function drawTimelineEdit(){
  var base=findRecById(tlBaseId),t=tlItem;
  if(!base)return;
  var cands=tlCandidates(base),candIds=cands.map(function(c){return c.r.id});
  var h='<a class="backlink" href="#/change/timeline">‹ 타임라인 목록</a>'
    +'<div class="card"><h3>지금 살펴보는 선택</h3><p><b>'+esc(base.date)+'</b> · '+(base.mood?moodIcon(base.mood,14)+' '+esc(base.mood):'')+'</p>'
    +'<p>고민: '+esc(base.issue)+'</p>'+(base.pick?'<p style="margin:0">내가 선택한 것: '+esc(base.pick)+'</p>':'')+'</div>';
  h+='<div class="card"><h3>비슷한 과거 기록</h3><p class="hint2">같은 단어, 같은 고민 유형, 같은 가치가 있는 기록을 후보로 보여 드려요. 시간순에 넣을 기록은 내가 골라요.</p><div id="tlCands">';
  if(!cands.length)h+='<p class="hint2" style="margin:0">겹치는 기록이 아직 없어요. 아래에서 직접 고를 수도 있어요.</p>';
  cands.forEach(function(c){
    h+='<label class="sent"><input type="checkbox" data-tl="'+esc(c.r.id)+'"'+(t.links.indexOf(c.r.id)>=0?' checked':'')+'><span>'+tlRecLine(c.r)+'<br><span class="sub2" style="display:inline">'+esc(c.reasons.join(" · "))+'</span></span></label>';
  });
  h+='</div>';
  // 후보에는 없지만 이미 고른 기록과, 직접 고를 수 있는 다른 기록
  var others=load().filter(function(r){return r&&r.id&&r.id!==base.id&&candIds.indexOf(r.id)<0}).slice(0,30);
  var picked=others.filter(function(r){return t.links.indexOf(r.id)>=0});
  if(others.length){
    h+='<button type="button" class="btn ghost" data-act="more" style="margin:8px 0 0">'+(tlMoreOpen?'다른 기록 접기':'다른 기록에서 직접 고르기')+(picked.length?' ('+picked.length+'개 선택)':'')+'</button>';
    if(tlMoreOpen||picked.length&&tlMoreOpen){
      h+='<div id="tlOthers" style="margin-top:8px">'+others.map(function(r){
        return '<label class="sent"><input type="checkbox" data-tl="'+esc(r.id)+'"'+(t.links.indexOf(r.id)>=0?' checked':'')+'><span>'+tlRecLine(r)+'</span></label>';
      }).join("")+'</div>';
    }
  }
  h+='</div>';
  // 시간순 보기
  var entries=[base].concat(t.links.map(findRecById).filter(Boolean));
  entries.sort(function(a,b){return (a.day||"")<(b.day||"")?-1:(a.day||"")>(b.day||"")?1:0});
  h+='<div class="card"><h3>시간순으로 보기</h3>';
  if(entries.length<2)h+='<p class="hint2" style="margin:0">위에서 기록을 고르면 이곳에 시간순으로 놓여요.</p>';
  entries.forEach(function(r){
    var isBase=(r.id===base.id),mk=t.marks[r.id]||"";
    h+='<div class="tlentry'+(isBase?' tlbase':'')+'"><p class="tlhead"><b>'+esc(r.date)+'</b>'+(isBase?' <span class="typetag">지금 살펴보는 선택</span>':'')+(r.mood?' · '+moodIcon(r.mood,13)+' '+esc(r.mood):'')+'</p>'
      +'<p>고민: '+esc(r.issue)+'</p>'
      +(r.crit?'<p>내 기준: '+esc(r.crit)+'</p>':'')
      +(r.vals?'<p>그때 이어 둔 가치: '+esc(String(r.vals).split("|").join(" · "))+'</p>':'')
      +(r.pick?'<p>선택: '+esc(r.pick)+'</p>':'')+(r.why?'<p>이유: '+esc(r.why)+'</p>':'')
      +(r.retro||r.learn?'<p class="hint2" style="margin:0 0 6px">돌아본 느낌: '+esc(r.retro||"")+(r.learn?' — '+esc(r.learn):'')+'</p>':'');
    if(!isBase){
      h+='<p class="hint2" style="margin:6px 0">지금의 내 생각은 이때와</p><div class="chips" style="margin-bottom:6px">'+TL_MARKS.map(function(m){
        return '<button type="button" class="chip'+(mk===m[0]?' on':'')+'" data-act="mark" data-id="'+esc(r.id)+'" data-v="'+m[0]+'" aria-pressed="'+(mk===m[0]?'true':'false')+'">'+m[1]+'</button>';
      }).join("")+'</div>'
        +'<button type="button" class="btn ghost" data-act="unlink" data-id="'+esc(r.id)+'" style="margin:0;min-height:44px">시간순에서 빼기</button>';
    }
    h+='</div>';
  });
  var cc=0,kc=0;t.links.forEach(function(id){if(t.marks[id]==="changed")cc++;else if(t.marks[id]==="kept")kc++});
  if(cc||kc)h+='<p class="hint2" style="margin:8px 0 0">내가 표시한 것: 바뀌었다고 한 기록 '+cc+'개, 그대로라고 한 기록 '+kc+'개</p>';
  h+='</div>';
  h+='<div class="card"><h3>지금의 관점</h3><label for="tlCurrent">이 고민에 대해 지금은 어떻게 생각하나요?</label><textarea id="tlCurrent">'+esc(t.current)+'</textarea>'
    +'<p class="hint2" id="tlState" aria-live="polite" style="margin:0">'+(colFind("timeline",tlId(base.id))?"적으면 자동으로 저장돼요.":"기록을 고르거나 한 줄이라도 적으면 자동으로 저장돼요.")+'</p></div>';
  var tq=timelineQuestions(t);
  if(tq.length)h+='<div class="card"><h3>이런 질문은 어때요?</h3><p class="hint2">내가 표시한 것을 바탕으로 한 질문이에요. 답은 정해져 있지 않아요.</p>'+suggestHtml(tq,false)+'</div>';
  if(colFind("timeline",tlId(base.id)))h+='<button type="button" class="btn dangerbtn" data-act="del">이 타임라인 지우기 (기록은 그대로 남아요)</button>';
  $("xTlEdit").innerHTML=h;
}
function tlSync(){
  if(!tlItem||!$("tlCurrent"))return;
  tlItem.current=$("tlCurrent").value;
  var links=[];
  Array.prototype.forEach.call(document.querySelectorAll("#xTlEdit input[data-tl]"),function(c){if(c.checked&&links.indexOf(c.getAttribute("data-tl"))<0)links.push(c.getAttribute("data-tl"))});
  // 화면에 없는 기록(이미 고른 것)은 그대로 둔다
  var shown={};
  Array.prototype.forEach.call(document.querySelectorAll("#xTlEdit input[data-tl]"),function(c){shown[c.getAttribute("data-tl")]=1});
  tlItem.links.forEach(function(id){if(!shown[id]&&links.indexOf(id)<0)links.push(id)});
  tlItem.links=links;
  Object.keys(tlItem.marks).forEach(function(id){if(links.indexOf(id)<0)delete tlItem.marks[id]});
}
function saveTimeline(){
  if(!tlItem)return;
  tlSync();
  var exists=!!colFind("timeline",tlItem.id);
  if(!exists&&!tlHasContent(tlItem))return;
  tlItem.at=new Date().toISOString();
  sayTo("tlState",colUpsert("timeline",deepClone(tlItem))?"저장했어요.":"저장하지 못했어요. 적은 내용은 그대로예요.");
}
function bindTimeline(){
  var box=$("xTlEdit");
  box.addEventListener("input",function(e){
    if(e.target&&e.target.id==="tlCurrent"){sayTo("tlState","적는 중이에요…");tlSync();scheduleForm(saveTimeline)}
  });
  box.addEventListener("change",function(e){
    if(e.target&&e.target.type==="checkbox"&&e.target.hasAttribute("data-tl")){
      tlSync();drawTimelineEdit();scheduleForm(saveTimeline);
    }
  });
  box.addEventListener("click",function(e){
    var t=e.target.closest?e.target.closest("button[data-act]"):null;
    if(!t||!box.contains(t)||!tlItem)return;
    var act=t.getAttribute("data-act");
    tlSync();
    if(act==="more"){tlMoreOpen=!tlMoreOpen;drawTimelineEdit();return}
    if(act==="mark"){
      var id=t.getAttribute("data-id"),v=t.getAttribute("data-v");
      if(tlItem.marks[id]===v)delete tlItem.marks[id];else tlItem.marks[id]=v;
      drawTimelineEdit();scheduleForm(saveTimeline);return;
    }
    if(act==="unlink"){
      var rid=t.getAttribute("data-id"),i=tlItem.links.indexOf(rid);
      if(i>=0)tlItem.links.splice(i,1);
      delete tlItem.marks[rid];
      drawTimelineEdit();scheduleForm(saveTimeline);return;
    }
    if(act==="del"){
      if(!confirm("이 타임라인을 지울까요? 선택 기록은 그대로 남아요."))return;
      if(!colRemove("timeline",tlItem.id)){alert("저장하지 못했어요. 시크릿 탭이 아닌 곳에서 다시 시도해 주세요.");return}
      tlItem=null;go("/change/timeline");
    }
  });
}
