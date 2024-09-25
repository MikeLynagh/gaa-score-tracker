import { db } from './firebase';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';

// Get all counties
export const getCounties = async () => {
  const countiesSnapshot = await getDocs(collection(db, 'counties'));
  return countiesSnapshot.docs.map(doc => doc.id);
};

// Get fixtures for a county
export const getFixturesForCounty = async (countyName) => {
  const fixturesRef = collection(db, 'counties', countyName, 'fixtures');
  const fixturesSnapshot = await getDocs(fixturesRef);
  return fixturesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get a single fixture
export const getFixture = async (countyName, fixtureId) => {
  const fixtureRef = doc(db, 'counties', countyName, 'fixtures', fixtureId);
  const fixtureSnap = await getDoc(fixtureRef);
  return fixtureSnap.exists() ? { id: fixtureSnap.id, ...fixtureSnap.data() } : null;
};

// Add a new fixture
export const addFixture = async (county, competition, fixtureData) => {
  try {
    const fixturesRef = collection(db, 'counties', county, 'competitions', competition, 'fixtures');
    const docRef = await addDoc(fixturesRef, {
      ...fixtureData,
      createdAt: new Date()
    });
    console.log("Fixture added with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding fixture: ", error);
    throw error;
  }
};

// Add a score update
export const addScoreUpdate = async (countyName, fixtureId, scoreData) => {
  const scoresRef = collection(db, 'counties', countyName, 'fixtures', fixtureId, 'scores');
  return await addDoc(scoresRef, { ...scoreData, timestamp: new Date() });
};

// Get score updates for a fixture
export const getScoreUpdates = async (countyName, fixtureId) => {
  const scoresRef = collection(db, 'counties', countyName, 'fixtures', fixtureId, 'scores');
  const scoresSnapshot = await getDocs(scoresRef);
  return scoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// add teams 
export const addTeam = async (teamData) => {
  try{
    const teamsRef = collection(db, "teams")
    const docRef = await addDoc(teamsRef, teamData)
    console.log("Team added with id", docRef.id)
    return docRef.id
  } catch (error){
    console.error("Error adding team: ", error)
    throw error;
  }
}

export const getTeams = async (county = null) => {
  try {
    const teamsRef = collection(db, "teams")
    let q = teamsRef
    if (county){
      q = query(teamsRef, where("county", "==", county))
    }
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data() }))
  } catch (error){
    console.error("Error getting teams: ", error)
    throw error;
  }
}