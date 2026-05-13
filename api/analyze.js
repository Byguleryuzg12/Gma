export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  let body;
  try {
    body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => {
        try {
          resolve(JSON.parse(data || '{}'));
        } catch (error) {
          reject(error);
        }
      });
      req.on('error', reject);
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid JSON payload' });
    return;
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
