import axios from 'axios';
import type { Customer, Feedback, FeedbackCategory } from '../types';

const API_URL = 'http://localhost:8700';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await api.get('/customers/');
    // Transform the response data to match our Customer type
    return response.data.map((customer: any) => ({
      id: customer.id,
      name: customer.name,
      phoneNumber: customer.phone_number,
      tokenNumber: customer.token_number,
      serviceType: customer.service_type,
      status: customer.status,
      checkInTime: new Date(customer.check_in_time),
      estimatedWaitTime: customer.estimated_wait_time,
      startServiceTime: customer.start_service_time ? new Date(customer.start_service_time) : undefined,
      endServiceTime: customer.end_service_time ? new Date(customer.end_service_time) : undefined,
      tellerId: customer.teller_id
    }));
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return [];
  }
};

export const createCustomer = async (data: {
  name: string;
  phoneNumber: string;
  serviceType: string;
}): Promise<Customer> => {
  try {
    const response = await api.post('/customers/', {
      name: data.name,
      phone_number: data.phoneNumber,
      service_type: data.serviceType,
    });
    
    // Transform the response to match our Customer type
    return {
      id: response.data.id,
      name: response.data.name,
      phoneNumber: response.data.phone_number,
      tokenNumber: response.data.token_number,
      serviceType: response.data.service_type,
      status: response.data.status,
      checkInTime: new Date(response.data.check_in_time),
      estimatedWaitTime: response.data.estimated_wait_time,
      startServiceTime: response.data.start_service_time ? new Date(response.data.start_service_time) : undefined,
      endServiceTime: response.data.end_service_time ? new Date(response.data.end_service_time) : undefined,
      tellerId: response.data.teller_id
    };
  } catch (error) {
    console.error('Failed to create customer:', error);
    throw error;
  }
};

export const updateCustomerStatus = async (customerId: string, status: string, tellerId?: string): Promise<void> => {
  try {
    await api.put(`/customers/${customerId}/status`, {
      status,
      teller_id: tellerId
    });
  } catch (error) {
    console.error('Failed to update customer status:', error);
    throw error;
  }
};

export const getFeedback = async (): Promise<Feedback[]> => {
  try {
    const response = await api.get('/feedback/');
    // Transform the response data to match our Feedback type
    return response.data.map((feedback: any) => ({
      id: feedback.id,
      category: feedback.category,
      rating: feedback.rating,
      comment: feedback.comment,
      createdAt: new Date(feedback.created_at)
    }));
  } catch (error) {
    console.error('Failed to fetch feedback:', error);
    return [];
  }
};

export const createFeedback = async (data: {
  category: FeedbackCategory;
  rating: number;
  comment: string;
}): Promise<Feedback> => {
  const response = await api.post('/feedback/', {
    category: data.category,
    rating: data.rating,
    comment: data.comment,
  });
  
  // Transform the response to match our Feedback type
  return {
    id: response.data.id,
    category: response.data.category,
    rating: response.data.rating,
    comment: response.data.comment,
    createdAt: new Date(response.data.created_at)
  };
};