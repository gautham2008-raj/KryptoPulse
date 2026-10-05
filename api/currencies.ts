const SUPPORTED_CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN", rateVsUsd: 87.45 },
  { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US", rateVsUsd: 1.0 },
  { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE", rateVsUsd: 0.92 },
  { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB", rateVsUsd: 0.79 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", locale: "ja-JP", rateVsUsd: 153.2 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", locale: "en-CA", rateVsUsd: 1.38 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", locale: "en-AU", rateVsUsd: 1.52 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", locale: "en-SG", rateVsUsd: 1.35 },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", locale: "ar-AE", rateVsUsd: 3.67 },
];

export default function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "public, s-maxage=86400");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  return res.status(200).json({
    success: true,
    currencies: SUPPORTED_CURRENCIES,
    default: "INR",
  });
}
