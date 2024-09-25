require("dotenv").config({path: ".env.local"});

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK
const serviceAccount = require('./firestoreservice_matchscore.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

async function initializeFirestore() {
  const counties = ['Mayo', 'Galway', 'Dublin', 'Kerry'];

  for (const county of counties) {
    try {
      console.log(`Attempting to add county: ${county}`);
      await db.collection('counties').doc(county).set({ name: county });
      console.log(`Successfully added county: ${county}`);
      
      // If the county is Mayo, add more detailed data
      if (county === 'Mayo') {
        await addMayoDetails();
      }
    } catch (error) {
      console.error(`Error adding county ${county}:`, error);
    }
  }

  console.log('Firestore initialization attempt complete');
}

async function addMayoDetails() {
  const mayoRef = db.collection('counties').doc('Mayo');

  // Add competitions
  const competitionsRef = mayoRef.collection('competitions');
  await competitionsRef.doc('senior-football-championship').set({
    name: "Mayo Senior Football Championship",
    year: 2024
  });

  // Add clubs
  const clubsRef = mayoRef.collection('clubs');
  await clubsRef.doc('castlebar-mitchels').set({
    name: "Castlebar Mitchels",
    level: "senior"
  });
  await clubsRef.doc('westport').set({
    name: "Westport",
    level: "senior"
  });

  // Add a sample fixture
  const fixturesRef = competitionsRef.doc('senior-football-championship').collection('fixtures');
  await fixturesRef.add({
    homeTeam: "Castlebar Mitchels",
    awayTeam: "Westport",
    date: admin.firestore.Timestamp.fromDate(new Date("2024-05-15")),
    venue: "MacHale Park",
    status: "scheduled"
  });

  console.log("Mayo details added successfully");
}

// Run the initialization
initializeFirestore().then(() => {
  console.log('Initialization complete');
  process.exit(0);
}).catch((error) => {
  console.error('Initialization failed:', error);
  process.exit(1);
});