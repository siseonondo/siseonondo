// ---- 결정 유예함 ----
// 당장 정하지 않아도 되는 고민을 보관한다. '결정하지 않음'도 하나의 선택으로 존중한다.
var dfItem=null;      // 편집 중인 항목(메모리). 저장소의 객체를 직접 고치지 않는다.
// flowLink(작성 흐름에서 저장할 때 이어 둘 항목 {type:"defer"|"plan", id})는 app.js에 있다.

function dfBlank(){return {id:null,day:todayStr(),issue:"",reason:"",reviewDate:"",status:"open",decision:"",linkedRecordId:"",decidedAt:"",at:""}}
function dfNorm(it){
  var d=dfBlank();
  if(!it||typeof it!=="object")return d;
  d.id=typeof it.id==="string"?it.id:null;
  d.day=validDay(it.day)?it.day:todayStr();
  d.issue=strOf(it.issue);d.reason=strOf(it.reason);d.decision=strOf(it.decision);
  d.reviewDate=validDay(it.reviewDate)?it.reviewDate:"";
  d.status=(it.status==="decided")?"decided":"open";
  d.linkedRecordId=strOf(it.linkedRecordId);d.decidedAt=strOf(it.decidedAt);d.at=strOf(it.at);
  return d;
}
function dfHasContent(d){return !!(d.issue.trim()||d.reason.trim()||d.decision.trim()||d.reviewDate||d.status==="decided")}
function dfDue(d){return d.status==="open"&&d.reviewDate&&d.reviewDate<=todayStr()}

function renderDeferView(sub,id){
  $("dList").classList.toggle("on",sub==="list");
  $("dEdit").classList.toggle("on",sub==="edit");
  if(sub==="list")renderDeferList();
  else renderDeferEdit(id);
}
function renderDeferList(){
  var all=sload("defer").map(dfNorm).filter(dfHasContent);
  var open=all.filter(function(d){return d.status==="open"}).sort(function(a,b){
    if(a.reviewDate&&b.reviewDate)return a.reviewDate<b.reviewDate?-1:a.reviewDate>b.reviewDate?1:0;
    if(a.reviewDate)return -1;if(b.reviewDate)return 1;return 0;
  });
  var done=all.filter(function(d){return d.status==="decided"});
  function card(d){
    var tag=d.status==="decided"?"결정했어요":(d.reviewDate?(dfDue(d)?"다시 살펴볼 날이 됐어요":"다시 살펴볼 날: "+fmtDue(d.reviewDate)):"살펴볼 날을 정하지 않았어요");
    return '<a class="card slink'+(dfDue(d)?' dueSoft':'')+'" href="#/defer/'+encodeURIComponent(d.id)+'"><b>'+esc(trimTo(d.issue,50)||"(적은 고민이 없어요)")+'</b>'
      +(d.reason.trim()?'<span>'+esc(trimTo(d.reason,60))+'</span>':'')+'<span class="sub2">'+esc(tag)+'</span></a>';
  }
  var h='<p class="hint2">당장 정하지 않아도 되는 고민을 보관하는 곳이에요. 정하지 않는 것도 하나의 선택이에요.</p>'
    +'<a class="btn linkbtn" href="#/defer/new">고민 보관하기 ›</a>';
  if(!all.length){
    h+='<div class="card" style="margin-top:12px"><p style="margin:0">보관 중인 고민이 없어요.</p></div>';
  }else{
    h+='<div style="margin-top:12px">'+(open.length?'<h3 class="hsec">아직 정하지 않은 고민</h3>'+open.map(card).join(""):'')
      +(done.length?'<h3 class="hsec">결정한 고민</h3>'+done.map(card).join(""):'')+'</div>';
  }
  $("dList").innerHTML=h;
}
function renderDeferEdit(id){
  var isNew=(id==="new"),item=isNew?null:colFind("defer",id);
  if(!isNew&&!item){
    dfItem=null;
    $("dEdit").innerHTML='<div class="card"><p>이 고민을 찾을 수 없어요.</p><a class="btn ghost linkbtn" href="#/defer">목록으로</a></div>';
    return;
  }
  dfItem=isNew?dfBlank():dfNorm(deepClone(item));
  drawDeferEdit();
}
function drawDeferEdit(){
  var d=dfItem,decided=(d.status==="decided");
  var h='<a class="backlink" href="#/defer">‹ 유예함</a>'
    +'<div class="card"><label for="dIssue">아직 정하지 못한 고민은 무엇인가요?</label><textarea id="dIssue">'+esc(d.issue)+'</textarea>'
    +'<label for="dReason">아직 정하지 않은 이유는 무엇인가요?</label><p class="hint2" style="margin:0 0 6px">정하지 않는 것도 하나의 선택이에요.</p>'
    +'<textarea id="dReason">'+esc(d.reason)+'</textarea>'
    +'<label>언제 다시 살펴볼까요?</label><div class="chips" id="dDateChips" style="margin-bottom:8px">'+dateChipsHtml(d.reviewDate,"dd")+'</div>'
    +'<label for="dDate">날짜를 직접 고를 수도 있어요</label><input type="date" id="dDate" value="'+esc(d.reviewDate)+'"></div>';
  h+='<div class="card"><h3>지금의 상태</h3><div class="chips">'
    +'<button type="button" class="chip'+(!decided?' on':'')+'" data-act="st" data-v="open" aria-pressed="'+(!decided?'true':'false')+'">아직 정하지 않았어요</button>'
    +'<button type="button" class="chip'+(decided?' on':'')+'" data-act="st" data-v="decided" aria-pressed="'+(decided?'true':'false')+'">결정했어요</button></div>';
  if(decided){
    h+='<label for="dDecision">어떻게 결정했나요?</label><textarea id="dDecision">'+esc(d.decision)+'</textarea>'
      +'<label>이 결정과 이어진 선택 기록 (선택)</label><div id="dRecs">'+recChooserHtml("dRec",d.linkedRecordId)+'</div>'
      +'<button type="button" class="btn ghost" data-act="toflow" style="margin:8px 0 0">이 결정을 선택 기록으로 남기기 ›</button>'
      +'<p class="hint2" style="margin:8px 0 0">선택 기록으로 남기면 이 고민에 그 기록이 자동으로 이어져요.</p>';
  }
  h+='<p class="hint2" id="dState" aria-live="polite" style="margin-top:10px">'+(d.id?"적으면 자동으로 저장돼요.":"한 칸이라도 적으면 자동으로 저장돼요.")+'</p></div>';
  if(d.id)h+='<button type="button" class="btn dangerbtn" data-act="del">이 고민 삭제</button>';
  $("dEdit").innerHTML=h;
}
function dfSync(){
  if(!dfItem||!$("dIssue"))return;
  dfItem.issue=$("dIssue").value;dfItem.reason=$("dReason").value;
  var dt=$("dDate").value;dfItem.reviewDate=validDay(dt)?dt:"";
  if($("dDecision"))dfItem.decision=$("dDecision").value;
  if($("dRecs"))dfItem.linkedRecordId=checkedRadio("dRec");
}
function saveDefer(){
  if(!dfItem)return;
  dfSync();
  if(!dfItem.id&&!dfHasContent(dfItem))return;
  var first=!dfItem.id;
  if(first)dfItem.id=uid();
  dfItem.at=new Date().toISOString();
  if(!colUpsert("defer",deepClone(dfItem))){
    if(first)dfItem.id=null;
    sayTo("dState","저장하지 못했어요. 적은 내용은 그대로예요.");return;
  }
  if(first){
    swapPath("/defer/"+encodeURIComponent(dfItem.id));
    if(!document.querySelector('#dEdit [data-act="del"]')){
      var b=document.createElement("button");b.type="button";b.className="btn dangerbtn";b.setAttribute("data-act","del");b.textContent="이 고민 삭제";$("dEdit").appendChild(b);
    }
  }
  sayTo("dState","저장했어요.");
}
function bindDefer(){
  var box=$("dEdit");
  box.addEventListener("input",function(e){
    var t=e.target;
    if(t&&(t.tagName==="TEXTAREA"||t.id==="dDate")){
      sayTo("dState","적는 중이에요…");dfSync();
      if(t.id==="dDate"){Array.prototype.forEach.call($("dDateChips").children,function(c){c.classList.toggle("on",c.getAttribute("data-dd")===$("dDate").value)})}
      scheduleForm(saveDefer);
    }
  });
  box.addEventListener("change",function(e){
    if(e.target&&e.target.type==="radio"){dfSync();scheduleForm(saveDefer)}
  });
  box.addEventListener("click",function(e){
    var chip=e.target.closest?e.target.closest("[data-dd]"):null;
    if(chip&&box.contains(chip)&&dfItem){
      dfSync();dfItem.reviewDate=chip.getAttribute("data-dd");
      $("dDate").value=dfItem.reviewDate;
      Array.prototype.forEach.call($("dDateChips").children,function(c){c.classList.toggle("on",c===chip)});
      scheduleForm(saveDefer);return;
    }
    var t=e.target.closest?e.target.closest("button[data-act]"):null;
    if(!t||!box.contains(t)||!dfItem)return;
    var act=t.getAttribute("data-act");
    dfSync();
    if(act==="st"){
      var v=t.getAttribute("data-v");
      if(dfItem.status!==v){
        dfItem.status=v;
        dfItem.decidedAt=(v==="decided")?new Date().toISOString():"";
        drawDeferEdit();scheduleForm(saveDefer);
      }
      return;
    }
    if(act==="toflow"){
      flushForm();
      if(!dfItem.id){sayTo("dState","먼저 한 칸 이상 적어 주세요.");return}
      if(!dfItem.issue.trim()||!dfItem.decision.trim()){sayTo("dState","고민과 결정한 내용을 적으면 선택 기록으로 이어서 남길 수 있어요.");return}
      startPrefilledFlow({issue:dfItem.issue.trim(),pick:dfItem.decision.trim()},{type:"defer",id:dfItem.id});
      return;
    }
    if(act==="del"){
      if(!dfItem.id)return;
      if(!confirm("이 고민을 삭제할까요? 되돌릴 수 없어요."))return;
      if(!colRemove("defer",dfItem.id)){alert("저장하지 못했어요. 시크릿 탭이 아닌 곳에서 다시 시도해 주세요.");return}
      dfItem=null;go("/defer");
    }
  });
}

// 선택 기록 작성 흐름을 미리 채워서 시작한다(결정 유예함, 실행 계획에서 사용).
function startPrefilledFlow(pre,link){
  if(loadDraft()&&!confirm("작성 중인 기록이 있어요.\n지우고 이 내용으로 새로 시작할까요?"))return;
  resetForm();clearDraft();
  flowLink=link||null;
  show(1);
  if(pre.issue){$("issue").value=pre.issue;check2()}
  if(pre.pick){$("pick").value=pre.pick;check3()}
}
// 작성 흐름에서 기록을 저장한 직후: 이어 둘 항목이 있으면 연결한다.
function flowLinkDone(rec){
  var l=flowLink;flowLink=null;
  if(!l)return;
  if(l.type==="defer"){
    var it=colFind("defer",l.id);
    if(it){
      var c=dfNorm(deepClone(it));
      c.status="decided";c.linkedRecordId=rec.id;
      if(!c.decision.trim())c.decision=rec.pick;
      c.decidedAt=new Date().toISOString();c.at=c.decidedAt;
      if(colUpsert("defer",c))saveMessage("저장했어요. 결정 유예함의 고민에 이 기록을 이어 두었어요.",false);
    }
  }
}
