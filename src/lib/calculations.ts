import { Product } from '../types';

/**
 * Formats a number as Indian Rupee (INR) currency (e.g. ₹1,23,456 or ₹45.50)
 */
export function formatINR(amount: number | undefined | null, includeDecimals = false): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '—';
  }
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  }).format(amount);
  return `₹${formatted}`;
}

/**
 * Formats standard numbers with Indian number formatting
 */
export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Formats percentage with sign option
 */
export function formatPercent(val: number | undefined | null, includeSign = false): string {
  if (val === undefined || val === null || isNaN(val)) return '—';
  const prefix = includeSign && val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(1)}%`;
}

/**
 * Calculates Revenue = units sold × selling price
 */
export function calculateRevenue(unitsSold: number, sellingPrice: number): number {
  return unitsSold * sellingPrice;
}

/**
 * Calculates Estimated Gross Profit = units sold × (selling price - unit cost)
 * Returns undefined if unitCost is missing/undefined (Honest missing-cost protection)
 */
export function calculateGrossProfit(
  unitsSold: number,
  sellingPrice: number,
  unitCost: number | undefined
): number | undefined {
  if (unitCost === undefined || unitCost === null || isNaN(unitCost)) {
    return undefined; // Must not fabricate gross profit when cost is missing
  }
  return unitsSold * (sellingPrice - unitCost);
}

/**
 * Calculates Gross Margin = gross profit / revenue
 * Returns undefined if cost is missing or revenue is 0
 */
export function calculateGrossMargin(
  grossProfit: number | undefined,
  revenue: number
): number | undefined {
  if (grossProfit === undefined || revenue <= 0) {
    return undefined;
  }
  return (grossProfit / revenue) * 100;
}

/**
 * Calculates Days of Stock Cover based on daily consumption velocity
 */
export function calculateStockCoverDays(
  stockOnHand: number,
  avgDailySales: number
): number {
  if (avgDailySales <= 0) return 999; // effectively indefinite
  const days = stockOnHand / avgDailySales;
  return Math.max(0, parseFloat(days.toFixed(1)));
}

/**
 * Reorder calculation strictly adhering to SDP:
 * Suggested reorder quantity = lead-time demand + safety stock - stock on hand,
 * clamped to zero and rounded to a whole unit.
 * If MOQ exists and suggestion > 0, rounds up to MOQ or nearest pack.
 */
export function calculateSuggestedReorder(params: {
  leadTimeDays: number;
  avgDailySales: number;
  safetyStock: number;
  stockOnHand: number;
  moq?: number;
}): {
  suggestedQty: number;
  leadTimeDemand: number;
  grossDeficit: number;
} {
  const { leadTimeDays, avgDailySales, safetyStock, stockOnHand, moq } = params;
  const leadTimeDemand = Math.round(leadTimeDays * avgDailySales);
  const targetStock = leadTimeDemand + safetyStock;
  const grossDeficit = targetStock - stockOnHand;

  let suggestedQty = Math.max(0, Math.round(grossDeficit));
  if (suggestedQty > 0 && moq && moq > 0) {
    if (suggestedQty < moq) {
      suggestedQty = moq;
    } else {
      // Round to multiple of MOQ / pack if applicable
      suggestedQty = Math.ceil(suggestedQty / moq) * moq;
    }
  }

  return { suggestedQty, leadTimeDemand, grossDeficit };
}

/**
 * Determines stockout risk level based on days of cover vs lead time
 */
export function getStockoutRiskLevel(
  coverDays: number,
  leadTimeDays: number
): 'Critical' | 'Warning' | 'Healthy' | 'Overstocked' {
  if (coverDays <= leadTimeDays) {
    return 'Critical'; // Will run out before replenishment can arrive!
  }
  if (coverDays <= leadTimeDays * 1.5) {
    return 'Warning';
  }
  if (coverDays > 60) {
    return 'Overstocked';
  }
  return 'Healthy';
}

/**
 * Classifies SKU profit segments:
 * - Profit Leaders: High GP contribution & healthy margin
 * - Fast Movers: High unit volume
 * - Rising Stars: Strong momentum / seasonal ramp
 * - Dead-stock Candidates: Ageing stock (>90 days), low sales
 * - High-Revenue / Low-Margin: Razor-thin margin despite big sales volume
 */
export function classifySkuSegment(
  product: Product,
  unitsSold: number,
  revenue: number,
  grossProfit: number | undefined,
  grossMargin: number | undefined
): string {
  if (product.unitCost === undefined) {
    return 'Cost Data Needed';
  }
  if (product.stockAgeDays && product.stockAgeDays > 90 && unitsSold < 10) {
    return 'Dead-stock Candidate';
  }
  if (grossMargin !== undefined && grossMargin < 8 && revenue > 4000) {
    return 'High-Revenue / Low-Margin';
  }
  if (grossProfit !== undefined && grossProfit > 3000) {
    return 'Profit Leader';
  }
  if (unitsSold >= 50) {
    return 'Fast Mover';
  }
  return 'Standard Catalog';
}
