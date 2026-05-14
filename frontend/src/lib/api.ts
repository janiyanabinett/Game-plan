import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({ baseURL: BASE_URL });

// ── Agent / AI endpoints ─────────────────────────────────────────────────────
export const aiApi = {
  getDashboard: () => api.get('/api/ai/dashboard'),
  qualifyLead: (data: object) => api.post('/api/ai/qualify-lead', data),
  handleInquiry: (data: object) => api.post('/api/ai/inquiry', data),
  generateListingContent: (property: object, types?: string[]) =>
    api.post('/api/ai/listing-content', { property, types }),
  searchProperties: (criteria: object) => api.post('/api/ai/property-search', criteria),
  getProperty: (id: string) => api.get(`/api/ai/property/${id}`),
  matchToProfile: (profile: object) => api.post('/api/ai/property-match', { profile }),
  getMarketStats: (city: string) => api.get(`/api/ai/market-stats?city=${city}`),
  generateMedia: (type: string, property: object, options?: object) =>
    api.post('/api/ai/media', { type, property, options }),
  process3DMedia: (action: string, data?: object) =>
    api.post('/api/ai/3d-media', { action, data }),
  generateLetter: (type: string, vars: object) => api.post('/api/ai/letter', { type, vars }),
  autoRespond: (inquiry: object) => api.post('/api/ai/auto-respond', inquiry),
  buildCampaign: (listing: object, objective?: string, budget?: number, agentName?: string) =>
    api.post('/api/ai/campaign', { listing, objective, budget, agentName }),
  getSalesPipeline: () => api.get('/api/ai/sales-pipeline'),
  runResearchCycle: () => api.post('/api/ai/research/cycle'),
  getResearchStatus: () => api.get('/api/ai/research/status'),
};

// ── Agent management endpoints ───────────────────────────────────────────────
export const agentsApi = {
  getStatus: () => api.get('/api/agents/status'),
  getActivity: (limit?: number, agent?: string) =>
    api.get(`/api/agents/activity?limit=${limit || 50}${agent ? `&agent=${agent}` : ''}`),
  getMetrics: () => api.get('/api/agents/metrics'),
  triggerResearch: () => api.post('/api/agents/research/trigger'),
  getKnowledgeBase: () => api.get('/api/agents/research/knowledge-base'),
  getPipeline: () => api.get('/api/agents/sales/pipeline'),
  getCallScript: (dealId: string) => api.get(`/api/agents/sales/script/${dealId}`),
  getObjectionHandlers: (category?: string) =>
    api.get(`/api/agents/sales/objections${category ? `?category=${category}` : ''}`),
  getSampleLeads: (count?: number) =>
    api.get(`/api/agents/leads/samples?count=${count || 5}`),
};

// ── CRM endpoints ────────────────────────────────────────────────────────────
export const crmApi = {
  getStatus: () => api.get('/api/crm/status'),
  getContacts: () => api.get('/api/crm/contacts'),
  createContact: (data: object) => api.post('/api/crm/contacts', data),
  updateContact: (id: string, data: object) => api.put(`/api/crm/contacts/${id}`, data),
  getDeals: () => api.get('/api/crm/deals'),
  createDeal: (data: object) => api.post('/api/crm/deals', data),
  createNote: (data: object) => api.post('/api/crm/notes', data),
  getActivities: () => api.get('/api/crm/activities'),
  logActivity: (data: object) => api.post('/api/crm/activities', data),
};
