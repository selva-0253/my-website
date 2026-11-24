// A single article, rendered from Markdown at runtime.

import { postCover } from "../components/art";
import { engagement } from "../components/engagement";
import { progressBar, toc } from "../components/article";
import { enhanceMarkdown, renderMarkdown } from "../components/markdown";
import { postCard } from "../components/post-card";
import { formatDate, getPost, posts, relatedPosts, type Post } from "../content/posts";
import { site } from "../content/site";
import { h } from "../core/dom";
import { icon } from "../core/icons";
import { mount } from "../core/layout";

const slug = document.body.dataset.post ?? "";
const post = getPost(slug);

function pager(current: Post): HTMLElement | null {
  const i = posts.findIndex((p) => p.slug === current.slug);
  const newer = posts[i - 1];
  const older = posts[i + 1];
  if (!newer && !older) return null;
  const link = (p: Post | undefined, dir: "prev" | "next") =>
    p
      ? h(
          "a",
          { class: `pager-link ${dir}`, href: p.path },
          h("small", { html: dir === "prev" ? `${icon("arrowLeft", 14)} Older` : `Newer ${icon("arrowRight", 14)}` }),
          h("strong", null, p.title),
        )
      : h("span");
  return h("nav", { class: "pager", "aria-label": "More articles" }, link(older, "prev"), link(newer, "next"));
}

function render(p: Post): void {
  document.title = `${p.title} — ${site.name}`;
  const { html, headings } = renderMarkdown(p.body);
  const prose = h("div", { class: "prose", html });
  enhanceMarkdown(prose);
  const related = relatedPosts(p, 2);

  mount(
    progressBar(),
    h(
      "header",
      { class: "post-hero" },
      h("div", { class: "post-hero-art", html: postCover(p.slug, p.title) }),
      h(
        "div",
        { class: "container narrow" },
        h("a", { class: "back-link", href: "/posts.html", html: `${icon("arrowLeft", 16)} All articles` }),
        h("div", { class: "tags" }, p.tags.map((t) => h("a", { class: "tag tag-light", href: `/posts.html?tag=${encodeURIComponent(t)}` }, t))),
        h("h1", null, p.title),
        h("p", { class: "hero-lead" }, p.summary),
        h(
          "div",
          { class: "post-meta" },
          h("span", { html: `${icon("calendar", 16)} ${formatDate(p.date)}` }),
          h("span", { html: `${icon("clock", 16)} ${p.readingMinutes} min read` }),
        ),
      ),
    ),
    h(
      "div",
      { class: "container post-layout" },
      h("article", { class: "post-main" }, prose, engagement(p.slug, p.title), pager(p)),
      h("aside", { class: "post-aside" }, toc(headings)),
    ),
    related.length > 0 &&
      h(
        "section",
        { class: "section section-alt" },
        h("div", { class: "container" }, h("h2", { class: "related-title" }, "Keep reading"), h("div", { class: "card-grid two" }, related.map((r) => postCard(r)))),
      ),
  );

  // Honour a #section hash now that headings exist.
  if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
}

if (post) {
  render(post);
} else {
  mount(
    h(
      "section",
      { class: "container section center" },
      h("h1", null, "Article not found"),
      h("p", null, "This article may have moved."),
      h("a", { class: "btn btn-primary", href: "/posts.html" }, "Browse all articles"),
    ),
  );
}
