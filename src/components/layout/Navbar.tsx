"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ProfileSelect } from '@/components/profile';
import { IoMdMenu } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { FiHome, FiHeart, FiUsers, FiSun, FiMoon } from "react-icons/fi";
import { useProfile } from '@/context/zustand/useProfile';
import { useThemeStore } from '@/context/zustand/useThemeStore';


export function Navbar() {

  const { infoInstitutions } = useProfile();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <nav className='h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between backdrop-blur-md shadow-lg relative z-50 transition-all duration-300 dark:bg-black dark:border-b dark:border-white/10 bg-gray-100/80 border-b border-gray-200/50'>

      <div className="flex items-center justify-start">
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
                <span className="text-white font-bold text-lg">{infoInstitutions.institutions.nameInstitution}</span>
              </div>
            </div>
          )}
        </Link>
      </div>

      <div className='flex justify-center'>
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-sm dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border dark:border-white/20 bg-gray-100/80 hover:bg-gray-200/80 text-gray-800 border border-gray-300/50"
          >
            <FiHome className="w-4 h-4" />
            <span className="text-sm font-medium">Início3</span>
          </Link>

          <Link
            href="/social"
            className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-sm dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border dark:border-white/20 bg-gray-100/80 hover:bg-gray-200/80 text-gray-800 border border-gray-300/50"
          >
            <FiUsers className="w-4 h-4" />
            <span className="text-sm font-medium">Comunidade</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-sm dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border dark:border-white/20 bg-gray-100/80 hover:bg-gray-200/80 text-gray-800 border border-gray-300/50"
            aria-label="Alternar tema"
          >
            {isDarkMode ? (
              <FiSun className="w-4 h-4" />
            ) : (
              <FiMoon className="w-4 h-4" />
            )}
          </button>
        </div>
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
          className="p-2 rounded-full transition-all duration-300 backdrop-blur-sm dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border dark:border-white/20 bg-gray-100/80 hover:bg-gray-200/80 text-gray-800 border border-gray-300/50"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <IoCloseSharp size={24} className={isDarkMode ? "text-white" : "text-gray-800"} />
          ) : (
            <IoMdMenu size={24} className={isDarkMode ? "text-white" : "text-gray-800"} />
          )}
        </button>
      </div>


      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 backdrop-blur-md shadow-2xl z-40 dark:g-gray-800/90 dark:border-b dark:border-white/10 bg-gray-100/90 border-b border-gray-200/50">
          <div className="px-4 py-6">
            {/* Navigation buttons - Mobile */}
            <div className="space-y-3 mb-6">
              <Link
                href="/"
                className="flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-300 backdrop-blur-sm dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border dark:border-white/20 bg-gray-100/80 hover:bg-gray-200/80 text-gray-800 border border-gray-300/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiHome className="w-5 h-5" />
                <span className="text-base font-medium">Início</span>
              </Link>

              <Link
                href="/social"
                className="flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-300 backdrop-blur-sm dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border dark:border-white/20 bg-gray-100/80 hover:bg-gray-200/80 text-gray-800 border border-gray-300/50"
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
                className="flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-300 backdrop-blur-sm w-full text-left dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border dark:border-white/20 bg-gray-100/80 hover:bg-gray-200/80 text-gray-800 border border-gray-300/50"
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

            <div className={`pt-4 ? 'border-t border-white/20' : 'border-t border-gray-300/50'
              }`}>
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
