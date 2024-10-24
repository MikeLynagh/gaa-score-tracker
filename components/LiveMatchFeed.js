import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
      for (let i = -3; i <= 3; i++) {
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
            
            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999);

            const q = query(
              fixturesRef,
              where('date', '>=', startOfDay),
              where('date', '<=', endOfDay)
            );

            const fixturesSnapshot = await getDocs(q);

            fixturesSnapshot.forEach(doc => {
              const fixtureData = doc.data();
              allMatches.push({
                id: doc.id,
                county: countyDoc.id,
                competition: competitionDoc.id,
                ...fixtureData,
              });
            });
          }
        }

        console.log("All matches:", allMatches);

        const groupedMatches = allMatches.reduce((acc, match) => {
          if (!acc[match.county]) {
            acc[match.county] = [];
          }
          acc[match.county].push(match);
          return acc;
        }, {});

        console.log("Grouped matches:", groupedMatches);
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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Matches</h1>
      
      <div className="mb-4 flex space-x-2 overflow-x-auto pb-2">
        {dates.map(date => (
          <button
            key={date.toISOString()}
            onClick={() => setSelectedDate(date)}
            className={`px-3 py-2 text-sm rounded-full flex-shrink-0 ${
              selectedDate.toDateString() === date.toDateString() 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {formatDate(date)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-center py-4">Loading matches...</p>
      ) : error ? (
        <p className="text-center py-4 text-red-500">{error}</p>
      ) : Object.keys(matches).length === 0 ? (
        <p className="text-center py-4">No matches scheduled for this date.</p>
      ) : (
        Object.entries(matches).map(([county, countyMatches]) => (
          <div key={county} className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{county}</h2>
            {countyMatches.map(match => (
              <div key={match.id} className="bg-white p-4 rounded-lg shadow mb-2">
                <p className="text-sm text-gray-600">{match.competition}</p>
                <p className="font-semibold">{match.homeTeam} vs {match.awayTeam}</p>
                <p className="text-sm text-gray-600">
                  {match.venue} | {new Date(match.date.seconds * 1000).toLocaleDateString()} | {match.time}
                </p>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}