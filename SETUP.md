# Resume Parser MERN Application - Setup Guide

This guide will help you set up and run the Resume Parser application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local installation or MongoDB Atlas account) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** (optional, for version control) - [Download here](https://git-scm.com/)

## Quick Setup (Recommended)

### Step 1: Extract/Clone the Project
Extract the project files to your desired location or clone if using Git.

### Step 2: Install Dependencies
Open a terminal/command prompt in the project root directory and run:
```bash
npm run install-all
```

### Step 3: Environment Configuration
1. Navigate to the `backend` directory
2. Copy the environment example file:
   ```bash
   # Windows
   copy env.example .env
   
   # Linux/Mac
   cp env.example .env
   ```
3. The `.env` file is already configured with the DeepSeek API key. You may need to update:
   - `MONGODB_URI` if using MongoDB Atlas
   - `JWT_SECRET` for production use

### Step 4: Start MongoDB
Make sure MongoDB is running:
- **Local MongoDB**: Run `mongod` in a separate terminal
- **MongoDB Atlas**: No additional setup needed

### Step 5: Run the Application
Use the provided start script:

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Manual Start:**
```bash
npm run dev
```

## Accessing the Application

Once both servers are running:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Demo Accounts

The application includes demo accounts for testing:
- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123

To create these demo accounts, run:
```bash
cd backend
npm run seed
```

## Manual Setup (Alternative)

If you prefer to set up each part manually:

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Backend (port 5000): Change `PORT` in backend/.env
   - Frontend (port 3000): React will prompt to use a different port

2. **MongoDB Connection Issues**
   - Ensure MongoDB is running
   - Check the `MONGODB_URI` in backend/.env
   - For MongoDB Atlas, ensure your IP is whitelisted

3. **DeepSeek API Issues**
   - The API key is already configured
   - Check your internet connection
   - Verify the API key is valid

4. **File Upload Issues**
   - Ensure the `backend/uploads` directory exists
   - Check file size limits (default: 5MB)
   - Supported formats: PDF and DOCX only

### Logs and Debugging

- **Backend logs**: Check the terminal where you ran `npm run dev`
- **Frontend logs**: Check the browser console (F12)
- **Network issues**: Check the Network tab in browser dev tools

## Project Structure

```
resume-parser-mern/
├── backend/                 # Node.js/Express backend
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── scripts/            # Utility scripts
│   ├── uploads/            # File upload directory
│   └── utils/              # Utility functions
├── frontend/               # React frontend
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   └── package.json
├── start.bat               # Windows start script
├── start.sh                # Linux/Mac start script
└── README.md               # Main documentation
```

## Features Overview

### User Features
- **Authentication**: Register, login, profile management
- **Resume Upload**: Drag & drop PDF/DOCX files
- **AI Parsing**: Automatic extraction of resume data
- **History**: View all uploaded resumes
- **Export**: Download parsed data as JSON
- **Search**: Find resumes by content

### Admin Features
- **User Management**: View, edit, delete users
- **Resume Management**: View all resumes in system
- **System Analytics**: Dashboard with statistics
- **Role Management**: Promote users to admin

### Technical Features
- **JWT Authentication**: Secure token-based auth
- **File Processing**: PDF and DOCX text extraction
- **AI Integration**: DeepSeek API for data parsing
- **Responsive Design**: Works on all devices
- **Real-time Updates**: Live processing status
- **Error Handling**: Comprehensive error management

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Resume Management
- `POST /api/resume/upload` - Upload resume
- `GET /api/resume/history` - Get user's resumes
- `GET /api/resume/:id` - Get specific resume
- `DELETE /api/resume/:id` - Delete resume
- `GET /api/resume/search/:query` - Search resumes
- `GET /api/resume/export/:id` - Export resume data

### Admin (Admin only)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/resumes` - Get all resumes
- `GET /api/admin/stats` - Get system statistics
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `DELETE /api/admin/resumes/:id` - Delete resume

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check the console logs for error messages
4. Ensure all environment variables are set correctly
5. Make sure MongoDB is running and accessible

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in backend/.env
2. Use a strong JWT secret
3. Set up a production MongoDB database
4. Configure proper CORS settings
5. Set up SSL/HTTPS
6. Use a process manager like PM2
7. Set up proper logging and monitoring

---

**Note**: This application is designed for educational and demonstration purposes. For production use, ensure proper security measures, error handling, and monitoring are in place.
