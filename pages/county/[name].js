import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getFixturesForCounty } from '../../lib/firestoreUtils';

export default function County() {
  const router = useRouter();
  const { name } = router.query;
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFixtures() {
      if (name) {
        try {
          setLoading(true);
          const fixturesList = await getFixturesForCounty(name);
          setFixtures(fixturesList);
        } catch (error) {
          console.error("Error fetching fixtures:", error);
          setError("Failed to load fixtures. Please try again later.");
        } finally {
          setLoading(false);
        }
      }
    }
    fetchFixtures();
  }, [name]);

  if (!name) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading fixtures...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 text-center">{error}</div>;
  }

  const formatDate = (date) => {
    if (date && date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }
    return 'TBA';
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">{name} Fixtures</h1>
      {fixtures.length > 0 ? (
        <ul className="space-y-6">
          {fixtures.map(fixture => (
            <li key={fixture.id} className="bg-white shadow border-b p-4 rounded-lg overflow-hidden">
              <Link href={`/fixture/${name}/${fixture.competitionId}/${fixture.id}`}>
  <div className="flex flex-col gap-2">
    <div className="text-sm font-medium text-gray-600">{fixture.competitionName}</div>
    <div className="flex justify-between items-center mb-2">
      <span className="font-semibold text-gray-900">{fixture.homeTeam}</span>
      <span className="text-sm text-gray-500">vs</span>
      <span className="font-semibold text-gray-900">{fixture.awayTeam}</span>
    </div>
    <div className="text-sm text-gray-600">
      <div>Date: {formatDate(fixture.date)}</div>
      <div>Venue: {fixture.venue || 'TBA'}</div>
      <div>Time: {fixture.time || 'TBA'}</div>
    </div>
  </div>
</Link>

            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-600">No fixtures found for {name}.</p>
      )}
    </div>
  );
}