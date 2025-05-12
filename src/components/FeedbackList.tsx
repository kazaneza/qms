import React from 'react';
import { Star, Calendar, MessageSquare } from 'lucide-react';
import type { Feedback } from '../types';

interface FeedbackListProps {
  feedbacks: Feedback[];
}

const FeedbackList: React.FC<FeedbackListProps> = ({ feedbacks }) => {
  const getCategoryLabel = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-4">
      {feedbacks && feedbacks.length > 0 ? (
        feedbacks.map(feedback => (
          <div key={feedback.id} className="bg-white rounded-lg shadow-even p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-bkBlue-900 mr-2">
                    {getCategoryLabel(feedback.category)}
                  </span>
                  <span className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= feedback.rating
                            ? 'fill-bkGold-500 text-bkGold-500'
                            : 'text-bkNeutral-300'
                        }`}
                      />
                    ))}
                  </span>
                </div>
                <p className="text-bkNeutral-600 text-sm">{feedback.comment}</p>
              </div>
              <div className="text-xs text-bkNeutral-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(feedback.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow-even">
          <MessageSquare className="h-12 w-12 text-bkNeutral-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-bkNeutral-900 mb-1">No Feedback Yet</h3>
          <p className="text-sm text-bkNeutral-600">
            Be the first to share your experience with us.
          </p>
        </div>
      )}
    </div>
  );
};

export default FeedbackList;