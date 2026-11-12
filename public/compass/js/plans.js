// ---- 작은 실행 계획 ----
// 선택한 것을 작은 행동으로 잇는다. 완료율이나 성취 점수는 보여 주지 않는다.
// 변경과 중단도 평가가 아니라 기록으로만 다룬다.
var PLAN_STATUS=[["planned","예정"],["doing","진행 중"],["done","완료"],["changed","변경"],["stopped","중단"]];
var plan=null;          // 편집 중인 계획(메모리)
var plansPrefill=null;  // 선택 기록에서 넘어올 때 미리 채울 값: {goal, rec}

function planStatusName(s){
  for(var i=0;i<PLAN_STATUS.length;i++){if(PLAN_STATUS[i][0]===s)return PLAN_STATUS[i][1]}
  return "예정";
}
function planBlank(){return {id:null,day:todayStr(),goal:"",firstAction:"",dueDate:"",status:"planned",reflection:"",log:[],linkedRecordId:"",at:""}}
function planNorm(it){
  var p=planBlank();
  if(!it||typeof it!=="object")return p;
  p.id=typeof it.id==="string"?it.id:null;
  p.day=validDay(it.day)?it.day:todayStr();
  p.goal=strOf(it.goal);p.firstAction=strOf(it.firstAction);p.reflection=strOf(it.reflection);
  p.dueDate=validDay(it.dueDate)?it.dueDate:"";
  p.status=planStatusName(it.status)&&PLAN_STATUS.some(function(s){return s[0]===it.status})?it.status:"planned";
  p.linkedRecordId=strOf(it.linkedRecordId);p.at=strOf(it.at);
  if(Array.isArray(it.log)){
    it.log.slice(-60).forEach(function(l){
      if(l&&typeof l==="object")p.log.push({at:strOf(l.at),day:validDay(l.day)?l.day:"",status:PLAN_STATUS.some(function(s){return s[0]===l.status})?l.status:"planned",note:strOf(l.note)});
    });
  }
  return p;
}
function planHasContent(p){return !!(p.goal.trim()||p.firstAction.trim()||p.reflection.trim()||p.dueDate)}
function planActive(p){return p.status==="planned"||p.status==="doing"}
function planDue(p){return planActive(p)&&p.dueDate&&p.dueDate<=todayStr()}

function renderPlansView(sub,id){
  $("pList").classList.toggle("on",sub==="list");
  $("pEdit").classList.toggle("on",sub==="edit");
  if(sub==="list")renderPlanList();
  else renderPlanEdit(id);
}
function renderPlanList(){
  var all=sload("plans").map(planNorm).filter(planHasContent);
  var active=all.filter(planActive).sort(function(a,b){
    if(a.dueDate&&b.dueDate)return a.dueDate<b.dueDate?-1:a.dueDate>b.dueDate?1:0;
    if(a.dueDate)return -1;if(b.dueDate)return 1;return 0;
  });
  var rest=all.filter(function(p){return !planActive(p)});
  function card(p){
    return '<a class="card slink'+(planDue(p)?' dueSoft':'')+'" href="#/plans/'+encodeURIComponent(p.id)+'"><b>'+esc(trimTo(p.goal,50)||"(적은 목표가 없어요)")+'</b>'
      +(p.firstAction.trim()?'<span>첫 행동: '+esc(trimTo(p.firstAction,50))+'</span>':'')
      +'<span class="sub2">'+esc(planStatusName(p.status))+(p.dueDate?' · 실행 예정일 '+esc(fmtDue(p.dueDate)):'')+'</span></a>';
  }
  var h='<p class="hint2">선택한 것을 작은 행동으로 이어 보는 곳이에요. 완료나 중단은 평가가 아니라 기록이에요.</p>'
    +'<a class="btn linkbtn" href="#/plans/new">계획 세우기 ›</a>';
  if(!all.length){
    h+='<div class="card" style="margin-top:12px"><p style="margin:0">아직 세운 계획이 없어요.</p></div>';
  }else{
    h+='<div style="margin-top:12px">'+(active.length?'<h3 class="hsec">예정과 진행 중</h3>'+active.map(card).join(""):'')
      +(rest.length?'<h3 class="hsec">지나온 계획</h3>'+rest.map(card).join(""):'')+'</div>';
  }
  $("pList").innerHTML=h;
}
function renderPlanEdit(id){
  var isNew=(id==="new"),item=isNew?null:colFind("plans",id);
  if(!isNew&&!item){
    plan=null;
    $("pEdit").innerHTML='<div class="card"><p>이 계획을 찾을 수 없어요.</p><a class="btn ghost linkbtn" href="#/plans">목록으로</a></div>';
    return;
  }
  plan=isNew?planBlank():planNorm(deepClone(item));
  if(isNew&&plansPrefill){
    plan.goal=strOf(plansPrefill.goal);plan.linkedRecordId=strOf(plansPrefill.rec);
  }
  plansPrefill=null;
  drawPlanEdit();
  // 미리 채워 온 값이 있으면 곧바로 저장해 둔다(적은 것과 같은 취급)
  if(isNew&&planHasContent(plan))scheduleForm(savePlan);
}
function drawPlanEdit(){
  var p=plan,h='<a class="backlink" href="#/plans">‹ 계획 목록</a>';
  h+='<div class="card"><label for="pGoal">선택한 목표는 무엇인가요?</label><textarea id="pGoal">'+esc(p.goal)+'</textarea>'
    +'<label for="pFirst">첫 번째로 할 행동은 무엇인가요?</label><p class="hint2" style="margin:0 0 6px">작고 구체적일수록 시작하기 쉬워요.</p><textarea id="pFirst">'+esc(p.firstAction)+'</textarea>'
    +'<label>실행 예정일</label><div class="chips" id="pDateChips" style="margin-bottom:8px">'+dateChipsHtml(p.dueDate,"pd")+'</div>'
    +'<label for="pDate">날짜를 직접 고를 수도 있어요</label><input type="date" id="pDate" value="'+esc(p.dueDate)+'"></div>';
  h+='<div class="card"><h3>지금의 상태</h3><div class="chips">'+PLAN_STATUS.map(function(s){
    var on=p.status===s[0];
    return '<button type="button" class="chip'+(on?' on':'')+'" data-act="st" data-v="'+s[0]+'" aria-pressed="'+(on?'true':'false')+'">'+s[1]+'</button>';
  }).join("")+'</div>';
  if(p.status==="changed"||p.status==="stopped"){
    var last=p.log.length?p.log[p.log.length-1]:null,note=(last&&last.status===p.status)?last.note:"";
    h+='<label for="pNote">'+(p.status==="changed"?"계획을 바꾼 이유":"멈춘 이유")+' (적지 않아도 괜찮아요)</label><textarea id="pNote">'+esc(note)+'</textarea>';
  }
  h+='<label for="pRefl">실행하고 느낀 점은 무엇인가요? (적지 않아도 괜찮아요)</label><textarea id="pRefl">'+esc(p.reflection)+'</textarea></div>';
  h+='<div class="card"><h3>이 계획과 이어진 선택 기록 (선택)</h3><div id="pRecs">'+recChooserHtml("pRec",p.linkedRecordId)+'</div></div>';
  if(p.log.length){
    h+='<div class="card"><h3>상태의 기록</h3><p class="hint2">바뀐 날짜별로 남아요.</p>'+p.log.map(function(l){
      return '<p class="hrow"><b>'+esc(l.day?fmtMD(l.day):"")+'</b> · '+esc(planStatusName(l.status))+(l.note.trim()?' — '+esc(l.note):'')+'</p>';
    }).join("")+'</div>';
  }
  h+='<p class="hint2" id="pState" aria-live="polite">'+(p.id?"적으면 자동으로 저장돼요.":"한 칸이라도 적으면 자동으로 저장돼요.")+'</p>';
  if(p.id)h+='<button type="button" class="btn dangerbtn" data-act="del">이 계획 삭제</button>';
  $("pEdit").innerHTML=h;
}
function planSync(){
  if(!plan||!$("pGoal"))return;
  plan.goal=$("pGoal").value;plan.firstAction=$("pFirst").value;
  var dt=$("pDate").value;plan.dueDate=validDay(dt)?dt:"";
  plan.reflection=$("pRefl").value;
  plan.linkedRecordId=checkedRadio("pRec");
  if($("pNote")&&plan.log.length){
    var last=plan.log[plan.log.length-1];
    if(last.status===plan.status)last.note=$("pNote").value;
  }
}
function savePlan(){
  if(!plan)return;
  planSync();
  if(!plan.id&&!planHasContent(plan))return;
  var first=!plan.id;
  if(first)plan.id=uid();
  plan.at=new Date().toISOString();
  if(!colUpsert("plans",deepClone(plan))){
    if(first)plan.id=null;
    sayTo("pState","저장하지 못했어요. 적은 내용은 그대로예요.");return;
  }
  if(first){
    swapPath("/plans/"+encodeURIComponent(plan.id));
    if(!document.querySelector('#pEdit [data-act="del"]')){
      var b=document.createElement("button");b.type="button";b.className="btn dangerbtn";b.setAttribute("data-act","del");b.textContent="이 계획 삭제";$("pEdit").appendChild(b);
    }
  }
  sayTo("pState","저장했어요.");
}
function bindPlans(){
  var box=$("pEdit");
  box.addEventListener("input",function(e){
    var t=e.target;
    if(t&&(t.tagName==="TEXTAREA"||t.id==="pDate")){
      sayTo("pState","적는 중이에요…");planSync();
      if(t.id==="pDate"){Array.prototype.forEach.call($("pDateChips").children,function(c){c.classList.toggle("on",c.getAttribute("data-pd")===$("pDate").value)})}
      scheduleForm(savePlan);
    }
  });
  box.addEventListener("change",function(e){
    if(e.target&&e.target.type==="radio"){planSync();scheduleForm(savePlan)}
  });
  box.addEventListener("click",function(e){
    var chip=e.target.closest?e.target.closest("[data-pd]"):null;
    if(chip&&box.contains(chip)&&plan){
      planSync();plan.dueDate=chip.getAttribute("data-pd");
      $("pDate").value=plan.dueDate;
      Array.prototype.forEach.call($("pDateChips").children,function(c){c.classList.toggle("on",c===chip)});
      scheduleForm(savePlan);return;
    }
    var t=e.target.closest?e.target.closest("button[data-act]"):null;
    if(!t||!box.contains(t)||!plan)return;
    var act=t.getAttribute("data-act");
    planSync();
    if(act==="st"){
      var v=t.getAttribute("data-v");
      if(plan.status!==v){
        plan.status=v;
        plan.log.push({at:new Date().toISOString(),day:todayStr(),status:v,note:""});
        if(plan.log.length>60)plan.log=plan.log.slice(plan.log.length-60);
        drawPlanEdit();scheduleForm(savePlan);
      }
      return;
    }
    if(act==="del"){
      if(!plan.id)return;
      if(!confirm("이 계획을 삭제할까요? 되돌릴 수 없어요."))return;
      if(!colRemove("plans",plan.id)){alert("저장하지 못했어요. 시크릿 탭이 아닌 곳에서 다시 시도해 주세요.");return}
      plan=null;go("/plans");
    }
  });
}
