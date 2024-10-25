import { db } from '../../lib/firebase';
import { collection, doc, setDoc, addDoc, Timestamp } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Received fixture data:', req.body);
    const fixture = req.body;
    
    // Format the competition ID
    const competitionId = fixture.competition.toLowerCase().replace(/\s+/g, '-');
    
    // Create county if it doesn't exist
    const countyRef = doc(db, 'counties', fixture.county);
    await setDoc(countyRef, { name: fixture.county }, { merge: true });
    
    // Create competition if it doesn't exist
    const competitionRef = doc(db, 'counties', fixture.county, 'competitions', competitionId);
    await setDoc(competitionRef, {
      name: fixture.competition,
      createdAt: Timestamp.now()
    }, { merge: true });
    
    // Add the fixture
    const fixturesRef = collection(db, 'counties', fixture.county, 'competitions', competitionId, 'fixtures');
    await addDoc(fixturesRef, {
      details: {
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
        venue: fixture.venue,
        date: new Date(fixture.date),
        time: fixture.time,
        status: 'Scheduled',
        source: 'hoganstand',
        lastUpdated: Timestamp.now()
      }
    });

    console.log('Successfully added fixture:', fixture.homeTeam, 'vs', fixture.awayTeam);
    res.status(200).json({ 
      message: 'Fixture added successfully',
      details: `${fixture.homeTeam} vs ${fixture.awayTeam}`
    });

  } catch (error) {
    console.error('Error adding fixture:', error);
    res.status(500).json({ 
      message: 'Error adding fixture', 
      error: error.message 
    });
  }
}