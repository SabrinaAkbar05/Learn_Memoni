# Momi — Learn Memoni Studio (React 3.0)

A feature-rich, responsive **React 19 + TypeScript + Vite** Memoni language-learning platform, migrated from the owner's `Memoni-Webapp-main.zip` and an earlier 11-topic version. The implementation has no fake user accounts, no fabricated leaderboards, and no hard-coded pronunciation for words without original audio.

## Quick start (Windows / macOS / Linux)

Requirements: **Node.js 20.19+ or 22.12+**, npm, modern browser.

```bash
npm install
npm run dev
```

The terminal shows a URL such as `http://localhost:5173/`. Open it in your browser. The platform works immediately in **local mode**—no database, login, or payment required.

```bash
npm test                 # source integrity and learning-logic checks
npm run typecheck        # TypeScript checks
npm run build            # production build in dist/
npm run preview          # preview optimized site locally
```

## What's included

| Feature | Works with local setup | Needs Firebase configuration |
|---|---|---|
| Dashboard, responsive sidebar, dark mode, mobile navigation | Yes | No |
| Illustrated learner avatars (12) + 4-step onboarding | Yes | No |
| 222 dictionary entries, 11 topics, keyword/search filters | Yes | No |
| 55 supplied source pronunciation files | Yes | No |
| 5 original Google Drive lesson links | Yes, if file sharing permissions allow | No |
| Structured lessons and completion tracking | Yes | No |
| Flashcards, spaced repetition, multiple-choice quizzes | Yes | No |
| XP, streaks, stats, achievements, daily missions | Yes | No |
| Momi Talk: four *guided* scenarios using actual vocabulary | Yes | No |
| Personal heritage storybook | Yes | No |
| Favorites, personal word notes, custom video playlist | Yes | No |
| Microphone recording, playback, local recording download | Yes, on localhost or HTTPS | No |
| Community contribution drafts, review status | Yes, private local draft | Cloud submission needs Firebase |
| JSON personal progress backup/restore | Yes | No |
| Email/password and Google sign-in | No | Yes |
| Cross-device Firestore progress synchronization | No | Yes |
| Pronunciation and story uploads, expert moderation | No | Yes |
| Administrator team-role manager | No | Yes, initial admin assigned securely |
| PWA install and cached visited audio/pages | Yes after production build on HTTPS | No |

### Source data facts

* Latest uploaded GitHub ZIP: **145 entries in eight categories**, **55** `.m4a` recordings, and **5** Google Drive video IDs.
* Earlier 11-category archive: **220 entries**.
* Deduplicated merge: **222 unique word IDs**, eleven topics.
* Four source color terms have English/Urdu meanings but no Memoni script/romanization; they are visible for editorial review and excluded from playable exercises. Two further entries carry review flags. **No Memoni translation was invented.**
* Source metadata is in `src/data/words.json`, `audio-map.json`, `videos.json`. The source comparison is in `src/data/source-comparison.json`.
* Audio files are placed in `public/audio/` with the original filenames and casing.
* You must have the rights to publish the original audio and lesson videos publicly.

## Enable real accounts and database

1. Create or select your project at [Firebase Console](https://console.firebase.google.com/).
2. In **Authentication → Sign-in method**, enable **Email/Password** and **Google**. Add your deployment domain to **Authorized domains**.
3. Create a **Cloud Firestore** database and **Cloud Storage** bucket. Set the region appropriate for your users and budget; verify pricing and quotas. Do not leave either service in open test mode.
4. Under **Project settings → Your apps**, register a Web App and copy its `firebaseConfig` values.
5. Copy `.env.example` to `.env.local` and paste the settings. Never commit `.env.local`. Firebase web config values are public identifiers; security depends on rules and authentication, not hiding these values.
6. Install the Firebase CLI (if needed) and deploy the rules:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules,storage
```

7. Start or restart `npm run dev`. Open **Profile & avatars → Connect your account** to create a real learner account.
8. To appoint the *initial admin*, go to **Firestore → users → {your signed-in user's uid}**, and update the `role` field from `learner` to `admin` using the privileged Firebase Console. Do not add a public “become admin” API. Sign out and back in to refresh the role.
9. Under **Creator studio**, the admin can promote other learner accounts to `expert` or `admin`; the Firestore rules enforce the authorization. Expert accounts can review contributed phrases and stories, while learners cannot.

### Security configuration

* Firestore authorization rules: `firebase/firestore.rules`.
* Storage audio restrictions: `firebase/storage.rules` (audio MIME type, max 10 MB, per-user upload path).
* App configuration: `firebase.json`.
* Never embed Firebase Admin service-account keys or AI-model API secrets in React code.
* Review and test Firestore/Storage rules in the Firebase Emulator Suite before production. A successfully compiling UI is not a substitute for backend security testing.
* External Google Drive videos require appropriate sharing permissions. Their playback cannot be guaranteed by this source package.

### Deployment

**Netlify**: import repository, build command `npm run build`, publish directory `dist`. `netlify.toml` handles React Router rewrites. Add the `VITE_FIREBASE_*` variables through Netlify Environment Variables, then deploy.

**Firebase Hosting**: run `npm run build` followed by `firebase deploy --only hosting` after `firebase use --add`. `firebase.json` has the SPA rewrite to `/index.html`.

## Architecture

```text
src/
  components/    Avatar, AccountModal, StaffTools, WordCard, WordModal,
                 Layout, onboarding, companion
  data/          Real source vocabulary, recordings mapping, media catalog
  lib/           Learning reducer/context, local storage, spaced repetition,
                 Firebase auth, cloud sync, submission services
  pages/         Home, Learn, Dictionary, Practice, Talk, Challenges,
                 Media, Community, Heritage, Saved, Progress, Studio, Profile
  styles.css     Responsive light/dark design system
public/audio/    55 original recordings
public/         PWA icon, service worker, manifest
firebase/       Firestore and Storage rules
```

## Known limitations (transparent by design)

* **Firebase is optional and not provisioned in this ZIP.** Creating the Firebase project, enabling billing-sensitive services, adding credentials, and deploying are owner actions. No backend connection can be verified until those steps are completed.
* **Momi Talk is guided practice, not an AI chatbot.** AI-generated Memoni could be linguistically inaccurate without expert-reviewed language resources and a secure server-side AI endpoint.
* The archive is currently a **private collection and moderated submission workflow**, not a public live-searchable publication of approved stories. Publication permissions and consent require further policy decisions.
* Expert approval changes a submission's status, but it does not silently modify the version-controlled built-in dictionary. Expert-reviewed content is curated into an updated catalog release.
* **No public real-user leaderboard** is fabricated. Statistics reflect the current learner's activity only.
* The app uses browser `localStorage` as an offline-first local profile. For multiple unrelated accounts on the same device, use separate browser profiles until per-account local isolation is introduced.
* Original data contains language entries needing verification. The app leaves them marked rather than guessing.
* Microphone recording requires permission and a secure context (HTTPS or localhost).
* The source zip was reviewed and unit-tested in a workspace **without npm-registry access**. It passed source validation, but an actual npm dependency installation and full Vite production build could not be run here. Run `npm install && npm run build` on a network-enabled machine and address any build/environment issues before deploying.

## Credits

Original Memoni vocabulary, audio, and video references sourced from the provided `Memoni-Webapp-main.zip`, merged with the previous user-provided app. Momi Studio extends that work with React architecture, learning flows, twelve original code-based SVG avatars, and secure optional cloud integration.
