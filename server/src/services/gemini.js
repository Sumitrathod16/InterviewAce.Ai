import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the client. We use google-generative-ai as standard.
let genAI = null;
const apiKey = process.env.GEMINI_API_KEY;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
  console.log('Gemini AI Service Initialized successfully.');
} else {
  console.warn('GEMINI_API_KEY is missing. Gemini service will run in offline Mock Fallback Mode.');
}

/**
 * Generate a set of interview questions based on parameters
 */
export const generateQuestions = async (params) => {
  const { track, experienceLevel, role, count = 3 } = params;

  if (!genAI) {
    return getMockQuestions(track, role, count);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a professional technical interviewer. Generate a list of ${count} interview questions for a candidate.
    Track: ${track} (HR Behavioral or Technical)
    Target Role: ${role}
    Experience Level: ${experienceLevel}
    
    Format your response as a JSON array of strings containing only the questions. Do not write any markdown outside the JSON. Example:
    ["Question 1", "Question 2", "Question 3"]`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error in Gemini generateQuestions:', error.message);
    return getMockQuestions(track, role, count);
  }
};

/**
 * Evaluate a user answer to a specific question
 */
export const evaluateAnswer = async (question, answer, track, role) => {
  if (!genAI) {
    return getMockEvaluation(question, answer, track, role);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
      "idealAnswer": string (a concise model answer demonstrating how to answer this question optimally using the STAR method if behavioral or detailing the correct technical concepts if technical)
    }
    Format your response as a valid JSON object. Do not include any markdown format wrapper outside.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error in Gemini evaluateAnswer:', error.message);
    return getMockEvaluation(question, answer, track, role);
  }
};

/**
 * Analyze a resume for ATS score and keywords
 */
export const analyzeResume = async (resumeText, targetRole) => {
  if (!genAI) {
    return getMockResumeAnalysis(resumeText, targetRole);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error in Gemini analyzeResume:', error.message);
    return getMockResumeAnalysis(resumeText, targetRole);
  }
};

/**
 * Generate Career Roadmap
 */
export const generateCareerCoachDetails = async (skills, targetRole, education) => {
  if (!genAI) {
    return getMockCoachDetails(skills, targetRole, education);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error in Gemini generateCareerCoachDetails:', error.message);
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
      `Describe a challenging project you spearheaded. What were the obstacles and how did you overcome them?`
    ].slice(0, count);
  } else {
    // Technical track
    const technicalMock = {
      react: [
        `Explain the React Component Lifecycle (or React Hooks dependency array details) and how you optimize rendering performance in a heavy UI application.`,
        `Explain client-side rendering (CSR) vs. server-side rendering (SSR). What are the SEO and performance tradeoffs?`,
        `How does React's reconciliation algorithm and Virtual DOM work under the hood?`
      ],
      javascript: [
        `Explain the concept of closures in JavaScript and provide a practical real-world use case.`,
        `Describe the event loop in JavaScript. How do microtasks (Promises) and macrotasks (setTimeout) execute?`,
        `What is the difference between "double equals" (==) and "triple equals" (===) in JavaScript?`
      ],
      backend: [
        `How would you design a rate limiter for a public API that receives 100,000 requests per minute? Which algorithm and data store would you use?`,
        `What is database normalization, and when would you choose to denormalize your database schema for optimal read throughput?`,
        `Explain horizontal vs vertical scaling of databases. When is a NoSQL database preferred over a SQL database?`
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

  return {
    score,
    communicationScore: Math.min(score + 4, 100),
    contentScore: Math.min(score - 3, 100),
    strengths,
    improvements,
    idealAnswer
  };
}

function getMockResumeAnalysis(resumeText, targetRole) {
  const base = 62 + Math.floor(Math.random() * 12);
  return {
    atsScore: base,
    suggestions: [
      { id: 1, text: "Replace weak verbs ('Worked', 'Helped') with strong action verbs like 'Engineered', 'Spearheaded', 'Optimized'.", value: 8, solved: false },
      { id: 2, text: "Quantify your achievements (e.g., 'optimized latency' -> 'reduced rendering latency by 42%').", value: 12, solved: false },
      { id: 3, text: `Add missing industry-standard tools/skills for a ${targetRole} profile (e.g. Redux, Webpack, system testing).`, value: 7, solved: false },
      { id: 4, text: "Convert any double-column layouts or tables to a single-column layout for parsing compatibility.", value: 5, solved: false },
      { id: 5, text: "Define a summary of skills section near the top of your resume.", value: 4, solved: false }
    ],
    missingKeywords: [
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
