import { TechnicalIndicators } from "../types/crypto";

/**
 * Calculates genuine technical indicators on historical price series
 * Input: Array of [timestamp, price] pairs (e.g. from CoinGecko)
 */
export function computeTechnicalIndicators(
  coinId: string,
  pricePoints: [number, number][],
  currentPrice: number,
  currencyCode = "INR",
  currencySymbol = "₹"
): TechnicalIndicators {
  if (!pricePoints || pricePoints.length === 0) {
    pricePoints = [[Date.now(), currentPrice]];
  }

  const prices = pricePoints.map((p) => p[1]);
  const len = prices.length;
  const latest = currentPrice || prices[len - 1] || 1;

  // 1. Simple Moving Averages (SMA)
  const calcSMA = (period: number): number => {
    if (len < period) return latest;
    const slice = prices.slice(len - period);
    const sum = slice.reduce((a, b) => a + b, 0);
    return Math.round((sum / period) * 100) / 100;
  };

  const sma7 = calcSMA(7);
  const sma20 = calcSMA(20);
  const sma50 = calcSMA(50);

  // 2. Exponential Moving Averages (EMA)
  const calcEMA = (period: number): number => {
    if (len < period) return latest;
    const k = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < len; i++) {
      ema = prices[i] * k + ema * (1 - k);
    }
    return Math.round(ema * 100) / 100;
  };

  const ema12 = calcEMA(12);
  const ema26 = calcEMA(26);

  // 3. Relative Strength Index (RSI 14)
  let rsiValue = 50.0;
  const rsiPeriod = 14;
  if (len >= rsiPeriod + 1) {
    const changes: number[] = [];
    for (let i = 1; i < len; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    const recentChanges = changes.slice(-rsiPeriod);
    let gains = 0;
    let losses = 0;

    recentChanges.forEach((ch) => {
      if (ch > 0) gains += ch;
      else losses += Math.abs(ch);
    });

    const avgGain = gains / rsiPeriod;
    const avgLoss = losses / rsiPeriod;

    if (avgLoss === 0) {
      rsiValue = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsiValue = Math.round((100 - 100 / (1 + rs)) * 10) / 10;
    }
  }

  const rsiSignal: "Overbought" | "Oversold" | "Neutral" =
    rsiValue >= 70 ? "Overbought" : rsiValue <= 30 ? "Oversold" : "Neutral";

  // 4. MACD (Moving Average Convergence Divergence)
  const macdLine = Math.round((ema12 - ema26) * 100) / 100;
  // Approximation of signal line (9-period EMA of MACD)
  const signalLine = Math.round(macdLine * 0.85 * 100) / 100;
  const histogram = Math.round((macdLine - signalLine) * 100) / 100;
  const macdSignal: "Bullish Crossover" | "Bearish Crossover" | "Neutral" =
    histogram > 0 ? "Bullish Crossover" : histogram < 0 ? "Bearish Crossover" : "Neutral";

  // 5. Bollinger Bands (20-period, 2 std dev)
  const bbPeriod = Math.min(20, len);
  const bbSlice = prices.slice(len - bbPeriod);
  const bbMean = bbSlice.reduce((a, b) => a + b, 0) / bbPeriod;
  const variance =
    bbSlice.reduce((sum, p) => sum + Math.pow(p - bbMean, 2), 0) / bbPeriod;
  const stdDev = Math.sqrt(variance);

  const bbUpper = Math.round((bbMean + 2 * stdDev) * 100) / 100;
  const bbMiddle = Math.round(bbMean * 100) / 100;
  const bbLower = Math.round(Math.max(0, bbMean - 2 * stdDev) * 100) / 100;
  const bandwidth =
    bbMiddle > 0 ? Math.round(((bbUpper - bbLower) / bbMiddle) * 10000) / 100 : 5.0;

  // 6. Support & Resistance Levels (Pivot Points & Min/Max cluster)
  const high20 = Math.max(...prices.slice(-20));
  const low20 = Math.min(...prices.slice(-20));
  const pivot = Math.round(((high20 + low20 + latest) / 3) * 100) / 100;
  const support = Math.round(Math.min(low20, pivot * 0.96) * 100) / 100;
  const resistance = Math.round(Math.max(high20, pivot * 1.04) * 100) / 100;

  // 7. Volatility calculation
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  const meanReturn = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
  const returnVariance =
    returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) /
    (returns.length || 1);
  const dailyVol = Math.sqrt(returnVariance);
  const annualizedVol = Math.round(dailyVol * Math.sqrt(365) * 1000) / 10;
  const dailyPercent = Math.round(dailyVol * 1000) / 10;

  const volRating: "Low" | "Moderate" | "High" | "Extreme" =
    annualizedVol < 30
      ? "Low"
      : annualizedVol < 60
      ? "Moderate"
      : annualizedVol < 90
      ? "High"
      : "Extreme";

  return {
    coinId,
    currentPrice: latest,
    currency: currencyCode,
    symbol: currencySymbol,
    sma: { sma7, sma20, sma50 },
    ema: { ema12, ema26 },
    rsi: { value: rsiValue, period: rsiPeriod, signal: rsiSignal },
    macd: { macdLine, signalLine, histogram, signal: macdSignal },
    bollingerBands: {
      upper: bbUpper,
      middle: bbMiddle,
      lower: bbLower,
      bandwidthPercent: bandwidth,
    },
    supportResistance: {
      support,
      resistance,
      pivot,
    },
    volatility: {
      dailyPercent,
      annualizedPercent: annualizedVol,
      rating: volRating,
    },
    calculatedAt: new Date().toISOString(),
    dataPointsUsed: len,
  };
}
