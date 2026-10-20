(function(){var PASSWORD="apex2026",KEY="apexBuildUnlocked";
  document.body.insertAdjacentHTML('afterbegin','<div id="gate"><div class="card"><img src="refs/apex_logo.png" alt=""><h1>3D Build Brief</h1><p>This page is private. Enter the password to continue.</p><input id="pw" type="password" placeholder="Password" autocomplete="off"><button id="unlock">Unlock</button><div class="err" id="err"></div></div></div>');
  var gate=document.getElementById('gate');
  function unlock(){try{sessionStorage.setItem(KEY,'1');}catch(e){}gate.style.display='none';document.body.classList.remove('locked');}
  try{if(sessionStorage.getItem(KEY)==='1')unlock();}catch(e){}
  function tryPw(){var v=document.getElementById('pw').value.trim();if(v.toLowerCase()===PASSWORD){unlock();}else{document.getElementById('err').textContent='Incorrect password. Please try again.';}}
  document.getElementById('unlock').addEventListener('click',tryPw);
  document.getElementById('pw').addEventListener('keydown',function(e){if(e.key==='Enter')tryPw();});
})();
