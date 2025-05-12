import React, { useState } from 'react';
import * as Lucide from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import { formatTime } from '../utils/queueUtils';
import FeedbackCorrection from './FeedbackCorrection';

interface TellerInterfaceProps {
  tellerId: string;
}

const TellerInterface: React.FC<TellerInterfaceProps> = ({ tellerId }) => {
  const { 
    getTellerById, 
    getCustomerById, 
    assignCustomerToTeller, 
    completeCustomerService,
    updateTellerStatus
  } = useQueue();
  
  const teller = getTellerById(tellerId);
  const currentCustomer = teller?.currentCustomerId 
    ? getCustomerById(teller.currentCustomerId) 
    : null;
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCustomerId, setLastCustomerId] = useState<string | null>(null);
  
  if (!teller) {
    return <div>Teller not found</div>;
  }
  
  const handleNextCustomer = () => {
    setShowFeedback(false);
    assignCustomerToTeller(tellerId);
  };
  
  const handleCompleteService = () => {
    setShowConfirmation(true);
  };
  
  const confirmCompleteService = () => {
    if (currentCustomer) {
      setLastCustomerId(currentCustomer.id);
      completeCustomerService(tellerId);
      setShowConfirmation(false);
      setShowFeedback(true);
    }
  };
  
  const toggleBreakStatus = () => {
    updateTellerStatus(tellerId, teller.status === 'break' ? 'available' : 'break');
  };
  
  return (
    <div className="space-y-4">
      {showFeedback && lastCustomerId && (
        <div className="bg-white rounded-lg shadow-even p-4 border-l-4 border-bkBlue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-bkBlue-900 flex items-center">
              <Lucide.MessageSquare className="h-5 w-5 mr-2 text-bkBlue-500" />
              Service Feedback
            </h3>
            <button
              onClick={() => setShowFeedback(false)}
              className="text-bkNeutral-500 hover:text-bkNeutral-700"
            >
              <Lucide.X className="h-5 w-5" />
            </button>
          </div>
          <FeedbackCorrection 
            tellerId={tellerId} 
            customerId={lastCustomerId}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-even overflow-hidden">
        <div className="bg-bkBlue-900 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-bkBlue-700 flex items-center justify-center mr-3">
                <Lucide.User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{teller.name}</h2>
                <p className="text-sm text-bkNeutral-300">
                  Teller #{tellerId} • {teller.customersServed} served today
                </p>
              </div>
            </div>
            
            <div>
              <button
                onClick={toggleBreakStatus}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${
                  teller.status === 'break'
                    ? 'bg-bkGold-500 hover:bg-bkGold-400 text-bkNeutral-900'
                    : 'bg-bkBlue-700 hover:bg-bkBlue-600'
                }`}
              >
                {teller.status === 'break' ? (
                  <>
                    <Lucide.CheckCircle className="h-4 w-4 mr-1" />
                    Return
                  </>
                ) : (
                  <>
                    <Lucide.Coffee className="h-4 w-4 mr-1" />
                    Break
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-bkBlue-900">
              {teller.status === 'serving' ? 'Current Customer' : 'Customer Service'}
            </h3>
            
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              teller.status === 'serving' 
                ? 'bg-bkGold-100 text-bkGold-800' 
                : teller.status === 'break'
                ? 'bg-bkRed-100 text-bkRed-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {teller.status === 'serving' 
                ? 'Serving Customer' 
                : teller.status === 'break'
                ? 'On Break'
                : 'Available'}
            </div>
          </div>
          
          {teller.status === 'break' ? (
            <div className="bg-bkNeutral-100 rounded-lg p-6 text-center">
              <Lucide.Coffee className="h-12 w-12 mx-auto mb-3 text-bkNeutral-500" />
              <p className="text-lg font-medium text-bkNeutral-700 mb-2">You are currently on break</p>
              <p className="text-sm text-bkNeutral-500 mb-4">
                New customers will not be assigned to you until you return from break.
              </p>
              <button
                onClick={toggleBreakStatus}
                className="px-4 py-2 bg-bkBlue-900 text-white rounded-md hover:bg-bkBlue-800 transition-colors"
              >
                Return from Break
              </button>
            </div>
          ) : currentCustomer ? (
            <div className="bg-bkNeutral-50 border border-bkNeutral-200 rounded-lg overflow-hidden">
              <div className="flex items-center p-4 border-b border-bkNeutral-200">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-bkBlue-100 flex items-center justify-center text-bkBlue-800 font-bold text-lg mr-4">
                  {currentCustomer.tokenNumber}
                </div>
                
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-bkBlue-900">{currentCustomer.name}</h4>
                  <div className="flex items-center text-sm text-bkNeutral-600">
                    <Lucide.Clock className="h-4 w-4 mr-1" />
                    <span>Check-in: {formatTime(new Date(currentCustomer.checkInTime))}</span>
                  </div>
                </div>
                
                <a
                  href={`tel:${currentCustomer.phoneNumber}`}
                  className="text-bkBlue-700 hover:text-bkBlue-900 transition-colors"
                >
                  <Lucide.PhoneCall className="h-5 w-5" />
                </a>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-3 rounded border border-bkNeutral-200">
                    <p className="text-sm text-bkNeutral-500 mb-1">Service Type</p>
                    <p className="font-medium text-bkBlue-900">
                      {currentCustomer.serviceType.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </p>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-bkNeutral-200">
                    <p className="text-sm text-bkNeutral-500 mb-1">Phone Number</p>
                    <p className="font-medium text-bkBlue-900">{currentCustomer.phoneNumber}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleCompleteService}
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Lucide.CheckCircle className="h-5 w-5 mr-2" />
                  Complete Service
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-bkNeutral-50 border border-dashed border-bkNeutral-300 rounded-lg p-6 text-center">
              <Lucide.UserPlus className="h-12 w-12 mx-auto mb-3 text-bkNeutral-400" />
              <p className="text-lg font-medium text-bkNeutral-700 mb-2">No Active Customer</p>
              <p className="text-sm text-bkNeutral-500 mb-4">
                You are not currently serving any customer. Call the next customer in the queue.
              </p>
              <button
                onClick={handleNextCustomer}
                className="px-4 py-2 bg-bkBlue-900 text-white rounded-md hover:bg-bkBlue-800 transition-colors"
              >
                Call Next Customer
              </button>
            </div>
          )}
        </div>
      </div>
      
      {showConfirmation && (
        <div className="fixed inset-0 bg-bkNeutral-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-bkBlue-900 mb-2">Confirm Service Completion</h3>
              <p className="text-bkNeutral-600 mb-4">
                Are you sure you want to mark this customer's service as complete?
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 border border-bkNeutral-300 text-bkNeutral-700 rounded-md hover:bg-bkNeutral-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCompleteService}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TellerInterface;