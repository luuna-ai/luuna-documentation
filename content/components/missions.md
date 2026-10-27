# Missions: git-native tickets and work plans

Missions is Luuna's maintained, MIT-licensed fork of Seeds. It provides local, Git-native tickets, dependencies, structured plans, and reusable work templates. Its package identity is `@luuna/missions-cli`; run it as `luuna-missions` or the short alias `lm`. The legacy `sd` and `seeds` aliases remain for existing integrations.

## Records and workflow

Missions stores project work in `.seeds/` and preserves the upstream configuration, JSONL records, markers, and environment variables. Issues carry intent and acceptance criteria; dependencies describe ordering; reusable templates can create structured plans and coordinated work. Review the current [Missions specification](/docs/components-missions-spec) for the data model, CLI, JSON output, concurrency behavior, and migration details.

The core runtime may call Missions through the CLI/JSON boundary. It becomes the ticket authority only after explicit activation. Merely installing it does not change how Luuna records work. Runtime approval, candidate identity, validation, and publication policy remain in Luuna.

## Run from source

Use the repository's documented Bun 1.4.3 toolchain:

```sh
bun install --frozen-lockfile --ignore-scripts
bun src/index.ts --help
bun run verify
```

Start with the [Missions README](/docs/components-missions-readme), then use the [specification](/docs/components-missions-spec) for the command and record details. Review the [migration guide](/docs/components-missions-migration) before moving existing Seeds data. The fork keeps `.seeds/` data compatible and does not silently rewrite it.

## Maintenance and provenance

Missions is consumed by Luuna at a reviewed Git submodule commit from [`luuna-ai/luuna-missions`](https://github.com/luuna-ai/luuna-missions). In the core Luuna source snapshot documented here, the integration pin is [`e1b5db1`](https://github.com/luuna-ai/luuna-missions/tree/e1b5db171892de653e7462e630d64d4964d01422); the reference pages below follow a newer component-repository head. Check the pin before relying on newer behavior in core Luuna. Its npm package remains private and unpublished. The original Seeds documentation is retained as attributed historical reference. Follow the component's current changelog and migration notes when upgrading; do not assume a floating branch or registry version is the version used by Luuna.
