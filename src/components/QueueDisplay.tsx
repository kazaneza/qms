// src/components/QueueDisplay.tsx - Fixed component with date filter bypass

import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import { formatDuration, formatTime, isToday } from '../utils/queueUtils';

const QueueDisplay: React.FC = () => {
  const { customers, queueStats, tellers, refreshCustomers, getCustomersByStatus } = useQueue();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Refresh data every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshCustomers();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [refreshCustomers]);
  
  // Get customers by status using the context method (handles date bypass)
  const waitingCustomers = getCustomersByStatus('waiting');
  const servingCustomers = getCustomersByStatus('serving');
  const completedCustomers = getCustomersByStatus('completed')
    .sort((a, b) => b.tokenNumber - a.tokenNumber)
    .slice(0, 5); // Show only last 5 completed
  
  // Get available tellers
  const availableTellersCount = tellers.filter(t => t.status === 'available').length;

  const formatServiceType = (type: string | undefined) => {
    if (!type) return '';
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getTellerName = (tellerId: string | undefined) => {
    if (!tellerId) return 'Unknown';
    const teller = tellers.find(t => t.id === tellerId);
    return teller ? teller.name : 'Unknown';
  };
  
  // Debug logging to check customer data
  console.log("QueueDisplay - All customers:", customers);
  console.log("QueueDisplay - Waiting customers:", waitingCustomers);
  console.log("QueueDisplay - Serving customers:", servingCustomers);
  console.log("QueueDisplay - Completed customers:", completedCustomers);
  
  return (
    <div className="bg-white rounded-lg shadow-even overflow-hidden">
      <div className="bg-bkBlue-900 text-white p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Queue Status</h2>
          <div className="text-sm flex items-center">
            <Lucide.Clock className="h-4 w-4 mr-1" />
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-bkBlue-800 p-3 rounded-md">
            <p className="text-bkNeutral-300 text-xs mb-1">Waiting</p>
            <p className="text-2xl font-bold">{queueStats.waitingCustomers}</p>
          </div>
          
          <div className="bg-bkBlue-800 p-3 rounded-md">
            <p className="text-bkNeutral-300 text-xs mb-1">Avg. Wait</p>
            <p className="text-2xl font-bold">{formatDuration(queueStats.avgWaitTime)}</p>
          </div>
          
          <div className="bg-bkBlue-800 p-3 rounded-md">
            <p className="text-bkNeutral-300 text-xs mb-1">Tellers</p>
            <p className="text-2xl font-bold">
              {availableTellersCount}/{tellers.length}
            </p>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-bkNeutral-200">
        {/* Currently Serving Section */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-bkBlue-900 mb-3 flex items-center">
            <Lucide.Users className="h-5 w-5 mr-2 text-bkBlue-500" />
            Now Serving
          </h3>
          
          {servingCustomers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {servingCustomers.map(customer => (
                <div key={customer.id} className="bg-bkGold-50 border-l-4 border-bkGold-500 p-3 rounded-md flex items-center animate-pulse-slow">
                  <div className="bg-bkGold-600 text-white font-bold rounded-md h-10 w-12 flex items-center justify-center text-xl mr-3">
                    {customer.tokenNumber}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-bkBlue-900">{customer.name}</p>
                    <p className="text-sm text-bkNeutral-600">
                      Teller: {getTellerName(customer.tellerId)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3 text-bkNeutral-500">
              No customers currently being served
            </div>
          )}
        </div>
        
        {/* Waiting List Section */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-bkBlue-900 mb-3 flex items-center">
            <Lucide.Clock className="h-5 w-5 mr-2 text-bkBlue-500" />
            Waiting List
          </h3>
          
          {waitingCustomers.length > 0 ? (
            <div className="overflow-auto max-h-64">
              <table className="min-w-full divide-y divide-bkNeutral-200">
                <thead className="bg-bkNeutral-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-bkNeutral-500 uppercase tracking-wider">
                      Token
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-bkNeutral-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-bkNeutral-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-bkNeutral-500 uppercase tracking-wider">
                      Wait Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-bkNeutral-200">
                  {waitingCustomers.map((customer, index) => (
                    <tr 
                      key={customer.id}
                      className={`${
                        index < 3 ? 'hover:bg-bkNeutral-50' : 'hover:bg-bkNeutral-50'
                      } transition-colors`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`
                            flex-shrink-0 h-8 w-10 rounded flex items-center justify-center font-semibold 
                            ${index < 3 ? 'bg-bkBlue-100 text-bkBlue-800' : 'bg-bkNeutral-100 text-bkNeutral-700'}
                          `}>
                            {customer.tokenNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-bkNeutral-900">{customer.name}</div>
                        <div className="text-sm text-bkNeutral-500">{customer.phoneNumber}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-bkNeutral-900">
                          {formatServiceType(customer.serviceType)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-bkNeutral-600">
                        <div className="flex items-center">
                          {customer.estimatedWaitTime > 30 ? (
                            <Lucide.AlertCircle className="h-4 w-4 text-bkRed-500 mr-1" />
                          ) : (
                            <Lucide.Clock className="h-4 w-4 text-bkBlue-500 mr-1" />
                          )}
                          {formatDuration(customer.estimatedWaitTime)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-bkNeutral-500 border border-dashed border-bkNeutral-300 rounded-md">
              No customers waiting in queue
            </div>
          )}
        </div>

        {/* Recently Completed Section */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-bkBlue-900 mb-3 flex items-center">
            <Lucide.CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            Recently Completed
          </h3>
          
          {completedCustomers.length > 0 ? (
            <div className="overflow-auto max-h-48">
              <table className="min-w-full divide-y divide-bkNeutral-200">
                <thead className="bg-bkNeutral-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-bkNeutral-500 uppercase tracking-wider">
                      Token
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-bkNeutral-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-bkNeutral-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-bkNeutral-500 uppercase tracking-wider">
                      Teller
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-bkNeutral-500 uppercase tracking-wider">
                      Completed At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-bkNeutral-200">
                  {completedCustomers.map(customer => (
                    <tr key={customer.id} className="hover:bg-bkNeutral-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-10 rounded flex items-center justify-center font-semibold bg-green-100 text-green-800">
                            {customer.tokenNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-bkNeutral-900">{customer.name}</div>
                        <div className="text-sm text-bkNeutral-500">{customer.phoneNumber}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-bkNeutral-900">
                          {formatServiceType(customer.serviceType)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-bkNeutral-900">
                          {getTellerName(customer.tellerId)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-bkNeutral-600">
                        {customer.endServiceTime ? formatTime(customer.endServiceTime) : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-bkNeutral-500 border border-dashed border-bkNeutral-300 rounded-md">
              No completed services yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueueDisplay;