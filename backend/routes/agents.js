/**
 * Agent Management Routes
 * Exposes agent health, activity, metrics, and research hub endpoints.
 */

import { Router } from 'express';
import { AgentOrchestrator } from '../agents/AgentOrchestrator.js';

const router = Router();

// Shared orchestrator instance (in production, use a singleton/module-level export)
const orchestrator = new AgentOrchestrator();

// ── GET /api/agents/status ────────────────────────────────────────────────
router.get('/status', (req, res) => {
  try {
    const dashboard = orchestrator.getDashboard();
    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/agents/activity ──────────────────────────────────────────────
router.get('/activity', (req, res) => {
  const limit = Number(req.query.limit) || 50;
  const agentFilter = req.query.agent;
  let log = orchestrator.activityLog;
  if (agentFilter) log = log.filter(a => a.agent === agentFilter);
  res.json({ activity: log.slice(0, limit), total: log.length });
});

// ── GET /api/agents/metrics ───────────────────────────────────────────────
router.get('/metrics', (req, res) => {
  res.json({ metrics: orchestrator.metrics, generatedAt: new Date().toISOString() });
});

// ── POST /api/agents/research/trigger ─────────────────────────────────────
router.post('/research/trigger', (req, res) => {
  try {
    const report = orchestrator.runResearchCycle();
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/agents/research/knowledge-base ───────────────────────────────
router.get('/research/knowledge-base', (req, res) => {
  try {
    const kb = orchestrator.agents.research.getKnowledgeBase();
    res.json(kb);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/agents/sales/pipeline ────────────────────────────────────────
router.get('/sales/pipeline', (req, res) => {
  try {
    const result = orchestrator.getPipeline();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/agents/sales/script/:dealId ─────────────────────────────────
router.get('/sales/script/:dealId', (req, res) => {
  try {
    const script = orchestrator.agents.sales.generateCallScript(req.params.dealId);
    res.json(script);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/agents/sales/objections ─────────────────────────────────────
router.get('/sales/objections', (req, res) => {
  const { category = 'all' } = req.query;
  try {
    const handlers = orchestrator.agents.sales.getObjectionHandlers(category);
    res.json({ category, handlers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/agents/sales/forecast ──────────────────────────────────────
router.post('/sales/forecast', (req, res) => {
  try {
    const forecast = orchestrator.agents.sales.forecastGCI(req.body);
    res.json(forecast);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/agents/leads/samples ────────────────────────────────────────
router.get('/leads/samples', (req, res) => {
  const count = Number(req.query.count) || 5;
  try {
    const leads = orchestrator.agents.lead_generation.generateSampleLeads(count);
    res.json({ leads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
