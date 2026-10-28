export type Branch = { name: string; isDetached: boolean } | null

declare module 'claude-code' {
  interface PluginState {
    'git-branch': { branch: Branch }
  }
}
