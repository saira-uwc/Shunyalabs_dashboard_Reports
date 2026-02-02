# Dashboard Hosting (Public IP / Domain)

This project generates a **static dashboard** at `dashboard/index.html`.
To share it with everyone via an IP or domain, you need to host this folder on a server.

Below are two reliable options.

---

## Option A (Recommended): VPS + Nginx

### 1) Create a server
- Use any provider (AWS, GCP, DigitalOcean, Hetzner).
- You will get a **public IP** (example: `203.0.113.10`).

### 2) Install Nginx (on the server)
```bash
sudo apt update
sudo apt install -y nginx
sudo mkdir -p /var/www/shunyalabs-dashboard
sudo chown -R $USER:$USER /var/www/shunyalabs-dashboard
```

### 3) Configure Nginx
Create `/etc/nginx/sites-available/shunyalabs-dashboard`:
```nginx
server {
    listen 80;
    server_name _; # or your domain

    root /var/www/shunyalabs-dashboard;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

Enable it:
```bash
sudo ln -s /etc/nginx/sites-available/shunyalabs-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4) Deploy dashboard from your machine
Set env vars and deploy:
```bash
export DASHBOARD_SSH_HOST=203.0.113.10
export DASHBOARD_SSH_USER=ubuntu
export DASHBOARD_SSH_PATH=/var/www/shunyalabs-dashboard

npm run dashboard:deploy
```

Now anyone can visit:
```
http://203.0.113.10
```

### 5) Optional domain setup
Point your domain A‑record to the server IP (e.g. `dashboard.yourcompany.com`).
Then update the nginx `server_name` and add HTTPS (Let’s Encrypt).

---

## Option B: Static Hosting (Netlify/Vercel)

If you don’t want to manage servers:
1. Generate dashboard: `npm run dashboard`
2. Upload the `dashboard/` folder to Netlify or Vercel
3. You get a public URL to share

Downside: you must upload after each run (unless CI is set up).

---

## Automation (Always Up To Date)

If you want **automatic updates**:
1. Use Option A (VPS)
2. Run tests + deploy using:
```bash
npm run test:dashboard:deploy
```

You can schedule this with cron or your CI.

---

## Summary

- ✅ VPS + Nginx gives you a permanent IP/domain.
- ✅ `npm run dashboard:deploy` keeps it updated.
- ✅ Works on any device, always available.
