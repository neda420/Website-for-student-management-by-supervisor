# StudentTrack - Student Management System


A comprehensive, market-ready web application for supervisors to manage students, assistants, and document uploads with role-based access control.

<img width="1908" height="934" alt="Screenshot 2025-12-22 211134" src="https://github.com/user-attachments/assets/545650de-bfb3-4348-8a03-395a8701a251" />
<img width="1918" height="981" alt="Screenshot 2025-12-22 213303" src="https://github.com/user-attachments/assets/8c3f831e-2295-4052-974b-4b58383612ca" />
<img width="1899" height="982" alt="Screenshot 2025-12-22 213326" src="https://github.com/user-attachments/assets/31942716-f2ee-4600-a63b-4df1c879be13" />
<img width="1917" height="990" alt="Screenshot 2025-12-22 213314" src="https://github.com/user-attachments/assets/f9a0e1b5-2087-49bd-a533-6db296672c4c" />
<img width="1911" height="1013" alt="Screenshot 2025-12-22 213336" src="https://github.com/user-attachments/assets/4e3a22ec-c79a-4c4c-b3cf-e28d3de89cba" />

## 🚀 Features
- **Role-Based Access Control (RBAC)**: Supervisor creates assistants with granular permissions
- **Student Management**: Create, read, update, and delete student profiles
- **Document Upload**: Browse and upload files directly to student profiles with progress tracking
- **Activity Dashboard**: High-level stats and real-time activity feed
- **Responsive Design**: Fully functional on mobile and desktop
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Real-time Feedback**: Toast notifications for all user actions

## 📋 Tech Stack

### Frontend
- **React.js** (v19.2) with TypeScript
- **React Router Dom** for navigation
- **Bootstrap** & **React-Bootstrap** for styling
- **Axios** for API calls
- **React-Toastify** for notifications
- **Vite** for build tooling

### Backend
- **Node.js** with **Express.js**
- **MySQL** with connection pooling (mysql2)
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Multer** for file uploads
- **CORS** enabled

## 📁 Project Structure

```
Website for stufdent management by supervisor/
├── Student-management-website/          # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/                  # React components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── StudentList.tsx
│   │   │   ├── StudentProfile.tsx
│   │   │   ├── StudentForm.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx          # Authentication state
│   │   ├── utils/
│   │   │   └── axios.ts                 # Axios configuration
│   │   ├── App.tsx                      # Main app with routing
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── server/                              # Backend (Node + Express)
    ├── config/
    │   └── database.js                  # MySQL connection pool
    ├── controllers/
    │   ├── authController.js
    │   ├── userController.js
    │   ├── studentController.js
    │   ├── documentController.js
    │   ├── dashboardController.js
    │   └── activityLogController.js
    ├── middleware/
    │   ├── auth.js                      # JWT verification
    │   └── permissions.js               # Permission checks
    ├── routes/
    │   ├── auth.js
    │   ├── users.js
    │   ├── students.js
    │   ├── documents.js
    │   └── dashboard.js
    ├── database/
    │   └── init.sql                     # Database schema
    ├── uploads/                         # Uploaded files (auto-created)
    ├── .env                             # Environment variables
    ├── server.js                        # Main server file
    └── package.json
```

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js** (v16 or higher)
- **MySQL** (v8 or higher)
- **npm** or **yarn**

### 1. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE studenttrack;

# Use the database
USE studenttrack;

# Run the init.sql script
source ./server/database/init.sql;

# OR import it directly
mysql -u root -p studenttrack < ./server/database/init.sql
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Configure environment variables
# Edit server/.env with your MySQL password
# Important: Set DB_PASSWORD to your MySQL password

# Start the server
npm run dev    # Development mode with auto-restart
# OR
npm start      # Production mode
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd Student-management-website

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Access the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Login with default credentials:
   - **Username**: `supervisor`
   - **Password**: `supervisor123`
3. **🔒 IMPORTANT**: Change the default password after first login!

## 📊 Database Schema

### Users Table
- Stores supervisor and assistant credentials
- Granular permission flags: `can_view_students`, `can_edit_student`, `can_delete_student`, `can_upload_docs`, `can_manage_users`

### Students Table
- Student profile information: name, email, department, status, GPA, assigned tasks

### Documents Table
- File metadata linked to students via foreign key
- Stores original filename, stored filename, file size, uploader info

### Activity Logs Table
- Tracks all user actions
- Powers the dashboard "Recent Activity" feed

## 🔑 Default Credentials

| Username   | Password      | Role       |
|------------|---------------|------------|
| supervisor | supervisor123 | Supervisor |

**⚠️ Change the default password immediately after first login!**

## 📝 Permission System

Supervisors can create assistants with the following permissions:

- ✅ **Can View Students**: View student list and profiles
- ✏️ **Can Edit Students**: Create and update student profiles
- ❌ **Can Delete Students**: Delete student records
- 📤 **Can Upload Documents**: Upload files to student profiles
- 👥 **Can Manage Users**: Create and manage other assistants (use with caution)

## 🔐 Security Features

- **Password Hashing**: Bcrypt with 10 salt rounds
- **JWT Authentication**: 24-hour token expiration
- **RBAC**: Granular permission system
- **CORS**: Restricted to frontend URL
- **SQL Injection Prevention**: Parameterized queries
- **Input Validation**: All endpoints validate inputs

## 📱 Responsive Design

The application is fully responsive and works on:
- 📱 Mobile devices (phones)
- 📲 Tablets
- 💻 Desktop computers

## 🎨 User Experience

- **Loading States**: Spinners on buttons and pages
- **Progress Bars**: Real-time upload progress
- **Toast Notifications**: Success/error feedback
- **Confirmation Modals**: Before destructive actions
- **Search & Filter**: Quick student lookup
- **Pagination**: Efficient data browsing

## 🐛 Troubleshooting

### Database connection fails
- ✅ Check MySQL is running
- ✅ Verify credentials in `server/.env`
- ✅ Ensure database exists

### File upload fails
- ✅ Check `server/uploads` directory exists
- ✅ Verify write permissions
- ✅ Check `MAX_FILE_SIZE` in `.env`

### CORS errors
- ✅ Verify `FRONTEND_URL` in `server/.env` matches frontend URL
- ✅ Ensure backend is running on port 5000

### Port already in use
- ✅ Backend: Change `PORT` in `server/.env`
- ✅ Frontend: Vite will automatically suggest an alternative port

## 📄 License

This project is provided as-is for educational and commercial use.

## 👨‍💻 Development Notes

- Activity logs track all user actions automatically
- Files are stored with unique names to prevent conflicts
- Deleting a student cascades to documents (both DB and files)
- Supervisor role bypasses all permission checks
- All timestamps are in UTC

## 🚀 Production Deployment

1. **Build Frontend**:
   ```bash
   cd Student-management-website
   npm run build
   ```

2. **Configure Environment**:
   - Update `JWT_SECRET` with a secure random string
   - Update `DB_PASSWORD` with your production database password
   - Set `FRONTEND_URL` to your production frontend URL

3. **Start Backend**:
   ```bash
   cd server
   npm start
   ```

4. **Serve Frontend**: Use a web server like Nginx or serve the `dist` folder

## 📞 Support

For issues or questions, please check the documentation in:
- `server/README.md` - Backend documentation
- This file - Overall project documentation

---

**Built with ❤️ for efficient student management**
