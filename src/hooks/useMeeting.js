// src/hooks/useMeeting.js
import { useState, useEffect, useRef, useCallback } from "react";
import Peer from "peerjs";
import { supabase } from "../services/supabaseClient";

function getIceServers() {
  return [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    {
      urls: "turn:global.relay.metered.ca:80",
      username:   import.meta.env.VITE_METERED_USERNAME,
      credential: import.meta.env.VITE_METERED_CREDENTIAL,
    },
    {
      urls: "turn:global.relay.metered.ca:80?transport=tcp",
      username:   import.meta.env.VITE_METERED_USERNAME,
      credential: import.meta.env.VITE_METERED_CREDENTIAL,
    },
    {
      urls: "turn:global.relay.metered.ca:443",
      username:   import.meta.env.VITE_METERED_USERNAME,
      credential: import.meta.env.VITE_METERED_CREDENTIAL,
    },
    {
      urls: "turns:global.relay.metered.ca:443?transport=tcp",
      username:   import.meta.env.VITE_METERED_USERNAME,
      credential: import.meta.env.VITE_METERED_CREDENTIAL,
    },
  ];
}

export function useMeeting({ roomId, displayName, enabled }) {
  const [participants, setParticipants] = useState([]);
  const [localStream,  setLocalStream]  = useState(null);
  const [audioMuted,   setAudioMuted]   = useState(false);
  const [videoMuted,   setVideoMuted]   = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error,        setError]        = useState(null);
  const [myPeerId,     setMyPeerId]     = useState(null);
  const [isSharing,    setIsSharing]    = useState(false);
  const [messages,     setMessages]     = useState([]); // ✅ chat messages

  const peerRef        = useRef(null);
  const channelRef     = useRef(null);
  const callsRef       = useRef({});
  const localStreamRef = useRef(null);
  const audioMutedRef  = useRef(false); // ✅ ref mirrors for use inside callbacks
  const videoMutedRef  = useRef(false);

  // ─── Participant helpers ───────────────────────────────────
  const addParticipant = useCallback((peerId, name, stream) => {
    setParticipants(prev => {
      if (prev.find(p => p.peerId === peerId))
        return prev.map(p => p.peerId === peerId
          ? { ...p, stream: stream ?? p.stream, displayName: name ?? p.displayName }
          : p);
      return [...prev, { peerId, displayName: name || "Guest", stream: stream || null, audioMuted: false, videoMuted: false }];
    });
  }, []);

  const removeParticipant = useCallback((peerId) => {
    setParticipants(prev => prev.filter(p => p.peerId !== peerId));
    try { callsRef.current[peerId]?.close(); } catch {}
    delete callsRef.current[peerId];
  }, []);

  const updateParticipantStream = useCallback((peerId, stream) => {
    setParticipants(prev => prev.map(p => p.peerId === peerId ? { ...p, stream } : p));
  }, []);

  // ─── Call a remote peer ────────────────────────────────────
  const callPeer = useCallback((remotePeerId, remoteName) => {
    const stream = localStreamRef.current;
    if (!peerRef.current || !stream || !remotePeerId) return;
    console.log("📞 Calling peer:", remotePeerId);
    const call = peerRef.current.call(remotePeerId, stream, {
      metadata: { displayName },
    });
    callsRef.current[remotePeerId] = call;
    addParticipant(remotePeerId, remoteName, null);
    call.on("stream", s  => updateParticipantStream(remotePeerId, s));
    call.on("close",  () => removeParticipant(remotePeerId));
    call.on("error",  () => removeParticipant(remotePeerId));
  }, [displayName, addParticipant, updateParticipantStream, removeParticipant]);

  // ─── Broadcast via Supabase Realtime ──────────────────────
  const broadcast = useCallback((event, extra = {}) => {
    channelRef.current?.send({
      type: "broadcast",
      event: "meeting-signal",
      payload: { event, peerId: peerRef.current?.id, displayName, roomId, ...extra },
    });
  }, [displayName, roomId]);

  // ─── Init ──────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !roomId || !displayName) return;
    let destroyed = false;

    const init = async () => {
      setIsConnecting(true);
      setError(null);
      try {
        // Get media — try video+audio, fall back to audio only
        const stream = await navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .catch(() => navigator.mediaDevices.getUserMedia({ video: false, audio: true }));

        if (destroyed) { stream.getTracks().forEach(t => t.stop()); return; }

        localStreamRef.current = stream;
        setLocalStream(stream);

        // Create PeerJS instance
        const peer = new Peer({ config: { iceServers: getIceServers() }, debug: 1 });
        peerRef.current = peer;

        await new Promise((resolve, reject) => {
          peer.on("open",  resolve);
          peer.on("error", reject);
          setTimeout(() => reject(new Error("PeerJS connection timeout")), 15000);
        });

        if (destroyed) { peer.destroy(); return; }

        setMyPeerId(peer.id);
        console.log("✅ PeerJS ready:", peer.id);

        // Answer incoming calls
        peer.on("call", call => {
          console.log("📲 Incoming call from:", call.peer);
          call.answer(localStreamRef.current);
          callsRef.current[call.peer] = call;
          addParticipant(call.peer, call.metadata?.displayName, null);
          call.on("stream", s  => updateParticipantStream(call.peer, s));
          call.on("close",  () => removeParticipant(call.peer));
          call.on("error",  () => removeParticipant(call.peer));
        });

        peer.on("disconnected", () => { try { peer.reconnect(); } catch {} });
        peer.on("error", e => { if (e.type !== "peer-unavailable") setError(e.message); });

        // Subscribe to Supabase signaling + chat channel
        const channel = supabase.channel(`meeting:${roomId}`, {
          config: { broadcast: { self: false } },
        });
        channelRef.current = channel;

        // ── Signaling messages ─────────────────────────────
        channel.on("broadcast", { event: "meeting-signal" }, ({ payload }) => {
          if (!payload || payload.roomId !== roomId) return;
          const myId = peerRef.current?.id;

          if (payload.event === "join" && payload.peerId !== myId) {
            console.log("👋 Join:", payload.displayName, payload.peerId);
            addParticipant(payload.peerId, payload.displayName, null);
            callPeer(payload.peerId, payload.displayName);
          }
          if (payload.event === "leave" && payload.peerId !== myId) {
            removeParticipant(payload.peerId);
          }
          if (payload.event === "mute-update" && payload.peerId !== myId) {
            setParticipants(prev => prev.map(p =>
              p.peerId === payload.peerId
                ? { ...p, audioMuted: payload.audioMuted, videoMuted: payload.videoMuted }
                : p
            ));
          }
        });

        // ── Chat messages ──────────────────────────────────
        channel.on("broadcast", { event: "meeting-chat" }, ({ payload }) => {
          if (!payload || payload.roomId !== roomId) return;
          setMessages(prev => [...prev, {
            id:          payload.id || Date.now(),
            senderName:  payload.senderName,
            text:        payload.text,
            timestamp:   payload.timestamp || Date.now(),
            isOwn:       payload.peerId === peerRef.current?.id,
          }]);
        });

        await channel.subscribe();
        broadcast("join");
        setIsConnecting(false);

      } catch (err) {
        console.error("Meeting init error:", err);
        if (!destroyed) { setError(err.message); setIsConnecting(false); }
      }
    };

    init();

    return () => {
      destroyed = true;
      broadcast("leave");
      Object.values(callsRef.current).forEach(c => { try { c.close(); } catch {} });
      callsRef.current = {};
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
      peerRef.current?.destroy();
      peerRef.current = null;
      channelRef.current?.unsubscribe();
      channelRef.current = null;
      setParticipants([]);
      setLocalStream(null);
      setMyPeerId(null);
      setIsSharing(false);
      setMessages([]);
    };
  }, [enabled, roomId, displayName]);

  // ─── Audio toggle ──────────────────────────────────────────
  const toggleAudio = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const newMuted = !audioMutedRef.current;
    audioMutedRef.current = newMuted;
    stream.getAudioTracks().forEach(t => { t.enabled = !newMuted; });
    setAudioMuted(newMuted);
    broadcast("mute-update", { audioMuted: newMuted, videoMuted: videoMutedRef.current });
  }, [broadcast]);

  // ─── Video toggle ──────────────────────────────────────────
  // ✅ FIX: when turning camera back ON, re-acquire from hardware
  // because track.enabled=true doesn't restart a stopped track
  const toggleVideo = useCallback(async () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const newMuted = !videoMutedRef.current;
    videoMutedRef.current = newMuted;

    if (newMuted) {
      // ── Turning OFF — just disable the track ──────────────
      stream.getVideoTracks().forEach(t => { t.enabled = false; });
      setVideoMuted(true);
      broadcast("mute-update", { audioMuted: audioMutedRef.current, videoMuted: true });
    } else {
      // ── Turning ON — re-acquire camera from hardware ──────
      // track.enabled = true won't work if the track was stopped or
      // if the camera hardware released the stream
      try {
        const existing = stream.getVideoTracks()[0];

        if (existing && existing.readyState === "live") {
          // Track still alive — just re-enable it
          existing.enabled = true;
        } else {
          // Track is ended/stopped — get a fresh one
          const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
          const newTrack  = newStream.getVideoTracks()[0];

          // Remove dead track from stream
          if (existing) stream.removeTrack(existing);
          stream.addTrack(newTrack);

          // Replace track in all active peer connections so remotes see camera again
          for (const call of Object.values(callsRef.current)) {
            const sender = call.peerConnection
              ?.getSenders()
              .find(s => s.track?.kind === "video");
            if (sender) await sender.replaceTrack(newTrack);
          }

          // ✅ Create new stream reference so VideoTile re-renders
          localStreamRef.current = new MediaStream(stream.getTracks());
          setLocalStream(new MediaStream(stream.getTracks()));
        }

        setVideoMuted(false);
        broadcast("mute-update", { audioMuted: audioMutedRef.current, videoMuted: false });
      } catch (e) {
        console.error("Failed to re-acquire camera:", e);
        // Camera might still be busy — stay muted
        videoMutedRef.current = true;
      }
    }
  }, [broadcast]);

  // ─── Send chat message ─────────────────────────────────────
  const sendMessage = useCallback((text) => {
    if (!text.trim() || !channelRef.current) return;
    const msg = {
      id:         Date.now(),
      peerId:     peerRef.current?.id,
      senderName: displayName,
      text:       text.trim(),
      timestamp:  Date.now(),
      roomId,
    };
    // Add to own messages immediately (self: false means we don't receive our own broadcasts)
    setMessages(prev => [...prev, { ...msg, isOwn: true }]);
    // Broadcast to others
    channelRef.current.send({
      type: "broadcast",
      event: "meeting-chat",
      payload: msg,
    });
  }, [displayName, roomId]);

  // ─── Screen share ──────────────────────────────────────────
  const startScreenShare = useCallback(async () => {
    try {
      const sources = await window.electronAPI.getScreenSources();
      if (!sources || sources.length === 0) return false;

      const source = sources.find(s => s.name === "Entire Screen" || s.name === "Screen 1")
                  || sources[0];

      const screenStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource:   "desktop",
            chromeMediaSourceId: source.id,
            minWidth: 1280, maxWidth: 1920,
            minHeight: 720, maxHeight: 1080,
          },
        },
      });

      const screenTrack = screenStream.getVideoTracks()[0];
      const stream = localStreamRef.current;

      // Replace in all peer connections
      for (const call of Object.values(callsRef.current)) {
        const sender = call.peerConnection?.getSenders().find(s => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(screenTrack);
      }

      // Swap in local stream
      const camTrack = stream?.getVideoTracks()[0];
      if (camTrack) stream.removeTrack(camTrack);
      stream.addTrack(screenTrack);
      localStreamRef.current = new MediaStream(stream.getTracks());
      setLocalStream(new MediaStream(stream.getTracks()));

      screenTrack.onended = () => stopScreenShare();
      setIsSharing(true);
      return true;
    } catch (e) {
      console.error("Screen share error:", e);
      return false;
    }
  }, []);

  const stopScreenShare = useCallback(async () => {
    try {
      const camStream = await navigator.mediaDevices.getUserMedia({ video: true }).catch(() => null);
      const camTrack  = camStream?.getVideoTracks()[0] || null;
      const stream    = localStreamRef.current;

      for (const call of Object.values(callsRef.current)) {
        const sender = call.peerConnection?.getSenders().find(s => s.track?.kind === "video");
        if (sender && camTrack) await sender.replaceTrack(camTrack);
      }

      const screenTrack = stream?.getVideoTracks()[0];
      if (screenTrack) { stream.removeTrack(screenTrack); screenTrack.stop(); }
      if (camTrack) stream.addTrack(camTrack);

      localStreamRef.current = new MediaStream(stream.getTracks());
      setLocalStream(new MediaStream(stream.getTracks()));
      setIsSharing(false);
    } catch (e) {
      console.error("Stop screen share error:", e);
      setIsSharing(false);
    }
  }, []);

  return {
    localStream, participants, myPeerId,
    audioMuted, videoMuted, isSharing,
    isConnecting, error,
    messages, sendMessage,           // ✅ chat
    toggleAudio, toggleVideo,
    startScreenShare, stopScreenShare,
  };
}