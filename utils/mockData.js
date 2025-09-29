// Mock data for development and testing

// Initialize mock data globally on script load
window.mockListings = null;
window.mockUsers = null;
window.mockTransactions = null;
window.mockDistributionCenters = null;
window.mockDoGoodsStores = null;
window.mockDoGoodsKiosks = null;

window.getMockListings = function() {
  console.log('getMockListings called');
  const mockListings = [
    // Alameda, CA listings
    {
      id: '1',
      donor_id: 'donor1',
      title: 'Fresh Vegetables from Community Garden',
      description: 'Mixed seasonal vegetables including tomatoes, lettuce, and carrots. All organically grown without pesticides.',
      category: 'produce',
      qty: 5,
      unit: 'lbs',
      expiration_date: '2025-09-10T00:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600'],
      pickup_window_start: '2025-09-08T09:00:00Z',
      pickup_window_end: '2025-09-09T18:00:00Z',
      coords: { lat: 37.7652, lng: -122.2416 },
      address: '2201 Central Ave, Alameda, CA 94501',
      status: 'available',
      created_at: '2025-09-07T10:00:00Z',
      updated_at: '2025-09-08T08:30:00Z',
      donor_name: 'Alameda Community Garden',
      donor_type: 'community_garden',
      pickup_instructions: 'Please bring your own bags. Ring the bell at the garden entrance and mention you are picking up the vegetable donation.',
      contact_info: '(510) 555-0123',
      dietary_info: ['Organic', 'Vegan', 'Gluten-Free'],
      allergens: [],
      views: 47
    },
    {
      id: '2',
      donor_id: 'donor2',
      title: 'Prepared Sandwiches',
      description: 'Turkey and ham sandwiches prepared this morning with fresh bread, lettuce, tomatoes, and condiments. Made in commercial kitchen following food safety guidelines.',
      category: 'prepared',
      qty: 12,
      unit: 'sandwiches',
      expiration_date: '2025-01-08T20:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=600'],
      pickup_window_start: '2025-01-08T12:00:00Z',
      pickup_window_end: '2025-01-08T16:00:00Z',
      coords: { lat: 37.7712, lng: -122.2555 },
      address: '1400 Park St, Alameda, CA 94501',
      status: 'available',
      created_at: '2025-01-08T08:00:00Z',
      updated_at: '2025-01-08T08:00:00Z',
      donor_name: 'Alameda Deli & Café',
      pickup_instructions: 'Please come to the back entrance. Sandwiches are individually wrapped and labeled. Refrigeration recommended.',
      contact_info: '(510) 555-0456',
      dietary_info: ['Contains Meat'],
      allergens: ['Gluten', 'Dairy', 'Eggs'],
      views: 23
    },
    {
      id: '3',
      donor_id: 'donor3',
      title: 'Canned Goods Donation',
      description: 'Assorted canned vegetables and soups',
      category: 'packaged',
      qty: 20,
      unit: 'cans',
      expiration_date: '2026-06-15T00:00:00Z',
      perishability: 'low',
      images: ['https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600'],
      pickup_window_start: '2025-01-08T10:00:00Z',
      pickup_window_end: '2025-01-12T17:00:00Z',
      coords: { lat: 37.7799, lng: -122.2822 },
      address: '950 Webster St, Alameda, CA 94501',
      status: 'available',
      created_at: '2025-01-07T14:30:00Z'
    },
    {
      id: '4',
      donor_id: 'donor4',
      title: 'Fresh Bread and Pastries',
      description: 'End-of-day bread and pastries from local bakery',
      category: 'bakery',
      qty: 8,
      unit: 'items',
      expiration_date: '2025-01-09T00:00:00Z',
      perishability: 'medium',
      images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600'],
      pickup_window_start: '2025-01-08T18:00:00Z',
      pickup_window_end: '2025-01-08T21:00:00Z',
      coords: { lat: 37.7590, lng: -122.2677 },
      address: '1700 Lincoln Ave, Alameda, CA 94501',
      status: 'available',
      created_at: '2025-01-08T16:00:00Z'
    },
    {
      id: '5',
      donor_id: 'donor5',
      title: 'Fresh Seafood - End of Day',
      description: 'Fresh salmon, cod, and shellfish from today\'s catch. Must be picked up before closing.',
      category: 'seafood',
      qty: 8,
      unit: 'lbs',
      expiration_date: '2025-01-08T23:59:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600'],
      pickup_window_start: '2025-01-08T16:00:00Z',
      pickup_window_end: '2025-01-08T19:00:00Z',
      coords: { lat: 37.7789, lng: -122.2345 },
      address: '3456 Otis Dr, Alameda, CA 94501',
      status: 'available',
      created_at: '2025-01-08T15:30:00Z',
      donor_name: 'Pacific Coast Fishery',
      pickup_instructions: 'Use the side entrance. Fish is on ice and properly packaged. Bring cooler if possible.',
      contact_info: '(510) 555-0987',
      dietary_info: ['High Protein', 'Fresh'],
      allergens: ['Shellfish', 'Fish'],
      views: 34
    },
    {
      id: '6',
      donor_id: 'donor6',
      title: 'Restaurant Quality Soups',
      description: 'Vegetable minestrone, chicken noodle, and tomato basil soups prepared fresh today.',
      category: 'prepared',
      qty: 6,
      unit: 'quarts',
      expiration_date: '2025-01-10T00:00:00Z',
      perishability: 'medium',
      images: ['https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600'],
      pickup_window_start: '2025-01-08T17:00:00Z',
      pickup_window_end: '2025-01-09T12:00:00Z',
      coords: { lat: 37.7634, lng: -122.2789 },
      address: '789 Webster St, Alameda, CA 94501',
      status: 'available',
      created_at: '2025-01-08T14:15:00Z',
      donor_name: 'Alameda Bistro',
      pickup_instructions: 'Soups are in sealed containers, ready to heat. Please refrigerate immediately.',
      contact_info: '(510) 555-0654',
      dietary_info: ['Homemade', 'Restaurant Quality'],
      allergens: ['Gluten (some varieties)', 'Dairy (some varieties)'],
      views: 28
    },
    {
      id: '7',
      donor_id: 'donor7',
      title: 'Organic Baby Food & Formula',
      description: 'Unopened baby food pouches, infant formula, and organic snacks for toddlers.',
      category: 'baby_food',
      qty: 15,
      unit: 'items',
      expiration_date: '2025-06-01T00:00:00Z',
      perishability: 'low',
      images: ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600'],
      pickup_window_start: '2025-01-08T09:00:00Z',
      pickup_window_end: '2025-01-12T18:00:00Z',
      coords: { lat: 37.7567, lng: -122.2678 },
      address: '1234 Lincoln Ave, Alameda, CA 94501',
      status: 'available',
      created_at: '2025-01-08T07:45:00Z',
      donor_name: 'Growing Families Center',
      pickup_instructions: 'Items are unopened and unexpired. Perfect for families with young children.',
      contact_info: '(510) 555-0321',
      dietary_info: ['Organic', 'Age Appropriate'],
      allergens: [],
      views: 19
    },
    {
      id: '8',
      donor_id: 'donor8',
      title: 'Event Catering Leftovers',
      description: 'High-quality catered food from corporate event: pasta salads, sandwiches, fruit platters, and desserts.',
      category: 'catering',
      qty: 50,
      unit: 'servings',
      expiration_date: '2025-01-09T12:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1555244162-803834f70033?w=600'],
      pickup_window_start: '2025-01-08T18:00:00Z',
      pickup_window_end: '2025-01-08T21:00:00Z',
      coords: { lat: 37.7723, lng: -122.2434 },
      address: '2890 Alameda Ave, Alameda, CA 94501',
      status: 'available',
      created_at: '2025-01-08T17:30:00Z',
      donor_name: 'Elite Catering Services',
      pickup_instructions: 'Large quantity available. Please bring multiple containers or coordinate with other recipients.',
      contact_info: '(510) 555-0111',
      dietary_info: ['Professional Catering', 'Mixed Options'],
      allergens: ['Gluten', 'Dairy', 'Nuts (some items)'],
      views: 67
    },
    {
      id: '9',
      donor_id: 'donor9',
      title: 'International Groceries',
      description: 'Asian, Mexican, and Mediterranean specialty foods including rice, spices, canned goods, and sauces.',
      category: 'international',
      qty: 30,
      unit: 'items',
      expiration_date: '2025-12-31T00:00:00Z',
      perishability: 'low',
      images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600'],
      pickup_window_start: '2025-09-08T10:00:00Z',
      pickup_window_end: '2025-09-14T19:00:00Z',
      coords: { lat: 37.7689, lng: -122.2512 },
      address: '1567 Park St, Alameda, CA 94501',
      status: 'available',
      created_at: '2025-09-08T09:00:00Z',
      donor_name: 'Global Foods Market',
      donor_type: 'grocery_store',
      pickup_instructions: 'Diverse selection of international ingredients. Great for families wanting to try new cuisines.',
      contact_info: '(510) 555-0444',
      dietary_info: ['Halal Options', 'Vegetarian Options', 'International'],
      allergens: ['Soy', 'Sesame (some items)'],
      views: 41
    },

    // Oakland, CA listings
    {
      id: '10',
      donor_id: 'donor10',
      title: 'Artisan Pizza & Pasta',
      description: 'Fresh wood-fired pizzas and homemade pasta dishes from local Italian restaurant. Vegetarian and meat options available.',
      category: 'prepared',
      qty: 15,
      unit: 'servings',
      expiration_date: '2025-09-05T22:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600'],
      pickup_window_start: '2025-09-04T19:00:00Z',
      pickup_window_end: '2025-09-05T21:00:00Z',
      coords: { lat: 37.8044, lng: -122.2711 },
      address: '4501 Telegraph Ave, Oakland, CA 94609',
      status: 'available',
      created_at: '2025-09-04T18:30:00Z',
      donor_name: 'Nonna\'s Kitchen',
      donor_type: 'restaurant',
      pickup_instructions: 'Enter through rear kitchen door. Food is packaged in eco-friendly containers.',
      contact_info: '(510) 555-7890',
      dietary_info: ['Vegetarian Options', 'Fresh Made'],
      allergens: ['Gluten', 'Dairy', 'Eggs'],
      views: 32
    },
    
    {
      id: '11',
      donor_id: 'donor11',
      title: 'Farmers Market Surplus',
      description: 'End-of-day surplus from Oakland Farmers Market including apples, pears, seasonal berries, and root vegetables.',
      category: 'produce',
      qty: 25,
      unit: 'lbs',
      expiration_date: '2025-09-07T00:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600'],
      pickup_window_start: '2025-09-04T16:00:00Z',
      pickup_window_end: '2025-09-05T20:00:00Z',
      coords: { lat: 37.8100, lng: -122.2620 },
      address: '9th & Broadway, Oakland, CA 94607',
      status: 'available',
      created_at: '2025-09-04T15:45:00Z',
      donor_name: 'Oakland Saturday Market Collective',
      donor_type: 'farmers_market',
      pickup_instructions: 'Meet at the information booth. Bring sturdy bags or boxes for transport.',
      contact_info: '(510) 555-3456',
      dietary_info: ['Local', 'Seasonal', 'Farm Fresh'],
      allergens: [],
      views: 56
    },

    // San Francisco, CA listings  
    {
      id: '12',
      donor_id: 'donor12',
      title: 'Gourmet Coffee Shop Pastries',
      description: 'Assorted croissants, muffins, scones, and artisan breads from upscale coffee roastery.',
      category: 'bakery',
      qty: 20,
      unit: 'items',
      expiration_date: '2025-09-06T00:00:00Z',
      perishability: 'medium',
      images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600'],
      pickup_window_start: '2025-09-04T19:00:00Z',
      pickup_window_end: '2025-09-05T09:00:00Z',
      coords: { lat: 37.7749, lng: -122.4194 },
      address: '1234 Market St, San Francisco, CA 94102',
      status: 'available',
      created_at: '2025-09-04T18:00:00Z',
      donor_name: 'Blue Bottle Coffee',
      donor_type: 'cafe',
      pickup_instructions: 'Items are individually wrapped. Perfect for breakfast distribution.',
      contact_info: '(415) 555-2468',
      dietary_info: ['Artisanal', 'Fresh Baked'],
      allergens: ['Gluten', 'Dairy', 'Eggs', 'Nuts (some items)'],
      views: 28
    },

    {
      id: '13',
      donor_id: 'donor13',
      title: 'Hotel Banquet Leftovers',
      description: 'High-quality catered food from corporate event: grilled chicken, rice pilaf, steamed vegetables, and dinner rolls.',
      category: 'catering',
      qty: 75,
      unit: 'servings',
      expiration_date: '2025-09-05T12:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1555244162-803834f70033?w=600'],
      pickup_window_start: '2025-09-04T22:00:00Z',
      pickup_window_end: '2025-09-05T10:00:00Z',
      coords: { lat: 37.7849, lng: -122.4094 },
      address: '333 O\'Farrell St, San Francisco, CA 94102',
      status: 'available',
      created_at: '2025-09-04T21:30:00Z',
      donor_name: 'Grand Hyatt San Francisco',
      donor_type: 'hotel',
      pickup_instructions: 'Large quantity - coordinate with multiple recipients. Food is professionally packaged.',
      contact_info: '(415) 555-9876',
      dietary_info: ['Hotel Quality', 'Balanced Meals'],
      allergens: ['Gluten (some items)', 'Dairy'],
      views: 89
    },

    // Berkeley, CA listings
    {
      id: '14',
      donor_id: 'donor14',
      title: 'University Dining Hall Surplus',
      description: 'Nutritious meals from UC Berkeley dining: veggie burgers, salads, fruit cups, and whole grain sides.',
      category: 'prepared',
      qty: 40,
      unit: 'meals',
      expiration_date: '2025-09-05T20:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600'],
      pickup_window_start: '2025-09-04T19:30:00Z',
      pickup_window_end: '2025-09-05T12:00:00Z',
      coords: { lat: 37.8719, lng: -122.2585 },
      address: '2700 Hearst Ave, Berkeley, CA 94720',
      status: 'available',
      created_at: '2025-09-04T19:00:00Z',
      donor_name: 'UC Berkeley Dining Services',
      donor_type: 'university',
      pickup_instructions: 'Use loading dock entrance. Meals are individually portioned and labeled.',
      contact_info: '(510) 555-6543',
      dietary_info: ['Nutritionally Balanced', 'Student Approved'],
      allergens: ['Gluten (some items)', 'Soy', 'Nuts (some items)'],
      views: 65
    },

    // Fremont, CA listings
    {
      id: '15',
      donor_id: 'donor15',
      title: 'Tech Company Catering Surplus',
      description: 'Gourmet lunch spread from tech company event: quinoa bowls, grilled salmon, roasted vegetables, artisan salads.',
      category: 'catering',
      qty: 60,
      unit: 'portions',
      expiration_date: '2025-09-05T15:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600'],
      pickup_window_start: '2025-09-04T14:00:00Z',
      pickup_window_end: '2025-09-05T13:00:00Z',
      coords: { lat: 37.5485, lng: -121.9886 },
      address: '47700 Kato Rd, Fremont, CA 94538',
      status: 'available',
      created_at: '2025-09-04T13:30:00Z',
      donor_name: 'Tesla Fremont Factory',
      donor_type: 'corporate',
      pickup_instructions: 'Security will direct you to employee cafeteria. High-quality, health-conscious meals.',
      contact_info: '(510) 555-8901',
      dietary_info: ['Gourmet', 'Health Conscious', 'Sustainable'],
      allergens: ['Fish', 'Sesame'],
      views: 78
    },

    // San Jose, CA listings
    {
      id: '16',
      donor_id: 'donor16',
      title: 'Hispanic Market Fresh Produce',
      description: 'Fresh avocados, limes, cilantro, jalapeños, tomatoes, and other produce from Mexican grocery store.',
      category: 'produce',
      qty: 35,
      unit: 'lbs',
      expiration_date: '2025-09-08T00:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600'],
      pickup_window_start: '2025-09-04T17:00:00Z',
      pickup_window_end: '2025-09-06T19:00:00Z',
      coords: { lat: 37.3382, lng: -121.8863 },
      address: '1425 Story Rd, San Jose, CA 95122',
      status: 'available',
      created_at: '2025-09-04T16:30:00Z',
      donor_name: 'Mercado Latino',
      donor_type: 'ethnic_market',
      pickup_instructions: 'Produce is fresh and perfect for Mexican cooking. Staff speaks Spanish and English.',
      contact_info: '(408) 555-4567',
      dietary_info: ['Fresh', 'Authentic', 'Cultural'],
      allergens: [],
      views: 43
    },

    {
      id: '17',
      donor_id: 'donor17',
      title: 'Asian Restaurant Family Meals',
      description: 'Traditional Chinese family-style meals: fried rice, chow mein, sweet and sour pork, vegetable stir-fry.',
      category: 'prepared',
      qty: 12,
      unit: 'family portions',
      expiration_date: '2025-09-05T21:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600'],
      pickup_window_start: '2025-09-04T20:00:00Z',
      pickup_window_end: '2025-09-05T20:00:00Z',
      coords: { lat: 37.3541, lng: -121.9552 },
      address: '2855 Stevens Creek Blvd, San Jose, CA 95128',
      status: 'available',
      created_at: '2025-09-04T19:45:00Z',
      donor_name: 'Golden Dragon Restaurant',
      donor_type: 'restaurant',
      pickup_instructions: 'Each portion serves 3-4 people. Containers are microwaveable.',
      contact_info: '(408) 555-7891',
      dietary_info: ['Family Style', 'Traditional'],
      allergens: ['Soy', 'Gluten', 'Shellfish (some dishes)'],
      views: 51
    },

    // Additional diverse listings
    {
      id: '18',
      donor_id: 'donor18',
      title: 'Kosher Deli Specialties',
      description: 'Kosher prepared foods: matzo ball soup, pastrami sandwiches, potato kugel, and challah bread.',
      category: 'prepared',
      qty: 18,
      unit: 'servings',
      expiration_date: '2025-09-06T18:00:00Z',
      perishability: 'medium',
      images: ['https://images.unsplash.com/photo-1551782450-17144efb9c50?w=600'],
      pickup_window_start: '2025-09-05T16:00:00Z',
      pickup_window_end: '2025-09-06T17:00:00Z',
      coords: { lat: 37.7849, lng: -122.4094 },
      address: '5800 Geary Blvd, San Francisco, CA 94121',
      status: 'available',
      created_at: '2025-09-05T15:30:00Z',
      donor_name: 'Goldberg\'s Kosher Deli',
      donor_type: 'deli',
      pickup_instructions: 'All items are certified kosher. Perfect for families observing dietary laws.',
      contact_info: '(415) 555-3210',
      dietary_info: ['Kosher Certified', 'Traditional Jewish'],
      allergens: ['Gluten', 'Eggs'],
      views: 24
    },

    {
      id: '19',
      donor_id: 'donor19',
      title: 'Vegan Cafe Surplus',
      description: 'Plant-based meals and snacks: quinoa Buddha bowls, vegan wraps, cashew cheese, fresh smoothies.',
      category: 'prepared',
      qty: 22,
      unit: 'items',
      expiration_date: '2025-09-05T19:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600'],
      pickup_window_start: '2025-09-04T17:30:00Z',
      pickup_window_end: '2025-09-05T18:00:00Z',
      coords: { lat: 37.8044, lng: -122.2711 },
      address: '3416 Piedmont Ave, Oakland, CA 94611',
      status: 'available',
      created_at: '2025-09-04T17:00:00Z',
      donor_name: 'Green Earth Cafe',
      donor_type: 'cafe',
      pickup_instructions: 'All items are 100% plant-based and organic when possible.',
      contact_info: '(510) 555-6789',
      dietary_info: ['Vegan', 'Organic', 'Gluten-Free Options'],
      allergens: ['Nuts', 'Soy'],
      views: 37
    },

    {
      id: '20',
      donor_id: 'donor20',
      title: 'Food Truck Festival Leftovers',
      description: 'Variety from food truck festival: tacos, BBQ sliders, kettle corn, funnel cakes, lemonade.',
      category: 'prepared',
      qty: 45,
      unit: 'assorted items',
      expiration_date: '2025-09-05T23:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600'],
      pickup_window_start: '2025-09-04T21:00:00Z',
      pickup_window_end: '2025-09-05T22:00:00Z',
      coords: { lat: 37.7849, lng: -122.4094 },
      address: 'Civic Center Plaza, San Francisco, CA 94102',
      status: 'available',
      created_at: '2025-09-04T20:30:00Z',
      donor_name: 'SF Food Truck Festival',
      donor_type: 'event',
      pickup_instructions: 'Meet at festival coordinator tent. Fun variety perfect for families.',
      contact_info: '(415) 555-9999',
      dietary_info: ['Festival Foods', 'Variety Pack'],
      allergens: ['Gluten', 'Dairy', 'Nuts (some items)'],
      views: 92
    },

    // Palo Alto, CA listings
    {
      id: '21',
      donor_id: 'donor21',
      title: 'Stanford University Cafeteria Surplus',
      description: 'Healthy dining hall meals: Buddha bowls, grilled proteins, fresh salads, and whole grain options.',
      category: 'prepared',
      qty: 80,
      unit: 'meals',
      expiration_date: '2025-09-05T20:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600'],
      pickup_window_start: '2025-09-04T19:00:00Z',
      pickup_window_end: '2025-09-05T14:00:00Z',
      coords: { lat: 37.4275, lng: -122.1697 },
      address: '450 Serra Mall, Stanford, CA 94305',
      status: 'available',
      created_at: '2025-09-04T18:30:00Z',
      donor_name: 'Stanford Dining',
      donor_type: 'university',
      pickup_instructions: 'Food services loading dock. Meals are nutritionally balanced.',
      contact_info: '(650) 555-7854',
      dietary_info: ['Nutritionally Balanced', 'University Quality'],
      allergens: ['Gluten (some items)', 'Nuts (some items)'],
      views: 67
    },

    // Sunnyvale, CA listings
    {
      id: '22',
      donor_id: 'donor22',
      title: 'Tech Campus Gourmet Kitchen',
      description: 'Premium employee meals: sushi rolls, poke bowls, artisan sandwiches, and fresh fruit.',
      category: 'prepared',
      qty: 55,
      unit: 'portions',
      expiration_date: '2025-09-05T16:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600'],
      pickup_window_start: '2025-09-04T15:00:00Z',
      pickup_window_end: '2025-09-05T15:00:00Z',
      coords: { lat: 37.3688, lng: -122.0363 },
      address: '1600 Amphitheatre Pkwy, Mountain View, CA 94043',
      status: 'available',
      created_at: '2025-09-04T14:45:00Z',
      donor_name: 'Google Campus Dining',
      donor_type: 'corporate',
      pickup_instructions: 'Security checkpoint required. High-end employee cafeteria food.',
      contact_info: '(650) 555-4567',
      dietary_info: ['Gourmet', 'Tech Company Quality'],
      allergens: ['Fish', 'Soy', 'Shellfish'],
      views: 89
    },

    // Richmond, CA listings
    {
      id: '23',
      donor_id: 'donor23',
      title: 'Community Center BBQ Event Leftovers',
      description: 'BBQ feast surplus: pulled pork, brisket, coleslaw, mac and cheese, cornbread.',
      category: 'prepared',
      qty: 40,
      unit: 'servings',
      expiration_date: '2025-09-05T22:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600'],
      pickup_window_start: '2025-09-04T19:00:00Z',
      pickup_window_end: '2025-09-05T21:00:00Z',
      coords: { lat: 37.9358, lng: -122.3478 },
      address: '3230 Macdonald Ave, Richmond, CA 94804',
      status: 'available',
      created_at: '2025-09-04T18:45:00Z',
      donor_name: 'Richmond Community Center',
      donor_type: 'community_center',
      pickup_instructions: 'Community event surplus. Hearty portions perfect for families.',
      contact_info: '(510) 555-8901',
      dietary_info: ['BBQ Style', 'Comfort Food'],
      allergens: ['Dairy', 'Gluten'],
      views: 56
    },

    // Hayward, CA listings  
    {
      id: '24',
      donor_id: 'donor24',
      title: 'Mexican Restaurant Family Platters',
      description: 'Authentic Mexican food: chicken enchiladas, beef tacos, rice, beans, fresh guacamole.',
      category: 'prepared',
      qty: 30,
      unit: 'family servings',
      expiration_date: '2025-09-05T21:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1565299507177-b0ac66763c7c?w=600'],
      pickup_window_start: '2025-09-04T20:00:00Z',
      pickup_window_end: '2025-09-05T20:00:00Z',
      coords: { lat: 37.6688, lng: -122.0808 },
      address: '22506 Main St, Hayward, CA 94541',
      status: 'available',
      created_at: '2025-09-04T19:30:00Z',
      donor_name: 'Casa Guadalajara',
      donor_type: 'restaurant',
      pickup_instructions: 'Authentic Mexican cuisine. Each serving feeds 4-5 people.',
      contact_info: '(510) 555-2468',
      dietary_info: ['Mexican Cuisine', 'Family Style'],
      allergens: ['Dairy', 'Gluten (tortillas)'],
      views: 78
    },

    // South Bay - San Mateo, CA listings
    {
      id: '25',
      donor_id: 'donor25',
      title: 'Hospital Cafeteria Surplus',
      description: 'Nutritious meals from hospital food service: grilled chicken, steamed vegetables, brown rice, fresh salads.',
      category: 'prepared',
      qty: 45,
      unit: 'meals',
      expiration_date: '2025-09-05T19:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600'],
      pickup_window_start: '2025-09-04T18:00:00Z',
      pickup_window_end: '2025-09-05T18:00:00Z',
      coords: { lat: 37.5629, lng: -122.3255 },
      address: '222 W 39th Ave, San Mateo, CA 94403',
      status: 'available',
      created_at: '2025-09-04T17:45:00Z',
      donor_name: 'San Mateo Medical Center',
      donor_type: 'hospital',
      pickup_instructions: 'Use staff entrance. Meals are nutritionally balanced and portioned.',
      contact_info: '(650) 555-7890',
      dietary_info: ['Hospital Grade', 'Balanced Nutrition'],
      allergens: ['Gluten (some items)'],
      views: 42
    },

    // Milpitas, CA listings
    {
      id: '26',
      donor_id: 'donor26',
      title: 'Asian Supermarket Produce',
      description: 'Fresh Asian vegetables and fruits: bok choy, napa cabbage, Asian pears, dragon fruit, lychee.',
      category: 'produce',
      qty: 40,
      unit: 'lbs',
      expiration_date: '2025-09-07T00:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600'],
      pickup_window_start: '2025-09-04T16:00:00Z',
      pickup_window_end: '2025-09-06T20:00:00Z',
      coords: { lat: 37.4323, lng: -121.8996 },
      address: '1849 Landess Ave, Milpitas, CA 95035',
      status: 'available',
      created_at: '2025-09-04T15:30:00Z',
      donor_name: 'Asia Pacific Market',
      donor_type: 'supermarket',
      pickup_instructions: 'Fresh specialty produce. Staff can help identify vegetables and suggest cooking methods.',
      contact_info: '(408) 555-3456',
      dietary_info: ['Asian Varieties', 'Fresh', 'Unique Items'],
      allergens: [],
      views: 38
    },

    // Santa Clara, CA listings
    {
      id: '27',
      donor_id: 'donor27',
      title: 'Tech Company Breakfast Buffet',
      description: 'Morning buffet surplus: bagels, fresh fruit, yogurt parfaits, granola, coffee, juice.',
      category: 'prepared',
      qty: 60,
      unit: 'servings',
      expiration_date: '2025-09-05T14:00:00Z',
      perishability: 'medium',
      images: ['https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600'],
      pickup_window_start: '2025-09-05T10:00:00Z',
      pickup_window_end: '2025-09-05T13:00:00Z',
      coords: { lat: 37.3541, lng: -121.9552 },
      address: '2200 Mission College Blvd, Santa Clara, CA 95054',
      status: 'available',
      created_at: '2025-09-05T09:30:00Z',
      donor_name: 'Intel Corporation Campus',
      donor_type: 'corporate',
      pickup_instructions: 'Security clearance required. Fresh breakfast items perfect for morning distribution.',
      contact_info: '(408) 555-6789',
      dietary_info: ['Breakfast Items', 'Corporate Quality'],
      allergens: ['Gluten', 'Dairy', 'Nuts (some items)'],
      views: 53
    },

    // Cupertino, CA listings
    {
      id: '28',
      donor_id: 'donor28',
      title: 'Organic Juice Bar Surplus',
      description: 'Cold-pressed juices, smoothie bowls, protein shakes, and healthy snacks made fresh this morning.',
      category: 'beverages',
      qty: 25,
      unit: 'bottles',
      expiration_date: '2025-09-05T20:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=600'],
      pickup_window_start: '2025-09-04T17:00:00Z',
      pickup_window_end: '2025-09-05T19:00:00Z',
      coords: { lat: 37.3230, lng: -122.0322 },
      address: '10123 N Wolfe Rd, Cupertino, CA 95014',
      status: 'available',
      created_at: '2025-09-04T16:45:00Z',
      donor_name: 'Pure Juice Co.',
      donor_type: 'juice_bar',
      pickup_instructions: 'Premium cold-pressed juices. Keep refrigerated for best quality.',
      contact_info: '(408) 555-9012',
      dietary_info: ['Organic', 'Cold-Pressed', 'Nutrient Dense'],
      allergens: [],
      views: 31
    },

    // Morgan Hill, CA listings
    {
      id: '29',
      donor_id: 'donor29',
      title: 'Farm-to-Table Restaurant Harvest',
      description: 'Locally sourced farm vegetables: heirloom tomatoes, zucchini, bell peppers, herbs, seasonal greens.',
      category: 'produce',
      qty: 35,
      unit: 'lbs',
      expiration_date: '2025-09-08T00:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600'],
      pickup_window_start: '2025-09-04T15:00:00Z',
      pickup_window_end: '2025-09-07T19:00:00Z',
      coords: { lat: 37.1305, lng: -121.6544 },
      address: '17860 Monterey Rd, Morgan Hill, CA 95037',
      status: 'available',
      created_at: '2025-09-04T14:30:00Z',
      donor_name: 'Harvest Moon Restaurant',
      donor_type: 'restaurant',
      pickup_instructions: 'Farm-fresh vegetables from local partners. Perfect condition for immediate use.',
      contact_info: '(408) 555-7654',
      dietary_info: ['Farm Fresh', 'Local', 'Heirloom Varieties'],
      allergens: [],
      views: 47
    },

    // Gilroy, CA listings
    {
      id: '30',
      donor_id: 'donor30',
      title: 'Garlic Festival Vendor Surplus',
      description: 'Garlic-themed prepared foods: garlic bread, roasted garlic, garlic fries, festival specialties.',
      category: 'prepared',
      qty: 40,
      unit: 'servings',
      expiration_date: '2025-09-05T22:00:00Z',
      perishability: 'medium',
      images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600'],
      pickup_window_start: '2025-09-04T20:00:00Z',
      pickup_window_end: '2025-09-05T21:00:00Z',
      coords: { lat: 37.0058, lng: -121.5683 },
      address: '7050 Miller Ave, Gilroy, CA 95020',
      status: 'available',
      created_at: '2025-09-04T19:15:00Z',
      donor_name: 'Gilroy Garlic Festival Vendors',
      donor_type: 'event',
      pickup_instructions: 'Festival food with signature garlic flavoring. Popular local specialties.',
      contact_info: '(408) 555-4321',
      dietary_info: ['Festival Food', 'Garlic Specialty', 'Local Flavor'],
      allergens: ['Gluten', 'Dairy'],
      views: 29
    },

    // Redwood City, CA listings
    {
      id: '31',
      donor_id: 'donor31',
      title: 'Senior Center Lunch Program Extra',
      description: 'Nutritious senior meals: baked fish, mashed potatoes, green beans, dinner rolls, fruit cups.',
      category: 'prepared',
      qty: 20,
      unit: 'meals',
      expiration_date: '2025-09-05T17:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600'],
      pickup_window_start: '2025-09-04T14:00:00Z',
      pickup_window_end: '2025-09-05T16:00:00Z',
      coords: { lat: 37.4852, lng: -122.2364 },
      address: '1400 Roosevelt Ave, Redwood City, CA 94061',
      status: 'available',
      created_at: '2025-09-04T13:45:00Z',
      donor_name: 'Redwood Oaks Senior Center',
      donor_type: 'senior_center',
      pickup_instructions: 'Balanced meals prepared for senior nutrition needs. Soft textures available.',
      contact_info: '(650) 555-8765',
      dietary_info: ['Senior Friendly', 'Balanced Nutrition', 'Soft Options'],
      allergens: ['Fish', 'Gluten'],
      views: 34
    },

    // South San Francisco, CA listings
    {
      id: '32',
      donor_id: 'donor32',
      title: 'Biotech Company Catered Lunch',
      description: 'High-end catered meals: Mediterranean bowls, artisan sandwiches, fresh salads, premium sides.',
      category: 'catering',
      qty: 50,
      unit: 'portions',
      expiration_date: '2025-09-05T16:00:00Z',
      perishability: 'high',
      images: ['https://images.unsplash.com/photo-1555244162-803834f70033?w=600'],
      pickup_window_start: '2025-09-04T13:30:00Z',
      pickup_window_end: '2025-09-05T15:00:00Z',
      coords: { lat: 37.6541, lng: -122.4077 },
      address: '333 Oyster Point Blvd, South San Francisco, CA 94080',
      status: 'available',
      created_at: '2025-09-04T13:00:00Z',
      donor_name: 'Genentech Campus Dining',
      donor_type: 'corporate',
      pickup_instructions: 'Premium corporate catering. Professional packaging and presentation.',
      contact_info: '(650) 555-9876',
      dietary_info: ['Corporate Catering', 'Mediterranean', 'Premium Quality'],
      allergens: ['Nuts', 'Dairy', 'Gluten (some items)'],
      views: 61
    }
  ];
  console.log('Mock listings returned:', mockListings);
  return mockListings;
}

window.getMockUsers = function() {
  return [
    {
      id: 'donor1',
      name: 'John Smith',
      email: 'john@example.com',
      role: 'donor',
      address: '2201 Central Ave, Alameda, CA',
      coords: { lat: 37.7652, lng: -122.2416 }
    },
    {
      id: 'recipient1',
      name: 'Maria Garcia',
      email: 'maria@example.com',
      role: 'recipient',
      address: '1550 Oak St, Alameda, CA',
      coords: { lat: 37.7689, lng: -122.2644 }
    },
    {
      id: 'volunteer1',
      name: 'David Wilson',
      email: 'david@example.com',
      role: 'volunteer',
      address: '2300 Alameda Ave, Alameda, CA',
      coords: { lat: 37.7756, lng: -122.2398 }
  },

];
}

window.getMockTransactions = function() {
  return [
    {
      id: 'txn1',
      listing_id: '4',
      donor_id: 'donor4',
      recipient_id: 'recipient1',
      status: 'available',
      timeline: [
        { status: 'claimed', timestamp: '2025-01-08T17:00:00Z', note: 'Listing claimed by recipient' }
      ],
      created_at: '2025-01-08T17:00:00Z'
    }
  ];
}

window.getMockDistributionCenters = function() {
  return [
    {
      id: 'dc1',
      name: 'DoGoods Alameda Hub',
      type: 'distribution_center',
      address: '2200 Central Ave, Alameda, CA 94501',
      coords: { lat: 37.7650, lng: -122.2420 },
      hours: 'Mon-Sat 9AM-7PM, Sun 10AM-5PM',
      capacity: 'Large',
      services: ['Food Pickup', 'Volunteer Coordination', 'Emergency Distribution'],
      contact: '(510) 748-4567',
      status: 'active'
    },
    {
      id: 'dc2',
      name: 'DoGoods Park Street Center',
      type: 'distribution_center',
      address: '1500 Park St, Alameda, CA 94501',
      coords: { lat: 37.7720, lng: -122.2560 },
      hours: 'Mon-Fri 8AM-8PM, Sat-Sun 9AM-6PM',
      capacity: 'Medium',
      services: ['Food Pickup', 'Storage', 'Community Outreach'],
      contact: '(510) 748-5678',
      status: 'active'
    },
    {
      id: 'dc3',
      name: 'DoGoods Webster Street Hub',
      type: 'distribution_center',
      address: '1000 Webster St, Alameda, CA 94501',
      coords: { lat: 37.7800, lng: -122.2830 },
      hours: 'Daily 7AM-9PM',
      capacity: 'Large',
      services: ['Food Pickup', '24/7 Emergency', 'Mobile Distribution'],
      contact: '(510) 748-6789',
      status: 'active'
    }
  ];
}

// DoGoods Participant Stores - Local businesses participating in food rescue
window.getMockDoGoodsStores = function() {
  return [
    {
      id: 'store1',
      name: 'Alameda Natural Grocery',
      type: 'participant_store',
      business_type: 'grocery',
      address: '1650 Park St, Alameda, CA 94501',
      coords: { lat: 37.7715, lng: -122.2545 },
      hours: 'Daily 7AM-10PM',
      services: ['Food Pickup', 'Drop-off Point', 'Donation Collection'],
      contact: '(510) 865-1500',
      participation_level: 'Gold Partner',
      status: 'active'
    },
    {
      id: 'store2', 
      name: 'Encinal Market',
      type: 'participant_store',
      business_type: 'convenience',
      address: '2272 Encinal Ave, Alameda, CA 94501',
      coords: { lat: 37.7618, lng: -122.2478 },
      hours: 'Mon-Sun 6AM-11PM',
      services: ['Drop-off Point', 'Emergency Supplies'],
      contact: '(510) 521-4200',
      participation_level: 'Silver Partner',
      status: 'active'
    },
    {
      id: 'store3',
      name: "Tucker's Ice Cream & More", 
      type: 'participant_store',
      business_type: 'cafe',
      address: '1349 Park St, Alameda, CA 94501',
      coords: { lat: 37.7708, lng: -122.2552 },
      hours: 'Daily 11AM-9PM',
      services: ['Food Pickup', 'Community Board'],
      contact: '(510) 521-4200',
      participation_level: 'Bronze Partner',
      status: 'active'
    },
    {
      id: 'store4',
      name: 'CVS Pharmacy Alameda',
      type: 'participant_store', 
      business_type: 'pharmacy',
      address: '2290 Santa Clara Ave, Alameda, CA 94501',
      coords: { lat: 37.7645, lng: -122.2823 },
      hours: 'Daily 8AM-10PM',
      services: ['Drop-off Point', 'Information Hub'],
      contact: '(510) 748-9876',
      participation_level: 'Silver Partner',
      status: 'active'
    }
  ];
}

// DoGoods Kiosks - Self-service terminals for those without smartphones
window.getMockDoGoodsKiosks = function() {
  return [
    {
      id: 'kiosk1',
      name: 'Alameda Library Food Kiosk',
      type: 'food_kiosk',
      address: '2264 Santa Clara Ave, Alameda, CA 94501',
      coords: { lat: 37.7643, lng: -122.2818 },
      hours: 'Library Hours: Mon-Thu 10AM-8PM, Fri-Sat 10AM-6PM, Sun 1PM-5PM',
      services: ['Food Search', 'Request Assistance', 'Multilingual Support', 'Print Directions'],
      languages: ['English', 'Spanish', 'Mandarin', 'Vietnamese'],
      accessibility: ['Wheelchair Accessible', 'Audio Support', 'Large Text Option'],
      status: 'active'
    },
    {
      id: 'kiosk2',
      name: 'Alameda Hospital Food Access Terminal',
      type: 'food_kiosk', 
      address: '2070 Clinton Ave, Alameda, CA 94501',
      coords: { lat: 37.7889, lng: -122.2654 },
      hours: '24/7 Access',
      services: ['Emergency Food Requests', 'Medical Dietary Needs', 'Instant Matching'],
      languages: ['English', 'Spanish', 'Tagalog'],
      accessibility: ['Wheelchair Accessible', 'Voice Navigation'],
      status: 'active'
    },
    {
      id: 'kiosk3',
      name: 'Alameda Community Center Kiosk',
      type: 'food_kiosk',
      address: '2240 Alameda Ave, Alameda, CA 94501',
      coords: { lat: 37.7748, lng: -122.2385 },
      hours: 'Center Hours: Mon-Fri 9AM-9PM, Sat-Sun 9AM-6PM',
      services: ['Food Search', 'Volunteer Sign-up', 'Community Resources'],
      languages: ['English', 'Spanish'],
      accessibility: ['Wheelchair Accessible', 'Simple Interface'],
      status: 'active'
    }
  ];
}

// Initialize all mock data on script load
window.initializeMockData = function() {
  console.log('Initializing mock data...');
  try {
    window.mockListings = window.getMockListings();
    window.mockUsers = window.getMockUsers();
    window.mockTransactions = window.getMockTransactions();
    window.mockDistributionCenters = window.getMockDistributionCenters();
    window.mockDoGoodsStores = window.getMockDoGoodsStores();
    window.mockDoGoodsKiosks = window.getMockDoGoodsKiosks();
    
    console.log('Mock data initialized successfully:');
    console.log('- Listings:', window.mockListings?.length || 0);
    console.log('- Users:', window.mockUsers?.length || 0);
    console.log('- Distribution Centers:', window.mockDistributionCenters?.length || 0);
    
    return true;
  } catch (error) {
    console.error('Error initializing mock data:', error);
    return false;
  }
};

// Ensure mock data is always available
window.ensureMockDataAvailable = function() {
  if (!window.mockListings || window.mockListings.length === 0) {
    console.log('Ensuring mock data is available...');
    
    // Force initialization
    if (typeof window.getMockListings === 'function') {
      window.mockListings = window.getMockListings();
      console.log(`Direct getMockListings call: ${window.mockListings ? window.mockListings.length : 0} listings`);
    }
    
    // Try full initialization if still empty
    if ((!window.mockListings || window.mockListings.length === 0) && typeof window.initializeMockData === 'function') {
      window.initializeMockData();
      console.log(`After initializeMockData: ${window.mockListings ? window.mockListings.length : 0} listings`);
    }
  }
  
  return window.mockListings && window.mockListings.length > 0;
};

// Mock schedules and tasks functions
window.getMockSchedules = function() {
  return [
    {
      id: 'schedule_1',
      type: 'pickup',
      listingId: '1',
      scheduledTime: new Date(Date.now() + 2 * 60 * 60000).toISOString(),
      driverId: 'driver_001',
      status: 'scheduled',
      priority: 'high',
      estimatedDuration: 30,
      createdAt: new Date().toISOString()
    },
    {
      id: 'schedule_2',
      type: 'delivery',
      listingId: '2',
      scheduledTime: new Date(Date.now() + 4 * 60 * 60000).toISOString(),
      driverId: 'driver_001',
      status: 'scheduled',
      priority: 'normal',
      estimatedDuration: 20,
      createdAt: new Date().toISOString()
    }
  ];
};

window.getMockTasks = function() {
  return [
    {
      id: 'task_1',
      type: 'emergency_pickup_delivery',
      pickupScheduleId: 'schedule_1',
      deliveryScheduleId: 'schedule_2',
      driverId: 'driver_001',
      status: 'pending',
      priority: 'emergency',
      estimatedTime: 45,
      createdAt: new Date().toISOString()
    },
    {
      id: 'task_2',
      type: 'pickup_delivery',
      driverId: 'auto-assign',
      status: 'pending',
      priority: 'normal',
      estimatedTime: 30,
      createdAt: new Date().toISOString()
    }
  ];
};

// Ensure mock data is always available with guaranteed creation
window.ensureMockDataAvailable = function() {
  console.log('Ensuring mock data availability...');
  
  // Always recreate to guarantee fresh data
  if (typeof window.getMockListings === 'function') {
    window.mockListings = window.getMockListings();
  } else {
    // Emergency fallback data
    window.mockListings = [
      {
        id: '1', donor_id: 'donor1', title: 'Emergency Water Supply',
        description: 'Bottled water for emergency needs', category: 'beverages',
        qty: 50, unit: 'bottles', status: 'available',
        coords: { lat: 37.7749, lng: -122.4194 },
        address: 'San Francisco Emergency Center',
        created_at: new Date().toISOString()
      },
      {
        id: '2', donor_id: 'donor2', title: 'Fresh Produce Pack',
        description: 'Mixed vegetables and fruits', category: 'produce',
        qty: 10, unit: 'bags', status: 'available',
        coords: { lat: 37.7849, lng: -122.4094 },
        address: 'Community Garden Center',
        created_at: new Date().toISOString()
      }
    ];
  }
  
  console.log(`Mock data ensured: ${window.mockListings?.length || 0} listings available`);
  return window.mockListings && window.mockListings.length > 0;
};

// Initialize all mock data with guaranteed creation
window.initializeAllMockData = function() {
  console.log('Initializing all mock data...');
  
  const listings = window.getMockListings ? window.getMockListings() : [];
  const users = window.getMockUsers ? window.getMockUsers() : [];
  const transactions = window.getMockTransactions ? window.getMockTransactions() : [];
  const distributionCenters = window.getMockDistributionCenters ? window.getMockDistributionCenters() : [];
  const doGoodsStores = window.getMockDoGoodsStores ? window.getMockDoGoodsStores() : [];
  const doGoodsKiosks = window.getMockDoGoodsKiosks ? window.getMockDoGoodsKiosks() : [];
  const schedules = window.getMockSchedules ? window.getMockSchedules() : [];
  const tasks = window.getMockTasks ? window.getMockTasks() : [];
  
  window.mockListings = listings;
  window.mockUsers = users;
  window.mockTransactions = transactions;
  window.mockDistributionCenters = distributionCenters;
  window.mockDoGoodsStores = doGoodsStores;
  window.mockDoGoodsKiosks = doGoodsKiosks;
  window.mockSchedules = schedules;
  window.mockTasks = tasks;
  
  console.log('Mock data initialization complete:');
  console.log('- Listings:', listings.length);
  console.log('- Distribution Centers:', distributionCenters.length);
  console.log('- DoGoods Stores:', doGoodsStores.length);
  console.log('- DoGoods Kiosks:', doGoodsKiosks.length);
  
  // Trigger callback if available
  if (typeof window.onMockDataInitialized === 'function') {
    window.onMockDataInitialized(listings);
  }
  
  return { listings, users, transactions, distributionCenters, doGoodsStores, doGoodsKiosks, schedules, tasks };
};

// Sample Distribution Center Food Inventory
window.getSampleStoreMenu = function(centerId) {
  return [
    {
      id: 'inv_1',
      name: 'Fresh Produce Selection',
      description: 'Daily delivery of fresh fruits and vegetables: apples, bananas, carrots, onions, potatoes, leafy greens',
      quantity: 50,
      category: 'produce',
      available: true,
      donated_by: 'Local Farmers Market'
    },
    {
      id: 'inv_2', 
      name: 'Hot Prepared Meals',
      description: 'Freshly prepared meals from partner restaurants: vegetarian chili, chicken soup, pasta dishes',
      quantity: 25,
      category: 'prepared',
      available: true,
      donated_by: 'Alameda Restaurant Alliance'
    },
    {
      id: 'inv_3',
      name: 'Canned Goods & Pantry Items',
      description: 'Non-perishable staples: canned vegetables, beans, pasta, rice, cereal, peanut butter',
      quantity: 80,
      category: 'packaged',
      available: true,
      donated_by: 'Grocery Store Partners'
    },
    {
      id: 'inv_4',
      name: 'Fresh Bakery Items',
      description: 'Day-old bread, pastries, and baked goods from local bakeries still fresh and delicious',
      quantity: 20,
      category: 'bakery',
      available: true,
      donated_by: 'Bay Area Bakeries'
    },
    {
      id: 'inv_5',
      name: 'Dairy & Refrigerated Items',
      description: 'Milk, cheese, yogurt, eggs, and other refrigerated products approaching best-by dates',
      quantity: 35,
      category: 'dairy',
      available: true,
      donated_by: 'Dairy Distributors'
    },
    {
      id: 'inv_6',
      name: 'Baby & Child Nutrition',
      description: 'Formula, baby food, snacks for children, and specialized dietary items for families',
      quantity: 15,
      category: 'baby_food',
      available: true,
      donated_by: 'Family Services Network'
    },
    {
      id: 'inv_7',
      name: 'Emergency Water Supply',
      description: 'Bottled water and emergency hydration supplies for immediate need situations',
      quantity: 100,
      category: 'beverages',
      available: true,
      donated_by: 'Emergency Response Fund'
    },
    {
      id: 'inv_8',
      name: 'Frozen Meals & Proteins',
      description: 'Frozen dinners, meat, fish, and protein sources safely stored and ready for distribution',
      quantity: 40,
      category: 'frozen',
      available: true,
      donated_by: 'Food Processing Partners'
    }
  ];
};

// Distribution center menu handler - register immediately
window.openDistributionCenterMenu = function(centerId) {
  if (!window.StoreMenuComponent) {
    // Create simple modal fallback
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    
    const menuItems = window.getSampleStoreMenu(centerId);
    
    modal.innerHTML = `
      <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div class="p-6 border-b bg-gradient-to-r from-green-50 to-blue-50">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">DoGoods Webster Street Hub</h2>
              <p class="text-green-600 font-medium">Food Inventory - Available Now</p>
            </div>
            <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
              <div class="icon-x text-xl"></div>
            </button>
          </div>
        </div>
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <div class="grid gap-4">
            ${menuItems.map(item => `
              <div class="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-3">
                  <div class="flex-1">
                    <h3 class="font-bold text-lg mb-1 text-gray-900">${item.name}</h3>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-sm text-gray-500 capitalize">${item.category}</span>
                      <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Available Now</span>
                    </div>
                    <div class="text-xs text-blue-600">Donated by: ${item.donated_by}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold text-green-600">${item.quantity}</div>
                    <div class="text-xs text-gray-500">available</div>
                  </div>
                </div>
                <p class="text-gray-600 mb-4 text-sm leading-relaxed">${item.description}</p>
                <div class="flex justify-between items-center">
                  <div class="text-sm text-gray-500">Ready for immediate pickup</div>
                  <button class="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm">
                    Reserve Item
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    return;
  }
  
  // Use React component if available
  if (window.openStoreMenu) {
    window.openStoreMenu(centerId);
  }
};

// Register distribution center menu function immediately
window.viewDistributionCenterMenu = function(centerId) {
  try {
    if (window.openDistributionCenterMenu) {
      window.openDistributionCenterMenu(centerId);
    } else {
      console.error('openDistributionCenterMenu not available, creating fallback');
      // Direct fallback implementation
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
      modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
      
      const menuItems = window.getSampleStoreMenu ? window.getSampleStoreMenu(centerId) : [];
      
      modal.innerHTML = `
        <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
          <div class="p-6 border-b bg-gradient-to-r from-green-50 to-blue-50">
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Distribution Center</h2>
                <p class="text-green-600 font-medium">Available Food Inventory</p>
              </div>
              <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700 p-2">
                <div class="icon-x text-xl"></div>
              </button>
            </div>
          </div>
          <div class="p-6 overflow-y-auto max-h-[60vh]">
            ${menuItems.length > 0 ? menuItems.map(item => `
              <div class="border rounded-xl p-4 mb-4 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h3 class="font-bold text-lg">${item.name}</h3>
                    <p class="text-sm text-blue-600">Donated by: ${item.donated_by}</p>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold text-green-600">${item.quantity}</div>
                    <div class="text-xs text-gray-500">available</div>
                  </div>
                </div>
                <p class="text-gray-600 mb-3">${item.description}</p>
                <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Reserve Item
                </button>
              </div>
            `).join('') : '<p class="text-center text-gray-500">Loading food inventory...</p>'}
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
    }
  } catch (error) {
    console.error('Error opening distribution center menu:', error);
    alert('Unable to load food menu at this time. Please try again.');
  }
};

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  console.log('Starting mock data initialization...');
  window.initializeAllMockData();
  window.ensureMockDataAvailable();
  console.log('Mock data auto-initialization complete');
  console.log('Distribution center menu function registered:', typeof window.viewDistributionCenterMenu);
}
