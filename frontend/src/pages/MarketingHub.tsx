import { useState, FormEvent } from 'react';
import { aiApi } from '../../lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CampaignListing {
  address: string;
  city: string;
  price: number;
  beds: number;
  baths: number;
  pool: boolean;
}

interface AudienceCard {
  audience: string;
  platform: string;
  targeting: string;
}

interface AdCreative {
  platform: string;
  headline: string;
  body: string;
  cta: string;
}

interface CampaignResult {
  stats?: {
    estimatedReach?: number;
    estimatedLeads?: number;
    costPerLead?: number;
  };
  audiences?: AudienceCard[];
  adCreatives?: AdCreative[];
  facebookAd?: { headline?: string; body?: string; cta?: string };
  googleAd?: { headline?: string; body?: string; cta?: string };
  // catch-all for raw response shapes
  [key: string]: unknown;
}

interface CalendarPost {
  platform: string;
  caption: string;
}

interface CalendarDay {
  day: string;
  posts: CalendarPost[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  Facebook: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Email: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Google: 'bg-green-500/20 text-green-400 border-green-500/30',
  default: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

function platformBadgeClass(platform: string): string {
  return (
    PLATFORM_COLORS[platform] ?? PLATFORM_COLORS.default
  );
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

// Build a basic 7-day calendar from a campaign result so we always have data to show
function buildCalendarFromResult(result: CampaignResult): CalendarDay[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const templates: { platform: string; caption: string }[] = [
    { platform: 'Instagram', caption: (result.facebookAd as { body?: string })?.body ?? 'New listing alert! Check out this stunning home.' },
    { platform: 'Facebook', caption: (result.facebookAd as { headline?: string; body?: string })?.headline ?? 'Your dream home is waiting.' },
    { platform: 'Email', caption: 'Weekly market update — see what\'s new in your area.' },
    { platform: 'Instagram', caption: (result.googleAd as { body?: string })?.body ?? 'Schedule your private showing today.' },
    { platform: 'Facebook', caption: 'Open house this weekend — all are welcome!' },
    { platform: 'Email', caption: 'Exclusive off-market opportunity — don\'t miss out.' },
    { platform: 'Instagram', caption: 'Just listed in a prime location. DM for details.' },
  ];
  return days.map((day, i) => ({
    day,
    posts: [templates[i]],
  }));
}

function extractCalendar(result: CampaignResult): CalendarDay[] {
  if (result.contentCalendar && Array.isArray(result.contentCalendar)) {
    return result.contentCalendar as CalendarDay[];
  }
  if (result.calendar && Array.isArray(result.calendar)) {
    return result.calendar as CalendarDay[];
  }
  return buildCalendarFromResult(result);
}

function extractAudiences(result: CampaignResult): AudienceCard[] {
  if (result.audiences && Array.isArray(result.audiences)) {
    return result.audiences as AudienceCard[];
  }
  // Build fallback from adCreatives if present
  if (result.adCreatives && Array.isArray(result.adCreatives)) {
    return (result.adCreatives as AdCreative[]).slice(0, 4).map((c) => ({
      audience: c.headline ?? 'Target Audience',
      platform: c.platform ?? 'Facebook',
      targeting: c.body ?? 'Interest-based targeting',
    }));
  }
  return [
    { audience: 'First-Time Homebuyers', platform: 'Facebook', targeting: 'Age 25–40, renting, interested in mortgages' },
    { audience: 'Move-Up Buyers', platform: 'Instagram', targeting: 'Homeowners age 35–55, growing families' },
    { audience: 'Luxury Searchers', platform: 'Google', targeting: 'High-income households, real-estate intent keywords' },
    { audience: 'Local Investors', platform: 'Facebook', targeting: 'Real estate investors, 10-mile radius' },
  ];
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 text-center">
      <p className="text-xl font-bold text-[#c9a84c]">{value}</p>
      <p className="text-xs text-[#8899bb] mt-1">{label}</p>
    </div>
  );
}

function AudienceCardView({ card }: { card: AudienceCard }) {
  return (
    <div className="card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#f0f4ff]">{card.audience}</p>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${platformBadgeClass(card.platform)}`}>
          {card.platform}
        </span>
      </div>
      <p className="text-xs text-[#8899bb] leading-relaxed">{card.targeting}</p>
    </div>
  );
}

interface AdPreviewProps {
  platform: string;
  headline?: string;
  body?: string;
  cta?: string;
}

function AdPreview({ platform, headline, body, cta }: AdPreviewProps) {
  const isFB = platform === 'Facebook';
  return (
    <div className={`card p-4 space-y-3 border ${isFB ? 'border-blue-500/20' : 'border-green-500/20'}`}>
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${platformBadgeClass(platform)}`}>
          {platform} Ad
        </span>
      </div>
      {headline && (
        <p className="text-sm font-bold text-[#f0f4ff] leading-snug">{headline}</p>
      )}
      {body && (
        <p className="text-xs text-[#8899bb] leading-relaxed">{body}</p>
      )}
      {cta && (
        <div>
          <span className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30">
            {cta}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Calendar Post Icon ─────────────────────────────────────────────────────────

function PostDot({
  post,
  onClick,
  active,
}: {
  post: CalendarPost;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border transition-all ${
        active
          ? 'ring-1 ring-offset-1 ring-[#c9a84c] ' + platformBadgeClass(post.platform)
          : platformBadgeClass(post.platform)
      }`}
    >
      {post.platform.slice(0, 2)}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function MarketingHub() {
  // Campaign builder form
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [beds, setBeds] = useState('3');
  const [baths, setBaths] = useState('2');
  const [pool, setPool] = useState(false);
  const [objective, setObjective] = useState<string>('lead_generation');
  const [budget, setBudget] = useState('1000');
  const [building, setBuilding] = useState(false);
  const [campaignResult, setCampaignResult] = useState<CampaignResult | null>(null);
  const [campaignError, setCampaignError] = useState<string | null>(null);

  // Calendar
  const [calLoading, setCalLoading] = useState(false);
  const [calResult, setCalResult] = useState<CampaignResult | null>(null);
  const [calError, setCalError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);
  const [selectedPostIdx, setSelectedPostIdx] = useState<number | null>(null);

  async function handleBuildCampaign(e: FormEvent) {
    e.preventDefault();
    if (!address.trim() || !city.trim() || !price) {
      setCampaignError('Address, city, and price are required.');
      return;
    }
    setBuilding(true);
    setCampaignError(null);
    setCampaignResult(null);
    try {
      const listing: CampaignListing = {
        address: address.trim(),
        city: city.trim(),
        price: parseFloat(price),
        beds: parseInt(beds, 10),
        baths: parseFloat(baths),
        pool,
      };
      const res = await aiApi.buildCampaign(listing, objective, parseFloat(budget));
      const data = res.data as { campaign?: CampaignResult } | CampaignResult;
      const campaign = ('campaign' in data && data.campaign) ? data.campaign : data as CampaignResult;
      setCampaignResult(campaign);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Campaign build failed. Please try again.';
      setCampaignError(msg);
    } finally {
      setBuilding(false);
    }
  }

  async function handleGenerateCalendar() {
    setCalLoading(true);
    setCalError(null);
    setCalResult(null);
    setSelectedPost(null);
    try {
      const res = await aiApi.buildCampaign(
        { address: 'Sample', city: 'Scottsdale', price: 500000 },
        'lead_generation',
        1000,
      );
      const data = res.data as { campaign?: CampaignResult } | CampaignResult;
      const campaign = ('campaign' in data && data.campaign) ? data.campaign : data as CampaignResult;
      setCalResult(campaign);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Calendar generation failed. Please try again.';
      setCalError(msg);
    } finally {
      setCalLoading(false);
    }
  }

  function handlePostClick(post: CalendarPost, dayIdx: number, postIdx: number) {
    if (selectedDayIdx === dayIdx && selectedPostIdx === postIdx) {
      setSelectedPost(null);
      setSelectedDayIdx(null);
      setSelectedPostIdx(null);
    } else {
      setSelectedPost(post);
      setSelectedDayIdx(dayIdx);
      setSelectedPostIdx(postIdx);
    }
  }

  const calendarDays = calResult ? extractCalendar(calResult) : [];
  const audiences = campaignResult ? extractAudiences(campaignResult) : [];
  const stats = campaignResult?.stats as { estimatedReach?: number; estimatedLeads?: number; costPerLead?: number } | undefined;
  const fbAd = campaignResult?.facebookAd as { headline?: string; body?: string; cta?: string } | undefined;
  const gAd = campaignResult?.googleAd as { headline?: string; body?: string; cta?: string } | undefined;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="page-title">Marketing Hub</h1>
        <p className="page-sub">AI campaign builder &amp; content calendar</p>
      </div>

      {/* ── Section A: Ad Campaign Builder ────────────────────────────────── */}
      <div className="card p-6 space-y-6">
        <div>
          <p className="section-title">Ad Campaign Builder</p>
          <p className="section-sub">Fill in listing details to generate a targeted ad campaign</p>
        </div>

        <form onSubmit={handleBuildCampaign} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="mh-address">Listing Address</label>
              <input
                id="mh-address"
                type="text"
                className="input"
                placeholder="123 Cactus Rd"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={building}
              />
            </div>
            <div>
              <label className="label" htmlFor="mh-city">City</label>
              <input
                id="mh-city"
                type="text"
                className="input"
                placeholder="Scottsdale"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={building}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="label" htmlFor="mh-price">Price ($)</label>
              <input
                id="mh-price"
                type="number"
                className="input"
                placeholder="500000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={building}
                min={0}
              />
            </div>
            <div>
              <label className="label" htmlFor="mh-beds">Beds</label>
              <input
                id="mh-beds"
                type="number"
                className="input"
                placeholder="3"
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                disabled={building}
                min={0}
              />
            </div>
            <div>
              <label className="label" htmlFor="mh-baths">Baths</label>
              <input
                id="mh-baths"
                type="number"
                className="input"
                placeholder="2"
                value={baths}
                onChange={(e) => setBaths(e.target.value)}
                disabled={building}
                min={0}
                step={0.5}
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="label">Pool</label>
              <label className="flex items-center gap-2 h-9 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded accent-[#c9a84c]"
                  checked={pool}
                  onChange={(e) => setPool(e.target.checked)}
                  disabled={building}
                />
                <span className="text-sm text-[#f0f4ff]">Has Pool</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="mh-objective">Objective</label>
              <select
                id="mh-objective"
                className="select"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                disabled={building}
              >
                <option value="lead_generation">Lead Generation</option>
                <option value="brand_awareness">Brand Awareness</option>
                <option value="listing_promotion">Listing Promotion</option>
                <option value="open_house">Open House</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="mh-budget">Budget ($)</label>
              <input
                id="mh-budget"
                type="number"
                className="input"
                placeholder="1000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                disabled={building}
                min={0}
              />
            </div>
          </div>

          {campaignError && (
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/25 rounded-lg">
              <p className="text-xs text-red-400">{campaignError}</p>
            </div>
          )}

          <button
            type="submit"
            className={`btn-primary flex items-center gap-2 ${building ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={building}
          >
            {building ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10" />
                </svg>
                Building Campaign…
              </>
            ) : (
              'Build Campaign'
            )}
          </button>
        </form>

        {/* Campaign Results */}
        {campaignResult && (
          <div className="space-y-5 animate-slide-in">
            <div className="divider" />

            {/* Stats */}
            {stats && (
              <div>
                <p className="label mb-2">Campaign Estimates</p>
                <div className="grid grid-cols-3 gap-3">
                  <StatBox label="Est. Reach" value={fmt(stats.estimatedReach ?? 0)} />
                  <StatBox label="Est. Leads" value={fmt(stats.estimatedLeads ?? 0)} />
                  <StatBox label="Cost / Lead" value={fmtCurrency(stats.costPerLead ?? 0)} />
                </div>
              </div>
            )}

            {/* Audience targeting cards */}
            {audiences.length > 0 && (
              <div>
                <p className="label mb-2">Audience Targeting</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {audiences.map((card, i) => (
                    <AudienceCardView key={i} card={card} />
                  ))}
                </div>
              </div>
            )}

            {/* Ad Creatives */}
            <div>
              <p className="label mb-2">Ad Creative Preview</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AdPreview
                  platform="Facebook"
                  headline={fbAd?.headline ?? (campaignResult.adCreatives as AdCreative[] | undefined)?.[0]?.headline ?? 'Stunning Home Now Available'}
                  body={fbAd?.body ?? (campaignResult.adCreatives as AdCreative[] | undefined)?.[0]?.body ?? 'Don\'t miss this exceptional listing.'}
                  cta={fbAd?.cta ?? 'Learn More'}
                />
                <AdPreview
                  platform="Google"
                  headline={gAd?.headline ?? (campaignResult.adCreatives as AdCreative[] | undefined)?.[1]?.headline ?? `${beds}BR/${baths}BA in ${city}`}
                  body={gAd?.body ?? (campaignResult.adCreatives as AdCreative[] | undefined)?.[1]?.body ?? `Priced at ${price ? fmtCurrency(parseFloat(price)) : '—'}. Schedule a tour today.`}
                  cta={gAd?.cta ?? 'Book a Tour'}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Section B: Content Calendar ───────────────────────────────────── */}
      <div className="card p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-title">Content Calendar</p>
            <p className="section-sub">7-day social &amp; email posting schedule</p>
          </div>
          <button
            type="button"
            className={`btn-secondary shrink-0 flex items-center gap-2 ${calLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={handleGenerateCalendar}
            disabled={calLoading}
          >
            {calLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10" />
                </svg>
                Generating…
              </>
            ) : (
              'Generate Calendar'
            )}
          </button>
        </div>

        {calError && (
          <div className="px-3 py-2 bg-red-500/10 border border-red-500/25 rounded-lg">
            <p className="text-xs text-red-400">{calError}</p>
          </div>
        )}

        {calResult && (
          <div className="space-y-4 animate-slide-in">
            {/* Weekly grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, dayIdx) => (
                <div key={dayIdx} className="space-y-2">
                  <p className="text-xs font-semibold text-[#8899bb] text-center">{day.day}</p>
                  <div className="card p-2 min-h-[70px] flex flex-col gap-1.5 items-start">
                    {day.posts.map((post, postIdx) => (
                      <PostDot
                        key={postIdx}
                        post={post}
                        active={selectedDayIdx === dayIdx && selectedPostIdx === postIdx}
                        onClick={() => handlePostClick(post, dayIdx, postIdx)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Side panel for selected post */}
            {selectedPost && (
              <div className="card p-4 border border-[#c9a84c]/30 animate-slide-in space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${platformBadgeClass(selectedPost.platform)}`}>
                      {selectedPost.platform}
                    </span>
                    <p className="text-xs text-[#8899bb]">Post Caption</p>
                  </div>
                  <button
                    type="button"
                    className="text-[#8899bb] hover:text-[#f0f4ff] text-xs"
                    onClick={() => setSelectedPost(null)}
                  >
                    Close
                  </button>
                </div>
                <p className="text-sm text-[#f0f4ff] leading-relaxed">{selectedPost.caption}</p>
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedPost.caption).catch(() => {});
                  }}
                >
                  Copy Caption
                </button>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-[#8899bb]">
              <span className="flex items-center gap-1">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] border ${platformBadgeClass('Instagram')}`}>In</span>
                Instagram
              </span>
              <span className="flex items-center gap-1">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] border ${platformBadgeClass('Facebook')}`}>Fa</span>
                Facebook
              </span>
              <span className="flex items-center gap-1">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] border ${platformBadgeClass('Email')}`}>Em</span>
                Email
              </span>
            </div>
          </div>
        )}

        {!calResult && !calLoading && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-xl bg-[#141d35] border border-[#1e2d4a] flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#8899bb]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-[#8899bb]">Click "Generate Calendar" to create your 7-day content plan</p>
          </div>
        )}
      </div>
    </div>
  );
}
