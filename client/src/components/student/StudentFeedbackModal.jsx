import { useState } from 'react';
import { X, Star, MessageSquare, Send, AlertCircle } from 'lucide-react';
import { submitEventFeedback } from '../../services/studentService';

export default function StudentFeedbackModal({
  isOpen,
  onClose,
  registrationId,
  eventTitle,
  onFeedbackSubmitted,
}) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await submitEventFeedback(registrationId, { rating, comments });
      const feedback = res?.feedback ?? { rating, comments };

      if (onFeedbackSubmitted) {
        // allow parent to refresh from server
        await onFeedbackSubmitted(feedback);
      }

      setRating(0);
      setComments('');
      onClose();
    } catch (err) {
      console.error('Feedback submit error', err);
      setError(err.response?.data?.message || err.message || 'Error submitting feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComments('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl max-w-md w-full border border-white/10 shadow-2xl animate-scaleIn">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 sm:p-6 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Event Feedback</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          
          {/* Event Title */}
          {eventTitle && (
            <div className="text-center">
              <p className="text-white/60 text-xs sm:text-sm mb-1">How was your experience at</p>
              <h3 className="text-white font-bold text-base sm:text-lg">{eventTitle}</h3>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Rating Section */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6">
            <label className="block text-white/80 text-sm font-medium mb-4 text-center">
              Rate Your Experience <span className="text-red-400">*</span>
            </label>
            
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onTouchStart={() => setHoveredRating(star)}
                  onTouchEnd={() => setHoveredRating(0)}
                  disabled={loading}
                  className="bg-transparent border-none transition-all transform active:scale-95 hover:scale-110 disabled:cursor-not-allowed p-1 sm:p-2"
                >
                  <Star
                    className={`w-8 h-8 sm:w-10 md:w-12 sm:h-10 md:h-12 transition-all ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-white/20'
                    }`}
                  />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <p className="text-center text-white/60 text-sm">
                {rating === 1 && '😞 Poor'}
                {rating === 2 && '😕 Below Average'}
                {rating === 3 && '😐 Average'}
                {rating === 4 && '😊 Good'}
                {rating === 5 && '🤩 Excellent'}
              </p>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6">
            <label className="block text-white/80 text-sm font-medium mb-3">
              Comments (Optional)
            </label>
            <textarea
              placeholder="Share your thoughts about the event..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={loading}
              rows="4"
              maxLength={500}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-white text-sm sm:text-base placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none disabled:opacity-50"
            />
            <p className="text-white/40 text-xs mt-2">
              {comments.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || rating === 0}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </div>

          {/* Helper Text */}
          <p className="text-center text-white/40 text-xs">
            Your feedback helps us improve future events
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
