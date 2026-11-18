// Loaded on every page. Adds Cloudflare Web Analytics when a token is configured
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
