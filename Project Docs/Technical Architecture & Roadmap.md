**Pillars of Insight — Technical Architecture & Roadmap**

**1\. Introduction & Purpose**  
Provide a holistic view of system components, data flows, integration points, and project milestones to guide development, deployment, and future enhancements across stakeholders and AI agents.

---

**2\. High-Level System Architecture**

* **Next.js Frontend** (React/TypeScript)

  * UI components: Tablet view, Mini-widget, Toolbar, World map

  * Handles user interactions (voice triggers, clicks, drags)

* **AI Service Layer**

  * **Aurora & Echo** orchestrated via OpenAI GPT-4 API (Chat Completions)

  * **Whisper** for transcription (/api/voice/transcribe)

  * **ElevenLabs** for TTS (/api/voice/speak)

* **Backend API** (Node.js/Express or Next.js API routes)

  * CRUD endpoints for Bricks, Pillars, Porticos, Palisades, Arches, Paths, Quarry, Pool, Ripples

  * Authentication & rate-limiting middleware

* **Database**

  * Relational (PostgreSQL) or document (MongoDB) for entity storage

  * Transcript blobs in object storage (S3) or DB blob fields

* **YouTube Embed & Transcription Pipeline**

  * Embedded YouTube IFrame API for playback

  * Serverless job to fetch and store video transcripts

**Visualization:**

\[Browser\] ↔ \[Next.js Frontend UI\]  
      ↕             ↕  
\[API Gateway\] ↔ \[AI Services: GPT-4, Whisper, ElevenLabs\]  
      ↕             ↕  
\[Database\]    ↔ \[Object Storage (transcripts, assets)\]

---

**3\. Milestones & Phases**

| Phase | Scope | Timeline |
| :---- | :---- | :---- |
| **MVP** | Core flows A–D: Voice Query, Quick Capture, World Builder, Brick Capture; basic CRUD; inline playback | 1–2 months |
| **v1.0** | Hammer/Chisel tools; Ripple notifications; multi-column Pillars; Float playlist; persona toggle | \+2–3 months |
| **v2.0+** | Ambient overlays; social/shared Porticos; advanced Path Builder; accessibility modes; performance tuning | Q3–Q4 2025 |

---

**4\. Technology Choices & Integrations**

* **Frontend:** Next.js, React, TypeScript, Tailwind CSS

* **AI APIs:** OpenAI GPT-4, Whisper; ElevenLabs TTS

* **Database & Storage:** PostgreSQL or MongoDB; AWS S3 for transcripts and assets

* **Auth:** JWT or Auth0 for user sessions

* **CI/CD:** GitHub Actions → Render deployments

* **Monitoring & Logging:** Sentry, Datadog, or AWS CloudWatch

---

**5\. Hosting & Deployment**

* **Render (Recommended):** Full-stack hosting for Next.js SSR, API routes, background workers, and GitHub CI/CD. Offers custom domains with auto TLS, vertical scaling, and global CDN—ideal for production and ongoing development.

* **Database:** Managed PostgreSQL (AWS RDS) or MongoDB Atlas; connect via Render environment variables or secrets manager. Enable automated backups and maintenance.

* **CDN & Caching:** Use Render’s built-in CDN for static assets; optionally layer Cloudflare for advanced caching, DDoS protection, and performance tuning.

---

**6\. Scalability, Security & Monitoring**

* **Auto-scaling:** Serverless functions and containers scale with demand

* **Rate Limits:** Throttle Brick creation and AI calls to control costs

* **Security:** HTTPS everywhere, OWASP best practices, API key management

* **Monitoring:** Uptime and latency alerts, API error dashboards, usage analytics

---

**7\. Documentation & Handoff**

* Maintain an up-to-date architecture.md in the repository

* Provide Postman or Insomnia collections for API testing

* Sketch deployment diagrams in Confluence or Figma for stakeholders

---

**8\. Future Considerations**

* On-premise LLM options for offline support

* GraphQL layer for flexible data queries

* Real-time collaboration and multi-user editing

* Plugin system for custom Brick types (PDF, EPUB, interactive content)