import fs from 'fs';
import path from 'path';

const [snapshotPath, outputPath] = process.argv.slice(2);

if (!snapshotPath || !outputPath) {
  console.error('Usage: node scripts/extract-language-regions.js <snapshot-log> <output-json>');
  process.exit(1);
}

if (!fs.existsSync(snapshotPath)) {
  console.error(`Snapshot file not found: ${snapshotPath}`);
  process.exit(1);
}

const content = fs.readFileSync(snapshotPath, 'utf8');
const lines = content.split('\n');

const startIndex = lines.findIndex((line) => line.includes('Language Regions'));
if (startIndex === -1) {
  console.error('Could not find "Language Regions" in snapshot log.');
  process.exit(1);
}

const collected = [];
for (let i = startIndex; i < lines.length; i += 1) {
  const line = lines[i];
  if (line.includes('See the full list of languages supported by Shunya Labs')) {
    break;
  }
  const match = line.match(/- button "(.+?)"/);
  if (match && match[1]) {
    collected.push(match[1].trim());
  }
}

const cleaned = collected
  .map((label) => label.replace(/\s+/g, ' ').trim())
  .filter(Boolean);

fs.writeFileSync(outputPath, JSON.stringify(cleaned, null, 2));
console.log(`Extracted ${cleaned.length} language buttons to ${outputPath}`);
