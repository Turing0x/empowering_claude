# Git Branch

The current git branch, always visible at the bottom right of the Claude Code prompt footer: `⎇ main`.

- Detached HEAD shows the short hash in parentheses: `⎇ (a1b2c3d)`.
- Outside a git repo, nothing is shown.
- Updates right after any Bash call (a `git checkout` from Claude) and every 3 seconds (a checkout from another terminal).
- Long names are clipped to 40 characters.
- Plays well with other footer mods: whatever was already there stays, after a `·`.

## Install

```text
/plugin marketplace add Turing0x/empowering_claude
/plugin install git-branch@empowering-claude
```
