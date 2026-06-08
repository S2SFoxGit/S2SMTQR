// Proxies to the Supabase rate-calculator edge function
// Set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel environment variables

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bftmghjnkdvociwxekik.supabase.co'
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || ''

// Country → currency/language mapping
const COUNTRY_MAP = {
  somalia:    { send_currency: 'USD', language: '2', dbKey: 'USD' },
  kenya:      { send_currency: 'KES', language: '6', dbKey: 'KES' },
  ethiopia:   { send_currency: 'ETB', language: '4', dbKey: 'ETB' },
  bangladesh: { send_currency: 'BDT', language: '3', dbKey: 'BDT' },
  pakistan:   { send_currency: 'PKR', language: '5', dbKey: 'PKR' },
}

export default async function handler(req, res) {
  const { country, lang, amount } = req.query

  if (!country || !COUNTRY_MAP[country]) {
    return res.status(400).json({ error: 'Invalid country' })
  }

  const cfg = COUNTRY_MAP[country]
  const language = lang || cfg.language

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
          language,
        }),
      }
    )

    const data = await response.json()
    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
