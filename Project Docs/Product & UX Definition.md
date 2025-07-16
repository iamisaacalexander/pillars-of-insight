# Product & UX Definition

## 0\. Definitions

* **Brick**  
  A discrete content item (video URL, article, PDF, etc.) you snap into your world. For video Bricks, the app downloads the full transcript to enable text‐snippet extraction and quote previews but only surfaces excerpts or inline playback to avoid full‐text copyright issues.

* **Pillar**  
  A broader topic or concept made up of Bricks. Visually a column holding up to 30 Bricks: they stack vertically up to 10 tall, then wrap into adjacent columns (up to 3 columns). At 10 Bricks, Aurora prompts you to split or continue stacking.

* **Portico**  
  A “floating roof” structure under which multiple Pillars are grouped.

* A “floating roof” grouping a set of Pillars.

* **Arch**  
  A visual link or summary element connecting two Pillars.

* **Palisade**  
  Your entire knowledge realm on a subject—Porticos, Pillars, Arches, Paths, etc.

* **Path**  
  A sequence of Bricks or Pillars forming a journey between two Palisades or Porticos.

* **Quarry**  
  A staging area where Bricks live if you defer building immediately.

* **Pool**  
  A water‐themed holding area beneath each Portico for all curated assets—books, videos, notes, flowcharts, mind maps, drawings, AI snippets.

* **Float**  
  Passive listening mode focused on a chosen Brick, Pillar, Portico, or Palisade.

* **Ripple**  
  A notification or reminder—inside or outside the app—that nudges you to revisit or add content (e.g., scheduled Ripples or alerts when new relevant content appears).

## 1\. Core User Persona

**Alex**  
\- Lifelong learner or researcher  
\- Comfortable with digital tools, values simplicity & minimal distraction

**Goals & Pain Points**  
\- Quickly surface and assemble insights without manual note-taking  
\- Seamlessly switch between voice ↔ keyboard input and passive listening  
\- Build/navigate a modular, visual “knowledge world”  
\- Context-switching and long-form content feel overwhelming

## 2\. Top 6 Use Cases

1. **Voice-Driven Exploration**  
   Tap the mic → speak a question → view transcript & send → Aurora/Echo response.

2. **Quick Idea Capture**  
   Jot or speak a quick Pillar idea or Brick prompt (keyboard or voice) → save & optionally schedule a Ripple.

3. **Passive Listening & Discovery (Float Mode)**  
   Relax with curated snippets or full-length Bricks from my Pillar/Portico/Pool, mixing in new suggestions.

4. **AI-Guided World Building**  
   Aurora/Echo: start a Portico/Pillar/Palisade on a topic or creator (e.g. Dr. Kip Davis) → AI scaffolds Bricks & structure.

5. **Conversational & URL-Driven Brick Capture**  
   Click Brick icon or speak: paste URL or describe content → AI extracts metadata or searches → draft Brick in Quarry or build flow.

6. **Ripple Notifications**  
   Get nudged inside or outside the app to revisit content or when new on-topic videos/articles appear.

## 3\. User Stories & Acceptance Criteria

| As a… | I want to… | So that… |
| :---- | :---- | :---- |
| **Guest** | land on the homepage and begin aggregating content—from my videos, AI-assembled clips, or remembered ideas | I can collect and structure viewpoints regardless of source |
| **User** | tap the mic and speak or type a query | I can ask questions hands-free or enter ideas quickly |
| **User** | view & edit a real-time transcript | I can verify and refine my question before sending |
| **User** | send my transcript or typed query to Aurora/Echo | I receive an AI-generated answer or summary |
| **User** | enter Float mode on a Brick/Pillar/Portico/Palisade | I can passively explore my assembled insights or mix in new content |
| **User** | save a snippet or video clip to my Pool | I can revisit and organize important highlights |
| **User** | paste a URL or describe content to create a Brick | I never lose a good clip and can build later |
| **User** | after creating a Brick, choose “Add to Pillar,” “Start new Pillar/Portico/Palisade,” or “Save to Quarry” | I can decide my workflow or defer assembly |
| **User** | click a Brick to enlarge it | I see a sketched thumbnail, summary, and Play ▶ button |
| **User** | play the full Brick video inline or open YouTube | I can watch the entire content without leaving the app |
| **User** | ask “Find the snippet where they discuss X” | I jump to the exact timestamp or see the quoted text |
| **User** | receive AI suggestions for related Bricks after adding one | I discover complementary content |
| **User** | build more than 10 Bricks in a Pillar | I’m prompted to split or start an adjacent Pillar |
| **User** | hover over a Brick in a multi-column Pillar | I can preview Brick details on hover |
| **User** | say “Aurora, build a Pillar of \[Creator\]’s top videos on X” | I assemble a Pillar around that creator’s work |
| **User** | say “Echo, build an Arch between Pillar A & Pillar B” | I see a visual connection and summary between topics |
| **User** | say “Aurora, I don’t know where to begin” | I get a menu: Palisade, Portico, Pillar, Brick, or Float |

## 4\. UI & Interaction Guidelines

### 4.1 Visual Principles

* **Charcoal-on-Cream** aesthetic: pencil-sketch style on an off-white background for minimal distraction.

* **Floating UI**: toolbar icons hover over the canvas; forms and panes slide in contextually.

### 4.2 Layout & Form-Factors

* **Full Tablet Mode**: central canvas for world map or Portico view; slide-out toolbar on left.

* **Mini-Widget Mode**: compact “watch” or “Float” widget (e.g. Apple Watch–sized) showing current playback & quick controls.

* **Responsive**: collapsible toolbar, scalable canvas, accessible font sizes.

### 4.3 Toolbar Icons

| Icon | Action |
| :---- | :---- |
| 📦 Brick | Create/capture a Brick (URL or description) |
| 🏛 Pillar | Start or add to a Pillar |
| 🏛🏠 Portico | Group multiple Pillars |
| 🏰 Palisade | View entire knowledge realm |
| 🔨 Hammer | Curate contrarian snippets on a Brick |
| 🔪 Chisel | Extract key quotes/snippets from a Brick |
| 🪣 Bucket | Add content to the Pool |
| 🪶 Float | Enter passive listening/viewing mode |
| 🔔 Ripple | Manage notifications & reminders |
| 🔗 Arch/Path | Build visual links between Pillars |

### 4.4 Component Behaviors

* **Hover**: Icons highlight; Bricks enlarge to show title & summary preview.

* **Click/Drag**: Drag Brick onto a Pillar; click to open detail pane.

* **Voice Triggers**: “Hey Aurora…” or “Echo…” activate AI flows.

* **Persona Toggle**: Switch between Aurora (scaffolding, exploration) and Echo (deep dives, summaries).

### 4.5 States & Feedback

* **Idle**: muted pencil-stroke UI, low opacity.

* **Active Recording**: Mic glows; waveform animation.

* **Loading/Transcribing**: Skeleton panes; spinner in toolbar.

* **Error/Fallback**: Friendly AI message, “Sorry, can you rephrase?”

### 4.6 Accessibility & Modes

* **Low-Blue-Light / Pencil Mode**: reduce eye strain with high-contrast sketch filters.

* **Large-Font / High-Contrast**: for readability.

* **Keyboard-Only**: full feature parity for non-voice input.

## 5\. End-to-End User Flows

### Flow A: Voice Query → Reply

1. Landing → Homepage or World Map

2. Activate Mic → Mic icon tap

3. Record & Transcribe → Live transcript pane

4. Send Query → Aurora/Echo processes

5. Receive Answer → AI reply in pane

### Flow B: Quick Idea Capture

1. Click ✏️ or say “Quick idea”

2. Type/speak note → Optional schedule Ripple

3. Save to Quarry or assign to Pillar

### Flow C: AI-Guided World Building

1. Say “Aurora, start a Portico on \[Topic/Creator\]”

2. AI prompts: “Which Pillars to include?” or “Shall I suggest Bricks?”

3. User confirms → AI scaffolds Portico & populates initial Bricks

### Flow D: URL/Description-Driven Brick Capture

1. Click Brick icon

2. **Method A:** Paste URL → AI fetches metadata & transcript

3. **Method B:** Describe content (“That three-hour Lex Fridman interview…”) → AI searches & confirms

4. **Branch:** AI asks

   * Add to existing Pillar?

   * Start new Pillar/Portico/Palisade?

   * Save to Quarry for later

5. Complete action → Brick appears with thumbnail & summary

## 6\. Future Considerations

* Ambient & Binaural Overlays in Float Mode

* YouTube IFrame Streaming for full compliance

* Social/Shared Worlds: public Porticos & Palisades with subscription/collaboration

* Advanced Path Builder: AI-suggested stepping-stone Bricks between Palisades

* Personalized Ripple Filters: topic-specific, adjustable notification rules

* Enhanced Accessibility: custom sketch filters, transcript reading modes