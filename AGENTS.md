# B1 Polish Language Exam Trainer - Agent Guide

## Project Identity
- Project name: B1 Polish Language Exam Trainer
- Local path: F:\repo\b1
- Public URL: https://ommmmm88888.github.io/b1/
- Stack: React + TypeScript + Vite + PWA + GitHub Pages
- Primary UI language: Russian
- Study language: Polish
- Target user: Ukrainian/Russian-speaking learner preparing for Polish B1

## Operating Rules
- Use PowerShell only.
- Do not use bash / WSL / sh.
- Do not touch F:\repo\rs unless explicitly requested.
- Do not add backend unless explicitly requested.
- Do not commit secrets.
- Do not rewrite/delete/move release tags unless explicitly requested.
- Keep changes incremental and proof-driven.
- Do not claim PASS without real proof.

## Required Proof Commands
- `npm run verify`
- `npm run build` when needed
- `npm run preview -- --host 127.0.0.1 --port 4173` for local smoke when UI changes
- Stop preview and confirm port 4173 is free.
- After push, watch GitHub Pages workflow.

## Product Principles
- Practical B1 exam usefulness first.
- Russian explanations, Polish examples.
- No childish gamification.
- Premium compact desktop-first UI.
- Local-first/PWA behavior.
- Honest limitations for local pattern-based helper.

## Important Proven Behaviors Not To Regress
- Trainer Enter-flow works.
- Trainer persistence works.
- Trainer sync works.
- Grammar Enter-flow works.
- Grammar persistence works.
- Grammar sync works.
- Google login works.
- Handbook Как сказать? is local pattern-based, not full AI translation.
- PWA/service worker should not trap stale builds.

## Key Implementation Notes
- Trainer uses aggregate progress + session snapshot.
- Grammar uses aggregate progress + session snapshot.
- Firestore path: `users/{uid}/state/progress`
- Sync must include visible session state, not only counters.
- Empty local state must not overwrite non-empty cloud state.
- Keyboard flow pattern: Enter -> Проверить -> Enter -> Следующее -> focus input.
- For handbook content, prefer data-driven files.

## Release/Deploy Notes
- GitHub Pages deploys from main via workflow.
- Existing v0.1.0 tag may point to an older commit; do not move it without explicit approval.
- Public URL must be checked after deploy when UI changes.
