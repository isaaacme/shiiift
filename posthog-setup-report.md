<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into your Astro (hybrid) project. Here's what was done:

**Client-side initialisation** — A new `src/components/posthog.astro` snippet component was created and wired into `src/layouts/BaseLayout.astro`, so PostHog loads on every page of the site. Configuration is read from `PUBLIC_POSTHOG_PROJECT_TOKEN` and `PUBLIC_POSTHOG_HOST` environment variables set in `.env`.

**Server-side client** — A singleton `src/lib/posthog-server.ts` was created using `posthog-node`. The two SSR API routes (`subscribe.ts` and `generate-insight.ts`) import this client and fire server-side events after successful operations.

**User identification** — `posthog.identify()` is called client-side when a visitor submits the contact/start form and when they sign up for the newsletter via a tool result. Server-side, the subscribe API also calls `posthog.identify()` so the server and client sessions stay correlated.

**New events added** (pre-existing `tool_started`, `tool_completed`, `newsletter_submitted`, etc. were already in place and left untouched):

| Event | Description | File |
|---|---|---|
| `contact_form_submitted` | Fired client-side when visitor submits the /start contact form | `src/pages/[lang]/start.astro` |
| `newsletter_subscribed` | Fired server-side when MailerLite subscription succeeds | `src/pages/api/subscribe.ts` |
| `ai_insight_generated` | Fired server-side when Gemini generates an AI insight | `src/pages/api/generate-insight.ts` |

**Pre-existing events now flowing to PostHog** (already coded, now initialised):

| Event | Description | File |
|---|---|---|
| `tool_started` | First question answered in any diagnostic tool | All tool components |
| `tool_completed` | User finishes all questions and sees results | All tool components |
| `newsletter_submitted` | Newsletter widget signup in tool result | `src/components/tools/ToolResult.tsx` |
| `roadmap_requested` | User clicks the personalised roadmap CTA | `src/components/tools/ToolResult.tsx` |
| `related_tool_clicked` | User clicks a related tool recommendation | `src/components/tools/ToolResult.tsx` |
| `related_article_clicked` | User clicks a related reading article | `src/components/tools/ToolResult.tsx` |
| `summary_downloaded` | User downloads the tool summary .txt file | `src/components/tools/ToolResult.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://eu.posthog.com/project/195602/dashboard/730272)
- [Tool conversion funnel: Started → Completed](https://eu.posthog.com/project/195602/insights/HoxoqFCk)
- [Tool engagement: Started vs Completed (unique users/day)](https://eu.posthog.com/project/195602/insights/4bXffJJP)
- [Tool completions by tool](https://eu.posthog.com/project/195602/insights/l5NoHjmA)
- [Newsletter subscriptions over time](https://eu.posthog.com/project/195602/insights/q7bei3bL)
- [Contact form submissions over time](https://eu.posthog.com/project/195602/insights/AdvFmaL0)

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-astro-hybrid/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
