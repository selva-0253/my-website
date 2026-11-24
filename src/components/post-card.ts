import type { Post } from "../content/posts";
import { formatDate } from "../content/posts";
import { h } from "../core/dom";
import { icon } from "../core/icons";
import { postCover } from "./art";

export function postCard(post: Post, opts: { highlight?: string } = {}): HTMLElement {
  const title = h("h3", { class: "card-title" });
  const summary = h("p", { class: "card-summary" });
  setHighlighted(title, post.title, opts.highlight);
  setHighlighted(summary, post.summary, opts.highlight);

  return h(
    "article",
    { class: "post-card reveal" },
    h(
      "a",
      { href: post.path, class: "card-link", "aria-label": post.title },
      h("div", { class: "card-cover", html: postCover(post.slug, post.title) }),
      h(
        "div",
        { class: "card-body" },
        h("div", { class: "tags" }, post.tags.map((t) => h("span", { class: "tag" }, t))),
        title,
        summary,
        h(
          "div",
          { class: "card-meta" },
          h("span", { html: `${icon("calendar", 15)} ${formatDate(post.date)}` }),
          h("span", { html: `${icon("clock", 15)} ${post.readingMinutes} min read` }),
          h("span", { class: "card-arrow", html: icon("arrowRight", 18) }),
        ),
      ),
    ),
  );
}

/** Set text, wrapping matches of `query` in <mark> (safely, no innerHTML). */
function setHighlighted(el: HTMLElement, text: string, query?: string): void {
  const q = query?.trim();
  if (!q) {
    el.textContent = text;
    return;
  }
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  text.split(re).forEach((part, i) => {
    el.append(i % 2 ? h("mark", null, part) : document.createTextNode(part));
  });
}
