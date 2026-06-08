const SUPABASE_URL = 'https://bftmghjnkdvociwxekik.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmdG1naGpua2R2b2Npd3hla2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NjU5NTcsImV4cCI6MjA1OTM0MTk1N30.bxMCpR2TiE0GGEsAlERmkwePwVBzFuNwMrHSVNHnCKg'

const COUNTRY_MAP = {
  somalia:    { send_currency: 'USD' },
  kenya:      { send_currency: 'KES' },
  ethiopia:   { send_currency: 'ETB' },
  bangladesh: { send_currency: 'BDT' },
  pakistan:   { send_currency: 'PKR' },
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  const { country, lang, amount } = req.query

  if (!country || !COUNTRY_MAP[country]) {
    return res.status(400).json({ error: 'Invalid country' })
  }

  const cfg = COUNTRY_MAP[country]

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/rate-calculator`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          send_currency: cfg.send_currency,
          send_amount: amount ? parseFloat(amount) : 1000,
          language: lang || '1',
        }),
      }
    )

    if (!response.ok) {
      const text = await response.text()
      return res.status(response.status).json({ error: text })
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
