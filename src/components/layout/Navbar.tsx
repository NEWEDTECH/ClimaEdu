"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ProfileSelect } from '@/components/profile';
import { IoMdMenu } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { FiHome, FiHeart, FiUsers, FiSun, FiMoon } from "react-icons/fi";
import { useProfile } from '@/context/zustand/useProfile';


export function Navbar() {

  const { infoInstitutions } = useProfile();

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Aqui você pode adicionar a lógica para alternar o tema globalmente
    // Por exemplo, usando um contexto de tema ou localStorage
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  return (
    <nav className="h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-md border-b border-white/10 shadow-lg relative z-50">

      <div className="flex items-center">
        <Link href="/" className="flex items-center space-x-3 group">
          {infoInstitutions?.institutions?.urlImage ? (
            <img
              className='h-12 w-auto transition-transform duration-300 group-hover:scale-105'
              src={infoInstitutions.institutions.urlImage}
              alt="Logo da instituição"
            />
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ClimaEdu
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation buttons - Desktop */}
      <div className="hidden md:flex items-center gap-2">
        <Link 
          href="/" 
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20"
        >
          <FiHome className="w-4 h-4" />
          <span className="text-sm font-medium">Início</span>
        </Link>
        
        <button 
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white/50 transition-all duration-300 backdrop-blur-sm border border-white/10 cursor-not-allowed"
          disabled
        >
          <FiHeart className="w-4 h-4" />
          <span className="text-sm font-medium">Favoritos</span>
        </button>
        
        <Link 
          href="/social" 
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20"
        >
          <FiUsers className="w-4 h-4" />
          <span className="text-sm font-medium">Comunidade</span>
        </Link>
        
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20"
          aria-label="Alternar tema"
        >
          {isDarkMode ? (
            <FiSun className="w-4 h-4" />
          ) : (
            <FiMoon className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className='flex items-center justify-end'>

        <div className="hidden md:flex items-center gap-4">
          <ProfileSelect
            onLogout={() => console.log('Logout clicked')}
          />
        </div>

      </div>

      <div className="md:hidden flex items-center">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 backdrop-blur-sm border border-white/20"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <IoCloseSharp size={24} className="text-white" />
          ) : (
            <IoMdMenu size={24} className="text-white" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-gradient-to-b from-slate-900/98 via-purple-900/98 to-slate-900/98 backdrop-blur-md border-b border-white/10 shadow-2xl z-40">
          <div className="px-4 py-6">
            {/* Navigation buttons - Mobile */}
            <div className="space-y-3 mb-6">
              <Link 
                href="/" 
                className="flex items-center gap-4 px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 backdrop-blur-sm border border-white/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiHome className="w-5 h-5" />
                <span className="text-base font-medium">Início</span>
              </Link>
              
              <button 
                className="flex items-center gap-4 px-4 py-3 rounded-full bg-white/5 text-white/50 transition-all duration-300 backdrop-blur-sm border border-white/10 w-full text-left cursor-not-allowed"
                disabled
              >
                <FiHeart className="w-5 h-5" />
                <span className="text-base font-medium">Favoritos</span>
              </button>
              
              <Link 
                href="/social" 
                className="flex items-center gap-4 px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 backdrop-blur-sm border border-white/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiUsers className="w-5 h-5" />
                <span className="text-base font-medium">Comunidade</span>
              </Link>
              
              <button 
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-4 px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 backdrop-blur-sm border border-white/20 w-full text-left"
              >
                {isDarkMode ? (
                  <>
                    <FiSun className="w-5 h-5" />
                    <span className="text-base font-medium">Tema Claro</span>
                  </>
                ) : (
                  <>
                    <FiMoon className="w-5 h-5" />
                    <span className="text-base font-medium">Tema Escuro</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="border-t border-white/20 pt-4">
              <ProfileSelect
                onLogout={() => console.log('Logout clicked')}
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
