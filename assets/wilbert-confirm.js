/* Interactive "To confirm with Wilbert" checklist for the vault parts sheets.
   Checkboxes + per-item answer notes, saved in the browser (localStorage).
   State is keyed by question text, so the same item is shared across both sheets. */
(function(){
  var NS = 'wilbertVaultConfirm:';
  function slug(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64); }
  function get(k){ try{ return localStorage.getItem(NS+k); }catch(e){ return null; } }
  function put(k,v){ try{ localStorage.setItem(NS+k,v); }catch(e){} }
  function drop(k){ try{ localStorage.removeItem(NS+k); }catch(e){} }

  var css = ''
    + '.confirm li{display:flex;flex-wrap:wrap;align-items:flex-start;gap:9px;padding:7px 0}'
    + '.confirm li::before{content:none !important}'
    + '.confirm .qcheck{margin-top:2px;width:16px;height:16px;flex:0 0 auto;cursor:pointer;accent-color:#00456b}'
    + '.confirm .qtext{flex:1 1 180px;font-size:13px;color:#3d4a52;line-height:1.4;cursor:pointer}'
    + '.confirm li.done .qtext{color:#9aa1a8;text-decoration:line-through}'
    + '.confirm .qnote{flex:1 1 100%;margin-left:25px;margin-top:2px;font-size:12px;padding:5px 9px;border:1px solid #d9dee3;border-radius:4px;font-family:inherit;color:#333;background:#fff}'
    + '.confirm .qnote.has{border-color:#4f758b;background:#f4f8fb}'
    + '.cbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:2px 0 16px}'
    + '.cbar .prog{font-size:12.5px;font-weight:700;color:#00456b}'
    + '.cbar .prog .bar{display:inline-block;width:120px;height:7px;border-radius:4px;background:#e6ebf0;vertical-align:middle;margin-left:6px;overflow:hidden}'
    + '.cbar .prog .bar i{display:block;height:100%;background:#1f7a44;width:0;transition:width .2s}'
    + '.cbar button{font-size:11.5px;font-weight:700;padding:5px 11px;border:1px solid #d9dee3;border-radius:15px;background:#fff;color:#4f758b;cursor:pointer}'
    + '.cbar button:hover{border-color:#4f758b}'
    + '.cbar .saved{font-size:11px;color:#6b7680}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  var box = document.querySelector('.confirm');
  if(!box) return;
  var items = [].slice.call(box.querySelectorAll('li'));
  if(!items.length) return;

  var bar=document.createElement('div'); bar.className='cbar';
  bar.innerHTML = '<span class="prog" id="cprog"></span>'
    + '<button id="ccopy" type="button">Copy status</button>'
    + '<button id="creset" type="button">Reset</button>'
    + '<span class="saved" id="csaved">saves in this browser</span>';
  var sub=box.querySelector('.sub');
  (sub || box.firstElementChild).insertAdjacentElement('afterend', bar);

  var recs=[];
  items.forEach(function(li){
    var html=li.innerHTML, text=li.textContent.trim(), id=slug(text);
    var cb=document.createElement('input'); cb.type='checkbox'; cb.className='qcheck';
    var tx=document.createElement('span'); tx.className='qtext'; tx.innerHTML=html;
    var note=document.createElement('input'); note.type='text'; note.className='qnote';
    note.placeholder="Wilbert's answer / note";
    li.innerHTML=''; li.appendChild(cb); li.appendChild(tx); li.appendChild(note);
    if(get('check:'+id)==='1'){ cb.checked=true; li.classList.add('done'); }
    var nv=get('note:'+id); if(nv){ note.value=nv; note.classList.add('has'); }
    function apply(){ li.classList.toggle('done', cb.checked); put('check:'+id, cb.checked?'1':'0'); progress(); }
    cb.addEventListener('change', apply);
    tx.addEventListener('click', function(){ cb.checked=!cb.checked; apply(); });
    note.addEventListener('input', function(){ put('note:'+id, note.value); note.classList.toggle('has', !!note.value.trim()); });
    recs.push({li:li, cb:cb, note:note, text:text, id:id});
  });

  function progress(){
    var done=recs.filter(function(r){return r.cb.checked;}).length;
    var pct=recs.length?Math.round(done/recs.length*100):0;
    document.getElementById('cprog').innerHTML = done+' of '+recs.length+' confirmed '
      + '<span class="bar"><i style="width:'+pct+'%"></i></span>';
  }
  progress();

  var saved=document.getElementById('csaved');
  function flash(m){ var o=saved.textContent; saved.textContent=m; setTimeout(function(){ saved.textContent=o; },1400); }

  document.getElementById('ccopy').addEventListener('click', function(){
    var title=(document.querySelector('.head .t h1')||{}).textContent||'Wilbert vault';
    var lines=recs.map(function(r){ return (r.cb.checked?'[x] ':'[ ] ')+r.text+(r.note.value.trim()?'  -> '+r.note.value.trim():''); });
    var out=title.replace(/\s+/g,' ').trim()+' - items to confirm\n\n'+lines.join('\n');
    function ok(){ flash('Copied'); }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(out).then(ok, fallback);
    } else { fallback(); }
    function fallback(){
      var ta=document.createElement('textarea'); ta.value=out; ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.focus(); ta.select();
      try{ document.execCommand('copy'); ok(); }catch(e){} document.body.removeChild(ta);
    }
  });

  document.getElementById('creset').addEventListener('click', function(){
    if(!window.confirm('Clear all checkmarks and notes on this browser?')) return;
    recs.forEach(function(r){
      r.cb.checked=false; r.li.classList.remove('done'); r.note.value=''; r.note.classList.remove('has');
      drop('check:'+r.id); drop('note:'+r.id);
    });
    progress();
  });
})();
