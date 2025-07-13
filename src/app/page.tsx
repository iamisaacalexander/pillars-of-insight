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
    } catch {
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

  // Add float state for playlist results
  // Define a type for float playlist videos
  type FloatVideo = {
    url: string;
    title: string;
    channel: string;
    duration: string;
    why: string;
  };
  const [floatPlaylist, setFloatPlaylist] = useState<{ contextId: string, playlist: FloatVideo[] } | null>(null);

  return (
    <>
      {/* ─── Header w/ Tools Toggle ─────────────────────────────── */}
      <header className="fixed top-0 left-0 w-full h-12 bg-gray-800 text-white flex items-center justify-center z-20 shadow-md">
        <span className="text-xl font-bold handwritten">Pillars of Insight</span>
        <button
          onClick={()=>setToolsOpen(o=>!o)}
          className="absolute right-4"
        >
          <Image src="/assets/tools-icon.png" alt="Tools" width={24} height={24} className="w-6 h-6" />
        </button>
      </header>

      {/* ─── Sliding Tools Panel ──────────────────────────────────── */}
      {toolsOpen && <ToolsPanel tools={tools} />}

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
          <div
            className={`relative flex h-full transition-all duration-300 ease-in-out ${tabletMode === "compact" ? "shadow-lg" : "shadow-2xl"}`}
            style={{ background: 'none' }}
          >
            {/* Tablet PNG background */}
            <Image
              src={tabletMode === "compact" ? "/assets/tablet-mini.png" : "/assets/tablet.png"}
              alt="Tablet"
              fill
              className="absolute left-0 top-0 w-full h-full z-0 pointer-events-none select-none transition-all duration-300"
              style={{ objectFit: 'fill' }}
              priority
              draggable={false}
            />
            {/* Tablet content */}
            <div
              className={`relative flex flex-col flex-1 h-full z-10 transition-all duration-300 tablet-content`}
              style={{
                padding: tabletMode === "compact" ? 8 : 24,
                paddingTop: tabletMode === "compact" ? 8 : 24,
                paddingBottom: tabletMode === "compact" ? 8 : 24,
                paddingLeft: tabletMode === "compact" ? 8 : 24,
                paddingRight: tabletMode === "compact" ? 8 : 24,
                background: 'none',
                minHeight: 0,
                justifyContent: 'flex-start',
              }}
            >
              {/* Title Bar */}
              <div
                className="flex items-center justify-between px-4 py-2 bg-white bg-opacity-30 rounded-t-lg shadow-sm handwritten text-xl font-bold text-charcoal"
                style={{ minHeight: HEADER_BAR_HEIGHT, marginBottom: 8 }}
              >
                <span>{persona === "aurora" ? "Aurora" : persona === "echo" ? "Echo" : "GPT"}</span>
                <button
                  onClick={cycleTabletMode}
                  className="pencil-float text-charcoal hover:text-gray-800 transition-transform duration-200 active:scale-95"
                  title={
                    tabletMode === "normal" ? "Minimize to header" :
                    tabletMode === "header" ? "Compact mode" :
                    "Restore full"
                  }
                >
                  {tabletMode === "compact" ? <FaWindowRestore /> :
                    tabletMode === "header" ? <FaSquare /> :
                      <FaWindowMinimize />}
                </button>
              </div>
              {/* Transcript Area */}
              {tabletMode !== "header" && (
                <div className="flex-1 flex flex-col justify-start">
                  <textarea
                    value={transcript}
                    onChange={e => setTranscript(e.target.value)}
                    placeholder="Your transcript will appear here…"
                    className="w-full h-32 bg-white bg-opacity-10 rounded-lg text-base text-charcoal resize-none focus:outline-none focus:ring-2 focus:ring-charcoal mb-4 shadow-none border-none"
                    style={{ minHeight: 96, maxHeight: 160, marginTop: 8, marginBottom: 8 }}
                  />
                  {/* GPT Reply */}
                  <div className="flex-1 p-3 mb-4 bg-white bg-opacity-10 rounded-lg text-base text-charcoal overflow-auto ai-dialogue shadow-none border-none" style={{ minHeight: 80 }}>
                    {gptReply || "GPT reply will appear here…"}
                  </div>
                  {/* Controls */}
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={handleMicClick}
                      className={`flex-1 flex items-center justify-center py-2 px-4 border-2 border-charcoal text-charcoal rounded-lg font-semibold transition hover:bg-charcoal hover:text-white pencil-float ${
                        isRecording ? "bg-opacity-10" : ""
                      }`}
                    >
                      <FaMicrophone className="mr-2" />{
                        isRecording ? "Stop Recording" : "Start Recording"
                      }
                    </button>
                    <button
                      onClick={handleSendClick}
                      className="flex-1 flex items-center justify-center py-2 px-4 border-2 border-charcoal text-charcoal rounded-lg font-semibold transition hover:bg-charcoal hover:text-white pencil-float"
                    >
                      <FaPaperPlane className="mr-2" />Send to GPT
                    </button>
                  </div>
                  {/* Audio Meter */}
                  {isRecording && (
                    <div className="w-full flex items-end gap-0.5 h-12">
                      {freqData.map((lvl, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-charcoal to-paperCream rounded-sm transition-all"
                          style={{ height: `${lvl * 100}%` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Toolbar attached to tablet, right side */}
            {tabletMode !== "compact" ? (
              <div className="tablet-toolbar absolute right-0 top-0 h-full flex items-center z-20 pointer-events-auto">
                <ToolsPanel tools={tools} />
              </div>
            ) : (
              <button
                className="absolute right-2 top-2 z-30 bg-transparent border-none p-0"
                onClick={() => setTabletMode("normal")}
                title="Show tools"
              >
                <Image src="/assets/tools-icon.png" alt="Tools" width={32} height={32} />
              </button>
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
