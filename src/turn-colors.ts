/** Number of deterministic Turn colors before the palette repeats. */
export const TURN_COLOR_COUNT = 6

/** Harness Chat rows that expose their owning Turn. */
export const TURN_ROW_SELECTOR = '[data-chat-flow] > [data-chat-turn]'

/** Palette position owned exclusively by this plugin. */
export const TURN_COLOR_ATTRIBUTE = 'data-dsh-turn-color'

/** Marks final Assistant prose blocks without selecting generated CSS class names. */
export const TURN_CONTENT_ATTRIBUTE = 'data-dsh-turn-color-content'

/** Marker used to identify the plugin-owned stylesheet. */
export const TURN_STYLE_ATTRIBUTE = 'data-dsh-turn-colors-style'

const CHAT_FLOW_SELECTOR = '[data-chat-flow]'
const PACKAGE_NAME = '@geecraft23/dsh-turn-colors'

const TURN_STYLES = `
:is(
  [data-chat-flow-kind="user"],
  [data-chat-flow-kind="steering"]
)[data-dsh-turn-color] {
  --dsw-specific-bubble: var(--dsh-turn-color-background);
}

[data-chat-flow-kind="assistant-step"][data-dsh-turn-color]
  [data-dsh-turn-color-content] {
  align-self: flex-start;
  box-sizing: border-box;
  position: relative;
  isolation: isolate;
  inline-size: fit-content;
  max-inline-size: 100%;
}

[data-chat-flow-kind="assistant-step"][data-dsh-turn-color]
  [data-dsh-turn-color-content]::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: -6px -10px;
  border-radius: 10px;
  background-color: var(--dsh-turn-color-background);
  pointer-events: none;
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

function turnOf(row: Element): number | null {
  const raw = row.getAttribute('data-chat-turn')
  if (raw === null || raw.trim() === '') return null
  const turn = Number(raw)
  return Number.isSafeInteger(turn) && turn >= 0 ? turn : null
}

function assistantOutput(row: Element): Element[] {
  const slot = row.querySelector(':scope > [data-slot="conversation.chat.node"]')
  const assistantRoot = slot?.firstElementChild
  const body = assistantRoot?.firstElementChild
  if (body === null || body === undefined) return []
  return [...body.children].filter(element => (
    element.tagName === 'DIV'
    && !element.hasAttribute('data-align')
    && element.querySelector('[data-variant="think"]') === null
    && element.querySelector(':scope > button[type="button"]') === null
    && element.textContent?.trim() !== ''
  ))
}

function clearTurnColors(root: ParentNode): void {
  if (root.nodeType === 1) {
    const element = root as Element
    element.removeAttribute(TURN_COLOR_ATTRIBUTE)
    element.removeAttribute(TURN_CONTENT_ATTRIBUTE)
  }
  for (const element of root.querySelectorAll(
    `[${TURN_COLOR_ATTRIBUTE}], [${TURN_CONTENT_ATTRIBUTE}]`,
  )) {
    element.removeAttribute(TURN_COLOR_ATTRIBUTE)
    element.removeAttribute(TURN_CONTENT_ATTRIBUTE)
  }
}

function decorateRow(row: Element, turn: number): void {
  row.setAttribute(TURN_COLOR_ATTRIBUTE, String(colorIndexForTurn(turn)))
}

function synchronizeChatFlow(flow: Element): void {
  clearTurnColors(flow)
  const rows = [...flow.children].filter(row => row.matches('[data-chat-turn]'))

  for (const row of rows) {
    const kind = row.getAttribute('data-chat-flow-kind')
    if (kind !== 'user' && kind !== 'steering') continue
    const turn = turnOf(row)
    if (turn !== null) decorateRow(row, turn)
  }

  for (let tailIndex = 0; tailIndex < rows.length; tailIndex++) {
    const tail = rows[tailIndex]
    if (tail?.getAttribute('data-chat-flow-kind') !== 'turn-tail') continue
    if (tail.querySelector('[data-turn-tail]') === null) continue
    const turn = turnOf(tail)
    if (turn === null) continue

    for (let index = tailIndex - 1; index >= 0; index--) {
      const candidate = rows[index]
      if (candidate === undefined || turnOf(candidate) !== turn) continue
      if (candidate.getAttribute('data-chat-flow-kind') !== 'assistant-step') continue
      const contents = assistantOutput(candidate)
      if (contents.length === 0) continue
      decorateRow(candidate, turn)
      for (const content of contents) content.setAttribute(TURN_CONTENT_ATTRIBUTE, '')
      break
    }
  }
}

function collectChatFlows(root: ParentNode): Set<Element> {
  const flows = new Set<Element>()
  if (root.nodeType === 1) {
    const element = root as Element
    if (element.matches(CHAT_FLOW_SELECTOR)) flows.add(element)
    const owner = element.closest(CHAT_FLOW_SELECTOR)
    if (owner !== null) flows.add(owner)
  }
  for (const flow of root.querySelectorAll(CHAT_FLOW_SELECTOR)) flows.add(flow)
  return flows
}

function clearRemovedNodes(mutations: readonly MutationRecord[]): void {
  for (const mutation of mutations) {
    if (mutation.type !== 'childList') continue
    for (const node of mutation.removedNodes) {
      if (node.nodeType === 1) clearTurnColors(node as Element)
    }
  }
}

/**
 * Decorate eligible user rows and completed final-Assistant rows at or below one DOM root.
 * @param root - Document, fragment, or element containing rendered Chat rows.
 */
export function decorateTurnRows(root: ParentNode): void {
  for (const flow of collectChatFlows(root)) synchronizeChatFlow(flow)
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
        const flows = new Set<Element>()
        for (const mutation of mutations) {
          for (const flow of collectChatFlows(mutation.target as ParentNode)) flows.add(flow)
          if (mutation.type !== 'childList') continue
          for (const node of mutation.addedNodes) {
            if (node.nodeType !== 1) continue
            for (const flow of collectChatFlows(node as Element)) flows.add(flow)
          }
        }
        clearRemovedNodes(mutations)
        for (const flow of flows) synchronizeChatFlow(flow)
      })

  observer?.observe(doc.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-chat-turn', 'data-chat-flow-kind', 'data-turn-tail'],
  })

  return () => {
    clearRemovedNodes(observer?.takeRecords() ?? [])
    observer?.disconnect()
    style.remove()
    clearTurnColors(doc)
  }
}
