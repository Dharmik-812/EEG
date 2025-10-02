// Simple health check endpoint for Vercel deployment
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  res.status(200).json({ 
    message: 'EEG API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      chat: '/api/chat',
      quiz: '/api/daily-quiz'
    }
  })
}
