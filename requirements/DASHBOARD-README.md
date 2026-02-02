# Live Dashboard (GitHub Pages)

This project publishes the test dashboard to GitHub Pages so anyone can view it without access to your machine.

---

## ✅ One‑time setup
GitHub → **Repo Settings → Pages**  

**Source = GitHub Actions**

---

## ✅ Run tests (auto‑publish)
```bash
npm test
```

This will:
1. Run all tests
2. Generate the dashboard
3. Push updates to GitHub
4. Auto‑deploy GitHub Pages

---

## ✅ Live URL
```
https://saira-uwc.github.io/Shunyalabs_dashboard_Reports/
```

---

## ✅ Manual publish (optional)
```bash
npm run test:dashboard:publish
```

---

## ✅ Quick one‑liner for the team
```
Run: npm test → Dashboard updates at https://saira-uwc.github.io/Shunyalabs_dashboard_Reports/
```
