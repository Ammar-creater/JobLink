# Job Search & Filters API

Public endpoints for searching, filtering, sorting, and paginating approved job postings.

## Base URL
http://localhost:5000/api

## Endpoint: `GET /api/jobs`

Returns a paginated list of approved job postings. All parameters are optional and combinable. No authentication required.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `keyword` | string | — | Case-insensitive search in title and description |
| `category` | ObjectId | — | Filter by category ID |
| `location` | string | — | Case-insensitive substring match on location |
| `type` | string | — | `job` or `internship` |
| `salary` | string | — | Case-insensitive substring match on salary |
| `sort` | string | `newest` | `newest`, `oldest`, `salary_desc`, `salary_asc` |
| `page` | number | 1 | Page number |
| `limit` | number | 9 | Items per page (max 50) |

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "_id": "6ab292d65c72cee3ec3ef786",
      "employerId": {
        "_id": "6ab145174a7d9025b3d3d16f",
        "name": "Eman Test 21",
        "email": "emantest21@joblink.com"
      },
      "title": "Data Science Intern",
      "description": "Entry-level internship for data science students.",
      "type": "internship",
      "category": {
        "_id": "6aacef3f4e5718d1ddfc58ab",
        "name": "Software Engineering"
      },
      "location": "Karachi",
      "salary": "30000 PKR/month",
      "salaryValue": 30000,
      "status": "approved",
      "requirements": ["Python", "SQL"],
      "deadline": "2026-11-30T00:00:00.000Z",
      "createdAt": "2026-09-22T14:38:14.771Z"
    }
  ],
  "pagination": {
    "total": 4,
    "page": 1,
    "limit": 9,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```
## Error Response(400)
```
{
  "message": "Invalid category ID format"
}
```

## Sorting

| Value | Behavior |
|-------|----------|
| `newest` | Most recent first (default) |
| `oldest` | Oldest first |
| `salary_desc` | Highest salary first |
| `salary_asc` | Lowest salary first |

## Example Requests

```http

GET /api/jobs
GET /api/jobs?keyword=react
GET /api/jobs?type=internship
GET /api/jobs?location=karachi
GET /api/jobs?sort=salary_desc
GET /api/jobs?page=2&limit=6
GET /api/jobs?keyword=node&type=job&sort=salary_desc
```

## Testing
Postman collection: docs/JobLink_Module4_Postman_Collection.json — 18 automated tests covering filters, sort, pagination, regex escaping, and error cases.

