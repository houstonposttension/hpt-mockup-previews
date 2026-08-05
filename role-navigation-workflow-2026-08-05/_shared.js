// Shared minimal JS for the role/nav mockup set (2026-08-05).
// No API calls; UI state only. Progressive enhancement — pages work without JS.
(function(){
  // dropdown open/close
  function bindDropdown(){
    var trigger = document.querySelector('[data-fnpick]');
    var menu    = document.querySelector('[data-fnmenu]');
    if (!trigger || !menu) return;
    trigger.addEventListener('click', function(e){
      e.stopPropagation();
      var open = menu.classList.toggle('hidden');
      trigger.classList.toggle('open', !open);
    });
    document.addEventListener('click', function(e){
      if (menu.contains(e.target) || trigger.contains(e.target)) return;
      menu.classList.add('hidden');
      trigger.classList.remove('open');
    });
  }
  // supervise toggle
  function bindSupToggle(){
    var sw = document.querySelector('[data-sup]');
    if (!sw) return;
    sw.addEventListener('click', function(){
      var next = sw.dataset.href;
      if (next) window.location.href = next;
    });
  }
  document.addEventListener('DOMContentLoaded', function(){
    bindDropdown();
    bindSupToggle();
  });
})();
