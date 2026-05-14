import { useState, FormEvent } from 'react';
import { aiApi } from '../../lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface InquiryForm {
  senderName: string;
  email: string;
  phone: string;
  message: string;
  propertyAddress: string;
  source: string;
}

interface TimeSlot {
  date: string;
  time: string;
}

interface InquiryResponse {
  intent?: string;
  priority?: 'high' | 'medium' | 'low';
  subject?: string;
  response?: string;
  body?: string;
  followUpHours?: number;
  followUpTiming?: string;
  autoBooking?: boolean;
  availableSlots?: TimeSlot[];
  [key: string]: unknown;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2"
        strokeDasharray="28" strokeDashoffset="10" />
    </svg>
  );
}

function IntentBadge({ intent }: { intent: string }) {
  const styles: Record<string, string> = {
    showing_request:  'bg-purple-500/20 text-purple-400 border-purple-500/30',
    price_inquiry:    'bg-amber-500/20 text-amber-400 border-amber-500/30',
    agent_request:    'bg-blue-500/20 text-blue-400 border-blue-500/30',
    general_inquiry:  'bg-slate-500/20 text-slate-400 border-slate-500/30',
    open_house:       'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    mortgage_inquiry: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    offer_interest:   'bg-red-500/20 text-red-400 border-red-500/30',
  };
  const cls = styles[intent] ?? 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  const label = intent.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority?: string }) {
  const styles: Record<string, string> = {
    high:   'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low:    'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  const cls = styles[priority ?? 'low'] ?? styles.low;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {(priority ?? 'low').charAt(0).toUpperCase() + (priority ?? 'low').slice(1)} Priority
    </span>
  );
}

// ── Copy Button ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button onClick={handleCopy}
      className="btn-secondary text-xs flex items-center gap-1.5 shrink-0">
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 8l4 4 8-8" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="5" width="9" height="9" rx="1" strokeLinecap="round" />
            <path strokeLinecap="round" d="M5 5V4a1 1 0 011-1h6a1 1 0 011 1v7a1 1 0 01-1 1h-1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

// ── Initial form state ────────────────────────────────────────────────────────

const INITIAL_FORM: InquiryForm = {
  senderName: '',
  email: '',
  phone: '',
  message: '',
  propertyAddress: '',
  source: 'Website',
};

// ── Stat Cards ────────────────────────────────────────────────────────────────

const STAT_CARDS = [
  { label: 'Intents Detected', value: '1,284', sub: 'This month', color: 'text-blue-400' },
  { label: 'Avg Priority Score', value: 'Medium', sub: '62% high priority', color: 'text-amber-400' },
  { label: 'Auto-Booked', value: '38%', sub: 'Showing requests', color: 'text-emerald-400' },
  { label: 'Avg Follow-Up', value: '4.2 hrs', sub: 'Response window', color: 'text-purple-400' },
];

// ── Main Component ────────────────────────────────────────────────────────────

export default function Communications() {
  const [form, setForm] = useState<InquiryForm>(INITIAL_FORM);
  const [processing, setProcessing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<InquiryResponse | null>(null);

  function setField<K extends keyof InquiryForm>(key: K, value: InquiryForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (formError) setFormError(null);
  }

  async function handleProcessInquiry(e: FormEvent) {
    e.preventDefault();
    if (!form.message.trim()) { setFormError('Message is required.'); return; }

    setProcessing(true);
    setFormError(null);
    setResult(null);
    try {
      const payload = {
        senderName: form.senderName.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        message: form.message.trim(),
        propertyAddress: form.propertyAddress.trim() || undefined,
        source: form.source,
      };
      const res = await aiApi.handleInquiry(payload);
      const data = res.data as { response?: InquiryResponse } | InquiryResponse;
      const resp: InquiryResponse =
        ('response' in data && data.response) ? data.response : (data as InquiryResponse);
      setResult(resp);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Failed to process inquiry. Please try again.';
      setFormError(msg);
    } finally {
      setProcessing(false);
    }
  }

  const responseBody = result?.response ?? result?.body ?? '';
  const followUpText = result?.followUpTiming
    ?? (result?.followUpHours != null ? `Follow up in ${result.followUpHours} hours` : null);

  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="page-title">Auto-Response</h1>
        <p className="page-sub">Intelligent inquiry handling</p>
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Form — 2 cols */}
        <div className="lg:col-span-2 card p-6 space-y-5">
          <div>
            <p className="section-title">Inquiry Simulator</p>
            <p className="text-sm text-[#8899bb]">Submit an inquiry to see the AI auto-response</p>
          </div>

          <form onSubmit={handleProcessInquiry} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="label" htmlFor="cm-name">Sender Name</label>
                <input id="cm-name" type="text" className="input"
                  placeholder="Alex Johnson" value={form.senderName}
                  onChange={(e) => setField('senderName', e.target.value)} disabled={processing} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="cm-email">Email</label>
                  <input id="cm-email" type="email" className="input"
                    placeholder="alex@email.com" value={form.email}
                    onChange={(e) => setField('email', e.target.value)} disabled={processing} />
                </div>
                <div>
                  <label className="label" htmlFor="cm-phone">Phone</label>
                  <input id="cm-phone" type="tel" className="input"
                    placeholder="(555) 123-4567" value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)} disabled={processing} />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="cm-msg">Message *</label>
                <textarea id="cm-msg" rows={4} className="input resize-none"
                  placeholder="Hi, I saw the listing at 4521 Cactus Rd and I'd love to schedule a showing this weekend. Is it still available?"
                  value={form.message}
                  onChange={(e) => setField('message', e.target.value)} disabled={processing} />
              </div>

              <div>
                <label className="label" htmlFor="cm-addr">Property Address</label>
                <input id="cm-addr" type="text" className="input"
                  placeholder="4521 Cactus Rd, Scottsdale, AZ" value={form.propertyAddress}
                  onChange={(e) => setField('propertyAddress', e.target.value)} disabled={processing} />
              </div>

              <div>
                <label className="label" htmlFor="cm-source">Source</label>
                <select id="cm-source" className="select" value={form.source}
                  onChange={(e) => setField('source', e.target.value)} disabled={processing}>
                  {['Website', 'Zillow', 'Redfin', 'Trulia', 'Realtor.com', 'Referral', 'Instagram', 'Facebook', 'Google', 'Direct'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {formError && (
              <div className="px-3 py-2 bg-red-500/10 border border-red-500/25 rounded-lg">
                <p className="text-xs text-red-400">{formError}</p>
              </div>
            )}

            <button type="submit"
              className={`btn-primary w-full flex items-center justify-center gap-2 py-2.5 ${processing ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={processing}>
              {processing ? <><SpinnerIcon /> Processing…</> : 'Process Inquiry'}
            </button>

            {result && (
              <button type="button" className="btn-secondary w-full text-xs"
                onClick={() => { setForm(INITIAL_FORM); setResult(null); }}>
                Clear &amp; New Inquiry
              </button>
            )}
          </form>
        </div>

        {/* Result — 3 cols */}
        <div className="lg:col-span-3 space-y-4">
          {!result && !processing && (
            <div className="card p-12 flex flex-col items-center justify-center gap-3 text-center min-h-[400px]">
              <div className="w-14 h-14 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                <svg className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <p className="text-sm text-[#8899bb] max-w-xs">Submit an inquiry to see the AI-generated auto-response, intent detection, and follow-up schedule.</p>
            </div>
          )}

          {processing && (
            <div className="card p-12 flex flex-col items-center justify-center gap-4 min-h-[400px]">
              <SpinnerIcon />
              <p className="text-sm text-[#8899bb]">Analyzing inquiry and generating response…</p>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-slide-in">

              {/* Intent + Priority row */}
              <div className="card p-4 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap flex-1">
                  {result.intent && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#8899bb]">Intent:</span>
                      <IntentBadge intent={result.intent} />
                    </div>
                  )}
                  {result.priority && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#8899bb]">Priority:</span>
                      <PriorityBadge priority={result.priority} />
                    </div>
                  )}
                </div>
              </div>

              {/* Subject */}
              {result.subject && (
                <div className="card p-4 space-y-1">
                  <p className="label">Subject Line</p>
                  <p className="text-sm font-semibold text-[#f0f4ff]">{result.subject}</p>
                </div>
              )}

              {/* Response Body */}
              {responseBody && (
                <div className="card p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="label mb-0">Response Body</p>
                    <CopyButton text={responseBody} />
                  </div>
                  <div className="bg-[#141d35] border border-[#1e2d4a] rounded-lg p-4">
                    <p className="text-sm text-[#f0f4ff] leading-relaxed whitespace-pre-wrap">
                      {responseBody}
                    </p>
                  </div>
                </div>
              )}

              {/* Follow-up Timing */}
              {followUpText && (
                <div className="card p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-[#8899bb]">Follow-up Timing</p>
                    <p className="text-sm font-semibold text-[#f0f4ff]">{followUpText}</p>
                  </div>
                </div>
              )}

              {/* Available Slots */}
              {result.autoBooking && result.availableSlots && result.availableSlots.length > 0 && (
                <div className="card p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="badge-active">
                      <span className="agent-pulse" />
                      Auto-Booking Available
                    </span>
                  </div>
                  <p className="label">Available Time Slots</p>
                  <div className="grid grid-cols-2 gap-2">
                    {result.availableSlots.map((slot, i) => (
                      <div key={i} className="bg-[#141d35] border border-[#1e2d4a] rounded-lg px-3 py-2">
                        <p className="text-xs font-semibold text-[#f0f4ff]">{slot.date}</p>
                        <p className="text-xs text-[#8899bb]">{slot.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="divider" />

      {/* ── Response Stats ──────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <p className="section-title">Response Stats</p>
          <p className="text-sm text-[#8899bb]">Auto-response agent performance metrics</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((s) => (
            <div key={s.label} className="card p-5 space-y-2">
              <p className="text-xs font-medium text-[#8899bb] uppercase tracking-wide">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-[#8899bb]">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
