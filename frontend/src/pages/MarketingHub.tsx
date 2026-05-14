import { useState, FormEvent } from 'react';
import { aiApi } from '../../lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ListingForm {
  address: string;
  city: string;
  price: number | '';
  beds: number | '';
  baths: number | '';
  pool: boolean;
  objective: string;
  budget: number | '';
}

interface AudienceCard {
  name: string;
  platform: string;
  targeting: string;
  size?: string;
}

interface AdCreative {
  platform: string;
  headline: string;
  body: string;
  cta: string;
}

interface CampaignResult {
  estimatedReach?: number;
  estimatedLeads?: number;
  costPerLead?: number;
  audiences?: AudienceCard[];
  adCreatives?: AdCreative[];
  [key: string]: unknown;
}

interface CalendarPost {
  platform: 'Instagram' | 'Facebook' | 'Email';
  caption: string;
  type?: string;
}

interface CalendarDay {
  day: string;
  posts: CalendarPost[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

const PLATFORM_COLORS: Record<string, string> = {
  Facebook: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Instagram: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  Google: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Email: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  YouTube: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function PlatformBadge({ platform }: { platform: string }) {
  const cls = PLATFORM_COLORS[platform] ?? 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {platform}
    </span>
  );
}

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2"
        strokeDasharray="28" strokeDashoffset="10" />
    </svg>
  );
}

// ── Calendar builder ──────────────────────────────────────────────────────────

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PLATFORM_ICONS: Record<string, string> = { Instagram: '📸', Facebook: '📘', Email: '✉️' };

function buildCalendarFromResult(result: CampaignResult): CalendarDay[] {
  const raw = result as Record<string, unknown>;
  if (Array.isArray(raw['calendar'])) return raw['calendar'] as CalendarDay[];

  const c = result.adCreatives ?? [];
  return DAYS.map((day, i) => {
    const posts: CalendarPost[] = [];
    if (i % 2 === 0) {
      posts.push({
        platform: 'Instagram',
        caption: c[0]?.body ?? 'Check out this stunning listing! DM us for a private tour. #realestate #newlisting',
        type: 'Listing',
      });
    }
    if (i % 3 !== 2) {
      posts.push({
        platform: 'Facebook',
        caption: c[1]?.body ?? 'Ready to find your dream home? We have exclusive listings just for you. Click the link to browse.',
        type: 'Sponsored',
      });
    }
    if (i === 0 || i === 3 || i === 6) {
      posts.push({
        platform: 'Email',
        caption: `Weekly Market Update — ${day}: Here are the top properties available in your price range this week. New listings added daily!`,
        type: 'Newsletter',
      });
    }
    return { day, posts };
  });
}

// ── Synthetic defaults when API returns partial data ─────────────────────────

function getAudiences(campaign: CampaignResult, city: string): AudienceCard[] {
  if (campaign.audiences && campaign.audiences.length > 0) return campaign.audiences;
  return [
    { name: 'First-Time Buyers', platform: 'Facebook', targeting: `Age 25-40, income $60K-$120K, renters in ${city || 'target'} zip codes`, size: '42K' },
    { name: 'Move-Up Buyers', platform: 'Instagram', targeting: 'Homeowners age 35-55, household income $120K+, life events (new baby, job change)', size: '28K' },
    { name: 'Luxury Seekers', platform: 'Google', targeting: 'High-intent search: "luxury homes for sale", "waterfront property", "5 bedroom"', size: '18K' },
    { name: 'Investor Pool', platform: 'Facebook', targeting: 'Real estate investors, rental income interest, portfolio builders 40-65', size: '15K' },
  ];
}

function getCreatives(campaign: CampaignResult, form: ListingForm): AdCreative[] {
  if (campaign.adCreatives && campaign.adCreatives.length > 0) return campaign.adCreatives;
  const price = formatCurrency(Number(form.price) || 500000);
  const loc = form.city || 'Scottsdale';
  const beds = form.beds || 3;
  const baths = form.baths || 2;
  const addr = form.address || '123 Desert Rose Dr';
  return [
    {
      platform: 'Facebook',
      headline: `Stunning ${beds}BD/${baths}BA in ${loc}`,
      body: `Discover your dream home at ${addr}. Priced at ${price}. Featuring an open floor plan, ${form.pool ? 'sparkling pool, ' : ''}modern finishes, and prime location. Schedule your private showing today!`,
      cta: 'Schedule a Tour',
    },
    {
      platform: 'Google',
      headline: `${loc} Home For Sale — ${price}`,
      body: `${beds} Bed / ${baths} Bath.${form.pool ? ' Pool.' : ''} Move-in Ready. See photos and schedule a showing online in 60 seconds.`,
      cta: 'View Listing',
    },
  ];
}

// ── Main Component ────────────────────────────────────────────────────────────

const INITIAL_FORM: ListingForm = {
  address: '', city: '', price: '', beds: '', baths: '',
  pool: false, objective: 'lead_generation', budget: '',
};

export default function MarketingHub() {
  const [form, setForm] = useState<ListingForm>(INITIAL_FORM);
  const [building, setBuilding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<CampaignResult | null>(null);

  const [calLoading, setCalLoading] = useState(false);
  const [calendar, setCalendar] = useState<CalendarDay[] | null>(null);
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);

  function setField<K extends keyof ListingForm>(key: K, value: ListingForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (formError) setFormError(null);
  }

  async function handleBuildCampaign(e: FormEvent) {
    e.preventDefault();
    if (!form.address.trim()) { setFormError('Listing address is required.'); return; }
    if (!form.city.trim()) { setFormError('City is required.'); return; }
    if (!form.price) { setFormError('Price is required.'); return; }
    if (!form.budget) { setFormError('Budget is required.'); return; }

    setBuilding(true);
    setFormError(null);
    setCampaign(null);
    try {
      const listing = {
        address: form.address.trim(),
        city: form.city.trim(),
        price: Number(form.price),
        beds: form.beds ? Number(form.beds) : undefined,
        baths: form.baths ? Number(form.baths) : undefined,
        pool: form.pool,
      };
      const res = await aiApi.buildCampaign(listing, form.objective, Number(form.budget));
      const data = res.data as { campaign?: CampaignResult } | CampaignResult;
      const result: CampaignResult =
        ('campaign' in data && data.campaign) ? data.campaign : (data as CampaignResult);
      setCampaign(result);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Failed to build campaign. Please try again.';
      setFormError(msg);
    } finally {
      setBuilding(false);
    }
  }

  async function handleGenerateCalendar() {
    setCalLoading(true);
    setCalendar(null);
    setSelectedPost(null);
    try {
      const res = await aiApi.buildCampaign(
        { address: 'Sample', city: 'Scottsdale', price: 500_000 },
        'lead_generation',
        1000,
      );
      const data = res.data as { campaign?: CampaignResult } | CampaignResult;
      const result: CampaignResult =
        ('campaign' in data && data.campaign) ? data.campaign : (data as CampaignResult);
      setCalendar(buildCalendarFromResult(result));
    } catch {
      setCalendar(buildCalendarFromResult({ adCreatives: [] }));
    } finally {
      setCalLoading(false);
    }
  }

  const audiences = campaign ? getAudiences(campaign, form.city || 'Scottsdale') : [];
  const adCreatives = campaign ? getCreatives(campaign, form) : [];

  const reach = campaign ? Number(campaign.estimatedReach ?? (campaign as Record<string, unknown>)['reach'] ?? 28_500) : 0;
  const leads = campaign ? Number(campaign.estimatedLeads ?? (campaign as Record<string, unknown>)['leads'] ?? 142) : 0;
  const cpl = campaign ? Number(campaign.costPerLead ?? (campaign as Record<string, unknown>)['cpl'] ?? (Number(form.budget) > 0 ? (Number(form.budget) / Math.max(leads, 1)) : 17.6)) : 0;

  return (
    <div className="space-y-10">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="page-title">Marketing Hub</h1>
        <p className="page-sub">AI campaign builder &amp; content calendar</p>
      </div>

      {/* ── Section A: Ad Campaign Builder ─────────────────────────────────── */}
      <div className="space-y-5">
        <div>
          <p className="section-title">Ad Campaign Builder</p>
          <p className="text-sm text-[#8899bb]">Generate a full multi-platform ad campaign for any listing</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

          {/* Form */}
          <div className="xl:col-span-2 card p-6">
            <form onSubmit={handleBuildCampaign} className="space-y-4" noValidate>
              <div>
                <label className="label" htmlFor="mh-address">Listing Address</label>
                <input id="mh-address" type="text" className="input"
                  placeholder="123 Desert Rose Dr" value={form.address}
                  onChange={(e) => setField('address', e.target.value)} disabled={building} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="mh-city">City</label>
                  <input id="mh-city" type="text" className="input"
                    placeholder="Scottsdale" value={form.city}
                    onChange={(e) => setField('city', e.target.value)} disabled={building} />
                </div>
                <div>
                  <label className="label" htmlFor="mh-price">Price ($)</label>
                  <input id="mh-price" type="number" className="input" placeholder="750000"
                    value={form.price}
                    onChange={(e) => setField('price', e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={building} min={0} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="mh-beds">Beds</label>
                  <input id="mh-beds" type="number" className="input" placeholder="4"
                    value={form.beds}
                    onChange={(e) => setField('beds', e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={building} min={0} />
                </div>
                <div>
                  <label className="label" htmlFor="mh-baths">Baths</label>
                  <input id="mh-baths" type="number" className="input" placeholder="3"
                    value={form.baths}
                    onChange={(e) => setField('baths', e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={building} min={0} />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={form.pool}
                  onChange={(e) => setField('pool', e.target.checked)}
                  className="w-4 h-4 accent-[#c9a84c]" disabled={building} />
                <span className="text-sm text-[#f0f4ff]">Pool included</span>
              </label>

              <div>
                <label className="label" htmlFor="mh-objective">Campaign Objective</label>
                <select id="mh-objective" className="select" value={form.objective}
                  onChange={(e) => setField('objective', e.target.value)} disabled={building}>
                  <option value="lead_generation">Lead Generation</option>
                  <option value="brand_awareness">Brand Awareness</option>
                  <option value="listing_promotion">Listing Promotion</option>
                  <option value="open_house">Open House</option>
                </select>
              </div>

              <div>
                <label className="label" htmlFor="mh-budget">Budget ($)</label>
                <input id="mh-budget" type="number" className="input" placeholder="2500"
                  value={form.budget}
                  onChange={(e) => setField('budget', e.target.value === '' ? '' : Number(e.target.value))}
                  disabled={building} min={0} />
              </div>

              {formError && (
                <div className="px-3 py-2 bg-red-500/10 border border-red-500/25 rounded-lg">
                  <p className="text-xs text-red-400">{formError}</p>
                </div>
              )}

              <button type="submit"
                className={`btn-primary w-full flex items-center justify-center gap-2 py-2.5 ${building ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={building}>
                {building ? <><SpinnerIcon /> Building Campaign…</> : 'Build Campaign'}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="xl:col-span-3 space-y-5">
            {!campaign && !building && (
              <div className="card p-12 flex flex-col items-center justify-center text-center gap-3 min-h-[340px]">
                <div className="w-14 h-14 rounded-xl bg-[#c9a84c]/15 border border-[#c9a84c]/30 flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                  </svg>
                </div>
                <p className="text-sm text-[#8899bb] max-w-xs">Fill out the listing details and click <strong className="text-[#f0f4ff]">Build Campaign</strong> to generate your AI-powered ad campaign.</p>
              </div>
            )}

            {building && (
              <div className="card p-12 flex flex-col items-center justify-center gap-4 min-h-[340px]">
                <SpinnerIcon />
                <p className="text-sm text-[#8899bb]">Building your multi-platform campaign…</p>
              </div>
            )}

            {campaign && (
              <div className="space-y-5 animate-slide-in">
                {/* Campaign Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Est. Reach', value: formatNumber(reach) },
                    { label: 'Est. Leads', value: formatNumber(leads) },
                    { label: 'Cost / Lead', value: `$${cpl.toFixed(2)}` },
                  ].map((stat) => (
                    <div key={stat.label} className="card p-4 text-center">
                      <p className="text-2xl font-bold text-[#c9a84c]">{stat.value}</p>
                      <p className="text-xs text-[#8899bb] mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Audience Targeting */}
                <div>
                  <p className="text-sm font-semibold text-[#f0f4ff] mb-3">Audience Targeting</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {audiences.map((aud, i) => (
                      <div key={i} className="card-hover p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-[#f0f4ff]">{aud.name}</p>
                          <PlatformBadge platform={aud.platform} />
                        </div>
                        <p className="text-xs text-[#8899bb] leading-relaxed">{aud.targeting}</p>
                        {aud.size && (
                          <p className="text-xs text-[#c9a84c] font-medium">Audience size: {aud.size}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ad Creatives */}
                <div>
                  <p className="text-sm font-semibold text-[#f0f4ff] mb-3">Ad Creative Previews</p>
                  <div className="space-y-3">
                    {adCreatives.map((ad, i) => (
                      <div key={i} className="card p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <PlatformBadge platform={ad.platform} />
                          <span className="text-xs text-[#8899bb]">Ad Preview</span>
                        </div>
                        <div className="bg-[#141d35] rounded-lg p-4 border border-[#1e2d4a] space-y-2">
                          <p className="text-sm font-bold text-[#f0f4ff]">{ad.headline}</p>
                          <p className="text-xs text-[#8899bb] leading-relaxed">{ad.body}</p>
                          <button className="text-xs px-3 py-1 bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30 rounded-md font-medium cursor-default">
                            {ad.cta}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* ── Section B: Content Calendar ─────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="section-title">Content Calendar</p>
            <p className="text-sm text-[#8899bb]">AI-generated weekly social posting schedule</p>
          </div>
          <button
            className={`btn-primary flex items-center gap-2 ${calLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={handleGenerateCalendar}
            disabled={calLoading}
          >
            {calLoading ? <><SpinnerIcon /> Generating…</> : 'Generate Calendar'}
          </button>
        </div>

        {!calendar && !calLoading && (
          <div className="card p-12 flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-[#8899bb]">Click <strong className="text-[#f0f4ff]">Generate Calendar</strong> to build a weekly content schedule.</p>
          </div>
        )}

        {calLoading && (
          <div className="card p-10 flex items-center justify-center gap-3">
            <SpinnerIcon />
            <p className="text-sm text-[#8899bb]">Generating content calendar…</p>
          </div>
        )}

        {calendar && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 animate-slide-in">

            {/* Weekly Grid */}
            <div className="xl:col-span-3 overflow-x-auto">
              <div className="grid grid-cols-7 gap-2 min-w-[560px]">
                {calendar.map((dayData) => (
                  <div key={dayData.day} className="space-y-2">
                    <p className="text-xs font-semibold text-[#8899bb] text-center">
                      {dayData.day.slice(0, 3).toUpperCase()}
                    </p>
                    <div className="card min-h-[140px] p-2 space-y-1.5">
                      {dayData.posts.length === 0 ? (
                        <p className="text-[10px] text-[#4a5e7a] text-center mt-6">—</p>
                      ) : (
                        dayData.posts.map((post, pi) => (
                          <button
                            key={pi}
                            onClick={() => setSelectedPost(post === selectedPost ? null : post)}
                            className={`w-full text-left p-1.5 rounded-md transition-colors border space-y-0.5 ${
                              selectedPost === post
                                ? 'bg-[#c9a84c]/15 border-[#c9a84c]/40'
                                : 'bg-[#141d35] hover:bg-[#1e2d4a] border-[#1e2d4a]'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <span className="text-xs">{PLATFORM_ICONS[post.platform] ?? '📄'}</span>
                              <span className="text-[10px] text-[#8899bb] truncate">{post.platform}</span>
                            </div>
                            {post.type && (
                              <span className="block text-[9px] px-1 rounded bg-[#c9a84c]/15 text-[#c9a84c] w-fit">
                                {post.type}
                              </span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Side Panel */}
            <div className="xl:col-span-1">
              {selectedPost ? (
                <div className="card p-5 space-y-4 animate-slide-in sticky top-4">
                  <div className="flex items-center justify-between">
                    <PlatformBadge platform={selectedPost.platform} />
                    <button onClick={() => setSelectedPost(null)}
                      className="text-xs text-[#8899bb] hover:text-[#f0f4ff] transition-colors">
                      Close
                    </button>
                  </div>
                  {selectedPost.type && (
                    <p className="text-xs font-semibold text-[#c9a84c] uppercase tracking-wide">
                      {selectedPost.type}
                    </p>
                  )}
                  <div>
                    <p className="label">Caption</p>
                    <p className="text-sm text-[#f0f4ff] leading-relaxed bg-[#141d35] border border-[#1e2d4a] rounded-lg p-3">
                      {selectedPost.caption}
                    </p>
                  </div>
                  <button
                    className="btn-secondary w-full text-xs"
                    onClick={() => navigator.clipboard?.writeText(selectedPost.caption)}
                  >
                    Copy Caption
                  </button>
                </div>
              ) : (
                <div className="card p-5 flex flex-col items-center justify-center gap-2 min-h-[180px] text-center">
                  <p className="text-xs text-[#8899bb]">Click any post to preview its caption</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
