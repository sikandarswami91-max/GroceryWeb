import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { seedDatabase } from './utils/seeder.js';

dotenv.config();

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await connectDB();
    await seedDatabase();

    // In standalone backend deployment (e.g. on Render), serve status on root '/'
    app.get('/', (req, res) => {
      res.json({
        status: 'ok',
        app: 'MegaBasket Backend API is running on Render',
        version: '1.0.0',
        time: new Date().toISOString(),
      });
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`MegaBasket Backend running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
