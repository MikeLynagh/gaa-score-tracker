import { db } from '../../lib/firebase';
import { collection, doc, setDoc, addDoc, Timestamp } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const result = req.body;
    // Create competition ID from competition name
    const competitionId = result.competition.toLowerCase().replace(/\s+/g, '-');

    // Reference to fixtures collection
    const fixturesRef = collection(
      db, 
      'counties', 
      result.county, 
      'competitions', 
      competitionId, 
      'fixtures'
    );

    // Add as a new fixture with Completed status
    await addDoc(fixturesRef, {
      details: {
        homeTeam: result.home_team,
        awayTeam: result.away_team,
        venue: result.venue,
        date: new Date(result.date),
        time: 'FT',
        status: 'Completed',
        source: 'hoganstand',
        lastUpdated: Timestamp.now(),
        officialResult: {
          homeScore: {
            goals: result.home_score.goals,
            points: result.home_score.points
          },
          awayScore: {
            goals: result.away_score.goals,
            points: result.away_score.points
          },
          timestamp: Timestamp.now()
        }
      }
    });

    // Ensure competition exists
    const competitionRef = doc(db, 'counties', result.county, 'competitions', competitionId);
    await setDoc(competitionRef, {
      name: result.competition,
      lastUpdated: Timestamp.now()
    }, { merge: true });

    res.status(200).json({ 
      message: 'Result added successfully',
      details: `${result.home_team} vs ${result.away_team}`
    });

  } catch (error) {
    console.error('Error adding result:', error);
    res.status(500).json({ 
      message: 'Error adding result', 
      error: error.message 
    });
  }
}