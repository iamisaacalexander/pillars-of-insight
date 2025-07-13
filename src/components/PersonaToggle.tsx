import React from "react";
import Image from "next/image";

export interface PersonaToggleProps {
  persona: "aurora" | "echo";
  onChange: (p: "aurora"|"echo") => void;
}

export default function PersonaToggle({ persona, onChange }: PersonaToggleProps) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <button
        onClick={() => onChange("aurora")}
        className={`relative w-10 h-10 rounded-full pencil-float transition ${
          persona==="aurora" ? "ring-2 ring-charcoal" : "opacity-50"
        }`}
      >
        <Image src="/assets/aurora.png" alt="Aurora" width={40} height={40} className="w-full h-full object-contain" />
      </button>
      <button
        onClick={() => onChange("echo")}
        className={`relative w-10 h-10 rounded-full pencil-float transition ${
          persona==="echo" ? "ring-2 ring-charcoal" : "opacity-50"
        }`}
      >
        <Image src="/assets/echo.png" alt="Echo" width={40} height={40} className="w-full h-full object-contain" />
      </button>
    </div>
  );
}
