import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  DollarSign, 
  Package, 
  CheckSquare, 
  CreditCard, 
  Database, 
  Settings, 
  Store,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { ActionRecord, Product } from '../../types';

export type NavRoute = 
  | 'dashboard'
  | 'demand'
  | 'profit'
  | 'inventory'
  | 'actions'
  | 'payments'
  | 'products-data'
  | 'settings';

interface SidebarProps {
  currentRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  actions: ActionRecord[];
  products: Product[];
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  actions,
  products,
  onCloseMobile,
}) => {
  // Compute pending actions count
  const pendingActionsCount = actions.filter(
    (a) => a.status === 'Suggested' || a.status === 'Draft'
  ).length;

  // Compute items with critical or warning stockout risk
  const stockoutRiskCount = products.filter((p) => {
    const isCritical = p.stockOnHand <= (p.supplierLeadDays * 12);
    return isCritical;
  }).length;

  const navItems = [
    {
      group: 'OPERATIONS',
      items: [
        {
          id: 'dashboard' as NavRoute,
          label: 'Dashboard',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          id: 'demand' as NavRoute,
          label: 'DemandLens',
          icon: TrendingUp,
          badge: '14d Spike',
          badgeVariant: 'warning',
        },
        {
          id: 'profit' as NavRoute,
          label: 'Profit Radar',
          icon: DollarSign,
          badge: null,
        },
        {
          id: 'inventory' as NavRoute,
          label: 'Inventory Signals',
          icon: Package,
          badge: stockoutRiskCount > 0 ? `${stockoutRiskCount} At Risk` : null,
          badgeVariant: 'danger',
        },
        {
          id: 'actions' as NavRoute,
          label: 'Daily Action Plan',
          icon: CheckSquare,
          badge: pendingActionsCount > 0 ? `${pendingActionsCount} Due` : null,
          badgeVariant: 'info',
        },
        {
          id: 'payments' as NavRoute,
          label: 'Payment Health',
          icon: CreditCard,
          badge: 'Spike Alert',
          badgeVariant: 'warning',
        },
      ],
    },
    {
      group: 'DATA & SYSTEM',
      items: [
        {
          id: 'products-data' as NavRoute,
          label: 'Products & Data',
          icon: Database,
          badge: null,
        },
        {
          id: 'settings' as NavRoute,
          label: 'Settings',
          icon: Settings,
          badge: null,
        },
      ],
    },
  ];

  const handleItemClick = (route: NavRoute) => {
    onNavigate(route);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 bg-white h-screen flex flex-col border-r border-neutral-200/80 select-none">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src="/iris-logo.png"
            alt="IRIS — Merchant Growth AI"
            className="h-9 w-auto object-contain cursor-pointer"
            onClick={() => handleItemClick('dashboard')}
          />
        </div>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-600">
          v1.0
        </span>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {navItems.map((section) => (
          <div key={section.group}>
            <h5 className="px-3 text-[11px] font-bold tracking-wider uppercase text-neutral-400 mb-2">
              {section.group}
            </h5>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-neutral-900 text-white shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={17}
                        className={isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-600'}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                            : item.badgeVariant === 'danger'
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : item.badgeVariant === 'warning'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Merchant Profile Footer */}
      <div className="p-4 border-t border-neutral-100 bg-neutral-50/60">
        <div className="p-3 bg-white rounded-xl border border-neutral-200/80 shadow-subtle flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center font-bold text-xs shrink-0">
            <Store size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <h6 className="text-xs font-bold text-neutral-900 truncate">Sharma Stationery</h6>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[10px] text-neutral-500 font-medium truncate">Indiranagar (KA)</span>
            </div>
          </div>
        </div>

        <div className="mt-2.5 px-2 flex items-center justify-between text-[10px] text-neutral-400">
          <span className="font-mono">PAYTM-MRCH-94821</span>
          <span className="font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            DEMO DATA
          </span>
        </div>
      </div>
    </aside>
  );
};
