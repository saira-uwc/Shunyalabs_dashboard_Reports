#!/usr/bin/env node
/**
 * Dashboard Generator for Shunya Labs Test Automation
 * Generates a comprehensive HTML report dashboard with full historical tracking
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const RESULTS_DIR = path.join(process.cwd(), 'test-results');
const HISTORY_DIR = path.join(process.cwd(), 'dashboard', 'history');
const DASHBOARD_FILE = path.join(process.cwd(), 'dashboard', 'index.html');
const PLAYWRIGHT_REPORT_FILE = path.join(process.cwd(), 'reports', 'json-report.json');
const PLAYWRIGHT_ARTIFACTS_DIR = path.join(process.cwd(), 'dashboard', 'playwright-artifacts');

// Ensure directories exist
if (!fs.existsSync(HISTORY_DIR)) {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
}

function toTitleCase(value) {
  return (value || '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

function deriveModuleName(filePath) {
  if (!filePath) return 'Playwright';
  const marker = `${path.sep}tests${path.sep}modules${path.sep}`;
  const index = filePath.indexOf(marker);
  if (index === -1) return 'Playwright';
  const rest = filePath.slice(index + marker.length);
  const moduleKey = rest.split(path.sep)[0];
  return toTitleCase(moduleKey || 'Playwright');
}

/**
 * Parse CSV content into structured data
 */
function parseCSV(content) {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  
  const results = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Parse CSV line handling quoted fields
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    if (values.length >= 4) {
      results.push({
        dateTime: values[0],
        moduleName: values[1]?.replace(/"/g, ''),
        testPoint: values[2]?.replace(/"/g, ''),
        status: values[3],
        comment: values[4]?.replace(/"/g, '') || ''
      });
    }
  }
  
  return results;
}

/**
 * Read all CSV files and combine results
 */
function readAllResults() {
  const allResults = [];
  const csvFiles = [
    'content-validation-report.csv',
    'cta-redirections-report.csv',
    'actions-report.csv',
    'module-pages-report.csv',
    'module-cta-report.csv',
    'module-actions-report.csv',
  ];
  
  for (const file of csvFiles) {
    const filePath = path.join(RESULTS_DIR, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const results = parseCSV(content);
      
      // Add category based on file name
      const category = file.replace('-report.csv', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      results.forEach(r => {
        r.category = category;
        allResults.push(r);
      });
    }
  }
  
  return allResults;
}

/**
 * Read Playwright JSON report and normalize failures + attachments
 */
function readPlaywrightReport() {
  if (!fs.existsSync(PLAYWRIGHT_REPORT_FILE)) return null;

  let report = null;
  try {
    report = JSON.parse(fs.readFileSync(PLAYWRIGHT_REPORT_FILE, 'utf8'));
  } catch (error) {
    return null;
  }

  if (!report || !Array.isArray(report.suites)) return null;

  if (!fs.existsSync(PLAYWRIGHT_ARTIFACTS_DIR)) {
    fs.mkdirSync(PLAYWRIGHT_ARTIFACTS_DIR, { recursive: true });
  }

  const normalizeStatus = (status) => {
    if (status === 'passed') return 'PASS';
    if (status === 'failed' || status === 'timedOut') return 'FAIL';
    return null;
  };

  const mapAttachment = (attachment) => {
    if (!attachment || !attachment.path) return null;
    if (!fs.existsSync(attachment.path)) return null;
    const originalName = path.basename(attachment.path);
    const ext = path.extname(originalName);
    const hash = crypto.createHash('sha1').update(attachment.path).digest('hex').slice(0, 10);
    const fileName = `${hash}-${originalName}`;
    const destPath = path.join(PLAYWRIGHT_ARTIFACTS_DIR, fileName);
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(attachment.path, destPath);
    }
    return {
      name: attachment.name || originalName,
      contentType: attachment.contentType || '',
      url: `playwright-artifacts/${fileName}`,
    };
  };

  const tests = [];

  const buildTestPoint = (suiteTitles, specTitle, testTitle) => {
    return [...suiteTitles, specTitle, testTitle].filter(Boolean).join(' › ');
  };

  const extractErrorMessage = (result) => {
    if (!result) return '';
    if (result.errors && result.errors.length) {
      return result.errors[0].message || result.errors[0].value || '';
    }
    if (result.error && result.error.message) {
      return result.error.message;
    }
    return '';
  };

  const walkSuite = (suite, titlePath = []) => {
    const suiteTitles = suite.title ? [...titlePath, suite.title] : titlePath;

    (suite.specs || []).forEach(spec => {
      (spec.tests || []).forEach(test => {
        const result = test.results && test.results.length ? test.results[test.results.length - 1] : null;
        const status = normalizeStatus(result?.status || test.outcome || test.expectedStatus);
        if (!status) return;

        const testPoint = buildTestPoint(suiteTitles, spec.title, test.title || '');
        const errorMessage = extractErrorMessage(result);
        const attachments = (result?.attachments || [])
          .map(mapAttachment)
          .filter(Boolean);

        tests.push({
          category: 'Playwright',
          moduleName: deriveModuleName(suite.file || test.location?.file || ''),
          testPoint,
          status,
          comment: errorMessage,
          timestamp: result?.startTime || report.startTime || new Date().toISOString(),
          attachments,
        });
      });
    });

    (suite.suites || []).forEach(child => walkSuite(child, suiteTitles));
  };

  report.suites.forEach(suite => walkSuite(suite, []));

  const stats = report.stats || {};
  const passed = Number(stats.expected || stats.passed || 0);
  const failed = Number(stats.unexpected || stats.failed || 0);
  const total = passed + failed;

  return {
    summary: { total, passed, failed, passRate: total > 0 ? Math.round((passed / total) * 100) : 0 },
    tests,
  };
}

/**
 * Load historical data and normalize format
 */
function loadHistory() {
  const historyFile = path.join(HISTORY_DIR, 'runs.json');
  if (fs.existsSync(historyFile)) {
    const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    // Normalize: ensure all runs have 'tests' array (support old 'results' format)
    return history.map(run => ({
      ...run,
      tests: run.tests || run.results || []
    }));
  }
  return [];
}

/**
 * Save current run to history with FULL details
 */
function saveToHistory(results, playwrightRun) {
  const history = loadHistory();
  
  // Get run date from first result
  const runDate = results[0]?.dateTime ? new Date(results[0].dateTime).toISOString() : new Date().toISOString();
  const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Filter out INFO/SUMMARY rows
  const csvResults = results.filter(r => r.status === 'PASS' || r.status === 'FAIL');
  const hasPlaywrightTests = !!(playwrightRun && playwrightRun.tests && playwrightRun.tests.length);
  const testResults = hasPlaywrightTests ? playwrightRun.tests : csvResults;

  const summary = hasPlaywrightTests ? playwrightRun.summary : null;
  const passed = summary?.passed ?? testResults.filter(r => r.status === 'PASS').length;
  const failed = summary?.failed ?? testResults.filter(r => r.status === 'FAIL').length;
  const total = summary?.total ?? (passed + failed);
  
  const runSummary = {
    runId,
    runDate,
    passed,
    failed,
    total,
    passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
    // Store FULL test details for proof/audit
    tests: testResults.map(r => ({
      category: r.category,
      moduleName: r.moduleName,
      testPoint: r.testPoint,
      status: r.status,
      comment: r.comment.substring(0, 500), // Limit comment size
      timestamp: r.dateTime || r.timestamp,
      attachments: r.attachments || []
    }))
  };
  
  // Check if this run already exists (within 30 seconds - same run)
  const existingIndex = history.findIndex(h => {
    const diff = Math.abs(new Date(h.runDate) - new Date(runDate));
    return diff < 30000; // 30 seconds
  });
  
  if (existingIndex >= 0) {
    history[existingIndex] = runSummary;
  } else {
    history.push(runSummary);
  }
  
  // Keep last 100 runs for comprehensive history
  // Also clean up: ensure all runs use 'tests' not 'results'
  const cleanedHistory = history.slice(-100).map(run => {
    const cleanRun = { ...run };
    // Migrate 'results' to 'tests' if needed
    if (cleanRun.results && !cleanRun.tests) {
      cleanRun.tests = cleanRun.results;
    }
    delete cleanRun.results; // Remove old field name
    return cleanRun;
  });
  
  fs.writeFileSync(path.join(HISTORY_DIR, 'runs.json'), JSON.stringify(cleanedHistory, null, 2));
  
  return cleanedHistory;
}

/**
 * Generate the HTML dashboard with calendar and full history
 */
function generateDashboard(currentResults, history, playwrightRun) {
  const testResults = currentResults.filter(r => r.status === 'PASS' || r.status === 'FAIL');
  const hasPlaywrightTests = !!(playwrightRun && playwrightRun.tests && playwrightRun.tests.length);
  const currentTestResults = hasPlaywrightTests ? playwrightRun.tests : testResults;

  const csvPassed = testResults.filter(r => r.status === 'PASS').length;
  const csvFailed = testResults.filter(r => r.status === 'FAIL').length;
  const csvTotal = csvPassed + csvFailed;

  const summary = hasPlaywrightTests ? playwrightRun.summary : null;
  const passed = summary?.passed ?? csvPassed;
  const failed = summary?.failed ?? csvFailed;
  const total = summary?.total ?? csvTotal;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  const failureTests = currentTestResults.filter(t => t.status === 'FAIL');
  
  // Group current results by category
  const byCategory = {};
  currentTestResults.forEach(r => {
    if (!byCategory[r.category]) {
      byCategory[r.category] = { passed: 0, failed: 0, tests: [] };
    }
    if (r.status === 'PASS') byCategory[r.category].passed++;
    if (r.status === 'FAIL') byCategory[r.category].failed++;
    byCategory[r.category].tests.push(r);
  });

  // Group current results by module (preferred dashboard view)
  const byModule = {};
  currentTestResults.forEach(r => {
    const moduleKey = (r.moduleName || 'General').trim() || 'General';
    if (!byModule[moduleKey]) {
      byModule[moduleKey] = { passed: 0, failed: 0, tests: [] };
    }
    if (r.status === 'PASS') byModule[moduleKey].passed++;
    if (r.status === 'FAIL') byModule[moduleKey].failed++;
    byModule[moduleKey].tests.push(r);
  });

  const displayFailures = failureTests.length ? failureTests : currentTestResults.filter(r => r.status === 'FAIL');
  
  // Group history by date for calendar
  const historyByDate = {};
  history.forEach(run => {
    const date = new Date(run.runDate).toISOString().split('T')[0];
    if (!historyByDate[date]) {
      historyByDate[date] = [];
    }
    historyByDate[date].push(run);
  });
  
  // Prepare history data for charts
  const recentHistory = history.slice(-14); // Last 14 runs for trend
  const historyDates = recentHistory.map(h => {
    const d = new Date(h.runDate);
    return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
  });
  const historyPassRates = recentHistory.map(h => h.passRate);
  
  const lastRunDate = testResults[0]?.dateTime 
    ? new Date(testResults[0].dateTime).toLocaleString()
    : new Date().toLocaleString();

  const latestRun = history[history.length - 1];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shunya Labs - Test Report Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #0a0a0f;
      --bg-secondary: #12121a;
      --bg-card: #1a1a24;
      --bg-hover: #22222e;
      --bg-modal: rgba(0, 0, 0, 0.85);
      --text-primary: #f8f8f8;
      --text-secondary: #a0a0b0;
      --text-muted: #6b6b7b;
      --accent-primary: #6366f1;
      --accent-secondary: #818cf8;
      --success: #22c55e;
      --success-bg: rgba(34, 197, 94, 0.12);
      --danger: #ef4444;
      --danger-bg: rgba(239, 68, 68, 0.12);
      --warning: #f59e0b;
      --warning-bg: rgba(245, 158, 11, 0.12);
      --border: rgba(255, 255, 255, 0.06);
      --border-hover: rgba(255, 255, 255, 0.12);
      --shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
      --radius: 16px;
      --radius-sm: 8px;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
      min-height: 100vh;
    }

    .container { max-width: 1400px; margin: 0 auto; padding: 32px 24px; }

    /* Header */
    header {
      background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 100%);
      border-bottom: 1px solid var(--border);
      padding: 24px 0;
      margin-bottom: 32px;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .logo { display: flex; align-items: center; gap: 12px; }

    .logo-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .logo-text h1 { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .logo-text span { font-size: 13px; color: var(--text-secondary); }

    .header-actions { display: flex; gap: 12px; align-items: center; }

    .btn {
      padding: 10px 20px;
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid var(--border);
      background: var(--bg-card);
      color: var(--text-primary);
    }

    .btn:hover { background: var(--bg-hover); border-color: var(--border-hover); }
    .btn-primary { background: var(--accent-primary); border-color: var(--accent-primary); }
    .btn-primary:hover { background: var(--accent-secondary); }

    /* Tabs */
    .tabs {
      display: flex;
      gap: 4px;
      background: var(--bg-card);
      padding: 4px;
      border-radius: var(--radius);
      margin-bottom: 24px;
      border: 1px solid var(--border);
    }

    .tab {
      padding: 12px 24px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-weight: 500;
      color: var(--text-secondary);
      transition: all 0.2s ease;
      border: none;
      background: transparent;
    }

    .tab:hover { color: var(--text-primary); }
    .tab.active { background: var(--accent-primary); color: white; }

    /* Tab Content */
    .tab-content { display: none; }
    .tab-content.active { display: block; }

    /* Summary Cards */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .summary-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      transition: all 0.2s ease;
    }

    .summary-card:hover { border-color: var(--border-hover); transform: translateY(-2px); }
    .summary-card.success { border-left: 4px solid var(--success); }
    .summary-card.danger { border-left: 4px solid var(--danger); }
    .summary-card.info { border-left: 4px solid var(--accent-primary); }
    .summary-card.rate { border-left: 4px solid var(--warning); }

    .summary-label {
      font-size: 13px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .summary-value { font-size: 42px; font-weight: 700; letter-spacing: -2px; }
    .summary-card.success .summary-value { color: var(--success); }
    .summary-card.danger .summary-value { color: var(--danger); }
    .summary-card.info .summary-value { color: var(--accent-secondary); }
    .summary-card.rate .summary-value { color: var(--warning); }

    /* Charts Section */
    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .chart-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
    }

    .chart-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .chart-title::before {
      content: '';
      width: 4px;
      height: 20px;
      background: var(--accent-primary);
      border-radius: 2px;
    }

    .chart-container { position: relative; height: 280px; }
    .chart-fallback {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      font-size: 14px;
      background: var(--bg-secondary);
      border-radius: var(--radius-sm);
      border: 1px dashed var(--border);
      text-align: center;
      padding: 16px;
    }

    /* Section Title */
    .section-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .section-title::before {
      content: '';
      width: 6px;
      height: 28px;
      background: linear-gradient(180deg, var(--accent-primary), var(--accent-secondary));
      border-radius: 3px;
    }

    /* Category Cards */
    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .category-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }

    .category-header {
      padding: 20px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .category-name { font-weight: 600; font-size: 15px; }

    .category-stats { display: flex; gap: 12px; }

    .stat-badge {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .stat-badge.pass { background: var(--success-bg); color: var(--success); }
    .stat-badge.fail { background: var(--danger-bg); color: var(--danger); }

    .category-tests { padding: 12px 0; max-height: 300px; overflow-y: auto; }

    .test-item {
      padding: 12px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--border);
      transition: background 0.15s ease;
    }

    .test-item:last-child { border-bottom: none; }
    .test-item:hover { background: var(--bg-hover); }

    .test-status {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      flex-shrink: 0;
    }

    .test-status.pass { background: var(--success-bg); color: var(--success); }
    .test-status.fail { background: var(--danger-bg); color: var(--danger); }

    .test-name { flex: 1; font-size: 14px; color: var(--text-secondary); }

    /* Calendar */
    .calendar-container {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      margin-bottom: 24px;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .calendar-nav { display: flex; gap: 8px; }

    .calendar-nav button {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid var(--border);
      background: var(--bg-secondary);
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.2s;
    }

    .calendar-nav button:hover { background: var(--bg-hover); }

    .calendar-month { font-size: 18px; font-weight: 600; }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }

    .calendar-day-header {
      text-align: center;
      padding: 8px;
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 600;
    }

    .calendar-day {
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
      font-size: 14px;
    }

    .calendar-day:hover { background: var(--bg-hover); }
    .calendar-day.other-month { color: var(--text-muted); opacity: 0.5; }
    .calendar-day.today { background: var(--accent-primary); color: white; }

    .calendar-day.has-runs {
      background: var(--success-bg);
      border: 1px solid var(--success);
    }

    .calendar-day.has-runs.has-failures {
      background: var(--warning-bg);
      border: 1px solid var(--warning);
    }

    .calendar-day.has-runs.all-failures {
      background: var(--danger-bg);
      border: 1px solid var(--danger);
    }

    .run-indicator {
      position: absolute;
      bottom: 4px;
      font-size: 10px;
      font-weight: 600;
    }

    /* History List */
    .history-list { margin-top: 24px; }

    .history-date-group {
      margin-bottom: 24px;
    }

    .history-date-header {
      font-size: 16px;
      font-weight: 600;
      padding: 12px 0;
      border-bottom: 1px solid var(--border);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .run-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      margin-bottom: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;
    }

    .run-card:hover { border-color: var(--accent-primary); transform: translateX(4px); }

    .run-card-header {
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border);
    }

    .run-time {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .run-stats { display: flex; gap: 16px; align-items: center; }

    .run-stat {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
    }

    .run-stat.pass { color: var(--success); }
    .run-stat.fail { color: var(--danger); }

    .run-pass-rate {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }

    .run-pass-rate.good { background: var(--success-bg); color: var(--success); }
    .run-pass-rate.warning { background: var(--warning-bg); color: var(--warning); }
    .run-pass-rate.bad { background: var(--danger-bg); color: var(--danger); }

    /* Modal */
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--bg-modal);
      z-index: 1000;
      overflow-y: auto;
      padding: 40px 20px;
    }

    .modal-overlay.active { display: flex; justify-content: center; }

    .modal {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      width: 100%;
      max-width: 900px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      padding: 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title { font-size: 20px; font-weight: 600; }

    .modal-close {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid var(--border);
      background: var(--bg-card);
      color: var(--text-primary);
      cursor: pointer;
      font-size: 18px;
      transition: all 0.2s;
    }

    .modal-close:hover { background: var(--danger); border-color: var(--danger); }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }

    .modal-summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .modal-stat {
      background: var(--bg-card);
      padding: 16px;
      border-radius: var(--radius-sm);
      text-align: center;
    }

    .modal-stat-value { font-size: 28px; font-weight: 700; }
    .modal-stat-label { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

    .modal-tests-list { max-height: 400px; overflow-y: auto; }

    .modal-test-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      background: var(--bg-card);
      border-radius: var(--radius-sm);
      margin-bottom: 8px;
    }

    .modal-test-status {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }

    .modal-test-status.pass { background: var(--success-bg); color: var(--success); }
    .modal-test-status.fail { background: var(--danger-bg); color: var(--danger); }

    .modal-test-info { flex: 1; }
    .modal-test-name { font-weight: 500; margin-bottom: 4px; }
    .modal-test-category { font-size: 12px; color: var(--text-muted); }
    .modal-test-comment {
      font-size: 12px;
      color: var(--text-secondary);
      background: var(--bg-secondary);
      padding: 8px;
      border-radius: 4px;
      margin-top: 8px;
      font-family: 'JetBrains Mono', monospace;
      word-break: break-word;
    }
    .modal-test-comment.full {
      display: none;
      margin-top: 8px;
    }
    .modal-test-actions {
      margin-top: 6px;
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
    .view-more-btn {
      background: transparent;
      color: var(--accent-secondary);
      border: none;
      cursor: pointer;
      font-size: 12px;
      padding: 0;
    }
    .view-more-btn:hover {
      text-decoration: underline;
    }
    .modal-test-attachments {
      margin-top: 8px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .attachment-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--accent-secondary);
      background: rgba(255, 255, 255, 0.04);
      padding: 4px 8px;
      border-radius: 999px;
      text-decoration: none;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .attachment-link:hover {
      color: white;
      border-color: var(--accent-secondary);
    }

    /* Filter Bar */
    .filter-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      padding: 12px 16px;
      background: var(--bg-card);
      border-radius: var(--radius-sm);
    }

    .filter-btn {
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid var(--border);
      background: var(--bg-secondary);
      color: var(--text-secondary);
    }

    .filter-btn:hover {
      background: var(--bg-hover);
      border-color: var(--border-hover);
      color: var(--text-primary);
    }

    .filter-btn.active {
      background: var(--accent-primary);
      border-color: var(--accent-primary);
      color: white;
    }

    .filter-btn.pass.active {
      background: var(--success);
      border-color: var(--success);
    }

    .filter-btn.fail.active {
      background: var(--danger);
      border-color: var(--danger);
    }

    /* Export Dropdown */
    .export-dropdown {
      position: relative;
      display: inline-block;
    }

    .export-dropdown-content {
      display: none;
      position: absolute;
      top: 100%;
      right: 0;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      min-width: 200px;
      box-shadow: var(--shadow);
      z-index: 1001;
      margin-top: 8px;
    }

    .export-dropdown-content.show {
      display: block;
    }

    .export-dropdown-content button {
      width: 100%;
      padding: 12px 16px;
      text-align: left;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 13px;
      transition: all 0.15s;
      display: block;
    }

    .export-dropdown-content button:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .export-dropdown-content button:first-child {
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    }

    .export-dropdown-content button:last-child {
      border-radius: 0 0 var(--radius-sm) var(--radius-sm);
    }

    /* Open dropdown upward when needed (e.g., modal footer) */
    .export-dropdown.up .export-dropdown-content {
      top: auto;
      bottom: 100%;
      margin-top: 0;
      margin-bottom: 8px;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .modal-footer-left {
      display: flex;
      gap: 8px;
    }

    .modal-footer-right {
      display: flex;
      gap: 8px;
    }

    /* All Pass Banner */
    .all-pass-banner {
      background: linear-gradient(135deg, var(--success-bg), rgba(34, 197, 94, 0.05));
      border: 1px solid var(--success);
      border-radius: var(--radius);
      padding: 24px;
      text-align: center;
      margin-bottom: 32px;
    }

    .all-pass-banner h2 { color: var(--success); font-size: 24px; margin-bottom: 8px; }
    .all-pass-banner p { color: var(--text-secondary); }

    /* Failed Section */
    .failed-card {
      background: var(--bg-card);
      border: 1px solid var(--danger);
      border-radius: var(--radius);
      overflow: hidden;
      margin-bottom: 32px;
    }

    .failed-header {
      background: var(--danger-bg);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--border);
    }

    .failed-header h3 { font-size: 16px; font-weight: 600; color: var(--danger); }

    .failed-count {
      background: var(--danger);
      color: white;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .failed-list { padding: 8px 0; }

    .failed-item { padding: 16px 20px; border-bottom: 1px solid var(--border); }
    .failed-item:last-child { border-bottom: none; }

    .failed-test-name {
      font-weight: 500;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .failed-test-name::before { content: '✗'; color: var(--danger); }

    .failed-error {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: var(--text-muted);
      background: var(--bg-secondary);
      padding: 12px;
      border-radius: var(--radius-sm);
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* Footer */
    footer {
      text-align: center;
      padding: 32px;
      color: var(--text-muted);
      font-size: 13px;
      border-top: 1px solid var(--border);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .summary-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-section { grid-template-columns: 1fr; }
      .category-grid { grid-template-columns: 1fr; }
      .modal-summary { grid-template-columns: repeat(2, 1fr); }
      .tabs { flex-wrap: wrap; }
    }

    /* Print */
    @media print {
      body { background: white; color: black; }
      .modal-overlay { display: block !important; position: relative; background: white; }
      .modal { max-height: none; }
      .btn, .modal-close, .tabs { display: none; }
    }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .summary-card, .chart-card, .category-card, .run-card {
      animation: fadeIn 0.4s ease forwards;
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <div class="logo-icon">📊</div>
          <div class="logo-text">
            <h1>Shunya Labs</h1>
            <span>Test Automation Dashboard</span>
          </div>
        </div>
        <div class="header-actions">
          <span style="color: var(--text-muted); font-size: 13px;">
            Last Run: <strong style="color: var(--text-secondary)">${lastRunDate}</strong>
          </span>
          <div class="export-dropdown">
            <button class="btn" onclick="toggleDropdown(this)">📥 Export All ▼</button>
            <div class="export-dropdown-content">
              <button onclick="exportAllHistoryCSV(); closeAllDropdowns();">📄 All Runs Summary (CSV)</button>
              <button onclick="exportAllHistoryJSON(); closeAllDropdowns();">📋 All Runs Complete (JSON)</button>
              <button onclick="exportCurrentRunCSV(); closeAllDropdowns();">📄 Current Run (CSV)</button>
            </div>
          </div>
          <button class="btn" onclick="window.print()">🖨️ Print</button>
        </div>
      </div>
    </div>
  </header>

  <main class="container">
    <!-- Tabs -->
    <div class="tabs">
      <button class="tab active" onclick="showTab('current', this)">📈 Current Run</button>
      <button class="tab" onclick="showTab('history', this)">📅 Run History</button>
      <button class="tab" onclick="showTab('calendar', this)">🗓️ Calendar View</button>
    </div>

    <!-- Current Run Tab -->
    <div id="tab-current" class="tab-content active">
      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card info">
          <div class="summary-label">Total Tests</div>
          <div class="summary-value">${total}</div>
        </div>
        <div class="summary-card success">
          <div class="summary-label">Passed</div>
          <div class="summary-value">${passed}</div>
        </div>
        <div class="summary-card danger">
          <div class="summary-label">Failed</div>
          <div class="summary-value">${failed}</div>
        </div>
        <div class="summary-card rate">
          <div class="summary-label">Pass Rate</div>
          <div class="summary-value">${passRate}%</div>
        </div>
      </div>

      ${failed === 0 ? `
      <div class="all-pass-banner">
        <h2>🎉 All Tests Passed!</h2>
        <p>Great job! All ${total} tests are passing successfully.</p>
      </div>
      ` : ``}

      <!-- Charts -->
      <div class="charts-section">
        <div class="chart-card">
          <h3 class="chart-title">Current Run Status</h3>
          <div class="chart-container">
            <canvas id="statusChart"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <h3 class="chart-title">Pass Rate Trend (Last ${recentHistory.length} Runs)</h3>
          <div class="chart-container">
            <canvas id="trendChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Module Breakdown -->
      <h2 class="section-title">Test Results by Module</h2>
      <div class="category-grid">
        ${Object.entries(byModule).map(([moduleName, data]) => `
        <div class="category-card">
          <div class="category-header">
            <div class="category-name">${moduleName}</div>
            <div class="category-stats">
              <span class="stat-badge pass">${data.passed} Pass</span>
              ${data.failed > 0 ? `<span class="stat-badge fail">${data.failed} Fail</span>` : ''}
            </div>
          </div>
          <div class="category-tests">
            ${data.tests.map(t => `
            <div class="test-item">
              <div class="test-status ${t.status.toLowerCase()}">${t.status === 'PASS' ? '✓' : '✗'}</div>
              <div class="test-name">${t.testPoint} <span style="color: var(--text-muted); font-size: 12px;">• ${t.category || 'Test'}</span></div>
            </div>
            `).join('')}
          </div>
        </div>
        `).join('')}
      </div>
    </div>

    <!-- History Tab -->
    <div id="tab-history" class="tab-content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 class="section-title" style="margin-bottom: 0;">All Test Runs (${history.length} runs stored)</h2>
        <div class="export-dropdown">
          <button class="btn" onclick="toggleDropdown(this)">📥 Export History ▼</button>
          <div class="export-dropdown-content">
            <button onclick="exportAllHistoryCSV(); closeAllDropdowns();">📄 Summary (CSV)</button>
            <button onclick="exportAllHistoryJSON(); closeAllDropdowns();">📋 Complete Data (JSON)</button>
          </div>
        </div>
      </div>
      <div class="history-list">
        ${Object.entries(historyByDate).sort((a, b) => b[0].localeCompare(a[0])).map(([date, runs]) => `
        <div class="history-date-group">
          <div class="history-date-header">
            📅 ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            <span style="color: var(--text-muted); font-weight: normal; margin-left: auto;">${runs.length} run${runs.length > 1 ? 's' : ''}</span>
          </div>
          ${runs.sort((a, b) => new Date(b.runDate) - new Date(a.runDate)).map(run => `
          <div class="run-card" onclick="showRunDetails('${run.runId}')">
            <div class="run-card-header">
              <div class="run-time">🕐 ${new Date(run.runDate).toLocaleTimeString()}</div>
              <div class="run-stats">
                <span class="run-stat pass">✓ ${run.passed}</span>
                <span class="run-stat fail">✗ ${run.failed}</span>
                <span class="run-pass-rate ${run.passRate === 100 ? 'good' : run.passRate >= 80 ? 'warning' : 'bad'}">${run.passRate}%</span>
              </div>
            </div>
          </div>
          `).join('')}
        </div>
        `).join('')}
      </div>
    </div>

    <!-- Calendar Tab -->
    <div id="tab-calendar" class="tab-content">
      <div class="calendar-container">
        <div class="calendar-header">
          <button class="btn" onclick="changeMonth(-1)">← Prev</button>
          <div class="calendar-month" id="calendarMonth"></div>
          <button class="btn" onclick="changeMonth(1)">Next →</button>
        </div>
        <div class="calendar-grid" id="calendarGrid"></div>
      </div>
      <div id="selectedDateRuns"></div>
    </div>
  </main>

  <!-- Run Details Modal -->
  <div class="modal-overlay" id="runModal">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title" id="modalTitle">Run Details</div>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div class="modal-body" id="modalBody"></div>
      <div class="modal-footer">
        <div class="modal-footer-left">
          <div class="export-dropdown up">
            <button class="btn" onclick="toggleDropdown(this)">📥 Export This Run ▼</button>
            <div class="export-dropdown-content">
              <button onclick="exportRunCSV(); closeAllDropdowns();">📄 Download as CSV</button>
              <button onclick="exportRunJSON(); closeAllDropdowns();">📋 Download as JSON</button>
            </div>
          </div>
          <button class="btn" onclick="printRun()">🖨️ Print as Proof</button>
        </div>
        <div class="modal-footer-right">
          <button class="btn btn-primary" onclick="closeModal()">Close</button>
        </div>
      </div>
    </div>
  </div>

  <footer>
    <p>Generated by Shunya Labs Test Automation • ${new Date().toLocaleString()}</p>
    <p style="margin-top: 8px; font-size: 11px;">Total runs stored: ${history.length} | History retention: Last 100 runs</p>
  </footer>

  <script>
    // Store all history data
    const historyData = ${JSON.stringify(history)};
    const historyByDate = ${JSON.stringify(historyByDate)};
    
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedRunId = null;

    function escapeHtml(value) {
      return (value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // Tab switching
    function showTab(tabId, btn) {
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.getElementById('tab-' + tabId).classList.add('active');
      if (btn) btn.classList.add('active');
      
      if (tabId === 'calendar') {
        renderCalendar();
      }
    }

    // Calendar rendering
    function renderCalendar() {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      
      document.getElementById('calendarMonth').textContent = monthNames[currentMonth] + ' ' + currentYear;
      
      const firstDay = new Date(currentYear, currentMonth, 1).getDay();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
      
      let html = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        .map(d => '<div class="calendar-day-header">' + d + '</div>').join('');
      
      const today = new Date();
      
      // Previous month days
      for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        html += '<div class="calendar-day other-month">' + day + '</div>';
      }
      
      // Current month days
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = currentYear + '-' + String(currentMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
        const runs = historyByDate[dateStr] || [];
        const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
        
        let classes = 'calendar-day';
        if (isToday) classes += ' today';
        if (runs.length > 0) {
          classes += ' has-runs';
          const allPass = runs.every(r => r.passRate === 100);
          const allFail = runs.every(r => r.passRate === 0);
          if (allFail) classes += ' all-failures';
          else if (!allPass) classes += ' has-failures';
        }
        
        html += '<div class="' + classes + '" onclick="showDateRuns(\\'' + dateStr + '\\')">';
        html += day;
        if (runs.length > 0) {
          html += '<span class="run-indicator">' + runs.length + ' run' + (runs.length > 1 ? 's' : '') + '</span>';
        }
        html += '</div>';
      }
      
      // Next month days
      const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
      for (let i = 1; i <= totalCells - firstDay - daysInMonth; i++) {
        html += '<div class="calendar-day other-month">' + i + '</div>';
      }
      
      document.getElementById('calendarGrid').innerHTML = html;
    }

    function changeMonth(delta) {
      currentMonth += delta;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      renderCalendar();
    }

    function showDateRuns(dateStr) {
      const runs = historyByDate[dateStr] || [];
      const container = document.getElementById('selectedDateRuns');
      
      if (runs.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">No test runs on this date</div>';
        return;
      }
      
      const dateObj = new Date(dateStr);
      let html = '<h2 class="section-title">' + dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '</h2>';
      
      runs.sort((a, b) => new Date(b.runDate) - new Date(a.runDate)).forEach(run => {
        html += \`
        <div class="run-card" onclick="showRunDetails('\${run.runId}')">
          <div class="run-card-header">
            <div class="run-time">🕐 \${new Date(run.runDate).toLocaleTimeString()}</div>
            <div class="run-stats">
              <span class="run-stat pass">✓ \${run.passed}</span>
              <span class="run-stat fail">✗ \${run.failed}</span>
              <span class="run-pass-rate \${run.passRate === 100 ? 'good' : run.passRate >= 80 ? 'warning' : 'bad'}">\${run.passRate}%</span>
            </div>
          </div>
        </div>\`;
      });
      
      container.innerHTML = html;
    }

    // Current filter state
    let currentFilter = 'all';
    let currentRunData = null;

    // Run details modal
    function showRunDetails(runId) {
      selectedRunId = runId;
      const run = historyData.find(r => r.runId === runId);
      if (!run) return;
      
      currentRunData = run;
      currentFilter = 'all';
      renderRunModal(run, 'all');
      document.getElementById('runModal').classList.add('active');
    }

    function renderRunModal(run, filter) {
      const runDate = new Date(run.runDate);
      document.getElementById('modalTitle').textContent = 'Test Run - ' + runDate.toLocaleString();
      
      const testData = run.tests || run.results || [];
      const totalCount = run.total || testData.length;
      const filteredTests = filter === 'all' ? testData : testData.filter(t => t.status === filter.toUpperCase());
      
      let html = \`
      <div class="modal-summary">
        <div class="modal-stat">
          <div class="modal-stat-value" style="color: var(--accent-secondary)">\${run.total}</div>
          <div class="modal-stat-label">Total Tests</div>
        </div>
        <div class="modal-stat">
          <div class="modal-stat-value" style="color: var(--success)">\${run.passed}</div>
          <div class="modal-stat-label">Passed</div>
        </div>
        <div class="modal-stat">
          <div class="modal-stat-value" style="color: var(--danger)">\${run.failed}</div>
          <div class="modal-stat-label">Failed</div>
        </div>
        <div class="modal-stat">
          <div class="modal-stat-value" style="color: var(--warning)">\${run.passRate}%</div>
          <div class="modal-stat-label">Pass Rate</div>
        </div>
      </div>
      
      <!-- Filter Buttons -->
      <div class="filter-bar">
        <span style="color: var(--text-muted); font-size: 13px; margin-right: 12px;">Filter:</span>
        <button class="filter-btn \${filter === 'all' ? 'active' : ''}" onclick="filterTests('all')">
          All (\${totalCount})
        </button>
        <button class="filter-btn pass \${filter === 'pass' ? 'active' : ''}" onclick="filterTests('pass')">
          ✓ Passed (\${run.passed})
        </button>
        <button class="filter-btn fail \${filter === 'fail' ? 'active' : ''}" onclick="filterTests('fail')">
          ✗ Failed (\${run.failed})
        </button>
      </div>
      
      <div class="modal-tests-list" id="testsListContainer">\`;
      
      if (filteredTests.length > 0) {
        const attachmentLabel = (attachment) => {
          const type = (attachment.contentType || '').toLowerCase();
          if (type.includes('image')) return '📸 Screenshot';
          if (type.includes('video')) return '🎥 Video';
          if (type.includes('zip')) return '🧵 Trace';
          return '📎 Attachment';
        };

        filteredTests.forEach((test, index) => {
          const attachmentsHtml = test.attachments && test.attachments.length
            ? '<div class="modal-test-attachments">' +
              test.attachments.map(att =>
                '<a class="attachment-link" href="' + att.url + '" target="_blank" rel="noreferrer">' +
                attachmentLabel(att) +
                '</a>'
              ).join('') +
              '</div>'
            : '';

          const fullComment = test.comment || '';
          const shortComment = fullComment.length > 300 ? fullComment.substring(0, 300) + '...' : fullComment;
          const commentHtml = test.status === 'FAIL' && fullComment
            ? '<div class="modal-test-comment" id="shortComment-' + index + '">' + escapeHtml(shortComment) + '</div>' +
              '<pre class="modal-test-comment full" id="fullComment-' + index + '">' + escapeHtml(fullComment) + '</pre>' +
              (fullComment.length > 300
                ? '<div class="modal-test-actions"><button class="view-more-btn" id="toggleCommentBtn-' + index + '" onclick="toggleFullComment(' + index + ')">View more</button></div>'
                : '')
            : '';

          html += \`
          <div class="modal-test-item" data-status="\${test.status}">
            <div class="modal-test-status \${test.status.toLowerCase()}">\${test.status === 'PASS' ? '✓' : '✗'}</div>
            <div class="modal-test-info">
              <div class="modal-test-name">\${test.testPoint}</div>
              <div class="modal-test-category">\${test.category || 'Test'} • \${test.moduleName || 'Module'}</div>
              \${commentHtml}
              \${attachmentsHtml}
            </div>
          </div>\`;
        });
      } else {
        html += '<div style="text-align: center; padding: 20px; color: var(--text-muted);">No tests match the selected filter</div>';
      }
      
      html += '</div>';
      html += \`
      <div style="margin-top: 24px; padding: 16px; background: var(--bg-card); border-radius: var(--radius-sm); font-size: 12px; color: var(--text-muted);">
        <strong>Run ID:</strong> \${run.runId}<br>
        <strong>Timestamp:</strong> \${runDate.toISOString()}<br>
        <strong>Filter:</strong> \${filter === 'all' ? 'All Tests' : filter === 'pass' ? 'Passed Only' : 'Failed Only'} (\${filteredTests.length} tests shown)
      </div>\`;
      
      document.getElementById('modalBody').innerHTML = html;
    }

    function filterTests(filter) {
      currentFilter = filter;
      if (currentRunData) {
        renderRunModal(currentRunData, filter);
      }
    }

    function toggleFullComment(index) {
      const fullEl = document.getElementById('fullComment-' + index);
      const shortEl = document.getElementById('shortComment-' + index);
      const btnEl = document.getElementById('toggleCommentBtn-' + index);
      if (!fullEl || !shortEl) return;
      const isVisible = fullEl.style.display === 'block';
      fullEl.style.display = isVisible ? 'none' : 'block';
      shortEl.style.display = isVisible ? 'block' : 'none';
      if (btnEl) btnEl.textContent = isVisible ? 'View more' : 'View less';
    }

    function closeModal() {
      document.getElementById('runModal').classList.remove('active');
      selectedRunId = null;
      currentRunData = null;
      currentFilter = 'all';
    }

    // Export functions
    function exportRunCSV() {
      if (!currentRunData) return;
      const run = currentRunData;
      const testData = run.tests || run.results || [];
      const filteredTests = currentFilter === 'all' ? testData : testData.filter(t => t.status === currentFilter.toUpperCase());
      
      let csv = 'Date/Time,Module Name,Test Point,Status,Category,Comment,Attachments\\n';
      filteredTests.forEach(test => {
        const comment = (test.comment || '').replace(/"/g, "'").replace(/\\n/g, ' ');
        const attachments = (test.attachments || []).map(a => a.url).join(' | ');
        csv += \`"\${test.timestamp || run.runDate}","\${test.moduleName}","\${test.testPoint}","\${test.status}","\${test.category}","\${comment}","\${attachments}"\\n\`;
      });
      
      downloadFile(csv, \`test-run-\${new Date(run.runDate).toISOString().split('T')[0]}-\${currentFilter}.csv\`, 'text/csv');
    }

    function exportRunJSON() {
      if (!currentRunData) return;
      const run = currentRunData;
      const testData = run.tests || run.results || [];
      const filteredTests = currentFilter === 'all' ? testData : testData.filter(t => t.status === currentFilter.toUpperCase());
      
      const exportData = {
        runId: run.runId,
        runDate: run.runDate,
        summary: { total: run.total, passed: run.passed, failed: run.failed, passRate: run.passRate },
        filter: currentFilter,
        testsShown: filteredTests.length,
        tests: filteredTests,
        exportedAt: new Date().toISOString()
      };
      
      downloadFile(JSON.stringify(exportData, null, 2), \`test-run-\${new Date(run.runDate).toISOString().split('T')[0]}-\${currentFilter}.json\`, 'application/json');
    }

    function exportAllHistoryCSV() {
      let csv = 'Run Date,Run ID,Total,Passed,Failed,Pass Rate\\n';
      historyData.forEach(run => {
        csv += \`"\${run.runDate}","\${run.runId}",\${run.total},\${run.passed},\${run.failed},\${run.passRate}%\\n\`;
      });
      downloadFile(csv, 'all-test-runs-summary.csv', 'text/csv');
    }

    function exportAllHistoryJSON() {
      const exportData = {
        exportedAt: new Date().toISOString(),
        totalRuns: historyData.length,
        runs: historyData.map(run => ({
          runId: run.runId,
          runDate: run.runDate,
          summary: { total: run.total, passed: run.passed, failed: run.failed, passRate: run.passRate },
          tests: run.tests || run.results || []
        }))
      };
      downloadFile(JSON.stringify(exportData, null, 2), 'all-test-runs-complete.json', 'application/json');
    }

    function exportCurrentRunCSV() {
      const testData = ${JSON.stringify(testResults.map(r => ({
        timestamp: r.dateTime,
        moduleName: r.moduleName,
        testPoint: r.testPoint,
        status: r.status,
        category: r.category,
        comment: r.comment
      })))};
      
      let csv = 'Date/Time,Module Name,Test Point,Status,Category,Comment\\n';
      testData.forEach(test => {
        const comment = (test.comment || '').replace(/"/g, "'").replace(/\\n/g, ' ');
        csv += \`"\${test.timestamp}","\${test.moduleName}","\${test.testPoint}","\${test.status}","\${test.category}","\${comment}"\\n\`;
      });
      
      downloadFile(csv, \`current-run-\${new Date().toISOString().split(\"T\")[0]}.csv\`, 'text/csv');
    }

    function downloadFile(content, filename, type) {
      const blob = new Blob([content], { type: type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    function printRun() {
      window.print();
    }

    // Dropdown toggle functions
    function toggleDropdown(btn) {
      const dropdown = btn.nextElementSibling;
      const isOpen = dropdown.classList.contains('show');
      
      // Close all dropdowns first
      closeAllDropdowns();
      
      // Toggle this one
      if (!isOpen) {
        dropdown.classList.add('show');
      }
    }

    function closeAllDropdowns() {
      document.querySelectorAll('.export-dropdown-content').forEach(d => {
        d.classList.remove('show');
      });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.export-dropdown')) {
        closeAllDropdowns();
      }
    });

    // Close modal on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    function renderChartFallback(canvasId, message) {
      const canvas = document.getElementById(canvasId);
      if (!canvas || !canvas.parentElement) return;
      canvas.parentElement.innerHTML = \`<div class="chart-fallback">\${message}</div>\`;
    }

    function initCharts() {
      try {
        if (!window.Chart) {
          renderChartFallback('statusChart', 'Charts unavailable (offline).');
          renderChartFallback('trendChart', 'Charts unavailable (offline).');
          return;
        }

        const statusCanvas = document.getElementById('statusChart');
        const trendCanvas = document.getElementById('trendChart');
        if (!statusCanvas || !trendCanvas) return;

        const statusCtx = statusCanvas.getContext('2d');
        new Chart(statusCtx, {
          type: 'doughnut',
          data: {
            labels: ['Passed', 'Failed'],
            datasets: [{
              data: [${passed}, ${failed}],
              backgroundColor: ['#22c55e', '#ef4444'],
              borderWidth: 0,
              hoverOffset: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#a0a0b0', padding: 20, font: { family: 'DM Sans', size: 13 } }
              }
            },
            cutout: '70%'
          }
        });

        const trendCtx = trendCanvas.getContext('2d');
        new Chart(trendCtx, {
          type: 'line',
          data: {
            labels: ${JSON.stringify(historyDates)},
            datasets: [{
              label: 'Pass Rate %',
              data: ${JSON.stringify(historyPassRates)},
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              fill: true,
              tension: 0.3,
              pointRadius: 4,
              pointHoverRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#6b6b7b', font: { family: 'DM Sans' } }
              },
              x: {
                grid: { display: false },
                ticks: { color: '#6b6b7b', font: { family: 'DM Sans', size: 10 }, maxRotation: 45 }
              }
            },
            plugins: { legend: { display: false } }
          }
        });
      } catch (error) {
        renderChartFallback('statusChart', 'Charts failed to load.');
        renderChartFallback('trendChart', 'Charts failed to load.');
        console.warn('Chart init error:', error);
      }
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
      renderCalendar();
      initCharts();
    });
  </script>
</body>
</html>`;

  return html;
}

// Main execution
console.log('📊 Generating Test Report Dashboard...\n');

const results = readAllResults();
const playwrightRun = readPlaywrightReport();

if (results.length === 0 && !playwrightRun) {
  console.log('❌ No test results found in test-results folder.');
  console.log('   Run tests first: npm test');
  process.exit(1);
}

const history = saveToHistory(results, playwrightRun);
const html = generateDashboard(results, history, playwrightRun);

fs.writeFileSync(DASHBOARD_FILE, html);

const testResults = results.filter(r => r.status === 'PASS' || r.status === 'FAIL');
const passed = playwrightRun?.summary?.passed ?? testResults.filter(r => r.status === 'PASS').length;
const failed = playwrightRun?.summary?.failed ?? testResults.filter(r => r.status === 'FAIL').length;
const total = playwrightRun?.summary?.total ?? (passed + failed);

console.log('✅ Dashboard generated successfully!\n');
console.log(`📈 Current Run Summary:`);
console.log(`   Total Tests: ${total}`);
console.log(`   Passed: ${passed}`);
console.log(`   Failed: ${failed}`);
console.log(`   Pass Rate: ${total > 0 ? Math.round((passed / total) * 100) : 0}%\n`);
console.log(`📁 Dashboard: ${DASHBOARD_FILE}`);
console.log(`📁 History: ${path.join(HISTORY_DIR, 'runs.json')} (${history.length} runs stored)`);
console.log(`\n🌐 Open dashboard: npm run dashboard:open`);
console.log(`   Or simply open the file in your browser.\n`);
