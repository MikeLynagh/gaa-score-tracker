import { collection, addDoc, getDocs, query } from 'firebase/firestore';
import { db } from './firebase';

export const addTeam = async (countyName, teamData) => {
  try {
    const clubsRef = collection(db, 'counties', countyName, 'clubs');
    const docRef = await addDoc(clubsRef, teamData);
    console.log("Team added with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding team: ", error);
    throw error;
  }
};

export const getTeams = async (countyName) => {
  try {
    const clubsRef = collection(db, 'counties', countyName, 'clubs');
    const snapshot = await getDocs(clubsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting teams: ", error);
    throw error;
  }
};