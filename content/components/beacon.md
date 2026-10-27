# Beacon: versioned prompts and agent instructions

Beacon is Luuna's maintained, MIT-licensed fork of Canopy. It composes and versions prompt resources and agent instructions. Its package identity is `@luuna/beacon-cli`; run `luuna-beacon` or the short alias `lb`. The legacy `cn` alias remains available for existing integrations.

## Resources and composition

Beacon keeps its project data in `.canopy/`. Its resource model supports versioned prompts, schemas, sections, inheritance, mixins, validation, history, and rendered output. Consult the [Beacon CLI reference](/docs/components-beacon-docs-cli-reference) for each command and the current [Canopy-derived specification](/docs/components-beacon-spec) for storage, composition, identifiers, lifecycle, and rendering semantics.

Luuna integrates Beacon through its CLI/JSON boundary. An approved plan can bind the exact selected content, version, and hash so a changed resource invalidates approval. Beacon itself does not grant execution authority or replace the runtime's approval checks.

## Run from source

The repository documents Bun 1.4.3:

```sh
bun install --frozen-lockfile --ignore-scripts
bun src/index.ts --help
bun run verify
```

Start with the [Beacon README](/docs/components-beacon-readme). The CLI reference includes `init`, `create`, `list`, `show`, `render`, `diff`, `history`, `pin`, `sync`, `validate`, and related commands. Review the component [migration guide](/docs/components-beacon-migration) before bringing existing Canopy data into a project; Beacon preserves `.canopy/` formats rather than renaming or rewriting them.

## Maintenance and provenance

Beacon is consumed from a reviewed, pinned Git submodule commit in [`luuna-ai/luuna-beacon`](https://github.com/luuna-ai/luuna-beacon). In the core Luuna source snapshot documented here, the integration pin is [`072e482`](https://github.com/luuna-ai/luuna-beacon/tree/072e482169e0d469c3744ec712222f8b310fa7da); the reference pages below follow a newer component-repository head. Check the pin before relying on newer behavior in core Luuna. The npm package is private and unpublished. Its public repo contains the current README, CLI reference, changelog, security policy, and attributed upstream material. Use the Luuna fork and its recorded commit; do not assume a similarly named package or Canopy release is interchangeable.
