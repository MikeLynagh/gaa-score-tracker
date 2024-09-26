import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, collectionGroup, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function LiveScoreFeed() {
  const [liveScores, setLiveScores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const scoresQuery = query(
      collectionGroup(db, 'scores'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(scoresQuery, 
      async (querySnapshot) => {
        try {
          const scoresPromises = querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const fixtureRef = doc.ref.parent.parent;
            const fixtureSnap = await getDoc(fixtureRef);
            const fixtureData = fixtureSnap.data();
            return {
              id: doc.id,
              homeTeam: fixtureData?.homeTeam || 'Home Team',
              awayTeam: fixtureData?.awayTeam || 'Away Team',
              homeScore: `${data.teamA.goals}-${data.teamA.points}`,
              awayScore: `${data.teamB.goals}-${data.teamB.points}`,
              timestamp: data.timestamp,
              county: fixtureRef?.parent?.parent?.parent?.id || 'Unknown',
              competition: fixtureRef?.parent?.parent?.id || 'Unknown'
            };
          });

          const scores = await Promise.all(scoresPromises);
          
          // Remove duplicates based on id
          const uniqueScores = scores.reduce((acc, current) => {
            const x = acc.find(item => item.id === current.id);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, []);

          setLiveScores(uniqueScores);
          setIsLoading(false);
        } catch (err) {
          console.error("Error fetching live scores:", err);
          setError("Failed to fetch live scores. Please try again later.");
          setIsLoading(false);
        }
      },
      (err) => {
        console.error("Error in onSnapshot:", err);
        setError("An error occurred while fetching live scores.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading latest scores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Latest Scores</h2>
      {liveScores.length > 0 ? (
        <ul className="space-y-6">
          {liveScores.map((score) => (
            <li key={score.id} className="border-b pb-4 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-lg text-gray-900 dark:text-white">{score.homeTeam}</span>
                <span className="font-bold text-xl text-gray-900 dark:text-white">{score.homeScore}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-lg text-gray-900 dark:text-white">{score.awayTeam}</span>
                <span className="font-bold text-xl text-gray-900 dark:text-white">{score.awayScore}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {score.county} - {score.competition}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {score.timestamp?.toDate().toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 dark:text-gray-400 text-center">No live scores available at the moment.</p>
      )}
    </div>
  );
}