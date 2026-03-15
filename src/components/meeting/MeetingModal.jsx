// src/components/meeting/MeetingModal.jsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useMeeting } from "../../hooks/useMeeting";
import VideoTile from "./VideoTile";
import {
  FiX, FiMic, FiMicOff, FiVideo, FiVideoOff,
  FiMonitor, FiUsers, FiCopy, FiCheck,
  FiMinimize2, FiMaximize2, FiPhoneOff,
  FiAlertCircle, FiWifi, FiMessageSquare, FiSend,
} from "react-icons/fi";

// ─── Clipboard ────────────────────────────────────────────────
function copyToClipboard(text) {
  if (navigator.clipboard?.writeText)
    return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
  legacyCopy(text);
}
function legacyCopy(text) {
  const el = document.createElement("textarea");
  el.value = text;
  el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el); el.focus(); el.select();
  try { document.execCommand("copy"); } catch {}
  document.body.removeChild(el);
}
function CopyBtn({ text, label }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { copyToClipboard(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs text-white transition"
    >
      {copied ? <FiCheck size={11} className="text-green-400" /> : <FiCopy size={11} />}
      {copied ? "Copied!" : label}
    </button>
  );
}

// ─── Chat panel ────────────────────────────────────────────────
function ChatPanel({ messages, onSend, displayName }) {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  const fmt = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="w-64 bg-gray-900 border-l border-white/10 flex flex-col shrink-0">
      <div className="px-3 py-2.5 border-b border-white/10">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <FiMessageSquare size={11} /> Chat
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-xs text-gray-600 text-center mt-4">
            No messages yet.<br />Say hello! 👋
          </p>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col gap-0.5 ${msg.isOwn ? "items-end" : "items-start"}`}>
            <span className="text-[10px] text-gray-500">
              {msg.isOwn ? "You" : msg.senderName} · {fmt(msg.timestamp)}
            </span>
            <div
              className={`max-w-[90%] px-2.5 py-1.5 rounded-xl text-xs text-white break-words leading-relaxed
                ${msg.isOwn
                  ? "bg-violet-600/80 rounded-tr-sm"
                  : "bg-white/10 rounded-tl-sm"
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 min-w-0"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="p-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg transition disabled:opacity-40 shrink-0"
        >
          <FiSend size={13} className="text-white" />
        </button>
      </div>
    </div>
  );
}

// ─── Video grid ────────────────────────────────────────────────
function VideoGrid({ localStream, participants, audioMuted, videoMuted }) {
  const all = [
    { peerId: "local", displayName: "You", stream: localStream, isLocal: true, audioMuted, videoMuted },
    ...participants,
  ];
  const count = all.length;
  const cols = count === 1 ? "grid-cols-1"
             : count <= 2 ? "grid-cols-2"
             : count <= 4 ? "grid-cols-2"
             : "grid-cols-3";

  return (
    <div className={`grid ${cols} gap-2 p-3 h-full auto-rows-fr`}>
      {all.map(p => (
        <VideoTile
          key={p.peerId}
          stream={p.stream}
          displayName={p.displayName}
          isLocal={p.isLocal}
          audioMuted={p.audioMuted}
          videoMuted={p.videoMuted}
        />
      ))}
    </div>
  );
}

// ─── Participants sidebar ──────────────────────────────────────
function ParticipantsSidebar({ participants, localName, audioMuted, videoMuted }) {
  const all = [
    { peerId: "local", displayName: localName, isLocal: true, audioMuted, videoMuted },
    ...participants,
  ];
  return (
    <div className="w-52 bg-gray-900/80 border-l border-white/10 flex flex-col shrink-0">
      <div className="px-3 py-2.5 border-b border-white/10">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Participants ({all.length})
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {all.map(p => (
          <div key={p.peerId} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: `hsl(${nameToHue(p.displayName)}, 60%, 35%)` }}>
              {p.displayName?.[0]?.toUpperCase() || "?"}
            </div>
            <span className="flex-1 text-sm text-white truncate">{p.displayName}{p.isLocal ? " (You)" : ""}</span>
            <div className="flex items-center gap-1">
              {p.audioMuted ? <FiMicOff size={11} className="text-red-400" /> : <FiMic size={11} className="text-green-400" />}
              {p.videoMuted ? <FiVideoOff size={11} className="text-red-400" /> : <FiVideo size={11} className="text-green-400" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Controls bar ──────────────────────────────────────────────
function ControlsBar({ audioMuted, videoMuted, onToggleAudio, onToggleVideo,
  onScreenShare, isSharing, onLeave, roomCode,
  showParticipants, onToggleParticipants,
  showChat, onToggleChat, unreadCount,
}) {
  const btn = (active, icon, label, onClick, danger = false, badge = 0) => (
    <button onClick={onClick}
      className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border text-xs font-medium transition min-w-[58px]
        ${danger ? "bg-red-600 hover:bg-red-500 border-red-500 text-white"
          : active ? "bg-white/10 hover:bg-white/20 border-white/10 text-white"
          : "bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-400"}`}
    >
      {icon}
      <span>{label}</span>
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="shrink-0 flex items-center justify-between px-3 py-2.5 bg-gray-950 border-t border-white/10 gap-2 flex-wrap">
      <div className="flex items-center gap-2 shrink-0">
        <code className="text-xs text-violet-300 font-mono font-bold bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded tracking-wider">
          {roomCode}
        </code>
        <CopyBtn text={roomCode} label="Copy" />
      </div>

      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {btn(!audioMuted, audioMuted ? <FiMicOff size={15}/> : <FiMic size={15}/>, audioMuted ? "Unmute" : "Mute", onToggleAudio)}
        {btn(!videoMuted, videoMuted ? <FiVideoOff size={15}/> : <FiVideo size={15}/>, videoMuted ? "Cam On" : "Cam Off", onToggleVideo)}
        {btn(!isSharing, <FiMonitor size={15}/>, isSharing ? "Stop" : "Share", onScreenShare)}
        {btn(showParticipants, <FiUsers size={15}/>, "People", onToggleParticipants)}
        {btn(showChat, <FiMessageSquare size={15}/>, "Chat", onToggleChat, false, unreadCount)}
        {btn(true, <FiPhoneOff size={15}/>, "Leave", onLeave, true)}
      </div>

      <div className="w-[80px]" /> {/* spacer */}
    </div>
  );
}

// ─── Pre-join ──────────────────────────────────────────────────
function PreJoinScreen({ roomCode, onJoin, onClose }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
        <FiVideo size={24} className="text-violet-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white">Start Meeting</h2>
        <p className="text-gray-400 text-xs mt-1">Peer-to-peer · Encrypted · No third party</p>
      </div>
      <div className="w-full max-w-sm bg-black/40 border border-white/10 rounded-xl p-3">
        <p className="text-xs text-gray-400 mb-2 text-center">Share code to invite others:</p>
        <div className="flex items-center gap-2 justify-center">
          <code className="text-base text-violet-300 font-mono font-bold tracking-[0.3em]">{roomCode}</code>
          <CopyBtn text={roomCode} label="Copy" />
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <FiWifi size={11} className="text-green-400" /> WebRTC + Supabase signaling
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition">Cancel</button>
        <button onClick={onJoin} className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition">Join Now</button>
      </div>
    </div>
  );
}

function JoinByCodeScreen({ onJoin, onClose }) {
  const [code, setCode] = useState("");
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
        <FiUsers size={24} className="text-blue-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white">Join Meeting</h2>
        <p className="text-gray-400 text-xs mt-1">Enter the code shared with you</p>
      </div>
      <input type="text" placeholder="Enter room code..."
        value={code} onChange={e => setCode(e.target.value.trim())}
        onKeyDown={e => e.key === "Enter" && code && onJoin(code)}
        className="w-full max-w-xs bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-white font-mono text-center text-lg tracking-[0.3em] placeholder-gray-600 focus:outline-none focus:border-violet-500"
        autoFocus
      />
      <div className="flex gap-3">
        <button onClick={onClose} className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition">Cancel</button>
        <button onClick={() => onJoin(code)} disabled={!code}
          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition disabled:opacity-50">Join</button>
      </div>
    </div>
  );
}

// ─── Root MeetingModal ─────────────────────────────────────────
// ✅ FLOATING window — fixed position, draggable, doesn't block app navigation
export default function MeetingModal({ isOpen, onClose, projectId, projectTitle, mode = "host" }) {
  const { user } = useAuthStore();

  const [joined,           setJoined]           = useState(false);
  const [roomId,           setRoomId]            = useState(null);
  const [isMinimized,      setIsMinimized]       = useState(false);
  const [showParticipants, setShowParticipants]  = useState(false);
  const [showChat,         setShowChat]          = useState(false);
  const [isSharing,        setIsSharing]         = useState(false);
  const [unreadCount,      setUnreadCount]       = useState(0);

  // ✅ Draggable state
  const [pos,      setPos]      = useState({ x: window.innerWidth - 420, y: 20 });
  const dragRef    = useRef(null);
  const isDragging = useRef(false);
  const dragStart  = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  const displayName    = user?.user_metadata?.display_name || user?.email || "Guest";
  const defaultRoomCode = `CB-${(projectId || "GENERAL").replace(/[^A-Za-z0-9]/g, "").slice(-8).toUpperCase()}`;

  const {
    localStream, participants, audioMuted, videoMuted,
    isConnecting, error, messages, sendMessage,
    toggleAudio, toggleVideo, startScreenShare, stopScreenShare,
  } = useMeeting({ roomId, displayName, enabled: joined && !!roomId });

  // Track unread messages when chat is closed
  useEffect(() => {
    if (showChat) { setUnreadCount(0); return; }
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (!last.isOwn) setUnreadCount(p => p + 1);
    }
  }, [messages]);

  useEffect(() => { if (showChat) setUnreadCount(0); }, [showChat]);

  // ── Dragging ───────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    if (e.target.closest("button")) return; // don't drag on button clicks
    isDragging.current = true;
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth  - 400, dragStart.current.px + e.clientX - dragStart.current.mx)),
        y: Math.max(0, Math.min(window.innerHeight - 60,  dragStart.current.py + e.clientY - dragStart.current.my)),
      });
    };
    const onUp = () => { isDragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  const handleClose = useCallback(() => {
    setJoined(false); setRoomId(null);
    setIsMinimized(false); setShowParticipants(false);
    setShowChat(false); setIsSharing(false); setUnreadCount(0);
    onClose();
  }, [onClose]);

  const handleHostJoin = useCallback(() => { setRoomId(defaultRoomCode); setJoined(true); }, [defaultRoomCode]);
  const handleCodeJoin = useCallback((code) => { setRoomId(code.toUpperCase()); setJoined(true); }, []);

  const handleScreenShare = useCallback(async () => {
    if (isSharing) { await stopScreenShare(); setIsSharing(false); }
    else { const ok = await startScreenShare(); if (ok) setIsSharing(true); }
  }, [isSharing, startScreenShare, stopScreenShare]);

  if (!isOpen) return null;

  // ── Minimized pill ─────────────────────────────────────────
  if (isMinimized) {
    return (
      <div
        className="fixed z-[2000] bg-gray-950 border border-white/15 rounded-2xl shadow-2xl flex items-center gap-2 px-3 py-2 cursor-move select-none"
        style={{ left: pos.x, top: pos.y, width: "300px" }}
        onMouseDown={onMouseDown}
      >
        <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse shrink-0" />
        <span className="text-white text-xs font-medium truncate flex-1">
          {projectTitle} · {participants.length + 1} in call
        </span>
        {joined && <>
          <button onClick={toggleAudio} className="p-1 hover:bg-white/10 rounded transition">
            {audioMuted ? <FiMicOff size={13} className="text-red-400"/> : <FiMic size={13} className="text-green-400"/>}
          </button>
          <button onClick={toggleVideo} className="p-1 hover:bg-white/10 rounded transition">
            {videoMuted ? <FiVideoOff size={13} className="text-red-400"/> : <FiVideo size={13} className="text-green-400"/>}
          </button>
        </>}
        <button onClick={() => setIsMinimized(false)} className="p-1 hover:bg-white/10 rounded transition text-gray-400 hover:text-white">
          <FiMaximize2 size={13}/>
        </button>
        <button onClick={handleClose} className="p-1 hover:bg-red-500/20 rounded transition">
          <FiPhoneOff size={13} className="text-red-400"/>
        </button>
      </div>
    );
  }

  // ── Full window ────────────────────────────────────────────
  // ✅ NOT blocking — uses fixed position with pointer-events only on the window itself
  // The rest of the app (behind) remains fully interactive
  return (
    <div
      className="fixed z-[2000] select-none"
      style={{ left: pos.x, top: pos.y }}
    >
      <div
        className="bg-gray-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ width: "min(96vw, 900px)", height: "min(85vh, 680px)" }}
      >
        {/* Header — drag handle */}
        <div
          ref={dragRef}
          className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-white/10 cursor-move"
          onMouseDown={onMouseDown}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className={`h-2 w-2 rounded-full shrink-0 ${joined ? "bg-green-400 animate-pulse" : "bg-violet-400"}`} />
            <span className="text-white font-semibold text-sm truncate">{projectTitle} — Meeting</span>
            {joined && <span className="text-xs text-gray-500 shrink-0">· {participants.length + 1} in call</span>}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setIsMinimized(true)} title="Minimize — keep using the app"
              className="p-1.5 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white">
              <FiMinimize2 size={14}/>
            </button>
            <button onClick={handleClose}
              className="p-1.5 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white">
              <FiX size={15}/>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col">

          {/* Pre-join */}
          {!joined && mode === "host" && <PreJoinScreen roomCode={defaultRoomCode} onJoin={handleHostJoin} onClose={handleClose} />}
          {!joined && mode === "join" && <JoinByCodeScreen onJoin={handleCodeJoin} onClose={handleClose} />}

          {/* Connecting */}
          {joined && isConnecting && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-white/20 border-t-violet-400 rounded-full animate-spin" />
              <span className="text-gray-400 text-sm">Connecting to {roomId}...</span>
              <span className="text-gray-600 text-xs">Acquiring camera & microphone...</span>
            </div>
          )}

          {/* Error */}
          {joined && error && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <FiAlertCircle size={32} className="text-red-400" />
              <p className="text-red-400 text-sm max-w-sm">{error}</p>
              <button onClick={() => { setJoined(false); setRoomId(null); }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition">Try Again</button>
            </div>
          )}

          {/* Active call */}
          {joined && !isConnecting && !error && (
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-hidden">
                <VideoGrid localStream={localStream} participants={participants} audioMuted={audioMuted} videoMuted={videoMuted} />
              </div>
              {showParticipants && !showChat && (
                <ParticipantsSidebar participants={participants} localName={displayName} audioMuted={audioMuted} videoMuted={videoMuted} />
              )}
              {showChat && (
                <ChatPanel messages={messages} onSend={sendMessage} displayName={displayName} />
              )}
            </div>
          )}

          {/* Controls */}
          {joined && !isConnecting && !error && (
            <ControlsBar
              audioMuted={audioMuted} videoMuted={videoMuted}
              onToggleAudio={toggleAudio} onToggleVideo={toggleVideo}
              onScreenShare={handleScreenShare} isSharing={isSharing}
              onLeave={handleClose}
              roomCode={roomId || defaultRoomCode}
              showParticipants={showParticipants}
              onToggleParticipants={() => { setShowParticipants(p => !p); setShowChat(false); }}
              showChat={showChat}
              onToggleChat={() => { setShowChat(p => !p); setShowParticipants(false); setUnreadCount(0); }}
              unreadCount={unreadCount}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function nameToHue(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}