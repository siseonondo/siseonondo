// ---- 자기경영 리포트 ----
// 선택한 기간의 기록을 항목별로 모아 한 장의 글로 만든다. 사용자가 쓴 글을 그대로 옮기고, 앱이 해석을 덧붙이지 않는다.
// 화면 보기·복사·.txt 파일 저장이 모두 같은 자료(reportModel)에서 만들어진다. 기록은 이 기기 밖으로 자동 전송되지 않는다.
var RP_PERIODS=[["month","이번 달"],["lastmonth","지난 달"],["week","이번 주"],["lastweek","지난 주"],["all","전체"],["custom","직접 정하기"]];
var rp={key:"month",from:"",to:""};

function reportRange(){
  var t=todayStr(),ws=weekStartOf(t),b;
  if(rp.key==="month"){b=monthBounds(0);return {start:b.start,end:b.end,title:b.start.slice(0,4)+"년 "+b.n+"월"}}
  if(rp.key==="lastmonth"){b=monthBounds(-1);return {start:b.start,end:b.end,title:b.start.slice(0,4)+"년 "+b.n+"월"}}
  if(rp.key==="week")return {start:ws,end:addDaysStr(ws,6),title:fmtMD(ws)+" ~ "+fmtMD(addDaysStr(ws,6))};
  if(rp.key==="lastweek"){var s=addDaysStr(ws,-7);return {start:s,end:addDaysStr(s,6),title:fmtMD(s)+" ~ "+fmtMD(addDaysStr(s,6))}}
  if(rp.key==="all")return {start:"",end:"9999-12-31",all:true,title:"전체 기간"};
  if(!validDate(rp.from)||!validDate(rp.to))return {error:"시작일과 마지막 날을 모두 골라 주세요."};
  if(rp.from>rp.to)return {error:"시작일이 마지막 날보다 늦어요. 날짜를 다시 골라 주세요."};
  return {start:rp.from,end:rp.to,title:fmtMD(rp.from)+" ~ "+fmtMD(rp.to)+" ("+rp.from.slice(0,4)+")"};
}
function rpIn(rg,day){return rg.all?true:(!!day&&day>=rg.start&&day<=rg.end)}
function rpQ(s){return "“"+trimTo(s,80)+"”"}
function rpCountText(map,keys){return keys.map(function(k){return k+" "+map[k]}).join(" · ")}

// 자료: [{title, lines:[문장...]}]
function reportModel(rg){
  var secs=[],recs=load().filter(function(r){return r&&typeof r==="object"&&rpIn(rg,validDay(r.day)?r.day:"")}),i;
  var feed=buildFeed().filter(function(it){return rpIn(rg,it.day)});
  var byType={};feed.forEach(function(it){byType[it.type]=(byType[it.type]||0)+1});
  var s1=["기간: "+rg.title,"남긴 기록: 모두 "+feed.length+"개"+(feed.length?" ("+FEED_TYPES.filter(function(t){return byType[t[0]]}).map(function(t){return t[1]+" "+byType[t[0]]}).join(" · ")+")":"")];
  var days=feed.map(function(it){return it.day}).filter(Boolean).sort();
  if(days.length)s1.push("처음 기록한 날 "+fmtMD(days[0])+" · 마지막 기록한 날 "+fmtMD(days[days.length-1]));
  if(feed.length<REVIEW_MIN)s1.push("이 기간의 기록이 "+REVIEW_MIN+"개보다 적어서 있는 내용만 간단히 담았어요.");
  secs.push({title:"기록 기간",lines:s1});

  var s2=[],kinds={};
  recs.slice(0,5).forEach(function(r){if(strOf(r.issue).trim())s2.push(rpQ(r.issue)+" ("+(validDay(r.day)?fmtMD(r.day):"날짜 없음")+")")});
  recs.forEach(function(r){if(r.kind)kinds[r.kind]=(kinds[r.kind]||0)+1});
  var kk=Object.keys(kinds).sort(function(a,b){return kinds[b]-kinds[a]});
  if(kk.length)s2.push("고민 유형: "+rpCountText(kinds,kk));
  if(recs.length>5)s2.push("그 밖에 "+(recs.length-5)+"개의 고민 기록이 더 있어요.");
  secs.push({title:"주요 고민",lines:s2});

  var map=buildDayMap(),mc=moodCountsIn(map,rg.all?"0000-01-01":rg.start,rg.end);
  var rep=Object.keys(mc.counts).filter(function(k){return mc.counts[k]>=2}).sort(function(a,b){return mc.counts[b]-mc.counts[a]});
  secs.push({title:"반복적으로 등장한 감정",lines:rep.length?[rep.map(function(k){return k+" "+mc.counts[k]+"번"}).join(" · "),"같은 감정이 2번 이상 기록된 경우만 적었어요."]:[]});

  var s4=[],vs=sload("values"),core=(vs&&Array.isArray(vs.core))?vs.core:[],used={};
  recs.slice(0,5).forEach(function(r){if(strOf(r.crit).trim())s4.push("내 기준: "+rpQ(r.crit))});
  recs.forEach(function(r){String(r.vals||"").split("|").forEach(function(v){if(v)used[v]=(used[v]||0)+1})});
  var uk=Object.keys(used).sort(function(a,b){return used[b]-used[a]}).slice(0,5);
  if(uk.length)s4.push("선택 기록에 이어 둔 가치: "+rpCountText(used,uk));
  var coreLabels=core.map(function(c){return strOf(c&&c.label)}).filter(Boolean);
  if(coreLabels.length)s4.push("내가 정한 핵심 가치: "+coreLabels.join(" · "));
  secs.push({title:"중요하게 생각한 기준",lines:s4});

  var favs=sload("favs"),s5=[];
  recs.forEach(function(r){if(r.id&&favs.indexOf("rec:"+r.id)>=0)s5.push(rpQ(r.issue)+(strOf(r.pick).trim()?" → 선택: "+rpQ(r.pick):""))});
  secs.push({title:"기억에 남는 선택 (별표로 표시한 기록)",lines:s5.slice(0,8)});

  var s6=[],s7=[];
  recs.forEach(function(r){if(strOf(r.learn).trim())s6.push("배운 점: "+rpQ(r.learn))});
  sload("reviews").forEach(function(rv){
    var p=rv&&typeof rv.id==="string"?periodFromKey(rv.id):null;
    if(!p||!(rg.all||(p.start<=rg.end&&p.end>=rg.start)))return;
    if(strOf(rv.changed).trim())s6.push("달라진 생각 ("+periodTitle(p)+"): "+rpQ(rv.changed));
    if(strOf(rv.nextQ).trim())s7.push(rpQ(rv.nextQ)+" ("+periodTitle(p)+")");
  });
  sload("timeline").forEach(function(t){
    var b=t&&typeof t.baseId==="string"?findRecById(t.baseId):null;
    if(b&&strOf(t.current).trim()&&rpIn(rg,validDay(b.day)?b.day:""))s6.push("지금의 관점 (고민 "+rpQ(b.issue)+" 기록의 타임라인): "+rpQ(t.current));
  });
  secs.push({title:"돌아보며 발견한 점",lines:s6.slice(0,10)});
  secs.push({title:"앞으로 생각해 보고 싶은 질문",lines:s7.slice(0,10)});
  return secs;
}
function reportText(rg,secs){
  var out=["나침반 · 자기경영 리포트","기간: "+rg.title,"만든 날: "+todayStr(),""];
  secs.forEach(function(s){
    out.push("■ "+s.title);
    if(!s.lines.length)out.push("- (이 기간에는 해당하는 내용이 없어요)");
    s.lines.forEach(function(l){out.push("- "+l)});
    out.push("");
  });
  out.push("※ 이 글은 내가 남긴 기록을 모아 옮긴 것이에요. 해석은 덧붙이지 않았어요.");
  return out.join("\n");
}
function reportHtml(secs){
  return secs.map(function(s){
    return '<div class="rpsec"><h4>'+esc(s.title)+'</h4>'+(s.lines.length?s.lines.map(function(l){return '<p class="hrow">'+esc(l)+'</p>'}).join(""):'<p class="hint2" style="margin:0">이 기간에는 해당하는 내용이 없어요.</p>')+'</div>';
  }).join("");
}

function renderReport(){
  var h='<a class="backlink" href="#/change">‹ 나의 변화</a>'
    +'<p class="hint2">기간을 고르면 그 기간의 기록을 한 장의 글로 모아 드려요. 복사하거나 파일로 저장할 수 있어요.</p>'
    +'<div class="card"><h3>기간</h3><div class="chips" id="rpPeriods" style="margin-bottom:0">'+RP_PERIODS.map(function(p){
      return '<button type="button" class="chip'+(rp.key===p[0]?' on':'')+'" data-rp="'+p[0]+'" aria-pressed="'+(rp.key===p[0]?'true':'false')+'">'+p[1]+'</button>';
    }).join("")+'</div>';
  if(rp.key==="custom"){
    h+='<div class="rpdates"><label for="rpFrom">시작일</label><input type="date" id="rpFrom" value="'+esc(rp.from)+'"><label for="rpTo">마지막 날</label><input type="date" id="rpTo" value="'+esc(rp.to)+'"></div>';
  }
  h+='</div><div id="rpBody"></div>';
  $("xReport").innerHTML=h;
  drawReportBody();
}
function drawReportBody(){
  var rg=reportRange(),box=$("rpBody");
  if(!box)return;
  if(rg.error){box.innerHTML='<div class="card"><p class="hint2" style="margin:0" role="status">'+esc(rg.error)+'</p></div>';return}
  var secs=reportModel(rg);
  box.innerHTML='<div class="card"><h3>'+esc(rg.title)+'의 리포트</h3>'+reportHtml(secs)+'</div>'
    +'<div class="rpbtns"><button type="button" class="btn" data-act="copy">내용 복사</button><button type="button" class="btn ghost" data-act="save">파일로 저장 (.txt)</button></div>'
    +'<p class="hint2" id="rpState" aria-live="polite" style="margin:4px 0 0">복사하거나 저장한 내용은 이 기기 밖으로 자동으로 보내지지 않아요.</p>';
}
function saveTextFile(name,text){
  try{
    var blob=new Blob(["﻿"+text],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=name;document.body.appendChild(a);a.click();document.body.removeChild(a);
    setTimeout(function(){URL.revokeObjectURL(url)},1000);
    return true;
  }catch(e){return false}
}
function bindReport(){
  var box=$("xReport");
  box.addEventListener("click",function(e){
    var p=e.target.closest?e.target.closest("button[data-rp]"):null;
    if(p&&box.contains(p)){rp.key=p.getAttribute("data-rp");renderReport();return}
    var b=e.target.closest?e.target.closest("button[data-act]"):null;
    if(!b||!box.contains(b))return;
    var rg=reportRange();
    if(rg.error)return;
    var text=reportText(rg,reportModel(rg));
    if(b.getAttribute("data-act")==="copy"){
      copyText(text,function(ok){sayTo("rpState",ok?"복사했어요.":"복사하지 못했어요. 파일로 저장해 보세요.")});
    }else{
      var name="나침반_리포트_"+(rg.all?"전체":rg.start+"_"+rg.end)+".txt";
      sayTo("rpState",saveTextFile(name,text)?"파일로 저장했어요. 내려받은 파일을 확인해 주세요.":"파일을 만들지 못했어요. 복사를 이용해 주세요.");
    }
  });
  box.addEventListener("change",function(e){
    if(e.target&&(e.target.id==="rpFrom"||e.target.id==="rpTo")){
      rp.from=$("rpFrom").value;rp.to=$("rpTo").value;drawReportBody();
    }
  });
}
