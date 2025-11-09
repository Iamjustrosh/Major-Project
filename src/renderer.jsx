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
import Whiteboard from "./pages/Whiteboard";

function Protected({ children }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
const App = () => {
  const init = useAuthStore((s) => s.init);


  useEffect(() => {
    init();
  }, [init]);

  return (

    <Router>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/projects" element={<ProjectPage />} />
        <Route path="/whiteboard/:projectId" element={<Whiteboard />} />
      </Routes>
    </Router>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);