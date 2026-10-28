# Empowering Claude

Hand-made plugins and tools that make [Claude Code](https://code.claude.com/docs/en/overview) better, by [Turing0x](https://github.com/Turing0x).

**Website:** [empoweringclaude.threedotsdev.com](https://empoweringclaude.threedotsdev.com)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

This repository has two jobs:

1. **It is a Claude Code plugin marketplace.** [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) lists every plugin in [`plugins/`](plugins), so anyone can install them with two `/plugin` commands.
2. **It is the source of the website** that showcases those plugins, plus other tools that improve Claude Code but are not marketplace plugins (like Relevo). The site is built with Astro and Tailwind CSS and served from Cloudflare.

## What's inside

| Name | Kind | What it does | Source |
| --- | --- | --- | --- |
| **Git Branch** | Plugin | The current git branch, always visible at the bottom right of the prompt footer: `⎇ main`. | [`plugins/git-branch/`](plugins/git-branch/README.md) |
| **Relevo** | Toolkit | Multi-model orchestrator: the main session routes each task to haiku, sonnet or opus subagents, with hooks that enforce the safety-critical rules. | [Turing0x/relevo](https://github.com/Turing0x/relevo) |

### Git Branch

Shows the branch the session is working on, so you never lose track of where Claude is making changes.

- Always visible at the bottom right of the prompt footer, in green: `⎇ main`.
- Detached HEAD shows the short hash in parentheses: `⎇ (a1b2c3d)`.
- Outside a git repo, nothing is shown.
- Refreshes right after every Bash call (a `git checkout` run by Claude) and every 3 seconds (a checkout from another terminal).
- Branch names longer than 40 characters are clipped with `…`.
- The branch goes first; whatever was already in that spot (mode labels, other mods) stays after a `·`.

Details: [`plugins/git-branch/README.md`](plugins/git-branch/README.md).

### Relevo

A policy written in natural language, six subagents, three hooks, a permissions template and two slash commands. The main Claude Code session acts as a **router**: for each request it decides whether to do the work itself or hand it to a worker on a cheaper or stronger model.

| Worker | Model | Role |
| --- | --- | --- |
| `clasificador` | haiku | Classifies a request into type, risk and route |
| `Explore` | haiku | Wide read-only search |
| `rapido` | haiku | Simple mechanical tasks |
| `implementador` | sonnet | Bounded implementation (1-5 files) |
| `arquitecto` | opus | Architecture and hard bugs; produces a plan |
| `verificador` | opus | Independent review with a clean context |

What it gives you: context isolation for noisy reads, independent review, real parallelism on disjoint files, and safety rules (no force push, ask before touching secrets, no sub-subagents) enforced by Claude Code permissions and hooks rather than by the prompt alone.

Relevo is **alpha (`0.1.0`)** and installs at user level (`~/.claude`), so it affects every project. Read its [README](https://github.com/Turing0x/relevo#readme) before installing, especially the limitations section.

## Install

### Plugins (from this marketplace)

In Claude Code:

```text
/plugin marketplace add Turing0x/empowering_claude
/plugin install git-branch@empowering-claude
```

Optional, to get new versions on their own: `/plugin` → **Marketplaces** → **empowering-claude** → **Enable auto-update**. Claude Code leaves auto-update off for marketplaces outside Anthropic's.

To remove a plugin: `/plugin uninstall git-branch@empowering-claude`.

### Relevo

Relevo is not a marketplace plugin; it has its own installer. It requires Claude Code with access to haiku, sonnet and opus (Pro or Max), `python3` 3.9 or newer, `git`, and macOS or Linux.

```sh
git clone https://github.com/Turing0x/relevo.git
cd relevo
./scripts/install.sh --dry-run   # shows what would change, writes nothing
./scripts/install.sh
```

Then restart Claude Code: `/agents` should list the 6 workers. Optionally run `/orchestrator-init` inside each project, and `/orch-stats` after some use to see per-agent telemetry. Uninstall with `./scripts/uninstall.sh`.

## Repository layout

```text
/
├── .claude-plugin/
│   └── marketplace.json      # Marketplace manifest: name "empowering-claude", one entry per plugin
├── plugins/
│   └── git-branch/           # One folder per plugin
│       ├── .claude-plugin/plugin.json
│       ├── hooks/            # hooks.json + register.tsx (the mod itself)
│       ├── types/            # Plugin state types
│       └── README.md
├── public/                   # Static files: favicon, og-image.png
├── src/
│   ├── data/plugins.ts       # Everything the site shows: one object per plugin or tool
│   ├── components/           # Hero, PluginCard, TerminalMock, CopyCommand, InstallSteps, Footer
│   ├── layouts/Layout.astro  # <head>: meta, canonical, Open Graph, fonts
│   ├── pages/index.astro     # The single page
│   └── styles/global.css     # Tailwind v4 theme tokens (dark and light)
├── astro.config.mjs          # site URL + Tailwind Vite plugin
├── wrangler.jsonc            # Cloudflare Worker serving ./dist as static assets
└── LICENSE
```

## Adding something new

### A new plugin

1. Create `plugins/<name>/` with at least `.claude-plugin/plugin.json` (`name`, `version`, `description`, `author`, `license`) and the plugin's code (hooks, commands, skills, agents...). Add a `README.md`.
2. Add an entry to `plugins` in [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json):
   ```json
   {
     "name": "<name>",
     "source": "./plugins/<name>",
     "description": "One line.",
     "version": "0.1.0",
     "category": "productivity"
   }
   ```
3. Add one object to the `items` array in [`src/data/plugins.ts`](src/data/plugins.ts) with `kind: 'plugin'`, `install: { type: 'marketplace', cmd: ... }`, its tagline, features, install command (`/plugin install <name>@empowering-claude`), source URL and terminal mock (conversation lines and footer frames). The page iterates that array; no component changes are needed.
4. Add a row to the table in this README.

When releasing a new version, bump `version` in both `plugin.json` and `marketplace.json`, otherwise Claude Code does not offer the update.

### A tool that is not a plugin

Add one object to the `items` array in [`src/data/plugins.ts`](src/data/plugins.ts) with `kind: 'toolkit'` and `install: { type: 'script', steps, requirements, after }`. It is shown on the site next to the plugins, with its own install steps; nothing goes in `marketplace.json`.

## Development

Requirements: Node.js 22.23.4 or newer and [pnpm](https://pnpm.io).

```sh
pnpm install
pnpm astro dev --background   # dev server at http://localhost:4321
pnpm astro dev status         # is it running?
pnpm astro dev logs           # its output
pnpm astro dev stop
```

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server in the foreground at `localhost:4321` |
| `pnpm build` | Builds the static site into `./dist/` |
| `pnpm preview` | Serves the build locally |
| `pnpm astro ...` | Any Astro CLI command |

To try a plugin from your working copy before publishing it, start Claude Code with `claude --plugin-dir ./plugins/<name>`, or add the local checkout as a marketplace: `/plugin marketplace add ./path/to/empowering_claude`.

## Deployment

The site is a static build served by a Cloudflare Worker with static assets ([`wrangler.jsonc`](wrangler.jsonc)), on the custom domain `empoweringclaude.threedotsdev.com`.

```sh
pnpm build
pnpm exec wrangler deploy
```

`wrangler deploy` uploads `./dist` and keeps the custom domain route. You need to be logged in to the Cloudflare account that owns the `threedotsdev.com` zone (`pnpm exec wrangler login`).

The marketplace needs no deployment: Claude Code reads it straight from this GitHub repository, so pushing to `main` publishes plugin changes.

## License

[MIT](LICENSE) © 2026 Turing0x

Not affiliated with or endorsed by Anthropic. "Claude" and "Claude Code" are Anthropic's names; these are independent projects.
