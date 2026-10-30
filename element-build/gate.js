// Password gate removed for now (Oct 29, 2026). To restore, copy the gate block from ../apex-build/gate.js
// (PASSWORD "element2026", KEY "elementBuildUnlocked") and set <body class="locked"> in index.html.
(function(){
  var el=document.querySelector('footer .updated'); if(!el||!window.fetch) return;
  fetch(location.pathname+'?ts='+Date.now(),{method:'HEAD',cache:'no-store'}).then(function(r){
    var lm=r.headers.get('last-modified'); if(!lm) return;
    var d=new Date(lm); if(isNaN(d)) return;
    var s=d.toLocaleString(undefined,{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'});
    var mins=Math.round((Date.now()-d.getTime())/60000);
    var ago=mins<1?'just now':mins<60?mins+' min ago':mins<1440?Math.round(mins/60)+' h ago':Math.round(mins/1440)+' days ago';
    el.textContent='Last deployed '+s+' ('+ago+')';
  }).catch(function(){});
})();
