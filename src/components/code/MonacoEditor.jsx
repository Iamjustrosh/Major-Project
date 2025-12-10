import React from "react";
import Editor from "@monaco-editor/react";

const LANGUAGES = [
  { label: "C++", value: "cpp" },
  { label: "Python", value: "python3" },
  { label: "JavaScript", value: "javascript" },
  { label: "Java", value: "java" },
];

export default function MonacoEditor({ language, setLanguage, code, setCode }) {
  return (
    <div className="flex flex-col flex-1 p-2">
      <div className="flex gap-2 mb-2">
        <select
          className="bg-gray-800 p-1 rounded"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      <Editor
        height="250px"
        language={language === "cpp" ? "cpp" : language === "python3" ? "python" : language}
        value={code}
        onChange={(value) => setCode(value)}
        theme="vs-dark"
        options={{ fontSize: 14, minimap: { enabled: false } }}
      />
    </div>
  );
}
