import { google } from 'googleapis';
import { runImport } from '../../lib/importUtils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Starting import process...');
    
    // Debug: Check if we can access the credentials
    if (!process.env.GOOGLE_CREDENTIALS) {
      console.error('No credentials found in environment variables');
      return res.status(500).json({ 
        message: 'Missing Google credentials in environment' 
      });
    }

    try {
      // Debug: Log credential structure (don't log the actual values)
      const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
      console.log('Credential keys present:', Object.keys(credentials));

      const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
      console.log('Auth initialized successfully');

      // Test the auth
      const client = await auth.getClient();
      // Test Google Sheets API access
const sheets = google.sheets({ version: 'v4', auth: client });
try {
  const response = await sheets.spreadsheets.get({
    spreadsheetId: process.env.SPREADSHEET_ID,  // Replace with your actual Spreadsheet ID or environment variable
  });
  console.log('Successfully accessed the Google Sheets API');
} catch (sheetsError) {
  console.error('Google Sheets API access failed:', sheetsError.message);
  return res.status(500).json({
    message: 'Failed to access Google Sheets API',
    error: sheetsError.message,
  });
}

      console.log('Client created successfully');

      await runImport(auth);
      res.status(200).json({ message: 'Import successful' });
    } catch (authError) {
      console.error('Auth error details:', authError);
      res.status(500).json({ 
        message: 'Authentication failed', 
        error: authError.message,
        details: 'Check credentials format and permissions'
      });
    }
  } catch (error) {
    console.error('General error:', error);
    res.status(500).json({ 
      message: 'Import failed', 
      error: error.message 
    });
  }
}