import clientPromise from "@/lib/firebase";

export default async function handler(req, res){
    try {
        const client = await clientPromise
        const adminDb = clientdb().admin()
        const result = await adminDb.ping()
        res.status(200).json({message: "Successfully connected to MongoDB"})
    } catch (error){
        res.status(500).json({message: "Failed to connect to MongoDB",
        error: error.message, 
        stack: error.stack,
        topology: error.topology ? JSON.stringify(error.topology.description, null, 2) : 'No topology information'

    })
    }
}