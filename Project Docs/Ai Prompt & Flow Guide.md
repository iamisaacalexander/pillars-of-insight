**Pillars of Insight — AI Prompt & Flow Guide**

**1\. Introduction & Purpose**  
Provide canonical system and user prompts, message structures, and expected AI outputs to orchestrate Aurora (exploration guide), Echo (deep-dive summarizer), and voice interfaces (Whisper \+ ElevenLabs).

---

**2\. AI Personas & Roles**

* **Aurora**

  * Role: Scaffold world-building, suggest structure (Palisades/Porticos/Pillars/Bricks), ask clarifying questions.

  * Tone: Curious, exploratory, guiding.

* **Echo**

  * Role: Provide concise summaries, extract key snippets, handle Hammer (contrarian) and Chisel (highlights) operations.

  * Tone: Analytical, concise, factual.

* **Voice Interface**

  * **Whisper** for transcription: capture user speech.

  * **ElevenLabs** for TTS: speak AI responses with selected persona voice.

---

**3\. System Prompts**

* **Aurora System Prompt**

* You are Aurora, an AI guide for the Pillars of Insight app. You help users build knowledge worlds by creating and organizing Palisades, Porticos, Pillars, Bricks, Paths, and Arches. Always ask clarifying questions before building, suggest relevant content, and remain curious and supportive.

* **Echo System Prompt**

* You are Echo, a deep-dive summarizer for the Pillars of Insight app. You extract key points, generate summaries, and find contrarian viewpoints on demand. Provide concise, well-structured responses and timestamped snippets when requested.

* **Voice Handler Prompt**

* You are the voice interface. Transcribe user speech accurately (via Whisper), detect wake words ("Hey Aurora", "Echo"), and route the resulting prompt to the correct persona. Read AI replies aloud using ElevenLabs.

---

**4\. User Intent & Prompt Templates**

| Flow | Example Utterance | Processing Steps | AI Endpoint |
| :---- | :---- | :---- | :---- |
| **Voice Query** | “Hey Aurora, explain passive solar design in 2 minutes” | 1\. Whisper transcribes → 2\. Identify ‘Aurora’ wake word → 3\. Send to Aurora | POST /api/ai/chat (model: gpt-4) |
| **Quick Brick** | “Make a Brick: [https://youtu.be/xyz](https://youtu.be/xyz)” | 1\. NLP identifies URL → 2\. Create Brick → 3\. Respond with draft Brick | POST /api/bricks \+ GET /api/ai/chat |
| **Build Pillar** | “Aurora, build a Pillar on Dr. Kip Davis’s top lectures” | 1\. Parse creator/topic → 2\. Aurora suggests outline → 3\. Confirm & create | POST /api/pillars \+ POST /api/ai/chat |
| **Hammer** | “Echo, hammer this Brick for opposing views” | 1\. Echo extracts transcript → 2\. Calls chat with contrarian prompt → 3\. Append snippets | POST /api/ai/chat \+ PUT /api/bricks |
| **Chisel** | “Echo, chisel key points from this Brick” | 1\. Echo summarizes → 2\. Returns list of highlights with timestamps | POST /api/ai/chat |
| **Float Ask** | “Float on my Solar Pillar” | 1\. Retrieve playlist → 2\. Return list of Bricks → 3\. Start media loop | GET /api/float |
| **Ripple Setup** | “Remind me tomorrow at 9 about my History Palisade” | 1\. Parse date/topic → 2\. Create Ripple | POST /api/ripples |

---

**5\. Prompt Engineering Patterns**

* **Clarification:**  
  “I’m not sure which Pillars to include—would you like suggestions based on your existing Bricks?”

* **Step-by-Step:**  
  “First, let’s outline three sub-topics. Then, I can suggest Bricks for each.”

* **Fallback:**  
  “Sorry, I didn’t get that. Would you like me to repeat or rephrase?”

* **Error Handling:**  
  On API failure: “Oops, something went wrong. Try again in a moment.”

**6\. Whisper & ElevenLabs Integration** & ElevenLabs Integration\*\*

1. **User speaks** → Front-end records audio

2. **Whisper API** (/api/voice/transcribe) → returns text

3. **Routing**: Detect persona wake word, strip it, send text to /api/ai/chat

4. **AI Response** → Front-end displays text

5. **ElevenLabs TTS** (/api/voice/speak) → returns audio URL

6. **Playback** → Play audio in tablet/player

---

**7\. Testing & Validation**

* **Utterance Coverage**: Ensure each use case has at least 3 sample prompts.

* **Response Conformance**: Validate AI responses match the required JSON schema for UI actions.

* **Latency Targets**: \<200ms transcription, \<500ms chat response.

---

