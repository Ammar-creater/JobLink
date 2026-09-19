/**
 * Seed Script — Insert default categories into MongoDB
 * Run once: node utils/seedCategories.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

const categories = [
  { name: 'Software Engineering', description: 'Programming, development, and engineering roles' },
  { name: 'Design', description: 'UI/UX, graphic design, product design' },
  { name: 'Marketing', description: 'Digital marketing, content, SEO, social media' },
  { name: 'Data Science', description: 'Data analysis, ML, AI, analytics' },
  { name: 'Finance', description: 'Accounting, banking, financial analysis' },
  { name: 'Customer Support', description: 'Support agents, customer success' },
  { name: 'Sales', description: 'Sales representatives, business development' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Remove existing categories (fresh start)
    await Category.deleteMany({});
    console.log('🗑  Cleared existing categories');

    // Insert new categories
    const created = await Category.insertMany(categories);
    console.log(`✅ Inserted ${created.length} categories:`);
    created.forEach((c) => console.log(`   - ${c._id}  ${c.name}`));

    console.log('\n👉 Copy the category _id values above and paste them into client/src/services/jobs.js\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
