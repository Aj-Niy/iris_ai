import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { Modal } from '../common/Modal';
import { formatINR, calculateSuggestedReorder } from '../../lib/calculations';
import { PAST_14_DAYS_PRODUCT_SALES } from '../../data/demoData';
import { AlertTriangle, Truck, ShieldCheck, Check } from 'lucide-react';

interface ReorderModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveDraft: (params: {
    productId: string;
    productName: string;
    reorderQty: number;
    supplierName: string;
    costEstimate: number;
    notes: string;
  }) => void;
}

export const ReorderModal: React.FC<ReorderModalProps> = ({
  product,
  isOpen,
  onClose,
  onSaveDraft,
}) => {
  const [reorderQty, setReorderQty] = useState<number>(0);
  const [supplierName, setSupplierName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (product) {
      const pastSales = PAST_14_DAYS_PRODUCT_SALES[product.id] || { unitsSold: 0, revenue: 0 };
      const avgDailySales = Math.max(0.2, pastSales.unitsSold / 14);
      const { suggestedQty } = calculateSuggestedReorder({
        leadTimeDays: product.supplierLeadDays,
        avgDailySales,
        safetyStock: product.safetyStock,
        stockOnHand: product.stockOnHand,
        moq: product.moq,
      });

      // Special match for illustrative scenario: fairy lights 130 units
      const initialQty = product.id === 'SKU-DL-01' ? 130 : suggestedQty > 0 ? suggestedQty : 50;
      setReorderQty(initialQty);
      setSupplierName(product.supplierName);
      setNotes(
        product.id === 'SKU-DL-01'
          ? 'Urgent festival stock replenishment. Deliver before Friday morning rush.'
          : 'Standard store replenishment order.'
      );
    }
  }, [product]);

  if (!product) return null;

  const unitCost = product.unitCost || 0;
  const costEstimate = reorderQty * unitCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDraft({
      productId: product.id,
      productName: product.name,
      reorderQty,
      supplierName,
      costEstimate,
      notes,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review Reorder: ${product.name}`}
      subtitle="Examine algorithm assumptions and edit draft before saving."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Assumptions Context Box */}
        <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
          <div className="flex items-center justify-between text-neutral-600 font-medium">
            <span>Current Stock on Hand:</span>
            <span className="font-bold text-neutral-900">{product.stockOnHand} units</span>
          </div>
          <div className="flex items-center justify-between text-neutral-600 font-medium">
            <span>Supplier Replenishment Lead Time:</span>
            <span className="font-bold text-neutral-900">{product.supplierLeadDays} days</span>
          </div>
          <div className="flex items-center justify-between text-neutral-600 font-medium">
            <span>Safety Stock Reserve:</span>
            <span className="font-bold text-neutral-900">{product.safetyStock} units</span>
          </div>
          {product.moq && (
            <div className="flex items-center justify-between text-neutral-600 font-medium">
              <span>Supplier Minimum Order Qty (MOQ):</span>
              <span className="font-bold text-neutral-900">{product.moq} units</span>
            </div>
          )}
        </div>

        {/* Editable Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-neutral-700 mb-1">
              Reorder Quantity (Units)
            </label>
            <input
              type="number"
              min="1"
              value={reorderQty}
              onChange={(e) => setReorderQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 font-bold text-sm focus:outline-none focus:border-neutral-400"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">
              Estimated Purchase Cost
            </label>
            <div className="p-2.5 rounded-xl bg-neutral-100 border border-neutral-200 font-bold text-neutral-900 text-sm">
              {unitCost > 0 ? formatINR(costEstimate) : 'Unit cost unrecorded'}
            </div>
            {unitCost > 0 && (
              <span className="text-[10px] text-neutral-400 mt-1 block">
                {reorderQty} units × {formatINR(unitCost)} unit cost
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block font-bold text-neutral-700 mb-1">Assigned Supplier</label>
          <input
            type="text"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-neutral-400 font-medium"
            required
          />
        </div>

        <div>
          <label className="block font-bold text-neutral-700 mb-1">
            Dispatch Instructions / Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-neutral-400"
          />
        </div>

        {/* Safety Disclaimer */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-900 flex items-center gap-2">
          <ShieldCheck size={16} className="text-amber-700 shrink-0" />
          <span>
            <strong>Demo Safety:</strong> Saving creates a local draft in your Daily Action Plan. It does not send a live order or initiate money movement.
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 shadow-sm"
          >
            Save Reorder Draft
          </button>
        </div>
      </form>
    </Modal>
  );
};
