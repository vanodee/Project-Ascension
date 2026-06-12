---
name: add-api-integration
description: Wire up a new third-party API integration for the Ascension parish website, with a server-side Route Handler, correct env var naming, and error handling.
disable-model-invocation: false
---

When asked to add a new external API integration (or when `/add-api-integration` is invoked with `$ARGUMENTS` naming the service), do the following:

1. **Identify the service** from `$ARGUMENTS` or the user's request. Check `ascension-parish-prd.md` and `CLAUDE.md` for the auth method and whether this service has already been partially wired.

2. **Determine where the key lives** using this project's rules:
   - **Client-side only:** Paystack public key (`NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`), Tally.so embed IDs, Sanity project ID/dataset (`NEXT_PUBLIC_SANITY_*`), YouTube channel ID (`NEXT_PUBLIC_YOUTUBE_CHANNEL_ID`).
   - **Server-side only (must never reach the browser):** Google Calendar API Key, YouTube Data API v3 Key, Cloudinary API Key + Secret, Sanity token, Resend API Key.
   - For server-side keys: create a Route Handler at `app/api/<service>/route.ts` that the client calls — never expose the key in client code.

3. **Add the env var(s)** to `.env.local` using the naming pattern from `CLAUDE.md`. Remind the user to add them to Vercel environment variables as well.

4. **Create the server-side integration**:
   - Route Handler at `app/api/<service>/route.ts` for services that need a backend proxy.
   - Or a `lib/<service>.ts` server utility for services called directly from Server Components (e.g., Sanity, Universalis).
   - TypeScript strict — no `any`, explicit response types.
   - Include error handling: catch fetch errors, return appropriate HTTP status codes from Route Handlers.

5. **Add ISR / caching** if the integration feeds a page with a defined revalidation window (see `CLAUDE.md` rendering strategy table). Pass `next: { revalidate: N }` to `fetch()` calls.

6. **Update `.env.local`** with the new variable(s) and note their expected format in a comment if non-obvious.

7. **Summarize** what was created, how the client calls the new endpoint or utility, and what env vars need to be set before the integration will work.
