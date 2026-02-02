import fs from 'fs';
import path from 'path';

class CSVReporter {
  constructor(options = {}) {
    this.outputFile = options.outputFile || 'test-results/test-report.csv';
    this.results = [];
  }

  onBegin(config, suite) {
    // Ensure output directory exists
    const outputDir = path.dirname(this.outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Initialize CSV file with headers if it doesn't exist or create new one
    const headers = 'Date/Time,Test Suite,Test Point,Status,Output/Comment\n';
    if (!fs.existsSync(this.outputFile)) {
      fs.writeFileSync(this.outputFile, headers);
    }
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
      // Clean up the error message
      output = output.replace(/\n/g, ' | ').replace(/,/g, ';');
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
    const summary = `\n${timestamp},"SUMMARY","Total: ${result.total} | Passed: ${result.passed} | Failed: ${result.failed} | Skipped: ${result.skipped}","INFO","Test run completed"\n`;
    fs.appendFileSync(this.outputFile, summary);
  }
}

export default CSVReporter;
