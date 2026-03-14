import React, { useState, useRef, useEffect } from "react";
import { FiTerminal, FiX, FiPlay } from "react-icons/fi";

export default function Terminal({ 
  output, 
  isRunning, 
  onInput,
  onClear,
  language 
}) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output, history]);

  // Focus input when terminal is clicked
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  // Handle input submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || !isRunning) return;

    // Add to history
    setHistory(prev => [...prev, { type: "input", text: input }]);
    
    // Send to parent
    if (onInput) {
      onInput(input);
    }

    // Clear input
    setInput("");
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Stop propagation to prevent tldraw from capturing
    e.stopPropagation();

    // Ctrl+L to clear
    if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      handleClear();
    }
  };

  const handleClear = () => {
    setHistory([]);
    if (onClear) onClear();
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 border-t border-white/10">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-white/10">
        <div className="flex items-center gap-2">
          <FiTerminal className="text-green-400" />
          <span className="text-sm font-medium text-white">Terminal</span>
          {isRunning && (
            <span className="text-xs text-yellow-400 animate-pulse">● Running...</span>
          )}
        </div>
        
        <button
          onClick={handleClear}
          className="p-1 hover:bg-white/10 rounded transition"
          title="Clear terminal (Ctrl+L)"
        >
          <FiX className="text-gray-400 hover:text-white" />
        </button>
      </div>

      {/* Terminal Output Area */}
      <div 
        ref={terminalRef}
        onClick={handleTerminalClick}
        className="flex-1 overflow-y-auto p-3 font-mono text-sm cursor-text"
        style={{ minHeight: "200px" }}
      >
        {/* Output from code execution */}
        {output && (
          <div className="whitespace-pre-wrap text-gray-300 mb-2">
            {output}
          </div>
        )}

        {/* Command history */}
        {history.map((item, idx) => (
          <div key={idx} className="mb-1">
            {item.type === "input" ? (
              <div className="flex gap-2">
                <span className="text-green-400">$</span>
                <span className="text-white">{item.text}</span>
              </div>
            ) : (
              <div className="text-gray-400">{item.text}</div>
            )}
          </div>
        ))}

        {/* Empty state */}
        {!output && history.length === 0 && !isRunning && (
          <div className="text-gray-600 italic">
            Press "Run Code" to execute...
          </div>
        )}
      </div>

      {/* Terminal Footer Hints */}
      <div className="px-3 py-1 bg-gray-900 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
        <span>
          {isRunning ? "Enter input and press ↵" : "Ready"}
        </span>
        <span>Ctrl+L to clear</span>
      </div>
    </div>
  );
}