import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../lib/firebase';
import { addPoints } from './utils/userIncentives';

function PlayInput({ fixtureId, county, currentScore, onScoreUpdate }) {
  const [scores, setScores] = useState(currentScore);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setScores(currentScore);
  }, [currentScore]);

  const handleScoreChange = (team, type, value) => {
    setScores(prev => ({
      ...prev,
      [team]: {
        ...prev[team],
        [type]: parseInt(value) || 0
      }
    }));
  };

  const submitScores = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setMessage('');
  
    if (county && fixtureId) {
      const scoresRef = collection(db, 'counties', county, 'competitions', 'senior-football-championship', 'fixtures', fixtureId, 'scores');
      try {
        await addDoc(scoresRef, {
          teamA: scores.teamA,
          teamB: scores.teamB,
          timestamp: serverTimestamp(),
          submittedBy: "anonymous"
        });
  
        // Add points for score submission
        if (typeof window !== 'undefined') { // Ensure localStorage is accessed in the browser
          const updatedUserData = addPoints(10); // Award 10 points for each submission
          setMessage(`Score submitted successfully! You earned 10 points. Total points: ${updatedUserData.points}`);
        }
        
        if (onScoreUpdate) onScoreUpdate(scores);
      } catch (error) {
        console.error("Error submitting score: ", error);
        setMessage("Error submitting score. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
      setMessage("Missing fixture or county information.");
    }
  };
  

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Update Scores</h3>
      {['teamA', 'teamB'].map(team => (
        <div key={team} className="mb-4">
          <h4 className="text-md font-medium mb-2 text-gray-700">
            {team === 'teamA' ? 'Home Team' : 'Away Team'}
          </h4>
          <div className="flex space-x-4 mb-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-600">Goals:</label>
              <input
                type="number"
                min="0"
                value={scores[team].goals}
                onChange={(e) => handleScoreChange(team, 'goals', e.target.value)}
                className="w-full border rounded px-2 py-1 text-lg text-gray-800"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-600">Points:</label>
              <input
                type="number"
                min="0"
                value={scores[team].points}
                onChange={(e) => handleScoreChange(team, 'points', e.target.value)}
                className="w-full border rounded px-2 py-1 text-lg text-gray-800"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={submitScores}
        disabled={isSubmitting}
        className={`w-full ${isSubmitting ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white py-2 rounded font-medium mt-4 transition duration-150 ease-in-out`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Scores'}
      </button>
      {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
    </div>
  );
}

export default PlayInput;