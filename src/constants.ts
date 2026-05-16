import { Tree, Farm, User, Subscription, Delivery, FarmLog } from './types';

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
    type: 'Papaya',
    location: { lat: 26.652, lng: 74.852 },
    status: 'rented',
    growthStage: 75,
    lastPhotoUrl: 'https://images.unsplash.com/photo-1595155607063-4903f5636034?q=80&w=400&auto=format&fit=crop',
    lastMoisture: 42,
    qrCode: 'TK-P-101',
    price: 1500,
    health: 'Optimal'
  },
  {
    id: 'tree_102',
    farmId: 'farm_1',
    type: 'Mango',
    location: { lat: 26.648, lng: 74.848 },
    status: 'available',
    growthStage: 30,
    qrCode: 'TK-M-102',
    price: 2500,
    health: 'Optimal'
  },
  {
    id: 'tree_103',
    farmId: 'farm_1',
    type: 'Mango',
    location: { lat: 26.655, lng: 74.855 },
    status: 'rented',
    growthStage: 90,
    lastPhotoUrl: 'https://images.unsplash.com/photo-1591073113125-e46713c829ed?q=80&w=400&auto=format&fit=crop',
    lastMoisture: 38,
    qrCode: 'TK-M-103',
    price: 3000,
    health: 'Optimal'
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

export const DUMMY_LOGS: FarmLog[] = [
  {
    id: 'log_1',
    treeId: 'tree_101',
    photoUrl: 'https://images.unsplash.com/photo-1595155607063-4903f5636034?q=80&w=400&auto=format&fit=crop',
    soilMoisture: 42.8,
    activity: 'Automated Drip Irrigation',
    timestamp: '2025-05-16T06:00:00Z',
    location: { lat: 26.652, lng: 74.852 },
    managerId: 'mgr_01',
    blockchainHash: '0x71C765609ab884C1644BA5e066ED1C13'
  },
  {
    id: 'log_2',
    treeId: 'tree_101',
    photoUrl: 'https://images.unsplash.com/photo-1595155607063-4903f5636034?q=80&w=400&auto=format&fit=crop',
    soilMoisture: 38.5,
    activity: 'Organic Nutrients Application',
    timestamp: '2025-05-15T16:30:00Z',
    location: { lat: 26.652, lng: 74.852 },
    managerId: 'mgr_01',
    blockchainHash: '0x3b7E884C1644BA5e066ED1C1371C76560'
  },
  {
    id: 'log_3',
    treeId: 'tree_101',
    photoUrl: 'https://images.unsplash.com/photo-1595155607063-4903f5636034?q=80&w=400&auto=format&fit=crop',
    soilMoisture: 45.2,
    activity: 'Pruning & Health Check',
    timestamp: '2025-05-14T09:15:00Z',
    location: { lat: 26.652, lng: 74.852 },
    managerId: 'mgr_01',
    blockchainHash: '0xED1C1371C765603b7E884C1644BA5e066'
  }
];
