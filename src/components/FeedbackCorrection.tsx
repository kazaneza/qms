import React, { useState } from 'react';
import { Star, MessageCircle, Send, AlertCircle } from 'lucide-react';
import { useQueue } from '../context/QueueContext';

interface FeedbackCorrectionProps {
  tellerId: string;
  customerId: string;
}

interface FeedbackItem {
  rating: number;
  comment: string;
}

const FeedbackCorrection: React.FC<FeedbackCorrectionProps> = ({ tellerId, customerId }) => {
  const { getTellerById, getCustomerById } = useQueue();
  const [feedback, setFeedback] = useState<FeedbackItem>({
    rating: 0,
    comment: ''
  });
  
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', feedback);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="text-green-500 mb-2">
          <AlertCircle className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-bkBlue-900 mb-2">Thank You for Your Feedback!</h3>
        <p className="text-sm text-bkNeutral-600">Your feedback helps us improve our services.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="text-lg font-medium text-bkBlue-900 mb-4 flex items-center">
        <MessageCircle className="h-5 w-5 mr-2 text-bkBlue-500" />
        Rate Your Experience
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-bkNeutral-700 mb-2">
            How would you rate our service?
          </label>
          <div className="flex items-center justify-center space-x-2">
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
          <label htmlFor="comment" className="block text-sm font-medium text-bkNeutral-700 mb-1">
            Additional Comments
          </label>
          <textarea
            id="comment"
            value={feedback.comment}
            onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
            className="w-full px-3 py-2 border border-bkNeutral-300 rounded-md shadow-sm focus:ring-bkBlue-500 focus:border-bkBlue-500"
            rows={3}
            placeholder="Tell us about your experience..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={feedback.rating === 0}
            className={`px-4 py-2 rounded-md transition-colors flex items-center ${
              feedback.rating === 0
                ? 'bg-bkNeutral-300 text-white cursor-not-allowed'
                : 'bg-bkBlue-900 text-white hover:bg-bkBlue-800'
            }`}
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Feedback
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackCorrection;