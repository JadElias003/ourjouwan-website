# Ourjouwan Sanity Studio

This is the phone-friendly admin dashboard for website content.

## Start

1. Create a Sanity project at https://www.sanity.io/manage
2. Copy the project ID.
3. In the website file `sanity-config.js`, set:

```js
projectId: "YOUR_PROJECT_ID",
dataset: "production"
```

4. In this folder, install and run the Studio:

```bash
npm install
$env:SANITY_STUDIO_PROJECT_ID="YOUR_PROJECT_ID"
$env:SANITY_STUDIO_DATASET="production"
npm run dev
```

5. Open the Studio URL on desktop or phone, edit content, then click Publish.

## Deploy The Admin

```bash
$env:SANITY_STUDIO_PROJECT_ID="YOUR_PROJECT_ID"
$env:SANITY_STUDIO_DATASET="production"
npm run deploy
```

Sanity will give you a public Studio URL for the admin dashboard. Only invited Sanity users can log in and edit.

## Website Changes

The live website reads published Sanity content directly in the browser. If Sanity is not configured or unavailable, the current hardcoded content remains as a fallback.
