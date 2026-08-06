// Shared JS for the rev-2 "scan-first, one bar" mockup set (2026-08-06).
// UI state only — no API calls, no live data. Pages work without JS.
(function(){

  // Bottom pull-up drawer: collapsed by default, tap the handle to open.
  function bindDrawer(){
    document.querySelectorAll('[data-drawer]').forEach(function(d){
      var h = d.querySelector('[data-dhandle]');
      if (!h) return;
      h.addEventListener('click', function(){ d.classList.toggle('open'); });
    });
  }

  // Live demo of the collapse rule: badge count 0 -> the pill takes zero width
  // (max-width/padding/opacity all animate to 0), it does not merely grey out.
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

  // Alarm interrupt: the three decisions all just dismiss in the mockup.
  function bindAlarm(){
    document.querySelectorAll('[data-alarm-dismiss]').forEach(function(b){
      b.addEventListener('click', function(){
        var a = document.querySelector('.alarm');
        if (!a) return;
        a.style.transition = 'opacity .25s';
        a.style.animation  = 'none';
        a.style.opacity    = 0;
        setTimeout(function(){ a.style.display = 'none'; }, 260);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    bindDrawer();
    bindCollapseDemo();
    bindAlarm();
  });
})();
