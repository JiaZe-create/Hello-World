# Assignment 3: Google auth and profiles

Extends the existing comedy catalog. Uses the existing SUPABASE_URL and SUPABASE_ANON_KEY environment variables. The key must be an anon/publishable key, never a service-role key. No new Vercel or Supabase project is needed.

## Implemented

- Google OAuth with an exact application redirect of `${window.location.origin}/auth/callback` (no custom query parameters).
- SSR cookies, proxy session refresh, server-verified users, sign out, and gated navigation.
- `/profile` requires login and allows name changes and optional JPG/PNG/WebP uploads up to 5 MB.
- `/lab` requires login and both names. Missing names redirect to `/profile`.
- `supabase/profiles.sql` creates nullable name fields, an auth.users INSERT trigger, backfills existing users, and creates the avatar bucket and ownership policies. Applied to the existing project on September 28, 2026; do not rerun blindly.
- Binary photos are stored in Supabase Storage; profiles contain only their object path. Profile rows are private to their owner; avatar URLs are public.

## Finish OAuth setup

1. In Google Cloud Console, configure your own OAuth consent screen, then create an OAuth client of type Web application.
2. Google's authorized redirect URI is `https://dmqvghurutqgwfnlmflj.supabase.co/auth/v1/callback`. This is Google's return to Supabase, distinct from the application's `/auth/callback` route.
3. In the existing Supabase project, Authentication > Sign In / Providers > Google: enable Google and enter that client ID and secret. Keep the secret out of GitHub and the frontend.
4. In Supabase Authentication > URL Configuration, set the site URL to the app's production origin. Add `https://<production-host>/auth/callback` and `https://<commit-specific-deployment-host>/auth/callback` to the redirect allowlist. Add `http://localhost:3000/auth/callback` for local development if needed.
5. If the Google consent screen is in Testing, add the Google accounts that need access as test users; otherwise configure the audience appropriately for grading.
6. In the existing Vercel project, disable Deployment Protection as the assignment requires. Submit the immutable deployment URL associated with this commit, not the moving production alias.

## Verification

`npm run lint` and `npm run build` pass. Database trigger tested inside a rolled-back transaction; security advisors returned no findings. Test the complete Google sign-in flow after provider configuration: new user -> missing-name prompt -> save names and photo -> lab -> sign out -> protected routes redirect to login. Check a second user's session cannot read or modify the first user's profile or storage objects.
