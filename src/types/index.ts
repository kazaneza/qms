export type CustomerStatus = 'waiting' | 'serving' | 'completed' | 'cancelled';
export type ServiceType = 'international-transfer' | 'domestic-transfer' | 'forex' | 'account-services';
export type FeedbackCategory = 'service-quality' | 'wait-time' | 'staff-behavior' | 'environment' | 'other';

export interface Feedback {
  id: string;
  category: FeedbackCategory;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  tokenNumber: number;
  serviceType: ServiceType;
  status: CustomerStatus;
  checkInTime: Date;
  estimatedWaitTime: number; // in minutes
  startServiceTime?: Date;
  endServiceTime?: Date;
  tellerId?: string;
}

export interface Teller {
  id: string;
  name: string;
  status: 'available' | 'serving' | 'break';
  currentCustomerId?: string;
  serviceTypes: ServiceType[];
  customersServed: number;
}

export interface QueueStats {
  totalCustomers: number;
  waitingCustomers: number;
  avgWaitTime: number;
  avgServiceTime: number;
}