# shiiift

Technology implementation consultancy website — built with Astro, React islands, TailwindCSS, and Decap CMS.

## Stack

- **Astro** — static site generator with i18n support
- **React** — interactive tool islands (client-side)
- **TailwindCSS** — utility-first styling
- **TypeScript** — full type safety
- **Decap CMS** (formerly Netlify CMS) — git-based content management
- **Netlify** — hosting + forms + identity

## Languages

| Code | Language | Direction |
|------|----------|-----------|
| `he` | Hebrew   | RTL (default) |
| `en` | English  | LTR |
| `es` | Spanish  | LTR |
| `ru` | Russian  | LTR |

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
  components/       # Astro + React components
    tools/          # React island tools
  content/          # Markdown content (thinking, case-studies)
  i18n/             # Translation files (he/en/es/ru)
  layouts/          # BaseLayout
  pages/            # [lang]/* routes
  styles/           # global.css
public/
  admin/            # Decap CMS admin panel
```

## Content Management

Navigate to `/admin` to access the CMS. Requires Netlify Identity authentication.

## Tools

1. **Business Technology Self-Audit** — `/[lang]/tools/business-audit`
2. **Website Leverage Audit** — `/[lang]/tools/website-audit`
3. **Automation Opportunity Finder** — `/[lang]/tools/automation-finder`
4. **AI Readiness Filter** — `/[lang]/tools/ai-readiness`
5. **Tool Stack Simplifier** — `/[lang]/tools/tool-stack`
6. **Lead Flow Mapper** — `/[lang]/tools/lead-flow`

## Deployment

Connected to GitHub. Netlify auto-deploys on push to `main`.
