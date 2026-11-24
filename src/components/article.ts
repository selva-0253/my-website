// Long-form page helpers shared by articles and the "how it is built" page.

import { h } from "../core/dom";
import { icon } from "../core/icons";
import type { Heading } from "./markdown";

export function progressBar(): HTMLElement {
  const bar = h("div", { class: "read-progress", "aria-hidden": "true" });
  const update = () => {
    const article = document.querySelector(".prose");
    if (!article) return;
    const rect = article.getBoundingClientRect();
    const total = rect.height - window.innerHeight * 0.6;
    const pct = Math.min(1, Math.max(0, -rect.top / Math.max(total, 1)));
    bar.style.transform = `scaleX(${pct})`;
  };
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  requestAnimationFrame(update);
  return bar;
}

export function toc(headings: Heading[]): HTMLElement | null {
  if (headings.length < 2) return null;
  const links = new Map<string, HTMLAnchorElement>();
  const nav = h(
    "nav",
    { class: "toc", "aria-label": "On this page" },
    h("p", { class: "toc-title", html: `${icon("list", 16)} On this page` }),
    h(
      "ol",
      null,
      headings.map((hd) => {
        const a = h("a", { href: `#${hd.id}` }, hd.text);
        links.set(hd.id, a);
        return h("li", { class: `depth-${hd.depth}` }, a);
      }),
    ),
  );

  // Highlight the section currently being read.
  requestAnimationFrame(() => {
    const targets = headings.map((hd) => document.getElementById(hd.id)).filter(Boolean) as HTMLElement[];
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
        const current = targets.find((t) => visible.has(t.id))?.id;
        if (!current) return;
        links.forEach((a, id) => a.classList.toggle("active", id === current));
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    targets.forEach((t) => io.observe(t));
  });
  return nav;
}
