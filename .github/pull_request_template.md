## What was done
<!-- Describe the features, bug fixes, or architectural changes introduced in this PR. -->

## How to run and test
<!-- Provide step-by-step instructions to test these changes locally (e.g., Postman requests, UI steps, sample payloads). -->

## Depends on other modules
<!-- List any models, middleware, or PRs this feature depends on (e.g., feature/auth for JWT, feature/job-posting for JobPosting model). -->

---

## Pre-merge Checklist
- [ ] Server starts without errors (`npm start` in `server/`)
- [ ] Postman tests pass with expected status codes (200, 201, 400, 401, 403, 404)
- [ ] No `.env`, `node_modules/`, or uploaded files in `uploads/` are committed
- [ ] Branch is synced with latest `main` (`git fetch origin && git merge origin/main`)
- [ ] Model and file require/import paths match exact case on disk
- [ ] Standard JSON response format `{ success, data, message }` is used
