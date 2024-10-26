import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { db } from '../../../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { getFixtureWithScores, addScoreUpdate } from '../../../../lib/firestoreUtils';
import PlayInput from '../../../../components/PlayInput';
import ScoreDisplay from '../../../../components/ScoreDisplay';

export default function Fixture() {
  const router = useRouter();
  const { county, competitionId, id } = router.query;
  const [fixture, setFixture] = useState(null);
  const [scoreUpdates, setScoreUpdates] = useState([]);
  const [currentScore, setCurrentScore] = useState({ 
    teamA: { goals: 0, points: 0 }, 
    teamB: { goals: 0, points: 0 } 
  });
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to fixture details
  useEffect(() => {
    if (!county || !competitionId || !id) return;

    const fixtureRef = doc(db, 'counties', county, 'competitions', competitionId, 'fixtures', id);
    const unsubFixture = onSnapshot(fixtureRef, (doc) => {
      if (doc.exists()) {
        setFixture({
          id: doc.id,
          ...doc.data().details,
          competitionName: doc.data().competitionName
        });
      }
    });

    return () => unsubFixture();
  }, [county, competitionId, id]);

  // Subscribe to score updates
  useEffect(() => {
    if (!county || !competitionId || !id) return;

    const scoresRef = collection(db, 'counties', county, 'competitions', competitionId, 'fixtures', id, 'scores');
    const scoresQuery = query(scoresRef, orderBy('timestamp', 'desc'));

    const unsubScores = onSnapshot(scoresQuery, (snapshot) => {

      // deduplicate scores based on timestamp and values
      const uniqueScores = snapshot.docs.reduce((acc, doc) => {
        const scoreData = doc.data()
        const key = `${scoreData.timestamp.seconds}-${scoreData.teamA.goals}-${scoreData.teamA.points}-${scoreData.teamB.goals}-${scoreData.teamB.points}`;

        if(!acc[key]){
          acc[key] = {
            id: doc.id,
            ...scoreData
          }
        }
        return acc
      }, {})


      const updates = Object.values(uniqueScores)
      setScoreUpdates(updates)

      if (updates.length > 0){
        setCurrentScore(updates[0])
      }
      setIsLoading(false)
    })
    
    return () => unsubScores();
  }, [county, competitionId, id]);

  const handleScoreUpdate = async (newScore) => {
    try {
      await addScoreUpdate(county, competitionId, id, newScore);
      // No need to manually update state as onSnapshot will handle it
    } catch (error) {
      console.error("Error submitting score:", error);
      // Handle error (maybe show notification)
      alert("Error submitting score")
    }
  };

  const formatScore = (team) => {
    if (!currentScore[team]) return '0-0';
    return `${currentScore[team].goals}-${currentScore[team].points}`;
  };

  const calculateTotalScore = (team) => {
    if (!currentScore[team]) return 0;
    return (currentScore[team].goals * 3) + currentScore[team].points;
  };

  if (!fixture || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Loading match details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4 text-center text-gray-800">
        {fixture.competitionName || "Club Championship"}
      </h1>

      <ScoreDisplay 
        teamA={fixture.homeTeam}
        teamB={fixture.awayTeam}
        currentScore={currentScore}
        calculateTotalScore={calculateTotalScore}
        formatScore={formatScore}
        status={fixture.status || "Scheduled"}
        date={fixture.date ? new Date(fixture.date.seconds * 1000).toLocaleDateString() : "Date TBA"}
        time={fixture.time || "Time TBA"}
      />

      <PlayInput 
        fixtureId={id}
        county={county}
        competition={competitionId}
        currentScore={currentScore}
        onScoreUpdate={handleScoreUpdate}
      />

      {scoreUpdates.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Updates</h3>
          <ul className="space-y-2">
            {scoreUpdates.map(update => (
              <li key={update.id} className="bg-white p-2 rounded shadow">
                <p className="text-sm font-medium text-gray-800">
                  {update.teamA.goals}-{update.teamA.points} to {update.teamB.goals}-{update.teamB.points}
                </p>
                <span className="text-xs text-gray-500">
                  {update.timestamp?.toDate().toLocaleString() || "No timestamp"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}