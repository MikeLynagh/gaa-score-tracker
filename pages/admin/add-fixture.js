import { useState, useEffect } from 'react';
import { addFixture } from '../../lib/firestoreUtils';
import { getTeams } from '../../lib/teamUtils.js';

export default function AddFixture() {
  const [fixture, setFixture] = useState({
    county: 'Mayo',
    competition: 'senior-football-championship',
    teamA: '',
    teamB: '',
    venue: '',
    date: '',
    time: '',
    status: 'Scheduled'
  });
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    async function fetchTeams() {
      const fetchedTeams = await getTeams(fixture.county);
      setTeams(fetchedTeams);
    }
    fetchTeams();
  }, [fixture.county]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFixture(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addFixture(fixture.county, fixture.competition, {
        homeTeam: fixture.teamA,
        awayTeam: fixture.teamB,
        venue: fixture.venue || null,
        date: fixture.date ? new Date(fixture.date) : null,
        time: fixture.time || null,
        status: fixture.status
      });
      alert('Fixture added successfully');
      setFixture({
        county: 'Mayo',
        competition: 'senior-football-championship',
        teamA: '',
        teamB: '',
        venue: '',
        date: '',
        time: '',
        status: 'Scheduled'
      });
    } catch (error) {
      alert('Error adding fixture: ' + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Add New Fixture</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">County</label>
          <input
            type="text"
            name="county"
            value={fixture.county}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Competition</label>
          <input
            type="text"
            name="competition"
            value={fixture.competition}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Home Team</label>
          <select
            name="teamA"
            value={fixture.teamA}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select Home Team</option>
            {teams.map(team => (
              <option key={team.id} value={team.name}>{team.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Away Team</label>
          <select
            name="teamB"
            value={fixture.teamB}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select Away Team</option>
            {teams.map(team => (
              <option key={team.id} value={team.name}>{team.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Venue (Optional)</label>
          <input
            type="text"
            name="venue"
            value={fixture.venue}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1">Date (Optional)</label>
          <input
            type="date"
            name="date"
            value={fixture.date}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1">Time (Optional)</label>
          <input
            type="time"
            name="time"
            value={fixture.time}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1">Status</label>
          <select
            name="status"
            value={fixture.status}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Add Fixture
        </button>
      </form>
    </div>
  );
}