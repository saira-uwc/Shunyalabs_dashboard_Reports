import { google } from 'googleapis';

/**
 * Google Sheets Integration
 * 
 * This utility writes test results directly to a Google Sheet.
 * The sheet ID is: 1BcztOcqk2g9u4bSKOAql-YMsiKcTfcTXSyZttYQSMW8
 */

// Google Sheet ID from the URL
const SPREADSHEET_ID = '1BcztOcqk2g9u4bSKOAql-YMsiKcTfcTXSyZttYQSMW8';
const SHEET_NAME = 'Sheet1'; // Default sheet name, adjust if needed

/**
 * Initialize Google Sheets API
 * Uses Application Default Credentials or service account
 */
async function getSheetsClient() {
  try {
    // Try to use Application Default Credentials first
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    
    return sheets;
  } catch (error) {
    console.warn('⚠️  Google Sheets API authentication failed. Using public write method instead.');
    console.warn('   Error:', error.message);
    return null;
  }
}

/**
 * Write test results to Google Sheet
 * 
 * @param {string} moduleName - Name of the module being tested (e.g., "Landing Page")
 * @param {string} testPoint - Name of the specific test/check
 * @param {string} status - PASS, FAIL, or INFO
 * @param {string} output - Error message or success note
 */
export async function writeToGoogleSheet(moduleName, testPoint, status, output) {
  try {
    const sheets = await getSheetsClient();
    
    if (!sheets) {
      // Fallback: Use public API endpoint if authentication fails
      return await writeToGoogleSheetPublic(moduleName, testPoint, status, output);
    }

    const timestamp = new Date().toISOString();
    
    // Prepare the row data
    const values = [[timestamp, moduleName, testPoint, status, output]];
    
    // Append row to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:E`, // Columns A through E
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: values,
      },
    });
    
    return true;
  } catch (error) {
    console.warn(`⚠️  Failed to write to Google Sheet: ${error.message}`);
    // Don't throw - we don't want to break tests if sheet write fails
    return false;
  }
}

/**
 * Alternative method using public API endpoint
 * This works if the sheet is publicly editable
 */
async function writeToGoogleSheetPublic(moduleName, testPoint, status, output) {
  try {
    const timestamp = new Date().toISOString();
    
    // Use Google Sheets API v4 with public access
    // Note: This requires the sheet to be publicly editable or using API key
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A:E:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [[timestamp, moduleName, testPoint, status, output]],
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.warn(`⚠️  Public API write also failed: ${error.message}`);
    return false;
  }
}

/**
 * Initialize the sheet with headers if needed
 */
export async function initializeSheet() {
  try {
    const sheets = await getSheetsClient();
    if (!sheets) return false;

    // Check if headers exist
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:E1`,
    });

    const rows = response.data.values;
    
    // If no headers, add them
    if (!rows || rows.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:E1`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [['Date/Time', 'Module Name', 'Test Point', 'Status', 'Output/Comment']],
        },
      });
      console.log('✅ Google Sheet initialized with headers');
    }
    
    return true;
  } catch (error) {
    console.warn(`⚠️  Could not initialize sheet: ${error.message}`);
    return false;
  }
}

/**
 * Batch write multiple test results at once
 */
export async function batchWriteToGoogleSheet(results) {
  try {
    const sheets = await getSheetsClient();
    if (!sheets) {
      // Fallback: write one by one
      for (const result of results) {
        await writeToGoogleSheetPublic(
          result.moduleName,
          result.testPoint,
          result.status,
          result.output
        );
      }
      return true;
    }

    const timestamp = new Date().toISOString();
    const values = results.map(result => [
      timestamp,
      result.moduleName,
      result.testPoint,
      result.status,
      result.output,
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:E`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: values,
      },
    });

    return true;
  } catch (error) {
    console.warn(`⚠️  Batch write failed: ${error.message}`);
    // Fallback: write individually
    for (const result of results) {
      await writeToGoogleSheet(
        result.moduleName,
        result.testPoint,
        result.status,
        result.output
      );
    }
    return false;
  }
}
