# Firebase Google Login

The app remains local-first. Firebase is optional and is enabled only when the Vite environment variables are present during build.

## Project

- Firebase project id: `device-streaming-c9d158cc`
- Web app display name: `B1 Polish Trainer`
- GitHub Pages remains the hosting target: https://ommmmm88888.github.io/b1/
- Firebase Hosting is not used.

## Environment Variables

Required:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`

Optional:

- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

Use `.env.example` as the local template and put real values in `.env.local`. Do not commit `.env.local`.

Firebase web config is public client configuration, not a private service-account secret. Still, keep real values out of source files and pass them through environment configuration.

## GitHub Pages Build

GitHub Actions receives the `VITE_FIREBASE_*` values as repository Variables. The deploy workflow passes those values to `npm run build`.

If those Variables are absent, the public app stays safe: it shows `Google вход`, `не настроено`, and does not initialize Firebase.

## Firebase Console Setup

Google login requires these manual console settings:

1. Open Firebase Console > Authentication > Sign-in method.
2. Enable the Google provider.
3. Open Authentication > Settings > Authorized domains.
4. Add:
   - `localhost`
   - `127.0.0.1`
   - `ommmmm88888.github.io`

The Firebase CLI used in this repo can create/list web apps and print SDK config, but it does not expose a safe command here for enabling the Google provider or authorized domains.
`gcloud` was not available in the release environment used for the Google login smoke, so provider/domain setup remains a Firebase Console step.

## Current Behavior

Configured build:

- Signed-out UI shows `Google вход`.
- Clicking it starts Firebase Auth Google popup flow.
- If popup is blocked, the app shows a short Russian error.
- If login succeeds, the app shows the display name or email and `вход выполнен`.
- `Выйти` signs out.

Missing-config build:

- The app does not initialize Firebase.
- UI shows `Google вход`, `не настроено`, and an explanation.
- Training modules continue to work.

## Cloud Progress Sync

Google login is now connected to Firestore progress sync. Signed-in users store progress under:

```text
users/{uid}/state/progress
```

The document contains one schema-versioned progress snapshot with sections for trainer, intensive, grammar, writing, speaking, reading, listening and mock progress.

Firestore rules allow only the authenticated owner to read/write their own progress:

```text
match /users/{userId}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

On sign-in, the app:

- reads localStorage progress;
- reads Firestore progress;
- merges both without erasing non-empty progress;
- saves the merged result to Firestore and localStorage;
- starts a live Firestore listener.

When signed out, the app continues to use localStorage only.

## Sync Limitations

- The sync is progress-focused and does not store private profile data.
- Offline changes remain local until the next successful signed-in sync.
- Cross-device sync must be proven with two real signed-in browser/device contexts before a release note should claim PASS.
