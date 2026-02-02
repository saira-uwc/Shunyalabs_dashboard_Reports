#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TESTS_DIR = path.join(ROOT, 'tests');
const OUTPUT = path.join(ROOT, 'reports', 'test-coverage.csv');
const JSON_REPORT = path.join(ROOT, 'reports', 'json-report.json');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.spec.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

function escapeCsv(value) {
  const text = String(value ?? '');
  const escaped = text.replace(/"/g, '""');
  return `"${escaped}"`;
}

function extractTests(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const describeMatch = content.match(/test\.describe\(\s*['"`]([^'"`]+)['"`]/);
  const suite = describeMatch ? describeMatch[1].trim() : path.basename(filePath);

  const tests = [];
  const testRegex = /test\(\s*['"`]([^'"`]+)['"`]/g;
  for (const match of content.matchAll(testRegex)) {
    const title = match[1].trim();
    const testName = `${suite} › ${title}`;
    const description = `${title} (${suite})`;
    tests.push({ testName, description });
  }
  return tests;
}

function readReportTests() {
  if (!fs.existsSync(JSON_REPORT)) return null;
  let report = null;
  try {
    report = JSON.parse(fs.readFileSync(JSON_REPORT, 'utf8'));
  } catch {
    return null;
  }
  if (!report || !Array.isArray(report.suites)) return null;

  const rows = [];
  const walkSuite = (suite, titlePath = []) => {
    const suiteTitles = suite.title ? [...titlePath, suite.title] : titlePath;
    (suite.specs || []).forEach(spec => {
      (spec.tests || []).forEach(test => {
        const testTitle = test.title || '';
        const testName = [...suiteTitles, spec.title, testTitle].filter(Boolean).join(' › ');
        const description = testTitle ? `${testTitle} (${spec.title})` : spec.title;
        rows.push({ testName, description });
      });
    });
    (suite.suites || []).forEach(child => walkSuite(child, suiteTitles));
  };

  report.suites.forEach(suite => walkSuite(suite, []));
  return rows;
}

function main() {
  const reportRows = readReportTests();
  if (reportRows && reportRows.length) {
    const header = ['Test Name', 'Description'];
    const lines = [header.map(escapeCsv).join(',')];
    reportRows.forEach((row) => {
      lines.push([row.testName, row.description].map(escapeCsv).join(','));
    });
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, lines.join('\n'));
    console.log(`✅ Test coverage CSV written to ${OUTPUT}`);
    console.log(`   Total tests: ${reportRows.length}`);
    return;
  }

  if (!fs.existsSync(TESTS_DIR)) {
    console.error('Tests directory not found:', TESTS_DIR);
    process.exit(1);
  }
  const files = walk(TESTS_DIR);
  const rows = [];
  files.forEach((file) => rows.push(...extractTests(file)));

  const header = ['Test Name', 'Description'];
  const lines = [header.map(escapeCsv).join(',')];
  rows.forEach((row) => {
    lines.push([row.testName, row.description].map(escapeCsv).join(','));
  });

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, lines.join('\n'));

  console.log(`✅ Test coverage CSV written to ${OUTPUT}`);
  console.log(`   Total tests: ${rows.length}`);
}

main();
