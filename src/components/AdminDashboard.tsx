import React, { useState } from 'react';
import * as Lucide from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import { formatTime, formatDuration } from '../utils/queueUtils';
import { CustomerStatus } from '../types';

const AdminDashboard: React.FC = () => {
  const { customers, tellers, queueStats, updateCustomerStatus } = useQueue();
  const [activeTab, setActiveTab] = useState<'queue' | 'tellers' | 'completed'>('queue');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'all'>('all');
  
  // Get today's customers
  const today = new Date().toDateString();
  const todaysCustomers = customers.filter(
    customer => new Date(customer.checkInTime).toDateString() === today
  );
  
  // Filter customers based on status filter
  const filteredCustomers = statusFilter === 'all'
    ? todaysCustomers
    : todaysCustomers.filter(customer => customer.status === statusFilter);
  
  const handleCancelCustomer = (customerId: string) => {
    if (confirm('Are you sure you want to cancel this customer?')) {
      updateCustomerStatus(customerId, 'cancelled');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-even">
      <div className="border-b border-bkNeutral-200">
        <div className="flex">
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'queue'
                ? 'border-bkBlue-900 text-bkBlue-900'
                : 'border-transparent text-bkNeutral-500 hover:text-bkNeutral-700 hover:border-bkNeutral-300'
            }`}
            onClick={() => setActiveTab('queue')}
          >
            <div className="flex items-center">
              <Lucide.BarChart4 className="h-4 w-4 mr-2" />
              Queue Management
            </div>
          </button>
          
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'tellers'
                ? 'border-bkBlue-900 text-bkBlue-900'
                : 'border-transparent text-bkNeutral-500 hover:text-bkNeutral-700 hover:border-bkNeutral-300'
            }`}
            onClick={() => setActiveTab('tellers')}
          >
            <div className="flex items-center">
              <Lucide.Users className="h-4 w-4 mr-2" />
              Teller Performance
            </div>
          </button>
          
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'completed'
                ? 'border-bkBlue-900 text-bkBlue-900'
                : 'border-transparent text-bkNeutral-500 hover:text-bkNeutral-700 hover:border-bkNeutral-300'
            }`}
            onClick={() => setActiveTab('completed')}
          >
            <div className="flex items-center">
              <Lucide.Clock className="h-4 w-4 mr-2" />
              Transaction History
            </div>
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {activeTab === 'queue' && (
          <>
            <div className="bg-bkNeutral-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-bkBlue-900 mb-4">Today's Queue Statistics</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <p className="text-sm text-bkNeutral-500 mb-1">Total Customers</p>
                  <p className="text-2xl font-bold text-bkBlue-900">{queueStats.totalCustomers}</p>
                </div>
                
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <p className="text-sm text-bkNeutral-500 mb-1">Waiting</p>
                  <p className="text-2xl font-bold text-bkBlue-900">{queueStats.waitingCustomers}</p>
                </div>
                
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <p className="text-sm text-bkNeutral-500 mb-1">Avg. Wait Time</p>
                  <p className="text-2xl font-bold text-bkBlue-900">{formatDuration(queueStats.avgWaitTime)}</p>
                </div>
                
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <p className="text-sm text-bkNeutral-500 mb-1">Avg. Service Time</p>
                  <p className="text-2xl font-bold text-bkBlue-900">{formatDuration(queueStats.avgServiceTime)}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-bkBlue-900">Queue Management</h3>
              
              <div className="flex space-x-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as CustomerStatus | 'all')}
                  className="text-sm border-bkNeutral-300 rounded-md shadow-sm focus:ring-bkBlue-500 focus:border-bkBlue-500"
                >
                  <option value="all">All Customers</option>
                  <option value="waiting">Waiting</option>
                  <option value="serving">Serving</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="border border-bkNeutral-200 rounded-lg overflow-hidden">
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
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-bkNeutral-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-bkNeutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-bkNeutral-200">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers
                      .sort((a, b) => {
                        // Sort by status first (waiting, serving, completed, cancelled)
                        const statusOrder = { waiting: 0, serving: 1, completed: 2, cancelled: 3 };
                        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
                        if (statusDiff !== 0) return statusDiff;
                        
                        // Then by token number
                        return a.tokenNumber - b.tokenNumber;
                      })
                      .map(customer => {
                        const teller = tellers.find(t => t.currentCustomerId === customer.id);
                        
                        return (
                          <tr key={customer.id} className="hover:bg-bkNeutral-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className={`
                                inline-flex items-center justify-center h-7 w-10 rounded font-semibold text-sm
                                ${customer.status === 'waiting'
                                  ? 'bg-bkBlue-100 text-bkBlue-800'
                                  : customer.status === 'serving'
                                  ? 'bg-bkGold-100 text-bkGold-800'
                                  : customer.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-bkNeutral-100 text-bkNeutral-600'}
                              `}>
                                {customer.tokenNumber}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-bkNeutral-900">{customer.name}</div>
                                <div className="text-sm text-bkNeutral-500">{customer.phoneNumber}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-bkNeutral-900">
                                {customer.serviceType.split('-').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                customer.status === 'waiting'
                                  ? 'bg-bkBlue-100 text-bkBlue-800'
                                  : customer.status === 'serving'
                                  ? 'bg-bkGold-100 text-bkGold-800'
                                  : customer.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-bkRed-100 text-bkRed-800'
                              }`}>
                                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                                {customer.status === 'serving' && teller && ` (${teller.name})`}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-bkNeutral-600">
                              {formatTime(new Date(customer.checkInTime))}
                              {customer.status === 'waiting' && (
                                <div className="text-xs text-bkNeutral-500">
                                  Est: {formatDuration(customer.estimatedWaitTime)}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                              {customer.status === 'waiting' && (
                                <button
                                  onClick={() => handleCancelCustomer(customer.id)}
                                  className="text-bkRed-600 hover:text-bkRed-900"
                                >
                                  <Lucide.Trash2 className="h-5 w-5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-bkNeutral-500">
                        No customers match the selected filter
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
        
        {activeTab === 'tellers' && (
          <>
            <h3 className="text-lg font-medium text-bkBlue-900 mb-4">Teller Performance</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {tellers.map(teller => {
                const servedCustomers = customers.filter(c => 
                  c.tellerId === teller.id && c.status === 'completed'
                );
                
                return (
                  <div key={teller.id} className="bg-white border border-bkNeutral-200 rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-bkNeutral-200 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-bkBlue-100 text-bkBlue-800 flex items-center justify-center mr-3">
                          <Lucide.Users className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-bkBlue-900">{teller.name}</h4>
                          <p className="text-sm text-bkNeutral-500">Teller #{teller.id}</p>
                        </div>
                      </div>
                      
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        teller.status === 'serving' 
                          ? 'bg-bkGold-100 text-bkGold-800' 
                          : teller.status === 'break'
                          ? 'bg-bkRed-100 text-bkRed-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {teller.status === 'serving' 
                          ? 'Serving' 
                          : teller.status === 'break'
                          ? 'On Break'
                          : 'Available'}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-bkNeutral-50 p-3 rounded">
                          <p className="text-sm text-bkNeutral-500 mb-1">Customers Served</p>
                          <p className="text-xl font-bold text-bkBlue-900">{teller.customersServed}</p>
                        </div>
                        
                        <div className="bg-bkNeutral-50 p-3 rounded">
                          <p className="text-sm text-bkNeutral-500 mb-1">Services</p>
                          <p className="text-sm font-medium text-bkBlue-900">
                            {teller.serviceTypes.map(type => 
                              type.split('-').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')
                            ).join(', ')}
                          </p>
                        </div>
                      </div>
                      
                      {teller.currentCustomerId && (
                        <div className="mt-4 p-3 bg-bkGold-50 border-l-4 border-bkGold-500 rounded">
                          <p className="text-sm font-medium text-bkNeutral-800">
                            Currently serving customer #{
                              customers.find(c => c.id === teller.currentCustomerId)?.tokenNumber
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="bg-bkNeutral-50 p-4 rounded-lg">
              <h4 className="font-medium text-bkBlue-900 mb-3 flex items-center">
                <Lucide.Award className="h-5 w-5 mr-2 text-bkGold-600" />
                Service Type Performance
              </h4>
              
              <div className="overflow-hidden border border-bkNeutral-200 rounded-lg">
                <table className="min-w-full divide-y divide-bkNeutral-200">
                  <thead className="bg-white">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-bkNeutral-500 uppercase tracking-wider">
                        Service Type
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-bkNeutral-500 uppercase tracking-wider">
                        Transactions
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-bkNeutral-500 uppercase tracking-wider">
                        Avg. Service Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-bkNeutral-200">
                    {['international-transfer', 'domestic-transfer', 'forex', 'account-services'].map(type => {
                      const completedOfType = customers.filter(c => 
                        c.serviceType === type && 
                        c.status === 'completed' &&
                        c.startServiceTime &&
                        c.endServiceTime
                      );
                      
                      const totalServiceTime = completedOfType.reduce((total, customer) => {
                        const serviceTime = customer.endServiceTime && customer.startServiceTime 
                          ? (new Date(customer.endServiceTime).getTime() - new Date(customer.startServiceTime).getTime()) / (1000 * 60)
                          : 0;
                        return total + serviceTime;
                      }, 0);
                      
                      const avgServiceTime = completedOfType.length > 0 
                        ? Math.round(totalServiceTime / completedOfType.length) 
                        : 0;
                      
                      return (
                        <tr key={type} className="hover:bg-bkNeutral-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm font-medium text-bkNeutral-900">
                              {type.split('-').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm text-bkNeutral-900">{completedOfType.length}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm text-bkNeutral-900">{formatDuration(avgServiceTime)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'completed' && (
          <>
            <h3 className="text-lg font-medium text-bkBlue-900 mb-4">Transaction History</h3>
            
            <div className="border border-bkNeutral-200 rounded-lg overflow-hidden">
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
                      Wait Time
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-bkNeutral-500 uppercase tracking-wider">
                      Service Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-bkNeutral-200">
                  {customers
                    .filter(c => c.status === 'completed' && c.startServiceTime && c.endServiceTime)
                    .sort((a, b) => new Date(b.endServiceTime!).getTime() - new Date(a.endServiceTime!).getTime())
                    .map(customer => {
                      const waitTime = customer.startServiceTime 
                        ? (new Date(customer.startServiceTime).getTime() - new Date(customer.checkInTime).getTime()) / (1000 * 60)
                        : 0;
                      
                      const serviceTime = customer.endServiceTime && customer.startServiceTime 
                        ? (new Date(customer.endServiceTime).getTime() - new Date(customer.startServiceTime).getTime()) / (1000 * 60)
                        : 0;
                      
                      const teller = tellers.find(t => t.id === customer.tellerId);
                      
                      return (
                        <tr key={customer.id} className="hover:bg-bkNeutral-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="inline-flex items-center justify-center h-7 w-10 rounded font-semibold text-sm bg-green-100 text-green-800">
                              {customer.tokenNumber}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-bkNeutral-900">{customer.name}</div>
                              <div className="text-sm text-bkNeutral-500">{customer.phoneNumber}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-bkNeutral-900">
                              {customer.serviceType.split('-').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-bkNeutral-900">
                              {teller?.name || 'Unknown'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-bkNeutral-600">
                            {formatDuration(Math.round(waitTime))}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-bkNeutral-600">
                            {formatDuration(Math.round(serviceTime))}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              
              {customers.filter(c => c.status === 'completed').length === 0 && (
                <div className="py-8 text-center text-sm text-bkNeutral-500 border-t border-bkNeutral-200">
                  No completed transactions for today
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;