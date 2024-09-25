import clientPromise from '../../../lib/firebase'

export default async function handler(req, res) {
  const client = await clientPromise
  const db = client.db("gaa_scores")

  switch (req.method) {
    case 'GET':
      try {
        const fixtures = await db.collection("fixtures").find({}).toArray()
        res.json(fixtures)
      } catch (e) {
        res.status(500).json({ error: e.message })
      }
      break

    case 'POST':
      try {
        const newFixture = req.body
        const result = await db.collection("fixtures").insertOne(newFixture)
        res.status(201).json(result)
      } catch (e) {
        res.status(500).json({ error: e.message })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}