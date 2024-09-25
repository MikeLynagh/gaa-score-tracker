import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, collectionGroup, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function LiveScoreFeed() {
  const [liveScores, setLiveScores] = useState([]);

  useEffect(() => {
    const scoresQuery = query(
      collectionGroup(db, 'scores'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(scoresQuery, async (querySnapshot) => {
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
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Latest Scores</h2>
      {liveScores.length > 0 ? (
        <ul className="space-y-4">
          {liveScores.map((score) => (
            <li key={score.id} className="border-b pb-2 dark:border-gray-700">
              <p className="font-semibold dark:text-white">{score.homeTeam} vs {score.awayTeam}</p>
              <p className="dark:text-gray-300">{score.homeScore} - {score.awayScore}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {score.county} - {score.competition}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {score.timestamp?.toDate().toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="dark:text-gray-300">No live scores available at the moment.</p>
      )}
    </div>
  );
}