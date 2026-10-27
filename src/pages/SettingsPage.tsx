import React, { useState } from 'react';
import { 
  Settings, 
  RotateCcw, 
  Store, 
  ShieldCheck, 
  AlertTriangle, 
  Globe, 
  DollarSign, 
  Info, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';
import { StoreProfile } from '../types';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';

interface SettingsPageProps {
  profile: StoreProfile;
  onUpdateProfile: (profile: StoreProfile) => void;
  onResetAllData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  profile,
  onUpdateProfile,
  onResetAllData,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<StoreProfile>(profile);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    showToast('Store Profile Updated', 'Merchant details saved.');
  };

  const handleConfirmReset = () => {
    onResetAllData();
    setIsResetModalOpen(false);
    showToast(
      'Demo Data Reset to Factory State',
      'Initial fixtures restored. All local drafts cleared.',
      'info'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Settings & Preferences
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-200 text-neutral-800">
              Merchant Context
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Store metadata, regional currency parameters, language preview, and demonstration reset.
          </p>
        </div>

        <button
          onClick={() => setIsResetModalOpen(true)}
          className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <RotateCcw size={14} />
          <span>Reset Demo Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Store Profile */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-subtle">
          <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
            <Store size={18} className="text-neutral-700" />
            <h3 className="text-sm font-bold text-neutral-900">Merchant Store Profile</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="mt-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Store Legal Name</label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-neutral-400 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Primary Owner / Operator</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-neutral-400 font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Paytm Merchant ID <span className="text-neutral-400 font-normal">(Read-only)</span>
                </label>
                <input
                  type="text"
                  value={formData.merchantId}
                  disabled
                  className="w-full p-2.5 rounded-xl border border-neutral-200 bg-neutral-100 font-mono text-neutral-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">GSTIN</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 font-mono focus:outline-none focus:border-neutral-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Physical Store Address</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-neutral-400 font-medium"
              />
            </div>

            {/* Currency Context */}
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-neutral-900 block">Currency Standard</span>
                <span className="text-[11px] text-neutral-500">
                  Indian Rupee (INR - ₹) with Indian numbering conventions (Lakhs / Crores).
                </span>
              </div>
              <span className="font-bold text-xs bg-neutral-200 text-neutral-800 px-2.5 py-1 rounded-lg">
                INR (₹) Fixed
              </span>
            </div>

            {/* Language Selection */}
            <div>
              <label className="block font-bold text-neutral-700 mb-1.5 flex items-center justify-between">
                <span>Display Language</span>
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Hindi & Hinglish (UI Preview)
                </span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'en', label: 'English (Current)', ready: true },
                  { id: 'hinglish', label: 'Hinglish (Preview)', ready: false },
                  { id: 'hi', label: 'हिंदी (Preview)', ready: false },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, language: lang.id as any });
                      if (!lang.ready) {
                        showToast(
                          'Language Preview Mode',
                          'Voice & localized Hinglish prompts enabled in assistant layer.',
                          'info'
                        );
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-colors ${
                      formData.language === lang.id
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors shadow-sm"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>

        {/* Right Card: Limitations & Trust Boundaries */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
              <ShieldCheck size={18} className="text-emerald-700" />
              <h3 className="text-sm font-bold text-neutral-900">Demonstration Guardrails</h3>
            </div>

            <ul className="space-y-2.5 text-xs text-neutral-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>100% Deterministic:</strong> Forecasts and gross margin metrics come from fixed fixtures and exact formulas, never LLM hallucinations.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Merchant Stays in Control:</strong> Reorders, clearance bundles, and campaigns remain local drafts until explicit merchant approval.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>No Ghost Actions:</strong> No actual Paytm API calls, no unsolicited customer messaging, no money movements, and no supplier orders are placed.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Local Persistence:</strong> Edits to action states, drafts, and products survive browser page refreshes via localStorage.
                </span>
              </li>
            </ul>
          </div>

          {/* Reset Card */}
          <div className="bg-rose-50/60 rounded-2xl p-5 border border-rose-200/80 text-rose-950 space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs text-rose-800">
              <AlertTriangle size={15} />
              <span>Reset Demo State</span>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed">
              Want to start the demo walk-through from scratch? Clearing local state restores initial decorative lights, notebook sales, and action fixtures.
            </p>
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              Reset to Initial Demo State
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Confirm Demo Data Reset"
        subtitle="This action will restore all default test fixtures."
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs text-neutral-600">
          <p>
            Are you sure you want to reset demo data? All local edits, draft changes, and newly imported products will be removed, and factory defaults will be restored.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReset}
              className="px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 shadow-sm"
            >
              Confirm Reset
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
