import fs from 'fs';
import path from 'path';
import { writeToSheet, initializeSheet } from './sheets-writer.js';

const DEFAULT_HEADERS = 'Date/Time,Module Name,Test Point,Status,Output/Comment\n';

export async function createResultWriter({
  moduleName,
  reportFileName = 'module-pages-report.csv',
}) {
  await initializeSheet();

  const csvFile = path.join(process.cwd(), 'test-results', reportFileName);
  const csvDir = path.dirname(csvFile);

  if (!fs.existsSync(csvDir)) {
    fs.mkdirSync(csvDir, { recursive: true });
  }

  if (!fs.existsSync(csvFile)) {
    fs.writeFileSync(csvFile, DEFAULT_HEADERS);
  }

  const writeResult = async (testPoint, status, comment) => {
    const timestamp = new Date().toISOString();
    const safeComment = String(comment || '')
      .replace(/"/g, "'")
      .replace(/\n/g, ' | ');

    const csvLine = `${timestamp},"${moduleName}","${testPoint}",${status},"${safeComment}"\n`;
    fs.appendFileSync(csvFile, csvLine);
    await writeToSheet(moduleName, testPoint, status, comment || '');
  };

  return { writeResult, csvFile };
}
