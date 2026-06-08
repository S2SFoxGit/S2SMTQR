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
  const [rateData, setRateData]             = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);

  const langKey = useLocalLang ? LANGUAGES[activeCountry].code : "en";
  const t       = UI_TEXT[langKey] || UI_TEXT.en;
  const isRtl   = useLocalLang && LANGUAGES[activeCountry].dir === "rtl";

  const fetchRate = useCallback(async (country, lang, amount) => {
    setLoading(true);
    setError(null);
    try {
      const apiLang = LANG_CODE[lang] || "1";
      const res = await fetch(`/api/rates?country=${country}&lang=${apiLang}&amount=${amount}`);
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      setRateData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRate(activeCountry, langKey, zarAmount);
  }, [activeCountry, langKey, zarAmount, fetchRate]);

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
          <div className="logo-wrap">
            {/* SVG logo — Shop2Shop brand mark */}
            <svg className="logo-svg" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Camel icon */}
              <g>
                <ellipse cx="22" cy="38" rx="12" ry="8" fill="#f9a225"/>
                <ellipse cx="30" cy="33" rx="7" ry="10" fill="#f9a225"/>
                <ellipse cx="20" cy="32" rx="5" ry="8" fill="#f9a225"/>
                <rect x="12" y="44" width="4" height="10" rx="2" fill="#f9a225"/>
                <rect x="18" y="44" width="4" height="10" rx="2" fill="#f9a225"/>
                <rect x="26" y="44" width="4" height="10" rx="2" fill="#f9a225"/>
                <rect x="32" y="44" width="4" height="10" rx="2" fill="#f9a225"/>
                <circle cx="37" cy="28" r="4" fill="#f9a225"/>
                <rect x="35" y="28" width="4" height="8" rx="2" fill="#f9a225"/>
                {/* Hump */}
                <ellipse cx="22" cy="26" rx="5" ry="6" fill="#e8920f"/>
              </g>
              {/* Shop2Shop text */}
              <text x="50" y="30" fontFamily="Nunito, sans-serif" fontWeight="900" fontSize="18" fill="#1b2a4a">Shop</text>
              <text x="95" y="30" fontFamily="Nunito, sans-serif" fontWeight="900" fontSize="18" fill="#f9a225">2</text>
              <text x="108" y="30" fontFamily="Nunito, sans-serif" fontWeight="900" fontSize="18" fill="#1b2a4a">Shop</text>
              <text x="50" y="46" fontFamily="Nunito Sans, sans-serif" fontWeight="600" fontSize="11" fill="#666" letterSpacing="2">MONEY TRANSFER</text>
            </svg>
          </div>
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
            <label className="amount-label">{t.zarAmount}</label>
            <div className="amount-input-wrap">
              <span className="amount-prefix">ZAR</span>
              <input
                type="number"
                className="amount-input"
                value={zarAmount}
                min={100}
                max={5000}
                step={100}
                onChange={e => setZarAmount(Number(e.target.value))}
              />
            </div>
            <div className="amount-slider-wrap">
              <input
                type="range"
                className="amount-slider"
                min={100}
                max={5000}
                step={100}
                value={zarAmount}
                onChange={e => setZarAmount(Number(e.target.value))}
              />
              <div className="slider-labels">
                <span>R100</span>
                <span>R5,000</span>
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
                <button className="retry-btn" onClick={() => fetchRate(activeCountry, langKey, zarAmount)}>↻</button>
              </div>
            ) : rateData ? (
              <div className="rate-result">
                <div className="rate-row">
                  <span className="rate-row-label">{t.sending}</span>
                  <span className="rate-row-value">
                    <strong>ZAR {zarAmount.toLocaleString()}</strong>
                  </span>
                </div>
                <div className="rate-divider" />
                <div className="rate-row rate-row--highlight">
                  <span className="rate-row-label">{t.receiving}</span>
                  <span className="rate-row-value rate-row-value--big">
                    {rateData.receive_amount
                      ? `${payout.symbol} ${Number(rateData.receive_amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                      : rateData.message
                        ? <span style={{fontSize:"13px",lineHeight:"1.4"}}>{rateData.message}</span>
                        : "—"
                    }
                  </span>
                </div>
                {rateData.rate && (
                  <div className="rate-row rate-row--small">
                    <span className="rate-row-label">{t.rate}</span>
                    <span className="rate-row-value">{rateData.rate}</span>
                  </div>
                )}
                <p className="rate-disclaimer">⏱ {t.updated} · {t.disclaimer}</p>
              </div>
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
          padding: 16px 20px 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-svg {
          width: 190px;
          height: auto;
        }

        /* ── Page Title ──────────────────────────────────────── */
        .page-title-wrap {
          background: #1b2a4a;
          padding: 0 20px 18px;
          text-align: center;
        }
        .page-title {
          font-family: 'Nunito', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.3px;
        }

        /* ── Flag Nav ────────────────────────────────────────── */
        .flag-nav {
          background: #1b2a4a;
          display: flex;
          justify-content: center;
          gap: 6px;
          padding: 0 12px 16px;
          flex-wrap: nowrap;
          overflow-x: auto;
        }
        .flag-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: rgba(255,255,255,0.08);
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 8px 10px 7px;
          cursor: pointer;
          transition: all 0.18s ease;
          min-width: 64px;
          flex-shrink: 0;
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
          font-size: 28px;
          line-height: 1;
        }
        .flag-label {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.75);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
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
        .amount-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 10px;
        }
        .amount-input-wrap {
          display: flex;
          align-items: center;
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
        .rate-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .rate-row--highlight { background: #fff8ec; border-radius: 10px; padding: 10px 12px; margin: 0 -4px; }
        .rate-row--small { opacity: 0.7; }
        .rate-row-label { font-size: 13px; font-weight: 600; color: #666; }
        .rate-row-value { font-size: 15px; font-weight: 700; color: #1b2a4a; }
        .rate-row-value--big { font-size: 24px; font-weight: 900; color: #f9a225; font-family: 'Nunito', sans-serif; }
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
