/**
 * AgentOrchestrator
 * The CEO-level coordinator for all real estate AI agents.
 * Routes work, monitors performance, tracks activity, and manages upgrades.
 * This is the "brain" that ties the entire agency together.
 */

import { LeadGenerationAgent }  from './LeadGenerationAgent.js';
import { LeadNurturingAgent }   from './LeadNurturingAgent.js';
import { MediaCreationAgent }   from './MediaCreationAgent.js';
import { ThreeDMediaAgent }     from './ThreeDMediaAgent.js';
import { LetterWritingAgent }   from './LetterWritingAgent.js';
import { AutoResponseAgent }    from './AutoResponseAgent.js';
import { PropertySearchAgent }  from './PropertySearchAgent.js';
import { MarketingAgent }       from './MarketingAgent.js';
import { SalesAgent }           from './SalesAgent.js';
import { ResearchAgent }        from './ResearchAgent.js';

export class AgentOrchestrator {
  constructor() {
    // Instantiate all agents
    this.agents = {
      lead_generation: new LeadGenerationAgent(),
      lead_nurturing:  new LeadNurturingAgent(),
      media_creation:  new MediaCreationAgent(),
      three_d_media:   new ThreeDMediaAgent(),
      letter_writing:  new LetterWritingAgent(),
      auto_response:   new AutoResponseAgent(),
      property_search: new PropertySearchAgent(),
      marketing:       new MarketingAgent(),
      sales:           new SalesAgent(),
      research:        new ResearchAgent(),
    };

    this.activityLog = [];
    this.metrics = this.initMetrics();
    this.startTime = new Date().toISOString();

    // Kick off research cycle (simulates 24/7 operation)
    this.runResearchCycle();
  }

  initMetrics() {
    return {
      lead_generation: { tasksCompleted: 0, leadsQualified: 0, hotLeads: 0, avgScore: 0 },
      lead_nurturing:  { tasksCompleted: 0, sequencesCreated: 0, touchPointsSent: 0 },
      media_creation:  { tasksCompleted: 0, listingsCreated: 0, socialPostsGenerated: 0 },
      three_d_media:   { tasksCompleted: 0, toursProcessed: 0, mediaPoolSize: 0 },
      letter_writing:  { tasksCompleted: 0, lettersGenerated: 0, wordCount: 0 },
      auto_response:   { tasksCompleted: 0, inquiriesHandled: 0, avgResponseTime: '< 1s' },
      property_search: { tasksCompleted: 0, searchesRun: 0, propertiesServed: 0 },
      marketing:       { tasksCompleted: 0, campaignsCreated: 0, contentPieces: 0 },
      sales:           { tasksCompleted: 0, dealsManaged: 0, gciForecasted: 0 },
      research:        { tasksCompleted: 0, cyclesRun: 0, insightsGathered: 0, upgradesDistributed: 0 },
    };
  }

  // Log an activity
  log(agentKey, action, details = {}) {
    const entry = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      agent: agentKey,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    this.activityLog.unshift(entry);
    if (this.activityLog.length > 500) this.activityLog.pop(); // keep last 500
    this.metrics[agentKey].tasksCompleted++;
    return entry;
  }

  // ── ROUTE: Lead qualification ────────────────────────────────────────────
  qualifyLead(input) {
    const result = this.agents.lead_generation.qualify(input);
    this.metrics.lead_generation.leadsQualified++;
    if (result.tier === 'hot') this.metrics.lead_generation.hotLeads++;
    this.log('lead_generation', 'qualify_lead', { name: input.name, tier: result.tier, score: result.score });

    // Auto-trigger nurturing sequence for qualified leads
    if (result.tier !== 'cold') {
      const sequence = this.agents.lead_nurturing.buildSequence({ ...input, ...result });
      this.metrics.lead_nurturing.sequencesCreated++;
      this.log('lead_nurturing', 'create_sequence', { leadName: input.name, touchPoints: sequence.totalTouchPoints });
      return { qualification: result, nurturingSequence: sequence };
    }

    return { qualification: result };
  }

  // ── ROUTE: Inbound inquiry ───────────────────────────────────────────────
  handleInquiry(inquiry) {
    const response = this.agents.auto_response.respond(inquiry);
    this.metrics.auto_response.inquiriesHandled++;
    this.log('auto_response', 'respond_to_inquiry', { intent: response.intent, source: inquiry.source });

    // If high priority, also trigger lead qualification
    if (response.priority === 'high' && inquiry.senderEmail) {
      const qualification = this.agents.lead_generation.qualify({
        name: inquiry.senderName,
        email: inquiry.senderEmail,
        phone: inquiry.phone,
        message: inquiry.message,
        source: inquiry.source,
      });
      this.log('lead_generation', 'qualify_from_inquiry', { name: inquiry.senderName, tier: qualification.tier });
      return { autoResponse: response, qualification };
    }

    return { autoResponse: response };
  }

  // ── ROUTE: Generate listing content ─────────────────────────────────────
  generateListingContent(property, types = ['listing', 'social', 'email']) {
    const results = {};
    types.forEach(type => {
      results[type] = this.agents.media_creation.generate(type, property);
      this.metrics.media_creation.listingsCreated++;
    });
    if (types.includes('social')) {
      this.metrics.media_creation.socialPostsGenerated += Object.keys(results.social || {}).length;
    }
    this.log('media_creation', 'generate_content', { address: property.address, types });

    // Also generate 3D media recommendation
    const mediaPackage = this.agents.three_d_media.process('recommend_package', { price: property.price });
    this.log('three_d_media', 'recommend_package', { price: property.price, package: mediaPackage.package });

    return { ...results, mediaPackage };
  }

  // ── ROUTE: Property search ───────────────────────────────────────────────
  searchProperties(criteria) {
    const results = this.agents.property_search.search(criteria);
    this.metrics.property_search.searchesRun++;
    this.metrics.property_search.propertiesServed += results.total;
    this.log('property_search', 'search', { criteria, resultCount: results.total });
    return results;
  }

  // ── ROUTE: Build marketing campaign ─────────────────────────────────────
  buildCampaign(listing, options = {}) {
    const campaign = this.agents.marketing.buildAdCampaign(listing, options.objective, options.budget);
    const calendar = this.agents.marketing.buildContentCalendar({ name: options.agentName, market: listing.city });
    this.metrics.marketing.campaignsCreated++;
    this.metrics.marketing.contentPieces += calendar.totalPosts;
    this.log('marketing', 'build_campaign', { address: listing.address, budget: options.budget });
    return { campaign, calendar };
  }

  // ── ROUTE: Generate letter ───────────────────────────────────────────────
  generateLetter(type, vars) {
    const letter = this.agents.letter_writing.generate(type, vars);
    this.metrics.letter_writing.lettersGenerated++;
    this.metrics.letter_writing.wordCount += letter.wordCount || 0;
    this.log('letter_writing', 'generate_letter', { type, recipient: vars.buyerName || vars.homeownerName });
    return letter;
  }

  // ── ROUTE: Sales pipeline ────────────────────────────────────────────────
  getPipeline() {
    const stats = this.agents.sales.getPipelineStats();
    const deals = this.agents.sales.getDeals();
    this.metrics.sales.dealsManaged = deals.length;
    this.metrics.sales.gciForecasted = stats.weightedPipelineValue;
    this.log('sales', 'get_pipeline', { totalDeals: deals.length, weightedValue: stats.weightedPipelineValue });
    return { stats, deals };
  }

  // ── Research cycle (runs automatically) ─────────────────────────────────
  runResearchCycle() {
    const report = this.agents.research.runCycle();
    this.metrics.research.cyclesRun++;
    this.metrics.research.insightsGathered = this.agents.research.knowledgeBase
      ? Object.values(this.agents.research.knowledgeBase).flat().length : 0;

    // Distribute any queued skill upgrades
    const upgrades = this.agents.research.distributeUpgrades();
    this.metrics.research.upgradesDistributed += upgrades.count;

    this.log('research', 'run_cycle', {
      cycle: report.cycleNumber,
      source: report.sourceRead,
      topic: report.topicResearched,
      upgradesApplied: upgrades.count,
    });

    return report;
  }

  // ── Dashboard: Full system status ───────────────────────────────────────
  getDashboard() {
    const salesStats = this.agents.sales.getPipelineStats();
    const researchStatus = this.agents.research.getStatus();
    const sampleLeads = this.agents.lead_generation.generateSampleLeads(3);

    return {
      systemStatus: 'operational',
      uptime: this.startTime,
      totalAgents: Object.keys(this.agents).length,
      metrics: this.metrics,
      recentActivity: this.activityLog.slice(0, 20),
      salesPipeline: {
        activeDeals: salesStats.activeDeals,
        weightedGCI: salesStats.weightedPipelineValue,
        closedThisPeriod: salesStats.closedDeals,
        conversionRate: salesStats.conversionRate,
      },
      research: {
        cyclesCompleted: researchStatus.cyclesCompleted,
        insightsInKB: researchStatus.knowledgeBaseSize,
        pendingUpgrades: researchStatus.pendingUpgrades,
        lastCycle: researchStatus.lastRun,
      },
      recentLeads: sampleLeads,
      agentHealth: Object.entries(this.agents).map(([key, agent]) => ({
        id: key,
        name: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        status: 'active',
        tasksCompleted: this.metrics[key]?.tasksCompleted || 0,
        lastActive: this.activityLog.find(a => a.agent === key)?.timestamp || this.startTime,
      })),
      generatedAt: new Date().toISOString(),
    };
  }
}
