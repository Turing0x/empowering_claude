export const REPO_URL = 'https://github.com/Turing0x/empowering_claude';
export const AUTHOR = { name: 'Turing0x', url: 'https://github.com/Turing0x' };
export const MARKETPLACE_NAME = 'empowering-claude';
export const MARKETPLACE_CMD = '/plugin marketplace add Turing0x/empowering_claude';
export const AUTOUPDATE_PATH = '/plugin → Marketplaces → empowering-claude → Enable auto-update';

export type Tone = 'success' | 'accent' | 'muted' | 'default';

export interface Segment {
	text: string;
	tone: Tone;
}

export interface Frame {
	/** Pieces of text shown on the right side of the prompt footer, each with its own color tone. */
	segments: Segment[];
}

export interface TerminalMock {
	/** Window title shown in the fake terminal chrome. */
	title: string;
	/** Short conversation lines shown above the prompt. */
	lines: { role: 'user' | 'claude'; text: string }[];
	/** Placeholder text inside the prompt box. */
	prompt: string;
	/** Left side of the prompt footer. */
	hint: string;
	/** Footer states; the mock cycles through them (the first one is the static state). */
	frames: Frame[];
	/** Accessible description of what the mock shows. */
	ariaLabel: string;
}

export type InstallMethod =
	/** Installed from the Empowering Claude marketplace with a /plugin command. */
	| { type: 'marketplace'; cmd: string }
	/** Installed with a sequence of shell commands (for example git clone + an installer script). */
	| {
			type: 'script';
			steps: { cmd: string; note?: string }[];
			/** Follow-up notes shown after the steps. Text between `backticks` is rendered as code. */
			after?: string[];
			requirements?: string[];
	  };

export interface Item {
	slug: string;
	name: string;
	/** 'plugin' lives in this marketplace; 'toolkit' is a standalone tool with its own installer. */
	kind: 'plugin' | 'toolkit';
	tagline: string;
	description: string;
	version: string;
	/** Maturity label, for example 'alpha'. Omit for stable items. */
	status?: string;
	license?: string;
	category: string;
	features: string[];
	/** Honest caveat shown in a callout on the card. */
	notice?: string;
	install: InstallMethod;
	sourceUrl: string;
	docsUrl?: string;
	mock: TerminalMock;
	/** Small muted text under the mock, for example to flag it as illustrative. */
	mockCaption?: string;
}

export const items: Item[] = [
	{
		slug: 'git-branch',
		name: 'Git Branch',
		tagline: 'The current branch, always in sight.',
		description:
			'Shows the current git branch at the bottom right of the Claude Code prompt footer, so you never lose track of where Claude is working.',
		kind: 'plugin',
		version: '0.1.0',
		license: 'MIT',
		category: 'productivity',
		features: [
			'Always visible at the bottom right of the prompt footer: ⎇ main',
			'Detached HEAD shows the short hash in parentheses: ⎇ (a1b2c3d)',
			'Outside a git repo, nothing is shown',
			'Refreshes after every Bash call and every 3 seconds, so a checkout from another terminal shows up too',
			'Branch names longer than 40 characters are clipped with …',
			'The branch goes first; whatever was already there (mode labels, other mods) stays after a " · "',
		],
		install: { type: 'marketplace', cmd: '/plugin install git-branch@empowering-claude' },
		sourceUrl: `${REPO_URL}/tree/main/plugins/git-branch`,
		mock: {
			title: 'claude — ~/projects/my-app',
			lines: [
				{ role: 'user', text: 'Switch to the login work and run the tests' },
				{ role: 'claude', text: 'Running git checkout feature/login, then the test suite…' },
			],
			prompt: 'Try "fix the failing test"',
			hint: '? for shortcuts',
			frames: [
				{ segments: [{ text: '⎇ main', tone: 'success' }] },
				{ segments: [{ text: '⎇ feature/login', tone: 'success' }] },
				{ segments: [{ text: '⎇ (a1b2c3d)', tone: 'success' }] },
			],
			ariaLabel:
				'Terminal mock of the Git Branch plugin: the prompt footer shows ⎇ main in green at the bottom right, then switches to feature/login and to a detached HEAD hash.',
		},
	},
	{
		slug: 'relevo',
		name: 'Relevo',
		kind: 'toolkit',
		tagline: 'One session routes, cheaper or stronger models do the work.',
		description:
			'A multi-model orchestrator for Claude Code: a policy in natural language plus 6 subagents on haiku, sonnet and opus, 3 hooks and 2 slash commands. The main session acts as a router and hands each task to the right worker.',
		version: '0.1.0',
		status: 'alpha',
		license: 'MIT',
		category: 'orchestration',
		features: [
			'Policy in natural language + 6 subagents: clasificador, Explore and rapido (haiku), implementador (sonnet), arquitecto and verificador (opus)',
			'Context isolation: noisy reads happen inside a worker and only a short report goes back to the router',
			'Independent review: the verificador starts with a clean context and never sees the implementer\'s reasoning',
			'Real parallelism when the pieces of a plan touch disjoint files',
			'Safety rules (no force push, ask before touching secrets, no sub-subagents) enforced by permissions and hooks, not just the prompt',
			'3 hooks (block-force-push, guard-secrets, orch-telemetry) and 2 slash commands (/orchestrator-init, /orch-stats)',
			'Budget per task: at most 1 arquitecto call and 2 implement→verify cycles',
		],
		notice:
			'Alpha. The routing rules are natural-language policy the model interprets; only the permissions and hooks are enforced. It installs at user level (~/.claude) and affects all your projects. Not affiliated with Anthropic.',
		install: {
			type: 'script',
			requirements: [
				'Claude Code',
				'Claude Pro or Max (haiku, sonnet and opus access)',
				'python3 3.9 or newer',
				'git',
				'macOS or Linux',
			],
			steps: [
				{ cmd: 'git clone https://github.com/Turing0x/relevo.git' },
				{ cmd: 'cd relevo' },
				{ cmd: './scripts/install.sh --dry-run', note: 'Preview the changes first; nothing is written.' },
				{ cmd: './scripts/install.sh', note: 'Installs under ~/.claude.' },
			],
			after: [
				'Restart Claude Code and open a new session. `/agents` lists the 6 workers.',
				'Optional: run `/orchestrator-init` inside each project, and `/orch-stats` to see telemetry.',
				'Uninstall with `./scripts/uninstall.sh`.',
			],
		},
		sourceUrl: 'https://github.com/Turing0x/relevo',
		docsUrl: 'https://github.com/Turing0x/relevo#readme',
		mockCaption: 'Illustrative example of a routed task',
		mock: {
			title: 'claude — ~/projects/signup-api',
			lines: [
				{ role: 'user', text: 'Add email validation to the signup endpoint' },
				{ role: 'claude', text: 'Routes it to implementador (sonnet) with a self-contained brief…' },
				{ role: 'claude', text: 'verificador (opus) reviews with a clean context and approves.' },
			],
			prompt: 'Ask Claude anything',
			hint: '? for shortcuts',
			// Relevo adds nothing to the footer, so the mock shows a single empty frame.
			frames: [{ segments: [] }],
			ariaLabel:
				'Illustrative terminal mock of Relevo: a request to add email validation is routed to the implementador worker on sonnet, then the verificador on opus reviews it with a clean context and approves.',
		},
	},
];
