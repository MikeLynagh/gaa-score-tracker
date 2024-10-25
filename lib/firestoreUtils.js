import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where,
  Timestamp,
  orderBy 
} from 'firebase/firestore';

// Get all counties (unchanged)
export const getCounties = async () => {
  const countiesSnapshot = await getDocs(collection(db, 'counties'));
  return countiesSnapshot.docs.map(doc => doc.id);
};

// Updated to get fixtures from all competitions for a county
export const getFixturesForCounty = async (countyName) => {
  const fixtures = [];
  
  // Get all competitions for the county
  const competitionsRef = collection(db, 'counties', countyName, 'competitions');
  const competitionsSnapshot = await getDocs(competitionsRef);
  
  // For each competition, get its fixtures
  for (const competitionDoc of competitionsSnapshot.docs) {
    const fixturesRef = collection(db, 'counties', countyName, 'competitions', competitionDoc.id, 'fixtures');
    const fixturesSnapshot = await getDocs(fixturesRef);
    
    fixtures.push(...fixturesSnapshot.docs.map(doc => ({
      id: doc.id,
      competitionId: competitionDoc.id,
      competitionName: competitionDoc.data().name,
      ...doc.data().details
    })));
  }
  
  // Sort by date
  return fixtures.sort((a, b) => a.date.seconds - b.date.seconds);
};

// Get a single fixture
export const getFixture = async (countyName, competitionId, fixtureId) => {
  const fixtureRef = doc(db, 'counties', countyName, 'competitions', competitionId, 'fixtures', fixtureId);
  const fixtureSnap = await getDoc(fixtureRef);
  
  if (!fixtureSnap.exists()) return null;
  
  // Get competition details too
  const competitionRef = doc(db, 'counties', countyName, 'competitions', competitionId);
  const competitionSnap = await getDoc(competitionRef);
  
  return {
    id: fixtureSnap.id,
    competitionId,
    competitionName: competitionSnap.data().name,
    ...fixtureSnap.data().details
  };
};

// Add score update
export const addScoreUpdate = async (countyName, competitionId, fixtureId, scoreData) => {
  try {
    const scoresRef = collection(db, 'counties', countyName, 'competitions', competitionId, 'fixtures', fixtureId, 'scores');
    
    const docRef = await addDoc(scoresRef, {
      teamA: {
        goals: scoreData.teamA.goals,
        points: scoreData.teamA.points
      },
      teamB: {
        goals: scoreData.teamB.goals,
        points: scoreData.teamB.points
      },
      timestamp: Timestamp.now(),
      submittedBy: scoreData.submittedBy || 'anonymous'
    });

    // Update fixture status
    const fixtureRef = doc(db, 'counties', countyName, 'competitions', competitionId, 'fixtures', fixtureId);
    await updateDoc(fixtureRef, {
      'details.status': 'InProgress',
      'details.lastUpdated': Timestamp.now()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding score:', error);
    throw error;
  }
};

// Get score updates for a fixture
export const getScoreUpdates = async (countyName, competitionId, fixtureId) => {
  try {
    const scoresRef = collection(db, 'counties', countyName, 'competitions', competitionId, 'fixtures', fixtureId, 'scores');
    const q = query(scoresRef, orderBy('timestamp', 'desc'));
    const scoresSnapshot = await getDocs(q);
    
    return scoresSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting scores:', error);
    throw error;
  }
};

// Get upcoming fixtures (next 7 days)
export const getUpcomingFixtures = async () => {
  const counties = await getCounties();
  const upcomingFixtures = [];
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  for (const county of counties) {
    const fixtures = await getFixturesForCounty(county);
    upcomingFixtures.push(...fixtures.filter(fixture => {
      const fixtureDate = fixture.date.toDate();
      return fixtureDate >= now && fixtureDate <= sevenDaysFromNow;
    }));
  }

  return upcomingFixtures.sort((a, b) => a.date.seconds - b.date.seconds);
};