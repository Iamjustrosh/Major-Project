import React from 'react'
import { useNavigate } from 'react-router-dom'

const Homepage = () => {
    const navigate = useNavigate()
    const handleStart =()=>{
        navigate("/login")
    }
    return (
        <div>
            <div className="relative gap-3 min-h-screen flex flex-col items-center justify-center overflow-hidden">
                <div className='bg-[#00496E] lg:w-200 lg:h-200 w-100 h-100 blur-[100px] rounded-full absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 '> </div>
                <div className='bg-[#00496E] lg:w-200 lg:h-200 w-96 h-96 blur-3xl rounded-full absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 '> </div>
                <h1 className='text-white font-bold text-6xl'>COLLAB BOARD</h1>
                <div className='text-3xl font-light leading-tight'>RealTime Collaborative Whiteboard and Code Editor</div>
                <div className='text-2xl bg-[#018FCC] py-2 px-6 rounded-full' onClick={handleStart}><button>Get Started</button></div>
            </div>
        </div>
    )
}

export default Homepage