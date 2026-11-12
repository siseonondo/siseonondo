// ---- 공통 화면 도우미 ----
// 감정은 좋고 나쁨 없이 색과 모양으로만 구분한다. (색만으로 구분하지 않도록 모양도 다르게)
var MOOD_STYLE={
  "불안해요":{c:"#B8A9C9",s:"tri"},
  "조급해요":{c:"#E3B98A",s:"dia"},
  "막막해요":{c:"#9FB3C0",s:"sq"},
  "설레요":{c:"#E9A9A0",s:"circ"},
  "차분해요":{c:"#A5AD98",s:"ring"}
};
function moodStyle(label){return MOOD_STYLE[label]||{c:"#C9C0B4",s:"circ"}}
function moodIcon(label,size){
  var m=moodStyle(label),z=size||14,c=m.c,sh;
  if(m.s==="tri")sh='<path d="M7 2l5.5 10h-11z" fill="'+c+'"/>';
  else if(m.s==="dia")sh='<path d="M7 1.5l5.5 5.5-5.5 5.5-5.5-5.5z" fill="'+c+'"/>';
  else if(m.s==="sq")sh='<rect x="2" y="2" width="10" height="10" rx="2" fill="'+c+'"/>';
  else if(m.s==="ring")sh='<circle cx="7" cy="7" r="4.6" fill="none" stroke="'+c+'" stroke-width="2.6"/>';
  else sh='<circle cx="7" cy="7" r="5.2" fill="'+c+'"/>';
  return '<svg class="mi" viewBox="0 0 14 14" width="'+z+'" height="'+z+'" aria-hidden="true">'+sh+'</svg>';
}

var DOW=["일","월","화","수","목","금","토"];
function parseDay(s){
  var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||"");
  return m?new Date(+m[1],+m[2]-1,+m[3]):null;
}
function fmtMD(s){var d=parseDay(s);return d?(d.getMonth()+1)+"월 "+d.getDate()+"일":(s||"")}
function fmtMDW(s){var d=parseDay(s);return d?(d.getMonth()+1)+"월 "+d.getDate()+"일 "+DOW[d.getDay()]+"요일":(s||"")}
function recIndexById(id){
  var l=load();
  for(var i=0;i<l.length;i++){if(l[i].id===id)return i}
  return -1;
}

// ---- 입력 폼 자동 저장 ----
// 입력이 멈춘 뒤 0.5초 만에 저장하고, 화면을 옮기거나 앱을 닫을 때는 바로 저장한다.
var formTimer=null,formPending=null;
function scheduleForm(fn){
  formPending=fn;
  if(formTimer!==null)clearTimeout(formTimer);
  formTimer=setTimeout(function(){formTimer=null;var f=formPending;formPending=null;if(f)f()},500);
}
function flushForm(){
  if(formTimer!==null){clearTimeout(formTimer);formTimer=null}
  if(formPending){var f=formPending;formPending=null;f()}
}
window.addEventListener("pagehide",flushForm);
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden")flushForm()});
function sayTo(id,text){var e=$(id);if(e)e.textContent=text}
function trimTo(s,n){s=String(s||"").replace(/\s+/g," ").trim();return s.length>n?s.slice(0,n)+"…":s}

// ---- 둘째 묶음 공통 도우미 ----
// 저장소 캐시에 있는 객체를 직접 고치지 않도록, 편집은 항상 복사본으로 한다.
function deepClone(o){return JSON.parse(JSON.stringify(o))}
function strOf(v,max){return typeof v==="string"?(max?v.slice(0,max):v):""}
// 최근 선택 기록 중에서 하나를 고르는 목록(라디오). 선택하지 않음도 고를 수 있다.
function recChooserHtml(name,selectedId){
  var recs=load().slice(0,30);
  var h='<label class="sent"><input type="radio" name="'+name+'" value=""'+(!selectedId?' checked':'')+'><span>연결하지 않아요</span></label>';
  recs.forEach(function(r){
    h+='<label class="sent"><input type="radio" name="'+name+'" value="'+esc(r.id)+'"'+(selectedId===r.id?' checked':'')+'><span>'+esc(r.date)+' · '+esc(trimTo(r.issue,30))+(r.pick?' · '+esc(trimTo(r.pick,30)):'')+'</span></label>';
  });
  return h;
}
function checkedRadio(name){
  var e=document.querySelector('input[name="'+name+'"]:checked');
  return e?e.value:"";
}
// 날짜 선택 칩(내일, 3일 뒤, ...)과 직접 고르기 날짜 입력
var DATE_CHIPS=[["내일",1],["3일 뒤",3],["1주일 뒤",7],["2주일 뒤",14]];
function dateChipsHtml(dateVal,prefix){
  var h=DATE_CHIPS.map(function(c){
    var d=dueFrom(c[1]);
    return '<button type="button" class="chip'+(dateVal===d?' on':'')+'" data-'+prefix+'="'+d+'">'+c[0]+'</button>';
  }).join("");
  h+='<button type="button" class="chip'+(!dateVal?' on':'')+'" data-'+prefix+'="">정하지 않음</button>';
  return h;
}
