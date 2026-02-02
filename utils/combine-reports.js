import fs from 'fs';
import path from 'path';

/**
 * Combine all test reports into a single master CSV file
 */
function combineReports() {
  const reportsDir = path.join(process.cwd(), 'test-results');
  const masterReport = path.join(reportsDir, 'master-test-report.csv');
  
  // Ensure directory exists
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Create master report with headers
  const headers = 'Date/Time,Test Suite,Test Point,Status,Output/Comment\n';
  fs.writeFileSync(masterReport, headers);

  // List of report files to combine
  const reportFiles = [
    'content-validation-report.csv',
    'cta-redirections-report.csv',
    'actions-report.csv',
    'module-pages-report.csv',
    'module-cta-report.csv',
    'module-actions-report.csv'
  ];

  let totalRows = 0;

  for (const reportFile of reportFiles) {
    const reportPath = path.join(reportsDir, reportFile);
    
    if (fs.existsSync(reportPath)) {
      const content = fs.readFileSync(reportPath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      // Skip header line and empty lines
      const dataLines = lines.slice(1).filter(line => line.trim());
      
      if (dataLines.length > 0) {
        // Determine test suite name from filename
        const suiteName = reportFile.replace('-report.csv', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Add suite name to each line and append to master report
        dataLines.forEach(line => {
          // Insert suite name after timestamp
          const parts = line.split(',');
          if (parts.length >= 4) {
            const newLine = `${parts[0]},"${suiteName}",${parts.slice(1).join(',')}\n`;
            fs.appendFileSync(masterReport, newLine);
            totalRows++;
          }
        });
      }
    }
  }

  // Add summary
  const timestamp = new Date().toISOString();
  const summary = `\n${timestamp},"MASTER SUMMARY","Combined ${totalRows} test points from all test suites","INFO","Report generated at ${timestamp}"\n`;
  fs.appendFileSync(masterReport, summary);

  console.log(`\n📊 Master report created: ${masterReport}`);
  console.log(`   Combined ${totalRows} test points\n`);
  
  return masterReport;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  combineReports();
}

export { combineReports };
