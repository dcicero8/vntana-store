(function(){var PASSWORD="element2026",KEY="elementBuildUnlocked";
  document.body.insertAdjacentHTML('afterbegin','<div id="gate"><div class="card"><img src="../VNTANA-logo-black.png" alt=""><h1>3D Build Brief</h1><p>This page is private. Enter the password to continue.</p><input id="pw" type="password" placeholder="Password" autocomplete="off"><button id="unlock">Unlock</button><div class="err" id="err"></div></div></div>');
  var gate=document.getElementById('gate');
  function unlock(){try{sessionStorage.setItem(KEY,'1');}catch(e){}gate.style.display='none';document.body.classList.remove('locked');}
  try{if(sessionStorage.getItem(KEY)==='1')unlock();}catch(e){}
  function tryPw(){var v=document.getElementById('pw').value.trim();if(v.toLowerCase()===PASSWORD){unlock();}else{document.getElementById('err').textContent='Incorrect password. Please try again.';}}
  document.getElementById('unlock').addEventListener('click',tryPw);
  document.getElementById('pw').addEventListener('keydown',function(e){if(e.key==='Enter')tryPw();});
})();
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
