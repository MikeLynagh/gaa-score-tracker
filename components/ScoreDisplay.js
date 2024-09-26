export default function ScoreDisplay({ teamA, teamB, currentScore, calculateTotalScore, formatScore, status, date, time }) {
    return (
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm mb-6">
            <div className="flex justify-between items-center mb-2">
                <div className="text-center w-2/5">
                    <h2 className="text-sm font-semibold mb-1 truncate text-gray-900">{teamA}</h2>
                    <p className="text-2xl font-bold text-gray-800">{formatScore('teamA')}</p>
                    <p className="text-xs text-gray-700">({calculateTotalScore('teamA')})</p>
                </div>
                <div className="text-center w-1/5">
                    <p className="text-xs font-semibold mb-1 text-gray-700">{status}</p>
                    <p className="text-xl font-bold text-gray-800">VS</p>
                </div>
                <div className="text-center w-2/5">
                    <h2 className="text-sm font-semibold mb-1 truncate text-gray-800">{teamB}</h2>
                    <p className="text-2xl font-bold text-gray-800">{formatScore('teamB')}</p>
                    <p className="text-xs text-gray-700">({calculateTotalScore('teamB')})</p>
                </div>
            </div>
            <p className="text-xs text-center mt-2 text-gray-700">{date} | {time}</p>
        </div>
    )
}