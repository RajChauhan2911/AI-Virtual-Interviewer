import { useState } from 'react';
import { Download, Calendar, Clock, Award, TrendingUp, Target, FileText, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Results = () => {
  const [activeTab, setActiveTab] = useState("all");

  const statsCards = [
    { label: "Overall Average", value: "82%", icon: Award, color: "bg-primary" },
    { label: "Resume Score", value: "92%", icon: FileText, color: "bg-success" },
    { label: "Total Sessions", value: "24", icon: Target, color: "bg-warning" },
    { label: "This Month", value: "8", icon: TrendingUp, color: "bg-destructive" }
  ];

  const allResults = [
    {
      id: 1,
      type: "Interview",
      title: "Frontend Developer Mock Interview",
      date: "2024-01-10",
      time: "45 min",
      score: 85,
      maxScore: 100,
      feedback: "Strong technical skills, good communication. Work on system design questions."
    },
    {
      id: 2,
      type: "Resume",
      title: "Software Engineer Resume Analysis",
      date: "2024-01-09", 
      time: "2 min",
      score: 92,
      maxScore: 100,
      feedback: "Excellent structure and keywords. Consider adding more quantifiable achievements."
    },
    {
      id: 3,
      type: "Aptitude",
      title: "JavaScript Technical Assessment",
      date: "2024-01-08",
      time: "30 min",
      score: 78,
      maxScore: 100,
      feedback: "Good understanding of fundamentals. Focus on async/await and error handling."
    },
    {
      id: 4,
      type: "Interview",
      title: "Product Manager Mock Interview",
      date: "2024-01-05",
      time: "50 min",
      score: 88,
      maxScore: 100,
      feedback: "Great product thinking and user empathy. Practice market sizing questions."
    },
    {
      id: 5,
      type: "Aptitude",
      title: "React.js Skills Assessment",
      date: "2024-01-03",
      time: "25 min",
      score: 91,
      maxScore: 100,
      feedback: "Excellent React knowledge. Strong understanding of hooks and state management."
    },
    {
      id: 6,
      type: "Resume",
      title: "Data Scientist Resume Review",
      date: "2024-01-01",
      time: "3 min",
      score: 76,
      maxScore: 100,
      feedback: "Good technical skills listed. Add more specific project outcomes and metrics."
    }
  ];

  const getFilteredResults = () => {
    if (activeTab === "all") return allResults;
    return allResults.filter(result => result.type.toLowerCase() === activeTab);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Interview': return 'bg-primary text-primary-foreground';
      case 'Resume': return 'bg-success text-success-foreground';
      case 'Aptitude': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Interview': return Target;
      case 'Resume': return FileText;
      case 'Aptitude': return Brain;
      default: return Award;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Performance Analytics</h1>
          <p className="text-muted-foreground">Track your progress and identify areas for improvement</p>
        </div>
        <Button className="btn-gradient">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="stats-card">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full ${stat.color}/10 mx-auto mb-4`}>
              <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
            <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Results Tabs */}
      <div className="ai-card p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">All Tests</TabsTrigger>
            <TabsTrigger value="aptitude">Aptitude</TabsTrigger>
            <TabsTrigger value="interview">Interview</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {getFilteredResults().length === 0 ? (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No results found for this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredResults().map((result) => {
                  const IconComponent = getTypeIcon(result.type);
                  return (
                    <div key={result.id} className="ai-card-gradient p-6 hover:scale-105 transition-transform cursor-pointer">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(result.type)}`}>
                          {result.type}
                        </span>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          {result.date}
                        </div>
                      </div>
                      
                      <div className="flex items-start mb-4">
                        <IconComponent className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <h3 className="font-semibold leading-tight">{result.title}</h3>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {result.time}
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold">{result.score}</span>
                          <span className="text-sm text-muted-foreground">/{result.maxScore}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-muted rounded-full h-2 mb-4">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(result.score / result.maxScore) * 100}%` }}
                        />
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {result.feedback}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Results;