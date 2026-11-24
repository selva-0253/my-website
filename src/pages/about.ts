import { siliconToCloud } from "../components/art";
import { networkCanvas } from "../components/network-canvas";
import { contactCard, counter, cvButton, sectionHeader, socialLinks } from "../components/widgets";
import { getPost } from "../content/posts";
import { about, certifications, cloudPlatforms, profile, site, skills, techGroups, timeline } from "../content/site";
import { h } from "../core/dom";
import { icon } from "../core/icons";
import { mount } from "../core/layout";

// --------------------------------------------------------------- hero

const hero = h(
  "section",
  { class: "page-hero about-hero" },
  networkCanvas(),
  h(
    "div",
    { class: "container" },
    h("span", { class: "eyebrow eyebrow-light" }, profile.name ? `About ${profile.name}` : "About me"),
    h("h1", null, about.headline),
    h("p", { class: "hero-lead" }, h("strong", null, site.role), h("br"), site.specialties),
    h(
      "div",
      { class: "hero-meta" },
      h("span", { html: `${icon("briefcase", 16)} ${site.experienceYears}+ years in IT` }),
      h("span", { html: `${icon("cloud", 16)} AWS · Azure · GCP · OCI` }),
      h("span", { html: `${icon("pin", 16)} ${site.location}` }),
    ),
  ),
);

// -------------------------------------------------------------- intro

const initials = profile.name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((w) => w[0].toUpperCase())
  .join("");

const identity =
  profile.photo || profile.name
    ? h(
        "div",
        { class: "facts-identity" },
        profile.photo
          ? h("img", { class: "facts-photo", src: profile.photo, alt: profile.name ? `Photo of ${profile.name}` : "Profile photo", width: "72", height: "72", loading: "lazy" })
          : h("span", { class: "facts-photo facts-initials", "aria-hidden": "true" }, initials),
        h("div", null, profile.name && h("strong", null, profile.name), h("span", null, site.role)),
      )
    : null;

const facts = h(
  "aside",
  { class: "facts-card reveal", "aria-label": "At a glance" },
  identity,
  h("p", { class: "facts-motto" }, site.motto),
  h("p", { class: "facts-motto-line" }, site.mottoLine),
  h(
    "div",
    { class: "facts-stats" },
    h("div", null, h("strong", null, counter(site.experienceYears, "+")), h("span", null, "Years in IT")),
    h("div", null, h("strong", null, counter(cloudPlatforms.length)), h("span", null, "Cloud platforms")),
  ),
  h(
    "dl",
    { class: "facts-list" },
    h("dt", null, "Role"),
    h("dd", null, site.role),
    h("dt", null, "Based in"),
    h("dd", null, site.location),
    h("dt", null, "Focus"),
    h("dd", null, "Cloud architecture, automation & modernisation"),
  ),
  h(
    "div",
    { class: "facts-actions" },
    profile.email && h("a", { class: "btn btn-primary", href: `mailto:${profile.email}`, html: `${icon("mail", 18)}<span>Get in touch</span>` }),
    cvButton(),
  ),
  socialLinks(),
);

const intro = h(
  "section",
  { class: "container section" },
  h(
    "div",
    { class: "about-intro" },
    h(
      "div",
      { class: "about-intro-copy" },
      sectionHeader("Hello", "A practical engineer for modern cloud platforms"),
      about.intro.map((p, i) => h("p", { class: `reveal${i === 0 ? " lead" : ""}` }, p)),
    ),
    facts,
  ),
);

// ---------------------------------------------------------- what I do

const whatIDo = h(
  "section",
  { class: "section section-alt" },
  h(
    "div",
    { class: "container" },
    sectionHeader("What I do", "Where cloud, architecture and automation meet", about.whatIDoLead, "center"),
    h(
      "div",
      { class: "skill-grid" },
      skills.map((s) =>
        h(
          "article",
          { class: "skill-card reveal" },
          h("span", { class: "skill-icon", html: icon(s.icon, 26) }),
          h("h3", null, s.title),
          h("p", null, s.text),
          h("div", { class: "tags" }, s.tags.map((t) => h("span", { class: "tag" }, t))),
        ),
      ),
    ),
  ),
);

// ---------------------------------------------------- project highlight

const hlPost = getPost(about.highlight.postSlug);
const highlight = h(
  "section",
  { class: "container section" },
  h(
    "div",
    { class: "highlight-card reveal" },
    h(
      "div",
      { class: "highlight-copy" },
      h("span", { class: "eyebrow" }, about.highlight.eyebrow),
      h("h2", null, about.highlight.title),
      h("p", null, about.highlight.text),
      h("ul", { class: "highlight-points" }, about.highlight.points.map((p) => h("li", { html: `${icon("check", 16)} ${p}` }))),
      hlPost && h("a", { class: "link-arrow", href: hlPost.path, html: `Read the case study ${icon("arrowRight", 16)}` }),
    ),
    h(
      "div",
      { class: "highlight-flow", "aria-hidden": "true" },
      h("div", { class: "flow-node" }, "Auth0"),
      h("div", { class: "flow-arrow", html: icon("arrowRight", 22) }),
      h("div", { class: "flow-node flow-node-accent" }, "Amazon Cognito"),
    ),
  ),
);

// ------------------------------------------------------------ approach

const approach = h(
  "section",
  { class: "section section-alt" },
  h(
    "div",
    { class: "container" },
    h(
      "div",
      { class: "approach" },
      h(
        "div",
        { class: "approach-copy" },
        h("span", { class: "eyebrow" }, "My approach to technology"),
        h("blockquote", { class: "approach-quote reveal" }, h("span", { html: icon("quote", 32) }), about.approach.quote),
        h("p", { class: "reveal" }, about.approach.text),
        h("p", { class: "approach-learning reveal" }, about.approach.learning),
      ),
      h(
        "ol",
        { class: "principles" },
        about.approach.principles.map((p) =>
          h("li", { class: "principle reveal" }, h("span", { class: "focus-icon", html: icon(p.icon, 20) }), h("div", null, h("strong", null, p.title), h("span", null, p.text))),
        ),
      ),
    ),
  ),
);

// ---------------------------------------------------------- technology

const tech = h(
  "section",
  { class: "container section" },
  sectionHeader("Core technologies", "The toolkit", "Hands-on experience across platforms and tooling — with current learning interests marked separately."),
  h(
    "div",
    { class: "tech-groups" },
    techGroups.map((g) =>
      h(
        "div",
        { class: `tech-group reveal${g.learning ? " is-learning" : ""}` },
        h("h3", null, g.title, g.learning && h("span", { class: "learning-badge", html: `${icon("sparkles", 14)} Learning` })),
        h("div", { class: "tech-items" }, g.items.map((t) => h("span", { class: "tech-item" }, t))),
      ),
    ),
  ),
);

// ------------------------------------------------------- certifications

const certs =
  certifications.length > 0
    ? h(
        "section",
        { class: "container section-tight" },
        sectionHeader("Certifications", "Verified credentials"),
        h(
          "div",
          { class: "cert-grid" },
          certifications.map((c) => {
            const body = [
              h("span", { class: "cert-icon", html: icon("award", 26) }),
              h("div", null, h("strong", null, c.name), h("span", null, [c.issuer, c.year].filter(Boolean).join(" · "))),
              c.url && h("span", { class: "cert-verify", html: `Verify ${icon("external", 14)}` }),
            ];
            return c.url
              ? h("a", { class: "cert-card reveal", href: c.url, target: "_blank", rel: "noopener noreferrer" }, body)
              : h("div", { class: "cert-card reveal" }, body);
          }),
        ),
      )
    : null;

// ------------------------------------------------- how this site is built

const builtTeaser = h(
  "section",
  { class: "container section-tight" },
  h(
    "a",
    { class: "built-teaser reveal", href: "/how-its-built.html" },
    h("span", { class: "built-teaser-icon", html: icon("layers", 28) }),
    h(
      "div",
      null,
      h("span", { class: "eyebrow" }, "Case study"),
      h("strong", null, "How this website is built"),
      h("span", null, "Terraform, S3 + CloudFront, a serverless comments API, and keyless CI/CD — the architecture behind this site."),
    ),
    h("span", { class: "built-teaser-arrow", html: icon("arrowRight", 22) }),
  ),
);

// ------------------------------------------------------- journey + beyond

const journey = h(
  "section",
  { class: "section section-alt" },
  h(
    "div",
    { class: "container split" },
    h(
      "div",
      { class: "split-copy" },
      sectionHeader("Career", "My professional journey"),
      h(
        "ol",
        { class: "timeline" },
        timeline.map((t, i) =>
          h("li", { class: "timeline-item reveal" }, h("span", { class: "timeline-step" }, String(i + 1).padStart(2, "0")), h("h3", null, t.title), h("p", null, t.text)),
        ),
      ),
    ),
    h("div", { class: "split-visual reveal", html: siliconToCloud() }, h("div", { class: "badge-float", html: `${icon("pin", 16)} ${site.location}` })),
  ),
);

const beyond = h(
  "section",
  { class: "container section" },
  h(
    "div",
    { class: "beyond" },
    sectionHeader("Beyond the day-to-day", "Why this website exists", about.mission),
    h(
      "div",
      { class: "beyond-interests reveal" },
      h("p", { class: "beyond-label" }, "Particularly interested in"),
      h("div", { class: "tags interest-tags" }, about.interests.map((t) => h("span", { class: "tag" }, t))),
    ),
  ),
);

mount(hero, intro, whatIDo, highlight, approach, tech, certs, builtTeaser, journey, beyond, contactCard());
