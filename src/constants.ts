import { Tree, Farm, User, Subscription, Delivery } from './types';

export const DUMMY_FARM: Farm = {
  id: 'farm_1',
  name: 'Rajasthan Organic Oasis',
  location: { lat: 26.65, lng: 74.85 },
  boundary: {
    type: 'Polygon',
    coordinates: [[
      [74.84, 26.64],
      [74.86, 26.64],
      [74.86, 26.66],
      [74.84, 26.66],
      [74.84, 26.64]
    ]]
  }
};

export const DUMMY_TREES: Tree[] = [
  {
    id: 'tree_101',
    farmId: 'farm_1',
    type: 'papaya',
    location: { lat: 26.652, lng: 74.852 },
    status: 'rented',
    growthStage: 75,
    lastPhotoUrl: 'https://images.unsplash.com/photo-1595155607063-4903f5636034?q=80&w=400&auto=format&fit=crop',
    lastMoisture: 42,
    qrCode: 'TK-P-101'
  },
  {
    id: 'tree_102',
    farmId: 'farm_1',
    type: 'mango',
    location: { lat: 26.648, lng: 74.848 },
    status: 'available',
    growthStage: 30,
    qrCode: 'TK-M-102'
  },
  {
    id: 'tree_103',
    farmId: 'farm_1',
    type: 'mango',
    location: { lat: 26.655, lng: 74.855 },
    status: 'rented',
    growthStage: 90,
    lastPhotoUrl: 'https://images.unsplash.com/photo-1591073113125-e46713c829ed?q=80&w=400&auto=format&fit=crop',
    lastMoisture: 38,
    qrCode: 'TK-M-103'
  }
];

export const DUMMY_USER: User = {
  uid: 'user_777',
  email: 'subscriber@example.com',
  name: 'Anshul Soni',
  role: 'subscriber',
  phoneNumber: '+91 9999999999'
};

export const DUMMY_SUB: Subscription = {
  id: 'sub_456',
  treeId: 'tree_101',
  userIds: ['user_777'],
  type: 'individual',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  paymentStatus: 'paid'
};

export const DUMMY_DELIVERY: Delivery = {
  id: 'del_888',
  subscriptionId: 'sub_456',
  status: 'shipped',
  driverName: 'Rajesh Kumar',
  driverPhone: '+91 8888777766',
  location: { lat: 26.70, lng: 74.90 },
  eta: '45 mins',
  updatedAt: new Date().toISOString()
};
