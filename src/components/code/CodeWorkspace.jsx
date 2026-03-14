import React, { useState } from "react";
import MonacoEditor_Improved from "./MonacoEditor_Improved";
import RunnerPanel from "./RunnerPanel";

export default function CodeWorkspace_Improved({ onFocus, onBlur, onSaveProject }) {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  return (
    <div 
      className="flex flex-col h-full w-full"
      // ✅ FIX: Stop ALL keyboard events from propagating to tldraw
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
      onKeyPress={(e) => e.stopPropagation()}
      // Track focus for parent component
      onFocus={onFocus}
      onBlur={onBlur}
      tabIndex={-1}
    >
      <div className="flex-1 overflow-hidden">
        <MonacoEditor_Improved
          language={language}
          code={code}
          setCode={setCode}
          setLanguage={setLanguage}
        />
      </div>
      <RunnerPanel
        language={language}
        code={code}
        input={input}
        setInput={setInput}
        output={output}
        setOutput={setOutput}
      />
    </div>
  );
}