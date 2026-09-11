/* Interactive checklist for the vault parts sheets: the "To confirm" items
   become clickable checkboxes that save in the browser (localStorage). */
(function(){
  var NS = 'wilbertVaultConfirm:';
  function slug(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64); }
  function get(k){ try{ return localStorage.getItem(NS+k); }catch(e){ return null; } }
  function put(k,v){ try{ localStorage.setItem(NS+k,v); }catch(e){} }

  var css = ''
    + '.confirm li{display:flex;align-items:flex-start;gap:9px;padding:7px 0}'
    + '.confirm li::before{content:none !important}'
    + '.confirm .qcheck{margin-top:2px;width:16px;height:16px;flex:0 0 auto;cursor:pointer;accent-color:#00456b}'
    + '.confirm .qtext{flex:1 1 auto;font-size:13px;color:#3d4a52;line-height:1.4;cursor:pointer}'
    + '.confirm li.done .qtext{color:#9aa1a8;text-decoration:line-through}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  var box = document.querySelector('.confirm');
  if(!box) return;
  [].slice.call(box.querySelectorAll('li')).forEach(function(li){
    var html=li.innerHTML, id=slug(li.textContent.trim());
    var cb=document.createElement('input'); cb.type='checkbox'; cb.className='qcheck';
    var tx=document.createElement('span'); tx.className='qtext'; tx.innerHTML=html;
    li.innerHTML=''; li.appendChild(cb); li.appendChild(tx);
    if(get('check:'+id)==='1'){ cb.checked=true; li.classList.add('done'); }
    function apply(){ li.classList.toggle('done', cb.checked); put('check:'+id, cb.checked?'1':'0'); }
    cb.addEventListener('change', apply);
    tx.addEventListener('click', function(){ cb.checked=!cb.checked; apply(); });
  });
})();
