# School Management System

A comprehensive School Management System built with MERN stack (MongoDB, Express, React, Node.js) and Tailwind CSS.

## Features

- **Multi-Role Authentication**: Admin, Teacher, Student, and Parent roles with secure login.
- **Dashboard**: Role-based dashboards with quick statistics and navigation.
- **User Management**: Create, update, and delete users with proper role assignment.
- **Student Management**:
  - Manage student records including personal details, class, and section.
  - Track fee status (Paid, Partial, Unpaid).
- **Teacher Management**:
  - Manage teacher profiles with subjects, classes, and qualifications.
- **Class & Section Management**:
  - Create and manage classes and sections.
- **Attendance Tracking**:
  - Mark attendance for students (Present, Absent, Late).
  - View attendance history.
- **Fee Management**:
  - Define fee structures for different classes.
  - Track fee payments and dues.
- **Transport Management**:
  - Manage transport routes and assign students to routes.
- **Notifications**:
  - Real-time notifications for important events.
- **Responsive Design**: Built with Tailwind CSS for a seamless experience on all devices.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, Helmet, CORS

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

## Installation

### Backend

1. Navigate to the backend directory:
   ```bash
   cd school-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `school-backend` directory with the following configuration:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:8080
   CLIENT_URLS=http://localhost:8080
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd school-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```



## License

This project is licensed under the MIT License.
