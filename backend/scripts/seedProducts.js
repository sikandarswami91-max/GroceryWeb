import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { seedDatabase } from '../utils/seeder.js';

dotenv.config();

const run = async () => {
  try {
    console.log('--- MegaBasket Standalone Product & Category Seeder ---');
    await connectDB();
    await seedDatabase();
    console.log('Seeding process finished successfully.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Fatal error during seeding:', err);
    process.exit(1);
  }
};

run();
