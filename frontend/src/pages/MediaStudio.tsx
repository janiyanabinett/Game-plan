import { useState, useCallback } from 'react';
import { aiApi } from '../../lib/api';

// ── Types ──────────────────────────────────────────────────────────────────────

interface PropertyForm {
  address: string;
  city: string;
  state: string;
  beds: string;
  baths: string;
  sqft: string;
  price: string;
  style: string;
  pool: boolean;
  yearBuilt: string;
}

type ContentTypeKey =
  | 'listing'
  | 'social'
  | 'email'
  | 'ads'
  | 'flyer';

interface GeneratedContent {
  listing?: string;
  social?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  email?: {
    subject?: string;
    preheader?: string;
    body?: string;
  };
  ads?: {
    google?: { headline?: string; description?: string };
    facebook?: { headline?: string; body?: string };
  };
  flyer?: string;
}

interface PackageRecommendation {
  packageName?: string;
  priceRange?: string;
  includes?: string[];
  turnaround?: string;
  description?: string;
}

interface ShotListItem {
  room: string;
  shotType: string;
  notes: string;
  completed: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-[#1e2d4a]/60 rounded-lg ${className ?? ''}`}
    />
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className={`btn-secondary py-1 px-3 text-xs flex items-center gap-1.5 transition-all ${
        copied ? 'text-emerald-400' : ''
      }`}
    >
      {copied ? (
        <>
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8l4 4 6-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
            <rect
              x="5"
              y="5"
              width="8"
              height="8"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M3 11V3h8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

// ── Content Type Selector ──────────────────────────────────────────────────────

const CONTENT_TYPES: { key: ContentTypeKey; label: string; icon: string }[] = [
  { key: 'listing', label: 'Listing Description', icon: '📝' },
  { key: 'social', label: 'Social Posts', icon: '📱' },
  { key: 'email', label: 'Email Blast', icon: '✉️' },
  { key: 'ads', label: 'Ad Copy', icon: '📢' },
  { key: 'flyer', label: 'Open House Flyer', icon: '🏠' },
];

// ── Social Platform Card ───────────────────────────────────────────────────────

function SocialCard({
  platform,
  content,
}: {
  platform: string;
  content: string;
}) {
  const platformColors: Record<string, string> = {
    Instagram:
      'bg-pink-500/10 border-pink-500/20 text-pink-300',
    Facebook:
      'bg-blue-500/10 border-blue-500/20 text-blue-300',
    Twitter:
      'bg-sky-500/10 border-sky-500/20 text-sky-300',
    LinkedIn:
      'bg-indigo-500/10 border-indigo-500/20 text-indigo-300',
  };

  const cls =
    platformColors[platform] ??
    'bg-[#141d35] border-[#1e2d4a] text-[#8899bb]';

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${cls}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider">
          {platform}
        </span>
        <CopyButton text={content} />
      </div>
      <p className="text-sm text-[#f0f4ff] leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    </div>
  );
}

// ── Content Results Panel ──────────────────────────────────────────────────────

function ContentResults({
  content,
  selectedTypes,
}: {
  content: GeneratedContent;
  selectedTypes: ContentTypeKey[];
}) {
  const [activeTab, setActiveTab] = useState<ContentTypeKey>(
    selectedTypes[0] ?? 'listing'
  );

  const tabs = CONTENT_TYPES.filter((t) => selectedTypes.includes(t.key));

  return (
    <div className="card animate-slide-in">
      {/* Tab nav */}
      <div className="flex border-b border-[#1e2d4a] overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === t.key
                ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]'
                : 'text-[#8899bb] hover:text-[#f0f4ff]'
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* Listing Description */}
        {activeTab === 'listing' && content.listing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#f0f4ff]">
                Listing Description
              </p>
              <CopyButton text={content.listing} />
            </div>
            <div className="bg-[#141d35] rounded-xl p-4 border border-[#1e2d4a]">
              <p className="text-sm text-[#f0f4ff] leading-relaxed whitespace-pre-wrap">
                {content.listing}
              </p>
            </div>
          </div>
        )}

        {/* Social Posts */}
        {activeTab === 'social' && content.social && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-[#f0f4ff]">
              Social Media Posts
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.social.instagram && (
                <SocialCard
                  platform="Instagram"
                  content={content.social.instagram}
                />
              )}
              {content.social.facebook && (
                <SocialCard
                  platform="Facebook"
                  content={content.social.facebook}
                />
              )}
              {content.social.twitter && (
                <SocialCard
                  platform="Twitter"
                  content={content.social.twitter}
                />
              )}
              {content.social.linkedin && (
                <SocialCard
                  platform="LinkedIn"
                  content={content.social.linkedin}
                />
              )}
            </div>
          </div>
        )}

        {/* Email Blast */}
        {activeTab === 'email' && content.email && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-[#f0f4ff]">
              Email Campaign
            </p>
            {content.email.subject && (
              <div className="bg-[#141d35] rounded-xl p-4 border border-[#1e2d4a] flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-[10px] text-[#8899bb] uppercase tracking-wide mb-1">
                    Subject Line
                  </p>
                  <p className="text-sm font-semibold text-[#f0f4ff]">
                    {content.email.subject}
                  </p>
                </div>
                <CopyButton text={content.email.subject} />
              </div>
            )}
            {content.email.preheader && (
              <div className="bg-[#141d35] rounded-xl p-4 border border-[#1e2d4a] flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-[10px] text-[#8899bb] uppercase tracking-wide mb-1">
                    Preheader
                  </p>
                  <p className="text-sm text-[#f0f4ff]">
                    {content.email.preheader}
                  </p>
                </div>
                <CopyButton text={content.email.preheader} />
              </div>
            )}
            {content.email.body && (
              <div className="bg-[#141d35] rounded-xl p-4 border border-[#1e2d4a] space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-[#8899bb] uppercase tracking-wide">
                    Email Body
                  </p>
                  <CopyButton text={content.email.body} />
                </div>
                <p className="text-sm text-[#f0f4ff] leading-relaxed whitespace-pre-wrap">
                  {content.email.body}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Ad Copy */}
        {activeTab === 'ads' && content.ads && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-[#f0f4ff]">Ad Copy</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.ads.google && (
                <div className="bg-[#141d35] rounded-xl p-4 border border-[#1e2d4a] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">
                      Google Ad
                    </span>
                    <CopyButton
                      text={`${content.ads.google.headline ?? ''}\n${
                        content.ads.google.description ?? ''
                      }`}
                    />
                  </div>
                  {content.ads.google.headline && (
                    <div>
                      <p className="text-[10px] text-[#8899bb] uppercase tracking-wide mb-1">
                        Headline
                      </p>
                      <p className="text-sm font-semibold text-[#f0f4ff]">
                        {content.ads.google.headline}
                      </p>
                    </div>
                  )}
                  {content.ads.google.description && (
                    <div>
                      <p className="text-[10px] text-[#8899bb] uppercase tracking-wide mb-1">
                        Description
                      </p>
                      <p className="text-sm text-[#f0f4ff] leading-relaxed">
                        {content.ads.google.description}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {content.ads.facebook && (
                <div className="bg-[#141d35] rounded-xl p-4 border border-[#1e2d4a] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                      Facebook Ad
                    </span>
                    <CopyButton
                      text={`${content.ads.facebook.headline ?? ''}\n${
                        content.ads.facebook.body ?? ''
                      }`}
                    />
                  </div>
                  {content.ads.facebook.headline && (
                    <div>
                      <p className="text-[10px] text-[#8899bb] uppercase tracking-wide mb-1">
                        Headline
                      </p>
                      <p className="text-sm font-semibold text-[#f0f4ff]">
                        {content.ads.facebook.headline}
                      </p>
                    </div>
                  )}
                  {content.ads.facebook.body && (
                    <div>
                      <p className="text-[10px] text-[#8899bb] uppercase tracking-wide mb-1">
                        Body
                      </p>
                      <p className="text-sm text-[#f0f4ff] leading-relaxed">
                        {content.ads.facebook.body}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Open House Flyer */}
        {activeTab === 'flyer' && content.flyer && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#f0f4ff]">
                Open House Flyer Copy
              </p>
              <CopyButton text={content.flyer} />
            </div>
            <div className="bg-[#141d35] rounded-xl p-4 border border-[#1e2d4a]">
              <p className="text-sm text-[#f0f4ff] leading-relaxed whitespace-pre-wrap">
                {content.flyer}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab 1: Content Generator ───────────────────────────────────────────────────

function ContentGenerator() {
  const [form, setForm] = useState<PropertyForm>({
    address: '',
    city: '',
    state: '',
    beds: '',
    baths: '',
    sqft: '',
    price: '',
    style: 'modern',
    pool: false,
    yearBuilt: '',
  });

  const [selectedTypes, setSelectedTypes] = useState<ContentTypeKey[]>([
    'listing',
    'social',
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedContent | null>(null);

  function toggleType(key: ContentTypeKey) {
    setSelectedTypes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  const handleGenerate = useCallback(async () => {
    if (!form.address.trim() || !form.city.trim()) {
      setError('Address and city are required.');
      return;
    }
    if (selectedTypes.length === 0) {
      setError('Select at least one content type.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const propertyPayload = {
      address: form.address,
      city: form.city,
      state: form.state,
      beds: form.beds ? parseInt(form.beds, 10) : undefined,
      baths: form.baths ? parseFloat(form.baths) : undefined,
      sqft: form.sqft ? parseInt(form.sqft, 10) : undefined,
      price: form.price ? parseInt(form.price, 10) : undefined,
      style: form.style,
      pool: form.pool,
      yearBuilt: form.yearBuilt ? parseInt(form.yearBuilt, 10) : undefined,
    };

    try {
      const res = await aiApi.generateMedia('all', propertyPayload, {
        types: selectedTypes,
      });
      setResult(res.data as GeneratedContent);
    } catch {
      setError('Content generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [form, selectedTypes]);

  return (
    <div className="space-y-6">
      {/* Property Form */}
      <div className="card p-5">
        <p className="section-title text-sm mb-4">Property Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <input
              className="input"
              placeholder="123 Main St"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">City</label>
            <input
              className="input"
              placeholder="Austin"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">State</label>
            <input
              className="input"
              placeholder="TX"
              value={form.state}
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">Beds</label>
            <input
              className="input"
              type="number"
              min="0"
              placeholder="4"
              value={form.beds}
              onChange={(e) => setForm((f) => ({ ...f, beds: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">Baths</label>
            <input
              className="input"
              type="number"
              min="0"
              step="0.5"
              placeholder="2.5"
              value={form.baths}
              onChange={(e) => setForm((f) => ({ ...f, baths: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">Sqft</label>
            <input
              className="input"
              type="number"
              min="0"
              placeholder="2400"
              value={form.sqft}
              onChange={(e) => setForm((f) => ({ ...f, sqft: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">Price ($)</label>
            <input
              className="input"
              type="number"
              min="0"
              placeholder="550000"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">Style</label>
            <select
              className="select"
              value={form.style}
              onChange={(e) => setForm((f) => ({ ...f, style: e.target.value }))}
            >
              <option value="modern">Modern</option>
              <option value="luxury">Luxury</option>
              <option value="charming">Charming</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>

          <div>
            <label className="label">Year Built</label>
            <input
              className="input"
              type="number"
              min="1800"
              max="2025"
              placeholder="2015"
              value={form.yearBuilt}
              onChange={(e) =>
                setForm((f) => ({ ...f, yearBuilt: e.target.value }))
              }
            />
          </div>

          {/* Pool checkbox */}
          <div className="flex items-center gap-3 pt-5">
            <input
              type="checkbox"
              id="pool-check"
              checked={form.pool}
              onChange={(e) =>
                setForm((f) => ({ ...f, pool: e.target.checked }))
              }
              className="w-4 h-4 accent-[#c9a84c] cursor-pointer"
            />
            <label
              htmlFor="pool-check"
              className="text-sm text-[#f0f4ff] cursor-pointer"
            >
              Has Pool
            </label>
          </div>
        </div>
      </div>

      {/* Content Type Selector */}
      <div className="card p-5">
        <p className="section-title text-sm mb-4">Content Types</p>
        <div className="flex flex-wrap gap-3">
          {CONTENT_TYPES.map((t) => {
            const active = selectedTypes.includes(t.key);
            return (
              <button
                key={t.key}
                onClick={() => toggleType(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#c9a84c]/15 border-[#c9a84c]/40 text-[#c9a84c]'
                    : 'bg-[#141d35] border-[#1e2d4a] text-[#8899bb] hover:text-[#f0f4ff] hover:border-[#2a3d5e]'
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
                {active && (
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 12 12"
                    fill="currentColor"
                  >
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card p-4 border-red-500/30 bg-red-500/5">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Generate Button */}
      <div className="flex justify-end">
        <button
          className={`btn-primary flex items-center gap-2 px-6 py-2.5 ${
            loading ? 'opacity-60 cursor-not-allowed' : ''
          }`}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 16 16"
                fill="none"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="28"
                  strokeDashoffset="10"
                />
              </svg>
              Generating…
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M8 1v14M1 8h14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Generate Content
            </>
          )}
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="card p-5 space-y-4 animate-pulse">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <ContentResults content={result} selectedTypes={selectedTypes} />
      )}
    </div>
  );
}

// ── Tab 2: 3D Media Pool ───────────────────────────────────────────────────────

function MediaPool() {
  // Recommend Package state
  const [recPrice, setRecPrice] = useState('');
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const [recommendation, setRecommendation] =
    useState<PackageRecommendation | null>(null);

  // Shot List state
  const [shotBeds, setShotBeds] = useState('');
  const [shotBaths, setShotBaths] = useState('');
  const [shotPool, setShotPool] = useState(false);
  const [shotOffice, setShotOffice] = useState(false);
  const [shotLoading, setShotLoading] = useState(false);
  const [shotError, setShotError] = useState<string | null>(null);
  const [shotList, setShotList] = useState<ShotListItem[]>([]);

  async function handleGetRecommendation() {
    if (!recPrice.trim()) {
      setRecError('Enter a property price.');
      return;
    }
    setRecLoading(true);
    setRecError(null);
    setRecommendation(null);
    try {
      const res = await aiApi.process3DMedia('recommend_package', {
        price: parseInt(recPrice, 10),
      });
      setRecommendation(res.data as PackageRecommendation);
    } catch {
      setRecError('Could not load recommendation. Please try again.');
    } finally {
      setRecLoading(false);
    }
  }

  async function handleGenerateShotList() {
    setShotLoading(true);
    setShotError(null);
    setShotList([]);
    try {
      const res = await aiApi.process3DMedia('generate_shot_list', {
        beds: shotBeds ? parseInt(shotBeds, 10) : undefined,
        baths: shotBaths ? parseInt(shotBaths, 10) : undefined,
        pool: shotPool,
        hasOffice: shotOffice,
      });
      const data = res.data as { shotList?: ShotListItem[] } | ShotListItem[];
      const list: ShotListItem[] = Array.isArray(data)
        ? (data as ShotListItem[])
        : ((data as { shotList?: ShotListItem[] }).shotList ?? []);
      setShotList(
        list.map((item) => ({ ...item, completed: false }))
      );
    } catch {
      setShotError('Could not generate shot list. Please try again.');
    } finally {
      setShotLoading(false);
    }
  }

  function toggleShotItem(index: number) {
    setShotList((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, completed: !item.completed } : item
      )
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Recommend Package ── */}
      <div className="card p-5">
        <p className="section-title text-sm mb-1">Package Recommendation</p>
        <p className="text-xs text-[#8899bb] mb-4">
          Get an AI-recommended 3D media package based on listing price.
        </p>

        <div className="flex gap-3 items-end">
          <div className="flex-1 max-w-xs">
            <label className="label">Listing Price ($)</label>
            <input
              className="input"
              type="number"
              min="0"
              placeholder="550000"
              value={recPrice}
              onChange={(e) => setRecPrice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGetRecommendation()}
            />
          </div>
          <button
            className={`btn-primary flex items-center gap-2 mb-0.5 ${
              recLoading ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            onClick={handleGetRecommendation}
            disabled={recLoading}
          >
            {recLoading ? (
              <>
                <svg
                  className="w-3.5 h-3.5 animate-spin"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="28"
                    strokeDashoffset="10"
                  />
                </svg>
                Loading…
              </>
            ) : (
              'Get Recommendation'
            )}
          </button>
        </div>

        {recError && (
          <p className="mt-3 text-xs text-red-400">{recError}</p>
        )}

        {recLoading && (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-60" />
          </div>
        )}

        {recommendation && !recLoading && (
          <div className="mt-4 bg-[#141d35] border border-[#c9a84c]/20 rounded-xl p-5 animate-slide-in">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-base font-bold text-[#f0f4ff]">
                  {recommendation.packageName ?? 'Recommended Package'}
                </p>
                {recommendation.priceRange && (
                  <p className="text-sm text-[#c9a84c] font-semibold mt-0.5">
                    {recommendation.priceRange}
                  </p>
                )}
              </div>
              {recommendation.turnaround && (
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-[#8899bb] uppercase tracking-wide">
                    Turnaround
                  </p>
                  <p className="text-sm font-semibold text-[#f0f4ff]">
                    {recommendation.turnaround}
                  </p>
                </div>
              )}
            </div>

            {recommendation.description && (
              <p className="text-sm text-[#8899bb] mb-4 leading-relaxed">
                {recommendation.description}
              </p>
            )}

            {recommendation.includes && recommendation.includes.length > 0 && (
              <div>
                <p className="text-[10px] text-[#8899bb] uppercase tracking-wide mb-2">
                  Includes
                </p>
                <ul className="space-y-1.5">
                  {recommendation.includes.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-[#f0f4ff]"
                    >
                      <svg
                        className="w-3.5 h-3.5 text-[#c9a84c] shrink-0"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M2 7l4 4 6-6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Generate Shot List ── */}
      <div className="card p-5">
        <p className="section-title text-sm mb-1">Shot List Generator</p>
        <p className="text-xs text-[#8899bb] mb-4">
          Generate a professional photography & 3D scan shot list for a
          property.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="label">Beds</label>
            <input
              className="input"
              type="number"
              min="0"
              placeholder="4"
              value={shotBeds}
              onChange={(e) => setShotBeds(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Baths</label>
            <input
              className="input"
              type="number"
              min="0"
              placeholder="2"
              value={shotBaths}
              onChange={(e) => setShotBaths(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="shot-pool"
              checked={shotPool}
              onChange={(e) => setShotPool(e.target.checked)}
              className="w-4 h-4 accent-[#c9a84c] cursor-pointer"
            />
            <label
              htmlFor="shot-pool"
              className="text-sm text-[#f0f4ff] cursor-pointer"
            >
              Pool
            </label>
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="shot-office"
              checked={shotOffice}
              onChange={(e) => setShotOffice(e.target.checked)}
              className="w-4 h-4 accent-[#c9a84c] cursor-pointer"
            />
            <label
              htmlFor="shot-office"
              className="text-sm text-[#f0f4ff] cursor-pointer"
            >
              Home Office
            </label>
          </div>
        </div>

        <button
          className={`btn-primary flex items-center gap-2 ${
            shotLoading ? 'opacity-60 cursor-not-allowed' : ''
          }`}
          onClick={handleGenerateShotList}
          disabled={shotLoading}
        >
          {shotLoading ? (
            <>
              <svg
                className="w-3.5 h-3.5 animate-spin"
                viewBox="0 0 16 16"
                fill="none"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="28"
                  strokeDashoffset="10"
                />
              </svg>
              Generating…
            </>
          ) : (
            <>
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M2 4h12M2 8h8M2 12h5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Generate Shot List
            </>
          )}
        </button>

        {shotError && (
          <p className="mt-3 text-xs text-red-400">{shotError}</p>
        )}

        {shotLoading && (
          <div className="mt-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {shotList.length > 0 && !shotLoading && (
          <div className="mt-4 animate-slide-in">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-[#8899bb] uppercase tracking-wide">
                {shotList.length} shots · {shotList.filter((s) => s.completed).length} completed
              </p>
              <button
                className="text-xs text-[#8899bb] hover:text-[#f0f4ff] transition-colors"
                onClick={() =>
                  setShotList((prev) => {
                    const allDone = prev.every((s) => s.completed);
                    return prev.map((s) => ({ ...s, completed: !allDone }));
                  })
                }
              >
                Toggle All
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#1e2d4a]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#141d35] text-[#8899bb] text-left">
                    <th className="px-4 py-2.5 text-[10px] uppercase tracking-wide font-semibold w-8">
                      Done
                    </th>
                    <th className="px-4 py-2.5 text-[10px] uppercase tracking-wide font-semibold">
                      Room
                    </th>
                    <th className="px-4 py-2.5 text-[10px] uppercase tracking-wide font-semibold">
                      Shot Type
                    </th>
                    <th className="px-4 py-2.5 text-[10px] uppercase tracking-wide font-semibold">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shotList.map((item, i) => (
                    <tr
                      key={i}
                      className={`border-t border-[#1e2d4a] transition-colors ${
                        item.completed
                          ? 'bg-emerald-500/5 opacity-60'
                          : 'hover:bg-[#141d35]'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleShotItem(i)}
                          className="w-4 h-4 accent-[#c9a84c] cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-[#f0f4ff]">
                        {item.room}
                      </td>
                      <td className="px-4 py-3 text-[#8899bb]">
                        {item.shotType}
                      </td>
                      <td className="px-4 py-3 text-[#8899bb] text-xs">
                        {item.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── 3D Media Pool ── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="section-title text-sm">3D Media Pool</p>
            <p className="text-xs text-[#8899bb]">
              Manage uploaded 3D scans, virtual tours, and floor plans.
            </p>
          </div>
          <button className="btn-secondary flex items-center gap-2 text-xs py-2 px-3">
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2v12M2 8h12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Add Media
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-10 gap-4 border border-dashed border-[#1e2d4a] rounded-xl">
          <div className="w-12 h-12 rounded-full bg-[#141d35] border border-[#1e2d4a] flex items-center justify-center">
            <svg
              className="w-5 h-5 text-[#8899bb]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 16l4-4 4 4 4-6 4 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-[#8899bb]">
              0 items in 3D media pool
            </p>
            <p className="text-xs text-[#4a5e7a] mt-1">
              Upload Matterport scans, virtual tours, and floor plans to get
              started.
            </p>
          </div>
          <button className="btn-primary text-xs py-2 px-4 flex items-center gap-2">
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2v8M5 5l3-3 3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12h12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Upload First Item
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type TabKey = 'generator' | 'pool';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'generator', label: 'Content Generator', icon: '✨' },
  { key: 'pool', label: '3D Media Pool', icon: '🎬' },
];

export default function MediaStudio() {
  const [activeTab, setActiveTab] = useState<TabKey>('generator');

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* ── Header ── */}
      <div>
        <h1 className="page-title">Media Studio</h1>
        <p className="page-sub">
          AI-generated listing content &amp; 3D media management
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-[#1e2d4a]">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-[#c9a84c] border-b-2 border-[#c9a84c] bg-[#c9a84c]/5'
                  : 'text-[#8899bb] hover:text-[#f0f4ff] hover:bg-[#141d35]'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'generator' && <ContentGenerator />}
      {activeTab === 'pool' && <MediaPool />}
    </div>
  );
}
