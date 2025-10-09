# 🚀 Quick Start: Resume Analyzer with OpenAI

## Prerequisites
- ✅ OpenAI API Key ([Get one here](https://platform.openai.com/api-keys))
- ✅ Firebase Project with Firestore enabled
- ✅ Python 3.8+ installed
- ✅ Node.js 16+ installed

---

## ⚡ 3-Minute Setup

### Step 1: Backend Setup (2 minutes)

```bash
# 1. Configure environment variables
# Run the setup script (Windows)
setup_env.bat

# Or create .env manually
echo OPENAI_API_KEY=your_key_here > .env
echo CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173 >> .env

# 2. Install dependencies (if not already done)
pip install -r requirements.txt

# 3. Start backend server
python -m uvicorn main:app --reload --port 8000
```

**Backend will be running at:** http://localhost:8000

### Step 2: Frontend Setup (1 minute)

```bash
# Already configured! The frontend code is ready to use.
# Just make sure your Firebase credentials are set up:

cd interviewer

# Create .env if not exists
# Add your Firebase config (see interviewer/.env.example)

# Install dependencies (if not already done)
npm install

# Start frontend
npm run dev
```

**Frontend will be running at:** http://localhost:5173

---

## 🎯 How to Use

1. **Login** to the application
2. **Navigate** to `/resume-analyzer`
3. **Upload** your resume (PDF or DOCX, max 10MB)
4. **Wait** 10-30 seconds for AI analysis
5. **Review** comprehensive analysis with:
   - Overall score (1-100)
   - Section ratings (9 different sections)
   - Strengths and weaknesses
   - Detailed recommendations
   - Industry insights
   - 4-week action plan
6. **Download** PDF report with all findings

---

## 📊 What You Get

### Detailed Analysis Includes:

| Feature | Description |
|---------|-------------|
| **Overall Score** | 0-100 rating of resume quality |
| **Section Ratings** | Formatting, Content, Keywords, Experience, Skills, Education, Contact, Summary, Achievements |
| **ATS Score** | Applicant Tracking System compatibility (0-100) |
| **Strengths** | What's working well in your resume |
| **Improvements** | Specific areas to enhance |
| **Skill Analysis** | Current skills, missing skills, skill gaps, development suggestions |
| **Format Analysis** | Current format, suggested format, format improvements |
| **Industry Insights** | Market trends, salary insights, growth opportunities |
| **Action Plan** | 4-week step-by-step improvement plan |
| **PDF Report** | Professional downloadable report with all findings |

---

## ✅ Verification

### Test Backend
```bash
# Check if backend is running
curl http://localhost:8000/health

# Expected response: {"ok": true}
```

### Test Frontend
1. Open browser: http://localhost:5173
2. Login with your Firebase account
3. Navigate to "Resume Analyzer" page
4. Upload a test resume

---

## 🔍 Architecture

```
┌─────────────────┐
│   Frontend      │ (React + TypeScript)
│   Port 5173     │ - Upload UI
│                 │ - Display results
│                 │ - PDF download
└────────┬────────┘
         │
         │ HTTP + Firebase Auth Token
         │
┌────────▼────────┐
│   Backend API   │ (FastAPI)
│   Port 8000     │ - File processing
│                 │ - Auth verification
└────────┬────────┘
         │
    ┌────┴─────┬─────────────┬──────────────┐
    │          │             │              │
┌───▼───┐  ┌──▼──┐   ┌──────▼──────┐  ┌───▼────┐
│OpenAI │  │PDF  │   │  Firestore  │  │ReportLab│
│GPT-4  │  │Ext. │   │  Storage    │  │PDF Gen │
└───────┘  └─────┘   └─────────────┘  └────────┘
```

---

## 💰 Cost Considerations

### OpenAI API Usage

**GPT-4 Pricing (as of 2024):**
- Input: ~$0.03 per 1K tokens
- Output: ~$0.06 per 1K tokens

**Typical Resume Analysis:**
- Average resume: ~1,500 tokens input
- Analysis response: ~2,000 tokens output
- **Cost per analysis: ~$0.17**

**For 100 analyses/month:** ~$17
**For 1,000 analyses/month:** ~$170

💡 **Tip:** Use GPT-3.5-Turbo for lower costs (~90% cheaper)

To switch models, edit `services/ai.py`:
```python
model="gpt-3.5-turbo"  # Instead of "gpt-4"
```

---

## 🐛 Common Issues & Fixes

### ❌ "OpenAI API key not found"
**Fix:** Make sure `.env` file exists in project root with `OPENAI_API_KEY=your_key`

### ❌ "CORS error"
**Fix:** Add frontend URL to `.env`: `CORS_ORIGINS=http://localhost:5173`

### ❌ "Authentication failed"
**Fix:** Verify Firebase credentials and ensure user is logged in

### ❌ "PDF extraction failed"
**Fix:** Ensure resume is valid PDF/DOCX, try a different file

### ❌ "Module not found"
**Fix:** Run `pip install -r requirements.txt` again

---

## 🎨 Customization

### Change Analysis Depth
Edit `services/ai.py`:
```python
max_tokens=4000  # Increase for more detailed analysis
temperature=0.3  # Lower (0.1) = more focused, Higher (0.7) = more creative
```

### Modify Scoring Criteria
Edit the prompt in `services/ai.py` to focus on:
- Specific industries
- Different skill sets
- Company-specific requirements
- Regional preferences

### Customize PDF Report
Edit `services/pdf_generator.py` to:
- Change colors and styling
- Add company logo
- Modify sections
- Adjust layout

---

## 📈 Performance Tips

1. **Parallel Processing**: Backend handles one analysis at a time per request
2. **Caching**: Store analyses in Firestore to avoid re-analyzing same resume
3. **Rate Limiting**: Implement rate limits to control OpenAI costs
4. **File Size**: Keep resumes under 5MB for faster processing
5. **Model Selection**: Use GPT-3.5-Turbo for faster, cheaper analyses

---

## 🔐 Security Best Practices

1. ✅ **Never commit `.env` file** to version control
2. ✅ **Use environment variables** for all sensitive data
3. ✅ **Firestore rules** ensure users only access their own data
4. ✅ **Firebase Auth** validates all API requests
5. ✅ **HTTPS in production** for secure data transmission

---

## 📚 Additional Resources

- [Full Setup Guide](RESUME_ANALYZER_SETUP.md)
- [Firebase Setup](interviewer/FIREBASE_SETUP.md)
- [OpenAI Documentation](https://platform.openai.com/docs)
- [ReportLab Guide](https://www.reportlab.com/docs/reportlab-userguide.pdf)

---

## ✨ Features Summary

| Feature | Status | Description |
|---------|--------|-------------|
| 📤 Upload Resume | ✅ Complete | PDF & DOCX support, drag & drop |
| 🤖 AI Analysis | ✅ Complete | OpenAI GPT-4 powered |
| 📊 Section Ratings | ✅ Complete | 9 different section scores (0-100) |
| ⭐ Overall Score | ✅ Complete | Weighted average rating |
| 💪 Strengths | ✅ Complete | AI-identified strong points |
| 🎯 Improvements | ✅ Complete | Actionable suggestions |
| 🔧 Skill Analysis | ✅ Complete | Current, missing, and recommended skills |
| 📄 Format Analysis | ✅ Complete | Layout and structure recommendations |
| 📈 Industry Insights | ✅ Complete | Market trends and salary data |
| 📋 Action Plan | ✅ Complete | 4-week improvement roadmap |
| 📥 PDF Download | ✅ Complete | Professional report generation |
| 🔒 User Data Security | ✅ Complete | Firebase authentication & rules |
| 💾 Data Persistence | ✅ Complete | Firestore storage |

---

## 🎉 You're All Set!

Your resume analyzer is now fully functional with:
- ✅ OpenAI GPT-4 integration
- ✅ Comprehensive analysis (1-100 ratings)
- ✅ Professional PDF reports
- ✅ Secure data storage
- ✅ User authentication

**Start analyzing resumes and help users improve their job applications!** 🚀

---

## 📧 Need Help?

Check these resources:
1. [Detailed Setup Guide](RESUME_ANALYZER_SETUP.md)
2. Backend logs: `python -m uvicorn main:app --reload --log-level debug`
3. Frontend console: Open browser DevTools (F12)
4. Firebase Console: https://console.firebase.google.com
5. OpenAI Dashboard: https://platform.openai.com/usage
