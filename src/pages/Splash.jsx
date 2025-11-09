import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.webp';

const Splash = () => {
  const navigate = useNavigate();
  const splashRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (splashRef.current) {
        splashRef.current.classList.add('fade-out');
        setTimeout(() => {
          navigate('/homepage');
        }, 500); // match fade-out duration
      }
    }, 2000); // Show splash for 2 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  // Add fade-in for initial render if desired
  // CSS for fade-in/out: see comment below

  return (
    <div
      ref={splashRef}
      className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden transition-opacity duration-500 opacity-100"
      style={{
        // fallback style for fade effect, can be overridden by classes below
        transition: 'opacity 0.5s',
      }}
    >
      <img src={logo} alt="App Logo" className="w-40 h-40" />
      <div className='bg-[#00496E] lg:w-200 lg:h-200 w-100 h-100 blur-[100px] rounded-full absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 '> </div>
      <div className='bg-[#00496E] lg:w-200 lg:h-200 w-96 h-96 blur-3xl rounded-full absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 '> </div>
      <style>
        {`
          .fade-out {
            opacity: 0 !important;
            transition: opacity 0.5s;
          }
        `}
      </style>
    </div>  
  );
};

export default Splash;
