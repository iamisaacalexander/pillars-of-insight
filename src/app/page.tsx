'use client';

import React, { useState, useRef, useEffect } from "react";
import { Rnd, RndResizeCallback, RndDragCallback } from "react-rnd";
import { sendToWhisper } from "./whisper";
import {
  FaMicrophone,
  FaPaperPlane,
  FaSquare,
  FaWindowMinimize,
  FaWindowRestore,
} from "react-icons/fa";
import { ToolsPanel, Tool } from "@/components/ToolsPanel";

const HEADER_BAR_HEIGHT = 48;
const METER_BARS = 32;

type TabletMode = "normal" | "header" | "compact";

export default function Home() {
  // — Recording & transcript state
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [gptReply, setGptReply] = useState("");
  const [freqData, setFreqData] = useState<number[]>([]);

  // — Tablet position/size/mode
  const [tabletMode, setTabletMode] =
    useState<TabletMode>("normal");
  const [size, setSize] = useState({ width: 380, height: 440 });
  const [prevSize, setPrevSize] = useState(size);
  const [position, setPosition] = useState({ x: 100, y: 120 });

  // — Tools panel open/closed
  const [toolsOpen, setToolsOpen] = useState(false);

  // — Refs for audio analysis
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);

  // — Audio recording + meter effect
  useEffect(() => {
    if (!isRecording) {
      mediaRecorderRef.current?.state !== "inactive" &&
        mediaRecorderRef.current?.stop();
      cancelAnimationFrame(rafRef.current);
      setFreqData([]);
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        // setup analyzer
        const audioCtx = new AudioContext();
        audioCtxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const updateMeter = () => {
          const data = new Uint8Array(
            analyser.frequencyBinCount
          );
          analyser.getByteFrequencyData(data);
          const chunkSize = Math.floor(
            data.length / METER_BARS
          );
          const bars = Array.from(
            { length: METER_BARS },
            (_, i) => {
              const slice = data.slice(
                i * chunkSize,
                (i + 1) * chunkSize
              );
              const avg =
                slice.reduce((sum, v) => sum + v, 0) /
                slice.length;
              return avg / 255;
            }
          );
          setFreqData(bars);
          rafRef.current = requestAnimationFrame(
            updateMeter
          );
        };
        updateMeter();

        // setup recorder
        const mr = new MediaRecorder(stream);
        mediaRecorderRef.current = mr;
        audioChunksRef.current = [];
        mr.ondataavailable = (e) =>
          audioChunksRef.current.push(e.data);
        mr.onstop = async () => {
          cancelAnimationFrame(rafRef.current);
          try {
            if (
              audioCtxRef.current &&
              audioCtxRef.current.state !== "closed"
            ) {
              await audioCtxRef.current.close();
            }
          } catch {}
          setTranscript("📝 Transcribing…");
          const blob = new Blob(
            audioChunksRef.current,
            { type: "audio/webm" }
          );
          const file = new File([blob], "recording.webm", {
            type: "audio/webm",
          });
          const text = await sendToWhisper(file);
          setTranscript(text || "❗ Could not transcribe.");
        };
        mr.start();
      });
  }, [isRecording]);

  // — UI handlers
  const handleMicClick = () => {
    setTranscript("");
    setGptReply("");
    setIsRecording((r) => !r);
  };
  const handleSendClick = async () => {
    if (!transcript) return;
    setGptReply("💡 Thinking…");
    try {
      const res = await fetch("/api/gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: transcript }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { reply } = await res.json();
      setGptReply(reply || "⚠️ No reply.");
    } catch {
      setGptReply("❗ Error communicating with GPT.");
    }
  };

  // — Change tablet mode: full → header only → compact
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

  // — Your “build” / tool actions (stubbed for now)
  const addPortico = () => console.log("➕ Portico");
  const addPillar = () => console.log("➕ Pillar");
  const addBrick = () => console.log("➕ Brick");
  const selectHammer = () => console.log("🔨 Hammer");
  const selectChisel = () => console.log("⚒️ Chisel");
  const saveToPool = () => console.log("🪣 Pool");
  const curateFloat = () => console.log("🪶 Float");

  // — Assemble into the single tools array
  const tools: Tool[] = [
    {
      id: "portico",
      label: "Portico",
      iconSrc: "/assets/portico.png",
      onClick: addPortico,
    },
    {
      id: "pillar",
      label: "Pillar",
      iconSrc: "/assets/pillar.png",
      onClick: addPillar,
    },
    {
      id: "brick",
      label: "Brick",
      iconSrc: "/assets/brick.png",
      onClick: addBrick,
    },
    {
      id: "hammer",
      label: "Hammer",
      iconSrc: "/assets/hammer.png",
      onClick: selectHammer,
    },
    {
      id: "chisel",
      label: "Chisel",
      iconSrc: "/assets/chisel.png",
      onClick: selectChisel,
    },
    {
      id: "pool",
      label: "Pool",
      iconSrc: "/assets/bucket.png",
      onClick: saveToPool,
    },
    {
      id: "float",
      label: "Float",
      iconSrc: "/assets/feather.png",
      onClick: curateFloat,
    },
  ];

  // — Rnd drag & resize
  const onDragStop: RndDragCallback = (_e, d) =>
    setPosition({ x: d.x, y: d.y });
  const onResizeStop: RndResizeCallback = (
    _e,
    _dir,
    ref,
    _delta,
    newPos
  ) => {
    setSize({
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    });
    setPosition(newPos);
  };

  return (
    <>
      {/* fixed header */}
      <header className="fixed top-0 left-0 w-full h-12 bg-gray-800 text-white flex items-center justify-center z-20 shadow-md">
        <span className="text-xl font-bold">
          🧠 Pillars of Insight
        </span>
      </header>

      {/* tools panel */}
      <ToolsPanel
        isOpen={toolsOpen}
        onToggle={() => setToolsOpen((o) => !o)}
        tools={tools}
      />

      {/* main tablet */}
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
            {/* title bar */}
            <div
              className="flex items-center justify-between px-4 cursor-move select-none bg-transparent rounded-t-2xl"
              style={{ height: HEADER_BAR_HEIGHT }}
            >
              <span className="text-lg font-semibold text-charcoal">
                🧠 Tablet Guide
              </span>
              <button
                onClick={cycleTabletMode}
                className="text-charcoal hover:text-gray-800 pencil-float"
                title={
                  tabletMode === "normal"
                    ? "Minimize to header"
                    : tabletMode === "header"
                    ? "Compact mode"
                    : "Restore full"
                }
              >
                {tabletMode === "compact" ? (
                  <FaWindowRestore />
                ) : tabletMode === "header" ? (
                  <FaSquare />
                ) : (
                  <FaWindowMinimize />
                )}
              </button>
            </div>

            {/* body */}
            {tabletMode !== "header" && (
              <div className="flex-1 p-4 overflow-auto flex flex-col">
                {/* transcript */}
                <textarea
                  value={transcript}
                  onChange={(e) =>
                    setTranscript(e.target.value)
                  }
                  placeholder="🎙️ Your transcript will appear here…"
                  className="w-full p-3 mb-3 bg-white bg-opacity-20 rounded-lg text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-charcoal resize-none h-24"
                />

                {/* GPT reply */}
                <div className="flex-1 p-3 mb-4 bg-white bg-opacity-20 rounded-lg text-sm text-charcoal overflow-auto">
                  {gptReply ||
                    "🤖 GPT reply will appear here…"}
                </div>

                {/* controls */}
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={handleMicClick}
                    className={`flex-1 flex items-center justify-center py-2 px-4 border-2 border-charcoal text-charcoal rounded-lg font-semibold transition hover:bg-charcoal hover:text-white pencil-float ${
                      isRecording ? "bg-opacity-10" : ""
                    }`}
                  >
                    <FaMicrophone className="mr-2" />
                    {isRecording
                      ? "Stop Recording"
                      : "Start Recording"}
                  </button>
                  <button
                    onClick={handleSendClick}
                    className="flex-1 flex items-center justify-center py-2 px-4 border-2 border-charcoal text-charcoal rounded-lg font-semibold transition hover:bg-charcoal hover:text-white pencil-float"
                  >
                    <FaPaperPlane className="mr-2" />
                    Send to GPT
                  </button>
                </div>

                {/* equalizer */}
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
        </Rnd>
      </main>
    </>
  );
}
