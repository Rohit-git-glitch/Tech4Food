import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRightLeft,
  Eye,
  Refrigerator,
  Snowflake,
  Box,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FoodItem, FoodCategory, StorageLocation, FoodStatus } from '../types';
import { AddEditFoodModal } from '../components/inventory/AddEditFoodModal';
import { MoveLocationModal } from '../components/inventory/MoveLocationModal';
import { FoodDetailModal } from '../components/inventory/FoodDetailModal';
import { DeleteConfirmModal } from '../components/inventory/DeleteConfirmModal';

interface InventoryPageProps {
  onOpenAddModal: () => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ onOpenAddModal }) => {
  const {
    inventory,
    addFoodItem,
    updateFoodItem,
    removeFoodItem,
    moveFoodItem,
    locationBreakdown,
  } = useApp();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<StorageLocation | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<FoodStatus | 'All'>('All');
  const [sortBy, setSortBy] = useState<'expiry' | 'name' | 'dateAdded' | 'quantity'>('expiry');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [movingItem, setMovingItem] = useState<FoodItem | null>(null);
  const [viewingItem, setViewingItem] = useState<FoodItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<FoodItem | null>(null);

  // Filtered and Sorted items
  const filteredItems = useMemo(() => {
    return inventory
      .filter((item) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchNotes = item.notes?.toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchNotes) return false;
        }
        // Location filter
        if (selectedLocation !== 'All' && item.location !== selectedLocation) {
          return false;
        }
        // Category filter
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }
        // Status filter
        if (selectedStatus !== 'All' && item.status !== selectedStatus) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'expiry') {
          return new Date(a.estimatedExpiryDate).getTime() - new Date(b.estimatedExpiryDate).getTime();
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'dateAdded') {
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        }
        if (sortBy === 'quantity') {
          return b.quantity - a.quantity;
        }
        return 0;
      });
  }, [inventory, searchQuery, selectedLocation, selectedCategory, selectedStatus, sortBy]);

  const getStatusBadge = (status: FoodStatus, expiryDate: string) => {
    const now = new Date().getTime();
    const exp = new Date(expiryDate).getTime();
    const days = Math.ceil((exp - now) / 86400000);

    switch (status) {
      case 'Fresh':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Fresh ({days}d)
          </span>
        );
      case 'Approaching Expiry':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            {days <= 0 ? 'Review Soon' : `${days}d left`}
          </span>
        );
      case 'Requires Attention':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Attention
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-900 border border-red-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
            Past Shelf Life
          </span>
        );
    }
  };

  const getLocationIcon = (loc: StorageLocation) => {
    switch (loc) {
      case 'Refrigerator':
        return <Refrigerator className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Freezer':
        return <Snowflake className="w-3.5 h-3.5 text-sky-600" />;
      case 'Pantry/Crisper':
        return <Box className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Location Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedLocation('All')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedLocation === 'All'
                ? 'bg-safegreen text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            All Items ({inventory.length})
          </button>
          <button
            onClick={() => setSelectedLocation('Refrigerator')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedLocation === 'Refrigerator'
                ? 'bg-safegreen text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Refrigerator className="w-4 h-4" />
            <span>Refrigerator ({locationBreakdown.Refrigerator})</span>
          </button>
          <button
            onClick={() => setSelectedLocation('Freezer')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedLocation === 'Freezer'
                ? 'bg-safegreen text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Snowflake className="w-4 h-4" />
            <span>Freezer ({locationBreakdown.Freezer})</span>
          </button>
          <button
            onClick={() => setSelectedLocation('Pantry/Crisper')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedLocation === 'Pantry/Crisper'
                ? 'bg-safegreen text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>Crisper ({locationBreakdown['Pantry/Crisper']})</span>
          </button>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-safegreen hover:bg-safegreen-light text-white font-semibold text-xs sm:text-sm shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Food</span>
        </button>
      </div>

      {/* Search, Filter & View Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by food name, category, or note..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
            >
              <option value="All">All Categories</option>
              <option value="Dairy & Eggs">Dairy & Eggs</option>
              <option value="Meat & Seafood">Meat & Seafood</option>
              <option value="Produce">Produce</option>
              <option value="Leftovers">Leftovers</option>
              <option value="Beverages">Beverages</option>
              <option value="Condiments & Sauces">Condiments</option>
              <option value="Bakery">Bakery</option>
              <option value="Other">Other</option>
            </select>

            {/* Status dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Fresh">Fresh</option>
              <option value="Approaching Expiry">Approaching Expiry</option>
              <option value="Requires Attention">Requires Attention</option>
              <option value="Expired">Past Shelf Life</option>
            </select>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
            >
              <option value="expiry">Sort: Expiry (Soonest)</option>
              <option value="name">Sort: Name (A-Z)</option>
              <option value="dateAdded">Sort: Date Added (Newest)</option>
              <option value="quantity">Sort: Quantity</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-slate-600 transition-colors ${
                  viewMode === 'table' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-slate-600 transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Results Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-700">{filteredItems.length}</strong> of{' '}
            <strong>{inventory.length}</strong> items
          </span>
          {(searchQuery || selectedLocation !== 'All' || selectedCategory !== 'All' || selectedStatus !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLocation('All');
                setSelectedCategory('All');
                setSelectedStatus('All');
              }}
              className="text-emerald-700 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Inventory Display: Table or Cards */}
      {filteredItems.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Food Records Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No items matched your current search filters or category selection. Try clearing filters or add a new food item.
          </p>
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-safegreen text-white font-semibold text-xs hover:bg-safegreen-light transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Food Item</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Item Name & ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Date Added</th>
                  <th className="py-3 px-4">Est. Review Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Name & ID */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 block hover:text-emerald-700 cursor-pointer" onClick={() => setViewingItem(item)}>
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.id}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {item.category}
                    </td>

                    {/* Quantity */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {item.quantity} {item.unit}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {getLocationIcon(item.location)}
                        <span>{item.location}</span>
                      </span>
                    </td>

                    {/* Date Added */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(item.dateAdded).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </td>

                    {/* Estimated Expiry Date */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 text-[11px]">
                        {new Date(item.estimatedExpiryDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        ({item.estimatedShelfLifeDays}d shelf life)
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.status, item.estimatedExpiryDate)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingItem(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="View Details & Storage Guidance"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setMovingItem(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Relocate Item"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setAddModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="Edit Food Record"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingItem(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove from Inventory"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    {item.id}
                  </span>
                  {getStatusBadge(item.status, item.estimatedExpiryDate)}
                </div>

                <h4
                  onClick={() => setViewingItem(item)}
                  className="font-bold text-base text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors"
                >
                  {item.name}
                </h4>

                <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="font-semibold text-slate-700">{item.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Quantity:</span>
                    <span className="font-bold text-slate-900">{item.quantity} {item.unit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                      {getLocationIcon(item.location)}
                      {item.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Review Date:</span>
                    <span className="font-medium text-slate-700">
                      {new Date(item.estimatedExpiryDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {item.notes && (
                  <p className="mt-3 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg italic line-clamp-1">
                    "{item.notes}"
                  </p>
                )}
              </div>

              {/* Card Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setViewingItem(item)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Details &rarr;
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setMovingItem(item)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    title="Relocate"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setAddModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingItem(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AddEditFoodModal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={(data) => {
          if (editingItem) {
            updateFoodItem(editingItem.id, data);
          } else {
            addFoodItem(data);
          }
        }}
        initialItem={editingItem}
      />

      <MoveLocationModal
        item={movingItem}
        isOpen={Boolean(movingItem)}
        onClose={() => setMovingItem(null)}
        onMove={(id, targetLoc) => moveFoodItem(id, targetLoc)}
      />

      <FoodDetailModal
        item={viewingItem}
        isOpen={Boolean(viewingItem)}
        onClose={() => setViewingItem(null)}
        onEdit={(item) => {
          setEditingItem(item);
          setAddModalOpen(true);
        }}
        onMove={(item) => setMovingItem(item)}
        onDelete={(item) => setDeletingItem(item)}
      />

      <DeleteConfirmModal
        item={deletingItem}
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={(id, reason) => removeFoodItem(id, reason)}
      />
    </div>
  );
};
