import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, TrendingUp, Eye, Download, Star, Target, Lightbulb, Award, BookOpen, Briefcase, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseFileToText, analyzeResume as analyzeLocal, generatePDFReport, getAnalysisDiagnostics, uploadDiagnosticsIfDev } from '@/lib/resumeAnalyzer';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  sections: {
    formatting: number;
    content: number;
    keywords: number;
    experience: number;
    skills: number;
    education: number;
    contact: number;
    summary: number;
    achievements: number;
  };
  atsScore: number;
  recommendations: string[];
  skillAnalysis: {
    currentSkills: string[];
    missingSkills: string[];
    skillGaps: string[];
    skillSuggestions: string[];
  };
  formatAnalysis: {
    currentFormat: string;
    suggestedFormat: string;
    formatIssues: string[];
    formatImprovements: string[];
  };
  industryInsights: {
    industry: string;
    marketTrends: string[];
    salaryInsights: string;
    growthOpportunities: string[];
  };
  detailedReport: {
    executiveSummary: string;
    keyFindings: string[];
    actionPlan: string[];
    priorityActions: string[];
  };
}

const ResumeAnalyzer = () => {
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.name.match(/\.(pdf|docx|doc|txt)$/i))) {
      setUploadedFile(file);
      analyzeResume(file);
    }
  };

  const analyzeResume = async (file: File) => {
    setIsAnalyzing(true);
    
    try {
      const text = await parseFileToText(file);
      const res = analyzeLocal(text);
      // Transform minimal fields into existing UI structure
      const transformed: AnalysisResult = {
        overallScore: res.score,
        strengths: res.strengths,
        improvements: res.weaknesses,
        sections: {
          formatting: Math.min(100, (Object.keys(res.matchedRules).length > 0 ? 70 : 40)),
          content: Math.min(100, res.recommendations.length > 0 ? 65 : 80),
          keywords: Math.min(100, (res.matchedRules.skills?.sectionMatched || 0) * 4),
          experience: 50,
          skills: 50,
          education: 40,
          contact: 60,
          summary: 50,
          achievements: Math.min(100, (res.matchedRules.achievements?.sectionMatched || 0) * 8),
        },
        atsScore: Math.min(100, res.score + 10),
        recommendations: res.recommendations,
        skillAnalysis: {
          currentSkills: (res.matchedRules.skills?.matchedKeywords || []).map(s => s.split('x')[0]).slice(0, 12),
          missingSkills: [],
          skillGaps: [],
          skillSuggestions: res.recommendations.slice(0, 5),
        },
        formatAnalysis: {
          currentFormat: 'Standard resume format',
          suggestedFormat: 'Chronological with quantified bullets',
          formatIssues: [],
          formatImprovements: ['Use consistent headers', 'Add bullet-point achievements with metrics'],
        },
        industryInsights: {
          industry: 'Software Engineering',
          marketTrends: ['Full-stack demand', 'Cloud-native architectures'],
          salaryInsights: 'Competitive market; quantify impact to stand out.',
          growthOpportunities: ['Backend optimization', 'Kubernetes', 'Observability'],
        },
        detailedReport: {
          executiveSummary: `Score ${res.score}/100. ${res.strengths[0] || ''}`.trim(),
          keyFindings: [...res.strengths.slice(0, 3), ...res.weaknesses.slice(0, 2)],
          actionPlan: res.recommendations.slice(0, 5),
          priorityActions: res.recommendations.slice(0, 3),
        },
      };
      setAnalysis(transformed);
      setAnalysisId(null);
      await uploadDiagnosticsIfDev({ filename: file.name });
      toast({
        title: "Success!",
        description: "Resume analysis completed successfully!",
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || 'Failed to analyze resume. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const dragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const dragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const dragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const fileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.docx')) {
        setUploadedFile(file);
        analyzeResume(file);
      }
    }
  };

  const downloadReport = async () => {
    if (!analysis) return;

    try {
      const pdfBytes = await generatePDFReport({
        score: analysis.overallScore,
        strengths: analysis.strengths,
        weaknesses: analysis.improvements,
        recommendations: analysis.recommendations,
        matchedRules: {},
      }, { name: 'Unknown' });
      const ab = (pdfBytes.buffer as ArrayBuffer).slice(0);
      const blob = new Blob([ab], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "Report downloaded successfully!",
      });
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error.message || 'Failed to download report. Please try again.',
        variant: "destructive",
      });
    }
  };

  const generateReportContent = (analysis: AnalysisResult) => {
    return `
RESUME ANALYSIS REPORT
Generated on: ${new Date().toLocaleDateString()}
===============================================

EXECUTIVE SUMMARY
${analysis.detailedReport.executiveSummary}

OVERALL SCORE: ${analysis.overallScore}/100
ATS COMPATIBILITY: ${analysis.atsScore}/100

SECTION BREAKDOWN
================
Formatting: ${analysis.sections.formatting}%
Content: ${analysis.sections.content}%
Keywords: ${analysis.sections.keywords}%
Experience: ${analysis.sections.experience}%
Skills: ${analysis.sections.skills}%
Education: ${analysis.sections.education}%
Contact: ${analysis.sections.contact}%
Summary: ${analysis.sections.summary}%
Achievements: ${analysis.sections.achievements}%

STRENGTHS
=========
${analysis.strengths.map((strength, index) => `${index + 1}. ${strength}`).join('\n')}

AREAS FOR IMPROVEMENT
====================
${analysis.improvements.map((improvement, index) => `${index + 1}. ${improvement}`).join('\n')}

SKILL ANALYSIS
==============
Current Skills:
${analysis.skillAnalysis.currentSkills.join(', ')}

Missing Skills:
${analysis.skillAnalysis.missingSkills.join(', ')}

Skill Gaps:
${analysis.skillAnalysis.skillGaps.join(', ')}

Skill Suggestions:
${analysis.skillAnalysis.skillSuggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`).join('\n')}

FORMAT ANALYSIS
===============
Current Format: ${analysis.formatAnalysis.currentFormat}
Suggested Format: ${analysis.formatAnalysis.suggestedFormat}

Format Issues:
${analysis.formatAnalysis.formatIssues.map((issue, index) => `${index + 1}. ${issue}`).join('\n')}

Format Improvements:
${analysis.formatAnalysis.formatImprovements.map((improvement, index) => `${index + 1}. ${improvement}`).join('\n')}

INDUSTRY INSIGHTS
================
Industry: ${analysis.industryInsights.industry}
Salary Insights: ${analysis.industryInsights.salaryInsights}

Market Trends:
${analysis.industryInsights.marketTrends.map((trend, index) => `${index + 1}. ${trend}`).join('\n')}

Growth Opportunities:
${analysis.industryInsights.growthOpportunities.map((opportunity, index) => `${index + 1}. ${opportunity}`).join('\n')}

DETAILED RECOMMENDATIONS
========================
${analysis.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

KEY FINDINGS
============
${analysis.detailedReport.keyFindings.map((finding, index) => `${index + 1}. ${finding}`).join('\n')}

ACTION PLAN
===========
${analysis.detailedReport.actionPlan.map((action, index) => `${index + 1}. ${action}`).join('\n')}

PRIORITY ACTIONS
================
${analysis.detailedReport.priorityActions.map((action, index) => `${index + 1}. ${action}`).join('\n')}

===============================================
Report generated by AI Virtual Interviewer
For more career guidance, visit our platform
===============================================
    `;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gradient">Resume Analyzer</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get instant feedback on your resume with AI-powered analysis. Improve your chances of getting noticed by employers.
        </p>
      </div>

      {!uploadedFile ? (
        <div className="ai-card p-8 max-w-2xl mx-auto">
          <div
            className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
            onDragOver={dragOver}
            onDragEnter={dragEnter}
            onDragLeave={dragLeave}
            onDrop={fileDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Your Resume</h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop your resume here, or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PDF and DOCX files up to 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* File Info */}
          <div className="ai-card p-6 max-w-2xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{uploadedFile.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {isAnalyzing && (
                <div className="flex items-center space-x-2 text-primary">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Analyzing...</span>
                </div>
              )}
            </div>
          </div>

          {analysis && !isAnalyzing && (
            <>
              {/* Overall Score */}
              <div className="text-center">
                <div className="ai-card p-8 max-w-md mx-auto">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        stroke="hsl(var(--muted))"
                        strokeWidth="12"
                        fill="transparent"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        stroke="hsl(var(--primary))"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 54}`}
                        strokeDashoffset={`${2 * Math.PI * 54 * (1 - analysis.overallScore / 100)}`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{analysis.overallScore}</div>
                        <div className="text-sm text-muted-foreground">Overall</div>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold">Resume Score</h2>
                  <p className="text-muted-foreground">Your resume is performing well!</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Section Scores */}
                <div className="ai-card p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                    Section Breakdown
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(analysis.sections).map(([section, score]) => (
                      <div key={section} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">{section}</span>
                          <span className="text-sm font-bold">{score}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-accent rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Eye className="h-4 w-4 text-primary" />
                      <span className="font-medium">ATS Compatibility</span>
                      <span className="font-bold">{analysis.atsScore}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your resume is well-optimized for Applicant Tracking Systems
                    </p>
                  </div>
                </div>

                {/* Strengths & Improvements */}
                <div className="space-y-6">
                  <div className="ai-card p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center text-success">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="ai-card p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center text-warning">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Areas for Improvement
                    </h3>
                    <ul className="space-y-2">
                      {analysis.improvements.map((improvement: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="ai-card p-6">
                <h3 className="text-lg font-semibold mb-4">Detailed Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="p-4 bg-accent rounded-lg">
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Analysis */}
              <div className="ai-card p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-primary" />
                  Skill Analysis & Recommendations
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 text-success">Current Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skillAnalysis.currentSkills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3 text-warning">Missing Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skillAnalysis.missingSkills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Skill Development Suggestions</h4>
                  <ul className="space-y-2">
                    {analysis.skillAnalysis.skillSuggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Format Analysis */}
              <div className="ai-card p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Format Analysis & Suggestions
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Current Format</h4>
                    <p className="text-sm text-muted-foreground mb-4">{analysis.formatAnalysis.currentFormat}</p>
                    <h4 className="font-medium mb-3 text-success">Suggested Format</h4>
                    <p className="text-sm text-muted-foreground">{analysis.formatAnalysis.suggestedFormat}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Format Improvements</h4>
                    <ul className="space-y-2">
                      {analysis.formatAnalysis.formatImprovements.map((improvement, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Industry Insights */}
              <div className="ai-card p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Industry Insights & Career Guidance
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Market Trends</h4>
                    <ul className="space-y-2">
                      {analysis.industryInsights.marketTrends.map((trend, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Star className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{trend}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Growth Opportunities</h4>
                    <ul className="space-y-2">
                      {analysis.industryInsights.growthOpportunities.map((opportunity, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Award className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{opportunity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-accent rounded-lg">
                  <h4 className="font-medium mb-2">Salary Insights</h4>
                  <p className="text-sm text-muted-foreground">{analysis.industryInsights.salaryInsights}</p>
                </div>
              </div>

              {/* Detailed Report */}
              <div className="ai-card p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Executive Summary & Action Plan
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Executive Summary</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analysis.detailedReport.executiveSummary}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Key Findings</h4>
                      <ul className="space-y-2">
                        {analysis.detailedReport.keyFindings.map((finding, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Priority Actions</h4>
                      <ul className="space-y-2">
                        {analysis.detailedReport.priorityActions.map((action, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">4-Week Action Plan</h4>
                    <div className="space-y-3">
                      {analysis.detailedReport.actionPlan.map((action, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-accent rounded-lg">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <span className="text-sm">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadedFile(null);
                    setAnalysis(null);
                    setAnalysisId(null);
                  }}
                >
                  Analyze Another Resume
                </Button>
                <Button 
                  className="btn-gradient"
                  onClick={downloadReport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Detailed Report
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;