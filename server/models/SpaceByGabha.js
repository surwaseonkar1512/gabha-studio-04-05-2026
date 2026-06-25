const mongoose = require('mongoose');

const spaceByGabhaSchema = new mongoose.Schema({
  page_name: { type: String, default: 'Space By Gabha' },
  slug: { type: String, default: '/space-by-gabha' },
  status: { type: String, default: 'published' },
  seo: {
    meta_title: { type: String, default: 'Space By Gabha | Events, Retreats & Experiences' },
    meta_description: { type: String, default: 'A beautiful destination near Kasarsai Dam for weddings, workshops, retreats and community events.' },
    keywords: [{ type: String }]
  },
  hero_section: {
    is_active: { type: Boolean, default: true },
    background_image: { type: String, default: 'kasarsai_dam_aerial.jpg' },
    mobile_background_image: { type: String, default: 'kasarsai_dam_mobile.jpg' },
    heading: { type: String, default: 'SPACE BY GABHA' },
    subheading: { type: String, default: 'Where people, nature & experiences meet.' },
    location: { type: String, default: 'Near Kasarsai Dam, Pune' },
    cta_button: {
      text: { type: String, default: 'EXPLORE THE SPACE' },
      url: { type: String, default: '#explore' }
    }
  },
  purpose_section: {
    is_active: { type: Boolean, default: true },
    heading: { type: String, default: 'Every Space Has A Purpose.' },
    description: { type: String, default: 'Some spaces are built with walls. Some are shaped by the people who gather within them. Space by Gabha was created for moments that deserve room to breathe.' },
    cards: [{
      title: { type: String, required: true },
      image: { type: String, default: '' },
      items: [{ type: String }],
      button_text: { type: String, default: 'Explore' },
      button_url: { type: String, default: '' },
      sort_order: { type: Number, default: 0 }
    }]
  },
  timeline_section: {
    is_active: { type: Boolean, default: true },
    heading: { type: String, default: 'A Space That Moves With You' },
    description: { type: String, default: '' },
    timeline_items: [{
      title: { type: String, required: true },
      subtitle: { type: String, default: '' },
      icon: { type: String, default: '' },
      image: { type: String, default: '' }
    }]
  },
  nature_section: {
    is_active: { type: Boolean, default: true },
    heading: { type: String, default: 'Framed By Nature' },
    description: { type: String, default: 'Located near the serene Kasarsai Dam, the space offers open landscapes, natural surroundings, and an atmosphere that transforms every gathering into a memorable experience.' },
    hero_image: { type: String, default: 'nature_banner.jpg' },
    gallery: [{
      image: { type: String, default: '' },
      alt: { type: String, default: '' }
    }]
  },
  visit_section: {
    is_active: { type: Boolean, default: true },
    heading: { type: String, default: 'Visit The Space' },
    description: { type: String, default: 'Book a site visit and experience the beauty of Space By Gabha.' },
    cta_button: {
      text: { type: String, default: 'BOOK A SITE VISIT' },
      url: { type: String, default: '/contact' }
    },
    location_info: {
      latitude: { type: Number, default: 18.6298 },
      longitude: { type: Number, default: 73.7997 },
      address_line_1: { type: String, default: 'Gat No. 326 & 337' },
      address_line_2: { type: String, default: 'Maval - Hinjewadi - Pachane Road' },
      landmark: { type: String, default: 'Near Kasarsai Dam' },
      city: { type: String, default: 'Pune' },
      state: { type: String, default: 'Maharashtra' },
      country: { type: String, default: 'India' },
      postal_code: { type: String, default: '412306' }
    },
    map: {
      provider: { type: String, default: 'google_maps' },
      embed_url: { type: String, default: '' },
      location_name: { type: String, default: 'Space By Gabha' }
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('SpaceByGabha', spaceByGabhaSchema);
