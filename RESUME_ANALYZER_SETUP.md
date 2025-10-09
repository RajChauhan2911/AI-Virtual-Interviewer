# Resume Analyzer with OpenAI - Complete Setup Guide

## Overview

The Resume Analyzer feature uses **OpenAI GPT-4** to provide comprehensive, AI-powered analysis of resumes with:
- ✅ **Ratings (1-100)** for different sections
- ✅ **Overall resume score**
- ✅ **Detailed suggestions** and recommendations
- ✅ **Weak points and strengths** analysis
- ✅ **Professional PDF report** download
- ✅ **ATS compatibility** scoring
- ✅ **Industry insights** and market trends
- ✅ **4-week action plan**

---

## 🔧 Backend Setup

### 1. Install Dependencies

Make sure you have all required packages installed:

```bash
pip install -r requirements.txt
```

The key packages are:
- `openai==1.3.0` - OpenAI API client
- `PyPDF2==3.0.1` - PDF text extraction
- `python-docx==1.1.0` - DOCX text extraction
- `reportlab==4.0.7` - PDF generation
- `fastapi` & `uvicorn` - API server
- `firebase-admin` - Firebase authentication

### 2. Set Up OpenAI API Key

Create a `.env` file in the project root:

```bash
# .env file
OPENAI_API_KEY=your_openai_api_key_here
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**Get your OpenAI API key:**
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and paste it in your `.env` file

### 3. Firebase Configuration

Make sure your Firebase Admin SDK is configured in `services/db.py`:

```python
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin (if not already done)
if not firebase_admin._apps:
    cred = credentials.Certificate("path/to/your/firebase-admin-sdk.json")
    firebase_admin.initialize_app(cred)
```

### 4. Start the Backend Server

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or use the provided batch file:
```bash
start_backend.bat
```

---

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
cd interviewer
npm install
```

### 2. Configure Firebase (Client-Side)

Create `interviewer/.env` file with your Firebase config:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Start the Frontend

```bash
cd interviewer
npm run dev
```

The app will be available at http://localhost:5173

---

## 📋 Features & Analysis Breakdown

### 1. **Section Ratings (1-100)**

The AI analyzes and scores each section:

- **Formatting** (0-100): Visual layout, spacing, consistency
- **Content** (0-100): Quality and relevance of information
- **Keywords** (0-100): Industry-specific terms and ATS optimization
- **Experience** (0-100): Work history quality and presentation
- **Skills** (0-100): Technical and soft skills coverage
- **Education** (0-100): Educational background presentation
- **Contact** (0-100): Contact information completeness
- **Summary** (0-100): Professional summary effectiveness
- **Achievements** (0-100): Quantifiable accomplishments

### 2. **Overall Resume Score**

Weighted average of all sections providing a comprehensive rating.

### 3. **ATS Compatibility Score**

Measures how well the resume will perform with Applicant Tracking Systems.

### 4. **Strengths Analysis**

AI identifies:
- Strong points in the resume
- Effective formatting choices
- Impressive achievements
- Well-presented skills

### 5. **Areas for Improvement**

Specific, actionable feedback on:
- Weak sections
- Missing information
- Formatting issues
- Content improvements

### 6. **Skill Analysis**

- **Current Skills**: Identified from resume
- **Missing Skills**: Recommended for the target role
- **Skill Gaps**: Areas needing development
- **Skill Suggestions**: How to acquire missing skills

### 7. **Format Analysis**

- Current format type (Chronological, Functional, Hybrid)
- Suggested format for better impact
- Format issues and improvements
- Layout recommendations

### 8. **Industry Insights**

- **Detected Industry**: Based on resume content
- **Market Trends**: Current industry trends
- **Salary Insights**: Typical salary ranges
- **Growth Opportunities**: Career advancement paths

### 9. **Detailed Report**

- **Executive Summary**: High-level overview
- **Key Findings**: Most important observations
- **4-Week Action Plan**: Step-by-step improvement plan
- **Priority Actions**: Immediate next steps

### 10. **PDF Report Download**

Professional PDF report with:
- All analysis sections
- Formatted tables and scores
- Easy-to-read layout
- Print-friendly design

---

## 🚀 How to Use

### Step 1: Upload Resume
1. Navigate to `/resume-analyzer` in the app
2. Drag & drop your resume (PDF or DOCX)
3. Or click to browse and select file
4. Maximum file size: 10MB

### Step 2: Analysis
- AI analyzes the resume (takes 10-30 seconds)
- GPT-4 processes the content
- Comprehensive report is generated

### Step 3: Review Results
- View overall score and section breakdowns
- Read strengths and improvement areas
- Check skill analysis and recommendations
- Review industry insights

### Step 4: Download Report
- Click "Download Detailed Report"
- Get professional PDF with all findings
- Share with career counselors or mentors
- Keep for reference

---

## 🔒 Security & Privacy

### Data Storage
- Resume analyses stored in Firebase Firestore
- Each user can only access their own analyses
- Firestore security rules enforce access control

### Data Structure
```
users/{userId}/resume_analyses/{analysisId}
  - userId: string
  - filename: string
  - analysis: object (full analysis data)
  - createdAt: timestamp
  - analysisId: string
```

### Privacy
- Resume content is sent to OpenAI for analysis
- Processed data stored in your Firebase database
- Users control their own data
- Can be deleted at any time

---

## 🎯 API Endpoints

### Upload & Analyze Resume
```
POST /api/resume/analyze
Headers: Authorization: Bearer {firebase_token}
Body: multipart/form-data with 'file' field
Response: { analysisId, analysis, message }
```

### Get Analysis
```
GET /api/resume/analysis/{analysisId}
Headers: Authorization: Bearer {firebase_token}
Response: { analysis data }
```

### List All Analyses
```
GET /api/resume/analyses
Headers: Authorization: Bearer {firebase_token}
Response: [ { analysis1 }, { analysis2 }, ... ]
```

### Download PDF Report
```
GET /api/resume/analysis/{analysisId}/pdf
Headers: Authorization: Bearer {firebase_token}
Response: PDF file download
```

---

## 🐛 Troubleshooting

### "Analysis failed: API key not found"
- Check your `.env` file has `OPENAI_API_KEY`
- Restart the backend server after adding the key
- Verify the API key is valid on OpenAI dashboard

### "Authentication required"
- Make sure user is logged in with Firebase
- Check Firebase configuration in frontend
- Verify token is being sent in requests

### "File upload failed"
- Check file size (max 10MB)
- Ensure file is PDF or DOCX format
- Try a different file

### "PDF download not working"
- Check if `reportlab` is installed: `pip install reportlab`
- Verify analysis was successful
- Check browser console for errors

### Backend not starting
- Check all dependencies are installed
- Verify Firebase credentials are set up
- Check port 8000 is not in use

### Frontend not connecting to backend
- Verify backend is running on port 8000
- Check CORS configuration in backend `.env`
- Look for network errors in browser console

---

## 💡 Tips for Best Results

### Resume Preparation
1. **Use standard formats**: PDF or DOCX
2. **Clear sections**: Use standard headers (Experience, Education, Skills)
3. **Readable fonts**: Stick to professional fonts
4. **No images**: Use text-based content for better extraction
5. **One page preferred**: Unless you have 10+ years experience

### Analysis Interpretation
1. **Focus on low scores**: These need immediate attention
2. **Implement suggestions**: Follow the action plan
3. **Check ATS score**: Aim for 80+ for better job applications
4. **Update and re-analyze**: Test improvements

### Using Recommendations
1. **Prioritize**: Start with "Priority Actions"
2. **Add metrics**: Include numbers and percentages
3. **Keywords**: Incorporate suggested industry terms
4. **Format**: Follow formatting suggestions

---

## 📊 Sample Analysis Output

```json
{
  "overallScore": 82,
  "atsScore": 85,
  "sections": {
    "formatting": 90,
    "content": 85,
    "keywords": 80,
    "experience": 88,
    "skills": 75,
    "education": 90,
    "contact": 95,
    "summary": 78,
    "achievements": 82
  },
  "strengths": [
    "Strong quantifiable achievements",
    "Clear professional summary",
    "Well-structured experience section"
  ],
  "improvements": [
    "Add more technical skills",
    "Include industry-specific keywords",
    "Expand on project outcomes"
  ],
  "skillAnalysis": {
    "currentSkills": ["Python", "JavaScript", "React"],
    "missingSkills": ["TypeScript", "AWS", "Docker"],
    "skillGaps": ["Cloud computing", "DevOps practices"],
    "skillSuggestions": [
      "Take AWS certification course",
      "Learn Docker and containerization"
    ]
  }
}
```

---

## 🔄 Updates & Maintenance

### Updating OpenAI Model
To use a different model, edit `services/ai.py`:

```python
response = await client.chat.completions.create(
    model="gpt-4",  # Change to "gpt-4-turbo" or "gpt-3.5-turbo"
    messages=[...],
    temperature=0.3,
    max_tokens=4000
)
```

### Customizing Analysis
Modify the prompt in `services/ai.py` to:
- Focus on specific industries
- Add more analysis criteria
- Change rating scale
- Adjust tone and style

### Database Cleanup
To delete old analyses:
```python
# In Firebase Console or using admin SDK
users_col().document(uid).collection("resume_analyses").document(old_id).delete()
```

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Firebase and OpenAI documentation
3. Check browser console for frontend errors
4. Check backend logs for API errors

---

## 🎉 Success!

Your resume analyzer is now fully functional with:
- ✅ OpenAI GPT-4 integration
- ✅ Comprehensive analysis with ratings
- ✅ PDF report generation
- ✅ Firebase data persistence
- ✅ Secure authentication

Start analyzing resumes and help users land their dream jobs! 🚀
