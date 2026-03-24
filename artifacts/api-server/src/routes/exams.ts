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
        options: [{ key: "A", text: "Public cloud" }, { key: "B", text: "Private cloud" }, { key: "C", text: "Hybrid cloud" }, { key: "D", text: "Community cloud" }],
        correctAnswer: "B",
        explanation: "A private cloud gives organizations the most control and customization because the infrastructure is dedicated to a single organization.",
        topic: "Cloud Concepts", difficulty: "easy",
      },
      {
        content: "What is the primary benefit of using the Azure pay-as-you-go pricing model?",
        options: [{ key: "A", text: "You pay a fixed monthly fee regardless of usage" }, { key: "B", text: "You only pay for what you actually use" }, { key: "C", text: "You get unlimited storage at no additional cost" }, { key: "D", text: "You receive a perpetual license for all Azure services" }],
        correctAnswer: "B",
        explanation: "The pay-as-you-go model means you are charged only for the resources you consume, making it cost-effective and flexible.",
        topic: "Pricing & Support", difficulty: "easy",
      },
      {
        content: "Which Azure service provides a managed relational database with automatic backups, high availability, and scaling?",
        options: [{ key: "A", text: "Azure Blob Storage" }, { key: "B", text: "Azure Cosmos DB" }, { key: "C", text: "Azure SQL Database" }, { key: "D", text: "Azure Table Storage" }],
        correctAnswer: "C",
        explanation: "Azure SQL Database is a fully managed relational database service built on SQL Server that includes automatic backups and high availability.",
        topic: "Azure Services", difficulty: "easy",
      },
      {
        content: "What does IaaS stand for in cloud computing?",
        options: [{ key: "A", text: "Internet as a Service" }, { key: "B", text: "Infrastructure as a Service" }, { key: "C", text: "Integration as a Service" }, { key: "D", text: "Intelligence as a Service" }],
        correctAnswer: "B",
        explanation: "IaaS (Infrastructure as a Service) provides virtualized computing resources over the internet, including VMs, storage, and networking.",
        topic: "Cloud Concepts", difficulty: "easy",
      },
      {
        content: "Which Azure service is used to store unstructured data such as images, videos, and documents?",
        options: [{ key: "A", text: "Azure SQL Database" }, { key: "B", text: "Azure Blob Storage" }, { key: "C", text: "Azure Queue Storage" }, { key: "D", text: "Azure File Storage" }],
        correctAnswer: "B",
        explanation: "Azure Blob Storage is optimized for storing massive amounts of unstructured data like images, videos, documents, and backups.",
        topic: "Azure Services", difficulty: "easy",
      },
      {
        content: "What is an Azure Region?",
        options: [{ key: "A", text: "A single data center" }, { key: "B", text: "A collection of data centers in a specific geographic area" }, { key: "C", text: "A virtual network boundary" }, { key: "D", text: "A subscription management unit" }],
        correctAnswer: "B",
        explanation: "An Azure Region is a geographic area containing one or more data centers that are connected with a low-latency network.",
        topic: "Cloud Concepts", difficulty: "easy",
      },
      {
        content: "Which cloud service model gives the vendor the most responsibility for managing the underlying infrastructure?",
        options: [{ key: "A", text: "IaaS" }, { key: "B", text: "PaaS" }, { key: "C", text: "SaaS" }, { key: "D", text: "On-premises" }],
        correctAnswer: "C",
        explanation: "In SaaS (Software as a Service), the vendor manages everything: infrastructure, platform, middleware, and the application itself. The customer only manages their data and user access.",
        topic: "Cloud Concepts", difficulty: "easy",
      },
      {
        content: "What is the purpose of the Azure Free Account?",
        options: [{ key: "A", text: "To provide unlimited access to all Azure services forever" }, { key: "B", text: "To give new users free credits and access to popular services for 12 months" }, { key: "C", text: "To provide a permanent free tier with no expiration" }, { key: "D", text: "To allow businesses to use Azure without a credit card" }],
        correctAnswer: "B",
        explanation: "The Azure Free Account gives new users $200 in credits for 30 days, 12 months of free popular services, and always-free services after that.",
        topic: "Pricing & Support", difficulty: "easy",
      },
      {
        content: "Which Azure tool helps you estimate the cost of Azure services before deployment?",
        options: [{ key: "A", text: "Azure Cost Management" }, { key: "B", text: "Azure Advisor" }, { key: "C", text: "Azure Pricing Calculator" }, { key: "D", text: "Azure Monitor" }],
        correctAnswer: "C",
        explanation: "The Azure Pricing Calculator allows you to configure and estimate costs for Azure products and services before you deploy them.",
        topic: "Pricing & Support", difficulty: "easy",
      },
      {
        content: "What is an Azure Availability Zone?",
        options: [{ key: "A", text: "A paired region for disaster recovery" }, { key: "B", text: "A physically separate data center within an Azure region" }, { key: "C", text: "A virtual machine placement group" }, { key: "D", text: "A geographic boundary for compliance" }],
        correctAnswer: "B",
        explanation: "Availability Zones are physically separate data centers within an Azure region, each with independent power, cooling, and networking to protect against data center failures.",
        topic: "Cloud Concepts", difficulty: "easy",
      },
      {
        content: "Which Azure service provides DNS hosting for your domain names?",
        options: [{ key: "A", text: "Azure Traffic Manager" }, { key: "B", text: "Azure DNS" }, { key: "C", text: "Azure CDN" }, { key: "D", text: "Azure Front Door" }],
        correctAnswer: "B",
        explanation: "Azure DNS allows you to host your DNS domains in Azure infrastructure, providing high availability and fast name resolution.",
        topic: "Azure Services", difficulty: "easy",
      },
      {
        content: "What is the Azure portal?",
        options: [{ key: "A", text: "A command-line interface for managing Azure resources" }, { key: "B", text: "A web-based unified console for managing Azure services" }, { key: "C", text: "A mobile app for monitoring Azure costs" }, { key: "D", text: "An IDE for developing Azure applications" }],
        correctAnswer: "B",
        explanation: "The Azure portal is a web-based, unified console that provides an alternative to command-line tools for managing Azure resources through a graphical interface.",
        topic: "Azure Management Tools", difficulty: "easy",
      },
      {
        content: "Which of the following is an example of a SaaS product from Microsoft?",
        options: [{ key: "A", text: "Azure Virtual Machines" }, { key: "B", text: "Azure App Service" }, { key: "C", text: "Microsoft 365 (Office 365)" }, { key: "D", text: "Azure Kubernetes Service" }],
        correctAnswer: "C",
        explanation: "Microsoft 365 is a SaaS product where Microsoft manages everything including the application, and users access Word, Excel, Outlook, and other apps over the internet.",
        topic: "Cloud Concepts", difficulty: "easy",
      },
      {
        content: "What does Azure Resource Manager (ARM) provide?",
        options: [{ key: "A", text: "A virtual machine management service" }, { key: "B", text: "A deployment and management service for Azure resources" }, { key: "C", text: "A monitoring solution for Azure workloads" }, { key: "D", text: "A security scanning service" }],
        correctAnswer: "B",
        explanation: "Azure Resource Manager is the deployment and management layer for Azure that enables you to create, update, and delete resources using templates, RBAC, and tags.",
        topic: "Azure Management Tools", difficulty: "easy",
      },
      {
        content: "Which Azure service would you use to send email notifications from an application?",
        options: [{ key: "A", text: "Azure Service Bus" }, { key: "B", text: "Azure Event Grid" }, { key: "C", text: "Azure Communication Services" }, { key: "D", text: "Azure Logic Apps" }],
        correctAnswer: "C",
        explanation: "Azure Communication Services provides communication capabilities including email, SMS, voice, and video calling that can be embedded in applications.",
        topic: "Azure Services", difficulty: "easy",
      },
      {
        content: "What is the concept of 'elasticity' in cloud computing?",
        options: [{ key: "A", text: "The ability to recover quickly from failures" }, { key: "B", text: "The ability to automatically scale resources up or down based on demand" }, { key: "C", text: "The ability to distribute workloads across multiple regions" }, { key: "D", text: "The ability to migrate workloads between cloud providers" }],
        correctAnswer: "B",
        explanation: "Elasticity refers to the ability to dynamically acquire and release resources to match workload demand, scaling out during peak times and scaling in when demand drops.",
        topic: "Cloud Concepts", difficulty: "easy",
      },
      {
        content: "Which Azure service is used to create and manage virtual networks?",
        options: [{ key: "A", text: "Azure ExpressRoute" }, { key: "B", text: "Azure Virtual Network (VNet)" }, { key: "C", text: "Azure Load Balancer" }, { key: "D", text: "Azure Firewall" }],
        correctAnswer: "B",
        explanation: "Azure Virtual Network (VNet) enables Azure resources to securely communicate with each other, the internet, and on-premises networks.",
        topic: "Azure Services", difficulty: "easy",
      },
      {
        content: "What is 'high availability' in the context of cloud services?",
        options: [{ key: "A", text: "Services that are accessible globally with low latency" }, { key: "B", text: "Services designed to remain operational and minimize downtime" }, { key: "C", text: "Services that automatically reduce costs during low usage" }, { key: "D", text: "Services that scale to handle peak workloads" }],
        correctAnswer: "B",
        explanation: "High availability ensures that services remain operational and accessible with minimal downtime, typically expressed as a percentage uptime SLA (e.g., 99.9%).",
        topic: "Cloud Concepts", difficulty: "easy",
      },
      {
        content: "Which Azure service provides a serverless computing option for running code without managing servers?",
        options: [{ key: "A", text: "Azure Virtual Machines" }, { key: "B", text: "Azure Container Instances" }, { key: "C", text: "Azure Functions" }, { key: "D", text: "Azure App Service" }],
        correctAnswer: "C",
        explanation: "Azure Functions is a serverless compute service that lets you run event-driven code without provisioning or managing infrastructure.",
        topic: "Azure Services", difficulty: "easy",
      },
      {
        content: "What is the primary purpose of Azure Active Directory (Microsoft Entra ID)?",
        options: [{ key: "A", text: "To manage on-premises server infrastructure" }, { key: "B", text: "To provide cloud-based identity and access management" }, { key: "C", text: "To monitor Azure resource performance" }, { key: "D", text: "To deploy virtual machines" }],
        correctAnswer: "B",
        explanation: "Microsoft Entra ID (formerly Azure AD) is a cloud-based identity and access management service that helps employees sign in and access resources.",
        topic: "Azure Security", difficulty: "easy",
      },
    ],
    medium: [
      {
        content: "A company wants to ensure their Azure resources are grouped and managed consistently across multiple subscriptions. Which Azure feature should they use?",
        options: [{ key: "A", text: "Resource Groups" }, { key: "B", text: "Azure Policy" }, { key: "C", text: "Management Groups" }, { key: "D", text: "Azure Blueprints" }],
        correctAnswer: "C",
        explanation: "Management Groups allow you to organize subscriptions into a hierarchy and apply governance policies across multiple subscriptions efficiently.",
        topic: "Azure Management Tools", difficulty: "medium",
      },
      {
        content: "Contoso Ltd needs to migrate their on-premises Active Directory to the cloud while maintaining compatibility with existing applications. Which Azure service meets this requirement?",
        options: [{ key: "A", text: "Azure Active Directory (Entra ID)" }, { key: "B", text: "Azure Active Directory Domain Services (Entra Domain Services)" }, { key: "C", text: "Azure AD B2C" }, { key: "D", text: "Azure AD B2B" }],
        correctAnswer: "B",
        explanation: "Azure AD Domain Services provides managed domain services like domain join, Group Policy, LDAP, and Kerberos/NTLM authentication, compatible with on-premises AD.",
        topic: "Azure Security", difficulty: "medium",
      },
      {
        content: "A company needs to protect their Azure workloads against DDoS attacks. Which service should they use?",
        options: [{ key: "A", text: "Azure Firewall" }, { key: "B", text: "Azure DDoS Protection" }, { key: "C", text: "Network Security Groups" }, { key: "D", text: "Azure Bastion" }],
        correctAnswer: "B",
        explanation: "Azure DDoS Protection provides enhanced DDoS mitigation features against volumetric, protocol, and resource layer attacks for Azure resources.",
        topic: "Azure Security", difficulty: "medium",
      },
      {
        content: "Which Azure service allows you to run containerized applications without managing the underlying infrastructure?",
        options: [{ key: "A", text: "Azure Virtual Machines" }, { key: "B", text: "Azure Container Instances" }, { key: "C", text: "Azure Kubernetes Service" }, { key: "D", text: "Azure App Service" }],
        correctAnswer: "B",
        explanation: "Azure Container Instances (ACI) allows you to run containers on demand without managing VMs or orchestration infrastructure.",
        topic: "Azure Services", difficulty: "medium",
      },
      {
        content: "What is the SLA for Azure Virtual Machines deployed with Availability Zones?",
        options: [{ key: "A", text: "99.9%" }, { key: "B", text: "99.95%" }, { key: "C", text: "99.99%" }, { key: "D", text: "100%" }],
        correctAnswer: "C",
        explanation: "Azure guarantees 99.99% uptime for VMs deployed across two or more Availability Zones in the same region.",
        topic: "Pricing & Support", difficulty: "medium",
      },
      {
        content: "A company wants to reduce costs by reserving Azure VM capacity for 1 or 3 years. What should they use?",
        options: [{ key: "A", text: "Spot VMs" }, { key: "B", text: "Azure Reserved VM Instances" }, { key: "C", text: "Azure Savings Plans" }, { key: "D", text: "Pay-as-you-go VMs" }],
        correctAnswer: "B",
        explanation: "Azure Reserved VM Instances provide significant cost savings (up to 72%) compared to pay-as-you-go when you commit to 1 or 3 year terms.",
        topic: "Pricing & Support", difficulty: "medium",
      },
      {
        content: "Which Azure service provides a unified security management system that strengthens the security posture of data centers?",
        options: [{ key: "A", text: "Azure Sentinel" }, { key: "B", text: "Microsoft Defender for Cloud" }, { key: "C", text: "Azure Key Vault" }, { key: "D", text: "Azure Monitor" }],
        correctAnswer: "B",
        explanation: "Microsoft Defender for Cloud (formerly Azure Security Center) provides unified security management, threat protection, and security posture assessment across Azure and hybrid environments.",
        topic: "Azure Security", difficulty: "medium",
      },
      {
        content: "A business needs to connect their on-premises network to Azure with a dedicated private connection (not over the public internet). Which service should they use?",
        options: [{ key: "A", text: "Azure VPN Gateway" }, { key: "B", text: "Azure ExpressRoute" }, { key: "C", text: "Azure Virtual WAN" }, { key: "D", text: "Azure Bastion" }],
        correctAnswer: "B",
        explanation: "Azure ExpressRoute provides a private, dedicated connection between on-premises networks and Azure, bypassing the public internet for greater reliability, speed, and security.",
        topic: "Azure Services", difficulty: "medium",
      },
      {
        content: "Which Azure tool provides personalized recommendations to help optimize Azure resources for reliability, security, performance, and cost?",
        options: [{ key: "A", text: "Azure Monitor" }, { key: "B", text: "Azure Policy" }, { key: "C", text: "Azure Advisor" }, { key: "D", text: "Azure Cost Management" }],
        correctAnswer: "C",
        explanation: "Azure Advisor analyzes your resource configurations and usage telemetry to provide personalized best practice recommendations across reliability, security, performance, cost, and operational excellence.",
        topic: "Azure Management Tools", difficulty: "medium",
      },
      {
        content: "What is the purpose of Azure Key Vault?",
        options: [{ key: "A", text: "To manage user authentication" }, { key: "B", text: "To securely store and manage secrets, keys, and certificates" }, { key: "C", text: "To encrypt virtual machine disks" }, { key: "D", text: "To manage network security groups" }],
        correctAnswer: "B",
        explanation: "Azure Key Vault is a cloud service for securely storing and accessing secrets (API keys, passwords), cryptographic keys, and SSL/TLS certificates.",
        topic: "Azure Security", difficulty: "medium",
      },
      {
        content: "Which Azure service is best suited for building event-driven microservices architectures using message queuing?",
        options: [{ key: "A", text: "Azure Event Grid" }, { key: "B", text: "Azure Service Bus" }, { key: "C", text: "Azure Notification Hubs" }, { key: "D", text: "Azure SignalR Service" }],
        correctAnswer: "B",
        explanation: "Azure Service Bus is a fully managed enterprise message broker with queues and topics for reliable, ordered, asynchronous messaging between decoupled services.",
        topic: "Azure Services", difficulty: "medium",
      },
      {
        content: "What is the difference between Capital Expenditure (CapEx) and Operational Expenditure (OpEx) in cloud computing?",
        options: [{ key: "A", text: "CapEx is cloud costs; OpEx is on-premises costs" }, { key: "B", text: "CapEx is upfront infrastructure investment; OpEx is ongoing service costs" }, { key: "C", text: "CapEx is for hardware; OpEx is for software licenses only" }, { key: "D", text: "CapEx and OpEx are identical in cloud computing" }],
        correctAnswer: "B",
        explanation: "CapEx involves upfront spending on physical infrastructure. Cloud computing shifts spending to OpEx (pay-as-you-go), reducing upfront costs and aligning spending with actual usage.",
        topic: "Cloud Concepts", difficulty: "medium",
      },
      {
        content: "A company wants to host a globally distributed NoSQL database that scales automatically and provides guaranteed low-latency access. Which Azure service should they use?",
        options: [{ key: "A", text: "Azure SQL Database" }, { key: "B", text: "Azure Table Storage" }, { key: "C", text: "Azure Cosmos DB" }, { key: "D", text: "Azure Cache for Redis" }],
        correctAnswer: "C",
        explanation: "Azure Cosmos DB is a globally distributed, multi-model NoSQL database with single-digit millisecond latencies, automatic scaling, and multi-region replication.",
        topic: "Azure Services", difficulty: "medium",
      },
      {
        content: "Which Azure support plan provides 24/7 access to technical support via phone and email with a 1-hour response time for critical cases?",
        options: [{ key: "A", text: "Basic" }, { key: "B", text: "Developer" }, { key: "C", text: "Standard" }, { key: "D", text: "Professional Direct" }],
        correctAnswer: "C",
        explanation: "The Standard support plan provides 24/7 technical support, with 1-hour response for critical severity cases. Professional Direct offers faster response (15-min for critical cases).",
        topic: "Pricing & Support", difficulty: "medium",
      },
      {
        content: "What is the purpose of Azure Policy?",
        options: [{ key: "A", text: "To monitor application performance" }, { key: "B", text: "To enforce organizational standards and compliance on Azure resources" }, { key: "C", text: "To manage user permissions and roles" }, { key: "D", text: "To automate resource deployment" }],
        correctAnswer: "B",
        explanation: "Azure Policy allows organizations to create, assign, and manage policies that enforce rules over resources, ensuring compliance with corporate standards and service level agreements.",
        topic: "Azure Management Tools", difficulty: "medium",
      },
    ],
    hard: [
      {
        content: "A global e-commerce company needs a database with single-digit millisecond latency, multiple consistency models, and replication across 5 regions. Which Azure service best meets ALL these requirements?",
        options: [{ key: "A", text: "Azure SQL Database with geo-replication" }, { key: "B", text: "Azure Cosmos DB" }, { key: "C", text: "Azure Cache for Redis" }, { key: "D", text: "Azure Database for PostgreSQL - Hyperscale" }],
        correctAnswer: "B",
        explanation: "Azure Cosmos DB offers single-digit millisecond response times, five consistency levels, and native multi-region replication, making it the only service to meet all requirements simultaneously.",
        topic: "Azure Services", difficulty: "hard",
      },
      {
        content: "A company has resources in Azure, AWS, and on-premises. They need a single unified security posture view and threat detection. Which Microsoft service addresses this?",
        options: [{ key: "A", text: "Microsoft Defender for Cloud" }, { key: "B", text: "Azure Monitor" }, { key: "C", text: "Azure Sentinel only" }, { key: "D", text: "Azure Security Benchmark" }],
        correctAnswer: "A",
        explanation: "Microsoft Defender for Cloud provides unified security management and advanced threat protection across Azure, on-premises, and other clouds including AWS and GCP.",
        topic: "Azure Security", difficulty: "hard",
      },
      {
        content: "An organization needs to comply with data residency requirements ensuring no customer data leaves the EU. Which Azure feature guarantees this?",
        options: [{ key: "A", text: "Azure Policy with geographic location restrictions" }, { key: "B", text: "Azure regions with data residency commitments and paired region restrictions" }, { key: "C", text: "Azure Compliance Manager" }, { key: "D", text: "Azure Blueprints with location locks" }],
        correctAnswer: "B",
        explanation: "Azure regions within the EU have explicit data residency commitments ensuring customer data remains in-region, and geo-redundant storage pairs remain within EU regional boundaries.",
        topic: "Cloud Concepts", difficulty: "hard",
      },
      {
        content: "A company uses Azure Reserved Instances for their VMs. If the VM size they reserved is no longer available in the region, what happens?",
        options: [{ key: "A", text: "The reservation is automatically cancelled and refunded" }, { key: "B", text: "The reservation can be exchanged for another VM size or region" }, { key: "C", text: "The reservation continues to charge without any benefit" }, { key: "D", text: "Azure automatically migrates the VMs to available sizes" }],
        correctAnswer: "B",
        explanation: "Azure Reserved Instances support exchanges, allowing customers to swap their existing reservation for a different VM size, series, or region to adapt to changing needs.",
        topic: "Pricing & Support", difficulty: "hard",
      },
      {
        content: "An enterprise needs to implement Zero Trust security for their Azure environment. Which combination of services is MOST aligned with Zero Trust principles?",
        options: [{ key: "A", text: "Azure Firewall + VPN Gateway" }, { key: "B", text: "Microsoft Entra ID with Conditional Access + Microsoft Defender for Cloud + Azure Private Link" }, { key: "C", text: "Network Security Groups + Azure Bastion" }, { key: "D", text: "Azure DDoS Protection + Azure Monitor" }],
        correctAnswer: "B",
        explanation: "Zero Trust requires 'verify explicitly' (Conditional Access with MFA), 'use least privilege' (Entra ID RBAC), and 'assume breach' (Defender for Cloud + Private Link for network isolation).",
        topic: "Azure Security", difficulty: "hard",
      },
      {
        content: "A company needs to ensure their Azure deployment meets ISO 27001 compliance. Which Azure feature provides evidence of compliance for auditors?",
        options: [{ key: "A", text: "Azure Security Center recommendations" }, { key: "B", text: "Microsoft Service Trust Portal and Azure Compliance Manager" }, { key: "C", text: "Azure Policy compliance reports" }, { key: "D", text: "Azure Monitor audit logs" }],
        correctAnswer: "B",
        explanation: "The Microsoft Service Trust Portal provides audit reports, compliance guides, and trust documents for ISO 27001 and other standards. Compliance Manager provides actionable guidance for meeting compliance requirements.",
        topic: "Cloud Concepts", difficulty: "hard",
      },
      {
        content: "What is the shared responsibility model in cloud computing, and who is responsible for guest OS patching in IaaS?",
        options: [{ key: "A", text: "Microsoft is fully responsible for all patching in IaaS" }, { key: "B", text: "The customer is responsible for guest OS patching in IaaS" }, { key: "C", text: "Patching is handled automatically by Azure in IaaS" }, { key: "D", text: "Responsibility is shared equally between Microsoft and the customer" }],
        correctAnswer: "B",
        explanation: "In the shared responsibility model, IaaS customers are responsible for the guest OS, including patching and updates. Microsoft manages the physical infrastructure, hypervisor, and host OS.",
        topic: "Cloud Concepts", difficulty: "hard",
      },
    ],
  },
  "AZ-104": {
    easy: [
      {
        content: "What is the maximum number of virtual machines that can be part of a single Availability Set in Azure?",
        options: [{ key: "A", text: "10" }, { key: "B", text: "100" }, { key: "C", text: "200" }, { key: "D", text: "Unlimited" }],
        correctAnswer: "C",
        explanation: "An Availability Set can contain up to 200 virtual machines distributed across update domains and fault domains.",
        topic: "Compute Resources", difficulty: "easy",
      },
      {
        content: "Which Azure service allows you to back up Azure VMs with a centralized policy?",
        options: [{ key: "A", text: "Azure Site Recovery" }, { key: "B", text: "Azure Backup" }, { key: "C", text: "Azure Storage" }, { key: "D", text: "Azure Migrate" }],
        correctAnswer: "B",
        explanation: "Azure Backup is a scalable, cloud-based backup solution that protects Azure VMs, SQL databases, and other workloads with centralized management and policy-based scheduling.",
        topic: "Backup & Recovery", difficulty: "easy",
      },
      {
        content: "What PowerShell cmdlet is used to create a new Azure Resource Group?",
        options: [{ key: "A", text: "Add-AzResourceGroup" }, { key: "B", text: "New-AzResourceGroup" }, { key: "C", text: "Create-AzResourceGroup" }, { key: "D", text: "Set-AzResourceGroup" }],
        correctAnswer: "B",
        explanation: "New-AzResourceGroup is the PowerShell cmdlet used to create a new Azure Resource Group, specifying the name and location.",
        topic: "Azure Management Tools", difficulty: "easy",
      },
      {
        content: "Which storage redundancy option replicates data three times within a single data center?",
        options: [{ key: "A", text: "Zone-Redundant Storage (ZRS)" }, { key: "B", text: "Geo-Redundant Storage (GRS)" }, { key: "C", text: "Locally Redundant Storage (LRS)" }, { key: "D", text: "Geo-Zone-Redundant Storage (GZRS)" }],
        correctAnswer: "C",
        explanation: "Locally Redundant Storage (LRS) replicates data three times within a single physical location in the primary region — the lowest cost redundancy option.",
        topic: "Storage", difficulty: "easy",
      },
      {
        content: "What is the default retention period for activity logs in Azure Monitor?",
        options: [{ key: "A", text: "7 days" }, { key: "B", text: "30 days" }, { key: "C", text: "90 days" }, { key: "D", text: "1 year" }],
        correctAnswer: "C",
        explanation: "Azure Monitor retains activity logs for 90 days by default. For longer retention, you should send logs to a Log Analytics workspace or storage account.",
        topic: "Monitoring", difficulty: "easy",
      },
      {
        content: "Which Azure CLI command deploys resources from an ARM template file?",
        options: [{ key: "A", text: "az resource deploy" }, { key: "B", text: "az deployment group create" }, { key: "C", text: "az template deploy" }, { key: "D", text: "az group deploy" }],
        correctAnswer: "B",
        explanation: "The 'az deployment group create' command deploys resources defined in an ARM template to a specified resource group.",
        topic: "Azure Management Tools", difficulty: "easy",
      },
      {
        content: "What is the purpose of a Network Security Group (NSG) in Azure?",
        options: [{ key: "A", text: "To encrypt network traffic between VMs" }, { key: "B", text: "To filter network traffic to and from Azure resources" }, { key: "C", text: "To route traffic between virtual networks" }, { key: "D", text: "To monitor network performance" }],
        correctAnswer: "B",
        explanation: "NSGs contain security rules that allow or deny inbound and outbound network traffic to/from Azure resources based on protocol, port, and IP address.",
        topic: "Virtual Networking", difficulty: "easy",
      },
      {
        content: "What does RBAC stand for in Azure?",
        options: [{ key: "A", text: "Resource Based Access Control" }, { key: "B", text: "Role Based Access Control" }, { key: "C", text: "Rule Based Access Compliance" }, { key: "D", text: "Registered Bearer Authentication Certificate" }],
        correctAnswer: "B",
        explanation: "Role-Based Access Control (RBAC) is an authorization system built into Azure that provides fine-grained access management of Azure resources.",
        topic: "Identity & Governance", difficulty: "easy",
      },
      {
        content: "Which Azure VM size series is optimized for memory-intensive applications like databases?",
        options: [{ key: "A", text: "D-series" }, { key: "B", text: "F-series" }, { key: "C", text: "E-series" }, { key: "D", text: "B-series" }],
        correctAnswer: "C",
        explanation: "The E-series VMs are memory-optimized and ideal for memory-intensive workloads such as relational databases, large caches, and in-memory analytics.",
        topic: "Compute Resources", difficulty: "easy",
      },
      {
        content: "Which Azure service enables you to securely access Azure VMs without exposing them to the public internet via RDP/SSH?",
        options: [{ key: "A", text: "Azure VPN Gateway" }, { key: "B", text: "Azure Bastion" }, { key: "C", text: "Azure Firewall" }, { key: "D", text: "Just-in-Time VM Access" }],
        correctAnswer: "B",
        explanation: "Azure Bastion provides secure, seamless RDP/SSH connectivity to VMs directly through the Azure portal over TLS without needing a public IP on the VM.",
        topic: "Virtual Networking", difficulty: "easy",
      },
      {
        content: "What type of Azure storage is used for message queuing with up to 64 KB per message?",
        options: [{ key: "A", text: "Azure Blob Storage" }, { key: "B", text: "Azure Table Storage" }, { key: "C", text: "Azure Queue Storage" }, { key: "D", text: "Azure File Storage" }],
        correctAnswer: "C",
        explanation: "Azure Queue Storage is a service for storing large numbers of messages for asynchronous processing, with each message up to 64 KB in size.",
        topic: "Storage", difficulty: "easy",
      },
      {
        content: "Which built-in RBAC role allows a user to manage all resources in Azure but cannot grant access to others?",
        options: [{ key: "A", text: "Owner" }, { key: "B", text: "Contributor" }, { key: "C", text: "Reader" }, { key: "D", text: "User Access Administrator" }],
        correctAnswer: "B",
        explanation: "The Contributor role grants full access to manage all Azure resources but does not allow granting access to others (which requires the Owner role).",
        topic: "Identity & Governance", difficulty: "easy",
      },
      {
        content: "What is an Azure Managed Disk?",
        options: [{ key: "A", text: "A disk stored in Azure Blob Storage managed by the user" }, { key: "B", text: "A VM disk that is managed by Azure, abstracting storage account management" }, { key: "C", text: "An encrypted disk requiring customer-managed keys" }, { key: "D", text: "A shared disk accessible by multiple VMs simultaneously" }],
        correctAnswer: "B",
        explanation: "Azure Managed Disks are block-level storage volumes managed by Azure, abstracting away the complexity of managing storage accounts, providing better reliability and scaling.",
        topic: "Compute Resources", difficulty: "easy",
      },
      {
        content: "What is the purpose of Azure Tags?",
        options: [{ key: "A", text: "To define network security rules" }, { key: "B", text: "To organize resources with metadata key-value pairs for management and billing" }, { key: "C", text: "To set resource access permissions" }, { key: "D", text: "To configure VM startup scripts" }],
        correctAnswer: "B",
        explanation: "Azure Tags are name-value pairs applied to resources for organization, cost management, and automation — for example, tagging resources with environment=production or cost-center=finance.",
        topic: "Azure Management Tools", difficulty: "easy",
      },
      {
        content: "Which Azure storage tier is designed for data that is accessed frequently?",
        options: [{ key: "A", text: "Archive tier" }, { key: "B", text: "Cool tier" }, { key: "C", text: "Cold tier" }, { key: "D", text: "Hot tier" }],
        correctAnswer: "D",
        explanation: "The Hot access tier is optimized for data that is accessed frequently, with higher storage costs but lower access costs compared to Cool and Archive tiers.",
        topic: "Storage", difficulty: "easy",
      },
      {
        content: "What is the purpose of Azure Load Balancer?",
        options: [{ key: "A", text: "To route traffic globally based on geographic location" }, { key: "B", text: "To distribute incoming network traffic across multiple backend resources" }, { key: "C", text: "To cache content closer to users globally" }, { key: "D", text: "To provide SSL termination for web applications" }],
        correctAnswer: "B",
        explanation: "Azure Load Balancer distributes inbound traffic across healthy backend VMs using layer 4 (TCP/UDP) load balancing rules, providing high availability and scalability.",
        topic: "Virtual Networking", difficulty: "easy",
      },
      {
        content: "Which command-line tool is cross-platform and can be used to manage Azure resources on Windows, macOS, and Linux?",
        options: [{ key: "A", text: "Azure PowerShell only" }, { key: "B", text: "Azure Cloud Shell only" }, { key: "C", text: "Azure CLI (az)" }, { key: "D", text: "Windows Admin Center" }],
        correctAnswer: "C",
        explanation: "The Azure CLI is a cross-platform command-line tool that runs on Windows, macOS, and Linux, providing commands for managing Azure resources.",
        topic: "Azure Management Tools", difficulty: "easy",
      },
      {
        content: "What Azure feature allows you to automatically scale the number of VMs based on demand?",
        options: [{ key: "A", text: "Availability Sets" }, { key: "B", text: "Virtual Machine Scale Sets" }, { key: "C", text: "Azure Batch" }, { key: "D", text: "Azure App Service Plan" }],
        correctAnswer: "B",
        explanation: "Virtual Machine Scale Sets allow you to create and manage a group of identical VMs that automatically increase or decrease based on demand or a defined schedule.",
        topic: "Compute Resources", difficulty: "easy",
      },
      {
        content: "What is the primary purpose of Azure Monitor?",
        options: [{ key: "A", text: "To deploy Azure resources" }, { key: "B", text: "To collect, analyze, and act on telemetry data from Azure resources" }, { key: "C", text: "To manage Azure billing and costs" }, { key: "D", text: "To scan for security vulnerabilities" }],
        correctAnswer: "B",
        explanation: "Azure Monitor collects metrics, logs, and traces from Azure resources, providing insights, alerts, and dashboards to help you understand performance and diagnose issues.",
        topic: "Monitoring", difficulty: "easy",
      },
      {
        content: "How many fault domains does a standard Azure Availability Set support by default?",
        options: [{ key: "A", text: "1" }, { key: "B", text: "2" }, { key: "C", text: "3" }, { key: "D", text: "5" }],
        correctAnswer: "C",
        explanation: "Azure Availability Sets support up to 3 fault domains by default, ensuring VMs are distributed across separate physical racks to protect against hardware failures.",
        topic: "Compute Resources", difficulty: "easy",
      },
    ],
    medium: [
      {
        content: "An administrator needs to ensure all Azure VMs in a subscription use a specific VM size and are tagged with a cost-center. Which approach is MOST efficient?",
        options: [{ key: "A", text: "Create a custom Azure Policy and assign it at the subscription scope" }, { key: "B", text: "Manually configure each VM after deployment" }, { key: "C", text: "Use Azure Advisor recommendations" }, { key: "D", text: "Configure tags in the Azure Portal for each resource group" }],
        correctAnswer: "A",
        explanation: "Azure Policy allows you to create rules enforcing VM size restrictions and required tags, applied at scale across subscriptions.",
        topic: "Identity & Governance", difficulty: "medium",
      },
      {
        content: "A company needs to peer two Azure Virtual Networks in different regions. What is this called and what must be configured?",
        options: [{ key: "A", text: "Local VNet peering; no special configuration needed" }, { key: "B", text: "Global VNet peering; peering connections on both VNets with 'Allow forwarded traffic' enabled" }, { key: "C", text: "ExpressRoute peering; requires an ExpressRoute circuit" }, { key: "D", text: "VPN peering; requires VPN gateways in both VNets" }],
        correctAnswer: "B",
        explanation: "Global VNet peering connects VNets across Azure regions. You must configure peering on both VNets, and traffic passes through the Microsoft backbone network.",
        topic: "Virtual Networking", difficulty: "medium",
      },
      {
        content: "An admin wants to allow users to reset their own passwords without IT helpdesk involvement. Which feature should be enabled?",
        options: [{ key: "A", text: "Multi-Factor Authentication" }, { key: "B", text: "Self-Service Password Reset (SSPR)" }, { key: "C", text: "Azure AD Identity Protection" }, { key: "D", text: "Privileged Identity Management (PIM)" }],
        correctAnswer: "B",
        explanation: "Self-Service Password Reset (SSPR) allows users to reset their own passwords using verification methods like email or phone, reducing helpdesk load.",
        topic: "Identity & Governance", difficulty: "medium",
      },
      {
        content: "Which Azure storage feature provides immutable, time-limited access to a blob without sharing the storage account key?",
        options: [{ key: "A", text: "Access keys" }, { key: "B", text: "Azure AD authentication" }, { key: "C", text: "Shared Access Signatures (SAS)" }, { key: "D", text: "Stored Access Policies" }],
        correctAnswer: "C",
        explanation: "Shared Access Signatures (SAS) provide time-limited, permission-scoped access to storage resources without exposing the account key.",
        topic: "Storage", difficulty: "medium",
      },
      {
        content: "A company wants to monitor sign-in events and identify risky users in Azure AD. Which feature should they use?",
        options: [{ key: "A", text: "Azure Monitor" }, { key: "B", text: "Azure AD Identity Protection" }, { key: "C", text: "Microsoft Defender for Cloud" }, { key: "D", text: "Azure Sentinel" }],
        correctAnswer: "B",
        explanation: "Azure AD Identity Protection uses machine learning to detect suspicious sign-in activities and risky users, providing risk-based Conditional Access policies.",
        topic: "Identity & Governance", difficulty: "medium",
      },
      {
        content: "You need to deploy an ARM template that creates resources in multiple resource groups. Which deployment scope should you use?",
        options: [{ key: "A", text: "Resource group deployment" }, { key: "B", text: "Subscription-level deployment" }, { key: "C", text: "Management group deployment" }, { key: "D", text: "Tenant-level deployment" }],
        correctAnswer: "B",
        explanation: "Subscription-level deployments allow ARM templates to create or reference resources across multiple resource groups within the same subscription.",
        topic: "Azure Management Tools", difficulty: "medium",
      },
      {
        content: "What is the difference between Azure Disk Encryption and Server-Side Encryption for managed disks?",
        options: [{ key: "A", text: "They are identical and interchangeable" }, { key: "B", text: "Azure Disk Encryption encrypts the OS and data volumes at the guest VM level; Server-Side Encryption encrypts at the storage level" }, { key: "C", text: "Server-Side Encryption requires customer-managed keys; Azure Disk Encryption does not" }, { key: "D", text: "Azure Disk Encryption only works for Linux VMs" }],
        correctAnswer: "B",
        explanation: "Azure Disk Encryption (using BitLocker/DM-Crypt) encrypts VM disks at the guest level. Server-Side Encryption encrypts data at rest in Azure storage before writing to disk.",
        topic: "Storage", difficulty: "medium",
      },
      {
        content: "An organization has VMs in Resource Group A and wants a user to be able to restart them but not create or delete them. What is the MOST appropriate approach?",
        options: [{ key: "A", text: "Assign the Contributor role at the subscription level" }, { key: "B", text: "Assign the Virtual Machine Contributor role at Resource Group A scope" }, { key: "C", text: "Assign the Owner role at Resource Group A scope" }, { key: "D", text: "Create a custom role with restart permission and assign at Resource Group A scope" }],
        correctAnswer: "D",
        explanation: "A custom RBAC role with only Microsoft.Compute/virtualMachines/restart/action permission assigned at Resource Group A scope provides least-privilege access for restart-only.",
        topic: "Identity & Governance", difficulty: "medium",
      },
      {
        content: "Which Azure Monitor feature allows you to create alerts and send notifications when resource metrics exceed a threshold?",
        options: [{ key: "A", text: "Azure Monitor Workbooks" }, { key: "B", text: "Azure Monitor Alerts" }, { key: "C", text: "Azure Monitor Insights" }, { key: "D", text: "Azure Log Analytics" }],
        correctAnswer: "B",
        explanation: "Azure Monitor Alerts allows you to proactively identify issues by creating alert rules that trigger notifications via action groups when conditions are met.",
        topic: "Monitoring", difficulty: "medium",
      },
      {
        content: "A company needs to route all outbound internet traffic from their Azure VMs through a next-generation firewall. What Azure services accomplish this?",
        options: [{ key: "A", text: "Azure Load Balancer + NSG" }, { key: "B", text: "Azure Firewall or NVA + User-Defined Routes (UDR)" }, { key: "C", text: "Azure Application Gateway + WAF" }, { key: "D", text: "Azure DDoS Protection + Azure Bastion" }],
        correctAnswer: "B",
        explanation: "Routing outbound traffic through a firewall requires a UDR with a 0.0.0.0/0 route pointing to Azure Firewall or an NVA, forcing all traffic through the inspection appliance.",
        topic: "Virtual Networking", difficulty: "medium",
      },
      {
        content: "Which Azure Storage feature protects against accidental deletion by retaining deleted data for a configured period?",
        options: [{ key: "A", text: "Geo-redundant storage" }, { key: "B", text: "Azure Backup" }, { key: "C", text: "Soft delete" }, { key: "D", text: "Blob versioning" }],
        correctAnswer: "C",
        explanation: "Soft delete for blobs retains deleted blobs for a specified retention period (1-365 days), allowing recovery of accidentally deleted data.",
        topic: "Storage", difficulty: "medium",
      },
      {
        content: "What is Azure AD Conditional Access?",
        options: [{ key: "A", text: "A tool for resetting user passwords" }, { key: "B", text: "A policy engine that controls access to apps based on signals like user location, device, and risk" }, { key: "C", text: "A feature for syncing on-premises AD to Azure AD" }, { key: "D", text: "A multi-factor authentication app" }],
        correctAnswer: "B",
        explanation: "Conditional Access is an Entra ID feature that uses signals (user, location, device compliance, risk level) to make access control decisions — enforce MFA, block access, or require compliant devices.",
        topic: "Identity & Governance", difficulty: "medium",
      },
      {
        content: "A company is running Azure VMs and wants to collect performance metrics and logs in a central repository for analysis. Which service should they configure?",
        options: [{ key: "A", text: "Azure Security Center" }, { key: "B", text: "Azure Monitor with Log Analytics workspace" }, { key: "C", text: "Azure Advisor" }, { key: "D", text: "Microsoft Defender for Endpoint" }],
        correctAnswer: "B",
        explanation: "Azure Monitor with a Log Analytics workspace collects VM performance metrics and diagnostic logs, enabling powerful KQL queries and alert rules across all resources.",
        topic: "Monitoring", difficulty: "medium",
      },
      {
        content: "What is the difference between Azure Application Gateway and Azure Load Balancer?",
        options: [{ key: "A", text: "Application Gateway works at Layer 4 (TCP/UDP); Load Balancer works at Layer 7 (HTTP)" }, { key: "B", text: "Application Gateway is a Layer 7 web traffic load balancer with WAF; Load Balancer operates at Layer 4 (TCP/UDP)" }, { key: "C", text: "They provide identical functionality but Application Gateway is more expensive" }, { key: "D", text: "Load Balancer handles HTTPS; Application Gateway handles HTTP only" }],
        correctAnswer: "B",
        explanation: "Azure Application Gateway is a Layer 7 load balancer with URL-based routing, SSL termination, and WAF capability. Azure Load Balancer operates at Layer 4 for TCP/UDP traffic distribution.",
        topic: "Virtual Networking", difficulty: "medium",
      },
      {
        content: "Which tool allows you to analyze and remediate virtual machine compliance with update management policies?",
        options: [{ key: "A", text: "Azure Backup" }, { key: "B", text: "Azure Update Manager" }, { key: "C", text: "Azure Monitor" }, { key: "D", text: "Microsoft Endpoint Configuration Manager" }],
        correctAnswer: "B",
        explanation: "Azure Update Manager provides unified management of updates for Windows and Linux VMs, with compliance reporting and scheduled maintenance windows.",
        topic: "Compute Resources", difficulty: "medium",
      },
    ],
    hard: [
      {
        content: "A company has a hub-and-spoke network topology. The hub VNet contains an NVA used as a firewall. Spoke VNets need to route all internet-bound traffic through this NVA, but after configuring VNet peering, spoke VMs bypass the NVA. What must be configured?",
        options: [{ key: "A", text: "Enable gateway transit on the spoke VNets" }, { key: "B", text: "Create a User-Defined Route (UDR) in spoke VNets with a default route pointing to the NVA's private IP" }, { key: "C", text: "Enable IP forwarding on the spoke VNet's peering connection" }, { key: "D", text: "Configure a Network Security Group on the hub VNet" }],
        correctAnswer: "B",
        explanation: "UDRs override Azure's default system routes. A route table with 0.0.0.0/0 pointing to the NVA's private IP, associated with spoke subnets, forces all internet traffic through the NVA.",
        topic: "Virtual Networking", difficulty: "hard",
      },
      {
        content: "An admin deleted a critical Azure AD user account. The account needs to be restored with all group memberships intact. What is the recovery window and process?",
        options: [{ key: "A", text: "30 days; restore from the Azure AD Recycle Bin in the portal" }, { key: "B", text: "7 days; contact Microsoft Support for manual restoration" }, { key: "C", text: "Permanent deletion; only a new account can be created" }, { key: "D", text: "90 days; use Azure Backup to restore the account" }],
        correctAnswer: "A",
        explanation: "Deleted Azure AD users can be restored from the Deleted Users (Recycle Bin) within 30 days of deletion, restoring the account with all group memberships, licenses, and properties intact.",
        topic: "Identity & Governance", difficulty: "hard",
      },
      {
        content: "A company needs to migrate 500 TB of data from on-premises to Azure Blob Storage. The internet bandwidth is 100 Mbps shared with production traffic. What is the recommended migration approach?",
        options: [{ key: "A", text: "Use AzCopy over the existing internet connection during off-peak hours" }, { key: "B", text: "Use Azure Data Box to ship data physically and then use AzCopy for incremental sync" }, { key: "C", text: "Use Azure Migrate with online replication" }, { key: "D", text: "Use Azure Import/Export service with standard HDDs" }],
        correctAnswer: "B",
        explanation: "500 TB over 100 Mbps would take ~460 days. Azure Data Box (100TB capacity) provides physical data transfer. After delivery and import, AzCopy handles incremental changes during cutover.",
        topic: "Storage", difficulty: "hard",
      },
      {
        content: "You need to implement a solution where Azure VMs in a private VNet can access Azure Storage without traffic going over the internet. What should you configure?",
        options: [{ key: "A", text: "Azure Firewall with application rules for storage" }, { key: "B", text: "Private Endpoint for Azure Storage in the VNet" }, { key: "C", text: "Service Endpoint for Microsoft.Storage on the subnet" }, { key: "D", text: "VNet peering to the Azure Storage VNet" }],
        correctAnswer: "B",
        explanation: "Azure Private Endpoint creates a network interface in your VNet with a private IP for Azure Storage, ensuring traffic remains on the Microsoft backbone and never traverses the internet.",
        topic: "Virtual Networking", difficulty: "hard",
      },
      {
        content: "A company runs Azure VMs with Availability Zones enabled. During a planned maintenance event, they notice one zone's VMs are briefly unavailable. How does this affect their SLA?",
        options: [{ key: "A", text: "The SLA is voided entirely during any maintenance" }, { key: "B", text: "The 99.99% SLA is maintained because the application should remain available through the other zones" }, { key: "C", text: "Microsoft provides SLA credits automatically for all maintenance events" }, { key: "D", text: "Zone maintenance events do not affect VMs with managed disks" }],
        correctAnswer: "B",
        explanation: "The 99.99% SLA for zone-redundant VMs assumes applications are designed to tolerate zone failures. If the app continues serving requests from other zones, the SLA is maintained.",
        topic: "Compute Resources", difficulty: "hard",
      },
      {
        content: "An organization needs to implement Azure AD Privileged Identity Management (PIM). What is the primary security benefit of PIM?",
        options: [{ key: "A", text: "It provides permanent elevated access for all admins" }, { key: "B", text: "It provides just-in-time privileged access with approval workflows and time-bound role activation" }, { key: "C", text: "It replaces Multi-Factor Authentication for admin accounts" }, { key: "D", text: "It automatically removes inactive users from admin roles" }],
        correctAnswer: "B",
        explanation: "PIM enables just-in-time privileged access, requiring users to activate roles with justification and optional approval, with time-limited access to reduce standing privilege exposure.",
        topic: "Identity & Governance", difficulty: "hard",
      },
      {
        content: "A Log Analytics workspace contains 6 months of security logs. The security team needs to query logs older than 30 days but wants to minimize cost. What feature should be used?",
        options: [{ key: "A", text: "Archive tier in Log Analytics for logs older than 30 days" }, { key: "B", text: "Export old logs to Azure Storage and query with Azure Data Explorer" }, { key: "C", text: "Log Analytics long-term retention with interactive queries at a reduced rate" }, { key: "D", text: "Use Azure Monitor workbooks for historical data" }],
        correctAnswer: "A",
        explanation: "Log Analytics supports archive retention (up to 12 years) at lower cost. Archived logs are not interactive but can be restored temporarily for querying when needed.",
        topic: "Monitoring", difficulty: "hard",
      },
    ],
  },
  "AZ-305": {
    easy: [
      {
        content: "Which Azure service provides a managed Kubernetes environment for deploying containerized applications?",
        options: [{ key: "A", text: "Azure Container Instances (ACI)" }, { key: "B", text: "Azure Kubernetes Service (AKS)" }, { key: "C", text: "Azure Service Fabric" }, { key: "D", text: "Azure App Service" }],
        correctAnswer: "B",
        explanation: "Azure Kubernetes Service (AKS) is a fully managed Kubernetes orchestration service that simplifies deploying, managing, and scaling containerized applications.",
        topic: "Infrastructure Design", difficulty: "easy",
      },
      {
        content: "Which Azure service is the best choice for hosting a web application that requires automatic scaling and SSL management?",
        options: [{ key: "A", text: "Azure Virtual Machines" }, { key: "B", text: "Azure App Service" }, { key: "C", text: "Azure Container Instances" }, { key: "D", text: "Azure Batch" }],
        correctAnswer: "B",
        explanation: "Azure App Service is a PaaS offering for hosting web apps with built-in auto-scaling, SSL management, custom domains, and CI/CD integration.",
        topic: "Application Design", difficulty: "easy",
      },
      {
        content: "What is the purpose of Azure Front Door?",
        options: [{ key: "A", text: "To provide DDoS protection at the network layer" }, { key: "B", text: "To provide global HTTP load balancing, SSL termination, and WAF" }, { key: "C", text: "To connect on-premises networks to Azure" }, { key: "D", text: "To manage DNS records globally" }],
        correctAnswer: "B",
        explanation: "Azure Front Door is a global, scalable entry point that uses the Microsoft edge network to deliver fast, secure, and widely scalable web applications with built-in WAF.",
        topic: "Networking Solutions", difficulty: "easy",
      },
      {
        content: "Which Azure data service is best suited for a data warehouse that needs to run complex analytical queries on petabytes of data?",
        options: [{ key: "A", text: "Azure SQL Database" }, { key: "B", text: "Azure Synapse Analytics" }, { key: "C", text: "Azure Cosmos DB" }, { key: "D", text: "Azure Database for PostgreSQL" }],
        correctAnswer: "B",
        explanation: "Azure Synapse Analytics is a limitless analytics service combining enterprise data warehousing and big data analytics for running complex queries on petabyte-scale data.",
        topic: "Data Solutions", difficulty: "easy",
      },
      {
        content: "What does RTO stand for in disaster recovery planning?",
        options: [{ key: "A", text: "Recovery Time Objective — the maximum acceptable time to restore a service" }, { key: "B", text: "Recovery Time Operation — the actual time taken to recover" }, { key: "C", text: "Redundancy Tolerance Objective — the acceptable data loss duration" }, { key: "D", text: "Resource Transfer Objective — the time to transfer resources" }],
        correctAnswer: "A",
        explanation: "Recovery Time Objective (RTO) is the maximum acceptable length of time that a service can be offline after a failure — a key disaster recovery design parameter.",
        topic: "Business Continuity", difficulty: "easy",
      },
      {
        content: "Which Azure networking service acts as a global HTTP load balancer with SSL offload and URL-based routing?",
        options: [{ key: "A", text: "Azure Load Balancer" }, { key: "B", text: "Azure Application Gateway" }, { key: "C", text: "Azure Traffic Manager" }, { key: "D", text: "Azure Front Door" }],
        correctAnswer: "D",
        explanation: "Azure Front Door provides global HTTP load balancing with SSL termination and URL-based routing at the edge, while Application Gateway is regional.",
        topic: "Networking Solutions", difficulty: "easy",
      },
      {
        content: "What is RPO in the context of disaster recovery?",
        options: [{ key: "A", text: "The maximum time to restore a system after a failure" }, { key: "B", text: "The maximum acceptable amount of data loss measured in time" }, { key: "C", text: "The recovery point for database transactions" }, { key: "D", text: "The planned outage window for maintenance" }],
        correctAnswer: "B",
        explanation: "Recovery Point Objective (RPO) defines the maximum acceptable data loss measured in time — how old data can be at the time of recovery.",
        topic: "Business Continuity", difficulty: "easy",
      },
      {
        content: "Which Azure service enables you to connect multiple virtual networks and on-premises networks through a central hub?",
        options: [{ key: "A", text: "VNet Peering" }, { key: "B", text: "Azure Virtual WAN" }, { key: "C", text: "Azure ExpressRoute" }, { key: "D", text: "Azure VPN Gateway" }],
        correctAnswer: "B",
        explanation: "Azure Virtual WAN provides a unified networking hub connecting VNets, branch offices, and remote users through a single managed hub-and-spoke topology.",
        topic: "Networking Solutions", difficulty: "easy",
      },
      {
        content: "Which Azure service should an architect choose to implement a relational database with automatic failover and geo-replication?",
        options: [{ key: "A", text: "Azure Cosmos DB" }, { key: "B", text: "Azure SQL Database Business Critical tier" }, { key: "C", text: "Azure Database for MySQL" }, { key: "D", text: "Azure Synapse Analytics" }],
        correctAnswer: "B",
        explanation: "Azure SQL Database Business Critical tier provides built-in high availability with multiple replicas, auto-failover groups for geo-redundancy, and zone redundancy.",
        topic: "Data Solutions", difficulty: "easy",
      },
      {
        content: "What is the recommended Azure architecture pattern for applications that need to decouple producers from consumers?",
        options: [{ key: "A", text: "N-tier architecture" }, { key: "B", text: "Message-based architecture using Azure Service Bus or Event Hubs" }, { key: "C", text: "Monolithic architecture" }, { key: "D", text: "Client-server architecture" }],
        correctAnswer: "B",
        explanation: "Message-based architecture decouples producers and consumers through a message broker (Service Bus for commands, Event Hubs for streaming), improving scalability and resilience.",
        topic: "Application Design", difficulty: "easy",
      },
      {
        content: "Which Azure service provides a fully managed platform for running containerized microservices with built-in autoscaling and HTTPS ingress?",
        options: [{ key: "A", text: "Azure Kubernetes Service (AKS)" }, { key: "B", text: "Azure Container Apps" }, { key: "C", text: "Azure Container Instances" }, { key: "D", text: "Azure App Service" }],
        correctAnswer: "B",
        explanation: "Azure Container Apps is a serverless container platform built on Kubernetes that handles autoscaling, HTTPS ingress, and microservice communication without requiring Kubernetes management.",
        topic: "Application Design", difficulty: "easy",
      },
      {
        content: "An architect needs to store and retrieve large binary objects (images, videos) efficiently. Which Azure storage option is MOST appropriate?",
        options: [{ key: "A", text: "Azure Table Storage" }, { key: "B", text: "Azure File Storage" }, { key: "C", text: "Azure Blob Storage" }, { key: "D", text: "Azure Queue Storage" }],
        correctAnswer: "C",
        explanation: "Azure Blob Storage is optimized for storing massive amounts of unstructured binary data like images, videos, backups, and documents at scale.",
        topic: "Data Solutions", difficulty: "easy",
      },
      {
        content: "What is the primary purpose of Azure Site Recovery (ASR)?",
        options: [{ key: "A", text: "To back up Azure VMs daily" }, { key: "B", text: "To replicate and failover VMs to a secondary region for disaster recovery" }, { key: "C", text: "To migrate on-premises servers to Azure" }, { key: "D", text: "To protect against ransomware attacks" }],
        correctAnswer: "B",
        explanation: "Azure Site Recovery provides business continuity by replicating VMs and physical servers to a secondary site, enabling rapid failover with minimal downtime.",
        topic: "Business Continuity", difficulty: "easy",
      },
      {
        content: "Which design principle recommends deploying applications across multiple Azure regions to survive a regional outage?",
        options: [{ key: "A", text: "High Availability" }, { key: "B", text: "Geo-redundancy" }, { key: "C", text: "Elasticity" }, { key: "D", text: "Fault isolation" }],
        correctAnswer: "B",
        explanation: "Geo-redundancy distributes applications and data across multiple regions, ensuring continued availability even if an entire Azure region becomes unavailable.",
        topic: "Business Continuity", difficulty: "easy",
      },
      {
        content: "Which Azure service enables event-driven architectures by routing events from Azure services to subscribers?",
        options: [{ key: "A", text: "Azure Service Bus" }, { key: "B", text: "Azure Event Grid" }, { key: "C", text: "Azure Event Hubs" }, { key: "D", text: "Azure Notification Hubs" }],
        correctAnswer: "B",
        explanation: "Azure Event Grid is a fully managed event routing service that enables reactive programming by routing events from Azure services to handlers using a publish-subscribe model.",
        topic: "Application Design", difficulty: "easy",
      },
      {
        content: "What Azure tool provides architectural guidance and best practices for building secure, efficient, and reliable solutions?",
        options: [{ key: "A", text: "Azure Advisor" }, { key: "B", text: "Azure Well-Architected Framework" }, { key: "C", text: "Azure Blueprints" }, { key: "D", text: "Microsoft Cloud Adoption Framework" }],
        correctAnswer: "B",
        explanation: "The Azure Well-Architected Framework provides five pillars of architectural guidance: Reliability, Security, Cost Optimization, Operational Excellence, and Performance Efficiency.",
        topic: "Infrastructure Design", difficulty: "easy",
      },
      {
        content: "Which Azure service allows architects to implement a content delivery network to reduce latency for global users?",
        options: [{ key: "A", text: "Azure Traffic Manager" }, { key: "B", text: "Azure CDN (Content Delivery Network)" }, { key: "C", text: "Azure Front Door" }, { key: "D", text: "Azure DNS" }],
        correctAnswer: "B",
        explanation: "Azure CDN caches static content at edge locations worldwide, reducing latency for users by serving content from the nearest point of presence.",
        topic: "Networking Solutions", difficulty: "easy",
      },
      {
        content: "An architect needs to choose between an active-active and active-passive disaster recovery design. What is the key difference?",
        options: [{ key: "A", text: "Active-active has a lower RTO; active-passive has a lower cost" }, { key: "B", text: "They are functionally identical but in different Azure regions" }, { key: "C", text: "Active-active uses more resources; active-passive has a faster failover" }, { key: "D", text: "Active-passive requires manual failover; active-active is fully automated" }],
        correctAnswer: "A",
        explanation: "Active-active runs workloads in multiple regions simultaneously (near-zero RTO) but costs more. Active-passive keeps a standby region that activates on failover, trading lower cost for higher RTO.",
        topic: "Business Continuity", difficulty: "easy",
      },
      {
        content: "Which Azure compute service is best for running batch processing jobs that require high-performance computing (HPC)?",
        options: [{ key: "A", text: "Azure App Service" }, { key: "B", text: "Azure Batch" }, { key: "C", text: "Azure Functions" }, { key: "D", text: "Azure Container Apps" }],
        correctAnswer: "B",
        explanation: "Azure Batch enables large-scale parallel and HPC batch computing applications, managing pools of VMs and job scheduling automatically.",
        topic: "Infrastructure Design", difficulty: "easy",
      },
      {
        content: "What Azure service should be used to centrally manage secrets, certificates, and encryption keys across all applications?",
        options: [{ key: "A", text: "Azure Security Center" }, { key: "B", text: "Azure Key Vault" }, { key: "C", text: "Azure Managed Identity" }, { key: "D", text: "Azure AD Application Proxy" }],
        correctAnswer: "B",
        explanation: "Azure Key Vault provides centralized, secure storage for secrets, certificates, and encryption keys, with access control and audit logging.",
        topic: "Infrastructure Design", difficulty: "easy",
      },
    ],
    medium: [
      {
        content: "A solutions architect is designing a multi-tier application where the middle tier processes sensitive financial data. The solution must prevent internet access to middle-tier VMs while still allowing calls to external APIs. Which design is MOST appropriate?",
        options: [{ key: "A", text: "Place the middle tier VMs in a public subnet and use NSGs to restrict inbound traffic" }, { key: "B", text: "Place the middle tier VMs in a private subnet and route outbound traffic through an Azure NAT Gateway" }, { key: "C", text: "Use Azure Private Link for all external API calls" }, { key: "D", text: "Configure the middle tier VMs without public IPs and use Azure Bastion for management" }],
        correctAnswer: "B",
        explanation: "Private subnet + NAT Gateway allows outbound API calls while blocking unsolicited inbound internet traffic — the correct security posture for sensitive workloads.",
        topic: "Networking Solutions", difficulty: "medium",
      },
      {
        content: "An architect needs to design a solution where multiple microservices communicate reliably with guaranteed message delivery. Which Azure service is MOST appropriate?",
        options: [{ key: "A", text: "Azure Event Grid" }, { key: "B", text: "Azure Service Bus with queues" }, { key: "C", text: "Azure Event Hubs" }, { key: "D", text: "Azure Notification Hubs" }],
        correctAnswer: "B",
        explanation: "Azure Service Bus provides reliable message delivery with dead-lettering, duplicate detection, and sessions — ideal for guaranteed delivery in microservice communication.",
        topic: "Application Design", difficulty: "medium",
      },
      {
        content: "A global application needs to route users to the nearest healthy endpoint automatically. Which Azure service should be used?",
        options: [{ key: "A", text: "Azure Load Balancer" }, { key: "B", text: "Azure Application Gateway" }, { key: "C", text: "Azure Traffic Manager" }, { key: "D", text: "Azure CDN" }],
        correctAnswer: "C",
        explanation: "Azure Traffic Manager is a DNS-based traffic load balancer that distributes traffic to global Azure endpoints based on routing methods like performance, geographic, or weighted routing.",
        topic: "Networking Solutions", difficulty: "medium",
      },
      {
        content: "An organization wants to implement a data lake architecture for storing raw data of any format. Which Azure service is the foundation?",
        options: [{ key: "A", text: "Azure SQL Database" }, { key: "B", text: "Azure Data Lake Storage Gen2" }, { key: "C", text: "Azure Cosmos DB" }, { key: "D", text: "Azure Synapse Analytics" }],
        correctAnswer: "B",
        explanation: "Azure Data Lake Storage Gen2 combines Azure Blob Storage capabilities with a hierarchical filesystem, designed for big data analytics workloads.",
        topic: "Data Solutions", difficulty: "medium",
      },
      {
        content: "A company needs to authenticate users from social identity providers (Google, Facebook) in their public-facing web app. Which Azure service should an architect use?",
        options: [{ key: "A", text: "Azure Active Directory (Entra ID)" }, { key: "B", text: "Azure AD Domain Services" }, { key: "C", text: "Azure AD B2C" }, { key: "D", text: "Azure AD B2B" }],
        correctAnswer: "C",
        explanation: "Azure AD B2C (Business to Consumer) allows customer-facing applications to authenticate users via social identity providers (Google, Facebook, Apple) and custom identity systems.",
        topic: "Identity Solutions", difficulty: "medium",
      },
      {
        content: "When designing for high availability, an architect should use Availability Zones for stateless tiers. For the stateful database tier, what is the recommended approach?",
        options: [{ key: "A", text: "Deploy a single database in the primary zone; use Azure Backup for recovery" }, { key: "B", text: "Use Azure SQL Database with zone-redundant configuration or Always On availability groups across zones" }, { key: "C", text: "Use Azure Cache for Redis as the primary database" }, { key: "D", text: "Deploy separate databases in each zone with application-level synchronization" }],
        correctAnswer: "B",
        explanation: "Azure SQL Database zone-redundant configuration synchronously replicates across availability zones, ensuring data durability and near-zero RTO during zone failures.",
        topic: "Business Continuity", difficulty: "medium",
      },
      {
        content: "A company wants to run a legacy application that requires Windows Server 2012 R2 but wants to minimize infrastructure management. Which hosting option is BEST?",
        options: [{ key: "A", text: "Azure Virtual Machines with Windows Server 2012 R2" }, { key: "B", text: "Azure App Service" }, { key: "C", text: "Azure Container Instances" }, { key: "D", text: "Azure Functions" }],
        correctAnswer: "A",
        explanation: "Legacy applications with OS-level requirements (specific Windows Server versions) must run on VMs since PaaS services abstract the OS. Azure VMs give control over the exact OS version.",
        topic: "Infrastructure Design", difficulty: "medium",
      },
      {
        content: "An architect must design a solution that allows Azure resources in multiple VNets to privately access an Azure SQL Database without public endpoint exposure. What should be implemented?",
        options: [{ key: "A", text: "VNet Service Endpoints for SQL in each VNet" }, { key: "B", text: "Azure Private Link with Private Endpoints in each VNet" }, { key: "C", text: "VNet peering between all VNets and the SQL Database VNet" }, { key: "D", text: "Azure Firewall rules restricting SQL access to specific VNet ranges" }],
        correctAnswer: "B",
        explanation: "Azure Private Link with Private Endpoints provides private IP-based access to Azure SQL from any VNet without traffic traversing the internet, even across peered or connected VNets.",
        topic: "Networking Solutions", difficulty: "medium",
      },
      {
        content: "A startup needs a cost-effective way to run an event-driven API that handles unpredictable, sporadic traffic. Which compute option is MOST appropriate?",
        options: [{ key: "A", text: "Azure Virtual Machines with auto-scaling" }, { key: "B", text: "Azure Functions with Consumption plan" }, { key: "C", text: "Azure Kubernetes Service with node pools" }, { key: "D", text: "Azure App Service with Standard tier" }],
        correctAnswer: "B",
        explanation: "Azure Functions on the Consumption plan charges only for executions (per-second granularity), scaling from zero to handle sporadic traffic — the most cost-effective option for event-driven workloads.",
        topic: "Application Design", difficulty: "medium",
      },
      {
        content: "An organization is modernizing their on-premises monolith. The architect recommends a strangler fig pattern. What does this involve?",
        options: [{ key: "A", text: "Rewriting the entire application as microservices simultaneously" }, { key: "B", text: "Gradually replacing monolith components with microservices, routing traffic incrementally" }, { key: "C", text: "Running the monolith in Azure VMs without changes" }, { key: "D", text: "Breaking the monolith into separate databases while keeping a single codebase" }],
        correctAnswer: "B",
        explanation: "The strangler fig pattern gradually migrates a monolith by building new microservices alongside it, routing traffic to new services piece by piece until the monolith is fully replaced.",
        topic: "Application Design", difficulty: "medium",
      },
      {
        content: "A company must store sensitive data with at-rest encryption using customer-managed keys (CMK). Which Azure services enable this for Azure Storage?",
        options: [{ key: "A", text: "Azure Security Center + Azure Disk Encryption" }, { key: "B", text: "Azure Key Vault + Azure Storage customer-managed key configuration" }, { key: "C", text: "Azure Defender + Azure Information Protection" }, { key: "D", text: "Azure Policy + Azure Backup encryption" }],
        correctAnswer: "B",
        explanation: "Azure Storage supports customer-managed keys (CMK) stored in Azure Key Vault, giving organizations full control over the encryption keys protecting their data at rest.",
        topic: "Identity Solutions", difficulty: "medium",
      },
      {
        content: "An architect needs to ensure applications can authenticate to Azure services without storing credentials in code. Which feature enables this?",
        options: [{ key: "A", text: "Azure Key Vault secret references" }, { key: "B", text: "Azure Managed Identity" }, { key: "C", text: "Azure AD Service Principals" }, { key: "D", text: "Azure AD App Registration" }],
        correctAnswer: "B",
        explanation: "Azure Managed Identity provides Azure resources with an automatically managed identity in Azure AD, enabling authentication to services without credentials in code.",
        topic: "Identity Solutions", difficulty: "medium",
      },
      {
        content: "A company wants to implement a multi-region active-active architecture for their web application. Which Azure services are MOST critical for routing and data consistency?",
        options: [{ key: "A", text: "Azure CDN + Azure SQL with geo-replication (read-only secondary)" }, { key: "B", text: "Azure Front Door + Azure Cosmos DB with multi-region writes" }, { key: "C", text: "Azure Traffic Manager + Azure SQL Database standard tier" }, { key: "D", text: "Azure Application Gateway + Azure MySQL Flexible Server" }],
        correctAnswer: "B",
        explanation: "Azure Front Door provides global HTTP routing with automatic failover, while Cosmos DB with multi-region writes enables true active-active data access across regions.",
        topic: "Business Continuity", difficulty: "medium",
      },
      {
        content: "An organization needs to run a highly available, containerized application that requires GPU compute for AI workloads. Which Azure service is MOST appropriate?",
        options: [{ key: "A", text: "Azure Container Instances with GPU SKUs" }, { key: "B", text: "Azure Kubernetes Service with GPU node pools" }, { key: "C", text: "Azure Machine Learning compute clusters" }, { key: "D", text: "Azure Batch with GPU-enabled VMs" }],
        correctAnswer: "B",
        explanation: "AKS supports GPU node pools (N-series VMs) with NVIDIA device plugins, enabling GPU-accelerated containers while providing orchestration, auto-scaling, and high availability.",
        topic: "Infrastructure Design", difficulty: "medium",
      },
      {
        content: "When should an architect choose Azure Event Hubs over Azure Service Bus for a messaging solution?",
        options: [{ key: "A", text: "When guaranteed message delivery and dead-letter support are required" }, { key: "B", text: "When ingesting millions of events per second from IoT devices or telemetry streams" }, { key: "C", text: "When messages need to be processed in strict FIFO order" }, { key: "D", text: "When message sessions and duplicate detection are needed" }],
        correctAnswer: "B",
        explanation: "Event Hubs is designed for high-throughput telemetry and event streaming (millions of events/sec). Service Bus is for reliable message queuing with ordering, duplicate detection, and dead-lettering.",
        topic: "Application Design", difficulty: "medium",
      },
    ],
    hard: [
      {
        content: "A financial institution requires a disaster recovery solution for Azure SQL Database with RPO of 1 hour and RTO of 30 minutes, with automatic failover. Which combination achieves this?",
        options: [{ key: "A", text: "Azure SQL Database with point-in-time restore and manual failover scripts" }, { key: "B", text: "Azure SQL Database Auto-failover group with a secondary in another region and Azure Traffic Manager" }, { key: "C", text: "Azure SQL Database geo-replication with a read replica and Azure Front Door" }, { key: "D", text: "Azure SQL Managed Instance with Business Continuity Group and zone redundancy" }],
        correctAnswer: "B",
        explanation: "Auto-failover groups provide automatic failover with near-zero RPO. Traffic Manager handles DNS-level routing failover, achieving sub-30-minute RTO without manual intervention.",
        topic: "Business Continuity", difficulty: "hard",
      },
      {
        content: "An architect is designing a solution for a bank that must meet PCI-DSS compliance. Which combination of Azure services best addresses the network isolation requirements?",
        options: [{ key: "A", text: "Public VNet with NSGs + Azure Firewall" }, { key: "B", text: "Private VNet with Private Endpoints, Azure Firewall Premium with TLS inspection, and Azure DDoS Protection Standard" }, { key: "C", text: "Azure Application Gateway WAF + VPN Gateway" }, { key: "D", text: "Azure Bastion + Network Watcher + Azure Monitor" }],
        correctAnswer: "B",
        explanation: "PCI-DSS requires network segmentation (private VNets + Private Endpoints), deep packet inspection (Azure Firewall Premium with TLS), and DDoS protection — all combined to meet compliance requirements.",
        topic: "Identity Solutions", difficulty: "hard",
      },
      {
        content: "A company builds a real-time analytics pipeline ingesting 1M events/second from IoT devices. Data must be analyzed in real-time and stored for 30 days. Which architecture is MOST appropriate?",
        options: [{ key: "A", text: "Azure Service Bus → Azure Functions → Azure SQL Database" }, { key: "B", text: "Azure Event Hubs → Azure Stream Analytics → Azure Data Lake Storage Gen2 + Azure Synapse Analytics" }, { key: "C", text: "Azure IoT Hub → Azure Logic Apps → Azure Cosmos DB" }, { key: "D", text: "Azure API Management → Azure Functions → Azure Table Storage" }],
        correctAnswer: "B",
        explanation: "Event Hubs handles million-event/sec ingestion, Stream Analytics provides real-time processing, Data Lake Gen2 stores raw events, and Synapse enables batch analytics — the standard Azure streaming analytics architecture.",
        topic: "Data Solutions", difficulty: "hard",
      },
      {
        content: "An architect must design a multi-tenant SaaS application where each tenant's data must be isolated. Which database architecture provides the BEST balance of isolation and cost for 500+ tenants?",
        options: [{ key: "A", text: "One Azure SQL Database per tenant (database-per-tenant)" }, { key: "B", text: "A single shared database with tenant ID column for all tenants (shared schema)" }, { key: "C", text: "Azure SQL Elastic Pool with one database per tenant for resource sharing" }, { key: "D", text: "Azure Cosmos DB with tenant ID as partition key" }],
        correctAnswer: "C",
        explanation: "Elastic Pools provide one database per tenant for strong isolation, while sharing compute and storage resources across tenants — optimizing cost while maintaining tenant-level isolation for 500+ tenants.",
        topic: "Data Solutions", difficulty: "hard",
      },
      {
        content: "A global e-commerce company's checkout service must remain available during an Azure regional outage with zero data loss and sub-60-second failover. Which design achieves this?",
        options: [{ key: "A", text: "Active-passive with Azure Site Recovery and manual failover" }, { key: "B", text: "Active-active with Azure Cosmos DB multi-region writes, Azure Front Door, and stateless compute in multiple regions" }, { key: "C", text: "Azure SQL with auto-failover groups and Azure Traffic Manager with 60-second TTL" }, { key: "D", text: "Multi-region App Service with geo-redundant Azure SQL Database" }],
        correctAnswer: "B",
        explanation: "Active-active with Cosmos DB multi-region writes achieves zero data loss (RPO=0). Front Door routes to healthy regions within seconds (sub-60s RTO). Stateless compute means no region-specific state to fail over.",
        topic: "Business Continuity", difficulty: "hard",
      },
      {
        content: "An architect is designing a microservices solution on AKS. Some services need to call each other internally, and some need to be accessible externally. How should traffic be managed?",
        options: [{ key: "A", text: "Expose all services with public LoadBalancer services; use NSGs for security" }, { key: "B", text: "Use an AKS internal ingress controller for inter-service traffic, Azure Application Gateway Ingress Controller for external traffic, and a service mesh for mutual TLS" }, { key: "C", text: "Use Azure Front Door for all traffic routing including internal services" }, { key: "D", text: "Deploy Azure API Management in front of all microservices including internal ones" }],
        correctAnswer: "B",
        explanation: "Internal ingress handles east-west traffic within AKS. AGIC manages external north-south traffic with WAF. A service mesh (Istio/Linkerd) provides mutual TLS and observability for inter-service communication.",
        topic: "Infrastructure Design", difficulty: "hard",
      },
      {
        content: "A company runs sensitive workloads on Azure and needs to prevent insider threats from Microsoft operators accessing their data. Which Azure feature addresses this?",
        options: [{ key: "A", text: "Azure Key Vault with customer-managed keys" }, { key: "B", text: "Azure Confidential Computing with confidential VMs or enclaves" }, { key: "C", text: "Azure Customer Lockbox" }, { key: "D", text: "Azure Dedicated Host" }],
        correctAnswer: "B",
        explanation: "Azure Confidential Computing provides hardware-based trusted execution environments (TEEs) that protect data in use, ensuring even Microsoft operators cannot access data being processed.",
        topic: "Identity Solutions", difficulty: "hard",
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
    sessionId,
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
