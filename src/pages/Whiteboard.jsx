// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { supabase } from "../services/supabaseClient";
// import { Tldraw, createTLStore, defaultShapeUtils, loadSnapshot, getSnapshot } from "tldraw";
// import { useAuthStore } from "../store/useAuthStore";
// import { FiShare2, FiCode, FiWifi, FiCopy, FiCheck } from "react-icons/fi";
// import CodeWorkspace_Improved from "../components/code/CodeWorkspace_Improved";
// import "tldraw/tldraw.css";

// // User Presence Component
// function UserPresencePanel({ users, currentUserId }) {
//   const [isOpen, setIsOpen] = useState(false);

//   if (users.length === 0) return null;

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition"
//       >
//         <FiWifi className="text-green-400" />
//         <span className="text-sm">{users.length} online</span>
        
//         <div className="flex -space-x-2">
//           {users.slice(0, 3).map((user, idx) => (
//             <div
//               key={`${user.id}-${idx}`}
//               className="w-7 h-7 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white"
//               style={{ backgroundColor: user.color }}
//               title={user.name}
//             >
//               {user.name?.[0]?.toUpperCase() || "?"}
//             </div>
//           ))}
//           {users.length > 3 && (
//             <div className="w-7 h-7 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white">
//               +{users.length - 3}
//             </div>
//           )}
//         </div>
//       </button>

//       {isOpen && (
//         <>
//           <div 
//             className="fixed inset-0 z-40" 
//             onClick={() => setIsOpen(false)}
//           />
//           <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900 border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50">
//             <div className="p-3 border-b border-white/20 bg-white/5">
//               <h3 className="text-sm font-semibold text-white">Online Users</h3>
//             </div>
            
//             <div className="max-h-80 overflow-y-auto">
//               {users.map((user, idx) => (
//                 <div
//                   key={`${user.id}-${idx}-panel`}
//                   className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition"
//                 >
//                   <div
//                     className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
//                     style={{ backgroundColor: user.color }}
//                   >
//                     {user.name?.[0]?.toUpperCase() || "?"}
//                   </div>
                  
//                   <div className="flex-1 min-w-0">
//                     <p className="text-white font-medium truncate">
//                       {user.name}
//                       {user.id === currentUserId && (
//                         <span className="ml-2 text-xs text-blue-400">(You)</span>
//                       )}
//                     </p>
//                     <p className="text-xs text-gray-400">
//                       <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
//                       Active now
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// // Share Modal Component
// function ShareModal({ isOpen, onClose, shareCode }) {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = async () => {
//     await navigator.clipboard.writeText(shareCode);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   if (!isOpen) return null;

//   return (
//     <>
//       <div 
//         className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
//         onClick={onClose}
//       >
//         <div 
//           className="bg-gray-900 border border-white/20 rounded-2xl p-6 w-full max-w-md mx-4"
//           onClick={(e) => e.stopPropagation()}
//         >
//           <h2 className="text-2xl font-bold text-white mb-4">Share Whiteboard_TldrawSync</h2>
          
//           <p className="text-gray-400 text-sm mb-4">
//             Share this code with others to invite them to collaborate:
//           </p>

//           <div className="bg-black/50 border border-white/20 rounded-xl p-4 mb-4">
//             <div className="flex items-center justify-between gap-3">
//               <code className="text-xl font-mono text-white font-bold tracking-wider flex-1">
//                 {shareCode}
//               </code>
//               <button
//                 onClick={handleCopy}
//                 className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition flex items-center gap-2 shrink-0"
//               >
//                 {copied ? (
//                   <>
//                     <FiCheck className="text-white" />
//                     <span className="text-white font-medium">Copied!</span>
//                   </>
//                 ) : (
//                   <>
//                     <FiCopy className="text-white" />
//                     <span className="text-white font-medium">Copy</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>

//           <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
//             <p className="text-blue-300 text-sm">
//               💡 Paste this code in the "Join Room" button on the projects page
//             </p>
//           </div>

//           <button
//             onClick={onClose}
//             className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition text-white font-medium"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }

// export default function Whiteboard_TldrawSync() {
//   const { projectId } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuthStore();

//   const [project, setProject] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [connectedUsers, setConnectedUsers] = useState([]);
//   const [isConnected, setIsConnected] = useState(false);
//   const [showEditor, setShowEditor] = useState(false);
//   const [shareModalOpen, setShareModalOpen] = useState(false);
//   const [editorHasFocus, setEditorHasFocus] = useState(false);

//   const storeRef = useRef(null);
//   const channelRef = useRef(null);
//   const isReceivingRef = useRef(false);
//   const saveTimeoutRef = useRef(null);

//   const userInfo = {
//     id: user?.id,
//     name: user?.user_metadata?.display_name || "Anonymous",
//     color: `hsl(${((user?.id || "").charCodeAt(0) || 0) * 137.5 % 360}, 70%, 50%)`,
//   };

//   // Create tldraw store
//   if (!storeRef.current) {
//     storeRef.current = createTLStore({ shapeUtils: defaultShapeUtils });
//   }

//   // Load snapshot from Supabase on mount
//   useEffect(() => {
//     if (!projectId || !storeRef.current) return;

//     const loadSnapshot = async () => {
//       try {
//         const { data, error } = await supabase
//           .from("projects")
//           .select("canvas_data")
//           .eq("id", projectId)
//           .single();

//         if (!error && data?.canvas_data) {
//           console.log("📂 Loading saved canvas data");
//           const store = storeRef.current;
          
//           // Load the snapshot into the store
//           store.loadSnapshot({
//             store: data.canvas_data.store,
//             schema: data.canvas_data.schema
//           });
//         }
//       } catch (err) {
//         console.error("❌ Error loading canvas:", err);
//       }
//     };

//     loadSnapshot();
//   }, [projectId]);

//   // Save to Supabase with debouncing
//   const saveToSupabase = useCallback(async () => {
//     if (!storeRef.current || !projectId) return;

//     try {
//       const snapshot = getSnapshot(storeRef.current);
      
//       const { error } = await supabase
//         .from("projects")
//         .update({ 
//           canvas_data: snapshot,
//           updated_at: new Date().toISOString()
//         })
//         .eq("id", projectId);

//       if (error) {
//         console.error("❌ Error saving canvas:", error);
//       } else {
//         console.log("💾 Canvas saved to database");
//       }
//     } catch (err) {
//       console.error("❌ Error saving:", err);
//     }
//   }, [projectId]);

//   // Debounced save function
//   const debouncedSave = useCallback(() => {
//     if (saveTimeoutRef.current) {
//       clearTimeout(saveTimeoutRef.current);
//     }
//     saveTimeoutRef.current = setTimeout(() => {
//       saveToSupabase();
//     }, 2000); // Save 2 seconds after last change
//   }, [saveToSupabase]);

//   // Setup realtime sync
//   useEffect(() => {
//     if (!projectId) return;

//     console.log("🟢 Connecting to room:", projectId);

//     const channel = supabase.channel(`collab:${projectId}`, {
//       config: {
//         broadcast: { self: false },
//         presence: { key: user?.id },
//       },
//     });

//     channelRef.current = channel;

//     channel
//       .on("presence", { event: "sync" }, () => {
//         const state = channel.presenceState();
//         const users = Object.values(state).flat();
        
//         // Remove duplicates based on user ID
//         const uniqueUsers = users.reduce((acc, current) => {
//           const existing = acc.find(u => u.id === current.id);
//           if (!existing) {
//             acc.push(current);
//           }
//           return acc;
//         }, []);
        
//         setConnectedUsers(uniqueUsers);
//         console.log("👥 Online:", uniqueUsers.map(u => u.name).join(", "));
//       })
//       .on("broadcast", { event: "draw" }, ({ payload }) => {
//         console.log("📥 Received drawing from:", payload.user);
        
//         isReceivingRef.current = true;
        
//         try {
//           const store = storeRef.current;
//           const { type, data } = payload;

//           store.mergeRemoteChanges(() => {
//             if (type === "put") {
//               store.put(data);
//             } else if (type === "remove") {
//               store.remove(data);
//             } else if (type === "snapshot") {
//               // Load full snapshot from new user
//               store.loadSnapshot(data);
//             }
//           });
//         } catch (err) {
//           console.error("❌ Error applying changes:", err);
//         } finally {
//           isReceivingRef.current = false;
//         }
//       })
//       .on("broadcast", { event: "request-state" }, ({ payload }) => {
//         if (payload.userId === user?.id) return;
//         if (!isConnected) return; // Don't send if not connected
        
//         console.log("📤 Sending full state to:", payload.user);
        
//         const snapshot = getSnapshot(storeRef.current);

//         // Send snapshot without awaiting (prevents REST fallback warning)
//         channel.send({
//           type: "broadcast",
//           event: "draw",
//           payload: {
//             type: "snapshot",
//             data: snapshot,
//             user: userInfo.name,
//             userId: user?.id,
//           },
//         });
//       })
//       .subscribe(async (status) => {
//         console.log("🔌 Status:", status);
//         setIsConnected(status === "SUBSCRIBED");
        
//         if (status === "SUBSCRIBED") {
//           await channel.track(userInfo);
          
//           // Request state from other users
//           channel.send({
//             type: "broadcast",
//             event: "request-state",
//             payload: {
//               user: userInfo.name,
//               userId: user?.id,
//             },
//           });
//         }
//       });

//     return () => {
//       console.log("🔴 Disconnecting");
//       if (saveTimeoutRef.current) {
//         clearTimeout(saveTimeoutRef.current);
//       }
//       saveToSupabase(); // Save before leaving
//       channel.untrack();
//       channel.unsubscribe();
//     };
//   }, [projectId, user?.id, userInfo.name, userInfo.color, saveToSupabase]);

//   // Listen to local changes for broadcasting
//   useEffect(() => {
//     if (!storeRef.current || !channelRef.current || !isConnected) return;

//     const store = storeRef.current;
//     const channel = channelRef.current;

//     const handleChange = (change) => {
//       if (isReceivingRef.current) return;
//       if (!isConnected) return; // Don't broadcast if not connected
//       if (!channel) return; // Safety check

//       const { changes } = change;
//       const { added, updated, removed } = changes;

//       const putRecords = [
//         ...Object.values(added),
//         ...Object.values(updated).map(([_, to]) => to),
//       ];

//       if (putRecords.length > 0) {
//         console.log("📤 Broadcasting", putRecords.length, "shapes");
        
//         // Don't await to prevent REST fallback
//         channel.send({
//           type: "broadcast",
//           event: "draw",
//           payload: {
//             type: "put",
//             data: putRecords,
//             user: userInfo.name,
//             userId: user?.id,
//           },
//         });

//         // Trigger debounced save
//         debouncedSave();
//       }

//       if (Object.keys(removed).length > 0) {
//         const removeIds = Object.keys(removed);
        
//         console.log("📤 Broadcasting delete", removeIds.length, "shapes");
        
//         channel.send({
//           type: "broadcast",
//           event: "draw",
//           payload: {
//             type: "remove",
//             data: removeIds,
//             user: userInfo.name,
//             userId: user?.id,
//           },
//         });

//         // Trigger debounced save
//         debouncedSave();
//       }
//     };

//     const unsubscribe = store.listen(handleChange, {
//       source: "user",
//       scope: "document",
//     });

//     return unsubscribe;
//   }, [user?.id, userInfo.name, debouncedSave, isConnected]);

//   // Fetch project metadata
//   useEffect(() => {
//     const fetchProject = async () => {
//       const { data, error } = await supabase
//         .from("projects")
//         .select("id, title, share_code")
//         .eq("id", projectId)
//         .maybeSingle();

//       if (error || !data) {
//         console.error("Project not found");
//         navigate("/projects");
//         return;
//       }

//       if (!data.share_code) {
//         const code = crypto.randomUUID();
//         await supabase
//           .from("projects")
//           .update({ share_code: code })
//           .eq("id", projectId);
//         data.share_code = code;
//       }

//       setProject(data);
//       setLoading(false);
//     };

//     fetchProject();
//   }, [projectId, navigate]);

//   if (loading) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-black text-white">
//         <div className="flex flex-col items-center gap-4">
//           <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//           <p className="text-lg">Loading Whiteboard_TldrawSync...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen flex flex-col bg-black text-white">
//       {/* Top Bar */}
//       <div className="flex items-center justify-between p-4 bg-white/10 border-b border-white/20 z-50">
//         <button
//           onClick={() => navigate("/projects")}
//           className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition"
//         >
//           ← Back
//         </button>

//         <div className="flex flex-col items-center">
//           <h1 className="text-xl font-semibold">{project?.title}</h1>
//           <div className="flex items-center gap-2 text-xs text-gray-400">
//             {isConnected ? (
//               <span className="text-green-400">● Connected</span>
//             ) : (
//               <span className="text-yellow-400">● Connecting...</span>
//             )}
//           </div>
//         </div>

//         <div className="flex items-center gap-3">
//           {isConnected && (
//             <UserPresencePanel 
//               users={connectedUsers} 
//               currentUserId={user?.id}
//             />
//           )}

//           <button
//             onClick={() => setShowEditor(!showEditor)}
//             className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition flex items-center gap-2"
//           >
//             <FiCode />
//             {showEditor ? "Close" : "Code"}
//           </button>

//           <button
//             onClick={() => setShareModalOpen(true)}
//             className="px-4 py-2 bg-blue-600 rounded-xl hover:bg-blue-500 transition flex items-center gap-2"
//           >
//             <FiShare2 />
//             Share
//           </button>
//         </div>
//       </div>

//       {/* Canvas */}
//       <div className="flex flex-1 overflow-hidden">
//         <div className={`h-full transition-all duration-300 ${showEditor ? "w-1/2" : "flex-1"}`}>
//           <Tldraw 
//             // store={storeRef.current}
//             persistenceKey={`project-${projectId}`}
//             autoFocus={!editorHasFocus}
//           />
//         </div>

//         {showEditor && (
//           <div className="w-1/2 h-full bg-gray-900 border-l border-white/20">
//             <CodeWorkspace_Improved 
//               onSaveProject={() => {}}
//               onFocus={() => setEditorHasFocus(true)}
//               onBlur={() => setEditorHasFocus(false)}
//             />
//           </div>
//         )}
//       </div>

//       <ShareModal 
//         isOpen={shareModalOpen}
//         onClose={() => setShareModalOpen(false)}
//         shareCode={project?.share_code || ""}
//       />
//     </div>
//   );
// }