# ReachInbox Frontend

React 18 + TypeScript + Vite + React Router + Tailwind CSS. Talks to the
`reachinbox-kimi` backend over cookie-based sessions (no JWT, no token
storage) at `VITE_API_BASE_URL` (defaults to `http://localhost:5100`).

## What was verified in the build sandbox

Nothing was executed. This sandbox has no network access (`npm install`
returns `403 Forbidden` from the npm registry), so `npm install`,
`npm run dev`, `npm run typecheck`, and `npm run build` have never actually
been run against this code. Every file was hand-written and manually
cross-checked against:

- the real backend source (routes, controllers, Zod schemas, Prisma models)
  for the API contract - not guessed
- the actual React 18 / React Router 6 / Tailwind 3 / TypeScript 5.5 APIs
  from training knowledge, including known gotchas (e.g. controlled
  `contentEditable` caret-jumping, `RefObject` variance, `import.meta.env`
  typing, project-reference `tsc -b` pitfalls - see below)

**You must run these yourself and paste me the output:**

```bash
cd reachinbox-frontend
npm install
npm run typecheck
npm run build
npm run dev
```

## A tsconfig decision worth knowing about

The standard Vite React-TS template ships a *split* tsconfig
(`tsconfig.json` referencing `tsconfig.app.json` + `tsconfig.node.json` via
TypeScript project references, built with `tsc -b`). I deliberately used a
single flat `tsconfig.json` and `tsc --noEmit` instead. Project references
require getting `composite`/`noEmit` interactions exactly right, and I have
no way to actually run `tsc -b` here to confirm it resolves cleanly. A flat
config is strictly simpler and carries less risk of a subtle
misconfiguration I can't verify blind. If you'd prefer the split template
form later, it's a mechanical change, not a functional one.

## Two real backend contract issues (found, not invented)

1. **`GET /api/emails/sent` never returns `status: "failed"`.** Neither it
   nor `GET /api/emails/scheduled` does. The only place failed sends are
   visible is `GET /api/emails/search?status=failed`. The Sent page
   therefore has a "Sent / Failed" toggle: "Sent" calls `/api/emails/sent`,
   "Failed" calls `/api/emails/search?status=failed` - both real, existing
   endpoints, nothing invented.
2. **`GET /api/slack/callback` returns raw JSON instead of redirecting to
   `FRONTEND_URL`** the way the Google callback does. Not addressed here
   because Slack isn't represented anywhere in the supplied Figma, so no
   Slack UI was built at all, per the brief's own instruction not to add UI
   for backend capability the design doesn't call for.

## Deliberate scope decisions vs. the Figma

- **Rich text editor**: a small dependency-free `contentEditable` +
  `document.execCommand` editor covering Bold/Italic/Underline/
  Strikethrough/ordered & bulleted lists/Blockquote/Undo/Redo. The Figma's
  toolbar also shows alignment, indent/outdent, and a font-size control;
  those were left out to keep the dependency-free approach reasonable in
  scope (a full WYSIWYG library would need `npm install`, which isn't
  possible here anyway, and the brief asks to avoid unnecessary
  dependencies).
- **"To: <name>"**: the Figma shows a person's name after "To:", but
  `ScheduledEmail.recipient` in the schema is only ever an email address -
  there's no separate recipient-name field anywhere in the backend. Rows
  show the real recipient email instead of a fabricated name.
- **Email detail view**: opens as a modal (not a full route/slide-over) and
  shows only fields the backend actually returns (recipient, sender, status,
  scheduled/sent time, body). The Figma's attachment thumbnails, reply/
  archive/delete actions, and "to me" thread chrome aren't backed by any
  endpoint (no attachments, no threads, no received mail in this system at
  all - it only sends), so they're not built.
- **Star icon** in list rows is rendered to match the Figma but is
  decorative/non-interactive - there's no starring endpoint.
- **Login page's email/password fields**: rendered to match the Figma but
  disabled with a caption explaining Google is the only working sign-in
  method, since the backend has no email/password auth route at all. This
  was a deliberate choice over silently omitting Figma elements or building
  fake authentication - both of which the brief explicitly rules out.
- **Attachment (paperclip) button** in Compose: rendered, disabled, with a
  tooltip - the campaign schema has no file/attachment field.
- **Delay field is labeled "(ms)"** explicitly, since the backend's
  `delayBetweenEmails` is genuinely milliseconds (max 3,600,000), while the
  Figma just shows an unlabeled "00" input - leaving it unlabeled risked
  someone typing "30" expecting 30 seconds and getting 30ms.

## Setup

```bash
npm install
cp .env.example .env   # edit VITE_API_BASE_URL if your backend isn't on :5100
npm run dev             # http://localhost:5174
```

The backend must be running on `http://localhost:5100` with
`FRONTEND_URL=http://localhost:5174` in its own `.env`, or the session
cookie won't round-trip correctly (cross-origin cookies require the
backend's CORS `origin` to exactly match where this app is served from).

## What I could not verify end-to-end (no backend running here either)

- Actual Google OAuth round trip and session cookie behavior
- Actual campaign creation against a live backend, BullMQ, and Ethereal
- Whether Tailwind's `.ts` config file loads cleanly with your exact
  installed Tailwind patch version (native TS config support landed in
  Tailwind 3.4; the pinned `^3.4.10` should have it, but I can't run it here
  to confirm)

Please run through the manual checklist from your original brief once
`npm run dev` is up, and send me anything that doesn't work.