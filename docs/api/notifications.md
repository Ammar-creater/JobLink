# Notifications API

Endpoints for retrieving and managing user notifications, including marking individual or all notifications as read.

## Base URL
http://localhost:5000/api

## Side Effect Note: Automatic Notification Generation

Notifications are generated automatically as a system side effect rather than through an external creation endpoint:
- **Trigger:** When an employer updates an application's status (`PUT /api/employer/applications/:applicationId/status` in `dashboardController.js`).
- **Notification Type:** `application_status`
- **Recipient:** The applicant user (`application.userId`).
- **Message Format:** `Your application for "<jobTitle>" has been <status>.` (e.g., `Your application for "Backend Developer" has been accepted.`).
- **Application Reference:** `relatedApplicationId` links directly to the corresponding `Application` document.

---

## Endpoint: `GET /api/notifications`

Retrieves all notifications for the currently logged-in user, sorted newest first (`createdAt: -1`).

### Access
Requires login. Accessible to any authenticated user (`jobseeker` or `employer`) via `protect` middleware.

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | `Bearer <jwt_token>` |

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "count": 2,
    "notifications": [
      {
        "_id": "6ab7c1234567890abcdef012",
        "userId": "6aae33351106b9291d2cc1b2",
        "message": "Your application for \"Backend Developer\" has been accepted.",
        "type": "application_status",
        "relatedApplicationId": "6ab5e2c7a102b45e78c90123",
        "isRead": false,
        "createdAt": "2026-09-24T12:00:00.000Z",
        "updatedAt": "2026-09-24T12:00:00.000Z"
      },
      {
        "_id": "6ab7c1234567890abcdef011",
        "userId": "6aae33351106b9291d2cc1b2",
        "message": "Your application for \"Data Science Intern\" has been rejected.",
        "type": "application_status",
        "relatedApplicationId": "6ab5e2c7a102b45e78c90120",
        "isRead": true,
        "createdAt": "2026-09-23T15:30:00.000Z",
        "updatedAt": "2026-09-23T16:00:00.000Z"
      }
    ]
  },
  "message": "Notifications retrieved successfully"
}
```

### Error Response (401) - Missing Token

```json
{
  "success": false,
  "message": "Not authorized, no token provided"
}
```

### Error Response (401) - Invalid / Expired Token

```json
{
  "success": false,
  "message": "Not authorized, token invalid or expired"
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

## Endpoint: `PUT /api/notifications/:notificationId/read`

Marks a specific notification as read (`isRead: true`). The user must be the recipient owner of the notification.

### Access
Requires login. Accessible to the authenticated user who owns the notification (`protect` middleware).

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | `Bearer <jwt_token>` |

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notificationId` | ObjectId | Yes | 24-character hexadecimal MongoDB ObjectId of the notification |

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "_id": "6ab7c1234567890abcdef012",
    "userId": "6aae33351106b9291d2cc1b2",
    "message": "Your application for \"Backend Developer\" has been accepted.",
    "type": "application_status",
    "relatedApplicationId": "6ab5e2c7a102b45e78c90123",
    "isRead": true,
    "createdAt": "2026-09-24T12:00:00.000Z",
    "updatedAt": "2026-09-24T12:05:00.000Z"
  },
  "message": "Notification marked as read"
}
```

### Error Response (400) - Bad ObjectId Format

```json
{
  "success": false,
  "data": null,
  "message": "Invalid notification id"
}
```

### Error Response (401) - Missing / Invalid Token

```json
{
  "success": false,
  "message": "Not authorized, no token provided"
}
```

### Error Response (403) - Not Authorized to Access This Notification

```json
{
  "success": false,
  "data": null,
  "message": "Not authorized to access this notification"
}
```

### Error Response (404) - Notification Not Found

```json
{
  "success": false,
  "data": null,
  "message": "Notification not found"
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

## Endpoint: `PUT /api/notifications/read-all`

Marks all unread notifications (`isRead: false`) for the currently authenticated user as read (`isRead: true`).

### Access
Requires login. Accessible to any authenticated user (`protect` middleware).

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | `Bearer <jwt_token>` |

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "modifiedCount": 2
  },
  "message": "All notifications marked as read"
}
```

### Error Response (401) - Missing / Invalid Token

```json
{
  "success": false,
  "message": "Not authorized, no token provided"
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
GET /api/notifications
Authorization: Bearer <jwt_token>

PUT /api/notifications/6ab7c1234567890abcdef012/read
Authorization: Bearer <jwt_token>

PUT /api/notifications/read-all
Authorization: Bearer <jwt_token>
```
