# User Profile Management API

Endpoints for retrieving and updating user profile information, as well as uploading resumes and profile photos.

## Base URL
http://localhost:5000/api

## Endpoint: `GET /api/users/me`

Retrieves the profile of the currently logged-in user. The password field is excluded from the returned document.

### Access
Requires login. Accessible to any authenticated user (`protect` middleware).

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | `Bearer <jwt_token>` |

### Success Response (200)

```json
{
  "user": {
    "_id": "6aae33351106b9291d2cc1b2",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "jobseeker",
    "phone": "+92 300 1234567",
    "bio": "Full-stack developer passionate about building scalable web applications.",
    "skills": [
      "JavaScript",
      "Node.js",
      "React",
      "MongoDB"
    ],
    "education": [
      {
        "degree": "BS in Computer Science",
        "institution": "National University of Sciences and Technology",
        "year": "2024"
      }
    ],
    "resumeUrl": "/uploads/6aae33351106b9291d2cc1b2-1789828178467.docx",
    "profilePhotoUrl": "/uploads/6aae33351106b9291d2cc1b2-1789829020967.PNG",
    "createdAt": "2026-09-18T10:05:00.000Z",
    "updatedAt": "2026-09-20T14:20:00.000Z"
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

### Error Response (404) - User Not Found

```json
{
  "message": "User not found"
}
```

### Error Response (500)

```json
{
  "message": "Server error",
  "error": "Database error details"
}
```

---

## Endpoint: `PUT /api/users/me`

Updates profile fields for the currently logged-in user. All fields are optional.

### Access
Requires login. Accessible to any authenticated user (`protect` middleware).

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | `Bearer <jwt_token>` |
| `Content-Type` | string | Yes | `application/json` |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Updated full name |
| `phone` | string | No | Contact phone number |
| `bio` | string | No | Professional summary or bio |
| `skills` | array or string | No | Array of strings (e.g. `["Node.js", "React"]`) or comma-separated string (e.g. `"Node.js, React"`) |
| `education` | array of objects | No | List of education entries: `[{ "degree": string, "institution": string, "year": string }]` |

### Success Response (200)

```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "6aae33351106b9291d2cc1b2",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "jobseeker",
    "phone": "+92 300 9876543",
    "bio": "MERN Stack Engineer with 2+ years of hands-on experience.",
    "skills": [
      "JavaScript",
      "Node.js",
      "Express",
      "React",
      "MongoDB"
    ],
    "education": [
      {
        "degree": "BS in Computer Science",
        "institution": "National University of Sciences and Technology",
        "year": "2024"
      }
    ],
    "resumeUrl": "/uploads/6aae33351106b9291d2cc1b2-1789828178467.docx",
    "profilePhotoUrl": "/uploads/6aae33351106b9291d2cc1b2-1789829020967.PNG",
    "createdAt": "2026-09-18T10:05:00.000Z",
    "updatedAt": "2026-09-22T11:30:00.000Z"
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

### Error Response (404) - User Not Found

```json
{
  "message": "User not found"
}
```

### Error Response (500)

```json
{
  "message": "Server error",
  "error": "Validation error details"
}
```

---

## Endpoint: `POST /api/users/me/resume`

Uploads a resume file for the authenticated user and stores its public path in the user profile (`resumeUrl`).

### Access
Requires login. Accessible to any authenticated user (`protect` middleware).

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | `Bearer <jwt_token>` |
| `Content-Type` | string | Yes | `multipart/form-data` |

### Request Body (multipart/form-data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resume` | File | Yes | Resume file. Allowed extensions: `.pdf`, `.doc`, `.docx` |

> **Multer File Handling & Static Serving:**
> - **Field Name:** Must be `resume`.
> - **Allowed Types:** Only `.pdf`, `.doc`, and `.docx` files are accepted. Unmatched file types are rejected with a 500 error from the file filter: `"Resume must be a PDF, DOC, or DOCX file"`.
> - **Size Limit:** 5 MB max (`MAX_FILE_SIZE_MB`).
> - **Storage & Filename:** Saved to `uploads/` disk storage as `${req.user._id}-${Date.now()}.${ext}`.
> - **Static Serving:** Served publicly by Express static middleware mounted at `/uploads` (`app.use('/uploads', express.static('uploads'))`). The saved `resumeUrl` is formatted as `/uploads/<filename>` and can be accessed at `http://localhost:5000/uploads/<filename>`.

### Success Response (200)

```json
{
  "message": "Resume uploaded successfully",
  "resumeUrl": "/uploads/6aae33351106b9291d2cc1b2-1789828178467.docx",
  "user": {
    "_id": "6aae33351106b9291d2cc1b2",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "jobseeker",
    "phone": "+92 300 9876543",
    "bio": "MERN Stack Engineer",
    "skills": ["JavaScript", "Node.js"],
    "education": [],
    "resumeUrl": "/uploads/6aae33351106b9291d2cc1b2-1789828178467.docx",
    "profilePhotoUrl": "",
    "createdAt": "2026-09-18T10:05:00.000Z",
    "updatedAt": "2026-09-22T11:45:00.000Z"
  }
}
```

### Error Response (400) - No File Uploaded

```json
{
  "message": "No resume file uploaded"
}
```

### Error Response (401) - Missing / Invalid Token

```json
{
  "success": false,
  "message": "Not authorized, no token provided"
}
```

### Error Response (500) - Invalid File Extension

```json
{
  "message": "Resume must be a PDF, DOC, or DOCX file"
}
```

---

## Endpoint: `POST /api/users/me/photo`

Uploads a profile photo for the authenticated user and stores its public path in the user profile (`profilePhotoUrl`).

### Access
Requires login. Accessible to any authenticated user (`protect` middleware).

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | `Bearer <jwt_token>` |
| `Content-Type` | string | Yes | `multipart/form-data` |

### Request Body (multipart/form-data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `photo` | File | Yes | Photo image file. Allowed extensions: `.jpg`, `.jpeg`, `.png` |

> **Multer File Handling & Static Serving:**
> - **Field Name:** Must be `photo`.
> - **Allowed Types:** Only `.jpg`, `.jpeg`, and `.png` files are accepted. Unmatched file types are rejected with a 500 error from the file filter: `"Photo must be a JPG or PNG file"`.
> - **Size Limit:** 5 MB max (`MAX_FILE_SIZE_MB`).
> - **Storage & Filename:** Saved to `uploads/` disk storage as `${req.user._id}-${Date.now()}.${ext}`.
> - **Static Serving:** Served publicly by Express static middleware mounted at `/uploads` (`app.use('/uploads', express.static('uploads'))`). The saved `profilePhotoUrl` is formatted as `/uploads/<filename>` and can be accessed at `http://localhost:5000/uploads/<filename>`.

### Success Response (200)

```json
{
  "message": "Photo uploaded successfully",
  "profilePhotoUrl": "/uploads/6aae33351106b9291d2cc1b2-1789829020967.PNG",
  "user": {
    "_id": "6aae33351106b9291d2cc1b2",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "jobseeker",
    "phone": "+92 300 9876543",
    "bio": "MERN Stack Engineer",
    "skills": ["JavaScript", "Node.js"],
    "education": [],
    "resumeUrl": "/uploads/6aae33351106b9291d2cc1b2-1789828178467.docx",
    "profilePhotoUrl": "/uploads/6aae33351106b9291d2cc1b2-1789829020967.PNG",
    "createdAt": "2026-09-18T10:05:00.000Z",
    "updatedAt": "2026-09-22T12:00:00.000Z"
  }
}
```

### Error Response (400) - No File Uploaded

```json
{
  "message": "No photo file uploaded"
}
```

### Error Response (401) - Missing / Invalid Token

```json
{
  "success": false,
  "message": "Not authorized, no token provided"
}
```

### Error Response (500) - Invalid File Extension

```json
{
  "message": "Photo must be a JPG or PNG file"
}
```

---

## Example Requests

```http
GET /api/users/me
Authorization: Bearer <jwt_token>

PUT /api/users/me
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "phone": "+92 300 9876543",
  "bio": "Experienced full-stack engineer.",
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "education": [
    {
      "degree": "BS in Computer Science",
      "institution": "National University",
      "year": "2024"
    }
  ]
}

POST /api/users/me/resume
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="resume"; filename="resume.docx"
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document

<binary data>
------WebKitFormBoundary--

POST /api/users/me/photo
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="photo"; filename="avatar.png"
Content-Type: image/png

<binary data>
------WebKitFormBoundary--
```
