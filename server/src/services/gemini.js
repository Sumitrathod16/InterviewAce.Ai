import axios from 'axios';

const openrouterKey = process.env.OPENROUTER_API_KEY;
const openrouterModel = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

if (openrouterKey) {
  console.log(`OpenRouter Service Initialized successfully (Model: ${openrouterModel}).`);
} else {
  console.warn('OPENROUTER_API_KEY is not set. LLM service will run in offline Mock Fallback Mode.');
}

/**
 * Robust JSON parser that handles potential markdown wrapper code blocks
 */
const parseJSON = (text) => {
  const cleaned = text.trim();
  try {
    if (cleaned.startsWith('```')) {
      const match = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
      if (match && match[1]) {
        return JSON.parse(match[1].trim());
      }
    }
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse JSON response. Raw text:', text);
    throw error;
  }
};

/**
 * Helper to call OpenRouter Chat Completion API
 */
const callOpenRouter = async (prompt, forceJson = false) => {
  const headers = {
    'Authorization': `Bearer ${openrouterKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
    'X-Title': 'InterviewAce.AI'
  };

  const data = {
    model: openrouterModel,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  };

  if (forceJson) {
    data.response_format = { type: 'json_object' };
  }

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    data,
    { headers }
  );

  if (!response.data || !response.data.choices || response.data.choices.length === 0) {
    throw new Error('Empty response from OpenRouter');
  }

  const content = response.data.choices[0].message.content;
  if (!content) {
    throw new Error('OpenRouter returned an empty message content or request was refused/rate-limited.');
  }

  return content;
};

/**
 * Generate a set of interview questions based on parameters
 */
export const generateQuestions = async (params) => {
  const { track, experienceLevel, role, count = 3 } = params;

  if (!openrouterKey) {
    return getMockQuestions(track, role, count);
  }

  try {
    const prompt = `You are a professional technical interviewer. Generate a list of ${count} interview questions for a candidate.
    Track: ${track} (HR Behavioral or Technical)
    Target Role: ${role}
    Experience Level: ${experienceLevel}
    
    Format your response as a JSON array of strings containing only the questions. Do not write any markdown outside the JSON. Example:
    ["Question 1", "Question 2", "Question 3"]`;

    const text = await callOpenRouter(prompt, false);
    return parseJSON(text);
  } catch (error) {
    console.error('Error in generateQuestions:', error.message);
    return getMockQuestions(track, role, count);
  }
};

/**
 * Evaluate a user answer to a specific question
 */
export const evaluateAnswer = async (question, answer, track, role) => {
  if (!openrouterKey) {
    return getMockEvaluation(question, answer, track, role);
  }

  try {
    const isBehavioral = track.toLowerCase().includes('hr') || track.toLowerCase().includes('behavioral');
    const prompt = `You are an AI Interviewer evaluating a candidate's answer.
    Role: ${role}
    Track: ${track}
    Question: "${question}"
    Candidate Answer: "${answer}"

    Perform a deep assessment of their communication, confidence, relevance, and professionalism.
    Provide your response as a JSON object with the following schema:
    {
      "score": number (0-100, overall rating),
      "communicationScore": number (0-100, score for communication & structure),
      "contentScore": number (0-100, score for technical/logical depth),
      "strengths": string[] (list of 2-3 specific strengths of the answer),
      "improvements": string[] (list of 2-3 actionable feedback items to improve),
      "idealAnswer": string (a concise model answer demonstrating how to answer this question optimally using the STAR method if behavioral or detailing the correct technical concepts if technical)${isBehavioral ? `,
      "starRating": {
        "situation": number (0-100, how well they set up the Situation),
        "task": number (0-100, how well they described the Task),
        "action": number (0-100, how detailed their Action description was),
        "result": number (0-100, how well they highlighted and quantified the Result)
      }` : ''}
    }
    Format your response as a valid JSON object. Do not include any markdown format wrapper outside.`;

    const text = await callOpenRouter(prompt, true);
    return parseJSON(text);
  } catch (error) {
    console.error('Error in evaluateAnswer:', error.message);
    return getMockEvaluation(question, answer, track, role);
  }
};

/**
 * Generate a conceptual coding hint & complexity analysis
 */
export const generateCodingHint = async (problemTitle, problemDescription, code, language, consoleOutput) => {
  if (!openrouterKey) {
    return {
      hint: "Review your loop boundary or conditional check. Ensure you are not accessing indices outside the array bounds.",
      complexityAnalysis: "Time Complexity: O(N) | Space Complexity: O(1)"
    };
  }

  try {
    const prompt = `You are an elite coding tutor. Provide a conceptual hint for this coding problem. Do NOT write or output any solution code.
    Problem: "${problemTitle}"
    Description: "${problemDescription}"
    Candidate Language: "${language}"
    Candidate Code:
    """
    ${code}
    """
    Compiler / Test Output: "${consoleOutput || 'None'}"

    Analyze the candidate's code and execution output. Offer a helpful architectural, algorithmic, or dry-run debugging hint.
    Also, analyze the time and space complexity of their current approach.
    Format your response as a JSON object:
    {
      "hint": string (helpful guidance explaining what concept or logic to double-check, without providing code snippets),
      "complexityAnalysis": string (e.g. "Current: O(N^2) time, O(1) space. Optimal: O(N) time, O(N) space.")
    }
    Format your response as a valid JSON object.`;

    const text = await callOpenRouter(prompt, true);
    return parseJSON(text);
  } catch (error) {
    console.error('Error in generateCodingHint:', error.message);
    return {
      hint: "Review your loop boundary or conditional check. Ensure you are not accessing indices outside the array bounds.",
      complexityAnalysis: "Time Complexity: O(N) | Space Complexity: O(1)"
    };
  }
};

/**
 * Optimize resume bullet points for high impact and action verbs
 */
export const optimizeResumeBullet = async (bulletPoint, targetRole) => {
  if (!openrouterKey) {
    return {
      optimized: `Spearheaded front-end optimization by engineering responsive React components, improving client-side page rendering speed by 34% and increasing user retention.`,
      verbUsed: "Spearheaded, Engineered",
      metricTip: "Quantify metrics like latency, load times, user engagement, or server capacity based on your actual work."
    };
  }

  try {
    const prompt = `You are a premium resume writer and career consultant.
    Target Role: ${targetRole}
    Candidate's original bullet point: "${bulletPoint}"

    Optimize this bullet point to make it sound professional, high-impact, and ATS-compatible.
    Use strong action verbs at the beginning and integrate potential quantifiable metrics (use placeholders like [X]% if no metric is implied, but make it look realistic).
    Format your response as a JSON object:
    {
      "optimized": string (the polished, high-impact bullet point),
      "verbUsed": string (the major action verbs used in the rewrite),
      "metricTip": string (advice on what real metrics they can measure and put here)
    }
    Format your response as a valid JSON object.`;

    const text = await callOpenRouter(prompt, true);
    return parseJSON(text);
  } catch (error) {
    console.error('Error in optimizeResumeBullet:', error.message);
    return {
      optimized: `Spearheaded front-end optimization by engineering responsive React components, improving client-side page rendering speed by 34% and increasing user retention.`,
      verbUsed: "Spearheaded, Engineered",
      metricTip: "Quantify metrics like latency, load times, user engagement, or server capacity based on your actual work."
    };
  }
};

/**
 * Analyze a resume for ATS score and keywords
 */
export const analyzeResume = async (resumeText, targetRole) => {
  if (!openrouterKey) {
    return getMockResumeAnalysis(resumeText, targetRole);
  }

  try {
    const prompt = `You are an expert ATS (Applicant Tracking System) scanner and career consultant.
    Target Role: ${targetRole}
    Resume Content:
    """
    ${resumeText}
    """

    Perform an in-depth analysis of the resume formatting, action verbs usage, structural clarity, grammar, and alignment with critical skills of a ${targetRole}.
    Provide your response as a JSON object with the following schema:
    {
      "atsScore": number (0-100, estimate of compatibility),
      "suggestions": [
        { "id": number, "text": string (actionable advice), "value": number (points addition value e.g., 5, 8, 10, 12), "solved": false }
      ],
      "missingKeywords": string[] (list of 4-6 missing standard keywords/tools/skills for a ${targetRole})
    }
    Format your response as a valid JSON object. Do not include markdown code ticks.`;

    const text = await callOpenRouter(prompt, true);
    return parseJSON(text);
  } catch (error) {
    console.error('Error in analyzeResume:', error.message);
    return getMockResumeAnalysis(resumeText, targetRole);
  }
};

/**
 * Auto-optimize a whole resume text to maximize its ATS score
 */
export const optimizeWholeResume = async (resumeText, targetRole) => {
  if (!openrouterKey) {
    return getMockOptimizedResume(resumeText, targetRole);
  }

  try {
    const prompt = `You are a premium resume writer and career consultant.
    Target Role: ${targetRole}
    Candidate's current resume text details:
    """
    ${resumeText}
    """

    Task:
    Rewrite this resume details to maximize its ATS compatibility score for a "${targetRole}" target role.
    Ensure that you:
    1. Fix any grammar and clarity errors.
    2. Rewrite experience bullet points to lead with strong action verbs (e.g. Engineered, Spearheaded, Optimized, Orchestrated) and include potential mock metrics templates (e.g. reduced rendering latency by 35%, improved compilation speeds by 42%).
    3. Include a clear Skills block at the top, grouping critical target keywords like TypeScript, Redux Toolkit, and Jest/Cypress testing.
    4. Ensure that the candidate name, contact details, experiences, and dates are preserved.
    5. Respond ONLY with the plain text of the rewritten, optimized resume. Do NOT wrap it in markdown code blocks.`;

    const text = await callOpenRouter(prompt, false);
    return text.trim();
  } catch (error) {
    console.error('Error in optimizeWholeResume:', error.message);
    return getMockOptimizedResume(resumeText, targetRole);
  }
};

function getMockOptimizedResume(resumeText, targetRole) {
  // Try to cleanly modify weak verbs and append keywords
  let optimized = (resumeText || '')
    .replace(/\bWorked on\b/gi, 'Spearheaded engineering of')
    .replace(/\bHelped optimize\b/gi, 'Optimized client-side rendering and improved')
    .replace(/\bBuilt a clone\b/gi, 'Architected and built a full-scale clone')
    .replace(/\bManaged user login\b/gi, 'Orchestrated secure user authentication and session management');

  const expIndex = optimized.indexOf('EXPERIENCE:');
  const expSection = expIndex !== -1 ? optimized.substring(expIndex) : optimized;

  return `Sumit Rathod
Software Engineer | Frontend Specialist
sumit@example.com | github.com/Sumitrathod16

SUMMARY:
Highly analytical and detail-oriented Software Engineer specializing in ${targetRole} development. Experienced in building robust, performant web applications and optimizing system latency.

TECHNICAL SKILLS & KEYWORDS:
- Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3
- Frameworks & Libraries: React, Redux Toolkit, Next.js, Django
- Tools & Testing: Vite, Webpack, Jest, Cypress, Git, CI/CD
- Concepts: Software Architecture, RESTful APIs, Performance Optimization, ATS layouts

${expSection}`;
}

/**
 * Fix a single specific suggestion in the resume text
 */
export const fixResumeSuggestion = async (resumeText, suggestionText, targetRole) => {
  if (!openrouterKey) {
    return getMockSuggestionFix(resumeText, suggestionText, targetRole);
  }

  try {
    const prompt = `You are an expert resume reviewer and writer.
    Target Role: ${targetRole}
    Candidate's current resume text details:
    """
    ${resumeText}
    """

    Task:
    Modify the resume to address ONLY the following suggestion:
    "${suggestionText}"

    Ensure that you:
    1. Fix the specified issue in the resume text.
    2. Maintain all other parts of the resume, formatting, and details exactly as is.
    3. Respond ONLY with the plain text of the rewritten, updated resume. Do NOT wrap it in markdown code blocks.`;

    const text = await callOpenRouter(prompt, false);
    return text.trim();
  } catch (error) {
    console.error('Error in fixResumeSuggestion:', error.message);
    return getMockSuggestionFix(resumeText, suggestionText, targetRole);
  }
};

function getMockSuggestionFix(resumeText, suggestionText, targetRole) {
  const lowerSugg = (suggestionText || '').toLowerCase();
  let text = resumeText || '';

  if (lowerSugg.includes('weak verbs') || lowerSugg.includes('action verbs')) {
    text = text
      .replace(/\bWorked on\b/gi, 'Spearheaded engineering of')
      .replace(/\bHelped optimize\b/gi, 'Optimized client-side rendering and improved')
      .replace(/\bBuilt a clone\b/gi, 'Architected and built a full-scale clone')
      .replace(/\bManaged user login\b/gi, 'Orchestrated secure user authentication and session management');
  } else if (lowerSugg.includes('quantify') || lowerSugg.includes('metrics')) {
    text = text.replace(/optimize web application speed\./gi, 'optimized web application speed by 42% through lazy loading.');
  } else if (lowerSugg.includes('missing') || lowerSugg.includes('skills') || lowerSugg.includes('tools')) {
    text = text + `\n\nADDITIONAL TECHNICAL SKILLS (ATS RECOMMENDED):
- Languages: TypeScript, ES6+ JavaScript
- State Management: Redux Toolkit
- Testing Tools: Jest, Cypress`;
  } else if (lowerSugg.includes('summary')) {
    text = `PROFESSIONAL SUMMARY:
Experienced ${targetRole} dedicated to building high-fidelity client applications, resolving complex rendering bottlenecks, and optimizing ATS scores.

` + text;
  }

  return text;
}

/**
 * Generate Career Roadmap
 */
export const generateCareerCoachDetails = async (skills, targetRole, education) => {
  if (!openrouterKey) {
    return getMockCoachDetails(skills, targetRole, education);
  }

  try {
    const prompt = `You are a premium AI Career Coach. Generate a comprehensive career roadmap, skill gap analysis, learning recommendations, and salary insights for the following profile:
    Target Role: ${targetRole}
    Current Skills: ${skills.join(', ')}
    Education: ${education}

    Respond as a JSON object with this schema:
    {
      "roadmap": [
        { "phase": string (e.g. "Phase 1: Foundations"), "duration": string, "goals": string[] }
      ],
      "skillGapAnalysis": {
        "strengths": string[],
        "gaps": string[]
      },
      "learningRecommendations": [
        { "topic": string, "resources": string[], "priority": "High" | "Medium" | "Low" }
      ],
      "salaryInsights": {
        "entryLevel": string,
        "midLevel": string,
        "seniorLevel": string,
        "marketDemand": "High" | "Moderate" | "Low"
      }
    }
    Format your response as a valid JSON object.`;

    const text = await callOpenRouter(prompt, true);
    return parseJSON(text);
  } catch (error) {
    console.error('Error in generateCareerCoachDetails:', error.message);
    return getMockCoachDetails(skills, targetRole, education);
  }
};

// ==========================================
// OFFLINE HIGH-FIDELITY MOCK MAPPINGS
// ==========================================

function getMockQuestions(track, role, count) {
  if (track.toLowerCase().includes('hr') || track.toLowerCase().includes('behavioral')) {
    return [
      `Tell me about a time you had a conflict with a teammate and how you resolved it in a professional setting.`,
      `Why do you want to join our company as a ${role}, and where do you see your career heading in the next 5 years?`,
      `Describe a challenging project you spearheaded. What were the obstacles and how did you overcome them?`,
      `How do you prioritize tasks and manage deadlines when handling multiple project expectations concurrently?`,
      `Tell me about a time you made a major technical mistake. How did you identify it, mitigate it, and what did you learn?`,
      `Describe a situation where you had to work with a very difficult stakeholder or client. How did you build trust?`,
      `What is your preferred working style, and how do you handle collaborative decisions in a cross-functional team?`,
      `Tell me about a time you had to adapt quickly to a major shift in project requirements or technology stack.`,
      `How do you stay motivated during repetitive tasks, and what do you do to keep your technical skills sharp?`,
      `Describe an instance where you went above and beyond your standard duties to deliver a critical team milestone.`
    ].slice(0, count);
  } else {
    // Technical track
    const technicalMock = {
      react: [
        `Explain the React Component Lifecycle (or React Hooks dependency array details) and how you optimize rendering performance in a heavy UI application.`,
        `Explain client-side rendering (CSR) vs. server-side rendering (SSR). What are the SEO and performance tradeoffs?`,
        `How does React's reconciliation algorithm and Virtual DOM work under the hood?`,
        `What is React Context, and how does it compare to state management libraries like Redux or Zustand regarding re-renders?`,
        `Describe React.memo, useMemo, and useCallback. When should you use them, and when are they unnecessary optimizations?`,
        `How do you handle error boundaries in a React application to prevent the entire UI from crashing?`,
        `Explain code-splitting and lazy loading in React. How do you configure it with Suspense and dynamic imports?`,
        `How does the Virtual DOM diffing process handle arrays without stable "key" attributes?`,
        `Describe custom hooks. What are the rules of hooks, and how do they promote code reuse?`,
        `How do you optimize bundle size and load time in a large-scale React client application?`
      ],
      javascript: [
        `Explain the concept of closures in JavaScript and provide a practical real-world use case.`,
        `Describe the event loop in JavaScript. How do microtasks (Promises) and macrotasks (setTimeout) execute?`,
        `What is the difference between "double equals" (==) and "triple equals" (===) in JavaScript?`,
        `What are closures and execution contexts? How does scope chain resolution work?`,
        `Explain hoisting in JavaScript. How do var, let, const, and function definitions differ under hoisting?`,
        `Describe prototypal inheritance. How does the prototype chain work under ES6 classes?`,
        `What are the differences between arrow functions and normal functions regarding the "this" keyword, arguments, and constructor properties?`,
        `Explain the difference between synchronous code, callback patterns, Promises, and async/await syntax.`,
        `Describe currying and debouncing/throttling. When and why would you implement debouncing in a scroll listener?`,
        `How do you perform deep cloning of a complex nested object in JavaScript? What are the limitations of JSON.parse(JSON.stringify(obj))?`
      ],
      backend: [
        `How would you design a rate limiter for a public API that receives 100,000 requests per minute? Which algorithm and data store would you use?`,
        `What is database normalization, and when would you choose to denormalize your database schema for optimal read throughput?`,
        `Explain horizontal vs vertical scaling of databases. When is a NoSQL database preferred over a SQL database?`,
        `What is the CAP theorem? How do databases choose between Consistency, Availability, and Partition Tolerance?`,
        `Describe database indexing. How does a B-Tree index work under SQL query optimization, and what are the write overheads?`,
        `Explain the difference between session-based authentication and token-based (JWT) authentication. What are the security tradeoffs?`,
        `Describe how you would handle distributed transactions across multiple microservices (e.g. Saga pattern, 2-phase commit).`,
        `What is connection pooling in database communication, and why is it critical for handling high concurrent connections?`,
        `Explain how message queues (e.g. RabbitMQ, Kafka) decouple background tasks and improve server resilience.`,
        `How do you defend your backend endpoints against SQL Injection, Cross-Site Scripting (XSS), and CSRF vulnerabilities?`
      ]
    };

    const key = Object.keys(technicalMock).find(k => role.toLowerCase().includes(k)) || 'backend';
    return (technicalMock[key] || technicalMock['backend']).slice(0, count);
  }
}

function getMockEvaluation(question, answer, track, role) {
  const score = Math.min(65 + Math.floor(Math.random() * 25) + (answer.length > 100 ? 8 : 0), 98);
  const matchedKeywords = ['communication', 'performance', 'latency', 'optimize', 'scalability', 'react', 'database']
    .filter(kw => answer.toLowerCase().includes(kw));

  const strengths = ["Direct and well-formed responses.", "Covers core terms relevant to the role."];
  if (answer.length > 120) {
    strengths.push("Excellent descriptive depth and detail in your structured analysis.");
  }
  if (matchedKeywords.length > 0) {
    strengths.push(`Strong integration of industry jargon: ${matchedKeywords.join(', ')}.`);
  }

  const improvements = [];
  if (answer.length < 80) {
    improvements.push("Elaborate further with specific real-world experiences or metrics.");
  }
  if (!answer.toLowerCase().includes('star')) {
    improvements.push("Consider structuring your behavioral answers using the STAR method (Situation, Task, Action, Result).");
  }
  if (improvements.length === 0) {
    improvements.push("Provide concrete numerical outcomes to justify your accomplishments.");
  }

  let idealAnswer = "";
  if (track.toLowerCase().includes('hr')) {
    idealAnswer = "A strong response uses the STAR method. First describe the Situation (the context), the Task (what needed to be done), the Action (your direct contribution showing collaboration and emotional intelligence), and the Result (quantified business metrics or key team learnings).";
  } else {
    idealAnswer = `A technical answer should define core terms immediately, list 2-3 architecture patterns, analyze the performance or latency trade-offs, and detail standard scaling methods (e.g. caching, indexing, throttling).`;
  }

  const isBehavioral = track.toLowerCase().includes('hr') || track.toLowerCase().includes('behavioral');
  const starRating = isBehavioral ? {
    situation: Math.min(50 + Math.floor(Math.random() * 50), 100),
    task: Math.min(50 + Math.floor(Math.random() * 50), 100),
    action: Math.min(50 + Math.floor(Math.random() * 50), 100),
    result: Math.min(40 + Math.floor(Math.random() * 60), 100)
  } : undefined;

  return {
    score,
    communicationScore: Math.min(score + 4, 100),
    contentScore: Math.min(score - 3, 100),
    strengths,
    improvements,
    idealAnswer,
    starRating
  };
}

function getMockResumeAnalysis(resumeText, targetRole) {
  const lowerText = (resumeText || '').toLowerCase();
  
  const hasStrongVerbs = lowerText.includes('spearheaded') || lowerText.includes('engineered') || lowerText.includes('optimized') || lowerText.includes('orchestrated') || lowerText.includes('architected');
  const hasMetrics = lowerText.includes('%') || lowerText.includes('latency') || lowerText.includes('speed') || lowerText.includes('rendering');
  const hasKeywords = lowerText.includes('typescript') || lowerText.includes('redux') || lowerText.includes('jest') || lowerText.includes('cypress');
  const hasSkillsSummary = lowerText.includes('skills') || lowerText.includes('technologies') || lowerText.includes('summary');

  const base = 60;
  const suggestions = [
    { id: 1, text: "Replace weak verbs ('Worked', 'Helped') with strong action verbs like 'Engineered', 'Spearheaded', 'Optimized'.", value: 8, solved: hasStrongVerbs },
    { id: 2, text: "Quantify your achievements (e.g., 'optimized latency' -> 'reduced rendering latency by 42%').", value: 12, solved: hasMetrics },
    { id: 3, text: `Add missing industry-standard tools/skills for a ${targetRole} profile (e.g. Redux Toolkit, TypeScript).`, value: 7, solved: hasKeywords },
    { id: 4, text: "Convert any double-column layouts or tables to a single-column layout for parsing compatibility.", value: 5, solved: true },
    { id: 5, text: "Define a summary of skills section near the top of your resume.", value: 4, solved: hasSkillsSummary }
  ];

  let scorePoints = 0;
  suggestions.forEach(s => {
    if (s.solved) scorePoints += s.value;
  });

  const finalScore = Math.min(base + scorePoints, 100);

  return {
    atsScore: finalScore,
    suggestions,
    missingKeywords: hasKeywords ? [] : [
      "TypeScript",
      "Redux Toolkit",
      "System Design",
      "Jest/Cypress Testing",
      "Performance Optimization"
    ]
  };
}

function getMockCoachDetails(skills, targetRole, education) {
  return {
    roadmap: [
      {
        phase: "Phase 1: Strengthening Technical Core",
        duration: "1 - 4 Weeks",
        goals: [
          `Master advanced algorithms, data structures (DSA), and time complexities.`,
          `Learn modern patterns matching ${targetRole} requirements.`
        ]
      },
      {
        phase: "Phase 2: Project Work & System Design",
        duration: "5 - 8 Weeks",
        goals: [
          `Build a production-grade application featuring database indexing, caching, and clean testing.`,
          `Study scaling architectures (load balancing, sharding, message queues).`
        ]
      },
      {
        phase: "Phase 3: Interview Optimization & Mock Trials",
        duration: "9 - 12 Weeks",
        goals: [
          `Practice behavioral scenarios using STAR formatting.`,
          `Complete coding sessions in timed settings.`
        ]
      }
    ],
    skillGapAnalysis: {
      strengths: skills.length > 0 ? skills : ["Object-Oriented Programming", "Basic Web Fundamentals"],
      gaps: [
        "Distributed Systems Architecture",
        "CI/CD Deployment Pipelines",
        "Unit & Integration Testing suites"
      ]
    },
    learningRecommendations: [
      {
        topic: "System Design Primer",
        resources: ["Grokking the System Design Interview", "ByteByteGo YouTube channel"],
        priority: "High"
      },
      {
        topic: "Advanced Data Structures & Algorithms",
        resources: ["LeetCode Medium-Hard list", "NeetCode DSA Roadmap"],
        priority: "High"
      },
      {
        topic: "Modern UI/State Orchestration",
        resources: ["Frontend Masters Advanced courses", "Official documentation updates"],
        priority: "Medium"
      }
    ],
    salaryInsights: {
      entryLevel: "₹6,00,000 - ₹10,00,000 / year",
      midLevel: "₹12,00,000 - ₹22,00,000 / year",
      seniorLevel: "₹24,00,000 - ₹45,00,000+ / year",
      marketDemand: "High"
    }
  };
}
