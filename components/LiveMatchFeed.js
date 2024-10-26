import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
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
            
            // Adjust date comparison for selected date
            const selectedDateStart = new Date(selectedDate);
            selectedDateStart.setHours(0, 0, 0, 0);
            const selectedDateEnd = new Date(selectedDate);
            selectedDateEnd.setHours(23, 59, 59, 999);
  
            // Update query to match date regardless of year
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

  const formatScore = (score) => {
    if (!score) return '';
    return `${score.teamA.goals}-${score.teamA.points} to ${score.teamB.goals}-${score.teamB.points}`;
  };

  return (
    <div className="p-4 bg-gray-50">
      <h1 className="text-xl font-bold mb-4 text-gray-900">Matches</h1>
      
      {/* Date Selector - Optimized for touch */}
      <div className="mb-4 -mx-4 px-4 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {dates.map(date => (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`h-10 px-4 rounded-full text-base flex items-center justify-center
                ${selectedDate.toDateString() === date.toDateString() 
                  ? 'bg-green-500 text-white font-medium' 
                  : 'bg-white text-gray-700 border'}`}
            >
              {formatDate(date)}
            </button>
          ))}
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
            {/* County Header */}
            <h2 className="text-lg font-semibold mb-3 text-gray-900 pl-1">{county}</h2>
            
            {/* Matches List */}
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
                    
                    {/* Teams */}
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex-1 text-left">
                        <span className="text-base font-semibold text-gray-900">
                          {match.homeTeam}
                        </span>
                      </div>
                      <div className="px-3">
                        <span className="text-sm text-gray-500">vs</span>
                      </div>
                      <div className="flex-1 text-right">
                        <span className="text-base font-semibold text-gray-900">
                          {match.awayTeam}
                        </span>
                      </div>
                    </div>
                    
                    {/* Match Details */}
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <div>{match.venue}</div>
                      <div>{match.time}</div>
                    </div>

                    {/* Match Status */}
                    {match.status && (
                      <div className={`mt-2 text-sm font-medium
                        ${match.status === 'Scheduled' ? 'text-green-600' :
                          match.status === 'InProgress' ? 'text-blue-600' :
                          'text-gray-600'}`}
                      >
                        {match.status}
                      </div>
                    )}

                    {/* Latest Score if available */}
                    {match.latestScore && (
                      <div className="mt-2 text-sm font-medium text-gray-900">
                        Latest: {match.latestScore.teamA.goals}-{match.latestScore.teamA.points} 
                        to 
                        {match.latestScore.teamB.goals}-{match.latestScore.teamB.points}
                      </div>
                    )}
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