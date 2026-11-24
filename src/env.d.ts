/// <reference types="vite/client" />

interface SiteConfig {
  apiBaseUrl?: string;
  turnstileSiteKey?: string;
  webAnalyticsToken?: string;
  /** Written at deploy time from SSM /<prefix>/profile/* and the private bucket. */
  profile?: {
    name?: unknown;
    email?: unknown;
    linkedin?: unknown;
    github?: unknown;
    photo?: unknown;
    cvAvailable?: unknown;
    certifications?: { name?: unknown; issuer?: unknown; year?: unknown; url?: unknown }[];
  };
}

interface TurnstileOptions {
  sitekey: string;
  action?: string;
  execution?: "render" | "execute";
  appearance?: "always" | "execute" | "interaction-only";
  callback?: (token: string) => void;
  "error-callback"?: () => boolean | void;
}

interface Window {
  SITE_CONFIG?: SiteConfig;
  turnstile?: {
    render(el: HTMLElement, opts: TurnstileOptions): string;
    reset(id: string): void;
    execute(id: string): void;
  };
}
