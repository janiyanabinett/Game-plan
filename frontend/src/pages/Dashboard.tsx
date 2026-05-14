import { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { aiApi, agentsApi } from '../../lib/api';
import type { DashboardData, AgentHealth, ActivityEntry, AgentKey, Lead, LeadTier } from '../../types/index';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatRelative(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function snakeToTitle(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Agent color maps ──────────────────────────────────────────────────────────

const AGENT_DOT: Record<AgentKey, string> = {
  lead_generation:  'bg-red-500',
  lead_nurturing:   'bg-amber-500',
  media_creation:   'bg-purple-500',
  three_d_media:    'bg-violet-500',
  letter_writing:   'bg-blue-500',
  auto_response:    'bg-cyan-500',
  property_search:  'bg-green-500',
  marketing:        'bg-pink-500',
  sales:            'bg-orange-500',
  research:         'bg-emerald-500',
};

const AGENT_TEXT: Record<AgentKey, string> = {
  lead_generation:  'text-red-400',
  lead_nurturing:   'text-amber-400',
  media_creation:   'text-purple-400',
  three_d_media:    'text-violet-400',
  letter_writing:   'text-blue-400',
  auto_response:    'text-cyan-400',
  property_search:  'text-green-400',
  marketing:        'text-pink-400',
  sales:            'text-orange-400',
  research:         'text-emerald-400',
};

const AGENT_BADGE: Record<AgentKey, string> = {
  lead_generation:  'bg-red-500/15 border-red-500/25 text-red-400',
  lead_nurturing:   'bg-amber-500/15 border-amber-500/25 text-amber-400',
  media_creation:   'bg-purple-500/15 border-purple-500/25 text-purple-400',
  three_d_media:    'bg-violet-500/15 border-violet-500/25 text-violet-400',
  letter_writing:   'bg-blue-500/15 border-blue-500/25 text-blue-400',
  auto_response:    'bg-cyan-500/15 border-cyan-500/25 text-cyan-400',
  property_search:  'bg-green-500/15 border-green-500/25 text-green-400',
  marketing:        'bg-pink-500/15 border-pink-500/25 text-pink-400',
  sales:            'bg-orange-500/15 border-orange-500/25 text-orange-400',
  research:         'bg-emerald-500/15 border-emerald-500/25 text-emerald-400',
};

// ── Small reusables ───────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: LeadTier | undefined }) {
  if (!tier) return null;
  const cls = tier === 'hot' ? 'badge-hot' : tier === 'warm' ? 'badge-warm' : 'badge-cold';
  const label = tier.charAt(0).toUpperCase() + tier.slice(1);
  return <span className={cls}>{label}</span>;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1e2d4a]/60 rounded-lg ${className ?? ''}`} />;
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      {/* main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-64" />
          <Skeleton className="h-56" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-72" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </div>
  );
}

// ── Agent Fleet Card ──────────────────────────────────────────────────────────

function AgentCard({ agent }: { agent: AgentHealth }) {
  const dot  = AGENT_DOT[agent.id]  ?? 'bg-emerald-500';
  const text = AGENT_TEXT[agent.id] ?? 'text-emerald-400';
  return (
    <div className="card-hover p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-[#f0f4ff] leading-tight">
          {snakeToTitle(agent.id)}
        </p>
        <span className="badge-active shrink-0">
          <span className={`agent-pulse shrink-0 ${dot}`} />
          Active
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-[#8899bb]">
        <span>
          <span className={`font-semibold ${text}`}>
            {agent.tasksCompleted.toLocaleString()}
          </span>
          {' '}tasks
        </span>
        <span className="text-[11px]">{formatRelative(agent.lastActive)}</span>
      </div>
    </div>
  );
}

// ── Activity Feed Row ─────────────────────────────────────────────────────────

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const dot   = AGENT_DOT[entry.agent]   ?? 'bg-slate-500';
  const badge = AGENT_BADGE[entry.agent] ?? 'bg-slate-500/15 border-slate-500/25 text-slate-400';
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[#1e2d4a] last:border-0">
      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${badge}`}>
            {snakeToTitle(entry.agent)}
          </span>
          <span className="text-sm text-[#f0f4ff] truncate">{entry.action}</span>
        </div>
      </div>
      <span className="text-xs text-[#8899bb] shrink-0 mt-0.5 whitespace-nowrap">
        {formatRelative(entry.timestamp)}
      </span>
    </div>
  );
}

// ── Pipeline Bar Chart ────────────────────────────────────────────────────────

interface ChartDatum { stage: string; count: number; }

const STAGE_ORDER = [
  'Lead', 'Contacted', 'Qualified', 'Showing', 'Offer', 'Under Contract', 'Closed',
];

function PipelineChart({ metrics }: { metrics: DashboardData['metrics'] }) {
  const accumulator: Record<string, number> = {};

  for (const agentMetrics of Object.values(metrics)) {
    for (const [key, val] of Object.entries(agentMetrics)) {
      if (STAGE_ORDER.includes(key) && typeof val === 'number') {
        accumulator[key] = (accumulator[key] ?? 0) + val;
      }
    }
  }

  const sorted: ChartDatum[] = STAGE_ORDER
    .filter((s) => (accumulator[s] ?? 0) > 0)
    .map((s) => ({ stage: s, count: accumulator[s] }));

  if (sorted.length === 0) return null;

  return (
    <div className="card p-5">
      <p className="text-sm font-semibold text-[#f0f4ff] mb-4">Pipeline Stages</p>
      <ResponsiveContainer width="100%" height={156}>
        <BarChart data={sorted} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="stage"
            tick={{ fill: '#8899bb', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#8899bb', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: '#0f1629',
              border: '1px solid #1e2d4a',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: '#f0f4ff' }}
            itemStyle={{ color: '#c9a84c' }}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {sorted.map((_, i) => (
              <Cell
                key={i}
                fill={i === sorted.length - 1 ? '#c9a84c' : '#3b82f6'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Main Dashboard Component ──────────────────────────────────────────────────

export default function PropAIDashboard() {
  const [data, setData]                       = useState<DashboardData | null>(null);
  const [activity, setActivity]               = useState<ActivityEntry[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);
  const [lastUpdated, setLastUpdated]         = useState<Date | null>(null);
  const [researchFlash, setResearchFlash]     = useState(false);
  const [triggeringResearch, setTriggeringResearch] = useState(false);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [dashRes, actRes] = await Promise.all([
        aiApi.getDashboard(),
        agentsApi.getActivity(10),
      ]);
      setData(dashRes.data as DashboardData);
      setActivity(
        ((actRes.data as { activity?: ActivityEntry[] }).activity ?? []),
      );
      setLastUpdated(new Date());
    } catch {
      setError('Failed to load dashboard data. Retrying will re-fetch all agent stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleRefresh() {
    setLoading(true);
    await loadData();
  }

  async function handleTriggerResearch() {
    if (triggeringResearch) return;
    setTriggeringResearch(true);
    try {
      await agentsApi.triggerResearch();
      setResearchFlash(true);
      setTimeout(() => setResearchFlash(false), 3500);
    } catch {
      // silently ignore network errors; flash is not shown
    } finally {
      setTriggeringResearch(false);
    }
  }

  // ── Render: loading ─────────────────────────────────────────────────────────
  if (loading) return <DashboardSkeleton />;

  // ── Render: error ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-4">
        <div className="card p-6 max-w-sm text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-[#8899bb]">{error}</p>
          <button className="btn-primary w-full" onClick={handleRefresh}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const recentLeads = data.recentLeads?.slice(0, 3) ?? [];
  const agents      = data.agentHealth ?? [];
  const feed        = activity.slice(0, 10);

  // ── Render: main ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">PropAI Command Center</h1>
          <p className="page-sub">
            {lastUpdated
              ? `Last updated ${formatRelative(lastUpdated.toISOString())}`
              : 'Real-time agent intelligence'}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* system status pill */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            data.systemStatus === 'operational'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
              : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
          }`}>
            <span className="agent-pulse" />
            {data.systemStatus ?? 'operational'}
          </span>
          <button
            className="btn-secondary flex items-center gap-1.5"
            onClick={handleRefresh}
          >
            {/* refresh icon */}
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
              <path
                d="M13.65 2.35A8 8 0 1 0 15 8h-2a6 6 0 1 1-1.05-3.35L10 6h5V1l-1.35 1.35z"
                fill="currentColor"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* ── Top Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Active Agents */}
        <div className="stat-card">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium text-[#8899bb] uppercase tracking-wide">
              Active Agents
            </p>
            <div className="flex items-center gap-1.5">
              <span className="agent-pulse" />
              <span className="text-[10px] text-emerald-400 font-medium">All Online</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#f0f4ff]">
            {data.totalAgents}
            <span className="text-lg text-[#8899bb] font-normal">/{data.totalAgents}</span>
          </p>
          <p className="text-xs text-[#8899bb] mt-1">Full fleet operational</p>
        </div>

        {/* Active Deals */}
        <div className="stat-card">
          <p className="text-xs font-medium text-[#8899bb] uppercase tracking-wide mb-3">
            Active Deals
          </p>
          <p className="text-3xl font-bold text-[#f0f4ff]">
            {data.salesPipeline?.activeDeals ?? 0}
          </p>
          <p className="text-xs text-[#8899bb] mt-1">
            {data.salesPipeline?.closedThisPeriod ?? 0} closed this period
          </p>
        </div>

        {/* Weighted GCI */}
        <div className="stat-card">
          <p className="text-xs font-medium text-[#8899bb] uppercase tracking-wide mb-3">
            Weighted GCI
          </p>
          <p className="text-3xl font-bold text-[#c9a84c]">
            {formatCurrency(data.salesPipeline?.weightedGCI ?? 0)}
          </p>
          <p className="text-xs text-[#8899bb] mt-1">
            {((data.salesPipeline?.conversionRate ?? 0) * 100).toFixed(0)}% conversion rate
          </p>
        </div>

        {/* Research Cycles */}
        <div className="stat-card">
          <p className="text-xs font-medium text-[#8899bb] uppercase tracking-wide mb-3">
            Research Cycles
          </p>
          <p className="text-3xl font-bold text-[#f0f4ff]">
            {data.research?.cyclesCompleted ?? 0}
          </p>
          <p className="text-xs text-[#8899bb] mt-1">
            {data.research?.insightsInKB ?? 0} KB insights stored
          </p>
        </div>
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Left / Center Column (2 cols) ─────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Agent Fleet */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="section-title">Agent Fleet</p>
                <p className="section-sub">{agents.length} agents active and reporting</p>
              </div>
              <span className="badge-active">
                <span className="agent-pulse" />
                All Systems Go
              </span>
            </div>
            {agents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {agents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#8899bb] py-6 text-center">
                No agent data available
              </p>
            )}
          </div>

          {/* Recent Activity Feed */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="section-title">Recent Activity</p>
                <p className="section-sub">Live agent action stream</p>
              </div>
              <span className="text-xs text-[#8899bb] bg-[#141d35] px-2 py-1 rounded-md">
                Last {feed.length} entries
              </span>
            </div>
            {feed.length > 0 ? (
              <div>
                {feed.map((entry) => (
                  <ActivityRow key={entry.id} entry={entry} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#8899bb] py-6 text-center">
                No recent activity
              </p>
            )}
          </div>

          {/* Recent Leads Table */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="section-title">Recent Leads</p>
                <p className="section-sub">Latest AI-qualified prospects</p>
              </div>
            </div>
            {recentLeads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1e2d4a]">
                      {['Name', 'Source', 'Score', 'Tier', 'Action'].map((h) => (
                        <th
                          key={h}
                          className="text-left py-2 px-3 text-xs font-medium text-[#8899bb] uppercase tracking-wide whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeads.map((lead: Lead, i) => {
                      const score = lead.score ?? 0;
                      const barColor =
                        score >= 70 ? 'bg-red-500' :
                        score >= 40 ? 'bg-amber-500' :
                        'bg-blue-500';
                      return (
                        <tr
                          key={lead.id ?? i}
                          className="border-b border-[#1e2d4a]/50 last:border-0 hover:bg-[#141d35] transition-colors"
                        >
                          {/* Name / Email */}
                          <td className="py-3 px-3">
                            <p className="font-medium text-[#f0f4ff] whitespace-nowrap">
                              {lead.name}
                            </p>
                            <p className="text-xs text-[#8899bb] truncate max-w-[160px]">
                              {lead.email}
                            </p>
                          </td>
                          {/* Source */}
                          <td className="py-3 px-3 text-[#8899bb] whitespace-nowrap">
                            {lead.source ?? '—'}
                          </td>
                          {/* Score bar */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-[#1e2d4a] rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                  style={{ width: `${Math.min(100, score)}%` }}
                                />
                              </div>
                              <span className="text-xs text-[#8899bb] w-6 text-right tabular-nums">
                                {score}
                              </span>
                            </div>
                          </td>
                          {/* Tier badge */}
                          <td className="py-3 px-3">
                            <TierBadge tier={lead.tier} />
                          </td>
                          {/* Recommended Action */}
                          <td className="py-3 px-3 max-w-[180px]">
                            <span className="text-xs text-[#8899bb] leading-tight line-clamp-2">
                              {lead.recommendedAction ?? '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-[#8899bb] py-6 text-center">
                No recent leads
              </p>
            )}
          </div>
        </div>

        {/* ── Right Column ──────────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Research Brain */}
          <div className="card p-5">
            {/* header */}
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
              </div>
              <div>
                <p className="section-title leading-tight">Research Brain</p>
                <p className="text-xs text-[#8899bb]">AI knowledge engine</p>
              </div>
            </div>

            <div className="divider" />

            {/* stats */}
            <div className="space-y-0">
              <div className="flex items-center justify-between py-2.5 border-b border-[#1e2d4a]">
                <span className="text-xs text-[#8899bb]">Insights in KB</span>
                <span className="text-sm font-semibold text-[#f0f4ff]">
                  {(data.research?.insightsInKB ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-[#1e2d4a]">
                <span className="text-xs text-[#8899bb]">Pending Upgrades</span>
                <span className={`text-sm font-semibold ${
                  (data.research?.pendingUpgrades ?? 0) > 0
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}>
                  {data.research?.pendingUpgrades ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-[#1e2d4a]">
                <span className="text-xs text-[#8899bb]">Cycles Completed</span>
                <span className="text-sm font-semibold text-[#f0f4ff]">
                  {data.research?.cyclesCompleted ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-xs text-[#8899bb]">Last Cycle</span>
                <span className="text-xs text-[#8899bb]">
                  {data.research?.lastCycle
                    ? formatRelative(data.research.lastCycle)
                    : '—'}
                </span>
              </div>
            </div>

            {/* success flash */}
            <div className="mt-4 space-y-2">
              {researchFlash && (
                <div className="px-3 py-2 bg-emerald-500/15 border border-emerald-500/30 rounded-lg animate-slide-in">
                  <p className="text-xs text-emerald-400 font-medium">
                    Research cycle triggered successfully
                  </p>
                </div>
              )}
              <button
                className={`w-full btn-primary flex items-center justify-center gap-2 ${
                  triggeringResearch ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                onClick={handleTriggerResearch}
                disabled={triggeringResearch}
              >
                {triggeringResearch ? (
                  <>
                    <svg
                      className="w-3.5 h-3.5 animate-spin"
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
                    Running…
                  </>
                ) : (
                  'Trigger Research Cycle'
                )}
              </button>
            </div>
          </div>

          {/* Pipeline bar chart (renders only if stage data exists) */}
          {data.metrics && <PipelineChart metrics={data.metrics} />}

          {/* System Overview */}
          <div className="card p-5">
            <p className="text-sm font-semibold text-[#f0f4ff] mb-3">System Overview</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8899bb]">Total Agents</span>
                <span className="text-[#f0f4ff] font-medium">{data.totalAgents}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8899bb]">System Uptime</span>
                <span className="text-emerald-400 font-medium">{data.uptime ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8899bb]">Pipeline Value</span>
                <span className="text-[#c9a84c] font-medium">
                  {formatCurrency(data.salesPipeline?.weightedGCI ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8899bb]">Data Generated</span>
                <span className="text-[#8899bb]">
                  {data.generatedAt ? formatRelative(data.generatedAt) : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
