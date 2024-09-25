import { submitScore } from '../../lib/firebase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { fixtureId, teamAScore, teamBScore } = req.body;
      await submitScore(fixtureId, teamAScore, teamBScore);
      res.status(200).json({ message: 'Score submitted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit score' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}