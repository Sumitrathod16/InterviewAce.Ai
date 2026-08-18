import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, Heart, ShieldAlert, Sparkles, Smile } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function FeedbackPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('General');
  const [comment, setComment] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setEmail(userProfile.email || '');
    }
  }, [userProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !comment.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        email,
        rating,
        category,
        comment,
        userId: userProfile ? userProfile._id : null
      };

      const response = await API.post('/feedback', payload);
      toast.success(response.data.message || 'Feedback submitted successfully!');
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit feedback:', err.message);
      const msg = err.response?.data?.message || 'Error occurred while saving your feedback.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['General', 'Bug Report', 'Feature Request', 'Pricing', 'Other'];

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-lg p-8 bg-secondaryBg rounded-2xl border border-white/5 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-accent">
            <Heart size={28} className="fill-current animate-pulse text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Thank You for Your Feedback!</h2>
            <p className="text-xs text-lightGray/65 leading-relaxed max-w-sm mx-auto">
              Your valuable comments help us continuously refine and optimize the candidate preparation workspace.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-6 py-2.5 glassmorphism border border-white/5 hover:bg-white/5 text-white font-bold text-xs rounded-lg transition-all"
            >
              Return to Home
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setComment('');
                if (!userProfile) {
                  setName('');
                  setEmail('');
                }
                setRating(5);
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-white text-background font-bold text-xs rounded-lg hover:bg-lightGray transition-all shadow-md"
            >
              Submit Another Feedback
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-24 px-4 flex items-center justify-center">
      <div className="w-full max-w-xl p-5 sm:p-8 bg-secondaryBg rounded-2xl border border-white/5 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200 min-w-0">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-white text-background rounded-xl">
            <MessageSquare size={22} className="stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Share Your Experience
          </h2>
          <p className="text-xs text-lightGray/55 max-w-sm leading-relaxed">
            Have questions, feature requests, or suggestions? Help us shape the future of InterviewAce.AI.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* User Status Badge */}
          {userProfile && (
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-[10px] text-lightGray/70 flex items-center gap-2">
              <Smile size={14} className="text-white flex-shrink-0" />
              <div>
                Logged in as <span className="font-bold text-white">{userProfile.name}</span> ({userProfile.email}). Details pre-filled.
              </div>
            </div>
          )}

          {/* Rating Selector */}
          <div className="space-y-1.5 flex flex-col items-center">
            <label className="block text-[10px] font-bold text-lightGray/50 uppercase tracking-wider">
              Overall Rating
            </label>
            <div className="flex items-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-lightGray/20 hover:scale-115 transition-transform"
                >
                  <Star
                    size={28}
                    className={`${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-lightGray/25'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <span className="text-[10px] text-lightGray/40 mt-1 font-medium font-mono">
              {rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Below Average' : 'Needs Work'}
            </span>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-lightGray/50 uppercase mb-1.5 tracking-wider">
              Feedback Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-background/50 text-white rounded-lg px-3 py-3 text-xs border border-white/5 focus:outline-none focus:border-white/30 font-sans appearance-none"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-[10px] font-bold text-lightGray/50 uppercase mb-1.5 tracking-wider">
                Full Name *
              </label>
              <input
                type="text"
                required
                disabled={!!userProfile}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Chen"
                className="w-full bg-background/50 text-white rounded-lg px-3 py-3 text-xs border border-white/5 focus:outline-none focus:border-white/30 font-sans disabled:opacity-50"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-lightGray/50 uppercase mb-1.5 tracking-wider">
                Email Address *
              </label>
              <input
                type="email"
                required
                disabled={!!userProfile}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-background/50 text-white rounded-lg px-3 py-3 text-xs border border-white/5 focus:outline-none focus:border-white/30 font-sans disabled:opacity-50"
              />
            </div>
          </div>

          {/* Comments Textarea */}
          <div>
            <label className="block text-[10px] font-bold text-lightGray/50 uppercase mb-1.5 tracking-wider">
              Comments / Details *
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What went well? What can we do better? Let us know..."
              className="w-full bg-background/50 text-white rounded-lg p-3 text-xs border border-white/5 focus:outline-none focus:border-white/30 font-sans resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-background hover:bg-lightGray font-bold text-xs rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-background border-t-transparent animate-spin" />
            ) : (
              <Send size={14} />
            )}
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
