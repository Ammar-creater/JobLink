# Employer Dashboard API

Endpoints for employers to manage their job postings, inspect applicant details, and update application review statuses.

## Base URL
http://localhost:5000/api

## Endpoint: `GET /api/employer/jobs`

Returns all job postings created by the authenticated employer, sorted newest first (`createdAt: -1`).

### Access
Requires role: `employer` (`protect` and `authorize("employer")` middlewares).

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | `Bearer <jwt_token>` |

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "count": 1,
    "jobs": [
      {
        "_id": "6ab292d65c72cee3ec3ef786",
        "employerId": "6ab145174a7d9025b3d3d16f",
        "title": "Backend Developer",
        "description": "Develop and maintain RESTful APIs using Node.js and Express.",
        "type": "job",
        "category": "6aacef3f4e5718d1ddfc58ab",
        "location": "Lahore",
        "salary": "80000 PKR/month",
        "salaryValue": 80000,
        "status": "approved",
        "requirements": [
          "Node.js",
          "Express",
          "MongoDB"
        ],
        "deadline": "2026-11-30T00:00:00.000Z",
        "createdAt": "2026-09-22T14:38:14.771Z",
        "updatedAt": "2026-09-22T14:38:14.771Z"
      }
    ]
  }
}
```

### Error Response (401) - Missing / Invalid Token

```json
{
  "success": false,
  "message": "Not authorized, no token provided"
}
```

### Error Response (403) - Forbidden (Non-Employer Role)

```json
{
  "success": false,
  "message": "Forbidden: insufficient permissions"
}
```

### Error Response (500)

```json
{
  "success": false,
  "message": "Server error",
  "error": "Database error details"
}
```

---

## Endpoint: `GET /api/employer/jobs/:jobId/applicants`

Retrieves all applications submitted for a specific job posting owned by the authenticated employer. Populates applicant details (`name`, `email`, `phone`, `skills`, `resumeUrl`).

### Access
Requires role: `employer` (`protect` and `authorize("employer")` middlewares). Must own the specified job posting.

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | `Bearer <jwt_token>` |

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jobId` | ObjectId | Yes | 24-character hexadecimal MongoDB ObjectId of the job posting |

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "job": "Backend Developer",
    "count": 1,
    "applications": [
      {
        "_id": "6ab5e2c7a102b45e78c90123",
        "jobId": "6ab292d65c72cee3ec3ef786",
        "userId": {
          "_id": "6aae33351106b9291d2cc1b2",
          "name": "Jane Doe",
          "email": "jane@example.com",
          "phone": "+92 300 1234567",
          "skills": [
            "Node.js",
            "Express",
            "MongoDB"
          ],
          "resumeUrl": "/uploads/6aae33351106b9291d2cc1b2-1789828178467.docx"
        },
        "resumeUrl": "/uploads/6aae33351106b9291d2cc1b2-1789828178467.docx",
        "status": "pending",
        "createdAt": "2026-09-23T10:15:30.123Z",
        "updatedAt": "2026-09-23T10:15:30.123Z"
      }
    ]
  }
}
```

### Error Response (400) - Bad ObjectId Format

```json
{
  "success": false,
  "message": "Invalid job id"
}
```

### Error Response (401) - Missing / Invalid Token

```json
{
  "success": false,
  "message": "Not authorized, no token provided"
}
```

### Error Response (403) - Insufficient Permissions (Not an Employer)

```json
{
  "success": false,
  "message": "Forbidden: insufficient permissions"
}
```

### Error Response (403) - Ownership Check Failed

```json
{
  "success": false,
  "message": "You do not own this job posting"
}
```

### Error Response (404) - Job Not Found

```json
{
  "success": false,
  "message": "Job not found"
}
```

### Error Response (500)

```json
{
  "success": false,
  "message": "Server error",
  "error": "Database error details"
}
```

---

## Endpoint: `PUT /api/employer/applications/:applicationId/status`

Updates the review status of an application for an employer's job posting (`pending`, `accepted`, or `rejected`).

### Access
Requires role: `employer` (`protect` and `authorize("employer")` middlewares). Must own the job posting associated with the application.

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | `Bearer <jwt_token>` |
| `Content-Type` | string | Yes | `application/json` |

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `applicationId` | ObjectId | Yes | 24-character hexadecimal MongoDB ObjectId of the application |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | New application status. Allowed values: `pending`, `accepted`, `rejected` |

> **Automatic Notification Side Effect:**
> When an employer updates an application's status, a notification of type `"application_status"` is automatically generated for the applicant (`userId`) with message: `Your application for "<jobTitle>" has been <status>.` (handled safely within a try/catch block so notification failures do not interrupt the status update response).

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "application": {
      "_id": "6ab5e2c7a102b45e78c90123",
      "jobId": {
        "_id": "6ab292d65c72cee3ec3ef786",
        "employerId": "6ab145174a7d9025b3d3d16f",
        "title": "Backend Developer",
        "description": "Develop and maintain RESTful APIs using Node.js and Express."
      },
      "userId": "6aae33351106b9291d2cc1b2",
      "resumeUrl": "/uploads/6aae33351106b9291d2cc1b2-1789828178467.docx",
      "status": "accepted",
      "createdAt": "2026-09-23T10:15:30.123Z",
      "updatedAt": "2026-09-24T12:00:00.000Z"
    }
  },
  "message": "Application status updated"
}
```

### Error Response (400) - Bad ObjectId Format

```json
{
  "success": false,
  "message": "Invalid application id"
}
```

### Error Response (400) - Invalid Status Value

```json
{
  "success": false,
  "message": "Status must be pending, accepted, or rejected"
}
```

### Error Response (401) - Missing / Invalid Token

```json
{
  "success": false,
  "message": "Not authorized, no token provided"
}
```

### Error Response (403) - Insufficient Permissions (Not an Employer)

```json
{
  "success": false,
  "message": "Forbidden: insufficient permissions"
}
```

### Error Response (403) - Ownership Check Failed

```json
{
  "success": false,
  "message": "You do not own the job for this application"
}
```

### Error Response (404) - Application Not Found

```json
{
  "success": false,
  "message": "Application not found"
}
```

### Error Response (500)

```json
{
  "success": false,
  "message": "Server error",
  "error": "Database error details"
}
```

---

## Example Requests

```http
GET /api/employer/jobs
Authorization: Bearer <employer_jwt_token>

GET /api/employer/jobs/6ab292d65c72cee3ec3ef786/applicants
Authorization: Bearer <employer_jwt_token>

PUT /api/employer/applications/6ab5e2c7a102b45e78c90123/status
Authorization: Bearer <employer_jwt_token>
Content-Type: application/json

{
  "status": "accepted"
}
```
