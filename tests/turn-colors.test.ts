import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  colorIndexForTurn,
  installTurnColors,
  TURN_COLOR_ATTRIBUTE,
  TURN_COLOR_COUNT,
  TURN_CONTENT_ATTRIBUTE,
  TURN_ROW_SELECTOR,
  TURN_STYLE_ATTRIBUTE,
} from '../src/turn-colors.js'

function userRow(id: string, turn: string, kind: 'user' | 'steering' = 'user'): string {
  return `
    <div id="${id}-row" data-chat-flow-kind="${kind}" data-chat-turn="${turn}">
      <div data-slot="conversation.chat.node">
        <div>
          <div>
            <div data-slot="conversation.message.images"></div>
            <div id="${id}-content">${id}</div>
          </div>
          <div id="${id}-actions">actions</div>
        </div>
      </div>
    </div>
  `
}

function assistantRow(id: string, turn: string, text: string): string {
  return `
    <div id="${id}-row" data-chat-flow-kind="assistant-step" data-chat-turn="${turn}">
      <div data-slot="conversation.chat.node">
        <div>
          <div>
            <div id="${id}-reasoning"><div data-variant="think">reasoning</div></div>
            <div id="${id}-content">${text}</div>
          </div>
        </div>
      </div>
    </div>
  `
}

function richAssistantRow(id: string, turn: string): string {
  return `
    <div id="${id}-row" data-chat-flow-kind="assistant-step" data-chat-turn="${turn}">
      <div data-slot="conversation.chat.node">
        <div>
          <div>
            <div id="${id}-reasoning"><div data-variant="think">reasoning</div></div>
            <div id="${id}-first">first paragraph</div>
            <div id="${id}-image" data-align="start"><img alt="generated"></div>
            <span id="${id}-status">stopped</span>
            <div id="${id}-second"><ul><li>second paragraph</li></ul></div>
          </div>
        </div>
      </div>
    </div>
  `
}

function otherAssistantRow(id: string, turn: string): string {
  return `
    <div id="${id}-row" data-chat-flow-kind="assistant-step" data-chat-turn="${turn}">
      <div data-slot="conversation.chat.node">
        <div>
          <div>
            <div id="${id}-json"><button type="button">Extra content block</button></div>
          </div>
        </div>
      </div>
    </div>
  `
}

function turnTail(id: string, turn: string): string {
  return `
    <div id="${id}-row" data-chat-flow-kind="turn-tail" data-chat-turn="${turn}">
      <div data-slot="conversation.chat.node">
        <div data-turn-tail="${turn}"><div id="${id}-actions">actions</div></div>
      </div>
    </div>
  `
}

afterEach(() => {
  document.body.innerHTML = ''
  for (const style of document.head.querySelectorAll(`[${TURN_STYLE_ATTRIBUTE}]`)) style.remove()
})

describe('Turn colors', () => {
  it('maps valid Turn numbers to a stable repeating palette', () => {
    expect(colorIndexForTurn(0)).toBe(0)
    expect(colorIndexForTurn(1)).toBe(1)
    expect(colorIndexForTurn(TURN_COLOR_COUNT)).toBe(0)
    expect(colorIndexForTurn(TURN_COLOR_COUNT + 1)).toBe(1)
  })

  it('rejects invalid Turn numbers', () => {
    for (const turn of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => colorIndexForTurn(turn)).toThrow(TypeError)
    }
  })

  it('decorates only user input and the completed final Assistant row', () => {
    document.body.innerHTML = `
      <div data-chat-flow>
        <div id="system" data-chat-flow-kind="system-prompt" data-chat-turn="3">system</div>
        ${userRow('user', '3')}
        <div id="process" data-chat-flow-kind="turn-process" data-chat-turn="3">process</div>
        ${assistantRow('earlier', '3', 'intermediate')}
        <div id="tool" data-chat-flow-kind="tool-call" data-chat-turn="3">tool</div>
        ${richAssistantRow('final', '3')}
        ${otherAssistantRow('other', '3')}
        ${turnTail('tail', '3')}
        ${userRow('steering', '4', 'steering')}
        ${userRow('invalid', 'oops')}
      </div>
      ${userRow('outside', '3')}
    `

    const dispose = installTurnColors(document)

    expect(document.querySelector('#user-row')?.getAttribute(TURN_COLOR_ATTRIBUTE)).toBe('3')
    expect(document.querySelector('#steering-row')?.getAttribute(TURN_COLOR_ATTRIBUTE)).toBe('4')
    expect(document.querySelector('#final-row')?.getAttribute(TURN_COLOR_ATTRIBUTE)).toBe('3')
    expect(document.querySelector('#final-first')?.hasAttribute(TURN_CONTENT_ATTRIBUTE)).toBe(true)
    expect(document.querySelector('#final-second')?.hasAttribute(TURN_CONTENT_ATTRIBUTE)).toBe(true)

    for (const selector of [
      '#system', '#process', '#earlier-row', '#tool', '#other-row', '#tail-row', '#invalid-row', '#outside-row',
    ]) {
      expect(document.querySelector(selector)?.hasAttribute(TURN_COLOR_ATTRIBUTE), selector).toBe(false)
    }
    for (const selector of [
      '#user-content', '#user-actions', '#final-reasoning', '#final-image', '#final-status',
      '#other-json', '#tail-actions',
    ]) {
      expect(document.querySelector(selector)?.hasAttribute(TURN_COLOR_ATTRIBUTE), selector).toBe(false)
      expect(document.querySelector(selector)?.hasAttribute(TURN_CONTENT_ATTRIBUTE), selector).toBe(false)
    }
    expect(document.head.querySelectorAll(`[${TURN_STYLE_ATTRIBUTE}]`)).toHaveLength(1)

    dispose()
  })

  it('follows dynamic Turns and removes a final color when its tail disappears', async () => {
    document.body.innerHTML = `<div data-chat-flow id="flow">${userRow('existing', '1')}</div>`
    const flow = document.querySelector('#flow')
    const existingRow = document.querySelector('#existing-row')
    if (!(flow instanceof HTMLElement) || !(existingRow instanceof HTMLElement)) {
      throw new Error('missing test flow')
    }
    const dispose = installTurnColors(document)

    flow.insertAdjacentHTML('beforeend', assistantRow('dynamic', '8', 'done') + turnTail('dynamic-tail', '8'))
    flow.insertAdjacentHTML('afterbegin', userRow('prepended', '7'))

    await vi.waitFor(() => {
      expect(document.querySelector('#dynamic-row')?.getAttribute(TURN_COLOR_ATTRIBUTE)).toBe('2')
      expect(document.querySelector('#dynamic-content')?.hasAttribute(TURN_CONTENT_ATTRIBUTE)).toBe(true)
      expect(document.querySelector('#prepended-row')?.getAttribute(TURN_COLOR_ATTRIBUTE)).toBe('1')
    })

    document.querySelector('#dynamic-content')?.replaceWith(Object.assign(document.createElement('div'), {
      id: 'dynamic-replacement',
      textContent: 'replacement',
    }))
    await vi.waitFor(() => {
      expect(document.querySelector('#dynamic-replacement')?.hasAttribute(TURN_CONTENT_ATTRIBUTE)).toBe(true)
    })

    existingRow.dataset.chatTurn = '9'
    await vi.waitFor(() => {
      expect(existingRow.getAttribute(TURN_COLOR_ATTRIBUTE)).toBe('3')
    })

    document.querySelector('#dynamic-tail-row')?.remove()
    await vi.waitFor(() => {
      expect(document.querySelector('#dynamic-row')?.hasAttribute(TURN_COLOR_ATTRIBUTE)).toBe(false)
      expect(document.querySelector('#dynamic-replacement')?.hasAttribute(TURN_CONTENT_ATTRIBUTE)).toBe(false)
    })

    dispose()
  })

  it('removes its stylesheet and row attributes and stops observing on dispose', async () => {
    document.body.innerHTML = `
      <div data-chat-flow id="flow">
        ${userRow('existing', '2')}
        ${assistantRow('final', '2', 'answer')}
        ${turnTail('tail', '2')}
      </div>
    `
    const flow = document.querySelector('#flow')
    const existing = document.querySelector('#existing-row')
    if (!(flow instanceof HTMLElement) || !(existing instanceof HTMLElement)) {
      throw new Error('missing test elements')
    }
    const dispose = installTurnColors(document)

    expect(existing.getAttribute(TURN_COLOR_ATTRIBUTE)).toBe('2')
    expect(document.querySelector('#final-content')?.hasAttribute(TURN_CONTENT_ATTRIBUTE)).toBe(true)
    existing.remove()
    dispose()
    expect(existing.hasAttribute(TURN_COLOR_ATTRIBUTE)).toBe(false)
    expect(document.querySelector('#final-content')?.hasAttribute(TURN_CONTENT_ATTRIBUTE)).toBe(false)
    expect(document.head.querySelector(`[${TURN_STYLE_ATTRIBUTE}]`)).toBeNull()

    flow.insertAdjacentHTML('beforeend', userRow('later', '3'))
    await new Promise(resolve => window.setTimeout(resolve, 0))
    expect(document.querySelector('#later-row')?.hasAttribute(TURN_COLOR_ATTRIBUTE)).toBe(false)
  })

  it('ships content-only selectors and separate light and dark palettes', () => {
    const dispose = installTurnColors(document)
    const css = document.head.querySelector(`[${TURN_STYLE_ATTRIBUTE}]`)?.textContent ?? ''

    expect(css.match(/data-dsh-turn-color=/g)).toHaveLength(TURN_COLOR_COUNT * 2)
    expect(css).toContain('--dsw-specific-bubble: var(--dsh-turn-color-background)')
    expect(css).toContain(`[${TURN_CONTENT_ATTRIBUTE}]`)
    expect(css).toContain('inline-size: fit-content')
    expect(css).toContain('::before')
    expect(css).toContain('body[data-ds-dark-theme]')
    expect(css).not.toContain(`${TURN_ROW_SELECTOR}[`)

    dispose()
  })
})
