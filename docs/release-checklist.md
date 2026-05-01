# Release Checklist

## Automated Proof

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run verify`

## PWA / Build Assets

- `dist/index.html` exists after build.
- Manifest exists in `dist`.
- Service worker exists if expected.
- Asset paths are compatible with `/b1/`.

## GitHub Pages

- Workflow exists: `.github/workflows/deploy-pages.yml`.
- GitHub Pages source should be set to `GitHub Actions`.
- Workflow should run install, lint, test if available, build, upload artifact and deploy.

## Manual Smoke Checklist

- App opens on `/b1/`.
- Top navigation switches between all modes.
- Vocabulary answer checking works.
- 12-day checklist persists after reload.
- 12-day summary changes after tasks are checked.
- Grammar answer checking works.
- Writing draft persists after reload.
- Speaking completion count changes.
- Reading result is saved.
- Listening shows fallback if SpeechSynthesis is unavailable.
- Mini-mock saves latest result.
- Offline reload works after first successful load.

## Before Public Release

- Run `npm run verify`.
- Inspect `dist`.
- Confirm GitHub Pages settings.
- Do not push tags until release candidate is intentionally approved.
