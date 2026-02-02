import fs from 'fs';
import path from 'path';

/**
 * Detailed CSV Reporter
 * 
 * This reporter captures detailed test results including:
 * - Individual check points within tests
 * - Status of each check
 * - Detailed error messages
 * - Timestamps
 */
class DetailedCSVReporter {
  constructor(options = {}) {
    this.outputFile = options.outputFile || 'test-results/detailed-test-report.csv';
    this.results = [];
  }

  onBegin(config, suite) {
    // Ensure output directory exists
    const outputDir = path.dirname(this.outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Create new CSV file with headers for each run
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.outputFile = `test-results/detailed-test-report-${timestamp}.csv`;
    
    const headers = 'Date/Time,Test Suite,Test Point,Status,Output/Comment\n';
    fs.writeFileSync(this.outputFile, headers);
    
    console.log(`\n📊 Detailed CSV report will be saved to: ${this.outputFile}\n`);
  }

  onTestEnd(test, result) {
    const timestamp = new Date().toISOString();
    const testSuite = test.parent.title || 'Unknown Suite';
    const testName = test.title;

    // Parse test output if available
    let status = result.status === 'passed' ? 'PASS' : result.status === 'failed' ? 'FAIL' : result.status.toUpperCase();
    let output = '';

    if (result.status === 'failed' && result.error) {
      output = result.error.message || result.error.toString();
      // Clean up the error message for CSV
      output = output.replace(/\n/g, ' | ').replace(/,/g, ';').replace(/"/g, "'");
    } else if (result.status === 'passed') {
      output = 'Test passed successfully';
    } else if (result.status === 'skipped') {
      output = 'Test was skipped';
    }

    // Write to CSV
    const csvLine = `${timestamp},"${testSuite}","${testName}",${status},"${output}"\n`;
    fs.appendFileSync(this.outputFile, csvLine);
  }

  onEnd(result) {
    // Add summary row
    const timestamp = new Date().toISOString();
    const summary = `\n${timestamp},"SUMMARY","Total Tests: ${result.total} | Passed: ${result.passed} | Failed: ${result.failed} | Skipped: ${result.skipped}","INFO","Test run completed at ${timestamp}"\n`;
    fs.appendFileSync(this.outputFile, summary);
    
    console.log(`\n✅ Detailed CSV report saved to: ${this.outputFile}\n`);
  }
}

export default DetailedCSVReporter;
