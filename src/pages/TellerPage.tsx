import React, { useState } from 'react';
import TellerInterface from '../components/TellerInterface';
import { AlertCircle } from 'lucide-react';

const TellerPage: React.FC = () => {
  const [selectedTellerId, setSelectedTellerId] = useState<string | null>(null);
  
  const handleTellerSelect = (tellerId: string) => {
    setSelectedTellerId(tellerId);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {!selectedTellerId ? (
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-even p-6">
            <h2 className="text-xl font-semibold text-bkBlue-900 mb-4">Teller Login</h2>
            
            <div className="bg-bkBlue-50 p-4 rounded-md mb-6 flex items-start">
              <AlertCircle className="h-5 w-5 text-bkBlue-700 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-bkBlue-800">
                Please select your teller ID to access the queue management system.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => handleTellerSelect('1')}
                className="w-full p-3 bg-white border border-bkNeutral-300 rounded-md hover:bg-bkNeutral-50 transition-colors text-left"
              >
                <p className="font-medium text-bkBlue-900">Jean Bosco</p>
                <p className="text-sm text-bkNeutral-600">Teller #1 • International Transfer, Forex</p>
              </button>
              
              <button
                onClick={() => handleTellerSelect('2')}
                className="w-full p-3 bg-white border border-bkNeutral-300 rounded-md hover:bg-bkNeutral-50 transition-colors text-left"
              >
                <p className="font-medium text-bkBlue-900">Marie Claire</p>
                <p className="text-sm text-bkNeutral-600">Teller #2 • International Transfer, Domestic Transfer</p>
              </button>
              
              <button
                onClick={() => handleTellerSelect('3')}
                className="w-full p-3 bg-white border border-bkNeutral-300 rounded-md hover:bg-bkNeutral-50 transition-colors text-left"
              >
                <p className="font-medium text-bkBlue-900">Emmanuel</p>
                <p className="text-sm text-bkNeutral-600">Teller #3 • Domestic Transfer, Account Services</p>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <button
              onClick={() => setSelectedTellerId(null)}
              className="text-sm text-bkBlue-700 hover:text-bkBlue-900 hover:underline"
            >
              ← Switch Teller
            </button>
          </div>
          
          <TellerInterface tellerId={selectedTellerId} />
        </div>
      )}
    </div>
  );
};

export default TellerPage;