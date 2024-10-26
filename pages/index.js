import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUpcomingFixtures } from '../lib/firestoreUtils';

export default function Home() {
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUpcomingMatches() {
      const fixtures = await getUpcomingFixtures();
      setUpcomingMatches(fixtures);
      setLoading(false);
    }
    fetchUpcomingMatches();
  }, []);

  return (
    <div className="px-4 py-6">
      {/* Hero Section - Simplified for mobile */}
      <section className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          GAA Club Scores
        </h1>
        <p className="text-base text-gray-600 mb-4">
          Your Community Drive Platform for Real-time GAA club scores and updates
        </p>
        <Link 
          href="/live" 
          className="block w-full bg-green-500 text-white text-center font-medium rounded-lg py-3 px-4 hover:bg-green-600 active:bg-green-700"
        >
          View Live Scores
        </Link>
      </section>

      {/* Quick Access Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href="/counties" 
          className="bg-white rounded-lg p-4 shadow-sm active:bg-gray-50">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900">Counties</h2>
            <p className="text-sm text-gray-600">Find fixtures</p>
          </div>
        </Link>
        <Link href="/live" 
          className="bg-white rounded-lg p-4 shadow-sm active:bg-gray-50">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900">Today's Games</h2>
            <p className="text-sm text-gray-600">Live scores</p>
          </div>
        </Link>
      </div>

      {/* Today's Matches */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Today's Matches</h2>
        {loading ? (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-600 text-center">Loading matches...</p>
          </div>
        ) : upcomingMatches.length > 0 ? (
          <div className="space-y-3">
            {upcomingMatches.slice(0, 3).map(match => (
              <Link 
                key={match.id} 
                href={`/fixture/${match.county}/${match.competitionId}/${match.id}`}
              >
                <div className="bg-white rounded-lg p-4 shadow-sm active:bg-gray-50">
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {match.competition}
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-900">{match.homeTeam}</span>
                    <span className="text-sm text-gray-500 px-2">vs</span>
                    <span className="font-medium text-gray-900">{match.awayTeam}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {match.venue} • {match.time}
                  </div>
                </div>
              </Link>
            ))}
            <Link href="/matches" 
              className="block text-center text-green-600 py-2 font-medium">
              See All Matches →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-600 text-center">No matches scheduled</p>
          </div>
        )}
      </section>

      {/* User Stats - Compact for mobile */}
      <section className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Stats</h2>
        <div className="flex justify-around mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">50</p>
            <p className="text-sm text-gray-600">Points</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">3</p>
            <p className="text-sm text-gray-600">Updates</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Your Badge</p>
          <p className="text-base text-gray-900">Junior B commitment</p>
        </div>
      </section>
    </div>
  );
}