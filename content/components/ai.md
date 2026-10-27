# Luuna AI: native Pi desktop client

Luuna AI is a native desktop frontend for the Pi coding agent. It uses Tauri v2 and a Turbo Pascal 7 / Borland DOS-inspired interface, then launches `pi --mode rpc` and communicates over Pi's JSONL protocol. It is a client for Pi, not the Luuna Rust runtime, not Atlas/Missions/Beacon, and not the documentation website's Talk to AI feature.

## Interface and workflows

The desktop app provides project-tree and file previews, session browsing and resume, menus and keyboard shortcuts, model and reasoning-effort selection, PLAN/BUILD modes, diffs, tests, builds, and built-in slash commands. The README documents the current menu and shortcut behavior, platform installers, source builds, and known beta status. Controls include F3 for opening sessions, F4 for model selection, F5 for reasoning effort, F6 for PLAN/BUILD mode, F7 for diffs, F8 for tests, F9 for builds, and F10 for the menu.

The app saves provider credentials locally using its documented settings flow. Treat those values as sensitive. The repository's own `.env` and local Pi configuration are private user state and should never be copied into this public documentation site.

## Build and run

See the [LUUNA-AI README](/docs/components-ai-readme) for the exact requirements, available prebuilt installers, and platform-specific build instructions. The source repository provides these checks:

```sh
npm run check
npm test
```

The application requires the Pi coding agent to be available as a child process. Its development workflow uses `npm run dev`; native release builds use `npm run build`. Actual platform packaging and provider behavior must be verified on the target machine; a source build alone does not prove a distributed installer works.

## Source, license, and status

Luuna AI is maintained in the public [`luuna-ai/luuna-ai`](https://github.com/luuna-ai/luuna-ai) repository under MIT. Its README identifies it as an early beta and describes the Turbo Pascal homage; it is not affiliated with Borland. Follow the repository's release notes for current platform support and installable artifacts.
