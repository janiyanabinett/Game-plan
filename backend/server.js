import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import aiRoutes from './routes/ai.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Allow any origin in production (set ALLOWED_ORIGIN env var to lock it down)
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());

app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FinLit AI backend running on port ${PORT}`);
});
