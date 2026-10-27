import React, { useState } from 'react';
import { Search, Bell, Menu, ShieldCheck, ChevronDown, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { NavRoute } from './Sidebar';
import { ActionRecord } from '../../types';

interface TopbarProps {
  onOpenMobileMenu: () => void;
  onNavigate: (route: NavRoute) => void;
  actions: ActionRecord[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileMenu,
  onNavigate,
  actions,
  searchQuery,
  onSearchChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  // Filter urgent unhandled actions
  const urgentActions = actions.filter(
    (a) => a.priority === 'High' && (a.status === 'Suggested' || a.status === 'Draft')
  );

  return (
    <header className="h-16 bg-white border-b border-neutral-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Menu + Search pill */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="relative w-full">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products, actions, forecasts, transactions..."
            className="w-full pl-9 pr-4 py-2 bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white text-xs rounded-xl border border-transparent focus:border-neutral-300 focus:outline-none transition-all placeholder:text-neutral-400 font-medium text-neutral-800"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-4">

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors relative"
            title="Merchant Alerts"
          >
            <Bell size={18} />
            {urgentActions.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-elevated border border-neutral-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-neutral-900">Operator Signals</h4>
                    <span className="text-[10px] font-bold bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-600">
                      {urgentActions.length} Priority
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('actions');
                    }}
                    className="text-xs text-neutral-600 hover:text-neutral-900 font-semibold"
                  >
                    View All
                  </button>
                </div>

                <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
                  {urgentActions.map((act) => (
                    <div
                      key={act.id}
                      onClick={() => {
                        setShowNotifications(false);
                        onNavigate('actions');
                      }}
                      className="p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100/80 cursor-pointer transition-colors border border-neutral-100"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-neutral-900 line-clamp-1">
                          {act.title}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 shrink-0">
                          High
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">
                        {act.explanation}
                      </p>
                    </div>
                  ))}

                  {urgentActions.length === 0 && (
                    <div className="py-6 text-center text-xs text-neutral-500">
                      No urgent alerts pending approval.
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Deterministic triggers</span>
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <ShieldCheck size={13} /> Human approval required
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Merchant Avatar Pill */}
        <div
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-2.5 pl-2 py-1 pr-3 rounded-xl hover:bg-neutral-100 cursor-pointer transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-xs shadow-sm">
            RS
          </div>
          <div className="hidden md:block text-left">
            <span className="block text-xs font-bold text-neutral-900 leading-tight">
              Rajesh Sharma
            </span>
            <span className="block text-[10px] text-neutral-500 font-medium">
              Store Owner
            </span>
          </div>
          <ChevronDown size={14} className="text-neutral-400 hidden md:block" />
        </div>
      </div>
    </header>
  );
};
