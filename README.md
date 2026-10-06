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
      js/tabs.js         <- generic tab switching
      js/builds.js        <- Builds tab
      js/red-items.js     <- Red Items tab
  supabase-setup.sql           <- builds table + bucket
  supabase-setup-red-items.sql <- red items table + bucket
```

To add a new game later: make a new folder under `games/`, build its
`index.html`, then add one object to the `GAMES` array in `js/main.js`.

---

## 1. Set up Supabase (free) — one time

Builds and red items are posted by anyone and need to be visible to
everyone, so they live in a small shared database instead of the
browser. GitHub Pages can't host that itself, so we use Supabase
alongside it.

1. Go to **supabase.com** → sign up (free) → **New project**.
   Pick any name/region, set a database password (you won't need it
   again), and wait ~1 minute for it to spin up.
2. In the left sidebar, open **SQL Editor** → **New query**.
   Paste in the contents of `supabase-setup.sql` → **Run**. This
   creates the `builds` table and its access rules.
3. New query again → paste in `supabase-setup-red-items.sql` → **Run**.
   This creates the `red_items` table and its access rules.
4. Open **Storage** in the sidebar → **New bucket** → name it exactly
   `build-images` → toggle **Public bucket** on → **Create**.
5. Repeat: **New bucket** → name it exactly `red-item-images` →
   **Public bucket** on → **Create**.
   (The storage policies for both buckets already ran in steps 2–3.)
6. Open **Settings → API**. Copy the **Project URL** and the
   **anon public** key.
7. Open `shared/config.js` in this project and paste them in:

   ```js
   window.SUPABASE_URL = "https://xxxxxxxx.supabase.co";
   window.SUPABASE_ANON_KEY = "eyJhbGciOi...";
   ```

That's it — no server to run, no other code to touch. If you already
did this setup before adding Red Items, you only need steps 3 and 5 —
your existing builds table, bucket, and keys are untouched.

---

## 2. Push it to GitHub Pages

From inside this folder:

```bash
git add .
git commit -m "Add Red Items tab to Arena Breakout Infinite"
git push
```

(First time ever pushing? `git init`, `git remote add origin
https://github.com/<your-username>/gamestuff.git`, `git branch -M
main`, then `git push -u origin main`, then turn on Pages under
**Settings → Pages → Source: Deploy from a branch → main / root**.)

---

## Notes

- Posting is open to anyone with the link — no login, matching what
  you asked for. If that ever becomes a problem, a password gate or
  real login is a straightforward add later.
- Red item values are stored as plain numbers (no currency symbol
  baked in) and sorted highest-first by default.
- Everything is plain HTML/CSS/JS, no build step — just edit and
  refresh in the browser to preview locally before pushing.
