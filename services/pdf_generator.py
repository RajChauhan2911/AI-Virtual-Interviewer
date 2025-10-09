import os
import tempfile
from datetime import datetime
from typing import Dict, Any
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import io

def create_circular_progress(canvas, x, y, radius, score, max_score=100):
    """Draw a circular progress indicator"""
    # Background circle
    canvas.setStrokeColor(colors.lightgrey)
    canvas.setLineWidth(3)
    canvas.circle(x, y, radius)
    
    # Progress arc
    if score > 0:
        canvas.setStrokeColor(colors.HexColor('#3B82F6'))
        canvas.setLineWidth(3)
        # Calculate angle for progress
        angle = (score / max_score) * 360
        canvas.arc(x - radius, y - radius, x + radius, y + radius, 0, angle)
    
    # Score text
    canvas.setFillColor(colors.black)
    canvas.setFont("Helvetica-Bold", 16)
    canvas.drawCentredText(x, y - 5, f"{score}")
    canvas.setFont("Helvetica", 10)
    canvas.drawCentredText(x, y + 15, "Score")

def generate_resume_analysis_pdf(analysis_data: Dict[str, Any], filename: str) -> str:
    """Generate a comprehensive PDF report for resume analysis"""
    
    # Create temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    temp_path = temp_file.name
    temp_file.close()
    
    # Create PDF document
    doc = SimpleDocTemplate(temp_path, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Create custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#1F2937')
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        spaceAfter=12,
        spaceBefore=20,
        textColor=colors.HexColor('#374151')
    )
    
    subheading_style = ParagraphStyle(
        'CustomSubHeading',
        parent=styles['Heading3'],
        fontSize=14,
        spaceAfter=8,
        spaceBefore=12,
        textColor=colors.HexColor('#4B5563')
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=6,
        alignment=TA_JUSTIFY
    )
    
    # Build content
    story = []
    
    # Title
    story.append(Paragraph("Resume Analysis Report", title_style))
    story.append(Spacer(1, 12))
    
    # Report info
    report_info = f"""
    <b>Generated:</b> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}<br/>
    <b>Resume File:</b> {filename}<br/>
    <b>Overall Score:</b> {analysis_data.get('overallScore', 0)}/100
    """
    story.append(Paragraph(report_info, body_style))
    story.append(Spacer(1, 20))
    
    # Executive Summary
    story.append(Paragraph("Executive Summary", heading_style))
    story.append(Paragraph(analysis_data.get('detailedReport', {}).get('executiveSummary', 'No summary available.'), body_style))
    story.append(Spacer(1, 20))
    
    # Overall Score Section
    story.append(Paragraph("Overall Assessment", heading_style))
    
    # Create score table
    score_data = [
        ['Metric', 'Score', 'Status'],
        ['Overall Score', f"{analysis_data.get('overallScore', 0)}/100", get_score_status(analysis_data.get('overallScore', 0))],
        ['ATS Compatibility', f"{analysis_data.get('atsScore', 0)}/100", get_score_status(analysis_data.get('atsScore', 0))]
    ]
    
    score_table = Table(score_data, colWidths=[2*inch, 1*inch, 1.5*inch])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F3F4F6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(score_table)
    story.append(Spacer(1, 20))
    
    # Section Breakdown
    story.append(Paragraph("Section Breakdown", heading_style))
    
    sections = analysis_data.get('sections', {})
    section_data = [['Section', 'Score', 'Status']]
    for section, score in sections.items():
        section_data.append([section.title(), f"{score}/100", get_score_status(score)])
    
    section_table = Table(section_data, colWidths=[2*inch, 1*inch, 1.5*inch])
    section_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F3F4F6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(section_table)
    story.append(Spacer(1, 20))
    
    # Strengths
    story.append(Paragraph("Strengths", heading_style))
    strengths = analysis_data.get('strengths', [])
    if strengths:
        for i, strength in enumerate(strengths, 1):
            story.append(Paragraph(f"• {strength}", body_style))
    else:
        story.append(Paragraph("No specific strengths identified.", body_style))
    story.append(Spacer(1, 20))
    
    # Areas for Improvement
    story.append(Paragraph("Areas for Improvement", heading_style))
    improvements = analysis_data.get('improvements', [])
    if improvements:
        for i, improvement in enumerate(improvements, 1):
            story.append(Paragraph(f"• {improvement}", body_style))
    else:
        story.append(Paragraph("No specific improvements identified.", body_style))
    story.append(Spacer(1, 20))
    
    # Skill Analysis
    story.append(Paragraph("Skill Analysis", heading_style))
    skill_analysis = analysis_data.get('skillAnalysis', {})
    
    story.append(Paragraph("Current Skills", subheading_style))
    current_skills = skill_analysis.get('currentSkills', [])
    if current_skills:
        skills_text = ", ".join(current_skills)
        story.append(Paragraph(skills_text, body_style))
    else:
        story.append(Paragraph("No skills identified.", body_style))
    
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("Recommended Skills", subheading_style))
    missing_skills = skill_analysis.get('missingSkills', [])
    if missing_skills:
        for skill in missing_skills:
            story.append(Paragraph(f"• {skill}", body_style))
    else:
        story.append(Paragraph("No additional skills recommended.", body_style))
    
    story.append(Spacer(1, 20))
    
    # Format Analysis
    story.append(Paragraph("Format Analysis", heading_style))
    format_analysis = analysis_data.get('formatAnalysis', {})
    
    format_info = f"""
    <b>Current Format:</b> {format_analysis.get('currentFormat', 'Not specified')}<br/>
    <b>Recommended Format:</b> {format_analysis.get('suggestedFormat', 'Not specified')}
    """
    story.append(Paragraph(format_info, body_style))
    
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("Format Improvements", subheading_style))
    format_improvements = format_analysis.get('formatImprovements', [])
    if format_improvements:
        for improvement in format_improvements:
            story.append(Paragraph(f"• {improvement}", body_style))
    else:
        story.append(Paragraph("No format improvements suggested.", body_style))
    
    story.append(Spacer(1, 20))
    
    # Industry Insights
    story.append(Paragraph("Industry Insights", heading_style))
    industry_insights = analysis_data.get('industryInsights', {})
    
    industry_info = f"""
    <b>Industry:</b> {industry_insights.get('industry', 'Not specified')}<br/>
    <b>Salary Insights:</b> {industry_insights.get('salaryInsights', 'Not available')}
    """
    story.append(Paragraph(industry_info, body_style))
    
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("Market Trends", subheading_style))
    market_trends = industry_insights.get('marketTrends', [])
    if market_trends:
        for trend in market_trends:
            story.append(Paragraph(f"• {trend}", body_style))
    else:
        story.append(Paragraph("No market trends available.", body_style))
    
    story.append(Spacer(1, 20))
    
    # Recommendations
    story.append(Paragraph("Detailed Recommendations", heading_style))
    recommendations = analysis_data.get('recommendations', [])
    if recommendations:
        for i, rec in enumerate(recommendations, 1):
            story.append(Paragraph(f"{i}. {rec}", body_style))
    else:
        story.append(Paragraph("No specific recommendations available.", body_style))
    
    story.append(Spacer(1, 20))
    
    # Action Plan
    story.append(Paragraph("4-Week Action Plan", heading_style))
    action_plan = analysis_data.get('detailedReport', {}).get('actionPlan', [])
    if action_plan:
        for i, action in enumerate(action_plan, 1):
            story.append(Paragraph(f"<b>Week {i}:</b> {action}", body_style))
    else:
        story.append(Paragraph("No action plan available.", body_style))
    
    story.append(Spacer(1, 20))
    
    # Priority Actions
    story.append(Paragraph("Priority Actions", heading_style))
    priority_actions = analysis_data.get('detailedReport', {}).get('priorityActions', [])
    if priority_actions:
        for i, action in enumerate(priority_actions, 1):
            story.append(Paragraph(f"{i}. {action}", body_style))
    else:
        story.append(Paragraph("No priority actions identified.", body_style))
    
    story.append(Spacer(1, 30))
    
    # Footer
    footer_text = f"""
    <i>Report generated by AI Virtual Interviewer on {datetime.now().strftime('%B %d, %Y')}<br/>
    For more career guidance and interview preparation, visit our platform.</i>
    """
    story.append(Paragraph(footer_text, body_style))
    
    # Build PDF
    doc.build(story)
    
    return temp_path

def get_score_status(score: int) -> str:
    """Get status text based on score"""
    if score >= 90:
        return "Excellent"
    elif score >= 80:
        return "Good"
    elif score >= 70:
        return "Fair"
    elif score >= 60:
        return "Needs Improvement"
    else:
        return "Poor"
