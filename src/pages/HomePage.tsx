import React, { useState } from 'react';
import CustomerForm from '../components/CustomerForm';
import QueueDisplay from '../components/QueueDisplay';
import TokenConfirmation from '../components/TokenConfirmation';
import { useQueue } from '../context/QueueContext';

const HomePage: React.FC = () => {
  const { customers } = useQueue();
  const [showTokenConfirmation, setShowTokenConfirmation] = useState(false);
  const [tokenInfo, setTokenInfo] = useState({ number: 0, waitTime: 0 });
  
  const handleCustomerAdded = (tokenNumber: number) => {
    const customer = customers.find(c => c.tokenNumber === tokenNumber);
    if (customer) {
      setTokenInfo({
        number: tokenNumber,
        waitTime: customer.estimatedWaitTime
      });
      setShowTokenConfirmation(true);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QueueDisplay />
        </div>
        
        <div>
          <CustomerForm onSuccess={handleCustomerAdded} />
        </div>
      </div>
      
      {showTokenConfirmation && (
        <TokenConfirmation
          tokenNumber={tokenInfo.number}
          estimatedWaitTime={tokenInfo.waitTime}
          onClose={() => setShowTokenConfirmation(false)}
        />
      )}
    </div>
  );
};

export default HomePage;