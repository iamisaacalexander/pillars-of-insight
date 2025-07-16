# Pillars of Insight – Master Context Document

**Purpose & Usage**

* **Objective:** A single, authoritative source of truth that AI agents can load into memory or context windows to answer questions, generate code, or make decisions with full awareness of project scope.

* **AI-Ready Format:** Clear, self-contained sections; explicit definitions; JSON examples; minimal pronouns; consistent header labels for chunking.

* **Chunking Guidelines:** Keep sections under 2,000 tokens. Use header tags (e.g., \#\#\#) to denote boundaries. Refer to sections by header name.

---

## 1\. Definitions & Terminology

All core domain entities, with precise meaning and attributes.

| Term | Type | Description | Fields / Attributes |
| :---- | :---- | :---- | :---- |
| **Brick** | Object | Atomic content unit. Represents a single piece of knowledge (e.g., video, note, link). | id(UUID), type(video/artifact/text), title, contentUrl, metadata |
| **Pillar** | Collection | Ordered group of 1–30 Bricks forming a theme or module. Visually a column. | id, brickIds\[\], title, description, orderIndex |
| **Portico** | Group | Cluster of Pillars under a common roof (category). | id, pillarIds\[\], name, icon |
| **Palisade** | Realm | Entire knowledge environment—multiple Porticos and global settings. | id, porticoIds\[\], settings |
| **Arch** | Link | Directed connection between two Pillars, with a summary explanation. | id, sourcePillarId, targetPillarId, summary |
| **Path** | Sequence | Predefined or user-generated journey through Bricks/Pillars (like a course syllabus). | id, steps\[{type, refId, note}\], name |
| **Quarry** | Staging | Temporary holding of new Bricks before classification. | userId, brickIds\[\] |
| **Pool** | Archive | User’s personal archive of Bricks (long-term storage). | userId, brickIds\[\] |
| **Float** | Mode | Passive, continuous playback of content (Brick stream). | modeName, settings |
| **Ripple** | Notification | Reminders or prompts triggered by schedule or event, linked to specific Bricks/Pillars. | id, trigger, targetRef, message, schedule |

**Usage Example (JSON)**

**POST** **/v1/api/bricks**  
{  
  "title": "How Memory Works",  
  "type": "video",  
  "contentUrl": "https://youtu.be/abc123",  
  "metadata": {"duration": 300}  
}

---

## 2\. User Personas & Use Cases

Designed to clarify who we serve and why.

### Persona: Alex (Primary Learner)

* **Role:** Lifelong learner, researcher, “ambient knowledge” seeker

* **Goals:** Capture ideas quickly; explore by voice; build personal knowledge maps.

* **Pain Points:** Context switching; information overload; losing track of insights.

### Persona: Taylor (Knowledge Curator)

* **Role:** Course designer, educator, content organizer

* **Goals:** Assemble curricula; annotate connections (Arches); share Porticos.

* **Pain Points:** Manual tagging; inconsistent metadata; limited collaborative tools.

### Key Use Cases

1. **Voice-Driven Exploration**

   * *Trigger:* User speaks a query.

   * *Flow:* Whisper → Aurora persona for clarifications → Pillar/Portico suggestion → Echo for summary.

2. **Quick Brick Capture**

   * *Trigger:* Share URL or text snippet.

   * *Flow:* API receives Brick → AI enriches metadata (keywords, summary) → Brick appears in Quarry.

3. **Float Mode Playback**

   * *Trigger:* User toggles Float.

   * *Flow:* System streams next un-viewed Brick in sequence; user upvotes/downvotes each for context adjustment.

4. **Ripple Scheduling**

   * *Trigger:* Time-based or event-based (e.g., file modification).

   * *Flow:* Scheduler creates Ripple → Notification pops up → Quick access to target Brick or Path.

---

## 3\. Visual & Interaction Guidelines

Ensures UI consistency and developer alignment.

### Style & Theme

* **Canvas:** Off-white (\#F3E9DC) background; charcoal pencil (\#333333) line art.

* **Typography:** System font stack; headings 2rem, body 1rem, monospace for code.

* **Spacing:** 8px grid; 16px base padding.

### Core Components

1. **TabletFrame**

   * *Props:* draggable: boolean, size: {w,h}, theme: "light"|"dark"

   * *Behavior:* Toggle mic icon; slide panel behind; clip overflow content.

2. **ToolsPanel**

   * *Icons:* Hammer (contrarian), Chisel (highlight), Float (play), Ripple (bell)

   * *States:* collapsed/expanded; slide animation duration 200ms.

3. **BrickCard**

   * *Elements:* Thumbnail, Title, Tags, QuickActions (edit, delete).

   * *Accessibility:* ARIA label Brick: {title}; keyboard focus styles.

### Interaction Patterns

* **Drag & Drop:** Reorder Pillars within Portico; drag Brick onto Pillar to assign.

* **Voice Commands:** Templates: Add Brick {url}, Start Float, Show Path {name}.

* **Shortcuts:** Ctrl+P (open palette), Ctrl+Shift+R (record voice).

---

## 4\. Data Model & API Endpoints

Detailed schema definitions and REST contract.

### Entity Schemas (JSON Schema Snippet)

**"Brick":** {  
  "type": "object",  
  "properties": {  
    "id": {"type": "string", "format": "uuid"},  
    "title": {"type": "string"},  
    "type": {"enum": \["video","article","note"\]},  
    "contentUrl": {"type": "string", "format": "uri"},  
    "metadata": {"type": "object"}  
  },  
  "required": \["title","type"\]  
}

### Core REST Endpoints

| Method | Path | Description | Request Body | Response |
| :---- | :---- | :---- | :---- | :---- |
| POST | /v1/api/bricks | Create a new Brick | Brick JSON | 201 \+ Brick JSON |
| GET | /v1/api/bricks/{id} | Retrieve a Brick by ID | — | 200 \+ Brick JSON |
| PUT | /v1/api/pillars/{id} | Update Pillar metadata and order | Pillar JSON | 200 \+ Pillar JSON |
| DELETE | /v1/api/porticos/{id} | Remove a Portico (cascades to Pillars) | — | 204 No Content |

### Auth & Error Handling

* **Authentication:** Bearer Authorization: Bearer \<token\>

* **Error Codes:** 400 (Validation), 401 (Unauthorized), 404 (Not Found), 409 (Conflict), 500 (Server Error)

* **Error Response Schema:**

{ "error": { "code": "string", "message": "string", "details": \[\] } }

---

## 5\. AI Personas & Prompt Flows

Defines roles, system messages, and routing logic.

### Personas & Roles

| Persona | Role | System Prompt Snippet |
| :---- | :---- | :---- |
| **Aurora** | Exploratory scaffold | “You are Aurora, you ask clarifying questions to refine the user’s query…” |
| **Echo** | Analytical summarizer | “You are Echo, you summarize content and offer contrarian insights…” |
| **Whisper** | Transcription engine (pre-prompt) | *No system message; raw audio → text* |

### Routing Logic

1. **Audio Input** → Whisper → text

2. **Intent Classification** → if create or edit → Aurora; if review or summarize → Echo

3. **Action Execution**: Aurora/Echo → call API or return content

### Prompt Templates (Examples)

\[System:Aurora\]  
You are Aurora, an AI assistant who asks up to 3 clarifying questions before executing the user's request.

\[User\]  
"Add a new Brick about solar panels"

\[System:Echo\]  
You are Echo, an AI analyst. Summarize the following Pillar content in 50 words.

---

## 6\. System Architecture & Deployment

End-to-end technical blueprint.

### Technology Stack

* **Frontend:** Next.js (React, TSX), Tailwind CSS, Framer Motion

* **Backend:** Next.js API Routes (Node.js), Express (optional), SQLite/PostgreSQL

* **AI Services:** OpenAI GPT-4, Whisper, ElevenLabs TTS

* **Storage:** AWS S3 (Bricks media), PostgreSQL (metadata)

* **Authentication:** JWT via Auth0 or NextAuth

### CI/CD Pipeline

1. **Push to GitHub** →

2. **GitHub Actions** run tests & lint →

3. **Build** →

4. **Deploy** on Render (or alternate: Vercel)

5. **Notify** Slack channel on success/failure

### Environment Variables (example)

NEXT\_PUBLIC\_API\_BASE=http://api.pillars.local/v1  
OPENAI\_API\_KEY=sk-xxx  
S3\_BUCKET=pillars-insights

---

## 7\. Roadmap & Milestones

Granular timeline with sprint objectives.

| Phase | Timeframe | Goals & Deliverables | Acceptance Criteria |
| :---- | :---- | :---- | :---- |
| **MVP-Sprint 1** | Weeks 1–2 | Brick CRUD, Pillar grouping, basic UI scaffolding | API tests pass; Tablet UI draggable |
| **MVP-Sprint 2** | Weeks 3–4 | Quick Brick capture, meta-extraction flow | Metadata auto-populated; Quarry working |
| **v1.0** | Months 2–3 | Hammer/Chisel tools, Float mode, Ripple scheduler | ToolsPanel functional; Ripples sent |
| **v2.0** | Q3 2025 | Path Builder, Social share, multi-user collaboration | Users can share Porticos; share link works |
| **v3.0** | Q4 2025 | On-prem LLM support, advanced analytics dashboard | Local GPT endpoint integration |

---

## 8\. Context Loading Tips

* **Load by Section:** Request AI to focus on one header at a time (e.g., “Use section ‘Data Model & API Endpoints’”).

* **Anchor References:** Mention header IDs (e.g., \#data-model--api-endpoints) for precise extraction.

* **Token Budget:** If prompt grows too large, fall back to summary version (available in separate “Abstracts” doc).

---

*End of Master Context Document.*  
*Ensure to update version and date when making edits.*