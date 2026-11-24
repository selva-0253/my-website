// Shared page chrome: header, navigation, theme, footer, scroll effects.

import "@fontsource-variable/inter";
import "@fontsource/jetbrains-mono/400.css";
import "../styles/main.css";

import { socialLinks } from "../components/widgets";
import { nav, profile, site } from "../content/site";
import { h, prefersReducedMotion, storage } from "./dom";
import { icon } from "./icons";

export type Theme = "light" | "dark";

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  storage("theme", theme);
  window.dispatchEvent(new CustomEvent<Theme>("themechange", { detail: theme }));
}

function logo(): HTMLAnchorElement {
  return h(
    "a",
    { class: "logo", href: "/index.html", "aria-label": `${site.name} home` },
    h("span", {
      class: "logo-mark",
      html: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="url(#lg)"/><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#5b21b6"/></linearGradient></defs><path d="M9 11h14M16 11v12" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="23" cy="22" r="2.6" fill="#f97316"/></svg>',
    }),
    h("span", { class: "logo-text" }, site.name),
  );
}

function header(page: string): HTMLElement {
  const themeBtn = h("button", {
    type: "button",
    class: "icon-btn theme-toggle",
    "aria-label": "Toggle dark mode",
    html: icon("sun") + icon("moon"),
    onClick: () => setTheme(currentTheme() === "dark" ? "light" : "dark"),
  });

  const links = h(
    "ul",
    { class: "nav-links", id: "nav-links" },
    nav.map((item) =>
      h(
        "li",
        null,
        h(
          "a",
          {
            href: item.href,
            class: item.page === page || (page === "post" && item.page === "posts") ? "active" : undefined,
            "aria-current": item.page === page ? "page" : undefined,
          },
          item.label,
        ),
      ),
    ),
  );

  const menuBtn = h("button", {
    type: "button",
    class: "icon-btn menu-toggle",
    "aria-label": "Open menu",
    "aria-expanded": "false",
    "aria-controls": "nav-links",
    html: icon("menu") + icon("close"),
  });

  const el = h(
    "header",
    { class: "site-header" },
    h("div", { class: "header-inner" }, logo(), h("nav", { "aria-label": "Main" }, links), h("div", { class: "header-actions" }, themeBtn, menuBtn)),
  );

  const setOpen = (open: boolean) => {
    el.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  menuBtn.addEventListener("click", () => setOpen(!el.classList.contains("menu-open")));
  links.addEventListener("click", (e) => {
    if ((e.target as Element).closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  const onScroll = () => el.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  return el;
}

function footer(): HTMLElement {
  return h(
    "footer",
    { class: "site-footer" },
    h(
      "div",
      { class: "container footer-inner" },
      h("div", { class: "footer-brand" }, logo(), h("p", null, site.tagline), socialLinks()),
      h(
        "nav",
        { class: "footer-links", "aria-label": "Footer" },
        nav.map((item) => h("a", { href: item.href }, item.label)),
        h("a", { href: "/how-its-built.html" }, "How this site is built"),
        profile.email && h("a", { href: `mailto:${profile.email}` }, "Contact"),
      ),
    ),
    h(
      "div",
      { class: "container footer-bottom" },
      h("span", null, `© ${new Date().getFullYear()} ${profile.name || site.name} · ${site.role}`),
      h("a", { href: "/how-its-built.html" }, "Built with TypeScript & Terraform · Served from AWS CloudFront"),
    ),
  );
}

function backToTop(): HTMLButtonElement {
  const btn = h("button", {
    type: "button",
    class: "icon-btn back-to-top",
    "aria-label": "Back to top",
    html: icon("arrowUp"),
    onClick: () => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" }),
  });
  const update = () => btn.classList.toggle("visible", window.scrollY > 600);
  window.addEventListener("scroll", update, { passive: true });
  return btn;
}

// ------------------------------------------------------------ scroll reveal

const revealObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("in-view");
            revealObserver?.unobserve(entry.target);
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
      )
    : null;

/** Animate `.reveal` elements inside `root` as they scroll into view. */
export function reveal(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(".reveal:not(.in-view)").forEach((el, i) => {
    if (!revealObserver || prefersReducedMotion()) {
      el.classList.add("in-view");
      return;
    }
    el.style.setProperty("--delay", `${Math.min(i % 6, 5) * 70}ms`);
    revealObserver.observe(el);
  });
}

// ---------------------------------------------------------------- analytics

function loadAnalytics(): void {
  const token = window.SITE_CONFIG?.webAnalyticsToken;
  if (!token) return;
  const s = document.createElement("script");
  s.defer = true;
  s.src = "https://static.cloudflareinsights.com/beacon.min.js";
  s.dataset.cfBeacon = JSON.stringify({ token });
  document.head.appendChild(s);
}

// -------------------------------------------------------------------- mount

/** Render the shared layout around the page's main content. */
export function mount(...content: (Node | null | undefined | false)[]): HTMLElement {
  const page = document.body.dataset.page ?? "";
  const app = document.getElementById("app") ?? document.body;
  const main = h("main", { id: "main", class: `page page-${page}` }, content);
  app.replaceChildren(
    h("a", { class: "skip-link", href: "#main" }, "Skip to content"),
    header(page),
    main,
    footer(),
    backToTop(),
  );
  reveal(app);
  loadAnalytics();
  return main;
}
