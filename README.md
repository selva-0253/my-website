# TechResearch website

A TypeScript site built with [Vite](https://vite.dev). Pages are rendered in
the browser from typed content data and Markdown posts. Deployed to S3 +
CloudFront by `.github/workflows/deploy.yml` (infrastructure lives in
`my-website-infra`).

## Develop

```bash
npm install
npm run dev        # http://localhost:5173 with hot reload
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/ locally
```

## Where things live

| Path | What |
| --- | --- |
| `src/content/posts/*.md` | Blog posts (Markdown with frontmatter) |
| `src/content/site.ts` | Role, skills, timeline, nav, hero text (no personal details) |
| `src/pages/*.ts` | One entry module per page type |
| `src/components/` | Cards, Markdown renderer, likes/comments, generated art |
| `src/core/` | Layout (header/footer/theme), DOM helper, icons |
| `src/styles/main.css` | Design tokens and all styles (light + dark) |
| `*.html`, `blog/*.html` | Thin HTML shells (title, description, entry script) |
| `public/` | Copied as-is (favicon, empty default `site-config.js`) |

## Personal details (name, email, links, photo, CV, certifications)

**Not stored in this repository.** They live in AWS and are injected into
`site-config.js` by the deploy workflow:

- Name, email, LinkedIn, GitHub, certifications: SSM Parameter Store, `/my-website/prod/profile/*`
- Photo: private S3 bucket, `public/photo.jpg` (copied into the site at deploy)
- CV: private S3 bucket, `private/cv.pdf` (never published; visitors get a
  5-minute download link from the API after a bot check)

How to set them: `my-website-infra/docs/07-profile-and-private-files.md`.
Locally they are empty, so those parts of the page are hidden. To preview them,
temporarily edit `public/site-config.js` (do not commit personal values).

## Adding a post

1. Create `src/content/posts/my-post.md`:

   ```markdown
   ---
   title: My Post Title
   slug: my-post            # stable id; also the likes/comments key — never change it
   path: /blog/my-post.html
   date: 2026-05            # YYYY-MM or YYYY-MM-DD
   tags: [AWS, Kubernetes]
   featured: true           # optional: show on the home page
   summary: One or two sentences shown on cards and under the title.
   ---

   Body in Markdown. Fenced code blocks get syntax highlighting and a copy
   button; ```mermaid blocks render as diagrams.
   ```

2. Copy an existing file in `blog/` to `blog/my-post.html` and change the
   `<title>`, `description` and `data-post="my-post"`.

Listing, search, tags, reading time, table of contents, related posts and
prev/next links all update automatically.

## Runtime config

`site-config.js` sets `window.SITE_CONFIG` (`apiBaseUrl`, `turnstileSiteKey`,
`webAnalyticsToken`). Locally it is empty, so likes/comments and analytics are
hidden; the deploy workflow overwrites it from SSM Parameter Store.
