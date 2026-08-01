/**
 * Rasterises the site mark into the favicon set.
 *
 * The shape is defined once, in `src/app/ui/mark.mjs`, and imported by both the
 * header component and this script — so the tab icon can never drift from the
 * mark in the header. Re-run after editing the grid:
 *
 *   npm run build:icons
 *
 * Output is committed. A normal build never runs this.
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import { markSvg } from '../src/app/ui/mark.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')

/**
 * Capped at 192 on purpose.
 *
 * The mark is a 5x5 grid whose arms are pixel diagonals — cells touching only
 * at their corners. That holds together down to 16px and falls apart on the way
 * up: at 512 the joins are ~57px of empty space and it reads as scattered
 * blocks rather than a letter. 192 is the last size where it still reads.
 */
const SIZES = [
  ['favicon-16x16.png', 16],
  ['favicon-32x32.png', 32],
  ['apple-touch-icon.png', 180],
  ['android-chrome-192x192.png', 192],
]

await mkdir(publicDir, { recursive: true })

const svg = markSvg()
await writeFile(join(publicDir, 'favicon.svg'), svg)

for (const [name, size] of SIZES) {
  // Rendered from the 512 master at each size rather than re-laying out the
  // grid: resvg snaps to whole pixels, and crispEdges keeps the cells square.
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
  })
    .render()
    .asPng()

  await writeFile(join(publicDir, name), Buffer.from(png))
}

console.log(`icons: favicon.svg + ${SIZES.length} rasters`)
