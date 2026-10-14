export interface ClipboardWriter {
  writeText(text: string): Promise<void>
}

export type CopyResult = 'success' | 'unavailable' | 'failed' | 'empty'

function browserClipboard(): ClipboardWriter | null {
  try {
    if (typeof window === 'undefined' || !window.isSecureContext) return null
    return navigator.clipboard ?? null
  } catch {
    return null
  }
}

/** Injectable browser dependency; failures are returned rather than thrown into the UI. */
export async function copyText(text: string, clipboard: ClipboardWriter | null = browserClipboard()): Promise<CopyResult> {
  if (!text.trim()) return 'empty'
  if (!clipboard) return 'unavailable'
  try {
    if (typeof clipboard.writeText !== 'function') return 'unavailable'
    await clipboard.writeText(text)
    return 'success'
  } catch {
    return 'failed'
  }
}

export function joinEnglishPhrases(phrases: readonly string[]): string {
  return phrases.join('\n')
}
