import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MonacoEditor from "./MonacoEditor";
import Terminal from "./Terminal";
import { FiPlay, FiSquare, FiSave, FiTerminal } from "react-icons/fi";

// Default code templates
const DEFAULT_CODE = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello from C++!" << endl;
    cout << "10 * 5 = " << 10 * 5 << endl;
    return 0;
}`,
  python3: `# Python Program
print("Hello from Python!")
print("5 + 3 =", 5 + 3)

for i in range(5):
    print(f"Count: {i}")`,
  javascript: `// JavaScript Code
console.log("Hello from JavaScript!");
console.log("Sum:", 5 + 3);

for(let i = 0; i < 5; i++) {
    console.log("Count:", i);
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
        System.out.println("10 + 5 = " + (10 + 5));
    }
}`
};

// Input Dialog Component
function InputDialog({ isOpen, onClose, onSubmit }) {
  const [input, setInput] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(input);
    setInput("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-1000 flex items-center justify-center">
      <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-white mb-2">Program Input</h2>
        <p className="text-gray-400 text-sm mb-4">
          Your code requires input. Provide all inputs here (one per line):
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-32 bg-gray-950 border border-white/20 rounded-lg p-3 text-white font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
            placeholder="Enter input here (one per line)&#10;Example:&#10;Alice&#10;25&#10;New York"
            autoFocus
          />

          <div className="flex items-center gap-3 mt-4 text-xs text-gray-500">
            <FiTerminal className="shrink-0" />
            <span>Each line will be sent as one input to your program</span>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                onSubmit("");
                setInput("");
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-white"
            >
              Run Without Input
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition text-white font-medium"
            >
              Run With Input
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CodeWorkspace({ onFocus, onBlur }) {
  const { projectId } = useParams();
  
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem(`code-lang-${projectId}`);
    return saved || "python3";
  });

  const [code, setCode] = useState(() => {
    const saved = localStorage.getItem(`code-content-${projectId}`);
    return saved || DEFAULT_CODE[language] || "";
  });

  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showInputDialog, setShowInputDialog] = useState(false);

  useEffect(() => {
    if (projectId && code) {
      localStorage.setItem(`code-content-${projectId}`, code);
    }
  }, [code, projectId]);

  useEffect(() => {
    if (projectId) {
      localStorage.setItem(`code-lang-${projectId}`, language);
    }
  }, [language, projectId]);

  useEffect(() => {
    const isTemplate = Object.values(DEFAULT_CODE).some(template => 
      code.trim() === template.trim()
    );
    
    if (!code.trim() || isTemplate) {
      setCode(DEFAULT_CODE[language] || "");
    }
  }, [language]);

  // Check if code needs input
  const codeNeedsInput = () => {
    const inputPatterns = [
      /input\s*\(/,
      /cin\s*>>/,
      /Scanner/,
      /readline\.question/,
      /prompt\s*\(/,
    ];
    return inputPatterns.some(pattern => pattern.test(code));
  };

  // Execute code using Electron IPC
  const executeCode = async (stdin) => {
    setOutput("Executing code...\n");
    setIsRunning(true);

    try {
      // Check if running in Electron
      if (window.electronAPI) {
        // ✅ Use Electron IPC (no CORS!)
        const result = await window.electronAPI.executeCode(code, language, stdin);

        let finalOutput = '';

        if (result.output) {
          finalOutput += result.output;
        }

        if (result.memory) {
          finalOutput += `\n\n📊 Memory: ${result.memory}`;
        }

        if (result.cpuTime) {
          finalOutput += `\n⏱️ CPU Time: ${result.cpuTime}s`;
        }

        if (result.error) {
          finalOutput += `\n\n❌ Error: ${result.error}`;
        }

        if (result.statusCode && result.statusCode !== 200) {
          finalOutput += `\n\n⚠️ Status: ${result.statusCode}`;
        }

        if (!finalOutput.trim()) {
          finalOutput = "✓ Code executed successfully (no output)";
        }

        setOutput(finalOutput);

      } else {
        // Not in Electron
        setOutput(
          '❌ Code execution requires the desktop app\n\n' +
          'Please run this in the Electron desktop app.\n' +
          'In development, make sure:\n' +
          '1. Electron is running\n' +
          '2. preload.js is configured\n' +
          '3. codeExecutionAPI is registered in main.js'
        );
      }

    } catch (error) {
      console.error("Execution error:", error);
      setOutput(`❌ Error: ${error.message}\n\n` +
        `Make sure:\n` +
        `• JDoodle credentials are set in codeExecutionAPI.js\n` +
        `• Internet connection is available\n` +
        `• Code syntax is correct`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRun = () => {
    if (codeNeedsInput()) {
      setShowInputDialog(true);
    } else {
      executeCode("");
    }
  };

  const handleInputSubmit = (input) => {
    executeCode(input);
  };

  const handleStop = () => {
    setIsRunning(false);
    setOutput(prev => prev + "\n\n⚠️ Execution stopped by user.");
  };

  const handleClearTerminal = () => {
    setOutput("");
  };

  const handleSave = () => {
    localStorage.setItem(`code-content-${projectId}`, code);
    localStorage.setItem(`code-lang-${projectId}`, language);
    
    const btn = document.getElementById('save-btn');
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = '✓ Saved';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      <InputDialog
        isOpen={showInputDialog}
        onClose={() => setShowInputDialog(false)}
        onSubmit={handleInputSubmit}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={isRunning ? handleStop : handleRun}
            className={`flex items-center gap-2 px-3 py-1.5 rounded transition ${
              isRunning 
                ? 'bg-red-600 hover:bg-red-500' 
                : 'bg-green-600 hover:bg-green-500'
            }`}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <FiSquare className="text-white" size={14} />
                <span className="text-white text-sm">Running...</span>
              </>
            ) : (
              <>
                <FiPlay className="text-white" size={14} />
                <span className="text-white text-sm">Run Code</span>
              </>
            )}
          </button>

          <button
            id="save-btn"
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded transition"
          >
            <FiSave className="text-white" size={14} />
            <span className="text-white text-sm">Save</span>
          </button>

          {codeNeedsInput() && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600/20 border border-yellow-600/40 rounded text-yellow-400 text-xs">
              <FiTerminal size={12} />
              <span>Requires Input</span>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-400">
          {window.electronAPI ? '🖥️ Desktop App' : '🌐 Web Version'}
        </div>
      </div>

      {/* Editor + Terminal Split */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div 
          className="flex-[3] min-h-0 border-b border-white/10"
          onFocus={onFocus}
          onBlur={onBlur}
        >
          <MonacoEditor
            language={language}
            setLanguage={setLanguage}
            code={code}
            setCode={setCode}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        <div className="flex-[2] min-h-0">
          <Terminal
            output={output}
            isRunning={isRunning}
            onInput={() => {}}
            onClear={handleClearTerminal}
            language={language}
          />
        </div>
      </div>
    </div>
  );
}