import React from "react";
import Image from "next/image";

export interface Tool {
  id: string;
  label: string;
  iconSrc: string;
  onClick: () => void;
}

export interface ToolsPanelProps {
  tools: Tool[];
  vertical?: boolean;
  className?: string;
}

// New: vertical, PNG-backed, icon-only toolbar for tablet
export const ToolsPanel: React.FC<ToolsPanelProps> = ({
  tools,
  vertical = true,
  className = "",
}) => (
  <div
    className={`relative flex ${vertical ? "flex-col" : "flex-row"} items-center justify-center ${className}`.trim()}
    style={{ width: 64, height: 320, background: 'none', boxShadow: 'none', margin: 0, padding: 0 }}
  >
    {/* Toolbar PNG background */}
    <Image
      src="/assets/tool-bar.png"
      alt="Toolbar"
      width={64}
      height={320}
      className="absolute left-0 top-0 w-16 h-80 pointer-events-none select-none"
      style={{ zIndex: 1 }}
      draggable={false}
      priority
    />
    {/* Tool icons stacked vertically, centered */}
    <div className="relative flex flex-col items-center justify-center gap-4 z-10" style={{ height: '100%', marginTop: 0 }}>
      {tools.map(tool => (
        <button
          key={tool.id}
          onClick={tool.onClick}
          className="p-0 bg-transparent border-none shadow-none hover:scale-110 transition"
          title={tool.label}
          style={{ width: 32, height: 32 }}
        >
          <Image src={tool.iconSrc} alt={tool.label} width={28} height={28} className="w-7 h-7 object-contain" />
        </button>
      ))}
    </div>
  </div>
);
