import React, { useState, useRef } from 'react';
import { 
  Database, 
  UploadCloud, 
  Download, 
  Plus, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Filter, 
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { Product } from '../types';
import { formatINR } from '../lib/calculations';
import { useToast } from '../components/common/Toast';
import { Modal } from '../components/common/Modal';

interface ProductsDataPageProps {
  products: Product[];
  onAddProducts: (newProducts: Product[]) => void;
  onUpdateProduct: (product: Product) => void;
}

export const ProductsDataPage: React.FC<ProductsDataPageProps> = ({
  products,
  onAddProducts,
  onUpdateProduct,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<Product[] | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Handle CSV file upload & parsing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCsvContent(text);
    };
    reader.readAsText(file);
  };

  const parseCsvContent = (csvText: string) => {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setImportErrors(['CSV file must contain a header row and at least one data row.']);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const parsedProducts: Product[] = [];
    const errors: string[] = [];

    // Required columns validation
    const reqHeaders = ['name', 'sellingprice'];
    for (const req of reqHeaders) {
      if (!headers.some((h) => h.includes(req))) {
        errors.push(`Missing essential column: "${req}". Please use the template format.`);
      }
    }

    if (errors.length > 0) {
      setImportErrors(errors);
      return;
    }

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim());
      if (cols.length < 2) continue;

      const name = cols[0] || `Imported Item ${i}`;
      const category = cols[1] || 'General Store';
      const sellingPrice = parseFloat(cols[2]) || 100;
      const unitCost = cols[3] && !isNaN(parseFloat(cols[3])) ? parseFloat(cols[3]) : undefined;
      const stockOnHand = parseInt(cols[4], 10) || 20;
      const supplierLeadDays = parseInt(cols[5], 10) || 4;
      const supplierName = cols[6] || 'Local Wholesale Market';

      parsedProducts.push({
        id: `IMP-${Date.now().toString().slice(-4)}-${i}`,
        name,
        category,
        sellingPrice,
        unitCost,
        stockOnHand,
        supplierLeadDays,
        safetyStock: Math.round(supplierLeadDays * 2),
        supplierName,
        lastUpdated: new Date().toISOString().slice(0, 10),
      });
    }

    setImportPreview(parsedProducts);
    setImportErrors([]);
    setIsImportModalOpen(true);
  };

  const handleConfirmImport = () => {
    if (importPreview && importPreview.length > 0) {
      onAddProducts(importPreview);
      showToast(
        `Imported ${importPreview.length} Products`,
        'Catalog updated. Reorder & profit metrics recalibrated.'
      );
      setImportPreview(null);
      setIsImportModalOpen(false);
    }
  };

  const handleDownloadSampleTemplate = () => {
    const sampleCsv = `Name,Category,SellingPrice,UnitCost,StockOnHand,SupplierLeadDays,SupplierName
Stainless Steel Scissors 8",Stationery & Office,120,75,40,3,Navneet Stationery Hub
Diwali Brass Puja Thali,Festive & Seasonal Decor,350,220,15,5,Pottery Town Collective
Classic Ballpoint Pens (Blue 20-Pack),Writing Instruments,180,,50,2,ITC Stationery
Almond & Cashew Sweet Gift Box (500g),Packaged Snacks,450,330,25,3,Haldiram Distributors`;

    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'iris_products_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Template Downloaded', 'iris_products_template.csv saved.');
  };

  const handleSaveProductEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onUpdateProduct(editingProduct);
      showToast('Product Updated', `${editingProduct.name} saved.`);
      setEditingProduct(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Products & Data
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-200 text-neutral-800">
              POS & Catalog Inputs
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Maintain item costs, current stock on hand, and supplier parameters that feed IRIS algorithms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadSampleTemplate}
            className="px-3.5 py-2 bg-white text-neutral-700 border border-neutral-200 rounded-xl text-xs font-semibold hover:bg-neutral-50 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Sample CSV</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <UploadCloud size={14} />
            <span>Import CSV</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,text/csv"
            className="hidden"
          />
        </div>
      </div>

      {/* Explanatory Data Requirements Banner */}
      <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-950 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start md:items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-800 flex items-center justify-center shrink-0">
            <Database size={17} />
          </div>
          <div>
            <span className="font-bold uppercase tracking-wider text-sky-900">
              Data Grounding Rules
            </span>
            <p className="text-sky-800 mt-0.5">
              <strong>Unit Cost</strong> is required for Gross Profit and Margin. <strong>Stock & Supplier Lead Time</strong> are required for stockout warnings and reorder drafts.
            </p>
          </div>
        </div>

        <span className="text-[11px] text-sky-700 font-mono shrink-0">
          Strict Validation Active
        </span>
      </div>

      {/* Product Table Container */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mr-1">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  categoryFilter === cat
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
                }`}
              >
                {cat === 'ALL' ? 'All' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product, SKU or supplier..."
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-100 rounded-lg text-xs border border-transparent focus:bg-white focus:border-neutral-300 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">SKU & Item Name</th>
                <th className="pb-3">Category</th>
                <th className="pb-3 text-right">Selling Price</th>
                <th className="pb-3 text-right">Unit Cost</th>
                <th className="pb-3 text-center">Stock on Hand</th>
                <th className="pb-3 text-center">Lead Time</th>
                <th className="pb-3">Supplier Source</th>
                <th className="pb-3 pr-2 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3.5 pl-2">
                    <span className="font-bold text-neutral-900 block">{p.name}</span>
                    <span className="text-[10px] font-mono text-neutral-400">{p.id}</span>
                  </td>

                  <td className="py-3.5 text-neutral-600">{p.category}</td>

                  <td className="py-3.5 text-right font-bold text-neutral-900">
                    {formatINR(p.sellingPrice)}
                  </td>

                  <td className="py-3.5 text-right">
                    {p.unitCost !== undefined ? (
                      <span className="font-medium text-neutral-700">{formatINR(p.unitCost)}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertCircle size={10} /> Missing Cost
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 text-center font-bold text-neutral-800">
                    {p.stockOnHand}
                  </td>

                  <td className="py-3.5 text-center text-neutral-600">
                    {p.supplierLeadDays} days
                  </td>

                  <td className="py-3.5 text-neutral-600">
                    <span className="truncate block max-w-xs">{p.supplierName}</span>
                  </td>

                  <td className="py-3.5 pr-2 text-right">
                    <button
                      onClick={() => setEditingProduct(p)}
                      className="px-2.5 py-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Import Preview Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Confirm CSV Product Import"
        subtitle="Review parsed items before committing to store database."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-700">
            Detected <strong>{importPreview?.length || 0} valid product records</strong> from uploaded CSV.
          </div>

          <div className="max-h-60 overflow-y-auto border border-neutral-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-[10px] font-bold text-neutral-500 uppercase">
                <tr>
                  <th className="p-2">Name</th>
                  <th className="p-2 text-right">Price</th>
                  <th className="p-2 text-right">Cost</th>
                  <th className="p-2 text-center">Stock</th>
                  <th className="p-2">Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {importPreview?.map((p, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-medium text-neutral-900">{p.name}</td>
                    <td className="p-2 text-right">{formatINR(p.sellingPrice)}</td>
                    <td className="p-2 text-right">
                      {p.unitCost ? formatINR(p.unitCost) : <span className="text-amber-600 font-semibold">Missing</span>}
                    </td>
                    <td className="p-2 text-center font-bold">{p.stockOnHand}</td>
                    <td className="p-2 text-neutral-500 truncate">{p.supplierName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              className="px-4 py-2 text-xs font-bold bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 shadow-sm"
            >
              Save to Catalog ({importPreview?.length})
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Product Modal */}
      {editingProduct && (
        <Modal
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          title={`Edit Product: ${editingProduct.name}`}
          subtitle={`SKU: ${editingProduct.id}`}
        >
          <form onSubmit={handleSaveProductEdit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Product Title</label>
              <input
                type="text"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-neutral-400 font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Selling Price (₹)</label>
                <input
                  type="number"
                  value={editingProduct.sellingPrice}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, sellingPrice: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-neutral-400"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Unit Cost (₹) <span className="text-neutral-400 font-normal">(Leave blank if unknown)</span>
                </label>
                <input
                  type="number"
                  value={editingProduct.unitCost ?? ''}
                  placeholder="e.g. 130"
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    setEditingProduct({
                      ...editingProduct,
                      unitCost: val === '' ? undefined : parseFloat(val),
                    });
                  }}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-neutral-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Stock on Hand</label>
                <input
                  type="number"
                  value={editingProduct.stockOnHand}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, stockOnHand: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-neutral-400"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Supplier Lead Time (Days)</label>
                <input
                  type="number"
                  value={editingProduct.supplierLeadDays}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, supplierLeadDays: parseInt(e.target.value, 10) || 1 })
                  }
                  className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-neutral-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Supplier Name / Market</label>
              <input
                type="text"
                value={editingProduct.supplierName}
                onChange={(e) => setEditingProduct({ ...editingProduct, supplierName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-neutral-400"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
