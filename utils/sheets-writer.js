import dotenv from 'dotenv';

dotenv.config();

/**
 * Google Sheets Writer
 * 
 * Writes test results directly to Google Sheets using the Google Sheets API.
 * 
 * SETUP REQUIRED:
 * 1. Create a Google Cloud Project
 * 2. Enable Google Sheets API
 * 3. Create a Service Account and download JSON key
 * 4. Share the Google Sheet with the service account email
 * 5. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
 * 
 * OR use the Apps Script method (see setup instructions)
 */

const SPREADSHEET_ID = '1BcztOcqk2g9u4bSKOAql-YMsiKcTfcTXSyZttYQSMW8';
const SHEET_NAME = 'Report';

/**
 * Write test result to Google Sheet
 * 
 * @param {string} moduleName - Name of the module (e.g., "Landing Page")
 * @param {string} testPoint - Name of the test/check
 * @param {string} status - PASS, FAIL, or INFO
 * @param {string} output - Error message or success note
 */
export async function writeToSheet(moduleName, testPoint, status, output) {
  try {
    const timestamp = new Date().toISOString();
    const cleanOutput = (output || '').replace(/"/g, "'").replace(/\n/g, ' | ').substring(0, 500);
    
    // Try using googleapis if available
    try {
      const { google } = await import('googleapis');
      return await writeToSheetWithAPI(moduleName, testPoint, status, cleanOutput);
    } catch (importError) {
      // googleapis not available, try Apps Script method
      return await writeToSheetWithAppsScript(moduleName, testPoint, status, cleanOutput);
    }
  } catch (error) {
    // Silently fail - we don't want to break tests
    // Results will still be saved to CSV files
    return false;
  }
}

/**
 * Write using Google Sheets API (requires service account)
 */
async function writeToSheetWithAPI(moduleName, testPoint, status, output) {
  try {
    const { google } = await import('googleapis');
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:E`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [[new Date().toISOString(), moduleName, testPoint, status, output]],
      },
    });
    
    return true;
  } catch (error) {
    throw new Error(`API write failed: ${error.message}`);
  }
}

/**
 * Write using Apps Script Web App (simpler setup)
 * 
 * NOTE: Set GOOGLE_SHEETS_WEB_APP_URL environment variable
 * See GOOGLE-SHEETS-QUICK-SETUP.md for instructions.
 */
async function writeToSheetWithAppsScript(moduleName, testPoint, status, output) {
  // Get Web App URL from environment variable or use hardcoded URL
  const WEB_APP_URL = process.env.GOOGLE_SHEETS_WEB_APP_URL || 
    'https://script.google.com/macros/s/AKfycbxor9Iu_orul6S6J6msmVTW69zVFSYd324EKvrQ4eDFKkCYttEl3a0d3WNuBrZIqaJ3yQ/exec';
  
  if (!WEB_APP_URL) {
    // Silently fail - results will still be saved to CSV
    // Only show warning on first call to avoid spam
    if (!writeToSheetWithAppsScript._warned) {
      console.warn('⚠️  Google Sheets not configured. Results saved to CSV only.');
      console.warn('   Set GOOGLE_SHEETS_WEB_APP_URL environment variable to enable.');
      console.warn('   See GOOGLE-SHEETS-QUICK-SETUP.md for setup instructions.');
      writeToSheetWithAppsScript._warned = true;
    }
    return false;
  }
  
  try {
    const timestamp = new Date().toISOString();
    const cleanOutput = (output || '').replace(/"/g, "'").replace(/\n/g, ' | ').substring(0, 500);
    
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp,
        moduleName,
        testPoint,
        status,
        output: cleanOutput,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.success === true;
  } catch (error) {
    // Don't throw - just return false so tests continue
    return false;
  }
}

/**
 * Initialize sheet headers
 * This will be handled by the first write, but we can check here too
 */
export async function initializeSheet() {
  // Headers will be added automatically on first write
  // This function is kept for compatibility
  return true;
}
