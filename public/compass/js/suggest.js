// ---- 질문 추천 · 다음에 해 볼 일 (규칙 기반) ----
// 내 기록에서 반복된 단어, 고민 유형, 가치, 감정을 고정된 문장 틀에 넣어 질문을 만든다. 질문마다 근거(사실)를 함께 적고, 의미는 해석하지 않는다.
// 서버나 AI를 쓰지 않고, 기록은 이 기기 밖으로 나가지 않는다. 기록이 적으면 만들지 않는다.
var SUGGEST_MIN=3;

function suggestQuestions(start,end){
  var items=buildFeed().filter(function(it){return it.day&&it.day>=start&&it.day<=end});
  var recs=load().filter(function(r){return r&&validDay(r.day)&&r.day>=start&&r.day<=end});
  var out=[];
  if(items.length<SUGGEST_MIN)return out;
  // 1) 반복된 단어
  var rw=repeatedWords(items);
  if(rw.length)out.push({q:"자주 나온 말이 있어요: “"+rw[0].w+"”. 이 말은 나에게 어떤 뜻인가요?",why:"“"+rw[0].w+"” — "+rw[0].n+"개의 기록에 나왔어요."});
  // 2) 반복된 고민 유형
  var kinds={};recs.forEach(function(r){if(r.kind)kinds[r.kind]=(kinds[r.kind]||0)+1});
  var kk=Object.keys(kinds).sort(function(a,b){return kinds[b]-kinds[a]});
  if(kk.length&&kinds[kk[0]]>=2)out.push({q:"“"+kk[0]+"” 유형의 고민이 여러 번 있었어요. 그때마다 내가 중요하게 본 기준은 같았나요?",why:"“"+kk[0]+"” 유형으로 남긴 선택 기록이 "+kinds[kk[0]]+"개예요."});
  // 3) 반복된 감정
  var mc=moodCountsIn(buildDayMap(),start,end),mk=Object.keys(mc.counts).sort(function(a,b){return mc.counts[b]-mc.counts[a]});
  if(mk.length&&mc.counts[mk[0]]>=3)out.push({q:"“"+mk[0]+"” 감정이 이 기간에 자주 있었어요. 그 감정이 나올 때 공통으로 있던 일은 무엇인가요?",why:"“"+mk[0]+"” — "+mc.counts[mk[0]]+"번 기록됐어요."});
  // 4) 이어 둔 가치
  var vc={};recs.forEach(function(r){String(r.vals||"").split("|").forEach(function(v){if(v)vc[v]=(vc[v]||0)+1})});
  var vk=Object.keys(vc).sort(function(a,b){return vc[b]-vc[a]});
  if(vk.length&&vc[vk[0]]>=2)out.push({q:"“"+vk[0]+"” 가치를 이어 둔 선택이 여러 개예요. 최근 선택에서 이 가치는 어떻게 드러났나요?",why:"“"+vk[0]+"” — 이어 둔 선택 기록이 "+vc[vk[0]]+"개예요."});
  return out.slice(0,3);
}
function suggestHtml(list,withBtn){
  return list.map(function(s,i){
    return '<div class="sugg"><p class="hrow" style="margin-bottom:2px"><b>'+esc(s.q)+'</b></p><p class="hint2" style="margin:0 0 6px">근거: '+esc(s.why)+'</p>'
      +(withBtn?'<button type="button" class="btn ghost" data-sugg="'+i+'" style="margin:0 0 10px;min-height:44px">다음 질문 칸에 넣기</button>':'')+'</div>';
  }).join("");
}

// 타임라인에서 내가 표시한 개수를 바탕으로 묻는 질문(표시가 있을 때만)
function timelineQuestions(t){
  var c=0,k=0,out=[];
  Object.keys(t.marks).forEach(function(id){if(t.marks[id]==="changed")c++;else if(t.marks[id]==="kept")k++});
  if(c)out.push({q:"“바뀌었어요”라고 표시한 기록이 "+c+"개예요. 무엇이 생각을 바꾸게 했나요?",why:"내가 직접 표시한 기록 수예요."});
  if(k)out.push({q:"“그대로예요”라고 표시한 기록이 "+k+"개예요. 변하지 않은 것은 나에게 어떤 의미인가요?",why:"내가 직접 표시한 기록 수예요."});
  return out;
}

// 나의 변화 허브에 보여 줄 '다음에 해 볼 수 있는 일'(최대 2개, 알림이나 점수 없음)
function nextSteps(){
  var out=[],n=load().length,due=dueCandidates().length;
  if(!n)return out;
  if(due)out.push({text:"돌아볼 시점이 된 선택이 "+due+"개 있어요.",href:"#/choice",label:"선택 탭에서 보기"});
  var cm=monthBounds(0),cnt=feedInPeriod({start:cm.start,end:cm.end}).length,rvKey="m-"+cm.start.slice(0,7),rv=colFind("reviews",rvKey);
  if(cnt>=REVIEW_MIN&&!(rv&&(strOf(rv.changed).trim()||strOf(rv.nextQ).trim())))out.push({text:"이번 달 기록이 "+cnt+"개 쌓였어요. 이번 달 회고를 써 볼 수 있어요.",href:"#/change/reviews/"+rvKey,label:"회고 쓰기"});
  var hasTl=sload("timeline").some(function(t){return t&&typeof t.baseId==="string"});
  if(!hasTl&&n>=2)out.push({text:"마음에 걸리는 선택이 있다면 비슷한 과거 기록과 나란히 놓아 볼 수 있어요.",href:"#/change/timeline",label:"타임라인 만들기"});
  return out.slice(0,2);
}
