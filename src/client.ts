import type { Context } from '@deepseek-ai/cordis'
import { installTurnColors } from './turn-colors.js'

/** Browser-side identity for the Turn color plugin. */
export const name = 'dsh-turn-colors-client'

/**
 * Color-code eligible user and final-Assistant content for this Client plugin's lifetime.
 * @param ctx - Browser Cordis context that owns cleanup.
 */
export function apply(ctx: Context): void {
  if (typeof document === 'undefined') return
  ctx.effect(() => installTurnColors(document), 'dsh-turn-colors: decorate Turn rows')
}
