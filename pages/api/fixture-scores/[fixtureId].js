// pages/api/fixture-scores/[fixtureId].js
import { db } from '../../../lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { fixtureId, county, competition } = req.query;
      const scoresRef = collection(db, 'counties', county, 'competitions', competition, 'fixtures', fixtureId, 'scores');
      const q = query(scoresRef, orderBy('timestamp', 'desc'));
      const scoresSnap = await getDocs(q);
      
      const scores = scoresSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      res.status(200).json(scores);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch fixture scores' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}