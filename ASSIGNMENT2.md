# Assignment 2: Supabase course list

This extends the existing Next.js Assignment 1 app. The homepage fetches the
course catalog from Supabase at request time and renders cards. It uses the
REST API and the project's anon key; no extra client package is required.

## Database and environment

1. Run `supabase/setup.sql` in your Supabase project's SQL Editor. It creates
   the table, seeds three example courses, and permits anonymous SELECT only.
2. Copy `.env.example` to `.env.local`. Set `SUPABASE_URL` and
   `SUPABASE_ANON_KEY` using your project's URL and legacy anon key.
   Do not use a service-role key. Real environment files are ignored by Git.
3. Run `npm ci` and `npm run dev`, then open http://localhost:3000.
4. Add the same two environment variables to the existing Vercel project's
   Production and Preview environments before deploying.

## Deployment and submission

Push the commit to JiaZe-create/Hello-World and deploy it in the existing
Vercel hello-world project. Disable deployment protection as required by the
assignment. Open the deployment tied to the new commit and copy its unique
URL (not the Vercel dashboard URL or the moving production alias). Verify
that URL in an Incognito window and confirm all three database rows appear.
Submit that exact deployment URL in the course Submissions section.

## Checks

Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
A successful build alone does not verify database access: check the deployed
page with real Supabase environment variables before submitting.

Documentation: https://supabase.com/docs/guides/api
