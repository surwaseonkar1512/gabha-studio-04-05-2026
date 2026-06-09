const Banner = require('../models/Banner');
const AboutUs = require('../models/AboutUs');
const Gallery = require('../models/Gallery');
const Category = require('../models/Category');
const Product = require('../models/Product');
const InstagramGallery = require('../models/InstagramGallery');
const Testimonial = require('../models/Testimonial');
const SiteSettings = require('../models/SiteSettings');
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
    const categories = await Category.find().sort({ displayOrder: 1 });
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
    const { category, isActive, showOnHomepage, search } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (showOnHomepage !== undefined) query.showOnHomepage = showOnHomepage === 'true';
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(query)
      .populate('category', 'title slug')
      .sort({ displayOrder: 1 });
      
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    const populated = await product.populate('category', 'title slug');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
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
  updateSiteSettings
};
