/**
 * AutoResponseAgent
 * Handles inbound inquiries with intelligent, personalized automated responses.
 * Routes leads, answers common questions, and books appointments automatically.
 */

export class AutoResponseAgent {
  constructor() {
    this.intents = {
      showing_request: ['schedule', 'showing', 'tour', 'see the home', 'visit', 'walk through', 'available to show', 'see it', 'book a tour'],
      price_inquiry: ['price', 'how much', 'cost', 'list price', 'asking price', 'offer', 'negotiate', 'reduce', 'discount'],
      property_info: ['how many beds', 'how many baths', 'square feet', 'sqft', 'garage', 'pool', 'yard', 'basement', 'school', 'hoa', 'year built'],
      agent_request: ['work with you', 'buyer\'s agent', 'represent', 'looking for an agent', 'need an agent', 'help me buy', 'help me find'],
      seller_inquiry: ['sell my home', 'list my house', 'want to sell', 'home value', 'what is my home worth', 'cma'],
      availability: ['when are you available', 'are you free', 'can we meet', 'good time to call', 'office hours'],
      financing: ['lender', 'mortgage', 'pre-approval', 'pre-qualified', 'financing', 'interest rate', 'down payment'],
      general: [],
    };

    this.timeSlots = ['Monday 10am', 'Monday 2pm', 'Tuesday 11am', 'Tuesday 3pm',
      'Wednesday 10am', 'Wednesday 4pm', 'Thursday 1pm', 'Thursday 5pm',
      'Friday 10am', 'Friday 2pm', 'Saturday 10am', 'Saturday 1pm', 'Sunday 1pm'];
  }

  // Detect intent
  detectIntent(message = '') {
    const text = message.toLowerCase();
    for (const [intent, keywords] of Object.entries(this.intents)) {
      if (intent === 'general') continue;
      if (keywords.some(k => text.includes(k))) return intent;
    }
    return 'general';
  }

  // Extract property address from message
  extractAddress(message = '') {
    const match = message.match(/\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:St|Ave|Blvd|Dr|Rd|Ln|Ct|Way|Pl))?/);
    return match ? match[0] : null;
  }

  // Generate response for a given inquiry
  respond(inquiry) {
    const { message = '', senderName = 'there', senderEmail = '', propertyAddress = '', source = 'website' } = inquiry;
    const intent = this.detectIntent(message);
    const address = propertyAddress || this.extractAddress(message) || '[Property Address]';
    const firstName = senderName.split(' ')[0] || 'there';
    const slots = this.timeSlots.slice(0, 3);

    const responses = {
      showing_request: {
        subject: `Showing Request Confirmed — ${address}`,
        body: `Hi ${firstName}!\n\nThank you for your interest in ${address} — great choice! I'd love to set up a private showing for you.\n\nHere are a few available times this week:\n${slots.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nSimply reply with your preferred time, or if none of these work, let me know your availability and I'll make it happen.\n\nA few things to know before your showing:\n• The showing takes about 30–45 minutes\n• Please bring a valid ID\n• If you're pre-approved, bringing your letter will put you in a strong position to make an offer on the spot\n\nLooking forward to meeting you!\n[Agent Name]\n[Phone]`,
        priority: 'high',
        autoBooking: true,
        suggestedSlots: slots,
      },

      price_inquiry: {
        subject: `Pricing Information — ${address}`,
        body: `Hi ${firstName},\n\nGreat question on the pricing for ${address}.\n\nThe home is currently listed at [LIST PRICE], and I want to be transparent with you about how this was priced:\n\n• We analyzed 14 comparable sales in the area over the past 90 days\n• The price reflects current upgrades, square footage, and lot size\n• Similar homes have been selling at 99–104% of list price in this market\n\nThat said, I want to help you make the best decision. A few things that could be relevant:\n• [Number] days on market\n• Seller motivation: [motivation level]\n• Whether there are currently any other offers\n\nI'd love to walk you through the comparable sales data so you can form your own view of the value. Would a quick call work?\n\nTalk soon,\n[Agent Name]\n[Phone]`,
        priority: 'medium',
        autoBooking: false,
      },

      property_info: {
        subject: `Property Details — ${address}`,
        body: `Hi ${firstName},\n\nHappy to get you all the details on ${address}!\n\nHere's a quick rundown:\n\n🏠 Property Facts:\n• Bedrooms: [BEDS]\n• Bathrooms: [BATHS]\n• Square Footage: [SQFT] sq ft\n• Lot Size: [LOT] sq ft\n• Year Built: [YEAR]\n• Garage: [GARAGE]\n• Pool: [POOL]\n• HOA: [HOA]\n\n🏫 Schools (GreatSchools Rating):\n• Elementary: [School] — Rating: [#]/10\n• Middle: [School] — Rating: [#]/10\n• High School: [School] — Rating: [#]/10\n\nFor the full picture, I'd love to schedule a showing where you can see everything firsthand. Would any of these times work for you?\n${slots.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n[Agent Name]\n[Phone]`,
        priority: 'medium',
        autoBooking: false,
      },

      agent_request: {
        subject: `Your Dedicated Buyer's Agent — Let's Find Your Home`,
        body: `Hi ${firstName},\n\nWelcome! I'm so glad you reached out — finding a great buyer's agent is one of the most important first steps in your home search, and I'd love to earn that opportunity.\n\nHere's a bit about what I offer my buyer clients:\n\n✅ No cost to you — in almost all cases, the seller pays the buyer's agent commission\n✅ Access to off-market and pre-MLS listings\n✅ Weekly curated property matches sent directly to you\n✅ Full negotiation representation — I fight for your best price and terms\n✅ Lender introductions to get you pre-approved fast\n✅ White-glove service from first showing to closing keys\n\nI'd love to jump on a quick 20-minute discovery call to understand exactly what you're looking for. I can usually match buyers with strong options within 24–48 hours of that first conversation.\n\nWhen works best for you?\n${slots.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nLooking forward to working together!\n[Agent Name]\n[Phone]`,
        priority: 'high',
        autoBooking: true,
        suggestedSlots: slots,
      },

      seller_inquiry: {
        subject: `Your Home's Value — Let's Find Out Together`,
        body: `Hi ${firstName},\n\nThank you for reaching out! Understanding your home's value is one of the smartest things you can do, whether you're planning to sell tomorrow or just want to know where you stand.\n\nI'd like to prepare a full Comparative Market Analysis (CMA) for your property. This includes:\n\n📊 What's included in your free CMA:\n• Recent sales of similar homes in your neighborhood\n• Current active competition (what you'd be competing against)\n• Pricing strategy recommendations\n• Net proceeds estimate after costs\n• Market timing analysis — is now the right time?\n\nThis takes me about 48 hours to prepare properly, and I'll walk you through it in a 30-minute presentation that's tailored specifically to your home.\n\nThere is absolutely no obligation — just clear, useful information.\n\nCan we schedule your CMA presentation? Here are a few times:\n${slots.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n[Agent Name]\n[Phone]`,
        priority: 'high',
        autoBooking: true,
        suggestedSlots: slots,
      },

      availability: {
        subject: `My Schedule — Let's Find a Time That Works`,
        body: `Hi ${firstName},\n\nAbsolutely! Here's my availability this week:\n\n${slots.map((s, i) => `• ${s}`).join('\n')}\n\nYou can also book directly using my calendar link: [CALENDAR LINK]\n\nOr if you'd prefer, just text or call me at [Phone] — I'm usually very responsive.\n\nLooking forward to connecting!\n[Agent Name]`,
        priority: 'low',
        autoBooking: true,
        suggestedSlots: slots,
      },

      financing: {
        subject: `Financing Resources — Getting Pre-Approved`,
        body: `Hi ${firstName},\n\nGreat question on financing! Getting pre-approved is one of the most important steps before making an offer — sellers take pre-approved buyers much more seriously.\n\nI work with several excellent local lenders who can typically get you pre-approved within 24–48 hours:\n\n🏦 Preferred Lenders:\n• [Lender 1] — Specializes in first-time buyers, competitive rates\n• [Lender 2] — Great for jumbo loans and investment properties\n• [Lender 3] — Fast closings, strong local knowledge\n\nToday's approximate rates (subject to change):\n• 30-Year Fixed: ~6.8%\n• 15-Year Fixed: ~6.1%\n• 5/1 ARM: ~6.2%\n\nWould you like me to make an introduction? Most lenders offer a free consultation with no credit impact for the initial inquiry.\n\nHappy to help!\n[Agent Name]\n[Phone]`,
        priority: 'medium',
        autoBooking: false,
      },

      general: {
        subject: `Thanks for Reaching Out — I'll Be in Touch Shortly`,
        body: `Hi ${firstName},\n\nThank you for contacting us! I received your message and wanted to make sure you knew I'll be following up personally within the next hour.\n\nIn the meantime, here are a few things you might find useful:\n\n🔍 Search Listings: [WEBSITE LINK]\n📊 Home Value Estimator: [LINK]\n📅 Book a Call: [CALENDAR LINK]\n\nIf you have an urgent question, don't hesitate to call or text me directly at [Phone].\n\nTalk soon!\n[Agent Name]\n[Phone]`,
        priority: 'low',
        autoBooking: false,
      },
    };

    const response = responses[intent] || responses.general;

    return {
      intent,
      ...response,
      sender: { name: senderName, email: senderEmail },
      propertyAddress: address,
      source,
      respondedAt: new Date().toISOString(),
      followUpIn: response.priority === 'high' ? '5 minutes' : response.priority === 'medium' ? '1 hour' : '4 hours',
    };
  }

  // Batch process multiple inquiries
  batchRespond(inquiries) {
    return inquiries.map(inq => ({ id: inq.id, ...this.respond(inq) }));
  }
}
