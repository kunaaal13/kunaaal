export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme'

export function getStoredTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'system'
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'light' || value === 'dark' ? value : 'system'
}

export function prefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

export function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? (prefersDark() ? 'dark' : 'light') : theme
}

function paint(resolved: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

/**
 * Runs `fn` with every CSS transition switched off, except inside the toggle.
 *
 * Without this, elements carrying `transition-colors` fade to the new palette
 * while everything else snaps, so a theme change ripples across the page
 * instead of landing at once. The toggle is exempt so its icon swap still
 * animates.
 */
function withoutTransitions(fn: () => void) {
  const style = document.createElement('style')
  style.textContent =
    ':not([data-theme-toggle], [data-theme-toggle] *),' +
    ':not([data-theme-toggle] *)::before,' +
    ':not([data-theme-toggle] *)::after' +
    '{transition:none!important}'
  document.head.appendChild(style)
  fn()
  // Force a style flush so the new colours resolve while transitions are
  // still off; removing the sheet in the same frame would let them run.
  void window.getComputedStyle(document.body).opacity
  setTimeout(() => style.remove(), 1)
}

export function setTheme(theme: Theme) {
  if (theme === 'system') localStorage.removeItem(STORAGE_KEY)
  else localStorage.setItem(STORAGE_KEY, theme)
  withoutTransitions(() => paint(resolveTheme(theme)))
}

/**
 * Re-applies the stored theme. Called on `astro:after-swap`, because a
 * client-side navigation replaces <html> with markup from the server — which
 * never carries the `dark` class.
 */
export function applyStoredTheme() {
  paint(resolveTheme(getStoredTheme()))
}
