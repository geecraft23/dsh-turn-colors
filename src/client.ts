import type { Context } from '@deepseek-ai/cordis'
import { installTurnColors } from './turn-colors.js'

/** Browser-side identity for the Turn color plugin. */
export const name = 'dsh-turn-colors-client'

/**
 * Color-code the rendered Chat rows for the lifetime of this Client plugin.
 * @param ctx - Browser Cordis context that owns cleanup.
 */
export function apply(ctx: Context): void {
  if (typeof document === 'undefined') return
  ctx.effect(() => installTurnColors(document), 'dsh-turn-colors: decorate Turn rows')
}
