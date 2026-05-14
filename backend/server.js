import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import aiRoutes      from './routes/ai.js';
import crmRoutes     from './routes/crm.js';
import agentRoutes   from './routes/agents.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());

app.use('/api/ai',     aiRoutes);
app.use('/api/crm',    crmRoutes);
app.use('/api/agents', agentRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', platform: 'PropAI Command Center' }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PropAI Command Center backend running on port ${PORT}`);
});
