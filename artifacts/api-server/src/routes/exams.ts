import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { examSessionsTable, examAttemptsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CERTIFICATIONS } from "./certifications";

const router: IRouter = Router();

const SEED_QUESTIONS: Record<string, Record<string, any[]>> = {
  "AZ-900": {
    easy: [
      {
        content: "Which cloud deployment model provides the most control and customization over the infrastructure?",
        options: [
          { key: "A", text: "Public cloud" },
          { key: "B", text: "Private cloud" },
          { key: "C", text: "Hybrid cloud" },
          { key: "D", text: "Community cloud" },
        ],
        correctAnswer: "B",
        explanation: "A private cloud gives organizations the most control and customization because the infrastructure is dedicated to a single organization, either on-premises or hosted by a third party.",
        topic: "Cloud Concepts",
        difficulty: "easy",
      },
      {
        content: "What is the primary benefit of using the Azure pay-as-you-go pricing model?",
        options: [
          { key: "A", text: "You pay a fixed monthly fee regardless of usage" },
          { key: "B", text: "You only pay for what you actually use" },
          { key: "C", text: "You get unlimited storage at no additional cost" },
          { key: "D", text: "You receive a perpetual license for all Azure services" },
        ],
        correctAnswer: "B",
        explanation: "The pay-as-you-go model means you are charged only for the resources you consume, making it cost-effective and flexible — a core advantage of cloud computing over traditional infrastructure.",
        topic: "Pricing & Support",
        difficulty: "easy",
      },
      {
        content: "Which Azure service provides a managed relational database with features like automatic backups, high availability, and scaling?",
        options: [
          { key: "A", text: "Azure Blob Storage" },
          { key: "B", text: "Azure Cosmos DB" },
          { key: "C", text: "Azure SQL Database" },
          { key: "D", text: "Azure Table Storage" },
        ],
        correctAnswer: "C",
        explanation: "Azure SQL Database is a fully managed relational database service built on SQL Server that includes automatic backups, high availability, and intelligent performance features.",
        topic: "Azure Services",
        difficulty: "easy",
      },
    ],
    medium: [
      {
        content: "A company wants to ensure their Azure resources are grouped and managed consistently across multiple subscriptions. Which Azure feature should they use?",
        options: [
          { key: "A", text: "Resource Groups" },
          { key: "B", text: "Azure Policy" },
          { key: "C", text: "Management Groups" },
          { key: "D", text: "Azure Blueprints" },
        ],
        correctAnswer: "C",
        explanation: "Management Groups allow you to organize subscriptions into a hierarchy and apply governance policies across multiple subscriptions efficiently. They sit above the subscription level in the Azure hierarchy.",
        topic: "Azure Management Tools",
        difficulty: "medium",
      },
      {
        content: "Contoso Ltd needs to migrate their on-premises Active Directory to the cloud while maintaining compatibility with existing applications. Which Azure service meets this requirement?",
        options: [
          { key: "A", text: "Azure Active Directory (Entra ID)" },
          { key: "B", text: "Azure Active Directory Domain Services (Entra Domain Services)" },
          { key: "C", text: "Azure AD B2C" },
          { key: "D", text: "Azure AD B2B" },
        ],
        correctAnswer: "B",
        explanation: "Azure AD Domain Services (now Entra Domain Services) provides managed domain services like domain join, Group Policy, LDAP, and Kerberos/NTLM authentication — compatible with on-premises AD without needing to deploy domain controllers in the cloud.",
        topic: "Azure Security",
        difficulty: "medium",
      },
    ],
    hard: [
      {
        content: "A global e-commerce company needs a database solution that guarantees single-digit millisecond latency for reads and writes, supports multiple consistency models, and replicates data across 5 geographic regions. Which Azure service best meets ALL these requirements?",
        options: [
          { key: "A", text: "Azure SQL Database with geo-replication" },
          { key: "B", text: "Azure Cosmos DB" },
          { key: "C", text: "Azure Cache for Redis" },
          { key: "D", text: "Azure Database for PostgreSQL - Hyperscale" },
        ],
        correctAnswer: "B",
        explanation: "Azure Cosmos DB is Azure's globally distributed, multi-model database service designed for single-digit millisecond response times. It natively supports multi-region writes, offers five consistency levels (from Strong to Eventual), and automatically replicates data to any number of Azure regions.",
        topic: "Azure Services",
        difficulty: "hard",
      },
    ],
  },
  "AZ-104": {
    easy: [
      {
        content: "What is the maximum number of virtual machines that can be part of a single Availability Set in Azure?",
        options: [
          { key: "A", text: "10" },
          { key: "B", text: "100" },
          { key: "C", text: "200" },
          { key: "D", text: "Unlimited" },
        ],
        correctAnswer: "C",
        explanation: "An Availability Set can contain up to 200 virtual machines. It distributes VMs across up to 20 update domains and 3 fault domains to protect against hardware failures and planned maintenance.",
        topic: "Compute Resources",
        difficulty: "easy",
      },
    ],
    medium: [
      {
        content: "An administrator needs to ensure that all Azure VMs in a subscription use a specific VM size and are tagged with a cost-center. Which approach is MOST efficient?",
        options: [
          { key: "A", text: "Create a custom Azure Policy and assign it at the subscription scope" },
          { key: "B", text: "Manually configure each VM after deployment" },
          { key: "C", text: "Use Azure Advisor recommendations" },
          { key: "D", text: "Configure tags in the Azure Portal for each resource group" },
        ],
        correctAnswer: "A",
        explanation: "Azure Policy allows you to create rules that enforce specific configurations (like VM size restrictions and required tags) and apply them at scale across subscriptions, resource groups, or individual resources — making it the most efficient governance tool.",
        topic: "Identity & Governance",
        difficulty: "medium",
      },
    ],
    hard: [
      {
        content: "A company has a hub-and-spoke network topology in Azure. The hub VNet contains a Network Virtual Appliance (NVA) used as a firewall. Spoke VNets need to route all internet-bound traffic through this NVA. After configuring VNet peering, spoke VMs still bypass the NVA. What must be configured?",
        options: [
          { key: "A", text: "Enable gateway transit on the spoke VNets" },
          { key: "B", text: "Create a User-Defined Route (UDR) in spoke VNets with a default route pointing to the NVA's private IP" },
          { key: "C", text: "Enable IP forwarding on the spoke VNet's peering connection" },
          { key: "D", text: "Configure a Network Security Group on the hub VNet" },
        ],
        correctAnswer: "B",
        explanation: "User-Defined Routes (UDRs) override Azure's default system routes. By creating a route table with a 0.0.0.0/0 route pointing to the NVA's private IP and associating it with spoke subnets, all internet-bound traffic is forced through the NVA firewall.",
        topic: "Virtual Networking",
        difficulty: "hard",
      },
    ],
  },
  "AZ-305": {
    easy: [
      {
        content: "Which Azure service provides a managed Kubernetes environment for deploying containerized applications?",
        options: [
          { key: "A", text: "Azure Container Instances (ACI)" },
          { key: "B", text: "Azure Kubernetes Service (AKS)" },
          { key: "C", text: "Azure Service Fabric" },
          { key: "D", text: "Azure App Service" },
        ],
        correctAnswer: "B",
        explanation: "Azure Kubernetes Service (AKS) is a fully managed Kubernetes orchestration service that simplifies deploying, managing, and scaling containerized applications using Kubernetes.",
        topic: "Infrastructure Design",
        difficulty: "easy",
      },
    ],
    medium: [
      {
        content: "A solutions architect is designing a multi-tier application where the middle tier processes sensitive financial data. The solution must prevent the middle tier VMs from having direct internet access while still being able to call external APIs. Which design is MOST appropriate?",
        options: [
          { key: "A", text: "Place the middle tier VMs in a public subnet and use NSGs to restrict inbound traffic" },
          { key: "B", text: "Place the middle tier VMs in a private subnet and route outbound traffic through an Azure NAT Gateway" },
          { key: "C", text: "Use Azure Private Link for all external API calls" },
          { key: "D", text: "Configure the middle tier VMs without public IPs and use Azure Bastion for management" },
        ],
        correctAnswer: "B",
        explanation: "Placing VMs in a private subnet (no public IP) and using Azure NAT Gateway allows outbound internet connectivity for API calls while completely blocking unsolicited inbound internet traffic — providing the right security posture for sensitive workloads.",
        topic: "Networking Solutions",
        difficulty: "medium",
      },
    ],
    hard: [
      {
        content: "A financial institution requires a disaster recovery solution for their Azure SQL Database with an RPO of 1 hour and an RTO of 30 minutes. The solution must automatically failover without manual intervention. Which combination of services and features achieves these requirements?",
        options: [
          { key: "A", text: "Azure SQL Database with point-in-time restore and manual failover scripts" },
          { key: "B", text: "Azure SQL Database Auto-failover group with a secondary in another region and Azure Traffic Manager" },
          { key: "C", text: "Azure SQL Database geo-replication with a read replica and Azure Front Door" },
          { key: "D", text: "Azure SQL Managed Instance with Business Continuity Group and zone redundancy" },
        ],
        correctAnswer: "B",
        explanation: "Auto-failover groups provide automatic, transparent failover with near-zero RPO (continuous replication) and support for custom RTO policies. Combined with Azure Traffic Manager for automatic DNS failover of application endpoints, this meets both the RPO and RTO requirements without manual intervention.",
        topic: "Business Continuity",
        difficulty: "hard",
      },
    ],
  },
};

function getQuestionsForExam(certCode: string, difficulty: string, count: number): any[] {
  const certQuestions = SEED_QUESTIONS[certCode] ?? SEED_QUESTIONS["AZ-900"];
  let pool: any[] = [];

  if (difficulty === "mixed") {
    pool = [
      ...(certQuestions.easy ?? []),
      ...(certQuestions.medium ?? []),
      ...(certQuestions.hard ?? []),
    ];
  } else {
    pool = certQuestions[difficulty] ?? certQuestions.easy ?? [];
    if (pool.length < count) {
      const other = Object.values(certQuestions).flat().filter(q => q.difficulty !== difficulty);
      pool = [...pool, ...other];
    }
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map((q) => ({
    id: randomUUID(),
    ...q,
    isAiGenerated: false,
    validationScore: 1.0,
  }));
}

function getTimeLimit(certCode: string, questionCount: number, mode: string): number {
  if (mode === "practice") return 0;
  const base = certCode === "AZ-900" ? 45 : certCode === "AZ-104" ? 115 : 120;
  return Math.max(base, Math.round((questionCount / 60) * base));
}

router.post("/exams/configure", async (req, res) => {
  const { certificationCode, mode, difficulty, questionCount } = req.body;

  if (!certificationCode || !mode || !difficulty || !questionCount) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const questions = getQuestionsForExam(certificationCode, difficulty, questionCount);
  const timeLimitMinutes = getTimeLimit(certificationCode, questionCount, mode);
  const sessionId = randomUUID();

  const sessionData = {
    id: sessionId,
    certificationCode,
    mode,
    difficulty,
    questionCount: questions.length,
    timeLimitMinutes,
    questions,
    createdAt: new Date().toISOString(),
  };

  await db.insert(examSessionsTable).values({
    id: sessionId,
    certificationCode,
    mode,
    difficulty,
    questionCount: questions.length,
    timeLimitMinutes,
    questions,
    createdAt: new Date(),
  });

  res.json(sessionData);
});

router.get("/exams/sessions/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  const sessions = await db.select().from(examSessionsTable).where(eq(examSessionsTable.id, sessionId));

  if (sessions.length === 0) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const session = sessions[0];
  res.json({
    sessionId: session.id,
    certificationCode: session.certificationCode,
    mode: session.mode,
    difficulty: session.difficulty,
    questionCount: session.questionCount,
    timeLimitMinutes: session.timeLimitMinutes,
    questions: session.questions,
    createdAt: session.createdAt?.toISOString(),
  });
});

router.post("/exams/sessions/:sessionId/submit", async (req, res) => {
  const { sessionId } = req.params;
  const { answers, timeSpentSeconds } = req.body;

  const sessions = await db.select().from(examSessionsTable).where(eq(examSessionsTable.id, sessionId));
  if (sessions.length === 0) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const session = sessions[0];
  const questions = session.questions as any[];

  const questionResults = questions.map((q) => ({
    questionId: q.id,
    correct: answers[q.id] === q.correctAnswer,
    userAnswer: answers[q.id] ?? "",
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    topic: q.topic,
  }));

  const correctCount = questionResults.filter((r) => r.correct).length;
  const totalCount = questions.length;
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const passingScore = session.certificationCode === "AZ-900" ? 70 : 70;
  const passed = score >= passingScore;

  const topicMap: Record<string, { correct: number; total: number }> = {};
  for (const r of questionResults) {
    if (!topicMap[r.topic]) topicMap[r.topic] = { correct: 0, total: 0 };
    topicMap[r.topic].total++;
    if (r.correct) topicMap[r.topic].correct++;
  }

  const topicBreakdown = Object.entries(topicMap).map(([topic, data]) => ({
    topic,
    correct: data.correct,
    total: data.total,
    percentage: Math.round((data.correct / data.total) * 100),
  }));

  const attemptId = randomUUID();

  await db.insert(examAttemptsTable).values({
    id: attemptId,
    sessionId,
    certificationCode: session.certificationCode,
    mode: session.mode,
    score,
    passed,
    correctCount,
    totalCount,
    timeSpentSeconds: timeSpentSeconds ?? 0,
    answers,
    questionResults,
    topicBreakdown,
    aiAnalysis: null,
    completedAt: new Date(),
  });

  res.json({
    attemptId,
    score,
    passed,
    correctCount,
    totalCount,
    timeSpentSeconds: timeSpentSeconds ?? 0,
    questionResults,
    topicBreakdown,
  });
});

export default router;
