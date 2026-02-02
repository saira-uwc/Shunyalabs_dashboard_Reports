# Quick Setup: Google Sheets Integration

## Easiest Method: Google Apps Script (5 minutes)

### Step 1: Create the Apps Script

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1BcztOcqk2g9u4bSKOAql-YMsiKcTfcTXSyZttYQSMW8
2. Click **Extensions** → **Apps Script**
3. Delete all existing code
4. Paste this code:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    if (data.action === 'updateCoverage') {
      const sheet = spreadsheet.getSheetByName('test-coverage') || spreadsheet.getActiveSheet();
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const nameCol = headers.indexOf('Test Name') + 1;
      const updatedCol = headers.indexOf('Update Date & time') + 1;
      const statusCol = headers.indexOf('Status') + 1;
      const commentCol = headers.indexOf('Comment') + 1;

      if (!nameCol || !updatedCol || !statusCol || !commentCol) {
        return ContentService.createTextOutput(JSON.stringify({success: false, error: 'Missing columns'}))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const lastRow = sheet.getLastRow();
      const names = sheet.getRange(2, nameCol, Math.max(0, lastRow - 1), 1).getValues();
      const nameToRow = {};
      names.forEach((row, i) => {
        if (row[0]) nameToRow[row[0]] = i + 2;
      });

      (data.rows || []).forEach(item => {
        const rowIndex = nameToRow[item.testName];
        if (rowIndex) {
          sheet.getRange(rowIndex, updatedCol).setValue(item.updatedAt || new Date().toISOString());
          sheet.getRange(rowIndex, statusCol).setValue(item.status || '');
          sheet.getRange(rowIndex, commentCol).setValue(item.comment || '');
        }
      });

      return ContentService.createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = spreadsheet.getSheetByName('Report') || spreadsheet.getActiveSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Date/Time', 'Module Name', 'Test Point', 'Status', 'Output/Comment']);
    }
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

5. Click **Save** (💾 icon) or press `Ctrl+S` / `Cmd+S`
6. Give it a name like "Test Results Writer"

### Step 2: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Fill in:
   - **Description**: "Test Results Writer"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone"
5. Click **Deploy**
6. **Authorize** when prompted (click "Authorize access")
7. **Copy the Web App URL** - it looks like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

### Step 3: Add URL to Your Project

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add this line:
   ```
   GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/YOUR_URL_HERE/exec
   ```
3. Replace `YOUR_URL_HERE` with the actual URL from Step 2

### Step 4: Install dotenv (if not already installed)

```bash
npm install dotenv
```

### Step 5: Update sheets-writer.js to use dotenv

The code will automatically read from `process.env.GOOGLE_SHEETS_WEB_APP_URL`.

### Step 6: Test It!

```bash
npm test
```

Check your Google Sheet - you should see new rows appearing! 🎉

---

## Alternative: Use Environment Variable Directly

If you don't want to use `.env`, you can set it directly:

```bash
# Mac/Linux
export GOOGLE_SHEETS_WEB_APP_URL="https://script.google.com/macros/s/YOUR_URL/exec"
npm test

# Windows (Command Prompt)
set GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/YOUR_URL/exec
npm test

# Windows (PowerShell)
$env:GOOGLE_SHEETS_WEB_APP_URL="https://script.google.com/macros/s/YOUR_URL/exec"
npm test
```

---

## Troubleshooting

**"Could not write to Google Sheet"**
- Make sure the Web App URL is correct
- Make sure the Apps Script deployment is active
- Check that "Who has access" is set to "Anyone"

**"Results saved to CSV only"**
- This is normal if Google Sheets isn't configured
- Check the console output for setup instructions
- Results are always saved to CSV files as backup

**Sheet not updating**
- Make sure you deployed the Apps Script (not just saved it)
- Check that the Web App URL is in your environment variables
- Try redeploying the Apps Script

---

## What Gets Written?

Every test run will add rows to your sheet with:
- **Date/Time**: ISO timestamp
- **Module Name**: "Landing Page" (or whatever module you're testing)
- **Test Point**: Name of the specific test/check
- **Status**: PASS, FAIL, or INFO
- **Output/Comment**: Error message or success note

All test results from all three test files will go into the same sheet!
