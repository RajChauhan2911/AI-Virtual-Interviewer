# AI Interviewer - Virtual Hire Coach

A full-stack AI-powered interview preparation platform with resume analysis and mock interviews.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Firebase project
- OpenAI API key

### Setup

1. **Install Dependencies**
   ```bash
   # Backend
   pip install -r requirements.txt
   
   # Frontend
   cd interviewer
   npm install
   ```

2. **Configure Environment**
   
   **Frontend** (`interviewer/.env`):
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
   
   **Backend** (`.env`):
   ```env
   OPENAI_API_KEY=your_openai_api_key
   CORS_ORIGINS=http://localhost:5173
   GOOGLE_APPLICATION_CREDENTIALS=firebase-service-account.json
   ```

3. **Start Servers**
   ```bash
   # Backend (Terminal 1)
   python -m uvicorn main:app --reload
   
   # Frontend (Terminal 2)
   cd interviewer
   npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 🔧 Firebase Setup

1. Create project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password + Phone)
3. Create Firestore Database
4. Download service account JSON
5. Get web app config for frontend

## 📁 Project Structure

```
├── main.py                 # FastAPI backend server
├── requirements.txt        # Python dependencies
├── .env                   # Backend environment variables
├── models/
│   └── schemas.py         # Data models
├── services/
│   ├── ai.py             # OpenAI integration
│   ├── auth.py           # Firebase authentication
│   ├── db.py             # Database operations
│   ├── pdf_generator.py  # Resume analysis PDF
│   └── storage.py        # File storage
└── interviewer/          # React frontend
    ├── src/
    │   ├── pages/        # React pages
    │   ├── components/   # UI components
    │   ├── lib/          # Utilities & Firebase
    │   └── hooks/        # Custom hooks
    ├── package.json      # Frontend dependencies
    └── .env             # Frontend environment variables
```

## 🎯 Features

- **User Authentication**: Email/password and phone OTP
- **Mock Interviews**: AI-powered interview simulation
- **Resume Analysis**: AI-driven resume feedback
- **Progress Tracking**: Interview history and scores
- **PDF Reports**: Downloadable analysis reports

## 🛠️ Development

### Backend API Endpoints
- `POST /api/interview/start` - Start new interview
- `POST /api/interview/answer` - Submit interview answer
- `POST /api/resume/analyze` - Analyze uploaded resume
- `GET /api/profile` - Get user profile

### Frontend Pages
- `/login` - Authentication
- `/` - Dashboard
- `/interview` - Mock interview
- `/resume-analyzer` - Resume analysis
- `/profile` - User profile

## 📝 License

This project is for educational purposes.
