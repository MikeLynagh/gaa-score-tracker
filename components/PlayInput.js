import React, { useState, useEffect } from 'react';
import { addScoreUpdate } from '../lib/firestoreUtils';
import useNotification from '@/hooks/useNotification';
import Notification from "./Notification"

function PlayInput({ fixtureId, county, competition, currentScore, onScoreUpdate }) {
  const [scores, setScores] = useState(currentScore);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notification, showNotification} = useNotification()

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

  const handleIncrement = (team, type) => {
    setScores(prev => ({
      ...prev, 
      [team]: {
        ...prev[team],
        [type]: (prev[team][type] || 0) + 1
      }
    }));
  };

  const submitScores = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addScoreUpdate(county, competition, fixtureId, scores);
      showNotification("Score updated successfully");
      if (onScoreUpdate) onScoreUpdate(scores);
    } catch (error) {
      console.error("Error submitting score: ", error);
      showNotification("Failed to update score");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderTeamInputs = (team) => (
    <div key={team} className="mb-4">
      <h4 className="text-md font-medium mb-2 text-gray-700">
        {team === 'teamA' ? 'Home Team' : 'Away Team'}
      </h4>
      <div className="flex space-x-4 mb-2">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-gray-600">Goals:</label>
          <div className="flex items-center">
            <input
              type="number"
              min="0"
              value={scores[team].goals}
              onChange={(e) => handleScoreChange(team, 'goals', e.target.value)}
              className="w-full border rounded-l px-2 py-1 text-lg text-gray-800"
            />
            <button
              onClick={() => handleIncrement(team, 'goals')}
              className="bg-blue-500 text-white px-2 py-1 rounded-r"
            >
              +1
            </button>
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-gray-600">Points:</label>
          <div className="flex items-center">
            <input
              type="number"
              min="0"
              value={scores[team].points}
              onChange={(e) => handleScoreChange(team, 'points', e.target.value)}
              className="w-full border rounded-l px-2 py-1 text-lg text-gray-800"
            />
            <button
              onClick={() => handleIncrement(team, 'points')}
              className="bg-green-500 text-white px-2 py-1 rounded-r"
            >
              +1
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Update Scores</h3>
      {renderTeamInputs('teamA')}
      {renderTeamInputs('teamB')}
      <Notification 
      message = {notification.message}
      type={notification.type}
      />
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

export default PlayInput;;