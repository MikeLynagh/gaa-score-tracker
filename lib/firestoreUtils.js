import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';

// Get all counties
export const getCounties = async () => {
  const countiesSnapshot = await getDocs(collection(db, 'counties'));
  return countiesSnapshot.docs.map(doc => doc.id);
};

// Get fixtures for a county/competition
export const getFixturesForCompetition = async (countyName, competitionName) => {
  const fixturesRef = collection(db, 'counties', countyName, 'competitions', competitionName, 'fixtures');
  const fixturesSnapshot = await getDocs(fixturesRef);
  return fixturesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get a single fixture
export const getFixture = async (countyName, competitionName, fixtureId) => {
  const fixtureRef = doc(db, 'counties', countyName, 'competitions', competitionName, 'fixtures', fixtureId);
  const fixtureSnap = await getDoc(fixtureRef);
  return fixtureSnap.exists() ? { id: fixtureSnap.id, ...fixtureSnap.data() } : null;
};

// Add a new fixture
export const addFixture = async (county, competition, fixtureData) => {
  try {
    const fixturesRef = collection(db, 'counties', county, 'competitions', competition, 'fixtures');
    const docRef = await addDoc(fixturesRef, {
      details: {
        ...fixtureData,
        source: 'manual',
        lastUpdated: Timestamp.now(),
        status: 'Scheduled'
      }
    });
    console.log("Fixture added with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding fixture: ", error);
    throw error;
  }
};

// Add a score update
export const addScoreUpdate = async (countyName, competitionName, fixtureId, scoreData) => {
  try {
    const scoresRef = collection(db, 'counties', countyName, 'competitions', competitionName, 'fixtures', fixtureId, 'scores');
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
    
    // Update fixture status if needed
    const fixtureRef = doc(db, 'counties', countyName, 'competitions', competitionName, 'fixtures', fixtureId);
    await updateDoc(fixtureRef, {
      'details.status': 'InProgress',
      'details.lastUpdated': Timestamp.now()
    });

    return docRef.id;
  } catch (error) {
    console.error("Error adding score update: ", error);
    throw error;
  }
};

// Add official result
export const addOfficialResult = async (countyName, competitionName, fixtureId, resultData) => {
  try {
    const fixtureRef = doc(db, 'counties', countyName, 'competitions', competitionName, 'fixtures', fixtureId);
    await updateDoc(fixtureRef, {
      'details.status': 'Completed',
      'details.lastUpdated': Timestamp.now(),
      'officialResult': {
        teamA: {
          goals: resultData.teamA.goals,
          points: resultData.teamA.points
        },
        teamB: {
          goals: resultData.teamB.goals,
          points: resultData.teamB.points
        },
        timestamp: Timestamp.now(),
        source: 'hoganstand'
      }
    });
  } catch (error) {
    console.error("Error adding official result: ", error);
    throw error;
  }
};

// Get score updates for a fixture
export const getScoreUpdates = async (countyName, competitionName, fixtureId) => {
  try {
    const scoresRef = collection(db, 'counties', countyName, 'competitions', competitionName, 'fixtures', fixtureId, 'scores');
    const scoresSnapshot = await getDocs(scoresRef);
    
    // Get the fixture document to check for official result
    const fixtureRef = doc(db, 'counties', countyName, 'competitions', competitionName, 'fixtures', fixtureId);
    const fixtureSnap = await getDoc(fixtureRef);
    const fixtureData = fixtureSnap.data();

    let scores = scoresSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      type: 'update'
    }));

    // Add official result if it exists
    if (fixtureData?.officialResult) {
      scores.push({
        ...fixtureData.officialResult,
        type: 'official'
      });
    }

    // Sort by timestamp
    return scores.sort((a, b) => a.timestamp.seconds - b.timestamp.seconds);
  } catch (error) {
    console.error("Error getting score updates: ", error);
    throw error;
  }
};

// Get upcoming fixtures (next 10 days)
export const getUpcomingFixtures = async () => {
  const counties = await getCounties();
  const upcomingFixtures = [];
  const tenDaysFromNow = new Date();
  tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);

  for (const county of counties) {
    const competitions = await getDocs(collection(db, 'counties', county, 'competitions'));
    
    for (const competition of competitions.docs) {
      const fixturesRef = collection(db, 'counties', county, 'competitions', competition.id, 'fixtures');
      const q = query(fixturesRef, 
        where('details.date', '<=', tenDaysFromNow),
        where('details.status', '==', 'Scheduled')
      );
      
      const fixtures = await getDocs(q);
      upcomingFixtures.push(...fixtures.docs.map(doc => ({
        id: doc.id,
        county,
        competition: competition.id,
        ...doc.data()
      })));
    }
  }

  return upcomingFixtures.sort((a, b) => a.details.date.seconds - b.details.date.seconds);
};