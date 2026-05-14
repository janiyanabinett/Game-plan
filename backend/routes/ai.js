import { Router } from 'express';
import { AgentOrchestrator } from '../agents/AgentOrchestrator.js';
import { PropertySearchAgent } from '../agents/PropertySearchAgent.js';
import { MediaCreationAgent }  from '../agents/MediaCreationAgent.js';
import { ThreeDMediaAgent }    from '../agents/ThreeDMediaAgent.js';
import { LetterWritingAgent }  from '../agents/LetterWritingAgent.js';
import { AutoResponseAgent }   from '../agents/AutoResponseAgent.js';
import { MarketingAgent }      from '../agents/MarketingAgent.js';

const router = Router();

// Single orchestrator instance (stateful session)
const orchestrator = new AgentOrchestrator();
const propertySearch = new PropertySearchAgent();
const mediaAgent     = new MediaCreationAgent();
const threeDAgent    = new ThreeDMediaAgent();
const letterAgent    = new LetterWritingAgent();
const autoResponse   = new AutoResponseAgent();
const marketingAgent = new MarketingAgent();

// ── POST /api/ai/qualify-lead ─────────────────────────────────────────────
router.post('/qualify-lead', (req, res) => {
  const { name, email, phone, message, source, timeframe } = req.body;
  if (!email && !phone) return res.status(400).json({ error: 'email or phone required' });
  try {
    const result = orchestrator.qualifyLead({ name, email, phone, message, source, timeframe });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/ai/inquiry ──────────────────────────────────────────────────
router.post('/inquiry', (req, res) => {
  const inquiry = req.body;
  if (!inquiry.message) return res.status(400).json({ error: 'message required' });
  try {
    const result = orchestrator.handleInquiry(inquiry);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/ai/listing-content ──────────────────────────────────────────
router.post('/listing-content', (req, res) => {
  const { property, types } = req.body;
  if (!property) return res.status(400).json({ error: 'property required' });
  try {
    const result = orchestrator.generateListingContent(property, types);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET/POST /api/ai/property-search ─────────────────────────────────────
router.get('/property-search', (req, res) => {
  try {
    const criteria = { ...req.query };
    if (criteria.minPrice) criteria.minPrice = Number(criteria.minPrice);
    if (criteria.maxPrice) criteria.maxPrice = Number(criteria.maxPrice);
    if (criteria.minBeds) criteria.minBeds = Number(criteria.minBeds);
    if (criteria.minBaths) criteria.minBaths = Number(criteria.minBaths);
    if (criteria.minSqft) criteria.minSqft = Number(criteria.minSqft);
    if (criteria.pool === 'true') criteria.pool = true;
    if (criteria.page) criteria.page = Number(criteria.page);
    const result = propertySearch.search(criteria);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/property-search', (req, res) => {
  try {
    const result = propertySearch.search(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/ai/property/:id ──────────────────────────────────────────────
router.get('/property/:id', (req, res) => {
  const property = propertySearch.getById(req.params.id);
  if (!property) return res.status(404).json({ error: 'Property not found' });
  res.json(property);
});

// ── POST /api/ai/property-match ───────────────────────────────────────────
router.post('/property-match', (req, res) => {
  const { profile } = req.body;
  if (!profile) return res.status(400).json({ error: 'profile required' });
  try {
    const result = propertySearch.matchToProfile(profile);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/ai/market-stats ──────────────────────────────────────────────
router.get('/market-stats', (req, res) => {
  const { city = 'Scottsdale' } = req.query;
  try {
    const stats = propertySearch.marketStats(city);
    const report = marketingAgent.generateMarketReport(stats);
    res.json({ stats, report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/ai/media ────────────────────────────────────────────────────
router.post('/media', (req, res) => {
  const { type, property, options } = req.body;
  if (!property) return res.status(400).json({ error: 'property required' });
  try {
    const result = mediaAgent.generate(type || 'all', property, options || {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/ai/3d-media ─────────────────────────────────────────────────
router.post('/3d-media', (req, res) => {
  const { action, data } = req.body;
  if (!action) return res.status(400).json({ error: 'action required' });
  try {
    const result = threeDAgent.process(action, data || {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/ai/letter ───────────────────────────────────────────────────
router.post('/letter', (req, res) => {
  const { type, vars } = req.body;
  if (!type) return res.status(400).json({ error: 'type required' });
  try {
    const result = letterAgent.generate(type, vars || {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/ai/auto-respond ─────────────────────────────────────────────
router.post('/auto-respond', (req, res) => {
  const inquiry = req.body;
  if (!inquiry.message) return res.status(400).json({ error: 'message required' });
  try {
    const result = autoResponse.respond(inquiry);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/ai/campaign ─────────────────────────────────────────────────
router.post('/campaign', (req, res) => {
  const { listing, objective, budget, agentName } = req.body;
  if (!listing) return res.status(400).json({ error: 'listing required' });
  try {
    const result = orchestrator.buildCampaign(listing, { objective, budget, agentName });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/ai/sales-pipeline ────────────────────────────────────────────
router.get('/sales-pipeline', (req, res) => {
  try {
    const result = orchestrator.getPipeline();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/ai/research/cycle ───────────────────────────────────────────
router.post('/research/cycle', (req, res) => {
  try {
    const result = orchestrator.runResearchCycle();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/ai/research/status ───────────────────────────────────────────
router.get('/research/status', (req, res) => {
  try {
    const status = orchestrator.agents.research.getStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/ai/dashboard ─────────────────────────────────────────────────
router.get('/dashboard', (req, res) => {
  try {
    const dashboard = orchestrator.getDashboard();
    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
