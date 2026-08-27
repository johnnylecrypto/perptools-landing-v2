/**
 * Analytical P(touch) pricer, ported from the live product
 * (`perptools-site/app/lib/pulse/pricerFormula.ts`, itself a mirror of the
 * backend's `lynox-pulse/packages/shared/src/pricerFormula.ts`).
 *
 * Kept faithful on purpose: the multiplier printed in every cell is the most
 * visible thing on the board, so the demo prices cells the way the real product
 * does rather than with a lookalike curve. Only the transport differs — the
 * demo feeds it a simulated sigma instead of a live feed.
 */

export type ProbabilityPricerConfig = {
  houseEdge: number;
  volPremium: number;
  minPTouch: number;
  softKnee: number;
  multiplierMin: number;
  multiplierMax: number;
  modelErrorBuffer: number;
  houseEdgeBuffer: number;
};

/** Defaults as shipped by the product; the live app overrides them from /config. */
export const pricerConfig: ProbabilityPricerConfig = {
  houseEdge: 0.07,
  volPremium: 0.15,
  minPTouch: 0.001,
  softKnee: 17.5,
  multiplierMin: 1.01,
  multiplierMax: 25.0,
  modelErrorBuffer: 1.02,
  houseEdgeBuffer: 0.005,
};

/** Adaptive volatility buffer. Mirrors `getVolBuffer` in the product config. */
export function getVolBuffer(sigmaPerSec: number): number {
  if (sigmaPerSec < 5e-5) return 1.02;
  if (sigmaPerSec < 1e-4) return 1.05;
  if (sigmaPerSec < 2e-4) return 1.15;
  return 1.3;
}

/** Rational saturation: linear up to softKnee, then bends toward multiplierMax. */
export function softCap(raw: number): number {
  const { softKnee, multiplierMax } = pricerConfig;
  if (raw <= softKnee) return raw;
  const headroom = multiplierMax - softKnee;
  const over = raw - softKnee;
  return softKnee + (headroom * over) / (over + headroom);
}

/**
 * Standard normal CDF via the Abramowitz-Stegun erf approximation (7.1.26,
 * max abs error ~1.5e-7).
 */
export function normalCdf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const z = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * z);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-z * z);
  return 0.5 * (1 + sign * y);
}

export type PricerArgs = {
  /** Seconds until the cell's window opens. */
  timeToStartSec: number;
  /** Length of the window. */
  timeStepSec: number;
  currentPrice: number;
  cellLow: number;
  cellHigh: number;
  /** Realised volatility per second. */
  sigmaPerSec: number;
};

/**
 * Probability the price touches [cellLow, cellHigh] during the window, and the
 * multiplier that pays for it.
 */
export function priceCell(args: PricerArgs): number {
  const {
    houseEdge,
    volPremium,
    minPTouch,
    multiplierMin,
    multiplierMax,
    modelErrorBuffer,
    houseEdgeBuffer,
  } = pricerConfig;
  const { timeToStartSec, timeStepSec, currentPrice, cellLow, cellHigh, sigmaPerSec } = args;

  const tStart = timeToStartSec;
  const tEnd = tStart + timeStepSec;
  const tMid = (tStart + tEnd) / 2;

  if (
    sigmaPerSec <= 0 ||
    tMid <= 0 ||
    currentPrice <= 0 ||
    cellLow <= 0 ||
    cellHigh <= 0 ||
    cellHigh <= cellLow
  ) {
    return multiplierMin;
  }

  const sigmaEff = sigmaPerSec * (1 + volPremium);
  const sigmaTm = sigmaEff * Math.sqrt(tMid);
  const nObs = Math.round(tEnd - tStart) + 1;

  const logL = Math.log(cellLow / currentPrice);
  const logH = Math.log(cellHigh / currentPrice);
  const pSingle = normalCdf(logH / sigmaTm) - normalCdf(logL / sigmaTm);
  const pOccupancy = Math.min(1, nObs * pSingle);

  const spotInCell = currentPrice >= cellLow && currentPrice <= cellHigh;
  let pWindow: number;
  if (spotInCell) {
    pWindow = pOccupancy;
  } else {
    const sigmaT1 = sigmaEff * Math.sqrt(Math.max(tStart, 0));
    const sigmaT2 = sigmaEff * Math.sqrt(tEnd);
    const logD =
      currentPrice < cellLow ? Math.log(cellLow / currentPrice) : Math.log(currentPrice / cellHigh);
    const term1 = sigmaT1 > 0 ? normalCdf(-logD / sigmaT1) : 0;
    const term2 = normalCdf(-logD / sigmaT2);
    pWindow = Math.max(0, 2 * (term2 - term1));
  }

  const pModel = Math.max(pWindow, pOccupancy);

  let pPricing = Math.min(
    1,
    pModel * getVolBuffer(sigmaPerSec) * modelErrorBuffer + houseEdgeBuffer,
  );
  pPricing = Math.max(pPricing, minPTouch);

  const rawMulti = (1 - houseEdge) / pPricing;
  const adjusted = softCap(rawMulti);
  return Math.min(Math.max(adjusted, multiplierMin), multiplierMax);
}

/**
 * Realised volatility per second from the recent path, the same quantity the
 * live app derives from its price feed.
 */
export function realisedSigma(
  prices: readonly number[],
  secondsPerSample: number,
  window = 80,
): number {
  const from = Math.max(1, prices.length - window);
  const returns: number[] = [];
  for (let i = from; i < prices.length; i += 1) {
    const previous = prices[i - 1];
    const current = prices[i];
    if (previous > 0 && current > 0) returns.push(Math.log(current / previous));
  }
  if (returns.length < 2) return 0;

  const mean = returns.reduce((total, value) => total + value, 0) / returns.length;
  const variance =
    returns.reduce((total, value) => total + (value - mean) ** 2, 0) / (returns.length - 1);
  return Math.sqrt(variance / secondsPerSample);
}
