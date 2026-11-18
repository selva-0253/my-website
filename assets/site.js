// Loaded on every page.

// "Copy" buttons: <button data-copy="text">. Status goes to the nearest
// .contact-status, or the button label if there is none.
document.addEventListener("click", function (e) {
  var btn = e.target.closest ? e.target.closest("[data-copy]") : null;
  if (!btn) return;
  var text = btn.getAttribute("data-copy");
  var box = btn.closest(".cta-card, section, body");
  var status = box && box.querySelector(".contact-status");

  function say(msg) {
    if (status) { status.textContent = msg; return; }
    var label = btn.textContent;
    btn.textContent = msg;
    setTimeout(function () { btn.textContent = label; }, 2000);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(
      function () { say("Copied: " + text); },
      function () { say("Copy failed. Please select the address above."); }
    );
  } else {
    say("Please select and copy the address above.");
  }
});

// Cloudflare Web Analytics when a token is configured
// (assets/site-config.js is generated at deploy time from SSM Parameter Store).
(function () {
  var cfg = window.SITE_CONFIG || {};
  if (!cfg.webAnalyticsToken) return;

  var s = document.createElement("script");
  s.defer = true;
  s.src = "https://static.cloudflareinsights.com/beacon.min.js";
  s.setAttribute("data-cf-beacon", JSON.stringify({ token: cfg.webAnalyticsToken }));
  document.head.appendChild(s);
})();
