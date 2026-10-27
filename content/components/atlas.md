# Atlas: structured knowledge and project memory

Atlas is Luuna's maintained, MIT-licensed fork of Mulch. It stores and retrieves structured expertise and project memory for coding agents. The standalone package identity is `@luuna/atlas-cli`; the primary command is `luuna-atlas`, with `la` as its short alias. Compatibility aliases `ml` and `mulch` remain available for inherited integrations.

## What Atlas does

Atlas organizes records by domain, type, lifecycle, and provenance. Its `prime`, search, record-management, validation, and maintenance commands help an agent receive relevant project knowledge without injecting an unbounded memory dump. The full source README, configuration guide, changelog, and inherited upstream reference are included in the Atlas reference pages.

Luuna connects to Atlas through its CLI/JSON boundary; Atlas also exports a TypeScript library. The runtime remains responsible for authorization and plan approval. Knowledge can only influence an approved plan when it is explicitly selected. Atlas does not grant an agent execution permissions.

## Local data and compatibility

Atlas preserves the upstream `.mulch/` directory, record types, configuration, markers, and environment variables. Renaming the product does not migrate or rewrite existing data. Do not replace this fork with a registry package that happens to use a similar name. The package is private and unpublished; update it through a reviewed repository commit.

## Run from source

Use Bun 1.4.3 for the repository's documented workflow:

```sh
bun install --frozen-lockfile --ignore-scripts
bun src/cli.ts --help
bun run verify
```

Start with the [Atlas README](/docs/components-atlas-readme), then consult the [configuration guide](/docs/components-atlas-config), [migration notes](/docs/components-atlas-migration), and the original [Mulch README](/docs/components-atlas-docs-upstream-readme) for inherited command examples. Some inherited help text and generated integration snippets retain the `ml` or `mulch` names; the aliases preserve compatibility.

## Maintenance and provenance

Atlas is a pinned Luuna submodule sourced from the public [`luuna-ai/luuna-atlas`](https://github.com/luuna-ai/luuna-atlas) repository. In the core Luuna source snapshot documented here, the integration pin is [`76ad209`](https://github.com/luuna-ai/luuna-atlas/tree/76ad209daf404dd9a12aeaf46293e05e9f41e517); the reference pages below follow a newer component-repository head. Check the pin before relying on newer behavior in core Luuna. Verify the component's `UPSTREAM.md` and changelog before adopting inherited behavior. The upstream operational runbook is historical reference material; it does not authorize npm publication or override Luuna's release controls.
