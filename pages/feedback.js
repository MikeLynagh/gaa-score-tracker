import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Feedback() {
  const [type, setType] = useState('feedback');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await addDoc(collection(db, 'feedback'), {
        type,
        message,
        timestamp: new Date(),
      });
      setSubmitted(true);
      setMessage('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4 text-gray-900">Send Feedback</h1>
      
      {submitted ? (
        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <p className="text-green-700">Thank you for your feedback!</p>
          <Link href="/" className="text-black-500 hover:underline">Back to Home</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-3 border rounded-lg bg-white text-gray-900"
            >
              <option value="feedback">General Feedback</option>
              <option value="feature">Feature Request</option>
              <option value="bug">Report Issue</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full p-3 border rounded-lg bg-white text-gray-900"
              placeholder="Tell us what you think..."
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 rounded-lg font-medium text-white
              ${submitting 
                ? 'bg-gray-400' 
                : 'bg-green-500 active:bg-green-600'}`}
          >
            {submitting ? 'Sending...' : 'Send Feedback'}
          </button>
        </form>
      )}
    </div>
  );
}