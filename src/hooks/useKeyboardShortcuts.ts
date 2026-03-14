import { useEffect } from 'react'

interface KeyboardShortcutsConfig {
  onNext?: () => void
  onPrevious?: () => void
  onStatusToggle?: () => void
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  const { onNext, onPrevious, onStatusToggle } = config

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      // Ignore when typing in input, textarea, or contentEditable
      const target = event.target as HTMLElement
      if (
        !target ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      switch (event.key.toLowerCase()) {
        case 'n':
          onNext?.()
          break
        case 'p':
          onPrevious?.()
          break
        case 's':
          onStatusToggle?.()
          break
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [onNext, onPrevious, onStatusToggle])
}
