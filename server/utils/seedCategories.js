/**
 * Seed Script — Upsert default categories into MongoDB
 * Run: node utils/seedCategories.js
 *
 * Safe to run multiple times — uses upsert so existing categories
 * are updated (matched by name) instead of deleted and recreated.
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

    let inserted = 0;
    let updated = 0;
    let unchanged = 0;

    for (const cat of categories) {
      const result = await Category.updateOne(
        { name: cat.name },
        { $set: { description: cat.description } },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        inserted++;
        console.log(`  ➕ Inserted: ${cat.name}`);
      } else if (result.modifiedCount > 0) {
        updated++;
        console.log(`  🔄 Updated:  ${cat.name}`);
      } else {
        unchanged++;
        console.log(`  ⏭  Unchanged: ${cat.name}`);
      }
    }

    console.log(`\n✅ Done — ${inserted} inserted, ${updated} updated, ${unchanged} unchanged`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();