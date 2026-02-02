# CSV Test Reports

## Overview

Every time you run tests, the results are automatically saved to CSV files in the `test-results/` folder. This allows you to track test results over time and see what's working and what's not.

## Generated CSV Files

After running tests, you'll find these CSV files:

1. **`content-validation-report.csv`** - All content validation checks
2. **`cta-redirections-report.csv`** - All CTA button/link checks
3. **`actions-report.csv`** - All interactive action checks
4. **`master-test-report.csv`** - Combined report (run `npm run combine-reports` to generate)

## CSV Format

Each CSV file has the following columns:

| Column | Description |
|--------|-------------|
| **Date/Time** | ISO timestamp when the test ran |
| **Test Point** | Name of the specific check/test |
| **Status** | `PASS`, `FAIL`, or `INFO` |
| **Output/Comment** | Detailed error message or success note |

## How to Use

### 1. Run Tests

```bash
npm test
```

This will automatically update all three CSV files with the latest results.

### 2. View Reports

Open the CSV files in:
- **Excel** (Windows/Mac)
- **Google Sheets** (upload the CSV)
- **Numbers** (Mac)
- Any text editor

### 3. Combine All Reports

To create a master report with all test results:

```bash
npm run combine-reports
```

This creates `test-results/master-test-report.csv` with all test points from all three test suites.

## Example CSV Output

```csv
Date/Time,Test Point,Status,Output/Comment
2024-01-15T10:30:00.000Z,"Header - Navigation and CTAs",PASS,"All header elements visible and accessible"
2024-01-15T10:30:05.000Z,"Hero Section - Main headline and taglines",PASS,"All hero content visible"
2024-01-15T10:30:10.000Z,"Playground Section - Speech to text interface",FAIL,"locator.waitFor: Timeout 10000ms exceeded"
2024-01-15T10:30:15.000Z,"Primary CTAs - Cloud API, Developer Docs, Hugging Face",PASS,"All primary CTAs visible"
```

## Benefits

✅ **Track Progress Over Time** - See which tests pass/fail across multiple runs  
✅ **Easy to Share** - CSV files can be shared with team members  
✅ **Quick Analysis** - Filter and sort in Excel/Sheets to find issues  
✅ **Historical Data** - All test runs are appended, so you have a history  
✅ **No Blocking** - Tests continue even if some checks fail, giving you a complete picture  

## Tips

1. **Open in Excel/Sheets** - Use filters to quickly find all `FAIL` status tests
2. **Sort by Date** - See the most recent test results first
3. **Pivot Tables** - Create pivot tables to see pass/fail rates over time
4. **Export to Dashboard** - Import CSV into your favorite dashboard tool

## File Locations

All CSV files are saved in:
```
test-results/
  ├── content-validation-report.csv
  ├── cta-redirections-report.csv
  ├── actions-report.csv
  └── master-test-report.csv (after running combine-reports)
```

## Notes

- CSV files are **appended** (not overwritten) - each test run adds new rows
- If you want to start fresh, delete the CSV files before running tests
- The master report is **recreated** each time you run `combine-reports`
