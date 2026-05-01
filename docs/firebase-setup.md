# Firebase Setup For Google Login And Cloud Sync

This app remains local-first. Firebase is optional and is enabled only when the Vite environment variables are present.

## 1. Create Firebase Project

1. Open Firebase Console.
2. Create a project for B1 Polish Trainer.
3. Add a Web app.
4. Copy the public web config values into local `.env` or GitHub Pages build environment.

Use `.env.example` as the template:

```powershell
Copy-Item .env.example .env
```

Required values:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`

Optional values:

- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`

Firebase web config is public client configuration, not a private server secret. Firestore security rules still must protect user data.

## 2. Enable Authentication

1. In Firebase Console, open Authentication.
2. Enable the Google provider.
3. Add authorized domains:
   - `localhost`
   - `ommmmm88888.github.io`

The app uses Firebase Authentication Google sign-in in the browser. Official reference: https://firebase.google.com/docs/auth/web/start

## 3. Enable Firestore

1. In Firebase Console, open Firestore Database.
2. Create a Firestore database.
3. Start with locked production rules and then add the app-specific user rules below.

Suggested first rules:

```text
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/progress/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

The first sync document path is:

```text
users/{uid}/progress/current
```

## 4. GitHub Pages Environment

GitHub Pages deploy is built by GitHub Actions, so the Vite variables must be available during `npm run build`.

Add repository variables or secrets for:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- optional Firebase values listed above

The workflow already passes these repository Variables into the Vite build step. If the Variables
are absent, the production app remains local-first and shows sync as not configured.

## 5. Sync Model

Phase 1 stores one progress snapshot:

```text
users/{uid}/progress/current
```

Snapshot sections:

- `trainer`
- `grammar`
- `intensive`
- `writing`
- `speaking`
- `reading`
- `listening`
- `mock`

Merge strategy:

- local-first and non-destructive;
- never deletes local-only progress automatically;
- preserves a local backup before cloud sync under `b1:backup:before-cloud-sync:{timestamp}`;
- if a section has `updatedAt`, newer section wins;
- if section timestamps are absent, remote section can fill/replace that section during manual sync;
- automatic background sync is intentionally out of scope for this slice.

## 6. Current Limitations

- The first slice is manual sync only.
- Production Firestore sync is not proven until Firebase config is added and a signed-in write/read succeeds.
- No conflict UI exists yet.
- Local training must remain fully usable without login.
