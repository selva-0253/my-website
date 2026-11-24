// Shared helpers for the engagement API (likes, comments, CV download) and
// the Cloudflare Turnstile bot check.

export async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "content-type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    /* e.g. a rate-limit HTML page */
  }
  if (!res.ok) {
    const msg =
      (typeof data.error === "string" && data.error) ||
      (res.status === 429 ? "Too many requests. Please wait a moment." : "Something went wrong. Please try again.");
    throw new Error(msg);
  }
  return data as T;
}

// ---------------------------------------------------------------- Turnstile
// One invisible widget, executed on demand; each token is single-use.

let turnstileLoad: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
  if (turnstileLoad) return turnstileLoad;
  turnstileLoad = new Promise((resolve, reject) => {
    if (window.turnstile) return resolve();
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      turnstileLoad = null;
      reject(new Error("Could not load the bot check. Please try again."));
    };
    document.head.appendChild(s);
  });
  return turnstileLoad;
}

export function turnstileTokens(box: HTMLElement, sitekey: string): () => Promise<string> {
  let widgetId: string | null = null;
  let waiter: { resolve: (t: string) => void; reject: (e: Error) => void } | null = null;

  return async () => {
    await loadTurnstile();
    const ts = window.turnstile!;
    return new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => {
        waiter = null;
        reject(new Error("The bot check timed out. Please try again."));
      }, 60_000);
      waiter = {
        resolve: (t) => (clearTimeout(timer), (waiter = null), resolve(t)),
        reject: (e) => (clearTimeout(timer), (waiter = null), reject(e)),
      };
      if (widgetId === null) {
        widgetId = ts.render(box, {
          sitekey,
          action: "engage",
          execution: "execute",
          appearance: "interaction-only",
          callback: (token) => waiter?.resolve(token),
          "error-callback": () => {
            waiter?.reject(new Error("The bot check failed. Please try again."));
            return true;
          },
        });
      } else {
        ts.reset(widgetId);
      }
      ts.execute(widgetId);
    });
  };
}
