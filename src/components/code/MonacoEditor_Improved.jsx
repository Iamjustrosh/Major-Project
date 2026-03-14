import React from "react";
import Editor from "@monaco-editor/react";

const LANGUAGES = [
  { label: "C++", value: "cpp" },
  { label: "Python", value: "python3" },
  { label: "JavaScript", value: "javascript" },
  { label: "Java", value: "java" },
];

export default function MonacoEditor({ 
  language, 
  setLanguage, 
  code, 
  setCode,
  onFocus,
  onBlur 
}) {
  return (
    <div 
      className="flex flex-col flex-1 p-2"
      // ✅ Prevent keyboard events from bubbling to tldraw
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
      onKeyPress={(e) => e.stopPropagation()}
    >
      <div className="flex gap-2 mb-2">
        <select
          className="bg-gray-800 p-1 rounded text-white text-sm"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      <Editor
        height="100%"
        language={language === "cpp" ? "cpp" : language === "python3" ? "python" : language}
        value={code}
        onChange={(value) => setCode(value)}
        theme="vs-dark"
        options={{ 
          fontSize: 14, 
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
        }}
        onMount={(editor) => {
          editor.focus();
          if (onFocus) onFocus();
        }}
        // Track focus for whiteboard
        beforeMount={() => {
          if (onFocus) onFocus();
        }}
      />
    </div>
  );
}