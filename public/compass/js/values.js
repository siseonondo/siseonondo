// ---- 나의 기준: 가치 발견 · 강점 사전 ----
// 앱이 가치나 강점을 판단하거나 단정하지 않는다. 사용자가 고르고 직접 쓴 내용만 보여 준다.
var VALUE_KEYWORDS=["자유","안정","성장","관계","신뢰","존중","건강","창의성","배움","책임","독립","도전","균형","평화","성취","정직","가족","여유","나눔","자율"];
var vCurStrength=null;      // 강점 편집 중인 항목 id (처음 입력하기 전에는 null)
var vMsg="";                // 가치 화면 안내 문구

function cleanLabel(s){return String(s||"").replace(/\|/g," ").replace(/\s+/g," ").trim().slice(0,20)}
function copyValues(v){
  return {
    candidates:v.candidates.slice(),
    custom:v.custom.slice(),
    core:v.core.map(function(c){return copyRec(c)}),
    history:v.history.map(function(h){return copyRec(h)})
  };
}
function coreIndex(v,label){
  for(var i=0;i<v.core.length;i++){if(v.core[i].label===label)return i}
  return -1;
}
// 핵심 가치가 바뀌면 그날의 모습을 남긴다. 같은 날 여러 번 바꾸면 그날의 마지막 모습 하나만 남긴다.
function recordValueHistory(v){
  var labels=v.core.map(function(c){return c.label});
  if(!labels.length)return;
  var today=todayStr(),last=v.history.length?v.history[v.history.length-1]:null;
  function same(a,b){
    if(a.length!==b.length)return false;
    for(var i=0;i<a.length;i++){if(b.indexOf(a[i])<0)return false}
    return true;
  }
  if(last&&same(last.labels,labels))return;
  var entry={at:new Date().toISOString(),day:today,labels:labels};
  if(last&&last.day===today)v.history[v.history.length-1]=entry;
  else v.history.push(entry);
  if(v.history.length>60)v.history=v.history.slice(v.history.length-60);
}

function renderValuesView(sub,id){
  Array.prototype.forEach.call(document.querySelectorAll("#sV .seg a"),function(a){
    var on=(a.getAttribute("data-sub")==="values")?(sub==="values"):(sub==="str"||sub==="strEdit");
    a.classList.toggle("on",on);
    a.setAttribute("aria-selected",on?"true":"false");
  });
  $("vVals").classList.toggle("on",sub==="values");
  $("vStr").classList.toggle("on",sub==="str");
  $("vStrEdit").classList.toggle("on",sub==="strEdit");
  if(sub==="values")renderValuesPane();
  else if(sub==="str")renderStrengthList();
  else renderStrengthEdit(id);
}

// ---------- 가치 ----------
function renderValuesPane(){
  var v=sload("values"),h="",all=VALUE_KEYWORDS.slice(),i;
  v.custom.forEach(function(c){if(all.indexOf(c)<0)all.push(c)});
  h+='<div class="card"><h3>1. 마음이 가는 가치 고르기</h3>'
    +'<p class="hint2">여러 개를 골라도 괜찮아요. 정답은 없고, 지금의 나에게 가까운 것을 골라 보세요.</p>'
    +'<div class="chips" id="vChips">'+all.map(function(l){
      var on=v.candidates.indexOf(l)>=0,isCustom=VALUE_KEYWORDS.indexOf(l)<0;
      return '<span class="chipwrap"><button type="button" class="chip'+(on?' on':'')+'" data-v="'+esc(l)+'" aria-pressed="'+(on?'true':'false')+'">'+esc(l)+'</button>'
        +(isCustom?'<button type="button" class="chipx" data-del="'+esc(l)+'" aria-label="'+esc(l)+' 지우기">×</button>':'')+'</span>';
    }).join("")+'</div>'
    +'<label for="vAdd">직접 추가하기</label>'
    +'<div class="addrow"><input type="text" id="vAdd" maxlength="20"><button type="button" class="btn ghost" id="vAddBtn">추가</button></div>'
    +'</div>';

  h+='<div class="card"><h3>2. 그중 핵심 가치 5개</h3>';
  if(!v.candidates.length){
    h+='<p class="hint2" style="margin:0">먼저 위에서 마음이 가는 가치를 골라 주세요.</p>';
  }else{
    h+='<p class="hint2">가장 중요하게 여기는 가치를 5개까지 골라 보세요. 바뀌어도 괜찮아요. <b>'+v.core.length+'/5</b></p>'
      +'<div class="chips">'+v.candidates.map(function(l){
        var on=coreIndex(v,l)>=0;
        return '<button type="button" class="chip'+(on?' on':'')+'" data-core="'+esc(l)+'" aria-pressed="'+(on?'true':'false')+'">'+esc(l)+'</button>';
      }).join("")+'</div>';
  }
  h+='<p class="hint2" id="vMsg" aria-live="polite">'+esc(vMsg)+'</p></div>';

  if(v.core.length){
    h+='<div class="card"><h3>3. 나에게 이 가치는</h3><p class="hint2">내 말로 적어 주세요. 적으면 자동으로 저장돼요.</p>';
    v.core.forEach(function(c,k){
      h+='<div class="vcore" data-label="'+esc(c.label)+'"><h4>'+esc(c.label)+'</h4>'
        +'<label for="vm'+k+'">나에게 ‘'+esc(c.label)+'’은(는) 어떤 뜻인가요?</label>'
        +'<textarea id="vm'+k+'" data-k="meaning">'+esc(c.meaning||"")+'</textarea>'
        +'<label for="vr'+k+'">이 가치를 고른 이유는 무엇인가요?</label>'
        +'<textarea id="vr'+k+'" data-k="reason">'+esc(c.reason||"")+'</textarea></div>';
    });
    h+='<p class="hint2" id="vSave" aria-live="polite"></p></div>';
  }

  if(v.history.length){
    h+='<div class="card"><h3>핵심 가치의 변화</h3><p class="hint2">날짜별로 남긴 모습이에요. 달라지는 것은 자연스러운 일이에요.</p>';
    for(i=v.history.length-1;i>=0;i--){
      h+='<p class="hrow"><b>'+esc(fmtMD(v.history[i].day||String(v.history[i].at||"").slice(0,10)))+'</b> · '+v.history[i].labels.map(esc).join(", ")+'</p>';
    }
    h+='</div>';
  }
  $("vVals").innerHTML=h;
}

function vSetMsg(t){vMsg=t;var e=$("vMsg");if(e)e.textContent=t}
function toggleCandidate(label){
  flushForm();
  var v=copyValues(sload("values")),i=v.candidates.indexOf(label);
  if(i>=0){
    v.candidates.splice(i,1);
    var ci=coreIndex(v,label);
    if(ci>=0){v.core.splice(ci,1);recordValueHistory(v)}
  }else v.candidates.push(label);
  if(!valuesSave(v)){vSetMsg("저장하지 못했어요. 시크릿 탭이 아닌 곳에서 다시 시도해 주세요.");return}
  vMsg="";renderValuesPane();
}
function toggleCore(label){
  flushForm();
  var v=copyValues(sload("values")),ci=coreIndex(v,label);
  if(ci>=0)v.core.splice(ci,1);
  else{
    if(v.core.length>=5){vSetMsg("핵심 가치는 5개까지예요. 하나를 빼면 바꿀 수 있어요.");return}
    v.core.push({label:label,meaning:"",reason:""});
  }
  recordValueHistory(v);
  if(!valuesSave(v)){vSetMsg("저장하지 못했어요. 시크릿 탭이 아닌 곳에서 다시 시도해 주세요.");return}
  vMsg="";renderValuesPane();
}
function addCustomValue(){
  var label=cleanLabel($("vAdd").value);
  if(!label){vSetMsg("추가할 가치를 적어 주세요.");return}
  flushForm();
  var v=copyValues(sload("values"));
  if(VALUE_KEYWORDS.indexOf(label)<0&&v.custom.indexOf(label)<0)v.custom.push(label);
  if(v.candidates.indexOf(label)<0)v.candidates.push(label);
  if(!valuesSave(v)){vSetMsg("저장하지 못했어요. 시크릿 탭이 아닌 곳에서 다시 시도해 주세요.");return}
  vMsg="";renderValuesPane();
}
function removeCustomValue(label){
  flushForm();
  var v=copyValues(sload("values")),i=v.custom.indexOf(label);
  if(i>=0)v.custom.splice(i,1);
  i=v.candidates.indexOf(label);if(i>=0)v.candidates.splice(i,1);
  i=coreIndex(v,label);if(i>=0){v.core.splice(i,1);recordValueHistory(v)}
  if(!valuesSave(v)){vSetMsg("저장하지 못했어요. 시크릿 탭이 아닌 곳에서 다시 시도해 주세요.");return}
  vMsg="";renderValuesPane();
}
// 가치별 뜻과 이유 입력을 한꺼번에 읽어 저장한다.
function saveValueTexts(){
  var v=copyValues(sload("values"));
  Array.prototype.forEach.call(document.querySelectorAll("#vVals .vcore"),function(box){
    var ci=coreIndex(v,box.getAttribute("data-label"));
    if(ci<0)return;
    v.core[ci].meaning=box.querySelector('[data-k="meaning"]').value;
    v.core[ci].reason=box.querySelector('[data-k="reason"]').value;
  });
  sayTo("vSave",valuesSave(v)?"저장했어요.":"저장하지 못했어요. 적은 내용은 그대로예요.");
}
function bindValues(){
  var box=$("vVals");
  box.addEventListener("click",function(e){
    var t=e.target.closest?e.target.closest("button"):null;
    if(!t||!box.contains(t))return;
    if(t.hasAttribute("data-v"))toggleCandidate(t.getAttribute("data-v"));
    else if(t.hasAttribute("data-core"))toggleCore(t.getAttribute("data-core"));
    else if(t.hasAttribute("data-del"))removeCustomValue(t.getAttribute("data-del"));
    else if(t.id==="vAddBtn")addCustomValue();
  });
  box.addEventListener("keydown",function(e){
    if(e.target&&e.target.id==="vAdd"&&(e.key==="Enter"||e.keyCode===13)){e.preventDefault();addCustomValue()}
  });
  box.addEventListener("input",function(e){
    if(e.target&&e.target.tagName==="TEXTAREA"){sayTo("vSave","적는 중이에요…");scheduleForm(saveValueTexts)}
  });
  var sb=$("vStrEdit"),sl=$("vStr");
  sb.addEventListener("input",function(e){
    if(e.target&&(e.target.tagName==="TEXTAREA"||e.target.tagName==="INPUT")){sayTo("sState","적는 중이에요…");scheduleForm(saveStrengthForm)}
  });
  sb.addEventListener("change",function(e){
    if(e.target&&e.target.type==="checkbox"){sayTo("sState","적는 중이에요…");scheduleForm(saveStrengthForm)}
  });
  sb.addEventListener("click",function(e){
    var t=e.target.closest?e.target.closest("button"):null;
    if(!t||t.id!=="sDel")return;
    if(!vCurStrength)return;
    if(!confirm("이 강점을 삭제할까요? 되돌릴 수 없어요."))return;
    if(!colRemove("strengths",vCurStrength)){alert("저장하지 못했어요. 시크릿 탭이 아닌 곳에서 다시 시도해 주세요.");return}
    vCurStrength=null;go("/values/strengths");
  });
}

// ---------- 강점 ----------
function renderStrengthList(){
  var list=sload("strengths").filter(function(s){return s&&(s.name||s.experience||s.action)});
  var h='<p class="hint2">내가 발견한 강점을 직접 적어 두는 곳이에요. 앱이 강점을 판단하거나 단정하지 않아요.</p>'
    +'<a class="btn linkbtn" href="#/values/strengths/new">강점 추가 ›</a>';
  if(!list.length){
    h+='<div class="card" style="margin-top:12px"><p>아직 적은 강점이 없어요.</p><p class="hint2" style="margin:0">예를 들어 “이야기를 끝까지 듣는 것”처럼, 내가 경험으로 알게 된 것을 적어 보세요.</p></div>';
  }else{
    h+='<div style="margin-top:12px">'+list.map(function(s){
      var n=(s.links&&s.links.length)?s.links.length:0;
      return '<a class="card slink" href="#/values/strengths/'+encodeURIComponent(s.id)+'"><b>'+esc(s.name||"(이름 없음)")+'</b>'
        +(s.experience?'<span>'+esc(trimTo(s.experience,70))+'</span>':'')
        +(n?'<span class="sub2">이어진 선택 기록 '+n+'개</span>':'')+'</a>';
    }).join("")+'</div>';
  }
  $("vStr").innerHTML=h;
}
function renderStrengthEdit(id){
  var isNew=(id==="new"),item=isNew?null:colFind("strengths",id);
  if(!isNew&&!item){
    vCurStrength=null;
    $("vStrEdit").innerHTML='<div class="card"><p>이 강점을 찾을 수 없어요.</p><a class="btn ghost linkbtn" href="#/values/strengths">목록으로</a></div>';
    return;
  }
  vCurStrength=item?item.id:null;
  var recs=load().slice(0,30),links=item&&item.links?item.links:[];
  var h='<a class="backlink" href="#/values/strengths">‹ 강점 목록</a>'
    +'<div class="card">'
    +'<label for="sName">발견한 강점은 무엇인가요?</label>'
    +'<input type="text" id="sName" maxlength="40" value="'+esc(item?item.name:"")+'">'
    +'<label for="sExp">이 강점을 확인했던 경험은 무엇인가요?</label>'
    +'<textarea id="sExp">'+esc(item?item.experience:"")+'</textarea>'
    +'<label for="sAct">그때 어떤 행동으로 드러났나요?</label>'
    +'<textarea id="sAct">'+esc(item?item.action:"")+'</textarea>'
    +'<p class="hint2" id="sState" aria-live="polite">'+(item?"적으면 자동으로 저장돼요.":"한 칸이라도 적으면 자동으로 저장돼요.")+'</p></div>';
  h+='<div class="card"><h3>이 강점을 발휘한 선택 기록 (선택)</h3>';
  if(!recs.length){
    h+='<p class="hint2" style="margin:0">선택 기록을 남기면 이곳에서 강점과 이을 수 있어요.</p>';
  }else{
    h+='<p class="hint2">최근 기록 중에서 골라 이을 수 있어요.</p><div id="sLinks">'+recs.map(function(r){
      var on=links.indexOf(r.id)>=0;
      return '<label class="sent"><input type="checkbox" data-rec="'+esc(r.id)+'"'+(on?' checked':'')+'><span>'+esc(r.date)+' · '+esc(trimTo(r.issue,30))+(r.pick?' · '+esc(trimTo(r.pick,30)):'')+'</span></label>';
    }).join("")+'</div>';
  }
  h+='</div>';
  if(item)h+='<button type="button" class="btn dangerbtn" id="sDel">이 강점 삭제</button>';
  $("vStrEdit").innerHTML=h;
}
function saveStrengthForm(){
  var name=$("sName").value,exp=$("sExp").value,act=$("sAct").value;
  var links=[];
  Array.prototype.forEach.call(document.querySelectorAll("#sLinks input[type=checkbox]"),function(c){if(c.checked)links.push(c.getAttribute("data-rec"))});
  var cur=vCurStrength?colFind("strengths",vCurStrength):null;
  if(!cur&&!name.trim()&&!exp.trim()&&!act.trim())return;       // 아무것도 적지 않았으면 항목을 만들지 않는다
  var item=cur?copyRec(cur):{id:uid(),day:todayStr(),name:"",experience:"",action:"",links:[]};
  item.name=name;item.experience=exp;item.action=act;
  // 목록에 보이지 않는(최근 30개 밖) 연결은 그대로 둔다
  var shown={};
  Array.prototype.forEach.call(document.querySelectorAll("#sLinks input[type=checkbox]"),function(c){shown[c.getAttribute("data-rec")]=1});
  (item.links||[]).forEach(function(id){if(!shown[id]&&links.indexOf(id)<0)links.push(id)});
  item.links=links;
  item.at=new Date().toISOString();
  if(!colUpsert("strengths",item)){sayTo("sState","저장하지 못했어요. 적은 내용은 그대로예요.");return}
  if(!vCurStrength){vCurStrength=item.id;swapPath("/values/strengths/"+encodeURIComponent(item.id));
    if(!$("sDel")){var b=document.createElement("button");b.type="button";b.className="btn dangerbtn";b.id="sDel";b.textContent="이 강점 삭제";$("vStrEdit").appendChild(b)}}
  sayTo("sState","저장했어요.");
}
