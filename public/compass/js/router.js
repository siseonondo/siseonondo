// ---- 화면 이동(해시 주소)과 하단 내비게이션 ----
// 주소 예: #/home  #/records  #/records/list  #/records/questions  #/choice  #/change  #/settings  #/landing  #/flow
// 작성 흐름(1~3단계)은 모두 #/flow 하나로 묶어, 뒤로 가기를 누르면 작성 흐름을 빠져나간다.
var ROUTES={
  "/landing":{sec:"s0",kind:"plain"},
  "/home":{sec:"sH",kind:"tab",tab:"home"},
  "/records":{sec:"sR",kind:"tab",tab:"records",sub:"cal"},
  "/records/list":{sec:"sR",kind:"tab",tab:"records",sub:"list"},
  "/records/questions":{sec:"sR",kind:"tab",tab:"records",sub:"q"},
  "/choice":{sec:"sC",kind:"tab",tab:"choice"},
  "/change":{sec:"sX",kind:"tab",tab:"change",sub:"hub"},
  "/change/reviews":{sec:"sX",kind:"tab",tab:"change",sub:"revList"},
  "/change/reviews/:key":{sec:"sX",kind:"tab",tab:"change",sub:"revEdit"},
  "/change/timeline":{sec:"sX",kind:"tab",tab:"change",sub:"tlList"},
  "/change/timeline/:id":{sec:"sX",kind:"tab",tab:"change",sub:"tlEdit"},
  "/change/dash":{sec:"sX",kind:"tab",tab:"change",sub:"dash"},
  "/change/report":{sec:"sX",kind:"tab",tab:"change",sub:"report"},
  "/settings":{sec:"sS",kind:"plain"},
  "/values":{sec:"sV",kind:"tab",tab:"home",sub:"values"},
  "/values/strengths":{sec:"sV",kind:"tab",tab:"home",sub:"str"},
  "/values/strengths/:id":{sec:"sV",kind:"tab",tab:"home",sub:"strEdit"},
  "/notes":{sec:"sN",kind:"tab",tab:"choice",sub:"list"},
  "/notes/:id":{sec:"sN",kind:"tab",tab:"choice",sub:"edit"},
  "/notes/:id/result":{sec:"sN",kind:"tab",tab:"choice",sub:"result"},
  "/compare":{sec:"sK",kind:"tab",tab:"choice",sub:"list"},
  "/compare/:id":{sec:"sK",kind:"tab",tab:"choice",sub:"edit"},
  "/compare/:id/result":{sec:"sK",kind:"tab",tab:"choice",sub:"result"},
  "/defer":{sec:"sD",kind:"tab",tab:"choice",sub:"list"},
  "/defer/:id":{sec:"sD",kind:"tab",tab:"choice",sub:"edit"},
  "/plans":{sec:"sP",kind:"tab",tab:"choice",sub:"list"},
  "/plans/:id":{sec:"sP",kind:"tab",tab:"choice",sub:"edit"},
  "/flow":{kind:"flow"}
};
// 항목 번호가 들어가는 주소(예: #/notes/abc123)
var PATTERNS=[
  {re:/^\/values\/strengths\/([^\/]+)$/,key:"/values/strengths/:id"},
  {re:/^\/notes\/([^\/]+)\/result$/,key:"/notes/:id/result"},
  {re:/^\/notes\/([^\/]+)$/,key:"/notes/:id"},
  {re:/^\/compare\/([^\/]+)\/result$/,key:"/compare/:id/result"},
  {re:/^\/compare\/([^\/]+)$/,key:"/compare/:id"},
  {re:/^\/defer\/([^\/]+)$/,key:"/defer/:id"},
  {re:/^\/plans\/([^\/]+)$/,key:"/plans/:id"},
  {re:/^\/change\/reviews\/([^\/]+)$/,key:"/change/reviews/:key"},
  {re:/^\/change\/timeline\/([^\/]+)$/,key:"/change/timeline/:id"}
];
function matchRoute(p){
  if(ROUTES[p])return {r:ROUTES[p],id:null};
  for(var i=0;i<PATTERNS.length;i++){
    var m=PATTERNS[i].re.exec(p);
    if(m){var id=m[1];try{id=decodeURIComponent(id)}catch(e){}return {r:ROUTES[PATTERNS[i].key],id:id}}
  }
  return null;
}
// 주소만 바꾸고 다시 그리지는 않는다(새 항목을 처음 저장할 때 #/notes/new를 #/notes/<번호>로 바꾸는 용도)
function swapPath(path){
  try{history.replaceState(null,"","#"+path);lastRendered=path}catch(e){}
}
var routerBooted=false,ignoredHash=null,lastRendered="";

// 첫 방문이면 랜딩, 재방문이면 개인 홈
function startPath(){return hasUserData()?"/home":"/landing"}
function currentPath(){return (location.hash||"").replace(/^#/,"")}
// 해시를 바꾸되, 우리가 바꾼 것은 hashchange에서 다시 그리지 않게 표시해 둔다.
function setHash(path){
  if(currentPath()!==path){ignoredHash="#"+path;location.hash="#"+path}
}
function go(path){setHash(path);renderRoute()}
function replacePath(path){
  try{history.replaceState(null,"","#"+path)}catch(e){ignoredHash="#"+path;location.hash="#"+path}
  renderRoute();
}
window.addEventListener("hashchange",function(){
  if(ignoredHash!==null&&location.hash===ignoredHash){ignoredHash=null;return}
  ignoredHash=null;
  // 같은 주소를 이미 그렸다면(연달아 이동해 hashchange가 두 번 올 때) 다시 그리지 않는다
  if(currentPath()===lastRendered)return;
  renderRoute();
});

function activateSection(id){
  Array.prototype.forEach.call(document.querySelectorAll(".screen"),function(s){s.classList.toggle("on",s.id===id)});
}
// 작성 흐름에서만 상단 제목과 진행 막대를 보이고, 하단 내비는 탭 화면에서만 보인다.
function applyChrome(kind,step){
  var flow=(kind==="flow");
  document.querySelector(".wrap > h1").style.display=flow?"":"none";
  document.querySelector(".progress").style.display=flow?"":"none";
  $("stepText").style.display=flow?"":"none";
  $("tabbar").style.display=(kind==="tab")?"block":"none";
  document.querySelector(".wrap").className="wrap"+(kind==="tab"?" hasnav":"")+(flow&&step===3?" s3on":"");
}
function setTab(tab){
  Array.prototype.forEach.call(document.querySelectorAll("#tabbar a"),function(a){
    var on=a.getAttribute("data-tab")===tab;
    a.classList.toggle("on",on);
    if(on)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");
  });
}
// 작성 흐름의 각 단계로 들어갈 때(app.js의 show)
function enterFlow(n){
  setHash("/flow");lastRendered="/flow";
  activateSection("s"+n);
  applyChrome("flow",n);
  setTab("");
}

function renderRoute(){
  var p=currentPath();
  if(!p){replacePath(startPath());return}
  var m=matchRoute(p),r=m?m.r:null;
  if(!r){replacePath(startPath());return}
  if(r.kind==="flow"){
    // 새로고침으로 #/flow에 바로 들어오면 작성 중이던 상태가 없으니 시작 화면으로 보낸다
    if(!routerBooted){routerBooted=true;replacePath(startPath());return}
    show(lastStep>=1&&lastStep<=3?lastStep:1);
    return;
  }
  routerBooted=true;lastRendered=p;
  flushDraft();flushQuestion();flushForm();curScreen=0;
  activateSection(r.sec);
  applyChrome(r.kind);
  setTab(r.tab||"");
  if(r.sec==="s0")renderLanding();
  else if(r.sec==="sH")renderHome();
  else if(r.sec==="sR")renderRecords(r.sub);
  else if(r.sec==="sC")renderChoice();
  else if(r.sec==="sX")renderChange(r.sub,m.id);
  else if(r.sec==="sS")renderSettings();
  else if(r.sec==="sV")renderValuesView(r.sub,m.id);
  else if(r.sec==="sN")renderNotesView(r.sub,m.id);
  else if(r.sec==="sK")renderCompareView(r.sub,m.id);
  else if(r.sec==="sD")renderDeferView(r.sub,m.id);
  else if(r.sec==="sP")renderPlansView(r.sub,m.id);
  window.scrollTo(0,0);
}
