import { 
  Product, 
  ActionRecord, 
  StoreProfile, 
  ActionStatus 
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_ACTIONS, 
  INITIAL_STORE_PROFILE 
} from '../data/demoData';

const STORAGE_KEYS = {
  PRODUCTS: 'iris_demo_products_v1',
  ACTIONS: 'iris_demo_actions_v1',
  PROFILE: 'iris_demo_profile_v1',
};

export const storageService = {
  getProducts(): Product[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load products from localStorage, using fallback', e);
    }
    return INITIAL_PRODUCTS;
  },

  saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products', e);
    }
  },

  getActions(): ActionRecord[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load actions from localStorage, using fallback', e);
    }
    return INITIAL_ACTIONS;
  },

  saveActions(actions: ActionRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(actions));
    } catch (e) {
      console.error('Failed to save actions', e);
    }
  },

  updateActionStatus(actionId: string, newStatus: ActionStatus, note?: string): ActionRecord[] {
    const actions = this.getActions();
    const updated = actions.map((act) => {
      if (act.id === actionId) {
        const auditEntry = {
          timestamp: new Date().toISOString(),
          action: `Status changed from ${act.status} to ${newStatus}`,
          actor: 'Merchant (Rajesh Sharma)',
          note: note || (newStatus === 'Simulated Complete' ? 'Simulated execution verified. No actual money moved.' : undefined)
        };
        return {
          ...act,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          auditTrail: [auditEntry, ...act.auditTrail]
        };
      }
      return act;
    });
    this.saveActions(updated);
    return updated;
  },

  saveActionDraft(actionId: string, updates: Partial<ActionRecord>, note?: string): ActionRecord[] {
    const actions = this.getActions();
    const updated = actions.map((act) => {
      if (act.id === actionId) {
        const auditEntry = {
          timestamp: new Date().toISOString(),
          action: 'Draft parameters updated by merchant',
          actor: 'Merchant (Rajesh Sharma)',
          note: note || 'Quantity / payload adjusted'
        };
        return {
          ...act,
          ...updates,
          status: act.status === 'Suggested' ? 'Draft' : act.status,
          updatedAt: new Date().toISOString(),
          auditTrail: [auditEntry, ...act.auditTrail]
        };
      }
      return act;
    });
    this.saveActions(updated);
    return updated;
  },

  createAction(action: Omit<ActionRecord, 'id' | 'createdAt' | 'updatedAt' | 'auditTrail'>): ActionRecord {
    const actions = this.getActions();
    const newId = `ACT-2026-${String(actions.length + 1).padStart(3, '0')}`;
    const newRecord: ActionRecord = {
      ...action,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          action: 'Created action manually or from signal trigger',
          actor: 'Merchant (Rajesh Sharma)',
        }
      ]
    };
    const updated = [newRecord, ...actions];
    this.saveActions(updated);
    return newRecord;
  },

  getProfile(): StoreProfile {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load profile', e);
    }
    return INITIAL_STORE_PROFILE;
  },

  saveProfile(profile: StoreProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  resetAll(): void {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ACTIONS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  }
};
