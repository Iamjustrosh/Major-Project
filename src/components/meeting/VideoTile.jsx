// src/components/meeting/VideoTile.jsx
import React, { useEffect, useRef } from "react";
import { FiMicOff, FiVideoOff } from "react-icons/fi";

export default function VideoTile({ stream, displayName, isLocal, audioMuted, videoMuted }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // ✅ Re-attach whenever stream object reference changes
  // This fires when camera is re-acquired (new MediaStream created in useMeeting)
  useEffect(() => {
    if (!videoRef.current) return;
    if (stream) {
      videoRef.current.srcObject = stream;
    } else {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  useEffect(() => {
    if (!audioRef.current || isLocal) return;
    if (stream) {
      audioRef.current.srcObject = stream;
    } else {
      audioRef.current.srcObject = null;
    }
  }, [stream, isLocal]);

  // Determine if we actually have a live, enabled video track
  const hasLiveVideo = stream
    && stream.getVideoTracks().some(t => t.readyState === "live" && t.enabled);

  const showAvatar = !hasLiveVideo || videoMuted;

  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center w-full h-full min-h-[120px]">

      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="w-full h-full object-cover"
        style={{ display: showAvatar ? "none" : "block" }}
      />

      {/* Avatar fallback */}
      {showAvatar && (
        <div className="flex flex-col items-center gap-2 z-10">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white"
            style={{
              background: `hsl(${nameToHue(displayName)}, 60%, 35%)`,
              border: `2px solid hsl(${nameToHue(displayName)}, 60%, 50%)`,
            }}
          >
            {displayName?.[0]?.toUpperCase() || "?"}
          </div>
          <span className="text-xs text-gray-400">{displayName}</span>
        </div>
      )}

      {/* Audio for remote peers */}
      {!isLocal && <audio ref={audioRef} autoPlay playsInline />}

      {/* Name + status bar */}
      <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between">
        <span className="text-xs text-white font-medium truncate">
          {displayName}{isLocal ? " (You)" : ""}
        </span>
        <div className="flex items-center gap-1">
          {audioMuted && <FiMicOff size={10} className="text-red-400" />}
          {videoMuted && <FiVideoOff size={10} className="text-red-400" />}
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