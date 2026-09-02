/** Number of deterministic Turn colors before the palette repeats. */
export const TURN_COLOR_COUNT = 6

/** Harness Chat rows that expose their owning Turn. */
export const TURN_ROW_SELECTOR = '[data-chat-flow] > [data-chat-turn]'

/** Attribute owned exclusively by this plugin. */
export const TURN_COLOR_ATTRIBUTE = 'data-dsh-turn-color'

/** Marker used to identify the plugin-owned stylesheet. */
export const TURN_STYLE_ATTRIBUTE = 'data-dsh-turn-colors-style'

const PACKAGE_NAME = '@geecraft23/dsh-turn-colors'

const TURN_STYLES = `
[data-chat-flow] > [data-chat-turn][data-dsh-turn-color] {
  border-radius: 12px;
  background-color: var(--dsh-turn-color-background);
}

[data-dsh-turn-color="0"] { --dsh-turn-color-background: rgba(59, 130, 246, 0.08); }
[data-dsh-turn-color="1"] { --dsh-turn-color-background: rgba(139, 92, 246, 0.08); }
[data-dsh-turn-color="2"] { --dsh-turn-color-background: rgba(16, 185, 129, 0.08); }
[data-dsh-turn-color="3"] { --dsh-turn-color-background: rgba(245, 158, 11, 0.08); }
[data-dsh-turn-color="4"] { --dsh-turn-color-background: rgba(6, 182, 212, 0.08); }
[data-dsh-turn-color="5"] { --dsh-turn-color-background: rgba(244, 63, 94, 0.08); }

body[data-ds-dark-theme] [data-dsh-turn-color="0"] { --dsh-turn-color-background: rgba(96, 165, 250, 0.14); }
body[data-ds-dark-theme] [data-dsh-turn-color="1"] { --dsh-turn-color-background: rgba(167, 139, 250, 0.14); }
body[data-ds-dark-theme] [data-dsh-turn-color="2"] { --dsh-turn-color-background: rgba(52, 211, 153, 0.14); }
body[data-ds-dark-theme] [data-dsh-turn-color="3"] { --dsh-turn-color-background: rgba(251, 191, 36, 0.14); }
body[data-ds-dark-theme] [data-dsh-turn-color="4"] { --dsh-turn-color-background: rgba(34, 211, 238, 0.14); }
body[data-ds-dark-theme] [data-dsh-turn-color="5"] { --dsh-turn-color-background: rgba(251, 113, 133, 0.14); }
`

/**
 * Return the stable palette position for a valid Harness Turn number.
 * @param turn - Non-negative integer Turn identity.
 * @returns A palette position from zero through five.
 */
export function colorIndexForTurn(turn: number): number {
  if (!Number.isSafeInteger(turn) || turn < 0) {
    throw new TypeError(`Turn must be a non-negative safe integer, received ${String(turn)}`)
  }
  return turn % TURN_COLOR_COUNT
}

function decorateTurnRow(row: Element): void {
  const raw = row.getAttribute('data-chat-turn')
  if (raw === null || raw.trim() === '') {
    row.removeAttribute(TURN_COLOR_ATTRIBUTE)
    return
  }
  const turn = Number(raw)
  if (!Number.isSafeInteger(turn) || turn < 0) {
    row.removeAttribute(TURN_COLOR_ATTRIBUTE)
    return
  }
  row.setAttribute(TURN_COLOR_ATTRIBUTE, String(colorIndexForTurn(turn)))
}

function synchronizeTurnRow(row: Element): void {
  if (!row.matches(TURN_ROW_SELECTOR)) {
    row.removeAttribute(TURN_COLOR_ATTRIBUTE)
    return
  }
  decorateTurnRow(row)
}

/**
 * Decorate matching Turn rows at or below one DOM root.
 * @param root - Document, fragment, or element containing newly rendered rows.
 */
export function decorateTurnRows(root: ParentNode): void {
  if (root.nodeType === 1) {
    const element = root as Element
    synchronizeTurnRow(element)
  }
  for (const row of root.querySelectorAll(TURN_ROW_SELECTOR)) decorateTurnRow(row)
}

/**
 * Install Turn coloring into one browser document.
 * @param doc - Document owned by the active Harness Web page.
 * @returns A disposer that removes all plugin-owned DOM state.
 */
export function installTurnColors(doc: Document): () => void {
  const style = doc.createElement('style')
  style.dataset.plugin = PACKAGE_NAME
  style.dataset.pluginCss = `${PACKAGE_NAME}/turn-colors`
  style.setAttribute(TURN_STYLE_ATTRIBUTE, '')
  style.textContent = TURN_STYLES
  doc.head.appendChild(style)

  decorateTurnRows(doc)

  const Observer = doc.defaultView?.MutationObserver
  const observer = Observer === undefined
    ? undefined
    : new Observer((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes') {
            if (mutation.target.nodeType === 1) synchronizeTurnRow(mutation.target as Element)
            continue
          }
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) decorateTurnRows(node as Element)
          }
        }
      })

  observer?.observe(doc.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-chat-turn'],
  })

  return () => {
    observer?.disconnect()
    style.remove()
    for (const row of doc.querySelectorAll(`[${TURN_COLOR_ATTRIBUTE}]`)) {
      row.removeAttribute(TURN_COLOR_ATTRIBUTE)
    }
  }
}
