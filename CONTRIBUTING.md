# JobLink Team Contributing Guidelines & Workflow

Welcome to the **JobLink** development team! To ensure smooth collaboration, maintain code quality, and prevent merge conflicts across modules, all contributors must follow the guidelines outlined below.

---

## 1. Core Architectural & Code Conventions

### 🏷️ Unified Models & Naming
- **One Job Model (`JobPosting`):** The canonical model for job listings is `JobPosting` located at `server/models/JobPosting.js`. Never create alternative or duplicate job models (e.g., `Job.js`).
- **Standard User ID Reference:** Always use `req.user._id` across all controllers and middleware to identify the authenticated user.
- **Exact File-Name Casing:** Linux and Docker production environments use case-sensitive file systems. Ensure import and require paths match file names exactly:
  - **Models:** PascalCase (e.g., `User.js`, `JobPosting.js`, `Category.js`, `Application.js`).
  - **Controllers & Routes:** camelCase (e.g., `jobController.js`, `authController.js`, `dashboardController.js`).

### 📦 Standard API Response Shape
All backend endpoints must return consistent JSON responses:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation description (optional on simple reads)"
}
```
For errors:
```json
{
  "success": false,
  "message": "Human-readable error explanation"
}
```

### 🔒 Security & Environment Hygiene
- **Never commit `.env` files, `node_modules/`, or uploaded files (`uploads/`).** Always verify your staging area before committing (`git status`).
- Always validate ObjectIds using `mongoose.Types.ObjectId.isValid(id)` before passing IDs to Mongoose queries.
- Sanitize and escape user inputs used inside regular expressions (`$regex`) to prevent ReDoS (Regular Expression Denial of Service).
- Never allow clients to self-assign sensitive roles or bypass workflow statuses (e.g., setting `role: "admin"` or `status: "approved"`).

### 🧩 Shared File Integration (`server/index.js` & `client/src/App.js`)
- In `server/index.js`, add only your module's route middleware mount. Do not overwrite or reorder existing route mounts or centralized error handlers.
- In `client/src/App.js`, add only your module's page routes and navigation items.

---

## 2. Git Workflow & Review Process

### 🔄 Working on Features
1. **Branch Naming:** Create feature branches off `main` using standard prefixes: `feature/<feature-name>` (e.g., `feature/auth`, `feature/job-posting`).
2. **Sync Before Every Push:**
   Before pushing your commits to GitHub, always pull latest changes from `main`:
   ```bash
   git fetch origin
   git merge origin/main
   ```
   Resolve any conflicts locally, run and verify your tests, and then push.
3. **No Force Pushes or Rebases on Shared Remote Branches:** Keep branch history intact.
4. **Pull Requests:** Open a PR against `main` using the provided Pull Request Template.
5. **Merging Policy:** Only the repo reviewer/owner merges PRs into `main`.
6. **Addressing Reviews:** After receiving review feedback, push your fixes to the same branch and comment on the PR summarizing what was resolved.

---

## 3. Module Dependency & Merge Order

To ensure modules integrate smoothly without duplicate models or broken references, PRs will be reviewed and merged in the following sequence:

1. **PR #1: `feature/auth` (Module 1 — Auth & JWT)**
   - Establishes `User` model, register/login endpoints, and JWT `protect` / `authorize` middleware.
2. **PR #2: `feature/user-profile` (Module 2 — Profiles & Uploads)**
   - Extends `User` model with profile fields and static file upload handling.
3. **PR #3: `feature/job-posting` (Module 3 — Job CRUD, Filters & UI)**
   - Implements `JobPosting` and `Category` models, search/filters, and frontend UI. Integrates real JWT auth from Module 1.
4. **PR #4: `feature/employer-dashboard` (Module 5 — Dashboard & Applications)**
   - Implements `Application` model and dashboard routes referencing the canonical `JobPosting` model from Module 3.
