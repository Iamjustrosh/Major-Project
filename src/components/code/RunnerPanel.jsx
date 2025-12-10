import React, { useState } from "react";
import { runCode } from "./runnerUtils";

export default function RunnerPanel({ language, code, input, setInput, output, setOutput }) {
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    setOutput("");

    try {
      const result = await runCode(language, code, input);
      setOutput(result);
    } catch (err) {
      setOutput("Error running code");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 flex flex-col gap-2">
      <textarea
        className="bg-gray-800 p-2 rounded h-20"
        placeholder="Input (optional)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        className="bg-blue-600 hover:bg-blue-500 p-2 rounded"
        onClick={handleRun}
        disabled={loading}
      >
        {loading ? "Running..." : "Run"}
      </button>
      <textarea
        className="bg-gray-700 p-2 rounded h-40"
        placeholder="Output"
        value={output}
        readOnly
      />
    </div>
  );
}
