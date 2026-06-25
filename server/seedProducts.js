require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database for product seeding.');

    // 1. Seed/Upsert Categories
    const categories = [
      {
        _id: '6a284718a3458fda6ee6bf3a',
        title: 'Wall Accessories',
        slug: 'wall-accessories',
        categoryImage: 'https://res.cloudinary.com/dussp84ou/image/upload/v1781520858/gabha_studio/cms/ndiwidn1tnmq8bieikeh.png',
        status: 'Active',
        displayOrder: 0
      },
      {
        _id: '6a2844e7a3458fda6ee6be47',
        title: 'Ceramic Gifts',
        slug: 'ceramic-gifts',
        categoryImage: 'https://res.cloudinary.com/dussp84ou/image/upload/v1781520950/gabha_studio/cms/oux3jatmf6iyxdlbxklm.png',
        status: 'Active',
        displayOrder: 1
      }
    ];

    for (const cat of categories) {
      await Category.updateOne(
        { _id: cat._id },
        { $set: cat },
        { upsert: true }
      );
      console.log(`Upserted category: ${cat.title}`);
    }

    // 2. Seed/Upsert Products
    const productsList = [
      {
        _id: "6a2fd9da3d83191d08ac7f03",
        name: "Glazed Clay Pitcher Jug",
        slug: "glazed-clay-pitcher-jug",
        sku: "SKU-1781520781627",
        barcode: "Glazed Clay Pitcher Jug",
        brand: "Gabha Studio",
        status: "Published",
        productImage: "https://res.cloudinary.com/dussp84ou/image/upload/v1781520858/gabha_studio/cms/ndiwidn1tnmq8bieikeh.png",
        price: 423423,
        category: "6a284718a3458fda6ee6bf3a",
        shortDescription: "A beautiful glazed clay pitcher featuring a smooth glossy finish with earthy undertones.",
        tag: "Clayware",
        showOnHomepage: true,
        isActive: true,
        displayOrder: 0,
        tags: ["Clayware", "Carafe", "Handcrafted"],
        pricing: {
          costPrice: 4234,
          sellingPrice: 423423,
          mrp: 3333333,
          discountPercentage: 87,
          discountAmount: 2909910
        },
        tax: {
          gstPercentage: 18,
          hsnCode: "69120040"
        },
        images: {
          featuredImage: {
            secure_url: "https://res.cloudinary.com/dussp84ou/image/upload/v1781520858/gabha_studio/cms/ndiwidn1tnmq8bieikeh.png",
            public_id: ""
          },
          thumbnailImage: {
            secure_url: "https://res.cloudinary.com/dussp84ou/image/upload/v1781520858/gabha_studio/cms/ndiwidn1tnmq8bieikeh.png",
            public_id: ""
          },
          gallery: [
            {
              secure_url: "https://res.cloudinary.com/dussp84ou/image/upload/v1781520854/gabha_studio/cms/cm63kskgwejo1hqto1fg.png",
              public_id: ""
            }
          ]
        },
        inventory: {
          currentStock: 10,
          availableStock: 10,
          reservedStock: 0,
          soldStock: 0,
          lowStockThreshold: 3
        },
        specifications: {
          dimensions: {
            width: 15,
            height: 25,
            length: 15
          },
          material: "Clay",
          weight: "1.5 kg",
          color: "Amber Brown",
          manufacturer: "Gabha Studio",
          countryOfOrigin: "India",
          warranty: "No Warranty",
          custom: []
        },
        seo: {
          metaTitle: "Glazed Clay Pitcher Jug | Gabha Studio",
          metaDescription: "Hand-thrown clay pitcher featuring a gorgeous glossy lead-free amber finish. Shop artisan pottery at Gabha.",
          keywords: "clay pitcher, glazed carafe, terracotta pitcher",
          canonicalUrl: ""
        },
        descriptionBuilder: [
          {
            type: "text",
            data: {
              title: "Artisanal Glaze Work",
              text: "Handmade by our skilled artisans, this glazed clay pitcher features a smooth glossy finish with earthy undertones, blending rustic style with everyday convenience."
            }
          },
          {
            type: "richText",
            data: {
              title: "Functional & Safe",
              text: "Coated with a 100% lead-free, food-safe glaze. Ideal for storing water, juices, or presenting as an attractive tabletop flower vase. Wash with warm water and soft sponge."
            }
          },
          {
            type: "faq",
            data: {
              list: [
                {
                  question: "Is this safe to serve cold beverages?",
                  answer: "Yes, it is fully glazed on the interior making it ideal for keeping water and beverages cool."
                }
              ]
            }
          },
          {
            type: "specifications",
            data: {
              rows: [
                {
                  label: "Volume",
                  value: "1.5 Liters"
                },
                {
                  label: "Glaze",
                  value: "Glossy Lead-free Amber"
                }
              ]
            }
          }
        ],
        analytics: {
          viewsCount: 0,
          clicksCount: 0,
          addToCartCount: 0,
          wishlistCount: 0,
          ordersCount: 0
        }
      },
      {
        _id: "6a2fda393d83191d08ac7f23",
        name: "Signature Stoneware Serving Bowl",
        slug: "signature-stoneware-serving-bowl",
        sku: "SKU-1781520901093",
        barcode: "Signature Stoneware Serving Bowl",
        brand: "Gabha Studio",
        status: "Published",
        productImage: "https://res.cloudinary.com/dussp84ou/image/upload/v1781520950/gabha_studio/cms/oux3jatmf6iyxdlbxklm.png",
        price: 3232,
        category: "6a2844e7a3458fda6ee6be47",
        shortDescription: "A large stoneware serving bowl with a hand-painted satin matte finish, perfect for family dinners or displaying fresh fruit.",
        tag: "Stoneware",
        showOnHomepage: true,
        isActive: true,
        displayOrder: 1,
        tags: ["Stoneware", "Bowl", "Handcrafted"],
        pricing: {
          costPrice: 3232,
          sellingPrice: 3232,
          mrp: 3224,
          discountPercentage: 0,
          discountAmount: -8
        },
        tax: {
          gstPercentage: 18,
          hsnCode: "69120090"
        },
        images: {
          featuredImage: {
            secure_url: "https://res.cloudinary.com/dussp84ou/image/upload/v1781520950/gabha_studio/cms/oux3jatmf6iyxdlbxklm.png",
            public_id: ""
          },
          thumbnailImage: {
            secure_url: "https://res.cloudinary.com/dussp84ou/image/upload/v1781520950/gabha_studio/cms/oux3jatmf6iyxdlbxklm.png",
            public_id: ""
          },
          gallery: [
            {
              secure_url: "https://res.cloudinary.com/dussp84ou/image/upload/v1781520953/gabha_studio/cms/edkcwjdb4gjgwg8aosjl.png",
              public_id: ""
            }
          ]
        },
        inventory: {
          currentStock: 10,
          availableStock: 10,
          reservedStock: 0,
          soldStock: 0,
          lowStockThreshold: 3
        },
        specifications: {
          dimensions: {
            width: 25,
            height: 10,
            length: 25
          },
          material: "Stoneware",
          weight: "1.8 kg",
          color: "Satin Cream",
          manufacturer: "Gabha Studio",
          countryOfOrigin: "India",
          warranty: "No Warranty",
          custom: []
        },
        seo: {
          metaTitle: "Signature Stoneware Serving Bowl | Gabha Studio",
          metaDescription: "Hand-painted large stoneware serving bowl. Oven, microwave, and dishwasher safe dinnerware accessory.",
          keywords: "stoneware bowl, serving bowl, handmade ceramic bowl",
          canonicalUrl: ""
        },
        descriptionBuilder: [
          {
            type: "text",
            data: {
              title: "Timeless Stoneware",
              text: "Crafted from durable high-fire stoneware, this serving bowl features organic shape variations and a lovely speckled satin matte glaze, ensuring no two pieces are exactly alike."
            }
          },
          {
            type: "richText",
            data: {
              title: "Durable for Daily Use",
              text: "Oven, microwave, and dishwasher safe. The robust stoneware body resists chipping and cracking, making it a reliable choice for heavy use at social gatherings."
            }
          },
          {
            type: "faq",
            data: {
              list: [
                {
                  question: "Is this bowl microwave safe?",
                  answer: "Yes, our high-fired stoneware products can safely be used in the microwave and oven."
                }
              ]
            }
          },
          {
            type: "specifications",
            data: {
              rows: [
                {
                  label: "Diameter",
                  value: "10 inches"
                },
                {
                  label: "Material",
                  value: "Stoneware Clay"
                }
              ]
            }
          }
        ],
        analytics: {
          viewsCount: 0,
          clicksCount: 0,
          addToCartCount: 0,
          wishlistCount: 0,
          ordersCount: 0
        }
      },
      {
        _id: "6a285c9ff4624f7fe4392c21",
        name: "Terracotta Floral Wall Medallion",
        slug: "terracotta-floral-wall-medallion",
        sku: "SKU-1781029945948",
        brand: "Gabha Studio",
        status: "Published",
        productImage: "https://res.cloudinary.com/dussp84ou/image/upload/v1781030011/gabha_studio/cms/brpifyuldxlggl1hwk2y.png",
        price: 4343,
        category: "6a284718a3458fda6ee6bf3a",
        shortDescription: "An exquisitely handcrafted terracotta wall medallion featuring intricate floral carvings, perfect for adding an organic focal point to your living space.",
        tag: "Terracotta",
        showOnHomepage: true,
        isActive: true,
        displayOrder: 2,
        tags: ["Terracotta", "Wall Art", "Handcrafted"],
        pricing: {
          costPrice: 4333,
          sellingPrice: 4343,
          mrp: 43333,
          discountAmount: 38990,
          discountPercentage: 90
        },
        tax: {
          gstPercentage: 5,
          hsnCode: "69139000"
        },
        images: {
          featuredImage: {
            secure_url: "https://res.cloudinary.com/dussp84ou/image/upload/v1781030011/gabha_studio/cms/brpifyuldxlggl1hwk2y.png",
            public_id: ""
          },
          thumbnailImage: {
            secure_url: "https://res.cloudinary.com/dussp84ou/image/upload/v1781030012/gabha_studio/cms/frtasosx46pgb1shuiay.png",
            public_id: ""
          },
          gallery: [
            {
              secure_url: "https://res.cloudinary.com/dussp84ou/image/upload/v1781030027/gabha_studio/cms/nd19mux4amy80bbxzywg.png",
              public_id: ""
            }
          ]
        },
        inventory: {
          currentStock: 10,
          availableStock: 10,
          reservedStock: 0,
          soldStock: 0,
          lowStockThreshold: 3
        },
        specifications: {
          dimensions: {
            width: 3,
            height: 33,
            length: 433
          },
          material: "Terracotta",
          weight: "1.2 kg",
          color: "Terracotta Brown",
          manufacturer: "Gabha Studio",
          countryOfOrigin: "India",
          warranty: "No Warranty",
          custom: []
        },
        seo: {
          metaTitle: "Terracotta Floral Wall Medallion | Gabha Studio",
          metaDescription: "Intricately handcrafted clay wall art featuring classic Indian floral engravings. Add timeless design and earthy beauty to your gallery wall.",
          keywords: "clay wall art, terracotta medallion, handmade clay decor",
          canonicalUrl: ""
        },
        descriptionBuilder: [
          {
            type: "text",
            data: {
              title: "Artisanal Heritage",
              text: "Each medallion is hand-pressed by local master sculptors at Gabha Studio using heritage clay techniques passed down through generations."
            }
          },
          {
            type: "richText",
            data: {
              title: "Inspiration & Care",
              text: "Inspired by ancient temple motifs of India, this floral medallion adds warmth and rustic texture. Avoid harsh chemical cleaners; dust gently with a soft dry cloth."
            }
          },
          {
            type: "image",
            data: {
              secure_url: "https://res.cloudinary.com/dussp84ou/image/upload/v1781030083/gabha_studio/cms/bhfjdjizbweoetgthvfp.png",
              caption: "Earthy Texture details"
            }
          },
          {
            type: "video",
            data: {
              videoUrl: "",
              caption: "Production Process Video"
            }
          },
          {
            type: "faq",
            data: {
              list: [
                {
                  question: "Is it suitable for outdoor display?",
                  answer: "Yes, but we recommend hanging under a covered patio away from direct downpour to preserve natural finishes."
                }
              ]
            }
          },
          {
            type: "faq",
            data: {
              list: [
                {
                  question: "How do I secure it to the wall?",
                  answer: "It has a pre-drilled heavy duty mounting slot on the rear side."
                }
              ]
            }
          },
          {
            type: "specifications",
            data: {
              rows: [
                {
                  label: "Material",
                  value: "Hand-pressed Natural Clay / Terracotta"
                },
                {
                  label: "Finish",
                  value: "Earthy Terracotta Matte"
                },
                {
                  label: "Mounting",
                  value: "Wall hanger slot pre-drilled at back"
                }
              ]
            }
          }
        ],
        analytics: {
          viewsCount: 0,
          clicksCount: 0,
          addToCartCount: 0,
          wishlistCount: 0,
          ordersCount: 0
        }
      },
      {
        _id: "6a2fe6273d83191d08ac8045",
        name: "Rustic Amber Pitcher Jug",
        slug: "rustic-amber-pitcher-jug",
        sku: "SKU-1781523895019",
        barcode: "Rustic Glazed Pitcher",
        brand: "Gabha Studio",
        status: "Published",
        productImage: "https://res.cloudinary.com/dussp84ou/image/upload/v1781523979/gabha_studio/cms/eh1grumtkkx0w40b9fvw.png",
        price: 423,
        category: "6a2844e7a3458fda6ee6be47",
        shortDescription: "A rustic glazed clay pitcher jug crafted with local clay and finished with a food-safe amber glaze.",
        tag: "Earthenware",
        showOnHomepage: true,
        isActive: true,
        displayOrder: 3,
        tags: ["Earthenware", "Pitcher", "Handcrafted"],
        pricing: {
          costPrice: 423,
          sellingPrice: 423,
          mrp: 339,
          discountAmount: -84,
          discountPercentage: -25
        },
        tax: {
          gstPercentage: 18,
          hsnCode: "69120040"
        },
        images: {
          featuredImage: {
            secure_url: "https://res.cloudinary.com/dussp84ou/image/upload/v1781523979/gabha_studio/cms/eh1grumtkkx0w40b9fvw.png",
            public_id: ""
          },
          thumbnailImage: {
            secure_url: "https://res.cloudinary.com/dussp84ou/image/upload/v1781523979/gabha_studio/cms/eh1grumtkkx0w40b9fvw.png",
            public_id: ""
          },
          gallery: [
            {
              secure_url: "https://res.cloudinary.com/dussp84ou/image/upload/v1781523984/gabha_studio/cms/ky9wscpclgft97zjvclj.png",
              public_id: ""
            }
          ]
        },
        inventory: {
          currentStock: 10,
          availableStock: 10,
          reservedStock: 0,
          soldStock: 0,
          lowStockThreshold: 3
        },
        specifications: {
          dimensions: {
            width: 12,
            height: 18,
            length: 12
          },
          material: "Red Clay",
          weight: "0.9 kg",
          color: "Amber Orange",
          manufacturer: "Gabha Studio",
          countryOfOrigin: "India",
          warranty: "No Warranty",
          custom: []
        },
        seo: {
          metaTitle: "Rustic Amber Pitcher Jug | Gabha Studio",
          metaDescription: "Artisanal clay pitcher with beautiful amber semi-glaze. Safe for serving table beverages or holding flowers.",
          keywords: "amber pitcher, clay jug, rustic tableware",
          canonicalUrl: ""
        },
        descriptionBuilder: [
          {
            type: "text",
            data: {
              title: "Earthy Charm",
              text: "Designed with a classic traditional form, this pitcher showcases a rustic aesthetic with a partially glazed finish highlighting the raw texture of red clay at the base."
            }
          },
          {
            type: "richText",
            data: {
              title: "Heritage Dining",
              text: "Bring an organic touch to your dining room table. Suitable for serving ice-cold water or cider. Handle with care and clean using mild dishwash liquid."
            }
          },
          {
            type: "faq",
            data: {
              list: [
                {
                  question: "Can I use this for hot liquids?",
                  answer: "We recommend using this pitcher primarily for cold or room temperature liquids to avoid thermal shock to the earthenware."
                }
              ]
            }
          },
          {
            type: "specifications",
            data: {
              rows: [
                {
                  label: "Capacity",
                  value: "800 ml"
                },
                {
                  label: "Material",
                  value: "Local Earthen Clay"
                }
              ]
            }
          }
        ],
        analytics: {
          viewsCount: 0,
          clicksCount: 0,
          addToCartCount: 0,
          wishlistCount: 0,
          ordersCount: 0
        }
      }
    ];

    for (const prod of productsList) {
      await Product.updateOne(
        { _id: prod._id },
        { $set: prod },
        { upsert: true }
      );
      console.log(`Upserted product: ${prod.name}`);
    }

    console.log('Seeding finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
