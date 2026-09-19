# JobLink API Documentation

This directory contains endpoint and schema specifications for all modules in JobLink.

---

## 📖 Module API Documentation Guidelines

Every module must add a dedicated markdown specification at:
```text
docs/api/<module-name>.md
```
(e.g., `docs/api/auth.md`, `docs/api/jobs.md`, `docs/api/profile.md`, `docs/api/employer-dashboard.md`).

---

## 📝 Required Document Structure

Each `<module-name>.md` file should include:

1. **Module Overview:** Brief description of the domain and functionality.
2. **Database Models & Schemas:**
   - Model name, collection name, field types, required fields, defaults, validations, and references (`ObjectId`).
3. **Endpoints Reference:**
   - **Method & URL Path:** (e.g., `POST /api/jobs`)
   - **Access Level:** (Public, Private - Employer, Private - Jobseeker, Private - Admin)
   - **Headers:** (e.g., `Authorization: Bearer <token>`, `Content-Type: application/json`)
   - **Request Body / Query Params:** Sample JSON payloads and allowed query filters.
   - **Response Format:**
     - Success responses (`200 OK`, `201 Created`) with sample JSON matching `{ success: true, data: ... }`.
     - Error responses (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Server Error`).
4. **Postman / Testing Notes:** Guidance for testing via the project Postman collection in `docs/`.
