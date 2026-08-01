const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ESCAPES[char])

/**
 * Renders the small subset of inline Markdown used in config strings: links,
 * bold and inline code.
 *
 * These strings live in `src/config` and `src/entities`, so the bullets in the
 * About section and the experience descriptions were being printed verbatim —
 * `**Morphic**` with the asterisks showing. A full Markdown pipeline for three
 * inline forms would be more machinery than the content warrants.
 *
 * HTML is escaped first, so the only tags in the output are the ones produced
 * here. Input is authored by us, never user-supplied.
 */
export function renderInline(text: string): string {
  return escapeHtml(text)
    .replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      (_, label: string, href: string) =>
        `<a class="link-underline font-medium text-foreground" href="${href}"${
          href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''
        }>${label}</a>`
    )
    .replace(
      /\*\*([^*]+)\*\*/g,
      '<strong class="font-medium text-foreground">$1</strong>'
    )
    .replace(
      /`([^`]+)`/g,
      '<code class="rounded border bg-muted/50 px-1 py-px font-mono text-[0.9em]">$1</code>'
    )
}

/** Split a markdown-ish bullet list into its lines, stripping the markers. */
export function toBullets(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('-'))
    .map((line) => line.replace(/^-\s*/, ''))
}
