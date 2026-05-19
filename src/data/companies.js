export const COMPANIES = [
// ── TECHNOLOGY ──
// — Platform, Yazilim & Tuketici Technologysi —
{
  ticker: "AAPL",
  name: "Apple",
  full: "Apple Inc.",
  sector: "tech",
  price: 259.20,
  change: 1.34
}, {
  ticker: "MSFT",
  name: "Microsoft",
  full: "Microsoft Corp.",
  sector: "tech",
  price: 385.90,
  change: 0.87
}, {
  ticker: "AMZN",
  name: "Amazon",
  full: "Amazon.com Inc.",
  sector: "tech",
  price: 242.60,
  change: 0.56
}, {
  ticker: "NFLX",
  name: "Netflix",
  full: "Netflix Inc.",
  sector: "tech",
  price: 1038.50,
  change: 2.34
}, {
  ticker: "ORCL",
  name: "Oracle",
  full: "Oracle Corporation",
  sector: "tech",
  price: 202.30,
  change: 0.75
}, {
  ticker: "CRM",
  name: "Salesforce",
  full: "Salesforce Inc.",
  sector: "tech",
  price: 311.40,
  change: 0.98
}, {
  ticker: "ADBE",
  name: "Adobe",
  full: "Adobe Inc.",
  sector: "tech",
  price: 376.80,
  change: -0.34
}, {
  ticker: "SAP",
  name: "SAP",
  full: "SAP SE",
  sector: "tech",
  price: 264.70,
  change: 0.55
}, {
  ticker: "NOW",
  name: "ServiceNow",
  full: "ServiceNow Inc.",
  sector: "tech",
  price: 1076.20,
  change: 1.23
}, {
  ticker: "SHOP",
  name: "Shopify",
  full: "Shopify Inc.",
  sector: "tech",
  price: 96.80,
  change: 2.10
}, {
  ticker: "TCEHY",
  name: "Tencent",
  full: "Tencent Holdings Ltd.",
  sector: "tech",
  price: 58.40,
  change: 0.88
},
// — Otomasyon & Gelecek Konseptleri —
{
  ticker: "AAGNT",
  name: "Auto. Agents",
  full: "Autonomous Agents (Emerging)",
  sector: "tech",
  price: 18.40,
  change: 6.20,
  isPrivate: true
}, {
  ticker: "SLSVR",
  name: "Silicon Sov.",
  full: "Silicon Sovereignty Ltd.",
  sector: "tech",
  price: 12.80,
  change: 4.15,
  isPrivate: true
},
// — 3D / CAD / BIM / Design Yazilim —
{
  ticker: "ADSK",
  name: "Autodesk",
  full: "Autodesk Inc.",
  sector: "tech",
  price: 284.50,
  change: 0.44
}, {
  ticker: "DASTY",
  name: "Dassault Sys.",
  full: "Dassault Systèmes SE",
  sector: "tech",
  price: 38.40,
  change: 0.21
}, {
  ticker: "SIEGY",
  name: "Siemens Dig.",
  full: "Siemens Digital Industries",
  sector: "tech",
  price: 96.20,
  change: 0.67,
  isPrivate: true
}, {
  ticker: "PTC",
  name: "PTC",
  full: "PTC Inc.",
  sector: "tech",
  price: 196.80,
  change: 0.88
}, {
  ticker: "TRMB",
  name: "Trimble",
  full: "Trimble Inc.",
  sector: "tech",
  price: 65.40,
  change: -0.22
}, {
  ticker: "NEMKY",
  name: "Nemetschek",
  full: "Nemetschek Group SE",
  sector: "tech",
  price: 98.40,
  change: 1.05
}, {
  ticker: "BSY",
  name: "Bentley Sys.",
  full: "Bentley Systems Inc.",
  sector: "tech",
  price: 51.60,
  change: 0.63
}, {
  ticker: "GRPH",
  name: "Graphisoft",
  full: "Graphisoft SE (Nemetschek)",
  sector: "tech",
  price: 98.40,
  change: 0.90,
  isPrivate: true
}, {
  ticker: "CHAOS",
  name: "Chaos Group",
  full: "Chaos Group (V-Ray / Corona)",
  sector: "tech",
  price: 24.50,
  change: 1.40,
  isPrivate: true
}, {
  ticker: "EPIC",
  name: "Epic Games",
  full: "Epic Games (Unreal Engine)",
  sector: "tech",
  price: 82.00,
  change: 2.20,
  isPrivate: true
}, {
  ticker: "MCNL",
  name: "McNeel",
  full: "McNeel & Assoc. (Rhino3D)",
  sector: "tech",
  price: 8.60,
  change: 0.80,
  isPrivate: true
}, {
  ticker: "SH3D",
  name: "Shapr3D",
  full: "Shapr3D / Bentley Systems",
  sector: "tech",
  price: 14.20,
  change: 3.10,
  isPrivate: true
},
// — Large Platform & Hardware Companies —
{
  ticker: "NVDA",
  name: "NVIDIA",
  full: "NVIDIA Corporation (GPU · Hardware)",
  sector: "tech",
  price: 109.40,
  change: 2.15
}, {
  ticker: "GOOGL",
  name: "Google",
  full: "Alphabet / Google",
  sector: "tech",
  price: 162.90,
  change: -0.43
}, {
  ticker: "META",
  name: "Meta",
  full: "Meta Platforms Inc.",
  sector: "tech",
  price: 564.80,
  change: 1.12
}, {
  ticker: "PLTR",
  name: "Palantir",
  full: "Palantir Technologies (Veri · Analitik)",
  sector: "tech",
  price: 88.60,
  change: 3.42
},
// ── AI ──
{
  ticker: "OPENAI",
  name: "OpenAI",
  full: "OpenAI Inc. (GPT-4 · Sora · o1)",
  sector: "ai",
  price: 157.00,
  change: 4.20,
  ipoStatus: "ipo_rumor",
  ipoYear: 2026,
  ipoNote: "2026 IPO rumors are strong — Sam Altman occasionally denies it, but investor pressure is increasing",
  ipoVal: "$300B+"
}, {
  ticker: "ANTHR",
  name: "Anthropic",
  full: "Anthropic PBC (Claude)",
  sector: "ai",
  price: 61.50,
  change: 2.87,
  ipoStatus: "private",
  ipoNote: "Amazon & Google investors. IPO is still early — focus is on safe AI research",
  ipoVal: "$61B"
}, {
  ticker: "PERPL",
  name: "Perplexity",
  full: "Perplexity AI (AI Search Engine)",
  sector: "ai",
  price: 32.40,
  change: 5.80,
  ipoStatus: "ipo_rumor",
  ipoYear: 2026,
  ipoNote: "Rapid growth, the groundwork for an IPO is forming",
  ipoVal: "$14B"
}, {
  ticker: "COHR",
  name: "Cohere",
  full: "Cohere Inc. (Corporate LLM)",
  sector: "ai",
  price: 24.80,
  change: 3.10,
  ipoStatus: "private",
  ipoNote: "Corporate-focused, IPO probability 2027+",
  ipoVal: "$5B"
}, {
  ticker: "HGF",
  name: "Hugging Face",
  full: "Hugging Face (AI Hub & Tools)",
  sector: "ai",
  price: 44.50,
  change: 2.65,
  ipoStatus: "ipo_rumor",
  ipoYear: 2027,
  ipoNote: "Critical infrastructure for the AI ecosystem — IPO looks inevitable",
  ipoVal: "$4.5B"
}, {
  ticker: "GLEAN",
  name: "Glean",
  full: "Glean (Corporate AI Search)",
  sector: "ai",
  price: 18.60,
  change: 4.40,
  ipoStatus: "ipo_prep",
  ipoYear: 2026,
  ipoNote: "Reported start of IPO preparation at the end of 2025",
  ipoVal: "$4.6B"
}, {
  ticker: "MISTR",
  name: "Mistral AI",
  full: "Mistral AI (Open Source LLM · FR)",
  sector: "ai",
  price: 28.20,
  change: 3.75,
  ipoStatus: "private",
  ipoNote: "A symbol of Europe’s AI independence. IPO is still early",
  ipoVal: "$6B"
}, {
  ticker: "DEEPSK",
  name: "DeepSeek",
  full: "DeepSeek (R1 · V3 · China AI Lab)",
  sector: "ai",
  price: 38.80,
  change: 6.90,
  ipoStatus: "private",
  ipoNote: "State-linked China structure — international IPO probability is very low",
  ipoVal: "N/A"
}, {
  ticker: "BAICHN",
  name: "Baichuan AI",
  full: "Baichuan AI (Baichuan-2 · LLM)",
  sector: "ai",
  price: 14.60,
  change: 2.30,
  ipoStatus: "ipo_rumor",
  ipoYear: 2027,
  ipoNote: "Planning a listing on China’s stock exchange",
  ipoVal: "$2B+"
}, {
  ticker: "ZHIPU",
  name: "Zhipu AI",
  full: "Zhipu AI (GLM-4 · ChatGLM)",
  sector: "ai",
  price: 12.40,
  change: 1.95,
  ipoStatus: "ipo_prep",
  ipoYear: 2026,
  ipoNote: "STAR Market (Shanghai) IPO application preparation stage",
  ipoVal: "$2.5B"
}, {
  ticker: "KIMI",
  name: "Moonshot AI",
  full: "Moonshot AI (Kimi Assistant)",
  sector: "ai",
  price: 22.80,
  change: 4.15,
  ipoStatus: "private",
  ipoNote: "China’s fastest-growing AI startup, not yet IPO — not on the agenda",
  ipoVal: "$3.3B"
}, {
  ticker: "XAI",
  name: "xAI",
  full: "xAI Corp. (Grok · Elon Musk)",
  sector: "ai",
  price: 44.80,
  change: 5.13,
  ipoStatus: "ipo_rumor",
  ipoYear: 2027,
  ipoNote: "Elon Musk IPO'yu surekli keeps delaying — X ile birlesme senaryolari var",
  ipoVal: "$50B"
},
// ── KRIPTO & BLOCKCHAIN ECOSYSTEM ──
// — Exchanges & Trading Platforms —
{
  ticker: "COIN",
  name: "Coinbase",
  full: "Coinbase Global Inc.",
  sector: "crypto",
  price: 276.80,
  change: -2.14
}, {
  ticker: "BNB",
  name: "Binance",
  full: "Binance Holdings Ltd.",
  sector: "crypto",
  price: 92.40,
  change: 1.85,
  isPrivate: true
}, {
  ticker: "OKX",
  name: "OKX",
  full: "OKX (OKCoin / OKGroup)",
  sector: "crypto",
  price: 48.60,
  change: 0.92,
  isPrivate: true
}, {
  ticker: "BYBIT",
  name: "Bybit",
  full: "Bybit (ByteTrade Lab)",
  sector: "crypto",
  price: 38.20,
  change: 1.44,
  isPrivate: true
}, {
  ticker: "KRKN",
  name: "Kraken",
  full: "Payward Inc. (Kraken)",
  sector: "crypto",
  price: 28.50,
  change: 0.73,
  isPrivate: true
},
// — Altyapi & Odeme —
{
  ticker: "SQ",
  name: "Block",
  full: "Block Inc. (Square/Cash App)",
  sector: "crypto",
  price: 68.40,
  change: 1.22
}, {
  ticker: "BITPAY",
  name: "BitPay",
  full: "BitPay Inc.",
  sector: "crypto",
  price: 14.80,
  change: 0.55,
  isPrivate: true
}, {
  ticker: "MOONP",
  name: "MoonPay",
  full: "MoonPay International",
  sector: "crypto",
  price: 22.60,
  change: 2.30,
  isPrivate: true
},
// — Stablecoin & Para —
{
  ticker: "USDT",
  name: "Tether",
  full: "Tether Holdings Ltd.",
  sector: "crypto",
  price: 1.00,
  change: 0.01,
  isPrivate: true
}, {
  ticker: "USDC",
  name: "Circle",
  full: "Circle Internet Group",
  sector: "crypto",
  price: 18.40,
  change: 0.88,
  isPrivate: true
},
// — Ag / Protokol —
{
  ticker: "XRP",
  name: "Ripple",
  full: "Ripple Labs Inc.",
  sector: "crypto",
  price: 2.48,
  change: 3.12,
  isPrivate: true
}, {
  ticker: "LINK",
  name: "Chainlink",
  full: "Chainlink (SmartContract Labs)",
  sector: "crypto",
  price: 14.20,
  change: 2.45
}, {
  ticker: "MATIC",
  name: "Polygon",
  full: "Polygon Labs (MATIC)",
  sector: "crypto",
  price: 0.42,
  change: -1.80,
  isPrivate: true
}, {
  ticker: "AVAX",
  name: "Ava Labs",
  full: "Ava Labs (Avalanche)",
  sector: "crypto",
  price: 22.80,
  change: 1.95,
  isPrivate: true
},
// — Corporate & Analitik —
{
  ticker: "MSTR",
  name: "MicroStrat.",
  full: "MicroStrategy (Strategy Inc.)",
  sector: "crypto",
  price: 348.20,
  change: -3.15
}, {
  ticker: "ALCMY",
  name: "Alchemy",
  full: "Alchemy Insights Inc.",
  sector: "crypto",
  price: 32.50,
  change: 2.80,
  isPrivate: true
}, {
  ticker: "FBLKS",
  name: "Fireblocks",
  full: "Fireblocks Ltd.",
  sector: "crypto",
  price: 48.00,
  change: 1.60,
  isPrivate: true
}, {
  ticker: "CHAIN",
  name: "Chainalysis",
  full: "Chainalysis Inc.",
  sector: "crypto",
  price: 36.80,
  change: 0.95,
  isPrivate: true
},
// — Donanim Cuzdan —
{
  ticker: "LEDGR",
  name: "Ledger",
  full: "Ledger SAS",
  sector: "crypto",
  price: 26.40,
  change: 1.15,
  isPrivate: true
},
// — Web3 Developer Ecosystem —
{
  ticker: "CNSYS",
  name: "ConsenSys",
  full: "ConsenSys (MetaMask / Infura)",
  sector: "crypto",
  price: 42.30,
  change: 3.40,
  isPrivate: true
},
// ── FOOD & ICECEK & RESTORAN ECOSYSTEM ──
// — Global Food Devleri —
{
  ticker: "NSRGY",
  name: "Nestlé",
  full: "Nestlé S.A.",
  sector: "food",
  price: 88.50,
  change: -0.31
}, {
  ticker: "UL",
  name: "Unilever",
  full: "Unilever PLC",
  sector: "food",
  price: 54.80,
  change: 0.42
}, {
  ticker: "KO",
  name: "Coca-Cola",
  full: "The Coca-Cola Company",
  sector: "food",
  price: 71.60,
  change: 0.18
}, {
  ticker: "PEP",
  name: "PepsiCo",
  full: "PepsiCo Inc.",
  sector: "food",
  price: 144.20,
  change: -0.55
}, {
  ticker: "MDLZ",
  name: "Mondelez",
  full: "Mondelez International Inc.",
  sector: "food",
  price: 52.40,
  change: -0.28
}, {
  ticker: "DANOY",
  name: "Danone",
  full: "Danone S.A.",
  sector: "food",
  price: 13.80,
  change: 0.35
}, {
  ticker: "HEINY",
  name: "Heineken",
  full: "Heineken N.V.",
  sector: "food",
  price: 34.60,
  change: -0.44
}, {
  ticker: "BUD",
  name: "AB InBev",
  full: "Anheuser-Busch InBev SA/NV",
  sector: "food",
  price: 54.90,
  change: 0.62
}, {
  ticker: "KHC",
  name: "Kraft Heinz",
  full: "The Kraft Heinz Company",
  sector: "food",
  price: 27.80,
  change: -0.90
}, {
  ticker: "GIS",
  name: "Gen. Mills",
  full: "General Mills Inc.",
  sector: "food",
  price: 54.20,
  change: -0.15
}, {
  ticker: "K",
  name: "Kellanova",
  full: "Kellanova (fmr. Kellogg's)",
  sector: "food",
  price: 80.40,
  change: 0.33
}, {
  ticker: "TSN",
  name: "Tyson Foods",
  full: "Tyson Foods Inc.",
  sector: "food",
  price: 57.30,
  change: 0.78
},
// — Tarim & Emtia —
{
  ticker: "ADM",
  name: "ADM",
  full: "Archer Daniels Midland Co.",
  sector: "food",
  price: 44.60,
  change: -1.12
}, {
  ticker: "BG",
  name: "Bunge",
  full: "Bunge Global SA",
  sector: "food",
  price: 75.80,
  change: 0.44
}, {
  ticker: "WLMIY",
  name: "Wilmar",
  full: "Wilmar International Ltd.",
  sector: "food",
  price: 3.20,
  change: 0.55
}, {
  ticker: "ASBFY",
  name: "ABF",
  full: "Associated British Foods PLC",
  sector: "food",
  price: 27.40,
  change: 0.22
}, {
  ticker: "JBSAY",
  name: "JBS",
  full: "JBS S.A.",
  sector: "food",
  price: 9.10,
  change: 1.05
}, {
  ticker: "CARL",
  name: "Cargill",
  full: "Cargill Incorporated",
  sector: "food",
  price: 148.00,
  change: 0.30,
  isPrivate: true
}, {
  ticker: "MARS",
  name: "Mars Inc.",
  full: "Mars, Incorporated",
  sector: "food",
  price: 92.00,
  change: 0.45,
  isPrivate: true
}, {
  ticker: "LACT",
  name: "Lactalis",
  full: "Groupe Lactalis",
  sector: "food",
  price: 38.00,
  change: -0.20,
  isPrivate: true
}, {
  ticker: "LDCO",
  name: "L. Dreyfus",
  full: "Louis Dreyfus Company",
  sector: "food",
  price: 56.00,
  change: 0.18,
  isPrivate: true
}, {
  ticker: "OLAM",
  name: "Olam",
  full: "Olam International Ltd.",
  sector: "food",
  price: 1.42,
  change: 0.67,
  isPrivate: true
}, {
  ticker: "VITR",
  name: "Viterra",
  full: "Viterra / Glencore Agriculture",
  sector: "food",
  price: 24.50,
  change: 0.40,
  isPrivate: true
}, {
  ticker: "BCLN",
  name: "Barry Cal.",
  full: "Barry Callebaut AG",
  sector: "food",
  price: 1240.00,
  change: -0.60
}, {
  ticker: "CPFTH",
  name: "CP Foods",
  full: "Charoen Pokphand Foods PCL",
  sector: "food",
  price: 1.18,
  change: 0.92
},
// — Fast Food & Restoran Zincirleri —
{
  ticker: "MCD",
  name: "McDonald's",
  full: "McDonald's Corp.",
  sector: "food",
  price: 293.40,
  change: 0.23
}, {
  ticker: "SBUX",
  name: "Starbucks",
  full: "Starbucks Corporation",
  sector: "food",
  price: 87.60,
  change: 0.55
}, {
  ticker: "YUM",
  name: "Yum! Brands",
  full: "Yum! Brands (KFC·PizzaHut·Taco)",
  sector: "food",
  price: 131.80,
  change: 0.38
}, {
  ticker: "QSR",
  name: "RBI",
  full: "Restaurant Brands Intl. (BK·Pop.)",
  sector: "food",
  price: 64.20,
  change: -0.22
}, {
  ticker: "CMG",
  name: "Chipotle",
  full: "Chipotle Mexican Grill Inc.",
  sector: "food",
  price: 51.40,
  change: 1.45
}, {
  ticker: "DRI",
  name: "Darden",
  full: "Darden Restaurants Inc.",
  sector: "food",
  price: 157.80,
  change: 0.67
}, {
  ticker: "SUBWY",
  name: "Subway",
  full: "Subway Restaurants",
  sector: "food",
  price: 18.00,
  change: 0.10,
  isPrivate: true
},
// — B2B Yemek & Catering —
{
  ticker: "CMPGY",
  name: "Compass",
  full: "Compass Group PLC",
  sector: "food",
  price: 27.80,
  change: 0.30
}, {
  ticker: "SDXAY",
  name: "Sodexo",
  full: "Sodexo S.A.",
  sector: "food",
  price: 10.90,
  change: -0.18
}, {
  ticker: "ARMK",
  name: "Aramark",
  full: "Aramark Holdings Corp.",
  sector: "food",
  price: 31.60,
  change: 0.44
},
// —  TURKISH FOOD SECTOR (BIST & Private) —
{
  ticker: "ULKER",
  name: "Yeardiz/Countriesr",
  full: "Yeardiz Holding (Countriesr)",
  sector: "food",
  price: 6.20,
  change: 1.35,
  isPrivate: true
}, {
  ticker: "AGHOL",
  name: "Anadolu Gr.",
  full: "Anadolu Group Holding",
  sector: "food",
  price: 8.40,
  change: 0.88
}, {
  ticker: "ETIGD",
  name: "Eti Food",
  full: "Eti Food Industry ve Ticaret",
  sector: "food",
  price: 4.80,
  change: 0.65,
  isPrivate: true
}, {
  ticker: "TORKU",
  name: "Torku",
  full: "Konya Seker / Torku",
  sector: "food",
  price: 3.10,
  change: 0.42
}, {
  ticker: "SUTAS",
  name: "Sutas",
  full: "Sutas Sut Urunleri A.S.",
  sector: "food",
  price: 2.90,
  change: 0.78,
  isPrivate: true
}, {
  ticker: "PNSUT",
  name: "Pinar",
  full: "Yasar Holding / Pinar",
  sector: "food",
  price: 3.60,
  change: 1.10
}, {
  ticker: "ULUUN",
  name: "Ulusoy Un",
  full: "Ulusoy Un Industryi A.S.",
  sector: "food",
  price: 1.80,
  change: 0.55
}, {
  ticker: "BANVT",
  name: "Banvit",
  full: "Banvit Bandirma Vitaminli Yem",
  sector: "food",
  price: 2.40,
  change: 0.33
}, {
  ticker: "DOGCAY",
  name: "Dogus Cay",
  full: "Dogus Cay ve Food Group",
  sector: "food",
  price: 3.20,
  change: 0.70,
  isPrivate: true
}, {
  ticker: "SOLEN",
  name: "Solen",
  full: "Solen Cikolata Food Industry",
  sector: "food",
  price: 2.10,
  change: 0.48,
  isPrivate: true
}, {
  ticker: "TATGD",
  name: "Tat Food",
  full: "Tat Food Industry A.S.",
  sector: "food",
  price: 1.92,
  change: -0.30
}, {
  ticker: "TRBSA",
  name: "Trakya Bir.",
  full: "Trakya Birlik Yagli Tohumlar",
  sector: "food",
  price: 1.65,
  change: 0.22
}, {
  ticker: "ABAL",
  name: "Abalioglu",
  full: "Abalioglu Yag ve Sabun Industry",
  sector: "food",
  price: 1.48,
  change: 0.18
}, {
  ticker: "NAMET",
  name: "Namet",
  full: "Namet Food Industry ve Tic. A.S.",
  sector: "food",
  price: 2.30,
  change: 0.60,
  isPrivate: true
}, {
  ticker: "HSTVK",
  name: "Hastavuk",
  full: "Hastavuk Tavukculuk",
  sector: "food",
  price: 1.75,
  change: 0.40,
  isPrivate: true
}, {
  ticker: "SARKY",
  name: "Saray Bisk.",
  full: "Saray Biskuvi ve Food Industry",
  sector: "food",
  price: 1.55,
  change: 0.28
}, {
  ticker: "KSKNG",
  name: "Keskinoglu",
  full: "Keskinoglu Tavukculuk",
  sector: "food",
  price: 2.05,
  change: 0.52,
  isPrivate: true
}, {
  ticker: "ERISUN",
  name: "Eris Un",
  full: "Eris Un Industry ve Ticaret",
  sector: "food",
  price: 1.40,
  change: 0.15,
  isPrivate: true
}, {
  ticker: "BUNGTR",
  name: "Bunge Food",
  full: "Bunge Food (Bunge Global TR)",
  sector: "food",
  price: 2.60,
  change: 0.38,
  isPrivate: true
}, {
  ticker: "TABGD",
  name: "TAB Food",
  full: "TAB Food (Burger King TR op.)",
  sector: "food",
  price: 4.10,
  change: 0.95,
  isPrivate: true
},
// —  TURKISH COOPERATIVES & PUBLIC ORGANIZATIONS —
{
  ticker: "TARIS",
  name: "Taris",
  full: "Taris Zeytin ve Incir Co-op",
  sector: "food",
  price: 1.85,
  change: 0.32,
  isPrivate: true
}, {
  ticker: "CAYKR",
  name: "Caykur",
  full: "Caykur (Cay Operations Kur.)",
  sector: "food",
  price: 2.20,
  change: 0.28,
  isPrivate: true
}, {
  ticker: "MRMRB",
  name: "Marmarabirlik",
  full: "Marmarabirlik Zeytin Co-op",
  sector: "food",
  price: 1.60,
  change: 0.44,
  isPrivate: true
}, {
  ticker: "FISKO",
  name: "Fiskobirlik",
  full: "Fiskobirlik Findik Co-op",
  sector: "food",
  price: 1.95,
  change: 0.58,
  isPrivate: true
}, {
  ticker: "GULBR",
  name: "Gulbirlik",
  full: "Gulbirlik Gul & Gulyagi Co-op",
  sector: "food",
  price: 1.30,
  change: 0.22,
  isPrivate: true
}, {
  ticker: "KYSRSK",
  name: "Kayseri Sek.",
  full: "Kayseri Seker Fabrikasi A.S.",
  sector: "food",
  price: 2.45,
  change: 0.36
}, {
  ticker: "PANKB",
  name: "Pankobirlik",
  full: "Pankobirlik Seker Pancari Co-op",
  sector: "food",
  price: 1.75,
  change: 0.18,
  isPrivate: true
}, {
  ticker: "AOC",
  name: "AOC",
  full: "Ataturk Orman Ciftligi",
  sector: "food",
  price: 1.00,
  change: 0.00,
  isPrivate: true
}, {
  ticker: "ESK",
  name: "Et ve Sut K.",
  full: "Et ve Sut Institution (ESK)",
  sector: "food",
  price: 1.20,
  change: 0.05,
  isPrivate: true
}, {
  ticker: "TARKR",
  name: "Tarim Kredi",
  full: "Tarim Kredi Cooperatives",
  sector: "food",
  price: 1.40,
  change: 0.12,
  isPrivate: true
}, {
  ticker: "ANTBR",
  name: "Antbirlik",
  full: "Antbirlik Narenciye Co-op",
  sector: "food",
  price: 1.55,
  change: 0.30,
  isPrivate: true
},
// ══════════════════════════════════════
// ──  AEROSPACE (Airline + Producer) ──
// ══════════════════════════════════════

// — TICARI HAVAYOLLARI / AMERICA —
{
  ticker: "DAL",
  name: "Delta",
  full: "Delta Air Lines Inc.",
  sector: "aerospace",
  price: 48.20,
  change: 1.14
}, {
  ticker: "UAL",
  name: "United",
  full: "United Airlines Holdings",
  sector: "aerospace",
  price: 82.40,
  change: 0.78
}, {
  ticker: "AAL",
  name: "American",
  full: "American Airlines Group",
  sector: "aerospace",
  price: 12.60,
  change: -0.92
}, {
  ticker: "LUV",
  name: "Southwest",
  full: "Southwest Airlines Co.",
  sector: "aerospace",
  price: 28.40,
  change: 0.35
},
// — TICARI HAVAYOLLARI / EUROPE —
{
  ticker: "DLAKY",
  name: "Lufthansa",
  full: "Lufthansa Group",
  sector: "aerospace",
  price: 8.20,
  change: 0.52
}, {
  ticker: "AFKL",
  name: "Air France",
  full: "Air France-KLM Group",
  sector: "aerospace",
  price: 9.10,
  change: -0.33
}, {
  ticker: "ICAGY",
  name: "IAG",
  full: "IAG (British Airways & Iberia)",
  sector: "aerospace",
  price: 3.80,
  change: 0.67
}, {
  ticker: "RYAAY",
  name: "Ryanair",
  full: "Ryanair Holdings PLC",
  sector: "aerospace",
  price: 148.20,
  change: 1.22
},
// — COMMERCIAL AIRLINES / MIDDLE EAST & ASIA —
{
  ticker: "EMIRA",
  name: "Emirates",
  full: "Emirates Group",
  sector: "aerospace",
  price: 34.80,
  change: 0.90,
  isPrivate: true
}, {
  ticker: "THYAO",
  name: "Turkish H.Y.",
  full: "Turkish Hava Yollari A.O.",
  sector: "aerospace",
  price: 8.60,
  change: 1.45
}, {
  ticker: "QATAW",
  name: "Qatar A/W",
  full: "Qatar Airways",
  sector: "aerospace",
  price: 22.40,
  change: 0.44,
  isPrivate: true
}, {
  ticker: "CJNSY",
  name: "China South.",
  full: "China Southern Airlines",
  sector: "aerospace",
  price: 5.20,
  change: -0.28
}, {
  ticker: "AICHY",
  name: "Air China",
  full: "Air China Limited",
  sector: "aerospace",
  price: 5.80,
  change: 0.18
}, {
  ticker: "CHEAY",
  name: "China East.",
  full: "China Eastern Airlines",
  sector: "aerospace",
  price: 4.90,
  change: -0.15
}, {
  ticker: "LTM",
  name: "LATAM",
  full: "LATAM Airlines Group S.A.",
  sector: "aerospace",
  price: 9.40,
  change: 0.62
}, {
  ticker: "ALNPY",
  name: "ANA",
  full: "ANA Holdings (All Nippon A/W)",
  sector: "aerospace",
  price: 10.20,
  change: 0.30
}, {
  ticker: "SINGY",
  name: "Singapore A.",
  full: "Singapore Airlines Ltd.",
  sector: "aerospace",
  price: 14.60,
  change: 0.48
}, {
  ticker: "CPCAY",
  name: "Cathay Pac.",
  full: "Cathay Pacific Airways",
  sector: "aerospace",
  price: 8.90,
  change: 0.22
}, {
  ticker: "INDIG",
  name: "IndiGo",
  full: "InterGlobe Aviation (IndiGo)",
  sector: "aerospace",
  price: 28.40,
  change: 1.35
}, {
  ticker: "QUBSF",
  name: "Qantas",
  full: "Qantas Airways Limited",
  sector: "aerospace",
  price: 5.10,
  change: 0.44
},
// — UCAK & MOTOR PRODUCERSI —
{
  ticker: "EADSY2",
  name: "Airbus Tic.",
  full: "Airbus SE (Commercial Aircraft)",
  sector: "aerospace",
  price: 188.60,
  change: 0.82
}, {
  ticker: "BA2",
  name: "Boeing Tic.",
  full: "Boeing (Commercial Aircraft)",
  sector: "aerospace",
  price: 174.60,
  change: 1.05
}, {
  ticker: "ERBR",
  name: "Embraer",
  full: "Embraer S.A.",
  sector: "aerospace",
  price: 26.40,
  change: 1.28
}, {
  ticker: "BDRBF",
  name: "Bombardier",
  full: "Bombardier Inc.",
  sector: "aerospace",
  price: 96.20,
  change: 0.65
}, {
  ticker: "COMAC",
  name: "COMAC",
  full: "COMAC C919 (China)",
  sector: "aerospace",
  price: 18.00,
  change: 0.80,
  isPrivate: true
}, {
  ticker: "TXT",
  name: "Textron Av.",
  full: "Textron Aviation (Cessna & Beech)",
  sector: "aerospace",
  price: 82.40,
  change: 0.40
}, {
  ticker: "GLFST",
  name: "Gulfstream",
  full: "Gulfstream Aerospace",
  sector: "aerospace",
  price: 282.60,
  change: 0.38,
  isPrivate: true
}, {
  ticker: "PILTS",
  name: "Pilatus",
  full: "Pilatus Aircraft Ltd.",
  sector: "aerospace",
  price: 36.80,
  change: 0.55,
  isPrivate: true
}, {
  ticker: "DFLCN",
  name: "Dassault Fal.",
  full: "Dassault Falcon Jet",
  sector: "aerospace",
  price: 248.40,
  change: 0.42,
  isPrivate: true
}, {
  ticker: "GEAD",
  name: "GE Aerospace",
  full: "GE Aerospace (Engine)",
  sector: "aerospace",
  price: 222.40,
  change: 1.10
}, {
  ticker: "SAFRY2",
  name: "Safran Eng.",
  full: "Safran S.A. (Motor / CFM56)",
  sector: "aerospace",
  price: 240.80,
  change: 0.92
}, {
  ticker: "RYCEY2",
  name: "Rolls-Royce",
  full: "Rolls-Royce Holdings (Motor)",
  sector: "aerospace",
  price: 7.80,
  change: 1.20
}, {
  ticker: "PRTWY",
  name: "Pratt & Wh.",
  full: "Pratt & Whitney (RTX Group)",
  sector: "aerospace",
  price: 134.20,
  change: 0.68,
  isPrivate: true
},
// — UZAY / NEW SPACE —
{
  ticker: "SPACEX3",
  name: "SpaceX",
  full: "SpaceX (Starlink & Starship)",
  sector: "aerospace",
  price: 210.00,
  change: 3.50,
  isPrivate: true
}, {
  ticker: "BORIGN",
  name: "Blue Origin",
  full: "Blue Origin LLC (Jeff Bezos)",
  sector: "aerospace",
  price: 42.00,
  change: 1.80,
  isPrivate: true
},
// ══════════════════════════════════
// ──  DEFENSE (Global Defense) ──
// ══════════════════════════════════

// — AMERICA —
{
  ticker: "BA",
  name: "Boeing Def.",
  full: "Boeing Defense, Space & Security",
  sector: "defense",
  price: 174.60,
  change: 1.05
}, {
  ticker: "LMT",
  name: "Lockheed",
  full: "Lockheed Martin Corp.",
  sector: "defense",
  price: 476.30,
  change: 0.67
}, {
  ticker: "RTX",
  name: "RTX / Ray.",
  full: "RTX Corp. (Raytheon & P&W)",
  sector: "defense",
  price: 134.20,
  change: 0.78
}, {
  ticker: "NOC",
  name: "Northrop",
  full: "Northrop Grumman Corp.",
  sector: "defense",
  price: 498.40,
  change: 0.55
}, {
  ticker: "GD",
  name: "Gen. Dynam.",
  full: "General Dynamics Corp.",
  sector: "defense",
  price: 282.60,
  change: 0.38
}, {
  ticker: "LHX",
  name: "L3Harris",
  full: "L3Harris Technologies Inc.",
  sector: "defense",
  price: 210.80,
  change: 0.72
}, {
  ticker: "HII",
  name: "Hunt. Ingalls",
  full: "Huntington Ingalls Industries",
  sector: "defense",
  price: 238.40,
  change: 0.44
}, {
  ticker: "LDOS",
  name: "Leidos",
  full: "Leidos Holdings Inc.",
  sector: "defense",
  price: 154.60,
  change: 0.88
}, {
  ticker: "BAH",
  name: "Booz Allen",
  full: "Booz Allen Hamilton Holding",
  sector: "defense",
  price: 148.20,
  change: 0.60
}, {
  ticker: "AVAV",
  name: "AeroVironment",
  full: "AeroVironment Inc.",
  sector: "defense",
  price: 178.40,
  change: 1.95
}, {
  ticker: "KTOS",
  name: "Kratos Def.",
  full: "Kratos Defense & Security",
  sector: "defense",
  price: 24.80,
  change: 2.15
}, {
  ticker: "CW",
  name: "Curtiss-Wright",
  full: "Curtiss-Wright Corporation",
  sector: "defense",
  price: 288.60,
  change: 0.72
}, {
  ticker: "TXT",
  name: "Textron Def.",
  full: "Textron Inc. (Defense & Aviation)",
  sector: "defense",
  price: 82.40,
  change: 0.40
}, {
  ticker: "PSN",
  name: "Parsons",
  full: "Parsons Corporation",
  sector: "defense",
  price: 82.10,
  change: 1.10
}, {
  ticker: "ANDR",
  name: "Anduril",
  full: "Anduril Industries",
  sector: "defense",
  price: 28.50,
  change: 3.40,
  isPrivate: true
},
// — EUROPE —
{
  ticker: "EADSY",
  name: "Airbus Def.",
  full: "Airbus Defence and Space",
  sector: "defense",
  price: 188.60,
  change: 0.82
}, {
  ticker: "BAESY",
  name: "BAE Systems",
  full: "BAE Systems PLC",
  sector: "defense",
  price: 16.40,
  change: 0.55
}, {
  ticker: "DASTY2",
  name: "Dassault Av.",
  full: "Dassault Aviation SA",
  sector: "defense",
  price: 248.40,
  change: 0.44
}, {
  ticker: "FINMY",
  name: "Leonardo",
  full: "Leonardo S.p.A.",
  sector: "defense",
  price: 32.60,
  change: 0.68
}, {
  ticker: "SAABF",
  name: "Saab",
  full: "Saab Group AB",
  sector: "defense",
  price: 36.20,
  change: 1.05
}, {
  ticker: "THLEF",
  name: "Thales",
  full: "Thales Group S.A.",
  sector: "defense",
  price: 18.40,
  change: 0.30
}, {
  ticker: "RNMBY",
  name: "Rheinmetall",
  full: "Rheinmetall AG",
  sector: "defense",
  price: 212.80,
  change: 2.45
}, {
  ticker: "HENS",
  name: "Hensoldt",
  full: "Hensoldt AG",
  sector: "defense",
  price: 44.60,
  change: 1.30
}, {
  ticker: "KOGS",
  name: "Kongsberg",
  full: "Kongsberg Gruppen AS",
  sector: "defense",
  price: 94.20,
  change: 1.80
}, {
  ticker: "ISDR",
  name: "Indra",
  full: "Indra Sistemas S.A.",
  sector: "defense",
  price: 21.80,
  change: 0.55
}, {
  ticker: "MTUAY",
  name: "MTU Aero",
  full: "MTU Aero Engines AG",
  sector: "defense",
  price: 278.40,
  change: 0.88
}, {
  ticker: "RYCEY",
  name: "Rolls-Royce",
  full: "Rolls-Royce Holdings (Defense)",
  sector: "defense",
  price: 7.80,
  change: 1.20
},
// — MIDDLE EAST & ASIA —
{
  ticker: "IAI",
  name: "IAI",
  full: "Israel Aerospace Industries",
  sector: "defense",
  price: 48.60,
  change: 0.88,
  isPrivate: true
}, {
  ticker: "ESLT",
  name: "Elbit Systems",
  full: "Elbit Systems Ltd.",
  sector: "defense",
  price: 278.40,
  change: 1.15
}, {
  ticker: "HNWHA",
  name: "Hanwha Aero.",
  full: "Hanwha Aerospace Co.",
  sector: "defense",
  price: 88.40,
  change: 2.10
}, {
  ticker: "MHVYF",
  name: "Mitsubishi H.",
  full: "Mitsubishi Heavy Industries",
  sector: "defense",
  price: 14.60,
  change: 0.75
}, {
  ticker: "KWHIY",
  name: "Kawasaki H.",
  full: "Kawasaki Heavy Industries",
  sector: "defense",
  price: 34.80,
  change: 0.65
}, {
  ticker: "BEL",
  name: "Bharat Elec.",
  full: "Bharat Electronics Ltd. (BEL)",
  sector: "defense",
  price: 2.92,
  change: 1.42
}, {
  ticker: "SGGKF",
  name: "ST Eng.",
  full: "ST Engineering (Singapore)",
  sector: "defense",
  price: 2.78,
  change: 0.55
}, {
  ticker: "IRKUT",
  name: "UAC/Sukhoi",
  full: "United Aircraft Corp. (UAC/MiG)",
  sector: "defense",
  price: 4.20,
  change: -0.45,
  isPrivate: true
},
// —  TURKISH DEFENSE INDUSTRY —
{
  ticker: "TUSAS",
  name: "TUSAS",
  full: "Turkish Aviation ve Space Industry",
  sector: "defense",
  price: 12.80,
  change: 2.40,
  isPrivate: true
}, {
  ticker: "BAYKT",
  name: "Baykar",
  full: "Baykar Technology (Bayraktar TB2)",
  sector: "defense",
  price: 18.60,
  change: 3.10,
  isPrivate: true
}, {
  ticker: "ASELS",
  name: "Aselsan",
  full: "Aselsan A.S.",
  sector: "defense",
  price: 4.48,
  change: 1.65
}, {
  ticker: "OTKAR",
  name: "Otokar",
  full: "Otokar Otomotiv ve Defense Industry",
  sector: "defense",
  price: 28.20,
  change: 0.88
}, {
  ticker: "SDTUZ",
  name: "SDT Space",
  full: "SDT Space ve Defense A.S.",
  sector: "defense",
  price: 6.40,
  change: 2.20,
  isPrivate: true
}, {
  ticker: "KATMR",
  name: "Katmerciler",
  full: "Katmerciler Vehicle-Mounted Equipment",
  sector: "defense",
  price: 3.85,
  change: 1.45
}, {
  ticker: "PAPIL",
  name: "Papilon",
  full: "Papilon Defense Industry ve Tic.",
  sector: "defense",
  price: 2.60,
  change: 1.80,
  isPrivate: true
},
// ══════════════════════════════════════════════════════
// ──  SEMICONDUCTOR ECOSYSTEM (Semiconductor Global) ──
// ══════════════════════════════════════════════════════

// —  FOUNDRY / PRODUCERS (Factory Owners) —
// Chip tasarlamaz, sadece uretir. En kritik halka.
{
  ticker: "TSM",
  name: "TSMC",
  full: "Taiwan Semiconductor Mfg. (N2/N3)",
  sector: "chip",
  price: 202.30,
  change: 1.78
}, {
  ticker: "SSNLF2",
  name: "Samsung Semi.",
  full: "Samsung Electronics (Memory+Foundry)",
  sector: "chip",
  price: 44.80,
  change: -0.62
},
// — ·  FABLESS TASARIMCILAR (Production yapmaz, tasarlar) —
// Sadece IP ve tasarim — en high marjli is modeli.
{
  ticker: "AVGO2",
  name: "Broadcom",
  full: "Broadcom Inc. (Network · RF · DSP)",
  sector: "chip",
  price: 248.60,
  change: 1.87
}, {
  ticker: "AMD3",
  name: "AMD",
  full: "AMD (CPU · GPU · EPYC Server)",
  sector: "chip",
  price: 142.50,
  change: 1.93
}, {
  ticker: "QCOM",
  name: "Qualcomm",
  full: "Qualcomm (Snapdragon · 5G Modem)",
  sector: "chip",
  price: 162.40,
  change: 0.88
}, {
  ticker: "ARM",
  name: "Arm Holdings",
  full: "Arm Holdings PLC (CPU Mimarisi)",
  sector: "chip",
  price: 98.60,
  change: 2.44
}, {
  ticker: "MRVL",
  name: "Marvell Tech.",
  full: "Marvell Technology (Data Infra.)",
  sector: "chip",
  price: 72.40,
  change: 1.55
}, {
  ticker: "MTKY",
  name: "MediaTek",
  full: "MediaTek Inc. (Mobil SoC)",
  sector: "chip",
  price: 28.60,
  change: 1.20
},
// —  EDA SOFTWARE (Chip Design Tools) —
// Chip tasarlanmadan once bu yazilimlar olmak zorunda.
// Oligopoly market - only 2 dominant players.
{
  ticker: "CDNS",
  name: "Cadence",
  full: "Cadence Design Systems (Virtuoso)",
  sector: "chip",
  price: 298.40,
  change: 0.75
}, {
  ticker: "SNPS",
  name: "Synopsys",
  full: "Synopsys Inc. (Design Compiler)",
  sector: "chip",
  price: 488.20,
  change: 0.62
},
// — ⚙️ EKIPMAN PRODUCERSI (Chip Fabrikasinin Aletleri) —
// Chip factories use these companies’ machines.
// ASML = tek EUV litografi kaynagi → global tekel.
{
  ticker: "ASML",
  name: "ASML",
  full: "ASML Holding (EUV Litografi)",
  sector: "chip",
  price: 742.50,
  change: 1.12
}, {
  ticker: "AMAT",
  name: "Appl. Materials",
  full: "Applied Materials (CVD · PVD · Etch)",
  sector: "chip",
  price: 198.60,
  change: 1.34
}, {
  ticker: "LRCX",
  name: "Lam Research",
  full: "Lam Research (Etch · Deposition)",
  sector: "chip",
  price: 982.40,
  change: 1.05
}, {
  ticker: "KLAC",
  name: "KLA Corp.",
  full: "KLA Corporation (Muayene Sistemleri)",
  sector: "chip",
  price: 888.20,
  change: 0.92
}, {
  ticker: "TOELY",
  name: "Tokyo Electron",
  full: "Tokyo Electron Ltd. (TEL)",
  sector: "chip",
  price: 148.60,
  change: 0.78
}, {
  ticker: "LSRCY",
  name: "Lasertec",
  full: "Lasertec Corp. (EUV Maske Muayene)",
  sector: "chip",
  price: 92.40,
  change: 1.45
}, {
  ticker: "ENTG",
  name: "Entegris",
  full: "Entegris Inc. (Chemical Materials)",
  sector: "chip",
  price: 98.20,
  change: 0.88
},
// —  TEST & MEASUREMENT EQUIPMENT —
// Uretilen cipin test edilmesi — kalite kontrol halkasi.
{
  ticker: "AEIS2",
  name: "Advantest",
  full: "Advantest Corp. (SoC Test Sistemleri)",
  sector: "chip",
  price: 62.40,
  change: 1.88
}, {
  ticker: "TER",
  name: "Teradyne",
  full: "Teradyne Inc. (Automated Test Equipment)",
  sector: "chip",
  price: 118.80,
  change: 0.55
},
// —  MEMORY / STORAGE (Memory & Storage) —
// En dongusel alt sector — arz/talep dengesi fiyati ucurur.
{
  ticker: "MU",
  name: "Micron",
  full: "Micron Technology (DRAM · NAND)",
  sector: "chip",
  price: 98.40,
  change: 1.42
}, {
  ticker: "HXSCL",
  name: "SK Hynix",
  full: "SK Hynix (HBM · DRAM · NAND)",
  sector: "chip",
  price: 38.20,
  change: 2.10
}, {
  ticker: "WDC",
  name: "Western Dig.",
  full: "Western Digital (NAND · HDD)",
  sector: "chip",
  price: 48.60,
  change: -0.88
}, {
  ticker: "KIOXIA",
  name: "Kioxia",
  full: "Kioxia Holdings (NAND Flash)",
  sector: "chip",
  price: 18.40,
  change: 1.20,
  isPrivate: true
},
// —  ANALOG & MIXED SIGNAL (Power + Sensor + Otomotiv) —
// Digital cipler kadar goz alici degil ama her yerde var.
// Privatelikle EV, IoT, endustri icin kritik.
{
  ticker: "TXN",
  name: "Texas Instr.",
  full: "Texas Instruments (Analog · Embedded)",
  sector: "chip",
  price: 188.40,
  change: 0.44
}, {
  ticker: "ADI",
  name: "Analog Devices",
  full: "Analog Devices Inc. (ADC · DAC · RF)",
  sector: "chip",
  price: 218.60,
  change: 0.62
}, {
  ticker: "MCHP",
  name: "Microchip Tech.",
  full: "Microchip Technology (MCU · FPGA)",
  sector: "chip",
  price: 62.80,
  change: -0.55
}, {
  ticker: "IFNNY",
  name: "Infineon",
  full: "Infineon Technologies (SiC · IGBT)",
  sector: "chip",
  price: 38.40,
  change: 0.78
}, {
  ticker: "NXPI",
  name: "NXP Semi.",
  full: "NXP Semiconductors (Otomotiv · IoT)",
  sector: "chip",
  price: 208.40,
  change: 0.55
}, {
  ticker: "STM",
  name: "STMicro.",
  full: "STMicroelectronics N.V.",
  sector: "chip",
  price: 28.60,
  change: -0.42
}, {
  ticker: "ON",
  name: "Onsemi",
  full: "Onsemi (SiC · IGBT · Power Electronics)",
  sector: "chip",
  price: 42.80,
  change: 1.15
}, {
  ticker: "RNEZY",
  name: "Renesas",
  full: "Renesas Electronics (MCU · SoC)",
  sector: "chip",
  price: 22.40,
  change: 0.38
}, {
  ticker: "WOLF",
  name: "Wolfspeed",
  full: "Wolfspeed Inc. (SiC Wide Bandgap)",
  sector: "chip",
  price: 8.20,
  change: -2.40
},
// ══════════════════════════════════════════════════════
// ──  FINANCE ECOSYSTEM (Banking · Asset Mgmt · Payments · Insurance) ──
// ══════════════════════════════════════════════════════

// —  GLOBAL BANKING / AMERICA —
{
  ticker: "JPM",
  name: "JPMorgan",
  full: "JPMorgan Chase & Co.",
  sector: "finance",
  price: 238.40,
  change: 0.72
}, {
  ticker: "BAC",
  name: "Bank of Am.",
  full: "Bank of America Corp.",
  sector: "finance",
  price: 42.80,
  change: 0.55
}, {
  ticker: "WFC",
  name: "Wells Fargo",
  full: "Wells Fargo & Company",
  sector: "finance",
  price: 72.40,
  change: 0.38
}, {
  ticker: "C",
  name: "Citigroup",
  full: "Citigroup Inc.",
  sector: "finance",
  price: 68.20,
  change: -0.44
},
// —  GLOBAL BANKING / EUROPE —
{
  ticker: "HSBC",
  name: "HSBC",
  full: "HSBC Holdings PLC",
  sector: "finance",
  price: 48.60,
  change: 0.62
}, {
  ticker: "BNPQY",
  name: "BNP Paribas",
  full: "BNP Paribas S.A.",
  sector: "finance",
  price: 34.80,
  change: 0.28
}, {
  ticker: "SAN",
  name: "Santander",
  full: "Banco Santander S.A.",
  sector: "finance",
  price: 5.92,
  change: 0.88
}, {
  ticker: "UBSG",
  name: "UBS Group",
  full: "UBS Group AG",
  sector: "finance",
  price: 28.40,
  change: 0.44
}, {
  ticker: "RY",
  name: "RBC",
  full: "Royal Bank of Canada",
  sector: "finance",
  price: 122.40,
  change: 0.35
},
// —  GLOBAL BANKING / ASIA —
{
  ticker: "IDCBY",
  name: "ICBC",
  full: "ICBC (Ind. & Commercial Bank China)",
  sector: "finance",
  price: 9.20,
  change: 0.30
}, {
  ticker: "CICHY",
  name: "CCB",
  full: "China Construction Bank Corp.",
  sector: "finance",
  price: 7.80,
  change: 0.22
}, {
  ticker: "ACGBY",
  name: "Agri. Bank",
  full: "Agricultural Bank of China",
  sector: "finance",
  price: 6.40,
  change: 0.18
}, {
  ticker: "BACHF",
  name: "Bank of China",
  full: "Bank of China Limited",
  sector: "finance",
  price: 5.10,
  change: 0.15
}, {
  ticker: "MUFGY",
  name: "MUFG",
  full: "Mitsubishi UFJ Financial Group",
  sector: "finance",
  price: 11.80,
  change: 0.42
},
// —  INVESTMENT BANKING —
{
  ticker: "GS",
  name: "Goldman Sachs",
  full: "The Goldman Sachs Group Inc.",
  sector: "finance",
  price: 582.40,
  change: 0.95
}, {
  ticker: "MS",
  name: "Morgan Stanley",
  full: "Morgan Stanley",
  sector: "finance",
  price: 98.60,
  change: 0.68
},
// —  ASSET MANAGEMENT (Asset Management) —
{
  ticker: "BRK.B",
  name: "Berkshire",
  full: "Berkshire Hathaway Inc.",
  sector: "finance",
  price: 472.80,
  change: 0.12
}, {
  ticker: "BLK",
  name: "BlackRock",
  full: "BlackRock Inc. (iShares · Aladdin)",
  sector: "finance",
  price: 982.40,
  change: 0.88
}, {
  ticker: "STT",
  name: "State Street",
  full: "State Street Corporation (SSGA)",
  sector: "finance",
  price: 88.40,
  change: 0.44
}, {
  ticker: "NTRS",
  name: "Northern Trust",
  full: "Northern Trust Corporation",
  sector: "finance",
  price: 98.20,
  change: 0.30
}, {
  ticker: "BK",
  name: "BNY Mellon",
  full: "Bank of New York Mellon Corp.",
  sector: "finance",
  price: 72.80,
  change: 0.55
}, {
  ticker: "BEN",
  name: "Franklin Tem.",
  full: "Franklin Templeton (Franklin Res.)",
  sector: "finance",
  price: 22.40,
  change: -0.28
}, {
  ticker: "IVZ",
  name: "Invesco",
  full: "Invesco Ltd.",
  sector: "finance",
  price: 14.80,
  change: -0.44
}, {
  ticker: "TROW",
  name: "T. Rowe Price",
  full: "T. Rowe Price Group Inc.",
  sector: "finance",
  price: 112.40,
  change: 0.38
},
// —  PRIVATE EQUITY (Private Equity) —
{
  ticker: "BX",
  name: "Blackstone",
  full: "Blackstone Group Inc.",
  sector: "finance",
  price: 148.60,
  change: 1.22
}, {
  ticker: "KKR",
  name: "KKR & Co.",
  full: "KKR & Co. Inc.",
  sector: "finance",
  price: 128.40,
  change: 1.45
}, {
  ticker: "BAM",
  name: "Brookfield",
  full: "Brookfield Asset Management",
  sector: "finance",
  price: 52.80,
  change: 0.78
},
// —  PAYMENT SYSTEMS & FINTECH —
{
  ticker: "V",
  name: "Visa",
  full: "Visa Inc.",
  sector: "finance",
  price: 338.40,
  change: 0.55
}, {
  ticker: "MA",
  name: "Mastercard",
  full: "Mastercard Incorporated",
  sector: "finance",
  price: 548.60,
  change: 0.72
}, {
  ticker: "AXP",
  name: "Amex",
  full: "American Express Company",
  sector: "finance",
  price: 282.40,
  change: 0.44
}, {
  ticker: "PYPL",
  name: "PayPal",
  full: "PayPal Holdings Inc.",
  sector: "finance",
  price: 68.20,
  change: -0.55
}, {
  ticker: "FISV",
  name: "Fiserv",
  full: "Fiserv Inc.",
  sector: "finance",
  price: 188.40,
  change: 0.62
}, {
  ticker: "FIS",
  name: "FIS",
  full: "Fidelity National Info. Services",
  sector: "finance",
  price: 78.40,
  change: 0.35
}, {
  ticker: "ADYEN",
  name: "Adyen",
  full: "Adyen N.V.",
  sector: "finance",
  price: 188.20,
  change: 1.05
},
// —  FINANCIAL DATA & ANALYTICS —
{
  ticker: "SPGI",
  name: "S&P Global",
  full: "S&P Global Inc.",
  sector: "finance",
  price: 488.40,
  change: 0.68
}, {
  ticker: "MCO",
  name: "Moody's",
  full: "Moody's Corporation",
  sector: "finance",
  price: 488.80,
  change: 0.72
},
// —  INSURANCE —
{
  ticker: "ALV",
  name: "Allianz",
  full: "Allianz SE",
  sector: "finance",
  price: 312.40,
  change: 0.44
}, {
  ticker: "AXAHY",
  name: "AXA",
  full: "AXA S.A.",
  sector: "finance",
  price: 38.80,
  change: 0.28
}, {
  ticker: "PNGAY",
  name: "Ping An",
  full: "Ping An Insurance Group (China)",
  sector: "finance",
  price: 22.40,
  change: 0.55
}, {
  ticker: "CB",
  name: "Chubb",
  full: "Chubb Limited",
  sector: "finance",
  price: 282.40,
  change: 0.38
}, {
  ticker: "MET",
  name: "MetLife",
  full: "MetLife Inc.",
  sector: "finance",
  price: 72.80,
  change: 0.22
}, {
  ticker: "PRU",
  name: "Prudential",
  full: "Prudential Financial Inc.",
  sector: "finance",
  price: 98.40,
  change: 0.18
}, {
  ticker: "MMC",
  name: "Marsh & McL.",
  full: "Marsh & McLennan Companies",
  sector: "finance",
  price: 232.40,
  change: 0.55
}, {
  ticker: "MURGY",
  name: "Munich Re",
  full: "Munich Re (Munchener Ruck AG)",
  sector: "finance",
  price: 542.80,
  change: 0.62
},
// ══════════════════════════════════════
// ── OTOMOTIV SECTOR (GLOBAL) ──
// ══════════════════════════════════════

// — AMERICA —
{
  ticker: "TSLA",
  name: "Tesla",
  full: "Tesla Inc.",
  sector: "auto",
  price: 342.15,
  change: -1.87
}, {
  ticker: "GM",
  name: "Gen. Motors",
  full: "General Motors Co.",
  sector: "auto",
  price: 47.30,
  change: 0.54
}, {
  ticker: "F",
  name: "Ford",
  full: "Ford Motor Company",
  sector: "auto",
  price: 10.80,
  change: -0.92
}, {
  ticker: "RIVN",
  name: "Rivian",
  full: "Rivian Automotive",
  sector: "auto",
  price: 12.40,
  change: 2.11
}, {
  ticker: "FFIE",
  name: "Faraday Fut.",
  full: "Faraday Future EV",
  sector: "auto",
  price: 0.48,
  change: -4.30
}, {
  ticker: "RIDE",
  name: "Lordstown",
  full: "Lordstown Motors (delist)",
  sector: "auto",
  price: 0.12,
  change: -1.50,
  isPrivate: true
}, {
  ticker: "CADDY",
  name: "Cadillac",
  full: "Cadillac (GM Group)",
  sector: "auto",
  price: 52.10,
  change: 0.60,
  isPrivate: true
}, {
  ticker: "CHEVY",
  name: "Chevrolet",
  full: "Chevrolet (GM Group)",
  sector: "auto",
  price: 47.30,
  change: 0.54,
  isPrivate: true
}, {
  ticker: "GMC",
  name: "GMC",
  full: "GMC (GM Group)",
  sector: "auto",
  price: 47.30,
  change: 0.48,
  isPrivate: true
}, {
  ticker: "LINC",
  name: "Lincoln",
  full: "Lincoln (Ford Group)",
  sector: "auto",
  price: 10.80,
  change: -0.80,
  isPrivate: true
}, {
  ticker: "JEEP",
  name: "Jeep",
  full: "Jeep (Stellantis Group)",
  sector: "auto",
  price: 14.20,
  change: -1.10,
  isPrivate: true
},
// — EUROPE —
{
  ticker: "BMWYY",
  name: "BMW",
  full: "BMW Group",
  sector: "auto",
  price: 29.40,
  change: 0.33
}, {
  ticker: "MBGYY",
  name: "Mercedes",
  full: "Mercedes-Benz Group",
  sector: "auto",
  price: 12.80,
  change: -0.67
}, {
  ticker: "VWAGY",
  name: "Volkswagen",
  full: "Volkswagen AG",
  sector: "auto",
  price: 9.90,
  change: -1.23
}, {
  ticker: "RACE",
  name: "Ferrari",
  full: "Ferrari N.V.",
  sector: "auto",
  price: 422.60,
  change: 1.45
}, {
  ticker: "DRPRY",
  name: "Porsche",
  full: "Porsche AG",
  sector: "auto",
  price: 11.50,
  change: -0.42
}, {
  ticker: "RNLSY",
  name: "Renault",
  full: "Renault Group",
  sector: "auto",
  price: 12.10,
  change: 0.78
}, {
  ticker: "VLVLY",
  name: "Volvo",
  full: "Volvo Car AB",
  sector: "auto",
  price: 19.30,
  change: -0.55
}, {
  ticker: "ARGGY",
  name: "Aston Martin",
  full: "Aston Martin Lagonda",
  sector: "auto",
  price: 4.80,
  change: -2.10
}, {
  ticker: "AUDI",
  name: "Audi",
  full: "Audi AG (VW Group)",
  sector: "auto",
  price: 9.90,
  change: -1.15,
  isPrivate: true
}, {
  ticker: "LAMBO",
  name: "Lamborghini",
  full: "Lamborghini (VW/Audi)",
  sector: "auto",
  price: 9.90,
  change: -0.90,
  isPrivate: true
}, {
  ticker: "BENT",
  name: "Bentley",
  full: "Bentley (VW Group)",
  sector: "auto",
  price: 9.90,
  change: -0.75,
  isPrivate: true
}, {
  ticker: "RR",
  name: "Rolls Royce",
  full: "Rolls-Royce (BMW Group)",
  sector: "auto",
  price: 29.40,
  change: 0.28,
  isPrivate: true
}, {
  ticker: "OPEL",
  name: "Opel",
  full: "Opel (Stellantis Group)",
  sector: "auto",
  price: 14.20,
  change: -0.90,
  isPrivate: true
}, {
  ticker: "PEUG",
  name: "Peugeot",
  full: "Peugeot (Stellantis)",
  sector: "auto",
  price: 14.20,
  change: -1.05,
  isPrivate: true
}, {
  ticker: "CITR",
  name: "CitroÏ«n",
  full: "CitroÏ«n (Stellantis)",
  sector: "auto",
  price: 14.20,
  change: -0.88,
  isPrivate: true
}, {
  ticker: "FIAT",
  name: "Fiat",
  full: "Fiat (Stellantis Group)",
  sector: "auto",
  price: 14.20,
  change: -1.20,
  isPrivate: true
}, {
  ticker: "ALFA",
  name: "Alfa Romeo",
  full: "Alfa Romeo (Stellantis)",
  sector: "auto",
  price: 14.20,
  change: -0.65,
  isPrivate: true
}, {
  ticker: "MASR",
  name: "Maserati",
  full: "Maserati (Stellantis)",
  sector: "auto",
  price: 14.20,
  change: -1.80,
  isPrivate: true
}, {
  ticker: "LANC",
  name: "Lancia",
  full: "Lancia (Stellantis)",
  sector: "auto",
  price: 14.20,
  change: -0.40,
  isPrivate: true
}, {
  ticker: "SKOD",
  name: "Skoda",
  full: "Skoda Auto (VW Group)",
  sector: "auto",
  price: 9.90,
  change: -0.50,
  isPrivate: true
}, {
  ticker: "CUPR",
  name: "Cupra",
  full: "Cupra (VW/SEAT)",
  sector: "auto",
  price: 9.90,
  change: 0.30,
  isPrivate: true
}, {
  ticker: "DACI",
  name: "Dacia",
  full: "Dacia (Renault Group)",
  sector: "auto",
  price: 12.10,
  change: 0.60,
  isPrivate: true
}, {
  ticker: "BUGA",
  name: "Bugatti",
  full: "Bugatti (Rimac-Porsche)",
  sector: "auto",
  price: 11.50,
  change: 0.80,
  isPrivate: true
}, {
  ticker: "KOEN",
  name: "Koenigsegg",
  full: "Koenigsegg Automotive",
  sector: "auto",
  price: 38.00,
  change: 1.10,
  isPrivate: true
}, {
  ticker: "PAGA",
  name: "Pagani",
  full: "Pagani Automobili",
  sector: "auto",
  price: 42.00,
  change: 0.75,
  isPrivate: true
}, {
  ticker: "MCLA",
  name: "McLaren",
  full: "McLaren Automotive",
  sector: "auto",
  price: 28.50,
  change: -0.60,
  isPrivate: true
}, {
  ticker: "LOTC",
  name: "Lotus",
  full: "Lotus Cars (Geely)",
  sector: "auto",
  price: 3.10,
  change: 0.45,
  isPrivate: true
},
// — ASIA / JAPONYA & KORE —
{
  ticker: "TM",
  name: "Toyota",
  full: "Toyota Motor Corp.",
  sector: "auto",
  price: 198.70,
  change: -0.89
}, {
  ticker: "HYMTF",
  name: "Hyundai",
  full: "Hyundai Motor Co.",
  sector: "auto",
  price: 44.80,
  change: 0.72
}, {
  ticker: "KIMTF",
  name: "Kia",
  full: "Kia Corporation",
  sector: "auto",
  price: 52.30,
  change: 0.88
}, {
  ticker: "NSANY",
  name: "Nissan",
  full: "Nissan Motor Co.",
  sector: "auto",
  price: 6.90,
  change: -1.34
}, {
  ticker: "MZDAY",
  name: "Mazda",
  full: "Mazda Motor Corp.",
  sector: "auto",
  price: 7.80,
  change: 0.21
}, {
  ticker: "FUJHY",
  name: "Subaru",
  full: "Subaru Corporation",
  sector: "auto",
  price: 14.60,
  change: -0.43
}, {
  ticker: "ISUZY",
  name: "Isuzu",
  full: "Isuzu Motors Ltd.",
  sector: "auto",
  price: 14.20,
  change: 0.35
}, {
  ticker: "MSBHY",
  name: "Mitsubishi",
  full: "Mitsubishi Motors",
  sector: "auto",
  price: 9.50,
  change: -0.67
}, {
  ticker: "GNSS",
  name: "Genesis",
  full: "Genesis (Hyundai Group)",
  sector: "auto",
  price: 44.80,
  change: 0.65,
  isPrivate: true
}, {
  ticker: "LEXS",
  name: "Lexus",
  full: "Lexus (Toyota Group)",
  sector: "auto",
  price: 198.70,
  change: -0.80,
  isPrivate: true
}, {
  ticker: "ACUR",
  name: "Acura",
  full: "Acura (Honda Group)",
  sector: "auto",
  price: 36.40,
  change: 0.30,
  isPrivate: true
}, {
  ticker: "INFI",
  name: "Infiniti",
  full: "Infiniti (Nissan/Renault)",
  sector: "auto",
  price: 6.90,
  change: -1.10,
  isPrivate: true
}, {
  ticker: "MSTU",
  name: "Maruti Suzuki",
  full: "Maruti Suzuki India",
  sector: "auto",
  price: 140.50,
  change: 0.95
}, {
  ticker: "MAHM",
  name: "Mahindra",
  full: "Mahindra & Mahindra",
  sector: "auto",
  price: 34.80,
  change: 1.42
}, {
  ticker: "JLRTY",
  name: "Land Rover",
  full: "Land Rover (Tata JLR)",
  sector: "auto",
  price: 21.40,
  change: -0.55,
  isPrivate: true
}, {
  ticker: "JGRY",
  name: "Jaguar",
  full: "Jaguar (Tata JLR)",
  sector: "auto",
  price: 21.40,
  change: -0.70,
  isPrivate: true
}, {
  ticker: "SMRT",
  name: "Smart",
  full: "Smart (Daimler+Geely JV)",
  sector: "auto",
  price: 3.10,
  change: 1.80,
  isPrivate: true
},
// — CIN & ASIA ELEKTRIKLI ──
{
  ticker: "BYDDF",
  name: "BYD",
  full: "BYD Co. Ltd.",
  sector: "auto",
  price: 36.20,
  change: 2.45
}, {
  ticker: "XIOMI",
  name: "Xiaomi",
  full: "Xiaomi Auto (EV)",
  sector: "auto",
  price: 3.20,
  change: 3.78
}, {
  ticker: "SERES",
  name: "Seres",
  full: "Seres Group (AITO)",
  sector: "auto",
  price: 18.40,
  change: 1.95
}, {
  ticker: "GELYY",
  name: "Geely",
  full: "Geely Automobile",
  sector: "auto",
  price: 3.10,
  change: 0.87
}, {
  ticker: "ZK",
  name: "Zeekr",
  full: "Zeekr (Geely Group)",
  sector: "auto",
  price: 24.80,
  change: 4.12
}, {
  ticker: "LEAP",
  name: "Leapmotor",
  full: "Leapmotor (Stellantis+)",
  sector: "auto",
  price: 8.30,
  change: 2.60
}, {
  ticker: "LCID",
  name: "Lucid Motors",
  full: "Lucid Group Inc.",
  sector: "auto",
  price: 2.48,
  change: -1.90
}, {
  ticker: "GWLLY",
  name: "GWM",
  full: "Great Wall Motor Co.",
  sector: "auto",
  price: 2.10,
  change: 1.15
}, {
  ticker: "AVTR",
  name: "Avatr",
  full: "Avatr (Changan+Huawei)",
  sector: "auto",
  price: 26.50,
  change: 3.30,
  isPrivate: true
}, {
  ticker: "IMMOT",
  name: "IM Motors",
  full: "IM Motors (SAIC+Alibaba)",
  sector: "auto",
  price: 14.80,
  change: 1.75,
  isPrivate: true
}, {
  ticker: "CHERY",
  name: "Chery",
  full: "Chery Automobile",
  sector: "auto",
  price: 22.30,
  change: 0.65,
  isPrivate: true
}, {
  ticker: "CHANG",
  name: "Changan",
  full: "Changan Automobile",
  sector: "auto",
  price: 12.60,
  change: 0.90,
  isPrivate: true
}, {
  ticker: "MGMC",
  name: "MG",
  full: "MG Morris Garages (SAIC)",
  sector: "auto",
  price: 8.90,
  change: 1.20,
  isPrivate: true
}, {
  ticker: "HAVL",
  name: "Haval",
  full: "Haval (GWM Group)",
  sector: "auto",
  price: 2.10,
  change: 1.00,
  isPrivate: true
}, {
  ticker: "TANK",
  name: "Tank",
  full: "Tank (GWM Group)",
  sector: "auto",
  price: 2.10,
  change: 1.35,
  isPrivate: true
}, {
  ticker: "ORA",
  name: "Ora",
  full: "Ora (GWM Group)",
  sector: "auto",
  price: 2.10,
  change: 0.80,
  isPrivate: true
}, {
  ticker: "VOYA",
  name: "Voyah",
  full: "Voyah (Dongfeng Group)",
  sector: "auto",
  price: 16.40,
  change: 2.10,
  isPrivate: true
}, {
  ticker: "HQFAW",
  name: "Hongqi",
  full: "Hongqi (FAW Group)",
  sector: "auto",
  price: 18.70,
  change: 1.65,
  isPrivate: true
}, {
  ticker: "WULI",
  name: "Wuling",
  full: "Wuling (SAIC-GM-Wuling)",
  sector: "auto",
  price: 4.50,
  change: 1.40,
  isPrivate: true
}, {
  ticker: "BAOJ",
  name: "Baojun",
  full: "Baojun (SAIC-GM-Wuling)",
  sector: "auto",
  price: 4.50,
  change: 0.95,
  isPrivate: true
}, {
  ticker: "JETO",
  name: "Jetour",
  full: "Jetour (Chery Group)",
  sector: "auto",
  price: 22.30,
  change: 0.55,
  isPrivate: true
}, {
  ticker: "JAEC",
  name: "Jaecoo",
  full: "Jaecoo (Chery Group)",
  sector: "auto",
  price: 22.30,
  change: 0.70,
  isPrivate: true
},
// — TOGG (TURKIYE) —
{
  ticker: "TOGG",
  name: "Togg",
  full: "Togg (Turkey EV)",
  sector: "auto",
  price: 8.20,
  change: 2.80,
  isPrivate: true
},
// ══════════════════════════════════════════════════════
// ──  PRECIOUS & SEMIPRECIOUS METALS (Metals & Mining) ──
// ══════════════════════════════════════════════════════

// —  GOLD (Gold) —
{
  ticker: "NEM",
  name: "Newmont",
  full: "Newmont Corporation (Gold Miningcisi · #1 Global)",
  sector: "metals",
  price: 42.80,
  change: 1.24
}, {
  ticker: "GOLD",
  name: "Barrick Gold",
  full: "Barrick Gold Corporation (Canada · 2. Large)",
  sector: "metals",
  price: 18.20,
  change: 0.92
}, {
  ticker: "AU",
  name: "AngloGold",
  full: "AngloGold Ashanti (G. Afrika · Global Gold)",
  sector: "metals",
  price: 28.40,
  change: 1.55
}, {
  ticker: "AEM",
  name: "Agnico Eagle",
  full: "Agnico Eagle Mines (Canada · Premium Gold)",
  sector: "metals",
  price: 82.40,
  change: 0.88
}, {
  ticker: "KGC",
  name: "Kinross Gold",
  full: "Kinross Gold Corporation (Canada)",
  sector: "metals",
  price: 9.80,
  change: 1.42
}, {
  ticker: "GFI",
  name: "Gold Fields",
  full: "Gold Fields Limited (G. Afrika · Global Mining)",
  sector: "metals",
  price: 18.60,
  change: 1.18
}, {
  ticker: "EGO",
  name: "Eldorado Gold",
  full: "Eldorado Gold Corporation (Turkey & Canada)",
  sector: "metals",
  price: 15.40,
  change: 1.80
}, {
  ticker: "AUYAF",
  name: "Alamos Gold",
  full: "Alamos Gold Inc. (North America Gold Miningi)",
  sector: "metals",
  price: 18.80,
  change: 1.32
}, {
  ticker: "BTG",
  name: "B2Gold",
  full: "B2Gold Corp. (Canada · Afrika & Filipinler)",
  sector: "metals",
  price: 3.20,
  change: 2.14
},
// —  SILVER (Silver) —
{
  ticker: "WPM",
  name: "Wheaton Prec.",
  full: "Wheaton Precious Metals Corp. (Silver & Gold Stream)",
  sector: "metals",
  price: 64.20,
  change: 1.67
}, {
  ticker: "AG",
  name: "First Majestic",
  full: "First Majestic Silver Corp. (Meksika & ABD)",
  sector: "metals",
  price: 8.40,
  change: 2.80
}, {
  ticker: "PAAS",
  name: "Pan Am Silver",
  full: "Pan American Silver Corp. (Amerika'nin En Buyugu)",
  sector: "metals",
  price: 18.80,
  change: 1.44
}, {
  ticker: "SVM",
  name: "Silvercorp",
  full: "Silvercorp Metals Inc. (China Silver Miningi)",
  sector: "metals",
  price: 4.80,
  change: 1.92
}, {
  ticker: "MAG",
  name: "MAG Silver",
  full: "MAG Silver Corp. (Meksika · Juanicipio Projesi)",
  sector: "metals",
  price: 14.20,
  change: 2.10
},
// — ⚪ PLATIN & PALADIUM (Platinumum & Palladium) —
{
  ticker: "SBSW",
  name: "Sibanye S.W.",
  full: "Sibanye Stillwater (Platinum · Palladium · Gold)",
  sector: "metals",
  price: 7.20,
  change: -0.88
}, {
  ticker: "ANGPY",
  name: "Anglo Plat.",
  full: "Anglo American Platinumum (Amplats · World #1 Platinum)",
  sector: "metals",
  price: 52.40,
  change: 0.44
}, {
  ticker: "IPPLF",
  name: "Impala Plat.",
  full: "Impala Platinumum Holdings (G. Afrika · Platinum Group)",
  sector: "metals",
  price: 3.80,
  change: -0.55
}, {
  ticker: "NMPNF",
  name: "Northam Plat.",
  full: "Northam Platinumum Holdings (G. Afrika)",
  sector: "metals",
  price: 8.60,
  change: 0.32
},
// — ·  BAKIR (Copper) —
{
  ticker: "FCX",
  name: "Freeport-McM.",
  full: "Freeport-McMoRan Inc. (Copper · Gold · ABD #1)",
  sector: "metals",
  price: 44.80,
  change: 1.85
}, {
  ticker: "ANFGF",
  name: "Antofagasta",
  full: "Antofagasta PLC (Chile Copper · London Listed)",
  sector: "metals",
  price: 22.40,
  change: 0.92
}, {
  ticker: "TECK",
  name: "Teck Res.",
  full: "Teck Resources Ltd. (Copper · Chinako · Canada)",
  sector: "metals",
  price: 38.40,
  change: 1.22
}, {
  ticker: "IVN",
  name: "Ivanhoe Mines",
  full: "Ivanhoe Mines Ltd. (DRC · Kamoa-Kakula Copper)",
  sector: "metals",
  price: 14.20,
  change: 2.40
}, {
  ticker: "GLNCY",
  name: "Glencore",
  full: "Glencore PLC (Global Emtia Devi · Copper & Coal)",
  sector: "metals",
  price: 8.20,
  change: 0.68
},
// —  ZINC, NICKEL & OTHERS (Zinc, Nickel & Others) —
{
  ticker: "MBII",
  name: "Metals & Min.",
  full: "Metals & Mining (ETF Tracker) — Global Basket",
  sector: "metals",
  price: 28.40,
  change: 0.55,
  isPrivate: true
}, {
  ticker: "NCPKF",
  name: "Norilsk Nick.",
  full: "Norilsk Nickel (Russia · World #1 Nikel & Palladium)",
  sector: "metals",
  price: 14.60,
  change: -0.42,
  isPrivate: true
}, {
  ticker: "VALE",
  name: "Vale",
  full: "Vale S.A. (Brazil · Iron Cevheri & Nikel)",
  sector: "metals",
  price: 12.40,
  change: 0.88
},
// —  LITHIUM & RARE EARTH (Lithium & Rare Earth) —
{
  ticker: "ALB",
  name: "Albemarle",
  full: "Albemarle Corporation (Lithium · ABD #1)",
  sector: "metals",
  price: 82.40,
  change: -1.44
}, {
  ticker: "SQM",
  name: "SQM",
  full: "Sociedad Química y Minera (Chile Lithium · Atacama)",
  sector: "metals",
  price: 38.60,
  change: -0.88
}, {
  ticker: "PLL",
  name: "Piedmont Li.",
  full: "Piedmont Lithium Inc. (ABD Lithium · EV Tedarik)",
  sector: "metals",
  price: 6.80,
  change: 1.92
}, {
  ticker: "LAC",
  name: "Lithium Am.",
  full: "Lithium Americas Corp. (Thacker Pass · Nevada)",
  sector: "metals",
  price: 4.20,
  change: 2.44
}, {
  ticker: "MP",
  name: "MP Materials",
  full: "MP Materials Corp. (ABD · Mountain Pass Nadir Toprak)",
  sector: "metals",
  price: 22.40,
  change: 3.12
}, {
  ticker: "LYSDY",
  name: "Lynas Rare E.",
  full: "Lynas Rare Earths Ltd. (Australia · #1 Bati Worldsi)",
  sector: "metals",
  price: 8.20,
  change: 1.68
}, {
  ticker: "UUUU",
  name: "Energy Fuels",
  full: "Energy Fuels Inc. (Uranyum & Nadir Toprak)",
  sector: "metals",
  price: 6.40,
  change: 2.88
},
// —  DIAMOND & GEMSTONE (Diamond & Gemstone) —
{
  ticker: "DEERS",
  name: "De Beers",
  full: "De Beers Group (Anglo American · Diamond #1 Global)",
  sector: "metals",
  price: 18.40,
  change: 0.22,
  isPrivate: true
}, {
  ticker: "ALRS",
  name: "ALROSA",
  full: "ALROSA (Russia · Global Ham Diamond #1 Producer)",
  sector: "metals",
  price: 12.60,
  change: -0.35,
  isPrivate: true
}, {
  ticker: "LUC",
  name: "Lucara Diam.",
  full: "Lucara Diamond Corp. (Botsvana · Large Diamond Uzmani)",
  sector: "metals",
  price: 0.92,
  change: 1.10
}, {
  ticker: "PDL",
  name: "Petra Diam.",
  full: "Petra Diamonds Ltd. (G. Afrika & Tanzanya)",
  sector: "metals",
  price: 0.18,
  change: -1.80
}, {
  ticker: "GEMCO",
  name: "Gemfields",
  full: "Gemfields Group (Emerald · Ruby · Afrika)",
  sector: "metals",
  price: 0.48,
  change: 0.88
},
// —  MAJOR MINERS (Diversified Major Miners) —
{
  ticker: "BHP",
  name: "BHP",
  full: "BHP Group Limited (Australia · Diversifiye Dev)",
  sector: "metals",
  price: 58.20,
  change: 0.72
}, {
  ticker: "RIO",
  name: "Rio Tinto",
  full: "Rio Tinto Group (UK/Australia · Aluminum & Iron)",
  sector: "metals",
  price: 64.80,
  change: 0.55
}, {
  ticker: "AAUKF",
  name: "Anglo American",
  full: "Anglo American PLC (London · Platinum & Copper & Diamond)",
  sector: "metals",
  price: 22.80,
  change: 0.88
}, {
  ticker: "S32",
  name: "South32",
  full: "South32 Ltd. (BHP Spin-off · Aluminum & Chinako)",
  sector: "metals",
  price: 3.40,
  change: 1.05
}, {
  ticker: "FSUMF",
  name: "Fortescue",
  full: "Fortescue Ltd. (Australia · Iron Cevheri & Green H2)",
  sector: "metals",
  price: 18.80,
  change: 0.62
}, {
  ticker: "WDS",
  name: "Woodside",
  full: "Woodside Energy Group (Australia · LNG & Energy)",
  sector: "metals",
  price: 24.40,
  change: 0.38
},
// —  TURKISH MINING COMPANIES —
{
  ticker: "KCHOL",
  name: "Koc Mad.",
  full: "Koc Holding Mining (Steel & Mining Investmentlari)",
  sector: "metals",
  price: 4.20,
  change: 1.15,
  isPrivate: true
}, {
  ticker: "ERGLI",
  name: "Erdemir",
  full: "Eregli Iron Steel (Erdemir · Turkey Steel #1)",
  sector: "metals",
  price: 2.80,
  change: 0.88
}, {
  ticker: "ISDMR",
  name: "Isdemir",
  full: "Iskenderun Iron Steel (Isdemir · Erdemir Group)",
  sector: "metals",
  price: 2.40,
  change: 0.72
}, {
  ticker: "KOZAL",
  name: "Koza Gold",
  full: "Koza Gold Operations A.S. (Turkey Gold Miningi)",
  sector: "metals",
  price: 6.80,
  change: 1.44
}, {
  ticker: "KOZAA",
  name: "Koza Anadolu",
  full: "Koza Anadolu Metal Mining A.S.",
  sector: "metals",
  price: 1.60,
  change: 0.92
}, {
  ticker: "GOLTS",
  name: "Gubre Fab.",
  full: "Gubre Fabrikalari T.A.S. (Fosfat & Kimya Miningciligi)",
  sector: "metals",
  price: 1.40,
  change: 0.55
},
// ══════════════════════════════════════════════════════
// ──  BANKING (Global Banking Sector) ──
// ══════════════════════════════════════════════════════

// —  EUROPEAN BANKING —
{
  ticker: "DB",
  name: "Deutsche Bank",
  full: "Deutsche Bank AG (Germany · Europe Investment Banksi)",
  sector: "banking",
  price: 14.40,
  change: 1.22
}, {
  ticker: "SCGLY",
  name: "Soc. Générale",
  full: "Société Générale S.A. (France · Global Bank)",
  sector: "banking",
  price: 32.80,
  change: 0.68
}, {
  ticker: "ING",
  name: "ING Group",
  full: "ING Groep N.V. (Netherlands · Digital Bankcilik Pioneer)",
  sector: "banking",
  price: 18.20,
  change: 0.92
}, {
  ticker: "BCS",
  name: "Barclays",
  full: "Barclays PLC (United Kingdom · Global Investment & Retail)",
  sector: "banking",
  price: 12.40,
  change: 1.05
}, {
  ticker: "LYG",
  name: "Lloyds",
  full: "Lloyds Banking Group PLC (United Kingdom · Retail #1)",
  sector: "banking",
  price: 3.20,
  change: 0.44
}, {
  ticker: "SCBFF",
  name: "Std. Chartered",
  full: "Standard Chartered PLC (Asya-Afrika-Middle East Focused)",
  sector: "banking",
  price: 22.40,
  change: 1.18
}, {
  ticker: "UNCRY",
  name: "UniCredit",
  full: "UniCredit S.p.A. (Italy & Europe · Pan-Europe Bank)",
  sector: "banking",
  price: 48.40,
  change: 1.44
}, {
  ticker: "IITSF",
  name: "Intesa SP",
  full: "Intesa Sanpaolo S.p.A. (Italy · Eurozone Large Bank)",
  sector: "banking",
  price: 4.80,
  change: 0.88
}, {
  ticker: "CRARY",
  name: "Crédit Agric.",
  full: "Crédit Agricole S.A. (France · Kooperatif Bank Devi)",
  sector: "banking",
  price: 14.80,
  change: 0.62
}, {
  ticker: "CRZBY",
  name: "Commerzbank",
  full: "Commerzbank AG (Germany · SME & Corporate Bankcilik)",
  sector: "banking",
  price: 8.40,
  change: 1.92
}, {
  ticker: "AAVMY",
  name: "ABN AMRO",
  full: "ABN AMRO Bank N.V. (Netherlands · Private & Commercial Bank)",
  sector: "banking",
  price: 18.60,
  change: 0.55
}, {
  ticker: "SWEDY",
  name: "Swedbank",
  full: "Swedbank AB (Sweden · Iskandinavya Bankciligi)",
  sector: "banking",
  price: 22.80,
  change: 0.72
}, {
  ticker: "NDEAY",
  name: "Nordea",
  full: "Nordea Bank Abp (Finlandiya · Kuzey Europe #1)",
  sector: "banking",
  price: 12.20,
  change: 0.48
}, {
  ticker: "DNBBY",
  name: "DNB Bank",
  full: "DNB ASA (Norway · Iskandinav Financeal Dev)",
  sector: "banking",
  price: 26.40,
  change: 0.38
},
// —  ASIA-PACIFIC BANKING —
{
  ticker: "DBSDY",
  name: "DBS Group",
  full: "DBS Group Holdings (Singapur · Asya #1 Digital Bank)",
  sector: "banking",
  price: 82.40,
  change: 0.88
}, {
  ticker: "OVCHY",
  name: "OCBC",
  full: "Oversea-Chinese Banking Corp. (Singapur & Asya)",
  sector: "banking",
  price: 14.80,
  change: 0.55
}, {
  ticker: "KB",
  name: "KB Financial",
  full: "KB Financial Group (South Korea · #1 Bank)",
  sector: "banking",
  price: 52.40,
  change: 1.12
}, {
  ticker: "SHG",
  name: "Shinhan Fin.",
  full: "Shinhan Financial Group (South Korea · #2 Bank)",
  sector: "banking",
  price: 28.40,
  change: 0.92
}, {
  ticker: "HDB",
  name: "HDFC Bank",
  full: "HDFC Bank Ltd. (India · Market Value #1 Bank)",
  sector: "banking",
  price: 68.40,
  change: 1.22
}, {
  ticker: "IBN",
  name: "ICICI Bank",
  full: "ICICI Bank Ltd. (India · Digital Bankcilik Leader)",
  sector: "banking",
  price: 22.40,
  change: 1.44
}, {
  ticker: "SBKFF",
  name: "SBI",
  full: "State Bank of India (India · State Banksi #1)",
  sector: "banking",
  price: 8.40,
  change: 0.68,
  isPrivate: true
}, {
  ticker: "AXBKY",
  name: "Axis Bank",
  full: "Axis Bank Ltd. (India · #3 Private Sector Bank)",
  sector: "banking",
  price: 14.20,
  change: 1.05
}, {
  ticker: "CBAUF",
  name: "Commonwealth",
  full: "Commonwealth Bank of Australia (Australia · #1)",
  sector: "banking",
  price: 98.40,
  change: 0.44
}, {
  ticker: "ANZBY",
  name: "ANZ Bank",
  full: "ANZ Banking Group (Australia & New Zealand)",
  sector: "banking",
  price: 18.40,
  change: 0.38
}, {
  ticker: "WBKGF",
  name: "Westpac",
  full: "Westpac Banking Corp. (Australia · 1817'den Beri)",
  sector: "banking",
  price: 14.80,
  change: 0.22
}, {
  ticker: "NABZY",
  name: "NAB",
  full: "National Australia Bank (Australia · Commercial Odak)",
  sector: "banking",
  price: 22.40,
  change: 0.35
}, {
  ticker: "SMFG",
  name: "SMFG",
  full: "Sumitomo Mitsui Financial Group (Japonya · #3 Bank)",
  sector: "banking",
  price: 12.40,
  change: 0.55
}, {
  ticker: "MFNSY",
  name: "Mizuho",
  full: "Mizuho Financial Group Inc. (Japonya · Global Bank)",
  sector: "banking",
  price: 4.80,
  change: 0.42
},
// —  MIDDLE EAST BANKING —
{
  ticker: "FABAD",
  name: "FAB",
  full: "First Abu Dhabi Bank (BAE · Middle East En Large Bank)",
  sector: "banking",
  price: 4.20,
  change: 0.88
}, {
  ticker: "RAJHI",
  name: "Al Rajhi",
  full: "Al Rajhi Bank (S. Arabistan · World’s #1 Islamic Banksi)",
  sector: "banking",
  price: 28.40,
  change: 1.22,
  isPrivate: true
}, {
  ticker: "RIBLF",
  name: "Riyad Bank",
  full: "Riyad Bank (S. Arabistan · Large Commercial Bank)",
  sector: "banking",
  price: 14.60,
  change: 0.68,
  isPrivate: true
}, {
  ticker: "NCKBY",
  name: "NCB",
  full: "Saudi National Bank (S. Arabistan · SNB · En Large)",
  sector: "banking",
  price: 18.80,
  change: 0.92,
  isPrivate: true
}, {
  ticker: "QIBK",
  name: "QIB",
  full: "Qatar Islamic Bank (Katar · Islamici Finance Leader)",
  sector: "banking",
  price: 22.40,
  change: 0.55,
  isPrivate: true
}, {
  ticker: "NBAD",
  name: "ADCB",
  full: "Abu Dhabi Commercial Bank (BAE · Retail & Corporate)",
  sector: "banking",
  price: 5.60,
  change: 0.72
}, {
  ticker: "TGABF",
  name: "Gulf Bank",
  full: "Gulf Bank K.S.C. (Kuveyt · Regional Bankcilik)",
  sector: "banking",
  price: 0.88,
  change: 0.44,
  isPrivate: true
},
// —  LATIN AMERICA BANKING —
{
  ticker: "ITUB",
  name: "Itaú Unibanco",
  full: "Itaú Unibanco Holding (Brazil & L. Amerika #1)",
  sector: "banking",
  price: 6.40,
  change: 1.44
}, {
  ticker: "BBD",
  name: "Bradesco",
  full: "Banco Bradesco S.A. (Brazil · #2 Private Bank)",
  sector: "banking",
  price: 3.80,
  change: 1.12
}, {
  ticker: "BSBR",
  name: "Santander BR.",
  full: "Banco Santander Brasil (Brazil Branch · Listed)",
  sector: "banking",
  price: 5.20,
  change: 0.88
}, {
  ticker: "BPAC",
  name: "BTG Pactual",
  full: "Banco BTG Pactual (Brazil · Investment Banksi #1)",
  sector: "banking",
  price: 14.80,
  change: 1.68
},
// —  TURKISH BANKING —
{
  ticker: "ZIRTB",
  name: "Ziraat Bank.",
  full: "T.C. Ziraat Banksi A.S. (Turkey #1 · State Banksi · 1863)",
  sector: "banking",
  price: 3.20,
  change: 0.68,
  isPrivate: true
}, {
  ticker: "HALKB",
  name: "Halkbank",
  full: "Turkey Halk Banksi A.S. (State · SME Focused)",
  sector: "banking",
  price: 2.80,
  change: 1.22
}, {
  ticker: "VAKBN",
  name: "Vakifbank",
  full: "Turkey Vakiflar Banksi T.A.O. (State · Vakif Banksi)",
  sector: "banking",
  price: 1.90,
  change: 0.88
}, {
  ticker: "GARAN",
  name: "Garanti BBVA",
  full: "Turkey Garanti Banksi A.S. (BBVA Partnered · BIST)",
  sector: "banking",
  price: 4.20,
  change: 1.44
}, {
  ticker: "ISCTR",
  name: "Is Banksi",
  full: "Turkey Is Banksi A.S. (BIST · Turkey'nin En Koklu Banksi · 1924)",
  sector: "banking",
  price: 3.60,
  change: 1.05
}, {
  ticker: "YKBNK",
  name: "Yapi Kredi",
  full: "Yapi ve Kredi Banksi A.S. (Koc-UniCredit · BIST)",
  sector: "banking",
  price: 2.80,
  change: 1.18
}, {
  ticker: "AKBNK",
  name: "Akbank",
  full: "Akbank T.A.S. (Sabanci Group · BIST · Digital Leader)",
  sector: "banking",
  price: 3.40,
  change: 1.32
}, {
  ticker: "QNBFB",
  name: "QNB Financebank",
  full: "QNB Financebank A.S. (Katar NBD Subsidiary · Turkey)",
  sector: "banking",
  price: 2.20,
  change: 0.92,
  isPrivate: true
}, {
  ticker: "DENZB",
  name: "Denizbank",
  full: "DenizBank A.S. (Emirates NBD Group · Turkey)",
  sector: "banking",
  price: 2.40,
  change: 0.78,
  isPrivate: true
}, {
  ticker: "TEBNK",
  name: "TEB",
  full: "Turkish Ekonomi Banksi A.S. (BNP Paribas Partnered)",
  sector: "banking",
  price: 1.80,
  change: 0.55,
  isPrivate: true
}, {
  ticker: "SKBNK",
  name: "Sekerbank",
  full: "Sekerbank T.A.S. (BIST · Kooperatif Rooted Bank)",
  sector: "banking",
  price: 0.92,
  change: 0.44
}, {
  ticker: "KTFTK",
  name: "Kuveyt Turkish",
  full: "Kuveyt Turkish Participation Banksi A.S. (Islamici Finance)",
  sector: "banking",
  price: 1.60,
  change: 0.68,
  isPrivate: true
}, {
  ticker: "TFINK",
  name: "Turkey Finance",
  full: "Turkey Finance Participation Banksi (NCB Saudi Partnered)",
  sector: "banking",
  price: 1.40,
  change: 0.55,
  isPrivate: true
}, {
  ticker: "ALBKTR",
  name: "Alternatifbank",
  full: "Alternatifbank A.S. (Commercial Bank of Qatar Subsidiary)",
  sector: "banking",
  price: 1.20,
  change: 0.42,
  isPrivate: true
}, {
  ticker: "FIBAB",
  name: "Fibabanka",
  full: "Fibabanka A.S. (Fiba Group · BIST · Digital Bank)",
  sector: "banking",
  price: 1.10,
  change: 0.88
}, {
  ticker: "ODEAB",
  name: "Odeabank",
  full: "Odeabank A.S. (Bank Audi Lebanon Subsidiary · Istanbul)",
  sector: "banking",
  price: 1.20,
  change: 0.35,
  isPrivate: true
}, {
  ticker: "INGTR",
  name: "ING Turkey",
  full: "ING Bank A.S. (ING Group · Netherlands · Turkey Branch)",
  sector: "banking",
  price: 2.80,
  change: 0.72,
  isPrivate: true
}, {
  ticker: "HSBTK",
  name: "HSBC Turkey",
  full: "HSBC Bank A.S. (HSBC Group · Turkey Branch)",
  sector: "banking",
  price: 3.60,
  change: 0.55,
  isPrivate: true
}, {
  ticker: "BURVA",
  name: "Burgan Bank",
  full: "Burgan Bank A.S. (Kuveyt Burgan Financial · Turkey)",
  sector: "banking",
  price: 0.80,
  change: 0.28,
  isPrivate: true
},
// ══════════════════════════════════════════════════════
// ──  APPAREL & FASHION SECTOR ──
// ══════════════════════════════════════════════════════
{
  ticker: "LVMUY",
  name: "LVMH",
  full: "LVMH (Louis Vuitton, Dior, Givenchy, Bulgari, Tiffany · Luxury #1)",
  sector: "fashion",
  price: 138.40,
  change: 0.88
}, {
  ticker: "CFRUY",
  name: "Richemont",
  full: "Richemont (Cartier, Van Cleef & Arpels, IWC, Panerai · Switzerland)",
  sector: "fashion",
  price: 14.80,
  change: 0.65
}, {
  ticker: "PPRUY",
  name: "Kering",
  full: "Kering (Gucci, Saint Laurent, Balenciaga, Bottega Veneta · France)",
  sector: "fashion",
  price: 28.60,
  change: -0.44
}, {
  ticker: "HESAY",
  name: "Hermès",
  full: "Hermès International (Birkin & Kelly Bag · En Valuable Luxury Brand)",
  sector: "fashion",
  price: 244.80,
  change: 1.22
}, {
  ticker: "PRDSY",
  name: "Prada Group",
  full: "Prada S.p.A. (Prada, Miu Miu, Church's · Italy · HK Exchange)",
  sector: "fashion",
  price: 8.20,
  change: 0.78
}, {
  ticker: "MONRY",
  name: "Moncler",
  full: "Moncler S.p.A. (Ultra-Premium Outdoor Luxury · Stone Island · Italy)",
  sector: "fashion",
  price: 48.40,
  change: 0.55
}, {
  ticker: "BURBY",
  name: "Burberry",
  full: "Burberry Group PLC (Iconic Ingiliz Luxury Brandsi · 1856 · Londra)",
  sector: "fashion",
  price: 9.40,
  change: -0.88
}, {
  ticker: "CHANEL",
  name: "Chanel",
  full: "Chanel S.A. (Coco Chanel Heritage · No5 Perfume · Haute Couture · Private)",
  sector: "fashion",
  price: 580.00,
  change: 1.10,
  isPrivate: true
}, {
  ticker: "VERSAC",
  name: "Versace",
  full: "Gianni Versace (Capri Holdings · Medusa Icon · 1978 · Italy)",
  sector: "fashion",
  price: 82.00,
  change: 0.44,
  isPrivate: true
}, {
  ticker: "ARMANI",
  name: "Giorgio Armani",
  full: "Giorgio Armani S.p.A. (Emporio Armani, AX · Family Company · 1975)",
  sector: "fashion",
  price: 120.00,
  change: 0.35,
  isPrivate: true
}, {
  ticker: "IDEXY",
  name: "Inditex",
  full: "Inditex (Zara, Pull&Bear, Massimo Dutti, Bershka · Moda Perak. #1)",
  sector: "fashion",
  price: 48.60,
  change: 0.92
}, {
  ticker: "HNNMY",
  name: "H&M Group",
  full: "H&M Hennes & Mauritz (H&M, COS, ARKET · Sweden · 77 Countries)",
  sector: "fashion",
  price: 18.20,
  change: -0.35
}, {
  ticker: "FRCOY",
  name: "Fast Retailing",
  full: "Fast Retailing (Uniqlo, GU, Theory · Japonya · Asya Moda #1)",
  sector: "fashion",
  price: 288.40,
  change: 1.44
}, {
  ticker: "GAP",
  name: "Gap Inc.",
  full: "Gap Inc. (Gap, Old Navy, Banana Republic, Athleta · ABD)",
  sector: "fashion",
  price: 18.80,
  change: 0.68
}, {
  ticker: "PVH",
  name: "PVH Corp.",
  full: "PVH Corp. (Calvin Klein, Tommy Hilfiger · Global Lisans Impar.)",
  sector: "fashion",
  price: 68.40,
  change: 0.88
}, {
  ticker: "RL",
  name: "Ralph Lauren",
  full: "Ralph Lauren (Polo Ralph Lauren · Amerikan Tarzinin Simgesi · 1967)",
  sector: "fashion",
  price: 198.40,
  change: 1.12
}, {
  ticker: "BOSSY",
  name: "Hugo Boss",
  full: "Hugo Boss AG (BOSS, HUGO · Global Erkek Apparel · DAX · 1924)",
  sector: "fashion",
  price: 32.40,
  change: 0.55
}, {
  ticker: "NKE",
  name: "Nike",
  full: "Nike Inc. (World’s #1 Sportststststststs Brandsi · Air Jordan · 1964 · NYSE)",
  sector: "fashion",
  price: 72.40,
  change: 0.78
}, {
  ticker: "ADDYY",
  name: "Adidas",
  full: "Adidas AG (Uc Serit Icon · Yeezy, Stan Smith · 1949 · DAX)",
  sector: "fashion",
  price: 128.80,
  change: 1.22
}, {
  ticker: "PMMAF",
  name: "Puma",
  full: "Puma SE (Kering Subsidiary · Sportststststststs & Lifestyle Footwear · 1948)",
  sector: "fashion",
  price: 38.40,
  change: 0.44
}, {
  ticker: "ONON",
  name: "On Running",
  full: "On Holding AG (CloudTec · Premium Running · Roger Federer · Switzerland)",
  sector: "fashion",
  price: 44.80,
  change: 2.80
}, {
  ticker: "CROX",
  name: "Crocs",
  full: "Crocs Inc. (Worldca Unlu Sandals · HeyDude Sahibi · NASDAQ)",
  sector: "fashion",
  price: 92.40,
  change: 1.65
}, {
  ticker: "SKX",
  name: "Skechers",
  full: "Skechers U.S.A. (Konfor Footwearsi · Global Sportststststststs Footwear #3)",
  sector: "fashion",
  price: 58.40,
  change: 0.88
}, {
  ticker: "NB",
  name: "New Balance",
  full: "New Balance Athletics (Boston · 1906 · Made in USA · Private Company)",
  sector: "fashion",
  price: 62.00,
  change: 1.10,
  isPrivate: true
}, {
  ticker: "ESLOY",
  name: "EssilorLuxottica",
  full: "EssilorLuxottica (Ray-Ban, Oakley, Persol · Eyewear World #1)",
  sector: "fashion",
  price: 258.80,
  change: 0.72
}, {
  ticker: "SWGAY",
  name: "Swatch Group",
  full: "Swatch Group (Swatch, Omega, Longines, Tissot, Rado · Switzerland)",
  sector: "fashion",
  price: 22.40,
  change: -0.28
}, {
  ticker: "PANDY",
  name: "Pandora",
  full: "Pandora A/S (World’s #1 Jewelry Brandsi · Charm Bracelet · DK)",
  sector: "fashion",
  price: 82.40,
  change: 1.44
}, {
  ticker: "SIG",
  name: "Signet Jewelers",
  full: "Signet Jewelers (Kay, Zales, Jared · North America Jewelry #1)",
  sector: "fashion",
  price: 68.80,
  change: 0.88
}, {
  ticker: "TIF",
  name: "Tiffany & Co.",
  full: "Tiffany & Co. (LVMH Owned by · Mavi Kutu Icon · 1837 · NYC)",
  sector: "fashion",
  price: 148.00,
  change: 0.55,
  isPrivate: true
}, {
  ticker: "CART",
  name: "Cartier",
  full: "Cartier (Richemont Owned by · Love Bracelet · Kral Jewelrycisi)",
  sector: "fashion",
  price: 320.00,
  change: 0.72,
  isPrivate: true
}, {
  ticker: "BVLG",
  name: "Bulgari",
  full: "Bulgari (LVMH Owned by · Serpenti · Roma Jewelryi · 1884)",
  sector: "fashion",
  price: 180.00,
  change: 0.48,
  isPrivate: true
},
// ══════════════════════════════════════════════════════
// ──  HEALTHCARE SECTOR ──
// ══════════════════════════════════════════════════════
{
  ticker: "LLY",
  name: "Eli Lilly",
  full: "Eli Lilly (Mounjaro/Tirzepatide · Alzheimer · 1876 · Pharma Valuei #1)",
  sector: "health",
  price: 788.40,
  change: 2.44
}, {
  ticker: "NVO",
  name: "Novo Nordisk",
  full: "Novo Nordisk (Ozempic, Wegovy · Diyabet & Obezite · Danimarka)",
  sector: "health",
  price: 122.80,
  change: 1.88
}, {
  ticker: "JNJ",
  name: "J&J",
  full: "Johnson & Johnson (Farmasotik + Medikal · Band-Aid · 1886 · NYSE)",
  sector: "health",
  price: 162.40,
  change: 0.44
}, {
  ticker: "MRK",
  name: "Merck & Co.",
  full: "Merck & Co. (Keytruda Cancer Ilaci · HPV Vaccine Gardasil · 1891)",
  sector: "health",
  price: 108.40,
  change: 0.78
}, {
  ticker: "PFE",
  name: "Pfizer",
  full: "Pfizer (COVID-19 mRNA Vaccine · Paxlovid · 1849 · NYSE)",
  sector: "health",
  price: 24.80,
  change: -0.55
}, {
  ticker: "RHHBY",
  name: "Roche",
  full: "Roche Holding (Cancer & Diagnostics · Avastin, Herceptin · 1896 · Switzerland)",
  sector: "health",
  price: 28.40,
  change: 0.35
}, {
  ticker: "NVS",
  name: "Novartis",
  full: "Novartis (Zolgensma Gen Terapisi · Cosentyx · 1996 · NYSE & SIX)",
  sector: "health",
  price: 102.80,
  change: 0.68
}, {
  ticker: "AZN",
  name: "AstraZeneca",
  full: "AstraZeneca (Oxford COVID Vaccine · Tagrisso · 1999 · NASDAQ)",
  sector: "health",
  price: 78.40,
  change: 1.22
}, {
  ticker: "SNY",
  name: "Sanofi",
  full: "Sanofi (Dupixent · Sanofi Pasteur Asi · CAC 40 · France)",
  sector: "health",
  price: 46.80,
  change: 0.44
}, {
  ticker: "GSK",
  name: "GSK",
  full: "GSK PLC (GlaxoSmithKline · Shingrix, HIV Tedavisi · Londra & NYSE)",
  sector: "health",
  price: 38.40,
  change: 0.35
}, {
  ticker: "BAYRY",
  name: "Bayer AG",
  full: "Bayer AG (Aspirin 1899 · Xarelto, Eylea · Monsanto · DAX)",
  sector: "health",
  price: 10.40,
  change: -0.88
}, {
  ticker: "MRNA",
  name: "Moderna",
  full: "Moderna (mRNA Technology Pioneer · COVID Vaccine · Cancer Vaccine · 2010)",
  sector: "health",
  price: 38.80,
  change: 1.65
}, {
  ticker: "BNTX",
  name: "BioNTech",
  full: "BioNTech (Pfizer Partnered mRNA Vaccine · Cancer Immunoterapi · 2008)",
  sector: "health",
  price: 98.40,
  change: 0.92
}, {
  ticker: "REGN",
  name: "Regeneron",
  full: "Regeneron Pharma (Eylea · Dupixent Mediumk · Kevzara · 1988 · NASDAQ)",
  sector: "health",
  price: 682.40,
  change: 1.12
}, {
  ticker: "ABBV",
  name: "AbbVie",
  full: "AbbVie (Humira · Skyrizi, Rinvoq · Abbott Spin-off · NYSE)",
  sector: "health",
  price: 188.40,
  change: 0.88
}, {
  ticker: "AMGN",
  name: "Amgen",
  full: "Amgen (Biyofarmasotik Pioneer · Enbrel, Prolia · 1980 · NASDAQ)",
  sector: "health",
  price: 282.40,
  change: 0.55
}, {
  ticker: "GILD",
  name: "Gilead Sciences",
  full: "Gilead Sciences (HIV Tedavisi Leader · Biktarvy · 1987 · NASDAQ)",
  sector: "health",
  price: 82.40,
  change: 0.68
}, {
  ticker: "UNH",
  name: "UnitedHealth",
  full: "UnitedHealth Group (Optum · Healthcare Insurance & Services World #1)",
  sector: "health",
  price: 524.80,
  change: 0.44
}, {
  ticker: "CVS",
  name: "CVS Health",
  full: "CVS Health (Eczane + Aetna Healthcare Insurancesi · 9.000+ Eczane)",
  sector: "health",
  price: 58.40,
  change: 0.35
}, {
  ticker: "HCA",
  name: "HCA Healthcare",
  full: "HCA Healthcare (World’s En Large Private Hospital Zinciri · 180+ Hast.)",
  sector: "health",
  price: 338.40,
  change: 0.88
}, {
  ticker: "MDT",
  name: "Medtronic",
  full: "Medtronic (Kalp Pili · Seker Monitoru · Medikal Cihaz #1 · 1949)",
  sector: "health",
  price: 84.40,
  change: 0.44
}, {
  ticker: "ABT",
  name: "Abbott Labs",
  full: "Abbott Laboratories (FreeStyle Libre · Pacemaker · 1888 · NYSE)",
  sector: "health",
  price: 128.40,
  change: 0.88
}, {
  ticker: "ISRG",
  name: "Intuitive Surg.",
  full: "Intuitive Surgical (Da Vinci Robotik Cerrahi #1 · 1995 · NASDAQ)",
  sector: "health",
  price: 488.40,
  change: 1.44
}, {
  ticker: "SYK",
  name: "Stryker",
  full: "Stryker (Ortopedik Implant & MAKO Cerrahi Robot · 1941 · NYSE)",
  sector: "health",
  price: 388.40,
  change: 0.68
}, {
  ticker: "BSX",
  name: "Boston Scientific",
  full: "Boston Scientific (Kalp Ritim, Stent, Endoskopi · 1979 · NYSE)",
  sector: "health",
  price: 98.40,
  change: 1.12
}, {
  ticker: "SMMNY",
  name: "Siemens Health.",
  full: "Siemens Healthineers (MRI, CT, PET Scanner · Diagnostics Imaging #1)",
  sector: "health",
  price: 52.40,
  change: 0.72
}, {
  ticker: "VRTX",
  name: "Vertex Pharma.",
  full: "Vertex Pharma (Cystic Fibrosis Trikafta #1 · CRISPR Mediumk · NASDAQ)",
  sector: "health",
  price: 472.40,
  change: 1.22
}, {
  ticker: "CRSP",
  name: "CRISPR Therap.",
  full: "CRISPR Therapeutics (Gene Editing · FDA Approved Casgevy · NASDAQ)",
  sector: "health",
  price: 48.40,
  change: 3.14
}, {
  ticker: "ACIBM",
  name: "Acibadem",
  full: "Acibadem Healthcare Group (IHH Healthcare Subsidiary · 23 Hospital · TR)",
  sector: "health",
  price: 8.40,
  change: 1.22,
  isPrivate: true
}, {
  ticker: "MEMHSP",
  name: "Memorial",
  full: "Memorial Healthcare Group (14 Hospital · Istanbul, Ankara · TR)",
  sector: "health",
  price: 6.80,
  change: 0.88,
  isPrivate: true
}, {
  ticker: "ECILC",
  name: "Eczacibasi",
  full: "Eczacibasi Pharma Industry (Pharma Production & Cosmetics · BIST · TR)",
  sector: "health",
  price: 3.20,
  change: 0.92
}];

// Normalize: companies without ipoStatus get assigned based on isPrivate flag

