import { useState, FormEvent } from 'react';
import { aiApi } from '../../lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

type LetterType =
  | 'buyer_intro'
  | 'offer_cover'
  | 'seller_outreach'
  | 'fsbo_outreach'
  | 'just_listed'
  | 'just_sold'
  | 'expired_listing'
  | 'anniversary';

interface LetterTypeConfig {
  id: LetterType;
  label: string;
  description: string;
  icon: string;
  fields: FieldConfig[];
}

interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'number';
  required?: boolean;
}

interface LetterResult {
  subject?: string;
  body?: string;
  letter?: string;
  wordCount?: number;
  format?: string;
  [key: string]: unknown;
}

// ── Letter type definitions ───────────────────────────────────────────────────

const LETTER_TYPES: LetterTypeConfig[] = [
  {
    id: 'buyer_intro',
    label: 'Buyer Intro',
    description: 'Introduce yourself to new buyer clients',
    icon: '🤝',
    fields: [
      { key: 'agentName',  label: 'Agent Name',   placeholder: 'Sarah Mitchell',      type: 'text', required: true },
      { key: 'agentPhone', label: 'Agent Phone',  placeholder: '(602) 555-0123',      type: 'text' },
      { key: 'agencyName', label: 'Agency Name',  placeholder: 'AZ Premier Realty',   type: 'text' },
      { key: 'buyerName',  label: 'Buyer Name',   placeholder: 'The Johnson Family',  type: 'text', required: true },
      { key: 'buyerCity',  label: 'Target City',  placeholder: 'Scottsdale',          type: 'text' },
    ],
  },
  {
    id: 'offer_cover',
    label: 'Offer Cover',
    description: 'Cover letter to accompany a purchase offer',
    icon: '📝',
    fields: [
      { key: 'buyerName',       label: 'Buyer Name',       placeholder: 'The Johnson Family',         type: 'text', required: true },
      { key: 'sellerName',      label: 'Seller Name',      placeholder: 'Mr. &amp; Mrs. Davis',       type: 'text' },
      { key: 'propertyAddress', label: 'Property Address', placeholder: '4521 Desert Sky Blvd',       type: 'text', required: true },
      { key: 'offerPrice',      label: 'Offer Price ($)',  placeholder: '785000',                     type: 'number' },
      { key: 'buyerStory',      label: 'Buyer Story',      placeholder: 'Share why this home is perfect — family, pets, hobbies, love of the neighborhood…', type: 'textarea' },
    ],
  },
  {
    id: 'seller_outreach',
    label: 'Seller Outreach',
    description: 'Reach homeowners ready to sell',
    icon: '🏡',
    fields: [
      { key: 'agentName',         label: 'Agent Name',           placeholder: 'Sarah Mitchell',      type: 'text', required: true },
      { key: 'homeownerName',     label: 'Homeowner Name',       placeholder: 'Mr. &amp; Mrs. Davis', type: 'text', required: true },
      { key: 'propertyAddress',   label: 'Property Address',     placeholder: '4521 Desert Sky Blvd', type: 'text' },
      { key: 'recentSaleAddress', label: 'Recent Sale Address',  placeholder: '4200 Sunrise Ct',      type: 'text' },
      { key: 'recentSalePrice',   label: 'Recent Sale Price ($)', placeholder: '820000',              type: 'number' },
      { key: 'neighborhood',      label: 'Neighborhood',         placeholder: 'McCormick Ranch',      type: 'text' },
    ],
  },
  {
    id: 'fsbo_outreach',
    label: 'FSBO Outreach',
    description: 'Connect with For-Sale-By-Owner sellers',
    icon: '🔑',
    fields: [
      { key: 'agentName',       label: 'Agent Name',       placeholder: 'Sarah Mitchell',      type: 'text', required: true },
      { key: 'sellerName',      label: 'Seller Name',      placeholder: 'Mr. &amp; Mrs. Davis', type: 'text', required: true },
      { key: 'propertyAddress', label: 'Property Address', placeholder: '4521 Desert Sky Blvd', type: 'text' },
      { key: 'agencyName',      label: 'Agency Name',      placeholder: 'AZ Premier Realty',   type: 'text' },
    ],
  },
  {
    id: 'just_listed',
    label: 'Just Listed',
    description: 'Announce a new listing to your sphere',
    icon: '🏠',
    fields: [
      { key: 'agentName',       label: 'Agent Name',       placeholder: 'Sarah Mitchell',      type: 'text', required: true },
      { key: 'recipientName',   label: 'Recipient Name',   placeholder: 'The Neighborhood',    type: 'text', required: true },
      { key: 'propertyAddress', label: 'Property Address', placeholder: '4521 Desert Sky Blvd', type: 'text', required: true },
      { key: 'listPrice',       label: 'List Price ($)',   placeholder: '785000',               type: 'number' },
      { key: 'beds',            label: 'Beds',             placeholder: '4',                   type: 'number' },
      { key: 'baths',           label: 'Baths',            placeholder: '3',                   type: 'number' },
    ],
  },
  {
    id: 'just_sold',
    label: 'Just Sold',
    description: 'Share a recent successful sale',
    icon: '🎉',
    fields: [
      { key: 'agentName',       label: 'Agent Name',       placeholder: 'Sarah Mitchell',      type: 'text', required: true },
      { key: 'recipientName',   label: 'Recipient Name',   placeholder: 'The Neighborhood',    type: 'text', required: true },
      { key: 'propertyAddress', label: 'Sold Property',    placeholder: '4521 Desert Sky Blvd', type: 'text', required: true },
      { key: 'salePrice',       label: 'Sale Price ($)',   placeholder: '795000',               type: 'number' },
      { key: 'daysOnMarket',    label: 'Days on Market',   placeholder: '12',                  type: 'number' },
    ],
  },
  {
    id: 'expired_listing',
    label: 'Expired Listing',
    description: 'Re-engage owners of expired listings',
    icon: '⏰',
    fields: [
      { key: 'agentName',       label: 'Agent Name',       placeholder: 'Sarah Mitchell',      type: 'text', required: true },
      { key: 'homeownerName',   label: 'Homeowner Name',   placeholder: 'Mr. &amp; Mrs. Davis', type: 'text', required: true },
      { key: 'propertyAddress', label: 'Property Address', placeholder: '4521 Desert Sky Blvd', type: 'text' },
      { key: 'agencyName',      label: 'Agency Name',      placeholder: 'AZ Premier Realty',   type: 'text' },
    ],
  },
  {
    id: 'anniversary',
    label: 'Anniversary',
    description: "Celebrate a client's home purchase anniversary",
    icon: '🎊',
    fields: [
      { key: 'agentName',       label: 'Agent Name',       placeholder: 'Sarah Mitchell',      type: 'text', required: true },
      { key: 'clientName',      label: 'Client Name',      placeholder: 'The Johnson Family',  type: 'text', required: true },
      { key: 'propertyAddress', label: 'Property Address', placeholder: '4521 Desert Sky Blvd', type: 'text' },
      { key: 'yearsOwned',      label: 'Years Owned',      placeholder: '3',                   type: 'number' },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2"
        strokeDasharray="28" strokeDashoffset="10" />
    </svg>
  );
}

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
      className="btn-secondary text-xs flex items-center gap-1.5">
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
            <rect x="3" y="5" width="9" height="9" rx="1" />
            <path strokeLinecap="round" d="M5 5V4a1 1 0 011-1h6a1 1 0 011 1v7a1 1 0 01-1 1h-1" />
          </svg>
          Copy Letter
        </>
      )}
    </button>
  );
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function LetterWriter() {
  const [selectedType, setSelectedType] = useState<LetterType | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<LetterResult | null>(null);

  const config = LETTER_TYPES.find((t) => t.id === selectedType) ?? null;

  function handleSelectType(type: LetterType) {
    if (type === selectedType) return;
    setSelectedType(type);
    setFormValues({});
    setResult(null);
    setFormError(null);
  }

  function setField(key: string, value: string) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    if (formError) setFormError(null);
  }

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    if (!selectedType || !config) return;

    const missingRequired = config.fields
      .filter((f) => f.required && !formValues[f.key]?.trim())
      .map((f) => f.label);
    if (missingRequired.length > 0) {
      setFormError(`Required: ${missingRequired.join(', ')}`);
      return;
    }

    setGenerating(true);
    setFormError(null);
    setResult(null);
    try {
      const vars: Record<string, string | number> = {};
      for (const field of config.fields) {
        const val = formValues[field.key] ?? '';
        if (val) vars[field.key] = field.type === 'number' ? Number(val) : val;
      }
      const res = await aiApi.generateLetter(selectedType, vars);
      const data = res.data as { letter?: LetterResult } | LetterResult;
      const letter: LetterResult =
        ('letter' in data && data.letter) ? data.letter : (data as LetterResult);
      setResult(letter);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Failed to generate letter. Please try again.';
      setFormError(msg);
    } finally {
      setGenerating(false);
    }
  }

  const letterBody = result?.body ?? result?.letter ?? '';
  const wordCount = result?.wordCount ?? (letterBody ? countWords(letterBody) : 0);
  const format = result?.format ?? 'Letter';

  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="page-title">Letter Writer</h1>
        <p className="page-sub">Personalized real estate letters for every occasion</p>
      </div>

      {/* ── Letter Type Selector ────────────────────────────────────────────── */}
      <div className="space-y-4">
        <p className="section-title">Choose Letter Type</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LETTER_TYPES.map((lt) => (
            <button
              key={lt.id}
              onClick={() => handleSelectType(lt.id)}
              className={`card-hover p-4 text-left transition-all duration-200 space-y-2 ${
                selectedType === lt.id
                  ? 'border-[#c9a84c] bg-[#c9a84c]/5 shadow-lg shadow-[#c9a84c]/10'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{lt.icon}</span>
                {selectedType === lt.id && (
                  <div className="w-5 h-5 rounded-full bg-[#c9a84c] flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#0a0e1a]" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <p className={`text-sm font-semibold leading-tight ${selectedType === lt.id ? 'text-[#c9a84c]' : 'text-[#f0f4ff]'}`}>
                  {lt.label}
                </p>
                <p className="text-xs text-[#8899bb] mt-0.5 leading-relaxed">{lt.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Dynamic Form + Result ───────────────────────────────────────────── */}
      {config && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-slide-in">

          {/* Form */}
          <div className="lg:col-span-2 card p-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{config.icon}</span>
                <p className="section-title">{config.label}</p>
              </div>
              <p className="text-sm text-[#8899bb]">{config.description}</p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4" noValidate>
              {config.fields.map((field) => (
                <div key={field.key}>
                  <label className="label" htmlFor={`lw-${field.key}`}>
                    {field.label}{field.required ? ' *' : ''}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={`lw-${field.key}`}
                      rows={4}
                      className="input resize-none"
                      placeholder={field.placeholder}
                      value={formValues[field.key] ?? ''}
                      onChange={(e) => setField(field.key, e.target.value)}
                      disabled={generating}
                    />
                  ) : (
                    <input
                      id={`lw-${field.key}`}
                      type={field.type === 'number' ? 'number' : 'text'}
                      className="input"
                      placeholder={field.placeholder}
                      value={formValues[field.key] ?? ''}
                      onChange={(e) => setField(field.key, e.target.value)}
                      disabled={generating}
                      min={field.type === 'number' ? 0 : undefined}
                    />
                  )}
                </div>
              ))}

              {formError && (
                <div className="px-3 py-2 bg-red-500/10 border border-red-500/25 rounded-lg">
                  <p className="text-xs text-red-400">{formError}</p>
                </div>
              )}

              <button type="submit"
                className={`btn-primary w-full flex items-center justify-center gap-2 py-2.5 ${generating ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={generating}>
                {generating ? <><SpinnerIcon /> Generating Letter…</> : 'Generate Letter'}
              </button>

              {result && (
                <button type="button" className="btn-secondary w-full text-xs"
                  onClick={() => { setResult(null); setFormValues({}); }}>
                  Generate New Letter
                </button>
              )}
            </form>
          </div>

          {/* Result */}
          <div className="lg:col-span-3 space-y-4">
            {!result && !generating && (
              <div className="card p-12 flex flex-col items-center justify-center gap-3 text-center min-h-[420px]">
                <span className="text-5xl">{config.icon}</span>
                <p className="text-sm text-[#8899bb] max-w-xs">
                  Fill in the fields and click <strong className="text-[#f0f4ff]">Generate Letter</strong> to create your personalized {config.label.toLowerCase()} letter.
                </p>
              </div>
            )}

            {generating && (
              <div className="card p-12 flex flex-col items-center justify-center gap-4 min-h-[420px]">
                <SpinnerIcon />
                <p className="text-sm text-[#8899bb]">Writing your personalized letter…</p>
              </div>
            )}

            {result && (
              <div className="space-y-4 animate-slide-in">

                {/* Meta row */}
                <div className="card p-4 flex items-center gap-3 flex-wrap">
                  {result.subject && (
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#8899bb] mb-0.5">Subject</p>
                      <p className="text-sm font-semibold text-[#f0f4ff] truncate">{result.subject}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30">
                      {wordCount} words
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {format}
                    </span>
                  </div>
                </div>

                {/* Letter Body */}
                {letterBody && (
                  <div className="card p-5 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="label mb-0">Letter Content</p>
                      <CopyButton text={letterBody} />
                    </div>
                    <div className="bg-[#141d35] border border-[#1e2d4a] rounded-lg p-5">
                      <p className="text-sm text-[#f0f4ff] leading-relaxed whitespace-pre-wrap font-mono">
                        {letterBody}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedType && (
        <div className="card p-10 text-center">
          <p className="text-sm text-[#8899bb]">Select a letter type above to get started.</p>
        </div>
      )}
    </div>
  );
}
