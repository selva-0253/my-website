// Likes, comments and sharing for a blog post — talks to the engagement API
// (my-website-infra/modules/engagement-api). Needs SITE_CONFIG.apiBaseUrl and
// turnstileSiteKey; without them only sharing is shown.

import { copyText, h, storage } from "../core/dom";
import { request, turnstileTokens } from "./api";
import { icon } from "../core/icons";

interface Comment {
  name?: string;
  text: string;
  createdAt?: string;
}

// ----------------------------------------------------------------------- UI

export function engagement(slug: string, title: string): HTMLElement {
  const cfg = window.SITE_CONFIG ?? {};
  const apiReady = Boolean(cfg.apiBaseUrl && cfg.turnstileSiteKey && slug);
  const postUrl = cfg.apiBaseUrl ? `${cfg.apiBaseUrl.replace(/\/$/, "")}/v1/posts/${encodeURIComponent(slug)}` : "";
  const likedKey = `liked:${slug}`;
  const pageUrl = window.location.href.split("#")[0];

  const status = h("p", { class: "eng-status", role: "status", "aria-live": "polite" });
  const setStatus = (msg = "", isError = false) => {
    status.textContent = msg;
    status.classList.toggle("is-error", isError);
  };

  const likeCount = h("span", { class: "eng-like-count" });
  const likeLabel = h("span", null, "Like");
  const likeBtn = h(
    "button",
    { type: "button", class: "btn btn-primary eng-like", "aria-pressed": "false" },
    h("span", { html: icon("heart", 18) }),
    likeLabel,
    likeCount,
  );
  const shareBtn = h("button", { type: "button", class: "btn btn-ghost", html: `${icon("share", 18)}<span>Share</span>` });
  const linkedIn = h(
    "a",
    { class: "btn btn-ghost", target: "_blank", rel: "noopener noreferrer", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}` },
    "LinkedIn",
  );
  const xLink = h(
    "a",
    { class: "btn btn-ghost", target: "_blank", rel: "noopener noreferrer", href: `https://x.com/intent/post?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(title)}` },
    "X",
  );

  shareBtn.addEventListener("click", async () => {
    if (navigator.share) {
      navigator.share({ title, url: pageUrl }).catch(() => {});
      return;
    }
    setStatus((await copyText(pageUrl)) ? "Link copied to clipboard." : `Copy this link: ${pageUrl}`);
  });

  const root = h(
    "section",
    { class: "engagement reveal", "aria-labelledby": "eng-heading" },
    h("h2", { id: "eng-heading" }, "Did this help?"),
    h("p", { class: "muted" }, "Share it with someone who'd find it useful, or leave a question below."),
    h("div", { class: "eng-actions" }, apiReady && likeBtn, shareBtn, linkedIn, xLink),
    status,
  );
  if (!apiReady) return root;

  // --- comments
  const commentCount = h("span", { class: "eng-count" });
  const list = h("ol", { class: "eng-comments" });
  const empty = h("p", { class: "eng-empty muted" }, "No comments yet. Questions and corrections are welcome.");
  const nameInput = h("input", { type: "text", id: "eng-name", maxlength: "40", autocomplete: "name", placeholder: "Optional" });
  const textInput = h("textarea", { id: "eng-text", maxlength: "1000", rows: "4", required: true, placeholder: "Feedback, questions or corrections" });
  const charCount = h("span", { class: "eng-chars muted" }, "0 / 1000");
  const turnstileBox = h("div", { class: "eng-turnstile" });
  const submitBtn = h("button", { type: "submit", class: "btn btn-primary" }, "Post comment");
  const form = h(
    "form",
    { class: "eng-form", novalidate: true },
    h("div", { class: "field" }, h("label", { for: "eng-name" }, "Name"), nameInput),
    h("div", { class: "field" }, h("label", { for: "eng-text" }, "Comment"), textInput, charCount),
    turnstileBox,
    h("div", { class: "eng-form-foot" }, submitBtn, h("small", { class: "muted" }, "Protected by Cloudflare Turnstile. Please keep it respectful.")),
  );
  textInput.addEventListener("input", () => (charCount.textContent = `${textInput.value.length} / 1000`));

  root.append(h("h3", null, "Comments ", commentCount), empty, list, form);

  const getToken = turnstileTokens(turnstileBox, cfg.turnstileSiteKey!);

  const showLikes = (n: number) => (likeCount.textContent = n > 0 ? ` · ${n}` : "");
  const markLiked = () => {
    likeBtn.classList.add("is-liked");
    likeBtn.setAttribute("aria-pressed", "true");
    likeBtn.disabled = true;
    likeLabel.textContent = "Liked";
  };
  const renderComment = (c: Comment, prepend: boolean) => {
    const when = c.createdAt ? new Date(c.createdAt) : null;
    const name = c.name || "Anonymous";
    const item = h(
      "li",
      { class: "eng-comment" },
      h("div", { class: "avatar", "aria-hidden": "true" }, name.charAt(0).toUpperCase()),
      h(
        "div",
        null,
        h(
          "div",
          { class: "eng-comment-meta" },
          h("strong", null, name),
          when && !isNaN(+when) && h("time", { datetime: c.createdAt }, when.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })),
        ),
        h("p", null, c.text),
      ),
    );
    if (prepend) list.prepend(item);
    else list.append(item);
  };
  const updateCount = () => {
    const n = list.children.length;
    commentCount.textContent = n ? `(${n})` : "";
    empty.hidden = n > 0;
  };

  if (storage(likedKey)) markLiked();

  request<{ likes?: number; comments?: Comment[] }>("GET", postUrl)
    .then((data) => {
      showLikes(data.likes ?? 0);
      (data.comments ?? []).forEach((c) => renderComment(c, false));
    })
    .catch(() => setStatus("Comments could not be loaded right now.", true))
    .finally(updateCount);

  likeBtn.addEventListener("click", async () => {
    likeBtn.disabled = true;
    setStatus();
    try {
      const token = await getToken();
      const data = await request<{ likes?: number; alreadyLiked?: boolean }>("POST", `${postUrl}/likes`, { turnstileToken: token });
      showLikes(data.likes ?? 0);
      markLiked();
      storage(likedKey, "1");
      setStatus(data.alreadyLiked ? "You've already liked this post." : "Thanks for the like!");
    } catch (err) {
      likeBtn.disabled = false;
      setStatus((err as Error).message, true);
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = textInput.value.trim();
    if (text.length < 2) {
      setStatus("Please write a comment first.", true);
      textInput.focus();
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = "Posting…";
    setStatus();
    try {
      const token = await getToken();
      const data = await request<{ pending?: boolean; comment?: Comment }>("POST", `${postUrl}/comments`, {
        name: nameInput.value.trim(),
        text,
        turnstileToken: token,
      });
      textInput.value = "";
      charCount.textContent = "0 / 1000";
      if (data.pending || !data.comment) {
        setStatus("Thanks! Your comment will appear after review.");
      } else {
        renderComment(data.comment, true);
        updateCount();
        setStatus("Comment posted.");
      }
    } catch (err) {
      setStatus((err as Error).message, true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Post comment";
    }
  });

  return root;
}
