import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '../useKeyboardShortcuts'

function fireKeydown(key: string, target?: Partial<EventTarget>) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true })
  if (target) {
    Object.defineProperty(event, 'target', { value: target, writable: false })
  }
  window.dispatchEvent(event)
}

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls onNext when n key is pressed', () => {
    const onNext = vi.fn()
    renderHook(() => useKeyboardShortcuts({ onNext }))
    fireKeydown('n')
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('calls onPrevious when p key is pressed', () => {
    const onPrevious = vi.fn()
    renderHook(() => useKeyboardShortcuts({ onPrevious }))
    fireKeydown('p')
    expect(onPrevious).toHaveBeenCalledTimes(1)
  })

  it('calls onStatusToggle when s key is pressed', () => {
    const onStatusToggle = vi.fn()
    renderHook(() => useKeyboardShortcuts({ onStatusToggle }))
    fireKeydown('s')
    expect(onStatusToggle).toHaveBeenCalledTimes(1)
  })

  it('does NOT fire when target is an input element', () => {
    const onNext = vi.fn()
    renderHook(() => useKeyboardShortcuts({ onNext }))
    fireKeydown('n', { tagName: 'INPUT' } as unknown as Partial<EventTarget>)
    expect(onNext).not.toHaveBeenCalled()
  })

  it('does NOT fire when target is a textarea element', () => {
    const onPrevious = vi.fn()
    renderHook(() => useKeyboardShortcuts({ onPrevious }))
    fireKeydown('p', { tagName: 'TEXTAREA' } as unknown as Partial<EventTarget>)
    expect(onPrevious).not.toHaveBeenCalled()
  })

  it('does NOT fire when target is contentEditable', () => {
    const onStatusToggle = vi.fn()
    renderHook(() => useKeyboardShortcuts({ onStatusToggle }))
    fireKeydown('s', { tagName: 'DIV', isContentEditable: true } as HTMLElement)
    expect(onStatusToggle).not.toHaveBeenCalled()
  })

  it('does not crash when no callbacks provided', () => {
    expect(() => {
      renderHook(() => useKeyboardShortcuts({}))
      fireKeydown('n')
      fireKeydown('p')
      fireKeydown('s')
    }).not.toThrow()
  })
})
