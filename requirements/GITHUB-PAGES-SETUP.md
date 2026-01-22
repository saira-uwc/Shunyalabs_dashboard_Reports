# GitHub Pages Setup for Live Dashboard

Repository: `https://github.com/saira-uwc/Shunyalabs_dashboard_Reports.git`

This will publish `dashboard/index.html` to a **public URL** and keep it updated whenever you push.

---

## 1) First‑time setup (one time only)

1. Open repository settings  
   `Settings → Pages`

2. Under **Build and deployment**:  
   - **Source**: `GitHub Actions`

3. Save.

---

## 2) How to publish (every time)

Run tests and publish automatically:
```bash
npm test
```

This will:
1) run tests  
2) regenerate the dashboard  
3) commit + push the updated dashboard  

The workflow will deploy automatically.

---

## 3) Your public URL

Once the workflow runs, your dashboard will be live at:

```
https://saira-uwc.github.io/Shunyalabs_dashboard_Reports/
```

---

## Optional: Manual publish only

If you only want to publish without running tests:
```bash
npm run dashboard:publish
```

---

## Notes

- `dashboard/history/runs.json` stores all run history.
- Everyone with the link can view it on any device.
