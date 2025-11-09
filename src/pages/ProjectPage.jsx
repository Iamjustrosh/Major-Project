import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuthStore } from "../store/useAuthStore";
import { FiPlus, FiEdit2, FiTrash2, FiShare2, FiLogOut, FiMoreVertical } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

// Custom Modal component for prompts and confirmations
function Modal({ open, onClose, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-[#151c2c] text-white rounded-xl shadow-xl p-8 w-80 relative">
                {children}
                <button
                    className="absolute top-2 right-2 text-lg text-gray-400 hover:text-gray-200"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ×
                </button>
            </div>
        </div>
    );
}

const ProjectPage = () => {
    const { user, signOut } = useAuthStore();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newProjectTitle, setNewProjectTitle] = useState("");
    const navigate = useNavigate();

    // Modal state
    const [renameModal, setRenameModal] = useState({ open: false, projectId: null, currentName: "" });
    const [renameInput, setRenameInput] = useState("");
    const [deleteModal, setDeleteModal] = useState({ open: false, projectId: null, projectTitle: "" });
    const [shareModal, setShareModal] = useState({ open: false, projectId: null });

    useEffect(() => {
        if (user === null) {
            navigate("/login", { replace: true });
        }
    }, [user, navigate]);

    // Fetch projects for logged-in user
    const fetchProjects = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from("projects")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) console.error(error);
        else setProjects(data || []);
    };

    useEffect(() => {
        fetchProjects();
    }, [user]);

    // Create new project
    const handleCreateProject = async () => {
        if (!newProjectTitle.trim()) return;
        setLoading(true);
        const { error } = await supabase.from("projects").insert([
            { user_id: user.id, title: newProjectTitle.trim() },
        ]);
        setLoading(false);
        if (!error) {
            setNewProjectTitle("");
            setCreateModalOpen(false);
            fetchProjects();
        } else {
            console.error(error);
        }
    };

    // Open rename modal
    const openRenameModal = (id, currentName) => {
        setRenameModal({ open: true, projectId: id, currentName });
        setRenameInput(currentName);
    };

    // Handle rename in modal
    const handleRename = async () => {
        const { projectId } = renameModal;
        const newName = renameInput.trim();
        if (!projectId || !newName) return;
        const { error } = await supabase
            .from("projects")
            .update({ title: newName })
            .eq("id", projectId);
        setRenameModal({ open: false, projectId: null, currentName: "" });
        setRenameInput("");
        if (!error) fetchProjects();
    };

    // Open delete modal
    const openDeleteModal = (id, projectTitle) => {
        setDeleteModal({ open: true, projectId: id, projectTitle });
    };

    // Handle delete in modal
    const handleDelete = async () => {
        const { projectId } = deleteModal;
        if (!projectId) return;
        const { error } = await supabase.from("projects").delete().eq("id", projectId);
        setDeleteModal({ open: false, projectId: null, projectTitle: "" });
        if (!error) fetchProjects();
    };

    // Open share modal (placeholder for future)
    const openShareModal = (id) => {
        setShareModal({ open: true, projectId: id });
    };

    // Close modals
    const closeRenameModal = () => {
        setRenameModal({ open: false, projectId: null, currentName: "" });
        setRenameInput("");
    };
    const closeDeleteModal = () => setDeleteModal({ open: false, projectId: null, projectTitle: "" });
    const closeShareModal = () => setShareModal({ open: false, projectId: null });
    const closeCreateModal = () => {
        setCreateModalOpen(false);
        setNewProjectTitle("");
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center p-8 relative overflow-hidden">
            {/* Glow Background */}
            <div className="bg-[#00496E] w-[500px] h-[500px] blur-[200px] rounded-full absolute bottom-0 translate-y-1/2" />

            {/* Top Bar */}
            <div className="w-full flex justify-between items-center mb-10">
                <h1 className="text-3xl font-semibold">My Projects</h1>

                <Menu as="div" className="relative inline-block text-left z-10">
                    <MenuButton className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 transition-all">
                        <FaUserCircle className="text-2xl" />
                        <span>{user?.user_metadata?.display_name || "User"}</span>
                    </MenuButton>
                    <MenuItems className="absolute right-0 mt-2 w-40 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg overflow-hidden">
                        <MenuItem>
                            {({ active }) => (
                                <button
                                    onClick={signOut}
                                    className={`w-full px-4 py-2 text-left flex items-center gap-2 ${active ? "bg-white/20" : ""}`}
                                >
                                    <FiLogOut /> Logout
                                </button>
                            )}
                        </MenuItem>
                    </MenuItems>
                </Menu>
            </div>

            {/* Create New Project Card Section */}
            <div className="w-full max-w-4xl mb-10">
                <h2 className="text-xl mb-4 font-medium">Create New Project</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div
                        className="flex flex-col items-center justify-center bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl cursor-pointer h-40 hover:bg-white/20 transition-all"
                        onClick={() => setCreateModalOpen(true)}
                        data-testid="create-project-card"
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
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((proj) => (
                            <div onClick={() => navigate(`/whiteboard/${proj.id}`)}
                                key={proj.id}
                                className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl p-5 flex flex-col justify-between hover:bg-white/20 transition-all"
                            >
                                <div className="cursor-pointer">
                                    <h3 className="text-lg font-semibold">{proj.title}</h3>
                                    <p className="text-gray-400 text-sm mt-1">
                                        {new Date(proj.created_at).toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 mt-4">
                                    <Menu as="div" className="relative inline-block text-left">
                                        <MenuButton className="flex items-center justify-center w-8 h-8 hover:bg-white/10 rounded-full transition" title="More">
                                            <FiMoreVertical />
                                        </MenuButton>
                                        <MenuItems className="absolute right-0 z-10 mt-2 w-32 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg  overflow-hidden">
                                            <MenuItem className="flex items-center">
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => openRenameModal(proj.id, proj.title)}
                                                        className={`w-full px-4 py-2 text-left flex items-center gap-2 ${active ? "bg-white/20" : ""}`}
                                                    >
                                                        <FiEdit2 /> Edit
                                                    </button>
                                                )}
                                            </MenuItem>
                                            <MenuItem className="flex items-center">
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => openShareModal(proj.id)}
                                                        className={`w-full px-4 py-2 text-left flex items-center gap-2 ${active ? "bg-white/20" : ""}`}
                                                    >
                                                        <FiShare2 /> Share
                                                    </button>
                                                )}
                                            </MenuItem>
                                            <MenuItem className="flex items-center">
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => openDeleteModal(proj.id, proj.title)}
                                                        className={`w-full px-4 py-2 text-left flex items-center gap-2 ${active ? "bg-white/20 text-red-500" : "text-white"}`}
                                                    >
                                                        <FiTrash2 /> Delete
                                                    </button>
                                                )}
                                            </MenuItem>
                                        </MenuItems>
                                    </Menu>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Project Modal */}
            <Modal open={createModalOpen} onClose={closeCreateModal}>
                <h3 className="text-lg mb-4 font-semibold">Create New Project</h3>
                <input
                    type="text"
                    placeholder="Enter project title"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    className="w-full p-3 rounded-xl bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    autoFocus
                />
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={closeCreateModal}
                        className="text-gray-300 hover:text-gray-100 px-4 py-2 rounded-lg bg-gray-700/40"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateProject}
                        disabled={loading || !newProjectTitle.trim()}
                        className={`bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium flex items-center`}
                    >
                        <FiPlus /> {loading ? "Creating..." : "Create"}
                    </button>
                </div>
            </Modal>

            {/* Rename Modal */}
            <Modal open={renameModal.open} onClose={closeRenameModal}>
                <h3 className="text-lg mb-4 font-semibold">Rename Project</h3>
                <input
                    type="text"
                    className="w-full p-3 rounded-xl bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    placeholder="Enter new project name"
                    value={renameInput}
                    onChange={(e) => setRenameInput(e.target.value)}
                    autoFocus
                />
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={closeRenameModal}
                        className="text-gray-300 hover:text-gray-100 px-4 py-2 rounded-lg bg-gray-700/40"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleRename}
                        className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium"
                        disabled={!renameInput.trim()}
                    >
                        Save
                    </button>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal open={deleteModal.open} onClose={closeDeleteModal}>
                <h3 className="text-lg mb-4 font-semibold text-red-400">Delete Project</h3>
                <p>Are you sure you want to delete <span className="font-bold">{deleteModal.projectTitle}</span>?</p>
                <div className="flex gap-3 justify-end mt-5">
                    <button
                        onClick={closeDeleteModal}
                        className="text-gray-300 hover:text-gray-100 px-4 py-2 rounded-lg bg-gray-700/40"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-medium"
                    >
                        Delete
                    </button>
                </div>
            </Modal>

            {/* Share Modal (placeholder) */}
            <Modal open={shareModal.open} onClose={closeShareModal}>
                <h3 className="text-lg mb-4 font-semibold">Share Project</h3>
                <p className="mb-4">Sharing feature coming soon for project ID: <span className="font-mono">{shareModal.projectId}</span></p>
                <div className="flex justify-end">
                    <button
                        onClick={closeShareModal}
                        className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium"
                    >
                        Close
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default ProjectPage;
