// ---- 랜딩 · 선택 · 나의 변화 · 설정 · 기록 탭 ----
function renderLanding(){
  $("draftBox").style.display=loadDraft()?"block":"none";
  renderMyRec();
}
function renderChoice(){
  var n=dueCandidates().length;
  $("cDueText").textContent=n?"돌아볼 시점이 된 선택이 "+n+"개 있어요.":"아직 돌아볼 시점이 된 선택은 없어요.";
}
function renderSettings(){
  var q=0,s=sload("questions");
  for(var i=0;i<s.length;i++){if(s[i]&&s[i].answer)q++}
  var extra=[],vv=sload("values");
  if(vv.core.length||vv.candidates.length)extra.push("가치 "+vv.core.length+"/5");
  [["strengths","강점"],["notes","생각 분별 노트"],["compare","선택 비교"],["defer","결정 유예"],["plans","실행 계획"]].forEach(function(c){
    var n=sload(c[0]).length;if(n)extra.push(c[1]+" "+n+"개");
  });
  $("sInfo").textContent="이 기기에 선택 기록 "+load().length+"개, 기분 체크 "+sload("moods").length+"개, 질문 답 "+q+"개"+(extra.length?", "+extra.join(", "):"")+"가 저장되어 있어요.";
  $("wipeMsg").textContent="";
  // 마지막 백업: 사실만 적는다(알림이나 경고 표시는 없다)
  var lb=lastBackupDay(),recs=load(),msg;
  if(!load().length&&!hasUserData())msg="";
  else if(!lb)msg="아직 백업을 받은 적이 없어요.";
  else{
    var newer=recs.filter(function(r){return validDay(r.day)&&r.day>lb}).length;
    msg="마지막 백업: "+fmtMD(lb)+" ("+lb.slice(0,4)+")."+(newer?" 그 뒤에 남긴 선택 기록이 "+newer+"개 있어요.":"");
  }
  $("sBackup").textContent=msg;
}
function bindSettings(){
  $("bkFile2").onclick=doBackupFile;
  $("bkCode2").onclick=function(){doBackupCode($("bkCode2"))};
  $("wipeBtn").onclick=function(){
    if(!confirm("이 기기에 저장된 나침반 기록을 모두 지울까요?\n되돌릴 수 없어요. 지우기 전에 백업을 받아 두는 것을 권해요."))return;
    if(!confirm("정말 모두 지울까요? 선택 기록, 기분 체크, 질문 답이 모두 사라져요."))return;
    if(!wipeAll()){$("wipeMsg").textContent="지우지 못했어요. 브라우저 설정을 확인해 주세요.";return}
    resetForm();
    homeBuilt=true;renderHomeMood();
    calSel=null;
    go("/landing");
  };
}
function renderRecords(sub){
  Array.prototype.forEach.call(document.querySelectorAll("#sR .seg a"),function(a){
    var on=a.getAttribute("data-sub")===sub;
    a.classList.toggle("on",on);
    a.setAttribute("aria-selected",on?"true":"false");
  });
  $("rCal").classList.toggle("on",sub==="cal");
  $("rList").classList.toggle("on",sub==="list");
  $("rQ").classList.toggle("on",sub==="q");
  if(sub==="cal")renderCalendar();
  else if(sub==="list")renderHistory();
  else renderQuestionHistory();
}
