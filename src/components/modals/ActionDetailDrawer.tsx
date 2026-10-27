import React, { useState, useEffect } from 'react';
import { ActionRecord, ActionStatus } from '../../types';
import { Drawer } from '../common/Drawer';
import { StatusBadge } from '../common/StatusBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { formatINR } from '../../lib/calculations';
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Play, 
  Clock, 
  ShieldCheck, 
  AlertTriangle,
  History,
  Save
} from 'lucide-react';
import { useToast } from '../common/Toast';

interface ActionDetailDrawerProps {
  action: ActionRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (actionId: string, newStatus: ActionStatus, note?: string) => void;
  onSaveDraftUpdates: (actionId: string, updates: Partial<ActionRecord>, note?: string) => void;
}

export const ActionDetailDrawer: React.FC<ActionDetailDrawerProps> = ({
  action,
  isOpen,
  onClose,
  onUpdateStatus,
  onSaveDraftUpdates,
}) => {
  const { showToast } = useToast();
  const [reorderQty, setReorderQty] = useState<number>(0);
  const [discountPct, setDiscountPct] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('');

  useEffect(() => {
    if (action) {
      setReorderQty(action.draftPayload?.reorderQty || 100);
      setDiscountPct(action.draftPayload?.discountPct || 10);
      setNotes(action.draftPayload?.notes || '');
      setTargetAudience(action.draftPayload?.targetAudience || '');
    }
  }, [action]);

  if (!action) return null;

  const isPending = action.status === 'Suggested' || action.status === 'Draft';
  const isApproved = action.status === 'Approved';
  const isFailed = action.status === 'Failed';

  const handleSaveEdits = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDraftUpdates(
      action.id,
      {
        draftPayload: {
          ...action.draftPayload,
          reorderQty: action.type === 'reorder' ? reorderQty : undefined,
          discountPct: action.type === 'dead_stock_bundle' ? discountPct : undefined,
          notes,
          targetAudience,
        },
      },
      'Merchant adjusted draft parameters'
    );
    showToast('Draft Updated', 'Changes saved to local action store.');
  };

  const handleApprove = () => {
    onUpdateStatus(action.id, 'Approved', 'Merchant approved action draft.');
    showToast('Action Approved', `${action.title} marked ready for execution simulation.`);
    onClose();
  };

  const handleSimulate = () => {
    onUpdateStatus(
      action.id,
      'Simulated Complete',
      'Simulated execution verified. No live API calls or money transfers.'
    );
    showToast(
      'Simulated Complete (Demo)',
      'Verified with simulated response. Zero actual funds or messages moved.',
      'info'
    );
    onClose();
  };

  const handleCancel = () => {
    onUpdateStatus(action.id, 'Cancelled', 'Merchant cancelled / dismissed this action.');
    showToast('Action Dismissed', `${action.title} marked as cancelled.`);
    onClose();
  };

  const handleRetry = () => {
    onUpdateStatus(
      action.id,
      'Draft',
      'Retried failed action. Escalated payload re-opened as draft.'
    );
    showToast('Safe Retry Triggered', 'Action re-opened for editing and re-submission.');
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={action.title}
      subtitle={`Action ID: ${action.id} • ${action.type.replace('_', ' ').toUpperCase()}`}
      width="lg"
    >
      <div className="space-y-6 text-xs text-neutral-800">
        {/* Status & Priority Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
          <div className="flex items-center gap-2">
            <StatusBadge status={action.status} />
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                action.priority === 'High'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {action.priority} Priority
            </span>
          </div>

          <ConfidenceBadge confidence={action.confidence} />
        </div>

        {/* Why it Matters & Expected Benefit */}
        <div className="space-y-2">
          <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider text-neutral-400">
            Why It Matters (Merchant Rationale)
          </h4>
          <p className="p-3 bg-white rounded-xl border border-neutral-200 leading-relaxed">
            {action.explanation}
          </p>
        </div>

        {/* Evidence & Signal Foundation */}
        <div className="space-y-2">
          <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider text-neutral-400">
            Grounded Evidence & Data Window
          </h4>
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <p className="leading-relaxed text-neutral-700">{action.evidence}</p>
            <div className="pt-2 border-t border-neutral-200 text-emerald-800 font-semibold">
              Projected Benefit: {action.expectedBenefit}
            </div>
            <div className="flex items-center gap-4 text-[11px] text-neutral-500 pt-1">
              <span>Effort Required: <strong>{action.effort}</strong></span>
              <span>Reversibility / Risk: <strong>{action.risk}</strong></span>
            </div>
          </div>
        </div>

        {/* Demonstrable Failure Notification */}
        {isFailed && action.draftPayload?.failureMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <AlertTriangle size={15} />
              <span>Demonstration Failure Notice</span>
            </div>
            <p className="text-rose-800 leading-relaxed">
              {action.draftPayload.failureMessage}
            </p>
            <div className="text-[10px] text-rose-700 font-mono">
              Integrations report real errors rather than faking success.
            </div>
          </div>
        )}

        {/* Editable Draft Payload Parameters */}
        <form onSubmit={handleSaveEdits} className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider text-neutral-400">
              Draft Parameters
            </h4>
            {isPending && (
              <button
                type="submit"
                className="text-xs font-bold text-neutral-800 hover:text-neutral-950 flex items-center gap-1 underline underline-offset-2"
              >
                <Save size={12} />
                <span>Save Draft Changes</span>
              </button>
            )}
          </div>

          {action.type === 'reorder' && (
            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Approved Restock Quantity (Units)
              </label>
              <input
                type="number"
                min="1"
                disabled={!isPending}
                value={reorderQty}
                onChange={(e) => setReorderQty(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 font-bold focus:outline-none focus:border-neutral-400 disabled:bg-neutral-100"
              />
            </div>
          )}

          {action.type === 'dead_stock_bundle' && (
            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                Bundle Promotional Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                disabled={!isPending}
                value={discountPct}
                onChange={(e) => setDiscountPct(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 font-bold focus:outline-none focus:border-neutral-400 disabled:bg-neutral-100"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Preserves notebook margin floor (min 36% blended margin)
              </span>
            </div>
          )}

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Merchant Notes</label>
            <textarea
              rows={3}
              disabled={!isPending}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-neutral-400 disabled:bg-neutral-100"
            />
          </div>
        </form>

        {/* Audit Trail & History Log */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2">
            <History size={14} className="text-neutral-500" />
            <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider text-neutral-400">
              Action Audit Trail ({action.auditTrail.length} Events)
            </h4>
          </div>

          <div className="space-y-2 divide-y divide-neutral-100 border border-neutral-200 rounded-xl p-3 bg-neutral-50/50">
            {action.auditTrail.map((log, idx) => (
              <div key={idx} className="pt-2 first:pt-0">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-neutral-800">{log.action}</span>
                  <span className="text-neutral-400 font-mono text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-0.5">
                  <span>Actor: {log.actor}</span>
                  {log.note && <span className="italic truncate max-w-xs">{log.note}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Decision Buttons */}
        <div className="pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-end gap-3">
          {isPending && (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl text-neutral-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
              >
                Dismiss Action
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                <span>Approve Action</span>
              </button>
            </>
          )}

          {isApproved && (
            <button
              type="button"
              onClick={handleSimulate}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Play size={14} />
              <span>Simulate Tool Execution</span>
            </button>
          )}

          {isFailed && (
            <button
              type="button"
              onClick={handleRetry}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Retry / Re-Open Draft</span>
            </button>
          )}
        </div>
      </div>
    </Drawer>
  );
};
