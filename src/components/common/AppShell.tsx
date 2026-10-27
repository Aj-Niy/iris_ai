import React, { useState } from 'react';
import { Sidebar, NavRoute } from './Sidebar';
import { Topbar } from './Topbar';
import { ActionRecord, Product } from '../../types';
import { X, ShieldAlert } from 'lucide-react';

interface AppShellProps {
  currentRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  actions: ActionRecord[];
  products: Product[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentRoute,
  onNavigate,
  actions,
  products,
  searchQuery,
  onSearchChange,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F4F5F7] overflow-hidden text-neutral-900 font-sans">
      {/* Desktop Persistent Left Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={onNavigate}
          actions={actions}
          products={products}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700"
            >
              <X size={20} />
            </button>
            <Sidebar
              currentRoute={currentRoute}
              onNavigate={onNavigate}
              actions={actions}
              products={products}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <Topbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNavigate={onNavigate}
          actions={actions}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />

        {/* Global Demo Notice Strip */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-xs text-amber-900 font-medium">
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="text-amber-700 shrink-0" />
            <span>
              <strong>IRIS Demonstration Environment:</strong> Using synthetic neighbourhood retail fixtures. Reorder drafts & campaigns require merchant review before execution.
            </span>
          </div>
          <span className="hidden sm:inline text-[11px] text-amber-800 font-mono">
            Bengaluru / Indiranagar Cluster
          </span>
        </div>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
