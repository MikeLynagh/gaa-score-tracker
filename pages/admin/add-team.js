import { useState } from 'react';
import { addTeam } from '../../lib/teamUtils.js';

export default function AddTeam() {
  const [team, setTeam] = useState({ name: '', county: 'Mayo' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeam(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addTeam(team.county, {name: team.name});
      alert('Team added successfully');
      setTeam({ name: '', county: 'Mayo' });
    } catch (error) {
      alert('Error adding team: ' + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Add New Team</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Team Name</label>
          <input
            type="text"
            name="name"
            value={team.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1">County</label>
          <input
            type="text"
            name="county"
            value={team.county}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Add Team
        </button>
      </form>
    </div>
  );
}