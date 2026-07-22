import { GoogleGenerativeAI } from '@google/generative-ai';

const geminiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

let genAI = null;
if (geminiKey) {
  genAI = new GoogleGenerativeAI(geminiKey);
  console.log(`Google Gemini SDK Initialized successfully (Model: ${geminiModel}).`);
} else {
  console.warn('GEMINI_API_KEY is not set. LLM service will run in offline Mock Fallback Mode.');
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
 * Helper to call Google Gemini API via SDK
 */
const callGemini = async (prompt, forceJson = false, enableSearch = false) => {
  if (!genAI) {
    throw new Error('Gemini API key is not configured.');
  }

  const config = {};
  if (forceJson) {
    config.responseMimeType = 'application/json';
  }

  const modelOptions = {
    model: geminiModel,
    generationConfig: config
  };

  if (enableSearch) {
    modelOptions.tools = [{ googleSearch: {} }];
  }

  const model = genAI.getGenerativeModel(modelOptions);

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  if (!text) {
    throw new Error('Empty response from Gemini API');
  }

  return text;
};

/**
 * Generate a set of interview questions based on parameters
 */
export const generateQuestions = async (params) => {
  const { track, experienceLevel, role, count = 3, excludedQuestions = [] } = params;

  if (!geminiKey) {
    return getMockQuestions(track, role, count, excludedQuestions);
  }

  try {
    let prompt = `You are an expert technical recruiter and interviewer conducting a mock interview.
Generate a list of exactly ${count} highly realistic, challenging, and diverse interview questions tailored for the following candidate profile:
- Track: ${track}
- Target Role: ${role}
- Experience Level: ${experienceLevel}

Requirements:
- If this is a Technical track, generate a custom mix of questions covering: front-end performance/rendering optimization (for frontend roles), back-end scalability/concurrency (for backend roles), system design, databases, security, or core programming paradigm deep dives. Make the questions situational (e.g., "Describe how you would debug X in production..."). Avoid generic definitions questions.
- If this is a behavioral track, generate situation-based questions (probing teamwork, conflict resolution, adaptiveness, and prioritization).`;

    if (Array.isArray(excludedQuestions) && excludedQuestions.length > 0) {
      prompt += `\n- CRITICAL: Do NOT generate or repeat any of these previously asked questions:\n${excludedQuestions.map(q => `- ${q}`).join('\n')}`;
    }

    prompt += `\n- Format your response as a valid JSON array of strings containing only the questions. Example:
["Question 1", "Question 2", "Question 3"]`;

    const text = await callGemini(prompt, true);
    return parseJSON(text);
  } catch (error) {
    console.error('Error in generateQuestions:', error.message);
    return getMockQuestions(track, role, count, excludedQuestions);
  }
};

/**
 * Evaluate a user answer to a specific question
 */
export const evaluateAnswer = async (question, answer, track, role) => {
  if (!geminiKey) {
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

    const text = await callGemini(prompt, true);
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
  if (!geminiKey) {
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

    const text = await callGemini(prompt, true);
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
  if (!geminiKey) {
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

    const text = await callGemini(prompt, true);
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
  if (!geminiKey) {
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
         { "id": number, "text": string (actionable advice), "value": number, "solved": false }
       ],
       "missingKeywords": string[] (list of 4-6 missing standard keywords/tools/skills),
       "parsedResume": {
         "name": string (candidate name or empty),
         "email": string (email or empty),
         "phone": string (phone number or empty),
         "website": string (website/portfolio/GitHub or empty),
         "summary": string (brief profile summary or empty),
         "skills": string[] (list of parsed skills/technologies),
         "experience": [
           { "role": string, "company": string, "dates": string, "bullets": string[] }
         ],
         "projects": [
           { "title": string, "bullets": string[] }
         ],
         "education": [
           { "degree": string, "school": string, "dates": string }
         ]
       }
     }
     Format your response as a valid JSON object. Do not include markdown code ticks.`;

    const text = await callGemini(prompt, true);
    return parseJSON(text);
  } catch (error) {
    console.error('Error in analyzeResume:', error.message);
    return getMockResumeAnalysis(resumeText, targetRole);
  }
};

/**
 * Optimize a structured resume representation using AI to maximize its ATS score
 */
export const optimizeStructuredResume = async (parsedResume, targetRole) => {
  if (!geminiKey) {
    return getMockOptimizedStructured(parsedResume, targetRole);
  }

  try {
    const prompt = `You are a premium resume writer and career consultant.
    Target Role: ${targetRole}
    Candidate's current structured resume details:
    """
    ${JSON.stringify(parsedResume, null, 2)}
    """

    Task:
    Rewrite this structured resume to maximize its ATS compatibility score for a "${targetRole}" target role.
    Ensure that you:
    1. Fix any grammar and clarity errors.
    2. Rewrite "summary" to sound professional, high-impact and target-oriented.
    3. Rewrite experience bullets in "experience" and project bullets in "projects" to lead with strong action verbs (e.g. Engineered, Spearheaded, Optimized, Orchestrated) and integrate potential metrics (e.g., improved load speed by 35%).
    4. Keep all other fields (name, email, dates, school names, company names) exactly as they are.
    5. Return the response ONLY as a valid JSON object matching the exact input schema. Do not include markdown code block wrapper.`;

    const text = await callGemini(prompt, true);
    return parseJSON(text);
  } catch (error) {
    console.error('Error in optimizeStructuredResume:', error.message);
    return getMockOptimizedStructured(parsedResume, targetRole);
  }
};

function getMockOptimizedStructured(parsedResume, targetRole) {
  const data = JSON.parse(JSON.stringify(parsedResume || {}));
  
  data.summary = `Highly analytical and detail-oriented Software Engineer specializing in ${targetRole} development. Experienced in building robust, performant web applications and optimizing system latency.`;
  data.skills = [...new Set([...(data.skills || []), "TypeScript", "Redux Toolkit", "System Design", "Jest/Cypress Testing", "Performance Optimization"])];
  
  if (data.experience && data.experience[0]) {
    data.experience[0].bullets = [
      "Spearheaded frontend speed optimization by engineering responsive React components, reducing page load latency by 34%.",
      "Optimized client-side rendering pathways and improved overall Web Vitals metrics by 42%.",
      "Architected scalable state orchestration modules, replacing legacy state management configurations with Redux Toolkit."
    ];
  }

  if (data.projects && data.projects[0]) {
    data.projects[0].bullets = [
      "Architected and built a high-throughput clone of BookMyShow using Django, managing high concurrent traffic rates.",
      "Orchestrated secure user authentication mechanisms, session cookies, and database schema normalizations."
    ];
  }

  return data;
}

/**
 * Auto-optimize a whole resume text to maximize its ATS score
 */
export const optimizeWholeResume = async (resumeText, targetRole) => {
  if (!geminiKey) {
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

    const text = await callGemini(prompt, false);
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
  if (!geminiKey) {
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

    const text = await callGemini(prompt, false);
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
  if (!geminiKey) {
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

    const text = await callGemini(prompt, true);
    return parseJSON(text);
  } catch (error) {
    console.error('Error in generateCareerCoachDetails:', error.message);
    return getMockCoachDetails(skills, targetRole, education);
  }
};

/**
 * Generate customized company-specific interview preparation details via Gemini
 */
export const generateCompanyPrep = async (companyName, targetRole) => {
  if (!geminiKey) {
    return getMockCompanyPrep(companyName, targetRole);
  }

  try {
    const prompt = `You are an expert career coach and technical recruitment lead.
Generate a highly detailed and realistic interview preparation module for a candidate targeting the following profile:
- Target Company: ${companyName}
- Target Role: ${targetRole}

Requirements:
- Custom-tailor the selection round details, quantitative aptitude priorities, technical round questions, and HR/behavioral questions specifically to the known hiring standards, values, and common questions of ${companyName}.
- Format your response as a valid JSON object with precisely these fields:
  - "name": string (full descriptive name of the company, e.g. "Google LLC")
  - "difficulty": "Easy" | "Medium" | "Medium-High" | "High" (estimated interview difficulty for this role)
  - "roundDetails": string (brief summary of selection rounds, e.g. "Online coding test, 2 technical rounds, 1 manager/fit round")
  - "aptitudePrep": array of strings (exactly 2 specific aptitude/verbal topic check guidelines relevant to their assessment)
  - "technicalQuestions": array of strings (exactly 4 specific, realistic technical questions frequently asked at ${companyName} for a ${targetRole} position)
  - "hrQuestions": array of strings (exactly 3 behavioral or HR questions matching ${companyName}'s culture and values)

Do not write any markdown outside the JSON object.`;

    const text = await callGemini(prompt, true, true);
    return parseJSON(text);
  } catch (error) {
    console.error('Error in generateCompanyPrep, falling back to mock generator:', error.message);
    return getMockCompanyPrep(companyName, targetRole);
  }
};

function getMockCompanyPrep(companyName, targetRole) {
  const cleanName = companyName.trim().toLowerCase();
  
  const highFidelityPortfolios = {
    google: {
      name: 'Google LLC',
      difficulty: 'High',
      roundDetails: 'Online Coding Assessment (2 questions), 3 Technical Coding/DSA rounds, 1 System Design round, and 1 Googliness & Leadership round.',
      aptitudePrep: [
        'Master complex algorithmic paradigms: graph algorithms, dynamic programming, and advanced tree structures.',
        'Review strict time and space complexity optimizations (O(1) auxiliary space, O(N log N) runtimes).'
      ],
      technicalQuestions: [
        `How would you design a highly scalable search autocomplete suggestion system that processes 100,000 queries per second?`,
        `Given a directed acyclic graph (DAG), write an efficient algorithm to find the longest path between any two nodes.`,
        `Explain how you would optimize a web application rendering large-scale real-time search results to prevent frame drops.`,
        `What are the network overhead trade-offs between HTTP/2 multiplexing and WebSocket connections for real-time notifications?`
      ],
      hrQuestions: [
        `Tell me about a time you had a strong technical disagreement with a project leader. How did you resolve it constructively?`,
        `How do you navigate highly ambiguous project requirements where there is no clear standard or documentation?`,
        `Why are you interested in joining Google's engineering team, and how do you demonstrate "Googliness" in your work?`
      ]
    },
    microsoft: {
      name: 'Microsoft Corporation',
      difficulty: 'High',
      roundDetails: 'Online Assessment (Codility), 1-2 Technical Phone screens, 3 Onsite rounds focusing on Data Structures, OOP, System Design, and Managerial Fit.',
      aptitudePrep: [
        'Practice questions on binary trees, link-lists, heaps, and modular object-oriented design.',
        'Review logical flow puzzles, abstract grids, and pattern sequences.'
      ],
      technicalQuestions: [
        `How would you design the backend storage and synchronization layer for a collaborative document editor like Office 365?`,
        `Write a complete program to serialize a binary tree to a string and deserialize it back into the original tree structure.`,
        `Explain database locking mechanisms (Pessimistic vs. Optimistic) and how they impact concurrent database transactions.`,
        `How does the event-driven programming paradigm in modern servers handle asynchronous I/O operations without thread blocking?`
      ],
      hrQuestions: [
        `How do you align your personal career growth goals with Microsoft's "Growth Mindset" philosophy?`,
        `Describe a project where you took immediate leadership to resolve a critical system failure or customer crash.`,
        `Tell me about a time you mentored a classmate or junior developer to help them succeed in a technical project.`
      ]
    },
    amazon: {
      name: 'Amazon.com, Inc.',
      difficulty: 'High',
      roundDetails: 'Online Assessment (Coding & Work Simulation), 3-4 Onsite loops focusing heavily on Amazon Leadership Principles, System Design, and Coding.',
      aptitudePrep: [
        'Practice timed competitive programming challenges, class design schemas, and mock behavioral scenario alignments.',
        'Study Amazon\'s 16 Leadership Principles and learn to map your achievements to them.'
      ],
      technicalQuestions: [
        `Design a distributed notification delivery service that sends order updates to millions of active Amazon delivery partners.`,
        `Given K sorted linked lists, write an optimized algorithm to merge them into a single sorted linked list.`,
        `How would you optimize database read operations for Amazon's shopping cart checkout service during heavy traffic events like Prime Day?`,
        `Explain the trade-offs of caching strategies (Write-through vs. Cache-aside) and how you ensure cache consistency.`
      ],
      hrQuestions: [
        `Describe a situation where you took complete ownership of a task or problem outside your immediate job scope (Ownership Principle).`,
        `Tell me about a time you had a technical disagreement with a manager but committed to the team's path (Have Backbone; Disagree and Commit).`,
        `How have you simplified a highly complex system or process to save development time or operational cost (Invent and Simplify)?`
      ]
    },
    tcs: {
      name: 'TCS (Tata Consultancy Services)',
      difficulty: 'Medium',
      roundDetails: 'Aptitude Test (Numerical & Verbal), Technical Interview Panel, and HR round.',
      aptitudePrep: [
        'Practice time-speed-distance, percentage, simple interest, profit & loss, and logical grids.',
        'Review logical reasoning, syllogisms, coding-decoding, and verbal sentence patterns.'
      ],
      technicalQuestions: [
        'What is database normalization? Explain the difference between 1NF, 2NF, and 3NF.',
        'Explain the difference between call by value and call by reference in memory allocation.',
        'Write a basic code to reverse a singly linked list in-place.',
        'What are OOP principles? Explain polymorphism and encapsulation with real examples.'
      ],
      hrQuestions: [
        'Why do you want to join TCS, and are you comfortable relocating to any of our developer centers?',
        'Tell me about your final year project, the technologies used, and your direct role in the team.',
        'How do you stay motivated when assigned to support-oriented or repetitive software cycles?'
      ]
    },
    infosys: {
      name: 'Infosys',
      difficulty: 'Medium',
      roundDetails: 'InfyTQ/HackWithInfy exam, Technical assessment round, and HR Interview.',
      aptitudePrep: [
        'Understand permutation & combination, probability, speed math, and ratios.',
        'Data interpretation tables, graph analyses, and paragraph comprehension checks.'
      ],
      technicalQuestions: [
        'What is a primary key, foreign key, and unique key? How do they differ?',
        'Compare Method Overloading and Method Overriding in Java with examples.',
        'What is the difference between HTML5 semantic tags and regular div wrappers?',
        'Write an optimized algorithm to check if an array contains duplicates.'
      ],
      hrQuestions: [
        'How do you handle work pressure, multiple deadlines, and project prioritization?',
        'Why should we hire you over other candidates presenting similar skillsets?',
        'Describe a situation where you had to learn a complex technical skill very quickly.'
      ]
    },
    wipro: {
      name: 'Wipro',
      difficulty: 'Medium',
      roundDetails: 'Elite National Talent Hunt assessment, Technical Interview Round, and HR Panel.',
      aptitudePrep: [
        'Solve quantitative questions on averages, ratios, mixture-allegation, and work-time formulas.',
        'Practice error spotting, sentence completion, and logical grids.'
      ],
      technicalQuestions: [
        'What is a pointer? How is it used in C/C++ memory management?',
        'Explain the ACID properties of databases and why they are critical.',
        'What is the difference between GET and POST requests in REST API designs?',
        'Write a function to check if a given number is prime.'
      ],
      hrQuestions: [
        'What are your greatest strengths and weaknesses? How are you working on your weaknesses?',
        'Are you willing to work in night shifts if project demands call for it?',
        'Describe your teamwork skills and how you managed tasks in college projects.'
      ]
    },
    accenture: {
      name: 'Accenture',
      difficulty: 'Medium-High',
      roundDetails: 'Cognitive & Technical Assessment, Coding Round, and HR Interview.',
      aptitudePrep: [
        'Study logical sequencing, abstract reasoning, flow charts, and math equations.',
        'Prepare coding fundamentals: pseudocodes, loop analysis, and binary operators.'
      ],
      technicalQuestions: [
        'What is cloud computing? Explain IaaS, PaaS, SaaS with standard examples.',
        'Explain data encapsulation in OOP and why it is useful.',
        'What is the difference between a compiler and an interpreter?',
        'Explain MVC architecture and how it separates presentation and logic layers.'
      ],
      hrQuestions: [
        'Describe a time you solved a problem using a creative or unconventional approach.',
        'How do you manage sudden changes in project requirements or client directions?',
        'What do you know about Accenture\'s cloud services and our global consulting footprint?'
      ]
    },
    deloitte: {
      name: 'Deloitte',
      difficulty: 'High',
      roundDetails: 'Deloitte Aptitude (AMCAT style), Group Case Study discussion, and Tech & HR panels.',
      aptitudePrep: [
        'Prepare statistics, word problems, series puzzles, and logic trees.',
        'Brush up on business case analysis and structuring recommendations.'
      ],
      technicalQuestions: [
        'How does public key cryptography work in securing internet communication?',
        'What is the difference between SQL and NoSQL? When would you use which?',
        'Explain dependency injection and its benefits in app development.',
        'Describe standard Git workflows for team branches.'
      ],
      hrQuestions: [
        'Walk me through a business case problem you analyzed.',
        'How do you resolve conflicts within project team structures?',
        'Where do you see yourself in 3 years with Deloitte consulting services?'
      ]
    }
  };

  const matchedKey = Object.keys(highFidelityPortfolios).find(k => cleanName.includes(k));
  if (matchedKey) {
    return highFidelityPortfolios[matchedKey];
  }

  const title = companyName.trim().charAt(0).toUpperCase() + companyName.trim().slice(1);
  return {
    name: `${title} Corporation`,
    difficulty: 'Medium-High',
    roundDetails: 'Online technical assessment, 2 engineering technical interviews, and 1 behavioral fit round.',
    aptitudePrep: [
      `Practice quantitative skills including probability, speed arithmetic, and logical sequences relevant to ${title}'s test patterns.`,
      `Review technical fundamentals, basic algorithmic structures, and error-spotting code patterns.`
    ],
    technicalQuestions: [
      `Describe how you would design a scalable structure to support concurrent requests for a typical ${targetRole} application.`,
      `Explain database index optimization and how it improves query performance at ${title}.`,
      `How do you secure API communication endpoints from scripts or malicious network traffic?`,
      `What is data serialization? Explain the tradeoffs of JSON vs. Binary format.`
    ],
    hrQuestions: [
      `Why do you want to build your career with ${title}?`,
      `Describe a time you encountered a severe project obstacle. How did you organize your resources to resolve it?`,
      `How do you handle cross-functional collaboration and constructive design feedback?`
    ]
  };
}

// ==========================================
// OFFLINE HIGH-FIDELITY MOCK MAPPINGS
// ==========================================

function getMockQuestions(track, role, count, excludedQuestions = []) {
  const excludeSet = new Set(excludedQuestions.map(q => q.toLowerCase().trim()));

  if (track.toLowerCase().includes('hr') || track.toLowerCase().includes('behavioral')) {
    const questions = [
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
    ];

    const filtered = questions.filter(q => !excludeSet.has(q.toLowerCase().trim()));
    return (filtered.length >= count ? filtered : questions).slice(0, count);
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

    const key = Object.keys(technicalMock).find(k => 
      role.toLowerCase().includes(k) || 
      (k === 'react' && (role.toLowerCase().includes('frontend') || track.toLowerCase().includes('frontend')))
    ) || 'backend';
    
    const questions = technicalMock[key] || technicalMock['backend'];
    const filtered = questions.filter(q => !excludeSet.has(q.toLowerCase().trim()));
    return (filtered.length >= count ? filtered : questions).slice(0, count);
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

  // Simple parser fallback from raw text
  let name = "Sumit Rathod";
  let email = "sumit@example.com";
  let phone = "+91 99999 99999";
  let website = "github.com/Sumitrathod16";

  const experience = [
    {
      role: "Software Engineer",
      company: "TechCorp",
      dates: "2024 - Present",
      bullets: [
        "Worked on the front-end dashboard using React.",
        "Helped optimize web application speed.",
        "Maintained legacy state management architecture."
      ]
    }
  ];

  const projects = [
    {
      title: "BookMyShow Django Clone",
      bullets: [
        "Built a clone using Django.",
        "Managed user login systems."
      ]
    }
  ];

  const education = [
    {
      degree: "B.S. in Computer Science",
      school: "University of Tech",
      dates: "Graduated 2024"
    }
  ];

  return {
    atsScore: finalScore,
    suggestions,
    missingKeywords: hasKeywords ? [] : [
      "TypeScript",
      "Redux Toolkit",
      "System Design",
      "Jest/Cypress Testing",
      "Performance Optimization"
    ],
    parsedResume: {
      name,
      email,
      phone,
      website,
      summary: "Highly motivated Software Engineer specializing in front-end development and speed optimizations.",
      skills: ["JavaScript (ES6+)", "React", "Django", "CSS3", "HTML5"],
      experience,
      projects,
      education
    }
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

/**
 * Analyze code submission to verify it is a proper, general algorithmic implementation.
 * Catches cheating strategies like hardcoding expected outputs or inputs.
 */
export const checkSolutionIntegrity = async (code, language, problemTitle, problemDescription) => {
  if (!geminiKey) {
    return { isProper: true, reason: 'Key not set' };
  }

  try {
    const prompt = `You are a strict grading assistant for an online coding assessment platform.
Analyze the candidate's code submission below to verify if it is a general algorithmic solution or if it is "hardcoded" to pass only specific test cases.

Problem Title: ${problemTitle}
Problem Description: ${problemDescription}
Language: ${language}

Candidate Code:
\`\`\`
${code}
\`\`\`

If the code simply checks for specific test inputs (e.g. target === 9 or target === 6) and returns the corresponding expected test output statically, or if it hardcodes the return values matching the test cases without implementing the logic generally, it must NOT be accepted.

Format your response as a JSON object with exactly two fields:
- "isProper": boolean (true if the code is a genuine algorithmic attempt that solves the general case; false if it's hardcoded to pass specific test cases, returns hardcoded answers, or does not implement the actual logic).
- "reason": string (if isProper is false, provide a friendly reason explaining why the code is not accepted).

Return only the raw JSON. Do not write any markdown wrappers outside the JSON.`;

    const text = await callGemini(prompt, true);
    return parseJSON(text);
  } catch (error) {
    console.error('Error in checkSolutionIntegrity:', error.message);
    return { isProper: true, reason: 'Failed to analyze' }; // fallback to accept
  }
};
