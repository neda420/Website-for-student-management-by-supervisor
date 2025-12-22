# StudentTrack Backend Server

Backend server for the StudentTrack student management system.

## Tech Stack

- **Node.js** with Express.js
- **MySQL** with connection pooling (mysql2)
- **JWT** authentication
- **Bcrypt** for password hashing
- **Multer** for file uploads
- **CORS** enabled

## Setup Instructions

### 1. Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### 2. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE studenttrack;

# Use the database
USE studenttrack;

# Run the init.sql script
source ./database/init.sql;

# OR import it directly
mysql -u root -p studenttrack < ./database/init.sql
```

### 3. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# Important: Set your MySQL password and JWT secret!
```

**Required environment variables:**
- `DB_PASSWORD` - Your MySQL password
- `JWT_SECRET` - A secure random string (use: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)

### 4. Install Dependencies

```bash
npm install
```

### 5. Create Uploads Directory

The uploads directory is created automatically when the server starts, but you can create it manually:

```bash
mkdir uploads
```

### 6. Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000` by default.

## Default Credentials

After running `init.sql`, a default supervisor account is created:

- **Username:** `supervisor`
- **Password:** `supervisor123`
- **Email:** `supervisor@studenttrack.com`

**🔒 IMPORTANT: Change this password after first login!**

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register assistant (supervisor only)
- `GET /api/auth/me` - Get current user

### Users (Supervisor Only)
- `GET /api/users` - List all assistants
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/:id/permissions` - Update permissions
- `DELETE /api/users/:id` - Delete assistant

### Students
- `GET /api/students` - List all students (with pagination)
- `GET /api/students/:id` - Get student profile
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Documents
- `POST /api/documents/upload/:studentId` - Upload document
- `GET /api/documents/student/:studentId` - Get student's documents
- `GET /api/documents/download/:id` - Download document
- `DELETE /api/documents/:id` - Delete document

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/activities` - Get recent activities

## Project Structure

```
server/
├── config/
│   └── database.js          # MySQL connection pool
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management
│   ├── studentController.js # Student CRUD
│   ├── documentController.js# Document handling
│   ├── dashboardController.js# Dashboard stats
│   └── activityLogController.js# Activity logging
├── middleware/
│   ├── auth.js              # JWT verification
│   └── permissions.js       # Permission checks
├── routes/
│   ├── auth.js              # Auth routes
│   ├── users.js             # User routes
│   ├── students.js          # Student routes
│   ├── documents.js         # Document routes
│   └── dashboard.js         # Dashboard routes
├── database/
│   └── init.sql             # Database schema
├── uploads/                 # Uploaded files (auto-created)
├── .env                     # Environment variables
├── .env.example             # Environment template
├── server.js                # Main server file
├── package.json             # Dependencies
└── README.md                # This file
```

## Security Features

- **Password Hashing:** Bcrypt with 10 salt rounds
- **JWT Authentication:** 24-hour token expiration
- **RBAC:** Granular permission system
- **CORS:** Restricted to frontend URL
- **Input Validation:** All endpoints validate inputs
- **SQL Injection Prevention:** Parameterized queries

## Troubleshooting

### Database connection fails
- Check MySQL is running: `sudo service mysql status`
- Verify credentials in `.env`
- Check database exists: `SHOW DATABASES;`

### File upload fails
- Check uploads directory exists and has write permissions
- Verify `MAX_FILE_SIZE` in `.env`

### CORS errors
- Verify `FRONTEND_URL` in `.env` matches your frontend URL
- Check browser console for specific CORS errors

## Development Notes

- Activity logs track all user actions automatically
- Files are stored with unique names to prevent conflicts
- Deleting a student cascades to documents (both DB and files)
- Supervisor role bypasses all permission checks
- All timestamps are in UTC
