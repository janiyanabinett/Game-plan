/**
 * LeadNurturingAgent
 * Builds personalized multi-touch drip sequences for buyer and seller leads.
 * Generates emails, texts, and call scripts tailored to lead tier and intent.
 */

export class LeadNurturingAgent {
  constructor() {
    this.touchPoints = {
      hot_buyer: [
        { day: 0, channel: 'call', subject: 'Immediate Follow-Up', delay: '< 5 min' },
        { day: 0, channel: 'text', subject: 'Property Matches Sent', delay: '1 hour' },
        { day: 1, channel: 'email', subject: 'Your Personalized Property Report', delay: '24 hours' },
        { day: 3, channel: 'call', subject: 'Check-In: Any Questions?', delay: '3 days' },
        { day: 7, channel: 'email', subject: 'New Listings Just Hit the Market', delay: '7 days' },
      ],
      warm_buyer: [
        { day: 0, channel: 'email', subject: 'Welcome + Property Matches', delay: '1 hour' },
        { day: 2, channel: 'text', subject: 'Are these listings a fit?', delay: '2 days' },
        { day: 7, channel: 'email', subject: 'Market Update + New Listings', delay: '7 days' },
        { day: 14, channel: 'call', subject: 'Check-In Call', delay: '14 days' },
        { day: 30, channel: 'email', subject: 'Monthly Market Report', delay: '30 days' },
      ],
      cold_buyer: [
        { day: 0, channel: 'email', subject: 'Welcome to Our Community', delay: '1 hour' },
        { day: 14, channel: 'email', subject: 'Buyer\'s Guide: Everything You Need to Know', delay: '14 days' },
        { day: 30, channel: 'email', subject: 'Market Update', delay: '30 days' },
        { day: 60, channel: 'email', subject: 'How\'s Your Home Search Going?', delay: '60 days' },
        { day: 90, channel: 'email', subject: 'Ready When You Are', delay: '90 days' },
      ],
      hot_seller: [
        { day: 0, channel: 'call', subject: 'Listing Consultation Request', delay: '< 5 min' },
        { day: 0, channel: 'email', subject: 'Your Home\'s Value Report', delay: '1 hour' },
        { day: 1, channel: 'call', subject: 'Schedule Listing Appointment', delay: '24 hours' },
        { day: 3, channel: 'email', subject: 'Our Marketing Plan for Your Home', delay: '3 days' },
        { day: 7, channel: 'text', subject: 'Still Thinking About Selling?', delay: '7 days' },
      ],
      warm_seller: [
        { day: 0, channel: 'email', subject: 'Your Neighborhood Market Report', delay: '2 hours' },
        { day: 3, channel: 'call', subject: 'Follow-Up Call', delay: '3 days' },
        { day: 10, channel: 'email', subject: 'How We Market Homes Like Yours', delay: '10 days' },
        { day: 21, channel: 'email', subject: 'Recent Sales in Your Area', delay: '21 days' },
        { day: 45, channel: 'call', subject: 'Checking In', delay: '45 days' },
      ],
      cold_seller: [
        { day: 0, channel: 'email', subject: 'Free Home Valuation', delay: '2 hours' },
        { day: 30, channel: 'email', subject: 'Your Home Value Update', delay: '30 days' },
        { day: 60, channel: 'email', subject: 'What\'s Happening in Your Neighborhood', delay: '60 days' },
        { day: 90, channel: 'email', subject: 'Are You Thinking About Making a Move?', delay: '90 days' },
      ],
    };
  }

  // Generate a personalized email
  generateEmail(lead, touchPoint) {
    const first = lead.name?.split(' ')[0] || 'there';
    const templates = {
      buyer: {
        welcome: `Hi ${first},\n\nThank you for reaching out! I'm excited to help you find your perfect home. Based on what you've shared, I've curated a selection of properties that match your criteria.\n\nAs your dedicated agent, here's what I'll do for you:\n✅ Send you new listings the moment they hit the market\n✅ Schedule private showings at your convenience\n✅ Negotiate aggressively on your behalf\n✅ Guide you through every step of the process\n\nClick below to view your personalized property matches, or reply to this email to set up a call.\n\nLooking forward to finding your dream home,\n[Agent Name]`,
        market_update: `Hi ${first},\n\nHere's your weekly market update for properties matching your search:\n\n📊 Market Snapshot:\n• Average days on market: 12\n• Median list price: $485,000\n• Price reductions this week: 23 properties\n• New listings added: 47 properties\n\n🔥 Hot New Listings:\n• [Property 1 address] — $459,000 • 3bd/2ba • Just listed\n• [Property 2 address] — $499,000 • 4bd/3ba • Open house Sunday\n• [Property 3 address] — $425,000 • 3bd/2ba • Price reduced!\n\nWant to schedule showings for any of these? Reply or call me directly.\n\n[Agent Name]`,
        checkin: `Hi ${first},\n\nJust checking in to see how your home search is going. I know it can feel overwhelming at times, but I'm here to make this as smooth as possible for you.\n\nA few things I wanted to share:\n• Interest rates this week: 6.8% (30-yr fixed)\n• Inventory is up 8% from last month — more options for you\n• A few new properties just came to market that match your criteria\n\nWould you like to set up a quick 15-minute call to discuss your search? I'm flexible on timing.\n\nAlways in your corner,\n[Agent Name]`,
      },
      seller: {
        valuation: `Hi ${first},\n\nBased on recent sales in your neighborhood, here's a snapshot of what your home could be worth today:\n\n🏠 Estimated Value Range: $[MIN]–$[MAX]\n📈 Your area has seen 6.2% appreciation this year\n⏱️ Homes in your zip code are selling in 11 days on average\n\nThis estimate is based on:\n• 12 comparable sales in the last 90 days\n• Current market demand in your area\n• Property condition and features\n\nFor a precise valuation, I'd love to schedule a quick walk-through. A proper CMA (Comparative Market Analysis) typically adds 5–8% more accuracy — and often adds thousands to your final price.\n\nCan we schedule 30 minutes this week?\n\n[Agent Name]`,
        marketing_plan: `Hi ${first},\n\nWhen you're ready to sell, here's exactly how I'll get your home maximum exposure and the best price:\n\n🎯 Our Marketing Strategy:\n✅ Professional photography + drone footage\n✅ 3D virtual tour (Matterport)\n✅ Listed on MLS, Zillow, Redfin, Realtor.com, and 200+ sites\n✅ Social media campaign targeting active buyers\n✅ Email blast to our database of 2,400+ buyer leads\n✅ Open house + private showings\n✅ Weekly seller reports with views, showing feedback, and offers\n\nOur listings average 4.7% ABOVE list price and sell in 8 days.\n\nWhen would you like to discuss next steps?\n\n[Agent Name]`,
      },
    };

    const intent = lead.intent === 'seller' ? 'seller' : 'buyer';
    const templateMap = {
      'Welcome + Property Matches': templates.buyer.welcome,
      'Your Personalized Property Report': templates.buyer.market_update,
      'Market Update + New Listings': templates.buyer.market_update,
      'Monthly Market Report': templates.buyer.market_update,
      "How's Your Home Search Going?": templates.buyer.checkin,
      'New Listings Just Hit the Market': templates.buyer.market_update,
      "Your Home's Value Report": templates.seller.valuation,
      'Your Neighborhood Market Report': templates.seller.valuation,
      'How We Market Homes Like Yours': templates.seller.marketing_plan,
      'Our Marketing Plan for Your Home': templates.seller.marketing_plan,
    };

    return templateMap[touchPoint.subject] || `Hi ${first},\n\nFollowing up as promised. I'd love to connect and see how I can help with your real estate needs.\n\n[Agent Name]`;
  }

  // Generate SMS text
  generateText(lead, touchPoint) {
    const first = lead.name?.split(' ')[0] || 'there';
    const texts = {
      buyer: [
        `Hi ${first}! This is [Agent] from [Agency]. I just sent you some property matches I think you'll love. Check your email! 🏠`,
        `${first}, just wanted to check — did any of those listings catch your eye? Happy to book a showing anytime. Just reply here!`,
        `Hi ${first}! 3 new homes just hit the market in your price range. Want me to send details?`,
      ],
      seller: [
        `Hi ${first}, this is [Agent]. Your home's value report is in your inbox. Let me know if you want to talk numbers! 📊`,
        `${first}, are you still thinking about selling? The market is really strong right now. Happy to chat when convenient.`,
        `Hi ${first}! Your neighborhood just had a sale at $[price]. Your home could fetch similar — want a quick call to discuss?`,
      ],
    };
    const list = lead.intent === 'seller' ? texts.seller : texts.buyer;
    return list[Math.floor(Math.random() * list.length)];
  }

  // Generate call script
  generateCallScript(lead, touchPoint) {
    const first = lead.name?.split(' ')[0] || 'there';
    const tier = lead.tier || 'warm';

    if (lead.intent === 'seller') {
      return {
        opener: `Hi, may I speak with ${first}? This is [Agent Name] from [Agency]. I'm reaching out because you recently expressed interest in learning about your home's value — do you have just a couple of minutes?`,
        discovery: [
          'What's prompting you to consider selling right now?',
          'What's your ideal timeline for making a move?',
          'Have you already found a home you'd like to move to?',
          'What's most important to you in this process — speed, price, or convenience?',
        ],
        close: tier === 'hot'
          ? `I'd love to schedule a listing consultation this week — I can come out Tuesday or Thursday. Which works better for you?`
          : `Would it make sense to schedule a quick 20-minute call to walk through what your home could sell for and how I'd approach getting you top dollar?`,
        objections: {
          'I'm just exploring': `Totally understand — I'm not here to pressure you at all. A no-obligation valuation costs nothing and gives you solid data for when you are ready.`,
          'I already have an agent': `That's great! If things change or you're ever looking for a second opinion, I'm always here.`,
          'Not ready yet': `No rush at all. Can I send you a monthly market update so you're always informed about what's happening in your neighborhood?`,
        },
      };
    }

    return {
      opener: `Hi, may I speak with ${first}? This is [Agent Name] from [Agency]. You reached out recently about finding a home — do you have a few minutes to chat?`,
      discovery: [
        'What's driving your search right now?',
        'What areas or neighborhoods are you focused on?',
        'What's your timeline — are you hoping to be in something within 30, 60, or 90 days?',
        'Are you working with a lender yet or would an introduction be helpful?',
      ],
      close: tier === 'hot'
        ? `I have some great options I'd love to show you. Could we get together this weekend for a few showings?`
        : `Why don't I send over a few listings that match what you're describing, and we can hop on a quick call to review them?`,
      objections: {
        'Just browsing': `Totally fine — I'll just send you occasional listings so when you are ready, you'll know exactly what's available.`,
        'Working with another agent': `Understood — I respect that. If anything changes, I'm here.`,
        'Not pre-approved': `No worries! I can connect you with a great local lender who can get you pre-approved in 24 hours — no obligation.`,
      },
    };
  }

  // Build full sequence
  buildSequence(lead) {
    const key = `${lead.tier || 'warm'}_${lead.intent === 'seller' ? 'seller' : 'buyer'}`;
    const sequence = this.touchPoints[key] || this.touchPoints.warm_buyer;

    return {
      leadId: lead.id || lead.email,
      leadName: lead.name,
      intent: lead.intent,
      tier: lead.tier,
      sequenceKey: key,
      totalTouchPoints: sequence.length,
      touchPoints: sequence.map((tp, i) => ({
        step: i + 1,
        ...tp,
        content: tp.channel === 'email'
          ? this.generateEmail(lead, tp)
          : tp.channel === 'text'
          ? this.generateText(lead, tp)
          : this.generateCallScript(lead, tp),
        status: 'scheduled',
      })),
      createdAt: new Date().toISOString(),
    };
  }
}
