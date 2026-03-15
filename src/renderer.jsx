import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Splash from "./pages/Splash";
import { createRoot } from "react-dom/client";
import "./index.css";
import Homepage from "./pages/Homepage";
import LoginPage from "./pages/LoginPage";
import { useAuthStore } from './store/useAuthStore';
import { useEffect, useState, useCallback } from "react";
import Signup from "./pages/Signup";
import ProjectPage from "./pages/ProjectPage";
import Whiteboard_TldrawSync from "./pages/Whiteboard_TldrawSync";
import JoinRoom from "./pages/JoinRoom";
import GuestWhiteboard from "./pages/GuestWhiteboard";
import MeetingModal from "./components/meeting/MeetingModal";

// ── Route guards ──────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-white/20 border-t-[#018FCC] rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Restoring session...</p>
    </div>
  );
}

function Protected({ children }) {
  const user    = useAuthStore(s => s.user);
  const loading = useAuthStore(s => s.loading);
  if (loading) return <LoadingScreen />;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
}

function AuthRoute({ children }) {
  const user    = useAuthStore(s => s.user);
  const loading = useAuthStore(s => s.loading);
  if (loading) return <LoadingScreen />;
  if (user)    return <Navigate to="/projects" replace />;
  return children;
}

function GuestRoute({ children }) {
  const isGuest = useAuthStore(s => s.isGuest);
  const loading = useAuthStore(s => s.loading);
  if (loading)  return <LoadingScreen />;
  if (!isGuest) return <Navigate to="/homepage" replace />;
  return children;
}

// ── App root ──────────────────────────────────────────────────
const App = () => {
  const init = useAuthStore(s => s.init);

  // ✅ Global meeting state — lives at root so it NEVER unmounts on navigation
  const [meetingState, setMeetingState] = useState({
    open: false,
    projectId: null,
    projectTitle: "",
    mode: "host",
  });

  // ✅ Global function to open meeting — passed down via context or window
  // Using window so ProjectPage + Whiteboard can both call it without prop drilling
  useEffect(() => {
    window.openMeeting = (projectId, projectTitle, mode = "host") => {
      setMeetingState({ open: true, projectId, projectTitle, mode });
    };
    window.closeMeeting = () => {
      setMeetingState(s => ({ ...s, open: false }));
    };
    return () => {
      delete window.openMeeting;
      delete window.closeMeeting;
    };
  }, []);

  useEffect(() => {
    init();
    return () => useAuthStore.getState().destroy?.();
  }, [init]);

  const closeMeeting = useCallback(() => {
    setMeetingState(s => ({ ...s, open: false }));
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Splash />} />
        <Route path="/homepage" element={<Homepage />} />

        {/* Auth routes */}
        <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />
        <Route path="/login"  element={<AuthRoute><LoginPage /></AuthRoute>} />

        {/* Guest */}
        <Route path="/guest" element={<GuestRoute><GuestWhiteboard /></GuestRoute>} />

        {/* Protected */}
        <Route path="/projects"                         element={<Protected><ProjectPage /></Protected>} />
        <Route path="/Whiteboard_TldrawSync/:projectId" element={<Protected><Whiteboard_TldrawSync /></Protected>} />
        <Route path="/join/:shareCode"                  element={<Protected><JoinRoom /></Protected>} />
      </Routes>

      {/* ✅ MeetingModal at ROOT level — persists across ALL route changes */}
      {/* It's outside <Routes> so navigating never unmounts it */}
      <MeetingModal
        isOpen={meetingState.open}
        onClose={closeMeeting}
        projectId={meetingState.projectId}
        projectTitle={meetingState.projectTitle}
        mode={meetingState.mode}
      />
    </Router>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);