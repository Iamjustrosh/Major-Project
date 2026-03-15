import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { FiDownload, FiLogIn, FiUserPlus, FiChevronDown } from 'react-icons/fi'

export default function GuestBanner({ onExportPNG, onExportJSON, isExporting }) {
  const navigate = useNavigate()
  const exitGuestMode = useAuthStore((s) => s.exitGuestMode)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)

  const handleLogin = () => {
    exitGuestMode()
    navigate('/login')
  }

  const handleSignup = () => {
    exitGuestMode()
    navigate('/signup')
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-950 border-b border-white/10 z-50 shrink-0">
      
      {/* Left — guest identity */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-700 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
          G
        </div>
        <div>
          <p className="text-white text-sm font-medium leading-none">Guest Mode</p>
          <p className="text-gray-500 text-xs mt-0.5">Work is saved locally only</p>
        </div>
      </div>

      {/* Center — upgrade nudge */}
      <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
        <span className="text-blue-300 text-xs">
          🔒 Sign up to get real-time collaboration, cloud save & sharing
        </span>
      </div>

      {/* Right — export + auth actions */}
      <div className="flex items-center gap-2">



        {/* Auth buttons */}
        <button
          onClick={handleLogin}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white text-sm transition"
        >
          <FiLogIn size={14} />
          Log In
        </button>

        <button
          onClick={handleSignup}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#018FCC] hover:bg-[#0178b0] rounded-lg text-white text-sm font-medium transition"
        >
          <FiUserPlus size={14} />
          Sign Up Free
        </button>
      </div>
    </div>
  )
}