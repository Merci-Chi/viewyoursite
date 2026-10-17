# Portal checkout agreement fix

The reported `23503` error occurs because a `portal_project_agreements.id` was inserted into `square.agreementid`, whose foreign key references the older `agreements` table.

This patch keeps the legacy foreign key and checkout behavior. Portal checkouts use separate `portal_project_id` and `portal_agreement_id` foreign keys. The function validates the authenticated user's project and current signed agreement before creating a link, returns the fields expected by the portal, and checks project and payment-purpose associations during verification. Monthly portal hosting remains pending until an active subscription is found.

## Apply in this order

1. In the Supabase project used by the portal (`glonbvrcudwuzjundrii`), run only `migrations/20261017001000_portal_square_agreements.sql` in SQL Editor. Existing portal project/agreement tables must already exist. No foreign keys or historical payment rows are deleted.
2. Replace the `square-subscriptions` Edge Function with `functions/square-subscriptions/index.ts` and redeploy it. Keep its existing environment secrets. Alternatively, from this repository, with an authenticated Supabase CLI, run:

   ```sh
   supabase functions deploy square-subscriptions --project-ref glonbvrcudwuzjundrii
   ```

3. Retry the portal development checkout. Confirm it opens Square for the selected website. The corresponding `square` row should have the correct portal project/agreement IDs and a null legacy `agreementid`. For hosting, complete payment-status verification and confirm the correct project remains selected.

Applying SQL alone does not fix the old function's insert. Deploying the new function before SQL fails because its new columns do not exist. No portal frontend change is required.

## Validation performed

Mocked handler tests cover portal vs legacy foreign-key routing, the checkout/verification response contract, inaccessible projects, missing or incorrect agreements, cross-project and payment-purpose rejection, and pending/active monthly hosting. The portal checkout caller was also tested against the patched handler. No live Square payment or Supabase migration has been executed from this environment.

Run the checked-in handler tests with `npm install --prefix supabase/tests` followed by `npm test --prefix supabase/tests`.
