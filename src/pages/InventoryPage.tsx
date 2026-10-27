import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Clock, 
  Truck, 
  CheckCircle2, 
  ChevronRight, 
  Search, 
  Filter,
  FileEdit,
  Info,
  ShieldCheck
} from 'lucide-react';
import { Product, ForecastRecord, ActionRecord } from '../types';
import { 
  calculateStockCoverDays, 
  calculateSuggestedReorder, 
  getStockoutRiskLevel, 
  formatINR 
} from '../lib/calculations';
import { PAST_14_DAYS_PRODUCT_SALES } from '../data/demoData';

interface InventoryPageProps {
  products: Product[];
  forecasts: ForecastRecord[];
  onOpenReorderModal: (product: Product) => void;
  onNavigateToActions?: () => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  products,
  forecasts,
  onOpenReorderModal,
  onNavigateToActions,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  // Map 14-day forecasts
  const fc14Map = new Map(
    forecasts.filter((f) => f.horizonDays === 14).map((f) => [f.skuId, f])
  );

  const inventoryItems = products.map((prod) => {
    const fc = fc14Map.get(prod.id);
    const pastSales = PAST_14_DAYS_PRODUCT_SALES[prod.id] || { unitsSold: 0, revenue: 0 };
    const avgDailySales = Math.max(0.2, pastSales.unitsSold / 14);
    const coverDays = calculateStockCoverDays(prod.stockOnHand, avgDailySales);
    const riskLevel = getStockoutRiskLevel(coverDays, prod.supplierLeadDays);

    // Calculate suggested reorder strictly using SDP formula
    const { suggestedQty, leadTimeDemand } = calculateSuggestedReorder({
      leadTimeDays: prod.supplierLeadDays,
      avgDailySales,
      safetyStock: prod.safetyStock,
      stockOnHand: prod.stockOnHand,
      moq: prod.moq,
    });

    return {
      product: prod,
      forecast14d: fc?.predictedUnits || Math.round(avgDailySales * 14),
      avgDailySales,
      coverDays,
      riskLevel,
      suggestedQty,
      leadTimeDemand,
    };
  });

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || item.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  // Critical stockout items count
  const criticalCount = inventoryItems.filter((i) => i.riskLevel === 'Critical').length;
  const warningCount = inventoryItems.filter((i) => i.riskLevel === 'Warning').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Inventory Signals
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-200 text-neutral-800">
              Stockout Risk & Replenishment
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Prevent avoidable stockouts and reduce working capital tied up in slow-moving inventory.
          </p>
        </div>

        {onNavigateToActions && (
          <button
            onClick={onNavigateToActions}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>View Generated Orders</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Alert Banner if Critical Items Exist */}
      {criticalCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-950">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Critical Stockout Imminent
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-200 text-rose-800 rounded">
                  {criticalCount} Item
                </span>
              </div>
              <p className="text-xs text-rose-900 mt-0.5">
                <strong>Warm White LED Fairy Lights (10m):</strong> 65 units in stock vs 5-day supplier lead time. At current festive velocity, stock will deplete in ~5.1 days!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const lights = products.find((p) => p.id === 'SKU-DL-01');
              if (lights) onOpenReorderModal(lights);
            }}
            className="px-3.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs shrink-0 self-end sm:self-auto"
          >
            Review Restock Reorder
          </button>
        </div>
      )}

      {/* Filter & Summary Bar */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mr-1">
              Risk Level:
            </span>
            {['ALL', 'Critical', 'Warning', 'Healthy', 'Overstocked'].map((status) => (
              <button
                key={status}
                onClick={() => setRiskFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  riskFilter === status
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product or supplier..."
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-100 rounded-lg text-xs border border-transparent focus:bg-white focus:border-neutral-300 focus:outline-none"
            />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">Product & Supplier</th>
                <th className="pb-3 text-center">Stock on Hand</th>
                <th className="pb-3 text-right">Avg Daily Run</th>
                <th className="pb-3 text-center">Days Cover</th>
                <th className="pb-3 text-center">Lead Time</th>
                <th className="pb-3 text-center">Risk Status</th>
                <th className="pb-3 text-right">Suggested Order</th>
                <th className="pb-3 pr-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredItems.map(({ product, avgDailySales, coverDays, riskLevel, suggestedQty, leadTimeDemand }) => (
                <tr key={product.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3.5 pl-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-neutral-900">{product.name}</span>
                      <span className="text-[11px] text-neutral-400 font-normal">
                        Supplier: {product.supplierName} • SKU: {product.id}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 text-center font-bold text-neutral-900 text-sm">
                    {product.stockOnHand}
                  </td>

                  <td className="py-3.5 text-right font-medium text-neutral-700">
                    {avgDailySales.toFixed(1)} / day
                  </td>

                  <td className="py-3.5 text-center font-semibold">
                    <span
                      className={`${
                        coverDays <= product.supplierLeadDays
                          ? 'text-rose-600 font-bold'
                          : coverDays <= product.supplierLeadDays * 1.5
                          ? 'text-amber-700 font-semibold'
                          : 'text-neutral-700'
                      }`}
                    >
                      {coverDays.toFixed(1)} days
                    </span>
                  </td>

                  <td className="py-3.5 text-center text-neutral-600 font-medium">
                    {product.supplierLeadDays} days
                  </td>

                  <td className="py-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        riskLevel === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : riskLevel === 'Warning'
                          ? 'bg-amber-100 text-amber-800'
                          : riskLevel === 'Overstocked'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {riskLevel === 'Critical' && <AlertTriangle size={11} />}
                      {riskLevel}
                    </span>
                  </td>

                  <td className="py-3.5 text-right font-bold text-neutral-900">
                    {suggestedQty > 0 ? (
                      <div>
                        <span>{suggestedQty} units</span>
                        {product.unitCost && (
                          <span className="block text-[10px] font-normal text-neutral-400">
                            ~{formatINR(suggestedQty * product.unitCost)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-neutral-400 font-normal">0 (Sufficient)</span>
                    )}
                  </td>

                  <td className="py-3.5 pr-2 text-right">
                    <button
                      onClick={() => onOpenReorderModal(product)}
                      className="px-3 py-1 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 transition-colors shadow-xs"
                    >
                      Review Reorder
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Reorder Formula Transparency Box */}
        <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-neutral-500">
          <div>
            <strong>Transparent Formula:</strong> Suggested Reorder = (Lead Time Demand + Safety Stock) − Current Stock on Hand. Floored at 0, rounded to nearest MOQ pack.
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <ShieldCheck size={14} />
            <span>Never places automated purchase orders</span>
          </div>
        </div>
      </div>
    </div>
  );
};
