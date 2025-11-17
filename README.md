# 🎯 AI Virtual Hire Coach - Complete Documentation

> **Comprehensive interview preparation platform with intelligent mock interviews, resume analysis, and aptitude testing**

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)]()
[![License](https://img.shields.io/badge/License-MIT-blue)]()

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Quick Start](#-quick-start)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Installation & Setup](#-installation--setup)
- [Resume Analyzer](#-resume-analyzer)
- [Aptitude Tests](#-aptitude-tests)
- [Dashboard](#-dashboard)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🎯 Overview

AI Virtual Hire Coach is a full-stack intelligent interview preparation platform that helps job seekers:

- 🎤 **Practice Mock Interviews** - Intelligent interview simulation
- 📄 **Analyze Resumes** - Comprehensive rule-based resume analysis with ratings (0-100)
- 🧠 **Take Aptitude Tests** - Company-specific and skill-based assessments
- 📊 **Track Progress** - Detailed analytics and performance insights
- 📈 **Improve Skills** - Personalized recommendations and action plans

### Key Objectives

- Simulate realistic interview scenarios using intelligent algorithms
- Analyze and score resumes for ATS compatibility
- Conduct aptitude tests for various job roles and companies
- Track progress with detailed analytics
- Provide personalized feedback and improvement suggestions

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** - Backend runtime
- **Node.js 16+** - Frontend runtime
- **Firebase Project** - Authentication & database

### 3-Step Setup

#### 1️⃣ Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Create .env file
echo CORS_ORIGINS=http://localhost:5173 > .env

# Start backend server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 2️⃣ Frontend Setup

```bash
# Navigate to frontend directory
cd interviewer

# Install dependencies
npm install

# Create .env file with Firebase config
cat > .env << EOF
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
EOF

# Start frontend
npm run dev
```

#### 3️⃣ Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Quick Start Scripts (Windows)

```bash
# Start backend only
start_backend.bat

# Start everything (backend + frontend)
start.bat
```

---

## ✨ Features

### 🎤 AI Mock Interviews

- Interactive chat-based interview simulation
- Real-time question generation based on job role
- Timer-based responses with performance tracking
- Industry-specific question banks
- Voice input support (planned)

### 📄 Resume Analysis (Rule-Based)

**Uses intelligent rule-based analysis for comprehensive evaluation:**

| Feature | Description | Score Range |
|---------|-------------|-------------|
| 🎯 **Overall Score** | Complete resume quality rating | 0-100 |
| 📊 **Section Ratings** | 9 detailed section scores | 0-100 each |
| 💪 **Strengths** | AI-identified strong points | 5-7 points |
| 🎯 **Improvements** | Actionable suggestions | 5-7 points |
| 💡 **Recommendations** | Detailed improvement tips | 6-8 items |
| 🔧 **Skill Analysis** | Current + missing skills | Detailed |
| 📄 **Format Analysis** | Layout & structure tips | Detailed |
| 📈 **Industry Insights** | Market trends & salary data | Current |
| 📋 **Action Plan** | 4-week improvement roadmap | Step-by-step |
| 📥 **PDF Report** | Professional downloadable report | ✅ |

**Nine Section Scores (0-100 each):**
1. **Formatting** - Visual layout, spacing, consistency
2. **Content** - Information quality and relevance
3. **Keywords** - Industry terms and ATS optimization
4. **Experience** - Work history presentation
5. **Skills** - Technical and soft skills coverage
6. **Education** - Educational background
7. **Contact** - Contact information completeness
8. **Summary** - Professional summary effectiveness
9. **Achievements** - Quantifiable accomplishments

### 🧠 Aptitude Tests

**37 Tests Available** across companies and skills:

#### 🏢 Company-Specific Tests (19 Total)

| Company | Easy | Medium | Hard |
|---------|------|--------|------|
| **Google** 🔍 | ✅ 20Q, 45min | ✅ 25Q, 60min | ✅ 15Q, 90min |
| **Microsoft** 🪟 | ✅ 20Q, 40min | ✅ 25Q, 60min | ✅ 18Q, 90min |
| **Amazon** 📦 | ✅ 22Q, 45min | ✅ 25Q, 60min | ✅ 20Q, 120min |
| **Meta** 📘 | ✅ 20Q, 40min | ✅ 28Q, 60min | ✅ 15Q, 90min |
| **TCS** 🏢 | ✅ 30Q, 60min | ✅ 35Q, 75min | ✅ 8Q, 120min |
| **Infosys** 🔷 | ✅ 30Q, 65min | ✅ 25Q, 90min | - |
| **Wipro** 💼 | ✅ 30Q, 60min | ✅ 28Q, 90min | - |

#### 💻 Skill-Based Tests (18 Total)

| Skill | Easy | Medium | Hard |
|-------|------|--------|------|
| **JavaScript** 🟨 | ✅ 25Q, 30min | ✅ 30Q, 45min | ✅ 20Q, 60min |
| **Python** 🐍 | ✅ 25Q, 30min | ✅ 28Q, 45min | ✅ 22Q, 60min |
| **Java** ☕ | ✅ 25Q, 35min | ✅ 30Q, 50min | ✅ 25Q, 75min |
| **React** ⚛️ | ✅ 20Q, 30min | ✅ 28Q, 45min | ✅ 22Q, 60min |
| **SQL** 🗄️ | ✅ 25Q, 30min | ✅ 30Q, 45min | ✅ 20Q, 60min |
| **DSA** 🌳 | ✅ 20Q, 40min | ✅ 25Q, 60min | ✅ 15Q, 90min |

**Features:**
- ✅ Real-time score calculation
- ✅ Firebase storage for results
- ✅ Progress tracking
- ✅ Difficulty-based filtering
- ✅ Search functionality
- ✅ Color-coded badges (Green/Yellow/Red)

### 📊 Dashboard Analytics

**Real-Time Performance Tracking:**

**Top-Level Stats:**
1. **Overall Score** - Combined score across all sections
2. **Total Attempts** - All activities tracked
3. **Best Section** - Highest performing area
4. **Improvement Rate** - Last 7 days progress

**Section Breakdowns:**
- **Aptitude Tests**: Average score, total attempts, recent tests, strengths/improvements
- **Mock Interviews**: Performance metrics, interview history
- **Resume Analysis**: Analysis history, scores, recommendations

**Recent Activity Feed:**
- Last 10 activities across all sections
- Real-time updates when completing assessments
- Chronological ordering with timestamps

**Achievement System:**
- 🏆 **Test Champion** - 80%+ in aptitude tests
- 📄 **Resume Expert** - 3+ resumes above 80%
- ⭐ **Dedicated Learner** - 5+ aptitude tests completed
- 🎯 **High Achiever** - Best score 85%+

### 👤 Profile Management

- Complete user profile setup (stored in Firestore)
- Job preferences configuration
- Experience level tracking
- Interview history management
- Personalized recommendations

---

## 🛠 Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | Latest | Modern Python web framework |
| **PyPDF2** | 3.0.1 | PDF text extraction |
| **python-docx** | 1.1.0 | DOCX text extraction |
| **ReportLab** | 4.0.7 | PDF report generation |
| **Firebase Admin** | Latest | Authentication & Firestore |
| **python-dotenv** | 1.1.1 | Environment variable management |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Vite** | 5.x | Build tool & dev server |
| **React Router** | 6.30.1 | Client-side routing |
| **TailwindCSS** | 3.x | Utility-first CSS |
| **Shadcn/ui** | Latest | Component library |
| **Radix UI** | Latest | Headless UI primitives |
| **Lucide React** | 0.462.0 | Icon library |
| **TanStack Query** | 5.83.0 | Server state management |
| **React Hook Form** | 7.61.1 | Form management |
| **Zod** | 3.25.76 | Schema validation |
| **Recharts** | 2.15.4 | Chart library |

### Database & Auth

- **Firebase Authentication** - Email/password + phone OTP
- **Firestore** - NoSQL database for user data
- **Firebase Storage** - File storage (optional)

---

## 📁 Installation & Setup

### Complete Installation

#### 1. Clone Repository

```bash
git clone https://github.com/yourusername/virtua-hire-coach.git
cd virtua-hire-coach
```

#### 2. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Create .env file (or run setup_env.bat on Windows)
cat > .env << EOF
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
GOOGLE_APPLICATION_CREDENTIALS=firebase-service-account.json
EOF

# Download Firebase service account JSON
# Place it in project root as firebase-service-account.json
```

#### 3. Frontend Setup

```bash
cd interviewer

# Install Node dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
EOF
```

#### 4. Firebase Configuration

**Set up Firestore Security Rules:**

```bash
cd interviewer
firebase deploy --only firestore:rules
```

**Firestore Rules** (already configured in `firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Aptitude tests
    match /users/{userId}/aptitude_tests/{testId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Resume analyses
    match /users/{userId}/resume_analyses/{analysisId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### 5. Start Servers

**Terminal 1 (Backend):**
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd interviewer
npm run dev
```

---

## 📄 Resume Analyzer

### How to Use

1. **Navigate** to `/resume-analyzer`
2. **Upload** resume (PDF or DOCX, max 10MB)
3. **Wait** 20-40 seconds for AI analysis
4. **Review** comprehensive results
5. **Download** professional PDF report

### Analysis Output

```json
{
  "overallScore": 85,
  "atsScore": 88,
  "sections": {
    "formatting": 90,
    "content": 85,
    "keywords": 82,
    "experience": 88,
    "skills": 80,
    "education": 90,
    "contact": 95,
    "summary": 78,
    "achievements": 85
  },
  "strengths": [
    "Strong quantifiable achievements",
    "Clear professional summary",
    "Well-structured experience section",
    "Excellent ATS compatibility"
  ],
  "improvements": [
    "Add more industry-specific keywords",
    "Include leadership experience",
    "Expand on project outcomes"
  ],
  "recommendations": [
    "Add metrics to achievements",
    "Include certifications section",
    "Optimize for ATS keywords"
  ],
  "skillAnalysis": {
    "currentSkills": ["Python", "JavaScript", "React"],
    "missingSkills": ["TypeScript", "AWS", "Docker"],
    "skillGaps": ["Cloud computing", "DevOps"],
    "suggestions": ["Take AWS certification", "Learn Docker"]
  },
  "formatAnalysis": {
    "currentFormat": "Chronological",
    "suggestedFormat": "Hybrid",
    "issues": ["Inconsistent spacing"],
    "improvements": ["Use bullet points", "Add section headers"]
  },
  "industryInsights": {
    "industry": "Software Engineering",
    "trends": ["AI/ML skills in demand"],
    "salaryRange": "$80k - $120k",
    "opportunities": ["Remote work", "Startup growth"]
  },
  "actionPlan": {
    "summary": "Focus on quantifying achievements...",
    "keyFindings": ["Strong technical skills", "Needs more metrics"],
    "weeklyPlan": {
      "week1": "Add metrics to achievements",
      "week2": "Optimize keywords",
      "week3": "Improve formatting",
      "week4": "Add certifications"
    }
  }
}
```

### API Endpoints

```
POST   /api/resume/analyze              # Upload & analyze resume
GET    /api/resume/analysis/{id}        # Get specific analysis
GET    /api/resume/analyses             # List all user analyses
GET    /api/resume/analysis/{id}/pdf    # Download PDF report
```


---

## 🧠 Aptitude Tests

### Available Tests

**Total: 37 tests** across 3 difficulty levels

#### Company Tests (19)
- Google (3), Microsoft (3), Amazon (3), Meta (3)
- TCS (3), Infosys (2), Wipro (2)

#### Skill Tests (18)
- JavaScript (3), Python (3), Java (3)
- React (3), SQL (3), DSA (3)

### How to Take Tests

1. **Navigate** to `/aptitude-test`
2. **Choose** Company Tests or Skill Tests tab
3. **Filter** by difficulty (Easy/Medium/Hard) or search
4. **Select** a test and click "Start Test"
5. **Answer** questions (5 per test currently)
6. **Submit** and get immediate score
7. **View** results on dashboard

### Test Features

- ✅ Real-time score calculation
- ✅ Immediate feedback after submission
- ✅ Results saved to Firebase
- ✅ Progress tracking on dashboard
- ✅ Color-coded difficulty badges
- ✅ Timer and progress indicators

### Firebase Data Structure

```
users/{userId}/aptitude_tests/{testId}/
  - testName: "Google Coding Assessment - Easy"
  - score: 85
  - difficulty: "Easy"
  - timestamp: Timestamp
  - status: "Passed"
  - questionsAnswered: 5
  - correctAnswers: 4
```

---

## 📊 Dashboard

### Overview

The dashboard provides comprehensive analytics with **real-time data from Firebase**.

### Sections

#### 1. Top Stats (4 Cards)
- **Overall Score**: Combined across all activities
- **Total Attempts**: All tests/interviews/analyses
- **Best Section**: Highest performing area
- **Improvement Rate**: Last 7 days progress

#### 2. Aptitude Tests Section
- Average score and total attempts
- Recent test history (last 3-5)
- Strengths and areas to improve
- "Take New Test" action button

#### 3. Interviews Section (Planned)
- Interview history and scores
- Performance metrics
- "Start Interview" action button

#### 4. Resume Analysis Section
- Analysis history and scores
- Recent analyses with details
- "Analyze Resume" action button

#### 5. Recent Activity
- Last 10 activities across all sections
- Real-time updates
- Sorted by timestamp

#### 6. Achievements
- Dynamically earned based on performance
- Test Champion, Resume Expert, High Achiever, etc.

#### 7. Quick Actions
- Start Interview
- Upload Resume
- Take Aptitude Test
- View Results

### Data Flow

1. User completes activity (test/analysis)
2. Data saved to Firebase
3. Dashboard fetches on page load
4. Real-time updates when new data added
5. Statistics calculated from actual data

---

## 📁 Project Structure

```
virtua-hire-coach-main/
├── .env                              # Backend environment variables
├── main.py                           # FastAPI backend server
├── requirements.txt                  # Python dependencies
├── setup_env.bat                     # Environment setup script
├── start_backend.bat                 # Backend startup script
├── start.bat                         # Start everything (backend + frontend)
│
├── models/
│   └── schemas.py                    # Pydantic data models
│
├── services/
│   ├── ai.py                        # Rule-based resume analysis
│   ├── auth.py                      # Firebase authentication
│   ├── db.py                        # Firestore database operations
│   ├── pdf_generator.py             # PDF report generation
│   └── storage.py                   # File storage operations
│
└── interviewer/                      # React frontend
    ├── .env                         # Frontend environment variables
    ├── package.json                 # Node dependencies
    ├── vite.config.ts               # Vite configuration
    ├── tailwind.config.ts           # Tailwind CSS config
    ├── tsconfig.json                # TypeScript config
    ├── firebase.json                # Firebase config
    ├── firestore.rules              # Firestore security rules
    │
    ├── public/
    │   ├── favicon.ico
    │   └── placeholder.svg
    │
    └── src/
        ├── main.tsx                 # App entry point
        ├── App.tsx                  # Main app component
        ├── globals.css              # Global styles
        ├── index.css                # Index styles
        │
        ├── components/
        │   ├── AuthRoute.tsx        # Protected route wrapper
        │   ├── Layout/
        │   │   ├── Layout.tsx       # Main layout
        │   │   └── Navbar.tsx       # Navigation bar
        │   └── ui/                  # Shadcn/ui components (40+)
        │
        ├── hooks/
        │   ├── use-mobile.tsx       # Mobile detection
        │   ├── use-toast.ts         # Toast notifications
        │   └── useInterview.ts      # Interview logic
        │
        ├── lib/
        │   ├── api.ts              # API client
        │   ├── auth.ts             # Auth helpers
        │   ├── firebase.ts         # Firebase config
        │   ├── profile.ts          # Profile operations
        │   └── utils.ts            # Utilities
        │
        └── pages/
            ├── Login.tsx            # Authentication
            ├── Dashboard.tsx        # Main dashboard
            ├── Interview.tsx        # Mock interview
            ├── AptitudeTest.tsx     # Aptitude tests
            ├── ResumeAnalyzer.tsx   # Resume analysis
            ├── Profile.tsx          # User profile
            ├── Results.tsx          # Results page
            └── NotFound.tsx         # 404 page
```

---

## 🔌 API Documentation

### Backend Endpoints

#### Health Check
```
GET /health
Response: { "ok": true }
```

#### Resume Analysis
```
POST /api/resume/analyze
Headers: Authorization: Bearer {firebase_token}
Body: multipart/form-data with 'file' field
Response: { analysisId, analysis, message }

GET /api/resume/analysis/{id}
Headers: Authorization: Bearer {firebase_token}
Response: { analysis data }

GET /api/resume/analyses
Headers: Authorization: Bearer {firebase_token}
Response: [{ analysis1 }, { analysis2 }, ...]

GET /api/resume/analysis/{id}/pdf
Headers: Authorization: Bearer {firebase_token}
Response: PDF file download
```

#### Interview Endpoints
```
POST /api/interview/start
POST /api/interview/answer
GET /api/interview/results/{id}
```

#### Profile Endpoint
```
GET /api/profile
```

### Frontend Routes

```
/login                  # Authentication page
/                       # Dashboard (protected)
/interview              # Mock interview (protected)
/aptitude-test          # Aptitude tests (protected)
/resume-analyzer        # Resume analysis (protected)
/profile                # User profile (protected)
/results                # Results page (protected)
```

---

## 🚀 Deployment

### Backend Deployment

#### Option 1: Vercel/Netlify (Serverless)
```bash
# Build backend
pip install -r requirements.txt

# Deploy using Vercel
vercel --prod

# Or Netlify
netlify deploy --prod
```

#### Option 2: Traditional Server (VPS/Cloud)
```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment variables
export CORS_ORIGINS=https://yourdomain.com

# Run with gunicorn for production
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Frontend Deployment

```bash
cd interviewer

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod --dir=dist
```

### Environment Variables (Production)

**Backend (.env):**
```env
CORS_ORIGINS=https://yourdomain.com
GOOGLE_APPLICATION_CREDENTIALS=path/to/firebase-admin.json
```

**Frontend (.env):**
```env
VITE_FIREBASE_API_KEY=your_production_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your-prod-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-prod-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-prod-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_prod_sender_id
VITE_FIREBASE_APP_ID=your_prod_app_id
VITE_API_URL=https://api.yourdomain.com
```

### Firebase Deployment

```bash
# Deploy Firestore rules and indexes
cd interviewer
firebase deploy --only firestore

# Deploy everything
firebase deploy
```

---

## 🐛 Troubleshooting

### Common Issues

#### Backend Won't Start

**Error:** "Module not found"
```bash
# Solution: Reinstall dependencies
pip install -r requirements.txt
```


**Error:** "Port already in use"
```bash
# Solution: Change port or kill process
python -m uvicorn main:app --reload --port 8001
```

#### Frontend Issues

**Error:** "Failed to fetch"
```bash
# Solution 1: Check backend is running
curl http://localhost:8000/health

# Solution 2: Check CORS settings in backend .env
CORS_ORIGINS=http://localhost:5173
```

**Error:** "Firebase: Error (auth/...)"
```bash
# Solution: Check Firebase config in interviewer/.env
# Ensure all VITE_FIREBASE_* variables are set
```

**Error:** "Module not found"
```bash
cd interviewer
npm install
```

#### Resume Analyzer Issues

**Error:** "Analysis failed"
```bash
# Check file format (PDF or DOCX only)
# Check file size (max 10MB)
# Ensure resume contains readable text content
```

**Error:** "PDF download failed"
```bash
# Check reportlab is installed
pip install reportlab

# Check analysis completed successfully
```

#### Aptitude Test Issues

**Error:** "No test results"
```bash
# This is normal if no tests taken yet
# Take a test to see results appear
```

**Error:** "Questions not loading"
```bash
# Check frontend console for errors
# Verify test questions are defined in AptitudeTest.tsx
```

#### Dashboard Issues

**Error:** "No data showing"
```bash
# This is normal for new users
# Complete activities to see data:
# - Upload a resume
# - Take an aptitude test
# - Start a mock interview
```

**Error:** "Loading state stuck"
```bash
# Check Firebase connection
# Check browser console for errors
# Verify Firestore rules are deployed
```

### Debugging Tips

**Backend:**
```bash
# Run with debug logging
python -m uvicorn main:app --reload --log-level debug

# Check backend logs for errors
# Check Firebase connection
# Verify file processing libraries are installed
```

**Frontend:**
```bash
# Open browser DevTools (F12)
# Check Console tab for errors
# Check Network tab for failed requests
# Verify Firebase initialization
```

**Database:**
```bash
# Check Firestore data in Firebase Console
# Verify security rules allow access
# Check user authentication status
```

---

## 🎨 Design System

### Color Palette

Defined via CSS variables in `globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --muted: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}
```

### Typography

- **Font**: Inter (imported from Google Fonts)
- **Scale**: Tailwind's default (text-xs to text-9xl)
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing & Layout

- **Max Width**: 1400px (container)
- **Responsive Grid**: 12-column grid system
- **Breakpoints**:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

### Components

All components use Shadcn/ui + Radix UI primitives:
- Cards, Buttons, Forms, Navigation
- Dialogs, Dropdowns, Tooltips
- Tables, Charts, Badges
- All responsive with hover/focus states

---

## 📈 Future Enhancements

### Planned Features

1. **Voice-to-Text Responses** - Record interview answers
2. **Video Interview Simulation** - Practice with video
3. **AI Interview Coach** - Real-time feedback during practice
4. **Mobile App** - React Native mobile application
5. **Advanced Analytics** - ML-powered insights
6. **Social Features** - Compare with peers
7. **Job Matching** - Match resume to job descriptions
8. **Interview Scheduling** - Calendar integration
9. **Multi-language Support** - Internationalization
10. **LinkedIn Integration** - Import profile data

### Technical Improvements

1. **Caching Layer** - Redis for faster responses
2. **Queue System** - Background job processing
3. **Batch Processing** - Multiple resumes at once
4. **API Versioning** - v1, v2 endpoints
5. **Webhook Notifications** - Real-time alerts
6. **Progressive Web App** - Offline capabilities
7. **A/B Testing** - Optimize user experience
8. **Advanced Security** - Rate limiting, DDoS protection

---

## 🤝 Contributing

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure all tests pass

### Code Style

**Backend (Python):**
- Follow PEP 8
- Use type hints
- Write docstrings
- Keep functions small and focused

**Frontend (TypeScript/React):**
- Use functional components
- Follow React best practices
- Use TypeScript strictly
- Keep components modular

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Special thanks to:

- **[Shadcn/ui](https://ui.shadcn.com)** - Beautiful component library
- **[Radix UI](https://www.radix-ui.com)** - Accessible UI primitives
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[Lucide Icons](https://lucide.dev)** - Beautiful icon library
- **[Recharts](https://recharts.org)** - Charting library
- **[Firebase](https://firebase.google.com)** - Authentication & database
- **[FastAPI](https://fastapi.tiangolo.com)** - Modern Python web framework

---

## 📞 Support & Contact

For issues, questions, or suggestions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review [API Documentation](#-api-documentation)
3. Check browser console (F12) for frontend errors
4. Check backend logs for API errors
5. Open an issue on GitHub

---

## 📊 Project Status

**Current Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: October 2025

### What's Working

- ✅ User authentication (Email/Password + Phone OTP)
- ✅ Resume analysis with rule-based intelligence
- ✅ 37 aptitude tests (company + skill-based)
- ✅ Real-time dashboard with analytics
- ✅ PDF report generation
- ✅ Firebase data persistence
- ✅ Profile management
- ✅ Achievement system
- ✅ Responsive design

### In Development

- 🔄 Mock interview AI integration
- 🔄 Voice input for interviews
- 🔄 Video interview simulation
- 🔄 Advanced analytics and insights

---

## 🚀 Get Started Now!

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/virtua-hire-coach.git

# 2. Install dependencies
pip install -r requirements.txt
cd interviewer && npm install

# 3. Set up environment variables
# Create .env files for backend and frontend

# 4. Start servers
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
cd interviewer && npm run dev

# 5. Open browser
# http://localhost:5173
```

**Start preparing for your dream job today!** 🎯🚀

---

**Made with ❤️ using FastAPI, React, TypeScript, and Firebase**
