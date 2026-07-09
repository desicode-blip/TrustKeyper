# Payments — Razorpay Route notes

Operational notes and resolved issues for TrustKeyper's Razorpay Route
integration. Keep this file updated when onboarding or settlement behaviour
surprises us in staging or production.

---

## Invalid housing subcategory (`real_estate_agents`)

**Reference:** Razorpay ticket #19705336 · PRs #130, #131 · 2026-07-08

### Issue
Route account creation with `profile.subcategory: "real_estate_agents"` caused
accounts to stay at `activation_status: "needs_clarification"` indefinitely,
with an empty `requirements` array (no actionable guidance from the API).

### Root cause
`real_estate_agents` is not a valid Razorpay subcategory. Per Razorpay's
official Route integration docs (Appendix: Business Sub-Category table), the
valid subcategories under category `housing` are:
- `developer`
- `facility_management`
- `rwa`
- `coworking`
- `realestate_classifieds`
- `space_rental`

TrustKeyper's model (individual property owners collecting rent via the
platform) maps to `space_rental`.

### Fix
Changed `profile.subcategory` to `space_rental` in `buildRazorpayAccountPayload()`
(`api/_lib/paymentOnboardHandler.ts`) and the corresponding
`business_subcategory` value in the DB insert. Confirmed end-to-end: a fresh
test account went from `needs_clarification` to `activated` within seconds of
correcting this value. **PR #130.**

### Related notes
- **`business_type` display:** Continues to show as `not_yet_registered` in the
  Razorpay account object response even when `individual` is submitted and
  correctly stored, and even after the account fully activates. This appears to
  be expected/cosmetic behaviour on Razorpay's side, not an error — do not treat
  this field as an activation blocker.
- **Bank beneficiary name:** `bankBeneficiaryName` / `settlements.beneficiary_name`
  submitted during product configuration must match the KYC-verified stakeholder
  name exactly, or the account gets stuck in `under_review` / DB `submitted`.
  Confirmed via staging phone `9000000024` during testing.
- **Stale `validation_status` / missed webhooks:** Our DB `validation_status` can
  go stale if a Razorpay webhook is missed. Added
  `syncRecipientValidationFromRazorpay()` (`api/_lib/razorpayRouteHelpers.ts`),
  which re-fetches Route product status and mirrors it whenever the onboarding
  status endpoint is hit, so the app self-heals even without a webhook.
  **PR #131.**
