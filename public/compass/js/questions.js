// ---- 오늘의 질문 ----
// 하루에 하나의 관찰 질문. 평가나 훈계가 아니라 스스로 살펴보도록 돕는 질문만 둔다.
var QUESTIONS=[
  {id:"q01",t:"오늘 가장 마음에 남은 순간은?"},
  {id:"q02",t:"오늘 나는 무엇을 중요하게 생각했을까?"},
  {id:"q03",t:"오늘의 선택은 어떤 기준에서 이루어졌을까?"},
  {id:"q04",t:"지금 나에게 필요한 것은 무엇일까?"},
  {id:"q05",t:"내가 당연하다고 믿었던 것은 무엇일까?"},
  {id:"q06",t:"오늘 새롭게 알게 된 나의 모습은?"},
  {id:"q07",t:"오늘 나의 에너지는 어디에 쓰였을까?"},
  {id:"q08",t:"요즘 자꾸 떠오르는 생각은 무엇일까?"},
  {id:"q09",t:"오늘 미뤄 둔 것이 있다면 무엇일까?"},
  {id:"q10",t:"지금 내 몸은 어떤 신호를 보내고 있을까?"},
  {id:"q11",t:"최근에 고마웠던 순간은?"},
  {id:"q12",t:"오늘 불편했던 장면이 있었다면, 그때 나는 무엇을 바랐을까?"},
  {id:"q13",t:"요즘 내가 자주 하는 말은 무엇일까?"},
  {id:"q14",t:"오늘 하루를 한 단어로 표현한다면?"},
  {id:"q15",t:"지금 내가 놓아도 괜찮은 것은 무엇일까?"},
  {id:"q16",t:"요즘 나를 편안하게 하는 것은 무엇일까?"},
  {id:"q17",t:"이번 주에 내가 지키고 싶은 것은 무엇일까?"},
  {id:"q18",t:"오늘 한 일 중 나다웠다고 느낀 것은?"},
  {id:"q19",t:"지금 가장 궁금한 것은 무엇일까?"},
  {id:"q20",t:"최근에 마음이 움직인 일은 무엇이었을까?"},
  {id:"q21",t:"오늘 내가 선택하지 않은 길은 무엇이었을까?"},
  {id:"q22",t:"요즘 내게 반복되는 패턴이 있다면 무엇일까?"},
  {id:"q23",t:"지금 내 마음의 날씨를 표현한다면?"},
  {id:"q24",t:"받아들이기 어려웠던 생각은 무엇일까?"},
  {id:"q25",t:"오늘 누구의 말이 마음에 남았을까?"},
  {id:"q26",t:"나는 어떤 순간에 시간이 빨리 흐른다고 느낄까?"},
  {id:"q27",t:"지금 확인하고 싶은 사실은 무엇일까?"},
  {id:"q28",t:"최근 내 생각이 조금 바뀐 부분이 있다면?"},
  {id:"q29",t:"내일의 나에게 남기고 싶은 한 문장은?"},
  {id:"q30",t:"오늘 나에게 해 주고 싶은 말은?"}
];
function questionText(qid){
  for(var i=0;i<QUESTIONS.length;i++){if(QUESTIONS[i].id===qid)return QUESTIONS[i].t}
  return "";
}
// 날짜가 같으면 같은 질문이 나오도록, 날짜를 번호로 바꿔 질문 수로 나눈 나머지를 쓴다.
function defaultQid(day){
  var d=parseDay(day)||new Date();
  var n=Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000);
  return QUESTIONS[((n%QUESTIONS.length)+QUESTIONS.length)%QUESTIONS.length].id;
}
function questionEntry(day){
  var q=sload("questions");
  for(var i=0;i<q.length;i++){if(q[i]&&q[i].day===day)return q[i]}
  return null;
}
// 오늘 항목을 새 배열로 만들어 저장한다. 성공하면 true.
function saveQuestionEntry(day,patch){
  var q=sload("questions").slice(),idx=-1,i;
  for(i=0;i<q.length;i++){if(q[i]&&q[i].day===day){idx=i;break}}
  var base=idx>=0?copyRec(q[idx]):{id:uid(),day:day,qid:defaultQid(day),answer:"",skipped:false,at:""};
  for(var k in patch){if(Object.prototype.hasOwnProperty.call(patch,k))base[k]=patch[k]}
  base.at=new Date().toISOString();
  if(idx>=0)q[idx]=base;else q.push(base);
  return spersist("questions",q);
}
function deleteQuestionEntry(id){
  var q=sload("questions"),n=[];
  for(var i=0;i<q.length;i++){if(q[i]&&q[i].id!==id)n.push(q[i])}
  return spersist("questions",n);
}
// 지금까지 답한 적 없는 질문 중에서 하나를 고른다(모두 답했다면 현재 질문만 빼고 고른다).
function pickOtherQid(currentQid){
  var answered={},q=sload("questions"),i,pool=[];
  for(i=0;i<q.length;i++){if(q[i]&&q[i].answer)answered[q[i].qid]=1}
  for(i=0;i<QUESTIONS.length;i++){
    if(QUESTIONS[i].id!==currentQid&&!answered[QUESTIONS[i].id])pool.push(QUESTIONS[i].id);
  }
  if(!pool.length){
    for(i=0;i<QUESTIONS.length;i++){if(QUESTIONS[i].id!==currentQid)pool.push(QUESTIONS[i].id)}
  }
  return pool[Math.floor(Math.random()*pool.length)];
}

// ---- 홈의 질문 카드 ----
var qTimer=null;
function qSay(t){var e=$("hQState");if(e)e.textContent=t}
function currentQid(){
  var e=questionEntry(todayStr());
  return e&&e.qid?e.qid:defaultQid(todayStr());
}
function renderQuestionCard(){
  var day=todayStr(),e=questionEntry(day),qid=currentQid();
  var answered=!!(e&&e.answer),skipped=!!(e&&e.skipped&&!e.answer);
  $("hQText").textContent=questionText(qid);
  var ta=$("hQAns");
  if(document.activeElement!==ta)ta.value=e&&e.answer?e.answer:"";
  ta.style.display=skipped?"none":"block";
  $("hQSkip").textContent=skipped?"다시 답하기":"건너뛰기";
  $("hQOther").style.display=(answered||skipped)?"none":"";
  $("hQSkip").style.display=answered?"none":"";
  if(skipped)qSay("오늘은 건너뛰었어요. 마음이 내키면 다시 답해도 돼요.");
  else if(answered)qSay("저장했어요. 언제든 고쳐 쓸 수 있어요.");
  else qSay("짧게 적으면 자동으로 저장돼요. 적지 않아도 괜찮아요.");
}
function flushQuestion(){
  if(qTimer!==null){clearTimeout(qTimer);qTimer=null;saveQuestionAnswer()}
}
function saveQuestionAnswer(){
  var text=$("hQAns").value.trim(),day=todayStr();
  var e=questionEntry(day);
  if(!text&&!(e&&e.answer))return;           // 빈 답은 새로 만들지 않는다
  var ok=saveQuestionEntry(day,{qid:currentQid(),answer:text,skipped:false});
  qSay(ok?(text?"저장했어요. 언제든 고쳐 쓸 수 있어요.":"답을 지웠어요."):"저장하지 못했어요. 적은 내용은 그대로예요.");
}
function bindQuestionCard(){
  $("hQAns").addEventListener("input",function(){
    if(qTimer!==null)clearTimeout(qTimer);
    qSay("적는 중이에요…");
    qTimer=setTimeout(function(){qTimer=null;saveQuestionAnswer();renderQuestionCard()},500);
  });
  $("hQOther").onclick=function(){
    var ok=saveQuestionEntry(todayStr(),{qid:pickOtherQid(currentQid()),answer:"",skipped:false});
    if(!ok)qSay("저장하지 못했어요. 시크릿 탭이 아닌 곳에서 다시 시도해 주세요.");
    renderQuestionCard();
  };
  $("hQSkip").onclick=function(){
    var e=questionEntry(todayStr()),skipped=!!(e&&e.skipped&&!e.answer);
    var ok=saveQuestionEntry(todayStr(),{qid:currentQid(),answer:"",skipped:!skipped});
    if(!ok)qSay("저장하지 못했어요. 시크릿 탭이 아닌 곳에서 다시 시도해 주세요.");
    renderQuestionCard();
  };
  window.addEventListener("pagehide",flushQuestion);
  document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden")flushQuestion()});
}

// ---- 기록 > 질문 (이전 질문과 답) ----
function renderQuestionHistory(){
  var box=$("rQ"),q=sload("questions").filter(function(e){return e&&e.answer});
  q.sort(function(a,b){return a.day<b.day?1:a.day>b.day?-1:0});
  if(!q.length){
    box.innerHTML='<div class="card"><p>아직 남긴 답이 없어요.</p><p class="hint2">홈의 오늘의 질문에 짧게 답하면 이곳에 모여요.</p></div>';
    return;
  }
  box.innerHTML='<div class="card qhist">'+q.map(function(e){
    var t=questionText(e.qid)||"(질문 문구를 찾을 수 없어요)";
    return '<div class="it"><div class="qd">'+esc(fmtMDW(e.day))+'</div><div class="qq">'+esc(t)+'</div><div class="qa">'+esc(e.answer)+'</div>'
      +'<button class="btn ghost qdel" type="button" data-id="'+esc(e.id)+'">삭제</button></div>';
  }).join("")+'</div>';
  Array.prototype.forEach.call(box.querySelectorAll(".qdel"),function(b){
    b.onclick=function(){
      if(!confirm("이 답을 삭제할까요? 되돌릴 수 없어요."))return;
      if(!deleteQuestionEntry(b.getAttribute("data-id"))){alert("저장하지 못했어요. 시크릿 탭이 아닌 곳에서 다시 시도해 주세요.");return}
      renderQuestionHistory();
    };
  });
}
