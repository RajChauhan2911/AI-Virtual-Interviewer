# 🚀 AI Resume Analyzer - OpenAI Powered

> **Comprehensive resume analysis with ratings, suggestions, and PDF reports**

---

## ⚡ Quick Start (3 Steps)

### 1️⃣ Setup Backend
```bash
# Create .env file
echo OPENAI_API_KEY=your_key_here > .env

# Install & Start
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 2️⃣ Setup Frontend
```bash
cd interviewer
npm install
npm run dev
```

### 3️⃣ Use It!
1. Login at `http://localhost:5173`
2. Go to "Resume Analyzer"
3. Upload resume (PDF/DOCX)
4. Get instant AI analysis
5. Download PDF report

---

## ✨ Features

| Feature | Description | Score Range |
|---------|-------------|-------------|
| 🎯 **Overall Score** | Complete resume quality rating | 0-100 |
| 📊 **Section Ratings** | 9 detailed section scores | 0-100 each |
| 💪 **Strengths** | What's working well | 5-7 points |
| 🎯 **Improvements** | What needs work | 5-7 points |
| 💡 **Recommendations** | Actionable suggestions | 6-8 items |
| 🔧 **Skill Analysis** | Current + missing skills | Detailed |
| 📄 **Format Analysis** | Layout & structure tips | Detailed |
| 📈 **Industry Insights** | Market trends & salary | Current data |
| 📋 **Action Plan** | 4-week improvement plan | Step-by-step |
| 📥 **PDF Report** | Professional downloadable report | ✅ |

---

## 📊 Nine Section Scores

Each scored **0-100** with detailed analysis:

```
1. Formatting      → Layout, spacing, consistency
2. Content         → Information quality
3. Keywords        → ATS optimization
4. Experience      → Work history presentation
5. Skills          → Technical & soft skills
6. Education       → Educational background
7. Contact         → Contact info completeness
8. Summary         → Professional summary
9. Achievements    → Quantifiable results
```

---

## 🔧 Technology Stack

**Backend:**
- ⚡ FastAPI - Modern Python web framework
- 🤖 OpenAI GPT-4o - AI analysis engine
- 📄 PyPDF2 & python-docx - Text extraction
- 📊 ReportLab - PDF generation
- 🔥 Firebase - Authentication & storage

**Frontend:**
- ⚛️ React + TypeScript - UI framework
- 🎨 TailwindCSS - Styling
- 🔔 Radix UI - Components
- 🔥 Firebase Auth - User management

---

## 💰 Cost Per Analysis

| Model | Input | Output | Total | Best For |
|-------|-------|--------|-------|----------|
| **GPT-4o** | $0.045 | $0.075 | **~$0.12** | Best quality ⭐ |
| GPT-4 | $0.045 | $0.090 | ~$0.14 | High quality |
| GPT-3.5-Turbo | $0.002 | $0.004 | ~$0.01 | Budget 💰 |

**Monthly estimates (GPT-4o):**
- 100 analyses: $12
- 500 analyses: $60
- 1,000 analyses: $120

---

## 📁 File Structure

```
project/
├── .env                           # OpenAI API key
├── main.py                        # FastAPI backend
├── requirements.txt               # Python dependencies
├── services/
│   ├── ai.py                     # ✨ OpenAI integration
│   ├── pdf_generator.py          # 📄 PDF reports
│   ├── auth.py                   # 🔐 Authentication
│   └── db.py                     # 💾 Firebase
└── interviewer/
    ├── src/
    │   ├── pages/
    │   │   └── ResumeAnalyzer.tsx  # 🎨 Main UI
    │   └── lib/
    │       ├── auth.ts            # 🔐 Auth helpers
    │       └── firebase.ts        # 🔥 Firebase config
    └── package.json
```

---

## 🎯 Example Analysis Output

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
    "Strong quantifiable achievements with metrics",
    "Clear, professional formatting and layout",
    "Comprehensive technical skills section",
    "Well-crafted professional summary",
    "Excellent ATS compatibility"
  ],
  "improvements": [
    "Add more industry-specific keywords",
    "Include leadership experience examples",
    "Expand on project outcomes",
    "Add certifications section",
    "Improve achievement quantification"
  ]
}
```

---

## 🔄 API Endpoints

```
POST   /api/resume/analyze              Upload & analyze resume
GET    /api/resume/analysis/{id}        Get specific analysis
GET    /api/resume/analyses             List all user analyses
GET    /api/resume/analysis/{id}/pdf    Download PDF report
```

All endpoints require Firebase Authentication.

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| ❌ API key error | Check `.env` has `OPENAI_API_KEY=your_key` |
| ❌ CORS error | Add `CORS_ORIGINS=http://localhost:5173` to `.env` |
| ❌ Auth failed | Verify user is logged in with Firebase |
| ❌ PDF extraction failed | Ensure file is valid PDF/DOCX |
| ❌ Module not found | Run `pip install -r requirements.txt` |

---

## 📚 Documentation

- 📖 **[Complete Setup Guide](RESUME_ANALYZER_SETUP.md)** - Detailed instructions
- ⚡ **[Quick Start Guide](QUICKSTART_RESUME_ANALYZER.md)** - Fast setup
- ✅ **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - What's built
- 🔥 **[Firebase Setup](interviewer/FIREBASE_SETUP.md)** - Profile data storage

---

## 🎨 Screenshots

### Upload Interface
```
┌─────────────────────────────────────┐
│     📤 Upload Your Resume           │
│                                     │
│   Drag and drop your resume here   │
│   or click to browse                │
│                                     │
│   Supports PDF and DOCX up to 10MB │
└─────────────────────────────────────┘
```

### Analysis Results
```
┌─────────────────────────────────────┐
│         Overall Score: 85           │
│             ⭕ 85/100               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      Section Breakdown              │
│  Formatting    ████████░░  90%     │
│  Content       ████████░░  85%     │
│  Keywords      ████████░░  82%     │
│  Experience    ████████░░  88%     │
│  Skills        ████████░░  80%     │
└─────────────────────────────────────┘
```

---

## ✅ Checklist

### Required
- [ ] OpenAI API key obtained
- [ ] `.env` file created with API key
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Firebase configured
- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173

### Testing
- [ ] Upload PDF resume works
- [ ] Upload DOCX resume works
- [ ] Analysis completes successfully
- [ ] All sections display scores
- [ ] Strengths and improvements show
- [ ] PDF download works
- [ ] Error handling works

---

## 🚀 Start Commands

**Backend:**
```bash
python -m uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd interviewer && npm run dev
```

**Both:**
```bash
start.bat  # Windows
```

---

## 📊 Analysis Includes

### Core Metrics
- ✅ Overall resume score (0-100)
- ✅ Nine section scores (0-100 each)
- ✅ ATS compatibility score (0-100)

### Qualitative Analysis
- ✅ 5-7 identified strengths
- ✅ 5-7 areas for improvement
- ✅ 6-8 specific recommendations

### Detailed Insights
- ✅ Current skills identified
- ✅ Recommended missing skills
- ✅ Skill gap analysis
- ✅ Format type analysis
- ✅ Format improvements
- ✅ Industry detection
- ✅ Market trends
- ✅ Salary insights
- ✅ Growth opportunities

### Action Plan
- ✅ Executive summary
- ✅ Key findings
- ✅ 4-week action plan
- ✅ Priority actions

### Deliverable
- ✅ Professional PDF report with all above

---

## 🎉 Ready to Use!

Your AI-powered resume analyzer is **fully functional** with:

✅ OpenAI GPT-4o integration  
✅ Comprehensive 1-100 ratings  
✅ Detailed suggestions and recommendations  
✅ Weak points and strengths analysis  
✅ Professional PDF report download  

**Start analyzing resumes now!** 🚀

---

## 📧 Need Help?

1. Check [Complete Setup Guide](RESUME_ANALYZER_SETUP.md)
2. Review [Quick Start](QUICKSTART_RESUME_ANALYZER.md)
3. Read [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
4. Check backend logs: `python -m uvicorn main:app --reload --log-level debug`
5. Check frontend console: Press F12 in browser

---

## 🔒 Security

- ✅ Firebase Authentication required
- ✅ User data isolated in Firestore
- ✅ API tokens validated
- ✅ Secure file uploads
- ✅ No data leakage between users

---

**Made with ❤️ using OpenAI GPT-4o + FastAPI + React + Firebase**
