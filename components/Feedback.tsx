import React, { useState, useEffect, useCallback } from 'react';
import ThumbsUpIcon from './icons/ThumbsUpIcon';
import ThumbsDownIcon from './icons/ThumbsDownIcon';

interface FeedbackProps {
  runId: string;
}

const Feedback: React.FC<FeedbackProps> = ({ runId }) => {
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [text, setText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load feedback from local storage when runId changes
  useEffect(() => {
    const key = `feedback-${runId}`;
    try {
      const storedFeedback = localStorage.getItem(key);
      if (storedFeedback) {
        const { rating: storedRating, text: storedText } = JSON.parse(storedFeedback);
        setRating(storedRating);
        setText(storedText || '');
        setIsSubmitted(true);
      } else {
        // Reset for new run
        setRating(null);
        setText('');
        setIsSubmitted(false);
      }
    } catch (error) {
      console.error("Failed to parse feedback from localStorage", error);
    }
  }, [runId]);

  const saveFeedback = useCallback((currentRating: 'up' | 'down' | null, currentText: string) => {
    if (!runId) return;
    const key = `feedback-${runId}`;
    try {
      const feedbackData = JSON.stringify({ rating: currentRating, text: currentText, timestamp: Date.now() });
      localStorage.setItem(key, feedbackData);
    } catch (error) {
        console.error("Failed to save feedback to localStorage", error);
    }
  }, [runId]);

  const handleRating = (newRating: 'up' | 'down') => {
    if (isSubmitted) return;
    const finalRating = rating === newRating ? null : newRating; // Allow deselecting
    setRating(finalRating);
    setIsSubmitted(true); // Consider it submitted once a rating is clicked
    saveFeedback(finalRating, text);
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    saveFeedback(rating, newText);
  };

  return (
    <div className="mt-5 pt-5 border-t border-gray-700/60">
      <h4 className="text-sm font-semibold text-gray-300 mb-2">Rate this output:</h4>
      {isSubmitted ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
            <div className="flex items-center gap-3">
                <p className="text-sm text-gray-300">Your feedback has been saved.</p>
            </div>
        </div>
      ) : (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleRating('up')}
              className={`p-2 rounded-full transition-colors duration-200 ${rating === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 hover:bg-gray-600 text-gray-400'}`}
              aria-pressed={rating === 'up'}
              aria-label="Good output"
            >
              <ThumbsUpIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleRating('down')}
              className={`p-2 rounded-full transition-colors duration-200 ${rating === 'down' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 hover:bg-gray-600 text-gray-400'}`}
              aria-pressed={rating === 'down'}
              aria-label="Bad output"
            >
              <ThumbsDownIcon className="w-5 h-5" />
            </button>
          </div>
          {(rating !== null) && (
            <textarea
                value={text}
                onChange={handleTextChange}
                rows={2}
                className="w-full bg-gray-900/70 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm placeholder-gray-500"
                placeholder="Optional: Provide additional feedback..."
                disabled={isSubmitted}
            />
           )}
        </div>
      )}
    </div>
  );
};

export default Feedback;