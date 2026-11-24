// "How this site is built" — architecture case study.

import body from "../content/how-its-built.md?raw";
import { progressBar, toc } from "../components/article";
import { enhanceMarkdown, renderMarkdown } from "../components/markdown";
import { networkCanvas } from "../components/network-canvas";
import { contactCard, sectionHeader } from "../components/widgets";
import { h } from "../core/dom";
import { icon, type IconName } from "../core/icons";
import { mount } from "../core/layout";

const layers: { icon: IconName; title: string; items: string[] }[] = [
  { icon: "code", title: "Front end", items: ["TypeScript", "Vite", "Markdown", "Generated SVG"] },
  { icon: "globe", title: "Edge & hosting", items: ["CloudFront", "S3 (private, OAC)", "ACM", "Cloudflare DNS"] },
  { icon: "zap", title: "API", items: ["API Gateway", "Lambda (Python)", "Cloudflare proxy", "Turnstile"] },
  { icon: "database", title: "Data", items: ["DynamoDB", "SSM Parameter Store"] },
  { icon: "layers", title: "Infrastructure as code", items: ["Terraform", "Reusable modules", "Remote state"] },
  { icon: "gitBranch", title: "CI/CD & security", items: ["GitHub Actions", "OIDC (no keys)", "Least-privilege IAM"] },
];

const highlights: { icon: IconName; value: string; label: string }[] = [
  { icon: "lock", value: "0", label: "Long-lived cloud keys" },
  { icon: "zap", value: "0", label: "Servers to manage" },
  { icon: "gitBranch", value: "2", label: "Repos: site + infra" },
  { icon: "dollar", value: "$5", label: "Monthly budget alert" },
];

const { html, headings } = renderMarkdown(body);
const prose = h("div", { class: "prose", html });
enhanceMarkdown(prose);

mount(
  progressBar(),
  h(
    "section",
    { class: "page-hero" },
    networkCanvas(),
    h(
      "div",
      { class: "container" },
      h("span", { class: "eyebrow eyebrow-light" }, "Case study"),
      h("h1", null, "How this site is built"),
      h(
        "p",
        { class: "hero-lead" },
        "A static TypeScript site with a serverless API — provisioned entirely with Terraform and deployed through GitHub Actions with no stored credentials.",
      ),
      h(
        "div",
        { class: "hero-meta" },
        h("span", { html: `${icon("cloud", 16)} AWS · Cloudflare` }),
        h("span", { html: `${icon("layers", 16)} Terraform` }),
        h("span", { html: `${icon("gitBranch", 16)} GitHub Actions` }),
      ),
    ),
  ),
  h(
    "section",
    { class: "container stats reveal", "aria-label": "Highlights" },
    highlights.map((s) => h("div", { class: "stat" }, h("strong", null, s.value), h("span", null, s.label))),
  ),
  h(
    "section",
    { class: "container section" },
    sectionHeader("The stack", "Six layers, one codebase each", "Every layer below is defined in code and reviewed before it reaches production.", "center"),
    h(
      "div",
      { class: "layer-grid" },
      layers.map((l, i) =>
        h(
          "article",
          { class: "layer-card reveal" },
          h("span", { class: "layer-num" }, String(i + 1).padStart(2, "0")),
          h("span", { class: "skill-icon", html: icon(l.icon, 24) }),
          h("h3", null, l.title),
          h("div", { class: "tech-items" }, l.items.map((t) => h("span", { class: "tech-item" }, t))),
        ),
      ),
    ),
  ),
  h(
    "div",
    { class: "section-alt" },
    h("div", { class: "container post-layout" }, h("article", { class: "post-main" }, prose), h("aside", { class: "post-aside" }, toc(headings))),
  ),
  contactCard(),
);

if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
