// ---- 감정 캘린더 ----
// 날짜별 감정은 '오늘 내 기분' 체크(compass_moods)와 선택 기록(compass_records)의 기분을 함께 모아 보여 준다.
// 감정에는 좋고 나쁨을 붙이지 않는다. 기록이 없는 날은 빈칸으로 둔다.
var calY=null,calM=null,calSel=null;

// 날짜별 자료: {mood: 그날 기분 체크 또는 null, labels: [그날의 감정들], recs: [기록], q: 질문 항목 또는 null}
function buildDayMap(){
  var map={},list=load(),moods=sload("moods"),qs=sload("questions"),i,d,r;
  function get(day){return map[day]||(map[day]={mood:null,labels:[],recs:[],q:null})}
  function addLabel(o,label){if(label&&o.labels.indexOf(label)<0)o.labels.push(label)}
  for(i=0;i<moods.length;i++){
    r=moods[i];
    if(r&&validDay(r.day)){d=get(r.day);d.mood=r;addLabel(d,r.mood)}
  }
  for(i=0;i<list.length;i++){
    r=list[i];
    if(r&&validDay(r.day)){d=get(r.day);d.recs.push({r:r,i:i});addLabel(d,r.mood)}
  }
  for(i=0;i<qs.length;i++){
    r=qs[i];
    if(r&&validDay(r.day)&&r.answer){d=get(r.day);d.q=r}
  }
  return map;
}
function calKey(y,m,d){return y+"-"+p2(m+1)+"-"+p2(d)}

function renderCalendar(){
  var box=$("rCal"),now=new Date();
  if(calY===null){calY=now.getFullYear();calM=now.getMonth()}
  var map=buildDayMap(),today=todayStr();
  var first=new Date(calY,calM,1),startDow=first.getDay(),days=new Date(calY,calM+1,0).getDate();
  var h='<div class="calhead"><button type="button" id="calPrev" aria-label="이전 달">‹</button><b>'+calY+'년 '+(calM+1)+'월</b><button type="button" id="calNext" aria-label="다음 달">›</button></div>';
  h+='<div class="calgrid" role="grid">';
  for(var w=0;w<7;w++)h+='<div class="caldow">'+DOW[w]+'</div>';
  for(var b=0;b<startDow;b++)h+='<div class="calcell blank"></div>';
  var monthRecs=0;
  for(var d=1;d<=days;d++){
    var key=calKey(calY,calM,d),info=map[key],cls="calcell"+(key===today?" today":"")+(key===calSel?" sel":"");
    var icons="",aria=(calM+1)+"월 "+d+"일";
    if(info){
      if(info.labels.length){
        icons=info.labels.slice(0,3).map(function(l){return moodIcon(l,14)}).join("");
        aria+=", 감정 "+info.labels.join(", ");
      }else{icons='<span class="dot"></span>'}
      if(info.recs.length)aria+=", 기록 "+info.recs.length+"개";
      if(info.q)aria+=", 질문 답 있음";
    }
    h+='<button type="button" class="'+cls+'" data-day="'+key+'" aria-label="'+aria+'"><span>'+d+'</span><span class="icons">'+icons+'</span></button>';
  }
  h+='</div>';

  // 범례
  h+='<div class="legend" aria-label="감정 표시">'+MOODS.map(function(m){return '<span>'+moodIcon(m[0],12)+esc(m[0])+'</span>'}).join("")+'</div>';

  // 선택한 날짜
  h+='<div class="card dayDetail" id="calDetail">'+dayDetailHtml(map)+'</div>';

  // 월별 감정 분포
  h+='<div class="card dist">'+distHtml(map)+'</div>';

  // 날짜를 읽지 못한 기록 안내
  var undated=0,list=load();
  for(var u=0;u<list.length;u++){if(!validDay(list[u].day))undated++}
  if(undated)h+='<p class="hint2">날짜를 읽지 못한 기록 '+undated+'개는 달력에 표시되지 않아요. 목록에서는 볼 수 있어요.</p>';

  box.innerHTML=h;
  $("calPrev").onclick=function(){calM--;if(calM<0){calM=11;calY--}calSel=null;renderCalendar()};
  $("calNext").onclick=function(){calM++;if(calM>11){calM=0;calY++}calSel=null;renderCalendar()};
  Array.prototype.forEach.call(box.querySelectorAll(".calcell[data-day]"),function(c){
    c.onclick=function(){calSel=c.getAttribute("data-day");renderCalendar()};
  });
  bindCalDetail();
}

function dayDetailHtml(map){
  if(!calSel)return '<h4>날짜를 눌러 보세요</h4><p class="hint2" style="margin:0">그날의 기분, 기록, 질문 답을 볼 수 있어요.</p>';
  var info=map[calSel],h='<h4>'+esc(fmtMDW(calSel))+'</h4>';
  if(!info)return h+'<p class="hint2" style="margin:0">이 날은 기록이 없어요.</p>';
  if(info.mood){
    h+='<div class="it"><p><b>기분 체크</b> · '+moodIcon(info.mood.mood,14)+' '+esc(info.mood.mood)+'</p>'+(info.mood.note?'<p>'+esc(info.mood.note)+'</p>':'')+'</div>';
  }
  for(var i=0;i<info.recs.length;i++){
    var r=info.recs[i].r;
    h+='<div class="it"><p><b>선택 기록</b> · '+moodIcon(r.mood,14)+' '+esc(r.mood)+'</p><p>고민: '+esc(r.issue)+'</p>'
      +(r.pick?'<p>내가 선택한 것: '+esc(r.pick)+'</p>':'')
      +'<button type="button" class="btn ghost calOpen" data-id="'+esc(r.id)+'" style="min-height:44px;margin:6px 0 0">기록 열기</button></div>';
  }
  if(info.q){
    h+='<div class="it"><p><b>오늘의 질문</b></p><p>'+esc(questionText(info.q.qid)||"")+'</p><p>'+esc(info.q.answer)+'</p></div>';
  }
  if(!info.mood&&!info.recs.length&&!info.q)h+='<p class="hint2" style="margin:0">이 날은 기록이 없어요.</p>';
  return h;
}
function bindCalDetail(){
  Array.prototype.forEach.call($("rCal").querySelectorAll(".calOpen"),function(b){
    b.onclick=function(){
      var i=recIndexById(b.getAttribute("data-id"));
      openRecord(i);
    };
  });
}

// 월별 감정 분포와, 감정과 이어진 고민
function distHtml(map){
  var counts={},issues={},total=0,k,prefix=calY+"-"+p2(calM+1)+"-";
  MOODS.forEach(function(m){counts[m[0]]=0;issues[m[0]]=[]});
  for(var day in map){
    if(day.indexOf(prefix)!==0)continue;
    var info=map[day];
    if(info.mood){counts[info.mood.mood]=(counts[info.mood.mood]||0)+1;total++}
    for(var i=0;i<info.recs.length;i++){
      var r=info.recs[i].r;
      counts[r.mood]=(counts[r.mood]||0)+1;total++;
      if(!issues[r.mood])issues[r.mood]=[];
      if(r.issue&&issues[r.mood].indexOf(r.issue)<0)issues[r.mood].push(r.issue);
    }
  }
  var h='<h4>'+(calM+1)+'월의 감정</h4>';
  if(!total)return h+'<p class="hint2" style="margin:0">이 달에는 아직 기록이 없어요.</p>';
  var max=0;for(k in counts){if(counts[k]>max)max=counts[k]}
  var labels=MOODS.map(function(m){return m[0]});
  for(k in counts){if(labels.indexOf(k)<0)labels.push(k)}
  labels.forEach(function(l){
    var n=counts[l]||0;
    if(!n)return;
    h+='<div class="row"><span class="lab">'+moodIcon(l,14)+esc(l)+'</span><span class="track"><i style="width:'+Math.round(n/max*100)+'%;background:'+moodStyle(l).c+'"></i></span><span class="num">'+n+'</span></div>';
    if(issues[l]&&issues[l].length)h+='<div class="link">이어진 고민: <b>'+issues[l].slice(0,5).map(esc).join(", ")+'</b></div>';
  });
  return h;
}
