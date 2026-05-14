import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { aiApi } from '../../lib/api';
import type { Property, PropertySearchResult } from '../../types/index';

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatPrice(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

const SOURCES = ['MLS', 'Zillow', 'Redfin', 'Realtor.com', 'Homes.com'];

const SOURCE_COLORS: Record<string, string> = {
  MLS: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Zillow: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Redfin: 'bg-red-500/20 text-red-400 border-red-500/30',
  'Realtor.com': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Homes.com': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  Pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  'Coming Soon': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  'Price Reduced': 'bg-red-500/20 text-red-400 border border-red-500/30',
};

function statusStyle(status: string): string {
  return (
    STATUS_STYLES[status] ??
    'bg-[#1e2d4a] text-[#8899bb] border border-[#1e2d4a]'
  );
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface SearchCriteria {
  city: string;
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  minBaths: string;
  pool: boolean;
  virtualTour: boolean;
  sortBy: string;
}

interface MarketStats {
  city: string;
  medianPrice: number;
  avgDaysOnMarket: number;
  activeListings: number;
  priceRange: { min: number; max: number };
  priceHistory?: { month: string; price: number }[];
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#1e2d4a]/60 rounded-lg ${className ?? ''}`} />
  );
}

function PropertyCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

// ── Source Badge ───────────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: string }) {
  const cls =
    SOURCE_COLORS[source] ??
    'bg-[#1e2d4a] text-[#8899bb] border border-[#1e2d4a]';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cls}`}
    >
      {source}
    </span>
  );
}

// ── Property Card ──────────────────────────────────────────────────────────────

function PropertyCard({ property }: { property: Property }) {
  const photoUrl =
    property.photos?.[0] ??
    `https://picsum.photos/seed/${property.id}/400/250`;

  return (
    <div className="card-hover overflow-hidden flex flex-col animate-slide-in">
      {/* Photo */}
      <div className="relative">
        <img
          src={photoUrl}
          alt={property.address}
          className="w-full h-44 object-cover bg-[#141d35]"
          onError={(e) => {
            const img = e.currentTarget;
            img.src = `https://picsum.photos/seed/${property.id}/400/250`;
          }}
        />
        {/* Status badge overlay */}
        <div className="absolute top-2 left-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyle(
              property.status
            )}`}
          >
            {property.status}
          </span>
        </div>
        {/* Virtual Tour badge */}
        {property.virtualTour && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/25 text-violet-300 border border-violet-500/40">
              <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 3a5 5 0 100 10A5 5 0 008 3zm0 1.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7zM8 6a2 2 0 100 4A2 2 0 008 6z" />
              </svg>
              360°
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Price */}
        <p className="text-xl font-bold text-[#c9a84c] leading-tight">
          {formatPrice(property.price)}
        </p>

        {/* Address */}
        <div>
          <p className="text-sm font-medium text-[#f0f4ff] leading-snug">
            {property.address}
          </p>
          <p className="text-xs text-[#8899bb]">
            {property.city}, {property.state} {property.zip}
          </p>
        </div>

        {/* Bed / Bath / Sqft row */}
        <div className="flex items-center gap-3 text-xs text-[#8899bb]">
          <span className="flex items-center gap-1">
            <span>🛏</span>
            <span className="font-medium text-[#f0f4ff]">{property.beds}</span>
            <span>bd</span>
          </span>
          <span className="text-[#1e2d4a]">·</span>
          <span className="flex items-center gap-1">
            <span>🛁</span>
            <span className="font-medium text-[#f0f4ff]">{property.baths}</span>
            <span>ba</span>
          </span>
          <span className="text-[#1e2d4a]">·</span>
          <span className="flex items-center gap-1">
            <span>📐</span>
            <span className="font-medium text-[#f0f4ff]">
              {formatNumber(property.sqft)}
            </span>
            <span>sqft</span>
          </span>
        </div>

        {/* $/sqft */}
        <p className="text-xs text-[#8899bb]">
          ${property.pricePerSqft?.toFixed(0) ?? '—'}/sqft
        </p>

        {/* Footer row */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#1e2d4a] flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <SourceBadge source={property.source} />
            <span className="text-[10px] text-[#8899bb]">
              {property.daysOnMarket === 0
                ? 'New'
                : `${property.daysOnMarket}d ago`}
            </span>
          </div>
          <button className="btn-primary py-1 px-3 text-xs">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Market Stats Sidebar ───────────────────────────────────────────────────────

function MarketStatsSidebar() {
  const [city, setCity] = useState('Austin');
  const [inputCity, setInputCity] = useState('Austin');
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async (targetCity: string) => {
    if (!targetCity.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await aiApi.getMarketStats(targetCity);
      setStats(res.data as MarketStats);
    } catch {
      setError('Could not load market stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats(city);
  }, [city, loadStats]);

  function handleCitySearch() {
    setCity(inputCity);
  }

  const priceChartData = stats?.priceHistory?.map((p) => ({
    month: p.month,
    price: Math.round(p.price / 1000),
  })) ?? (
    stats
      ? [
          { month: 'Min', price: Math.round((stats.priceRange?.min ?? 0) / 1000) },
          { month: 'Median', price: Math.round((stats.medianPrice ?? 0) / 1000) },
          { month: 'Max', price: Math.round((stats.priceRange?.max ?? 0) / 1000) },
        ]
      : []
  );

  return (
    <div className="space-y-4">
      {/* City selector */}
      <div className="card p-4">
        <p className="section-title text-sm mb-3">Market Intelligence</p>
        <div className="flex gap-2">
          <input
            className="input flex-1 text-xs py-1.5"
            placeholder="Enter city..."
            value={inputCity}
            onChange={(e) => setInputCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCitySearch()}
          />
          <button
            className="btn-primary py-1.5 px-3 text-xs whitespace-nowrap"
            onClick={handleCitySearch}
          >
            Go
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="card p-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-xs text-red-400">{error}</p>
        ) : stats ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[#f0f4ff]">{stats.city}</p>
              <span className="badge-active text-[10px]">Live</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#141d35] rounded-lg">
                <p className="text-[10px] text-[#8899bb] uppercase tracking-wide mb-1">
                  Median Price
                </p>
                <p className="text-lg font-bold text-[#c9a84c]">
                  {formatPrice(stats.medianPrice ?? 0)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-[#141d35] rounded-lg">
                  <p className="text-[10px] text-[#8899bb] uppercase tracking-wide mb-1">
                    Avg DOM
                  </p>
                  <p className="text-base font-bold text-[#f0f4ff]">
                    {stats.avgDaysOnMarket ?? 0}
                    <span className="text-xs text-[#8899bb] font-normal"> days</span>
                  </p>
                </div>
                <div className="p-3 bg-[#141d35] rounded-lg">
                  <p className="text-[10px] text-[#8899bb] uppercase tracking-wide mb-1">
                    Active
                  </p>
                  <p className="text-base font-bold text-[#f0f4ff]">
                    {formatNumber(stats.activeListings ?? 0)}
                  </p>
                </div>
              </div>

              {stats.priceRange && (
                <div className="p-3 bg-[#141d35] rounded-lg">
                  <p className="text-[10px] text-[#8899bb] uppercase tracking-wide mb-1">
                    Price Range
                  </p>
                  <p className="text-xs text-[#f0f4ff]">
                    {formatPrice(stats.priceRange.min)}
                    <span className="text-[#8899bb]"> – </span>
                    {formatPrice(stats.priceRange.max)}
                  </p>
                </div>
              )}
            </div>

            {/* Mini chart */}
            {priceChartData.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] text-[#8899bb] uppercase tracking-wide mb-2">
                  Price Range Overview (K)
                </p>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart
                    data={priceChartData}
                    margin={{ top: 0, right: 0, left: -28, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#8899bb', fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#8899bb', fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#0f1629',
                        border: '1px solid #1e2d4a',
                        borderRadius: 6,
                        fontSize: 11,
                      }}
                      labelStyle={{ color: '#f0f4ff' }}
                      itemStyle={{ color: '#c9a84c' }}
                      formatter={(v: number) => [`$${v}K`, 'Price']}
                    />
                    <Bar dataKey="price" radius={[3, 3, 0, 0]}>
                      {priceChartData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={
                            i === 1 ? '#c9a84c' : '#3b82f6'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function PropertySearch() {
  const [criteria, setCriteria] = useState<SearchCriteria>({
    city: '',
    minPrice: '',
    maxPrice: '',
    minBeds: '',
    minBaths: '',
    pool: false,
    virtualTour: false,
    sortBy: 'newest',
  });
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [results, setResults] = useState<PropertySearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const buildPayload = useCallback(
    (c: SearchCriteria) => {
      const payload: Record<string, unknown> = {};
      if (c.city.trim()) payload.city = c.city.trim();
      if (c.minPrice) payload.minPrice = parseInt(c.minPrice, 10);
      if (c.maxPrice) payload.maxPrice = parseInt(c.maxPrice, 10);
      if (c.minBeds) payload.minBeds = parseInt(c.minBeds, 10);
      if (c.minBaths) payload.minBaths = parseInt(c.minBaths, 10);
      if (c.pool) payload.pool = true;
      if (c.virtualTour) payload.virtualTour = true;
      if (c.sortBy) payload.sortBy = c.sortBy;
      return payload;
    },
    []
  );

  const runSearch = useCallback(
    async (c: SearchCriteria) => {
      setLoading(true);
      setError(null);
      try {
        const res = await aiApi.searchProperties(buildPayload(c));
        setResults(res.data as PropertySearchResult);
        setHasSearched(true);
      } catch {
        setError('Property search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [buildPayload]
  );

  // Auto-load on mount with default criteria
  useEffect(() => {
    runSearch(criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch() {
    runSearch(criteria);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch();
  }

  const properties = results?.results ?? [];

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="page-title">Property Search</h1>
        <p className="page-sub">
          Aggregated from MLS · Zillow · Redfin · Realtor.com · Homes.com
        </p>

        {/* Source badges */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {SOURCES.map((s) => (
            <SourceBadge key={s} source={s} />
          ))}
        </div>
      </div>

      {/* ── Main Layout: Filters + Results + Sidebar ─────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* Left column: filters + results */}
        <div className="xl:col-span-3 space-y-6">

          {/* ── Search / Filter Card ─────────────────────────────────────────── */}
          <div className="card">
            {/* Collapsible toggle */}
            <button
              className="w-full flex items-center justify-between p-4 text-left"
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <span className="text-sm font-semibold text-[#f0f4ff]">
                Search Filters
              </span>
              <svg
                className={`w-4 h-4 text-[#8899bb] transition-transform ${
                  filtersOpen ? 'rotate-180' : ''
                }`}
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {filtersOpen && (
              <div className="px-4 pb-4 border-t border-[#1e2d4a]">
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                  {/* City */}
                  <div className="sm:col-span-2">
                    <label className="label">City</label>
                    <input
                      className="input"
                      placeholder="e.g. Austin, TX"
                      value={criteria.city}
                      onChange={(e) =>
                        setCriteria((c) => ({ ...c, city: e.target.value }))
                      }
                      onKeyDown={handleKeyDown}
                    />
                  </div>

                  {/* Min Price */}
                  <div>
                    <label className="label">Min Price</label>
                    <input
                      className="input"
                      type="number"
                      placeholder="e.g. 200000"
                      value={criteria.minPrice}
                      onChange={(e) =>
                        setCriteria((c) => ({ ...c, minPrice: e.target.value }))
                      }
                    />
                  </div>

                  {/* Max Price */}
                  <div>
                    <label className="label">Max Price</label>
                    <input
                      className="input"
                      type="number"
                      placeholder="e.g. 800000"
                      value={criteria.maxPrice}
                      onChange={(e) =>
                        setCriteria((c) => ({ ...c, maxPrice: e.target.value }))
                      }
                    />
                  </div>

                  {/* Min Beds */}
                  <div>
                    <label className="label">Min Beds</label>
                    <select
                      className="select"
                      value={criteria.minBeds}
                      onChange={(e) =>
                        setCriteria((c) => ({ ...c, minBeds: e.target.value }))
                      }
                    >
                      <option value="">Any</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n === 5 ? '5+' : n}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Min Baths */}
                  <div>
                    <label className="label">Min Baths</label>
                    <select
                      className="select"
                      value={criteria.minBaths}
                      onChange={(e) =>
                        setCriteria((c) => ({ ...c, minBaths: e.target.value }))
                      }
                    >
                      <option value="">Any</option>
                      {[1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>
                          {n === 4 ? '4+' : n}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="label">Sort By</label>
                    <select
                      className="select"
                      value={criteria.sortBy}
                      onChange={(e) =>
                        setCriteria((c) => ({ ...c, sortBy: e.target.value }))
                      }
                    >
                      <option value="newest">Newest</option>
                      <option value="price_asc">Price Low–High</option>
                      <option value="price_desc">Price High–Low</option>
                      <option value="price_per_sqft">$/sqft</option>
                    </select>
                  </div>

                  {/* Toggles row */}
                  <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 flex items-center gap-6 flex-wrap">
                    {/* Pool toggle */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={criteria.pool}
                        onClick={() =>
                          setCriteria((c) => ({ ...c, pool: !c.pool }))
                        }
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          criteria.pool ? 'bg-[#c9a84c]' : 'bg-[#1e2d4a]'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                            criteria.pool ? 'translate-x-4' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-sm text-[#f0f4ff]">Pool</span>
                    </label>

                    {/* Virtual Tour toggle */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={criteria.virtualTour}
                        onClick={() =>
                          setCriteria((c) => ({
                            ...c,
                            virtualTour: !c.virtualTour,
                          }))
                        }
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          criteria.virtualTour ? 'bg-[#c9a84c]' : 'bg-[#1e2d4a]'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                            criteria.virtualTour
                              ? 'translate-x-4'
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-sm text-[#f0f4ff]">
                        Has Virtual Tour
                      </span>
                    </label>

                    {/* Search button */}
                    <div className="ml-auto">
                      <button
                        className={`btn-primary flex items-center gap-2 ${
                          loading ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                        onClick={handleSearch}
                        disabled={loading}
                      >
                        {loading ? (
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
                            Searching…
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3.5 h-3.5"
                              viewBox="0 0 16 16"
                              fill="none"
                            >
                              <circle
                                cx="6.5"
                                cy="6.5"
                                r="4.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              />
                              <path
                                d="M10 10l3.5 3.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                            </svg>
                            Search
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Results ──────────────────────────────────────────────────────── */}
          {error && (
            <div className="card p-4 border-red-500/30">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Summary bar */}
          {(hasSearched || loading) && (
            <div className="flex items-center justify-between flex-wrap gap-2">
              {loading ? (
                <Skeleton className="h-5 w-40" />
              ) : results ? (
                <div>
                  <span className="text-sm font-semibold text-[#f0f4ff]">
                    {results.total?.toLocaleString() ?? properties.length} homes found
                  </span>
                  {results.searchSummary && (
                    <span className="text-sm text-[#8899bb] ml-2">
                      — {results.searchSummary}
                    </span>
                  )}
                </div>
              ) : null}
              {results && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {results.sources?.map((s) => (
                    <SourceBadge key={s} source={s} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : hasSearched && !error ? (
            <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
              <svg
                className="w-10 h-10 text-[#1e2d4a]"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M16.5 16.5l4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-sm text-[#8899bb]">
                No properties found. Try adjusting your search criteria.
              </p>
              <button
                className="btn-secondary text-xs"
                onClick={() => {
                  setCriteria({
                    city: '',
                    minPrice: '',
                    maxPrice: '',
                    minBeds: '',
                    minBaths: '',
                    pool: false,
                    virtualTour: false,
                    sortBy: 'newest',
                  });
                  runSearch({
                    city: '',
                    minPrice: '',
                    maxPrice: '',
                    minBeds: '',
                    minBaths: '',
                    pool: false,
                    virtualTour: false,
                    sortBy: 'newest',
                  });
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : null}
        </div>

        {/* ── Right sidebar: Market Stats ──────────────────────────────────── */}
        <div className="xl:col-span-1">
          <MarketStatsSidebar />
        </div>
      </div>
    </div>
  );
}
