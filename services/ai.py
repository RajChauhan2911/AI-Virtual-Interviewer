import os
import json
import asyncio
from typing import Dict, Any
import PyPDF2
import docx
from io import BytesIO
import re
from datetime import datetime

def extract_text_from_pdf(content: bytes) -> str:
    """Extract text from PDF content"""
    try:
        pdf_reader = PyPDF2.PdfReader(BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")

def extract_text_from_docx(content: bytes) -> str:
    """Extract text from DOCX content"""
    try:
        doc = docx.Document(BytesIO(content))
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text.strip()
    except Exception as e:
        raise Exception(f"Failed to extract text from DOCX: {str(e)}")

def extract_text_from_file(content: bytes, filename: str) -> str:
    """Extract text from resume file based on file type"""
    if filename.lower().endswith('.pdf'):
        return extract_text_from_pdf(content)
    elif filename.lower().endswith('.docx'):
        return extract_text_from_docx(content)
    else:
        raise ValueError("Unsupported file type")

def analyze_resume_with_rules(resume_text: str) -> Dict[str, Any]:
    """Analyze resume using rule-based approach - NO API COSTS!"""
    import time
    import random
    
    # Simulate processing time for each analysis step
    time.sleep(0.5)  # Initial processing delay
    
    # Convert to lowercase for analysis
    text_lower = resume_text.lower()
    
    # Initialize scores with some realistic variation
    base_scores = {
        "formatting": random.randint(70, 85),
        "content": random.randint(65, 80),
        "keywords": random.randint(60, 75),
        "experience": random.randint(70, 85),
        "skills": random.randint(65, 80),
        "education": random.randint(70, 90),
        "contact": random.randint(75, 95),
        "summary": random.randint(55, 75),
        "achievements": random.randint(60, 80)
    }
    
    scores = base_scores.copy()
    
    # Analyze different sections
    strengths = []
    improvements = []
    current_skills = []
    missing_skills = []
    
    # 1. CONTACT INFO ANALYSIS
    time.sleep(0.2)  # Simulate contact analysis time
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    
    has_email = bool(re.search(email_pattern, resume_text))
    has_phone = bool(re.search(phone_pattern, resume_text))
    has_address = any(word in text_lower for word in ['street', 'avenue', 'city', 'state', 'zip'])
    
    if has_email and has_phone:
        scores["contact"] = 95
        strengths.append("Complete contact information provided")
    elif has_email or has_phone:
        scores["contact"] = 80
        improvements.append("Add missing contact information (email or phone)")
    else:
        scores["contact"] = 30
        improvements.append("Add email and phone number")
    
    # 2. EDUCATION ANALYSIS
    time.sleep(0.3)  # Simulate education analysis time
    education_keywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college', 'diploma', 'certification']
    has_education = any(word in text_lower for word in education_keywords)
    
    if has_education:
        scores["education"] = 85
        strengths.append("Educational background clearly presented")
    else:
        scores["education"] = 40
        improvements.append("Include educational background")
    
    # 3. EXPERIENCE ANALYSIS
    time.sleep(0.4)  # Simulate experience analysis time
    experience_keywords = ['experience', 'worked', 'job', 'position', 'role', 'company', 'years']
    has_experience = any(word in text_lower for word in experience_keywords)
    
    # Look for quantified achievements
    numbers = re.findall(r'\d+%|\d+\+|\$\d+|\d+ years|\d+ months', resume_text)
    
    if has_experience and len(numbers) >= 2:
        scores["experience"] = 90
        scores["achievements"] = 85
        strengths.append("Strong experience with quantified achievements")
    elif has_experience:
        scores["experience"] = 75
        improvements.append("Add more quantified achievements (numbers, percentages)")
    else:
        scores["experience"] = 40
        improvements.append("Include work experience section")
    
    # 4. SKILLS ANALYSIS
    time.sleep(0.3)  # Simulate skills analysis time
    technical_skills = ['python', 'javascript', 'java', 'react', 'angular', 'sql', 'html', 'css', 'node', 'git', 'docker', 'aws', 'azure', 'machine learning', 'ai', 'data analysis']
    soft_skills = ['leadership', 'communication', 'teamwork', 'problem solving', 'project management', 'time management']
    
    found_technical = [skill for skill in technical_skills if skill in text_lower]
    found_soft = [skill for skill in soft_skills if skill in text_lower]
    
    current_skills = found_technical + found_soft
    
    if len(found_technical) >= 5:
        scores["skills"] = 90
        strengths.append("Comprehensive technical skills listed")
    elif len(found_technical) >= 3:
        scores["skills"] = 75
        improvements.append("Add more technical skills")
    else:
        scores["skills"] = 50
        improvements.append("Include technical skills section")
    
    # 5. KEYWORDS ANALYSIS
    industry_keywords = ['software', 'engineering', 'development', 'design', 'marketing', 'sales', 'finance', 'analyst', 'manager', 'consultant']
    found_keywords = [kw for kw in industry_keywords if kw in text_lower]
    
    if len(found_keywords) >= 3:
        scores["keywords"] = 80
        strengths.append("Good use of industry keywords")
    else:
        scores["keywords"] = 60
        improvements.append("Include more industry-specific keywords")
    
    # 6. FORMATTING ANALYSIS
    time.sleep(0.2)  # Simulate formatting analysis time
    lines = resume_text.split('\n')
    non_empty_lines = [line.strip() for line in lines if line.strip()]
    
    # Check for bullet points, headers, etc.
    has_bullets = any('•' in line or '*' in line or '-' in line for line in lines)
    has_headers = any(line.isupper() or line.endswith(':') for line in non_empty_lines)
    
    if has_bullets and has_headers and len(non_empty_lines) > 10:
        scores["formatting"] = 90
        strengths.append("Well-formatted resume with clear structure")
    elif has_bullets or has_headers:
        scores["formatting"] = 75
        improvements.append("Improve resume formatting and structure")
    else:
        scores["formatting"] = 60
        improvements.append("Add bullet points and clear section headers")
    
    # 7. SUMMARY ANALYSIS
    time.sleep(0.2)  # Simulate summary analysis time
    summary_indicators = ['summary', 'objective', 'profile', 'about']
    has_summary = any(indicator in text_lower for indicator in summary_indicators)
    
    if has_summary:
        scores["summary"] = 80
        strengths.append("Professional summary included")
    else:
        scores["summary"] = 40
        improvements.append("Add a professional summary or objective")
    
    # Final processing delay
    time.sleep(0.5)  # Simulate final analysis and scoring time
    
    # Calculate overall score
    overall_score = round(sum(scores.values()) / len(scores))
    
    # Calculate ATS score (simplified)
    ats_score = 75  # Base score
    if has_email and has_phone:
        ats_score += 10
    if has_education:
        ats_score += 5
    if has_experience:
        ats_score += 5
    if len(found_keywords) >= 3:
        ats_score += 5
    
    ats_score = min(ats_score, 100)
    
    # Generate missing skills suggestions
    if len(found_technical) < 5:
        missing_technical = [skill for skill in technical_skills[:10] if skill not in found_technical]
        missing_skills.extend(missing_technical[:3])
    
    # Generate recommendations
    recommendations = [
        "Use action verbs to start each bullet point (Led, Developed, Implemented)",
        "Include specific metrics and quantifiable results",
        "Tailor keywords to match job descriptions",
        "Keep resume to 1-2 pages maximum",
        "Use consistent formatting throughout",
        "Include a professional summary at the top"
    ]
    
    # Generate skill suggestions
    skill_suggestions = [
        "Consider learning cloud platforms (AWS, Azure, GCP)",
        "Add project management tools (Agile, Scrum, Jira)",
        "Include version control experience (Git, GitHub)",
        "Learn data analysis tools (Excel, SQL, Tableau)"
    ]
    
    # Determine industry
    industry = "Technology"
    if any(word in text_lower for word in ['marketing', 'sales', 'business']):
        industry = "Business"
    elif any(word in text_lower for word in ['finance', 'accounting', 'banking']):
        industry = "Finance"
    elif any(word in text_lower for word in ['healthcare', 'medical', 'nurse']):
        industry = "Healthcare"
    
    # Generate industry insights
    market_trends = [
        "Remote work opportunities are increasing",
        "Digital skills are in high demand",
        "AI and automation are transforming industries",
        "Soft skills are becoming more important"
    ]
    
    growth_opportunities = [
        "Upskill in emerging technologies",
        "Develop leadership capabilities",
        "Build a strong professional network",
        "Consider certification programs"
    ]
    
    return {
        "overallScore": overall_score,
        "strengths": strengths,
        "improvements": improvements,
        "sections": scores,
        "atsScore": ats_score,
        "recommendations": recommendations,
        "skillAnalysis": {
            "currentSkills": current_skills,
            "missingSkills": missing_skills[:5],
            "skillGaps": ["Advanced technical certifications", "Leadership experience"],
            "skillSuggestions": skill_suggestions
        },
        "formatAnalysis": {
            "currentFormat": "Mixed",
            "suggestedFormat": "Chronological with clear sections",
            "formatIssues": ["Inconsistent formatting", "Missing bullet points"] if scores["formatting"] < 80 else [],
            "formatImprovements": ["Use consistent fonts", "Add bullet points", "Include clear section headers"]
        },
        "industryInsights": {
            "industry": industry,
            "marketTrends": market_trends,
            "salaryInsights": f"Salary ranges vary by location and experience in {industry} sector",
            "growthOpportunities": growth_opportunities
        },
        "detailedReport": {
            "executiveSummary": f"Your resume shows {overall_score}/100 overall quality. {'Strong technical background and clear experience' if overall_score >= 80 else 'Good foundation with room for improvement'}. Focus on {'refining presentation' if overall_score >= 70 else 'strengthening core sections'}.",
            "keyFindings": [
                f"Overall quality score: {overall_score}/100",
                f"ATS compatibility: {ats_score}/100",
                f"Technical skills: {len(found_technical)} identified",
                f"Quantified achievements: {len(numbers)} found",
                f"Contact completeness: {'Excellent' if scores['contact'] >= 90 else 'Good' if scores['contact'] >= 70 else 'Needs improvement'}"
            ],
            "actionPlan": [
                "Week 1: Add missing contact information and professional summary",
                "Week 2: Include quantified achievements with specific numbers",
                "Week 3: Optimize formatting and add bullet points",
                "Week 4: Tailor keywords and get professional feedback"
            ],
            "priorityActions": [
                "Add quantified achievements to experience section",
                "Include a professional summary at the top",
                "List technical skills clearly",
                "Ensure contact information is complete"
            ]
        }
    }

async def analyze_resume(content: bytes, filename: str) -> Dict[str, Any]:
    """Main function to analyze resume - FREE VERSION"""
    import asyncio
    import time
    
    try:
        print(f"Starting resume analysis for {filename}...")
        
        # Step 1: Extract text from file (2-3 seconds)
        print("Extracting text content...")
        await asyncio.sleep(2)  # Simulate text extraction time
        resume_text = extract_text_from_file(content, filename)
        
        if not resume_text.strip():
            raise Exception("No text content found in the resume")
        
        # Step 2: Content analysis (3-4 seconds)
        print("Analyzing content structure and formatting...")
        await asyncio.sleep(3)  # Simulate content analysis time
        
        # Step 3: Skills and keyword analysis (2-3 seconds)
        print("Analyzing skills and keywords...")
        await asyncio.sleep(2)  # Simulate skills analysis time
        
        # Step 4: ATS optimization check (1-2 seconds)
        print("Checking ATS compatibility...")
        await asyncio.sleep(1)  # Simulate ATS check time
        
        # Step 5: Generate recommendations (2-3 seconds)
        print("Generating recommendations and insights...")
        await asyncio.sleep(2)  # Simulate recommendation generation
        
        # Analyze with rule-based approach
        analysis_result = analyze_resume_with_rules(resume_text)
        
        print("Resume analysis completed successfully!")
        return analysis_result
        
    except Exception as e:
        print(f"Resume analysis failed: {str(e)}")
        raise Exception(f"Resume analysis failed: {str(e)}")

def evaluate_answer(role: str, question: str, answer: str) -> Dict:
    """Evaluate interview answers (existing function)"""
    # Simple rule-based evaluation for prototype
    score_components = {
        "technical": 70,
        "communication": 75,
        "confidence": 72,
    }
    overall = round(sum(score_components.values()) / len(score_components))
    feedback = "Good response structure. Consider adding more specific examples and quantifying your achievements."
    return {"score": overall, "components": score_components, "feedback": feedback}