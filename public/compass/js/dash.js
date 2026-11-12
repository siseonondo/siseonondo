// ---- 자기이해 대시보드 ----
// 쌓인 기록을 숫자와 간단한 막대로만 보여 준다. 점수·등급·진단·달성률은 만들지 않고, 기록이 적으면 "아직 충분하지 않아요"라고 말한다.
var DASH_MIN=3;

function dashEmpty(msg){return '<p class="hint2" style="margin:0">'+esc(msg||"아직 충분한 기록이 없습니다. 기록이 조금 더 쌓이면 보여 드릴게요.")+'</p>'}
function dashBars(pairs,colorFn){
  var max=1;pairs.forEach(function(p){if(p[1]>max)max=p[1]});
  return '<div class="dist">'+pairs.map(function(p){
    return '<div class="row" style="grid-template-columns:104px 1fr 26px"><span class="lab">'+(p[2]||"")+esc(p[0])+'</span><span class="track"><i style="width:'+Math.round(p[1]/max*100)+'%;background:'+(colorFn?colorFn(p[0]):"var(--sage)")+'"></i></span><span class="num">'+p[1]+'</span></div>';
  }).join("")+'</div>';
}
// 기간 안의 감정 수: 기분 체크 + 선택 기록의 기분(달력의 월별 분포와 같은 방식)
function moodCountsIn(map,start,end){
  var counts={},total=0;
  Object.keys(map).forEach(function(day){
    if(day<start||day>end)return;
    var info=map[day];
    if(info.mood&&info.mood.mood){counts[info.mood.mood]=(counts[info.mood.mood]||0)+1;total++}
    info.recs.forEach(function(x){if(x.r.mood){counts[x.r.mood]=(counts[x.r.mood]||0)+1;total++}});
  });
  return {counts:counts,total:total};
}
function moodPairs(counts){
  var labels=MOODS.map(function(m){return m[0]}),k;
  for(k in counts){if(labels.indexOf(k)<0)labels.push(k)}
  return labels.filter(function(l){return counts[l]}).map(function(l){return [l,counts[l],moodIcon(l,14)]});
}
function monthBounds(offset){
  var d=parseDay(todayStr()),f=new Date(d.getFullYear(),d.getMonth()+offset,1),s=strDate(f);
  return {start:s,end:monthEndOf(s),n:(f.getMonth()+1)};
}

function dashFlow(map){
  var t=todayStr(),days=[],i,filled=0;
  for(i=29;i>=0;i--)days.push(addDaysStr(t,-i));
  var cells=days.map(function(day){
    var info=map[day],labels=info?info.labels:[];
    if(labels.length)filled++;
    var tip=fmtMD(day)+(labels.length?" · "+labels.join(", "):" · 기록 없음");
    return '<span class="dcell'+(labels.length?'':' none')+'" title="'+esc(tip)+'" aria-label="'+esc(tip)+'">'+(labels.length?moodIcon(labels[0],14):'')+'<small>'+(+day.slice(8,10))+'</small></span>';
  });
  if(filled<DASH_MIN)return dashEmpty();
  return '<p class="hint2" style="margin-top:0">최근 30일 중 감정을 남긴 날은 '+filled+'일이에요. 빈칸은 기록이 없는 날이에요.</p><div class="dstrip" role="img" aria-label="최근 30일 감정 기록">'+cells.join("")+'</div>';
}
function dashKinds(recs){
  var counts={},withKind=0,none=0;
  recs.forEach(function(r){if(r.kind){counts[r.kind]=(counts[r.kind]||0)+1;withKind++}else none++});
  if(withKind<DASH_MIN)return dashEmpty();
  var pairs=Object.keys(counts).map(function(k){return [k,counts[k]]}).sort(function(a,b){return b[1]-a[1]});
  return dashBars(pairs)+(none?'<p class="hint2" style="margin:8px 0 0">고민 유형이 남아 있지 않은 기록 '+none+'개는 포함하지 않았어요.</p>':'');
}
function dashValues(recs){
  var vs=sload("values"),core=(vs&&Array.isArray(vs.core))?vs.core:[],used={},withVals=0;
  recs.forEach(function(r){
    var v=r.vals?String(r.vals).split("|").filter(Boolean):[];
    if(v.length)withVals++;
    v.forEach(function(x){used[x]=(used[x]||0)+1});
  });
  var h="";
  if(core.length){
    h+='<p class="hrow"><b>내가 정한 핵심 가치</b></p>'+dashBars(core.map(function(c){return [strOf(c&&c.label),used[strOf(c&&c.label)]||0]}).filter(function(p){return p[0]}))
      +'<p class="hint2" style="margin:6px 0 0">오른쪽 숫자는 그 가치를 이어 둔 선택 기록의 수예요.</p>';
  }else{
    h+='<p class="hint2" style="margin:0 0 8px">아직 정한 핵심 가치가 없어요. <a href="#/values">나의 기준</a>에서 정할 수 있어요.</p>';
  }
  if(withVals>=DASH_MIN){
    var top=Object.keys(used).map(function(k){return [k,used[k]]}).sort(function(a,b){return b[1]-a[1]}).slice(0,5);
    h+='<p class="hrow" style="margin-top:12px"><b>선택 기록에 이어 둔 가치</b></p>'+dashBars(top);
  }
  return h;
}
function dashCounts(recs){
  var t=todayStr(),cm=monthBounds(0),lm=monthBounds(-1);
  function n(a,b){return recs.filter(function(r){return validDay(r.day)&&r.day>=a&&r.day<=b}).length}
  return '<p class="hrow">모두 <b>'+recs.length+'</b>개 · '+cm.n+'월 <b>'+n(cm.start,cm.end)+'</b>개 · '+lm.n+'월 <b>'+n(lm.start,lm.end)+'</b>개</p>';
}
function dashRetro(recs){
  var retro=recs.filter(function(r){return strOf(r.retro).trim()}).length,learn=recs.filter(function(r){return strOf(r.learn).trim()}).length;
  var rv=sload("reviews").filter(function(r){return r&&(strOf(r.changed).trim()||strOf(r.nextQ).trim())}).length;
  if(!recs.length&&!rv)return dashEmpty();
  return '<p class="hrow">돌아본 느낌을 남긴 선택 기록 <b>'+retro+'</b>개</p><p class="hrow">배운 점을 적은 선택 기록 <b>'+learn+'</b>개</p><p class="hrow">주간·월간 회고를 쓴 기간 <b>'+rv+'</b>개</p>';
}
function dashPlans(){
  var cnt={},total=0;
  sload("plans").forEach(function(p){if(p&&typeof p.id==="string"){var s=planNorm(p).status;cnt[s]=(cnt[s]||0)+1;total++}});
  if(!total)return dashEmpty("아직 만든 실행 계획이 없습니다.");
  return '<p class="hrow">'+PLAN_STATUS.filter(function(p){return cnt[p[0]]}).map(function(p){return esc(p[1])+" <b>"+cnt[p[0]]+"</b>"}).join(" · ")+'</p><p class="hint2" style="margin:0">계획의 상태를 있는 그대로 센 것이에요.</p>';
}
function dashCompare(map){
  var cm=monthBounds(0),lm=monthBounds(-1),a=moodCountsIn(map,cm.start,cm.end),b=moodCountsIn(map,lm.start,lm.end);
  if(a.total+b.total<DASH_MIN||!a.total||!b.total)return dashEmpty("이번 달과 지난 달에 감정 기록이 모두 있고 합쳐서 "+DASH_MIN+"개 이상이면 비교해 보여 드려요.");
  return '<p class="hrow"><b>'+lm.n+'월</b> · 감정 기록 '+b.total+'개</p>'+dashBars(moodPairs(b.counts),function(l){return moodStyle(l).c})
    +'<p class="hrow" style="margin-top:12px"><b>'+cm.n+'월</b> · 감정 기록 '+a.total+'개</p>'+dashBars(moodPairs(a.counts),function(l){return moodStyle(l).c})
    +'<p class="hint2" style="margin:8px 0 0">두 달의 분포를 나란히 놓았을 뿐이에요. 어떤 의미인지는 내가 정해요.</p>';
}

function renderDash(){
  var recs=load().filter(function(r){return r&&typeof r==="object"}),map=buildDayMap();
  var h='<a class="backlink" href="#/change">‹ 나의 변화</a>'
    +'<p class="hint2">쌓인 기록을 숫자와 막대로만 보여 드려요. 점수나 평가는 하지 않아요.</p>';
  function card(t,body){return '<div class="card"><h3>'+t+'</h3>'+body+'</div>'}
  h+=card("선택 기록 수",dashCounts(recs));
  h+=card("감정 흐름",dashFlow(map));
  h+=card("고민 유형",dashKinds(recs));
  h+=card("주요 가치",dashValues(recs));
  h+=card("회고 기록",dashRetro(recs));
  h+=card("실행 계획의 상태",dashPlans());
  h+=card("지난 달과 이번 달의 감정",dashCompare(map));
  $("xDash").innerHTML=h;
}
