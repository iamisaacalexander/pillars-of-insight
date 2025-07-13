'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Rnd, RndResizeCallback, RndDragCallback } from 'react-rnd';
import { sendToWhisper } from './whisper';
import {
  FaMicrophone,
  FaPaperPlane,
  FaWindowMinimize,
  FaWindowRestore,
  FaSquare,
} from 'react-icons/fa';
import { ToolsPanel } from '@/components/ToolsPanel';

const HEADER_BAR_HEIGHT = 48;
const METER_BARS = 32;

type TabletMode = 'normal' | 'header' | 'compact';

export default function Home() {
  // recording + transcript
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [gptReply, setGptReply] = useState('');
  const [freqData, setFreqData] = useState<number[]>([]);

  // tablet
  const [tabletMode, setTabletMode] = useState<TabletMode>('normal');
  const [size, setSize] = useState({ width: 380, height: 440 });
  const [prevSize, setPrevSize] = useState(size);
  const [position, setPosition] = useState({ x: 100, y: 120 });

  // tools panel
  const [toolsOpen, setToolsOpen] = useState(false);

  // refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef     = useRef<Blob[]>([]);
  const analyserRef        = useRef<AnalyserNode | null>(null);
  const audioCtxRef        = useRef<AudioContext | null>(null);
  const rafRef             = useRef<number>(0);

  // handle record + meter
  useEffect(() => {
    if (!isRecording) {
      mediaRecorderRef.current?.state !== 'inactive' && mediaRecorderRef.current?.stop();
      cancelAnimationFrame(rafRef.current);
      setFreqData([]);
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      // meter
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source   = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const updateMeter = () => {
        const raw = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(raw);
        const chunk = Math.floor(raw.length / METER_BARS);
        const bars = Array.from({ length: METER_BARS }, (_, i) => {
          const segment = raw.slice(i*chunk, (i+1)*chunk);
          return segment.reduce((sum, v) => sum + v, 0) / segment.length / 255;
        });
        setFreqData(bars);
        rafRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();

      // recorder
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current  = [];

      mr.ondataavailable = e => audioChunksRef.current.push(e.data);
      mr.onstop = async () => {
        cancelAnimationFrame(rafRef.current);
        try {
          if (audioCtxRef.current?.state !== 'closed') {
            await audioCtxRef.current.close();
          }
        } catch {}
        setTranscript('📝 Transcribing…');
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
        const text = await sendToWhisper(file);
        setTranscript(text || '❗ Could not transcribe.');
      };

      mr.start();
    });
  }, [isRecording]);

  // mic / GPT handlers
  const handleMicClick = () => {
    setTranscript(''); setGptReply(''); setIsRecording(r => !r);
  };
  const handleSendClick = async () => {
    if (!transcript) return;
    setGptReply('💡 Thinking…');
    try {
      const res = await fetch('/api/gpt', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ prompt: transcript }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { reply } = await res.json();
      setGptReply(reply || '⚠️ No reply.');
    } catch {
      setGptReply('❗ Error communicating with GPT.');
    }
  };

  // cycle through normal → header only → compact “watch” mode
  const cycleTabletMode = () => {
    if (tabletMode === 'normal') {
      setPrevSize(size);
      setSize({ width: size.width, height: HEADER_BAR_HEIGHT });
      setTabletMode('header');
    } else if (tabletMode === 'header') {
      setPrevSize(size);
      setSize({ width: 80, height: 80 });
      setTabletMode('compact');
    } else {
      // back to full
      setSize(prevSize);
      setTabletMode('normal');
    }
  };

  // drag & resize
  const onDragStop: RndDragCallback = (_e, d) => setPosition({ x: d.x, y: d.y });
  const onResizeStop: RndResizeCallback = (_e, _dir, ref, _delta, newPos) => {
    setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
    setPosition(newPos);
  };

  return (
    <>
      {/* header */}
      <header className="fixed top-0 left-0 w-full h-12 bg-gray-800 text-white flex items-center justify-center z-20 shadow-md">
        <span className="text-xl font-bold">🧠 Pillars of Insight</span>
      </header>

      {/* tools */}
      <ToolsPanel isOpen={toolsOpen} onToggle={() => setToolsOpen(o => !o)} />

      {/* main */}
      <main className="pt-12 pr-16 w-full h-screen bg-[#f7f2eb] overflow-hidden">
        <Rnd
          size={size}
          position={position}
          onDragStop={onDragStop}
          onResizeStop={onResizeStop}
          bounds="parent"
          minWidth={80}
          minHeight={HEADER_BAR_HEIGHT}
        >
          <div className="flex flex-col bg-gray-900 rounded-2xl shadow-2xl backdrop-blur-xl bg-opacity-60 h-full">
            {/* title bar */}
            <div
              className="flex items-center justify-between px-4 cursor-move select-none bg-gray-800 rounded-t-2xl"
              style={{ height: HEADER_BAR_HEIGHT }}
            >
              <span className="text-lg font-semibold text-white">
                🧠 Tablet Guide
              </span>
              <button
                onClick={cycleTabletMode}
                className="text-gray-300 hover:text-white"
                title={
                  tabletMode === 'normal'
                    ? 'Minimize to header'
                    : tabletMode === 'header'
                    ? 'Compact mode'
                    : 'Restore full'
                }
              >
                {tabletMode === 'compact' ? <FaWindowRestore />
                 : tabletMode === 'header'  ? <FaSquare />
                 : <FaWindowMinimize />}
              </button>
            </div>

            {/* body */}
            {tabletMode !== 'header' && (
              <div className="flex-1 p-4 overflow-auto flex flex-col">
                <textarea
                  value={transcript}
                  onChange={e => setTranscript(e.target.value)}
                  placeholder="🎙️ Your transcript will appear here…"
                  className="w-full p-3 mb-3 bg-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-24"
                />

                <div className="flex-1 p-3 mb-4 bg-gray-700 rounded-lg text-sm text-blue-200 overflow-auto">
                  {gptReply || '🤖 GPT reply will appear here…'}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={handleMicClick}
                    className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg font-semibold transition ${
                      isRecording
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <FaMicrophone className="mr-2" />
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </button>
                  <button
                    onClick={handleSendClick}
                    className="flex-1 flex items-center justify-center py-2 px-4 bg-green-600 rounded-lg font-semibold transition hover:bg-green-700"
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
                        className="flex-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-sm transition-all"
                        style={{ height: `${lvl*100}%`, minWidth: 2 }}
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
