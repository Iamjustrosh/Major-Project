import React, { useState, useRef, useEffect } from "react";
import { FiTerminal, FiX } from "react-icons/fi";

export default function Terminal({
  output,
  isRunning,
  awaitingInput = false,
  onInput,
  onClear,
}) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  const canType = awaitingInput || isRunning;

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output, history]);

  useEffect(() => {
    if (awaitingInput) {
      inputRef.current?.focus();
    }
  }, [awaitingInput]);

  const handleTerminalClick = () => {
    if (canType) inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || !canType) return;

    const line = input;
    setHistory((prev) => [...prev, { type: "input", text: line }]);
    onInput?.(line);
    setInput("");
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      handleClear();
    }
  };

  const handleClear = () => {
    setHistory([]);
    onClear?.();
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 border-t border-white/10">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-white/10">
        <div className="flex items-center gap-2">
          <FiTerminal className="text-green-400" />
          <span className="text-sm font-medium text-white">Terminal</span>
          {isRunning && (
            <span className="text-xs text-yellow-400 animate-pulse">● Running...</span>
          )}
          {awaitingInput && !isRunning && (
            <span className="text-xs text-sky-400">● Waiting for input</span>
          )}
        </div>

        <button
          onClick={handleClear}
          className="p-1 hover:bg-white/10 rounded transition"
          title="Clear terminal (Ctrl+L)"
          type="button"
        >
          <FiX className="text-gray-400 hover:text-white" />
        </button>
      </div>

      <div
        ref={terminalRef}
        onClick={handleTerminalClick}
        className="flex-1 overflow-y-auto p-3 font-mono text-sm cursor-text"
        style={{ minHeight: "200px" }}
      >
        {history.map((item, idx) => (
          <div key={idx} className="mb-1">
            <div className="flex gap-2">
              <span className="text-green-400">$</span>
              <span className="text-white">{item.text}</span>
            </div>
          </div>
        ))}

        {output && (
          <div className="whitespace-pre-wrap text-gray-300 mt-2">{output}</div>
        )}

        {!output && history.length === 0 && !isRunning && !awaitingInput && (
          <div className="text-gray-600 italic">Press &quot;Run Code&quot; to execute...</div>
        )}
      </div>

      {canType && (
        <form onSubmit={handleSubmit} className="px-3 py-2 bg-gray-900 border-t border-white/10 flex items-center gap-2">
          <span className="text-green-400 font-mono text-sm">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!canType}
            className="flex-1 bg-transparent text-white font-mono text-sm outline-none placeholder:text-gray-600"
            placeholder={awaitingInput ? "Type input and press Enter (one line per input())" : "Enter input..."}
            autoComplete="off"
            spellCheck={false}
          />
        </form>
      )}

      <div className="px-3 py-1 bg-gray-900 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
        <span>
          {awaitingInput
            ? "Enter each value on its own line, then click Run again"
            : isRunning
              ? "Executing..."
              : "Ready"}
        </span>
        <span>Ctrl+L to clear</span>
      </div>
    </div>
  );
}
