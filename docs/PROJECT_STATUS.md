# JobLink Project Status & Module Tracking

This document tracks all active modules, pull requests, dependencies, and integration status for JobLink.

---

## 📊 Modules & Pull Request Overview

| Module | Owner | Branch | PR | Status | Depends On |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Module 1: Authentication & Authorization** | [@Noreen73](https://github.com/Noreen73) | `feature/auth` | [#1](https://github.com/Ammar-creater/JobLink/pull/1) | Changes Requested | *None (Base Module)* |
| **Module 2: User Profile Management** | [@Noreen73](https://github.com/Noreen73) | `feature/user-profile` | [#2](https://github.com/Ammar-creater/JobLink/pull/2) | Changes Requested | `Module 1 (feature/auth)` |
| **Module 3: Job Posting CRUD, Search, Filters & UI** | [@emanashrafch1212-hue](https://github.com/emanashrafch1212-hue) | `feature/job-posting` | [#3](https://github.com/Ammar-creater/JobLink/pull/3) | Changes Requested | `Module 1 (feature/auth)` |
| **Module 5: Employer Dashboard & Applications** | [@Noreen73](https://github.com/Noreen73) | `feature/employer-dashboard` | [#4](https://github.com/Ammar-creater/JobLink/pull/4) | Changes Requested | `Module 1 (feature/auth)`, `Module 3 (feature/job-posting)` |

---

## 🔀 Recommended Merge Sequence

```mermaid
graph LR
    M1[1. Module 1: Auth (#1)] --> M2[2. Module 2: User Profile (#2)]
    M1 --> M3[3. Module 3: Job Posting (#3)]
    M2 --> M5[4. Module 5: Employer Dashboard (#4)]
    M3 --> M5
```

1. **Module 1 (PR #1):** Core `User` model, JWT authentication, and authorization middleware.
2. **Module 2 (PR #2):** Profile management and file upload handling.
3. **Module 3 (PR #3):** Job posting management and public browsing UI (uses `User` model & auth from Module 1).
4. **Module 5 (PR #4):** Employer dashboard and application reviews (uses `User` from Module 1 and `JobPosting` from Module 3).
