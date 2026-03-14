'use client'

import { useCallback } from 'react'

type LegacyWindowAudio = Window & {
  webkitAudioContext?: typeof AudioContext
}

export function useAudioNotification() {
  const playBeep = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      const AudioContextClass =
        window.AudioContext || (window as LegacyWindowAudio).webkitAudioContext

      if (!AudioContextClass) return

      const ctx = new AudioContextClass()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.setValueAtTime(800, ctx.currentTime)
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.5)

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('DSA Grind', { body: 'Timer complete!' })
      }
    } catch {
      // Intentional: graceful degradation when Web Audio API is unavailable
      // Falls back to visual notification only (no crash)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }, [])

  return { playBeep, requestPermission }
}
