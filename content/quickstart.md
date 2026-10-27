# Get Luuna running

This is a development-checkout setup. Access to the private Luuna repository is required. Public documentation does not grant repository access, and there is no verified public v1 installer to download.

## 1. Prepare your tools

| Tool | Documented baseline |
| --- | --- |
| Rust | 1.90.0, pinned by rust-toolchain.toml |
| Node.js | 24.19.0 or newer in the contributor guide |
| npm | 11.9.0 documented baseline |
| Bun | 1.4.3 for pinned component dependencies |
| Git | 2.40 or newer for repository inspection fixtures |
| Python | Python 3 for protocol fixtures and smoke tests |
| Pi | @earendil-works/pi-coding-agent 1.3.0, isolated private installation |
| Native desktop | Platform-specific Tauri 2 prerequisites |

Use the repository pins and lockfiles. The package.json Node engine range is broader than the contributor guide; use the documented pinned version for reproducible checks. Install ripgrep and fd/fdfind if you want Pi's corresponding search tools available in offline mode.

## 2. Clone and install

```sh
git clone --recurse-submodules https://github.com/luuna-ai/luuna.git
cd luuna
npm ci --ignore-scripts
npm run components:setup
npm run components:verify
```

Component setup uses frozen dependencies and exact Git pins. Do not run component lifecycle hook installers against the parent Luuna repository.

## 3. Configure the private runtime

Set LUUNA_API_TOKEN to a cryptographically random value of at least 32 visible ASCII characters, without spaces or line breaks. Store it in a private environment or the supported Windows credential setup. Keep it out of Git, terminal screenshots, and shared command histories.

Set LUUNA_DATA_DIR to a private local directory, LUUNA_PI_COMMAND to your pinned Pi executable, and LUUNA_PI_PROVIDER / LUUNA_PI_MODEL to the provider and model you want. Supply that provider's credential privately. The isolated Pi session does not inherit your ordinary Pi login or configuration.

The [configuration reference](/docs/reference-configuration) and [contributor guide](/docs/contributing) describe launcher arguments, Windows shim behavior, proxies, key aliases, and defaults.

## 4. Start the service and client

```sh
cargo run --locked -p luuna-runtime
```

In a second terminal:

```sh
npm run dev
```

Open the browser client at http://127.0.0.1:1420 and connect it to http://127.0.0.1:4242 using the same private token. For the native development shell, run `npm run desktop` after installing the platform prerequisites.

The Windows development launcher has a separate authenticated bootstrap path and encrypted credentials; see [ADR 0011](/docs/docs-decisions-0011-windows-native-bootstrap). Closing a client leaves the runtime running. Cancel work explicitly or use the authenticated shutdown operation.

## 5. Verify the foundation

```sh
cargo fmt --all -- --check
cargo test --workspace --locked
cargo clippy --workspace --all-targets --locked -- -D warnings
npm test
npm run typecheck
npm run build
```

A passing frontend build proves neither a native installation nor a successful model run. Run the applicable fixture, genuine-provider, and native-host checks separately. Start the first feature with the [MVP walkthrough](/docs/docs-mvp-walkthrough).

## Prefer the terminal?

```sh
npm run tui
npm run tui -- help
npm run tui -- projects --json
npm run tui -- follow <run>
```

The terminal client uses LUUNA_URL and LUUNA_API_TOKEN, prompts for an unset token without echo on an interactive terminal, and requires the complete plan hash for approval. See [terminal client](/docs/packages-tui-readme).
