// FSD public API for the `home` page slice.
// The open question this file exists to answer: can a .ts barrel re-export an
// .astro component and still survive `astro check`?
export { default as HomePage } from './ui/HomePage.astro'
