# MiBlog Production Runbook

## Required environment variables
- `SESSION_SECRET`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Rotate admin session secret
1. Generate a new high-entropy value for `SESSION_SECRET`.
2. Update the deployment secret store.
3. Redeploy the app.
4. Expect all active admin sessions to be invalidated.

## Rotate shared admin password
1. Generate a new high-entropy value for `ADMIN_PASSWORD`.
2. Update the deployment secret store.
3. Redeploy the app.
4. Confirm `/admin/login` accepts only the new password.
5. Review `admin_audit_log` for repeated failures after the change.

## Rotate Supabase service role key
1. Rotate the service role key in Supabase.
2. Update `SUPABASE_SERVICE_ROLE_KEY` in the deployment secret store.
3. Redeploy the app.
4. Verify:
   - public home page renders
   - `/admin/login` works
   - create draft, publish, upload image, and delete flows still succeed

## Recover a false-positive login lockout
1. Find the fingerprint in `admin_audit_log` or by replaying the request from server logs.
2. Delete the matching row from `public.admin_login_attempts`.
3. Ask the admin to retry login.

## Clean up orphaned assets
1. Query `public.media_assets` where `state = 'orphaned'`.
2. Verify the asset is not referenced by any post content.
3. Remove the object from Supabase Storage.
4. Delete the corresponding row from `public.media_assets`.

## Legacy media migration
1. Ensure `blog-assets` exists and is private.
2. Run:
   ```bash
   pnpm exec node --env-file=.env.local scripts/migrate-legacy-media.mjs
   ```
3. Verify post content now references `/media/{assetId}` only.
4. Confirm `blog-images` is no longer public.
