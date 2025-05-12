import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Customer, CustomerStatus, ServiceType, Teller, QueueStats } from '../types';
import { generateTokenNumber, estimateWaitTime, calculateQueueStats, getNextCustomer } from '../utils/queueUtils';
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

  const refreshCustomers = async () => {
    try {
      const fetchedCustomers = await getCustomers();
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
    setQueueStats(calculateQueueStats(customers));
  }, [customers]);

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
    
    const nextCustomer = getNextCustomer(customers, teller);
    if (!nextCustomer) return;
    
    try {
      // Update teller status first
      setTellers(prev => 
        prev.map(t => 
          t.id === tellerId 
            ? { ...t, status: 'serving', currentCustomerId: nextCustomer.id } 
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

  // Get customers by status
  const getCustomersByStatus = (status: CustomerStatus): Customer[] => {
    return customers.filter(customer => customer.status === status)
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