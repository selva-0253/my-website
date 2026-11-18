// Likes, comments and sharing for a blog post.
//
// Usage:  <section class="engagement" data-engagement data-post="my-post-slug"></section>
// Needs window.SITE_CONFIG = { apiBaseUrl, turnstileSiteKey } (assets/site-config.js).
// Without it, only sharing is shown.
(function () {
  "use strict";

  var root = document.querySelector("[data-engagement]");
  if (!root) return;

  var cfg = window.SITE_CONFIG || {};
  var slug = root.getAttribute("data-post");
  var apiReady = Boolean(cfg.apiBaseUrl && cfg.turnstileSiteKey && slug);
  var postUrl = cfg.apiBaseUrl ? cfg.apiBaseUrl.replace(/\/$/, "") + "/v1/posts/" + encodeURIComponent(slug) : "";
  var likedKey = "liked:" + slug;

  // ---------------------------------------------------------------- helpers

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { node.appendChild(c); });
    return node;
  }

  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* private mode */ }
  }

  function setStatus(message, isError) {
    status.textContent = message || "";
    status.className = "eng-status" + (isError ? " eng-status-error" : "");
  }

  function request(method, url, body) {
    return fetch(url, {
      method: method,
      headers: body ? { "content-type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    }).then(function (res) {
      return res.text().then(function (text) {
        var data = {};
        try { data = text ? JSON.parse(text) : {}; } catch (e) { /* e.g. a rate-limit page */ }
        if (!res.ok) {
          var msg = data.error || (res.status === 429 ? "Too many requests. Please wait a moment." : "Something went wrong. Please try again.");
          throw new Error(msg);
        }
        return data;
      });
    });
  }

  // -------------------------------------------------------------- turnstile
  // One invisible widget, executed on demand; each token is single-use.

  var widgetId = null;
  var waiter = null;
  var turnstileLoad = null;

  function loadTurnstile() {
    if (turnstileLoad) return turnstileLoad;
    turnstileLoad = new Promise(function (resolve, reject) {
      if (window.turnstile) return resolve();
      var s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () {
        turnstileLoad = null;
        reject(new Error("Could not load the bot check. Please try again."));
      };
      document.head.appendChild(s);
    });
    return turnstileLoad;
  }

  function getToken() {
    return loadTurnstile().then(function () {
      return new Promise(function (resolve, reject) {
        var timer = setTimeout(function () {
          waiter = null;
          reject(new Error("The bot check timed out. Please try again."));
        }, 60000);
        waiter = {
          resolve: function (t) { clearTimeout(timer); waiter = null; resolve(t); },
          reject: function (e) { clearTimeout(timer); waiter = null; reject(e); },
        };

        if (widgetId === null) {
          widgetId = window.turnstile.render(turnstileBox, {
            sitekey: cfg.turnstileSiteKey,
            action: "engage",
            execution: "execute",
            appearance: "interaction-only",
            callback: function (token) { if (waiter) waiter.resolve(token); },
            "error-callback": function () {
              if (waiter) waiter.reject(new Error("The bot check failed. Please try again."));
              return true;
            },
          });
        } else {
          window.turnstile.reset(widgetId);
        }
        window.turnstile.execute(widgetId);
      });
    });
  }

  // ---------------------------------------------------------------- build UI

  var likeCount = el("span", { class: "eng-like-count", text: "" });
  var likeBtn = el("button", { type: "button", class: "eng-btn eng-like", "aria-pressed": "false" }, [
    el("span", { "aria-hidden": "true", text: "♥ " }),
    el("span", { class: "eng-like-label", text: "Like" }),
    likeCount,
  ]);
  var shareBtn = el("button", { type: "button", class: "eng-btn eng-share", text: "Share" });

  var pageUrl = window.location.href.split("#")[0];
  var shareText = document.title;
  var linkedIn = el("a", {
    class: "eng-link", target: "_blank", rel: "noopener noreferrer",
    href: "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(pageUrl),
    text: "LinkedIn",
  });
  var xLink = el("a", {
    class: "eng-link", target: "_blank", rel: "noopener noreferrer",
    href: "https://x.com/intent/post?url=" + encodeURIComponent(pageUrl) + "&text=" + encodeURIComponent(shareText),
    text: "X",
  });

  var status = el("p", { class: "eng-status", role: "status", "aria-live": "polite" });
  var commentCount = el("span", { text: "" });
  var list = el("ol", { class: "eng-comments" });
  var empty = el("p", { class: "eng-empty", text: "No comments yet. Questions and corrections are welcome." });

  var nameInput = el("input", { type: "text", id: "eng-name", maxlength: "40", autocomplete: "name", placeholder: "Optional" });
  var textInput = el("textarea", { id: "eng-text", maxlength: "1000", rows: "4", required: "required", placeholder: "Feedback, questions or corrections" });
  var turnstileBox = el("div", { class: "eng-turnstile" });
  var submitBtn = el("button", { type: "submit", class: "eng-btn eng-submit", text: "Post comment" });
  var form = el("form", { class: "eng-form", novalidate: "novalidate" }, [
    el("label", { for: "eng-name", text: "Name" }), nameInput,
    el("label", { for: "eng-text", text: "Comment" }), textInput,
    turnstileBox,
    submitBtn,
    el("p", { class: "eng-note", text: "Protected by Cloudflare Turnstile. Please keep it respectful." }),
  ]);

  root.innerHTML = "";
  root.appendChild(el("h2", { text: "Did this help?" }));
  root.appendChild(el("div", { class: "eng-actions" }, apiReady ? [likeBtn, shareBtn, linkedIn, xLink] : [shareBtn, linkedIn, xLink]));
  root.appendChild(status);

  if (apiReady) {
    root.appendChild(el("h3", {}, [document.createTextNode("Comments "), commentCount]));
    root.appendChild(empty);
    root.appendChild(list);
    root.appendChild(form);
  }

  // ------------------------------------------------------------------ share

  shareBtn.addEventListener("click", function () {
    if (navigator.share) {
      navigator.share({ title: document.title, url: pageUrl }).catch(function () { /* dismissed */ });
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(pageUrl).then(
        function () { setStatus("Link copied to clipboard."); },
        function () { setStatus("Copy this link: " + pageUrl); }
      );
    } else {
      setStatus("Copy this link: " + pageUrl);
    }
  });

  if (!apiReady) return;

  // ------------------------------------------------------------------ state

  function showLikes(n) {
    likeCount.textContent = n > 0 ? " · " + n : "";
  }

  function markLiked() {
    likeBtn.classList.add("is-liked");
    likeBtn.setAttribute("aria-pressed", "true");
    likeBtn.disabled = true;
    likeBtn.querySelector(".eng-like-label").textContent = "Liked";
  }

  function renderComment(c, prepend) {
    var when = c.createdAt ? new Date(c.createdAt) : null;
    var meta = el("div", { class: "eng-comment-meta" }, [
      el("strong", { text: c.name || "Anonymous" }),
    ]);
    if (when && !isNaN(when)) {
      meta.appendChild(el("time", { datetime: c.createdAt, text: when.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) }));
    }
    var item = el("li", { class: "eng-comment" }, [meta, el("p", { text: c.text })]);
    if (prepend) list.insertBefore(item, list.firstChild);
    else list.appendChild(item);
  }

  function updateCommentCount() {
    var n = list.children.length;
    commentCount.textContent = n ? "(" + n + ")" : "";
    empty.hidden = n > 0;
  }

  if (storageGet(likedKey)) markLiked();

  request("GET", postUrl).then(function (data) {
    showLikes(data.likes || 0);
    (data.comments || []).forEach(function (c) { renderComment(c, false); });
    updateCommentCount();
  }).catch(function () {
    setStatus("Comments could not be loaded right now.", true);
    updateCommentCount();
  });

  // ------------------------------------------------------------------- like

  likeBtn.addEventListener("click", function () {
    likeBtn.disabled = true;
    setStatus("");
    getToken()
      .then(function (token) { return request("POST", postUrl + "/likes", { turnstileToken: token }); })
      .then(function (data) {
        showLikes(data.likes || 0);
        markLiked();
        storageSet(likedKey, "1");
        setStatus(data.alreadyLiked ? "You've already liked this post." : "Thanks for the like!");
      })
      .catch(function (err) {
        likeBtn.disabled = false;
        setStatus(err.message, true);
      });
  });

  // ---------------------------------------------------------------- comment

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = textInput.value.trim();
    if (text.length < 2) {
      setStatus("Please write a comment first.", true);
      textInput.focus();
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = "Posting…";
    setStatus("");

    getToken()
      .then(function (token) {
        return request("POST", postUrl + "/comments", { name: nameInput.value.trim(), text: text, turnstileToken: token });
      })
      .then(function (data) {
        textInput.value = "";
        if (data.pending) {
          setStatus("Thanks! Your comment will appear after review.");
        } else {
          renderComment(data.comment, true);
          updateCommentCount();
          setStatus("Comment posted.");
        }
      })
      .catch(function (err) { setStatus(err.message, true); })
      .then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Post comment";
      });
  });
})();
