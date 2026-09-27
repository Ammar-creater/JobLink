# Authentication & Authorization API

Endpoints for user registration, authentication (login), session logout, and JWT verification.

## Base URL
http://localhost:5000/api

## Endpoint: `POST /api/auth/register`

Registers a new user account with hashed credentials and role assignment. Role assignment is restricted to `jobseeker` or `employer`.

### Access
Public. No authentication required.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Full name of the user |
| `email` | string | Yes | Unique email address (automatically converted to lowercase) |
| `password` | string | Yes | Account password (minimum 6 characters) |
| `role` | string | No | Desired role: `jobseeker` or `employer` (defaults to `jobseeker`) |

> **Security & Role Constraints:**
> - Clients can only register as `jobseeker` or `employer`. Any missing or unauthorized role (such as attempting to self-assign `admin`) defaults automatically to `jobseeker`.
> - Passwords are encrypted with bcrypt (10 salt rounds) before persistence and are never included in API responses.

### Success Response (201)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "6aae33351106b9291d2cc1b2",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "jobseeker"
    }
  },
  "message": "User registered successfully"
}
```

### Error Response (400) - Missing Required Fields

```json
{
  "success": false,
  "message": "Name, email and password are required"
}
```

### Error Response (400) - Duplicate Email

```json
{
  "success": false,
  "message": "An account with this email already exists"
}
```

### Error Response (500)

```json
{
  "success": false,
  "message": "Server error",
  "error": "Database error message"
}
```

---

## Endpoint: `POST /api/auth/login`

Authenticates existing user credentials with bcrypt comparison and issues a signed JSON Web Token (JWT).

### Access
Public. No authentication required.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Registered email address |
| `password` | string | Yes | Account password |

> **Token Details:**
> - Returns a signed JWT token valid for 7 days (`expiresIn: "7d"`) containing the user's `id` and `role`.
> - Passwords are verified against the stored hash and are omitted from the returned user object.

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhYWUzMzM1MTEwNmI5MjkxZDJjYzFiMiIsInJvbGUiOiJqb2JzZWVrZXIiLCJpYXQiOjE3ODk4MjgxNzgsImV4cCI6MTc5MDQzMjk3OH0.f7B6fB_7K9tJvP6Q8w2a4k6-X7_4m2Q9Z1v3y8",
    "user": {
      "id": "6aae33351106b9291d2cc1b2",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "jobseeker"
    }
  },
  "message": "Login successful"
}
```

### Error Response (400) - Missing Credentials

```json
{
  "success": false,
  "message": "Email and password are required"
}
```

### Error Response (401) - Invalid Credentials

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Error Response (500)

```json
{
  "success": false,
  "message": "Server error",
  "error": "Database error message"
}
```

---

## Endpoint: `POST /api/auth/logout`

Instructs the client to terminate the current session and remove the stored JWT token.

### Access
Public.

> **Note:** Because JWT authentication is stateless and tokens are stored on the client, logout is performed by discarding the token on the client side.

### Success Response (200)

```json
{
  "success": true,
  "message": "Logout successful. Please remove the token on the client."
}
```

---

## Endpoint: `GET /api/auth/test-protected`

Protected route used to verify JWT token authentication and retrieve the decoded token payload.

### Access
Requires login. Accessible to any authenticated user with a valid JWT token (`protect` middleware).

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | `Bearer <jwt_token>` |

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "6aae33351106b9291d2cc1b2",
      "role": "jobseeker"
    }
  },
  "message": "You are authenticated!"
}
```

### Error Response (401) - Missing Token

```json
{
  "success": false,
  "message": "Not authorized, no token provided"
}
```

### Error Response (401) - Invalid or Expired Token

```json
{
  "success": false,
  "message": "Not authorized, token invalid or expired"
}
```

---

## Example Requests

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "strongPassword123",
  "role": "jobseeker"
}

POST /api/auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "strongPassword123"
}

POST /api/auth/logout

GET /api/auth/test-protected
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
