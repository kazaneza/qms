import { Customer, CustomerStatus, QueueStats, ServiceType, Teller } from "../types";

// Generate a unique token number (incremental for the day)
export const generateTokenNumber = (customers: Customer[]): number => {
  const today = new Date().toDateString();
  const todaysCustomers = customers.filter(
    (customer) => new Date(customer.checkInTime).toDateString() === today
  );
  return todaysCustomers.length > 0 
    ? Math.max(...todaysCustomers.map(c => c.tokenNumber)) + 1 
    : 1;
};

// Estimate wait time based on queue length and average service time
export const estimateWaitTime = (
  customers: Customer[], 
  serviceType: ServiceType,
  tellers: Teller[]
): number => {
  // Filter active tellers that can serve this service type
  const availableTellers = tellers.filter(
    t => t.serviceTypes.includes(serviceType) && t.status !== 'break'
  );
  
  if (availableTellers.length === 0) return 30; // Default 30 min if no tellers
  
  // Count customers waiting for same service
  const customersAhead = customers.filter(
    c => c.serviceType === serviceType && c.status === 'waiting'
  ).length;
  
  // Average service time (minutes) for international transfers
  const avgServiceTime = serviceType === 'international-transfer' ? 15 : 10;
  
  // Calculate wait time based on customers ahead and available tellers
  return Math.ceil((customersAhead * avgServiceTime) / availableTellers.length);
};

// Calculate queue statistics
export const calculateQueueStats = (customers: Customer[]): QueueStats => {
  const today = new Date().toDateString();
  const todaysCustomers = customers.filter(
    (customer) => new Date(customer.checkInTime).toDateString() === today
  );
  
  const waitingCustomers = todaysCustomers.filter(c => c.status === 'waiting').length;
  
  // Calculate average service time for completed customers
  const completedCustomers = todaysCustomers.filter(c => c.status === 'completed' && c.startServiceTime && c.endServiceTime);
  
  const totalServiceTime = completedCustomers.reduce((total, customer) => {
    const serviceTime = customer.endServiceTime && customer.startServiceTime 
      ? (new Date(customer.endServiceTime).getTime() - new Date(customer.startServiceTime).getTime()) / (1000 * 60)
      : 0;
    return total + serviceTime;
  }, 0);
  
  // Calculate average wait time for served customers
  const servedCustomers = todaysCustomers.filter(c => (c.status === 'serving' || c.status === 'completed') && c.startServiceTime);
  
  const totalWaitTime = servedCustomers.reduce((total, customer) => {
    const waitTime = customer.startServiceTime 
      ? (new Date(customer.startServiceTime).getTime() - new Date(customer.checkInTime).getTime()) / (1000 * 60)
      : 0;
    return total + waitTime;
  }, 0);
  
  return {
    totalCustomers: todaysCustomers.length,
    waitingCustomers,
    avgWaitTime: servedCustomers.length > 0 ? Math.round(totalWaitTime / servedCustomers.length) : 0,
    avgServiceTime: completedCustomers.length > 0 ? Math.round(totalServiceTime / completedCustomers.length) : 0
  };
};

// Get next customer in queue for a specific teller
export const getNextCustomer = (customers: Customer[], teller: Teller): Customer | null => {
  const waitingCustomers = customers
    .filter(c => 
      c.status === 'waiting' && 
      teller.serviceTypes.includes(c.serviceType)
    )
    .sort((a, b) => a.tokenNumber - b.tokenNumber);
  
  return waitingCustomers.length > 0 ? waitingCustomers[0] : null;
};

// Format time for display
export const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Format duration in minutes to display
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};