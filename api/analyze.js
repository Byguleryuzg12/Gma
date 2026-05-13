export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body = typeof req.body === 'string' ? {} : (req.body || {});
  
  try {
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else if (Buffer.isBuffer(req.body)) {
      body = JSON.parse(req.body.toString());
    }
  } catch (error) {
    return res.status(400).json({ error: 'Invalid JSON payload', details: error.message });
  }

  const { ticker, name, sector, price, change } = body || {};
  const analysis = {
    summary: `${name || ticker} appears to have balanced market positioning with a clear upward trend and managed downside risk. Current momentum is positive but investors should track macro volatility closely.`,
    positive: [
      'Strong domain positioning in its market segment',
      'Solid recent price momentum with healthy volume support',
      'Diversified operations that support stable earnings' 
    ],
    negative: [
      'External macro conditions may pressure near-term returns',
      'Competitive intensity remains elevated in key growth markets',
      'Short-term volatility can increase headline risk' 
    ],
    innovation: [
      'Potential for product/service expansion in adjacent markets',
      'Ongoing digital transformation could improve efficiency',
      'Emerging technology adoption may support future growth' 
    ],
    sentiment: 'POZITIF',
    sentimentPuan: 70,
    strengthScore: 73,
    riskScore: 31,
    kisaTimeframe: 'Near-term catalysts look constructive, but monitor macro data and earnings updates closely.',
    uzunTimeframe: 'Medium to long-term fundamentals remain intact with secular growth drivers supporting performance over 12-36 months.'
  };

  res.status(200).json({
    consensus: analysis,
    modelsUsed: ['gma-demo'],
    creditsLeft: 999
  });
}
