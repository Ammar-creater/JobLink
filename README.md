# JobLink — A Job & Internship Portal

A web-based platform that connects job seekers and students with employers offering jobs and internships.

## About

JobLink is a full-stack MERN web application built by **Noreen** and **Eman** as a learning project to practice real-world, team-based Git workflow.

- **Employers** can post and manage job/internship listings and review applicants.
- **Job Seekers / Students** can search, filter, apply, and track applications.
- **Admins** moderate listings and manage users.

## Tech Stack (MERN)

| Layer           | Technology                    |
|-----------------|-------------------------------|
| Frontend        | React.js + React Router       |
| Styling         | Tailwind CSS                  |
| Backend         | Node.js + Express.js          |
| Database        | MongoDB + Mongoose            |
| Authentication  | JWT + bcrypt                  |
| File Uploads    | Multer                        |
| Notifications   | Nodemailer (optional)         |
| Version Control | Git + GitHub                  |
| API Testing     | Postman                       |

##  Team & Module Ownership

| Member  | Modules                                                          |
|---------|------------------------------------------------------------------|
| Noreen  | Authentication, User Profile, Employer Dashboard, Notifications  |
| Eman    | Job Posting (CRUD), Job Search & Filters, Application System, Admin Panel |

##  Git Workflow

- `main` is protected — no direct commits.
- Each feature is developed on a separate branch: `feature/<feature-name>`.
- Pull requests are reviewed by the instructor before merging.

##  Folder Structure

JobLink/
├── client/ # React frontend
│ ├── public/
│ └── src/
│ ├── components/
│ ├── pages/
│ └── services/
├── server/ # Express backend
│ ├── models/
│ ├── routes/
│ ├── controllers/
│ └── middleware/
├── .gitignore
└── README.md


##  Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/Ammar-creater/JobLink.git
cd JobLink

### Set up the backend
cd server
npm install
copy .env.example .env      # Windows
# Edit .env and fill in your real values
npm run dev

### Set up the frontend
cd ../client
npm install
npm start