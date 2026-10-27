import React, { useState } from 'react';
import { 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowUpRight, 
  ShieldCheck, 
  Search, 
  Filter, 
  Plus, 
  ExternalLink 
} from 'lucide-react';
import { PaymentTransaction, ActionRecord } from '../types';
import { formatINR, formatNumber } from '../lib/calculations';
import { PAYMENT_HEALTH_SUMMARY, RECENT_PAYMENT_TRANSACTIONS } from '../data/demoData';
import { PaymentTrendChart } from '../components/charts/PaymentTrendChart';
import { KpiCard } from '../components/common/KpiCard';
import { useToast } from '../components/common/Toast';

interface PaymentsPageProps {
  onCreateSupportTask: () => void;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({ onCreateSupportTask }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredTransactions = RECENT_PAYMENT_TRANSACTIONS.filter((txn) => {
    const matchesSearch =
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (txn.customerName && txn.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      txn.method.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || txn.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateTask = () => {
    onCreateSupportTask();
    showToast('Support Task Created', 'Routed to Daily Action Plan for cashier guidance.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Payment Health
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-200 text-neutral-800">
              Paytm Soundbox & Settlement Analytics
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Monitor QR and terminal collection performance, network timeouts, and bank failure rates.
          </p>
        </div>

        <button
          onClick={handleCreateTask}
          className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Create Payment Support Task</span>
        </button>
      </div>

      {/* Anomaly Spike Warning Banner */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-950">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Payment Collection Anomaly
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded">
                High Failure Rate Spike
              </span>
            </div>
            <h4 className="text-sm font-bold text-neutral-900 mt-0.5">
              {PAYMENT_HEALTH_SUMMARY.recentAnomaly.title}
            </h4>
            <p className="text-xs text-neutral-600 mt-1 max-w-2xl leading-relaxed">
              {PAYMENT_HEALTH_SUMMARY.recentAnomaly.description}
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateTask}
          className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors shadow-xs shrink-0 self-end sm:self-auto"
        >
          {PAYMENT_HEALTH_SUMMARY.recentAnomaly.recommendedActionTitle}
        </button>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="30-Day Gross Collection"
          value={formatINR(PAYMENT_HEALTH_SUMMARY.totalVolume)}
          subtitle="Net Paytm QR, RuPay Card & Wallet collections"
          badge={{ text: 'Settled', variant: 'positive' }}
          icon={CreditCard}
        />

        <KpiCard
          title="Success Rate"
          value={`${PAYMENT_HEALTH_SUMMARY.successRate}%`}
          subtitle="Target >= 95% collection reliability"
          badge={{ text: 'Dip on Oct 26', variant: 'warning' }}
          icon={CheckCircle2}
        />

        <KpiCard
          title="Failed Transactions"
          value={PAYMENT_HEALTH_SUMMARY.failedTransactions}
          subtitle="Customer bank downtime accounts for 62.2%"
          badge={{ text: '98 total', variant: 'negative' }}
          icon={XCircle}
        />

        <KpiCard
          title="Avg Transaction Ticket"
          value={formatINR(PAYMENT_HEALTH_SUMMARY.avgTicketSize, true)}
          subtitle="Kirana neighborhood benchmark: ₹100–₹200"
          badge={{ text: 'Healthy', variant: 'neutral' }}
          icon={Clock}
        />
      </div>

      {/* 30-Day Payment Trend Chart */}
      <PaymentTrendChart data={PAYMENT_HEALTH_SUMMARY.trend30Days} />

      {/* Failure Reasons Breakdown & Data Boundary Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Failure Reasons Box */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-subtle flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-neutral-900">Failure Diagnostics (30 Days)</h4>
            <p className="text-xs text-neutral-500 mt-0.5">Top reasons recorded by gateway</p>

            <div className="mt-4 space-y-3">
              {PAYMENT_HEALTH_SUMMARY.failureReasons.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-800">{item.reason}</span>
                    <span className="font-bold text-neutral-900">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-rose-500' : 'bg-neutral-400'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-400">
            Source: Aggregated gateway error payloads (U19, U69, MPIN).
          </div>
        </div>

        {/* Data Separation Boundary Notice */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
              <ShieldCheck size={18} className="text-sky-600" />
              <h4 className="text-sm font-bold text-neutral-900">
                Data Boundary: Payments vs SKU Sales
              </h4>
            </div>

            <div className="mt-4 space-y-3 text-xs text-neutral-600 leading-relaxed">
              <p>
                <strong>What Payment Signals Provide:</strong> Total settlement amounts, transaction timestamps, payment channels (Paytm QR, RuPay POS, UPI, Wallet), and failure codes.
              </p>
              <p>
                <strong>What Payment Signals CANNOT Provide:</strong> Individual SKU item quantities, product names, item purchase costs, or physical stock on hand.
              </p>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-700">
                <strong>Why this distinction matters:</strong> A surge in failed payments signals counter friction or bank outages, but it does NOT indicate that an item was out of stock. SKU-level demand and inventory reorders must be derived from POS/catalog sales records, not payment settlements alone.
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-400">
            Compliant with Paytm Merchant Growth AI Architecture Specifications.
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mr-1">
              Status:
            </span>
            {['ALL', 'Completed', 'Failed', 'Pending'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference, customer, or mode..."
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-100 rounded-lg text-xs border border-transparent focus:bg-white focus:border-neutral-300 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">Transaction ID & Time</th>
                <th className="pb-3">Customer Reference</th>
                <th className="pb-3">Payment Method</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 pr-2 text-left">Gateway Diagnostics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 pl-2">
                    <span className="font-bold text-neutral-900 block font-mono">{txn.id}</span>
                    <span className="text-[10px] text-neutral-400">{txn.timestamp}</span>
                  </td>

                  <td className="py-3 text-neutral-700">
                    <span className="font-medium block">{txn.customerName || 'Counter Customer'}</span>
                    <span className="text-[10px] font-mono text-neutral-400">{txn.reference}</span>
                  </td>

                  <td className="py-3 text-neutral-800 font-medium">
                    {txn.method}
                  </td>

                  <td className="py-3 text-right font-bold text-neutral-900">
                    {formatINR(txn.amount)}
                  </td>

                  <td className="py-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        txn.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : txn.status === 'Failed'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>

                  <td className="py-3 pr-2 text-neutral-500">
                    {txn.failureReason ? (
                      <span className="text-rose-700 font-medium text-[11px]">
                        {txn.failureReason}
                      </span>
                    ) : (
                      <span className="text-neutral-400 text-[11px]">Settled via Paytm Soundbox</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
