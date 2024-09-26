import Link from 'next/link'
import { useEffect, useState, useRef, useCallback } from 'react'
import UserStats from '@/components/UserStats'

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
        "Dublin", "Galway", "Kerry", "Mayo"
      ]
      
      const newCounties = mockCounties.slice((page - 1) * 10, page * 10)
      setCounties(prevCounties => [...prevCounties, ...newCounties])
      setHasMore(newCounties.length > 0)
      setIsLoading(false)
    }
    fetchCounties()
  }, [page])

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Club Championship Scores</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Your community-driven platform for real-time GAA club scores and updates.
        </p>
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
          <p className="font-bold">Join the community!</p>
          <p>Share live scores, discuss matches, and stay up-to-date on all GAA club action.</p>
        </div>
      </section>

      <section>
        <Link href="/live" className="block w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded text-center font-semibold transition duration-150 ease-in-out">
          View Live Score Feed
        </Link>
      </section>
      <section>
        <UserStats />
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Select a County</h2>
        <ul className="space-y-2">
          {counties.map((county, index) => (
            <li 
              key={county} 
              ref={counties.length === index + 1 ? lastCountyElementRef : null}
              className="bg-white dark:bg-gray-800 shadow hover:shadow-md rounded-lg transition duration-150 ease-in-out"
            >
              <Link href={`/county/${county}`} className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <span className='text-gray-900 dark:text-white font-medium'>{county}</span>
              </Link>
            </li>
          ))}
        </ul>
        {isLoading && <p className="text-center text-gray-600 dark:text-gray-400">Loading more counties...</p>}
        {!hasMore && <p className="text-center text-gray-600 dark:text-gray-400">No more counties to load</p>}
      </section>
    </div>
  )
}