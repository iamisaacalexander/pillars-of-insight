'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Rnd, RndResizeCallback, RndDragCallback } from 'react-rnd';
import { sendToWhisper } from './whisper';
import {
  FaMicrophone,
  FaPaperPlane,
  FaWindowMinimize,
  FaWindowRestore,
} from 'react-icons/fa';

const HEADER_BAR_HEIGHT = 48;

export default function Home() {
  // state
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [gptReply, setGptReply] = useState('');
  const [freqData, setFreqData] = useState<number[]>([]);

  const [isMinimized, setIsMinimized] = useState(false);
  const [size, setSize] = useState({ width: 380, height: 440 });
  const [prevSize, setPrevSize] = useState(size);
  const [position, setPosition] = useState({ x: 100, y: 120 });

  // refs for MediaRecorder + meter
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isRecording) {
      // stop
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        mediaRecorderRef.current.stop();
      }
      cancelAnimationFrame(rafRef.current);
      setFreqData([]);
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
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
        setFreqData(Array.from(data));
        rafRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      mr.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mr.onstop = async () => {
        cancelAnimationFrame(rafRef.current);
        try {
          if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
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

  const handleMicClick = () => {
    setTranscript('');
    setGptReply('');
    setIsRecording((r) => !r);
  };

  const handleSendClick = async () => {
    if (!transcript) return;
    setGptReply('💡 Thinking…');
    try {
      const res = await fetch('/api/gpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: transcript }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { reply } = await res.json();
      setGptReply(reply || '⚠️ No reply.');
    } catch {
      setGptReply('❗ Error communicating with GPT.');
    }
  };

  const toggleMinimize = () => {
    if (!isMinimized) {
      setPrevSize(size);
      setSize({ width: size.width, height: HEADER_BAR_HEIGHT });
    } else {
      setSize(prevSize);
    }
    setIsMinimized((m) => !m);
  };

  // drag callback
  const onDragStop: RndDragCallback = (_e, d) => {
    setPosition({ x: d.x, y: d.y });
  };

  // resize callback: ref gives new size, newPos gives new position
  const onResizeStop: RndResizeCallback = (_e, _dir, ref, _delta, newPos) => {
    setSize({
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    });
    setPosition(newPos);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-12 bg-gray-800 text-white flex items-center justify-center z-20 shadow-md">
        <span className="text-xl font-bold">🧠 Pillars of Insight</span>
      </header>

      <main className="pt-12 w-full h-screen bg-gradient-to-br from-blue-900 to-gray-900 overflow-hidden">
        <Rnd
          size={size}
          position={position}
          onDragStop={onDragStop}
          onResizeStop={onResizeStop}
          bounds="parent"
          minWidth={300}
          minHeight={HEADER_BAR_HEIGHT}
        >
          <div className="flex flex-col bg-gray-800 rounded-2xl shadow-2xl backdrop-blur-xl bg-opacity-70 h-full">
            <div
              className="flex items-center justify-between px-4 cursor-move select-none bg-gray-900 rounded-t-2xl"
              style={{ height: HEADER_BAR_HEIGHT }}
            >
              <span className="text-lg font-semibold text-white">
                🧠 Tablet Guide
              </span>
              <button
                onClick={toggleMinimize}
                className="text-gray-300 hover:text-white"
              >
                {isMinimized ? <FaWindowRestore /> : <FaWindowMinimize />}
              </button>
            </div>

            {!isMinimized && (
              <div className="flex-1 p-4 overflow-auto flex flex-col">
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
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

                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="flex-1 h-2.5 rounded-full bg-gray-700">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                      style={{
                        width: `${(freqData[0] || 0) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {Math.round((freqData[0] || 0) * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </Rnd>
      </main>
    </>
  );
}
