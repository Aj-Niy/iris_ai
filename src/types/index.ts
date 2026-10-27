export type Currency = 'INR';

export type Product = {
  id: string;
  name: string;
  category: string;
  sellingPrice: number;
  unitCost?: number; // Optional: when missing, indicates missing-cost state
  stockOnHand: number;
  supplierLeadDays: number;
  safetyStock: number;
  stockAgeDays?: number; // for dead-stock risk calculation
  moq?: number;
  supplierName: string;
  lastUpdated: string;
};

export type DailySkuSale = {
  date: string; // YYYY-MM-DD
  skuId: string;
  unitsSold: number;
  revenue: number;
};

export type PaymentMethod = 'Paytm QR (UPI)' | 'RuPay Debit Card' | 'Paytm Wallet' | 'Cash';

export type PaymentStatus = 'Completed' | 'Failed' | 'Pending';

export type PaymentTransaction = {
  id: string;
  timestamp: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  failureReason?: string;
  customerName?: string;
  reference: string;
};

export type ForecastHorizon = 7 | 14 | 30;

export type ForecastConfidence = 'High' | 'Medium' | 'Low';

export type ForecastRecord = {
  skuId: string;
  horizonDays: ForecastHorizon;
  predictedUnits: number;
  lowerRange?: number;
  upperRange?: number;
  changePct: number; // vs product baseline
  confidence: ForecastConfidence;
  confidenceReason: string;
  method: string;
  sourceWindow: string;
  seasonalNote?: string;
};

export type ActionType = 
  | 'reorder'
  | 'campaign'
  | 'win_back'
  | 'payment_issue'
  | 'dead_stock_bundle';

export type ActionPriority = 'High' | 'Medium' | 'Low';

export type ActionStatus = 
  | 'Suggested' 
  | 'Draft' 
  | 'Approved' 
  | 'Simulated Complete' 
  | 'Cancelled' 
  | 'Failed';

export type ActionAuditEntry = {
  timestamp: string;
  action: string;
  actor: string;
  note?: string;
};

export type ActionRecord = {
  id: string;
  type: ActionType;
  title: string;
  explanation: string;
  evidence: string;
  targetSkuId?: string;
  targetSkuName?: string;
  priority: ActionPriority;
  confidence: ForecastConfidence;
  effort: 'Low' | 'Medium' | 'High';
  risk: 'Low' | 'Medium' | 'High';
  expectedBenefit: string;
  status: ActionStatus;
  createdAt: string;
  updatedAt: string;
  draftPayload?: {
    reorderQty?: number;
    supplierName?: string;
    costEstimate?: number;
    discountPct?: number;
    bundlePartnerSkuId?: string;
    bundlePartnerName?: string;
    targetAudience?: string;
    notes?: string;
    failureMessage?: string;
  };
  auditTrail: ActionAuditEntry[];
};

export type SeasonalEvent = {
  id: string;
  name: string;
  dateRange: string;
  applicableCategories: string[];
  impactMultiplier: number;
  note: string;
};

export type StoreProfile = {
  storeName: string;
  ownerName: string;
  merchantId: string;
  category: string;
  location: string;
  currency: 'INR';
  currencySymbol: '₹';
  gstin: string;
  language: 'en' | 'hi' | 'hinglish';
  activeDateRange: 'Last 7 Days' | 'Last 14 Days' | 'Last 30 Days' | 'Last 90 Days';
};
