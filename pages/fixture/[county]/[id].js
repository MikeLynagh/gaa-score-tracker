import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { db } from '../../../lib/firebase';
import { doc, getDoc, collection, addDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import PlayInput from '../../../components/PlayInput';
import ScoreDisplay from '../../../components/ScoreDisplay';

export default function Fixture() {
  const router = useRouter();
  const { county, id } = router.query;
  const [fixture, setFixture] = useState(null);
  const [scoreUpdates, setScoreUpdates] = useState([]);
  const [currentScore, setCurrentScore] = useState({ 
    teamA: { goals: 0, points: 0 }, 
    teamB: { goals: 0, points: 0 } 
  });
  const [lastAddedScore, setLastAddedScore] = useState(null);

  useEffect(() => {
    async function fetchFixture() {
      if (county && id) {
        const fixtureRef = doc(db, 'counties', county, 'competitions', 'senior-football-championship', 'fixtures', id);
        const fixtureSnap = await getDoc(fixtureRef);
        if (fixtureSnap.exists()) {
          setFixture({ id: fixtureSnap.id, ...fixtureSnap.data() });
        } else {
          console.error("Fixture not found");
        }
      }
    }

    fetchFixture();
  }, [county, id]);

  useEffect(() => {
    if (county && id) {
      const scoresRef = collection(db, 'counties', county, 'competitions', 'senior-football-championship', 'fixtures', id, 'scores');
      const q = query(scoresRef, orderBy('timestamp', 'desc'), limit(10));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const updates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Only update if the new score is different from the last added score
        setScoreUpdates(updates)
        if(updates.length > 0){
          setCurrentScore(updates[0])
        }
      });

      return () => unsubscribe();
    }
  }, [county, id]);

  const handleScoreUpdate = async (newScore) => {
    if (county && id) {
      const scoresRef = collection(db, 'counties', county, 'competitions', 'senior-football-championship', 'fixtures', id, 'scores');
      try{
        await addDoc(scoresRef, {
          ...newScore, 
          timestamp: new Date(),
          submittedBy: "anonymous"
        });

      } catch (error){
        console.error("Error submitting score", error)
      }
    }
  };

  const formatScore = (team) => {
    return `${currentScore[team].goals}-${currentScore[team].points}`;
  };

  const calculateTotalScore = (team) => {
    return currentScore[team].goals * 3 + currentScore[team].points;
  };

  if (!fixture) return <div>Loading...</div>;

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4 text-center text-gray-800">{fixture.competition || "Club Football Championship"}</h1>
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
        competition={competition}
        currentScore={currentScore} 
        onScoreUpdate={handleScoreUpdate} 
      />
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Score Updates</h3>
        {scoreUpdates.length > 0 ? (
          <ul className="space-y-2">
            {scoreUpdates.map(update => (
              <li key={update.id} className="bg-white p-2 rounded shadow">
                <p className='text-sm font-medium text-gray-800'>
                  {update.teamA.goals}-{update.teamA.points} to {update.teamB.goals}-{update.teamB.points} 
                </p>
                <span className="text-xs text-gray-500">
                  {update.timestamp && update.timestamp.toDate ? update.timestamp.toDate().toLocaleString() : "No timestamp available"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No score updates yet.</p>
        )}
      </div>
    </div>
  );
}