// ---- 데이터 계층 ----
// compass_records(기존 선택 기록)는 그대로 쓰고, 기록에 id와 day(YYYY-MM-DD)만 덧붙인다.
// 새 컬렉션(compass_moods, compass_questions, compass_meta)은 키를 따로 둔다.
var KEY="compass_records",cache=null;
var STORE_KEYS={moods:"compass_moods",questions:"compass_questions",meta:"compass_meta",
  values:"compass_values",strengths:"compass_strengths",notes:"compass_notes",
  compare:"compass_compare",defer:"compass_defer",plans:"compass_plans",
  favs:"compass_favs",reviews:"compass_reviews",timeline:"compass_timeline"};
var scache={};

function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
function p2(n){return n<10?"0"+n:""+n}
function todayStr(){var d=new Date();return d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate())}
function validDay(s){return typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s)}
// "2026. 11. 12." 같은 지역화 날짜 문자열에서 YYYY-MM-DD를 꺼낸다. 못 읽으면 "".
function dayOf(s){
  var m=String(s||"").match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if(!m)return "";
  var mo=+m[2],d=+m[3];
  if(mo<1||mo>12||d<1||d>31)return "";
  return m[1]+"-"+p2(mo)+"-"+p2(d);
}
// 기록에 id와 day가 없으면 채운다(기존 필드는 건드리지 않는다). 바뀌었으면 true.
function normRec(r){
  var ch=false;
  if(!r||typeof r!=="object")return false;
  if(!r.id){r.id=uid();ch=true}
  if(typeof r.day!=="string"){r.day=dayOf(r.date);ch=true}
  else if(r.day===""){var d=dayOf(r.date);if(d){r.day=d;ch=true}}
  return ch;
}

function load(){
  if(cache===null){
    var arr;
    try{arr=JSON.parse(localStorage.getItem(KEY))}catch(e){arr=null}
    if(!Array.isArray(arr))arr=[];
    var changed=false;
    for(var i=0;i<arr.length;i++){if(normRec(arr[i]))changed=true}
    cache=arr;
    if(changed){try{localStorage.setItem(KEY,JSON.stringify(arr))}catch(e){}}
  }
  return cache;
}
// 호출하는 쪽은 load()가 돌려준 배열·객체를 직접 고치지 않고 새로 만들어 넘긴다.
// 그래서 실패해도 캐시는 그대로 두면 된다.
function persist(list){
  try{
    localStorage.setItem(KEY,JSON.stringify(list));
    cache=list;
    return true;
  }catch(e){
    return false;
  }
}
function copyRec(r){
  var c={};
  for(var k in r){if(Object.prototype.hasOwnProperty.call(r,k))c[k]=r[k]}
  return c;
}
function recKey(r){return [r.date,r.mood,r.issue,r.pick||"",r.ai||""].join("|")}

// 컬렉션: moods(날짜별 기분), questions(오늘의 질문), meta(버전·설정)
function sload(name){
  if(scache[name]===undefined){
    var v=null;
    try{v=JSON.parse(localStorage.getItem(STORE_KEYS[name]))}catch(e){v=null}
    if(name==="meta"){if(!v||typeof v!=="object"||Array.isArray(v))v={version:2}}
    else if(name==="values"){
      if(!v||typeof v!=="object"||Array.isArray(v))v={};
      if(!Array.isArray(v.candidates))v.candidates=[];
      if(!Array.isArray(v.custom))v.custom=[];
      if(!Array.isArray(v.core))v.core=[];
      if(!Array.isArray(v.history))v.history=[];
    }
    else if(!Array.isArray(v))v=[];
    scache[name]=v;
  }
  return scache[name];
}
function spersist(name,val){
  try{
    localStorage.setItem(STORE_KEYS[name],JSON.stringify(val));
    scache[name]=val;
    return true;
  }catch(e){
    return false;
  }
}
window.addEventListener("storage",function(e){
  if(e.key===KEY||e.key===null)cache=null;
  for(var n in STORE_KEYS){if(e.key===STORE_KEYS[n]||e.key===null)delete scache[n]}
});

// id가 있는 항목 컬렉션(strengths, notes, compare, defer, plans)을 다루는 도우미.
// 항상 새 배열을 만들어 저장하고, 성공했을 때만 캐시가 바뀐다.
function colFind(name,id){
  var a=sload(name);
  for(var i=0;i<a.length;i++){if(a[i]&&a[i].id===id)return a[i]}
  return null;
}
function colUpsert(name,item){
  var a=sload(name).slice(),idx=-1;
  for(var i=0;i<a.length;i++){if(a[i]&&a[i].id===item.id){idx=i;break}}
  if(idx>=0)a[idx]=item;else a.unshift(item);   // 새 항목은 맨 앞(최신순)
  return spersist(name,a);
}
function colRemove(name,id){
  var a=sload(name),n=[];
  for(var i=0;i<a.length;i++){if(a[i]&&a[i].id!==id)n.push(a[i])}
  return spersist(name,n);
}
// 값(핵심 가치) 저장
function valuesSave(v){return spersist("values",v)}

// 재방문 여부: 저장된 기록, 기분 체크, 질문 답, 가치·강점·노트 등이 하나라도 있으면 재방문
function hasUserData(){
  if(load().length>0)return true;
  if(sload("moods").length>0)return true;
  var q=sload("questions");
  for(var i=0;i<q.length;i++){if(q[i]&&q[i].answer)return true}
  var v=sload("values");
  if(v.candidates.length||v.core.length)return true;
  var cols=["strengths","notes","compare","defer","plans","reviews","timeline"];
  for(i=0;i<cols.length;i++){if(sload(cols[i]).length>0)return true}
  return false;
}

// 백업: records는 옛 형식(v1)과 같은 자리에 두어 옛 백업도, 새 백업도 서로 읽을 수 있다.
function backupText(){
  return JSON.stringify({app:"compass",version:2,exportedAt:new Date().toISOString(),
    records:load(),moods:sload("moods"),questions:sload("questions"),
    values:sload("values"),strengths:sload("strengths"),notes:sload("notes"),
    compare:sload("compare"),defer:sload("defer"),plans:sload("plans"),
    favs:sload("favs"),reviews:sload("reviews"),timeline:sload("timeline")});
}
// 백업에 들어 있는 기분 체크와 질문 답을 현재 데이터에 합친다(하루에 하나, 이미 있는 날은 건너뜀).
function restoreExtras(data){
  var out={moods:0,questions:0};
  if(!data||typeof data!=="object"||Array.isArray(data))return out;
  var seen,cur;
  if(Array.isArray(data.moods)){
    cur=sload("moods").slice();seen={};
    cur.forEach(function(m){seen[m.day]=1});
    data.moods.forEach(function(m){
      if(m&&validDay(m.day)&&typeof m.mood==="string"&&!seen[m.day]){
        seen[m.day]=1;
        cur.push({id:(typeof m.id==="string"&&m.id)?m.id:uid(),day:m.day,mood:m.mood,note:typeof m.note==="string"?m.note:"",at:typeof m.at==="string"?m.at:""});
        out.moods++;
      }
    });
    if(out.moods&&!spersist("moods",cur))out.moods=-1;
  }
  if(Array.isArray(data.questions)){
    cur=sload("questions").slice();seen={};
    cur.forEach(function(q){seen[q.day]=1});
    data.questions.forEach(function(q){
      if(q&&validDay(q.day)&&typeof q.qid==="string"&&!seen[q.day]){
        seen[q.day]=1;
        cur.push({id:(typeof q.id==="string"&&q.id)?q.id:uid(),day:q.day,qid:q.qid,answer:typeof q.answer==="string"?q.answer:"",skipped:!!q.skipped,at:typeof q.at==="string"?q.at:""});
        out.questions++;
      }
    });
    if(out.questions&&!spersist("questions",cur))out.questions=-1;
  }
  out.values=mergeValues(data.values);
  ["strengths","notes","compare","defer","plans","reviews","timeline"].forEach(function(n){out[n]=mergeById(n,data[n])});
  out.favs=mergeFavs(data.favs);
  return out;
}
// 즐겨찾기는 "유형:번호" 문자열의 합집합이다. 저장에 실패하면 -1.
function mergeFavs(incoming){
  if(!Array.isArray(incoming))return 0;
  var cur=sload("favs").slice(),seen={},n=0;
  cur.forEach(function(x){seen[x]=1});
  incoming.forEach(function(x){
    if(typeof x==="string"&&/^[a-z]+:.+$/.test(x)&&x.length<80&&!seen[x]){seen[x]=1;cur.push(x);n++}
  });
  if(n&&!spersist("favs",cur))return -1;
  return n;
}
// id가 있는 항목을 id 기준으로 합친다(이미 있는 id는 건너뜀). 저장에 실패하면 -1.
function mergeById(name,incoming){
  if(!Array.isArray(incoming))return 0;
  var cur=sload(name).slice(),seen={},n=0;
  cur.forEach(function(x){if(x&&x.id)seen[x.id]=1});
  incoming.forEach(function(x){
    if(x&&typeof x==="object"&&!Array.isArray(x)&&typeof x.id==="string"&&x.id&&!seen[x.id]){seen[x.id]=1;cur.push(x);n++}
  });
  if(n&&!spersist(name,cur))return -1;
  return n;
}
function strList(a){
  var out=[];
  if(Array.isArray(a)){a.forEach(function(x){if(typeof x==="string"&&x&&out.indexOf(x)<0)out.push(x)})}
  return out;
}
// 가치는 현재 값이 비어 있을 때만 가져온다(현재 값 유지). 가져오면 1, 건너뛰면 0, 저장 실패 -1.
function mergeValues(inc){
  if(!inc||typeof inc!=="object"||Array.isArray(inc))return 0;
  var cur=sload("values");
  if(cur.candidates.length||cur.core.length)return 0;
  var v={candidates:strList(inc.candidates),custom:strList(inc.custom),core:[],history:[]};
  if(Array.isArray(inc.core)){
    inc.core.forEach(function(c){
      if(c&&typeof c.label==="string"&&c.label&&v.core.length<5){
        v.core.push({label:c.label,meaning:typeof c.meaning==="string"?c.meaning:"",reason:typeof c.reason==="string"?c.reason:""});
      }
    });
  }
  if(Array.isArray(inc.history)){
    inc.history.forEach(function(h){
      if(h&&typeof h.at==="string")v.history.push({at:h.at,day:typeof h.day==="string"?h.day:h.at.slice(0,10),labels:strList(h.labels)});
    });
  }
  if(!v.candidates.length&&!v.core.length)return 0;
  return valuesSave(v)?1:-1;
}
// 불러오기 결과 문구(기분 체크·질문 답 외에 가치, 강점 등도 안내한다)
function extrasMessage(ex){
  var names=[["moods","기분 체크"],["questions","질문 답"],["values","가치"],["strengths","강점"],["notes","생각 분별 노트"],["compare","선택 비교"],["defer","결정 유예"],["plans","실행 계획"],["reviews","회고"],["timeline","변화 타임라인"],["favs","즐겨찾기"]];
  var parts=[];
  names.forEach(function(n){
    var c=ex[n[0]];
    if(c>0)parts.push(n[0]==="values"?"나의 가치":n[1]+" "+c+"개");
  });
  return parts.length?" "+parts.join(", ")+"도 불러왔어요.":"";
}
// 이 기기에 저장된 나침반 데이터를 모두 지운다.
function wipeAll(){
  var keys=[],i,k;
  try{
    for(i=0;i<localStorage.length;i++){k=localStorage.key(i);if(k&&k.indexOf("compass_")===0)keys.push(k)}
    for(i=0;i<keys.length;i++)localStorage.removeItem(keys[i]);
  }catch(e){return false}
  cache=null;scache={};
  return true;
}
