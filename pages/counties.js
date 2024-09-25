import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getCounties } from "../lib/firestoreUtils"

export default function Counties() {
  const [counties, setCounties] = useState([])

  useEffect(() => {
    async function fetchCounties(){
      const countiesList = await getCounties()
      setCounties(countiesList)
    }
    fetchCounties()
  }, [])


  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Counties</h1>
      <ul className="space-y-2">
        {counties.map(county => (
          <li key={county} className="bg-white shadow rounded-lg">
            <Link href={`/county/${county}`} className="block p-4 hover:bg-gray-50">
              {county}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}