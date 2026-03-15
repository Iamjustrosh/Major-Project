import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { Tldraw } from "tldraw";
import { useSyncDemo } from "@tldraw/sync";
import { useAuthStore } from "../store/useAuthStore";
import { FiShare2, FiCode, FiWifi, FiCopy, FiCheck } from "react-icons/fi";
import CodeWorkspace_Improved from "../components/code/CodeWorkspace_Improved";
import "tldraw/tldraw.css";

// User Presence Component
function UserPresencePanel({ users, currentUserId }) {
  const [isOpen, setIsOpen] = useState(false);

  if (users.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition"
      >
        <FiWifi className="text-green-400" />
        <span className="text-sm">{users.length} online</span>
        
        <div className="flex -space-x-2">
          {users.slice(0, 3).map((user, idx) => (
            <div
              key={`${user.id}-${idx}`}
              className="w-7 h-7 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: user.color }}
              title={user.name}
            >
              {user.name?.[0]?.toUpperCase() || "?"}
            </div>
          ))}
          {users.length > 3 && (
            <div className="w-7 h-7 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white">
              +{users.length - 3}
            </div>
          )}
        </div>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900 border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="p-3 border-b border-white/20 bg-white/5">
              <h3 className="text-sm font-semibold text-white">Online Users</h3>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {users.map((user, idx) => (
                <div
                  key={`${user.id}-${idx}-panel`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {user.name}
                      {user.id === currentUserId && (
                        <span className="ml-2 text-xs text-blue-400">(You)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                      Active now
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Share Modal Component
function ShareModal({ isOpen, onClose, shareCode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (window.electronAPI?.clipboardWrite) {
      await window.electronAPI.clipboardWrite(shareCode);
    } else {
      await navigator.clipboard.writeText(shareCode); // fallback for browser
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-1000 flex items-center justify-center"
        onClick={onClose}
      >
        <div 
          className="bg-gray-900 border border-white/20 rounded-2xl p-6 w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Share Whiteboard</h2>
          
          <p className="text-gray-400 text-sm mb-4">
            Share this code with others to invite them to collaborate:
          </p>

          <div className="bg-black/50 border border-white/20 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between gap-3">
              <code className="text-xl font-mono text-white font-bold tracking-wider flex-1">
                {shareCode}
              </code>
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition flex items-center gap-2 shrink-0"
              >
                {copied ? (
                  <>
                    <FiCheck className="text-white" />
                    <span className="text-white font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <FiCopy className="text-white" />
                    <span className="text-white font-medium">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
            <p className="text-blue-300 text-sm">
              💡 Paste this code in the "Join Room" button on the projects page
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition text-white font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

export default function Whiteboard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [editorHasFocus, setEditorHasFocus] = useState(false);

  const userInfo = {
    id: user?.id,
    name: user?.user_metadata?.display_name || "Anonymous",
    color: `hsl(${((user?.id || "").charCodeAt(0) || 0) * 137.5 % 360}, 70%, 50%)`,
  };

  // ✨ Use tldraw's official sync for collaboration
  // This handles ALL real-time features: live cursors, presence, sync, etc.
  const store = useSyncDemo({ 
    roomId: projectId,
    userInfo: {
      id: user?.id || 'anonymous',
      name: userInfo.name,
      color: userInfo.color,
    }
  });

  // Track presence using Supabase (for our custom presence panel)
  useEffect(() => {
    if (!projectId) return;

    console.log("🟢 Connecting to presence:", projectId);

    const channel = supabase.channel(`presence:${projectId}`, {
      config: {
        presence: { key: user?.id },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat();
        
        // Remove duplicates based on user ID
        const uniqueUsers = users.reduce((acc, current) => {
          const existing = acc.find(u => u.id === current.id);
          if (!existing) {
            acc.push(current);
          }
          return acc;
        }, []);
        
        setConnectedUsers(uniqueUsers);
        console.log("👥 Online:", uniqueUsers.map(u => u.name).join(", "));
      })
      .subscribe(async (status) => {
        console.log("🔌 Presence Status:", status);
        setIsConnected(status === "SUBSCRIBED");
        
        if (status === "SUBSCRIBED") {
          await channel.track(userInfo);
        }
      });

    return () => {
      console.log("🔴 Disconnecting presence");
      channel.untrack();
      channel.unsubscribe();
    };
  }, [projectId, user?.id, userInfo.name, userInfo.color]);

  // Fetch project metadata
  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, share_code")
        .eq("id", projectId)
        .maybeSingle();

      if (error || !data) {
        console.error("Project not found");
        navigate("/projects");
        return;
      }

      if (!data.share_code) {
        const code = crypto.randomUUID();
        await supabase
          .from("projects")
          .update({ share_code: code })
          .eq("id", projectId);
        data.share_code = code;
      }

      setProject(data);
      setLoading(false);
    };

    fetchProject();
  }, [projectId, navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg">Loading whiteboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-white/10 border-b border-white/20 z-50">
        <button
          onClick={() => navigate("/projects")}
          className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition"
        >
          ← Back
        </button>

        <div className="flex flex-col items-center">
          <h1 className="text-xl font-semibold">{project?.title}</h1>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {isConnected ? (
              <span className="text-green-400">● Connected</span>
            ) : (
              <span className="text-yellow-400">● Connecting...</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && (
            <UserPresencePanel 
              users={connectedUsers} 
              currentUserId={user?.id}
            />
          )}

          <button
            onClick={() => setShowEditor(!showEditor)}
            className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition flex items-center gap-2"
          >
            <FiCode />
            {showEditor ? "Close" : "Code"}
          </button>

          <button
            onClick={() => setShareModalOpen(true)}
            className="px-4 py-2 bg-blue-600 rounded-xl hover:bg-blue-500 transition flex items-center gap-2"
          >
            <FiShare2 />
            Share
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex flex-1 overflow-hidden">
        <div className={`h-full transition-all duration-300 ${showEditor ? "w-1/2" : "flex-1"}`}>
          {/* 
            ✨ tldraw with official sync:
            - store: Handles real-time collaboration automatically
            - persistenceKey: Saves to localStorage for offline persistence
            - autoFocus: Focus management
          */}
          <Tldraw 
            store={store}
            persistenceKey={`project-${projectId}`}
            autoFocus={!editorHasFocus}
          />
        </div>

        {showEditor && (
          <div className="w-1/2 h-full bg-gray-900 border-l border-white/20">
            <CodeWorkspace_Improved 
              onSaveProject={() => {}}
              onFocus={() => setEditorHasFocus(true)}
              onBlur={() => setEditorHasFocus(false)}
            />
          </div>
        )}
      </div>

      <ShareModal 
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareCode={project?.share_code || ""}
      />
    </div>
  );
}