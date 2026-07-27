# gamestuff — The Cabinet

A little game center. `index.html` is the hub with a searchable card
grid; each game lives in its own folder under `games/` and behaves like
its own mini-site.

```
gamestuff/
  index.html          <- hub / game list
  css/main.css
  js/main.js           <- game registry + search lives here
  shared/
    config.js           <- your Supabase keys go here
  games/
    arena-breakout-infinite/
      index.html
      css/style.css
      js/builds.js
  supabase-setup.sql
```

To add a new game later: make a new folder under `games/`, build its
`index.html`, then add one object to the `GAMES` array in `js/main.js`.

---

## 1. Set up Supabase (free) — one time

Builds are posted by anyone and need to be visible to everyone, so they
live in a small shared database instead of the browser. GitHub Pages
can't host that itself, so we use Supabase alongside it.

1. Go to **supabase.com** → sign up (free) → **New project**.
   Pick any name/region, set a database password (you won't need it
   again), and wait ~1 minute for it to spin up.
2. In the left sidebar, open **SQL Editor** → **New query**.
   Paste in the contents of `supabase-setup.sql` from this project and
   click **Run**. This creates the `builds` table and its access rules.
3. Open **Storage** in the sidebar → **New bucket** → name it exactly
   `build-images` → toggle **Public bucket** on → **Create**.
   (The two storage policies at the bottom of `supabase-setup.sql`
   already ran in step 2, so this bucket is now readable/writable by
   anyone, same as the builds list.)
4. Open **Settings → API**. Copy the **Project URL** and the
   **anon public** key.
5. Open `shared/config.js` in this project and paste them in:

   ```js
   window.SUPABASE_URL = "https://xxxxxxxx.supabase.co";
   window.SUPABASE_ANON_KEY = "eyJhbGciOi...";
   ```

That's it — no server to run, no other code to touch.

---

## 2. Push it to GitHub Pages

You already made the `gamestuff` repo, so from inside this folder:

```bash
git init
git add .
git commit -m "Game center v1: Arena Breakout Infinite builds"
git branch -M main
git remote add origin https://github.com/<your-username>/gamestuff.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Build and deployment → Source:
Deploy from a branch → Branch: `main`, folder: `/ (root)` → Save**.

Give it a minute, then your site is live at:
`https://<your-username>.github.io/gamestuff/`

---

## Notes

- Posting is currently open to anyone with the link — no login. That
  matches what you asked for, but it also means anyone could post
  junk. If that becomes a problem later, easy upgrades are: a simple
  shared password gate, or real Supabase Auth (email/Discord login)
  before someone can insert a row. Happy to build either when/if you
  want it.
- Images are stored in the `build-images` bucket in Supabase's free
  tier (1GB storage, 2GB bandwidth/month) — plenty for a while.
- Everything is plain HTML/CSS/JS, no build step, so you can just edit
  and refresh in the browser to preview locally before pushing.
