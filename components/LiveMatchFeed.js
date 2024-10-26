import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';

export default function LiveMatchFeed() {
  const [matches, setMatches] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dates, setDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateDates = () => {
      const today = new Date();
      const dateArray = [];
      // Show 7 days before and after current date
      for (let i = -7; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dateArray.push(date);
      }
      setDates(dateArray);
    };

    generateDates();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const countiesRef = collection(db, 'counties');
        const countiesSnapshot = await getDocs(countiesRef);

        let allMatches = [];

        for (const countyDoc of countiesSnapshot.docs) {
          const competitionsRef = collection(db, 'counties', countyDoc.id, 'competitions');
          const competitionsSnapshot = await getDocs(competitionsRef);

          for (const competitionDoc of competitionsSnapshot.docs) {
            const fixturesRef = collection(db, 'counties', countyDoc.id, 'competitions', competitionDoc.id, 'fixtures');
            
            // Get both fixtures and results for the selected date
            const fixturesSnapshot = await getDocs(fixturesRef);
            
            fixturesSnapshot.docs.forEach(doc => {
              const fixtureData = doc.data().details;
              const fixtureDate = fixtureData.date.toDate();
              
              // Check if month and day match, ignore year
              if (fixtureDate.getDate() === selectedDate.getDate() && 
                  fixtureDate.getMonth() === selectedDate.getMonth()) {
                allMatches.push({
                  id: doc.id,
                  county: countyDoc.id,
                  competitionId: competitionDoc.id,
                  competition: competitionDoc.data().name,
                  ...fixtureData,
                });
              }
            });
          }
        }

        // Sort matches: Scheduled first, then InProgress, then Completed
        allMatches.sort((a, b) => {
          const statusOrder = { 'Scheduled': 0, 'InProgress': 1, 'Completed': 2 };
          return statusOrder[a.status] - statusOrder[b.status] || 
                 a.time.localeCompare(b.time);
        });

        const groupedMatches = allMatches.reduce((acc, match) => {
          if (!acc[match.county]) {
            acc[match.county] = [];
          }
          acc[match.county].push(match);
          return acc;
        }, {});

        setMatches(groupedMatches);
      } catch (err) {
        console.error("Error fetching matches:", err);
        setError("An error occurred while fetching matches. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [selectedDate]);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short' 
    }).toUpperCase();
  };

  return (
    <div className="p-4 bg-gray-50">
      <h1 className="text-xl font-bold mb-4 text-gray-900">Matches</h1>
      
      {/* Date Selector - Optimized for mobile with more dates */}
      <div className="mb-4 -mx-4 px-4">
        <div className="overflow-x-auto">
          <div className="flex space-x-2 pb-2 min-w-max">
            {dates.map(date => (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap
                  ${selectedDate.toDateString() === date.toDateString() 
                    ? 'bg-green-500 text-white font-medium' 
                    : 'bg-white text-gray-700 border'}`}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <p className="text-gray-600">Loading matches...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      ) : Object.keys(matches).length === 0 ? (
        <div className="bg-white p-6 rounded-lg text-center">
          <p className="text-gray-600">No matches scheduled for this date.</p>
        </div>
      ) : (
        Object.entries(matches).map(([county, countyMatches]) => (
          <div key={county} className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-900 pl-1">{county}</h2>
            
            <div className="space-y-3">
              {countyMatches.map(match => (
                <Link 
                  key={match.id}
                  href={`/fixture/${county}/${match.competitionId}/${match.id}`}
                >
                  <div className="bg-white rounded-lg p-4 shadow-sm active:bg-gray-50">
                    {/* Competition Name */}
                    <div className="text-sm font-medium text-gray-600 mb-2">
                      {match.competition}
                    </div>
                    
                    {/* Teams and Scores */}
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex-1 text-left">
                        <span className="text-base font-semibold text-gray-900">
                          {match.homeTeam}
                        </span>
                        {match.officialResult && (
                          <span className="ml-2 font-medium text-gray-900">
                            {match.officialResult.homeScore.goals}-{match.officialResult.homeScore.points}
                          </span>
                        )}
                      </div>
                      <div className="px-3">
                        <span className="text-sm text-gray-500">vs</span>
                      </div>
                      <div className="flex-1 text-right">
                        <span className="text-base font-semibold text-gray-900">
                          {match.awayTeam}
                        </span>
                        {match.officialResult && (
                          <span className="mr-2 font-medium text-gray-900">
                            {match.officialResult.awayScore.goals}-{match.officialResult.awayScore.points}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Match Details */}
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <div>{match.venue}</div>
                      <div>{match.status === 'Completed' ? 'FT' : match.time}</div>
                    </div>

                    {/* Status Badge */}
                    <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${match.status === 'Completed' 
                        ? 'bg-green-100 text-green-800' 
                        : match.status === 'InProgress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {match.status}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}