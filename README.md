# Sweety – Blood Glucose Tracker

## Description

Sweety is a modern, responsive web application designed to help individuals monitor and take control of their blood glucose levels. Users can securely register and log in to record daily blood glucose readings across four standard mealtime slots, manage their reading history, and view comprehensive daily, month-to-date, and monthly health reports with downloadable clinical PDF summaries.

## Tech Stack

### Frontend
- **React 19**: Modern UI component library
- **React Router v7**: Client-side routing and protected navigation
- **Tailwind CSS v4**: Utility-first CSS styling and custom color palettes
- **Vite 8**: Frontend build tool and development server
- **jsPDF & jspdf-autotable**: Client-side healthcare PDF report generation

### Backend
- **Node.js**: Server-side runtime environment
- **Express 5**: RESTful API framework and middleware routing
- **pg (node-postgres)**: PostgreSQL client with connection pooling
- **CORS**: Cross-Origin Resource Sharing middleware
- **dotenv**: Environment variable management

### Database
- **PostgreSQL**: Relational database supporting UUID primary keys, check constraints, foreign keys, and unique composite indexes

### Authentication and Security
- **JSON Web Tokens (JWT)**: Stateless token-based user authentication
- **bcryptjs**: Password hashing using 12 salt rounds
- **Auth Middleware**: Route-level JWT verification and user authorization

### Development Tools
- **Nodemon**: Auto-reloading development server for Node.js
- **ESLint**: Static code analysis and React syntax linting
- **Git**: Distributed version control

## Prerequisites

Ensure the following tools are installed on your system before proceeding:

- **Node.js**: v18.0.0 or higher (tested on v24.x)
- **npm**: v9.0.0 or higher (tested on v11.x)
- **PostgreSQL**: v14.0 or higher
- **Git**: v2.x or higher

## Installation and Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/Cherry-ai-143/Sweety.git
cd Sweety
```

### Step 2: Create the database

Create the PostgreSQL database named `Sweety_db`:

- **Using `psql` CLI**:
  ```bash
  psql -U postgres -c "CREATE DATABASE \"Sweety_db\";"
  ```
- **Using pgAdmin**:
  In pgAdmin, right-click **Databases** > **Create** > **Database...**, name it `Sweety_db`, and click **Save**.

### Step 3: Environment configuration

#### Backend Environment
From the project root, navigate to `server/` and create `.env` from the template:

```bash
cd server
cp .env.example .env
```
*(On Windows Command Prompt or PowerShell, use `copy .env.example .env`)*

Configure `server/.env` with your PostgreSQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Sweety_db
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1d
```

- `PORT`: Port on which the Express server listens (default: `5000`).
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: PostgreSQL connection parameters.
- `JWT_SECRET`: Secret key used to sign and verify JSON Web Tokens.
- `JWT_EXPIRES_IN`: Token validity period (e.g., `1d`).

#### Frontend Environment
From `server/`, navigate to `client/` and create `.env`:

```bash
cd ../client
cp .env.example .env
```
*(On Windows Command Prompt or PowerShell, use `copy .env.example .env`)*

Configure `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

- `VITE_API_BASE_URL`: URL pointing to the backend REST API endpoints.

### Step 4: Install backend dependencies & initialize database

From `client/`, navigate back to `server/`, install dependencies, and run the automated database initialization script:

```bash
cd ../server
npm install
npm run db:init
```

`npm run db:init` automatically reads `server/database/schema.sql` and executes it against `Sweety_db` to set up:
- `users` table with UUID primary keys and unique email constraint.
- `glucose_readings` table with mealtime slot constraints, 40–600 mg/dL value checks, foreign keys, and unique slot constraints.
- Optimized query performance indexes.

### Step 5: Seed the database (Optional Demo Data)

Populate the database with sample demo account credentials and readings:

```bash
npm run seed
```

This seed script inserts:
- **Demo User**:
  - Name: `Sweety Demo User`
  - Email: `demo@sweety.com`
  - Password: `Demo@12345`
- **Sample Readings**: 52 realistic blood glucose measurements distributed across current and previous calendar months covering all four supported time slots (`MORNING`, `AFTER_BREAKFAST`, `AFTER_LUNCH`, `AFTER_DINNER`).

### Step 6: Install frontend dependencies

From `server/`, navigate to `client/` and install packages:

```bash
cd ../client
npm install
```

## Running the Application

To run the application locally, start both the backend server and frontend client in two separate terminal windows.

### Terminal 1 – Backend

From the project root:

```bash
cd server
npm run dev
```

- Backend server URL: `http://localhost:5000`
- API base endpoint: `http://localhost:5000/api`

### Terminal 2 – Frontend

From the project root:

```bash
cd client
npm run dev
```

- Frontend application URL: `http://localhost:5173`

Open `http://localhost:5173` in your browser to interact with the application.

## Running Tests

Automated unit or end-to-end testing frameworks (such as Jest, Vitest, or Cypress) are not currently implemented in this project.

Available code quality and connectivity checks:

- **Frontend Code Quality & Linting**: Run ESLint across client components:
  ```bash
  cd client
  npm run lint
  ```
- **Backend Database Verification**: Test PostgreSQL connection pool connectivity:
  ```bash
  cd server
  node src/test-db.js
  ```

## Notes

### Assumptions
- **Daily Reading Limit**: A maximum of four glucose readings can be recorded per user per day.
- **Unique Time Slots**: Each user can record only one reading per designated time slot per day (`MORNING`, `AFTER_BREAKFAST`, `AFTER_LUNCH`, `AFTER_DINNER`).
- **Valid Measurement Range**: Blood glucose readings must be integer values between 40 mg/dL and 600 mg/dL inclusive.
- **Date Restrictions**: Readings cannot be entered with future dates.
- **Data Privacy**: Users can view, update, and delete only their own glucose readings.
- **Monthly Reporting**: Monthly reports can evaluate either the complete previous calendar month or a user-selected calendar month.

### Future Improvements

- **Docker & Containerization**: Introduce Docker and Docker Compose for streamlined environment setup, consistent development, and easier deployment.
- **Automated Testing Suite**: Implement comprehensive unit, integration, and end-to-end testing for backend APIs and frontend workflows.
- **Doctor & Patient Accounts**: Introduce dedicated doctor and patient accounts with role-based access, allowing patients to securely share glucose readings and doctors to monitor their patients' progress.
- **Doctor Dashboard**: Develop a dedicated healthcare professional dashboard to manage patients, review glucose reports, monitor readings, and identify concerning patterns.
- **Patient–Doctor Collaboration**: Enable secure report sharing, doctor feedback, and personalized monitoring recommendations.
- **Smart Health Alerts**: Introduce configurable notifications for abnormal glucose readings and recurring patterns that may require medical attention.
- **Advanced Data Management**: Support secure data export, backup, recovery, and improved management of long-term glucose records.
- **Multi-language Support**: Extend accessibility through multilingual interfaces and improved support for diverse users.
