/**
 * The mark, as data. One definition, three consumers.
 *
 * `SiteMark.astro` renders it inline for the header; `scripts/build-icons.mjs`
 * rasterises it into the favicon set. Keeping the grid here rather than in the
 * component is the only thing that stops the tab icon and the header drifting
 * apart the next time a cell moves.
 *
 * Plain `.mjs` on purpose — Node runs it directly in the build script, and Vite
 * imports it into the component. A `.ts` file would need a compile step for the
 * former.
 */

/** The mark is drawn on a square grid this many cells wide. */
export const GRID = 5

/**
 * Filled cells: a solid, blocky "K". Stem down the left, arms stepping out
 * right.
 *
 * The banner figure on the home page is an outlined isometric drawing, which
 * turns to mush at 32px. This is the same letter reduced to filled blocks on a
 * coarse grid — the shape that survives when the linework cannot.
 *
 * @type {[number, number][]}
 */
// prettier-ignore
export const CELLS = [
  [0,0],[0,1],[0,2],[0,3],[0,4],  // stem
  [1,2],                           // waist
  [2,1],[3,0],                     // upper arm
  [2,3],[3,4],                     // lower arm
]

/**
 * The mark as standalone SVG markup, on a rounded tile.
 *
 * Used for every raster icon. The tile is fixed dark rather than
 * theme-adaptive: a favicon has to read against any tab strip, and Apple
 * composites touch icons onto black regardless of transparency.
 *
 * @param {object} options
 * @param {number} [options.size] Tile edge, in px.
 * @param {string} [options.background]
 * @param {string} [options.foreground]
 * @param {number} [options.inset] Fraction of the tile the mark occupies.
 * @param {number} [options.radius] Corner radius as a fraction of the tile.
 * @returns {string}
 */
export function markSvg({
  size = 512,
  background = '#09090b',
  foreground = '#fafafa',
  inset = 0.56,
  radius = 0.22,
} = {}) {
  const cell = (size * inset) / GRID
  const offset = (size - cell * GRID) / 2

  const rects = CELLS.map(
    ([x, y]) =>
      `<rect x="${round(offset + x * cell)}" y="${round(offset + y * cell)}" width="${round(cell)}" height="${round(cell)}"/>`
  ).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${round(size * radius)}" fill="${background}"/>
  <g fill="${foreground}" shape-rendering="crispEdges">${rects}</g>
</svg>
`
}

/** @param {number} n */
const round = (n) => Math.round(n * 100) / 100
