const express = require('express');
const {
  uploadSingle,
  uploadMultiple,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
  getAboutUs,
  updateAboutUs,
  getGalleries,
  createGallery,
  updateGallery,
  deleteGallery,
  reorderGalleries,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  reorderProducts,
  getInstagramItems,
  createInstagramItem,
  updateInstagramItem,
  deleteInstagramItem,
  reorderInstagramItems,
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getSiteSettings,
  updateSiteSettings,
  // New Product Management/eCommerce controllers
  duplicateProduct,
  bulkProductAction,
  getStorefrontProducts,
  logProductActivity,
  getProductAnalytics,
  getReviews,
  updateReviewStatus,
  deleteReview,
  getProductReviews,
  createProductReview
} = require('../controllers/cmsController');

const { protect, checkPermission } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// --- PUBLIC READ ENDPOINTS ---
router.get('/banners', getBanners);
router.get('/about', getAboutUs);
router.get('/gallery', getGalleries);
router.get('/categories', getCategories);
router.get('/products', getProducts);
router.get('/instagram', getInstagramItems);
router.get('/testimonials', getTestimonials);
router.get('/settings', getSiteSettings);

// Storefront & Reviews public access
router.get('/products/storefront', getStorefrontProducts);
router.get('/products/:id/reviews', getProductReviews);
router.post('/products/:id/reviews', createProductReview);
router.post('/products/:id/log-activity', logProductActivity);

// --- PROTECTED WRITE ENDPOINTS ---
router.use(protect);

// Uploads
router.post('/upload', checkPermission('cms', 'add'), upload.single('image'), uploadSingle);
router.post('/upload-multiple', checkPermission('cms', 'add'), upload.array('images', 15), uploadMultiple);

// Banners
router.post('/banners', checkPermission('cms', 'add'), createBanner);
router.put('/banners/reorder', checkPermission('cms', 'edit'), reorderBanners);
router.put('/banners/:id', checkPermission('cms', 'edit'), updateBanner);
router.delete('/banners/:id', checkPermission('cms', 'delete'), deleteBanner);

// About Us
router.put('/about', checkPermission('cms', 'edit'), updateAboutUs);

// Gallery
router.post('/gallery', checkPermission('cms', 'add'), createGallery);
router.put('/gallery/reorder', checkPermission('cms', 'edit'), reorderGalleries);
router.put('/gallery/:id', checkPermission('cms', 'edit'), updateGallery);
router.delete('/gallery/:id', checkPermission('cms', 'delete'), deleteGallery);

// Categories
router.post('/categories', checkPermission('cms', 'add'), createCategory);
router.put('/categories/reorder', checkPermission('cms', 'edit'), reorderCategories);
router.put('/categories/:id', checkPermission('cms', 'edit'), updateCategory);
router.delete('/categories/:id', checkPermission('cms', 'delete'), deleteCategory);

// Products
router.get('/products/analytics', checkPermission('cms', 'view'), getProductAnalytics);
router.post('/products', checkPermission('cms', 'add'), createProduct);
router.put('/products/reorder', checkPermission('cms', 'edit'), reorderProducts);
router.put('/products/bulk', checkPermission('cms', 'edit'), bulkProductAction);
router.post('/products/:id/duplicate', checkPermission('cms', 'add'), duplicateProduct);
router.put('/products/:id', checkPermission('cms', 'edit'), updateProduct);
router.delete('/products/:id', checkPermission('cms', 'delete'), deleteProduct);

// Reviews management
router.get('/reviews', checkPermission('cms', 'view'), getReviews);
router.put('/reviews/:id/status', checkPermission('cms', 'edit'), updateReviewStatus);
router.delete('/reviews/:id', checkPermission('cms', 'delete'), deleteReview);

// Instagram feed
router.post('/instagram', checkPermission('cms', 'add'), createInstagramItem);
router.put('/instagram/reorder', checkPermission('cms', 'edit'), reorderInstagramItems);
router.put('/instagram/:id', checkPermission('cms', 'edit'), updateInstagramItem);
router.delete('/instagram/:id', checkPermission('cms', 'delete'), deleteInstagramItem);

// Testimonials
router.post('/testimonials', checkPermission('cms', 'add'), createTestimonial);
router.put('/testimonials/:id', checkPermission('cms', 'edit'), updateTestimonial);
router.delete('/testimonials/:id', checkPermission('cms', 'delete'), deleteTestimonial);

// Site Settings
router.put('/settings', checkPermission('cms', 'edit'), updateSiteSettings);

module.exports = router;
