import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { google } from 'googleapis';

// Function to get data from your existing Google Sheet
export const getFixturesFromSheet = async (auth) => {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1BvTwy2AR5rBnWrBDTZM33WSVWduBrrbuIgHuzF3I1Fo';
    const range = 'Sheet1!A2:J';  // Adjust if your range is different

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    // Map the rows to your fixture format
    return response.data.values.map(row => ({
      date: row[0],
      county: row[1],
      competition: row[2],
      homeTeam: row[3],
      awayTeam: row[4],
      venue: row[5],
      time: row[6],
      status: 'Scheduled',
      reviewed: row[8] === 'TRUE'
    })).filter(fixture => fixture.reviewed);  // Only get reviewed fixtures
  } catch (error) {
    console.error('Error fetching fixtures from sheet:', error);
    throw error;
  }
};

// Import fixtures to Firestore with new structure
export const importFixturesToFirestore = async (fixturesData) => {
  try {
    // Track unique counties and competitions
    const countyCompetitions = new Map();

    // Organize the data
    fixturesData.forEach(fixture => {
      const { county, competition } = fixture;
      if (!countyCompetitions.has(county)) {
        countyCompetitions.set(county, new Set());
      }
      countyCompetitions.get(county).add(competition);
    });

    // Create structure
    for (const [county, competitions] of countyCompetitions) {
      // Create county
      const countyRef = doc(db, 'counties', county);
      await setDoc(countyRef, { name: county }, { merge: true });

      // Create competitions
      for (const competition of competitions) {
        const competitionId = competition.toLowerCase().replace(/\s+/g, '-');
        const competitionRef = doc(db, 'counties', county, 'competitions', competitionId);
        await setDoc(competitionRef, { 
          name: competition,
          createdAt: Timestamp.now()
        }, { merge: true });
      }
    }

    // Add fixtures
    for (const fixture of fixturesData) {
      const { 
        county, 
        competition, 
        homeTeam, 
        awayTeam, 
        venue, 
        date, 
        time 
      } = fixture;

      const competitionId = competition.toLowerCase().replace(/\s+/g, '-');
      const fixturesRef = collection(db, 'counties', county, 'competitions', competitionId, 'fixtures');

      // Check for duplicates
      const existingQuery = query(fixturesRef, 
        where('details.homeTeam', '==', homeTeam),
        where('details.awayTeam', '==', awayTeam),
        where('details.date', '==', new Date(date))
      );

      const existingDocs = await getDocs(existingQuery);
      
      if (existingDocs.empty) {
        await addDoc(fixturesRef, {
          details: {
            homeTeam,
            awayTeam,
            venue,
            date: new Date(date),
            time,
            status: 'Scheduled',
            source: 'hoganstand',
            lastUpdated: Timestamp.now()
          }
        });
        console.log(`Added: ${county} - ${homeTeam} vs ${awayTeam}`);
      } else {
        console.log(`Exists: ${county} - ${homeTeam} vs ${awayTeam}`);
      }
    }

    return true;
  } catch (error) {
    console.error('Error importing to Firestore:', error);
    throw error;
  }
};

// Main function to run the import
export const runImport = async (auth) => {
  try {
    console.log('Starting import...');
    const fixtures = await getFixturesFromSheet(auth);
    console.log(`Found ${fixtures.length} fixtures to import`);
    await importFixturesToFirestore(fixtures);
    console.log("retrieved fixtures", fixtures)
    console.log('Import complete!');
    return true;
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
};