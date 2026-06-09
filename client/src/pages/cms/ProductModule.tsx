import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  CreditCard, Plus, Pencil, Trash2, Move, X, RefreshCw, Search, Filter, Check,
  Copy, PlusCircle, Eye, Archive, TrendingUp, Star, ArrowUp, ArrowDown, Layers,
  Settings, AlertTriangle, Image as ImageIcon, Sparkles, BookOpen, ListPlus,
  Bookmark, BarChart2, CheckSquare, Square, ShoppingBag, AlertCircle
} from 'lucide-react';
import api from '../../api/axiosInstance';
import ImageUpload from '../../components/cms/ImageUpload';
import ConfirmModal from '../../components/ui/ConfirmModal';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  title: string;
  slug: string;
}

interface Review {
  _id: string;
  product: {
    _id: string;
    name: string;
    productImage: string;
  };
  rating: number;
  reviewText: string;
  customerName: string;
  images: Array<{ secure_url: string; public_id?: string }>;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

interface VariantOption {
  name: string;
  values: string[];
}

interface VariantCombination {
  combination: { [key: string]: string };
  sku: string;
  price: number;
  mrp: number;
  stock: number;
  weight: number;
  images: string[];
}

interface DescriptionBlock {
  id: string;
  type: string;
  data: any;
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
  slug: string;
  sku: string;
  barcode?: string;
  brand?: string;
  status: 'Draft' | 'Published' | 'Archived' | 'Out Of Stock';
  pricing?: {
    costPrice: number;
    sellingPrice: number;
    mrp: number;
    discountPercentage: number;
    discountAmount: number;
  };
  tax?: {
    gstPercentage: number;
    hsnCode: string;
  };
  images?: {
    featuredImage?: { secure_url: string };
    thumbnailImage?: { secure_url: string };
    gallery?: Array<{ secure_url: string }>;
  };
  variants?: {
    options: VariantOption[];
    combinations: VariantCombination[];
  };
  inventory?: {
    currentStock: number;
    availableStock: number;
    reservedStock: number;
    soldStock: number;
    lowStockThreshold: number;
  };
  tags?: string[];
  descriptionBuilder?: DescriptionBlock[];
  specifications?: {
    material?: string;
    weight?: string;
    dimensions?: { width: number; height: number; length: number };
    color?: string;
    manufacturer?: string;
    countryOfOrigin?: string;
    warranty?: string;
    expiryDate?: string;
    custom?: Array<{ [key: string]: string }>;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
    canonicalUrl?: string;
  };
}

const ProductModule = () => {
  // Main Navigation Tabs
  const [activeTab, setActiveTab] = useState<'catalog' | 'reviews' | 'analytics'>('catalog');

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterHomepage, setFilterHomepage] = useState('');

  // Form states & overlay toggle
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formTab, setFormTab] = useState<'basic' | 'pricing' | 'gallery' | 'variants' | 'specs' | 'builder' | 'seo'>('basic');

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [productStatus, setProductStatus] = useState<'Draft' | 'Published' | 'Archived' | 'Out Of Stock'>('Draft');
  const [shortDescription, setShortDescription] = useState('');

  // Pricing & Inventory
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [mrp, setMrp] = useState<number | ''>('');
  const [gstPercentage, setGstPercentage] = useState(18);
  const [hsnCode, setHsnCode] = useState('');

  const [currentStock, setCurrentStock] = useState<number>(0);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);

  // Images
  const [featuredImage, setFeaturedImage] = useState('');
  const [thumbnailImage, setThumbnailImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Variants options & combos
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
  const [combinations, setCombinations] = useState<VariantCombination[]>([]);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionValues, setNewOptionValues] = useState('');

  // Specifications
  const [material, setMaterial] = useState('');
  const [weight, setWeight] = useState('');
  const [dimWidth, setDimWidth] = useState<number | ''>('');
  const [dimHeight, setDimHeight] = useState<number | ''>('');
  const [dimLength, setDimLength] = useState<number | ''>('');
  const [color, setColor] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [warranty, setWarranty] = useState('');
  const [customSpecs, setCustomSpecs] = useState<Array<{ key: string; value: string }>>([]);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // Description Builder
  const [builderBlocks, setBuilderBlocks] = useState<DescriptionBlock[]>([]);

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  // Product Tags Array
  const [tagsInput, setTagsInput] = useState('');
  const [showOnHomepage, setShowOnHomepage] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewFilter, setReviewFilter] = useState('');
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<{
    topViewed: any[];
    bestSellers: any[];
    lowStock: any[];
  } | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Modals / Deletes
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [bulkActionType, setBulkActionType] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/cms/categories');
      setCategories(data.filter((c: any) => c.status === 'Active' || c.isActive));
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory) params.append('category', filterCategory);
      if (filterStatus) params.append('status', filterStatus);
      if (filterHomepage) params.append('showOnHomepage', filterHomepage);

      const { data } = await api.get(`/cms/products?${params.toString()}`);
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const url = reviewFilter ? `/cms/reviews?status=${reviewFilter}` : '/cms/reviews';
      const { data } = await api.get(url);
      setReviews(data);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const { data } = await api.get('/cms/products/analytics');
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'catalog') {
      const delayDebounceFn = setTimeout(() => {
        fetchProducts();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else if (activeTab === 'reviews') {
      fetchReviews();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [searchTerm, filterCategory, filterStatus, filterHomepage, activeTab, reviewFilter]);

  const handleTitleChange = (val: string) => {
    setName(val);
    if (!editingProduct) {
      setSlug(val.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''));
    }
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setName('');
    setSlug('');
    setSku(`SKU-${Date.now()}`);
    setBarcode('');
    setBrand('Gabha Studio');
    setCategoryId(categories[0]?._id || '');
    setProductStatus('Draft');
    setShortDescription('');
    setCostPrice('');
    setSellingPrice('');
    setMrp('');
    setGstPercentage(18);
    setHsnCode('');
    setCurrentStock(10);
    setLowStockThreshold(3);
    setFeaturedImage('');
    setThumbnailImage('');
    setGalleryImages([]);
    setVariantOptions([]);
    setCombinations([]);
    setMaterial('Stone');
    setWeight('');
    setDimWidth('');
    setDimHeight('');
    setDimLength('');
    setColor('');
    setManufacturer('Gabha Studio');
    setCountryOfOrigin('India');
    setWarranty('No Warranty');
    setCustomSpecs([]);
    setBuilderBlocks([]);
    setSeoTitle('');
    setSeoDescription('');
    setSeoKeywords('');
    setCanonicalUrl('');
    setTagsInput('Stone, Statue, Handcrafted');
    setShowOnHomepage(false);

    setFormTab('basic');
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setSlug(product.slug || '');
    setSku(product.sku || '');
    setBarcode(product.barcode || '');
    setBrand(product.brand || '');
    setCategoryId(product.category._id || (product.category as any));
    setProductStatus(product.status || 'Draft');
    setShortDescription(product.shortDescription || '');

    // Pricing
    setCostPrice(product.pricing?.costPrice || '');
    setSellingPrice(product.pricing?.sellingPrice || product.price || '');
    setMrp(product.pricing?.mrp || '');
    setGstPercentage(product.tax?.gstPercentage || 18);
    setHsnCode(product.tax?.hsnCode || '');

    // Stock
    setCurrentStock(product.inventory?.currentStock || 0);
    setLowStockThreshold(product.inventory?.lowStockThreshold || 5);

    // Images
    const feat = product.images?.featuredImage?.secure_url || product.productImage || '';
    setFeaturedImage(feat);
    setThumbnailImage(product.images?.thumbnailImage?.secure_url || feat);
    setGalleryImages(product.images?.gallery?.map(g => g.secure_url) || []);

    // Variants
    setVariantOptions(product.variants?.options || []);
    setCombinations(product.variants?.combinations || []);

    // Specifications
    setMaterial(product.specifications?.material || '');
    setWeight(product.specifications?.weight || '');
    setDimWidth(product.specifications?.dimensions?.width || '');
    setDimHeight(product.specifications?.dimensions?.height || '');
    setDimLength(product.specifications?.dimensions?.length || '');
    setColor(product.specifications?.color || '');
    setManufacturer(product.specifications?.manufacturer || '');
    setCountryOfOrigin(product.specifications?.countryOfOrigin || '');
    setWarranty(product.specifications?.warranty || '');

    // Custom Specs mapping
    if (product.specifications?.custom) {
      const mapped = product.specifications.custom.map((obj: any) => {
        const key = Object.keys(obj)[0] || '';
        return { key, value: obj[key] || '' };
      }).filter(o => o.key);
      setCustomSpecs(mapped);
    } else {
      setCustomSpecs([]);
    }

    // Builder blocks
    setBuilderBlocks(product.descriptionBuilder || []);

    // SEO
    setSeoTitle(product.seo?.metaTitle || '');
    setSeoDescription(product.seo?.metaDescription || '');
    setSeoKeywords(product.seo?.keywords || '');
    setCanonicalUrl(product.seo?.canonicalUrl || '');

    // Badges/Tags
    setTagsInput(product.tags?.join(', ') || product.tag || '');
    setShowOnHomepage(product.showOnHomepage);

    setFormTab('basic');
    setIsFormOpen(true);
  };

  const handleDuplicate = async (product: Product) => {
    try {
      await api.post(`/cms/products/${product._id}/duplicate`);
      toast.success('Product duplicated as Draft copy');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to duplicate product');
    }
  };

  const handleCheckboxSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p._id));
    }
  };

  const handleBulkAction = async () => {
    if (selectedIds.length === 0 || !bulkActionType) return;
    try {
      setLoading(true);
      await api.put('/cms/products/bulk', {
        ids: selectedIds,
        action: bulkActionType,
        value: bulkActionType === 'updateTags' ? ['Best Seller', 'New Arrival'] : undefined
      });
      toast.success(`Bulk action [${bulkActionType}] completed`);
      setSelectedIds([]);
      setBulkActionType(null);
      fetchProducts();
    } catch (error) {
      toast.error('Bulk action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return toast.error('Product name is required');
    if (!sellingPrice) return toast.error('Selling price is required');
    if (!categoryId) return toast.error('Category is required');
    if (!featuredImage) return toast.error('Featured image is required');

    setSaving(true);

    // Parse tags
    const tagsArr = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload = {
      name,
      slug,
      sku,
      barcode: barcode || undefined,
      brand: brand || undefined,
      category: categoryId,
      status: productStatus,
      shortDescription,
      tag: tagsArr[0] || '', // Legacy support
      showOnHomepage,
      isActive: productStatus === 'Published',
      price: Number(sellingPrice), // Legacy support
      productImage: featuredImage, // Legacy support
      pricing: {
        costPrice: costPrice !== '' ? Number(costPrice) : 0,
        sellingPrice: Number(sellingPrice),
        mrp: mrp !== '' ? Number(mrp) : Number(sellingPrice)
      },
      tax: {
        gstPercentage: Number(gstPercentage),
        hsnCode
      },
      images: {
        featuredImage: { secure_url: featuredImage, public_id: '' },
        thumbnailImage: { secure_url: thumbnailImage || featuredImage, public_id: '' },
        gallery: galleryImages.map(img => ({ secure_url: img, public_id: '' }))
      },
      variants: {
        options: variantOptions,
        combinations: combinations
      },
      inventory: {
        currentStock: Number(currentStock),
        availableStock: Number(currentStock), // Default same
        reservedStock: 0,
        soldStock: 0,
        lowStockThreshold: Number(lowStockThreshold)
      },
      tags: tagsArr,
      descriptionBuilder: builderBlocks,
      specifications: {
        material,
        weight,
        dimensions: {
          width: dimWidth !== '' ? Number(dimWidth) : 0,
          height: dimHeight !== '' ? Number(dimHeight) : 0,
          length: dimLength !== '' ? Number(dimLength) : 0
        },
        color,
        manufacturer,
        countryOfOrigin,
        warranty,
        custom: customSpecs.map(s => ({ [s.key]: s.value }))
      },
      seo: {
        metaTitle: seoTitle || name,
        metaDescription: seoDescription || shortDescription,
        keywords: seoKeywords,
        canonicalUrl
      },
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
      setIsFormOpen(false);
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

  // Variant Option Helpers
  const addVariantOption = () => {
    if (!newOptionName || !newOptionValues) return toast.error('Both option title and values are required');
    const valuesArr = newOptionValues.split(',').map(v => v.trim()).filter(v => v.length > 0);
    if (valuesArr.length === 0) return toast.error('Provide comma-separated values');

    const updatedOptions = [...variantOptions, { name: newOptionName, values: valuesArr }];
    setVariantOptions(updatedOptions);
    setNewOptionName('');
    setNewOptionValues('');

    // Regenerate combinations
    regenerateCombinations(updatedOptions);
  };

  const removeVariantOption = (idx: number) => {
    const updated = variantOptions.filter((_, i) => i !== idx);
    setVariantOptions(updated);
    regenerateCombinations(updated);
  };

  const regenerateCombinations = (opts: VariantOption[]) => {
    if (opts.length === 0) {
      setCombinations([]);
      return;
    }

    // Helper to generate cartesian product
    const cartesian = (arrays: string[][]) => {
      return arrays.reduce<string[][]>((acc, val) => {
        return acc.flatMap(d => val.map(e => [...d, e]));
      }, [[]]);
    };

    const arrays = opts.map(o => o.values);
    const results = cartesian(arrays);

    const combos: VariantCombination[] = results.map(res => {
      const comboObj: { [key: string]: string } = {};
      opts.forEach((o, i) => {
        comboObj[o.name] = res[i];
      });

      // Match existing combination if possible to retain inventory data
      const existing = combinations.find(c => {
        return Object.keys(comboObj).every(k => c.combination[k] === comboObj[k]);
      });

      return existing || {
        combination: comboObj,
        sku: `${sku}-${res.join('-')}`,
        price: Number(sellingPrice) || 0,
        mrp: Number(mrp) || Number(sellingPrice) || 0,
        stock: 10,
        weight: 0,
        images: []
      };
    });

    setCombinations(combos);
  };

  const handleUpdateCombinationField = (index: number, field: keyof VariantCombination, value: any) => {
    setCombinations(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  // Specifications helpers
  const addCustomSpec = () => {
    if (!newSpecKey || !newSpecValue) return toast.error('Enter specification title and detail');
    setCustomSpecs(prev => [...prev, { key: newSpecKey, value: newSpecValue }]);
    setNewSpecKey('');
    setNewSpecValue('');
  };

  const removeCustomSpec = (idx: number) => {
    setCustomSpecs(prev => prev.filter((_, i) => i !== idx));
  };

  // Description Builder Helpers
  const addBuilderBlock = (type: string) => {
    const id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    let blockData = {};
    if (type === 'text' || type === 'richText') {
      blockData = { title: 'Heading', text: 'Write content here...' };
    } else if (type === 'image') {
      blockData = { secure_url: '', caption: 'Description' };
    } else if (type === 'video') {
      blockData = { videoUrl: '', caption: 'YouTube Video Embed' };
    } else if (type === 'faq') {
      blockData = { list: [{ question: 'FAQ Question', answer: 'FAQ Answer' }] };
    } else if (type === 'specifications') {
      blockData = { rows: [{ label: 'Specification Name', value: 'Details value' }] };
    } else {
      blockData = { content: '' };
    }

    setBuilderBlocks(prev => [...prev, { id, type, data: blockData }]);
  };

  const removeBuilderBlock = (id: string) => {
    setBuilderBlocks(prev => prev.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === builderBlocks.length - 1) return;

    const list = [...builderBlocks];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);
    setBuilderBlocks(list);
  };

  const updateBlockData = (id: string, field: string, value: any) => {
    setBuilderBlocks(prev => prev.map(b => b.id === id ? { ...b, data: { ...b.data, [field]: value } } : b));
  };

  // Reviews Helpers
  const handleReviewAction = async (id: string, nextStatus: 'Approved' | 'Rejected') => {
    try {
      await api.put(`/cms/reviews/${id}/status`, { status: nextStatus });
      toast.success(`Review ${nextStatus}`);
      fetchReviews();
    } catch (error) {
      toast.error('Failed to update review status');
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await api.delete(`/cms/reviews/${id}`);
      toast.success('Review deleted');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="space-y-8">
      {/* Tab bar Navigation */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => { setActiveTab('catalog'); setIsFormOpen(false); }}
          className={`flex items-center gap-2 py-4 px-6 font-bold text-sm border-b-2 transition-all ${activeTab === 'catalog' && !isFormOpen
            ? 'border-rose-500 text-rose-600 dark:text-rose-500'
            : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
        >
          <CreditCard size={16} /> Catalog Products
        </button>
        <button
          onClick={() => { setActiveTab('reviews'); setIsFormOpen(false); }}
          className={`flex items-center gap-2 py-4 px-6 font-bold text-sm border-b-2 transition-all ${activeTab === 'reviews'
            ? 'border-rose-500 text-rose-600 dark:text-rose-500'
            : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
        >
          <Star size={16} /> Product Reviews
        </button>
        <button
          onClick={() => { setActiveTab('analytics'); setIsFormOpen(false); }}
          className={`flex items-center gap-2 py-4 px-6 font-bold text-sm border-b-2 transition-all ${activeTab === 'analytics'
            ? 'border-rose-500 text-rose-600 dark:text-rose-500'
            : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
        >
          <BarChart2 size={16} /> Product Analytics
        </button>
      </div>

      {/* 1. PRODUCT FORM VIEWS */}
      {isFormOpen ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom duration-300">
          <header className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {editingProduct ? `Edit: ${name}` : 'Create New Product'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Configure pricing, dynamic layout sections, SEO meta, and variants.</p>
            </div>
            <button
              onClick={() => setIsFormOpen(false)}
              className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
            >
              <X size={16} />
            </button>
          </header>

          {/* Form Tabs */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto scrollbar-hide">
            {[
              { id: 'basic', label: 'Basic Details', icon: <BookOpen size={14} /> },
              { id: 'pricing', label: 'Pricing & Stock', icon: <ShoppingBag size={14} /> },
              { id: 'gallery', label: 'Gallery', icon: <ImageIcon size={14} /> },
              { id: 'variants', label: 'Variants matrix', icon: <Layers size={14} /> },
              { id: 'specs', label: 'Specifications', icon: <Settings size={14} /> },
              { id: 'builder', label: 'Description Builder', icon: <Sparkles size={14} /> },
              { id: 'seo', label: 'SEO tags', icon: <Sparkles size={14} /> }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFormTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-3 px-5 font-bold text-xs border-b-2 transition-all whitespace-nowrap ${formTab === tab.id
                  ? 'border-rose-500 text-rose-600 dark:text-rose-500 bg-rose-500/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700'
                  }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSaveProduct} className="p-6 space-y-6">
            {/* Form tab pages */}
            {formTab === 'basic' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. Venus De Milo Statue"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Slug (URL Path) *</label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. venus-de-milo-statue"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">SKU (Unique Code) *</label>
                    <input
                      type="text"
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Barcode / UPC (Optional)</label>
                    <input
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="e.g. 890123456789"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Brand / Collection *</label>
                    <input
                      type="text"
                      required
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Category *</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm"
                    >
                      {categories.map(c => (
                        <option key={c._id} value={c._id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Publish Status</label>
                    <select
                      value={productStatus}
                      onChange={(e) => setProductStatus(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Archived">Archived</option>
                      <option value="Out Of Stock">Out Of Stock</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Storefront Tags (Comma Separated)</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="e.g. New Arrival, Best Seller, Hot Product"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                  <label className="flex items-center gap-3 select-none cursor-pointer border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl bg-gray-50 dark:bg-zinc-950">
                    <input
                      type="checkbox"
                      checked={showOnHomepage}
                      onChange={(e) => setShowOnHomepage(e.target.checked)}
                      className="rounded border-zinc-300 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <span className="text-sm font-bold text-gray-700 dark:text-zinc-300 block font-sans">Featured on Homepage</span>
                      <span className="text-[10px] text-zinc-400">Pin product in Home showcase collection carousel</span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Teaser Short Description</label>
                  <textarea
                    rows={3}
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Describe main art design, material feel, size and style..."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm resize-none"
                  />
                </div>
              </div>
            )}

            {formTab === 'pricing' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Cost Price ($)</label>
                    <input
                      type="number"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 500"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Selling Price ($) *</label>
                    <input
                      type="number"
                      required
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 750"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">MRP / Original Price ($)</label>
                    <input
                      type="number"
                      value={mrp}
                      onChange={(e) => setMrp(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 1000"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">GST Rate (%)</label>
                    <select
                      value={gstPercentage}
                      onChange={(e) => setGstPercentage(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm"
                    >
                      <option value={0}>0% (Exempt)</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18% (Standard)</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">HSN Code (Tax Category)</label>
                    <input
                      type="text"
                      value={hsnCode}
                      onChange={(e) => setHsnCode(e.target.value)}
                      placeholder="e.g. 6802"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Current Inventory Stock</label>
                    <input
                      type="number"
                      value={currentStock}
                      onChange={(e) => setCurrentStock(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Low-Stock Notification Alert Threshold</label>
                    <input
                      type="number"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {formTab === 'gallery' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ImageUpload
                    label="Primary Featured Image Cover *"
                    value={featuredImage}
                    onChange={setFeaturedImage}
                    placeholder="Featured card graphic"
                    aspectRatio="aspect-square"
                  />
                  <ImageUpload
                    label="Thumbnail Image Cover (Option)"
                    value={thumbnailImage}
                    onChange={setThumbnailImage}
                    placeholder="Small list item preview thumbnail"
                    aspectRatio="aspect-square"
                  />
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
                  <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
                    <ImageIcon size={16} /> Gallery Images (Up to 20+ images)
                  </h3>

                  {/* Upload new gallery photo */}
                  <div className="mb-4 max-w-sm">
                    <ImageUpload
                      label="Add Gallery Photo"
                      value=""
                      onChange={(url) => {
                        if (url) {
                          setGalleryImages(prev => [...prev, url]);
                          toast.success('Gallery image added');
                        }
                      }}
                      placeholder="Upload portfolio shot"
                      aspectRatio="aspect-video"
                    />
                  </div>

                  {/* Gallery Grid */}
                  {galleryImages.length === 0 ? (
                    <div className="border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl p-8 text-center text-xs text-zinc-400">
                      No gallery photos added yet. Upload multiple shots to display dynamic slides.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {galleryImages.map((img, index) => (
                        <div key={index} className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 aspect-square">
                          <img src={img} alt="Gallery slot" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                            <button
                              type="button"
                              onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== index))}
                              className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                              title="Delete photo"
                            >
                              <Trash2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                // Simple swap order: move left
                                if (index > 0) {
                                  const arr = [...galleryImages];
                                  const temp = arr[index];
                                  arr[index] = arr[index - 1];
                                  arr[index - 1] = temp;
                                  setGalleryImages(arr);
                                }
                              }}
                              className="p-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                              title="Move Left"
                            >
                              <ArrowUp size={14} className="-rotate-90" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {formTab === 'variants' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
                    <Layers size={16} /> 1. Define Variant Options
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-1">Option Title</label>
                      <input
                        type="text"
                        value={newOptionName}
                        onChange={(e) => setNewOptionName(e.target.value)}
                        placeholder="e.g. Color, Size, Material"
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-1">Comma-separated Values</label>
                      <input
                        type="text"
                        value={newOptionValues}
                        onChange={(e) => setNewOptionValues(e.target.value)}
                        placeholder="e.g. Small, Medium, Large"
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-lg text-xs"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={addVariantOption}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors"
                      >
                        <Plus size={14} /> Add Option
                      </button>
                    </div>
                  </div>

                  {variantOptions.length > 0 && (
                    <div className="space-y-2">
                      {variantOptions.map((opt, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                          <div>
                            <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{opt.name}:</span>
                            <span className="ml-2 text-xs text-zinc-500">{opt.values.join(', ')}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVariantOption(index)}
                            className="p-1 hover:bg-red-500/10 text-red-500 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {combinations.length > 0 && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
                      <ListPlus size={16} /> 2. Configure Combinations Prices & Stock
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                            <th className="py-2.5">Variant Combination</th>
                            <th className="py-2.5">SKU Code</th>
                            <th className="py-2.5">Selling Price ($)</th>
                            <th className="py-2.5">MRP ($)</th>
                            <th className="py-2.5">Stock</th>
                            <th className="py-2.5">Weight (kg)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                          {combinations.map((combo, index) => {
                            const label = Object.entries(combo.combination)
                              .map(([k, v]) => `${k}:${v}`)
                              .join(' / ');

                            return (
                              <tr key={index} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10">
                                <td className="py-3 font-semibold text-zinc-800 dark:text-zinc-200">{label}</td>
                                <td className="py-2 pr-2">
                                  <input
                                    type="text"
                                    value={combo.sku}
                                    onChange={(e) => handleUpdateCombinationField(index, 'sku', e.target.value)}
                                    className="px-2 py-1 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none text-xs w-36"
                                  />
                                </td>
                                <td className="py-2 pr-2">
                                  <input
                                    type="number"
                                    value={combo.price}
                                    onChange={(e) => handleUpdateCombinationField(index, 'price', Number(e.target.value))}
                                    className="px-2 py-1 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none text-xs w-20"
                                  />
                                </td>
                                <td className="py-2 pr-2">
                                  <input
                                    type="number"
                                    value={combo.mrp}
                                    onChange={(e) => handleUpdateCombinationField(index, 'mrp', Number(e.target.value))}
                                    className="px-2 py-1 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none text-xs w-20"
                                  />
                                </td>
                                <td className="py-2 pr-2">
                                  <input
                                    type="number"
                                    value={combo.stock}
                                    onChange={(e) => handleUpdateCombinationField(index, 'stock', Number(e.target.value))}
                                    className="px-2 py-1 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none text-xs w-16"
                                  />
                                </td>
                                <td className="py-2">
                                  <input
                                    type="number"
                                    value={combo.weight}
                                    onChange={(e) => handleUpdateCombinationField(index, 'weight', Number(e.target.value))}
                                    className="px-2 py-1 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none text-xs w-16"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {formTab === 'specs' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Material</label>
                    <input
                      type="text"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      placeholder="e.g. Carrara Marble"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Product Weight (kg)</label>
                    <input
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g. 15 kg"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Color Option</label>
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="e.g. Pearl White"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5 font-sans">Width (inches)</label>
                    <input
                      type="number"
                      value={dimWidth}
                      onChange={(e) => setDimWidth(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5 font-sans">Height (inches)</label>
                    <input
                      type="number"
                      value={dimHeight}
                      onChange={(e) => setDimHeight(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5 font-sans">Length (inches)</label>
                    <input
                      type="number"
                      value={dimLength}
                      onChange={(e) => setDimLength(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Manufacturer</label>
                    <input
                      type="text"
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Country of Origin</label>
                    <input
                      type="text"
                      value={countryOfOrigin}
                      onChange={(e) => setCountryOfOrigin(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Warranty Info</label>
                    <input
                      type="text"
                      value={warranty}
                      onChange={(e) => setWarranty(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
                  <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
                    <PlusCircle size={16} /> Custom Specifications Table
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <input
                      type="text"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      placeholder="Title: e.g. Finish Type"
                      className="px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      placeholder="Detail: e.g. Polished Matte"
                      className="px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={addCustomSpec}
                      className="flex items-center justify-center gap-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-lg transition-colors"
                    >
                      <Plus size={14} /> Add Row
                    </button>
                  </div>

                  {customSpecs.length > 0 && (
                    <div className="max-w-md divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden text-xs">
                      {customSpecs.map((spec, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-zinc-50/50 dark:bg-zinc-950/20">
                          <div>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 pr-2">{spec.key}:</span>
                            <span className="text-zinc-500">{spec.value}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCustomSpec(index)}
                            className="p-1 hover:bg-red-500/10 text-red-500 rounded"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {formTab === 'builder' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mr-2">Insert Block:</span>
                  {[
                    { type: 'text', label: 'Simple Text', icon: <BookOpen size={12} /> },
                    { type: 'richText', label: 'Rich Paragraph', icon: <ListPlus size={12} /> },
                    { type: 'image', label: 'Single Photo', icon: <ImageIcon size={12} /> },
                    { type: 'video', label: 'Video Embed', icon: <Eye size={12} /> },
                    { type: 'faq', label: 'FAQ Accordion', icon: <Bookmark size={12} /> },
                    { type: 'specifications', label: 'Spec Table', icon: <Settings size={12} /> }
                  ].map(btn => (
                    <button
                      key={btn.type}
                      type="button"
                      onClick={() => addBuilderBlock(btn.type)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-rose-500 hover:text-rose-500 rounded-lg text-xs font-semibold shadow-sm transition-all"
                    >
                      {btn.icon} {btn.label}
                    </button>
                  ))}
                </div>

                {builderBlocks.length === 0 ? (
                  <div className="border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl p-12 text-center text-zinc-400 text-xs">
                    No layout blocks configured. Use the selector above to construct dynamic product description page panels.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {builderBlocks.map((block, index) => (
                      <div key={block.id} className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm overflow-hidden flex flex-col sm:flex-row">
                        {/* Control actions */}
                        <div className="bg-zinc-50 dark:bg-zinc-950 border-b sm:border-b-0 sm:border-r border-zinc-200 dark:border-zinc-800 p-3 flex sm:flex-col items-center justify-between sm:justify-start gap-2 shrink-0">
                          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest sm:rotate-90 sm:my-4">{block.type}</span>
                          <div className="flex sm:flex-col items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => moveBlock(index, 'up')}
                              disabled={index === 0}
                              className="p-1.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg hover:text-rose-500 disabled:opacity-50"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveBlock(index, 'down')}
                              disabled={index === builderBlocks.length - 1}
                              className="p-1.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg hover:text-rose-500 disabled:opacity-50"
                            >
                              <ArrowDown size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeBuilderBlock(block.id)}
                              className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg"
                              title="Delete Block"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Block input fields */}
                        <div className="p-4 flex-1 space-y-4">
                          {(block.type === 'text' || block.type === 'richText') && (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={block.data.title || ''}
                                onChange={(e) => updateBlockData(block.id, 'title', e.target.value)}
                                placeholder="Block Section Heading"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold"
                              />
                              <textarea
                                rows={3}
                                value={block.data.text || ''}
                                onChange={(e) => updateBlockData(block.id, 'text', e.target.value)}
                                placeholder="Paragraph body content..."
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs resize-none"
                              />
                            </div>
                          )}

                          {block.type === 'image' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <ImageUpload
                                label="Block Photograph"
                                value={block.data.secure_url || ''}
                                onChange={(url) => updateBlockData(block.id, 'secure_url', url)}
                                placeholder="Upload layout asset"
                                aspectRatio="aspect-video"
                              />
                              <div className="flex flex-col justify-end">
                                <label className="block text-xs font-bold text-zinc-500 mb-1">Caption / Subtitle</label>
                                <input
                                  type="text"
                                  value={block.data.caption || ''}
                                  onChange={(e) => updateBlockData(block.id, 'caption', e.target.value)}
                                  placeholder="e.g. Master Artisan Detailing"
                                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs"
                                />
                              </div>
                            </div>
                          )}

                          {block.type === 'video' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">YouTube URL</label>
                                <input
                                  type="text"
                                  value={block.data.videoUrl || ''}
                                  onChange={(e) => updateBlockData(block.id, 'videoUrl', e.target.value)}
                                  placeholder="e.g. https://www.youtube.com/watch?v=..."
                                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">Caption / Title</label>
                                <input
                                  type="text"
                                  value={block.data.caption || ''}
                                  onChange={(e) => updateBlockData(block.id, 'caption', e.target.value)}
                                  placeholder="e.g. Craftsmanship Walkthrough Video"
                                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs"
                                />
                              </div>
                            </div>
                          )}

                          {block.type === 'faq' && (
                            <div className="space-y-3">
                              <span className="text-xs font-bold text-zinc-600 block">FAQ Accordions:</span>
                              <div className="space-y-2">
                                {(block.data.list || []).map((faq: any, fIdx: number) => (
                                  <div key={fIdx} className="flex gap-2 items-start bg-zinc-50 dark:bg-zinc-950/20 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                    <div className="flex-1 space-y-1.5">
                                      <input
                                        type="text"
                                        value={faq.question}
                                        onChange={(e) => {
                                          const newList = [...block.data.list];
                                          newList[fIdx].question = e.target.value;
                                          updateBlockData(block.id, 'list', newList);
                                        }}
                                        placeholder="FAQ Question"
                                        className="w-full px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs font-bold"
                                      />
                                      <input
                                        type="text"
                                        value={faq.answer}
                                        onChange={(e) => {
                                          const newList = [...block.data.list];
                                          newList[fIdx].answer = e.target.value;
                                          updateBlockData(block.id, 'list', newList);
                                        }}
                                        placeholder="FAQ Answer Detail"
                                        className="w-full px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newList = block.data.list.filter((_: any, i: number) => i !== fIdx);
                                        updateBlockData(block.id, 'list', newList);
                                      }}
                                      className="text-red-500 hover:bg-red-500/10 p-1 rounded"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newList = [...(block.data.list || []), { question: 'New Question', answer: 'New Answer' }];
                                  updateBlockData(block.id, 'list', newList);
                                }}
                                className="flex items-center gap-1 py-1.5 px-3 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-lg hover:text-rose-500"
                              >
                                <Plus size={12} /> Add FAQ row
                              </button>
                            </div>
                          )}

                          {block.type === 'specifications' && (
                            <div className="space-y-3">
                              <span className="text-xs font-bold text-zinc-600 block">Specification Table Rows:</span>
                              <div className="space-y-2">
                                {(block.data.rows || []).map((row: any, rIdx: number) => (
                                  <div key={rIdx} className="flex gap-2 items-center bg-zinc-50 dark:bg-zinc-950/20 p-2 rounded-xl">
                                    <input
                                      type="text"
                                      value={row.label}
                                      onChange={(e) => {
                                        const newRows = [...block.data.rows];
                                        newRows[rIdx].label = e.target.value;
                                        updateBlockData(block.id, 'rows', newRows);
                                      }}
                                      placeholder="Property Name (e.g. Density)"
                                      className="flex-1 px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs font-bold"
                                    />
                                    <input
                                      type="text"
                                      value={row.value}
                                      onChange={(e) => {
                                        const newRows = [...block.data.rows];
                                        newRows[rIdx].value = e.target.value;
                                        updateBlockData(block.id, 'rows', newRows);
                                      }}
                                      placeholder="Value detail"
                                      className="flex-1 px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newRows = block.data.rows.filter((_: any, i: number) => i !== rIdx);
                                        updateBlockData(block.id, 'rows', newRows);
                                      }}
                                      className="text-red-500 p-1"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newRows = [...(block.data.rows || []), { label: 'Property', value: 'Detail' }];
                                  updateBlockData(block.id, 'rows', newRows);
                                }}
                                className="flex items-center gap-1 py-1.5 px-3 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-lg hover:text-rose-500"
                              >
                                <Plus size={12} /> Add Spec row
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {formTab === 'seo' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Meta Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="e.g. Venus De Milo Handcrafted Marble Statue | Gabha Studio"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Meta Description</label>
                  <textarea
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Provide keywords-rich synopsis for search engine index cards..."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Meta Keywords</label>
                    <input
                      type="text"
                      value={seoKeywords}
                      onChange={(e) => setSeoKeywords(e.target.value)}
                      placeholder="e.g. marble, venus statue, museum art"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5 font-sans">Canonical URL</label>
                    <input
                      type="text"
                      value={canonicalUrl}
                      onChange={(e) => setCanonicalUrl(e.target.value)}
                      placeholder="e.g. https://gabhastudio.com/shop/venus-statue"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            <footer className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-4 -mx-6 -mb-6">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-5 py-2.5 border border-zinc-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 text-sm font-bold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
      ) : (
        /* Tab page router */
        <div>
          {/* CATALOG TAB VIEW */}
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-rose-500" /> Products Management
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                    Expand eCommerce catalog items. Configure variants combinations, drag order and manage bulk publishing.
                  </p>
                </div>

                <button
                  onClick={openAddForm}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-lg shadow-sm hover:shadow-md transition-all self-start sm:self-auto"
                >
                  <Plus size={16} /> Add Product
                </button>
              </div>

              {/* Filters & bulk bar */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search name, SKU, brand..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-lg text-xs"
                    />
                  </div>

                  <div className="relative">
                    <Filter className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-lg text-xs text-zinc-600 dark:text-zinc-300 appearance-none cursor-pointer"
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
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-lg text-xs text-zinc-600 dark:text-zinc-300 appearance-none cursor-pointer"
                    >
                      <option value="">All Statuses</option>
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Archived">Archived</option>
                      <option value="Out Of Stock">Out Of Stock</option>
                    </select>
                  </div>

                  <div className="relative">
                    <Filter className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <select
                      value={filterHomepage}
                      onChange={(e) => setFilterHomepage(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-rose-500 rounded-lg text-xs text-zinc-600 dark:text-zinc-300 appearance-none cursor-pointer"
                    >
                      <option value="">Featured Status (All)</option>
                      <option value="true">Featured on Homepage</option>
                      <option value="false">Standard Catalog Only</option>
                    </select>
                  </div>
                </div>

                {/* Bulk Actions Bar */}
                {selectedIds.length > 0 && (
                  <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top-4 duration-200">
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertCircle size={14} /> Selected {selectedIds.length} items
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={bulkActionType || ''}
                        onChange={(e) => setBulkActionType(e.target.value)}
                        className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs"
                      >
                        <option value="">Select Bulk Action...</option>
                        <option value="publish">Publish Selected</option>
                        <option value="archive">Archive Selected</option>
                        <option value="delete">Delete Selected</option>
                      </select>
                      <button
                        onClick={handleBulkAction}
                        disabled={!bulkActionType}
                        className="px-4 py-1.5 bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold rounded-lg disabled:opacity-50"
                      >
                        Execute Action
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Products list grid */}
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
                    <div className="flex items-center gap-3">
                      <button onClick={handleSelectAll} className="text-zinc-500">
                        {selectedIds.length === products.length ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                      <span>Catalog Items (Drag to Sort Display Order)</span>
                    </div>
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
                          {products.map((product, index) => {
                            const imgUrl = product.images?.featuredImage?.secure_url || product.productImage || '';
                            const priceVal = product.pricing?.sellingPrice || product.price || 0;
                            const isLowStock = (product.inventory?.availableStock || 0) <= (product.inventory?.lowStockThreshold || 5);

                            return (
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
                                    {/* Selection checkbox */}
                                    <button
                                      onClick={() => handleCheckboxSelect(product._id)}
                                      className="text-zinc-400 self-center sm:self-auto shrink-0"
                                    >
                                      {selectedIds.includes(product._id) ? <CheckSquare size={16} className="text-rose-500" /> : <Square size={16} />}
                                    </button>

                                    {/* Drag handle */}
                                    <div
                                      {...provided.dragHandleProps}
                                      className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-grab active:cursor-grabbing self-center sm:self-auto shrink-0 p-1"
                                    >
                                      <Move size={18} />
                                    </div>

                                    {/* Image preview */}
                                    <div className="h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0 self-center sm:self-auto">
                                      <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">{product.name}</h3>
                                        {product.tags?.slice(0, 2).map((t, i) => (
                                          <span key={i} className="text-[9px] bg-rose-500/10 text-rose-500 font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                                            {t}
                                          </span>
                                        ))}
                                        {product.showOnHomepage && (
                                          <span className="text-[9px] bg-amber-500/10 text-amber-500 font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                                            Featured Home
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-500">${priceVal.toLocaleString()}</span>
                                        <span>•</span>
                                        <span className="font-semibold">{product.category?.title}</span>
                                        <span>•</span>
                                        <span className="font-mono">SKU: {product.sku}</span>
                                        {isLowStock && (
                                          <>
                                            <span>•</span>
                                            <span className="text-rose-500 font-bold flex items-center gap-0.5">
                                              <AlertTriangle size={10} /> Low Stock ({product.inventory?.availableStock || 0})
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-3 self-end sm:self-auto shrink-0">
                                      <span
                                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${product.status === 'Published'
                                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-500'
                                          : product.status === 'Draft'
                                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-500'
                                            : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
                                          }`}
                                      >
                                        {product.status || 'Draft'}
                                      </span>

                                      <div className="flex items-center gap-1 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5">
                                        <button
                                          onClick={() => openEditForm(product)}
                                          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
                                          title="Edit details"
                                        >
                                          <Pencil size={14} />
                                        </button>
                                        <button
                                          onClick={() => handleDuplicate(product)}
                                          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
                                          title="Duplicate Product"
                                        >
                                          <Copy size={14} />
                                        </button>
                                        <button
                                          onClick={() => setDeleteProductId(product._id)}
                                          className="p-1.5 hover:bg-red-500/10 rounded text-red-500 hover:text-red-600 transition-colors"
                                          title="Delete product"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              )}
            </div>
          )}

          {/* REVIEWS TAB VIEW */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Star className="h-6 w-6 text-amber-500" /> Customer Reviews Panel
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Approve, reject or delete customer testimonials and star ratings.</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Filter size={14} className="text-zinc-400" />
                  <select
                    value={reviewFilter}
                    onChange={(e) => setReviewFilter(e.target.value)}
                    className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs"
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {loadingReviews ? (
                <div className="flex items-center justify-center h-48">
                  <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-12 text-center text-zinc-400">
                  <Star className="h-12 w-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
                  <p className="font-semibold text-sm">No reviews found</p>
                  <p className="text-xs text-zinc-400 mt-1">Customer reviews matching your search will display here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.map(review => (
                    <div key={review._id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        {/* Rating & header */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200 block">{review.customerName}</span>
                            <span className="text-[10px] text-zinc-400 block">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-0.5 text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                fill={i < review.rating ? 'currentColor' : 'none'}
                                className={i < review.rating ? 'text-amber-500' : 'text-zinc-300'}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Associated Product */}
                        {review.product && (
                          <div className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                            <img src={review.product.productImage} alt={review.product.name} className="h-8 w-8 rounded object-cover" />
                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">{review.product.name}</span>
                          </div>
                        )}

                        <p className="text-xs text-zinc-600 dark:text-zinc-400 italic leading-relaxed">"{review.reviewText}"</p>

                        {/* Review images */}
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2">
                            {review.images.map((img, i) => (
                              <img key={i} src={img.secure_url} alt="Review attachment" className="h-10 w-10 object-cover rounded-lg border" />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <span
                          className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${review.status === 'Approved'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                            : review.status === 'Rejected'
                              ? 'bg-red-500/10 border-red-500/20 text-red-600'
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                            }`}
                        >
                          {review.status}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {review.status !== 'Approved' && (
                            <button
                              onClick={() => handleReviewAction(review._id, 'Approved')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-sm transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          {review.status !== 'Rejected' && (
                            <button
                              onClick={() => handleReviewAction(review._id, 'Rejected')}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg shadow-sm transition-colors"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                            title="Delete Review"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ANALYTICS TAB VIEW */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart2 className="h-6 w-6 text-rose-500" /> eCommerce Metrics Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Review top performing products, best sellers and stock alerts.</p>
              </div>

              {loadingAnalytics || !analyticsData ? (
                <div className="flex items-center justify-center h-48">
                  <RefreshCw className="h-8 w-8 text-rose-500 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                  {/* Top Viewed */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 border-b pb-3">
                      <TrendingUp size={16} className="text-blue-500" /> Most Viewed Statues
                    </h3>
                    <div className="space-y-3">
                      {analyticsData.topViewed.map(item => (
                        <div key={item._id} className="flex items-center gap-3">
                          <img src={item.productImage} alt={item.name} className="h-10 w-10 object-cover rounded-lg border" />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200 block truncate">{item.name}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">${item.price.toLocaleString()}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                            {item.analytics?.viewsCount || 0} views
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best Sellers */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 border-b pb-3">
                      <Star size={16} className="text-amber-500" /> Best Sellers (Orders)
                    </h3>
                    <div className="space-y-3">
                      {analyticsData.bestSellers.map(item => (
                        <div key={item._id} className="flex items-center gap-3">
                          <img src={item.productImage} alt={item.name} className="h-10 w-10 object-cover rounded-lg border" />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200 block truncate">{item.name}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">${item.price.toLocaleString()}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                            {item.analytics?.ordersCount || 0} sold
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Low Stock alerts */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 border-b pb-3">
                      <AlertTriangle size={16} className="text-rose-500" /> Inventory Alerts
                    </h3>
                    <div className="space-y-3">
                      {analyticsData.lowStock.length === 0 ? (
                        <div className="text-center text-zinc-400 text-xs py-8">
                          No stock alerts. All product inventory levels are healthy.
                        </div>
                      ) : (
                        analyticsData.lowStock.map(item => (
                          <div key={item._id} className="flex items-center gap-3">
                            <img src={item.productImage} alt={item.name} className="h-10 w-10 object-cover rounded-lg border" />
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200 block truncate">{item.name}</span>
                              <span className="text-[10px] text-zinc-400 font-mono">SKU: {item.sku}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                              {item.inventory?.availableStock || 0} left
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
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
