// ---- 선택 비교 도구 ----
// 선택지를 나란히 놓고 비교한다. 점수로 자동 결정하지 않고, 중요도와 최종 선택은 사용자가 직접 정한다.
var CMP_CRITERIA=[
  {k:"pros",t:"장점"},
  {k:"cons",t:"우려되는 점"},
  {k:"cost",t:"예상 비용"},
  {k:"rev",t:"되돌릴 가능성"},
  {k:"valueRel",t:"내 핵심 가치와의 관계"},
  {k:"unknown",t:"아직 확인하지 못한 정보"}
];
var IMPORTANCE=[["low","낮음"],["mid","보통"],["high","높음"]];
var REVERS=[["easy","되돌리기 쉬워요"],["hard","되돌리기 어려워요"],["unsure","잘 모르겠어요"]];
var OPT_LETTERS="ABCD";
var cmp=null;         // 편집 중인 비교(메모리). 저장소의 객체를 직접 고치지 않는다.
var cmpOpen=0;        // 펼쳐 둔 선택지 번호

function cmpOptBlank(){return {name:"",pros:"",cons:"",cost:"",rev:"",valueRel:"",unknown:""}}
function cmpBlank(){return {id:null,day:todayStr(),title:"",options:[cmpOptBlank(),cmpOptBlank()],importance:{},finalOpt:-1,reason:"",at:""}}
// 저장소(백업 포함)에서 온 항목이 어떤 모양이어도 화면이 깨지지 않게 다듬는다.
function cmpNorm(it){
  var c=cmpBlank();
  if(!it||typeof it!=="object")return c;
  c.id=typeof it.id==="string"?it.id:null;
  c.day=validDay(it.day)?it.day:todayStr();
  c.title=strOf(it.title);
  c.reason=strOf(it.reason);
  c.at=strOf(it.at);
  var opts=Array.isArray(it.options)?it.options.slice(0,4):[];
  var out=opts.map(function(o){
    var b=cmpOptBlank();
    if(o&&typeof o==="object"){["name","pros","cons","cost","valueRel","unknown"].forEach(function(k){b[k]=strOf(o[k])});b.rev=["easy","hard","unsure"].indexOf(o.rev)>=0?o.rev:""}
    return b;
  });
  while(out.length<2)out.push(cmpOptBlank());
  c.options=out;
  var imp={};
  if(it.importance&&typeof it.importance==="object"){
    CMP_CRITERIA.forEach(function(k){var v=it.importance[k.k];if(["low","mid","high"].indexOf(v)>=0)imp[k.k]=v})
  }
  c.importance=imp;
  c.finalOpt=(typeof it.finalOpt==="number"&&it.finalOpt>=0&&it.finalOpt<out.length)?Math.floor(it.finalOpt):-1;
  return c;
}
function cmpHasContent(c){
  if(c.title.trim()||c.reason.trim())return true;
  for(var i=0;i<c.options.length;i++){
    var o=c.options[i];
    if(o.name.trim()||o.pros.trim()||o.cons.trim()||o.cost.trim()||o.valueRel.trim()||o.unknown.trim()||o.rev)return true;
  }
  return Object.keys(c.importance).length>0||c.finalOpt>=0;
}
function optLabel(c,i){
  var n=c.options[i].name.trim();
  return OPT_LETTERS.charAt(i)+(n?" · "+n:"");
}

function renderCompareView(sub,id){
  $("kList").classList.toggle("on",sub==="list");
  $("kEdit").classList.toggle("on",sub==="edit");
  $("kRes").classList.toggle("on",sub==="result");
  if(sub==="list")renderCompareList();
  else if(sub==="edit")renderCompareEdit(id);
  else renderCompareResult(id);
}
function renderCompareList(){
  var list=sload("compare").map(cmpNorm).filter(cmpHasContent);
  var h='<p class="hint2">중요한 선택을 앞두고 선택지를 나란히 놓고 살펴보는 곳이에요. 점수로 결정하지 않고, 중요도와 최종 선택은 내가 정해요.</p>'
    +'<a class="btn linkbtn" href="#/compare/new">새 비교 ›</a>';
  if(!list.length){
    h+='<div class="card" style="margin-top:12px"><p style="margin:0">아직 만든 비교가 없어요.</p></div>';
  }else{
    h+='<div style="margin-top:12px">'+list.map(function(c){
      var names=c.options.map(function(o,i){return OPT_LETTERS.charAt(i)+(o.name.trim()?" "+trimTo(o.name,14):"")}).join(" · ");
      return '<a class="card slink" href="#/compare/'+encodeURIComponent(c.id)+'"><b>'+esc(trimTo(c.title,40)||"(제목 없음)")+'</b>'
        +'<span>'+esc(names)+'</span>'
        +'<span class="sub2">'+esc(fmtMDW(c.day))+' · '+(c.finalOpt>=0?"정한 선택지: "+esc(OPT_LETTERS.charAt(c.finalOpt)):"비교하는 중")+'</span></a>';
    }).join("")+'</div>';
  }
  $("kList").innerHTML=h;
}

function renderCompareEdit(id){
  var isNew=(id==="new"),item=isNew?null:colFind("compare",id);
  if(!isNew&&!item){
    cmp=null;
    $("kEdit").innerHTML='<div class="card"><p>이 비교를 찾을 수 없어요.</p><a class="btn ghost linkbtn" href="#/compare">목록으로</a></div>';
    return;
  }
  cmp=isNew?cmpBlank():cmpNorm(deepClone(item));
  cmpOpen=0;
  drawCompareEdit();
}
function drawCompareEdit(){
  var c=cmp,h='<a class="backlink" href="#/compare">‹ 비교 목록</a>';
  var core=sload("values").core.map(function(x){return x.label});
  h+='<div class="card"><label for="kTitle">무엇을 두고 고민하나요?</label>'
    +'<input type="text" id="kTitle" maxlength="60" value="'+esc(c.title)+'"></div>';
  c.options.forEach(function(o,i){
    var open=(i===cmpOpen);
    h+='<div class="card copt"><button type="button" class="cohead" data-act="open" data-i="'+i+'" aria-expanded="'+(open?'true':'false')+'">'
      +'<b>선택지 '+OPT_LETTERS.charAt(i)+'</b><span>'+esc(trimTo(o.name,24)||"이름을 적어 주세요")+'</span><i>'+(open?'접기':'펼치기')+'</i></button>';
    if(open){
      h+='<div class="cobody">'
        +'<label for="ko'+i+'_name">선택지 이름</label><input type="text" id="ko'+i+'_name" maxlength="40" value="'+esc(o.name)+'">'
        +'<label for="ko'+i+'_pros">장점</label><textarea id="ko'+i+'_pros">'+esc(o.pros)+'</textarea>'
        +'<label for="ko'+i+'_cons">우려되는 점</label><textarea id="ko'+i+'_cons">'+esc(o.cons)+'</textarea>'
        +'<label for="ko'+i+'_cost">예상 비용</label><input type="text" id="ko'+i+'_cost" maxlength="80" value="'+esc(o.cost)+'">'
        +'<label>되돌릴 가능성</label><div class="chips" style="margin-bottom:12px">'+REVERS.map(function(r){
          return '<button type="button" class="chip'+(o.rev===r[0]?' on':'')+'" data-act="rev" data-i="'+i+'" data-v="'+r[0]+'" aria-pressed="'+(o.rev===r[0]?'true':'false')+'">'+r[1]+'</button>';
        }).join("")+'</div>'
        +'<label for="ko'+i+'_valueRel">내 핵심 가치와의 관계</label>'
        +(core.length?'<p class="hint2" style="margin:0 0 6px">내 핵심 가치: '+core.map(esc).join(", ")+'</p>':'')
        +'<textarea id="ko'+i+'_valueRel">'+esc(o.valueRel)+'</textarea>'
        +'<label for="ko'+i+'_unknown">아직 확인하지 못한 정보</label><textarea id="ko'+i+'_unknown">'+esc(o.unknown)+'</textarea>'
        +(c.options.length>2?'<button type="button" class="btn ghost" data-act="rmopt" data-i="'+i+'" style="margin:0">이 선택지 빼기</button>':'')
        +'</div>';
    }
    h+='</div>';
  });
  if(c.options.length<4)h+='<button type="button" class="btn ghost" data-act="addopt" style="margin:0 0 12px">선택지 추가 (최대 4개)</button>';

  h+='<div class="card"><h3>각 항목은 나에게 얼마나 중요한가요?</h3><p class="hint2">내가 정해요. 점수로 더하지 않아요.</p>';
  CMP_CRITERIA.forEach(function(k){
    h+='<p class="improw"><span>'+esc(k.t)+'</span></p><div class="chips" style="margin-bottom:8px">'+IMPORTANCE.map(function(m){
      var on=c.importance[k.k]===m[0];
      return '<button type="button" class="chip'+(on?' on':'')+'" data-act="imp" data-k="'+k.k+'" data-v="'+m[0]+'" aria-pressed="'+(on?'true':'false')+'">'+m[1]+'</button>';
    }).join("")+'</div>';
  });
  h+='</div>';

  h+='<div class="card"><h3>최종 선택과 이유</h3><p class="hint2">아직 정하지 않았다면 그대로 두어도 괜찮아요.</p><div class="chips">'
    +c.options.map(function(o,i){
      var on=c.finalOpt===i;
      return '<button type="button" class="chip'+(on?' on':'')+'" data-act="fin" data-i="'+i+'" aria-pressed="'+(on?'true':'false')+'">'+esc(optLabel(c,i))+'</button>';
    }).join("")
    +'<button type="button" class="chip'+(c.finalOpt<0?' on':'')+'" data-act="fin" data-i="-1" aria-pressed="'+(c.finalOpt<0?'true':'false')+'">아직 정하지 않았어요</button></div>'
    +'<label for="kReason">그렇게 정한 이유</label><textarea id="kReason">'+esc(c.reason)+'</textarea>'
    +'<p class="hint2" id="kState" aria-live="polite">'+(c.id?"적으면 자동으로 저장돼요.":"한 칸이라도 적으면 자동으로 저장돼요.")+'</p>'
    +'<button type="button" class="btn" data-act="result">비교해서 보기 ›</button></div>';
  if(c.id)h+='<button type="button" class="btn dangerbtn" data-act="del">이 비교 삭제</button>';
  $("kEdit").innerHTML=h;
}
// 화면에 있는 입력 내용을 cmp에 반영한다(없는 칸은 건드리지 않는다).
function cmpSync(){
  if(!cmp||!$("kTitle"))return;
  cmp.title=$("kTitle").value;
  cmp.options.forEach(function(o,i){
    ["name","pros","cons","cost","valueRel","unknown"].forEach(function(k){var e=$("ko"+i+"_"+k);if(e)o[k]=e.value});
  });
  if($("kReason"))cmp.reason=$("kReason").value;
}
function saveCompare(){
  if(!cmp)return;
  cmpSync();
  if(!cmp.id&&!cmpHasContent(cmp))return;      // 아무것도 적지 않았으면 항목을 만들지 않는다
  var firstSave=!cmp.id;
  if(firstSave)cmp.id=uid();
  cmp.at=new Date().toISOString();
  if(!colUpsert("compare",deepClone(cmp))){
    if(firstSave)cmp.id=null;
    sayTo("kState","저장하지 못했어요. 적은 내용은 그대로예요.");
    return;
  }
  if(firstSave){
    swapPath("/compare/"+encodeURIComponent(cmp.id));
    if(!document.querySelector('#kEdit [data-act="del"]')){
      var b=document.createElement("button");b.type="button";b.className="btn dangerbtn";b.setAttribute("data-act","del");b.textContent="이 비교 삭제";$("kEdit").appendChild(b);
    }
  }
  sayTo("kState","저장했어요.");
}
function bindCompare(){
  var box=$("kEdit");
  box.addEventListener("input",function(e){
    var t=e.target;
    if(t&&(t.tagName==="TEXTAREA"||t.tagName==="INPUT")){sayTo("kState","적는 중이에요…");cmpSync();scheduleForm(saveCompare)}
  });
  box.addEventListener("click",function(e){
    var t=e.target.closest?e.target.closest("button[data-act]"):null;
    if(!t||!box.contains(t)||!cmp)return;
    var act=t.getAttribute("data-act"),i=+t.getAttribute("data-i");
    cmpSync();
    if(act==="open"){cmpOpen=(cmpOpen===i)?-1:i;drawCompareEdit();return}
    if(act==="rev"){var v=t.getAttribute("data-v");cmp.options[i].rev=(cmp.options[i].rev===v)?"":v;drawCompareEdit();scheduleForm(saveCompare);return}
    if(act==="imp"){var k=t.getAttribute("data-k"),m=t.getAttribute("data-v");if(cmp.importance[k]===m)delete cmp.importance[k];else cmp.importance[k]=m;drawCompareEdit();scheduleForm(saveCompare);return}
    if(act==="fin"){cmp.finalOpt=i;drawCompareEdit();scheduleForm(saveCompare);return}
    if(act==="addopt"){if(cmp.options.length<4){cmp.options.push(cmpOptBlank());cmpOpen=cmp.options.length-1;drawCompareEdit();scheduleForm(saveCompare)}return}
    if(act==="rmopt"){
      if(cmp.options.length<=2)return;
      if(!confirm("이 선택지를 뺄까요? 적은 내용이 사라져요."))return;
      cmp.options.splice(i,1);
      if(cmp.finalOpt===i)cmp.finalOpt=-1;else if(cmp.finalOpt>i)cmp.finalOpt--;
      cmpOpen=0;drawCompareEdit();scheduleForm(saveCompare);return;
    }
    if(act==="result"){
      flushForm();
      if(!cmp.id){sayTo("kState","먼저 한 칸 이상 적어 주세요.");return}
      go("/compare/"+encodeURIComponent(cmp.id)+"/result");return;
    }
    if(act==="del"){
      if(!cmp.id)return;
      if(!confirm("이 비교를 삭제할까요? 되돌릴 수 없어요."))return;
      if(!colRemove("compare",cmp.id)){alert("저장하지 못했어요. 시크릿 탭이 아닌 곳에서 다시 시도해 주세요.");return}
      cmp=null;go("/compare");
    }
  });
}

function renderCompareResult(id){
  var item=colFind("compare",id);
  if(!item){
    $("kRes").innerHTML='<div class="card"><p>이 비교를 찾을 수 없어요.</p><a class="btn ghost linkbtn" href="#/compare">목록으로</a></div>';
    return;
  }
  var c=cmpNorm(deepClone(item)),impName={low:"낮음",mid:"보통",high:"높음"};
  var h='<a class="backlink" href="#/compare">‹ 비교 목록</a>'
    +'<p class="hint2">내가 쓴 내용을 항목별로 나란히 보여 드려요. 점수로 계산하지 않고, 중요도는 내가 정한 대로 보여 줘요.</p>'
    +'<div class="card"><h3>'+esc(c.title||"(제목 없음)")+'</h3><p class="hint2" style="margin:0">'+esc(fmtMDW(c.day))+'</p></div>';
  CMP_CRITERIA.forEach(function(k){
    var imp=c.importance[k.k];
    h+='<div class="card cres"><h4>'+esc(k.t)+' <span class="imptag">'+(imp?'중요도 '+impName[imp]:'중요도를 정하지 않았어요')+'</span></h4>';
    c.options.forEach(function(o,i){
      var v=(k.k==="rev")?({easy:"되돌리기 쉬워요",hard:"되돌리기 어려워요",unsure:"잘 모르겠어요"}[o.rev]||""):o[k.k].trim();
      h+='<p><b>'+esc(optLabel(c,i))+'</b><br>'+(v?esc(v):'<span class="empty">아직 적지 않았어요.</span>')+'</p>';
    });
    h+='</div>';
  });
  h+='<div class="card"><h4>최종 선택</h4>'
    +(c.finalOpt>=0?'<p><b>'+esc(optLabel(c,c.finalOpt))+'</b></p>':'<p class="empty">아직 정하지 않았어요. 정하지 않는 것도 하나의 선택이에요.</p>')
    +(c.reason.trim()?'<p>'+esc(c.reason)+'</p>':'')+'</div>';
  h+='<a class="btn linkbtn" href="#/compare/'+encodeURIComponent(item.id)+'">고치기</a><a class="btn ghost linkbtn" href="#/compare">목록으로</a>';
  $("kRes").innerHTML=h;
}
