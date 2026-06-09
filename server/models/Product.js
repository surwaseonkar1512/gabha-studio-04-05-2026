const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  secure_url: { type: String },
  public_id: { type: String }
}, { _id: false });

const variantOptionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Size", "Color"
  values: [{ type: String }] // e.g. ["M", "L"] or ["Black", "White"]
}, { _id: false });

const variantCombinationSchema = new mongoose.Schema({
  combination: { type: Map, of: String }, // e.g. { "Color": "Black", "Size": "XL" }
  sku: { type: String },
  price: { type: Number },
  mrp: { type: Number },
  stock: { type: Number, default: 0 },
  weight: { type: Number },
  images: [{ type: String }] // URLs or public_ids of images
}, { _id: false });

const productSchema = new mongoose.Schema({
  // Root level fields for backward compatibility and quick catalog listing
  productImage: { type: String, required: true }, // Map to images.featuredImage.secure_url
  name: { type: String, required: true },
  price: { type: Number, required: true }, // Map to pricing.sellingPrice
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  shortDescription: { type: String },
  tag: { type: String }, // Keep for single tag backward compatibility
  showOnHomepage: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }, // Keep for backward compatibility
  displayOrder: { type: Number, default: 0 },

  // New eCommerce & Product Management fields
  slug: { type: String, required: true, unique: true },
  sku: { type: String, required: true, unique: true },
  barcode: { type: String },
  brand: { type: String },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived', 'Out Of Stock'],
    default: 'Draft'
  },
  
  pricing: {
    costPrice: { type: Number, default: 0 },
    sellingPrice: { type: Number, required: true },
    mrp: { type: Number, default: 0 },
    discountPercentage: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 }
  },

  tax: {
    gstPercentage: { type: Number, default: 18 },
    hsnCode: { type: String }
  },

  images: {
    featuredImage: imageSchema,
    thumbnailImage: imageSchema,
    gallery: [imageSchema]
  },

  variants: {
    options: [variantOptionSchema],
    combinations: [variantCombinationSchema]
  },

  inventory: {
    currentStock: { type: Number, default: 0 },
    availableStock: { type: Number, default: 0 },
    reservedStock: { type: Number, default: 0 },
    soldStock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 }
  },

  tags: [{ type: String }], // Array for multiple tags e.g. "New Arrival", "Best Seller", etc.

  descriptionBuilder: [{
    type: { type: String, required: true }, // e.g. "text", "richText", "bullet", "image", "video", "faq", etc.
    data: { type: mongoose.Schema.Types.Mixed }
  }],

  specifications: {
    material: { type: String },
    weight: { type: String },
    dimensions: {
      width: { type: Number },
      height: { type: Number },
      length: { type: Number }
    },
    color: { type: String },
    manufacturer: { type: String },
    countryOfOrigin: { type: String },
    warranty: { type: String },
    expiryDate: { type: Date },
    custom: [{ type: Map, of: String }] // Array of custom key-value pairs
  },

  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: { type: String },
    ogImage: imageSchema,
    canonicalUrl: { type: String }
  },

  analytics: {
    viewsCount: { type: Number, default: 0 },
    clicksCount: { type: Number, default: 0 },
    addToCartCount: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
    ordersCount: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
