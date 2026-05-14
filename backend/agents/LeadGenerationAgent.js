/**
 * LeadGenerationAgent
 * Scores, qualifies, and categorizes inbound real estate leads.
 * Assigns a lead score (0–100), a tier (hot/warm/cold), and a recommended action.
 */

export class LeadGenerationAgent {
  constructor() {
    this.buyerSignals = [
      'looking to buy', 'want to purchase', 'interested in buying', 'first-time buyer',
      'pre-approved', 'pre-qualification', 'mortgage', 'down payment', 'move-in',
      'ready to buy', 'serious buyer', 'cash buyer', 'investor', 'flip',
    ];
    this.sellerSignals = [
      'sell my home', 'list my property', 'home value', 'what is my home worth',
      'market analysis', 'cma', 'selling', 'list', 'need to sell', 'relocation',
      'downsizing', 'upsizing', 'move', 'listing agent',
    ];
    this.urgencySignals = [
      'asap', 'immediately', 'urgent', 'this week', 'this month', 'now',
      'quickly', 'soon', 'right away', 'closing date', 'deadline', '30 days',
      '60 days', '90 days',
    ];
    this.budgetSignals = [
      'budget', 'price range', 'afford', 'max', 'under', 'up to',
      'k', 'million', '000',
    ];
    this.coldSignals = [
      'just browsing', 'not sure', 'maybe someday', 'just curious', 'just looking',
      'down the road', 'year or two', 'thinking about it',
    ];
  }

  // Score signals from 0-100
  score(input) {
    const { name, email, phone, message = '', source = '', timeframe = '' } = input;
    let score = 0;
    const text = (message + ' ' + timeframe).toLowerCase();
    const factors = [];

    // Contact completeness (30 pts)
    if (name?.trim()) { score += 10; factors.push('Has name'); }
    if (email?.trim()) { score += 10; factors.push('Has email'); }
    if (phone?.trim()) { score += 10; factors.push('Has phone'); }

    // Intent signals (40 pts)
    const buyerHits = this.buyerSignals.filter(s => text.includes(s)).length;
    const sellerHits = this.sellerSignals.filter(s => text.includes(s)).length;
    const intentScore = Math.min(20, (buyerHits + sellerHits) * 5);
    score += intentScore;
    if (intentScore > 0) factors.push(`Intent signals: ${buyerHits + sellerHits}`);

    // Urgency (20 pts)
    const urgencyHits = this.urgencySignals.filter(s => text.includes(s)).length;
    const urgencyScore = Math.min(20, urgencyHits * 7);
    score += urgencyScore;
    if (urgencyScore > 0) factors.push(`Urgency signals: ${urgencyHits}`);

    // Budget mentioned (10 pts)
    const budgetHits = this.budgetSignals.filter(s => text.includes(s)).length;
    if (budgetHits > 0) { score += 10; factors.push('Budget mentioned'); }

    // Cold signals penalty
    const coldHits = this.coldSignals.filter(s => text.includes(s)).length;
    score -= coldHits * 8;

    // Source bonus
    if (['referral', 'agent referral'].includes(source.toLowerCase())) {
      score += 15; factors.push('Referral source');
    } else if (['zillow', 'redfin', 'realtor.com'].includes(source.toLowerCase())) {
      score += 8; factors.push('Portal source');
    }

    score = Math.max(0, Math.min(100, score));

    return { score, factors };
  }

  // Determine intent type
  detectIntent(message = '') {
    const text = message.toLowerCase();
    const buyerHits = this.buyerSignals.filter(s => text.includes(s)).length;
    const sellerHits = this.sellerSignals.filter(s => text.includes(s)).length;
    if (buyerHits > sellerHits) return 'buyer';
    if (sellerHits > buyerHits) return 'seller';
    if (buyerHits > 0 || sellerHits > 0) return 'both';
    return 'unknown';
  }

  // Extract budget range
  extractBudget(text = '') {
    const matches = [...text.matchAll(/\$[\d,]+k?|\b[\d,]+k\b|\b\d+\s*million\b/gi)];
    return matches.map(m => m[0]);
  }

  // Classify lead tier
  tier(score) {
    if (score >= 70) return 'hot';
    if (score >= 40) return 'warm';
    return 'cold';
  }

  // Recommend action
  recommendAction(tier, intent) {
    const actions = {
      hot: {
        buyer: 'Call within 5 minutes. Schedule showing immediately. Assign to top buyer\'s agent.',
        seller: 'Call within 5 minutes. Book listing presentation within 24 hours.',
        both: 'Call within 5 minutes. Determine primary need and route accordingly.',
        unknown: 'Call within 5 minutes. Qualify intent immediately.',
      },
      warm: {
        buyer: 'Send personalized property matches within 1 hour. Schedule follow-up call for tomorrow.',
        seller: 'Send market report for their address. Follow up within 2 hours.',
        both: 'Send intro email with buyer and seller resources. Call within 4 hours.',
        unknown: 'Send welcome email with all services. Follow up within 24 hours.',
      },
      cold: {
        buyer: 'Add to drip campaign. Send monthly market updates and listings.',
        seller: 'Add to seller drip. Send home value report monthly.',
        both: 'Add to general nurture sequence.',
        unknown: 'Add to general newsletter. Revisit in 30 days.',
      },
    };
    return actions[tier]?.[intent] ?? actions[tier]?.unknown ?? 'Follow up within 48 hours.';
  }

  qualify(input) {
    const { score, factors } = this.score(input);
    const leadTier = this.tier(score);
    const intent = this.detectIntent(input.message);
    const budget = this.extractBudget(input.message);
    const action = this.recommendAction(leadTier, intent);

    return {
      score,
      tier: leadTier,
      intent,
      budget,
      recommendedAction: action,
      scoringFactors: factors,
      qualifiedAt: new Date().toISOString(),
      priority: leadTier === 'hot' ? 1 : leadTier === 'warm' ? 2 : 3,
    };
  }

  // Generate a batch of sample leads for demo
  generateSampleLeads(count = 5) {
    const samples = [
      { name: 'Marcus Johnson', email: 'mjohnson@email.com', phone: '555-0101', message: 'I\'m pre-approved for $650k and ready to buy now. Looking in downtown area.', source: 'Zillow', timeframe: '30 days' },
      { name: 'Sarah Chen', email: 'schen@email.com', phone: '555-0102', message: 'Just curious about home values in my neighborhood.', source: 'website', timeframe: '' },
      { name: 'David Torres', email: 'dtorres@email.com', phone: '555-0103', message: 'Need to sell my home ASAP due to job relocation. Can you help with a listing?', source: 'referral', timeframe: 'this month' },
      { name: 'Emily Rivera', email: 'erivera@email.com', phone: '', message: 'Thinking about buying a home maybe in a year or two.', source: 'Instagram', timeframe: '' },
      { name: 'James Park', email: 'jpark@email.com', phone: '555-0105', message: 'Cash buyer investor looking to purchase 2-4 units quickly.', source: 'agent referral', timeframe: '60 days' },
    ];
    return samples.slice(0, count).map((s, i) => ({
      id: `lead-${Date.now()}-${i}`,
      ...s,
      ...this.qualify(s),
    }));
  }
}
