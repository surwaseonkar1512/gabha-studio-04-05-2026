import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { CreditCard, Plus, Pencil, Trash2, Move, X, RefreshCw, Search, Filter, Check } from 'lucide-react';
import api from '../../api/axiosInstance';
import ImageUpload from '../../components/cms/ImageUpload';
import ConfirmModal from '../../components/ui/ConfirmModal';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  title: string;
  slug: string;
}

interface Product {
  _id: string;
  productImage: string;
  name: string;
  price: number;
  category: Category;
  shortDescription?: string;
  tag?: string;
  showOnHomepage: boolean;
  isActive: boolean;
  displayOrder: number;
}

const ProductModule = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterHomepage, setFilterHomepage] = useState('');

  // Form states
  const [productImage, setProductImage] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [tag, setTag] = useState('');
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/cms/categories');
      setCategories(data.filter((c: any) => c.isActive));
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory) params.append('category', filterCategory);
      if (filterHomepage) params.append('showOnHomepage', filterHomepage);

      const { data } = await api.get(`/cms/products?${params.toString()}`);
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterCategory, filterHomepage]);

  const openAddModal = () => {
    setEditingProduct(null);
    setProductImage('');
    setName('');
    setPrice('');
    setCategoryId(categories[0]?._id || '');
    setShortDescription('');
    setTag('');
    setShowOnHomepage(false);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setProductImage(product.productImage);
    setName(product.name);
    setPrice(product.price);
    setCategoryId(product.category._id);
    setShortDescription(product.shortDescription || '');
    setTag(product.tag || '');
    setShowOnHomepage(product.showOnHomepage);
    setIsActive(product.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productImage) {
      toast.error('Product image is required');
      return;
    }
    if (!name) {
      toast.error('Product name is required');
      return;
    }
    if (price === '' || price < 0) {
      toast.error('Valid price is required');
      return;
    }
    if (!categoryId) {
      toast.error('Category is required');
      return;
    }

    setSaving(true);
    const payload = {
      productImage,
      name,
      price: Number(price),
      category: categoryId,
      shortDescription: shortDescription || undefined,
      tag: tag || undefined,
      showOnHomepage,
      isActive,
      displayOrder: editingProduct ? editingProduct.displayOrder : products.length
    };

    try {
      if (editingProduct) {
        await api.put(`/cms/products/${editingProduct._id}`, payload);
        toast.success('Product updated successfully');
      } else {
        await api.post('/cms/products', payload);
        toast.success('Product created successfully');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteProductId) return;
    try {
      await api.delete(`/cms/products/${deleteProductId}`);
      toast.success('Product deleted successfully');
      setDeleteProductId(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, idx) => ({
      ...item,
      displayOrder: idx
    }));
    setProducts(updatedItems);

    try {
      const orders = updatedItems.map(item => ({ id: item._id, displayOrder: item.displayOrder }));
      await api.put('/cms/products/reorder', { orders });
      toast.success('Product order saved');
    } catch (error) {
      toast.error('Failed to save product order');
      fetchProducts();
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const { data } = await api.put(`/cms/products/${product._id}`, { isActive: !product.isActive });
      setProducts(prev => prev.map(p => p._id === product._id ? data : p));
      toast.success(`Product is now ${!product.isActive ? 'Active' : 'Inactive'}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-rose-500" /> Products Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Build and expand the art catalogs. Modify names, tags, prices, homepage featured visibility, and display orders.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-lg shadow-sm hover:shadow-md transition-all self-start sm:self-auto"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filter and search toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-lg text-xs"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-lg text-xs appearance-none cursor-pointer text-zinc-600 dark:text-zinc-300"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <select
            value={filterHomepage}
            onChange={(e) => setFilterHomepage(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-lg text-xs appearance-none cursor-pointer text-zinc-600 dark:text-zinc-300"
          >
            <option value="">Featured Status (All)</option>
            <option value="true">Featured on Homepage</option>
            <option value="false">Standard Catalog Only</option>
          </select>
        </div>
      </div>

      {/* Products list */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="h-8 w-8 text-rose-500 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-12 text-center text-zinc-400">
          <CreditCard className="h-12 w-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
          <p className="font-semibold text-sm">No products found</p>
          <p className="text-xs text-zinc-400 mt-1">Try resetting filter options or create a new sculpture product.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
            <span>Catalog Items (Drag to Sort Display Order)</span>
            <span>Total found: {products.length}</span>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="products">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="divide-y divide-zinc-200 dark:divide-zinc-800"
                >
                  {products.map((product, index) => (
                    <Draggable key={product._id} draggableId={product._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex flex-col sm:flex-row sm:items-center p-4 gap-4 transition-colors ${snapshot.isDragging
                            ? 'bg-zinc-50 dark:bg-zinc-800/80 shadow-md'
                            : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20'
                            }`}
                        >
                          {/* Drag handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-grab active:cursor-grabbing self-center sm:self-auto shrink-0 p-1"
                          >
                            <Move size={18} />
                          </div>

                          {/* Image preview */}
                          <div className="h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0 self-center sm:self-auto">
                            <img src={product.productImage} alt={product.name} className="w-full h-full object-cover" />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">{product.name}</h3>
                              {product.tag && (
                                <span className="text-[10px] bg-rose-500/10 text-rose-500 font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                                  {product.tag}
                                </span>
                              )}
                              {product.showOnHomepage && (
                                <span className="text-[10px] bg-amber-500/10 text-amber-500 font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                                  Featured Home
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-500">${product.price.toLocaleString()}</span>
                              <span className="text-zinc-300 dark:text-zinc-700">•</span>
                              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold">{product.category?.title}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-end gap-3 self-end sm:self-auto shrink-0">
                            <button
                              onClick={() => handleToggleActive(product)}
                              className={`text-xs px-2.5 py-1.5 rounded-full font-bold uppercase tracking-wider transition-colors border ${product.isActive
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-500'
                                : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
                                }`}
                            >
                              {product.isActive ? 'Active' : 'Inactive'}
                            </button>

                            <div className="flex items-center gap-1 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5">
                              <button
                                onClick={() => openEditModal(product)}
                                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
                                title="Edit product details"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => setDeleteProductId(product._id)}
                                className="p-1.5 hover:bg-red-500/10 rounded text-red-500 hover:text-red-600 transition-colors"
                                title="Delete product"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col custom-scrollbar">
            <header className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingProduct ? 'Edit Catalog Product' : 'Create Catalog Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
              <ImageUpload
                label="Product Thumbnail Photo *"
                value={productImage}
                onChange={setProductImage}
                placeholder="Upload display product portrait (aspect 1:1 or 4:3)"
                aspectRatio="aspect-video"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Venus Statue"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Selling Price ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 24900"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Assigned Category *
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm appearance-none cursor-pointer text-zinc-700 dark:text-zinc-300"
                  >
                    <option value="" disabled>Select category...</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Promo Tag / Ribbon (Optional)
                  </label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="e.g. New, Bestseller, 15% OFF"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                <label className="flex items-center gap-3 select-none cursor-pointer border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-950">
                  <input
                    type="checkbox"
                    checked={showOnHomepage}
                    onChange={(e) => setShowOnHomepage(e.target.checked)}
                    className="rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-gray-700 dark:text-zinc-300 block">Showcase on Homepage</span>
                    <span className="text-[10px] text-zinc-400">Featured collection block display toggle.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 select-none cursor-pointer border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-950">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-gray-700 dark:text-zinc-300 block">Set Active Status</span>
                    <span className="text-[10px] text-zinc-400">Uncheck to hide product from the web storefront.</span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Provide physical dimensions, weight, stone specification, and artist credits..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm resize-none"
                />
              </div>

              <footer className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-zinc-900 pb-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-zinc-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 text-sm font-bold rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-75"
                >
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check size={16} />}
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={deleteProductId !== null}
        onClose={() => setDeleteProductId(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to permanently delete this product from the inventory catalog? This action is destructive and cannot be undone."
        confirmText="Delete Product"
        type="danger"
      />
    </div>
  );
};

export default ProductModule;
