# Full Module Content Automation

This repo now supports **exact content validation** per page using snapshot baselines.

## What this does
- Captures full text + CTA labels in DOM order
- Validates header, main content, and footer
- Reports results to CSV + Google Sheets
- Skips pages marked **coming soon** or missing

---

## 1) Generate snapshots (baseline)
Run once whenever Figma/content changes:
```bash
npm run snapshot:pages
```

Snapshots are stored here:
```
test-data/snapshots/<module>/<page>.json
```

---

## 2) Validate all module pages
```bash
npm run test:modules
```

Results are written to:
```
test-results/module-pages-report.csv
```

CTA + actions reports:
```
test-results/module-cta-report.csv
test-results/module-actions-report.csv
```

---

## Notes
- Pages marked `coming-soon` or `missing` are not tested.
- If a snapshot is missing, tests fail with a clear message.
- Per-page test files live in `tests/modules/<module>/<page>/`.
- Homepage uses strict expectations in `test-data/expectations/homepage.json`.
- Language Regions labels are stored in `test-data/expectations/homepage-language-regions.json`.