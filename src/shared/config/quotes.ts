export interface Quote {
  /** English text. For Gita verses, a plain-sense rendering. */
  text: string
  /** Shown under the rule. For verses this is the chapter reference. */
  attribution: string
  /** Devanagari original — Gita verses only. */
  sanskrit?: string
}

/**
 * Quotes shown above the footer.
 *
 * Gita renderings are common English phrasings rather than any one
 * translator's text, so no translator is credited — that would be a claim I
 * cannot support. The chapter-and-verse reference lets anyone check the source.
 *
 * The Jobs and Musk lines are ones with a traceable origin (Stanford 2005, the
 * 2003 NYT interview, recorded interviews). A great many quotes attributed to
 * both are apocryphal, so anything I could not place is left out.
 */
export const QUOTES: Quote[] = [
  // — Bhagavad Gita —
  {
    sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन',
    text: 'You have a right to your work, never to its fruits.',
    attribution: 'Bhagavad Gita 2.47',
  },
  {
    sanskrit: 'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय',
    text: 'Steady yourself, then act — and let go of the outcome.',
    attribution: 'Bhagavad Gita 2.48',
  },
  {
    sanskrit: 'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्',
    text: 'Lift yourself by yourself; do not let yourself sink.',
    attribution: 'Bhagavad Gita 6.5',
  },
  {
    sanskrit: 'श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात्',
    text: "Better your own path walked imperfectly than another's walked well.",
    attribution: 'Bhagavad Gita 3.35',
  },
  {
    sanskrit: 'आगमापायिनोऽनित्यास्तांस्तितिक्षस्व भारत',
    text: 'They come and they go, impermanent. Endure them.',
    attribution: 'Bhagavad Gita 2.14',
  },

  // — Steve Jobs —
  {
    text: 'Stay hungry. Stay foolish.',
    attribution: 'Steve Jobs',
  },
  {
    text: "Your time is limited, so don't waste it living someone else's life.",
    attribution: 'Steve Jobs',
  },
  {
    text: 'Design is not just what it looks like and feels like. Design is how it works.',
    attribution: 'Steve Jobs',
  },

  // — Elon Musk —
  {
    text: 'When something is important enough, you do it even if the odds are not in your favour.',
    attribution: 'Elon Musk',
  },
  {
    text: 'Failure is an option here. If things are not failing, you are not innovating enough.',
    attribution: 'Elon Musk',
  },
  {
    text: "The first step is to establish that something is possible; then probability will occur.",
    attribution: 'Elon Musk',
  },
]
