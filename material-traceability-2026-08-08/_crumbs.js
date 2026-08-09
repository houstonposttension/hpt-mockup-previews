// Single source of truth for this set's page nav (2026-08-08).
// Every page carries <div class="crumbs" data-crumbs></div> and this renders it,
// marking the current page from location.pathname. Adding a page = one line here.
(function(){
  var NAV = [
    ["index.html",          "Set index"],
    ["rebar-heat.html",     "Rebar · first step"],
    ["hardware-heat.html",  "Hardware · heat or batch"],
    ["pt-heat.html",        "PT · heat and serial"],
    ["extrusion-heat.html", "Extrusion · proposal"]
  ];
  function render(){
    var here = (location.pathname.split("/").pop() || "index.html");
    document.querySelectorAll("[data-crumbs]").forEach(function(box){
      box.innerHTML = NAV.map(function(n){
        var on = (n[0] === here) ? ' class="on"' : '';
        return '<a' + on + ' href="' + n[0] + '">' + n[1] + '</a>';
      }).join("");
    });
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", render);
  else render();
})();
