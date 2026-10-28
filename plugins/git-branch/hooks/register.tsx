import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, RenderNode, Timer } from 'claude-code'

import type { Branch } from '../types'

const SYNC_MS = 3000
const MAX_CHARS = 40
const SEPARATOR = ' · '

const branch = atom({ plugin: 'git-branch', key: 'branch' } as const, null as Branch)

let lastBranch: Branch = null
let isReading = false
let timer: Timer | undefined

/** Whether a drawing beneath shows nothing: no text, no control. */
function isBlank (node: RenderNode | undefined): boolean {
  if (node === undefined || node === null) return true
  if (typeof node === 'string') return node.trim() === ''
  return (node.type === 'Box' || node.type === 'Text') && (node.children ?? []).every(isBlank)
}

function clip (name: string): string {
  return name.length > MAX_CHARS ? name.slice(0, MAX_CHARS - 1) + '…' : name
}

/** Reads the branch of the session's directory: its name, a short hash when detached, null outside a repo. */
async function readBranch ($: EngineInterface): Promise<Branch> {
  const current = await $.process.run(['git', 'branch', '--show-current'], { timeoutMs: 2000 })
  if (current.exitCode !== 0) return null
  const name = current.stdout.trim()
  if (name !== '') return { name, isDetached: false }
  const head = await $.process.run(['git', 'rev-parse', '--short', 'HEAD'], { timeoutMs: 2000 })
  return head.exitCode === 0 ? { name: head.stdout.trim(), isDetached: true } : null
}

/** Writes the branch when it differs from the one shown (an equal write would redraw for nothing). */
async function sync ($: EngineInterface) {
  if (isReading) return
  isReading = true
  try {
    const next = await readBranch($).catch(() => null)
    if (lastBranch?.name === next?.name && lastBranch?.isDetached === next?.isDetached) return
    lastBranch = next
    await update($, branch, () => next)
  } finally {
    isReading = false
  }
}

export const register: Register = on => {
  lastBranch = null
  isReading = false
  timer?.cancel()
  timer = undefined

  on('session.start', async ($, e, next) => {
    timer?.cancel()
    await sync($)
    // A checkout from another terminal changes the branch without an event here, so it is read again on a timer.
    timer = $.clock.every(SYNC_MS, () => sync($))
    return next(e)
  })

  on('session.end', ($, e, next) => {
    timer?.cancel()
    timer = undefined
    return next(e)
  })

  // A Bash call may be the checkout itself: read again as soon as it ends.
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const result = await next(e)
    void sync($).catch(() => {})
    return result
  })

  // Bottom right of the prompt footer: the branch first, then what is beneath it (mode labels, other plugins).
  on('ui.render', { component: 'SessionMode' }, async ($, e, next) => {
    const [current, beneath] = await Promise.all([read($, branch), next(e)])
    if (current === null) return beneath

    const { Box, Text } = $.ui.resolve(e)
    const hasBeneath = e.props.modes.length > 0 || !isBlank(beneath)

    return (
      <Box flexDirection="row">
        <Text color="success">⎇ {current.isDetached ? `(${clip(current.name)})` : clip(current.name)}</Text>
        {hasBeneath ? <Text dimColor>{SEPARATOR}</Text> : null}
        {hasBeneath ? beneath : null}
      </Box>
    )
  })
}
