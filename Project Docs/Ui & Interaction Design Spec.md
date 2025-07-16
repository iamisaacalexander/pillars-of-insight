**Pillars of Insight — UI & Interaction Design Spec**

**1\. Introduction & Purpose** Define the look, feel, and interactive behaviors for the Pillars of Insight app, ensuring consistency with the UX foundations in the Product & UX Definition.

**2\. Design Principles** \- **Modular & Sketchy:** Hand-drawn charcoal aesthetic on off‑white canvas. \- **Lightweight & Fast:** Minimal rendering overhead, subtle animations. \- **Intuitive & Accessible:** Clear iconography, responsive layouts, keyboard/voice parity.

**3\. Visual Themes** \- **Color Palette:** Cream (\#F7F2EB), Charcoal (\#333333), PaperCream accents. \- **Typography:** Handwritten font (e.g. Caveat) for headings; serif (e.g. EB Garamond) for body. \- **Textures:** Subtle paper grain overlay; charcoal stroke borders.

**4\. Layout & Form Factors** \- **Tablet Mode:** Draggable, resizable panel with three states (normal, header, compact). \- **Mini-Widget:** Watch‑sized floating button for quick mic/float access. \- **Responsive Breakpoints:** Adjust padding, font sizes, and toolbar positioning.

**5\. Core UI Components**

**5.1 Tablet Frame & Content Area** \- Background image: pencil-sketched tablet outline. \- Title bar: persona toggle (Aurora/Echo), minimize/restore button, settings. \- Content area: world map canvas, transcript textarea, AI response pane, media player.

**5.2 Toolbar & ToolsPanel** \- **Icons:** \- 📦 Brick: Create/capture a Brick (URL or description) \- 🏛 Pillar: Start or add to a Pillar \- 🏛🏠 Portico: Group multiple Pillars under a floating roof \- 🏰 Palisade: View entire knowledge realm \- 🔨 Hammer: Curate contrarian snippets on a Brick \- 🔪 Chisel: Extract key quotes/snippets from a Brick \- 🪣 Pool: Add content to the Pool \- 🪶 Float: Enter passive listening/viewing mode \- 🔔 Ripple: Manage notifications & reminders \- 🔗 Arch/Path: Open submenu to Build Arch or Create Path

* **States:** Idle, hover (pencil-float glow), active.

* **Behavior:** Slide-out panel on Tablet Mode; collapsed icon row on Mini-Widget.

**5.3 Persona Toggle** \- Two-state switch: Aurora (exploration scaffold) vs Echo (deep dive summaries). \- Toggle with handwritten labels and subtle color cues.

**5.4 World Map List** \- Hierarchical view: Porticos → Pillars → Bricks. \- Click to navigate, drag-and-drop to reorganize. \- Add buttons to create new elements at each level.

**6\. Interaction Patterns**

**6.1 Voice Input** \- Click mic icon or say “Hey Aurora…” → recording state with waveform. \- Mic icon pulsing during record; click or voice command to stop. \- Placeholder “📝 Transcribing…” until transcript appears.

**6.2 Keyboard Input** \- Enter key sends queries in transcript textarea or Quick Entry. \- Shortcuts: Cmd+Enter to send, Cmd+K to open Quick Entry.

**6.3 Brick Capture** \- Click Brick icon → popover for URL or natural-language description. \- AI extracts metadata (title, thumbnail) or searches when described. \- Next-step menu: Add to Pillar | New Pillar/Portico | Save to Quarry.

**6.4 AI-Guided World Builder** \- Click “World Builder” or voice “Aurora, start a Portico on X.” \- AI menu prompts for element selection and topic/creator. \- System scaffolds structure and suggests initial Bricks.

**6.5 Float Mode** \- Click feather icon → overlay with mini-player and playlist. \- Controls: play/pause, skip, volume. \- Supports passive viewing/listening; video thumbnail small but playable.

**7\. Component States & Animations** \- **Recording:** Mic icon pulsing; waveform animated. \- **Thinking:** Spinner or “💡 Thinking…” in AI pane. \- **Hover:** Icons jiggle and brighten; Bricks scale up slightly. \- **Expand Brick:** Smooth scale transition with drop-shadow.

**8\. Accessibility & Keyboard Support** \- Full tab navigation and ARIA labels for icons and buttons. \- High-contrast toggle and large-text mode. \- Voice commands and keyboard-only workflows supported.

**9\. Sketch-Style Guidelines** \- Stroke width 2–3px, with natural variation. \- Irregular border corners for hand-drawn feel. \- Light hatching fill textures for panels and backgrounds.

**10\. Appendix: Icon Assets & Specifications** \- SVGs with pencil-style strokes; transparent backgrounds. \- Naming conventions: icon\_brick.svg, icon\_pillar.svg, etc. \- Size guidelines: default 32×32px, high-DPI variants at 2×.

---

*Next: Validate with UX doc, then proceed to Data Model & API Definition.*