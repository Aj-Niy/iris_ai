import React, { useState, useEffect } from 'react';
import { NavRoute } from './components/common/Sidebar';
import { AppShell } from './components/common/AppShell';
import { ToastProvider, useToast } from './components/common/Toast';
import { storageService } from './services/storageService';
import { Product, ActionRecord, ActionStatus, StoreProfile } from './types';
import { INITIAL_FORECASTS } from './data/demoData';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { DemandLensPage } from './pages/DemandLensPage';
import { ProfitRadarPage } from './pages/ProfitRadarPage';
import { InventoryPage } from './pages/InventoryPage';
import { ActionsPage } from './pages/ActionsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ProductsDataPage } from './pages/ProductsDataPage';
import { SettingsPage } from './pages/SettingsPage';

// Modals
import { ReorderModal } from './components/modals/ReorderModal';
import { ActionDetailDrawer } from './components/modals/ActionDetailDrawer';

function AppContent() {
  const { showToast } = useToast();
  const [currentRoute, setCurrentRoute] = useState<NavRoute>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Persistent States
  const [products, setProducts] = useState<Product[]>(() => storageService.getProducts());
  const [actions, setActions] = useState<ActionRecord[]>(() => storageService.getActions());
  const [profile, setProfile] = useState<StoreProfile>(() => storageService.getProfile());

  // Modal / Drawer Selection States
  const [reorderProduct, setReorderProduct] = useState<Product | null>(null);
  const [selectedAction, setSelectedAction] = useState<ActionRecord | null>(null);

  // Sync with browser URL hash if present
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavRoute;
      const validRoutes: NavRoute[] = [
        'dashboard',
        'demand',
        'profit',
        'inventory',
        'actions',
        'payments',
        'products-data',
        'settings',
      ];
      if (validRoutes.includes(hash)) {
        setCurrentRoute(hash);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (route: NavRoute) => {
    setCurrentRoute(route);
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Action status updates
  const handleUpdateActionStatus = (actionId: string, newStatus: ActionStatus, note?: string) => {
    const updated = storageService.updateActionStatus(actionId, newStatus, note);
    setActions(updated);
    if (selectedAction && selectedAction.id === actionId) {
      const refreshed = updated.find((a) => a.id === actionId);
      if (refreshed) setSelectedAction(refreshed);
    }
  };

  // Action draft field updates
  const handleSaveActionDraftUpdates = (
    actionId: string,
    updates: Partial<ActionRecord>,
    note?: string
  ) => {
    const updated = storageService.saveActionDraft(actionId, updates, note);
    setActions(updated);
    if (selectedAction && selectedAction.id === actionId) {
      const refreshed = updated.find((a) => a.id === actionId);
      if (refreshed) setSelectedAction(refreshed);
    }
  };

  // Reorder save handler
  const handleSaveReorderDraft = (params: {
    productId: string;
    productName: string;
    reorderQty: number;
    supplierName: string;
    costEstimate: number;
    notes: string;
  }) => {
    // Check if an action already exists for this product
    const existing = actions.find(
      (a) => a.type === 'reorder' && a.targetSkuId === params.productId
    );

    if (existing) {
      const updated = storageService.saveActionDraft(
        existing.id,
        {
          status: 'Draft',
          draftPayload: {
            ...existing.draftPayload,
            reorderQty: params.reorderQty,
            supplierName: params.supplierName,
            costEstimate: params.costEstimate,
            notes: params.notes,
          },
        },
        `Reorder draft saved with ${params.reorderQty} units.`
      );
      setActions(updated);
      showToast(
        'Reorder Draft Updated',
        `Saved ${params.reorderQty} units for ${params.productName} in Action Plan.`
      );
    } else {
      const newAction = storageService.createAction({
        type: 'reorder',
        title: `Restock Reorder: ${params.productName}`,
        explanation: `Manual replenishment draft initiated for ${params.productName}.`,
        evidence: `Created from Inventory Signals. Proposed quantity: ${params.reorderQty} units via ${params.supplierName}.`,
        targetSkuId: params.productId,
        targetSkuName: params.productName,
        priority: 'High',
        confidence: 'High',
        effort: 'Low',
        risk: 'Low',
        expectedBenefit: `Prevents stockout and ensures uninterrupted shop operations.`,
        status: 'Draft',
        draftPayload: {
          reorderQty: params.reorderQty,
          supplierName: params.supplierName,
          costEstimate: params.costEstimate,
          notes: params.notes,
        },
      });
      setActions(storageService.getActions());
      showToast(
        'Reorder Draft Created',
        `Created new draft for ${params.reorderQty} units of ${params.productName}.`
      );
    }
  };

  // Support task creation from Payments page
  const handleCreatePaymentSupportTask = () => {
    const existingPaymentTask = actions.find((a) => a.type === 'payment_issue');
    if (existingPaymentTask) {
      handleNavigate('actions');
      setSelectedAction(existingPaymentTask);
      return;
    }

    const newAction = storageService.createAction({
      type: 'payment_issue',
      title: 'Counter Escalation: Guide Cashiers on UPI Bank Downtime',
      explanation: 'Recent surge in Axis Bank & SBI UPI server timeouts created checkout friction.',
      evidence: '18 failed transactions (₹7,850) logged during evening peak hour. Paytm Soundbox announced failure.',
      priority: 'High',
      confidence: 'High',
      effort: 'Low',
      risk: 'Low',
      expectedBenefit: 'Avoids cart abandonment by offering RuPay Tap or Paytm Wallet immediately.',
      status: 'Suggested',
      draftPayload: {
        notes: 'Print cashier reference card: "For Axis/SBI UPI errors, prompt customer for RuPay Card Tap or Wallet QR".',
      },
    });
    setActions(storageService.getActions());
    handleNavigate('actions');
    setSelectedAction(newAction);
  };

  // Product additions & updates
  const handleAddProducts = (newProducts: Product[]) => {
    const merged = [...newProducts, ...products];
    storageService.saveProducts(merged);
    setProducts(merged);
  };

  const handleUpdateProduct = (updated: Product) => {
    const newProducts = products.map((p) => (p.id === updated.id ? updated : p));
    storageService.saveProducts(newProducts);
    setProducts(newProducts);
  };

  // Store profile update
  const handleUpdateProfile = (newProfile: StoreProfile) => {
    storageService.saveProfile(newProfile);
    setProfile(newProfile);
  };

  // Reset all to default fixtures
  const handleResetAllData = () => {
    storageService.resetAll();
    setProducts(storageService.getProducts());
    setActions(storageService.getActions());
    setProfile(storageService.getProfile());
    setSelectedAction(null);
    setReorderProduct(null);
  };

  return (
    <AppShell
      currentRoute={currentRoute}
      onNavigate={handleNavigate}
      actions={actions}
      products={products}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {/* Route Views */}
      {currentRoute === 'dashboard' && (
        <DashboardPage
          products={products}
          actions={actions}
          forecasts={INITIAL_FORECASTS}
          onNavigate={handleNavigate}
          onOpenReorderModal={(p) => setReorderProduct(p)}
          onOpenActionDetail={(a) => setSelectedAction(a)}
        />
      )}

      {currentRoute === 'demand' && (
        <DemandLensPage
          products={products}
          forecasts={INITIAL_FORECASTS}
          onOpenReorderModal={(p) => setReorderProduct(p)}
        />
      )}

      {currentRoute === 'profit' && (
        <ProfitRadarPage
          products={products}
          onOpenActionDetail={(a) => setSelectedAction(a)}
          onNavigateToData={() => handleNavigate('products-data')}
        />
      )}

      {currentRoute === 'inventory' && (
        <InventoryPage
          products={products}
          forecasts={INITIAL_FORECASTS}
          onOpenReorderModal={(p) => setReorderProduct(p)}
          onNavigateToActions={() => handleNavigate('actions')}
        />
      )}

      {currentRoute === 'actions' && (
        <ActionsPage
          actions={actions}
          onUpdateStatus={handleUpdateActionStatus}
          onOpenActionDetail={(a) => setSelectedAction(a)}
        />
      )}

      {currentRoute === 'payments' && (
        <PaymentsPage onCreateSupportTask={handleCreatePaymentSupportTask} />
      )}

      {currentRoute === 'products-data' && (
        <ProductsDataPage
          products={products}
          onAddProducts={handleAddProducts}
          onUpdateProduct={handleUpdateProduct}
        />
      )}

      {currentRoute === 'settings' && (
        <SettingsPage
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          onResetAllData={handleResetAllData}
        />
      )}

      {/* Global Interactive Reorder Modal */}
      <ReorderModal
        product={reorderProduct}
        isOpen={reorderProduct !== null}
        onClose={() => setReorderProduct(null)}
        onSaveDraft={handleSaveReorderDraft}
      />

      {/* Global Action Detail Drawer */}
      <ActionDetailDrawer
        action={selectedAction}
        isOpen={selectedAction !== null}
        onClose={() => setSelectedAction(null)}
        onUpdateStatus={handleUpdateActionStatus}
        onSaveDraftUpdates={handleSaveActionDraftUpdates}
      />
    </AppShell>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
