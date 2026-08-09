// Shared JS for the rev-2b mockup set (2026-08-07).
// UI state only — no API calls, no live data. Pages work without JS.
(function(){

  // ---- Bottom pull-up drawer (rebar screens only; the loader uses the
  //      locked In-progress | Punch list view toggle instead). ----
  function bindDrawer(){
    document.querySelectorAll('[data-drawer]').forEach(function(d){
      var h = d.querySelector('[data-dhandle]');
      if (!h) return;
      h.addEventListener('click', function(){ d.classList.toggle('open'); });
    });
  }

  // ---- Cross-role collapse demo: badge 0 -> the pill takes zero width. ----
  function bindCollapseDemo(){
    document.querySelectorAll('[data-collapse-demo]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var quiet = !btn.dataset.quiet || btn.dataset.quiet === '0';
        btn.dataset.quiet = quiet ? '1' : '0';
        document.querySelectorAll('[data-xpill]').forEach(function(p){
          p.classList.toggle('zero', quiet);
          var c = p.querySelector('.cnt');
          if (c) c.textContent = quiet ? '0' : (p.dataset.xpill || '1');
        });
        btn.textContent = quiet ? 'Badges arrive → pills expand'
                                : 'Badges clear to 0 → pills collapse';
      });
    });
  }

  // ---- Tier-1 alarm dismiss (red / amber, single action). ----
  function bindAlarm(){
    document.querySelectorAll('[data-alarm-dismiss]').forEach(function(b){
      b.addEventListener('click', function(){
        var a = b.closest('.alarm1') || document.querySelector('.alarm1');
        if (!a) return;
        a.style.transition = 'opacity .25s';
        a.style.opacity = 0;
        setTimeout(function(){ a.style.display = 'none'; }, 260);
      });
    });
  }

  // ---- LEAN row drawer: tap a row to reveal full detail (progressive
  //      disclosure). Ported from variant-c-lean-2026-07-22.html. ----
  function bindLeanRows(){
    document.querySelectorAll('.lrow').forEach(function(r){
      r.addEventListener('click', function(e){
        if (e.target.closest('.lloaded')) return;
        if (r.querySelector('.ldrawer')) r.classList.toggle('open');
      });
    });
    document.querySelectorAll('.lloaded').forEach(function(l){
      l.addEventListener('click', function(){
        var w = l.closest('.lcollapse');
        if (w) w.classList.toggle('open');
      });
    });
  }

  // ---- Collapsible workcell groups on the supervisor home. ----
  function bindCellGroups(){
    document.querySelectorAll('.cellhd').forEach(function(h){
      h.addEventListener('click', function(){
        var g = h.closest('.cellgrp');
        if (g) g.classList.toggle('open');
      });
    });
  }

  // ---- Category filter chips + reason chips + vehicle toggle (display only). ----
  function bindChips(){
    document.querySelectorAll('.catbar').forEach(function(bar){
      bar.querySelectorAll('.ctab').forEach(function(c){
        c.addEventListener('click', function(){
          bar.querySelectorAll('.ctab').forEach(function(x){ x.classList.remove('active'); });
          c.classList.add('active');
        });
      });
    });
    document.querySelectorAll('.reasons').forEach(function(g){
      g.querySelectorAll('.rchip').forEach(function(c){
        c.addEventListener('click', function(){
          g.querySelectorAll('.rchip').forEach(function(x){ x.classList.remove('on'); });
          c.classList.add('on');
        });
      });
    });
    document.querySelectorAll('.vehtoggle').forEach(function(g){
      g.querySelectorAll('.vbtn').forEach(function(b){
        b.addEventListener('click', function(){
          g.querySelectorAll('.vbtn').forEach(function(x){ x.classList.remove('on'); });
          b.classList.add('on');
          var panel = g.closest('.docpanel');
          var d = panel && panel.querySelector('[data-truck]');
          if (d) d.innerHTML = truckDiagram(b.getAttribute('data-veh'));
        });
      });
    });
  }

  // ======================================================================
  // Bend-shape generator — the SAME routine the loader app already uses on
  // rebar rows (load_app.html shapeSVG, ~line 283). Design note sec. 7.4:
  // "Reuse this function — do not fork it."
  // Honest limitation, carried over: it is schematic, not to scale — it
  // reads how many legs are populated, never their magnitudes.
  // ======================================================================
  var ASA = ["A","B","C","D","E","F","G","H","J","K","O","R"];
  function dimInches(v){
    var m = String(v||"").match(/^(\d+)-(\d+)/);
    if (!m){ var n = parseFloat(v); return isNaN(n) ? 12 : n; }
    return (+m[1])*12 + (+m[2]);
  }
  function legsFrom(dims){
    var o = [];
    if (dims) for (var i=0;i<ASA.length;i++){
      var v = dims[ASA[i]];
      if (v !== undefined && v !== null && String(v).toUpperCase() !== "NULL" && String(v) !== "")
        o.push(dimInches(v));
    }
    return o;
  }
  function shapeSVG(asa, dims, stroke, big){
    var n = legsFrom(dims).length, closed = /^T/i.test(asa||"") || n >= 5;
    var W = big?96:40, H = big?52:22, sw = big?4:2, pad = big?10:5, col = stroke || "#cfe0f5";
    var head = '<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" fill="none" stroke="'+col+
               '" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round">';
    if ((asa||"").toUpperCase() === "STR" || n <= 1)
      return head+'<line x1="'+pad+'" y1="'+(H/2)+'" x2="'+(W-pad)+'" y2="'+(H/2)+'"/></svg>';
    var x0=pad, x1=W-pad, y0=pad, y1=H-pad;
    if (closed) return head+'<path d="M'+(x0+(big?12:6))+' '+y0+' H'+x1+' V'+y1+' H'+x0+' V'+(y0+(big?9:4))+'"/></svg>';
    if (n===2)  return head+'<path d="M'+x0+' '+y0+' V'+y1+' H'+x1+'"/></svg>';
    if (n===3)  return head+'<path d="M'+x0+' '+y0+' V'+y1+' H'+x1+' V'+y0+'"/></svg>';
    return head+'<path d="M'+x0+' '+(y0+(big?10:5))+' V'+y1+' H'+x1+' V'+y0+' H'+(x0+(big?34:18))+'"/></svg>';
  }
  var STROKE = { load:"#46d684", short:"#ff3b30", scan:"#7da2c9", notscan:"#8a94a0" };
  function renderShapes(){
    document.querySelectorAll(".shape[data-asa]").forEach(function(el){
      var dims = {};
      try { dims = JSON.parse(el.getAttribute("data-dims") || "{}"); } catch(e){}
      var big = el.classList.contains("dbig");
      el.innerHTML = shapeSVG(el.getAttribute("data-asa"), dims,
                              STROKE[el.getAttribute("data-st")] || "#cfe0f5", big);
    });
  }

  // ======================================================================
  // Truck diagram for the 3-photo load documentation panel — ported from
  // load_app.html truckDiagram(). Camera positions with sight-lines, one
  // rig per vehicle type (18-wheeler / non-CDL).
  // ======================================================================
  function camMark(x,y){
    return '<g transform="translate('+x+','+y+')">'+
      '<rect x="-9" y="-6" width="18" height="12" rx="2" fill="#13251a" stroke="#46d684" stroke-width="1.5"/>'+
      '<rect x="-3" y="-8.5" width="7" height="3" rx="1" fill="#46d684"/>'+
      '<circle cx="0" cy="0.5" r="3" fill="none" stroke="#46d684" stroke-width="1.5"/></g>';
  }
  function truckDiagram(type){
    var cams = '<path d="M40 20 L94 56 M40 20 L246 54" stroke="#46d684" stroke-width="1.2" stroke-dasharray="3 3" fill="none"/>'+
      '<path d="M40 156 L94 112 M40 156 L246 114" stroke="#46d684" stroke-width="1.2" stroke-dasharray="3 3" fill="none"/>'+
      '<path d="M272 86 L248 56 M272 86 L248 114" stroke="#46d684" stroke-width="1.2" stroke-dasharray="3 3" fill="none"/>'+
      camMark(40,20)+'<text x="24" y="40" fill="#cfe0f5" font-size="9.5" font-weight="700">Driver (angle)</text>'+
      camMark(40,156)+'<text x="24" y="174" fill="#cfe0f5" font-size="9.5" font-weight="700">Passenger (angle)</text>'+
      camMark(272,86)+'<text x="274" y="74" fill="#cfe0f5" font-size="9.5" font-weight="700" text-anchor="middle">Rear</text>';
    var head = '<svg class="truckdiag" viewBox="0 0 290 176">';
    if (type === "noncdl"){
      return head+
        '<rect x="40" y="66" width="32" height="40" rx="5" fill="#10161c" stroke="#7da2c9" stroke-width="2"/>'+
        '<rect x="78" y="50" width="170" height="72" rx="3" fill="#0e1217" stroke="#7da2c9" stroke-width="2"/>'+
        '<g fill="#8a6a3a" stroke="#5e4824" stroke-width="1.2"><rect x="84" y="55" width="26" height="26" rx="1"/>'+
        '<rect x="84" y="91" width="26" height="26" rx="1"/></g>'+
        '<g stroke="#ffb020" stroke-width="3"><line x1="132" y1="50" x2="132" y2="42"/><line x1="166" y1="50" x2="166" y2="42"/>'+
        '<line x1="200" y1="50" x2="200" y2="42"/><line x1="232" y1="50" x2="232" y2="42"/>'+
        '<line x1="132" y1="122" x2="132" y2="130"/><line x1="166" y1="122" x2="166" y2="130"/>'+
        '<line x1="200" y1="122" x2="200" y2="130"/><line x1="232" y1="122" x2="232" y2="130"/></g>'+
        '<g fill="#e8852c" stroke="#a85a14" stroke-width="1.2"><rect x="121" y="55" width="22" height="17" rx="2"/>'+
        '<rect x="155" y="55" width="22" height="17" rx="2"/><rect x="189" y="55" width="22" height="17" rx="2"/>'+
        '<rect x="221" y="55" width="22" height="17" rx="2"/><rect x="121" y="100" width="22" height="17" rx="2"/>'+
        '<rect x="155" y="100" width="22" height="17" rx="2"/><rect x="189" y="100" width="22" height="17" rx="2"/>'+
        '<rect x="221" y="100" width="22" height="17" rx="2"/></g>'+
        cams+'</svg>';
    }
    return head+
      '<rect x="38" y="64" width="28" height="40" rx="4" fill="#10161c" stroke="#7da2c9" stroke-width="2"/>'+
      '<rect x="70" y="58" width="184" height="52" rx="3" fill="#0e1217" stroke="#7da2c9" stroke-width="2"/>'+
      '<g stroke="#9aa4b0" stroke-width="4" stroke-linecap="round"><line x1="82" y1="68" x2="244" y2="68"/>'+
      '<line x1="82" y1="78" x2="244" y2="78"/><line x1="82" y1="88" x2="244" y2="88"/>'+
      '<line x1="82" y1="98" x2="244" y2="98"/></g>'+
      '<g stroke="#ffb020" stroke-width="2"><line x1="110" y1="56" x2="110" y2="112"/>'+
      '<line x1="160" y1="56" x2="160" y2="112"/><line x1="210" y1="56" x2="210" y2="112"/></g>'+
      cams+'</svg>';
  }
  function renderTrucks(){
    document.querySelectorAll('[data-truck]').forEach(function(d){
      d.innerHTML = truckDiagram(d.getAttribute('data-truck') || '18w');
    });
  }

  // ---- 8-hour sparkline on the station-detail screen. ----
  function renderSparks(){
    document.querySelectorAll('[data-spark]').forEach(function(el){
      var vals = (el.getAttribute('data-spark')||'').split(',').map(Number).filter(function(n){ return !isNaN(n); });
      if (vals.length < 2) return;
      var tgt = parseFloat(el.getAttribute('data-target')||'0');
      var W = 300, H = 52, max = Math.max.apply(null, vals.concat([tgt])) * 1.12 || 1;
      var step = W / (vals.length - 1);
      var pts = vals.map(function(v,i){ return (i*step).toFixed(1)+','+(H - (v/max)*H).toFixed(1); });
      var ty = (H - (tgt/max)*H).toFixed(1);
      el.innerHTML =
        '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none">'+
        (tgt ? '<line x1="0" y1="'+ty+'" x2="'+W+'" y2="'+ty+'" stroke="#3a444f" stroke-width="1" stroke-dasharray="4 4"/>' : '')+
        '<polyline points="'+pts.join(' ')+'" fill="none" stroke="#16c060" stroke-width="2" '+
        'stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>'+
        '<circle cx="'+(W).toFixed(1)+'" cy="'+(H - (vals[vals.length-1]/max)*H).toFixed(1)+'" r="3" fill="#16c060"/>'+
        '</svg>';
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    bindDrawer();
    bindCollapseDemo();
    bindAlarm();
    bindLeanRows();
    bindCellGroups();
    bindChips();
    renderShapes();
    renderTrucks();
    renderSparks();
  });
})();
