import { useState, useEffect } from 'react';
import { Play, Clock, Brain, CheckCircle, Target, Award, Building2, Code, Zap, Filter, Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { auth, db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const AptitudeTest = () => {
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentTestResults, setRecentTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Company-Specific Tests
  const companyTests = [
    {
      id: "google-easy",
      company: "Google",
      title: "Google Coding Assessment",
      description: "Test your problem-solving skills with Google-style questions",
      duration: "45 minutes",
      questions: 20,
      difficulty: "Easy",
      topics: ["Arrays", "Strings", "Basic Algorithms", "Problem Solving"],
      logo: "🔍"
    },
    {
      id: "google-medium",
      company: "Google",
      title: "Google Technical Interview Prep",
      description: "Advanced algorithms and data structures used at Google",
      duration: "60 minutes",
      questions: 25,
      difficulty: "Medium",
      topics: ["Trees", "Graphs", "Dynamic Programming", "System Design Basics"],
      logo: "🔍"
    },
    {
      id: "google-hard",
      company: "Google",
      title: "Google Senior Engineer Assessment",
      description: "Complex problem-solving for senior positions",
      duration: "90 minutes",
      questions: 15,
      difficulty: "Hard",
      topics: ["Advanced Algorithms", "Optimization", "Distributed Systems", "Scalability"],
      logo: "🔍"
    },
    {
      id: "microsoft-easy",
      company: "Microsoft",
      title: "Microsoft Entry Level Test",
      description: "Fundamental programming concepts for Microsoft roles",
      duration: "40 minutes",
      questions: 20,
      difficulty: "Easy",
      topics: ["C# Basics", "OOP Concepts", "Arrays", "Loops"],
      logo: "🪟"
    },
    {
      id: "microsoft-medium",
      company: "Microsoft",
      title: "Microsoft SDE Assessment",
      description: "Software development skills for Microsoft positions",
      duration: "60 minutes",
      questions: 25,
      difficulty: "Medium",
      topics: ["Data Structures", ".NET Framework", "SQL", "Design Patterns"],
      logo: "🪟"
    },
    {
      id: "microsoft-hard",
      company: "Microsoft",
      title: "Microsoft Senior SDE Challenge",
      description: "Advanced technical assessment for senior roles",
      duration: "90 minutes",
      questions: 18,
      difficulty: "Hard",
      topics: ["Cloud Architecture", "Azure", "Microservices", "Performance Optimization"],
      logo: "🪟"
    },
    {
      id: "amazon-easy",
      company: "Amazon",
      title: "Amazon Junior Developer Test",
      description: "Amazon's leadership principles and basic coding",
      duration: "45 minutes",
      questions: 22,
      difficulty: "Easy",
      topics: ["Java Basics", "Arrays", "Strings", "Basic Data Structures"],
      logo: "📦"
    },
    {
      id: "amazon-medium",
      company: "Amazon",
      title: "Amazon SDE Assessment",
      description: "Technical skills for Amazon software development roles",
      duration: "60 minutes",
      questions: 25,
      difficulty: "Medium",
      topics: ["Algorithms", "System Design", "AWS Basics", "Object-Oriented Design"],
      logo: "📦"
    },
    {
      id: "amazon-hard",
      company: "Amazon",
      title: "Amazon Principal Engineer Test",
      description: "Complex system design and architecture",
      duration: "120 minutes",
      questions: 20,
      difficulty: "Hard",
      topics: ["Distributed Systems", "AWS Advanced", "High Availability", "Scalability"],
      logo: "📦"
    },
    {
      id: "meta-easy",
      company: "Meta",
      title: "Meta Frontend Basics",
      description: "React and frontend fundamentals for Meta",
      duration: "40 minutes",
      questions: 20,
      difficulty: "Easy",
      topics: ["React Basics", "JavaScript ES6", "HTML/CSS", "Component Design"],
      logo: "📘"
    },
    {
      id: "meta-medium",
      company: "Meta",
      title: "Meta Full Stack Assessment",
      description: "Full-stack development skills for Meta positions",
      duration: "60 minutes",
      questions: 28,
      difficulty: "Medium",
      topics: ["React Advanced", "GraphQL", "Node.js", "Database Design"],
      logo: "📘"
    },
    {
      id: "meta-hard",
      company: "Meta",
      title: "Meta Staff Engineer Challenge",
      description: "Advanced system design and architecture at scale",
      duration: "90 minutes",
      questions: 15,
      difficulty: "Hard",
      topics: ["Large Scale Systems", "Performance", "React Internals", "Infrastructure"],
      logo: "📘"
    },
    {
      id: "tcs-easy",
      company: "TCS",
      title: "TCS Digital Entry Test",
      description: "Basic programming and aptitude for TCS Digital",
      duration: "60 minutes",
      questions: 30,
      difficulty: "Easy",
      topics: ["C/C++ Basics", "Logical Reasoning", "Quantitative Aptitude", "Verbal"],
      logo: "🏢"
    },
    {
      id: "tcs-medium",
      company: "TCS",
      title: "TCS Ninja Assessment",
      description: "Technical skills for TCS Ninja roles",
      duration: "75 minutes",
      questions: 35,
      difficulty: "Medium",
      topics: ["Java", "SQL", "Aptitude", "Coding Problems"],
      logo: "🏢"
    },
    {
      id: "tcs-hard",
      company: "TCS",
      title: "TCS CodeVita Challenge",
      description: "Advanced competitive programming for TCS",
      duration: "120 minutes",
      questions: 8,
      difficulty: "Hard",
      topics: ["Advanced Algorithms", "Competitive Programming", "Optimization", "Math"],
      logo: "🏢"
    },
    {
      id: "infosys-easy",
      company: "Infosys",
      title: "Infosys Entry Level Test",
      description: "Basic programming and reasoning for Infosys",
      duration: "65 minutes",
      questions: 30,
      difficulty: "Easy",
      topics: ["Programming Basics", "Logical Reasoning", "Verbal Ability", "Puzzles"],
      logo: "🔷"
    },
    {
      id: "infosys-medium",
      company: "Infosys",
      title: "Infosys Specialist Programmer",
      description: "Technical assessment for specialist roles",
      duration: "90 minutes",
      questions: 25,
      difficulty: "Medium",
      topics: ["Java/Python", "Database", "Web Technologies", "Problem Solving"],
      logo: "🔷"
    },
    {
      id: "wipro-easy",
      company: "Wipro",
      title: "Wipro NLTH Assessment",
      description: "National Level Talent Hunt for fresh graduates",
      duration: "60 minutes",
      questions: 30,
      difficulty: "Easy",
      topics: ["Programming", "Aptitude", "English", "Basic Coding"],
      logo: "💼"
    },
    {
      id: "wipro-medium",
      company: "Wipro",
      title: "Wipro Elite Assessment",
      description: "Technical skills for Wipro Elite program",
      duration: "90 minutes",
      questions: 28,
      difficulty: "Medium",
      topics: ["Java", "Data Structures", "Algorithms", "System Design"],
      logo: "💼"
    }
  ];

  // Language/Skill-Based Tests
  const skillTests = [
    {
      id: "javascript-easy",
      skill: "JavaScript",
      title: "JavaScript Fundamentals",
      description: "Core JavaScript concepts and ES6+ features",
      duration: "30 minutes",
      questions: 25,
      difficulty: "Easy",
      topics: ["Variables", "Functions", "Arrays", "Objects", "ES6 Basics"],
      icon: "🟨"
    },
    {
      id: "javascript-medium",
      skill: "JavaScript",
      title: "JavaScript Advanced Concepts",
      description: "Closures, promises, async/await, and more",
      duration: "45 minutes",
      questions: 30,
      difficulty: "Medium",
      topics: ["Closures", "Promises", "Async/Await", "Prototypes", "Event Loop"],
      icon: "🟨"
    },
    {
      id: "javascript-hard",
      skill: "JavaScript",
      title: "JavaScript Expert Level",
      description: "Advanced patterns and performance optimization",
      duration: "60 minutes",
      questions: 20,
      difficulty: "Hard",
      topics: ["Design Patterns", "Memory Management", "Performance", "Advanced ES6+"],
      icon: "🟨"
    },
    {
      id: "python-easy",
      skill: "Python",
      title: "Python Basics",
      description: "Python fundamentals and basic syntax",
      duration: "30 minutes",
      questions: 25,
      difficulty: "Easy",
      topics: ["Data Types", "Loops", "Functions", "Lists", "Dictionaries"],
      icon: "🐍"
    },
    {
      id: "python-medium",
      skill: "Python",
      title: "Python Intermediate",
      description: "OOP, decorators, and file handling in Python",
      duration: "45 minutes",
      questions: 28,
      difficulty: "Medium",
      topics: ["OOP", "Decorators", "Generators", "File I/O", "Exception Handling"],
      icon: "🐍"
    },
    {
      id: "python-hard",
      skill: "Python",
      title: "Python Advanced",
      description: "Advanced Python concepts and optimization",
      duration: "60 minutes",
      questions: 22,
      difficulty: "Hard",
      topics: ["Metaclasses", "Async Python", "Performance", "Advanced OOP", "Design Patterns"],
      icon: "🐍"
    },
    {
      id: "java-easy",
      skill: "Java",
      title: "Java Fundamentals",
      description: "Core Java concepts and basic OOP",
      duration: "35 minutes", 
      questions: 25,
      difficulty: "Easy",
      topics: ["Data Types", "Classes", "Inheritance", "Basic Collections", "Exception Handling"],
      icon: "☕"
    },
    {
      id: "java-medium",
      skill: "Java",
      title: "Java Intermediate",
      description: "Advanced OOP and Java frameworks",
      duration: "50 minutes",
      questions: 30,
      difficulty: "Medium",
      topics: ["Collections", "Streams", "Multithreading", "JDBC", "Spring Basics"],
      icon: "☕"
    },
    {
      id: "java-hard",
      skill: "Java",
      title: "Java Expert",
      description: "Advanced Java and enterprise patterns",
      duration: "75 minutes",
      questions: 25,
      difficulty: "Hard",
      topics: ["JVM Internals", "Concurrency", "Spring Boot", "Microservices", "Performance"],
      icon: "☕"
    },
    {
      id: "react-easy",
      skill: "React",
      title: "React Basics",
      description: "React fundamentals and component basics",
      duration: "30 minutes",
      questions: 20,
      difficulty: "Easy",
      topics: ["JSX", "Components", "Props", "State", "Event Handling"],
      icon: "⚛️"
    },
    {
      id: "react-medium",
      skill: "React",
      title: "React Intermediate",
      description: "Hooks, context, and state management",
      duration: "45 minutes",
      questions: 28,
      difficulty: "Medium",
      topics: ["Hooks", "Context API", "useEffect", "Custom Hooks", "Performance"],
      icon: "⚛️"
    },
    {
      id: "react-hard",
      skill: "React",
      title: "React Advanced",
      description: "Advanced patterns and optimization",
      duration: "60 minutes",
      questions: 22,
      difficulty: "Hard",
      topics: ["Advanced Hooks", "Performance Optimization", "SSR", "React Internals", "Architecture"],
      icon: "⚛️"
    },
    {
      id: "sql-easy",
      skill: "SQL",
      title: "SQL Basics",
      description: "Fundamental SQL queries and operations",
      duration: "30 minutes",
      questions: 25,
      difficulty: "Easy",
      topics: ["SELECT", "WHERE", "JOIN", "INSERT", "UPDATE"],
      icon: "🗄️"
    },
    {
      id: "sql-medium",
      skill: "SQL",
      title: "SQL Intermediate",
      description: "Complex queries and database design",
      duration: "45 minutes",
      questions: 30,
      difficulty: "Medium",
      topics: ["Subqueries", "Aggregations", "Indexes", "Normalization", "Transactions"],
      icon: "🗄️"
    },
    {
      id: "sql-hard",
      skill: "SQL",
      title: "SQL Advanced",
      description: "Query optimization and advanced concepts",
      duration: "60 minutes",
      questions: 20,
      difficulty: "Hard",
      topics: ["Query Optimization", "Stored Procedures", "Triggers", "Performance Tuning", "Advanced Joins"],
      icon: "🗄️"
    },
    {
      id: "dsa-easy",
      skill: "DSA",
      title: "Data Structures Basics",
      description: "Fundamental data structures",
      duration: "40 minutes",
      questions: 20,
      difficulty: "Easy",
      topics: ["Arrays", "Linked Lists", "Stacks", "Queues", "Basic Sorting"],
      icon: "🌳"
    },
    {
      id: "dsa-medium",
      skill: "DSA",
      title: "Algorithms Intermediate",
      description: "Common algorithms and problem-solving",
      duration: "60 minutes",
      questions: 25,
      difficulty: "Medium",
      topics: ["Trees", "Graphs", "Binary Search", "Recursion", "Dynamic Programming Basics"],
      icon: "🌳"
    },
    {
      id: "dsa-hard",
      skill: "DSA",
      title: "Advanced Algorithms",
      description: "Complex algorithms and optimization",
      duration: "90 minutes",
      questions: 15,
      difficulty: "Hard",
      topics: ["Advanced DP", "Graph Algorithms", "Greedy", "Backtracking", "Advanced Trees"],
      icon: "🌳"
    }
  ];

  // Comprehensive Question Bank
  const questionBank = {
    // JavaScript Questions
    "javascript-easy": [
    {
      id: 1,
      question: "What will be the output of the following JavaScript code?",
      code: "console.log(typeof null);",
      options: ["null", "undefined", "object", "boolean"],
      correct: 2
    },
    {
      id: 2,
        question: "Which keyword is used to declare a variable in JavaScript?",
        options: ["var", "let", "const", "All of the above"],
        correct: 3
      },
      {
        id: 3,
        question: "What is the result of 5 + '5' in JavaScript?",
        options: ["10", "55", "Error", "undefined"],
        correct: 1
      },
      {
        id: 4,
        question: "Which method is used to add an element to the end of an array?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        correct: 0
      },
      {
        id: 5,
        question: "What does === operator do in JavaScript?",
        options: ["Assignment", "Comparison with type conversion", "Strict equality comparison", "Logical AND"],
        correct: 2
      }
    ],
    "javascript-medium": [
      {
        id: 1,
        question: "What is a closure in JavaScript?",
        options: [
          "A function that returns another function",
          "A function that has access to variables in its outer scope",
          "A method to close browser windows",
          "A way to prevent memory leaks"
        ],
        correct: 1
      },
      {
        id: 2,
        question: "What is the output of this code?",
        code: "console.log([1,2,3].map(x => x * 2));",
        options: ["[1,2,3]", "[2,4,6]", "[1,4,9]", "Error"],
        correct: 1
      },
      {
        id: 3,
        question: "What does the 'this' keyword refer to in JavaScript?",
        options: ["The current function", "The global object", "The object that owns the method", "Always undefined"],
        correct: 2
      },
      {
        id: 4,
        question: "What is the purpose of the 'use strict' directive?",
        options: [
          "To enable strict mode for better error checking",
          "To disable all JavaScript features",
          "To make code run faster",
          "To prevent variable declarations"
        ],
        correct: 0
      },
      {
        id: 5,
        question: "What is the difference between let and var?",
      options: [
          "No difference",
          "let has block scope, var has function scope",
          "var is newer than let",
          "let can't be reassigned"
        ],
        correct: 1
      }
    ],
    "google-easy": [
      {
        id: 1,
        question: "What is the time complexity of accessing an element in an array?",
        options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
      correct: 2
    },
      {
        id: 2,
        question: "Which data structure follows LIFO (Last In, First Out) principle?",
        options: ["Queue", "Stack", "Array", "Linked List"],
        correct: 1
    },
    {
      id: 3,
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correct: 1
      },
      {
        id: 4,
        question: "Which sorting algorithm has the best average-case time complexity?",
        options: ["Bubble Sort", "Insertion Sort", "Quick Sort", "Selection Sort"],
        correct: 2
      },
      {
        id: 5,
        question: "What is the maximum number of edges in a complete graph with n vertices?",
        options: ["n", "n-1", "n(n-1)/2", "n²"],
        correct: 2
      }
    ],
    "python-easy": [
      {
        id: 1,
        question: "Which of the following is correct for creating a list in Python?",
        options: ["list = []", "list = list()", "list = [1,2,3]", "All of the above"],
        correct: 3
      },
      {
        id: 2,
        question: "What is the output of print(3 * 'hello')?",
        options: ["hello", "hellohello", "hellohellohello", "Error"],
        correct: 2
      },
      {
        id: 3,
        question: "Which keyword is used to define a function in Python?",
        options: ["function", "def", "define", "func"],
        correct: 1
      },
      {
        id: 4,
        question: "What does the len() function do?",
        options: ["Returns the length of a string/list", "Returns the largest number", "Returns the smallest number", "Creates a new list"],
        correct: 0
      },
      {
        id: 5,
        question: "Which operator is used for exponentiation in Python?",
        options: ["^", "**", "pow()", "exp()"],
        correct: 1
      }
    ],
    "react-easy": [
      {
        id: 1,
        question: "What is JSX?",
        options: [
          "JavaScript XML",
          "A JavaScript library",
          "A CSS framework",
          "A database"
        ],
        correct: 0
      },
      {
        id: 2,
        question: "Which method is called when a component is first mounted?",
        options: ["componentDidMount", "componentWillMount", "componentDidUpdate", "render"],
        correct: 0
      },
      {
        id: 3,
        question: "What is the purpose of props in React?",
        options: [
          "To store component state",
          "To pass data from parent to child components",
          "To handle events",
          "To manage routing"
        ],
        correct: 1
      },
      {
        id: 4,
        question: "What is a functional component in React?",
        options: [
          "A component that uses class syntax",
          "A component defined as a function",
          "A component that only renders once",
          "A component with no state"
        ],
        correct: 1
      },
      {
        id: 5,
        question: "Which hook is used to manage state in functional components?",
        options: ["useState", "useEffect", "useContext", "useReducer"],
        correct: 0
      }
    ]
  };

  // Get questions for the selected test
  const getQuestionsForTest = (testId: string) => {
    // Map test IDs to question sets
    const questionMap: { [key: string]: string } = {
      "google-easy": "google-easy",
      "google-medium": "google-easy", // Reuse for now
      "google-hard": "google-easy",
      "javascript-easy": "javascript-easy",
      "javascript-medium": "javascript-medium",
      "javascript-hard": "javascript-medium",
      "python-easy": "python-easy",
      "python-medium": "python-easy",
      "python-hard": "python-easy",
      "react-easy": "react-easy",
      "react-medium": "react-easy",
      "react-hard": "react-easy",
      // Add more mappings as needed
    };
    
    const questionSet = questionMap[testId] || "javascript-easy";
    return questionBank[questionSet as keyof typeof questionBank] || questionBank["javascript-easy"];
  };

  // Get current questions based on selected test
  const currentQuestions = selectedTest ? getQuestionsForTest(selectedTest) : [];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTest = (testId: string) => {
    setSelectedTest(testId);
    setIsTestStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
  };

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Test completed - calculate score and save to Firebase
      finishTest();
    }
  };

  const finishTest = async () => {
    try {
      // Calculate score
      let correctAnswers = 0;
      currentQuestions.forEach((question, index) => {
        if (selectedAnswers[index] === question.correct) {
          correctAnswers++;
        }
      });
      
      const score = Math.round((correctAnswers / currentQuestions.length) * 100);
      
      // Get test details
      const allTests = [...companyTests, ...skillTests];
      const testDetails = allTests.find(test => test.id === selectedTest);
      
      // Save to Firebase
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const testResult = {
          testName: testDetails?.title || 'Unknown Test',
          company: testDetails?.company || testDetails?.category || 'General',
          score: score,
          difficulty: testDetails?.difficulty || 'Easy',
          questionsAnswered: currentQuestions.length,
          correctAnswers: correctAnswers,
          timestamp: new Date(),
          testId: selectedTest,
          status: score >= 70 ? (score >= 80 ? 'Excellent' : 'Passed') : 'Failed'
        };

        // Import Firebase functions
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        
        const testRef = doc(db, 'users', userId, 'aptitude_tests', `${selectedTest}_${Date.now()}`);
        await setDoc(testRef, {
          ...testResult,
          timestamp: serverTimestamp()
        });

        // Show completion message
        alert(`Test Completed! Score: ${score}% (${correctAnswers}/${currentQuestions.length} correct)`);
      }
      
      // Reset test state
      setIsTestStarted(false);
      setSelectedTest(null);
      setCurrentQuestion(0);
      setSelectedAnswers([]);
      
      // Refresh test results
      window.location.reload(); // Simple way to refresh the recent results
      
    } catch (error) {
      console.error('Error saving test result:', error);
      alert('Test completed but there was an error saving the result.');
      
      // Reset test state anyway
      setIsTestStarted(false);
      setSelectedTest(null);
      setCurrentQuestion(0);
      setSelectedAnswers([]);
    }
  };

  // Fetch real test results from Firebase
  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        const userId = user.uid;
        
        // Fetch Aptitude Test Results from Firebase
        const testRef = collection(db, 'users', userId, 'aptitude_tests');
        const testQuery = query(testRef, orderBy('timestamp', 'desc'), limit(10));
        const testSnapshot = await getDocs(testQuery);
        
        const testResults = testSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            testName: data.testName || 'Unknown Test',
            score: data.score || 0,
            difficulty: data.difficulty || 'Easy',
            date: data.timestamp?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
            status: data.status || (data.score >= 70 ? 'Passed' : data.score >= 80 ? 'Excellent' : 'Failed'),
            timestamp: data.timestamp?.toDate() || new Date()
          };
        });
        
        setRecentTestResults(testResults);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching test results:', error);
        setLoading(false);
      }
    };

    fetchTestResults();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filterTests = (tests: any[]) => {
    let filtered = tests;
    
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(test => test.difficulty === selectedDifficulty);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(test => 
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (test.company && test.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (test.skill && test.skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  };

  if (isTestStarted && selectedTest) {
    const current = currentQuestions[currentQuestion];
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Test Header */}
        <div className="ai-card p-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Aptitude Test in Progress</h1>
            <p className="text-muted-foreground">
              Question {currentQuestion + 1} of {currentQuestions.length}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-mono text-lg font-semibold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="ai-card p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">{current.question}</h2>
              {current.code && (
                <div className="bg-muted p-4 rounded-lg font-mono text-sm mb-4">
                  <code>{current.code}</code>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {current.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  className={`w-full p-4 text-left rounded-lg border transition-colors ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 bg-background'
                  }`}
                >
                  <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Progress: {Math.round(((currentQuestion + 1) / currentQuestions.length) * 100)}%
              </div>
              <Button
                onClick={nextQuestion}
                disabled={selectedAnswers[currentQuestion] === undefined}
                className="btn-gradient"
              >
                {currentQuestion === currentQuestions.length - 1 ? 'Finish Test' : 'Next Question'}
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / currentQuestions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gradient">Aptitude Tests</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose from company-specific tests or skill-based assessments. All tests available in Easy, Medium, and Hard difficulty levels.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tests by company, skill, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedDifficulty('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={selectedDifficulty === 'Easy' ? 'default' : 'outline'}
            onClick={() => setSelectedDifficulty('Easy')}
            size="sm"
            className="text-green-600"
          >
            Easy
          </Button>
          <Button
            variant={selectedDifficulty === 'Medium' ? 'default' : 'outline'}
            onClick={() => setSelectedDifficulty('Medium')}
            size="sm"
            className="text-yellow-600"
          >
            Medium
          </Button>
          <Button
            variant={selectedDifficulty === 'Hard' ? 'default' : 'outline'}
            onClick={() => setSelectedDifficulty('Hard')}
            size="sm"
            className="text-red-600"
          >
            Hard
          </Button>
        </div>
      </div>

      {/* Tabs for Company vs Skill Tests */}
      <Tabs defaultValue="companies" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Company Tests
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Skill Tests
          </TabsTrigger>
        </TabsList>

        {/* Company Tests */}
        <TabsContent value="companies" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterTests(companyTests).map((test) => (
          <Card key={test.id} className="ai-card p-6 hover:scale-105 transition-transform cursor-pointer">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{test.logo}</span>
                        <Badge variant="outline" className="text-xs">
                          {test.company}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold">{test.title}</h3>
                      <Badge className={`${getDifficultyColor(test.difficulty)} border`}>
                    {test.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {test.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{test.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span>{test.questions} Qs</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Topics:</h4>
                    <div className="flex flex-wrap gap-1">
                      {test.topics.slice(0, 3).map((topic, index) => (
                        <span key={index} className="px-2 py-1 bg-accent text-xs rounded">
                          {topic}
                        </span>
                      ))}
                      {test.topics.length > 3 && (
                        <span className="px-2 py-1 bg-accent text-xs rounded">
                          +{test.topics.length - 3}
                  </span>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => startTest(test.id)}
                    className="w-full btn-gradient"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Test
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          {filterTests(companyTests).length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tests found matching your criteria</p>
            </div>
          )}
        </TabsContent>

        {/* Skill Tests */}
        <TabsContent value="skills" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterTests(skillTests).map((test) => (
              <Card key={test.id} className="ai-card p-6 hover:scale-105 transition-transform cursor-pointer">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{test.icon}</span>
                        <Badge variant="outline" className="text-xs">
                          {test.skill}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold">{test.title}</h3>
                      <Badge className={`${getDifficultyColor(test.difficulty)} border`}>
                        {test.difficulty}
                      </Badge>
                    </div>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed">
                {test.description}
              </p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{test.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                      <span>{test.questions} Qs</span>
                </div>
              </div>

              <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Topics:</h4>
                <div className="flex flex-wrap gap-1">
                      {test.topics.slice(0, 3).map((topic, index) => (
                    <span key={index} className="px-2 py-1 bg-accent text-xs rounded">
                      {topic}
                    </span>
                  ))}
                      {test.topics.length > 3 && (
                        <span className="px-2 py-1 bg-accent text-xs rounded">
                          +{test.topics.length - 3}
                        </span>
                      )}
                </div>
              </div>

              <Button
                onClick={() => startTest(test.id)}
                className="w-full btn-gradient"
                    size="sm"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Test
              </Button>
            </div>
          </Card>
        ))}
      </div>
          {filterTests(skillTests).length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tests found matching your criteria</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Recent Test Results */}
      <div className="ai-card p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Award className="h-5 w-5 mr-2 text-primary" />
          Recent Test Results
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading results...</span>
          </div>
        ) : recentTestResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentTestResults.slice(0, 3).map((result, index) => (
              <div key={result.id || index} className="p-4 bg-accent rounded-lg">
            <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-sm font-medium">{result.testName}</span>
                    <Badge className={`ml-2 text-xs ${getDifficultyColor(result.difficulty)}`}>
                      {result.difficulty}
                    </Badge>
                  </div>
                  <span className="text-lg font-bold text-primary">{result.score}%</span>
            </div>
                <p className="text-xs text-muted-foreground mb-2">Completed {result.date}</p>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-success" />
                  <span className="text-xs">{result.status}</span>
                </div>
            </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium">No test results yet</p>
            <p className="text-xs text-muted-foreground mt-1">Take your first aptitude test to see results here!</p>
            <Button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              variant="outline" 
              size="sm" 
              className="mt-3"
            >
              Browse Tests
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AptitudeTest;
