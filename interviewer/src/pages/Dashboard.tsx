import { Calendar, Clock, FileText, Target, TrendingUp, Award, Users, CheckCircle, BarChart3, PieChart, Activity, Zap, Brain, BookOpen, Star, Trophy, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Real data from Firebase - starts empty
  const [dashboardData, setDashboardData] = useState({
    overallScore: 0,
    totalAttempts: 0,
    sections: {
      aptitude: {
        score: 0,
        attempts: 0,
        history: [],
        strengths: [],
        improvements: []
      },
      interviews: {
        score: 0,
        attempts: 0,
        history: [],
        strengths: [],
        improvements: []
      },
      resume: {
        score: 0,
        attempts: 0,
        history: [],
        strengths: [],
        improvements: []
      }
    },
    recentActivity: [],
    achievements: []
  });

  // Fetch real user data from Firebase
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        const userId = user.uid;
        
        // Fetch Resume Analyses
        const resumeRef = collection(db, 'users', userId, 'resume_analyses');
        const resumeQuery = query(resumeRef, orderBy('timestamp', 'desc'), limit(10));
        const resumeSnapshot = await getDocs(resumeQuery);
        
        const resumeHistory = resumeSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            filename: data.filename || 'Resume.pdf',
            score: data.overallScore || 0,
            date: data.timestamp?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
            sections: 9,
            timestamp: data.timestamp?.toDate() || new Date()
          };
        });

        // Calculate resume stats
        const resumeScores = resumeHistory.map(r => r.score);
        const resumeAvg = resumeScores.length > 0 
          ? Math.round(resumeScores.reduce((a, b) => a + b, 0) / resumeScores.length) 
          : 0;

        // Fetch Interview Results (if you have them stored)
        // For now, using empty data
        const interviewHistory = [];
        
        // Fetch Aptitude Test Results from Firebase
        const aptitudeRef = collection(db, 'users', userId, 'aptitude_tests');
        const aptitudeQuery = query(aptitudeRef, orderBy('timestamp', 'desc'), limit(10));
        const aptitudeSnapshot = await getDocs(aptitudeQuery);
        
        const aptitudeHistory = aptitudeSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            testName: data.testName || 'Unknown Test',
            score: data.score || 0,
            date: data.timestamp?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
            difficulty: data.difficulty || 'Easy',
            status: data.status || 'Completed',
            timestamp: data.timestamp?.toDate() || new Date()
          };
        });

        // Build recent activity from all sources
        const allActivity = [
          ...resumeHistory.map(r => ({
            type: 'Resume',
            title: `Resume Analysis - ${r.filename}`,
            score: r.score,
            date: r.date,
            time: r.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            timestamp: r.timestamp
          })),
          ...aptitudeHistory.map(a => ({
            type: 'Aptitude',
            title: a.testName,
            score: a.score,
            date: a.date,
            time: a.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            timestamp: a.timestamp,
            difficulty: a.difficulty,
            status: a.status
          })),
          // Add interview activities when available
        ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

        // Calculate overall stats
        const totalAttempts = resumeHistory.length + interviewHistory.length + aptitudeHistory.length;
        const aptitudeScores = aptitudeHistory.map(a => a.score);
        const allScores = [...resumeScores, ...aptitudeScores];
        const overallScore = allScores.length > 0
          ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
          : 0;

        // Calculate achievements based on real data
        const achievements = [];
        if (resumeScores.filter(s => s >= 80).length >= 3) {
          achievements.push({
            title: "Resume Expert",
            description: `${resumeScores.filter(s => s >= 80).length} resumes above 80%`,
            icon: Star,
            color: "text-blue-500"
          });
        }
        if (resumeHistory.length >= 5) {
          achievements.push({
            title: "Consistent Improver",
            description: `${resumeHistory.length} resume analyses completed`,
            icon: TrendingUp,
            color: "text-green-500"
          });
        }
        if (Math.max(...resumeScores, 0) >= 85) {
          achievements.push({
            title: "High Achiever",
            description: `Best score: ${Math.max(...resumeScores, 0)}%`,
            icon: Trophy,
            color: "text-yellow-500"
          });
        }

        // Aptitude test achievements
        if (aptitudeHistory.length >= 1) {
          const highAptitudeCount = aptitudeHistory.filter(a => a.score >= 80).length;
          if (highAptitudeCount >= 1) {
            achievements.push({
              title: "Test Champion",
              description: "Achieved 80%+ in aptitude tests",
              icon: Brain,
              color: "text-purple-500"
            });
          }
          
          if (aptitudeHistory.length >= 5) {
            achievements.push({
              title: "Dedicated Learner",
              description: "Completed 5+ aptitude tests",
              icon: Star,
              color: "text-orange-500"
            });
          }
        }

        // Overall achievements
        if (totalAttempts >= 10) {
          achievements.push({
            title: "Consistent Performer",
            description: "Completed 10+ assessments",
            icon: Award,
            color: "text-green-500"
          });
        }

        // Update state with real data
        setDashboardData({
          overallScore,
          totalAttempts,
          sections: {
            aptitude: {
              score: aptitudeScores.length > 0 ? Math.round(aptitudeScores.reduce((a, b) => a + b, 0) / aptitudeScores.length) : 0,
              attempts: aptitudeHistory.length,
              history: aptitudeHistory,
              strengths: aptitudeScores.length > 0 && Math.round(aptitudeScores.reduce((a, b) => a + b, 0) / aptitudeScores.length) >= 70 ? ["Strong problem-solving", "Quick learning"] : [],
              improvements: aptitudeScores.length > 0 && Math.round(aptitudeScores.reduce((a, b) => a + b, 0) / aptitudeScores.length) < 70 ? ["Time management", "Advanced concepts"] : []
            },
            interviews: {
              score: 0,
              attempts: interviewHistory.length,
              history: interviewHistory,
              strengths: [],
              improvements: []
            },
            resume: {
              score: resumeAvg,
              attempts: resumeHistory.length,
              history: resumeHistory.slice(0, 5),
              strengths: resumeAvg >= 80 ? ["Strong formatting", "Good structure"] : [],
              improvements: resumeAvg < 80 ? ["Improve content", "Add more details"] : []
            }
          },
          recentActivity: allActivity,
          achievements
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: "Start New Interview",
      description: "Practice with AI-powered interview simulation",
      icon: Target,
      color: "bg-primary",
      action: "Start Interview",
      path: "/interview"
    },
    {
      title: "Upload Resume",
      description: "Get instant feedback on your resume",
      icon: FileText,
      color: "bg-success",
      action: "Analyze Resume",
      path: "/resume-analyzer"
    },
    {
      title: "Take Aptitude Test",
      description: "Assess your technical skills",
      icon: Users,
      color: "bg-warning",
      action: "Start Test",
      path: "/aptitude-test"
    },
    {
      title: "View Results",
      description: "Track your interview progress",
      icon: TrendingUp,
      color: "bg-destructive",
      action: "View Results",
      path: "/results"
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gradient">Performance Dashboard</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Track your progress across all sections with detailed analytics and insights
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="ai-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.overallScore}%</div>
            <Progress value={dashboardData.overallScore} className="mt-3" />
            <p className="text-xs text-muted-foreground mt-2">Across all sections</p>
          </CardContent>
        </Card>

        <Card className="ai-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Total Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.totalAttempts}</div>
            <div className="flex items-center mt-3 text-sm text-green-500">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span>+12 this month</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">All activities combined</p>
          </CardContent>
        </Card>

        <Card className="ai-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Best Section
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Resume</div>
            <div className="flex items-center mt-3">
              <Badge className={getScoreBadgeColor(dashboardData.sections.resume.score)}>
                {dashboardData.sections.resume.score}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Highest performing area</p>
          </CardContent>
        </Card>

        <Card className="ai-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Improvement Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">+8%</div>
            <div className="flex items-center mt-3 text-sm text-green-500">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span>Last 7 days</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Average improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Section-wise Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aptitude Section */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-500" />
                Aptitude Tests
              </span>
              <Badge className={getScoreBadgeColor(dashboardData.sections.aptitude.score)}>
                {dashboardData.sections.aptitude.score}%
              </Badge>
            </CardTitle>
            <CardDescription>Technical assessments and problem-solving</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Average Score</span>
                <span className={`font-bold ${getScoreColor(dashboardData.sections.aptitude.score)}`}>
                  {dashboardData.sections.aptitude.score}%
                </span>
              </div>
              <Progress value={dashboardData.sections.aptitude.score} />
            </div>

            <div className="flex justify-between items-center py-2 border-t">
              <span className="text-sm text-muted-foreground">Total Attempts</span>
              <span className="font-bold">{dashboardData.sections.aptitude.attempts}</span>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Recent Tests</p>
              {dashboardData.sections.aptitude.history.length > 0 ? (
                dashboardData.sections.aptitude.history.slice(0, 3).map((test, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-accent rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{test.test}</p>
                      <p className="text-xs text-muted-foreground">{test.date}</p>
                    </div>
                    <Badge className={getScoreBadgeColor(test.score)}>{test.score}%</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-accent rounded-lg">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No tests taken yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Start your first aptitude test!</p>
                </div>
              )}
            </div>

            {dashboardData.sections.aptitude.strengths.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-sm font-medium text-green-600">Strengths</p>
                <div className="flex flex-wrap gap-1">
                  {dashboardData.sections.aptitude.strengths.map((strength, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">{strength}</Badge>
                  ))}
                </div>
              </div>
            )}

            {dashboardData.sections.aptitude.improvements.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-orange-600">Areas to Improve</p>
                <div className="flex flex-wrap gap-1">
                  {dashboardData.sections.aptitude.improvements.map((improvement, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">{improvement}</Badge>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={() => navigate('/aptitude-test')} 
              className="w-full mt-4"
              variant="outline"
            >
              Take New Test
            </Button>
          </CardContent>
        </Card>

        {/* Interviews Section */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-500" />
                Interviews
              </span>
              <Badge className={getScoreBadgeColor(dashboardData.sections.interviews.score)}>
                {dashboardData.sections.interviews.score}%
              </Badge>
            </CardTitle>
            <CardDescription>Mock interviews and practice sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Average Score</span>
                <span className={`font-bold ${getScoreColor(dashboardData.sections.interviews.score)}`}>
                  {dashboardData.sections.interviews.score}%
                </span>
              </div>
              <Progress value={dashboardData.sections.interviews.score} />
            </div>

            <div className="flex justify-between items-center py-2 border-t">
              <span className="text-sm text-muted-foreground">Total Attempts</span>
              <span className="font-bold">{dashboardData.sections.interviews.attempts}</span>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Recent Interviews</p>
              {dashboardData.sections.interviews.history.length > 0 ? (
                dashboardData.sections.interviews.history.slice(0, 3).map((interview, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-accent rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{interview.company}</p>
                      <p className="text-xs text-muted-foreground">{interview.role} • {interview.date}</p>
                    </div>
                    <Badge className={getScoreBadgeColor(interview.score)}>{interview.score}%</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-accent rounded-lg">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No interviews yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Start your first mock interview!</p>
                </div>
              )}
            </div>

            {dashboardData.sections.interviews.strengths.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-sm font-medium text-green-600">Strengths</p>
                <div className="flex flex-wrap gap-1">
                  {dashboardData.sections.interviews.strengths.map((strength, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">{strength}</Badge>
                  ))}
                </div>
              </div>
            )}

            {dashboardData.sections.interviews.improvements.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-orange-600">Areas to Improve</p>
                <div className="flex flex-wrap gap-1">
                  {dashboardData.sections.interviews.improvements.map((improvement, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">{improvement}</Badge>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={() => navigate('/interview')} 
              className="w-full mt-4"
              variant="outline"
            >
              Start Interview
            </Button>
          </CardContent>
        </Card>

        {/* Resume Section */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-500" />
                Resume Analysis
              </span>
              <Badge className={getScoreBadgeColor(dashboardData.sections.resume.score)}>
                {dashboardData.sections.resume.score}%
              </Badge>
            </CardTitle>
            <CardDescription>Resume reviews and improvements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Average Score</span>
                <span className={`font-bold ${getScoreColor(dashboardData.sections.resume.score)}`}>
                  {dashboardData.sections.resume.score}%
                </span>
              </div>
              <Progress value={dashboardData.sections.resume.score} />
            </div>

            <div className="flex justify-between items-center py-2 border-t">
              <span className="text-sm text-muted-foreground">Total Attempts</span>
              <span className="font-bold">{dashboardData.sections.resume.attempts}</span>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Recent Analyses</p>
              {dashboardData.sections.resume.history.length > 0 ? (
                dashboardData.sections.resume.history.slice(0, 3).map((resume, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-accent rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{resume.filename}</p>
                      <p className="text-xs text-muted-foreground">{resume.date} • {resume.sections} sections</p>
                    </div>
                    <Badge className={getScoreBadgeColor(resume.score)}>{resume.score}%</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-accent rounded-lg">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No resume analyses yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Upload your first resume!</p>
                </div>
              )}
            </div>

            {dashboardData.sections.resume.strengths.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-sm font-medium text-green-600">Strengths</p>
                <div className="flex flex-wrap gap-1">
                  {dashboardData.sections.resume.strengths.map((strength, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">{strength}</Badge>
                  ))}
                </div>
              </div>
            )}

            {dashboardData.sections.resume.improvements.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-orange-600">Areas to Improve</p>
                <div className="flex flex-wrap gap-1">
                  {dashboardData.sections.resume.improvements.map((improvement, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">{improvement}</Badge>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={() => navigate('/resume-analyzer')} 
              className="w-full mt-4"
              variant="outline"
            >
              Analyze Resume
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="ai-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest attempts across all sections</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-accent rounded-lg hover:bg-accent/80 transition-colors">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'Interview' ? 'bg-blue-100' :
                        activity.type === 'Resume' ? 'bg-green-100' :
                        'bg-purple-100'
                      }`}>
                        {activity.type === 'Interview' && <Target className="h-5 w-5 text-blue-500" />}
                        {activity.type === 'Resume' && <FileText className="h-5 w-5 text-green-500" />}
                        {activity.type === 'Aptitude' && <Brain className="h-5 w-5 text-purple-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.date} • {activity.time}</p>
                      </div>
                    </div>
                    <Badge className={getScoreBadgeColor(activity.score)}>
                      {activity.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium">No activity yet</p>
                <p className="text-xs text-muted-foreground mt-1">Start by taking a test, interview, or analyzing your resume</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              Achievements
            </CardTitle>
            <CardDescription>Your milestones and badges</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.achievements.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.achievements.map((achievement, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 bg-accent rounded-lg">
                    <div className={`w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0`}>
                      <achievement.icon className={`h-5 w-5 ${achievement.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
          </div>
        ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium">No achievements yet</p>
                <p className="text-xs text-muted-foreground mt-1">Complete activities to earn badges!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

        {/* Quick Actions */}
      <Card className="ai-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>Jump into your next activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <div 
                key={index} 
                onClick={() => navigate(action.path)}
                className="ai-card-gradient p-4 hover:scale-105 transition-transform cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                <Button variant="outline" size="sm" className="w-full">
                  {action.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
