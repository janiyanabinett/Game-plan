import { useEffect, useState, FormEvent } from 'react';
import { aiApi, agentsApi } from '../../lib/api';
import type { Lead, LeadTier, LeadIntent } from '../../types/index';

// ── Types ─────────────────────────────────────────────────────────────────────

interface QualifyForm {
  name: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  timeframe: string;
}

const INITIAL_FORM: QualifyForm = {
  name: '',
  email: '',
  phone: '',
  message: '',
  source: 'Website',
  timeframe: 'Immediately',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function tierColor(tier: LeadTier | undefined): {
  ring: string;
  text: string;
  bg: string;
  border: string;
} {
  switch (tier) {
    case 'hot':
      return {
        ring: 'stroke-red-500',
        text: 'text-red-400',
        bg: 'bg-red-500/15',
        border: 'border-red-500/30',
      };
    case 'warm':
      return {
        ring: 'stroke-amber-500',
        text: 'text-amber-400',
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/30',
      };
    default:
      return {
        ring: 'stroke-blue-500',
        text: 'text-blue-400',
        bg: 'bg-blue-500/15',
        border: 'border-blue-500/30',
      };
  }
}

function TierBadge({ tier }: { tier: LeadTier | undefined }) {
  if (!tier) return null;
  const cls =
    tier === 'hot' ? 'badge-hot' :
    tier === 'warm' ? 'badge-warm' :
    'badge-cold';
  return (
    <span className={cls}>
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </span>
  );
}

function IntentBadge({ intent }: { intent: LeadIntent | undefined }) {
  if (!intent || intent === 'unknown') return null;
  const styles: Record<string, string> = {
    buyer: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    seller: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    both: 'bg-[#c9a84c]/15 text-[#c9a84c] border-[#c9a84c]/30',
  };
  const cls = styles[intent] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}
    >
      {intent.charAt(0).toUpperCase() + intent.slice(1)}
    </span>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1e2d4a]/60 rounded-lg ${className ?? ''}`} />;
}

// ── Score Circle ──────────────────────────────────────────────────────────────

function ScoreCircle({ score, tier }: { score: number; tier: LeadTier | undefined }) {
  const colors = tierColor(tier);
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (Math.min(100, score) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
        {/* track */}
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#1e2d4a" strokeWidth="6" />
        {/* progress arc */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          className={`${colors.ring} transition-all duration-700`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-xl font-bold leading-none ${colors.text}`}>{score}</span>
        <span className="text-[10px] text-[#8899bb] mt-0.5">score</span>
      </div>
    </div>
  );
}

// ── Score bar (inline) ────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const barColor =
    score >= 70 ? 'bg-red-500' :
    score >= 40 ? 'bg-amber-500' :
    'bg-blue-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#1e2d4a] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
      <span className="text-xs text-[#8899bb] w-6 text-right tabular-nums shrink-0">
        {score}
      </span>
    </div>
  );
}

// ── Sample Lead Card ──────────────────────────────────────────────────────────

function SampleLeadCard({ lead }: { lead: Lead }) {
  const colors = tierColor(lead.tier);
  return (
    <div className={`card p-4 space-y-2.5 border ${colors.border} ${colors.bg}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#f0f4ff] truncate">{lead.name}</p>
          <p className="text-xs text-[#8899bb] truncate">{lead.email}</p>
        </div>
        <TierBadge tier={lead.tier} />
      </div>

      {lead.score !== undefined && <ScoreBar score={lead.score} />}

      <div className="flex items-center justify-between text-xs">
        <span className="text-[#8899bb]">
          Source: <span className="text-[#f0f4ff]">{lead.source ?? '—'}</span>
        </span>
        {lead.timeframe && (
          <span className="text-[#8899bb]">{lead.timeframe}</span>
        )}
      </div>

      {lead.recommendedAction && (
        <p className="text-xs text-[#8899bb] bg-[#141d35] rounded-md px-2.5 py-1.5 leading-relaxed">
          {lead.recommendedAction}
        </p>
      )}
    </div>
  );
}

// ── Qualification Result Card ─────────────────────────────────────────────────

function QualifyResultCard({ lead }: { lead: Lead }) {
  const colors = tierColor(lead.tier);

  return (
    <div className={`card border ${colors.border} p-5 space-y-5 animate-slide-in`}>

      {/* top row: score circle + meta */}
      <div className="flex items-center gap-5">
        <ScoreCircle score={lead.score ?? 0} tier={lead.tier} />
        <div className="space-y-1.5">
          <p className="text-lg font-semibold text-[#f0f4ff]">{lead.name}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <TierBadge tier={lead.tier} />
            <IntentBadge intent={lead.intent} />
          </div>
          <p className="text-xs text-[#8899bb]">{lead.email}</p>
        </div>
      </div>

      <div className="divider" />

      {/* recommended action */}
      {lead.recommendedAction && (
        <div>
          <p className="label">Recommended Action</p>
          <p className={`text-sm font-medium ${colors.text} bg-[#141d35] px-3 py-2 rounded-lg border ${colors.border}`}>
            {lead.recommendedAction}
          </p>
        </div>
      )}

      {/* budget */}
      {lead.budget && lead.budget.length > 0 && (
        <div>
          <p className="label">Budget Range</p>
          <div className="flex flex-wrap gap-1.5">
            {lead.budget.map((b, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 bg-[#141d35] border border-[#1e2d4a] rounded-md text-[#f0f4ff]"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* scoring factors */}
      {lead.scoringFactors && lead.scoringFactors.length > 0 && (
        <div>
          <p className="label">Scoring Factors</p>
          <ul className="space-y-1.5">
            {lead.scoringFactors.map((factor, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[#8899bb]">
                <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${colors.bg.replace('/15', '')} border ${colors.border}`} />
                {factor}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* qualified at */}
      {lead.qualifiedAt && (
        <p className="text-[10px] text-[#4a5e7a]">
          Qualified at {new Date(lead.qualifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
}

// ── Nurturing Tier Info ───────────────────────────────────────────────────────

interface NurtureTierInfo {
  tier: LeadTier;
  label: string;
  tagline: string;
  touchCount: number;
  windowDays: number;
  touches: string[];
  borderColor: string;
  iconBg: string;
  iconText: string;
  badgeClass: string;
}

const NURTURE_TIERS: NurtureTierInfo[] = [
  {
    tier: 'hot',
    label: 'Hot Leads',
    tagline: 'Score 70–100 • Immediate intent',
    touchCount: 5,
    windowDays: 7,
    touches: [
      'Day 1 — Personal call within 2 hours',
      'Day 2 — Personalized property matches via email',
      'Day 3 — Market report SMS',
      'Day 5 — Value-add follow-up call',
      'Day 7 — Exclusive listing preview invite',
    ],
    borderColor: 'border-red-500/30',
    iconBg: 'bg-red-500/15',
    iconText: 'text-red-400',
    badgeClass: 'badge-hot',
  },
  {
    tier: 'warm',
    label: 'Warm Leads',
    tagline: 'Score 40–69 • Active consideration',
    touchCount: 5,
    windowDays: 45,
    touches: [
      'Day 1 — Welcome email with market snapshot',
      'Day 7 — Curated listing newsletter',
      'Day 14 — Educational blog content',
      'Day 30 — Market update + personal check-in',
      'Day 45 — "Still looking?" re-engagement',
    ],
    borderColor: 'border-amber-500/30',
    iconBg: 'bg-amber-500/15',
    iconText: 'text-amber-400',
    badgeClass: 'badge-warm',
  },
  {
    tier: 'cold',
    label: 'Cold Leads',
    tagline: 'Score 0–39 • Future pipeline',
    touchCount: 5,
    windowDays: 90,
    touches: [
      'Day 1 — Welcome + resource guide email',
      'Day 21 — Market trends digest',
      'Day 45 — Homebuyer tips content',
      'Day 75 — Market update newsletter',
      'Day 90 — "Ready to move forward?" re-engagement',
    ],
    borderColor: 'border-blue-500/30',
    iconBg: 'bg-blue-500/15',
    iconText: 'text-blue-400',
    badgeClass: 'badge-cold',
  },
];

function NurtureTierCard({ info }: { info: NurtureTierInfo }) {
  return (
    <div className={`card border ${info.borderColor} p-5 space-y-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={info.badgeClass}>{info.label}</span>
          </div>
          <p className="text-xs text-[#8899bb]">{info.tagline}</p>
        </div>
        <div className={`shrink-0 rounded-xl px-3 py-2 ${info.iconBg} border ${info.borderColor} text-center`}>
          <p className={`text-xl font-bold leading-none ${info.iconText}`}>{info.touchCount}</p>
          <p className="text-[10px] text-[#8899bb] mt-0.5">touches</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-[#8899bb]">
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
          <path fillRule="evenodd" d="M5.5 0A.5.5 0 0 1 6 .5V2h4V.5a.5.5 0 0 1 1 0V2h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h1V.5A.5.5 0 0 1 3.5 0Zm.5 4H3a1 1 0 0 0-1 1v1h12V5a1 1 0 0 0-1-1H3Zm9 3H2v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7Z" clipRule="evenodd" />
        </svg>
        <span>
          {info.touchCount}-touch sequence over{' '}
          <span className={`font-medium ${info.iconText}`}>{info.windowDays} days</span>
        </span>
      </div>

      <ul className="space-y-2">
        {info.touches.map((touch, i) => (
          <li key={i} className="flex items-start gap-2.5 text-xs text-[#8899bb]">
            <span
              className={`mt-0.5 flex items-center justify-center w-4 h-4 rounded-full shrink-0 ${info.iconBg} ${info.iconText} text-[10px] font-bold border ${info.borderColor}`}
            >
              {i + 1}
            </span>
            <span className="leading-relaxed">{touch}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function LeadCenter() {
  // ── form state ────────────────────────────────────────────────────────────
  const [form, setForm]             = useState<QualifyForm>(INITIAL_FORM);
  const [qualifying, setQualifying] = useState(false);
  const [formError, setFormError]   = useState<string | null>(null);
  const [result, setResult]         = useState<Lead | null>(null);

  // ── sample leads state ────────────────────────────────────────────────────
  const [samples, setSamples]           = useState<Lead[]>([]);
  const [samplesLoading, setSamplesLoading] = useState(true);
  const [samplesError, setSamplesError]   = useState<string | null>(null);

  // ── load sample leads on mount ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    agentsApi.getSampleLeads(5)
      .then((res) => {
        if (cancelled) return;
        const payload = res.data as { leads?: Lead[] } | Lead[];
        const list = Array.isArray(payload)
          ? payload
          : (payload as { leads?: Lead[] }).leads ?? [];
        setSamples(list);
      })
      .catch(() => {
        if (!cancelled) setSamplesError('Could not load sample leads.');
      })
      .finally(() => {
        if (!cancelled) setSamplesLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // ── form field updater ────────────────────────────────────────────────────
  function setField<K extends keyof QualifyForm>(key: K, value: QualifyForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (formError) setFormError(null);
  }

  // ── submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      setFormError('Name is required.');
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setFormError('A valid email address is required.');
      return;
    }

    setQualifying(true);
    setFormError(null);
    setResult(null);

    try {
      const res = await aiApi.qualifyLead({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        message: form.message.trim() || undefined,
        source: form.source,
        timeframe: form.timeframe,
      });
      const payload = res.data as { lead?: Lead } | Lead;
      const lead: Lead =
        'lead' in payload && payload.lead ? payload.lead : (payload as Lead);
      setResult(lead);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })
          ?.response?.data?.error ??
        'Qualification failed. Please try again.';
      setFormError(message);
    } finally {
      setQualifying(false);
    }
  }

  function handleReset() {
    setForm(INITIAL_FORM);
    setResult(null);
    setFormError(null);
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="page-title">Lead Center</h1>
        <p className="page-sub">AI-powered qualification &amp; nurturing</p>
      </div>

      {/* ── Main Two-Column Area ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Qualification Form (2/3) ───────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="section-title">Qualify a Lead</p>
                <p className="section-sub">
                  Submit prospect details for instant AI scoring
                </p>
              </div>
              {result && (
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={handleReset}
                >
                  New Lead
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Row 1: Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="lc-name">Name *</label>
                  <input
                    id="lc-name"
                    type="text"
                    className="input"
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    disabled={qualifying}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="lc-email">Email *</label>
                  <input
                    id="lc-email"
                    type="email"
                    className="input"
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    disabled={qualifying}
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Row 2: Phone + Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="lc-phone">Phone</label>
                  <input
                    id="lc-phone"
                    type="tel"
                    className="input"
                    placeholder="(555) 000-1234"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    disabled={qualifying}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="lc-source">Lead Source</label>
                  <select
                    id="lc-source"
                    className="select"
                    value={form.source}
                    onChange={(e) => setField('source', e.target.value)}
                    disabled={qualifying}
                  >
                    {['Website', 'Zillow', 'Redfin', 'Referral', 'Instagram', 'Facebook', 'Google'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Timeframe */}
              <div>
                <label className="label" htmlFor="lc-timeframe">Purchase / Sale Timeframe</label>
                <select
                  id="lc-timeframe"
                  className="select"
                  value={form.timeframe}
                  onChange={(e) => setField('timeframe', e.target.value)}
                  disabled={qualifying}
                >
                  {['Immediately', '30 days', '60 days', '90 days', '1 year+'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Row 4: Message */}
              <div>
                <label className="label" htmlFor="lc-message">Message / Notes</label>
                <textarea
                  id="lc-message"
                  rows={4}
                  className="input resize-none"
                  placeholder="What brought them to you? What are they looking for?"
                  value={form.message}
                  onChange={(e) => setField('message', e.target.value)}
                  disabled={qualifying}
                />
              </div>

              {/* error */}
              {formError && (
                <div className="px-3 py-2 bg-red-500/10 border border-red-500/25 rounded-lg">
                  <p className="text-xs text-red-400">{formError}</p>
                </div>
              )}

              {/* submit */}
              <button
                type="submit"
                className={`btn-primary w-full flex items-center justify-center gap-2 py-2.5 ${
                  qualifying ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                disabled={qualifying}
              >
                {qualifying ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <circle
                        cx="8" cy="8" r="6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="28"
                        strokeDashoffset="10"
                      />
                    </svg>
                    Qualifying…
                  </>
                ) : (
                  'Qualify Lead'
                )}
              </button>
            </form>
          </div>

          {/* Qualification Result */}
          {result && <QualifyResultCard lead={result} />}
        </div>

        {/* ── Right: Sample Leads (1/3) ─────────────────────────────────────── */}
        <div className="space-y-4">
          <div>
            <p className="section-title">Sample Leads</p>
            <p className="section-sub">Recent AI-qualified prospects</p>
          </div>

          {samplesLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          ) : samplesError ? (
            <div className="card p-4 border border-red-500/25 bg-red-500/10">
              <p className="text-xs text-red-400">{samplesError}</p>
            </div>
          ) : samples.length === 0 ? (
            <div className="card p-5 text-center">
              <p className="text-sm text-[#8899bb]">No sample leads available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {samples.map((lead, i) => (
                <SampleLeadCard key={lead.id ?? i} lead={lead} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Nurturing Sequences ─────────────────────────────────────────────── */}
      <div>
        <div className="mb-5">
          <p className="section-title">Nurturing Sequences</p>
          <p className="section-sub">
            Automated multi-touch campaigns tailored to each lead's engagement tier
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {NURTURE_TIERS.map((info) => (
            <NurtureTierCard key={info.tier} info={info} />
          ))}
        </div>

        {/* sequence explanation footer */}
        <div className="mt-5 card p-5 border border-[#1e2d4a]">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#c9a84c]/15 border border-[#c9a84c]/30 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-[#c9a84c]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#f0f4ff]">
                Fully Automated by PropAI
              </p>
              <p className="text-xs text-[#8899bb] leading-relaxed max-w-2xl">
                Once a lead is qualified, the AI auto-enrolls them into the appropriate nurturing
                sequence based on their tier score. All touchpoints are personalized using the lead's
                details, property preferences, and local market data. Sequences are managed by the
                <span className="text-amber-400 font-medium"> Lead Nurturing Agent</span> and
                <span className="text-cyan-400 font-medium"> Auto-Response Agent</span> working in
                tandem — no manual effort required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
