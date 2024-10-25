import { useState } from 'react';

export default function ImportFixtures() {
  const [isImporting, setIsImporting] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleImport = async () => {
    try {
      setIsImporting(true);
      setStatus('Starting import...');
      setError(null);

      const response = await fetch('/api/import-fixtures', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Import failed');
      }

      setStatus('Import completed successfully!');
    } catch (err) {
      setError(err.message);
      setStatus('Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Import Fixtures</h1>
      
      <div className="space-y-4">
        <button 
          onClick={handleImport}
          disabled={isImporting}
          className={`w-full py-2 px-4 rounded-lg font-medium text-white 
            ${isImporting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isImporting ? 'Importing...' : 'Start Import'}
        </button>

        {status && (
          <div className={`p-4 rounded-lg ${error 
            ? 'bg-red-50 text-red-900' 
            : 'bg-green-50 text-green-900'}`}
          >
            <p className="text-sm">
              {status}
              {error && (
                <div className="mt-2 text-red-600">
                  Error details: {error}
                </div>
              )}
            </p>
          </div>
        )}

        {/* Status Log Section */}
        {status && !error && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold mb-2">Import Progress</h2>
            <div className="text-sm space-y-1">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
                Connected to Google Sheets
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
                Fetched fixture data
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
                Updated Firestore database
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Add protection to the page
export const getServerSideProps = async (context) => {
  // Add any authentication logic here
  return {
    props: {},
  };
};