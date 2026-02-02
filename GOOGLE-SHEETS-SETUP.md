# Google Sheets Integration Setup

This guide will help you set up automatic test result updates to your Google Sheet.

## Option 1: Google Apps Script (Recommended - Easiest)

This is the simplest method that doesn't require any credentials.

### Step 1: Create Apps Script

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1BcztOcqk2g9u4bSKOAql-YMsiKcTfcTXSyZttYQSMW8
2. Go to **Extensions** → **Apps Script**
3. Delete any existing code and paste this:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Date/Time', 'Module Name', 'Test Point', 'Status', 'Output/Comment']);
    }
    
    // Append the data row
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.moduleName,
      data.testPoint,
      data.status,
      data.output
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Step 2: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type" → Choose **Web app**
3. Set:
   - **Description**: "Test Results Writer"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone"
4. Click **Deploy**
5. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/.../exec`)

### Step 3: Update the Code

1. Open `utils/sheets-writer.js`
2. Replace the `writeToSheetWithAppsScript` function with:

```javascript
async function writeToSheetWithAppsScript(moduleName, testPoint, status, output) {
  const WEB_APP_URL = 'YOUR_WEB_APP_URL_HERE'; // Paste the URL from Step 2
  
  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        moduleName,
        testPoint,
        status,
        output: output.substring(0, 500), // Limit length
      }),
    });
    
    const result = await response.json();
    return result.success === true;
  } catch (error) {
    throw new Error(`Apps Script write failed: ${error.message}`);
  }
}
```

3. Replace `YOUR_WEB_APP_URL_HERE` with your actual Web App URL

### Step 4: Test

Run your tests:
```bash
npm test
```

Check your Google Sheet - you should see new rows appearing!

---

## Option 2: Google Sheets API with Service Account

This method uses the official Google Sheets API.

### Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Enable **Google Sheets API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google Sheets API"
   - Click **Enable**

### Step 2: Create Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in:
   - **Name**: "Test Automation"
   - Click **Create and Continue**
   - Skip role assignment → **Done**
4. Click on the created service account
5. Go to **Keys** tab → **Add Key** → **Create new key**
6. Choose **JSON** → **Create**
7. **Download the JSON file** and save it as `credentials.json` in your project root

### Step 3: Share Sheet with Service Account

1. Open the downloaded JSON file
2. Copy the `client_email` value (looks like: `test-automation@project-id.iam.gserviceaccount.com`)
3. Open your Google Sheet
4. Click **Share** button
5. Paste the service account email
6. Give it **Editor** access
7. Click **Send**

### Step 4: Install Dependencies

```bash
npm install googleapis
```

### Step 5: Set Environment Variable

```bash
# On Mac/Linux
export GOOGLE_APPLICATION_CREDENTIALS="./credentials.json"

# On Windows
set GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
```

Or add to your `.env` file (if using dotenv).

### Step 6: Update .gitignore

Add to `.gitignore`:
```
credentials.json
.env
```

### Step 7: Test

Run your tests:
```bash
npm test
```

---

## Troubleshooting

### "Could not write to Google Sheet"

- **Apps Script method**: Check that the Web App URL is correct and deployment is active
- **API method**: Verify credentials.json exists and sheet is shared with service account email
- **Both methods**: Check that the sheet ID is correct in `utils/sheets-writer.js`

### "Permission denied"

- Make sure the sheet is shared with the service account email (for API method)
- Make sure the Apps Script web app has "Anyone" access (for Apps Script method)

### "API not enabled"

- Go to Google Cloud Console → APIs & Services → Enable Google Sheets API

---

## Current Status

The code will:
1. ✅ Try to use Google Sheets API (if credentials are set up)
2. ✅ Fall back to Apps Script (if URL is configured)
3. ✅ Always save to CSV files as backup

**Even if Google Sheets write fails, your tests will continue and results will be saved to CSV files.**
