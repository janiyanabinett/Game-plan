import { useEffect, useState } from 'react';
import { agentsApi } from '../../lib/api';
import type { AgentHealth, AgentKey, ActivityEntry } from '../../types/index';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ResearchStatus {
  active: boolean;
  cyclesCompleted: number;
  insightsInKB: number;
  sourcesMonitored: number;
  agentsSupported: number;
  pendingUpgrades: number;
  lastCycle?: string;
  [key: string]: unknown;
}

interface KBInsight {
  id?: string;
  insight?: string;
  text?: string;
  content?: string;
  source?: string;
  category?: string;
  topic?: string;
  applicableAgents?: string[];
  agents?: string[];
  addedAt?: string;
  timestamp?: string;
}

interface KBResponse {
  insights?: KBInsight[];
  'market_trends'?: KBInsight[];
  scripts?: KBInsight[];
  'marketing_strategies'?: KBInsight[];
  byCategory?: Record<string, KBInsight[]>;
  [key: string]: unknown;
}

interface CycleReport {
  cycleNumber?: number;
  sourceRead?: string;
  topicResearched?: string;
  newInsight?: string;
  skillUpgradeQueued?: string;
  insight?: string;
  source?: string;
  topic?: string;
  [key: string]: unknown;
}

interface SkillUpgrade {
  agent?: string;
  agentId?: string;
  skill?: string;
  description?: string;
  status?: string;
  queuedAt?: string;
}

type KBTab = 'market_trends' | 'scripts' | 'marketing_strategies';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRelative(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function SpinnerIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2"
        strokeDasharray="28" strokeDashoffset="10" />
    </svg>
  );
}

// ── Agent config ──────────────────────────────────────────────────────────────

const AGENT_COLORS: Record<AgentKey, { dot: string; bg: string; text: string; border: string }> = {
  lead_generation:  { dot: 'bg-red-500',     bg: 'bg-red-500/15',     text: 'text-red-400',     border: 'border-red-500/30' },
  lead_nurturing:   { dot: 'bg-amber-500',   bg: 'bg-amber-500/15',   text: 'text-amber-400',   border: 'border-amber-500/30' },
  media_creation:   { dot: 'bg-purple-500',  bg: 'bg-purple-500/15',  text: 'text-purple-400',  border: 'border-purple-500/30' },
  three_d_media:    { dot: 'bg-violet-500',  bg: 'bg-violet-500/15',  text: 'text-violet-400',  border: 'border-violet-500/30' },
  letter_writing:   { dot: 'bg-blue-500',    bg: 'bg-blue-500/15',    text: 'text-blue-400',    border: 'border-blue-500/30' },
  auto_response:    { dot: 'bg-cyan-500',    bg: 'bg-cyan-500/15',    text: 'text-cyan-400',    border: 'border-cyan-500/30' },
  property_search:  { dot: 'bg-green-500',   bg: 'bg-green-500/15',   text: 'text-green-400',   border: 'border-green-500/30' },
  marketing:        { dot: 'bg-pink-500',    bg: 'bg-pink-500/15',    text: 'text-pink-400',    border: 'border-pink-500/30' },
  sales:            { dot: 'bg-orange-500',  bg: 'bg-orange-500/15',  text: 'text-orange-400',  border: 'border-orange-500/30' },
  research:         { dot: 'bg-emerald-500', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

const AGENT_ICONS: Record<AgentKey, string> = {
  lead_generation: '🎯',
  lead_nurturing:  '🌱',
  media_creation:  '🎬',
  three_d_media:   '🏗️',
  letter_writing:  '✉️',
  auto_response:   '⚡',
  property_search: '🔍',
  marketing:       '📣',
  sales:           '💼',
  research:        '🧠',
};

function snakeToTitle(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── KB Insight Card ───────────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: KBInsight }) {
  const text = insight.insight ?? insight.text ?? insight.content ?? 'No content';
  const source = insight.source ?? 'Research Agent';
  const agents = insight.applicableAgents ?? insight.agents ?? [];

  return (
    <div className="card-hover p-4 space-y-3">
      <p className="text-sm text-[#f0f4ff] leading-relaxed">{text}</p>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
          {source}
        </span>
        {agents.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {agents.slice(0, 3).map((agent, i) => {
              const key = agent as AgentKey;
              const colors = AGENT_COLORS[key] ?? { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/25', dot: 'bg-slate-500' };
              return (
                <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
                  {snakeToTitle(agent)}
                </span>
              );
            })}
            {agents.length > 3 && (
              <span className="text-[10px] text-[#4a5e7a]">+{agents.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Agent Health Row ──────────────────────────────────────────────────────────

function AgentRow({ agent }: { agent: AgentHealth }) {
  const colors = AGENT_COLORS[agent.id] ?? AGENT_COLORS.research;
  const icon = AGENT_ICONS[agent.id] ?? '🤖';
  const statusColor =
    agent.status === 'active' ? 'bg-emerald-400' :
    agent.status === 'idle' ? 'bg-amber-400' :
    'bg-red-400';

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#1e2d4a] last:border-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base ${colors.bg} border ${colors.border}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#f0f4ff] truncate leading-tight">
          {snakeToTitle(agent.id)}
        </p>
        <p className="text-[10px] text-[#8899bb] mt-0.5">
          {agent.tasksCompleted.toLocaleString()} tasks
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${statusColor}`} />
          <span className={`text-[10px] font-medium ${
            agent.status === 'active' ? 'text-emerald-400' :
            agent.status === 'idle' ? 'text-amber-400' :
            'text-red-400'
          }`}>
            {agent.status}
          </span>
        </div>
        <p className="text-[10px] text-[#4a5e7a]">{formatRelative(agent.lastActive)}</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AgentLab() {
  const [researchStatus, setResearchStatus] = useState<ResearchStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const [triggering, setTriggering] = useState(false);
  const [cycleReport, setCycleReport] = useState<CycleReport | null>(null);
  const [triggerError, setTriggerError] = useState<string | null>(null);

  const [kbData, setKBData] = useState<KBResponse | null>(null);
  const [kbLoading, setKBLoading] = useState(false);
  const [activeKBTab, setActiveKBTab] = useState<KBTab>('market_trends');

  const [agents, setAgents] = useState<AgentHealth[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);

  const [skillUpgrades, setSkillUpgrades] = useState<SkillUpgrade[]>([]);

  // Load research status + agents on mount
  useEffect(() => {
    let cancelled = false;

    agentsApi.getStatus()
      .then((res) => {
        if (cancelled) return;
        const data = res.data as {
          agents?: AgentHealth[];
          agentHealth?: AgentHealth[];
          skillUpgrades?: SkillUpgrade[];
          pendingUpgrades?: SkillUpgrade[];
          [key: string]: unknown;
        };
        const agentList: AgentHealth[] =
          data.agents ?? data.agentHealth ??
          (Array.isArray(data) ? (data as unknown as AgentHealth[]) : []);
        setAgents(agentList);
        const upgrades: SkillUpgrade[] =
          data.skillUpgrades ?? data.pendingUpgrades ?? [];
        setSkillUpgrades(upgrades);
      })
      .catch(() => { if (!cancelled) setAgents([]); })
      .finally(() => { if (!cancelled) setAgentsLoading(false); });

    agentsApi.getKnowledgeBase()
      .then((res) => {
        if (cancelled) return;
        setKBData(res.data as KBResponse);
      })
      .catch(() => { /* silently */ });

    // Use activity endpoint as proxy for research status shape
    aiApi_getResearchStatus()
      .then((status) => {
        if (cancelled) return;
        setResearchStatus(status);
      })
      .finally(() => {
        if (!cancelled) setStatusLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  async function aiApi_getResearchStatus(): Promise<ResearchStatus> {
    try {
      const { agentsApi: aApi } = await import('../../lib/api');
      const res = await aApi.getActivity(1, 'research');
      const data = res.data as {
        cyclesCompleted?: number;
        insightsInKB?: number;
        research?: ResearchStatus;
        [key: string]: unknown;
      };
      if (data.research) return data.research as ResearchStatus;
      return {
        active: true,
        cyclesCompleted: Number(data.cyclesCompleted ?? 0),
        insightsInKB: Number(data.insightsInKB ?? 0),
        sourcesMonitored: 10,
        agentsSupported: 9,
        pendingUpgrades: 0,
      };
    } catch {
      return { active: true, cyclesCompleted: 0, insightsInKB: 0, sourcesMonitored: 10, agentsSupported: 9, pendingUpgrades: 0 };
    }
  }

  async function handleTriggerResearch() {
    if (triggering) return;
    setTriggering(true);
    setTriggerError(null);
    setCycleReport(null);
    try {
      const res = await agentsApi.triggerResearch();
      const data = res.data as {
        cycle?: CycleReport;
        report?: CycleReport;
        cycleNumber?: number;
        [key: string]: unknown;
      };
      const report: CycleReport =
        data.cycle ?? data.report ?? (data as CycleReport);
      setCycleReport(report);

      // Refresh KB
      setKBLoading(true);
      const kbRes = await agentsApi.getKnowledgeBase();
      setKBData(kbRes.data as KBResponse);
      setKBLoading(false);

      // Update cycle count optimistically
      setResearchStatus((prev) => prev
        ? { ...prev, cyclesCompleted: (prev.cyclesCompleted ?? 0) + 1 }
        : prev);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Research cycle failed.';
      setTriggerError(msg);
    } finally {
      setTriggering(false);
    }
  }

  function getKBInsights(tab: KBTab): KBInsight[] {
    if (!kbData) return [];
    const direct = kbData[tab];
    if (Array.isArray(direct)) return direct;
    const byCategory = kbData.byCategory;
    if (byCategory && byCategory[tab]) return byCategory[tab];
    const allInsights: KBInsight[] = Array.isArray(kbData.insights) ? kbData.insights : [];
    const catMap: Record<KBTab, string[]> = {
      market_trends: ['market', 'trend', 'price', 'inventory'],
      scripts: ['script', 'call', 'dialogue', 'sales'],
      marketing_strategies: ['marketing', 'campaign', 'social', 'content'],
    };
    const keywords = catMap[tab];
    const filtered = allInsights.filter((ins) => {
      const text = ((ins.insight ?? ins.text ?? ins.content ?? '') + (ins.category ?? '') + (ins.topic ?? '')).toLowerCase();
      return keywords.some((k) => text.includes(k));
    });
    return filtered.length > 0 ? filtered : allInsights;
  }

  const KB_TABS: { id: KBTab; label: string }[] = [
    { id: 'market_trends', label: 'Market Trends' },
    { id: 'scripts', label: 'Scripts' },
    { id: 'marketing_strategies', label: 'Marketing Strategies' },
  ];

  const kbInsights = getKBInsights(activeKBTab);

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="page-title">Agent Lab</h1>
        <p className="page-sub">AI research &amp; continuous skill improvement</p>
      </div>

      {/* ── Two-Column Layout ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── LEFT: Research Brain (2/3) ─────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Research Brain Status Card */}
          <div className="card p-6 space-y-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-[#f0f4ff]">Research Agent Active</p>
                    <span className="badge-active">
                      <span className="agent-pulse" />
                      Online
                    </span>
                  </div>
                  <p className="text-sm text-[#8899bb]">Continuous learning engine</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            {statusLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-[#1e2d4a]/60 rounded-xl h-20" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Cycles Completed', value: String(researchStatus?.cyclesCompleted ?? 0), color: 'text-[#f0f4ff]' },
                  { label: 'KB Insights', value: String(researchStatus?.insightsInKB ?? 0), color: 'text-[#c9a84c]' },
                  { label: 'Sources Monitored', value: String(researchStatus?.sourcesMonitored ?? 10), color: 'text-blue-400' },
                  { label: 'Agents Supported', value: String(researchStatus?.agentsSupported ?? 9), color: 'text-emerald-400' },
                ].map((s) => (
                  <div key={s.label} className="bg-[#141d35] border border-[#1e2d4a] rounded-xl p-4 text-center">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-[#8899bb] mt-1 leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Trigger Button */}
            <div className="space-y-3">
              <button
                onClick={handleTriggerResearch}
                disabled={triggering}
                className={`btn-primary flex items-center gap-2 py-2.5 px-6 ${triggering ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {triggering ? <><SpinnerIcon /> Running Research Cycle…</> : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 1v3M8 12v3M1 8h3M12 8h3M3.3 3.3l2.1 2.1M10.6 10.6l2.1 2.1M3.3 12.7l2.1-2.1M10.6 5.4l2.1-2.1" />
                    </svg>
                    Trigger Research Cycle
                  </>
                )}
              </button>

              {triggerError && (
                <div className="px-3 py-2 bg-red-500/10 border border-red-500/25 rounded-lg animate-slide-in">
                  <p className="text-xs text-red-400">{triggerError}</p>
                </div>
              )}

              {cycleReport && (
                <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 space-y-3 animate-slide-in">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <p className="text-sm font-semibold text-emerald-400">Research Cycle Complete</p>
                    {cycleReport.cycleNumber != null && (
                      <span className="text-xs text-emerald-400/60">#{cycleReport.cycleNumber}</span>
                    )}
                  </div>
                  <div className="space-y-2 text-xs">
                    {(cycleReport.sourceRead ?? cycleReport.source) && (
                      <div className="flex items-start gap-2">
                        <span className="text-[#8899bb] shrink-0">Source:</span>
                        <span className="text-[#f0f4ff]">{cycleReport.sourceRead ?? cycleReport.source}</span>
                      </div>
                    )}
                    {(cycleReport.topicResearched ?? cycleReport.topic) && (
                      <div className="flex items-start gap-2">
                        <span className="text-[#8899bb] shrink-0">Topic:</span>
                        <span className="text-[#f0f4ff]">{cycleReport.topicResearched ?? cycleReport.topic}</span>
                      </div>
                    )}
                    {(cycleReport.newInsight ?? cycleReport.insight) && (
                      <div className="flex items-start gap-2">
                        <span className="text-[#8899bb] shrink-0">New Insight:</span>
                        <span className="text-[#f0f4ff] leading-relaxed">{cycleReport.newInsight ?? cycleReport.insight}</span>
                      </div>
                    )}
                    {cycleReport.skillUpgradeQueued && (
                      <div className="flex items-start gap-2">
                        <span className="text-[#8899bb] shrink-0">Upgrade Queued:</span>
                        <span className="text-amber-400 font-medium">{cycleReport.skillUpgradeQueued}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Knowledge Base */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-[#1e2d4a]">
              <p className="section-title">Knowledge Base</p>
              <p className="text-sm text-[#8899bb]">AI-curated real estate intelligence</p>
            </div>

            {/* KB Tabs */}
            <div className="flex border-b border-[#1e2d4a] px-5 pt-4 gap-1">
              {KB_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveKBTab(tab.id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-t-lg border border-b-0 transition-all -mb-px ${
                    activeKBTab === tab.id
                      ? 'bg-[#0f1629] border-[#1e2d4a] text-[#c9a84c]'
                      : 'bg-transparent border-transparent text-[#8899bb] hover:text-[#f0f4ff]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {kbLoading && (
                <div className="flex items-center justify-center gap-3 py-8">
                  <SpinnerIcon />
                  <p className="text-sm text-[#8899bb]">Loading knowledge base…</p>
                </div>
              )}
              {!kbLoading && kbInsights.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm text-[#8899bb]">No insights yet. Trigger a research cycle to populate the knowledge base.</p>
                </div>
              )}
              {!kbLoading && kbInsights.length > 0 && (
                <div className="space-y-3">
                  {kbInsights.slice(0, 8).map((insight, i) => (
                    <InsightCard key={insight.id ?? i} insight={insight} />
                  ))}
                  {kbInsights.length > 8 && (
                    <p className="text-xs text-center text-[#8899bb] pt-2">
                      +{kbInsights.length - 8} more insights in this category
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Agent Health (1/3) ──────────────────────────────────── */}
        <div className="space-y-5">

          {/* Agent Health Card */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-[#1e2d4a]">
              <p className="section-title">Agent Health</p>
              <p className="text-sm text-[#8899bb]">All 10 agents</p>
            </div>
            <div className="px-5 py-2">
              {agentsLoading ? (
                <div className="space-y-3 py-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-[#1e2d4a]/60 rounded-lg h-12" />
                  ))}
                </div>
              ) : agents.length === 0 ? (
                <p className="text-sm text-[#8899bb] py-6 text-center">No agent data available.</p>
              ) : (
                agents.map((agent) => <AgentRow key={agent.id} agent={agent} />)
              )}
            </div>
          </div>

          {/* Skill Upgrade Queue */}
          <div className="card p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="section-title">Skill Upgrade Queue</p>
                <p className="text-sm text-[#8899bb]">
                  {skillUpgrades.length > 0
                    ? `${skillUpgrades.length} pending upgrade${skillUpgrades.length !== 1 ? 's' : ''}`
                    : 'No pending upgrades'}
                </p>
              </div>
              {skillUpgrades.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {skillUpgrades.length}
                </span>
              )}
            </div>

            {skillUpgrades.length === 0 && (
              <div className="bg-[#141d35] border border-[#1e2d4a] rounded-xl p-4 text-center">
                <p className="text-sm text-[#8899bb]">All agents are up-to-date. Trigger a research cycle to queue new upgrades.</p>
              </div>
            )}

            {skillUpgrades.length > 0 && (
              <div className="space-y-2">
                {skillUpgrades.map((upgrade, i) => {
                  const agentKey = (upgrade.agent ?? upgrade.agentId ?? '') as AgentKey;
                  const colors = AGENT_COLORS[agentKey] ?? AGENT_COLORS.research;
                  const icon = AGENT_ICONS[agentKey] ?? '🤖';
                  return (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${colors.bg} ${colors.border}`}>
                      <span className="text-base shrink-0">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${colors.text}`}>
                          {snakeToTitle(agentKey || 'agent')}
                        </p>
                        <p className="text-xs text-[#8899bb] mt-0.5 leading-relaxed">
                          {upgrade.skill ?? upgrade.description ?? 'Skill improvement queued'}
                        </p>
                        {upgrade.status && (
                          <span className={`mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                            upgrade.status === 'complete' ? 'bg-emerald-500/20 text-emerald-400' :
                            upgrade.status === 'applied'  ? 'bg-blue-500/20 text-blue-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {upgrade.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recent activity from research agent */}
            <RecentResearchActivity />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Recent Research Activity (inline sub-component) ───────────────────────────

function RecentResearchActivity() {
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    agentsApi.getActivity(5, 'research')
      .then((res) => {
        if (cancelled) return;
        const data = res.data as { activity?: ActivityEntry[] } | ActivityEntry[];
        const list: ActivityEntry[] = Array.isArray(data)
          ? data
          : (data as { activity?: ActivityEntry[] }).activity ?? [];
        setActivity(list.slice(0, 5));
      })
      .catch(() => { /* silently */ });
    return () => { cancelled = true; };
  }, []);

  if (activity.length === 0) return null;

  return (
    <div className="space-y-2 pt-2 border-t border-[#1e2d4a]">
      <p className="text-xs font-semibold text-[#8899bb] uppercase tracking-wide">Recent Research Activity</p>
      {activity.map((entry) => (
        <div key={entry.id} className="flex items-start gap-2 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#f0f4ff] leading-relaxed truncate">{entry.action}</p>
            <p className="text-[10px] text-[#4a5e7a]">
              {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
