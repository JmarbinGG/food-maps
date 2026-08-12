# Engineering Roadmap

Working backlog for engineering process, documentation, and infrastructure work.
This is not a product roadmap; feature work lives elsewhere.

**Last reviewed:** 2026-08-11
**Target:** by end of year, a new contributor can clone, run, and ship a change
without a synchronous handoff from an existing team member.

---

## How to use this document

Tasks are grouped into phases. Phases are ordered by dependency, not by
importance — Phase 1 is first because Phase 2 cannot work without it.

Within a phase, order is roughly by cost-to-value. Check items off in place.
When a task produces a document, link it from the table in
[Documentation set](#documentation-set) rather than leaving it orphaned.

Security work is tracked separately in [SECURITY_REVIEW.md](./SECURITY_REVIEW.md),
which currently has one **critical** open item: database credentials that were
committed to the public repository and need rotating. That outranks everything
in this document.

---

## Status snapshot

Recorded so future readers know what the plan was reacting to.

| Area | State as of 2026-08-11 |
|---|---|
| Backend | FastAPI, ~19K lines Python. `backend/app.py` is 5,109 lines with 92 route handlers |
| Frontend | ~46K lines. React 18 UMD + in-browser Babel from CDN. No `package.json`, no build step |
| Tests | pytest, scoped to `backend/ai/tests` only. 37 tests, 15 currently fail to collect |
| Lint / format | None configured (no ESLint, Prettier, ruff, black, mypy, pre-commit) |
| Migrations | No framework. `create_all()` + startup `ALTER TABLE` + 16 ad-hoc scripts in `backend/scripts/` |
| CI/CD | None. `.github/` contains only `copilot-instructions.md` |
| Deploy | Single EC2 box, systemd (`foodmaps.service`), **one uvicorn worker** |
| Monitoring | None. `check_server.sh` is manual |
| Docs | 32 files / ~9,100 lines in `guides/`, no index, heavy overlap |
| Repo | Public. 184 commits, 5 contributors, 142 from one person. No branch protection |

---

## Phase 1 — Make the codebase checkable

CI/CD is the top priority, but a pipeline today would have nothing to run.
Everything here is a prerequisite for Phase 2.

### Repo hygiene (do first, cheap and independent)

- [ ] Enable branch protection on `main`: require PR, block force-push, block
      deletion. Direct pushes are currently happening.
- [ ] Decide on review policy. With a 3-person team, "1 approval required" is
      workable; if it stalls, allow self-merge for docs and config only.
- [ ] Agree a branch naming convention and write it down. Long-lived personal
      branches (`aslan`, `jahan`) exist on the remote — decide whether they stay
      or get replaced by short-lived feature branches.
- [ ] Prune or archive stale remote branches once the above is settled.
- [ ] Commit `.dockerignore`. It currently exists on one machine and is
      untracked, which means any other developer's `docker build` can copy a
      real `.env` into an image layer. See S-12 in the security review.
- [ ] Untrack the 13 committed `.pyc` files under `backend/__pycache__/` and
      `backend/scripts/__pycache__/`. They predate the `.gitignore` rule and
      show up as modified on every run, adding noise to every diff. See S-13.

### Tooling baseline

- [ ] Add Python formatter + linter (`ruff` covers both; `ruff format` replaces
      black). Configure in `pyproject.toml`.
- [ ] Add JS formatter (Prettier). Skip ESLint initially if it produces
      thousands of findings; formatting alone removes most diff noise.
- [ ] Run the formatter over the codebase in a single isolated commit, so the
      reformat never mixes with logic changes. Record that commit SHA in
      `.git-blame-ignore-revs`.
- [ ] Add `pre-commit` so formatting is enforced locally rather than debated in
      review.

### Get tests green

- [ ] Fix the 15 collection errors in `backend/ai/tests` (missing deps or broken
      imports in the current env). A suite that cannot collect is not a suite.
- [ ] Document how to run tests in the contributing guide, including required
      env vars.
- [ ] Add smoke tests for the highest-risk non-AI paths: auth (login, signup,
      password reset) and the listing claim lifecycle. Not full coverage —
      just enough that CI can catch a broken deploy.
- [ ] Decide the coverage stance. Recommend: no percentage target, but new
      backend routes ship with at least one test.

### Migrations — pick a story

Currently three mechanisms coexist. This blocks safe automated deploys.

- [ ] Choose one: (a) adopt Alembic properly (already in `requirements.txt` but
      unused), or (b) formalize the numbered-script convention with a tracking
      table. Recommend (a).
- [ ] Baseline the current production schema as the initial revision.
- [ ] Remove the best-effort `ALTER TABLE` block from application startup once a
      real migration path exists — schema changes should not race app boot.
- [ ] Document what `backend/scripts/*.py` migrations have already been applied
      in production. This knowledge currently lives in one person's head.

---

## Phase 2 — CI/CD

Short phase, because by now it just wires up checks that already run locally.

- [ ] **Decide repo ownership before building this.** Going private ends free
      GitHub Actions minutes for the current account. Transfer to the All Good
      Living org so billing and access sit with the organization.
      See [SECURITY_REVIEW.md](./SECURITY_REVIEW.md) for the privacy discussion.
- [ ] CI on pull request: format check, lint, pytest.
- [ ] Add dependency and secret scanning to CI (see security doc).
- [ ] CD to production. Start with manual-trigger deploy rather than
      auto-deploy-on-merge; with one server and no staging, an automatic deploy
      on a bad merge takes the site down.
- [ ] Add a migration step to the deploy, gated on Phase 1 being complete.
- [ ] Document rollback: how to get back to the previous known-good revision.
      This matters more than the deploy itself.
- [ ] Consider a staging environment. Optional at this size, but it is the
      difference between "deploy is safe" and "deploy is fast".

---

## Phase 3 — Operability

Cheap, currently missing, and higher payoff than most feature work.

- [ ] Add uptime monitoring with alerting to a channel someone actually reads.
      Right now, if the box goes down at 2am nobody finds out until a user
      complains.
- [ ] **Automate database backups and test a restore.** See the note under
      [Deferred](#deferred-and-explicitly-not-doing) about why this replaces the
      git-backup idea.
- [ ] Write a one-page runbook: how to check health, read logs, restart, and
      what to do if the DB is unreachable. Fold in `check_server.sh` and the
      relevant parts of `guides/DEPLOYMENT_GUIDE.md`.
- [ ] Resolve or document the single-worker constraint. Production runs one
      uvicorn worker because pending claim confirmations, the 5-minute
      auto-release timers, and all rate limiting are in-process memory. Running
      two workers silently breaks claim flows. This is the real scaling ceiling
      and it needs to be written down even if it is not fixed.
- [ ] Add structured logging with a request ID, so a user-reported problem can
      be traced to a specific request.

---

## Documentation set

Consolidation matters more than volume here. There are already ~9,100 lines in
`guides/`, including nine overlapping documents on favorites/bookmarks
(`FAVORITES_GUIDE`, `FAVORITES_FEATURE`, `FAVORITES_FEATURE_OVERVIEW`,
`FAVORITES_IMPLEMENTATION`, `FAVORITES_CHECKLIST`, `FAVORITES_FIX_SUMMARY`,
`FAVORITES_TROUBLESHOOTING`, `BOOKMARK_IMPLEMENTATION`,
`BOOKMARK_QUICK_START`). A new contributor reading those in sequence learns less
than one who reads none of them.

### Documents to produce

| Document | Purpose | Priority | Status |
|---|---|---|---|
| `AGENTS.md` (repo root) | Machine-readable conventions and constraints for AI agents | High | Not started |
| `CONTRIBUTING.md` | Branch/PR/commit conventions, local setup, how to run tests | High | Not started |
| `docs/ARCHITECTURE.md` | System design, request flow, cloud layout, known constraints | High | Not started |
| `docs/CONFIGURATION.md` | Canonical env var reference | Medium | Not started |
| `docs/RUNBOOK.md` | Deploy, health checks, logs, incident response | Medium | Not started |
| `docs/DATA_HANDLING.md` | What PII is stored, who can access prod, retention | Medium | Not started |
| `docs/index` or `docs/README.md` | Entry point that routes readers to the right doc | Medium | Not started |
| `docs/SECURITY_REVIEW.md` | Findings and remediation | Done | [Written](./SECURITY_REVIEW.md) |

### Consolidation tasks

- [ ] Merge the nine favorites/bookmark documents into one feature reference.
- [ ] Separate durable references from one-off implementation notes. Anything
      that reads like a PR description (`*_FIX_SUMMARY`, `*_CHECKLIST`,
      `IMPLEMENTATION_SUMMARY`) is archaeology — move it to `guides/archive/` or
      delete it. Git history already preserves it.
- [ ] Write the index, and require that new guides be linked from it.
- [ ] Fix README drift: it references `backend/auth.py` and
      `backend/requirements.txt`, neither of which exists. Auth lives inline in
      `backend/app.py` and dependencies are in the root `requirements.txt`.
- [ ] Reconcile `MAPBOX_ACCESS_TOKEN` (README) vs `MAPBOX_TOKEN` (`.env.example`).
      Both patterns appear in code. Pick one, then write `docs/CONFIGURATION.md`
      as the single source of truth.

### On low-level documentation

The original plan questioned whether low-level docs are needed given that AI
agents lead development. Split the question:

- **Per-function docstrings and inline commentary:** agreed, not worth the
  effort. Skip.
- **Convention and constraint documents:** the opposite. These *are* the agent's
  context window. An agent that has not been told about the single-worker
  constraint or the `app.py` size problem will cheerfully make both worse.

`.github/copilot-instructions.md` (293 lines) is currently the most complete
internal engineering document in the repo, and Cursor does not read it. Porting
it to `AGENTS.md` at the root, plus scoped rules under `.cursor/rules/` for
backend vs frontend, is close to the highest-leverage single task on this list
and is mostly a copy edit of something that already exists.

### Constraints any guidelines document must encode

Write these down explicitly or they will be violated by the next contributor,
human or otherwise:

1. `backend/app.py` is 5,109 lines and serves HTML, the REST API, and static
   files. Agents append to the largest file they can find. Define a splitting
   convention — domain routers, the way `backend/ai/routes.py` already does it —
   or this file will be 9,000 lines by December.
2. Production runs a single worker on purpose. State that, and state why.
3. There is no frontend build. JSX compiles in the browser and cache-busting is
   done by hand. Either document that as the standard or plan the migration off
   it; do not let guidelines describe a build pipeline that does not exist.
4. There is no migration framework yet. Until Phase 1 resolves this, schema
   changes need an explicit process.

---

## Development process

- [ ] Adopt biweekly sprints, contingent on availability. Two weeks is the right
      floor for a part-time team — weekly sprints spend more time in ceremony
      than in the sprint.
- [ ] Keep a separate goals document for larger initiatives, with a short
      written brief before work starts. Worth doing specifically because AI-led
      development makes it very cheap to build the wrong thing quickly.
- [ ] Address the bus factor. 142 of 184 commits come from one contributor, and
      the operational knowledge (deploy steps, which migrations have run in
      prod, why there is one worker) is not written down anywhere. The
      documentation tasks above are the mitigation; treat them as such rather
      than as tidying.

---

## Deferred and explicitly not doing

**Nightly `git clone` to S3 — deprioritized.** Git is already the most
replicated asset the project owns: GitHub holds it, and every developer has a
complete clone with full history. The unrecoverable asset is the production
database. Same effort, much higher value, so the backup task moved to Phase 3
and points at the database instead.

**Detailed cost and scalability modelling — deferred, with one exception.**
Correct that this does not matter at current scale. The exception is that the
single-worker constraint is a hard ceiling regardless of spend, and AI token
usage is a real variable cost that scales with traffic rather than with users.
Note both in `ARCHITECTURE.md`; skip the spreadsheet.

**Full frontend rewrite / build pipeline — deferred**, unless the mobile app
becomes real. See below.

---

## Longer-term backlog

Not scheduled. Recorded with the caveats that affect how they should be scoped.

- **Donation page with payments.** This is not "basic payment handling" — it is
  the item with the most compliance weight on the list. Use hosted checkout
  (Stripe Checkout or similar) so card data never reaches your servers, which
  keeps you out of PCI scope. Decide the nonprofit receipting and refund story
  early; that is harder to retrofit than the button.
- **AI agent PR review.** Fits naturally into Phase 2 once CI exists.
- **Refine the main Food Maps page UI.**
- **Supplier page for listing submission.** Check first whether this is actually
  a new surface. Donor roles and listing creation already exist, so this may be
  a permissions and onboarding change rather than a new page.
- **Mobile app.** This would be a rewrite, not a port. There is no component
  build, module system, or shared business logic to reuse — the frontend is
  script tags and in-browser Babel. If mobile is genuinely on the roadmap, that
  is the strongest argument for doing the frontend build work earlier, and it
  should be decided before more UI is written.

---

## Open decisions

Blocking or near-blocking. Each needs an owner and a date.

| Decision | Why it blocks | Owner |
|---|---|---|
| Transfer repo to All Good Living org? | Gates both going private and CI billing | |
| Alembic or formalized scripts? | Gates automated deploys | |
| Staging environment, yes or no? | Shapes the whole CD design | |
| Is the mobile app real within 12 months? | Determines whether frontend build work is urgent | |
| Who owns production access? | Prerequisite for `DATA_HANDLING.md` | |
