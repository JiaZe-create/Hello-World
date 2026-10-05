# Off Campus — Assignment 4

A campus-and-city caption community for Sam: a Columbia junior from the Midwest, living in a dorm and exploring NYC. The previous course catalog remains at `/catalog`; Google sign-in, profile completion and avatar upload remain available.

## Product choices

- A rotating daily scene (midnight America/New_York) gives people a shared reason to return. Fourteen specific campus/NYC situations keep the initial scope manageable.
- Fresh, daily and top-this-week feeds give new work a chance and surface community favorites. Each user has one changeable/withdrawable ballot per caption.
- Dry, chaotic and wholesome tones make generation an intentional creative choice. Remixing reuses a scene and links to the original, encouraging participation rather than passive scrolling.
- Every caption has a public permalink, a copy-link action, and the exact prompt/model in “Behind the caption.” Public browsing lowers sharing friction; creating and voting require login.
- Compared with the image-caption workflow described for Crackd, a shared daily challenge and scene remixing would help people compare different interpretations of the same situation. Those are the improvements implemented here. Text scenes also avoid requiring a photo before first use.
- No fabricated vote counts, fake AI seed posts or invented PM feedback. Collect PM feedback on discoverability, caption quality and whether the daily prompt encourages a return visit; then record and implement the actual feedback.

## Setup

1. Keep the existing Supabase public URL/key environment variables.
2. Set server-only `GOOGLE_GENERATIVE_AI_API_KEY` in the existing Vercel project. Never prefix it with `NEXT_PUBLIC_` or commit it. `GEMINI_API_KEY` is an alias; an explicitly configured `AI_GATEWAY_API_KEY` is an alternative requiring Gateway credit.
3. Default model: `gemini-3.8-flash`; optionally set `AI_MODEL` to another compatible Google model. The installed AI SDK Google provider calls Gemini on the server.
4. Redeploy after adding the key. With no key, the generator clearly reports the missing connection and does not fabricate results.
5. Apply `supabase/assignment4.sql` once after Assignment 3. This migration is already applied to the existing project. Do not rerun table creation on that project.
6. Keep the canonical Site URL and allow each deployed app's exact `/auth/callback` in Supabase Auth URL configuration. Google Cloud's authorized OAuth redirect remains the Supabase `/auth/v1/callback` URL.

## Persistence and security

`generations` stores UUID, owner, scene, exact prompt, tone, model, completion state, output, token usage, timestamps and optional daily/remix attribution. It is inserted before calling the model. Requests have stable IDs, a 25-second provider timeout, one retry, a 10-per-rolling-day quota and a 10-second cooldown enforced by a transaction lock in the database. Failed/pending prompts stay private. Costs remain null when actual cost is unavailable.

`caption_votes` inserts a ballot tied to the authenticated user and generation. A unique constraint prevents duplicate ballots. Changes update the existing ballot; withdrawal deletes it. An internal trigger updates public aggregate counts atomically. Clients cannot write counters, alter ballot ownership or vote on unfinished work.

RLS is enabled on every public table: courses, profiles, generations and caption_votes. Public users read only completed generations and the course catalog. Users see and edit only their own profile, see only their own ballots, and can complete only their own pending generations. Column-level grants further restrict mutations. Avatar files remain in Supabase Storage, with only the path stored relationally; existing owner-scoped Storage policies remain in place.

## Verification

- ESLint and optimized Next.js production build passed.
- Live PostgreSQL rollback test passed: private drafts/ballots, anonymous read of completed captions, insert/change/withdraw vote counts, duplicate/spoofed/anonymous votes blocked, other-owner writes blocked, counter writes blocked, null completed caption blocked. Test users and rows were rolled back.
- Supabase security advisor reports no public-table RLS issues. Its remaining warning concerns leaked-password protection; this app uses Google OAuth.
- Live AI generation and signed-in browser voting still require an API key and a signed-in test session. Do not consider the assignment submission-ready until a real generation and vote persist successfully after refresh.
