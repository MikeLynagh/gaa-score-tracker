import { getFixtureScores } from '../../../lib/firebase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { fixtureId } = req.query;
      const scores = await getFixtureScores(fixtureId);
      res.status(200).json(scores);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch fixture scores' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}