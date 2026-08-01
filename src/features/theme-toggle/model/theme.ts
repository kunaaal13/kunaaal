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

export function setTheme(theme: Theme) {
  if (theme === 'system') localStorage.removeItem(STORAGE_KEY)
  else localStorage.setItem(STORAGE_KEY, theme)
  paint(resolveTheme(theme))
}

/**
 * Re-applies the stored theme. Called on `astro:after-swap`, because a
 * client-side navigation replaces <html> with markup from the server — which
 * never carries the `dark` class.
 */
export function applyStoredTheme() {
  paint(resolveTheme(getStoredTheme()))
}
