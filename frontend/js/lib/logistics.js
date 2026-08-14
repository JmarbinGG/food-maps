// Comprehensive Logistics Data for Dispatch Center
window.initializeLogisticsData = function() {
  const distributionCenters = [
    {
      id: 'dc-001',
      name: 'Central Food Hub',
      type: 'distribution_center',
      address: '123 Main St, San Francisco, CA',
      coordinates: [-122.4194, 37.7749],
      currentStock: 850,
      capacity: 1000,
      pendingPickups: 12,
      operatingHours: '6:00 AM - 10:00 PM',
      manager: 'Sarah Johnson'
    },
    {
      id: 'dc-002',
      name: 'North Bay Distribution',
      type: 'distribution_center',
      address: '456 Oak Ave, Oakland, CA',
      coordinates: [-122.2711, 37.8044],
      currentStock: 670,
      capacity: 800,
      pendingPickups: 8,
      operatingHours: '7:00 AM - 9:00 PM',
      manager: 'Mike Chen'
    },
    {
      id: 'dc-003',
      name: 'South Bay Hub',
      type: 'distribution_center',
      address: '789 Pine Rd, San Jose, CA',
      coordinates: [-121.8863, 37.3382],
      currentStock: 920,
      capacity: 1200,
      pendingPickups: 15,
      operatingHours: '5:00 AM - 11:00 PM',
      manager: 'Lisa Rodriguez'
    }
  ];

  const dropPoints = [
    {
      id: 'dp-001',
      name: 'Tenderloin Food Bank',
      type: 'drop_point',
      address: '101 Ellis St, San Francisco, CA',
      coordinates: [-122.4133, 37.7849],
      urgency: 'critical',
      familiesServed: 45,
      requestedItems: ['Water', 'Canned Goods', 'Fresh Produce'],
      pendingDeliveries: 3,
      lastDelivery: '2 hours ago'
    },
    {
      id: 'dp-002',
      name: 'Mission District Center',
      type: 'drop_point',
      address: '234 Mission St, San Francisco, CA',
      coordinates: [-122.4194, 37.7599],
      urgency: 'high',
      familiesServed: 38,
      requestedItems: ['Baby Food', 'Dairy Products'],
      pendingDeliveries: 2,
      lastDelivery: '45 minutes ago'
    },
    {
      id: 'dp-003',
      name: 'Richmond Community Kitchen',
      type: 'drop_point',
      address: '567 Geary Blvd, San Francisco, CA',
      coordinates: [-122.4647, 37.7749],
      urgency: 'medium',
      familiesServed: 62,
      requestedItems: ['Prepared Meals', 'Bread'],
      pendingDeliveries: 1,
      lastDelivery: '1 hour ago'
    },
    {
      id: 'dp-004',
      name: 'Sunset Food Pantry',
      type: 'drop_point',
      address: '890 Sunset Blvd, San Francisco, CA',
      coordinates: [-122.4686, 37.7431],
      urgency: 'critical',
      familiesServed: 29,
      requestedItems: ['Water', 'Medical Nutrition'],
      pendingDeliveries: 4,
      lastDelivery: '3 hours ago'
    }
  ];

  const drivers = [
    {
      id: 'drv-001',
      name: 'Alex Martinez',
      status: 'active',
      vehicle: 'Cargo Van #CV-101',
      coordinates: [-122.4094, 37.7849],
      currentRoute: 'Route SF-North-01',
      vehicleCapacity: '2,500 lbs',
      deliveriesCompleted: 8,
      hoursWorked: 6.5,
      phone: '(555) 123-4567',
      emergencyContact: '(555) 987-6543'
    },
    {
      id: 'drv-002',
      name: 'Emma Thompson',
      status: 'active',
      vehicle: 'Refrigerated Truck #RT-205',
      coordinates: [-122.2711, 37.8044],
      currentRoute: 'Route OAK-East-02',
      vehicleCapacity: '5,000 lbs',
      deliveriesCompleted: 12,
      hoursWorked: 7.2,
      phone: '(555) 234-5678',
      emergencyContact: '(555) 876-5432'
    },
    {
      id: 'drv-003',
      name: 'Carlos Rodriguez',
      status: 'available',
      vehicle: 'Box Truck #BT-308',
      coordinates: [-122.4194, 37.7749],
      currentRoute: null,
      vehicleCapacity: '3,000 lbs',
      deliveriesCompleted: 6,
      hoursWorked: 4.8,
      phone: '(555) 345-6789',
      emergencyContact: '(555) 765-4321'
    },
    {
      id: 'drv-004',
      name: 'Jessica Wang',
      status: 'active',
      vehicle: 'Cargo Van #CV-412',
      coordinates: [-121.8863, 37.3382],
      currentRoute: 'Route SJ-South-03',
      vehicleCapacity: '2,200 lbs',
      deliveriesCompleted: 9,
      hoursWorked: 5.7,
      phone: '(555) 456-7890',
      emergencyContact: '(555) 654-3210'
    },
    {
      id: 'drv-005',
      name: 'David Kim',
      status: 'available',
      vehicle: 'Pickup Truck #PT-515',
      coordinates: [-122.4647, 37.7749],
      currentRoute: null,
      vehicleCapacity: '1,500 lbs',
      deliveriesCompleted: 4,
      hoursWorked: 3.2,
      phone: '(555) 567-8901',
      emergencyContact: '(555) 543-2109'
    },
    {
      id: 'drv-006',
      name: 'Maria Santos',
      status: 'offline',
      vehicle: 'Electric Van #EV-618',
      coordinates: [-122.4386, 37.7595],
      currentRoute: null,
      vehicleCapacity: '2,800 lbs',
      deliveriesCompleted: 0,
      hoursWorked: 0,
      phone: '(555) 678-9012',
      emergencyContact: '(555) 432-1098'
    }
  ];

  const routes = [
    {
      id: 'route-001',
      driverId: 'drv-001',
      driverName: 'Alex Martinez',
      status: 'In Progress',
      priority: 'high',
      progress: 65,
      estimatedTime: '45 mins',
      totalDistance: '12.3 km',
      stops: [
        { type: 'pickup', location: 'Central Food Hub', completed: true },
        { type: 'delivery', location: 'Tenderloin Food Bank', completed: false },
        { type: 'delivery', location: 'Mission District Center', completed: false }
      ]
    },
    {
      id: 'route-002',
      driverId: 'drv-002',
      driverName: 'Emma Thompson',
      status: 'In Progress',
      priority: 'critical',
      progress: 80,
      estimatedTime: '20 mins',
      totalDistance: '8.7 km',
      stops: [
        { type: 'pickup', location: 'North Bay Distribution', completed: true },
        { type: 'delivery', location: 'Sunset Food Pantry', completed: true },
        { type: 'delivery', location: 'Richmond Community Kitchen', completed: false }
      ]
    },
    {
      id: 'route-003',
      driverId: 'drv-004',
      driverName: 'Jessica Wang',
      status: 'In Progress',
      priority: 'medium',
      progress: 30,
      estimatedTime: '1h 15m',
      totalDistance: '15.9 km',
      stops: [
        { type: 'pickup', location: 'South Bay Hub', completed: true },
        { type: 'delivery', location: 'Community Center A', completed: false },
        { type: 'delivery', location: 'Senior Center B', completed: false }
      ]
    }
  ];

  return {
    stores: [...distributionCenters, ...dropPoints],
    drivers,
    routes,
    systemStats: {
      totalDeliveriesToday: 47,
      avgDeliveryTime: 23,
      fuelEfficiency: 92,
      customerSatisfaction: 98
    }
  };
};
