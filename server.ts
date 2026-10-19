import 'dotenv/config';
import type { Request, Response } from 'express';
import { createApp } from './app.js';
import connectDB from './config/db.js';

const app = createApp();

// Vercel invokes this handler without opening a listening socket.
export default async function handler(req: Request, res: Response) {
  try {
    await connectDB();
    app(req, res);
  } catch {
    res.status(503).json({ message: 'Database temporarily unavailable. Please retry.' });
  }
}

if (!process.env.VERCEL) {
  try {
    await connectDB();
    const port = Number(process.env.PORT || 5000);
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exitCode = 1;
  }
}
