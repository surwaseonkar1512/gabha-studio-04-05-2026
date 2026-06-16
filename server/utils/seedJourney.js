require("dotenv").config();
const mongoose = require("mongoose");
const Journey = require("../models/Journey");

const milestones = [
  {
    year: "2002",
    title: "The Beginning",
    description: "Started our journey with a passion for clay art, learning basic sculpting techniques and creating our very first handmade pieces.",
    image: "/about_sculpting_tools.png",
    displayOrder: 0,
    isActive: true
  },
  {
    year: "2006",
    title: "Exploring Creativity",
    description: "Started our journey with a passion for clay art, learning basic sculpting techniques and creating our very first handmade pieces.",
    image: "/about_clay_face.png",
    displayOrder: 1,
    isActive: true
  },
  {
    year: "2012",
    title: "The Beginning",
    description: "Started our journey with a passion for clay art, learning basic sculpting techniques and creating our very first handmade pieces.",
    image: "/appointment_sculpting.png",
    displayOrder: 2,
    isActive: true
  },
  {
    year: "2024",
    title: "Exploring Creativity",
    description: "Started our journey with a passion for clay art, learning basic sculpting techniques and creating our very first handmade pieces.",
    image: "/sculpture_banner_bg.png",
    displayOrder: 3,
    isActive: true
  }
];

const seedJourney = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding journey...");

    // Only seed if empty
    const count = await Journey.countDocuments();
    if (count === 0) {
      await Journey.insertMany(milestones);
      console.log("Timeline milestones seeded successfully!");
    } else {
      console.log("Journey database already has data, skipping seeding.");
    }
    process.exit(0);
  } catch (error) {
    console.error("Error seeding journey milestones:", error);
    process.exit(1);
  }
};

seedJourney();
