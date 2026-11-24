// Markdown → HTML with syntax highlighting, heading anchors, copyable code
// blocks and lazily-loaded Mermaid diagrams that follow the site theme.

import { Marked } from "marked";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import go from "highlight.js/lib/languages/go";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import yaml from "highlight.js/lib/languages/yaml";
import type { HLJSApi, Language } from "highlight.js";

import { copyText } from "../core/dom";
import { icon } from "../core/icons";

function hcl(api: HLJSApi): Language {
  return {
    name: "HCL",
    aliases: ["terraform", "tf"],
    keywords: {
      keyword: "resource data variable output module provider locals terraform for_each count dynamic",
      literal: "true false null",
    },
    contains: [
      api.HASH_COMMENT_MODE,
      api.C_LINE_COMMENT_MODE,
      api.C_BLOCK_COMMENT_MODE,
      api.QUOTE_STRING_MODE,
      api.NUMBER_MODE,
      { className: "attr", begin: /\b[a-zA-Z_][\w-]*(?=\s*=(?!=))/ },
    ],
  };
}

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("go", go);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("python", python);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("hcl", hcl);

const LANG_LABELS: Record<string, string> = {
  bash: "Shell",
  sh: "Shell",
  hcl: "Terraform",
  terraform: "Terraform",
  ts: "TypeScript",
  typescript: "TypeScript",
  js: "JavaScript",
  javascript: "JavaScript",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  go: "Go",
  python: "Python",
};

const escapeHTML = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function decodeEntities(s: string): string {
  const t = document.createElement("textarea");
  t.innerHTML = s;
  return t.value;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z0-9#]+;/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export interface Heading {
  id: string;
  text: string;
  depth: number;
}

export function renderMarkdown(source: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const used = new Map<string, number>();

  const md = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth, text }) {
        const inner = this.parser.parseInline(tokens);
        let id = slugify(text) || "section";
        const n = used.get(id) ?? 0;
        used.set(id, n + 1);
        if (n) id += `-${n}`;
        if (depth === 2 || depth === 3) headings.push({ id, text: decodeEntities(inner.replace(/<[^>]+>/g, "")), depth });
        return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-label="Link to this section">#</a>${inner}</h${depth}>\n`;
      },
      code({ text, lang }) {
        const language = (lang ?? "").trim().split(/\s+/)[0].toLowerCase();
        if (language === "mermaid") {
          return `<figure class="diagram"><div class="mermaid-src" hidden>${escapeHTML(text)}</div><div class="mermaid-out" aria-busy="true"><span class="diagram-loading">Rendering diagram…</span></div></figure>`;
        }
        const highlighted = hljs.getLanguage(language)
          ? hljs.highlight(text, { language }).value
          : escapeHTML(text);
        const label = LANG_LABELS[language] ?? (language ? language.toUpperCase() : "Code");
        return `<div class="code-block"><div class="code-head"><span>${label}</span><button type="button" class="copy-code" aria-label="Copy code">${icon("copy", 15)}<span>Copy</span></button></div><pre><code class="hljs">${highlighted}</code></pre></div>`;
      },
    },
  });

  return { html: md.parse(source, { async: false }) as string, headings };
}

/** Wire up copy buttons and diagrams inside rendered Markdown. */
export function enhanceMarkdown(root: HTMLElement): void {
  root.addEventListener("click", async (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>(".copy-code");
    if (!btn) return;
    const code = btn.closest(".code-block")?.querySelector("code")?.textContent ?? "";
    const ok = await copyText(code);
    btn.classList.toggle("copied", ok);
    btn.innerHTML = (ok ? icon("check", 15) : icon("copy", 15)) + `<span>${ok ? "Copied" : "Copy failed"}</span>`;
    setTimeout(() => {
      btn.classList.remove("copied");
      btn.innerHTML = icon("copy", 15) + "<span>Copy</span>";
    }, 1800);
  });

  // Wrap tables so they scroll horizontally on small screens.
  root.querySelectorAll("table").forEach((t) => {
    const wrap = document.createElement("div");
    wrap.className = "table-wrap";
    t.replaceWith(wrap);
    wrap.appendChild(t);
  });

  const diagrams = [...root.querySelectorAll<HTMLElement>(".diagram")];
  if (!diagrams.length) return;

  let counter = 0;
  const render = async () => {
    const { default: mermaid } = await import("mermaid");
    const dark = document.documentElement.dataset.theme === "dark";
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      fontFamily: "Inter Variable, Inter, system-ui, sans-serif",
      themeVariables: dark
        ? { primaryColor: "#2a1650", primaryTextColor: "#ede9fe", primaryBorderColor: "#8b5cf6", lineColor: "#a78bfa", clusterBkg: "#1a1130", clusterBorder: "#4c1d95", edgeLabelBackground: "#160d2a", tertiaryColor: "#1a1130" }
        : { primaryColor: "#f5f3ff", primaryTextColor: "#1e1b4b", primaryBorderColor: "#7c3aed", lineColor: "#7c3aed", clusterBkg: "#faf8ff", clusterBorder: "#ddd6fe", edgeLabelBackground: "#ffffff", tertiaryColor: "#fff7ed" },
    });
    for (const fig of diagrams) {
      const src = fig.querySelector(".mermaid-src")?.textContent ?? "";
      const out = fig.querySelector<HTMLElement>(".mermaid-out")!;
      try {
        const { svg } = await mermaid.render(`mmd-${++counter}`, src);
        out.innerHTML = svg;
      } catch {
        out.innerHTML = `<pre class="diagram-error">${escapeHTML(src)}</pre>`;
      }
      out.removeAttribute("aria-busy");
    }
  };

  // Load Mermaid only when the first diagram approaches the viewport.
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        void render();
        window.addEventListener("themechange", () => void render());
      }
    },
    { rootMargin: "400px 0px" },
  );
  diagrams.forEach((d) => io.observe(d));
}
