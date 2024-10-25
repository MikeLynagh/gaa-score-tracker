import { db } from '../../../lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

export default async function handler(req, res) {
  const { fixtureId, county, competition } = req.query;
  
  if (req.method === "GET") {
    try {
      const scoresRef = collection(
        db, 
        'counties', 
        county, 
        'competitions', 
        competition, 
        'fixtures', 
        fixtureId, 
        'scores'
      );
      
      const q = query(scoresRef, orderBy('timestamp', 'desc'));
      const scoresSnap = await getDocs(q);
      
      const scores = scoresSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      res.json(scores);
    } catch (e) {
      res.status(500).json({error: e.message});
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not allowed`);
  }
}