import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Splash from "./pages/Splash";
import { createRoot } from "react-dom/client";
import "./index.css";
import Homepage from "./pages/Homepage";
import LoginPage from "./pages/LoginPage";
import { useAuthStore } from './store/useAuthStore';
import { useEffect } from "react";
import Signup from "./pages/Signup";
import ProjectPage from "./pages/ProjectPage";
import Whiteboard_TldrawSync from "./pages/Whiteboard_TldrawSync";
import JoinRoom from "./pages/JoinRoom";

// ✅ Blocks access to protected pages until session is restored
function Protected({ children }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  // Still checking localStorage for saved session — show nothing
  if (loading) return <LoadingScreen />;

  // No session found — redirect to login
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

// ✅ Redirect to /projects if user is already logged in
function AuthRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/projects" replace />;

  return children;
}

// ✅ Full-screen loading spinner shown while restoring session
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-white/20 border-t-[#018FCC] rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Restoring session...</p>
    </div>
  );
}

const App = () => {
  const init = useAuthStore((s) => s.init);

  // ✅ Runs once on app launch — restores session from localStorage
  useEffect(() => {
    init();
  }, [init]);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Splash />} />
        <Route path="/homepage" element={<Homepage />} />

        {/* Auth routes — redirect to /projects if already logged in */}
        <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />
        <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />

        {/* Protected routes — redirect to /login if not authenticated */}
        <Route path="/projects" element={<Protected><ProjectPage /></Protected>} />
        <Route path="/Whiteboard_TldrawSync/:projectId" element={<Protected><Whiteboard_TldrawSync /></Protected>} />
        <Route path="/join/:shareCode" element={<Protected><JoinRoom /></Protected>} />
      </Routes>
    </Router>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);