import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowRight,
  AlertTriangle, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles,
  Clock,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Product, ActionRecord, ForecastRecord } from '../types';
import { formatINR, formatNumber } from '../lib/calculations';
import { SALES_TREND_14_DAYS, PAST_14_DAYS_PRODUCT_SALES } from '../data/demoData';
import { SalesTrendChart } from '../components/charts/SalesTrendChart';
import { RadialProgress } from '../components/charts/RadialProgress';
import { KpiCard } from '../components/common/KpiCard';
import { NavRoute } from '../components/common/Sidebar';

interface DashboardPageProps {
  products: Product[];
  actions: ActionRecord[];
  forecasts: ForecastRecord[];
  onNavigate: (route: NavRoute) => void;
  onOpenReorderModal: (product: Product) => void;
  onOpenActionDetail: (action: ActionRecord) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  products,
  actions,
  forecasts,
  onNavigate,
  onOpenReorderModal,
  onOpenActionDetail,
}) => {
  // Aggregate 14-day calculations
  const total14DaySales = SALES_TREND_14_DAYS.reduce((acc, curr) => acc + curr.sales, 0);
  const total14DayTxns = SALES_TREND_14_DAYS.reduce((acc, curr) => acc + curr.transactions, 0);
  const total14DayGP = SALES_TREND_14_DAYS.reduce((acc, curr) => acc + curr.gp, 0);

  // Products at stockout risk: stockOnHand <= (leadTimeDays * 12)
  const itemsAtStockoutRisk = products.filter((p) => p.stockOnHand <= p.supplierLeadDays * 13);

  // Top 3 priority actions
  const priorityActions = actions
    .filter((a) => a.status === 'Suggested' || a.status === 'Draft')
    .slice(0, 3);

  // Top profit items from past 14 days
  const profitLeaders = products
    .filter((p) => p.unitCost !== undefined)
    .map((p) => {
      const sales = PAST_14_DAYS_PRODUCT_SALES[p.id] || { unitsSold: 0, revenue: 0 };
      const gp = sales.unitsSold * (p.sellingPrice - (p.unitCost || 0));
      const margin = sales.revenue > 0 ? (gp / sales.revenue) * 100 : 0;
      return { product: p, sales, gp, margin };
    })
    .sort((a, b) => b.gp - a.gp)
    .slice(0, 4);

  // Demand watchlist (14-day horizon)
  const demandWatchlist = forecasts
    .filter((f) => f.horizonDays === 14)
    .map((f) => {
      const prod = products.find((p) => p.id === f.skuId);
      return { forecast: f, product: prod };
    })
    .filter((item): item is { forecast: ForecastRecord; product: Product } => item.product !== undefined)
    .sort((a, b) => Math.abs(b.forecast.changePct) - Math.abs(a.forecast.changePct))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Page Title & Store Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Operating Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-200 text-neutral-800">
              Stationery & Daily Needs
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Sharma Stationery & Daily Needs • 14-Day Trajectory (Oct 14 – Oct 27, 2026)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('actions')}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-all shadow-sm flex items-center gap-2"
          >
            <CheckSquareIcon size={14} />
            <span>Review Actions ({actions.filter(a => a.status === 'Suggested').length})</span>
          </button>
        </div>
      </div>

      {/* Figma-Inspired Dark Overview Card + Goal Ring Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Hero Card */}
        <div className="lg:col-span-2 rounded-2xl p-6 sm:p-7 bg-gradient-to-br from-[#111318] via-[#161922] to-[#1E232E] text-white shadow-elevated border border-neutral-800 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Dashboard Overview
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Store Open • Normal Terminal Operations
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-3">
              Hello Rajesh Sharma 👋
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl">
              Diwali festive footfall is rising. <strong>Fairy Lights</strong> demand is accelerating +140%, while <strong>Notebook 6-Packs</strong> are generating your strongest cash gross margins.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-neutral-800">
            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block">
                Today's Sales
              </span>
              <span className="text-xl font-bold text-white block mt-1">₹9,150</span>
              <span className="text-[10px] text-emerald-400 font-medium">+12% vs last Mon</span>
            </div>

            <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block">
                Footfall / Txns
              </span>
              <span className="text-xl font-bold text-white block mt-1">52 txns</span>
              <span className="text-[10px] text-neutral-400 font-medium">Avg ₹176 / bill</span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block">
                  Next Urgent Move
                </span>
                <span className="text-xs font-bold text-rose-300 block mt-1 line-clamp-1">
                  Restock Fairy Lights (5d lead)
                </span>
              </div>
              <button
                onClick={() => {
                  const lights = products.find((p) => p.id === 'SKU-DL-01');
                  if (lights) onOpenReorderModal(lights);
                }}
                className="mt-2 text-[11px] font-bold text-white hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1"
              >
                <span>Draft Reorder</span>
                <ArrowUpRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Figma-Inspired Goal Progress Ring Card */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-[#12141A] to-[#1A1D26] text-white shadow-elevated border border-neutral-800 flex flex-col items-center justify-between text-center">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Festival Target Progress
            </span>
            <span className="text-neutral-500 hover:text-neutral-300 text-xs cursor-pointer">•••</span>
          </div>

          <div className="py-2">
            <RadialProgress
              percentage={75}
              size={135}
              label="75%"
              sublabel="Restock Readiness"
            />
          </div>

          <div>
            <div className="text-xl font-bold tracking-tight text-white">₹1,03,577</div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Target: ₹1,50,000 seasonal turnover
            </p>
          </div>

          <button
            onClick={() => onNavigate('demand')}
            className="w-full mt-4 py-2.5 px-4 bg-white text-neutral-900 rounded-xl text-xs font-bold hover:bg-neutral-100 transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>Explore Demand Forecasts</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 4 Compact Business KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="14-Day Sales Revenue"
          value={formatINR(total14DaySales)}
          subtitle="Total verified turnover across 14 operating days"
          badge={{ text: '+18.4%', variant: 'positive' }}
          icon={TrendingUp}
          onClick={() => onNavigate('demand')}
          tooltip="Click to view item-level demand"
        />

        <KpiCard
          title="Total Transactions"
          value={formatNumber(total14DayTxns)}
          subtitle="Paytm QR, RuPay Card & counter sales"
          badge={{ text: '₹163 AOV', variant: 'neutral' }}
          icon={CreditCard}
          onClick={() => onNavigate('payments')}
          tooltip="Click to view payment analytics"
        />

        <KpiCard
          title="Estimated Gross Profit"
          value={formatINR(total14DayGP)}
          subtitle="Calculated only where unit cost is supplied (38.1% blended margin)"
          badge={{ text: 'Top: Notebooks', variant: 'positive' }}
          icon={DollarSign}
          onClick={() => onNavigate('profit')}
          tooltip="Click to inspect profit rankings"
        />

        <KpiCard
          title="Items at Stockout Risk"
          value={itemsAtStockoutRisk.length}
          subtitle="Stock cover <= supplier lead time (Fairy Lights critical)"
          badge={{ text: 'Action Needed', variant: 'negative' }}
          icon={AlertTriangle}
          onClick={() => onNavigate('inventory')}
          tooltip="Click to review inventory signals"
        />
      </div>

      {/* Primary 14-Day Sales Trend Chart Card */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-subtle">
        <SalesTrendChart data={SALES_TREND_14_DAYS} height={250} />
      </div>

      {/* Needs Attention: Top 3 Ranked Actions */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-subtle">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="text-base font-bold text-neutral-900">
                Needs Immediate Attention (Top 3 Actions)
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Prioritized by expected cash benefit, supplier lead time, and execution risk.
            </p>
          </div>

          <button
            onClick={() => onNavigate('actions')}
            className="text-xs font-bold text-neutral-700 hover:text-neutral-900 flex items-center gap-1"
          >
            <span>Open Action Plan</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {priorityActions.map((action, idx) => (
            <div
              key={action.id}
              onClick={() => onOpenActionDetail(action)}
              className="p-4 rounded-xl border border-neutral-200/90 hover:border-neutral-400 bg-neutral-50/50 hover:bg-white transition-all cursor-pointer shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Priority #{idx + 1} • {action.type.replace('_', ' ')}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      action.priority === 'High'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {action.priority}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-neutral-900 line-clamp-2">
                  {action.title}
                </h4>

                <p className="text-[11px] text-neutral-600 mt-2 line-clamp-3 leading-relaxed">
                  {action.explanation}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-emerald-700 font-sans">
                  {action.confidence} Confidence
                </span>
                <span className="font-bold text-neutral-900 hover:underline flex items-center gap-0.5">
                  Review <ChevronRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Demand Watchlist & Profit Leaders Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demand Watchlist (14-Day Horizon) */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Demand Watchlist (Next 14 Days)</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Expected units vs past 14-day store baseline</p>
              </div>
              <button
                onClick={() => onNavigate('demand')}
                className="text-xs font-bold text-neutral-700 hover:text-neutral-900 flex items-center gap-1"
              >
                <span>DemandLens</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="divide-y divide-neutral-100 mt-2">
              {demandWatchlist.map(({ forecast, product }) => {
                const isSpike = forecast.changePct > 50;
                const isDrop = forecast.changePct < -20;
                return (
                  <div
                    key={forecast.skuId}
                    onClick={() => onNavigate('demand')}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-neutral-50 px-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900 truncate">
                          {product.name}
                        </span>
                        {isSpike && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                            Festive Spike
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-500 block mt-0.5">
                        Stock on hand: {product.stockOnHand} • Lead time: {product.supplierLeadDays}d
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-neutral-900 block">
                        {forecast.predictedUnits} units
                      </span>
                      <span
                        className={`text-[11px] font-semibold flex items-center justify-end gap-0.5 ${
                          forecast.changePct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {forecast.changePct >= 0 ? (
                          <ArrowUpRight size={12} />
                        ) : (
                          <ArrowDownRight size={12} />
                        )}
                        {Math.abs(forecast.changePct)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Forecast estimates based on seasonal-naive & moving-average baseline</span>
            <span className="font-semibold text-neutral-600">Deterministic fixtures</span>
          </div>
        </div>

        {/* Profit Leaders Preview */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Gross Profit Contribution</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Top profit contributors (Revenue ≠ Gross Profit)</p>
              </div>
              <button
                onClick={() => onNavigate('profit')}
                className="text-xs font-bold text-neutral-700 hover:text-neutral-900 flex items-center gap-1"
              >
                <span>Profit Radar</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="divide-y divide-neutral-100 mt-2">
              {profitLeaders.map(({ product, sales, gp, margin }) => (
                <div
                  key={product.id}
                  onClick={() => onNavigate('profit')}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-neutral-50 px-2 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-neutral-900 truncate block">
                      {product.name}
                    </span>
                    <span className="text-[11px] text-neutral-500 block mt-0.5">
                      {sales.unitsSold} units • Selling {formatINR(product.sellingPrice)} (Cost: {formatINR(product.unitCost)})
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-700 block">
                      {formatINR(gp)} GP
                    </span>
                    <span className="text-[11px] font-semibold text-neutral-500 block">
                      {margin.toFixed(1)}% margin
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Requires unit cost data; missing cost items excluded from ranking</span>
            <span className="font-semibold text-emerald-600">Verified formula</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function CheckSquareIcon(props: { size?: number }) {
  return (
    <svg
      width={props.size || 16}
      height={props.size || 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
