# Open Items

Deliberately deferred work, tracked so "later, on purpose" doesn't become "forgotten."
Last updated: 2026-07-11

## Security / Infrastructure
- **Rate limiting on public sync endpoints.** `/api/sync/accounts/:phone/roles` and
  `/summaries` are unauthenticated and enumerable — they disclose whether a phone
  number has an account and the account holder's name. Deferred pending discussion.
- **Vercel Deployment Protection is OFF** on the `trustkeyper` (app) project.
  Blocked on a plan upgrade (Deployment Protection Exceptions is a paid feature).
  Re-enable for Preview once available.
- **Local `/api/contact` route missing** in the Express dev server — the contact
  endpoint only exists as a Vercel function, so it can't be exercised in local dev.
  Developer-convenience gap, not a production risk.

## Analytics
- **GTM go-live gated** on Ciza confirming the container (`GTM-T679X9X7`) actually
  contains the GA4 config tag, Conversion Linker, and Ads conversion tag on the
  `contact_form_submit` trigger. Do NOT set `VITE_ENABLE_ANALYTICS=1` on Production
  until confirmed — an empty container loads and fires nothing, indistinguishable
  from working.

## Marketing site — cosmetic cleanup
- Mobile connector lines on How-It-Works / onboarding steps (Figma shows them;
  current build hides the connector below `lg`).
- Tablet behavior of the contact illustration (currently `hidden lg:block` — gone
  below 1024px, confirm that's intended for tablet).
- ~7 sub-4px / auto-layout-gap deltas from the 390px mobile audit — noise, low priority.

## Architecture (design decisions, not bugs)
- **Dual auth systems.** App has `/login` + `/signup/*` pages; marketing site has a
  modal + `/login/existing` + `/signup/*` routes. Both use Supabase phone OTP against
  the same production project. Consolidating to one auth surface is worth a deliberate
  design conversation. Until then, keep the app's `/login` as the recovery fallback.
- **`VITE_MARKETING_URL` stays unset** on the app's Production env. Setting it activates
  `AppAuthEntryRedirect`, which loops failed handoffs back to the marketing modal.

## Payments (pre-dates this work)
- **`razorpay_transfer_id` is NULL at order creation**, so `transfer.processed`
  webhooks can't match DB rows and settlement doesn't complete automatically.
  Longstanding blocker, deferred.
