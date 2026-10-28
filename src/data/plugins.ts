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

export interface Plugin {
	slug: string;
	name: string;
	tagline: string;
	description: string;
	version: string;
	category: string;
	features: string[];
	installCmd: string;
	sourceUrl: string;
	mock: TerminalMock;
}

export const plugins: Plugin[] = [
	{
		slug: 'git-branch',
		name: 'Git Branch',
		tagline: 'The current branch, always in sight.',
		description:
			'Shows the current git branch at the bottom right of the Claude Code prompt footer, so you never lose track of where Claude is working.',
		version: '0.1.0',
		category: 'productivity',
		features: [
			'Always visible at the bottom right of the prompt footer: ⎇ main',
			'Detached HEAD shows the short hash in parentheses: ⎇ (a1b2c3d)',
			'Outside a git repo, nothing is shown',
			'Refreshes after every Bash call and every 3 seconds, so a checkout from another terminal shows up too',
			'Branch names longer than 40 characters are clipped with …',
			'The branch goes first; whatever was already there (mode labels, other mods) stays after a " · "',
		],
		installCmd: '/plugin install git-branch@empowering-claude',
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
];
