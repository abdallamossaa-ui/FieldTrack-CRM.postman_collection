# FieldTrack CRM

A simple, mobile-friendly CRM for a sales team: salesmen log customers with an
address, the address becomes a one-tap Google Maps link, and every visit gets
logged with a status (New / Interested / Follow-up / Closed / Lost). A
dashboard shows recent visits across the team.

**Important — please read this first:** this is a full web application (a
login system + database + backend + frontend), not something you paste into
an existing "landing page." It runs as its own website. Below are copy-paste
steps to get it live even with zero experience.

---

## What's inside

```
salesman-crm/
├── backend/          Node.js + Express API (also serves the frontend)
│   ├── server.js
│   ├── routes/        auth, customers, visits, dashboard
│   ├── middleware/     login-check
│   ├── db.js           tiny built-in database (a JSON file, no setup needed)
│   └── data/db.json     created automatically the first time you run it
└── frontend/         Plain HTML/CSS/JS pages (no build step required)
    ├── index.html          Login
    ├── register.html       Create account
    ├── dashboard.html      Recent visits feed (default page after login)
    ├── customers.html      My customers list + map links
    ├── customers-new.html  Add customer
    └── customer-detail.html History, map link, edit/delete, log a visit
```

The backend serves the frontend files itself, so this whole thing is **one
website** — you only deploy one service.

---

## Option A — Run it on your own computer first (recommended)

1. Install [Node.js](https://nodejs.org) (the LTS version) if you don't have it.
2. Open a terminal in the `backend` folder and run:
   ```
   npm install
   ```
3. Copy the example settings file and open it:
   ```
   cp .env.example .env
   ```
   Change `JWT_SECRET` to any long random string (this keeps logins secure).
4. Start the app:
   ```
   npm start
   ```
5. Open your browser to **http://localhost:5000**
6. Click **Create an account**. The **first account you create automatically
   becomes the admin** (sees every salesman's customers). Everyone who signs
   up after that only sees their own customers.

That's it — you now have a working CRM running on your machine.

---

## Option B — Put it live on the internet (free, ~10 minutes)

The easiest free option for a beginner is **Render.com**.

1. Create a free account at [render.com](https://render.com).
2. Put this project in a GitHub repository (Render deploys from GitHub):
   - Create a new repository on [github.com](https://github.com).
   - Upload the entire `salesman-crm` folder to it (GitHub's website lets you
     drag-and-drop files if you don't know Git — click **"Add file" → "Upload
     files"**).
3. On Render, click **New → Web Service** and connect your GitHub repo.
4. Fill in these settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Under **Environment Variables**, add:
   - `JWT_SECRET` → any long random string
   - `JWT_EXPIRES_IN` → `7d`
6. Click **Create Web Service**. Render will give you a live URL like
   `https://your-app-name.onrender.com` — that's your CRM, live on the internet.
7. Open it, click **Create an account**, and you're running.

**Note on the free tier:** Render's free plan sleeps after inactivity and
your saved data (`data/db.json`) can reset on redeploys. That's fine for
trying things out. When you're ready for real, paying customers to be
permanently stored, upgrade to Render's paid tier with a persistent disk, or
ask to have this upgraded to a real database (e.g. PostgreSQL) — the app is
built so that swap is a small, contained change (only `db.js` needs to
change).

---

## How the Google Maps link works

When a salesman types an address into "Address / Location," the backend
automatically turns it into a clickable Google Maps search link, e.g.:

```
Al Sadd Street, Doha, Qatar
        ↓
https://www.google.com/maps/search/?api=1&query=Al%20Sadd%20Street%2C%20Doha%2C%20Qatar
```

That link is shown everywhere the customer appears, and opens the Google Maps
app on phones or the Maps website on desktop.

---

## Roles

- **Admin** (the first person to register): sees every customer and every
  visit across the whole team.
- **Salesman** (everyone after that): only sees customers they personally
  added, and can't view or edit anyone else's.

To promote someone to admin later, an admin/developer can open
`backend/data/db.json` and change that user's `"role"` from `"salesman"` to
`"admin"`.

---

## API documentation

Import `FieldTrack-CRM.postman_collection.json` into Postman to see and test
every API endpoint (login, customers, visits, dashboard).

---

## Security notes

- Passwords are hashed (never stored in plain text).
- Every page except login/register requires a valid session token.
- A salesman's API requests are blocked (403 error) from ever reading or
  editing another salesman's customers — this is enforced on the backend, not
  just hidden in the interface.
- Before real-world use: put this behind HTTPS (Render does this for you
  automatically) and change `JWT_SECRET` to something long and random.

---

## Need changes later?

Common next requests and where they'd happen:
- **Real database instead of the JSON file** → replace `backend/db.js`.
- **Password reset / email invites** → add to `backend/routes/auth.js`.
- **Export customer list to Excel/CSV** → new route in
  `backend/routes/customers.js`.
- **Push notifications instead of polling** → swap the `setInterval` polling
  in `dashboard.html` for WebSockets.
