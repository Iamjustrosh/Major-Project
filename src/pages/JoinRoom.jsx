import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function JoinRoom() {
  const { shareCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const joinProject = async () => {
      const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("share_code", shareCode)
        .single();

      if (error || !project) {
        alert("Invalid or expired share link!");
        navigate("/projects");
      } else {
        navigate(`/whiteboard/${project.id}`);
      }

      setLoading(false);
    };

    joinProject();
  }, [shareCode, navigate]);

  if (loading) return <p className="text-white">Joining project...</p>;
  return null;
}
