// src/context/QueueContext.tsx - Fixed with temporary solution for date handling

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Customer, CustomerStatus, ServiceType, Teller, QueueStats } from '../types';
import { 
  generateTokenNumber, 
  estimateWaitTime, 
  calculateQueueStats, 
  getNextCustomer,
  isToday 
} from '../utils/queueUtils';
import { getCustomers, updateCustomerStatus as updateCustomerStatusApi } from '../api';

interface QueueContextType {
  customers: Customer[];
  tellers: Teller[];
  queueStats: QueueStats;
  addCustomer: (name: string, phoneNumber: string, serviceType: ServiceType) => Customer;
  updateCustomerStatus: (customerId: string, status: CustomerStatus) => void;
  assignCustomerToTeller: (tellerId: string) => void;
  completeCustomerService: (tellerId: string) => void;
  updateTellerStatus: (tellerId: string, status: 'available' | 'serving' | 'break') => void;
  getCustomersByStatus: (status: CustomerStatus) => Customer[];
  getTellerById: (tellerId: string) => Teller | undefined;
  getCustomerById: (customerId: string) => Customer | undefined;
  refreshCustomers: () => Promise<void>;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};

interface QueueProviderProps {
  children: ReactNode;
}

export const QueueProvider: React.FC<QueueProviderProps> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tellers, setTellers] = useState<Teller[]>([
    {
      id: '1',
      name: 'Jean Bosco',
      status: 'available',
      customersServed: 0,
      serviceTypes: ['international-transfer', 'forex']
    },
    {
      id: '2',
      name: 'Marie Claire',
      status: 'available',
      customersServed: 0,
      serviceTypes: ['international-transfer', 'domestic-transfer']
    },
    {
      id: '3',
      name: 'Emmanuel',
      status: 'available',
      customersServed: 0,
      serviceTypes: ['domestic-transfer', 'account-services']
    }
  ]);
  const [queueStats, setQueueStats] = useState<QueueStats>({
    totalCustomers: 0,
    waitingCustomers: 0,
    avgWaitTime: 0,
    avgServiceTime: 0
  });

  // TEMPORARY FIX: Flag to bypass date filtering when no customers match today's date
  const [bypassDateFilter, setBypassDateFilter] = useState(false);

  const refreshCustomers = async () => {
    try {
      const fetchedCustomers = await getCustomers();
      console.log("Fetched customers:", fetchedCustomers);
      console.log("Number of customers:", fetchedCustomers.length);
      
      // Debug date handling for all customers
      if (fetchedCustomers.length > 0) {
        console.log("Date checks for customers:");
        fetchedCustomers.forEach((customer, index) => {
          console.log(`Customer ${index + 1} (${customer.name}) date checks:`);
          console.log(`  Original checkInTime:`, customer.checkInTime);
          console.log(`  Parsed as:`, new Date(customer.checkInTime));
          console.log(`  Is today:`, isToday(customer.checkInTime));
          console.log(`  Status:`, customer.status);
        });
      }
      
      // Debug: Check today's customers
      const todaysCustomers = fetchedCustomers.filter(c => isToday(c.checkInTime));
      console.log("Today's customers:", todaysCustomers);
      
      // Debug: Check customers by status
      console.log("Waiting customers:", fetchedCustomers.filter(c => c.status === 'waiting' && isToday(c.checkInTime)));
      console.log("Serving customers:", fetchedCustomers.filter(c => c.status === 'serving' && isToday(c.checkInTime)));
      
      // TEMPORARY SOLUTION: If no customers are recognized as "today's" customers,
      // but there are customers in the database, bypass the date filter
      if (todaysCustomers.length === 0 && fetchedCustomers.length > 0) {
        console.log("NOTICE: No customers detected for today. Bypassing date filter (temporary fix)");
        setBypassDateFilter(true);
        
        // Log date comparison details
        const today = new Date();
        console.log("Today's date:", today);
        console.log("Today's components:", {
          year: today.getFullYear(),
          month: today.getMonth(),
          day: today.getDate()
        });
      } else {
        setBypassDateFilter(false);
      }
      
      setCustomers(fetchedCustomers);
      
      // Update teller status based on serving customers
      setTellers(prev => prev.map(teller => {
        const servingCustomer = fetchedCustomers.find(
          c => c.tellerId === teller.id && c.status === 'serving'
        );
        return {
          ...teller,
          status: servingCustomer ? 'serving' : teller.status === 'break' ? 'break' : 'available',
          currentCustomerId: servingCustomer?.id
        };
      }));
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  // Load initial customers and set up refresh interval
  useEffect(() => {
    refreshCustomers();
    
    // Refresh customers every 30 seconds
    const interval = setInterval(refreshCustomers, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update queue stats whenever customers or tellers change
  useEffect(() => {
    if (bypassDateFilter) {
      // Use all customers for stats calculation if date filter is bypassed
      const allStats: QueueStats = {
        totalCustomers: customers.length,
        waitingCustomers: customers.filter(c => c.status === 'waiting').length,
        avgWaitTime: calculateAvgTime(customers, 'wait'),
        avgServiceTime: calculateAvgTime(customers, 'service')
      };
      setQueueStats(allStats);
    } else {
      // Use normal stats calculation
      setQueueStats(calculateQueueStats(customers));
    }
  }, [customers, bypassDateFilter]);
  
  // Helper function to calculate average times for the temporary solution
  const calculateAvgTime = (customers: Customer[], timeType: 'wait' | 'service'): number => {
    let relevantCustomers: Customer[] = [];
    let totalTime = 0;
    
    if (timeType === 'wait') {
      relevantCustomers = customers.filter(c => 
        (c.status === 'serving' || c.status === 'completed') && c.startServiceTime
      );
      
      totalTime = relevantCustomers.reduce((total, customer) => {
        const waitTime = customer.startServiceTime 
          ? (new Date(customer.startServiceTime).getTime() - new Date(customer.checkInTime).getTime()) / (1000 * 60)
          : 0;
        return total + waitTime;
      }, 0);
    } else { // service time
      relevantCustomers = customers.filter(c => 
        c.status === 'completed' && c.startServiceTime && c.endServiceTime
      );
      
      totalTime = relevantCustomers.reduce((total, customer) => {
        const serviceTime = customer.endServiceTime && customer.startServiceTime 
          ? (new Date(customer.endServiceTime).getTime() - new Date(customer.startServiceTime).getTime()) / (1000 * 60)
          : 0;
        return total + serviceTime;
      }, 0);
    }
    
    return relevantCustomers.length > 0 ? Math.round(totalTime / relevantCustomers.length) : 0;
  };

  // Add a new customer to the queue
  const addCustomer = (name: string, phoneNumber: string, serviceType: ServiceType): Customer => {
    const tokenNumber = generateTokenNumber(customers);
    const waitTime = estimateWaitTime(customers, serviceType, tellers);
    
    const newCustomer: Customer = {
      id: uuidv4(),
      name,
      phoneNumber,
      tokenNumber,
      serviceType,
      status: 'waiting',
      checkInTime: new Date(),
      estimatedWaitTime: waitTime
    };
    
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  // Update a customer's status
  const updateCustomerStatus = async (customerId: string, status: CustomerStatus) => {
    try {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;

      const teller = tellers.find(t => t.currentCustomerId === customerId);
      await updateCustomerStatusApi(customerId, status, teller?.id);

      await refreshCustomers();
    } catch (error) {
      console.error('Failed to update customer status:', error);
    }
  };

  // Assign the next customer to a teller
  const assignCustomerToTeller = async (tellerId: string) => {
    const teller = tellers.find(t => t.id === tellerId);
    if (!teller || teller.status === 'serving') return;
    
    // Get next customer using proper filter based on bypass flag
    let nextCustomer: Customer | null = null;
    
    if (bypassDateFilter) {
      // Skip date filtering if we're bypassing it
      const waitingCustomers = customers
        .filter(c => c.status === 'waiting' && teller.serviceTypes.includes(c.serviceType))
        .sort((a, b) => a.tokenNumber - b.tokenNumber);
      
      nextCustomer = waitingCustomers.length > 0 ? waitingCustomers[0] : null;
    } else {
      // Use standard method
      nextCustomer = getNextCustomer(customers, teller);
    }
    
    if (!nextCustomer) {
      console.log("No customers available for assignment.");
      return;
    }
    
    try {
      // Update teller status first
      setTellers(prev => 
        prev.map(t => 
          t.id === tellerId 
            ? { ...t, status: 'serving', currentCustomerId: nextCustomer!.id } 
            : t
        )
      );

      // Then update customer status
      await updateCustomerStatusApi(nextCustomer.id, 'serving', tellerId);
      await refreshCustomers();
    } catch (error) {
      console.error('Failed to assign customer to teller:', error);
      
      // Revert teller status on error
      setTellers(prev => 
        prev.map(t => 
          t.id === tellerId 
            ? { ...t, status: 'available', currentCustomerId: undefined } 
            : t
        )
      );
    }
  };

  // Complete service for a customer
  const completeCustomerService = async (tellerId: string) => {
    const teller = tellers.find(t => t.id === tellerId);
    if (!teller || !teller.currentCustomerId) return;
    
    try {
      // Update teller status first
      setTellers(prev => 
        prev.map(t => 
          t.id === tellerId 
            ? { 
                ...t, 
                status: 'available', 
                currentCustomerId: undefined,
                customersServed: t.customersServed + 1
              } 
            : t
        )
      );

      // Then update customer status
      await updateCustomerStatusApi(teller.currentCustomerId, 'completed', tellerId);
      await refreshCustomers();
    } catch (error) {
      console.error('Failed to complete customer service:', error);
      
      // Revert teller status on error
      setTellers(prev => 
        prev.map(t => 
          t.id === tellerId 
            ? { ...t, status: 'serving', currentCustomerId: teller.currentCustomerId } 
            : t
        )
      );
    }
  };

  // Update a teller's status
  const updateTellerStatus = (tellerId: string, status: 'available' | 'serving' | 'break') => {
    setTellers(prev => 
      prev.map(teller => 
        teller.id === tellerId 
          ? { ...teller, status } 
          : teller
      )
    );
  };

  // Get customers by status - modified to handle date filter bypass
  const getCustomersByStatus = (status: CustomerStatus): Customer[] => {
    // If bypassing date filter, return all customers with the given status
    if (bypassDateFilter) {
      return customers
        .filter(customer => customer.status === status)
        .sort((a, b) => a.tokenNumber - b.tokenNumber);
    }
    
    // Otherwise use standard filtering
    return customers
      .filter(customer => customer.status === status && isToday(customer.checkInTime))
      .sort((a, b) => a.tokenNumber - b.tokenNumber);
  };

  // Get a teller by ID
  const getTellerById = (tellerId: string): Teller | undefined => {
    return tellers.find(teller => teller.id === tellerId);
  };

  // Get a customer by ID
  const getCustomerById = (customerId: string): Customer | undefined => {
    return customers.find(customer => customer.id === customerId);
  };

  const value = {
    customers,
    tellers,
    queueStats,
    addCustomer,
    updateCustomerStatus,
    assignCustomerToTeller,
    completeCustomerService,
    updateTellerStatus,
    getCustomersByStatus,
    getTellerById,
    getCustomerById,
    refreshCustomers
  };

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
};