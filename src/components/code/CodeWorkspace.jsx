import React, { useState } from "react";
import MonacoEditor from "./MonacoEditor";
import RunnerPanel from "./RunnerPanel";

export default function CodeWorkspace({ onFocus, onBlur, onSaveProject }) {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  return (
    <div className="flex flex-col h-full w-full">
      <div
        className="flex-1 overflow-hidden"
        onFocus={onFocus}
        onBlur={onBlur}
        tabIndex={0} // make div focusable to trigger onFocus/onBlur
      >
        <MonacoEditor
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
