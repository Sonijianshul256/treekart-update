export type UserRole = 'subscriber' | 'corporate_admin' | 'farm_manager' | 'admin';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  subscriptionId?: string;
  photoURL?: string;
  phoneNumber?: string;
}

export interface Tree {
  id: string;
  farmId?: string;
  type: 'Papaya' | 'Mango';
  location: { lat: number; lng: number };
  status: 'available' | 'rented' | 'retired';
  price: number;
  plantedDate?: string;
  ownerId?: string;
  growthStage: number; // 0 to 100
  health: 'Optimal' | 'Warning' | 'Critical';
  lastPhotoUrl?: string;
  lastMoisture?: number;
  qrCode?: string;
}

export interface Subscription {
  id: string;
  userId?: string;
  userIds?: string[];
  treeId: string;
  type: 'individual' | 'shared' | 'b2b';
  startDate: string;
  endDate?: string;
  amount?: number;
  coOwnerEmail?: string;
  paymentStatus?: 'pending' | 'paid';
}

export interface TreeUpdate {
  id: string;
  treeId: string;
  photoURL: string;
  timestamp: string;
  location: { lat: number; lng: number };
  soilMoisture: number;
}

export interface Farm {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  boundary: {
    type: string;
    coordinates: number[][][];
  } | { lat: number, lng: number }[];
}

export interface Delivery {
  id: string;
  subscriptionId: string;
  status: 'pending' | 'shipped' | 'delivered';
  driverName: string;
  driverPhone: string;
  location: { lat: number; lng: number };
  eta: string;
  updatedAt: string;
}

export interface FarmLog {
  id: string;
  treeId: string;
  photoUrl: string;
  soilMoisture: number;
  activity: string;
  timestamp: string;
  location: { lat: number; lng: number };
  managerId: string;
  blockchainHash: string;
}
