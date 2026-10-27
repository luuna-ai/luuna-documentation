# Luuna documentation operations

## Site and source

The public Sites deployment is bound in `.openai/hosting.json`. Preserve that project identity when editing. The core Luuna documentation is a pinned public-safe snapshot. The four supporting component references are imported from their independent Git repositories and pinned to the commit recorded in `data/meta.json`. Private runtime state and the private Luuna checkout are never packaged.

To refresh component references, clone the current repositories outside this site checkout, then pass each path to the importer:

```sh
gh repo clone luuna-ai/luuna-atlas ../.source-luuna-atlas
gh repo clone luuna-ai/luuna-missions ../.source-luuna-missions
gh repo clone luuna-ai/luuna-beacon ../.source-luuna-beacon
gh repo clone luuna-ai/luuna-ai ../.source-luuna-ai
node scripts/import-docs.mjs --atlas ../.source-luuna-atlas --missions ../.source-luuna-missions --beacon ../.source-luuna-beacon --ai ../.source-luuna-ai
```

Review the source commits and imported pages before publishing. Public tracked component Markdown and the component licenses are included as source reference; this is a pinned snapshot, not an automatic sync job.

## Enable Talk to AI safely

1. Create a dedicated OpenRouter API key with a small enforced credit limit (for example $1 initially). Keep your general-purpose key separate. Do not paste the key into a chat, a command argument, browser code, or Git.
2. In Cloudflare Turnstile, create a managed widget for the exact deployed docs hostname. This can protect a site hosted outside Cloudflare. Save the site key and secret key in your own settings.
3. In the hosting platform's **server-side runtime environment variables**, set `OPENROUTER_API_KEY`, `TURNSTILE_SECRET_KEY`, `TURNSTILE_SITE_KEY`, and `DOCS_AI_ENABLED=true`. The first two are secrets. The site key is public. Redeploy/restart if the host requires it.
4. Open `/api/assistant`: it must return only `enabled: true` and the public site key. Complete a normal browser challenge, ask a Luuna question, and verify an `AI-SELECTED SOURCES` response. Do not count a `DOCUMENTATION SEARCH` fallback as a successful model call.

For local development, copy the variable names into a private ignored `.dev.vars` file as supported by Wrangler; never put values in `.env.example`. Use Cloudflare's official test widget keys only in local development, never in production. The server checks the challenge hostname and `docs` action. Production remains search-only until all settings exist.

Default model: `qwen/qwen3-coder-next`. The public OpenRouter page checked October 22, 2026 lists $0.12 / million input tokens and $0.80 / million output tokens. Prices and eligible privacy-compatible providers can change. Requests set provider price ceilings of $0.20 input / $1.00 output per million, `data_collection: deny`, a fixed model, 160 maximum output tokens, and no expensive model fallback. At 3,000 input and 160 output tokens the listed base-rate arithmetic is approximately $0.000488 per request, before account fees. It is an estimate, not measured usage.

The server uses deterministic retrieval and validates model-selected passage IDs. Only verbatim stored public documentation and server-generated links reach the answer. It has no runtime, filesystem, GitHub, browser, or command tools. Per-instance limits (6/minute, 30/hour) are not a distributed global budget. Turnstile and the dedicated key's credit cap are required. Search remains available without a paid API.

## Free hosting alternative: Cloudflare Workers

The Sites deployment provides the live review/share URL. No separate hosting account was created for it. For hosting in your own account, this project also exports a static version with the same navigation/search UI and a small Worker for `/api/assistant`:

```sh
npm ci
npm run build
npm run export:cloudflare
npx wrangler login
npx wrangler deploy --config cloudflare/wrangler.jsonc
npx wrangler secret put OPENROUTER_API_KEY --config cloudflare/wrangler.jsonc
npx wrangler secret put TURNSTILE_SECRET_KEY --config cloudflare/wrangler.jsonc
```

Wrangler prompts for each secret without placing it in command arguments. Set `TURNSTILE_SITE_KEY` and `DOCS_AI_ENABLED=true` in the Cloudflare dashboard's runtime variables (or in the nonsecret vars section of the deployment config). Use the assigned workers.dev domain if you do not want to buy a domain. Keep the account on Workers Free and confirm your account limits.

Cloudflare documents free/unlimited static-asset requests and a Workers Free allowance of 100,000 dynamic requests/day shared across the account, with 10 ms CPU/request. The optional assistant and any SSR route consume dynamic requests. The static export avoids SSR for documentation. OpenRouter model usage is separate and is not free hosting. No paid plan or custom domain is required for the intended small documentation deployment.

Sources: [Cloudflare asset billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [Qwen3 Coder Next](https://openrouter.ai/qwen/qwen3-coder-next), [Turnstile verification](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

## Verify a change

```sh
npm run check:docs
npm test
npm run typecheck
npm run build
```

Review desktop/mobile and both themes; test search, internal article navigation, code copy, keyboard dialogs, 404, and the assistant fallback. Actual OpenRouter/Turnstile acceptance requires owner-supplied settings and a live browser test. Historical Luuna product test counts are preserved source evidence, not tests performed by this website project.
