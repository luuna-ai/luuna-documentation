# Luuna documentation

A public, source-grounded documentation site for the Luuna development workbench and its four related components: Atlas, Missions, Beacon, and Luuna AI.

- **Live site:** https://luuna-documentation.alight-bead-6697.chatgpt.site/
- **Core source:** [luuna-ai/luuna](https://github.com/luuna-ai/luuna)
- **Documentation source:** [luuna-ai/luuna-documentation](https://github.com/luuna-ai/luuna-documentation)
- **Component sources:** [Atlas](https://github.com/luuna-ai/luuna-atlas), [Missions](https://github.com/luuna-ai/luuna-missions), [Beacon](https://github.com/luuna-ai/luuna-beacon), and [Luuna AI](https://github.com/luuna-ai/luuna-ai)

The site contains the core Luuna guide, source references, capability/API/schema pages, and current component references. `data/meta.json` records source commits. Component docs follow each component repository head and can be newer than the revisions pinned into the core Luuna checkout. Check the documented core submodule pins before assuming a component feature is integrated in that Luuna revision.

## Develop and verify

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run check:docs
npm run build
```

The assistant retrieves from the checked-in public documentation corpus. Without configured secrets, **Talk to AI** provides local documentation search. To enable the optional low-cost, docs-only model and Turnstile protection, follow [SETUP.md](SETUP.md). Never commit provider secrets.

## Refresh component references

Clone the four public component repositories beside this checkout, then run:

```sh
node scripts/import-docs.mjs --atlas ../.source-luuna-atlas --missions ../.source-luuna-missions --beacon ../.source-luuna-beacon --ai ../.source-luuna-ai
```

The importer refreshes public Markdown reference pages, component guides, search index, assistant passages, `llms.txt`, and `llms-full.txt`. Review the imported changes and source commit pins before publishing. It includes the component repositories' published Markdown and licenses.

A free-tier Cloudflare Workers deployment path is documented in [SETUP.md](SETUP.md). The current Sites URL is the live published deployment.
