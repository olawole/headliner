/** Popular US stock tickers with company names for autocomplete */
export interface TickerEntry {
  ticker: string;
  name: string;
  sector?: string;
}

export const POPULAR_TICKERS: TickerEntry[] = [
  // Mega-cap tech
  { ticker: "AAPL", name: "Apple", sector: "Tech" },
  { ticker: "MSFT", name: "Microsoft", sector: "Tech" },
  { ticker: "GOOGL", name: "Alphabet (Google)", sector: "Tech" },
  { ticker: "GOOG", name: "Alphabet Class C", sector: "Tech" },
  { ticker: "AMZN", name: "Amazon", sector: "Tech" },
  { ticker: "META", name: "Meta Platforms", sector: "Tech" },
  { ticker: "NVDA", name: "NVIDIA", sector: "Tech" },
  { ticker: "TSLA", name: "Tesla", sector: "Auto/Tech" },
  { ticker: "TSM", name: "Taiwan Semiconductor", sector: "Tech" },
  { ticker: "AVGO", name: "Broadcom", sector: "Tech" },
  { ticker: "ORCL", name: "Oracle", sector: "Tech" },
  { ticker: "CRM", name: "Salesforce", sector: "Tech" },
  { ticker: "ADBE", name: "Adobe", sector: "Tech" },
  { ticker: "AMD", name: "Advanced Micro Devices", sector: "Tech" },
  { ticker: "INTC", name: "Intel", sector: "Tech" },
  { ticker: "CSCO", name: "Cisco Systems", sector: "Tech" },
  { ticker: "QCOM", name: "Qualcomm", sector: "Tech" },
  { ticker: "TXN", name: "Texas Instruments", sector: "Tech" },
  { ticker: "IBM", name: "IBM", sector: "Tech" },
  { ticker: "NOW", name: "ServiceNow", sector: "Tech" },
  { ticker: "INTU", name: "Intuit", sector: "Tech" },
  { ticker: "AMAT", name: "Applied Materials", sector: "Tech" },
  { ticker: "MU", name: "Micron Technology", sector: "Tech" },
  { ticker: "LRCX", name: "Lam Research", sector: "Tech" },
  { ticker: "KLAC", name: "KLA Corporation", sector: "Tech" },
  { ticker: "SNPS", name: "Synopsys", sector: "Tech" },
  { ticker: "CDNS", name: "Cadence Design Systems", sector: "Tech" },
  { ticker: "MRVL", name: "Marvell Technology", sector: "Tech" },
  { ticker: "PLTR", name: "Palantir Technologies", sector: "Tech" },
  { ticker: "NET", name: "Cloudflare", sector: "Tech" },
  { ticker: "SNOW", name: "Snowflake", sector: "Tech" },
  { ticker: "DDOG", name: "Datadog", sector: "Tech" },
  { ticker: "CRWD", name: "CrowdStrike", sector: "Tech" },
  { ticker: "ZS", name: "Zscaler", sector: "Tech" },
  { ticker: "PANW", name: "Palo Alto Networks", sector: "Tech" },
  { ticker: "SHOP", name: "Shopify", sector: "Tech" },
  { ticker: "SQ", name: "Block (Square)", sector: "Fintech" },
  { ticker: "UBER", name: "Uber Technologies", sector: "Tech" },
  { ticker: "ABNB", name: "Airbnb", sector: "Tech" },
  { ticker: "COIN", name: "Coinbase", sector: "Fintech" },
  { ticker: "HOOD", name: "Robinhood Markets", sector: "Fintech" },
  { ticker: "ARM", name: "Arm Holdings", sector: "Tech" },
  { ticker: "SMCI", name: "Super Micro Computer", sector: "Tech" },

  // Internet & Social
  { ticker: "NFLX", name: "Netflix", sector: "Media" },
  { ticker: "DIS", name: "Walt Disney", sector: "Media" },
  { ticker: "SPOT", name: "Spotify", sector: "Media" },
  { ticker: "SNAP", name: "Snap", sector: "Social" },
  { ticker: "PINS", name: "Pinterest", sector: "Social" },
  { ticker: "RDDT", name: "Reddit", sector: "Social" },

  // Finance
  { ticker: "JPM", name: "JPMorgan Chase", sector: "Finance" },
  { ticker: "BAC", name: "Bank of America", sector: "Finance" },
  { ticker: "WFC", name: "Wells Fargo", sector: "Finance" },
  { ticker: "GS", name: "Goldman Sachs", sector: "Finance" },
  { ticker: "MS", name: "Morgan Stanley", sector: "Finance" },
  { ticker: "C", name: "Citigroup", sector: "Finance" },
  { ticker: "BLK", name: "BlackRock", sector: "Finance" },
  { ticker: "SCHW", name: "Charles Schwab", sector: "Finance" },
  { ticker: "AXP", name: "American Express", sector: "Finance" },
  { ticker: "V", name: "Visa", sector: "Finance" },
  { ticker: "MA", name: "Mastercard", sector: "Finance" },
  { ticker: "PYPL", name: "PayPal", sector: "Fintech" },
  { ticker: "BRK.B", name: "Berkshire Hathaway", sector: "Finance" },

  // Healthcare & Pharma
  { ticker: "UNH", name: "UnitedHealth Group", sector: "Healthcare" },
  { ticker: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
  { ticker: "LLY", name: "Eli Lilly", sector: "Pharma" },
  { ticker: "NVO", name: "Novo Nordisk", sector: "Pharma" },
  { ticker: "ABBV", name: "AbbVie", sector: "Pharma" },
  { ticker: "MRK", name: "Merck", sector: "Pharma" },
  { ticker: "PFE", name: "Pfizer", sector: "Pharma" },
  { ticker: "TMO", name: "Thermo Fisher Scientific", sector: "Healthcare" },
  { ticker: "ABT", name: "Abbott Laboratories", sector: "Healthcare" },
  { ticker: "BMY", name: "Bristol-Myers Squibb", sector: "Pharma" },
  { ticker: "AMGN", name: "Amgen", sector: "Biotech" },
  { ticker: "GILD", name: "Gilead Sciences", sector: "Biotech" },
  { ticker: "MRNA", name: "Moderna", sector: "Biotech" },
  { ticker: "ISRG", name: "Intuitive Surgical", sector: "Healthcare" },

  // Consumer
  { ticker: "WMT", name: "Walmart", sector: "Retail" },
  { ticker: "COST", name: "Costco", sector: "Retail" },
  { ticker: "HD", name: "Home Depot", sector: "Retail" },
  { ticker: "TGT", name: "Target", sector: "Retail" },
  { ticker: "LOW", name: "Lowe's", sector: "Retail" },
  { ticker: "NKE", name: "Nike", sector: "Consumer" },
  { ticker: "SBUX", name: "Starbucks", sector: "Consumer" },
  { ticker: "MCD", name: "McDonald's", sector: "Consumer" },
  { ticker: "KO", name: "Coca-Cola", sector: "Consumer" },
  { ticker: "PEP", name: "PepsiCo", sector: "Consumer" },
  { ticker: "PG", name: "Procter & Gamble", sector: "Consumer" },
  { ticker: "CL", name: "Colgate-Palmolive", sector: "Consumer" },
  { ticker: "EL", name: "Estée Lauder", sector: "Consumer" },
  { ticker: "LULU", name: "Lululemon Athletica", sector: "Consumer" },

  // Energy
  { ticker: "XOM", name: "Exxon Mobil", sector: "Energy" },
  { ticker: "CVX", name: "Chevron", sector: "Energy" },
  { ticker: "COP", name: "ConocoPhillips", sector: "Energy" },
  { ticker: "SLB", name: "Schlumberger", sector: "Energy" },
  { ticker: "EOG", name: "EOG Resources", sector: "Energy" },

  // Industrial
  { ticker: "CAT", name: "Caterpillar", sector: "Industrial" },
  { ticker: "DE", name: "Deere & Company", sector: "Industrial" },
  { ticker: "BA", name: "Boeing", sector: "Aerospace" },
  { ticker: "LMT", name: "Lockheed Martin", sector: "Defense" },
  { ticker: "RTX", name: "RTX (Raytheon)", sector: "Defense" },
  { ticker: "GE", name: "GE Aerospace", sector: "Industrial" },
  { ticker: "HON", name: "Honeywell", sector: "Industrial" },
  { ticker: "UPS", name: "United Parcel Service", sector: "Logistics" },
  { ticker: "FDX", name: "FedEx", sector: "Logistics" },
  { ticker: "UNP", name: "Union Pacific", sector: "Rail" },

  // Telecom
  { ticker: "T", name: "AT&T", sector: "Telecom" },
  { ticker: "VZ", name: "Verizon", sector: "Telecom" },
  { ticker: "TMUS", name: "T-Mobile US", sector: "Telecom" },

  // Real Estate
  { ticker: "AMT", name: "American Tower", sector: "REIT" },
  { ticker: "PLD", name: "Prologis", sector: "REIT" },
  { ticker: "SPG", name: "Simon Property Group", sector: "REIT" },

  // ETFs (popular)
  { ticker: "SPY", name: "S&P 500 ETF", sector: "ETF" },
  { ticker: "QQQ", name: "Nasdaq 100 ETF", sector: "ETF" },
  { ticker: "IWM", name: "Russell 2000 ETF", sector: "ETF" },
  { ticker: "DIA", name: "Dow Jones ETF", sector: "ETF" },
  { ticker: "VTI", name: "Total Stock Market ETF", sector: "ETF" },
  { ticker: "VOO", name: "Vanguard S&P 500 ETF", sector: "ETF" },
  { ticker: "ARKK", name: "ARK Innovation ETF", sector: "ETF" },
  { ticker: "XLF", name: "Financial Select ETF", sector: "ETF" },
  { ticker: "XLK", name: "Technology Select ETF", sector: "ETF" },
  { ticker: "XLE", name: "Energy Select ETF", sector: "ETF" },

  // Crypto-related
  { ticker: "MSTR", name: "MicroStrategy", sector: "Crypto" },
  { ticker: "MARA", name: "Marathon Digital", sector: "Crypto" },
  { ticker: "RIOT", name: "Riot Platforms", sector: "Crypto" },

  // AI / High-growth
  { ticker: "AI", name: "C3.ai", sector: "AI" },
  { ticker: "PATH", name: "UiPath", sector: "AI" },
  { ticker: "IONQ", name: "IonQ", sector: "Quantum" },
  { ticker: "RGTI", name: "Rigetti Computing", sector: "Quantum" },
  { ticker: "SOUN", name: "SoundHound AI", sector: "AI" },

  // Auto
  { ticker: "F", name: "Ford Motor", sector: "Auto" },
  { ticker: "GM", name: "General Motors", sector: "Auto" },
  { ticker: "RIVN", name: "Rivian Automotive", sector: "Auto" },
  { ticker: "LCID", name: "Lucid Group", sector: "Auto" },
  { ticker: "TM", name: "Toyota Motor", sector: "Auto" },

  // Travel & Hospitality
  { ticker: "MAR", name: "Marriott International", sector: "Hospitality" },
  { ticker: "HLT", name: "Hilton Worldwide", sector: "Hospitality" },
  { ticker: "BKNG", name: "Booking Holdings", sector: "Travel" },
  { ticker: "EXPE", name: "Expedia Group", sector: "Travel" },
  { ticker: "DAL", name: "Delta Air Lines", sector: "Airlines" },
  { ticker: "UAL", name: "United Airlines", sector: "Airlines" },
  { ticker: "LUV", name: "Southwest Airlines", sector: "Airlines" },

  // Gaming & Entertainment
  { ticker: "ATVI", name: "Activision Blizzard", sector: "Gaming" },
  { ticker: "EA", name: "Electronic Arts", sector: "Gaming" },
  { ticker: "TTWO", name: "Take-Two Interactive", sector: "Gaming" },
  { ticker: "RBLX", name: "Roblox", sector: "Gaming" },
  { ticker: "U", name: "Unity Software", sector: "Gaming" },

  // Other notable
  { ticker: "ANET", name: "Arista Networks", sector: "Networking" },
  { ticker: "DELL", name: "Dell Technologies", sector: "Tech" },
  { ticker: "HPE", name: "Hewlett Packard Enterprise", sector: "Tech" },
  { ticker: "VMW", name: "VMware", sector: "Tech" },
  { ticker: "WDAY", name: "Workday", sector: "Tech" },
  { ticker: "ZM", name: "Zoom Video", sector: "Tech" },
  { ticker: "DOCU", name: "DocuSign", sector: "Tech" },
  { ticker: "OKTA", name: "Okta", sector: "Tech" },
  { ticker: "MDB", name: "MongoDB", sector: "Tech" },
  { ticker: "TEAM", name: "Atlassian", sector: "Tech" },
  { ticker: "HUBS", name: "HubSpot", sector: "Tech" },
  { ticker: "VEEV", name: "Veeva Systems", sector: "Tech" },
  { ticker: "TTD", name: "The Trade Desk", sector: "AdTech" },
  { ticker: "ROKU", name: "Roku", sector: "Media" },
  { ticker: "SQ", name: "Block", sector: "Fintech" },
  { ticker: "SOFI", name: "SoFi Technologies", sector: "Fintech" },
  { ticker: "AFRM", name: "Affirm Holdings", sector: "Fintech" },
  { ticker: "BILL", name: "Bill Holdings", sector: "Fintech" },
  { ticker: "LI", name: "Li Auto", sector: "EV" },
  { ticker: "NIO", name: "NIO", sector: "EV" },
  { ticker: "XPEV", name: "XPeng", sector: "EV" },
];

/**
 * Search tickers by company name or ticker symbol.
 * Returns matches sorted by relevance.
 */
export function searchTickers(query: string, limit = 8): TickerEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  // Exact ticker match gets highest priority
  const exactTicker = POPULAR_TICKERS.filter(
    (t) => t.ticker.toLowerCase() === q
  );

  // Ticker starts with query
  const tickerPrefix = POPULAR_TICKERS.filter(
    (t) =>
      t.ticker.toLowerCase().startsWith(q) &&
      t.ticker.toLowerCase() !== q
  );

  // Company name starts with query
  const namePrefix = POPULAR_TICKERS.filter(
    (t) =>
      t.name.toLowerCase().startsWith(q) &&
      !t.ticker.toLowerCase().startsWith(q)
  );

  // Company name contains query (word boundary)
  const nameContains = POPULAR_TICKERS.filter((t) => {
    const lower = t.name.toLowerCase();
    return (
      lower.includes(q) &&
      !lower.startsWith(q) &&
      !t.ticker.toLowerCase().startsWith(q)
    );
  });

  // Deduplicate and limit
  const seen = new Set<string>();
  const results: TickerEntry[] = [];
  for (const entry of [
    ...exactTicker,
    ...tickerPrefix,
    ...namePrefix,
    ...nameContains,
  ]) {
    if (!seen.has(entry.ticker)) {
      seen.add(entry.ticker);
      results.push(entry);
    }
    if (results.length >= limit) break;
  }

  return results;
}
