const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    const key = process.env.GEMINI_API_KEY;
    if (!key || !key.startsWith('AIza')) {
      console.warn('⚠️  GEMINI_API_KEY missing or invalid — AI features will use fallback responses');
      this.enabled = false;
    } else {
      this.genAI = new GoogleGenerativeAI(key);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      this.enabled = true;
    }
  }

  // ─── Robust JSON extractor ────────────────────────────────────────────────
  _parseJSON(text) {
    // Strip markdown fences
    let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    // Find first { or [ to handle any leading text
    const start = cleaned.search(/[{[]/);
    if (start > 0) cleaned = cleaned.slice(start);
    // Find matching closing bracket
    const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
    if (end !== -1) cleaned = cleaned.slice(0, end + 1);
    return JSON.parse(cleaned);
  }

  // ─── Call Gemini safely ───────────────────────────────────────────────────
  async _generate(prompt) {
    if (!this.enabled) throw new Error('AI_DISABLED');
    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  // ─── Skill Recommendations ────────────────────────────────────────────────
  async getSkillRecommendations(userProfile) {
    const prompt = `
You are a career and skill development expert for SkillBridge.

User Profile:
- Name: ${userProfile.name}
- Current Skills: ${userProfile.skillsOffered?.map(s => s.name).join(', ') || 'None listed'}
- Wanted Skills: ${userProfile.skillsWanted?.map(s => s.name).join(', ') || 'None listed'}
- Experience Level: ${userProfile.experienceLevel || 'Not specified'}
- Bio: ${userProfile.bio || 'Not provided'}

Recommend 6 skills. Respond ONLY with valid JSON (no markdown, no explanation):
{
  "recommendations": [
    {
      "name": "Skill Name",
      "category": "Category",
      "reason": "Why this skill suits them",
      "marketDemand": "High",
      "estimatedTime": "3-6 months",
      "type": "learn"
    }
  ],
  "summary": "Brief 2-sentence summary"
}`;
    try {
      const text = await this._generate(prompt);
      return this._parseJSON(text);
    } catch (err) {
      if (err.message === 'AI_DISABLED') return this._fallbackRecommendations(userProfile);
      console.error('AI recommendation error:', err.message);
      return this._fallbackRecommendations(userProfile);
    }
  }

  _fallbackRecommendations(user) {
    const skills = ['JavaScript', 'Python', 'UI/UX Design', 'Data Analysis', 'Public Speaking', 'Project Management'];
    return {
      recommendations: skills.map((name, i) => ({
        name,
        category: ['Programming', 'Programming', 'Design', 'Analytics', 'Communication', 'Management'][i],
        reason: `Popular skill with high market demand that complements your profile`,
        marketDemand: 'High',
        estimatedTime: '3-6 months',
        type: i % 2 === 0 ? 'learn' : 'offer',
      })),
      summary: 'These recommendations are based on popular skills on the platform. Update your profile to get personalized suggestions.',
    };
  }

  // ─── Skill Gap Analysis ───────────────────────────────────────────────────
  async analyzeSkillGap(userProfile, targetRole) {
    const prompt = `
You are a skills gap analyst for SkillBridge.

User's Current Skills: ${userProfile.skillsOffered?.map(s => `${s.name} (${s.level})`).join(', ') || 'None'}
Target Role/Goal: ${targetRole}
Experience Level: ${userProfile.experienceLevel || 'Not specified'}

Respond ONLY with valid JSON:
{
  "targetRole": "${targetRole}",
  "readinessScore": 65,
  "readinessLabel": "Partially Ready",
  "strongSkills": ["skill1", "skill2"],
  "gapSkills": [
    {
      "name": "Skill Name",
      "priority": "High",
      "currentLevel": "beginner",
      "requiredLevel": "advanced",
      "estimatedTime": "3 months"
    }
  ],
  "quickWins": ["skill learnable in days/weeks"],
  "longTermGoals": ["skill requiring months"],
  "summary": "3-4 sentence analysis"
}`;
    try {
      const text = await this._generate(prompt);
      return this._parseJSON(text);
    } catch (err) {
      if (err.message === 'AI_DISABLED') return this._fallbackGapAnalysis(targetRole);
      console.error('AI gap analysis error:', err.message);
      return this._fallbackGapAnalysis(targetRole);
    }
  }

  _fallbackGapAnalysis(targetRole) {
    return {
      targetRole,
      readinessScore: 50,
      readinessLabel: 'Developing',
      strongSkills: ['Communication', 'Problem Solving'],
      gapSkills: [
        { name: 'Technical Skills', priority: 'High', currentLevel: 'beginner', requiredLevel: 'intermediate', estimatedTime: '3-6 months' },
        { name: 'Domain Knowledge', priority: 'Medium', currentLevel: 'none', requiredLevel: 'intermediate', estimatedTime: '2-4 months' },
      ],
      quickWins: ['Online courses', 'Practice projects'],
      longTermGoals: ['Industry certifications', 'Portfolio building'],
      summary: `To become a ${targetRole}, focus on building core technical skills and domain knowledge. Add your current skills to your profile for a personalized analysis.`,
    };
  }

  // ─── Learning Roadmap ─────────────────────────────────────────────────────
  async generateLearningRoadmap(skillName, currentLevel, targetLevel, timeframe) {
    const prompt = `
You are a personalized learning expert for SkillBridge.

Skill: ${skillName}
Current Level: ${currentLevel}
Target Level: ${targetLevel}
Timeframe: ${timeframe || '6 months'}

Respond ONLY with valid JSON:
{
  "skill": "${skillName}",
  "totalDuration": "${timeframe || '6 months'}",
  "phases": [
    {
      "phase": 1,
      "name": "Foundation",
      "duration": "4 weeks",
      "goal": "Phase goal",
      "topics": ["topic1", "topic2", "topic3"],
      "resources": [
        { "type": "course", "title": "Resource Title", "url": "", "isFree": true }
      ],
      "milestones": ["milestone1", "milestone2"],
      "weeklyHours": 5
    }
  ],
  "prerequisites": ["prereq1"],
  "practiceProjects": [
    { "title": "Project Name", "description": "Brief description", "difficulty": "Easy" }
  ],
  "successMetrics": ["metric1", "metric2"],
  "tips": ["tip1", "tip2", "tip3"]
}`;
    try {
      const text = await this._generate(prompt);
      return this._parseJSON(text);
    } catch (err) {
      if (err.message === 'AI_DISABLED') return this._fallbackRoadmap(skillName, timeframe);
      console.error('AI roadmap error:', err.message);
      return this._fallbackRoadmap(skillName, timeframe);
    }
  }

  _fallbackRoadmap(skillName, timeframe) {
    return {
      skill: skillName,
      totalDuration: timeframe || '6 months',
      phases: [
        {
          phase: 1, name: 'Foundation', duration: '6 weeks',
          goal: `Learn the basics of ${skillName}`,
          topics: ['Core concepts', 'Fundamental techniques', 'Basic tools'],
          resources: [
            { type: 'course', title: `${skillName} for Beginners`, url: '', isFree: true },
            { type: 'video', title: 'YouTube tutorials', url: 'https://youtube.com', isFree: true },
          ],
          milestones: ['Complete first project', 'Understand core concepts'],
          weeklyHours: 5,
        },
        {
          phase: 2, name: 'Practice', duration: '8 weeks',
          goal: `Build practical ${skillName} skills`,
          topics: ['Advanced techniques', 'Real-world projects', 'Best practices'],
          resources: [
            { type: 'practice', title: 'Build a portfolio project', url: '', isFree: true },
          ],
          milestones: ['Complete portfolio project', 'Peer review'],
          weeklyHours: 7,
        },
      ],
      prerequisites: ['Basic computer literacy', 'Time commitment'],
      practiceProjects: [
        { title: `${skillName} Starter Project`, description: 'A beginner-friendly project to practice fundamentals', difficulty: 'Easy' },
        { title: `${skillName} Portfolio Piece`, description: 'A showable project for your profile', difficulty: 'Medium' },
      ],
      successMetrics: ['Can complete projects independently', 'Comfortable with core tools', 'Ready to teach others'],
      tips: ['Practice daily, even for 15 minutes', 'Join communities and forums', 'Find a study partner on SkillBridge', 'Document your learning journey'],
    };
  }

  // ─── AI Chat ──────────────────────────────────────────────────────────────
  async chat(messages, userContext) {
    const systemPrompt = `You are SkillBridge AI Assistant — a helpful, encouraging guide for the SkillBridge skill exchange platform.

You help users:
- Find the right skills to learn or offer
- Navigate platform features (exchanges, sessions, chats, profiles)
- Get learning advice and resources
- Understand how skill exchanges work

User Context:
- Name: ${userContext.name || 'User'}
- Skills Offered: ${userContext.skillsOffered?.join(', ') || 'Not set up yet'}
- Skills Wanted: ${userContext.skillsWanted?.join(', ') || 'Not set up yet'}

Be friendly, concise, and practical. Use emojis sparingly.`;

    try {
      if (!this.enabled) return this._fallbackChat(messages);

      const chat = this.model.startChat({
        history: [
          { role: 'user',  parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: "Understood! I'm ready to help SkillBridge users." }] },
          ...messages.slice(0, -1).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
        ],
        generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
      });

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      return result.response.text();
    } catch (err) {
      console.error('AI chat error:', err.message);
      return this._fallbackChat(messages);
    }
  }

  _fallbackChat(messages) {
    const last = messages[messages.length - 1]?.content?.toLowerCase() || '';
    if (last.includes('skill') || last.includes('learn'))
      return "Great question about skills! 🎯 To get personalized recommendations, make sure your profile has your current skills and what you want to learn. Then visit the Skills page to browse what others are offering!";
    if (last.includes('exchange') || last.includes('match'))
      return "Skill exchanges work by matching what you offer with what others want to learn, and vice versa! 🤝 Browse the Skills page and click 'Request Exchange' on any skill that interests you.";
    if (last.includes('session'))
      return "Sessions are scheduled meetings between exchange partners! 📅 Once your exchange request is accepted, head to the Sessions page to schedule your first meeting.";
    return "Thanks for reaching out! 👋 I'm SkillBridge AI. I can help you find skills to learn, understand how exchanges work, or navigate the platform. What would you like to know?";
  }

  // ─── AI Matches ───────────────────────────────────────────────────────────
  async findBestMatches(user, potentialMatches) {
    if (!potentialMatches || potentialMatches.length === 0) return { matches: [] };

    const prompt = `
You are a matching expert for SkillBridge.

Target User:
- Skills Offered: ${user.skillsOffered?.map(s => s.name).join(', ') || 'None'}
- Skills Wanted: ${user.skillsWanted?.map(s => s.name).join(', ') || 'None'}
- Experience Level: ${user.experienceLevel || 'Not specified'}

Potential Matches:
${JSON.stringify(potentialMatches.slice(0, 10).map(m => ({
  id: m._id?.toString(),
  skillsOffered: m.skillsOffered?.map(s => s.name),
  skillsWanted: m.skillsWanted?.map(s => s.name),
  rating: m.averageRating,
  level: m.experienceLevel,
})))}

Score each 0-100 based on skill complementarity. Respond ONLY with valid JSON:
{
  "matches": [
    { "id": "user_id_string", "score": 85, "reason": "Brief reason" }
  ]
}`;
    try {
      const text = await this._generate(prompt);
      return this._parseJSON(text);
    } catch (err) {
      // Fallback: score by simple overlap
      const wantedNames = user.skillsWanted?.map(s => s.name.toLowerCase()) || [];
      const offeredNames = user.skillsOffered?.map(s => s.name.toLowerCase()) || [];
      const matches = potentialMatches.slice(0, 10).map(m => {
        const theirOffered = m.skillsOffered?.map(s => s.name.toLowerCase()) || [];
        const theirWanted  = m.skillsWanted?.map(s => s.name.toLowerCase()) || [];
        const overlap = wantedNames.filter(s => theirOffered.includes(s)).length
                      + offeredNames.filter(s => theirWanted.includes(s)).length;
        return { id: m._id?.toString(), score: Math.min(50 + overlap * 15, 99), reason: 'Skill overlap match' };
      });
      return { matches };
    }
  }

  // ─── Verification Questions ───────────────────────────────────────────────
  async generateVerificationQuestions(skillName, level) {
    const prompt = `
Generate 5 verification questions for "${skillName}" at ${level} level.
Respond ONLY with valid JSON:
{
  "questions": [
    {
      "question": "Question text",
      "type": "multiple_choice",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Why this is correct"
    }
  ]
}`;
    try {
      const text = await this._generate(prompt);
      return this._parseJSON(text);
    } catch (err) {
      if (err.message === 'AI_DISABLED') return this._fallbackQuestions(skillName, level);
      console.error('AI verification questions error:', err.message);
      return this._fallbackQuestions(skillName, level);
    }
  }

  _fallbackQuestions(skillName, level) {
    return {
      questions: [
        {
          question: `How long have you been practicing ${skillName}?`,
          type: 'multiple_choice',
          options: ['Less than 6 months', '6-12 months', '1-3 years', 'More than 3 years'],
          correctAnswer: level === 'beginner' ? 'Less than 6 months' : level === 'intermediate' ? '1-3 years' : 'More than 3 years',
          explanation: 'Experience duration helps gauge proficiency level.',
        },
        {
          question: `Describe a project where you applied ${skillName}.`,
          type: 'short_answer',
          options: [],
          correctAnswer: '',
          explanation: 'Real-world application demonstrates practical knowledge.',
        },
        {
          question: `What are the most important principles of ${skillName}?`,
          type: 'short_answer',
          options: [],
          correctAnswer: '',
          explanation: 'Understanding principles shows depth of knowledge.',
        },
      ],
    };
  }
}

module.exports = new AIService();