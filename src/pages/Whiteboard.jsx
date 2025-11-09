import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

export default function Whiteboard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [doc, setDoc] = useState({});
  const [saving, setSaving] = useState(false);

  const saveTimeout = useRef(null);

  // Fetch project from Supabase
  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) console.error(error);
      else {
        setProject(data);
        setDoc(data.content || {});
      }
    };
    fetchProject();
  }, [projectId]);

  // Debounced save function
  const saveDocument = (newDoc) => {
    setDoc(newDoc);
    setSaving(true);

    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    saveTimeout.current = setTimeout(async () => {
      try {
        const jsonDoc = JSON.parse(JSON.stringify(newDoc));
        const { error } = await supabase
          .from("projects")
          .update({ content: jsonDoc })
          .eq("id", projectId);

        if (error) console.error("Failed to save document:", error);
        else console.log("Document saved!");
      } catch (err) {
        console.error("Error serializing document:", err);
      } finally {
        setSaving(false);
      }
    }, 2000);
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  if (!project) return <p className="text-white">Loading project...</p>;

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-white/10 border-b border-white/20">
        <button
          onClick={() => navigate("/projects")}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition"
        >
          ← Back
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-semibold">{project.title}</h1>
          <span className="text-xs text-gray-400">
            {saving ? "Saving..." : "All changes saved"}
          </span>
        </div>
        <div className="w-24"></div>
      </div>

      {/* Whiteboard */}
      <div className="relative flex-1">
        {doc && (
          <Tldraw
            document={doc}
            onChange={saveDocument}
            persistenceKey={`whiteboard-${projectId}`}
            style={{ position: "absolute", inset: 0 }}
          />
        )}
      </div>
    </div>
  );
}
