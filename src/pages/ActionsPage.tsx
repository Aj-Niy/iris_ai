import React, { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight, 
  ShieldCheck, 
  Filter, 
  FileText, 
  History, 
  ChevronRight,
  Play,
  RotateCcw
} from 'lucide-react';
import { ActionRecord, ActionStatus, ActionType } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { useToast } from '../components/common/Toast';

interface ActionsPageProps {
  actions: ActionRecord[];
  onUpdateStatus: (actionId: string, newStatus: ActionStatus, note?: string) => void;
  onOpenActionDetail: (action: ActionRecord) => void;
}

export const ActionsPage: React.FC<ActionsPageProps> = ({
  actions,
  onUpdateStatus,
  onOpenActionDetail,
}) => {
  const { showToast } = useToast();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const pendingActions = actions.filter(
    (a) => a.status === 'Suggested' || a.status === 'Draft'
  );

  const historicalActions = actions.filter(
    (a) => a.status === 'Approved' || a.status === 'Simulated Complete' || a.status === 'Cancelled' || a.status === 'Failed'
  );

  const displayedActions = (activeTab === 'pending' ? pendingActions : historicalActions).filter(
    (a) => filterType === 'ALL' || a.type === filterType
  );

  const handleApprove = (action: ActionRecord) => {
    onUpdateStatus(action.id, 'Approved', 'Approved by merchant. Ready for execution simulation.');
    showToast(`Action Approved: ${action.title}`, 'Moved to approved state.');
  };

  const handleSimulateExecution = (action: ActionRecord) => {
    onUpdateStatus(
      action.id,
      'Simulated Complete',
      'Simulated tool execution verified. Safe test payload delivered without live API calls.'
    );
    showToast(
      'Simulated Complete (Demo)',
      'Action completed in simulation mode. No live messages or money sent.',
      'info'
    );
  };

  const handleCancel = (action: ActionRecord) => {
    onUpdateStatus(action.id, 'Cancelled', 'Dismissed by merchant.');
    showToast(`Action Cancelled: ${action.title}`, 'Action archived.', 'info');
  };

  const handleRetryFailed = (action: ActionRecord) => {
    // Demo retry interaction: simulates re-attempting a failed action
    showToast(
      'Safe Retry Executed',
      'Escalated to carrier DLT portal. Pending template review.',
      'info'
    );
    onUpdateStatus(action.id, 'Draft', 'Retried from failed state. Payload re-opened for editing.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Daily Action Plan
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-200 text-neutral-800">
              Predict → Prioritize → Act
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Prioritized recommendations ready for merchant approval. No automated broadcast or money transfer.
          </p>
        </div>

        {/* Tab Switcher: Pending vs History */}
        <div className="flex items-center p-1 bg-white rounded-xl border border-neutral-200 shadow-subtle self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/60'
            }`}
          >
            <span>Needs Review</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-300">
              {pendingActions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/60'
            }`}
          >
            <span>Action Audit Trail</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 text-neutral-700">
              {historicalActions.length}
            </span>
          </button>
        </div>
      </div>

      {/* Type Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mr-1">
          Filter Type:
        </span>
        {[
          { id: 'ALL', label: 'All Action Types' },
          { id: 'reorder', label: 'Inventory Reorders' },
          { id: 'dead_stock_bundle', label: 'Dead-Stock Bundles' },
          { id: 'payment_issue', label: 'Payment Anomalies' },
          { id: 'campaign', label: 'Customer Outreach' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilterType(item.id)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filterType === item.id
                ? 'bg-neutral-900 text-white'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100/80 shadow-xs'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Action Cards List */}
      <div className="space-y-4">
        {displayedActions.map((action, idx) => {
          const isPending = action.status === 'Suggested' || action.status === 'Draft';
          const isFailed = action.status === 'Failed';
          const isApproved = action.status === 'Approved';

          return (
            <div
              key={action.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/90 shadow-subtle hover:border-neutral-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              {/* Left Details */}
              <div className="flex-1 space-y-3 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                    {action.type.replace('_', ' ')}
                  </span>
                  <StatusBadge status={action.status} />
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      action.priority === 'High'
                        ? 'bg-rose-100 text-rose-700'
                        : action.priority === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {action.priority} Priority
                  </span>
                  <ConfidenceBadge confidence={action.confidence} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-neutral-900 hover:text-neutral-700 cursor-pointer" onClick={() => onOpenActionDetail(action)}>
                    {action.title}
                  </h3>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    {action.explanation}
                  </p>
                </div>

                {/* Grounded Evidence Box */}
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 text-xs text-neutral-700 space-y-1">
                  <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                    <span>Evidence & Signal Basis:</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 pl-3 leading-relaxed">
                    {action.evidence}
                  </p>
                  <div className="text-[11px] text-emerald-700 font-semibold pl-3 pt-0.5">
                    Expected Benefit: {action.expectedBenefit}
                  </div>
                </div>

                {/* Explicit Failure Message if Failed State */}
                {isFailed && action.draftPayload?.failureMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                    <div className="font-bold flex items-center gap-1.5 text-rose-900">
                      <AlertTriangle size={13} />
                      <span>Demonstrated Integration Failure (Honest Tool Reporting):</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed">
                      {action.draftPayload.failureMessage}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Action Controls */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2.5 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-neutral-100">
                <button
                  onClick={() => onOpenActionDetail(action)}
                  className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-colors w-full md:w-40 text-center"
                >
                  View / Edit Draft
                </button>

                {isPending && (
                  <div className="flex items-center gap-2 w-full md:w-40">
                    <button
                      onClick={() => handleApprove(action)}
                      className="flex-1 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 size={13} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleCancel(action)}
                      className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Cancel / Dismiss Action"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                )}

                {isApproved && (
                  <button
                    onClick={() => handleSimulateExecution(action)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs w-full md:w-40 flex items-center justify-center gap-1.5"
                  >
                    <Play size={13} />
                    <span>Simulate Execution</span>
                  </button>
                )}

                {isFailed && (
                  <button
                    onClick={() => handleRetryFailed(action)}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs w-full md:w-40 flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={13} />
                    <span>Retry & Escalate</span>
                  </button>
                )}

                <div className="text-[10px] text-neutral-400 text-right hidden md:block">
                  Effort: {action.effort} • Risk: {action.risk}
                </div>
              </div>
            </div>
          );
        })}

        {displayedActions.length === 0 && (
          <div className="py-12 text-center bg-white rounded-2xl border border-neutral-200">
            <CheckSquare size={32} className="mx-auto text-neutral-300 mb-2" />
            <h4 className="text-sm font-bold text-neutral-900">No actions in this view</h4>
            <p className="text-xs text-neutral-500 mt-1">
              {activeTab === 'pending'
                ? 'All recommended actions have been approved or dismissed.'
                : 'No historical actions recorded yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Safety Policy Guardrail Footer */}
      <div className="p-4 rounded-2xl bg-neutral-100/70 border border-neutral-200 text-xs text-neutral-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
          <span>
            <strong>Merchant Control Guarantee:</strong> No unsolicited messages, no bank movements, and no automatic order placement. Every action remains a draft until merchant review.
          </span>
        </div>
        <span className="text-[11px] text-neutral-400 font-mono">Audit Log Active</span>
      </div>
    </div>
  );
};
