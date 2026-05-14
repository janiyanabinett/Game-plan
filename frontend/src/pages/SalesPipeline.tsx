import { useEffect, useState, FormEvent } from 'react';
import { agentsApi } from '../../lib/api';
import type { Deal, PipelineStats, DealStage } from '../../types/index';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function SpinnerIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2"
        strokeDasharray="28" strokeDashoffset="10" />
    </svg>
  );
}

// ── Stage config ──────────────────────────────────────────────────────────────

const STAGES: DealStage[] = [
  'Lead', 'Contacted', 'Qualified', 'Showing', 'Offer', 'Under Contract', 'Closed',
];

const STAGE_COLORS: Record<DealStage, { dot: string; header: string; border: string }> = {
  Lead:             { dot: 'bg-slate-400',   header: 'bg-slate-500/15 text-slate-300',   border: 'border-slate-500/20' },
  Contacted:        { dot: 'bg-blue-400',    header: 'bg-blue-500/15 text-blue-300',     border: 'border-blue-500/20' },
  Qualified:        { dot: 'bg-cyan-400',    header: 'bg-cyan-500/15 text-cyan-300',     border: 'border-cyan-500/20' },
  Showing:          { dot: 'bg-violet-400',  header: 'bg-violet-500/15 text-violet-300', border: 'border-violet-500/20' },
  Offer:            { dot: 'bg-amber-400',   header: 'bg-amber-500/15 text-amber-300',   border: 'border-amber-500/20' },
  'Under Contract': { dot: 'bg-orange-400',  header: 'bg-orange-500/15 text-orange-300', border: 'border-orange-500/20' },
  Closed:           { dot: 'bg-emerald-400', header: 'bg-emerald-500/15 text-emerald-300', border: 'border-emerald-500/20' },
  Lost:             { dot: 'bg-red-400',     header: 'bg-red-500/15 text-red-300',       border: 'border-red-500/20' },
};

// ── Deal Type Badge ───────────────────────────────────────────────────────────

function DealTypeBadge({ type }: { type: 'buyer' | 'seller' | 'both' }) {
  const styles: Record<string, string> = {
    buyer:  'bg-blue-500/15 text-blue-400 border-blue-500/30',
    seller: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    both:   'bg-[#c9a84c]/15 text-[#c9a84c] border-[#c9a84c]/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${styles[type] ?? styles.buyer}`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

// ── Deal Card ─────────────────────────────────────────────────────────────────

function DealCard({ deal }: { deal: Deal }) {
  const prob = Math.min(100, Math.max(0, deal.probability ?? 0));
  const barColor =
    prob >= 70 ? 'bg-emerald-500' :
    prob >= 40 ? 'bg-amber-500' :
    'bg-blue-500';

  return (
    <div className="card-hover p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-1">
        <p className="text-sm font-semibold text-[#f0f4ff] leading-tight truncate max-w-[120px]">
          {deal.clientName}
        </p>
        <DealTypeBadge type={deal.dealType} />
      </div>
      <p className="text-xs font-bold text-[#c9a84c]">{formatCurrency(deal.expectedPrice)}</p>
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[#8899bb]">Probability</span>
          <span className="text-[10px] font-semibold text-[#f0f4ff]">{prob}%</span>
        </div>
        <div className="h-1.5 bg-[#1e2d4a] rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${prob}%` }} />
        </div>
      </div>
      {deal.nextAction && (
        <p className="text-[10px] text-[#8899bb] bg-[#141d35] rounded px-2 py-1 leading-relaxed line-clamp-2">
          {deal.nextAction}
        </p>
      )}
    </div>
  );
}

// ── Objection Handler ─────────────────────────────────────────────────────────

interface Objection {
  objection: string;
  response: string;
  category?: string;
}

function ObjectionAccordion({ item }: { item: Objection }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card border border-[#1e2d4a] overflow-hidden">
      <button
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#141d35] transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <p className="text-sm font-medium text-[#f0f4ff]">{item.objection}</p>
        <svg
          className={`w-4 h-4 text-[#8899bb] shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-[#1e2d4a] bg-[#141d35]">
          <p className="text-sm text-[#8899bb] leading-relaxed pt-3">{item.response}</p>
        </div>
      )}
    </div>
  );
}

// ── GCI Forecast Form ─────────────────────────────────────────────────────────

interface ForecastForm {
  activeDeals: number;
  avgPrice: number;
  commissionRate: number;
  closeRate: number;
}

interface ForecastResult {
  projectedCloses: number;
  projectedGCI: number;
  weightedPipeline: number;
}

function GCIForecast({ defaultActiveDeals }: { defaultActiveDeals: number }) {
  const [form, setForm] = useState<ForecastForm>({
    activeDeals: defaultActiveDeals,
    avgPrice: 650_000,
    commissionRate: 2.5,
    closeRate: 35,
  });
  const [result, setResult] = useState<ForecastResult | null>(null);

  function setField<K extends keyof ForecastForm>(k: K, v: ForecastForm[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function calculate(e: FormEvent) {
    e.preventDefault();
    const projectedCloses = Math.round(form.activeDeals * (form.closeRate / 100));
    const projectedGCI = projectedCloses * form.avgPrice * (form.commissionRate / 100);
    const weightedPipeline = form.activeDeals * form.avgPrice * (form.commissionRate / 100) * (form.closeRate / 100);
    setResult({ projectedCloses, projectedGCI, weightedPipeline });
  }

  return (
    <div className="card p-6 space-y-5">
      <div>
        <p className="section-title">GCI Forecast</p>
        <p className="text-sm text-[#8899bb]">Project your gross commission income</p>
      </div>
      <form onSubmit={calculate} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="fc-deals">Active Deals</label>
            <input id="fc-deals" type="number" className="input" min={0}
              value={form.activeDeals}
              onChange={(e) => setField('activeDeals', Number(e.target.value))} />
          </div>
          <div>
            <label className="label" htmlFor="fc-avg">Avg Price ($)</label>
            <input id="fc-avg" type="number" className="input" min={0}
              value={form.avgPrice}
              onChange={(e) => setField('avgPrice', Number(e.target.value))} />
          </div>
          <div>
            <label className="label" htmlFor="fc-comm">Commission Rate (%)</label>
            <input id="fc-comm" type="number" className="input" min={0} max={10} step={0.1}
              value={form.commissionRate}
              onChange={(e) => setField('commissionRate', Number(e.target.value))} />
          </div>
          <div>
            <label className="label" htmlFor="fc-close">Close Rate (%)</label>
            <input id="fc-close" type="number" className="input" min={0} max={100}
              value={form.closeRate}
              onChange={(e) => setField('closeRate', Number(e.target.value))} />
          </div>
        </div>
        <button type="submit" className="btn-primary w-full py-2.5">Calculate Forecast</button>
      </form>

      {result && (
        <div className="grid grid-cols-3 gap-3 animate-slide-in">
          {[
            { label: 'Projected Closes', value: String(result.projectedCloses), color: 'text-[#f0f4ff]' },
            { label: 'Projected GCI', value: formatCurrency(result.projectedGCI), color: 'text-[#c9a84c]' },
            { label: 'Weighted Pipeline', value: formatCurrency(result.weightedPipeline), color: 'text-emerald-400' },
          ].map((s) => (
            <div key={s.label} className="bg-[#141d35] border border-[#1e2d4a] rounded-xl p-4 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-[#8899bb] mt-1 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface PipelineResponse {
  stats?: PipelineStats;
  deals?: Deal[];
  pipeline?: { stats?: PipelineStats; deals?: Deal[] };
  [key: string]: unknown;
}

export default function SalesPipeline() {
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [objCategory, setObjCategory] = useState<'buyer' | 'seller' | null>(null);
  const [objections, setObjections] = useState<Objection[]>([]);
  const [objLoading, setObjLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    agentsApi.getPipeline()
      .then((res) => {
        if (cancelled) return;
        const data = res.data as PipelineResponse;
        // normalise various response shapes
        const s: PipelineStats | undefined =
          data.stats ?? data.pipeline?.stats ?? (data as unknown as PipelineStats);
        const d: Deal[] =
          data.deals ?? data.pipeline?.deals ?? [];
        setStats(s ?? null);
        setDeals(d);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load pipeline data.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  async function loadObjections(cat: 'buyer' | 'seller') {
    if (objLoading) return;
    setObjCategory(cat);
    setObjLoading(true);
    setObjections([]);
    try {
      const res = await agentsApi.getObjectionHandlers(cat);
      const data = res.data as { objections?: Objection[] } | Objection[];
      const list: Objection[] = Array.isArray(data)
        ? data
        : (data as { objections?: Objection[] }).objections ?? [];
      setObjections(list);
    } catch {
      setObjections([]);
    } finally {
      setObjLoading(false);
    }
  }

  // Group deals by stage
  const dealsByStage: Record<DealStage, Deal[]> = {} as Record<DealStage, Deal[]>;
  for (const stage of STAGES) dealsByStage[stage] = [];
  for (const deal of deals) {
    if (deal.stage in dealsByStage) {
      dealsByStage[deal.stage as DealStage].push(deal);
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="animate-pulse bg-[#1e2d4a]/60 rounded-lg h-8 w-64" />
          <div className="animate-pulse bg-[#1e2d4a]/60 rounded-lg h-4 w-40" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse bg-[#1e2d4a]/60 rounded-xl h-28" />)}
        </div>
        <div className="animate-pulse bg-[#1e2d4a]/60 rounded-xl h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="page-title">Sales Pipeline</h1>
        <p className="page-sub">Deal tracking &amp; sales coaching</p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* ── Stats Row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Deals', value: String(stats?.activeDeals ?? deals.filter(d => d.stage !== 'Closed' && d.stage !== 'Lost').length), color: 'text-[#f0f4ff]' },
          { label: 'Weighted GCI', value: formatCurrency(stats?.weightedPipelineValue ?? 0), color: 'text-[#c9a84c]' },
          { label: 'Closed GCI', value: formatCurrency(stats?.totalClosedValue ?? 0), color: 'text-emerald-400' },
          { label: 'Conversion Rate', value: `${((stats?.conversionRate ?? 0) * 100).toFixed(1)}%`, color: 'text-blue-400' },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="text-xs font-medium text-[#8899bb] uppercase tracking-wide mb-3">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Kanban Board ───────────────────────────────────────────────────── */}
      <div>
        <div className="mb-4">
          <p className="section-title">Pipeline Board</p>
          <p className="text-sm text-[#8899bb]">{deals.length} deals across {STAGES.length} stages</p>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex gap-3 min-w-[900px]">
            {STAGES.map((stage) => {
              const col = STAGE_COLORS[stage];
              const colDeals = dealsByStage[stage];
              return (
                <div key={stage} className="flex-1 min-w-[140px] space-y-2">
                  {/* Column Header */}
                  <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${col.border} ${col.header}`}>
                    <span className="text-xs font-semibold truncate">{stage}</span>
                    <span className="text-xs font-bold ml-1">{colDeals.length}</span>
                  </div>

                  {/* Deal Cards */}
                  <div className="space-y-2 min-h-[80px]">
                    {colDeals.map((deal) => (
                      <DealCard key={deal.id} deal={deal} />
                    ))}
                    {colDeals.length === 0 && (
                      <div className="border-2 border-dashed border-[#1e2d4a] rounded-xl h-16 flex items-center justify-center">
                        <p className="text-[10px] text-[#4a5e7a]">Empty</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* ── Objection Handlers ─────────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="section-title">Objection Handlers</p>
            <p className="text-sm text-[#8899bb]">AI-crafted responses for common real estate objections</p>
          </div>
          <div className="flex gap-2">
            <button
              className={`${objCategory === 'buyer' && !objLoading ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
              onClick={() => loadObjections('buyer')}
              disabled={objLoading}
            >
              {objLoading && objCategory === 'buyer' ? <SpinnerIcon /> : null}
              Buyer Objections
            </button>
            <button
              className={`${objCategory === 'seller' && !objLoading ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
              onClick={() => loadObjections('seller')}
              disabled={objLoading}
            >
              {objLoading && objCategory === 'seller' ? <SpinnerIcon /> : null}
              Seller Objections
            </button>
          </div>
        </div>

        {objLoading && (
          <div className="card p-8 flex items-center justify-center gap-3">
            <SpinnerIcon />
            <p className="text-sm text-[#8899bb]">Loading objection handlers…</p>
          </div>
        )}

        {!objLoading && objCategory && objections.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-sm text-[#8899bb]">No objection handlers found for {objCategory} category.</p>
          </div>
        )}

        {!objLoading && objections.length > 0 && (
          <div className="space-y-2 animate-slide-in">
            <p className="text-sm font-semibold text-[#f0f4ff] capitalize mb-3">
              {objCategory} Objections ({objections.length})
            </p>
            {objections.map((item, i) => (
              <ObjectionAccordion key={i} item={item} />
            ))}
          </div>
        )}

        {!objCategory && (
          <div className="card p-8 text-center">
            <p className="text-sm text-[#8899bb]">Select a category above to load AI-crafted objection handlers.</p>
          </div>
        )}
      </div>

      <div className="divider" />

      {/* ── GCI Forecast ───────────────────────────────────────────────────── */}
      <GCIForecast defaultActiveDeals={stats?.activeDeals ?? deals.filter(d => d.stage !== 'Closed' && d.stage !== 'Lost').length} />
    </div>
  );
}
