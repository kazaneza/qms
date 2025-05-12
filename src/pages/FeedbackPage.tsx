import React, { useState, useEffect } from 'react';
import { MessageCircle, CheckCircle } from 'lucide-react';
import FeedbackForm from '../components/FeedbackForm';
import FeedbackList from '../components/FeedbackList';
import type { Feedback } from '../types';
import { getFeedback } from '../api';

const FeedbackPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [showForm, setShowForm] = useState(true);
  
  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const response = await getFeedback();
      setFeedbacks(response);
    } catch (error) {
      console.error('Failed to load feedback:', error);
    }
  };

  const handleFeedbackSubmit = async (feedback: Feedback) => {
    setFeedbacks(prev => [feedback, ...prev]);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-even p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-bkBlue-900 mb-2">Thank You!</h2>
            <p className="text-bkNeutral-600 mb-6">
              Your feedback has been submitted successfully. We appreciate your input in helping us improve our services.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-bkBlue-900 text-white rounded-md hover:bg-bkBlue-800 transition-colors"
              >
                Submit Another Feedback
              </button>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setShowForm(false);
                  loadFeedback();
                }}
                className="px-4 py-2 border border-bkBlue-900 text-bkBlue-900 rounded-md hover:bg-bkBlue-50 transition-colors"
              >
                View All Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <MessageCircle className="h-6 w-6 text-bkBlue-500 mr-2" />
            <h2 className="text-2xl font-bold text-bkBlue-900">Customer Feedback</h2>
          </div>
          
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) {
                loadFeedback();
              }
            }}
            className={`px-4 py-2 rounded-md transition-colors ${
              showForm
                ? 'bg-bkBlue-100 text-bkBlue-900 hover:bg-bkBlue-200'
                : 'bg-bkBlue-900 text-white hover:bg-bkBlue-800'
            }`}
          >
            {showForm ? 'View Feedback' : 'Share Feedback'}
          </button>
        </div>
        
        {showForm ? (
          <>
            <div className="bg-bkBlue-50 border border-bkBlue-100 rounded-lg p-4 mb-6">
              <p className="text-bkBlue-900">
                We value your feedback! Please help us improve our services by sharing your experience with us.
              </p>
            </div>
            <FeedbackForm onSubmit={handleFeedbackSubmit} />
          </>
        ) : (
          <FeedbackList feedbacks={feedbacks} />
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;