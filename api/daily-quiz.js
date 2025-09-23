module.exports = async (req, res) => {
  // Fallback pool if client does not POST a dynamic pool
  const defaultPool = [
    { id: 'dq-01', topic: 'Energy' }, { id: 'dq-02', topic: 'Waste' }, { id: 'dq-03', topic: 'Water' }, { id: 'dq-04', topic: 'Ecology' }, { id: 'dq-05', topic: 'Climate' },
    { id: 'dq-06', topic: 'Waste' }, { id: 'dq-07', topic: 'Climate' }, { id: 'dq-08', topic: 'Water' }, { id: 'dq-09', topic: 'Energy' }, { id: 'dq-10', topic: 'Energy' },
    { id: 'dq-11', topic: 'Waste' }, { id: 'dq-12', topic: 'Forests' }, { id: 'dq-13', topic: 'Agriculture' }, { id: 'dq-14', topic: 'Waste' }, { id: 'dq-15', topic: 'Sustainability' },
    { id: 'dq-16', topic: 'Energy' }, { id: 'dq-17', topic: 'Water' }, { id: 'dq-18', topic: 'Climate' }, { id: 'dq-19', topic: 'Sustainability' }, { id: 'dq-20', topic: 'Ecology' }
  ]

  const count = Math.max(1, Math.min(5, parseInt((req.query && req.query.count) || (req.body && req.body.count) || '3', 10) || 3))
  const today = new Date()
  const y = today.getUTCFullYear()
  const m = today.getUTCMonth() + 1
  const d = today.getUTCDate()
  const dayOfYear = Math.floor((Date.UTC(y, m-1, d) - Date.UTC(y, 0, 0)) / 86400000)
  const seedStr = `${y}-${m}-${d}`

  // Prefer dynamic pool from POST body: { pool: [{id, topic}, ...] }
  const bodyPool = (req.body && Array.isArray(req.body.pool)) ? req.body.pool : null
  // Normalize pool as array of { id, topic }
  let pool = (bodyPool || defaultPool).map(x => (typeof x === 'string' ? { id: x, topic: 'Other' } : x)).filter(x => x && x.id)

  // deterministic seeded PRNG (mulberry32)
  function xfnv1a(str){ for(var i=0,h=2166136261>>>0;i<str.length;i++) h=Math.imul(h^str.charCodeAt(i),16777619); return function(){ h+=h<<13; h^=h>>>7; h+=h<<3; h^=h>>>17; return (h+=(h<<5)>>>0)>>>0 } }
  function mulberry32(a){ return function(){ var t=a+=0x6D2B79F5; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296 } }

  function picksForDate(dateStr, poolArr, howMany) {
    const seed = xfnv1a(dateStr)()
    const rand = mulberry32(seed)
    const byTopic = {}
    for (const item of poolArr) {
      const t = item.topic || 'Other'
      if (!byTopic[t]) byTopic[t] = []
      byTopic[t].push(item.id)
    }
    const topics = Object.keys(byTopic).sort()
    const day = new Date(dateStr + 'T00:00:00Z')
    const dy = day.getUTCFullYear()
    const dm = day.getUTCMonth() + 1
    const dd = day.getUTCDate()
    const doy = Math.floor((Date.UTC(dy, dm-1, dd) - Date.UTC(dy, 0, 0)) / 86400000)
    const startIdx = topics.length ? (doy % topics.length) : 0
    const rotated = topics.slice(startIdx).concat(topics.slice(0, startIdx))
    const p = []
    for (let i = 0; i < rotated.length && p.length < howMany; i++) {
      const t = rotated[i]
      const arr = byTopic[t]
      if (!arr || arr.length === 0) continue
      const idx = Math.floor(rand() * arr.length)
      const id = arr[idx]
      if (!p.includes(id)) p.push(id)
    }
    // fill if not enough
    const rest = poolArr.map(x=>x.id).slice().sort(()=>rand()-0.5)
    for (const id of rest) { if (p.length >= howMany) break; if (!p.includes(id)) p.push(id) }
    return p.slice(0, howMany)
  }

  // Build exclude set from last 14 days
  const exclude = new Set()
  for (let i = 1; i <= 14; i++) {
    const past = new Date(Date.UTC(y, m-1, d - i))
    const ps = `${past.getUTCFullYear()}-${past.getUTCMonth()+1}-${past.getUTCDate()}`
    for (const id of picksForDate(ps, pool, count)) exclude.add(id)
  }

  // Today's picks, avoiding recent ones
  const todayPicks = []
  const seed = xfnv1a(seedStr)()
  const rand = mulberry32(seed)
  const byTopic = {}
  for (const item of pool) { const t = item.topic || 'Other'; (byTopic[t]||(byTopic[t]=[])).push(item.id) }
  const topics = Object.keys(byTopic).sort()
  const startIdx = topics.length ? (dayOfYear % topics.length) : 0
  const rotated = topics.slice(startIdx).concat(topics.slice(0, startIdx))
  for (let i = 0; i < rotated.length && todayPicks.length < count; i++) {
    const t = rotated[i]
    const arr = (byTopic[t] || []).filter(id => !exclude.has(id))
    if (!arr.length) continue
    const id = arr[Math.floor(rand()*arr.length)]
    if (!todayPicks.includes(id)) todayPicks.push(id)
  }
  if (todayPicks.length < count) {
    const rest = pool.map(x=>x.id).filter(id => !exclude.has(id))
    for (const id of rest) { if (todayPicks.length >= count) break; if (!todayPicks.includes(id)) todayPicks.push(id) }
  }

  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600')
  res.status(200).json({ date: seedStr, ids: todayPicks.slice(0, count) })
}
