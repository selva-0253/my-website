// Articles index: live search, tag filters and sorting, synced to the URL
// (?q=terraform&tag=AWS&sort=oldest) so filtered views can be shared.

import { postCard } from "../components/post-card";
import { allTags, posts, type Post } from "../content/posts";
import { h } from "../core/dom";
import { icon } from "../core/icons";
import { mount, reveal } from "../core/layout";

type Sort = "newest" | "oldest" | "shortest";

const params = new URLSearchParams(window.location.search);
const state = {
  q: params.get("q") ?? "",
  tag: params.get("tag") ?? "",
  sort: (params.get("sort") as Sort) || "newest",
};
if (state.tag && !allTags.includes(state.tag)) state.tag = "";

const search = h("input", {
  type: "search",
  class: "search-input",
  placeholder: "Search articles…",
  "aria-label": "Search articles",
  value: state.q,
});
const sortSelect = h(
  "select",
  { class: "sort-select", "aria-label": "Sort articles" },
  (["newest", "oldest", "shortest"] as Sort[]).map((s) =>
    h("option", { value: s, selected: s === state.sort }, s === "shortest" ? "Quickest read" : s[0].toUpperCase() + s.slice(1)),
  ),
);
const chips = h("div", { class: "chips", role: "group", "aria-label": "Filter by topic" });
const count = h("p", { class: "result-count", role: "status", "aria-live": "polite" });
const grid = h("div", { class: "card-grid" });

function renderChips(): void {
  chips.replaceChildren(
    ...["", ...allTags].map((tag) => {
      const n = tag ? posts.filter((p) => p.tags.includes(tag)).length : posts.length;
      return h(
        "button",
        {
          type: "button",
          class: `chip${state.tag === tag ? " active" : ""}`,
          "aria-pressed": String(state.tag === tag),
          onClick: () => {
            state.tag = state.tag === tag ? "" : tag;
            update();
          },
        },
        tag || "All",
        h("span", { class: "chip-count" }, n),
      );
    }),
  );
}

function matches(p: Post, q: string): boolean {
  if (!q) return true;
  const hay = `${p.title} ${p.summary} ${p.tags.join(" ")} ${p.body}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => hay.includes(term));
}

function update(syncUrl = true): void {
  const q = state.q.trim();
  const list = posts
    .filter((p) => (!state.tag || p.tags.includes(state.tag)) && matches(p, q))
    .sort((a, b) =>
      state.sort === "oldest"
        ? a.date.localeCompare(b.date)
        : state.sort === "shortest"
          ? a.readingMinutes - b.readingMinutes
          : b.date.localeCompare(a.date),
    );

  renderChips();
  count.textContent = `Showing ${list.length} of ${posts.length} article${posts.length === 1 ? "" : "s"}${state.tag ? ` in ${state.tag}` : ""}${q ? ` matching “${q}”` : ""}`;

  if (list.length) {
    grid.replaceChildren(...list.map((p) => postCard(p, { highlight: q })));
  } else {
    grid.replaceChildren(
      h(
        "div",
        { class: "empty-state" },
        h("span", { html: icon("search", 32) }),
        h("h3", null, "No articles found"),
        h("p", null, "Try a different search term or topic."),
        h(
          "button",
          {
            type: "button",
            class: "btn btn-primary",
            onClick: () => {
              state.q = "";
              state.tag = "";
              search.value = "";
              update();
            },
          },
          "Clear filters",
        ),
      ),
    );
  }
  reveal(grid);

  if (syncUrl) {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (state.tag) next.set("tag", state.tag);
    if (state.sort !== "newest") next.set("sort", state.sort);
    const qs = next.toString();
    history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }
}

let debounce = 0;
search.addEventListener("input", () => {
  clearTimeout(debounce);
  debounce = window.setTimeout(() => {
    state.q = search.value;
    update();
  }, 120);
});
sortSelect.addEventListener("change", () => {
  state.sort = sortSelect.value as Sort;
  update();
});

// "/" focuses search, like many docs sites.
document.addEventListener("keydown", (e) => {
  const target = e.target as HTMLElement;
  if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(target.tagName)) {
    e.preventDefault();
    search.focus();
  }
});

mount(
  h(
    "section",
    { class: "page-hero" },
    h(
      "div",
      { class: "container" },
      h("span", { class: "eyebrow eyebrow-light" }, "Knowledge base"),
      h("h1", null, "Engineering articles"),
      h("p", { class: "hero-lead" }, "Technical deep-dives into cloud architecture, automation, and DevOps patterns."),
      h(
        "div",
        { class: "toolbar" },
        h("label", { class: "search" }, h("span", { html: icon("search", 18) }), search, h("kbd", null, "/")),
        sortSelect,
      ),
    ),
  ),
  h("section", { class: "container section-tight" }, chips, count, grid),
);
update(false);
