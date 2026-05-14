import { useEffect, useState, FormEvent } from 'react';
import { crmApi } from '../../lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CRMStatus {
  connected: boolean;
  provider?: string;
  mode?: string;
  message?: string;
}

interface CRMContact {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  lead_status?: string;
  leadStatus?: string;
  source?: string;
  createdAt?: string;
}

interface CRMDeal {
  id?: string;
  dealname?: string;
  name?: string;
  amount?: number;
  dealstage?: string;
  stage?: string;
  closedate?: string;
  createdAt?: string;
}

interface CRMActivity {
  id?: string;
  type?: string;
  subject?: string;
  note?: string;
  body?: string;
  timestamp?: string;
  createdAt?: string;
  contactName?: string;
  agent?: string;
}

type Tab = 'contacts' | 'deals' | 'activity';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function formatRelative(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2"
        strokeDasharray="28" strokeDashoffset="10" />
    </svg>
  );
}

function LeadStatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const styles: Record<string, string> = {
    new:          'bg-blue-500/20 text-blue-400 border-blue-500/30',
    open:         'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'in progress':'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'open deal':  'bg-purple-500/20 text-purple-400 border-purple-500/30',
    unqualified:  'bg-slate-500/20 text-slate-400 border-slate-500/30',
    connected:    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    hot:          'bg-red-500/20 text-red-400 border-red-500/30',
    warm:         'bg-amber-500/20 text-amber-400 border-amber-500/30',
    cold:         'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  const normalized = status.toLowerCase();
  const cls = styles[normalized] ?? 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {status}
    </span>
  );
}

// ── Contacts Tab ──────────────────────────────────────────────────────────────

interface ContactsTabProps {
  contacts: CRMContact[];
  loading: boolean;
  onAdd: (c: CRMContact) => void;
}

function ContactsTab({ contacts, loading, onAdd }: ContactsTabProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', lead_status: 'new', source: 'Website' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField(k: keyof typeof form, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
    if (error) setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.email.trim()) { setError('Email is required.'); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await crmApi.createContact(form);
      const data = res.data as { contact?: CRMContact } | CRMContact;
      const contact: CRMContact = ('contact' in data && data.contact) ? data.contact : (data as CRMContact);
      onAdd({ ...form, ...contact });
      setForm({ name: '', email: '', phone: '', lead_status: 'new', source: 'Website' });
    } catch {
      setError('Failed to create contact.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Contact Form */}
      <div className="card p-5">
        <p className="text-sm font-semibold text-[#f0f4ff] mb-4">Add Contact</p>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="crm-cn">Name *</label>
              <input id="crm-cn" type="text" className="input" placeholder="Jane Smith"
                value={form.name} onChange={(e) => setField('name', e.target.value)} disabled={saving} />
            </div>
            <div>
              <label className="label" htmlFor="crm-ce">Email *</label>
              <input id="crm-ce" type="email" className="input" placeholder="jane@example.com"
                value={form.email} onChange={(e) => setField('email', e.target.value)} disabled={saving} />
            </div>
            <div>
              <label className="label" htmlFor="crm-cp">Phone</label>
              <input id="crm-cp" type="tel" className="input" placeholder="(602) 555-0100"
                value={form.phone} onChange={(e) => setField('phone', e.target.value)} disabled={saving} />
            </div>
            <div>
              <label className="label" htmlFor="crm-cs">Source</label>
              <select id="crm-cs" className="select" value={form.source}
                onChange={(e) => setField('source', e.target.value)} disabled={saving}>
                {['Website', 'Zillow', 'Referral', 'Instagram', 'Facebook', 'Google', 'Direct'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="crm-cls">Lead Status</label>
              <select id="crm-cls" className="select" value={form.lead_status}
                onChange={(e) => setField('lead_status', e.target.value)} disabled={saving}>
                {['new', 'open', 'in progress', 'open deal', 'connected', 'unqualified', 'hot', 'warm', 'cold'].map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          {error && (
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/25 rounded-lg">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
          <button type="submit"
            className={`btn-primary flex items-center gap-2 ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={saving}>
            {saving ? <><SpinnerIcon /> Saving…</> : 'Add Contact'}
          </button>
        </form>
      </div>

      {/* Contacts List */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e2d4a] flex items-center justify-between">
          <p className="text-sm font-semibold text-[#f0f4ff]">Contacts ({contacts.length})</p>
        </div>
        {loading ? (
          <div className="p-8 flex items-center justify-center gap-3">
            <SpinnerIcon />
            <p className="text-sm text-[#8899bb]">Loading contacts…</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-[#8899bb]">No contacts yet. Add one above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e2d4a]">
                  {['Name', 'Email', 'Phone', 'Status', 'Source'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium text-[#8899bb] uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contacts.map((c, i) => (
                  <tr key={c.id ?? i} className="border-b border-[#1e2d4a]/50 last:border-0 hover:bg-[#141d35] transition-colors">
                    <td className="py-3 px-4 font-medium text-[#f0f4ff] whitespace-nowrap">{c.name}</td>
                    <td className="py-3 px-4 text-[#8899bb] truncate max-w-[180px]">{c.email}</td>
                    <td className="py-3 px-4 text-[#8899bb] whitespace-nowrap">{c.phone ?? '—'}</td>
                    <td className="py-3 px-4">
                      <LeadStatusBadge status={c.lead_status ?? c.leadStatus} />
                    </td>
                    <td className="py-3 px-4 text-[#8899bb] whitespace-nowrap">{c.source ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Deals Tab ─────────────────────────────────────────────────────────────────

interface DealsTabProps {
  deals: CRMDeal[];
  loading: boolean;
  onAdd: (d: CRMDeal) => void;
}

const DEAL_STAGES = ['Appointment Scheduled', 'Qualified To Buy', 'Presentation Scheduled',
  'Decision Maker Brought-In', 'Contract Sent', 'Closed Won', 'Closed Lost'];

function DealsTab({ deals, loading, onAdd }: DealsTabProps) {
  const [form, setForm] = useState({ dealname: '', amount: '', dealstage: 'Appointment Scheduled' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.dealname.trim()) { setError('Deal name is required.'); return; }
    setSaving(true);
    setError(null);
    try {
      const payload = { dealname: form.dealname.trim(), amount: form.amount ? Number(form.amount) : undefined, dealstage: form.dealstage };
      const res = await crmApi.createDeal(payload);
      const data = res.data as { deal?: CRMDeal } | CRMDeal;
      const deal: CRMDeal = ('deal' in data && data.deal) ? data.deal : (data as CRMDeal);
      onAdd({ ...payload, ...deal });
      setForm({ dealname: '', amount: '', dealstage: 'Appointment Scheduled' });
    } catch {
      setError('Failed to create deal.');
    } finally {
      setSaving(false);
    }
  }

  function stageColor(stage?: string): string {
    if (!stage) return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    if (stage.toLowerCase().includes('won') || stage.toLowerCase().includes('closed won'))
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (stage.toLowerCase().includes('lost'))
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (stage.toLowerCase().includes('contract'))
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <p className="text-sm font-semibold text-[#f0f4ff] mb-4">Add Deal</p>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="crm-dn">Deal Name *</label>
              <input id="crm-dn" type="text" className="input" placeholder="Johnson Home Purchase"
                value={form.dealname} onChange={(e) => setForm((p) => ({ ...p, dealname: e.target.value }))} disabled={saving} />
            </div>
            <div>
              <label className="label" htmlFor="crm-da">Amount ($)</label>
              <input id="crm-da" type="number" className="input" placeholder="750000"
                value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} disabled={saving} min={0} />
            </div>
            <div className="col-span-2">
              <label className="label" htmlFor="crm-ds">Deal Stage</label>
              <select id="crm-ds" className="select" value={form.dealstage}
                onChange={(e) => setForm((p) => ({ ...p, dealstage: e.target.value }))} disabled={saving}>
                {DEAL_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {error && (
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/25 rounded-lg">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
          <button type="submit"
            className={`btn-primary flex items-center gap-2 ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={saving}>
            {saving ? <><SpinnerIcon /> Saving…</> : 'Add Deal'}
          </button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e2d4a]">
          <p className="text-sm font-semibold text-[#f0f4ff]">Deals ({deals.length})</p>
        </div>
        {loading ? (
          <div className="p-8 flex items-center justify-center gap-3"><SpinnerIcon /><p className="text-sm text-[#8899bb]">Loading deals…</p></div>
        ) : deals.length === 0 ? (
          <div className="p-8 text-center"><p className="text-sm text-[#8899bb]">No deals yet.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e2d4a]">
                  {['Deal Name', 'Amount', 'Stage', 'Created'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium text-[#8899bb] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deals.map((d, i) => {
                  const name = d.dealname ?? d.name ?? '—';
                  const stage = d.dealstage ?? d.stage ?? '';
                  const created = d.closedate ?? d.createdAt;
                  return (
                    <tr key={d.id ?? i} className="border-b border-[#1e2d4a]/50 last:border-0 hover:bg-[#141d35] transition-colors">
                      <td className="py-3 px-4 font-medium text-[#f0f4ff]">{name}</td>
                      <td className="py-3 px-4 text-[#c9a84c] font-semibold">{d.amount ? formatCurrency(d.amount) : '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${stageColor(stage)}`}>
                          {stage || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#8899bb] whitespace-nowrap text-xs">
                        {created ? formatRelative(created) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Activity Tab ──────────────────────────────────────────────────────────────

interface ActivityTabProps {
  activities: CRMActivity[];
  loading: boolean;
}

function ActivityTab({ activities, loading }: ActivityTabProps) {
  const ACTIVITY_ICONS: Record<string, string> = {
    email: '✉️', call: '📞', meeting: '📅', note: '📝', task: '✅', sms: '💬',
  };

  if (loading) return (
    <div className="card p-8 flex items-center justify-center gap-3">
      <SpinnerIcon /><p className="text-sm text-[#8899bb]">Loading activity…</p>
    </div>
  );

  if (activities.length === 0) return (
    <div className="card p-8 text-center">
      <p className="text-sm text-[#8899bb]">No activity recorded yet.</p>
    </div>
  );

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1e2d4a]">
        <p className="text-sm font-semibold text-[#f0f4ff]">Activity Feed ({activities.length})</p>
      </div>
      <div className="divide-y divide-[#1e2d4a]">
        {activities.map((act, i) => {
          const type = act.type ?? 'note';
          const icon = ACTIVITY_ICONS[type.toLowerCase()] ?? '📋';
          const title = act.subject ?? act.note ?? act.body ?? 'Activity';
          const time = act.timestamp ?? act.createdAt;
          return (
            <div key={act.id ?? i} className="flex items-start gap-4 px-5 py-4 hover:bg-[#141d35] transition-colors">
              <div className="w-9 h-9 rounded-lg bg-[#141d35] border border-[#1e2d4a] flex items-center justify-center text-base shrink-0">
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-[#f0f4ff] leading-tight">{title}</p>
                    {act.contactName && (
                      <p className="text-xs text-[#8899bb] mt-0.5">{act.contactName}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1e2d4a] text-[#8899bb]">
                      {type}
                    </span>
                    {time && (
                      <p className="text-[10px] text-[#4a5e7a] mt-1">{formatRelative(time)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CRM() {
  const [crmStatus, setCRMStatus] = useState<CRMStatus | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('contacts');

  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [deals, setDeals] = useState<CRMDeal[]>([]);
  const [dealsLoading, setDealsLoading] = useState(false);
  const [activities, setActivities] = useState<CRMActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Load status on mount
  useEffect(() => {
    crmApi.getStatus()
      .then((res) => setCRMStatus(res.data as CRMStatus))
      .catch(() => setCRMStatus({ connected: false }));
  }, []);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'contacts' && contacts.length === 0) {
      setContactsLoading(true);
      crmApi.getContacts()
        .then((res) => {
          const data = res.data as { contacts?: CRMContact[] } | CRMContact[];
          setContacts(Array.isArray(data) ? data : (data as { contacts?: CRMContact[] }).contacts ?? []);
        })
        .catch(() => setContacts([]))
        .finally(() => setContactsLoading(false));
    }
    if (activeTab === 'deals' && deals.length === 0) {
      setDealsLoading(true);
      crmApi.getDeals()
        .then((res) => {
          const data = res.data as { deals?: CRMDeal[] } | CRMDeal[];
          setDeals(Array.isArray(data) ? data : (data as { deals?: CRMDeal[] }).deals ?? []);
        })
        .catch(() => setDeals([]))
        .finally(() => setDealsLoading(false));
    }
    if (activeTab === 'activity' && activities.length === 0) {
      setActivitiesLoading(true);
      crmApi.getActivities()
        .then((res) => {
          const data = res.data as { activities?: CRMActivity[] } | CRMActivity[];
          setActivities(Array.isArray(data) ? data : (data as { activities?: CRMActivity[] }).activities ?? []);
        })
        .catch(() => setActivities([]))
        .finally(() => setActivitiesLoading(false));
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const TABS: { id: Tab; label: string }[] = [
    { id: 'contacts', label: 'Contacts' },
    { id: 'deals', label: 'Deals' },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="page-title">CRM</h1>
        <p className="page-sub">Powered by HubSpot Free CRM</p>
      </div>

      {/* ── Connection Status Banner ────────────────────────────────────────── */}
      {crmStatus !== null && (
        crmStatus.connected ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <p className="text-sm font-medium text-emerald-400">
              Connected to HubSpot Free CRM
              {crmStatus.provider && <span className="text-emerald-300/60 font-normal ml-1">— {crmStatus.provider}</span>}
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
            <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-400">
                Using In-Memory CRM
              </p>
              <p className="text-xs text-amber-400/70 mt-0.5">
                Add <code className="bg-amber-500/20 px-1 rounded text-amber-300">HUBSPOT_ACCESS_TOKEN</code> to your environment to connect HubSpot.{' '}
                <a
                  href="https://www.hubspot.com/products/crm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-300 transition-colors"
                >
                  Free forever at hubspot.com
                </a>
              </p>
            </div>
          </div>
        )
      )}

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-1 p-1 bg-[#0f1629] border border-[#1e2d4a] rounded-xl w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-[#c9a84c] text-[#0a0e1a]'
                  : 'text-[#8899bb] hover:text-[#f0f4ff] hover:bg-[#141d35]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ────────────────────────────────────────────────────── */}
      <div>
        {activeTab === 'contacts' && (
          <ContactsTab
            contacts={contacts}
            loading={contactsLoading}
            onAdd={(c) => setContacts((prev) => [c, ...prev])}
          />
        )}
        {activeTab === 'deals' && (
          <DealsTab
            deals={deals}
            loading={dealsLoading}
            onAdd={(d) => setDeals((prev) => [d, ...prev])}
          />
        )}
        {activeTab === 'activity' && (
          <ActivityTab activities={activities} loading={activitiesLoading} />
        )}
      </div>
    </div>
  );
}
