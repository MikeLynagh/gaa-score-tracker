// pages/api/fixtures/[id].js
import { db } from '../../../lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  const { id, county, competition } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        const fixtureRef = doc(db, 'counties', county, 'competitions', competition, 'fixtures', id);
        const fixtureSnap = await getDoc(fixtureRef);
        
        if (!fixtureSnap.exists()) {
          res.status(404).json({ error: 'Fixture not found' });
        } else {
          res.json({ id: fixtureSnap.id, ...fixtureSnap.data() });
        }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
      break;

    case 'PUT':
      try {
        const fixtureRef = doc(db, 'counties', county, 'competitions', competition, 'fixtures', id);
        await updateDoc(fixtureRef, {
          details: req.body
        });
        res.json({ success: true });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}