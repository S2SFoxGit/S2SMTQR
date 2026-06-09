import React, { useState, useEffect, useCallback } from "react";
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
      { icon: "📱", label_key: "mobileWallets", items: ["EVC Plus", "Zaad", "Sahal"] },
      { icon: "💵", label_key: "cashPickup",   items: ["Dahabshiil", "Taaj"] },
    ],
  },
  bangladesh: {
    currency: "BDT",
    symbol: "৳",
    partners: [
      { icon: "📱", label_key: "mobileWallets", items: ["bKash", "Nagad", "Rocket"] },
      { icon: "🏦", label_key: "bankTransfer",  items: ["63"] },
    ],
  },
  ethiopia: {
    currency: "ETB",
    symbol: "Br",
    partners: [
      { icon: "🏦", label_key: "bankTransfer",    items: ["Commercial Bank of Ethiopia (CBE Connect)"] },
      { icon: "📱", label_key: "mobileWallets", items: ["Telebirr"] },
    ],
  },
  kenya: {
    currency: "KES",
    symbol: "KSh",
    partners: [
      { icon: "📱", label_key: "mobileWallets",  items: ["M-Pesa"] },
      { icon: "💵", label_key: "cashPickup",   items: ["Taaj"] },
    ],
  },
  pakistan: {
    currency: "PKR",
    symbol: "₨",
    partners: [
      { icon: "📱", label_key: "mobileWallets", items: ["JazzCash", "EasyPaisa", "NayaPay", "SadaPay"] },
      { icon: "🏦", label_key: "bankTransfer",  items: ["46"] },
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
    mobileWallets:  "Mobile Wallets",
    cashPickup:     "Cash Pick-Up",
    bankTransfer:   "Bank Transfer",
    paysOutIn:      "Pays out in",
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
    mobileWallets:       "Mobile Wallets",
    cashPickup:          "Cash Pick-Up",
    bankTransfer:        "Bank Transfer",
    paysOutIn:           "Pays out in",
    banksSupported:      "banks supported",
    faqTitle:            "Frequently Asked Questions",
    howItWorksTitle:     "How It Works",
    sendLimits:          "Send Limits",
    dailyLimit:          "Daily Limit",
    monthlyLimit:        "Monthly Limit",
    payoutOptions:       "Payout Options",
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
    mobileWallets:       "Lacag-saarka Gacanta",
    cashPickup:          "Lacag Caddaan Qaadashada",
    bankTransfer:        "Wareejinta Bangiga",
    paysOutIn:           "Waxaa lagu bixiyaa",
    banksSupported:      "bangi la taageerayo",
    faqTitle:            "Su'aalaha Badanaa La Weydiiyo",
    howItWorksTitle:     "Sida Shaqaysa",
    sendLimits:          "Xadka Diridda",
    dailyLimit:          "Xadka Maalinlaha",
    monthlyLimit:        "Xadka Bishii",
    payoutOptions:       "Siyaabaha Lacag-bixinta",
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
    mobileWallets:       "মোবাইল ওয়ালেট",
    cashPickup:          "নগদ সংগ্রহ",
    bankTransfer:        "ব্যাংক ট্রান্সফার",
    paysOutIn:           "পেআউট হয়",
    banksSupported:      "টি ব্যাংক সমর্থিত",
    faqTitle:            "সচরাচর জিজ্ঞাসিত প্রশ্ন",
    howItWorksTitle:     "কীভাবে কাজ করে",
    sendLimits:          "পাঠানোর সীমা",
    dailyLimit:          "দৈনিক সীমা",
    monthlyLimit:        "মাসিক সীমা",
    payoutOptions:       "পেমেন্ট অপশন",
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
    mobileWallets:       "የሞባይል ዋሌቶች",
    cashPickup:          "የጥሬ ገንዘብ መውሰጃ",
    bankTransfer:        "የባንክ ዝውውር",
    paysOutIn:           "ክፍያ የሚደረገው",
    banksSupported:      "ባንኮች ይደገፋሉ",
    faqTitle:            "ተደጋጋሚ የሚጠየቁ ጥያቄዎች",
    howItWorksTitle:     "እንዴት እንደሚሰራ",
    sendLimits:          "የላክ ወሰኖች",
    dailyLimit:          "የዕለት ገደብ",
    monthlyLimit:        "የወር ገደብ",
    payoutOptions:       "የክፍያ አማራጮች",
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
    mobileWallets:       "موبائل والٹس",
    cashPickup:          "نقد وصولی",
    bankTransfer:        "بینک ٹرانسفر",
    paysOutIn:           "ادائیگی کی جاتی ہے",
    banksSupported:      "بینک سپورٹ کیے جاتے ہیں",
    faqTitle:            "اکثر پوچھے جانے والے سوالات",
    howItWorksTitle:     "یہ کیسے کام کرتا ہے",
    sendLimits:          "بھیجنے کی حدود",
    dailyLimit:          "یومی حد",
    monthlyLimit:        "ماہانہ حد",
    payoutOptions:       "ادائیگی کے اختیارات",
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
    mobileWallets:       "Pochi za Simu",
    cashPickup:          "Ukusanyaji wa Pesa Taslimu",
    bankTransfer:        "Uhamisho wa Benki",
    paysOutIn:           "Inalipa katika",
    banksSupported:      "benki zinazoungwa mkono",
    faqTitle:            "Maswali Yanayoulizwa Mara Kwa Mara",
    howItWorksTitle:     "Jinsi Inavyofanya Kazi",
    sendLimits:          "Mipaka ya Kutuma",
    dailyLimit:          "Kikomo cha Kila Siku",
    monthlyLimit:        "Kikomo cha Kila Mwezi",
    payoutOptions:       "Chaguzi za Malipo",
  },
};

// ── How It Works — per country, per language ─────────────────────────────────

const HOW_IT_WORKS = {
  somalia: {
    en: [
      "Open the Shop2Shop App",
      "Tap the Money Transfer icon to initiate the transfer",
      "Select Destination Country: Somalia",
      "Select Product/Service: EVC Plus, Zaad, Sahal or Dahabshiil cash pick-up",
      "Fill in recipient mobile number or ID details",
      "Review and accept the quote",
      "Transaction Receipt: SUCCESSFUL",
    ],
    so: [
      "Fur App-ka Shop2Shop",
      "Taabo astaanta Wareejinta Lacagta si aad u bilowdo",
      "Dooro Dalka La Dirayo: Soomaaliya",
      "Dooro Adeegga: EVC Plus, Zaad, Sahal ama lacag caddaan ah Dahabshiil",
      "Geli lambarka telefoonka ama aqoonsiga qofka lacagta qaadanaya",
      "Dib u eeg oo aqbali qiimaha",
      "Rasiidka Macamalka: GUULEYSTAY",
    ],
  },
  bangladesh: {
    en: [
      "Open the Shop2Shop App",
      "Tap the Money Transfer icon to initiate the transfer",
      "Select Destination Country: Bangladesh",
      "Select Product/Service: bKash, Nagad, Rocket or bank transfer",
      "Fill in recipient mobile number or bank account details",
      "Review and accept the quote",
      "Transaction Receipt: SUCCESSFUL",
    ],
    bn: [
      "Shop2Shop অ্যাপ খুলুন",
      "ট্রান্সফার শুরু করতে মানি ট্রান্সফার আইকনে ট্যাপ করুন",
      "গন্তব্য দেশ নির্বাচন করুন: বাংলাদেশ",
      "পরিষেবা নির্বাচন করুন: bKash, Nagad, Rocket বা ব্যাংক ট্রান্সফার",
      "প্রাপকের মোবাইল নম্বর বা ব্যাংক অ্যাকাউন্টের বিবরণ পূরণ করুন",
      "কোটটি পর্যালোচনা করুন এবং গ্রহণ করুন",
      "লেনদেনের রসিদ: সফল",
    ],
  },
  ethiopia: {
    en: [
      "Open the Shop2Shop App",
      "Tap the Money Transfer icon to initiate the transfer",
      "Select Destination Country: Ethiopia",
      "Select Product/Service: CBE Connect or Telebirr",
      "Fill in recipient account or mobile number details",
      "Review and accept the quote",
      "Transaction Receipt: SUCCESSFUL",
    ],
    am: [
      "Shop2Shop አፕ ይክፈቱ",
      "ዝውውሩን ለመጀመር የገንዘብ ዝውውር አዶን ይጫኑ",
      "መድረሻ ሀገር ይምረጡ: ኢትዮጵያ",
      "አገልግሎት ይምረጡ: CBE Connect ወይም Telebirr",
      "የተቀባዩን አካውንት ወይም ሞባይል ቁጥር ዝርዝር ይሙሉ",
      "ጥቅሱን ይገምግሙ እና ይቀበሉ",
      "የግብይት ደረሰኝ: ተሳክቷል",
    ],
  },
  kenya: {
    en: [
      "Open the Shop2Shop App",
      "Tap the Money Transfer icon to initiate the transfer",
      "Select Destination Country: Kenya",
      "Select Product/Service: M-Pesa or Taaj cash pick-up",
      "Fill in recipient M-Pesa number or ID details",
      "Review and accept the quote",
      "Transaction Receipt: SUCCESSFUL",
    ],
    sw: [
      "Fungua App ya Shop2Shop",
      "Gusa aikoni ya Uhamisho wa Pesa kuanza uhamisho",
      "Chagua Nchi ya Marudio: Kenya",
      "Chagua Huduma: M-Pesa au mkusanyiko wa pesa taslimu wa Taaj",
      "Jaza nambari ya M-Pesa au maelezo ya kitambulisho cha mpokeaji",
      "Kagua na kukubali bei",
      "Risiti ya Muamala: IMEFAULU",
    ],
  },
  pakistan: {
    en: [
      "Open the Shop2Shop App",
      "Tap the Money Transfer icon to initiate the transfer",
      "Select Destination Country: Pakistan",
      "Select Product/Service: JazzCash, EasyPaisa, NayaPay, SadaPay or bank transfer",
      "Fill in recipient mobile number or bank account details",
      "Review and accept the quote",
      "Transaction Receipt: SUCCESSFUL",
    ],
    ur: [
      "Shop2Shop ایپ کھولیں",
      "ٹرانسفر شروع کرنے کے لیے منی ٹرانسفر آئیکن پر ٹیپ کریں",
      "منزل ملک منتخب کریں: پاکستان",
      "سروس منتخب کریں: JazzCash، EasyPaisa، NayaPay، SadaPay یا بینک ٹرانسفر",
      "وصول کنندہ کا موبائل نمبر یا بینک اکاؤنٹ کی تفصیلات بھریں",
      "قیمت کا جائزہ لیں اور قبول کریں",
      "لین دین کی رسید: کامیاب",
    ],
  },
};

// ── FAQ Data — per country, per language ─────────────────────────────────────

const COMMON_FAQS = {
  en: [
    { q: "What is the customer care number?", a: "Call us free on 0800 811 111 (toll-free from any SA network, Mon–Fri 8am–5pm)." },
    { q: "What do I do if I sent money to the wrong number?", a: "Call 0800 811 111 immediately. If the transaction has not yet been paid out we can reverse it. Once paid out, reversals are not guaranteed — always double-check the recipient number before confirming." },
    { q: "How long does a transfer take?", a: "Most transfers are paid out within minutes. In rare cases it can take up to 24 hours depending on the payout partner." },
    { q: "What are the send limits?", a: "You can send up to ZAR 5,000 per day and ZAR 25,000 per month." },
    { q: "Are there any fees?", a: "Shop2Shop charges no separate transaction fee — our rate already includes all costs. The recipient gets the amount shown." },
    { q: "What documents do I need?", a: "You need a valid South African ID or passport. The recipient's details (mobile number, wallet ID or bank account) are required at the time of transfer." },
    { q: "Is my money safe?", a: "Yes. Shop2Shop Money Transfer is licensed by the South African Reserve Bank (SARB) and regulated by the FSCA." },
    { q: "Can I cancel a transfer?", a: "You can request a cancellation before the money is paid out by calling 0800 811 111. Once the recipient has received the funds, cancellation is not possible." },
    { q: "Why is the rate different from what I see online?", a: "Our rate includes a small margin that covers the cost of the service. The rate shown is live and indicative — the final confirmed rate is provided at the Shop2Shop store before you commit." },
  ],
  so: [
    { q: "Waa maxay lambarka xiriirada macaamiisha?", a: "Noo wac bilaash 0800 811 111 (bilaash ah xarunaha SA, Isniinta–Jimcaha 8subax–5galabnimo)." },
    { q: "Maxaan sameeyaa haddaan lacag u diro lambarka khaldan?", a: "Wac 0800 811 111 si deg deg ah. Haddaan lacagta la bixin weli waxaan awoodnaa inaan soo celinno. Markii la bixiyey, celinta lama dammaanad qaado — had iyo jeer hubi lambarka qaadaha kahor xaqiijinta." },
    { q: "Muddo intee leh ayay wareejintu qaadataa?", a: "Wareejimaha badan waxaa la bixiyaa daqiiqado gudahood. Xaaladaha qaar waxay qaadan kartaa ilaa 24 saacadood iyadoo ku xidna shirkadda bixinta." },
    { q: "Maxay yihiin xadduudyada dirista?", a: "Waxaad diri kartaa ilaa ZAR 5,000 maalintii iyo ZAR 25,000 bishii." },
    { q: "Ma jiraan khidmad biilal ah?", a: "Shop2Shop kuma shubto khidmad biil ah — qiimahayagu waxa uu ku darsan yahay dhammaan kharashyada. Qaadahuhu wuxuu helayaa xaddiga la muujiyey." },
    { q: "Waa maxay dokumiintiyada aan u baahnahay?", a: "Waxaad u baahan tahay aqoonsi South Africa ah ama baasaboor. Macluumaadka qaadaha (lambarka telefoonka, aqoonsiga lacag-saarka ama xisaabta bangiga) ayaa loo baahan yahay wakhtiga wareejinta." },
    { q: "Ma lacagteydii badbaadaa?", a: "Haa. Shop2Shop Money Transfer waxa ay leedahay shatiga South African Reserve Bank (SARB) oo ay maamulto FSCA." },
    { q: "Ma joojin karaa wareejin?", a: "Waxaad codsanaysaa joojinta kahor inta aan lacagta la bixin adigoo wacaya 0800 811 111. Markii qaadahuhu helay lacagta, joojinta ma suurtogalto." },
    { q: "Maxay u kala duwan tahay qiimaha aan arko internetka?", a: "Qiimahayagu wuxuu ku darsan yahay margin yar oo daboolaya kharashka adeegga. Qiimaha la muujiyey waa mid toos ah oo tilmaameed — qiimaha ugu dambeeya waxaa lagu xaqiijiyaa dukaaanka Shop2Shop." },
  ],
  bn: [
    { q: "গ্রাহক সেবা নম্বর কী?", a: "আমাদের বিনামূল্যে কল করুন 0800 811 111 (যেকোনো SA নেটওয়ার্ক থেকে টোল-ফ্রি, সোম–শুক্র সকাল ৮টা–বিকাল ৫টা)।" },
    { q: "ভুল নম্বরে টাকা পাঠালে কী করব?", a: "অবিলম্বে 0800 811 111 কল করুন। লেনদেন এখনও পরিশোধ না হলে আমরা তা বাতিল করতে পারি। পরিশোধের পর বাতিল নিশ্চিত নয় — নিশ্চিত করার আগে সর্বদা প্রাপকের নম্বর দুবার যাচাই করুন।" },
    { q: "ট্রান্সফার কতক্ষণ সময় নেয়?", a: "বেশিরভাগ ট্রান্সফার মিনিটের মধ্যে পরিশোধ হয়। বিরল ক্ষেত্রে পেআউট পার্টনারের উপর নির্ভর করে ২৪ ঘণ্টা পর্যন্ত সময় লাগতে পারে।" },
    { q: "পাঠানোর সীমা কত?", a: "আপনি প্রতিদিন ZAR 5,000 এবং প্রতি মাসে ZAR 25,000 পর্যন্ত পাঠাতে পারবেন।" },
    { q: "কোনো ফি আছে কি?", a: "Shop2Shop আলাদা কোনো লেনদেন ফি নেয় না — আমাদের রেটে সমস্ত খরচ অন্তর্ভুক্ত। প্রাপক প্রদর্শিত পরিমাণ পাবেন।" },
    { q: "আমার কোন কাগজপত্র দরকার?", a: "আপনার একটি বৈধ দক্ষিণ আফ্রিকান আইডি বা পাসপোর্ট প্রয়োজন। ট্রান্সফারের সময় প্রাপকের তথ্য (মোবাইল নম্বর, ওয়ালেট আইডি বা ব্যাংক অ্যাকাউন্ট) প্রয়োজন।" },
    { q: "আমার টাকা কি নিরাপদ?", a: "হ্যাঁ। Shop2Shop Money Transfer দক্ষিণ আফ্রিকান রিজার্ভ ব্যাংক (SARB) কর্তৃক লাইসেন্সপ্রাপ্ত এবং FSCA দ্বারা নিয়ন্ত্রিত।" },
    { q: "আমি কি ট্রান্সফার বাতিল করতে পারি?", a: "0800 811 111 কল করে টাকা পরিশোধের আগে বাতিলের অনুরোধ করতে পারেন। প্রাপক অর্থ পাওয়ার পর বাতিল সম্ভব নয়।" },
    { q: "অনলাইনে দেখা রেট থেকে আলাদা কেন?", a: "আমাদের রেটে পরিষেবার খরচ কভার করার জন্য একটি ছোট মার্জিন অন্তর্ভুক্ত। দেখানো রেট লাইভ এবং আনুমানিক — চূড়ান্ত নিশ্চিত রেট Shop2Shop স্টোরে প্রদান করা হয়।" },
  ],
  am: [
    { q: "የደንበኞች አገልግሎት ቁጥር ምንድን ነው?", a: "በ 0800 811 111 ነጻ ይደውሉልን (ከማንኛውም SA አውታረ መረብ ቶል-ፍሪ፣ ሰኞ–ዓርብ ከጥዋቱ 8 እስከ ከሰዓቱ 5)።" },
    { q: "ወደ ስህተት ቁጥር ገንዘብ ከላኩ ምን ማድረግ አለብኝ?", a: "ወዲያውኑ 0800 811 111 ይደውሉ። ክፍያው ገና ካልተፈጸመ መቀልበስ እንችላለን። ከተከፈለ በኋላ፣ ተመላሽ ዋስትና አይሰጥም — ከማረጋገጥዎ በፊት ሁልጊዜ የተቀባዩን ቁጥር ደጋግመው ያረጋግጡ።" },
    { q: "ዝውውር ምን ያህል ጊዜ ይወስዳል?", a: "አብዛኛዎቹ ዝውውሮች በደቂቃዎች ውስጥ ይከፈላሉ። አልፎ አልፎ እስከ 24 ሰዓት ሊወስድ ይችላል።" },
    { q: "የላክ ገደቦቹ ምን ናቸው?", a: "በቀን እስከ ZAR 5,000 እና በወር እስከ ZAR 25,000 መላክ ይችላሉ።" },
    { q: "ምንም ክፍያ አለ?", a: "Shop2Shop የተለየ የግብይት ክፍያ አያስከፍልም — ዋጋችን ሁሉም ወጪዎችን ያካትታል። ተቀባዩ የሚታየውን ብር ይቀበላል።" },
    { q: "ምን ሰነዶች ያስፈልጉኛል?", a: "የደቡብ አፍሪካ መታወቂያ ወይም ፓስፖርት ያስፈልግዎታል። የዝውውር ጊዜ የተቀባዩ ዝርዝሮች (የሞባይል ቁጥር፣ ወይም የባንክ ሂሳብ) ያስፈልጋሉ።" },
    { q: "ገንዘቤ ደህንነቱ የተጠበቀ ነውን?", a: "አዎ። Shop2Shop Money Transfer በደቡብ አፍሪካ ብሔራዊ ባንክ (SARB) ፈቃድ ያለው እና በFSCA የሚቆጣጠር ነው።" },
    { q: "ዝውውር መሰረዝ ይቻላልን?", a: "ገንዘቡ ከመከፈሉ በፊት 0800 811 111 ደውለው መሰረዝ መጠየቅ ይችላሉ። ተቀባዩ ገንዘቡን ከተቀበለ በኋላ መሰረዝ አይቻልም።" },
    { q: "ዋጋው ከመስመር ላይ ከምመለከተው የተለየ ለምንድን ነው?", a: "ዋጋችን የአገልግሎቱን ወጪ ለመሸፈን ትንሽ ልዩነት ያካትታል። የሚታየው ዋጋ ቀጥታ እና ግምታዊ ነው — የመጨረሻው ዋጋ በShop2Shop መደብር ይረጋገጣል።" },
  ],
  ur: [
    { q: "کسٹمر کیئر نمبر کیا ہے؟", a: "ہمیں مفت کال کریں 0800 811 111 (کسی بھی SA نیٹ ورک سے ٹول فری، پیر–جمعہ صبح 8 بجے سے شام 5 بجے تک)۔" },
    { q: "اگر میں نے غلط نمبر پر پیسے بھیج دیے تو کیا کروں؟", a: "فوری طور پر 0800 811 111 کال کریں۔ اگر ادائیگی ابھی نہیں ہوئی تو ہم اسے واپس کر سکتے ہیں۔ ادائیگی کے بعد واپسی کی ضمانت نہیں — تصدیق سے پہلے ہمیشہ وصول کنندہ کا نمبر دوبارہ چیک کریں۔" },
    { q: "ٹرانسفر میں کتنا وقت لگتا ہے؟", a: "زیادہ تر ٹرانسفر منٹوں میں ہو جاتے ہیں۔ نادر صورتوں میں پے آؤٹ پارٹنر کے مطابق 24 گھنٹے لگ سکتے ہیں۔" },
    { q: "بھیجنے کی حدود کیا ہیں؟", a: "آپ روزانہ ZAR 5,000 اور ماہانہ ZAR 25,000 تک بھیج سکتے ہیں۔" },
    { q: "کیا کوئی فیس ہے؟", a: "Shop2Shop کوئی الگ ٹرانزیکشن فیس نہیں لیتا — ہماری شرح میں تمام اخراجات شامل ہیں۔ وصول کنندہ کو دکھائی گئی رقم ملے گی۔" },
    { q: "مجھے کون سے دستاویزات چاہئیں؟", a: "آپ کو ایک درست جنوبی افریقی شناختی کارڈ یا پاسپورٹ کی ضرورت ہے۔ ٹرانسفر کے وقت وصول کنندہ کی تفصیلات (موبائل نمبر، والٹ آئی ڈی یا بینک اکاؤنٹ) درکار ہیں۔" },
    { q: "کیا میرا پیسہ محفوظ ہے؟", a: "ہاں۔ Shop2Shop Money Transfer جنوبی افریقہ کے ریزرو بینک (SARB) سے لائسنس یافتہ اور FSCA کے زیر نگرانی ہے۔" },
    { q: "کیا میں ٹرانسفر منسوخ کر سکتا ہوں؟", a: "آپ 0800 811 111 کال کرکے ادائیگی سے پہلے منسوخی کی درخواست کر سکتے ہیں۔ وصول کنندہ کو رقم ملنے کے بعد منسوخی ممکن نہیں۔" },
    { q: "شرح آن لائن دیکھی جانے والی شرح سے مختلف کیوں ہے؟", a: "ہماری شرح میں سروس کے اخراجات پورا کرنے کے لیے ایک چھوٹا مارجن شامل ہے۔ دکھائی گئی شرح لائیو اور اندازاً ہے — حتمی تصدیق شدہ شرح Shop2Shop اسٹور پر دی جاتی ہے۔" },
  ],
  sw: [
    { q: "Nambari ya huduma kwa wateja ni nini?", a: "Tupigie simu bure kwa 0800 811 111 (bure kutoka mtandao wowote wa SA, Jumatatu–Ijumaa saa 2 asubuhi–saa 11 jioni)." },
    { q: "Nifanye nini nikituma pesa kwa nambari mbaya?", a: "Piga simu 0800 811 111 mara moja. Kama malipo hayajafanywa bado tunaweza kubatilisha. Baada ya kulipwa, urejeshaji hauhakikishiwa — daima angalia mara mbili nambari ya mpokeaji kabla ya kuthibitisha." },
    { q: "Uhamisho unachukua muda gani?", a: "Uhamisho mwingi hulipwa ndani ya dakika. Katika hali nadra inaweza kuchukua hadi masaa 24 kulingana na mshirika wa malipo." },
    { q: "Vikomo vya kutuma ni vipi?", a: "Unaweza kutuma hadi ZAR 5,000 kwa siku na ZAR 25,000 kwa mwezi." },
    { q: "Kuna ada yoyote?", a: "Shop2Shop haitozaji ada ya miamala tofauti — kiwango chetu tayari kinajumuisha gharama zote. Mpokeaji anapata kiasi kinachoonekana." },
    { q: "Ninahitaji nyaraka gani?", a: "Unahitaji kitambulisho halali cha Afrika Kusini au pasipoti. Maelezo ya mpokeaji (nambari ya simu, kitambulisho cha mkoba au akaunti ya benki) yanahitajika wakati wa uhamisho." },
    { q: "Je, pesa yangu iko salama?", a: "Ndiyo. Shop2Shop Money Transfer ina leseni kutoka Benki Kuu ya Afrika Kusini (SARB) na inadhibitiwa na FSCA." },
    { q: "Je, ninaweza kughairi uhamisho?", a: "Unaweza kuomba kughairi kabla ya pesa haijatolewa kwa kupiga simu 0800 811 111. Mpokeaji akisha kupokea fedha, kughairi hakuwezekani." },
    { q: "Kwa nini kiwango ni tofauti na ninachokiona mtandaoni?", a: "Kiwango chetu kinajumuisha margin ndogo inayoficha gharama ya huduma. Kiwango kinachoonekana ni cha moja kwa moja na cha dalili — kiwango cha mwisho kinathibitishwa katika duka la Shop2Shop." },
  ],
};

const COUNTRY_FAQS = {
  somalia: {
    en: [
      { q: "Which wallets can my recipient use in Somalia?", a: "Recipients can receive via EVC Plus (Hormuud), Zaad (Telesom), Sahal (Somtel), or collect cash through Dahabshiil." },
      { q: "What currency does the recipient get?", a: "Recipients in Somalia receive US Dollars (USD)." },
      { q: "Does my recipient need a smartphone?", a: "For mobile wallets a basic phone is sufficient. For Dahabshiil cash pick-up they need a valid ID." },
    ],
    so: [
      { q: "Goorma lacagta la dirayo waa maxay?", a: "Qaadahuhu waxay ku heli karaan EVC Plus (Hormuud), Zaad (Telesom), Sahal (Somtel), ama lacag caddaan ah Dahabshiil." },
      { q: "Mudnaanta lacagta qaadahuhu helayaa waa maxay?", a: "Qaadayaasha Soomaaliya waxay helayaan Dollar Mareykanka (USD)." },
      { q: "Ma qaadahuhu u baahan yahay taleefoon casri ah?", a: "Lacag-saarka gacanta ee aasaasiga ah, taleefoon caadi ah ayaa ku filan. Dahabshiil-ka lacag caddaanta ah waxay u baahan tahay aqoonsi ansax ah." },
    ],
  },
  bangladesh: {
    en: [
      { q: "Which wallets can my recipient use in Bangladesh?", a: "Recipients can receive via bKash, Nagad, or Rocket. Bank transfers to all major Bangladeshi banks are also supported." },
      { q: "What currency does the recipient get?", a: "Recipients in Bangladesh receive Bangladeshi Taka (BDT)." },
      { q: "How do I send to a bank account in Bangladesh?", a: "You will need the recipient's bank name, branch, account number and routing number. Bring these details to the Shop2Shop store." },
    ],
    bn: [
      { q: "বাংলাদেশে আমার প্রাপক কোন ওয়ালেট ব্যবহার করতে পারবেন?", a: "প্রাপকরা bKash, Nagad, বা Rocket-এর মাধ্যমে পেতে পারেন। সমস্ত প্রধান বাংলাদেশী ব্যাংকে ব্যাংক ট্রান্সফারও সমর্থিত।" },
      { q: "প্রাপক কোন মুদ্রা পাবেন?", a: "বাংলাদেশের প্রাপকরা বাংলাদেশী টাকা (BDT) পাবেন।" },
      { q: "বাংলাদেশে ব্যাংক অ্যাকাউন্টে কীভাবে পাঠাব?", a: "আপনার প্রাপকের ব্যাংকের নাম, শাখা, অ্যাকাউন্ট নম্বর এবং রাউটিং নম্বর প্রয়োজন। এই তথ্যগুলো Shop2Shop স্টোরে নিয়ে আসুন।" },
    ],
  },
  ethiopia: {
    en: [
      { q: "Which services can my recipient use in Ethiopia?", a: "Recipients can receive via CBE Connect (Commercial Bank of Ethiopia) or Telebirr mobile wallet." },
      { q: "What currency does the recipient get?", a: "Recipients in Ethiopia receive Ethiopian Birr (ETB)." },
      { q: "Does my recipient need a CBE bank account?", a: "For CBE Connect, yes. For Telebirr, a registered Telebirr mobile wallet is required." },
    ],
    am: [
      { q: "በኢትዮጵያ ተቀባዩ ምን አገልግሎቶችን መጠቀም ይችላል?", a: "ተቀባዮች CBE Connect (የኢትዮጵያ ንግድ ባንክ) ወይም Telebirr ሞባይል ዋሌት በኩል ሊቀበሉ ይችላሉ።" },
      { q: "ተቀባዩ ምን ምንዛሪ ያገኛል?", a: "በኢትዮጵያ ያሉ ተቀባዮች የኢትዮጵያ ብር (ETB) ይቀበላሉ።" },
      { q: "ተቀባዩ የCBE ባንክ ሂሳብ ያስፈልገዋልን?", a: "ለCBE Connect አዎ። ለTelebirr፣ የተመዘገበ Telebirr ሞባይል ዋሌት ያስፈልጋል።" },
    ],
  },
  kenya: {
    en: [
      { q: "Which services can my recipient use in Kenya?", a: "Recipients can receive via M-Pesa or collect cash through Taaj." },
      { q: "What currency does the recipient get?", a: "Recipients in Kenya receive Kenyan Shillings (KES)." },
      { q: "Does my recipient need an M-Pesa account?", a: "Yes, for M-Pesa the recipient must have an active M-Pesa account. For Taaj cash pick-up a valid ID is required." },
    ],
    sw: [
      { q: "Mpokeaji wangu anaweza kutumia huduma gani Kenya?", a: "Wapokeaji wanaweza kupokea kupitia M-Pesa au kukusanya pesa taslimu kupitia Taaj." },
      { q: "Mpokeaji anapata sarafu gani?", a: "Wapokeaji nchini Kenya wanapata Shilingi za Kenya (KES)." },
      { q: "Je, mpokeaji wangu anahitaji akaunti ya M-Pesa?", a: "Ndiyo, kwa M-Pesa mpokeaji lazima awe na akaunti ya M-Pesa inayofanya kazi. Kwa mkusanyiko wa pesa taslimu wa Taaj kitambulisho halali kinahitajika." },
    ],
  },
  pakistan: {
    en: [
      { q: "Which wallets can my recipient use in Pakistan?", a: "Recipients can receive via JazzCash, EasyPaisa, NayaPay, or SadaPay. Bank transfers to over 46 Pakistani banks are also supported." },
      { q: "What currency does the recipient get?", a: "Recipients in Pakistan receive Pakistani Rupees (PKR)." },
      { q: "How do I send to a bank account in Pakistan?", a: "You will need the recipient's IBAN (24-digit number starting with PK). Bring this to the Shop2Shop store along with the recipient's full name." },
    ],
    ur: [
      { q: "پاکستان میں میرا وصول کنندہ کون سے والٹ استعمال کر سکتا ہے؟", a: "وصول کنندگان JazzCash، EasyPaisa، NayaPay، یا SadaPay کے ذریعے وصول کر سکتے ہیں۔ 46 سے زائد پاکستانی بینکوں میں بینک ٹرانسفر بھی دستیاب ہے۔" },
      { q: "وصول کنندہ کو کون سی کرنسی ملے گی؟", a: "پاکستان کے وصول کنندگان کو پاکستانی روپے (PKR) ملیں گے۔" },
      { q: "پاکستان میں بینک اکاؤنٹ میں کیسے بھیجوں؟", a: "آپ کو وصول کنندہ کا IBAN (PK سے شروع ہونے والا 24 ہندسوں کا نمبر) درکار ہوگا۔ یہ Shop2Shop اسٹور پر وصول کنندہ کے پورے نام کے ساتھ لائیں۔" },
    ],
  },
};

const FAQ = {
  somalia:    (lang) => [...(COMMON_FAQS[lang]||COMMON_FAQS.en), ...(COUNTRY_FAQS.somalia[lang]||COUNTRY_FAQS.somalia.en)],
  bangladesh: (lang) => [...(COMMON_FAQS[lang]||COMMON_FAQS.en), ...(COUNTRY_FAQS.bangladesh[lang]||COUNTRY_FAQS.bangladesh.en)],
  ethiopia:   (lang) => [...(COMMON_FAQS[lang]||COMMON_FAQS.en), ...(COUNTRY_FAQS.ethiopia[lang]||COUNTRY_FAQS.ethiopia.en)],
  kenya:      (lang) => [...(COMMON_FAQS[lang]||COMMON_FAQS.en), ...(COUNTRY_FAQS.kenya[lang]||COUNTRY_FAQS.kenya.en)],
  pakistan:   (lang) => [...(COMMON_FAQS[lang]||COMMON_FAQS.en), ...(COUNTRY_FAQS.pakistan[lang]||COUNTRY_FAQS.pakistan.en)],
};


// ── FaqItem Component ─────────────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{borderBottom:"1px solid #e8eaed",padding:"16px 0",cursor:"pointer",userSelect:"none"}}
    >
      <div style={{display:"grid",gridTemplateColumns:"1fr 28px",alignItems:"center",gap:"12px"}}>
        <span style={{fontSize:"14px",fontWeight:open?"700":"600",color:"#1b2a4a",lineHeight:"1.4",fontFamily:"'Nunito Sans',sans-serif"}}>{q}</span>
        <div style={{width:"28px",height:"28px",borderRadius:"50%",background:open?"#f9a225":"#f0f4ff",border:open?"1.5px solid #f9a225":"1.5px solid #c8d4f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",color:open?"#fff":"#1b2a4a",flexShrink:0}}>
          {open ? "−" : "+"}
        </div>
      </div>
      {open && <div style={{marginTop:"10px",fontSize:"13px",color:"#555",lineHeight:"1.7",fontFamily:"'Nunito Sans',sans-serif"}}>{a}</div>}
    </div>
  );
}

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

  const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmdG1naGpua2R2b2Npd3hla2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNTczMTQsImV4cCI6MjA4OTgzMzMxNH0.hh66phQwc4sfva4EY254viK-AampHgsXGY0Ft4drl0U";
  const SUPABASE_URL = "https://bftmghjnkdvociwxekik.supabase.co";

  // DB country codes in exchange_rates table
  const DB_CODE = {
    somalia:    "SOS",
    kenya:      "KEN",
    ethiopia:   "ETB",
    bangladesh: "BDT",
    pakistan:   "PKR",
  };

  // EXACT formulas from Maths_for_calculation spreadsheet:
  //
  // SOMALIA:  ZAR_cost = USD × spot_rate(ZARUSD) × 1.04
  //           i.e. to send $100: R1000 ZAR → $100 / (spot_rate × 1.04) ... 
  //           For display: $received = ZAR_sent / (spot_rate × 1.04) ... 
  //           = ZAR_sent × (1/spot_rate) × (1/1.04)
  //           = ZAR_sent × USDZAR_rate × 0.9615
  //           spot_rate in DB = ZARUSD (e.g. 0.05437), so USDZAR = 1/spot_rate
  //           receive_USD = zarSent × spot_rate / 1.04   (÷ not ×(1-margin))
  //           Wait — spreadsheet says: $100 at rate 16.66 → cost R1732.64 = 100 × 16.66 × 1.04
  //           So: receive = zarSent / (USDZAR × 1.04) = zarSent × ZARUSD / 1.04
  //           = zarSent × spot_rate / 1.04
  //
  // KENYA:    ZAR after 1.4% fee = ZAR × 0.986
  //           Gross KES = ZAR_net × spot_rate(ZARKES)
  //           Then subtract 1.2% rebate: KES_net = gross × (1 - 0.012) = gross × 0.988
  //           Total multiplier: × 0.986 × 0.988 = × 0.974168
  //
  // BANGLADESH: ZAR_net = ZAR × 0.98; receive = ZAR_net × spot_rate(ZARBDT)
  //             multiplier: × 0.98
  //
  // PAKISTAN: ZAR_net = ZAR × 0.98; gross PKR = ZAR_net × spot_rate
  //           Then add 2% rebate: PKR = gross × 1.02
  //           multiplier: × 0.98 × 1.02 = × 0.9996
  //
  // ETHIOPIA: ZAR_net = ZAR × 0.98; receive = ZAR_net × spot_rate(ZARETB)
  //           multiplier: × 0.98

  const [allRates, setAllRates] = useState(null); // kept for compatibility

  const fetchRate = useCallback(async (country) => {
    setLoading(true);
    setError(null);
    try {
      // Read directly from exchange_rates table using exact spreadsheet formulas
      // Somalia: USD row blocked by RLS — use rate-calculator edge function
      // All others: read spot_rate from table, apply exact formulas from spreadsheet

      if (country === "somalia") {
        // rate-calculator: send USD 100 → returns ZAR cost (e.g. R1,709)
        // We want: ZAR 1000 → USD received
        // From spreadsheet: ZAR cost = USD × USDZAR × 1.04
        // So: USD received = ZAR / (USDZAR × 1.04)
        // We get USDZAR from: ZAR_cost / (USD_sent × 1.04) = 1709 / (100 × 1.04) = 16.43
        // Then: USD per R1000 = 1000 / (USDZAR × 1.04)
        const res = await fetch(`${SUPABASE_URL}/functions/v1/rate-calculator`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": ANON_KEY, "Authorization": `Bearer ${ANON_KEY}` },
          body: JSON.stringify({ send_currency: "USD", send_amount: 100, language: "1" }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const msg = data.message || JSON.stringify(data);
        // Parse ZAR cost from message e.g. "R1,709" or "1709"
        const zarMatch = msg.match(/R\s*([\d,]+\.?\d*)/);
        if (!zarMatch) throw new Error("Somalia parse error: " + msg.substring(0, 100));
        const zarCostFor100USD = parseFloat(zarMatch[1].replace(/,/g, ""));
        // USDZAR = zarCost / (100 × 1.04)
        const usdzar = zarCostFor100USD / (100 * 1.04);
        // USD per R1000 = 1000 / (usdzar × 1.04)
        const usdPer1000 = 1000 / (usdzar * 1.04);
        setUsdZar(usdzar);
        setRateData({ receive_amount: usdPer1000.toFixed(2), effective_rate: usdPer1000 / 1000, spot_rate: usdPer1000 / 1000 });
        return;
      }

      // Fetch spot_rate from exchange_rates table
      let rows = allRates;
      if (!rows) {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/exchange_rates?select=country_code,spot_rate,updated_at`,
          { headers: { "apikey": ANON_KEY, "Authorization": `Bearer ${ANON_KEY}` } }
        );
        if (!res.ok) throw new Error(await res.text());
        rows = await res.json();
        setAllRates(rows);
      }

      const DB_CODE = { kenya: "KEN", ethiopia: "ETB", bangladesh: "BDT", pakistan: "PKR" };
      const row = rows.find(r => r.country_code === DB_CODE[country]);
      if (!row) throw new Error(`No row for ${DB_CODE[country]}`);

      const spot = parseFloat(row.spot_rate);
      let effectiveRate;

      // Exact formulas from spreadsheet:
      if (country === "kenya") {
        // 1.4% fee + 1.2% rebate = × 0.986 × 0.988 = × 0.974
        effectiveRate = spot * 0.986 * 0.988;
      } else if (country === "bangladesh") {
        // 2% fee = × 0.98
        effectiveRate = spot * 0.98;
      } else if (country === "pakistan") {
        // 2% fee - 2% rebate = × 0.98 × 1.02
        effectiveRate = spot * 0.98 * 1.02;
      } else if (country === "ethiopia") {
        // 2% fee = × 0.98, pays out in ETB
        effectiveRate = spot * 0.98;
      }

      const receiveAmount = (1000 * effectiveRate).toFixed(2);
      setRateData({ receive_amount: receiveAmount, effective_rate: effectiveRate, spot_rate: spot });

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [allRates]);

  // USD/ZAR rate — derived from Somalia rate (Somalia ratePerR1000 = USD per R1000 ZAR)
  // So USDZAR = 1000 / somaliaRatePerR1000 (before margins)
  // We use rateData once loaded to derive this, defaulting to 18.5
  const [usdZar, setUsdZar] = useState(18.5);
  


  // USD payout countries: Somalia, Kenya, Ethiopia
  // Their ratePerR1000 is in USD (e.g. $58 per R1000)
  // So: ZAR input → receiveUSD = ratePerR1000 * zarAmount / 1000
  //     USD input → zarEquiv = usdAmount / ratePerR1000 * 1000 ... 
  //     BUT for Somalia USD mode: user says "I want to send $55 worth"
  //     = zarCost = 55 / (ratePerR1000/1000) = 55 * 1000 / ratePerR1000
  //     receiveUSD = ratePerR1000 * zarCost / 1000 = 55 (exactly back)
  //     That's wrong - sending USD55 should give USD55 worth of payout not exactly $55
  //     CORRECT: USD input means "I am paying USD55" 
  //     zarCost = 55 * usdZar (convert to ZAR)
  //     receiveUSD = ratePerR1000 * zarCost / 1000
  //     This gives same result as ZAR mode scaled correctly
  //
  // Local currency countries (BD, PK): ratePerR1000 is in BDT/PKR
  //     ZAR input → receiveBDT = ratePerR1000 * zarAmount / 1000
  //     USD input → zarEquiv = usdAmount * usdZar, then same formula

  const computeReceive = useCallback((country, amount, currency, rates) => {
    if (!rates) return null;
    // rate-calculator was called with ZAR 1000, so receive_amount = rate per R1000
    const ratePerR1000 = parseFloat(rates.receive_amount);
    if (!ratePerR1000 || isNaN(ratePerR1000)) return null;
    // Convert input to ZAR equivalent
    const zarValue = currency === "USD" ? amount * usdZar : amount;
    // Scale linearly from the R1000 base
    return (ratePerR1000 * zarValue / 1000).toFixed(2);
  }, [usdZar]);

  // For Somalia: both ZAR and USD inputs use same formula (USD input converts to ZAR first)
  // ZAR 1000 → $58.27 ✓
  // USD 55 → ZAR(55 * 18.5) = ZAR1017.5 → $58.27 * 1.0175 ≈ $59.29 ✓ (you sent more ZAR)
  // This is CORRECT - if you send USD55 you pay ZAR≈1018 and get $59+ back
  // The "deviance" was correct all along - USD55 buys more ZAR than R1000

  useEffect(() => {
    fetchRate(activeCountry);
  }, [activeCountry, fetchRate]);

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
                <button className="retry-btn" onClick={() => fetchRate(activeCountry)}>↻</button>
              </div>
            ) : rateData ? (
              (() => {
                // Card is always identical for Somalia — zarAmount is always ZAR
                const receiveAmt = computeReceive(activeCountry, zarAmount, "ZAR", rateData);
                const zarEquiv = sendCurrency === "USD" && activeCountry !== "somalia"
                  ? (zarAmount * usdZar).toFixed(0) : null;
                const sendLabel = activeCountry === "somalia"
                  ? `ZAR ${zarAmount.toLocaleString()}`
                  : `${sendCurrency} ${zarAmount.toLocaleString()}`;


                return (
                  <div className="rate-result">
                    <div className="rate-summary-box">
                      <div className="rate-summary-row">
                        <div className="rate-summary-item">
                          <span className="rate-summary-label">{t.sending}</span>
                          <span className="rate-summary-send">
                            {sendLabel}
                            {zarEquiv && (
                              <span className="rate-zar-equiv">≈ ZAR {Number(zarEquiv).toLocaleString()}</span>
                            )}
                          </span>
                        </div>
                        <div className="rate-arrow">→</div>
                        <div className="rate-summary-item rate-summary-item--right">
                          <span className="rate-summary-label">{t.receiving}</span>
                          <span className="rate-summary-receive">
                            {receiveAmt
                              ? `${payout.symbol}${Number(receiveAmt).toLocaleString(undefined, {maximumFractionDigits: 2})}`
                              : <span style={{fontSize:"13px",color:"rgba(255,255,255,0.5)"}}>Calculating…</span>
                            }
                          </span>
                        </div>
                      </div>
                      <div className="rate-per-unit">
                        1 ZAR = {payout.symbol}{rateData.effective_rate ? Number(rateData.effective_rate).toFixed(4) : "…"} · {t.updated}
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
            <h3 className="card-title">{t.sendLimits}</h3>
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
            <h3 className="card-title">{t.payoutOptions}</h3>
            <div className="payout-sections">
              {payout.partners.map((section, i) => (
                <div key={i} className="payout-section">
                  <div className="payout-section-label">
                    <span>{section.icon}</span> {t[section.label_key] || section.label_key}
                  </div>
                  <div className="payout-chips">
                    {section.items.map((item, j) => (
                      <span key={j} className="payout-chip">{(item === "63" || item === "46") ? `${item} ${t.banksSupported || "banks supported"}` : item}</span>
                    ))}
                  </div>
                </div>
              ))}
              <div className="payout-currency-badge">
                {t.paysOutIn} {payout.currency}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="card how-card">
            <h3 className="card-title">{t.howItWorksTitle}</h3>
            <ol className="steps">
              {(HOW_IT_WORKS[activeCountry][langKey] || HOW_IT_WORKS[activeCountry].en).map((step, i) => (
                <li key={i} className="step">
                  <span className="step-num">{i + 1}</span>
                  <span className="step-text">{step}</span>
                </li>
              ))}
            </ol>
          </section>


          {/* FAQ */}
          <section className="card faq-card">
            <h3 className="card-title">{t.faqTitle}</h3>
            <div className="faq-list">
              {FAQ[activeCountry](langKey).map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </section>


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

        /* ── FAQ ─────────────────────────────────────────────── */
        .faq-list { display: flex; flex-direction: column; }
        .faq-item {
          border-bottom: 1px solid #e8eaed;
          padding: 16px 0;
          cursor: pointer;
          user-select: none;
        }
        .faq-item:first-child { padding-top: 4px; }
        .faq-item:last-child { border-bottom: none; padding-bottom: 0; }
        .faq-q {
          display: grid;
          grid-template-columns: 1fr 28px;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #1b2a4a;
          line-height: 1.4;
        }
        .faq-chevron {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #f0f4ff;
          border: 1.5px solid #c8d4f0;
          display: grid;
          place-items: center;
          font-size: 18px;
          font-weight: 600;
          color: #1b2a4a;
          flex-shrink: 0;
          line-height: 1;
        }
        .faq-item--open .faq-chevron {
          background: #f9a225;
          border-color: #f9a225;
          color: #ffffff;
        }
        .faq-a {
          margin-top: 10px;
          font-size: 13px;
          color: #555;
          line-height: 1.7;
        }
        .faq-item--open .faq-q { font-weight: 700; }

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
