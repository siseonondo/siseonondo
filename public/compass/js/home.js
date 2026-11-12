// ---- 개인 홈 (재방문 사용자) ----
var homeBuilt=false;

function buildHome(){
  if(homeBuilt)return;
  homeBuilt=true;
  MOODS.forEach(function(m){
    var b=document.createElement("button");
    b.type="button";b.className="chip";b.setAttribute("data-m",m[0]);
    b.innerHTML=moodIcon(m[0],14)+'<span>'+esc(m[0])+'</span>';
    b.onclick=function(){setTodayMood(m[0])};
    $("hMoodChips").appendChild(b);
  });
  bindQuestionCard();
  $("hResume").onclick=function(){resumeDraft()};
}

function todayMoodEntry(){
  var l=sload("moods"),t=todayStr();
  for(var i=0;i<l.length;i++){if(l[i]&&l[i].day===t)return l[i]}
  return null;
}
// 같은 기분을 다시 누르면 오늘의 기분 체크를 지운다. 다른 기분을 누르면 바꾼다.
function setTodayMood(label){
  var t=todayStr(),l=sload("moods"),next=[],found=false,i;
  for(i=0;i<l.length;i++){
    if(l[i]&&l[i].day===t){
      found=true;
      if(l[i].mood!==label){var c=copyRec(l[i]);c.mood=label;c.at=new Date().toISOString();next.push(c)}
    }else next.push(l[i]);
  }
  if(!found)next.push({id:uid(),day:t,mood:label,note:"",at:new Date().toISOString()});
  if(!spersist("moods",next)){
    $("hMoodNote").textContent="저장하지 못했어요. 시크릿 탭이 아닌 곳에서 다시 시도해 주세요.";
    return;
  }
  renderHomeMood();
}
function renderHomeMood(){
  var e=todayMoodEntry();
  Array.prototype.forEach.call($("hMoodChips").children,function(c){
    var on=!!(e&&c.getAttribute("data-m")===e.mood);
    c.classList.toggle("on",on);
    c.setAttribute("aria-pressed",on?"true":"false");
  });
  $("hMoodNote").textContent=e
    ?"오늘의 기분을 기록했어요. 같은 기분을 다시 누르면 지워져요."
    :"고르면 기록 달력에 오늘 날짜로 남아요. 기분에는 좋고 나쁨이 없어요.";
}

// 돌아볼 시점이 된 기록(예정일이 지났고 아직 회고하지 않은 기록), 가장 오래된 예정일 순
function renderHomeDue(){
  var box=$("hDue"),cand=dueCandidates();
  if(cand.length){
    var c=cand[0],r=c.r;
    box.className="card dueCard inHome";
    box.innerHTML='<h3>지난 선택 돌아보기</h3><p class="tagline" style="margin:0 0 6px">돌아볼 시점이에요</p>'
      +'<p><b>'+esc(r.date)+'</b> · '+esc(r.issue)+'</p>'
      +(r.pick?'<p>그때의 선택: '+esc(r.pick)+'</p>':'')
      +(cand.length>1?'<p class="more">외 '+(cand.length-1)+'개의 기록도 돌아볼 시점이에요.</p>':'')
      +'<button class="btn" id="hDueGo" type="button">지금 돌아보기 ›</button>';
    $("hDueGo").onclick=function(){
      openRecord(c.i);
    };
    return;
  }
  var list=load();
  box.className="card";
  if(list.length){
    var r2=list[0];
    box.innerHTML='<h3>지난 선택 돌아보기</h3><p>아직 돌아볼 시점이 된 선택은 없어요.</p>'
      +'<p class="hint2">가장 최근에 남긴 기록: <b>'+esc(r2.date)+'</b> · '+esc(r2.issue)+'</p>'
      +'<a class="btn ghost linkbtn" href="#/records/list">지난 기록 보기</a>';
  }else{
    box.innerHTML='<h3>지난 선택 돌아보기</h3><p class="hint2" style="margin:0">선택을 기록하면, 돌아볼 시점에 이곳에서 다시 만나요.</p>';
  }
}

function renderHome(){
  buildHome();
  var now=new Date();
  $("hDate").textContent=(now.getMonth()+1)+"월 "+now.getDate()+"일 "+DOW[now.getDay()]+"요일";
  $("hDraft").style.display=loadDraft()?"block":"none";
  renderHomeMood();
  renderQuestionCard();
  renderHomeTodo();
  renderHomeDue();
}

// 오늘 살펴볼 것: 다시 살펴볼 날이 된 유예 고민, 실행 예정일이 된 계획. 알림이나 독촉 없이 차분하게 보여 준다.
function renderHomeTodo(){
  var box=$("hTodo"),items=[];
  sload("defer").map(dfNorm).forEach(function(d){
    if(d.id&&dfDue(d))items.push({tag:"다시 살펴볼 날이에요",title:d.issue,href:"#/defer/"+encodeURIComponent(d.id),key:d.reviewDate});
  });
  sload("plans").map(planNorm).forEach(function(p){
    if(p.id&&planDue(p))items.push({tag:"실행 예정일이에요",title:p.goal,href:"#/plans/"+encodeURIComponent(p.id),key:p.dueDate});
  });
  if(!items.length){box.style.display="none";box.innerHTML="";return}
  items.sort(function(a,b){return a.key<b.key?-1:a.key>b.key?1:0});
  var more=items.length-3;
  box.innerHTML='<h3>오늘 살펴볼 것</h3>'+items.slice(0,3).map(function(it){
    return '<a class="todoit" href="'+it.href+'"><span class="sub2">'+esc(it.tag)+'</span><b>'+esc(trimTo(it.title,50)||"(적은 내용이 없어요)")+'</b></a>';
  }).join("")+(more>0?'<p class="hint2" style="margin:6px 0 0">그 밖에 '+more+'개가 더 있어요.</p>':'')
    +'<p class="hint2" style="margin:8px 0 0">서두르지 않아도 돼요. 마음이 내킬 때 열어 보세요.</p>';
  box.style.display="block";
}
