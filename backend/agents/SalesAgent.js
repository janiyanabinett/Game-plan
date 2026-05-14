/**
 * SalesAgent
 * Manages the sales pipeline, generates scripts, handles objections,
 * tracks deals, and provides conversion coaching for real estate agents.
 */

export class SalesAgent {
  constructor() {
    this.stages = ['Lead', 'Contacted', 'Qualified', 'Showing', 'Offer', 'Under Contract', 'Closed', 'Lost'];
    this.dealTypes = ['buyer', 'seller', 'both'];

    // Sample pipeline seeded for demo
    this.pipeline = this.seedPipeline();
  }

  seedPipeline() {
    const names = ['Marcus Johnson', 'Sarah Chen', 'David Torres', 'Emily Rivera', 'James Park',
      'Lisa Wong', 'Carlos Mendez', 'Rachel Kim', 'Tyler Brooks', 'Maria Santos'];
    const stages = ['Lead', 'Contacted', 'Qualified', 'Showing', 'Offer', 'Under Contract', 'Closed'];
    const pipeline = [];

    names.forEach((name, i) => {
      const stage = stages[Math.min(i, stages.length - 1)];
      const price = Math.round((Math.random() * 600000 + 300000) / 5000) * 5000;
      const commission = Math.round(price * 0.025);
      pipeline.push({
        id: `deal-${1000 + i}`,
        clientName: name,
        email: `${name.toLowerCase().replace(/\s/g, '.')}@email.com`,
        phone: `555-0${100 + i}`,
        dealType: i % 3 === 0 ? 'seller' : 'buyer',
        stage,
        expectedPrice: price,
        estimatedCommission: commission,
        probability: this.stageProbability(stage),
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        nextAction: this.getNextAction(stage, i % 3 === 0 ? 'seller' : 'buyer'),
        notes: '',
        propertyAddress: i >= 3 ? `${1000 + i * 100} Desert Rose Dr, Scottsdale, AZ` : '',
      });
    });
    return pipeline;
  }

  stageProbability(stage) {
    const probs = { Lead: 10, Contacted: 25, Qualified: 40, Showing: 55, Offer: 70, 'Under Contract': 90, Closed: 100, Lost: 0 };
    return probs[stage] || 0;
  }

  getNextAction(stage, type = 'buyer') {
    const actions = {
      Lead: type === 'seller' ? 'Initial outreach call — introduce yourself' : 'Send welcome email + property matches',
      Contacted: type === 'seller' ? 'Schedule listing presentation' : 'Confirm showing appointments',
      Qualified: type === 'seller' ? 'Complete CMA and present' : 'Schedule 3+ showings this week',
      Showing: type === 'seller' ? 'Follow up after open house — collect feedback' : 'Get offer feedback — what did they like?',
      Offer: 'Review offer terms with client — negotiate best outcome',
      'Under Contract': 'Schedule inspection, coordinate title, track contingency deadlines',
      Closed: 'Send thank-you gift + ask for review and referrals',
      Lost: 'Add to 90-day re-engagement nurture sequence',
    };
    return actions[stage] || 'Follow up';
  }

  // Get pipeline stats
  getPipelineStats() {
    const byStage = {};
    let totalValue = 0;
    let weightedValue = 0;

    this.pipeline.forEach(deal => {
      byStage[deal.stage] = (byStage[deal.stage] || 0) + 1;
      totalValue += deal.estimatedCommission;
      weightedValue += deal.estimatedCommission * (deal.probability / 100);
    });

    const closedDeals = this.pipeline.filter(d => d.stage === 'Closed');
    const activeDeals = this.pipeline.filter(d => !['Closed', 'Lost'].includes(d.stage));

    return {
      totalDeals: this.pipeline.length,
      activeDeals: activeDeals.length,
      closedDeals: closedDeals.length,
      totalPipelineValue: totalValue,
      weightedPipelineValue: Math.round(weightedValue),
      totalClosedValue: closedDeals.reduce((sum, d) => sum + d.estimatedCommission, 0),
      byStage,
      conversionRate: Math.round((closedDeals.length / this.pipeline.length) * 100),
      avgDealSize: Math.round(totalValue / this.pipeline.length),
    };
  }

  // Get all deals (optionally filtered by stage)
  getDeals(stage = null) {
    if (stage) return this.pipeline.filter(d => d.stage === stage);
    return this.pipeline;
  }

  // Move a deal to a new stage
  updateStage(dealId, newStage) {
    const deal = this.pipeline.find(d => d.id === dealId);
    if (!deal) return { error: 'Deal not found' };
    const old = deal.stage;
    deal.stage = newStage;
    deal.probability = this.stageProbability(newStage);
    deal.nextAction = this.getNextAction(newStage, deal.dealType);
    deal.lastActivity = new Date().toISOString();
    return { success: true, deal, previousStage: old };
  }

  // Generate a call script for a specific deal
  generateCallScript(dealId) {
    const deal = this.pipeline.find(d => d.id === dealId);
    if (!deal) return { error: 'Deal not found' };

    const first = deal.clientName.split(' ')[0];
    const scripts = {
      Lead: {
        opener: `Hi ${first}, this is [Agent] from [Agency]. I wanted to personally reach out because ${deal.dealType === 'seller' ? 'you\'d mentioned your home' : 'you\'d reached out about finding a home'}. Is now a good time for 2 minutes?`,
        goal: 'Qualify intent and timeline. Book a follow-up appointment.',
        questions: ['What\'s driving your decision to [buy/sell] right now?', 'What does your ideal timeline look like?', 'Have you [started touring homes / received any offers] yet?'],
        close: 'Can we set up a time this week to talk through your specific goals?',
      },
      Showing: {
        opener: `Hi ${first}, this is [Agent]! Just following up after your showings yesterday. I wanted to get your honest thoughts while everything is fresh.`,
        goal: 'Get showing feedback. Identify frontrunner. Move toward offer.',
        questions: ['What was your overall reaction?', 'Did any of them feel like a potential home?', 'What would need to be true for you to submit an offer?'],
        close: 'If [Address] is the one, I can have an offer drafted tonight. What are your thoughts?',
      },
      Offer: {
        opener: `Hi ${first}, I have some important updates on your offer at [Address]. Do you have a few minutes to talk through the seller\'s response?`,
        goal: 'Negotiate best outcome. Keep client calm and strategic.',
        points: ['Seller responded at [counter price]', 'Our strategy: [counter vs accept vs walk]', 'Deadline for response: [time]'],
        close: 'Here\'s my recommendation based on the market data: [recommendation]. Are you comfortable with that approach?',
      },
      Closed: {
        opener: `Hi ${first}! I just wanted to call personally and say congratulations — you officially own [Property]! How does it feel?`,
        goal: 'Celebrate. Plant seeds for referrals.',
        points: ['Confirm they received keys and garage codes', 'Give utility change-over checklist', 'Ask about move-in experience'],
        close: 'If you know anyone else who\'s thinking about buying or selling, I\'d be so grateful for an introduction. You\'re exactly the kind of client I love working with.',
      },
    };

    return {
      dealId,
      clientName: deal.clientName,
      stage: deal.stage,
      script: scripts[deal.stage] || { opener: `Hi ${first}, checking in to see how you\'re doing and if there\'s anything I can help with!`, goal: 'Maintain relationship and advance deal.' },
      estimatedCallTime: '3–5 minutes',
    };
  }

  // Objection handling library
  getObjectionHandlers(category = 'all') {
    const handlers = {
      buyer: [
        { objection: 'I want to wait for prices to drop', response: 'I understand — but here\'s the data: while prices have softened slightly, the homes that match your criteria aren\'t sitting. When rates drop, 40% more buyers jump back in and prices go up. The best time to buy is when competition is lower, not higher. What would give you confidence to move forward now?' },
        { objection: 'I\'m worried about interest rates', response: 'That\'s valid, and rates are genuinely higher than a few years ago. But here\'s the key: you\'re buying the home, not the rate. When rates drop — and most economists expect them to — you refinance. You can\'t refinance the price you paid. Would you like me to run the numbers on what a $50k price difference looks like vs. a rate refinance?' },
        { objection: 'I need to sell my current home first', response: 'Makes complete sense, and it\'s actually more common than people think. We have two options: I can market both at the same time to coordinate timing, or we can explore a bridge loan that lets you buy before selling. Which would you feel more comfortable with?' },
        { objection: 'I\'m just not ready', response: 'I hear you, and there\'s absolutely no pressure. Can I ask — what would "ready" look like for you? Sometimes naming it makes the path clearer, and I can help you get there.' },
      ],
      seller: [
        { objection: 'I want to wait for the market to improve', response: 'I respect that instinct. Let me share something, though: trying to time the real estate market is like timing the stock market — very difficult. The buyers in your market right now are serious and motivated. In 6 months, inventory is likely to increase which increases your competition. Would you like to see what our projections show for pricing?' },
        { objection: 'I can get a better commission elsewhere', response: 'I appreciate your directness. You can absolutely find a lower commission — and I\'d ask you to weigh that against the results. My listings sell for an average of [X]% over ask in [Y] days. If I get you $15,000 more for your home, does my fee still feel like too much?' },
        { objection: 'I\'m going to try FSBO first', response: 'That\'s a completely reasonable thing to explore. I\'d actually like to offer you something valuable whether or not you list with me: free professional photos and a pricing analysis. If your FSBO doesn\'t work out, you\'ll know you have a backup plan with no wasted time. Would that be okay?' },
        { objection: 'Your price is too low', response: 'I hear you, and I want your home to sell for the absolute most it can. Here\'s my concern: if we price it above market, we risk sitting on the market for weeks, which actually signals to buyers that something is wrong. A strategic price creates urgency and competition — and that\'s how we often end up above asking price. Can I walk you through the comps?' },
      ],
    };

    if (category === 'all') return handlers;
    return handlers[category] || [];
  }

  // Forecast GCI (Gross Commission Income)
  forecastGCI(params = {}) {
    const { activeDeals = this.pipeline.filter(d => !['Closed', 'Lost'].includes(d.stage)).length,
            avgPrice = 500000, commissionRate = 0.025, closeRate = 0.35,
            monthsOut = 3 } = params;

    const projectedCloses = Math.round(activeDeals * closeRate);
    const projectedGCI = projectedCloses * avgPrice * commissionRate;

    return {
      activeDeals,
      projectedCloses,
      projectedGCI: Math.round(projectedGCI),
      avgDealValue: Math.round(avgPrice * commissionRate),
      assumptions: { closeRate: `${(closeRate * 100).toFixed(0)}%`, commissionRate: `${(commissionRate * 100).toFixed(1)}%`, avgPrice: `$${avgPrice.toLocaleString()}`, horizon: `${monthsOut} months` },
      currentPipelineWeighted: Math.round(this.pipeline.reduce((sum, d) => sum + d.estimatedCommission * (d.probability / 100), 0)),
    };
  }
}
