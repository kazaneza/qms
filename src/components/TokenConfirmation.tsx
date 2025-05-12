import React, { useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { formatDuration } from '../utils/queueUtils';

interface TokenConfirmationProps {
  tokenNumber: number;
  estimatedWaitTime: number;
  onClose: () => void;
}

const TokenConfirmation: React.FC<TokenConfirmationProps> = ({ 
  tokenNumber, 
  estimatedWaitTime, 
  onClose 
}) => {
  // Auto close after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 15000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed inset-0 bg-bkNeutral-900 bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 overflow-hidden animate-slide-up">
        <div className="bg-bkBlue-900 p-4 text-white text-center">
          <h2 className="text-xl font-bold">Queue Registration Successful</h2>
        </div>
        
        <div className="p-6 flex flex-col items-center">
          <div className="mb-6 text-bkGold-600">
            <Lucide.CheckCircle className="h-16 w-16" />
          </div>
          
          <h3 className="text-lg font-medium text-bkNeutral-900 mb-1">Your Token Number</h3>
          
          <div className="bg-bkBlue-900 text-white font-bold text-4xl py-3 px-6 rounded-lg my-4">
            {tokenNumber}
          </div>
          
          <div className="bg-bkNeutral-100 p-4 rounded-md w-full mb-6">
            <div className="flex items-center justify-center text-bkNeutral-700 mb-2">
              <Lucide.Clock className="h-5 w-5 mr-2" />
              <span className="font-medium">Estimated Wait Time</span>
            </div>
            <p className="text-center text-2xl font-bold text-bkBlue-900">
              {formatDuration(estimatedWaitTime)}
            </p>
          </div>
          
          <p className="text-sm text-bkNeutral-600 text-center mb-4">
            Please keep an eye on the display screen for your token number. You will be called when it's your turn.
          </p>
          
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-bkBlue-900 text-white rounded-md hover:bg-bkBlue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-bkBlue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenConfirmation;