import { useState, useEffect, useCallback } from "react";
import Head from "next/head";

// ── Data ──────────────────────────────────────────────────────────────────────

const COUNTRIES = [
  { id: "somalia",    flag: "🇸🇴", name: "Somalia",    localName: "Soomaaliya" },
  { id: "bangladesh", flag: "🇧🇩", name: "Bangladesh", localName: "বাংলাদেশ" },
  { id: "ethiopia",   flag: "🇪🇹", name: "Ethiopia",   localName: "ኢትዮጵያ" },
  { id: "kenya",      flag: "🇰🇪", name: "Kenya",      localName: "Kenya" },
  { id: "pakistan",   flag: "🇵🇰", name: "Pakistan",   localName: "پاکستان" },
];

const LANGUAGES = {
  somalia:    { code: "so", name: "Somali",   native: "Soomaali",  dir: "ltr" },
  bangladesh: { code: "bn", name: "Bengali",  native: "বাংলা",      dir: "ltr" },
  ethiopia:   { code: "am", name: "Amharic",  native: "አማርኛ",      dir: "ltr" },
  kenya:      { code: "sw", name: "Kiswahili",native: "Kiswahili",  dir: "ltr" },
  pakistan:   { code: "ur", name: "Urdu",     native: "اردو",       dir: "rtl" },
};

// Language map code for API: en=1, so=2, bn=3, am=4, ur=5, sw=6
const LANG_CODE = {
  en: "1", so: "2", bn: "3", am: "4", ur: "5", sw: "6",
};

const PAYOUT = {
  somalia: {
    currency: "USD",
    symbol: "$",
    partners: [
      { icon: "📱", label: "Mobile Wallets", items: ["EVC Plus", "Zaad", "Sahal"] },
      { icon: "💵", label: "Cash Pick-Up",   items: ["Dahabshiil", "Taaj"] },
    ],
  },
  bangladesh: {
    currency: "BDT",
    symbol: "৳",
    partners: [
      { icon: "📱", label: "Mobile Wallets", items: ["bKash", "Nagad", "Rocket"] },
      { icon: "🏦", label: "Bank Transfer",  items: ["63 banks supported"] },
    ],
  },
  ethiopia: {
    currency: "USD → ETB",
    symbol: "Br",
    partners: [
      { icon: "🏦", label: "CBE Connect",    items: ["Commercial Bank of Ethiopia"] },
      { icon: "📱", label: "Mobile Wallets", items: ["Telebirr"] },
    ],
  },
  kenya: {
    currency: "USD",
    symbol: "$",
    partners: [
      { icon: "📱", label: "Mobile Wallet",  items: ["M-Pesa"] },
      { icon: "💵", label: "Cash Pick-Up",   items: ["Taaj"] },
    ],
  },
  pakistan: {
    currency: "PKR",
    symbol: "₨",
    partners: [
      { icon: "📱", label: "Mobile Wallets", items: ["JazzCash", "EasyPaisa", "NayaPay", "SadaPay"] },
      { icon: "🏦", label: "Bank Transfer",  items: ["46 banks supported"] },
    ],
  },
};

const LIMITS = {
  daily:   "ZAR 5,000",
  monthly: "ZAR 25,000",
};

// Translations for UI strings
const UI_TEXT = {
  en: {
    title:          "Money Transfer",
    english:        "English",
    sending:        "You Send",
    receiving:      "Recipient Gets",
    rate:           "Exchange Rate",
    dailyLimit:     "Daily Limit",
    monthlyLimit:   "Monthly Limit",
    payoutVia:      "Payout Options",
    updated:        "Rates updated daily",
    disclaimer:     "Indicative rate. Final rate confirmed at Shop2Shop store.",
    sendMoney:      "Send Money",
    howItWorks:     "How It Works",
    step1:          "Visit any Shop2Shop store",
    step2:          "Provide recipient details",
    step3:          "Pay in ZAR — recipient gets paid",
    limits:         "Send Limits",
    loading:        "Loading rates…",
    error:          "Could not load rates. Please try again.",
    zarAmount:      "ZAR Amount",
  },
  so: {
    title:          "Wareejinta Lacagta",
    english:        "English",
    sending:        "Adigu Diraysaa",
    receiving:      "Qaadihiisu Helayaa",
    rate:           "Qiimaha Beddelka",
    dailyLimit:     "Xadka Maalinlaha",
    monthlyLimit:   "Xadka Bishii",
    payoutVia:      "Siyaabaha Lacag-bixinta",
    updated:        "Qiimayaasha waa la cusboonaysiiyaa maalin kasta",
    disclaimer:     "Qiime tilmaameed. Qiimaha ugu dambeeya waxaa lagu xaqiijiyaa dukaanka Shop2Shop.",
    sendMoney:      "Dir Lacagta",
    howItWorks:     "Sida Shaqaysa",
    step1:          "Tag dukaanka Shop2Shop kasta",
    step2:          "Bixi macluumaadka qaadaha",
    step3:          "Bixi ZAR — qaadaha waa la siiyaa",
    limits:         "Xadka Diridda",
    loading:        "Qiimayaasha waa la rarayo…",
    error:          "Qiimayaasha lama soo qaadi karin. Fadlan isku day mar kale.",
    zarAmount:      "Lacagta ZAR",
  },
  bn: {
    title:          "অর্থ প্রেরণ",
    english:        "English",
    sending:        "আপনি পাঠাচ্ছেন",
    receiving:      "প্রাপক পাচ্ছেন",
    rate:           "বিনিময় হার",
    dailyLimit:     "দৈনিক সীমা",
    monthlyLimit:   "মাসিক সীমা",
    payoutVia:      "পেমেন্ট অপশন",
    updated:        "রেট প্রতিদিন আপডেট হয়",
    disclaimer:     "আনুমানিক হার। চূড়ান্ত হার Shop2Shop স্টোরে নিশ্চিত করা হয়।",
    sendMoney:      "টাকা পাঠান",
    howItWorks:     "কীভাবে কাজ করে",
    step1:          "যেকোনো Shop2Shop স্টোরে যান",
    step2:          "প্রাপকের বিবরণ দিন",
    step3:          "ZAR দিন — প্রাপক পেমেন্ট পাবেন",
    limits:         "পাঠানোর সীমা",
    loading:        "রেট লোড হচ্ছে…",
    error:          "রেট লোড করা যায়নি। আবার চেষ্টা করুন।",
    zarAmount:      "ZAR পরিমাণ",
  },
  am: {
    title:          "ገንዘብ ዝውውር",
    english:        "English",
    sending:        "እርስዎ ይልካሉ",
    receiving:      "ተቀባዩ ያገኛል",
    rate:           "የምንዛሪ ዋጋ",
    dailyLimit:     "የዕለት ገደብ",
    monthlyLimit:   "የወር ገደብ",
    payoutVia:      "የክፍያ አማራጮች",
    updated:        "ዋጋዎች በየቀኑ ይዘምናሉ",
    disclaimer:     "የጠቋሚ ዋጋ። የመጨረሻ ዋጋ በ Shop2Shop መደብር ይረጋገጣል።",
    sendMoney:      "ገንዘብ ላክ",
    howItWorks:     "እንዴት እንደሚሰራ",
    step1:          "ማንኛውንም Shop2Shop መደብር ይጎብኙ",
    step2:          "የተቀባዩን ዝርዝር ያቅርቡ",
    step3:          "ZAR ይክፈሉ — ተቀባዩ ይከፈላል",
    limits:         "የላክ ወሰኖች",
    loading:        "ዋጋዎች በመጫን ላይ…",
    error:          "ዋጋዎቹን መጫን አልተቻለም። እባክዎ እንደገና ይሞክሩ።",
    zarAmount:      "ZAR መጠን",
  },
  ur: {
    title:          "رقم کی منتقلی",
    english:        "English",
    sending:        "آپ بھیج رہے ہیں",
    receiving:      "وصول کنندہ کو ملے گا",
    rate:           "زر مبادلہ کی شرح",
    dailyLimit:     "یومی حد",
    monthlyLimit:   "ماہانہ حد",
    payoutVia:      "ادائیگی کے اختیارات",
    updated:        "شرحیں روزانہ اپ ڈیٹ ہوتی ہیں",
    disclaimer:     "اشارتی شرح۔ حتمی شرح Shop2Shop اسٹور پر تصدیق کی جاتی ہے۔",
    sendMoney:      "رقم بھیجیں",
    howItWorks:     "یہ کیسے کام کرتا ہے",
    step1:          "کسی بھی Shop2Shop اسٹور پر جائیں",
    step2:          "وصول کنندہ کی تفصیلات فراہم کریں",
    step3:          "ZAR ادا کریں — وصول کنندہ کو ادائیگی ہوگی",
    limits:         "بھیجنے کی حدود",
    loading:        "شرحیں لوڈ ہو رہی ہیں…",
    error:          "شرحیں لوڈ نہیں ہو سکیں۔ دوبارہ کوشش کریں۔",
    zarAmount:      "ZAR رقم",
  },
  sw: {
    title:          "Uhamisho wa Pesa",
    english:        "English",
    sending:        "Unatuma",
    receiving:      "Mpokeaji Anapata",
    rate:           "Kiwango cha Ubadilishaji",
    dailyLimit:     "Kikomo cha Kila Siku",
    monthlyLimit:   "Kikomo cha Kila Mwezi",
    payoutVia:      "Chaguzi za Malipo",
    updated:        "Viwango vinasasishwa kila siku",
    disclaimer:     "Kiwango cha dalili. Kiwango cha mwisho kinathibitishwa katika duka la Shop2Shop.",
    sendMoney:      "Tuma Pesa",
    howItWorks:     "Jinsi Inavyofanya Kazi",
    step1:          "Tembelea duka lolote la Shop2Shop",
    step2:          "Toa maelezo ya mpokeaji",
    step3:          "Lipa ZAR — mpokeaji analipwa",
    limits:         "Mipaka ya Kutuma",
    loading:        "Viwango vinapakiwa…",
    error:          "Viwango havikuweza kupakiwa. Tafadhali jaribu tena.",
    zarAmount:      "Kiasi cha ZAR",
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeCountry, setActiveCountry]   = useState("somalia");
  const [useLocalLang, setUseLocalLang]     = useState(false);
  const [zarAmount, setZarAmount]           = useState(1000);
  const [sendCurrency, setSendCurrency]     = useState("ZAR"); // ZAR or USD
  const [rateData, setRateData]             = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);

  const langKey = useLocalLang ? LANGUAGES[activeCountry].code : "en";
  const t       = UI_TEXT[langKey] || UI_TEXT.en;
  const isRtl   = useLocalLang && LANGUAGES[activeCountry].dir === "rtl";

  // Correct rates per R1,000 ZAR from quick_rates function
  const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmdG1naGpua2R2b2Npd3hla2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNTczMTQsImV4cCI6MjA4OTgzMzMxNH0.hh66phQwc4sfva4EY254viK-AampHgsXGY0Ft4drl0U";
  const SUPABASE_URL = "https://bftmghjnkdvociwxekik.supabase.co";

  // Map country → key used in quick_rates response
  const RATE_KEY = {
    somalia: "SO", kenya: "KE", ethiopia: "ET", bangladesh: "BD", pakistan: "PK",
  };

  const fetchRate = useCallback(async (country, lang) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/quick_rates`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": ANON_KEY,
            "Authorization": `Bearer ${ANON_KEY}`,
          },
          body: JSON.stringify({ language: LANG_CODE[lang] || "1" }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRateData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // USD/ZAR rate — fetched once
  const [usdZar, setUsdZar] = useState(18.5);
  useEffect(() => {
    fetch(`${SUPABASE_URL}/functions/v1/quick_rates`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": ANON_KEY, "Authorization": `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ language: "1" }),
    })
    .then(r => r.json())
    .then(d => { if (d.usd_zar) setUsdZar(d.usd_zar); })
    .catch(() => {});
  }, []);

  // Compute receive amount from rate data + current send amount + currency
  const computeReceive = useCallback((country, amount, currency, rates) => {
    if (!rates) return null;
    const key = RATE_KEY[country];
    let ratePerR1000 = null;
    if (rates.rates && rates.rates[key]) {
      ratePerR1000 = rates.rates[key];
    } else if (rates[key]) {
      ratePerR1000 = rates[key];
    } else {
      const msg = rates.message || JSON.stringify(rates);
      const countryRates = {
        somalia: /Somalia[^\d]*([\d,]+\.?\d*)/i,
        kenya: /Kenya[^\d]*([\d,]+\.?\d*)/i,
        ethiopia: /Ethiopia[^\d]*([\d,]+\.?\d*)/i,
        bangladesh: /Bangladesh[^\d]*([\d,]+\.?\d*)/i,
        pakistan: /Pakistan[^\d]*([\d,]+\.?\d*)/i,
      };
      const match = msg.match(countryRates[country]);
      if (match) ratePerR1000 = parseFloat(match[1].replace(/,/g, ''));
    }
    if (!ratePerR1000) return null;
    // Always convert to ZAR first, then apply rate
    const zarValue = currency === "USD" ? amount * usdZar : amount;
    return (ratePerR1000 * zarValue / 1000).toFixed(2);
  }, [usdZar]);

  // For Somalia: payout is USD. Show the ZAR→USD conversion clearly
  // ratePerR1000 for Somalia ≈ 58 (USD per R1000 ZAR)
  // So USD input: user enters USD, we convert to ZAR, then show USD output
  // This is correct - just make sure label is clear

  useEffect(() => {
    fetchRate(activeCountry, langKey);
  }, [activeCountry, langKey, fetchRate]);

  const payout  = PAYOUT[activeCountry];
  const langMeta = LANGUAGES[activeCountry];

  return (
    <>
      <Head>
        <title>Shop2Shop Money Transfer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content="Send money home with Shop2Shop — live exchange rates for Somalia, Bangladesh, Ethiopia, Kenya & Pakistan" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Nunito+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="page" dir={isRtl ? "rtl" : "ltr"}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="header">
          <img src="/logo.png" alt="Shop2Shop" className="logo-img" />
        </header>

        {/* ── Page Title ─────────────────────────────────────────── */}
        <div className="page-title-wrap">
          <h1 className="page-title">{t.title}</h1>
        </div>

        {/* ── Country Flags Row ──────────────────────────────────── */}
        <nav className="flag-nav" aria-label="Select country">
          {COUNTRIES.map(c => (
            <button
              key={c.id}
              className={`flag-btn ${activeCountry === c.id ? "flag-btn--active" : ""}`}
              onClick={() => { setActiveCountry(c.id); setUseLocalLang(false); }}
              aria-pressed={activeCountry === c.id}
              title={c.name}
            >
              <span className="flag-emoji">{c.flag}</span>
              <span className="flag-label">{useLocalLang && activeCountry === c.id ? c.localName : c.name}</span>
            </button>
          ))}
        </nav>

        {/* ── Language Toggle ────────────────────────────────────── */}
        <div className="lang-toggle-wrap">
          <button
            className={`lang-pill ${!useLocalLang ? "lang-pill--active" : ""}`}
            onClick={() => setUseLocalLang(false)}
          >
            🇬🇧 English
          </button>
          <button
            className={`lang-pill ${useLocalLang ? "lang-pill--active" : ""}`}
            onClick={() => setUseLocalLang(true)}
          >
            {langMeta.native}
          </button>
        </div>

        {/* ── Rate Card ──────────────────────────────────────────── */}
        <main className="content">

          {/* Amount input */}
          <section className="card amount-card">
            <div className="amount-currency-toggle">
              <button
                className={`curr-pill ${sendCurrency === "ZAR" ? "curr-pill--active" : ""}`}
                onClick={() => {
                  if (sendCurrency === "USD") {
                    // Convert current USD amount to ZAR
                    setZarAmount(Math.round(zarAmount * usdZar / 100) * 100);
                  }
                  setSendCurrency("ZAR");
                }}
              >🇿🇦 ZAR</button>
              <button
                className={`curr-pill ${sendCurrency === "USD" ? "curr-pill--active" : ""}`}
                onClick={() => {
                  if (sendCurrency === "ZAR") {
                    // Convert current ZAR amount to USD equivalent
                    const usdEquiv = Math.round(zarAmount / usdZar / 5) * 5;
                    setZarAmount(Math.max(5, Math.min(270, usdEquiv)));
                  }
                  setSendCurrency("USD");
                }}
              >🇺🇸 USD</button>
            </div>
            <div className="amount-input-wrap">
              <span className="amount-prefix">{sendCurrency}</span>
              <input
                type="number"
                className="amount-input"
                value={zarAmount}
                min={sendCurrency === "ZAR" ? 100 : 5}
                max={sendCurrency === "ZAR" ? 5000 : 270}
                step={sendCurrency === "ZAR" ? 100 : 5}
                onChange={e => setZarAmount(Number(e.target.value))}
              />
            </div>
            <div className="amount-slider-wrap">
              <input
                type="range"
                className="amount-slider"
                min={sendCurrency === "ZAR" ? 100 : 5}
                max={sendCurrency === "ZAR" ? 5000 : 270}
                step={sendCurrency === "ZAR" ? 100 : 5}
                value={zarAmount}
                onChange={e => setZarAmount(Number(e.target.value))}
              />
              <div className="slider-labels">
                <span>{sendCurrency === "ZAR" ? "R100" : "$5"}</span>
                <span>{sendCurrency === "ZAR" ? "R5,000" : "$270"}</span>
              </div>
            </div>
          </section>

          {/* Rate result */}
          <section className="card rate-card">
            {loading ? (
              <div className="rate-loading">
                <div className="spinner" />
                <span>{t.loading}</span>
              </div>
            ) : error ? (
              <div className="rate-error">
                <span>⚠️ {t.error}</span>
                <button className="retry-btn" onClick={() => fetchRate(activeCountry, langKey)}>↻</button>
              </div>
            ) : rateData ? (
              (() => {
                const receiveAmt = computeReceive(activeCountry, zarAmount, sendCurrency, rateData);
                const zarEquiv = sendCurrency === "USD" ? (zarAmount * usdZar).toFixed(0) : null;
                return (
                  <div className="rate-result">
                    <div className="rate-summary-box">
                      <div className="rate-summary-row">
                        <div className="rate-summary-item">
                          <span className="rate-summary-label">{t.sending}</span>
                          <span className="rate-summary-send">
                            {sendCurrency} {zarAmount.toLocaleString()}
                            {zarEquiv && activeCountry !== "somalia" && (
                              <span className="rate-zar-equiv">≈ ZAR {Number(zarEquiv).toLocaleString()}</span>
                            )}
                          </span>
                        </div>
                        <div className="rate-arrow">→</div>
                        <div className="rate-summary-item rate-summary-item--right">
                          <span className="rate-summary-label">{t.receiving}</span>
                          <span className="rate-summary-receive">
                            {receiveAmt
                              ? (() => {
                                  // Somalia pays out USD - if user inputs USD, show ZAR→USD rate info
                                  // but receive amount is correctly calculated from ZAR equivalent
                                  return `${payout.symbol}${Number(receiveAmt).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
                                })()
                              : <span style={{fontSize:"13px",color:"rgba(255,255,255,0.5)"}}>Calculating…</span>
                            }
                          </span>
                        </div>
                      </div>
                      <div className="rate-per-unit">
                        R1,000 ZAR → {payout.symbol}{computeReceive(activeCountry, 1000, "ZAR", rateData) || "…"} · {t.updated}
                      </div>
                    </div>
                    <p className="rate-disclaimer">⏱ {t.disclaimer}</p>
                  </div>
                );
              })()
            ) : null}
          </section>

          {/* Limits */}
          <section className="card limits-card">
            <h3 className="card-title">{t.limits}</h3>
            <div className="limits-grid">
              <div className="limit-item">
                <span className="limit-icon">📅</span>
                <div>
                  <div className="limit-label">{t.dailyLimit}</div>
                  <div className="limit-value">{LIMITS.daily}</div>
                </div>
              </div>
              <div className="limit-item">
                <span className="limit-icon">📆</span>
                <div>
                  <div className="limit-label">{t.monthlyLimit}</div>
                  <div className="limit-value">{LIMITS.monthly}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Payout options */}
          <section className="card payout-card">
            <h3 className="card-title">{t.payoutVia}</h3>
            <div className="payout-sections">
              {payout.partners.map((section, i) => (
                <div key={i} className="payout-section">
                  <div className="payout-section-label">
                    <span>{section.icon}</span> {section.label}
                  </div>
                  <div className="payout-chips">
                    {section.items.map((item, j) => (
                      <span key={j} className="payout-chip">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
              <div className="payout-currency-badge">
                Pays out in {payout.currency}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="card how-card">
            <h3 className="card-title">{t.howItWorks}</h3>
            <ol className="steps">
              <li className="step">
                <span className="step-num">1</span>
                <span className="step-text">{t.step1}</span>
              </li>
              <li className="step">
                <span className="step-num">2</span>
                <span className="step-text">{t.step2}</span>
              </li>
              <li className="step">
                <span className="step-num">3</span>
                <span className="step-text">{t.step3}</span>
              </li>
            </ol>
          </section>

          {/* CTA */}
          <a
            className="cta-btn"
            href="https://wa.me/16626647726"
            target="_blank"
            rel="noopener noreferrer"
          >
            💬 {t.sendMoney} via WhatsApp
          </a>

          <footer className="footer">
            <p>© {new Date().getFullYear()} Shop2Shop Money Transfer</p>
            <p>Licensed by SARB · FSCA Regulated</p>
          </footer>
        </main>
      </div>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-size: 16px; }
        body {
          font-family: 'Nunito Sans', sans-serif;
          background: #f0f2f5;
          color: #1b2a4a;
          -webkit-font-smoothing: antialiased;
        }
      `}</style>

      <style jsx>{`
        /* ── Page Layout ─────────────────────────────────────── */
        .page {
          min-height: 100vh;
          max-width: 480px;
          margin: 0 auto;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          box-shadow: 0 0 40px rgba(0,0,0,0.08);
        }

        /* ── Header ──────────────────────────────────────────── */
        .header {
          background: #1b2a4a;
          padding: 18px 24px 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-img {
          width: 70%;
          height: auto;
          display: block;
        }

        /* ── Page Title ──────────────────────────────────────── */
        .page-title-wrap {
          background: #1b2a4a;
          padding: 0 20px 18px;
          text-align: center;
        }
        .page-title {
          font-family: 'Nunito', sans-serif;
          font-size: 30px;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -0.5px;
        }

        /* ── Flag Nav ────────────────────────────────────────── */
        .flag-nav {
          background: #1b2a4a;
          display: flex;
          justify-content: stretch;
          gap: 4px;
          padding: 0 10px 14px;
          flex-wrap: nowrap;
        }
        .flag-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          background: rgba(255,255,255,0.08);
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 7px 4px 6px;
          cursor: pointer;
          transition: all 0.18s ease;
          flex: 1;
          min-width: 0;
        }
        .flag-btn:hover {
          background: rgba(249,162,37,0.18);
          border-color: rgba(249,162,37,0.4);
        }
        .flag-btn--active {
          background: rgba(249,162,37,0.15);
          border-color: #f9a225;
        }
        .flag-emoji {
          font-size: 24px;
          line-height: 1;
        }
        .flag-label {
          font-size: 9px;
          font-weight: 700;
          color: rgba(255,255,255,0.75);
          text-transform: uppercase;
          letter-spacing: 0.3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
          text-align: center;
        }
        .flag-btn--active .flag-label {
          color: #f9a225;
        }

        /* ── Language Toggle ─────────────────────────────────── */
        .lang-toggle-wrap {
          display: flex;
          justify-content: center;
          gap: 8px;
          padding: 14px 20px;
          background: #f7f8fa;
          border-bottom: 1px solid #e8eaed;
        }
        .lang-pill {
          padding: 6px 18px;
          border-radius: 20px;
          border: 2px solid #d0d4dc;
          background: #ffffff;
          font-family: 'Nunito Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #555;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .lang-pill:hover {
          border-color: #f9a225;
          color: #f9a225;
        }
        .lang-pill--active {
          background: #f9a225;
          border-color: #f9a225;
          color: #1b2a4a;
        }

        /* ── Content ─────────────────────────────────────────── */
        .content {
          padding: 16px 16px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* ── Cards ───────────────────────────────────────────── */
        .card {
          background: #ffffff;
          border-radius: 16px;
          padding: 18px;
          border: 1px solid #e8eaed;
          box-shadow: 0 2px 8px rgba(27,42,74,0.06);
        }
        .card-title {
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 800;
          color: #1b2a4a;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 14px;
        }

        /* ── Amount Card ─────────────────────────────────────── */
        .amount-currency-toggle {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }
        .curr-pill {
          flex: 1;
          padding: 8px;
          border-radius: 10px;
          border: 2px solid #e8eaed;
          background: #f7f8fa;
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 800;
          color: #888;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .curr-pill--active {
          background: #1b2a4a;
          border-color: #1b2a4a;
          color: #f9a225;
        }
        .amount-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 10px;
        }
        .rate-zar-equiv {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.45);
          margin-top: 2px;
        }
        .amount-input-wrap {
          display: flex;
          align-items: stretch;
          gap: 0;
          border: 2px solid #1b2a4a;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 14px;
        }
        .amount-prefix {
          background: #1b2a4a;
          color: #f9a225;
          padding: 10px 14px;
          font-weight: 800;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .amount-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 10px 14px;
          font-size: 20px;
          font-weight: 800;
          font-family: 'Nunito', sans-serif;
          color: #1b2a4a;
          background: #ffffff;
          width: 100%;
          min-width: 0;
        }
        .amount-slider-wrap { display: flex; flex-direction: column; gap: 4px; }
        .amount-slider {
          width: 100%;
          accent-color: #f9a225;
          height: 4px;
          cursor: pointer;
        }
        .slider-labels {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #aaa;
          font-weight: 600;
        }

        /* ── Rate Card ───────────────────────────────────────── */
        .rate-loading, .rate-error {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          color: #666;
          font-size: 14px;
        }
        .spinner {
          width: 20px; height: 20px;
          border: 3px solid #e8eaed;
          border-top-color: #f9a225;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .retry-btn {
          background: #f9a225;
          border: none;
          border-radius: 8px;
          padding: 4px 12px;
          font-size: 16px;
          cursor: pointer;
          margin-left: auto;
        }
        .rate-result { display: flex; flex-direction: column; gap: 10px; }
        .rate-summary-box {
          background: linear-gradient(135deg, #1b2a4a 0%, #243660 100%);
          border-radius: 14px;
          padding: 20px;
        }
        .rate-summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .rate-summary-item { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .rate-summary-item--right { align-items: flex-end; }
        .rate-summary-label {
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .rate-summary-send {
          font-family: 'Nunito', sans-serif;
          font-size: 22px;
          font-weight: 900;
          color: #ffffff;
        }
        .rate-summary-receive {
          font-family: 'Nunito', sans-serif;
          font-size: 28px;
          font-weight: 900;
          color: #f9a225;
        }
        .rate-arrow {
          font-size: 20px;
          color: rgba(255,255,255,0.3);
          flex-shrink: 0;
        }
        .rate-per-unit {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.1);
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.5);
          text-align: center;
        }
        .rate-divider { height: 1px; background: #e8eaed; }
        .rate-disclaimer { font-size: 11px; color: #aaa; line-height: 1.5; margin-top: 4px; }

        /* ── Limits ──────────────────────────────────────────── */
        .limits-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .limit-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f7f8fa;
          border-radius: 10px;
          padding: 12px;
        }
        .limit-icon { font-size: 20px; }
        .limit-label { font-size: 11px; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .limit-value { font-size: 15px; font-weight: 800; color: #1b2a4a; font-family: 'Nunito', sans-serif; }

        /* ── Payout ──────────────────────────────────────────── */
        .payout-sections { display: flex; flex-direction: column; gap: 12px; }
        .payout-section-label {
          font-size: 12px;
          font-weight: 700;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 6px;
        }
        .payout-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .payout-chip {
          background: #f0f4ff;
          border: 1px solid #c8d4f0;
          color: #1b2a4a;
          font-size: 13px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 20px;
        }
        .payout-currency-badge {
          background: #1b2a4a;
          color: #f9a225;
          font-size: 12px;
          font-weight: 800;
          padding: 6px 14px;
          border-radius: 20px;
          align-self: flex-start;
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* ── Steps ───────────────────────────────────────────── */
        .steps { display: flex; flex-direction: column; gap: 10px; list-style: none; }
        .step {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .step-num {
          width: 28px; height: 28px;
          background: #f9a225;
          color: #1b2a4a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          flex-shrink: 0;
        }
        .step-text { font-size: 14px; font-weight: 600; color: #333; }

        /* ── CTA ─────────────────────────────────────────────── */
        .cta-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #25D366;
          color: #ffffff;
          text-decoration: none;
          font-family: 'Nunito', sans-serif;
          font-size: 16px;
          font-weight: 800;
          border-radius: 14px;
          padding: 16px;
          margin: 4px 0 0;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 4px 16px rgba(37,211,102,0.3);
        }
        .cta-btn:active { transform: scale(0.98); }

        /* ── Footer ──────────────────────────────────────────── */
        .footer {
          text-align: center;
          padding: 24px 20px 32px;
          font-size: 11px;
          color: #aaa;
          line-height: 1.8;
        }
      `}</style>
    </>
  );
}
