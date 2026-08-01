/**
 * Client-safe public API.
 *
 * Nothing reachable from here may import `astro:content` or any other
 * server-only module: this barrel is followed when the island is bundled for
 * the browser, so a single server-only import anywhere in the graph fails the
 * build. Data is built in the app layer and handed in as a prop.
 */
export { default as CommandMenu } from './ui/CommandMenu.svelte'
export {
  groupResults,
  score,
  search,
  type SearchItem,
} from './model/search-index'
