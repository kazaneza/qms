import React, { useState } from 'react';
import * as Lucide from 'lucide-react';
import { ServiceType } from '../types';
import { createCustomer } from '../api';
import { useQueue } from '../context/QueueContext';

interface CustomerFormProps {
  onSuccess: (tokenNumber: number) => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSuccess }) => {
  const { refreshCustomers } = useQueue();
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    serviceType: 'international-transfer' as ServiceType
  });
  
  const [errors, setErrors] = useState({
    name: '',
    phoneNumber: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = { name: '', phoneNumber: '' };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }

    // Remove spaces before validation
    const cleanedPhone = formData.phoneNumber.replace(/\s+/g, '');

    if (!cleanedPhone) {
      newErrors.phoneNumber = 'Phone number is required';
      valid = false;
    } else if (!/^(07\d{8})$/.test(cleanedPhone)) {
      newErrors.phoneNumber = 'Please enter a valid Rwanda phone number (e.g., 0712345678)';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Clean phone number before sending to backend
      const cleanedPhone = formData.phoneNumber.replace(/\s+/g, '');
      const customer = await createCustomer({
        name: formData.name,
        phoneNumber: cleanedPhone,
        serviceType: formData.serviceType
      });
      
      // Refresh the customer list
      await refreshCustomers();
      
      // Reset form
      setFormData({
        name: '',
        phoneNumber: '',
        serviceType: 'international-transfer'
      });
      
      // Notify parent component
      onSuccess(customer.tokenNumber);
    } catch (error) {
      console.error('Error adding customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-even p-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-bkBlue-900 mb-4">Customer Registration</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-bkNeutral-700 mb-1">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lucide.User className="h-5 w-5 text-bkNeutral-400" />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.name ? 'border-bkRed-500' : 'border-bkNeutral-300'
              } rounded-md shadow-sm focus:ring-bkBlue-500 focus:border-bkBlue-500`}
              placeholder="Enter your full name"
            />
          </div>
          {errors.name && <p className="mt-1 text-sm text-bkRed-600">{errors.name}</p>}
        </div>
        
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-bkNeutral-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lucide.Phone className="h-5 w-5 text-bkNeutral-400" />
            </div>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.phoneNumber ? 'border-bkRed-500' : 'border-bkNeutral-300'
              } rounded-md shadow-sm focus:ring-bkBlue-500 focus:border-bkBlue-500`}
              placeholder="e.g., 0712345678"
            />
          </div>
          {errors.phoneNumber && <p className="mt-1 text-sm text-bkRed-600">{errors.phoneNumber}</p>}
        </div>
        
        <div>
          <label htmlFor="serviceType" className="block text-sm font-medium text-bkNeutral-700 mb-1">
            Service Type
          </label>
          <select
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="block w-full py-2 px-3 border border-bkNeutral-300 rounded-md shadow-sm focus:ring-bkBlue-500 focus:border-bkBlue-500"
          >
            <option value="international-transfer">International Transfer</option>
            <option value="domestic-transfer">Domestic Transfer</option>
            <option value="forex">Foreign Exchange</option>
            <option value="account-services">Account Services</option>
          </select>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-bkBlue-900 hover:bg-bkBlue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bkBlue-500 transition-colors ${
            isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <Lucide.Send className="mr-2 h-5 w-5" />
              Join Queue
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CustomerForm;