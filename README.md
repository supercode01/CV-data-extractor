# Resume Parser MERN Application

A fully functional Resume Parser Website built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that uses DeepSeek API to extract structured fields from resumes in PDF and DOCX format.

## 🚀 Features

- **Resume Upload**: Support for PDF and DOCX files with drag & drop interface
- **AI-Powered Extraction**: Uses DeepSeek API to extract structured data from resumes
- **User Authentication**: JWT-based login and registration system
- **Dashboard**: Professional interface for managing parsed resumes
- **User History**: Track all previous resume uploads and parsed data
- **Admin Panel**: Manage users and system data
- **Export Options**: Download extracted data as JSON/CSV
- **Search & Filter**: Find resumes by skills or experience
- **Responsive Design**: Modern UI with Tailwind CSS

## 📋 Extracted Fields

The system extracts the following fields from resumes:
- Full Name
- Email
- Phone
- Address
- Skills
- LinkedIn Link
- GitHub Link
- Experience
- Education
- Projects

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- pdf-parse for PDF processing
- mammoth for DOCX processing

### Frontend
- React.js
- Tailwind CSS
- React Router
- Axios for API calls
- React Dropzone for file uploads

### AI Integration
- DeepSeek API for resume data extraction

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Quick Start

1. **Clone or extract the project**
   ```bash
   # If using git
   git clone <repository-url>
   cd resume-parser-mern
   
   # Or extract the project files to your desired location
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   - Navigate to the `backend` directory
   - Copy `env.example` to `.env`:
     ```bash
     cd backend
     copy env.example .env  # Windows
     # or
     cp env.example .env    # Linux/Mac
     ```
   - Update the `.env` file with your configuration:
     ```env
     MONGODB_URI=mongodb://localhost:27017/resume-parser
     JWT_SECRET=your_super_secret_jwt_key_here
     DEEPSEEK_API_KEY=sk-or-v1-c7f885375c4d92bc3fac9574ce54af5d10df926e568f217c4989ca367e002
     PORT=5000
     ```

4. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - For local MongoDB: `mongod`
   - For MongoDB Atlas: No additional setup needed

5. **Start the application**
   
   **Option 1: Using the start script (Recommended)**
   ```bash
   # Windows
   start.bat
   
   # Linux/Mac
   chmod +x start.sh
   ./start.sh
   ```
   
   **Option 2: Manual start**
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Demo Credentials
For testing purposes, you can use these demo accounts:
- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123

> **Note**: These are demo accounts. In production, create your own accounts through the registration page.

## 🏗️ Project Structure

```
resume-parser-mern/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── uploads/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.js
│   ├── package.json
│   └── tailwind.config.js
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Resume Management
- `POST /api/resume/upload` - Upload and parse resume
- `GET /api/resume/history` - Get user's resume history
- `GET /api/resume/:id` - Get specific resume details
- `DELETE /api/resume/:id` - Delete resume

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/resumes` - Get all resumes (admin only)

## 🎨 Usage

1. **Register/Login**: Create an account or login to access the dashboard
2. **Upload Resume**: Drag and drop or select PDF/DOCX files
3. **View Results**: See extracted data in a structured format
4. **Manage History**: View and manage all your previous uploads
5. **Export Data**: Download extracted data in JSON or CSV format

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- File type validation
- File size limits
- Role-based access control (user/admin)

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.
