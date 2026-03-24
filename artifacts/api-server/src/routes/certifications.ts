import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";

const router: IRouter = Router();

const CERTIFICATIONS = [
  {
    id: "az-900",
    code: "AZ-900",
    name: "Azure Fundamentals",
    description: "Prove your foundational knowledge of cloud concepts and Azure services. Ideal for beginners and non-technical roles.",
    level: "Fundamentals",
    iconColor: "#0078d4",
    topicAreas: [
      "Cloud Concepts",
      "Azure Architecture",
      "Azure Services",
      "Azure Management Tools",
      "Azure Security",
      "Privacy & Compliance",
      "Pricing & Support",
    ],
  },
  {
    id: "az-104",
    code: "AZ-104",
    name: "Azure Administrator",
    description: "Demonstrate your skills in implementing, managing, and monitoring Azure environments for enterprises.",
    level: "Associate",
    iconColor: "#107c10",
    topicAreas: [
      "Identity & Governance",
      "Storage",
      "Compute Resources",
      "Virtual Networking",
      "Monitoring & Backup",
    ],
  },
  {
    id: "az-305",
    code: "AZ-305",
    name: "Azure Solutions Architect",
    description: "Validate your expertise in designing cloud and hybrid solutions. The most advanced Azure architect certification.",
    level: "Expert",
    iconColor: "#5c2d91",
    topicAreas: [
      "Identity & Access",
      "Data Storage",
      "Business Continuity",
      "Infrastructure Design",
      "Migration Strategies",
      "Networking Solutions",
      "Application Architecture",
    ],
  },
];

router.get("/exams/certifications", (_req, res) => {
  res.json(CERTIFICATIONS);
});

export default router;
export { CERTIFICATIONS };
