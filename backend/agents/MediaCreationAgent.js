/**
 * MediaCreationAgent
 * Generates professional real estate content: listing descriptions,
 * social media posts, email blasts, ad copy, and open house flyers.
 */

export class MediaCreationAgent {
  constructor() {
    this.adjectives = {
      luxury: ['stunning', 'breathtaking', 'exquisite', 'magnificent', 'luxurious', 'impeccable'],
      charming: ['charming', 'delightful', 'inviting', 'warm', 'cozy', 'welcoming'],
      modern: ['sleek', 'contemporary', 'updated', 'modern', 'newly renovated', 'turnkey'],
      spacious: ['expansive', 'open', 'airy', 'light-filled', 'sprawling', 'generous'],
      location: ['desirable', 'coveted', 'sought-after', 'prime', 'premier', 'exclusive'],
    };

    this.featureHighlights = {
      kitchen: ['gourmet kitchen', 'chef\'s kitchen', 'kitchen with quartz countertops', 'open-concept kitchen', 'kitchen with stainless appliances'],
      master: ['luxurious primary suite', 'spa-inspired primary bath', 'walk-in closet', 'retreat-like primary bedroom'],
      outdoor: ['private backyard', 'entertainer\'s patio', 'sparkling pool', 'outdoor kitchen', 'landscaped grounds', 'rooftop deck'],
      garage: ['2-car garage', 'attached garage with storage', 'EV charging', 'tandem garage'],
      views: ['mountain views', 'city views', 'water views', 'panoramic views', 'golf course views'],
      smart: ['smart home technology', 'Nest thermostat', 'solar panels', 'Ring security', 'whole-home audio'],
    };

    this.neighborhoods = {
      adjectives: ['vibrant', 'walkable', 'established', 'up-and-coming', 'family-friendly', 'boutique'],
      amenities: ['top-rated schools', 'walkable to dining and shopping', 'minutes to downtown', 'parks and trails nearby', 'easy freeway access', 'steps to transit'],
    };
  }

  // Pick random from array
  pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Generate MLS listing description
  generateListingDescription(property) {
    const {
      beds = 3, baths = 2, sqft = 1800, price = 500000,
      address = '123 Main St', city = 'Scottsdale', state = 'AZ',
      features = [], style = 'modern', yearBuilt = 2018,
      garage = 2, pool = false, description = '',
    } = property;

    const styleAdj = this.adjectives[style] ? this.pick(this.adjectives[style]) : this.pick(this.adjectives.modern);
    const locationAdj = this.pick(this.neighborhoods.adjectives);
    const amenity = this.pick(this.neighborhoods.amenities);
    const featHighlight = features.length > 0
      ? features.slice(0, 2).join(', ')
      : `${this.pick(this.featureHighlights.kitchen)} and ${this.pick(this.featureHighlights.master)}`;

    const poolLine = pool ? `Cool off in your private pool or entertain on the expansive patio. ` : '';
    const garageLine = garage ? `The ${garage}-car garage provides ample storage and parking. ` : '';
    const yearLine = yearBuilt >= 2015 ? `Built in ${yearBuilt}, nearly everything is like-new. ` : `Thoughtfully updated since it was built in ${yearBuilt}. `;

    return `Welcome to this ${styleAdj} ${beds}-bedroom, ${baths}-bathroom home in the heart of ${locationAdj} ${city}. Spanning ${sqft.toLocaleString()} square feet of beautifully designed living space, this property offers the perfect blend of comfort and sophistication.\n\nThe ${featHighlight} set the tone for the home's elevated finishes throughout. ${poolLine}${garageLine}${yearLine}\n\nSituated in one of ${city}'s most ${locationAdj} neighborhoods — ${amenity} — this home is as convenient as it is beautiful.\n\nDon't miss your chance to make this exceptional property yours. Schedule your private showing today.\n\n${beds} BD | ${baths} BA | ${sqft.toLocaleString()} SF | $${price.toLocaleString()}`;
  }

  // Generate social media posts
  generateSocialPosts(property) {
    const {
      beds = 3, baths = 2, sqft = 1800, price = 500000,
      address = '123 Main St', city = 'Scottsdale', state = 'AZ',
      pool = false, style = 'modern',
    } = property;

    const styleAdj = this.adjectives[style] ? this.pick(this.adjectives[style]) : 'stunning';
    const poolTag = pool ? ' #PoolHome' : '';

    return {
      instagram: `✨ Just Listed! ✨\n\n${styleAdj.charAt(0).toUpperCase() + styleAdj.slice(1)} ${beds}BD/${baths}BA in ${city} for $${(price / 1000).toFixed(0)}k\n\n${sqft.toLocaleString()} sq ft of beautifully designed space — this one won't last! 🏡\n\nDM me or tap the link in bio to schedule your private showing.\n\n#JustListed #${city.replace(/\s/g, '')}RealEstate #DreamHome #NewListing #Realtor #HomeBuying${poolTag} #${state}Homes`,

      facebook: `🏠 NEW LISTING ALERT — ${address}, ${city}, ${state}\n\n${beds} Bedrooms | ${baths} Bathrooms | ${sqft.toLocaleString()} sq ft\nListed at $${price.toLocaleString()}\n\nThis ${styleAdj} home has everything on your wishlist. ${pool ? 'Private pool, ' : ''}Gorgeous finishes, open floor plan, and a location you'll love.\n\n📅 Open House this weekend!\n📞 Call/text for a private showing\n\nTag someone who's been looking for their dream home! 👇`,

      twitter: `🔑 Just listed in ${city}! ${beds}BD/${baths}BA, ${sqft.toLocaleString()} sqft at $${(price / 1000).toFixed(0)}k. ${styleAdj.charAt(0).toUpperCase() + styleAdj.slice(1)} finishes, move-in ready. DM for a showing! #${city.replace(/\s/g, '')} #RealEstate #JustListed`,

      linkedin: `Excited to announce a new listing at ${address}, ${city}, ${state}!\n\nProperty Highlights:\n📐 ${sqft.toLocaleString()} sq ft | ${beds} BD | ${baths} BA\n💰 Listed at $${price.toLocaleString()}\n🏗️ ${styleAdj.charAt(0).toUpperCase() + styleAdj.slice(1)} design with premium finishes\n${pool ? '🏊 Private pool\n' : ''}📍 Prime location with easy access to top amenities\n\nIf you or someone you know is in the market for a beautiful home, I'd love to connect. Private showings available by appointment.\n\n#RealEstate #NewListing #${city.replace(/\s/g, '')} #${state}RealEstate`,
    };
  }

  // Generate email blast
  generateEmailBlast(property, audience = 'buyer_list') {
    const {
      beds = 3, baths = 2, sqft = 1800, price = 500000,
      address = '123 Main St', city = 'Scottsdale', state = 'AZ',
      style = 'modern',
    } = property;

    const styleAdj = this.adjectives[style] ? this.pick(this.adjectives[style]) : 'stunning';

    return {
      subject: `🔑 Just Listed: ${beds}BD/${baths}BA in ${city} | $${(price / 1000).toFixed(0)}k`,
      preheader: `${sqft.toLocaleString()} sq ft of ${styleAdj} space — schedule your showing today`,
      body: `You're receiving this because you're on our exclusive buyer list for ${city} and surrounding areas.\n\n✨ NEW LISTING ✨\n${address}, ${city}, ${state}\n\n$${price.toLocaleString()} | ${beds} BD | ${baths} BA | ${sqft.toLocaleString()} sq ft\n\n${this.generateListingDescription(property).split('\n\n')[0]}\n\n[VIEW FULL LISTING] [SCHEDULE A SHOWING] [REQUEST MORE INFO]\n\nThis property is expected to receive multiple offers. Act quickly!\n\nQuestions? Reply to this email or call us directly.\n\n[Agent Name]\n[Agency Name]\n[Phone] | [Email]`,
    };
  }

  // Generate open house flyer content
  generateOpenHouseFlyer(property, date, time) {
    const {
      beds = 3, baths = 2, sqft = 1800, price = 500000,
      address = '123 Main St', city = 'Scottsdale', state = 'AZ',
      zip = '85251',
    } = property;

    return {
      headline: 'OPEN HOUSE',
      subheadline: `${date} | ${time}`,
      address: `${address}\n${city}, ${state} ${zip}`,
      price: `$${price.toLocaleString()}`,
      stats: `${beds} Beds · ${baths} Baths · ${sqft.toLocaleString()} sq ft`,
      highlights: [
        this.pick(this.featureHighlights.kitchen),
        this.pick(this.featureHighlights.master),
        this.pick(this.neighborhoods.amenities),
      ],
      callToAction: 'Come see it in person — refreshments provided!',
      agentInfo: '[Agent Name] | [Phone] | [Email] | [Brokerage]',
    };
  }

  // Generate ad copy (Google/Facebook)
  generateAdCopy(property) {
    const { beds = 3, baths = 2, price = 500000, city = 'Scottsdale' } = property;

    return {
      google: {
        headline1: `${beds}BD/${baths}BA Home in ${city}`,
        headline2: `$${(price / 1000).toFixed(0)}k — See It Today`,
        headline3: 'Schedule Your Private Showing',
        description1: `Beautiful ${beds}-bedroom home in prime ${city} location. Updated throughout, move-in ready.`,
        description2: 'Browse photos, virtual tour, and schedule a showing online. Homes are moving fast — act now!',
      },
      facebook: {
        primary: `Looking for your dream home in ${city}? This ${beds}BD/${baths}BA gem just hit the market at $${price.toLocaleString()}. Click to see photos and schedule a tour! 🏡`,
        headline: `New Listing: ${beds}BD in ${city} — $${(price / 1000).toFixed(0)}k`,
        cta: 'Learn More',
      },
    };
  }

  // Master generate method
  generate(type, property, options = {}) {
    switch (type) {
      case 'listing': return this.generateListingDescription(property);
      case 'social': return this.generateSocialPosts(property);
      case 'email': return this.generateEmailBlast(property, options.audience);
      case 'flyer': return this.generateOpenHouseFlyer(property, options.date, options.time);
      case 'ads': return this.generateAdCopy(property);
      case 'all': return {
        listing: this.generateListingDescription(property),
        social: this.generateSocialPosts(property),
        email: this.generateEmailBlast(property),
        flyer: this.generateOpenHouseFlyer(property, options.date || 'Saturday', options.time || '1:00 PM – 4:00 PM'),
        ads: this.generateAdCopy(property),
      };
      default: return { error: 'Unknown content type' };
    }
  }
}
