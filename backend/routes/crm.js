/**
 * CRM Routes — HubSpot Free CRM Integration
 * Uses HubSpot's free forever tier via their v3 API.
 * Env vars needed: HUBSPOT_ACCESS_TOKEN
 *
 * Falls back to an in-memory CRM if no token is provided (great for demos).
 */

import { Router } from 'express';

const router = Router();

// In-memory fallback CRM (used when HUBSPOT_ACCESS_TOKEN is not set)
const inMemoryCRM = {
  contacts: [],
  deals: [],
  notes: [],
  activities: [],
};

const HUBSPOT_BASE = 'https://api.hubapi.com';
const useHubspot = () => !!process.env.HUBSPOT_ACCESS_TOKEN;

async function hubspotFetch(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${HUBSPOT_BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HubSpot API error ${res.status}: ${err}`);
  }
  return res.json();
}

// ── GET /api/crm/contacts ─────────────────────────────────────────────────
router.get('/contacts', async (req, res) => {
  try {
    if (useHubspot()) {
      const data = await hubspotFetch('/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email,phone,hs_lead_status,lifecyclestage');
      return res.json({ source: 'hubspot', contacts: data.results, total: data.total });
    }
    res.json({ source: 'in_memory', contacts: inMemoryCRM.contacts, total: inMemoryCRM.contacts.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/crm/contacts ────────────────────────────────────────────────
router.post('/contacts', async (req, res) => {
  const { firstname, lastname, email, phone, lead_status, source, notes } = req.body;
  if (!email && !phone) return res.status(400).json({ error: 'email or phone required' });

  try {
    if (useHubspot()) {
      const data = await hubspotFetch('/crm/v3/objects/contacts', 'POST', {
        properties: { firstname, lastname, email, phone,
          hs_lead_status: lead_status || 'NEW',
          lifecyclestage: 'lead',
          lead_source: source || 'Website',
        },
      });
      return res.json({ source: 'hubspot', contact: data });
    }

    // In-memory fallback
    const contact = {
      id: `contact-${Date.now()}`,
      properties: { firstname, lastname, email, phone, lead_status: lead_status || 'NEW', source, notes },
      createdAt: new Date().toISOString(),
    };
    inMemoryCRM.contacts.push(contact);
    res.json({ source: 'in_memory', contact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/crm/contacts/:id ─────────────────────────────────────────────
router.put('/contacts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (useHubspot()) {
      const data = await hubspotFetch(`/crm/v3/objects/contacts/${id}`, 'PATCH', { properties: req.body });
      return res.json({ source: 'hubspot', contact: data });
    }

    const contact = inMemoryCRM.contacts.find(c => c.id === id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    Object.assign(contact.properties, req.body);
    contact.updatedAt = new Date().toISOString();
    res.json({ source: 'in_memory', contact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/crm/deals ────────────────────────────────────────────────────
router.get('/deals', async (req, res) => {
  try {
    if (useHubspot()) {
      const data = await hubspotFetch('/crm/v3/objects/deals?limit=100&properties=dealname,amount,dealstage,closedate,pipeline');
      return res.json({ source: 'hubspot', deals: data.results, total: data.total });
    }
    res.json({ source: 'in_memory', deals: inMemoryCRM.deals, total: inMemoryCRM.deals.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/crm/deals ───────────────────────────────────────────────────
router.post('/deals', async (req, res) => {
  const { dealname, amount, dealstage, closedate, contactId } = req.body;
  if (!dealname) return res.status(400).json({ error: 'dealname required' });

  try {
    if (useHubspot()) {
      const body = {
        properties: { dealname, amount, dealstage: dealstage || 'appointmentscheduled',
          closedate: closedate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          pipeline: 'default' },
      };
      if (contactId) body.associations = [{ to: { id: contactId }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }] }];
      const data = await hubspotFetch('/crm/v3/objects/deals', 'POST', body);
      return res.json({ source: 'hubspot', deal: data });
    }

    const deal = { id: `deal-${Date.now()}`, properties: { dealname, amount, dealstage, closedate, contactId }, createdAt: new Date().toISOString() };
    inMemoryCRM.deals.push(deal);
    res.json({ source: 'in_memory', deal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/crm/notes ───────────────────────────────────────────────────
router.post('/notes', async (req, res) => {
  const { body: noteBody, contactId, dealId } = req.body;
  if (!noteBody) return res.status(400).json({ error: 'body required' });

  try {
    if (useHubspot()) {
      const payload = {
        properties: { hs_note_body: noteBody, hs_timestamp: new Date().toISOString() },
      };
      if (contactId) payload.associations = [{ to: { id: contactId }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }] }];
      const data = await hubspotFetch('/crm/v3/objects/notes', 'POST', payload);
      return res.json({ source: 'hubspot', note: data });
    }

    const note = { id: `note-${Date.now()}`, body: noteBody, contactId, dealId, createdAt: new Date().toISOString() };
    inMemoryCRM.notes.push(note);
    res.json({ source: 'in_memory', note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/crm/activities ───────────────────────────────────────────────
router.get('/activities', (req, res) => {
  res.json({ source: 'in_memory', activities: inMemoryCRM.activities, total: inMemoryCRM.activities.length });
});

// ── POST /api/crm/activities ──────────────────────────────────────────────
router.post('/activities', (req, res) => {
  const activity = { id: `act-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
  inMemoryCRM.activities.unshift(activity);
  if (inMemoryCRM.activities.length > 200) inMemoryCRM.activities.pop();
  res.json({ activity });
});

// ── GET /api/crm/status ───────────────────────────────────────────────────
router.get('/status', (req, res) => {
  res.json({
    connected: useHubspot(),
    provider: useHubspot() ? 'HubSpot Free CRM' : 'In-Memory CRM (set HUBSPOT_ACCESS_TOKEN to connect HubSpot)',
    setupUrl: 'https://app.hubspot.com/login',
    freeFeatures: ['Unlimited contacts', 'Deal pipeline', 'Contact notes', 'Email templates', 'Meeting scheduling', 'Live chat'],
    counts: { contacts: inMemoryCRM.contacts.length, deals: inMemoryCRM.deals.length, notes: inMemoryCRM.notes.length },
  });
});

export default router;
