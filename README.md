# SIRA — سير

Egyptian teacher content studio / platform. Al Khanka, Qalyubia, Egypt.
Next.js 16 · next-intl (Arabic default `/ar`, English `/en`) · Tailwind v4 · Firebase project `sira-20fae`.

## Run

```bash
npm install
cp .env.example .env.local        # then fill it in (see "Firebase setup")
npm run dev                       # http://localhost:3000  ->  /ar and /en
npm run typecheck && npm test && npm run build
```

Without the server credentials the public site still works (it falls back to the Phase 1 defaults);
`/ar/admin` shows a "not configured" message until the steps below are done.

## Firebase setup (one time)

1. **Firestore**: already created (production mode, locked). Rules in `firestore.rules` are the same
   default-deny idea plus read-only public catalog; the server uses the Admin SDK, so the site works even
   with the current deny-all rules. Deploy `firestore.rules` later (`npx firebase-tools deploy --only firestore:rules`).
2. **Authentication**: Console > Build > Authentication > Get started > Sign-in method > enable **Email/Password**.
   Then Users > Add user: your owner email + a password you choose (type it only in the Console).
3. **Server key**: Console > Project settings > Service accounts > **Generate new private key**.
   Copy `client_email` and `private_key` from the downloaded JSON into `.env.local`
   (`FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`). Never commit or share the file.
4. **Web app config**: Project settings > General > Your apps > copy the values into `NEXT_PUBLIC_FIREBASE_*`.
5. **First super admin**: `npm run admin:set-role -- you@example.com super_admin`, then sign in at `/ar/admin/login`.
6. In the dashboard: **Services > Import now** loads the 4 categories and 32 service names (no prices).

Cloud Storage is intentionally not enabled (it requires the Blaze plan). `storage.rules` is prepared for later;
`imageUrl` / `imagePath` fields already exist on packages.

## Architecture

```
app/[locale]/(site)/      public pages (unchanged design) + site chrome
app/[locale]/admin/       dashboard: login, (shell)/ overview, services, service-categories, packages,
                          pricing, settings, users, placeholders
app/api/admin/session     sign-in/out: Firebase ID token -> HTTP-only session cookie (admins only)
app/api/quote             authoritative server-side price calculation
lib/firebase/             config (env), client (sign-in only), admin (server only)
lib/auth/                 roles + permissions, session cookie, requirePermission / requirePageSession
lib/models/               zod schemas + types for each collection
lib/repositories/         the ONLY code that talks to Firestore (Admin SDK)
lib/pricing/              pure pricing engine (flat | per_unit | percent) + tests
lib/data/                 public read layer used by the website (Firestore, with safe fallback)
lib/admin/                server-action helpers (guarded, parseInput), nav, form parsing
```

**Security model**: roles live only in Auth custom claims. Every admin page and action re-verifies the session
cookie on the server (signature, expiry, revocation, role). Browsers never write business data; Firestore rules
deny all client writes. Prices are integer piasters; the browser total is an estimate, `/api/quote` recalculates
from Firestore and ignores any total sent by the client.

**Roles**: `super_admin` all; `admin` all except user roles and audit log; `editor` content only
(no prices, orders, discounts/coupons, settings; editors can edit existing packages' text but not create them).

## Not built yet (by design)
Orders, discounts/coupons UI, portfolio/reviews/files management, teacher accounts, payments, image upload.
