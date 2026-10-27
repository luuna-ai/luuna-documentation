# Luuna components

Luuna is a family of related tools, not one executable. The Rust Luuna runtime coordinates development work and remains the authority for approvals and execution policy. Four independently maintained components add knowledge, tickets, prompt resources, and a desktop interface.

## Choose the component you need

| Component | Use it for | Main boundary |
| --- | --- | --- |
| [Atlas](/docs/guide-component-atlas) | Structured expertise and project memory | A local CLI and TypeScript library; Luuna only uses memory that a plan explicitly selects. |
| [Missions](/docs/guide-component-missions) | Git-native tickets, dependencies, and work plans | A local CLI and durable project records; it becomes the ticket authority only when explicitly enabled. |
| [Beacon](/docs/guide-component-beacon) | Versioned, composable prompts and agent instructions | A local CLI; the exact resource, version, and content hash can be bound into approval. |
| [Luuna AI](/docs/guide-component-ai) | A native desktop interface for the Pi coding agent | A user-facing Tauri application that speaks Pi's JSONL RPC protocol; it is not the Luuna runtime or the website assistant. |

## How the pieces fit

The core runtime owns repository registration, baseline checks, plans, approval, worktrees, validation, independent review, bounded repair, and publication. Missions, Atlas, and Beacon are separate command-line tools with their own repositories, data formats, and release histories. Luuna invokes them at explicit integration boundaries; installing or activating one does not transfer runtime policy to it. Luuna AI is another client surface: it launches Pi in RPC mode and renders the interaction in a Turbo Pascal-inspired desktop IDE.

The command-line components are consumed at reviewed Git submodule commits. Their similarly named npm packages are private and unpublished; use the repository's checked-out source rather than assuming an npm install will work. Each repo's README and component references are reproduced below with the source commit recorded on each page.

## Detailed guides and references

- [Atlas: knowledge and project memory](/docs/guide-component-atlas), plus its [configuration reference](/docs/components-atlas-config) and source [README](/docs/components-atlas-readme).
- [Missions: tickets and plans](/docs/guide-component-missions), plus its [specification](/docs/components-missions-spec) and source [README](/docs/components-missions-readme).
- [Beacon: versioned prompt resources](/docs/guide-component-beacon), plus its [CLI reference](/docs/components-beacon-docs-cli-reference) and source [README](/docs/components-beacon-readme).
- [Luuna AI: desktop client](/docs/guide-component-ai), plus its [source README](/docs/components-ai-readme).

## Compatibility and evidence

Component behavior can change independently. This site pins each reference page to the source commit recorded for that component; publishing these docs does not imply that each component was built, run, or provider-tested. The core Luuna organization main snapshot consumes Atlas `27477c313a3049b1579dfdc32c39da600726721f`, Missions `6a4a3c3fb80679a77bbf1d7d2da05033fc15460c`, and Beacon `4b01d37522ef448ada78be08cc7a24f7808dfbbb` as exact Git submodule commits. Luuna AI is maintained independently and is not a core runtime submodule. Review component changelogs and migration guides before changing a local setup; accepted Luuna architecture decisions remain authoritative for runtime behavior.
