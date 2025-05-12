import React, { useState } from 'react';
import { Star, MessageCircle, Send } from 'lucide-react';
import { FeedbackCategory } from '../types';
import { createFeedback } from '../api';

interface FeedbackFormProps {
  onSubmit: (feedback: {
    id: string;
    category: FeedbackCategory;
    rating: number;
    comment: string;
    createdAt: Date;
  }) => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSubmit }) => {
  const [feedback, setFeedback] = useState({
    category: '' as FeedbackCategory,
    rating: 0,
    comment: ''
  });
  
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await createFeedback(feedback);
      
      onSubmit({
        id: response.id,
        category: response.category as FeedbackCategory,
        rating: response.rating,
        comment: response.comment,
        createdAt: new Date(response.createdAt)
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: { value: FeedbackCategory; label: string }[] = [
    { value: 'service-quality', label: 'Service Quality' },
    { value: 'wait-time', label: 'Wait Time' },
    { value: 'staff-behavior', label: 'Staff Behavior' },
    { value: 'environment', label: 'Bank Environment' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-even p-6">
      <h3 className="text-xl font-semibold text-bkBlue-900 mb-6 flex items-center">
        <MessageCircle className="h-6 w-6 mr-2 text-bkBlue-500" />
        Share Your Feedback
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-bkRed-50 border-l-4 border-bkRed-500 text-bkRed-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-bkNeutral-700 mb-2">
            What would you like to give feedback about?
          </label>
          <select
            value={feedback.category}
            onChange={(e) => setFeedback(prev => ({ ...prev, category: e.target.value as FeedbackCategory }))}
            className="w-full px-3 py-2 border border-bkNeutral-300 rounded-md shadow-sm focus:ring-bkBlue-500 focus:border-bkBlue-500"
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-bkNeutral-700 mb-2">
            How would you rate your experience?
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(null)}
                onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                className="p-1 transition-colors"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredStar ?? feedback.rating)
                      ? 'fill-bkGold-500 text-bkGold-500'
                      : 'text-bkNeutral-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-bkNeutral-700 mb-2">
            Additional Comments
          </label>
          <textarea
            value={feedback.comment}
            onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
            className="w-full px-3 py-2 border border-bkNeutral-300 rounded-md shadow-sm focus:ring-bkBlue-500 focus:border-bkBlue-500"
            rows={4}
            placeholder="Please share your thoughts..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={!feedback.category || feedback.rating === 0 || isSubmitting}
          className={`w-full px-4 py-2 rounded-md transition-colors flex items-center justify-center ${
            !feedback.category || feedback.rating === 0 || isSubmitting
              ? 'bg-bkNeutral-300 text-white cursor-not-allowed'
              : 'bg-bkBlue-900 text-white hover:bg-bkBlue-800'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Feedback
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;