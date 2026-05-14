/**
 * LetterWritingAgent
 * Generates personalized letters for every stage of the real estate process:
 * buyer letters, offer cover letters, seller outreach, FSBO letters,
 * just listed/sold letters, and anniversary campaigns.
 */

export class LetterWritingAgent {
  constructor() {
    this.letterTypes = [
      'buyer_intro', 'offer_cover', 'seller_outreach', 'fsbo_outreach',
      'just_listed', 'just_sold', 'expired_listing', 'anniversary',
      'sphere_nurture', 'relocation', 'investor_outreach',
    ];
  }

  format(template, vars) {
    return template.replace(/\[([A-Z_]+)\]/g, (_, key) => vars[key] || `[${key}]`);
  }

  generate(type, vars = {}) {
    const generators = {
      buyer_intro: this.buyerIntroLetter,
      offer_cover: this.offerCoverLetter,
      seller_outreach: this.sellerOutreachLetter,
      fsbo_outreach: this.fsboOutreachLetter,
      just_listed: this.justListedLetter,
      just_sold: this.justSoldLetter,
      expired_listing: this.expiredListingLetter,
      anniversary: this.anniversaryLetter,
      sphere_nurture: this.sphereNurtureLetter,
      investor_outreach: this.investorOutreachLetter,
    };

    const generator = generators[type];
    if (!generator) return { error: `Unknown letter type: ${type}` };

    const result = generator.call(this, vars);
    return {
      type,
      subject: result.subject,
      body: result.body,
      format: result.format || 'email',
      wordCount: result.body.split(/\s+/).length,
      generatedAt: new Date().toISOString(),
    };
  }

  buyerIntroLetter(vars) {
    const { agentName = '[Agent Name]', agentPhone = '[Phone]', agencyName = '[Agency]',
            buyerName = '[Buyer Name]', buyerCity = '[City]' } = vars;
    return {
      subject: `Your Dedicated Real Estate Expert in ${buyerCity}`,
      body: `Dear ${buyerName},\n\nCongratulations on taking the first step toward homeownership — it's one of the most exciting journeys you'll ever take, and I'm here to make it exceptional.\n\nMy name is ${agentName}, and I specialize in helping buyers find their perfect home in ${buyerCity} and the surrounding area. What sets my approach apart:\n\n🏠 Off-market access — I often know about properties before they hit Zillow or Redfin, giving my clients a critical edge in competitive markets.\n\n📊 Data-driven guidance — I'll walk you through the numbers so every offer you make is strategic, not emotional.\n\n🤝 Full representation — From your first showing to closing day, I handle negotiations, inspections, title, and every detail in between.\n\n💬 Proactive communication — You'll never wonder what's happening. I provide weekly updates and am always reachable by text, call, or email.\n\nI'd love to learn more about what you're looking for and share some properties that might be a perfect fit. My clients typically find their home within 30–60 days of starting the search — even in this market.\n\nWhen would you have 20 minutes for a quick call to discuss your goals?\n\nWarm regards,\n${agentName}\n${agencyName}\n${agentPhone}`,
      format: 'email',
    };
  }

  offerCoverLetter(vars) {
    const { buyerName = '[Buyer Name]', sellerName = '[Seller Name]',
            propertyAddress = '[Address]', offerPrice = '[Offer Price]',
            buyerStory = '[Buyer Story]', agentName = '[Agent Name]' } = vars;
    return {
      subject: `Offer Letter — ${propertyAddress}`,
      body: `Dear ${sellerName},\n\nMy name is ${buyerName}, and I am writing to express how much I love your home at ${propertyAddress}.\n\n${buyerStory || 'From the moment we walked through the front door, we knew this was where we wanted to build our life. The warmth of the home, the thoughtful layout, and the care you\'ve put into every detail made an immediate impression on our family.'}\n\nWe are submitting an offer of ${offerPrice} because we are serious, motivated buyers who will honor this home the way you have. A few things I want you to know about us:\n\n• We are pre-approved (letter attached) and ready to close on your timeline\n• We are flexible on the closing date to accommodate your needs\n• We are not asking for many contingencies — we want this to be clean and simple for you\n• We have our inspector on standby and can close in as few as 21 days\n\nWe understand you may receive other offers, and we respect that this is an important decision. We simply ask that you consider not just the numbers, but the family who will carry this home forward.\n\nThank you sincerely for your time and consideration.\n\nWith gratitude,\n${buyerName}\n\n[Represented by ${agentName}]`,
      format: 'letter',
    };
  }

  sellerOutreachLetter(vars) {
    const { homeownerName = 'Homeowner', propertyAddress = '[Address]',
            agentName = '[Agent Name]', agentPhone = '[Phone]',
            recentSaleAddress = '[nearby sold address]', recentSalePrice = '[price]',
            neighborhood = '[Neighborhood]' } = vars;
    return {
      subject: `Your ${neighborhood} Home Could Be Worth More Than You Think`,
      body: `Dear ${homeownerName},\n\nI wanted to reach out because I recently sold a home near you — ${recentSaleAddress} — for ${recentSalePrice}, and based on what I know about your property at ${propertyAddress}, I believe your home may be worth a similar amount or more.\n\nThe ${neighborhood} market is exceptionally active right now:\n\n• Average days on market: 9 days\n• Homes are selling at 101–104% of list price\n• Buyer demand is outpacing inventory\n\nIf you've been thinking about making a move — whether to downsize, upsize, or simply capitalize on this market — there may not be a better time than right now.\n\nI'd like to offer you a complimentary, no-obligation Comparative Market Analysis (CMA) that will show you exactly what your home would likely sell for today, and what net proceeds you could walk away with.\n\nThis costs nothing, takes about 30 minutes, and gives you the clarity to make an informed decision.\n\nMay I reach out to schedule a brief call or visit?\n\nRespectfully,\n${agentName}\n${agentPhone}\n\nP.S. — Even if you have no plans to sell, knowing your home's value is valuable information. And if you have neighbors who might be interested, I'd be grateful for the introduction.`,
      format: 'letter',
    };
  }

  fsboOutreachLetter(vars) {
    const { homeownerName = 'Homeowner', propertyAddress = '[Address]',
            agentName = '[Agent Name]', agentPhone = '[Phone]', agencyName = '[Agency]' } = vars;
    return {
      subject: `Maximizing Your Sale at ${propertyAddress}`,
      body: `Dear ${homeownerName},\n\nI noticed your home at ${propertyAddress} is listed for sale by owner, and I want to start by saying I respect that decision — it takes confidence and initiative.\n\nI'm not writing to pressure you into listing with an agent. I'm writing because I genuinely want to share some information that could help you achieve the best possible outcome, whether you sell on your own or not.\n\nA few things I've learned working with FSBO sellers:\n\n• The average FSBO home sells for 5.5–7% less than agent-represented homes (National Association of Realtors, 2024). On a $500k home, that's $27,500–$35,000.\n• 87% of FSBO sellers eventually list with an agent — often after sitting on the market too long.\n• Legal and contract risks are the #1 pain point sellers don't anticipate.\n\nHere's what I offer that you might not expect:\n\n✅ Free professional photography for your listing — no strings attached\n✅ Free CMA to ensure you're priced right for maximum return\n✅ Access to my database of 2,400+ active buyers\n✅ Full marketing reach: MLS, Zillow, Redfin, Instagram, Facebook ads\n\nIf after a conversation you still want to sell on your own, I'll respect that completely. But if there's a chance we could put more money in your pocket together, I'd love to explore that.\n\nCan I schedule 20 minutes to walk through your property and share what I see?\n\nSincerely,\n${agentName}\n${agencyName}\n${agentPhone}`,
      format: 'letter',
    };
  }

  justListedLetter(vars) {
    const { neighborName = 'Neighbor', propertyAddress = '[Address]',
            listPrice = '[List Price]', beds = 3, baths = 2,
            agentName = '[Agent Name]', agentPhone = '[Phone]' } = vars;
    return {
      subject: `Just Listed in Your Neighborhood — ${propertyAddress}`,
      body: `Dear ${neighborName},\n\nI wanted to let you know that the home at ${propertyAddress} has just been listed for sale at ${listPrice}.\n\nHere are the highlights:\n• ${beds} Bedrooms | ${baths} Bathrooms\n• Beautifully updated throughout\n• Move-in ready\n\nAs someone who lives in this neighborhood, you already know what makes it special. This is a wonderful opportunity to help someone you know become your neighbor!\n\nIf you have friends, family members, or colleagues who've mentioned wanting to live in this area, I'd love an introduction. And if this listing or recent sales in the area have you curious about your own home's value, I'm happy to provide a complimentary analysis.\n\nThank you for being part of this community.\n\nBest,\n${agentName}\n${agentPhone}`,
      format: 'postcard',
    };
  }

  justSoldLetter(vars) {
    const { neighborName = 'Neighbor', soldAddress = '[Address]', soldPrice = '[Price]',
            daysOnMarket = 8, agentName = '[Agent Name]', agentPhone = '[Phone]' } = vars;
    return {
      subject: `Just Sold in Your Neighborhood — Setting a New Record`,
      body: `Dear ${neighborName},\n\nI'm excited to share that I just sold ${soldAddress} for ${soldPrice} in only ${daysOnMarket} days on the market.\n\nThis sale is great news for the entire neighborhood — strong sale prices lift the value of every home on the street, including yours.\n\nHere's what this sale means for you:\n✅ Your home's value likely increased\n✅ Buyer demand in this area is very strong\n✅ You could potentially command a premium price right now\n\nIf you've been on the fence about selling, or if you're simply curious what your home is worth today, I'd love to provide a complimentary, no-obligation market analysis.\n\nI know this neighborhood well, and I'd be honored to represent your home with the same energy and results.\n\nWould you like to find out what your home could sell for?\n\nCordially,\n${agentName}\n${agentPhone}`,
      format: 'postcard',
    };
  }

  expiredListingLetter(vars) {
    const { homeownerName = 'Homeowner', propertyAddress = '[Address]',
            agentName = '[Agent Name]', agentPhone = '[Phone]' } = vars;
    return {
      subject: `Your Home at ${propertyAddress} — A Fresh Start`,
      body: `Dear ${homeownerName},\n\nI noticed your listing at ${propertyAddress} recently expired, and I want to reach out — not to pile on, but because I believe your home deserves better.\n\nA listing that expires doesn't mean your home isn't sellable. In most cases, it means one or more of these things:\n• The pricing strategy wasn't aligned with current market demand\n• The marketing reach wasn't wide enough to attract the right buyers\n• The presentation (photos, staging, description) undersold the property\n\nThese are all fixable. And when they're fixed, homes sell — often quickly.\n\nHere's what I would do differently:\n📸 Professional photography and Matterport 3D tour\n💰 Precision pricing strategy based on current comps\n📣 Full digital marketing: MLS, Zillow, Redfin, social ads, email to 2,400+ buyers\n🔄 Weekly feedback reports from showings so we can adapt fast\n\nI'd love to have a candid conversation about what happened and what a new approach might look like. No pressure — just a real conversation.\n\nCan I reach out this week?\n\nRespectfully,\n${agentName}\n${agentPhone}`,
      format: 'letter',
    };
  }

  anniversaryLetter(vars) {
    const { clientName = '[Client Name]', propertyAddress = '[Address]',
            yearsAgo = 1, currentEstimatedValue = '[Est. Value]',
            purchasePrice = '[Purchase Price]', agentName = '[Agent Name]' } = vars;
    return {
      subject: `Happy ${yearsAgo === 1 ? '1-Year' : `${yearsAgo}-Year`} Home Anniversary, ${clientName}!`,
      body: `Dear ${clientName},\n\nCan you believe it's already been ${yearsAgo} year${yearsAgo !== 1 ? 's' : ''} since you closed on ${propertyAddress}? Time flies!\n\nI wanted to reach out with a little anniversary gift: your home's current estimated value.\n\n🏠 ${propertyAddress}\n• Purchase Price (${yearsAgo} year${yearsAgo !== 1 ? 's' : ''} ago): ${purchasePrice}\n• Current Estimated Value: ${currentEstimatedValue}\n• Estimated Equity Gained: [EQUITY CALCULATION]\n\nYour home isn't just a place to live — it's one of your most important financial assets, and it's been working hard for you.\n\nIf you ever have questions about your home's value, are thinking about refinancing, or want to explore what's possible in today's market, I'm always here.\n\nWishing you many more wonderful years in your home. If there's anything I can help with — even a contractor recommendation — please don't hesitate to reach out.\n\nWith appreciation,\n${agentName}\n\nP.S. — If you know anyone thinking about buying or selling, I'd be honored by the introduction. Referrals from clients like you are the highest compliment I receive.`,
      format: 'email',
    };
  }

  sphereNurtureLetter(vars) {
    const { contactName = '[Name]', agentName = '[Agent Name]', agentPhone = '[Phone]',
            marketStat = 'Homes in our market are selling in an average of 11 days' } = vars;
    return {
      subject: `Staying In Touch + A Quick Market Update`,
      body: `Hi ${contactName},\n\nI hope you're doing well! I wanted to drop a quick note to stay in touch and share a few things happening in the local market that might be useful to know.\n\n📊 Quick Market Snapshot:\n• ${marketStat}\n• Median sale price up 4.2% year-over-year\n• Interest rates are creating interesting opportunities for buyers and sellers alike\n\nWhether you're thinking about making a move, curious about your home's value, or just want to understand what's happening in the market, I'm always happy to chat with no strings attached.\n\nI truly enjoy connecting with people I care about — real estate aside. How have you been? Any big life updates?\n\nLooking forward to catching up soon.\n\nWarmly,\n${agentName}\n${agentPhone}\n\nP.S. — If you ever know anyone who needs a great agent, I promise to take excellent care of them. Your referrals mean everything to me.`,
      format: 'email',
    };
  }

  investorOutreachLetter(vars) {
    const { investorName = 'Investor', agentName = '[Agent Name]',
            agentPhone = '[Phone]', marketArea = '[Area]' } = vars;
    return {
      subject: `Investment Opportunities in ${marketArea} — Let's Talk Numbers`,
      body: `Dear ${investorName},\n\nI work with a number of real estate investors in ${marketArea}, and I wanted to reach out because I believe there are opportunities in this market that align with your investment goals.\n\nHere's what I'm seeing:\n\n📈 Market Conditions for Investors:\n• Cap rates for SFR rentals: 5.2–7.8%\n• Average cash-on-cash return: 6.4%\n• Rent growth: 8.1% year-over-year\n• Vacancy rates in prime zip codes: <3%\n\n🏘️ Deal Types Available:\n• Off-market single-family rentals\n• 2–4 unit multifamily\n• Fix and flip opportunities (ARV analysis provided)\n• Value-add apartment buildings\n\nI have access to off-market inventory and can run full investment analysis (cash flow, CoC return, 5-year IRR) on any property before you commit a single dollar.\n\nWould you be open to a 20-minute call to discuss your investment criteria and what I'm currently seeing in the market?\n\nLooking forward to the conversation.\n\nBest regards,\n${agentName}\n${agentPhone}`,
      format: 'email',
    };
  }
}
