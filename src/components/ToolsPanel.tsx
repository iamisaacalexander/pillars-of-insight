import React from "react";

export interface ToolsPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const ToolsPanel: React.FC<ToolsPanelProps> = ({
  isOpen,
  onToggle,
}) => {
  return (
    <aside
      className={`fixed top-16 right-4 z-30 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } bg-white bg-opacity-90 shadow-xl rounded-xl p-4 w-64 border border-gray-200`}
      style={{ pointerEvents: isOpen ? "auto" : "none" }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-800">🛠️ Tools</span>
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-800 text-lg font-bold px-2"
          title="Close tools panel"
        >
          ×
        </button>
      </div>
      <div className="text-gray-700 text-sm">
        {/* Wire up your actual tools here */}
        <p className="mb-2">No tools available yet.</p>
        <p className="text-xs text-gray-400">
          You can add quick actions, settings, or utilities here.
        </p>
      </div>
    </aside>
  );
};
