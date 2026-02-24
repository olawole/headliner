# Avatar

An AI-powered video briefing app that pairs a real-time talking avatar with live search across financial markets, breaking news, and academic research — delivering personalized, face-to-face briefings on any topic you throw at it.

Built with [Tavus CVI](https://docs.tavus.io) for conversational video, [Valyu](https://valyu.ai) for real-time search, and [Next.js](https://nextjs.org).

## Features

- **Financial Analyst** — Real-time market data, earnings reports, stock analysis, SEC filings, and portfolio briefings with watchlist support
- **News Anchor** — Live news briefings on any topic with source citations and multi-story coverage
- **Research Explainer** — Academic paper breakdowns from arXiv, PubMed, and bioRxiv with adjustable difficulty levels (general to expert)
- **Live Data Cards** — Bloomberg-style data overlays that surface key metrics, tickers, and price changes during briefings
- **Video Recording** — Record your briefings as `.webm` files directly from the browser (avatar-only or picture-in-picture mode)
- **Paper Walk-through** — Paste an arXiv/paper URL and get a structured, conversational explanation
- **Watchlist Briefings** — Enter stock tickers for a full portfolio rundown
- **Export Summary** — Download conversation transcripts as text

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Video:** Tavus CVI + Daily.co WebRTC
- **Search:** Valyu (web, academic, financial, news)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Animation:** Framer Motion
- **Validation:** Zod

## Prerequisites

- Node.js 18+
- A [Tavus API key](https://platform.tavus.io)
- A [Valyu API key](https://platform.valyu.ai)

## Installation

1. **Clone the repo**

   ```bash
   git clone <your-repo-url>
   cd avatar
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your API keys:

   ```env
   TAVUS_API_KEY=your_tavus_api_key
   VALYU_API_KEY=your_valyu_api_key
   TAVUS_REPLICA_ID=rfe12d8b9597
   ```

   Optionally assign different avatar faces per persona:

   ```env
   TAVUS_REPLICA_ID_FINANCIAL_ANALYST=your_replica_id
   TAVUS_REPLICA_ID_NEWS_ANCHOR=your_replica_id
   TAVUS_REPLICA_ID_RESEARCH_EXPLAINER=your_replica_id
   ```

4. **Create a persona**

   Start the dev server, then create a persona via the API:

   ```bash
   npm run dev
   ```

   ```bash
   curl -X POST http://localhost:3000/api/persona \
     -H "Content-Type: application/json" \
     -d '{"persona_type": "financial-analyst"}'
   ```

   The app creates personas on-the-fly per conversation, so this step is optional — but useful for testing your API key is working.

5. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000) and pick a persona to start a briefing.

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Production build         |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── conversation/   # Create/end video conversations
│   │   ├── search/          # Proxy search requests to Valyu
│   │   └── persona/         # Persona management
│   └── page.tsx             # Landing page
├── components/
│   ├── cvi/                 # Tavus CVI components & hooks
│   │   ├── components/      # Video UI, record button, device select
│   │   └── hooks/           # Recording, Daily.co integration
│   ├── avatar-conversation.tsx  # Main orchestrator
│   ├── data-cards.tsx       # Live data overlay cards
│   ├── live-chyron.tsx      # Lower-third ticker bar
│   ├── search-results.tsx   # Sidebar search results
│   ├── transcript.tsx       # Live conversation transcript
│   └── export-summary.tsx   # Export transcript as text
└── lib/
    ├── tavus.ts             # Tavus API client
    ├── valyu.ts             # Valyu search + prefetch
    ├── personas.ts          # Persona configs & system prompts
    └── schemas.ts           # Zod validation schemas
```

## How It Works

1. User selects a persona and enters a topic (or paper URL / stock watchlist)
2. The server pre-fetches relevant data from Valyu and injects it as conversational context
3. Tavus creates an AI persona with the context and starts a WebRTC video call via Daily.co
4. The avatar delivers a face-to-face briefing using the pre-loaded data
5. During conversation, the avatar can trigger live searches — results appear as data cards and in the sidebar
6. Users can record the session, export transcripts, or ask follow-up questions

## License

MIT
