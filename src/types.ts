export type UserRole = 'subscriber' | 'corporate_admin' | 'farm_manager' | 'admin';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phoneNumber?: string;
  companyId?: string;
}

export interface Tree {
  id: string;
  farmId: string;
  type: 'papaya' | 'mango';
  location: { lat: number; lng: number };
  status: 'available' | 'rented' | 'harvesting';
  growthStage: number; // 0-100
  lastPhotoUrl?: string;
  lastMoisture?: number;
  qrCode: string;
}

export interface Subscription {
  id: string;
  treeId: string;
  userIds: string[];
  type: 'individual' | 'shared' | 'corporate';
  startDate: string;
  endDate: string;
  paymentStatus: 'pending' | 'paid' | 'expired';
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
  blockchainHash?: string;
}

export interface Delivery {
  id: string;
  subscriptionId: string;
  status: 'picked' | 'packed' | 'shipped' | 'delivered';
  driverName: string;
  driverPhone: string;
  location: { lat: number; lng: number };
  eta: string;
  updatedAt: string;
}

export interface Farm {
  id: string;
  name: string;
  boundary: any; // GeoJSON
  location: { lat: number; lng: number };
}
