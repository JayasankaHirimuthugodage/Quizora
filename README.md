## Project Guideliness

# Naming Conventions

    To ensure consistency across the codebase, follow these rules:

    Variables, functions, and methods: Use camelCase
    Example: userName, getUserData()

    Constants: Use UPPERCASE_WITH_UNDERSCORES
    Example: MAX_RETRY_COUNT, API_BASE_URL

    Classes and Components: Use PascalCase
    Example: UserProfile, OrderManager

# Quizora – Quiz & Assessment Platform

Quizora is a web-based quiz and assessment management system designed to streamline academic evaluations. Built with a modular architecture and designed for institutions, educators, and students, Quizora supports secure, scalable, and insightful assessments — powered by Scrum-based agile development.

---

## Features

### For Lecturers

- Create and manage quizzes with MCQs, structured, or essay questions
- Schedule quizzes and assign to student cohorts
- Use reusable question banks with randomization options
- Auto-grade MCQs; rubric-based manual marking for long answers
- View analytics like score distribution, question performance, etc.

### For Students

- Join quizzes with passwords and limited attempts
- Real-time time tracking and autosave during exams
- Receive email notifications and downloadable marksheets

### For Admins

- User account and access control
- Global settings (attempt limits, SSO, storage policies)
- Export reports to CSV or cloud storage

---

## Architecture Overview

- **Frontend:** React / Angular (planned)
- **Backend:** Node.js / Django / FastAPI (TBD)
- **Database:** PostgreSQL / MongoDB
- **Auth:** JWT + role-based access control (student / lecturer / admin)
- **File Storage:** AWS S3 / Firebase Storage
- **CI/CD:** GitHub Actions + Docker (planned)

> Planned Agile Framework: **Scrum** with 2-week sprints, backlog-driven development.

---

## Product Backlog (High-Level)

| Epic                            | Description                              |
| ------------------------------- | ---------------------------------------- |
| Authentication & Access Control | Login, quiz password, attempt limits     |
| Quiz Management                 | Create/schedule/assign quizzes           |
| Question Bank                   | Question CRUD, randomization             |
| Exam Session                    | Timed access, eligibility                |
| Submission & Integrity          | Autosave, submission logs, plagiarism    |
| Marking & Grading               | Auto-grade, rubrics, partial marking     |
| Results & Publishing            | Mark finalization, student marksheets    |
| Notifications                   | Emails and UI alerts                     |
| Analytics                       | Dashboards and exports                   |
| System Infra                    | Caching, scalable storage, rate-limiting |

---
