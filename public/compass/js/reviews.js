// ---- 나의 변화 허브 · 주간·월간 회고 ----
// 기간을 골라 그 기간의 기록을 모아 보고, 달라진 생각과 다음에 살펴볼 질문을 직접 쓴다.
// 요약은 규칙 기반이고 원문을 그대로 인용한다. 기록이 적으면 요약을 만들지 않는다.
var REVIEW_MIN=3;          // 이 기간의 기록이 이보다 적으면 요약하지 않는다
var rvPeriod=null;         // 편집 중인 기간
var rvSugg=[];             // 이 기간에 보여 준 추천 질문

function strDate(d){return d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate())}
function addDaysStr(s,n){var d=parseDay(s);d.setDate(d.getDate()+n);return strDate(d)}
function weekStartOf(s){var d=parseDay(s);d.setDate(d.getDate()-((d.getDay()+6)%7));return strDate(d)}   // 월요일 시작
function monthEndOf(start){var d=parseDay(start);return strDate(new Date(d.getFullYear(),d.getMonth()+1,0))}
function validDate(s){var d=parseDay(s);return !!d&&strDate(d)===s}
// 주소에 쓰는 기간 번호: w-2026-11-09(그 주의 월요일) 또는 m-2026-11
function periodFromKey(key){
  var m=/^w-(\d{4}-\d{2}-\d{2})$/.exec(key||"");
  if(m&&validDate(m[1])){var s=weekStartOf(m[1]);return {key:"w-"+s,kind:"week",start:s,end:addDaysStr(s,6)}}
  m=/^m-(\d{4})-(\d{2})$/.exec(key||"");
  if(m){var s2=m[1]+"-"+m[2]+"-01";if(validDate(s2))return {key:"m-"+m[1]+"-"+m[2],kind:"month",start:s2,end:monthEndOf(s2)}}
  return null;
}
function periodTitle(p){
  if(p.kind==="week")return fmtMD(p.start)+" ~ "+fmtMD(p.end);
  return p.start.slice(0,4)+"년 "+(+p.start.slice(5,7))+"월";
}
function shiftPeriod(p,dir){
  if(p.kind==="week")return "w-"+addDaysStr(p.start,7*dir);
  var d=parseDay(p.start);d.setMonth(d.getMonth()+dir);
  return "m-"+d.getFullYear()+"-"+p2(d.getMonth()+1);
}
function currentPeriods(){
  var t=todayStr(),ws=weekStartOf(t),d=parseDay(t);
  var lm=new Date(d.getFullYear(),d.getMonth()-1,1);
  return [
    {rel:"이번 주",key:"w-"+ws},
    {rel:"지난 주",key:"w-"+addDaysStr(ws,-7)},
    {rel:"이번 달",key:"m-"+d.getFullYear()+"-"+p2(d.getMonth()+1)},
    {rel:"지난 달",key:"m-"+lm.getFullYear()+"-"+p2(lm.getMonth()+1)}
  ];
}
function feedInPeriod(p){
  return buildFeed().filter(function(it){return it.day&&it.day>=p.start&&it.day<=p.end});
}
function getReview(key){
  var r=colFind("reviews",key);
  return {changed:r?strOf(r.changed):"",nextQ:r?strOf(r.nextQ):""};
}

// ---- 규칙 기반 요약 ----
var STOPWORDS={"그리고":1,"그래서":1,"그런데":1,"너무":1,"정말":1,"같아요":1,"있어요":1,"없어요":1,"하는":1,"한다":1,"할까":1,"해요":1,"합니다":1,"이번":1,"오늘":1,"내가":1,"나는":1,"하기":1,"하고":1,"해야":1,"어떻게":1,"무엇":1,"때문":1};
var PARTICLE=/(으로|에서|에게|하고|이랑|처럼|까지|부터|은|는|이|가|을|를|의|에|도|로|와|과|만)$/;
function wordsOf(text){
  var out=[];
  String(text||"").split(/[^가-힣A-Za-z0-9]+/).forEach(function(w){
    if(w.length<2)return;
    if(w.length>=3)w=w.replace(PARTICLE,"");
    if(w.length<2||STOPWORDS[w]||/^\d+$/.test(w))return;
    if(out.indexOf(w)<0)out.push(w);
  });
  return out;
}
// 여러 기록에 나온 단어: 단어가 나온 기록 수와 원문 한 줄. 의미는 해석하지 않는다.
function repeatedWords(items){
  var map={};
  items.forEach(function(it,k){
    if(it.type==="mood"||it.type==="q")return;
    var seen={};
    wordsOf(it.title+" "+(it.wtext||it.text)).forEach(function(w){
      if(seen[w])return;seen[w]=1;
      if(!map[w])map[w]={w:w,n:0,quote:""};
      map[w].n++;
      if(!map[w].quote||it.title.length<map[w].quote.length)map[w].quote=it.title;
    });
  });
  var list=[];for(var w in map){if(map[w].n>=2)list.push(map[w])}
  list.sort(function(a,b){return b.n-a.n||b.w.length-a.w.length});
  return list.slice(0,5);
}
function summarizeItems(items){
  var byType={},moods={},vals={},i;
  items.forEach(function(it){
    byType[it.type]=(byType[it.type]||0)+1;
    if(it.mood)moods[it.mood]=(moods[it.mood]||0)+1;
    it.vals.forEach(function(v){if(v)vals[v]=(vals[v]||0)+1});
  });
  var planStat={};
  sload("plans").forEach(function(p){
    if(!p||typeof p.id!=="string")return;
    var n=planNorm(p);
    if(items.some(function(it){return it.type==="plan"&&it.id===n.id}))planStat[n.status]=(planStat[n.status]||0)+1;
  });
  return {byType:byType,moods:moods,vals:vals,planStat:planStat,words:repeatedWords(items)};
}
function summaryHtml(items){
  var s=summarizeItems(items),h='<p><b>남긴 기록</b> · 모두 '+items.length+'개</p><p class="hint2" style="margin-top:-6px">'
    +FEED_TYPES.filter(function(t){return s.byType[t[0]]}).map(function(t){return esc(t[1])+" "+s.byType[t[0]]}).join(" · ")+'</p>';
  var moodList=MOODS.map(function(m){return m[0]}).filter(function(l){return s.moods[l]});
  if(moodList.length){
    h+='<p><b>이 기간에 기록한 감정</b></p><div class="dist">'+moodList.map(function(l){
      return '<div class="row" style="grid-template-columns:104px 1fr 26px"><span class="lab">'+moodIcon(l,14)+esc(l)+'</span><span class="track"><i style="width:'+Math.round(s.moods[l]/Math.max.apply(null,moodList.map(function(x){return s.moods[x]}))*100)+'%;background:'+moodStyle(l).c+'"></i></span><span class="num">'+s.moods[l]+'</span></div>';
    }).join("")+'</div>';
  }
  if(s.words.length){
    h+='<p><b>여러 기록에 나온 단어</b></p><p class="hint2" style="margin-top:-6px">단어가 여러 번 나왔다는 사실만 보여 드려요. 어떤 뜻인지는 직접 살펴보세요.</p>'
      +s.words.map(function(w){return '<p class="hrow"><b>“'+esc(w.w)+'”</b> · '+w.n+'개의 기록 — <span class="quote">“'+esc(trimTo(w.quote,40))+'”</span></p>'}).join("");
  }
  // 처음과 마지막 선택 기록(원문 그대로)
  var recItems=items.filter(function(it){return it.type==="rec"&&it.day}).sort(function(a,b){return a.day<b.day?-1:a.day>b.day?1:0});
  if(recItems.length>=2){
    var f=recItems[0],l=recItems[recItems.length-1];
    h+='<p><b>이 기간의 첫 선택과 마지막 선택</b></p><p class="hrow">'+esc(fmtMD(f.day))+' — <span class="quote">“'+esc(trimTo(f.title,40))+'”</span></p><p class="hrow">'+esc(fmtMD(l.day))+' — <span class="quote">“'+esc(trimTo(l.title,40))+'”</span></p>';
  }
  // 내 기준에 자주 나온 말(직접 쓴 '내 기준' 글만 센다)
  var recAll=load(),cw={};
  items.forEach(function(it){
    if(it.type!=="rec"||!recAll[it.idx])return;
    wordsOf(recAll[it.idx].crit).forEach(function(w){cw[w]=(cw[w]||0)+1});
  });
  var cwk=Object.keys(cw).filter(function(w){return cw[w]>=2}).sort(function(a,b){return cw[b]-cw[a]}).slice(0,4);
  if(cwk.length)h+='<p><b>내 기준에 자주 나온 말</b></p><p class="hrow">'+cwk.map(function(w){return '“'+esc(w)+'” '+cw[w]+'개'}).join(" · ")+'</p>';
  var vl=Object.keys(s.vals);
  if(vl.length){
    h+='<p><b>이어 둔 가치</b></p><p class="hrow">'+vl.sort(function(a,b){return s.vals[b]-s.vals[a]}).map(function(v){return esc(v)+" "+s.vals[v]}).join(" · ")+'</p>';
  }
  var pl=PLAN_STATUS.filter(function(p){return s.planStat[p[0]]});
  if(pl.length){
    h+='<p><b>실행 계획의 상태</b></p><p class="hrow">'+pl.map(function(p){return esc(p[1])+" "+s.planStat[p[0]]}).join(" · ")+'</p>';
  }
  return h;
}

// ---- 화면 ----
function renderChange(sub,key){
  $("xHub").classList.toggle("on",sub==="hub");
  $("xRevList").classList.toggle("on",sub==="revList");
  $("xRevEdit").classList.toggle("on",sub==="revEdit");
  $("xTlList").classList.toggle("on",sub==="tlList");
  $("xTlEdit").classList.toggle("on",sub==="tlEdit");
  $("xDash").classList.toggle("on",sub==="dash");
  $("xReport").classList.toggle("on",sub==="report");
  if(sub==="hub")renderChangeHub();
  else if(sub==="revList")renderReviewList();
  else if(sub==="tlList")renderTimelineList();
  else if(sub==="tlEdit")renderTimelineEdit(key);
  else if(sub==="dash")renderDash();
  else if(sub==="report")renderReport();
  else renderReviewEdit(key);
}
function renderChangeHub(){
  var n=load().length;
  $("xInfo").textContent=n?"지금까지 선택 기록이 "+n+"개 쌓였어요. 이 기록은 그대로 이어져요.":"선택을 기록하면 이곳에서 변화를 살펴볼 수 있어요.";
  var steps=nextSteps();
  $("xNext").innerHTML=steps.length?'<div class="card"><h3>다음에 해 볼 수 있는 일</h3>'+steps.map(function(s){
    return '<p class="hrow">'+esc(s.text)+' <a href="'+s.href+'">'+esc(s.label)+' ›</a></p>';
  }).join("")+'<p class="hint2" style="margin:0">하지 않아도 괜찮아요.</p></div>':"";
  var t=todayStr(),qs=suggestQuestions(addDaysStr(t,-29),t);
  $("xSugg").innerHTML=qs.length?'<div class="card"><h3>이런 질문은 어때요?</h3><p class="hint2">최근 30일의 내 기록에서 반복된 것을 바탕으로 한 질문이에요. 답은 정해져 있지 않아요.</p>'+suggestHtml(qs,false)+'</div>':"";
}
function renderReviewList(){
  var h='<a class="backlink" href="#/change">‹ 나의 변화</a>'
    +'<p class="hint2">한 주나 한 달의 기록을 모아 보고, 달라진 생각을 직접 적어 두는 곳이에요. 쓰지 않아도 괜찮아요.</p>';
  h+=currentPeriods().map(function(c){
    var p=periodFromKey(c.key),n=feedInPeriod(p).length,rv=getReview(c.key),written=!!(rv.changed.trim()||rv.nextQ.trim());
    return '<a class="card slink" href="#/change/reviews/'+c.key+'"><b>'+esc(c.rel)+' <span class="sub2" style="display:inline">'+esc(periodTitle(p))+'</span></b>'
      +'<span>기록 '+n+'개</span><span class="sub2">'+(written?"회고를 적어 두었어요":"아직 쓰지 않았어요")+'</span></a>';
  }).join("");
  var saved=sload("reviews").filter(function(r){return r&&typeof r.id==="string"&&(strOf(r.changed).trim()||strOf(r.nextQ).trim())&&periodFromKey(r.id)})
    .sort(function(a,b){return a.id<b.id?1:a.id>b.id?-1:0});
  var curKeys=currentPeriods().map(function(c){return c.key}),older=saved.filter(function(r){return curKeys.indexOf(r.id)<0});
  if(older.length){
    h+='<h3 class="hsec">지난 회고</h3>'+older.map(function(r){
      var p=periodFromKey(r.id);
      return '<a class="card slink" href="#/change/reviews/'+r.id+'"><b>'+esc(periodTitle(p))+' <span class="sub2" style="display:inline">'+(p.kind==="week"?"주간":"월간")+'</span></b>'
        +(strOf(r.changed).trim()?'<span>달라진 생각: '+esc(trimTo(r.changed,60))+'</span>':'')+'</a>';
    }).join("");
  }
  $("xRevList").innerHTML=h;
}
function renderReviewEdit(key){
  var p=periodFromKey(key);
  if(!p){
    rvPeriod=null;
    $("xRevEdit").innerHTML='<div class="card"><p>이 기간을 찾을 수 없어요.</p><a class="btn ghost linkbtn" href="#/change/reviews">목록으로</a></div>';
    return;
  }
  rvPeriod=p;
  var items=feedInPeriod(p),rv=getReview(p.key),recs=load();
  var h='<a class="backlink" href="#/change/reviews">‹ 회고 목록</a>'
    +'<div class="pnav"><a class="btn ghost linkbtn" href="#/change/reviews/'+shiftPeriod(p,-1)+'">‹ 이전</a><b>'+esc(periodTitle(p))+'</b><a class="btn ghost linkbtn" href="#/change/reviews/'+shiftPeriod(p,1)+'">다음 ›</a></div>';
  h+='<div class="card"><h3>이 기간의 모아 보기</h3>';
  if(items.length<REVIEW_MIN){
    h+='<p>이 기간에 남긴 기록은 '+items.length+'개예요.</p><p class="hint2" style="margin:0">기록이 조금 더 쌓이면 모아서 보여 드릴게요. 지금은 기록을 그대로 볼 수 있어요.</p>';
  }else{
    h+=summaryHtml(items);
  }
  h+='</div>';
  h+='<div class="card"><h3>이 기간의 기록</h3>';
  if(!items.length)h+='<p class="hint2" style="margin:0">이 기간에는 남긴 기록이 없어요.</p>';
  else{
    h+=items.slice(0,30).map(function(it){
      var date=fmtMD(it.day),head='<span class="typetag">'+esc(typeName(it.type))+'</span> <span class="sub2" style="display:inline">'+esc(date)+'</span><b>'+esc(trimTo(it.title,50))+'</b>';
      if(it.type==="rec")return '<button type="button" class="slink rvopen" data-i="'+it.idx+'">'+head+'</button>';
      var href=it.href||(it.type==="mood"?"#/records":"#/records/questions");
      return '<a class="slink" href="'+href+'">'+head+'</a>';
    }).join("")+(items.length>30?'<p class="hint2" style="margin:8px 0 0">그 밖에 '+(items.length-30)+'개의 기록이 더 있어요. 보관함의 기간 필터에서 볼 수 있어요.</p>':'');
  }
  h+='</div>';
  h+='<div class="card"><h3>나의 회고</h3><p class="hint2">적으면 자동으로 저장돼요. 적지 않아도 괜찮아요.</p>'
    +'<label for="rvChanged">이 기간에 달라진 생각이 있나요?</label><textarea id="rvChanged">'+esc(rv.changed)+'</textarea>'
    +'<label for="rvNext">다음 기간에 살펴보고 싶은 질문은 무엇인가요?</label><textarea id="rvNext">'+esc(rv.nextQ)+'</textarea>'
    +'<p class="hint2" id="rvState" aria-live="polite" style="margin:0"></p></div>';
  rvSugg=suggestQuestions(p.start,p.end);
  if(rvSugg.length)h+='<div class="card"><h3>이런 질문은 어때요?</h3><p class="hint2">이 기간의 내 기록에서 반복된 것을 바탕으로 한 질문이에요. 마음에 들면 위의 질문 칸에 넣을 수 있어요.</p>'+suggestHtml(rvSugg,true)+'</div>';
  $("xRevEdit").innerHTML=h;
}
function saveReview(){
  var p=rvPeriod;
  if(!p||!$("rvChanged"))return;
  var changed=$("rvChanged").value,nextQ=$("rvNext").value,cur=colFind("reviews",p.key);
  if(!cur&&!changed.trim()&&!nextQ.trim())return;
  var item=cur?copyRec(cur):{id:p.key};
  item.id=p.key;item.kind=p.kind;item.start=p.start;item.end=p.end;item.changed=changed;item.nextQ=nextQ;item.at=new Date().toISOString();
  sayTo("rvState",colUpsert("reviews",item)?"저장했어요.":"저장하지 못했어요. 적은 내용은 그대로예요.");
}
function bindReviews(){
  var box=$("xRevEdit");
  box.addEventListener("input",function(e){
    if(e.target&&e.target.tagName==="TEXTAREA"){sayTo("rvState","적는 중이에요…");scheduleForm(saveReview)}
  });
  box.addEventListener("click",function(e){
    var sb=e.target.closest?e.target.closest("button[data-sugg]"):null;
    if(sb&&box.contains(sb)){
      var s=rvSugg[+sb.getAttribute("data-sugg")],ta=$("rvNext");
      if(s&&ta){
        ta.value=ta.value.trim()?ta.value.replace(/\s+$/,"")+"\n"+s.q:s.q;
        sayTo("rvState","질문을 넣었어요. 자유롭게 고쳐 쓸 수 있어요.");scheduleForm(saveReview);
      }
      return;
    }
    var t=e.target.closest?e.target.closest("button.rvopen"):null;
    if(!t||!box.contains(t))return;
    flushForm();
    openRecord(+t.getAttribute("data-i"));
  });
}
