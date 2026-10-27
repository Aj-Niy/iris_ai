import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Info, 
  AlertTriangle, 
  Search, 
  Filter, 
  CheckCircle2, 
  Sparkles,
  Package
} from 'lucide-react';
import { Product, ForecastRecord, ForecastHorizon } from '../types';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { ForecastChart } from '../components/charts/ForecastChart';
import { PAST_14_DAYS_PRODUCT_SALES, SEASONAL_CALENDAR } from '../data/demoData';

interface DemandLensPageProps {
  products: Product[];
  forecasts: ForecastRecord[];
  onOpenReorderModal: (product: Product) => void;
}

export const DemandLensPage: React.FC<DemandLensPageProps> = ({
  products,
  forecasts,
  onOpenReorderModal,
}) => {
  const [horizon, setHorizon] = useState<ForecastHorizon>(14);
  const [selectedSkuId, setSelectedSkuId] = useState<string>('SKU-DL-01'); // Default to Decorative Lights
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'rise' | 'fall' | 'volume'>('rise');

  // Filter forecasts for currently selected horizon
  const horizonForecasts = forecasts.filter((f) => f.horizonDays === horizon);

  // Selected product & forecast for chart
  const selectedProduct = products.find((p) => p.id === selectedSkuId) || products[0];
  const selectedForecast = horizonForecasts.find((f) => f.skuId === selectedSkuId) || horizonForecasts[0];
  const recentSales = PAST_14_DAYS_PRODUCT_SALES[selectedProduct?.id || ''] || { unitsSold: 0, revenue: 0 };

  // Combined product + forecast items for table
  const tableItems = products
    .map((prod) => {
      const fc = horizonForecasts.find((f) => f.skuId === prod.id);
      const pastSales = PAST_14_DAYS_PRODUCT_SALES[prod.id] || { unitsSold: 0, revenue: 0 };
      const avgDailySales = Math.max(0.2, pastSales.unitsSold / 14);
      const stockCoverDays = prod.stockOnHand / avgDailySales;
      const isCritical = stockCoverDays <= prod.supplierLeadDays;

      return {
        product: prod,
        forecast: fc,
        pastSales,
        stockCoverDays,
        isCritical,
      };
    })
    .filter((item) => {
      if (!item.forecast) return false;
      const matchesSearch =
        item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || item.product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (!a.forecast || !b.forecast) return 0;
      if (sortOrder === 'rise') return b.forecast.changePct - a.forecast.changePct;
      if (sortOrder === 'fall') return a.forecast.changePct - b.forecast.changePct;
      return b.forecast.predictedUnits - a.forecast.predictedUnits;
    });

  // Extract unique categories
  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              DemandLens
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-200 text-neutral-800">
              SKU Demand Forecasting
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Project expected unit sales for 7, 14, and 30 days ahead based on sales baselines and calendar events.
          </p>
        </div>

        {/* 7, 14, 30 Day Horizon Switcher */}
        <div className="flex items-center p-1 bg-white rounded-xl border border-neutral-200 shadow-subtle self-start sm:self-auto">
          {([7, 14, 30] as ForecastHorizon[]).map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                horizon === h
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/60'
              }`}
            >
              {h}-Day Horizon
            </button>
          ))}
        </div>
      </div>

      {/* Active Seasonal Signal Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Calendar size={17} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Active Calendar Driver
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded">
                2.4x Multiplier
              </span>
            </div>
            <p className="text-xs text-amber-900 mt-0.5">
              <strong>Diwali Festive Shopping Week (Oct 28 – Nov 04):</strong> 140% historic lift for fairy lights, gift items and festive sweets.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-amber-800 shrink-0 self-end sm:self-auto">
          Method: Seasonal-naive + Baseline
        </span>
      </div>

      {/* Featured Forecast Chart for Selected Product */}
      {selectedProduct && selectedForecast && (
        <ForecastChart
          productName={selectedProduct.name}
          horizonDays={horizon}
          forecastUnits={selectedForecast.predictedUnits}
          lowerRange={selectedForecast.lowerRange}
          upperRange={selectedForecast.upperRange}
          actualRecentUnits={recentSales.unitsSold}
          stockOnHand={selectedProduct.stockOnHand}
          seasonalNote={selectedForecast.seasonalNote}
        />
      )}

      {/* Table Filters & Sorting Bar */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mr-1">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  categoryFilter === cat
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
                }`}
              >
                {cat === 'ALL' ? 'All Goods' : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Sort:
            </span>
            <div className="flex items-center p-0.5 bg-neutral-100 rounded-lg text-xs">
              <button
                onClick={() => setSortOrder('rise')}
                className={`px-2.5 py-1 rounded-md font-semibold ${
                  sortOrder === 'rise' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500'
                }`}
              >
                Strongest Rise
              </button>
              <button
                onClick={() => setSortOrder('fall')}
                className={`px-2.5 py-1 rounded-md font-semibold ${
                  sortOrder === 'fall' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500'
                }`}
              >
                Strongest Fall
              </button>
              <button
                onClick={() => setSortOrder('volume')}
                className={`px-2.5 py-1 rounded-md font-semibold ${
                  sortOrder === 'volume' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500'
                }`}
              >
                Unit Volume
              </button>
            </div>
          </div>
        </div>

        {/* Forecast Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">Product Name</th>
                <th className="pb-3 text-center">Horizon</th>
                <th className="pb-3 text-right">Predicted Units</th>
                <th className="pb-3 text-right">vs Baseline</th>
                <th className="pb-3 text-center">Stock on Hand</th>
                <th className="pb-3 text-center">Stockout Risk</th>
                <th className="pb-3 text-center">Confidence</th>
                <th className="pb-3 pr-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {tableItems.map(({ product, forecast, isCritical, stockCoverDays }) => {
                if (!forecast) return null;
                const isSelected = product.id === selectedSkuId;
                const isSpike = forecast.changePct > 50;

                return (
                  <tr
                    key={product.id}
                    onClick={() => setSelectedSkuId(product.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-neutral-100/70 font-semibold' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <td className="py-3.5 pl-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                          {product.name}
                          {isSpike && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              Surge
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] text-neutral-400 font-normal">
                          {product.category} • SKU: {product.id}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 text-center text-neutral-600 font-medium">
                      +{forecast.horizonDays} Days
                    </td>

                    <td className="py-3.5 text-right font-bold text-neutral-900">
                      {forecast.predictedUnits} units
                      {forecast.lowerRange && forecast.upperRange && (
                        <span className="block text-[10px] font-normal text-neutral-400">
                          [{forecast.lowerRange} – {forecast.upperRange}]
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 text-right font-semibold">
                      <span
                        className={`inline-flex items-center gap-0.5 ${
                          forecast.changePct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {forecast.changePct >= 0 ? (
                          <ArrowUpRight size={13} />
                        ) : (
                          <ArrowDownRight size={13} />
                        )}
                        {Math.abs(forecast.changePct)}%
                      </span>
                    </td>

                    <td className="py-3.5 text-center font-bold text-neutral-800">
                      {product.stockOnHand}
                      <span className="block text-[10px] font-normal text-neutral-400">
                        {stockCoverDays.toFixed(1)}d cover
                      </span>
                    </td>

                    <td className="py-3.5 text-center">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle size={11} /> Critical
                        </span>
                      ) : stockCoverDays <= product.supplierLeadDays * 1.5 ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Tight
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-600">
                          Adequate
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 text-center">
                      <ConfidenceBadge
                        confidence={forecast.confidence}
                        tooltip={forecast.confidenceReason}
                      />
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      {isCritical ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenReorderModal(product);
                          }}
                          className="px-3 py-1 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 transition-colors shadow-xs"
                        >
                          Draft Reorder
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSkuId(product.id);
                          }}
                          className="px-2.5 py-1 text-neutral-600 hover:text-neutral-900 text-xs font-semibold"
                        >
                          View Curve
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Forecast Method & Transparency Footnote */}
        <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-neutral-500">
          <div>
            <strong>Forecasting Guardrail:</strong> Moving-average & seasonal-naive extrapolation. Model never hallucinates numbers.
          </div>
          <div className="text-neutral-400">
            Selected SKU: <span className="font-mono text-neutral-700">{selectedProduct?.id}</span> ({selectedForecast?.method})
          </div>
        </div>
      </div>
    </div>
  );
};
