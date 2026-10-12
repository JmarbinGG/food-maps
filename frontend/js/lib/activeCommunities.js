/**
 * Published Active Communities catalog, matching dogoods.store.
 * Photos, contacts, hours, and impact numbers come from the DoGoods directory.
 */
(function (global) {
  'use strict';

  var communities = [
    {
      id: 1,
      name: 'Do Good Warehouse',
      location: '1900 Thau Way, Alameda, CA 94501',
      contact: 'Chris Tam',
      hours: 'Monday-Friday 9am - 3pm',
      phone: '510-522-6288',
      image: 'https://github.com/Aslanmatejka/my-public-assets/blob/main/allgoodliving.jpg?raw=true',
      food_given_lb: 102,
      families_helped: 44,
      school_staff_helped: 97
    },
    {
      id: 2,
      name: 'Ruby Bridges Elementary CC',
      location: '351 Jack London Ave, Alameda, CA 94501',
      contact: 'Renata Westbrook',
      hours: 'Monday - Friday 8:00 am - 4:00 pm',
      phone: '510-748-4006',
      image: 'https://github.com/Aslanmatejka/my-public-assets/blob/main/Ruby.jpg?raw=true',
      food_given_lb: 4339,
      families_helped: 1001,
      school_staff_helped: 0
    },
    {
      id: 3,
      name: 'NEA/ACLC CC',
      location: '1900 3rd St, Alameda, CA 94501',
      contact: 'Gabby Gutierrez',
      hours: 'Monday - Friday 8:00 am - 4:00 pm',
      phone: '510-748-4008',
      image: 'https://github.com/Aslanmatejka/my-public-assets/blob/main/ACLC.jpg?raw=true',
      food_given_lb: 5182,
      families_helped: 795,
      school_staff_helped: 65
    },
    {
      id: 4,
      name: 'Academy of Alameda CC',
      location: '401 Pacific Avenue Alameda, CA 94501',
      contact: 'Suzy Valencia',
      hours: 'Monday - Friday 8:00 am - 4:00 pm',
      phone: '510-748-4017',
      image: 'https://github.com/Aslanmatejka/my-public-assets/blob/main/the%20academy.jpg?raw=true',
      food_given_lb: 5093,
      families_helped: 1030,
      school_staff_helped: 120
    },
    {
      id: 5,
      name: 'Island HS CC',
      location: '500 Pacific Avenue Alameda, CA 94501',
      contact: 'Marina ZEPEDA',
      hours: 'Monday - Friday 8:00 am - 4:00 pm',
      phone: '510-748-4024',
      image: 'https://github.com/Aslanmatejka/my-public-assets/blob/main/island.jpg?raw=true',
      food_given_lb: 4503,
      families_helped: 292,
      school_staff_helped: 0
    },
    {
      id: 6,
      name: 'Encinal Jr Sr High School',
      location: '210 Central Avenue Alameda, CA 94501',
      contact: 'Nurse Frances',
      hours: 'Monday - Friday 8:00 am - 4:00 pm',
      phone: '510-748-4023',
      image: 'https://github.com/Aslanmatejka/my-public-assets/blob/main/jets.jpg?raw=true',
      food_given_lb: 4308,
      families_helped: 396,
      school_staff_helped: 51
    },
    {
      id: 7,
      name: 'Madison Park Academy Primary',
      location: '470 El Paseo Drive Oakland, CA 94603',
      contact: 'Khánh Hữu Nguyên',
      hours: 'Monday - Friday 8:00 am - 4:00 pm',
      phone: '(510) 879-8164',
      image: 'https://github.com/Aslanmatejka/my-public-assets/blob/main/MADISON_PARK_PRIMARY.png?raw=true',
      food_given_lb: 512,
      families_helped: 0,
      school_staff_helped: 0
    },
    {
      id: 8,
      name: 'Alameda Unified School District',
      location: '2060 Challenger Dr Alameda, CA94501',
      contact: 'Jodi McCarthy',
      hours: 'Monday - Friday 8:00 am - 4:00 pm',
      phone: '',
      image: 'https://github.com/Aslanmatejka/my-public-assets/blob/main/AUSD.png?raw=true',
      food_given_lb: 0,
      families_helped: 0,
      school_staff_helped: 0
    },
    {
      id: 9,
      name: 'Markham Elementary',
      location: '7220 Krause Avenue, Oakland, CA 94605',
      contact: 'Thomas Lee',
      hours: 'Monday - Friday 8:00 am - 4:00 pm',
      phone: '(510) 879-2138',
      image: 'https://github.com/Aslanmatejka/my-public-assets/blob/main/MARKHAM.png?raw=true',
      food_given_lb: 5023,
      families_helped: 764,
      school_staff_helped: 0
    },
    {
      id: 10,
      name: 'Madison Park Academy',
      location: '400 Capistrano Drive, Oakland, CA 94603',
      contact: 'Bunthorn Oeur',
      hours: 'Monday - Friday 8:00 am - 4:00 pm',
      phone: '(510) 879-2315',
      image: 'https://github.com/Aslanmatejka/my-public-assets/blob/main/MADISON_PARK_ACADEMY.png?raw=true',
      food_given_lb: 6038,
      families_helped: 1630,
      school_staff_helped: 0
    },
    {
      id: 11,
      name: 'McClymonds High School',
      location: '2607 Myrtle Street, Oakland, CA 94607',
      contact: 'Brian McGhee',
      hours: 'Monday - Friday 8:00 am - 4:00 pm',
      phone: '(510) 879-2303',
      image: 'https://github.com/Aslanmatejka/my-public-assets/blob/main/MCCLYMONDS.png?raw=true',
      food_given_lb: 5305,
      families_helped: 721,
      school_staff_helped: 278
    },
    {
      id: 12,
      name: 'Hillside Elementary School',
      location: '15980 Marcella St, San Leandro, CA 94578',
      contact: 'Cristina Jaramillo',
      hours: 'Monday - Friday 8:00 am - 4:00 pm',
      phone: '(510) 317-5311',
      image: 'https://github.com/Aslanmatejka/my-public-assets/blob/main/HILLSIDE.png?raw=true',
      food_given_lb: 627,
      families_helped: 0,
      school_staff_helped: 0
    },
    {
      id: 13,
      name: 'Edendale Middle School',
      location: '16160 Ashland Ave, San Lorenzo, CA 94580',
      contact: 'Cynthia Cajina',
      hours: 'Monday - Friday 8:00 am - 4:00 pm',
      phone: '(510) 317-5100',
      image: 'https://github.com/Aslanmatejka/my-public-assets/blob/main/EDENDALE.png?raw=true',
      food_given_lb: 593,
      families_helped: 100,
      school_staff_helped: 0
    },
    {
      id: 14,
      name: 'San Lorenzo High School',
      location: '50 E Lewelling Blvd, San Lorenzo, CA 94580',
      contact: 'David Houpert',
      hours: 'Monday - Friday 8:00 am - 4:00 pm',
      phone: '(510) 317-3000',
      image: 'https://github.com/Aslanmatejka/my-public-assets/blob/main/SAN_LORENZO_HS.png?raw=true',
      food_given_lb: 247,
      families_helped: 24,
      school_staff_helped: 0
    },
    {
      id: 15,
      name: 'Garfield Elementary',
      location: '1640 22nd Avenue, Oakland, CA 94606',
      contact: 'Contact TBD',
      hours: 'Monday - Friday 8:00 am - 4:00 pm',
      phone: '(510) 879-2118',
      image: 'https://github.com/Aslanmatejka/my-public-assets/blob/main/GARFIELD.png?raw=true',
      food_given_lb: 2286,
      families_helped: 281,
      school_staff_helped: 0
    },
    {
      id: 16,
      name: 'Lodestar Charter School',
      location: '701 105th Avenue, Oakland, CA 94603',
      contact: 'Sabunmi Woods',
      hours: '',
      phone: '(510) 775-0382',
      image: 'https://github.com/Aslanmatejka/my-public-assets/blob/main/LODESTAR.png?raw=true',
      food_given_lb: 1559,
      families_helped: 225,
      school_staff_helped: 0
    },
    {
      id: 17,
      name: 'Horace Mann Elementary',
      location: '5222 Ygnacio Avenue, Oakland, CA 94601',
      contact: 'Ivonne Gama Nunez',
      hours: '',
      phone: '(510) 879-2136',
      image: 'https://github.com/Aslanmatejka/my-public-assets/blob/main/HORACE_MANN.png?raw=true',
      food_given_lb: 3029,
      families_helped: 123,
      school_staff_helped: 0
    },
    {
      id: 23,
      name: 'Youth Spirit Art Works',
      location: '633 Hegenberger Road, Oakland, CA 94621',
      contact: 'Alex',
      hours: 'Mon-Fri 9am-4pm',
      phone: '(341) 732-9347',
      image: 'https://lh3.googleusercontent.com/d/1gzwEG1VLaRdT95EbGOGokvCxMlNnDrr9',
      food_given_lb: 4148,
      families_helped: 515,
      school_staff_helped: 0
    },
    {
      id: 24,
      name: 'Trybe Oakland',
      location: '1701 E 19th St, Oakland, CA 94606',
      contact: 'Lisa',
      hours: 'Tuesday - Friday 9 AM - 5PM',
      phone: '(510) 985-9915',
      image: '/assets/logos/trybe-logo.svg',
      image_fit: 'contain',
      food_given_lb: 0,
      families_helped: 0,
      school_staff_helped: 0
    },
    {
      id: 25,
      name: 'MetWest High School',
      location: '314 E 10th St, Oakland, CA 94606',
      contact: 'Carinne Salnave',
      hours: '',
      phone: '(510) 879-2338',
      image: 'https://resources.finalsite.net/images/f_auto,q_auto/v1762295980/ousdorg/ousdorg/yudcimijzwaehjxikib2/MetWestLogo.png',
      image_fit: 'contain',
      food_given_lb: 1409,
      families_helped: 36,
      school_staff_helped: 0
    }
  ];

  var locations = {
    alameda: [
      'Do Good Warehouse',
      'Encinal Jr Sr High School',
      'Island HS CC',
      'NEA/ACLC CC',
      'Academy of Alameda CC',
      'Ruby Bridges Elementary CC',
      'Alameda Unified School District'
    ],
    oakland: [
      'McClymonds High School',
      'Markham Elementary',
      'Madison Park Academy',
      'Madison Park Academy Primary',
      'Garfield Elementary',
      'Lodestar Charter School',
      'Horace Mann Elementary',
      'MetWest High School',
      'Trybe Oakland',
      'Youth Spirit Art Works'
    ],
    'san-lorenzo': [
      'Hillside Elementary School',
      'Edendale Middle School',
      'San Lorenzo High School'
    ]
  };

  function byLocation(key) {
    if (!key || key === 'all') return communities.slice();
    var names = locations[key] || [];
    return communities.filter(function (community) {
      return names.indexOf(community.name) !== -1;
    });
  }

  function byId(id) {
    var wanted = String(id);
    for (var i = 0; i < communities.length; i += 1) {
      if (String(communities[i].id) === wanted) return communities[i];
    }
    return null;
  }

  global.DoGoodActiveCommunities = {
    communities: communities,
    locations: locations,
    byLocation: byLocation,
    byId: byId
  };
})(window);
