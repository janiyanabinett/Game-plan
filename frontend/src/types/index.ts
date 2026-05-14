// ── Agent types ──────────────────────────────────────────────────────────────
export type AgentKey =
  | 'lead_generation' | 'lead_nurturing' | 'media_creation' | 'three_d_media'
  | 'letter_writing' | 'auto_response' | 'property_search' | 'marketing'
  | 'sales' | 'research';

export interface AgentHealth {
  id: AgentKey;
  name: string;
  status: 'active' | 'idle' | 'error';
  tasksCompleted: number;
  lastActive: string;
}

export interface ActivityEntry {
  id: string;
  agent: AgentKey;
  action: string;
  details: Record<string, unknown>;
  timestamp: string;
}

// ── Lead types ───────────────────────────────────────────────────────────────
export type LeadTier = 'hot' | 'warm' | 'cold';
export type LeadIntent = 'buyer' | 'seller' | 'both' | 'unknown';

export interface Lead {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  source?: string;
  timeframe?: string;
  score?: number;
  tier?: LeadTier;
  intent?: LeadIntent;
  budget?: string[];
  recommendedAction?: string;
  scoringFactors?: string[];
  qualifiedAt?: string;
  priority?: number;
}

// ── Property types ───────────────────────────────────────────────────────────
export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  pricePerSqft: number;
  beds: number;
  baths: number;
  sqft: number;
  lotSize: number;
  yearBuilt: number;
  style: string;
  garage: number;
  pool: boolean;
  hoa: number;
  status: string;
  daysOnMarket: number;
  source: string;
  propertyType: string;
  photos: string[];
  virtualTour: boolean;
  openHouse: { date: string; time: string } | null;
  schools: {
    elementary: { name: string; rating: number };
    middle: { name: string; rating: number };
    high: { name: string; rating: number };
  };
  walkScore: number;
  description: string;
  listedDate: string;
  mlsNumber: string;
}

export interface PropertySearchResult {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  sources: string[];
  results: Property[];
  searchSummary: string;
}

// ── Sales / Deal types ───────────────────────────────────────────────────────
export type DealStage =
  | 'Lead' | 'Contacted' | 'Qualified' | 'Showing'
  | 'Offer' | 'Under Contract' | 'Closed' | 'Lost';

export interface Deal {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  dealType: 'buyer' | 'seller' | 'both';
  stage: DealStage;
  expectedPrice: number;
  estimatedCommission: number;
  probability: number;
  createdAt: string;
  lastActivity: string;
  nextAction: string;
  propertyAddress: string;
}

export interface PipelineStats {
  totalDeals: number;
  activeDeals: number;
  closedDeals: number;
  totalPipelineValue: number;
  weightedPipelineValue: number;
  totalClosedValue: number;
  byStage: Record<string, number>;
  conversionRate: number;
  avgDealSize: number;
}

// ── Dashboard types ──────────────────────────────────────────────────────────
export interface DashboardData {
  systemStatus: string;
  uptime: string;
  totalAgents: number;
  metrics: Record<AgentKey, Record<string, number | string>>;
  recentActivity: ActivityEntry[];
  salesPipeline: {
    activeDeals: number;
    weightedGCI: number;
    closedThisPeriod: number;
    conversionRate: number;
  };
  research: {
    cyclesCompleted: number;
    insightsInKB: number;
    pendingUpgrades: number;
    lastCycle: string;
  };
  recentLeads: Lead[];
  agentHealth: AgentHealth[];
  generatedAt: string;
}
