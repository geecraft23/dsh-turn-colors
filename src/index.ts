import type { Context } from '@deepseek-ai/cordis'

/** Host-side identity for the browser-only Turn color plugin. */
export const name = 'dsh-turn-colors'

/**
 * Keep the Bundle row alive so Harness can discover and load its Client half.
 * @param _ctx - Host Cordis context; all behavior is browser-owned.
 */
export function apply(_ctx: Context): void {}
