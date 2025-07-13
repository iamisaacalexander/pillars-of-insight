import React from "react";

export interface Tool {
  id: string;
  label: string;
  iconSrc: string;
  onClick: () => void;
}

export interface ToolsPanelProps {
  isOpen: boolean;
  tools: Tool[];
  onToggle: () => void;
}

export const ToolsPanel: React.FC<ToolsPanelProps> = ({
  isOpen,
  tools,
  onToggle,
}) => {
  return (
    <aside
      className={`fixed top-16 right-4 z-30 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } bg-paperCream bg-opacity-90 shadow-xl rounded-xl p-4 w-48 border border-charcoal`}
      style={{ pointerEvents: isOpen ? "auto" : "none" }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-charcoal">🛠️ Tools</span>
        <button
          onClick={onToggle}
          className="text-charcoal hover:text-gray-800 text-lg font-bold px-2"
          title="Close tools panel"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={tool.onClick}
            className="flex flex-col items-center p-1 sketch-border pencil-float"
            title={tool.label}
          >
            <img
              src={tool.iconSrc}
              alt={tool.label}
              className="w-8 h-8 object-contain"
            />
            <span className="text-xs text-charcoal mt-1">
              {tool.label}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
};
