const Banner = require('../models/Banner');
const AboutUs = require('../models/AboutUs');
const Gallery = require('../models/Gallery');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Review = require('../models/Review');
const ProductAnalytics = require('../models/ProductAnalytics');
const InstagramGallery = require('../models/InstagramGallery');
const Testimonial = require('../models/Testimonial');
const SiteSettings = require('../models/SiteSettings');
const SpaceByGabha = require('../models/SpaceByGabha');
const JourneyMilestone = require('../models/JourneyMilestone');
const cloudinary = require('../config/cloudinary');

// Helper to upload buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'gabha_studio/cms' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
};

// --- UPLOAD CONTROLLERS ---
const uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const url = await uploadToCloudinary(req.file.buffer);
    res.status(200).json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const urls = [];
    for (const file of req.files) {
      const url = await uploadToCloudinary(file.buffer);
      urls.push(url);
    }
    res.status(200).json({ urls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- BANNER CONTROLLERS ---
const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ displayOrder: 1 });
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.status(200).json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    await banner.deleteOne();
    res.status(200).json({ message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reorderBanners = async (req, res) => {
  try {
    const { orders } = req.body;
    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({ message: 'Invalid order list' });
    }
    const bulkOps = orders.map(o => ({
      updateOne: {
        filter: { _id: o.id },
        update: { displayOrder: o.displayOrder }
      }
    }));
    await Banner.bulkWrite(bulkOps);
    res.status(200).json({ message: 'Banners reordered' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- ABOUT US CONTROLLERS ---
const getAboutUs = async (req, res) => {
  try {
    let about = await AboutUs.findOne();
    if (!about) {
      about = await AboutUs.create({
        title: 'About Us',
        subtitle: 'Our Story',
        description: 'Founded in the heart of the artisan district, Gabha Studio began with a singular vision: to craft sculptures that transcend time.',
        leftImage: '',
        rightImage: '',
        ctaText: 'Discover Our Story',
        ctaLink: '/about'
      });
    }
    res.status(200).json(about);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAboutUs = async (req, res) => {
  try {
    const about = await AboutUs.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.status(200).json(about);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- GALLERY CONTROLLERS ---
const getGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ displayOrder: 1 });
    res.status(200).json(galleries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createGallery = async (req, res) => {
  try {
    const gallery = await Gallery.create(req.body);
    res.status(201).json(gallery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!gallery) return res.status(404).json({ message: 'Gallery not found' });
    res.status(200).json(gallery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ message: 'Gallery not found' });
    await gallery.deleteOne();
    res.status(200).json({ message: 'Gallery deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reorderGalleries = async (req, res) => {
  try {
    const { orders } = req.body;
    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({ message: 'Invalid order list' });
    }
    const bulkOps = orders.map(o => ({
      updateOne: {
        filter: { _id: o.id },
        update: { displayOrder: o.displayOrder }
      }
    }));
    await Gallery.bulkWrite(bulkOps);
    res.status(200).json({ message: 'Galleries reordered' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- CATEGORY CONTROLLERS ---
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('parentCategory', 'title slug')
      .sort({ displayOrder: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { slug } = req.body;
    const existing = await Category.findOne({ slug });
    if (existing) return res.status(400).json({ message: 'Category slug already exists' });
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { slug } = req.body;
    const existing = await Category.findOne({ slug, _id: { $ne: req.params.id } });
    if (existing) return res.status(400).json({ message: 'Category slug already exists' });

    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    // Safety check: prevent delete if products exist
    const productsCount = await Product.countDocuments({ category: req.params.id });
    if (productsCount > 0) {
      return res.status(400).json({ message: `Cannot delete: category has ${productsCount} associated product(s)` });
    }

    await category.deleteOne();
    res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reorderCategories = async (req, res) => {
  try {
    const { orders } = req.body;
    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({ message: 'Invalid order list' });
    }
    const bulkOps = orders.map(o => ({
      updateOne: {
        filter: { _id: o.id },
        update: { displayOrder: o.displayOrder }
      }
    }));
    await Category.bulkWrite(bulkOps);
    res.status(200).json({ message: 'Categories reordered' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- PRODUCT CONTROLLERS ---
const getProducts = async (req, res) => {
  try {
    const { category, isActive, status, showOnHomepage, search } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (status) query.status = status;
    if (showOnHomepage !== undefined) query.showOnHomepage = showOnHomepage === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate('category', 'title slug')
      .sort({ displayOrder: 1 });
      
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'title slug');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.pricing) {
      const sp = Number(body.pricing.sellingPrice);
      const mrp = Number(body.pricing.mrp);
      if (mrp > 0 && sp > 0) {
        body.pricing.discountAmount = mrp - sp;
        body.pricing.discountPercentage = Math.round(((mrp - sp) / mrp) * 100);
      }
      body.price = sp;
    }
    if (body.images && body.images.featuredImage) {
      body.productImage = body.images.featuredImage.secure_url;
    }

    const product = await Product.create(body);
    const populated = await product.populate('category', 'title slug');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.pricing) {
      const sp = Number(body.pricing.sellingPrice);
      const mrp = Number(body.pricing.mrp);
      if (mrp > 0 && sp > 0) {
        body.pricing.discountAmount = mrp - sp;
        body.pricing.discountPercentage = Math.round(((mrp - sp) / mrp) * 100);
      }
      body.price = sp;
    }
    if (body.images && body.images.featuredImage) {
      body.productImage = body.images.featuredImage.secure_url;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, body, { new: true })
      .populate('category', 'title slug');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.deleteOne();
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reorderProducts = async (req, res) => {
  try {
    const { orders } = req.body;
    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({ message: 'Invalid order list' });
    }
    const bulkOps = orders.map(o => ({
      updateOne: {
        filter: { _id: o.id },
        update: { displayOrder: o.displayOrder }
      }
    }));
    await Product.bulkWrite(bulkOps);
    res.status(200).json({ message: 'Products reordered' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- INSTAGRAM FEED CONTROLLERS ---
const getInstagramItems = async (req, res) => {
  try {
    const items = await InstagramGallery.find().sort({ displayOrder: 1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createInstagramItem = async (req, res) => {
  try {
    const item = await InstagramGallery.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateInstagramItem = async (req, res) => {
  try {
    const item = await InstagramGallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Instagram item not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteInstagramItem = async (req, res) => {
  try {
    const item = await InstagramGallery.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Instagram item not found' });
    await item.deleteOne();
    res.status(200).json({ message: 'Instagram item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reorderInstagramItems = async (req, res) => {
  try {
    const { orders } = req.body;
    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({ message: 'Invalid order list' });
    }
    const bulkOps = orders.map(o => ({
      updateOne: {
        filter: { _id: o.id },
        update: { displayOrder: o.displayOrder }
      }
    }));
    await InstagramGallery.bulkWrite(bulkOps);
    res.status(200).json({ message: 'Instagram gallery reordered' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- TESTIMONIAL CONTROLLERS ---
const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.status(200).json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    res.status(201).json(testimonial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });
    res.status(200).json(testimonial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });
    await testimonial.deleteOne();
    res.status(200).json({ message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- SITE SETTINGS CONTROLLERS ---
const getSiteSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({
        websiteName: 'Gabha Studio',
        websiteLogo: '',
        footerLogo: '',
        navbarLogo: '',
        favicon: '',
        companyAddress: 'Artisan District, New York, NY',
        phoneNumber: '+1 (555) 123-4567',
        emailAddress: 'info@gabhastudio.com',
        whatsAppNumber: '',
        instagramUrl: 'https://instagram.com',
        facebookUrl: 'https://facebook.com',
        youtubeUrl: '',
        linkedinUrl: '',
        twitterUrl: '',
        ownerSignature: '',
        companyStamp: '',
        metaTitle: 'Gabha Studio - Masterpieces in Stone',
        metaDescription: 'Gabha Studio crafts exceptional statues and sculptures that breathe life into space. Discover our premium collection.',
        metaKeywords: 'statue, sculpture, art, gabha studio, stone, marble',
        footerText: 'Crafting timeless statues and sculptures that capture the essence of pure art.',
        copyrightText: '© 2026 Gabha Studio. All rights reserved.',
        googleMapsLink: '',
        googleAnalyticsCode: ''
      });
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSiteSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.status(200).json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- PRODUCT EXTRA CONTROLLERS (Duplicate, Bulk, Storefront, Logs, Analytics) ---
const duplicateProduct = async (req, res) => {
  try {
    const original = await Product.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Original product not found' });

    const duplicateData = original.toObject();
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;

    duplicateData.name = `${original.name} (Copy)`;
    duplicateData.slug = `${original.slug}-copy-${Date.now()}`;
    duplicateData.sku = `${original.sku}-copy-${Date.now()}`;
    duplicateData.status = 'Draft';

    const count = await Product.countDocuments();
    duplicateData.displayOrder = count;

    const copy = await Product.create(duplicateData);
    const populated = await copy.populate('category', 'title slug');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkProductAction = async (req, res) => {
  try {
    const { ids, action, value } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Product IDs are required' });
    }

    if (action === 'delete') {
      await Product.deleteMany({ _id: { $in: ids } });
      return res.status(200).json({ message: 'Products deleted successfully' });
    }

    let update = {};
    if (action === 'publish') {
      update = { status: 'Published', isActive: true };
    } else if (action === 'archive') {
      update = { status: 'Archived', isActive: false };
    } else if (action === 'updateTags') {
      update = { tags: value };
    } else {
      return res.status(400).json({ message: 'Invalid bulk action' });
    }

    await Product.updateMany({ _id: { $in: ids } }, { $set: update });
    res.status(200).json({ message: 'Bulk update completed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStorefrontProducts = async (req, res) => {
  try {
    const { categorySlug, minPrice, maxPrice, brand, color, size, rating, availability, search, tags } = req.query;

    let query = { status: 'Published' };

    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) query.category = category._id;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    if (color) {
      query.$or = [
        { 'specifications.color': { $regex: color, $options: 'i' } },
        { 'variants.combinations.combination.Color': { $regex: color, $options: 'i' } }
      ];
    }

    if (size) {
      query['variants.combinations.combination.Size'] = size;
    }

    if (availability === 'inStock') {
      query['inventory.availableStock'] = { $gt: 0 };
    }

    if (tags) {
      const tagList = tags.split(',');
      query.tags = { $in: tagList };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    let products = await Product.find(query)
      .populate('category', 'title slug')
      .sort({ displayOrder: 1 });

    // Filter by rating in memory if rating filter exists (since ratings are in Reviews model)
    if (rating) {
      const targetRating = Number(rating);
      const filtered = [];
      for (const p of products) {
        const reviews = await Review.find({ product: p._id, status: 'Approved' });
        const avg = reviews.length > 0
          ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
          : 0;
        if (avg >= targetRating) {
          filtered.push(p);
        }
      }
      products = filtered;
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logProductActivity = async (req, res) => {
  try {
    const { type } = req.body;
    const { id } = req.params;
    if (!['View', 'Click', 'AddToCart', 'Wishlist', 'Order'].includes(type)) {
      return res.status(400).json({ message: 'Invalid activity type' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Save detailed daily analytics log
    await ProductAnalytics.create({
      product: id,
      type,
      date: today
    });

    // Update root level analytics summary counts on product for fast lookup
    const updateField = {};
    if (type === 'View') updateField['analytics.viewsCount'] = 1;
    if (type === 'Click') updateField['analytics.clicksCount'] = 1;
    if (type === 'AddToCart') updateField['analytics.addToCartCount'] = 1;
    if (type === 'Wishlist') updateField['analytics.wishlistCount'] = 1;
    if (type === 'Order') updateField['analytics.ordersCount'] = 1;

    await Product.findByIdAndUpdate(id, { $inc: updateField });

    res.status(200).json({ message: 'Activity logged successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductAnalytics = async (req, res) => {
  try {
    // Top Views Products
    const topViewed = await Product.find()
      .sort({ 'analytics.viewsCount': -1 })
      .limit(5)
      .select('name price productImage analytics');

    // Top Orders Products (Best Sellers)
    const bestSellers = await Product.find()
      .sort({ 'analytics.ordersCount': -1 })
      .limit(5)
      .select('name price productImage analytics');

    // Low Stock Products
    const lowStock = await Product.find({
      $expr: {
        $lte: ['$inventory.availableStock', '$inventory.lowStockThreshold']
      }
    })
      .limit(10)
      .select('name sku inventory productImage');

    res.status(200).json({
      topViewed,
      bestSellers,
      lowStock
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- REVIEW CONTROLLERS ---
const getReviews = async (req, res) => {
  try {
    const { status, product } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (product) filter.product = product;

    const reviews = await Review.find(filter)
      .populate('product', 'name productImage')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('product', 'name productImage');
    if (!review) return res.status(404).json({ message: 'Review not found' });

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await review.deleteOne();
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id, status: 'Approved' })
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProductReview = async (req, res) => {
  try {
    const { rating, reviewText, customerName, images } = req.body;
    const review = await Review.create({
      product: req.params.id,
      rating: Number(rating),
      reviewText,
      customerName,
      images: images || [],
      status: 'Pending' // Requires admin approval
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getSpaceByGabha = async (req, res) => {
  try {
    let space = await SpaceByGabha.findOne();
    if (!space) {
      space = await SpaceByGabha.create({
        page_name: "Space By Gabha",
        slug: "/space-by-gabha",
        status: "published",
        seo: {
          meta_title: "Space By Gabha | Events, Retreats & Experiences",
          meta_description: "A beautiful destination near Kasarsai Dam for weddings, workshops, retreats and community events.",
          keywords: [
            "Space By Gabha",
            "Event Space Pune",
            "Wedding Venue",
            "Creative Retreat",
            "Corporate Retreat"
          ]
        },
        hero_section: {
          is_active: true,
          background_image: "kasarsai_dam_aerial.jpg",
          mobile_background_image: "kasarsai_dam_mobile.jpg",
          heading: "SPACE BY GABHA",
          subheading: "Where people, nature & experiences meet.",
          location: "Near Kasarsai Dam, Pune",
          cta_button: {
            text: "EXPLORE THE SPACE",
            url: "#explore"
          }
        },
        purpose_section: {
          is_active: true,
          heading: "Every Space Has A Purpose.",
          description: "Some spaces are built with walls. Some are shaped by the people who gather within them. Space by Gabha was created for moments that deserve room to breathe.",
          cards: [
            {
              title: "Celebrate",
              image: "celebrate_wedding.jpg",
              items: [
                "Destination Weddings",
                "Private Gatherings",
                "Special Occasions"
              ],
              button_text: "Explore",
              button_url: "/celebrate",
              sort_order: 1
            },
            {
              title: "Create",
              image: "create_pottery.jpg",
              items: [
                "Pottery Workshops",
                "Art Sessions",
                "Creative Retreats"
              ],
              button_text: "Explore",
              button_url: "/create",
              sort_order: 2
            },
            {
              title: "Connect",
              image: "connect_event.jpg",
              items: [
                "Corporate Retreats",
                "Meetups",
                "Community Events"
              ],
              button_text: "Explore",
              button_url: "/connect",
              sort_order: 3
            }
          ]
        },
        timeline_section: {
          is_active: true,
          heading: "A Space That Moves With You",
          description: "",
          timeline_items: [
            {
              title: "Morning",
              subtitle: "Workshops begin",
              icon: "sunrise",
              image: "morning_workshop.jpg"
            },
            {
              title: "Afternoon",
              subtitle: "Ideas take shape",
              icon: "sun",
              image: "afternoon_gathering.jpg"
            },
            {
              title: "Evening",
              subtitle: "Music fills the air",
              icon: "sunset",
              image: "evening_music.jpg"
            },
            {
              title: "Night",
              subtitle: "Celebrations continue",
              icon: "moon",
              image: "night_celebration.jpg"
            }
          ]
        },
        nature_section: {
          is_active: true,
          heading: "Framed By Nature",
          description: "Located near the serene Kasarsai Dam, the space offers open landscapes, natural surroundings, and an atmosphere that transforms every gathering into a memorable experience.",
          hero_image: "nature_banner.jpg",
          gallery: [
            {
              image: "nature_frame_1.jpg",
              alt: "Archway framing landscape"
            },
            {
              image: "pottery_workshop.jpg",
              alt: "Pottery workshop in progress"
            },
            {
              image: "night_event_lights.jpg",
              alt: "Evening event with string lights"
            },
            {
              image: "outdoor_gathering.jpg",
              alt: "Outdoor gathering setup"
            },
            {
              image: "celebration_lights.jpg",
              alt: "Celebration under lights"
            }
          ]
        },
        visit_section: {
          is_active: true,
          heading: "Visit The Space",
          description: "Book a site visit and experience the beauty of Space By Gabha.",
          cta_button: {
            text: "BOOK A SITE VISIT",
            url: "/contact"
          },
          location_info: {
            latitude: 18.6298,
            longitude: 73.7997,
            address_line_1: "Gat No. 326 & 337",
            address_line_2: "Maval - Hinjewadi - Pachane Road",
            landmark: "Near Kasarsai Dam",
            city: "Pune",
            state: "Maharashtra",
            country: "India",
            postal_code: "412306"
          },
          map: {
            provider: "google_maps",
            embed_url: "",
            location_name: "Space By Gabha"
          }
        }
      });
    }
    res.status(200).json(space);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSpaceByGabha = async (req, res) => {
  try {
    const space = await SpaceByGabha.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.status(200).json(space);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getJourneyMilestones = async (req, res) => {
  try {
    const milestones = await JourneyMilestone.find().sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json(milestones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createJourneyMilestone = async (req, res) => {
  try {
    const count = await JourneyMilestone.countDocuments();
    const milestone = new JourneyMilestone({
      ...req.body,
      displayOrder: req.body.displayOrder || count
    });
    await milestone.save();
    res.status(201).json(milestone);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateJourneyMilestone = async (req, res) => {
  try {
    const milestone = await JourneyMilestone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    res.status(200).json(milestone);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteJourneyMilestone = async (req, res) => {
  try {
    const milestone = await JourneyMilestone.findByIdAndDelete(req.params.id);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    res.status(200).json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reorderJourneyMilestones = async (req, res) => {
  try {
    const { orders } = req.body;
    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({ message: 'Invalid orders data' });
    }
    for (const item of orders) {
      await JourneyMilestone.findByIdAndUpdate(item.id, { displayOrder: item.displayOrder });
    }
    res.status(200).json({ message: 'Milestones reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
  getProduct,
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
  duplicateProduct,
  bulkProductAction,
  getStorefrontProducts,
  logProductActivity,
  getProductAnalytics,
  getReviews,
  updateReviewStatus,
  deleteReview,
  getProductReviews,
  createProductReview,
  getSpaceByGabha,
  updateSpaceByGabha,
  getJourneyMilestones,
  createJourneyMilestone,
  updateJourneyMilestone,
  deleteJourneyMilestone,
  reorderJourneyMilestones
};
