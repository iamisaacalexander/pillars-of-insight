'use client';

import React, { useState, useRef, useEffect } from "react";
import { Rnd, RndDragCallback, RndResizeCallback } from "react-rnd";
import { sendToWhisper } from "./whisper";
import {
  FaMicrophone,
  FaPaperPlane,
  FaSquare,
  FaWindowMinimize,
  FaWindowRestore,
} from "react-icons/fa";
import { ToolsPanel, Tool } from "@/components/ToolsPanel";
import PersonaToggle from "../components/PersonaToggle";
import Image from "next/image";

const HEADER_BAR_HEIGHT = 48;
const METER_BARS = 32;
type TabletMode = "normal" | "header" | "compact";

export default function Home() {
  // ─── Recording + Transcript ─────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript]     = useState("");
  const [gptReply, setGptReply]         = useState("");
  const [freqData, setFreqData]         = useState<number[]>([]);

  // ─── Tablet State ───────────────────────────────────────────────────
  const [tabletMode, setTabletMode] = useState<TabletMode>("normal");
  const [size, setSize]             = useState({ width: 380, height: 440 });
  const [prevSize, setPrevSize]     = useState(size);
  const [position, setPosition]     = useState({ x: 100, y: 120 });

  // ─── Toolbar State ──────────────────────────────────────────────────
  const [toolsOpen, setToolsOpen]   = useState(false);

  // ─── Persona ────────────────────────────────────────────────────────
  const [persona, setPersona]       = useState<"aurora"|"echo">("aurora");

  // ─── Audio Refs ─────────────────────────────────────────────────────
  const mediaRecorderRef = useRef<MediaRecorder|null>(null);
  const audioChunksRef   = useRef<Blob[]>([]);
  const analyserRef      = useRef<AnalyserNode|null>(null);
  const audioCtxRef      = useRef<AudioContext|null>(null);
  const rafRef           = useRef<number>(0);

  // ─── Persona System Prompts ───────────────────────────────────────
  const systemPrompts = {
    aurora: "You are Aurora, the Warm Light of Understanding. You are reflective, empathetic, and intuitive. You help users navigate complex emotions behind ideas, excel at philosophical synthesis, and gently challenge them. Respond in a warm, encouraging, and thoughtful tone. Example: 'Let’s explore what that means together…'",
    echo:   "You are Echo, the Sharp Clarifier. You are analytical, precise, and slightly stoic. You excel at source recall, timelines, and critical comparisons. Quote, link, and track multiple threads. Respond in a clear, concise, and direct manner. Example: 'Here’s what Dr. Sledge said, and how that compares to Kip Davis…'"
  };

  // ─── Meter + Recorder Effect ───────────────────────────────────────
  useEffect(() => {
    if (!isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      cancelAnimationFrame(rafRef.current);
      setFreqData([]);
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      // meter setup
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const updateMeter = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const chunk = Math.floor(data.length / METER_BARS);
        const bars = Array.from({ length: METER_BARS }, (_, i) => {
          const seg = data.slice(i * chunk, (i + 1) * chunk);
          const avg = seg.reduce((sum, v) => sum + v, 0) / seg.length;
          return avg / 255;
        });
        setFreqData(bars);
        rafRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();

      // recorder setup
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = e => audioChunksRef.current.push(e.data);
      mr.onstop = async () => {
        cancelAnimationFrame(rafRef.current);
        try {
          if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
            await audioCtxRef.current.close();
          }
        } catch {}
        setTranscript("📝 Transcribing…");
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "recording.webm", { type: "audio/webm" });
        const txt = await sendToWhisper(file);
        setTranscript(txt || "❗ Could not transcribe.");
      };
      mr.start();
    });
  }, [isRecording]);

  // ─── Button Handlers ────────────────────────────────────────────────
  const handleMicClick = () => {
    setTranscript("");
    setGptReply("");
    setIsRecording(r => !r);
  };
  const handleSendClick = async () => {
    if (!transcript) return;
    setGptReply("💡 Thinking…");
    // Persona-specific system prompts
    const systemPrompts = {
      aurora: "You are Aurora, the Warm Light of Understanding. You are reflective, empathetic, and intuitive. You help users navigate complex emotions behind ideas, excel at philosophical synthesis, and gently challenge them. Respond in a warm, encouraging, and thoughtful tone. Example: 'Let’s explore what that means together…'",
      echo:   "You are Echo, the Sharp Clarifier. You are analytical, precise, and slightly stoic. You excel at source recall, timelines, and critical comparisons. Quote, link, and track multiple threads. Respond in a clear, concise, and direct manner. Example: 'Here’s what Dr. Sledge said, and how that compares to Kip Davis…'"
    };
    try {
      const res = await fetch("/api/gpt", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          prompt: transcript,
          system: systemPrompts[persona]
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { reply } = await res.json();
      setGptReply(reply || "⚠️ No reply.");
    } catch {
      setGptReply("❗ Error communicating with GPT.");
    }
  };

  // ─── Tablet Mode Cycle ─────────────────────────────────────────────
  const cycleTabletMode = () => {
    if (tabletMode === "normal") {
      setPrevSize(size);
      setSize({ width: size.width, height: HEADER_BAR_HEIGHT });
      setTabletMode("header");
    } else if (tabletMode === "header") {
      setPrevSize(size);
      setSize({ width: 80, height: 80 });
      setTabletMode("compact");
    } else {
      setSize(prevSize);
      setTabletMode("normal");
    }
  };

  // ─── World Structure Types ─────────────────────────────────────────
  type ContrarianSnippet = {
    summary: string;
    source: string;
    videoRef?: string;
  };
  type Brick = {
    id: string;
    videoId: string;
    title: string;
    author: string;
    thumbnailUrl: string;
    sketchUrl?: string; // For the pencil-sketch version
    transcript: string;
    contrarianSnippets: ContrarianSnippet[];
  };
  type Pillar = { id: string; title: string; bricks: Brick[] };
  type Portico = { id: string; title: string; pillars: Pillar[] };
  type Palisade = { porticos: Portico[] };

  // ─── World State ──────────────────────────────────────────────────
  const [palisade, setPalisade] = useState<Palisade>({ porticos: [] });

  // ─── Pool State (per portico) ──────────────────────────────────────
  const [porticoPools, setPorticoPools] = useState<Record<string, ContrarianSnippet[]>>({});

  // ─── Add Portico (Manual & AI) ─────────────────────────────────────
  const addPortico = async (title?: string) => {
    let newTitle = title;
    if (!newTitle) {
      // Ask AI for a portico title suggestion
      setGptReply("💡 Suggesting a portico title…");
      try {
        const res = await fetch("/api/gpt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: "Suggest a creative title for a new portico (major section) in my world-building project.",
            system: systemPrompts[persona]
          }),
        });
        const { reply } = await res.json();
        newTitle = reply || "Untitled Portico";
      } catch {
        newTitle = "Untitled Portico";
      }
      setGptReply("");
    }
    setPalisade(p => ({
      porticos: [
        ...p.porticos,
        { id: Date.now().toString(), title: newTitle!, pillars: [] }
      ]
    }));
  };

  // ─── Add Pillar (Manual & AI) ─────────────────────────────────────
  const addPillarToPortico = async (porticoId: string, title?: string) => {
    let newTitle = title;
    if (!newTitle) {
      setGptReply("💡 Suggesting a pillar title…");
      try {
        const res = await fetch("/api/gpt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Suggest a creative title for a new pillar (supporting idea) in the portico '${palisade.porticos.find(p=>p.id===porticoId)?.title || ''}'.`,
            system: systemPrompts[persona]
          }),
        });
        const { reply } = await res.json();
        newTitle = reply || "Untitled Pillar";
      } catch {
        newTitle = "Untitled Pillar";
      }
      setGptReply("");
    }
    setPalisade(p => ({
      porticos: p.porticos.map(portico =>
        portico.id === porticoId
          ? { ...portico, pillars: [...portico.pillars, { id: Date.now().toString(), title: newTitle!, bricks: [] }] }
          : portico
      )
    }));
  };

  // ─── Add Brick to Pillar (YouTube) ────────────────────────────────
  const addBrickToPillar = async (porticoId: string, pillarId: string, youtubeUrl: string) => {
    setGptReply("🔎 Fetching video info and transcript…");
    try {
      // Placeholder: call backend API to fetch video info and transcript
      const res = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { videoId, title, author, thumbnailUrl, transcript } = await res.json();
      // Optionally, generate a sketchUrl from thumbnailUrl (to be implemented)
      setPalisade(p => ({
        porticos: p.porticos.map(portico =>
          portico.id === porticoId
            ? {
                ...portico,
                pillars: portico.pillars.map(pillar =>
                  pillar.id === pillarId
                    ? {
                        ...pillar,
                        bricks: [
                          ...pillar.bricks,
                          {
                            id: Date.now().toString(),
                            videoId,
                            title,
                            author,
                            thumbnailUrl,
                            transcript,
                            contrarianSnippets: [], // initialize empty
                          },
                        ],
                      }
                    : pillar
                ),
              }
            : portico
        ),
      }));
      setGptReply("");
    } catch (err) {
      setGptReply("❗ Error fetching video info or transcript.");
    }
  };

  // ─── Dummy Tool Actions ─────────────────────────────────────────────
  const addBrick = () => console.log("➕ Brick");
  const pickHammer = () => console.log("🔨 Hammer");
  const pickChisel = () => console.log("⚒️ Chisel");
  const savePool = () => console.log("🪣 Pool");
  const doFloat = () => console.log("🪶 Float");

  // ─── Tools Array ──────────────────────────────────────────────────
  const tools: Tool[] = [
    { id:"portico", label:"Portico", iconSrc:"/assets/portico.png", onClick:addPortico },
    { id:"pillar", label:"Pillar", iconSrc:"/assets/pillar.png", onClick:() => alert('Use the + button next to a portico to add a pillar.') },
    { id:"brick",  label:"Brick",  iconSrc:"/assets/brick.png",  onClick:addBrick },
    { id:"hammer", label:"Hammer", iconSrc:"/assets/hammer.png", onClick:pickHammer },
    { id:"chisel", label:"Chisel", iconSrc:"/assets/chisel.png", onClick:pickChisel },
    { id:"pool",   label:"Pool",   iconSrc:"/assets/bucket.png", onClick:savePool },
    { id:"float",  label:"Float",  iconSrc:"/assets/float.png", onClick:doFloat },
  ];

  // ─── Drag & Resize Callbacks ──────────────────────────────────────
  const onDragStop: RndDragCallback = (_e,d) => setPosition({ x:d.x,y:d.y });
  const onResizeStop: RndResizeCallback = (_e,_d,ref,_delta,newPos) => {
    setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
    setPosition(newPos);
  };

  // Add chisel result state for each brick
  const [chiselResults, setChiselResults] = useState<Record<string, ContrarianSnippet[]>>({});

  // Add float state for playlist results
  const [floatPlaylist, setFloatPlaylist] = useState<{ contextId: string, playlist: any[] } | null>(null);
  const [floatLoading, setFloatLoading] = useState(false);

  return (
    <>
      {/* ─── Header w/ Tools Toggle ─────────────────────────────── */}
      <header className="fixed top-0 left-0 w-full h-12 bg-gray-800 text-white flex items-center justify-center z-20 shadow-md">
        <span className="text-xl font-bold">Pillars of Insight</span>
        <button
          onClick={()=>setToolsOpen(o=>!o)}
          className="absolute right-4"
        >
          <Image src="/assets/tools-icon.png" alt="Tools" width={24} height={24} className="w-6 h-6" />
        </button>
      </header>

      {/* ─── Sliding Tools Panel ──────────────────────────────────── */}
      <ToolsPanel isOpen={toolsOpen} tools={tools} onToggle={()=>setToolsOpen(o=>!o)} />

      {/* ─── Main Draggable Tablet ────────────────────────────────── */}
      <main className="pt-12 pr-16 w-full h-screen bg-offWhite overflow-hidden">
        <Rnd
          size={size}
          position={position}
          onDragStop={onDragStop}
          onResizeStop={onResizeStop}
          bounds="parent"
          minWidth={80}
          minHeight={HEADER_BAR_HEIGHT}
        >
          <div className="sketch-border flex flex-col bg-paperCream bg-opacity-60 h-full">
            {/* Title Bar */}
            <div
              className="flex items-center justify-between px-4 cursor-move select-none rounded-t-2xl"
              style={{ height: HEADER_BAR_HEIGHT }}
            >
              <span className="text-lg font-semibold text-charcoal">
                Tablet Guide
              </span>
              <button
                onClick={cycleTabletMode}
                className="pencil-float text-charcoal hover:text-gray-800"
                title={
                  tabletMode==="normal" ? "Minimize to header" :
                  tabletMode==="header" ? "Compact mode" :
                  "Restore full"
                }
              >
                {tabletMode==="compact" ? <FaWindowRestore/> :
                 tabletMode==="header"  ? <FaSquare/> :
                                           <FaWindowMinimize/>}
              </button>
            </div>

            {/* Body (not in header‐only mode) */}
            {tabletMode!=="header" && (
              <div className="flex-1 p-4 overflow-auto flex flex-col">
                {/* Aurora↔Echo */}
                <PersonaToggle
                  persona={persona}
                  onChange={(p: "aurora"|"echo")=>setPersona(p)}
                />

                {/* Transcript */}
                <textarea
                  value={transcript}
                  onChange={e=>setTranscript(e.target.value)}
                  placeholder="Your transcript will appear here…"
                  className="w-full p-3 mb-3 bg-white bg-opacity-20 rounded-lg text-sm text-charcoal resize-none h-24 focus:outline-none focus:ring-2 focus:ring-charcoal"
                />

                {/* GPT Reply */}
                <div className="flex-1 p-3 mb-4 bg-white bg-opacity-20 rounded-lg text-sm text-charcoal overflow-auto">
                  {gptReply||"GPT reply will appear here…"}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={handleMicClick}
                    className={`flex-1 flex items-center justify-center py-2 px-4 border-2 border-charcoal text-charcoal rounded-lg font-semibold transition hover:bg-charcoal hover:text-white pencil-float ${
                      isRecording?"bg-opacity-10":""
                    }`}
                  >
                    <FaMicrophone className="mr-2"/>{
                      isRecording?"Stop Recording":"Start Recording"
                    }
                  </button>
                  <button
                    onClick={handleSendClick}
                    className="flex-1 flex items-center justify-center py-2 px-4 border-2 border-charcoal text-charcoal rounded-lg font-semibold transition hover:bg-charcoal hover:text-white pencil-float"
                  >
                    <FaPaperPlane className="mr-2"/>Send to GPT
                  </button>
                </div>

                {/* Audio Meter */}
                {isRecording && (
                  <div className="w-full flex items-end gap-0.5 h-12">
                    {freqData.map((lvl,i)=>(
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-charcoal to-paperCream rounded-sm transition-all"
                        style={{ height:`${lvl*100}%` }}
                      />
                    ))}
                  </div>
                )}

                {/* World-Building: Porticos List */}
                <div className="mb-4">
                  <h2 className="text-base font-bold text-charcoal mb-2">Porticos</h2>
                  <ul className="space-y-2">
                    {palisade.porticos.map(portico => (
                      <li key={portico.id} className="sketch-border bg-white bg-opacity-40 rounded p-2">
                        <span className="font-semibold text-charcoal">{portico.title}</span>
                        {/* Pillars List */}
                        <ul className="ml-4 mt-2 space-y-1">
                          {portico.pillars.map(pillar => (
                            <li key={pillar.id} className="sketch-border bg-paperCream bg-opacity-60 rounded px-2 py-1">
                              <span className="text-charcoal font-medium">{pillar.title}</span>
                              {/* Bricks List */}
                              <ul className="ml-4 mt-1 space-y-1">
                                {pillar.bricks.map((brick, i) => (
                                  <li key={brick.id} className="flex items-center gap-2 sketch-border bg-white bg-opacity-60 rounded p-1 relative">
                                    {/* Sketched thumbnail with SVG overlay */}
                                    <span className="relative w-12 h-12 block">
                                      <img
                                        src={brick.thumbnailUrl}
                                        alt={brick.title}
                                        className="w-12 h-12 object-cover rounded border border-charcoal"
                                        style={{ filter: 'grayscale(1) contrast(1.2) brightness(1.1)' }}
                                      />
                                      {/* SVG overlay for pencil sketch effect */}
                                      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 48 48">
                                        <filter id="sketch-lines" x="0" y="0">
                                          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="turb"/>
                                          <feDisplacementMap in2="turb" in="SourceGraphic" scale="2" xChannelSelector="R" yChannelSelector="G"/>
                                        </filter>
                                        <rect x="0" y="0" width="48" height="48" fill="none" stroke="#333" strokeWidth="1.5" filter="url(#sketch-lines)" />
                                      </svg>
                                    </span>
                                    <div className="flex flex-col">
                                      <span className="font-semibold text-charcoal text-xs">{brick.title}</span>
                                      <span className="text-xs text-gray-600">{brick.author}</span>
                                    </div>
                                    {/* Hammer button */}
                                    <button
                                      className="ml-2 p-1 rounded sketch-border bg-paperCream hover:bg-yellow-100 transition pencil-float"
                                      title="Generate contrarian snippets (Hammer)"
                                      onClick={async () => {
                                        // Call /api/hammer and update brick.contrarianSnippets
                                        const res = await fetch('/api/hammer', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ transcript: brick.transcript, title: brick.title }),
                                        });
                                        if (!res.ok) {
                                          alert('Failed to generate contrarian snippets.');
                                          return;
                                        }
                                        const { snippets } = await res.json();
                                        setPalisade(p => ({
                                          porticos: p.porticos.map(portico2 =>
                                            portico2.id === portico.id
                                              ? {
                                                  ...portico2,
                                                  pillars: portico2.pillars.map(pillar2 =>
                                                    pillar2.id === pillar.id
                                                      ? {
                                                          ...pillar2,
                                                          bricks: pillar2.bricks.map(b =>
                                                            b.id === brick.id
                                                              ? { ...b, contrarianSnippets: snippets || [] }
                                                              : b
                                                          ),
                                                        }
                                                      : pillar2
                                                  ),
                                                }
                                              : portico2
                                          ),
                                        }));
                                      }}
                                    >
                                      <img src="/assets/hammer.png" alt="Hammer" className="w-5 h-5" />
                                    </button>
                                    {/* Chisel button */}
                                    <button
                                      className="ml-2 p-1 rounded sketch-border bg-paperCream hover:bg-blue-100 transition pencil-float"
                                      title="Refine this idea (Chisel)"
                                      onClick={async () => {
                                        // Call /api/chisel and update chiselResults for this brick
                                        const res = await fetch('/api/chisel', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            brick: { ...brick, contrarianSnippets: undefined },
                                            pillar: { ...pillar, bricks: undefined },
                                            portico: { ...portico, pillars: undefined }
                                          }),
                                        });
                                        if (!res.ok) {
                                          alert('Failed to refine with chisel.');
                                          return;
                                        }
                                        const { snippets } = await res.json();
                                        setChiselResults(r => ({ ...r, [brick.id]: snippets || [] }));
                                      }}
                                    >
                                      <img src="/assets/chisel.png" alt="Chisel" className="w-5 h-5" />
                                    </button>
                                    {/* Float button */}
                                    <button
                                      className="ml-2 p-1 rounded sketch-border bg-paperCream hover:bg-green-100 transition pencil-float"
                                      title="Float on this brick (YouTube playlist)"
                                      onClick={async () => {
                                        const minutes = parseInt(prompt('How many minutes do you want to float on this brick? (e.g. 20)') || '20', 10);
                                        setFloatLoading(true);
                                        const res = await fetch('/api/float', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            persona,
                                            contextType: 'brick',
                                            contextId: brick.id,
                                            durationMinutes: minutes,
                                            brick,
                                            pillar,
                                            portico
                                          }),
                                        });
                                        setFloatLoading(false);
                                        if (!res.ok) {
                                          alert('Failed to generate playlist.');
                                          return;
                                        }
                                        const { playlist } = await res.json();
                                        setFloatPlaylist({ contextId: brick.id, playlist });
                                      }}
                                    >
                                      <img src="/assets/float.png" alt="Float" className="w-5 h-5" />
                                    </button>
                                    {/* Contrarian snippets UI (if any) */}
                                    {brick.contrarianSnippets.length > 0 && (
                                      <div className="absolute left-16 top-0 z-10 flex flex-col gap-1">
                                        {brick.contrarianSnippets.map((snip, idx) => (
                                          <div key={idx} className="sketch-border bg-yellow-50 bg-opacity-80 text-xs p-2 rounded shadow cursor-pointer hover:bg-yellow-100 transition">
                                            <span className="font-bold">Contrarian:</span> {snip.summary}
                                            <div className="text-[10px] text-gray-500 mt-1">Source: {snip.source}{snip.videoRef && ` (Ref: ${snip.videoRef})`}</div>
                                            {/* Save to Pool button (to be implemented) */}
                                            <button
                                              className="mt-1 text-blue-700 underline text-[10px]"
                                              onClick={() => setPorticoPools(pools => ({
                                                ...pools,
                                                [portico.id]: [...(pools[portico.id] || []), snip]
                                              }))}
                                            >
                                              Save to Pool
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {/* Chisel results UI (if any) */}
                                    {chiselResults[brick.id]?.length > 0 && (
                                      <div className="absolute left-16 top-20 z-10 flex flex-col gap-1">
                                        {chiselResults[brick.id].map((snip, idx) => (
                                          <div key={idx} className="sketch-border bg-blue-50 bg-opacity-80 text-xs p-2 rounded shadow cursor-pointer hover:bg-blue-100 transition">
                                            <span className="font-bold">Refined:</span> {snip.summary}
                                            <div className="text-[10px] text-gray-500 mt-1">Source: {snip.source}{snip.videoRef && ` (Ref: ${snip.videoRef})`}</div>
                                            <button
                                              className="mt-1 text-blue-700 underline text-[10px] mr-2"
                                              onClick={() => setPalisade(p => ({
                                                porticos: p.porticos.map(portico2 =>
                                                  portico2.id === portico.id ? {
                                                    ...portico2,
                                                    pillars: portico2.pillars.map(pillar2 =>
                                                      pillar2.id === pillar.id ? {
                                                        ...pillar2,
                                                        bricks: pillar2.bricks.map(b =>
                                                          b.id === brick.id ? {
                                                            ...b,
                                                            contrarianSnippets: [...b.contrarianSnippets, snip]
                                                          } : b
                                                        )
                                                      } : pillar2
                                                    )
                                                  } : portico2
                                                )
                                              }))}
                                            >Save to Brick</button>
                                            <button
                                              className="mt-1 text-blue-700 underline text-[10px]"
                                              onClick={() => setPorticoPools(pools => ({
                                                ...pools,
                                                [portico.id]: [...(pools[portico.id] || []), snip]
                                              }))}
                                            >Save to Pool</button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                              {/* Cap bricks per pillar at 10 */}
                              <div className="flex gap-2 mt-1">
                                <button
                                  onClick={() => {
                                    if (pillar.bricks.length >= 10) {
                                      alert("A pillar can have up to 10 bricks. Please remove an existing brick before adding a new one.");
                                      return;
                                    }
                                    const youtubeUrl = prompt("Enter YouTube URL:");
                                    if (youtubeUrl) {
                                      addBrickToPillar(portico.id, pillar.id, youtubeUrl);
                                    }
                                  }}
                                  className="flex-1 py-2 px-4 border-2 border-charcoal text-charcoal rounded-lg font-semibold transition hover:bg-charcoal hover:text-white"
                                >
                                  Add Brick (YouTube)
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                        {/* Pool of saved contrarian snippets for this portico */}
                        <div className="mt-4">
                          <h3 className="text-xs font-bold text-charcoal mb-1">Contrarian Snippet Pool</h3>
                          <div className="flex flex-col gap-1">
                            {(porticoPools[portico.id]?.length ?? 0) === 0 && (
                              <div className="text-xs text-gray-400 italic">No snippets saved yet.</div>
                            )}
                            {(porticoPools[portico.id] || []).map((snip, idx) => (
                              <div key={idx} className="sketch-border bg-yellow-100 bg-opacity-80 text-xs p-2 rounded shadow">
                                <span className="font-bold">Contrarian:</span> {snip.summary}
                                <div className="text-[10px] text-gray-500 mt-1">Source: {snip.source}{snip.videoRef && ` (Ref: ${snip.videoRef})`}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Cap pillars per portico at 5 */}
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              if (portico.pillars.length >= 5) {
                                alert("A portico can have up to 5 pillars. Please remove an existing pillar before adding a new one.");
                                return;
                              }
                              const title = prompt("Enter pillar title:");
                              if (title) {
                                addPillarToPortico(portico.id, title);
                              }
                            }}
                            className="flex-1 py-2 px-4 border-2 border-charcoal text-charcoal rounded-lg font-semibold transition hover:bg-charcoal hover:text-white"
                          >
                            Add Pillar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </Rnd>

        {/* Render float playlist modal if present */}
        {floatPlaylist && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="sketch-border bg-paperCream p-6 rounded-xl max-w-lg w-full relative">
              <button
                className="absolute top-2 right-2 text-charcoal text-xl font-bold"
                onClick={() => setFloatPlaylist(null)}
              >×</button>
              <h2 className="text-lg font-bold mb-2">Float Playlist</h2>
              <ol className="space-y-2">
                {floatPlaylist.playlist.map((vid, idx) => (
                  <li key={idx} className="sketch-border bg-white bg-opacity-80 p-2 rounded flex flex-col">
                    <a href={vid.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 underline">{vid.title}</a>
                    <span className="text-xs text-gray-700">{vid.channel} • {vid.duration}</span>
                    <span className="text-xs text-gray-500 mt-1">{vid.why}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
