# Project Brief: PriceControl

## 1. Executive Summary

PriceControl is a freemium subscription application designed to provide sophisticated financial analysis through a hosted, open-source Qwen3 LLM. The platform solves the problem of unreliable or unstructured financial data by querying only from a curated, allow-listed registry of reputable public sources. The target market includes retail investors, financial analysts, and researchers who require trustworthy, AI-driven insights. The key value proposition is offering a secure, scalable, and compliant financial assistant that leverages a powerful open-source model, with monetization managed through a Stripe-integrated subscription service.

---

## 2. Problem Statement

* **Current State & Pain Points:** Financial professionals and sophisticated investors currently face a fragmented and untrustworthy information landscape. They must either rely on prohibitively expensive institutional terminals, manually sift through countless unreliable public data sources, or use general-purpose AI tools that are not optimized for financial analysis and may provide inaccurate or hallucinatory data. This leads to inefficient workflows, a high risk of making decisions based on flawed information, and a significant barrier to entry for those without institutional-level budgets.
* **Impact of the Problem:** The consequence is a significant gap in capability between large institutions and smaller firms or individuals. This results in missed investment opportunities, wasted time on low-value data collection, and an inability to compete effectively. The lack of a trustworthy, AI-powered analytical tool at an accessible price point stifles innovation and informed decision-making.
* **Why Existing Solutions Fall Short:**
    * **Proprietary Terminals (e.g., Bloomberg):** Inaccessibly expensive for the target market.
    * **General-Purpose LLMs:** Lack the necessary data sourcing guardrails, often using unverified or outdated information, making them unsuitable for high-stakes financial queries.
    * **Data APIs:** Provide raw data but require significant technical expertise to integrate and lack a conversational, analytical interface.
    * **Open-Source LLMs (Self-Hosted):** Require deep technical knowledge to deploy, manage, and connect to a reliable, real-time data pipeline.
* **Urgency:** In a rapidly evolving, AI-driven market, the speed and accuracy of information analysis are paramount. There is an immediate and growing need for a solution that democratizes access to reliable, AI-driven financial insights.

---

## 3. Proposed Solution

* **Core Concept:** We will develop a modern, scalable, and secure freemium web application that serves as an expert financial assistant. The core of the application will be a powerful, open-source Qwen3-30B-A3B LLM, which users can interact with through a conversational chat interface. All data retrieval and analysis performed by the LLM will be strictly governed by an allow-listed registry of approved, reputable financial sources, ensuring data integrity and user trust.
* **Key Differentiators:** The primary differentiator is **trust through transparency**. Unlike general-purpose AIs, our solution's knowledge is not a black box; it is explicitly limited to a curated set of high-quality data sources that are visible to the user. Furthermore, by using a powerful open-source model and deploying on a modern stack (Vercel, Neon, Stripe), we can offer capabilities that rival institutional tools at a fraction of the cost.
* **Why This Solution Will Succeed:** This solution succeeds by directly targeting the critical failure points of existing alternatives. It combines the advanced analytical and conversational power of a large language model with the data integrity of a proprietary research tool. It removes the technical complexity of setting up a specialized AI environment and the prohibitive cost of institutional software, creating a new market category for accessible, reliable AI financial analysis.
* **High-Level Vision:** The vision is to become the indispensable tool for any investor or analyst who values verifiable, AI-driven insights. We aim to empower a new generation of market participants to make informed decisions with a level of confidence that was previously only available to the financial elite.

---

## 4. Target Users

### Primary User Segment: The Professional/Prosumer Analyst
* **Profile:** This user is a financial analyst, quantitative researcher, or portfolio manager at a small-to-medium-sized fund, or a highly sophisticated individual trader. They are financially literate and data-driven but may lack the budget for top-tier institutional tools.
* **Current Behaviors:** They currently spend a significant amount of time manually aggregating data from various sources like SEC filings, press releases, and economic data websites. They may use scripting languages or data APIs but find the process of cleaning and integrating data to be a major workflow bottleneck.
* **Needs & Pain Points:** Their primary pain point is the inefficiency and high cost of accessing reliable, structured information. They need to reduce the time spent on data wrangling and increase the time spent on actual analysis. They are wary of "black box" solutions and require transparency in data sourcing.
* **Goals:** Their goal is to find a verifiable "edge" by quickly synthesizing complex information from diverse, credible sources to generate unique insights and make profitable decisions.

### Secondary User Segment: The Sophisticated Retail Investor
* **Profile:** This user is an experienced individual investor who actively manages their own portfolio. They are well-read, follow market news closely, and may attempt to emulate the strategies of well-known investors.
* **Current Behaviors:** They read company filings, follow financial news, and subscribe to newsletters. They often feel overwhelmed by the volume of information and struggle to connect disparate events to market movements.
* **Needs & Pain Points:** They are priced out of the market for institutional-grade tools and feel they are at an information disadvantage. They need a tool that can help them process information like a professional, verify sources, and understand complex topics without a steep technical learning curve.
* **Goals:** Their goal is to elevate their investment strategy by making decisions based on the same high-quality, reliable data that professionals use, ultimately aiming for better long-term returns.

---

## 5. Goals & Success Metrics

### Business Objectives
* **Launch MVP:** Successfully launch the freemium application on Vercel within 6 months.
* **User Acquisition:** Achieve 1,000 monthly active free users within 3 months of the public launch.
* **Monetization:** Convert at least 5% of active free users to a paid subscription plan within 6 months of launch, establishing initial Monthly Recurring Revenue (MRR).

### User Success Metrics
* **Engagement:** Achieve an average of 5+ queries per user session, indicating users are actively engaging with the LLM for analysis.
* **Retention:** Maintain a weekly user retention rate of 20% or higher, showing that users find continuing value and return to the platform.
* **Data Source Diversity:** See a week-over-week increase in the variety of unique data sources users query, demonstrating they trust and are exploring the breadth of the platform's capabilities.

### Key Performance Indicators (KPIs)
* **MAU (Monthly Active Users):** The total number of unique users who interact with the app in a given month.
* **MRR (Monthly Recurring Revenue):** The total predictable revenue generated from subscriptions.
* **Free-to-Paid Conversion Rate:** The percentage of free users who upgrade to a paid plan.
* **API Uptime & Latency:** Core technical performance metrics to ensure a reliable user experience.

---

## 6. MVP Scope (Revised)

### Core Features (Must Have for MVP)
* **User Authentication:** A complete sign-up, login, and logout flow for users to create and access their accounts.
* **Freemium Plan Gating:** A simple usage limit for free-tier users (e.g., a daily query cap) to encourage upgrades.
* **Core LLM Chat Interface:** A functional chat UI allowing users to submit queries and receive streaming responses.
* **Dual LLM Models:** The interface will allow users to select between the default "Instruct" model and the optional "Thinking" variant for more complex reasoning tasks.
* **Governed Data Access:** Implementation of the `web.fetch` tool, strictly governed by a foundational `datasources.yml` file. The MVP will launch with a curated subset of sources (e.g., SEC EDGAR, FRED, one or two press wires).
* **Stripe Integration:** Integration with Stripe Checkout for users to upgrade to a paid plan and a Stripe Customer Portal for them to manage their subscription.

### Out of Scope for MVP
* **Real-time Chart Updates:** The live charts page using Ably/Pusher will be deferred. Charts in the MVP will be generated on-demand.
* **Advanced RAG / Embeddings:** The `pgvector` capabilities for complex Retrieval-Augmented Generation will not be in the MVP. The initial product will rely on live, governed web queries.
* **Complex Metered Billing:** Usage-based billing for tokens or tool calls is a post-MVP feature. The initial monetization will be a simple, flat-rate subscription.
* **Full Data Source Integration:** The MVP will not include integrations for all 24 categories of data sources listed in the plan. We will start with a core, high-value set.

### MVP Success Criteria
The MVP will be considered a success if it validates our core hypotheses:
1.  **Value Hypothesis:** Users actively and repeatedly use the governed LLM chat for financial queries (measured by weekly retention and queries per session).
2.  **Growth Hypothesis:** We can attract and sign up free users at a steady rate (measured by MAU).
3.  **Business Hypothesis:** A meaningful percentage of free users find enough value to convert to a paid subscription (measured by free-to-paid conversion rate).

---

## 7. Post-MVP Vision

### Phase 2 Features
These are the immediate priorities following a successful MVP launch, primarily drawn from features we deferred from the initial scope:
* **Real-time Capabilities:** Integrate a realtime provider like Ably or Pusher to enable live chart updates and data streaming.
* **Advanced RAG Implementation:** Build out the data ingestion and embedding pipeline to populate the Neon `pgvector` database, enabling deeper, context-aware RAG queries.
* **Metered & Usage-Based Billing:** Introduce more sophisticated pricing tiers based on usage (e.g., token counts, tool calls) to offer customers greater flexibility.
* **Expanded Data Source Integration:** Methodically integrate the remaining high-value data source categories outlined in the technical plan.

### Long-term Vision
The long-term vision is to evolve PriceControl from a reactive financial assistant into a proactive, personalized intelligence platform. This could include developing capabilities for proactive alerting (e.g., "Notify me when a company in my portfolio files an 8-K"), customizable dashboards, and collaborative tools for teams.

### Expansion Opportunities
* **New Markets:** Expand the data source registry to include international sources, such as European and Asian market data, to attract a global user base.
* **Enterprise Tier:** Introduce a high-tier plan aimed at financial institutions, offering features like custom data source integration, enhanced security controls (SAML/SSO), and dedicated support SLAs.
* **API Access:** Launch a paid API product that allows other developers and services to leverage our curated data pipeline and governed LLM.

---

## 8. Technical Considerations

### Platform Requirements
* **Target Platforms:** Web application deployed on Vercel, designed with a responsive, mobile-first approach.
* **Browser/OS Support:** The application should support the latest stable versions of major desktop and mobile browsers (e.g., Chrome, Safari, Firefox, Edge).
* **Performance Requirements:** The system must support low-latency streaming for LLM responses and real-time updates for financial charts, with pre-warmed caches to handle peak loads near market open/close.

### Technology Preferences
* **Frontend:** Next.js (App Router), Tailwind CSS, and shadcn/ui for the component library.
* **Backend & LLM:** Next.js Route Handlers will serve as the API layer. The primary compute will be a Qwen3-30B-A3B model served via vLLM with an OpenAI-compatible API.
* **Database:** Neon Serverless Postgres with the `pgvector` extension for embeddings, accessed via Drizzle ORM.
* **Hosting/Infrastructure:** The application will be deployed on Vercel, using Upstash Redis for caching and rate-limiting.

### Architecture Considerations
* **Repository Structure:** A monorepo structure is anticipated, containing the Next.js application, shared libraries, and prompt configurations.
* **Service Architecture:** A serverless approach using Vercel Functions for the API/backend logic, which communicates with the externally hosted vLLM service.
* **Integration Requirements:** Core integrations include Stripe for billing, a realtime provider (Ably or Pusher), and numerous external APIs for financial data, all governed by the master source registry.
* **Security/Compliance:** A strong security posture is required from the start, including a strict Content-Security-Policy (CSP), adherence to OWASP Top-10 controls, and rigorous compliance with the terms of service and `robots.txt` for all data sources.

---

## 9. Constraints & Assumptions

### Constraints
* **Budget:** The project is designed to be cost-effective, relying on serverless technologies and an open-source LLM to minimize operational overhead. The business model's success is therefore constrained by the ability to keep infrastructure costs low.
* **Timeline:** The initial MVP is targeted for a public launch within a 6-month timeframe.
* **Resources:** The project requires access to and budget for specialized GPU hardware capable of serving the Qwen3-30B-A3B model effectively via vLLM.
* **Technical:** The single most important technical constraint is that the LLM agent **must only** use data sources defined in the `/datasources.yml` registry. All of its tools and capabilities must operate within these bounds.

### Key Assumptions
* **Model Viability:** We assume that the open-source Qwen3-30B-A3B model is sufficiently powerful and accurate for the domain of financial analysis to provide significant value to users.
* **Market Demand:** We assume a substantial, underserved market of professional and sophisticated retail investors exists and that they will find enough value in a transparent, AI-driven tool to sign up and eventually pay for it.
* **Data Reliability:** We assume the public APIs and sources in the allow-list will remain accessible, reliable, and compliant with the terms of use we intend to follow.
* **Monetization Assumption:** We assume the features and limits of the free tier will be compelling enough to attract a large user base, while the value unlocked in the paid tier will be sufficient to drive a sustainable conversion rate.

---

## 10. Risks & Open Questions

### Key Risks
* **Technical Risk:** Self-hosting and maintaining a large language model like Qwen3-30B-A3B at production scale carries significant operational complexity and potentially high, unpredictable costs.
* **Market Risk:** The target market may not perceive enough value in a governed, open-source model to pay for a subscription, especially with powerful general-purpose AIs available for free.
* **Data & Compliance Risk:** Navigating the specific terms of service for dozens of financial data sources, especially for commercial use and redistribution, presents a major legal and compliance hurdle.
* **Model Performance Risk:** The chosen open-source model may not be consistently accurate or reliable enough for high-stakes financial analysis, potentially leading to a loss of user trust.

### Open Questions
* What is the specific pricing for the paid subscription tiers, and what will the exact usage limits be for the free plan?
* Which specific subset of the 24 listed data source categories will be prioritized for the MVP launch?
* What are the estimated monthly costs for the GPU infrastructure required to host the vLLM service for our target number of active users?
* What legal and product guardrails are needed to ensure the application is not perceived as providing licensed financial advice?

### Areas Needing Further Research
* A detailed legal review of the terms of service for the top priority data sources is needed to confirm viability for a commercial application.
* Performance benchmarking of the Qwen3 model against proprietary models (e.g., GPT-4, Claude 3) on a specific set of financial tasks.
* User interviews with the target "Prosumer Analyst" persona to validate the MVP feature set and their willingness to pay.

---

## 11. Appendices

* **C. References:**
    * `techstack (1).md`: The initial technical specification and project plan that served as the primary input for this brief.

---

## 12. Next Steps

### Immediate Actions
1.  Review this completed Project Brief for accuracy and completeness.
2.  Approve the brief to serve as the foundational document for the project.
3.  Hand off the brief to the Product Manager (PM) to begin creating the detailed Product Requirements Document (PRD).

### PM Handoff
This Project Brief provides the full context for PriceControl. Please start in 'PRD Generation Mode', review the brief thoroughly to work with the user to create the PRD section by section as the template indicates, asking for any necessary clarification or suggesting improvements.