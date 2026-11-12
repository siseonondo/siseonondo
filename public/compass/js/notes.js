// ---- 생각 분별 노트 ----
// 사실, 해석, 감정을 나눠 적는 노트. AI 분석 없이 쓸 수 있고, 결과 화면은 쓴 내용을 구분해서 그대로 보여 준다.
var NOTE_FIELDS=[
  {k:"event",q:"어떤 일이 있었나요?",h:"있었던 일을 있는 그대로 적어 보세요.",title:"일어난 일",cls:"nb-event"},
  {k:"facts",q:"확인할 수 있는 사실은 무엇인가요?",h:"누가 봐도 같게 말할 수 있는 것만 적어 보세요.",title:"사실",cls:"nb-facts"},
  {k:"interp",q:"그 상황을 어떻게 해석했나요?",h:"내가 그렇게 받아들인 생각을 적어 보세요.",title:"해석",cls:"nb-interp"},
  {k:"emotion",q:"어떤 감정이 들었나요?",h:"그때 든 감정을 적어 보세요.",title:"감정",cls:"nb-emotion"},
  {k:"alt",q:"다른 관점에서 바라볼 가능성은 있나요?",h:"같은 일을 다르게 볼 수 있는 길이 있다면 적어 보세요.",title:"다른 관점",cls:"nb-alt"}
];
var nCur=null;   // 편집 중인 노트 id (처음 입력하기 전에는 null)

function noteFilled(n){
  var c=0;
  NOTE_FIELDS.forEach(function(f){if(n&&String(n[f.k]||"").trim())c++});
  return c;
}
function renderNotesView(sub,id){
  $("nList").classList.toggle("on",sub==="list");
  $("nEdit").classList.toggle("on",sub==="edit");
  $("nRes").classList.toggle("on",sub==="result");
  if(sub==="list")renderNoteList();
  else if(sub==="edit")renderNoteEdit(id);
  else renderNoteResult(id);
}
function renderNoteList(){
  var list=sload("notes").filter(function(n){return n&&noteFilled(n)>0});
  var h='<p class="hint2">일어난 일을 사실, 해석, 감정으로 나눠 적어 보는 노트예요. AI 없이도 쓸 수 있어요.</p>'
    +'<a class="btn linkbtn" href="#/notes/new">새 노트 ›</a>';
  if(!list.length){
    h+='<div class="card" style="margin-top:12px"><p style="margin:0">아직 쓴 노트가 없어요.</p></div>';
  }else{
    h+='<div style="margin-top:12px">'+list.map(function(n){
      var c=noteFilled(n);
      return '<a class="card slink" href="#/notes/'+encodeURIComponent(n.id)+'"><b>'+esc(trimTo(n.event,50)||"(적은 일이 없어요)")+'</b>'
        +'<span class="sub2">'+esc(fmtMDW(n.day))+' · '+NOTE_FIELDS.length+'칸 중 '+c+'칸 작성</span></a>';
    }).join("")+'</div>';
  }
  $("nList").innerHTML=h;
}
function renderNoteEdit(id){
  var isNew=(id==="new"),item=isNew?null:colFind("notes",id);
  if(!isNew&&!item){
    nCur=null;
    $("nEdit").innerHTML='<div class="card"><p>이 노트를 찾을 수 없어요.</p><a class="btn ghost linkbtn" href="#/notes">목록으로</a></div>';
    return;
  }
  nCur=item?item.id:null;
  var h='<a class="backlink" href="#/notes">‹ 노트 목록</a><div class="card">';
  NOTE_FIELDS.forEach(function(f,i){
    h+='<label for="n_'+f.k+'">'+(i+1)+'. '+esc(f.q)+'</label><p class="hint2" style="margin:0 0 6px">'+esc(f.h)+'</p>'
      +'<textarea id="n_'+f.k+'" data-nk="'+f.k+'">'+esc(item?(item[f.k]||""):"")+'</textarea>';
  });
  h+='<p class="hint2" id="nState" aria-live="polite">'+(item?"적으면 자동으로 저장돼요.":"한 칸이라도 적으면 자동으로 저장돼요.")+'</p>'
    +'<button type="button" class="btn" id="nResult">결과 보기 ›</button></div>';
  if(item)h+='<button type="button" class="btn dangerbtn" id="nDel">이 노트 삭제</button>';
  $("nEdit").innerHTML=h;
}
function saveNoteForm(){
  var vals={},any=false;
  NOTE_FIELDS.forEach(function(f){var e=$("n_"+f.k);vals[f.k]=e?e.value:"";if(vals[f.k].trim())any=true});
  var cur=nCur?colFind("notes",nCur):null;
  if(!cur&&!any)return;                         // 아무것도 적지 않았으면 노트를 만들지 않는다
  var item=cur?copyRec(cur):{id:uid(),day:todayStr()};
  NOTE_FIELDS.forEach(function(f){item[f.k]=vals[f.k]});
  item.at=new Date().toISOString();
  if(!colUpsert("notes",item)){sayTo("nState","저장하지 못했어요. 적은 내용은 그대로예요.");return}
  if(!nCur){
    nCur=item.id;swapPath("/notes/"+encodeURIComponent(item.id));
    if(!$("nDel")){var b=document.createElement("button");b.type="button";b.className="btn dangerbtn";b.id="nDel";b.textContent="이 노트 삭제";$("nEdit").appendChild(b)}
  }
  sayTo("nState","저장했어요.");
}
function renderNoteResult(id){
  var item=colFind("notes",id);
  if(!item){
    $("nRes").innerHTML='<div class="card"><p>이 노트를 찾을 수 없어요.</p><a class="btn ghost linkbtn" href="#/notes">목록으로</a></div>';
    return;
  }
  var h='<a class="backlink" href="#/notes">‹ 노트 목록</a>'
    +'<p class="hint2">내가 쓴 내용을 구분해서 보여 드려요. 맞고 틀림은 판단하지 않아요.</p>'
    +'<p class="hint2"><b>'+esc(fmtMDW(item.day))+'</b></p>';
  NOTE_FIELDS.forEach(function(f){
    var t=String(item[f.k]||"").trim();
    h+='<div class="nblock '+f.cls+'"><h4>'+esc(f.title)+'</h4>'
      +(t?'<p>'+esc(t)+'</p>':'<p class="empty">아직 적지 않았어요.</p>')+'</div>';
  });
  h+='<a class="btn linkbtn" href="#/notes/'+encodeURIComponent(item.id)+'">고치기</a><a class="btn ghost linkbtn" href="#/notes">목록으로</a>';
  $("nRes").innerHTML=h;
}
function bindNotes(){
  var box=$("nEdit");
  box.addEventListener("input",function(e){
    if(e.target&&e.target.tagName==="TEXTAREA"){sayTo("nState","적는 중이에요…");scheduleForm(saveNoteForm)}
  });
  box.addEventListener("click",function(e){
    var t=e.target.closest?e.target.closest("button"):null;
    if(!t||!box.contains(t))return;
    if(t.id==="nResult"){
      flushForm();
      if(!nCur){sayTo("nState","먼저 한 칸 이상 적어 주세요.");return}
      go("/notes/"+encodeURIComponent(nCur)+"/result");
    }else if(t.id==="nDel"){
      if(!nCur)return;
      if(!confirm("이 노트를 삭제할까요? 되돌릴 수 없어요."))return;
      if(!colRemove("notes",nCur)){alert("저장하지 못했어요. 시크릿 탭이 아닌 곳에서 다시 시도해 주세요.");return}
      nCur=null;go("/notes");
    }
  });
}
