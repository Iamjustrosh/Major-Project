import React from "react";

/**
 * Props:
 * - files: { name, language, content }[] 
 * - onSelect(fileName), onCreate(), onDelete(fileName), onRename(oldName, newName), onDownload(fileName)
 * - activeFileName
 */
export default function FileExplorer({ files, activeFileName, onSelect, onCreate, onDelete, onRename, onDownload }) {
  return (
    <div className="w-56 border-r border-white/10 bg-[#0b0f14] flex flex-col">
      <div className="px-3 py-3 flex items-center justify-between border-b border-white/5">
        <div className="text-sm font-semibold">Files</div>
        <button onClick={onCreate} className="text-xs px-2 py-1 bg-blue-600 rounded text-white">New</button>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {files.map((f) => (
          <div
            key={f.name}
            onClick={() => onSelect(f.name)}
            className={`px-2 py-2 rounded flex items-center justify-between cursor-pointer hover:bg-white/5 ${activeFileName === f.name ? "bg-white/5" : ""}`}
          >
            <div>
              <div className="text-sm font-medium">{f.name}</div>
              <div className="text-xs text-gray-400">{f.language}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); onDownload(f.name); }} title="Download" className="text-xs px-2 py-1 bg-white/5 rounded">DL</button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(f.name); }} title="Delete" className="text-xs px-2 py-1 bg-red-600 rounded">Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
