// A terminal window that "types" a deployment session on a loop.

import { terminalScript } from "../content/site";
import { h, prefersReducedMotion } from "../core/dom";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function terminal(): HTMLElement {
  const body = h("div", { class: "term-body", "aria-hidden": "true" });
  const el = h(
    "div",
    { class: "terminal", role: "img", "aria-label": "Terminal showing a Terraform apply and site deployment" },
    h(
      "div",
      { class: "term-bar" },
      h("span", { class: "dot red" }),
      h("span", { class: "dot amber" }),
      h("span", { class: "dot green" }),
      h("span", { class: "term-title" }, "~/my-website-infra"),
    ),
    body,
  );

  function line(cls: string): HTMLDivElement {
    const div = h("div", { class: `term-line ${cls}` });
    body.appendChild(div);
    return div;
  }

  function renderStatic(): void {
    body.replaceChildren();
    for (const step of terminalScript) {
      if (step.cmd) line("cmd").append(h("span", { class: "prompt" }, "$ "), step.cmd);
      else line(step.tone ?? "muted").textContent = step.out ?? "";
    }
  }

  async function play(): Promise<void> {
    for (;;) {
      body.replaceChildren();
      for (const step of terminalScript) {
        if (step.cmd) {
          const row = line("cmd");
          const text = h("span");
          const caret = h("span", { class: "caret" });
          row.append(h("span", { class: "prompt" }, "$ "), text, caret);
          for (const ch of step.cmd) {
            text.textContent += ch;
            await sleep(28 + Math.random() * 40);
          }
          await sleep(350);
          caret.remove();
        } else {
          line(step.tone ?? "muted").textContent = step.out ?? "";
          await sleep(320);
        }
      }
      const idle = line("cmd");
      idle.append(h("span", { class: "prompt" }, "$ "), h("span", { class: "caret" }));
      await sleep(4200);
    }
  }

  if (prefersReducedMotion()) renderStatic();
  else void play();
  return el;
}
