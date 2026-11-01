# Admin sign-in: password + authenticator app

Customers keep signing in with Google. **Admins** (ADMIN, SUPERADMIN) sign in at
`/ar/admin-login` (or `/en/admin-login`) with: e-mail + password + the 6-digit code from
Microsoft Authenticator (any TOTP app works). The page is not linked from the shop.

An admin who has set this up **can no longer sign in with Google**, otherwise the code could
be skipped. Admins who have not set it up yet keep working as before until they do.

## Put it on the server (in this order)

1. **Back up the database** (see the deploy notes).
2. Add the new columns (safe to run twice):
   ```
   psql -U <user> -h localhost <database> -f prisma/manual/2026-11-admin-2fa.sql
   ```
3. Pull the code, then:
   ```
   npm install --legacy-peer-deps
   npx prisma generate
   npm run build
   ```
   (`--legacy-peer-deps` because of an old conflict between `eslint-plugin-tailwindcss` and Tailwind 4.)
4. **Create the admin BEFORE you restart** (so you are not locked out):
   ```
   node --env-file=.env.local scripts/create-admin.mjs
   ```
   (use the env file the server really uses). Type the e-mail, a password of at least 12
   characters (typing is hidden), scan the QR code with Microsoft Authenticator, type the
   6-digit code. Add `--super` for a SUPERADMIN.
5. `pm2 restart flora-app`, then try `/ar/admin-login`.

## Things to know

- The password is stored as a bcrypt hash, the authenticator seed is stored encrypted with a key
  taken from `NEXTAUTH_SECRET`. **If `NEXTAUTH_SECRET` is ever changed, every admin has to run
  the script again.**
- 5 wrong tries on an e-mail block it for 15 minutes. The counter lives in each server process, so
  with several pm2 instances each counts on its own.
- A 6-digit code works once.
- Lost phone: run the script again for that e-mail (it replaces the password and the seed).
- Never put a password in the repository (it is public) or send it in a chat.
