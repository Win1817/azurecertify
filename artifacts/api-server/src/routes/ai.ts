import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { examAttemptsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ai } from "@workspace/integrations-gemini-ai";
import { batchProcess } from "@workspace/integrations-gemini-ai/batch";

const router: IRouter = Router();

interface GeneratedQuestion {
  content: string;
  options: Array<{ key: string; text: string }>;
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: string;
}

const CERT_TOPICS: Record<string, string[]> = {
  "AZ-900": ["Cloud Concepts", "Azure Architecture", "Azure Services", "Azure Management Tools", "Azure Security", "Pricing & Support"],
  "AZ-104": ["Identity & Governance", "Storage", "Compute Resources", "Virtual Networking", "Monitoring & Backup"],
  "AZ-204": ["Azure Compute Solutions", "Azure Storage", "Azure Security", "Azure Monitor & Logging", "Azure API Management", "Azure Event-Based Solutions"],
  "AZ-500": ["Identity & Access Management", "Platform Protection", "Data & Application Security", "Security Operations", "Microsoft Defender for Cloud", "Azure Sentinel"],
  "AZ-305": ["Identity & Access", "Data Storage", "Business Continuity", "Infrastructure Design", "Migration Strategies", "Networking Solutions", "Application Architecture"],
  "AZ-400": ["DevOps Transformation", "CI/CD Pipelines", "Source Control", "Infrastructure as Code", "Dependency Management", "Continuous Testing"],
  "AZ-700": ["Hybrid Networking", "Azure Virtual Networks", "Routing & Load Balancing", "Network Security", "Private Access to Services", "ExpressRoute & VPN"],
  "DP-203": ["Data Storage Design", "Data Processing", "Data Security", "Data Pipelines", "Azure Synapse Analytics", "Azure Databricks", "Stream Processing"],
  "AI-102": ["Azure AI Services", "Computer Vision", "Natural Language Processing", "Knowledge Mining", "Conversational AI", "Azure OpenAI", "Responsible AI"],
};

async function generateRawQuestions(
  certCode: string,
  difficulty: string,
  count: number,
  topics?: string[]
): Promise<GeneratedQuestion[]> {
  const certTopics = topics?.length ? topics : CERT_TOPICS[certCode] ?? CERT_TOPICS["AZ-900"];
  const topicsStr = certTopics.join(", ");

  const prompt = `You are an expert Azure certification exam question writer.
Generate ${count} unique ${difficulty} difficulty exam questions for the ${certCode} Azure certification exam.
Topics to cover (spread across these): ${topicsStr}

Rules:
- Each question must be scenario-based or test real-world Azure knowledge
- Must have exactly 4 answer options labeled A, B, C, D
- Must have a clear single correct answer
- Explanation must be 2-3 sentences explaining WHY the answer is correct and why others are wrong
- Questions must be at ${difficulty} difficulty level
- Do NOT repeat topics - spread questions across different topics

Return ONLY a valid JSON array, no markdown, no extra text:
[
  {
    "content": "question text here",
    "options": [
      {"key": "A", "text": "option A"},
      {"key": "B", "text": "option B"},
      {"key": "C", "text": "option C"},
      {"key": "D", "text": "option D"}
    ],
    "correctAnswer": "A",
    "explanation": "explanation here",
    "topic": "one of the topic areas",
    "difficulty": "${difficulty}"
  }
]`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { maxOutputTokens: 8192 },
  });

  const text = response.text ?? "";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function validateQuestion(question: GeneratedQuestion, certCode: string): Promise<{ valid: boolean; score: number }> {
  const prompt = `You are an Azure certification exam quality validator.
Evaluate this exam question for ${certCode}:

Question: ${question.content}
Options: ${question.options.map(o => `${o.key}: ${o.text}`).join(", ")}
Correct Answer: ${question.correctAnswer}
Explanation: ${question.explanation}

Score this question on these criteria (each 0-1):
1. Technical accuracy - Is the correct answer actually correct?
2. Clarity - Is the question clear and unambiguous?
3. Exam relevance - Is this appropriate for ${certCode}?
4. Distractor quality - Are the wrong answers plausible?

Return ONLY valid JSON, no extra text:
{"accuracy": 0.9, "clarity": 0.8, "relevance": 0.9, "distractors": 0.7, "valid": true}

valid=true only if accuracy >= 0.8 AND clarity >= 0.7 AND relevance >= 0.8`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 512 },
    });

    const text = response.text ?? "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(cleaned);

    const score = (result.accuracy + result.clarity + result.relevance + result.distractors) / 4;
    return { valid: result.valid === true, score };
  } catch {
    return { valid: false, score: 0 };
  }
}

router.post("/ai/generate-questions", async (req, res) => {
  const { certificationCode, difficulty, count, topics } = req.body;

  if (!certificationCode || !difficulty || !count) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const rawQuestions = await generateRawQuestions(certificationCode, difficulty, count, topics);
    const generatedCount = rawQuestions.length;

    const validationResults = await batchProcess(
      rawQuestions,
      (q) => validateQuestion(q, certificationCode),
      { concurrency: 2, retries: 2 }
    );

    const validQuestions: any[] = [];
    let rejectedCount = 0;

    for (let i = 0; i < rawQuestions.length; i++) {
      const vr = validationResults[i];
      if (vr && vr.valid) {
        validQuestions.push({
          id: randomUUID(),
          ...rawQuestions[i],
          isAiGenerated: true,
          validationScore: vr.score,
        });
      } else {
        rejectedCount++;
      }
    }

    res.json({
      questions: validQuestions,
      generatedCount,
      validatedCount: validQuestions.length,
      rejectedCount,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate questions");
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

router.post("/ai/analyze-attempt", async (req, res) => {
  const { attemptId, certificationCode, score, topicBreakdown, questionResults } = req.body;

  if (!attemptId || !certificationCode) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const weakTopics = (topicBreakdown ?? [])
      .filter((t: any) => t.percentage < 70)
      .map((t: any) => t.topic);

    const strongTopics = (topicBreakdown ?? [])
      .filter((t: any) => t.percentage >= 80)
      .map((t: any) => t.topic);

    const prompt = `You are an Azure certification expert career coach. Analyze this ${certificationCode} exam result.

Exam Score: ${score}%
Passing score: 70%
Result: ${score >= 70 ? "PASSED" : "FAILED"}

Topic Performance:
${(topicBreakdown ?? []).map((t: any) => `- ${t.topic}: ${t.percentage}% (${t.correct}/${t.total})`).join("\n")}

Weak areas (< 70%): ${weakTopics.join(", ") || "None"}
Strong areas (>= 80%): ${strongTopics.join(", ") || "None"}

Provide a detailed, personalized analysis with:
1. Overall assessment (2-3 sentences)
2. Specific weak areas list
3. Specific strong areas list
4. Study plan for each weak area with Microsoft Learn resources
5. 3-5 concrete next steps
6. Recommended next certification
7. Estimated exam readiness (e.g., "Ready to pass", "2-3 weeks of study needed", "1 month of intensive study needed")

Return ONLY valid JSON, no extra text:
{
  "overallAssessment": "...",
  "weakAreas": ["area1", "area2"],
  "strongAreas": ["area1"],
  "studyPlan": [
    {
      "topic": "topic name",
      "priority": "high|medium|low",
      "recommendation": "what to study",
      "resources": ["Microsoft Learn: ...", "Azure Docs: ..."]
    }
  ],
  "nextSteps": ["step1", "step2", "step3"],
  "recommendedNextExam": "AZ-104 or AZ-305 or...",
  "estimatedReadiness": "..."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 8192 },
    });

    const text = response.text ?? "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const analysis = JSON.parse(cleaned);

    await db
      .update(examAttemptsTable)
      .set({ aiAnalysis: analysis })
      .where(eq(examAttemptsTable.id, attemptId));

    res.json(analysis);
  } catch (err) {
    req.log.error({ err }, "Failed to analyze attempt");
    res.status(500).json({ error: "Failed to generate AI analysis" });
  }
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

router.post("/ai/chat", async (req, res) => {
  const { message, history, context } = req.body as {
    message: string;
    history?: ChatMessage[];
    context?: { certificationCode?: string; examMode?: boolean };
  };

  if (!message) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  const certContext = context?.certificationCode
    ? `The user is currently studying for the ${context.certificationCode} Azure certification exam.`
    : "The user is on an Azure certification study platform.";

  const systemPrompt = `You are Ezzy, an expert AI assistant for AzureCertify AI Pro — a professional Azure certification exam platform. You are knowledgeable about all Microsoft Azure services, architecture patterns, and all Azure certification exams (AZ-900, AZ-104, AZ-204, AZ-305, AZ-400, AZ-500, AZ-700, AZ-140, DP-203, AI-102 and more).

${certContext}

Your personality:
- Professional, clear, and encouraging — like a senior Azure architect who loves teaching
- Concise but thorough: structured responses with a Definition, Example, and Exam Tip when relevant
- Always aligned with current Microsoft documentation and best practices
- Honest: if something changed in Azure recently, acknowledge it

Your capabilities:
- Answer any Azure technical question accurately
- Explain certification paths and exam differences
- Provide study recommendations and exam tips
- Generate similar practice questions when asked
- Explain why answers are correct or incorrect
- Give real-world examples using Azure services

Always structure technical answers as:
1. Direct answer (1-2 sentences)
2. Explanation with real-world context
3. Exam tip (if relevant)

Keep responses focused and under 400 words unless a detailed explanation is specifically needed.`;

  try {
    const contents = [
      ...(history ?? []).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      { role: "user" as const, parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        maxOutputTokens: 2048,
        systemInstruction: systemPrompt,
      },
    });

    const reply = response.text ?? "I'm sorry, I couldn't generate a response. Please try again.";
    res.json({ reply });
  } catch (err) {
    req.log.error({ err }, "Ezzy chat failed");
    res.status(500).json({ error: "Failed to get response from Ezzy" });
  }
});

export default router;
