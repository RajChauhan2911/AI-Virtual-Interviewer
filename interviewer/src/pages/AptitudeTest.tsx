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
      },
      {
        id: 6,
        question: "Which method removes the last element from an array?",
        options: ["pop()", "push()", "shift()", "splice()"],
        correct: 0
      },
      {
        id: 7,
        question: "What is the correct way to write a JavaScript comment?",
        options: ["<!-- Comment -->", "// Comment", "/* Comment", "# Comment"],
        correct: 1
      },
      {
        id: 8,
        question: "Which built-in method returns the length of a string?",
        options: ["size()", "length()", "length", "getLength()"],
        correct: 2
      },
      {
        id: 9,
        question: "What is the result of 10 == '10' in JavaScript?",
        options: ["true", "false", "Error", "undefined"],
        correct: 0
      },
      {
        id: 10,
        question: "Which operator is used to assign a value to a variable?",
        options: ["=", "==", "===", ":"],
        correct: 0
      },
      {
        id: 11,
        question: "What will console.log(2 + 2 + '2') output?",
        options: ["222", "42", "6", "Error"],
        correct: 1
      },
      {
        id: 12,
        question: "Which method converts JSON string to JavaScript object?",
        options: ["JSON.parse()", "JSON.stringify()", "JSON.convert()", "JSON.toObject()"],
        correct: 0
      },
      {
        id: 13,
        question: "What is the default value of an uninitialized variable?",
        options: ["null", "undefined", "0", "false"],
        correct: 1
      },
      {
        id: 14,
        question: "Which loop is guaranteed to execute at least once?",
        options: ["for", "while", "do-while", "forEach"],
        correct: 2
      },
      {
        id: 15,
        question: "What does NaN stand for?",
        options: ["Not a Number", "Null and Nothing", "New and Numeric", "None and Nil"],
        correct: 0
      },
      {
        id: 16,
        question: "Which method adds one or more elements to the beginning of an array?",
        options: ["unshift()", "push()", "shift()", "concat()"],
        correct: 0
      },
      {
        id: 17,
        question: "What is the output of typeof []?",
        options: ["array", "object", "list", "undefined"],
        correct: 1
      },
      {
        id: 18,
        question: "Which statement is used to exit a loop?",
        options: ["stop", "exit", "break", "return"],
        correct: 2
      },
      {
        id: 19,
        question: "What is the result of Boolean('false')?",
        options: ["true", "false", "undefined", "Error"],
        correct: 0
      },
      {
        id: 20,
        question: "Which method is used to combine two or more arrays?",
        options: ["concat()", "merge()", "combine()", "join()"],
        correct: 0
      },
      {
        id: 21,
        question: "What is the correct way to create a function in JavaScript?",
        options: ["function myFunction()", "function:myFunction()", "create myFunction()", "def myFunction()"],
        correct: 0
      },
      {
        id: 22,
        question: "Which event occurs when a user clicks on an HTML element?",
        options: ["onmouseclick", "onclick", "onpress", "onhit"],
        correct: 1
      },
      {
        id: 23,
        question: "What is the output of 3 * '3'?",
        options: ["33", "9", "Error", "NaN"],
        correct: 1
      },
      {
        id: 24,
        question: "Which method returns a new array with elements that pass a test?",
        options: ["map()", "filter()", "reduce()", "find()"],
        correct: 1
      },
      {
        id: 25,
        question: "What does the 'return' statement do in a function?",
        options: ["Ends the function and specifies a value", "Restarts the function", "Creates a loop", "Defines a variable"],
        correct: 0
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
      },
      {
        id: 6,
        question: "What does Promise.all() do?",
        options: [
          "Executes promises sequentially",
          "Waits for all promises to resolve",
          "Cancels all promises",
          "Returns the first resolved promise"
        ],
        correct: 1
      },
      {
        id: 7,
        question: "What is the purpose of the async keyword?",
        options: [
          "To make a function synchronous",
          "To make a function return a Promise",
          "To handle errors",
          "To create a new thread"
        ],
        correct: 1
      },
      {
        id: 8,
        question: "What is event bubbling in JavaScript?",
        options: [
          "Events propagate from child to parent elements",
          "Events propagate from parent to child elements",
          "Events are deleted after execution",
          "Events are queued for later execution"
        ],
        correct: 0
      },
      {
        id: 9,
        question: "What does the spread operator (...) do?",
        options: [
          "Multiplies numbers",
          "Expands iterables into individual elements",
          "Creates a range",
          "Divides arrays"
        ],
        correct: 1
      },
      {
        id: 10,
        question: "What is hoisting in JavaScript?",
        options: [
          "Moving code to production",
          "Variable and function declarations are moved to the top",
          "Optimizing code performance",
          "Compressing JavaScript files"
        ],
        correct: 1
      },
      {
        id: 11,
        question: "What is the difference between == and ===?",
        options: [
          "No difference",
          "== checks type, === doesn't",
          "=== checks type and value, == only checks value",
          "=== is faster"
        ],
        correct: 2
      },
      {
        id: 12,
        question: "What is a callback function?",
        options: [
          "A function passed as an argument to another function",
          "A function that calls itself",
          "A function that returns undefined",
          "A built-in JavaScript function"
        ],
        correct: 0
      },
      {
        id: 13,
        question: "What does the reduce() method do?",
        options: [
          "Filters array elements",
          "Maps array to new values",
          "Reduces array to a single value",
          "Sorts the array"
        ],
        correct: 2
      },
      {
        id: 14,
        question: "What is destructuring in JavaScript?",
        options: [
          "Deleting objects",
          "Extracting values from arrays or objects",
          "Breaking code into modules",
          "Compiling code"
        ],
        correct: 1
      },
      {
        id: 15,
        question: "What is the purpose of the bind() method?",
        options: [
          "To create a new function with a specific 'this' value",
          "To combine two functions",
          "To execute a function immediately",
          "To prevent function execution"
        ],
        correct: 0
      },
      {
        id: 16,
        question: "What is the event loop in JavaScript?",
        options: [
          "A loop that runs forever",
          "A mechanism that handles asynchronous operations",
          "A type of for loop",
          "A debugging tool"
        ],
        correct: 1
      },
      {
        id: 17,
        question: "What does Object.freeze() do?",
        options: [
          "Stops JavaScript execution",
          "Prevents modifications to an object",
          "Converts object to string",
          "Deletes all object properties"
        ],
        correct: 1
      },
      {
        id: 18,
        question: "What is a prototype in JavaScript?",
        options: [
          "A first version of code",
          "An object from which other objects inherit properties",
          "A type of function",
          "A variable declaration"
        ],
        correct: 1
      },
      {
        id: 19,
        question: "What does the await keyword do?",
        options: [
          "Pauses execution until Promise resolves",
          "Creates a new Promise",
          "Cancels a Promise",
          "Speeds up execution"
        ],
        correct: 0
      },
      {
        id: 20,
        question: "What is the difference between null and undefined?",
        options: [
          "They are the same",
          "null is assigned, undefined means not assigned",
          "undefined is assigned, null means not assigned",
          "null is for objects, undefined is for primitives"
        ],
        correct: 1
      },
      {
        id: 21,
        question: "What is a higher-order function?",
        options: [
          "A function with high complexity",
          "A function that takes or returns a function",
          "A function at the top of the file",
          "A function with multiple parameters"
        ],
        correct: 1
      },
      {
        id: 22,
        question: "What does Array.from() do?",
        options: [
          "Removes elements from array",
          "Creates a new array from an iterable",
          "Sorts an array",
          "Filters an array"
        ],
        correct: 1
      },
      {
        id: 23,
        question: "What is memoization?",
        options: [
          "Remembering user preferences",
          "Caching function results for optimization",
          "Creating memory leaks",
          "Allocating memory"
        ],
        correct: 1
      },
      {
        id: 24,
        question: "What is the purpose of Symbol in JavaScript?",
        options: [
          "To create unique identifiers",
          "To perform mathematical operations",
          "To create strings",
          "To define functions"
        ],
        correct: 0
      },
      {
        id: 25,
        question: "What does the finally block do in try-catch?",
        options: [
          "Executes only on error",
          "Executes only on success",
          "Executes regardless of try-catch result",
          "Prevents errors"
        ],
        correct: 2
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
      },
      {
        id: 6,
        question: "Which data structure is used to implement BFS (Breadth First Search)?",
        options: ["Stack", "Queue", "Tree", "Graph"],
        correct: 1
      },
      {
        id: 7,
        question: "What is the time complexity of insertion at the end of a dynamic array?",
        options: ["O(1) amortized", "O(n)", "O(log n)", "O(n²)"],
        correct: 0
      },
      {
        id: 8,
        question: "Which sorting algorithm is stable?",
        options: ["Quick Sort", "Heap Sort", "Merge Sort", "Selection Sort"],
        correct: 2
      },
      {
        id: 9,
        question: "What is the space complexity of recursive Fibonacci?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        correct: 1
      },
      {
        id: 10,
        question: "Which data structure is best for implementing a priority queue?",
        options: ["Array", "Linked List", "Heap", "Stack"],
        correct: 2
      },
      {
        id: 11,
        question: "What is the worst-case time complexity of Quick Sort?",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
        correct: 2
      },
      {
        id: 12,
        question: "Which algorithm is used to find the shortest path in an unweighted graph?",
        options: ["DFS", "BFS", "Dijkstra", "Bellman-Ford"],
        correct: 1
      },
      {
        id: 13,
        question: "What is the time complexity of searching in a balanced BST?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correct: 1
      },
      {
        id: 14,
        question: "Which data structure uses hashing?",
        options: ["Array", "Linked List", "Hash Table", "Binary Tree"],
        correct: 2
      },
      {
        id: 15,
        question: "What is the average case time complexity of Hash Table lookup?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        correct: 0
      },
      {
        id: 16,
        question: "Which traversal method uses a stack?",
        options: ["Level Order", "BFS", "DFS", "In-order"],
        correct: 2
      },
      {
        id: 17,
        question: "What is the time complexity of building a max heap?",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
        correct: 0
      },
      {
        id: 18,
        question: "Which algorithm is greedy?",
        options: ["Merge Sort", "Quick Sort", "Dijkstra's Algorithm", "Binary Search"],
        correct: 2
      },
      {
        id: 19,
        question: "What is the minimum number of nodes in a binary tree of height h?",
        options: ["h", "h+1", "2^h", "2^h-1"],
        correct: 1
      },
      {
        id: 20,
        question: "Which data structure is used for undo operations?",
        options: ["Queue", "Stack", "Tree", "Graph"],
        correct: 1
      },
      {
        id: 21,
        question: "What is the time complexity of inserting at the beginning of a linked list?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
        correct: 0
      },
      {
        id: 22,
        question: "Which sorting algorithm works by repeatedly finding the minimum?",
        options: ["Bubble Sort", "Selection Sort", "Insertion Sort", "Merge Sort"],
        correct: 1
      },
      {
        id: 23,
        question: "What is a leaf node in a tree?",
        options: ["Node with one child", "Node with no children", "Root node", "Node with two children"],
        correct: 1
      },
      {
        id: 24,
        question: "Which algorithm technique is used in Merge Sort?",
        options: ["Greedy", "Dynamic Programming", "Divide and Conquer", "Backtracking"],
        correct: 2
      },
      {
        id: 25,
        question: "What is the space complexity of Merge Sort?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
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
      },
      {
        id: 6,
        question: "What is the correct file extension for Python files?",
        options: [".python", ".py", ".pt", ".pyt"],
        correct: 1
      },
      {
        id: 7,
        question: "Which function is used to get input from user in Python?",
        options: ["get()", "input()", "read()", "scan()"],
        correct: 1
      },
      {
        id: 8,
        question: "What is the output of print(type(5.0))?",
        options: ["<class 'int'>", "<class 'float'>", "<class 'number'>", "<class 'decimal'>"],
        correct: 1
      },
      {
        id: 9,
        question: "Which method is used to add an element at the end of a list?",
        options: ["add()", "append()", "insert()", "push()"],
        correct: 1
      },
      {
        id: 10,
        question: "What is the correct syntax for a for loop in Python?",
        options: ["for i in range(5)", "for (i=0; i<5; i++)", "for i to 5", "loop i in range(5)"],
        correct: 0
      },
      {
        id: 11,
        question: "Which data type is mutable in Python?",
        options: ["tuple", "string", "list", "int"],
        correct: 2
      },
      {
        id: 12,
        question: "What does the 'break' statement do?",
        options: ["Exits the loop", "Skips to next iteration", "Stops the program", "Creates an error"],
        correct: 0
      },
      {
        id: 13,
        question: "What is the output of print(10 // 3)?",
        options: ["3.33", "3", "4", "3.0"],
        correct: 1
      },
      {
        id: 14,
        question: "Which symbol is used for comments in Python?",
        options: ["//", "#", "/*", "--"],
        correct: 1
      },
      {
        id: 15,
        question: "What is the correct way to create a dictionary?",
        options: ["dict = {}", "dict = []", "dict = ()", "dict = <>"],
        correct: 0
      },
      {
        id: 16,
        question: "Which method removes and returns the last element of a list?",
        options: ["remove()", "pop()", "delete()", "discard()"],
        correct: 1
      },
      {
        id: 17,
        question: "What is the output of print(bool(0))?",
        options: ["True", "False", "0", "Error"],
        correct: 1
      },
      {
        id: 18,
        question: "Which keyword is used to create a class in Python?",
        options: ["class", "Class", "define", "object"],
        correct: 0
      },
      {
        id: 19,
        question: "What is the correct way to import a module named 'math'?",
        options: ["include math", "import math", "using math", "require math"],
        correct: 1
      },
      {
        id: 20,
        question: "Which method converts a string to uppercase?",
        options: ["toUpperCase()", "upper()", "uppercase()", "capitalize()"],
        correct: 1
      },
      {
        id: 21,
        question: "What is the output of print(5 % 2)?",
        options: ["2.5", "2", "1", "0"],
        correct: 2
      },
      {
        id: 22,
        question: "Which function is used to get the type of a variable?",
        options: ["typeof()", "type()", "getType()", "varType()"],
        correct: 1
      },
      {
        id: 23,
        question: "What does 'elif' stand for in Python?",
        options: ["else if", "elseif", "elif", "else inline"],
        correct: 0
      },
      {
        id: 24,
        question: "Which method is used to find the index of an element in a list?",
        options: ["find()", "index()", "search()", "locate()"],
        correct: 1
      },
      {
        id: 25,
        question: "What is the output of print(True + True)?",
        options: ["2", "True", "False", "Error"],
        correct: 0
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
      },
      {
        id: 6,
        question: "What does the useEffect hook do?",
        options: [
          "Manages component state",
          "Performs side effects in components",
          "Creates context",
          "Handles routing"
        ],
        correct: 1
      },
      {
        id: 7,
        question: "How do you create a React app using CLI?",
        options: [
          "create-react-app myapp",
          "npx create-react-app myapp",
          "npm init react myapp",
          "react new myapp"
        ],
        correct: 1
      },
      {
        id: 8,
        question: "What is the virtual DOM?",
        options: [
          "A copy of the real DOM kept in memory",
          "A CSS framework",
          "A database",
          "A routing library"
        ],
        correct: 0
      },
      {
        id: 9,
        question: "Which method is used to update state in class components?",
        options: ["updateState()", "setState()", "changeState()", "modifyState()"],
        correct: 1
      },
      {
        id: 10,
        question: "What are React fragments used for?",
        options: [
          "To group multiple elements without adding extra nodes",
          "To create animations",
          "To handle forms",
          "To manage state"
        ],
        correct: 0
      },
      {
        id: 11,
        question: "What is the correct way to handle events in React?",
        options: [
          "onclick='handleClick()'",
          "onClick={handleClick}",
          "onClick='handleClick()'",
          "onPress={handleClick}"
        ],
        correct: 1
      },
      {
        id: 12,
        question: "Which hook is used for side effects?",
        options: ["useState", "useEffect", "useContext", "useRef"],
        correct: 1
      },
      {
        id: 13,
        question: "What is the purpose of keys in React lists?",
        options: [
          "To encrypt data",
          "To help React identify which items have changed",
          "To style components",
          "To handle events"
        ],
        correct: 1
      },
      {
        id: 14,
        question: "How do you conditionally render a component?",
        options: [
          "Using if statements in JSX",
          "Using ternary operators or && operator",
          "Using switch statements in JSX",
          "React doesn't support conditional rendering"
        ],
        correct: 1
      },
      {
        id: 15,
        question: "What is the default port for React development server?",
        options: ["8080", "3000", "5000", "8000"],
        correct: 1
      },
      {
        id: 16,
        question: "Which company developed React?",
        options: ["Google", "Facebook/Meta", "Microsoft", "Amazon"],
        correct: 1
      },
      {
        id: 17,
        question: "What is the purpose of useContext hook?",
        options: [
          "To manage state",
          "To access context values",
          "To handle side effects",
          "To create refs"
        ],
        correct: 1
      },
      {
        id: 18,
        question: "Can you modify props inside a component?",
        options: [
          "Yes, props are mutable",
          "No, props are read-only",
          "Only in class components",
          "Only in functional components"
        ],
        correct: 1
      },
      {
        id: 19,
        question: "What is the correct way to import React?",
        options: [
          "import React from 'react'",
          "include React from 'react'",
          "require('react')",
          "using React from 'react'"
        ],
        correct: 0
      },
      {
        id: 20,
        question: "What does the map() function do in React?",
        options: [
          "Creates a map component",
          "Iterates over arrays to create elements",
          "Handles routing",
          "Manages state"
        ],
        correct: 1
      },
      {
        id: 21,
        question: "What is the purpose of useRef hook?",
        options: [
          "To create a mutable reference that persists across renders",
          "To manage state",
          "To handle side effects",
          "To create context"
        ],
        correct: 0
      },
      {
        id: 22,
        question: "How do you pass data from child to parent component?",
        options: [
          "Using props",
          "Using callback functions",
          "Using state",
          "Using context"
        ],
        correct: 1
      },
      {
        id: 23,
        question: "What is the purpose of React.StrictMode?",
        options: [
          "To enable strict mode in JavaScript",
          "To highlight potential problems in an application",
          "To improve performance",
          "To handle errors"
        ],
        correct: 1
      },
      {
        id: 24,
        question: "Which lifecycle method is called before component unmounts?",
        options: [
          "componentWillUnmount",
          "componentDidMount",
          "componentWillMount",
          "componentDidUpdate"
        ],
        correct: 0
      },
      {
        id: 25,
        question: "What is the correct file extension for React components?",
        options: [".js or .jsx", ".react", ".component", ".rc"],
        correct: 0
      }
    ],
    "javascript-hard": [
      {
        id: 1,
        question: "What is the output of this code?",
        code: "console.log(0.1 + 0.2 === 0.3);",
        options: ["true", "false", "undefined", "NaN"],
        correct: 1
      },
      {
        id: 2,
        question: "What is a WeakMap in JavaScript?",
        options: [
          "A map with weak references to keys",
          "A map that automatically deletes entries",
          "A slow map implementation",
          "A map with limited size"
        ],
        correct: 0
      },
      {
        id: 3,
        question: "What is tail call optimization?",
        options: [
          "Optimizing the last function call in a recursive function",
          "Removing unused code",
          "Compressing function calls",
          "Caching function results"
        ],
        correct: 0
      },
      {
        id: 4,
        question: "What is the purpose of Proxy in JavaScript?",
        options: [
          "To create a server proxy",
          "To intercept and customize operations on objects",
          "To cache network requests",
          "To handle authentication"
        ],
        correct: 1
      },
      {
        id: 5,
        question: "What is the difference between microtasks and macrotasks?",
        options: [
          "Microtasks have higher priority in the event loop",
          "Macrotasks execute first",
          "They are the same",
          "Microtasks are synchronous"
        ],
        correct: 0
      },
      {
        id: 6,
        question: "What does Object.seal() do?",
        options: [
          "Prevents adding or removing properties but allows modification",
          "Makes object completely immutable",
          "Deletes all properties",
          "Converts object to string"
        ],
        correct: 0
      },
      {
        id: 7,
        question: "What is a generator function?",
        options: [
          "A function that can pause and resume execution",
          "A function that generates random numbers",
          "A function that creates objects",
          "A function that handles errors"
        ],
        correct: 0
      },
      {
        id: 8,
        question: "What is the purpose of Reflect API?",
        options: [
          "To perform meta-programming operations",
          "To create reflections in UI",
          "To debug code",
          "To optimize performance"
        ],
        correct: 0
      },
      {
        id: 9,
        question: "What is currying in JavaScript?",
        options: [
          "Transforming a function with multiple arguments into nested functions",
          "A cooking technique",
          "A way to optimize loops",
          "A method to handle errors"
        ],
        correct: 0
      },
      {
        id: 10,
        question: "What is the difference between shallow and deep copy?",
        options: [
          "Shallow copies nested references, deep copies all levels",
          "No difference",
          "Shallow is faster",
          "Deep copy only works with primitives"
        ],
        correct: 0
      },
      {
        id: 11,
        question: "What is the temporal dead zone?",
        options: [
          "Time between variable hoisting and initialization",
          "A timezone concept",
          "A debugging zone",
          "An error state"
        ],
        correct: 0
      },
      {
        id: 12,
        question: "What is the purpose of async iterators?",
        options: [
          "To iterate over asynchronous data sources",
          "To speed up loops",
          "To handle errors in loops",
          "To create infinite loops"
        ],
        correct: 0
      },
      {
        id: 13,
        question: "What is the difference between call, apply, and bind?",
        options: [
          "All set 'this' context; call/apply invoke immediately, bind returns new function",
          "They are the same",
          "Only bind works with arrow functions",
          "Call is faster than apply"
        ],
        correct: 0
      },
      {
        id: 14,
        question: "What is debouncing?",
        options: [
          "Delaying function execution until after a period of inactivity",
          "Removing bugs from code",
          "Optimizing database queries",
          "A UI animation technique"
        ],
        correct: 0
      },
      {
        id: 15,
        question: "What is throttling?",
        options: [
          "Limiting function execution to once per time period",
          "Slowing down code execution",
          "A network optimization technique",
          "A debugging method"
        ],
        correct: 0
      },
      {
        id: 16,
        question: "What are JavaScript decorators?",
        options: [
          "Functions that modify class or method behavior",
          "UI styling functions",
          "Error handlers",
          "Performance monitors"
        ],
        correct: 0
      },
      {
        id: 17,
        question: "What is the Module pattern?",
        options: [
          "A design pattern for encapsulation and privacy",
          "A way to import modules",
          "A testing pattern",
          "A deployment strategy"
        ],
        correct: 0
      },
      {
        id: 18,
        question: "What is tree shaking?",
        options: [
          "Removing unused code during bundling",
          "A data structure operation",
          "A testing technique",
          "A debugging method"
        ],
        correct: 0
      },
      {
        id: 19,
        question: "What is the purpose of Worker threads?",
        options: [
          "To run JavaScript in background threads",
          "To handle multiple users",
          "To optimize loops",
          "To manage state"
        ],
        correct: 0
      },
      {
        id: 20,
        question: "What is the Revealing Module pattern?",
        options: [
          "A pattern that exposes only specific public methods",
          "A debugging technique",
          "A testing pattern",
          "A deployment method"
        ],
        correct: 0
      },
      {
        id: 21,
        question: "What is coercion in JavaScript?",
        options: [
          "Automatic type conversion",
          "Forcing strict mode",
          "A security feature",
          "A performance optimization"
        ],
        correct: 0
      },
      {
        id: 22,
        question: "What is the purpose of BigInt?",
        options: [
          "To represent integers larger than Number.MAX_SAFE_INTEGER",
          "To store large strings",
          "To optimize calculations",
          "To handle floating point numbers"
        ],
        correct: 0
      },
      {
        id: 23,
        question: "What is the Observer pattern?",
        options: [
          "A pattern where objects notify subscribers of state changes",
          "A debugging technique",
          "A testing method",
          "A deployment strategy"
        ],
        correct: 0
      },
      {
        id: 24,
        question: "What is the purpose of AbortController?",
        options: [
          "To cancel fetch requests and other async operations",
          "To handle errors",
          "To optimize performance",
          "To manage state"
        ],
        correct: 0
      },
      {
        id: 25,
        question: "What is optional chaining (?.) used for?",
        options: [
          "To safely access nested properties without errors",
          "To create optional parameters",
          "To handle null values",
          "To optimize performance"
        ],
        correct: 0
      }
    ],
    "python-medium": [
      {
        id: 1,
        question: "What is a decorator in Python?",
        options: [
          "A function that modifies another function",
          "A UI component",
          "A data structure",
          "A testing tool"
        ],
        correct: 0
      },
      {
        id: 2,
        question: "What is the difference between @staticmethod and @classmethod?",
        options: [
          "staticmethod doesn't receive class/instance, classmethod receives class",
          "No difference",
          "staticmethod is faster",
          "classmethod is deprecated"
        ],
        correct: 0
      },
      {
        id: 3,
        question: "What is a generator in Python?",
        options: [
          "A function that yields values lazily",
          "A random number generator",
          "A class creator",
          "An error handler"
        ],
        correct: 0
      },
      {
        id: 4,
        question: "What does the __init__ method do?",
        options: [
          "Initializes a new instance of a class",
          "Imports modules",
          "Handles errors",
          "Creates static methods"
        ],
        correct: 0
      },
      {
        id: 5,
        question: "What is list comprehension?",
        options: [
          "A concise way to create lists",
          "A way to compress lists",
          "A sorting method",
          "A debugging technique"
        ],
        correct: 0
      },
      {
        id: 6,
        question: "What is the difference between is and ==?",
        options: [
          "'is' checks identity, '==' checks equality",
          "No difference",
          "'is' is faster",
          "'==' is deprecated"
        ],
        correct: 0
      },
      {
        id: 7,
        question: "What is a lambda function?",
        options: [
          "An anonymous function",
          "A cloud function",
          "A mathematical function",
          "A debugging tool"
        ],
        correct: 0
      },
      {
        id: 8,
        question: "What does *args do in a function?",
        options: [
          "Allows variable number of positional arguments",
          "Multiplies arguments",
          "Creates pointers",
          "Handles errors"
        ],
        correct: 0
      },
      {
        id: 9,
        question: "What does **kwargs do?",
        options: [
          "Allows variable number of keyword arguments",
          "Exponentiates values",
          "Creates dictionaries",
          "Handles exceptions"
        ],
        correct: 0
      },
      {
        id: 10,
        question: "What is the purpose of __str__ method?",
        options: [
          "Returns a string representation of an object",
          "Creates strings",
          "Handles errors",
          "Converts to integer"
        ],
        correct: 0
      },
      {
        id: 11,
        question: "What is the GIL in Python?",
        options: [
          "Global Interpreter Lock",
          "General Input Library",
          "Graphics Interface Layer",
          "Global Import List"
        ],
        correct: 0
      },
      {
        id: 12,
        question: "What is the difference between append() and extend()?",
        options: [
          "append adds single element, extend adds multiple elements",
          "No difference",
          "extend is faster",
          "append is deprecated"
        ],
        correct: 0
      },
      {
        id: 13,
        question: "What is a context manager?",
        options: [
          "An object that manages resource allocation with 'with' statement",
          "A database manager",
          "A memory manager",
          "A file system"
        ],
        correct: 0
      },
      {
        id: 14,
        question: "What does the yield keyword do?",
        options: [
          "Pauses function execution and returns a value",
          "Returns a final value",
          "Handles errors",
          "Creates classes"
        ],
        correct: 0
      },
      {
        id: 15,
        question: "What is multiple inheritance?",
        options: [
          "A class inheriting from multiple parent classes",
          "Creating multiple instances",
          "Having multiple methods",
          "Using multiple decorators"
        ],
        correct: 0
      },
      {
        id: 16,
        question: "What is the purpose of __call__ method?",
        options: [
          "Makes an instance callable like a function",
          "Calls other functions",
          "Handles phone calls",
          "Creates callbacks"
        ],
        correct: 0
      },
      {
        id: 17,
        question: "What is duck typing?",
        options: [
          "If it walks like a duck and quacks like a duck, it's a duck",
          "A strict typing system",
          "A debugging technique",
          "A testing method"
        ],
        correct: 0
      },
      {
        id: 18,
        question: "What is the difference between shallow and deep copy?",
        options: [
          "Shallow copies references, deep copies all nested objects",
          "No difference",
          "Shallow is faster",
          "Deep copy is deprecated"
        ],
        correct: 0
      },
      {
        id: 19,
        question: "What is the purpose of enumerate()?",
        options: [
          "Returns index and value while iterating",
          "Counts elements",
          "Sorts lists",
          "Creates enums"
        ],
        correct: 0
      },
      {
        id: 20,
        question: "What is a property decorator?",
        options: [
          "Creates getter/setter methods",
          "Decorates properties visually",
          "Handles errors",
          "Optimizes performance"
        ],
        correct: 0
      },
      {
        id: 21,
        question: "What is the difference between range() and xrange()?",
        options: [
          "xrange is Python 2, range is Python 3 (lazy evaluation)",
          "No difference",
          "xrange is faster",
          "range is deprecated"
        ],
        correct: 0
      },
      {
        id: 22,
        question: "What is monkey patching?",
        options: [
          "Modifying code at runtime",
          "A debugging technique",
          "A testing method",
          "A deployment strategy"
        ],
        correct: 0
      },
      {
        id: 23,
        question: "What is the purpose of zip() function?",
        options: [
          "Combines multiple iterables into tuples",
          "Compresses files",
          "Creates archives",
          "Sorts data"
        ],
        correct: 0
      },
      {
        id: 24,
        question: "What is a metaclass?",
        options: [
          "A class of a class that defines class behavior",
          "A parent class",
          "An abstract class",
          "A utility class"
        ],
        correct: 0
      },
      {
        id: 25,
        question: "What is the purpose of __slots__?",
        options: [
          "Restricts attributes and saves memory",
          "Creates time slots",
          "Handles scheduling",
          "Manages threads"
        ],
        correct: 0
      }
    ],
    "python-hard": [
      {
        id: 1,
        question: "What is the difference between __new__ and __init__?",
        options: [
          "__new__ creates instance, __init__ initializes it",
          "No difference",
          "__new__ is deprecated",
          "__init__ creates instance"
        ],
        correct: 0
      },
      {
        id: 2,
        question: "What is a descriptor in Python?",
        options: [
          "An object defining __get__, __set__, or __delete__",
          "A documentation string",
          "A type annotation",
          "A debugging tool"
        ],
        correct: 0
      },
      {
        id: 3,
        question: "What is the MRO (Method Resolution Order)?",
        options: [
          "Order in which methods are searched in multiple inheritance",
          "A sorting algorithm",
          "A design pattern",
          "A testing framework"
        ],
        correct: 0
      },
      {
        id: 4,
        question: "What is the purpose of asyncio?",
        options: [
          "For asynchronous I/O and concurrent programming",
          "For file I/O",
          "For mathematical operations",
          "For database operations"
        ],
        correct: 0
      },
      {
        id: 5,
        question: "What is a coroutine?",
        options: [
          "A function that can pause and resume execution",
          "A co-routine in parallel processing",
          "A type of thread",
          "A debugging routine"
        ],
        correct: 0
      },
      {
        id: 6,
        question: "What is the difference between multiprocessing and threading?",
        options: [
          "Multiprocessing uses multiple processes, threading uses threads",
          "No difference",
          "Threading is always faster",
          "Multiprocessing is deprecated"
        ],
        correct: 0
      },
      {
        id: 7,
        question: "What is a weak reference?",
        options: [
          "A reference that doesn't prevent garbage collection",
          "A slow reference",
          "An optional reference",
          "A deprecated reference"
        ],
        correct: 0
      },
      {
        id: 8,
        question: "What is the purpose of __enter__ and __exit__?",
        options: [
          "Used in context managers for resource management",
          "Entry and exit points of programs",
          "Debugging methods",
          "Security features"
        ],
        correct: 0
      },
      {
        id: 9,
        question: "What is a namespace package?",
        options: [
          "A package split across multiple directories",
          "A package with namespaces",
          "A deprecated package type",
          "A testing package"
        ],
        correct: 0
      },
      {
        id: 10,
        question: "What is the purpose of __getattr__ vs __getattribute__?",
        options: [
          "__getattr__ for missing attrs, __getattribute__ for all attrs",
          "No difference",
          "__getattr__ is deprecated",
          "Both are the same"
        ],
        correct: 0
      },
      {
        id: 11,
        question: "What is a singleton pattern in Python?",
        options: [
          "A pattern ensuring only one instance of a class",
          "A single-threaded pattern",
          "A simple design pattern",
          "A testing pattern"
        ],
        correct: 0
      },
      {
        id: 12,
        question: "What is type hinting?",
        options: [
          "Adding type annotations to improve code clarity",
          "A debugging technique",
          "A performance optimization",
          "A compilation step"
        ],
        correct: 0
      },
      {
        id: 13,
        question: "What is the purpose of functools.lru_cache?",
        options: [
          "Memoization to cache function results",
          "To clear cache",
          "To manage memory",
          "To optimize loops"
        ],
        correct: 0
      },
      {
        id: 14,
        question: "What is the difference between @property and __getattr__?",
        options: [
          "@property for specific attributes, __getattr__ for dynamic access",
          "No difference",
          "@property is faster",
          "__getattr__ is deprecated"
        ],
        correct: 0
      },
      {
        id: 15,
        question: "What is the Abstract Base Class (ABC)?",
        options: [
          "A class that cannot be instantiated and defines interface",
          "The first class in alphabet",
          "A simple base class",
          "A testing class"
        ],
        correct: 0
      },
      {
        id: 16,
        question: "What is the purpose of __repr__ vs __str__?",
        options: [
          "__repr__ for developers, __str__ for end users",
          "No difference",
          "__repr__ is deprecated",
          "Both are the same"
        ],
        correct: 0
      },
      {
        id: 17,
        question: "What is a data class?",
        options: [
          "A class decorator that automatically generates special methods",
          "A class for storing data",
          "A database class",
          "A testing class"
        ],
        correct: 0
      },
      {
        id: 18,
        question: "What is the walrus operator :=?",
        options: [
          "Assignment expression that assigns and returns value",
          "A comparison operator",
          "A concatenation operator",
          "A deprecated operator"
        ],
        correct: 0
      },
      {
        id: 19,
        question: "What is structural pattern matching?",
        options: [
          "Python's switch-case feature (match-case)",
          "A regex pattern",
          "A design pattern",
          "A testing pattern"
        ],
        correct: 0
      },
      {
        id: 20,
        question: "What is the purpose of __hash__?",
        options: [
          "Makes objects hashable for use in sets/dicts",
          "Creates hash tables",
          "Encrypts data",
          "Generates passwords"
        ],
        correct: 0
      },
      {
        id: 21,
        question: "What is the difference between classmethod and staticmethod?",
        options: [
          "classmethod receives class as first arg, staticmethod doesn't",
          "No difference",
          "staticmethod is faster",
          "classmethod is deprecated"
        ],
        correct: 0
      },
      {
        id: 22,
        question: "What is a protocol in Python?",
        options: [
          "An informal interface based on duck typing",
          "A network protocol",
          "A communication method",
          "A testing protocol"
        ],
        correct: 0
      },
      {
        id: 23,
        question: "What is the purpose of __sizeof__?",
        options: [
          "Returns size of object in bytes",
          "Creates size limits",
          "Optimizes memory",
          "Handles large objects"
        ],
        correct: 0
      },
      {
        id: 24,
        question: "What is the Global Interpreter Lock (GIL) impact?",
        options: [
          "Prevents true multi-threading in CPU-bound tasks",
          "Improves performance",
          "Handles global variables",
          "Manages imports"
        ],
        correct: 0
      },
      {
        id: 25,
        question: "What is the purpose of typing.Generic?",
        options: [
          "Creates generic types for type hints",
          "Handles generic functions",
          "A general-purpose class",
          "A testing utility"
        ],
        correct: 0
      }
    ],
    "react-medium": [
      {
        id: 1,
        question: "What is the purpose of useMemo?",
        options: [
          "Memoizes expensive calculations",
          "Manages state",
          "Handles side effects",
          "Creates context"
        ],
        correct: 0
      },
      {
        id: 2,
        question: "What is the purpose of useCallback?",
        options: [
          "Memoizes function references",
          "Creates callbacks",
          "Handles events",
          "Manages state"
        ],
        correct: 0
      },
      {
        id: 3,
        question: "What is React.memo used for?",
        options: [
          "Prevents unnecessary re-renders of components",
          "Manages memory",
          "Creates memos",
          "Handles state"
        ],
        correct: 0
      },
      {
        id: 4,
        question: "What is the Context API used for?",
        options: [
          "Sharing data across component tree without props drilling",
          "Creating contexts",
          "Managing state",
          "Handling events"
        ],
        correct: 0
      },
      {
        id: 5,
        question: "What is the difference between controlled and uncontrolled components?",
        options: [
          "Controlled uses React state, uncontrolled uses DOM",
          "No difference",
          "Uncontrolled is faster",
          "Controlled is deprecated"
        ],
        correct: 0
      },
      {
        id: 6,
        question: "What is prop drilling?",
        options: [
          "Passing props through multiple component layers",
          "A debugging technique",
          "A performance optimization",
          "A testing method"
        ],
        correct: 0
      },
      {
        id: 7,
        question: "What is the purpose of useReducer?",
        options: [
          "Manages complex state logic",
          "Reduces component size",
          "Optimizes performance",
          "Handles routing"
        ],
        correct: 0
      },
      {
        id: 8,
        question: "What is React reconciliation?",
        options: [
          "Process of updating the DOM efficiently",
          "A state management library",
          "A routing system",
          "A testing framework"
        ],
        correct: 0
      },
      {
        id: 9,
        question: "What is lazy loading in React?",
        options: [
          "Loading components on demand",
          "Slow loading",
          "A performance issue",
          "A debugging feature"
        ],
        correct: 0
      },
      {
        id: 10,
        question: "What is Suspense used for?",
        options: [
          "Handling loading states for lazy components",
          "Creating animations",
          "Managing state",
          "Handling errors"
        ],
        correct: 0
      },
      {
        id: 11,
        question: "What is code splitting?",
        options: [
          "Dividing bundle into smaller chunks",
          "Splitting code into functions",
          "A debugging technique",
          "A testing method"
        ],
        correct: 0
      },
      {
        id: 12,
        question: "What is the purpose of Error Boundaries?",
        options: [
          "Catching JavaScript errors in component tree",
          "Setting boundaries",
          "Validating props",
          "Handling routing errors"
        ],
        correct: 0
      },
      {
        id: 13,
        question: "What is the difference between useEffect and useLayoutEffect?",
        options: [
          "useLayoutEffect runs synchronously after DOM mutations",
          "No difference",
          "useEffect is faster",
          "useLayoutEffect is deprecated"
        ],
        correct: 0
      },
      {
        id: 14,
        question: "What is React portals used for?",
        options: [
          "Rendering children outside parent DOM hierarchy",
          "Creating portals between pages",
          "Managing state",
          "Handling routing"
        ],
        correct: 0
      },
      {
        id: 15,
        question: "What is the purpose of forwardRef?",
        options: [
          "Forwarding refs to child components",
          "Creating references",
          "Handling state",
          "Managing props"
        ],
        correct: 0
      },
      {
        id: 16,
        question: "What is Higher-Order Component (HOC)?",
        options: [
          "A function that takes a component and returns a new component",
          "A component with high priority",
          "A parent component",
          "A utility component"
        ],
        correct: 0
      },
      {
        id: 17,
        question: "What are render props?",
        options: [
          "A technique for sharing code using props that are functions",
          "Props for rendering",
          "Required props",
          "Optional props"
        ],
        correct: 0
      },
      {
        id: 18,
        question: "What is the purpose of useImperativeHandle?",
        options: [
          "Customizes the instance value exposed to parent refs",
          "Handles imperative code",
          "Manages state",
          "Creates effects"
        ],
        correct: 0
      },
      {
        id: 19,
        question: "What is the purpose of React.cloneElement?",
        options: [
          "Clones and returns a new React element",
          "Duplicates components",
          "Copies state",
          "Handles refs"
        ],
        correct: 0
      },
      {
        id: 20,
        question: "What is synthetic event in React?",
        options: [
          "Cross-browser wrapper around native events",
          "A fake event",
          "An artificial event",
          "A test event"
        ],
        correct: 0
      },
      {
        id: 21,
        question: "What is the purpose of getDerivedStateFromProps?",
        options: [
          "Updates state based on prop changes",
          "Gets derived values",
          "Calculates state",
          "Handles props"
        ],
        correct: 0
      },
      {
        id: 22,
        question: "What is batching in React?",
        options: [
          "Grouping multiple state updates into single re-render",
          "Processing in batches",
          "A testing technique",
          "A deployment method"
        ],
        correct: 0
      },
      {
        id: 23,
        question: "What is the purpose of useDebugValue?",
        options: [
          "Displays label for custom hooks in DevTools",
          "Debugs values",
          "Logs debug info",
          "Handles errors"
        ],
        correct: 0
      },
      {
        id: 24,
        question: "What is shallow comparison in React?",
        options: [
          "Comparing object references instead of deep values",
          "A simple comparison",
          "A fast comparison",
          "A surface-level check"
        ],
        correct: 0
      },
      {
        id: 25,
        question: "What is the purpose of useTransition?",
        options: [
          "Marks state updates as non-urgent",
          "Creates transitions",
          "Animates components",
          "Handles routing"
        ],
        correct: 0
      }
    ],
    "react-hard": [
      {
        id: 1,
        question: "What is Concurrent Mode in React?",
        options: [
          "A set of features to help React apps stay responsive",
          "Running multiple instances",
          "Parallel processing",
          "A threading model"
        ],
        correct: 0
      },
      {
        id: 2,
        question: "What is the Fiber architecture?",
        options: [
          "React's reconciliation algorithm reimplementation",
          "A fiber optic connection",
          "A data structure",
          "A state management system"
        ],
        correct: 0
      },
      {
        id: 3,
        question: "What are Server Components?",
        options: [
          "Components that render on server and send HTML to client",
          "Backend components",
          "Server-side components",
          "API components"
        ],
        correct: 0
      },
      {
        id: 4,
        question: "What is time slicing in React?",
        options: [
          "Breaking rendering work into chunks",
          "Measuring time",
          "Scheduling tasks",
          "A profiling technique"
        ],
        correct: 0
      },
      {
        id: 5,
        question: "What is the purpose of useId?",
        options: [
          "Generates unique IDs for accessibility attributes",
          "Gets user ID",
          "Creates identifiers",
          "Manages keys"
        ],
        correct: 0
      },
      {
        id: 6,
        question: "What is hydration in React?",
        options: [
          "Attaching event listeners to server-rendered HTML",
          "Adding water to components",
          "Initializing state",
          "Loading data"
        ],
        correct: 0
      },
      {
        id: 7,
        question: "What is the purpose of useSyncExternalStore?",
        options: [
          "Subscribes to external stores with concurrent features",
          "Syncs data",
          "Creates external stores",
          "Handles storage"
        ],
        correct: 0
      },
      {
        id: 8,
        question: "What is automatic batching in React 18?",
        options: [
          "Batching state updates in async functions and promises",
          "Auto-processing batches",
          "A performance feature",
          "A testing feature"
        ],
        correct: 0
      },
      {
        id: 9,
        question: "What are transitions in React?",
        options: [
          "A way to mark updates as non-urgent",
          "Animations between states",
          "Page transitions",
          "Component transitions"
        ],
        correct: 0
      },
      {
        id: 10,
        question: "What is the purpose of startTransition?",
        options: [
          "Marks state updates as non-blocking",
          "Starts animations",
          "Begins transitions",
          "Initializes changes"
        ],
        correct: 0
      },
      {
        id: 11,
        question: "What is selective hydration?",
        options: [
          "Hydrating parts of page based on user interaction",
          "Choosing what to hydrate",
          "Partial rendering",
          "Lazy hydration"
        ],
        correct: 0
      },
      {
        id: 12,
        question: "What is the purpose of useDeferredValue?",
        options: [
          "Defers updating non-urgent values",
          "Delays values",
          "Postpones rendering",
          "Caches values"
        ],
        correct: 0
      },
      {
        id: 13,
        question: "What is tearing in React?",
        options: [
          "Inconsistent UI due to external store updates",
          "Component breaking",
          "Memory leaks",
          "Performance issues"
        ],
        correct: 0
      },
      {
        id: 14,
        question: "What is the purpose of React Compiler?",
        options: [
          "Automatically optimizes React code",
          "Compiles JSX",
          "Bundles code",
          "Transpiles JavaScript"
        ],
        correct: 0
      },
      {
        id: 15,
        question: "What are streaming SSR improvements?",
        options: [
          "Sending HTML to client as it's generated",
          "Video streaming",
          "Data streaming",
          "Event streaming"
        ],
        correct: 0
      },
      {
        id: 16,
        question: "What is the purpose of createRoot?",
        options: [
          "Creates root for concurrent features",
          "Creates DOM root",
          "Initializes React",
          "Sets up app"
        ],
        correct: 0
      },
      {
        id: 17,
        question: "What is the difference between flushSync and regular updates?",
        options: [
          "flushSync forces synchronous update",
          "No difference",
          "flushSync is faster",
          "Regular is synchronous"
        ],
        correct: 0
      },
      {
        id: 18,
        question: "What is the purpose of useEvent (experimental)?",
        options: [
          "Creates stable function references without dependencies",
          "Handles events",
          "Creates event listeners",
          "Manages callbacks"
        ],
        correct: 0
      },
      {
        id: 19,
        question: "What is the purpose of use (experimental)?",
        options: [
          "Reads value of Promise or Context",
          "Uses hooks",
          "Handles effects",
          "Manages state"
        ],
        correct: 0
      },
      {
        id: 20,
        question: "What is React Forget?",
        options: [
          "Auto-memoization compiler",
          "Memory management",
          "Garbage collection",
          "Cache clearing"
        ],
        correct: 0
      },
      {
        id: 21,
        question: "What is the purpose of React DevTools Profiler?",
        options: [
          "Measures rendering performance",
          "Profiles users",
          "Debugs code",
          "Tests components"
        ],
        correct: 0
      },
      {
        id: 22,
        question: "What is the render phase in React?",
        options: [
          "When React calculates what changed",
          "Final rendering",
          "Initial load",
          "Update cycle"
        ],
        correct: 0
      },
      {
        id: 23,
        question: "What is the commit phase in React?",
        options: [
          "When React applies changes to DOM",
          "Git commit",
          "State commit",
          "Data persistence"
        ],
        correct: 0
      },
      {
        id: 24,
        question: "What is the purpose of React's reconciliation algorithm?",
        options: [
          "Efficiently updates DOM by diffing virtual DOM trees",
          "Resolves conflicts",
          "Synchronizes state",
          "Merges changes"
        ],
        correct: 0
      },
      {
        id: 25,
        question: "What are React's rules of hooks?",
        options: [
          "Only call at top level and only in React functions",
          "Naming conventions",
          "Performance rules",
          "Testing rules"
        ],
        correct: 0
      }
    ]
  };

  // Get questions for the selected test
  const getQuestionsForTest = (testId: string) => {
    // Map test IDs to question sets
    const questionMap: { [key: string]: string } = {
      // JavaScript Tests
      "javascript-easy": "javascript-easy",
      "javascript-medium": "javascript-medium",
      "javascript-hard": "javascript-hard",
      
      // Python Tests
      "python-easy": "python-easy",
      "python-medium": "python-medium",
      "python-hard": "python-hard",
      
      // React Tests
      "react-easy": "react-easy",
      "react-medium": "react-medium",
      "react-hard": "react-hard",
      
      // Google Tests (DSA focused)
      "google-easy": "google-easy",
      "google-medium": "google-easy",
      "google-hard": "google-easy",
      
      // Microsoft Tests
      "microsoft-easy": "javascript-easy",
      "microsoft-medium": "javascript-medium",
      "microsoft-hard": "javascript-hard",
      
      // Amazon Tests
      "amazon-easy": "python-easy",
      "amazon-medium": "python-medium",
      "amazon-hard": "google-easy",
      
      // Meta Tests (React/JavaScript focused)
      "meta-easy": "react-easy",
      "meta-medium": "react-medium",
      "meta-hard": "react-hard",
      
      // TCS Tests
      "tcs-easy": "javascript-easy",
      "tcs-medium": "python-medium",
      "tcs-hard": "google-easy",
      
      // Infosys Tests
      "infosys-easy": "python-easy",
      "infosys-medium": "javascript-medium",
      
      // Wipro Tests
      "wipro-easy": "javascript-easy",
      "wipro-medium": "python-medium",
      
      // Java Tests
      "java-easy": "javascript-easy",
      "java-medium": "python-medium",
      "java-hard": "javascript-hard",
      
      // SQL Tests
      "sql-easy": "python-easy",
      "sql-medium": "python-medium",
      "sql-hard": "python-hard",
      
      // DSA Tests
      "dsa-easy": "google-easy",
      "dsa-medium": "google-easy",
      "dsa-hard": "google-easy",
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
