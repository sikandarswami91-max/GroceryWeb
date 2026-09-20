import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import app from './backend/app.js';
import { connectDB } from './backend/config/db.js';
import { seedDatabase } from './backend/utils/seeder.js';

const PORT = 3000;

async function startFullstackServer() {
  try {
    // 1. Connect MongoDB and seed initial data
    await connectDB();
    await seedDatabase();

    // 2. In development, mount Vite middleware
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('Vite middleware mounted in development mode');
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`MegaBasket Full-Stack Server running at http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start fullstack server:', err);
    process.exit(1);
  }
}

startFullstackServer();
