import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../lib/firebase';

function PlayInput({ fixtureId, county, currentScore, onScoreUpdate }) {
  const [scores, setScores] = useState(currentScore);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitTimeoutRef = useRef(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    setScores(currentScore);
  }, [currentScore]);

  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

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
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }

    submitTimeoutRef.current = setTimeout(async () => {
      if (county && fixtureId) {
        const scoresRef = collection(db, 'counties', county, 'competitions', 'senior-football-championship', 'fixtures', fixtureId, 'scores');
        try {
          await addDoc(scoresRef, {
            teamA: scores.teamA,
            teamB: scores.teamB,
            timestamp: serverTimestamp(),
            submittedBy: "anonymous"
          });
          console.log("Score successfully submitted!");
        } catch (error) {
          console.error("Error submitting score: ", error);
        } finally {
          setIsSubmitting(false);
          isSubmittingRef.current = false;
        }
      } else {
        setIsSubmitting(false);
        isSubmittingRef.current = false;
      }
    }, 500);  // 500ms debounce
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Update Scores</h3>
      {['teamA', 'teamB'].map(team => (
        <div key={team} className="mb-4">
          <h4 className="text-md font-medium mb-2 text-gray-800">
            {team === 'teamA' ? 'Home Team' : 'Away Team'}
          </h4>
          <div className="flex space-x-4 mb-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-700">Goals:</label>
              <input
                type="number"
                min="0"
                value={scores[team].goals}
                onChange={(e) => handleScoreChange(team, 'goals', e.target.value)}
                className="w-full border rounded px-2 py-1 text-lg text-gray-800"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-700">Points:</label>
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
    </div>
  );
}

export default PlayInput;