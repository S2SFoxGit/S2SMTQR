# Shop2Shop QR Landing Page

Mobile-first landing page accessible via QR code. Shows live exchange rates for 5 corridors with full language support.

## Stack
- **Frontend**: Next.js 14 (React)
- **Rates API**: Supabase Edge Function (`rate-calculator`) — Supabase project `bftmghjnkdvociwxekik`
- **Hosting**: Vercel
- **Currencies**: CurrencyLayer via existing edge function

## Countries & Languages
| Country    | Currency | Payout       | Language  |
|------------|----------|--------------|-----------|
| Somalia    | USD      | EVC Plus, Zaad, Dahabshiil | Somali (so) |
| Bangladesh | BDT      | bKash, Nagad, Rocket + 63 banks | Bengali (bn) |
| Ethiopia   | USD→ETB  | CBE Connect, Telebirr | Amharic (am) |
| Kenya      | USD      | M-Pesa, Taaj | Kiswahili (sw) |
| Pakistan   | PKR      | JazzCash, EasyPaisa + 46 banks | Urdu (ur) |

## Send Limits
- Daily: ZAR 5,000
- Monthly: ZAR 25,000

## Local Development

```bash
npm install
cp .env.example .env.local
# Fill in SUPABASE_ANON_KEY in .env.local
npm run dev
```

## Deploy to Vercel

1. Push this folder to GitHub
2. Import project in Vercel
3. Set **Root Directory** to this folder name (e.g. `shop2shop-qr`)
4. Set **Framework Preset** to `Next.js`
5. Add environment variables:
   - `SUPABASE_URL` = `https://bftmghjnkdvociwxekik.supabase.co`
   - `SUPABASE_ANON_KEY` = your anon key from Supabase → Settings → API
6. Deploy

## QR Code
Point your QR code at the deployed Vercel URL (or your custom domain).

## Rate Data Flow
```
User visits page
  → /api/rates?country=somalia&lang=2&amount=1000
  → Supabase edge function rate-calculator
  → CurrencyLayer API (ZAR base rates)
  → Returns live rate + calculated receive amount
  → Displayed on page
```

Rates are fetched fresh on every country/language/amount change.
