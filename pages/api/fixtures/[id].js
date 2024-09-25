import clientPromise from '../../../lib/firebase'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const client = await clientPromise
  const db = client.db("gaa_scores")
  const { id } = req.query

  switch (req.method) {
    case 'GET':
      try {
        const fixture = await db.collection("fixtures").findOne({ _id: ObjectId(id) })
        if (!fixture) {
          res.status(404).json({ error: 'Fixture not found' })
        } else {
          res.json(fixture)
        }
      } catch (e) {
        res.status(500).json({ error: e.message })
      }
      break

    case 'PUT':
      try {
        const result = await db.collection("fixtures").updateOne(
          { _id: ObjectId(id) },
          { $set: req.body }
        )
        res.json(result)
      } catch (e) {
        res.status(500).json({ error: e.message })
      }
      break

    case 'DELETE':
      try {
        const result = await db.collection("fixtures").deleteOne({ _id: ObjectId(id) })
        res.json(result)
      } catch (e) {
        res.status(500).json({ error: e.message })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}