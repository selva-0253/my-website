import { siliconToCloud } from "../components/art";
import { networkCanvas } from "../components/network-canvas";
import { postCard } from "../components/post-card";
import { terminal } from "../components/terminal";
import { contactCard, counter, sectionHeader, typewriter } from "../components/widgets";
import { allTags, featuredPosts, posts } from "../content/posts";
import { cloudPlatforms, site, skills } from "../content/site";
import { h } from "../core/dom";
import { icon } from "../core/icons";
import { mount } from "../core/layout";

const hero = h(
  "section",
  { class: "hero" },
  networkCanvas(),
  h(
    "div",
    { class: "container hero-grid" },
    h(
      "div",
      { class: "hero-copy" },
      h("span", { class: "pill" }, h("span", { class: "pulse" }), `${site.role} · ${site.location}`),
      h("h1", null, "Engineering notes on ", h("br"), typewriter(site.heroWords)),
      h("p", { class: "hero-lead" }, site.tagline, " Practical write-ups from real projects — designed, automated and shipped."),
      h(
        "div",
        { class: "hero-actions" },
        h("a", { class: "btn btn-accent btn-lg", href: "/posts.html", html: `<span>Read the articles</span>${icon("arrowRight", 18)}` }),
        h("a", { class: "btn btn-light-ghost btn-lg", href: "/about.html" }, "About me"),
      ),
    ),
    h("div", { class: "hero-visual" }, terminal()),
  ),
);

const stats = h(
  "section",
  { class: "container stats reveal", "aria-label": "At a glance" },
  [
    { value: posts.length, label: "In-depth articles" },
    { value: site.experienceYears, suffix: "+", label: "Years in IT" },
    { value: cloudPlatforms.length, label: "Cloud platforms" },
    { value: allTags.length, label: "Topics covered" },
  ].map((s) => h("div", { class: "stat" }, h("strong", null, counter(s.value, s.suffix)), h("span", null, s.label))),
);

const featured = h(
  "section",
  { class: "container section" },
  h(
    "div",
    { class: "section-top" },
    sectionHeader("Featured", "Latest engineering articles", "Hands-on guides to cloud infrastructure, automation and migrations."),
    h("a", { class: "link-arrow reveal", href: "/posts.html", html: `View all articles ${icon("arrowRight", 16)}` }),
  ),
  h("div", { class: "card-grid" }, featuredPosts(3).map((p) => postCard(p))),
);

const focus = h(
  "section",
  { class: "section section-alt" },
  h(
    "div",
    { class: "container split" },
    h("div", { class: "split-visual reveal", html: siliconToCloud() }, h("div", { class: "badge-float", html: `${icon("pin", 16)} ${site.location}` })),
    h(
      "div",
      { class: "split-copy" },
      sectionHeader("The professional journey", "Bridging the gap between code and infrastructure"),
      h(
        "p",
        { class: "reveal" },
        `I'm a Hyderabad-based ${site.role} with ${site.experienceYears}+ years in IT, focused on cloud architecture, infrastructure automation and application modernisation across `,
        h("strong", null, "AWS, Azure, GCP and OCI"),
        ".",
      ),
      h(
        "ul",
        { class: "focus-list reveal" },
        skills.slice(0, 3).map((s) => h("li", null, h("span", { class: "focus-icon", html: icon(s.icon, 20) }), h("div", null, h("strong", null, s.title), h("span", null, s.tags.join(" · "))))),
      ),
      h("a", { class: "btn btn-primary reveal", href: "/about.html", html: `<span>Read my story</span>${icon("arrowRight", 18)}` }),
    ),
  ),
);

mount(hero, stats, featured, focus, contactCard());
