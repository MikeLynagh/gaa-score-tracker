import clientPromise from "@/lib/firebase";

export default async function handler(req, res){
    const client = await clientPromise
    const db = client.db("gaa_scores")
    const { fixtureId } = req.query

    if (req.method === "GET"){

        try {
            const scores = await db.collection("scores")
            .find({fixtureId: fixtureId})
            .sort({timestamp: -1})
            .toArray()
            res.json(scores)
        } catch (e) {
            res.status(500).json({error: e.message})
        }
    } else {
        res.setHeader("Allow", ["GET"])
        res.status(405).end(`Method ${req.method} Not allowed`)
    }
}