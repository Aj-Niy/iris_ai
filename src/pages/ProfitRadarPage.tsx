import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpDown, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Package, 
  HelpCircle,
  Tag,
  ArrowRight
} from 'lucide-react';
import { Product, ActionRecord } from '../types';
import { 
  formatINR, 
  calculateRevenue, 
  calculateGrossProfit, 
  calculateGrossMargin, 
  classifySkuSegment 
} from '../lib/calculations';
import { PAST_14_DAYS_PRODUCT_SALES } from '../data/demoData';

interface ProfitRadarPageProps {
  products: Product[];
  onOpenActionDetail?: (action: ActionRecord) => void;
  onNavigateToData?: () => void;
}

type SortField = 'gp' | 'revenue' | 'margin' | 'units';

export const ProfitRadarPage: React.FC<ProfitRadarPageProps> = ({
  products,
  onNavigateToData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('gp');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  // Compute profit metrics for all products
  const computedProducts = products.map((prod) => {
    const sales = PAST_14_DAYS_PRODUCT_SALES[prod.id] || { unitsSold: 0, revenue: 0 };
    const gp = calculateGrossProfit(sales.unitsSold, prod.sellingPrice, prod.unitCost);
    const margin = calculateGrossMargin(gp, sales.revenue);
    const segment = classifySkuSegment(prod, sales.unitsSold, sales.revenue, gp, margin);

    return {
      product: prod,
      unitsSold: sales.unitsSold,
      revenue: sales.revenue,
      gp,
      margin,
      segment,
    };
  });

  // Filter & sort
  const filteredProducts = computedProducts
    .filter((item) => {
      const matchesSearch =
        item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSegment = selectedSegment === 'ALL' || item.segment === selectedSegment;
      return matchesSearch && matchesSegment;
    })
    .sort((a, b) => {
      let valA: number = 0;
      let valB: number = 0;

      if (sortField === 'gp') {
        valA = a.gp ?? -999999;
        valB = b.gp ?? -999999;
      } else if (sortField === 'revenue') {
        valA = a.revenue;
        valB = b.revenue;
      } else if (sortField === 'margin') {
        valA = a.margin ?? -999999;
        valB = b.margin ?? -999999;
      } else if (sortField === 'units') {
        valA = a.unitsSold;
        valB = b.unitsSold;
      }

      return sortDirection === 'desc' ? valB - valA : valA - valB;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const segments = [
    'ALL',
    'Profit Leader',
    'High-Revenue / Low-Margin',
    'Dead-stock Candidate',
    'Cost Data Needed',
  ];

  // Specific comparison data: Notebooks vs Recharge Vouchers
  const notebookItem = computedProducts.find((p) => p.product.id === 'SKU-NB-01');
  const rechargeItem = computedProducts.find((p) => p.product.id === 'SKU-RC-01');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Profit Radar
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-200 text-neutral-800">
              Unit Economics & Gross Profit
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Separate true cash gross-profit contributors from high-turnover / low-margin lines.
          </p>
        </div>
      </div>

      {/* Educational Contrast Card: Revenue != Profit */}
      {notebookItem && rechargeItem && (
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-subtle">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold text-neutral-900">
                Core Discovery: High Revenue ≠ High Profit
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-neutral-500">
              14-Day Reconciliation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* High Margin Leader */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">
                  {notebookItem.product.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  #1 Profit Leader
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-left">
                <div>
                  <span className="text-[10px] text-emerald-700 font-medium block">Revenue</span>
                  <span className="text-sm font-bold text-neutral-900">{formatINR(notebookItem.revenue)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 font-medium block">Gross Profit</span>
                  <span className="text-sm font-bold text-emerald-700">{formatINR(notebookItem.gp)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 font-medium block">Gross Margin</span>
                  <span className="text-sm font-bold text-emerald-700">{notebookItem.margin?.toFixed(1)}%</span>
                </div>
              </div>
              <p className="text-[11px] text-emerald-800 mt-2.5 font-medium">
                High unit profit (₹150/unit) with 41.7% margin creates maximum bankable cash. Protect availability!
              </p>
            </div>

            {/* High Turnover / Low Margin */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">
                  {rechargeItem.product.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  High Turnover / Low Margin
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-left">
                <div>
                  <span className="text-[10px] text-amber-700 font-medium block">Revenue</span>
                  <span className="text-sm font-bold text-neutral-900">{formatINR(rechargeItem.revenue)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 font-medium block">Gross Profit</span>
                  <span className="text-sm font-bold text-neutral-700">{formatINR(rechargeItem.gp)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 font-medium block">Gross Margin</span>
                  <span className="text-sm font-bold text-amber-800">{rechargeItem.margin?.toFixed(1)}%</span>
                </div>
              </div>
              <p className="text-[11px] text-amber-800 mt-2.5 font-medium">
                Similar ₹32k top-line revenue as notebooks, but yields only ₹960 cash profit. Do not offer discounts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Segment Filters & Search */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mr-1">
              Segment:
            </span>
            {segments.map((seg) => (
              <button
                key={seg}
                onClick={() => setSelectedSegment(seg)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedSegment === seg
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
                }`}
              >
                {seg === 'ALL' ? 'All Products' : seg}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by SKU or name..."
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-100 rounded-lg text-xs border border-transparent focus:bg-white focus:border-neutral-300 focus:outline-none"
            />
          </div>
        </div>

        {/* Profit Ranking Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">Product Name</th>
                <th className="pb-3 text-center">Category</th>
                <th
                  className="pb-3 text-right cursor-pointer hover:text-neutral-900"
                  onClick={() => handleSort('units')}
                >
                  <span className="inline-flex items-center gap-1">
                    Units Sold {sortField === 'units' && (sortDirection === 'desc' ? '↓' : '↑')}
                  </span>
                </th>
                <th
                  className="pb-3 text-right cursor-pointer hover:text-neutral-900"
                  onClick={() => handleSort('revenue')}
                >
                  <span className="inline-flex items-center gap-1">
                    Revenue {sortField === 'revenue' && (sortDirection === 'desc' ? '↓' : '↑')}
                  </span>
                </th>
                <th className="pb-3 text-right">Selling / Cost</th>
                <th
                  className="pb-3 text-right cursor-pointer hover:text-neutral-900"
                  onClick={() => handleSort('gp')}
                >
                  <span className="inline-flex items-center gap-1">
                    Gross Profit {sortField === 'gp' && (sortDirection === 'desc' ? '↓' : '↑')}
                  </span>
                </th>
                <th
                  className="pb-3 text-right cursor-pointer hover:text-neutral-900"
                  onClick={() => handleSort('margin')}
                >
                  <span className="inline-flex items-center gap-1">
                    Margin % {sortField === 'margin' && (sortDirection === 'desc' ? '↓' : '↑')}
                  </span>
                </th>
                <th className="pb-3 pr-2 text-center">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredProducts.map(({ product, unitsSold, revenue, gp, margin, segment }) => {
                const hasCost = product.unitCost !== undefined;

                return (
                  <tr key={product.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 pl-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-900">{product.name}</span>
                        <span className="text-[11px] text-neutral-400 font-normal">
                          SKU: {product.id} • Stock: {product.stockOnHand}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 text-center text-neutral-600">
                      {product.category}
                    </td>

                    <td className="py-3.5 text-right font-semibold text-neutral-900">
                      {unitsSold} units
                    </td>

                    <td className="py-3.5 text-right font-bold text-neutral-900">
                      {formatINR(revenue)}
                    </td>

                    <td className="py-3.5 text-right">
                      <span className="block font-medium text-neutral-900">
                        {formatINR(product.sellingPrice)}
                      </span>
                      {hasCost ? (
                        <span className="block text-[10px] text-neutral-400">
                          Cost: {formatINR(product.unitCost)}
                        </span>
                      ) : (
                        <span className="block text-[10px] text-amber-600 font-semibold">
                          No cost data
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 text-right">
                      {hasCost ? (
                        <span className="font-bold text-emerald-700 text-sm">
                          {formatINR(gp)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertCircle size={11} /> Cost Needed
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 text-right">
                      {hasCost && margin !== undefined ? (
                        <span
                          className={`font-bold ${
                            margin >= 35
                              ? 'text-emerald-700'
                              : margin < 10
                              ? 'text-amber-700'
                              : 'text-neutral-700'
                          }`}
                        >
                          {margin.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 pr-2 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          segment === 'Profit Leader'
                            ? 'bg-emerald-100 text-emerald-800'
                            : segment === 'High-Revenue / Low-Margin'
                            ? 'bg-amber-100 text-amber-800'
                            : segment === 'Dead-stock Candidate'
                            ? 'bg-rose-100 text-rose-800'
                            : segment === 'Cost Data Needed'
                            ? 'bg-neutral-100 text-neutral-700 border border-neutral-300'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {segment}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Data Honesty Footnote */}
        <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-neutral-500">
          <div>
            <strong>Strict Data Grounding:</strong> Gross profit = Units Sold × (Selling Price − Unit Cost).
            Where unit cost is absent, IRIS refuses to fabricate arbitrary margin figures.
          </div>
          {onNavigateToData && (
            <button
              onClick={onNavigateToData}
              className="text-neutral-800 hover:underline font-semibold self-start sm:self-auto"
            >
              Update Missing Costs in Products & Data →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
