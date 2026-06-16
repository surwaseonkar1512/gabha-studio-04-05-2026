const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  // General settings
  websiteName: { type: String, default: 'Gabha Studio' },
  websiteLogo: { type: String, default: '' },
  footerLogo: { type: String, default: '' },
  navbarLogo: { type: String, default: '' },
  favicon: { type: String, default: '' },

  // Contact details
  companyAddress: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  emailAddress: { type: String, default: '' },
  whatsAppNumber: { type: String, default: '' },

  // Social media settings
  instagramUrl: { type: String, default: '' },
  facebookUrl: { type: String, default: '' },
  youtubeUrl: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  twitterUrl: { type: String, default: '' },

  // Branding & Payments settings
  ownerSignature: { type: String, default: '' },
  companyStamp: { type: String, default: '' },
  upiId: { type: String, default: '' },
  upiQrCode: { type: String, default: '' },
  bankAccountName: { type: String, default: 'Gabha Studio' },
  bankName: { type: String, default: 'HDFC Bank' },
  bankAccountNumber: { type: String, default: '1234 5678 9012' },
  bankIfscCode: { type: String, default: 'HDFC0001234' },
  gstNumber: { type: String, default: '' },

  // SEO settings
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  metaKeywords: { type: String, default: '' },

  // Additional settings
  footerText: { type: String, default: '' },
  copyrightText: { type: String, default: '' },
  googleMapsLink: { type: String, default: '' },
  googleAnalyticsCode: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
