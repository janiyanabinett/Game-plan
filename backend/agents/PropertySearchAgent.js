/**
 * PropertySearchAgent
 * Aggregates property data across Zillow, Redfin, Realtor.com, and MLS sources.
 * Provides intelligent search, filtering, scoring, and match ranking.
 * (Uses mock data engine in lieu of paid API keys — swap in real APIs as needed.)
 */

export class PropertySearchAgent {
  constructor() {
    this.sources = ['MLS', 'Zillow', 'Redfin', 'Realtor.com', 'Homes.com'];
    this.propertyTypes = ['Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Land'];
    this.statuses = ['Active', 'Pending', 'Coming Soon', 'Price Reduced'];

    // Phoenix Metro mock seed data — replace with real API calls
    this.mockListings = this.seedListings();
  }

  seedListings() {
    const streets = ['Oak Canyon Rd', 'Desert Rose Dr', 'Sunset Blvd', 'Maple Ave',
      'Camelback Rd', 'Scottsdale Rd', 'Hayden Rd', 'McCormick Pkwy',
      'Pinnacle Peak Rd', 'Shea Blvd', 'Thomas Rd', 'McDowell Rd'];
    const cities = ['Scottsdale', 'Phoenix', 'Tempe', 'Chandler', 'Gilbert', 'Mesa', 'Peoria'];
    const styles = ['Contemporary', 'Spanish Colonial', 'Ranch', 'Mediterranean', 'Modern Farmhouse', 'Craftsman'];
    const statuses = ['Active', 'Active', 'Active', 'Active', 'Pending', 'Coming Soon', 'Price Reduced'];

    const listings = [];
    for (let i = 0; i < 40; i++) {
      const beds = Math.floor(Math.random() * 4) + 2;     // 2–5
      const baths = Math.floor(Math.random() * 3) + 1;    // 1–3
      const sqft = Math.floor(Math.random() * 2500) + 1000; // 1000–3500
      const basePrice = Math.floor(Math.random() * 700000) + 250000;
      const price = Math.round(basePrice / 5000) * 5000;
      const dom = Math.floor(Math.random() * 45);          // days on market
      const city = cities[Math.floor(Math.random() * cities.length)];
      const houseNo = Math.floor(Math.random() * 9000) + 1000;
      const street = streets[Math.floor(Math.random() * streets.length)];

      listings.push({
        id: `prop-${i + 1000}`,
        address: `${houseNo} ${street}`,
        city,
        state: 'AZ',
        zip: `852${String(Math.floor(Math.random() * 99)).padStart(2, '0')}`,
        price,
        pricePerSqft: Math.round(price / sqft),
        beds,
        baths,
        sqft,
        lotSize: Math.round((Math.random() * 10000 + 4000) / 1000) * 1000,
        yearBuilt: Math.floor(Math.random() * 35) + 1990,
        style: styles[Math.floor(Math.random() * styles.length)],
        garage: Math.floor(Math.random() * 3) + 1,
        pool: Math.random() > 0.6,
        hoa: Math.random() > 0.5 ? Math.floor(Math.random() * 400) + 100 : 0,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        daysOnMarket: dom,
        source: this.sources[Math.floor(Math.random() * this.sources.length)],
        propertyType: 'Single Family',
        photos: Array.from({ length: 6 }, (_, j) => `https://picsum.photos/seed/${i * 10 + j}/800/600`),
        virtualTour: Math.random() > 0.5,
        openHouse: Math.random() > 0.7 ? { date: 'Saturday', time: '1:00 PM – 4:00 PM' } : null,
        schools: {
          elementary: { name: `${city} Elementary`, rating: Math.floor(Math.random() * 4) + 7 },
          middle: { name: `${city} Middle School`, rating: Math.floor(Math.random() * 4) + 6 },
          high: { name: `${city} High School`, rating: Math.floor(Math.random() * 4) + 7 },
        },
        walkScore: Math.floor(Math.random() * 50) + 40,
        description: `Beautiful ${beds}-bedroom home in ${city}. Updated throughout, move-in ready.`,
        listedDate: new Date(Date.now() - dom * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        mlsNumber: `MLS${Math.floor(Math.random() * 9000000) + 1000000}`,
      });
    }
    return listings;
  }

  // Main search function
  search(criteria = {}) {
    const {
      city, zip, minPrice, maxPrice, minBeds, maxBeds,
      minBaths, minSqft, maxSqft, pool, hasVirtualTour,
      propertyType, status, maxDom, maxHoa,
      sortBy = 'relevance', page = 1, limit = 12,
    } = criteria;

    let results = [...this.mockListings];

    // Filters
    if (city) results = results.filter(p => p.city.toLowerCase().includes(city.toLowerCase()));
    if (zip) results = results.filter(p => p.zip === zip);
    if (minPrice) results = results.filter(p => p.price >= minPrice);
    if (maxPrice) results = results.filter(p => p.price <= maxPrice);
    if (minBeds) results = results.filter(p => p.beds >= minBeds);
    if (maxBeds) results = results.filter(p => p.beds <= maxBeds);
    if (minBaths) results = results.filter(p => p.baths >= minBaths);
    if (minSqft) results = results.filter(p => p.sqft >= minSqft);
    if (maxSqft) results = results.filter(p => p.sqft <= maxSqft);
    if (pool === true) results = results.filter(p => p.pool);
    if (hasVirtualTour) results = results.filter(p => p.virtualTour);
    if (propertyType) results = results.filter(p => p.propertyType === propertyType);
    if (status) results = results.filter(p => p.status === status);
    if (maxDom != null) results = results.filter(p => p.daysOnMarket <= maxDom);
    if (maxHoa != null) results = results.filter(p => p.hoa <= maxHoa);

    // Sort
    switch (sortBy) {
      case 'price_asc': results.sort((a, b) => a.price - b.price); break;
      case 'price_desc': results.sort((a, b) => b.price - a.price); break;
      case 'newest': results.sort((a, b) => a.daysOnMarket - b.daysOnMarket); break;
      case 'sqft_desc': results.sort((a, b) => b.sqft - a.sqft); break;
      case 'price_per_sqft': results.sort((a, b) => a.pricePerSqft - b.pricePerSqft); break;
      default: results.sort((a, b) => a.daysOnMarket - b.daysOnMarket); // relevance = newest first
    }

    const total = results.length;
    const offset = (page - 1) * limit;
    const paginated = results.slice(offset, offset + limit);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      sources: this.sources,
      results: paginated,
      searchSummary: this.buildSummary(criteria, total),
    };
  }

  buildSummary(criteria, count) {
    const parts = [];
    if (criteria.city) parts.push(criteria.city);
    if (criteria.minBeds) parts.push(`${criteria.minBeds}+ beds`);
    if (criteria.minPrice || criteria.maxPrice) {
      const min = criteria.minPrice ? `$${(criteria.minPrice / 1000).toFixed(0)}k` : '';
      const max = criteria.maxPrice ? `$${(criteria.maxPrice / 1000).toFixed(0)}k` : '';
      parts.push(min && max ? `${min}–${max}` : min || max);
    }
    if (criteria.pool) parts.push('pool');
    return `${count} home${count !== 1 ? 's' : ''}${parts.length ? ' in ' + parts.join(', ') : ''}`;
  }

  // Get a single property by ID
  getById(id) {
    return this.mockListings.find(p => p.id === id) || null;
  }

  // AI-match: rank listings against a buyer profile
  matchToProfile(profile) {
    const {
      maxPrice, minBeds = 2, desiredCity, mustHavePool = false,
      preferredStyle, maxHoa = Infinity,
    } = profile;

    const candidates = this.mockListings.filter(p =>
      p.status === 'Active' &&
      (!maxPrice || p.price <= maxPrice) &&
      p.beds >= minBeds &&
      (!mustHavePool || p.pool) &&
      p.hoa <= maxHoa
    );

    const scored = candidates.map(p => {
      let score = 100;
      if (desiredCity && p.city.toLowerCase() === desiredCity.toLowerCase()) score += 20;
      if (preferredStyle && p.style === preferredStyle) score += 10;
      if (p.daysOnMarket < 5) score += 15; // Fresh listing
      if (p.virtualTour) score += 5;
      if (p.openHouse) score += 5;
      if (p.pool && !mustHavePool) score += 8;
      score -= p.daysOnMarket * 0.5; // Slight penalty for older listings
      return { ...p, matchScore: Math.round(score) };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);

    return {
      profileSummary: profile,
      totalMatches: scored.length,
      topMatches: scored.slice(0, 5),
      allMatches: scored,
    };
  }

  // Market stats for a given city
  marketStats(city = 'Scottsdale') {
    const cityListings = this.mockListings.filter(p =>
      p.city.toLowerCase() === city.toLowerCase()
    );
    if (!cityListings.length) return { error: `No data for ${city}` };

    const prices = cityListings.map(p => p.price);
    const doms = cityListings.map(p => p.daysOnMarket);
    const avg = arr => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    const median = arr => {
      const s = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(s.length / 2);
      return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
    };

    return {
      city,
      activeListings: cityListings.filter(p => p.status === 'Active').length,
      totalListings: cityListings.length,
      medianPrice: median(prices),
      avgPrice: avg(prices),
      medianDom: median(doms),
      avgDom: avg(doms),
      priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
      withPool: cityListings.filter(p => p.pool).length,
      withVirtualTour: cityListings.filter(p => p.virtualTour).length,
      generatedAt: new Date().toISOString(),
    };
  }
}
