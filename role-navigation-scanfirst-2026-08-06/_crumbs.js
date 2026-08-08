// Single source of truth for the set's page nav (2026-08-07).
// Every page carries <div class="crumbs" data-crumbs></div> and this renders it,
// marking the current page from location.pathname. Adding a page = one line here.
(function(){
  var NAV = [
    ["index.html",                "Rebar · quiet"],
    ["rebar-busy.html",           "Rebar · busy"],
    ["loader.html",               "Loader · in progress"],
    ["loader-punchlist.html",     "Punch list"],
    ["loader-alarm.html",         "Interrupts"],
    ["loader-closeout.html",      "Close-out"],
    ["loader-split.html",         "Split & carry"],
    ["pt.html",                   "PT"],
    ["hardware.html",             "Hardware"],
    ["receiver.html",             "Receiver"],
    ["yard.html",                 "Yard"],
    ["supervisor.html",           "Sup · workcells"],
    ["supervisor-station.html",   "Station detail"],
    ["supervisor-approvals.html", "Approvals"],
    ["supervisor-actas.html",     "Act-as / Reposition"],
    ["bar-anatomy.html",          "Bar anatomy"]
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
