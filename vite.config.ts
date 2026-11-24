import { defineConfig } from "vite";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = import.meta.dirname;

// Multi-page build: every HTML shell is its own entry so existing URLs
// (/posts.html, /blog/terraform.html, ...) keep working on S3 + CloudFront.
const blogPages = Object.fromEntries(
  readdirSync(resolve(root, "blog"))
    .filter((f) => f.endsWith(".html"))
    .map((f) => [`blog/${f.replace(/\.html$/, "")}`, resolve(root, "blog", f)]),
);

export default defineConfig({
  build: {
    target: "es2022",
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500, // mermaid is lazy-loaded only on posts with diagrams
    rollupOptions: {
      input: {
        index: resolve(root, "index.html"),
        posts: resolve(root, "posts.html"),
        about: resolve(root, "about.html"),
        "404": resolve(root, "404.html"),
        "how-its-built": resolve(root, "how-its-built.html"),
        ...blogPages,
      },
    },
  },
});
