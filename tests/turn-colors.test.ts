import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  colorIndexForTurn,
  installTurnColors,
  TURN_COLOR_ATTRIBUTE,
  TURN_COLOR_COUNT,
  TURN_STYLE_ATTRIBUTE,
} from '../src/turn-colors.js'

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

  it('decorates existing rows without touching unrelated elements', () => {
    document.body.innerHTML = `
      <div data-chat-flow>
        <div id="first" data-chat-turn="3"></div>
        <div id="same" data-chat-turn="3"></div>
        <div id="next" data-chat-turn="4"></div>
        <div id="invalid" data-chat-turn="oops"></div>
      </div>
      <div id="outside" data-chat-turn="3"></div>
    `

    const dispose = installTurnColors(document)

    expect(document.querySelector('#first')?.getAttribute(TURN_COLOR_ATTRIBUTE)).toBe('3')
    expect(document.querySelector('#same')?.getAttribute(TURN_COLOR_ATTRIBUTE)).toBe('3')
    expect(document.querySelector('#next')?.getAttribute(TURN_COLOR_ATTRIBUTE)).toBe('4')
    expect(document.querySelector('#invalid')?.hasAttribute(TURN_COLOR_ATTRIBUTE)).toBe(false)
    expect(document.querySelector('#outside')?.hasAttribute(TURN_COLOR_ATTRIBUTE)).toBe(false)
    expect(document.head.querySelectorAll(`[${TURN_STYLE_ATTRIBUTE}]`)).toHaveLength(1)

    dispose()
  })

  it('decorates appended and prepended rows and follows Turn changes', async () => {
    document.body.innerHTML = '<div data-chat-flow id="flow"><div id="existing" data-chat-turn="1"></div></div>'
    const flow = document.querySelector('#flow')
    if (!(flow instanceof HTMLElement)) throw new Error('missing test flow')
    const dispose = installTurnColors(document)

    const appended = document.createElement('div')
    appended.id = 'appended'
    appended.dataset.chatTurn = '8'
    flow.appendChild(appended)

    const prepended = document.createElement('div')
    prepended.id = 'prepended'
    prepended.dataset.chatTurn = '7'
    flow.prepend(prepended)

    await vi.waitFor(() => {
      expect(appended.getAttribute(TURN_COLOR_ATTRIBUTE)).toBe('2')
      expect(prepended.getAttribute(TURN_COLOR_ATTRIBUTE)).toBe('1')
    })

    appended.dataset.chatTurn = '9'
    await vi.waitFor(() => {
      expect(appended.getAttribute(TURN_COLOR_ATTRIBUTE)).toBe('3')
    })

    appended.removeAttribute('data-chat-turn')
    await vi.waitFor(() => {
      expect(appended.hasAttribute(TURN_COLOR_ATTRIBUTE)).toBe(false)
    })

    const outside = document.createElement('div')
    document.body.appendChild(outside)
    outside.dataset.chatTurn = '10'
    await new Promise(resolve => window.setTimeout(resolve, 0))
    expect(outside.hasAttribute(TURN_COLOR_ATTRIBUTE)).toBe(false)

    dispose()
  })

  it('removes its stylesheet and attributes and stops observing on dispose', async () => {
    document.body.innerHTML = '<div data-chat-flow id="flow"><div id="existing" data-chat-turn="2"></div></div>'
    const flow = document.querySelector('#flow')
    const existing = document.querySelector('#existing')
    if (!(flow instanceof HTMLElement) || !(existing instanceof HTMLElement)) {
      throw new Error('missing test elements')
    }
    const dispose = installTurnColors(document)

    expect(existing.getAttribute(TURN_COLOR_ATTRIBUTE)).toBe('2')
    dispose()
    expect(existing.hasAttribute(TURN_COLOR_ATTRIBUTE)).toBe(false)
    expect(document.head.querySelector(`[${TURN_STYLE_ATTRIBUTE}]`)).toBeNull()

    const later = document.createElement('div')
    later.dataset.chatTurn = '3'
    flow.appendChild(later)
    await new Promise(resolve => window.setTimeout(resolve, 0))
    expect(later.hasAttribute(TURN_COLOR_ATTRIBUTE)).toBe(false)
  })

  it('ships separate light and dark palette declarations', () => {
    const dispose = installTurnColors(document)
    const css = document.head.querySelector(`[${TURN_STYLE_ATTRIBUTE}]`)?.textContent ?? ''

    expect(css.match(/data-dsh-turn-color=/g)).toHaveLength(TURN_COLOR_COUNT * 2)
    expect(css).toContain('body[data-ds-dark-theme]')

    dispose()
  })
})
