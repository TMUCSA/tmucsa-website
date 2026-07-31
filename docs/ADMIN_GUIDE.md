# TMUCSA Content Studio

The admin workspace is available at `/admin`. It supports approved Google accounts only and does not appear in public navigation.

## Local setup

Use Node.js 22 (the repository includes an `.nvmrc`):

```bash
nvm use
npm install
npm run dev
```

Open `http://localhost:3000/admin/login` and sign in with an owner address listed in `ADMIN_EMAILS`, or an administrator added by an owner through the portal.

The existing `.env` contains the public Firebase web configuration. Keep the following server-only values in `.env.local`:

```dotenv
FIREBASE_ADMIN_PROJECT_ID="..."
FIREBASE_ADMIN_CLIENT_EMAIL="..."
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
ADMIN_EMAILS="first@torontomu.ca,second@torontomu.ca"
```

Never prefix these variables with `NEXT_PUBLIC_`, commit `.env.local`, or place the downloaded service-account JSON in the repository.

## Admin modules

### Events

- Create, edit, draft, publish, archive, restore, and permanently delete events.
- Accept JPEG, PNG, WebP, HEIC, and HEIF photos.
- Convert uploads to WebP and resize/compress them in the browser before upload.
- Crop new images, reorder them, provide alt text, and click a preview to adjust its responsive focal point.
- Existing legacy event documents remain readable and are upgraded to the richer image schema when edited.

The public events page receives published events from `/api/events`. Draft and archived event documents are not readable through the client Firestore SDK.

### Team

- Create and edit member profiles.
- Add optional executive headshots and control executive ordering.
- Archive members instead of deleting them.
- Edit the current page hero, executives section, departments, subgroup images, and member assignments.
- Publish an academic year as an immutable historical snapshot.

Save the current page before publishing its historical snapshot. A snapshot copies the relevant member values into `teamPages/{year}/memberSnapshots`, preventing later role or program changes from altering history.

### Website content

Homepage, contact, navigation, social, and footer copy is stored in:

```text
siteContent/home
siteContent/contact
siteContent/global
```

Until a document is first saved, the public website uses the previous hardcoded wording as a fallback.

### Media

Manage homepage carousel order, the two homepage story images, and the two dedicated contact-page images. New files are optimized before upload, and both new and existing images can be cropped to landscape, classic, square, or portrait ratios before saving.

### Administrator access

Bootstrap owners are configured in the server-only `ADMIN_EMAILS` environment variable. Owners can select **Manage administrators** in the bottom of the admin sidebar to grant or revoke access for any valid email address.

Portal-managed administrators are stored in the private `adminUsers` Firestore collection. They can use every content-management module, but cannot manage administrator access. Owners cannot be removed through the portal, which preserves a recovery path if the Firestore list is accidentally emptied.

## Pre-deployment checks

Run:

```bash
npm install
npm run build
```

Recommended manual checks:

1. Open `/admin/dashboard` in a signed-out/private window and confirm it redirects to `/admin/login`.
2. Attempt login with an address that is neither in `ADMIN_EMAILS` nor `adminUsers` and confirm access is rejected.
3. Sign in with an approved address.
4. Create an event as a draft using one HEIC and one JPEG photo.
5. Check conversion sizes, crop one photo, adjust a focal point, reorder, and save.
6. Confirm the draft is absent from `/events`, then publish it and confirm it appears.
7. Archive it, verify it disappears publicly, restore it, then remove the test event if appropriate.
8. Edit an existing member and confirm `/team` still renders correctly.
9. Change one content field, verify the public page, and restore the original wording if it was only a test.
10. Do not publish a historical team snapshot as a test; publish one only when that academic year is ready to be preserved.

## Vercel deployment

In Vercel → Project → Settings → Environment Variables, configure the existing public Firebase variables plus:

```text
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
ADMIN_EMAILS
```

Apply them to Production. Apply them to Preview only if administrators should be able to use a stable, Firebase-authorized preview domain. Redeploy after changing environment variables.

The `engines` field and `.nvmrc` select a supported Node version. In Vercel, confirm the project uses Node.js 22.

Deploy the application before tightening Firestore rules so `/api/events` is already available to serve public events.

## Firebase rule deployment

The repository includes `firestore.rules`, `storage.rules`, and `firebase.json`.

After the Vercel deployment is healthy:

```bash
npx firebase-tools login
npx firebase-tools use --add
npx firebase-tools deploy --only firestore:rules,storage
```

Select the existing TMUCSA Firebase project when prompted. Alternatively, copy the two rule files into their respective Firebase Console rule editors and publish them.

The final rules:

- Deny all client Firestore writes.
- Keep public site content readable.
- Keep event documents private to the server API.
- Deny every client-side Storage write; optimized files pass through a session-protected server endpoint.
- Limit new image uploads to 2 MB each.

## Adding or removing administrators

Sign in with an owner account and select **Manage administrators** in the bottom of the sidebar. Add or remove portal-managed accounts from the modal; those changes take effect immediately and do not require a redeployment.

Edit the comma-separated `ADMIN_EMAILS` Vercel variable only when changing bootstrap owners, then redeploy. Use lowercase exact addresses. Keep at least one trusted owner in this variable at all times.

Removing a managed email blocks its next admin API request. Existing sessions are rechecked against the current Firestore access list on each request. For urgent account-level removal, also disable the user in Firebase Authentication.

## Recovery and data behavior

- Event archive is reversible. Permanent event deletion also deletes managed files whose Storage paths are known.
- Member archive sets `isActive: false` and removes the member from the current page. Historical snapshots remain unchanged.
- Team images are not automatically deleted when replaced because historical team pages may still reference them.
- Audit entries are stored in the private `auditLogs` collection.
- Firebase Console edits continue to work because console access uses Google Cloud IAM rather than client Security Rules.
