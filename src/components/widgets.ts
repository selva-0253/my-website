// Small shared building blocks.

import { profile } from "../content/site";
import { copyText, h, prefersReducedMotion } from "../core/dom";
import { icon } from "../core/icons";
import { request, turnstileTokens } from "./api";

export function sectionHeader(eyebrow: string, title: string, text?: string, align: "left" | "center" = "left"): HTMLElement {
  return h(
    "div",
    { class: `section-header reveal align-${align}` },
    h("span", { class: "eyebrow" }, eyebrow),
    h("h2", null, title),
    text && h("p", { class: "lead" }, text),
  );
}

/** Rotates through `words`, typing and deleting each one. */
export function typewriter(words: string[]): HTMLElement {
  const el = h("span", { class: "typewriter" }, words[0]);
  if (prefersReducedMotion() || words.length < 2) return el;
  let w = 0;
  let i = words[0].length;
  let deleting = true;
  const tick = () => {
    const word = words[w];
    i += deleting ? -1 : 1;
    el.textContent = word.slice(0, i);
    let delay = deleting ? 35 : 70;
    if (!deleting && i === word.length) {
      deleting = true;
      delay = 2200;
    } else if (deleting && i === 0) {
      deleting = false;
      w = (w + 1) % words.length;
      delay = 300;
    }
    setTimeout(tick, delay);
  };
  setTimeout(tick, 2200);
  return el;
}

/** A number that counts up when scrolled into view. */
export function counter(value: number, suffix = ""): HTMLElement {
  const el = h("span", { class: "counter" }, `${value}${suffix}`);
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) return el;
  el.textContent = `0${suffix}`;
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    const start = performance.now();
    const dur = 1100;
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = `${Math.round(value * eased)}${suffix}`;
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
  io.observe(el);
  return el;
}

/** LinkedIn / GitHub icon links — only those filled in under `profile`. */
export function socialLinks(variant: "light" | "default" = "default"): HTMLElement | null {
  const links = [
    { url: profile.linkedin, label: "LinkedIn", icon: "linkedin" as const },
    { url: profile.github, label: "GitHub", icon: "github" as const },
  ].filter((l) => l.url);
  if (!links.length) return null;
  return h(
    "div",
    { class: `social-links ${variant}` },
    links.map((l) =>
      h("a", {
        class: "social-link",
        href: l.url,
        target: "_blank",
        rel: "noopener noreferrer me",
        "aria-label": `${l.label} profile`,
        title: l.label,
        html: icon(l.icon, 20),
      }),
    ),
  );
}

/**
 * "Download CV" button. The CV is never published: clicking runs the Turnstile
 * bot check, then the API returns a download link that expires in minutes.
 * Returns null when no CV is configured or the API is unavailable.
 */
export function cvButton(cls = "btn btn-ghost"): HTMLElement | null {
  const cfg = window.SITE_CONFIG ?? {};
  if (!profile.cvAvailable || !cfg.apiBaseUrl || !cfg.turnstileSiteKey) return null;

  const label = `${icon("download", 18)}<span>Download CV</span>`;
  const btn = h("button", { type: "button", class: cls, html: label });
  const status = h("small", { class: "cv-status", role: "status", "aria-live": "polite" });
  const box = h("div", { class: "cv-turnstile" });
  const getToken = turnstileTokens(box, cfg.turnstileSiteKey);
  const endpoint = `${cfg.apiBaseUrl.replace(/\/$/, "")}/v1/cv`;

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.innerHTML = `${icon("lock", 18)}<span>Verifying…</span>`;
    status.textContent = "";
    try {
      const token = await getToken();
      const { url } = await request<{ url?: string }>("POST", endpoint, { turnstileToken: token });
      if (!url || !/^https:\/\//.test(url)) throw new Error("The CV is not available right now.");
      window.location.assign(url); // Content-Disposition: attachment -> download, page stays
      status.textContent = "Your download has started.";
    } catch (err) {
      status.textContent = (err as Error).message;
    } finally {
      btn.disabled = false;
      btn.innerHTML = label;
    }
  });

  return h("div", { class: "cv-download" }, btn, box, status);
}

/** Contact call-to-action: email (if configured), CV and profile links. */
export function contactCard(): HTMLElement {
  const status = h("p", { class: "contact-status", role: "status", "aria-live": "polite" });
  const email = profile.email;
  const copyBtn =
    email &&
    h("button", {
      type: "button",
      class: "btn btn-light-ghost",
      html: `${icon("copy", 18)}<span>Copy email</span>`,
      onClick: async () => {
        const ok = await copyText(email);
        status.textContent = ok ? `Copied: ${email}` : "Copy failed — please select the address above.";
      },
    });
  return h(
    "section",
    { class: "container" },
    h(
      "div",
      { class: "cta-card reveal" },
      h("div", { class: "cta-glow", "aria-hidden": "true" }),
      h("span", { class: "eyebrow eyebrow-light" }, "Let's connect"),
      h("h2", null, "Let's build something meaningful"),
      h(
        "p",
        null,
        "I'm always interested in connecting with engineers, architects and people building interesting things in cloud and DevOps — whether it's discussing architecture, exploring an engineering challenge, or collaborating on something meaningful.",
      ),
      h(
        "div",
        { class: "cta-actions" },
        email && h("a", { class: "btn btn-accent", href: `mailto:${email}`, html: `${icon("mail", 18)}<span>Get in touch</span>` }),
        copyBtn,
        cvButton("btn btn-light-ghost"),
      ),
      email && h("p", { class: "contact-email" }, email),
      socialLinks("light"),
      status,
    ),
  );
}
