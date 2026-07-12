# Project Management System - Backend API

A Project Management Backend API built on Node.js, Express.js, and MongoDB. This backend manages authentication, authorization, project creation, member roles, tasks, subtasks, task attachments, and project-specific notes.

---

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Database Architecture & Models](#database-architecture--models)
4. [Authentication & Security Flow](#authentication--security-flow)
5. [Environment Variables](#environment-variables)
6. [API Endpoints](#api-endpoints)
    - [Authentication Routes](#authentication-routes)
    - [Project Routes](#project-routes)
    - [Task & Subtask Routes](#task--subtask-routes)
    - [Health Check Route](#health-check-route)
7. [Installation & Local Setup](#installation--local-setup)

---

## Tech Stack
*   **Runtime Environment**: Node.js (ES Modules syntax via `"type": "module"`)
*   **Web Framework**: Express.js (v5)
*   **Database**: MongoDB via Mongoose ORM
*   **Security & Encryption**: bcrypt (for password hashing), JSON Web Tokens (JWT) (for authentication)
*   **File Uploads**: Multer (processing attachments and avatars)
*   **Email Deliverability**: Nodemailer & Mailgen (configured for verification and password recovery)
*   **Request Validation**: express-validator
*   **Development Tools**: nodemon, concurrently (to run backend and frontend in parallel)

---

Project Structure
```text
├── src/
│   ├── app.js               # Express application configuration & routing registration
│   ├── index.js             # Entrypoint, DB connection, and server listener
│   ├── db/
│   │   └── index.js         # Mongoose connection setup to MongoDB
│   ├── controllers/         # Business logic functions for each resource
│   │   ├── auth.controllers.js
│   │   ├── project.controllers.js
│   │   └── task.controller.js
│   ├── middlewares/         # JWT verification, Role checks, Multer, and Validation handlers
│   │   ├── auth.middleware.js
│   │   ├── multer.middelware.js
│   │   └── validator.middleware.js
│   ├── models/              # Mongoose Schemas definitions
│   │   ├── user.models.js
│   │   ├── project.models.js
│   │   ├── projectmember.models.js
│   │   ├── task.models.js
│   │   ├── subtask.models.js
│   │   └── note.models.js
│   ├── routes/              # Express Router mapping for all endpoints
│   │   ├── auth.routes.js
│   │   ├── project.routes.js
│   │   └── task.routes.js
│   │   └── healthcheck.routes.js
│   ├── utils/               # Shared helper modules (custom errors, responses, mailers)
│   │   ├── api-error.js
│   │   ├── api-response.js
│   │   ├── async-handler.js
│   │   ├── constants.js
│   │   └── mail.js
│   └── validator/           # Validation schemas using express-validator
│       └── index.js
```

---

## Database Architecture & Models

The MongoDB structure uses Mongoose schemas to build relationships between users, projects, members, tasks, and notes:

### 1. `User` Schema ([user.models.js](ProjectManagement/src/models/user.models.js))
Manages user profiles, credentials, verification, and reset tokens:
*   `avatar`: `{ url: String, localPath: String }` (Defaults to placehold.co mockup)
*   `username`: String (Unique, Indexed, Lowercase)
*   `email`: String (Unique, Lowercase)
*   `fullname`: String
*   `password`: String (Hashed using `bcrypt` pre-save)
*   `isEmailVerified`: Boolean (Default: `false`)
*   `refreshToken`: String (For obtaining new session tokens)
*   `forgotPasswordToken` / `forgotPasswordExpiry`
*   `emailVerificationToken` / `emailVerificationExpiry`

### 2. `Project` Schema ([project.models.js](ProjectManagement/src/models/project.models.js))
Defines high-level projects:
*   `name`: String (Unique, Trimmed)
*   `description`: String
*   `createdBy`: ObjectId -> `User`

### 3. `ProjectMember` Schema ([projectmember.models.js](ProjectManagement/src/models/projectmember.models.js))
Maps `User` and `Project` with explicit access roles:
*   `user`: ObjectId -> `User`
*   `project`: ObjectId -> `Project`
*   `role`: String (Enum: `admin`, `project_admin`, `member`) (Default: `member`)

### 4. `Task` Schema ([task.models.js](ProjectManagement/src/models/task.models.js))
Individual issues or tasks inside projects:
*   `title`: String (Required)
*   `description`: String
*   `project`: ObjectId -> `Project`
*   `assignedTo`: ObjectId -> `User`
*   `assignedBy`: ObjectId -> `User`
*   `status`: String (Enum: `todo`, `in_progress`, `done`) (Default: `todo`)
*   `attachments`: Array of `{ urlS: String, mimetype: String, size: Number }`

### 5. `SubTask` Schema ([subtask.models.js](ProjectManagement/src/models/subtask.models.js))
Breakdowns of main tasks:
*   `title`: String (Required)
*   `description`: String
*   `task`: ObjectId -> `Task`
*   `assignedTo`: ObjectId -> `User`
*   `status`: String (Enum: `todo`, `in_progress`, `done`) (Default: `todo`)
*   `isCompleted`: Boolean (Default: `false`)
*   `createdBy`: ObjectId -> `User`

### 6. `ProjectNote` Schema ([note.models.js](ProjectManagement/src/models/note.models.js))
Collaboration workspace notes linked to projects:
*   `project`: ObjectId -> `Project`
*   `createdBy`: ObjectId -> `User`
*   `content`: String (Required)

---

## Authentication & Security Flow

1.  **Password Hashing**: User passwords are automatically encrypted prior to creation or updates using a Mongoose `pre("save")` hook with a salt factor of 10.
2.  **JWT Tokens**:
    *   **Access Token**: Contains basic user metadata (`_id`, `email`, `username`) and is sent as an HTTP-only cookie (`accessToken`) or a Bearer token in the `Authorization` header.
    *   **Refresh Token**: Saved both in the user's database document and sent as an HTTP-only cookie (`refreshToken`) for requesting new access tokens.
3.  **Project Permissions**:
    *   The `validateProjectPermission(allowedRoles)` middleware checks if the logged-in user is a registered member of the target project (`projectId` in request parameters) and holds one of the required roles (`admin`, `project_admin`, or `member`).

---

## Environment Variables

To operate successfully, create a `.env` file in the root directory containing the following parameters:

```env
# Server Configurations
PORT=3000
NODE_ENV=development
SERVER_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:5173

# Database
MONGO_URI=mongodb://localhost:27017/projectmanagement

# JWT Secret Keys
ACCESS_TOKEN_SECRET=your_jwt_access_token_secret_key_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_jwt_refresh_token_secret_key_here
REFRESH_TOKEN_EXPIRY=10d

# Frontend Redirection links
FORGOT_PASSWORD_REDIRECT_URL=http://localhost:5173/reset-password

# Email configuration (SMTP via Mailtrap)
MAILTRAP_SMTP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_SMTP_PORT=2525
MAILTRAP_SMTP_USER=your_mailtrap_smtp_user_id
MAILTRAP_SMTP_PASS=your_mailtrap_smtp_password
```

---

## API Endpoints

All base routes are prefixed with `/api/v1`.

### Authentication Routes (`/api/v1/auth`)

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/register` | Public | Registers a new account and sends a Mailgen verification email. |
| **POST** | `/login` | Public | Authenticates credentials and returns JWT session cookies. |
| **GET** | `/verify-email/:verificationToken` | Public | Activates the account via email token validation. |
| **POST** | `/refresh-Token` | Public | Refreshes and updates expired access tokens using the refresh token. |
| **POST** | `/forgot-password` | Public | Requests a password recovery link sent via Mailgen. |
| **POST** | `/reset-password/:resetToken` | Public | Resets password after validating recovery token. |
| **POST** | `/logout` | Secure (JWT) | Clears HTTP-only cookies and nullifies the database refresh token. |
| **POST** | `/current-user` | Secure (JWT) | Retrieves the current session user details (excluding password). |
| **POST** | `/change-password` | Secure (JWT) | Allows a logged-in user to change their password. |
| **POST** | `/resend-email-verification` | Secure (JWT) | Re-sends the account email verification link. |

### Project Routes (`/api/v1/projects`)

| Method | Endpoint | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | Secure | Project Members | Fetches all projects the user belongs to. |
| **POST** | `/` | Secure | Any User | Creates a project (user becomes project `admin`). |
| **GET** | `/:projectId` | Secure | `admin`, `project_admin`, `member` | Fetches project information by ID. |
| **PUT** | `/:projectId` | Secure | `admin` | Updates project details (name, description). |
| **DELETE** | `/:projectId` | Secure | `admin` | Deletes a project and its configurations. |
| **GET** | `/:projectId/members` | Secure | `admin`, `project_admin`, `member` | Lists all members and roles in the project. |
| **POST** | `/:projectId/members` | Secure | `admin` | Invites/adds a member to the project with a role. |
| **PUT** | `/:projectId/members/:userId` | Secure | `admin` | Modifies the role of a project member. |
| **DELETE** | `/:projectId/members/:userId` | Secure | `admin` | Removes a member from the project. |
| **GET** | `/:projectId/notes` | Secure | `admin`, `project_admin`, `member` | Fetches project-wide collaboration notes. |
| **POST** | `/:projectId/notes` | Secure | `admin`, `project_admin`, `member` | Creates a new note on the project boards. |
| **PUT** | `/:projectId/notes/:noteId` | Secure | `admin`, `project_admin`, `member` | Modifies an existing project note. |
| **DELETE** | `/:projectId/notes/:noteId` | Secure | `admin`, `project_admin`, `member` | Deletes a project note. |

### Task & Subtask Routes (`/api/v1/tasks`)

| Method | Endpoint | Auth Required | Allowed Roles / Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/project/:projectId` | Secure | `admin`, `project_admin`, `member` | Lists all tasks associated with a project. |
| **POST** | `/project/:projectId` | Secure | `admin` | Creates a new task (optionally with attachments/assignees). |
| **GET** | `/:taskId` | Secure | Project Members | Fetches detailed view of a task including subtasks. |
| **PUT** | `/:taskId` | Secure | Task Assignee / Project Admins | Updates a task status or details. |
| **DELETE** | `/:taskId` | Secure | Task Creator / Project Admins | Deletes a task. |
| **POST** | `/:taskId/subtasks` | Secure | Project Members | Adds a subtask checklist item to a task. |
| **PUT** | `/subtasks/:subTaskId` | Secure | Project Members | Updates a subtask status/title/assignee. |
| **DELETE** | `/subtasks/:subTaskId` | Secure | Subtask Creator / Project Admins | Deletes a subtask. |

### Health Check Route (`/api/v1/healthcheck`)

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Public | Returns `200 OK` when the service and system resources are healthy. |

---

## Installation & Local Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
*   [MongoDB](https://www.mongodb.com/) (running instance locally or cloud atlas)

### 2. Dependency Installation
Run the following command at the project's root folder to install dependencies:
```bash
npm install
```

### 3. Environment Variables Configuration
Copy the `.env` settings mentioned in the [Environment Variables](#environment-variables) section above into a `.env` file at the root directory and update credentials accordingly.

### 4. Running the Server

*   **Development Mode** (with hot reload enabled via Nodemon):
    ```bash
    npm run dev:backend
    ```
*   **Production Start**:
    ```bash
    npm start
    ```
