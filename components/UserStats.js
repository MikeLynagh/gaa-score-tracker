import { useState, useEffect } from 'react';
import { getUserData } from './utils/userIncentives';

export default function UserStats() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserData(getUserData()); // Access localStorage only on the client
    }
  }, []);

  if (!userData) return null;

  return (
    <div className="bg-white shadow rounded-lg p-4 mt-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Stats</h2>
      <p className="text-gray-600">Points: {userData.points}</p>
      <p className="text-gray-600">Total Submissions: {userData.submissions}</p>
      {userData.badges.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Badges</h3>
          <ul className="list-disc list-inside">
            {userData.badges.map(badge => (
              <li key={badge} className="text-gray-600">{badge}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
