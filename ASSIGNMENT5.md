# Assignment 5: return to the good captions

The existing Off Campus app generates captions with Gemini, saves them in Supabase, and lets signed-in users vote. This iteration makes those captions easier to discover and reuse.

## Changes
- Liked collection: captions with the current user’s Funny vote, fetched with an inner join and existing private-ballot RLS. Removing the vote removes the caption from the collection.
- Tone filters: dry, chaotic, wholesome; filters carry across feed tabs and pagination.
- Copy caption and copy link are separate actions, with accessible success/failure messages.
- Creation controls explain each tone, offer a blank scene, and disable submission for too-short input.
- Daily-prompt selection resets the request identifier, preventing a changed prompt from reusing a prior request.
- Responsive wrapping and contextual empty states.

## Validation
- ESLint, Next.js production build, TypeScript: passed.
- Local production server with the live Supabase database: feed and tone routes return HTTP 200; signed-out Liked and Lab routes redirect to login.
- Existing database policies reviewed; authenticated join query executed without error. No schema migration required.
- Database contains successful Gemini generations after the earlier provider fix. A fresh authenticated generation and voting flow still need manual verification.
- Browser download failed in this environment; clipboard interactions and visual QA require manual verification.

## Feedback
No Product Manager or Feedback Group notes were supplied in this request. These are usability improvements identified during code review, not claimed stakeholder feedback.

## Before submission
Open the exact new deployment URL in Incognito. Verify the public feed, Google login/logout, generate a caption, vote then refresh, check Liked, remove the vote, and copy a caption. Check mobile layout. Deployment protection must be off. Submit the deployment URL tied to this commit, not the Vercel dashboard URL.
