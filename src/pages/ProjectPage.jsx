import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuthStore } from "../store/useAuthStore";
import {
  FiPlus, FiEdit2, FiTrash2, FiShare2,
  FiLogOut, FiMoreVertical, FiUser, FiVideo, FiPhoneIncoming,
} from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
// ✅ No MeetingModal import needed — it lives at App root now

function Modal({ open, onClose, children, zIndexOverride }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60"
      style={{ zIndex: zIndexOverride ?? 50 }}>
      <div className="bg-[#151c2c] text-white rounded-xl shadow-xl p-8 w-80 relative">
        {children}
        <button className="absolute top-2 right-2 text-lg text-gray-400 hover:text-gray-200"
          onClick={onClose} aria-label="Close">×</button>
      </div>
    </div>
  );
}

const Z_INDEX_TOP = 1000;

const ProjectPage = () => {
  const { user, signOut } = useAuthStore();
  const [projects, setProjects]   = useState([]);
  const [loading,  setLoading]    = useState(false);
  const navigate                  = useNavigate();

  const [createModalOpen, setCreateModalOpen]   = useState(false);
  const [newProjectTitle, setNewProjectTitle]   = useState("");
  const [renameModal,     setRenameModal]       = useState({ open: false, projectId: null, currentName: "" });
  const [renameInput,     setRenameInput]       = useState("");
  const [deleteModal,     setDeleteModal]       = useState({ open: false, projectId: null, projectTitle: "" });
  const [shareModal,      setShareModal]        = useState({ open: false, projectId: null, shareCode: "" });
  const [joinModalOpen,   setJoinModalOpen]     = useState(false);
  const [joinCode,        setJoinCode]          = useState("");
  const [copiedCode,      setCopiedCode]        = useState(false);
  const [profileModal,    setProfileModal]      = useState(false);
  const [profileNameInput, setProfileNameInput] = useState("");
  const [profileLoading,  setProfileLoading]    = useState(false);
  const [openProjectMenu, setOpenProjectMenu]   = useState(null);
  const projectMenuRefs                         = useRef({});

  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  const fetchProjects = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("projects").select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error) setProjects(data || []);
  };

  useEffect(() => { fetchProjects(); }, [user]);

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("projects").insert([
      { user_id: user.id, title: newProjectTitle.trim() },
    ]);
    setLoading(false);
    if (!error) { setNewProjectTitle(""); setCreateModalOpen(false); fetchProjects(); }
  };

  const openRenameModal = (id, currentName) => {
    setRenameModal({ open: true, projectId: id, currentName });
    setRenameInput(currentName);
    setOpenProjectMenu(null);
  };
  const handleRename = async () => {
    const { projectId } = renameModal;
    if (!projectId || !renameInput.trim()) return;
    await supabase.from("projects").update({ title: renameInput.trim() }).eq("id", projectId);
    setRenameModal({ open: false, projectId: null, currentName: "" });
    setRenameInput("");
    fetchProjects();
  };

  const openDeleteModal = (id, projectTitle) => {
    setDeleteModal({ open: true, projectId: id, projectTitle });
    setOpenProjectMenu(null);
  };
  const handleDelete = async () => {
    const { projectId } = deleteModal;
    if (!projectId) return;
    await supabase.from("projects").delete().eq("id", projectId);
    setDeleteModal({ open: false, projectId: null, projectTitle: "" });
    fetchProjects();
  };

  const openShareModal = async (id) => {
    let { data: project, error } = await supabase.from("projects").select("share_code").eq("id", id).single();
    if (error) return;
    let shareCode = project.share_code;
    if (!shareCode) {
      shareCode = crypto.randomUUID();
      await supabase.from("projects").update({ share_code: shareCode }).eq("id", id);
    }
    setShareModal({ open: true, projectId: id, shareCode });
    setCopiedCode(false);
    setOpenProjectMenu(null);
  };

  const handleJoinProject = async () => {
    if (!joinCode.trim()) return;
    const { data: project, error } = await supabase
      .from("projects").select("*").eq("share_code", joinCode).single();
    if (error || !project) { alert("Invalid share code!"); return; }
    navigate(`/Whiteboard_TldrawSync/${project.id}`);
    setJoinModalOpen(false);
    setJoinCode("");
  };

  const displayName     = user?.user_metadata?.display_name || "";
  const shouldPromptName = !displayName || displayName.trim().toLowerCase() === "user";
  const openProfileModal = () => { setProfileNameInput(displayName); setProfileModal(true); };
  const handleProfileSave = async () => {
    if (!profileNameInput.trim()) return;
    setProfileLoading(true);
    const { error } = await supabase.auth.updateUser({ data: { display_name: profileNameInput.trim() } });
    setProfileLoading(false);
    if (!error) { setProfileModal(false); window.location.reload(); }
    else alert("Failed to update display name.");
  };

  useEffect(() => {
    if (openProjectMenu === null) return;
    const handler = (e) => {
      if (projectMenuRefs.current[openProjectMenu] && !projectMenuRefs.current[openProjectMenu].contains(e.target))
        setOpenProjectMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openProjectMenu, projects]);

  // ✅ Open meeting via global function — MeetingModal lives at App root
  const startMeeting = (projectId, projectTitle, mode = "host") => {
    window.openMeeting?.(projectId, projectTitle, mode);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-8 relative overflow-hidden">
      <div className="bg-[#00496E] w-[500px] h-[500px] blur-[200px] rounded-full absolute bottom-0 translate-y-1/2" />

      {/* Top bar */}
      <div className="w-full flex justify-between items-center mb-10">
        <h1 className="text-3xl font-semibold">My Projects</h1>

        <div className="flex items-center gap-3">
          <button onClick={() => setJoinModalOpen(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl text-white font-medium transition">
            Join Room
          </button>

          {/* ✅ Join Meeting button */}
          <button
            onClick={() => startMeeting("general", "Meeting", "join")}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-medium transition"
          >
            <FiPhoneIncoming size={15} /> Join Meeting
          </button>

          {/* ✅ Start Meeting button */}
          <button
            onClick={() => startMeeting("general", "General Meeting", "host")}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-white font-medium transition"
          >
            <FiVideo size={15} /> Start Meeting
          </button>

          <Menu as="div" className="relative inline-block text-left z-10">
            <MenuButton className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 transition-all">
              <FaUserCircle className="text-2xl" />
              <span>{displayName || <span className="italic text-gray-400">No Name</span>}</span>
            </MenuButton>
            <MenuItems className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg overflow-hidden z-50">
              <MenuItem>{({ active }) => (
                <button onClick={openProfileModal} className={`w-full px-4 py-2 text-left flex items-center gap-2 ${active ? "bg-white/20" : ""}`}>
                  <FiUser /> Edit Name
                </button>
              )}</MenuItem>
              <MenuItem>{({ active }) => (
                <button onClick={signOut} className={`w-full px-4 py-2 text-left flex items-center gap-2 ${active ? "bg-white/20" : ""}`}>
                  <FiLogOut /> Logout
                </button>
              )}</MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>

      {shouldPromptName && (
        <div className="w-full max-w-xl mb-4 p-4 bg-yellow-600/20 border-l-4 border-yellow-500 text-yellow-200 rounded">
          You haven't set a display name yet.{" "}
          <button className="underline ml-1" onClick={openProfileModal}>Click here to add your name.</button>
        </div>
      )}

      {/* Create new project */}
      <div className="w-full max-w-4xl mb-10">
        <h2 className="text-xl mb-4 font-medium">Create New Project</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            className="flex flex-col items-center justify-center bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl cursor-pointer h-40 hover:bg-white/20 transition-all"
            onClick={() => setCreateModalOpen(true)}
          >
            <div className="flex flex-col items-center justify-center text-blue-400">
              <FiPlus size={32} />
              <span className="mt-2 font-medium text-white text-lg">Create New</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="w-full max-w-4xl">
        <h2 className="text-xl mb-4 font-medium">Recent Projects</h2>
        {projects.length === 0 ? (
          <p className="text-gray-400">No projects yet. Create your first one!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-30">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => navigate(`/Whiteboard_TldrawSync/${proj.id}`)}
                className="relative bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl p-5 flex flex-col justify-between hover:bg-white/20 transition-all cursor-pointer"
                style={{ zIndex: openProjectMenu === proj.id ? Z_INDEX_TOP + 110 : "auto" }}
              >
                <div>
                  <h3 className="text-lg font-semibold">{proj.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{new Date(proj.created_at).toLocaleString()}</p>
                </div>

                <div className="flex justify-between items-center mt-4 relative">
                  {/* ✅ Per-project Meet button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); startMeeting(proj.id, proj.title, "host"); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 rounded-lg text-violet-300 text-xs transition"
                  >
                    <FiVideo size={12} /> Meet
                  </button>

                  <div ref={el => { projectMenuRefs.current[proj.id] = el; }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenProjectMenu(openProjectMenu === proj.id ? null : proj.id); }}
                      className="flex items-center justify-center w-8 h-8 hover:bg-white/10 rounded-full transition"
                    >
                      <FiMoreVertical />
                    </button>
                    {openProjectMenu === proj.id && (
                      <div
                        className="absolute right-0 top-12 w-32 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg overflow-hidden"
                        style={{ zIndex: Z_INDEX_TOP + 200 }}
                        onClick={e => e.stopPropagation()}
                      >
                        <button className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/20" onClick={() => openRenameModal(proj.id, proj.title)}><FiEdit2 /> Edit</button>
                        <button className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/20" onClick={() => openShareModal(proj.id)}><FiShare2 /> Share</button>
                        <button className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/20 text-red-500" onClick={() => openDeleteModal(proj.id, proj.title)}><FiTrash2 /> Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} zIndexOverride={Z_INDEX_TOP + 10}>
        <h3 className="text-lg mb-4 font-semibold">Create New Project</h3>
        <input type="text" placeholder="Project Title" value={newProjectTitle}
          onChange={e => setNewProjectTitle(e.target.value)}
          className="w-full p-3 rounded-xl bg-black/30 border border-white/20 text-white placeholder-gray-400 mb-4" />
        <div className="flex gap-3 justify-end">
          <button onClick={() => setCreateModalOpen(false)} className="bg-gray-700 px-4 py-2 rounded-lg">Cancel</button>
          <button disabled={loading || !newProjectTitle.trim()} onClick={handleCreateProject} className="bg-blue-600 px-4 py-2 rounded-lg disabled:opacity-70">
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </Modal>

      <Modal open={renameModal.open} onClose={() => setRenameModal({ open: false, projectId: null, currentName: "" })} zIndexOverride={Z_INDEX_TOP + 20}>
        <h3 className="text-lg mb-4 font-semibold">Rename Project</h3>
        <input type="text" placeholder="New Project Name" value={renameInput}
          onChange={e => setRenameInput(e.target.value)}
          className="w-full p-3 rounded-xl bg-black/30 border border-white/20 text-white placeholder-gray-400 mb-4" />
        <div className="flex gap-3 justify-end">
          <button onClick={() => setRenameModal({ open: false, projectId: null, currentName: "" })} className="bg-gray-700 px-4 py-2 rounded-lg">Cancel</button>
          <button onClick={handleRename} disabled={!renameInput.trim()} className="bg-blue-600 px-4 py-2 rounded-lg disabled:opacity-70">Save</button>
        </div>
      </Modal>

      <Modal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, projectId: null, projectTitle: "" })} zIndexOverride={Z_INDEX_TOP + 30}>
        <h3 className="text-lg mb-4 font-semibold text-red-500">Delete Project</h3>
        <p className="mb-5">Are you sure you want to delete "<span className="font-bold">{deleteModal.projectTitle}</span>"? This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteModal({ open: false, projectId: null, projectTitle: "" })} className="bg-gray-700 px-4 py-2 rounded-lg">Cancel</button>
          <button onClick={handleDelete} className="bg-red-600 px-4 py-2 rounded-lg">Delete</button>
        </div>
      </Modal>

      <Modal open={shareModal.open} onClose={() => { setShareModal({ open: false, projectId: null, shareCode: "" }); setCopiedCode(false); }} zIndexOverride={Z_INDEX_TOP + 40}>
        <h3 className="text-lg mb-4 font-semibold">Share Project</h3>
        <p className="mb-2 text-gray-300">Share this code with others:</p>
        <div className="mb-4 flex items-center gap-2">
          <span className="bg-black/30 border border-white/20 px-3 py-2 rounded font-mono text-lg break-all">{shareModal.shareCode}</span>
          <button className="text-blue-400 hover:underline"
            onClick={async () => { await navigator.clipboard.writeText(shareModal.shareCode).catch(() => window.electronAPI?.clipboardWrite(shareModal.shareCode)); setCopiedCode(true); setTimeout(() => setCopiedCode(false), 1200); }}>
            {copiedCode ? <span className="text-green-400 font-semibold">Copied!</span> : "Copy"}
          </button>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => { setShareModal({ open: false, projectId: null, shareCode: "" }); setCopiedCode(false); }} className="bg-gray-700 px-4 py-2 rounded-lg">Close</button>
        </div>
      </Modal>

      <Modal open={joinModalOpen} onClose={() => setJoinModalOpen(false)} zIndexOverride={Z_INDEX_TOP + 50}>
        <h3 className="text-lg mb-4 font-semibold">Join Project</h3>
        <input type="text" placeholder="Enter share code" value={joinCode}
          onChange={e => setJoinCode(e.target.value)}
          className="w-full p-3 rounded-xl bg-black/30 border border-white/20 text-white placeholder-gray-400 mb-4" />
        <div className="flex gap-3 justify-end">
          <button onClick={() => setJoinModalOpen(false)} className="bg-gray-700 px-4 py-2 rounded-lg">Cancel</button>
          <button onClick={handleJoinProject} className="bg-blue-600 px-4 py-2 rounded-lg">Join</button>
        </div>
      </Modal>

      <Modal open={profileModal} onClose={() => setProfileModal(false)} zIndexOverride={Z_INDEX_TOP + 60}>
        <h3 className="text-lg mb-4 font-semibold">Edit Display Name</h3>
        <input type="text" placeholder="Enter your display name" value={profileNameInput}
          onChange={e => setProfileNameInput(e.target.value)}
          className="w-full p-3 rounded-xl bg-black/30 border border-white/20 text-white placeholder-gray-400 mb-4" />
        <div className="flex gap-3 justify-end">
          <button onClick={() => setProfileModal(false)} className="bg-gray-700 px-4 py-2 rounded-lg">Cancel</button>
          <button onClick={handleProfileSave} disabled={!profileNameInput.trim() || profileLoading} className="bg-blue-600 px-4 py-2 rounded-lg disabled:opacity-70">
            {profileLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectPage;