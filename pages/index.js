import Link from 'next/link'
import { useEffect, useState, useRef, useCallback } from 'react'

export default function Home() {
  const [counties, setCounties] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  
  const observer = useRef()
  const lastCountyElementRef = useCallback(node => {
    if (isLoading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1)
      }
    })
    if (node) observer.current.observe(node)
  }, [isLoading, hasMore])

  useEffect(() => {
    setIsLoading(true)
    // Fetch counties data (mock implementation)
    const fetchCounties = async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockCounties = [
        'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry',
        'Donegal', 'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare',
        'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo',
        'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary',
        'Tyrone', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
      ]
      
      const newCounties = mockCounties.slice((page - 1) * 10, page * 10)
      setCounties(prevCounties => [...prevCounties, ...newCounties])
      setHasMore(newCounties.length > 0)
      setIsLoading(false)
    }

    fetchCounties()
  }, [page])

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Club Championship Scores</h1>
        <p className="text-gray-600 mb-4">
          Your community-driven platform for real-time GAA club scores and updates.
        </p>
        <div className="bg-gray-100 border-l-4 border-gray-500 text-gray-700 p-4 mb-4" role="alert">
          <p className="font-bold">Join the community!</p>
          <p>Share live scores, discuss matches, and stay up-to-date on all GAA club action.</p>
        </div>
      </section>

      <section className="mb-8">
        <Link href="/feed" className="block w-full bg-gray-800 text-white py-3 px-4 rounded text-center font-semibold">
          View Live Score Feed
        </Link>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">Select a County</h2>
        <ul className="space-y-2 mb-8">
          {counties.map((county, index) => {
            if (counties.length === index + 1) {
              return (
                <li key={county} ref={lastCountyElementRef} className="bg-white shadow rounded-lg">
                  <Link href={`/county/${county}`} className="block p-4 hover:bg-gray-50">
                    <span className='text-gray-900 font-medium'>{county}</span>
                  </Link>
                </li>
              )
            } else {
              return (
                <li key={county} className="bg-white shadow rounded-lg">
                  <Link href={`/county/${county}`} className="block p-4 hover:bg-gray-50">
                    <span className='text-gray-800 font-medium'>{county}</span>
                  </Link>
                </li>
              )
            }
          })}
        </ul>
        {isLoading && <p className="text-center">Loading more counties...</p>}
        {!hasMore && <p className="text-center">No more counties to load</p>}
      </section>
    </div>
  )
}